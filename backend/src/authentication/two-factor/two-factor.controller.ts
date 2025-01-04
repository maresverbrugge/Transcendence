import { Controller, Post, Body } from '@nestjs/common';

import { TwoFactorService } from './two-factor.service';
import { LoginService } from '../login/login.service';
import { OneTimePasswordPipe } from './pipes/one-time-password.pipe';

@Controller('two-factor')
export class TwoFactorController {
  constructor(
    private readonly twoFactorService: TwoFactorService,
    private readonly loginService: LoginService
  ) {}

  @Post('qrcode')
  async qrcode(@Body() body: { token: string }) {
    const { token } = body;
    const userID = await this.loginService.getUserFromCache(token);
    const qrcode = await this.twoFactorService.getQRCode(userID);
    return qrcode;
  }

  @Post('is-enabled')
  async isEnabled(@Body() body: { token: string }) {
    const { token } = body;
    const userID = await this.loginService.getUserFromCache(token);
    const isEnabled = await this.twoFactorService.isTwoFactorEnabled(userID);
    return isEnabled;
  }

  @Post('verify')
  async verify(
    @Body('oneTimePassword', OneTimePasswordPipe) oneTimePassword: string,
    @Body('token') token: string,
  ) {
    const userID = await this.loginService.getUserFromCache(token);
    const verified = await this.twoFactorService.verifyOneTimePassword(
      oneTimePassword,
      userID,
    );
    return verified;
  }

  @Post('enable')
  async enable(@Body() body: { token: string }) {
    const { token } = body;
    const userID = await this.loginService.getUserFromCache(token);
    await this.twoFactorService.enableTwoFactor(userID);
  }

  @Post('disable')
  async disable(@Body() body: { token: string }) {
    const { token } = body;
    const userID = await this.loginService.getUserFromCache(token);
    await this.twoFactorService.disableTwoFactor(userID);
  }
}
