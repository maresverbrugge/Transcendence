import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import UserAccount from '../components/User/Account/UserAccount';
import UserProfile from '../components/User/Profile/UserProfile';

const UserPage = () => {
  const { userID } = useParams<{ userID: string }>();
  const [currentUserID, setCurrentUserID] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  var parsedUserID = parseInt(userID);

  useEffect(() => {
    const fetchCurrentUserID = async () => {
      try {
        const token = localStorage.getItem('authenticationToken');
        if (token) {
          const { data: id } = await axios.get<number>(`http://localhost:3001/user/${token}`);
          setCurrentUserID(id);
        }
      } catch (error) {
        console.error('Error fetching current user ID:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUserID();
  }, []);

  console.log("parsedUserID = ", parsedUserID);
  console.log("currentUserID = ", currentUserID);

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