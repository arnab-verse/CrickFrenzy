import React, { useState, useMemo } from 'react';
import {
  Trophy,
  X,
  Check,
  ArrowRight,
  Shield,
  Zap,
  Flag,
  Activity,
  Star,
} from 'lucide-react';
import { BattingStance, MatchConfig } from '../types';
import { WORLD_CUP_TEAMS, getTeamById } from '../tournament/teamsData';
import { initializeWorldCupTournament } from '../tournament/tournamentEngine';
import { WorldCupTournamentState } from '../tournament/types';
import { soundFx } from '../utils/audio';
import { TeamBadge } from './TeamBadge';

interface WorldCupSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTournament: (tournament: WorldCupTournamentState, initialMatchConfig: MatchConfig) => void;
}

export const WorldCupSetupModal: React.FC<WorldCupSetupModalProps> = ({
  isOpen,
  onClose,
  onStartTournament,
}) => {
  // Wizard Steps: 1: Team Selection, 2: Overs, 3: Difficulty Level
  const [wizardStep, setWizardStep] = useState<number>(1);

  // Form State
  const [selectedTeamId, setSelectedTeamId] = useState<string>('ind');
  const [totalOvers, setTotalOvers] = useState<number>(10);
  const selectedEdition = 'ICC T20 World Cup';
  const [difficulty, setDifficulty] = useState<'CASUAL' | 'PRO' | 'CHAMPION'>('PRO');
  const [battingStance, setBattingStance] = useState<BattingStance>('RIGHT');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterGroup, setFilterGroup] = useState<'ALL' | 'A' | 'B'>('ALL');

  const selectedTeam = useMemo(() => getTeamById(selectedTeamId), [selectedTeamId]);

  const filteredTeams = useMemo(() => {
    return WORLD_CUP_TEAMS.filter((team) => {
      const matchesSearch =
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.shortName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGroup = filterGroup === 'ALL' || team.groupSeed === filterGroup;
      return matchesSearch && matchesGroup;
    });
  }, [searchQuery, filterGroup]);

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
    const tournament = initializeWorldCupTournament({
      userTeamId: selectedTeamId,
      oversPerMatch: totalOvers,
      difficulty,
      totalWickets: 10, // Default 10 wickets as mandated
    });

    // Create starting match config
    const initialConfig: MatchConfig = {
      totalOvers,
      totalWickets: 10,
      difficulty,
      battingStance,
      playerTeamName: selectedTeam.name,
      playerTeamId: selectedTeam.id,
      opponentTeamName: 'World Cup Rival',
      editionName: selectedEdition,
    };

    onStartTournament(tournament, initialConfig);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 p-4 sm:p-5 text-slate-950 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950/20 border border-slate-950/30 flex items-center justify-center shadow-inner">
              <Trophy className="w-7 h-7 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black italic tracking-tight font-['Teko',sans-serif] uppercase leading-none">
                  ICC World Cup Campaign
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-400 font-bold text-[10px] uppercase tracking-wider">
                  3-Step Wizard
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-900/90 mt-0.5">
                Configure your nation's quest for world supremacy step-by-step
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Setup"
            className="w-11 h-11 rounded-full bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 flex items-center justify-center font-bold text-lg transition-transform active:scale-90 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Navigation Bar */}
        <div className="bg-slate-950 p-2 border-b border-slate-800 grid grid-cols-3 gap-1 sm:gap-2">
          {[
            { num: 1, title: '1. Select Country', icon: Flag },
            { num: 2, title: '2. Match Overs', icon: Activity },
            { num: 3, title: '3. Difficulty', icon: Zap },
          ].map((step) => {
            const isActive = wizardStep === step.num;
            const isCompleted = wizardStep > step.num;
            const StepIcon = step.icon;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => {
                  soundFx.playUiClick();
                  setWizardStep(step.num);
                }}
                className={`h-11 px-2 sm:px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                    : isCompleted
                    ? 'bg-slate-800/80 text-amber-400 hover:bg-slate-800'
                    : 'bg-slate-900/50 text-slate-500 hover:text-slate-400'
                }`}
              >
                <StepIcon className="w-4 h-4" />
                <span className="truncate">{step.title}</span>
                {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-200">

          {/* STEP 1: Select Your Country */}
          {wizardStep === 1 && (
            <section className="space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
                    1
                  </span>
                  <h3 className="text-base font-black uppercase tracking-wide text-white">
                    Select Your Country / Favorite Team
                  </h3>
                </div>

                {/* Group Filter & Search */}
                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-950 rounded-xl p-0.5 border border-slate-800 text-xs">
                    {(['ALL', 'A', 'B'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFilterGroup(g)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                          filterGroup === g
                            ? 'bg-amber-500 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {g === 'ALL' ? 'All 20' : `Group ${g}`}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Search team..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 w-32 sm:w-40"
                  />
                </div>
              </div>

              {/* 20 Teams Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 p-1">
                {filteredTeams.map((team) => {
                  const isSelected = selectedTeamId === team.id;
                  return (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => {
                        soundFx.playUiClick();
                        setSelectedTeamId(team.id);
                      }}
                      className={`p-2.5 rounded-2xl border text-left transition-all duration-150 relative overflow-hidden group cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800 border-amber-400 shadow-lg ring-2 ring-amber-400 scale-[1.03]'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                      }`}
                    >
                      <div
                        className="absolute top-0 left-0 right-0 h-1.5 opacity-80"
                        style={{ backgroundColor: team.primaryColor }}
                      />
                      
                      <div className="flex items-center justify-between mt-1">
                        <TeamBadge team={team} size="sm" />
                        <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          Grp {team.groupSeed}
                        </span>
                      </div>

                      <div className="mt-1.5">
                        <div className="font-black text-xs sm:text-sm text-white truncate">
                          {team.name}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span>{team.rating} OVR</span>
                          </span>
                          <span className="font-mono">{team.shortName}</span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-[10px] font-black text-slate-950 shadow">
                          <Check className="w-3 h-3 text-slate-950 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected Team Profile Card */}
              {selectedTeam && (
                <div
                  className="p-3.5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${selectedTeam.primaryColor}25 0%, #0f172a 100%)`,
                    borderColor: `${selectedTeam.primaryColor}80`,
                  }}
                >
                  <div className="flex items-center gap-3.5">
                    <TeamBadge team={selectedTeam} size="lg" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-black text-white">
                          {selectedTeam.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                          Group {selectedTeam.groupSeed}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 max-w-md">
                        {selectedTeam.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs bg-slate-950/70 px-4 py-2 rounded-xl border border-slate-800 shrink-0">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Rating</span>
                      <span className="font-bold text-amber-400 text-sm">{selectedTeam.rating} / 100</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Contender</span>
                      <span className="font-bold text-slate-200">Tier {selectedTeam.tier}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Group</span>
                      <span className="font-bold text-cyan-400">Pool {selectedTeam.groupSeed}</span>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* STEP 2: Number of Overs */}
          {wizardStep === 2 && (
            <section className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
                    2
                  </span>
                  <h3 className="text-base font-black uppercase tracking-wide text-white">
                    Overs Format for the Whole Edition
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {totalOvers} Overs per match • 10 Wickets
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { overs: 10, name: '10 Overs T10 Blast', desc: '60 balls • Intense deep tactical edition' },
                  { overs: 20, name: '20 Overs T20 Classic', desc: '120 balls • Official T20 World Cup format' },
                  { overs: 50, name: '50 Overs ODI Master', desc: '300 balls • Traditional 50-over World Cup edition' },
                ].map((item) => {
                  const isSelected = totalOvers === item.overs;
                  return (
                    <button
                      key={item.overs}
                      type="button"
                      onClick={() => {
                        soundFx.playUiClick();
                        setTotalOvers(item.overs);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/80 scale-[1.02]'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl sm:text-2xl font-black font-['Teko',sans-serif] text-white">
                          {item.overs} OVERS
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{item.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-950/80 border border-emerald-500/40 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Shield className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-emerald-300 flex items-center gap-2">
                      <span>Squad Wickets: 10 Wickets per match</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-200 text-[9px] font-bold">
                        Standard
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      All matches across the entire World Cup edition are played with a full 10-wicket batting squad.
                    </p>
                  </div>
                </div>
                <span className="text-lg font-black font-mono text-emerald-400 px-3 py-1 bg-emerald-950/60 rounded-xl border border-emerald-800/50">
                  10 Wkts
                </span>
              </div>
            </section>
          )}

          {/* STEP 3: Level of Difficulty */}
          {wizardStep === 3 && (
            <section className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
                    3
                  </span>
                  <h3 className="text-base font-black uppercase tracking-wide text-white">
                    Level of Difficulty for the World Cup
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                  Difficulty: {difficulty}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'CASUAL' as const,
                    title: 'Casual / Rookie',
                    badge: '+35% Timing Zone',
                    desc: 'Generous sweet-spot, 95-120 km/h bowling, friendly bounce.',
                    dotColor: 'bg-emerald-400',
                  },
                  {
                    id: 'PRO' as const,
                    title: 'Pro / Normal',
                    badge: 'Balanced Competition',
                    desc: 'Realistic 115-140 km/h pace, standard timing windows.',
                    dotColor: 'bg-amber-400',
                  },
                  {
                    id: 'CHAMPION' as const,
                    title: 'World Champion',
                    badge: '-25% Tight Timing',
                    desc: '135-155 km/h fiery pacers, sharp cutters, mystery spin.',
                    dotColor: 'bg-rose-400',
                  },
                ].map((item) => {
                  const isSelected = difficulty === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        soundFx.playUiClick();
                        setDifficulty(item.id);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400 shadow-lg'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${item.dotColor}`} />
                          <span>{item.title}</span>
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{item.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Tournament Config Summary */}
              <div className="p-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-amber-500/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <TeamBadge team={selectedTeam} size="sm" />
                  <div>
                    <span className="font-black text-white text-sm block">{selectedTeam.name}</span>
                    <span className="text-[10px] text-amber-400 font-semibold">{totalOvers} Overs • {difficulty} Level</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Ready for Campaign Launch
                </span>
              </div>
            </section>
          )}

        </div>

        {/* Modal Footer Start Button */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          {wizardStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold border border-slate-700 text-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Previous Step</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}

          {wizardStep < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-8 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wide border border-amber-300 shadow-lg shadow-amber-500/30 transition-all flex items-center gap-2 cursor-pointer font-['Teko',sans-serif]"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="start-world-cup-campaign-btn"
              type="button"
              onClick={handleLaunchTournament}
              className="flex-1 sm:flex-initial px-8 sm:px-12 py-3 rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-xl tracking-wider uppercase border-2 border-amber-200 shadow-xl shadow-amber-500/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-['Teko',sans-serif] cursor-pointer"
            >
              <Trophy className="w-6 h-6 text-slate-950" />
              <span>ENTER WORLD CUP</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
