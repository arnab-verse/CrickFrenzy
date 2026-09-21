import React from 'react';
import { TimingThresholdConfig } from '../config/timingConfig';
import { ShotDirection, ShotOutcome, TimingTier } from '../types';

interface RightTimingMeterProps {
  progress: number; // 0 to 1 (0 = release, 1 = ideal hit zone, > 1 = past bat)
  isBallInFlight: boolean;
  timingConfig: TimingThresholdConfig;
  lastOutcome: ShotOutcome | null;
  selectedDirection: ShotDirection;
  speedKmh?: number;
  onSwing?: () => void;
  onBowl?: () => void;
  compact?: boolean;
  className?: string;
}

const RightTimingMeterComponent: React.FC<RightTimingMeterProps> = ({
  progress,
  isBallInFlight,
  timingConfig,
  lastOutcome,
  selectedDirection,
  speedKmh = 130,
  onSwing,
  onBowl,
  compact = false,
  className = '',
}) => {
  const sweetSpotYPercent = 78;
  const markerYPercent = Math.min(100, Math.max(0, progress * sweetSpotYPercent));

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

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (isBallInFlight) {
      onSwing?.();
    } else {
      onBowl?.();
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      role="button"
      tabIndex={0}
      aria-label="Timing Meter - Tap to swing or bowl"
      className={
        className ||
        `w-24 sm:w-28 h-full bg-slate-900 rounded-2xl border-2 border-slate-800 shadow-2xl ${
          compact ? 'p-1.5' : 'p-2.5'
        } flex flex-col justify-between items-center select-none relative overflow-hidden cursor-pointer hover:border-slate-700 transition-colors`
      }
    >
      
      {/* Top Header */}
      <div className="w-full text-center pb-1 border-b border-slate-800 pointer-events-none">
        <div className={`font-russo tracking-wider uppercase text-amber-400 ${compact ? 'text-[8px]' : 'text-[10px]'}`}>
          TIMING
        </div>
        {!compact && (
          <div className="text-xs text-slate-400 font-sports tracking-widest leading-none mt-0.5">
            {isBallInFlight ? `${speedKmh} KM/H` : 'TAP TO HIT'}
          </div>
        )}
      </div>

      {/* Vertical Meter Track */}
      <div className={`relative ${compact ? 'w-8 sm:w-10' : 'w-10 sm:w-12'} flex-1 my-1.5 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner flex justify-center pointer-events-none`}>
        
        {/* Color-Coded Vertical Zones */}
        <div className="absolute inset-0 flex flex-col w-full h-full">
          <div className="h-[52%] w-full bg-slate-900/40 border-b border-slate-800/80" />

          <div className="h-[16%] w-full bg-amber-950/30 border-b border-amber-800/40 flex items-center justify-center">
            <span className="text-[7px] text-amber-400 font-bold uppercase tracking-tighter opacity-70">
              EARLY
            </span>
          </div>

          <div className="h-[6%] w-full bg-cyan-950/50 border-b border-cyan-500/40" />

          <div className="h-[8%] w-full bg-gradient-to-b from-emerald-500/40 via-emerald-400/80 to-emerald-500/40 border-y-2 border-emerald-400 shadow-lg shadow-emerald-500/30 flex items-center justify-center relative">
            <span className="text-[8px] font-black text-emerald-200 tracking-tighter uppercase animate-pulse leading-tight text-center">
              HIT
            </span>
          </div>

          <div className="h-[6%] w-full bg-cyan-950/50 border-b border-cyan-500/40 flex items-center justify-center">
            <span className="text-[7px] text-cyan-300 font-bold uppercase tracking-tighter opacity-70">
              GOOD
            </span>
          </div>

          <div className="h-[12%] w-full bg-rose-950/40 flex items-center justify-center">
            <span className="text-[7px] text-rose-400 font-bold uppercase tracking-tighter opacity-70">
              LATE
            </span>
          </div>
        </div>

        {/* Target Sweet Spot Indicator */}
        <div
          className="absolute left-0 right-0 h-[2px] bg-white z-10 shadow-[0_0_8px_#ffffff]"
          style={{ top: `${sweetSpotYPercent}%` }}
        />

        <div
          className="absolute -left-1 w-2 h-2 bg-emerald-400 rotate-45 z-15 shadow-sm"
          style={{ top: `calc(${sweetSpotYPercent}% - 4px)` }}
        />
        <div
          className="absolute -right-1 w-2 h-2 bg-emerald-400 rotate-45 z-15 shadow-sm"
          style={{ top: `calc(${sweetSpotYPercent}% - 4px)` }}
        />

        {/* Moving Ball Needle Marker */}
        {isBallInFlight && (
          <div
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none will-change-transform"
            style={{ top: `${markerYPercent}%` }}
          >
            <div className="relative flex items-center justify-center">
              <div className="w-7 h-7 rounded-full bg-amber-400/30 animate-ping absolute" />
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-500 via-red-600 to-rose-900 border-2 border-white shadow-md flex items-center justify-center">
                <div className="w-3 h-[1.5px] bg-white/80 rounded-full rotate-45" />
              </div>
            </div>
          </div>
        )}

        {/* Ghost Marker on Last Hit */}
        {!isBallInFlight && lastOutcome && (
          <div
            className="absolute left-0 right-0 h-1 bg-amber-400 z-15 shadow-[0_0_8px_#fbbf24]"
            style={{
              top: `${Math.min(98, Math.max(2, sweetSpotYPercent + (lastOutcome.timingOffsetMs / 320) * 16))}%`,
            }}
            title={`Hit at ${lastOutcome.timingOffsetMs}ms`}
          />
        )}
      </div>

      {/* Bottom Readout Badge */}
      <div className="w-full text-center pt-1 border-t border-slate-800 pointer-events-none">
        {lastOutcome ? (
          <div>
            <div
              className={`text-[10px] font-russo uppercase px-1 py-0.5 rounded border tracking-wider ${getTierColor(
                lastOutcome.timingTier
              )}`}
            >
              {lastOutcome.timingTier.replace('_', ' ')}
            </div>
            <div className="text-xs font-sports text-slate-300 mt-0.5 tracking-widest">
              {lastOutcome.timingOffsetMs > 0
                ? `+${Math.round(lastOutcome.timingOffsetMs)}MS`
                : `${Math.round(lastOutcome.timingOffsetMs)}MS`}
            </div>
          </div>
        ) : (
          <div className="text-[9px] text-slate-500 uppercase font-russo tracking-wide">
            TAP TO SWING
          </div>
        )}
      </div>

    </div>
  );
};

export const RightTimingMeter = React.memo(RightTimingMeterComponent);
