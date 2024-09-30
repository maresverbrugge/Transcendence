import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

var end = 0;

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
	move() {
		this.x += this.speedX;
		this.y += this.speedY;
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
		ws.send("right up");
		this.paddleRight.y -= 3;
	}
	if (end === 0 && press.keyCode === 40){
		ws.send("right down");
		this.paddleRight.y += 3;
	}
	if (end === 0 && press.keyCode === 87){
		ws.send("left up");
		this.paddleLeft.y -= 3;
	}
	if (end === 0 && press.keyCode === 83){
		ws.send("left down");
		this.paddleLeft.y += 3;
	}
}

function map_range(value, low1, high1, low2, high2) {
	return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

const GameApp = () => {
	// const [messages, setMessages] = useState([]);
	// const [socket, setSocket] = useState(null);
	const canvas = React.useRef();
	var width = 500;
	var height = 500;
	var paddleLeft;
	var paddleRight;
	var ball;
	const [scoreLeft, setScoreLeft] = useState(0); //send to the client
	const [scoreRight, setScoreRight] = useState(0); //send to the client;
	const draw = (ctx) => {
		ctx.clearRect(0, 0, width, height)
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
		  const context = canvas.current.getContext('2d');
	let frameCount = 0;
	let frameId;
	context.strokeStyle = 'black';
	context.font = "80 px Arial";
	context.textAlign = "center";
	context.lineWidth = 1;
	ball = new Ball(width/2, height/2, 50, context);
	paddleLeft = new Paddle(15, height/2, 30, 200, context);
	paddleRight = new Paddle(width-15, height/2, 30, 200, context);
    // Initialize socket connection
    // const socketIo = io('http://localhost:3001', {
    //   transports: ['websocket', 'polling'],
    // });

    // // Set socket instance in state
    // setSocket(socketIo);

    // // Handle incoming messages
    // socketIo.on('message', (data) => {
	// 	console.log('received a message');
    //   setMessages((prevMessages) => [...prevMessages, data]);
    // });

    // // Cleanup on component unmount
    // return () => {
    //   socketIo.disconnect();
    // };
	const render = () => {
		frameCount++;
		draw(context);
		frameId = window.requestAnimationFrame(render);
	}
	render();
	return () => {
		window.cancelAnimationFrame(frameId);
	}
  }, [draw]);
  return <canvas ref={canvas} height="500" width="500" style={{ border: "1px solid black" }}/>;
};

export default GameApp;