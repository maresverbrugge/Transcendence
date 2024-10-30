import { Controller, Get, Param, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Controller('chat/friends')
export class FriendsController {

    constructor(private readonly prisma: PrismaService) {}

    @Get(':token')
    async getFriendList(@Param('token') token: string) {
      const user = await this.prisma.user.findUnique({
        where: { websocketId: token }, //later veranderen naar token
        include: { friends: true },
      });
    
      if (!user) {
        throw new NotFoundException('User not found');
      }
    
      return user.friends;
    }
}
