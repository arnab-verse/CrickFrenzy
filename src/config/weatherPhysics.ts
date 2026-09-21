import { WeatherCondition } from '../types';
import { TimingThresholdConfig } from './timingConfig';

export interface WeatherPhysicsProfile {
  condition: WeatherCondition;
  name: string;
  icon: string;
  badgeText: string;
  atmosphericSummary: string;
  physicsDetails: {
    swingEffect: string;
    pitchBehavior: string;
    spinGrip: string;
    timingChallenge: string;
  };
  // Ball Movement Multipliers
  swingMultiplier: number;          // Lateral air drift & swing curvature multiplier
  seamMultiplier: number;           // Deviation off seam upon pitching multiplier
  spinTurnMultiplier: number;       // Spin turn / break off turf multiplier
  pitchSkidFactor: number;          // Skidding speed factor after bounce
  speedDeltaKmh: number;            // Added release speed km/h
  bounceHeightMultiplier: number;   // Vertical bounce height multiplier
  flightDurationMultiplier: number; // Flight duration multiplier (<1.0 = faster reaction needed)
  
  // Batting Engine Timing Adjustments
  perfectWindowMultiplier: number;  // Sweet spot window multiplier
  goodWindowMultiplier: number;     // Good timing window multiplier
  acceptableWindowMultiplier: number;
  poorWindowMultiplier: number;
  wicketEdgeRiskMultiplier: number; // Multiplier on outside edges and mistimed catches
  bowledLbwRiskMultiplier: number;  // Multiplier on missed balls (bowled/LBW)
}

