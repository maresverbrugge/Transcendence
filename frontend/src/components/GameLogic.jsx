import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import './Channels.css'; // Import the CSS file

var g_socket;
var end = 0;
var paddleLeft;
var paddleRight;
var scoreLeft = 0;
var scoreRight = 0;

class Ball {
	constructor(x, y, diameter, context) {
		this.x = x;
		this.y = y;
		this.diameter = diameter;
		this.speedX = 0;
		this.speedY = 0;
		this.context = context;
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
	move(width, height) {
		this.x += this.speedX;
		this.y += this.speedY;
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
	}
	display() {
		this.context.beginPath();
		this.context.arc(this.x,this.y,this.diameter / 2, 0, 2 * Math.PI);
		this.context.stroke();
	};
};

class Paddle{
	constructor(x, y, w, h, context) {
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
	display(height) {
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

window.onkeydown = function(press){
	if (end === 0 && press.keyCode === 38){
		g_socket.emit("up");
		paddleRight.y -= 3;
	}
	if (end === 0 && press.keyCode === 40){
		g_socket.emit("down");
		paddleRight.y += 3;
	}
}

function map_range(value, low1, high1, low2, high2) {
	return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

const GameLogic = ({ game, socket }) => {
    const canvas = React.useRef();
	var width = 500;
	var height = 500;
	var ball;
	const draw = (ctx, socket) => {
		// socket.emit('frame');
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
			ctx.fillText("You've won, nice game!", width/2, height/2);
			end = 1;
			ball.x = width/2;
			ball.y = height/2;
			ball.speedX = 0;
			ball.speedY = 0;
		}
	}
	
    useEffect(() => {
		g_socket = socket;
		const context = canvas.current.getContext('2d');
		let frameCount = 0;
		let frameId;
		context.strokeStyle = 'black';
		context.font = "80 px Arial";
		context.textAlign = "center";
		context.lineWidth = 1;
		ball = new Ball(width/2, height/2, 50, context);
		ball.speedX = 5;
		ball.speedY = Math.floor(Math.random() * 6 - 3); //get from server
		paddleLeft = new Paddle(15, height/2, 30, 200, context);
		paddleRight = new Paddle(width-15, height/2, 30, 200, context);

		const render = () => {
			frameCount++;
			draw(context, socket);
			frameId = window.requestAnimationFrame(render);
		}
		render();
		
		socket.on('newGame', (game) => {
			setGames((prevGames) => prevGames.concat(game))
		})
		
		return () => {
			window.cancelAnimationFrame(frameId);
		}
    }, []);

    return (
		<canvas ref={canvas} height="500" width="500" style={{ border: "1px solid black" }}/>
	);
};

export default GameLogic;