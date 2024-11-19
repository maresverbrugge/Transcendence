import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException, Inject, forwardRef } from '@nestjs/common';
import { Socket, Namespace } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { Channel, ChannelMember, User, Message } from '@prisma/client'
import { ChannelMemberService } from '../channel-member/channel-member.service';
import { channel } from 'diagnostics_channel';

type ChannelWithMembers = Channel & {
    members: (ChannelMember & {
        user: Pick<User, 'id' | 'username'>;
    })[];
    messages: Message[]; // Replace `any[]` with the appropriate type for messages if known
};

@Injectable()
export class ChannelService {

    constructor(
        private prisma: PrismaService,
        private readonly userService: UserService,
        @Inject(forwardRef(() => ChannelMemberService))
        private readonly channelMemberService: ChannelMemberService
    ) {}

    async joinChannel(server: Namespace, channelID: number, websocketID: string, token: string) {
        try {
            const channelMember = await this.channelMemberService.getChannelMemberBySocketID(token, channelID); //change to token
            server.to(String(channelID)).emit('channelMember', channelMember)
        }
        catch (error) {
            server.to(String(channelID)).emit('error', error);
        }
        const socket: Socket = server.sockets.get(websocketID);
        if (!socket)
            server.to(String(channelID)).emit('error', new NotFoundException(`Socket with id ${websocketID} not found.`));
        socket.join(String(channelID))
        console.log(`${websocketID} joined channel ${channelID}`) //remove later
    }

    async leaveChannel(server: Namespace, channelID: number, websocketID: string) {
        const socket: Socket = server.sockets.get(websocketID);
        if (!socket)
            throw new NotFoundException(`Socket with id ${websocketID} not found.`);
        socket.leave(String(channelID));
        console.log(`${websocketID} left channel ${channelID}`) //remove later
    }
    
    async leaveChannelRemoveChannelMember(server: Namespace, channelID: number, websocketID: string, token: string) {
        try {
            const userID = await this.userService.getUserIDBySocketID(token); //later veranderen naar token
            this.leaveChannel(server, channelID, websocketID);
            const channelMember = await this.prisma.channelMember.findFirst({
                where: {userId: userID, channelId: channelID},
                select: {id: true, isBanned: true},
            })
            if (!channelMember.isBanned)
                this.channelMemberService.removeChannelMember(channelMember.id)
        } catch (error) {
            server.to(String(channelID)).emit('error', error);
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
    
            const websocket = await this.userService.getWebSocketByUserID(server, member.userId);
            websocket.emit('newChannel', personalizedChannel); // Emit the personalized channel
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
                members: { include: { user: { select: { id: true, username: true } } }, },
                messages: true,
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

    async getPublicChannels() : Promise<ChannelWithMembers[]> {
        return this.prisma.channel.findMany( {
            where: { isPrivate: false },
            include: {
              members: { include: { user: { select: { id: true, username: true } } }, },
              messages: true,
            },
          });
    }

    async getPrivateChannels(token : string): Promise<ChannelWithMembers[]> {
        const user = await this.prisma.user.findUnique({
            where: {websocketId: token},
            select: {
                username: true,
                channelMembers: {
                    include: {channel: {
                        include: {
                            messages: true,
                            members: {include: {
                                user: {select: {
                                    id: true, 
                                    username: true 
        }}}}}}}}}})
        return user.channelMembers
            .filter((channelMember) => channelMember.channel.isPrivate)
            .map((channelMember) => {
                if (channelMember.channel.isDM) {
                    channelMember.channel.name = this.getDMName(user.username, channelMember.channel);
                }
                return channelMember.channel;
            });
    }

    async getChannelsOfUser(token: string): Promise<ChannelWithMembers[]> {
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
