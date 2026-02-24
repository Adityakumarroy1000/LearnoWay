import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Friend } from '../friends/entities/friend.entity';
import { FriendRequest } from '../friends/entities/friend-request.entity';
import { Block } from '../friends/entities/block.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Friend)
    private readonly friendRepo: Repository<Friend>,
    @InjectRepository(FriendRequest)
    private readonly requestRepo: Repository<FriendRequest>,
    @InjectRepository(Block)
    private readonly blockRepo: Repository<Block>,
  ) {}

  async syncUser(user: {
    userId: number;
    email: string;
    fullName: string;
    username: string;
    avatar?: string;
  }) {
    const exists = await this.userRepo.findOne({
      where: { djangoUserId: user.userId },
    });

    if (exists) {
      // 🔁 keep profile in sync — only update fields that are defined
      const updateData: Partial<User> = {};
      if (user.fullName !== undefined && user.fullName !== null) updateData.fullName = user.fullName;
      if (user.username !== undefined && user.username !== null) updateData.username = user.username;
      if (user.avatar !== undefined) updateData.avatar = user.avatar;

      if (Object.keys(updateData).length > 0) {
        await this.userRepo.update(exists.id, updateData);
      }

      return this.userRepo.findOne({ where: { id: exists.id } });
    }

    const newUser = this.userRepo.create({
      djangoUserId: user.userId,
      email: user.email,
      fullName: user.fullName,
      username: user.username,
      avatar: user.avatar,
    });

    return this.userRepo.save(newUser);
  }

  async findAll() {
    return this.userRepo.find();
  }

  async deleteUserAndRelations(djangoUserId: number) {
    const userId = String(djangoUserId);

    await this.friendRepo.delete([
      { userId },
      { friendId: userId },
    ]);

    await this.requestRepo.delete([
      { senderId: userId },
      { receiverId: userId },
    ]);

    await this.blockRepo.delete([
      { blockerId: userId },
      { blockedId: userId },
    ]);

    await this.userRepo.delete({ djangoUserId });

    return { message: 'User social data deleted successfully' };
  }

  async pruneOrphanUsers(validUserIds: number[]) {
    const validSet = new Set(
      (validUserIds || [])
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id)),
    );

    const allUsers = await this.userRepo.find({ select: ['djangoUserId'] });

    let deletedCount = 0;
    for (const user of allUsers) {
      if (!validSet.has(Number(user.djangoUserId))) {
        await this.deleteUserAndRelations(Number(user.djangoUserId));
        deletedCount += 1;
      }
    }

    return {
      message: 'Orphan buddy profiles removed successfully',
      deletedCount,
    };
  }
}
