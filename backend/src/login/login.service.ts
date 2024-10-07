// Service to get the token from the 42 API.

import { Injectable } from '@nestjs/common';
import axios from 'axios';


// Using three parameters to get the token from the 42 API:
// - The client uid, an unique identifier for your application.
// - The client secret, an secret passphrase for your application, 
// which must be kept secret, and only used on server side, where users can't see it.
// - The redirect uri, an uri to redirect the user after the authentication process.

// You're almost here ! The last thing to do is a POST request to the https://api.intra.42.fr/oauth/token endpoint,
// with your client_id, your client_secret, the previous code and your redirect_uri. 
// This request must be performed on server side, over a secure connexion.

@Injectable()
export class LoginService {
  async getToken(code: string): Promise<any> {
    const clientId = 'u-s4t2ud-44ff70cec9bab3625920e531e276724bfc868e5ec663c53d1a73a93d465e03ce'; 
    const clientSecret = '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'; 
    const redirectUri = 'http://localhost:3000/login/callback';
    
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
