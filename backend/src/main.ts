import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
var wss: any;

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	
	// Enable CORS with options
	app.enableCors({
		origin: 'http://localhost:3001', // Update with the client origin
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		credentials: true,
	});
	
	await app.listen(3001);
	console.log('Application is running on: http://localhost:3001');
}

var paddleLeft: Paddle;
var paddleRight: Paddle;
var scoreLeft: number = 0; //send to the client
var scoreRight: number = 0; //send to the client
var end: number = 0;

class Ball {
	x: number;
	y: number;
	diameter: number;
	speedX: number;
	speedY: number;
	// ws: WebSocket;

	constructor(x: number, y: number, diameter: number) {
		this.x = x;
		this.y = y;
		this.diameter = diameter;
		this.speedX = 0;
		this.speedY = 0;
		// this.ws = ws;
	}
	left() {
		return this.x-this.diameter/2;
	};
	right() {
		return this.x+this.diameter/2;
	};
	top() {
		return this.y-this.diameter/2;
	};
	bottom() {
		return this.y+this.diameter/2;
	};
	move(width: number, height: number) {
		this.y += this.speedY;
		this.x += this.speedX;
		if (this.right() > width) {
			scoreLeft += 1;
			// this.ws.send('left scored');
			this.x = width/2;
			this.y = height/2;
		}
		if (this.left() < 0) {
			scoreRight += 1;
			// this.ws.send('right scored');
			this.x = width/2;
			this.y = height/2;
		}
		if (this.bottom() > height) {
			this.speedY = -this.speedY;
			// this.ws.send('ball speedY reversed');
		}
		if (this.top() < 0) {
			this.speedY = -this.speedY;
			// this.ws.send('ball speedY reversed');
		}
	};
};

class Paddle{
	x: number;
	y: number;
	w: number;
	h: number;
	speedY: number;
	// ws: WebSocket;
	
	constructor(x: number, y: number, w: number, h: number) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.speedY = 0; //get from client
	}
	left() {
		return this.x-this.w/2;
	};
	right() {
		return this.x+this.w/2;
	};
	top() {
		return this.y-this.h/2;
	};
	bottom() {
		return this.y+this.h/2;
	};
	display(height) {
		if (this.bottom() > height) {
			this.y = height-this.h/2;
		}
		if (this.top() < 0) {
			this.y = this.h/2;
		}
		// this.context.beginPath();
		// this.context.rect(this.x-this.w/2,this.y-this.h/2,this.w,this.h);
		// this.context.stroke();
	};
};

function map_range(value, low1, high1, low2, high2) {
	return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

class DrawingApp {
	width: number;
	height: number;
	ball: Ball;
	// ws: WebSocket;

	constructor() {
		this.ball = new Ball(this.width/2, this.height/2, 50);
		this.ball.speedX = 5;
		// this.ws = ws;
		// ws.send('ball speedX = ' + this.ball.speedX.toString());
		this.ball.speedY = Math.floor(Math.random() * 6 - 3);
		// ws.send('ball speedY = ' + this.ball.speedY.toString());
		paddleLeft = new Paddle(15, this.height/2, 30, 200);
		paddleRight = new Paddle(this.width-15, this.height/2, 30, 200);
	};
	redraw() {
		this.ball.move(this.width, this.height);
		if (this.ball.left() < paddleLeft.right() && this.ball.y > paddleLeft.top() && this.ball.y < paddleLeft.bottom()){
			this.ball.speedX = -this.ball.speedX;
			// this.ws.send('ball speedX reversed');
			this.ball.speedY = map_range(this.ball.y - paddleLeft.y, -paddleLeft.h/2, paddleLeft.h/2, -10, 10);
			// this.ws.send('ball speedY = ' + this.ball.speedY.toString());
		}
		
		if (this.ball.right() > paddleRight.left() && this.ball.y > paddleRight.top() && this.ball.y < paddleRight.bottom()) {
			this.ball.speedX = -this.ball.speedX;
			// this.ws.send('ball speedX reversed');
			this.ball.speedY = map_range(this.ball.y - paddleRight.y, -paddleRight.h/2, paddleRight.h/2, -10, 10);
			// this.ws.send('ball speedY = ' + this.ball.speedY.toString());
		}
		if (scoreLeft - scoreRight === 3 || scoreRight - scoreLeft === 3) {
			// this.ws.send('game ended');
			end = 1;
			this.ball.x = this.width/2;
			this.ball.y = this.height/2;
			this.ball.speedX = 0;
			this.ball.speedY = 0;
		}
		window.requestAnimationFrame(this.redraw);
	};
};
bootstrap();
