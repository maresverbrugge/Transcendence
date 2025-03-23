import React from 'react';
import { useNavigate } from 'react-router-dom';


const LogOutButton = ({ buttonStyle }: { buttonStyle: string }) => {
  const navigate = useNavigate();

  const logoutUser = () => {
    navigate('/logout');
  };

  return (
    <div className="LogOut">
      <button onClick={logoutUser} className={`btn ${buttonStyle} w-100`}>
        Log Out
      </button>
    </div>
  );
};

export default LogOutButton;
