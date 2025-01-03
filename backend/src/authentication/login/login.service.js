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
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from "../../prisma/prisma.service";
import axios from 'axios';
import { UserStatus } from '@prisma/client';
// More info on this section here: https://api.intra.42.fr/apidoc/guides/web_application_flow
let LoginService = class LoginService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getToken(response_code) {
        // Load the environment variables needed for the login process
        const clientId = process.env.REACT_APP_LOGIN_CLIENT_ID;
        const clientSecret = process.env.REACT_APP_LOGIN_CLIENT_SECRET;
        const redirectUri = 'http://localhost:3000/login/redirect';
        try {
            // Request the token from the 42 API
            const response = await axios.post('https://api.intra.42.fr/oauth/token', {
                grant_type: 'authorization_code',
                client_id: clientId,
                client_secret: clientSecret,
                code: response_code,
                redirect_uri: redirectUri,
            });
            // Return the token to the controller
            return response.data;
        }
        catch (error) {
            throw new InternalServerErrorException('Error getting authentication token');
        }
    }
    async addUserToDatabase(user) {
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: { intraUsername: user },
            });
            if (!existingUser) {
                await this.prisma.user.create({
                    data: {
                        username: user,
                        intraUsername: user,
                        Enabled2FA: false,
                        status: UserStatus.ONLINE,
                    },
                });
            }
            else {
                await this.prisma.user.update({
                    where: { ID: existingUser.ID },
                    data: { status: UserStatus.ONLINE },
                });
            }
        }
        catch (error) {
            throw new InternalServerErrorException('Error while adding user to database');
        }
    }
    async setUserStatusToOffline(intraUsername) {
        try {
            await this.prisma.user.update({
                where: { intraUsername: intraUsername },
                data: { status: UserStatus.OFFLINE },
            });
        }
        catch (error) {
            throw new InternalServerErrorException('Error while setting user status to offline');
        }
    }
    async verifyToken(token) {
        try {
            const response = await axios.get('https://api.intra.42.fr/oauth/token/info', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.data || !response.data['expires_in_seconds']) {
                return false;
            }
            else if (response.data['expires_in_seconds'] <= 0) {
                return false;
            }
            else {
                return true;
            }
        }
        catch (error) {
            throw new InternalServerErrorException('Error while verifying authentication token');
        }
    }
    async getIntraName(token) {
        try {
            const response = await axios.get('https://api.intra.42.fr/v2/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.login;
        }
        catch (error) {
            throw new InternalServerErrorException('Error while getting intra name');
        }
    }
};
LoginService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof PrismaService !== "undefined" && PrismaService) === "function" ? _a : Object])
], LoginService);
export { LoginService };
