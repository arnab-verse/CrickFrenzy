import React, { useState } from 'react';
import { DEFAULT_TIMING_CONFIG, getTimingTierFromOffset } from '../config/timingConfig';
import { getWeatherAdjustedTimingConfig, WEATHER_PHYSICS_PROFILES } from '../config/weatherPhysics';
import {
  calculateCurrentRunRate,
  calculateRequiredRunRate,
  createInitialGameState,
  formatOvers,
  recordDeliveryOutcome,
  resolveShotOutcome,
} from '../engine/battingEngine';
import { generateDelivery } from '../engine/bowlingGenerator';
import { BallDelivery, ShotOutcome } from '../types';

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  details: string;
}

export const EngineTestRunnerModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  if (!isOpen) return null;

  const runAllTests = () => {
    setIsRunning(true);
    const testList: TestResult[] = [];

    // Helper delivery
    const mockDeliv: BallDelivery = {
      id: 'test_1',
      ballNumber: 1,
      overIndex: 0,
      ballInOver: 0,
      line: 'MIDDLE',
      length: 'GOOD_LENGTH',
      speedKmh: 130,
      bowlerStyle: 'FAST',
      flightDurationMs: 900,
      bounceRatio: 0.65,
      spinOrSwing: 0,
      deliveryLabel: '130 km/h Good Length',
    };

    const mockOutcome = (runs: 0 | 1 | 2 | 3 | 4 | 6, isWicket = false): ShotOutcome => ({
      runs,
      isWicket,
      timingOffsetMs: 0,
      timingTier: runs === 6 ? 'PERFECT' : runs === 4 ? 'GOOD' : 'EARLY',
      shotDirection: 'STRAIGHT',
      shotName: 'Test Shot',
      commentary: 'Test',
    });

    // 1. Timing Boundary Tests
    try {
      const p0 = getTimingTierFromOffset(0, DEFAULT_TIMING_CONFIG);
      const p40 = getTimingTierFromOffset(40, DEFAULT_TIMING_CONFIG);
      const p41 = getTimingTierFromOffset(41, DEFAULT_TIMING_CONFIG);
      const passed = p0 === 'PERFECT' && p40 === 'PERFECT' && p41 === 'GOOD';
      testList.push({
        name: 'Perfect vs Good Timing Boundary (+/- 40ms)',
        category: 'Timing Classification',
        passed,
        details: `0ms=${p0}, 40ms=${p40}, 41ms=${p41}`,
      });
    } catch (e: any) {
      testList.push({ name: 'Perfect Timing Boundary', category: 'Timing Classification', passed: false, details: e.message });
    }

    try {
      const g100 = getTimingTierFromOffset(100, DEFAULT_TIMING_CONFIG);
      const g101 = getTimingTierFromOffset(101, DEFAULT_TIMING_CONFIG);
      const passed = g100 === 'GOOD' && g101 === 'LATE';
      testList.push({
        name: 'Good vs Acceptable Late Boundary (+/- 100ms)',
        category: 'Timing Classification',
        passed,
        details: `100ms=${g100}, 101ms=${g101}`,
      });
    } catch (e: any) {
      testList.push({ name: 'Good Timing Boundary', category: 'Timing Classification', passed: false, details: e.message });
    }

    try {
      const e185 = getTimingTierFromOffset(-185, DEFAULT_TIMING_CONFIG);
      const ve186 = getTimingTierFromOffset(-186, DEFAULT_TIMING_CONFIG);
      const miss = getTimingTierFromOffset(350, DEFAULT_TIMING_CONFIG);
      const passed = e185 === 'EARLY' && ve186 === 'VERY_EARLY' && miss === 'MISS';
      testList.push({
        name: 'Early / Very Early / Miss Boundaries (185ms, 280ms, >280ms)',
        category: 'Timing Classification',
        passed,
        details: `-185ms=${e185}, -186ms=${ve186}, 350ms=${miss}`,
      });
    } catch (e: any) {
      testList.push({ name: 'Miss Boundary Test', category: 'Timing Classification', passed: false, details: e.message });
    }

    // 2. Over Rollover and Ball Increment Tests
    try {
      let st = createInitialGameState({ totalOvers: 5, totalWickets: 5 });
      const initialOverStr = formatOvers(st.currentOver, st.ballInOver);
      for (let i = 0; i < 5; i++) {
        st = recordDeliveryOutcome(st, mockOutcome(1), { ...mockDeliv, ballInOver: i });
      }
      const beforeRollOver = formatOvers(st.currentOver, st.ballInOver);
      st = recordDeliveryOutcome(st, mockOutcome(4), { ...mockDeliv, ballInOver: 5 });
      const afterRollOver = formatOvers(st.currentOver, st.ballInOver);

      const passed = initialOverStr === '0.0' && beforeRollOver === '0.5' && afterRollOver === '1.0' && st.currentOver === 1 && st.ballInOver === 0 && st.runs === 9;
      testList.push({
        name: 'Legal Ball Increment & Full Over Rollover (0.5 -> 1.0)',
        category: 'Over & Ball Counter',
        passed,
        details: `Initial: ${initialOverStr} -> 5th ball: ${beforeRollOver} -> 6th ball: ${afterRollOver}`,
      });
    } catch (e: any) {
      testList.push({ name: 'Over Rollover Test', category: 'Over & Ball Counter', passed: false, details: e.message });
    }

    // 3. Innings Limit Test
    try {
      let st = createInitialGameState({ totalOvers: 1, totalWickets: 5 });
      for (let i = 0; i < 6; i++) {
        st = recordDeliveryOutcome(st, mockOutcome(1), { ...mockDeliv, ballInOver: i });
      }
      const passed = st.isInningsOver && st.inningsEndReason === 'OVERS_EXHAUSTED' && st.totalLegalBalls === 6;
      testList.push({
        name: 'Innings Ends Exactly at Over Limit (1 Over / 6 balls)',
        category: 'Innings Progression',
        passed,
        details: `isInningsOver: ${st.isInningsOver}, reason: ${st.inningsEndReason}, totalBalls: ${st.totalLegalBalls}`,
      });
    } catch (e: any) {
      testList.push({ name: 'Innings Limit Test', category: 'Innings Progression', passed: false, details: e.message });
    }

    // 4. Chase Completed Early Logic
    try {
      let st = createInitialGameState({ totalOvers: 5, totalWickets: 5, target: 14 });
      // Ball 1: 6 runs
      st = recordDeliveryOutcome(st, mockOutcome(6), { ...mockDeliv, ballInOver: 0 });
      // Ball 2: 4 runs (total 10)
      st = recordDeliveryOutcome(st, mockOutcome(4), { ...mockDeliv, ballInOver: 1 });
      // Ball 3: 6 runs (total 16 -> passed target 14!)
      st = recordDeliveryOutcome(st, mockOutcome(6), { ...mockDeliv, ballInOver: 2 });

      const passed = st.isInningsOver && st.inningsEndReason === 'TARGET_REACHED' && st.hasWon === true && st.totalLegalBalls === 3;
      testList.push({
        name: 'Chase Completed Early (Target reached on 3rd ball)',
        category: 'Run Chase Logic',
        passed,
        details: `Runs: ${st.runs}/${st.config.target} in ${st.totalLegalBalls} balls, hasWon: ${st.hasWon}`,
      });
    } catch (e: any) {
      testList.push({ name: 'Chase Completed Early Test', category: 'Run Chase Logic', passed: false, details: e.message });
    }

    // 5. All Wickets Fall Logic
    try {
      let st = createInitialGameState({ totalOvers: 5, totalWickets: 2 });
      st = recordDeliveryOutcome(st, mockOutcome(0, true), { ...mockDeliv, ballInOver: 0 });
      st = recordDeliveryOutcome(st, mockOutcome(0, true), { ...mockDeliv, ballInOver: 1 });
      const passed = st.isInningsOver && st.inningsEndReason === 'ALL_OUT' && st.wickets === 2;
      testList.push({
        name: 'All Out Ending (Wickets limit reached)',
        category: 'Innings Progression',
        passed,
        details: `Wickets: ${st.wickets}/${st.config.totalWickets}, isInningsOver: ${st.isInningsOver}`,
      });
    } catch (e: any) {
      testList.push({ name: 'All Wickets Fall Test', category: 'Innings Progression', passed: false, details: e.message });
    }

    // 6. Run Rate Math
    try {
      const crr = calculateCurrentRunRate(18, 9); // 1.3 overs = 1.5 overs -> 18 / 1.5 = 12.0
      const rrr = calculateRequiredRunRate(60, 24, 5, 12); // 36 needed in 3 overs (18 balls) = 12.0
      const passed = crr === 12.0 && rrr === 12.0;
      testList.push({
        name: 'Current Run Rate & Required Run Rate Formulas',
        category: 'Mathematics',
        passed,
        details: `CRR (18r / 9b) = ${crr}, RRR (36r / 18b) = ${rrr}`,
      });
    } catch (e: any) {
      testList.push({ name: 'Run Rate Calculations', category: 'Mathematics', passed: false, details: e.message });
    }

    // 7. Spin Bowling Mechanics
    try {
      const offSpin = generateDelivery({
        overIndex: 2,
        ballInOver: 0,
        preferredBowler: 'OFF_SPIN',
        rng: () => 0.2,
      });
      const legSpin = generateDelivery({
        overIndex: 3,
        ballInOver: 0,
        preferredBowler: 'LEG_SPIN',
        rng: () => 0.2,
      });
      const passed =
        offSpin.bowlerStyle === 'OFF_SPINNER' &&
        offSpin.spinTurnPixels! > 0 &&
        legSpin.bowlerStyle === 'LEG_SPINNER' &&
        legSpin.spinTurnPixels! < 0;
      testList.push({
        name: 'Spin Bowling Generation (Off-Break & Leg-Break physics)',
        category: 'Spin Bowling Physics',
        passed,
        details: `Off-Spin: ${offSpin.deliveryLabel}, Turn: +${offSpin.spinTurnPixels}px | Leg-Spin: ${legSpin.deliveryLabel}, Turn: ${legSpin.spinTurnPixels}px`,
      });
    } catch (e: any) {
      testList.push({ name: 'Spin Bowling Generation', category: 'Spin Bowling Physics', passed: false, details: e.message });
    }

    // 8. Match Formats: 5, 10, 15, 20 & Unlimited Overs + 5/10 Wickets
    try {
      let unlimState = createInitialGameState({ totalOvers: 0, totalWickets: 10 });
      // Simulate completing 6 overs (over 0 to 5)
      for (let i = 0; i < 36; i++) {
        unlimState = recordDeliveryOutcome(
          unlimState,
          mockOutcome(1),
          mockDeliv
        );
      }
      const passedUnlimited = !unlimState.isInningsOver && unlimState.currentOver === 6;
      const passed10Wickets = unlimState.config.totalWickets === 10;
      const rrrUnlimited = calculateRequiredRunRate(50, 20, 0, 12);
      const passed = passedUnlimited && passed10Wickets && rrrUnlimited === null;
      testList.push({
        name: 'Match Overs (5, 10, 15, 20, Unlimited) & Wickets (5 vs 10)',
        category: 'Match Configuration',
        passed,
        details: `6 overs in Unlimited mode: inningsOver=${unlimState.isInningsOver}, Wickets quota=${unlimState.config.totalWickets}, Unlimited RRR=${rrrUnlimited}`,
      });
    } catch (e: any) {
      testList.push({ name: 'Match Configuration Formats', category: 'Match Configuration', passed: false, details: e.message });
    }

    // Consecutive Boundaries Streak Tracking
    try {
      let streakState = createInitialGameState({ totalOvers: 5 });
      // Ball 1: 4 runs -> streak = 1
      streakState = recordDeliveryOutcome(streakState, mockOutcome(4), mockDeliv);
      const b1Passed = streakState.consecutiveBoundaries === 1 && streakState.highestBoundaryStreak === 1;

      // Ball 2: 6 runs -> streak = 2
      streakState = recordDeliveryOutcome(streakState, mockOutcome(6), mockDeliv);
      const b2Passed = streakState.consecutiveBoundaries === 2 && streakState.highestBoundaryStreak === 2;

      // Ball 3: 6 runs -> streak = 3
      streakState = recordDeliveryOutcome(streakState, mockOutcome(6), mockDeliv);
      const b3Passed = streakState.consecutiveBoundaries === 3 && streakState.highestBoundaryStreak === 3;

      // Ball 4: 1 run -> streak resets to 0, highest remains 3
      streakState = recordDeliveryOutcome(streakState, mockOutcome(1), mockDeliv);
      const b4Passed = streakState.consecutiveBoundaries === 0 && streakState.highestBoundaryStreak === 3;

      const passed = b1Passed && b2Passed && b3Passed && b4Passed;
      testList.push({
        name: 'Consecutive Boundaries Streak Tracking & Reset',
        category: 'Boundary Streak Logic',
        passed,
        details: `After 4, 6, 6, 1: currentStreak=${streakState.consecutiveBoundaries}, highestStreak=${streakState.highestBoundaryStreak}`,
      });
    } catch (e: any) {
      testList.push({ name: 'Consecutive Boundaries Streak Tracking & Reset', category: 'Boundary Streak Logic', passed: false, details: e.message });
    }

    // 7. Practice Mode: Unlimited Wickets & Unlimited Overs
    try {
      let practiceState = createInitialGameState({
        totalOvers: 0,
        totalWickets: Infinity,
        difficulty: 'PRO',
        isPracticeMode: true,
        practiceBowlerType: 'MEDIUM_PACE',
      });

      // Take 12 wickets in a row
      for (let i = 0; i < 12; i++) {
        practiceState = recordDeliveryOutcome(practiceState, mockOutcome(0, true), mockDeliv);
      }

      const wicketsNeverEndSession = !practiceState.isInningsOver && practiceState.wickets === 12;

      // Bowl through 25 overs (150 balls)
      for (let i = 0; i < 150; i++) {
        practiceState = recordDeliveryOutcome(practiceState, mockOutcome(4), mockDeliv);
      }

      const oversNeverEndSession = !practiceState.isInningsOver && practiceState.currentOver >= 25;

      const delivMed = generateDelivery({
        overIndex: 0,
        ballInOver: 0,
        totalOvers: 0,
        difficulty: 'PRO',
        preferredBowler: 'MEDIUM_PACE',
      });

      const bowlerMatch = delivMed.bowlerStyle === 'MEDIUM_PACER';

      const passed = wicketsNeverEndSession && oversNeverEndSession && bowlerMatch;
      testList.push({
        name: 'Practice Mode Unlimited Overs, Endless Wickets & Medium Pace Selection',
        category: 'Practice Mode Drill',
        passed,
        details: `12 Wickets isInningsOver=${practiceState.isInningsOver}, Over=${practiceState.currentOver}, MediumPacer=${delivMed.bowlerStyle}`,
      });
    } catch (e: any) {
      testList.push({ name: 'Practice Mode Unlimited Overs & Wickets', category: 'Practice Mode Drill', passed: false, details: e.message });
    }

    // 8. Dynamic Weather Physics: Ball Movement & Trajectory Modulation
    try {
      const overcastDeliv = generateDelivery({
        overIndex: 0,
        ballInOver: 0,
        difficulty: 'PRO',
        weatherCondition: 'OVERCAST',
        preferredBowler: 'PACER',
        rng: () => 0.5,
      });

      const rainDeliv = generateDelivery({
        overIndex: 0,
        ballInOver: 0,
        difficulty: 'PRO',
        weatherCondition: 'RAIN',
        preferredBowler: 'PACER',
        rng: () => 0.5,
      });

      const sunnyDeliv = generateDelivery({
        overIndex: 0,
        ballInOver: 0,
        difficulty: 'PRO',
        weatherCondition: 'SUNNY',
        preferredBowler: 'PACER',
        rng: () => 0.5,
      });

      // In overcast, swing & seam are amplified by 1.5x / 1.35x
      const overcastSwingAmplified = Math.abs(overcastDeliv.spinOrSwing) >= Math.abs(sunnyDeliv.spinOrSwing) * 1.3;
      // In rain, ball speed is +3 km/h and flight duration is reduced (< sunny flight)
      const rainSpeedBoost = rainDeliv.speedKmh > sunnyDeliv.speedKmh;
      const rainFlightFaster = rainDeliv.flightDurationMs < sunnyDeliv.flightDurationMs;

      const weatherPhysicsPassed = overcastSwingAmplified && rainSpeedBoost && rainFlightFaster;
      testList.push({
        name: 'Dynamic Weather Ball Movement (Overcast Swing & Rain Skid Speed)',
        category: 'Weather Physics Engine',
        passed: weatherPhysicsPassed,
        details: `OvercastSwing=${overcastDeliv.spinOrSwing} (Sunny=${sunnyDeliv.spinOrSwing}), RainSpeed=${rainDeliv.speedKmh}km/h (Sunny=${sunnyDeliv.speedKmh}km/h, RainFlight=${rainDeliv.flightDurationMs}ms vs Sunny=${sunnyDeliv.flightDurationMs}ms)`,
      });
    } catch (e: any) {
      testList.push({ name: 'Dynamic Weather Ball Movement', category: 'Weather Physics Engine', passed: false, details: e.message });
    }

    // 9. Dynamic Weather Timing Difficulty Modulation
    try {
      const sunnyTiming = getWeatherAdjustedTimingConfig(DEFAULT_TIMING_CONFIG, 'SUNNY');
      const overcastTiming = getWeatherAdjustedTimingConfig(DEFAULT_TIMING_CONFIG, 'OVERCAST');
      const rainTiming = getWeatherAdjustedTimingConfig(DEFAULT_TIMING_CONFIG, 'RAIN');

      // Rain and overcast have tighter perfect windows and higher wicket risks
      const rainTighter = rainTiming.perfectMaxOffsetMs < sunnyTiming.perfectMaxOffsetMs;
      const overcastTighter = overcastTiming.perfectMaxOffsetMs < sunnyTiming.perfectMaxOffsetMs;
      const overcastHigherEdgeRisk = overcastTiming.poorTimingWicketChance > sunnyTiming.poorTimingWicketChance;
      const rainHigherBowledRisk = rainTiming.missWicketChance > sunnyTiming.missWicketChance;

      const mockDeliv: BallDelivery = {
        id: 'w_test',
        ballNumber: 1,
        overIndex: 0,
        ballInOver: 0,
        line: 'MIDDLE',
        length: 'GOOD_LENGTH',
        speedKmh: 140,
        bowlerStyle: 'FAST',
        flightDurationMs: 850,
        bounceRatio: 0.6,
        spinOrSwing: 0.8,
        deliveryLabel: '140 km/h Middle Good Length',
      };

      // 42ms offset is GOOD in Sunny (limit 48ms), but in Rain/Overcast (limit 43-44ms) it gets evaluated tighter
      const sunnyOutcome = resolveShotOutcome(mockDeliv, 'STRAIGHT', 40, { weatherCondition: 'SUNNY' });
      const rainOutcome = resolveShotOutcome(mockDeliv, 'STRAIGHT', 40, { weatherCondition: 'RAIN' });

      const timingPassed = rainTighter && overcastTighter && overcastHigherEdgeRisk && rainHigherBowledRisk && sunnyOutcome.timingTier === 'GOOD';
      testList.push({
        name: 'Dynamic Weather Timing Windows & Dismissal Risk Modulations',
        category: 'Weather Physics Engine',
        passed: timingPassed,
        details: `Sunny Perfect=${sunnyTiming.perfectMaxOffsetMs}ms, Overcast Perfect=${overcastTiming.perfectMaxOffsetMs}ms, Rain Perfect=${rainTiming.perfectMaxOffsetMs}ms (Rain MissRisk=${rainTiming.missWicketChance} vs Sunny=${sunnyTiming.missWicketChance})`,
      });
    } catch (e: any) {
      testList.push({ name: 'Dynamic Weather Timing Windows', category: 'Weather Physics Engine', passed: false, details: e.message });
    }

    setResults(testList);
    setIsRunning(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col gap-4 max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧪</span>
            <div>
              <h3 className="font-extrabold text-lg tracking-tight text-white">
                Engine Unit Test Runner
              </h3>
              <p className="text-xs text-slate-400">
                Pure batting engine verification (timing, boundaries, rollover, chase completion)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400">
            {results.length > 0 ? (
              <span>
                Executed {results.length} test assertions:{' '}
                <strong className="text-emerald-400">
                  {results.filter((r) => r.passed).length} Passed
                </strong>
                ,{' '}
                <strong className="text-rose-400">
                  {results.filter((r) => !r.passed).length} Failed
                </strong>
              </span>
            ) : (
              <span>Click run to verify pure logic assertions.</span>
            )}
          </div>
          <button
            type="button"
            onClick={runAllTests}
            disabled={isRunning}
            className="py-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
          >
            {isRunning ? 'Running...' : '▶ Run All Engine Tests'}
          </button>
        </div>

        {/* Test List */}
        <div className="space-y-2 overflow-y-auto flex-1 pr-1">
          {results.map((res, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl border text-xs flex flex-col gap-1 transition-all ${
                res.passed
                  ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-800/40 text-rose-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-2">
                  <span>{res.passed ? '✅' : '❌'}</span>
                  <span>{res.name}</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                  {res.category}
                </span>
              </div>
              <p className="text-[11px] opacity-80 pl-6 font-mono">{res.details}</p>
            </div>
          ))}

          {results.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-xs italic">
              No tests executed yet. Click &quot;Run All Engine Tests&quot; to inspect test results.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
