import { WorldCupTournamentState, TournamentMatch, CricketTeam } from './types';
import { BracketMatch, BracketTeam, BracketScore } from './bracketTypes';
import { getTeamById } from './teamsData';

/**
 * Maps a CricketTeam or team ID into BracketTeam format
 */
export function mapTeamToBracketTeam(teamId?: string | null, userTeamId?: string): BracketTeam | null {
  if (!teamId) return null;
  const team = getTeamById(teamId);
  if (!team) return null;

  return {
    id: team.id,
    name: team.name,
    shortName: team.shortName,
    flag: team.flag,
    isUserTeam: userTeamId ? team.id === userTeamId : false,
  };
}

/**
 * Dates generator helper for knockout rounds
 */
function mapStatus(s?: string): 'UPCOMING' | 'COMPLETED' | 'LIVE' {
  if (s === 'COMPLETED') return 'COMPLETED';
  if (s === 'PLAYING') return 'LIVE';
  return 'UPCOMING';
}

function getMatchDate(roundIndex: number, matchIndex: number): string {
  const dates = [
    ['4 Jul', '5 Jul', '6 Jul', '7 Jul'], // QF / R16
    ['10 Jul', '11 Jul'],                 // SF
    ['15 Jul'],                            // Final
  ];
  return dates[roundIndex]?.[matchIndex] || `${4 + roundIndex * 3} Jul`;
}

/**
 * Converts tournament state knockout matches into the data-driven BracketMatch[] array format:
 * { id, round, date, teamA, teamB, scoreA, scoreB, winner, result, nextMatchId }
 */
