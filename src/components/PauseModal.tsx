import React from 'react';
import { GameState } from '../types';

interface PauseModalProps {
  isOpen: boolean;
  state: GameState;
  isMuted: boolean;
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onToggleSound: () => void;
  onReturnHome: () => void;
}

const PauseModalComponent: React.FC<PauseModalProps> = ({
  isOpen,
  state,
  isMuted,
  onResume,
  onRestart,
  onOpenSettings,
  onToggleSound,
  onReturnHome,
}) => {
  if (!isOpen) return null;

  const isPractice = !!state.config.isPracticeMode;
  const isTargetChase = state.config.target !== undefined;
  const isUnlimitedOvers = state.config.totalOvers === 0 || !Number.isFinite(state.config.totalOvers) || isPractice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl shadow-slate-950 text-slate-100 flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Background glow flair */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Pause Badge & Title */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">⏸️</span>
          <span className="text-xs font-black tracking-widest uppercase text-amber-400">
            {isPractice ? 'Practice Session' : 'Match'}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-3">
          {isPractice ? 'PRACTICE PAUSED' : 'GAME PAUSED'}
        </h2>

        {/* Current Score Summary Strip */}
        <div className="w-full bg-slate-950/80 rounded-2xl border border-slate-800 p-3 mb-5 flex items-center justify-around text-center">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Score</div>
            <div className="text-xl font-black text-amber-400 font-mono">
              {state.runs}/{isPractice ? `${state.wickets}w` : state.wickets}
            </div>
          </div>

          <div className="w-px h-8 bg-slate-800" />

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">
              {isUnlimitedOvers ? 'Balls' : 'Overs'}
            </div>
            <div className="text-xl font-black text-slate-200 font-mono">
              {isUnlimitedOvers
                ? `${state.totalLegalBalls}b`
                : `${state.currentOver}.${state.ballInOver} / ${state.config.totalOvers}`}
            </div>
          </div>

          {isTargetChase && (
            <>
              <div className="w-px h-8 bg-slate-800" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Target</div>
                <div className="text-xl font-black text-emerald-400 font-mono">
                  {state.config.target}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons Stack */}
        <div className="w-full flex flex-col gap-2.5">
          {/* Primary Resume Button */}
          <button
            id="pause-resume-btn"
            type="button"
            onClick={onResume}
            title="Resume Game"
            className="w-full min-h-[48px] py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xl uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>▶️</span>
          </button>

          {/* Restart Match Button */}
          <button
            id="pause-restart-btn"
            type="button"
            onClick={onRestart}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-bold text-sm tracking-wide active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🔄</span>
            <span>Restart {isPractice ? 'Session' : 'Match'}</span>
          </button>

          {/* Sound & Format Controls Row */}
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              id="pause-sound-toggle-btn"
              type="button"
              onClick={onToggleSound}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              className="min-h-[44px] py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 font-bold text-base flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>{isMuted ? '🔇' : '🔊'}</span>
            </button>

            <button
              id="pause-setup-btn"
              type="button"
              onClick={onOpenSettings}
              className="min-h-[44px] py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>⚙️</span>
              <span>Match Setup</span>
            </button>
          </div>

          {/* Exit to Main Menu */}
          <button
            id="pause-exit-btn"
            type="button"
            onClick={onReturnHome}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
          >
            <span>🏠</span>
            <span>Exit to Main Menu</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export const PauseModal = React.memo(PauseModalComponent);
