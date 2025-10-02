import React, { useState } from 'react';
import './book_animation.css';
import bookCover from '../assets/book-cover.png';
import pageCover from '../assets/page-cover-r.png';

const BookAnimation = () => {
    const [isRotated, setIsRotated] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="book-animation-container">
            <div 
                className={`book-wrap ${isRotated ? 'rotate' : ''} ${isFlipped ? 'flip' : ''}`}
                onMouseEnter={() => setIsRotated(true)}
                onMouseLeave={() => setIsRotated(false)}
            >
                <div 
                    className="book" 
                    onClick={() => setIsFlipped(true)}
                    style={{ backgroundImage: `url(${bookCover})` }}
                />
                <div className="book-back" onClick={() => setIsFlipped(false)} >
                    <div className="page-background" style={{ backgroundImage: `url(${pageCover})` }} />
                    <div className="book-content">
                        <h3>To Evangelyn</h3>
                        <p>
                            Eighteen today and somehow still the same you,<br />
                            Kind, thoughtful, and real all the way through.<br />
                            The world doesn't always notice gentle things,<br />
                            But I do. And you're one of them.<br />
                            Have a blessed and happy 18th<br />
                            May all your dreams come true<br />
                            The best is yet to come<br />
                            And I'll be here cheering for you
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookAnimation;
