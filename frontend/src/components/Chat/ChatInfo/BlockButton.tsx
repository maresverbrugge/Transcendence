import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface BlockButtonProps {
    memberID: number;
    blockedUserIDs: number[];
    selectChannel: (channelID: number | null) => void;
    channelID: number;
    token: string;
}

const BlockButton = ({ memberID, blockedUserIDs, selectChannel, channelID, token }: BlockButtonProps) => {
    const [isBlocked, setIsBlocked] = useState(false);

    useEffect(() => {
        setIsBlocked(blockedUserIDs.includes(memberID));
    }, [memberID, blockedUserIDs]);

    const handleToggleBlock = async () => {
        const action = isBlocked ? 'unblock' : 'block';
        try {
            axios.post(`http://localhost:3001/chat/blockedUser/${token}/${action}`, { userID: memberID });
            setIsBlocked(!isBlocked);
            selectChannel(channelID)
        } catch (error) {
            console.error(`Failed to ${action} the user`, error);
        }
    };

    return (
        <button onClick={handleToggleBlock}>
            {isBlocked ? 'Unblock' : 'Block'}
        </button>
    );
};

export default BlockButton;
