import { Controller, Post, Body, BadRequestException } from '@nestjs/common';

import { LoginService } from './login.service';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post('get-token')
  async getToken(@Body() body: { code: string; state: string }) {
    const { code, state } = body;
    if (state !== process.env.LOGIN_STATE) {
      throw new BadRequestException('Invalid state');
    }
    const token = await this.loginService.getToken(code);
    return token;
  }

  @Post('online')
  async online(@Body() body: { token: string }) {
    const { token } = body;
    const user = await this.loginService.getIntraName(token);
    await this.loginService.addUserToDatabase(user);
    const userID = await this.loginService.getUserIDByIntraUsername(user);
    const expiresInSeconds = await this.loginService.getExpiresInSeconds(token);
    this.loginService.storeUserInCache(token, userID, expiresInSeconds * 1000);
  }

  @Post('offline')
  async offline(@Body() body: { token: string }) {
    const { token } = body;
    const userID = await this.loginService.getUserIDFromCache(token);
    this.loginService.setUserStatusToOffline(userID);
    this.loginService.removeUserFromCache(token);
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
