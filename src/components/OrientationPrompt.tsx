import React, { useState } from 'react';

interface OrientationPromptProps {
  onEnterFullscreenLandscape?: () => void;
}

export const OrientationPrompt: React.FC<OrientationPromptProps> = ({
  onEnterFullscreenLandscape,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed top-3 inset-x-3 z-40 sm:max-w-md sm:mx-auto bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/40 rounded-2xl p-3 shadow-2xl animate-fade-in text-slate-100 flex items-center justify-between gap-3 select-none">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center flex-shrink-0 text-xl animate-pulse">
          🔄
        </div>
        <div className="min-w-0">
          <div className="text-xs font-black text-amber-300 tracking-tight flex items-center gap-1.5">
            <span>ROTATE TO LANDSCAPE</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-amber-400/20 text-amber-300 rounded font-semibold">
              BEST EXP
            </span>
          </div>
          <div className="text-[11px] text-slate-300 truncate">
            Turn phone horizontally for dual-thumb console controls!
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        {onEnterFullscreenLandscape && (
          <button
            type="button"
            onClick={onEnterFullscreenLandscape}
            className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            title="Switch to fullscreen landscape"
          >
            Rotate 📱
          </button>
        )}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer"
          aria-label="Dismiss orientation tip"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
