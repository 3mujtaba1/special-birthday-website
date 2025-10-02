import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './sidebar.css';

const BirthdaySidebar = () => {
  const [currentSection, setCurrentSection] = useState('Cake');
  const navigate = useNavigate();

  const navigationItems = [
    { label: "Cake", color: "#FF6B6B", icon: "🎂" },
    { label: "Cards", color: "#4ECDC4", icon: "💌" },
    { label: "Confetti Cannon", color: "#45B7D1", icon: "🎊" },
    { label: "Games Zone", color: "#96CEB4", icon: "🎮" }
  ];

  const routes = {
    "Cake": "/cake",
    "Cards": "/stacked-cards",
    "Confetti Cannon": "/confetti",
    "Games Zone": "/games",
  };

  const confettiColors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", 
    "#FFEAA7", "#DDA0DD", "#98FB98", "#F0E68C"
  ];

  const handleButtonClick = (label) => {
    setCurrentSection(label);
    navigate(routes[label]); // ✅ navigate only when button clicked
  };

  const handleButtonHover = (e) => {
    // Create fireworks effect
    const button = e.currentTarget;
    const fireworks = document.createElement('div');
    fireworks.className = 'fireworks';
    button.appendChild(fireworks);

    setTimeout(() => {
      if (fireworks.parentNode) {
        fireworks.remove();
      }
    }, 600);
  };

  return (
    <div className="birthday-sidebar">
      {/* Confetti particles */}
      <div className="confetti-container">
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="confetti"
            style={{
              '--delay': `${i * 0.4}s`,
              '--color': confettiColors[i % confettiColors.length]
            }}
          />
        ))}
      </div>

      {/* Cake icon section */}
      <div className="cake-section">
        <div className="cake-frame">
          <div className="sparkles">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="sparkle"
                style={{ '--delay': `${i * 0.3}s` }}
              />
            ))}
          </div>
          <div className="cake-icon">🎉</div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="navigation-container">
        {navigationItems.map((item, index) => (
          <button
            key={item.label}
            className={`balloon-button ${
              currentSection === item.label ? 'active' : ''
            } ${item.label === 'Confetti Cannon' ? 'special-button' : ''}`}
            style={{
              '--balloon-color': item.color,
              '--float-delay': `${index * 0.2}s`
            }}
            onClick={() => handleButtonClick(item.label)}
            onMouseEnter={handleButtonHover}
          >
            <div className="balloon-body">
              <div className="balloon-icon">{item.icon}</div>
              <div className="balloon-text">{item.label}</div>
            </div>
            <div className="balloon-string"></div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BirthdaySidebar;
