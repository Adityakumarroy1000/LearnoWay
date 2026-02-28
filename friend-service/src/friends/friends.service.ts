import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friend } from './entities/friend.entity';
import { FriendRequest } from './entities/friend-request.entity';
import { Block } from './entities/block.entity';

@Injectable()
export class FriendsService {
  // getReceivedRequests(userId: any) {
  //   throw new Error('Method not implemented.');
  // }
  // getSentRequests(userId: any) {
  //   throw new Error('Method not implemented.');
  // }
  constructor(
    @InjectRepository(Friend)
    private friendRepo: Repository<Friend>,

    @InjectRepository(FriendRequest)
    private requestRepo: Repository<FriendRequest>,

    @InjectRepository(Block)
    private blockRepo: Repository<Block>,
  ) {}

  private async isBlockedEitherWay(userA: string, userB: string) {
    return this.blockRepo.findOne({
      where: [
        { blockerId: userA, blockedId: userB },
        { blockerId: userB, blockedId: userA },
      ],
    });
  }

  // 1. Send friend request
  async sendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new BadRequestException('Cannot add yourself');
    }

    const blockedRelation = await this.isBlockedEitherWay(senderId, receiverId);
    if (blockedRelation) {
      throw new BadRequestException('Request blocked due to privacy settings');
    }

    // already friends
    const alreadyFriends = await this.friendRepo.findOne({
      where: { userId: senderId, friendId: receiverId },
    });

    if (alreadyFriends) {
      throw new BadRequestException('Already friends');
    }

    // check pending request ONLY
    const pending = await this.requestRepo.findOne({
      where: {
        senderId,
        receiverId,
        status: 'pending',
      },
    });

    if (pending) {
      throw new BadRequestException('Request already sent');
    }

    // 🔥 delete old rejected or stale requests
    await this.requestRepo.delete({
      senderId,
      receiverId,
    });

    await this.requestRepo.delete({
      senderId: receiverId,
      receiverId: senderId,
    });

    // create fresh request
    return this.requestRepo.save({
      senderId,
      receiverId,
      status: 'pending',
    });
  }

  // 2. Accept request
  async acceptRequest(requestId: string, currentUserId: string) {
    const request = await this.requestRepo.findOneBy({ id: requestId });

    if (!request) {
      throw new BadRequestException('Request not found');
    }

    if (request.receiverId !== currentUserId) {
      throw new BadRequestException('Not authorized');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Already processed');
    }

    await this.friendRepo.save([
      { userId: request.senderId, friendId: request.receiverId },
      { userId: request.receiverId, friendId: request.senderId },
    ]);

    await this.requestRepo.delete(requestId);

    return { message: 'Friend request accepted' };
  }

  // 3. Reject request
  async rejectRequest(requestId: string) {
    return this.requestRepo.update(requestId, { status: 'rejected' });
  }

  // 4. Friend list
  async friendList(userId: string) {
    return this.friendRepo.find({ where: { userId } });
  }

  // 5. Mutual friends
  async mutualFriends(userA: string, userB: string) {
    const friendsA = await this.friendRepo.find({ where: { userId: userA } });
    const friendsB = await this.friendRepo.find({ where: { userId: userB } });

    const setB = new Set(friendsB.map((f) => f.friendId));
    return friendsA.filter((f) => setB.has(f.friendId));
  }

  async unfriend(userId: string, friendId: string) {
    await this.friendRepo.delete([
      { userId, friendId },
      { userId: friendId, friendId: userId },
    ]);

    // 🔥 HARD RESET all old requests between them
    await this.requestRepo.delete({
      senderId: userId,
      receiverId: friendId,
    });

    await this.requestRepo.delete({
      senderId: friendId,
      receiverId: userId,
    });

    return { message: 'Unfriended successfully' };
  }

  async blockUser(blockerId: string, blockedId: string) {
    if (!blockedId) throw new BadRequestException('blockedId required');
    if (blockerId === blockedId) {
      throw new BadRequestException('Cannot block yourself');
    }

    const existing = await this.blockRepo.findOne({
      where: { blockerId, blockedId },
    });
    if (existing) return { message: 'User already blocked' };

    await this.unfriend(blockerId, blockedId);
    await this.requestRepo.delete([
      { senderId: blockerId, receiverId: blockedId },
      { senderId: blockedId, receiverId: blockerId },
    ]);

    await this.blockRepo.save({ blockerId, blockedId });
    return { message: 'User blocked successfully' };
  }

  async unblockUser(blockerId: string, blockedId: string) {
    if (!blockedId) throw new BadRequestException('blockedId required');
    await this.blockRepo.delete({ blockerId, blockedId });
    return { message: 'User unblocked successfully' };
  }

  async getBlockedUsers(blockerId: string) {
    return this.blockRepo.find({ where: { blockerId } });
  }

  // 🔹 SENT REQUESTS
  async getSentRequests(userId: string) {
    return this.requestRepo.find({
      where: {
        senderId: userId,
        status: 'pending',
      },
    });
  }

  // 🔹 RECEIVED REQUESTS
  async getReceivedRequests(userId: string) {
    return this.requestRepo.find({
      where: {
        receiverId: userId,
        status: 'pending',
      },
    });
  }
}
