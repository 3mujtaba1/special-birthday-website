import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './confetti.css';
import Loader from '../../utils/Loader.jsx'; // Loader import

const Confetti = () => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const animationIdRef = useRef(null);
    const confettiPiecesRef = useRef([]);
    const timeRef = useRef(0);
    const lastFrameTimeRef = useRef(0);
    const navigate = useNavigate();

    // State variables
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
    const [hasInteracted, setHasInteracted] = useState(false);
    const [powerPercentage, setPowerPercentage] = useState(0);
    const [confettiCount, setConfettiCount] = useState(0);

    // Loader state
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 2000); // Show loader 1.2s
        return () => clearTimeout(timer);
    }, []);

    // Physics configuration
    const physics = {
        gravity: 0.35,
        airResistance: 0.985,
        minStartVelocity: 6,
        maxStartVelocity: 16,
        drift: 0.08,
        flutter: 0.8,
        spreadAngle: 80,
        minConfetti: 25,
        maxConfetti: 300,
        bounceDecay: 0.7
    };

    // Visual configuration
    const visual = {
        colors: [
            '#ff6b6b','#4ecdc4','#45b7d1','#96ceb4','#feca57','#ff9ff3','#54a0ff','#5f27cd','#00d2d3','#ff9f43','#ff6348','#c44569','#6c5ce7','#fd79a8','#fdcb6e','#e17055'
        ],
        shapes: ['rectangle','circle','triangle','star','diamond'],
        minSize: 2.5,
        maxSize: 11,
        minRotationSpeed: -0.15,
        maxRotationSpeed: 0.15
    };

    const maxDragDistance = 220;

    const setupCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
    };

    const getDragDistance = () => {
        const dx = currentPos.x - startPos.x;
        const dy = currentPos.y - startPos.y;
        return Math.sqrt(dx*dx + dy*dy);
    };

    const calculateConfettiCount = (dragDistance) => {
        const power = Math.min(dragDistance / maxDragDistance, 1);
        return Math.round(physics.minConfetti + (power * (physics.maxConfetti - physics.minConfetti)));
    };

    const updatePowerMeter = () => {
        const dragDistance = getDragDistance();
        const power = Math.min(dragDistance / maxDragDistance, 1);
        setPowerPercentage(Math.round(power * 100));
        setConfettiCount(calculateConfettiCount(dragDistance));
    };

    const createSmoothConfettiPiece = (baseAngle, power, index, total) => {
        const spreadRad = (physics.spreadAngle * Math.PI)/180;
        const halfSpread = spreadRad/2;
        const normalizedIndex = index / total;
        const conePosition = normalizedIndex*2-1;
        const angleOffset = conePosition*halfSpread + (Math.random()-0.5)*0.4;
        const pieceAngle = baseAngle + angleOffset;
        const centerDistance = Math.abs(conePosition);
        const velocityMultiplier = 0.7 + Math.random()*0.6;
        const baseVelocity = (physics.minStartVelocity + (power*(physics.maxStartVelocity-physics.minStartVelocity)))*velocityMultiplier;
        const velocity = baseVelocity*(1-(centerDistance*0.2));

        return {
            x: startPos.x,
            y: startPos.y,
            vx: Math.cos(pieceAngle)*velocity,
            vy: Math.sin(pieceAngle)*velocity,
            gravity: physics.gravity+(Math.random()-0.5)*0.1,
            airResistance: physics.airResistance+(Math.random()-0.5)*0.01,
            size: visual.minSize + Math.random()*(visual.maxSize-visual.minSize),
            color: visual.colors[Math.floor(Math.random()*visual.colors.length)],
            shape: visual.shapes[Math.floor(Math.random()*visual.shapes.length)],
            rotation: Math.random()*Math.PI*2,
            rotationSpeed: visual.minRotationSpeed + Math.random()*(visual.maxRotationSpeed-visual.minRotationSpeed),
            flutterPhase: Math.random()*Math.PI*2,
            flutterSpeed: 0.02 + Math.random()*0.03,
            flutterAmplitude: physics.flutter*(0.5 + Math.random()*0.5),
            tilt: (Math.random()-0.5)*0.8,
            tiltSpeed: (Math.random()-0.5)*0.02,
            life: 1.0,
            decay: 0.008 + Math.random()*0.004,
            driftX: (Math.random()-0.5)*physics.drift,
            driftY: (Math.random()-0.5)*physics.drift*0.5
        };
    };

    const fireConfetti = () => {
        const dragDistance = getDragDistance();
        if(dragDistance<10) return;
        const count = calculateConfettiCount(dragDistance);
        const power = Math.min(dragDistance/maxDragDistance, 1);
        const dx = currentPos.x-startPos.x;
        const dy = currentPos.y-startPos.y;
        const fireAngle = Math.atan2(-dy,-dx);
        const newPieces = [];
        for(let i=0;i<count;i++){
            newPieces.push(createSmoothConfettiPiece(fireAngle,power,i,count));
        }
        confettiPiecesRef.current = [...confettiPiecesRef.current,...newPieces];
    };

    const updateConfetti = (deltaTime) => {
        timeRef.current += deltaTime*0.001;
        for(let i=confettiPiecesRef.current.length-1;i>=0;i--){
            const c = confettiPiecesRef.current[i];
            c.vy += c.gravity*deltaTime*0.06;
            c.vx *= Math.pow(c.airResistance, deltaTime*0.06);
            c.vy *= Math.pow(c.airResistance, deltaTime*0.06);
            const flutterX = Math.sin(timeRef.current*c.flutterSpeed+c.flutterPhase)*c.flutterAmplitude;
            const flutterY = Math.cos(timeRef.current*c.flutterSpeed+c.flutterPhase)*c.flutterAmplitude*0.5;
            c.x += (c.vx+flutterX+c.driftX)*deltaTime*0.06;
            c.y += (c.vy+flutterY+c.driftY)*deltaTime*0.06;
            c.rotation += c.rotationSpeed*deltaTime*0.06;
            c.tilt += c.tiltSpeed*deltaTime*0.06;
            c.life -= c.decay*deltaTime*0.06;

            const canvas = canvasRef.current;
            if(canvas && (c.x<=0||c.x>=canvas.width)){
                c.vx*=-physics.bounceDecay;
                c.x = Math.max(0,Math.min(canvas.width,c.x));
            }

            if(c.life<=0 || c.y>(canvas?.height||0)+100 || c.x<-100 || c.x>(canvas?.width||0)+100){
                confettiPiecesRef.current.splice(i,1);
            }
        }
    };

    const drawStar = (ctx,cx,cy,spikes,outerR,innerR)=>{
        let rot=Math.PI/2*3,x=cx,y=cy,step=Math.PI/spikes;
        ctx.beginPath();
        ctx.moveTo(cx,cy-outerR);
        for(let i=0;i<spikes;i++){
            x=cx+Math.cos(rot)*outerR;
            y=cy+Math.sin(rot)*outerR;
            ctx.lineTo(x,y);
            rot+=step;
            x=cx+Math.cos(rot)*innerR;
            y=cy+Math.sin(rot)*innerR;
            ctx.lineTo(x,y);
            rot+=step;
        }
        ctx.lineTo(cx,cy-outerR);
        ctx.closePath();
    };

    const drawConfetti = ()=>{
        const ctx = ctxRef.current;
        if(!ctx) return;
        for(const c of confettiPiecesRef.current){
            ctx.save();
            ctx.globalAlpha = Math.max(0,c.life);
            ctx.translate(c.x,c.y);
            ctx.rotate(c.rotation);
            ctx.scale(1,Math.cos(c.tilt));
            ctx.fillStyle = c.color;
            const halfSize = c.size*0.5;
            ctx.beginPath();
            switch(c.shape){
                case 'rectangle': ctx.roundRect(-halfSize,-halfSize,c.size,c.size,1); break;
                case 'circle': ctx.arc(0,0,halfSize,0,Math.PI*2); break;
                case 'triangle': ctx.moveTo(0,-halfSize); ctx.lineTo(halfSize,halfSize); ctx.lineTo(-halfSize,halfSize); ctx.closePath(); break;
                case 'star': drawStar(ctx,0,0,5,halfSize,halfSize*0.5); break;
                case 'diamond': ctx.moveTo(0,-halfSize); ctx.lineTo(halfSize,0); ctx.lineTo(0,halfSize); ctx.lineTo(-halfSize,0); ctx.closePath(); break;
                default: ctx.roundRect(-halfSize,-halfSize,c.size,c.size,1);
            }
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ctx.restore();
        }
    };

    const drawDragVector = ()=>{
        const ctx = ctxRef.current;
        if(!ctx || !isDragging) return;
        const dragDistance = getDragDistance();
        if(dragDistance<5) return;
        ctx.save();
        const power = Math.min(dragDistance/maxDragDistance,1);
        const circleRadius = 12 + power*50;
        ctx.globalAlpha = 0.2 + power*0.2;
        const gradient = ctx.createRadialGradient(startPos.x,startPos.y,0,startPos.x,startPos.y,circleRadius);
        gradient.addColorStop(0,`rgba(255,255,255,${0.3+power*0.2})`);
        gradient.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(startPos.x,startPos.y,circleRadius,0,Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 0.8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const lineGradient = ctx.createLinearGradient(startPos.x,startPos.y,currentPos.x,currentPos.y);
        lineGradient.addColorStop(0,'rgba(255,255,255,0.9)');
        lineGradient.addColorStop(1,`rgba(116,185,255,${0.6+power*0.4})`);
        ctx.strokeStyle = lineGradient;
        ctx.lineWidth = 3+power*2;
        ctx.beginPath();
        ctx.moveTo(startPos.x,startPos.y);
        ctx.lineTo(currentPos.x,currentPos.y);
        ctx.stroke();
        const angle = Math.atan2(currentPos.y-startPos.y,currentPos.x-startPos.x);
        const arrowLength = 18+power*5;
        const arrowAngle = 0.4;
        ctx.lineWidth = 2+power;
        ctx.beginPath();
        ctx.moveTo(currentPos.x,currentPos.y);
        ctx.lineTo(currentPos.x-arrowLength*Math.cos(angle-arrowAngle),currentPos.y-arrowLength*Math.sin(angle-arrowAngle));
        ctx.moveTo(currentPos.x,currentPos.y);
        ctx.lineTo(currentPos.x-arrowLength*Math.cos(angle+arrowAngle),currentPos.y-arrowLength*Math.sin(angle+arrowAngle));
        ctx.stroke();
        ctx.restore();
    };

    const render = (currentTime)=>{
        const deltaTime = currentTime-lastFrameTimeRef.current;
        lastFrameTimeRef.current = currentTime;
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if(!canvas || !ctx) return;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        updateConfetti(deltaTime);
        drawConfetti();
        drawDragVector();
    };

    const startAnimationLoop = ()=>{
        const animate = (currentTime)=>{
            render(currentTime);
            animationIdRef.current = requestAnimationFrame(animate);
        };
        animationIdRef.current = requestAnimationFrame(animate);
    };

    const handleStart = (x,y)=>{
        setIsDragging(true);
        setStartPos({x,y});
        setCurrentPos({x,y});
        if(!hasInteracted) setHasInteracted(true);
    };

    const handleMove = (x,y)=>{ if(isDragging) setCurrentPos({x,y}); };
    const handleEnd = ()=>{
        if(!isDragging) return;
        setIsDragging(false);
        fireConfetti();
        setPowerPercentage(0);
        setConfettiCount(0);
    };

    useEffect(()=>{
        const canvas = canvasRef.current;
        if(!canvas) return;
        ctxRef.current = canvas.getContext('2d');
        setupCanvas();
        startAnimationLoop();
        const handleResize = ()=>setupCanvas();
        window.addEventListener('resize',handleResize);
        return ()=>{
            window.removeEventListener('resize',handleResize);
            if(animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
        };
    },[]);

    useEffect(()=>{
        if(isDragging) updatePowerMeter();
    },[currentPos,isDragging]);

    useEffect(()=>{
        const ctx = ctxRef.current;
        if(ctx && !ctx.roundRect){
            ctx.roundRect = function(x,y,w,h,r){
                if(r===0){ this.rect(x,y,w,h); return; }
                this.beginPath();
                this.moveTo(x+r,y);
                this.lineTo(x+w-r,y);
                this.quadraticCurveTo(x+w,y,x+w,y+r);
                this.lineTo(x+w,y+h-r);
                this.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
                this.lineTo(x+r,y+h);
                this.quadraticCurveTo(x,y+h,x,y+h-r);
                this.lineTo(x,y+r);
                this.quadraticCurveTo(x,y,x+r,y);
                this.closePath();
            };
        }
    },[]);

    // Show loader if still loading
    if(loading) return <Loader size={70} color="black" />;

    return (
        <div className="smooth-confetti-cannon">
            <button className="smooth-confetti-cannon__go-to-main-btn" onClick={()=>navigate('/main-page')}>
                ← Go to Main Page
            </button>
            <div className="smooth-confetti-cannon__power-meter-container">
                <div className="smooth-confetti-cannon__power-meter-label">Power</div>
                <div className="smooth-confetti-cannon__power-meter">
                    <div className="smooth-confetti-cannon__power-meter-fill" style={{width:`${powerPercentage}%`}} />
                    <div className="smooth-confetti-cannon__power-meter-text">{powerPercentage}%</div>
                </div>
            </div>
            <div className={`smooth-confetti-cannon__instructions ${isDragging?'smooth-confetti-cannon__instructions--faded':''}`}>
                <h2>🎉 Confetti Cannon</h2>
                <p>Click and drag anywhere to aim and power up!</p>
                <p>Release to fire a burst of confetti!</p>
                <p>Enjoy the celebration! 🥳</p>
            </div>
            <canvas 
                ref={canvasRef}
                className="smooth-confetti-cannon__canvas"
                onMouseDown={e=>handleStart(e.clientX,e.clientY)}
                onMouseMove={e=>handleMove(e.clientX,e.clientY)}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={e=>{e.preventDefault(); handleStart(e.touches[0].clientX,e.touches[0].clientY);}}
                onTouchMove={e=>{e.preventDefault(); handleMove(e.touches[0].clientX,e.touches[0].clientY);}}
                onTouchEnd={e=>{e.preventDefault(); handleEnd();}}
            />
            <div className="smooth-confetti-cannon__confetti-counter">
                {isDragging && confettiCount>0 ? `${confettiCount} confetti ready! 🎯` : 'Ready for confetti! 🎉 '}
            </div>
        </div>
    );
};

export default Confetti;
