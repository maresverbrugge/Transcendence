import React, { useEffect, useState } from 'react';
import axios from 'axios';

import Confirm from '../../Confirm';
import { ChannelData, MemberData } from '../interfaces';
import AddMember from './AddMember';
import BlockButton from './BlockButton';

interface ChannelMemberListProps {
  channel: ChannelData;
  selectChannel: (channelID: number | null) => void;
  friends: MemberData[];
  setAlert: (message: string) => void;
  token: string;
  socket: any;
}

const ChannelMemberList = ({ channel, selectChannel, friends, setAlert, token, socket }: ChannelMemberListProps) => {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [selectedMemberID, setSelectedMemberID] = useState<number | null>(null);
  const [memberID, setMemberID] = useState<number | null>(null);
  const [blockedUserIDs, setBlockedUserIDs] = useState<number[]>([]);

  useEffect(() => {
    const fetchCurrentMemberID = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/chat/channel/memberID/${channel.ID}/${token}`);
        setMemberID(parseInt(response.data));
      } catch (error) {
        console.error('Error fetching current channelMemberID:', error);
      }
    };

    const fetchChannelMembers = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/chat/channel/members/${channel.ID}/${token}`);
        setMembers(response.data);
      } catch (error) {
        console.error('Error fetching channel members:', error);
      }
    };

    const fetchBlockedUserIDs = async () => {
      try {
        const response = await axios.get<number[]>(`http://localhost:3001/chat/blockedUser/IDs/${token}`);
        setBlockedUserIDs(response.data);
      } catch (error) {
        console.error('Error fetching blocked user IDs', error);
      }
    };

    fetchCurrentMemberID();
    fetchChannelMembers();
    fetchBlockedUserIDs();

    socket.on('updateChannelMember', () => fetchChannelMembers());

    return () => {
      socket.off('updateChannelMember');
    };
  }, [channel, socket, token]);

  const currentMember = members.find((member) => member.ID === memberID);
  if (currentMember?.isBanned) selectChannel(null);

  const sortedMembers = members.sort((a, b) => {
    if (a.isOwner) return -1;
    if (b.isOwner) return 1;
    if (a.isAdmin && !b.isAdmin) return -1;
    if (b.isAdmin && !a.isAdmin) return 1;
    return 0;
  });

  const confirmMessageMap: { [key: string]: string } = {
    demote: 'Are you sure you want to demote this admin?',
    makeAdmin: 'Are you sure you want to make this user an admin?',
    mute: 'Are you sure you want to mute this user?',
    kick: 'Are you sure you want to kick this user?',
    ban: 'Are you sure you want to ban this user?',
  };

  const handleActionClick = (action: string, memberID: number) => {
    setConfirmAction(action);
    setSelectedMemberID(memberID);
    setShowConfirm(true);
  };

  const handleAction = () => {
    if (selectedMemberID && confirmAction) {
      socket.emit('channelAction', {
        action: confirmAction,
        channelMemberID: selectedMemberID,
        token,
        channelID: channel.ID,
      });
      setShowConfirm(false);
    }
  };

  const handleConfirmCancel = () => setShowConfirm(false);

  const renderActionButtons = (memberID: number) => (
    <>
      <button onClick={() => handleActionClick('mute', memberID)}>Mute</button>
      <button onClick={() => handleActionClick('kick', memberID)}>Kick</button>
      {!channel.isPrivate && <button onClick={() => handleActionClick('ban', memberID)}>Ban</button>}
    </>
  );

  return (
    <div>
      {showConfirm && (
        <Confirm message={confirmMessageMap[confirmAction ?? '']} onOK={handleAction} onCancel={handleConfirmCancel} />
      )}
      <ul>
        {sortedMembers.map((member) => {
          if (member.isBanned) return null;
          const isCurrentMember = currentMember && member.ID === currentMember.ID;
          const roleLabel = member.isOwner ? 'Owner' : member.isAdmin ? 'Admin' : '';
          return (
            <li key={member.ID}>
              {isCurrentMember
                ? `You${roleLabel ? ` (${roleLabel})` : ''}`
                : `${member.user.username}${roleLabel ? ` (${roleLabel})` : ''}`}
              {!isCurrentMember && (
                <BlockButton
                  memberID={member.user.ID}
                  blockedUserIDs={blockedUserIDs}
                  selectChannel={selectChannel}
                  channelID={channel.ID}
                  token={token}
                />
              )}
              <div className="actions">
                {currentMember?.isOwner && !member.isOwner && (
                  <>
                    {member.isAdmin ? (
                      <button onClick={() => handleActionClick('demote', member.ID)}>Demote Admin</button>
                    ) : (
                      <>
                        <button onClick={() => handleActionClick('makeAdmin', member.ID)}>Make Admin</button>
                        {renderActionButtons(member.ID)}
                      </>
                    )}
                  </>
                )}
                {currentMember?.isAdmin &&
                  !currentMember?.isOwner &&
                  !member.isAdmin &&
                  !member.isOwner &&
                  renderActionButtons(member.ID)}
              </div>
            </li>
          );
        })}
      </ul>
      {currentMember?.isAdmin && channel.isPrivate && (
        <AddMember channel={channel} friends={friends} socket={socket} token={token} setAlert={setAlert} />
      )}
    </div>
  );
};

export default ChannelMemberList;
