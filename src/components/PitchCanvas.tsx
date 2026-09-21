import React, { useEffect, useRef, useState } from 'react';
import {
  Zap,
  Flame,
  Rocket,
  Shield,
  Activity,
  Play,
  Pause,
  Check,
} from 'lucide-react';
import { BallDelivery, BatterArchetype, BattingShotMode, BattingStance, GameState, ShotDirection, ShotOutcome, WeatherCondition } from '../types';
import { DynamicCrowdBackground } from './DynamicCrowdBackground';
import { WeatherOverlay } from './WeatherOverlay';
import { triggerHaptic } from '../utils/haptics';
import { getBatterArchetypeProfile } from '../config/batterArchetypes';
import {
  CricketCharacterGradients,
  RealisticBatsman,
  RealisticBowler,
  RealisticWicketKeeper,
  RealisticFielder,
  RealisticMatchUmpire,
} from './RealisticCricketCharacters';
import { getTeamById } from '../tournament/teamsData';
import { FieldingSetup, getFieldingSetupForOver } from '../config/fieldingPresets';

export interface ExitBallState {
  outcome: ShotOutcome;
  progress?: number; // 0 to 1
  startX: number;
  startY: number;
  isActive: boolean;
  startTime?: number;
  duration?: number;
}

interface PitchCanvasProps {
  currentDelivery: BallDelivery | null;
  progress: number; // 0 (release) to 1.0 (crease)
  isBallInFlight: boolean;
  selectedDirection: ShotDirection;
  lastOutcome: ShotOutcome | null;
  batterAnimationState: 'IDLE' | 'BACKLIFT' | 'SWING_OFF' | 'SWING_STRAIGHT' | 'SWING_ON' | 'DEFENSIVE' | 'BOWLED';
  showHitFeedback: boolean;
  exitBallState?: ExitBallState | null;
  onSwing?: (direction?: ShotDirection) => void;
  onBowl?: () => void;
  onSelectDirection?: (direction: ShotDirection) => void;
  isPaused?: boolean;
  onTogglePause?: () => void;
  isPracticeMode?: boolean;
  compact?: boolean;
  className?: string;
  isRunUpActive?: boolean;
  bowlerRunUpProgress?: number;
  gameState?: GameState;
  battingStance?: BattingStance;
  battingShotMode?: BattingShotMode;
  weatherCondition?: WeatherCondition;
  onToggleStance?: () => void;
  onToggleShotMode?: () => void;
  fieldingSetup?: FieldingSetup;
}

interface FielderData {
  id: string;
  name: string;
  x: number;
  y: number;
  scale: number;
}

const DEFAULT_FIELDERS: FielderData[] = [
  { id: 'third_man', name: 'Third Man', x: 105, y: 170, scale: 0.88 },
  { id: 'deep_cover', name: 'Deep Cover', x: 165, y: 130, scale: 0.88 },
  { id: 'point', name: 'Point', x: 190, y: 380, scale: 0.88 },
  { id: 'cover', name: 'Cover', x: 260, y: 285, scale: 0.88 },
  { id: 'mid_off', name: 'Mid Off', x: 330, y: 210, scale: 0.88 },
  { id: 'mid_on', name: 'Mid On', x: 470, y: 210, scale: 0.88 },
  { id: 'mid_wicket', name: 'Mid Wicket', x: 540, y: 285, scale: 0.88 },
  { id: 'square_leg', name: 'Square Leg', x: 610, y: 380, scale: 0.88 },
  { id: 'deep_mid_wicket', name: 'Deep Mid-Wicket', x: 685, y: 135, scale: 0.88 },
];

const WICKET_KEEPER: FielderData = {
  id: 'keeper',
  name: 'Wicket Keeper',
  x: 365,
  y: 435,
  scale: 0.95,
};

