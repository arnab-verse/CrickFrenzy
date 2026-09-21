import React, { useState, useMemo } from 'react';
import {
  Trophy,
  BarChart3,
  Star,
  MapPin,
  ChevronRight,
  Clock,
  ClipboardList,
  Check,
  Play,
  Activity,
  Home,
  Calendar,
  GitFork,
  Users,
  Trash2,
  Zap,
  X,
} from 'lucide-react';
import { MatchConfig } from '../types';
import { getTeamById, getTeamSquad, HOST_COUNTRIES, WORLD_CUP_TEAMS } from '../tournament/teamsData';
import {
  clearTournamentState,
  getNextUserMatch,
  sortStandings,
} from '../tournament/tournamentEngine';
import {
  CricketTeam,
  TeamStanding,
  TournamentMatch,
  WorldCupTournamentState,
} from '../tournament/types';
import { soundFx } from '../utils/audio';
import { KnockoutBracketView } from './KnockoutBracketView';
import { TeamBadge } from './TeamBadge';
import { convertTournamentToBracketMatches } from '../tournament/bracketAdapter';

interface WorldCupHubProps {
  tournament: WorldCupTournamentState;
  onPlayMatch: (match: TournamentMatch, config: MatchConfig) => void;
  onReturnToHome?: () => void;
  onBackToHome?: () => void;
  onResetTournament: () => void;
  onUpdateTournament?: (updated: WorldCupTournamentState) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const WorldCupHub: React.FC<WorldCupHubProps> = ({
  tournament,
  onPlayMatch,
  onReturnToHome,
  onBackToHome,
  onResetTournament,
  onUpdateTournament,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const handleHomeClick = onReturnToHome || onBackToHome || (() => {});
  const [activeTab, setActiveTab] = useState<'FIXTURES' | 'POINTS' | 'BRACKET' | 'STATS'>('FIXTURES');
  const [selectedGroupTab, setSelectedGroupTab] = useState<'A' | 'B'>('A');
  const [fixturesFilter, setFixturesFilter] = useState<'ALL' | 'MY_TEAM' | 'GROUP_A' | 'GROUP_B' | 'KNOCKOUTS'>('MY_TEAM');
  const [viewSquadTeamId, setViewSquadTeamId] = useState<string>(tournament.userTeamId);
  const [bracketViewMode, setBracketViewMode] = useState<'FORK_TABLE' | 'VISUAL_TREE'>('VISUAL_TREE');

  const isIPL = tournament.tournamentType === 'IPL';
  const hubTitle = isIPL
    ? (tournament.title || 'Indian Cricket League Hub')
    : (tournament.title || 'World Cup Tournament Hub');
  const knockoutHeading = isIPL ? 'ICL Playoffs & Grand Final' : 'ICC World Cup Knockout Stage';
  const campaignStatsHeading = isIPL ? 'Your ICL Campaign Statistics' : 'Your World Cup Campaign Statistics';
  const grandFinalLabel = isIPL ? 'ICL Grand Final' : 'World Cup Grand Final';
  const championsLabel = isIPL ? 'ICL Champions' : 'World Champions';
  const hostCountry = useMemo(() => {
    return (
      HOST_COUNTRIES.find((h) => h.id === tournament.hostCountryId) ||
      HOST_COUNTRIES[0]
    );
  }, [tournament.hostCountryId]);
  const userTeam = useMemo(() => getTeamById(tournament.userTeamId), [tournament.userTeamId]);
  const activeSquadTeam = useMemo(() => getTeamById(viewSquadTeamId), [viewSquadTeamId]);
  const activeSquadList = useMemo(() => getTeamSquad(viewSquadTeamId), [viewSquadTeamId]);
  const nextUserMatch = useMemo(() => getNextUserMatch(tournament), [tournament]);

  const isUserInGroupA = useMemo(
    () => tournament.groups.groupA.includes(tournament.userTeamId),
    [tournament.groups.groupA, tournament.userTeamId]
  );
  const userGroupLetter = isUserInGroupA ? 'A' : 'B';

  const sortedGroupA = useMemo(() => sortStandings(tournament.standings.groupA), [tournament.standings.groupA]);
  const sortedGroupB = useMemo(() => sortStandings(tournament.standings.groupB), [tournament.standings.groupB]);

  const userGroupStandings = isIPL ? sortedGroupA : isUserInGroupA ? sortedGroupA : sortedGroupB;
  const userRank = userGroupStandings.findIndex((s) => s.teamId === userTeam.id) + 1;

  const forkRows = useMemo(() => {
    const qfs = tournament.knockouts.quarterFinals || [];
    const sfs = tournament.knockouts.semiFinals || [];
    const finalMatch = tournament.knockouts.finalMatch || null;

    if (isIPL) {
      return [
        {
          forkId: 'QF-1',
          forkCode: 'PLAYOFF 1',
          stageName: 'ICL Playoff 1 (Rank 1 vs 4)',
          seedFormula: 'League Rank #1 vs League Rank #4',
          team1Placeholder: 'League Leader (#1)',
          team2Placeholder: '4th Place Team (#4)',
          targetFork: '➔ Semi Final 1 (Slot A)',
          matchData: qfs[0] || null,
          defaultVenue: hostCountry.venues[0 % hostCountry.venues.length],
        },
        {
          forkId: 'QF-2',
          forkCode: 'PLAYOFF 2',
          stageName: 'ICL Playoff 2 (Rank 2 vs 3)',
          seedFormula: 'League Rank #2 vs League Rank #3',
          team1Placeholder: 'Runner-Up (#2)',
          team2Placeholder: '3rd Place Team (#3)',
          targetFork: '➔ Semi Final 1 (Slot B)',
          matchData: qfs[1] || null,
          defaultVenue: hostCountry.venues[1 % hostCountry.venues.length],
        },
        {
          forkId: 'QF-3',
          forkCode: 'PLAYOFF 3',
          stageName: 'ICL Playoff 3 (Rank 1 vs 3)',
          seedFormula: 'League Rank #1 vs League Rank #3',
          team1Placeholder: 'Rank #1 Team',
          team2Placeholder: 'Rank #3 Team',
          targetFork: '➔ Semi Final 2 (Slot A)',
          matchData: qfs[2] || null,
          defaultVenue: hostCountry.venues[2 % hostCountry.venues.length],
        },
        {
          forkId: 'QF-4',
          forkCode: 'PLAYOFF 4',
          stageName: 'ICL Playoff 4 (Rank 2 vs 4)',
          seedFormula: 'League Rank #2 vs League Rank #4',
          team1Placeholder: 'Rank #2 Team',
          team2Placeholder: 'Rank #4 Team',
          targetFork: '➔ Semi Final 2 (Slot B)',
          matchData: qfs[3] || null,
          defaultVenue: hostCountry.venues[3 % hostCountry.venues.length],
        },
        {
          forkId: 'SF-1',
          forkCode: 'SEMI 1',
          stageName: 'ICL Semi Final 1',
          seedFormula: 'Winner Playoff 1 vs Winner Playoff 2',
          team1Placeholder: 'Winner Playoff 1',
          team2Placeholder: 'Winner Playoff 2',
          targetFork: '➔ GRAND FINAL (Slot A)',
          matchData: sfs[0] || null,
          defaultVenue: hostCountry.venues[4 % hostCountry.venues.length],
        },
        {
          forkId: 'SF-2',
          forkCode: 'SEMI 2',
          stageName: 'ICL Semi Final 2',
          seedFormula: 'Winner Playoff 3 vs Winner Playoff 4',
          team1Placeholder: 'Winner Playoff 3',
          team2Placeholder: 'Winner Playoff 4',
          targetFork: '➔ GRAND FINAL (Slot B)',
          matchData: sfs[1] || null,
          defaultVenue: hostCountry.venues[0],
        },
        {
          forkId: 'FINAL',
          forkCode: 'GRAND FINAL',
          stageName: 'ICL GRAND FINAL',
          seedFormula: 'Winner Semi 1 vs Winner Semi 2',
          team1Placeholder: 'Winner Semi 1',
          team2Placeholder: 'Winner Semi 2',
          targetFork: 'ICL Champions',
          matchData: finalMatch,
          defaultVenue: 'Narendra Modi Stadium, Ahmedabad',
        },
      ];
    }

    return [
      {
        forkId: 'QF-1',
        forkCode: 'FORK QF-1',
        stageName: 'Quarter Final 1',
        seedFormula: 'Group A #1 vs Group B #4',
        team1Placeholder: 'Group A Winner (A1)',
        team2Placeholder: '4th Place Group B (B4)',
        targetFork: '➔ Fork SF-1 (Slot A)',
        matchData: qfs[0] || null,
        defaultVenue: hostCountry.venues[0 % hostCountry.venues.length],
      },
      {
        forkId: 'QF-2',
        forkCode: 'FORK QF-2',
        stageName: 'Quarter Final 2',
        seedFormula: 'Group B #2 vs Group A #3',
        team1Placeholder: 'Runner-Up Group B (B2)',
        team2Placeholder: '3rd Place Group A (A3)',
        targetFork: '➔ Fork SF-1 (Slot B)',
        matchData: qfs[1] || null,
        defaultVenue: hostCountry.venues[1 % hostCountry.venues.length],
      },
      {
        forkId: 'QF-3',
        forkCode: 'FORK QF-3',
        stageName: 'Quarter Final 3',
        seedFormula: 'Group A #2 vs Group B #3',
        team1Placeholder: 'Runner-Up Group A (A2)',
        team2Placeholder: '3rd Place Group B (B3)',
        targetFork: '➔ Fork SF-2 (Slot A)',
        matchData: qfs[2] || null,
        defaultVenue: hostCountry.venues[2 % hostCountry.venues.length],
      },
      {
        forkId: 'QF-4',
        forkCode: 'FORK QF-4',
        stageName: 'Quarter Final 4',
        seedFormula: 'Group B #1 vs Group A #4',
        team1Placeholder: 'Group B Winner (B1)',
        team2Placeholder: '4th Place Group A (A4)',
        targetFork: '➔ Fork SF-2 (Slot B)',
        matchData: qfs[3] || null,
        defaultVenue: hostCountry.venues[3 % hostCountry.venues.length],
      },
      {
        forkId: 'SF-1',
        forkCode: 'FORK SF-1',
        stageName: 'Semi Final 1',
        seedFormula: 'Winner Fork QF-1 vs Winner Fork QF-2',
        team1Placeholder: 'Winner Fork QF-1',
        team2Placeholder: 'Winner Fork QF-2',
        targetFork: '➔ Fork FINAL (Slot A)',
        matchData: sfs[0] || null,
        defaultVenue: hostCountry.venues[4 % hostCountry.venues.length],
      },
      {
        forkId: 'SF-2',
        forkCode: 'FORK SF-2',
        stageName: 'Semi Final 2',
        seedFormula: 'Winner Fork QF-3 vs Winner Fork QF-4',
        team1Placeholder: 'Winner Fork QF-3',
        team2Placeholder: 'Winner Fork QF-4',
        targetFork: '➔ Fork FINAL (Slot B)',
        matchData: sfs[1] || null,
        defaultVenue: hostCountry.venues[5 % hostCountry.venues.length],
      },
      {
        forkId: 'FINAL',
        forkCode: 'FORK FINAL',
        stageName: grandFinalLabel,
        seedFormula: 'Winner Fork SF-1 vs Winner Fork SF-2',
        team1Placeholder: 'Winner Fork SF-1',
        team2Placeholder: 'Winner Fork SF-2',
        targetFork: championsLabel,
        matchData: finalMatch,
        defaultVenue: hostCountry.venues[0],
      },
    ];
  }, [tournament.knockouts, hostCountry.venues, grandFinalLabel, championsLabel, isIPL]);

  const bracketMatches = useMemo(
    () => convertTournamentToBracketMatches(tournament),
    [tournament]
  );

  const handlePlayMatchById = (matchId: string) => {
    const allKnockouts = [
      ...(tournament.knockouts.quarterFinals || []),
      ...(tournament.knockouts.semiFinals || []),
      ...(tournament.knockouts.finalMatch ? [tournament.knockouts.finalMatch] : []),
    ];
    const found = allKnockouts.find((m) => m.id === matchId);
    if (found) {
      soundFx.playMatchStart();
      const isTeam1User = found.team1Id === tournament.userTeamId;
      const t1 = getTeamById(found.team1Id);
      const t2 = getTeamById(found.team2Id);
      const opp = isTeam1User ? t2 : t1;
      const config: MatchConfig = {
        totalOvers: tournament.oversPerMatch,
        totalWickets: 10,
        difficulty: tournament.difficulty,
        playerTeamName: userTeam.name,
        opponentTeamName: opp.name,
      };
      onPlayMatch(found, config);
    }
  };

  // Next match opponent details
  const opponentTeam: CricketTeam | null = useMemo(() => {
    if (!nextUserMatch) return null;
    const oppId = nextUserMatch.team1Id === userTeam.id ? nextUserMatch.team2Id : nextUserMatch.team1Id;
    return getTeamById(oppId);
  }, [nextUserMatch, userTeam.id]);

  const handleLaunchMatch = () => {
    if (!nextUserMatch || !opponentTeam) return;
    soundFx.playMatchStart();

    // Default 10 wickets as mandated
    const matchConfig: MatchConfig = {
      totalOvers: tournament.oversPerMatch,
      totalWickets: 10,
      difficulty: tournament.difficulty,
      playerTeamName: userTeam.name,
      opponentTeamName: opponentTeam.name,
    };

    onPlayMatch(nextUserMatch, matchConfig);
  };

  const handleResetConfirm = () => {
    soundFx.playUiClick();
    onResetTournament();
  };

  // Filter fixtures
  const filteredFixtures = useMemo(() => {
    const allMatches = [
      ...(tournament.fixtures || []),
      ...(tournament.knockouts?.quarterFinals || []),
      ...(tournament.knockouts?.semiFinals || []),
      ...(tournament.knockouts?.finalMatch ? [tournament.knockouts.finalMatch] : []),
    ];

    if (fixturesFilter === 'MY_TEAM') {
      const userMatches = allMatches.filter(
        (m) => m.isUserMatch || m.team1Id === tournament.userTeamId || m.team2Id === tournament.userTeamId
      );
      return userMatches.length > 0 ? userMatches : allMatches;
    }
    if (fixturesFilter === 'GROUP_A') {
      return allMatches.filter((m) => m.stage === 'GROUP_A');
    }
    if (fixturesFilter === 'GROUP_B') {
      return allMatches.filter((m) => m.stage === 'GROUP_B');
    }
    if (fixturesFilter === 'KNOCKOUTS') {
      return allMatches.filter((m) => m.stage === 'QUARTER_FINAL' || m.stage === 'SEMI_FINAL' || m.stage === 'FINAL');
    }
    return allMatches;
  }, [tournament, fixturesFilter]);

  return (
    <div className="h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      
      {/* 1. Header Bar: World Cup Hub Navigation */}
      <header className="relative z-10 w-full bg-slate-900/90 border-b border-slate-800/90 px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-lg shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={handleHomeClick}
            aria-label="Return to Title"
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Title Menu</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-black italic tracking-wide text-amber-400 font-['Teko',sans-serif] uppercase leading-none truncate">
                {hubTitle}
              </h1>
              <div className="hidden xs:flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">
                <span className="text-slate-300 font-semibold">
                  {typeof tournament.oversPerMatch === 'number' ? tournament.oversPerMatch : 5} Overs
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">10 Wickets</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">
                  {typeof tournament.difficulty === 'string' ? tournament.difficulty : 'PRO'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Current Stage Badge */}
          <div className="px-2.5 sm:px-3 py-1 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-300 text-[11px] sm:text-xs font-black uppercase flex items-center gap-1.5 shadow whitespace-nowrap">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {tournament.currentStage === 'GROUP_STAGE' && 'Group Stage'}
              {tournament.currentStage === 'QUARTER_FINALS' && 'Quarter Finals'}
              {tournament.currentStage === 'SEMI_FINALS' && 'Semi Finals'}
              {tournament.currentStage === 'FINALS' && 'Grand Final'}
              {tournament.currentStage === 'CHAMPION' && 'World Champions!'}
              {tournament.currentStage === 'ELIMINATED' && 'Knocked Out'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetConfirm}
            title="Delete this edition and start a new tournament"
            className="px-2.5 sm:px-3 py-1 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 hover:text-white border border-rose-700/80 text-xs font-bold transition-all active:scale-95 shrink-0 whitespace-nowrap cursor-pointer flex items-center gap-1.5 shadow"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-300" />
            <span>Delete Edition</span>
          </button>
        </div>
      </header>

      {/* 2. Top Banner: Active Next Match or Victory Crown */}
      <div className="w-full bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-slate-800/80 p-3 sm:p-4 shrink-0 shadow-inner">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 min-w-0">
          
          {/* User Team Card Banner */}
          <div className="flex items-center gap-3 w-full md:w-auto min-w-0 flex-1">
            <TeamBadge team={userTeam} size="xl" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base sm:text-lg font-black text-white truncate">
                  {userTeam.name}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30 shrink-0 whitespace-nowrap">
                  {isIPL ? 'League Table' : `Group ${userGroupLetter}`} • Rank #{userRank}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 flex-wrap">
                {userTeam.tagline ? (
                  <span className="text-slate-300 italic font-medium">"{userTeam.tagline}"</span>
                ) : (
                  <span>Rating: <strong className="text-amber-400 font-mono">{userTeam.rating}/100</strong></span>
                )}
                <span>•</span>
                <span>Rating: <strong className="text-amber-400 font-mono">{userTeam.rating} OVR</strong></span>
                {!isIPL && (
                  <>
                    <span>•</span>
                    <span>Host: <strong className="text-amber-300 font-bold">{hostCountry.name}</strong></span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Next Playable Match Callout or Knockout Message */}
          {nextUserMatch && opponentTeam ? (
            <div className="flex items-center justify-between gap-3 w-full md:w-auto bg-slate-900/90 border border-amber-500/50 p-2.5 sm:px-4 rounded-2xl shadow-xl min-w-0 shrink-0">
              <div className="text-left min-w-0 flex-1 pr-1">
                <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1 truncate">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span className="truncate">{nextUserMatch.roundLabel}</span>
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-slate-100 flex items-center gap-1.5 min-w-0 mt-0.5">
                  <TeamBadge team={userTeam} size="xs" />
                  <span className="truncate max-w-[90px] sm:max-w-[120px]">{userTeam.shortName || userTeam.name}</span>
                  <span className="text-amber-400 text-xs shrink-0 font-bold">VS</span>
                  <TeamBadge team={opponentTeam} size="xs" />
                  <span className="truncate max-w-[90px] sm:max-w-[120px]">{opponentTeam.shortName || opponentTeam.name}</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[180px] sm:max-w-xs flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>{nextUserMatch.venue}</span>
                </div>
              </div>

              <button
                id="world-cup-play-next-match-btn"
                type="button"
                onClick={handleLaunchMatch}
                className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-amber-500 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase border border-amber-200 shadow-lg shadow-amber-500/30 transform hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-1.5 font-['Teko',sans-serif] shrink-0 whitespace-nowrap cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>PLAY MATCH</span>
              </button>
            </div>
          ) : tournament.currentStage === 'CHAMPION' ? (
            <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-500/20 via-amber-500/30 to-yellow-500/20 border border-amber-400 p-3 rounded-2xl shrink-0">
              <span className="text-3xl animate-bounce shrink-0">🏆</span>
              <div className="min-w-0">
                <span className="text-sm font-black text-amber-300 uppercase block font-['Teko',sans-serif] text-base truncate">
                  {isIPL ? 'IPL CHAMPIONS!' : 'ICC WORLD CUP CHAMPIONS!'}
                </span>
                <span className="text-xs text-slate-200 truncate block">
                  {userTeam.name} have lifted the trophy!
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 shrink-0">
              Tournament Stage Concluded
            </div>
          )}

        </div>
      </div>

      {/* 3. Tab Bar (Points Table, Fixtures, Knockout Bracket, Stats) */}
      <div className="w-full bg-slate-900/70 border-b border-slate-800 px-4 py-2 shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 overflow-x-auto">
          
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              type="button"
              id="tab-fixtures-btn"
              onClick={() => {
                soundFx.playUiClick();
                setActiveTab('FIXTURES');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'FIXTURES'
                  ? 'bg-amber-500 text-slate-950 shadow font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Fixtures & Schedule</span>
            </button>

            <button
              type="button"
              id="tab-points-table-btn"
              onClick={() => {
                soundFx.playUiClick();
                setActiveTab('POINTS');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'POINTS'
                  ? 'bg-amber-500 text-slate-950 shadow font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{isIPL ? 'Points Table (10 Teams)' : 'Points Table (2 Groups)'}</span>
            </button>

            <button
              type="button"
              id="tab-knockout-bracket-btn"
              onClick={() => {
                soundFx.playUiClick();
                setActiveTab('BRACKET');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'BRACKET'
                  ? 'bg-amber-500 text-slate-950 shadow font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Knockout Bracket</span>
            </button>

            <button
              type="button"
              id="tab-stats-btn"
              onClick={() => {
                soundFx.playUiClick();
                setActiveTab('STATS');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'STATS'
                  ? 'bg-amber-500 text-slate-950 shadow font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Squad List & Stats</span>
            </button>
          </div>

          {/* Points Table Group A / B Sub-selector - Only for 2-group World Cup */}
          {activeTab === 'POINTS' && !isIPL && (
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setSelectedGroupTab('A')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  selectedGroupTab === 'A'
                    ? 'bg-slate-800 text-amber-400 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Group A (10 Teams)
              </button>
              <button
                type="button"
                onClick={() => setSelectedGroupTab('B')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  selectedGroupTab === 'B'
                    ? 'bg-slate-800 text-amber-400 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Group B (10 Teams)
              </button>
            </div>
          )}

        </div>
      </div>

      {/* 4. Tab Contents Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-4 overflow-y-auto scroll-snap-y-mandatory">
        
        {/* ========================================================================= */}
        {/* TAB 1: POINTS TABLE                                                      */}
        {/* ========================================================================= */}
        {activeTab === 'POINTS' && (
          <div className="space-y-4 scroll-snap-align-start">
            
            {/* Header Card / Group Selector */}
            {isIPL ? (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border border-amber-400/60 shadow-lg shadow-amber-500/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 font-black text-sm flex items-center justify-center border border-amber-500/40">
                    ICL
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span>INDIAN CRICKET LEAGUE STANDINGS</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                        10 TEAMS • 14 MATCHES
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Single Unified Table • Each team plays 14 matches • Top 4 advance to Playoffs
                    </p>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-mono font-bold text-amber-300">
                    Your Rank: #{userRank}
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playUiClick();
                    setSelectedGroupTab('A');
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    selectedGroupTab === 'A'
                      ? 'bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border-amber-400 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-extrabold text-xs flex items-center justify-center border border-amber-500/40">
                        A
                      </span>
                      <div>
                        <h3 className="text-sm font-black text-white flex items-center gap-2">
                          <span>SECTION A • GROUP A</span>
                          {isUserInGroupA && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                              YOUR GROUP
                            </span>
                          )}
                        </h3>
                        <p className="text-[11px] text-slate-400">10 Teams • Pool A Table</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedGroupTab === 'A' ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-slate-600'
                    }`}>
                      {selectedGroupTab === 'A' && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playUiClick();
                    setSelectedGroupTab('B');
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    selectedGroupTab === 'B'
                      ? 'bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border-amber-400 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 font-extrabold text-xs flex items-center justify-center border border-cyan-500/40">
                        B
                      </span>
                      <div>
                        <h3 className="text-sm font-black text-white flex items-center gap-2">
                          <span>SECTION B • GROUP B</span>
                          {!isUserInGroupA && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                              YOUR GROUP
                            </span>
                          )}
                        </h3>
                        <p className="text-[11px] text-slate-400">10 Teams • Pool B Table</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedGroupTab === 'B' ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-slate-600'
                    }`}>
                      {selectedGroupTab === 'B' && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Qualification Banner */}
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/50 inline-block" />
                <span>
                  <strong>Qualification Rule:</strong> {isIPL ? 'Top 4 teams in the standings advance directly to the ICL Playoffs & Final.' : `Top 4 teams from Group ${selectedGroupTab} advance directly to the Quarter Finals.`}
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono font-bold">
                {isIPL ? '10 Teams • 14 Matches Each' : `10 Teams in Group ${selectedGroupTab}`}
              </span>
            </div>

            {/* Standings Table Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-950/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-3 text-center w-12">Pos</th>
                      <th className="py-3 px-4">Team</th>
                      <th className="py-3 px-2 text-center">P</th>
                      <th className="py-3 px-2 text-center">W</th>
                      <th className="py-3 px-2 text-center">L</th>
                      <th className="py-3 px-2 text-center">T</th>
                      <th className="py-3 px-3 text-center font-bold text-amber-400">PTS</th>
                      <th className="py-3 px-3 text-center font-mono">NRR</th>
                      <th className="py-3 px-3 text-center hidden md:table-cell">Runs / Overs</th>
                      <th className="py-3 px-3 text-center">Last 5</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {(isIPL || selectedGroupTab === 'A' ? sortedGroupA : sortedGroupB).map((standing, index) => {
                      const isUserTeam = standing.teamId === userTeam.id;
                      const isTop4 = index < 4;

                      return (
                        <tr
                          key={standing.teamId}
                          className={`transition-colors ${
                            isUserTeam
                              ? 'bg-amber-500/15 font-bold hover:bg-amber-500/25'
                              : index % 2 === 0
                              ? 'bg-slate-900/40 hover:bg-slate-800/50'
                              : 'bg-slate-950/40 hover:bg-slate-800/50'
                          } ${index === 3 ? 'border-b-2 border-emerald-500/70' : ''}`}
                        >
                          {/* Position Rank */}
                          <td className="py-2.5 px-3 text-center font-black">
                            <span
                              className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs ${
                                isTop4
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {index + 1}
                            </span>
                          </td>

                          {/* Team Flag & Name */}
                          <td className="py-2.5 px-4 font-bold flex items-center gap-2.5">
                            <TeamBadge team={standing.team} size="sm" />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={isUserTeam ? 'text-amber-300 font-extrabold' : 'text-slate-100'}>
                                  {standing.team.name}
                                </span>
                                {isUserTeam && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 font-normal">
                                Rating: {standing.team.rating} • Tier {standing.team.tier}
                              </span>
                            </div>
                          </td>

                          {/* Played, Won, Lost, Tied, Points */}
                          <td className="py-2.5 px-2 text-center text-slate-300">{standing.played}</td>
                          <td className="py-2.5 px-2 text-center text-emerald-400 font-bold">{standing.won}</td>
                          <td className="py-2.5 px-2 text-center text-rose-400">{standing.lost}</td>
                          <td className="py-2.5 px-2 text-center text-slate-400">{standing.tied}</td>
                          
                          <td className="py-2.5 px-3 text-center font-black text-amber-400 text-sm">
                            {standing.points}
                          </td>

                          {/* Net Run Rate (NRR) */}
                          <td className="py-2.5 px-3 text-center font-mono text-xs">
                            <span
                              className={
                                standing.nrr > 0
                                  ? 'text-emerald-400 font-bold'
                                  : standing.nrr < 0
                                  ? 'text-rose-400'
                                  : 'text-slate-400'
                              }
                            >
                              {standing.nrr > 0 ? `+${standing.nrr.toFixed(3)}` : standing.nrr.toFixed(3)}
                            </span>
                          </td>

                          {/* Runs Scored vs Conceded */}
                          <td className="py-2.5 px-3 text-center text-[11px] text-slate-400 font-mono hidden md:table-cell">
                            {standing.runsScored}/{standing.oversFaced.toFixed(1)} ov
                          </td>

                          {/* Last 5 Form Badges */}
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {standing.form.length === 0 ? (
                                <span className="text-[10px] text-slate-500">-</span>
                              ) : (
                                standing.form.map((res, i) => (
                                  <span
                                    key={i}
                                    className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center ${
                                      res === 'W'
                                        ? 'bg-emerald-500 text-slate-950'
                                        : res === 'L'
                                        ? 'bg-rose-500 text-white'
                                        : 'bg-slate-600 text-white'
                                    }`}
                                  >
                                    {res}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: FIXTURES & MATCH RESULTS                                           */}
        {/* ========================================================================= */}
        {activeTab === 'FIXTURES' && (
          <div className="space-y-4">
            
            {/* Filter Bar */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {(isIPL
                  ? (['MY_TEAM', 'ALL', 'KNOCKOUTS'] as const)
                  : (['MY_TEAM', 'ALL', 'GROUP_A', 'GROUP_B', 'KNOCKOUTS'] as const)
                ).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFixturesFilter(f)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      fixturesFilter === f
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f === 'MY_TEAM' ? '⭐ My Matches' : f === 'ALL' ? 'All Matches' : f === 'GROUP_A' ? 'Group A' : f === 'GROUP_B' ? 'Group B' : isIPL ? 'Playoffs' : 'Knockouts'}
                  </button>
                ))}
              </div>

              <span className="text-xs text-slate-400 font-semibold">
                Showing {filteredFixtures.length} Matches
              </span>
            </div>

            {/* Fixtures List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredFixtures.map((match) => {
                const t1 = getTeamById(match.team1Id);
                const t2 = getTeamById(match.team2Id);
                const isCompleted = match.status === 'COMPLETED';
                const isThisUserMatch = match.isUserMatch || match.team1Id === tournament.userTeamId || match.team2Id === tournament.userTeamId;
                const isPlayableUserMatch = isThisUserMatch && !isCompleted && match.id === nextUserMatch?.id;

                return (
                  <div
                    key={match.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isPlayableUserMatch
                        ? 'bg-gradient-to-r from-amber-500/25 via-slate-900 to-slate-900 border-amber-400 shadow-xl ring-2 ring-amber-400/80 scale-[1.01]'
                        : isThisUserMatch
                        ? 'bg-slate-900/90 border-slate-700'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 mb-2 border-b border-slate-800/80 pb-1.5">
                      <span className="flex items-center gap-1.5 text-amber-400">
                        <span>🏏</span>
                        <span>{match.roundLabel}</span>
                        {isThisUserMatch && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-black">
                            YOUR MATCH
                          </span>
                        )}
                      </span>
                      <span className="text-slate-500 truncate max-w-[150px] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        <span>{match.venue}</span>
                      </span>
                    </div>

                    {/* Team 1 vs Team 2 Row */}
                    <div className="flex items-center justify-between gap-2 my-2">
                      {/* Team 1 */}
                      <div className="flex items-center gap-2 flex-1">
                        <TeamBadge team={t1} size="md" />
                        <div>
                          <div className="font-extrabold text-xs sm:text-sm text-slate-100 truncate">
                            {t1.name}
                          </div>
                          {isCompleted && match.team1Score && (
                            <div className="text-xs font-mono font-bold text-amber-400">
                              {match.team1Score.runs}/{match.team1Score.wickets}
                              <span className="text-[10px] text-slate-500 font-normal ml-1">
                                ({match.team1Score.overs} ov)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* VS / Status Pill */}
                      <div className="text-center px-2">
                        {isCompleted ? (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold uppercase">
                            FT
                          </span>
                        ) : (
                          <span className="text-xs font-black text-slate-500">VS</span>
                        )}
                      </div>

                      {/* Team 2 */}
                      <div className="flex items-center justify-end gap-2 flex-1 text-right">
                        <div>
                          <div className="font-extrabold text-xs sm:text-sm text-slate-100 truncate">
                            {t2.name}
                          </div>
                          {isCompleted && match.team2Score && (
                            <div className="text-xs font-mono font-bold text-amber-400">
                              {match.team2Score.runs}/{match.team2Score.wickets}
                              <span className="text-[10px] text-slate-500 font-normal ml-1">
                                ({match.team2Score.overs} ov)
                              </span>
                            </div>
                          )}
                        </div>
                        <TeamBadge team={t2} size="md" />
                      </div>
                    </div>

                    {/* Result Footer or Play Now Button */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      {isCompleted ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="font-bold text-emerald-400 text-[11px] truncate flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{match.resultSummary}</span>
                          </span>
                        </div>
                      ) : isPlayableUserMatch ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-amber-300 font-bold text-xs flex items-center gap-1">
                            <span className="animate-ping w-2 h-2 rounded-full bg-amber-400 inline-block" />
                            <span>NEXT MATCH READY</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playMatchStart();
                              const isTeam1User = match.team1Id === tournament.userTeamId;
                              const opp = isTeam1User ? t2 : t1;
                              const matchConfig: MatchConfig = {
                                totalOvers: tournament.oversPerMatch,
                                totalWickets: 10,
                                difficulty: tournament.difficulty,
                                playerTeamName: userTeam.name,
                                opponentTeamName: opp.name,
                              };
                              onPlayMatch(match, matchConfig);
                            }}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-amber-500 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black text-xs uppercase shadow-lg shadow-amber-500/30 transform hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer font-['Teko',sans-serif] tracking-wider text-sm"
                          >
                            <Play className="w-3.5 h-3.5 fill-slate-950" />
                            <span>PLAY MATCH</span>
                          </button>
                        </div>
                      ) : isThisUserMatch ? (
                        <span className="text-amber-400/80 text-[11px] font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Your Match • Scheduled Next</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">
                          Scheduled • Upcoming AI Match
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: KNOCKOUT BRACKET (QUARTER FINALS, SEMIS & GRAND FINAL)             */}
        {/* ========================================================================= */}
        {activeTab === 'BRACKET' && (
          <div className="space-y-6">
              
              {/* Knockout Stage Banner Header */}
              <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
                  <Trophy className="w-32 h-32 text-amber-400" />
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-3.5 text-center sm:text-left">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-500/20 shrink-0">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black italic tracking-wide text-amber-300 font-['Teko',sans-serif] uppercase">
                        {knockoutHeading}
                      </h2>
                      <p className="text-xs text-slate-300">
                        Host Nation: <strong className="text-amber-400 font-bold">{hostCountry.name}</strong> • Single-elimination playoff tree!
                      </p>
                    </div>
                  </div>

                  {/* Tournament Progress Steps */}
                  <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-bold shrink-0">
                    <span className={`px-2 py-0.5 rounded-lg ${
                      tournament.stage === 'QUARTER_FINAL'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : tournament.knockouts.quarterFinals.some(q => q.status === 'COMPLETED')
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }`}>
                      1. Quarter Finals
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    <span className={`px-2 py-0.5 rounded-lg ${
                      tournament.stage === 'SEMI_FINAL'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : tournament.knockouts.semiFinals.some(s => s.status === 'COMPLETED')
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }`}>
                      2. Semi Finals
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    <span className={`px-2 py-0.5 rounded-lg ${
                      tournament.stage === 'FINAL'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : tournament.stage === 'COMPLETED'
                        ? 'text-amber-300'
                        : 'text-slate-400'
                    }`}>
                      3. Final
                    </span>
                  </div>
                </div>
              </div>

              {/* View Mode Switcher: Fork Distribution Table vs Visual Tree */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/90 p-2 rounded-2xl border border-slate-800 shadow-lg">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setBracketViewMode('FORK_TABLE')}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      bracketViewMode === 'FORK_TABLE'
                        ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                        : 'text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-900'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Fork Type Distribution Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBracketViewMode('VISUAL_TREE')}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      bracketViewMode === 'VISUAL_TREE'
                        ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                        : 'text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-900'
                    }`}
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Visual Bracket Tree</span>
                  </button>
                </div>
                <div className="text-[11px] text-amber-300/90 font-mono flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Host Venues:</span>
                  <span className="font-bold text-white">{hostCountry.name}</span>
                </div>
              </div>

              {/* VIEW 1: FORK DISTRIBUTION TABLE & PLACEHOLDERS */}
              {bracketViewMode === 'FORK_TABLE' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                      <span>Knockout Stage Fork Distribution Matrix</span>
                    </div>
                    <div className="text-[11px] text-slate-400 hidden sm:block">
                      All 7 Single-Elimination Matchup Slots & Qualification Rules
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl scrollbar-thin">
                    <table className="w-full text-left border-collapse min-w-[850px]">
                      <thead>
                        <tr className="bg-slate-950/90 text-[10px] font-black uppercase text-amber-400 tracking-wider border-b border-slate-800">
                          <th className="p-3.5">Fork</th>
                          <th className="p-3.5">Stage</th>
                          <th className="p-3.5">Seed / Origin Rule</th>
                          <th className="p-3.5">Team 1 Slot</th>
                          <th className="p-3.5 text-center">VS</th>
                          <th className="p-3.5">Team 2 Slot</th>
                          <th className="p-3.5">Advancement</th>
                          <th className="p-3.5">Allocated Venue</th>
                          <th className="p-3.5 text-right">Status / Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 text-xs font-medium">
                        {forkRows.map((fork) => {
                          const m = fork.matchData;
                          const t1 = m?.team1Id ? getTeamById(m.team1Id) : null;
                          const t2 = m?.team2Id ? getTeamById(m.team2Id) : null;
                          const isUserMatch = m?.isUserMatch || false;
                          const isPlayable = m && m.status === 'SCHEDULED' && isUserMatch;
                          const venue = m?.venue || fork.defaultVenue;
                          const isCompleted = m?.status === 'COMPLETED';

                          return (
                            <tr
                              key={fork.forkId}
                              className={`transition-colors hover:bg-slate-800/50 ${
                                isUserMatch ? 'bg-amber-500/10 border-l-4 border-l-amber-400' : ''
                              }`}
                            >
                              {/* Fork Code */}
                              <td className="p-3.5 font-mono font-black text-amber-400 whitespace-nowrap">
                                <span className="px-2 py-1 rounded-lg bg-slate-950 border border-amber-500/30 text-[10px]">
                                  {fork.forkCode}
                                </span>
                              </td>

                              {/* Stage Name */}
                              <td className="p-3.5 font-bold text-slate-200 whitespace-nowrap">
                                {fork.stageName}
                              </td>

                              {/* Seed / Origin Formula */}
                              <td className="p-3.5 font-mono text-[11px] text-amber-300/90 whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800">
                                  {fork.seedFormula}
                                </span>
                              </td>

                              {/* Team 1 */}
                              <td className="p-3.5 whitespace-nowrap">
                                {t1 ? (
                                  <div className="flex items-center gap-2 font-extrabold text-white">
                                    <TeamBadge team={t1} size="xs" />
                                    <span>{t1.name}</span>
                                    {m?.winnerTeamId === t1.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 text-slate-400 italic text-[11px]">
                                    <span className="px-1.5 py-0.5 rounded bg-slate-950 text-amber-400/80 font-mono text-[9px] not-italic border border-slate-800">
                                      TBD
                                    </span>
                                    <span>{fork.team1Placeholder}</span>
                                  </div>
                                )}
                              </td>

                              {/* VS */}
                              <td className="p-3.5 text-center font-black text-amber-400 text-[10px]">
                                VS
                              </td>

                              {/* Team 2 */}
                              <td className="p-3.5 whitespace-nowrap">
                                {t2 ? (
                                  <div className="flex items-center gap-2 font-extrabold text-white">
                                    <TeamBadge team={t2} size="xs" />
                                    <span>{t2.name}</span>
                                    {m?.winnerTeamId === t2.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 text-slate-400 italic text-[11px]">
                                    <span className="px-1.5 py-0.5 rounded bg-slate-950 text-amber-400/80 font-mono text-[9px] not-italic border border-slate-800">
                                      TBD
                                    </span>
                                    <span>{fork.team2Placeholder}</span>
                                  </div>
                                )}
                              </td>

                              {/* Advancement */}
                              <td className="p-3.5 font-semibold text-emerald-400 text-[11px] whitespace-nowrap">
                                {fork.targetFork}
                              </td>

                              {/* Allocated Venue */}
                              <td className="p-3.5 text-[11px] text-slate-300 whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-amber-400" />
                                  <span>{venue}</span>
                                </div>
                              </td>

                              {/* Status / Action */}
                              <td className="p-3.5 text-right whitespace-nowrap">
                                {isCompleted ? (
                                  <div className="space-y-0.5">
                                    <div className="text-[11px] font-bold text-emerald-400 flex items-center justify-end gap-1">
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>{m.resultSummary}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono">
                                      {m.team1Score?.runs}/{m.team1Score?.wickets} v {m.team2Score?.runs}/{m.team2Score?.wickets}
                                    </div>
                                  </div>
                                ) : isPlayable ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!m || !t1 || !t2) return;
                                      soundFx.playMatchStart();
                                      const isTeam1User = m.team1Id === tournament.userTeamId;
                                      const opp = isTeam1User ? t2 : t1;
                                      const matchConfig: MatchConfig = {
                                        totalOvers: tournament.oversPerMatch,
                                        totalWickets: 10,
                                        difficulty: tournament.difficulty,
                                        playerTeamName: userTeam.name,
                                        opponentTeamName: opp.name,
                                      };
                                      onPlayMatch(m, matchConfig);
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase shadow-md shadow-amber-500/20 transform hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-1 font-['Teko',sans-serif] tracking-wider cursor-pointer"
                                  >
                                    <span>▶ PLAY MATCH NOW</span>
                                  </button>
                                ) : m ? (
                                  <span className="text-[11px] text-amber-300/90 font-bold px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                                    Scheduled
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-slate-500 font-mono italic">
                                    Awaiting Group Stage
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VIEW 2: VISUAL BRACKET GRID (cards layout) */}
              {bracketViewMode === 'VISUAL_TREE' && (
                <div className="animate-fadeIn">
                  <KnockoutBracketView
                    matches={bracketMatches}
                    userTeamId={tournament.userTeamId}
                    onPlayMatch={handlePlayMatchById}
                  />
                </div>
              )}

              {tournament.championTeamId && (
                <div className="mt-4 p-4 bg-gradient-to-r from-yellow-500 via-amber-400 to-amber-500 text-slate-950 font-black rounded-2xl text-base uppercase tracking-wider shadow-xl text-center animate-bounce flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5 text-slate-950 fill-slate-950" />
                  <span>World Champions: {getTeamById(tournament.championTeamId).name}</span>
                </div>
              )}
            </div>
          )}

        {/* ========================================================================= */}
        {/* TAB 4: SQUAD LIST & TOURNAMENT STATS                                      */}
        {/* ========================================================================= */}
        {activeTab === 'STATS' && (
          <div className="space-y-4">
            
            {/* National Team Squad Selector & Profile */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <TeamBadge team={activeSquadTeam} size="xl" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-black text-white">{activeSquadTeam.name} Official Squad</h3>
                      {activeSquadTeam.id === userTeam.id && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/40">
                          YOUR TEAM
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{activeSquadTeam.description}</p>
                  </div>
                </div>

                {/* Team Switcher for Squad View */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 shrink-0">View Squad:</span>
                  <select
                    value={viewSquadTeamId}
                    onChange={(e) => {
                      soundFx.playUiClick();
                      setViewSquadTeamId(e.target.value);
                    }}
                    className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <optgroup label="Pool A Teams">
                      {WORLD_CUP_TEAMS.filter((t) => t.groupSeed === 'A').map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Pool B Teams">
                      {WORLD_CUP_TEAMS.filter((t) => t.groupSeed === 'B').map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Squad Overview Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-black tracking-wider">Team Rating</span>
                    <span className="text-base font-extrabold text-amber-400">{activeSquadTeam.rating} OVR</span>
                  </div>
                  <Star className="w-5 h-5 text-amber-400" />
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-black tracking-wider">Division / Tier</span>
                    <span className="text-base font-extrabold text-white">{activeSquadTeam.tier === 1 ? 'Tier 1 Elite' : activeSquadTeam.tier === 2 ? 'Tier 2 Contender' : 'Tier 3 Emerging'}</span>
                  </div>
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-black tracking-wider">Tournament Pool</span>
                    <span className="text-base font-extrabold text-cyan-400">{isIPL ? '10-Franchise League' : `Group ${activeSquadTeam.groupSeed}`}</span>
                  </div>
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                </div>
              </div>

              {/* Complete Official Player Roster List */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-slate-400" />
                    <span>15-Player Official Tournament Roster</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400 font-bold">
                    {activeSquadList.length} Players
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {activeSquadList.map((player, idx) => {
                    const roleColor =
                      player.role === 'BATSMAN'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : player.role === 'BOWLER'
                        ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                        : player.role === 'ALL_ROUNDER'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-purple-500/15 text-purple-300 border-purple-500/30';

                    const roleLabel =
                      player.role === 'BATSMAN'
                        ? 'Batter'
                        : player.role === 'BOWLER'
                        ? 'Bowler'
                        : player.role === 'ALL_ROUNDER'
                        ? 'All-Rounder'
                        : 'Wicket-Keeper';

                    return (
                      <div
                        key={player.id || idx}
                        className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/90 flex items-center justify-between gap-2 hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-100 text-xs truncate">
                                {player.name}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {player.battingStyle || player.bowlingStyle || 'National Specialist'}
                            </div>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${roleColor}`}>
                          {roleLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* User Tournament Performance Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">
                {campaignStatsHeading}
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Runs Scored</span>
                  <span className="text-2xl font-black text-amber-400">{tournament.tournamentStats.userRuns}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Fours Smashed</span>
                  <span className="text-2xl font-black text-yellow-300">{tournament.tournamentStats.userFours}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Sixes Cleared</span>
                  <span className="text-2xl font-black text-purple-400">{tournament.tournamentStats.userSixes}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Matches Played</span>
                  <span className="text-2xl font-black text-cyan-400">{tournament.tournamentStats.totalMatchesPlayed}</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};
