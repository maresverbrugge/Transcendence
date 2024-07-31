// src/auth/auth.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('callback')
  async callback(@Body() body: { code: string; state: string }) {
    const { code, state } = body;
    const tokenData = await this.authService.getToken(code);
    return tokenData;
  }
}
