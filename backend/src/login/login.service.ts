import { Injectable } from '@nestjs/common';
import axios from 'axios';

// More info on this section here: https://api.intra.42.fr/apidoc/guides/web_application_flow

@Injectable()
export class LoginService {
  async getToken(response_code: string): Promise<any> {
    // Load the environment variables needed for the login process
    const clientId = process.env.REACT_APP_LOGIN_CLIENT_ID;
    const clientSecret = process.env.REACT_APP_LOGIN_CLIENT_SECRET;
    const redirectUri = 'http://localhost:3000/login/redirect';

    try {
      // Request the token from the 42 API
      const response = await axios.post('https://api.intra.42.fr/oauth/token', {
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code: response_code,
        redirect_uri: redirectUri,
      });
      // Return the token data to the controller
      return response.data;
    } catch (error) {
      console.error('Error during token exchange:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
}
