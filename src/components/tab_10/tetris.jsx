import React, { useState, useEffect, useRef, useCallback } from 'react';
import './tetris.css'; // Import the CSS file

const MiniTetrisGifts = () => {
  const canvasRef = useRef(null);
  const nextCanvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const sparklesContainerRef = useRef(null);

  // Game constants
  const TETROMINOES = {
    "I": { shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: "#FFB6C1" },
    "O": { shape: [[1,1],[1,1]], color: "#FFD700" },
    "T": { shape: [[0,1,0],[1,1,1],[0,0,0]], color: "#87CEEB" },
    "S": { shape: [[0,1,1],[1,1,0],[0,0,0]], color: "#DDA0DD" },
    "Z": { shape: [[1,1,0],[0,1,1],[0,0,0]], color: "#F0E68C" },
    "J": { shape: [[1,0,0],[1,1,1],[0,0,0]], color: "#FFA07A" },
    "L": { shape: [[0,0,1],[1,1,1],[0,0,0]], color: "#98FB98" }
  };

  const GAME_SETTINGS = {
    gridWidth: 10,
    gridHeight: 20,
    blockSize: 30,
    initialSpeed: 1000,
    speedIncrease: 0.9,
    pointsPerRow: 100,
    pointsMultiplier: [100, 300, 500, 800]
  };

  // Game state
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  const gameStateRef = useRef({
    grid: Array(GAME_SETTINGS.gridHeight).fill().map(() => 
      Array(GAME_SETTINGS.gridWidth).fill(0)
    ),
    currentPiece: null,
    nextPiece: null,
    dropTime: 0,
    dropInterval: GAME_SETTINGS.initialSpeed,
    lastTime: 0
  });

  // Generate random piece
  const generatePiece = useCallback(() => {
    const types = Object.keys(TETROMINOES);
    const type = types[Math.floor(Math.random() * types.length)];
    return {
      type: type,
      shape: TETROMINOES[type].shape,
      color: TETROMINOES[type].color,
      x: Math.floor(GAME_SETTINGS.gridWidth / 2) - Math.floor(TETROMINOES[type].shape[0].length / 2),
      y: 0,
      rotation: 0
    };
  }, []);

  // Rotate piece matrix
  const rotatePiece = (piece) => {
    const rotated = [];
    const size = piece.shape.length;
    for (let i = 0; i < size; i++) {
      rotated[i] = [];
      for (let j = 0; j < size; j++) {
        rotated[i][j] = piece.shape[size - 1 - j][i];
      }
    }
    return { ...piece, shape: rotated };
  };

  // Check collision
  const checkCollision = (piece, grid, dx = 0, dy = 0) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] !== 0) {
          const newX = piece.x + x + dx;
          const newY = piece.y + y + dy;
          
          if (newX < 0 || newX >= GAME_SETTINGS.gridWidth ||
              newY >= GAME_SETTINGS.gridHeight ||
              (newY >= 0 && grid[newY][newX] !== 0)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Place piece on grid
  const placePiece = (piece, grid) => {
    const newGrid = grid.map(row => [...row]);
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] !== 0) {
          const gridY = piece.y + y;
          const gridX = piece.x + x;
          if (gridY >= 0 && gridY < GAME_SETTINGS.gridHeight && gridX >= 0 && gridX < GAME_SETTINGS.gridWidth) {
            newGrid[gridY][gridX] = piece.color;
          }
        }
      }
    }
    return newGrid;
  };

  // Clear completed lines - FIXED VERSION
  const clearLines = (grid) => {
    const clearedRows = [];
    let linesCleared = 0;
    
    // First, identify which rows are complete
    for (let y = 0; y < grid.length; y++) {
      if (grid[y].every(cell => cell !== 0)) {
        clearedRows.push(y);
        linesCleared++;
        // Add sparkle effect for cleared row
        createSparkleEffect(y);
      }
    }
    
    // If no lines to clear, return original grid
    if (linesCleared === 0) {
      return { grid: grid, linesCleared: 0, clearedRows: [] };
    }
    
    // Create new grid by filtering out complete rows
    const newGrid = [];
    for (let y = 0; y < grid.length; y++) {
      if (!clearedRows.includes(y)) {
        // Keep this row as it's not complete
        newGrid.push([...grid[y]]);
      }
    }
    
    // Add empty rows at the top to maintain grid height
    const emptyRowsNeeded = GAME_SETTINGS.gridHeight - newGrid.length;
    for (let i = 0; i < emptyRowsNeeded; i++) {
      newGrid.unshift(Array(GAME_SETTINGS.gridWidth).fill(0));
    }
    
    return { grid: newGrid, linesCleared, clearedRows };
  };

  // Create sparkle effect
  const createSparkleEffect = (row) => {
    const container = sparklesContainerRef.current;
    if (!container) return;

    const colors = ['#FFD700', '#FF69B4', '#00CED1', '#98FB98', '#DDA0DD'];
    
    for (let i = 0; i < 15; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.style.left = (Math.random() * 300) + 'px';
      sparkle.style.top = (row * GAME_SETTINGS.blockSize + Math.random() * GAME_SETTINGS.blockSize) + 'px';
      sparkle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      sparkle.style.animationDelay = (Math.random() * 0.3) + 's';
      sparkle.style.setProperty('--random-x', (Math.random() * 60 - 30) + 'px');
      
      container.appendChild(sparkle);
      
      setTimeout(() => {
        if (container.contains(sparkle)) {
          container.removeChild(sparkle);
        }
      }, 1200);
    }
  };

  // Draw game
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const nextCanvas = nextCanvasRef.current;
    if (!canvas || !nextCanvas) return;

    const ctx = canvas.getContext('2d');
    const nextCtx = nextCanvas.getContext('2d');
    const { grid, currentPiece, nextPiece } = gameStateRef.current;

    // Clear canvases
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    nextCtx.fillStyle = '#34495E';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    // Draw grid lines
    ctx.strokeStyle = '#34495E';
    ctx.lineWidth = 1;
    for (let x = 0; x <= GAME_SETTINGS.gridWidth; x++) {
      ctx.beginPath();
      ctx.moveTo(x * GAME_SETTINGS.blockSize, 0);
      ctx.lineTo(x * GAME_SETTINGS.blockSize, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= GAME_SETTINGS.gridHeight; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * GAME_SETTINGS.blockSize);
      ctx.lineTo(canvas.width, y * GAME_SETTINGS.blockSize);
      ctx.stroke();
    }

    // Draw placed pieces
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] !== 0) {
          drawGiftBlock(ctx, x * GAME_SETTINGS.blockSize, y * GAME_SETTINGS.blockSize, 
                       GAME_SETTINGS.blockSize, grid[y][x]);
        }
      }
    }

    // Draw current piece
    if (currentPiece) {
      ctx.globalAlpha = 1;
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x] !== 0) {
            const drawX = (currentPiece.x + x) * GAME_SETTINGS.blockSize;
            const drawY = (currentPiece.y + y) * GAME_SETTINGS.blockSize;
            drawGiftBlock(ctx, drawX, drawY, GAME_SETTINGS.blockSize, currentPiece.color);
          }
        }
      }
    }

    // Draw next piece
    if (nextPiece) {
      const offsetX = (nextCanvas.width - nextPiece.shape[0].length * 25) / 2;
      const offsetY = (nextCanvas.height - nextPiece.shape.length * 25) / 2;
      
      for (let y = 0; y < nextPiece.shape.length; y++) {
        for (let x = 0; x < nextPiece.shape[y].length; x++) {
          if (nextPiece.shape[y][x] !== 0) {
            drawGiftBlock(nextCtx, offsetX + x * 25, offsetY + y * 25, 25, nextPiece.color);
          }
        }
      }
    }

    // Draw game over overlay
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#ECF0F1';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🎁 GAME OVER 🎁', canvas.width / 2, canvas.height / 2 - 20);
      
      ctx.font = '16px Arial';
      ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 20);
    }
  }, [gameOver]);

  // Draw gift block with ribbon effect
  const drawGiftBlock = (ctx, x, y, size, color) => {
    // Main gift box
    const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, adjustBrightness(color, -20));
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
    
    // Ribbon (horizontal)
    ctx.fillStyle = adjustBrightness(color, -40);
    ctx.fillRect(x + 1, y + size * 0.4, size - 2, size * 0.2);
    
    // Ribbon (vertical)  
    ctx.fillRect(x + size * 0.4, y + 1, size * 0.2, size - 2);
    
    // Shine effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x + 2, y + 2, size * 0.3, size * 0.3);
    
    // Border
    ctx.strokeStyle = adjustBrightness(color, -50);
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
  };

  // Adjust color brightness
  const adjustBrightness = (color, amount) => {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Game loop - FIXED VERSION
  const gameLoop = useCallback((time) => {
    if (gameOver || paused) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const deltaTime = time - gameStateRef.current.lastTime;
    gameStateRef.current.lastTime = time;
    gameStateRef.current.dropTime += deltaTime;

    // Drop piece
    if (gameStateRef.current.dropTime > gameStateRef.current.dropInterval) {
      const currentPiece = gameStateRef.current.currentPiece;
      if (currentPiece && !checkCollision(currentPiece, gameStateRef.current.grid, 0, 1)) {
        currentPiece.y++;
      } else if (currentPiece) {
        // Place piece on grid
        const newGrid = placePiece(currentPiece, gameStateRef.current.grid);
        gameStateRef.current.grid = newGrid;
        
        // Clear completed lines
        const clearResult = clearLines(newGrid);
        gameStateRef.current.grid = clearResult.grid;
        
        // Update score and lines - FIXED LOGIC
        if (clearResult.linesCleared > 0) {
          const newLines = lines + clearResult.linesCleared;
          const scoreToAdd = GAME_SETTINGS.pointsMultiplier[Math.min(clearResult.linesCleared - 1, 3)] * level;
          
          setLines(newLines);
          setScore(prevScore => prevScore + scoreToAdd);
          
          // Level up every 10 lines
          const newLevel = Math.floor(newLines / 10) + 1;
          if (newLevel > level) {
            setLevel(newLevel);
            gameStateRef.current.dropInterval = GAME_SETTINGS.initialSpeed * Math.pow(GAME_SETTINGS.speedIncrease, newLevel - 1);
          }
        }
        
        // Spawn new piece
        gameStateRef.current.currentPiece = gameStateRef.current.nextPiece;
        gameStateRef.current.nextPiece = generatePiece();
        
        // Check game over
        if (checkCollision(gameStateRef.current.currentPiece, gameStateRef.current.grid)) {
          setGameOver(true);
          setShowGameOver(true);
        }
      }
      gameStateRef.current.dropTime = 0;
    }

    draw();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameOver, paused, level, lines, draw, generatePiece]);

  // Initialize game
  const initGame = useCallback(() => {
    gameStateRef.current = {
      grid: Array(GAME_SETTINGS.gridHeight).fill().map(() => 
        Array(GAME_SETTINGS.gridWidth).fill(0)
      ),
      currentPiece: generatePiece(),
      nextPiece: generatePiece(),
      dropTime: 0,
      dropInterval: GAME_SETTINGS.initialSpeed,
      lastTime: 0
    };
    
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setShowGameOver(false);
    setPaused(false);
  }, [generatePiece]);

  // Handle input
  const handleInput = useCallback((action) => {
    if (gameOver || paused) return;
    
    const currentPiece = gameStateRef.current.currentPiece;
    if (!currentPiece) return;
    
    switch (action) {
      case 'LEFT':
        if (!checkCollision(currentPiece, gameStateRef.current.grid, -1, 0)) {
          currentPiece.x--;
        }
        break;
      case 'RIGHT':
        if (!checkCollision(currentPiece, gameStateRef.current.grid, 1, 0)) {
          currentPiece.x++;
        }
        break;
      case 'DOWN':
        if (!checkCollision(currentPiece, gameStateRef.current.grid, 0, 1)) {
          currentPiece.y++;
          setScore(prev => prev + 1); // Soft drop bonus
        }
        break;
      case 'ROTATE':
        const rotated = rotatePiece(currentPiece);
        if (!checkCollision(rotated, gameStateRef.current.grid)) {
          Object.assign(currentPiece, rotated);
        }
        break;
      case 'DROP':
        let dropDistance = 0;
        while (!checkCollision(currentPiece, gameStateRef.current.grid, 0, 1)) {
          currentPiece.y++;
          dropDistance++;
        }
        if (dropDistance > 0) {
          setScore(prev => prev + dropDistance * 2); // Hard drop bonus
        }
        break;
    }
  }, [gameOver, paused]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handleInput('LEFT');
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleInput('RIGHT');
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleInput('DOWN');
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleInput('ROTATE');
          break;
        case ' ':
          e.preventDefault();
          handleInput('DROP');
          break;
        case 'r':
        case 'R':
          if (gameOver) {
            initGame();
          }
          break;
        case 'p':
        case 'P':
          setPaused(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleInput, gameOver, initGame]);

  // Start game loop
  useEffect(() => {
    initGame();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [initGame, gameLoop]);

  // Handle main page navigation
  const handleMainPage = () => {
    window.location.href = '/games'; 
  };

  return (
    <div className="mini-tetris-container">
      <div className="game-container">
        <button className="btn btn--outline main-page-btn" onClick={handleMainPage}>
          🎮 Go To Game Zone
        </button>
        
        <div className="game-header">
          <h1 className="game-title">🎁 Mini Tetris (Gift Blocks)</h1>
        </div>

        <div className="game-content">
          <div className="game-area">
            <canvas ref={canvasRef} width="300" height="600" />
            <div className="sparkles-container" ref={sparklesContainerRef}></div>
            
            {/* Pause Overlay */}
            {paused && (
              <div className="pause-overlay">
                <div className="pause-content">
                  <h2>⏸️ PAUSED</h2>
                  <p>Press P to continue</p>
                </div>
              </div>
            )}
          </div>

          <div className="game-info">
            <div className="info-card">
              <h3>Score</h3>
              <div className="score-display">{score.toLocaleString()}</div>
            </div>

            <div className="info-card">
              <h3>Level</h3>
              <div className="level-display">{level}</div>
            </div>

            <div className="info-card">
              <h3>Lines</h3>
              <div className="lines-display">{lines}</div>
            </div>

            <div className="info-card">
              <h3>Next Gift</h3>
              <canvas ref={nextCanvasRef} width="120" height="120" />
            </div>

            <div className="controls-info">
              <h4>Controls</h4>
              <div className="control-list">
                <div>← → Move</div>
                <div>↑ Rotate</div>
                <div>↓ Soft Drop</div>
                <div>Space Hard Drop</div>
                <div>P Pause</div>
              </div>
            </div>
          </div>
        </div>

        <div className="touch-controls">
          <button className="btn btn--secondary touch-btn" onClick={() => handleInput('ROTATE')}>
            🔄
          </button>
          <div className="movement-controls">
            <button className="btn btn--secondary touch-btn" onClick={() => handleInput('LEFT')}>
              ←
            </button>
            <button className="btn btn--secondary touch-btn" onClick={() => handleInput('DOWN')}>
              ↓
            </button>
            <button className="btn btn--secondary touch-btn" onClick={() => handleInput('RIGHT')}>
              →
            </button>
          </div>
          <button className="btn btn--secondary touch-btn" onClick={() => handleInput('DROP')}>
            ⬇
          </button>
        </div>

        {/* Game Over Modal */}
        {showGameOver && (
          <div className="game-over-modal">
            <div className="game-over-content">
              <h2>🎁 GAME OVER 🎁</h2>
              <div className="final-score">
                Final Score: {score.toLocaleString()}<br />
                Level Reached: {level}<br />
                Lines Cleared: {lines}
              </div>
              <div className="game-over-buttons">
                <button className="btn btn--outline" onClick={initGame}>
                  🔄 Play Again
                </button>
                <button className="btn btn--secondary" onClick={handleMainPage}>
                  🏠 Main Page
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniTetrisGifts;