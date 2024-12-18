import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Statistics } from '@prisma/client'
import { LoginService } from '../authentication//login/login.service';

interface UserProfile extends User {
  avatarURL: string;
}

interface fullStatistics extends Statistics {
  winRate: number;
}

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly loginService: LoginService,
  ) {}

  async getUserIDByToken(token: string): Promise<number> {
    const intraUsername = await this.loginService.getIntraName(token);
    const user = await this.prisma.user.findUnique({
      where: {
        intraUsername: intraUsername,
      },
      select: {
        ID: true,
      },
    });
    if (!user) throw new NotFoundException("User not found");
    return user.ID;
  } //! make sure to catch where calling this function

  async getUserProfileByToken(token: string): Promise<UserProfile> {
    const intraName = await this.loginService.getIntraName(token);
    console.log("intraName = ", intraName);

    if (!intraName)
      throw new NotFoundException('intraUsername not found');

    const user = await this.prisma.user.findUnique({
      where: { intraUsername: intraName },
    });
    console.log("user = ", user);

    if (!user)
      throw new NotFoundException("User not found!");

    // console.log("FROM SERVICE.TS: user.avatar = ", user.avatar);
    const avatarURL = user.avatar
      ? `data:image/jpeg;base64,${user.avatar.toString('base64')}`
      : 'http://localhost:3001/images/default-avatar.png';

    // console.log("FROM SERVICE.TS: avatarURL = ", avatarURL);

    return {
      ...user,
      avatarURL, // Attach either the user's avatar or the default avatar URL
    };
  }

  async updateUsername(token: string, newUsername: string): Promise<User> {
    try {
      const intraUsername = await this.loginService.getIntraName(token);
      const updatedUser = await this.prisma.user.update({
        where: { intraUsername: intraUsername },
        data: { username: newUsername },
      });
      return updatedUser;
    } catch (error) {
      throw new Error('Error updating username');
    }
  }

  async updateAvatar(token: string, avatar: Buffer): Promise<User> {
    const intraUsername = await this.loginService.getIntraName(token);
    return await this.prisma.user.update({
        where: { intraUsername: intraUsername },
        data: { avatar },
    });
  }

  async toggle2FA(token: string, enable: boolean): Promise<User> {
    const intraUsername = await this.loginService.getIntraName(token);
    return await this.prisma.user.update({
      where: { intraUsername: intraUsername },
        data: { Enabled2FA: enable },
    });
  }

  async getUserStats(userID: number): Promise<fullStatistics> {
    const statistics = await this.prisma.statistics.findUnique({
      where: { userID: userID },
    });
    console.log("statistics = ", statistics);

    if (!statistics)
      throw new NotFoundException("Statistics not found!");

    const winRate = statistics.gamesPlayed
      ? statistics.wins / statistics.gamesPlayed
      : 0;
    const playerRating = Math.round(winRate * 100 + statistics.totalScores / 10);

    await this.prisma.statistics.update({
      where: { userID },
      data: { ladderRank: playerRating },
    });

    return {
      ...statistics,
      winRate,
      ladderRank: playerRating,
    };
  }

  // FOR LATER: REMOVE CALCULATION LOGIC FROM getUserStats FUNCTION
  // TO GAME LOGIC WHENEVER A GAME IS FINISHED
  // IN FUNCTION LOOKING SOMEWHAT LIKE THIS:
  async updateGameStats(userID: number, gameResult: { won: boolean; score: number }): Promise<fullStatistics> {
    // Fetch the current statistics
    const statistics = await this.prisma.statistics.findUnique({
      where: { userID },
    });
  
    if (!statistics) {
      throw new NotFoundException('Statistics not found.');
    }
  
    // Update gamesPlayed, wins, and totalScores based on the game result
    const updatedStats = {
      gamesPlayed: statistics.gamesPlayed + 1,
      wins: gameResult.won ? statistics.wins + 1 : statistics.wins,
      totalScores: statistics.totalScores + gameResult.score,
    };
  
    // Calculate the new ladderRank (playerRating)
    const winRate = updatedStats.gamesPlayed
      ? updatedStats.wins / updatedStats.gamesPlayed
      : 0;
    const playerRating = Math.round(winRate * 100 + updatedStats.totalScores / 10);
  
    // Update the statistics in the database
    const updatedStatistics = await this.prisma.statistics.update({
      where: { userID },
      data: { ...updatedStats, ladderRank: playerRating },
    });
  
    return {
      ...updatedStatistics,
      winRate,
      ladderRank: playerRating,
    };
  }

  async getLeaderboard(): Promise<{ username: string; rank: number; avatarURL: string; ladderRank: number }[]> {
    const leaderboard = await this.prisma.statistics.findMany({
      orderBy: { ladderRank: 'desc' },
      take: 10, // Top 10 players
      select: {
        user: {
          select: { username: true, avatar: true },
        },
        ladderRank: true
      },
    });
  
    return leaderboard.map((entry, index) => ({
      rank: index + 1,
      username: entry.user.username,
      avatarURL: entry.user.avatar
        ? `data:image/jpeg;base64,${entry.user.avatar.toString('base64')}`
        : 'http://localhost:3001/images/default-avatar.png', // Fallback avatar
      ladderRank: entry.ladderRank,
    }));
  }
}
