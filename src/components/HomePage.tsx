import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  Volume2,
  VolumeX,
  Music,
  Maximize2,
  Minimize2,
  BarChart3,
  User,
  LogIn,
  Trash2,
  ChevronRight,
  ArrowRight,
  Trophy,
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import coverImage from '../assets/images/stadium_cover.webp';
import worldCupCrest from '../assets/images/world_cup_crest_1789983578775.jpg';
import leagueCrest from '../assets/images/league_crest_1789983591937.jpg';
import cricketEmblem from '../assets/images/cricket_emblem_1789983606050.jpg';
import practiceNetsCrest from '../assets/images/practice_nets_crest_1789983895166.jpg';

interface HomePageProps {
  onStart: () => void;
  onStartPractice: () => void;
  onOpenWorldCup: () => void;
  onDeleteWorldCup?: () => void;
  onOpenIPL: () => void;
  onDeleteIPL?: () => void;
  onOpenSettings?: () => void;
  hasActiveWorldCup?: boolean;
  worldCupTeamName?: string;
  worldCupStageName?: string;
  hasActiveIPL?: boolean;
  iplTeamName?: string;
  iplStageName?: string;
  isMuted: boolean;
  onToggleSound: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  currentUser?: FirebaseUser | null;
  onOpenAuth?: () => void;
  onOpenStats?: () => void;
  hasChosenAuthOption?: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStart,
  onStartPractice,
  onOpenWorldCup,
  onDeleteWorldCup,
  onOpenIPL,
  onDeleteIPL,
  onOpenSettings,
  hasActiveWorldCup = false,
  worldCupTeamName,
  worldCupStageName,
  hasActiveIPL = false,
  iplTeamName,
  iplStageName,
  isMuted,
  onToggleSound,
  isFullscreen = false,
  onToggleFullscreen,
  currentUser,
  onOpenAuth,
  onOpenStats,
  hasChosenAuthOption = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  // Start pleasant background music on home page mount and clean up on unmount
  useEffect(() => {
    soundFx.startHomeMusic();

    const handleFirstGesture = () => {
      soundFx.unlockAudio();
      soundFx.startHomeMusic();
    };

    window.addEventListener('pointerdown', handleFirstGesture, { passive: true });
    window.addEventListener('touchstart', handleFirstGesture, { passive: true });
    window.addEventListener('keydown', handleFirstGesture, { passive: true });
    window.addEventListener('click', handleFirstGesture, { passive: true });

    return () => {
      soundFx.stopHomeMusic();
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('click', handleFirstGesture);
    };
  }, []);

