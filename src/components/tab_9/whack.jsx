import React, { useState, useEffect, useRef, useCallback } from 'react';
import './whack.css';

const WhackAMoleBirthday = () => {
  // Game data
  const gameData = {
    gameItems: [
      {
        type: "cupcake",
        emoji: "🧁",
        points: 2,
        duration: 1500,
        soundEffect: "POP!",
        color: "#FFB6C1"
      },
      {
        type: "candle",
        emoji: "🕯️",
        points: 3,
        duration: 1200,
        soundEffect: "FWOOSH!",
        color: "#FFD700"
      },
      {
        type: "present",
        emoji: "🎁",
        points: 1,
        duration: 1800,
        soundEffect: "POOF!",
        color: "#98FB98"
      }
    ],
    gameSettings: {
      initialGameDuration: 60,
      gridSize: 12,
      difficultyIncrease: 0.9,
      maxSimultaneousItems: 4
    },
    confettiColors: ["#FF69B4", "#FFD700", "#98FB98", "#87CEEB", "#DDA0DD", "#F0E68C"]
  };

  // Game state
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('whackMoleHighScore')) || 0;
  });
  const [activeItems, setActiveItems] = useState(new Map());
  const [confetti, setConfetti] = useState([]);
  const [soundEffect, setSoundEffect] = useState('');

  const gameTimerRef = useRef(null);
  const itemSpawnTimerRef = useRef(null);
  const difficultyRef = useRef(1);
  const itemCounterRef = useRef(0);
  const isGameActiveRef = useRef(false);
  const activeItemsRef = useRef(new Map());

  // Keep activeItemsRef in sync with activeItems state
  useEffect(() => {
    activeItemsRef.current = activeItems;
  }, [activeItems]);

  // Initialize game
  const startGame = useCallback(() => {
    setCurrentScreen('playing');
    setScore(0);
    setTimeLeft(60);
    setActiveItems(new Map());
    setConfetti([]);
    setSoundEffect('');
    difficultyRef.current = 1;
    itemCounterRef.current = 0;
    isGameActiveRef.current = true;
    activeItemsRef.current = new Map();
    
    // Start game timer
    gameTimerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start spawning items with a slight delay
    setTimeout(() => {
      if (isGameActiveRef.current) {
        spawnNextItem();
      }
    }, 500);
  }, []);

  const endGame = useCallback(() => {
    setCurrentScreen('gameOver');
    isGameActiveRef.current = false;
    clearInterval(gameTimerRef.current);
    clearTimeout(itemSpawnTimerRef.current);
    setActiveItems(new Map());
    activeItemsRef.current = new Map();
    
    // Update high score
    setScore(currentScore => {
      if (currentScore > highScore) {
        const newHighScore = currentScore;
        setHighScore(newHighScore);
        localStorage.setItem('whackMoleHighScore', newHighScore.toString());
      }
      return currentScore;
    });
  }, [highScore]);

  const spawnNextItem = useCallback(() => {
    if (!isGameActiveRef.current) return;

    // Find available holes
    const availableHoles = [];
    for (let i = 0; i < gameData.gameSettings.gridSize; i++) {
      if (!activeItemsRef.current.has(i)) {
        availableHoles.push(i);
      }
    }

    if (availableHoles.length === 0) {
      // Schedule next spawn if no holes available
      itemSpawnTimerRef.current = setTimeout(spawnNextItem, 500);
      return;
    }

    // Randomly select hole and item type
    const holeIndex = availableHoles[Math.floor(Math.random() * availableHoles.length)];
    const itemType = gameData.gameItems[Math.floor(Math.random() * gameData.gameItems.length)];
    const itemId = itemCounterRef.current++;

    const newItem = {
      id: itemId,
      holeIndex,
      ...itemType,
      duration: Math.max(800, Math.floor(itemType.duration * difficultyRef.current))
    };

    // Add item to state
    setActiveItems(prev => {
      const newMap = new Map(prev);
      newMap.set(holeIndex, newItem);
      activeItemsRef.current = newMap;
      return newMap;
    });

    // Remove item after duration
    setTimeout(() => {
      if (isGameActiveRef.current) {
        setActiveItems(prev => {
          const newMap = new Map(prev);
          newMap.delete(holeIndex);
          activeItemsRef.current = newMap;
          return newMap;
        });
      }
    }, newItem.duration);

    // Schedule next spawn
    const baseDelay = 1200;
    const difficultyDelay = Math.max(300, Math.floor(baseDelay * difficultyRef.current));
    itemSpawnTimerRef.current = setTimeout(spawnNextItem, difficultyDelay);
  }, []);

  const hitItem = useCallback((holeIndex) => {
    const item = activeItemsRef.current.get(holeIndex);
    if (!item || !isGameActiveRef.current) return;

    // Update score
    setScore(prev => prev + item.points);

    // Show sound effect
    setSoundEffect(item.soundEffect);
    setTimeout(() => setSoundEffect(''), 800);

    // Create confetti
    createConfetti(holeIndex, item.color);

    // Remove item immediately
    setActiveItems(prev => {
      const newMap = new Map(prev);
      newMap.delete(holeIndex);
      activeItemsRef.current = newMap;
      return newMap;
    });

    // Increase difficulty
    difficultyRef.current = Math.max(0.4, difficultyRef.current * gameData.gameSettings.difficultyIncrease);
  }, []);

  const createConfetti = useCallback((holeIndex, itemColor) => {
    const newConfetti = [];
    for (let i = 0; i < 15; i++) {
      newConfetti.push({
        id: Date.now() + i + Math.random(),
        holeIndex,
        color: gameData.confettiColors[Math.floor(Math.random() * gameData.confettiColors.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        delay: Math.random() * 200
      });
    }
    
    setConfetti(prev => [...prev, ...newConfetti]);
    
    setTimeout(() => {
      setConfetti(prev => prev.filter(c => !newConfetti.some(nc => nc.id === c.id)));
    }, 1200);
  }, []);

  const goToGameZone = () => {
    window.location.href = '/games';
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isGameActiveRef.current = false;
      clearInterval(gameTimerRef.current);
      clearTimeout(itemSpawnTimerRef.current);
    };
  }, []);

  // Debug: Log active items (remove in production)
  useEffect(() => {
    console.log('Active items:', activeItems.size);
  }, [activeItems]);

  // Locally scoped styles
  const styles = {
    gameContainer: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFE5F7 0%, #E5F3FF 50%, #F0FFE5 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      padding: '20px',
      boxSizing: 'border-box'
    },

    mainPageBtn: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      padding: '12px 20px',
      backgroundColor: '#FF69B4',
      color: 'white',
      border: 'none',
      borderRadius: '25px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(255, 105, 180, 0.3)',
      transition: 'all 0.3s ease',
      zIndex: 1000
    },

    gameHeader: {
      textAlign: 'center',
      marginBottom: '30px',
      paddingTop: '70px'
    },

    gameTitle: {
      fontSize: '3rem',
      color: '#FF1493',
      textShadow: '2px 2px 4px rgba(255, 20, 147, 0.3)',
      margin: '0 0 20px 0',
      fontWeight: 'bold'
    },

    gameStats: {
      display: 'flex',
      justifyContent: 'center',
      gap: '40px',
      flexWrap: 'wrap'
    },

    statItem: {
      background: 'rgba(255, 255, 255, 0.9)',
      padding: '15px 25px',
      borderRadius: '20px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      minWidth: '120px'
    },

    label: {
      fontSize: '16px',
      color: '#666',
      fontWeight: '500',
      marginRight: '8px'
    },

    value: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#FF1493'
    },

    welcomeScreen: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh'
    },

    welcomeContent: {
      background: 'rgba(255, 255, 255, 0.95)',
      padding: '40px',
      borderRadius: '30px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
      textAlign: 'center',
      maxWidth: '600px'
    },

    welcomeTitle: {
      fontSize: '2.5rem',
      color: '#FF1493',
      marginBottom: '30px',
      textShadow: '1px 1px 2px rgba(255, 20, 147, 0.2)'
    },

    instructions: {
      marginBottom: '30px'
    },

    instructionText: {
      fontSize: '18px',
      color: '#333',
      margin: '15px 0',
      lineHeight: '1.6'
    },

    startBtn: {
      padding: '15px 40px',
      fontSize: '20px',
      fontWeight: 'bold',
      color: 'white',
      background: 'linear-gradient(45deg, #FF1493, #FF69B4)',
      border: 'none',
      borderRadius: '30px',
      cursor: 'pointer',
      boxShadow: '0 6px 20px rgba(255, 20, 147, 0.4)',
      transition: 'all 0.3s ease'
    },

    gameBoard: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative'
    },

    gameGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 120px)',
      gridTemplateRows: 'repeat(3, 120px)',
      gap: '20px',
      padding: '30px',
      background: 'rgba(255, 255, 255, 0.8)',
      borderRadius: '25px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
      position: 'relative'
    },

    hole: {
      width: '120px',
      height: '120px',
      backgroundColor: '#8B4513',
      borderRadius: '50%',
      position: 'relative',
      cursor: 'pointer',
      boxShadow: 'inset 0 8px 15px rgba(0, 0, 0, 0.4)',
      border: '5px solid #654321',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'visible'
    },

    holeActive: {
      transform: 'scale(1.05)',
      boxShadow: 'inset 0 8px 15px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.6)'
    },

    gameItem: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '90px',
      height: '90px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
      cursor: 'pointer',
      transition: 'transform 0.1s ease',
      zIndex: 10
    },

    itemEmoji: {
      fontSize: '45px',
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
      userSelect: 'none'
    },

    confettiPiece: {
      position: 'absolute',
      width: '8px',
      height: '8px',
      borderRadius: '2px',
      pointerEvents: 'none',
      zIndex: 100
    },

    soundEffectDisplay: {
      position: 'absolute',
      top: '20px',
      fontSize: '3rem',
      fontWeight: 'bold',
      color: '#FFD700',
      textShadow: '3px 3px 6px rgba(0, 0, 0, 0.5)',
      pointerEvents: 'none',
      zIndex: 200,
      userSelect: 'none'
    },

    gameOverScreen: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh'
    },

    gameOverContent: {
      background: 'rgba(255, 255, 255, 0.95)',
      padding: '50px',
      borderRadius: '30px',
      boxShadow: '0 15px 40px rgba(0, 0, 0, 0.2)',
      textAlign: 'center',
      maxWidth: '500px'
    },

    gameOverTitle: {
      fontSize: '2.5rem',
      color: '#FF1493',
      marginBottom: '30px',
      textShadow: '1px 1px 2px rgba(255, 20, 147, 0.2)'
    },

    finalStats: {
      marginBottom: '30px'
    },

    finalScore: {
      fontSize: '24px',
      color: '#333',
      margin: '15px 0'
    },

    newHighScore: {
      fontSize: '20px',
      color: '#FFD700',
      fontWeight: 'bold',
      textShadow: '1px 1px 2px rgba(255, 215, 0, 0.5)'
    },

    highScoreDisplay: {
      fontSize: '18px',
      color: '#666'
    },

    gameOverButtons: {
      display: 'flex',
      gap: '20px',
      justifyContent: 'center',
      flexWrap: 'wrap'
    },

    playAgainBtn: {
      padding: '12px 30px',
      fontSize: '18px',
      fontWeight: 'bold',
      color: 'white',
      background: 'linear-gradient(45deg, #32CD32, #98FB98)',
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      boxShadow: '0 6px 20px rgba(50, 205, 50, 0.4)',
      transition: 'all 0.3s ease'
    },

    backBtn: {
      padding: '12px 30px',
      fontSize: '18px',
      fontWeight: 'bold',
      color: 'white',
      background: 'linear-gradient(45deg, #87CEEB, #4682B4)',
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      boxShadow: '0 6px 20px rgba(135, 206, 235, 0.4)',
      transition: 'all 0.3s ease'
    },

    decorations: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: -1
    },

    balloon1: {
      position: 'absolute',
      top: '10%',
      right: '10%',
      fontSize: '3rem',
      color: '#FF1493'
    },

    balloon2: {
      position: 'absolute',
      top: '20%',
      left: '15%',
      fontSize: '2.5rem',
      color: '#00BFFF'
    },

    balloon3: {
      position: 'absolute',
      bottom: '20%',
      right: '20%',
      fontSize: '2rem',
      color: '#32CD32'
    },

    cake1: {
      position: 'absolute',
      top: '30%',
      left: '5%',
      fontSize: '2rem',
      opacity: 0.7
    },

    cake2: {
      position: 'absolute',
      bottom: '30%',
      left: '10%',
      fontSize: '1.5rem',
      opacity: 0.7
    },

    gift1: {
      position: 'absolute',
      top: '40%',
      right: '5%',
      fontSize: '2rem',
      opacity: 0.6
    },

    gift2: {
      position: 'absolute',
      bottom: '40%',
      right: '15%',
      fontSize: '1.5rem',
      opacity: 0.6
    }
  };

  return (
    <div style={styles.gameContainer}>
      {/* Go To Main Page Button */}
      <button 
        style={styles.mainPageBtn} 
        onClick={goToGameZone}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 20px rgba(255, 105, 180, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 15px rgba(255, 105, 180, 0.3)';
        }}
      >
        🎮 Go To Game Zone 
      </button>

      {/* Game Header */}
      <header style={styles.gameHeader}>
        <h1 style={styles.gameTitle}>🎂 Whack-a-Mole Birthday Edition 🎂</h1>
        <div style={styles.gameStats}>
          <div style={styles.statItem}>
            <span style={styles.label}>Score:</span>
            <span style={styles.value}>{score}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.label}>Time:</span>
            <span style={styles.value}>{timeLeft}s</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.label}>High Score:</span>
            <span style={styles.value}>{highScore}</span>
          </div>
        </div>
      </header>

      {/* Welcome Screen */}
      {currentScreen === 'welcome' && (
        <div style={styles.welcomeScreen}>
          <div style={styles.welcomeContent}>
            <h2 style={styles.welcomeTitle}>🎉 Welcome to Birthday Whack-a-Mole! 🎉</h2>
            <div style={styles.instructions}>
              <p style={styles.instructionText}>🧁 Click on cupcakes, candles, and presents as they pop up!</p>
              <p style={styles.instructionText}>🕯️ Candles = 3 points | 🧁 Cupcakes = 2 points | 🎁 Presents = 1 point</p>
              <p style={styles.instructionText}>⏰ You have 60 seconds to score as many points as possible!</p>
              <p style={styles.instructionText}>🎯 Game gets faster as your score increases!</p>
            </div>
            <button 
              style={styles.startBtn} 
              onClick={startGame}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 8px 25px rgba(255, 20, 147, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(255, 20, 147, 0.4)';
              }}
            >
              🎮 Start Game
            </button>
          </div>
        </div>
      )}

      {/* Game Board */}
      {currentScreen === 'playing' && (
        <div style={styles.gameBoard}>
          <div style={styles.gameGrid}>
            {[...Array(gameData.gameSettings.gridSize)].map((_, index) => {
              const item = activeItems.get(index);
              return (
                <div
                  key={index}
                  style={{
                    ...styles.hole,
                    ...(item ? styles.holeActive : {})
                  }}
                  onClick={() => item && hitItem(index)}
                >
                  {item && (
                    <div 
                      style={{...styles.gameItem, animation: 'popUp 0.3s ease-out'}}
                      onClick={(e) => {
                        e.stopPropagation();
                        hitItem(index);
                      }}
                    >
                      <span style={{...styles.itemEmoji, animation: 'bounce 0.6s ease-in-out infinite alternate'}}>
                        {item.emoji}
                      </span>
                    </div>
                  )}
                  
                  {/* Confetti for this hole */}
                  {confetti
                    .filter(c => c.holeIndex === index)
                    .map(c => (
                      <div
                        key={c.id}
                        style={{
                          ...styles.confettiPiece,
                          backgroundColor: c.color,
                          left: `${c.x}%`,
                          top: `${c.y}%`,
                          transform: `rotate(${c.rotation}deg)`,
                          animation: `confetti 1s ease-out forwards ${c.delay}ms`
                        }}
                      />
                    ))}
                </div>
              );
            })}
          </div>

          {/* Sound Effect Display */}
          {soundEffect && (
            <div style={{...styles.soundEffectDisplay, animation: 'soundEffect 0.8s ease-out forwards'}}>
              {soundEffect}
            </div>
          )}
        </div>
      )}

      {/* Game Over Screen */}
      {currentScreen === 'gameOver' && (
        <div style={styles.gameOverScreen}>
          <div style={styles.gameOverContent}>
            <h2 style={styles.gameOverTitle}>🎊 Game Over! 🎊</h2>
            <div style={styles.finalStats}>
              <p style={styles.finalScore}>Final Score: <strong>{score}</strong></p>
              {score === highScore && score > 0 && (
                <p style={{...styles.newHighScore, animation: 'glow 1s ease-in-out infinite alternate'}}>🏆 New High Score! 🏆</p>
              )}
              <p style={styles.highScoreDisplay}>High Score: <strong>{highScore}</strong></p>
            </div>
            <div style={styles.gameOverButtons}>
              <button 
                style={styles.playAgainBtn} 
                onClick={startGame}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(50, 205, 50, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 6px 20px rgba(50, 205, 50, 0.4)';
                }}
              >
                🔄 Play Again
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Decorative Elements */}
      <div style={styles.decorations}>
        <div style={{...styles.balloon1, animation: 'float 3s ease-in-out infinite'}}>🎈</div>
        <div style={{...styles.balloon2, animation: 'float 4s ease-in-out infinite reverse'}}>🎈</div>
        <div style={{...styles.balloon3, animation: 'float 3.5s ease-in-out infinite'}}>🎈</div>
        <div style={{...styles.cake1, animation: 'bounce 2s ease-in-out infinite'}}>🍰</div>
        <div style={{...styles.cake2, animation: 'bounce 2.5s ease-in-out infinite reverse'}}>🍰</div>
        <div style={{...styles.gift1, animation: 'wiggle 3s ease-in-out infinite'}}>🎁</div>
        <div style={{...styles.gift2, animation: 'wiggle 2.5s ease-in-out infinite reverse'}}>🎁</div>
      </div>
    </div>
  );
};

export default WhackAMoleBirthday;