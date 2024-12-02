import React from 'react';
import { useNavigate } from 'react-router-dom';

function LogOut() {
    const navigate = useNavigate();

  return (
    <div className="LogOut">
      {/* Log Out Button */}
      <button onClick={() => navigate('/')} className="btn btn-outline-danger w-100">Log Out</button>
    </div>
  );
};

// ! nog toevoegen: het verwijderen van de token uit local storage oid!!!!

export default LogOut;