const PitchCanvasComponent: React.FC<PitchCanvasProps> = ({
  currentDelivery,
  progress,
  isBallInFlight,
  selectedDirection,
  lastOutcome,
  batterAnimationState,
  showHitFeedback,
  exitBallState,
  onSwing,
  onBowl,
  onSelectDirection,
  isPaused = false,
  onTogglePause,
  isPracticeMode = false,
  compact = false,
  className = '',
  isRunUpActive = false,
  bowlerRunUpProgress = 0,
  gameState,
  battingStance = 'RIGHT',
  battingShotMode = 'DEFENSIVE',
  weatherCondition,
  onToggleStance,
  onToggleShotMode,
  fieldingSetup,
}) => {
  const isRightHanded = (battingStance || gameState?.config?.battingStance || 'RIGHT') === 'RIGHT';
  const activeWeather: WeatherCondition =
    weatherCondition || gameState?.config?.weatherCondition || 'SUNNY';

  // --- Dynamic Pitch Wear & Track Degradation System ---
  const oversCompleted = (gameState?.currentOver ?? 0) + (gameState?.ballInOver ?? 0) / 6;
  const configuredMaxOvers = gameState?.config?.totalOvers;
  const maxOversBenchmark =
    configuredMaxOvers && configuredMaxOvers > 0 ? Math.max(configuredMaxOvers, 5) : 20;
  const pitchWearFactor = Math.min(1.0, Math.max(0, oversCompleted / maxOversBenchmark));

  let pitchWearLabel = 'FRESH TRACK';
  let pitchWearBadgeStyle = 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80';
  let pitchWearBarColor = 'bg-emerald-400';

  if (pitchWearFactor >= 0.8) {
    pitchWearLabel = 'CRACKED TRACK';
    pitchWearBadgeStyle = 'bg-rose-950/80 text-rose-300 border-rose-700/80';
    pitchWearBarColor = 'bg-rose-500';
  } else if (pitchWearFactor >= 0.55) {
    pitchWearLabel = 'MODERATE WEAR';
    pitchWearBadgeStyle = 'bg-orange-950/80 text-orange-300 border-orange-700/80';
    pitchWearBarColor = 'bg-orange-400';
  } else if (pitchWearFactor >= 0.25) {
    pitchWearLabel = 'DRYING SURFACE';
    pitchWearBadgeStyle = 'bg-amber-950/80 text-amber-300 border-amber-700/80';
    pitchWearBarColor = 'bg-amber-400';
  }

  // Screen Shake physical impact state ('NONE' | 'SIX' | 'WICKET')
  const [shakeType, setShakeType] = useState<'NONE' | 'SIX' | 'WICKET'>('NONE');
  const shakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger screen shake when a SIX is hit or when a wicket falls
  useEffect(() => {
    const isSix =
      lastOutcome?.boundaryType === 'SIX' ||
      (exitBallState?.isActive === true && exitBallState.outcome.boundaryType === 'SIX');

    const isWicket =
      lastOutcome?.isWicket === true ||
      batterAnimationState === 'BOWLED' ||
      (exitBallState?.isActive === true && exitBallState.outcome.isWicket === true);

    if (isSix) {
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
      setShakeType('SIX');
      triggerHaptic('six');
      shakeTimeoutRef.current = setTimeout(() => {
        setShakeType('NONE');
      }, 650);
    } else if (isWicket) {
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
      setShakeType('WICKET');
      triggerHaptic('wicket');
      shakeTimeoutRef.current = setTimeout(() => {
        setShakeType('NONE');
      }, 650);
    }
  }, [lastOutcome, batterAnimationState, exitBallState?.isActive]);

  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    };
  }, []);

  // Internal high-refresh-rate exit animation loop
  const [internalExitProgress, setInternalExitProgress] = useState<number>(0);

  useEffect(() => {
    if (!exitBallState?.isActive) {
      setInternalExitProgress(0);
      return;
    }

    if (!exitBallState.startTime || !exitBallState.duration) {
      setInternalExitProgress(exitBallState.progress ?? 0);
      return;
    }

    let animId: number;
    const startTime = exitBallState.startTime;
    const duration = exitBallState.duration;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const p = Math.min(1.0, Math.max(0, elapsed / duration));
      setInternalExitProgress(p);
      if (p < 1.0) {
        animId = requestAnimationFrame(tick);
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [exitBallState?.startTime, exitBallState?.duration, exitBallState?.isActive]);

  // SVG Canvas dimensions: 800 x 520
  const W = 800;
  const H = 520;

  // Active 9 fielders dynamically based on current fielding setup preset
  const activeFielders: FielderData[] = (fieldingSetup?.fielders && fieldingSetup.fielders.length > 0)
    ? fieldingSetup.fielders
    : DEFAULT_FIELDERS;

  const bowlerX = 400;
  const bowlerY = 175;
  const battingCreaseY = 430;

  // 1. DELIVERY APPROACH BALL POSITION
  let ballX = bowlerX;
  let ballY = bowlerY;
  let ballRadius = 4;
  let ballShadowY = bowlerY;
  let targetX = 400;
  let isApproaching = isBallInFlight && currentDelivery !== null;
  const isSpinner =
    currentDelivery?.bowlerStyle === 'OFF_SPINNER' ||
    currentDelivery?.bowlerStyle === 'LEG_SPINNER' ||
    currentDelivery?.bowlerStyle === 'MYSTERY_SPINNER';

  if (isApproaching && currentDelivery) {
    const p = Math.min(1.2, Math.max(0, progress));

    targetX = 400;
    if (isRightHanded) {
      switch (currentDelivery.line) {
        case 'WIDE_OUTSIDE_OFF':
          targetX = 490;
          break;
        case 'OUTSIDE_OFF':
          targetX = 450;
          break;
        case 'MIDDLE_OFF':
          targetX = 420;
          break;
        case 'MIDDLE':
          targetX = 400;
          break;
        case 'LEG':
          targetX = 350;
          break;
      }
    } else {
      switch (currentDelivery.line) {
        case 'WIDE_OUTSIDE_OFF':
          targetX = 310;
          break;
        case 'OUTSIDE_OFF':
          targetX = 350;
          break;
        case 'MIDDLE_OFF':
          targetX = 380;
          break;
        case 'MIDDLE':
          targetX = 400;
          break;
        case 'LEG':
          targetX = 450;
          break;
      }
    }

    const groundY = bowlerY + (battingCreaseY - bowlerY) * p;
    const bounceP = Math.min(0.9, Math.max(0.2, currentDelivery.bounceRatio));
    let elevation = 0;
    const stanceFactor = isRightHanded ? -1 : 1;

    if (isSpinner) {
      // Authentic spinner physics:
      // In air (p < bounceP): high looping arc + lateral air drift
      // After pitching (p >= bounceP): sharp spin break / turn off the surface!
      if (p < bounceP) {
        const fractionToBounce = p / bounceP;
        // Loopy trajectory in the air
        elevation = (1 - fractionToBounce) * 52 + Math.sin(fractionToBounce * Math.PI) * 18;
        const airDrift = currentDelivery.spinOrSwing * 32 * Math.sin(fractionToBounce * Math.PI) * stanceFactor;
        ballX = bowlerX + (targetX - bowlerX) * p + airDrift;
      } else {
        const denom = Math.max(0.01, 1 - bounceP);
        const fractionAfterBounce = (p - bounceP) / denom;
        const maxBounceHeight =
          currentDelivery.length === 'BOUNCER'
            ? 50
            : currentDelivery.length === 'SHORT'
            ? 38
            : currentDelivery.length === 'FULL'
            ? 16
            : 28;
        elevation = Math.sin(fractionAfterBounce * Math.PI * 0.75) * maxBounceHeight;

        // Sharp spin turn biting off the turf
        const spinBreak = (currentDelivery.spinTurnPixels || 0) * Math.min(1.2, fractionAfterBounce * 1.15) * stanceFactor;
        ballX = bowlerX + (targetX - bowlerX) * p + spinBreak;
      }
    } else {
      // Fast / Medium Pace physics:
      const swingDrift = currentDelivery.spinOrSwing * 30 * Math.sin(p * Math.PI) * stanceFactor;
      const seamKick = (currentDelivery.spinTurnPixels || 0) * (p > bounceP ? (p - bounceP) / (1 - bounceP) : 0) * stanceFactor;
      ballX = bowlerX + (targetX - bowlerX) * p + swingDrift + seamKick;

      if (p < bounceP) {
        const fractionToBounce = p / bounceP;
        elevation = (1 - fractionToBounce) * 45;
      } else {
        const denom = Math.max(0.01, 1 - bounceP);
        const fractionAfterBounce = (p - bounceP) / denom;
        const maxBounceHeight =
          currentDelivery.length === 'BOUNCER' ? 55 : currentDelivery.length === 'YORKER' ? 8 : 32;
        elevation = Math.sin(fractionAfterBounce * Math.PI * 0.75) * maxBounceHeight;
      }
    }

    ballShadowY = groundY;
    ballY = groundY - elevation;
    ballRadius = 4 + p * 11;
  }

  // 2. POST-HIT EXIT BALL TRAJECTORY & FIELDING CATCH TRACKING
  const effectiveExitProgress = exitBallState?.startTime ? internalExitProgress : (exitBallState?.progress ?? 0);
  let isExitActive = exitBallState?.isActive === true && effectiveExitProgress <= 1.0;
  let exitBallX = 400;
  let exitBallY = 420;
  let exitShadowY = 420;
  let exitBallRadius = 12;
  let exitTrailPoints: Array<{ x: number; y: number; opacity: number }> = [];
  let activeFielderId: string | null = null;
  let isCatchAttempt: boolean = false;

  if (isExitActive && exitBallState) {
    const ep = effectiveExitProgress;
    const outcome = exitBallState.outcome;
    const sX = exitBallState.startX || 400;
    const sY = exitBallState.startY || 420;

    let targetGroundX = 400;
    let targetGroundY = 120;
    let targetElevationAtEnd = 0;
    let peakElevation = 0;

    if (outcome.boundaryType === 'SIX') {
      if (outcome.shotDirection === 'OFF_SIDE') {
        targetGroundX = isRightHanded ? 90 : 710;
        targetGroundY = 50;
      } else if (outcome.shotDirection === 'ON_SIDE') {
        targetGroundX = isRightHanded ? 710 : 90;
        targetGroundY = 50;
      } else {
        targetGroundX = 400;
        targetGroundY = 35;
      }
      peakElevation = 195;
      exitBallRadius = 12 + Math.sin(ep * Math.PI) * 10;
    } else if (outcome.boundaryType === 'FOUR') {
      if (outcome.shotDirection === 'OFF_SIDE') {
        targetGroundX = isRightHanded ? 60 : 740;
        targetGroundY = 220;
      } else if (outcome.shotDirection === 'ON_SIDE') {
        targetGroundX = isRightHanded ? 740 : 60;
        targetGroundY = 220;
      } else {
        targetGroundX = 400;
        targetGroundY = 115;
      }
      peakElevation = Math.abs(Math.sin(ep * Math.PI * 3.5)) * 14 * (1 - ep);
      exitBallRadius = 12 - ep * 4;
    } else if (outcome.isWicket) {
      if (outcome.wicketType === 'EDGED_BEHIND') {
        activeFielderId = 'keeper';
        isCatchAttempt = true;
        targetGroundX = isRightHanded ? 435 : WICKET_KEEPER.x;
        targetGroundY = WICKET_KEEPER.y;
        targetElevationAtEnd = 16 * WICKET_KEEPER.scale;
        peakElevation = 35;
        exitBallRadius = 10;
      } else if (outcome.wicketType === 'CAUGHT') {
        isCatchAttempt = true;
        let targetFielder = activeFielders[3] || activeFielders[0];
        if (outcome.shotDirection === 'OFF_SIDE') {
          if (outcome.timingTier === 'VERY_LATE') {
            targetFielder = activeFielders[0] || activeFielders[1] || activeFielders[0];
          } else if (outcome.timingTier === 'VERY_EARLY') {
            targetFielder = activeFielders[2] || activeFielders[1] || activeFielders[0];
          } else {
            targetFielder = activeFielders[3] || activeFielders[1] || activeFielders[0];
          }
        } else if (outcome.shotDirection === 'ON_SIDE') {
          if (outcome.timingTier === 'VERY_EARLY') {
            targetFielder = activeFielders[8] || activeFielders[7] || activeFielders[6] || activeFielders[0];
          } else if (outcome.timingTier === 'VERY_LATE') {
            targetFielder = activeFielders[7] || activeFielders[6] || activeFielders[5] || activeFielders[0];
          } else {
            targetFielder = activeFielders[6] || activeFielders[5] || activeFielders[0];
          }
        } else {
          targetFielder = outcome.timingTier === 'VERY_LATE' ? (activeFielders[5] || activeFielders[4]) : (activeFielders[4] || activeFielders[3]);
        }

        activeFielderId = targetFielder.id;
        targetGroundX = isRightHanded ? targetFielder.x : 800 - targetFielder.x;
        targetGroundY = targetFielder.y;
        targetElevationAtEnd = 24 * targetFielder.scale; // Exact height of outstretched fielder hands
        peakElevation = 145; // Towering mistimed skier arc
        exitBallRadius = 12 + Math.sin(ep * Math.PI) * 7;
      } else if (outcome.wicketType === 'BOWLED') {
        targetGroundX = isRightHanded ? 390 : 410;
        targetGroundY = 455;
        peakElevation = Math.sin(ep * Math.PI) * 18;
        exitBallRadius = 10;
      } else {
        targetGroundX = 400;
        targetGroundY = 485;
        peakElevation = 4;
        exitBallRadius = 11;
      }
    } else if (outcome.runs > 0) {
      // Ground fielding singles
      let fieldingFielder = activeFielders[3] || activeFielders[0];
      if (outcome.shotDirection === 'OFF_SIDE') {
        fieldingFielder = outcome.runs >= 2 ? (activeFielders[1] || activeFielders[0]) : (activeFielders[3] || activeFielders[2] || activeFielders[0]);
      } else if (outcome.shotDirection === 'ON_SIDE') {
        fieldingFielder = outcome.runs >= 2 ? (activeFielders[8] || activeFielders[7] || activeFielders[0]) : (activeFielders[6] || activeFielders[5] || activeFielders[0]);
      } else {
        fieldingFielder = activeFielders[4] || activeFielders[5] || activeFielders[0];
      }
      activeFielderId = fieldingFielder.id;
      targetGroundX = isRightHanded ? 800 - fieldingFielder.x : fieldingFielder.x;
      targetGroundY = fieldingFielder.y;
      targetElevationAtEnd = 5 * fieldingFielder.scale;
      peakElevation = Math.abs(Math.sin(ep * Math.PI * 2)) * 8 * (1 - ep);
      exitBallRadius = 12 - ep * 5;
    } else {
      activeFielderId = 'keeper';
      targetGroundX = 400;
      targetGroundY = 480;
      peakElevation = 4;
      exitBallRadius = 11;
    }

    // Exact ball interpolation directly into fielder's hands
    const currentGroundX = sX + (targetGroundX - sX) * ep;
    const currentGroundY = sY + (targetGroundY - sY) * ep;
    const currentElevation = Math.sin(ep * Math.PI) * peakElevation + ep * targetElevationAtEnd;

    exitShadowY = currentGroundY;
    exitBallX = currentGroundX;
    exitBallY = currentGroundY - currentElevation;

    for (let step = 0; step < 6; step++) {
      const stepP = Math.max(0, ep - step * 0.05);
      const trailGroundX = sX + (targetGroundX - sX) * stepP;
      const trailGroundY = sY + (targetGroundY - sY) * stepP;
      const trailElev = Math.sin(stepP * Math.PI) * peakElevation + stepP * targetElevationAtEnd;
      exitTrailPoints.push({
        x: trailGroundX,
        y: trailGroundY - trailElev,
        opacity: (1 - step / 6) * 0.7,
      });
    }
  }

  const hitZoneY = battingCreaseY - 10;
  const hitZoneWidth = 140;
  const hitZoneHeight = 36;

  // 5. BOWLER RUN-UP & DELIVERY KINEMATICS
  // The bowler runs completely on the green outfield turf from y = 68 down to the bowling crease at y = 133 (feet land at y = 176)
  const runP = Math.max(0, Math.min(1.0, bowlerRunUpProgress));
  const isBowlerRunning = isRunUpActive && bowlerRunUpProgress < 1.0;

  let currentBowlerX = 388;
  let currentBowlerY = 133;
  let bowlerScale = 1.0;
  let bodyBob = 0;
  let torsoAngle = 0;
  let leftLegAngle = 0;
  let rightLegAngle = 0;
  let leftArmAngle = 0;
  let rightArmAngle = 0; // Bowling arm
  let showHeldBall = false;
  let heldBallOffset = { x: 0, y: 0 };
  let shadowScale = 1.0;

  if (isBowlerRunning) {
    // Fast bowlers start deep on the grass at y = 68 (feet at 111, in front of boundary rope at 82).
    // Spinners have a controlled, shorter run-up from y = 95 (feet at 138).
    const startY = isSpinner ? 95 : 68;
    const startX = isSpinner ? 382 : 380;
    const endX = 388;
    const endY = 133; // Feet touch down at 133 + 43 = 176 (bowling crease)

    currentBowlerX = startX + (endX - startX) * runP;
    currentBowlerY = startY + (endY - startY) * runP;
    bowlerScale = 0.74 + 0.26 * runP;

    if (runP < 0.72) {
      // 1. Approach Sprint Phase (Accelerating run towards the bowling crease)
      const strideFreq = isSpinner ? 8 : 11;
      const stridePhase = runP * strideFreq * Math.PI;
      const strideCycle = Math.sin(stridePhase);

      bodyBob = -Math.abs(Math.sin(stridePhase)) * 3.2;
      torsoAngle = isSpinner ? 4 : 9; // Forward sprint lean
      shadowScale = 1.0 - Math.abs(bodyBob) * 0.08;

      leftLegAngle = strideCycle * 34;
      rightLegAngle = -strideCycle * 34;

      // Arms rhythmically pumping with strides
      leftArmAngle = -strideCycle * 38;
      rightArmAngle = strideCycle * 32;
      showHeldBall = true;
      heldBallOffset = { x: rightArmAngle * 0.18, y: 0 };
    } else if (runP < 0.94) {
      // 2. Gather & Jump Phase (Classic airborne cricket bowling leap)
      const gatherP = (runP - 0.72) / 0.22; // 0 to 1
      const jumpArc = Math.sin(gatherP * Math.PI);
      bodyBob = -jumpArc * 8.5; // Bowler is airborne
      shadowScale = Math.max(0.4, 1.0 - jumpArc * 0.45);
      torsoAngle = -6 * (1 - gatherP) + 12 * gatherP; // Arches back then thrusts forward

      // Legs in mid-air stride
      leftLegAngle = 22 - gatherP * 26;
      rightLegAngle = -32 + gatherP * 30;

      // Non-bowling arm points high to batsman; Bowling arm cocks high overhead
      leftArmAngle = -75 * (1 - gatherP) - 45 * gatherP;
      rightArmAngle = -100 * (1 - gatherP) - 175 * gatherP;
      showHeldBall = true;
      heldBallOffset = { x: 0, y: -4 };
    } else {
      // 3. Release Whip Phase (0.94 to 1.0 - front foot plants, arm windmill release)
      const releaseP = (runP - 0.94) / 0.06; // 0 to 1
      bodyBob = 0;
      torsoAngle = 14; // Forward plant

      // Front foot lands at bowling crease
      leftLegAngle = -14;
      rightLegAngle = 24;

      // Bowling arm sweeps over the top (windmill swing down)
      rightArmAngle = -175 + releaseP * 170; // High overhead to release angle
      leftArmAngle = 28 * releaseP;
      showHeldBall = releaseP < 0.85; // Ball detaches at peak release point
      heldBallOffset = { x: 0, y: 0 };
    }
  } else if (isApproaching) {
    // 4. Follow-Through during ball flight
    const followP = Math.min(1.0, (progress || 0) * 2.8);
    currentBowlerX = 388 + followP * 5;
    currentBowlerY = 133 + followP * 4;
    bowlerScale = 1.0;
    bodyBob = 0;
    torsoAngle = 16 * (1 - followP * 0.5);

    // Follow through deceleration stride
    leftLegAngle = -16 + followP * 12;
    rightLegAngle = 22 - followP * 14;

    // Arm follow through across left hip
    rightArmAngle = 25 + followP * 18;
    leftArmAngle = -18 + followP * 8;
    showHeldBall = false;
  } else {
    // 5. Idle / At Top of Run-up Mark on Outfield Grass
    currentBowlerX = isSpinner ? 382 : 380;
    currentBowlerY = isSpinner ? 95 : 68;
    bowlerScale = 0.74;
    bodyBob = 0;
    torsoAngle = 0;
    leftLegAngle = -4;
    rightLegAngle = 4;
    leftArmAngle = 12;
    rightArmAngle = -12;
    showHeldBall = true;
    heldBallOffset = { x: 0, y: 0 };
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickXFraction = (e.clientX - rect.left) / rect.width;

    let clickDirection: ShotDirection = 'STRAIGHT';
    if (clickXFraction < 0.36) {
      clickDirection = isRightHanded ? 'ON_SIDE' : 'OFF_SIDE';
    } else if (clickXFraction > 0.64) {
      clickDirection = isRightHanded ? 'OFF_SIDE' : 'ON_SIDE';
    } else {
      clickDirection = 'STRAIGHT';
    }

    onSelectDirection?.(clickDirection);

    if (isBallInFlight || isRunUpActive) {
      onSwing?.(clickDirection);
    } else {
      onBowl?.();
    }
  };

  const isSixCelebration =
    (exitBallState?.isActive === true && exitBallState.outcome.boundaryType === 'SIX') ||
    (showHitFeedback && lastOutcome?.boundaryType === 'SIX');

  const isFourCelebration =
    (exitBallState?.isActive === true && exitBallState.outcome.boundaryType === 'FOUR') ||
    (showHitFeedback && lastOutcome?.boundaryType === 'FOUR');

  const isWicketCelebration =
    (exitBallState?.isActive === true && exitBallState.outcome.isWicket) ||
    (showHitFeedback && lastOutcome?.isWicket) ||
    batterAnimationState === 'BOWLED';

  const currentSixDirection: ShotDirection =
    exitBallState?.outcome.boundaryType === 'SIX'
      ? exitBallState.outcome.shotDirection
      : lastOutcome?.boundaryType === 'SIX'
      ? lastOutcome.shotDirection
      : selectedDirection;

  const shakeClass =
    shakeType === 'SIX'
      ? 'animate-shake-six glow-six border-amber-400/90 ring-4 ring-amber-400/40'
      : shakeType === 'WICKET'
      ? 'animate-shake-wicket glow-wicket border-rose-500/90 ring-4 ring-rose-500/50'
      : '';

  // Team Colors Resolution for Realistic Kits
  const playerTeam = gameState?.config?.playerTeamId ? getTeamById(gameState.config.playerTeamId) : null;
  const opponentTeam = gameState?.config?.opponentTeamId ? getTeamById(gameState.config.opponentTeamId) : null;

  const playerColors = {
    primaryColor: playerTeam?.primaryColor || '#1d4ed8',
    secondaryColor: playerTeam?.secondaryColor || '#ea580c',
    accentColor: playerTeam?.accentColor || '#fbbf24',
  };

  const opponentColors = {
    primaryColor: opponentTeam?.primaryColor || (isSpinner ? '#059669' : '#0284c7'),
    secondaryColor: opponentTeam?.secondaryColor || (isSpinner ? '#047857' : '#0369a1'),
  };

  // Umpire Signal Reaction based on active live action
  let umpireSignal: 'NORMAL' | 'FOUR' | 'SIX' | 'OUT' = 'NORMAL';
  if (isSixCelebration) {
    umpireSignal = 'SIX';
  } else if (isWicketCelebration) {
    umpireSignal = 'OUT';
  } else if (isFourCelebration) {
    umpireSignal = 'FOUR';
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      role="button"
      tabIndex={0}
      aria-label="Cricket Pitch - Click left/centre/right to hit"
      className={`${
        className ||
        "relative w-full h-full min-h-[400px] sm:min-h-[480px] md:min-h-[540px] lg:min-h-[600px] aspect-[16/10] mx-auto rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-2xl select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
      } ${shakeClass}`}
    >
      {/* 1. DYNAMIC ANIMATED CROWD CANVAS & STADIUM PARTICLE EFFECTS */}
      <DynamicCrowdBackground
        isSixHit={isSixCelebration}
        isFourHit={isFourCelebration}
        isWicket={isWicketCelebration}
        sixDirection={currentSixDirection}
        lastOutcome={lastOutcome}
        isBallInFlight={isBallInFlight}
        isRunUpActive={isRunUpActive}
        battingStance={isRightHanded ? 'RIGHT' : 'LEFT'}
        teamName={gameState?.config?.teamName || gameState?.config?.franchiseName || 'INDIA'}
        opponentName={gameState?.config?.opponentName || 'AUSTRALIA'}
        matchContext={gameState?.config?.mode ? `${gameState.config.mode.replace('_', ' ')} MATCH` : 'T20 CRICKET FRENZY'}
      />

      {/* 1b. DYNAMIC WEATHER EFFECTS & ATMOSPHERE */}
      <WeatherOverlay weatherCondition={activeWeather} compact={compact} />

      {/* 1b. SCREEN SHAKE PHYSICAL IMPACT FLASH OVERLAYS */}
      {shakeType === 'SIX' && (
        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/25 via-pink-500/15 to-transparent pointer-events-none z-20 mix-blend-screen animate-pulse" />
      )}
      {shakeType === 'WICKET' && (
        <div className="absolute inset-0 bg-gradient-to-b from-rose-600/30 via-rose-900/20 to-transparent pointer-events-none z-20 mix-blend-color-dodge animate-pulse" />
      )}

      {/* 2. STADIUM & FIELD CANVAS (Pitch, Fielders, Ball, Stumps) */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full object-cover pointer-events-none relative z-10"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e3a1e" />
            <stop offset="35%" stopColor="#1b4d23" />
            <stop offset="100%" stopColor="#14532d" />
          </linearGradient>

          <linearGradient id="pitchGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#856338" />
            <stop offset="50%" stopColor="#a37e4c" />
            <stop offset="100%" stopColor="#bfa068" />
          </linearGradient>

          <radialGradient id="cricketBallGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ff5252" />
            <stop offset="50%" stopColor="#d32f2f" />
            <stop offset="100%" stopColor="#5f0909" />
          </radialGradient>

          <radialGradient id="lightGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#fef08a" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0.0" />
          </radialGradient>

          <radialGradient id="catchBurst" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
          </radialGradient>

          <radialGradient id="turfDustGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#a37e4c" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#856338" stopOpacity="0.0" />
          </radialGradient>

          <radialGradient id="hitSparkGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="35%" stopColor="#fef08a" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0.0" />
          </radialGradient>
        </defs>

        {/* Realistic Cricket Character Shading & Kit Gradients */}
        <CricketCharacterGradients playerColors={playerColors} opponentColors={opponentColors} />

        {/* Stadium Floodlight Towers (Far Left & Far Right Wings) */}
        <g opacity="0.9">
          {/* Left Floodlight Tower */}
          <line x1="45" y1="82" x2="45" y2="14" stroke="#475569" strokeWidth="3.5" />
          <line x1="38" y1="82" x2="45" y2="45" stroke="#334155" strokeWidth="1.5" />
          <line x1="52" y1="82" x2="45" y2="45" stroke="#334155" strokeWidth="1.5" />
          <rect x="30" y="8" width="30" height="12" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          <circle cx="45" cy="14" r="22" fill="url(#lightGlow)" />

          {/* Right Floodlight Tower */}
          <line x1="755" y1="82" x2="755" y2="14" stroke="#475569" strokeWidth="3.5" />
          <line x1="748" y1="82" x2="755" y2="45" stroke="#334155" strokeWidth="1.5" />
          <line x1="762" y1="82" x2="755" y2="45" stroke="#334155" strokeWidth="1.5" />
          <rect x="740" y="8" width="30" height="12" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          <circle cx="755" cy="14" r="22" fill="url(#lightGlow)" />
        </g>

        {/* Boundary Advertising Boards separating pitch outfield from audience stands */}
        <path
          d="M 0 82 Q 400 66 800 82 L 800 90 Q 400 74 0 90 Z"
          fill="#0f172a"
          stroke="#334155"
          strokeWidth="0.8"
        />
        <text
          x="400"
          y="83"
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="8"
          fontWeight="900"
          letterSpacing="4"
        >
          TIMING CRICKET PREMIER LEAGUE • GRAND ARENA
        </text>

        {/* 2. CRICKET OUTFIELD (Turf spans from boundary rope at y=82 to ground bottom) */}
        <polygon
          points={`0,82 ${W},82 ${W},${H} 0,${H}`}
          fill="url(#grassGrad)"
        />

        {/* Realistic Alternating Lawn Mower Grass Stripes */}
        <g stroke="#166534" strokeWidth="16" fill="none" opacity="0.22">
          <ellipse cx="400" cy="520" rx="390" ry="250" />
          <ellipse cx="400" cy="520" rx="330" ry="210" />
          <ellipse cx="400" cy="520" rx="270" ry="170" />
          <ellipse cx="400" cy="520" rx="210" ry="130" />
          <ellipse cx="400" cy="520" rx="150" ry="90" />
        </g>

        {/* Boundary Rope & Triangular Foam Cushions Along the Arc */}
        <path
          d="M 0 84 Q 400 68 800 84"
          stroke="#f8fafc"
          strokeWidth="2.5"
          strokeDasharray="4,2"
          fill="none"
          opacity="0.9"
        />
        {/* Triangular Sponsor Wedges along boundary rope */}
        {[80, 160, 240, 320, 400, 480, 560, 640, 720].map((bx) => {
          const by = 84 - Math.sin((bx / 800) * Math.PI) * 16;
          return (
            <polygon
              key={bx}
              points={`${bx - 10},${by + 2} ${bx + 10},${by + 2} ${bx},${by - 4}`}
              fill={bx % 160 === 0 ? '#dc2626' : bx % 240 === 0 ? '#ea580c' : '#1d4ed8'}
              stroke="#0f172a"
              strokeWidth="0.5"
            />
          );
        })}

        {/* 30-Yard Inner Fielding Restriction Circle */}
        <ellipse
          cx="400"
          cy="330"
          rx="310"
          ry="170"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeDasharray="6,8"
          opacity="0.22"
        />

        {/* 3. CRICKET PITCH (Perspective Trapezoid from bowling crease at y=175 to batting crease at y=445) */}
        <polygon
          points="372,175 428,175 496,445 304,445"
          fill="url(#pitchGrad)"
          stroke="#785328"
          strokeWidth="1.2"
        />

        {/* --- DYNAMIC VISUAL PITCH WEAR & TRACK DEGRADATION LAYERS --- */}

        {/* A. Pitch Surface Darkening Overlay (Gradually turns darker & drier as overs progress) */}
        <polygon
          points="372,175 428,175 496,445 304,445"
          fill="#2d1d0c"
          opacity={0.05 + pitchWearFactor * 0.48}
        />

        {/* B. Central Running Runner Track Wear (drier, darker center strip from foot traffic) */}
        <polygon
          points="388,175 412,175 420,445 380,445"
          fill="#1b1005"
          opacity={pitchWearFactor * 0.42}
        />

        {/* C. Bowlers' Footmarks & Roughs (Top Bowler End: y=195-220 & Bottom Striker End: y=415-435) */}
        {/* Top Bowler End Landing Roughs */}
        <ellipse
          cx="380"
          cy="205"
          rx={5 + pitchWearFactor * 8}
          ry={2.5 + pitchWearFactor * 4}
          fill="#231407"
          opacity={0.12 + pitchWearFactor * 0.72}
        />
        <ellipse
          cx="378"
          cy="205"
          rx={3 + pitchWearFactor * 5}
          ry={1.5 + pitchWearFactor * 2.5}
          fill="#120902"
          opacity={pitchWearFactor * 0.85}
        />
        <ellipse
          cx="420"
          cy="205"
          rx={5 + pitchWearFactor * 8}
          ry={2.5 + pitchWearFactor * 4}
          fill="#231407"
          opacity={0.12 + pitchWearFactor * 0.72}
        />
        <ellipse
          cx="422"
          cy="205"
          rx={3 + pitchWearFactor * 5}
          ry={1.5 + pitchWearFactor * 2.5}
          fill="#120902"
          opacity={pitchWearFactor * 0.85}
        />

        {/* Bottom Striker End Popping Crease & Stance Footmark Roughs */}
        <ellipse
          cx="382"
          cy="424"
          rx={10 + pitchWearFactor * 14}
          ry={3.5 + pitchWearFactor * 5}
          fill="#211206"
          opacity={0.2 + pitchWearFactor * 0.7}
        />
        <ellipse
          cx="418"
          cy="424"
          rx={10 + pitchWearFactor * 14}
          ry={3.5 + pitchWearFactor * 5}
          fill="#211206"
          opacity={0.2 + pitchWearFactor * 0.7}
        />
        <ellipse
          cx="400"
          cy="428"
          rx={14 + pitchWearFactor * 16}
          ry={4 + pitchWearFactor * 5}
          fill="#190d04"
          opacity={0.2 + pitchWearFactor * 0.75}
        />

        {/* D. Pitch Surface Fissures & Cracks (Evolve visibly as over number increases) */}
        {/* 1. Main Center Fissure Crack */}
        <path
          d="M 398,185 Q 394,225 401,270 T 396,340 T 403,425"
          stroke="#120902"
          strokeWidth={0.8 + pitchWearFactor * 1.5}
          opacity={pitchWearFactor * 0.88}
          fill="none"
          strokeLinecap="round"
        />
        {/* 2. Off-Side Good Length Crack */}
        <path
          d="M 384,235 Q 380,275 387,315 L 382,355"
          stroke="#170c03"
          strokeWidth={0.7 + pitchWearFactor * 1.1}
          opacity={pitchWearFactor > 0.15 ? (pitchWearFactor - 0.15) * 1.15 : 0}
          fill="none"
          strokeLinecap="round"
        />
        {/* 3. Leg-Side Popping Crease Crack */}
        <path
          d="M 412,300 Q 418,340 409,395"
          stroke="#170c03"
          strokeWidth={0.7 + pitchWearFactor * 1.1}
          opacity={pitchWearFactor > 0.35 ? (pitchWearFactor - 0.35) * 1.25 : 0}
          fill="none"
          strokeLinecap="round"
        />
        {/* 4. Transverse Stress Micro-Cracks */}
        <g
          opacity={pitchWearFactor > 0.25 ? Math.min(1, (pitchWearFactor - 0.2) * 1.1) : 0}
          stroke="#170b03"
          strokeWidth="0.8"
          fill="none"
        >
          <line x1="388" y1="265" x2="408" y2="267" />
          <line x1="392" y1="330" x2="414" y2="328" />
          <line x1="378" y1="385" x2="404" y2="388" />
          <line x1="402" y1="215" x2="418" y2="217" />
        </g>

        {/* E. Pitching Spot Ball Impact Scuff Indentations */}
        <g opacity={0.15 + pitchWearFactor * 0.8}>
          <ellipse cx="395" cy="275" rx="6" ry="2.2" fill="#1d0e04" />
          <ellipse cx="408" cy="290" rx="8" ry="2.8" fill="#241206" />
          <ellipse cx="386" cy="305" rx="7" ry="2.5" fill="#1b0c03" />
          <ellipse cx="402" cy="320" rx="9" ry="3.0" fill="#291508" />
          <ellipse cx="392" cy="340" rx="7" ry="2.4" fill="#211005" />
        </g>

        {/* F. Pitch Soil Dust & Loose Gravel Specks */}
        {pitchWearFactor > 0.3 && (
          <g opacity={Math.min(1, (pitchWearFactor - 0.25) * 1.2)}>
            <circle cx="388" cy="285" r="1.2" fill="#8c6a43" />
            <circle cx="412" cy="310" r="1.4" fill="#8c6a43" />
            <circle cx="394" cy="360" r="1.2" fill="#7a5b39" />
            <circle cx="406" cy="240" r="1.4" fill="#7a5b39" />
            <circle cx="383" cy="410" r="1.5" fill="#684b2c" />
            <circle cx="417" cy="410" r="1.5" fill="#684b2c" />
          </g>
        )}

        {/* Crease Markings - Scaled & Perspective Corrected */}
        {/* Far End (Bowler's End) Markings */}
        <line x1="360" y1="176" x2="440" y2="176" stroke="#ffffff" strokeWidth="1.8" opacity="0.9" />
        <line x1="355" y1="183" x2="445" y2="183" stroke="#ffffff" strokeWidth="2.2" opacity="0.95" />
        <line x1="372" y1="168" x2="370" y2="188" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
        <line x1="428" y1="168" x2="430" y2="188" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
        {/* Bowler End Wide Lines */}
        <line x1="382" y1="176" x2="381" y2="183" stroke="#ffffff" strokeWidth="1" strokeDasharray="2,2" opacity="0.7" />
        <line x1="418" y1="176" x2="419" y2="183" stroke="#ffffff" strokeWidth="1" strokeDasharray="2,2" opacity="0.7" />

        {/* Striker's End Markings (Near End, Perspective Scaled) */}
        {/* Bowling Crease (passes through stumps at y=430) */}
        <line x1="308" y1="430" x2="492" y2="430" stroke="#ffffff" strokeWidth="2.2" opacity="0.85" />

        {/* Popping Crease (4ft in front at y=412, primary line for crease stays & stumpings) */}
        <line x1="265" y1="412" x2="535" y2="412" stroke="#ffffff" strokeWidth="3.2" opacity="0.95" />
        <line x1="265" y1="412" x2="535" y2="412" stroke="#f8fafc" strokeWidth="1" opacity="0.8" />

        {/* Return Creases (perpendicular to popping crease) */}
        <line x1="318" y1="400" x2="308" y2="445" stroke="#ffffff" strokeWidth="2.2" opacity="0.85" />
        <line x1="482" y1="400" x2="492" y2="445" stroke="#ffffff" strokeWidth="2.2" opacity="0.85" />

        {/* Off-Side & Leg-Side Wide Lines (Guidelines for Wide Ball Calls) */}
        {/* Off-side wide line (for Right-Hand Batter: x=338, for Left-Hand Batter: x=462) */}
        <line
          x1={isRightHanded ? 338 : 462}
          y1="412"
          x2={isRightHanded ? 332 : 432}
          y2="432"
          stroke="#fef08a"
          strokeWidth="2"
          strokeDasharray="4,3"
          opacity="0.95"
        />
        {/* Leg-side wide line */}
        <line
          x1={isRightHanded ? 455 : 345}
          y1="412"
          x2={isRightHanded ? 461 : 339}
          y2="432"
          stroke="#fef08a"
          strokeWidth="2"
          strokeDasharray="4,3"
          opacity="0.95"
        />
        {/* Wide Line Label Callout */}
        <text
          x={isRightHanded ? 336 : 464}
          y="408"
          textAnchor="middle"
          fill="#fef08a"
          fontSize="7"
          fontWeight="bold"
          fontFamily="sans-serif"
          opacity="0.9"
        >
          WIDE
        </text>

        {/* 4. HIT ZONE SWEET SPOT RING */}
        <ellipse
          cx="400"
          cy={hitZoneY}
          rx={hitZoneWidth / 2}
          ry={hitZoneHeight / 2}
          fill="none"
          stroke="#22c55e"
          strokeWidth="2.5"
          strokeDasharray="5,4"
          opacity={isApproaching ? 0.85 : 0.35}
          className={isApproaching ? 'animate-pulse' : ''}
        />
        <ellipse
          cx="400"
          cy={hitZoneY}
          rx="22"
          ry="8"
          fill="#22c55e"
          opacity={isApproaching ? 0.3 : 0.12}
        />

        {/* 5. FAR END BOWLER, MATCH UMPIRE & NON-STRIKER WICKETS */}
        {/* Non-Striker Wickets & Bails at Bowling Crease (y=176) */}
        <g opacity="0.9">
          <ellipse cx="400" cy="176" rx="7" ry="2.5" fill="#000000" opacity="0.35" />
          <line x1="397" y1="165" x2="397" y2="176" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" />
          <line x1="400" y1="165" x2="400" y2="176" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" />
          <line x1="403" y1="165" x2="403" y2="176" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" />
          <line x1="396" y1="164" x2="404" y2="164" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Realistic Match Umpire standing behind bowling crease with dynamic signalling */}
        <RealisticMatchUmpire
          x={422}
          y={168}
          scale={0.88}
          signalState={umpireSignal}
        />

        {/* Dynamic Animated Realistic Bowler */}
        <RealisticBowler
          x={currentBowlerX}
          y={currentBowlerY}
          scale={bowlerScale}
          bodyBob={bodyBob}
          isSpinner={isSpinner}
          leftLegAngle={leftLegAngle}
          rightLegAngle={rightLegAngle}
          torsoAngle={torsoAngle}
          leftArmAngle={leftArmAngle}
          rightArmAngle={rightArmAngle}
          showHeldBall={showHeldBall}
          heldBallOffset={heldBallOffset}
          shadowScale={shadowScale}
          primaryColor={opponentColors.primaryColor}
          secondaryColor={opponentColors.secondaryColor}
        />

        {/* 6. 9 REALISTIC ATHLETIC FIELDERS WITH DYNAMIC CATCHING / FIELDING ANIMATIONS & WICKET KEEPER */}
        <g id="fielding-team">
          {activeFielders.map((f) => {
            const isThisFielderActive = isExitActive && activeFielderId === f.id;
            const isCatch = isThisFielderActive && isCatchAttempt;
            const exitP = effectiveExitProgress;
            const isTakingCatch = isCatch && exitP >= 0.35;
            const hasCompletedCatch = isCatch && exitP >= 0.85;

            // Base position
            const baseFielderX = isRightHanded ? f.x : 800 - f.x;
            const baseFielderY = f.y;

            // 1. Alert Walk-In during Bowler Run-Up / Delivery (Fielders creeping forward on toes)
            const isAlertWalkIn = isRunUpActive || isBallInFlight;
            const walkInDistance = isRunUpActive
              ? Math.sin(Math.min(1, bowlerRunUpProgress || 0) * Math.PI) * 10
              : isBallInFlight
              ? Math.sin(Math.min(1, progress || 0) * Math.PI) * 7
              : 0;

            const walkInY = baseFielderY + (baseFielderY < 320 ? walkInDistance : walkInDistance * 0.4);

            // 2. Active Pursuit / Sprinting when ball is struck
            let currentX = baseFielderX;
            let currentY = walkInY;
            let isRunning = false;
            let runStridePhase = 0;
            let facingDirection: 1 | -1 = baseFielderX < 400 ? 1 : -1;

            if (isExitActive) {
              if (isThisFielderActive) {
                // Primary interceptor sprints towards the ball's landing point
                const targetInterceptX = exitBallX;
                const targetInterceptY = exitBallY;
                const sprintP = Math.min(1, exitP * 1.35);
                currentX = baseFielderX + (targetInterceptX - baseFielderX) * (sprintP * 0.68);
                currentY = baseFielderY + (targetInterceptY - baseFielderY) * (sprintP * 0.68);
                isRunning = exitP < 0.93;
                runStridePhase = (exitP * 8) % 1;
                facingDirection = targetInterceptX >= baseFielderX ? 1 : -1;
              } else {
                // Surrounding fielders react and back up towards the ball
                const angleToBall = Math.atan2(exitBallY - baseFielderY, exitBallX - baseFielderX);
                const backupDist = Math.min(18, exitP * 16);
                currentX = baseFielderX + Math.cos(angleToBall) * backupDist;
                currentY = baseFielderY + Math.sin(angleToBall) * backupDist;
                isRunning = exitP > 0.12 && exitP < 0.78;
                runStridePhase = (exitP * 5) % 1;
                facingDirection = exitBallX >= baseFielderX ? 1 : -1;
              }
            }

            // Uniform realistic human scale for every outfield fielder: 0.88
            const uniformScale = 0.88;

            return (
              <RealisticFielder
                key={f.id}
                x={currentX}
                y={currentY}
                scale={uniformScale}
                name={f.name}
                isTakingCatch={isTakingCatch}
                hasCompletedCatch={hasCompletedCatch}
                isRunning={isRunning}
                runStridePhase={runStridePhase}
                isAlertWalkIn={isAlertWalkIn}
                facingDirection={facingDirection}
                primaryColor={opponentColors.primaryColor}
                secondaryColor={opponentColors.secondaryColor}
              />
            );
          })}

          {/* REALISTIC WICKET KEEPER BEHIND STUMPS */}
          {(() => {
            const isKeeperActive = isExitActive && activeFielderId === 'keeper';
            const exitP = effectiveExitProgress;
            const isKeeperCatch = isKeeperActive && isCatchAttempt && exitP >= 0.35;
            const hasKeeperCaught = isKeeperActive && isCatchAttempt && exitP >= 0.85;

            return (
              <RealisticWicketKeeper
                x={isRightHanded ? 435 : 365}
                y={435}
                scale={1.02}
                isRightHanded={isRightHanded}
                isCatch={isKeeperCatch}
                hasCaught={hasKeeperCaught}
                primaryColor={opponentColors.primaryColor}
                secondaryColor={opponentColors.secondaryColor}
              />
            );
          })()}
        </g>

        {/* 6. NEAR END WICKETS (3D Wood Stumps & Smart LED Zing Light-Up Bails at y=430) */}
        {batterAnimationState === 'BOWLED' ? (
          <g transform="translate(400, 430)">
            {/* Ground Base Shadow */}
            <ellipse cx="0" cy="4" rx="22" ry="6" fill="#000000" opacity="0.45" />

            {/* Red LED Zing Glow Burst on Bowled Hit */}
            <circle cx="0" cy="-20" r="30" fill="url(#catchBurst)" className="animate-ping" />

            {/* Off Stump (Knocked sideways) */}
            <g transform="translate(-10, 0) rotate(-35)">
              <rect x="-2" y="-36" width="4" height="38" rx="1.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
              <rect x="-2.5" y="-38" width="5" height="4" rx="1" fill="#ef4444" className="animate-pulse" />
            </g>

            {/* Middle Stump (Cartwheeling back) */}
            <g transform="translate(0, 0) rotate(22)">
              <rect x="-2" y="-36" width="4" height="38" rx="1.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
              <rect x="-2.5" y="-38" width="5" height="4" rx="1" fill="#ef4444" className="animate-pulse" />
            </g>

            {/* Leg Stump (Tilted right) */}
            <g transform="translate(10, 0) rotate(14)">
              <rect x="-2" y="-36" width="4" height="38" rx="1.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
              <rect x="-2.5" y="-38" width="5" height="4" rx="1" fill="#ef4444" className="animate-pulse" />
            </g>

            {/* Flying LED Zing Bails */}
            <g transform="translate(-16, -58) rotate(-45)">
              <rect x="-6" y="-1.5" width="12" height="3" rx="1" fill="#ef4444" stroke="#ffffff" strokeWidth="0.8" className="animate-bounce" />
            </g>
            <g transform="translate(14, -52) rotate(35)">
              <rect x="-6" y="-1.5" width="12" height="3" rx="1" fill="#ef4444" stroke="#ffffff" strokeWidth="0.8" className="animate-bounce" />
            </g>
          </g>
        ) : (
          <g transform="translate(400, 430)">
            {/* Ground Base Shadow */}
            <ellipse cx="0" cy="4" rx="18" ry="5" fill="#000000" opacity="0.4" />

            {/* Brass Socket Bases */}
            <rect x="-11" y="0" width="4" height="3" rx="1" fill="#92400e" />
            <rect x="-2" y="0" width="4" height="3" rx="1" fill="#92400e" />
            <rect x="7" y="0" width="4" height="3" rx="1" fill="#92400e" />

            {/* 3 Stumps: Off, Middle, Leg */}
            <rect x="-11" y="-36" width="4" height="36" rx="1.5" fill="url(#pitchGrad)" stroke="#78350f" strokeWidth="0.8" />
            <rect x="-2" y="-36" width="4" height="36" rx="1.5" fill="url(#pitchGrad)" stroke="#78350f" strokeWidth="0.8" />
            <rect x="7" y="-36" width="4" height="36" rx="1.5" fill="url(#pitchGrad)" stroke="#78350f" strokeWidth="0.8" />

            {/* Zing LED Cap Light Strips on top of stumps */}
            <rect x="-11" y="-38" width="4" height="2.5" rx="0.5" fill={isWicketCelebration ? '#ef4444' : '#fcd34d'} />
            <rect x="-2" y="-38" width="4" height="2.5" rx="0.5" fill={isWicketCelebration ? '#ef4444' : '#fcd34d'} />
            <rect x="7" y="-38" width="4" height="2.5" rx="0.5" fill={isWicketCelebration ? '#ef4444' : '#fcd34d'} />

            {/* 2 Bails across stumps */}
            <rect x="-11" y="-39.5" width="8" height="2" rx="0.8" fill={isWicketCelebration ? '#ef4444' : '#fef08a'} stroke="#92400e" strokeWidth="0.5" />
            <rect x="-1" y="-39.5" width="8" height="2" rx="0.8" fill={isWicketCelebration ? '#ef4444' : '#fef08a'} stroke="#92400e" strokeWidth="0.5" />
          </g>
        )}

        {/* 7. APPROACHING BALL */}
        {isApproaching && (
          <g>
            {/* Ground shadow */}
            <ellipse
              cx={ballX}
              cy={ballShadowY}
              rx={ballRadius * 0.9}
              ry={ballRadius * 0.35}
              fill="#000000"
              opacity="0.45"
            />
            {/* The Cricket Ball */}
            <circle
              cx={ballX}
              cy={ballY}
              r={ballRadius}
              fill="url(#cricketBallGrad)"
              stroke="#ffffff"
              strokeWidth={ballRadius > 8 ? 1.5 : 0.8}
            />
            {/* Seam revolutions */}
            {ballRadius > 5 && (
              <g transform={`rotate(${progress * (isSpinner ? 720 : 360)} ${ballX} ${ballY})`}>
                <line
                  x1={ballX - ballRadius * 0.7}
                  y1={ballY}
                  x2={ballX + ballRadius * 0.7}
                  y2={ballY}
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  strokeDasharray={isSpinner ? "2,2" : "3,1"}
                  opacity="0.85"
                />
              </g>
            )}

            {/* Dynamic Pitch Turf Impact Puff & Mark at Bounce Point */}
            {currentDelivery && progress >= currentDelivery.bounceRatio - 0.04 && progress <= currentDelivery.bounceRatio + 0.18 && (() => {
              const bRatio = currentDelivery.bounceRatio;
              const bGroundY = bowlerY + (battingCreaseY - bowlerY) * bRatio;
              const bGroundX = bowlerX + (targetX - bowlerX) * bRatio;
              const puffFade = 1 - (progress - (bRatio - 0.04)) / 0.22;
              return (
                <g>
                  {/* Pitch surface indent mark */}
                  <ellipse cx={bGroundX} cy={bGroundY} rx={7} ry={3} fill="#5c3818" opacity={0.65 * puffFade} />
                  {/* Expanding turf chalk / dust particle puff */}
                  <ellipse
                    cx={bGroundX}
                    cy={bGroundY - 3}
                    rx={10 + (1 - puffFade) * 14}
                    ry={4 + (1 - puffFade) * 6}
                    fill="url(#turfDustGrad)"
                    opacity={0.85 * puffFade}
                  />
                </g>
              );
            })()}
          </g>
        )}

        {/* 8. POST-HIT EXIT BALL TRAJECTORY & DYNAMIC SMOKE PLUME FOR BOUNDARIES */}
        {isExitActive && exitBallState && (() => {
          const ep = effectiveExitProgress;
          const sX = exitBallState.startX || 400;
          const sY = exitBallState.startY || 420;
          const isSix = exitBallState.outcome.boundaryType === 'SIX';
          const isFour = exitBallState.outcome.boundaryType === 'FOUR';

          return (
            <g id="exit-ball-trajectory">
              {/* Bat-Ball Sweet-Spot Impact Flash & Shockwave at Point of Contact */}
              {ep < 0.35 && (
                <g id="bat-ball-impact">
                  {/* Expanding sonic shockwave ring */}
                  <circle
                    cx={sX}
                    cy={sY}
                    r={8 + ep * 80}
                    fill="none"
                    stroke={isSix ? '#fbbf24' : '#ffffff'}
                    strokeWidth={Math.max(0.5, 3.5 * (1 - ep / 0.35))}
                    opacity={1 - ep / 0.35}
                  />
                  {/* Radial Impact Sparks */}
                  <circle
                    cx={sX}
                    cy={sY}
                    r={18 * (1 - ep / 0.35)}
                    fill="url(#hitSparkGrad)"
                    opacity={0.95 * (1 - ep / 0.35)}
                  />
                  {/* High energy cross sparks */}
                  {[-1, 1].map((dir) => (
                    <line
                      key={dir}
                      x1={sX - dir * 14 * (1 - ep / 0.35)}
                      y1={sY - 14 * (1 - ep / 0.35)}
                      x2={sX + dir * 14 * (1 - ep / 0.35)}
                      y2={sY + 14 * (1 - ep / 0.35)}
                      stroke="#ffffff"
                      strokeWidth={1.8}
                      opacity={1 - ep / 0.35}
                    />
                  ))}
                </g>
              )}

              {/* Billowing Smoke Plume Effect trailing the ball ONLY during boundaries / sixes */}
              {(isSix || isFour) && (
                <g id="ball-smoke-plume">
                  {exitTrailPoints.map((pt, idx) => {
                    const ratio = idx / Math.max(1, exitTrailPoints.length);
                    const puffR = exitBallRadius * (1.1 + ratio * 2.2);
                    const puffAlpha = Math.max(0.08, (1 - ratio) * 0.72);
                    return (
                      <g key={idx}>
                        <circle
                          cx={pt.x + Math.sin(idx * 2.3) * 2.5}
                          cy={pt.y + Math.cos(idx * 1.7) * 1.5}
                          r={puffR}
                          fill={isSix ? 'url(#sixSmokePuffGrad)' : 'url(#smokePuffGrad)'}
                          opacity={puffAlpha}
                        />
                        {idx % 2 === 0 && (
                          <circle
                            cx={pt.x - 2 + Math.sin(idx * 1.2) * 2}
                            cy={pt.y - 2.5}
                            r={puffR * 0.72}
                            fill={isSix ? 'url(#sixSmokePuffGrad)' : 'url(#smokePuffGrad)'}
                            opacity={puffAlpha * 0.65}
                          />
                        )}
                      </g>
                    );
                  })}
                </g>
              )}

              {/* Ground Shadow */}
              <ellipse
                cx={exitBallX}
                cy={exitShadowY}
                rx={exitBallRadius * 0.85}
                ry={exitBallRadius * 0.3}
                fill="#000000"
                opacity="0.5"
              />

              {/* Exit Cricket Ball */}
              <circle
                cx={exitBallX}
                cy={exitBallY}
                r={exitBallRadius}
                fill="url(#cricketBallGrad)"
                stroke="#ffffff"
                strokeWidth={exitBallRadius > 8 ? 2 : 1}
              />

              {/* Glowing Aura for Boundary Sixes */}
              {isSix && (
                <circle
                  cx={exitBallX}
                  cy={exitBallY}
                  r={exitBallRadius * 1.6}
                  fill="#f59e0b"
                  opacity="0.35"
                  className="animate-pulse"
                />
              )}
            </g>
          );
        })()}

        {/* 9. REALISTIC 3D BATSMAN */}
        <RealisticBatsman
          isRightHanded={isRightHanded}
          batterArchetype={gameState?.config?.batterArchetype || 'CLASSICAL'}
          animationState={batterAnimationState}
          isRunUpActive={isRunUpActive}
          teamPrimaryColor={playerColors.primaryColor}
          teamSecondaryColor={playerColors.secondaryColor}
          teamAccentColor={playerColors.accentColor}
        />
      </svg>

      {/* BIG ON-HIT GRAPHICS OVERLAY */}
      {showHitFeedback && lastOutcome && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          {lastOutcome.boundaryType === 'SIX' && (
            <div className="flex flex-col items-center animate-bounce">
              <div className={`bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-russo italic tracking-wider rounded-2xl border-4 border-white shadow-[0_0_50px_rgba(236,72,153,0.8)] scale-110 ${
                compact ? 'px-4 py-1.5 text-2xl sm:text-4xl' : 'px-8 py-3 text-4xl md:text-6xl'
              }`}>
                MAXIMUM 6!
              </div>
              {lastOutcome.hitDistanceMeters && (
                <div className={`mt-1 bg-slate-900/90 text-amber-300 font-sports tracking-widest rounded-full border border-amber-400 ${
                  compact ? 'px-3 py-0.5 text-xs sm:text-sm' : 'px-4 py-1 text-lg md:text-xl'
                }`}>
                  {lastOutcome.hitDistanceMeters} METRES
                </div>
              )}
            </div>
          )}

          {lastOutcome.boundaryType === 'FOUR' && (
            <div className="flex flex-col items-center animate-pulse">
              <div className={`bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-russo italic tracking-wider rounded-2xl border-4 border-white shadow-[0_0_40px_rgba(245,158,11,0.8)] ${
                compact ? 'px-4 py-1.5 text-2xl sm:text-4xl' : 'px-8 py-3 text-4xl md:text-6xl'
              }`}>
                CRACKING 4!
              </div>
            </div>
          )}

          {lastOutcome.isWicket && (
            <div className="flex flex-col items-center animate-pulse">
              <div className={`bg-gradient-to-r from-rose-700 via-red-600 to-rose-900 text-white font-russo italic tracking-wider rounded-2xl border-4 border-white shadow-[0_0_50px_rgba(225,29,72,0.9)] ${
                compact ? 'px-4 py-1.5 text-2xl sm:text-4xl' : 'px-8 py-3 text-4xl md:text-6xl'
              }`}>
                {lastOutcome.wicketType === 'CAUGHT' ? 'CAUGHT OUT!' : lastOutcome.wicketType === 'EDGED_BEHIND' ? 'EDGED & TAKEN!' : 'OUT!'}
              </div>
              <div className={`mt-1 bg-slate-950 text-rose-300 font-sports tracking-widest rounded-full border border-rose-600 ${
                compact ? 'px-3 py-0.5 text-sm' : 'px-4 py-1 text-base md:text-lg'
              }`}>
                {lastOutcome.wicketType?.replace('_', ' ') || 'WICKET'}
              </div>
            </div>
          )}

          {lastOutcome.isWide && (
            <div className="flex flex-col items-center animate-bounce">
              <div className={`bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 text-slate-950 font-russo italic tracking-wider rounded-2xl border-4 border-white shadow-[0_0_40px_rgba(234,179,8,0.9)] ${
                compact ? 'px-4 py-1.5 text-2xl sm:text-4xl' : 'px-8 py-3 text-4xl md:text-5xl'
              }`}>
                WIDE BALL (+1)
              </div>
              <div className={`mt-1 bg-slate-950 text-amber-300 font-sports tracking-widest rounded-full border border-amber-400 ${
                compact ? 'px-3 py-0.5 text-sm' : 'px-4 py-1 text-base md:text-lg'
              }`}>
                EXTRA RUN • RE-BOWL DELIVERY
              </div>
            </div>
          )}

          {!lastOutcome.isWicket && !lastOutcome.boundaryType && !lastOutcome.isWide && (
            <div className={`bg-slate-900/95 text-slate-100 font-russo italic tracking-wider rounded-xl border border-slate-700 shadow-xl ${
              compact ? 'px-4 py-1.5 text-lg sm:text-2xl' : 'px-6 py-2 text-2xl md:text-3xl'
            }`}>
              {lastOutcome.runs === 0 ? 'DOT BALL' : `${lastOutcome.runs} RUN${lastOutcome.runs > 1 ? 'S' : ''}`}
            </div>
          )}
        </div>
      )}

      {/* Bowler Run-Up Pre-Delivery Immersion Banner */}
      {isRunUpActive && currentDelivery && (
        <div className={`absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-200 ${
          compact ? 'top-2' : 'top-3.5'
        }`}>
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-amber-400/60 shadow-lg shadow-slate-950/80 animate-pulse">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-white font-black text-[11px] tracking-wide uppercase">
              BOWLER
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/25 text-amber-300 font-mono font-bold uppercase tracking-tight">
              {currentDelivery.bowlerStyle.replace('_', ' ')}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              RUNNING IN...
            </span>
          </div>
        </div>
      )}

      {/* Delivery HUD Badge */}
      {currentDelivery && (
        <div className={`absolute bg-slate-900/85 rounded-xl border border-slate-700 flex items-center gap-2 text-slate-200 shadow-lg pointer-events-none ${
          compact ? 'top-2 left-2 px-2.5 py-1 text-[10px]' : 'top-4 left-4 px-3 py-1.5 text-xs'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isSpinner ? 'bg-amber-400' : 'bg-emerald-400'} animate-ping`} />
          <span className="font-mono font-bold text-amber-400">{currentDelivery.speedKmh} km/h</span>
          <span className="text-slate-500">•</span>
          {isSpinner ? (
            <span className="font-semibold text-emerald-300 flex items-center gap-1">
              <span>{currentDelivery.bowlerStyle === 'OFF_SPINNER' ? 'Off-Spin' : currentDelivery.bowlerStyle === 'LEG_SPINNER' ? 'Leg-Spin' : 'Mystery Spin'}</span>
              {currentDelivery.spinVariationName && (
                <span className="text-amber-200 font-bold">({currentDelivery.spinVariationName})</span>
              )}
            </span>
          ) : (
            <span className="font-medium text-slate-300">
              {currentDelivery.bowlerStyle === 'MEDIUM_PACER' ? 'Med Pace' : 'Fast Pace'} • {currentDelivery.length.replace('_', ' ')}
            </span>
          )}
        </div>
      )}

      {/* Top-Right Broadcast Scoreboard & Controls */}
      <div className={`absolute z-30 flex flex-col items-end gap-1.5 ${
        compact ? 'top-2 right-2' : 'top-3 right-3'
      }`}>
        <div className="flex items-center gap-2">
          {gameState && (
            <div
              id="arena-top-right-scoreboard"
              className="bg-slate-950/95 border-2 border-slate-700/90 rounded-2xl px-3.5 py-1.5 shadow-2xl flex items-center gap-3.5 pointer-events-none ring-1 ring-amber-400/25"
            >
              {/* Massive Runs / Wickets */}
              <div className="flex flex-col items-start">
                <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 leading-tight">
                  {gameState.isPracticeMode ? 'NETS' : 'SCORE'}
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-3xl sm:text-4xl font-bold font-sports text-amber-400 leading-none drop-shadow tracking-wider">
                    {gameState.runs}
                  </span>
                  <span className="text-lg sm:text-xl font-bold font-sports text-slate-400 leading-none">
                    /{gameState.isPracticeMode ? `${gameState.wickets}w` : gameState.wickets}
                  </span>
                </div>
              </div>

              <div className="w-[1px] h-7 bg-slate-800" />

              {/* Overs */}
              <div className="flex flex-col items-start">
                <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 leading-tight">
                  OVERS
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl sm:text-3xl font-bold font-sports text-slate-100 leading-none tracking-wider">
                    {gameState.currentOver}.{gameState.ballInOver}
                  </span>
                  <span className="text-slate-500 text-sm font-bold font-sports">
                    /{typeof gameState.config.totalOvers === 'number' ? (gameState.config.totalOvers === 999 || gameState.config.totalOvers === 0 ? '∞' : gameState.config.totalOvers) : '5'}
                  </span>
                </div>
              </div>

              <div className="hidden md:block w-[1px] h-7 bg-slate-800" />

              {/* Pitch Wear HUD Badge */}
              <div
                className="hidden md:flex flex-col items-start px-2 py-0.5 rounded-lg bg-slate-900/90 border border-slate-800"
                title={`Track Condition: ${pitchWearLabel} (${Math.round(pitchWearFactor * 100)}% Wear across ${oversCompleted.toFixed(1)} overs)`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 leading-tight">
                    PITCH WEAR
                  </span>
                  <span className={`text-[9px] font-black px-1 rounded border leading-tight ${pitchWearBadgeStyle}`}>
                    {Math.round(pitchWearFactor * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-12 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${pitchWearBarColor}`}
                      style={{ width: `${Math.round(pitchWearFactor * 100)}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-slate-300 tracking-wider">
                    {pitchWearLabel}
                  </span>
                </div>
              </div>

              {/* Boundary Streak Flame Pill inside arena scoreboard */}
              {gameState.streakCount >= 2 && (
                <div className="hidden sm:flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow">
                  <Flame className="w-3 h-3 text-slate-950 fill-slate-950" />
                  <span>{gameState.streakCount}x</span>
                </div>
              )}
            </div>
          )}

          {/* Defensive / Loft Mode Toggle */}
          <button
            id="pitch-shot-mode-btn"
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleShotMode?.();
            }}
            className={`rounded-xl border flex items-center gap-1.5 text-xs shadow-xl cursor-pointer transition-all transform hover:scale-105 active:scale-95 select-none px-3 py-2 font-bold ${
              battingShotMode === 'LOFT'
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white border-rose-400 ring-2 ring-rose-400/50 shadow-rose-950/50'
                : 'bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-emerald-100 border-emerald-500 ring-1 ring-emerald-400/30'
            }`}
            title={
              battingShotMode === 'LOFT'
                ? 'Current Mode: LOFT (Big aerial shots, higher catch risk) — Click to switch to Defensive'
                : 'Current Mode: DEFENSIVE (Grounded shots, no aerial catch risk) — Click to switch to Loft'
            }
            aria-label="Toggle shot mode between Defensive and Loft"
          >
            {battingShotMode === 'LOFT' ? (
              <Rocket className="w-3.5 h-3.5 text-white" />
            ) : (
              <Shield className="w-3.5 h-3.5 text-emerald-200" />
            )}
            <span className="font-black uppercase text-[10px] tracking-wider">
              {battingShotMode === 'LOFT' ? 'LOFT' : 'DEFENSIVE'}
            </span>
          </button>

          {/* Batting Stance Quick Toggle */}
          <button
            id="pitch-stance-btn"
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleStance?.();
            }}
            className="bg-slate-900/90 hover:bg-slate-800 active:bg-slate-700 rounded-xl border border-slate-700 flex items-center gap-1.5 text-slate-200 shadow-xl cursor-pointer transition-all transform hover:scale-105 active:scale-95 select-none px-2.5 py-2 text-xs"
            title={`Current Stance: ${isRightHanded ? 'Right-Handed (RHB)' : 'Left-Handed (LHB)'} — Click to switch`}
            aria-label="Toggle batting stance"
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold uppercase text-[10px] tracking-wider text-slate-200">
              {isRightHanded ? 'RHB' : 'LHB'}
            </span>
          </button>

          {/* Pause / Resume Button */}
          <button
            id="pitch-pause-btn"
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onTogglePause?.();
            }}
            className="bg-slate-900/90 hover:bg-slate-800 active:bg-slate-700 rounded-xl border border-slate-700 flex items-center justify-center text-slate-200 shadow-xl cursor-pointer transition-all transform hover:scale-105 active:scale-95 select-none px-3 py-2 text-xs"
            title={isPaused ? 'Resume Game' : 'Pause Game'}
            aria-label="Pause or resume game"
          >
            {isPaused ? (
              <Play className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ) : (
              <Pause className="w-3.5 h-3.5 text-amber-400" />
            )}
          </button>
        </div>

        {/* While chasing: Target score visible under the scorecard on the game screen */}
        {gameState && gameState.config.target !== undefined && !gameState.isPracticeMode && (() => {
          const target = gameState.config.target;
          const runsNeeded = Math.max(0, target - gameState.runs);
          const totalBalls = (typeof gameState.config.totalOvers === 'number' && gameState.config.totalOvers > 0 && gameState.config.totalOvers < 999)
            ? gameState.config.totalOvers * 6
            : 30;
          const ballsBowled = gameState.currentOver * 6 + gameState.ballInOver;
          const ballsRemaining = Math.max(0, totalBalls - ballsBowled);
          const rrr = ballsRemaining > 0 ? ((runsNeeded / ballsRemaining) * 6).toFixed(2) : '0.00';
          const isChasingAchieved = gameState.runs >= target;

          return (
            <div
              id="arena-target-scorecard-banner"
              className="bg-slate-950/95 border border-amber-500/70 rounded-xl px-3 py-1 shadow-2xl flex items-center gap-2 pointer-events-none text-xs ring-1 ring-amber-400/30 animate-fade-in"
            >
              <div className="flex items-center gap-1.5 font-bold">
                <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded text-[10px] uppercase font-black tracking-wider">
                  TARGET {target}
                </span>
                {isChasingAchieved ? (
                  <span className="text-emerald-400 font-black flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Target Reached!</span>
                  </span>
                ) : (
                  <span className="text-slate-200 text-[11px] font-bold">
                    Need <strong className="text-amber-300 font-black">{runsNeeded}</strong> off <strong className="text-white font-black">{ballsRemaining}b</strong>
                  </span>
                )}
              </div>
              {!isChasingAchieved && (
                <>
                  <span className="text-slate-600 font-bold">•</span>
                  <span className="text-rose-300 font-mono font-bold text-[10px] bg-rose-950/60 px-1.5 py-0.2 rounded border border-rose-800/60">
                    RRR {rrr}
                  </span>
                </>
              )}
            </div>
          );
        })()}
      </div>

    </div>
  );
};

export const PitchCanvas = React.memo(PitchCanvasComponent);
