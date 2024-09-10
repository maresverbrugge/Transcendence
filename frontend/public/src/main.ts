class Ball {
	x : number;
	y : number;
	diameter : number;
	speedX : number;
	speedY : number;
	context;
	constructor(x : number, y : number, diameter : number, context) {
		this.x = x;
		this.y = y;
		this.diameter = diameter;
		this.speedX = 30;
		this.speedY = 30;
		this.context = context;
	}
	left = function() {
		return this.x-this.diameter/2;
	};
	right = function() {
		return this.x+this.diameter/2;
	};
	top = function() {
		return this.y-this.diameter/2;
	};
	bottom = function() {
		return this.y+this.diameter/2;
	};
	move = function(width, height) {
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
	}
	display = function() {
		this.context.beginPath();
		this.context.arc(this.x,this.y,this.diameter / 2, 0, 2 * Math.PI);
		this.context.stroke();
	};
};

class Paddle{
	x : number;
	y : number;
	w : number;
	h : number;
	speedY : number;
	speedX : number;
	context;
	
	constructor(x : number, y : number, w : number, h : number, context) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.speedY = 0; //get from client
		this.speedX = 0; //get from client
		this.context = context;
	}
	move = function() {
		this.y += this.speedY;
		this.x += this.speedX;
	};
	//helper functions
	left = function() {
		return this.x-this.w/2;
	};
	right = function() {
		return this.x+this.w/2;
	};
	top = function() {
		return this.y-this.h/2;
	};
	bottom = function() {
		return this.y+this.h/2;
	}
	// 	function keyPressed(){
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
	// 	function keyReleased(){
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
	display = function() {
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
	
class DrawingApp {
	scoreLeft : number;
	scoreRight : number;
	width : number;
	height : number;
	canvas : any;
	context : any;
	ball : Ball;
	paddleLeft : Paddle;
	paddleRight : Paddle;
	constructor() {
		this.canvas = document.getElementById('canvas');
		this.context = this.canvas.getContext("2d");
		this.context.lineCap = 'round';
		this.context.lineJoin = 'round';
		this.context.strokeStyle = 'black';
		this.context.font = "80 px Arial";
		this.context.textAlign = "center";
		this.context.lineWidth = 1;
		var width = this.canvas.width;
		var height = this.canvas.height;
		this.scoreLeft = 0; //send to the client
		this.scoreRight = 0; //send to the client;
		this.ball = new Ball(width/2, height/2, 50, this.context);
		this.paddleLeft = new Paddle(15, height/2, 30, 200, this.context);
		this.paddleRight = new Paddle(width-15, height/2, 30, 200, this.context);
		this.redraw();
	};
	redraw = function () {
		var width = this.canvas.width;
		var height = this.canvas.height;
		// this.ball.speedX = 5;
		// this.ball.speedY = random(-3,3);
		// this.ball.move();
		this.ball.display();
		// paddleLeft.move();
		this.paddleLeft.display();
		// paddleRight.move();
		this.paddleRight.display();
		// if ( this.ball.left() < paddleLeft.right() && this.ball.y > paddleLeft.top() && this.ball.y < paddleLeft.bottom()){
		// 	this.ball.speedX = -this.ball.speedX;
		// 	this.ball.speedY = map(this.ball.y - paddleLeft.y, -paddleLeft.h/2, paddleLeft.h/2, -10, 10);
		// }
		
		// if ( this.ball.right() > paddleRight.left() && this.ball.y > paddleRight.top() && this.ball.y < paddleRight.bottom()) {
		// 	this.ball.speedX = -this.ball.speedX;
		// 	this.ball.speedY = map(this.ball.y - paddleRight.y, -paddleRight.h/2, paddleRight.h/2, -10, 10);
		// }
		this.context.fillText(this.scoreRight, width/2 + 30, 30); // Right side score
		this.context.fillText(this.scoreLeft, width/2 - 30, 30); // Left side score
		if (this.scoreLeft - this.scoreRight === 3 || this.scoreRight - this.scoreLeft === 3) {
			this.context.fillText("You've won, nice game!", width/2, height/2);
			// this.ball.x = width/2;
			// this.ball.y = height/2;
			// this.ball.speedX = 0;
			// this.ball.speedY = 0;
		}
	};
}
var drawingapp = new DrawingApp();
drawingapp.redraw();