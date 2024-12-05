import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Confirm from '../../Confirm.tsx';
import { ChannelData, MemberData } from '../interfaces.tsx';
import AddMember from './AddMember.tsx';

interface ChannelMemberListProps {
  channel: ChannelData;
  handleSelectChannel: (channelID: number | null) => void;
  friends: MemberData[];
  setAlert: (message: string) => void;
  token: string;
  socket: any; // Adjust this type if using a specific Socket.IO client library type
}

const ChannelMemberList = ({ channel, handleSelectChannel, friends, setAlert, token, socket }: ChannelMemberListProps) => {
    const [members, setMembers] = useState<MemberData[]>([]);
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    const [confirmAction, setConfirmAction] = useState<string | null>(null);
    const [selectedMemberID, setSelectedMemberID] = useState<string | null>(null);
    const [memberID, setMemberID] = useState<string | null>(null);
    
    useEffect(() => {

        const fetchCurrentMemberID = async (channelID: number, token: string) => {
            try {
                const response = await axios.get(`http://localhost:3001/chat/channel/memberID/${channelID}/${token}`);
                setMemberID(response.data);
            } catch (error) {
                console.error('Error fetching current channelMemberID:', error);
            }
            
        };

        const fetchChannelMembers = async (channelID: number, token: string) => {
            try {
                const response = await axios.get(`http://localhost:3001/chat/channel/members/${channelID}/${token}`);
                setMembers(response.data)
            } catch (error) {
                console.error('Error fetching channel members:', error);
            }
        }
        
        fetchCurrentMemberID(channel.ID, token);
        fetchChannelMembers(channel.ID, token)
    
        socket.on('updateChannelMember', () => fetchChannelMembers(channel.ID, token));
    
        return () => {
            socket.off('updateChannelMember');
        };
    }, [channel]);

    const currentMember = members.find(member => member.ID === memberID);
    if (currentMember?.isBanned) handleSelectChannel(null);

    // Sort members based on their roles
    const sortedMembers = members.sort((a, b) => {
        if (a.isOwner) return -1;
        if (b.isOwner) return 1;
        if (a.isAdmin && !b.isAdmin) return -1;
        if (b.isAdmin && !a.isAdmin) return 1;
        return 0;
    });

    const confirmMessageMap: { [key: string]: string } = {
        demote: "Are you sure you want to demote this admin?",
        makeAdmin: "Are you sure you want to make this user an admin?",
        mute: "Are you sure you want to mute this user?",
        kick: "Are you sure you want to kick this user?",
        ban: "Are you sure you want to ban this user?",
    };

    const handleActionClick = (action: string, memberID: string) => {
        setConfirmAction(action);
        setSelectedMemberID(memberID);
        setShowConfirm(true);
    };

    const handleAction = () => {
        if (selectedMemberID && confirmAction) {
            socket.emit('channelAction', { action: confirmAction, channelMemberID: selectedMemberID, token, channelID: channel.ID });
            setShowConfirm(false);
        }
    };

    const handleConfirmCancel = () => setShowConfirm(false);

    const renderActionButtons = (memberId: string) => (
        <>
            <button onClick={() => handleActionClick("mute", memberId)}>Mute</button>
            <button onClick={() => handleActionClick("kick", memberId)}>Kick</button>
            {!channel.isPrivate && (<button onClick={() => handleActionClick("ban", memberId)}>Ban</button>)}
        </>
    );

    return (
        <div>
            {showConfirm && (
                <Confirm
                    message={confirmMessageMap[confirmAction ?? '']}
                    onOK={handleAction}
                    onCancel={handleConfirmCancel}
                />
            )}
            <ul>
                {sortedMembers.map((member) => {
                    if (member.isBanned) return null;
                    const isCurrentMember = currentMember && member.ID === currentMember.ID;
                    const roleLabel = member.isOwner
                        ? "Owner"
                        : member.isAdmin
                        ? "Admin"
                        : "";
                    return (
                        <li key={member.ID}>
                            {isCurrentMember
                                ? `You${roleLabel ? ` (${roleLabel})` : ""}`
                                : `${member.user.username}${roleLabel ? ` (${roleLabel})` : ""}`}
                            <div className="actions">
                                {currentMember?.isOwner && !member.isOwner && (
                                    <>
                                        {member.isAdmin ? (
                                            <button onClick={() => handleActionClick("demote", member.ID)}>Demote Admin</button>
                                        ) : (
                                            <>
                                                <button onClick={() => handleActionClick("makeAdmin", member.ID)}>Make Admin</button>
                                                {renderActionButtons(member.ID)}
                                            </>
                                        )}
                                    </>
                                )}
                                {currentMember?.isAdmin && !currentMember?.isOwner && !member.isAdmin && !member.isOwner && (
                                    renderActionButtons(member.ID)
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
            {currentMember?.isAdmin && channel.isPrivate && (<AddMember channel={channel} friends={friends} socket={socket} token={token} setAlert={setAlert} />)}
        </div>
    );
};

export default ChannelMemberList;
