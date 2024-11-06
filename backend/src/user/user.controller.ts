import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // GET /user/:id - Retrieve a user by ID
  @Get(':id')
  async getUserByUserId(@Param('id') id: string): Promise<User | null> {
    return this.userService.getUserByUserId(Number(id));
  }

  // POST /user - Create a new user
  @Post()
  async createUser(@Body() body: { username: string }): Promise<User> {
    return this.userService.createUser(body.username);
  }

  // PATCH /user/:id - Update user profile
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() data: Partial<User>
  ): Promise<User> {
    return this.userService.updateUser(Number(id), data);
  }
}
