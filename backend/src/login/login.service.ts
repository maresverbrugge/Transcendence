import { Injectable } from '@nestjs/common';
import axios from 'axios';

// You're almost here ! The last thing to do is a POST request to the https://api.intra.42.fr/oauth/token endpoint,
// with your client_id, your client_secret, the previous code and your redirect_uri. 
// This request must be performed on server side, over a secure connexion.

@Injectable()
export class LoginService {
  async getToken(code: string): Promise<any> {
    const clientId = process.env.REACT_APP_LOGIN_CLIENT_ID;
    const clientSecret = process.env.REACT_APP_LOGIN_CLIENT_SECRET;
    const redirectUri = 'http://localhost:3001/login/callback';
    
    const response = await axios.post('https://api.intra.42.fr/oauth/token', {
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    });

    return response.data;
  }
}
