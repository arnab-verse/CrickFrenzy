import { WeatherCondition } from '../types';
import { auth, syncTournamentToFirestore } from '../lib/firebase';
import {
  CricketTeam,
  MatchStageType,
  TeamStanding,
  TournamentMatch,
  TournamentStage,
  WorldCupTournamentState,
} from './types';
import { getTeamById, getRandomHostCountry, HOST_COUNTRIES, VENUES, WORLD_CUP_TEAMS, IPL_TEAMS, IPL_HOST_COUNTRY } from './teamsData';

export const TOURNAMENT_STORAGE_KEY = 'crick_frenzy_world_cup_state_v2';
export const IPL_STORAGE_KEY = 'crick_frenzy_ipl_tournament_state_v1';

const WEATHER_OPTIONS: WeatherCondition[] = ['SUNNY', 'SUNNY', 'OVERCAST', 'RAIN', 'NIGHT'];

function getRandomWeatherCondition(): WeatherCondition {
  return WEATHER_OPTIONS[Math.floor(Math.random() * WEATHER_OPTIONS.length)];
}

/**
 * Creates initial team standing row
 */
function createInitialStanding(team: CricketTeam): TeamStanding {
  return {
    teamId: team.id,
    team,
    group: team.groupSeed,
    played: 0,
    won: 0,
    lost: 0,
    tied: 0,
    points: 0,
    nrr: 0,
    runsScored: 0,
    oversFaced: 0,
    runsConceded: 0,
    oversBowled: 0,
    form: [],
  };
}

/**
 * Net Run Rate Calculation: (Runs / Overs) - (Runs Conceded / Overs Bowled)
 */
export function calculateNRR(
  runsScored: number,
  oversFaced: number,
  runsConceded: number,
  oversBowled: number
): number {
  if (oversFaced <= 0 && oversBowled <= 0) return 0;
  const battingRate = oversFaced > 0 ? runsScored / oversFaced : 0;
  const bowlingRate = oversBowled > 0 ? runsConceded / oversBowled : 0;
  const diff = battingRate - bowlingRate;
  return Math.round(diff * 1000) / 1000;
}

/**
 * Sorts team standings by Points -> NRR -> Won -> Rating
 */
export function sortStandings(standings: TeamStanding[]): TeamStanding[] {
  return [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.nrr !== a.nrr) return b.nrr - a.nrr;
    if (b.won !== a.won) return b.won - a.won;
    return b.team.rating - a.team.rating;
  });
}

/**
 * Simulates a realistic cricket match between two AI teams based on match overs and team ratings
 */
export function simulateAIMatch(
  team1: CricketTeam,
  team2: CricketTeam,
  totalOvers: number
): {
  winnerId: string;
  team1Score: { runs: number; wickets: number; overs: number };
  team2Score: { runs: number; wickets: number; overs: number };
  summary: string;
  momPlayer: string;
} {
  const overs = totalOvers === 0 ? 5 : totalOvers;

  // Typical run-rate per over base ~ 8.0 - 10.5
  const baseRPO = 7.5 + (overs <= 2 ? 3.0 : overs <= 5 ? 2.0 : overs <= 10 ? 1.0 : 0.5);

  // Rating advantage
  const diff1 = (team1.rating - 80) * 0.08;
  const diff2 = (team2.rating - 80) * 0.08;

  const rpo1 = Math.max(5.0, baseRPO + diff1 + (Math.random() * 3.6 - 1.8));
  const rpo2 = Math.max(5.0, baseRPO + diff2 + (Math.random() * 3.6 - 1.8));

  const t1Runs = Math.max(12, Math.round(rpo1 * overs));
  const t1Wickets = Math.min(10, Math.floor(1 + Math.random() * (overs <= 5 ? 4 : 7)));

  let t2Runs: number;
  let t2Wickets: number;
  let winnerId: string;
  let summary: string;

  // Simulate chase
  const chaseLuck = Math.random();
  const team2Target = t1Runs + 1;

  if (chaseLuck > 0.48 + (diff1 - diff2) * 0.1) {
    // Team 2 successfully chases
    t2Runs = team2Target + Math.floor(Math.random() * 4);
    t2Wickets = Math.min(9, Math.floor(2 + Math.random() * (overs <= 5 ? 4 : 6)));
    winnerId = team2.id;
    const wktDiff = 10 - t2Wickets;
    summary = `${team2.name} won by ${wktDiff} wicket${wktDiff > 1 ? 's' : ''}`;
  } else {
    // Team 1 defends
    t2Runs = Math.max(8, team2Target - (1 + Math.floor(Math.random() * (overs * 4))));
    t2Wickets = Math.min(10, Math.floor(3 + Math.random() * (overs <= 5 ? 5 : 7)));
    winnerId = team1.id;
    const runDiff = t1Runs - t2Runs;
    summary = `${team1.name} won by ${runDiff} run${runDiff > 1 ? 's' : ''}`;
  }

  const winningTeam = winnerId === team1.id ? team1 : team2;
  const momPlayer = `${winningTeam.shortName || winningTeam.name} Player of the Match`;

  return {
    winnerId,
    team1Score: { runs: t1Runs, wickets: t1Wickets, overs },
    team2Score: { runs: t2Runs, wickets: t2Wickets, overs },
    summary,
    momPlayer,
  };
}

/**
 * Shuffles an array randomly using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Initializes a full 20-Team World Cup Tournament State with auto-shuffled groups
 * and AI generated round-robin fixtures where the selected team plays exactly 9 matches
 * against all 9 other teams in their group.
 */
