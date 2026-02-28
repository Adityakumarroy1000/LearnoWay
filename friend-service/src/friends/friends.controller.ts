import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FriendsService } from './friends.service';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('request')
  sendRequest(@Req() req, @Body('receiverId') receiverId: string) {
    const senderId = req?.user?.userId;
    if (!senderId) throw new UnauthorizedException('Missing user in token');
    return this.friendsService.sendRequest(String(senderId), String(receiverId));
  }

  @Post('accept')
  accept(@Req() req, @Body('requestId') requestId: string) {
    const currentUserId = req?.user?.userId;
    if (!currentUserId) throw new UnauthorizedException('Missing user in token');
    if (!requestId) throw new BadRequestException('requestId required');
    return this.friendsService.acceptRequest(String(requestId), String(currentUserId));
  }

  @Post('reject')
  reject(@Body('requestId') requestId: string) {
    if (!requestId) throw new BadRequestException('requestId required');
    return this.friendsService.rejectRequest(String(requestId));
  }

  @Get('list')
  list(@Req() req) {
    return this.friendsService.friendList(req.user.userId);
  }

  @Get('mutual/:id')
  mutual(@Req() req, @Param('id') otherUserId: string) {
    return this.friendsService.mutualFriends(req.user.userId, otherUserId);
  }

  @Post('unfriend')
  unfriend(@Req() req, @Body('friendId') friendId: string) {
    return this.friendsService.unfriend(req.user.userId, friendId);
  }

  @Post('block')
  block(@Req() req, @Body('blockedId') blockedId: string) {
    return this.friendsService.blockUser(req.user.userId, blockedId);
  }

  @Post('unblock')
  unblock(@Req() req, @Body('blockedId') blockedId: string) {
    return this.friendsService.unblockUser(req.user.userId, blockedId);
  }

  @Get('blocked')
  blocked(@Req() req) {
    return this.friendsService.getBlockedUsers(req.user.userId);
  }

  @Get('sent')
  getSentRequests(@Req() req) {
    return this.friendsService.getSentRequests(req.user.userId);
  }

  @Get('received')
  getReceivedRequests(@Req() req) {
    return this.friendsService.getReceivedRequests(req.user.userId);
  }
}
