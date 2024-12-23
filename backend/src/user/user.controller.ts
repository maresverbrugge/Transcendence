import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { User } from '@prisma/client';
import { UserProfile, StatisticsData, MatchHistoryData, LeaderboardData } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('userID/:token')
  async getUserIDByToken(@Param('token') token: string): Promise<number> {
    return this.userService.getUserIDByToken(token);
  }

  @Get('profile/:token')
  async getUserProfileByToken(@Param('token') token: string): Promise<UserProfile> {
    return this.userService.getUserProfileByToken(token);
  }

  @Post(':token/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @Param('token') token: string,
    @UploadedFile() file: Multer.File) : Promise<User> {
      const fileBuffer = file.buffer;
      return this.userService.updateAvatar(token, fileBuffer);
  }

  @Patch(':token')
  async changeUsername(
    @Param('token') token: string,
    @Body('username') newUsername: string,) : Promise<User> {
      return this.userService.updateUsername(token, newUsername);
  }

  @Patch(':token/2fa')
  async toggleTwoFactorAuth(
    @Param('token') token: string,
    @Body() { enable }: { enable: boolean }) : Promise<User> {
      return this.userService.toggle2FA(token, enable);
  }

  @Get(':userID/stats')
  async getUserStats(@Param('userID', ParseIntPipe) userID: number): Promise<StatisticsData> {
    return this.userService.getUserStats(userID);
  }

  @Get(':userID/match-history')
  async getMatchHistory(@Param('userID', ParseIntPipe) userID: number): Promise<MatchHistoryData[]> {
    return this.userService.getMatchHistory(userID);
  }

  @Get('leaderboard')
  async getLeaderboard(): Promise<LeaderboardData[]> {
    return this.userService.getLeaderboard();
  }
}
