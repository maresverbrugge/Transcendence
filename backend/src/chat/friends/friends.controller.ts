import { Controller, Get, Param, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Controller('chat/friends')
export class FriendsController {

    constructor(private readonly prisma: PrismaService) {}

    @Get(':userID')
    async getFriendList(@Param('userID') userID: string) {  // tijdelijke hardcode totdat token werkt
      const user = await this.prisma.user.findFirst({       // hieronder is de juiste code
        include: { friends: true },                         //
      });
      // const user = await this.prisma.user.findUnique({
      //   where: { id: parseInt(userID, 10) },
      //   include: { friends: true },
      // });
    
      if (!user) {
        throw new NotFoundException('User not found');
      }
    
      return user.friends;
    }
}
