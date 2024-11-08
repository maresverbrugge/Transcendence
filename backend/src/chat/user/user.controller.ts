import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from './user.service';


@Controller('user')
export class UserController {

    constructor(
        private readonly prisma: PrismaService,
        private readonly userService: UserService
      ) {}

    @Get('/id/:token')
    async getChannel(@Param('token') token: string) {
      return this.userService.getUserIDBySocketID(token) //later veranderen naar Token
    }
}
