import { Controller, Post, Get, Body } from '@nestjs/common';
import { TwoFactorService } from './two-factor.service';
import { UserService } from 'src/user/user.service';

@Controller('two-factor')
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService, private readonly userService: UserService) {}

  @Post('qrcode')
  async qrcode(@Body() body: { userID: number }) {
    const { userID } = body;
    const qrcode = await this.twoFactorService.getQRCode(userID);
    return qrcode
  }

  @Post('is-enabled')
  async isEnabled(@Body() body: { intraName: string }) {
    const { intraName } = body;
    const userID = await this.userService.getUserIDByIntraUsername(intraName);
    const isEnabled = await this.twoFactorService.isTwoFactorEnabled(userID);
    return { userID, isEnabled }
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