export function convertTournamentToBracketMatches(state: WorldCupTournamentState): BracketMatch[] {
  const matches: BracketMatch[] = [];
  const userTeamId = state.userTeamId;

  const qfs = state.knockouts?.quarterFinals || [];
  const sfs = state.knockouts?.semiFinals || [];
  const finalMatch = state.knockouts?.finalMatch || null;

  // 1. Quarterfinals (4 matches)
  for (let i = 0; i < 4; i++) {
    const m = qfs[i] || null;
    const teamA = m ? mapTeamToBracketTeam(m.team1Id, userTeamId) : null;
    const teamB = m ? mapTeamToBracketTeam(m.team2Id, userTeamId) : null;

    let scoreA: BracketScore | null = null;
    let scoreB: BracketScore | null = null;

    if (m?.team1Score) {
      scoreA = {
        runs: m.team1Score.runs,
        wickets: m.team1Score.wickets,
        overs: m.team1Score.overs || state.oversPerMatch,
      };
    }

    if (m?.team2Score) {
      scoreB = {
        runs: m.team2Score.runs,
        wickets: m.team2Score.wickets,
        overs: m.team2Score.overs || state.oversPerMatch,
      };
    }

    const nextMatchId = i < 2 ? 'sf-1' : 'sf-2';
    const nextMatchSlot = i % 2 === 0 ? 'A' : 'B';

    const isTie = Boolean(
      scoreA &&
        scoreB &&
        scoreA.runs === scoreB.runs &&
        m?.status === 'COMPLETED'
    );

    matches.push({
      id: m?.id || `qf-${i + 1}`,
      round: 'Quarterfinals',
      roundIndex: 0,
      matchIndexInRound: i,
      date: getMatchDate(0, i),
      timeOrStatus: m?.status === 'COMPLETED' ? 'Result' : m?.status === 'PLAYING' ? 'Live' : '18:00 GMT',
      status: mapStatus(m?.status),
      teamA,
      teamB,
      scoreA,
      scoreB,
      winner: m?.winnerTeamId || null,
      result: m?.resultSummary || (m?.status === 'UPCOMING' ? 'Scheduled at ' + (m.venue || 'Host Stadium') : ''),
      nextMatchId,
      nextMatchSlot,
      isTie,
      isSuperOver: isTie || m?.resultSummary?.toLowerCase().includes('super over'),
      venue: m?.venue || state.hostCountry?.venues[i % (state.hostCountry?.venues.length || 1)] || 'Host Venue',
      isUserMatch: Boolean(m?.isUserMatch || teamA?.isUserTeam || teamB?.isUserTeam),
      momPlayer: m?.momPlayer,
    });
  }

  // 2. Semifinals (2 matches)
  for (let i = 0; i < 2; i++) {
    const m = sfs[i] || null;

    // Auto-advance teamA and teamB from QF winners if not explicitly set
    let teamAId = m?.team1Id;
    let teamBId = m?.team2Id;

    if (!teamAId) {
      const qfFeederA = matches.find((q) => q.nextMatchId === `sf-${i + 1}` && q.nextMatchSlot === 'A');
      teamAId = qfFeederA?.winner || undefined;
    }
    if (!teamBId) {
      const qfFeederB = matches.find((q) => q.nextMatchId === `sf-${i + 1}` && q.nextMatchSlot === 'B');
      teamBId = qfFeederB?.winner || undefined;
    }

    const teamA = mapTeamToBracketTeam(teamAId, userTeamId);
    const teamB = mapTeamToBracketTeam(teamBId, userTeamId);

    let scoreA: BracketScore | null = null;
    let scoreB: BracketScore | null = null;

    if (m?.team1Score) {
      scoreA = {
        runs: m.team1Score.runs,
        wickets: m.team1Score.wickets,
        overs: m.team1Score.overs || state.oversPerMatch,
      };
    }

    if (m?.team2Score) {
      scoreB = {
        runs: m.team2Score.runs,
        wickets: m.team2Score.wickets,
        overs: m.team2Score.overs || state.oversPerMatch,
      };
    }

    const isTie = Boolean(
      scoreA &&
        scoreB &&
        scoreA.runs === scoreB.runs &&
        m?.status === 'COMPLETED'
    );

    matches.push({
      id: m?.id || `sf-${i + 1}`,
      round: 'Semifinals',
      roundIndex: 1,
      matchIndexInRound: i,
      date: getMatchDate(1, i),
      timeOrStatus: m?.status === 'COMPLETED' ? 'Result' : m?.status === 'PLAYING' ? 'Live' : '18:30 GMT',
      status: mapStatus(m?.status),
      teamA,
      teamB,
      scoreA,
      scoreB,
      winner: m?.winnerTeamId || null,
      result: m?.resultSummary || (teamA && teamB ? 'Scheduled at ' + (m?.venue || 'Semi Final Stadium') : 'Winner QF advances'),
      nextMatchId: 'final-match',
      nextMatchSlot: i === 0 ? 'A' : 'B',
      isTie,
      isSuperOver: isTie || m?.resultSummary?.toLowerCase().includes('super over'),
      venue: m?.venue || state.hostCountry?.venues[(4 + i) % (state.hostCountry?.venues.length || 1)] || 'Semi Venue',
      isUserMatch: Boolean(m?.isUserMatch || teamA?.isUserTeam || teamB?.isUserTeam),
      momPlayer: m?.momPlayer,
    });
  }

  // 3. Final (1 match)
  const f = finalMatch;
  let finalTeamAId = f?.team1Id;
  let finalTeamBId = f?.team2Id;

  if (!finalTeamAId) {
    const sf1 = matches.find((m) => m.id === 'sf-1');
    finalTeamAId = sf1?.winner || undefined;
  }

  if (!finalTeamBId) {
    const sf2 = matches.find((m) => m.id === 'sf-2');
    finalTeamBId = sf2?.winner || undefined;
  }

  const teamA = mapTeamToBracketTeam(finalTeamAId, userTeamId);
  const teamB = mapTeamToBracketTeam(finalTeamBId, userTeamId);

  let scoreA: BracketScore | null = null;
  let scoreB: BracketScore | null = null;

  if (f?.team1Score) {
    scoreA = {
      runs: f.team1Score.runs,
      wickets: f.team1Score.wickets,
      overs: f.team1Score.overs || state.oversPerMatch,
    };
  }

  if (f?.team2Score) {
    scoreB = {
      runs: f.team2Score.runs,
      wickets: f.team2Score.wickets,
      overs: f.team2Score.overs || state.oversPerMatch,
    };
  }

  const isTie = Boolean(
    scoreA &&
      scoreB &&
      scoreA.runs === scoreB.runs &&
      f?.status === 'COMPLETED'
  );

  matches.push({
    id: f?.id || 'final-match',
    round: 'Final',
    roundIndex: 2,
    matchIndexInRound: 0,
    date: getMatchDate(2, 0),
    timeOrStatus: f?.status === 'COMPLETED' ? 'Result' : f?.status === 'PLAYING' ? 'Live' : '19:00 GMT',
    status: mapStatus(f?.status),
    teamA,
    teamB,
    scoreA,
    scoreB,
    winner: f?.winnerTeamId || null,
    result: f?.resultSummary || (teamA && teamB ? "Grand Final at Lord's" : 'Semi Final Winners advance'),
    nextMatchId: undefined,
    isTie,
    isSuperOver: isTie || f?.resultSummary?.toLowerCase().includes('super over'),
    venue: f?.venue || state.hostCountry?.venues[0] || "Lord's, London",
    isUserMatch: Boolean(f?.isUserMatch || teamA?.isUserTeam || teamB?.isUserTeam),
    momPlayer: f?.momPlayer,
  });

  return matches;
}
