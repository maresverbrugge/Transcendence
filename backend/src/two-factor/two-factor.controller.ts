import { Controller, Post, Get, Body } from '@nestjs/common';
import { TwoFactorService } from './two-factor.service';

@Controller('two-factor')
export class TwoFactorController {
constructor(private readonly twoFactorService: TwoFactorService) {}

  @Get('qrcode')
  async qrcode() {
    console.log("2FA controller qrcode!");
	const qrcode = await this.twoFactorService.getQRCode();
	return qrcode
  }

  @Post('verify')
  async verify(@Body() body: { oneTimePassword: string }) {
	const { oneTimePassword } = body;
	console.log("2FA controller verify!");
	const verified = await this.twoFactorService.verifyOneTimePassword(oneTimePassword);
	return verified
  }
}
