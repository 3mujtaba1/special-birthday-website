import React, { useState, useEffect, useRef, useCallback } from 'react';
import './juice.css';

const FruitMixer = () => {
  // Game data
  const FRUITS = [
    {
      name: "apple",
      emoji: "🍎",
      color: "#FF4444", 
      juice_color: "#FF6B6B",
      points: 10,
      juice_type: "red"
    },
    {
      name: "orange", 
      emoji: "🍊",
      color: "#FFA500",
      juice_color: "#FF8C00", 
      points: 15,
      juice_type: "orange"
    },
    {
      name: "banana",
      emoji: "🍌", 
      color: "#FFFF00",
      juice_color: "#FFD700",
      points: 12,
      juice_type: "yellow"
    },
    {
      name: "grapes",
      emoji: "🍇",
      color: "#8A2BE2", 
      juice_color: "#9370DB",
      points: 20,
      juice_type: "purple"
    }
  ];

  const PERFECT_COMBINATIONS = [
    {
      name: "Apple Juice",
      type: "red", 
      color: "#FF6B6B",
      glow: "#FF9999",
      bonus: 50
    },
    {
      name: "Orange Juice",
      type: "orange",
      color: "#FF8C00", 
      glow: "#FFB347",
      bonus: 75
    },
    {
      name: "Banana Smoothie", 
      type: "yellow",
      color: "#FFD700",
      glow: "#FFEF94", 
      bonus: 60
    },
    {
      name: "Grape Juice",
      type: "purple",
      color: "#9370DB",
      glow: "#DDA0DD",
      bonus: 100
    }
  ];

  const GAME_SETTINGS = {
    duration: 60,
    spawn_rate: 1.5,
    fruit_speed: 3,
    basket_speed: 10,
    juice_capacity: 100,
    perfect_threshold: 0.7,
    combo_multiplier: 1.2
  };

  // State management
  const [currentScreen, setCurrentScreen] = useState('start');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SETTINGS.duration);
  const [perfectJuices, setPerfectJuices] = useState(0);
  const [fruitsCaught, setFruitsCaught] = useState(0);
  const [juiceContents, setJuiceContents] = useState({});
  const [juiceLevel, setJuiceLevel] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [perfectGlow, setPerfectGlow] = useState(false);
  const [currentJuiceColor, setCurrentJuiceColor] = useState('#FFFFFF');
  const [gameMessage, setGameMessage] = useState('');

  // Refs for game state that doesn't need to trigger re-renders
  const fruitsRef = useRef([]);
  const particlesRef = useRef([]);
  const basketRef = useRef({ x: 360, y: 520, width: 80, height: 40, targetX: 360 });
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const lastSpawnTimeRef = useRef(0);
  const lastCatchTimeRef = useRef(0);
  const audioContextRef = useRef(null);
  const gameTimerRef = useRef(null);

  // Initialize audio
  const createSounds = useCallback(() => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('Audio not supported');
    }
  }, []);

  const playSound = useCallback((frequency, duration, type = 'sine') => {
    if (!audioContextRef.current) return;

    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;
      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);

      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + duration);
    } catch (e) {
      console.log('Sound play failed:', e);
    }
  }, []);

  // Game functions
  const spawnFruit = useCallback(() => {
    const fruitType = FRUITS[Math.floor(Math.random() * FRUITS.length)];
    const newFruit = {
      id: Date.now() + Math.random(),
      type: fruitType,
      x: Math.random() * 720 + 40,
      y: -50,
      vy: GAME_SETTINGS.fruit_speed + Math.random() * 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 5,
      size: 30,
      caught: false
    };

    fruitsRef.current.push(newFruit);
  }, []);

  const createParticles = useCallback((x, y, color) => {
    const newParticles = [];
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: Math.random(),
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2,
        color: color,
        life: 30,
        maxLife: 30,
        size: Math.random() * 4 + 2
      });
    }
    particlesRef.current.push(...newParticles);
  }, []);

  const updateBasket = useCallback((mousePosition) => {
    const targetX = Math.max(0, Math.min(720, mousePosition - basketRef.current.width / 2));
    basketRef.current.x += (targetX - basketRef.current.x) * 0.15;
    basketRef.current.targetX = targetX;
  }, []);

  const addFruitToJuice = useCallback((fruitType) => {
    setJuiceContents(prev => ({
      ...prev,
      [fruitType.juice_type]: (prev[fruitType.juice_type] || 0) + 1
    }));

    setJuiceLevel(prev => Math.min(prev + 8, GAME_SETTINGS.juice_capacity));
    setFruitsCaught(prev => prev + 1);

    const currentCombo = combo;
    const comboBonus = Math.floor(currentCombo * 2);
    setScore(prev => prev + fruitType.points + comboBonus);

    // Update combo
    const now = Date.now();
    const timeSinceLastCatch = now - lastCatchTimeRef.current;

    if (timeSinceLastCatch < 3000) {
      setCombo(prev => {
        const newCombo = prev + 1;
        setMaxCombo(current => Math.max(current, newCombo));
        return newCombo;
      });
    } else {
      setCombo(1);
    }

    lastCatchTimeRef.current = now;

    // Show score popup
    if (comboBonus > 0) {
      setGameMessage(`+${fruitType.points + comboBonus} (Combo x${currentCombo + 1})`);
    } else {
      setGameMessage(`+${fruitType.points}`);
    }

    setTimeout(() => setGameMessage(''), 1000);

    playSound(500 + Math.random() * 200, 0.1);
  }, [combo, playSound]);

  const updateJuiceColor = useCallback(() => {
    const contents = juiceContents;
    const total = Object.values(contents).reduce((sum, count) => sum + count, 0);

    if (total === 0) {
      setCurrentJuiceColor('#FFFFFF');
      setPerfectGlow(false);
      return;
    }

    let dominantType = null;
    let maxCount = 0;

    Object.entries(contents).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantType = type;
      }
    });

    const dominantPercentage = maxCount / total;

    if (dominantPercentage >= GAME_SETTINGS.perfect_threshold && juiceLevel >= 80) {
      const perfectCombo = PERFECT_COMBINATIONS.find(combo => combo.type === dominantType);
      if (perfectCombo) {
        setCurrentJuiceColor(perfectCombo.color);
        setPerfectGlow(true);

        // Award perfect juice bonus
        setPerfectJuices(prev => prev + 1);
        setScore(prev => prev + perfectCombo.bonus);
        setGameMessage(`Perfect ${perfectCombo.name}! +${perfectCombo.bonus}`);
        playSound(800, 0.5);

        setTimeout(() => {
          resetJuice();
          setGameMessage('');
        }, 2000);

        return;
      }
    }

    // Set juice color based on dominant type
    const typeCount = Object.keys(contents).length;
    if (typeCount >= 3) {
      setCurrentJuiceColor('#8B4513'); // Brown for mixed
      setPerfectGlow(false);
    } else {
      const fruit = FRUITS.find(f => f.juice_type === dominantType);
      setCurrentJuiceColor(fruit ? fruit.juice_color : '#8B4513');
      setPerfectGlow(false);
    }
  }, [juiceContents, juiceLevel, playSound]);

  const resetJuice = useCallback(() => {
    setJuiceContents({});
    setJuiceLevel(0);
    setCurrentJuiceColor('#FFFFFF');
    setPerfectGlow(false);
  }, []);

  // Game loop
  const gameLoop = useCallback((currentTime) => {
    if (!isGameRunning) return;

    const canvas = canvasRef.current;
    if (!canvas) {
      animationRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, 800, 600);

    // Draw kitchen background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, 600);
    bgGradient.addColorStop(0, '#87CEEB');
    bgGradient.addColorStop(0.6, '#F0E68C');
    bgGradient.addColorStop(1, '#DEB887');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 800, 600);

    // Draw counter
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 500, 800, 100);

    // Draw blender base
    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath();
    ctx.roundRect(350, 440, 100, 80, 10);
    ctx.fill();

    // Draw blender jar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(360, 320, 80, 120, 8);
    ctx.fill();
    ctx.stroke();

    // Draw juice in blender
    if (juiceLevel > 0) {
      ctx.fillStyle = currentJuiceColor;
      const juiceHeight = (juiceLevel / GAME_SETTINGS.juice_capacity) * 115;
      ctx.beginPath();
      ctx.roundRect(362, 440 - juiceHeight, 76, juiceHeight, 6);
      ctx.fill();

      // Perfect glow effect
      if (perfectGlow) {
        ctx.shadowColor = currentJuiceColor;
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Sparkle effect
        for (let i = 0; i < 3; i++) {
          const sparkleX = 362 + Math.random() * 76;
          const sparkleY = 440 - juiceHeight + Math.random() * juiceHeight;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(sparkleX, sparkleY, Math.random() * 2 + 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Update and draw fruits
    const fruits = fruitsRef.current;
    for (let i = fruits.length - 1; i >= 0; i--) {
      const fruit = fruits[i];

      if (fruit.caught) {
        // Move caught fruit towards blender
        fruit.x += (400 - fruit.x) * 0.2;
        fruit.y += (380 - fruit.y) * 0.2;
        fruit.size *= 0.9;

        if (fruit.size < 5) {
          fruits.splice(i, 1);
          continue;
        }
      } else {
        // Update physics
        fruit.y += fruit.vy;
        fruit.rotation += fruit.rotationSpeed;

        // Check collision with basket
        const basket = basketRef.current;
        if (fruit.x > basket.x - 20 && 
            fruit.x < basket.x + basket.width + 20 &&
            fruit.y > basket.y - 10 && 
            fruit.y < basket.y + basket.height + 10) {

          // Fruit caught!
          createParticles(fruit.x, fruit.y, fruit.type.color);
          addFruitToJuice(fruit.type);
          fruit.caught = true;
          fruit.vy = 0;
        }

        // Remove fruits that fall off screen
        if (fruit.y > 650) {
          fruits.splice(i, 1);
          setCombo(0); // Reset combo if fruit missed
          continue;
        }
      }

      // Draw fruit
      ctx.save();
      ctx.translate(fruit.x, fruit.y);
      ctx.rotate(fruit.rotation * Math.PI / 180);
      ctx.font = `${fruit.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(fruit.type.emoji, 0, 0);
      ctx.restore();
    }

    // Update and draw particles
    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.2; // gravity
      particle.life--;

      if (particle.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      const alpha = particle.life / particle.maxLife;
      ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw basket
    const basket = basketRef.current;
    const basketGradient = ctx.createLinearGradient(basket.x, basket.y, basket.x, basket.y + basket.height);
    basketGradient.addColorStop(0, '#DEB887');
    basketGradient.addColorStop(1, '#8B4513');
    ctx.fillStyle = basketGradient;
    ctx.beginPath();
    ctx.roundRect(basket.x, basket.y, basket.width, basket.height, 8);
    ctx.fill();

    // Basket rim
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Basket handle
    ctx.beginPath();
    ctx.arc(basket.x + basket.width/2, basket.y - 5, 12, 0, Math.PI, true);
    ctx.stroke();

    // Spawn new fruits
    if (currentTime - lastSpawnTimeRef.current > 1000 / GAME_SETTINGS.spawn_rate) {
      spawnFruit();
      lastSpawnTimeRef.current = currentTime;
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [isGameRunning, juiceLevel, currentJuiceColor, perfectGlow, createParticles, addFruitToJuice, spawnFruit]);

  // Start game
  const startGame = useCallback(() => {
    setCurrentScreen('game');
    setIsGameRunning(true);
    setScore(0);
    setTimeLeft(GAME_SETTINGS.duration);
    setPerfectJuices(0);
    setFruitsCaught(0);
    setJuiceContents({});
    setJuiceLevel(0);
    setCombo(0);
    setMaxCombo(0);
    setPerfectGlow(false);
    setCurrentJuiceColor('#FFFFFF');
    setGameMessage('');

    // Reset game refs
    fruitsRef.current = [];
    particlesRef.current = [];
    basketRef.current = { x: 360, y: 520, width: 80, height: 40, targetX: 360 };
    lastSpawnTimeRef.current = 0;
    lastCatchTimeRef.current = 0;

    createSounds();

    // Start game timer
    gameTimerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(gameTimerRef.current);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [createSounds]);

  const endGame = useCallback(() => {
    setIsGameRunning(false);
    setCurrentScreen('gameOver');
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }
  }, []);

  const goToGameZone = () => {
    window.location.href = '/games';
  };

  const restartGame = () => {
    setCurrentScreen('start');
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }
  };

  // Mouse movement handler
  const handleMouseMove = useCallback((e) => {
    if (!isGameRunning) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    updateBasket(x);
  }, [isGameRunning, updateBasket]);

  // Start game loop when game begins
  useEffect(() => {
    if (isGameRunning) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isGameRunning, gameLoop]);

  // Update juice color when contents change
  useEffect(() => {
    if (Object.keys(juiceContents).length > 0) {
      updateJuiceColor();
    }
  }, [juiceContents, juiceLevel, updateJuiceColor]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="fruit-mixer-container">
      {/* Go To Main Page Button */}
      <button className="fruit-mixer-btn fruit-mixer-btn--outline fruit-mixer-main-page-btn" onClick={goToGameZone}>
        🎮 Go To Game Zone
      </button>

      {/* Start Screen */}
      {currentScreen === 'start' && (
        <div className="fruit-mixer-screen">
          <div className="fruit-mixer-screen-content">
            <h1 className="fruit-mixer-game-title">🍹 Fruit Mixer Pro</h1>
            <div className="fruit-mixer-game-preview">
              <div className="fruit-mixer-preview-fruits">
                <span className="fruit-mixer-fruit-icon">🍎</span>
                <span className="fruit-mixer-fruit-icon">🍊</span>
                <span className="fruit-mixer-fruit-icon">🍌</span>
                <span className="fruit-mixer-fruit-icon">🍇</span>
              </div>
            </div>
            <div className="fruit-mixer-instructions">
              <h3>🎯 How to Play:</h3>
              <ul>
                <li>🖱️ Move your mouse to control the basket</li>
                <li>🍎 Catch falling fruits before they hit the ground</li>
                <li>🥤 Create perfect single-color juices for big bonuses</li>
                <li>⚠️ Mixing too many colors creates brown juice (lower score)</li>
                <li>⏱️ You have 60 seconds to score as high as possible</li>
              </ul>
              <div className="fruit-mixer-perfect-combinations">
                <h4>🏆 Perfect Juice Bonuses:</h4>
                <div className="fruit-mixer-combo-grid">
                  <div className="fruit-mixer-combo fruit-mixer-combo--red">🍎 Apple Juice: +50pts</div>
                  <div className="fruit-mixer-combo fruit-mixer-combo--orange">🍊 Orange Juice: +75pts</div>
                  <div className="fruit-mixer-combo fruit-mixer-combo--yellow">🍌 Banana Smoothie: +60pts</div>
                  <div className="fruit-mixer-combo fruit-mixer-combo--purple">🍇 Grape Juice: +100pts</div>
                </div>
              </div>
            </div>
            <button className="fruit-mixer-btn fruit-mixer-btn--primary fruit-mixer-btn--lg" onClick={startGame}>
              🎮 Start Game
            </button>
          </div>
        </div>
      )}

      {/* Game Screen */}
      {currentScreen === 'game' && (
        <div className="fruit-mixer-screen">
          <div className="fruit-mixer-game-ui">
            <div className="fruit-mixer-ui-top">
              <div className="fruit-mixer-stat">
                <span className="fruit-mixer-stat-label">Score</span>
                <span className="fruit-mixer-stat-value">{score.toLocaleString()}</span>
              </div>
              <div className="fruit-mixer-stat">
                <span className="fruit-mixer-stat-label">Time</span>
                <span className="fruit-mixer-stat-value">{timeLeft}s</span>
              </div>
              <div className="fruit-mixer-stat">
                <span className="fruit-mixer-stat-label">Perfect Juices</span>
                <span className="fruit-mixer-stat-value">{perfectJuices}</span>
              </div>
              <div className="fruit-mixer-stat">
                <span className="fruit-mixer-stat-label">Combo</span>
                <span className="fruit-mixer-stat-value">{combo > 1 ? `x${combo}` : '-'}</span>
              </div>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            className="fruit-mixer-game-canvas"
            width="800"
            height="600"
            onMouseMove={handleMouseMove}
          />

          {gameMessage && (
            <div className="fruit-mixer-game-message">
              {gameMessage}
            </div>
          )}
        </div>
      )}

      {/* Game Over Screen */}
      {currentScreen === 'gameOver' && (
        <div className="fruit-mixer-screen">
          <div className="fruit-mixer-screen-content">
            <h1 className="fruit-mixer-game-title">🎉 Game Complete!</h1>
            <div className="fruit-mixer-final-stats">
              <h3>📊 Final Results:</h3>
              <div className="fruit-mixer-stat-row">
                <span>Final Score:</span>
                <span className="fruit-mixer-highlight">{score.toLocaleString()}</span>
              </div>
              <div className="fruit-mixer-stat-row">
                <span>Fruits Caught:</span>
                <span className="fruit-mixer-highlight">{fruitsCaught}</span>
              </div>
              <div className="fruit-mixer-stat-row">
                <span>Perfect Juices:</span>
                <span className="fruit-mixer-highlight">{perfectJuices}</span>
              </div>
              <div className="fruit-mixer-stat-row">
                <span>Best Combo:</span>
                <span className="fruit-mixer-highlight">x{maxCombo}</span>
              </div>
              <div className="fruit-mixer-stat-row">
                <span>Performance:</span>
                <span className="fruit-mixer-highlight">
                  {score >= 2000 ? 'Juice Master! 🏆' : 
                   score >= 1500 ? 'Expert Mixer! ⭐' :
                   score >= 1000 ? 'Great Job! 👍' :
                   score >= 500 ? 'Good Try! 💪' : 'Keep Practicing! 🎯'}
                </span>
              </div>
            </div>
            <div className="fruit-mixer-game-over-buttons">
              <button className="fruit-mixer-btn fruit-mixer-btn--primary" onClick={startGame}>
                🎮 Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FruitMixer;