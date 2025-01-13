import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { emitter } from '../../emitter';

const FriendActions = ({ targetUserID }: { targetUserID: number }) => {
  const [isFriend, setIsFriend] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchFriendshipStatus = async () => {
      try {
        const token = localStorage.getItem('authenticationToken');
        const response = await axios.get(`${process.env.REACT_APP_URL_BACKEND}/user/${targetUserID}/friend/${token}`);
        setIsFriend(response.data.isFriend);
      } catch (error) {
        emitter.emit("error", error);
      }
    };

    fetchFriendshipStatus();
  }, [targetUserID]);

  const toggleFriendship = async () => {
    if (loading) return;

    const previousState = isFriend;
    setLoading(true);
    setIsFriend((prev) => !prev);

    try {
      const token = localStorage.getItem('authenticationToken');
      await axios.patch(`${process.env.REACT_APP_URL_BACKEND}/user/${targetUserID}/friend/${token}`);
    } catch (error) {
      emitter.emit("error", error);
      setIsFriend(previousState);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={`btn w-100 btn-lg ${isFriend ? 'btn-outline-warning' : 'btn-outline-success'}`}
      onClick={toggleFriendship}
      disabled={loading}
      style={{ padding: '8%', fontSize: '1.2rem' }}
    >
      {loading ? 'Processing...' : isFriend ? 'Unfriend' : 'Add Friend'}
    </button>
  );
};

export default FriendActions;
