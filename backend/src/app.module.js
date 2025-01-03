var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { LoginModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { AchievementService } from './user/achievement.service';
let AppModule = class AppModule {
    constructor(achievementService) {
        this.achievementService = achievementService;
    }
    async onApplicationBootstrap() {
        await this.achievementService.initializeAchievements();
        // console.log('Predefined achievements have been initialized.');
    }
};
AppModule = __decorate([
    Module({
        imports: [PrismaModule, LoginModule, UserModule, ChatModule],
        providers: [PrismaService, AchievementService],
        exports: [PrismaService],
        controllers: [],
    }),
    __metadata("design:paramtypes", [AchievementService])
], AppModule);
export { AppModule };
