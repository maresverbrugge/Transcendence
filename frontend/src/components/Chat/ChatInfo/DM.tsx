import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserData } from '../interfaces'
import { useNavigate } from 'react-router-dom';

interface DMProps {
  channelID: number;
}

interface DMInfoProps {
  ID: number;
  username: string;
  status: string;
  avatarURL: string;
}

const DMInfoComponent = ( {ID, username, status, avatarURL}: DMInfoProps) => {
  const navigate = useNavigate()

  const getStatusClass = (status: string) => {
    switch (status) {
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

  const getDisplayStatus = (status) => {
    switch (status) {
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

  return (
    <div
  className="dm-info d-flex flex-column align-items-center"
  style={{ padding: '1rem', gap: '1rem' }}>
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
    onClick={() => navigate(`/profile/${ID}`)}
    className="btn btn-link p-0"
    style={{
      textDecoration: 'none',
      fontSize: '2rem',
      fontWeight: 'bold',
      textAlign: 'center',
    }}>
    {username}
  </button>
  <span
    className={`badge ${getStatusClass(status)}`}
    style={{
      fontSize: '1.8rem',
      padding: '0.6rem 1.2rem',
      textTransform: 'capitalize',
    }}>
    {getDisplayStatus(status)}
  </span>
</div>

  )
};

const DM = ({ channelID }: DMProps) => {
  const [DMInfo, setDMInfo] = useState<UserData | null>(null);
  useEffect(() => {
    const fetchDMInfo = async (channelID: number) => {
      try {
        const token = localStorage.getItem('authenticationToken')
        const response = await axios.get(`${process.env.REACT_APP_URL_BACKEND}/chat/channel/dm-info/${channelID}/${token}`);
        setDMInfo(response.data)
      } catch (error) {
        console.error(error);
      }
    };

    fetchDMInfo(channelID);
  }, [channelID]);

  return (
    <div className="dm-container">
      {DMInfo ? <DMInfoComponent ID={DMInfo.ID} username={DMInfo.username} status={DMInfo.status} avatarURL={DMInfo.avatarURL}/> : <h1>Loading...</h1>}
    </div>
  );
};

export default DM;