export function initializeWorldCupTournament(options: {
  userTeamId: string;
  oversPerMatch: number;
  difficulty: 'CASUAL' | 'PRO' | 'CHAMPION';
  totalWickets?: number;
}): WorldCupTournamentState {
  const { userTeamId, oversPerMatch, difficulty, totalWickets = 10 } = options;

  const rawUserTeam = getTeamById(userTeamId);

  // Randomly select host country for this tournament edition
  const hostCountry = getRandomHostCountry();
  const hostVenues = hostCountry.venues;

  // Balanced group distribution:
  // Sort the 20 teams by rating descending
  const sortedTeams = [...WORLD_CUP_TEAMS].sort((a, b) => b.rating - a.rating);
  let groupATemp: CricketTeam[] = [];
  let groupBTemp: CricketTeam[] = [];

  // Pair adjacent ranked teams and randomly assign one to Group A, one to Group B
  for (let i = 0; i < sortedTeams.length; i += 2) {
    const teamA = sortedTeams[i];
    const teamB = sortedTeams[i + 1];
    
    if (Math.random() < 0.5) {
      groupATemp.push(teamA);
      if (teamB) groupBTemp.push(teamB);
    } else {
      groupBTemp.push(teamA);
      if (teamB) groupATemp.push(teamB);
    }
  }

  // Ensure the user team is always in Group A
  const userIsInB = groupBTemp.some((t) => t.id === rawUserTeam.id);
  if (userIsInB) {
    const swap = groupATemp;
    groupATemp = groupBTemp;
    groupBTemp = swap;
  }

  // Position user team at index 0 of Group A
  const groupAWithoutUser = groupATemp.filter((t) => t.id !== rawUserTeam.id);
  const groupATeamPool = [rawUserTeam, ...groupAWithoutUser];
  const groupBTeamPool = groupBTemp;

  // Deep clone and set dynamic groupSeed
  const groupATeams: CricketTeam[] = groupATeamPool.map((t) => ({ ...t, groupSeed: 'A' }));
  const groupBTeams: CricketTeam[] = groupBTeamPool.map((t) => ({ ...t, groupSeed: 'B' }));

  const groupAStandings = groupATeams.map(createInitialStanding);
  const groupBStandings = groupBTeams.map(createInitialStanding);

  // Generate full 9-round round-robin fixtures (circle method)
  // For each 10-team group: 9 rounds × 5 matches = 45 matches per group (90 matches total)
  // The selected team plays exactly 9 matches (1 match against each of the other 9 teams in their group)
  const fixtures: TournamentMatch[] = [];
  const TOTAL_ROUNDS = 9;
  const MATCHES_PER_ROUND = 5;
  let matchCounter = 1;

  const groupARotating = groupATeams.slice(1); // 9 teams
  const groupBRotating = groupBTeams.slice(1); // 9 teams

  for (let r = 0; r < TOTAL_ROUNDS; r++) {
    const roundNumber = r + 1;

    // Group A round pairings
    const currentA: CricketTeam[] = [groupATeams[0]];
    for (let i = 0; i < groupARotating.length; i++) {
      currentA.push(groupARotating[(i + r) % groupARotating.length]);
    }

    for (let m = 0; m < MATCHES_PER_ROUND; m++) {
      let team1 = currentA[m];
      let team2 = currentA[currentA.length - 1 - m];

      if (r % 2 === 1 && m === 0) {
        const temp = team1;
        team1 = team2;
        team2 = temp;
      }

      const isUser = team1.id === userTeamId || team2.id === userTeamId;
      const venue = hostVenues[(matchCounter - 1) % hostVenues.length];

      fixtures.push({
        id: `match-group-a-r${roundNumber}-m${m + 1}`,
        stage: 'GROUP_A',
        matchNumber: matchCounter,
        roundLabel: isUser
          ? `Group Stage • Round ${roundNumber} of 9`
          : `Group A • Round ${roundNumber}`,
        team1Id: team1.id,
        team2Id: team2.id,
        team1,
        team2,
        venue,
        weatherCondition: getRandomWeatherCondition(),
        status: 'UPCOMING',
        isUserMatch: isUser,
      });

      matchCounter++;
    }

    // Group B round pairings
    const currentB: CricketTeam[] = [groupBTeams[0]];
    for (let i = 0; i < groupBRotating.length; i++) {
      currentB.push(groupBRotating[(i + r) % groupBRotating.length]);
    }

    for (let m = 0; m < MATCHES_PER_ROUND; m++) {
      let team1 = currentB[m];
      let team2 = currentB[currentB.length - 1 - m];

      if (r % 2 === 1 && m === 0) {
        const temp = team1;
        team1 = team2;
        team2 = temp;
      }

      const isUser = team1.id === userTeamId || team2.id === userTeamId;
      const venue = hostVenues[(matchCounter - 1) % hostVenues.length];

      fixtures.push({
        id: `match-group-b-r${roundNumber}-m${m + 1}`,
        stage: 'GROUP_B',
        matchNumber: matchCounter,
        roundLabel: `Group B • Round ${roundNumber}`,
        team1Id: team1.id,
        team2Id: team2.id,
        team1,
        team2,
        venue,
        weatherCondition: getRandomWeatherCondition(),
        status: 'UPCOMING',
        isUserMatch: isUser,
      });

      matchCounter++;
    }
  }

  const state: WorldCupTournamentState = {
    editionId: `wc-${Date.now()}`,
    title: `ICC World Cup (${hostCountry.flag} ${hostCountry.name} Edition)`,
    hostCountry,
    userTeamId,
    oversPerMatch,
    totalWickets,
    difficulty,
    currentStage: 'GROUP_STAGE',
    currentMatchIndex: 0,
    groups: {
      groupA: groupATeams.map((t) => t.id),
      groupB: groupBTeams.map((t) => t.id),
    },
    standings: {
      groupA: groupAStandings,
      groupB: groupBStandings,
    },
    fixtures,
    knockouts: {
      quarterFinals: [],
      semiFinals: [],
      finalMatch: null,
    },
    tournamentStats: {
      totalMatchesPlayed: 0,
      totalRunsScored: 0,
      totalWicketsTaken: 0,
      totalFours: 0,
      totalSixes: 0,
      userRuns: 0,
      userWicketsLost: 0,
      userFours: 0,
      userSixes: 0,
    },
    createdAt: Date.now(),
    lastUpdated: Date.now(),
  };

  saveTournamentState(state);
  return state;
}

/**
 * Finds the next playable match for the user
 */
export function getNextUserMatch(state: WorldCupTournamentState): TournamentMatch | null {
  const isUserMatchPredicate = (m: TournamentMatch) =>
    m.isUserMatch || m.team1Id === state.userTeamId || m.team2Id === state.userTeamId;

  if (state.currentStage === 'GROUP_STAGE') {
    return state.fixtures.find((m) => isUserMatchPredicate(m) && m.status !== 'COMPLETED') || null;
  }

  if (state.currentStage === 'QUARTER_FINALS') {
    return state.knockouts.quarterFinals.find((m) => isUserMatchPredicate(m) && m.status !== 'COMPLETED') || null;
  }

  if (state.currentStage === 'SEMI_FINALS') {
    return state.knockouts.semiFinals.find((m) => isUserMatchPredicate(m) && m.status !== 'COMPLETED') || null;
  }

  if (state.currentStage === 'FINALS') {
    if (state.knockouts.finalMatch && state.knockouts.finalMatch.status !== 'COMPLETED') {
      return state.knockouts.finalMatch;
    }
  }

  return null;
}

/**
 * Generates Quarter-Finals brackets from Top 4 teams of each group (or Top 4 in single table for ICL)
 */
export function generateQuarterFinals(state: WorldCupTournamentState): TournamentMatch[] {
  const hostVenues = state.hostCountry?.venues || VENUES;
  const isIPL = state.tournamentType === 'IPL';

  if (isIPL) {
    const sorted = sortStandings(state.standings.groupA);
    const top4 = sorted.slice(0, 4);

    const pairings = [
      { team1: top4[0].team, team2: top4[3].team, label: 'ICL Playoff 1 (Rank 1 vs Rank 4)' },
      { team1: top4[1].team, team2: top4[2].team, label: 'ICL Playoff 2 (Rank 2 vs Rank 3)' },
      { team1: top4[0].team, team2: top4[2].team, label: 'ICL Playoff 3 (Rank 1 vs Rank 3)' },
      { team1: top4[1].team, team2: top4[3].team, label: 'ICL Playoff 4 (Rank 2 vs Rank 4)' },
    ];

    return pairings.map((p, idx) => ({
      id: `icl-qf-${idx + 1}`,
      stage: 'QUARTER_FINAL',
      matchNumber: state.fixtures.length + idx + 1,
      roundLabel: p.label,
      team1Id: p.team1.id,
      team2Id: p.team2.id,
      team1: p.team1,
      team2: p.team2,
      venue: hostVenues[idx % hostVenues.length],
      weatherCondition: getRandomWeatherCondition(),
      status: 'UPCOMING',
      isUserMatch: p.team1.id === state.userTeamId || p.team2.id === state.userTeamId,
    }));
  }

  const sortedA = sortStandings(state.standings.groupA);
  const sortedB = sortStandings(state.standings.groupB);

  const topA = sortedA.slice(0, 4);
  const topB = sortedB.slice(0, 4);

  // QF Pairings:
  // QF 1: A1 vs B4
  // QF 2: B2 vs A3
  // QF 3: A2 vs B3
  // QF 4: B1 vs A4
  const pairings = [
    { team1: topA[0].team, team2: topB[3].team, label: 'Quarter Final 1' },
    { team1: topB[1].team, team2: topA[2].team, label: 'Quarter Final 2' },
    { team1: topA[1].team, team2: topB[2].team, label: 'Quarter Final 3' },
    { team1: topB[0].team, team2: topA[3].team, label: 'Quarter Final 4' },
  ];

  return pairings.map((p, idx) => ({
    id: `qf-${idx + 1}`,
    stage: 'QUARTER_FINAL',
    matchNumber: state.fixtures.length + idx + 1,
    roundLabel: p.label,
    team1Id: p.team1.id,
    team2Id: p.team2.id,
    team1: p.team1,
    team2: p.team2,
    venue: hostVenues[idx % hostVenues.length],
    weatherCondition: getRandomWeatherCondition(),
    status: 'UPCOMING',
    isUserMatch: p.team1.id === state.userTeamId || p.team2.id === state.userTeamId,
  }));
}

