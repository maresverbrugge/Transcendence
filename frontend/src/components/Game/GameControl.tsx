import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import { Button } from 'react-bootstrap';

class Ball {
  x: number;
  y: number;
  diameter: number;
  speedX: number;
  speedY: number;
  context: any;
  gameID: number;
  socket: Socket;
  token: string;
  constructor(x: number, y: number, diameter: number, context: any, gameID: number, socket: Socket, token: string) {
    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.speedX = 0;
    this.speedY = 0;
    this.context = context;
    this.gameID = gameID;
	this.socket = socket;
	this.token = token;
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
      this.socket.emit('left scored', { gameID: this.gameID, token: this.token });
      this.x = width / 2;
      this.y = height / 2;
	  this.speedX *= -1;
    }
    if (this.left() < 0) {
      this.socket.emit('right scored', { gameID: this.gameID, token: this.token });
      this.x = width / 2;
      this.y = height / 2;
	  this.speedX *= -1;
    }
    if (this.bottom() > height) {
      this.socket.emit('reverse ball speedY', {gameID: this.gameID, token: this.token});
	  this.speedY *= -1;
    }
    if (this.top() < 0) {
      this.socket.emit('reverse ball speedY', {gameID: this.gameID, token: this.token});
	  this.speedY *= -1;
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
	if (this.img) {
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
      socket.emit('key', { move: move, gameID: gameID, token: token });
    }
  };
};

