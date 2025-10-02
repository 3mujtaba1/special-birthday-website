import React, { useState, useEffect, useRef } from 'react';
import './memory.css';

const EnchantedGardenMemory = () => {
  const [gameState, setGameState] = useState({
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    gameStarted: false,
    startTime: null,
    time: 0
  });

  const [showCompliment, setShowCompliment] = useState(false);
  const [currentCompliment, setCurrentCompliment] = useState('');
  const [showWinModal, setShowWinModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const timerRef = useRef(null);

  const gameData = {
    compliments: [
      "You make my heart bloom like flowers in spring 🌸",
      "In your eyes, I find myself lost in a universe in which i never want to find my way back home ✨", 
      "Your smile is the sunshine that brightens my garden 🌻",
      "With you, every moment feels like magic 💫",
      "Your voice is the melody my heart has been waiting to hear 🎵",
      "Your love gives the real meaning of what love is 🍃",
      "Your hug is the most comforting and a magical feeling I can ever have 🏡",
      "Your inner beauty and your pure heart and soul makes me love you more 💕"
    ],
    cardSymbols: ["🌸", "🦋", "🌿", "💝", "🌺", "🐝", "🌷", "✨"]
  };

  // Initialize game
  useEffect(() => {
    initGame();
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameState.gameStarted && !showWinModal) {
      timerRef.current = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          time: Date.now() - prev.startTime
        }));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.gameStarted, showWinModal]);

  const initGame = () => {
    const cards = [];
    const shuffledSymbols = [...gameData.cardSymbols, ...gameData.cardSymbols]
      .sort(() => Math.random() - 0.5);

    shuffledSymbols.forEach((symbol, index) => {
      cards.push({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
        pairId: gameData.cardSymbols.indexOf(symbol)
      });
    });

    setGameState({
      cards,
      flippedCards: [],
      matchedPairs: 0,
      moves: 0,
      gameStarted: false,
      startTime: null,
      time: 0
    });
    setShowCompliment(false);
    setShowWinModal(false);
    setIsProcessing(false);
  };

  const handleCardClick = (cardId) => {
    if (isProcessing || gameState.flippedCards.length === 2) return;

    const card = gameState.cards.find(c => c.id === cardId);
    if (card.isFlipped || card.isMatched) return;

    if (!gameState.gameStarted) {
      setGameState(prev => ({
        ...prev,
        gameStarted: true,
        startTime: Date.now()
      }));
    }

    const newFlippedCards = [...gameState.flippedCards, cardId];
    const newCards = gameState.cards.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    );

    setGameState(prev => ({
      ...prev,
      cards: newCards,
      flippedCards: newFlippedCards
    }));

    if (newFlippedCards.length === 2) {
      setIsProcessing(true);
      setGameState(prev => ({
        ...prev,
        moves: prev.moves + 1
      }));

      const [firstId, secondId] = newFlippedCards;
      const firstCard = newCards.find(c => c.id === firstId);
      const secondCard = newCards.find(c => c.id === secondId);

      setTimeout(() => {
        if (firstCard.pairId === secondCard.pairId) {
          // Match found
          const matchedCards = newCards.map(c => 
            (c.id === firstId || c.id === secondId) 
              ? { ...c, isMatched: true }
              : c
          );

          const newMatchedPairs = gameState.matchedPairs + 1;

          setGameState(prev => ({
            ...prev,
            cards: matchedCards,
            flippedCards: [],
            matchedPairs: newMatchedPairs
          }));

          // Show compliment
          setCurrentCompliment(gameData.compliments[firstCard.pairId]);
          setShowCompliment(true);

          setTimeout(() => {
            setShowCompliment(false);
          }, 3000);

          // Check win condition
          if (newMatchedPairs === 8) {
            setTimeout(() => {
              setShowWinModal(true);
            }, 1500);
          }
        } else {
          // No match
          const resetCards = newCards.map(c => 
            (c.id === firstId || c.id === secondId) 
              ? { ...c, isFlipped: false }
              : c
          );

          setGameState(prev => ({
            ...prev,
            cards: resetCards,
            flippedCards: []
          }));
        }
        setIsProcessing(false);
      }, 1000);
    }
  };

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCardClassName = (card) => {
    let className = 'enchanted-garden-card';
    if (card.isFlipped || card.isMatched) className += ' flipped';
    if (card.isMatched) className += ' matched';
    return className;
  };

  return (
    <div className="enchanted-garden-container">
      <div className="enchanted-garden-floating-petals">
        <div className="enchanted-garden-petal petal-1">🌸</div>
        <div className="enchanted-garden-petal petal-2">🌺</div>
        <div className="enchanted-garden-petal petal-3">🌸</div>
        <div className="enchanted-garden-petal petal-4">🌷</div>
        <div className="enchanted-garden-petal petal-5">🌸</div>
        <div className="enchanted-garden-petal petal-6">🌺</div>
      </div>

      <div className="enchanted-garden-wrapper">
        <header className="enchanted-garden-header">
          <h1 className="enchanted-garden-title">Enchanted Garden Memory</h1>
          <div className="enchanted-garden-stats">
            <div className="enchanted-garden-stat-item">
              <span className="enchanted-garden-stat-label">Moves:</span>
              <span className="enchanted-garden-stat-value">{gameState.moves}</span>
            </div>
            <div className="enchanted-garden-stat-item">
              <span className="enchanted-garden-stat-label">Time:</span>
              <span className="enchanted-garden-stat-value">{formatTime(gameState.time)}</span>
            </div>
          </div>
          <button className="enchanted-garden-restart-btn" onClick={initGame}>
            New Garden
          </button>
        </header>

        <main className="enchanted-garden-board-container">
          <div className="enchanted-garden-board">
            {gameState.cards.map(card => (
              <div 
                key={card.id}
                className={getCardClassName(card)}
                onClick={() => handleCardClick(card.id)}
              >
                <div className="enchanted-garden-card-inner">
                  <div className="enchanted-garden-card-face enchanted-garden-card-back"></div>
                  <div className="enchanted-garden-card-face enchanted-garden-card-front">
                    {card.symbol}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        <div className={`enchanted-garden-compliment-panel ${showCompliment ? 'visible' : ''}`}>
          <p className="enchanted-garden-compliment-text">{currentCompliment}</p>
        </div>

        <div className={`enchanted-garden-win-modal ${showWinModal ? 'visible' : ''}`}>
          <div className="enchanted-garden-win-content">
            <h2 className="enchanted-garden-win-title">🌸 Garden Complete! 🌸</h2>
            <div className="enchanted-garden-win-stats">
              <div>Moves: {gameState.moves}</div>
              <div>Time: {formatTime(gameState.time)}</div>
            </div>
            <button className="enchanted-garden-restart-btn" onClick={initGame}>
              Plant New Garden
            </button>
            <button className="enchanted-garden-home-btn" onClick={() => window.location.href = '/games'}>
              Go To Game Zone
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnchantedGardenMemory;