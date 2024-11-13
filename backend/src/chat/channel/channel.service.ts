import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException, Inject, forwardRef } from '@nestjs/common';
import { Socket, Namespace } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { Channel, ChannelMember } from '@prisma/client'
import { ChannelMemberService } from '../channel-member/channel-member.service';

type ChannelWithMembers = Channel & {
    members: ChannelMember[];
};

@Injectable()
export class ChannelService {

    constructor(
        private prisma: PrismaService,
        private readonly userService: UserService,
        @Inject(forwardRef(() => ChannelMemberService))
        private readonly channelMemberService: ChannelMemberService
    ) {}

    async joinRoom(server: Namespace, channelID: number, websocketID: string, token: string) {
        void token //hier nog een controle maken dmv token?
        const socket: Socket = server.sockets.get(websocketID);
        if (!socket)
            throw new NotFoundException(`Socket with id ${websocketID} not found.`);
        socket.join(String(channelID))
        console.log(`${websocketID} joined room ${channelID}`) //remove later
    }

    async leaveRoom(server: Namespace, channelID: number, websocketID: string) {
        const socket: Socket = server.sockets.get(websocketID);
        if (!socket)
            throw new NotFoundException(`Socket with id ${websocketID} not found.`);
        socket.leave(String(channelID));
        console.log(`${websocketID} left room ${channelID}`) //remove later
    }
    
    async leaveRoomRemoveChannelMember(server: Namespace, channelID: number, websocketID: string, token: string) {
        const userID = await this.userService.getUserIDBySocketID(token); //later veranderen naar token
        this.leaveRoom(server, channelID, websocketID);
        const channelMember = await this.prisma.channelMember.findFirst({
            where: {userId: userID, channelId: channelID},
            select: {id: true, isBanned: true},
        })
        if (!channelMember.isBanned)
            this.channelMemberService.removeChannelMember(channelMember.id)
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

    async getChannelAddMember(channelID: number, token: string): Promise <ChannelWithMembers | null> {
        try {
            const channelMember = await this.channelMemberService.getChannelMemberBySocketID(token, channelID) //change to token
            await this.channelMemberService.checkBanOrKick(channelMember)
        } catch (error) {
            if (error?.response?.statusCode == 404) {
                this.channelMemberService.createChannelMember(token ,channelID)
            }
            else
                throw error
        }
        const channel = await this.prisma.channel.findUnique({
            where: { id: channelID },
            include: {
              members: { include: { user: { select: { id: true, username: true } } }, },
              messages: true,
            },
          });
    
        if (!channel)
            throw new NotFoundException('Channel not found');
            
        return channel;
    }

    async addMemberToChannel(channelID: number, token: string): Promise<any | null> {
        const userId = await this.userService.getUserIDBySocketID(token);
    
        try {
            const newChannelMember = await this.prisma.channelMember.create({
                data: {
                    userId: userId,
                    channelId: channelID,
                },
                include: {
                    user: { select: { id: true, username: true } },
                    channel: { select: { id: true, } },
                }
            });
    
            return newChannelMember;
        } catch (error) {
            throw new InternalServerErrorException('An error occurred while adding the member to the channel.');
        }
    }
    
    
    // async getChannelAddUser(channelID: number, token: string): Promise <Channel | null> {
    //     const user = await this.userService.getUserBySocketID(token); //later veranderen naar token
    
    //     const channel = await this.getChannelByChannelID(channelID)

    //     const channelMember = channel.members.find(member => member.userId === user.id);

    //     if (!channelMember) {
    //         this.addMemberToChannel(channelID, token);
    //     } else if (channelMember.isBanned) {
    //         if (!channelMember.banUntil) {
    //             throw new ForbiddenException('You are banned from this channel');
    //         } else {
    //             const currentTime = new Date();
    //             const remainingTimeInSeconds = Math.ceil((channelMember.banUntil.getTime() - currentTime.getTime()) / 1000);
    //             throw new ForbiddenException(`You are kicked from this channel. Try again in ${remainingTimeInSeconds} seconds.`);
    //         }
    //     }
    //     return channel;
    // }

    // async getChannelMember(channelID: number, token: string): Promise <ChannelMember | null> {
    //     const userID = await this.userService.getUserIDBySocketID(token); //later veranderen naar token
    

    //     const channelMember = this.prisma.channelMember.findFirst({
    //         where: {
    //             channelId: channelID,
    //             userId: userID,
    //         },throw new NotFoundException('ChannelMember not found')

    
    async getChannelMember(channelID: number, token: string): Promise <any | null> {
        const userID = await this.userService.getUserIDBySocketID(token); //later veranderen naar token
    
        const channelMember = await this.prisma.channelMember.findFirst({
            where: {
                channelId: channelID,
                userId: userID,
            },
            include: {
                user: { select: { id: true, username: true } },
                channel: { select: { id: true, } },
            }
        })

        if (!channelMember)
            throw new NotFoundException('ChannelMember not found')

        return channelMember;
    }

    async isMuted(channelID: number, token: string): Promise<boolean> {
        const userID = await this.userService.getUserIDBySocketID(token); // later change to token
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
    
        if (!channelMember)
            throw new NotFoundException('User is not a member of this channel');
    
        if (channelMember.isMuted && channelMember.muteUntil && channelMember.muteUntil > new Date())
            return true;
    
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
    //     if (!member || !owner)
    //         throw new Error('One or both users not found')
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
    
    //     if (!owner || !member || !ownerSocket || !memberSocket)
    //         throw new Error('One or both users not found or not connected');
    
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
