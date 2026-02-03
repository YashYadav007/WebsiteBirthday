const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

// Background palette + density controls. Tweak here for both landing and story pages.
const BACKGROUND_THEMES = {
  pink: {
    baseColor: '#FFF7F9',
    palette: ['#E74C72', '#D6457B', '#F4A7B9', '#F9BBC8', '#F8DCE0'],
    bokehPalette: ['#FFFFFF', '#FCE3EB', '#F9D6E1'],
    minSize: 50,
    maxSize: 75,
    particleArea: 9000,
    minCount: 52,
    maxCount: 145,
    bokehCount: 13,
    parallaxStrength: 18,
  },
  purple: {
    baseColor: '#F7F3FF',
    palette: ['#6B4FA1', '#8C6CC2', '#B48DEB', '#D7C6F5', '#E9DEFA'],
    bokehPalette: ['#FFFFFF', '#F0E8FF', '#E3D4FB'],
    minSize: 40,
    maxSize: 70,
    particleArea: 9000,
    minCount: 52,
    maxCount: 145,
    bokehCount: 13,
    parallaxStrength: 18,
  },
  orange: {
    baseColor: '#FFF4EC',
    palette: ['#FF9A76', '#FFA980', '#FFD1B8', '#FDC4A8', '#C75B39'],
    bokehPalette: ['#FFFFFF', '#FFE5D5', '#FFDCC8'],
    minSize: 40,
    maxSize: 70,
    particleArea: 9000,
    minCount: 52,
    maxCount: 145,
    bokehCount: 13,
    parallaxStrength: 18,
  },
  blue: {
    baseColor: '#EEF5FF',
    palette: ['#5F8FE8', '#79A7FF', '#94B7FF', '#CFE0FF', '#A7C4FF'],
    bokehPalette: ['#FFFFFF', '#EAF2FF', '#DDEBFF'],
    minSize: 40,
    maxSize: 70,
    particleArea: 9000,
    minCount: 52,
    maxCount: 145,
    bokehCount: 13,
    parallaxStrength: 18,
  },
};

