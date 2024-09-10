class Ball {
	constructor(x, y, diameter, context) {
		this.x = x;
		this.y = y;
		this.diameter = diameter;
		this.speedX = 30;
		this.speedY = 30;
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
		this.y += this.speedY;
		this.x += this.speedX;
		if (this.right() > width) {
			// scoreLeft += 1;
			this.x = width/2;
			this.y = height/2;
		}
		if (this.left() < 0) {
			// scoreRight += 1;
			this.x = width/2;
			this.y = height/2;
		}
		if (this.bottom() > height) {
			this.speedY = -this.speedY;
		}
		if (this.top() < 0) {
			this.speedY = -this.speedY;
		}
	};
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
		this.speedX = 0; //get from client
		this.context = context;
	}
	move() {
		this.y += this.speedY;
		this.x += this.speedX;
	};
	//helper functions
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
	// keyPressed(){
		// 			if(keyCode == UP_ARROW){
			// 				paddleRight.speedY=-3;
	// 				}
	// 				if(keyCode == DOWN_ARROW){
		// 					paddleRight.speedY=3;
		// }
		// if(key == 'a'){
			// 	paddleLeft.speedY=-3;
			// 	}
	// 	if(key == 'z'){
	// 		paddleLeft.speedY=3;
	// 		}
	// 	}
	// keyReleased(){
		// 			if(keyCode == UP_ARROW){
			// paddleRight.speedY=0;
			// }
			// if(keyCode == DOWN_ARROW){
				// 	paddleRight.speedY=0;
				// 	}
				// if(key == 'a'){
					// 	paddleLeft.speedY=0;
	// 	}
	// 	if(key == 'z'){
		// paddleLeft.speedY=0;
		// }
	display() {
		// if (this.bottom() > height) {
		// 	this.y = height-this.h/2;
		// }
		// if (this.top() < 0) {
		// 	this.y = this.h/2;
		// }
		this.context.beginPath();
		this.context.rect(this.x-this.w/2,this.y-this.h/2,this.w,this.h);
		this.context.stroke();
	};
};

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}
	
class DrawingApp {
	constructor() {
		var canvas = document.getElementById('canvas');
		var context = canvas.getContext("2d");
		context.strokeStyle = 'black';
		context.font = "80 px Arial";
		context.textAlign = "center";
		context.lineWidth = 1;
		this.width = canvas.width;
		this.height = canvas.height;
		this.scoreLeft = 0; //send to the client
		this.scoreRight = 0; //send to the client;
		this.context = context;
		this.ball = new Ball(this.width/2, this.height/2, 50, context);
		this.ball.speedX = 5;
		this.ball.speedY = Math.random(-3,3);
		this.paddleLeft = new Paddle(15, this.height/2, 30, 200, context);
		this.paddleRight = new Paddle(this.width-15, this.height/2, 30, 200, context);
	};
	redraw() {
		this.context.clearRect(0, 0, this.width, this.height);
		this.ball.move();
		this.ball.display();
		// paddleLeft.move();
		this.paddleLeft.display();
		// paddleRight.move();
		this.paddleRight.display();
		if (this.ball.left() < this.paddleLeft.right() && this.ball.y > this.paddleLeft.top() && this.ball.y < this.paddleLeft.bottom()){
			this.ball.speedX = -this.ball.speedX;
			this.ball.speedY = map_range(this.ball.y - this.paddleLeft.y, -this.paddleLeft.h/2, this.paddleLeft.h/2, -10, 10);
		}
		
		if (this.ball.right() > this.paddleRight.left() && this.ball.y > this.paddleRight.top() && this.ball.y < this.paddleRight.bottom()) {
			this.ball.speedX = -this.ball.speedX;
			this.ball.speedY = map_range(this.ball.y - this.paddleRight.y, -this.paddleRight.h/2, this.paddleRight.h/2, -10, 10);
		}
		this.context.fillText(this.scoreRight, this.width/2 + 30, 30); // Right side score
		this.context.fillText(this.scoreLeft, this.width/2 - 30, 30); // Left side score
		if (this.scoreLeft - this.scoreRight === 3 || this.scoreRight - this.scoreLeft === 3) {
			this.context.fillText("You've won, nice game!", this.width/2, this.height/2);
			// this.ball.x = this.width/2;
			// this.ball.y = this.height/2;
			// this.ball.speedX = 0;
			// this.ball.speedY = 0;
		}
		window.requestAnimationFrame(this.redraw.bind(this));
	};
};
var drawingapp = new DrawingApp();
drawingapp.redraw();