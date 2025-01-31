import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class UsernameValidationPipe implements PipeTransform {
  transform(username: any): string {
    if (typeof username !== 'string') {
      throw new BadRequestException('Username must be a string');
    }

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      throw new BadRequestException('Username cannot be empty');
    }

    if (trimmedUsername.length > 15) {
      throw new BadRequestException('Username must not exceed 15 characters');
    }

    if (/[^a-zA-Z0-9À-ž!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|`~ ]/.test(trimmedUsername)) {
        throw new BadRequestException(
          "Username contains invalid characters. Only letters, numbers, accented characters, and certain symbols are allowed."
        );
      }

    return trimmedUsername;
  }
}
