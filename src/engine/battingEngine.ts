import {
  DEFAULT_TIMING_CONFIG,
  DIFFICULTY_PRESETS,
  getTimingTierFromOffset,
  TimingThresholdConfig,
} from '../config/timingConfig';
import { getWeatherAdjustedTimingConfig, WEATHER_PHYSICS_PROFILES } from '../config/weatherPhysics';
import { getBatterArchetypeProfile } from '../config/batterArchetypes';
import {
  BallDelivery,
  BallRecord,
  BatterArchetype,
  BattingShotMode,
  BatterStats,
  DeliveryLength,
  DeliveryLine,
  GameState,
  InningsEndReason,
  MatchConfig,
  OverSummary,
  ShotDirection,
  ShotOutcome,
  TimingTier,
  WeatherCondition,
  WicketType,
} from '../types';

export const DEFAULT_MATCH_CONFIG: MatchConfig = {
  totalOvers: 5,
  totalWickets: 5,
  difficulty: 'PRO',
  battingStance: 'RIGHT',
  batterArchetype: 'CLASSICAL',
  playerTeamName: 'Player XI',
  opponentTeamName: 'AI Challengers',
  target: 48,
};

/**
 * Creates a brand new pristine GameState based on configuration.
 */
export function createInitialGameState(customConfig?: Partial<MatchConfig>): GameState {
  const config: MatchConfig = {
    ...DEFAULT_MATCH_CONFIG,
    ...customConfig,
  };

  const initialStats: BatterStats = {
    runs: 0,
    ballsFaced: 0,
    fours: 0,
    sixes: 0,
    dots: 0,
    singles: 0,
    twos: 0,
    threes: 0,
    strikeRate: 0,
  };

  return {
    config,
    currentOver: 0,
    ballInOver: 0,
    totalLegalBalls: 0,
    runs: 0,
    wickets: 0,
    consecutiveBoundaries: 0,
    consecutiveBoundaryTypes: [],
    highestBoundaryStreak: 0,
    isInningsOver: false,
    inningsEndReason: undefined,
    hasWon: undefined,
    currentDelivery: null,
    lastShotOutcome: null,
    ballHistory: [],
    overSummaries: [],
    batterStats: initialStats,
  };
}

/**
 * Checks how well the chosen shot direction aligns with the delivery line.
 * 'ALIGNED' (ideal shot direction), 'NEUTRAL' (straight or versatile), 'CROSS_BAT' (playing across line / opposite).
 */
export function evaluateShotCompatibility(
  line: DeliveryLine,
  length: DeliveryLength,
  shotDirection: ShotDirection
): 'ALIGNED' | 'NEUTRAL' | 'CROSS_BAT' {
  // Off-side deliveries
  if (line === 'WIDE_OUTSIDE_OFF' || line === 'OUTSIDE_OFF') {
    if (shotDirection === 'OFF_SIDE') return 'ALIGNED';
    if (shotDirection === 'STRAIGHT') return 'NEUTRAL';
    return 'CROSS_BAT'; // Playing across the line to leg side
  }

  // Leg-side deliveries
  if (line === 'LEG') {
    if (shotDirection === 'ON_SIDE') return 'ALIGNED';
    if (shotDirection === 'STRAIGHT') return 'NEUTRAL';
    return 'CROSS_BAT'; // Slicing leg ball to off side
  }

  // Middle and Off-middle deliveries
  if (shotDirection === 'STRAIGHT') return 'ALIGNED';
  return 'NEUTRAL';
}

export interface ShotResolutionOptions {
  rng?: () => number;
  config?: TimingThresholdConfig;
  weatherCondition?: WeatherCondition;
  batterArchetype?: BatterArchetype;
  battingShotMode?: BattingShotMode;
}

/**
 * Pure shot outcome resolver.
 * Maps timing accuracy, shot direction, delivery physics, and batter shot mode ('DEFENSIVE' vs 'LOFT')
 * into runs, wickets, and commentary.
 */
