import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './landing_page.css';
import BookAnimation from '../../utils/book_animation.jsx';
import avatar from '../../assets/avatar.jpg';
import BirthdaySidebar from '../../utils/sidebar.jsx';


const LandingPage = () => {
    const navigate = useNavigate();
    const [showTitle, setShowTitle] = useState(true);   // controls title visibility
    const [showBook, setShowBook] = useState(false);    // controls book animation
    const [bookOpened, setBookOpened] = useState(false);    // controls book opened state
    const [showHeader, setShowHeader] = useState(false);    // controls header visibility
    const [sidebarOpened, setSidebarOpened] = useState(false); // controls sidebar visibility


    useEffect(() => {
        const timer = setTimeout(() => {
            setShowTitle(false);
            setTimeout(() => {
                setShowBook(true);
                setTimeout(() => setBookOpened(true), 500);
            }, 1000);
        }, 4000);


        return () => clearTimeout(timer);
    }, []);


    useEffect(() => {
        if (bookOpened) {
            const headerTimer = setTimeout(() => setShowHeader(true), 1000);
            return () => clearTimeout(headerTimer);
        }
    }, [bookOpened]);


    return (
        <div className="landing-page-container">
            <div className="birthday-container">


                {showTitle && <h1 className="birthday-title fade-in-out">Happy Birthday, My Love</h1>}


                {showBook && <BookAnimation />}


                {showHeader && (
                    <header className="header">
                        <button className="explore-btn" onClick={() => setSidebarOpened(!sidebarOpened)}>
                            Explore 🎈
                        </button>
                        
                        <div className="profile">
                            <img src={avatar} alt="pfp" className="avatar" />
                            <span className="name">Evangelyn 🌸</span>
                        </div>
                    </header>
                )}
                
                <div className={`sidebar ${sidebarOpened ? 'opened' : ''}`}>
                    <BirthdaySidebar />
                    <button className="close-btn" onClick={() => setSidebarOpened(false)}>Close✖️</button>
                    {/* <ul className="sidebar-links">
                        <li>
                            <button className="link-item" onClick={() => { navigate('/cake'); setSidebarOpened(false); }}>
                            <div className="icon-container">
                                <div className="icon-shape"></div>
                                <div className="ball"></div>
                            </div>
                            Cake For You
                            </button>
                        </li>
                        <li>
                            <button className="link-item" onClick={() => { navigate('/stacked-cards'); setSidebarOpened(false); }}>
                            <div className="icon-container">
                                <div className="icon-shape"></div>
                                <div className="ball"></div>
                            </div>
                            Notes Stack
                            </button>
                        </li>
                        <li>
                            <button className="link-item" onClick={() => { navigate('/confetti'); setSidebarOpened(false); }}>
                            <div className="icon-container">
                                <div className="icon-shape"></div>
                                <div className="ball"></div>
                            </div>
                            Gifts
                            </button>
                        </li>
                        </ul> */}
                </div>


            </div>
        </div>
    );
};


export default LandingPage;