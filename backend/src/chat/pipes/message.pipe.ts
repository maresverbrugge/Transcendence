import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class MessagePipe implements PipeTransform {
  transform(content: any): string {
    if (typeof content !== 'string') {
      throw new BadRequestException('Message must be a string');
    }

    if (content.length > 300) {
      throw new BadRequestException('Message must not exceed 300 characters');
    }

    const forbiddenWords = ['bitch', 'faggot', 'asshole'];
    const sanitizedContent = forbiddenWords.reduce(
      (content, word) => content.replace(new RegExp(`\\b${word}\\b`, 'gi'), 'cutie'),
      content
    );

    return sanitizedContent;
  }
}