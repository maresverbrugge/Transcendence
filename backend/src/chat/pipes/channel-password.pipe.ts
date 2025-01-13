import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ChannelPasswordPipe implements PipeTransform {
  transform(password: any): string {

    // Check if the password is a string
    if (typeof password !== 'string') {
      throw new BadRequestException('Password must be a string');
    }

    // Check password length
    if (password.length < 8 || password.length > 128) {
      throw new BadRequestException('Password must be between 8 and 128 characters');
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      throw new BadRequestException('Password must contain at least one uppercase letter');
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      throw new BadRequestException('Password must contain at least one lowercase letter');
    }

    // Check for at least one number
    if (!/[0-9]/.test(password)) {
      throw new BadRequestException('Password must contain at least one number');
    }

    // Check for at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new BadRequestException('Password must contain at least one special character');
    }

    return password;
  }
}