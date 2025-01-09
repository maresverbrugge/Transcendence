import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserData } from '../interfaces';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';

interface DMProps {
  channelID: number;
  socket: Socket;
}

interface DMInfo {
  avatarURL: string;
  currentUserID: number;
  profileID: number;
  status: string;
  username: string
}

interface DMInfoComponentProps {
  profileID: number;
  username: string;
  status: string;
  avatarURL: string;
  socket: Socket;
}

const DMInfoComponent = ({ profileID, username, status, avatarURL, socket }: DMInfoComponentProps) => {
  const navigate = useNavigate();
  const [statusClass, setStatusClass] = useState('bg-danger');
  const [displayStatus, setDisplayStatus] = useState('Offline');

  useEffect(() => {

    const getStatusClass = (userstatus: string) => {
      switch (userstatus) {
        case 'ONLINE':
          return 'bg-warning';
        case 'IN_CHAT':
          return 'bg-success';
        case 'IN_GAME':
          return 'bg-warning';
        case 'OFFLINE':
          return 'bg-danger';
        default:
          return 'bg-secondary';
      }
    };
  
    const getDisplayStatus = (userstatus: string) => {
      switch (userstatus) {
        case 'IN_CHAT':
          return 'Online';
        case 'OFFLINE':
          return 'Offline';
        case 'IN_GAME':
        case 'ONLINE':
          return 'Away';
        default:
          return 'Unknown';
      }
    };

    console.log("useEffect triggered for ID:", profileID, "with initial status:", status);

    socket.on('userStatusChange', (userID, userStatus) => {
      console.log('check trigger handler', userID, profileID);
      if (userID === profileID) {
        console.log('check right ID');
        setStatusClass(getStatusClass(userStatus));
        setDisplayStatus(getDisplayStatus(userStatus));
      }
    });

    setStatusClass(getStatusClass(status));
    setDisplayStatus(getDisplayStatus(status));

    console.log("Current status:", status);
    console.log("Current status class:", statusClass);
    console.log("Current display status:", displayStatus);

    return () => {
      socket.off('userStatusChange');
    };
  }, [profileID, status, socket]);

  return (
    <div className="dm-info d-flex flex-column align-items-center" style={{ padding: '1rem', gap: '1rem' }}>
      <img
        src={avatarURL}
        alt={`${username}'s avatar`}
        className="rounded-circle"
        style={{
          width: '16vw',
          height: '16vw',
          maxWidth: '10rem',
          maxHeight: '10rem',
          objectFit: 'cover',
        }}
      />
      <button
        onClick={() => navigate(`/profile/${profileID}`)}
        className="btn btn-link p-0"
        style={{
          textDecoration: 'none',
          fontSize: '2rem',
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        {username}
      </button>
      <span
        className={`badge ${statusClass}`}
        style={{
          fontSize: '1.8rem',
          padding: '0.6rem 1.2rem',
          textTransform: 'capitalize',
        }}
      >
        {displayStatus}
      </span>
    </div>
  );
};


const DM = ({ channelID, socket }: DMProps) => {
  const [DMInfo, setDMInfo] = useState<DMInfo | null>(null);

  useEffect(() => {
    const fetchDMInfo = async (channelID: number) => {
      try {
        const token = localStorage.getItem('authenticationToken');
        const response = await axios.get(
          `${process.env.REACT_APP_URL_BACKEND}/chat/channel/dm-info/${channelID}/${token}`
        );
        setDMInfo(response.data);
        console.log('check dminfo', response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDMInfo(channelID);
  }, [channelID]);

  return (
    <div className="dm-container">
      {DMInfo ? (
        <DMInfoComponent
          profileID={DMInfo.profileID}
          username={DMInfo.username}
          status={DMInfo.status}
          avatarURL={DMInfo.avatarURL}
          socket={socket}
        />
      ) : (
        <h1>Loading...</h1>
      )}
    </div>
  );
};

export default DM;
