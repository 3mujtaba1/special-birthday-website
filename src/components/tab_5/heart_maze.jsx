import React, { useEffect, useRef, useState } from 'react';
import './heart_maze.css';


const HeartMazeGame = () => {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);

  // Game data and configuration
  const gameData = {
    mazeLayout: [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,1,0,0,0,0,0,0,1],
      [1,0,1,0,1,0,1,1,1,1,0,1],
      [1,0,1,0,0,0,0,0,0,1,0,1],
      [1,0,1,1,1,1,1,1,0,1,0,1],
      [1,0,0,0,0,0,0,1,0,0,0,1],
      [1,1,1,1,0,1,0,1,1,1,0,1],
      [1,0,0,0,0,1,0,0,0,1,0,1],
      [1,0,1,1,1,1,1,1,0,1,0,1],
      [1,0,0,0,0,0,0,0,0,1,0,1],
      [1,1,1,1,1,1,1,1,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    startPosition: {x: 1, y: 1},
    goalPosition: {x: 10, y: 10},
    tileSize: 32,
    gameMessage: "Just like this maze, I'll always find my way to you 🥰 !",
    instructions: "Use ← ↑ → ↓ or tap to move. Reach the glowing heart.",
    colors: {
      background: "#1a1a2e",
      stars: "#ffd700",
      mazePath: "#2d2d54",
      mazeWall: "#16213e",
      playerHeart: "#ff6b9d",
      goalHeart: "#ffd700",
      sparkles: "#ffffff"
    },
    difficulty: "hard",
    gridSize: 12
  };

  const [showInstructions, setShowInstructions] = useState(true);
  const [gameWon, setGameWon] = useState(false);
  const [victoryMessage, setVictoryMessage] = useState("");
  const [showReplay, setShowReplay] = useState(false);

  useEffect(() => {
    // Hide instructions after 3 seconds
    const timer = setTimeout(() => {
      setShowInstructions(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      gameRef.current = new Game(canvasRef.current, gameData, {
        setGameWon,
        setVictoryMessage,
        setShowReplay
      });
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy();
      }
    };
  }, []);

  const handleReplay = () => {
    setGameWon(false);
    setVictoryMessage("");
    setShowReplay(false);
    setShowInstructions(true);
    
    if (gameRef.current) {
      gameRef.current.restart();
    }

    setTimeout(() => {
      setShowInstructions(false);
    }, 3000);
  };

  const handleMobileControl = (direction) => {
    if (gameRef.current) {
      gameRef.current.handleMove(direction);
    }
  };

  // Create stars array for background
  const stars = Array.from({length: 18}, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 4
  }));

  return (
    <div className="heartMaze_gameContainer">
      {/* Stars Background */}
      <div className="heartMaze_starsBackground">
        {stars.map(star => (
          <div
            key={star.id}
            className="heartMaze_star"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.delay}s`
            }}
          />
        ))}
      </div>

      {/* Game Panel */}
      <div className="heartMaze_gamePanel">
        <h1 className="heartMaze_gameTitle">Heart Maze</h1>
        
        {/* Instructions overlay */}
        {showInstructions && (
          <div className="heartMaze_instructionsOverlay">
            <div className="heartMaze_instructionsText">
              Use ← ↑ → ↓ or tap to move. Reach the glowing heart.
            </div>
          </div>
        )}

        {/* Victory overlay */}
        {gameWon && (
          <div className="heartMaze_victoryOverlay">
            <div className="heartMaze_victoryMessage">
              {victoryMessage}
            </div>
            {showReplay && (
              <button 
                className="heartMaze_replayBtn"
                onClick={handleReplay}
              >
                Play Again
              </button>
            )}
            <button className="heartMaze_gameZoneBtn" onClick={() => window.location.href = '/games'}>🎮 Go To Game Zone</button>
          </div>
        )}

        {/* Game canvas */}
        <div className="heartMaze_canvasContainer">
          <canvas ref={canvasRef} width="384" height="384" />
          
          {/* Mobile controls */}
          <div className="heartMaze_mobileControls">
            <div className="heartMaze_controlPad">
              <button 
                className="heartMaze_controlBtn heartMaze_controlUp"
                onClick={() => handleMobileControl('up')}
              >
                ↑
              </button>
              <div className="heartMaze_controlMiddle">
                <button 
                  className="heartMaze_controlBtn heartMaze_controlLeft"
                  onClick={() => handleMobileControl('left')}
                >
                  ←
                </button>
                <button 
                  className="heartMaze_controlBtn heartMaze_controlRight"
                  onClick={() => handleMobileControl('right')}
                >
                  →
                </button>
              </div>
              <button 
                className="heartMaze_controlBtn heartMaze_controlDown"
                onClick={() => handleMobileControl('down')}
              >
                ↓
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Game class implementation
class Game {
  constructor(canvas, gameData, callbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gameData = gameData;
    this.callbacks = callbacks;
    this.player = { x: gameData.startPosition.x, y: gameData.startPosition.y };
    this.goal = { x: gameData.goalPosition.x, y: gameData.goalPosition.y };
    this.isMoving = false;
    this.gameWon = false;
    this.animationTime = 0;
    this.pulseTime = 0;
    this.goalPulseTime = 0;
    this.shakeTime = 0;
    this.shakeOffset = { x: 0, y: 0 };
    this.particles = [];
    this.victoryMessageIndex = 0;
    this.victoryMessageTimer = 0;
    this.animationId = null;
    
    this.setupCanvas();
    this.setupEventListeners();
    this.gameLoop();
  }
  
  setupCanvas() {
    const mazeWidth = this.gameData.mazeLayout[0].length * this.gameData.tileSize;
    const mazeHeight = this.gameData.mazeLayout.length * this.gameData.tileSize;
    this.canvas.width = mazeWidth;
    this.canvas.height = mazeHeight;
  }
  
  setupEventListeners() {
    this.keyHandler = (e) => {
      if (this.gameWon) return;
      
      const directions = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right'
      };
      
      if (directions[e.key]) {
        e.preventDefault();
        this.handleMove(directions[e.key]);
      }
    };
    
    document.addEventListener('keydown', this.keyHandler);
  }
  
  handleMove(direction) {
    if (this.isMoving || this.gameWon) return;
    
    const directions = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 }
    };
    
    const move = directions[direction];
    const newX = this.player.x + move.x;
    const newY = this.player.y + move.y;
    
    // Check bounds
    if (newX < 0 || newX >= this.gameData.mazeLayout[0].length || 
        newY < 0 || newY >= this.gameData.mazeLayout.length) {
      this.triggerShake();
      return;
    }
    
    // Check wall collision
    if (this.gameData.mazeLayout[newY][newX] === 1) {
      this.triggerShake();
      return;
    }
    
    // Move player
    this.isMoving = true;
    this.player.x = newX;
    this.player.y = newY;
    
    setTimeout(() => {
      this.isMoving = false;
      
      // Check win condition
      if (this.player.x === this.goal.x && this.player.y === this.goal.y) {
        this.triggerVictory();
      }
    }, 200);
  }
  
  triggerShake() {
    this.shakeTime = 300; // 300ms shake
  }
  
  triggerVictory() {
    this.gameWon = true;
    this.callbacks.setGameWon(true);
    this.createParticles();
    this.typeVictoryMessage();
  }
  
  createParticles() {
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1,
        decay: Math.random() * 0.02 + 0.01
      });
    }
  }
  
  typeVictoryMessage() {
    const message = this.gameData.gameMessage;
    this.victoryMessageIndex = 0;
    this.victoryMessageTimer = 0;
    
    const typeChar = () => {
      if (this.victoryMessageIndex < message.length) {
        this.callbacks.setVictoryMessage(message.substring(0, this.victoryMessageIndex + 1));
        this.victoryMessageIndex++;
        setTimeout(typeChar, 100);
      } else {
        setTimeout(() => {
          this.callbacks.setShowReplay(true);
        }, 500);
      }
    };
    
    setTimeout(typeChar, 1000);
  }
  
  gameLoop() {
    this.animationTime += 16;
    this.pulseTime += 0.1;
    this.goalPulseTime += 0.08;
    
    if (this.shakeTime > 0) {
      this.shakeTime -= 16;
      this.shakeOffset.x = (Math.random() - 0.5) * 4;
      this.shakeOffset.y = (Math.random() - 0.5) * 4;
    } else {
      this.shakeOffset.x = 0;
      this.shakeOffset.y = 0;
    }
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawMaze();
    this.drawPlayer();
    this.drawGoal();
    
    if (this.gameWon) {
      this.updateParticles();
      this.drawParticles();
    }
    
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }
  
  drawMaze() {
    for (let y = 0; y < this.gameData.mazeLayout.length; y++) {
      for (let x = 0; x < this.gameData.mazeLayout[y].length; x++) {
        const tileSize = this.gameData.tileSize;
        const drawX = x * tileSize;
        const drawY = y * tileSize;
        
        if (this.gameData.mazeLayout[y][x] === 1) {
          // Wall
          this.ctx.fillStyle = this.gameData.colors.mazeWall;
        } else {
          // Path
          this.ctx.fillStyle = this.gameData.colors.mazePath;
        }
        
        this.ctx.fillRect(drawX, drawY, tileSize, tileSize);
      }
    }
  }
  
  drawPlayer() {
    const tileSize = this.gameData.tileSize;
    const centerX = this.player.x * tileSize + tileSize / 2 + this.shakeOffset.x;
    const centerY = this.player.y * tileSize + tileSize / 2 + this.shakeOffset.y;
    const pulseScale = 1 + Math.sin(this.pulseTime) * 0.1;
    const heartSize = (tileSize * 0.4) * pulseScale;
    
    this.ctx.fillStyle = this.gameData.colors.playerHeart;
    this.drawHeart(centerX, centerY, heartSize);
  }
  
  drawGoal() {
    const tileSize = this.gameData.tileSize;
    const centerX = this.goal.x * tileSize + tileSize / 2;
    const centerY = this.goal.y * tileSize + tileSize / 2;
    const glowIntensity = 0.5 + Math.sin(this.goalPulseTime) * 0.3;
    const heartSize = tileSize * 0.45;
    
    // Draw glow
    const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, heartSize * 2);
    gradient.addColorStop(0, `rgba(255, 215, 0, ${glowIntensity})`);
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(centerX - heartSize, centerY - heartSize, heartSize * 2, heartSize * 2);
    
    // Draw heart
    this.ctx.fillStyle = this.gameData.colors.goalHeart;
    this.drawHeart(centerX, centerY, heartSize);
  }
  
  drawHeart(x, y, size) {
    this.ctx.beginPath();
    const topCurveHeight = size * 0.3;
    this.ctx.moveTo(x, y + topCurveHeight);
    // Left curve
    this.ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
    this.ctx.bezierCurveTo(x - size / 2, y + (topCurveHeight + size) / 2, x, y + (topCurveHeight + size) / 2, x, y + size);
    // Right curve
    this.ctx.bezierCurveTo(x, y + (topCurveHeight + size) / 2, x + size / 2, y + (topCurveHeight + size) / 2, x + size / 2, y + topCurveHeight);
    this.ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
    this.ctx.fill();
  }
  
  updateParticles() {
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= particle.decay;
      return particle.life > 0;
    });
  }
  
  drawParticles() {
    this.particles.forEach(particle => {
      this.ctx.save();
      this.ctx.globalAlpha = particle.life;
      this.ctx.fillStyle = this.gameData.colors.sparkles;
      this.ctx.fillRect(particle.x, particle.y, 3, 3);
      this.ctx.restore();
    });
  }
  
  restart() {
    this.player = { x: this.gameData.startPosition.x, y: this.gameData.startPosition.y };
    this.gameWon = false;
    this.particles = [];
    this.victoryMessageIndex = 0;
    this.shakeTime = 0;
    this.isMoving = false;
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    document.removeEventListener('keydown', this.keyHandler);
  }
}

export default HeartMazeGame;