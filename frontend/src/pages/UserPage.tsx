import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { emitter } from '../components/emitter';
import UserAccount from '../components/User/Account/UserAccount';
import UserProfile from '../components/User/Profile/UserProfile';

const UserPage = () => {
  const { userID } = useParams<{ userID: string }>();
  const [currentUserID, setCurrentUserID] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  var parsedUserID = userID ? parseInt(userID) : NaN;

  useEffect(() => {
    const fetchCurrentUserID = async () => {
      try {
        const token = localStorage.getItem('authenticationToken');
        if (token) {
          const response = await axios.get(`${process.env.REACT_APP_URL_BACKEND}/user/getID/${token}`);
          setCurrentUserID(response.data);
        }
      } catch (error) {
        emitter.emit("error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUserID();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (currentUserID === null) {
    return <p>Unable to determine the logged-in user.</p>;
  }

  return (parsedUserID === currentUserID || userID === undefined) ? (
    <UserAccount />
  ) : (
    <UserProfile profileUserID={parsedUserID} />
  );
};

export default UserPage;
