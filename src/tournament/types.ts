import { WeatherCondition } from '../types';

export interface SquadPlayer {
  id: string;
  name: string;
  role: 'BATSMAN' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKET_KEEPER';
  isCaptain?: boolean;
  isStar?: boolean;
  battingStyle?: string;
  bowlingStyle?: string;
}

export interface CricketTeam {
  id: string;
  name: string;
  shortName: string;
  flag: string;
  crest?: string;
  crestIcon?: string;
  tagline?: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  accentColor: string;
  rating: number; // 70 - 95
  tier: 1 | 2 | 3;
  captain?: string;
  starBatsman?: string;
  starBowler?: string;
  description: string;
  groupSeed: 'A' | 'B';
  squad?: SquadPlayer[];
}

export interface TeamStanding {
  teamId: string;
  team: CricketTeam;
  group: 'A' | 'B';
  played: number;
  won: number;
  lost: number;
  tied: number;
  points: number;
  nrr: number;
  runsScored: number;
  oversFaced: number;
  runsConceded: number;
  oversBowled: number;
  form: Array<'W' | 'L' | 'T'>;
}

export type TournamentStage =
  | 'GROUP_STAGE'
  | 'QUARTER_FINALS'
  | 'SEMI_FINALS'
  | 'FINALS'
  | 'CHAMPION'
  | 'ELIMINATED';

export type MatchStageType =
  | 'GROUP_A'
  | 'GROUP_B'
  | 'QUARTER_FINAL'
  | 'SEMI_FINAL'
  | 'FINAL';

export interface TournamentMatch {
  id: string;
  stage: MatchStageType;
  matchNumber: number;
  roundLabel: string;
  team1Id: string;
  team2Id: string;
  team1?: CricketTeam;
  team2?: CricketTeam;
  venue: string;
  weatherCondition?: WeatherCondition;
  status: 'UPCOMING' | 'PLAYING' | 'COMPLETED';
  winnerTeamId?: string;
  team1Score?: {
    runs: number;
    wickets: number;
    overs: number;
  };
  team2Score?: {
    runs: number;
    wickets: number;
    overs: number;
  };
  resultSummary?: string;
  isUserMatch: boolean;
  momPlayer?: string;
}

export type WorldCupMatch = TournamentMatch;

export interface HostCountry {
  id: string;
  name: string;
  shortCode: string;
  flag: string;
  venues: string[];
}

export interface WorldCupTournamentState {
  editionId: string;
  title: string;
  tournamentType?: 'WORLD_CUP' | 'IPL';
  leagueName?: string;
  hostCountry?: HostCountry;
  userTeamId: string;
  oversPerMatch: number;
  totalWickets: number; // default: 10
  difficulty: 'CASUAL' | 'PRO' | 'CHAMPION';
  currentStage: TournamentStage;
  currentMatchIndex: number; // index of next user match in schedule
  groups: {
    groupA: string[];
    groupB: string[];
  };
  standings: {
    groupA: TeamStanding[];
    groupB: TeamStanding[];
  };
  fixtures: TournamentMatch[];
  knockouts: {
    quarterFinals: TournamentMatch[];
    semiFinals: TournamentMatch[];
    finalMatch: TournamentMatch | null;
  };
  championTeamId?: string;
  tournamentStats: {
    totalMatchesPlayed: number;
    totalRunsScored: number;
    totalWicketsTaken: number;
    totalFours: number;
    totalSixes: number;
    userRuns: number;
    userWicketsLost: number;
    userFours: number;
    userSixes: number;
  };
  createdAt: number;
  lastUpdated: number;
}
