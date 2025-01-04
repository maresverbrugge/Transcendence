import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class OneTimePasswordPipe implements PipeTransform {
  transform(oneTimePassword: any): string {
    if (typeof oneTimePassword !== 'string') {
      throw new BadRequestException('OTP must be a string');
    }
    if (!/^\d{6}$/.test(oneTimePassword)) {
      throw new BadRequestException('OTP must be a 6-digit number');
    }
    return oneTimePassword;
  }
}
