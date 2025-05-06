import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { BlockedUserService } from './blockedUser.service';

@Controller('chat/blockeduser')
export class UserController {
  constructor(private readonly blockedUserService: BlockedUserService) {}

  @Get('/IDs/:token')
  async getBlockedUserIDs(@Param('token') token: string): Promise<number[]> {
    return this.blockedUserService.getBlockedUserIDsByToken(token);
  }

  @Post('/:token/:action')
  async blockUnblock(
    @Param('token') token: string,
    @Param('action') action: 'block' | 'unblock',
    @Body() body: { userID: number }
  ): Promise<void> {
    this.blockedUserService.blockUnblock(body.userID, token, action);
  }
}
