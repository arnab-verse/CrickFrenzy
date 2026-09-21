import { BatterArchetype } from '../types';

export interface BatterArchetypeProfile {
  id: BatterArchetype;
  name: string;
  shortLabel: string;
  shortBadge: string;
  tagline: string;
  subtitle: string;
  icon: string;
  description: string;
  stanceDescription: string;
  triggerDescription: string;
  physicsModifiers: {
    powerMultiplier: number;
    timingSweetSpotMultiplier: number;
    timingSweetSpotScale: number;
    edgeRiskMultiplier: number;
    bowledRiskMultiplier: number;
    loftElevationMultiplier: number;
    missWicketMultiplier: number;
    boundaryProbabilityBonus: number;
  };
  badgeColor: string;
  accentColor: string;
}

export const BATTER_ARCHETYPE_PROFILES: Record<BatterArchetype, BatterArchetypeProfile> = {
  CLASSICAL: {
    id: 'CLASSICAL',
    name: 'Classical Master',
    shortLabel: 'Classical',
    shortBadge: 'CLASSICAL',
    tagline: 'Orthodox Elegance & Pure Timing',
    subtitle: 'Orthodox Elegance',
    icon: '🎯',
    description: 'Poised, balanced orthodox technique. Boasts the cleanest timing sweet-spot and flawless shot placement.',
    stanceDescription: 'Balanced upright stance, steady head over front shoulder, rhythmic bat tap on the crease.',
    triggerDescription: 'Subtle back-and-across press with elegant high front elbow backlift.',
    physicsModifiers: {
      powerMultiplier: 1.05,
      timingSweetSpotMultiplier: 1.15, // +15% wider sweet spot
      timingSweetSpotScale: 1.15,
      edgeRiskMultiplier: 0.85,        // -15% edge risk
      bowledRiskMultiplier: 0.85,
      loftElevationMultiplier: 1.0,
      missWicketMultiplier: 0.85,
      boundaryProbabilityBonus: 0.05,
    },
    badgeColor: 'bg-blue-900/60 text-blue-300 border-blue-500/40',
    accentColor: '#3b82f6',
  },
  AGGRESSIVE: {
    id: 'AGGRESSIVE',
    name: 'Aggressive Powerhouse',
    shortLabel: 'Aggressive',
    shortBadge: 'POWER',
    tagline: 'Explosive Power & Monster Clearance',
    subtitle: 'Explosive Power',
    icon: '⚡',
    description: 'High-octane power stance with deep crouch and cocked wrists. Maximizes lofted trajectory and boundary distance.',
    stanceDescription: 'Wide-base crouched power stance, deep knee flex, active high bat hover behind back foot.',
    triggerDescription: 'Coiled power squat with explosive gully backlift ready to unleash maximum bat speed.',
    physicsModifiers: {
      powerMultiplier: 1.25,           // +25% hit distance & boundary power
      timingSweetSpotMultiplier: 0.95, // slightly tighter sweet spot
      timingSweetSpotScale: 0.95,
      edgeRiskMultiplier: 1.30,        // +30% edge risk on mistimed shots
      bowledRiskMultiplier: 1.20,
      loftElevationMultiplier: 1.25,   // Higher lofted trajectory
      missWicketMultiplier: 1.25,
      boundaryProbabilityBonus: 0.18,  // Higher chance of 4s and 6s on good contact
    },
    badgeColor: 'bg-amber-900/60 text-amber-300 border-amber-500/40',
    accentColor: '#f59e0b',
  },
  DEFENSIVE: {
    id: 'DEFENSIVE',
    name: 'Defensive Wall',
    shortLabel: 'Defensive',
    shortBadge: 'DEFENSE',
    tagline: 'Impenetrable Shield & Soft Hands',
    subtitle: 'Impenetrable Shield',
    icon: '🛡️',
    description: 'Ultra-compact side-on defense. Drastically minimizes dismissal risk on swinging and difficult deliveries.',
    stanceDescription: 'Compact side-on orthodox posture, narrow base, bat grounded directly behind front toe with soft hands.',
    triggerDescription: 'Compact forward lean over the line with soft-handed bat control.',
    physicsModifiers: {
      powerMultiplier: 0.90,           // Lower boundary power
      timingSweetSpotMultiplier: 1.08, // Solid sweet spot
      timingSweetSpotScale: 1.08,
      edgeRiskMultiplier: 0.45,        // -55% edge dismissal risk (soft hands deaden the ball)
      bowledRiskMultiplier: 0.50,      // -50% bowled risk on mistimed defense
      loftElevationMultiplier: 0.70,   // Grounded, turf-hugging shots
      missWicketMultiplier: 0.55,      // Survives beats and play-and-misses
      boundaryProbabilityBonus: -0.08,
    },
    badgeColor: 'bg-emerald-900/60 text-emerald-300 border-emerald-500/40',
    accentColor: '#10b981',
  },
  UNORTHODOX: {
    id: 'UNORTHODOX',
    name: 'Unorthodox Maverick',
    shortLabel: 'Unorthodox',
    shortBadge: 'MAVERICK',
    tagline: 'Dynamic Shuffle & Unpredictable Angles',
    subtitle: 'Dynamic Shuffle',
    icon: '🌪️',
    description: 'Open-chested shuffling stance with dynamic wrist flick and innovative angles across the pitch.',
    stanceDescription: 'Open-chested trigger stance, restless footwork, bat waving actively outside off-stump with flared elbow.',
    triggerDescription: 'Pronounced shuffle across the crease exposing leg stump to create unexpected hitting angles.',
    physicsModifiers: {
      powerMultiplier: 1.12,
      timingSweetSpotMultiplier: 1.02,
      timingSweetSpotScale: 1.02,
      edgeRiskMultiplier: 1.10,
      bowledRiskMultiplier: 1.05,
      loftElevationMultiplier: 1.10,
      missWicketMultiplier: 1.10,
      boundaryProbabilityBonus: 0.10,
    },
    badgeColor: 'bg-purple-900/60 text-purple-300 border-purple-500/40',
    accentColor: '#a855f7',
  },
};

export const BATTER_ARCHETYPES = BATTER_ARCHETYPE_PROFILES;

export function getBatterArchetypeProfile(archetype?: BatterArchetype): BatterArchetypeProfile {
  return BATTER_ARCHETYPE_PROFILES[archetype || 'CLASSICAL'] || BATTER_ARCHETYPE_PROFILES.CLASSICAL;
}
