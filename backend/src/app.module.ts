import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { LoginModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { AchievementService } from './user/achievement.service';

@Module({
  imports: [PrismaModule, LoginModule, UserModule, ChatModule, GameModule],
  providers: [],
  exports: [],
  controllers: [],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly achievementService: AchievementService) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.achievementService.initializeAchievements();
  }
}
