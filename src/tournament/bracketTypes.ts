export interface BracketTeam {
  id: string;
  name: string;
  shortName?: string;
  flag: string;
  isUserTeam?: boolean;
}

export interface BracketScore {
  runs: number;
  wickets: number;
  overs: number;
}

export interface BracketMatch {
  id: string;
  round: 'Round of 16' | 'Quarterfinals' | 'Semifinals' | 'Final' | string;
  date: string; // e.g. "4 Jul", "12 Oct"
  timeOrStatus?: string; // e.g. "Result", "Live", "18:00 GMT"
  status?: 'UPCOMING' | 'LIVE' | 'COMPLETED';
  teamA?: BracketTeam | null;
  teamB?: BracketTeam | null;
  scoreA?: BracketScore | null;
  scoreB?: BracketScore | null;
  winner?: string | null; // teamA.id or teamB.id
  result?: string; // e.g. "Won by 5 wickets", "Won by 23 runs"
  nextMatchId?: string; // ID of the next round match this advances to
  nextMatchSlot?: 'A' | 'B'; // whether winner fills teamA or teamB slot in next match
  isTie?: boolean;
  isSuperOver?: boolean;
  venue?: string;
  isUserMatch?: boolean;
  momPlayer?: string;
  roundIndex?: number; // 0 for R16/QF, 1 for SF, 2 for Final
  matchIndexInRound?: number;
}
