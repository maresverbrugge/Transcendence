import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { User } from '@prisma/client';
import { UserService, UserProfile, UserAccount, StatisticsData, MatchHistoryData, LeaderboardData, AchievementData } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('userID/:token')
  async getUserIDByToken(@Param('token') token: string): Promise<number> {
    return this.userService.getUserIDByToken(token);
  }

  @Get('account/:token')
  async getUserAccountByToken(@Param('token') token: string): Promise<UserAccount> {
    return this.userService.getUserAccountByToken(token);  }

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

  @Get(':userID/achievements')
  async getUserAchievements(@Param('userID', ParseIntPipe) userID: number): Promise<AchievementData[]> {
    return this.userService.getUserAchievements(userID);
  }

  @Get('profile/:userID')
  async getUserProfileByUserID(@Param('userID', ParseIntPipe) userID: number): Promise<UserProfile> {
    return this.userService.getUserProfileByUserID(userID);
  }

  @Get(':currentUserID/friend/:targetUserID')
  async getFriendshipStatus(
    @Param('currentUserID', ParseIntPipe) currentUserID: number,
    @Param('targetUserID', ParseIntPipe) targetUserID: number ): Promise<{ isFriend: boolean }> {
      const isFriend = await this.userService.getFriendshipStatus(currentUserID, targetUserID);
      return { isFriend };
  }

  @Patch(':currentUserID/friend/:targetUserID')
  async toggleFriendship(
    @Param('currentUserID', ParseIntPipe) currentUserID: number,
    @Param('targetUserID', ParseIntPipe) targetUserID: number ): Promise<string> {
    return this.userService.toggleFriendship(currentUserID, targetUserID);
  }
}
