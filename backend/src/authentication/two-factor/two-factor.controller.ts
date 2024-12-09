import { Controller, Post, Get, Body } from '@nestjs/common';
import { TwoFactorService } from './two-factor.service';
import { LoginService } from '../login/login.service';

@Controller('two-factor')
export class TwoFactorController {

  constructor(
    private readonly twoFactorService: TwoFactorService, 
    private readonly loginService: LoginService
  ) {}

  @Post('qrcode')
  async qrcode(@Body() body: { token: string }) {
    const { token } = body;
    const intraUsername = await this.loginService.getIntraName(token);
    const qrcode = await this.twoFactorService.getQRCode(intraUsername);
    return qrcode
  }

  @Post('is-enabled')
  async isEnabled(@Body() body: { token: string }) {
    const { token } = body;
    const intraUsername = await this.loginService.getIntraName(token);
    const isEnabled = await this.twoFactorService.isTwoFactorEnabled(intraUsername);
    return isEnabled
  }

  @Post('verify')
  async verify(@Body() body: { oneTimePassword: string, token: string }) {
    const { oneTimePassword, token } = body;
    const intraUsername = await this.loginService.getIntraName(token);
    const verified = await this.twoFactorService.verifyOneTimePassword(oneTimePassword, intraUsername);
    return verified
  }

  @Post('enable')
  async enable(@Body() body: { token: string }) {
    const { token } = body;
    const intraUsername = await this.loginService.getIntraName(token);
    await this.twoFactorService.enableTwoFactor(intraUsername);
  }

  @Post('disable')
  async disable(@Body() body: { token: string }) {
    const { token } = body;
    const intraUsername = await this.loginService.getIntraName(token);
    await this.twoFactorService.disableTwoFactor(intraUsername);
  }
}