export function resolveShotOutcome(
  delivery: BallDelivery,
  shotDirection: ShotDirection,
  timingOffsetMs: number,
  options?: ShotResolutionOptions
): ShotOutcome {
  const rng = options?.rng || Math.random;
  const weather = options?.weatherCondition || 'SUNNY';
  const archetype = options?.batterArchetype || 'CLASSICAL';
  const shotMode: BattingShotMode = options?.battingShotMode || 'DEFENSIVE';
  const archetypeProfile = getBatterArchetypeProfile(archetype);
  const archetypeMods = archetypeProfile.physicsModifiers;

  const baseTimingConfig = options?.config || DEFAULT_TIMING_CONFIG;
  const weatherAdjustedConfig = getWeatherAdjustedTimingConfig(baseTimingConfig, weather);

  // Apply archetype timing sweet spot scaling
  const timingConfig: TimingThresholdConfig = {
    ...weatherAdjustedConfig,
    perfectMaxOffsetMs: weatherAdjustedConfig.perfectMaxOffsetMs * archetypeMods.timingSweetSpotMultiplier,
    goodMaxOffsetMs: weatherAdjustedConfig.goodMaxOffsetMs * (1 + (archetypeMods.timingSweetSpotMultiplier - 1) * 0.5),
  };

  const timingTier = getTimingTierFromOffset(timingOffsetMs, timingConfig);
  const compatibility = evaluateShotCompatibility(delivery.line, delivery.length, shotDirection);

  // Check out on Stumps if ball is on target
  const hitsStumps = delivery.line === 'MIDDLE' || delivery.line === 'MIDDLE_OFF' || delivery.line === 'LEG';
  const isYorker = delivery.length === 'YORKER';
  const isBouncer = delivery.length === 'BOUNCER';

  // Helper to pick a random line from an array using the RNG
  const pickCommentary = (optionsList: string[]): string => {
    const idx = Math.floor(rng() * optionsList.length);
    return optionsList[idx] || optionsList[0];
  };

  // 1. CLEAN MISS
  if (timingTier === 'MISS') {
    // Wide ball check (if delivery line is wide outside off or marked isWide)
    if (delivery.isWide || delivery.line === 'WIDE_OUTSIDE_OFF') {
      return {
        runs: 1,
        isWicket: false,
        timingOffsetMs,
        timingTier: 'MISS',
        shotDirection,
        shotName: 'Wide Ball',
        isWide: true,
        isExtra: true,
        commentary: pickCommentary([
          'WIDE BALL! Called wide outside the off stump guideline (+1 Extra Run)!',
          'WIDE! Straying way outside off stump, arms stretched wide (+1 Run)!',
          'WIDE DELIVERY! Ball passes beyond the wide line (+1 Extra)!',
        ]),
      };
    }

    // If on stumps or yorker, probability of bowled or LBW modulated by archetype defense
    if (hitsStumps || isYorker) {
      const wicketRoll = rng();
      const missWicketChance = timingConfig.missWicketChance * archetypeMods.missWicketMultiplier;
      if (wicketRoll < missWicketChance) {
        const isBowled = isYorker || wicketRoll < (missWicketChance * 0.7 * archetypeMods.bowledRiskMultiplier);
        const wicketType: WicketType = isBowled ? 'BOWLED' : 'LBW';

        const rainBowledComments = [
          'BOWLED! The wet ball skidded right under the blade on the slick pitch!',
          'TIMBER! Sizzled low and fast through the damp deck to shatter the stumps!',
        ];
        const overcastBowledComments = [
          'CLEAN BOWLED! Late inswing curves through the gate to smash middle stump!',
          'Castled! The heavy overcast hoop beats the bat all ends up!',
        ];

        let specificComment = '';
        if (weather === 'RAIN' && isBowled && rng() < 0.6) {
          specificComment = pickCommentary(rainBowledComments);
        } else if (weather === 'OVERCAST' && isBowled && rng() < 0.6) {
          specificComment = pickCommentary(overcastBowledComments);
        }

        return {
          runs: 0,
          isWicket: true,
          wicketType,
          timingOffsetMs,
          timingTier: 'MISS',
          shotDirection,
          shotName: isBowled ? 'Clean Bowled' : 'Trapped LBW',
          commentary: specificComment || (isBowled
            ? pickCommentary([
                'TIMBER! Beaten for pace and the stumps are shattered!',
                'CLEAN BOWLED! Middle stump knocked right out of the ground!',
                'Castled! Deceived completely by the flight and line!',
                'You miss, I hit! The off-stump goes cartwheeling!',
              ])
            : pickCommentary([
                'Plumb in front! Huge appeal and given LBW!',
                'Struck right on the pads in line with middle! Given out!',
                'Trapped right in front of all three! Loud finger goes up!',
              ])),
        };
      }
    }

    // Outside off miss can be an edge behind (heightened in overcast, modulated by archetype edge risk)
    const baseEdgeRisk = weather === 'OVERCAST' ? 0.28 : 0.18;
    const edgeRisk = baseEdgeRisk * archetypeMods.edgeRiskMultiplier;
    if (delivery.line === 'OUTSIDE_OFF' && rng() < edgeRisk) {
      return {
        runs: 0,
        isWicket: true,
        wicketType: 'EDGED_BEHIND',
        timingOffsetMs,
        timingTier: 'MISS',
        shotDirection,
        shotName: 'Edged Behind',
        commentary: pickCommentary(weather === 'OVERCAST' ? [
          'EDGED! Heavy overcast swing catches the outside edge straight to the keeper!',
          'Feathered behind! The hooping overcast ball nibbles the edge!',
          'Edged and taken! Probing swing in the humid air finds the gloves!',
        ] : [
          'Faint edge through to the wicket-keeper! Gone!',
          'Edged and taken! Feather through to the gloves!',
          'Nibbled outside off-stump, standard catch behind!',
        ]),
      };
    }

    // Otherwise clean miss / dot ball (with archetype flavor)
    const defenseFlavor = archetype === 'DEFENSIVE' ? [
      'Left alone outside off with watchful defensive discipline.',
      'Shouldered arms! Rock-solid defensive judgement.',
      'Soft hands play and miss, bat tucked safely behind pad.',
    ] : [];

    return {
      runs: 0,
      isWicket: false,
      timingOffsetMs,
      timingTier: 'MISS',
      shotDirection,
      shotName: 'Play and Miss',
      commentary: pickCommentary([
        ...defenseFlavor,
        ...(weather === 'OVERCAST' ? [
          'Beaten by huge late outswing! What a jaffa in these overcast conditions!',
          'Swung past the outside edge! The ball is talking in the humid air.',
          'Swung and missed! Testing swing from the bowler.',
        ] : weather === 'RAIN' ? [
          'Skids through rapidly on the wet deck past the blade!',
          'Swung over the skidder, beats the bat on the slick turf.',
          'Play and miss as the ball skids through low.',
        ] : [
          'Swung and missed! Ball thumps into the keeper gloves.',
          'Beaten outside off! Probing line from the bowler.',
          'Whistled past the outside edge! Terrific delivery.',
          'Swung over the top, nothing behind that stroke.',
        ]),
      ]),
    };
  }

  // 2. VERY EARLY or VERY LATE (Mistimed / Edge / Miscue)
  if (timingTier === 'VERY_EARLY' || timingTier === 'VERY_LATE') {
    // Loft mode significantly increases mistimed dismissal risk
    const loftRiskMultiplier = shotMode === 'LOFT' ? 1.8 : 0.6;
    let wicketProbability = timingConfig.poorTimingWicketChance * archetypeMods.edgeRiskMultiplier * loftRiskMultiplier;
    if (compatibility === 'CROSS_BAT') {
      wicketProbability += (timingConfig.wrongDirectionWicketPenalty * archetypeMods.edgeRiskMultiplier * loftRiskMultiplier);
    }

    if (rng() < wicketProbability) {
      if (shotMode === 'LOFT' || isBouncer) {
        return {
          runs: 0,
          isWicket: true,
          wicketType: 'CAUGHT',
          timingOffsetMs,
          timingTier,
          shotDirection,
          shotName: shotMode === 'LOFT' ? 'Skied Lofted Miscue' : 'Top Edge Catch',
          commentary: pickCommentary(shotMode === 'LOFT' ? [
            'SKIED IT! Tried to hit big in Loft mode with poor timing, caught easily on the boundary!',
            'High into the air off the toe of the bat! Fielder underneath holds the catch!',
            'Miscued the lofted hit miles up into the sky! Regulation catch taken!',
          ] : [
            'Top edge off the bouncer! Fielder settles underneath and takes an easy catch!',
            'High in the air off the splice of the bat! Caught comfortably!',
            'Skied it miles into the air! Safe hands underneath takes the catch!',
          ]),
        };
      }

      if (compatibility === 'CROSS_BAT') {
        return {
          runs: 0,
          isWicket: true,
          wicketType: 'CAUGHT',
          timingOffsetMs,
          timingTier,
          shotDirection,
          shotName: 'Leading Edge',
          commentary: pickCommentary([
            'Leading edge! Swung across the line and caught comfortably at point!',
            'Spiced off the leading edge, easy catch for the ring fielder!',
            'Cross-bat miscue ballooned straight to mid-on! Out!',
          ]),
        };
      }

      if (hitsStumps && (isYorker || rng() < 0.4 * archetypeMods.bowledRiskMultiplier)) {
        return {
          runs: 0,
          isWicket: true,
          wicketType: 'BOWLED',
          timingOffsetMs,
          timingTier,
          shotDirection,
          shotName: 'Dragged On',
          commentary: pickCommentary([
            'Off the inside edge and straight onto the stumps! Bowled!',
            'Dragged on! Chopped a wide ball back onto the timber!',
            'Inside edge crashes into the bails! Unlucky departure!',
          ]),
        };
      }

      return {
        runs: 0,
        isWicket: true,
        wicketType: 'CAUGHT',
        timingOffsetMs,
        timingTier,
        shotDirection,
        shotName: 'Misty Catch',
        commentary: pickCommentary([
          'Horribly mistimed in the air, caught inside the ring!',
          'Chipped straight to cover! Easy regulation catch taken!',
          'Miscued into the sky, fielder under it makes no mistake!',
        ]),
      };
    }

    // Survived mistiming - defensive squirt or scrambled single
    const scrambledRun = rng() < 0.25 ? 1 : 0;
    return {
      runs: scrambledRun,
      isWicket: false,
      timingOffsetMs,
      timingTier,
      shotDirection,
      shotName: scrambledRun ? 'Scrambled Single' : 'Defensive Squirt',
      commentary: scrambledRun
        ? pickCommentary([
            'Thick squirt into the vacant off-side, hustled through for a quick single.',
            'Squirted into the infield gap, good calling for one.',
            'Inside edge rolls onto the turf, quick sprint for a single.',
          ])
        : pickCommentary([
            'Mistimed into the pitch, dead ball.',
            'Thick inside edge thuds harmlessly into the pads.',
            'Off the toe of the bat, no run.',
          ]),
      fieldTrajectory: {
        endX: shotDirection === 'OFF_SIDE' ? -0.3 : shotDirection === 'ON_SIDE' ? 0.3 : 0,
        endY: 0.3,
        elevation: 0.05,
      },
    };
  }

  // 3. EARLY or LATE (Defensive / Working into gaps / Singles & Twos)
  if (timingTier === 'EARLY' || timingTier === 'LATE') {
    // Loft mode with early/late timing carries high catch risk in the deep!
    if (shotMode === 'LOFT' && rng() < 0.35) {
      return {
        runs: 0,
        isWicket: true,
        wicketType: 'CAUGHT',
        timingOffsetMs,
        timingTier,
        shotDirection,
        shotName: 'Lofted Catch in the Deep',
        commentary: pickCommentary([
          'CAUGHT ON THE BOUNDARY! Tried to loft over the fence but fluffed the timing! Taken at long-on!',
          'Skied high towards deep mid-wicket! Fielder steps back and holds a calm catch on the rope!',
          'Lofted into the deep pocket, doesn’t carry all the way! Deep cover takes it!',
        ]),
      };
    }

    // Cross bat shots in defensive mode have mild catch risk
    if (shotMode === 'DEFENSIVE' && compatibility === 'CROSS_BAT' && rng() < (0.08 * archetypeMods.edgeRiskMultiplier)) {
      return {
        runs: 0,
        isWicket: true,
        wicketType: 'CAUGHT',
        timingOffsetMs,
        timingTier,
        shotDirection,
        shotName: 'Soft Leading Edge',
        commentary: pickCommentary([
          'Chipped gently towards mid-off, held cleanly! Out!',
          'Soft leading edge caught at cover!',
        ]),
      };
    }

    // Good alignment rewards 1, 2, or lucky 4
    if (compatibility === 'ALIGNED') {
      const roll = rng();
      if (roll < 0.35) {
        return {
          runs: 2,
          isWicket: false,
          timingOffsetMs,
          timingTier,
          shotDirection,
          shotName: shotDirection === 'OFF_SIDE' ? 'Guided past Point' : shotDirection === 'ON_SIDE' ? 'Whipped into Deep Mid-Wicket' : 'Punched down the Ground',
          commentary: pickCommentary([
            'Neatly placed into the deep pocket, good aggressive running for two!',
            'Terrific hustle between the wickets, turns one into a sharp brace!',
            'Worked nicely into the gap, easy two runs taken.',
          ]),
          fieldTrajectory: {
            endX: shotDirection === 'OFF_SIDE' ? -0.5 : shotDirection === 'ON_SIDE' ? 0.5 : 0,
            endY: 0.6,
            elevation: 0.05,
          },
        };
      }
      return {
        runs: 1,
        isWicket: false,
        timingOffsetMs,
        timingTier,
        shotDirection,
        shotName: 'Nudged Single',
        commentary: pickCommentary([
          'Rotated the strike smartly with soft hands.',
          'Nudged into the vacant gap, easy single.',
          'Pushed down to long-on for one.',
          'Worked off the pads behind square for a single.',
        ]),
        fieldTrajectory: {
          endX: shotDirection === 'OFF_SIDE' ? -0.4 : shotDirection === 'ON_SIDE' ? 0.4 : 0,
          endY: 0.45,
          elevation: 0.05,
        },
      };
    }

    // Neutral or cross bat
    const runs = rng() < 0.45 ? 1 : 0;
    return {
      runs: runs,
      isWicket: false,
      timingOffsetMs,
      timingTier,
      shotDirection,
      shotName: runs ? 'Tucked for Single' : 'Solid Block',
      commentary: runs
        ? pickCommentary([
            'Pushed into the gap for a sensible single.',
            'Tucked away to the leg side for one run.',
            'Steered past backward point to rotate the strike.',
          ])
        : pickCommentary([
            'Right behind the line with a compact defensive push.',
            'Solid defensive block right out of the middle.',
            'Defended firmly back down the pitch to the bowler.',
          ]),
      fieldTrajectory: {
        endX: shotDirection === 'OFF_SIDE' ? -0.35 : shotDirection === 'ON_SIDE' ? 0.35 : 0,
        endY: 0.35,
        elevation: 0.05,
      },
    };
  }

  // 4. GOOD TIMING (Boundaries / High quality shots)
  if (timingTier === 'GOOD') {
    const boundaryProb = Math.min(0.95, Math.max(0.40, 0.72 + archetypeMods.boundaryProbabilityBonus));
    
    // In Loft mode, good timing can result in a big lofted boundary or catch on fence
    if (shotMode === 'LOFT') {
      if (compatibility === 'ALIGNED' && rng() < 0.25) {
        // High Lofted SIX
        const distanceMeters = Math.round(78 + rng() * 20);
        return {
          runs: 6,
          isWicket: false,
          boundaryType: 'SIX',
          hitDistanceMeters: distanceMeters,
          timingOffsetMs,
          timingTier: 'GOOD',
          shotDirection,
          shotName: 'Lofted Big Hit',
          commentary: `LOFTED FOR SIX! ${distanceMeters}m high aerial strike over the fence!`,
          fieldTrajectory: {
            endX: shotDirection === 'OFF_SIDE' ? -0.75 : shotDirection === 'ON_SIDE' ? 0.75 : 0,
            endY: 1.0,
            elevation: 0.85,
          },
        };
      } else if (rng() < 0.15) {
        // Caught on boundary in Loft mode on non-perfect timing
        return {
          runs: 0,
          isWicket: true,
          wicketType: 'CAUGHT',
          timingOffsetMs,
          timingTier: 'GOOD',
          shotDirection,
          shotName: 'Caught on the Boundary',
          commentary: 'CAUGHT ON THE ROPE! Lofted high into the night sky, but caught right at the edge of the boundary!',
        };
      }
    }

    if (compatibility === 'ALIGNED') {
      if (rng() < boundaryProb) {
        const shotName =
          shotDirection === 'OFF_SIDE'
            ? 'Cracking Cover Drive'
            : shotDirection === 'ON_SIDE'
            ? 'Crisp Pull Shot'
            : 'Punch Through Mid-On';
        return {
          runs: 4,
          isWicket: false,
          boundaryType: 'FOUR',
          timingOffsetMs,
          timingTier: 'GOOD',
          shotDirection,
          shotName,
          commentary: pickCommentary(shotMode === 'DEFENSIVE' ? [
            'Sizzling ground drive! Rockets along the grass for FOUR!',
            'Textbook cover drive kept safely on the carpet for FOUR!',
            'Crisp timing! Blasted along the turf beat the diving fielder for FOUR!',
          ] : [
            'What a beautiful drive! Pierces the gap for FOUR!',
            'Cracking stroke! Races away to the boundary fence!',
            'FOUR! Exquisite placement, beating the diving cover fielder!',
            'Crisp timing! Rocketed across the turf for FOUR!',
          ]),
          fieldTrajectory: {
            endX: shotDirection === 'OFF_SIDE' ? -0.7 : shotDirection === 'ON_SIDE' ? 0.7 : 0.05,
            endY: 0.95,
            elevation: shotMode === 'DEFENSIVE' ? 0.05 : 0.3 * archetypeMods.loftElevationMultiplier,
          },
        };
      }

      return {
        runs: 2,
        isWicket: false,
        timingOffsetMs,
        timingTier: 'GOOD',
        shotDirection,
        shotName: 'Firmly Struck Drive',
        commentary: pickCommentary([
          'Raced through the infield, sweeper cuts it off — good double!',
          'Punched firmly into the outfield pocket, comfortable couple of runs.',
          'Crisp shot into the deep, batters sprint back for two.',
        ]),
        fieldTrajectory: {
          endX: shotDirection === 'OFF_SIDE' ? -0.55 : shotDirection === 'ON_SIDE' ? 0.55 : 0,
          endY: 0.7,
          elevation: 0.05,
        },
      };
    }

    // Neutral alignment
    const neutralBoundaryProb = Math.min(0.85, Math.max(0.20, 0.45 + archetypeMods.boundaryProbabilityBonus));
    if (rng() < neutralBoundaryProb) {
      return {
        runs: 4,
        isWicket: false,
        boundaryType: 'FOUR',
        timingOffsetMs,
        timingTier: 'GOOD',
        shotDirection,
        shotName: 'Slapped for Boundary',
        commentary: pickCommentary([
          'Beat the diving mid-wicket fielder for FOUR!',
          'Flayed past point with authority! FOUR runs!',
          'Slashed through the infield gap for a cracking boundary!',
        ]),
        fieldTrajectory: {
          endX: shotDirection === 'OFF_SIDE' ? -0.7 : shotDirection === 'ON_SIDE' ? 0.7 : 0,
          endY: 0.92,
          elevation: shotMode === 'DEFENSIVE' ? 0.05 : 0.2,
        },
      };
    }
    return {
      runs: 2,
      isWicket: false,
      timingOffsetMs,
      timingTier: 'GOOD',
      shotDirection,
      shotName: 'Pushed into Pocket',
      commentary: 'Good timing, easy two runs taken.',
      fieldTrajectory: {
        endX: shotDirection === 'OFF_SIDE' ? -0.5 : shotDirection === 'ON_SIDE' ? 0.5 : 0,
        endY: 0.65,
        elevation: 0.05,
      },
    };
  }

  // 5. PERFECT TIMING (Maximum runs: SIX or power FOUR)
  // Sweet spot bullseye!
  if (timingTier === 'PERFECT') {
    // DEFENSIVE MODE STRICT CONSTRAINT: User CANNOT hit flying shots / sixes!
    if (shotMode === 'DEFENSIVE') {
      return {
        runs: 4,
        isWicket: false,
        boundaryType: 'FOUR',
        timingOffsetMs,
        timingTier: 'PERFECT',
        shotDirection,
        shotName: 'Bullet Ground Drive',
        commentary: pickCommentary([
          'PERFECT TIMING! Kept firmly along the carpet for a rocket FOUR!',
          'Textbook defensive perfection! Sizzling bullet drive along the turf for FOUR!',
          'Blistered across the grass! Kept low and grounded for a glorious FOUR!',
          'Flawless placement! Smoked along the turf to the fence!',
        ]),
        fieldTrajectory: {
          endX: shotDirection === 'OFF_SIDE' ? -0.75 : shotDirection === 'ON_SIDE' ? 0.75 : 0.05,
          endY: 0.98,
          elevation: 0.05, // Kept strictly grounded!
        },
      };
    }

    // LOFT MODE: User can hit big flying SIXES!
    const isSix = compatibility === 'ALIGNED' || rng() < 0.85;
    const baseDistance = Math.round(85 + rng() * 30);
    const distanceMeters = Math.round(baseDistance * archetypeMods.powerMultiplier);

    if (isSix) {
      let shotName = 'Lofted Straight Drive';
      if (shotDirection === 'OFF_SIDE') {
        shotName = delivery.length === 'SHORT' || delivery.length === 'BOUNCER' ? 'Upper Cut over Third Man' : 'Inside-Out Loft over Extra Cover';
      } else if (shotDirection === 'ON_SIDE') {
        shotName = delivery.length === 'SHORT' || delivery.length === 'BOUNCER' ? 'Massive Hook into the Stands' : 'Towering Flick over Deep Square Leg';
      }

      return {
        runs: 6,
        isWicket: false,
        boundaryType: 'SIX',
        hitDistanceMeters: distanceMeters,
        timingOffsetMs,
        timingTier: 'PERFECT',
        shotDirection,
        shotName,
        commentary: pickCommentary([
          `MASSIVE LOFTED SIX! Sent sailing ${distanceMeters}m high into the grandstand!`,
          `SWEET AS A NUT! Towering lofted hit ${distanceMeters}m deep into the top tier! MAXIMUM!`,
          `BOOM! Smashed out of the stadium in Loft mode! (${distanceMeters}m SIX)`,
          `Magnificent aerial timing! High, handsome, and into the crowd for SIX!`,
          `Pure perfection off the meat of the bat! ${distanceMeters}m towering SIX!`,
        ]),
        fieldTrajectory: {
          endX: shotDirection === 'OFF_SIDE' ? -0.8 : shotDirection === 'ON_SIDE' ? 0.8 : 0,
          endY: 1.0,
          elevation: Math.min(1.0, 0.92 * archetypeMods.loftElevationMultiplier),
        },
      };
    }

    // High velocity aerial FOUR in Loft mode
    return {
      runs: 4,
      isWicket: false,
      boundaryType: 'FOUR',
      timingOffsetMs,
      timingTier: 'PERFECT',
      shotDirection,
      shotName: 'Lofted Power Four',
      commentary: pickCommentary([
        'Smoked over mid-off for a high-velocity FOUR!',
        'Lofted boundary! Clears the infield with ease to hit the fence!',
        'Blistered over cover for a soaring FOUR!',
      ]),
      fieldTrajectory: {
        endX: shotDirection === 'OFF_SIDE' ? -0.75 : shotDirection === 'ON_SIDE' ? 0.75 : 0.1,
        endY: 0.98,
        elevation: 0.5 * archetypeMods.loftElevationMultiplier,
      },
    };
  }

  // Fallback safe dot
  return {
    runs: 0,
    isWicket: false,
    timingOffsetMs,
    timingTier: 'MISS',
    shotDirection,
    shotName: 'Defended',
    commentary: 'Solid defensive contact.',
  };
}

