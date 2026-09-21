import React, { useEffect, useRef } from 'react';
import { WeatherCondition } from '../types';

interface WeatherOverlayProps {
  weatherCondition?: WeatherCondition;
  compact?: boolean;
}

export const WEATHER_CONFIGS: Record<
  WeatherCondition,
  {
    name: string;
    icon: string;
    tempStr: string;
    description: string;
    effectNote: string;
    skyBg: string;
    badgeBg: string;
  }
> = {
  SUNNY: {
    name: 'Sunny',
    icon: '☀️',
    tempStr: '29°C',
    description: 'Bright Daylight & Blue Sky',
    effectNote: 'Standard Pitch & Normal Ball Trajectory',
    skyBg: 'from-sky-400/20 via-amber-500/5 to-transparent',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  OVERCAST: {
    name: 'Overcast',
    icon: '⛅',
    tempStr: '19°C',
    description: 'Heavy Cloud Cover & Cool Breeze',
    effectNote: 'High Seam Movement (+45% Swing Drift)',
    skyBg: 'from-slate-700/40 via-slate-800/20 to-transparent',
    badgeBg: 'bg-slate-700/40 text-slate-200 border-slate-500/50',
  },
  RAIN: {
    name: 'Light Drizzle',
    icon: '🌧️',
    tempStr: '16°C',
    description: 'Damp Pitch & Falling Rain',
    effectNote: 'Slick Surface • Ball Skids Through Faster',
    skyBg: 'from-cyan-950/50 via-slate-900/40 to-transparent',
    badgeBg: 'bg-cyan-900/40 text-cyan-200 border-cyan-500/40',
  },
  NIGHT: {
    name: 'Night Match',
    icon: '🌙',
    tempStr: '22°C',
    description: 'Under Stadium Floodlights',
    effectNote: 'Crisp Ball Contrast & High-Power Lights',
    skyBg: 'from-indigo-950/60 via-slate-950/40 to-transparent',
    badgeBg: 'bg-indigo-950/50 text-indigo-300 border-indigo-500/40',
  },
};

const WeatherOverlayComponent: React.FC<WeatherOverlayProps> = ({
  weatherCondition = 'SUNNY',
  compact = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const config = WEATHER_CONFIGS[weatherCondition] || WEATHER_CONFIGS.SUNNY;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 520);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle state initialization
    interface Particle {
      x: number;
      y: number;
      length: number;
      speedY: number;
      speedX: number;
      opacity: number;
      size: number;
      phase: number;
    }

    const particles: Particle[] = [];
    const count = weatherCondition === 'RAIN' ? 120 : weatherCondition === 'OVERCAST' ? 35 : 25;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: weatherCondition === 'RAIN' ? 12 + Math.random() * 16 : 2 + Math.random() * 4,
        speedY:
          weatherCondition === 'RAIN'
            ? 8 + Math.random() * 10
            : weatherCondition === 'OVERCAST'
            ? 0.2 + Math.random() * 0.4
            : 0.1 + Math.random() * 0.3,
        speedX:
          weatherCondition === 'RAIN'
            ? -1.5 - Math.random() * 2
            : weatherCondition === 'OVERCAST'
            ? 0.4 + Math.random() * 0.5
            : (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.6 + 0.2,
        size: Math.random() * 2 + 1,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let frame = 0;

    let lastTime = performance.now();

    const render = (now: number = performance.now()) => {
      const delta = now - lastTime;
      const minDelta = weatherCondition === 'RAIN' ? 16 : 33; // 60 FPS for rain, 30 FPS for ambient dust
      if (delta < minDelta) {
        animationFrameRef.current = requestAnimationFrame((t) => render(t));
        return;
      }
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // 1. RAIN ANIMATION
      if (weatherCondition === 'RAIN') {
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.55)';
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';

        for (const p of particles) {
          p.y += p.speedY;
          p.x += p.speedX;

          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * (width + 100);
          }
          if (p.x < -50) {
            p.x = width + 50;
          }

          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 2, p.y + p.length);
          ctx.stroke();

          // Subtle pitch splash ripple
          if (p.y > height * 0.75 && Math.random() < 0.08) {
            ctx.strokeStyle = 'rgba(224, 242, 254, 0.3)';
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, 4, 1.5, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }

      // 2. OVERCAST CLOUD MIST
      else if (weatherCondition === 'OVERCAST') {
        for (const p of particles) {
          p.x += p.speedX;
          p.phase += 0.01;
          if (p.x > width + 60) p.x = -60;

          const yOff = Math.sin(p.phase) * 10;
          const rad = 45 + Math.sin(p.phase * 0.5) * 20;

          const grad = ctx.createRadialGradient(p.x, p.y + yOff, 0, p.x, p.y + yOff, rad);
          grad.addColorStop(0, 'rgba(148, 163, 184, 0.08)');
          grad.addColorStop(1, 'rgba(148, 163, 184, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y + yOff, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. SUNNY DUST MOTES & LENS FLARE
      else if (weatherCondition === 'SUNNY') {
        for (const p of particles) {
          p.y -= p.speedY;
          p.x += p.speedX;
          p.phase += 0.02;

          if (p.y < -10) p.y = height + 10;

          const currentOpacity = (Math.sin(p.phase) * 0.3 + 0.5) * p.opacity;
          ctx.fillStyle = `rgba(253, 224, 71, ${currentOpacity * 0.4})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // Lens flare ray glow top right
        const sunGrad = ctx.createRadialGradient(width * 0.85, 20, 0, width * 0.85, 20, 180);
        sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.15)');
        sunGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.05)');
        sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = sunGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // 4. NIGHT FLOODLIGHT BEAMS & ATMOSPHERE
      else if (weatherCondition === 'NIGHT') {
        // Floodlight beam cones radiating down from top corners
        const beams = [
          { x: width * 0.1, angle: Math.PI * 0.35 },
          { x: width * 0.9, angle: Math.PI * 0.65 },
        ];

        for (const b of beams) {
          const grad = ctx.createLinearGradient(b.x, 0, b.x + Math.cos(b.angle) * 300, height);
          grad.addColorStop(0, 'rgba(224, 231, 255, 0.12)');
          grad.addColorStop(0.7, 'rgba(199, 210, 254, 0.03)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(b.x - 30, 0);
          ctx.lineTo(b.x + 30, 0);
          ctx.lineTo(b.x + Math.cos(b.angle) * 400 + 120, height);
          ctx.lineTo(b.x + Math.cos(b.angle) * 400 - 120, height);
          ctx.closePath();
          ctx.fill();
        }

        // Glowing light motes in stadium air
        for (const p of particles) {
          p.y -= p.speedY;
          p.phase += 0.03;
          if (p.y < -10) p.y = height + 10;

          const op = (Math.sin(p.phase) * 0.3 + 0.6) * 0.3;
          ctx.fillStyle = `rgba(199, 210, 254, ${op})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameRef.current = requestAnimationFrame((t) => render(t));
    };

    render(performance.now());

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [weatherCondition]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {/* Canvas Layer for Weather Particles */}
      <canvas ref={canvasRef} className="w-full h-full block opacity-90" />

      {/* Top Sky Weather Gradient Tint */}
      <div className={`absolute top-0 left-0 right-0 h-28 bg-gradient-to-b ${config.skyBg} transition-colors duration-500`} />

      {/* Weather HUD Badge (non-compact mode) */}
      {!compact && (
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/85 border border-slate-700/80 shadow-lg text-xs transition-all duration-300">
          <span className="text-sm">{config.icon}</span>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-amber-300 uppercase tracking-wide text-[11px] font-['Teko',sans-serif]">
                {config.name}
              </span>
              <span className="text-[10px] text-slate-300 font-bold">{config.tempStr}</span>
            </div>
            <span className="text-[9px] text-slate-400 font-medium leading-tight">
              {config.effectNote}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export const WeatherOverlay = React.memo(WeatherOverlayComponent);
