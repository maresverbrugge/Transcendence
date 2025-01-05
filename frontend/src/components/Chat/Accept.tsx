import React, { useEffect, useRef } from 'react';
import './Accept.css';

interface AcceptProps {
  message: string;
  senderUserID: number;
  onAccept: (senderUserID: number) => void;
  onDecline: (senderUserID: number) => void;
}

const Accept = ({ message, senderUserID, onAccept, onDecline }: AcceptProps) => {
  const acceptBoxRef = useRef<HTMLDivElement>(null);

  // Add focus to the accept box when the component mounts
  useEffect(() => {
    acceptBoxRef.current?.focus();
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onAccept(senderUserID);
    } else if (event.key === 'Escape') {
      onDecline(senderUserID);
    }
  };

  return (
    <div className="accept-overlay">
      <div
        className="accept-box"
        ref={acceptBoxRef}
        tabIndex={0} // Make the div focusable
        onKeyDown={handleKeyDown}
      >
        <p>{message}</p>
        <button onClick={() => onDecline(senderUserID)}>Decline</button>
        <button onClick={() => onAccept(senderUserID)}>Accept</button>
      </div>
    </div>
  );
};

export default Accept;
