import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './main_page.css';
import BookAnimation from '../../utils/book_animation.jsx';
import avatar from '../../assets/avatar.jpg';
import BirthdaySidebar from '../../utils/sidebar.jsx';
import Loader from '../../utils/Loader.jsx'; // ✅ import loader

const MainPage = () => {
  const navigate = useNavigate();

  // Sidebar state
  const [sidebarOpened, setSidebarOpened] = useState(false);

  // Loader state
  const [loading, setLoading] = useState(true);

  // Show loader briefly when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500); // you can adjust duration here (ms)
    return () => clearTimeout(timer);
  }, []);

  // If loading, show spinner only
  if (loading) {
    return <Loader size={120} color="black" />;
  }

  return (
    <div className="main-page-container">
      <div className="birthday-container">
        {/* Book rendered immediately */}
        <BookAnimation />

        {/* Header */}
        <header className="header">
          <button
            className="explore-btn"
            onClick={() => setSidebarOpened(!sidebarOpened)}
          >
            Explore 🎈
          </button>

          <div className="profile">
            <img src={avatar} alt="pfp" className="avatar" />
            <span className="name">Evangelyn 🌸</span>
          </div>
        </header>

        {/* Sidebar */}
        <div className={`sidebar ${sidebarOpened ? 'opened' : ''}`}>
          <button className="close-btn" onClick={() => setSidebarOpened(false)}>
            Close✖️
          </button>
          <ul className="sidebar-links">
            <li>
              <button
                className="link-item"
                onClick={() => {
                  navigate('/cake');
                  setSidebarOpened(false);
                }}
              >
                <div className="icon-container">
                  <div className="icon-shape"></div>
                  <div className="ball"></div>
                </div>
                Cake For You
              </button>
            </li>
            <li>
              <button
                className="link-item"
                onClick={() => {
                  navigate('/stacked-cards');
                  setSidebarOpened(false);
                }}
              >
                <div className="icon-container">
                  <div className="icon-shape"></div>
                  <div className="ball"></div>
                </div>
                Notes Stack
              </button>
            </li>
            <li>
              <button
                className="link-item"
                onClick={() => {
                  navigate('/confetti');
                  setSidebarOpened(false);
                }}
              >
                <div className="icon-container">
                  <div className="icon-shape"></div>
                  <div className="ball"></div>
                </div>
                Confetti Cannon
              </button>
            </li>
            <li>
              <button
                className="link-item"
                onClick={() => {
                  navigate('/games');
                  setSidebarOpened(false);
                }}
              >
                <div className="icon-container">
                  <div className="icon-shape"></div>
                  <div className="ball"></div>
                </div>
                Games Zone
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
