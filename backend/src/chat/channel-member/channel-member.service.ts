import { ForbiddenException, Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { Namespace } from 'socket.io';
import { ChannelService } from '../channel/channel.service';
import { ChannelMember } from '@prisma/client';

interface ChannelMemberResponse {
    id: number;
    isAdmin: boolean;
    isBanned: boolean;
    isMuted: boolean;
    isOwner: boolean;
    user: { websocketId: string }
}

@Injectable()
export class ChannelMemberService {

    constructor(
        private prisma: PrismaService,
        private readonly userService: UserService,
        @Inject(forwardRef(() => ChannelService))
        private readonly channelService: ChannelService,
      ) {}

    async getChannelMemberByUserID(userID: number, channelID: number) : Promise<ChannelMemberResponse | null> {
        const channelMember = await this.prisma.channelMember.findFirst({
            where: {
                userId : userID,
                channelId : channelID
            },
            select: {
                id : true,
                isAdmin : true,
                isBanned : true,
                isMuted : true,
                isOwner : true,
                user: { select: { websocketId : true } }
            },
        })
        if (!channelMember)
            throw new NotFoundException('ChannelMember not found')
        return channelMember
    }

    async getChannelMemberBySocketID(token : string, channelID: number) : Promise<ChannelMemberResponse | null> { //later veranderen naar token
        const userID = await this.userService.getUserIDBySocketID(token) //change to Token later
        return this.getChannelMemberByUserID(userID, channelID)
    }

    async removeChannelMember(channelMemberID: number): Promise<ChannelMember> {
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

    async checkPermissions(token: string, channelID: number, requiredRole: 'owner' | 'admin') {
        const isAllowed = requiredRole === 'owner'
            ? await this.isOwner(token, channelID)
            : await this.isAdmin(token, channelID);
        if (!isAllowed)
            throw new ForbiddenException(`You don't have ${requiredRole} permissions`);
    }
    
    async updateChannelMember(server: Namespace, channelID: number, memberID: number, updateData: any) {
        const updatedChannelMember = await this.prisma.channelMember.update({
            where: { id: memberID },
            data: updateData,
            include: {
                user: { select: { id: true, username: true } },
            },
        });
        server.to(String(channelID)).emit('updateChannelMember', updatedChannelMember);
    }
    
    async makeAdmin(server: Namespace, targetUserID: number, token: string, channelID: number) {
        await this.checkPermissions(token, channelID, 'admin');
        const targetChannelMember = await this.getChannelMemberByUserID(targetUserID, channelID);
        await this.updateChannelMember(server, channelID, targetChannelMember.id, { isAdmin: true });
    }
    
    async demote(server: Namespace, targetUserID: number, token: string, channelID: number) {
        await this.checkPermissions(token, channelID, 'owner');
        const targetChannelMember = await this.getChannelMemberByUserID(targetUserID, channelID);
        await this.updateChannelMember(server, channelID, targetChannelMember.id, { isAdmin: false });
    }
    
    async ban(server: Namespace, targetUserID: number, token: string, channelID: number) {
        await this.checkPermissions(token, channelID, 'admin');
        const targetChannelMember = await this.getChannelMemberByUserID(targetUserID, channelID);
        if (targetChannelMember.isAdmin)
            throw new ForbiddenException("You can't ban another admin");
        await this.updateChannelMember(server, channelID, targetChannelMember.id, { isBanned: true });
        this.channelService.leaveChannel(server, channelID, targetChannelMember.user.websocketId);
    }
    
    async mute(server: Namespace, targetUserID: number, token: string, channelID: number) {
        await this.checkPermissions(token, channelID, 'admin');
        const targetChannelMember = await this.getChannelMemberByUserID(targetUserID, channelID);
        if (targetChannelMember.isAdmin)
            throw new ForbiddenException("You can't mute another admin");
        const muteUntil = new Date(Date.now() + 60 * 1000);
        await this.updateChannelMember(server, channelID, targetChannelMember.id, { isMuted: true, muteUntil });
    }
    
    async kick(server: Namespace, targetUserID: number, token: string, channelID: number) {
        await this.checkPermissions(token, channelID, 'admin');
        const targetChannelMember = await this.getChannelMemberByUserID(targetUserID, channelID);
        if (targetChannelMember.isAdmin)
            throw new ForbiddenException("You can't kick another admin");
        const banUntil = new Date(Date.now() + 120 * 1000);
        await this.updateChannelMember(server, channelID, targetChannelMember.id, { isBanned: true, banUntil });
        this.channelService.leaveChannel(server, channelID, targetChannelMember.user.websocketId);
    }
}
