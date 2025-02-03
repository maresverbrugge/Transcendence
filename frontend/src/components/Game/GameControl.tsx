import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';

let scoreLeft: number = 0;
let scoreRight: number = 0;

class Ball {
  x: number;
  y: number;
  diameter: number;
  speedX: number;
  speedY: number;
  context: any;
  gameID: number;
  socket: Socket;
  constructor(x: number, y: number, diameter: number, context: any, gameID: number, socket: Socket) {
    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.speedX = 0;
    this.speedY = 0;
    this.context = context;
    this.gameID = gameID;
	this.socket = socket;
  }
  left() {
    return this.x - this.diameter / 2;
  }
  right() {
    return this.x + this.diameter / 2;
  }
  top() {
    return this.y - this.diameter / 2;
  }
  bottom() {
    return this.y + this.diameter / 2;
  }
  move(width: number, height: number) {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.right() > width) {
      scoreLeft += 1;
      this.socket.emit('left scored', this.gameID);
      this.x = width / 2;
      this.y = height / 2;
    }
    if (this.left() < 0) {
      scoreRight += 1;
      this.socket.emit('right scored', this.gameID);
      this.x = width / 2;
      this.y = height / 2;
    }
    if (this.bottom() > height) {
      this.socket.emit('reverse ball speedY', this.gameID);
    }
    if (this.top() < 0) {
      this.socket.emit('reverse ball speedY', this.gameID);
    }
  }
  display() {
    this.context.beginPath();
    this.context.arc(this.x, this.y, this.diameter / 2, 0, 2 * Math.PI);
    this.context.stroke();
  }
}

class Paddle {
  x: number;
  y: number;
  w: number;
  h: number;
  context: any;
  skinPath: string;
  topPosition: number;
  img: any;
  constructor(x: number, y: number, w: number, h: number, context: any, skin: string) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
	this.topPosition = this.y - this.h / 2;
    this.context = context;
	this.skinPath = "";
	if (skin === "option1")
		this.skinPath = "http://localhost:3001/images/pexels-lum3n-44775-406014.jpg";
	if (skin === "option2")
		this.skinPath = "http://localhost:3001/images/pexels-pixabay-259915.jpg";
	if (this.skinPath != "")
	{
		this.img = document.createElement("img");
		this.img.src = this.skinPath;
		this.img.width = this.w;
		this.img.height = this.h;

		// This next line will just add it to the <body> tag
		document.body.appendChild(this.img);
		this.img.setAttribute("style", "position:absolute;");;
		this.img.style.top = `${(window.innerHeight / 2) - (this.h / 2)}px`;
		this.img.style.left = `${this.x + (window.innerWidth / 2 - 250) - 20}px`;
	}
  }
  left() {
    return this.x - this.w / 2;
  }
  right() {
    return this.x + this.w / 2;
  }
  top() {
    return this.y - this.h / 2;
  }
  bottom() {
    return this.y + this.h / 2;
  }
  display(height: number) {
    if (this.bottom() > height) {
      this.y = height - this.h / 2;
    }
    if (this.top() < 0) {
      this.y = this.h / 2;
    }
    this.context.beginPath();
    this.context.rect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
    this.context.stroke();
  }
}

const createKeyHandler = (socket: Socket, gameID: number, token: string) => {
  return (event: KeyboardEvent) => {
    let move: string | undefined;
    if (event.key === 'ArrowUp') {
      move = 'up';
    } else if (event.key === 'ArrowDown') {
      move = 'down';
    }

    if (move) {
      socket.emit('key', move, gameID, token);
    }
  };
};

const GameLogic = ({ socket, skin, token }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [gameID, setGameID] = useState<number | null>(null);
  const navigate = useNavigate();
  const [scoreLeft, setScoreLeft] = useState(0);
  const [scoreRight, setScoreRight] = useState(0);
  const [end, setEnd] = useState(false);
  const width = 500;
  const height = 500;
  let ball: Ball;
  let paddleLeft: Paddle;
  let paddleRight: Paddle;

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      setContext(ctx);
    }
  }, []);

  useEffect(() => {
    if (!context || gameID === null) return;

    ball = new Ball(width / 2, height / 2, 50, context, gameID, socket);
    paddleLeft = new Paddle(15, height / 2, 40, 200, context, skin);
    paddleRight = new Paddle(width - 15, height / 2, 40, 200, context, skin);
    socket.emit('start', gameID);

    let frameId: number;

    const draw = () => {
      if (end) return;

      context.clearRect(0, 0, width, height);
      context.strokeStyle = 'black';
      context.fillStyle = 'black';

      ball.move(width, height);
      ball.display();
      paddleLeft.display(height);
      paddleRight.display(height);

      if (ball.left() < paddleLeft.right() && ball.y > paddleLeft.top() && ball.y < paddleLeft.bottom()) {
        ball.speedX = -ball.speedX;
        socket.emit('hitPaddle', gameID, ball.y - paddleLeft.y, paddleLeft.h / 2);
      }
      if (ball.right() > paddleRight.left() && ball.y > paddleRight.top() && ball.y < paddleRight.bottom()) {
        ball.speedX = -ball.speedX;
        socket.emit('hitPaddle', gameID, ball.y - paddleRight.y, paddleRight.h / 2);
      }

      context.fillText(scoreRight.toString(), width / 2 + 30, 30); // Right score
      context.fillText(scoreLeft.toString(), width / 2 - 30, 30); // Left score

      if (Math.abs(scoreLeft - scoreRight) === 3) {
        socket.emit('done', gameID);
        context.fillText("You've won, nice game!", width / 2, height / 2);
        setEnd(true);
        ball.x = width / 2;
        ball.y = height / 2;
        ball.speedX = 0;
        ball.speedY = 0;
        setTimeout(() => navigate('/landingpage'), 2000);
      }

      frameId = requestAnimationFrame(draw);
    };

    draw();

    // Event listener for keydown
    const keyHandler = createKeyHandler(socket, gameID, token);
    document.addEventListener('keydown', keyHandler);

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [context, gameID, end]);

  useEffect(() => {
    socket.on('gameID', (id: number) => {
      setGameID(id);
      console.log("Received game ID:", id);
    });

    return () => {
      socket.off('gameID');
    };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} height="500" width="500" style={{ border: '1px solid black' }} />
    </div>
  );
};

export default GameLogic;
