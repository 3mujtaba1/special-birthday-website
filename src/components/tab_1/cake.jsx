import React, { useEffect, useRef, useState } from 'react'
import './cake.css'
import { useNavigate } from 'react-router-dom';
import Loader from '../../utils/Loader.jsx'; //  Import loader

const Cake = () => {
  const navigate = useNavigate();
  const cakeRef = useRef(null);
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(true); //  loader state

  // Loader timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500); // spinner duration (ms)
    return () => clearTimeout(timer);
  }, []);
  

  const blowOutCandles = () => {
    setCandles((prev) =>
      prev.map((candle) =>
        !candle.out && Math.random() > 0.5 ? { ...candle, out: true } : candle
      )
    );
  };

  const handleCakeClick = (event) => {
    if (!cakeRef.current) return;
    const rect = cakeRef.current.getBoundingClientRect();
    const left = event.clientX - rect.left;
    const top = event.clientY - rect.top;
    setCandles((prev) => [...prev, { left, top, out: false }]);
  };

  // Microphone + blowing detection
  useEffect(() => {
    let audioContext;
    let analyser;
    let microphone;
    let intervalId;

    function isBlowing() {
      if (!analyser) return false;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const bufferLength = analyser.frequencyBinCount;
      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
      let average = sum / bufferLength;
      return average > 100;
    }

    function checkBlowing() {
      if (isBlowing()) {
        blowOutCandles();
      }
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
          analyser = audioContext.createAnalyser();
          microphone = audioContext.createMediaStreamSource(stream);
          microphone.connect(analyser);
          analyser.fftSize = 256;
          intervalId = setInterval(checkBlowing, 200);
        })
        .catch((err) => {
          console.error('Error accessing microphone:', err);
        });
    } else {
      console.error('getUserMedia not supported on your browser!');
    }

    return () => {
      if (audioContext) audioContext.close();
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // ✅ Show loader first
  if (loading) {
    return <Loader size={70} color="black" />;
  }

  return (
    <div className="cake-game-container">
      <div className="instructions">
        Place as many candles as you like on the cake! Then allow microphone
        access, take a deep breath, and blow into your mic and watch the
        candles go out just like magic! ✨💨
      </div>
      <div className="candle-count-display">
        Candles on the Cake: {candles.filter((c) => !c.out).length}
      </div>
      <div className="cake" ref={cakeRef} onClick={handleCakeClick}>
        <div className="plate"></div>
        <div className="layer layer-bottom"></div>
        <div className="layer layer-middle"></div>
        <div className="layer layer-top"></div>
        <div className="icing"></div>
        <div className="drip drip-one"></div>
        <div className="drip drip-two"></div>
        <div className="drip drip-three"></div>
        <div className="drip drip-four"></div>

        {candles.map((candle, i) => (
          <div
            key={i}
            className={`candle ${candle.out ? 'out' : ''}`}
            style={{ position: 'absolute', left: candle.left, top: candle.top }}
          >
            <div className="flame"></div>
          </div>
        ))}
      </div>
      <button
        className="back-btn"
        onClick={() => {
          navigate('/main-page');
        }}
      >
        Go to Main Page
      </button>
    </div>
  );
};

export default Cake;
