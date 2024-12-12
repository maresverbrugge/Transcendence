import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':token')
  async getUserProfileByUserID(@Param('token') token: string): Promise<User | null> {
    return this.userService.getUserProfileByUserID(token);
  }
  
  @Post()
  async createUser(@Body() body: { username: string }): Promise<User> {
    return this.userService.createUser(body.username);
  }

  @Post(':token/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @Param('token') token: string,
    @UploadedFile() file: Express.Multer.File) {
      const fileBuffer = file.buffer;
      return this.userService.updateAvatar(token, fileBuffer);
  }
  
  @Patch(':token')
  async changeUsername(
    @Param('token') token: string,
    @Body('username') newUsername: string,) {
      return this.userService.updateUsername(token, newUsername);
  }

  @Patch(':token/2fa')
  async toggleTwoFactorAuth(
    @Param('token') token: string,
    @Body() { enable }: { enable: boolean } ) {
      return this.userService.toggle2FA(token, enable);
  }
}
