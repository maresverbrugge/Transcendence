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

    async joinChannel(server: Server, channelID: number, userID: number) {
        const user = await this.userService.getUserByUserId(userID);
        //if !(user) ... misschien deze error throwen in getUserByUserID 
        const socket: Socket = server.sockets.sockets.get(user.websocketId);
        //if (!socket) ?
        socket.join(String(channelID))
    }

    async newChannel(server: Server, data: { name: string, isPrivate: boolean, password?: string, ownerID: number, memberIDs: number[] }) {
        const newChannel = await this.prisma.channel.create({
            data: {
                name: data.name,
                password: data.password || null, // Optional password
                ownerId: data.ownerID,
                members: {
                    create: [
                        { userId: data.ownerID, isAdmin: true }, // Create the owner as admin
                        ...data.memberIDs.map((memberID) => ({
                            userId: memberID,
                            isAdmin: false
                        })) // Create each additional member as non-admin
                    ]
                }
            },
            include: {
                members: {
                    include: {
                        user: true
                    }
                },
                messages: true
            }
        });
        await this.joinChannel(server, newChannel.id, data.ownerID);

        // Create an array of promises
        const memberJoinPromises = data.memberIDs.map(memberID => 
            this.joinChannel(server, newChannel.id, memberID)
        );

        // Wait for all joinChannel calls to complete
        await Promise.all(memberJoinPromises);

        server.to(String(newChannel.id)).emit('newChannel', newChannel);
        return newChannel;
    }
    
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
            ownerId: owner.id,
            memberId: memberId
        });
    }

    async acceptChannelInvite(server: Server, memberId: number, ownerId: number, channelName: string, channelPassword?: string) {
        const owner = await this.userService.getUserByUserId(ownerId)
        const member = await this.userService.getUserByUserId(memberId)
        const ownerSocket: Socket = server.sockets.sockets.get(owner.websocketId);
        const memberSocket: Socket = server.sockets.sockets.get(member.websocketId);
    
        if (!owner || !member || !ownerSocket || !memberSocket) {
            throw new Error('One or both users not found or not connected');
        }
    
        const newChannel = await this.prisma.channel.create({
            data: {
                name:  channelName,
                password: channelPassword || null, // Optional password
                ownerId: ownerId,
                members: {
                    create: [
                        { userId: ownerId, websocketId: owner.websocketId, isAdmin: true },
                        { userId: memberId, websocketId: memberSocket.id },
                    ],
                },
            },
            include: {
                members: {
                  include: {
                    user: true
                  }
                },
                messages: true
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
