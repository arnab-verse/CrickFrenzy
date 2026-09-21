import { TimingTier } from '../types';

export interface TimingThresholdConfig {
  /** Maximum absolute millisecond offset from the sweet spot for a PERFECT timing */
  perfectMaxOffsetMs: number;
  /** Maximum absolute millisecond offset from the sweet spot for a GOOD timing */
  goodMaxOffsetMs: number;
  /** Maximum absolute millisecond offset for an acceptable EARLY/LATE shot (1-2 runs / block) */
  acceptableMaxOffsetMs: number;
  /** Maximum absolute millisecond offset for a poorly timed shot (VERY_EARLY / VERY_LATE) */
  poorMaxOffsetMs: number;
  /** Any offset beyond poorMaxOffsetMs is a MISS */

  /** Wicket chance multipliers for poor shots (0 to 1) */
  missWicketChance: number;
  poorTimingWicketChance: number;
  wrongDirectionWicketPenalty: number;
}

/**
 * Explicit numeric thresholds for timing tiers.
 * Centralized configuration object for easy tuning and difficulty presets.
 */
export const DEFAULT_TIMING_CONFIG: TimingThresholdConfig = {
  perfectMaxOffsetMs: 40,      // Within +/- 40ms = PERFECT (Six/Four)
  goodMaxOffsetMs: 100,        // Within +/- 100ms = GOOD (Four/Two/Single)
  acceptableMaxOffsetMs: 185,  // Within +/- 185ms = EARLY / LATE (Single/Defensive)
  poorMaxOffsetMs: 280,        // Within +/- 280ms = VERY_EARLY / VERY_LATE (Dot/High risk)
  missWicketChance: 0.45,      // 45% of clean misses on stumps result in bowled/LBW
  poorTimingWicketChance: 0.30,// 30% of mistimed swings result in catches/edges
  wrongDirectionWicketPenalty: 0.25, // Penalty if playing opposite side
};

export const DIFFICULTY_PRESETS: Record<'CASUAL' | 'PRO' | 'CHAMPION', TimingThresholdConfig> = {
  CASUAL: {
    perfectMaxOffsetMs: 50,
    goodMaxOffsetMs: 120,
    acceptableMaxOffsetMs: 220,
    poorMaxOffsetMs: 320,
    missWicketChance: 0.30,
    poorTimingWicketChance: 0.20,
    wrongDirectionWicketPenalty: 0.15,
  },
  PRO: {
    ...DEFAULT_TIMING_CONFIG,
  },
  CHAMPION: {
    perfectMaxOffsetMs: 32,
    goodMaxOffsetMs: 80,
    acceptableMaxOffsetMs: 155,
    poorMaxOffsetMs: 240,
    missWicketChance: 0.60,
    poorTimingWicketChance: 0.40,
    wrongDirectionWicketPenalty: 0.35,
  },
};

/**
 * Returns the classification tier for a given offset in milliseconds.
 * Negative offset = early, positive offset = late, 0 = bullseye ideal.
 */
export function getTimingTierFromOffset(
  offsetMs: number,
  config: TimingThresholdConfig = DEFAULT_TIMING_CONFIG
): TimingTier {
  const absOffset = Math.abs(offsetMs);

  if (absOffset <= config.perfectMaxOffsetMs) {
    return 'PERFECT';
  }
  if (absOffset <= config.goodMaxOffsetMs) {
    return 'GOOD';
  }
  if (absOffset <= config.acceptableMaxOffsetMs) {
    return offsetMs < 0 ? 'EARLY' : 'LATE';
  }
  if (absOffset <= config.poorMaxOffsetMs) {
    return offsetMs < 0 ? 'VERY_EARLY' : 'VERY_LATE';
  }
  return 'MISS';
}
