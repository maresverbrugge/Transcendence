var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { LoginService } from '../authentication//login/login.service';
let UserService = class UserService {
    constructor(prisma, loginService) {
        this.prisma = prisma;
        this.loginService = loginService;
    }
    async getUserIDByToken(token) {
        const intraUsername = await this.loginService.getIntraName(token);
        const user = await this.prisma.user.findUnique({
            where: {
                intraUsername: intraUsername,
            },
            select: {
                ID: true,
            },
        });
        if (!user)
            throw new NotFoundException("User not found");
        return user.ID;
    } //! make sure to catch where calling this function
    async getUserAccountByToken(token) {
        const intraName = await this.loginService.getIntraName(token);
        // console.log("intraName = ", intraName);
        if (!intraName)
            throw new NotFoundException('intraUsername not found');
        const user = await this.prisma.user.findUnique({
            where: { intraUsername: intraName },
        });
        // console.log("user = ", user);
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
    async updateUsername(token, newUsername) {
        try {
            const intraUsername = await this.loginService.getIntraName(token);
            const updatedUser = await this.prisma.user.update({
                where: { intraUsername: intraUsername },
                data: { username: newUsername },
            });
            return updatedUser;
        }
        catch (error) {
            throw new Error('Error updating username');
        }
    }
    async updateAvatar(token, avatar) {
        const intraUsername = await this.loginService.getIntraName(token);
        return await this.prisma.user.update({
            where: { intraUsername: intraUsername },
            data: { avatar },
        });
    }
    async toggle2FA(token, enable) {
        const intraUsername = await this.loginService.getIntraName(token);
        return await this.prisma.user.update({
            where: { intraUsername: intraUsername },
            data: { Enabled2FA: enable },
        });
    }
    // FOR LATER: REMOVE checkAndGrantXPAchievements from user.service.ts
    // TO GAME LOGIC WHENEVER A GAME IS FINISHED
    async checkAndGrantXPAchievements(userID, playerRating) {
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
    async getUserStats(userID) {
        const statistics = await this.prisma.statistics.findUnique({
            where: { userID: userID },
        });
        // console.log("statistics = ", statistics);
        if (!statistics)
            throw new NotFoundException("Statistics not found!");
        // Calculate win rate and ladder rank -> we will later move this to game logic
        const winRate = statistics.gamesPlayed
            ? statistics.wins / statistics.gamesPlayed
            : 0;
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
    async updateGameStats(userID, gameResult) {
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
    async getMatchHistory(userID) {
        const matches = await this.prisma.match.findMany({
            where: {
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
            throw new NotFoundException('No match history found for this user.');
        }
        return matches.map((match) => {
            const opponent = match.players.find((player) => player.ID !== userID);
            return {
                opponent: opponent?.username ?? 'Unknown',
                scorePlayer1: match.scorePlayer1,
                scorePlayer2: match.scorePlayer2,
            };
        });
    }
    async getLeaderboard() {
        const leaderboard = await this.prisma.statistics.findMany({
            orderBy: { ladderRank: 'desc' },
            take: 10,
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
                : 'http://localhost:3001/images/default-avatar.png',
            ladderRank: entry.ladderRank,
        }));
    }
    async getUserAchievements(userID) {
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
    async getUserProfileByUserID(userID) {
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
    async getFriendshipStatus(currentUserID, targetUserID) {
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
    async toggleFriendship(currentUserID, targetUserID) {
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
        }
        else {
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
};
UserService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof PrismaService !== "undefined" && PrismaService) === "function" ? _a : Object, LoginService])
], UserService);
export { UserService };
