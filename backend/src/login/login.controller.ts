// Controller for the login module

import { Controller, Post, Body } from '@nestjs/common';
import { LoginService } from './login.service';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post('callback')
  async callback(@Body() body: { code: string; state: string }) {
    const { code, state } = body;
    const tokenData = await this.loginService.getToken(code);
    return tokenData;
  }
}
