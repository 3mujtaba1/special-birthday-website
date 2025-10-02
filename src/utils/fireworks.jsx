import React, { useRef, useEffect, useLayoutEffect } from "react";
import './fireworks.css';

const CannonCanvas = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  // Mutable simulation state refs (no re-renders needed)
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const isMouseDownRef = useRef(false);
  const gravityRef = useRef(-0.1);
  const desiredAngleRef = useRef(0);

  const cannonRef = useRef(null);
  const cannonballsRef = useRef([]);
  const explosionsRef = useRef([]);
  const colorsRef = useRef([]);

  const timerRef = useRef(0);
  const isIntroCompleteRef = useRef(false);
  const introTimerRef = useRef(0);
  const rafIdRef = useRef(null);

  // Classes translated to function-constructors that close over canvas/context refs
  function Cannon(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.angle = 0;
    this.color = color;

    this.update = () => {
      const mouse = mouseRef.current;
      desiredAngleRef.current = Math.atan2(mouse.y - this.y, mouse.x - this.x);
      this.angle = desiredAngleRef.current;
      this.draw();
    };

    this.draw = () => {
      const c = ctxRef.current;
      c.save();
      c.translate(this.x, this.y);
      c.rotate(this.angle);
      c.beginPath();
      c.fillStyle = this.color;
      c.shadowColor = this.color;
      c.shadowBlur = 3;
      c.shadowOffsetX = 0;
      c.shadowOffsetY = 0;
      c.fillRect(0, -this.height / 2, this.width, this.height);
      c.closePath();
      c.restore();
    };
  }

  function Cannonball(x, y, dx, dy, radius, color, cannon, particleColors) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = -dy;
    this.radius = radius;
    this.color = color;
    this.particleColors = particleColors;
    this.source = cannon;
    this.timeToLive = () => {
      const canvas = canvasRef.current;
      return canvas.height / (canvas.height + 800);
    };
    this.ttl = this.timeToLive();

    this.init = () => {
      const canvas = canvasRef.current;
      const mouse = mouseRef.current;
      this.x = Math.cos(this.source.angle) * this.source.width;
      this.y = Math.sin(this.source.angle) * this.source.width;
      this.x = this.x + canvas.width / 2;
      this.y = this.y + canvas.height;
      if (mouse.x - canvas.width / 2 < 0) {
        this.dx = -this.dx;
      }
      this.dy = Math.sin(this.source.angle) * 8;
      this.dx = Math.cos(this.source.angle) * 8;
    };

    this.update = () => {
      const canvas = canvasRef.current;
      const gravity = gravityRef.current;
      if (this.y + this.radius + this.dy > canvas.height) {
        this.dy = -this.dy;
      } else {
        this.dy += gravity;
      }
      this.x += this.dx;
      this.y += this.dy;
      this.draw();
      this.ttl -= 0.01;
    };

    this.draw = () => {
      const c = ctxRef.current;
      c.save();
      c.beginPath();
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      c.shadowColor = this.color;
      c.shadowBlur = 5;
      c.shadowOffsetX = 0;
      c.shadowOffsetY = 0;
      c.fillStyle = this.color;
      c.fill();
      c.closePath();
      c.restore();
    };

    this.init();
  }

  function Particle(x, y, dx, dy, radius, color) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = -dy;
    this.radius = 5;
    this.color = color;
    this.timeToLive = 1;

    this.update = () => {
      const canvas = canvasRef.current;
      if (this.y + this.radius + this.dy > canvas.height) {
        this.dy = -this.dy;
      }
      if (this.x + this.radius + this.dx > canvas.width || this.x - this.radius + this.dx < 0) {
        this.dx = -this.dx;
      }
      this.x += this.dx;
      this.y += this.dy;
      this.draw();
      this.timeToLive -= 0.01;
    };

    this.draw = () => {
      const c = ctxRef.current;
      c.save();
      c.beginPath();
      c.arc(this.x, this.y, 2, 0, Math.PI * 2, false);
      c.shadowColor = this.color;
      c.shadowBlur = 10;
      c.shadowOffsetX = 0;
      c.shadowOffsetY = 0;
      c.fillStyle = this.color;
      c.fill();
      c.closePath();
      c.restore();
    };
  }

  function Explosion(cannonball) {
    this.particles = [];
    this.rings = [];
    this.source = cannonball;

    this.init = () => {
      for (let i = 0; i < 10; i++) {
        const dx = Math.random() * 6 - 3;
        const dy = Math.random() * 6 - 3;
        const randomColorIndex = Math.floor(Math.random() * this.source.particleColors.length);
        const randomParticleColor = this.source.particleColors[randomColorIndex];
        this.particles.push(new Particle(this.source.x, this.source.y, dx, dy, 1, randomParticleColor));
      }
    };

    this.update = () => {
      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].update();
        if (this.particles[i].timeToLive < 0) {
          this.particles.splice(i, 1);
          i--;
        }
      }
      for (let j = 0; j < this.rings.length; j++) {
        this.rings[j].update();
        if (this.rings[j].timeToLive < 0) {
          this.rings.splice(j, 1);
          j--;
        }
      }
    };

    this.init();
  }

  const initializeVariables = () => {
    const canvas = canvasRef.current;
    cannonRef.current = new Cannon(canvas.width / 2, canvas.height, 40, 20, "white");
    cannonballsRef.current = [];
    explosionsRef.current = [];
    colorsRef.current = [
      {
        cannonballColor: "#affdf4",
        particleColors: ["#ff4747", "#00ceed", "#fff", "pink"],
      },
    ];
    timerRef.current = 0;
    isIntroCompleteRef.current = false;
    introTimerRef.current = 0;
  };

  // Canvas setup and resize handling
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctxRef.current = canvas.getContext("2d");
    initializeVariables();

    const onMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeVariables();
    };
    const onMouseDown = () => {
      isMouseDownRef.current = true;
    };
    const onMouseUp = () => {
      isMouseDownRef.current = false;
    };
    const onTouchStart = () => {
      isMouseDownRef.current = true;
    };
    const onTouchMove = (e) => {
      e.preventDefault();
      mouseRef.current.x = e.touches.pageX;
      mouseRef.current.y = e.touches.pageY;
    };
    const onTouchEnd = () => {
      isMouseDownRef.current = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // Animation loop
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const c = ctxRef.current;

    const animate = () => {
      // Schedule next frame first to pair cleanup correctly
      rafIdRef.current = requestAnimationFrame(animate);

      c.fillStyle = "rgba(18, 18, 18, 0.2)";
      c.fillRect(0, 0, canvas.width, canvas.height);

      // Update cannon
      cannonRef.current.update();

      // Intro burst logic
      if (isIntroCompleteRef.current === false) {
        introTimerRef.current += 1;
        if (introTimerRef.current % 3 === 0) {
          const color = colorsRef.current[Math.floor(Math.random() * colorsRef.current.length)];
          cannonballsRef.current.push(
            new Cannonball(
              canvas.width / 2,
              canvas.height / 2,
              2,
              2,
              4,
              color.cannonballColor,
              cannonRef.current,
              color.particleColors
            )
          );
        }
        if (introTimerRef.current > 30) {
          isIntroCompleteRef.current = true;
        }
      }

      // Update cannonballs
      for (let i = 0; i < cannonballsRef.current.length; i++) {
        const ball = cannonballsRef.current[i];
        ball.update();
        if (ball.ttl <= 0) {
          explosionsRef.current.push(new Explosion(ball));
          cannonballsRef.current.splice(i, 1);
          i--;
        }
      }

      // Update explosions
      for (let j = 0; j < explosionsRef.current.length; j++) {
        const ex = explosionsRef.current[j];
        ex.update();
        if (ex.particles.length <= 0) {
          explosionsRef.current.splice(j, 1);
          j--;
        }
      }

      // Mouse fire
      if (isMouseDownRef.current === true) {
        timerRef.current += 1;
        if (timerRef.current % 3 === 0) {
          const randomColors = colorsRef.current[Math.floor(Math.random() * colorsRef.current.length)];
          cannonballsRef.current.push(
            new Cannonball(
              mouseRef.current.x,
              mouseRef.current.y,
              2,
              2,
              4,
              randomColors.cannonballColor,
              cannonRef.current,
              randomColors.particleColors
            )
          );
        }
      }
    };

    rafIdRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  return (
  <canvas
    ref={canvasRef}
    style={{
      position: "fixed",
      inset: 0,
      width: "100vw",
      height: "100vh",
      zIndex: 0,
      display: "block",
      pointerEvents: "none",
    }}
  />
);
};


export default CannonCanvas;
