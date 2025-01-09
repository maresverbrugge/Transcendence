import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, UploadedFile, UseInterceptors, NotFoundException, ForbiddenException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { UsernameValidationPipe } from './pipes/username-validation.pipe';
import { AvatarValidationPipe } from './pipes/avatar-validation.pipe';

import {
  UserAccount,
  UserProfile,
  UserFriend,
  UploadedFileType,
  StatisticsData,
  LeaderboardData,
  MatchHistoryData,
  AchievementData,
} from './interfaces';

import { UserService } from './user.service';
import { LoginService } from '../authentication/login/login.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService,
    private readonly loginService: LoginService
  ) {}

  @Get('getID/:token')
  async getUserIDFromCache(@Param('token') token: string): Promise<number> {
    return this.loginService.getUserIDFromCache(token);
  }

  @Get('account/:token')
  async getUserAccountByToken(@Param('token') token: string): Promise<UserAccount> {
    return this.userService.getUserAccountByToken(token);
  }

  @Get('profile/:profileUserID/:token')
  async getUserProfileByUserID(@Param('profileUserID', ParseIntPipe) profileUserID: number, @Param('token') token: string): Promise<UserProfile> {
    return this.userService.getUserProfileByUserID(profileUserID, token);
  }

  @Post('avatar/:token')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(@Param('token') token: string, @UploadedFile(AvatarValidationPipe) file: UploadedFileType): Promise<User> {
    return this.userService.updateAvatar(token, file.buffer);
  }

  @Patch('username/:token')
  async changeUsername(@Param('token') token: string, @Body('username', UsernameValidationPipe) newUsername: string): Promise<User> {
    return this.userService.updateUsername(token, newUsername);
  }

  @Get('leaderboard/:token')
  async getLeaderboardData(@Param('token') token: string): Promise<LeaderboardData[]> {
    await this.loginService.getUserIDFromCache(token);
    return this.userService.getLeaderboard();
  }

  @Get(':userID/stats/:token')
  async getUserStats(@Param('token') token: string, @Param('userID', ParseIntPipe) userID: number): Promise<StatisticsData> {
    await this.loginService.getUserIDFromCache(token);
    return this.userService.getUserStats(userID);
  }

  @Get(':userID/match-history/:token')
  async getMatchHistory(@Param('token') token: string, @Param('userID', ParseIntPipe) userID: number): Promise<MatchHistoryData[]> {
    await this.loginService.getUserIDFromCache(token);
    return this.userService.getMatchHistory(userID);
  }

  @Get(':userID/achievements/:token')
  async getUserAchievements(@Param('token') token: string, @Param('userID', ParseIntPipe) userID: number): Promise<AchievementData[]> {
    await this.loginService.getUserIDFromCache(token);
    return this.userService.getUserAchievements(userID);
  }

  @Get('friends/:token')
  async getFriends(@Param('token') token: string): Promise<UserFriend[]> {
    return this.userService.getFriends(token);
  }

  @Get(':targetUserID/friend/:token')
  async getFriendshipStatus(
    @Param('targetUserID', ParseIntPipe) targetUserID: number,
    @Param('token') token: string
  ): Promise<{ isFriend: boolean }> {
    const isFriend = await this.userService.getFriendshipStatus(token, targetUserID);
    return { isFriend };
  }

  @Patch(':targetUserID/friend/:token')
  async toggleFriendship(
    @Param('targetUserID', ParseIntPipe) targetUserID: number,
    @Param('token') token: string
  ): Promise<string> {
    return this.userService.toggleFriendship(token, targetUserID);
  }
}
