import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { LoginService } from './login.service';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post('get-token')
  async getToken(@Body() body: { code: string; state: string }) {
    const { code, state } = body;
    if (state !== process.env.REACT_APP_LOGIN_STATE) {
      throw new BadRequestException('Invalid state');
    }
    const token = await this.loginService.getToken(code);
    const user = await this.loginService.getIntraName(token.access_token);
    return { token, user };
  }

  @Post('online')
  async online(@Body() body: { token: string }) {
    const { token } = body;
    const user = await this.loginService.getIntraName(token);
    this.loginService.addUserToDatabase(user);
  }

  @Post('offline')
  async offline(@Body() body: { userID: number }) {
    const { userID } = body;
    this.loginService.setUserStatusToOffline(userID);
  }


  @Post('verify-token')
  async verify(@Body() body: { token: string }) {
    const { token } = body;
    const verified = await this.loginService.verifyToken(token);
    return verified;
  }

  @Post('intra-name')
  async getIntraLogin(@Body() body: { token: string }) {
    const { token } = body;
    const login = await this.loginService.getIntraName(token);
    return login;
  }
}
