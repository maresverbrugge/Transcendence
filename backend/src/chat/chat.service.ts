import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  getChatHistory(): string {
    return 'Chat History';
  }
}
