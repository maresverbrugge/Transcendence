import React from 'react';
import { Socket } from 'socket.io-client';

import { ChannelData, MemberData } from '../interfaces';
import BlockButton from './BlockButton';
import { emitter } from '../../emitter';
import SendGameInvite from './SendGameInvite';
import { useNavigate } from 'react-router-dom';

interface ChannelMemberProps {
    member: MemberData;
    currentMember: MemberData;
    channel: ChannelData;
    blockedUserIDs: number[];
    socket: Socket;
}

const ChannelMember = ({ member, currentMember, channel, blockedUserIDs, socket}: ChannelMemberProps) => {
  const token = localStorage.getItem('authenticationToken');
  const navigate = useNavigate();

  const confirmMessageMap: { [key: string]: string } = {
    demote: 'Are you sure you want to demote this admin?',
    makeAdmin: 'Are you sure you want to make this user an admin?',
    mute: 'Are you sure you want to mute this user?',
    kick: 'Are you sure you want to kick this user?',
    ban: 'Are you sure you want to ban this user?',
  };

  const emitAction = (action) => {
    socket.emit('channelAction', {
      action,
      channelMemberID: member.ID,
      token,
      channelID: channel.ID,
    });
  };

  const handleActionClick = (action: 'demote' | 'makeAdmin' | 'mute' | 'kick' | 'ban') => {
    emitter.emit('confirm', {
      message: confirmMessageMap[action],
      onOK: () => emitAction(action),
    });
  };


  
      // <>
      //   {!(member.ID === currentMember.ID) && (
      //     <>
      //       <BlockButton userID={member?.user.ID} blockedUserIDs={blockedUserIDs} />
      //       <SendGameInvite receiverUserID={member?.user.ID} socket={socket} />
      //     </>
      //   )}
  
      //   {currentMember?.isOwner && !member.isOwner && (
      //     <>
      //       {member.isAdmin ? (
      //         <button onClick={() => handleActionClick('demote', member.ID)}>Demote Admin</button>
      //       ) : (
      //         <>
      //           <button onClick={() => handleActionClick('makeAdmin', member.ID)}>Make Admin</button>
      //           {actionButtons(member.ID)}
      //         </>
      //       )}
      //     </>
      //   )}
  
      //   {currentMember?.isAdmin && !currentMember?.isOwner && !member.isAdmin && !member.isOwner && (
      //     <>
      //       <button onClick={() => handleActionClick('mute', memberID)}>Mute</button>
      //       <button onClick={() => handleActionClick('kick', memberID)}>Kick</button>
      //       {!isPrivateChannel && (
      //         <button onClick={() => handleActionClick('ban', memberID)}>Ban</button>
      //       )}
      //     </>
      //   )}
      // </>

  const roleLabel = member.isOwner ? 'Owner' : member.isAdmin ? 'Admin' : '';

  return (
    <li key={`member${member.ID}`} className="p-1">
      <div className="dropdown">
        <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          {(member.ID === currentMember.ID)
          ? `You${roleLabel ? ` (${roleLabel})` : ''}`
          : `${member.user.username}${roleLabel ? ` (${roleLabel})` : ''}`}
        </button>
        <ul className="dropdown-menu">
          {currentMember?.isOwner && !member.isOwner && (
            <>
              {member.isAdmin ? (
                <li key={'action1'}>
                  <button className="dropdown-item" onClick={() => handleActionClick('demote')}>Demote Admin</button>
                </li>
              ) : (
                <li key={'action2'}>
                  <button className="dropdown-item" onClick={() => handleActionClick('makeAdmin')}>Make Admin</button>
                </li>
              )}
            </>
          )}
          {currentMember?.isAdmin && !member.isAdmin && (
            <>
              <li key={'action3'}>
                <button className="dropdown-item" onClick={() => handleActionClick('mute')}>Mute</button>
              </li>
              <li key={'action4'}>
                <button className="dropdown-item" onClick={() => handleActionClick('kick')}>Kick</button>
              </li>
              {!channel.isPrivate && (
                <li key={'action5'}>
                  <button className="dropdown-item" onClick={() => handleActionClick('ban')}>Ban</button>
                </li>
              )}
            </>
          )}
          {(currentMember.ID !== member.ID) && (
            <>
              <li key={'action6'}>
                <BlockButton userID={member?.user.ID} blockedUserIDs={blockedUserIDs} />
              </li>
              <li key={'action7'}>
                <SendGameInvite receiverUserID={member?.user.ID} socket={socket} />
              </li>
            </>
          )}
          <li>
              <button className="dropdown-item" onClick={() => navigate(`/profile/${member.user.ID}`)}>Go to Profile</button>
          </li>
        </ul>
      </div>
    </li>
  );
}

export default ChannelMember