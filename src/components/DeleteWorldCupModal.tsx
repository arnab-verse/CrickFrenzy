import React from 'react';
import { soundFx } from '../utils/audio';

interface DeleteWorldCupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  title?: string;
  itemLabel?: string;
}

export const DeleteWorldCupModal: React.FC<DeleteWorldCupModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
  title = 'Delete World Cup Edition?',
  itemLabel = 'World Cup',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-rose-500/50 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col gap-5">
        
        {/* Modal Header */}
        <div className="flex items-center gap-3.5 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center text-2xl shrink-0 shadow-inner">
            🗑️
          </div>
          <div>
            <h2 className="text-xl font-black text-white font-['Teko',sans-serif] uppercase tracking-wide leading-tight">
              {title}
            </h2>
            <p className="text-xs text-rose-300/90 font-medium">
              This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Warning Content */}
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          <p className="font-semibold text-slate-200">
            Deleting this edition will permanently erase all progress made so far in this {itemLabel}, including:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono text-[11px]">
            <li>Group stage standings & points table</li>
            <li>All completed match scores & summaries</li>
            <li>Quarter-Finals & Knockout brackets</li>
            <li>Personal tournament statistics & runs</li>
          </ul>
          <p className="text-amber-400 font-medium pt-1">
            Do you want to reset and start a brand new {itemLabel}?
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              soundFx.playUiClick();
              onClose();
            }}
            className="flex-1 min-h-[44px] py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all active:scale-95 border border-slate-700 flex items-center justify-center cursor-pointer"
          >
            Keep Progress
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playUiClick();
              onConfirmDelete();
            }}
            className="flex-1 min-h-[44px] py-3 px-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black rounded-xl text-xs transition-all shadow-lg shadow-rose-600/30 active:scale-95 border border-rose-500/40 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>🗑️</span>
            <span>Yes, Reset & Start New</span>
          </button>
        </div>

      </div>
    </div>
  );
};
