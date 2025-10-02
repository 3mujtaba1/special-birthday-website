import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './games.css';
import avatar1 from '../../assets/avatar_1.png';
import Loader from '../../utils/Loader.jsx'; // Loader import

const GamesHomepage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000); // Show loader 1.2s
    return () => clearTimeout(timer);
  }, []);

  const handleGameNavigation = (gameRoute) => {
    navigate(gameRoute);
  };

  const handleMainPageNavigation = () => {
    navigate('/main-page');
  };

  const games = [
    {
      id: 'tetris',
      name: 'Tetris',
      icon: '🧩',
      description: 'Stack blocks and clear lines like a boss!',
      route: '/games/tetris',
      vibe: 'Classic',
      mood: '🎯',
      color: 'purple'
    },
    {
      id: 'heartmaze',
      name: 'Heart Maze',
      icon: '💖',
      description: 'Find your way through love and mazes',
      route: '/games/heart-maze',
      vibe: 'Romantic',
      mood: '💕',
      color: 'pink'
    },
    {
      id: 'starcatcher',
      name: 'Star Catcher',
      icon: '⭐',
      description: 'Catch stars and feel cosmic vibes',
      route: '/games/star-catcher',
      vibe: 'Cosmic',
      mood: '✨',
      color: 'blue'
    },
    {
      id: 'memorycards',
      name: 'Memory Cards',
      icon: '🃏',
      description: 'Test your brain power with matching fun',
      route: '/games/memory-cards',
      vibe: 'Brainy',
      mood: '🧠',
      color: 'green'
    },
    {
      id: 'juicemixer',
      name: 'Juice Mixer',
      icon: '🧃',
      description: 'Mix drinks and create tasty combinations',
      route: '/games/juice-mixer',
      vibe: 'Creative',
      mood: '🎨',
      color: 'orange'
    },
    {
      id: 'whackahole',
      name: 'Whack a Hole',
      icon: '🕳️',
      description: 'Quick reflexes needed - whack away!',
      route: '/games/whack-a-hole',
      vibe: 'Action',
      mood: '⚡',
      color: 'red'
    }
  ];

  const handlePlayClick = (e, gameRoute) => {
    e.stopPropagation();
    handleGameNavigation(gameRoute);
  };

  // Show loader while loading
  if (loading) return <Loader size={70} color="black" />;

  return (
    <div className="chill-gaming-zone">
      {/* Background Elements */}
      <div className="zone-background">
        <div className="floating-bubbles">
          <div className="bubble bubble-1"></div>
          <div className="bubble bubble-2"></div>
          <div className="bubble bubble-3"></div>
          <div className="bubble bubble-4"></div>
          <div className="bubble bubble-5"></div>
          <div className="bubble bubble-6"></div>
        </div>
        <div className="gradient-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="chill-nav">
        <button className="back-button" onClick={handleMainPageNavigation}>
          <span className="back-icon">←</span>
          <span className="back-text">Go To Main Menu</span>
        </button>
        <div className="nav-center">
          <div className="app-logo">🎮 GameZone</div>
        </div>
        <div className="nav-user">
          <div className="user-avatar"><img src={avatar1} alt="" /></div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="page-header">
          <div className="header-content">
            <h1 className="main-title">
              <span className="title-emoji">🎮</span>
              What's your vibe today?
            </h1>
            <p className="subtitle">Pick a game and let's have some fun!</p>
          </div>
          <div className="quick-stats">
            <div className="stat-bubble">
              <div className="stat-emoji">🎯</div>
              <div className="stat-text">6 Games</div>
            </div>
          </div>
        </header>

        {/* Games Section */}
        <section className="games-section">
          <div className="games-grid">
            {games.map((game, index) => (
              <div
                key={game.id}
                className={`game-card ${game.color}-theme`}
                onClick={() => handleGameNavigation(game.route)}
                style={{ '--delay': `${index * 120}ms` }}
              >
                <div className="card-glow"></div>
                
                <div className="card-header">
                  <div className="game-icon-big">{game.icon}</div>
                  <div className="game-mood">{game.mood}</div>
                </div>

                <div className="card-body">
                  <h3 className="game-name">{game.name}</h3>
                  <p className="game-desc">{game.description}</p>
                  
                  <div className="game-vibe">
                    <span className="vibe-label">Vibe:</span>
                    <span className="vibe-tag">{game.vibe}</span>
                  </div>
                </div>

                <div className="card-footer">
                  <button 
                    className="play-button"
                    onClick={(e) => handlePlayClick(e, game.route)}
                  >
                    <span className="play-text">Let's Play!</span>
                    <span className="play-emoji">🚀</span>
                  </button>
                </div>

                <div className="card-decoration">
                  <div className="deco-circle deco-1"></div>
                  <div className="deco-circle deco-2"></div>
                  <div className="deco-circle deco-3"></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="page-footer">
          <div className="footer-content">
            <div className="footer-emoji">✨</div>
            <p className="footer-text">Made with love for fun times!</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default GamesHomepage;
