import confetti from 'canvas-confetti';
import React, { useEffect, useRef } from 'react';
import { Trophy, Zap, Target, Flame, RotateCcw, Settings, Home } from 'lucide-react';
import { calculateCurrentRunRate, formatOvers } from '../engine/battingEngine';
import { GameState } from '../types';
import { auth, recordCompletedMatchInFirestore } from '../lib/firebase';
import { recordGuestMatch } from '../lib/guestProfile';

interface InningsSummaryModalProps {
  state: GameState;
  onPlayAgain: () => void;
  onOpenSettings: () => void;
  onReturnHome?: () => void;
  onContinueTournament?: () => void;
}

const InningsSummaryModalComponent: React.FC<InningsSummaryModalProps> = ({
  state,
  onPlayAgain,
  onOpenSettings,
  onReturnHome,
  onContinueTournament,
}) => {
  const { runs, wickets, currentOver, ballInOver, totalLegalBalls, config, batterStats, inningsEndReason, hasWon } = state;
  const crr = calculateCurrentRunRate(runs, totalLegalBalls);
  const hasRecordedRef = useRef(false);

  // Trigger confetti on win and record completed match in Firestore if logged in
  useEffect(() => {
    if (hasWon) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }

    if (!hasRecordedRef.current) {
      hasRecordedRef.current = true;
      const numTotalOvers = typeof config.totalOvers === 'number' ? config.totalOvers : 5;
      const mode = config.isTournamentMatch
        ? (config as any).tournamentType === 'IPL'
          ? 'IPL'
          : 'WORLD_CUP'
        : config.isPractice
        ? 'PRACTICE'
        : 'QUICK_MATCH';

      const userOversNum = Number(formatOvers(currentOver, ballInOver));
      const matchRecordData = {
        mode: mode as any,
        teamSelected: (config as any).userTeam || 'Batting XI',
        opponentTeam: (config as any).bowlingTeam || 'Opponent XI',
        userRuns: runs,
        userWickets: wickets,
        userOvers: userOversNum,
        target: config.target || 0,
        opponentRuns: config.target ? config.target - 1 : 0,
        opponentWickets: 0,
        opponentOvers: numTotalOvers,
        result: hasWon ? ('WON' as const) : ('LOST' as const),
        resultText: hasWon ? 'Victory' : 'Defeat',
      };

      if (auth.currentUser) {
        recordCompletedMatchInFirestore(auth.currentUser.uid, matchRecordData)
          .catch((err) => console.warn('Could not record match in Firestore:', err));
      } else {
        recordGuestMatch(matchRecordData);
      }
    }
  }, [hasWon, auth.currentUser, runs, wickets, currentOver, ballInOver, config]);

  // Compute wagon wheel distribution from history
  let offSideRuns = 0;
  let straightRuns = 0;
  let onSideRuns = 0;

  state.ballHistory.forEach((item) => {
    if (item.outcome.shotDirection === 'OFF_SIDE') offSideRuns += item.outcome.runs;
    else if (item.outcome.shotDirection === 'STRAIGHT') straightRuns += item.outcome.runs;
    else if (item.outcome.shotDirection === 'ON_SIDE') onSideRuns += item.outcome.runs;
  });

  const numTotalOvers = typeof config.totalOvers === 'number' ? config.totalOvers : (typeof config.totalOvers === 'object' && config.totalOvers !== null ? Number((config.totalOvers as any).totalOvers) || 5 : 5);
  const numTotalWickets = typeof config.totalWickets === 'number' ? config.totalWickets : (typeof config.totalWickets === 'object' && config.totalWickets !== null ? Number((config.totalWickets as any).totalWickets) || 10 : 10);
  const isUnlimitedOvers = numTotalOvers === 0 || !Number.isFinite(numTotalOvers);

  const getResultTitle = () => {
    if (config.target !== undefined) {
      if (hasWon) {
        const wicketsLeft = numTotalWickets - wickets;
        const remainingBalls = isUnlimitedOvers ? null : numTotalOvers * 6 - totalLegalBalls;
        return {
          title: 'VICTORY! TARGET CHASED!',
          subtitle: `Won by ${wicketsLeft} wicket${wicketsLeft > 1 ? 's' : ''}${
            remainingBalls !== null
              ? ` with ${remainingBalls} balls remaining!`
              : ` in ${formatOvers(currentOver, ballInOver)} overs (Unlimited Format)!`
          }`,
          color: 'text-emerald-400',
          badgeBg: 'bg-emerald-500/20 border-emerald-500/50',
        };
      }
      return {
        title: 'MATCH DEFEAT',
        subtitle: `Fell short by ${Math.max(0, config.target - runs)} runs (${wickets}/${numTotalWickets} wickets lost).`,
        color: 'text-rose-400',
        badgeBg: 'bg-rose-500/20 border-rose-500/50',
      };
    }

    if (inningsEndReason === 'ALL_OUT') {
      return {
        title: 'ALL OUT!',
        subtitle: `Innings completed at ${runs}/${wickets} in ${formatOvers(currentOver, ballInOver)} overs (all ${numTotalWickets} wickets fell).`,
        color: 'text-amber-400',
        badgeBg: 'bg-amber-500/20 border-amber-500/50',
      };
    }

    return {
      title: 'INNINGS COMPLETE!',
      subtitle: isUnlimitedOvers
        ? `Innings concluded after ${formatOvers(currentOver, ballInOver)} overs.`
        : `Completed full quota of ${numTotalOvers} overs.`,
      color: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/20 border-cyan-500/50',
    };
  };

  const result = getResultTitle();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 animate-fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header Banner */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 mb-2">
            {hasWon ? (
              <Trophy className="w-7 h-7 text-amber-400" />
            ) : inningsEndReason === 'ALL_OUT' ? (
              <Zap className="w-7 h-7 text-rose-400" />
            ) : (
              <Target className="w-7 h-7 text-cyan-400" />
            )}
          </div>
          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${result.color}`}>
            {result.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {result.subtitle}
          </p>
        </div>

        {/* Primary Score Board Pill */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-3 divide-x divide-slate-800 text-center">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Score</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400">
              {runs}<span className="text-slate-500 text-lg">/{wickets}</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Overs</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-200">
              {formatOvers(currentOver, ballInOver)}
              <span className="text-slate-500 text-sm font-normal">
                /{isUnlimitedOvers ? '∞' : numTotalOvers}
              </span>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Run Rate</div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400">
              {crr}
            </div>
          </div>
        </div>

        {/* Batter Statistics Card */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
            <span>Striker Scorecard</span>
            <span className="text-amber-400 font-mono">SR: {batterStats.strikeRate}</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Runs</span>
              <span className="font-extrabold text-white text-base">{batterStats.runs}</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Balls</span>
              <span className="font-extrabold text-white text-base">{batterStats.ballsFaced}</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Fours (4s)</span>
              <span className="font-extrabold text-amber-400 text-base">{batterStats.fours}</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Sixes (6s)</span>
              <span className="font-extrabold text-purple-400 text-base">{batterStats.sixes}</span>
            </div>
          </div>

          {state.highestBoundaryStreak >= 2 && (
            <div className="mt-2.5 p-2 rounded-xl bg-gradient-to-r from-purple-950/70 via-pink-950/60 to-amber-950/70 border border-pink-500/30 flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5 font-semibold">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Longest Consecutive Boundary Streak:</span>
              </span>
              <span className="font-black text-amber-300 text-sm">
                {state.highestBoundaryStreak} in a row!
              </span>
            </div>
          )}
        </div>

        {/* Wagon Wheel / Directional Runs Breakdown */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Scoring Zones (Wagon Wheel)
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400">Off-Side (Cut/Cover)</div>
              <div className="text-lg font-bold text-amber-400">{offSideRuns} runs</div>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400">Straight Drive</div>
              <div className="text-lg font-bold text-cyan-400">{straightRuns} runs</div>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400">On-Side (Pull/Flick)</div>
              <div className="text-lg font-bold text-emerald-400">{onSideRuns} runs</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 flex-wrap sm:flex-nowrap">
          {config.isTournamentMatch && onContinueTournament ? (
            <button
              type="button"
              onClick={onContinueTournament}
              className="flex-1 min-h-[44px] py-3 px-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/30 active:scale-95 flex items-center justify-center gap-2 font-['Teko',sans-serif] text-base cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-slate-950" />
              <span>{config.tournamentType === 'IPL' ? 'CONTINUE ICL' : 'CONTINUE WORLD CUP'}</span>
            </button>
          ) : (
            <>
              {onReturnHome && (
                <button
                  type="button"
                  onClick={onReturnHome}
                  className="min-h-[44px] py-3 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs sm:text-sm border border-slate-700 transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow cursor-pointer"
                >
                  <Home className="w-4 h-4 text-slate-400" />
                  <span>Menu</span>
                </button>
              )}

              <button
                type="button"
                onClick={onPlayAgain}
                className="flex-1 min-h-[44px] py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>

              <button
                type="button"
                onClick={onOpenSettings}
                className="min-h-[44px] py-3 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs sm:text-sm border border-slate-700 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Setup</span>
              </button>
            </>
          )}

          {config.isTournamentMatch && onReturnHome && (
            <button
              type="button"
              onClick={onReturnHome}
              className="min-h-[44px] py-3 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs sm:text-sm border border-slate-700 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span>Title</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export const InningsSummaryModal = React.memo(InningsSummaryModalComponent);
