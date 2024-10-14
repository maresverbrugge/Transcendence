import { Injectable } from '@nestjs/common';
import { GameModule } from './game/game.module';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World from the BACKEND!';
  }
}
