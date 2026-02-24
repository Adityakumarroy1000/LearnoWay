import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('friends')
@UseGuards(JwtAuthGuard) // 🔐 protect all routes
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  // ✅ SEND REQUEST
  @Post('request')
  sendRequest(@Req() req, @Body('receiverId') receiverId: string) {
    const senderId = req?.user?.userId;
    if (!senderId) throw new UnauthorizedException('Missing user in token');
    return this.friendsService.sendRequest(String(senderId), String(receiverId));
  }

  // ✅ ACCEPT REQUEST
  @Post('accept')
  accept(@Req() req, @Body('requestId') requestId: string) {
    const currentUserId = req?.user?.userId;
    if (!currentUserId) throw new UnauthorizedException('Missing user in token');
    if (!requestId) throw new BadRequestException('requestId required');
    return this.friendsService.acceptRequest(String(requestId), String(currentUserId));
  }

  // ✅ REJECT REQUEST
  @Post('reject')
  reject(@Body('requestId') requestId: string) {
    if (!requestId) throw new BadRequestException('requestId required');
    return this.friendsService.rejectRequest(String(requestId));
  }

  // ✅ FRIEND LIST
  @Get('list')
  list(@Req() req) {
    return this.friendsService.friendList(req.user.userId);
  }

  // ✅ MUTUAL FRIENDS
  @Get('mutual/:id')
  mutual(@Req() req, @Param('id') otherUserId: string) {
    return this.friendsService.mutualFriends(req.user.userId, otherUserId);
  }

  @Post('unfriend')
  unfriend(@Req() req, @Body('friendId') friendId: string) {
    return this.friendsService.unfriend(req.user.userId, friendId);
  }

  // ✅ SENT REQUESTS (PENDING)
  @Get('sent')
  getSentRequests(@Req() req) {
    return this.friendsService.getSentRequests(req.user.userId);
  }

  // ✅ RECEIVED REQUESTS (PENDING)
  @Get('received')
  getReceivedRequests(@Req() req) {
    return this.friendsService.getReceivedRequests(req.user.userId);
  }
}