/**
 * Updates GameState when a legal delivery has concluded.
 * Handles:
 * - ballInOver increment (0 -> 5)
 * - over roll-over when reaching 6 legal balls
 * - runs & wickets accumulation
 * - batter statistics tracking
 * - innings end detection:
 *     1. All out (wickets == totalWickets)
 *     2. Target reached if chasing (runs >= target) -> ends immediately!
 *     3. Overs exhausted (completed overs == totalOvers)
 */
export function recordDeliveryOutcome(
  state: GameState,
  outcome: ShotOutcome,
  delivery: BallDelivery
): GameState {
  if (state.isInningsOver) {
    return state;
  }

  const isExtra = outcome.isWide || outcome.isExtra;
  const nextRuns = state.runs + outcome.runs;
  const nextWickets = state.wickets + (outcome.isWicket ? 1 : 0);
  const nextTotalBalls = state.totalLegalBalls + (isExtra ? 0 : 1);

  // Advance over and ball count (wide balls do not consume a legal ball)
  let nextBallInOver = state.ballInOver + (isExtra ? 0 : 1);
  let nextCurrentOver = state.currentOver;

  // If 6 legal balls finished in current over (0 to 5), rollover
  const isOverComplete = !isExtra && nextBallInOver >= 6;
  if (isOverComplete) {
    nextBallInOver = 0;
    nextCurrentOver = state.currentOver + 1;
  }

  // Record history
  const record: BallRecord = {
    overNumber: state.currentOver + 1,
    ballInOver: state.ballInOver + (isExtra ? 0 : 1),
    delivery,
    outcome,
  };
  const nextHistory = [...state.ballHistory, record];

  // Update over summaries
  const nextOverSummaries = [...state.overSummaries];
  const activeOverIndex = state.currentOver;
  if (!nextOverSummaries[activeOverIndex]) {
    nextOverSummaries[activeOverIndex] = {
      overNumber: activeOverIndex + 1,
      runs: 0,
      wickets: 0,
      ballOutcomes: [],
    };
  }
  const currentSummary = nextOverSummaries[activeOverIndex];
  currentSummary.runs += outcome.runs;
  if (outcome.isWicket) currentSummary.wickets += 1;
  currentSummary.ballOutcomes.push({
    runs: outcome.runs,
    isWicket: outcome.isWicket,
    label: outcome.isWide ? 'Wd' : outcome.isWicket ? 'W' : outcome.runs.toString(),
  });

  // Update Batter Stats (Wide balls do not count against batter's balls faced or batter's personal runs)
  const prevStats = state.batterStats;
  const nextBallsFaced = prevStats.ballsFaced + (isExtra ? 0 : 1);
  const nextPersonalRuns = prevStats.runs + (outcome.isWide ? 0 : outcome.runs);
  const nextBatterStats: BatterStats = {
    ballsFaced: nextBallsFaced,
    runs: nextPersonalRuns,
    fours: prevStats.fours + (outcome.runs === 4 && !outcome.isWide ? 1 : 0),
    sixes: prevStats.sixes + (outcome.runs === 6 && !outcome.isWide ? 1 : 0),
    dots: prevStats.dots + (outcome.runs === 0 && !outcome.isWicket && !isExtra ? 1 : 0),
    singles: prevStats.singles + (outcome.runs === 1 && !outcome.isWide ? 1 : 0),
    twos: prevStats.twos + (outcome.runs === 2 && !outcome.isWide ? 1 : 0),
    threes: prevStats.threes + (outcome.runs === 3 && !outcome.isWide ? 1 : 0),
    strikeRate: nextBallsFaced > 0 ? Math.round((nextPersonalRuns / nextBallsFaced) * 100) : 0,
  };

  // Track Consecutive Boundaries Streak
  const isBoundary =
    !outcome.isWicket &&
    (outcome.runs === 4 ||
      outcome.runs === 6 ||
      outcome.boundaryType === 'FOUR' ||
      outcome.boundaryType === 'SIX');

  const boundaryType: 'FOUR' | 'SIX' | null = isBoundary
    ? outcome.boundaryType === 'SIX' || outcome.runs === 6
      ? 'SIX'
      : 'FOUR'
    : null;

  let nextConsecutiveBoundaries = 0;
  let nextConsecutiveTypes: Array<'FOUR' | 'SIX'> = [];

  if (isBoundary && boundaryType) {
    nextConsecutiveBoundaries = (state.consecutiveBoundaries || 0) + 1;
    nextConsecutiveTypes = [...(state.consecutiveBoundaryTypes || []), boundaryType];
  } else {
    nextConsecutiveBoundaries = 0;
    nextConsecutiveTypes = [];
  }

  const nextHighestBoundaryStreak = Math.max(
    state.highestBoundaryStreak || 0,
    nextConsecutiveBoundaries
  );

  // Check Innings End conditions (Practice sessions have unlimited balls & unlimited wickets)
  let isInningsOver = false;
  let inningsEndReason: InningsEndReason | undefined = undefined;
  let hasWon: boolean | undefined = undefined;

  if (!state.config.isPracticeMode) {
    // 1. Target reached (Run chase completed early!)
    if (state.config.target !== undefined && nextRuns >= state.config.target) {
      isInningsOver = true;
      inningsEndReason = 'TARGET_REACHED';
      hasWon = true;
    }
    // 2. All wickets lost
    else if (
      state.config.totalWickets > 0 &&
      Number.isFinite(state.config.totalWickets) &&
      nextWickets >= state.config.totalWickets
    ) {
      isInningsOver = true;
      inningsEndReason = 'ALL_OUT';
      hasWon = state.config.target !== undefined ? nextRuns >= state.config.target : false;
    }
    // 3. Overs limit reached (for limited overs matches; unlimited overs continue until all out or target)
    else if (
      state.config.totalOvers > 0 &&
      Number.isFinite(state.config.totalOvers) &&
      nextCurrentOver >= state.config.totalOvers
    ) {
      isInningsOver = true;
      inningsEndReason = 'OVERS_EXHAUSTED';
      hasWon = state.config.target !== undefined ? nextRuns >= state.config.target : undefined;
    }
  }

  return {
    ...state,
    runs: nextRuns,
    wickets: nextWickets,
    currentOver: nextCurrentOver,
    ballInOver: nextBallInOver,
    totalLegalBalls: nextTotalBalls,
    consecutiveBoundaries: nextConsecutiveBoundaries,
    consecutiveBoundaryTypes: nextConsecutiveTypes,
    highestBoundaryStreak: nextHighestBoundaryStreak,
    isInningsOver,
    inningsEndReason,
    hasWon,
    currentDelivery: null,
    lastShotOutcome: outcome,
    ballHistory: nextHistory,
    overSummaries: nextOverSummaries,
    batterStats: nextBatterStats,
  };
}

