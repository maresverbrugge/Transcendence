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
import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { LoginService } from './login.service';
let LoginController = class LoginController {
    constructor(loginService) {
        this.loginService = loginService;
    }
    async getToken(body) {
        const { code, state } = body;
        if (state !== process.env.REACT_APP_LOGIN_STATE) {
            throw new BadRequestException('Invalid state');
        }
        const token = await this.loginService.getToken(code);
        return token;
    }
    async online(body) {
        const { token } = body;
        const user = await this.loginService.getIntraName(token);
        this.loginService.addUserToDatabase(user);
    }
    async offline(body) {
        const { token } = body;
        const user = await this.loginService.getIntraName(token);
        this.loginService.setUserStatusToOffline(user);
    }
    async verify(body) {
        const { token } = body;
        const verified = await this.loginService.verifyToken(token);
        return verified;
    }
    async getIntraLogin(body) {
        const { token } = body;
        const login = await this.loginService.getIntraName(token);
        return login;
    }
};
__decorate([
    Post('get-token'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "getToken", null);
__decorate([
    Post('online'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "online", null);
__decorate([
    Post('offline'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "offline", null);
__decorate([
    Post('verify-token'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "verify", null);
__decorate([
    Post('intra-name'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "getIntraLogin", null);
LoginController = __decorate([
    Controller('login'),
    __metadata("design:paramtypes", [LoginService])
], LoginController);
export { LoginController };
