import React, { useEffect, useRef } from 'react';

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

    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 9997,
      }}
    >
      <div
        className="alert alert-dismissible alert-success"
        ref={acceptBoxRef}
        tabIndex={0} // Make the div focusable
        onKeyDown={handleKeyDown}
      >
        <p>{message}</p>
        <button className="btn btn-outline-light" onClick={() => onDecline(senderUserID)}>Decline</button>
        <button className="btn btn-outline-light" onClick={() => onAccept(senderUserID)}>Accept</button>
      </div>
    </div>
  );
};

export default Accept;
