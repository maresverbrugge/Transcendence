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
        setIsFriend(false);  // Assume not friends if fetch fails // ! really needed here?
      }
    };

    fetchFriendshipStatus();
  }, [currentUserID, targetUserID]);

  const toggleFriendship = async () => {
    try {
      await axios.patch(`http://localhost:3001/user/${currentUserID}/friend/${targetUserID}`);
      setIsFriend((prev) => !prev); // Toggle friend state
    } catch (error) {
      console.error('Error toggling friendship:', error);
    }
  };

  return (
    <div className="btn-group w-100" role="group" aria-label="Friendship toggle">
      <button
        type="button"
        className={`btn ${isFriend ? 'btn-success active' : 'btn-outline-success'}`}
        onClick={isFriend ? undefined : toggleFriendship}
        style={{
          width: '50%',
          fontSize: '1.2vw',
          padding: '2%',
          borderWidth: isFriend ? '2px' : '1px',
          fontWeight: isFriend ? 'bold' : 'normal',
        }}
      >
        <span style={{ display: 'inline-block', width: '1.5em', textAlign: 'center' }}>
          {isFriend && '✔️'}
        </span>
        Friend
      </button>
      <button
        type="button"
        className={`btn ${!isFriend ? 'btn-danger active' : 'btn-outline-danger'}`}
        onClick={!isFriend ? undefined : toggleFriendship}
        style={{
          width: '50%',
          fontSize: '1.2vw',
          padding: '2%',
          borderWidth: !isFriend ? '2px' : '1px',
          fontWeight: !isFriend ? 'bold' : 'normal',
        }}
      >
        <span style={{ display: 'inline-block', width: '1.5em', textAlign: 'center' }}>
          {!isFriend && '❌'}
        </span>
        Unfriend
      </button>
    </div>
  );
}

export default FriendActions;
