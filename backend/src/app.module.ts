import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { LoginModule } from './login/login.module';
import { GameGateway } from './game/game.gateway';

@Module({
  imports: [PrismaModule, LoginModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, GameGateway],
  exports: [PrismaService],
})
export class AppModule {}
