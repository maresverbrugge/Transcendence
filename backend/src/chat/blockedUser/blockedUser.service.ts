import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from './user.service';

@Injectable()
export class BlockedUserService {

    constructor(
        private prisma: PrismaService,
        private readonly userService: UserService
    ) {}

    async getBlockedUserIDsByWebsocketID(socketID: string) : Promise<number[]> {
        const user = await this.prisma.user.findUnique({
          where: {
            websocketID: socketID,
          },
          select: {
            blockedUsers: {
              select: {
                blockedID: true,
              }
            },
          }
        });
        if (!user)
          throw new NotFoundException('User not found')
        return user.blockedUsers.map((blockedUser) => {return blockedUser.blockedID})
      }

    async block(targetUserID: number, token: string): Promise<void> {
        console.log('check block')

        const userID = await this.userService.getUserIDBySocketID(token) //change to token later
        const blockedUser = await this.prisma.blockedUser.create({
            data: {
                blocker: { connect: {ID: userID}},
                blocked: { connect: {ID: targetUserID}},
            }
        })
        console.log('check blockedUser', blockedUser)
    }

    async unblock(targetUserID: number, token: string): Promise<void> {
        console.log('check unblock')

        const userID = await this.userService.getUserIDBySocketID(token) //change to token later
        const blockedUser = await this.prisma.blockedUser.findFirst({ 
            where: {
                blockerID: userID,
                blockedID: targetUserID,
                },
            select: {
                ID: true,
            }
        })
        if (blockedUser) {
            console.log('check blockedUser', blockedUser)
            await this.prisma.blockedUser.delete({
                where: {
                    ID: blockedUser.ID
                }
            })
        }
    }

    async blockUnblock(targetUserID: number, token: string, action: ('block' | 'unblock')): Promise<void> {
        if (action === 'block')
            this.block(targetUserID, token)
        else
            this.unblock(targetUserID, token)
    }
}
