export type DeliveryLine = 'WIDE_OUTSIDE_OFF' | 'OUTSIDE_OFF' | 'MIDDLE_OFF' | 'MIDDLE' | 'LEG';
export type DeliveryLength = 'BOUNCER' | 'SHORT' | 'GOOD_LENGTH' | 'FULL' | 'YORKER' | 'FULL_TOSS';
export type BowlerStyle = 'FAST' | 'MEDIUM_PACER' | 'OFF_SPINNER' | 'LEG_SPINNER' | 'MYSTERY_SPINNER';
export type BowlerFilter = 'AUTO' | 'PACER' | 'MEDIUM_PACE' | 'OFF_SPIN' | 'LEG_SPIN' | 'MYSTERY_SPIN';

export type ShotDirection = 'OFF_SIDE' | 'STRAIGHT' | 'ON_SIDE';
export type BattingStance = 'RIGHT' | 'LEFT';

export type TimingTier =
  | 'PERFECT'
  | 'GOOD'
  | 'EARLY'
  | 'LATE'
  | 'VERY_EARLY'
  | 'VERY_LATE'
  | 'MISS';

export type WicketType = 'BOWLED' | 'CAUGHT' | 'LBW' | 'EDGED_BEHIND';

export interface BallDelivery {
  id: string;
  ballNumber: number; // overall ball index (1, 2, 3...)
  overIndex: number;  // 0-indexed over
  ballInOver: number; // 0 to 5
  line: DeliveryLine;
  length: DeliveryLength;
  speedKmh: number;
  bowlerStyle: BowlerStyle;
  flightDurationMs: number; // total time from bowler release to ideal hit zone
  bounceRatio: number;      // 0 to 1 where pitch bounce occurs
  spinOrSwing: number;      // lateral drift in pixels or degrees (-1 to 1)
  spinTurnPixels?: number;  // sharp break off the pitch in pixels (-40 to +40)
  spinVariationName?: string; // e.g. "Doosra", "Googly", "Arm Ball", "Flipper", "Top-Spinner"
  deliveryLabel: string;    // e.g. "86 km/h Loopy Off-Break"
  isWide?: boolean;         // true if delivery line exceeds wide guidelines
}

export interface ShotOutcome {
  runs: 0 | 1 | 2 | 3 | 4 | 6;
  isWicket: boolean;
  wicketType?: WicketType;
  timingOffsetMs: number; // 0 is ideal, negative is early, positive is late
  timingTier: TimingTier;
  shotDirection: ShotDirection;
  shotName: string;       // e.g. "Lofted Straight Drive", "Square Cut", "Pull Shot"
  commentary: string;     // e.g. "BOOM! Smashed out of the ground for SIX!"
  boundaryType?: 'FOUR' | 'SIX';
  hitDistanceMeters?: number;
  isWide?: boolean;       // true if wide ball (+1 extra run, ball rebowled)
  isExtra?: boolean;      // true if extra delivery
  fieldTrajectory?: {
    endX: number; // -1 to 1 (left to right)
    endY: number; // 0 to 1 (depth)
    elevation: number; // 0 to 1 (high in air vs along ground)
  };
}

export interface BallRecord {
  overNumber: number; // 1-indexed
  ballInOver: number; // 1 to 6
  delivery: BallDelivery;
  outcome: ShotOutcome;
}

export interface OverSummary {
  overNumber: number; // 1-indexed
  runs: number;
  wickets: number;
  ballOutcomes: Array<{
    runs: number;
    isWicket: boolean;
    label: string;
  }>;
}

export interface BatterStats {
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  dots: number;
  singles: number;
  twos: number;
  threes: number;
  strikeRate: number;
}

export type WeatherCondition = 'SUNNY' | 'OVERCAST' | 'RAIN' | 'NIGHT';
export type BatterArchetype = 'CLASSICAL' | 'AGGRESSIVE' | 'DEFENSIVE' | 'UNORTHODOX';
export type BattingShotMode = 'DEFENSIVE' | 'LOFT';

export interface MatchConfig {
  totalOvers: number; // 5, 10, 15, 20, or 0 (0 = Unlimited overs)
  totalWickets: number; // 1, 2, 5, 10, or Infinity / 0 (Unlimited wickets in practice)
  target?: number; // if chasing
  difficulty: 'CASUAL' | 'PRO' | 'CHAMPION';
  weatherCondition?: WeatherCondition;
  battingStance?: BattingStance; // 'RIGHT' (RHB, default) or 'LEFT' (LHB)
  batterArchetype?: BatterArchetype; // 'CLASSICAL' | 'AGGRESSIVE' | 'DEFENSIVE' | 'UNORTHODOX'
  isPracticeMode?: boolean; // true for unlimited practice session
  practiceBowlerType?: BowlerFilter; // chosen bowler to face in practice
  playerTeamName?: string;
  playerTeamId?: string;
  opponentTeamName?: string;
  opponentTeamId?: string;
  editionName?: string;
  stadiumName?: string;
  tournamentType?: 'WORLD_CUP' | 'IPL';
  isTournamentMatch?: boolean;
  tournamentMatchId?: string;
  tournamentStageLabel?: string;
  opponentScore?: { runs: number; wickets: number; overs: number };
}

export type InningsEndReason = 'OVERS_EXHAUSTED' | 'ALL_OUT' | 'TARGET_REACHED';

export interface GameState {
  config: MatchConfig;
  currentOver: number;    // 0 to totalOvers - 1
  ballInOver: number;     // 0 to 5 (6 legal balls per over)
  totalLegalBalls: number;
  runs: number;
  wickets: number;
  consecutiveBoundaries: number;
  consecutiveBoundaryTypes: Array<'FOUR' | 'SIX'>;
  highestBoundaryStreak: number;
  isInningsOver: boolean;
  inningsEndReason?: InningsEndReason;
  hasWon?: boolean;
  currentDelivery: BallDelivery | null;
  lastShotOutcome: ShotOutcome | null;
  ballHistory: BallRecord[];
  overSummaries: OverSummary[];
  batterStats: BatterStats;
}
