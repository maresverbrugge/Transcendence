import React, { useEffect, useRef } from 'react';
import './AlertMessage.css';

interface AlertMessageProps {
  message: string;
  onClose: () => void;
}

const AlertMessage = ({ message, onClose }: AlertMessageProps) => {
  const alertBoxRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    // Focus the alert box when it mounts
    alertBoxRef.current?.focus();
  }, []);

  return (
    <div className="alert-overlay">
      <div
        className="alert-box"
        ref={alertBoxRef}
        tabIndex={0} // Makes the div focusable
        onKeyDown={handleKeyDown}
        role="alertdialog" // Improves accessibility
        aria-label="Alert message" // Screen reader description
        aria-describedby="alert-message"
      >
        <p id="alert-message">{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default AlertMessage;
