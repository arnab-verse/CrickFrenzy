import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  getPlayerStats,
  getUserMatchHistory,
  getUserTournaments,
  UserPlayerStats,
  FirestoreMatchRecord,
  FirestoreTournamentRecord,
} from '../lib/firebase';
import { getGuestStats, getGuestMatches } from '../lib/guestProfile';
import { soundFx } from '../utils/audio';
import {
  BarChart3,
  X,
  TrendingUp,
  FileText,
  Trophy,
  Activity,
  Award,
} from 'lucide-react';

interface PlayerStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  onOpenAuth: () => void;
}

export const PlayerStatsModal: React.FC<PlayerStatsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'STATS' | 'MATCHES' | 'TOURNAMENTS'>('STATS');
  const [stats, setStats] = useState<UserPlayerStats | null>(null);
  const [matches, setMatches] = useState<FirestoreMatchRecord[]>([]);
  const [tournaments, setTournaments] = useState<FirestoreTournamentRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (currentUser) {
        fetchUserData();
      } else {
        setLoading(false);
        setStats(getGuestStats());
        setMatches(getGuestMatches());
        setTournaments([]);
      }
    }
  }, [isOpen, currentUser]);

  const fetchUserData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [playerStats, matchHistory, tourneyRecords] = await Promise.all([
        getPlayerStats(currentUser.uid),
        getUserMatchHistory(currentUser.uid),
        getUserTournaments(currentUser.uid),
      ]);
      setStats(playerStats);
      setMatches(matchHistory);
      setTournaments(tourneyRecords);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const winRate =
    stats && stats.matchesPlayed > 0
      ? Math.round((stats.matchesWon / stats.matchesPlayed) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-[fade-in_0.2s_ease-out]">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-amber-400 font-cinzel uppercase tracking-wider leading-tight">
                RECORDS & PLAYER STATS
              </h2>
              <p className="text-xs text-slate-400">
                {currentUser ? `Career profile for ${currentUser.displayName || currentUser.email}` : 'Guest Profile'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playUiClick();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-base transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 mb-4">
          <button
            type="button"
            onClick={() => {
              soundFx.playUiClick();
              setActiveTab('STATS');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'STATS'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>OVERVIEW</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundFx.playUiClick();
              setActiveTab('MATCHES');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'MATCHES'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>MATCH LOGS ({matches.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundFx.playUiClick();
              setActiveTab('TOURNAMENTS');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'TOURNAMENTS'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>TOURNAMENTS ({tournaments.length})</span>
          </button>
        </div>

        {/* Guest Banner if not logged in */}
        {!currentUser && (
          <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-800 to-slate-800 border border-amber-500/40 flex items-center justify-between gap-3 shrink-0">
            <div className="text-left">
              <div className="text-xs font-bold text-amber-300">Sync Stats & Tournament Data</div>
              <div className="text-[11px] text-slate-300">
                Sign in with Google or Google Play to save your match records permanently across devices.
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                soundFx.playUiClick();
                onOpenAuth();
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs tracking-wider uppercase shadow shrink-0 cursor-pointer"
            >
              SIGN IN
            </button>
          </div>
        )}

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-slate-400 font-bold text-sm animate-pulse">
              Loading Player Records from Cloud Firestore...
            </div>
          ) : activeTab === 'STATS' ? (
            /* CAREER OVERVIEW STATS GRID */
            <div className="space-y-4">
              {/* Primary Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-center">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">MATCHES PLAYED</div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1">
                    {stats?.matchesPlayed ?? 0}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-emerald-500/30 text-center">
                  <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">MATCHES WON</div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono mt-1">
                    {stats?.matchesWon ?? 0}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-amber-500/30 text-center">
                  <div className="text-xs text-amber-300 font-bold uppercase tracking-wider">WIN RATE</div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono mt-1">
                    {winRate}%
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-yellow-500/30 text-center">
                  <div className="text-xs text-yellow-400 font-bold uppercase tracking-wider">TROPHIES WON</div>
                  <div className="text-2xl sm:text-3xl font-black text-yellow-300 font-mono mt-1 flex items-center justify-center gap-1.5">
                    <Award className="w-5 h-5 text-yellow-400" />
                    <span>{stats?.tournamentsWon ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Detailed Batting & Bowling Metrics */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-left space-y-3">
                <h3 className="text-xs font-black text-amber-400 font-cinzel uppercase tracking-wider border-b border-slate-700 pb-1.5 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>BATTING & BOWLING RECORDS</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="text-[11px] text-slate-400 font-semibold">TOTAL RUNS SCORED</div>
                    <div className="text-lg font-black text-white font-mono">{stats?.totalRunsScored ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-semibold">HIGHEST SCORE</div>
                    <div className="text-lg font-black text-amber-300 font-mono">{stats?.highestScore ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-semibold">TOTAL WICKETS</div>
                    <div className="text-lg font-black text-emerald-400 font-mono">{stats?.totalWicketsTaken ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-semibold">TOTAL FOURS (4s)</div>
                    <div className="text-lg font-black text-blue-300 font-mono">{stats?.totalFours ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-semibold">TOTAL SIXES (6s)</div>
                    <div className="text-lg font-black text-amber-400 font-mono">{stats?.totalSixes ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-semibold">TOURNAMENTS PLAYED</div>
                    <div className="text-lg font-black text-yellow-400 font-mono">{stats?.tournamentsPlayed ?? 0}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'MATCHES' ? (
            /* MATCH HISTORY LOGS LIST */
            <div className="space-y-2.5">
              {matches.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No saved match logs yet. Complete a Quick Match, World Cup, or ICL match to record history!
                </div>
              ) : (
                matches.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-between gap-3 text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-amber-300 font-cinzel">
                          {m.mode.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {m.teamSelected} <span className="text-slate-400 text-xs">vs</span> {m.opponentTeam}
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5">
                        Scores: {m.userRuns}/{m.userWickets} ({m.userOvers} ov) vs {m.opponentRuns}/{m.opponentWickets} ({m.opponentOvers} ov)
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                          m.result === 'WON'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {m.result}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* TOURNAMENT HISTORY LIST */
            <div className="space-y-2.5">
              {tournaments.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No active or completed tournament records found. Start a World Cup or Indian Cricket League tournament!
                </div>
              ) : (
                tournaments.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-between gap-3 text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-amber-300 font-cinzel">
                          {t.type === 'WORLD_CUP' ? 'WORLD CUP 2026' : 'INDIAN CRICKET LEAGUE (ICL)'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Updated {new Date(t.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        Team: <span className="text-amber-300">{t.team}</span>
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5">
                        Matches: {t.matchesPlayed} • Wins: {t.wins} • Losses: {t.losses}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                          t.status === 'WON'
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                            : t.status === 'ONGOING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
