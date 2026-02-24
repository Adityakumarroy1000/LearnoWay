import {
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  Body,
  Delete,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 🔥 CALLED AFTER LOGIN
  @Post('sync')
  @UseGuards(JwtAuthGuard)
  async sync(@Req() req, @Body() body: any) {
    // merge JWT payload with explicit body so we don't lose required fields
    // (e.g. userId/username come from JWT, while avatar/fullName may come from body)
    const payload = { ...(req.user || {}), ...(body || {}) };
    return this.usersService.syncUser(payload);
  }

  // 🔥 USED BY BUDDY FINDER
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async deleteMe(@Req() req) {
    const userId = req?.user?.userId;
    if (!userId) throw new UnauthorizedException('Missing user in token');
    return this.usersService.deleteUserAndRelations(Number(userId));
  }

  @Post('prune-orphans')
  @UseGuards(JwtAuthGuard)
  async pruneOrphans(@Req() req, @Body('validUserIds') validUserIds: number[]) {
    const userId = req?.user?.userId;
    if (!userId) throw new UnauthorizedException('Missing user in token');
    return this.usersService.pruneOrphanUsers(validUserIds || []);
  }
}
