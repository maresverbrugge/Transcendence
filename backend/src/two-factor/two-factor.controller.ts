import { Controller, Post, Body } from '@nestjs/common';
import { TwoFactorService } from './two-factor.service';

@Controller('two-factor')
export class TwoFactorController {
constructor(private readonly twoFactorService: TwoFactorService) {}

  @Post('callback')
  async callback(@Body() body: { something: string }) {
	const { something } = body;
    console.log("2FA controller!");
	const response = await this.twoFactorService.doStuff(something);
  }
}
