import { describe, expect, it } from 'vitest';
import {
  DEFAULT_TIMING_CONFIG,
  getTimingTierFromOffset,
} from '../src/config/timingConfig';
import {
  calculateCurrentRunRate,
  calculateRequiredRunRate,
  createInitialGameState,
  formatOvers,
  recordDeliveryOutcome,
  resolveShotOutcome,
} from '../src/engine/battingEngine';
import { generateDelivery } from '../src/engine/bowlingGenerator';
import { BallDelivery, ShotOutcome } from '../src/types';

// Mock helper for delivery
function createMockDelivery(overIndex = 0, ballInOver = 0, line: any = 'MIDDLE', length: any = 'GOOD_LENGTH'): BallDelivery {
  return {
    id: `test_deliv_${overIndex}_${ballInOver}`,
    ballNumber: overIndex * 6 + ballInOver + 1,
    overIndex,
    ballInOver,
    line,
    length,
    speedKmh: 130,
    bowlerStyle: 'FAST',
    flightDurationMs: 900,
    bounceRatio: 0.65,
    spinOrSwing: 0,
    deliveryLabel: '130 km/h Good Length',
  };
}

// Mock helper for shot outcome
function createMockOutcome(runs: 0 | 1 | 2 | 3 | 4 | 6, isWicket = false): ShotOutcome {
  return {
    runs,
    isWicket,
    timingOffsetMs: 0,
    timingTier: runs === 6 ? 'PERFECT' : runs === 4 ? 'GOOD' : runs === 0 && !isWicket ? 'MISS' : 'GOOD',
    shotDirection: 'STRAIGHT',
    shotName: 'Test Shot',
    commentary: 'Test commentary',
  };
}