/**
 * Generates Semi-Finals brackets from QF winners
 */
export function generateSemiFinals(
  state: WorldCupTournamentState,
  qfMatches: TournamentMatch[]
): TournamentMatch[] {
  const hostVenues = state.hostCountry?.venues || VENUES;
  const isIPL = state.tournamentType === 'IPL';
  const winnerQF1 = getTeamById(qfMatches[0].winnerTeamId || qfMatches[0].team1Id);
  const winnerQF2 = getTeamById(qfMatches[1].winnerTeamId || qfMatches[1].team1Id);
  const winnerQF3 = getTeamById(qfMatches[2].winnerTeamId || qfMatches[2].team1Id);
  const winnerQF4 = getTeamById(qfMatches[3].winnerTeamId || qfMatches[3].team1Id);

  const pairings = [
    { team1: winnerQF1, team2: winnerQF2, label: isIPL ? 'ICL Semi-Final 1' : 'Semi Final 1' },
    { team1: winnerQF3, team2: winnerQF4, label: isIPL ? 'ICL Semi-Final 2' : 'Semi Final 2' },
  ];

  return pairings.map((p, idx) => ({
    id: isIPL ? `icl-sf-${idx + 1}` : `sf-${idx + 1}`,
    stage: 'SEMI_FINAL',
    matchNumber: state.fixtures.length + 4 + idx + 1,
    roundLabel: p.label,
    team1Id: p.team1.id,
    team2Id: p.team2.id,
    team1: p.team1,
    team2: p.team2,
    venue: hostVenues[(idx + 4) % hostVenues.length],
    weatherCondition: getRandomWeatherCondition(),
    status: 'UPCOMING',
    isUserMatch: p.team1.id === state.userTeamId || p.team2.id === state.userTeamId,
  }));
}

/**
 * Generates Final Match from SF winners
 */
export function generateFinalMatch(
  state: WorldCupTournamentState,
  sfMatches: TournamentMatch[]
): TournamentMatch {
  const hostVenues = state.hostCountry?.venues || VENUES;
  const isIPL = state.tournamentType === 'IPL';
  const winnerSF1 = getTeamById(sfMatches[0].winnerTeamId || sfMatches[0].team1Id);
  const winnerSF2 = getTeamById(sfMatches[1].winnerTeamId || sfMatches[1].team1Id);

  return {
    id: isIPL ? 'icl-final-match' : 'final-match',
    stage: 'FINAL',
    matchNumber: state.fixtures.length + 6 + 1,
    roundLabel: isIPL ? 'ICL GRAND FINAL 🏆' : 'ICC World Cup Grand Final 🏆',
    team1Id: winnerSF1.id,
    team2Id: winnerSF2.id,
    team1: winnerSF1,
    team2: winnerSF2,
    venue: isIPL ? 'Narendra Modi Stadium, Ahmedabad' : hostVenues[0],
    weatherCondition: getRandomWeatherCondition(),
    status: 'UPCOMING',
    isUserMatch: winnerSF1.id === state.userTeamId || winnerSF2.id === state.userTeamId,
  };
}

/**
 * Updates a standing entry with match outcome
 */
function updateStandingWithMatch(
  standing: TeamStanding,
  runsScored: number,
  oversFaced: number,
  runsConceded: number,
  oversBowled: number,
  isWon: boolean,
  isTied: boolean
): TeamStanding {
  const played = standing.played + 1;
  const won = standing.won + (isWon ? 1 : 0);
  const lost = standing.lost + (!isWon && !isTied ? 1 : 0);
  const tied = standing.tied + (isTied ? 1 : 0);
  const points = standing.points + (isWon ? 2 : isTied ? 1 : 0);

  const totalRunsScored = standing.runsScored + runsScored;
  const totalOversFaced = standing.oversFaced + oversFaced;
  const totalRunsConceded = standing.runsConceded + runsConceded;
  const totalOversBowled = standing.oversBowled + oversBowled;

  const nrr = calculateNRR(
    totalRunsScored,
    totalOversFaced,
    totalRunsConceded,
    totalOversBowled
  );

  const form: Array<'W' | 'L' | 'T'> = (
    [isWon ? 'W' : isTied ? 'T' : 'L', ...standing.form] as Array<'W' | 'L' | 'T'>
  ).slice(0, 5);

  return {
    ...standing,
    played,
    won,
    lost,
    tied,
    points,
    nrr,
    runsScored: totalRunsScored,
    oversFaced: totalOversFaced,
    runsConceded: totalRunsConceded,
    oversBowled: totalOversBowled,
    form,
  };
}

/**
 * Accurately calculates the tournament standings from all completed fixtures.
 * This guarantees that every completed match contributes exactly once,
 * preventing any duplicate match count issues.
 */
export function recomputeStandingsFromFixtures(state: WorldCupTournamentState): WorldCupTournamentState {
  const standingMap: Record<string, TeamStanding> = {};

  const initStanding = (teamId: string, group: 'A' | 'B'): TeamStanding => ({
    teamId,
    team: getTeamById(teamId),
    group,
    played: 0,
    won: 0,
    lost: 0,
    tied: 0,
    nrr: 0,
    points: 0,
    runsScored: 0,
    oversFaced: 0,
    runsConceded: 0,
    oversBowled: 0,
    form: [],
  });

  (state.groups.groupA || []).forEach((id) => {
    standingMap[id] = initStanding(id, 'A');
  });
  (state.groups.groupB || []).forEach((id) => {
    standingMap[id] = initStanding(id, 'B');
  });

  // Replay every COMPLETED group stage fixture
  (state.fixtures || []).forEach((f) => {
    if (f.status === 'COMPLETED' && f.team1Score && f.team2Score) {
      const s1 = standingMap[f.team1Id];
      const s2 = standingMap[f.team2Id];
      if (!s1 || !s2) return;

      const isT1Win = f.winnerTeamId === f.team1Id;
      const isTie = !f.winnerTeamId || (f.team1Score.runs === f.team2Score.runs);

      standingMap[f.team1Id] = updateStandingWithMatch(
        s1,
        f.team1Score.runs,
        f.team1Score.overs,
        f.team2Score.runs,
        f.team2Score.overs,
        isT1Win,
        isTie
      );

      standingMap[f.team2Id] = updateStandingWithMatch(
        s2,
        f.team2Score.runs,
        f.team2Score.overs,
        f.team1Score.runs,
        f.team1Score.overs,
        !isT1Win && !isTie,
        isTie
      );
    }
  });

  const updatedGroupA = (state.groups.groupA || []).map((id) => standingMap[id] || initStanding(id, 'A'));
  const updatedGroupB = (state.groups.groupB || []).map((id) => standingMap[id] || initStanding(id, 'B'));

  return {
    ...state,
    standings: {
      groupA: sortStandings(updatedGroupA),
      groupB: sortStandings(updatedGroupB),
    },
  };
}

