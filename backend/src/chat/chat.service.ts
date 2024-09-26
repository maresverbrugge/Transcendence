import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  getChatHistory(): string {
    return 'Chat History';
}

async createMessage(senderName: string, content: string) {
  // Check if the user exists by name
  let user = await this.prisma.user.findFirst({
    where: { username: senderName },
  });

  // If the user doesn't exist, create a new one
  if (!user) {
    user = await this.prisma.user.create({
      data: {
        username: senderName,
      },
    });
  }

  // Create the message
  return this.prisma.message.create({
    data: {
      senderId: user.id,
      content,
    },
  });
}

async getMessages() {
  return this.prisma.message.findMany({});
}
}