function initAnimatedBackground() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  const parser = new DOMParser();
  const prefersReducedMotion = motionQuery.matches;
  // Set data-bg-theme on <body>: pink | purple | orange.
  const requestedTheme = document.body.dataset.bgTheme;
  const themeName = Object.prototype.hasOwnProperty.call(BACKGROUND_THEMES, requestedTheme) ? requestedTheme : 'pink';
  const settings = BACKGROUND_THEMES[themeName];

  const svgShapes = {
    cuteHeart:
      "<svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'><path fill='currentColor' d='M50 88C24 68 12 54 12 36c0-13 10-23 23-23 8 0 12 3 15 8 3-5 7-8 15-8 13 0 23 10 23 23 0 18-12 32-38 52z'/></svg>",
    handDrawnHeart:
      "<svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'><path fill='none' stroke='currentColor' stroke-width='6' stroke-linecap='round' stroke-linejoin='round' d='M49 84C31 69 19 55 19 40c0-10 8-19 18-19 6 0 10 2 12 7 2-5 6-7 12-7 10 0 18 9 18 19 0 15-12 29-30 44z'/><path fill='none' stroke='currentColor' stroke-width='3.5' stroke-linecap='round' d='M50 78C35 66 25 53 25 40c0-7 5-13 12-13 5 0 8 2 10 6 2-4 5-6 10-6 7 0 12 6 12 13 0 13-9 24-27 38'/></svg>",
    pastelFlower:
      "<svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'><path fill='currentColor' d='M50 10c8 0 14 6 14 14s-6 14-14 14-14-6-14-14 6-14 14-14z'/><path fill='currentColor' d='M76 36c8 0 14 6 14 14s-6 14-14 14-14-6-14-14 6-14 14-14z'/><path fill='currentColor' d='M76 62c8 0 14 6 14 14s-6 14-14 14-14-6-14-14 6-14 14-14z'/><path fill='currentColor' d='M50 62c8 0 14 6 14 14s-6 14-14 14-14-6-14-14 6-14 14-14z'/><path fill='currentColor' d='M24 62c8 0 14 6 14 14s-6 14-14 14-14-6-14-14 6-14 14-14z'/><path fill='currentColor' d='M24 36c8 0 14 6 14 14s-6 14-14 14-14-6-14-14 6-14 14-14z'/><path fill='currentColor' d='M50 40c6 0 10 4 10 10s-4 10-10 10-10-4-10-10 4-10 10-10z'/></svg>",
    roseClipart:
      "<svg viewBox='0 0 100 120' xmlns='http://www.w3.org/2000/svg'><path fill='currentColor' d='M50 22c14 0 25 9 25 21 0 8-4 15-11 19 4 3 6 7 6 12 0 11-10 20-22 20-9 0-17-5-20-13-8-2-14-9-14-18 0-10 7-18 16-20-1-2-2-5-2-8 0-8 10-13 22-13z'/><path fill='none' stroke='currentColor' stroke-width='5' stroke-linecap='round' stroke-linejoin='round' d='M50 74c2 7 2 13 0 20-2 8-1 14 3 19M50 88c-7 2-12 7-15 13M50 93c7 2 12 7 15 13'/></svg>",
    doodleFlower:
      "<svg viewBox='0 0 100 120' xmlns='http://www.w3.org/2000/svg'><path fill='none' stroke='currentColor' stroke-width='5' stroke-linecap='round' stroke-linejoin='round' d='M50 22c4-8 14-8 18 0 9-1 14 8 9 15 7 6 4 16-5 16-3 8-13 10-18 3-8 5-17-1-16-10-8-3-8-14 0-18 0-8 10-12 16-6z'/><path fill='currentColor' d='M50 39c5 0 8 3 8 8s-3 8-8 8-8-3-8-8 3-8 8-8z'/><path fill='none' stroke='currentColor' stroke-width='4.5' stroke-linecap='round' d='M50 54v28m0 14c0 10-7 16-16 16'/></svg>",
  };

  const shapes = new Map();
  const spriteCache = new Map();
  const particles = [];
  const bokehCircles = [];

  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = null;
  let lastFrameTime = 0;

  const parallaxTarget = { x: 0, y: 0 };
  const parallax = { x: 0, y: 0 };

  const random = (min, max) => min + Math.random() * (max - min);
  const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const hexToRgba = (hex, alpha) => {
    const clean = hex.replace('#', '');
    const value = parseInt(clean, 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const compileShape = (svgText) => {
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    const viewBox = (svg.getAttribute('viewBox') || '0 0 100 100').split(/\s+/).map(Number);
    const [, , vbWidth, vbHeight] = viewBox;

    const paths = Array.from(svg.querySelectorAll('path')).map((path) => ({
      d: new Path2D(path.getAttribute('d') || ''),
      fill: path.getAttribute('fill') || 'none',
      stroke: path.getAttribute('stroke') || 'none',
      strokeWidth: Number(path.getAttribute('stroke-width') || 0),
      strokeLinecap: path.getAttribute('stroke-linecap') || 'round',
      strokeLinejoin: path.getAttribute('stroke-linejoin') || 'round',
    }));

    return { vbWidth, vbHeight, paths };
  };

  Object.entries(svgShapes).forEach(([name, svg]) => {
    shapes.set(name, compileShape(svg));
  });

  const getSprite = (shapeName, size, color) => {
    const key = `${shapeName}-${size}-${color}`;
    if (spriteCache.has(key)) return spriteCache.get(key);

    const shape = shapes.get(shapeName);
    const padding = Math.ceil(size * 0.3);
    const sprite = document.createElement('canvas');
    sprite.width = Math.ceil(size + padding * 2);
    sprite.height = Math.ceil(size + padding * 2);

    const spriteCtx = sprite.getContext('2d');
    spriteCtx.save();
    spriteCtx.translate(padding, padding);
    spriteCtx.scale(size / shape.vbWidth, size / shape.vbHeight);

    shape.paths.forEach((path) => {
      if (path.fill !== 'none') {
        spriteCtx.fillStyle = path.fill === 'currentColor' ? color : path.fill;
        spriteCtx.fill(path.d);
      }

      if (path.stroke !== 'none' && path.strokeWidth > 0) {
        spriteCtx.strokeStyle = path.stroke === 'currentColor' ? color : path.stroke;
        spriteCtx.lineWidth = path.strokeWidth;
        spriteCtx.lineCap = path.strokeLinecap;
        spriteCtx.lineJoin = path.strokeLinejoin;
        spriteCtx.stroke(path.d);
      }
    });

    spriteCtx.restore();
    spriteCache.set(key, sprite);
    return sprite;
  };

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.shapeName = randomItem([...shapes.keys()]);
      this.size = Math.round(random(settings.minSize, settings.maxSize));
      this.color = randomItem(settings.palette);
      this.opacity = random(0.2, 0.52);
      this.x = random(0, width);
      this.y = random(0, height);
      this.vx = random(-13, 13);
      this.vy = random(-12, 12);
      this.targetVx = random(-13, 13);
      this.targetVy = random(-12, 12);
      this.rotation = random(0, Math.PI * 2);
      this.rotationSpeed = random(-0.28, 0.28);
      this.floatPhase = random(0, Math.PI * 2);
      this.floatSpeed = random(0.45, 0.95);
      this.floatAmp = random(1.2, 4.2);
      this.depth = random(0.2, 1);
      this.sprite = getSprite(this.shapeName, this.size, this.color);
    }

    update(deltaTime, currentTime) {
      this.vx += (this.targetVx - this.vx) * 0.018;
      this.vy += (this.targetVy - this.vy) * 0.018;

      if (Math.random() < 0.005) {
        this.targetVx = random(-13, 13);
        this.targetVy = random(-12, 12);
      }

      this.x += this.vx * deltaTime + Math.sin(currentTime * this.floatSpeed + this.floatPhase) * this.floatAmp * deltaTime * 7;
      this.y += this.vy * deltaTime + Math.cos(currentTime * this.floatSpeed + this.floatPhase) * this.floatAmp * deltaTime * 6;
      this.rotation += this.rotationSpeed * deltaTime;

      const radius = this.size * 0.55;
      if (this.x < radius) {
        this.x = radius;
        this.targetVx = Math.abs(this.targetVx);
      } else if (this.x > width - radius) {
        this.x = width - radius;
        this.targetVx = -Math.abs(this.targetVx);
      }

      if (this.y < radius) {
        this.y = radius;
        this.targetVy = Math.abs(this.targetVy);
      } else if (this.y > height - radius) {
        this.y = height - radius;
        this.targetVy = -Math.abs(this.targetVy);
      }
    }

    draw() {
      const drawX = this.x + parallax.x * settings.parallaxStrength * this.depth;
      const drawY = this.y + parallax.y * settings.parallaxStrength * this.depth;

      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(drawX, drawY);
      ctx.rotate(this.rotation);
      ctx.drawImage(this.sprite, -this.sprite.width / 2, -this.sprite.height / 2);
      ctx.restore();
    }
  }

  const updateBokeh = () => {
    bokehCircles.length = 0;
    for (let index = 0; index < settings.bokehCount; index += 1) {
      bokehCircles.push({
        x: random(0, width),
        y: random(0, height),
        radius: random(88, 190),
        opacity: random(0.07, 0.18),
        color: randomItem(settings.bokehPalette),
        depth: random(0.1, 0.55),
      });
    }
  };

  const drawBackground = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = settings.baseColor;
    ctx.fillRect(0, 0, width, height);

    bokehCircles.forEach((circle) => {
      const x = circle.x + parallax.x * circle.depth * 8;
      const y = circle.y + parallax.y * circle.depth * 8;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, circle.radius);
      gradient.addColorStop(0, hexToRgba(circle.color, circle.opacity));
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, circle.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const renderStatic = () => {
    drawBackground();
    particles.forEach((particle) => particle.draw());
  };

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const targetCount = Math.max(
      settings.minCount,
      Math.min(settings.maxCount, Math.round((width * height) / settings.particleArea)),
    );

    while (particles.length < targetCount) particles.push(new Particle());
    if (particles.length > targetCount) particles.length = targetCount;

    updateBokeh();
    renderStatic();
  };

  const animate = (time) => {
    const currentTime = time * 0.001;
    const deltaTime = Math.min((time - (lastFrameTime || time)) / 1000, 0.033);
    lastFrameTime = time;

    parallax.x += (parallaxTarget.x - parallax.x) * 0.045;
    parallax.y += (parallaxTarget.y - parallax.y) * 0.045;

    drawBackground();
    particles.forEach((particle) => {
      particle.update(deltaTime, currentTime);
      particle.draw();
    });

    rafId = requestAnimationFrame(animate);
  };

  const handlePointerMove = (event) => {
    parallaxTarget.x = event.clientX / width - 0.5;
    parallaxTarget.y = event.clientY / height - 0.5;
  };

  const handlePointerLeave = () => {
    parallaxTarget.x = 0;
    parallaxTarget.y = 0;
  };

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  window.addEventListener('pointerleave', handlePointerLeave);

  resize();

  if (!prefersReducedMotion) {
    rafId = requestAnimationFrame(animate);
  }

  motionQuery.addEventListener('change', () => {
    if (rafId) cancelAnimationFrame(rafId);
    window.location.reload();
  });
}

