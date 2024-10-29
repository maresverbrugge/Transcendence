import React, { useState } from 'react';

const NewChannel = ({ friendList, socket }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [channelName, setChannelName] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [passwordEnabled, setPasswordEnabled] = useState(false);
    const [password, setPassword] = useState('');
    const [selectedMemberIDs, setSelectedMemberIDs] = useState([]);

    const toggleMember = (userID) => {
        setSelectedMemberIDs((prev) =>
            prev.includes(userID)
                ? prev.filter(id => id !== userID)
                : [...prev, userID]
        );
    };

    const handleCreateChannel = () => {
        const userID = 1; //HIER KOMT EEN identifyer dmv de token?
        const newChannelData = {
            name: channelName,
            isPrivate,
            password: passwordEnabled ? password : null,
            ownerID: userID,
            memberIDs: selectedMemberIDs,
        };
        socket.emit('newChannel', newChannelData);
        resetForm();
    };

    const resetForm = () => {
        setIsCreating(false);
        setChannelName('');
        setIsPrivate(false);
        setPasswordEnabled(false);
        setPassword('');
        setSelectedMemberIDs([]);
    };

    return (
        <div>
            {!isCreating ? (
                <button onClick={() => setIsCreating(true)}>Create New Channel</button>
            ) : (
                <div className="new-channel-form">
                    <input
                        type="text"
                        placeholder="Channel Name"
                        value={channelName}
                        onChange={(e) => setChannelName(e.target.value)}
                    />
                    <label>
                        <input
                            type="checkbox"
                            checked={isPrivate}
                            onChange={(e) => setIsPrivate(e.target.checked)}
                        />
                        Private
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={passwordEnabled}
                            onChange={(e) => setPasswordEnabled(e.target.checked)}
                        />
                        Password
                    </label>
                    {passwordEnabled && (
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    )}
                    <div>
                        <h4>Add Members:</h4>
                        {friendList.map((friend) => (
                            <label key={friend.id}>
                                <input
                                    type="checkbox"
                                    checked={selectedMemberIDs.includes(friend.id)}
                                    onChange={() => toggleMember(friend.id)}
                                />
                                {friend.username}
                            </label>
                        ))}
                    </div>
                    <button onClick={handleCreateChannel}>Done</button>
                    <button onClick={resetForm}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default NewChannel;
