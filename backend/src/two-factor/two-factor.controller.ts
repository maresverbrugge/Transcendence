import { Controller, Post, Body } from '@nestjs/common';
import { TwoFactorService } from './two-factor.service';

@Controller('two-factor')
export class TwoFactorController {
constructor(private readonly twoFactorService: TwoFactorService) {}

  @Post('callback')
  async callback(@Body() body: { something: string }) {
	const { something } = body;
    console.log("2FA controller!");
	const qrcode = await this.twoFactorService.getQRCode(something);
	return qrcode
  }

//   @Post('verify')
//   async verify(@Body() body: { token: string; secret: string }) {
}
