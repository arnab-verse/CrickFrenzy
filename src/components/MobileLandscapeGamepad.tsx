import React from 'react';
import { ArrowLeft, ArrowUp, ArrowRight, Zap, Play } from 'lucide-react';
import { BattingStance, ShotDirection } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface MobileLandscapeGamepadProps {
  selectedDirection: ShotDirection;
  onSelectDirection: (direction: ShotDirection) => void;
  onSwing: (direction?: ShotDirection) => void;
  canSwing: boolean;
  isBallInFlight: boolean;
  isInningsOver: boolean;
  onBowl: () => void;
  autoBowl: boolean;
  onToggleAutoBowl: () => void;
  children?: React.ReactNode; // Can hold the RightTimingMeter in the right flank
}

const MobileLandscapeLeftControlsComponent: React.FC<{
  selectedDirection: ShotDirection;
  onSelectDirection: (direction: ShotDirection) => void;
  onSwing: (direction?: ShotDirection) => void;
  canSwing: boolean;
  battingStance?: BattingStance;
}> = ({ selectedDirection, onSelectDirection, onSwing, canSwing, battingStance = 'RIGHT' }) => {
  const isRightHanded = battingStance === 'RIGHT';
  const leftTargetDir: ShotDirection = isRightHanded ? 'ON_SIDE' : 'OFF_SIDE';
  const rightTargetDir: ShotDirection = isRightHanded ? 'OFF_SIDE' : 'ON_SIDE';

  const handleDirectionPress = (dir: ShotDirection) => {
    triggerHaptic('tap');
    onSelectDirection(dir);
    // If ball is active in the air, pressing the directional pad directly hits that shot!
    if (canSwing) {
      onSwing(dir);
    }
  };

  return (
    <div
      className="flex flex-col justify-between items-stretch gap-1.5 h-full w-20 sm:w-24 select-none z-20 flex-shrink-0"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Label */}
      <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 text-center py-0.5">
        SHOT DIR
      </div>

      {/* 1. LEFT FIELD BUTTON */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          handleDirectionPress(leftTargetDir);
        }}
        className={`flex-1 flex flex-col items-center justify-center rounded-2xl border transition-all touch-manipulation cursor-pointer ${
          selectedDirection === leftTargetDir
            ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black border-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.7)] scale-[1.03] ring-2 ring-amber-300'
            : 'bg-slate-900/90 text-slate-200 border-slate-700/80 active:bg-slate-800'
        }`}
        aria-label={isRightHanded ? 'Aim Leg-Side' : 'Aim Off-Side'}
      >
        <ArrowLeft className="w-5 h-5 leading-none" />
        <span className="text-xs sm:text-sm font-black tracking-tight mt-0.5">
          {isRightHanded ? 'LEG' : 'OFF'}
        </span>
        <span className={`text-[8px] ${selectedDirection === leftTargetDir ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
          {isRightHanded ? 'Pull/Flick' : 'Cut/Drive'}
        </span>
      </button>

      {/* 2. STRAIGHT BUTTON */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          handleDirectionPress('STRAIGHT');
        }}
        className={`flex-1 flex flex-col items-center justify-center rounded-2xl border transition-all touch-manipulation cursor-pointer ${
          selectedDirection === 'STRAIGHT'
            ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black border-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.7)] scale-[1.03] ring-2 ring-amber-300'
            : 'bg-slate-900/90 text-slate-200 border-slate-700/80 active:bg-slate-800'
        }`}
        aria-label="Aim Straight"
      >
        <ArrowUp className="w-5 h-5 leading-none" />
        <span className="text-xs sm:text-sm font-black tracking-tight mt-0.5">MID</span>
        <span className={`text-[8px] ${selectedDirection === 'STRAIGHT' ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
          Straight
        </span>
      </button>

      {/* 3. RIGHT FIELD BUTTON */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          handleDirectionPress(rightTargetDir);
        }}
        className={`flex-1 flex flex-col items-center justify-center rounded-2xl border transition-all touch-manipulation cursor-pointer ${
          selectedDirection === rightTargetDir
            ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black border-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.7)] scale-[1.03] ring-2 ring-amber-300'
            : 'bg-slate-900/90 text-slate-200 border-slate-700/80 active:bg-slate-800'
        }`}
        aria-label={isRightHanded ? 'Aim Off-Side' : 'Aim Leg-Side'}
      >
        <ArrowRight className="w-5 h-5 leading-none" />
        <span className="text-xs sm:text-sm font-black tracking-tight mt-0.5">
          {isRightHanded ? 'OFF' : 'LEG'}
        </span>
        <span className={`text-[8px] ${selectedDirection === rightTargetDir ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
          {isRightHanded ? 'Cut/Drive' : 'Pull/Flick'}
        </span>
      </button>
    </div>
  );
};

export const MobileLandscapeLeftControls = React.memo(MobileLandscapeLeftControlsComponent);

const MobileLandscapeRightControlsComponent: React.FC<{
  onSwing: () => void;
  canSwing: boolean;
  isBallInFlight: boolean;
  isInningsOver: boolean;
  onBowl: () => void;
  autoBowl: boolean;
  onToggleAutoBowl: () => void;
  children?: React.ReactNode;
}> = ({
  onSwing,
  canSwing,
  isBallInFlight,
  isInningsOver,
  onBowl,
  autoBowl,
  onToggleAutoBowl,
  children,
}) => {
  const handleSwingTap = (e: React.PointerEvent) => {
    e.preventDefault();
    if (canSwing && !isInningsOver) {
      triggerHaptic('hit');
      onSwing();
    }
  };

  const handleBowlTap = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!isBallInFlight && !isInningsOver) {
      triggerHaptic('tap');
      onBowl();
    }
  };

  return (
    <div
      className="flex flex-col justify-between items-stretch gap-1.5 h-full w-24 sm:w-28 select-none z-20 flex-shrink-0"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Top Timing Meter slot */}
      <div className="flex-1 min-h-0 flex items-center justify-center">
        {children}
      </div>

      {/* Main Big Thumb Action Trigger */}
      <div className="flex flex-col gap-1 flex-shrink-0">
        {canSwing ? (
          <button
            type="button"
            onPointerDown={handleSwingTap}
            className="w-full h-14 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-500 text-slate-950 font-black text-sm sm:text-base tracking-wider border-2 border-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.8)] animate-pulse active:scale-95 flex flex-col items-center justify-center touch-manipulation cursor-pointer ring-2 ring-emerald-300"
          >
            <Zap className="w-5 h-5 fill-slate-950" />
            <span className="leading-tight font-black tracking-tight mt-0.5">SWING!</span>
          </button>
        ) : !isInningsOver ? (
          <button
            type="button"
            onPointerDown={handleBowlTap}
            title="Bowl Next Ball"
            className="w-full h-14 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-slate-950 font-black tracking-wider border-2 border-amber-300 shadow-lg active:scale-95 flex items-center justify-center touch-manipulation cursor-pointer"
          >
            <Play className="w-6 h-6 fill-slate-950" />
          </button>
        ) : (
          <div className="w-full h-14 sm:h-16 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 font-bold text-xs flex items-center justify-center text-center px-1">
            INNINGS OVER
          </div>
        )}

        {/* Auto Bowl / Mode Toggle Pill */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            triggerHaptic('tap');
            onToggleAutoBowl();
          }}
          className={`w-full min-h-[44px] py-2 px-2 rounded-xl text-[11px] font-bold border flex items-center justify-center gap-1.5 transition-colors touch-manipulation cursor-pointer active:scale-95 ${
            autoBowl
              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/80'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          {autoBowl ? (
            <>
              <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span>Auto Bowl: ON</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-slate-400" />
              <span>Manual Bowl</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export const MobileLandscapeRightControls = React.memo(MobileLandscapeRightControlsComponent);
