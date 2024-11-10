import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { LoginService } from './login.service';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post('callback')
  async callback(@Body() body: { code: string; state: string }) {
    const { code, state } = body;
    if (state !== process.env.REACT_APP_LOGIN_STATE) {
      throw new BadRequestException('Invalid state');
    }
    const token = await this.loginService.getToken(code);
    return token;
  }
}
