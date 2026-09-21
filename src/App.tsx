/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DIFFICULTY_PRESETS } from './config/timingConfig';
import { getWeatherAdjustedTimingConfig } from './config/weatherPhysics';
import { ControlsPanel } from './components/ControlsPanel';
import { EngineTestRunnerModal } from './components/EngineTestRunnerModal';
import { HomePage } from './components/HomePage';
import { InningsSummaryModal } from './components/InningsSummaryModal';
import { MatchSettingsModal } from './components/MatchSettingsModal';
import { MatchSetupMenu } from './components/MatchSetupMenu';
import { MobileLandscapeRightControls } from './components/MobileLandscapeGamepad';
import { OrientationPrompt } from './components/OrientationPrompt';
import { PauseModal } from './components/PauseModal';
import { ExitBallState, PitchCanvas } from './components/PitchCanvas';
import { RightTimingMeter } from './components/RightTimingMeter';
import { Scoreboard } from './components/Scoreboard';
import { TimingMeter } from './components/TimingMeter';
import {
  createInitialGameState,
  DEFAULT_MATCH_CONFIG,
  recordDeliveryOutcome,
  resolveShotOutcome,
} from './engine/battingEngine';
import { generateDelivery } from './engine/bowlingGenerator';
import { BallDelivery, BatterArchetype, BattingShotMode, BattingStance, BowlerFilter, MatchConfig, ShotDirection, ShotOutcome, WeatherCondition } from './types';
import { soundFx } from './utils/audio';
import { triggerHaptic } from './utils/haptics';
import { useMobileLandscape } from './utils/useMobileLandscape';
import { WorldCupSetupModal } from './components/WorldCupSetupModal';
import { IPLSetupModal } from './components/IPLSetupModal';
import { WorldCupHub } from './components/WorldCupHub';
import { WorldCupChampionModal } from './components/WorldCupChampionModal';
import { DeleteWorldCupModal } from './components/DeleteWorldCupModal';
import {
  clearTournamentState,
  clearIPLState,
  createNewTournament,
  loadTournamentState,
  loadIPLState,
  recordUserMatchResult,
  saveTournamentState,
  simulateOpponentInnings,
} from './tournament/tournamentEngine';
import { getTeamById } from './tournament/teamsData';
import { WorldCupMatch, WorldCupTournamentState } from './tournament/types';
import { OverBowlerIntroOverlay } from './components/OverBowlerIntroOverlay';
import { getFieldingSetupForOver } from './config/fieldingPresets';
import { getBowlerProfileForOver } from './config/bowlerProfiles';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, syncUserProfile } from './lib/firebase';
import { syncGuestDataToCloud } from './lib/guestProfile';
import { AuthModal } from './components/AuthModal';
import { AuthScreen } from './components/AuthScreen';
import { PlayerStatsModal } from './components/PlayerStatsModal';

