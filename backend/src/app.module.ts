import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { CommunicationGateway } from './communication/communication.gateway';
import { CommunicationService } from './communication/communication.service';

@Module({
  imports: [PrismaModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, CommunicationGateway, CommunicationService],
  exports: [PrismaService],
})
export class AppModule {}
