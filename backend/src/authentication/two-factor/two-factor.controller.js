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
import { Controller, Post, Body } from '@nestjs/common';
import { TwoFactorService } from './two-factor.service';
import { LoginService } from '../login/login.service';
let TwoFactorController = class TwoFactorController {
    constructor(twoFactorService, loginService) {
        this.twoFactorService = twoFactorService;
        this.loginService = loginService;
    }
    async qrcode(body) {
        const { token } = body;
        const intraUsername = await this.loginService.getIntraName(token);
        const qrcode = await this.twoFactorService.getQRCode(intraUsername);
        return qrcode;
    }
    async isEnabled(body) {
        const { token } = body;
        const intraUsername = await this.loginService.getIntraName(token);
        const isEnabled = await this.twoFactorService.isTwoFactorEnabled(intraUsername);
        return isEnabled;
    }
    async verify(body) {
        const { oneTimePassword, token } = body;
        const intraUsername = await this.loginService.getIntraName(token);
        const verified = await this.twoFactorService.verifyOneTimePassword(oneTimePassword, intraUsername);
        return verified;
    }
    async enable(body) {
        const { token } = body;
        const intraUsername = await this.loginService.getIntraName(token);
        await this.twoFactorService.enableTwoFactor(intraUsername);
    }
    async disable(body) {
        const { token } = body;
        const intraUsername = await this.loginService.getIntraName(token);
        await this.twoFactorService.disableTwoFactor(intraUsername);
    }
};
__decorate([
    Post('qrcode'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TwoFactorController.prototype, "qrcode", null);
__decorate([
    Post('is-enabled'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TwoFactorController.prototype, "isEnabled", null);
__decorate([
    Post('verify'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TwoFactorController.prototype, "verify", null);
__decorate([
    Post('enable'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TwoFactorController.prototype, "enable", null);
__decorate([
    Post('disable'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TwoFactorController.prototype, "disable", null);
TwoFactorController = __decorate([
    Controller('two-factor'),
    __metadata("design:paramtypes", [TwoFactorService,
        LoginService])
], TwoFactorController);
export { TwoFactorController };
