// A controller is responsible for handling incoming requests and returning
// responses to the client. AppController is a controller. It uses decorators 
// (like @Get(), @Post(), etc.) to map routes and their corresponding HTTP
// methods. The controller then uses services to perform the business logic
// when a route is hit.

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
