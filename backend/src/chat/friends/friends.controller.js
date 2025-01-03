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
import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from "../../prisma/prisma.service";
let FriendsController = class FriendsController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getFriendList(token) {
        const user = await this.prisma.user.findUnique({
            where: { websocketID: token }, //later veranderen naar token
            include: { friends: true },
        });
        if (!user)
            throw new NotFoundException('User not found');
        return user.friends;
    }
};
__decorate([
    Get(':token'),
    __param(0, Param('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "getFriendList", null);
FriendsController = __decorate([
    Controller('chat/friends'),
    __metadata("design:paramtypes", [typeof (_a = typeof PrismaService !== "undefined" && PrismaService) === "function" ? _a : Object])
], FriendsController);
export { FriendsController };
