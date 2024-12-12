import { ForbiddenException, Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Namespace, Socket } from 'socket.io';
import { ChannelMember, User } from '@prisma/client';

import { UserService } from '../blockedUser/user.service';
import { ChannelService } from '../channel/channel.service';
import { MessageService } from '../message/message.service';
import { ChatGateway } from '../chat.gateway';

type ChannelMemberResponse = ChannelMember & {
  user: Pick<User, 'ID' | 'username' | 'websocketID'>;
};

type action = 'demote' | 'makeAdmin' | 'mute' | 'kick' | 'ban' | 'join' | 'leave';

@Injectable()
export class ChannelMemberService {
  constructor(
    private prisma: PrismaService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => MessageService))
    private readonly messageService: MessageService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
    @Inject(forwardRef(() => ChannelService))
    private readonly channelService: ChannelService
  ) {}

  async getChannelMember(channelMemberID: number): Promise<ChannelMemberResponse | null> {
    return this.prisma.channelMember.findUnique({
      where: { ID: channelMemberID },
      include: {
        user: { select: { ID: true, websocketID: true, username: true } },
      },
    });
  }

  async getChannelMembers(channelID: number, token: string): Promise<ChannelMemberResponse[]> {
    if (!(await this.isChannelMember(channelID, token))) {
      throw new ForbiddenException('You are not a member of this channel');
    }
    const channel = await this.prisma.channel.findUnique({
      where: { ID: channelID }, // Use token as the identifier
      include: {
        members: {
          include: {
            user: { select: { ID: true, username: true, websocketID: true } },
          },
        },
      },
    });
    const filteredMembers = channel.members.filter((member) => !member.isBanned && member.channelID === channelID);
    return filteredMembers;
  }

  async isChannelMember(channelID: number, token: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { websocketID: token }, // Ensures the token is used as an identifier
      include: {
        channelMembers: {
          select: { channelID: true, isBanned: true }, // Fetch only the channel IDs
        },
      },
    });

    const member = user?.channelMembers.find((member) => member.channelID === channelID);
    return member !== undefined && !member.isBanned;
  }

  async getChannelMemberBySocketID(token: string, channelID: number): Promise<ChannelMemberResponse | null> {
    //later veranderen naar token
    const userID = await this.userService.getUserIDBySocketID(token); //change to Token later
    const channelMember = await this.prisma.channelMember.findFirst({
      where: {
        userID: userID,
        channelID: channelID,
      },
      select: {
        ID: true,
        websocketID: true,
        isAdmin: true,
        isBanned: true,
        isMuted: true,
        isOwner: true,
        banUntil: true,
        muteUntil: true,
        userID: true,
        channelID: true,
        user: { select: { ID: true, websocketID: true, username: true } },
      },
    });
    if (!channelMember) throw new NotFoundException('ChannelMember not found');
    return channelMember;
  }

  async createChannelMember(userID: number, channelID: number) {
    await this.prisma.channelMember.create({
      data: {
        userID: userID,
        channelID: channelID,
      },
    });
  }

  async deleteChannelMember(channelMemberID: number): Promise<ChannelMember> {
    try {
      return await this.prisma.channelMember.delete({
        where: { ID: channelMemberID },
      });
    } catch (error) {
      throw new NotFoundException('ChannelMember not found');
    }
  }

  async isAdmin(token: string, channelID: number): Promise<boolean> {
    const channelMember = await this.getChannelMemberBySocketID(token, channelID); //later veranderen naar token
    return channelMember.isAdmin;
  }

  async isOwner(token: string, channelID: number): Promise<boolean> {
    const channelMember = await this.getChannelMemberBySocketID(token, channelID); //later veranderen naar token
    return channelMember.isOwner;
  }

  async updateChannelMember(memberID: number, updateData: any) {
    await this.prisma.channelMember.update({
      where: { ID: memberID },
      data: updateData,
      select: {
        ID: true,
        websocketID: true,
        isAdmin: true,
        isBanned: true,
        isMuted: true,
        isOwner: true,
        banUntil: true,
        muteUntil: true,
        channelID: true,
        userID: true,
        user: { select: { ID: true, websocketID: true, username: true } },
      },
    });
  }

  async checkBanOrKick(channelMember: ChannelMemberResponse, channelID: number) {
    if (!channelMember.isBanned) return;
    if (!channelMember.banUntil) throw new ForbiddenException('You are banned from this channel');
    else {
      const timeLeft = channelMember.banUntil.getTime() - new Date().getTime();

      if (timeLeft > 0) {
        const secondsLeft = Math.floor(timeLeft / 1000);
        throw new ForbiddenException(`You are kicked from this channel. Try again in ${secondsLeft} seconds.`);
      } else {
        await this.updateChannelMember(channelMember.ID, { isBanned: false, banUntil: null });
        this.chatGateway.emitToRoom('updateChannelMember', String(channelID));
      }
    }
  }

  async checkPermissions(
    token: string,
    channelID: number,
    targetIsAdmin: boolean,
    requiredRole: 'owner' | 'admin',
    action: action
  ) {
    const isAllowed =
      requiredRole === 'owner' ? await this.isOwner(token, channelID) : await this.isAdmin(token, channelID);
    if (!isAllowed) throw new ForbiddenException(`You don't have ${requiredRole} permissions`);
    if (action === 'ban' || action === 'kick' || action === 'mute') {
      if (targetIsAdmin) throw new ForbiddenException(`You can't ${action} another admin`);
    }
  }

  actionGetUpdateData(action: action) {
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

  async action(
    server: Namespace,
    channelMemberID: number,
    token: string,
    channelID: number,
    action: 'demote' | 'makeAdmin' | 'mute' | 'kick' | 'ban' | 'join' | 'leave'
  ) {
    try {
      const targetChannelMember = await this.getChannelMember(channelMemberID);
      await this.checkPermissions(token, channelID, targetChannelMember.isAdmin, 'admin', action);
      const updateData = this.actionGetUpdateData(action);
      this.messageService.sendActionLogMessage(channelID, targetChannelMember.user.username, action);
      await this.updateChannelMember(channelMemberID, updateData);
      if (action === 'ban' || action === 'kick') {
        if (await this.channelService.isPrivateChannel(channelID)) {
          await this.deleteChannelMember(targetChannelMember.ID);
        }
        const socket = server.sockets.get(targetChannelMember.user.websocketID);
        if (socket) {
          socket.leave(String(channelID));
          socket.emit('deselectChannel');
          socket.emit('updateChannel');
        }
      }
      this.chatGateway.emitToRoom('updateChannelMember', String(channelID));
    } catch (error) {
      this.chatGateway.emitToRoom('error', String(channelID), error);
    }
  }

  async addSocketToAllRooms(socket: Socket, token: string) {
    void token;
    const user = await this.prisma.user.findUnique({
      where: { websocketID: socket.id }, // change to token later
      select: { channelMembers: { select: { channelID: true, isBanned: true } } },
    });
    const channelMembers = user?.channelMembers;
    if (!channelMembers) return;
    channelMembers.map((member) => {
      if (!member.isBanned) {
        socket.join(String(member.channelID));
        console.log(`${socket.id} joined channel ${member.channelID}`); //remove later
      }
    });
  }
}
