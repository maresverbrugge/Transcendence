import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { User, Match } from '@prisma/client'

@Injectable()
export class GameService {
	constructor(
        private prisma: PrismaService,
        private readonly userService: UserService
    ) {}
	async newGame(socketID: string) : Promise<Match | null> {
		const member: User = await this.userService.getUserBySocketID(socketID);
		const newGame: Match = await this.prisma.match.create({
			data: {
				status: "PENDING",
				players: {
					connect: member
				}
			}
		});
		return newGame
	}
}
