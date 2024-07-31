import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  getChatHistory(): string {
    return 'Chat History';

}
  constructor(private prisma: PrismaService) {}

  async createMessage(senderId: number, content: string) {
    return this.prisma.message.create({
      data: {
        senderId,
        content,
      },
    });
  }

  async getMessages() {
    return this.prisma.message.findMany();
  }
}