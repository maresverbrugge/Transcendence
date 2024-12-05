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
    senderID: string;
    channelID: string;
    content: string;
  }