/**
 * Formats current overs in standard cricket notation (e.g., "3.4 overs").
 */
export function formatOvers(currentOver: number, ballInOver: number): string {
  return `${currentOver}.${ballInOver}`;
}

/**
 * Calculates Current Run Rate (Runs per completed or partial over).
 */
export function calculateCurrentRunRate(runs: number, totalLegalBalls: number): number {
  if (totalLegalBalls === 0) return 0;
  const completedOversFraction = totalLegalBalls / 6;
  return Number((runs / completedOversFraction).toFixed(2));
}

/**
 * Calculates Required Run Rate for run chases.
 */
export function calculateRequiredRunRate(
  target: number,
  currentRuns: number,
  totalOvers: number,
  totalLegalBalls: number
): number | null {
  if (!totalOvers || !Number.isFinite(totalOvers) || totalOvers <= 0) {
    return null; // Unlimited overs match has no overs-based required run rate
  }

  const runsNeeded = target - currentRuns;
  if (runsNeeded <= 0) return 0;

  const totalMatchBalls = totalOvers * 6;
  const ballsRemaining = totalMatchBalls - totalLegalBalls;
  if (ballsRemaining <= 0) return 99.9; // Practically impossible if balls exhausted

  const oversRemainingFraction = ballsRemaining / 6;
  return Number((runsNeeded / oversRemainingFraction).toFixed(2));
}