/**
 * Creates a brand new World Cup tournament
 */
export function createNewTournament(
  userTeamId: string,
  oversPerMatch: number,
  difficulty: 'CASUAL' | 'PRO' | 'CHAMPION',
  totalWickets: number = 10
): WorldCupTournamentState {
  return initializeWorldCupTournament({
    userTeamId,
    oversPerMatch,
    difficulty,
    totalWickets,
  });
}

/**
 * Simulates the opponent's innings to create realistic targets for the user based on
 * difficulty level (CASUAL, PRO, CHAMPION) and tournament knockout stage.
 *
 * Target Required Run Rate (RRR):
 * - Easy (CASUAL): Approximately 8.0 - 8.5 RRR
 * - Medium (PRO): 12.0 - 13.0 RRR
 * - Hard (CHAMPION): Strictly above 16.0 and less than 19.0 RRR
 * Dynamic variance ensures targets change match-by-match.
 */
export function simulateOpponentInnings(
  team: CricketTeam,
  totalOvers: number,
  difficulty: 'CASUAL' | 'PRO' | 'CHAMPION' = 'PRO',
  stage?: string
): { runs: number; wickets: number; overs: number } {
  const overs = totalOvers === 0 ? 10 : totalOvers;

  // 1. Difficulty Base Required Run Rate Range
  let minRRR = 12.0;
  let maxRRR = 13.0;

  if (difficulty === 'CASUAL') {
    minRRR = 8.0;
    maxRRR = 8.5;
  } else if (difficulty === 'CHAMPION') {
    minRRR = 16.2;
    maxRRR = 18.8;
  }

  // Random base within tier
  const randomRatio = Math.random();
  let calculatedRRR = minRRR + randomRatio * (maxRRR - minRRR);

  // Slight team rating nuance (+/- 0.15 RPO based on team rating vs baseline 80)
  const teamRatingBonus = (team.rating - 80) * 0.015;
  calculatedRRR += teamRatingBonus;

  // Knockout match intensity
  const stageUpper = (stage || '').toUpperCase();
  if (
    stageUpper.includes('SEMI') ||
    stageUpper.includes('FINAL') ||
    stageUpper.includes('QUALIFIER') ||
    stageUpper.includes('ELIMINATOR')
  ) {
    if (difficulty === 'CASUAL') {
      calculatedRRR += 0.15;
    } else if (difficulty === 'PRO') {
      calculatedRRR += 0.25;
    } else if (difficulty === 'CHAMPION') {
      calculatedRRR += 0.35;
    }
  }

  // Match day variance
  calculatedRRR += (Math.random() - 0.5) * 0.3;

  // Enforce difficulty boundaries
  if (difficulty === 'CASUAL') {
    // Easy mode: approximately 8.0 - 8.5 required run rate
    calculatedRRR = Math.max(7.9, Math.min(8.55, calculatedRRR));
  } else if (difficulty === 'PRO') {
    // Medium mode: 12.0 - 13.0 required run rate
    calculatedRRR = Math.max(12.0, Math.min(13.0, calculatedRRR));
  } else if (difficulty === 'CHAMPION') {
    // Hard mode: strictly above 16.0 and less than 19.0 required run rate
    calculatedRRR = Math.max(16.2, Math.min(18.85, calculatedRRR));
  }

  // Calculate target score to win (target = runs + 1)
  let targetRuns = Math.round(calculatedRRR * overs);

  if (difficulty === 'CHAMPION') {
    const minTarget = Math.floor(16.1 * overs) + 1;
    const maxTarget = Math.ceil(18.9 * overs) - 1;
    targetRuns = Math.max(minTarget, Math.min(maxTarget, targetRuns));
  } else if (difficulty === 'PRO') {
    const minTarget = Math.floor(12.0 * overs);
    const maxTarget = Math.ceil(13.0 * overs);
    targetRuns = Math.max(minTarget, Math.min(maxTarget, targetRuns));
  } else if (difficulty === 'CASUAL') {
    const minTarget = Math.floor(7.9 * overs);
    const maxTarget = Math.ceil(8.55 * overs);
    targetRuns = Math.max(minTarget, Math.min(maxTarget, targetRuns));
  }

  // Opponent runs scored (Target for user to chase is opponent runs + 1)
  const runs = Math.max(10, targetRuns - 1);
  const wickets = Math.min(9, Math.floor(2 + Math.random() * 6));

  return {
    runs,
    wickets,
    overs,
  };
}

/**
 * Records the outcome of a user match and updates standings and stages
 */