describe('Batting Engine Unit Tests', () => {
  describe('Timing Threshold Boundary Classification', () => {
    it('classifies 0ms as PERFECT', () => {
      expect(getTimingTierFromOffset(0, DEFAULT_TIMING_CONFIG)).toBe('PERFECT');
    });

    it('classifies exact boundary limits for PERFECT (+/- 40ms)', () => {
      expect(getTimingTierFromOffset(40, DEFAULT_TIMING_CONFIG)).toBe('PERFECT');
      expect(getTimingTierFromOffset(-40, DEFAULT_TIMING_CONFIG)).toBe('PERFECT');
      expect(getTimingTierFromOffset(41, DEFAULT_TIMING_CONFIG)).toBe('GOOD');
      expect(getTimingTierFromOffset(-41, DEFAULT_TIMING_CONFIG)).toBe('GOOD');
    });

    it('classifies exact boundary limits for GOOD (+/- 100ms)', () => {
      expect(getTimingTierFromOffset(100, DEFAULT_TIMING_CONFIG)).toBe('GOOD');
      expect(getTimingTierFromOffset(-100, DEFAULT_TIMING_CONFIG)).toBe('GOOD');
      expect(getTimingTierFromOffset(101, DEFAULT_TIMING_CONFIG)).toBe('LATE');
      expect(getTimingTierFromOffset(-101, DEFAULT_TIMING_CONFIG)).toBe('EARLY');
    });

    it('classifies exact boundary limits for ACCEPTABLE / EARLY & LATE (+/- 185ms)', () => {
      expect(getTimingTierFromOffset(185, DEFAULT_TIMING_CONFIG)).toBe('LATE');
      expect(getTimingTierFromOffset(-185, DEFAULT_TIMING_CONFIG)).toBe('EARLY');
      expect(getTimingTierFromOffset(186, DEFAULT_TIMING_CONFIG)).toBe('VERY_LATE');
      expect(getTimingTierFromOffset(-186, DEFAULT_TIMING_CONFIG)).toBe('VERY_EARLY');
    });

    it('classifies boundary limits for POOR / VERY_EARLY & VERY_LATE (+/- 280ms)', () => {
      expect(getTimingTierFromOffset(280, DEFAULT_TIMING_CONFIG)).toBe('VERY_LATE');
      expect(getTimingTierFromOffset(-280, DEFAULT_TIMING_CONFIG)).toBe('VERY_EARLY');
      expect(getTimingTierFromOffset(281, DEFAULT_TIMING_CONFIG)).toBe('MISS');
      expect(getTimingTierFromOffset(-281, DEFAULT_TIMING_CONFIG)).toBe('MISS');
    });

    it('classifies large offsets as MISS', () => {
      expect(getTimingTierFromOffset(500, DEFAULT_TIMING_CONFIG)).toBe('MISS');
      expect(getTimingTierFromOffset(-500, DEFAULT_TIMING_CONFIG)).toBe('MISS');
    });
  });

  describe('Ball Increment and Over Rollover', () => {
    it('correctly increments legal balls within an over (0.0 to 0.5)', () => {
      let state = createInitialGameState({ totalOvers: 5, totalWickets: 5 });
      expect(formatOvers(state.currentOver, state.ballInOver)).toBe('0.0');

      const delivery0 = createMockDelivery(0, 0);
      state = recordDeliveryOutcome(state, createMockOutcome(1), delivery0);
      expect(state.currentOver).toBe(0);
      expect(state.ballInOver).toBe(1);
      expect(formatOvers(state.currentOver, state.ballInOver)).toBe('0.1');

      // Add 4 more balls (total 5 balls)
      for (let i = 1; i <= 4; i++) {
        state = recordDeliveryOutcome(state, createMockOutcome(1), createMockDelivery(0, i));
      }
      expect(state.currentOver).toBe(0);
      expect(state.ballInOver).toBe(5);
      expect(formatOvers(state.currentOver, state.ballInOver)).toBe('0.5');
    });

    it('performs full over rollover on 6th ball (0.5 -> 1.0)', () => {
      let state = createInitialGameState({ totalOvers: 5, totalWickets: 5 });

      // Play 5 balls
      for (let i = 0; i < 5; i++) {
        state = recordDeliveryOutcome(state, createMockOutcome(2), createMockDelivery(0, i));
      }
      expect(state.currentOver).toBe(0);
      expect(state.ballInOver).toBe(5);

      // Play 6th ball
      state = recordDeliveryOutcome(state, createMockOutcome(4), createMockDelivery(0, 5));
      expect(state.currentOver).toBe(1);
      expect(state.ballInOver).toBe(0);
      expect(state.totalLegalBalls).toBe(6);
      expect(state.runs).toBe(14); // 5 * 2 + 4
      expect(formatOvers(state.currentOver, state.ballInOver)).toBe('1.0');
    });
  });

  describe('Innings Ending Logic', () => {
    it('ends innings exactly at the over limit (e.g. after 2 overs = 12 balls)', () => {
      let state = createInitialGameState({ totalOvers: 2, totalWickets: 5 });

      // Play 11 balls
      for (let over = 0; over < 2; over++) {
        const balls = over === 1 ? 5 : 6;
        for (let b = 0; b < balls; b++) {
          state = recordDeliveryOutcome(state, createMockOutcome(1), createMockDelivery(over, b));
        }
      }
      expect(state.totalLegalBalls).toBe(11);
      expect(state.isInningsOver).toBe(false);

      // Play 12th ball (final ball of 2 overs)
      state = recordDeliveryOutcome(state, createMockOutcome(1), createMockDelivery(1, 5));
      expect(state.totalLegalBalls).toBe(12);
      expect(state.currentOver).toBe(2);
      expect(state.ballInOver).toBe(0);
      expect(state.isInningsOver).toBe(true);
      expect(state.inningsEndReason).toBe('OVERS_EXHAUSTED');
    });

    it('ends innings immediately once target is passed in a chase (chase completed early)', () => {
      let state = createInitialGameState({
        totalOvers: 5,
        totalWickets: 5,
        target: 20, // Need 20 to win
      });

      // Ball 1: hits a six (6 runs)
      state = recordDeliveryOutcome(state, createMockOutcome(6), createMockDelivery(0, 0));
      expect(state.runs).toBe(6);
      expect(state.isInningsOver).toBe(false);

      // Ball 2: hits a six (12 runs)
      state = recordDeliveryOutcome(state, createMockOutcome(6), createMockDelivery(0, 1));
      expect(state.runs).toBe(12);
      expect(state.isInningsOver).toBe(false);

      // Ball 3: hits a four (16 runs)
      state = recordDeliveryOutcome(state, createMockOutcome(4), createMockDelivery(0, 2));
      expect(state.runs).toBe(16);
      expect(state.isInningsOver).toBe(false);

      // Ball 4: hits a six (22 runs -> target of 20 passed on ball 0.4!)
      state = recordDeliveryOutcome(state, createMockOutcome(6), createMockDelivery(0, 3));
      expect(state.runs).toBe(22);
      expect(state.isInningsOver).toBe(true);
      expect(state.inningsEndReason).toBe('TARGET_REACHED');
      expect(state.hasWon).toBe(true);
      expect(state.totalLegalBalls).toBe(4); // Chase ended after only 4 balls!
    });

    it('ends innings when all wickets fall', () => {
      let state = createInitialGameState({
        totalOvers: 5,
        totalWickets: 2, // 2 wickets limit
      });

      // 1st wicket
      state = recordDeliveryOutcome(state, createMockOutcome(0, true), createMockDelivery(0, 0));
      expect(state.wickets).toBe(1);
      expect(state.isInningsOver).toBe(false);

      // 2nd wicket
      state = recordDeliveryOutcome(state, createMockOutcome(0, true), createMockDelivery(0, 1));
      expect(state.wickets).toBe(2);
      expect(state.isInningsOver).toBe(true);
      expect(state.inningsEndReason).toBe('ALL_OUT');
      expect(state.hasWon).toBe(false);
    });

    it('supports 10 wickets lineup for full innings matches', () => {
      let state = createInitialGameState({
        totalOvers: 20,
        totalWickets: 10,
      });

      // 9 wickets fall, innings should still be in progress
      for (let w = 1; w <= 9; w++) {
        state = recordDeliveryOutcome(state, createMockOutcome(0, true), createMockDelivery(0, w - 1));
        expect(state.wickets).toBe(w);
        expect(state.isInningsOver).toBe(false);
      }

      // 10th wicket falls -> All Out!
      state = recordDeliveryOutcome(state, createMockOutcome(0, true), createMockDelivery(1, 4));
      expect(state.wickets).toBe(10);
      expect(state.isInningsOver).toBe(true);
      expect(state.inningsEndReason).toBe('ALL_OUT');
    });

    it('supports configurable match lengths: 5, 10, 15, 20 overs', () => {
      [5, 10, 15, 20].forEach((overs) => {
        const state = createInitialGameState({ totalOvers: overs, totalWickets: 10 });
        expect(state.config.totalOvers).toBe(overs);
      });
    });

    it('allows unlimited overs without exhausting overs after 5 or 20 overs', () => {
      let state = createInitialGameState({
        totalOvers: 0, // 0 = unlimited overs
        totalWickets: 5,
      });

      // Simulate 6 complete overs (36 balls)
      for (let over = 0; over < 6; over++) {
        for (let ball = 0; ball < 6; ball++) {
          state = recordDeliveryOutcome(state, createMockOutcome(1), createMockDelivery(over, ball));
        }
      }

      expect(state.currentOver).toBe(6);
      expect(state.totalLegalBalls).toBe(36);
      expect(state.isInningsOver).toBe(false); // Does not exhaust after 5 overs!

      // Only ends when all 5 wickets fall
      for (let w = 1; w <= 5; w++) {
        state = recordDeliveryOutcome(state, createMockOutcome(0, true), createMockDelivery(6, w - 1));
      }

      expect(state.wickets).toBe(5);
      expect(state.isInningsOver).toBe(true);
      expect(state.inningsEndReason).toBe('ALL_OUT');
    });
  });

  describe('Run Rate Calculations', () => {
    it('computes current run rate correctly', () => {
      // 12 runs off 6 balls = 2 overs -> 12.00 CRR
      expect(calculateCurrentRunRate(12, 6)).toBe(12.0);
      // 24 runs off 18 balls (3 overs) = 8.00 CRR
      expect(calculateCurrentRunRate(24, 18)).toBe(8.0);
    });

    it('computes required run rate correctly for limited overs and returns null for unlimited', () => {
      // Target 50, current runs 20 -> 30 needed.
      // Total 5 overs (30 balls), bowled 12 balls -> 18 balls (3 overs) remaining.
      // RRR = 30 / 3 = 10.00
      expect(calculateRequiredRunRate(50, 20, 5, 12)).toBe(10.0);

      // Unlimited overs match: no overs deadline
      expect(calculateRequiredRunRate(50, 20, 0, 12)).toBeNull();
    });
  });

  describe('Pure Shot Resolution Mechanics', () => {
    it('produces a boundary or six with perfect timing and aligned shot direction', () => {
      const delivery = createMockDelivery(0, 0, 'OUTSIDE_OFF', 'GOOD_LENGTH');
      // Perfect timing (0 offset) + OFF_SIDE alignment with deterministic rng returning 0.1
      const outcome = resolveShotOutcome(delivery, 'OFF_SIDE', 0, { rng: () => 0.1 });
      expect(outcome.timingTier).toBe('PERFECT');
      expect(outcome.isWicket).toBe(false);
      expect(outcome.runs).toBeGreaterThanOrEqual(4);
    });

    it('can result in bowled when clean missing on middle stump yorker', () => {
      const delivery = createMockDelivery(0, 0, 'MIDDLE', 'YORKER');
      // Timing offset 400ms = MISS, rng rolls 0.05 which is below missWicketChance
      const outcome = resolveShotOutcome(delivery, 'STRAIGHT', 400, { rng: () => 0.05 });
      expect(outcome.timingTier).toBe('MISS');
      expect(outcome.isWicket).toBe(true);
      expect(outcome.wicketType).toBe('BOWLED');
    });
  });

  describe('Spin Bowling Generation', () => {
    it('generates off-spinners with spin variations and turn', () => {
      const delivery = generateDelivery({
        overIndex: 2,
        ballInOver: 0,
        preferredBowler: 'OFF_SPIN',
        rng: () => 0.2, // will pick Off-Break
      });

      expect(delivery.bowlerStyle).toBe('OFF_SPINNER');
      expect(delivery.speedKmh).toBeLessThan(105);
      expect(delivery.spinVariationName).toBe('Off-Break');
      expect(delivery.spinTurnPixels).toBeGreaterThan(0);
      expect(delivery.deliveryLabel).toContain('Off-Break');
    });

    it('generates leg-spinners with sharp breaks and googlies', () => {
      const delivery = generateDelivery({
        overIndex: 3,
        ballInOver: 0,
        preferredBowler: 'LEG_SPIN',
        rng: () => 0.2, // will pick Leg-Break
      });

      expect(delivery.bowlerStyle).toBe('LEG_SPINNER');
      expect(delivery.speedKmh).toBeLessThan(105);
      expect(delivery.spinVariationName).toBe('Leg-Break');
      expect(delivery.spinTurnPixels).toBeLessThan(0);
      expect(delivery.deliveryLabel).toContain('Leg-Break');
    });
  });

  describe('Consecutive Boundaries Streak Tracking', () => {
    it('initializes streak count and highest streak to zero', () => {
      const state = createInitialGameState();
      expect(state.consecutiveBoundaries).toBe(0);
      expect(state.consecutiveBoundaryTypes).toEqual([]);
      expect(state.highestBoundaryStreak).toBe(0);
    });

    it('increments streak when hitting boundaries and tracks types (FOUR and SIX)', () => {
      let state = createInitialGameState({ totalOvers: 5, totalWickets: 5 });
      const delivery = createMockDelivery(0, 0);

      // Hit a FOUR
      state = recordDeliveryOutcome(state, createMockOutcome(4), delivery);
      expect(state.consecutiveBoundaries).toBe(1);
      expect(state.consecutiveBoundaryTypes).toEqual(['FOUR']);
      expect(state.highestBoundaryStreak).toBe(1);

      // Hit a SIX
      state = recordDeliveryOutcome(state, createMockOutcome(6), delivery);
      expect(state.consecutiveBoundaries).toBe(2);
      expect(state.consecutiveBoundaryTypes).toEqual(['FOUR', 'SIX']);
      expect(state.highestBoundaryStreak).toBe(2);

      // Hit another SIX
      state = recordDeliveryOutcome(state, createMockOutcome(6), delivery);
      expect(state.consecutiveBoundaries).toBe(3);
      expect(state.consecutiveBoundaryTypes).toEqual(['FOUR', 'SIX', 'SIX']);
      expect(state.highestBoundaryStreak).toBe(3);
    });

    it('resets active streak to 0 on a non-boundary but preserves highestBoundaryStreak', () => {
      let state = createInitialGameState({ totalOvers: 5, totalWickets: 5 });
      const delivery = createMockDelivery(0, 0);

      // Hit 3 consecutive sixes
      state = recordDeliveryOutcome(state, createMockOutcome(6), delivery);
      state = recordDeliveryOutcome(state, createMockOutcome(6), delivery);
      state = recordDeliveryOutcome(state, createMockOutcome(6), delivery);
      expect(state.consecutiveBoundaries).toBe(3);
      expect(state.highestBoundaryStreak).toBe(3);

      // Take a single (1 run)
      state = recordDeliveryOutcome(state, createMockOutcome(1), delivery);
      expect(state.consecutiveBoundaries).toBe(0);
      expect(state.consecutiveBoundaryTypes).toEqual([]);
      expect(state.highestBoundaryStreak).toBe(3);

      // Start new streak of 2
      state = recordDeliveryOutcome(state, createMockOutcome(4), delivery);
      state = recordDeliveryOutcome(state, createMockOutcome(4), delivery);
      expect(state.consecutiveBoundaries).toBe(2);
      expect(state.consecutiveBoundaryTypes).toEqual(['FOUR', 'FOUR']);
      expect(state.highestBoundaryStreak).toBe(3); // Previous record of 3 still held

      // Wicket resets streak
      state = recordDeliveryOutcome(state, createMockOutcome(0, true), delivery);
      expect(state.consecutiveBoundaries).toBe(0);
      expect(state.highestBoundaryStreak).toBe(3);
    });
  });
});
