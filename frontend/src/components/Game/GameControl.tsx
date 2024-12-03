import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

var g_socket: Socket;
var g_gameID: number;
var end: number = 0;
var paddleLeft: Paddle;
var paddleRight: Paddle;
var scoreLeft: number = 0;
var scoreRight: number = 0;

class Ball {
	x: number
	y: number
	diameter: number
	speedX: number
	speedY: number
	context: any
	gameID: number
	constructor(x: number, y: number, diameter: number, context: any, gameID: number) {
		this.x = x;
		this.y = y;
		this.diameter = diameter;
		this.speedX = 0;
		this.speedY = 0;
		this.context = context;
		this.gameID = gameID;
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
		this.x += this.speedX;
		this.y += this.speedY;
		if (this.right() > width) {
			scoreLeft += 1;
			g_socket.emit('left scored', this.gameID);
			this.x = width/2;
			this.y = height/2;
		}
		if (this.left() < 0) {
			scoreRight += 1;
			g_socket.emit('right scored', this.gameID);
			this.x = width/2;
			this.y = height/2;
		}
		if (this.bottom() > height) {
			this.speedY = -this.speedY;
			g_socket.emit('ball speedY reversed');
		}
		if (this.top() < 0) {
			this.speedY = -this.speedY;
			g_socket.emit('ball speedY reversed');
		}
	}
	display() {
		this.context.beginPath();
		this.context.arc(this.x,this.y,this.diameter / 2, 0, 2 * Math.PI);
		this.context.stroke();
	};
};

class Paddle{
	x: number
	y: number
	w: number
	h: number
	speedY: number
	context: any
	constructor(x: number, y: number, w: number, h: number, context: any) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.speedY = 0; //get from client
		this.context = context;
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
	display(height: number) {
		if (this.bottom() > height) {
			this.y = height-this.h/2;
		}
		if (this.top() < 0) {
			this.y = this.h/2;
		}
		this.context.beginPath();
		this.context.rect(this.x-this.w/2,this.y-this.h/2,this.w,this.h);
		this.context.stroke();
	};
};

function map_range(value: number, low1: number, high1: number, low2: number, high2: number) {
	return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

onkeydown = (event: KeyboardEvent) => {
	if (end)
		return
	var move: string
	if (event.key === "ArrowUp"){
		move = "up"
	}
	if (event.key === "ArrowDown"){
		move = "down"
	}
	g_socket.emit('key', move, g_gameID, g_socket.id);
}

const GameLogic = ({ gameID, socket }) => {
    const canvas: any = React.useRef();
	var width: number = 500;
	var height: number = 500;
	var ball: Ball;
	g_socket = socket;
	const draw = (ctx, socket) => {
		ctx.clearRect(0, 0, width, height);
		ball.move(width, height);
		ball.display();
		paddleLeft.display(height);
		paddleRight.display(height);
		if (ball.left() < paddleLeft.right() && ball.y > paddleLeft.top() && ball.y < paddleLeft.bottom()){
			ball.speedX = -ball.speedX;
			ball.speedY = map_range(ball.y - paddleLeft.y, -paddleLeft.h/2, paddleLeft.h/2, -10, 10);
		}
		if (ball.right() > paddleRight.left() && ball.y > paddleRight.top() && ball.y < paddleRight.bottom()) {
			ball.speedX = -ball.speedX;
			ball.speedY = map_range(ball.y - paddleRight.y, -paddleRight.h/2, paddleRight.h/2, -10, 10);
		}
		ctx.fillText(scoreRight, width/2 + 30, 30); // Right side score
		ctx.fillText(scoreLeft, width/2 - 30, 30); // Left side score
		if (scoreLeft - scoreRight === 3 || scoreRight - scoreLeft === 3) {
			socket.emit('done', g_gameID)
			ctx.fillText("You've won, nice game!", width/2, height/2);
			end = 1;
			ball.x = width/2;
			ball.y = height/2;
			ball.speedX = 0;
			ball.speedY = 0;
		}
	}
	
    useEffect(() => {
		socket.emit('start');
		g_gameID = gameID;
		const context: any = canvas.current.getContext('2d');
		let frameCount: number = 0;
		let frameId: number;
		context.strokeStyle = 'black';
		context.font = "80 px Arial";
		context.textAlign = "center";
		context.lineWidth = 1;
		ball = new Ball(width/2, height/2, 50, context, gameID);
		ball.speedX = 5;
		socket.on('ballSpeedY', (speed: string) => {
            ball.speedY = parseInt(speed);
        })
		socket.on('right up', () => {
            console.log("right player up");
			paddleRight.y -= 3;
        })
		socket.on('left up', () => {
            console.log("left player up");
			paddleLeft.y -= 3
        })
		socket.on('right down', () => {
            console.log("right player down");
			paddleRight.y += 3
        })
		socket.on('left down', () => {
            console.log("left player down");
			paddleLeft.y += 3
        })
		paddleLeft = new Paddle(15, height/2, 30, 200, context);
		paddleRight = new Paddle(width-15, height/2, 30, 200, context);

		const render = () => {
			frameCount++;
			draw(context, socket);
			frameId = window.requestAnimationFrame(render);
		}
		render();
		
		return () => {
			window.cancelAnimationFrame(frameId);
			socket.off('ballSpeedY')
			socket.off('right up')
			socket.off('left up')
			socket.off('right down')
			socket.off('left down')
		}
    }, []);

    return (
		<canvas ref={canvas} height="500" width="500" style={{ border: "1px solid black" }}/>
	);
};

export default GameLogic;