import React from 'react';
import { MapPin, X, Zap, Award, Play } from 'lucide-react';
import { BracketMatch } from '../tournament/bracketTypes';
import { TeamBadge } from './TeamBadge';

interface MatchScorecardModalProps {
  match: BracketMatch | null;
  onClose: () => void;
  onPlayMatch?: (matchId: string) => void;
}

export const MatchScorecardModal: React.FC<MatchScorecardModalProps> = ({
  match,
  onClose,
  onPlayMatch,
}) => {
  if (!match) return null;

  const teamA = match.teamA;
  const teamB = match.teamB;

  const isCompleted = match.status === 'COMPLETED';
  const isWinnerA = match.winner === teamA?.id;
  const isWinnerB = match.winner === teamB?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#2a2d35] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 space-y-0">
        
        {/* Top Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-[#1f2229] to-slate-900 border-b border-slate-700/80 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">
              {match.round} • {match.date}
            </span>
            <div className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{match.venue || 'Host Stadium'}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Status / Super Over Badges */}
          <div className="flex items-center justify-between">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : match.status === 'LIVE'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {isCompleted ? 'Result' : match.status === 'LIVE' ? 'LIVE' : match.timeOrStatus || 'Upcoming'}
            </span>

            {match.isSuperOver && (
              <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/50 text-amber-300 rounded-full text-[11px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Super Over (SO)</span>
              </span>
            )}
          </div>

          {/* Teams Showcase Grid */}
          <div className="grid grid-cols-1 gap-3">
            {/* Team A Row */}
            <div
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                isWinnerA
                  ? 'bg-gradient-to-r from-emerald-950/60 to-slate-800 border-emerald-500/60 text-white font-bold shadow-lg shadow-emerald-950/20'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <TeamBadge team={teamA} size="md" />
                <div>
                  <div className={`text-base ${isWinnerA ? 'font-black text-white' : 'font-semibold text-slate-300'}`}>
                    {teamA?.name || 'TBD'}
                  </div>
                  {teamA?.isUserTeam && (
                    <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest">
                      Your Team
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                {match.scoreA ? (
                  <div className="space-y-0.5">
                    <div className="text-xl font-black font-mono tracking-tight text-white flex items-center gap-1 justify-end">
                      {isWinnerA && <span className="text-amber-400 text-xs">◀</span>}
                      <span>
                        {match.scoreA.runs}/{match.scoreA.wickets}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">({match.scoreA.overs} ov)</div>
                  </div>
                ) : (
                  <span className="text-sm text-slate-500 italic font-mono">-</span>
                )}
              </div>
            </div>

            {/* Team B Row */}
            <div
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                isWinnerB
                  ? 'bg-gradient-to-r from-emerald-950/60 to-slate-800 border-emerald-500/60 text-white font-bold shadow-lg shadow-emerald-950/20'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <TeamBadge team={teamB} size="md" />
                <div>
                  <div className={`text-base ${isWinnerB ? 'font-black text-white' : 'font-semibold text-slate-300'}`}>
                    {teamB?.name || 'TBD'}
                  </div>
                  {teamB?.isUserTeam && (
                    <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest">
                      Your Team
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                {match.scoreB ? (
                  <div className="space-y-0.5">
                    <div className="text-xl font-black font-mono tracking-tight text-white flex items-center gap-1 justify-end">
                      {isWinnerB && <span className="text-amber-400 text-xs">◀</span>}
                      <span>
                        {match.scoreB.runs}/{match.scoreB.wickets}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">({match.scoreB.overs} ov)</div>
                  </div>
                ) : (
                  <span className="text-sm text-slate-500 italic font-mono">-</span>
                )}
              </div>
            </div>
          </div>

          {/* Result Summary */}
          {match.result && (
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-1">
              <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Match Outcome</div>
              <div className="text-sm font-black text-amber-300">{match.result}</div>
            </div>
          )}

          {/* Man of the match if completed */}
          {match.momPlayer && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
              <span className="text-amber-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Player of the Match</span>
              </span>
              <span className="font-bold text-white">{match.momPlayer}</span>
            </div>
          )}

          {/* Action Button if Playable */}
          {!isCompleted && match.isUserMatch && teamA && teamB && onPlayMatch && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onPlayMatch(match.id);
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl transform hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer font-['Teko',sans-serif]"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>PLAY MATCH NOW</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
