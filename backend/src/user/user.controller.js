var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { UserService } from './user.service';
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    async getUserIDByToken(token) {
        return this.userService.getUserIDByToken(token);
    }
    async getUserAccountByToken(token) {
        return this.userService.getUserAccountByToken(token);
    }
    async uploadAvatar(token, file) {
        const fileBuffer = file.buffer;
        return this.userService.updateAvatar(token, fileBuffer);
    }
    async changeUsername(token, newUsername) {
        return this.userService.updateUsername(token, newUsername);
    }
    async toggleTwoFactorAuth(token, { enable }) {
        return this.userService.toggle2FA(token, enable);
    }
    async getUserStats(userID) {
        return this.userService.getUserStats(userID);
    }
    async getMatchHistory(userID) {
        return this.userService.getMatchHistory(userID);
    }
    async getLeaderboard() {
        return this.userService.getLeaderboard();
    }
    async getUserAchievements(userID) {
        return this.userService.getUserAchievements(userID);
    }
    async getUserProfileByUserID(userID) {
        return this.userService.getUserProfileByUserID(userID);
    }
    async getFriendshipStatus(currentUserID, targetUserID) {
        const isFriend = await this.userService.getFriendshipStatus(currentUserID, targetUserID);
        return { isFriend };
    }
    async toggleFriendship(currentUserID, targetUserID) {
        return this.userService.toggleFriendship(currentUserID, targetUserID);
    }
};
__decorate([
    Get('userID/:token'),
    __param(0, Param('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserIDByToken", null);
__decorate([
    Get('account/:token'),
    __param(0, Param('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserAccountByToken", null);
__decorate([
    Post(':token/avatar'),
    UseInterceptors(FileInterceptor('avatar')),
    __param(0, Param('token')),
    __param(1, UploadedFile()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_a = typeof Multer !== "undefined" && Multer.File) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "uploadAvatar", null);
__decorate([
    Patch(':token'),
    __param(0, Param('token')),
    __param(1, Body('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "changeUsername", null);
__decorate([
    Patch(':token/2fa'),
    __param(0, Param('token')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "toggleTwoFactorAuth", null);
__decorate([
    Get(':userID/stats'),
    __param(0, Param('userID', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserStats", null);
__decorate([
    Get(':userID/match-history'),
    __param(0, Param('userID', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMatchHistory", null);
__decorate([
    Get('leaderboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getLeaderboard", null);
__decorate([
    Get(':userID/achievements'),
    __param(0, Param('userID', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserAchievements", null);
__decorate([
    Get('profile/:userID'),
    __param(0, Param('userID', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserProfileByUserID", null);
__decorate([
    Get(':currentUserID/friend/:targetUserID'),
    __param(0, Param('currentUserID', ParseIntPipe)),
    __param(1, Param('targetUserID', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getFriendshipStatus", null);
__decorate([
    Patch(':currentUserID/friend/:targetUserID'),
    __param(0, Param('currentUserID', ParseIntPipe)),
    __param(1, Param('targetUserID', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "toggleFriendship", null);
UserController = __decorate([
    Controller('user'),
    __metadata("design:paramtypes", [UserService])
], UserController);
export { UserController };
