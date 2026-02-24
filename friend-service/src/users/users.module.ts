import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { Friend } from '../friends/entities/friend.entity';
import { FriendRequest } from '../friends/entities/friend-request.entity';
import { Block } from '../friends/entities/block.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Friend, FriendRequest, Block])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
