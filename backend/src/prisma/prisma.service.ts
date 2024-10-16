import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super();
    log: ['query', 'info', 'warn', 'error']
    // You can set up additional configurations here if needed
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}