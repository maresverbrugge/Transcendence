import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // GET /user/:id - Get a user by ID
  @Get(':id')
  async getUserByUserId(@Param('id') id: string): Promise<User | null> {
    return this.userService.getUserByUserId(Number(id));
  }

  // POST /user - Create a new user
  @Post()
  async createUser(@Body() body: { username: string }): Promise<User> {
    return this.userService.createUser(body.username);
  }

  // PATCH /user/:id - Change Username
  @Patch(':id')
  async changeUsername(
    @Param('id', ParseIntPipe) userId: number,
    @Body('username') newUsername: string,
  ) {
    return this.userService.updateUsername(userId, newUsername);
  }
}
