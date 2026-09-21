import { BallDelivery, BowlerFilter, BowlerStyle, DeliveryLength, DeliveryLine, WeatherCondition } from '../types';
import { WEATHER_PHYSICS_PROFILES } from '../config/weatherPhysics';

export interface BowlingGeneratorOptions {
  overIndex: number;      // 0-indexed over (0 = 1st over)
  ballInOver: number;     // 0 to 5
  totalOvers?: number;
  difficulty?: 'CASUAL' | 'PRO' | 'CHAMPION';
  weatherCondition?: WeatherCondition;
  preferredBowler?: BowlerFilter;
  rng?: () => number;    // Optional deterministic random generator for testing
}

/**
 * Bowling Generator - generates delivery line, length, speed, style, spin break, and duration.
 * Difficulty scales dynamically as overs progress with varied pace attacks and cunning spin variations.
 */
export function generateDelivery(options: BowlingGeneratorOptions): BallDelivery {
  const {
    overIndex,
    ballInOver,
    totalOvers,
    difficulty = 'PRO',
    weatherCondition = 'SUNNY',
    preferredBowler = 'AUTO',
    rng = Math.random,
  } = options;

  const difficultySpeedBonus = difficulty === 'CASUAL' ? -8 : difficulty === 'CHAMPION' ? 6 : 0;
  const overProgressRatio = Math.min(1, overIndex / 4); // 0 to 1 across first 5 overs

  // Pick bowler style based on preference or standard match over rotation:
  let bowlerStyle: BowlerStyle = 'FAST';

  if (preferredBowler === 'OFF_SPIN') {
    bowlerStyle = 'OFF_SPINNER';
  } else if (preferredBowler === 'LEG_SPIN') {
    bowlerStyle = 'LEG_SPINNER';
  } else if (preferredBowler === 'MYSTERY_SPIN') {
    bowlerStyle = 'MYSTERY_SPINNER';
  } else if (preferredBowler === 'MEDIUM_PACE') {
    bowlerStyle = 'MEDIUM_PACER';
  } else if (preferredBowler === 'PACER') {
    bowlerStyle = 'FAST';
  } else {
    // AUTO match over rotation:
    // Cycles bowler spell variety smoothly across 5, 10, 15, 20 or unlimited overs:
    // 0: Medium Pacer (Opening swing/seam)
    // 1: Express Fast Bowler (Powerplay pace)
    // 2: Off-Spinner (Finger spin trap)
    // 3: Leg-Spinner (Wrist spin & Googly)
    // 4: Mystery Spinner or Death Yorker Pacer
    const cycle = overIndex % 5;
    if (cycle === 0) {
      bowlerStyle = 'MEDIUM_PACER';
    } else if (cycle === 1) {
      bowlerStyle = 'FAST';
    } else if (cycle === 2) {
      bowlerStyle = 'OFF_SPINNER';
    } else if (cycle === 3) {
      bowlerStyle = 'LEG_SPINNER';
    } else {
      bowlerStyle = rng() > 0.4 ? 'MYSTERY_SPINNER' : 'FAST';
    }
  }

  const isSpinner =
    bowlerStyle === 'OFF_SPINNER' ||
    bowlerStyle === 'LEG_SPINNER' ||
    bowlerStyle === 'MYSTERY_SPINNER';

  // Base speed in km/h based on style
  let speedKmh: number;
  let spinVariationName = '';
  let spinTurnPixels = 0;
  let spinOrSwing = 0;

  if (isSpinner) {
    // Spin variation determination
    const spinVarRoll = rng();

    if (bowlerStyle === 'OFF_SPINNER') {
      if (spinVarRoll < 0.55) {
        spinVariationName = 'Off-Break';
        speedKmh = Math.round(82 + rng() * 6 + difficultySpeedBonus * 0.4);
        spinOrSwing = -0.35 - rng() * 0.25; // drift to off
        spinTurnPixels = 32 + rng() * 14;   // bite & sharp turn in towards right-hander
      } else if (spinVarRoll < 0.80) {
        spinVariationName = 'Doosra';
        speedKmh = Math.round(84 + rng() * 6 + difficultySpeedBonus * 0.4);
        spinOrSwing = 0.25 + rng() * 0.25;
        spinTurnPixels = -28 - rng() * 12;  // mystery turn away to slips
      } else if (spinVarRoll < 0.92) {
        spinVariationName = 'Arm Ball';
        speedKmh = Math.round(94 + rng() * 6 + difficultySpeedBonus * 0.5); // faster, skids on
        spinOrSwing = -0.15;
        spinTurnPixels = 4; // skids straight through with the angle
      } else {
        spinVariationName = 'Top-Spinner';
        speedKmh = Math.round(88 + rng() * 5 + difficultySpeedBonus * 0.4);
        spinOrSwing = 0;
        spinTurnPixels = 0;
      }
    } else if (bowlerStyle === 'LEG_SPINNER') {
      if (spinVarRoll < 0.55) {
        spinVariationName = 'Leg-Break';
        speedKmh = Math.round(79 + rng() * 7 + difficultySpeedBonus * 0.4);
        spinOrSwing = -0.3; // drift in to middle
        spinTurnPixels = -36 - rng() * 14; // big turn away to off-side
      } else if (spinVarRoll < 0.80) {
        spinVariationName = "Googly (Wrong'un)";
        speedKmh = Math.round(83 + rng() * 6 + difficultySpeedBonus * 0.4);
        spinOrSwing = 0.3;
        spinTurnPixels = 34 + rng() * 12; // turns back in through the gate!
      } else if (spinVarRoll < 0.92) {
        spinVariationName = 'Flipper';
        speedKmh = Math.round(92 + rng() * 5 + difficultySpeedBonus * 0.5); // quick skidding bounce
        spinOrSwing = 0;
        spinTurnPixels = -6;
      } else {
        spinVariationName = 'Top-Spinner';
        speedKmh = Math.round(86 + rng() * 6 + difficultySpeedBonus * 0.4);
        spinOrSwing = 0;
        spinTurnPixels = 0;
      }
    } else {
      // MYSTERY_SPINNER
      if (spinVarRoll < 0.4) {
        spinVariationName = 'Carrom Ball';
        speedKmh = Math.round(86 + rng() * 7);
        spinTurnPixels = -30 - rng() * 12;
      } else if (spinVarRoll < 0.75) {
        spinVariationName = 'Mystery Slider';
        speedKmh = Math.round(90 + rng() * 6);
        spinTurnPixels = 26 + rng() * 10;
      } else {
        spinVariationName = 'Knuckle Spin';
        speedKmh = Math.round(76 + rng() * 8);
        spinTurnPixels = rng() > 0.5 ? 30 : -30;
      }
      spinOrSwing = (rng() - 0.5) * 0.6;
    }
  } else if (bowlerStyle === 'MEDIUM_PACER') {
    speedKmh = Math.round(118 + rng() * 10 + difficultySpeedBonus);
    spinOrSwing = (rng() - 0.5) * 0.35;
    spinTurnPixels = (rng() - 0.5) * 8;
  } else {
    // Fast bowler
    const minSpeed = 126 + overProgressRatio * 14;
    const speedVariation = rng() * 10;
    speedKmh = Math.round(minSpeed + speedVariation + difficultySpeedBonus);
    spinOrSwing = (rng() - 0.5) * (0.3 + overProgressRatio * 0.3);
    spinTurnPixels = (rng() - 0.5) * 10;
  }

  // Length distribution shifts for spinners vs pacers
  const lengthRoll = rng();
  let length: DeliveryLength;

  if (isSpinner) {
    if (lengthRoll < 0.22) length = 'FULL';
    else if (lengthRoll < 0.72) length = 'GOOD_LENGTH';
    else if (lengthRoll < 0.90) length = 'SHORT';
    else length = 'FULL_TOSS';
  } else {
    const yorkerChance = 0.08 + overProgressRatio * 0.28;
    const bouncerChance = 0.08 + overProgressRatio * 0.22;

    if (lengthRoll < yorkerChance) {
      length = 'YORKER';
    } else if (lengthRoll < yorkerChance + bouncerChance) {
      length = 'BOUNCER';
    } else if (lengthRoll < 0.55) {
      length = 'GOOD_LENGTH';
    } else if (lengthRoll < 0.80) {
      length = 'FULL';
    } else if (lengthRoll < 0.94) {
      length = 'SHORT';
    } else {
      length = 'FULL_TOSS';
    }
  }

  // Line distribution
  const lineRoll = rng();
  let line: DeliveryLine;

  if (isSpinner) {
    if (bowlerStyle === 'OFF_SPINNER') {
      if (lineRoll < 0.45) line = 'OUTSIDE_OFF';
      else if (lineRoll < 0.75) line = 'MIDDLE_OFF';
      else if (lineRoll < 0.90) line = 'WIDE_OUTSIDE_OFF';
      else line = 'MIDDLE';
    } else if (bowlerStyle === 'LEG_SPINNER') {
      if (lineRoll < 0.40) line = 'MIDDLE';
      else if (lineRoll < 0.70) line = 'LEG';
      else if (lineRoll < 0.90) line = 'MIDDLE_OFF';
      else line = 'OUTSIDE_OFF';
    } else {
      if (lineRoll < 0.35) line = 'MIDDLE_OFF';
      else if (lineRoll < 0.70) line = 'OUTSIDE_OFF';
      else line = 'MIDDLE';
    }
  } else if (overIndex === 0) {
    if (lineRoll < 0.35) line = 'MIDDLE';
    else if (lineRoll < 0.70) line = 'MIDDLE_OFF';
    else if (lineRoll < 0.90) line = 'OUTSIDE_OFF';
    else line = 'LEG';
  } else {
    if (lineRoll < 0.25) line = 'MIDDLE';
    else if (lineRoll < 0.55) line = 'OUTSIDE_OFF';
    else if (lineRoll < 0.75) line = 'MIDDLE_OFF';
    else if (lineRoll < 0.90) line = 'LEG';
    else line = 'WIDE_OUTSIDE_OFF';
  }

  // Apply Atmospheric & Pitch Dynamic Weather Physics
  const weatherProfile = WEATHER_PHYSICS_PROFILES[weatherCondition] || WEATHER_PHYSICS_PROFILES.SUNNY;

  // 1. Modulate Release Speed
  speedKmh = Math.round(speedKmh + weatherProfile.speedDeltaKmh);

  // 2. Modulate Swing Drift (in air) & Seam / Spin Break (off pitch)
  // Calculate track pitch wear factor (0.0 fresh to 1.0 heavily degraded)
  const pitchWearMaxOvers = totalOvers && totalOvers > 0 ? Math.max(totalOvers, 5) : 20;
  const currentOversElapsed = overIndex + ballInOver / 6;
  const pitchWearRatio = Math.min(1.0, Math.max(0, currentOversElapsed / pitchWearMaxOvers));

  if (isSpinner) {
    // Spinners: grip and turn off turf modified by weather & pitch wear (footmarks & cracks boost turn up to +35%)
    spinTurnPixels *= weatherProfile.spinTurnMultiplier * (1 + pitchWearRatio * 0.35);
    spinOrSwing *= weatherProfile.swingMultiplier * 0.7 + 0.3; // subtle atmospheric drift
  } else {
    // Fast & Medium Pace: atmospheric humidity modifies swing; worn cracked turf increases seam deviation (+20%)
    spinOrSwing *= weatherProfile.swingMultiplier;
    spinTurnPixels *= weatherProfile.seamMultiplier * (1 + pitchWearRatio * 0.20);
  }

  // Calculate flight duration in milliseconds
  // Spinners have higher flight time (1200ms - 1500ms) with air loop!
  let baseFlightMs = (120000 / speedKmh) * weatherProfile.flightDurationMultiplier;
  if (isSpinner) {
    baseFlightMs *= 1.08; // looping flight in the air
  } else if (length === 'YORKER') {
    baseFlightMs *= 0.95;
  } else if (length === 'BOUNCER') {
    baseFlightMs *= 1.04;
  }
  const flightDurationMs = Math.round(baseFlightMs);

  // Pitch bounce point ratio (0 = bowler hand release, 1 = batting crease)
  let bounceRatio = 0.62;
  switch (length) {
    case 'YORKER':
      bounceRatio = 0.88 + rng() * 0.05;
      break;
    case 'FULL':
      bounceRatio = isSpinner ? 0.70 + rng() * 0.05 : 0.74 + rng() * 0.06;
      break;
    case 'GOOD_LENGTH':
      bounceRatio = isSpinner ? 0.56 + rng() * 0.06 : 0.60 + rng() * 0.07;
      break;
    case 'SHORT':
      bounceRatio = 0.44 + rng() * 0.06;
      break;
    case 'BOUNCER':
      bounceRatio = 0.34 + rng() * 0.05;
      break;
    case 'FULL_TOSS':
      bounceRatio = 0.98;
      break;
  }

  // Under wet drizzle conditions, ball skids slightly further before pitching
  if (weatherCondition === 'RAIN' && length !== 'FULL_TOSS') {
    bounceRatio = Math.min(0.92, bounceRatio + 0.02);
  }

  // Human-readable delivery description label
  const lengthNames: Record<DeliveryLength, string> = {
    YORKER: 'Yorker',
    FULL: 'Full',
    GOOD_LENGTH: 'Good Length',
    SHORT: 'Short Ball',
    BOUNCER: 'Bouncer',
    FULL_TOSS: 'Full Toss',
  };

  const lineNames: Record<DeliveryLine, string> = {
    WIDE_OUTSIDE_OFF: 'Wide Off',
    OUTSIDE_OFF: 'Outside Off',
    MIDDLE_OFF: 'Off Stump',
    MIDDLE: 'Middle',
    LEG: 'Leg Stump',
  };

  const speedTag = `${speedKmh} km/h`;
  let deliveryLabel = '';

  if (isSpinner && spinVariationName) {
    const weatherTag = weatherCondition === 'RAIN' ? ' (Wet Ball)' : '';
    deliveryLabel = `${speedTag} ${spinVariationName}${weatherTag} (${lengthNames[length]})`;
  } else {
    let movementTag = '';
    if (weatherCondition === 'OVERCAST' && Math.abs(spinOrSwing) > 0.3) {
      movementTag = spinOrSwing > 0 ? ' [Heavy Inswing]' : ' [Heavy Outswing]';
    } else if (weatherCondition === 'RAIN') {
      movementTag = ' [Skidder]';
    } else if (weatherCondition === 'NIGHT' && length === 'GOOD_LENGTH') {
      movementTag = ' [Night Zip]';
    }
    deliveryLabel = `${speedTag} ${lineNames[line]} ${lengthNames[length]}${movementTag}`;
  }

  const isWide = line === 'WIDE_OUTSIDE_OFF';

  return {
    id: `deliv_${overIndex}_${ballInOver}_${Date.now()}`,
    ballNumber: overIndex * 6 + ballInOver + 1,
    overIndex,
    ballInOver,
    line,
    length,
    speedKmh,
    bowlerStyle,
    flightDurationMs,
    bounceRatio,
    spinOrSwing: Number(spinOrSwing.toFixed(2)),
    spinTurnPixels: Number(spinTurnPixels.toFixed(1)),
    spinVariationName,
    deliveryLabel,
    isWide,
  };
}

