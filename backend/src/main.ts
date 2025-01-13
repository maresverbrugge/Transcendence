import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {

	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	app.enableCors({
		origin: process.env.URL_FRONTEND,
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
		credentials: true,
	});

	app.useStaticAssets(join(__dirname, '..', 'src', 'public'));
	await app.listen(process.env.PORT_BACKEND);
	console.log('Visit Transcendancing Queens\'s BACKEND on ' + process.env.URL_BACKEND);
	console.log('Visit Transcendancing Queens\'s FRONTEND on ' + process.env.URL_FRONTEND);
}
bootstrap();
