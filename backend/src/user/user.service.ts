import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Statistics, UserStatus, MatchStatus } from '@prisma/client';

import { LoginService } from '../authentication/login/login.service';

export interface UserAccount extends User {
  avatarURL: string;
}

export interface UserProfile extends User {
  avatarURL: string;
  status: UserStatus;
}

export interface UserFriend {
  ID: number;
  username: string;
  avatarURL: string;
  status: UserStatus;
}

export interface StatisticsData extends Statistics {
  winRate: number;
}

export interface LeaderboardData {
  username: string;
  avatarURL: string;
  ladderRank: number;
  rank: number;
}

export interface MatchHistoryData {
  opponentID: number;
  opponent: string;
  scorePlayer1: number;
  scorePlayer2: number;
  result: string;
}

export interface AchievementData {
  name: string;
  description: string;
  iconURL: string;
  unlocked: boolean;
}

interface Match {
  players: { ID: number; username: string }[];
  scorePlayer1: number;
  scorePlayer2: number;
  status: MatchStatus;
}

interface LeaderboardEntry {
  user: { username: string; avatar: Buffer | null };
  ladderRank: number;
}

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly loginService: LoginService
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
    if (!user) throw new NotFoundException('User not found');
    return user.ID;
  } //! make sure to catch where calling this function

  async getUserAccountByToken(token: string): Promise<UserAccount> {
    const intraName = await this.loginService.getIntraName(token);
    // console.log("intraName = ", intraName);

    if (!intraName) throw new NotFoundException('intraUsername not found');

    const user = await this.prisma.user.findUnique({
      where: { intraUsername: intraName },
    });
    // console.log("user = ", user);

    if (!user) throw new NotFoundException('User not found!');

    // console.log("FROM SERVICE.TS: user.avatar = ", user.avatar);
    const avatarURL = user.avatar
      ? `data:image/jpeg;base64,${user.avatar.toString('base64')}`
      : 'http://localhost:3001/images/default-avatar.png';

    // console.log("avatarURL = ", avatarURL);

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

  // FOR LATER: REMOVE checkAndGrantXPAchievements from user.service.ts
  // TO GAME LOGIC WHENEVER A GAME IS FINISHED
  async checkAndGrantXPAchievements(userID: number, playerRating: number): Promise<void> {
    const xpAchievements = [
      { name: 'Scored 100 XP', threshold: 100 },
      { name: 'Scored 1000 XP', threshold: 1000 },
    ];

    for (const achievement of xpAchievements) {
      if (playerRating >= achievement.threshold) {
        const achievementData = await this.prisma.achievement.findUnique({
          where: { name: achievement.name },
        });

        if (!achievementData) {
          throw new Error(`Achievement "${achievement.name}" not found.`);
        }

        const alreadyGranted = await this.prisma.userAchievement.findFirst({
          where: { userID, achievementID: achievementData.ID },
        });

        if (!alreadyGranted) {
          await this.prisma.userAchievement.create({
            data: { userID, achievementID: achievementData.ID },
          });
          // console.log(`Achievement "${achievement.name}" granted to user ${userID}. 🎉`);
        }
      }
    }
  }

  // FOR LATER: REMOVE winRate and playerRating CALCULATION LOGIC FROM getUserStats FUNCTION
  // TO GAME LOGIC WHENEVER A GAME IS FINISHED
  async getUserStats(userID: number): Promise<StatisticsData> {
    const statistics = await this.prisma.statistics.findUnique({
      where: { userID: userID },
    });
    // console.log("statistics = ", statistics);

    if (!statistics) throw new NotFoundException('Statistics not found!');

    // Calculate win rate and ladder rank -> we will later move this to game logic
    const winRate = statistics.gamesPlayed ? statistics.wins / statistics.gamesPlayed : 0;
    const playerRating = Math.round(winRate * 100 + statistics.totalScores / 10);

    // Update the ladder rank in the database -> we will later move this to game logic
    await this.prisma.statistics.update({
      where: { userID },
      data: { ladderRank: playerRating },
    });

    // Check and grant XP-related achievements -> we will later move this to game logic
    await this.checkAndGrantXPAchievements(userID, playerRating);

    return {
      ...statistics,
      winRate,
      ladderRank: playerRating,
    };
  }

  // FOR LATER: REMOVE CALCULATION LOGIC FROM getUserStats FUNCTION
  // TO GAME LOGIC WHENEVER A GAME IS FINISHED
  // IN FUNCTION LOOKING SOMEWHAT LIKE THIS:
  async updateGameStats(userID: number, gameResult: { won: boolean; score: number }): Promise<StatisticsData> {
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
    const winRate = updatedStats.gamesPlayed ? updatedStats.wins / updatedStats.gamesPlayed : 0;
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

  async getMatchHistory(userID: number): Promise<MatchHistoryData[]> {
    try {
        const matches: Match[] = await this.prisma.match.findMany({
        where: {
          status: 'FINISHED',
          players: {
            some: {
              ID: userID,
            },
          },
        },
        include: {
          players: {
            select: { ID: true, username: true },
          },
        },
      });

      // console.log("matches = ", matches);
      if (!matches || matches.length === 0) {
        return [];
      }

      return matches.map((match: Match) => {
        const isPlayer1 = match.players[0].ID === userID;
        const opponent = match.players.find((player) => player.ID !== userID);

        return {
          opponentID: opponent?.ID ?? -1,
          opponent: opponent?.username ?? 'Unknown',
          scorePlayer1: isPlayer1 ? match.scorePlayer1 : match.scorePlayer2,
          scorePlayer2: isPlayer1 ? match.scorePlayer2 : match.scorePlayer1,
          result: isPlayer1
          ? match.scorePlayer1 > match.scorePlayer2
            ? 'Win'
            : 'Loss'
          : match.scorePlayer2 > match.scorePlayer1
          ? 'Win'
          : 'Loss',
        };
      });
    } catch (error) {
    throw new NotFoundException('An error occurred while fetching match history.');
  }
}

  async getLeaderboard(): Promise<LeaderboardData[]> {
    console.log("hallootjes?");
    const leaderboard: LeaderboardEntry[] = await this.prisma.statistics.findMany({
      orderBy: { ladderRank: 'desc' },
      take: 10,
      select: {
        user: {
          select: { username: true, avatar: true },
        },
        ladderRank: true,
      },
    });

    return leaderboard.map((entry, index) => ({
      rank: index + 1,
      username: entry.user.username,
      avatarURL: entry.user.avatar
        ? `data:image/jpeg;base64,${entry.user.avatar.toString('base64')}`
        : 'http://localhost:3001/images/default-avatar.png',
      ladderRank: entry.ladderRank,
    }));
  }

  async getUserAchievements(userID: number): Promise<AchievementData[]> {
    const allAchievements = await this.prisma.achievement.findMany();
    const userAchievements = await this.prisma.userAchievement.findMany({
      where: { userID },
    });

    // console.log('allAchievements = ', allAchievements);
    // console.log('userAchievements = ', userAchievements);

    const unlockedAchievementIDs = userAchievements.map((ua) => ua.achievementID);

    return allAchievements.map((achievement) => ({
      name: achievement.name,
      description: achievement.description,
      iconURL: achievement.iconURL, // Always use the colored icon
      unlocked: unlockedAchievementIDs.includes(achievement.ID), // Use this flag for dynamic styling
    }));
  }

  async getUserProfileByUserID(userID: number, token: string): Promise<UserProfile> {
    this.loginService.getUserIDFromCache(token);

    const user = await this.prisma.user.findUnique({
      where: { ID: userID },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const avatarURL = user.avatar
      ? `data:image/jpeg;base64,${user.avatar.toString('base64')}`
      : 'http://localhost:3001/images/default-avatar.png';

    return {
      ...user,
      avatarURL,
    };
  }

  async getFriendshipStatus(currentUserID: number, targetUserID: number): Promise<boolean> {
    const friendship = await this.prisma.user.findFirst({
      where: {
        ID: currentUserID,
        friends: {
          some: { ID: targetUserID },
        },
      },
    });
    // console.log("friendship = ", Boolean(friendship));
    return Boolean(friendship);
  }

  async toggleFriendship(currentUserID: number, targetUserID: number): Promise<string> {
    const currentUser = await this.prisma.user.findUnique({
      where: { ID: currentUserID },
      include: { friends: true },
    });

    const targetUser = await this.prisma.user.findUnique({
      where: { ID: targetUserID },
      include: { friendsOf: true },
    });

    if (!currentUser || !targetUser) {
      throw new NotFoundException('User not found');
    }

    // Check if the current user is already friends with the target user
    const isAlreadyFriend = currentUser.friends.some((friend) => friend.ID === targetUserID);

    if (isAlreadyFriend) {
      // Unfriend logic: remove targetUser from currentUser's friends
      await this.prisma.user.update({
        where: { ID: currentUserID },
        data: {
          friends: {
            disconnect: { ID: targetUserID },
          },
        },
      });

      // Remove currentUser from targetUser's friendsOf
      await this.prisma.user.update({
        where: { ID: targetUserID },
        data: {
          friendsOf: {
            disconnect: { ID: currentUserID },
          },
        },
      });

      return `You unfriended user ${targetUserID}`;
    } else {
      // Befriend logic: add targetUser to currentUser's friends
      await this.prisma.user.update({
        where: { ID: currentUserID },
        data: {
          friends: {
            connect: { ID: targetUserID },
          },
        },
      });

      // Add currentUser to targetUser's friendsOf
      await this.prisma.user.update({
        where: { ID: targetUserID },
        data: {
          friendsOf: {
            connect: { ID: currentUserID },
          },
        },
      });

      return `You befriended user ${targetUserID}`;
    }
  }

  async getFriends(userID: number): Promise<UserFriend[]> {
    const user = await this.prisma.user.findUnique({
      where: { ID: userID },
      include: {
        friends: {
          select: {
            ID: true,
            username: true,
            avatar: true,
            status: true,
          },
        },
      },
    });
  
    if (!user || !user.friends) {
      throw new NotFoundException('No friends found');
    }
  
    return user.friends.map((friend) => ({
      ID: friend.ID,
      username: friend.username,
      avatarURL: friend.avatar
        ? `data:image/jpeg;base64,${friend.avatar.toString('base64')}`
        : 'http://localhost:3001/images/default-avatar.png',
      status: friend.status,
    }));
  }
}
