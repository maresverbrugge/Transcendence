import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException, Inject, forwardRef } from '@nestjs/common';
import { Socket, Namespace } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { Channel, ChannelMember, User, Message } from '@prisma/client'
import { ChannelMemberService } from '../channel-member/channel-member.service';
import { MessageService } from '../message/message.service';

type ChannelWithMembersAndMessages = Channel & {
    members: (ChannelMember & {
        user: Pick<User, 'ID' | 'username'>;
    })[];
    messages: Message[];
};

type ChannelWithMembers = Channel & {
    members: (ChannelMember & {
        user: Pick<User, 'ID' | 'username'>;
    })[];
};

type ChannelMemberResponse = ChannelMember & {
    user: Pick<User, 'ID' | 'username'>;
}

@Injectable()
export class ChannelService {

    constructor(
        private prisma: PrismaService,
        private readonly userService: UserService,
        private readonly messageService: MessageService,
        @Inject(forwardRef(() => ChannelMemberService))
        private readonly channelMemberService: ChannelMemberService
    ) {}

    async getChannelByID(channelID: number) : Promise<ChannelWithMembersAndMessages | null> {
        const channel = await this.prisma.channel.findUnique({
            where: { ID: channelID },
            include: {
              members: { include: { user: { select: { ID: true, username: true } } }, },
              messages: true,
            },
          });
    
        if (!channel)
            throw new NotFoundException('Channel not found');
        return channel;
    }

    addChannelMemberToChannel(server: Namespace, channelID: number, socket: Socket, channelMember: ChannelMemberResponse) {
        server.to(String(channelID)).emit('channelMember', channelMember)
        socket.join(String(channelID));
        console.log(`${socket.id} joined channel ${channelID}`) //remove later
    }
    
    async joinChannel(server: Namespace, channelID: number, socket: Socket, token: string) {
        try {
            const channelMember = await this.channelMemberService.getChannelMemberBySocketID(token, channelID) //change to token later
            this.addChannelMemberToChannel(server, channelID, socket, channelMember)
            if (channelMember.isOwner)
                return
            this.messageService.sendActionLogMessage(server, channelID, channelMember.user.username, 'join')
        } catch (error) {
            socket.emit('error', error)
        }
    }

    async removeChannelMemberFromChannel(server: Namespace, channelID: number, socket: Socket, token: string) {
        try {
            const userID = await this.userService.getUserIDBySocketID(token)
            const channelMember = await this.prisma.channelMember.findFirst({
                where: {userID: userID, channelID: channelID},
                select: {ID: true, isBanned: true, channelID: true, user: {select: {username: true}}}
            })
            if (!channelMember)
                throw new NotFoundException('ChannelMember not found')
            if (!channelMember.isBanned) {
                this.channelMemberService.deleteChannelMember(channelMember.ID)
                this.messageService.sendActionLogMessage(server, channelID, channelMember.user.username, 'leave')
            }
            socket.leave(String(channelID));
            server.to(String(channelID)).emit('removeChannelMember', channelMember);
            console.log(`${socket.id} left channel ${channelID}`) //remove later
        } catch (error) {
            socket.emit('error', error);
        }
    }

    emitNewPrivateChannel(server: Namespace, channel: ChannelWithMembersAndMessages) {
        channel.members.map(async (member) => {
            const personalizedChannel = { ...channel }; // Create a copy of the channel object
    
            if (channel.isDM) {
                // Get the name dynamically based on the other member
                personalizedChannel.name = this.getDMName(member.user.username, channel);
                console.log('namechange', personalizedChannel.name, member);
            }
    
            const socket = await this.userService.getWebSocketByUserID(server, member.userID);
            this.addChannelMemberToChannel(server, channel.ID, socket, member)
            socket.emit('newChannel', personalizedChannel); // Emit the personalized channel
        });
    }

    emitNewChannel(server: Namespace, channel: ChannelWithMembersAndMessages) {
        if (channel.isPrivate)
            this.emitNewPrivateChannel(server, channel)
        else
            server.emit('newChannel', channel);
    }

    async DMExists(ownerID: number, memberIDs: number[]): Promise<boolean> {
        const DMs = await this.prisma.channel.findMany({
            where: {
                isDM: true,
            },
            select: {
                members: { select: { userID: true } },
            },
        });
        const DM = DMs.find((dm) => {
            const memberIDsInDM = dm.members.map((member) => member.userID);
            return memberIDsInDM.includes(ownerID) && memberIDsInDM.includes(memberIDs[0]);
        });
        return !!DM; // Return true if a matching DM exists, otherwise false
    }
    

    async newChannel(data: { name: string, isPrivate: boolean, isDM: boolean, password?: string, token: string, memberIDs: number[] }): Promise<ChannelWithMembersAndMessages> {
        const ownerID = await this.userService.getUserIDBySocketID(data.token)
        if (data.isDM && await this.DMExists(ownerID, data.memberIDs))
            throw new ForbiddenException('DM already exists')
        const newChannel = await this.prisma.channel.create({
            data: {
                name: data.name,
                isPrivate: data.isPrivate,
                isDM: data.isDM,
                password: data.password || null,
                ownerID: ownerID,
                members: {
                    create: [
                        { userID: ownerID, isOwner: true, isAdmin: true }, // Create as owner and admin
                        ...data.memberIDs.map((memberID) => ({
                            userID: memberID,
                        })) // Create each additional member without admin or owner rights (default is without)
                    ]
                }
            },
            include: {
                members: { include: { user: { select: { ID: true, username: true } } }, },
                messages: true
            }
        })
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
            //   members: { include: { user: { select: { ID: true, username: true } } }, },
            //   messages: true,
            // },
          });
    }

    async getPrivateChannels(token : string): Promise<Channel[]> {
        const user = await this.prisma.user.findUnique({
            where: {websocketID: token},
            select: {
                username: true,
                channelMembers: {
                    include: {channel: {
                        include: {
                            members: {include: {
                                user: {select: {
                                    ID: true, 
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

    async getChannelMemberID(channelID: number, token: string): Promise <number | null> {
        const userID = await this.userService.getUserIDBySocketID(token); //later veranderen naar token
    
        const channelMember = await this.prisma.channelMember.findFirst({
            where: {
                channelID: channelID,
                userID: userID,
            },
            select: {ID: true}
        })

        if (!channelMember)
            throw new NotFoundException('ChannelMember not found')

        return channelMember.ID;
    }

    async checkIsMuted(channelID: number, token: string) {
        const userID = await this.userService.getUserIDBySocketID(token); // later change to token
        const channelMember = await this.prisma.channelMember.findFirst({
            where: {
                channelID: channelID,
                userID: userID,
            },
            select: {
                ID: true,
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
                where: { ID: channelMember.ID },
                data: { isMuted: false, muteUntil: null },
            });
        }
    }
}