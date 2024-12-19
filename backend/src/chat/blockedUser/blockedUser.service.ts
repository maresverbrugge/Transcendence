import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { UserService } from './user.service';
import { ChatGateway } from '../chat.gateway';
import { HttpException } from '@nestjs/common';

@Injectable()
export class BlockedUserService {
  constructor(
    private prisma: PrismaService,
    private readonly userService: UserService,
    private readonly chatGateway: ChatGateway,
  ) {}

  async getBlockedUserIDsByWebsocketID(socketID: string): Promise<number[]> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { websocketID: socketID },
        select: { blockedUsers: { select: { blockedID: true } } },
      });
      if (!user) throw new NotFoundException('User not found');
      return user.blockedUsers.map((blockedUser) => {
        return blockedUser.blockedID;
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error accurred', error.message);
    }
  }

  async block(targetUserID: number, userID: number): Promise<void> {
    try {
      await this.prisma.blockedUser.create({
        data: {
          blocker: { connect: { ID: userID } },
          blocked: { connect: { ID: targetUserID } },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to block user', error.message);
    }
  }

  async unblock(targetUserID: number, userID: number): Promise<void> {
    try {
      const blockedUser = await this.prisma.blockedUser.findFirst({
        where: {
          blockerID: userID,
          blockedID: targetUserID,
        },
        select: { ID: true },
      });
      if (!blockedUser)
        throw new NotFoundException('Blocked user not found')
      await this.prisma.blockedUser.delete({
        where: {
          ID: blockedUser.ID,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to unblock user', error.message);
    }
  }

  async blockUnblock(targetUserID: number, token: string, action: 'block' | 'unblock'): Promise<void> {
    const userID = await this.userService.getUserIDBySocketID(token); //change to token later
    if (action === 'block') await this.block(targetUserID, userID);
    else await this.unblock(targetUserID, userID);
    const socket = await this.chatGateway.getWebSocketByUserID(userID);
    if (socket) this.chatGateway.emitToSocket('reloadMessages', socket)
  }
}
