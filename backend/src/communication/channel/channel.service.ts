import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { Channel, User } from '@prisma/client'

@Injectable()
export class ChannelService {

    constructor(
        private prisma: PrismaService,
        private readonly userService: UserService,
    ) {}

    async getChannelByChannelId(channelId: number): Promise <Channel | null> {
        return this.prisma.channel.findUnique({
            where: { id: channelId }
          });
    }

    async sendChannelInvite(ownerSocket: Socket, server:Server, memberId: number) {
        const member: User = await this.userService.getUserByUserId(memberId)
        const owner: User = await this.userService.getUserBySocketId(ownerSocket.id)
        if (!member || !owner) {
            throw new Error('One or both users not found')
        }
        server.to(member.websocketId).emit('channelInvite', {
            ownerUsername: owner.username,
            ownerSocketId: ownerSocket.id,
        });
    }

    async acceptChannelInvite(server: Server, memberSocket: Socket, ownerSocketId: string, channelPassword?: string) {
        const owner = await this.userService.getUserBySocketId(ownerSocketId)
        const member = await this.userService.getUserBySocketId(memberSocket.id)
        const ownerSocket: Socket = server.sockets.sockets.get(ownerSocketId);
    
        if (!owner || !member || !ownerSocket) {
            throw new Error('One or both users not found or not connected');
        }
    
        const newChannel = await this.prisma.channel.create({
            data: {
                password: channelPassword || null, // Optional password
                ownerId: owner.id,
                members: {
                    create: [
                        { userId: owner.id, websocketId: ownerSocketId, isAdmin: true },
                        { userId: member.id, websocketId: memberSocket.id },
                    ],
                },
            },
            include: {
                members: {
                  include: {
                    user: true
                  }
                }
            },
        });
        memberSocket.join(String(newChannel.id))
        ownerSocket.join(String(newChannel.id))
        server.to(String(newChannel.id)).emit('newChannel', newChannel)
    }

    // async getChannelMembers(channelId: number): Promise<ChannelMember[]> {
    //     const channel = await this.prisma.channel.findUnique({
    //       where: {id : channelId},
    //       include: { members: {
    //         include: { user: true }
    //       }}
    //     })
    //     if (!channel) {
    //       throw new Error('Channel not found')
    //     }
    //     return channel.members
    // }
}
