import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { User, Statistics } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('userID/:token')
  async getUserIDByToken(@Param('token') token: string): Promise<number> {
    return this.userService.getUserIDByToken(token);
  }

  @Get('profile/:token')
  async getUserProfileByUserID(@Param('token') token: string): Promise<User> {
    return this.userService.getUserProfileByToken(token);
  }

  @Post(':token/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @Param('token') token: string,
    @UploadedFile() file: Multer.File) : Promise<User> {
      const fileBuffer = file.buffer;
      return this.userService.updateAvatar(token, fileBuffer);
  }

  @Patch(':token')
  async changeUsername(
    @Param('token') token: string,
    @Body('username') newUsername: string,) : Promise<User> {
      return this.userService.updateUsername(token, newUsername);
  }

  @Patch(':token/2fa')
  async toggleTwoFactorAuth(
    @Param('token') token: string,
    @Body() { enable }: { enable: boolean }) : Promise<User> {
      return this.userService.toggle2FA(token, enable);
  }

  @Get(':userID/stats')
  async getUserStats(@Param('userID', ParseIntPipe) userID: number): Promise<Statistics> {
    return this.userService.getUserStats(userID);
  }
}
