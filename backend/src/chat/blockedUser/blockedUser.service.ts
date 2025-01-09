import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { ChatGateway } from '../chat.gateway';
import { LoginService } from 'src/authentication/login/login.service';
import { ErrorHandlingService } from 'src/error-handling/error-handling.service';

@Injectable()
export class BlockedUserService {
  constructor(
    private prisma: PrismaService,
    private readonly loginService: LoginService,
    private readonly chatGateway: ChatGateway,
    private readonly errorHandlingservice: ErrorHandlingService,
  ) {}

  async getBlockedUserIDsByToken(token: string): Promise<number[]> {
    try {
      const userID = await this.loginService.getUserIDFromCache(token);
      const user = await this.prisma.user.findUnique({
        where: { ID: userID },
        select: { blockedUsers: { select: { blockedID: true } } },
      });
      if (!user) throw new NotFoundException('User not found');
      return user.blockedUsers.map((blockedUser) => {
        return blockedUser.blockedID;
      });
    } catch (error) {
      this.errorHandlingservice.throwHttpException(error);
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
      this.errorHandlingservice.throwHttpException(error);
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
        throw new NotFoundException('Blocked user not found');
      await this.prisma.blockedUser.delete({
        where: {
          ID: blockedUser.ID,
        },
      });
    } catch (error) {
      this.errorHandlingservice.throwHttpException(error);
    }
  }

  async blockUnblock(targetUserID: number, token: string, action: 'block' | 'unblock'): Promise<void> {
    const userID = await this.loginService.getUserIDFromCache(token);
    if (action === 'block') await this.block(targetUserID, userID);
    else await this.unblock(targetUserID, userID);
    const socket = await this.chatGateway.getWebSocketByUserID(userID);
    if (socket && socket.connected) this.chatGateway.emitToSocket('reloadMessages', socket)
  }
}
