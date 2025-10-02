import React, { useEffect, useRef, useState, useCallback } from 'react';
import './star_catcher.css';

const DreamyStarCatcher = () => {
  const canvasRef = useRef(null);
  const basketRef = useRef(null);
  const gameRef = useRef(null);
  const [starsCollected, setStarsCollected] = useState(0);
  const [gameState, setGameState] = useState('playing');
  const [progressWidth, setProgressWidth] = useState(0);

  // Game settings
  const settings = {
    targetStars: 18,
    initialSpeed: 2,
    maxSpeed: 6,
    speedIncrease: 0.1,
    speedIncreaseInterval: 3,
    specialObjects: [
      { type: 'star', emoji: '🌟', weight: 80 },
      { type: 'heart', emoji: '❤️', weight: 10 },
      { type: 'rose', emoji: '🌹', weight: 10 }
    ]
  };

  // Game class converted to React hooks and refs
  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    const basket = basketRef.current;
    if (!canvas || !basket) return;

    const ctx = canvas.getContext('2d');

    // Game state
    const game = {
      canvas,
      ctx,
      basket,
      gameState: 'playing',
      starsCollected: 0,
      currentSpeed: settings.initialSpeed,
      basketPos: { x: 0, y: 0 },
      fallingObjects: [],
      sparkles: [],
      keys: {},
      audioContext: null,
      lastSpawn: 0,
      spawnInterval: 1500
    };

    // Initialize audio
    try {
      game.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('Web Audio API not supported');
    }

    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Position basket
      const basketWidth = 60;
      game.basketPos.x = (canvas.width - basketWidth) / 2;
      game.basketPos.y = canvas.height - 100;

      basket.style.left = game.basketPos.x + 'px';
      basket.style.bottom = '50px';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Sound effect function
    const playSound = (frequency = 800, duration = 200) => {
      if (!game.audioContext) return;

      const oscillator = game.audioContext.createOscillator();
      const gainNode = game.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(game.audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, game.audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, game.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, game.audioContext.currentTime + duration / 1000);

      oscillator.start(game.audioContext.currentTime);
      oscillator.stop(game.audioContext.currentTime + duration / 1000);
    };

    // Create falling object
    const createFallingObject = () => {
      const rand = Math.random() * 100;
      let objType = settings.specialObjects[0]; // default to star

      let weightSum = 0;
      for (const obj of settings.specialObjects) {
        weightSum += obj.weight;
        if (rand <= weightSum) {
          objType = obj;
          break;
        }
      }

      return {
        x: Math.random() * (canvas.width - 40),
        y: -40,
        emoji: objType.emoji,
        type: objType.type,
        size: 30,
        caught: false
      };
    };

    // Create sparkle effect
    const createSparkles = (x, y) => {
      for (let i = 0; i < 8; i++) {
        game.sparkles.push({
          x: x + Math.random() * 20 - 10,
          y: y + Math.random() * 20 - 10,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 1,
          decay: 0.02,
          size: Math.random() * 3 + 2
        });
      }
    };

    // Check collision
    const checkCollision = (obj) => {
      const basketCenterX = game.basketPos.x + 30;
      const basketCenterY = game.basketPos.y + 15;
      const distance = Math.sqrt(
        Math.pow(obj.x + 15 - basketCenterX, 2) + 
        Math.pow(obj.y + 15 - basketCenterY, 2)
      );
      return distance < 35;
    };

    // Update game
    const update = () => {
      if (game.gameState !== 'playing') return;

      // Spawn falling objects
      const now = Date.now();
      if (now - game.lastSpawn > game.spawnInterval) {
        game.fallingObjects.push(createFallingObject());
        game.lastSpawn = now;
      }

      // Update falling objects
      game.fallingObjects = game.fallingObjects.filter(obj => {
        obj.y += game.currentSpeed;

        // Check collision
        if (!obj.caught && checkCollision(obj)) {
          obj.caught = true;
          game.starsCollected++;

          // Update speed
          if (game.starsCollected % settings.speedIncreaseInterval === 0) {
            game.currentSpeed = Math.min(
              game.currentSpeed + settings.speedIncrease,
              settings.maxSpeed
            );
          }

          // Effects
          createSparkles(obj.x, obj.y);
          playSound(800 + Math.random() * 200, 300);
          basket.classList.add('basket-glow-active');
          setTimeout(() => basket.classList.remove('basket-glow-active'), 300);

          // Update React state
          setStarsCollected(game.starsCollected);
          setProgressWidth((game.starsCollected / settings.targetStars) * 100);

          // Check win condition
          if (game.starsCollected >= settings.targetStars) {
            game.gameState = 'birthday';
            setGameState('birthday');
            triggerBirthdaySequence();
          }

          return false; // Remove caught object
        }

        // Remove objects that fell off screen
        return obj.y < canvas.height + 50;
      });

      // Update sparkles
      game.sparkles = game.sparkles.filter(sparkle => {
        sparkle.x += sparkle.vx;
        sparkle.y += sparkle.vy;
        sparkle.life -= sparkle.decay;
        return sparkle.life > 0;
      });

      // Handle movement
      if (game.keys['ArrowLeft'] || game.keys['KeyA']) {
        game.basketPos.x = Math.max(0, game.basketPos.x - 5);
        basket.style.left = game.basketPos.x + 'px';
      }
      if (game.keys['ArrowRight'] || game.keys['KeyD']) {
        game.basketPos.x = Math.min(canvas.width - 60, game.basketPos.x + 5);
        basket.style.left = game.basketPos.x + 'px';
      }
    };

    // Render game
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render falling objects
      game.fallingObjects.forEach(obj => {
        if (!obj.caught) {
          ctx.font = obj.size + 'px serif';
          ctx.fillText(obj.emoji, obj.x, obj.y);

          // Add glow effect
          ctx.shadowColor = '#FFD700';
          ctx.shadowBlur = 10;
          ctx.fillText(obj.emoji, obj.x, obj.y);
          ctx.shadowBlur = 0;
        }
      });

      // Render sparkles
      game.sparkles.forEach(sparkle => {
        ctx.globalAlpha = sparkle.life;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
    };

    // Birthday sequence
    const triggerBirthdaySequence = () => {
      setTimeout(() => {
        const overlay = document.querySelector('.dreamy-birthday-overlay');
        const shootingStar = document.querySelector('.dreamy-shooting-star');

        overlay.classList.remove('dreamy-hidden');
        shootingStar.classList.add('dreamy-shooting-star-animate');

        setTimeout(() => {
          document.querySelector('.dreamy-birthday-content').classList.add('dreamy-fade-in');
        }, 2000);
      }, 500);
    };

    // Game loop
    const gameLoop = () => {
      update();
      render();
      requestAnimationFrame(gameLoop);
    };

    // Event listeners
    const handleKeyDown = (e) => {
      game.keys[e.code] = true;
      if (e.code === 'Space' && game.gameState === 'complete') {
        restartGame();
      }
    };

    const handleKeyUp = (e) => {
      game.keys[e.code] = false;
    };

    const restartGame = () => {
      game.gameState = 'playing';
      game.starsCollected = 0;
      game.currentSpeed = settings.initialSpeed;
      game.fallingObjects = [];
      game.sparkles = [];

      setStarsCollected(0);
      setProgressWidth(0);
      setGameState('playing');

      document.querySelector('.dreamy-birthday-overlay').classList.add('dreamy-hidden');
      document.querySelector('.dreamy-shooting-star').classList.remove('dreamy-shooting-star-animate');
      document.querySelector('.dreamy-birthday-content').classList.remove('dreamy-fade-in');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    gameRef.current = game;
    gameLoop();

    // Cleanup function
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handlePlayAgain = () => {
    if (gameRef.current) {
      const game = gameRef.current;
      game.gameState = 'playing';
      game.starsCollected = 0;
      game.currentSpeed = settings.initialSpeed;
      game.fallingObjects = [];
      game.sparkles = [];

      setStarsCollected(0);
      setProgressWidth(0);
      setGameState('playing');

      document.querySelector('.dreamy-birthday-overlay').classList.add('dreamy-hidden');
      document.querySelector('.dreamy-shooting-star').classList.remove('dreamy-shooting-star-animate');
      document.querySelector('.dreamy-birthday-content').classList.remove('dreamy-fade-in');
    }
  };

  useEffect(() => {
    const cleanup = initGame();
    return cleanup;
  }, [initGame]);

  return (
    <div className="dreamy-game-container">
      {/* Background stars for ambiance */}
      <div className="dreamy-background-stars">
        <div className="dreamy-star-bg" style={{ top: '15%', left: '10%', animationDelay: '0s' }}></div>
        <div className="dreamy-star-bg" style={{ top: '25%', left: '85%', animationDelay: '1s' }}></div>
        <div className="dreamy-star-bg" style={{ top: '40%', left: '20%', animationDelay: '2s' }}></div>
        <div className="dreamy-star-bg" style={{ top: '60%', left: '75%', animationDelay: '1.5s' }}></div>
        <div className="dreamy-star-bg" style={{ top: '80%', left: '30%', animationDelay: '0.5s' }}></div>
        <div className="dreamy-star-bg" style={{ top: '35%', left: '60%', animationDelay: '2.5s' }}></div>
        <div className="dreamy-star-bg" style={{ top: '70%', left: '90%', animationDelay: '1.8s' }}></div>
        <div className="dreamy-star-bg" style={{ top: '20%', left: '45%', animationDelay: '3s' }}></div>
      </div>

      {/* Progress bar */}
      <div className="dreamy-progress-container">
        <div className="dreamy-progress-label">⭐ {starsCollected}/18 Stars Collected</div>
        <div className="dreamy-progress-bar">
          <div 
            className="dreamy-progress-fill" 
            style={{ width: `${progressWidth}%` }}
          ></div>
        </div>
      </div>

      {/* Game canvas */}
      <canvas ref={canvasRef} className="dreamy-game-canvas"></canvas>

      {/* Basket */}
      <div ref={basketRef} className="dreamy-basket">🧺</div>

      {/* Birthday message overlay */}
      <div className={`dreamy-birthday-overlay ${gameState !== 'birthday' ? 'dreamy-hidden' : ''}`}>
        <div className="dreamy-shooting-star">⭐</div>
        <div className="dreamy-birthday-content">
          <h1 className="dreamy-birthday-title">🎉 Happy Birthday! 🎉</h1>
          <p className="dreamy-birthday-subtitle">You caught all the magical stars!</p>
          <button className="dreamy-play-again-btn" onClick={handlePlayAgain}>
            ✨ Play Again ✨
          </button>
          <button className="go-to-game-zone" onClick={() => window.location.href = '/games'}>
            ✨ Go To Game Zone ✨
          </button>
        </div>
      </div>
    </div>
  );
};

export default DreamyStarCatcher;