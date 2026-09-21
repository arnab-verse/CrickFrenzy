/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { User, Target, Zap, Play } from 'lucide-react';
import { BowlerProfile } from '../config/bowlerProfiles';
import { FieldingSetup } from '../config/fieldingPresets';
import { GameState } from '../types';

interface OverBowlerIntroOverlayProps {
  isOpen: boolean;
  overNumber: number; // 1-indexed (Over 1, Over 2...)
  totalOvers: number;
  bowler: BowlerProfile;
  fieldingSetup: FieldingSetup;
  gameState: GameState;
  onStartOver: () => void;
}

const OverBowlerIntroOverlayComponent: React.FC<OverBowlerIntroOverlayProps> = ({
  isOpen,
  overNumber,
  totalOvers,
  bowler,
  fieldingSetup,
  gameState,
  onStartOver,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(5);

  useEffect(() => {
    if (!isOpen) return;
    setSecondsRemaining(5);

    let currentSeconds = 5;
    const interval = setInterval(() => {
      currentSeconds -= 1;
      setSecondsRemaining(currentSeconds);
      if (currentSeconds <= 0) {
        clearInterval(interval);
        onStartOver();
      }
    }, 1000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onStartOver();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onStartOver, overNumber]);

  if (!isOpen) return null;

  const isPractice = !!gameState.config.isPracticeMode;
  const isUnlimitedOvers = totalOvers === 0 || !Number.isFinite(totalOvers) || isPractice;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-4 select-none animate-fadeIn">
      <div
        id="over-bowler-intro-card"
        className="w-full max-w-md bg-slate-900 border border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/10 transform animate-scaleUp text-slate-100 p-6 gap-6"
      >
        {/* Card Header */}
        <div className="text-center space-y-1">
          <div className="text-[10px] font-black uppercase tracking-widest text-amber-500">
            {isPractice ? 'PRACTICE NETS • NEW SPELL' : `OVER ${overNumber} OF ${isUnlimitedOvers ? 'UNLIMITED' : totalOvers}`}
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white uppercase">
            Upcoming Bowler
          </h2>
        </div>

        {/* Bowler Details Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600/20 to-slate-800 border-2 border-amber-500/50 flex items-center justify-center shadow-md">
            <User className="w-8 h-8 text-amber-400" />
          </div>
          
          <div>
            <h3 className="text-xl font-extrabold text-white">
              {bowler.name}
            </h3>
            <p className="text-sm text-amber-400 font-semibold mt-0.5">
              {bowler.styleLabel} <span className="text-slate-600 font-normal">•</span> <span className="font-mono text-emerald-400 font-bold">{bowler.speedRange}</span>
            </p>
          </div>
        </div>

        {/* Variations List */}
        <div className="space-y-2">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 justify-center">
            <Target className="w-3.5 h-3.5 text-amber-400" /> Bowling Variations:
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {bowler.weapons && bowler.weapons.map((w, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg bg-slate-800 text-cyan-200 border border-slate-700/60 text-xs font-bold flex items-center gap-1"
              >
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>{w}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Action Button & Timer */}
        <div className="space-y-2.5">
          <button
            id="start-facing-over-btn"
            type="button"
            onClick={onStartOver}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-yellow-300 via-amber-400 to-amber-500 hover:from-yellow-200 hover:to-amber-400 text-slate-950 font-black text-sm tracking-wider uppercase shadow-lg shadow-amber-500/20 transition-all transform hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>START OVER ({secondsRemaining}s)</span>
          </button>
          
          <div className="text-center text-[10px] text-slate-500 font-medium">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">Space</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">Enter</kbd> to skip intro
          </div>
        </div>
      </div>
    </div>
  );
};

export const OverBowlerIntroOverlay = React.memo(OverBowlerIntroOverlayComponent);