export default function App() {
  // Mobile & Orientation state
  const {
    isLandscape,
    showPortraitPrompt,
    isFullscreen,
    toggleFullscreen,
  } = useMobileLandscape();

  // Firebase Auth & Modals State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [hasChosenAuthOption, setHasChosenAuthOption] = useState<boolean>(() => {
    return sessionStorage.getItem('crickfrenzy_auth_choice_made') === 'true';
  });
  // Show auth modal right at the start if user has not yet authenticated or chosen guest mode
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(() => {
    return sessionStorage.getItem('crickfrenzy_auth_choice_made') !== 'true';
  });
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);

  const handleSelectGuest = () => {
    sessionStorage.setItem('crickfrenzy_auth_choice_made', 'true');
    setHasChosenAuthOption(true);
    setIsAuthOpen(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        sessionStorage.setItem('crickfrenzy_auth_choice_made', 'true');
        setHasChosenAuthOption(true);
        syncUserProfile(user).catch((err) => console.warn('Profile sync warning:', err));
        syncGuestDataToCloud(user.uid).catch((err) => console.warn('Guest data sync warning:', err));
      }
    });
    return () => unsubscribe();
  }, []);

  // Master Game State
  const [gameState, setGameState] = useState(() => createInitialGameState(DEFAULT_MATCH_CONFIG));
  
  // Navigation Screens: HOME (Homepage title screen), MATCH_SETUP (Format & Difficulty selection), PLAYING (Live match), WORLD_CUP_HUB (World Cup/IPL dashboard)
  const [currentScreen, setCurrentScreen] = useState<'HOME' | 'MATCH_SETUP' | 'PLAYING' | 'WORLD_CUP_HUB'>('HOME');
  const [setupInitialMode, setSetupInitialMode] = useState<'MATCH' | 'PRACTICE'>('MATCH');

  // Active Tournament Context: 'WORLD_CUP' or 'IPL'
  const [currentTournamentContext, setCurrentTournamentContext] = useState<'WORLD_CUP' | 'IPL'>('WORLD_CUP');

  // World Cup Tournament State
  const [activeTournament, setActiveTournament] = useState<WorldCupTournamentState | null>(() => loadTournamentState());
  const [isWorldCupSetupOpen, setIsWorldCupSetupOpen] = useState<boolean>(false);
  const [isWorldCupChampionOpen, setIsWorldCupChampionOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const activeTournamentRef = useRef(activeTournament);

  // Domestic Leagues / IPL State
  const [activeIPL, setActiveIPL] = useState<WorldCupTournamentState | null>(() => loadIPLState());
  const [isIPLSetupOpen, setIsIPLSetupOpen] = useState<boolean>(false);
  const [isDeleteIPLModalOpen, setIsDeleteIPLModalOpen] = useState<boolean>(false);
  const activeIPLRef = useRef(activeIPL);

  useEffect(() => {
    activeTournamentRef.current = activeTournament;
  }, [activeTournament]);

  useEffect(() => {
    activeIPLRef.current = activeIPL;
  }, [activeIPL]);

  // Active Delivery State
  const [currentDelivery, setCurrentDelivery] = useState<BallDelivery | null>(null);
  const [isBowlerRunningUp, setIsBowlerRunningUp] = useState<boolean>(false);
  const [bowlerRunUpProgress, setBowlerRunUpProgress] = useState<number>(0);
  const [isBallInFlight, setIsBallInFlight] = useState<boolean>(false);
  const [deliveryProgress, setDeliveryProgress] = useState<number>(0);
  const [selectedDirection, setSelectedDirection] = useState<ShotDirection>('STRAIGHT');
  const [battingShotMode, setBattingShotMode] = useState<BattingShotMode>('DEFENSIVE');
  const battingShotModeRef = useRef<BattingShotMode>('DEFENSIVE');

  useEffect(() => {
    battingShotModeRef.current = battingShotMode;
  }, [battingShotMode]);

  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  // Post-Hit Exit Ball Trajectory State
  const [exitBallState, setExitBallState] = useState<ExitBallState | null>(null);
  const [impactEffect, setImpactEffect] = useState<'WICKET' | 'SIX' | null>(null);
  const impactTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Animation & Visual Feedback States
  const [batterAnimation, setBatterAnimation] = useState<
    'IDLE' | 'BACKLIFT' | 'SWING_OFF' | 'SWING_STRAIGHT' | 'SWING_ON' | 'DEFENSIVE' | 'BOWLED'
  >('IDLE');
  const [showHitFeedback, setShowHitFeedback] = useState<boolean>(false);
  const [autoBowl, setAutoBowl] = useState<boolean>(true);
  const [bowlerFilter, setBowlerFilter] = useState<BowlerFilter>('AUTO');
  const [isMuted, setIsMuted] = useState<boolean>(soundFx.getMuted());
  const [soundVolume, setSoundVolume] = useState<number>(soundFx.getVolume());

  // Modals & Over Introductions
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isTestsOpen, setIsTestsOpen] = useState<boolean>(false);
  const [isOverIntroOpen, setIsOverIntroOpen] = useState<boolean>(true);

  // Routing State & Synchronization
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  const navigate = useCallback((path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
  }, []);

  useEffect(() => {
    if (currentScreen === 'HOME' && currentPath !== '/') {
      window.history.pushState(null, '', '/');
      setCurrentPath('/');
    } else if (currentScreen === 'MATCH_SETUP' && currentPath !== '/play') {
      window.history.pushState(null, '', '/play');
      setCurrentPath('/play');
    } else if (currentScreen === 'PLAYING' && currentPath !== '/play') {
      window.history.pushState(null, '', '/play');
      setCurrentPath('/play');
    } else if (currentScreen === 'WORLD_CUP_HUB') {
      const targetPath = currentTournamentContext === 'IPL' ? '/ipl' : '/world-cup';
      if (currentPath !== targetPath) {
        window.history.pushState(null, '', targetPath);
        setCurrentPath(targetPath);
      }
    }
  }, [currentScreen, currentTournamentContext, currentPath]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      if (path === '/') {
        setCurrentScreen('HOME');
      } else if (path === '/play') {
        setCurrentScreen('MATCH_SETUP');
      } else if (path === '/world-cup') {
        setCurrentTournamentContext('WORLD_CUP');
        if (activeTournament) {
          setCurrentScreen('WORLD_CUP_HUB');
        } else {
          setCurrentScreen('HOME');
          setIsWorldCupSetupOpen(true);
        }
      } else if (path === '/ipl') {
        setCurrentTournamentContext('IPL');
        if (activeIPL) {
          setCurrentScreen('WORLD_CUP_HUB');
        } else {
          setCurrentScreen('HOME');
          setIsIPLSetupOpen(true);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTournament, activeIPL]);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/play') {
      setCurrentScreen('MATCH_SETUP');
    } else if (path === '/world-cup') {
      setCurrentTournamentContext('WORLD_CUP');
      if (activeTournament) {
        setCurrentScreen('WORLD_CUP_HUB');
      } else {
        setCurrentScreen('HOME');
        setIsWorldCupSetupOpen(true);
      }
    } else if (path === '/ipl') {
      setCurrentTournamentContext('IPL');
      if (activeIPL) {
        setCurrentScreen('WORLD_CUP_HUB');
      } else {
        setCurrentScreen('HOME');
        setIsIPLSetupOpen(true);
      }
    }
  }, []);

  // Dynamic SEO Page Titles and Descriptions
  useEffect(() => {
    let title = 'CrickFrenzy | Professional Cricket Batting Game';
    let description = 'Play CrickFrenzy, a professional, high-precision batting simulator. Perfect your timing, score runs, and lead your team to victory.';

    if (currentPath === '/') {
      title = 'CrickFrenzy | Home';
      description = 'Play CrickFrenzy, a professional, high-precision batting simulator. Perfect your timing, score runs, and lead your team to victory.';
    } else if (currentPath === '/play') {
      title = 'Play Match | CrickFrenzy';
      description = 'Step up to the crease, choose your shot direction, and face real bowler variations to chase down the target.';
    } else if (currentPath === '/world-cup') {
      title = 'World Cup Hub | CrickFrenzy';
      description = 'Lead your chosen nation through group stages and knockout matches to claim the ultimate Cricket World Cup trophy.';
    } else if (currentPath === '/ipl') {
      title = 'ICL League Hub | CrickFrenzy';
      description = 'Manage your franchise team, win crucial league matches, and conquer the Indian Cricket League playoffs.';
    } else {
      title = '404 - Innings Terminated | CrickFrenzy';
      description = 'Vacant stadium. This page does not exist.';
    }

    document.title = title;
    
    // Update Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }
    
    // Update OpenGraph Title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    }
    
    // Update OpenGraph Description
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', description);
    }

    // Update Canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', `https://crick-frenzy.vercel.app${currentPath}`);
    }
  }, [currentPath]);

  // Dynamic Shuffled Fielding Setup (changes every 6 balls / new over)
  const activeFieldingSetup = useMemo(() => {
    return getFieldingSetupForOver(gameState.currentOver, currentDelivery?.bowlerStyle);
  }, [gameState.currentOver, currentDelivery?.bowlerStyle]);

  // Bowler Profile for the active over
  const activeBowlerProfile = useMemo(() => {
    const practiceStyle = gameState.config.isPracticeMode && gameState.config.practiceBowlerType
      ? gameState.config.practiceBowlerType
      : bowlerFilter;
    return getBowlerProfileForOver(
      gameState.currentOver,
      gameState.config.opponentTeamId,
      practiceStyle
    );
  }, [gameState.currentOver, gameState.config.opponentTeamId, gameState.config.isPracticeMode, gameState.config.practiceBowlerType, bowlerFilter]);

  // Reliable, high-precision refs to eliminate closure staleness and race conditions
  const deliverySeqRef = useRef<number>(0);
  const flightStartTimeRef = useRef<number>(0);
  const runUpStartTimeRef = useRef<number>(0);
  const runUpDurationRef = useRef<number>(650);
  const animFrameIdRef = useRef<number | null>(null);
  const exitAnimFrameIdRef = useRef<number | null>(null);
  const nextBallTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSwungRef = useRef<boolean>(false);
  const isBowlerRunningUpRef = useRef<boolean>(false);
  const bowlerRunUpProgressRef = useRef<number>(0);
  const isBallInFlightRef = useRef<boolean>(false);
  const selectedDirectionRef = useRef<ShotDirection>('STRAIGHT');
  const gameStateRef = useRef(gameState);
  const autoBowlRef = useRef(autoBowl);
  const bowlerFilterRef = useRef(bowlerFilter);
  const currentDeliveryRef = useRef<BallDelivery | null>(null);
  const isPausedRef = useRef<boolean>(false);
  const completedTournamentMatchIdsRef = useRef<Set<string>>(new Set());

  // Keep refs synchronized with React state
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Keep refs synchronized with React state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    selectedDirectionRef.current = selectedDirection;
  }, [selectedDirection]);

  useEffect(() => {
    autoBowlRef.current = autoBowl;
  }, [autoBowl]);

  useEffect(() => {
    bowlerFilterRef.current = bowlerFilter;
  }, [bowlerFilter]);

  const activeTimingConfig = useMemo(() => {
    return getWeatherAdjustedTimingConfig(
      DIFFICULTY_PRESETS[gameState.config.difficulty],
      gameState.config.weatherCondition || 'SUNNY'
    );
  }, [gameState.config.difficulty, gameState.config.weatherCondition]);

  const activeTimingConfigRef = useRef(activeTimingConfig);
  useEffect(() => {
    activeTimingConfigRef.current = activeTimingConfig;
  }, [activeTimingConfig]);

  // Synchronize background ambient chanting with current 'Consecutive Boundaries' streak
  useEffect(() => {
    soundFx.updateBoundaryStreak(
      gameState.consecutiveBoundaries || 0,
      gameState.isInningsOver
    );
  }, [gameState.consecutiveBoundaries, gameState.isInningsOver]);

  // Unlock and initialize ambient audio layer on first user interaction
  useEffect(() => {
    const handleFirstGesture = () => {
      soundFx.startAmbientIfNeeded();
    };

    window.addEventListener('pointerdown', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, []);

  // Clean up all animation frames and timers on unmount
  useEffect(() => {
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (exitAnimFrameIdRef.current) cancelAnimationFrame(exitAnimFrameIdRef.current);
      if (nextBallTimerRef.current) clearTimeout(nextBallTimerRef.current);
    };
  }, []);

  // Handle shot result processing & trigger continuous post-hit ball flight
  const handleShotResult = useCallback((
    outcome: ShotOutcome,
    delivery: BallDelivery,
    contactX: number = 400,
    contactY: number = 420
  ) => {
    // 1. Play Sound FX & Haptics & Screen Shake Impact
    if (outcome.isWicket) {
      triggerHaptic('wicket');
      if (outcome.wicketType === 'BOWLED') {
        soundFx.playBowledStumps();
      }
      soundFx.playCrowdGroan();

      // Trigger screen-shake animation for immediate wicket impact
      if (impactTimerRef.current) clearTimeout(impactTimerRef.current);
      setImpactEffect('WICKET');
      impactTimerRef.current = setTimeout(() => {
        setImpactEffect(null);
      }, 650);
    } else if (outcome.boundaryType === 'SIX') {
      triggerHaptic('six');
      soundFx.playBatHit('PERFECT');
      soundFx.playBoundaryHorn();
      soundFx.playCrowdCheer(true);

      if (impactTimerRef.current) clearTimeout(impactTimerRef.current);
      setImpactEffect('SIX');
      impactTimerRef.current = setTimeout(() => {
        setImpactEffect(null);
      }, 650);
    } else if (outcome.boundaryType === 'FOUR') {
      triggerHaptic('boundary');
      soundFx.playBatHit('GOOD');
      soundFx.playBoundaryHorn();
      soundFx.playCrowdCheer(false);
    } else if (outcome.runs > 0) {
      triggerHaptic('hit');
      soundFx.playBatHit('GOOD');
    } else if (outcome.timingTier === 'MISS') {
      triggerHaptic('tap');
      soundFx.playCrowdGroan();
    } else {
      triggerHaptic('tap');
      soundFx.playBatHit('DEFENSIVE');
    }

    // 2. Set Batter Pose
    if (outcome.isWicket && outcome.wicketType === 'BOWLED') {
      setBatterAnimation('BOWLED');
    } else if (outcome.timingTier === 'MISS') {
      setBatterAnimation('IDLE');
    } else if (outcome.timingTier === 'EARLY' || outcome.timingTier === 'LATE') {
      setBatterAnimation('DEFENSIVE');
    } else {
      if (outcome.shotDirection === 'OFF_SIDE') setBatterAnimation('SWING_OFF');
      else if (outcome.shotDirection === 'ON_SIDE') setBatterAnimation('SWING_ON');
      else setBatterAnimation('SWING_STRAIGHT');
    }

    // 3. Start Continuous Post-Hit Exit Ball Trajectory
    if (exitAnimFrameIdRef.current) {
      cancelAnimationFrame(exitAnimFrameIdRef.current);
      exitAnimFrameIdRef.current = null;
    }

    const exitFlightDuration = outcome.boundaryType === 'SIX' ? 1400 : outcome.boundaryType === 'FOUR' ? 1100 : 850;
    const exitStartTime = performance.now();
    const thisDeliverySeq = deliverySeqRef.current;

    // Trigger exit ball state ONCE with timestamps so PitchCanvas handles localized smooth 60fps interpolation
    setExitBallState({
      outcome,
      progress: 0,
      startX: contactX,
      startY: contactY,
      isActive: true,
      startTime: exitStartTime,
      duration: exitFlightDuration,
    });

    setTimeout(() => {
      if (deliverySeqRef.current === thisDeliverySeq) {
        setShowHitFeedback(true);
      }
    }, exitFlightDuration);

    // 4. Update Game State
    setGameState((prev) => {
      const nextState = recordDeliveryOutcome(prev, outcome, delivery);

      // Auto-schedule next delivery after ball completes travel
      if (!nextState.isInningsOver) {
        if (nextBallTimerRef.current) clearTimeout(nextBallTimerRef.current);
        const isOverFinished = nextState.ballInOver === 0 && nextState.currentOver > prev.currentOver;
        nextBallTimerRef.current = setTimeout(() => {
          setBatterAnimation('IDLE');
          setShowHitFeedback(false);
          setExitBallState(null);
          if (isOverFinished) {
            setIsOverIntroOpen(true);
          } else if (autoBowlRef.current) {
            bowlNextBall();
          }
        }, exitFlightDuration + 1400);
      }

      // If tournament match ends, update the World Cup or IPL tournament state
      if (nextState.isInningsOver && nextState.config.isTournamentMatch && nextState.config.tournamentMatchId) {
        const matchId = nextState.config.tournamentMatchId;
        if (!completedTournamentMatchIdsRef.current.has(matchId)) {
          completedTournamentMatchIdsRef.current.add(matchId);
          const isIPLMatch = nextState.config.tournamentType === 'IPL' || currentTournamentContext === 'IPL';
          const tState = isIPLMatch ? activeIPLRef.current : activeTournamentRef.current;
          if (tState) {
            const oppScore = nextState.config.opponentScore || {
              runs: Math.max(0, (nextState.config.target || 50) - 1),
              wickets: 5,
              overs: nextState.config.totalOvers,
            };
            const userOversFaced = nextState.currentOver + (nextState.ballInOver / 6);
            const userScore = {
              runs: nextState.runs,
              wickets: nextState.wickets,
              overs: parseFloat(userOversFaced.toFixed(1)),
            };
            const updatedTournament = recordUserMatchResult(
              tState,
              matchId,
              userScore,
              oppScore
            );
            if (isIPLMatch) {
              setActiveIPL(updatedTournament);
              activeIPLRef.current = updatedTournament;
            } else {
              setActiveTournament(updatedTournament);
              activeTournamentRef.current = updatedTournament;
            }

            // If won the Grand Final, celebrate with Champion Modal!
            if (updatedTournament.championTeamId === updatedTournament.userTeamId) {
              setTimeout(() => {
                setIsWorldCupChampionOpen(true);
              }, 600);
            }
          }
        }
      }

      return nextState;
    });
  }, []);

  // Bowl next delivery function with rock-solid sequence locking and pre-delivery bowler run-up
  const bowlNextBall = useCallback(() => {
    const st = gameStateRef.current;
    if (st.isInningsOver || isPausedRef.current) return;

    // Clear any existing timeouts or frames
    if (nextBallTimerRef.current) {
      clearTimeout(nextBallTimerRef.current);
      nextBallTimerRef.current = null;
    }
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (exitAnimFrameIdRef.current) {
      cancelAnimationFrame(exitAnimFrameIdRef.current);
      exitAnimFrameIdRef.current = null;
    }

    // Increment delivery sequence ID
    deliverySeqRef.current += 1;
    const currentSeq = deliverySeqRef.current;

    // Generate upcoming delivery
    const activeBowlerFilter =
      st.config.isPracticeMode && st.config.practiceBowlerType
        ? st.config.practiceBowlerType
        : bowlerFilterRef.current;

    const delivery = generateDelivery({
      overIndex: st.currentOver,
      ballInOver: st.ballInOver,
      totalOvers: st.config.totalOvers,
      difficulty: st.config.difficulty,
      weatherCondition: st.config.weatherCondition || 'SUNNY',
      preferredBowler: activeBowlerFilter,
    });

    const isSpin =
      delivery.bowlerStyle === 'OFF_SPINNER' ||
      delivery.bowlerStyle === 'LEG_SPINNER' ||
      delivery.bowlerStyle === 'MYSTERY_SPINNER';

    const runUpDuration = isSpin ? 480 : delivery.bowlerStyle === 'MEDIUM_PACER' ? 620 : 750;
    runUpDurationRef.current = runUpDuration;

    currentDeliveryRef.current = delivery;
    setCurrentDelivery(delivery);
    setIsBowlerRunningUp(true);
    isBowlerRunningUpRef.current = true;
    setBowlerRunUpProgress(0);
    bowlerRunUpProgressRef.current = 0;

    setIsBallInFlight(false);
    isBallInFlightRef.current = false;
    setDeliveryProgress(0);
    setExitBallState(null);
    hasSwungRef.current = false;
    setBatterAnimation('BACKLIFT');
    setShowHitFeedback(false);

    soundFx.playBowlerRunUp();
    runUpStartTimeRef.current = performance.now();

    // High precision requestAnimationFrame run-up loop that transitions to ball flight
    const animateRunUp = (now: number) => {
      if (deliverySeqRef.current !== currentSeq || isPausedRef.current) return;

      const elapsed = Math.max(0, now - runUpStartTimeRef.current);
      const runP = Math.min(1.0, elapsed / runUpDurationRef.current);

      setBowlerRunUpProgress(runP);
      bowlerRunUpProgressRef.current = runP;

      if (runP >= 1.0) {
        // Bowler reaches crease -> Release the ball!
        setIsBowlerRunningUp(false);
        isBowlerRunningUpRef.current = false;

        setIsBallInFlight(true);
        isBallInFlightRef.current = true;
        setDeliveryProgress(0);

        soundFx.playBallRelease();
        flightStartTimeRef.current = performance.now();
        let hasBounced = false;

        const animateFlight = (flightNow: number) => {
          if (deliverySeqRef.current !== currentSeq || isPausedRef.current) return;

          const flightElapsed = Math.max(0, flightNow - flightStartTimeRef.current);
          const progress = flightElapsed / delivery.flightDurationMs;

          setDeliveryProgress(progress);

          const bounceP = delivery.bounceRatio ?? 0.65;
          if (progress >= bounceP && !hasBounced) {
            hasBounced = true;
            soundFx.playBallBounce();
          }

          // If ball has completely passed batsman without swing (progress >= 1.15)
          if (progress >= 1.15 && !hasSwungRef.current && isBallInFlightRef.current) {
            hasSwungRef.current = true;
            isBallInFlightRef.current = false;
            setIsBallInFlight(false);

            // Resolve clean miss / play & miss
            const missOutcome = resolveShotOutcome(
              delivery,
              selectedDirectionRef.current,
              450, // large late offset = complete miss
              {
                config: activeTimingConfigRef.current,
                weatherCondition: gameStateRef.current.config.weatherCondition || 'SUNNY',
                batterArchetype: gameStateRef.current.config.batterArchetype || 'CLASSICAL',
                battingShotMode: battingShotModeRef.current,
              }
            );

            handleShotResult(missOutcome, delivery, 400, 430);
            return;
          }

          if (!hasSwungRef.current && isBallInFlightRef.current) {
            animFrameIdRef.current = requestAnimationFrame(animateFlight);
          }
        };

        animFrameIdRef.current = requestAnimationFrame(animateFlight);
        return;
      }

      animFrameIdRef.current = requestAnimationFrame(animateRunUp);
    };

    animFrameIdRef.current = requestAnimationFrame(animateRunUp);
  }, [handleShotResult]);

  // Player Trigger Swing (supports optional directionOverride from click position)
  const handleSwing = useCallback((directionOverride?: ShotDirection) => {
    if (!isBallInFlightRef.current || !currentDeliveryRef.current || hasSwungRef.current || gameStateRef.current.isInningsOver || isPausedRef.current) {
      return;
    }

    const direction = directionOverride || selectedDirectionRef.current;
    if (directionOverride && directionOverride !== selectedDirectionRef.current) {
      setSelectedDirection(directionOverride);
      selectedDirectionRef.current = directionOverride;
    }

    hasSwungRef.current = true;
    isBallInFlightRef.current = false;
    setIsBallInFlight(false);
    triggerHaptic('hit');

    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    const now = performance.now();
    const delivery = currentDeliveryRef.current;
    const idealHitTime = flightStartTimeRef.current + delivery.flightDurationMs;
    const timingOffsetMs = now - idealHitTime; // < 0 is early, > 0 is late

    const outcome = resolveShotOutcome(
      delivery,
      direction,
      timingOffsetMs,
      {
        config: activeTimingConfigRef.current,
        weatherCondition: gameStateRef.current.config.weatherCondition || 'SUNNY',
        batterArchetype: gameStateRef.current.config.batterArchetype || 'CLASSICAL',
        battingShotMode: battingShotModeRef.current,
      }
    );

    // Dynamic contact point based on direction
    const contactX = direction === 'OFF_SIDE' ? 370 : direction === 'ON_SIDE' ? 440 : 410;
    const contactY = 415;

    handleShotResult(outcome, delivery, contactX, contactY);
  }, [handleShotResult]);

  // Toggle pause handler
  const handleTogglePause = useCallback(() => {
    setIsPaused((prev) => {
      const next = !prev;
      isPausedRef.current = next;

      if (next) {
        // Pausing: halt active animation loops and timers
        if (animFrameIdRef.current) {
          cancelAnimationFrame(animFrameIdRef.current);
          animFrameIdRef.current = null;
        }
        if (exitAnimFrameIdRef.current) {
          cancelAnimationFrame(exitAnimFrameIdRef.current);
          exitAnimFrameIdRef.current = null;
        }
        if (nextBallTimerRef.current) {
          clearTimeout(nextBallTimerRef.current);
          nextBallTimerRef.current = null;
        }
      } else {
        // Resuming: continue bowler run-up, flight, or schedule next ball
        const thisSeq = deliverySeqRef.current;

        if (isBowlerRunningUpRef.current && currentDeliveryRef.current) {
          const currentRunP = bowlerRunUpProgressRef.current;
          runUpStartTimeRef.current = performance.now() - (currentRunP * runUpDurationRef.current);

          const animateRunUp = (now: number) => {
            if (deliverySeqRef.current !== thisSeq || isPausedRef.current) return;

            const elapsed = Math.max(0, now - runUpStartTimeRef.current);
            const runP = Math.min(1.0, elapsed / runUpDurationRef.current);

            setBowlerRunUpProgress(runP);
            bowlerRunUpProgressRef.current = runP;

            if (runP >= 1.0) {
              setIsBowlerRunningUp(false);
              isBowlerRunningUpRef.current = false;

              setIsBallInFlight(true);
              isBallInFlightRef.current = true;
              setDeliveryProgress(0);

              soundFx.playBallRelease();
              flightStartTimeRef.current = performance.now();
              let hasBounced = false;

              const animateFlight = (flightNow: number) => {
                if (deliverySeqRef.current !== thisSeq || isPausedRef.current) return;

                const flightElapsed = Math.max(0, flightNow - flightStartTimeRef.current);
                const progress = flightElapsed / currentDeliveryRef.current!.flightDurationMs;

                setDeliveryProgress(progress);

                const bounceP = currentDeliveryRef.current?.bounceRatio ?? 0.65;
                if (progress >= bounceP && !hasBounced) {
                  hasBounced = true;
                  soundFx.playBallBounce();
                }

                if (progress >= 1.15 && !hasSwungRef.current && isBallInFlightRef.current) {
                  hasSwungRef.current = true;
                  isBallInFlightRef.current = false;
                  setIsBallInFlight(false);

                  const missOutcome = resolveShotOutcome(
                    currentDeliveryRef.current!,
                    selectedDirectionRef.current,
                    450,
                    {
                      config: activeTimingConfigRef.current,
                      weatherCondition: gameStateRef.current.config.weatherCondition || 'SUNNY',
                      batterArchetype: gameStateRef.current.config.batterArchetype || 'CLASSICAL',
                      battingShotMode: battingShotModeRef.current,
                    }
                  );

                  handleShotResult(missOutcome, currentDeliveryRef.current!, 400, 430);
                  return;
                }

                if (!hasSwungRef.current && isBallInFlightRef.current) {
                  animFrameIdRef.current = requestAnimationFrame(animateFlight);
                }
              };

              animFrameIdRef.current = requestAnimationFrame(animateFlight);
              return;
            }

            animFrameIdRef.current = requestAnimationFrame(animateRunUp);
          };

          animFrameIdRef.current = requestAnimationFrame(animateRunUp);
        } else if (isBallInFlightRef.current && currentDeliveryRef.current && !hasSwungRef.current) {
          const delivery = currentDeliveryRef.current;
          const currentProgress = deliveryProgress;
          flightStartTimeRef.current = performance.now() - (currentProgress * delivery.flightDurationMs);

          const animateFlight = (now: number) => {
            if (deliverySeqRef.current !== thisSeq || isPausedRef.current) return;

            const elapsed = Math.max(0, now - flightStartTimeRef.current);
            const progress = elapsed / delivery.flightDurationMs;

            setDeliveryProgress(progress);

            if (progress >= 1.15 && !hasSwungRef.current && isBallInFlightRef.current) {
              hasSwungRef.current = true;
              isBallInFlightRef.current = false;
              setIsBallInFlight(false);

              const missOutcome = resolveShotOutcome(
                delivery,
                selectedDirectionRef.current,
                450,
                {
                  config: activeTimingConfigRef.current,
                  weatherCondition: gameStateRef.current.config.weatherCondition || 'SUNNY',
                  batterArchetype: gameStateRef.current.config.batterArchetype || 'CLASSICAL',
                  battingShotMode: battingShotModeRef.current,
                }
              );

              handleShotResult(missOutcome, delivery, 400, 430);
              return;
            }

            if (!hasSwungRef.current && isBallInFlightRef.current) {
              animFrameIdRef.current = requestAnimationFrame(animateFlight);
            }
          };

          animFrameIdRef.current = requestAnimationFrame(animateFlight);
        } else if (!gameStateRef.current.isInningsOver && autoBowlRef.current && !isBallInFlightRef.current && !isBowlerRunningUpRef.current) {
          if (nextBallTimerRef.current) clearTimeout(nextBallTimerRef.current);
          nextBallTimerRef.current = setTimeout(() => {
            if (!isPausedRef.current) {
              setBatterAnimation('IDLE');
              setShowHitFeedback(false);
              setExitBallState(null);
              bowlNextBall();
            }
          }, 600);
        }
      }

      return next;
    });
  }, [deliveryProgress, handleShotResult, bowlNextBall]);

  // Calculate active batting stance (for World Cup matches, handedness is default per lineup player; for normal matches, uses user preference)
  const getBatterHandednessForWickets = (wickets: number): BattingStance => {
    // Standard lineup handedness (e.g., batters #2, #4, #6, #8 are Left-Handed, others are Right-Handed)
    const lhbWicketIndices = [1, 3, 5, 7];
    return lhbWicketIndices.includes(wickets) ? 'LEFT' : 'RIGHT';
  };

  const activeBattingStance: BattingStance = gameState.config.isTournamentMatch
    ? getBatterHandednessForWickets(gameState.wickets)
    : (gameState.config.battingStance || 'RIGHT');

  // Toggle batting stance (Right-Handed vs Left-Handed) - Disabled in World Cup matches
  const handleToggleBattingStance = useCallback(() => {
    if (gameStateRef.current.config.isTournamentMatch) return;
    soundFx.playUiClick();
    setGameState((prev) => {
      const currentStance = prev.config.battingStance || 'RIGHT';
      const newStance: BattingStance = currentStance === 'RIGHT' ? 'LEFT' : 'RIGHT';
      return {
        ...prev,
        config: {
          ...prev.config,
          battingStance: newStance,
        },
      };
    });
  }, []);

  // Toggle batting shot mode (Defensive vs Loft)
  const handleToggleShotMode = useCallback(() => {
    soundFx.playUiClick();
    setBattingShotMode((prev) => (prev === 'DEFENSIVE' ? 'LOFT' : 'DEFENSIVE'));
  }, []);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle pause shortcut (Escape or 'P')
      if (e.code === 'Escape' || e.key.toLowerCase() === 'p') {
        if (currentScreen === 'PLAYING') {
          e.preventDefault();
          handleTogglePause();
          return;
        }
      }

      // If paused, ignore all in-match gameplay keys
      if (isPausedRef.current) return;

      // Prevent scrolling on Space or Arrow keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      // Space or Enter: Swing bat (or bowl if idle)
      if (e.code === 'Space' || e.code === 'Enter') {
        if (isBallInFlightRef.current) {
          handleSwing();
        } else if (!gameStateRef.current.isInningsOver) {
          bowlNextBall();
        }
        return;
      }

      const currentWickets = gameStateRef.current.wickets;
      const isTournament = gameStateRef.current.config.isTournamentMatch;
      const currentStance = isTournament
        ? getBatterHandednessForWickets(currentWickets)
        : (gameStateRef.current.config.battingStance || 'RIGHT');
      const isRightHanded = currentStance === 'RIGHT';

      // Quick stance switch shortcut ('S' or 'H' when ball is not in flight) - disabled in World Cup matches
      if ((e.key.toLowerCase() === 's' || e.key.toLowerCase() === 'h') && !isBallInFlightRef.current) {
        if (!isTournament) {
          handleToggleBattingStance();
        }
        return;
      }

      // Quick shot mode toggle shortcut ('L' or 'D' or 'F' or 'M' when ball is not in flight)
      if ((e.key.toLowerCase() === 'l' || e.key.toLowerCase() === 'm' || e.key.toLowerCase() === 'f') && !isBallInFlightRef.current) {
        handleToggleShotMode();
        return;
      }

      // Direction keys (mapped intuitively to screen left / mid / right)
      if (e.code === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        setSelectedDirection(isRightHanded ? 'ON_SIDE' : 'OFF_SIDE');
      } else if (e.code === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        setSelectedDirection('STRAIGHT');
      } else if (e.code === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        setSelectedDirection(isRightHanded ? 'OFF_SIDE' : 'ON_SIDE');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwing, bowlNextBall, handleTogglePause, currentScreen, handleToggleBattingStance, handleToggleShotMode]);

  // Toggle audio sound and volume controls
  const handleToggleSound = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  const handleVolumeChange = (newVol: number) => {
    soundFx.setVolume(newVol);
    setSoundVolume(newVol);
    if (isMuted && newVol > 0) {
      soundFx.toggleMute();
      setIsMuted(false);
    }
  };

  const handleTestSound = () => {
    soundFx.testSound();
  };

  // Launch fresh match from Match Setup Menu or restart
  const handleStartMatchFromMenu = (config: MatchConfig) => {
    handleRestartMatch(config);
    setCurrentScreen('PLAYING');
  };

  // Open World Cup Tournament Hub or Setup Modal
  const handleOpenWorldCup = () => {
    soundFx.playUiClick();
    setCurrentTournamentContext('WORLD_CUP');
    if (activeTournament) {
      setCurrentScreen('WORLD_CUP_HUB');
    } else {
      setIsWorldCupSetupOpen(true);
    }
  };

  // Open Delete World Cup warning modal
  const handleDeleteWorldCup = () => {
    soundFx.playUiClick();
    setIsDeleteModalOpen(true);
  };

  // Perform reset: clear World Cup storage, reset active state, and open setup wizard
  const handleConfirmDeleteWorldCup = () => {
    setIsDeleteModalOpen(false);
    clearTournamentState();
    setActiveTournament(null);
    activeTournamentRef.current = null;
    setGameState(createInitialGameState(DEFAULT_MATCH_CONFIG));
    setCurrentScreen('HOME');
    setIsWorldCupSetupOpen(true);
  };

  // Open IPL Tournament Hub or Setup Modal
  const handleOpenIPL = () => {
    soundFx.playUiClick();
    setCurrentTournamentContext('IPL');
    if (activeIPL) {
      setCurrentScreen('WORLD_CUP_HUB');
    } else {
      setIsIPLSetupOpen(true);
    }
  };

  // Open Delete IPL warning modal
  const handleDeleteIPL = () => {
    soundFx.playUiClick();
    setIsDeleteIPLModalOpen(true);
  };

  // Perform reset: clear IPL storage, reset active state, and open IPL setup wizard
  const handleConfirmDeleteIPL = () => {
    setIsDeleteIPLModalOpen(false);
    clearIPLState();
    setActiveIPL(null);
    activeIPLRef.current = null;
    setGameState(createInitialGameState(DEFAULT_MATCH_CONFIG));
    setCurrentScreen('HOME');
    setIsIPLSetupOpen(true);
  };

  // Create new World Cup tournament from modal
  const handleCreateTournament = (
    tournamentOrTeamId: WorldCupTournamentState | string,
    initialConfigOrOvers?: MatchConfig | number,
    difficulty?: 'CASUAL' | 'PRO' | 'CHAMPION'
  ) => {
    let newTournament: WorldCupTournamentState;
    if (typeof tournamentOrTeamId === 'object' && tournamentOrTeamId !== null) {
      newTournament = tournamentOrTeamId;
    } else {
      const teamId: string = typeof tournamentOrTeamId === 'string' ? tournamentOrTeamId : 'ind';
      const overs = typeof initialConfigOrOvers === 'number' ? initialConfigOrOvers : 5;
      const diff = difficulty || 'PRO';
      newTournament = createNewTournament(teamId, overs, diff, 10);
    }
    setActiveTournament(newTournament);
    activeTournamentRef.current = newTournament;
    saveTournamentState(newTournament);
    setIsWorldCupSetupOpen(false);
    setCurrentTournamentContext('WORLD_CUP');
    setCurrentScreen('WORLD_CUP_HUB');
  };

  // Create new IPL tournament from modal
  const handleCreateIPL = (
    tournament: WorldCupTournamentState,
    _initialConfig: MatchConfig
  ) => {
    setActiveIPL(tournament);
    activeIPLRef.current = tournament;
    saveTournamentState(tournament);
    setIsIPLSetupOpen(false);
    setCurrentTournamentContext('IPL');
    setCurrentScreen('WORLD_CUP_HUB');
  };

  // Launch a World Cup or IPL match
  const handleLaunchTournamentMatch = (match: WorldCupMatch) => {
    const activeTourney = currentTournamentContext === 'IPL' ? activeIPLRef.current : activeTournamentRef.current;
    if (!activeTourney) return;

    const userTeam = getTeamById(activeTourney.userTeamId);
    const opponentTeamId = match.team1Id === activeTourney.userTeamId ? match.team2Id : match.team1Id;
    const opponentTeam = getTeamById(opponentTeamId);

    // Simulate opponent target score based on rating, difficulty, and tournament stage
    const opponentInnings = simulateOpponentInnings(
      opponentTeam,
      activeTourney.oversPerMatch,
      activeTourney.difficulty,
      match.stage || activeTourney.currentStage
    );
    const targetScore = opponentInnings.runs + 1;

    const matchConfig: MatchConfig = {
      totalOvers: activeTourney.oversPerMatch,
      totalWickets: 10, // 10 wickets by default for tournament editions
      target: targetScore,
      difficulty: activeTourney.difficulty,
      weatherCondition:
        match.weatherCondition ||
        (['SUNNY', 'OVERCAST', 'RAIN', 'NIGHT'][Math.floor(Math.random() * 4)] as WeatherCondition),
      playerTeamName: userTeam.name,
      opponentTeamName: opponentTeam.name,
      playerTeamId: userTeam.id,
      opponentTeamId: opponentTeam.id,
      isPracticeMode: false,
      isTournamentMatch: true,
      tournamentMatchId: match.id,
      tournamentStageLabel: match.roundLabel,
      opponentScore: opponentInnings,
      tournamentType: activeTourney.tournamentType || (currentTournamentContext === 'IPL' ? 'IPL' : 'WORLD_CUP'),
      editionName: activeTourney.title,
      stadiumName: match.venue || 'Wankhede Stadium, Mumbai',
    };

    handleRestartMatch(matchConfig);
    setCurrentScreen('PLAYING');
  };

  // Return to World Cup Hub after match or pause
  const handleReturnToWorldCupHub = () => {
    setIsPaused(false);
    isPausedRef.current = false;
    if (nextBallTimerRef.current) clearTimeout(nextBallTimerRef.current);
    if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    if (exitAnimFrameIdRef.current) cancelAnimationFrame(exitAnimFrameIdRef.current);

    deliverySeqRef.current += 1;
    setIsBowlerRunningUp(false);
    isBowlerRunningUpRef.current = false;
    setBowlerRunUpProgress(0);
    bowlerRunUpProgressRef.current = 0;
    setIsBallInFlight(false);
    isBallInFlightRef.current = false;
    currentDeliveryRef.current = null;
    setCurrentDelivery(null);
    setDeliveryProgress(0);
    setExitBallState(null);
    setBatterAnimation('IDLE');
    setShowHitFeedback(false);
    soundFx.updateBoundaryStreak(0, false);
    setCurrentScreen('WORLD_CUP_HUB');
  };

  // Return to HomePage title screen cleanly
  const handleReturnToHome = () => {
    setIsPaused(false);
    isPausedRef.current = false;
    if (nextBallTimerRef.current) clearTimeout(nextBallTimerRef.current);
    if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    if (exitAnimFrameIdRef.current) cancelAnimationFrame(exitAnimFrameIdRef.current);

    deliverySeqRef.current += 1;
    setIsBowlerRunningUp(false);
    isBowlerRunningUpRef.current = false;
    setBowlerRunUpProgress(0);
    bowlerRunUpProgressRef.current = 0;
    setIsBallInFlight(false);
    isBallInFlightRef.current = false;
    currentDeliveryRef.current = null;
    setCurrentDelivery(null);
    setDeliveryProgress(0);
    setExitBallState(null);
    setBatterAnimation('IDLE');
    setShowHitFeedback(false);
    soundFx.updateBoundaryStreak(0, false);
    setCurrentScreen('HOME');
  };

  // Restart match
  const handleRestartMatch = (config?: MatchConfig) => {
    setIsPaused(false);
    isPausedRef.current = false;
    if (nextBallTimerRef.current) clearTimeout(nextBallTimerRef.current);
    if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    if (exitAnimFrameIdRef.current) cancelAnimationFrame(exitAnimFrameIdRef.current);

    deliverySeqRef.current += 1;
    const newConfig = config || gameStateRef.current.config;

    // If starting or updating practice mode with a specific bowler, sync the active bowler attack
    if (newConfig.isPracticeMode && newConfig.practiceBowlerType) {
      setBowlerFilter(newConfig.practiceBowlerType);
      bowlerFilterRef.current = newConfig.practiceBowlerType;
    }

    const freshState = createInitialGameState(newConfig);

    setGameState(freshState);
    gameStateRef.current = freshState;
    setIsBowlerRunningUp(false);
    isBowlerRunningUpRef.current = false;
    setBowlerRunUpProgress(0);
    bowlerRunUpProgressRef.current = 0;
    setIsBallInFlight(false);
    isBallInFlightRef.current = false;
    currentDeliveryRef.current = null;
    setCurrentDelivery(null);
    setDeliveryProgress(0);
    setExitBallState(null);
    setBatterAnimation('IDLE');
    setShowHitFeedback(false);
    soundFx.updateBoundaryStreak(0, false);
    soundFx.startAmbientStadium(newConfig.weatherCondition || 'SUNNY');
    setIsOverIntroOpen(true);
  };

  // Start Over callback for OverBowlerIntroOverlay
  const handleStartOver = useCallback(() => {
    setIsOverIntroOpen(false);
    bowlNextBall();
  }, [bowlNextBall]);

  // If route is invalid, render designed 404 page in the game's style
  const isValidRoute = ['/', '/play', '/world-cup', '/ipl'].includes(currentPath);
  if (!isValidRoute) {
    return (
      <div className="h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans p-6 select-none">
        <div className="max-w-md text-center">
          <div className="text-amber-500 text-7xl font-bold mb-4 font-display uppercase tracking-wider">404</div>
          <h2 className="text-2xl font-bold mb-3 font-display uppercase tracking-wide text-slate-200 font-cricket-display">Innings Terminated</h2>
          <p className="text-slate-400 mb-8 leading-relaxed text-sm">
            You've wandered into a vacant stadium. This route does not exist. Let's return to the main pitch.
          </p>
          <button
            onClick={() => {
              soundFx.playUiClick();
              navigate('/');
              setCurrentScreen('HOME');
            }}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:translate-y-0.5 text-slate-950 font-bold rounded-lg transition-all font-display uppercase tracking-wider text-sm shadow-lg shadow-amber-500/10 cursor-pointer animate-[bounce_2s_infinite]"
          >
            Go to Main Menu
          </button>
        </div>
      </div>
    );
  }

  // 0. INITIAL GATE: Force Login / Registration / Guest Screen first
  if (!currentUser && !hasChosenAuthOption) {
    return (
      <AuthScreen
        onAuthenticated={(user) => {
          setCurrentUser(user);
          setHasChosenAuthOption(true);
          sessionStorage.setItem('crickfrenzy_auth_choice_made', 'true');
        }}
        onContinueAsGuest={handleSelectGuest}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
      />
    );
  }

  // 1. HOME SCREEN: Vibrant Crick Frenzy arcade title screen
  if (currentScreen === 'HOME') {
    const userTeam = activeTournament ? getTeamById(activeTournament.userTeamId) : null;
    const stageName = activeTournament
      ? activeTournament.currentStage === 'GROUP_STAGE'
        ? `Group Stage`
        : activeTournament.currentStage === 'QUARTER_FINALS'
        ? 'Quarter-Finals'
        : activeTournament.currentStage === 'SEMI_FINALS'
        ? 'Semi-Finals'
        : activeTournament.currentStage === 'FINALS'
        ? 'Grand Final'
        : activeTournament.currentStage === 'CHAMPION'
        ? 'World Champions 🏆'
        : 'Completed'
      : undefined;

    const iplTeam = activeIPL ? getTeamById(activeIPL.userTeamId) : null;
    const iplStageName = activeIPL
      ? activeIPL.currentStage === 'GROUP_STAGE'
        ? 'League Matches'
        : activeIPL.currentStage === 'QUARTER_FINALS'
        ? 'Playoffs'
        : activeIPL.currentStage === 'SEMI_FINALS'
        ? 'Qualifier 2'
        : activeIPL.currentStage === 'FINALS'
        ? 'Grand Final'
        : activeIPL.currentStage === 'CHAMPION'
        ? 'ICL Champions 🏆'
        : 'Completed'
      : undefined;

    return (
      <div className="h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
        <HomePage
          onStart={() => {
            setSetupInitialMode('MATCH');
            setCurrentScreen('MATCH_SETUP');
          }}
          onStartPractice={() => {
            setSetupInitialMode('PRACTICE');
            setCurrentScreen('MATCH_SETUP');
          }}
          onOpenWorldCup={handleOpenWorldCup}
          onDeleteWorldCup={handleDeleteWorldCup}
          onOpenIPL={handleOpenIPL}
          onDeleteIPL={handleDeleteIPL}
          onOpenSettings={() => setIsSettingsOpen(true)}
          hasActiveWorldCup={!!activeTournament}
          worldCupTeamName={userTeam ? `${userTeam.flag} ${userTeam.name}` : undefined}
          worldCupStageName={stageName}
          hasActiveIPL={!!activeIPL}
          iplTeamName={iplTeam ? `${iplTeam.flag} ${iplTeam.shortName}` : undefined}
          iplStageName={iplStageName}
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenStats={() => setIsStatsOpen(true)}
          hasChosenAuthOption={hasChosenAuthOption}
        />

        {/* World Cup Setup Modal */}
        <WorldCupSetupModal
          isOpen={isWorldCupSetupOpen}
          onClose={() => setIsWorldCupSetupOpen(false)}
          onStartTournament={handleCreateTournament}
        />

        {/* IPL Setup Modal */}
        <IPLSetupModal
          isOpen={isIPLSetupOpen}
          onClose={() => setIsIPLSetupOpen(false)}
          onStartTournament={handleCreateIPL}
        />

        {/* Delete World Cup Warning Modal */}
        <DeleteWorldCupModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirmDelete={handleConfirmDeleteWorldCup}
          title="Delete World Cup Edition?"
          itemLabel="World Cup"
        />

        {/* Delete IPL Warning Modal */}
        <DeleteWorldCupModal
          isOpen={isDeleteIPLModalOpen}
          onClose={() => setIsDeleteIPLModalOpen(false)}
          onConfirmDelete={handleConfirmDeleteIPL}
          title="Delete Indian Cricket League Season?"
          itemLabel="Indian Cricket League Season"
        />

        <MatchSettingsModal
          currentConfig={gameState.config}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onApplyConfig={(cfg) => {
            handleRestartMatch(cfg);
            setCurrentScreen('PLAYING');
          }}
        />

        {/* User Auth & Profile Modal */}
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          currentUser={currentUser}
          onOpenStats={() => setIsStatsOpen(true)}
          onSelectGuest={handleSelectGuest}
          isInitialGate={!hasChosenAuthOption}
        />

        {/* Player Stats & Records Modal */}
        <PlayerStatsModal
          isOpen={isStatsOpen}
          onClose={() => setIsStatsOpen(false)}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      </div>
    );
  }

  // 2. WORLD CUP & IPL DASHBOARD HUB: Points tables, fixtures, knockout bracket
  const activeTourney = currentTournamentContext === 'IPL' ? activeIPL : activeTournament;
  if (currentScreen === 'WORLD_CUP_HUB' && activeTourney) {
    return (
      <div className="h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
        <WorldCupHub
          tournament={activeTourney}
          onUpdateTournament={(updated) => {
            if (currentTournamentContext === 'IPL') {
              setActiveIPL(updated);
              activeIPLRef.current = updated;
            } else {
              setActiveTournament(updated);
              activeTournamentRef.current = updated;
            }
          }}
          onPlayMatch={handleLaunchTournamentMatch}
          onBackToHome={() => setCurrentScreen('HOME')}
          onResetTournament={currentTournamentContext === 'IPL' ? handleDeleteIPL : handleDeleteWorldCup}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />

        {/* World Cup Setup Modal to start new tournament */}
        <WorldCupSetupModal
          isOpen={isWorldCupSetupOpen}
          onClose={() => setIsWorldCupSetupOpen(false)}
          onStartTournament={handleCreateTournament}
        />

        {/* IPL Setup Modal */}
        <IPLSetupModal
          isOpen={isIPLSetupOpen}
          onClose={() => setIsIPLSetupOpen(false)}
          onStartTournament={handleCreateIPL}
        />

        {/* Delete World Cup Warning Modal */}
        <DeleteWorldCupModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirmDelete={handleConfirmDeleteWorldCup}
          title="Delete World Cup Edition?"
          itemLabel="World Cup"
        />

        {/* Delete IPL Warning Modal */}
        <DeleteWorldCupModal
          isOpen={isDeleteIPLModalOpen}
          onClose={() => setIsDeleteIPLModalOpen(false)}
          onConfirmDelete={handleConfirmDeleteIPL}
          title="Delete Indian Cricket League Season?"
          itemLabel="Indian Cricket League Season"
        />

        {/* Tournament Champion Modal */}
        <WorldCupChampionModal
          isOpen={isWorldCupChampionOpen}
          tournament={activeTourney}
          onReturnToHub={() => setIsWorldCupChampionOpen(false)}
          onReturnHome={() => {
            setIsWorldCupChampionOpen(false);
            setCurrentScreen('HOME');
          }}
        />

        {/* User Auth & Profile Modal */}
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          currentUser={currentUser}
          onOpenStats={() => setIsStatsOpen(true)}
          onSelectGuest={handleSelectGuest}
          isInitialGate={!hasChosenAuthOption}
        />

        {/* Player Stats & Records Modal */}
        <PlayerStatsModal
          isOpen={isStatsOpen}
          onClose={() => setIsStatsOpen(false)}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      </div>
    );
  }

  // 3. MATCH SETUP MENU: Format, Wickets, Chase Mode & Difficulty selection
  if (currentScreen === 'MATCH_SETUP') {
    return (
      <div className="h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
        <MatchSetupMenu
          currentConfig={gameState.config}
          initialMode={setupInitialMode}
          onStartMatch={handleStartMatchFromMenu}
          onBackToHome={() => setCurrentScreen('HOME')}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenStats={() => setIsStatsOpen(true)}
        />

        {/* User Auth & Profile Modal */}
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          currentUser={currentUser}
          onOpenStats={() => setIsStatsOpen(true)}
        />

        {/* Player Stats & Records Modal */}
        <PlayerStatsModal
          isOpen={isStatsOpen}
          onClose={() => setIsStatsOpen(false)}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      </div>
    );
  }

  // Render Mobile Landscape Dedicated Dual-Thumb Console
  if (isLandscape) {
    return (
      <div className="h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden touch-manipulation">
        {/* 1. Ultra-Compact Mobile Landscape Top Bar */}
        <Scoreboard
          state={gameState}
          fieldingSetup={activeFieldingSetup}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleSound={handleToggleSound}
          isMuted={isMuted}
          volume={soundVolume}
          onVolumeChange={handleVolumeChange}
          onTestSound={handleTestSound}
          onOpenTests={() => setIsTestsOpen(true)}
          onReturnHome={handleReturnToHome}
          compact={true}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          bowlerFilter={bowlerFilter}
          onSelectBowlerFilter={setBowlerFilter}
          onOpenStats={() => setIsStatsOpen(true)}
        />

        {/* 2. Extended Full-Width Landscape Console Arena */}
        <main className="flex-1 min-h-0 w-full flex flex-col items-stretch gap-1.5 px-1.5 sm:px-3 py-1 safe-p-landscape overflow-hidden">
          {/* Landscape Arena Row: Stadium Pitch Visualizer + Right-Hand Controls */}
          <div className="flex-1 min-h-0 w-full flex flex-row items-stretch gap-2 overflow-hidden">
            {/* Extended Pitch Stadium Visualizer - fills full width up to right controls */}
            <div className="flex-1 h-full min-h-0 flex items-center justify-center relative overflow-hidden">
              <PitchCanvas
                currentDelivery={currentDelivery}
                progress={deliveryProgress}
                isBallInFlight={isBallInFlight}
                selectedDirection={selectedDirection}
                lastOutcome={gameState.lastShotOutcome}
                batterAnimationState={batterAnimation}
                showHitFeedback={showHitFeedback}
                exitBallState={exitBallState}
                onSwing={handleSwing}
                onBowl={bowlNextBall}
                onSelectDirection={setSelectedDirection}
                isPaused={isPaused}
                onTogglePause={handleTogglePause}
                isPracticeMode={gameState.config.isPracticeMode}
                compact={true}
                isRunUpActive={isBowlerRunningUp}
                bowlerRunUpProgress={bowlerRunUpProgress}
                gameState={gameState}
                fieldingSetup={activeFieldingSetup}
                battingStance={gameState.config.battingStance}
                battingShotMode={battingShotMode}
                onToggleStance={handleToggleBattingStance}
                onToggleShotMode={handleToggleShotMode}
                className="w-full h-full rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-2xl select-none cursor-pointer focus:outline-none"
              />
            </div>

            {/* Right Thumb Pad: Timing gauge + Big Swing/Bowl Button */}
            <MobileLandscapeRightControls
              onSwing={handleSwing}
              canSwing={isBallInFlight}
              isBallInFlight={isBallInFlight}
              isInningsOver={gameState.isInningsOver}
              onBowl={bowlNextBall}
              autoBowl={autoBowl}
              onToggleAutoBowl={() => setAutoBowl(!autoBowl)}
            >
              <RightTimingMeter
                progress={deliveryProgress}
                isBallInFlight={isBallInFlight}
                timingConfig={activeTimingConfig}
                lastOutcome={gameState.lastShotOutcome}
                selectedDirection={selectedDirection}
                speedKmh={currentDelivery?.speedKmh}
                onSwing={handleSwing}
                onBowl={bowlNextBall}
                compact={true}
                className="w-14 sm:w-16 h-full bg-slate-900/95 rounded-2xl border border-slate-800 shadow-2xl p-1 sm:p-1.5 flex flex-col justify-between items-center select-none"
              />
            </MobileLandscapeRightControls>
          </div>
        </main>

        {/* Modals */}
        <PauseModal
          isOpen={isPaused && currentScreen === 'PLAYING'}
          state={gameState}
          isMuted={isMuted}
          onResume={handleTogglePause}
          onRestart={() => {
            setIsPaused(false);
            handleRestartMatch();
          }}
          onOpenSettings={() => {
            setIsPaused(false);
            setCurrentScreen('MATCH_SETUP');
          }}
          onToggleSound={handleToggleSound}
          onReturnHome={() => {
            setIsPaused(false);
            handleReturnToHome();
          }}
        />

        {gameState.isInningsOver && (
          <InningsSummaryModal
            state={gameState}
            onPlayAgain={() => handleRestartMatch()}
            onOpenSettings={() => setCurrentScreen('MATCH_SETUP')}
            onReturnHome={handleReturnToHome}
            onContinueTournament={gameState.config.isTournamentMatch ? handleReturnToWorldCupHub : undefined}
          />
        )}

        <MatchSettingsModal
          currentConfig={gameState.config}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onApplyConfig={(cfg) => handleRestartMatch(cfg)}
        />

        <EngineTestRunnerModal
          isOpen={isTestsOpen}
          onClose={() => setIsTestsOpen(false)}
        />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          currentUser={currentUser}
          onOpenStats={() => setIsStatsOpen(true)}
        />

        <PlayerStatsModal
          isOpen={isStatsOpen}
          onClose={() => setIsStatsOpen(false)}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        {/* 7. Over Bowler & Fielding Setup Introduction Overlay */}
        <OverBowlerIntroOverlay
          isOpen={isOverIntroOpen && currentScreen === 'PLAYING' && !gameState.isInningsOver}
          overNumber={gameState.currentOver + 1}
          totalOvers={gameState.config.totalOvers}
          bowler={activeBowlerProfile}
          fieldingSetup={activeFieldingSetup}
          gameState={gameState}
          onStartOver={handleStartOver}
        />
      </div>
    );
  }

  // Standard Desktop / Portrait Layout
  return (
    <div
      id="main-app-container"
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none relative scroll-smooth"
      style={{ scrollBehavior: 'smooth' }}
    >
      {/* 1. Scoreboard & Match Bar */}
      <Scoreboard
        state={gameState}
        fieldingSetup={activeFieldingSetup}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleSound={handleToggleSound}
        isMuted={isMuted}
        volume={soundVolume}
        onVolumeChange={handleVolumeChange}
        onTestSound={handleTestSound}
        onOpenTests={() => setIsTestsOpen(true)}
        onReturnHome={handleReturnToHome}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        bowlerFilter={bowlerFilter}
        onSelectBowlerFilter={setBowlerFilter}
        onOpenStats={() => setIsStatsOpen(true)}
      />

      {/* 2. Main Game Arena (Expanded for full-screen stadium experience) */}
      <main className="flex-1 max-w-[1800px] 2xl:max-w-[1920px] w-full mx-auto px-2 sm:px-6 py-2 flex flex-col items-center justify-between gap-3">
        
        {/* Pitch Arena + Right-Side Timing Meter */}
        <div className="w-full flex flex-row items-stretch gap-2.5">
          
          {/* Visual Stick Cricket Stadium Canvas */}
          <div className="flex-1 relative min-w-0 rounded-3xl transition-all">
            <PitchCanvas
              currentDelivery={currentDelivery}
              progress={deliveryProgress}
              isBallInFlight={isBallInFlight}
              selectedDirection={selectedDirection}
              lastOutcome={gameState.lastShotOutcome}
              batterAnimationState={batterAnimation}
              showHitFeedback={showHitFeedback}
              exitBallState={exitBallState}
              onSwing={handleSwing}
              onBowl={bowlNextBall}
              onSelectDirection={setSelectedDirection}
              isPaused={isPaused}
              onTogglePause={handleTogglePause}
              isPracticeMode={gameState.config.isPracticeMode}
              isRunUpActive={isBowlerRunningUp}
              bowlerRunUpProgress={bowlerRunUpProgress}
              gameState={gameState}
              fieldingSetup={activeFieldingSetup}
              battingStance={activeBattingStance}
              battingShotMode={battingShotMode}
              onToggleStance={handleToggleBattingStance}
              onToggleShotMode={handleToggleShotMode}
            />
          </div>

          {/* Right-Side Vertical Timing Gauge */}
          <div className="flex flex-col justify-center flex-shrink-0">
            <RightTimingMeter
              progress={deliveryProgress}
              isBallInFlight={isBallInFlight}
              timingConfig={activeTimingConfig}
              lastOutcome={gameState.lastShotOutcome}
              selectedDirection={selectedDirection}
              speedKmh={currentDelivery?.speedKmh}
              onSwing={handleSwing}
              onBowl={bowlNextBall}
            />
          </div>

        </div>

        {/* Precision Horizontal Timing Meter */}
        <div className="w-full">
          <TimingMeter
            progress={deliveryProgress}
            isBallInFlight={isBallInFlight}
            timingConfig={activeTimingConfig}
            lastOutcome={gameState.lastShotOutcome}
            selectedDirection={selectedDirection}
            onSwing={handleSwing}
            canSwing={isBallInFlight}
            onBowl={bowlNextBall}
          />
        </div>

        {/* Directional Controls & Swing Trigger */}
        <div className="w-full">
          <ControlsPanel
            selectedDirection={selectedDirection}
            onSelectDirection={setSelectedDirection}
            onSwing={handleSwing}
            canSwing={isBallInFlight}
            onNextBall={bowlNextBall}
            isBallInFlight={isBallInFlight}
            isInningsOver={gameState.isInningsOver}
            autoBowl={autoBowl}
            onToggleAutoBowl={() => setAutoBowl(!autoBowl)}
            bowlerFilter={bowlerFilter}
            onSelectBowlerFilter={setBowlerFilter}
            battingStance={activeBattingStance}
            onToggleStance={handleToggleBattingStance}
            isTournamentMatch={gameState.config.isTournamentMatch}
          />
        </div>

      </main>

      {/* 3. Pause Modal */}
      <PauseModal
        isOpen={isPaused && currentScreen === 'PLAYING'}
        state={gameState}
        isMuted={isMuted}
        onResume={handleTogglePause}
        onRestart={() => {
          setIsPaused(false);
          handleRestartMatch();
        }}
        onOpenSettings={() => {
          setIsPaused(false);
          setCurrentScreen('MATCH_SETUP');
        }}
        onToggleSound={handleToggleSound}
        onReturnHome={() => {
          setIsPaused(false);
          handleReturnToHome();
        }}
      />

      {/* 4. Innings / Match Summary Modal */}
      {gameState.isInningsOver && (
        <InningsSummaryModal
          state={gameState}
          onPlayAgain={() => handleRestartMatch()}
          onOpenSettings={() => setCurrentScreen('MATCH_SETUP')}
          onReturnHome={handleReturnToHome}
          onContinueTournament={gameState.config.isTournamentMatch ? handleReturnToWorldCupHub : undefined}
        />
      )}

      {/* 4. Match Settings Modal */}
      <MatchSettingsModal
        currentConfig={gameState.config}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onApplyConfig={(cfg) => handleRestartMatch(cfg)}
      />

      {/* 5. In-App Engine Test Runner Modal */}
      <EngineTestRunnerModal
        isOpen={isTestsOpen}
        onClose={() => setIsTestsOpen(false)}
      />

      {/* Auth Modal & Player Stats Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onOpenStats={() => setIsStatsOpen(true)}
        onSelectGuest={handleSelectGuest}
        isInitialGate={!hasChosenAuthOption}
      />

      <PlayerStatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* 6. Delete World Cup Warning Modal */}
      <DeleteWorldCupModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={handleConfirmDeleteWorldCup}
      />

      {/* 7. Over Bowler & Fielding Setup Introduction Overlay */}
      <OverBowlerIntroOverlay
        isOpen={isOverIntroOpen && currentScreen === 'PLAYING' && !gameState.isInningsOver}
        overNumber={gameState.currentOver + 1}
        totalOvers={gameState.config.totalOvers}
        bowler={activeBowlerProfile}
        fieldingSetup={activeFieldingSetup}
        gameState={gameState}
        onStartOver={handleStartOver}
      />

    </div>
  );
}
