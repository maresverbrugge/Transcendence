import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/account/:id')
  async getUserByUserId(@Param('id') id: string): Promise<User | null> {
    return this.userService.getUserByUserId(Number(id));
  }

  @Get(':id')
  async getUserProfileByUserId(@Param('id') id: string): Promise<User | null> {
    return this.userService.getUserProfileByUserId(Number(id));
  }
  
  @Post()
  async createUser(@Body() body: { username: string }): Promise<User> {
    return this.userService.createUser(body.username);
  }

  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @Param('id', ParseIntPipe) userID: number,
    @UploadedFile() file: Multer.File) {
      const fileBuffer = file.buffer;
      return this.userService.updateAvatar(userID, fileBuffer);
  }
  
  @Patch(':id')
  async changeUsername(
    @Param('id', ParseIntPipe) userId: number,
    @Body('username') newUsername: string,) {
      return this.userService.updateUsername(userId, newUsername);
  }
}
