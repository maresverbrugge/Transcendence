export interface ChannelData {
    ID: string;
    name?: string;
    isPrivate: boolean;
    isDM?: boolean;
    members: MemberData[]
    messages: MessageData[]
  }
  
  export interface MemberData {
    ID: string;
    username: string;
    isOwner: boolean;
    isAdmin: boolean;
    isBanned: boolean;
    user: {username: string};
    status: 'ONLINE' | 'OFFLINE' | 'IN_GAME' | 'AFK';
    channelID: string;
  }
  
  export interface MessageData {
    ID: string;
    senderName?: string;
    channelID: string;
    content: string;
  }