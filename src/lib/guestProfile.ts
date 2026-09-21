import { UserPlayerStats, FirestoreMatchRecord, recordCompletedMatchInFirestore, getPlayerStats } from './firebase';

const GUEST_STATS_KEY = 'crickfrenzy_guest_stats';
const GUEST_MATCHES_KEY = 'crickfrenzy_guest_matches';

const DEFAULT_GUEST_STATS: UserPlayerStats = {
  uid: 'guest_player',
  displayName: 'Guest Player',
  email: 'guest@crickfrenzy.local',
  matchesPlayed: 0,
  matchesWon: 0,
  matchesLost: 0,
  tournamentsPlayed: 0,
  tournamentsWon: 0,
  totalRunsScored: 0,
  totalWicketsTaken: 0,
  totalFours: 0,
  totalSixes: 0,
  highestScore: 0,
  bestBowling: '0/0',
  totalBallsFaced: 0,
};

export function getGuestStats(): UserPlayerStats {
  try {
    const raw = localStorage.getItem(GUEST_STATS_KEY);
    if (!raw) return { ...DEFAULT_GUEST_STATS };
    return { ...DEFAULT_GUEST_STATS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_GUEST_STATS };
  }
}

export function saveGuestStats(stats: UserPlayerStats): void {
  try {
    localStorage.setItem(GUEST_STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn('Could not persist guest stats to localStorage:', e);
  }
}

export function getGuestMatches(): FirestoreMatchRecord[] {
  try {
    const raw = localStorage.getItem(GUEST_MATCHES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function recordGuestMatch(
  matchData: Omit<FirestoreMatchRecord, 'id' | 'userId' | 'createdAt'>
): FirestoreMatchRecord {
  const matchId = `guest_match_${Date.now()}`;
  const record: FirestoreMatchRecord = {
    ...matchData,
    id: matchId,
    userId: 'guest_player',
    createdAt: new Date().toISOString(),
  };

  try {
    const matches = getGuestMatches();
    matches.unshift(record);
    // Keep last 40 matches in local storage
    localStorage.setItem(GUEST_MATCHES_KEY, JSON.stringify(matches.slice(0, 40)));

    // Update guest cumulative statistics
    const stats = getGuestStats();
    const isWin = matchData.result === 'WON';
    const isLoss = matchData.result === 'LOST';

    stats.matchesPlayed += 1;
    if (isWin) stats.matchesWon += 1;
    if (isLoss) stats.matchesLost += 1;
    stats.totalRunsScored += matchData.userRuns || 0;
    stats.totalWicketsTaken += matchData.userWickets || 0;
    stats.highestScore = Math.max(stats.highestScore, matchData.userRuns || 0);
    stats.updatedAt = new Date().toISOString();

    saveGuestStats(stats);
  } catch (e) {
    console.warn('Failed to record guest match locally:', e);
  }

  return record;
}

/**
 * When user signs in with Google, merges any guest match records to their cloud account
 */
export async function syncGuestDataToCloud(userId: string): Promise<void> {
  try {
    const guestMatches = getGuestMatches();
    if (guestMatches.length === 0) return;

    // Upload guest matches to Firestore
    for (const match of guestMatches.slice(0, 10)) {
      await recordCompletedMatchInFirestore(userId, {
        mode: match.mode,
        teamSelected: match.teamSelected,
        opponentTeam: match.opponentTeam,
        userRuns: match.userRuns,
        userWickets: match.userWickets,
        userOvers: match.userOvers,
        target: match.target,
        opponentRuns: match.opponentRuns,
        opponentWickets: match.opponentWickets,
        opponentOvers: match.opponentOvers,
        result: match.result,
        resultText: match.resultText,
      });
    }

    // Clear guest matches after successful sync
    localStorage.removeItem(GUEST_MATCHES_KEY);
  } catch (err) {
    console.warn('Could not sync guest matches to cloud:', err);
  }
}
