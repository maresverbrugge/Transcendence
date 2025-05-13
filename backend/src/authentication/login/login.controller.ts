import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { LoginService } from './login.service';
import { GatewayService } from '../../chat/gateway/gateway.service';

@Controller('login')
export class LoginController {
  constructor(
    private readonly loginService: LoginService,
    private readonly gatewayService: GatewayService,
  ) {}

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
    await this.loginService.storeUserInCache(token, userID, expiresInSeconds * 1000);
    this.gatewayService.updateUserStatus(userID, 'ONLINE');
  }

  @Post('offline')
  async offline(@Body() body: { token: string }) {
    const { token } = body;
    const userID = await this.loginService.getUserIDFromCache(token);
    await this.loginService.setUserStatusToOffline(userID);
    await this.loginService.removeUserFromCache(token);
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
