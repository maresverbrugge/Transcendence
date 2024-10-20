import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { redirect } from 'react-router-dom';

// More info on this section here: https://api.intra.42.fr/apidoc/guides/web_application_flow

@Injectable()
export class LoginService {
  async getToken(response_code: string): Promise<any> {
    const clientId = process.env.REACT_APP_LOGIN_CLIENT_ID;
    const clientSecret = process.env.REACT_APP_LOGIN_CLIENT_SECRET;
    const redirectUri = 'http://localhost:3000/game';

    try {
      const response = await axios.post('https://api.intra.42.fr/oauth/token', {
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code: response_code,
        redirect_uri: redirectUri,
      });
      return response.data;
    } catch (error) {
      console.error('Error during token exchange:', error.response ? error.response.data : error.message);
      throw error;
    }

  }
}
