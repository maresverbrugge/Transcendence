import React from 'react';
import './AlertMessage.css';

interface AlertMessageProps {
  message: string;
  onClose: () => void;
}

const AlertMessage = ({ message, onClose }: AlertMessageProps) => {
  return (
    <div className="alert-overlay">
      <div className="alert-box">
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default AlertMessage;
