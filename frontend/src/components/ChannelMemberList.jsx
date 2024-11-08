import React, { useEffect, useState } from 'react';

const ChannelMemberList = ({ initialMembers, currentUserChannelMember, handleActionClick, socket }) => {
    const [members, setMembers] = useState(initialMembers);

    useEffect(() => {
        setMembers(initialMembers);
    }, [initialMembers]);

    // Sort members based on their roles
    const sortedMembers = members.sort((a, b) => {
        if (a.isOwner) return -1;
        if (b.isOwner) return 1;
        if (a.isAdmin && !b.isAdmin) return -1;
        if (b.isAdmin && !a.isAdmin) return 1;
        return 0;
    });

    // Socket listener to handle updates to the member list
    useEffect(() => {
        // Listen for 'updateChannelMember' event from the backend
        socket.on('updateChannelMember', (updatedMember) => {
            setMembers((prevMembers) =>
                prevMembers.map((member) =>
                    member.id === updatedMember.id ? updatedMember : member
                )
            );
        });

        // Clean up listener on component unmount
        return () => {
            socket.off('updateChannelMember');
        };
    }, []);
    console.log(initialMembers)
    console.log(members)

    return (
        <ul>
            {sortedMembers.map((member) => {
                const isCurrentUser = member.userId === currentUserChannelMember.userId;
                const roleLabel = member.isOwner
                    ? "Owner"
                    : member.isAdmin
                    ? "Admin"
                    : "";
                return (
                    <li key={member.id}>
                        {isCurrentUser
                            ? `You${roleLabel ? ` (${roleLabel})` : ""}`
                            : `${member.user.username}${roleLabel ? ` (${roleLabel})` : ""}`}

                        <div className="actions">
                            {currentUserChannelMember.isOwner && !member.isOwner && (
                                <>
                                    {member.isAdmin ? (
                                        <button onClick={() => handleActionClick("demote", member.id)}>Demote Admin</button>
                                    ) : (
                                        <>
                                            <button onClick={() => handleActionClick("makeAdmin", member.id)}>Make Admin</button>
                                            <button onClick={() => handleActionClick("mute", member.id)}>Mute</button>
                                            <button onClick={() => handleActionClick("kick", member.id)}>Kick</button>
                                            <button onClick={() => handleActionClick("ban", member.id)}>Ban</button>
                                        </>
                                    )}
                                </>
                            )}
                            {currentUserChannelMember.isAdmin && !currentUserChannelMember.isOwner && !member.isAdmin && !member.isOwner && (
                                <>
                                    <button onClick={() => handleActionClick("mute", member.id)}>Mute</button>
                                    <button onClick={() => handleActionClick("kick", member.id)}>Kick</button>
                                    <button onClick={() => handleActionClick("ban", member.id)}>Ban</button>
                                </>
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};

export default ChannelMemberList;