function initLandingIntro() {
  if (!window.gsap || !document.querySelector('.hero__title')) return;
  if (motionQuery.matches) return;

  const timeline = gsap.timeline({
    defaults: {
      duration: 0.85,
      ease: 'power2.out',
      opacity: 0,
      y: 30,
    },
  });

  // Landing animation timing controls.
  timeline.from('.hero__title', {});
  timeline.from('.hero__subtitle', {}, '<0.2');
  timeline.from('.copy-line', { stagger: 0.18 }, '<0.15');
  timeline.from('.photo-card', {}, '<0.2');
  timeline.from('.hero-actions a', { stagger: 0.1 }, '<0.15');
}

function initLenis() {
  if (motionQuery.matches || !window.Lenis || window.__lenis) return;

  // Smooth-scroll feel controls.
  const lenis = new Lenis({
    duration: 1.8,
    easing: (time) => 1 - Math.pow(1 - time, 3),
    smooth: true,
    direction: 'vertical',
    gestureOrientation: 'vertical',
    wheelMultiplier: 1.05,
    smoothTouch: true,
  });

  window.__lenis = lenis;

  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };

  requestAnimationFrame(raf);
}

function initHeartGiftTap() {
  const heartLink = document.querySelector('.i-heart-link');
  if (!heartLink) return;

  // Secret gift trigger: 7 taps in 2 seconds.
  const requiredTaps = 7;
  const windowMs = 2000;
  const targetHref = heartLink.getAttribute('href') || 'coupons.html';
  let taps = [];

  heartLink.addEventListener('click', (event) => {
    event.preventDefault();
    const now = performance.now();
    taps = taps.filter((time) => now - time <= windowMs);
    taps.push(now);

    if (taps.length >= requiredTaps) {
      window.location.href = targetHref;
      return;
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  initAnimatedBackground();
  initLandingIntro();
  initLenis();
  initHeartGiftTap();
});