export function recordUserMatchResult(
  state: WorldCupTournamentState,
  matchId: string,
  userScoreOrRuns: number | { runs: number; wickets: number; overs: number },
  userWicketsOrOppScore?: number | { runs: number; wickets: number; overs: number },
  userOversArg?: number,
  opponentRunsArg?: number,
  opponentWicketsArg?: number,
  opponentOversArg?: number,
  hasWonArg?: boolean,
  userStatsArg?: { fours: number; sixes: number }
): WorldCupTournamentState {
  let userRuns = 0;
  let userWickets = 0;
  let userOvers = 0;
  let opponentRuns = 0;
  let opponentWickets = 0;
  let opponentOvers = 0;
  let hasWon = false;
  let userStats = userStatsArg || { fours: 0, sixes: 0 };

  if (typeof userScoreOrRuns === 'object') {
    userRuns = userScoreOrRuns.runs;
    userWickets = userScoreOrRuns.wickets;
    userOvers = userScoreOrRuns.overs;
    const oppObj =
      userWicketsOrOppScore && typeof userWicketsOrOppScore === 'object'
        ? userWicketsOrOppScore
        : { runs: 50, wickets: 5, overs: userOvers };
    opponentRuns = oppObj.runs;
    opponentWickets = oppObj.wickets;
    opponentOvers = oppObj.overs;
    hasWon = userRuns >= opponentRuns + 1 || userRuns > opponentRuns;
  } else {
    userRuns = userScoreOrRuns;
    userWickets = (userWicketsOrOppScore as number) || 0;
    userOvers = userOversArg || 10;
    opponentRuns = opponentRunsArg || 0;
    opponentWickets = opponentWicketsArg || 0;
    opponentOvers = opponentOversArg || 10;
    hasWon = hasWonArg ?? (userRuns > opponentRuns);
  }

  let newState: WorldCupTournamentState = JSON.parse(JSON.stringify(state));
  const userTeam = getTeamById(state.userTeamId);
  const isIPL = state.tournamentType === 'IPL';

  // 1. Group Stage Match
  if (newState.currentStage === 'GROUP_STAGE') {
    const match = newState.fixtures.find((m) => m.id === matchId);
    if (!match) return state;

    // Check if match was already completed to prevent duplicate counting
    if (match.status === 'COMPLETED') {
      return recomputeStandingsFromFixtures(newState);
    }

    // Update Tournament Stats
    newState.tournamentStats.totalMatchesPlayed += 1;
    newState.tournamentStats.totalRunsScored += userRuns + opponentRuns;
    newState.tournamentStats.totalWicketsTaken += userWickets + opponentWickets;
    newState.tournamentStats.totalFours += userStats.fours;
    newState.tournamentStats.totalSixes += userStats.sixes;
    newState.tournamentStats.userRuns += userRuns;
    newState.tournamentStats.userWicketsLost += userWickets;
    newState.tournamentStats.userFours += userStats.fours;
    newState.tournamentStats.userSixes += userStats.sixes;

    const isTeam1User = match.team1Id === state.userTeamId;
    const opponentId = isTeam1User ? match.team2Id : match.team1Id;
    const opponentTeam = getTeamById(opponentId);

    match.status = 'COMPLETED';
    match.winnerTeamId = hasWon ? userTeam.id : opponentTeam.id;
    match.team1Score = isTeam1User
      ? { runs: userRuns, wickets: userWickets, overs: userOvers }
      : { runs: opponentRuns, wickets: opponentWickets, overs: opponentOvers };
    match.team2Score = isTeam1User
      ? { runs: opponentRuns, wickets: opponentWickets, overs: opponentOvers }
      : { runs: userRuns, wickets: userWickets, overs: userOvers };

    const wktDiff = Math.max(1, (newState.totalWickets || 10) - userWickets);
    const runDiff = Math.max(1, opponentRuns - userRuns);
    match.resultSummary = hasWon
      ? `${userTeam.name} won by ${wktDiff} wicket${wktDiff > 1 ? 's' : ''}`
      : `${opponentTeam.name} won by ${runDiff} run${runDiff > 1 ? 's' : ''}`;
    match.momPlayer = `${hasWon ? (userTeam.shortName || userTeam.name) : (opponentTeam.shortName || opponentTeam.name)} Player of the Match`;

    // Simulate only other AI matches in this specific round
    const matchesPerRound = isIPL ? 5 : 10;
    const currentRound = Math.ceil(match.matchNumber / matchesPerRound);
    const maxMatchNumberForRound = currentRound * matchesPerRound;

    newState.fixtures.forEach((f) => {
      if (f.status === 'UPCOMING' && !f.isUserMatch && f.matchNumber <= maxMatchNumberForRound) {
        const t1 = getTeamById(f.team1Id);
        const t2 = getTeamById(f.team2Id);
        const sim = simulateAIMatch(t1, t2, newState.oversPerMatch);
        f.status = 'COMPLETED';
        f.winnerTeamId = sim.winnerId;
        f.team1Score = sim.team1Score;
        f.team2Score = sim.team2Score;
        f.resultSummary = sim.summary;
        f.momPlayer = sim.momPlayer;
      }
    });

    // Check if user has finished all group matches
    const remainingUserGroupMatches = newState.fixtures.filter(
      (m) => m.isUserMatch && m.status === 'UPCOMING'
    );

    if (remainingUserGroupMatches.length === 0) {
      // Complete any remaining AI group matches across the tournament
      newState.fixtures.forEach((f) => {
        if (f.status === 'UPCOMING') {
          const t1 = getTeamById(f.team1Id);
          const t2 = getTeamById(f.team2Id);
          const sim = simulateAIMatch(t1, t2, newState.oversPerMatch);
          f.status = 'COMPLETED';
          f.winnerTeamId = sim.winnerId;
          f.team1Score = sim.team1Score;
          f.team2Score = sim.team2Score;
          f.resultSummary = sim.summary;
          f.momPlayer = sim.momPlayer;
        }
      });
    }

    // Recompute standings accurately from all completed fixtures
    newState = recomputeStandingsFromFixtures(newState);

    if (remainingUserGroupMatches.length === 0) {
      if (isIPL) {
        const sortedStandings = sortStandings(newState.standings.groupA);
        const userRank = sortedStandings.findIndex((s) => s.teamId === userTeam.id);
        if (userRank >= 0 && userRank < 4) {
          newState.currentStage = 'QUARTER_FINALS';
          newState.knockouts.quarterFinals = generateQuarterFinals(newState);
        } else {
          newState.currentStage = 'ELIMINATED';
        }
      } else {
        const myGroupKey = newState.groups.groupA.includes(userTeam.id) ? 'groupA' : 'groupB';
        const myGroupStandings = sortStandings(newState.standings[myGroupKey]);
        const userRank = myGroupStandings.findIndex((s) => s.teamId === userTeam.id);

        if (userRank >= 0 && userRank < 4) {
          newState.currentStage = 'QUARTER_FINALS';
          newState.knockouts.quarterFinals = generateQuarterFinals(newState);
        } else {
          newState.currentStage = 'ELIMINATED';
        }
      }
    }
  }
  // 2. Quarter Finals
  else if (newState.currentStage === 'QUARTER_FINALS') {
    const match = newState.knockouts.quarterFinals.find((m) => m.id === matchId);
    if (!match) return state;
    if (match.status === 'COMPLETED') return state;

    // Update Stats
    newState.tournamentStats.totalMatchesPlayed += 1;
    newState.tournamentStats.totalRunsScored += userRuns + opponentRuns;
    newState.tournamentStats.totalWicketsTaken += userWickets + opponentWickets;
    newState.tournamentStats.totalFours += userStats.fours;
    newState.tournamentStats.totalSixes += userStats.sixes;
    newState.tournamentStats.userRuns += userRuns;
    newState.tournamentStats.userWicketsLost += userWickets;
    newState.tournamentStats.userFours += userStats.fours;
    newState.tournamentStats.userSixes += userStats.sixes;

    const isTeam1User = match.team1Id === state.userTeamId;
    const opponentId = isTeam1User ? match.team2Id : match.team1Id;
    const opponentTeam = getTeamById(opponentId);

    match.status = 'COMPLETED';
    match.winnerTeamId = hasWon ? userTeam.id : opponentTeam.id;
    match.team1Score = isTeam1User
      ? { runs: userRuns, wickets: userWickets, overs: userOvers }
      : { runs: opponentRuns, wickets: opponentWickets, overs: opponentOvers };
    match.team2Score = isTeam1User
      ? { runs: opponentRuns, wickets: opponentWickets, overs: opponentOvers }
      : { runs: userRuns, wickets: userWickets, overs: userOvers };

    const qfWktDiff = Math.max(1, (newState.totalWickets || 10) - userWickets);
    const runDiff = Math.max(1, opponentRuns - userRuns);
    match.resultSummary = hasWon
      ? `${userTeam.name} won by ${qfWktDiff} wicket${qfWktDiff > 1 ? 's' : ''}`
      : `${opponentTeam.name} won by ${runDiff} run${runDiff > 1 ? 's' : ''}`;
    match.momPlayer = `${hasWon ? (userTeam.shortName || userTeam.name) : (opponentTeam.shortName || opponentTeam.name)} Player of the Match`;

    // Simulate other QFs
    newState.knockouts.quarterFinals.forEach((qf) => {
      if (qf.status === 'UPCOMING' && !qf.isUserMatch) {
        const t1 = getTeamById(qf.team1Id);
        const t2 = getTeamById(qf.team2Id);
        const sim = simulateAIMatch(t1, t2, newState.oversPerMatch);
        qf.status = 'COMPLETED';
        qf.winnerTeamId = sim.winnerId;
        qf.team1Score = sim.team1Score;
        qf.team2Score = sim.team2Score;
        qf.resultSummary = sim.summary;
        qf.momPlayer = sim.momPlayer;
      }
    });

    if (hasWon) {
      newState.currentStage = 'SEMI_FINALS';
      newState.knockouts.semiFinals = generateSemiFinals(
        newState,
        newState.knockouts.quarterFinals
      );
    } else {
      newState.currentStage = 'ELIMINATED';
    }
  }
  // 3. Semi Finals
  else if (newState.currentStage === 'SEMI_FINALS') {
    const match = newState.knockouts.semiFinals.find((m) => m.id === matchId);
    if (!match) return state;
    if (match.status === 'COMPLETED') return state;

    // Update Stats
    newState.tournamentStats.totalMatchesPlayed += 1;
    newState.tournamentStats.totalRunsScored += userRuns + opponentRuns;
    newState.tournamentStats.totalWicketsTaken += userWickets + opponentWickets;
    newState.tournamentStats.totalFours += userStats.fours;
    newState.tournamentStats.totalSixes += userStats.sixes;
    newState.tournamentStats.userRuns += userRuns;
    newState.tournamentStats.userWicketsLost += userWickets;
    newState.tournamentStats.userFours += userStats.fours;
    newState.tournamentStats.userSixes += userStats.sixes;

    const isTeam1User = match.team1Id === state.userTeamId;
    const opponentId = isTeam1User ? match.team2Id : match.team1Id;
    const opponentTeam = getTeamById(opponentId);

    match.status = 'COMPLETED';
    match.winnerTeamId = hasWon ? userTeam.id : opponentTeam.id;
    match.team1Score = isTeam1User
      ? { runs: userRuns, wickets: userWickets, overs: userOvers }
      : { runs: opponentRuns, wickets: opponentWickets, overs: opponentOvers };
    match.team2Score = isTeam1User
      ? { runs: opponentRuns, wickets: opponentWickets, overs: opponentOvers }
      : { runs: userRuns, wickets: userWickets, overs: userOvers };

    const sfWktDiff = Math.max(1, (newState.totalWickets || 10) - userWickets);
    const sfRunDiff = Math.max(1, opponentRuns - userRuns);
    match.resultSummary = hasWon
      ? `${userTeam.name} won by ${sfWktDiff} wicket${sfWktDiff > 1 ? 's' : ''}`
      : `${opponentTeam.name} won by ${sfRunDiff} run${sfRunDiff > 1 ? 's' : ''}`;
    match.momPlayer = `${hasWon ? (userTeam.shortName || userTeam.name) : (opponentTeam.shortName || opponentTeam.name)} Player of the Match`;

    // Simulate other Semi Final
    newState.knockouts.semiFinals.forEach((sf) => {
      if (sf.status === 'UPCOMING' && !sf.isUserMatch) {
        const t1 = getTeamById(sf.team1Id);
        const t2 = getTeamById(sf.team2Id);
        const sim = simulateAIMatch(t1, t2, newState.oversPerMatch);
        sf.status = 'COMPLETED';
        sf.winnerTeamId = sim.winnerId;
        sf.team1Score = sim.team1Score;
        sf.team2Score = sim.team2Score;
        sf.resultSummary = sim.summary;
        sf.momPlayer = sim.momPlayer;
      }
    });

    if (hasWon) {
      newState.currentStage = 'FINALS';
      newState.knockouts.finalMatch = generateFinalMatch(
        newState,
        newState.knockouts.semiFinals
      );
    } else {
      newState.currentStage = 'ELIMINATED';
    }
  }
  // 4. Grand Final
  else if (newState.currentStage === 'FINALS') {
    const match = newState.knockouts.finalMatch;
    if (!match) return state;
    if (match.status === 'COMPLETED') return state;

    // Update Stats
    newState.tournamentStats.totalMatchesPlayed += 1;
    newState.tournamentStats.totalRunsScored += userRuns + opponentRuns;
    newState.tournamentStats.totalWicketsTaken += userWickets + opponentWickets;
    newState.tournamentStats.totalFours += userStats.fours;
    newState.tournamentStats.totalSixes += userStats.sixes;
    newState.tournamentStats.userRuns += userRuns;
    newState.tournamentStats.userWicketsLost += userWickets;
    newState.tournamentStats.userFours += userStats.fours;
    newState.tournamentStats.userSixes += userStats.sixes;

    const isTeam1User = match.team1Id === state.userTeamId;
    const opponentId = isTeam1User ? match.team2Id : match.team1Id;
    const opponentTeam = getTeamById(opponentId);

    match.status = 'COMPLETED';
    match.winnerTeamId = hasWon ? userTeam.id : opponentTeam.id;
    match.team1Score = isTeam1User
      ? { runs: userRuns, wickets: userWickets, overs: userOvers }
      : { runs: opponentRuns, wickets: opponentWickets, overs: opponentOvers };
    match.team2Score = isTeam1User
      ? { runs: opponentRuns, wickets: opponentWickets, overs: opponentOvers }
      : { runs: userRuns, wickets: userWickets, overs: userOvers };

    const isIPL = state.tournamentType === 'IPL';
    const finalWktDiff = Math.max(1, (newState.totalWickets || 10) - userWickets);
    const finalRunDiff = Math.max(1, opponentRuns - userRuns);
    match.resultSummary = hasWon
      ? isIPL
        ? `${userTeam.name} are INDIAN CRICKET LEAGUE CHAMPIONS! 🏆 Smashed ${opponentTeam.name} by ${finalWktDiff} wicket${finalWktDiff > 1 ? 's' : ''}`
        : `${userTeam.name} are WORLD CHAMPIONS! Smashed ${opponentTeam.name} by ${finalWktDiff} wicket${finalWktDiff > 1 ? 's' : ''}`
      : isIPL
        ? `${opponentTeam.name} won the Indian Cricket League by ${finalRunDiff} run${finalRunDiff > 1 ? 's' : ''}`
        : `${opponentTeam.name} won the World Cup by ${finalRunDiff} run${finalRunDiff > 1 ? 's' : ''}`;
    match.momPlayer = `${hasWon ? (userTeam.shortName || userTeam.name) : (opponentTeam.shortName || opponentTeam.name)} Player of the Match`;

    if (hasWon) {
      newState.currentStage = 'CHAMPION';
      newState.championTeamId = userTeam.id;
    } else {
      newState.currentStage = 'ELIMINATED';
      newState.championTeamId = opponentTeam.id;
    }
  }

  newState.lastUpdated = Date.now();
  saveTournamentState(newState);
  return newState;
}

