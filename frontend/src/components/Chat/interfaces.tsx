export interface ChannelData {
    ID: string;
    name?: string;
    isPrivate: boolean;
    isDM?: boolean;
    members: MemberData[]
  }
  
  export interface MemberData {
    ID: string;
    username: string;
    isOwner: boolean;
    isAdmin: boolean;
    status: 'ONLINE' | 'OFFLINE' | 'IN_GAME' | 'AFK';
  }
  
  export interface MessageData {
    channelID: string;
    content: string;
  }
