import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LogOutButtonProps {
  userID: number;
}

const LogOutButton: React.FC<LogOutButtonProps> = ({ userID }) => {
  const navigate = useNavigate();

  const logoutUser = () => {
    navigate('/logout', { state: { userID } });
  }

  return (
    <div className="LogOut">
      <button onClick={logoutUser} className="btn btn-outline-danger w-100">Log Out</button>
    </div>
  );
};

export default LogOutButton;
