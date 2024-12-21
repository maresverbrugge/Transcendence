import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { emitter } from '../emitter';

interface BlockButtonProps {
  memberID: number;
  blockedUserIDs: number[];
  token: string;
}

const BlockButton = ({ memberID, blockedUserIDs, token }: BlockButtonProps) => {
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    setIsBlocked(blockedUserIDs.includes(memberID));
  }, [memberID, blockedUserIDs]);

  const handleToggleBlock = async () => {
    const action = isBlocked ? 'unblock' : 'block';
    try {
      await axios.post(`http://localhost:3001/chat/blockedUser/${token}/${action}`, { userID: memberID });
      setIsBlocked(!isBlocked);
    } catch (error) {
      emitter.emit('error', error);
    }
  };

  return <button onClick={handleToggleBlock}>{isBlocked ? 'Unblock' : 'Block'}</button>;
};

export default BlockButton;
