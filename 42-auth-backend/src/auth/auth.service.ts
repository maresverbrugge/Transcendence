import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuthService {
  async getToken(code: string): Promise<any> {
    const clientId = 'your_client_id';
    const clientSecret = 'your_client_secret';
    const redirectUri = 'http://localhost:3000/oauth/callback';

    const response = await axios.post('https://api.intra.42.fr/oauth/token', {
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    });

    return response.data;
  }
}
