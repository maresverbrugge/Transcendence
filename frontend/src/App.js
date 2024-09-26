import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// var paddleLeft;
// var paddleRight;
// var ball;
// var scoreLeft = 0; //send to the client
// var scoreRight = 0; //send to the client;
// var end = 0;
// up_arrow = 38;
// down_arrow = 40;
// w = 87;
// s = 83;

// class Ball {
// 	constructor(x, y, diameter, context) {
// 		this.x = x;
// 		this.y = y;
// 		this.diameter = diameter;
// 		this.speedX = 0;
// 		this.speedY = 0;
// 		this.context = context;
// 	}
// 	left() {
// 		return this.x-this.diameter/2;
// 	};
// 	right() {
// 		return this.x+this.diameter/2;
// 	};
// 	top() {
// 		return this.y-this.diameter/2;
// 	};
// 	bottom() {
// 		return this.y+this.diameter/2;
// 	};
// 	move() {
// 		this.x += this.speedX;
// 		this.y += this.speedY;
// 	}
// 	display() {
// 		this.context.beginPath();
// 		this.context.arc(this.x,this.y,this.diameter / 2, 0, 2 * Math.PI);
// 		this.context.stroke();
// 	};
// };

// class Paddle{
// 	constructor(x, y, w, h, context) {
// 		this.x = x;
// 		this.y = y;
// 		this.w = w;
// 		this.h = h;
// 		this.speedY = 0; //get from client
// 		this.context = context;
// 	}
// 	left() {
// 		return this.x-this.w/2;
// 	};
// 	right() {
// 		return this.x+this.w/2;
// 	};
// 	top() {
// 		return this.y-this.h/2;
// 	};
// 	bottom() {
// 		return this.y+this.h/2;
// 	};
// 	display(height) {
// 		if (this.bottom() > height) {
// 			this.y = height-this.h/2;
// 		}
// 		if (this.top() < 0) {
// 			this.y = this.h/2;
// 		}
// 		this.context.beginPath();
// 		this.context.rect(this.x-this.w/2,this.y-this.h/2,this.w,this.h);
// 		this.context.stroke();
// 	};
// };

// window.onkeydown = function(press){
// 	if (end === 0 && press.keyCode === up_arrow){
// 		ws.send("right up");
// 		this.paddleRight.y -= 3;
// 	}
// 	if (end === 0 && press.keyCode === down_arrow){
// 		ws.send("right down");
// 		this.paddleRight.y += 3;
// 	}
// 	if (end === 0 && press.keyCode === w){
// 		ws.send("left up");
// 		this.paddleLeft.y -= 3;
// 	}
// 	if (end === 0 && press.keyCode === s){
// 		ws.send("left down");
// 		this.paddleLeft.y += 3;
// 	}
// }

// function map_range(value, low1, high1, low2, high2) {
// 	return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
// }
	
// class DrawingApp {
// 	constructor() {
// 		var canvas = document.getElementById('canvas');
// 		var context = canvas.getContext("2d");
// 		const [socket, setSocket] = useState(null);
// 		useEffect(() => {
// 			// Initialize socket connection
// 			const this.socketIo = io('http://localhost:3001', {
// 				transports: ['websocket', 'polling'],
// 			});
		
// 			// Set socket instance in state
// 			setSocket(this.socketIo);
		
// 			// Handle incoming messages
// 			this.socketIo.on('message', (data) => {
// 				socket.emit('message', {sender: 'them', message: 'we had this message'});
// 			});
		
// 			// Cleanup on component unmount
// 			return () => {
// 				this.socketIo.disconnect();
// 			};
// 		}, []);
// 		context.strokeStyle = 'black';
// 		context.font = "80 px Arial";
// 		context.textAlign = "center";
// 		context.lineWidth = 1;
// 		this.width = canvas.width;
// 		this.height = canvas.height;
// 		this.context = context;
// 		ball = new Ball(this.width/2, this.height/2, 50, context);
// 		paddleLeft = new Paddle(15, this.height/2, 30, 200, context);
// 		paddleRight = new Paddle(this.width-15, this.height/2, 30, 200, context);
// 	};
// 	redraw() {
// 		this.context.clearRect(0, 0, this.width, this.height);
// 		ball.move(this.width, this.height);
// 		ball.display();
// 		paddleLeft.display(this.height);
// 		paddleRight.display(this.height);
// 		if (ball.left() < paddleLeft.right() && ball.y > paddleLeft.top() && ball.y < paddleLeft.bottom()){
// 			ball.speedX = -ball.speedX;
// 			ball.speedY = map_range(ball.y - paddleLeft.y, -paddleLeft.h/2, paddleLeft.h/2, -10, 10);
// 		}
		
// 		if (ball.right() > paddleRight.left() && ball.y > paddleRight.top() && ball.y < paddleRight.bottom()) {
// 			ball.speedX = -ball.speedX;
// 			ball.speedY = map_range(ball.y - paddleRight.y, -paddleRight.h/2, paddleRight.h/2, -10, 10);
// 		}
// 		this.context.fillText(scoreRight, this.width/2 + 30, 30); // Right side score
// 		this.context.fillText(scoreLeft, this.width/2 - 30, 30); // Left side score
// 		if (scoreLeft - scoreRight === 3 || scoreRight - scoreLeft === 3) {
// 			this.context.fillText("You've won, nice game!", this.width/2, this.height/2);
// 			end = 1;
// 			ball.x = this.width/2;
// 			ball.y = this.height/2;
// 			ball.speedX = 0;
// 			ball.speedY = 0;
// 		}
// 		socket.emit('message', {sender: 'me', message: 'a frame is made'});
// 		window.requestAnimationFrame(this.redraw.bind(this));
// 	};
// };

const GameApp = () => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const socketIo = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
    });

    // Set socket instance in state
    setSocket(socketIo);

    // Handle incoming messages
    socketIo.on('message', (data) => {
		console.log('received a message');
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Cleanup on component unmount
    return () => {
      socketIo.disconnect();
    };
  }, []);
  return (
	<>
  <meta charSet="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>React App</title>
  <canvas
    id="canvas"
    width={500}
    height={500}
    style={{ border: "1px solid black" }}
  ></canvas>
  <p>Canvas demo</p>
</>
  );
};

export default GameApp;