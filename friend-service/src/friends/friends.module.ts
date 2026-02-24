import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { Friend } from './entities/friend.entity';
import { FriendRequest } from './entities/friend-request.entity';
import { Block } from './entities/block.entity';
import { UsersModule } from '../users/users.module';

// import { FriendsGateway } from './friends.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Friend, FriendRequest, Block]),
    UsersModule,
  ],
  controllers: [FriendsController],
  providers: [FriendsService],
})
export class FriendsModule {}
