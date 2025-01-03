import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { emitter } from '../emitter';

interface BlockButtonProps {
  userID: number;
  blockedUserIDs: number[];
  token: string;
}

const BlockButton = ({ userID, blockedUserIDs, token }: BlockButtonProps) => {
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    setIsBlocked(blockedUserIDs.includes(userID));
  }, [userID, blockedUserIDs]);

  const handleToggleBlock = async () => {
    const action = isBlocked ? 'unblock' : 'block';
    try {
      await axios.post(`http://localhost:3001/chat/blockedUser/${token}/${action}`, { userID });
      setIsBlocked(!isBlocked);
    } catch (error) {
      emitter.emit('error', error);
    }
  };

  return <button onClick={handleToggleBlock}>{isBlocked ? 'Unblock' : 'Block'}</button>;
};

export default BlockButton;
