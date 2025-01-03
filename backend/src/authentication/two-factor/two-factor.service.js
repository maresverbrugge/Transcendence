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
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import * as speakeasy from 'speakeasy'; // https://www.npmjs.com/package/speakeasy
import * as qrcode from 'qrcode';
import { PrismaService } from "../../prisma/prisma.service";
let TwoFactorService = class TwoFactorService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getQRCode(intraUsername) {
        try {
            const secret = speakeasy.generateSecret({
                name: 'Transcendancing Queens',
            });
            const dataURL = await qrcode.toDataURL(secret.otpauth_url);
            await this.prisma.user.update({
                where: { intraUsername: intraUsername },
                data: { secretKey: secret.ascii },
            });
            return dataURL;
        }
        catch (error) {
            throw new InternalServerErrorException('Error generating QR code for 2FA');
        }
    }
    async isTwoFactorEnabled(intraUsername) {
        try {
            const isEnabled = await this.prisma.user.findUnique({
                where: { intraUsername: intraUsername },
                select: { Enabled2FA: true },
            });
            if (isEnabled === null) {
                throw new NotFoundException('User not found');
            }
            else {
                return isEnabled.Enabled2FA;
            }
        }
        catch (error) {
            throw new InternalServerErrorException('Error while checking if two-factor authentication is enabled');
        }
    }
    async verifyOneTimePassword(oneTimePassword, intraUsername) {
        try {
            const secretKey = await this.prisma.user.findUnique({
                where: { intraUsername: intraUsername },
                select: { secretKey: true },
            });
            const verified = speakeasy.totp.verify({
                secret: secretKey.secretKey,
                encoding: 'ascii',
                token: oneTimePassword,
            });
            return verified;
        }
        catch (error) {
            throw new InternalServerErrorException('Error while verifying token');
        }
    }
    async enableTwoFactor(intraUsername) {
        try {
            await this.prisma.user.update({
                where: { intraUsername: intraUsername },
                data: { Enabled2FA: true },
            });
        }
        catch (error) {
            throw new InternalServerErrorException('Error while enabling two-factor authentication');
        }
    }
    async disableTwoFactor(intraUsername) {
        try {
            await this.prisma.user.update({
                where: { intraUsername: intraUsername },
                data: {
                    secretKey: null,
                    Enabled2FA: false,
                },
            });
        }
        catch (error) {
            throw new InternalServerErrorException('Error while disabling two-factor authentication');
        }
    }
};
TwoFactorService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof PrismaService !== "undefined" && PrismaService) === "function" ? _a : Object])
], TwoFactorService);
export { TwoFactorService };
