import { Injectable } from '@angular/core';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
  opacity: number;
  shape: 'circle' | 'square' | 'triangle' | 'star' | 'heart';
  wobble: number;
  wobbleSpeed: number;
  trail: { x: number; y: number; opacity: number }[];
}

@Injectable({
  providedIn: 'root',
})
export class ConfettiService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animationId: number | null = null;

  constructor() {}

  createConfetti(duration: number = 4000, options?: {
    particleCount?: number;
    spreadAngle?: number;
    startVelocity?: number;
    colors?: string[];
    shapes?: Array<'circle' | 'square' | 'triangle' | 'star' | 'heart'>;
    gravity?: number;
    explosionOrigin?: { x: number; y: number };
  }) {
    const defaults = {
      particleCount: 200,
      spreadAngle: 360,
      startVelocity: 25,
      colors: ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#feca57', '#ff6b6b', '#a29bfe', '#fd79a8'],
      shapes: ['circle', 'square', 'triangle', 'star', 'heart'] as Array<'circle' | 'square' | 'triangle' | 'star' | 'heart'>,
      gravity: 0.3,
      explosionOrigin: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    };

    const config = { ...defaults, ...options };

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '9999';

    document.body.appendChild(this.canvas);

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext('2d');

    if (!this.ctx) return;

    // Create particles with explosion effect
    for (let i = 0; i < config.particleCount; i++) {
      const angle = (Math.random() * config.spreadAngle - config.spreadAngle / 2) * (Math.PI / 180);
      const velocity = Math.random() * config.startVelocity + 10;
      const size = Math.random() * 12 + 6;

      this.particles.push({
        x: config.explosionOrigin.x,
        y: config.explosionOrigin.y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - Math.random() * 5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        size: size,
        opacity: 1,
        shape: config.shapes[Math.floor(Math.random() * config.shapes.length)],
        wobble: 0,
        wobbleSpeed: Math.random() * 0.1 + 0.05,
        trail: []
      });
    }

    this.animate(config.gravity);

    setTimeout(() => {
      this.cleanup();
    }, duration);
  }

  private animate(gravity: number) {
    if (!this.ctx || !this.canvas) return;

    // Semi-transparent background for trail effect
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((particle, index) => {
      if (!this.ctx) return;

      // Add current position to trail
      particle.trail.push({
        x: particle.x,
        y: particle.y,
        opacity: particle.opacity * 0.5
      });

      // Keep trail length limited
      if (particle.trail.length > 8) {
        particle.trail.shift();
      }

      // Draw trail
      particle.trail.forEach((point, i) => {
        if (!this.ctx) return;
        const trailOpacity = point.opacity * (i / particle.trail.length);
        this.ctx.save();
        this.ctx.globalAlpha = trailOpacity;
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, particle.size * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      });

      // Update position with wobble
      particle.wobble += particle.wobbleSpeed;
      particle.x += particle.vx + Math.sin(particle.wobble) * 2;
      particle.y += particle.vy;
      particle.rotation += particle.rotationSpeed;
      particle.vy += gravity;
      particle.vx *= 0.99; // Air resistance
      particle.opacity -= 0.008;

      // Draw particle with glow effect
      this.ctx.save();
      this.ctx.translate(particle.x, particle.y);
      this.ctx.rotate((particle.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = particle.opacity;

      // Outer glow
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = particle.color;

      // Draw shape
      this.drawShape(particle);

      this.ctx.restore();

      // Remove particle if off screen or transparent
      if (particle.y > this.canvas!.height + 100 || particle.opacity <= 0) {
        this.particles.splice(index, 1);
      }
    });

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate(gravity));
    } else {
      this.cleanup();
    }
  }

  private drawShape(particle: Particle) {
    if (!this.ctx) return;

    this.ctx.fillStyle = particle.color;
    const s = particle.size;

    switch (particle.shape) {
      case 'circle':
        this.ctx.beginPath();
        this.ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
        this.ctx.fill();
        break;

      case 'square':
        this.ctx.fillRect(-s / 2, -s / 2, s, s);
        break;

      case 'triangle':
        this.ctx.beginPath();
        this.ctx.moveTo(0, -s / 2);
        this.ctx.lineTo(s / 2, s / 2);
        this.ctx.lineTo(-s / 2, s / 2);
        this.ctx.closePath();
        this.ctx.fill();
        break;

      case 'star':
        this.drawStar(0, 0, 5, s / 2, s / 4);
        break;

      case 'heart':
        this.drawHeart(0, 0, s / 2);
        break;
    }
  }

  private drawStar(cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
    if (!this.ctx) return;

    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      this.ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      this.ctx.lineTo(x, y);
      rot += step;
    }

    this.ctx.lineTo(cx, cy - outerRadius);
    this.ctx.closePath();
    this.ctx.fill();
  }

  private drawHeart(cx: number, cy: number, size: number) {
    if (!this.ctx) return;

    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy + size / 4);
    this.ctx.bezierCurveTo(cx, cy, cx - size / 2, cy - size / 2, cx - size / 2, cy);
    this.ctx.bezierCurveTo(cx - size / 2, cy + size / 3, cx, cy + size / 2, cx, cy + size);
    this.ctx.bezierCurveTo(cx, cy + size / 2, cx + size / 2, cy + size / 3, cx + size / 2, cy);
    this.ctx.bezierCurveTo(cx + size / 2, cy - size / 2, cx, cy, cx, cy + size / 4);
    this.ctx.fill();
  }

  // Preset effects
  fireworks(x?: number, y?: number) {
    this.createConfetti(4000, {
      particleCount: 250,
      spreadAngle: 360,
      startVelocity: 30,
      explosionOrigin: {
        x: x || window.innerWidth / 2,
        y: y || window.innerHeight / 3
      }
    });
  }

  celebration() {
    // Multiple bursts from bottom
    const positions = [0.2, 0.5, 0.8];
    positions.forEach((pos, i) => {
      setTimeout(() => {
        this.createConfetti(4000, {
          particleCount: 150,
          spreadAngle: 120,
          startVelocity: 35,
          explosionOrigin: {
            x: window.innerWidth * pos,
            y: window.innerHeight
          }
        });
      }, i * 200);
    });
  }

  private cleanup() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    this.canvas = null;
    this.ctx = null;
    this.particles = [];
  }
}