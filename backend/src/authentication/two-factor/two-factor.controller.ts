import { Controller, Post, Get, Body } from '@nestjs/common';
import { TwoFactorService } from './two-factor.service';

@Controller('two-factor')
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @Get('qrcode')
  async qrcode(@Body() body: { userID: number }) {
    const { userID } = body;
    const qrcode = await this.twoFactorService.getQRCode(userID);
    return qrcode
  }

  @Post('verify')
  async verify(@Body() body: { oneTimePassword: string, userID: number }) {
    const { oneTimePassword, userID } = body;
    const verified = await this.twoFactorService.verifyOneTimePassword(oneTimePassword, userID);
    return verified
  }

  @Post('enable')
  async enable(@Body() body: { userID: number }) {
    const { userID } = body;
    await this.twoFactorService.enableTwoFactor(userID);
  }

  @Post('disable')
  async disable(@Body() body: { userID: number }) {
    const { userID } = body;
    await this.twoFactorService.disableTwoFactor(userID);
  }
}
