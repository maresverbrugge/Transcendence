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
import { PrismaService } from "../../prisma/prisma.service";
import { UserStatus } from '@prisma/client';
let UserService = class UserService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    //temporary function
    async assignSocketAndTokenToUserOrCreateNewUser(socketID, token, server) {
        // Step 1: Find user with an empty websocketID
        const emptyWebSocketUser = await this.prisma.user.findFirst({
            where: { websocketID: null },
        });
        if (emptyWebSocketUser)
            // Assign socketID if user with empty websocketID is found
            return await this.prisma.user.update({
                where: { ID: emptyWebSocketUser.ID },
                data: { websocketID: socketID,
                    token: token },
            });
        // Step 2: Check if any user has an inactive websocketID
        const users = await this.prisma.user.findMany(); // Fetch all users
        for (const user of users) {
            try {
                if (user.websocketID) {
                    const socket = server.sockets.get(user.websocketID);
                    if (!socket)
                        // Replace websocketID if an inactive socket is found
                        return await this.prisma.user.update({
                            where: { ID: user.ID },
                            data: { websocketID: socketID,
                                token: token },
                        });
                }
            }
            catch (error) {
                console.log('error fetching socket: ', error);
            }
        }
        // Step 3: If no users have an empty or inactive websocketID, create a new user
        return await this.prisma.user.create({
            data: { username: `user${socketID}`, intraUsername: `user${socketID}`, Enabled2FA: false, status: UserStatus.ONLINE, websocketID: socketID, token: token },
        });
    }
    async removeWebsocketIDFromUser(websocketID) {
        const user = await this.getUserBySocketID(websocketID);
        if (user)
            return await this.prisma.user.update({
                where: { ID: user.ID },
                data: { websocketID: null },
            });
    }
    async getUsers(client) {
        const users = await this.prisma.user.findMany(); // Fetch all users from the User model
        client.emit('users', users);
    }
    async getUserByUserID(userID) {
        const user = await this.prisma.user.findUnique({
            where: { ID: userID },
        });
        if (!user)
            throw new NotFoundException(`User with ID ${userID} not found.`);
        return (user);
    }
    async createUser(socketID) {
        return this.prisma.user.create({
            data: {
                username: socketID,
                intraUsername: socketID,
                websocketID: socketID,
                Enabled2FA: true,
                status: UserStatus.ONLINE,
            },
        });
    }
    async getWebSocketByUserID(server, userID) {
        const user = await this.prisma.user.findUnique({ where: { ID: userID }, select: { websocketID: true } });
        const socket = server.sockets.get(user.websocketID);
        return socket ? socket : null;
    }
    async getUserIDBySocketID(socketID) {
        const user = await this.prisma.user.findUnique({
            where: {
                websocketID: socketID,
            },
            select: {
                ID: true,
            },
        });
        if (!user)
            throw new NotFoundException('User not found');
        return user?.ID || null; // Return the user ID if found, otherwise return null
    }
    async getUserBySocketID(socketID) {
        return this.prisma.user.findUnique({
            where: {
                websocketID: socketID,
            }
        });
    }
    async deleteUserBySocketID(socketID) {
        const userID = await this.getUserIDBySocketID(socketID);
        if (userID)
            return this.prisma.user.delete({
                where: {
                    ID: userID,
                },
            });
    }
};
UserService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof PrismaService !== "undefined" && PrismaService) === "function" ? _a : Object])
], UserService);
export { UserService };
