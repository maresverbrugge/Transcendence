import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException, Inject, forwardRef } from '@nestjs/common';
import { Socket, Namespace } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { Channel, ChannelMember, User, Message } from '@prisma/client'
import { ChannelMemberService } from '../channel-member/channel-member.service';

type ChannelWithMembersAndMessages = Channel & {
    members: (ChannelMember & {
        user: Pick<User, 'id' | 'username'>;
    })[];
    messages: Message[];
};

type ChannelWithMembers = Channel & {
    members: (ChannelMember & {
        user: Pick<User, 'id' | 'username'>;
    })[];
};

type ChannelMemberResponse = ChannelMember & {
    user: Pick<User, 'id' | 'username'>;
}

@Injectable()
export class ChannelService {

    constructor(
        private prisma: PrismaService,
        private readonly userService: UserService,
        @Inject(forwardRef(() => ChannelMemberService))
        private readonly channelMemberService: ChannelMemberService
    ) {}

    async getChannelByID(channelID: number) : Promise<ChannelWithMembersAndMessages | null> {
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

    addChannelMemberToChannel(server: Namespace, channelID: number, socket: Socket, channelMember: ChannelMemberResponse) {
        server.to(String(channelID)).emit('channelMember', channelMember)
        server.to(String(channelID)).emit('action', {username: channelMember.user.username, action: 'join'})
        socket.join(String(channelID));
        console.log(`${socket.id} joined channel ${channelID}`) //remove later
    }

    async joinChannel(server: Namespace, channelID: number, socket: Socket, token: string) {
        const channelMember = await this.channelMemberService.getChannelMemberBySocketID(token, channelID) //change to token later
        this.addChannelMemberToChannel(server, channelID, socket, channelMember)
    }

    
    // async deselectChannel(server: Namespace, channelID: number, socket: Socket, token: string) {
    //     try {
    //         const channel = await this.getChannelByID(channelID)
    //         if (!channel.isPrivate)
    //             return this.removeChannelMember(server, channelID, socket, token)
    //         socket.leave(String(channelID));
    //         server.to(String(channelID)).emit('action', {username: channelMember.user.username, action: 'leave'})
    //         console.log(`${socket.id} left channel ${channelID}`) //remove later
    //     } catch (error) {
    //         socket.emit('error', error);
    //     }
    // }

    async removeChannelMemberFromChannel(server: Namespace, channelID: number, socket: Socket, token: string) {
        try {
            const userID = await this.userService.getUserIDBySocketID(token)
            const channelMember = await this.prisma.channelMember.findFirst({
                where: {userId: userID, channelId: channelID},
                select: {id: true, isBanned: true, user: {select: {username: true}}}
            })
            if (!channelMember)
                throw new NotFoundException('ChannelMember not found')
            if (!channelMember.isBanned)
                this.channelMemberService.deleteChannelMember(channelMember.id)
            socket.leave(String(channelID));
            console.log('action leave', {username: channelMember.user.username, action: 'leave'})
            server.to(String(channelID)).emit('action', {username: channelMember.user.username, action: 'leave'})
            server.to(String(channelID)).emit('removeChannelMember', channelMember.id);
            console.log(`${socket.id} left channel ${channelID}`) //remove later
        } catch (error) {
            socket.emit('error', error);
        }
    }

    emitNewPrivateChannel(server: Namespace, channel: ChannelWithMembers) {
        channel.members.map(async (member) => {
            const personalizedChannel = { ...channel }; // Create a copy of the channel object
    
            if (channel.isDM) {
                // Get the name dynamically based on the other member
                personalizedChannel.name = this.getDMName(member.user.username, channel);
                console.log('namechange', personalizedChannel.name, member);
            }
    
            const socket = await this.userService.getWebSocketByUserID(server, member.userId);
            this.addChannelMemberToChannel(server, channel.id, socket, member)
            console.log('check', member.id, socket.id)
            socket.emit('newChannel', personalizedChannel); // Emit the personalized channel
        });
    }

    async DMExists(ownerID: number, memberIDs: number[]): Promise<boolean> {
        const DMs = await this.prisma.channel.findMany({
            where: {
                isDM: true,
            },
            select: {
                members: { select: { userId: true } },
            },
        });
        const DM = DMs.find((dm) => {
            const memberIdsInDM = dm.members.map((member) => member.userId);
            return memberIdsInDM.includes(ownerID) && memberIdsInDM.includes(memberIDs[0]);
        });
        return !!DM; // Return true if a matching DM exists, otherwise false
    }
    

    async newChannel(server: Namespace, data: { name: string, isPrivate: boolean, isDM: boolean, password?: string, token: string, memberIDs: number[] }) {
        const ownerID = await this.userService.getUserIDBySocketID(data.token)
        if (data.isDM && await this.DMExists(ownerID, data.memberIDs))
            throw new ForbiddenException('DM already exists')
        const newChannel = await this.prisma.channel.create({
            data: {
                name: data.name,
                isPrivate: data.isPrivate,
                isDM: data.isDM,
                password: data.password || null,
                ownerId: ownerID,
                members: {
                    create: [
                        { userId: ownerID, isOwner: true, isAdmin: true }, // Create as owner and admin
                        ...data.memberIDs.map((memberID) => ({
                            userId: memberID,
                        })) // Create each additional member without admin or owner rights (default is without)
                    ]
                }
            },
            include: {
                members: { include: { user: { select: { id: true, username: true } } }, }
            }
        })

        if (newChannel.isPrivate)
            this.emitNewPrivateChannel(server, newChannel)
        else
            server.emit('newChannel', newChannel);
        return newChannel;
    }

    getDMName(username: string, channel: ChannelWithMembers): string {
        const channelMember = channel.members.find(member => member.user.username !== username);
        return channelMember ? channelMember.user.username : '';
    }

    async getPublicChannels() : Promise<Channel[]> {
        return this.prisma.channel.findMany( {
            where: { isPrivate: false },
            // include: {
            //   members: { include: { user: { select: { id: true, username: true } } }, },
            //   messages: true,
            // },
          });
    }

    async getPrivateChannels(token : string): Promise<Channel[]> {
        const user = await this.prisma.user.findUnique({
            where: {websocketId: token},
            select: {
                username: true,
                channelMembers: {
                    include: {channel: {
                        include: {
                            members: {include: {
                                user: {select: {
                                    id: true, 
                                    username: true 
            }}}}}}}}}
        })
        return user.channelMembers
            .filter((channelMember) => channelMember.channel.isPrivate)
            .map((channelMember) => {
                if (channelMember.channel.isDM) {
                    channelMember.channel.name = this.getDMName(user.username, channelMember.channel);
                }
                return channelMember.channel;
            });
    }

    async getChannelsOfUser(token: string): Promise<Channel[]> {
        const publicChannels = await this.getPublicChannels();
        const privateChannels = await this.getPrivateChannels(token);
        return [...publicChannels, ...privateChannels];
    }

    async getChannelAddMember(channelID: number, token: string): Promise <ChannelWithMembers | null> {
        try {
            const channelMember = await this.channelMemberService.getChannelMemberBySocketID(token, channelID) //change to token
            await this.channelMemberService.checkBanOrKick(channelMember)
        } catch (error) {
            if (error?.response?.statusCode == 404) {
                await this.channelMemberService.createChannelMember(token ,channelID)
            }
            else
                throw error
        }
        const channel = this.getChannelByID(channelID);
            
        return channel;
    }

    // async addMemberToChannel(channelID: number, token: string): Promise<any | null> {
    //     const userId = await this.userService.getUserIDBySocketID(token);
    
    //     try {
    //         const newChannelMember = await this.prisma.channelMember.create({
    //             data: {
    //                 userId: userId,
    //                 channelId: channelID,
    //             },
    //             include: {
    //                 user: { select: { id: true, username: true } },
    //                 channel: { select: { id: true, } },
    //             }
    //         });
    
    //         return newChannelMember;
    //     } catch (error) {
    //         throw new InternalServerErrorException('An error occurred while adding the member to the channel.');
    //     }
    // }
    
    
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

    
    async getChannelMemberID(channelID: number, token: string): Promise <number | null> {
        const userID = await this.userService.getUserIDBySocketID(token); //later veranderen naar token
    
        const channelMember = await this.prisma.channelMember.findFirst({
            where: {
                channelId: channelID,
                userId: userID,
            },
            select: {id: true}
        })

        if (!channelMember)
            throw new NotFoundException('ChannelMember not found')

        return channelMember.id;
    }

    async checkIsMuted(channelID: number, token: string) {
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
            throw new NotFoundException('You are not a member of this channel.');
    
        if (channelMember.isMuted && channelMember.muteUntil && channelMember.muteUntil > new Date()) {
            const timeLeft = channelMember.muteUntil.getTime() - new Date().getTime();
            const secondsLeft = Math.floor(timeLeft / 1000);
            throw new ForbiddenException(`You are muted for ${secondsLeft} more seconds.`);
        }
    
        if (channelMember.isMuted && channelMember.muteUntil && channelMember.muteUntil <= new Date()) {
            await this.prisma.channelMember.update({
                where: { id: channelMember.id },
                data: { isMuted: false, muteUntil: null },
            });
        }
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
