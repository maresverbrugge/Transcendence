import { Injectable } from '@nestjs/common';
import axios from 'axios';


@Injectable()
export class TwoFAService {
  async doStuff(something: string): Promise<any> {
    console.log("2FA service");
  }
}