  const requestLandscapeAndFullscreen = async () => {
    try {
      if (typeof screen !== 'undefined' && 'orientation' in screen && screen.orientation && 'lock' in screen.orientation) {
        await (screen.orientation as any).lock('landscape').catch(() => {});
      }
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {
      // Graceful fallback
    }
  };

  const handleStartClick = () => {
    soundFx.unlockAudio();
    soundFx.playUiClick();
    if (!currentUser && !hasChosenAuthOption) {
      onOpenAuth?.();
      return;
    }
    requestLandscapeAndFullscreen();
    setShowMenu(true);
  };

  const handleQuickMatchClick = () => {
    soundFx.unlockAudio();
    soundFx.stopHomeMusic();
    soundFx.playMatchStart();
    requestLandscapeAndFullscreen();
    onStart();
  };

  const handleWorldCupClick = () => {
    soundFx.unlockAudio();
    soundFx.stopHomeMusic();
    soundFx.playMatchStart();
    requestLandscapeAndFullscreen();
    onOpenWorldCup();
  };

  const handleIPLClick = () => {
    soundFx.unlockAudio();
    soundFx.stopHomeMusic();
    soundFx.playMatchStart();
    requestLandscapeAndFullscreen();
    onOpenIPL();
  };

  const handlePracticeClick = () => {
    soundFx.unlockAudio();
    soundFx.stopHomeMusic();
    soundFx.playUiClick();
    requestLandscapeAndFullscreen();
    onStartPractice();
  };

  const handleSettingsClick = () => {
    soundFx.unlockAudio();
    soundFx.playUiClick();
    onOpenSettings();
  };

  const handleSoundClick = () => {
    soundFx.unlockAudio();
    onToggleSound();
    if (isMuted) {
      setTimeout(() => {
        soundFx.playUiClick();
      }, 50);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden bg-slate-950 select-none font-sans">
      {/* Background Stadium Artwork */}
      <div className="absolute inset-0 z-0">
        <img
          src={coverImage}
          alt="CrickFrenzy Stadium"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 transform"
        />
        {/* Cinematic Vignette & Ambient Radial Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60" />
        <div className="absolute inset-0 bg-radial-vignette opacity-80 pointer-events-none" />
        
        {/* Subtle Light Rays / Floodlight Glares */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5">
        {/* Top Left: Game Title Tag */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900/80 border border-amber-500/30 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-black uppercase tracking-wider text-amber-300">
            ARCADE CRICKET
          </span>
        </div>

        {/* Top Right: Fullscreen & Sound / Music Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Music Status Toggle Button */}
          <button
            id="homepage-music-indicator-btn"
            type="button"
            onClick={handleSoundClick}
            aria-label={isMuted ? 'Unmute Background Music' : 'Mute Background Music'}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 text-xs font-bold cursor-pointer"
            title={isMuted ? 'Music is muted — Click to unmute' : 'Background Music Playing'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-400" />
            ) : (
              <Music className="w-4 h-4 text-amber-400" />
            )}
            {!isMuted && (
              <span className="flex items-end gap-0.5 h-3 ml-0.5">
                <span className="w-0.5 h-2 bg-amber-400 rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" />
                <span className="w-0.5 h-3 bg-amber-300 rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" />
                <span className="w-0.5 h-1.5 bg-amber-500 rounded-full animate-[pulse_0.9s_ease-in-out_infinite]" />
              </span>
            )}
          </button>

          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              aria-label="Toggle Fullscreen"
              className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 text-base sm:text-lg font-bold cursor-pointer"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-slate-300" />
              ) : (
                <Maximize2 className="w-4 h-4 text-slate-300" />
              )}
            </button>
          )}

          <button
            id="homepage-sound-btn"
            type="button"
            onClick={handleSoundClick}
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        </div>
      </header>

