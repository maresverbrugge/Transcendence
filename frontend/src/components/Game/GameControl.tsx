import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';

class Ball {
  x: number;
  y: number;
  diameter: number;
  speedX: number;
  speedY: number;
  context: any;
  gameID: number;
  socket: Socket;
  setScoreLeft: React.Dispatch<React.SetStateAction<number>>;
  setScoreRight: React.Dispatch<React.SetStateAction<number>>;
  constructor(x: number, y: number, diameter: number, context: any, gameID: number, socket: Socket, setScoreLeft: React.Dispatch<React.SetStateAction<number>>, setScoreRight: React.Dispatch<React.SetStateAction<number>>) {
    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.speedX = 0;
    this.speedY = 0;
    this.context = context;
    this.gameID = gameID;
	this.socket = socket;
	this.setScoreLeft = setScoreLeft;
    this.setScoreRight = setScoreRight;
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
		this.setScoreLeft(prev => prev + 1);
      this.socket.emit('left scored', this.gameID);
      this.x = width / 2;
      this.y = height / 2;
    }
    if (this.left() < 0) {
		this.setScoreRight(prev => prev + 1);
      this.socket.emit('right scored', this.gameID);
      this.x = width / 2;
      this.y = height / 2;
    }
    if (this.bottom() > height) {
      this.socket.emit('reverse ballRef speedY', this.gameID);
    }
    if (this.top() < 0) {
      this.socket.emit('reverse ballRef speedY', this.gameID);
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
  skinPath: string;
  topPosition: number;
  context: CanvasRenderingContext2D;
  img: HTMLImageElement | null;
  constructor(x: number, y: number, w: number, h: number, context: any, skin: string) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
	this.topPosition = (window.innerHeight / 2) - (this.h / 2);
    this.context = context;
	this.img = new Image();
	if (skin === "option1") {
		this.img.src = `${process.env.REACT_APP_URL_BACKEND}/images/pexels-lum3n-44775-406014.jpg`;
	  } else if (skin === "option2") {
		this.img.src = `${process.env.REACT_APP_URL_BACKEND}/images/pexels-pixabay-259915.jpg`;
	  } else {
		this.img = null;
	  }
	  console.log(this.img.complete)
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
	if (this.img && this.img.complete) {
		this.context.drawImage(this.img, this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
	  }
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
      socket.emit('key', { move, gameID, token });
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
  const ballRef = useRef<Ball | null>(null);
  const paddleLeftRef = useRef<Paddle | null>(null);
  const paddleRightRef = useRef<Paddle | null>(null);


  useEffect(() => {
    if (canvasRef.current) {
		const ctx = canvasRef.current.getContext('2d');
		if (ctx) setContext(ctx);
	  }
  }, [canvasRef]);

  useEffect(() => {
	if (!context || gameID === null) return;
  
	ballRef.current = new Ball(width / 2, height / 2, 50, context, gameID, socket, setScoreLeft, setScoreRight);
	paddleLeftRef.current = new Paddle(15, height / 2, 40, 200, context, skin);
	paddleRightRef.current = new Paddle(width - 15, height / 2, 40, 200, context, skin);
  
	socket.emit('start', { token, gameID });
  
  }, [context, gameID]);
  

  useEffect(() => {
	if (!context || gameID === null) return;
    let frameId: number;

    const draw = () => {
      if (end) return;

      context.clearRect(0, 0, width, height);
      context.strokeStyle = 'black';
      context.fillStyle = 'black';

      const ball = ballRef.current;
    const paddleLeft = paddleLeftRef.current;
    const paddleRight = paddleRightRef.current;

    if (!ball || !paddleLeft || !paddleRight) return;

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

    context.fillText(scoreRight.toString(), width / 2 + 30, 30);
    context.fillText(scoreLeft.toString(), width / 2 - 30, 30);

    if (Math.abs(scoreLeft - scoreRight) === 3) {
      socket.emit('done', gameID);
      context.fillText("You've won, nice game!", width / 2, height / 2);
      setEnd(true);
      ball.x = width / 2;
      ball.y = height / 2;
      ball.speedX = 0;
      ball.speedY = 0;
      setTimeout(() => navigate('/main'), 2000);
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
  }, [context, gameID, end, scoreLeft, scoreRight]);

  useEffect(() => {
    socket.on('gameID', (id: number) => {
      setGameID(id);
      console.log("Received game ID:", id);
    });
	socket.on('ballSpeedY', (speed: string) => {
		console.log(speed)
	  ballRef.current.speedY = parseInt(speed);
	});
	socket.on('ballSpeedX', (speed: string) => {
		ballRef.current.speedX = parseInt(speed);
	});
	socket.on('right up', () => {
	  console.log('right player up');
	  paddleRightRef.current.y -= 3;
	});
	socket.on('left up', () => {
	  console.log('left player up');
	  paddleLeftRef.current.y -= 3;
	});
	socket.on('right down', () => {
	  console.log('right player down');
	  paddleRightRef.current.y += 3;
	});
	socket.on('left down', () => {
	  console.log('left player down');
	  paddleLeftRef.current.y += 3;
	});

    return () => {
      socket.off('gameID');
	  socket.off('ballSpeedY');
	socket.off('ballSpeedX');
	socket.off('right up');
	socket.off('left up');
	socket.off('right down');
	socket.off('left down');
    };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} height="500" width="500" style={{ border: '1px solid black' }} />
    </div>
  );
};

export default GameLogic;
