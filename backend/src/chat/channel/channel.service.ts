import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { Socket, Namespace } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { Channel, ChannelMember, User, Message } from '@prisma/client'
import { ChannelMemberService } from '../channel-member/channel-member.service';
import { MessageService } from '../message/message.service';
import { ChatGateway } from '../chat.gateway';

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

@Injectable()
export class ChannelService {

    constructor(
        private prisma: PrismaService,
        private readonly userService: UserService,
        private readonly messageService: MessageService,
        private readonly channelMemberService: ChannelMemberService,
        @Inject(forwardRef(() => ChatGateway))
        private readonly chatGateway: ChatGateway
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

    addChannelMemberToChannel(channelID: number, socket: Socket) {
        this.chatGateway.emitToRoom('updateChannelMember', String(channelID))
        socket.join(String(channelID));
        console.log(`${socket.id} joined channel ${channelID}`) //remove later
    }
    
    async joinChannel(channelID: number, socket: Socket, username: string, isOwner: boolean) {
        try {
            await this.messageService.sendActionLogMessage(channelID, username, 'join')
            this.addChannelMemberToChannel(channelID, socket)
            if (isOwner)
                return
        } catch (error) {
            socket.emit('error', error)
        }
    }

    async removeChannelMemberFromChannel(channelID: number, socket: Socket, token: string) {
        try {
            const userID = await this.userService.getUserIDBySocketID(token) //change to token later
            const channelMember = await this.prisma.channelMember.findFirst({
                where: {userID: userID, channelID: channelID},
                select: {ID: true, isBanned: true, channelID: true, user: {select: {username: true}}}
            })
            if (!channelMember)
                throw new NotFoundException('ChannelMember not found')
            if (!channelMember.isBanned) {
                this.channelMemberService.deleteChannelMember(channelMember.ID)
                this.messageService.sendActionLogMessage(channelID, channelMember.user.username, 'leave')
            }
            socket.leave(String(channelID));
            socket.emit('updateChannel');
            this.chatGateway.emitToRoom('updateChannelMember', String(channelID))
            console.log(`${socket.id} left channel ${channelID}`) //remove later
        } catch (error) {
            socket.emit('error', error);
        }
    }

    emitNewPrivateChannel(channel: ChannelWithMembersAndMessages) {
        channel.members.map(async (member) => {
            const socket = await this.chatGateway.getWebSocketByUserID(member.userID)//error handling toevoegen
            if (socket)
                this.addChannelMemberToChannel(channel.ID, socket)
            socket.emit('updateChannel');
        });
    }

    emitNewChannel(server: Namespace, channel: ChannelWithMembersAndMessages) {
        if (channel.isPrivate)
            this.emitNewPrivateChannel(channel)
        else
            server.emit('updateChannel');
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
            where: { isPrivate: false }
          });
    }

    async getPrivateChannels(token : string): Promise<Channel[]> {
        const user = await this.prisma.user.findUnique({
            where: {websocketID: token},
            select: {
                username: true,
                channelMembers: {
                    select: {
                        isBanned: true,
                        channel: {
                            include: {
                                members: {include: {
                                    user: {select: {
                                        ID: true, 
                                        username: true 
            }}}}}}}}}
        })
        return user.channelMembers
            .filter((channelMember) => !channelMember.isBanned && channelMember.channel.isPrivate)
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
            await this.channelMemberService.checkBanOrKick(channelMember, channelID)
        } catch (error) {
            if (error?.response?.statusCode == 404) {
                const userID = await this.userService.getUserIDBySocketID(token) //change to Token later (+ error check?)
                await this.channelMemberService.createChannelMember(userID ,channelID)
            }
            else
                throw error
        }
        const channel = this.getChannelByID(channelID);
            
        return channel;
    }

    async newChannelMember(newMemberData: {channelID: number, memberID: number, token: string}) {
        const existingChannelMember = await this.prisma.channelMember.findFirst({
            where: {channelID: newMemberData.channelID, userID: newMemberData.memberID}
        })
        if (existingChannelMember)
            throw new ForbiddenException('This user is already a member of the channel')
        const userID = await this.userService.getUserIDBySocketID(newMemberData.token) //chanhge to token later
        const channelMember = await this.prisma.channelMember.findFirst({
            where: {
                channelID: newMemberData.channelID,
                userID: userID
            },
            select: {isAdmin: true}
        })
        if (!channelMember?.isAdmin)
            throw new ForbiddenException('You dont have Admin rights')
        await this.chatGateway.addSocketToRoom(newMemberData.memberID, newMemberData.channelID)
        await this.channelMemberService.createChannelMember(newMemberData.memberID, newMemberData.channelID)
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

    async updateChannel(userID) {
        const socket = await this.chatGateway.getWebSocketByUserID(userID)
        if (socket)
            socket.emit('updateChannel')
    }
}