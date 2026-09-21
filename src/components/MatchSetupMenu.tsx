import React, { useState, useMemo } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  Trophy,
  Zap,
  Shield,
  Sparkles,
  Flag,
  Target,
  Activity,
  Sun,
  Cloud,
  CloudRain,
  Moon,
  Flame,
  RotateCcw,
  Wind,
  Shuffle,
  BarChart3,
  User,
  LogIn,
  Play,
  Check,
  Globe,
  Star,
  Layers,
} from 'lucide-react';
import { BatterArchetype, BattingStance, BowlerFilter, MatchConfig, WeatherCondition } from '../types';
import { BATTER_ARCHETYPES } from '../config/batterArchetypes';
import { WORLD_CUP_TEAMS, IPL_TEAMS, getTeamById } from '../tournament/teamsData';
import { soundFx } from '../utils/audio';
import { TeamBadge } from './TeamBadge';
import worldCupCrest from '../assets/images/world_cup_crest_1789983578775.jpg';
import leagueCrest from '../assets/images/league_crest_1789983591937.jpg';
import championsTrophyCrest from '../assets/images/champions_trophy_crest_1789983881290.jpg';
import cricketEmblem from '../assets/images/cricket_emblem_1789983606050.jpg';

interface MatchSetupMenuProps {
  currentConfig: MatchConfig;
  initialMode?: 'MATCH' | 'PRACTICE';
  onStartMatch: (config: MatchConfig) => void;
  onBackToHome: () => void;
  currentUser?: FirebaseUser | null;
  onOpenAuth?: () => void;
  onOpenStats?: () => void;
}

export const MATCH_EDITIONS = [
  {
    id: 'T20_WORLD_CUP',
    name: 'ICC T20 World Cup',
    crest: worldCupCrest,
    badge: 'Official World Championship',
    desc: 'High-octane national tournament featuring global elite squads & electric atmosphere.',
    gradient: 'from-amber-500/20 via-yellow-500/10 to-slate-900 border-amber-400',
  },
  {
    id: 'PREMIER_LEAGUE',
    name: 'Indian Premier League (IPL)',
    crest: leagueCrest,
    badge: 'IPL Franchise Edition',
    desc: '10 franchises, packed Indian stadiums, intense rivalries and high-voltage power hitting.',
    gradient: 'from-cyan-500/20 via-blue-500/10 to-slate-900 border-cyan-400',
  },
  {
    id: 'CHAMPIONS_TROPHY',
    name: 'Champions Trophy',
    crest: championsTrophyCrest,
    badge: 'Elite Knockouts Edition',
    desc: 'Must-win high-stakes clash where every mistake carries severe consequences.',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-slate-900 border-emerald-400',
  },
  {
    id: 'SUPER_SERIES',
    name: 'World Super Series',
    crest: cricketEmblem,
    badge: 'Bilateral Power Series',
    desc: 'Classic bilateral rivalry showdown under prime pitch conditions.',
    gradient: 'from-purple-500/20 via-indigo-500/10 to-slate-900 border-purple-400',
  },
];

