import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	// Enable CORS with options
	app.enableCors({
		origin: 'http://localhost:3000', // Update with the client origin
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		credentials: true,
	});

	await app.listen(3001);
	console.log('Visit Transcendancing Queens\'s BACKEND on: http://localhost:3001\nVisit Transcendancing Queens\'s FRONTEND on: http://localhost:3000');
}
bootstrap();
