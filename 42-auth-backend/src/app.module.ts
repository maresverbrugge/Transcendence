// A module is a class annotated with a @Module() decorator.
// The @Module() decorator provides metadata that Nest makes use of 
// to organize the application structure. Each application has at 
// least one module, a root module. The root module is the starting 
// point Nest uses to build the application graph - the internal data 
// structure Nest uses to resolve dependencies. Modules group together
// related components, such as controllers and services.

import { Module } from '@nestjs/common'; // Allowing us to use the @Module() decorator
import { AppController } from './app.controller'; // Import the AppController
import { AppService } from './app.service'; // Import the AppService
import { AuthModule } from './auth/auth.module'; // Import the AuthModule

@Module({
  imports: [AuthModule], // The AuthModule is imported
  controllers: [AppController], // The AppController is a controller
  providers: [AppService], // The AppService is a service
})
export class AppModule {}
