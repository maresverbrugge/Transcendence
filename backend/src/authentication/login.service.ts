import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
      console.log("clientId = ", clientId);
      console.log("clientSecret = ", clientSecret);
      // Request the token from the 42 API
      const response = await axios.post('https://api.intra.42.fr/oauth/token', {
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code: response_code,
        redirect_uri: redirectUri,
      });
      // Return the token to the controller
      return response.data;
    } catch (error) {
      var message = error.response ? error.response.data : error.message;
      console.error('Error during token exchange:', message);
      throw new InternalServerErrorException('Error during token exchange');
    }
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await axios.get('https://api.intra.42.fr/oauth/token/info', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.data || !response.data["expires_in_seconds"]) {
        return false
      }
      else if (response.data["expires_in_seconds"] <= 0) {
        return false;
      }
      else {
        return true;
      }
    }
    catch(error) {
      var message = error.response ? error.response.data : error.message;
      console.error('Error while verifying token:', message);
      return false;
    };
  }

  async getIntraName(token: string): Promise<string> {
    try {
      const response = await axios.get('https://api.intra.42.fr/v2/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data.login;
    }
    catch(error) {
      var message = error.response ? error.response.data : error.message;
      console.error('Error while getting intra name:', message);
      return null;
    };
  }
}

