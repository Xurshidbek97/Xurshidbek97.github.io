/* ============================================
   Soft Particle Starfield Animation
   For light background — subtle blue/gray particles
   Canvas-based, mouse-reactive, performance-optimized
   ============================================ */

(function () {
  'use strict';

  const canvas = document.getElementById('starfield');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H;
  let mouseX = 0, mouseY = 0;
  let animationId;
  let isVisible = true;

  /* ---------- Configuration ---------- */
  // Scale particle count with screen area (fewer on phones), capped
  const PARTICLE_DENSITY = 1 / 14000;   // particles per px²
  const MAX_PARTICLES = 110;
  const FRAME_MS = 1000 / 30;           // 30 fps is plenty for a slow drift
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SHOOTING_STAR_INTERVAL = 5000;
  const PARALLAX_STRENGTH = 0.015;
  const DRIFT_SPEED = 0.3;          // per frame at 30 fps

  /* ---------- Particles ---------- */
  const particles = [];
  const shootingStars = [];

  function createParticle() {
    const hue = 200 + Math.random() * 30; // blue range
    const sat = 40 + Math.random() * 30;
    const light = 55 + Math.random() * 20;
    const alpha = 0.12 + Math.random() * 0.22;
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      baseX: 0,
      baseY: 0,
      radius: Math.random() * 2.2 + 0.5,
      color: `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`,
      glowColor: `hsla(${hue}, ${sat}%, ${light}%, ${alpha * 0.3})`,
      sprite: null,
      twinkleOffset: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.002 + Math.random() * 0.003,
      driftX: (Math.random() - 0.5) * DRIFT_SPEED,
      driftY: (Math.random() - 0.5) * DRIFT_SPEED * 0.5,
      depth: Math.random() * 3 + 1
    };
  }

  function makeSprite(p) {
    const r = p.radius > 1.2 ? p.radius * 3 : p.radius;
    const size = Math.ceil(r * 2 + 2);
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const mid = size / 2;
    if (p.radius > 1.2) {
      g.beginPath();
      g.arc(mid, mid, p.radius * 3, 0, Math.PI * 2);
      g.fillStyle = p.glowColor;
      g.fill();
    }
    g.beginPath();
    g.arc(mid, mid, p.radius, 0, Math.PI * 2);
    g.fillStyle = p.color;
    g.fill();
    p.sprite = c;
    p.half = mid;
  }

  function initParticles() {
    particles.length = 0;
    const count = Math.min(MAX_PARTICLES, Math.round(W * H * PARTICLE_DENSITY));
    for (let i = 0; i < count; i++) {
      const p = createParticle();
      makeSprite(p);
      p.baseX = p.x;
      p.baseY = p.y;
      particles.push(p);
    }
  }

  /* ---------- Shooting Stars ---------- */
  function createShootingStar() {
    const startX = Math.random() * W * 0.8;
    const startY = Math.random() * H * 0.3;
    return {
      x: startX,
      y: startY,
      length: Math.random() * 70 + 50,
      speed: Math.random() * 7 + 9,
      angle: (Math.PI / 6) + Math.random() * (Math.PI / 6),
      opacity: 0.6,
      life: 1,
      decay: 0.015 + Math.random() * 0.01
    };
  }

  /* ---------- Resize ---------- */
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initParticles();
  }

  /* ---------- Draw ---------- */
  function drawParticle(p, time) {
    const twinkle = Math.sin(time * p.twinkleSpeed + p.twinkleOffset) * 0.35 + 0.65;

    // Drift movement
    p.baseX += p.driftX;
    p.baseY += p.driftY;

    // Wrap around edges
    if (p.baseX < -10) p.baseX = W + 10;
    if (p.baseX > W + 10) p.baseX = -10;
    if (p.baseY < -10) p.baseY = H + 10;
    if (p.baseY > H + 10) p.baseY = -10;

    // Parallax offset
    const dx = (mouseX - W / 2) * PARALLAX_STRENGTH * p.depth;
    const dy = (mouseY - H / 2) * PARALLAX_STRENGTH * p.depth;

    const px = p.baseX + dx;
    const py = p.baseY + dy;

    ctx.globalAlpha = twinkle;
    ctx.drawImage(p.sprite, px - p.half, py - p.half);
    ctx.globalAlpha = 1;
  }

  function drawShootingStar(ss) {
    const tailX = ss.x - Math.cos(ss.angle) * ss.length;
    const tailY = ss.y - Math.sin(ss.angle) * ss.length;

    const gradient = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
    gradient.addColorStop(0, `rgba(26, 143, 212, 0)`);
    gradient.addColorStop(0.7, `rgba(26, 143, 212, ${ss.opacity * 0.25})`);
    gradient.addColorStop(1, `rgba(26, 143, 212, ${ss.opacity * 0.6})`);

    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(ss.x, ss.y);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.arc(ss.x, ss.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(26, 143, 212, ${ss.opacity * 0.7})`;
    ctx.fill();
  }

  /* ---------- Animation Loop ---------- */
  let lastFrame = 0;

  function animate(time) {
    animationId = requestAnimationFrame(animate);
    if (time - lastFrame < FRAME_MS) return;
    lastFrame = time;
    drawFrame(time);
  }

  function drawFrame(time) {
    ctx.clearRect(0, 0, W, H);

    // Draw particles
    for (let i = 0; i < particles.length; i++) {
      drawParticle(particles[i], time);
    }

    // Update & draw shooting stars
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.life -= ss.decay;
      ss.opacity = Math.max(0, ss.life * 0.6);

      if (ss.life <= 0 || ss.x > W + 100 || ss.y > H + 100) {
        shootingStars.splice(i, 1);
      } else {
        drawShootingStar(ss);
      }
    }
  }

  function start() {
    if (!animationId && !reduceMotion) animationId = requestAnimationFrame(animate);
  }

  function stop() {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  /* ---------- Events ---------- */
  let mouseThrottle = false;
  document.addEventListener('mousemove', (e) => {
    if (mouseThrottle) return;
    mouseThrottle = true;
    mouseX = e.clientX;
    mouseY = e.clientY;
    requestAnimationFrame(() => { mouseThrottle = false; });
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (mouseThrottle || !e.touches[0]) return;
    mouseThrottle = true;
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
    requestAnimationFrame(() => { mouseThrottle = false; });
  }, { passive: true });

  // Fully stop the loop while the tab is in the background
  document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden;
    if (isVisible) start(); else stop();
  });

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resize();
      if (reduceMotion) drawFrame(0);
    }, 200);
  }, { passive: true });

  if (!reduceMotion) setInterval(() => {
    if (isVisible && shootingStars.length < 2) {
      shootingStars.push(createShootingStar());
    }
  }, SHOOTING_STAR_INTERVAL);

  /* ---------- Init ---------- */
  resize();
  mouseX = W / 2;
  mouseY = H / 2;
  if (reduceMotion) {
    drawFrame(0); // one still frame, no animation
  } else {
    start();
  }

})();
