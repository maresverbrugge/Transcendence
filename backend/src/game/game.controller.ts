import { Controller, Get, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';

@Controller('game/matches')
export class GameController {
  constructor(
	private readonly prisma: PrismaService
  ) {}
}
