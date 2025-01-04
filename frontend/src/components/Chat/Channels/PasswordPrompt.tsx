import React, { useState, useEffect, useRef } from 'react';

interface PasswordPromptProps {
  onClose: () => void;
  onSubmit: (password: string) => void;
}

const PasswordPrompt = ({ onClose, onSubmit }: PasswordPromptProps) => {
  const PasswordPromptRef = useRef<HTMLDivElement>(null);
  const [password, setPassword] = useState<string>('');

    useEffect(() => {
      PasswordPromptRef.current?.focus();
    }, []);
  
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleSubmit();
      } else if (event.key === 'Escape') {
        onClose();
      }
    };

  const handleSubmit = () => {
    onSubmit(password);
  };

  return (
    <div className="password-prompt-overlay">
      <div
      className="password-prompt-modal"
      onKeyDown={handleKeyDown}
      ref={PasswordPromptRef}
      tabIndex={0} // Make the div focusable
      >
        <h3>Enter Channel Password</h3>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div>
          <button onClick={handleSubmit}>Submit</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default PasswordPrompt;
