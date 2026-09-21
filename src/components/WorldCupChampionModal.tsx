import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Home, BarChart3 } from 'lucide-react';
import { getTeamById } from '../tournament/teamsData';
import { WorldCupTournamentState } from '../tournament/types';
import { soundFx } from '../utils/audio';
import { TeamBadge } from './TeamBadge';

interface WorldCupChampionModalProps {
  isOpen: boolean;
  tournament: WorldCupTournamentState;
  onReturnToHub: () => void;
  onReturnHome: () => void;
}

export const WorldCupChampionModal: React.FC<WorldCupChampionModalProps> = ({
  isOpen,
  tournament,
  onReturnToHub,
  onReturnHome,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    soundFx.playBoundaryHorn();
    soundFx.playCrowdCheer(true);

    // Trigger champion confetti bursts
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#facc15', '#eab308', '#ca8a04', '#ffffff'],
    });
    fire(0.2, {
      spread: 60,
      colors: ['#38bdf8', '#818cf8', '#ec4899', '#f59e0b'],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      colors: ['#ffd700', '#ffae19', '#ffffff'],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const isIPL = tournament.tournamentType === 'IPL';
  const userTeam = getTeamById(tournament.userTeamId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-amber-400 rounded-3xl shadow-2xl p-6 text-center space-y-5 overflow-hidden">
        
        {/* Glow ambient background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy Visual */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/50 border-2 border-amber-200 animate-bounce">
            <Trophy className="w-12 h-12 text-slate-950" />
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-950 border border-amber-400 text-amber-300 text-[10px] font-black uppercase tracking-widest shadow">
            {isIPL ? 'IPL Champions' : 'World Champions'}
          </span>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <TeamBadge team={userTeam} size="md" />
            <h2 className="text-3xl sm:text-4xl font-black italic tracking-tight text-amber-400 font-['Teko',sans-serif] uppercase leading-none">
              {userTeam.name} Are Champions!
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {isIPL
              ? 'Congratulations! You conquered all 10 franchises through 9 intense league rounds, the Playoffs, and lifted the prestigious IPL Trophy!'
              : 'Congratulations! You conquered 20 nations through the Group Stages, Quarter-Finals, Semi-Finals, and lifted the World Cup!'}
          </p>
        </div>

        {/* Tournament Performance Recap */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Runs</span>
            <span className="text-xl font-black text-amber-400">{tournament.tournamentStats.userRuns}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Sixes (6s)</span>
            <span className="text-xl font-black text-purple-400">{tournament.tournamentStats.userSixes}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Fours (4s)</span>
            <span className="text-xl font-black text-yellow-300">{tournament.tournamentStats.userFours}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onReturnHome}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Title Menu</span>
          </button>

          <button
            type="button"
            onClick={onReturnToHub}
            className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-amber-500 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <BarChart3 className="w-4 h-4" />
            <span>View Tournament Hub</span>
          </button>
        </div>

      </div>
    </div>
  );
};
