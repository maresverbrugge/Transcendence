import React, { useEffect, useRef } from 'react';

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
    <>
      {message && (
        <>
          {/* Transparent overlay */}
          <div
            className="alert-overlay"
            onClick={onClose}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",  // Transparent black overlay
              zIndex: 9998,  // Ensure it's below the alert box
            }}
          />
          {/* Alert box */}
          <div 
            className="alert alert-dismissible alert-warning"
            style={{
              zIndex: 9999,  // Ensure it's above the overlay
            }}
          >
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            />
            <h4 className="alert-heading">Alert!</h4>
            <p className="mb-0">{message}</p>
          </div>
        </>
      )}
    </>
  );
  
};

export default AlertMessage;