/**
 * Generates the full 14-round (70 matches total) league schedule for ICL (10 teams).
 * Structure:
 * - Single group of 10 teams.
 * - Each team plays exactly 14 matches.
 * - Rounds 1 to 9 (First Leg): Complete single round-robin where every team plays all 9 other teams exactly once.
 * - Rounds 10 to 14 (Second Leg): 5 rounds of repeat matches against 5 distinct/random teams.
 * - In every round (R1 to R14), all 10 teams play exactly 1 match (5 matches per round).
 */
export function generateICLFixtures(
  all10Teams: CricketTeam[],
  userTeamId: string,
  hostVenues: string[]
): TournamentMatch[] {
  const fixtures: TournamentMatch[] = [];
  let matchCounter = 1;

  // 1. LEG 1: Rounds 1 to 9 (Complete Round-Robin: 9 matches per team vs all 9 opponents)
  const rotatingTeams = all10Teams.slice(1); // 9 teams

  for (let r = 0; r < 9; r++) {
    const roundNumber = r + 1;
    const currentRoundTeams: CricketTeam[] = [all10Teams[0]];
    for (let i = 0; i < rotatingTeams.length; i++) {
      currentRoundTeams.push(rotatingTeams[(i + r) % rotatingTeams.length]);
    }

    for (let m = 0; m < 5; m++) {
      let team1 = currentRoundTeams[m];
      let team2 = currentRoundTeams[currentRoundTeams.length - 1 - m];

      // Alternate home/away order
      if (r % 2 === 1 && m === 0) {
        const temp = team1;
        team1 = team2;
        team2 = temp;
      }

      const isUser = team1.id === userTeamId || team2.id === userTeamId;
      const venue = hostVenues[(matchCounter - 1) % hostVenues.length];

      fixtures.push({
        id: `icl-match-r${roundNumber}-m${m + 1}`,
        stage: 'GROUP_A',
        matchNumber: matchCounter,
        roundLabel: isUser
          ? `ICL League Match • Round ${roundNumber} of 14`
          : `ICL Match ${matchCounter} • Round ${roundNumber}`,
        team1Id: team1.id,
        team2Id: team2.id,
        team1,
        team2,
        venue,
        weatherCondition: getRandomWeatherCondition(),
        status: 'UPCOMING',
        isUserMatch: isUser,
      });

      matchCounter++;
    }
  }

  // 2. LEG 2: Rounds 10 to 14 (5 Repeat Rounds: 5 additional matches against 5 distinct opponents)
  // Shuffled rotation so each team is paired with 5 distinct opponents for their repeat clashes
  const shuffledRotating = shuffleArray([...rotatingTeams]);

  for (let r = 0; r < 5; r++) {
    const roundNumber = 10 + r;
    const currentRoundTeams: CricketTeam[] = [all10Teams[0]];
    for (let i = 0; i < shuffledRotating.length; i++) {
      currentRoundTeams.push(shuffledRotating[(i + r) % shuffledRotating.length]);
    }

    for (let m = 0; m < 5; m++) {
      let team1 = currentRoundTeams[m];
      let team2 = currentRoundTeams[currentRoundTeams.length - 1 - m];

      // Alternate home/away
      if (r % 2 === 0 && m === 0) {
        const temp = team1;
        team1 = team2;
        team2 = temp;
      }

      const isUser = team1.id === userTeamId || team2.id === userTeamId;
      const venue = hostVenues[(matchCounter - 1) % hostVenues.length];

      fixtures.push({
        id: `icl-match-r${roundNumber}-m${m + 1}`,
        stage: 'GROUP_A',
        matchNumber: matchCounter,
        roundLabel: isUser
          ? `ICL League Match • Round ${roundNumber} of 14 (Return Clash)`
          : `ICL Match ${matchCounter} • Round ${roundNumber}`,
        team1Id: team1.id,
        team2Id: team2.id,
        team1,
        team2,
        venue,
        weatherCondition: getRandomWeatherCondition(),
        status: 'UPCOMING',
        isUserMatch: isUser,
      });

      matchCounter++;
    }
  }

  return fixtures;
}

