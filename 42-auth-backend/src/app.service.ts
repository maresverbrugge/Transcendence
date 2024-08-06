// Services in NestJS are where you define your app's business logic.
// A service is a class that does something specific and does it well.
// It's annotated with @Injectable(), meaning it can be injected into 
// controllers (or other services) via constructor injection. AppService 
// is a service. It's where the actual logic to handle requests would go. 
// Services can be injected into controllers to keep the logic in the 
// controller simple and focused on handling the request and response.

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
