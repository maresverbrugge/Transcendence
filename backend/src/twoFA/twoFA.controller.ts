import { Controller, Post, Body } from '@nestjs/common';
import { TwoFAService } from './twoFA.service';

@Controller('2-fa')
export class LoginController {
  constructor(private readonly loginService: TwoFAService) {}

  @Post('callback')
  async callback(@Body() body: { code: string; state: string }) {
	console.log("2FA controller");
	return;
  }
}
