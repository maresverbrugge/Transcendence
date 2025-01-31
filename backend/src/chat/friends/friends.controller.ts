import { Controller, Get, Param, NotFoundException, Inject, forwardRef} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { LoginService } from 'src/authentication/login/login.service';
import { ErrorHandlingService } from 'src/error-handling/error-handling.service';

@Controller('chat/friends')
export class FriendsController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => LoginService))
    private readonly loginService: LoginService,
    private readonly errorHandlingService: ErrorHandlingService,
  ) {}

  @Get(':token')
  async getFriendList(@Param('token') token: string): Promise<User[]> {
    try {
      const userID = await this.loginService.getUserIDFromCache(token);
      const user = await this.prisma.user.findUnique({
        where: { ID: userID },
        include: { friends: true },
      });
      if (!user) throw new NotFoundException('User not found');
      return user.friends;
    } catch (error) {
      this.errorHandlingService.throwHttpException(error);
    }
  }
}
