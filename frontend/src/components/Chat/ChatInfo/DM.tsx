import React, {useEffect, useState} from 'react';
import { ChannelData, UserData } from '../interfaces';
import axios from 'axios';

interface DMProps {
    channel: ChannelData;
    token: string;
}

const DM = ({ channel, token }): DMProps => {
    const [DMInfo, setDMInfo] = useState<UserData | null>(null)

    useEffect(() => {

        const fetchDMInfo = async  (channelID: number) => {
            try {
                // this is wherea call is made to fetch information for the side panel of a DM,
                // work in progress, maybe a get request to Mares userprofile so i can display some information, or profile picture etc.
                // Mares, what do you think?
                // const response = await axios.get<UserData>(`http://localhost:3001`)
                // setDMInfo(response.data)
            } catch (error) {
                console.error(error)
            }
        }

        fetchDMInfo(channel.ID)
    }, [])

    console.log(channel)
    return (
        <div className="dm-container">
            <h1>
                {channel.name}
            </h1>
        </div>
    );
    
}

export default DM