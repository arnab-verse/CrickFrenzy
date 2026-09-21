import React, { useMemo } from 'react';
import {
  Zap,
  Activity,
  AlertCircle,
  Sparkles,
  Footprints,
  Shield,
  Radio,
} from 'lucide-react';
import { BallDelivery, ShotOutcome } from '../types';

interface CommentaryBoxProps {
  lastOutcome: ShotOutcome | null;
  currentDelivery: BallDelivery | null;
  isBallInFlight?: boolean;
  isBowlerRunningUp?: boolean;
  bowlerRunUpProgress?: number;
  isPracticeMode?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Commentary Box component providing dynamic, broadcast-style cricket reactions
 * based on shot outcomes, timing, bowler actions, and delivery context.
 */
export const CommentaryBox: React.FC<CommentaryBoxProps> = ({
  lastOutcome,
  currentDelivery,
  isBallInFlight = false,
  isBowlerRunningUp = false,
  bowlerRunUpProgress = 0,
  isPracticeMode = false,
  compact = false,
  className = '',
}) => {
  // Generate situational dynamic commentary text
  const commentaryInfo = useMemo(() => {
    // 1. If bowler is running in right now
    if (isBowlerRunningUp && currentDelivery) {
      const style = currentDelivery.bowlerStyle.replace('_', ' ').toLowerCase();
      const runP = bowlerRunUpProgress;
      
      let actionText = `Bowler running in with ${style}...`;
      if (runP > 0.7) {
        actionText = `Bowler gathers and leaps into the delivery stride!`;
      } else if (runP > 0.3) {
        actionText = `Bowler charging towards the bowling crease...`;
      }

      return {
        tag: 'LIVE',
        tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        quote: actionText,
        subtext: `${currentDelivery.speedKmh} km/h • ${currentDelivery.deliveryLabel}`,
        icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
        isAction: true,
      };
    }

    // 2. If ball is currently airborne / in flight
    if (isBallInFlight && currentDelivery) {
      return {
        tag: 'BALL IN FLIGHT',
        tagColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40 animate-pulse',
        quote: `Delivery released! Watching the pitch line and length closely...`,
        subtext: `${currentDelivery.deliveryLabel} • Tracking ball trajectory`,
        icon: <Activity className="w-3.5 h-3.5 text-sky-400" />,
        isAction: true,
      };
    }

    // 3. If there is a last shot outcome to react to
    if (lastOutcome) {
      const { runs, isWicket, wicketType, shotName, timingTier, timingOffsetMs, boundaryType, hitDistanceMeters } = lastOutcome;
      const timingLabel = timingTier.replace('_', ' ');
      const offsetSign = timingOffsetMs > 0 ? `+${timingOffsetMs}ms late` : `${timingOffsetMs}ms early`;

      if (isWicket) {
        let quote = lastOutcome.commentary;
        if (!quote) {
          if (wicketType === 'BOWLED') quote = 'TIMBER! Clean bowled, stumps sent flying in all directions!';
          else if (wicketType === 'LBW') quote = 'PLUMB IN FRONT! Huge shout from the bowler and given LBW!';
          else if (wicketType === 'EDGED_BEHIND') quote = 'Edged and gone! Faint tickle through to the keeper!';
          else quote = 'IN THE AIR AND TAKEN! High catch swallowed cleanly by the fielder!';
        }

        return {
          tag: 'WICKET',
          tagColor: 'bg-rose-500/25 text-rose-300 border-rose-500/50',
          quote: `“${quote}”`,
          subtext: `${shotName} • ${timingLabel} (${offsetSign})`,
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400" />,
          isAction: false,
        };
      }

      if (boundaryType === 'SIX') {
        const distanceStr = hitDistanceMeters ? ` (${hitDistanceMeters}m)` : '';
        const quote = lastOutcome.commentary || 'BOOM! Cracking shot for SIX! Sent sailing into the top tier!';
        return {
          tag: `SIX${distanceStr}`,
          tagColor: 'bg-fuchsia-500/25 text-fuchsia-300 border-fuchsia-500/50',
          quote: `“${quote}”`,
          subtext: `${shotName} • ${timingLabel} timing (${offsetSign})`,
          icon: <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />,
          isAction: false,
        };
      }

      if (boundaryType === 'FOUR' || runs === 4) {
        const quote = lastOutcome.commentary || 'What a beautiful drive! Pierces the gap for FOUR!';
        return {
          tag: 'FOUR',
          tagColor: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50',
          quote: `“${quote}”`,
          subtext: `${shotName} • ${timingLabel} timing (${offsetSign})`,
          icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" />,
          isAction: false,
        };
      }

      if (runs > 0) {
        const quote = lastOutcome.commentary || (runs === 1 ? 'Smart batting! Nudged into the gap for a quick single.' : 'Great hustle between the wickets, turns one into two!');
        return {
          tag: `${runs} ${runs === 1 ? 'RUN' : 'RUNS'}`,
          tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          quote: `“${quote}”`,
          subtext: `${shotName} • ${timingLabel} (${offsetSign})`,
          icon: <Footprints className="w-3.5 h-3.5 text-cyan-400" />,
          isAction: false,
        };
      }

      // Dot ball / Play and miss
      const quote = lastOutcome.commentary || 'Swung and missed! Good probing line from the bowler.';
      return {
        tag: 'DOT BALL',
        tagColor: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
        quote: `“${quote}”`,
        subtext: `${shotName} • ${timingLabel} (${offsetSign})`,
        icon: <Shield className="w-3.5 h-3.5 text-slate-400" />,
        isAction: false,
      };
    }

    // 4. Default idle welcome state
    return {
      tag: isPracticeMode ? 'NETS SESSION' : 'MATCH ON',
      tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      quote: isPracticeMode
        ? '“Welcome to the nets! Pick your target gaps and get your timing locked in.”'
        : '“Pitch looks fast and true today! Batters ready to take strike.”',
      subtext: 'Awaiting the next delivery',
      icon: <Radio className="w-3.5 h-3.5 text-amber-400" />,
      isAction: false,
    };
  }, [lastOutcome, currentDelivery, isBallInFlight, isBowlerRunningUp, bowlerRunUpProgress, isPracticeMode]);

  return (
    <div
      id="commentary-box"
      className={`w-full bg-slate-900 border border-slate-800 rounded-xl shadow-lg shadow-black/40 flex items-center justify-between gap-2.5 sm:gap-3.5 transition-all duration-300 ${
        compact ? 'px-2.5 py-1.5' : 'px-3.5 py-2'
      } ${className}`}
    >
      {/* Left: Broadcast Mic & Event Tag */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-800/90 border border-slate-700 flex items-center justify-center text-xs sm:text-sm shadow-inner">
          {commentaryInfo.icon}
        </div>
        <span
          className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm ${commentaryInfo.tagColor}`}
        >
          {commentaryInfo.tag}
        </span>
      </div>

      {/* Center: Dynamic Text Commentary Reaction */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <p
          className={`text-slate-100 font-semibold truncate leading-tight tracking-tight ${
            compact ? 'text-xs' : 'text-xs sm:text-sm'
          }`}
          title={commentaryInfo.quote}
        >
          {commentaryInfo.quote}
        </p>
        <span
          className={`text-slate-400 font-medium truncate leading-none mt-0.5 ${
            compact ? 'text-[10px]' : 'text-[10px] sm:text-[11px]'
          }`}
        >
          {commentaryInfo.subtext}
        </span>
      </div>

      {/* Right: Atmosphere Audio Visualizer indicator / Commentary pill */}
      <div className="hidden sm:flex items-center gap-1 flex-shrink-0 pl-1 border-l border-slate-800/80">
        <div className="flex items-end gap-0.5 h-3.5">
          <div className="w-0.5 h-2 bg-emerald-400/80 rounded-full animate-pulse" style={{ animationDuration: '0.8s' }} />
          <div className="w-0.5 h-3.5 bg-emerald-400 rounded-full animate-pulse" style={{ animationDuration: '0.5s' }} />
          <div className="w-0.5 h-1.5 bg-emerald-400/70 rounded-full animate-pulse" style={{ animationDuration: '0.9s' }} />
        </div>
        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-tighter">
          COMM
        </span>
      </div>
    </div>
  );
};
