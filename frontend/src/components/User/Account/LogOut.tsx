import React from 'react';
import { useNavigate } from 'react-router-dom';

function LogOut() {
    const navigate = useNavigate();

  return (
    <div className="LogOut">
      {/* Log Out Button */}
      <button onClick={() => navigate('/')}>Log Out</button>
    </div>
  );
};

// ! deze navigate('/') moet absoluut vervangen worden door het verwijderen van de token uit local storage oid!!!!

export default LogOut;