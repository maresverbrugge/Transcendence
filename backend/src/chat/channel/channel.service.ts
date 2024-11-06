import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Socket, Namespace } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { Channel, ChannelMember } from '@prisma/client'

type ChannelWithMembers = Channel & {
    members: ChannelMember[];
};

@Injectable()
export class ChannelService {

    constructor(
        private prisma: PrismaService,
        private readonly userService: UserService,
    ) {}

    async joinChannel(server: Namespace, channelID: number, websocketID: string) {
        const socket: Socket = server.sockets.get(websocketID);
        if (!socket) {
            throw new Error(`Socket with id ${websocketID} not found.`);
        }
        socket.join(String(channelID))
        console.log(`${websocketID} joined channel ${channelID}`)
    }

    async leaveChannel(server: Namespace, channelID: number, websocketID: string) {
        const socket: Socket = server.sockets.get(websocketID);
        if (!socket) {
            throw new Error(`Socket with id ${websocketID} not found.`);
        }
        socket.leave(String(channelID));
        console.log(`${websocketID} left channel ${channelID}`)
    }
    

    async newChannel(server: Namespace, data: { name: string, isPrivate: boolean, password?: string, ownerToken: string, memberIDs: number[] }) {
        const ownerID = await this.userService.getUserIDBySocketID(data.ownerToken) // later veranderen naar token
        const newChannel = await this.prisma.channel.create({
            data: {
                name: data.name,
                password: data.password || null, // Optional password
                ownerId: ownerID,
                members: {
                    create: [
                        { userId: ownerID, isOwner: true, isAdmin: true }, // Create as owner and admin
                        ...data.memberIDs.map((memberID) => ({
                            userId: memberID,
                            isAdmin: false
                        })) // Create each additional member as non-admin
                    ]
                }
            },
        })

        // await this.joinChannel(server, newChannel.id, ownerID);

        // Create an array of promises
        // const memberJoinPromises = data.memberIDs.map(memberID => 
        //     this.joinChannel(server, newChannel.id, memberID)
        // );

        // // Wait for all joinChannel calls to complete
        // await Promise.all(memberJoinPromises);

        server.emit('newChannel', newChannel);
        return newChannel;
    }

    async getChannelByChannelID(channelID: number): Promise <ChannelWithMembers | null> {
        const channel = await this.prisma.channel.findUnique({
            where: { id: channelID },
            include: {
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      username: true,
                    },
                  },
                },
              },
              messages: true,
            },
          });
    
          if (!channel) {
            throw new NotFoundException('Channel not found');
          }
    
          return channel;
    }

    async addMemberToChannel(channelID: number, userToken: string): Promise<ChannelWithMembers | null> {
        const userId = await this.userService.getUserIDBySocketID(userToken);
    
        try {
            const channel = await this.prisma.channel.update({
                where: { id: channelID },
                data: {
                    members: {
                        create: {
                            userId: userId,
                        },
                    },
                },
                include: {
                    members: {
                        include: {
                            user: true,
                        },
                    },
                },
            });
    
            return channel;
        } catch (error) {
            console.error(`Failed to add member to channel: ${error.message}`);
            throw new Error('An error occurred while adding the member to the channel.');
        }
    }
    
    async getChannelByChannelIDAndAddUser(channelID: number, userToken: string): Promise <Channel | null> {
        const user = await this.userService.getUserBySocketID(userToken); //later veranderen naar token
    
        const channel = await this.getChannelByChannelID(channelID)

        const channelMember = channel.members.find(member => member.userId === user.id);

        if (!channelMember) {
            this.addMemberToChannel(channelID, userToken)
        } else if (channelMember.isBanned) {
            throw new ForbiddenException('You are banned from this channel');
        }
        return channel;
    }

    async getChannelMember(channelID: number, userToken: string): Promise <ChannelMember | null> {
        const userID = await this.userService.getUserIDBySocketID(userToken); //later veranderen naar token
    

        const channelMember = this.prisma.channelMember.findFirst({
            where: {
                channelId: channelID,
                userId: userID,
            },
        })

        if (!channelMember) {
            throw new NotFoundException('ChannelMember not found')
        }

        return channelMember;
    }

    async isMuted(channelID: number, userToken: string): Promise<boolean> {
        const userID = await this.userService.getUserIDBySocketID(userToken); // later change to token
        const channelMember = await this.prisma.channelMember.findFirst({
            where: {
                channelId: channelID,
                userId: userID,
            },
            select: {
                id: true,
                isMuted: true,
                muteUntil: true,
            },
        });
    
        if (!channelMember) {
            throw new NotFoundException('User is not a member of this channel');
        }
    
        if (channelMember.isMuted && channelMember.muteUntil && channelMember.muteUntil > new Date()) {
            return true;
        }
    
        if (channelMember.isMuted && channelMember.muteUntil && channelMember.muteUntil <= new Date()) {
            await this.prisma.channelMember.update({
                where: { id: channelMember.id },
                data: { isMuted: false, muteUntil: null },
            });
            return false;
        }
    
        return false;
    }
    

    // async sendChannelInvite(ownerSocket: Socket, server: Namespace, memberId: number) {
    //     const member: User = await this.userService.getUserByUserID(memberId)
    //     const owner: User = await this.userService.getUserBySocketID(ownerSocket.id)
    //     if (!member || !owner) {
    //         throw new Error('One or both users not found')
    //     }
    //     server.to(member.websocketId).emit('channelInvite', {
    //         ownerUsername: owner.username,
    //         ownerId: owner.id,
    //         memberId: memberId
    //     });
    // }

    // async acceptChannelInvite(server: Namespace, memberId: number, ownerId: number, channelName: string, channelPassword?: string) {
    //     const owner = await this.userService.getUserByUserID(ownerId)
    //     const member = await this.userService.getUserByUserID(memberId)
    //     const ownerSocket: Socket = server.sockets.get(owner.websocketId);
    //     const memberSocket: Socket = server.sockets.get(member.websocketId);
    
    //     if (!owner || !member || !ownerSocket || !memberSocket) {
    //         throw new Error('One or both users not found or not connected');
    //     }
    
    //     const newChannel = await this.prisma.channel.create({
    //         data: {
    //             name:  channelName,
    //             password: channelPassword || null, // Optional password
    //             ownerId: ownerId,
    //             members: {
    //                 create: [
    //                     { userId: ownerId, websocketId: owner.websocketId, isAdmin: true },
    //                     { userId: memberId, websocketId: memberSocket.id },
    //                 ],
    //             },
    //         },
    //     });
    //     memberSocket.join(String(newChannel.id))
    //     ownerSocket.join(String(newChannel.id))
    //     server.to(String(newChannel.id)).emit('newChannel', newChannel)
    // }
}
