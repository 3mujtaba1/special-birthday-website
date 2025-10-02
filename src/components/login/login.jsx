import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css'; 

const Login = () => {
    const [revealed, setRevealed] = useState(false);
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [secretCode, setSecretCode] = useState('');

    const handleClick = () => {
        setRevealed(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name === 'Evangelynnn' && secretCode === 'Angie18') {
            navigate('/landing-page');
        }
        else {
            alert('Oops! Wrong name or secret code 💔');
        }
    }

    return (
        <div className="w-screen h-screen relative overflow-hidden">
            {!revealed && (
                <div className="tap-text-overlay" onClick={handleClick}>
                    <p className="tap-text">Tap to unwrap 💝</p>
                </div>
            )}
        <div className={`curtain left-curtain ${revealed ? 'reveal' : ''}`} onClick={handleClick}></div>
        <div className={`curtain right-curtain ${revealed ? 'reveal' : ''}`} onClick={handleClick}></div>
            <div className="w-full h-full bg-gradient-to-b from-[#fce4ec] to-[#ff89b3] flex items-center justify-center">
                <div className="gift-box">
                    {/* Decorative Ribbons */}
                    <div className="ribbon-top"></div>
                    <div className="ribbon-left"></div>
                    <div className="ribbon-right"></div>
                    {/* Form */}
                    <h2 className="text-2xl font-bold text-pink-500 text-center mb-6" style={{ padding: "1.5rem 0rem 0.75rem 1rem" }}>Enter your customized Key 💖</h2>
                    <form className="flex flex-col gap-6" onSubmit={handleSubmit} style={{ padding: "1.5rem 0.7rem" }}>
                        <input type="text" className="input" placeholder='Your name...' value={name} onChange={(e) => setName(e.target.value)}/>
                        <input type="password" className="input" placeholder='Your Secret Code...' value={secretCode} onChange={(e) => setSecretCode(e.target.value)}/>
                        <button className="sbt-button" type='submit'>
                            Unlock your world 🎁
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login