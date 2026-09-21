import confetti from 'canvas-confetti';
import React, { useEffect, useRef } from 'react';
import { BattingStance, ShotDirection, ShotOutcome } from '../types';
import { soundFx, CrowdAudioEventType } from '../utils/audio';

interface DynamicCrowdBackgroundProps {
  isSixHit?: boolean;
  isFourHit?: boolean;
  isWicket?: boolean;
  sixDirection?: ShotDirection;
  lastOutcome?: ShotOutcome | null;
  isBallInFlight?: boolean;
  isRunUpActive?: boolean;
  battingStance?: BattingStance;
  teamName?: string;
  opponentName?: string;
  matchContext?: string;
}

interface FanData {
  id: number;
  x: number;
  baseY: number;
  tier: 1 | 2 | 3;
  type: 'cheer' | 'arms' | 'flag' | 'sign' | 'clap' | 'bob' | 'disbelief';
  flagColor: string;
  jerseyColor: string;
  phase: number;
  speed: number;
}

interface SonicPulseRing {
  id: number;
  x: number;
  y: number;
  startTime: number;
  duration: number;
  maxRadius: number;
  color: string;
  type: 'CHEER' | 'GROAN' | 'ANTICIPATION';
}

// Particle Definitions for High-Energy Stadium Background Atmosphere
interface StadiumSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  drag: number;
  alpha: number;
  decay: number;
  size: number;
  color: string;
  sparkle: boolean;
  type: 'pyro_fountain' | 'starburst' | 'boundary_flare' | 'sparkler';
}

interface StadiumConfetti {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotX: number;
  rotZ: number;
  vRotX: number;
  vRotZ: number;
  size: number;
  color: string;
  isRibbon: boolean;
  swayPhase: number;
}

interface StadiumSmoke {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxRadius: number;
  growthRate: number;
  alpha: number;
  decay: number;
  color: string;
  rotation: number;
  vRot: number;
}

interface StadiumEmber {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  thermalPhase: number;
}

interface StadiumShockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  alpha: number;
  color: string;
  lineWidth: number;
}

interface StadiumLightFlash {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  decay: number;
  color: string;
}

// Pre-compute deterministic crowd layout across 4 packed grandstand tiers (y = 8 to 72)
const FLAG_COLORS = ['#fbbf24', '#38bdf8', '#ef4444', '#10b981', '#f43f5e', '#a855f7', '#ffffff'];
const JERSEY_COLORS = ['#0f172a', '#1e293b', '#1e3a8a', '#14532d', '#701a75', '#312e81', '#0369a1', '#b45309', '#047857'];
const CROWD_FANS: FanData[] = [];
let fanId = 0;

// Tier 0: Top Skydeck Terrace (Dense Upper Audience)
for (let x = 12; x < 788; x += 18) {
  const types: FanData['type'][] = ['bob', 'cheer', 'arms', 'clap'];
  CROWD_FANS.push({
    id: fanId++,
    x,
    baseY: 12 + Math.sin(x * 0.015) * 1.8,
    tier: 1,
    type: types[fanId % types.length],
    flagColor: FLAG_COLORS[fanId % FLAG_COLORS.length],
    jerseyColor: JERSEY_COLORS[fanId % JERSEY_COLORS.length],
    phase: (fanId * 0.28) % (Math.PI * 2),
    speed: 2.0 + (fanId % 3) * 0.35,
  });
}

// Tier 1: Upper Terrace (Dense Packed Audience)
for (let x = 10; x < 790; x += 15) {
  const types: FanData['type'][] = ['bob', 'arms', 'cheer', 'clap', 'disbelief', 'flag'];
  CROWD_FANS.push({
    id: fanId++,
    x,
    baseY: 24 + Math.sin(x * 0.014) * 2.0,
    tier: 1,
    type: types[fanId % types.length],
    flagColor: FLAG_COLORS[fanId % FLAG_COLORS.length],
    jerseyColor: JERSEY_COLORS[fanId % JERSEY_COLORS.length],
    phase: (fanId * 0.32) % (Math.PI * 2),
    speed: 2.2 + (fanId % 3) * 0.4,
  });
}

// Tier 2: Middle Grandstand Terrace (Dense Audience with Signs & Flags)
for (let x = 12; x < 788; x += 16) {
  let type: FanData['type'] = 'cheer';
  if (fanId % 6 === 0) type = 'flag';
  else if (fanId % 5 === 0) type = 'sign';
  else if (fanId % 4 === 0) type = 'arms';
  else if (fanId % 3 === 0) type = 'disbelief';
  else if (fanId % 2 === 0) type = 'clap';
  else type = 'bob';

  CROWD_FANS.push({
    id: fanId++,
    x,
    baseY: 42 + Math.sin(x * 0.012) * 2.5,
    tier: 2,
    type,
    flagColor: FLAG_COLORS[fanId % FLAG_COLORS.length],
    jerseyColor: JERSEY_COLORS[fanId % JERSEY_COLORS.length],
    phase: (fanId * 0.4) % (Math.PI * 2),
    speed: 2.5 + (fanId % 4) * 0.3,
  });
}

// Tier 3: Lower Grandstand Railing (Front-Row Cheering Crowd)
for (let x = 14; x < 786; x += 18) {
  let type: FanData['type'] = 'arms';
  if (fanId % 4 === 0) type = 'flag';
  else if (fanId % 5 === 0) type = 'sign';
  else if (fanId % 3 === 0) type = 'disbelief';
  else if (fanId % 2 === 0) type = 'cheer';

  CROWD_FANS.push({
    id: fanId++,
    x,
    baseY: 62 + Math.sin(x * 0.008) * 2,
    tier: 3,
    type,
    flagColor: FLAG_COLORS[fanId % FLAG_COLORS.length],
    jerseyColor: JERSEY_COLORS[fanId % JERSEY_COLORS.length],
    phase: (fanId * 0.5) % (Math.PI * 2),
    speed: 2.0 + (fanId % 3) * 0.5,
  });
}

