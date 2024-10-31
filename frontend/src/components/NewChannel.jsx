import React, { useState } from 'react';

const NewChannel = ({ friendList, socket, ownerToken }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [channelName, setChannelName] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);  // Default to public
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
        const newChannelData = {
            name: channelName,
            isPrivate,
            password: isPrivate && passwordEnabled ? password : null,  // Set password only for private channels if enabled
            ownerToken,
            memberIDs: isPrivate ? selectedMemberIDs : [],  // Only include members if private
        };
        socket.emit('newChannel', newChannelData);
        resetForm();
    };

    const resetForm = () => {
        setIsCreating(false);
        setChannelName('');
        setIsPrivate(false);  // Reset to public
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
                    <div>
                        <label>
                            <input
                                type="radio"
                                name="channelType"
                                checked={!isPrivate}
                                onChange={() => { setIsPrivate(false); setPasswordEnabled(false); }}
                            />
                            Public
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="channelType"
                                checked={isPrivate}
                                onChange={() => { setIsPrivate(true); setPasswordEnabled(false); setPassword(''); }}
                            />
                            Private
                        </label>
                    </div>
                    {!isPrivate && (
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={passwordEnabled}
                                    onChange={(e) => setPasswordEnabled(e.target.checked)}
                                />
                                Password
                            </label>
                            <div>
                            {passwordEnabled && (
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            )}
                            </div>
                        </div>
                    )}
                    {isPrivate && (  // Invite members only for private channels
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
                    )}
                    <button onClick={handleCreateChannel}>Done</button>
                    <button onClick={resetForm}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default NewChannel;
