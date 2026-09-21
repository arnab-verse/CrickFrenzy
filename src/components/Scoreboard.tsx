import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Shield,
  BarChart3,
  LogOut,
  Settings,
  TestTube,
  Flame,
  Zap,
  Target,
  Wind,
  Trophy,
  Activity,
  Sun,
  CloudSun,
  CloudRain,
  Moon,
} from 'lucide-react';
import { calculateCurrentRunRate, calculateRequiredRunRate, formatOvers } from '../engine/battingEngine';
import { WORLD_CUP_TEAMS } from '../tournament/teamsData';
import { BowlerFilter, GameState } from '../types';
import { FieldingSetup } from '../config/fieldingPresets';
import { soundFx } from '../utils/audio';
import { TeamBadge } from './TeamBadge';

// Smooth counting animation hook
function useAnimatedCounter(value: number, duration: number = 350) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value === prevValueRef.current) return;
    const startValue = prevValueRef.current;
    const diff = value - startValue;
    const startTime = performance.now();
    let animationFrameId: number;

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      const current = Math.round(startValue + diff * easeProgress);

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(update);
      } else {
        setDisplayValue(value);
        prevValueRef.current = value;
      }
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  return displayValue;
}

interface ScoreboardProps {
  state: GameState;
  fieldingSetup?: FieldingSetup;
  onOpenSettings: () => void;
  onToggleSound: () => void;
  isMuted: boolean;
  volume?: number;
  onVolumeChange?: (vol: number) => void;
  onTestSound?: () => void;
  onOpenTests: () => void;
  onReturnHome?: () => void;
  compact?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  bowlerFilter?: BowlerFilter;
  onSelectBowlerFilter?: (filter: BowlerFilter) => void;
  onOpenStats?: () => void;
}

