import React, { useState } from 'react';
import './NewChannel.css';
import { MemberData, ChannelData } from '../interfaces.tsx'
import axios from 'axios';

interface NewChannelProps {
    friends: MemberData[];
    setSelectedChannel: (channel: ChannelData | null) => void;
    socket: any;
    token: string;
}

const NewChannel = ({ friends, setSelectedChannel, socket, token }: NewChannelProps) => {
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [channelName, setChannelName] = useState<string>('');
    const [isPrivate, setIsPrivate] = useState<boolean>(false);  // Default to public
    const [passwordEnabled, setPasswordEnabled] = useState<boolean>(false);
    const [password, setPassword] = useState<string>('');
    const [selectedMemberIDs, setSelectedMemberIDs] = useState<string[]>([]);

    const toggleMember = (userID: string) => {
        setSelectedMemberIDs((prev) =>
            prev.includes(userID)
                ? prev.filter(id => id !== userID)
                : [...prev, userID]
        );
    };

    const handleCreateChannel = async () => {
        const newChannelData = {
            name: channelName,
            isPrivate,
            isDM: false,
            password: isPrivate && passwordEnabled ? password : null,  // Set password only for private channels if enabled
            token,
            memberIDs: isPrivate ? selectedMemberIDs : [],  // Only include members if private
        };
        const response = await axios.post('http://localhost:3001/chat/channel', {newChannelData})
        console.log('check front', response)
        socket.emit('newChannel', response.data);
        resetForm();
        setSelectedChannel(response.data)
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
        <>
            {/* Always-visible button */}
            <button className="new-channel-button" onClick={() => setIsCreating(true)}>
                Create New Channel
            </button>

            {/* Overlay and form */}
            {isCreating && (
                <div className="new-channel-overlay">
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
                                    onChange={() => {
                                        setIsPrivate(false);
                                        setPasswordEnabled(false);
                                    }}
                                />
                                Public
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="channelType"
                                    checked={isPrivate}
                                    onChange={() => {
                                        setIsPrivate(true);
                                        setPasswordEnabled(false);
                                        setPassword('');
                                    }}
                                />
                                Private
                            </label>
                        </div>
                        {isPrivate && (
                            <div>
                                <h4>Add Members:</h4>
                                {friends.map((friend) => (
                                    <label key={friend.ID}>
                                        <input
                                            type="checkbox"
                                            checked={selectedMemberIDs.includes(friend.ID)}
                                            onChange={() => toggleMember(friend.ID)}
                                        />
                                        {friend.username}
                                    </label>
                                ))}
                            </div>
                        )}
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
                                {passwordEnabled && (
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                )}
                            </div>
                        )}
                        <button onClick={handleCreateChannel}>Done</button>
                        <button onClick={resetForm}>Cancel</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default NewChannel;
