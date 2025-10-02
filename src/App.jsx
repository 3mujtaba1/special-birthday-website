import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import LandingPage from './components/landing_page/landing_page'
import MainPage from './components/main_page/main_page'
import Login from './components/login/login'
import Cake from './components/tab_1/cake'
import Cards from './components/tab_2/cards'
import Confetti from './components/tab_3/confetti'
import HeartMazeGame from './components/tab_5/heart_maze'
import DreamyStarCatcher from './components/tab_6/star_catcher'
import LoveMemoryGame from './components/tab_7/memory'
import GamesHomepage from './components/tab_4/games'
import JuiceMixer from './components/tab_8/juice'
import WhackAMoleBirthday from './components/tab_9/whack'
import MiniTetrisGifts from './components/tab_10/tetris'






const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/landing-page" element={<LandingPage />} />
        <Route path="/main-page" element={<MainPage />} />
        <Route path="/cake" element={<Cake />} />
        <Route path="/stacked-cards" element={<Cards />} />
        <Route path="/confetti" element={<Confetti />} />
        <Route path="/games" element={<GamesHomepage />} />
        <Route path="/games/heart-maze" element={<HeartMazeGame />} />
        <Route path="/games/star-catcher" element={<DreamyStarCatcher />} />
        <Route path="/games/memory-cards" element={<LoveMemoryGame />} />
        <Route path="/games/juice-mixer" element={<JuiceMixer />} />
        <Route path="/games/whack-a-hole" element={<WhackAMoleBirthday />} />
        <Route path="/games/tetris" element={<MiniTetrisGifts />} />
        
      </Routes>
    </Router>
  )
}

export default App