      {/* Main Hero Arena: Logo & Start / Mode Options */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 w-full max-w-4xl -mt-2">
        {/* Title Logo Graphic */}
        <div className="relative mb-6 sm:mb-8 select-none group">
          <h1
            className="text-5xl sm:text-7xl md:text-8xl font-black italic tracking-tighter uppercase font-russo leading-none"
          >
            <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">CRICK</span>
            <span className="text-amber-500 pl-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              FRENZY
            </span>
          </h1>
        </div>

        {/* Hero Area: Initial Single START Button OR Revealed Mode Options List */}
        {!showMenu ? (
          <div className="relative w-full sm:w-auto my-4">
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 opacity-80 blur-lg animate-pulse" />
            <button
              id="homepage-start-main-btn"
              type="button"
              onClick={handleStartClick}
              className="relative w-full sm:w-auto px-12 sm:px-20 py-4 sm:py-5 rounded-full bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 hover:from-yellow-200 hover:via-amber-300 hover:to-amber-400 text-slate-950 font-black text-2xl sm:text-4xl tracking-widest uppercase border-4 border-yellow-100 shadow-[0_8px_0_#92400e,0_12px_30px_rgba(245,158,11,0.6)] active:translate-y-2 active:shadow-[0_2px_0_#92400e,0_4px_8px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-all duration-150 flex items-center justify-center gap-3 font-['Teko',sans-serif] cursor-pointer"
            >
              <span className="text-3xl sm:text-4xl text-slate-950 drop-shadow">▶</span>
              <span className="drop-shadow-sm tracking-widest">START</span>
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md bg-slate-900/95 border border-slate-700/80 rounded-3xl p-4 sm:p-5 shadow-2xl animate-[scale-in_0.2s_ease-out] space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-base sm:text-lg font-bold tracking-wider text-amber-400 font-cinzel flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>SELECT GAME MODE</span>
              </h2>
              <button
                type="button"
                onClick={() => {
                  soundFx.playUiClick();
                  setShowMenu(false);
                }}
                className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 min-h-[38px] rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer font-cinzel flex items-center justify-center"
              >
                ← Back
              </button>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              {/* Option 1: Quick Match */}
              <button
                id="homepage-option-quick-match"
                type="button"
                onClick={handleQuickMatchClick}
                className="w-full p-2.5 sm:p-3 rounded-2xl bg-slate-800/90 hover:bg-slate-750 text-left border border-slate-700 hover:border-amber-400/60 shadow-md hover:shadow-amber-500/10 transition-all duration-150 group cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl overflow-hidden border border-amber-500/40 shadow-sm shrink-0 bg-slate-950">
                    <img
                      src={cricketEmblem}
                      alt="Quick Match Crest"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                    />
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-bold uppercase text-white font-cinzel tracking-wider group-hover:text-amber-300">
                      Quick Match
                    </div>
                    <div className="text-xs text-slate-400 font-sans">
                      Play an instant custom match with flexible overs & difficulty
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              {/* Option 2: World Cup */}
              <div className="relative w-full flex items-center gap-1.5">
                <button
                  id="homepage-option-world-cup"
                  type="button"
                  onClick={handleWorldCupClick}
                  className="flex-1 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-800/90 to-slate-800/90 hover:from-amber-500/20 text-left border border-amber-500/40 hover:border-amber-400 shadow-md hover:shadow-amber-500/20 transition-all duration-150 group cursor-pointer flex items-center justify-between min-w-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl overflow-hidden border border-amber-400/60 shadow-sm shrink-0 bg-slate-950">
                      <img
                        src={worldCupCrest}
                        alt="World Cup Crest"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-base sm:text-lg font-bold uppercase text-amber-300 font-cinzel tracking-wider flex items-center gap-1.5">
                        <span>World Cup</span>
                        {hasActiveWorldCup ? (
                          <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                            In Progress
                          </span>
                        ) : (
                          <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold">
                            20 Teams
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 truncate font-sans">
                        {hasActiveWorldCup && worldCupTeamName
                          ? `Resume ${worldCupTeamName} (${worldCupStageName || 'Campaign'})`
                          : 'Official 20-team tournament, groups & knockout bracket'}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform shrink-0 ml-1" />
                </button>

                {hasActiveWorldCup && onDeleteWorldCup && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundFx.playUiClick();
                      onDeleteWorldCup();
                    }}
                    title="Delete current edition & start new tournament"
                    className="w-12 h-12 min-h-[44px] min-w-[44px] p-2 rounded-2xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700/80 text-rose-200 hover:text-white transition-all duration-150 shadow-md cursor-pointer shrink-0 flex items-center justify-center text-sm font-bold active:scale-95"
                  >
                    <Trash2 className="w-4 h-4 text-rose-300" />
                  </button>
                )}
              </div>

              {/* Option 3: Indian Cricket League */}
              <div className="relative w-full flex items-center gap-1.5">
                <button
                  id="homepage-option-ipl"
                  type="button"
                  onClick={handleIPLClick}
                  className="flex-1 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-blue-600/15 via-slate-800/90 to-amber-500/15 hover:from-blue-600/25 hover:to-amber-500/25 text-left border border-blue-400/40 hover:border-amber-400 shadow-md hover:shadow-blue-500/20 transition-all duration-150 group cursor-pointer flex items-center justify-between min-w-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl overflow-hidden border border-cyan-400/50 shadow-sm shrink-0 bg-slate-950">
                      <img
                        src={leagueCrest}
                        alt="Indian Cricket League Crest"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-base sm:text-lg font-bold uppercase text-amber-300 font-cinzel tracking-wider flex items-center gap-1.5">
                        <span>Indian Cricket League</span>
                        <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-400/40 text-[9px] font-bold">
                          ICL
                        </span>
                        {hasActiveIPL ? (
                          <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                            In Progress
                          </span>
                        ) : (
                          <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold">
                            10 Teams
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 truncate font-sans">
                        {hasActiveIPL && iplTeamName
                          ? `Resume ${iplTeamName} (${iplStageName || 'Indian Cricket League'})`
                          : 'Indian Cricket League • 10 Franchises, 14 Matches Each, Playoffs & Trophy'}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform shrink-0 ml-1" />
                </button>

                {hasActiveIPL && onDeleteIPL && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundFx.playUiClick();
                      onDeleteIPL();
                    }}
                    title="Delete current Indian Cricket League season & start fresh"
                    className="w-12 h-12 min-h-[44px] min-w-[44px] p-2 rounded-2xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700/80 text-rose-200 hover:text-white transition-all duration-150 shadow-md cursor-pointer shrink-0 flex items-center justify-center text-sm font-bold active:scale-95"
                  >
                    <Trash2 className="w-4 h-4 text-rose-300" />
                  </button>
                )}
              </div>

              {/* Option 4: Practice Session */}
              <button
                id="homepage-option-practice-session"
                type="button"
                onClick={handlePracticeClick}
                className="w-full p-2.5 sm:p-3 rounded-2xl bg-slate-800/90 hover:bg-slate-750 text-left border border-slate-700 hover:border-emerald-500/60 shadow-md hover:shadow-emerald-500/10 transition-all duration-150 group cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl overflow-hidden border border-emerald-400/50 shadow-sm shrink-0 bg-slate-950">
                    <img
                      src={practiceNetsCrest}
                      alt="Practice Nets Crest"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                    />
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-black uppercase text-white font-['Teko',sans-serif] tracking-wider group-hover:text-emerald-300">
                      Practice Session
                    </div>
                    <div className="text-xs text-slate-400">
                      Hone shot timing and direction in the practice nets
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              {/* Records & Player Account Section (under Practice Session in the menu) */}
              <div className="pt-2 border-t border-slate-800/90 flex items-center gap-2">
                {onOpenStats && (
                  <button
                    id="homepage-menu-records-btn"
                    type="button"
                    onClick={() => {
                      soundFx.playUiClick();
                      onOpenStats();
                    }}
                    className="flex-1 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-slate-800/90 to-amber-500/20 hover:from-amber-500/30 text-left border border-amber-500/40 hover:border-amber-400 shadow transition-all duration-150 group cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black text-sm flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-amber-300" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold uppercase text-amber-300 font-cinzel tracking-wider group-hover:text-amber-200">
                          Player Records & Stats
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans">
                          Career runs, win rate & trophies
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}

                {onOpenAuth && (
                  <button
                    id="homepage-menu-auth-btn"
                    type="button"
                    onClick={() => {
                      soundFx.playUiClick();
                      onOpenAuth();
                    }}
                    className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] shrink-0"
                    title={currentUser ? `Account: ${currentUser.displayName || currentUser.email}` : 'Sign In / Register'}
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
                        <span className="hidden sm:inline text-amber-300 font-bold text-xs">
                          {currentUser.displayName ? currentUser.displayName.split(' ')[0] : 'Account'}
                        </span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-300 font-bold text-xs">Login</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Credits (Homepage only, not in menu page) */}
      {!showMenu && (
        <div className="absolute bottom-2 left-0 w-full text-center z-20 pointer-events-none">
          <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent uppercase tracking-widest animate-pulse">
            Crafted by 𝘼𝙧𝙣𝙖𝙗𝙑𝙚𝙧𝙨𝙚
          </span>
        </div>
      )}
    </div>
  );
};


