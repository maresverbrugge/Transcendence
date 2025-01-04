import { Controller, Post, Body, BadRequestException } from '@nestjs/common';

import { LoginService } from './login.service';
import { UserService } from 'src/user/user.service';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService, private readonly userService: UserService) {}

  @Post('get-token')
  async getToken(@Body() body: { code: string; state: string }) {
    const { code, state } = body;
    if (state !== process.env.REACT_APP_LOGIN_STATE) {
      throw new BadRequestException('Invalid state');
    }
    const token = await this.loginService.getToken(code);
    return token;
  }

  @Post('online')
  async online(@Body() body: { token: string }) {
    const { token } = body;
    const user = await this.loginService.getIntraName(token);
    this.loginService.addUserToDatabase(user);
    const userID = await this.userService.getUserIDByIntraUsername(user);
    const expiresInSeconds = await this.loginService.getExpiresInSeconds(token);
    this.loginService.storeUserInCache(token, userID, expiresInSeconds);
  }

  @Post('offline')
  async offline(@Body() body: { token: string }) {
    const { token } = body;
    const user = await this.loginService.getIntraName(token);
    this.loginService.setUserStatusToOffline(user);
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
