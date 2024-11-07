import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { Namespace } from 'socket.io';


interface ChannelMemberResponse {
    id: number;
    isAdmin: boolean;
    isBanned: boolean;
    isMuted: boolean;
    isOwner: boolean;
}

@Injectable()
export class ChannelMemberService {

    constructor(
        private prisma: PrismaService,
        private readonly userService: UserService,
      ) {}

    async getChannelMemberByUserID(userID: number, channelID: number) : Promise<ChannelMemberResponse | null> {
        console.log(`hetChannelmember: userID: ${userID}, channelID: ${channelID}`)
        const channelMember = await this.prisma.channelMember.findFirst({
            where: {
                userId : userID,
                channelId : channelID
            },
            select: {
                id : true,
                isAdmin : true,
                isBanned : true,
                isMuted : true,
                isOwner : true,
            },
        })
        if (!channelMember) {
            throw new NotFoundException('ChannelMember not found')
        }
        return channelMember
    }

    async getChannelMemberBySocketID(token : string, channelID: number) : Promise<ChannelMemberResponse | null> {
        const userID = await this.userService.getUserIDBySocketID(token) //change to Token later
        return this.getChannelMemberByUserID(userID, channelID)
    }

    async makeAdmin(server: Namespace, targetUserID: number, token: string, channelID: number) {
        const channelMember = await this.getChannelMemberBySocketID(token, channelID)
        console.log(channelMember)
        if (!channelMember.isAdmin) {
            throw new ForbiddenException(`you don't have admin rights`)
        }
        const targetChannelMember = await this.getChannelMemberByUserID(targetUserID, channelID)
        const updated = await this.prisma.channelMember.update({
            where: { id : targetChannelMember.id },
            data: {
                isAdmin: true,
            },
            include: {
                user: {
                    select: {
                      id: true,
                      username: true,
                    },
                },
            }
        })
        server.to(String(channelID)).emit('updateChannelMember', updated)
    }
}
