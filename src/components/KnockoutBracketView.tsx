import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Trophy, Play } from 'lucide-react';
import { BracketMatch } from '../tournament/bracketTypes';
import { MatchScorecardModal } from './MatchScorecardModal';
import { TeamBadge } from './TeamBadge';

interface KnockoutBracketViewProps {
  matches?: BracketMatch[];
  userTeamId?: string;
  onPlayMatch?: (matchId: string) => void;
}

// Layout constants for mathematical bracket alignment matching Google Sports UI
const CARD_WIDTH = 270; // px
const CARD_HEIGHT = 124; // px
const CARD_GAP = 28; // px
const COLUMN_GAP = 60; // px for SVG connector lines

export const KnockoutBracketView: React.FC<KnockoutBracketViewProps> = ({
  matches: propMatches,
  userTeamId,
  onPlayMatch,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedMatch, setSelectedMatch] = useState<BracketMatch | null>(null);

  // Group matches by round
  const { rounds, currentRoundIndex } = useMemo(() => {
    const rawMatches = propMatches || [];
    const roundMap: Record<string, BracketMatch[]> = {};
    const roundNames: string[] = [];

    // Identify distinct rounds in logical order
    const standardOrder = ['Round of 16', 'Quarterfinals', 'Semifinals', 'Final'];

    rawMatches.forEach((m) => {
      const rName = m.round || 'Knockouts';
      if (!roundMap[rName]) {
        roundMap[rName] = [];
        roundNames.push(rName);
      }
      roundMap[rName].push(m);
    });

    // Sort round names by standard order
    roundNames.sort((a, b) => {
      const idxA = standardOrder.indexOf(a);
      const idxB = standardOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return 0;
    });

    // Find current active round index
    let activeIdx = 0;
    roundNames.forEach((rName, idx) => {
      const ms = roundMap[rName];
      if (ms.some((m) => m.status === 'LIVE' || m.status === 'UPCOMING')) {
        activeIdx = idx;
      }
    });

    return {
      rounds: roundNames.map((rName, idx) => ({
        name: rName,
        index: idx,
        matches: roundMap[rName],
      })),
      currentRoundIndex: activeIdx,
    };
  }, [propMatches]);

  // Find overall champion if final is finished
  const finalRound = rounds.find((r) => r.name === 'Final');
  const finalMatch = finalRound?.matches[0];
  const championTeam = useMemo(() => {
    if (!finalMatch || finalMatch.status !== 'COMPLETED' || !finalMatch.winner) return null;
    if (finalMatch.winner === finalMatch.teamA?.id) return finalMatch.teamA;
    if (finalMatch.winner === finalMatch.teamB?.id) return finalMatch.teamB;
    return null;
  }, [finalMatch]);

  // Auto-scroll horizontally to active round on mount
  useEffect(() => {
    if (containerRef.current && rounds.length > 0) {
      const scrollTarget = currentRoundIndex * (CARD_WIDTH + COLUMN_GAP);
      containerRef.current.scrollTo({
        left: scrollTarget,
        behavior: 'smooth',
      });
    }
  }, [currentRoundIndex, rounds.length]);

  // Calculate top Y offset for each match card in a column to achieve recursive vertical centering
  const getCardYOffset = (roundIdx: number, matchIdx: number): number => {
    if (roundIdx === 0) {
      // First round (e.g. Quarterfinals) stacked evenly
      return matchIdx * (CARD_HEIGHT + CARD_GAP);
    }

    // Subsequent round cards sit centered between their two feeder matches in previous round
    const feeder1Y = getCardYOffset(roundIdx - 1, matchIdx * 2);
    const feeder2Y = getCardYOffset(roundIdx - 1, matchIdx * 2 + 1);

    const center1 = feeder1Y + CARD_HEIGHT / 2;
    const center2 = feeder2Y + CARD_HEIGHT / 2;
    const midCenter = (center1 + center2) / 2;

    return midCenter - CARD_HEIGHT / 2;
  };

  // Calculate total container height based on first column
  const firstRoundMatchesCount = rounds[0]?.matches.length || 4;
  const totalContainerHeight = Math.max(
    560,
    firstRoundMatchesCount * (CARD_HEIGHT + CARD_GAP)
  );

  const finalRoundIndex = rounds.length - 1;
  const finalY = rounds.length > 0 ? getCardYOffset(finalRoundIndex, 0) + CARD_HEIGHT / 2 : 0;

  return (
    <div className="w-full bg-[#1b1e25] border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 overflow-hidden text-slate-100">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-amber-400 font-['Teko',sans-serif] flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>World Cup Knockout Stage</span>
          </h3>
          <p className="text-xs text-slate-400">
            Official bracket tree • Click any match card to view detailed scorecard
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {rounds.map((r, i) => (
            <button
              key={r.name}
              type="button"
              onClick={() => {
                if (containerRef.current) {
                  containerRef.current.scrollTo({
                    left: i * (CARD_WIDTH + COLUMN_GAP),
                    behavior: 'smooth',
                  });
                }
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                i === currentRoundIndex
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Bracket Canvas Area */}
      <div
        ref={containerRef}
        className="w-full overflow-x-auto overflow-y-hidden pb-6 pt-2 custom-scrollbar scroll-smooth"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#3a3e4b #1b1e25',
        }}
      >
        <div
          className="relative flex items-start"
          style={{
            height: `${totalContainerHeight + 40}px`,
            minWidth: `${(rounds.length + 1) * (CARD_WIDTH + COLUMN_GAP)}px`,
          }}
        >
          {rounds.map((round, rIdx) => {
            const isLastRound = rIdx === rounds.length - 1;

            return (
              <React.Fragment key={round.name}>
                {/* Column for Round */}
                <div
                  className="absolute flex flex-col"
                  style={{
                    left: `${rIdx * (CARD_WIDTH + COLUMN_GAP)}px`,
                    width: `${CARD_WIDTH}px`,
                    top: 0,
                    bottom: 0,
                  }}
                >
                  {/* Round Header */}
                  <div className="sticky top-0 z-10 py-1.5 px-2 bg-[#1b1e25] border-b border-slate-800 mb-2 flex items-center justify-between text-xs">
                    <span className="font-black uppercase tracking-wider text-amber-400 text-xs">
                      {round.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {round.matches.length} {round.matches.length === 1 ? 'Match' : 'Matches'}
                    </span>
                  </div>

                  {/* Match Cards */}
                  {round.matches.map((match, mIdx) => {
                    const yPos = getCardYOffset(rIdx, mIdx);
                    const teamA = match.teamA;
                    const teamB = match.teamB;

                    const isWinnerA = Boolean(match.winner && match.winner === teamA?.id);
                    const isWinnerB = Boolean(match.winner && match.winner === teamB?.id);

                    const isUserMatch =
                      match.isUserMatch ||
                      teamA?.id === userTeamId ||
                      teamB?.id === userTeamId;

                    const isPlayable = match.status === 'SCHEDULED' && isUserMatch;

                    return (
                      <div
                        key={match.id}
                        onClick={() => setSelectedMatch(match)}
                        style={{
                          position: 'absolute',
                          top: `${yPos + 36}px`,
                          left: 0,
                          width: `${CARD_WIDTH}px`,
                          height: `${CARD_HEIGHT}px`,
                        }}
                        className={`rounded-xl bg-[#282a32] border transition-all duration-200 cursor-pointer hover:bg-[#2f333e] flex flex-col justify-between p-2.5 shadow-lg select-none group ${
                          isUserMatch
                            ? 'border-amber-400/90 ring-2 ring-amber-400/30 shadow-amber-500/20'
                            : 'border-[#3a3e4b] hover:border-[#525a6e]'
                        }`}
                      >
                        {/* Header Row */}
                        <div className="flex items-center justify-between text-xs pb-1 border-b border-[#353945]">
                          <span className="text-[#9aa0a6] text-[11px] font-medium tracking-wide">
                            {match.date}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {match.isSuperOver && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold uppercase border border-amber-500/30">
                                SO
                              </span>
                            )}
                            <span className="bg-[#383c48] text-[#d1d5db] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide">
                              {match.status === 'COMPLETED'
                                ? 'FT'
                                : match.status === 'LIVE'
                                ? 'LIVE'
                                : match.timeOrStatus || '18:00'}
                            </span>
                          </div>
                        </div>

                        {/* Team A Row */}
                        <div className="flex items-center justify-between py-0.5 px-1 rounded transition-colors">
                          <div className="flex items-center gap-2 truncate pr-2">
                            {teamA ? (
                              <TeamBadge team={teamA} size="xs" />
                            ) : (
                              <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-500 font-bold shrink-0">?</span>
                            )}
                            <span
                              className={`text-xs truncate ${
                                isWinnerA
                                  ? 'text-white font-bold'
                                  : teamA
                                  ? 'text-[#c4c7c5] font-normal'
                                  : 'text-[#72777d] italic font-normal'
                              }`}
                            >
                              {teamA?.name || 'TBD'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span
                              className={`text-xs font-mono ${
                                isWinnerA ? 'text-white font-bold' : 'text-[#9aa0a6]'
                              }`}
                            >
                              {match.scoreA ? `${match.scoreA.runs}/${match.scoreA.wickets}` : '-'}
                            </span>
                            {isWinnerA && (
                              <span className="text-white text-[10px] font-black leading-none">
                                ◀
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Team B Row */}
                        <div className="flex items-center justify-between py-0.5 px-1 rounded transition-colors">
                          <div className="flex items-center gap-2 truncate pr-2">
                            {teamB ? (
                              <TeamBadge team={teamB} size="xs" />
                            ) : (
                              <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-500 font-bold shrink-0">?</span>
                            )}
                            <span
                              className={`text-xs truncate ${
                                isWinnerB
                                  ? 'text-white font-bold'
                                  : teamB
                                  ? 'text-[#c4c7c5] font-normal'
                                  : 'text-[#72777d] italic font-normal'
                              }`}
                            >
                              {teamB?.name || 'TBD'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span
                              className={`text-xs font-mono ${
                                isWinnerB ? 'text-white font-bold' : 'text-[#9aa0a6]'
                              }`}
                            >
                              {match.scoreB ? `${match.scoreB.runs}/${match.scoreB.wickets}` : '-'}
                            </span>
                            {isWinnerB && (
                              <span className="text-white text-[10px] font-black leading-none">
                                ◀
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Play Action / User Match Footer */}
                        {isPlayable ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayMatch?.(match.id);
                            }}
                            className="w-full mt-1 py-1 rounded bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow transform active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer font-['Teko',sans-serif]"
                          >
                            <Play className="w-3 h-3 fill-slate-950" />
                            <span>PLAY MATCH NOW</span>
                          </button>
                        ) : isUserMatch ? (
                          <div className="text-[9px] text-amber-400 font-bold uppercase tracking-wider text-right pr-1 pt-0.5">
                            YOUR MATCH
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {/* SVG Orthogonal Connector Lines between Column rIdx and Column rIdx + 1 */}
                {!isLastRound && (
                  <svg
                    style={{
                      position: 'absolute',
                      left: `${rIdx * (CARD_WIDTH + COLUMN_GAP) + CARD_WIDTH}px`,
                      top: '36px',
                      width: `${COLUMN_GAP}px`,
                      height: `${totalContainerHeight}px`,
                      pointerEvents: 'none',
                    }}
                  >
                    {round.matches.map((m, mIdx) => {
                      if (mIdx % 2 !== 0) return null; // Process pairs of feeder matches

                      const topY = getCardYOffset(rIdx, mIdx) + CARD_HEIGHT / 2;
                      const bottomY = getCardYOffset(rIdx, mIdx + 1) + CARD_HEIGHT / 2;
                      const midY = (topY + bottomY) / 2;
                      const xMid = COLUMN_GAP / 2;

                      return (
                        <g key={`connector-${rIdx}-${mIdx}`}>
                          {/* Top feeder line out & down */}
                          <path
                            d={`M 0 ${topY} H ${xMid} V ${midY}`}
                            fill="none"
                            stroke="#4f5565"
                            strokeWidth="1.5"
                          />
                          {/* Bottom feeder line out & up */}
                          <path
                            d={`M 0 ${bottomY} H ${xMid} V ${midY}`}
                            fill="none"
                            stroke="#4f5565"
                            strokeWidth="1.5"
                          />
                          {/* Single connector line extending right */}
                          <path
                            d={`M ${xMid} ${midY} H ${COLUMN_GAP}`}
                            fill="none"
                            stroke="#4f5565"
                            strokeWidth="1.5"
                          />
                          {/* Small pointer triangle into receiving card */}
                          <polygon
                            points={`${COLUMN_GAP - 3},${midY - 3} ${COLUMN_GAP},${midY} ${COLUMN_GAP - 3},${midY + 3}`}
                            fill="#4f5565"
                          />
                        </g>
                      );
                    })}
                  </svg>
                )}
              </React.Fragment>
            );
          })}

          {/* Champion Column */}
          <div
            className="absolute flex flex-col"
            style={{
              left: `${rounds.length * (CARD_WIDTH + COLUMN_GAP)}px`,
              width: `${CARD_WIDTH}px`,
              top: 0,
              bottom: 0,
            }}
          >
            {/* Round Header */}
            <div className="sticky top-0 z-10 py-1.5 px-2 bg-[#1b1e25] border-b border-slate-800 mb-2 flex items-center justify-between text-xs">
              <span className="font-black uppercase tracking-wider text-amber-400 text-xs flex items-center gap-1.5">
                <span>Champion</span>
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
              </span>
              <span className="text-[10px] font-mono text-slate-400">Trophy</span>
            </div>

            {/* Connector line from Final to Champion */}
            {rounds.length > 0 && (
              <svg
                style={{
                  position: 'absolute',
                  left: `-${COLUMN_GAP}px`,
                  top: '36px',
                  width: `${COLUMN_GAP}px`,
                  height: `${totalContainerHeight}px`,
                  pointerEvents: 'none',
                }}
              >
                <path
                  d={`M 0 ${finalY} H ${COLUMN_GAP}`}
                  fill="none"
                  stroke={championTeam ? '#f59e0b' : '#4f5565'}
                  strokeWidth="2"
                />
                <polygon
                  points={`${COLUMN_GAP - 3},${finalY - 4} ${COLUMN_GAP},${finalY} ${COLUMN_GAP - 3},${finalY + 4}`}
                  fill={championTeam ? '#f59e0b' : '#4f5565'}
                />
              </svg>
            )}

            {/* Champion Card */}
            <div
              style={{
                position: 'absolute',
                top: `${finalY + 36 - CARD_HEIGHT / 2}px`,
                left: 0,
                width: `${CARD_WIDTH}px`,
                height: `${CARD_HEIGHT}px`,
              }}
              className={`rounded-xl border p-3 flex flex-col items-center justify-center gap-1.5 shadow-xl transition-all ${
                championTeam
                  ? 'bg-gradient-to-br from-amber-500/20 via-[#282a32] to-[#1f2128] border-amber-400 ring-2 ring-amber-400/40 text-amber-300 animate-pulse'
                  : 'bg-[#282a32] border-[#3a3e4b] text-slate-500'
              }`}
            >
              <Trophy className="w-7 h-7 text-amber-400 drop-shadow-md" />
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                {championTeam ? 'WORLD CHAMPION' : 'WORLD CUP TROPHY'}
              </div>
              {championTeam ? (
                <div className="flex items-center gap-2 text-sm font-extrabold text-white">
                  <TeamBadge team={championTeam} size="sm" />
                  <span>{championTeam.name}</span>
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic">Awaiting Grand Final Winner</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tapped Match Scorecard Modal */}
      <MatchScorecardModal
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onPlayMatch={onPlayMatch}
      />
    </div>
  );
};

