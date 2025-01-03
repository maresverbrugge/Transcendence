var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
let PrismaService = class PrismaService extends PrismaClient {
    constructor() {
        super();
        log: ['query', 'info', 'warn', 'error'];
        // You can set up additional configurations here if needed
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
};
PrismaService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], PrismaService);
export { PrismaService };