const GameLogic = ({ socket, skin, token }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [gameID, setGameID] = useState<number | null>(null);
  const navigate = useNavigate();
  const [side, setSide] = useState(0);
  const [scoreLeft, setScoreLeft] = useState(0);
  const [scoreRight, setScoreRight] = useState(0);
  const [end, setEnd] = useState(false);
  const [disconnect, setDisconnect] = useState(false);
  const width = 500;
  const height = 500;
  const ballRef = useRef<Ball | null>(null);
  const paddleLeftRef = useRef<Paddle | null>(null);
  const paddleRightRef = useRef<Paddle | null>(null);
  const [playerLeft, setPlayerLeft] = useState<string>(null);
  const [playerRight, setPlayerRight] = useState<string>(null);
  const [lastHitSide, setLastHitSide] = useState<number>(0);

  useEffect(() => {
    if (canvasRef.current) {
		const ctx = canvasRef.current.getContext('2d');
		if (ctx) setContext(ctx);
	  }
  }, [canvasRef]);

  useEffect(() => {
	if (!context || gameID === null) return;
  
	ballRef.current = new Ball(width / 2, height / 2, 50, context, gameID, socket, token);
	paddleLeftRef.current = new Paddle(15, height / 2, 40, 200, context, skin);
	paddleRightRef.current = new Paddle(width - 15, height / 2, 40, 200, context, skin);

	setTimeout(() => {
		socket.emit('start', { token: token, gameID: gameID });
	  }, 1500);
  
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

    if (ballRef.current.left() < 40 && ballRef.current.y > paddleLeftRef.current.top() && ballRef.current.y < paddleLeftRef.current.bottom() && lastHitSide !== 1) {
		socket.emit('hit paddle', { gameID, value: ballRef.current.y - paddleLeftRef.current.y, oldHigh: paddleLeftRef.current.h / 2, token });
		console.log("before left")
		console.log(ballRef.current.speedX)
		ballRef.current.speedX = Math.abs(ballRef.current.speedX);
		console.log("after left")
		console.log(ballRef.current.speedX)
		ballRef.current.x = paddleLeftRef.current.right() + 27;
	  setLastHitSide(1);
    }
    if (ballRef.current.right() > width - 40 && ballRef.current.y > paddleRightRef.current.top() && ballRef.current.y < paddleRightRef.current.bottom() && lastHitSide !== 2) {
      socket.emit('hit paddle', { gameID, value: ballRef.current.y - paddleRightRef.current.y, oldHigh: paddleRightRef.current.h / 2, token });
	  console.log("before right")
	  console.log(ballRef.current.speedX)
	  ballRef.current.speedX = -1 * Math.abs(ballRef.current.speedX);
	  console.log("after right")
	  console.log(ballRef.current.speedX)
	  ballRef.current.x = paddleRightRef.current.left() - 27;
	  setLastHitSide(2);
    }

	ballRef.current.move(width, height);
	ballRef.current.display();
	paddleLeft.display(height);
	paddleRight.display(height);
	
    context.fillText(`${playerRight}: ${scoreRight}`, width / 2 + 30, 30);
    context.fillText(`${playerLeft}: ${scoreLeft}`, width / 2 - 30, 30);

    if (Math.abs(scoreLeft - scoreRight) === 3) {
      socket.emit('done', { gameID, token });
      ball.x = width / 2;
      ball.y = height / 2;
      ball.speedX = 0;
      ball.speedY = 0;
    }

      frameId = requestAnimationFrame(draw);
    };

	console.log(lastHitSide)

    draw();

    const keyHandler = createKeyHandler(socket, gameID, token);
    document.addEventListener('keydown', keyHandler);
	
    return () => {
		cancelAnimationFrame(frameId);
		document.removeEventListener('keydown', keyHandler);
    };
}, [context, gameID, end, scoreLeft, scoreRight, playerLeft, playerRight, lastHitSide]);

  useEffect(() => {
    socket.on('gameID', (id: number) => {
      setGameID(id);
    });
	socket.on('finished', () => {
		setEnd(true);
	  });
	socket.on('side', (side: number) => {
		setSide(side)
	  });
	socket.on('playerLeft', (playerName: string) => {
		setPlayerLeft(playerName);
	  });
	socket.on('playerRight', (playerName: string) => {
		setPlayerRight(playerName);
	  });
	socket.on('ballSpeedY', (speed: string) => {
		ballRef.current.speedY = parseInt(speed);
	});
	socket.on('ballSpeedX', (speed: string) => {
		if (ballRef.current.speedX === 0 || ballRef.current.x < 80 || ballRef.current.x > width - 80)
			ballRef.current.speedX = parseInt(speed);
	});
	socket.on('right up', () => {
	  paddleRightRef.current.y -= 12;
	});
	socket.on('left up', () => {
	  paddleLeftRef.current.y -= 12;
	});
	socket.on('right down', () => {
	  paddleRightRef.current.y += 12;
	});
	socket.on('left down', () => {
	  paddleLeftRef.current.y += 12;
	});
	socket.on('left score', () => {
		setScoreLeft(prev => prev + 1);
		setLastHitSide(0);
	  });
	socket.on('right score', () => {
		setScoreRight(prev => prev + 1);
		setLastHitSide(0);
	  });
	socket.on('disconnection', () => {
		setEnd(true);
		setDisconnect(true);
	  });

    return () => {
    socket.off('gameID');
	socket.off('finished');
	socket.off('side');
	socket.off('playerLeft');
	socket.off('playerRight');
	socket.off('ballSpeedY');
	socket.off('ballSpeedX');
	socket.off('right up');
	socket.off('left up');
	socket.off('right down');
	socket.off('left down');
	socket.off('left score');
	socket.off('right score');
	socket.off('disconnection');
    };
  }, []);

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
		<canvas ref={canvasRef} height="500" width="500" className="border border-light rounded" />
          {!disconnect && end && side == 0 && scoreLeft > scoreRight && (
            <div className="mt-3">
              <h4 className="text-success">You won, yay!</h4>
              <Button variant="outline-light" onClick={() => navigate('/main')}>
                Back to Main Menu
              </Button>
            </div>
          )}
		  {!disconnect && end && side == 0 && scoreRight > scoreLeft && (
            <div className="mt-3">
              <h4 className="text-success">You lose, better luck next time!</h4>
              <Button variant="outline-light" onClick={() => navigate('/main')}>
                Back to Main Menu
              </Button>
            </div>
          )}
		  {!disconnect && end && side == 1 && scoreRight > scoreLeft && (
            <div className="mt-3">
              <h4 className="text-success">You won, yay!</h4>
              <Button variant="outline-light" onClick={() => navigate('/main')}>
                Back to Main Menu
              </Button>
            </div>
          )}
		  {!disconnect && end && side == 1 && scoreLeft > scoreRight && (
            <div className="mt-3">
              <h4 className="text-success">You lose, better luck next time!</h4>
              <Button variant="outline-light" onClick={() => navigate('/main')}>
                Back to Main Menu
              </Button>
            </div>
          )}
		  {end && disconnect && (
            <div className="mt-3">
              <h4 className="text-success">Your game got interrupted</h4>
              <Button variant="outline-light" onClick={() => navigate('/main')}>
                Back to Main Menu
              </Button>
            </div>
          )}
    </div>
  );
};

export default GameLogic;