const ScoreboardComponent: React.FC<ScoreboardProps> = ({
  state,
  fieldingSetup,
  onOpenSettings,
  onToggleSound,
  isMuted,
  volume = 1.25,
  onVolumeChange,
  onTestSound,
  onOpenTests,
  onReturnHome,
  compact = false,
  isFullscreen = false,
  onToggleFullscreen,
  bowlerFilter = 'AUTO',
  onSelectBowlerFilter,
  onOpenStats,
}) => {
  const { runs, wickets, currentOver, ballInOver, totalLegalBalls, config, batterStats } = state;
  const animatedRuns = useAnimatedCounter(runs);
  const animatedWickets = useAnimatedCounter(wickets);
  const [isAttackMenuOpen, setIsAttackMenuOpen] = useState(false);
  const [isVolumePopoverOpen, setIsVolumePopoverOpen] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState<number>(() => soundFx.getAmbientVolume());

  const isPractice = !!config.isPracticeMode;
  const numTotalOvers = typeof config.totalOvers === 'number' ? config.totalOvers : (typeof config.totalOvers === 'object' && config.totalOvers !== null ? Number((config.totalOvers as any).totalOvers) || 5 : 5);
  const numTotalWickets = typeof config.totalWickets === 'number' ? config.totalWickets : (typeof config.totalWickets === 'object' && config.totalWickets !== null ? Number((config.totalWickets as any).totalWickets) || 10 : 10);
  const isUnlimitedOvers = numTotalOvers === 0 || !Number.isFinite(numTotalOvers) || isPractice;
  const currentRunRate = calculateCurrentRunRate(runs, totalLegalBalls);
  
  useEffect(() => {
    const crr = Number(currentRunRate) || 0;
    soundFx.updateRunRateCrowdVolume(crr);
  }, [currentRunRate]);
  const requiredRunRate = config.target !== undefined && !isPractice
    ? calculateRequiredRunRate(config.target, runs, numTotalOvers, totalLegalBalls)
    : null;

  const ballsRemaining = isUnlimitedOvers ? null : numTotalOvers * 6 - totalLegalBalls;
  const runsNeeded = config.target !== undefined ? Math.max(0, config.target - runs) : null;
  const wicketsLeft = isPractice ? '∞' : Math.max(0, numTotalWickets - wickets);

  // Consecutive boundary streak calculation
  const streakCount = state.consecutiveBoundaries || 0;
  const streakTypes = state.consecutiveBoundaryTypes || [];
  const isAllSixes = streakTypes.length > 0 && streakTypes.every((t) => t === 'SIX');
  const isAllFours = streakTypes.length > 0 && streakTypes.every((t) => t === 'FOUR');
  const streakLabel = isAllSixes ? 'SIXES!' : isAllFours ? 'FOURS!' : 'BOUNDARIES!';

  // Active over ball history
  const activeOverSummary = state.overSummaries[state.currentOver]?.ballOutcomes || [];

  // Bowler filter label helper
  const getBowlerLabel = (filter?: BowlerFilter | string) => {
    switch (filter) {
      case 'PACER':
        return 'Fast Pace';
      case 'MEDIUM_PACE':
        return 'Medium Pace';
      case 'OFF_SPIN':
        return 'Off-Spin';
      case 'LEG_SPIN':
        return 'Leg-Spin';
      case 'MYSTERY_SPIN':
        return 'Mystery';
      default:
        return 'Mixed';
    }
  };

  // Weather Badge config
  const activeWeather = config.weatherCondition || 'SUNNY';
  const weatherBadge =
    activeWeather === 'SUNNY'
      ? { label: 'Sunny', icon: Sun, cls: 'bg-amber-950/60 text-amber-300 border-amber-500/40' }
      : activeWeather === 'OVERCAST'
      ? { label: 'Overcast (+Swing)', icon: CloudSun, cls: 'bg-slate-800 text-slate-200 border-slate-600' }
      : activeWeather === 'RAIN'
      ? { label: 'Drizzle (Slick)', icon: CloudRain, cls: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40' }
      : { label: 'Night', icon: Moon, cls: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40' };

  // Opposition Bowler Details & Match Figures Calculation
  const currentBowlerStyle = state.currentDelivery?.bowlerStyle || 'PACER';
  const oppTeam = WORLD_CUP_TEAMS.find(
    (t) =>
      t.name.toLowerCase() === (config.opponentTeamName || '').toLowerCase() ||
      t.shortName.toLowerCase() === (config.opponentTeamName || '').toLowerCase()
  );

  const bowlerDisplayName = config.opponentTeamName
    ? `${config.opponentTeamName} Bowler`
    : 'Opponent Bowler';

  const ballHistory = state.ballHistory || [];
  const bowlerDeliveries = ballHistory.filter(
    (b) => b.delivery?.bowlerStyle === currentBowlerStyle
  );
  const relevantBalls = bowlerDeliveries.length > 0 ? bowlerDeliveries : ballHistory;

  const bowlerTotalBalls = relevantBalls.length;
  const bowlerOversFull = Math.floor(bowlerTotalBalls / 6);
  const bowlerBallsRem = bowlerTotalBalls % 6;
  const bowlerOversFormatted = `${bowlerOversFull}.${bowlerBallsRem}`;

  const bowlerRunsConceded = relevantBalls.reduce((acc, b) => acc + (b.outcome?.runs || 0), 0);
  const bowlerWicketsTaken = relevantBalls.reduce(
    (acc, b) => acc + (b.outcome?.isWicket ? 1 : 0),
    0
  );
  const bowlerOversFloat = bowlerTotalBalls / 6;
  const bowlerEcon =
    bowlerOversFloat > 0 ? (bowlerRunsConceded / bowlerOversFloat).toFixed(2) : '0.00';

  const currentSpeed = state.currentDelivery?.speedKmh || 135;
  const currentDeliveryType = state.currentDelivery?.deliveryLabel || 'Fast Delivery';

  // COMPACT MOBILE LANDSCAPE HEADER BAR
  if (compact) {
    return (
      <header className="w-full bg-slate-900 border-b border-slate-800 text-slate-100 flex flex-col z-30 select-none flex-shrink-0 relative">
        <div className="h-10 px-2 sm:px-3 flex items-center justify-between text-xs">
          {/* Left: Match Info / Team Info */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5 font-bold text-slate-200 text-xs truncate">
              {!isPractice && config.playerTeamName ? (
                <>
                  <TeamBadge name={config.playerTeamName} code={config.playerTeamName} size="xs" />
                  <span className="truncate">{config.playerTeamName}</span>
                  <span className="text-amber-400 text-[10px] font-black">v</span>
                  <TeamBadge name={config.opponentTeamName} code={config.opponentTeamName} size="xs" />
                  <span className="truncate">{config.opponentTeamName}</span>
                </>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span className="truncate">
                    {config.isTournamentMatch
                      ? config.editionName
                        ? config.editionName.replace(/IPL/gi, 'ICL').toUpperCase()
                        : 'INDIAN CRICKET LEAGUE'
                      : isPractice
                      ? 'PRACTICE NETS'
                      : `${config.playerTeamName || 'Player XI'} vs ${config.opponentTeamName || 'AI Bowler'}`}
                  </span>
                </>
              )}
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-bold border border-slate-700">
              {config.difficulty || 'PRO'}
            </span>
            {fieldingSetup && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold border border-slate-700">
                <Shield className="w-3 h-3 text-cyan-400" />
                <span>{fieldingSetup.shortName}</span>
              </span>
            )}
          </div>

          {/* Center: Boundary Streak Badge (if active) */}
          {streakCount >= 2 && (
            <div
              className={`px-2 py-0.5 rounded-full border flex items-center gap-1 text-[10px] font-black uppercase shadow animate-pulse ${
                isAllSixes
                  ? 'bg-purple-600 text-white border-pink-300'
                  : isAllFours
                  ? 'bg-amber-500 text-slate-950 border-yellow-200'
                  : 'bg-emerald-600 text-white border-emerald-300'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-300" />
              <span>{streakCount}x {streakLabel}</span>
            </div>
          )}

          {/* Right: Empty container (Header buttons removed per user focus selection) */}
          <div className="flex items-center gap-1"></div>
        </div>

        {/* Compact Mode Player & Bowler Sub-Ticker */}
        <div className="bg-slate-950/90 border-t border-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-bold text-amber-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-amber-400" />
              <span>{batterStats.runs}r ({batterStats.ballsFaced}b)</span>
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-mono">SR: {batterStats.strikeRate}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">4s: {batterStats.fours} | 6s: {batterStats.sixes}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="font-bold text-cyan-400 flex items-center gap-1">
              <Target className="w-3 h-3 text-cyan-400" />
              <span>{bowlerDisplayName}:</span>
            </span>
            <span className="text-slate-200 font-mono">{bowlerOversFormatted}ov-{bowlerRunsConceded}r-{bowlerWicketsTaken}w</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-mono">{currentSpeed}km/h</span>
          </div>
        </div>
      </header>
    );
  }

  // FULL DESKTOP & PORTRAIT SCOREBOARD
  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 text-slate-100 shadow-xl">
      <div className="px-4 py-2.5 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Side: Brand, Mode/Difficulty, Navigation Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start flex-wrap">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black text-xl shadow-inner ${
                isPractice
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              }`}
            >
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black tracking-tight text-slate-100 text-base md:text-lg">
                  {config.isTournamentMatch
                    ? config.editionName
                      ? config.editionName.replace(/2026/g, '').replace(/TATA\s*/gi, '').replace(/IPL/gi, 'ICL').trim().toUpperCase()
                      : 'INDIAN CRICKET LEAGUE'
                    : isPractice
                    ? 'PRACTICE NETS'
                    : 'TIMING CRICKET'}
                </h1>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    config.isTournamentMatch
                      ? 'bg-amber-950/90 text-amber-300 border-amber-500/50'
                      : isPractice
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-800 text-amber-400 border-amber-400/20'
                  }`}
                >
                  {config.isTournamentMatch
                    ? config.tournamentStageLabel || 'Tournament Match'
                    : isPractice
                    ? 'UNLIMITED'
                    : config.difficulty}
                </span>

                {fieldingSetup && (
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700 hidden sm:inline-flex items-center gap-1"
                    title={`Active Fielding Strategy: ${fieldingSetup.name}`}
                  >
                    <Shield className="w-3 h-3 text-cyan-400" />
                    <span>{fieldingSetup.shortName}</span>
                  </span>
                )}

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${weatherBadge.cls}`}
                  title="Active Pitch Weather & Atmospheric Conditions"
                >
                  <weatherBadge.icon className="w-3 h-3" />
                  <span>{weatherBadge.label}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
                {isPractice ? (
                  'Endless Batting Drill • Perfect your timing against real bowling lines'
                ) : (
                  <>
                    <TeamBadge name={config.playerTeamName} code={config.playerTeamName} size="xs" />
                    <span className="text-slate-200 font-bold">{config.playerTeamName || 'Player XI'}</span>
                    <span className="text-amber-400 font-black text-[10px]">VS</span>
                    <TeamBadge name={config.opponentTeamName} code={config.opponentTeamName} size="xs" />
                    <span className="text-slate-200 font-bold">{config.opponentTeamName || 'AI Bowler'}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Practice Bowler Selector */}
          {isPractice && onSelectBowlerFilter && (
            <div className="hidden lg:flex items-center gap-1 bg-slate-950/70 p-1 rounded-lg border border-slate-800 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 px-1.5">Attack:</span>
              {(['AUTO', 'PACER', 'MEDIUM_PACE', 'OFF_SPIN', 'LEG_SPIN', 'MYSTERY_SPIN'] as BowlerFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => onSelectBowlerFilter(filter)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                    bowlerFilter === filter
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter === 'AUTO' && 'Mixed'}
                  {filter === 'PACER' && 'Fast'}
                  {filter === 'MEDIUM_PACE' && 'Medium'}
                  {filter === 'OFF_SPIN' && 'Off-Spin'}
                  {filter === 'LEG_SPIN' && 'Leg-Spin'}
                  {filter === 'MYSTERY_SPIN' && 'Mystery'}
                </button>
              ))}
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 ml-auto md:ml-1">
            {onOpenStats && (
              <button
                id="scoreboard-records-button"
                type="button"
                onClick={onOpenStats}
                title="View Career Records & Player Stats"
                className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 shadow active:scale-95 cursor-pointer bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/30"
              >
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Records</span>
              </button>
            )}

            {onReturnHome && (
              <button
                id="scoreboard-exit-button"
                onClick={onReturnHome}
                title={isPractice ? 'Exit Practice Session and return to Menu' : 'Return to Main Menu'}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 shadow active:scale-95 cursor-pointer ${
                  isPractice
                    ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400/80 shadow-rose-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{isPractice ? 'Exit Practice' : 'Menu'}</span>
              </button>
            )}

            {/* Desktop Sound & Volume Popover Trigger */}
            <div className="relative">
              <button
                type="button"
                id="desktop-sound-vol-btn"
                onClick={() => setIsVolumePopoverOpen(!isVolumePopoverOpen)}
                title={isMuted ? 'Unmute Sound' : `Volume: ${Math.round(volume * 100)}%`}
                className={`min-h-[44px] px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all border active:scale-95 cursor-pointer ${
                  isMuted
                    ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                    : volume > 1.0
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-300" />
                ) : (
                  <Volume2 className="w-4 h-4 text-amber-400" />
                )}
              </button>

              {/* Desktop Volume Popover */}
              {isVolumePopoverOpen && (
                <div
                  className="absolute left-0 top-12 w-64 bg-slate-900 border border-slate-750 rounded-2xl p-3.5 shadow-2xl z-50 flex flex-col gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Sound & Volume</span>
                    </span>
                    <button
                      type="button"
                      onClick={onToggleSound}
                      title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
                      className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center ${
                        isMuted
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-400">Master SFX Volume</span>
                      <span className={`font-mono font-bold ${volume > 1.0 ? 'text-amber-400' : 'text-slate-200'}`}>
                        {Math.round(volume * 100)}%{volume > 1.0 ? ' (Boosted)' : ''}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2.0"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        onVolumeChange?.(val);
                      }}
                      className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-bold px-0.5">
                      <span>0%</span>
                      <span>100% Normal</span>
                      <span className="text-amber-400 font-extrabold">200% MAX BOOST</span>
                    </div>
                  </div>

                  {/* Ambient Audio (Crowd Murmur & Wind Gusts) */}
                  <div className="flex flex-col gap-1 pt-1.5 border-t border-slate-800">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Wind className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Ambient Atmosphere</span>
                      </span>
                      <span className={`font-mono font-bold ${ambientVolume > 1.0 ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {isMuted ? '0%' : `${Math.round(ambientVolume * 100)}%`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2.0"
                      step="0.05"
                      value={isMuted ? 0 : ambientVolume}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        soundFx.setAmbientVolume(val);
                        setAmbientVolume(val);
                        if (isMuted && val > 0) {
                          onToggleSound();
                        }
                      }}
                      className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-bold px-0.5">
                      <span>Off</span>
                      <span>85% Balanced</span>
                      <span className="text-emerald-400 font-bold">200%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: '50%', val: 0.5 },
                      { label: '100%', val: 1.0 },
                      { label: '150%', val: 1.5 },
                      { label: '200%', val: 2.0 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => onVolumeChange?.(preset.val)}
                        className={`min-h-[44px] py-1.5 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center ${
                          Math.abs(volume - preset.val) < 0.05 && !isMuted
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => soundFx.testAmbientSound()}
                      className="min-h-[44px] py-2 px-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-650 border border-slate-700 rounded-xl text-[11px] font-bold text-emerald-300 flex items-center justify-center gap-1.5 shadow cursor-pointer text-center"
                    >
                      <Wind className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Wind Gust</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onTestSound?.()}
                      className="min-h-[44px] py-2 px-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-650 border border-slate-700 rounded-xl text-[11px] font-bold text-amber-400 flex items-center justify-center gap-1.5 shadow cursor-pointer text-center"
                    >
                      <Activity className="w-3.5 h-3.5 text-amber-400" />
                      <span>Bat & Cheer</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onOpenSettings}
              title="Match Settings"
              className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors border border-slate-700 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">{isPractice ? 'Attack' : 'Match'}</span>
            </button>

            <button
              onClick={onOpenTests}
              title="Run Engine Unit Tests"
              className="min-h-[44px] px-3 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-xs font-semibold text-emerald-300 border border-emerald-800/60 transition-colors hidden xl:flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <TestTube className="w-4 h-4 text-emerald-400" />
              <span>Tests</span>
            </button>
          </div>
        </div>

        {/* TOP RIGHT: GIANT BROADCAST SCOREBOARD CARD */}
        <div id="desktop-top-right-scoreboard" className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          
          {/* Animated Consecutive Boundary Streak Counter */}
          {streakCount >= 2 && (
            <div
              id="consecutive-boundary-streak-badge"
              key={`streak-${streakCount}-${streakLabel}`}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 shadow-lg select-none ${
                isAllSixes
                  ? 'bg-gradient-to-r from-purple-700 via-pink-600 to-amber-500 text-white border-pink-300/80 animate-pulse shadow-pink-500/30'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black border-yellow-200 shadow-amber-500/30'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span className="text-xs md:text-sm font-black tracking-wider uppercase">
                {streakCount}x {streakLabel}
              </span>
            </div>
          )}

          {/* Over Progression Ticker */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">Over:</span>
            {[0, 1, 2, 3, 4, 5].map((ballIndex) => {
              const outcome = activeOverSummary[ballIndex];
              let bg = 'bg-slate-800 text-slate-500 border-slate-700';
              let text = '•';

              if (outcome) {
                if (outcome.isWicket) {
                  bg = 'bg-rose-500/30 text-rose-300 border-rose-500/50 font-bold';
                  text = 'W';
                } else if (outcome.runs === 6) {
                  bg = 'bg-purple-500/30 text-purple-300 border-purple-500/50 font-bold';
                  text = '6';
                } else if (outcome.runs === 4) {
                  bg = 'bg-amber-500/30 text-amber-300 border-amber-500/50 font-bold';
                  text = '4';
                } else if (outcome.runs > 0) {
                  bg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold';
                  text = outcome.runs.toString();
                } else {
                  bg = 'bg-slate-800 text-slate-400 border-slate-700 font-semibold';
                  text = '0';
                }
              }

              return (
                <div
                  key={ballIndex}
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border ${bg}`}
                >
                  {text}
                </div>
              );
            })}
          </div>

          {/* Match Chase or Practice Stats Card */}
          <div className="hidden sm:flex flex-col items-end justify-center bg-slate-950/70 px-3 py-1.5 rounded-xl border border-slate-800 text-right">
            {isPractice ? (
              <>
                <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  BATTER DRILL
                </div>
                <div className="text-xs font-bold text-slate-300">
                  {batterStats.ballsFaced} balls <span className="text-slate-500">•</span> SR <span className="text-amber-400 font-black">{batterStats.strikeRate}</span>
                </div>
              </>
            ) : config.target !== undefined ? (
              <>
                <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  TARGET {config.target}
                </div>
                <div className="text-xs font-bold text-slate-200">
                  Need <span className="text-amber-300 font-black">{runsNeeded}</span> off{' '}
                  <span className="text-white font-black">{ballsRemaining}b</span>
                  {requiredRunRate !== null && (
                    <span className="text-rose-400 font-bold ml-1">({requiredRunRate} RRR)</span>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  RUN RATE
                </div>
                <div className="text-xs font-bold text-amber-400">
                  CRR {currentRunRate} <span className="text-slate-500">•</span> {ballsRemaining}b left
                </div>
              </>
            )}
          </div>

          {/* GIANT BROADCAST SCOREBOARD CARD (TOP RIGHT) */}
          <div
            id="scoreboard-giant-readout"
            className="bg-slate-950 border-2 border-slate-700 shadow-xl rounded-2xl px-4 py-2 flex items-center gap-4"
          >
            {/* Massive Runs / Wickets */}
            <div className="flex flex-col items-start">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                {isPractice ? 'NET RUNS' : 'SCORE'}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl md:text-5xl font-bold font-sports text-amber-400 tracking-wide leading-none transition-all duration-200">
                  {animatedRuns}
                </span>
                <span className="text-2xl md:text-3xl font-bold font-sports text-slate-400 leading-none transition-all duration-200">
                  /{isPractice ? `${animatedWickets}w` : animatedWickets}
                </span>
              </div>
            </div>

            <div className="w-[1.5px] h-9 bg-slate-800" />

            {/* Big Overs Readout */}
            <div className="flex flex-col items-start">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                OVERS
              </span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-3xl md:text-4xl font-bold font-sports text-slate-100 leading-none tracking-wide">
                  {formatOvers(currentOver, ballInOver)}
                </span>
                <span className="text-slate-500 text-lg font-bold font-sports">
                  /{isUnlimitedOvers ? '∞' : numTotalOvers}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Batter & Opposition Bowler Details Broadcast Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-300">
        {/* Individual Batter (Player) Stats */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800/80 flex-wrap">
          <span className="font-extrabold text-amber-400 flex items-center gap-1.5 shrink-0">
            {config.playerTeamName ? (
              <TeamBadge name={config.playerTeamName} code={config.playerTeamName} size="xs" />
            ) : (
              <Activity className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{config.playerTeamName ? `${config.playerTeamName} Striker` : 'Player XI (Striker)'}:</span>
          </span>
          <span className="text-white font-black text-xs font-mono">{batterStats.runs} runs</span>
          <span className="text-slate-400">({batterStats.ballsFaced}b)</span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span>SR: <strong className="text-amber-300">{batterStats.strikeRate}</strong></span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span>4s: <strong className="text-white font-bold">{batterStats.fours}</strong></span>
          <span>6s: <strong className="text-white font-bold">{batterStats.sixes}</strong></span>
          <span>Dots: <strong className="text-slate-400">{batterStats.dots}</strong></span>
        </div>

        {/* Opposition Bowler Details */}
        <div className="flex items-center justify-between bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800/80 flex-wrap gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-cyan-400 flex items-center gap-1.5 shrink-0">
              {config.opponentTeamName ? (
                <TeamBadge name={config.opponentTeamName} code={config.opponentTeamName} size="xs" />
              ) : (
                <Target className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>{bowlerDisplayName}</span>
              <span className="text-[10px] text-slate-400 font-normal">({getBowlerLabel(currentBowlerStyle)})</span>:
            </span>
            <span className="text-white font-mono font-bold">
              {bowlerOversFormatted} ov • {bowlerRunsConceded}r • {bowlerWicketsTaken}w
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-300">Econ: <strong className="text-cyan-300">{bowlerEcon}</strong></span>
          </div>

          {state.currentDelivery && (
            <div className="text-[10px] text-emerald-400 font-mono font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50 shrink-0 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>{currentSpeed} km/h • {currentDeliveryType}</span>
            </div>
          )}
        </div>
      </div>

      {/* TARGET CHASE BANNER (Visible in every target set match, right under the scorecard) */}
      {config.target !== undefined && !isPractice && (
        <div className="w-full bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-t border-b border-amber-500/50 px-4 py-2 text-slate-100 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg font-russo text-xs uppercase tracking-wider shadow">
              <Target className="w-3.5 h-3.5 text-slate-950" />
              <span>TARGET TO CHASE: {config.target}</span>
            </div>

            <div className="text-slate-200 font-extrabold text-xs sm:text-sm flex items-center gap-1 flex-wrap">
              Need <span className="text-amber-300 font-bold font-sports text-xl leading-none tracking-wide">{runsNeeded}</span> runs in{' '}
              <span className="text-white font-bold font-sports text-xl leading-none tracking-wide">{ballsRemaining}</span> balls
              <span className="text-slate-400 font-normal ml-1">
                ({formatOvers(Math.floor((ballsRemaining || 0) / 6), (ballsRemaining || 0) % 6)} overs remaining)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-rose-950/90 border border-rose-500/50 text-rose-300 shadow flex items-center gap-1">
                Req. RR: <strong className="font-sports font-normal text-base text-rose-200 tracking-wider leading-none">{requiredRunRate !== null ? requiredRunRate : '0.00'}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 shadow flex items-center gap-1">
                Curr. RR: <strong className="font-sports font-normal text-base text-cyan-200 tracking-wider leading-none">{currentRunRate}</strong>
              </span>
            </div>

            {/* Target Progress Meter */}
            <div className="w-24 sm:w-36 h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-700/80 p-0.5 shadow-inner flex-shrink-0" title={`Chase Progress: ${runs}/${config.target} runs`}>
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  runs >= (config.target || 0)
                    ? 'bg-emerald-400 shadow-emerald-500/50'
                    : (requiredRunRate !== null && requiredRunRate > 12)
                    ? 'bg-gradient-to-r from-rose-500 to-amber-400'
                    : 'bg-gradient-to-r from-amber-500 to-amber-300 shadow-amber-500/50'
                }`}
                style={{
                  width: `${Math.min(100, Math.max(0, (runs / (config.target || 1)) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export const Scoreboard = React.memo(ScoreboardComponent);
