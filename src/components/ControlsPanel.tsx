import React from 'react';
import {
  Target,
  Shuffle,
  Zap,
  RotateCw,
  Wind,
  Sparkles,
  ArrowLeft,
  ArrowUp,
  ArrowRight,
  Play,
  Pause,
  Activity,
} from 'lucide-react';
import { BattingStance, BowlerFilter, ShotDirection } from '../types';

interface ControlsPanelProps {
  selectedDirection: ShotDirection;
  onSelectDirection: (direction: ShotDirection) => void;
  onSwing: () => void;
  canSwing: boolean;
  onNextBall: () => void;
  isBallInFlight: boolean;
  isInningsOver: boolean;
  autoBowl: boolean;
  onToggleAutoBowl: () => void;
  bowlerFilter?: BowlerFilter;
  onSelectBowlerFilter?: (filter: BowlerFilter) => void;
  battingStance?: BattingStance;
  onToggleStance?: () => void;
  isTournamentMatch?: boolean;
}

const ControlsPanelComponent: React.FC<ControlsPanelProps> = ({
  selectedDirection,
  onSelectDirection,
  onSwing,
  canSwing,
  onNextBall,
  isBallInFlight,
  isInningsOver,
  autoBowl,
  onToggleAutoBowl,
  bowlerFilter = 'AUTO',
  onSelectBowlerFilter,
  battingStance = 'RIGHT',
  onToggleStance,
  isTournamentMatch = false,
}) => {
  const isRightHanded = battingStance === 'RIGHT';

  const handleSwingAction = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (canSwing && !isInningsOver) {
      onSwing();
    }
  };

  const handleBowlAction = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!isBallInFlight && !isInningsOver) {
      onNextBall();
    }
  };

  const leftTargetDir: ShotDirection = isRightHanded ? 'ON_SIDE' : 'OFF_SIDE';
  const rightTargetDir: ShotDirection = isRightHanded ? 'OFF_SIDE' : 'ON_SIDE';

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-3 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl flex flex-col gap-3 select-none">
      
      {/* Bowler Selection Row */}
      {onSelectBowlerFilter && (
        <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span>Attack:</span>
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              type="button"
              onClick={() => onSelectBowlerFilter('AUTO')}
              className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 justify-center cursor-pointer ${
                bowlerFilter === 'AUTO'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Rotation</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectBowlerFilter('PACER')}
              className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 justify-center cursor-pointer ${
                bowlerFilter === 'PACER'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Pace</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectBowlerFilter('OFF_SPIN')}
              className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 justify-center cursor-pointer ${
                bowlerFilter === 'OFF_SPIN'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Off-Spin</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectBowlerFilter('LEG_SPIN')}
              className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 justify-center cursor-pointer ${
                bowlerFilter === 'LEG_SPIN'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Leg-Spin</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectBowlerFilter('MYSTERY_SPIN')}
              className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 justify-center cursor-pointer ${
                bowlerFilter === 'MYSTERY_SPIN'
                  ? 'bg-purple-500 text-slate-950 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mystery</span>
            </button>
          </div>
        </div>
      )}

      {/* Direction Selection Row */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 px-1">
          <span className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <span>1. Choose Shot Direction</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[10px]">Keys: A / W / D</span>
            {isTournamentMatch ? (
              <div
                className="min-h-[44px] px-3 py-1 rounded-xl bg-slate-950 text-amber-300 border border-slate-800 text-xs font-bold flex items-center gap-1.5 opacity-90 cursor-default"
                title="Squad player stance is set by default in tournament matches"
              >
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>{isRightHanded ? 'RHB (Default)' : 'LHB (Default)'}</span>
              </div>
            ) : (
              onToggleStance && (
                <button
                  type="button"
                  onClick={onToggleStance}
                  className="min-h-[44px] px-3 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-300 border border-slate-800 hover:border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Click to toggle between Right-Handed (RHB) and Left-Handed (LHB)"
                >
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isRightHanded ? 'RHB (Righty)' : 'LHB (Lefty)'}</span>
                </button>
              )
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Left Field Button */}
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); onSelectDirection(leftTargetDir); }}
            onClick={(e) => { e.preventDefault(); onSelectDirection(leftTargetDir); }}
            className={`min-h-[56px] sm:min-h-[64px] py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
              selectedDirection === leftTargetDir
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/25 scale-[1.02]'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{isRightHanded ? 'LEG-SIDE' : 'OFF-SIDE'}</span>
            <span className="text-[10px] font-normal opacity-80">
              {isRightHanded ? 'Pull / Hook / Flick' : 'Cut / Cover Drive'}
            </span>
          </button>

          {/* STRAIGHT Button */}
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); onSelectDirection('STRAIGHT'); }}
            onClick={(e) => { e.preventDefault(); onSelectDirection('STRAIGHT'); }}
            className={`min-h-[56px] sm:min-h-[64px] py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
              selectedDirection === 'STRAIGHT'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/25 scale-[1.02]'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
            }`}
          >
            <ArrowUp className="w-5 h-5" />
            <span>STRAIGHT</span>
            <span className="text-[10px] font-normal opacity-80">Lofted Punch / Drive</span>
          </button>

          {/* Right Field Button */}
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); onSelectDirection(rightTargetDir); }}
            onClick={(e) => { e.preventDefault(); onSelectDirection(rightTargetDir); }}
            className={`min-h-[56px] sm:min-h-[64px] py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
              selectedDirection === rightTargetDir
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/25 scale-[1.02]'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
            }`}
          >
            <ArrowRight className="w-5 h-5" />
            <span>{isRightHanded ? 'OFF-SIDE' : 'LEG-SIDE'}</span>
            <span className="text-[10px] font-normal opacity-80">
              {isRightHanded ? 'Cut / Cover Drive' : 'Pull / Hook / Flick'}
            </span>
          </button>
        </div>
      </div>

      {/* Action Trigger Buttons */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
        {/* BIG SWING BAT BUTTON */}
        <button
          type="button"
          onPointerDown={handleSwingAction}
          onClick={handleSwingAction}
          disabled={!canSwing || isInningsOver}
          className={`flex-1 min-h-[48px] py-3 px-6 rounded-xl font-black text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 cursor-pointer ${
            canSwing && !isInningsOver
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 border border-emerald-300 shadow-emerald-500/30 ring-2 ring-emerald-400/40'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
          }`}
        >
          <Zap className="w-4 h-4 fill-slate-950" />
          <span>SWING BAT</span>
          <span className="text-xs font-mono opacity-80">(SPACE / ENTER)</span>
        </button>

        {/* BOWL / NEXT BALL BUTTON */}
        {!isBallInFlight && !isInningsOver && (
          <button
            type="button"
            onPointerDown={handleBowlAction}
            onClick={handleBowlAction}
            title="Bowl Next Ball"
            className="min-h-[48px] py-3 px-4 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center justify-center active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-200" />
          </button>
        )}

        {/* AUTO BOWL TOGGLE */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onToggleAutoBowl(); }}
          className={`min-h-[48px] py-3 px-3.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            autoBowl
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
          }`}
          title="Automatically bowl the next ball after 2.5 seconds"
        >
          {autoBowl ? <Zap className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-slate-400" />}
          <span>{autoBowl ? 'Auto' : 'Manual'}</span>
        </button>
      </div>
    </div>
  );
};

export const ControlsPanel = React.memo(ControlsPanelComponent);
