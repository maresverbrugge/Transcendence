import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FriendActions({ currentUserID, targetUserID }: { currentUserID: number; targetUserID: number }) {
  const [isFriend, setIsFriend] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchFriendshipStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/user/${currentUserID}/friend/${targetUserID}`);
        setIsFriend(response.data.isFriend);
      } catch (error) {
        console.error('Error fetching friendship status:', error);
      }
    };

    fetchFriendshipStatus();
  }, [currentUserID, targetUserID]);

  const toggleFriendship = async () => {
    try {
      await axios.patch(`http://localhost:3001/user/${currentUserID}/friend/${targetUserID}`);
      setIsFriend((prev) => !prev); // Toggle friend state
      // console.log(response.data);
    } catch (error) {
      console.error('Error toggling friendship:', error);
    }
  };

  return (
    <button
      type="button"
      className={`btn w-100 btn-lg ${isFriend ? 'btn-outline-warning' : 'btn-outline-success'}`}
      onClick={toggleFriendship}
      style={{ padding: '8%', fontSize: '1.2rem' }}
    >
      {isFriend ? 'Unfriend' : 'Add Friend'}
    </button>
  );
}

export default FriendActions;
