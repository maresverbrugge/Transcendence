import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Statistics, User } from '@prisma/client';
import { LoginService } from '../authentication/login/login.service';
import { ErrorHandlingService } from '../error-handling/error-handling.service';
import {
  UserAccount,
  UserProfile,
  UserFriend,
  LeaderboardData,
  LeaderboardEntry,
  MatchHistoryData,
  Match,
  AchievementData,
} from './interfaces';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => LoginService))
    private readonly loginService: LoginService,
    private readonly errorHandlingService: ErrorHandlingService,
  ) {}

  getAvatarURL(avatar: Buffer | null): string {
    return avatar
      ? `data:image/jpeg;base64,${avatar.toString('base64')}`
      : `${process.env.URL_BACKEND}/images/default-avatar.png`;
  }

  async getUserAccountByToken(token: string): Promise<UserAccount> {
    const userID = await this.loginService.getUserIDFromCache(token);
    try {
      const user = await this.prisma.user.findUnique({
        where: { ID: userID },
        select: {
          ID: true,
          username: true,
          Enabled2FA: true,
          avatar: true,
        },
      });

      if (!user) throw new NotFoundException('User not found!');

      const avatarURL = this.getAvatarURL(user.avatar);

      return {
        ID: user.ID,
        username: user.username,
        Enabled2FA: user.Enabled2FA,
        avatarURL,
      };
    } catch (error) {
      this.errorHandlingService.throwHttpException(error);
    }
  }

  async getUserProfileByUserID(profileUserID: number, token: string): Promise<UserProfile> {
    const currentUserID = await this.loginService.getUserIDFromCache(token);

    try {
      const user = await this.prisma.user.findUnique({
      where: { ID: profileUserID },
      select: {
        ID: true,
        username: true,
        avatar: true,
        status: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const avatarURL = this.getAvatarURL(user.avatar);

    return {
      currentUserID,
      profileID: user.ID,
      username: user.username,
      status: user.status,
      avatarURL,
    };
    } catch (error) {
      this.errorHandlingService.throwHttpException(error);
    }
  }

  async getUserNameByUserID(profileUserID: number, token: string): Promise<string> {
    const currentUserID = await this.loginService.getUserIDFromCache(token);

    try {
      const user = await this.prisma.user.findUnique({
      where: { ID: profileUserID },
      select: {
        username: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return user.username;
    } catch (error) {
      this.errorHandlingService.throwHttpException(error);
    }
  }

  async getSocketIDByUserID(userID: number, token: string): Promise<string> {
    const currentUserID = await this.loginService.getUserIDFromCache(token);

    try {
      const user = await this.prisma.user.findUnique({
      where: { ID: userID },
      select: {
        websocketID: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return user.websocketID;
    } catch (error) {
      this.errorHandlingService.throwHttpException(error);
    }
  }

  async updateUsername(token: string, newUsername: string): Promise<User> {
    const userID = await this.loginService.getUserIDFromCache(token);

    try {
      const updatedUserWithUsername = await this.prisma.user.update({
        where: { ID: userID },
        data: { username: newUsername },
      });
      return updatedUserWithUsername;
    } catch (error) {
      this.errorHandlingService.throwHttpException(error);
    }
  }

  async updateAvatar(token: string, avatar: Buffer): Promise<User> {
    const userID = await this.loginService.getUserIDFromCache(token);

    try {
      return await this.prisma.user.update({
        where: { ID: userID },
        data: { avatar },
      });
    } catch (error) {
      this.errorHandlingService.throwHttpException(error);
    }
  }

  async getLeaderboard(): Promise<LeaderboardData[]> {
    try {
      const leaderboard: LeaderboardEntry[] = await this.prisma.statistics.findMany({
        orderBy: { ladderRank: 'desc' },
        take: 10,
        select: {
          user: {
            select: { ID: true, username: true, avatar: true },
          },
          ladderRank: true,
        },
      });

      return leaderboard.map((entry, index) => ({
        ID: entry.user.ID,
        username: entry.user.username,
        ladderRank: entry.ladderRank,
        avatarURL: this.getAvatarURL(entry.user.avatar),
        rank: index + 1,
      }));
    } catch (error) {
      this.errorHandlingService.throwHttpException(error);
    }
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

      if (!matches || matches.length === 0) {
        return [];
      }

      return matches.map((match: Match) => {
        const isPlayer1 = match.players[0].ID === userID;
        const opponent = match.players.find((player) => player.ID !== userID);

        return {
          opponentID: opponent?.ID ?? -1,
          opponent: opponent?.username ?? 'Unknown',
          scoreLeft: isPlayer1 ? match.scoreLeft : match.scoreRight,
          scoreRight: isPlayer1 ? match.scoreRight : match.scoreLeft,
          result: isPlayer1
          ? match.scoreLeft > match.scoreRight
            ? 'Win'
            : 'Loss'
          : match.scoreRight > match.scoreLeft
          ? 'Win'
          : 'Loss',
        };
      });
    } catch (error) {
      this.errorHandlingService.throwHttpException(error);
    }
  }

  async getUserAchievements(userID: number): Promise<AchievementData[]> {
    try {
      const [allAchievements, userAchievements] = await Promise.all([
        this.prisma.achievement.findMany(),
        this.prisma.userAchievement.findMany({ where: { userID } }),
      ]);

      const unlockedAchievementIDs = new Set(userAchievements.map((ua) => ua.achievementID));

      return allAchievements.map((achievement) => ({
        name: achievement.name,
        description: achievement.description,
        iconURL: achievement.iconURL,
        unlocked: unlockedAchievementIDs.has(achievement.ID),
      }));
    } catch (error) {
      this.errorHandlingService.throwHttpException(error);
    }
  }

  async getFriends(token: string): Promise<UserFriend[]> {
    const userID = await this.loginService.getUserIDFromCache(token);
    if (!userID) throw new NotFoundException('User Unauthorized.');
     try {
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
          avatarURL: this.getAvatarURL(friend.avatar),
          status: friend.status,
        }));
      } catch (error) {
        this.errorHandlingService.throwHttpException(error);
      }
    }

  async getFriendshipStatus(token: string, targetUserID: number): Promise<boolean> {
    const userID = await this.loginService.getUserIDFromCache(token);

    try {
      const userCount = await this.prisma.user.count({
        where: {
          ID: userID,
          friends: { some: { ID: targetUserID } },
        },
      });
      return userCount > 0;
    } catch (error) {
      this.errorHandlingService.throwHttpException(error);
    }
  }

  async toggleFriendship(token: string, targetUserID: number): Promise<string> {
    const userID = await this.loginService.getUserIDFromCache(token);

    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        const isFriend = await prisma.user.count({
          where: {
            ID: userID,
            friends: { some: { ID: targetUserID } },
          },
        });

        if (isFriend) {
          await prisma.user.update({
            where: { ID: userID },
            data: { friends: { disconnect: { ID: targetUserID } } },
          });

          await prisma.user.update({
            where: { ID: targetUserID },
            data: { friendsOf: { disconnect: { ID: userID } } },
          });

        } else {
          await prisma.user.update({
            where: { ID: userID },
            data: { friends: { connect: { ID: targetUserID } } },
          });

          await prisma.user.update({
            where: { ID: targetUserID },
            data: { friendsOf: { connect: { ID: userID } } },
          });

          await this.checkAndGrantFriendAchievements(userID);
          return `You befriended user ${targetUserID}`;
        }
        return `You unfriended user ${targetUserID}`;
      });

      return result;
    } catch (error) {
      this.errorHandlingService.throwHttpException(error);
    }
  }

  async checkAndGrantFriendAchievements(userID: number): Promise<void> {
    try {
      const userWithFriends = await this.prisma.user.findUnique({
        where: { ID: userID },
        include: { friends: true },
      });

      const totalFriends = userWithFriends?.friends.length != null
      ? userWithFriends.friends.length + 1
      : 0;

      const friendAchievements = [
        { name: 'First Friend', threshold: 1 },
        { name: '10 Friends', threshold: 10 },
        { name: '50 Friends', threshold: 50 },
      ];

      for (const achievement of friendAchievements) {
        if (totalFriends >= achievement.threshold) {
          const achievementData = await this.prisma.achievement.findUnique({
            where: { name: achievement.name },
          });

          if (!achievementData) continue;

          const alreadyGranted = await this.prisma.userAchievement.findFirst({
            where: { userID, achievementID: achievementData.ID },
          });

          if (!alreadyGranted) {
            await this.prisma.userAchievement.create({
              data: {
                userID,
                achievementID: achievementData.ID,
              },
            });
            }
          }
        }
    }
    catch (error) {
      this.errorHandlingService.throwHttpException(error);
    }
  }

  async getUserStats(userID: number): Promise<Statistics> {
    try {
      const statistics = await this.prisma.statistics.findUnique({
        where: { userID: userID },
      });

      if (!statistics) throw new NotFoundException('Statistics not found!');

      return {
        ...statistics
      };
    } catch (error) {
      this.errorHandlingService.throwHttpException(error);
    }
  }
}