export const WEATHER_PHYSICS_PROFILES: Record<WeatherCondition, WeatherPhysicsProfile> = {
  SUNNY: {
    condition: 'SUNNY',
    name: 'Clear Sunny Day',
    icon: '☀️',
    badgeText: 'True Bounce & Balanced Timing',
    atmosphericSummary: 'Optimal daylight conditions with a hard, dry pitch providing consistent bounce and predictable ball trajectory.',
    physicsDetails: {
      swingEffect: 'Standard conventional air swing (1.0x)',
      pitchBehavior: 'True, predictable bounce off the dry surface',
      spinGrip: 'Dry turf offers strong purchase for spinners (1.12x)',
      timingChallenge: 'Pure, balanced sweet spot timing windows',
    },
    swingMultiplier: 1.0,
    seamMultiplier: 1.0,
    spinTurnMultiplier: 1.12,
    pitchSkidFactor: 1.0,
    speedDeltaKmh: 0,
    bounceHeightMultiplier: 1.0,
    flightDurationMultiplier: 1.0,
    perfectWindowMultiplier: 1.0,
    goodWindowMultiplier: 1.0,
    acceptableWindowMultiplier: 1.0,
    poorWindowMultiplier: 1.0,
    wicketEdgeRiskMultiplier: 1.0,
    bowledLbwRiskMultiplier: 1.0,
  },
  OVERCAST: {
    condition: 'OVERCAST',
    name: 'Heavy Overcast',
    icon: '☁️',
    badgeText: '+50% Late Swing & Seam Deviation',
    atmosphericSummary: 'Dense, humid cloud cover maximizes laminar airflow for pronounced late swing and sharp movement off the seam.',
    physicsDetails: {
      swingEffect: 'Prodigious late in-swing and out-swing in the air (+50%)',
      pitchBehavior: 'Pronounced lateral deviation off the seam (+35%)',
      spinGrip: 'Steady spin grip with modest drift',
      timingChallenge: 'Tighter sweet spot (0.90x) with heightened edge risk (1.30x)',
    },
    swingMultiplier: 1.50,
    seamMultiplier: 1.35,
    spinTurnMultiplier: 1.05,
    pitchSkidFactor: 1.0,
    speedDeltaKmh: 0,
    bounceHeightMultiplier: 1.0,
    flightDurationMultiplier: 1.0,
    perfectWindowMultiplier: 0.90,
    goodWindowMultiplier: 0.92,
    acceptableWindowMultiplier: 0.95,
    poorWindowMultiplier: 0.98,
    wicketEdgeRiskMultiplier: 1.30,
    bowledLbwRiskMultiplier: 1.10,
  },
  RAIN: {
    condition: 'RAIN',
    name: 'Passing Drizzle & Damp Pitch',
    icon: '🌧️',
    badgeText: 'Slick Skidding Deck • Rushed Timing',
    atmosphericSummary: 'Damp surface causes the ball to skid on rapidly with reduced spin grip, rushing the batter and testing quick reactions.',
    physicsDetails: {
      swingEffect: 'Wet ball reduces conventional swing aerodynamic grip (0.85x)',
      pitchBehavior: 'Skids low and fast off the slick deck with lower bounce (0.84x)',
      spinGrip: 'Wet grass reduces spinner finger grip and turn (0.75x)',
      timingChallenge: 'Faster arrival (-7% flight time) and tighter timing window (0.88x)',
    },
    swingMultiplier: 0.85,
    seamMultiplier: 1.20,
    spinTurnMultiplier: 0.75,
    pitchSkidFactor: 1.15,
    speedDeltaKmh: 3.0,
    bounceHeightMultiplier: 0.84,
    flightDurationMultiplier: 0.93,
    perfectWindowMultiplier: 0.88,
    goodWindowMultiplier: 0.90,
    acceptableWindowMultiplier: 0.92,
    poorWindowMultiplier: 0.95,
    wicketEdgeRiskMultiplier: 0.90,
    bowledLbwRiskMultiplier: 1.35,
  },
  NIGHT: {
    condition: 'NIGHT',
    name: 'Night under Floodlights',
    icon: '🌙',
    badgeText: 'Crisp Night Zip & Firm Carry',
    atmosphericSummary: 'Cool evening air and floodlights provide brisk ball zip off the turf with extra carry through to the keeper.',
    physicsDetails: {
      swingEffect: 'Consistent evening swing under atmospheric pressure (1.12x)',
      pitchBehavior: 'Crisp, firm bounce and carry (1.06x)',
      spinGrip: 'Slight dew film creates occasional skidders (0.95x)',
      timingChallenge: 'Brisk carry tests back-foot positioning (0.95x window)',
    },
    swingMultiplier: 1.12,
    seamMultiplier: 1.10,
    spinTurnMultiplier: 0.95,
    pitchSkidFactor: 1.02,
    speedDeltaKmh: 1.5,
    bounceHeightMultiplier: 1.06,
    flightDurationMultiplier: 0.98,
    perfectWindowMultiplier: 0.95,
    goodWindowMultiplier: 0.96,
    acceptableWindowMultiplier: 0.98,
    poorWindowMultiplier: 1.0,
    wicketEdgeRiskMultiplier: 1.05,
    bowledLbwRiskMultiplier: 1.05,
  },
};

/**
 * Returns the dynamic weather-adjusted timing thresholds for the batting engine.
 */
export function getWeatherAdjustedTimingConfig(
  baseConfig: TimingThresholdConfig,
  weather: WeatherCondition = 'SUNNY'
): TimingThresholdConfig {
  const profile = WEATHER_PHYSICS_PROFILES[weather] || WEATHER_PHYSICS_PROFILES.SUNNY;

  return {
    perfectMaxOffsetMs: Math.max(15, Math.round(baseConfig.perfectMaxOffsetMs * profile.perfectWindowMultiplier)),
    goodMaxOffsetMs: Math.max(35, Math.round(baseConfig.goodMaxOffsetMs * profile.goodWindowMultiplier)),
    acceptableMaxOffsetMs: Math.max(70, Math.round(baseConfig.acceptableMaxOffsetMs * profile.acceptableWindowMultiplier)),
    poorMaxOffsetMs: Math.max(120, Math.round(baseConfig.poorMaxOffsetMs * profile.poorWindowMultiplier)),
    missWicketChance: Math.min(0.95, Number((baseConfig.missWicketChance * profile.bowledLbwRiskMultiplier).toFixed(3))),
    poorTimingWicketChance: Math.min(0.85, Number((baseConfig.poorTimingWicketChance * profile.wicketEdgeRiskMultiplier).toFixed(3))),
    wrongDirectionWicketPenalty: baseConfig.wrongDirectionWicketPenalty,
  };
}
