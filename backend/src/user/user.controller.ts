import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getUserByUserId(@Param('id') id: string): Promise<User | null> {
    return this.userService.getUserByUserId(Number(id));
  }

  @Get('/images/:image_name')
  async getImage(@Param('image_name') image_name: string){
    return this.userService.getImage(image_name);
  }

  @Post()
  async createUser(@Body() body: { username: string }): Promise<User> {
    return this.userService.createUser(body.username);
  }

  @Patch(':id')
  async changeUsername(
    @Param('id', ParseIntPipe) userId: number,
    @Body('username') newUsername: string,) {
      return this.userService.updateUsername(userId, newUsername);
  }
}