// Ambient Stadium Flashbulbs in the stands
const FLASH_BULBS = Array.from({ length: 24 }).map((_, i) => ({
  x: 25 + ((i * 37) % 750),
  y: 12 + ((i * 19) % 48),
  freq: 1.8 + ((i * 7) % 5) * 0.4,
  phase: (i * 1.3) % (Math.PI * 2),
}));

// Colors for Celebrations
const SIX_COLORS = ['#fbbf24', '#f59e0b', '#ec4899', '#38bdf8', '#ffffff', '#a855f7'];
const FOUR_COLORS = ['#fbbf24', '#f59e0b', '#34d399', '#38bdf8', '#fef08a', '#ffffff'];
const WICKET_COLORS = ['#ef4444', '#dc2626', '#b91c1c', '#7f1d1d', '#1e293b', '#64748b'];

const DynamicCrowdBackgroundComponent: React.FC<DynamicCrowdBackgroundProps> = ({
  isSixHit = false,
  isFourHit = false,
  isWicket = false,
  sixDirection = 'STRAIGHT',
  lastOutcome = null,
  isBallInFlight = false,
  isRunUpActive = false,
  battingStance = 'RIGHT',
  teamName = 'INDIA',
  opponentName = 'AUSTRALIA',
  matchContext = 'CRICKET FRENZY T20',
}) => {
  const crowdCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync prop refs for animation loops
  const isSixHitRef = useRef(isSixHit);
  const isFourHitRef = useRef(isFourHit);
  const isWicketRef = useRef(isWicket);
  const sixDirectionRef = useRef(sixDirection);
  const lastOutcomeRef = useRef(lastOutcome);
  const isBallInFlightRef = useRef(isBallInFlight);
  const isRunUpActiveRef = useRef(isRunUpActive);
  const teamNameRef = useRef(teamName);
  const opponentNameRef = useRef(opponentName);
  const matchContextRef = useRef(matchContext);

  // Trigger state tracking
  const wasSixActiveRef = useRef(false);
  const wasFourActiveRef = useRef(false);
  const wasWicketActiveRef = useRef(false);
  const hasFiredConfettiRef = useRef(false);

  // Particle Collections (Hardware accelerated 2D canvas buffer)
  const sparksRef = useRef<StadiumSpark[]>([]);
  const confettiRef = useRef<StadiumConfetti[]>([]);
  const smokeRef = useRef<StadiumSmoke[]>([]);
  const embersRef = useRef<StadiumEmber[]>([]);
  const shockwavesRef = useRef<StadiumShockwave[]>([]);
  const lightFlashesRef = useRef<StadiumLightFlash[]>([]);

  // Sound event reactive state
  const crowdMoodRef = useRef<{
    event: 'CHEER_HUGE' | 'CHEER' | 'GROAN' | 'IDLE';
    startTime: number;
    intensity: number;
  }>({
    event: 'IDLE',
    startTime: 0,
    intensity: 0,
  });

  const sonicPulsesRef = useRef<SonicPulseRing[]>([]);
  const pulseIdCounter = useRef(0);

  // Keep state refs updated
  useEffect(() => {
    isSixHitRef.current = isSixHit;
    isFourHitRef.current = isFourHit;
    isWicketRef.current = isWicket;
    sixDirectionRef.current = sixDirection;
    lastOutcomeRef.current = lastOutcome;
    isBallInFlightRef.current = isBallInFlight;
    isRunUpActiveRef.current = isRunUpActive;
    teamNameRef.current = teamName;
    opponentNameRef.current = opponentName;
    matchContextRef.current = matchContext;
  }, [isSixHit, isFourHit, isWicket, sixDirection, lastOutcome, isBallInFlight, isRunUpActive, teamName, opponentName, matchContext]);

  // Audio Engine event listener for sonic shockwaves
  useEffect(() => {
    const unsubscribe = soundFx.onCrowdAudioEvent((audioEvent: CrowdAudioEventType) => {
      const now = performance.now();
      const isHuge = audioEvent === 'CHEER_HUGE';

      crowdMoodRef.current = {
        event: audioEvent === 'GROAN' ? 'GROAN' : isHuge ? 'CHEER_HUGE' : 'CHEER',
        startTime: now,
        intensity: isHuge ? 1.0 : audioEvent === 'GROAN' ? 0.9 : 0.75,
      };

      const originX =
        sixDirectionRef.current === 'OFF_SIDE'
          ? 220 + (Math.random() - 0.5) * 60
          : sixDirectionRef.current === 'ON_SIDE'
          ? 580 + (Math.random() - 0.5) * 60
          : 400 + (Math.random() - 0.5) * 80;

      const originY = 42 + Math.random() * 18;

      if (audioEvent === 'CHEER_HUGE' || audioEvent === 'CHEER') {
        sonicPulsesRef.current.push({
          id: pulseIdCounter.current++,
          x: originX,
          y: originY,
          startTime: now,
          duration: isHuge ? 1200 : 850,
          maxRadius: isHuge ? 320 : 220,
          color: isHuge ? '#f59e0b' : '#38bdf8',
          type: 'CHEER',
        });

        if (isHuge) {
          setTimeout(() => {
            sonicPulsesRef.current.push({
              id: pulseIdCounter.current++,
              x: originX + (Math.random() - 0.5) * 50,
              y: originY - 10,
              startTime: performance.now(),
              duration: 950,
              maxRadius: 280,
              color: '#ec4899',
              type: 'CHEER',
            });
          }, 180);
        }
      } else if (audioEvent === 'GROAN') {
        sonicPulsesRef.current.push({
          id: pulseIdCounter.current++,
          x: 400,
          y: 48,
          startTime: now,
          duration: 900,
          maxRadius: 200,
          color: '#ef4444',
          type: 'GROAN',
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // External confetti burst fallback for MAXIMUM 6 (Optimized lightweight burst)
  useEffect(() => {
    if (isSixHit && !hasFiredConfettiRef.current) {
      hasFiredConfettiRef.current = true;
      const isRightHanded = battingStance !== 'LEFT';
      let originX = 0.5;
      if (sixDirection === 'OFF_SIDE') {
        originX = isRightHanded ? 0.72 : 0.28;
      } else if (sixDirection === 'ON_SIDE') {
        originX = isRightHanded ? 0.28 : 0.72;
      }

      try {
        confetti({
          particleCount: 28,
          spread: 65,
          startVelocity: 28,
          origin: { x: originX, y: 0.16 },
          colors: ['#fbbf24', '#ec4899', '#38bdf8', '#10b981', '#ffffff'],
          ticks: 80,
          gravity: 0.9,
          scalar: 0.8,
          disableForReducedMotion: true,
        });
      } catch {}
    } else if (!isSixHit) {
      hasFiredConfettiRef.current = false;
    }
  }, [isSixHit, sixDirection]);

  // =========================================================================
  // PARTICLE SPAWN EMITTERS (High-performance, lightweight allocations)
  // =========================================================================

  // 1. BIG SHOTS: MAXIMUM 6 PARTICLE CELEBRATION
  const spawnSixParticles = () => {
    const sparks = sparksRef.current;
    const confettiList = confettiRef.current;
    const shockwaves = shockwavesRef.current;
    const flashes = lightFlashesRef.current;

    // A. Floodlight Tower Flashes (x: 45, y: 14 and x: 755, y: 14)
    flashes.push({
      x: 45,
      y: 14,
      radius: 50,
      alpha: 0.8,
      decay: 0.04,
      color: '#ffffff',
    });
    flashes.push({
      x: 755,
      y: 14,
      radius: 50,
      alpha: 0.8,
      decay: 0.04,
      color: '#ffffff',
    });

    // B. Grandstand Roof Pyrotechnic Mortars (4 launch stations along upper cantilever roof)
    const mortarPositions = [140, 310, 490, 660];
    mortarPositions.forEach((mx, mIdx) => {
      const spreadX = (mIdx - 1.5) * 0.5;
      for (let i = 0; i < 7; i++) {
        const speed = 6.0 + Math.random() * 4.0;
        const angle = -Math.PI * 0.5 + spreadX * 0.3 + (Math.random() - 0.5) * 0.5;
        sparks.push({
          x: mx,
          y: 16,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          gravity: 0.16,
          drag: 0.98,
          alpha: 1.0,
          decay: 0.02 + Math.random() * 0.015,
          size: 2.2 + Math.random() * 1.8,
          color: SIX_COLORS[(mIdx * 3 + i) % SIX_COLORS.length],
          sparkle: false,
          type: 'pyro_fountain',
        });
      }
    });

    // C. Aerial Starburst Firework in the Night Sky
    const burstX = 400 + (Math.random() - 0.5) * 80;
    const burstY = 20;

    shockwaves.push({
      x: burstX,
      y: burstY,
      radius: 8,
      maxRadius: 120,
      speed: 6.0,
      alpha: 0.75,
      color: '#fbbf24',
      lineWidth: 2.0,
    });

    for (let s = 0; s < 16; s++) {
      const theta = (s / 16) * Math.PI * 2;
      const burstSpd = 3.0 + Math.random() * 3.0;
      sparks.push({
        x: burstX,
        y: burstY,
        vx: Math.cos(theta) * burstSpd,
        vy: Math.sin(theta) * burstSpd,
        gravity: 0.08,
        drag: 0.97,
        alpha: 1.0,
        decay: 0.022 + Math.random() * 0.01,
        size: 2.2 + Math.random() * 1.5,
        color: SIX_COLORS[s % SIX_COLORS.length],
        sparkle: false,
        type: 'starburst',
      });
    }

    // D. Stadium Confetti Cannons (Lightweight flutter)
    for (let c = 0; c < 24; c++) {
      const startX = 100 + Math.random() * 600;
      confettiList.push({
        x: startX,
        y: 10 + Math.random() * 20,
        vx: (Math.random() - 0.5) * 2.4,
        vy: 1.2 + Math.random() * 2.0,
        rotX: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        vRotX: (Math.random() - 0.5) * 0.15,
        vRotZ: (Math.random() - 0.5) * 0.1,
        size: 3.0 + Math.random() * 3.5,
        color: SIX_COLORS[c % SIX_COLORS.length],
        isRibbon: c % 3 === 0,
        swayPhase: Math.random() * Math.PI * 2,
      });
    }
  };

  // 2. BIG SHOTS: CRACKING 4 BOUNDARY PARTICLE CELEBRATION
  const spawnFourParticles = () => {
    const sparks = sparksRef.current;
    const shockwaves = shockwavesRef.current;
    const flashes = lightFlashesRef.current;

    // A. Boundary Advertising Wall Ground Pyro Jets
    const flareStations = [200, 360, 440, 600];
    flareStations.forEach((fx, idx) => {
      flashes.push({
        x: fx,
        y: 78,
        radius: 30,
        alpha: 0.65,
        decay: 0.04,
        color: '#fbbf24',
      });

      const dirBias = idx < 2 ? -1 : 1;
      for (let i = 0; i < 6; i++) {
        const angle =
          dirBias < 0
            ? -Math.PI * 0.45 - Math.random() * 0.35
            : -Math.PI * 0.55 + Math.random() * 0.35;
        const spd = 4.5 + Math.random() * 3.0;
        sparks.push({
          x: fx,
          y: 78,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          gravity: 0.16,
          drag: 0.98,
          alpha: 1.0,
          decay: 0.022 + Math.random() * 0.015,
          size: 1.8 + Math.random() * 1.5,
          color: FOUR_COLORS[i % FOUR_COLORS.length],
          sparkle: false,
          type: 'boundary_flare',
        });
      }
    });

    // B. Boundary Laser Horizon Shockwave
    shockwaves.push({
      x: 400,
      y: 78,
      radius: 10,
      maxRadius: 220,
      speed: 6.5,
      alpha: 0.65,
      color: '#34d399',
      lineWidth: 1.8,
    });
  };

  // 3. WICKETS: DRAMATIC DISMISSAL SMOKE & EMBERS
  const spawnWicketParticles = () => {
    const smokeList = smokeRef.current;
    const shockwaves = shockwavesRef.current;
    const flashes = lightFlashesRef.current;

    // A. Roofline Red Alert Strobe Flash
    flashes.push({
      x: 400,
      y: 20,
      radius: 100,
      alpha: 0.75,
      decay: 0.03,
      color: '#ef4444',
    });

    // B. Dismissal Shockwave Ring from Stumps
    shockwaves.push({
      x: 400,
      y: 78,
      radius: 10,
      maxRadius: 180,
      speed: 5.5,
      alpha: 0.75,
      color: '#ef4444',
      lineWidth: 2.0,
    });

    // C. Billowing Smoke Plumes
    const smokeSources = [380, 400, 420];
    smokeSources.forEach((sx, idx) => {
      for (let s = 0; s < 3; s++) {
        const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * 0.7;
        const spd = 0.7 + Math.random() * 1.2;
        smokeList.push({
          x: sx + (Math.random() - 0.5) * 8,
          y: 78,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - 0.4,
          radius: 5 + Math.random() * 4,
          maxRadius: 20 + Math.random() * 12,
          growthRate: 0.35 + Math.random() * 0.25,
          alpha: 0.6 + Math.random() * 0.15,
          decay: 0.014 + Math.random() * 0.008,
          color: WICKET_COLORS[(idx * 2 + s) % WICKET_COLORS.length],
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.03,
        });
      }
    });
  };

  // Main Stadium Background & Crowd Render Loop (800 x 95 Canvas at z-0)
  useEffect(() => {
    const canvas = crowdCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const render = (now: number) => {
      const delta = now - lastTime;

      const isSix = isSixHitRef.current;
      const isFour = isFourHitRef.current;
      const isWkt = isWicketRef.current;
      const isApproaching = isBallInFlightRef.current || isRunUpActiveRef.current;

      const hasActiveParticles =
        sparksRef.current.length > 0 ||
        confettiRef.current.length > 0 ||
        smokeRef.current.length > 0 ||
        embersRef.current.length > 0 ||
        shockwavesRef.current.length > 0 ||
        lightFlashesRef.current.length > 0;

      const isGameplayMoving = isSix || isFour || isWkt || isApproaching || hasActiveParticles;

      // When the stadium is idle, drop frame rate to 5 FPS to reduce CPU/GPU load to near-zero.
      if (!isGameplayMoving) {
        if (delta < 200) {
          animId = requestAnimationFrame(render);
          return;
        }
      } else {
        // High-performance native refresh rate (up to 120 FPS) when active
        if (delta < 8) {
          animId = requestAnimationFrame(render);
          return;
        }
      }

      lastTime = now;
      const t = now * 0.001;

      // Event trigger tracking for single execution on state transitions
      if (isSix && !wasSixActiveRef.current) {
        spawnSixParticles();
      }
      wasSixActiveRef.current = isSix;

      if (isFour && !wasFourActiveRef.current) {
        spawnFourParticles();
      }
      wasFourActiveRef.current = isFour;

      if (isWkt && !wasWicketActiveRef.current) {
        spawnWicketParticles();
      }
      wasWicketActiveRef.current = isWkt;

      // 1. Live Crowd Sound-Reactive Scale & Opacity Modifiers
      const mood = crowdMoodRef.current;
      const timeSinceMood = now - mood.startTime;
      let cheerDecay = 0;
      let groanDecay = 0;

      if (mood.event === 'CHEER_HUGE' && timeSinceMood < 2400) {
        const p = timeSinceMood / 2400;
        cheerDecay = Math.sin(p * Math.PI) * mood.intensity;
      } else if (mood.event === 'CHEER' && timeSinceMood < 1600) {
        const p = timeSinceMood / 1600;
        cheerDecay = Math.sin(p * Math.PI) * mood.intensity;
      } else if (mood.event === 'GROAN' && timeSinceMood < 1400) {
        const p = timeSinceMood / 1400;
        groanDecay = Math.sin(p * Math.PI) * mood.intensity;
      }

      if (isSix) {
        cheerDecay = Math.max(cheerDecay, 0.95);
      } else if (isFour) {
        cheerDecay = Math.max(cheerDecay, 0.8);
      } else if (isWkt) {
        groanDecay = Math.max(groanDecay, 0.9);
      }

      // 2. CLEAR STADIUM CANVAS REGION (Top 95px)
      ctx.clearRect(0, 0, 800, 95);

      // 3. STADIUM NIGHT SKY & FLOODLIGHT ATMOSPHERE GRADIENT
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 85);
      if (isSix || cheerDecay > 0.3) {
        skyGrad.addColorStop(0, '#0a1024');
        skyGrad.addColorStop(0.65, '#122247');
        skyGrad.addColorStop(1, '#1e3a8a');
      } else if (isFour) {
        skyGrad.addColorStop(0, '#06131f');
        skyGrad.addColorStop(0.65, '#0c2438');
        skyGrad.addColorStop(1, '#114144');
      } else if (isWkt || groanDecay > 0.2) {
        skyGrad.addColorStop(0, '#15060b');
        skyGrad.addColorStop(0.65, '#240d16');
        skyGrad.addColorStop(1, '#33121f');
      } else {
        skyGrad.addColorStop(0, '#070c18');
        skyGrad.addColorStop(0.65, '#0e1a35');
        skyGrad.addColorStop(1, '#172d56');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 800, 85);

      // 4. STADIUM CANTILEVER ROOF TRUSSES
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      for (let x = 0; x <= 800; x += 40) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 10, 18);
      }
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      // Roofline Pyrotechnic Mortar Nozzles (Glowing during 6 hit)
      const mortarXs = [140, 310, 490, 660];
      for (const mx of mortarXs) {
        ctx.fillStyle = isSix ? '#fbbf24' : '#1e293b';
        ctx.fillRect(mx - 3, 13, 6, 5);
        if (isSix) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(mx, 14, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 5. JUMBOTRON STADIUM ELECTRONIC SCOREBOARD (Center)
      ctx.save();
      ctx.fillStyle = '#090d16';
      ctx.strokeStyle = isSix ? '#f59e0b' : isFour ? '#34d399' : isWkt ? '#ef4444' : '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(310, 3, 180, 18, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isSix
        ? '#fbbf24'
        : isFour
        ? '#34d399'
        : isWkt
        ? '#f87171'
        : cheerDecay > 0.2
        ? '#38bdf8'
        : '#94a3b8';
      ctx.font = 'bold 8.5px monospace';
      ctx.textAlign = 'center';

      let jumbotronText = 'TIMING CRICKET ARENA';
      if (isSix) jumbotronText = '★ ★ MAXIMUM 6 ★ ★';
      else if (isFour) jumbotronText = '⚡ ⚡ CRACKING 4 ⚡ ⚡';
      else if (isWkt) jumbotronText = '⚠ WICKET! OUT! ⚠';
      else if (cheerDecay > 0.2) jumbotronText = 'CRACKING SHOT!';

      ctx.fillText(jumbotronText, 400, 15);
      ctx.restore();

      // 6. GRANDSTAND CONCRETE TIERS
      // Tier 1 Base
      ctx.fillStyle = groanDecay > 0.2 ? '#0e0a16' : '#0a0f1d';
      ctx.beginPath();
      ctx.moveTo(0, 18);
      ctx.quadraticCurveTo(400, 12, 800, 18);
      ctx.lineTo(800, 82);
      ctx.lineTo(0, 82);
      ctx.closePath();
      ctx.fill();

      // Tier 2 Step
      ctx.fillStyle = groanDecay > 0.2 ? '#160d22' : '#0f172a';
      ctx.beginPath();
      ctx.moveTo(0, 38);
      ctx.quadraticCurveTo(400, 32, 800, 38);
      ctx.lineTo(800, 82);
      ctx.lineTo(0, 82);
      ctx.closePath();
      ctx.fill();

      // Tier 3 Step
      ctx.fillStyle = groanDecay > 0.2 ? '#241635' : '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, 58);
      ctx.quadraticCurveTo(400, 52, 800, 58);
      ctx.lineTo(800, 82);
      ctx.lineTo(0, 82);
      ctx.closePath();
      ctx.fill();

      // Tier Step Accent Lines
      ctx.strokeStyle = cheerDecay > 0.3 ? '#475569' : '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 38);
      ctx.quadraticCurveTo(400, 32, 800, 38);
      ctx.moveTo(0, 58);
      ctx.quadraticCurveTo(400, 52, 800, 58);
      ctx.stroke();

      // 7. DISTANT UPPER CROWD TEXTURE
      ctx.save();
      for (let bx = 10; bx < 790; bx += 10) {
        const pulseH = 3 + Math.sin(t * 4 + bx * 0.05) * 1.2 + cheerDecay * 2.5;
        const pillY = 16 + Math.sin(bx * 0.015) * 2;
        ctx.fillStyle = cheerDecay > 0.3 ? '#1e3a8a' : '#090d18';
        ctx.globalAlpha = 0.6 + Math.sin(t * 3 + bx) * 0.2 + cheerDecay * 0.3;
        ctx.beginPath();
        ctx.roundRect(bx - 2.5, pillY - pulseH, 5, pulseH + 4, 2);
        ctx.fill();
      }
      ctx.restore();

      // 7b. DYNAMIC STADIUM LED PERIMETER & CROWD BANNERS
      ctx.save();
      ctx.fillStyle = '#050b14';
      ctx.strokeStyle = isSix ? '#fbbf24' : isFour ? '#34d399' : isWkt ? '#ef4444' : '#1e3a8a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(40, 72, 720, 10, 2);
      ctx.fill();
      ctx.stroke();

      // Scrolling LED Banner Text
      ctx.fillStyle = isSix ? '#fef08a' : isFour ? '#a7f3d0' : isWkt ? '#fecaca' : '#93c5fd';
      ctx.font = 'bold 7.5px monospace';
      ctx.textAlign = 'left';
      
      const tTeam = teamNameRef.current || 'INDIA';
      const tOpp = opponentNameRef.current || 'AUSTRALIA';
      const tCtx = matchContextRef.current || 'CRICKET FRENZY';
      const bannerString = `   🔥  ${tTeam} vs ${tOpp}  ⭐  ${tCtx}  ⭐  COME ON ${tTeam}!  ⭐  CHASE FOR GLORY  ⭐  `;
      
      const scrollOffset = (t * 40) % 520;
      ctx.fillText(bannerString, 45 - scrollOffset, 79);
      ctx.fillText(bannerString, 45 - scrollOffset + 520, 79);
      ctx.restore();

      // 7c. GRANDSTAND HANGING STADIUM BANNERS & FLAGS
      const STADIUM_BANNERS = [
        { x: 90, y: 32, w: 72, h: 13, text: 'MAXIMUM 6', bg: '#dc2626', border: '#fef08a', textColor: '#ffffff' },
        { x: 210, y: 30, w: 84, h: 13, text: 'BLEED FOR GLORY', bg: '#1d4ed8', border: '#38bdf8', textColor: '#ffffff' },
        { x: 350, y: 28, w: 98, h: 14, text: '🔥 POWERPLAY ATTACK 🔥', bg: '#b45309', border: '#f59e0b', textColor: '#fef08a' },
        { x: 500, y: 30, w: 86, h: 13, text: 'UNSTOPPABLE RUNS', bg: '#047857', border: '#34d399', textColor: '#ffffff' },
        { x: 630, y: 32, w: 76, h: 13, text: 'CHAMPIONS ARENA', bg: '#7e22ce', border: '#e879f9', textColor: '#ffffff' },
      ];

      ctx.save();
      STADIUM_BANNERS.forEach((b) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.roundRect(b.x - b.w / 2 + 1, b.y + 1, b.w, b.h, 2);
        ctx.fill();

        // Banner cloth
        ctx.fillStyle = b.bg;
        ctx.strokeStyle = b.border;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(b.x - b.w / 2, b.y, b.w, b.h, 2);
        ctx.fill();
        ctx.stroke();

        // Banner text
        ctx.fillStyle = b.textColor;
        ctx.font = '900 6.5px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.text, b.x, b.y + b.h / 2);
      });
      ctx.restore();

      // 8. PULSING SONIC SHOCKWAVE RINGS
      if (sonicPulsesRef.current.length > 0) {
        for (let i = sonicPulsesRef.current.length - 1; i >= 0; i--) {
          const ring = sonicPulsesRef.current[i];
          const ringElapsed = now - ring.startTime;
          if (ringElapsed < 0) continue;

          const ringP = ringElapsed / ring.duration;
          if (ringP >= 1.0) {
            sonicPulsesRef.current.splice(i, 1);
            continue;
          }

          const currentR = 10 + ringP * ring.maxRadius;
          const ringAlpha = (1 - ringP) * (ring.type === 'CHEER' ? 0.75 : 0.5);

          ctx.save();
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, currentR, 0, Math.PI * 2);
          ctx.strokeStyle = ring.color;
          ctx.lineWidth = ring.type === 'CHEER' ? 2.5 * (1 - ringP) + 0.5 : 1.8 * (1 - ringP) + 0.4;
          ctx.globalAlpha = ringAlpha;
          ctx.stroke();
          ctx.restore();
        }
      }

      // 9. ANIMATED FANS IN GRANDSTAND TIERS
      for (let i = 0; i < CROWD_FANS.length; i++) {
        const fan = CROWD_FANS[i];

        let bobY = 0;
        let armWave = 0;
        let scaleYMod = 1.0;
        let scaleXMod = 1.0;
        let fanOpacity = 1.0;

        if (cheerDecay > 0.05) {
          bobY = -Math.abs(Math.sin(t * 11 + fan.phase + fan.x * 0.04)) * (3.5 + cheerDecay * 4.0);
          armWave = Math.sin(t * 13 + fan.phase) * (0.45 + cheerDecay * 0.35);
          scaleYMod = 1.0 + cheerDecay * 0.22;
          scaleXMod = 1.0 + cheerDecay * 0.08;
          fanOpacity = 0.95 + cheerDecay * 0.05;
        } else if (groanDecay > 0.05) {
          bobY = Math.abs(Math.sin(t * 3.5 + fan.phase)) * (1.8 + groanDecay * 2.5);
          scaleYMod = 1.0 - groanDecay * 0.16;
          scaleXMod = 1.0 + groanDecay * 0.05;
          fanOpacity = 0.85 - groanDecay * 0.25;
        } else if (isApproaching) {
          bobY = Math.sin(t * 4.5 + fan.phase) * 0.8;
          armWave = Math.sin(t * 2.5 + fan.phase) * 0.12;
          scaleYMod = 1.02;
          fanOpacity = 0.95;
        } else {
          bobY = Math.sin(t * fan.speed + fan.phase) * 1.2;
          armWave = Math.sin(t * 3.5 + fan.phase) * 0.18;
          scaleYMod = 1.0 + Math.sin(t * 2.0 + fan.phase) * 0.02;
          fanOpacity = 0.9;
        }

        const x = fan.x;
        const y = fan.baseY + bobY;
        const baseScale = fan.tier === 1 ? 0.65 : fan.tier === 2 ? 0.78 : 0.92;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(baseScale * scaleXMod, baseScale * scaleYMod);
        ctx.globalAlpha = Math.max(0.2, Math.min(1.0, fanOpacity));

        if (cheerDecay > 0.3 && fan.tier >= 2 && fan.id % 3 === 0) {
          ctx.fillStyle = fan.jerseyColor;
        } else {
          ctx.fillStyle = fan.tier === 1 ? '#060a12' : '#080d1a';
        }

        // Head
        ctx.beginPath();
        ctx.arc(0, -9, 2.8, 0, Math.PI * 2);
        ctx.fill();

        // Shoulders & Torso
        ctx.beginPath();
        ctx.moveTo(-3.5, -6.5);
        ctx.quadraticCurveTo(-3.5, 0, -2, 0);
        ctx.lineTo(2, 0);
        ctx.quadraticCurveTo(3.5, 0, 3.5, -6.5);
        ctx.quadraticCurveTo(0, -7.8, -3.5, -6.5);
        ctx.fill();

        // Postures
        if (groanDecay > 0.25 || (fan.type === 'disbelief' && groanDecay > 0.05)) {
          ctx.strokeStyle = ctx.fillStyle;
          ctx.lineWidth = 1.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-2.5, -5.5);
          ctx.lineTo(-3.8, -10.5);
          ctx.lineTo(-1.5, -11.5);
          ctx.moveTo(2.5, -5.5);
          ctx.lineTo(3.8, -10.5);
          ctx.lineTo(1.5, -11.5);
          ctx.stroke();
        } else if (fan.type === 'arms' || cheerDecay > 0.2) {
          ctx.strokeStyle = ctx.fillStyle;
          ctx.lineWidth = 1.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-3, -5);
          ctx.lineTo(-5.5 + Math.sin(armWave) * 1.5, -12);
          ctx.moveTo(3, -5);
          ctx.lineTo(5.5 - Math.sin(armWave) * 1.5, -12);
          ctx.stroke();
        } else if (fan.type === 'flag') {
          ctx.strokeStyle = ctx.fillStyle;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(2, -4);
          ctx.lineTo(5.5, -11);
          ctx.stroke();

          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(5.5, -11);
          ctx.lineTo(6.5, -18);
          ctx.stroke();

          const wave = Math.sin(t * 8 + fan.phase) * 2;
          ctx.fillStyle = fan.flagColor;
          ctx.beginPath();
          ctx.moveTo(6.5, -18);
          ctx.quadraticCurveTo(11 + wave, -17, 14 + wave * 1.2, -15);
          ctx.lineTo(6.5, -13);
          ctx.closePath();
          ctx.fill();
        } else if (fan.type === 'sign') {
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(-0.5, -5);
          ctx.lineTo(-0.5, -12);
          ctx.stroke();

          ctx.fillStyle = cheerDecay > 0.2 ? '#fbbf24' : '#f8fafc';
          ctx.fillRect(-6, -18, 11, 6);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 0.6;
          ctx.strokeRect(-6, -18, 11, 6);

          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 4.5px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(isFour ? '4' : '6', -0.5, -13.5);
        } else if (fan.type === 'clap') {
          const clapDist = Math.abs(Math.sin(t * 9 + fan.phase)) * 2;
          ctx.strokeStyle = ctx.fillStyle;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(-3, -5);
          ctx.lineTo(-0.8 - clapDist * 0.4, -9);
          ctx.moveTo(3, -5);
          ctx.lineTo(0.8 + clapDist * 0.4, -9);
          ctx.stroke();
        }

        ctx.restore();
      }

      // 10. RANDOM FLASHBULBS IN GRANDSTAND
      ctx.save();
      for (let i = 0; i < FLASH_BULBS.length; i++) {
        const bulb = FLASH_BULBS[i];
        const flashIntensity = Math.sin(t * bulb.freq * 2.5 + bulb.phase);
        if (flashIntensity > 0.94) {
          const p = (flashIntensity - 0.94) / 0.06;
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = p * 0.9;
          ctx.beginPath();
          ctx.arc(bulb.x, bulb.y, 1.2 + p * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  // =========================================================================
  // DEDICATED STADIUM PARTICLE OVERLAY RENDER LOOP (800 x 520 Canvas at z-20)
  // =========================================================================
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const renderParticles = (now: number) => {
      const delta = now - lastTime;

      const sparks = sparksRef.current;
      const confettiList = confettiRef.current;
      const smokeList = smokeRef.current;
      const embers = embersRef.current;
      const shockwaves = shockwavesRef.current;
      const flashes = lightFlashesRef.current;

      const hasActiveParticles =
        sparks.length > 0 ||
        confettiList.length > 0 ||
        smokeList.length > 0 ||
        embers.length > 0 ||
        shockwaves.length > 0 ||
        flashes.length > 0;

      if (!hasActiveParticles) {
        ctx.clearRect(0, 0, 800, 520);
        animId = requestAnimationFrame(renderParticles);
        return;
      }

      // Clear full 800 x 520 arena overlay
      ctx.clearRect(0, 0, 800, 520);

      lastTime = now;
      const dt = Math.min(delta / 1000, 0.05);

      // 1. RENDER SMOKE PUFFS (Voluminous expanding billowing clouds for Wickets)
      if (smokeList.length > 0) {
        ctx.save();
        for (let i = smokeList.length - 1; i >= 0; i--) {
          const sm = smokeList[i];
          sm.x += sm.vx * (dt * 60);
          sm.y += sm.vy * (dt * 60);
          sm.radius += sm.growthRate * (dt * 60);
          sm.rotation += sm.vRot;
          sm.alpha -= sm.decay * (dt * 60);

          if (sm.alpha <= 0 || sm.radius >= sm.maxRadius) {
            smokeList.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.translate(sm.x, sm.y);
          ctx.rotate(sm.rotation);
          ctx.globalAlpha = Math.max(0, sm.alpha);

          // Soft radial smoke cloud
          ctx.fillStyle = sm.color;
          ctx.beginPath();
          ctx.arc(0, 0, sm.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      }

      // 2. RENDER SHOCKWAVE EXPANDING RINGS
      if (shockwaves.length > 0) {
        ctx.save();
        for (let i = shockwaves.length - 1; i >= 0; i--) {
          const sw = shockwaves[i];
          sw.radius += sw.speed * (dt * 60);
          const p = sw.radius / sw.maxRadius;
          const currentAlpha = (1 - p) * sw.alpha;

          if (p >= 1.0 || currentAlpha <= 0) {
            shockwaves.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.strokeStyle = sw.color;
          ctx.lineWidth = Math.max(0.5, sw.lineWidth * (1 - p));
          ctx.globalAlpha = currentAlpha;
          ctx.stroke();
        }
        ctx.restore();
      }

      // 3. RENDER FLOODLIGHT / ROOF LIGHT FLASHES
      if (flashes.length > 0) {
        ctx.save();
        for (let i = flashes.length - 1; i >= 0; i--) {
          const f = flashes[i];
          f.alpha -= f.decay * (dt * 60);

          if (f.alpha <= 0) {
            flashes.splice(i, 1);
            continue;
          }

          ctx.fillStyle = f.color;
          ctx.globalAlpha = Math.min(0.6, f.alpha * 0.7);
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 4. RENDER HIGH-ENERGY SPARKS & PYRO FOUNTAINS (Additive Blending for Intense Brilliance)
      if (sparks.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        for (let i = sparks.length - 1; i >= 0; i--) {
          const sp = sparks[i];
          const prevX = sp.x;
          const prevY = sp.y;

          sp.x += sp.vx * (dt * 60);
          sp.y += sp.vy * (dt * 60);
          sp.vy += sp.gravity * (dt * 60);
          sp.vx *= sp.drag;
          sp.vy *= sp.drag;
          sp.alpha -= sp.decay * (dt * 60);

          if (sp.alpha <= 0 || sp.y > 520) {
            sparks.splice(i, 1);
            continue;
          }

          const currentAlpha = Math.max(0, Math.min(1.0, sp.alpha));
          const flicker = sp.sparkle ? 0.7 + Math.sin(now * 0.04 + sp.x) * 0.3 : 1.0;

          // Glowing trailing spark line
          ctx.strokeStyle = sp.color;
          ctx.lineWidth = sp.size * flicker;
          ctx.globalAlpha = currentAlpha * flicker;
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(sp.x, sp.y);
          ctx.stroke();

          // White-hot core highlight
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = currentAlpha * 0.85;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // 5. RENDER BURNING EMBERS (Floating up with turbulent thermals)
      if (embers.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        for (let i = embers.length - 1; i >= 0; i--) {
          const em = embers[i];
          em.thermalPhase += 0.08;
          em.x += (em.vx + Math.sin(em.thermalPhase) * 0.8) * (dt * 60);
          em.y += em.vy * (dt * 60);
          em.alpha -= em.decay * (dt * 60);

          if (em.alpha <= 0 || em.y < 0) {
            embers.splice(i, 1);
            continue;
          }

          const flicker = 0.65 + Math.sin(em.thermalPhase * 2) * 0.35;
          ctx.fillStyle = em.color;
          ctx.globalAlpha = Math.max(0, em.alpha * flicker);
          ctx.beginPath();
          ctx.arc(em.x, em.y, em.size * flicker, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // 6. RENDER 3D FLUTTERING STADIUM CONFETTI
      if (confettiList.length > 0) {
        ctx.save();

        for (let i = confettiList.length - 1; i >= 0; i--) {
          const c = confettiList[i];
          c.swayPhase += 0.05;
          c.x += (c.vx + Math.sin(c.swayPhase) * 0.6) * (dt * 60);
          c.y += c.vy * (dt * 60);
          c.rotX += c.vRotX * (dt * 60);
          c.rotZ += c.vRotZ * (dt * 60);
          c.vy += 0.02 * (dt * 60);

          if (c.y > 520) {
            confettiList.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.rotate(c.rotZ);

          // 3D perspective foreshortening: tumbling paper flipping in the wind
          const perspectiveW = Math.cos(c.rotX) * c.size;
          ctx.fillStyle = c.color;
          ctx.globalAlpha = Math.min(1.0, (520 - c.y) / 60);

          if (c.isRibbon) {
            ctx.fillRect(-perspectiveW * 0.5, -2, Math.max(1, Math.abs(perspectiveW)), 4);
          } else {
            ctx.fillRect(
              -perspectiveW * 0.5,
              -c.size * 0.5,
              Math.max(1, Math.abs(perspectiveW)),
              c.size
            );
          }

          ctx.restore();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(renderParticles);
    };

    animId = requestAnimationFrame(renderParticles);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      {/* 1. STADIUM GRANDSTAND ARCHITECTURE & DYNAMIC SPECTATOR CROWD (Top 18.2% / 95px at z-0) */}
      <canvas
        ref={crowdCanvasRef}
        width={800}
        height={95}
        className="absolute top-0 left-0 w-full h-[18.2%] pointer-events-none z-0"
        style={{ imageRendering: 'auto' }}
        aria-hidden="true"
      />

      {/* 2. FULL ARENA STADIUM PARTICLE ATMOSPHERE (Sparks, Fireworks, Flares, Confetti, Smoke, Embers at z-20) */}
      <canvas
        ref={particleCanvasRef}
        width={800}
        height={520}
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
        style={{ imageRendering: 'auto' }}
        aria-hidden="true"
      />
    </>
  );
};

export const DynamicCrowdBackground = React.memo(DynamicCrowdBackgroundComponent);
