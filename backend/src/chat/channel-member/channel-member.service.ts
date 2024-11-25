import { ForbiddenException, Injectable, NotFoundException, Inject, forwardRef, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { Namespace } from 'socket.io';
import { ChannelService } from '../channel/channel.service';
import { ChannelMember, User } from '@prisma/client';

type ChannelMemberResponse = ChannelMember & {
    user: Pick<User, 'id' | 'username' | 'websocketId'>;
};


@Injectable()
export class ChannelMemberService {

    constructor(
        private prisma: PrismaService,
        private readonly userService: UserService,
        @Inject(forwardRef(() => ChannelService))
        private readonly channelService: ChannelService,
      ) {}

    async getChannelMember(channelMemberID: number) :  Promise<ChannelMemberResponse | null> {
        return this.prisma.channelMember.findUnique({
            where: { id: channelMemberID },
            select: {
                id : true,
                websocketId : true,
                isAdmin : true,
                isBanned : true,
                isMuted : true,
                isOwner : true,
                banUntil : true,
                muteUntil : true,
                userId : true,
                channelId : true,
                user: { select: {id: true, websocketId : true, username: true } }
            },
        })
    }

    async getChannelMemberBySocketID(token : string, channelID: number) : Promise<ChannelMemberResponse | null> { //later veranderen naar token
        const userID = await this.userService.getUserIDBySocketID(token) //change to Token later
        const channelMember = await this.prisma.channelMember.findFirst({
            where: {
                userId : userID,
                channelId : channelID
            },
            select: {
                id : true,
                websocketId: true,
                isAdmin : true,
                isBanned : true,
                isMuted : true,
                isOwner : true,
                banUntil : true,
                muteUntil : true,
                userId : true,
                channelId : true,
                user: { select: {id: true, websocketId : true, username: true } }
            },
        })
        if (!channelMember)
            throw new NotFoundException('ChannelMember not found')
        return channelMember
    }

    async createChannelMember(token: string, channelID: number) : Promise<ChannelMemberResponse | null> {
        const userID = await this.userService.getUserIDBySocketID(token) //change to Token later (+ error check?)
        const channelMember = await this.prisma.channelMember.create({
            data: {
                userId : userID,
                channelId : channelID
            },
            select: {
                id : true,
                websocketId: true,
                isAdmin : true,
                isBanned : true,
                isMuted : true,
                isOwner : true,
                banUntil : true,
                muteUntil : true,
                userId: true,
                channelId: true,
                user: { select: {id: true, websocketId : true, username: true } }
            },
        })
        if (!channelMember)
            throw new InternalServerErrorException('Error creating channelMember')
        return channelMember
    }

    async deleteChannelMember(channelMemberID: number): Promise<ChannelMember> {
        try {
            return await this.prisma.channelMember.delete({
                where: { id: channelMemberID },
            });
        } catch (error) {
            throw new NotFoundException('ChannelMember not found');
        }
    }

    async isAdmin(token: string, channelID: number) : Promise<boolean> {
        const channelMember = await this.getChannelMemberBySocketID(token, channelID) //later veranderen naar token
        return channelMember.isAdmin
    }

    async isOwner(token: string, channelID: number) : Promise<boolean> {
        const channelMember = await this.getChannelMemberBySocketID(token, channelID) //later veranderen naar token
        return channelMember.isOwner
    }
    
    async updateChannelMember(memberID: number, updateData: any) : Promise<ChannelMemberResponse> {
        return await this.prisma.channelMember.update({
            where: { id: memberID },
            data: updateData,
            select: {
                id : true,
                websocketId: true,
                isAdmin : true,
                isBanned : true,
                isMuted : true,
                isOwner : true,
                banUntil : true,
                muteUntil : true,
                channelId: true,
                userId: true,
                user: { select: {id: true, websocketId : true, username: true } }
            },
        });
    }
    
    async updateChannelMemberEmit(server: Namespace, channelID: number, memberID: number, updateData: any) {
        const updatedChannelMember = await this.updateChannelMember(memberID, updateData)
        server.to(String(channelID)).emit('channelMember', updatedChannelMember);
    }
    
    async checkBanOrKick(channelMember: ChannelMemberResponse) {
        if (!channelMember.isBanned)
            return
        if (!channelMember.banUntil)
            throw new ForbiddenException('You are banned from this channel')
        else {
            const timeLeft = channelMember.banUntil.getTime() - new Date().getTime();
            
            if (timeLeft > 0) {
                const secondsLeft = Math.floor(timeLeft / 1000);
                throw new ForbiddenException(`You are kicked from this channel. Try again in ${secondsLeft} seconds.`)
            } else
                await this.updateChannelMember(channelMember.id, {isBanned: false, banUntil: null})
        }
    }

    async checkPermissions(token: string, channelID: number, targetIsAdmin: boolean, requiredRole: 'owner' | 'admin', action: string) {
        const isAllowed = requiredRole === 'owner'
            ? await this.isOwner(token, channelID)
            : await this.isAdmin(token, channelID);
        if (!isAllowed)
            throw new ForbiddenException(`You don't have ${requiredRole} permissions`);
        if (action === 'ban' || action === 'kick' || action === 'mute') {
            if (targetIsAdmin)
                throw new ForbiddenException(`You can't ${action} another admin`);
        }
    }

    actionGetUpdateData(action: string) {
        switch (action) {
            case 'ban':
                return { isBanned: true };
            case 'mute': {
                const muteUntil = new Date(Date.now() + 60 * 1000);
                return { isMuted: true, muteUntil };
            }
            case 'kick': {
                const banUntil = new Date(Date.now() + 120 * 1000);
                return { isBanned: true, banUntil };
            }
            case 'makeAdmin':
                return { isAdmin: true };
            case 'demote':
                return { isAdmin: false };
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }
    

    async action(server: Namespace, channelMemberID: number, token: string, channelID: number, action: string) {
        try {
            const targetChannelMember = await this.getChannelMember(channelMemberID);
            await this.checkPermissions(token, channelID, targetChannelMember.isAdmin, 'admin', action);
            const updateData = this.actionGetUpdateData(action)
            await this.updateChannelMemberEmit(server, channelID, channelMemberID, updateData);
            if (action === 'ban' || action === 'kick')
            {
                const socket = server.sockets.get(targetChannelMember.user.websocketId);
                if (socket)
                    socket.leave(String(channelID));
            }
            server.to(String(channelID)).emit('action', {action, username: targetChannelMember.user.username})
        } catch (error) {
            server.to(String(channelID)).emit('error', error);
        }
    }
}
