import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':ID')
  async getUserProfileByUserID(@Param('ID') ID: string): Promise<User | null> {
    return this.userService.getUserProfileByUserID(Number(ID));
  }
  
  @Post()
  async createUser(@Body() body: { username: string }): Promise<User> {
    return this.userService.createUser(body.username);
  }

  @Post(':ID/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @Param('ID', ParseIntPipe) userID: number,
    @UploadedFile() file: Multer.File) {
      const fileBuffer = file.buffer;
      return this.userService.updateAvatar(userID, fileBuffer);
  }
  
  @Patch(':ID')
  async changeUsername(
    @Param('ID', ParseIntPipe) userID: number,
    @Body('username') newUsername: string,) {
      return this.userService.updateUsername(userID, newUsername);
  }

  @Patch(':ID/2fa')
  async toggleTwoFactorAuth(
    @Param('ID', ParseIntPipe) userID: number,
    @Body() { enable }: { enable: boolean } ) {
      return this.userService.toggle2FA(userID, enable);
  }
}
