import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlockedUserService } from './blockedUser.service';


@Controller('chat/blockeduser')
export class UserController {

    constructor(
        private readonly prisma: PrismaService,
        private readonly blockedUserService: BlockedUserService
      ) {}

    @Get('/IDs/:token')
    async getBlockedUserIDs(@Param('token') token: string) {
      return this.blockedUserService.getBlockedUserIDsByWebsocketID(token) //change to token later
    }

    @Post('/:token/:action')
    async blockUnblock(@Param('token') token: string, @Param('action') action: ('block' | 'unblock'), @Body() body: { userID: number}) {
      this.blockedUserService.blockUnblock(body.userID, token, action)
    }
}
