import React from 'react';
import { TimingThresholdConfig } from '../config/timingConfig';
import { ShotDirection, ShotOutcome, TimingTier } from '../types';

interface TimingMeterProps {
  progress: number; // 0 to 1 (0 = bowler hand, 1 = ideal hit zone, > 1 = past the bat)
  isBallInFlight: boolean;
  timingConfig: TimingThresholdConfig;
  lastOutcome: ShotOutcome | null;
  selectedDirection: ShotDirection;
  onSwing: () => void;
  canSwing: boolean;
  onBowl?: () => void;
}

const TimingMeterComponent: React.FC<TimingMeterProps> = ({
  progress,
  isBallInFlight,
  timingConfig,
  lastOutcome,
  selectedDirection,
  onSwing,
  canSwing,
  onBowl,
}) => {
  const sweetSpotPercent = 80;

  const getTierColor = (tier: TimingTier) => {
    switch (tier) {
      case 'PERFECT':
        return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/50';
      case 'GOOD':
        return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/50';
      case 'EARLY':
      case 'LATE':
        return 'text-amber-400 bg-amber-500/20 border-amber-500/50';
      case 'VERY_EARLY':
      case 'VERY_LATE':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'MISS':
      default:
        return 'text-rose-400 bg-rose-500/20 border-rose-500/50';
    }
  };

  const markerPercent = Math.min(100, Math.max(0, progress * sweetSpotPercent));

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (canSwing) {
      onSwing();
    } else {
      onBowl?.();
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      role="button"
      tabIndex={0}
      aria-label="Horizontal Timing Window - Click to swing"
      className="w-full max-w-2xl mx-auto px-4 py-3 bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 shadow-xl select-none cursor-pointer transition-colors"
    >
      
      {/* Top Status & Direction Display */}
      <div className="flex items-center justify-between text-xs mb-2 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="font-russo text-slate-400 uppercase tracking-wider text-[10px]">
            Timing Window
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-amber-400 font-russo text-[11px] uppercase tracking-wide">
            Shot: <strong className="text-white pl-0.5 font-normal font-sans">{selectedDirection.replace('_', ' ')}</strong>
          </span>
        </div>

        <div className="text-[11px] text-slate-400 font-russo tracking-wide">
          {isBallInFlight ? (
            <span className="text-emerald-400 font-black animate-pulse">
              BALL APPROACHING — HIT NOW!
            </span>
          ) : (
            <span className="font-sans text-slate-400">Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono text-[10px]">SPACE</kbd> or Tap to Hit</span>
          )}
        </div>
      </div>

      {/* The Visual Hit Zone Bar */}
      <div className="relative w-full h-8 bg-slate-950 rounded-xl overflow-hidden border border-slate-700/80 p-0.5 shadow-inner select-none pointer-events-none">
        
        {/* Color-Coded Hit Zones */}
        <div className="absolute inset-0 flex h-full">
          <div className="w-[45%] h-full bg-slate-900/40 border-r border-slate-800" title="Very Early" />
          <div className="w-[20%] h-full bg-amber-950/30 border-r border-amber-800/40" title="Early" />
          <div className="w-[10%] h-full bg-cyan-950/40 border-r border-cyan-500/40" title="Good Timing" />
          
          <div className="w-[10%] h-full bg-gradient-to-r from-emerald-500/40 via-emerald-400/70 to-emerald-500/40 border-x-2 border-emerald-400 flex items-center justify-center relative shadow-lg shadow-emerald-500/20">
            <span className="text-[9px] font-black text-emerald-200 tracking-tighter uppercase opacity-90">
              SWEET SPOT
            </span>
          </div>

          <div className="w-[5%] h-full bg-cyan-950/40 border-r border-cyan-500/40" title="Good Timing" />
          <div className="w-[10%] h-full bg-rose-950/40" title="Miss / Beaten" />
        </div>

        {/* Ideal Target Line */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-white z-10 shadow-[0_0_8px_#ffffff]"
          style={{ left: `${sweetSpotPercent}%` }}
        />

        {/* Moving Approaching Ball Marker */}
        {isBallInFlight && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 pointer-events-none will-change-transform"
            style={{ left: `${markerPercent}%` }}
          >
            <div className="relative flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-amber-400/40 animate-ping absolute" />
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-rose-500 via-rose-600 to-rose-800 border-2 border-white shadow-md flex items-center justify-center">
                <div className="w-2.5 h-[1.5px] bg-white/70 rounded-full rotate-45" />
              </div>
            </div>
          </div>
        )}

        {/* Last Hit Contact Point Marker */}
        {!isBallInFlight && lastOutcome && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-amber-400 z-15 shadow-[0_0_6px_#fbbf24]"
            style={{
              left: `${Math.min(98, Math.max(2, sweetSpotPercent + (lastOutcome.timingOffsetMs / 320) * 20))}%`,
            }}
            title={`Hit at ${lastOutcome.timingOffsetMs}ms`}
          />
        )}
      </div>

      {/* Timing Zone Labels */}
      <div className="flex items-center justify-between mt-2 text-xs text-slate-400 font-sports tracking-widest pointer-events-none">
        <span>APPROACH</span>
        <span className="text-amber-300">DEFENSIVE</span>
        <span className="text-cyan-300">FOURS</span>
        <span className="text-emerald-400 font-bold">★ SIX ZONE ★</span>
        <span className="text-rose-400">MISS</span>
      </div>

      {/* Dynamic Feedback on Last Shot */}
      {lastOutcome && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded text-xs font-russo tracking-wider border ${getTierColor(
                lastOutcome.timingTier
              )}`}
            >
              {lastOutcome.timingTier.replace('_', ' ')}
            </span>
            <span className="text-xs font-russo uppercase text-amber-400 tracking-wide">
              {lastOutcome.shotName}
            </span>
          </div>

          <div className="text-xs text-slate-300 italic font-sans max-w-[60%] text-right truncate">
            {lastOutcome.commentary}
          </div>
        </div>
      )}
    </div>
  );
};

export const TimingMeter = React.memo(TimingMeterComponent);
