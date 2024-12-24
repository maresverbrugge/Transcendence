import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { User, Match } from '@prisma/client';

@Injectable()
export class GameService {
  constructor(
    private prisma: PrismaService,
    private readonly userService: UserService
  ) {}
  matchinstance = {
	  1:
  }
  async newGame(userID1: number, userID2: number): Promise<Match | null> {
    const member1: User = await this.userService.getUserByUserID(userID1);
    const member2: User = await this.userService.getUserByUserID(userID2);
    const newGame: Match = await this.prisma.match.create({
      data: {
        status: 'ACCEPTED',
        players: {
          connect: member1,
	  connect: member2
        },
      },
    });
    return newGame;
  }
  async getPlayers(gameID: number) {
    const game = await this.prisma.match.findUnique({
      where: { matchID: gameID },
      select: {
        players: { select: { ID: true } },
      },
    });
    return game;
  }
}
