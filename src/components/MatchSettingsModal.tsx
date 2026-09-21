import React, { useState } from 'react';
import { BatterArchetype, BattingStance, MatchConfig, WeatherCondition } from '../types';
import { BATTER_ARCHETYPES } from '../config/batterArchetypes';
import { soundFx } from '../utils/audio';

interface MatchSettingsModalProps {
  currentConfig: MatchConfig;
  isOpen: boolean;
  onClose: () => void;
  onApplyConfig: (config: MatchConfig) => void;
}

export const MatchSettingsModal: React.FC<MatchSettingsModalProps> = ({
  currentConfig,
  isOpen,
  onClose,
  onApplyConfig,
}) => {
  const [totalOvers, setTotalOvers] = useState<number>(currentConfig.totalOvers);
  const [totalWickets, setTotalWickets] = useState<number>(currentConfig.totalWickets);
  const [difficulty, setDifficulty] = useState<'CASUAL' | 'PRO' | 'CHAMPION'>(currentConfig.difficulty);
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>(
    currentConfig.weatherCondition || 'SUNNY'
  );
  const [battingStance, setBattingStance] = useState<BattingStance>(currentConfig.battingStance || 'RIGHT');
  const [batterArchetype, setBatterArchetype] = useState<BatterArchetype>(currentConfig.batterArchetype || 'CLASSICAL');
  const [isChaseMode, setIsChaseMode] = useState<boolean>(currentConfig.target !== undefined);
  const [targetRuns, setTargetRuns] = useState<number>(currentConfig.target || 55);
  const [audioVolume, setAudioVolume] = useState<number>(soundFx.getVolume());
  const [ambientVolume, setAmbientVolume] = useState<number>(soundFx.getAmbientVolume());
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(soundFx.getMuted());

  if (!isOpen) return null;

  const handleSave = () => {
    onApplyConfig({
      ...currentConfig,
      totalOvers,
      totalWickets,
      difficulty,
      weatherCondition,
      battingStance,
      batterArchetype,
      target: isChaseMode ? targetRuns : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col gap-5">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h3 className="font-extrabold text-lg tracking-tight text-white">
              Match Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-base font-bold"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Match Format / Overs */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-semibold uppercase tracking-wider text-slate-400">
                Match Overs
              </label>
              <span className="text-[11px] font-bold text-amber-400 font-mono">
                {totalOvers === 0 ? '∞ Unlimited Overs' : `${totalOvers} Overs (${totalOvers * 6} Balls)`}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { value: 5, label: '5', sub: 'Short' },
                { value: 10, label: '10', sub: 'Standard' },
                { value: 15, label: '15', sub: 'Long' },
                { value: 20, label: '20', sub: 'T20' },
                { value: 0, label: '∞', sub: 'Unlimited' },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTotalOvers(item.value)}
                  className={`py-2 px-1 rounded-xl font-bold border flex flex-col items-center justify-center transition-all ${
                    totalOvers === item.value
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 scale-[1.02]'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm font-black leading-tight">{item.label}</span>
                  <span className={`text-[9px] font-medium leading-none mt-0.5 ${totalOvers === item.value ? 'text-slate-900' : 'text-slate-500'}`}>
                    {item.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Wickets Available */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-semibold uppercase tracking-wider text-slate-400">
                Wickets in Hand
              </label>
              <span className="text-[11px] font-bold text-amber-400 font-mono">
                {totalWickets} Wickets
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 5, title: '5 Wickets', desc: 'Fast-paced & tactical margin for error' },
                { value: 10, title: '10 Wickets', desc: 'Full lineup (Standard cricket innings)' },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTotalWickets(item.value)}
                  className={`p-2.5 rounded-xl font-bold border text-left transition-all ${
                    totalWickets === item.value
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-black">{item.title}</div>
                  <div className={`text-[10px] font-normal leading-tight mt-0.5 ${totalWickets === item.value ? 'text-slate-900' : 'text-slate-500'}`}>
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Weather Condition & Atmosphere */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-semibold uppercase tracking-wider text-slate-400">
                Weather & Conditions
              </label>
              <span className="text-[11px] font-bold text-amber-400 font-mono">
                {weatherCondition === 'SUNNY' && '☀️ Sunny (Clear Daylight)'}
                {weatherCondition === 'OVERCAST' && '⛅ Overcast (+45% Swing)'}
                {weatherCondition === 'RAIN' && '🌧️ Drizzle (Slick Surface)'}
                {weatherCondition === 'NIGHT' && '🌙 Night (Floodlights)'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { value: 'SUNNY' as WeatherCondition, label: 'Sunny', icon: '☀️', desc: 'Clear' },
                { value: 'OVERCAST' as WeatherCondition, label: 'Overcast', icon: '⛅', desc: '+Swing' },
                { value: 'RAIN' as WeatherCondition, label: 'Drizzle', icon: '🌧️', desc: 'Slick' },
                { value: 'NIGHT' as WeatherCondition, label: 'Night', icon: '🌙', desc: 'Lights' },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setWeatherCondition(item.value)}
                  className={`py-2 px-1.5 rounded-xl font-bold border flex flex-col items-center justify-center transition-all ${
                    weatherCondition === item.value
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 scale-[1.02]'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-base leading-none mb-0.5">{item.icon}</span>
                  <span className="text-xs font-black leading-tight">{item.label}</span>
                  <span
                    className={`text-[9px] font-medium leading-none mt-0.5 ${
                      weatherCondition === item.value ? 'text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Batting Stance (Handedness) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-semibold uppercase tracking-wider text-slate-400">
                Batting Stance
              </label>
              <span className="text-[11px] font-bold text-amber-400 font-mono">
                {battingStance === 'RIGHT' ? '🏏 Right-Handed (RHB)' : '🏏 Left-Handed (LHB)'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'RIGHT' as const, label: 'Right-Handed (RHB)', desc: 'Conventional (Off-Right)' },
                { value: 'LEFT' as const, label: 'Left-Handed (LHB)', desc: 'Southpaw (Off-Left)' },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setBattingStance(item.value)}
                  className={`py-2 px-2 rounded-xl font-bold border flex flex-col items-center justify-center transition-all ${
                    battingStance === item.value
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 scale-[1.02]'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-black leading-tight">{item.label}</span>
                  <span
                    className={`text-[9px] font-medium leading-none mt-0.5 ${
                      battingStance === item.value ? 'text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Preset */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Difficulty & Bowling Pace
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['CASUAL', 'PRO', 'CHAMPION'] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    difficulty === diff
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {difficulty === 'CASUAL' && 'Wider timing window (+/- 50ms sweet spot), gentler bowling pace.'}
              {difficulty === 'PRO' && 'Standard authentic Stick Cricket timing (+/- 40ms sweet spot) & progressive speed.'}
              {difficulty === 'CHAMPION' && 'Strict timing (+/- 32ms sweet spot), express 150 km/h yorkers, sharp bouncers.'}
            </p>
          </div>

          {/* Run Chase Toggle */}
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200">Run Chase Target Mode</span>
                <p className="text-[11px] text-slate-500">End match immediately upon chasing target</p>
              </div>
              <input
                type="checkbox"
                checked={isChaseMode}
                onChange={(e) => setIsChaseMode(e.target.checked)}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            {isChaseMode && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Target to Chase:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={10}
                    max={200}
                    value={targetRuns}
                    onChange={(e) => setTargetRuns(Number(e.target.value))}
                    className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-amber-400 text-sm"
                  />
                  <span className="text-slate-400">runs</span>
                </div>
              </div>
            )}
          </div>

          {/* Audio & Loudness Boost Settings */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <span>🔊</span> Sound & Audio Settings
              </span>
              <button
                type="button"
                onClick={() => {
                  const muted = soundFx.toggleMute();
                  setIsAudioMuted(muted);
                }}
                className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-colors ${
                  isAudioMuted
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {isAudioMuted ? 'Muted (OFF)' : 'Enabled (ON)'}
              </button>
            </div>

            {/* Master Game SFX Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-400">Master SFX Volume</span>
                <span className={`font-mono font-bold ${audioVolume > 1.0 ? 'text-amber-400' : 'text-slate-200'}`}>
                  {Math.round(audioVolume * 100)}%{audioVolume > 1.0 ? ' (Boosted Loud)' : ''}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2.0"
                step="0.05"
                value={isAudioMuted ? 0 : audioVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  soundFx.setVolume(val);
                  setAudioVolume(val);
                  if (isAudioMuted && val > 0) {
                    soundFx.toggleMute();
                    setIsAudioMuted(false);
                  }
                }}
                className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-bold px-0.5">
                <span>0%</span>
                <span>100% Normal</span>
                <span className="text-amber-400 font-extrabold">200% MAX BOOST</span>
              </div>
            </div>

            {/* Ambient Audio Slider (Crowd Murmur & Wind Gusts) */}
            <div className="flex flex-col gap-1 pt-2 border-t border-slate-800/80">
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-slate-400 flex items-center gap-1">
                  <span>🍃</span> Ambient Audio (Stadium Murmur & Wind)
                </span>
                <span className={`font-mono font-bold ${ambientVolume > 1.0 ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {isAudioMuted ? '0%' : `${Math.round(ambientVolume * 100)}%`}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Controls subtle background stadium crowd murmur, atmosphere, and occasional natural wind gusts.
              </p>
              <input
                id="ambient-audio-volume-slider"
                type="range"
                min="0"
                max="2.0"
                step="0.05"
                value={isAudioMuted ? 0 : ambientVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  soundFx.setAmbientVolume(val);
                  setAmbientVolume(val);
                  if (isAudioMuted && val > 0) {
                    soundFx.toggleMute();
                    setIsAudioMuted(false);
                  }
                }}
                className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg mt-0.5"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-bold px-0.5">
                <span>Off (0%)</span>
                <span>85% (Balanced)</span>
                <span className="text-emerald-400 font-extrabold">200% MAX</span>
              </div>
            </div>

            {/* Audio Test Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => soundFx.testAmbientSound()}
                className="min-h-[44px] py-2 px-2 bg-slate-800 hover:bg-slate-750 active:bg-slate-700 border border-slate-700/80 rounded-xl text-[11px] font-bold text-emerald-300 flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer text-center"
                title="Preview subtle stadium crowd murmur and natural wind gust"
              >
                <span>🍃</span>
                <span>Test Ambient Wind</span>
              </button>

              <button
                type="button"
                onClick={() => soundFx.testSound()}
                className="min-h-[44px] py-2 px-2 bg-slate-800 hover:bg-slate-750 active:bg-slate-700 border border-slate-700/80 rounded-xl text-[11px] font-bold text-amber-400 flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer text-center"
                title="Preview bat crack and boundary cheer"
              >
                <span>🏏</span>
                <span>Test Bat & Roar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[44px] py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 min-h-[44px] py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center cursor-pointer"
          >
            Start New Match
          </button>
        </div>

      </div>
    </div>
  );
};
