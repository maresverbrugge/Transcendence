import React from 'react';
import './SendGameInvite.css'

interface GameInvitePopupProps {
  onCancel: () => void;
}

const GameInvitePopup = ({ onCancel }: GameInvitePopupProps) => {
  return (
    <div className="popup">
      <p>Waiting for the other player to respond...</p>
      <button onClick={onCancel}>Cancel Invite</button>
    </div>
  );
};

export default GameInvitePopup;