/**
 * Initializes a new Indian Cricket League (ICL) tournament season:
 * 10 ICL Franchise teams in a SINGLE UNIFIED TABLE.
 * Full 14-round schedule (70 matches), where each team plays exactly 14 matches:
 * 9 matches against all 9 other franchises + 5 repeat matches against 5 teams.
 * Followed by ICL Playoffs (Top 4 qualify for Playoffs & Grand Final at Ahmedabad).
 */
export function initializeIPLTournament(options: {
  userTeamId: string;
  oversPerMatch: number;
  difficulty: 'CASUAL' | 'PRO' | 'CHAMPION';
  editionId?: string;
  editionName?: string;
  totalWickets?: number;
}): WorldCupTournamentState {
  const {
    userTeamId,
    oversPerMatch,
    difficulty,
    editionId = 'IPL',
    editionName = 'Indian Cricket League',
    totalWickets = 10,
  } = options;

  const rawUserTeam = getTeamById(userTeamId);
  const hostCountry = IPL_HOST_COUNTRY;
  const hostVenues = hostCountry.venues;

  // 10 ICL Franchise Teams in a SINGLE UNIFIED TABLE (Group A)
  const otherTeams = IPL_TEAMS.filter((t) => t.id !== rawUserTeam.id);
  const shuffledOtherTeams = shuffleArray(otherTeams);
  const all10Teams: CricketTeam[] = [rawUserTeam, ...shuffledOtherTeams].map((t) => ({
    ...t,
    groupSeed: 'A',
  }));

  const all10Standings = all10Teams.map(createInitialStanding);

  // Generate 14-round fixtures (70 matches total, each team plays exactly 14 matches)
  const fixtures = generateICLFixtures(all10Teams, userTeamId, hostVenues);

  // Knockouts / Playoffs: Top 4 teams from the unified table
  const quarterFinals: TournamentMatch[] = [
    {
      id: 'icl-match-playoff-qf1',
      stage: 'QUARTER_FINAL',
      matchNumber: 71,
      roundLabel: 'Playoffs • Qualifier 1 (Rank 1 vs Rank 4)',
      team1Id: '',
      team2Id: '',
      venue: hostVenues[0], // Wankhede Stadium, Mumbai
      weatherCondition: 'NIGHT',
      status: 'UPCOMING',
      isUserMatch: false,
    },
    {
      id: 'icl-match-playoff-qf2',
      stage: 'QUARTER_FINAL',
      matchNumber: 72,
      roundLabel: 'Playoffs • Eliminator (Rank 2 vs Rank 3)',
      team1Id: '',
      team2Id: '',
      venue: hostVenues[1 % hostVenues.length], // Chepauk, Chennai
      weatherCondition: 'NIGHT',
      status: 'UPCOMING',
      isUserMatch: false,
    },
    {
      id: 'icl-match-playoff-qf3',
      stage: 'QUARTER_FINAL',
      matchNumber: 73,
      roundLabel: 'Playoffs • Qualifier 2 (Rank 1 vs Rank 3)',
      team1Id: '',
      team2Id: '',
      venue: hostVenues[2 % hostVenues.length], // Eden Gardens, Kolkata
      weatherCondition: 'NIGHT',
      status: 'UPCOMING',
      isUserMatch: false,
    },
    {
      id: 'icl-match-playoff-qf4',
      stage: 'QUARTER_FINAL',
      matchNumber: 74,
      roundLabel: 'Playoffs • Eliminator 2 (Rank 2 vs Rank 4)',
      team1Id: '',
      team2Id: '',
      venue: hostVenues[3 % hostVenues.length], // Chinnaswamy, Bengaluru
      weatherCondition: 'NIGHT',
      status: 'UPCOMING',
      isUserMatch: false,
    },
  ];

  const semiFinals: TournamentMatch[] = [
    {
      id: 'icl-match-semi-final-1',
      stage: 'SEMI_FINAL',
      matchNumber: 75,
      roundLabel: 'ICL Semi-Final 1 (Winner Playoff 1 vs Winner Playoff 2)',
      team1Id: '',
      team2Id: '',
      venue: hostVenues[4 % hostVenues.length], // Narendra Modi Stadium, Ahmedabad
      weatherCondition: 'NIGHT',
      status: 'UPCOMING',
      isUserMatch: false,
    },
    {
      id: 'icl-match-semi-final-2',
      stage: 'SEMI_FINAL',
      matchNumber: 76,
      roundLabel: 'ICL Semi-Final 2 (Winner Playoff 3 vs Winner Playoff 4)',
      team1Id: '',
      team2Id: '',
      venue: hostVenues[0], // Wankhede Stadium, Mumbai
      weatherCondition: 'NIGHT',
      status: 'UPCOMING',
      isUserMatch: false,
    },
  ];

  const finalMatch: TournamentMatch = {
    id: 'icl-match-grand-final',
    stage: 'FINAL',
    matchNumber: 77,
    roundLabel: 'ICL GRAND FINAL 🏆',
    team1Id: '',
    team2Id: '',
    venue: 'Narendra Modi Stadium, Ahmedabad',
    weatherCondition: 'NIGHT',
    status: 'UPCOMING',
    isUserMatch: false,
  };

  const tournamentState: WorldCupTournamentState = {
    editionId,
    title: editionName,
    tournamentType: 'IPL',
    leagueName: 'Indian Cricket League',
    hostCountry,
    userTeamId,
    oversPerMatch,
    totalWickets,
    difficulty,
    currentStage: 'GROUP_STAGE',
    currentMatchIndex: 0,
    groups: {
      groupA: all10Teams.map((t) => t.id),
      groupB: [],
    },
    standings: {
      groupA: all10Standings,
      groupB: [],
    },
    fixtures,
    knockouts: {
      quarterFinals,
      semiFinals,
      finalMatch,
    },
    tournamentStats: {
      totalMatchesPlayed: 0,
      totalRunsScored: 0,
      totalWicketsTaken: 0,
      totalFours: 0,
      totalSixes: 0,
      userRuns: 0,
      userWicketsLost: 0,
      userFours: 0,
      userSixes: 0,
    },
    createdAt: Date.now(),
    lastUpdated: Date.now(),
  };

  saveTournamentState(tournamentState);
  return tournamentState;
}

