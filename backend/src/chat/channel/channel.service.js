var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from "../../prisma/prisma.service";
import { UserService } from '../user/user.service';
import { ChannelMemberService } from '../channel-member/channel-member.service';
let ChannelService = class ChannelService {
    constructor(prisma, userService, channelMemberService) {
        this.prisma = prisma;
        this.userService = userService;
        this.channelMemberService = channelMemberService;
    }
    async getChannelByID(channelID) {
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
    addChannelMemberToChannel(server, channelID, socket, channelMember) {
        server.to(String(channelID)).emit('channelMember', channelMember);
        server.to(String(channelID)).emit('action', { username: channelMember.user.username, action: 'join' });
        socket.join(String(channelID));
        console.log(`${socket.id} joined channel ${channelID}`); //remove later
    }
    async joinChannel(server, channelID, socket, token) {
        const channelMember = await this.channelMemberService.getChannelMemberBySocketID(token, channelID); //change to token later
        this.addChannelMemberToChannel(server, channelID, socket, channelMember);
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
    async removeChannelMemberFromChannel(server, channelID, socket, token) {
        try {
            const userID = await this.userService.getUserIDBySocketID(token);
            const channelMember = await this.prisma.channelMember.findFirst({
                where: { userID: userID, channelID: channelID },
                select: { ID: true, isBanned: true, user: { select: { username: true } } }
            });
            if (!channelMember)
                throw new NotFoundException('ChannelMember not found');
            if (!channelMember.isBanned)
                this.channelMemberService.deleteChannelMember(channelMember.ID);
            socket.leave(String(channelID));
            server.to(String(channelID)).emit('action', { username: channelMember.user.username, action: 'leave' });
            server.to(String(channelID)).emit('removeChannelMember', channelMember.ID);
            console.log(`${socket.id} left channel ${channelID}`); //remove later
        }
        catch (error) {
            socket.emit('error', error);
        }
    }
    emitNewPrivateChannel(server, channel) {
        channel.members.map(async (member) => {
            const personalizedChannel = { ...channel }; // Create a copy of the channel object
            if (channel.isDM) {
                // Get the name dynamically based on the other member
                personalizedChannel.name = this.getDMName(member.user.username, channel);
                console.log('namechange', personalizedChannel.name, member);
            }
            const socket = await this.userService.getWebSocketByUserID(server, member.userID);
            this.addChannelMemberToChannel(server, channel.ID, socket, member);
            socket.emit('newChannel', personalizedChannel); // Emit the personalized channel
        });
    }
    async DMExists(ownerID, memberIDs) {
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
    async newChannel(server, data) {
        const ownerID = await this.userService.getUserIDBySocketID(data.token);
        if (data.isDM && await this.DMExists(ownerID, data.memberIDs))
            throw new ForbiddenException('DM already exists');
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
                members: { include: { user: { select: { ID: true, username: true } } }, }
            }
        });
        if (newChannel.isPrivate)
            this.emitNewPrivateChannel(server, newChannel);
        else
            server.emit('newChannel', newChannel);
        return newChannel;
    }
    getDMName(username, channel) {
        const channelMember = channel.members.find(member => member.user.username !== username);
        return channelMember ? channelMember.user.username : '';
    }
    async getPublicChannels() {
        return this.prisma.channel.findMany({
            where: { isPrivate: false },
            // include: {
            //   members: { include: { user: { select: { ID: true, username: true } } }, },
            //   messages: true,
            // },
        });
    }
    async getPrivateChannels(token) {
        const user = await this.prisma.user.findUnique({
            where: { websocketID: token },
            select: {
                username: true,
                channelMembers: {
                    include: { channel: {
                            include: {
                                members: { include: {
                                        user: { select: {
                                                ID: true,
                                                username: true
                                            } }
                                    } }
                            }
                        } }
                }
            }
        });
        return user.channelMembers
            .filter((channelMember) => channelMember.channel.isPrivate)
            .map((channelMember) => {
            if (channelMember.channel.isDM) {
                channelMember.channel.name = this.getDMName(user.username, channelMember.channel);
            }
            return channelMember.channel;
        });
    }
    async getChannelsOfUser(token) {
        const publicChannels = await this.getPublicChannels();
        const privateChannels = await this.getPrivateChannels(token);
        return [...publicChannels, ...privateChannels];
    }
    async getChannelAddMember(channelID, token) {
        try {
            const channelMember = await this.channelMemberService.getChannelMemberBySocketID(token, channelID); //change to token
            await this.channelMemberService.checkBanOrKick(channelMember);
        }
        catch (error) {
            if (error?.response?.statusCode == 404) {
                await this.channelMemberService.createChannelMember(token, channelID);
            }
            else
                throw error;
        }
        const channel = this.getChannelByID(channelID);
        return channel;
    }
    // async addMemberToChannel(channelID: number, token: string): Promise<any | null> {
    //     const userID = await this.userService.getUserIDBySocketID(token);
    //     try {
    //         const newChannelMember = await this.prisma.channelMember.create({
    //             data: {
    //                 userID: userID,
    //                 channelID: channelID,
    //             },
    //             include: {
    //                 user: { select: { ID: true, username: true } },
    //                 channel: { select: { ID: true, } },
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
    //     const channelMember = channel.members.find(member => member.userID === user.ID);
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
    //             channelID: channelID,
    //             userID: userID,
    //         },throw new NotFoundException('ChannelMember not found')
    async getChannelMemberID(channelID, token) {
        const userID = await this.userService.getUserIDBySocketID(token); //later veranderen naar token
        const channelMember = await this.prisma.channelMember.findFirst({
            where: {
                channelID: channelID,
                userID: userID,
            },
            select: { ID: true }
        });
        if (!channelMember)
            throw new NotFoundException('ChannelMember not found');
        return channelMember.ID;
    }
    async checkIsMuted(channelID, token) {
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
};
ChannelService = __decorate([
    Injectable(),
    __param(2, Inject(forwardRef(() => ChannelMemberService))),
    __metadata("design:paramtypes", [typeof (_a = typeof PrismaService !== "undefined" && PrismaService) === "function" ? _a : Object, UserService,
        ChannelMemberService])
], ChannelService);
export { ChannelService };
