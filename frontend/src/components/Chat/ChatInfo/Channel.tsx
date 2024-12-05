import React, { useEffect } from 'react';
import ChannelMemberList from './ChannelMemberList.tsx';
import { ChannelData, MemberData } from '../interfaces.tsx';
import AddMember from './AddMember.tsx';

interface ChannelProps {
  channel: ChannelData;
  setChannel: (channel: ChannelData | null) => void;
  friends: MemberData[],
  setAlert: (message: string) => void;
  socket: any;
  token: string;
}

const Channel = ({ channel, setChannel, friends, setAlert, socket, token }: ChannelProps) => {

    useEffect(() => {
        if (channel && !channel.isPrivate) {
            socket.emit('joinChannel', { channelID: channel.ID, token }); // token later uit storage halen
        }

        return () => {
            if (channel && !channel.isPrivate) {
                socket.emit('leaveChannel', { channelID: channel.ID, token });
            }
        };
    }, [channel, socket, token]);

    const leaveChannel = () => {
        socket.emit('leaveChannel', { channelID: channel.ID, token });
        setChannel(null);
    };

    return (
        <div className="channel-container">
            <div className="channel-header">
                <h2>Channel: {channel?.name}</h2>
                <ChannelMemberList
                    channel={channel}
                    setChannel={setChannel}
                    token={token}
                    socket={socket}
                />
            </div>
            {channel?.isPrivate && ( <>
                <AddMember channel={channel} friends={friends} socket={socket} token={token} setAlert={setAlert} />
                <button onClick={leaveChannel}>Leave Channel</button>
                </>)}
        </div>
    );
};

export default Channel;
