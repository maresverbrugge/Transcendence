 import { UserStatus } from '@prisma/client'

export interface ChannelData {
    ID: number;
    name?: string;
    isPrivate: boolean;
    isDM?: boolean;
    members: MemberData[]
    messages: MessageData[]
  }
  
  export interface MemberData {
    ID: number;
    username: string;
    isOwner: boolean;
    isAdmin: boolean;
    isBanned: boolean;
    user: {username: string};
    status: 'ONLINE' | 'OFFLINE' | 'IN_GAME' | 'AFK';
    channelID: string;
  }
  
  export interface MessageData {
    ID: number;
    senderName?: string;
    senderID: number;
    channelID: number;
    content: string;
  }

  export interface UserData {
    ID: number;
    username: string;
    intraUsername: string;
    websocketID: string;
    Enabled2FA: boolean;
    statis: UserStatus;
    avatarURL: string;
  }