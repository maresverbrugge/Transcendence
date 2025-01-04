import React, { useEffect, useRef } from 'react';

interface ConfirmProps {
  message: string;
  onOK: () => void;
  onCancel: () => void;
}

const Confirm = ({ message, onOK, onCancel }: ConfirmProps) => {
  const confirmBoxRef = useRef<HTMLDivElement>(null);

  // Add focus to the confirm box when the component mounts
  useEffect(() => {
    confirmBoxRef.current?.focus();
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onOK(); // Trigger OK action
    } else if (event.key === 'Escape') {
      onCancel(); // Trigger Cancel action
    }
  };

  return (
    <div className="confirm-overlay">
      <div
        className="confirm-box"
        ref={confirmBoxRef}
        tabIndex={0} // Make the div focusable
        onKeyDown={handleKeyDown}
      >
        <p>{message}</p>
        <button onClick={onCancel}>Cancel</button>
        <button onClick={onOK}>OK</button>
      </div>
    </div>
  );
};

export default Confirm;