/**
 * Persists Tournament state to localStorage (supports World Cup and IPL)
 */
export function saveTournamentState(state: WorldCupTournamentState): void {
  try {
    const key = state.tournamentType === 'IPL' ? IPL_STORAGE_KEY : TOURNAMENT_STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify(state));

    if (auth.currentUser) {
      const userTeam = getTeamById(state.userTeamId);
      const allStandings = [...(state.standings?.groupA || []), ...(state.standings?.groupB || [])];
      const userStanding = allStandings.find((s) => s.teamId === state.userTeamId);
      const wins = userStanding?.won || 0;
      const played = userStanding?.played || 0;
      const losses = userStanding?.lost || 0;

      syncTournamentToFirestore(auth.currentUser.uid, {
        id: state.editionId || (state.tournamentType === 'IPL' ? 'ipl_active' : 'worldcup_active'),
        type: state.tournamentType === 'IPL' ? 'IPL' : 'WORLD_CUP',
        team: userTeam?.shortName || state.userTeamId || 'Team',
        status: state.championTeamId === state.userTeamId ? 'WON' : (state.currentStage === 'ELIMINATED' ? 'ELIMINATED' : 'ONGOING'),
        matchesPlayed: played,
        wins,
        losses,
        savedStateJson: JSON.stringify(state),
      }).catch((err) => console.warn('Cloud sync tournament warning:', err));
    }
  } catch (err) {
    console.warn('Failed to save tournament state to localStorage:', err);
  }
}

/**
 * Persists IPL state specifically
 */
export function saveIPLState(state: WorldCupTournamentState): void {
  saveTournamentState({ ...state, tournamentType: 'IPL' });
}

/**
 * Loads World Cup tournament state from localStorage
 */
export function loadTournamentState(): WorldCupTournamentState | null {
  try {
    localStorage.removeItem('crick_frenzy_world_cup_state_v1');

    const raw = localStorage.getItem(TOURNAMENT_STORAGE_KEY);
    if (!raw) return null;
    let parsed = JSON.parse(raw);
    if (parsed && typeof parsed.editionId === 'string' && parsed.userTeamId) {
      if (
        !Array.isArray(parsed.fixtures) ||
        parsed.fixtures.length !== 90 ||
        !parsed.groups?.groupA ||
        parsed.groups.groupA.length !== 10
      ) {
        console.warn('Outdated tournament state detected in storage, resetting...');
        localStorage.removeItem(TOURNAMENT_STORAGE_KEY);
        return null;
      }

      let userTeamId = parsed.userTeamId;
      if (typeof userTeamId !== 'string') {
        if (typeof userTeamId === 'object' && userTeamId !== null) {
          userTeamId = userTeamId.userTeamId || userTeamId.id || 'ind';
        } else {
          userTeamId = 'ind';
        }
      }
      let oversPerMatch = parsed.oversPerMatch;
      if (typeof oversPerMatch !== 'number' || isNaN(oversPerMatch)) {
        if (typeof oversPerMatch === 'object' && oversPerMatch !== null) {
          oversPerMatch = Number((oversPerMatch as any).totalOvers) || 10;
        } else {
          oversPerMatch = 10;
        }
      }
      let totalWickets = parsed.totalWickets;
      if (typeof totalWickets !== 'number' || isNaN(totalWickets)) {
        totalWickets = 10;
      }
      let difficulty = parsed.difficulty;
      if (typeof difficulty !== 'string') {
        difficulty = 'PRO';
      }

      parsed.userTeamId = userTeamId;
      parsed.oversPerMatch = oversPerMatch;
      parsed.totalWickets = totalWickets;
      parsed.difficulty = difficulty;
      parsed.tournamentType = 'WORLD_CUP';

      // Automatically recalculate standings from completed fixtures to ensure 100% data integrity
      parsed = recomputeStandingsFromFixtures(parsed as WorldCupTournamentState);
      return parsed as WorldCupTournamentState;
    }
  } catch (err) {
    console.warn('Failed to parse tournament state:', err);
  }
  return null;
}

/**
 * Loads IPL tournament state from localStorage
 */
export function loadIPLState(): WorldCupTournamentState | null {
  try {
    const raw = localStorage.getItem(IPL_STORAGE_KEY);
    if (!raw) return null;
    let parsed = JSON.parse(raw);
    if (parsed && typeof parsed.editionId === 'string' && parsed.userTeamId) {
      if (
        !Array.isArray(parsed.fixtures) ||
        parsed.fixtures.length !== 70 ||
        !parsed.groups?.groupA ||
        parsed.groups.groupA.length !== 10
      ) {
        console.warn('Outdated IPL tournament state detected, resetting...');
        localStorage.removeItem(IPL_STORAGE_KEY);
        return null;
      }

      let userTeamId = parsed.userTeamId;
      if (typeof userTeamId !== 'string') {
        if (typeof userTeamId === 'object' && userTeamId !== null) {
          userTeamId = userTeamId.userTeamId || userTeamId.id || 'csk';
        } else {
          userTeamId = 'csk';
        }
      }

      let oversPerMatch = parsed.oversPerMatch;
      if (typeof oversPerMatch !== 'number' || isNaN(oversPerMatch)) {
        oversPerMatch = 10;
      }

      let difficulty = parsed.difficulty;
      if (typeof difficulty !== 'string') {
        difficulty = 'PRO';
      }

      parsed.userTeamId = userTeamId;
      parsed.oversPerMatch = oversPerMatch;
      parsed.difficulty = difficulty;
      parsed.tournamentType = 'IPL';

      // Automatically recalculate standings from completed fixtures to ensure 100% data integrity
      parsed = recomputeStandingsFromFixtures(parsed as WorldCupTournamentState);
      return parsed as WorldCupTournamentState;
    }
  } catch (err) {
    console.warn('Failed to parse IPL state:', err);
  }
  return null;
}

/**
 * Clears IPL tournament state
 */
export function clearIPLState(): void {
  try {
    localStorage.removeItem(IPL_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear IPL state:', err);
  }
}

/**
 * Clears World Cup tournament state
 */
export function clearTournamentState(): void {
  try {
    localStorage.removeItem(TOURNAMENT_STORAGE_KEY);
    localStorage.removeItem('crick_frenzy_world_cup_state_v1');
    localStorage.removeItem('crick_frenzy_world_cup_state_v2');
    localStorage.removeItem('crick_frenzy_tournament_state');
  } catch (err) {
    console.error('Failed to clear tournament state:', err);
  }
}
