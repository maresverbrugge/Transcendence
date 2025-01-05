import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// hashing explained here: https://docs.nestjs.com/security/encryption-and-hashing

@Injectable()
export class HashingService {
  private readonly saltRounds = 10;

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  }
}