export const MatchSetupMenu: React.FC<MatchSetupMenuProps> = ({
  currentConfig,
  initialMode,
  onStartMatch,
  onBackToHome,
  currentUser,
  onOpenAuth,
  onOpenStats,
}) => {
  const [activeTab, setActiveTab] = useState<'MATCH' | 'PRACTICE'>(
    initialMode || (currentConfig.isPracticeMode ? 'PRACTICE' : 'MATCH')
  );

  // Wizard Step State (1: Teams, 2: Overs, 3: Pitch & Difficulty)
  const [wizardStep, setWizardStep] = useState<number>(1);

  // Step 1: Team Selection States
  const [quickPlayCategory, setQuickPlayCategory] = useState<'WORLD_CUP' | 'IPL'>(() => {
    return IPL_TEAMS.some((t) => t.id === currentConfig.playerTeamId) ? 'IPL' : 'WORLD_CUP';
  });

  const [playerTeamId, setPlayerTeamId] = useState<string>(() => {
    return currentConfig.playerTeamId || 'ind';
  });
  const [opponentTeamId, setOpponentTeamId] = useState<string>(() => {
    return currentConfig.opponentTeamId || (currentConfig.playerTeamId === 'aus' ? 'ind' : 'aus');
  });

  const handleSelectQuickPlayCategory = (cat: 'WORLD_CUP' | 'IPL') => {
    soundFx.playUiClick();
    setQuickPlayCategory(cat);
    if (cat === 'WORLD_CUP') {
      setPlayerTeamId('ind');
      setOpponentTeamId('aus');
    } else {
      setPlayerTeamId('csk');
      setOpponentTeamId('mi');
    }
  };

  const [battingStance, setBattingStance] = useState<BattingStance>(
    currentConfig.battingStance || 'RIGHT'
  );
  const [batterArchetype, setBatterArchetype] = useState<BatterArchetype>(
    currentConfig.batterArchetype || 'CLASSICAL'
  );

  // Step 2: Overs & Wickets & Target Chase States
  const [totalOvers, setTotalOvers] = useState<number>(currentConfig.totalOvers || 5);
  const [totalWickets, setTotalWickets] = useState<number>(
    currentConfig.totalWickets && Number.isFinite(currentConfig.totalWickets)
      ? currentConfig.totalWickets
      : 5
  );
  const [isChaseMode, setIsChaseMode] = useState<boolean>(currentConfig.target !== false && currentConfig.target !== undefined);

  // Default target based on overs and difficulty
  const getDefaultTargetForOvers = (overs: number, diff: 'CASUAL' | 'PRO' | 'CHAMPION' = 'PRO') => {
    if (diff === 'CASUAL') {
      if (overs === 1) return 12;
      if (overs === 2) return 20;
      if (overs === 5) return 35;
      if (overs === 10) return 70;
      if (overs === 20) return 135;
      return 35;
    }
    if (diff === 'CHAMPION') {
      if (overs === 1) return 20;
      if (overs === 2) return 36;
      if (overs === 5) return 65;
      if (overs === 10) return 130;
      if (overs === 20) return 220;
      return 65;
    }
    // PRO default
    if (overs === 1) return 16;
    if (overs === 2) return 28;
    if (overs === 5) return 48;
    if (overs === 10) return 98;
    if (overs === 20) return 185;
    return 48;
  };

  const [targetRuns, setTargetRuns] = useState<number>(
    currentConfig.target || getDefaultTargetForOvers(currentConfig.totalOvers || 5, currentConfig.difficulty || 'PRO')
  );

  // Step 3: Edition & Weather Pitch States
  const [selectedEdition, setSelectedEdition] = useState<string>(
    currentConfig.editionName || 'ICC T20 World Cup'
  );
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>(
    currentConfig.weatherCondition || 'SUNNY'
  );

  // Step 4: Level of Difficulty State
  const [difficulty, setDifficulty] = useState<'CASUAL' | 'PRO' | 'CHAMPION'>(
    currentConfig.difficulty || 'PRO'
  );

  // Practice Session States
  const [practiceBowlerType, setPracticeBowlerType] = useState<BowlerFilter>(
    currentConfig.practiceBowlerType || 'PACER'
  );
  const [practiceDifficulty, setPracticeDifficulty] = useState<'CASUAL' | 'PRO' | 'CHAMPION'>(
    currentConfig.difficulty || 'PRO'
  );

  // Get selected team objects
  const playerTeam = useMemo(() => getTeamById(playerTeamId), [playerTeamId]);
  const opponentTeam = useMemo(() => getTeamById(opponentTeamId), [opponentTeamId]);

  // Handle Overs Selection
  const handleSelectOvers = (overs: number) => {
    soundFx.playUiClick();
    setTotalOvers(overs);
    if (overs > 0) {
      setTargetRuns(getDefaultTargetForOvers(overs, difficulty));
    }
  };

  const handleSelectWickets = (wickets: number) => {
    soundFx.playUiClick();
    setTotalWickets(wickets);
  };

  const handleToggleChaseMode = (enabled: boolean) => {
    soundFx.playUiClick();
    setIsChaseMode(enabled);
    if (enabled && (!targetRuns || targetRuns <= 0)) {
      setTargetRuns(getDefaultTargetForOvers(totalOvers, difficulty));
    }
  };

  const handleSelectDifficulty = (diff: 'CASUAL' | 'PRO' | 'CHAMPION') => {
    soundFx.playUiClick();
    setDifficulty(diff);
    if (isChaseMode && totalOvers > 0) {
      setTargetRuns(getDefaultTargetForOvers(totalOvers, diff));
    }
  };

  const handleNextStep = () => {
    soundFx.playUiClick();
    if (activeTab === 'MATCH') {
      if (wizardStep < 3) {
        setWizardStep((prev) => prev + 1);
      } else {
        handleLaunch();
      }
    } else {
      if (wizardStep < 2) {
        setWizardStep((prev) => prev + 1);
      } else {
        handleLaunch();
      }
    }
  };

  const handlePrevStep = () => {
    soundFx.playUiClick();
    if (wizardStep > 1) {
      setWizardStep((prev) => prev - 1);
    }
  };

  const handleLaunch = () => {
    soundFx.playMatchStart();
    if (activeTab === 'PRACTICE') {
      onStartMatch({
        ...currentConfig,
        totalOvers: 0,
        totalWickets: Infinity,
        difficulty: practiceDifficulty,
        weatherCondition,
        isPracticeMode: true,
        practiceBowlerType,
        target: undefined,
        battingStance,
        batterArchetype,
        playerTeamName: 'India',
        playerTeamId: 'ind',
        opponentTeamName: 'Practice Nets Bowler',
        editionName: 'Practice Nets Session',
      });
    } else {
      const isIcl = quickPlayCategory === 'IPL';
      onStartMatch({
        ...currentConfig,
        totalOvers,
        totalWickets,
        difficulty,
        weatherCondition,
        isPracticeMode: false,
        practiceBowlerType: undefined,
        target: isChaseMode ? targetRuns : undefined,
        battingStance,
        batterArchetype,
        playerTeamName: playerTeam.name,
        playerTeamId: playerTeam.id,
        opponentTeamName: opponentTeam.name,
        opponentTeamId: opponentTeam.id,
        editionName: isIcl ? 'Indian Cricket League' : 'ICC T20 World Cup',
      });
    }
  };

  // Required run rate calculations
  const ballsTotal = totalOvers > 0 ? totalOvers * 6 : null;
  const requiredRunRate =
    isChaseMode && totalOvers > 0
      ? (targetRuns / totalOvers).toFixed(2)
      : null;

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-y-auto scroll-snap-y-mandatory scroll-smooth bg-slate-950 text-slate-100 select-none p-3 sm:p-5 font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial-vignette opacity-70 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 w-full max-w-4xl mx-auto flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
           <button
            type="button"
            onClick={() => {
              soundFx.playUiClick();
              onBackToHome();
            }}
            className="px-4 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-sm font-bold transition-all flex items-center gap-1.5 shadow"
          >
            <span>←</span>
            <span>Home</span>
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-black italic tracking-wide text-white font-['Teko',sans-serif] uppercase leading-none">
              Match Setup Wizard
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              {activeTab === 'MATCH'
                ? 'Follow the 4-step wizard: Team → Overs → Edition → Difficulty'
                : 'Configure practice nets session & bowling attack'}
            </p>
          </div>
        </div>

        {/* Header Right: Mode Selector Tabs & Records/Login */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Selector Tabs (Quick Play vs Practice) */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-700/80 shadow-lg h-11">
            <button
              type="button"
              onClick={() => {
                soundFx.playUiClick();
                setActiveTab('MATCH');
                setWizardStep(1);
              }}
              className={`px-3.5 min-h-[44px] h-11 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'MATCH'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Quick Play</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playUiClick();
                setActiveTab('PRACTICE');
                setWizardStep(1);
              }}
              className={`px-3.5 min-h-[44px] h-11 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'PRACTICE'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md font-extrabold scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Practice Nets</span>
            </button>
          </div>

          {/* Records Button */}
          {onOpenStats && (
            <button
              id="setup-menu-records-btn"
              type="button"
              onClick={() => {
                soundFx.playUiClick();
                onOpenStats();
              }}
              className="h-11 px-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/40 text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer"
              title="Player Records & Career Stats"
            >
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Records</span>
            </button>
          )}

          {/* Account / Login Button */}
          {onOpenAuth && (
            <button
              id="setup-menu-auth-btn"
              type="button"
              onClick={() => {
                soundFx.playUiClick();
                onOpenAuth();
              }}
              className="h-11 px-3 rounded-2xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer shrink-0"
              title={currentUser ? `Signed in as ${currentUser.displayName || currentUser.email}` : 'Sign In / Register'}
            >
              {currentUser ? (
                <>
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 rounded-full border border-amber-400 object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className="hidden sm:inline text-amber-300 font-bold">
                    {currentUser.displayName ? currentUser.displayName.split(' ')[0] : 'Profile'}
                  </span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-300 font-bold">Login</span>
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Wizard Progress Indicator Bar */}
      <div className="relative z-10 w-full max-w-4xl mx-auto my-2">
        {activeTab === 'MATCH' ? (
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {[
              { num: 1, title: '1. Select Teams', Icon: Flag },
              { num: 2, title: '2. Overs & Target', Icon: Target },
              { num: 3, title: '3. Pitch & Level', Icon: Zap },
            ].map((step) => {
              const isActive = wizardStep === step.num;
              const isCompleted = wizardStep > step.num;
              const StepIcon = step.Icon;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => {
                    soundFx.playUiClick();
                    setWizardStep(step.num);
                  }}
                  className={`min-h-[44px] py-2 px-2 rounded-xl text-center border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/20 font-black scale-[1.02]'
                      : isCompleted
                      ? 'bg-slate-900 text-amber-400 border-amber-500/40 font-bold'
                      : 'bg-slate-950/70 text-slate-500 border-slate-800'
                  }`}
                >
                  <StepIcon className="w-3.5 h-3.5" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase truncate">
                    {step.title}
                  </span>
                  {isCompleted && <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1 sm:gap-2">
            {[
              { num: 1, title: '1. Bowler Attack', Icon: Target },
              { num: 2, title: '2. Practice Level', Icon: Zap },
            ].map((step) => {
              const isActive = wizardStep === step.num;
              const isCompleted = wizardStep > step.num;
              const StepIcon = step.Icon;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => {
                    soundFx.playUiClick();
                    setWizardStep(step.num);
                  }}
                  className={`min-h-[44px] py-2 px-2 rounded-xl text-center border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-md font-black scale-[1.02]'
                      : isCompleted
                      ? 'bg-slate-900 text-emerald-400 border-emerald-500/40 font-bold'
                      : 'bg-slate-950/70 text-slate-500 border-slate-800'
                  }`}
                >
                  <StepIcon className="w-3.5 h-3.5" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase truncate">
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Wizard Step Content Area */}
      <main className="relative z-10 w-full max-w-4xl mx-auto flex-1 py-2 sm:py-3 space-y-4 text-xs">

        {/* ========================================================================= */}
        {/* QUICK PLAY WIZARD STEPS                                                    */}
        {/* ========================================================================= */}
        {activeTab === 'MATCH' && (
          <>
            {/* STEP 1: CHOOSE CATEGORY & TEAMS */}
            {wizardStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Match Category Selection (International vs ICL) */}
                <section className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 shadow-xl">
                  <h3 className="font-extrabold text-slate-100 text-sm tracking-wide uppercase flex items-center gap-2 mb-3">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Choose Match Category</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSelectQuickPlayCategory('WORLD_CUP')}
                      className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                        quickPlayCategory === 'WORLD_CUP'
                          ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/80 scale-[1.01]'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-sm text-white">International Teams</div>
                        <p className="text-[10px] text-slate-400 mt-0.5">Play with national squads (India, Australia, etc.)</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectQuickPlayCategory('IPL')}
                      className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                        quickPlayCategory === 'IPL'
                          ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/80 scale-[1.01]'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-sm text-white">ICL Teams</div>
                        <p className="text-[10px] text-slate-400 mt-0.5">Play with ICL franchises (CSK, MI, RCB, etc.)</p>
                      </div>
                    </button>
                  </div>
                </section>

                {/* Selected Matchup Preview Header */}
                <div className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-amber-500/40 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <TeamBadge team={playerTeam} size="md" />
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Your Team</span>
                      <h3 className="text-base sm:text-lg font-black text-white">{playerTeam.name}</h3>
                    </div>
                  </div>

                  <div className="px-4 py-1.5 rounded-full bg-amber-500 text-slate-950 font-black text-sm uppercase tracking-widest font-['Teko',sans-serif] shadow">
                    VS
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Opponent Team</span>
                      <h3 className="text-base sm:text-lg font-black text-white">{opponentTeam.name}</h3>
                    </div>
                    <TeamBadge team={opponentTeam} size="md" />
                  </div>
                </div>

                {/* Sub-section 1A: Choose Your Team */}
                <section className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3.5 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h3 className="font-extrabold text-slate-100 text-sm tracking-wide uppercase flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">1</span>
                      <span>Select Your Team</span>
                    </h3>
                    <span className="text-[11px] font-mono font-bold text-amber-400 flex items-center gap-1.5">
                      <TeamBadge team={playerTeam} size="xs" />
                      <span>{playerTeam.name} ({playerTeam.rating} OVR)</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1">
                    {(quickPlayCategory === 'IPL' ? IPL_TEAMS : WORLD_CUP_TEAMS).map((team) => {
                      const isSelected = playerTeamId === team.id;
                      return (
                        <button
                          key={`user_${team.id}`}
                          type="button"
                          onClick={() => {
                            soundFx.playUiClick();
                            setPlayerTeamId(team.id);
                            if (opponentTeamId === team.id) {
                              const pool = quickPlayCategory === 'IPL' ? IPL_TEAMS : WORLD_CUP_TEAMS;
                              const fallbackOpp = pool.find((t) => t.id !== team.id);
                              if (fallbackOpp) setOpponentTeamId(fallbackOpp.id);
                            }
                          }}
                          className={`p-2 rounded-xl border text-left transition-all duration-150 flex items-center gap-2.5 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400 scale-[1.02] shadow-md'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <TeamBadge team={team} size="sm" />
                          <div className="min-w-0">
                            <div className="font-black text-xs text-white truncate">{team.name}</div>
                            <div className="text-[9px] text-amber-400/90 font-bold">{team.rating} OVR</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Sub-section 1B: Choose Opponent Team */}
                <section className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3.5 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h3 className="font-extrabold text-slate-100 text-sm tracking-wide uppercase flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center">2</span>
                      <span>Select Opponent Rival Team</span>
                    </h3>
                    <span className="text-[11px] font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                      <TeamBadge team={opponentTeam} size="xs" />
                      <span>{opponentTeam.name} ({opponentTeam.rating} OVR)</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1">
                    {(quickPlayCategory === 'IPL' ? IPL_TEAMS : WORLD_CUP_TEAMS).map((team) => {
                      const isSelected = opponentTeamId === team.id;
                      const isDisabled = playerTeamId === team.id;
                      return (
                        <button
                          key={`opp_${team.id}`}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => {
                            soundFx.playUiClick();
                            setOpponentTeamId(team.id);
                          }}
                          className={`p-2 rounded-xl border text-left transition-all duration-150 flex items-center gap-2.5 ${
                            isDisabled
                              ? 'opacity-30 cursor-not-allowed bg-slate-950 border-slate-900'
                              : isSelected
                              ? 'bg-cyan-500/20 border-cyan-400 ring-2 ring-cyan-400 scale-[1.02] shadow-md cursor-pointer'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 cursor-pointer'
                          }`}
                        >
                          <TeamBadge team={team} size="sm" />
                          <div className="min-w-0">
                            <div className="font-black text-xs text-white truncate">{team.name}</div>
                            <div className="text-[9px] text-cyan-400/90 font-bold">{team.rating} OVR</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Sub-section 1C: Choose Batting Stance */}
                <section className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3.5 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-extrabold text-slate-100 text-sm tracking-wide uppercase flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-400" />
                      <span>Batting Stance & Handedness</span>
                    </h3>
                    <span className="text-[11px] font-mono font-bold text-amber-400">
                      {battingStance === 'RIGHT' ? 'Right-Handed Batsman (RHB)' : 'Left-Handed Batsman (LHB)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'RIGHT' as const, label: 'Right-Handed Batsman (RHB)', desc: 'Standard off-side on right' },
                      { id: 'LEFT' as const, label: 'Left-Handed Batsman (LHB)', desc: 'Southpaw off-side on left' },
                    ].map((stance) => {
                      const isSelected = battingStance === stance.id;
                      return (
                        <button
                          key={stance.id}
                          type="button"
                          onClick={() => {
                            soundFx.playUiClick();
                            setBattingStance(stance.id);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/80 font-black'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="font-bold text-xs text-white">{stance.label}</div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{stance.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}

            {/* STEP 2: OVERS & TARGET CHASE */}
            {wizardStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Number of Overs Selection */}
                <section className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3.5 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-extrabold text-slate-100 text-sm tracking-wide uppercase flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">1</span>
                      <span>Select Number of Overs</span>
                    </h3>
                    <span className="text-[11px] font-mono font-bold text-amber-400">
                      {totalOvers === 0 ? '∞ Unlimited' : `${totalOvers} Overs (${totalOvers * 6} Balls)`}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { overs: 1, name: 'Super Over', balls: '6 Balls' },
                      { overs: 2, name: 'Blitz', balls: '12 Balls' },
                      { overs: 5, name: 'T5 Sprint', balls: '30 Balls' },
                      { overs: 10, name: 'T10 Blast', balls: '60 Balls' },
                      { overs: 20, name: 'T20 Classic', balls: '120 Balls' },
                      { overs: 0, name: 'Unlimited', balls: 'Endless' },
                    ].map((item) => {
                      const isSelected = totalOvers === item.overs;
                      return (
                        <button
                          key={item.overs}
                          type="button"
                          onClick={() => handleSelectOvers(item.overs)}
                          className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-slate-950 border-amber-300 shadow-md font-black scale-[1.03]'
                              : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-lg font-black font-['Teko',sans-serif] leading-tight">
                            {item.overs === 0 ? '∞' : `${item.overs} OV`}
                          </span>
                          <span className="text-[10px] font-bold">{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Number of Wickets Selection */}
                <section className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3.5 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-extrabold text-slate-100 text-sm tracking-wide uppercase flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">2</span>
                      <span>Select Wickets Squad Limit</span>
                    </h3>
                    <span className="text-[11px] font-mono font-bold text-amber-400">
                      {totalWickets} Wickets in Hand
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { wickets: 1, label: '1 Wicket', desc: 'Sudden Death' },
                      { wickets: 2, label: '2 Wickets', desc: 'Duo Stand' },
                      { wickets: 5, label: '5 Wickets', desc: 'Standard Squad' },
                      { wickets: 10, label: '10 Wickets', desc: 'Full XI Squad' },
                    ].map((item) => {
                      const isSelected = totalWickets === item.wickets;
                      return (
                        <button
                          key={item.wickets}
                          type="button"
                          onClick={() => handleSelectWickets(item.wickets)}
                          className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-slate-950 border-amber-300 shadow-md font-black scale-[1.02]'
                              : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-lg font-black font-['Teko',sans-serif] leading-tight">
                            {item.label}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">{item.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Target Chase Mode Selection */}
                <section className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3.5 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-extrabold text-slate-100 text-sm tracking-wide uppercase flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">3</span>
                      <span>Chase Target Mode</span>
                    </h3>

                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleToggleChaseMode(false)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          !isChaseMode ? 'bg-slate-800 text-white shadow' : 'text-slate-400'
                        }`}
                      >
                        Free Batting
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleChaseMode(true)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          isChaseMode ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400'
                        }`}
                      >
                        <Target className="w-3.5 h-3.5" />
                        <span>Target Chase</span>
                      </button>
                    </div>
                  </div>

                  {isChaseMode && (
                    <div className="mt-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-semibold text-xs">Target Score:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playUiClick();
                              setTargetRuns(Math.max(10, targetRuns - 5));
                            }}
                            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-200 font-black text-sm border border-slate-700 flex items-center justify-center cursor-pointer"
                          >
                            -5
                          </button>
                          <div className="px-4 py-1 rounded-lg bg-slate-900 border border-amber-500/40 text-center min-w-[70px]">
                            <span className="text-lg font-black text-amber-400 font-mono">{targetRuns}</span>
                            <span className="text-[10px] text-slate-400 block -mt-1 font-semibold">Runs</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playUiClick();
                              setTargetRuns(targetRuns + 5);
                            }}
                            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-200 font-black text-sm border border-slate-700 flex items-center justify-center cursor-pointer"
                          >
                            +5
                          </button>
                        </div>
                      </div>

                      {requiredRunRate && (
                        <div className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold text-xs flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Req RR: <strong>{requiredRunRate}</strong> RPO</span>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* STEP 3: PITCH & DIFFICULTY */}
            {wizardStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Weather & Pitch Atmosphere Selection */}
                <section className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3.5 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-extrabold text-slate-100 text-sm tracking-wide uppercase flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">1</span>
                      <span>Pitch Atmosphere & Weather</span>
                    </h3>
                    <span className="text-[11px] font-mono font-bold text-amber-400">
                      {weatherCondition === 'SUNNY' && 'Sunny Daylight'}
                      {weatherCondition === 'OVERCAST' && 'Overcast (+45% Swing)'}
                      {weatherCondition === 'RAIN' && 'Drizzle (Slick Pitch)'}
                      {weatherCondition === 'NIGHT' && 'Night Floodlights'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: 'SUNNY' as WeatherCondition, label: 'Sunny', Icon: Sun, iconColor: 'text-amber-400', badge: 'Clear Sky', desc: 'Crisp bounce under bright blue skies' },
                      { value: 'OVERCAST' as WeatherCondition, label: 'Overcast', Icon: Cloud, iconColor: 'text-slate-300', badge: '+45% Swing', desc: 'Moody cloud cover giving pacers deadly swing' },
                      { value: 'RAIN' as WeatherCondition, label: 'Drizzle', Icon: CloudRain, iconColor: 'text-cyan-400', badge: 'Slick Surface', desc: 'Passing rain showers & skiddier low bounce' },
                      { value: 'NIGHT' as WeatherCondition, label: 'Night', Icon: Moon, iconColor: 'text-indigo-400', badge: 'Floodlights', desc: 'High-energy night match under LED towers' },
                    ].map((item) => {
                      const isSelected = weatherCondition === item.value;
                      const WeatherIcon = item.Icon;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => {
                            soundFx.playUiClick();
                            setWeatherCondition(item.value);
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400 font-black scale-[1.02]'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <WeatherIcon className={`w-5 h-5 ${item.iconColor}`} />
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{item.badge}</span>
                          </div>
                          <div className="font-black text-sm text-white">{item.label}</div>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{item.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Level of Difficulty Selection */}
                <section className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3.5 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-extrabold text-slate-100 text-sm tracking-wide uppercase flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">2</span>
                      <span>Select Level of Difficulty</span>
                    </h3>
                    <span className="text-[11px] font-mono font-bold text-amber-400">
                      {difficulty === 'CASUAL' ? 'Casual' : difficulty === 'PRO' ? 'Pro' : 'Champion'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'CASUAL' as const, title: 'Casual / Rookie', badge: '+35% Timing Zone', desc: 'Generous sweet-spot, 95-120 km/h bowling, friendly bounce.' },
                      { id: 'PRO' as const, title: 'Pro / Normal', badge: 'Balanced Competition', desc: 'Realistic 115-140 km/h pace, standard timing windows.' },
                      { id: 'CHAMPION' as const, title: 'Master / Champion', badge: '-25% Tight Timing', desc: '135-155 km/h fiery pacers, sharp cutters, mystery spin.' },
                    ].map((item) => {
                      const isSelected = difficulty === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectDifficulty(item.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-slate-800/95 border-amber-400 ring-2 ring-amber-400 shadow-lg scale-[1.01]'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-sm text-slate-100">{item.title}</span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">{item.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Complete Setup Summary Card */}
                <section className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-cyan-500/10 border border-amber-500/40 rounded-2xl p-4 shadow-xl">
                  <h4 className="text-sm font-black text-amber-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>Complete Match Configuration Summary</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Matchup</span>
                      <div className="font-black text-white text-xs mt-1 flex items-center gap-1.5 flex-wrap">
                        <TeamBadge team={playerTeam} size="xs" />
                        <span>{playerTeam.shortName}</span>
                        <span className="text-slate-500 font-normal">vs</span>
                        <TeamBadge team={opponentTeam} size="xs" />
                        <span>{opponentTeam.shortName}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Format & Wickets</span>
                      <span className="font-black text-amber-400 text-sm mt-0.5 block">{totalOvers === 0 ? 'Unlimited Overs' : `${totalOvers} Overs`} • {totalWickets} Wkts</span>
                    </div>

                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Category</span>
                      <span className="font-black text-cyan-400 text-xs mt-0.5 block truncate">{quickPlayCategory === 'IPL' ? 'Indian Cricket League' : 'ICC T20 World Cup'}</span>
                    </div>

                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Level & Weather</span>
                      <span className="font-black text-emerald-400 text-xs mt-0.5 block">{difficulty} • {weatherCondition}</span>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* PRACTICE NETS SESSION WIZARD STEPS                                        */}
        {/* ========================================================================= */}
        {activeTab === 'PRACTICE' && (
          <>
            {/* Practice Session Records & Stats banner */}
            {onOpenStats && (
              <div className="p-3 bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">View Records & Player Stats</h4>
                    <p className="text-[10px] text-slate-400">Review career strike rate, high scores, boundary counts, and trophy achievements</p>
                  </div>
                </div>
                <button
                  id="practice-open-records-btn"
                  type="button"
                  onClick={() => {
                    soundFx.playUiClick();
                    onOpenStats();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow shrink-0 cursor-pointer"
                >
                  Open Records
                </button>
              </div>
            )}

            {wizardStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <section className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3.5 shadow-xl">
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="font-extrabold text-slate-100 text-sm tracking-wide uppercase flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">1</span>
                      <span>Choose Type of Bowl to Face</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'PACER' as const, Icon: Zap, iconColor: 'text-amber-400', title: 'Express Fast Bowler', speed: '135 – 150 km/h', desc: 'Bouncers, lethal yorkers, away swingers.' },
                      { id: 'MEDIUM_PACE' as const, Icon: Target, iconColor: 'text-emerald-400', title: 'Medium Pacer & Swing', speed: '105 – 125 km/h', desc: 'Inswingers, outswingers, off-cutters.' },
                      { id: 'OFF_SPIN' as const, Icon: RotateCcw, iconColor: 'text-cyan-400', title: 'Off-Spin Attack', speed: '85 – 100 km/h', desc: 'Off-break, arm ball, doosra, top-spin.' },
                      { id: 'LEG_SPIN' as const, Icon: Wind, iconColor: 'text-purple-400', title: 'Leg-Spin Attack', speed: '80 – 98 km/h', desc: 'Leg-break, googly, flipper, slider.' },
                      { id: 'MYSTERY_SPIN' as const, Icon: Sparkles, iconColor: 'text-pink-400', title: 'Mystery Spin Attack', speed: '78 – 95 km/h', desc: 'Carrom ball, knuckle spin, teesra.' },
                      { id: 'AUTO' as const, Icon: Shuffle, iconColor: 'text-slate-300', title: 'All Bowlers (Mixed)', speed: '80 – 150 km/h', desc: 'Dynamic alternating spell rotation.' },
                    ].map((item) => {
                      const isSelected = practiceBowlerType === item.id;
                      const BowlerIcon = item.Icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            soundFx.playUiClick();
                            setPracticeBowlerType(item.id);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-950/70 border-emerald-400 shadow-lg ring-2 ring-emerald-400/80 scale-[1.02]'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <BowlerIcon className={`w-4 h-4 ${item.iconColor}`} />
                            <span className="font-extrabold text-sm text-white">{item.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-400">{item.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <section className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3.5 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-extrabold text-slate-100 text-sm tracking-wide uppercase flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">2</span>
                      <span>Practice Speed & Timing Level</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'CASUAL' as const, title: 'Casual / Rookie', badge: '+35% Timing Zone', desc: 'Generous sweet-spot, friendly bounce.' },
                      { id: 'PRO' as const, title: 'Pro / Normal', badge: 'Match Conditions', desc: 'Authentic match speeds and standard timing.' },
                      { id: 'CHAMPION' as const, title: 'Master / Champion', badge: '-25% Tight Timing', desc: 'Extreme pace (140-155 km/h) & sharp spin breaks.' },
                    ].map((item) => {
                      const isSelected = practiceDifficulty === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            soundFx.playUiClick();
                            setPracticeDifficulty(item.id);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-950/70 border-emerald-400 shadow-lg ring-2 ring-emerald-400'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="font-bold text-xs text-white mb-1">{item.title}</div>
                          <p className="text-[11px] text-slate-400">{item.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}
          </>
        )}

      </main>

      {/* Footer Navigation Buttons Bar */}
      <footer className="relative z-10 w-full max-w-4xl mx-auto pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
        {wizardStep > 1 ? (
          <button
            type="button"
            onClick={handlePrevStep}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold border border-slate-700 text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>← Previous Step</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onBackToHome}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold border border-slate-800 text-xs transition-all flex items-center justify-center cursor-pointer"
          >
            Exit to Home
          </button>
        )}

        {/* Next / Launch Button */}
        {activeTab === 'MATCH' ? (
          wizardStep < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="min-h-[44px] px-8 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wide border border-amber-300 shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer font-['Teko',sans-serif]"
            >
              <span>Next →</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLaunch}
              className="min-h-[48px] px-10 py-3 rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-xl uppercase tracking-wider border-2 border-amber-200 shadow-xl shadow-amber-500/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer font-['Teko',sans-serif]"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>START MATCH</span>
            </button>
          )
        ) : (
          wizardStep < 2 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="min-h-[44px] px-8 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wide border border-emerald-300 shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-['Teko',sans-serif]"
            >
              <span>Next →</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLaunch}
              className="min-h-[48px] px-10 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-xl uppercase tracking-wider border-2 border-emerald-200 shadow-xl shadow-emerald-500/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer font-['Teko',sans-serif]"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>ENTER PRACTICE NETS</span>
            </button>
          )
        )}
      </footer>
    </div>
  );
};
