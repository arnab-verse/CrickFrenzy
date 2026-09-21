import React, { useState, useMemo } from 'react';
import {
  Trophy,
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  Shield,
  Zap,
  Target,
  Swords,
  MapPin,
  Search,
  Activity,
} from 'lucide-react';
import { MatchConfig } from '../types';
import { IPL_TEAMS, IPL_EDITIONS, getTeamById } from '../tournament/teamsData';
import { initializeIPLTournament } from '../tournament/tournamentEngine';
import { WorldCupTournamentState } from '../tournament/types';
import { soundFx } from '../utils/audio';
import { TeamBadge } from './TeamBadge';

interface IPLSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTournament: (tournament: WorldCupTournamentState, initialMatchConfig: MatchConfig) => void;
}

export const IPLSetupModal: React.FC<IPLSetupModalProps> = ({
  isOpen,
  onClose,
  onStartTournament,
}) => {
  // Wizard Steps: 1: Team Selection, 2: Overs, 3: Difficulty Level
  const [wizardStep, setWizardStep] = useState<number>(1);

  // Form State
  const [selectedTeamId, setSelectedTeamId] = useState<string>('csk');
  const [totalOvers, setTotalOvers] = useState<number>(10);
  const selectedEdition = 'Indian Cricket League';
  const [difficulty, setDifficulty] = useState<'CASUAL' | 'PRO' | 'CHAMPION'>('PRO');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedTeam = useMemo(() => getTeamById(selectedTeamId), [selectedTeamId]);

  const filteredTeams = useMemo(() => {
    return IPL_TEAMS.filter((team) => {
      const matchesSearch =
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (team.tagline && team.tagline.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleNextStep = () => {
    soundFx.playUiClick();
    if (wizardStep < 3) {
      setWizardStep((prev) => prev + 1);
    } else {
      handleLaunchTournament();
    }
  };

  const handlePrevStep = () => {
    soundFx.playUiClick();
    if (wizardStep > 1) {
      setWizardStep((prev) => prev - 1);
    }
  };

  const handleLaunchTournament = () => {
    soundFx.playMatchStart();
    const tournament = initializeIPLTournament({
      userTeamId: selectedTeamId,
      oversPerMatch: totalOvers,
      difficulty,
      editionId: 'IPL',
      editionName: selectedEdition,
      totalWickets: 10,
    });

    const initialConfig: MatchConfig = {
      totalOvers,
      totalWickets: 10,
      difficulty,
      battingStance: 'RIGHT',
      playerTeamName: selectedTeam.name,
      opponentTeamName: 'Opponent',
      playerTeamId: selectedTeam.id,
      opponentTeamId: 'mi',
      weatherCondition: 'NIGHT',
      editionName: selectedEdition,
      stadiumName: 'Wankhede Stadium, Mumbai',
      isTournamentMatch: true,
      tournamentType: 'IPL',
    };

    onStartTournament(tournament, initialConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 animate-fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden text-white font-sans">
        {/* Top Header Bar */}
        <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-r from-amber-600/30 via-slate-900 to-blue-900/40 border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <Trophy className="w-7 h-7 text-amber-400" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wider font-['Teko',sans-serif] text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
                  INDIAN CRICKET LEAGUE
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                  DEFAULT TOURNAMENT MODE
                </span>
              </div>
              <p className="text-xs text-slate-300">
                10 Iconic Franchises • 14 League Matches per Team • Single Unified Table • Top 4 Playoffs
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playUiClick();
              onClose();
            }}
            className="w-11 h-11 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Progress Tracker */}
        <div className="relative z-10 px-4 sm:px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-3 w-full max-w-xl mx-auto">
            {[
              { num: 1, label: '1. Select Franchise', icon: Shield },
              { num: 2, label: '2. Match Overs', icon: Activity },
              { num: 3, label: '3. Difficulty', icon: Zap },
            ].map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <React.Fragment key={step.num}>
                  <button
                    type="button"
                    onClick={() => {
                      if (wizardStep > step.num) {
                        soundFx.playUiClick();
                        setWizardStep(step.num);
                      }
                    }}
                    disabled={wizardStep < step.num}
                    className={`flex items-center gap-1.5 px-2 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      wizardStep === step.num
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : wizardStep > step.num
                        ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 cursor-pointer'
                        : 'bg-slate-800/60 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono ${
                        wizardStep === step.num
                          ? 'bg-slate-950 text-amber-400'
                          : wizardStep > step.num
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {wizardStep > step.num ? <Check className="w-3 h-3 stroke-[3]" /> : step.num}
                    </span>
                    <span>{step.label}</span>
                  </button>
                  {idx < 2 && (
                    <div
                      className={`flex-1 h-0.5 rounded-full ${
                        wizardStep > step.num ? 'bg-amber-500/50' : 'bg-slate-800'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* STEP 1: TEAM SELECTION */}
          {wizardStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black uppercase text-amber-400 font-['Teko',sans-serif] tracking-wider">
                    Step 1: Select Your Franchise
                  </h3>
                  <p className="text-xs text-slate-400">
                    Lead one of the 10 powerhouse franchises through 14 grueling league fixtures.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search franchise or crest..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-60 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* 10 IPL Teams Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                {filteredTeams.map((team) => {
                  const isSelected = selectedTeamId === team.id;
                  return (
                    <div
                      key={team.id}
                      onClick={() => {
                        soundFx.playUiClick();
                        setSelectedTeamId(team.id);
                      }}
                      className={`relative p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-800/95 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.01]'
                          : 'bg-slate-800/50 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          {/* Team Flag / Emblem Crest Badge */}
                          <TeamBadge team={team} size="lg" />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-base text-white">{team.name}</h4>
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono font-bold text-slate-300">
                                {team.shortName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-300">
                              <span>Crest: <strong className="text-amber-300">{team.crest || 'Franchise Emblem'}</strong></span>
                              <span>•</span>
                              <span>Rating: <strong className="text-amber-400">{team.rating} OVR</strong></span>
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 shadow">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      {/* Tagline / Venue Footer */}
                      <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="truncate max-w-[260px]">
                          {team.tagline ? (
                            <span className="text-amber-300/90 italic font-medium">"{team.tagline}"</span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>{team.description}</span>
                            </span>
                          )}
                        </div>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ml-2"
                          style={{
                            backgroundColor: `${team.primaryColor}22`,
                            color: team.primaryColor === '#ffffff' ? '#38bdf8' : team.primaryColor,
                          }}
                        >
                          {team.shortName}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Franchise Summary Banner */}
              {selectedTeam && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-800/80 to-blue-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TeamBadge team={selectedTeam} size="lg" />
                    <div>
                      <span className="text-xs uppercase font-bold text-amber-300">Selected Franchise:</span>
                      <div className="text-base font-bold text-white flex items-center gap-2">
                        <span>{selectedTeam.name} ({selectedTeam.shortName})</span>
                        <span className="text-xs text-slate-400">• {selectedTeam.crest}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-300">
                    <div>Team Rating: <strong className="text-amber-400">{selectedTeam.rating} OVR</strong></div>
                    <div>Schedule: <strong className="text-emerald-300">14 Matches Guaranteed</strong></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: MATCH OVERS */}
          {wizardStep === 2 && (
            <div className="space-y-5 animate-fade-in max-w-xl mx-auto py-2">
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-black uppercase text-amber-400 font-['Teko',sans-serif] tracking-wider">
                  Step 2: Number of Overs per Match
                </h3>
                <p className="text-xs text-slate-400">
                  Select match duration for all 14 league matches and playoff encounters.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                {[
                  { overs: 10, label: '10 Overs', desc: 'Quick T10 Clash • 60 Balls' },
                  { overs: 20, label: '20 Overs', desc: 'Full T20 Official • 120 Balls' },
                ].map((opt) => (
                  <button
                    key={opt.overs}
                    type="button"
                    onClick={() => {
                      soundFx.playUiClick();
                      setTotalOvers(opt.overs);
                    }}
                    className={`p-5 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                      totalOvers === opt.overs
                        ? 'bg-amber-500 text-slate-950 border-yellow-200 shadow-lg shadow-amber-500/30 scale-105 font-bold'
                        : 'bg-slate-800/80 border-slate-700 hover:border-slate-600 text-slate-200'
                    }`}
                  >
                    <div className="text-3xl font-black font-['Teko',sans-serif]">{opt.label}</div>
                    <div className={`text-xs ${totalOvers === opt.overs ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-xs text-slate-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Format:</span>
                  <strong className="text-white">Full Squad Inning (10 Wickets)</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">League Matches:</span>
                  <strong className="text-amber-400">14 Matches (Plays every team + 5 repeat clashes)</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Playoffs:</span>
                  <strong className="text-emerald-400">Top 4 Teams Advance (Qualifier 1, Eliminator, Qualifier 2, Final)</strong>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: DIFFICULTY */}
          {wizardStep === 3 && (
            <div className="space-y-5 animate-fade-in max-w-xl mx-auto py-2">
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-black uppercase text-amber-400 font-['Teko',sans-serif] tracking-wider">
                  Step 3: Level of Difficulty
                </h3>
                <p className="text-xs text-slate-400">
                  Tune timing windows, bowling pace, and competition level for the entire season.
                </p>
              </div>

              {/* Difficulty Options */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    {
                      id: 'CASUAL' as const,
                      label: 'CASUAL',
                      badge: 'Forgiving',
                      desc: 'Wider green timing zone, slower pace',
                    },
                    {
                      id: 'PRO' as const,
                      label: 'PRO',
                      badge: 'Balanced',
                      desc: 'Standard T20 challenge & authentic swing',
                    },
                    {
                      id: 'CHAMPION' as const,
                      label: 'CHAMPION',
                      badge: 'Hardcore',
                      desc: '150+ km/h express pace, razor timing',
                    },
                  ].map((diff) => (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => {
                        soundFx.playUiClick();
                        setDifficulty(diff.id);
                      }}
                      className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                        difficulty === diff.id
                          ? 'bg-amber-500 text-slate-950 border-yellow-200 shadow-md scale-105 font-bold'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="text-base font-black font-['Teko',sans-serif]">{diff.label}</div>
                      <div className={`text-[10px] ${difficulty === diff.id ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                        {diff.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-blue-500/10 border border-amber-500/30 text-xs text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Franchise:</span>
                  <strong className="text-amber-300">{selectedTeam.name} ({selectedTeam.shortName})</strong>
                </div>
                <div className="flex justify-between">
                  <span>Match Overs:</span>
                  <strong className="text-white">{totalOvers} Overs per match</strong>
                </div>
                <div className="flex justify-between">
                  <span>Tournament:</span>
                  <strong className="text-white">Indian Cricket League (14 League Matches)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Difficulty:</span>
                  <strong className="text-emerald-400">{difficulty}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation Controls */}
        <div className="relative z-10 px-4 sm:px-6 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={wizardStep === 1 ? onClose : handlePrevStep}
            className="px-4 sm:px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-bold transition-all cursor-pointer"
          >
            {wizardStep === 1 ? 'Cancel' : '← Back'}
          </button>

          <button
            type="button"
            onClick={handleNextStep}
            className="px-6 sm:px-8 py-2.5 rounded-xl bg-gradient-to-r from-yellow-300 via-amber-400 to-amber-500 hover:from-yellow-200 hover:to-amber-400 text-slate-950 text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-amber-500/30 transition-all cursor-pointer flex items-center gap-2 font-['Teko',sans-serif]"
          >
            {wizardStep === 3 ? (
              <>
                <Trophy className="w-4 h-4 text-slate-950" />
                <span>START INDIAN CRICKET LEAGUE</span>
              </>
            ) : (
              <>
                <span>Next</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
