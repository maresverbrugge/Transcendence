import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Achievement } from '@prisma/client'

@Injectable()
export class AchievementService {
  constructor(private readonly prisma: PrismaService) {}

  async initializeAchievements(): Promise<void> {
    const predefinedAchievements = [
      { name: 'First Win', description: 'Won for the first time', iconURL: 'http://localhost:3001/images/achievements/1_win.png' },
      { name: '10 Wins', description: 'Won 10 times', iconURL: 'http://localhost:3001/images/achievements/10_wins.png' },
      { name: '100 Wins', description: 'Won 100 times', iconURL: 'http://localhost:3001/images/achievements/100_wins.png' },
      { name: 'Scored 100 XP', description: 'Scored 100 XP', iconURL: 'http://localhost:3001/images/achievements/100_XP.png' },
      { name: 'Scored 1000 XP', description: 'Scored 1000 XP', iconURL: 'http://localhost:3001/images/achievements/1000_XP.png' },
      { name: 'First Game Played', description: 'Played your first game', iconURL: 'http://localhost:3001/images/achievements/first_game.png' },
      { name: 'First Friend', description: 'Made your first friend', iconURL: 'http://localhost:3001/images/achievements/friends_1.png' },
      { name: '10 Friends', description: 'Made 10 friends', iconURL: 'http://localhost:3001/images/achievements/friends_10.png' },
      { name: '50 Friends', description: 'Made 50 friends', iconURL: 'http://localhost:3001/images/achievements/friends_50.png' },
      { name: 'Sent First Message', description: 'Sent your first message', iconURL: 'http://localhost:3001/images/achievements/message_first.png' },
      { name: 'Sent 10 Messages', description: 'Sent 10 messages', iconURL: 'http://localhost:3001/images/achievements/messages_10.png' },
      { name: 'Sent 100 Messages', description: 'Sent 100 messages', iconURL: 'http://localhost:3001/images/achievements/messages_100.png' },
    ];

    for (const achievement of predefinedAchievements) {
      const exists = await this.prisma.achievement.findFirst({
        where: { name: achievement.name },
      });

      if (!exists) {
        await this.prisma.achievement.create({ data: achievement });
        console.log(`Achievement "${achievement.name}" has been created.`);
      }
    }
  }
}
