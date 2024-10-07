// Controller for the login module

import { Controller, Post, Body } from '@nestjs/common';
import { LoginService } from './login.service';

const original_state = "unguessable_state_string_wow"

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post('callback')
  async callback(@Body() body: { code: string; state: string }) {
    const { code, state } = body;
    if (state !== original_state) {
      throw new Error('Invalid state'); // Is this necessary?
    }
    const tokenData = await this.loginService.getToken(code);
    return tokenData;
  }
}
