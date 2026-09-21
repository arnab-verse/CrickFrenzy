/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BowlerStyle, BowlerFilter } from '../types';
import { TEAM_SQUADS, WORLD_CUP_TEAMS } from '../tournament/teamsData';
import { IPL_SQUADS, IPL_TEAMS } from '../tournament/iplTeamsData';

export interface BowlerProfile {
  id: string;
  name: string;
  countryOrTeam?: string;
  bowlerStyle: BowlerStyle;
  styleLabel: string;
  speedRange: string;
  actionType: string;
  weapons: string[];
  description: string;
  avatarEmoji: string;
}

export const FAMOUS_BOWLERS: BowlerProfile[] = [
  {
    id: 'bumrah',
    name: 'Jasprit Bumrah',
    countryOrTeam: 'India',
    bowlerStyle: 'FAST',
    styleLabel: 'Right-Arm Express Fast',
    speedRange: '142 - 150 km/h',
    actionType: 'Hyperextended Sling Release',
    weapons: ['Lethal Yorker', 'Slower Dipper', 'Inswinger', 'Heavy Bouncer'],
    description: 'Master of death overs with pinpoint yorkers and deceptive slower variations.',
    avatarEmoji: '⚡',
  },
  {
    id: 'starc',
    name: 'Mitchell Starc',
    countryOrTeam: 'Australia',
    bowlerStyle: 'FAST',
    styleLabel: 'Left-Arm Express Fast',
    speedRange: '145 - 152 km/h',
    actionType: 'Towering Left-Arm Arc',
    weapons: ['Toe-Crusher Yorker', 'Late Banana Swing', 'Fiery Short Ball'],
    description: 'Blistering left-arm pace with lethal swinging yorkers attacking the stumps.',
    avatarEmoji: '🔥',
  },
  {
    id: 'rashid',
    name: 'Rashid Khan',
    countryOrTeam: 'Afghanistan',
    bowlerStyle: 'LEG_SPINNER',
    styleLabel: 'Right-Arm Leg-Spin & Googly',
    speedRange: '92 - 100 km/h',
    actionType: 'Rapid Arm Speed Wrist Spin',
    weapons: ['Lightning Googly', 'Skidding Leg-Break', 'Deadly Flipper'],
    description: 'Fastest arm action in world cricket with undetectable googlies and skidders.',
    avatarEmoji: '🌪️',
  },
  {
    id: 'cummins',
    name: 'Pat Cummins',
    countryOrTeam: 'Australia',
    bowlerStyle: 'FAST',
    styleLabel: 'Right-Arm Fast Seam',
    speedRange: '140 - 148 km/h',
    actionType: 'High Arm Seam Presentation',
    weapons: ['Hard Length Seam', 'Heavy Bouncer', 'Off-Cutter'],
    description: 'Relentless hit-the-deck pacer with sharp seam movement off the surface.',
    avatarEmoji: '🏏',
  },
  {
    id: 'kuldeep',
    name: 'Kuldeep Yadav',
    countryOrTeam: 'India',
    bowlerStyle: 'MYSTERY_SPINNER',
    styleLabel: 'Left-Arm Wrist Spin (Chinaman)',
    speedRange: '84 - 92 km/h',
    actionType: 'Loopy Wrist Spin Arc',
    weapons: ['Sharp Wrong-Un', 'Looping Leg-Break', 'Skidding Slider'],
    description: 'Deceptive left-arm wrist spin with huge lateral turn and drift in the air.',
    avatarEmoji: '🔮',
  },
  {
    id: 'shaheen',
    name: 'Shaheen Afridi',
    countryOrTeam: 'Pakistan',
    bowlerStyle: 'FAST',
    styleLabel: 'Left-Arm Fast Swing',
    speedRange: '140 - 148 km/h',
    actionType: 'Tall Left-Arm High Release',
    weapons: ['Booming Inswinger', 'Cross-Seam Yorker', 'Back of Length Kick'],
    description: 'Opening over specialist hunting early bowled and LBW dismissals.',
    avatarEmoji: '⚡',
  },
  {
    id: 'theekshana',
    name: 'Maheesh Theekshana',
    countryOrTeam: 'Sri Lanka',
    bowlerStyle: 'OFF_SPINNER',
    styleLabel: 'Right-Arm Mystery Off-Spin',
    speedRange: '90 - 98 km/h',
    actionType: 'Finger Flick Mystery',
    weapons: ['Carrom Ball', 'Sharp Off-Break', 'Doosra Slider'],
    description: 'Unorthodox mystery bowler who flicks the carrom ball with thumb and index finger.',
    avatarEmoji: '🌀',
  },
  {
    id: 'shami',
    name: 'Mohammed Shami',
    countryOrTeam: 'India',
    bowlerStyle: 'FAST',
    styleLabel: 'Right-Arm Fast Seam',
    speedRange: '138 - 146 km/h',
    actionType: 'Upright Seam Laser Release',
    weapons: ['Upright Seam Movement', 'Reverse Swing', 'Length Stump Attack'],
    description: 'World-renowned seam presentation with lethal swing off both old and new ball.',
    avatarEmoji: '🎯',
  },
  {
    id: 'narine',
    name: 'Sunil Narine',
    countryOrTeam: 'West Indies',
    bowlerStyle: 'MYSTERY_SPINNER',
    styleLabel: 'Right-Arm Mystery Spinner',
    speedRange: '88 - 96 km/h',
    actionType: 'Hidden Gripping Finger Flick',
    weapons: ['Concealed Knuckle Ball', 'Carrom Ball', 'Top-Spinner'],
    description: 'Legendary mystery spinner concealing the ball until the final millisecond.',
    avatarEmoji: '🔮',
  },
  {
    id: 'boult',
    name: 'Trent Boult',
    countryOrTeam: 'New Zealand',
    bowlerStyle: 'FAST',
    styleLabel: 'Left-Arm Fast Swing',
    speedRange: '136 - 144 km/h',
    actionType: 'Whippy Left-Arm Action',
    weapons: ['Banana Inswinger', 'Knuckle Ball', 'Searing Yorker'],
    description: 'Master of early swing moving the white ball prodigiously both ways.',
    avatarEmoji: '⚡',
  },
  {
    id: 'hasaranga',
    name: 'Wanindu Hasaranga',
    countryOrTeam: 'Sri Lanka',
    bowlerStyle: 'LEG_SPINNER',
    styleLabel: 'Right-Arm Leg-Spin',
    speedRange: '86 - 95 km/h',
    actionType: 'Quick-Arm Leg Spinner',
    weapons: ['Deceptive Googly', 'Leg-Break Skidder', 'Drifting Slider'],
    description: 'Aggressive wicket-taker who attacks the stumps with subtle wrist revolutions.',
    avatarEmoji: '🌪️',
  },
  {
    id: 'curran',
    name: 'Sam Curran',
    countryOrTeam: 'England',
    bowlerStyle: 'MEDIUM_PACER',
    styleLabel: 'Left-Arm Medium Fast',
    speedRange: '124 - 134 km/h',
    actionType: 'Skiddy Left-Arm Slant',
    weapons: ['Knuckle Slower Ball', 'Wide Yorker', 'Bouncer Cutter'],
    description: 'Crafty variations expert utilizing angle and change of pace.',
    avatarEmoji: '🎯',
  },
];

/**
 * Creates a dynamic bowler profile from squad player information.
 */
function createDynamicBowlerProfile(player: any, bowlerStyle: BowlerStyle, teamName: string): BowlerProfile {
  const isLeftArm = player.bowlingStyle?.toLowerCase().includes('left-arm') || player.bowlingStyle?.toLowerCase().includes('lhb');
  const actionType = isLeftArm 
    ? 'High Left-Arm Athletic Release'
    : 'Classic Right-Arm High Release';

  let speedRange = '130 - 138 km/h';
  let weapons = ['Good Length Seam', 'In-Swinger', 'Slower Cutter'];
  let description = `A reliable bowler for ${teamName}, specializing in clever line and length.`;
  let avatarEmoji = '🏏';

  if (bowlerStyle === 'FAST') {
    speedRange = '140 - 148 km/h';
    weapons = ['Toe-Crusher Yorker', 'Deceptive Slower Ball', 'Searing Bouncer'];
    description = `A spearhead speedster for ${teamName}, delivering raw pace and aggressive lines.`;
    avatarEmoji = '⚡';
  } else if (bowlerStyle === 'MEDIUM_PACER') {
    speedRange = '125 - 135 km/h';
    weapons = ['Off-Cutter Changeup', 'Targeted In-Seamer', 'Deceptive Back-of-Hand'];
    description = `A skilled swing/seam specialist for ${teamName}, utilizing intelligent change-of-pace variations.`;
    avatarEmoji = '🎯';
  } else if (bowlerStyle === 'OFF_SPINNER') {
    speedRange = '88 - 96 km/h';
    weapons = ['Sharp Off-Break', 'Doosra Slider', 'Skidding Arm Ball'];
    description = `A crafty finger spinner for ${teamName}, extracting turn and bounce from the surface.`;
    avatarEmoji = '🌀';
  } else if (bowlerStyle === 'LEG_SPINNER') {
    speedRange = '84 - 94 km/h';
    weapons = ['Sharp Leg-Break', 'Unpredictable Googly', 'Skidding Flipper'];
    description = `A dangerous wrist spinner for ${teamName}, confusing batsmen with sharp lateral turn.`;
    avatarEmoji = '🌪️';
  } else if (bowlerStyle === 'MYSTERY_SPINNER') {
    speedRange = '86 - 95 km/h';
    weapons = ['Carrom Ball', 'Concealed Slider', 'Top-Spinner'];
    description = `An unorthodox mystery bowler for ${teamName}, delivering deceptive flicked variations.`;
    avatarEmoji = '🔮';
  }

  return {
    id: player.id,
    name: player.name,
    countryOrTeam: teamName,
    bowlerStyle,
    styleLabel: player.bowlingStyle || (isLeftArm ? `Left-Arm ${bowlerStyle.replace('_', ' ')}` : `Right-Arm ${bowlerStyle.replace('_', ' ')}`),
    speedRange,
    actionType,
    weapons,
    description,
    avatarEmoji,
  };
}

/**
 * Returns bowler profile for the current over, resolving team rosters dynamically.
 */
export function getBowlerProfileForOver(
  overIndex: number,
  arg2: any,
  arg3?: any
): BowlerProfile {
  let opponentTeamId: string | undefined = undefined;
  let bowlerStyle: BowlerStyle = 'FAST';
  let practiceStyle: BowlerFilter = 'AUTO';
  let isOldSignature = false;

  const validBowlerStyles = ['FAST', 'MEDIUM_PACER', 'OFF_SPINNER', 'LEG_SPINNER', 'MYSTERY_SPINNER'];

  if (typeof arg2 === 'string' && validBowlerStyles.includes(arg2)) {
    // Old signature compatibility: (overIndex, bowlerStyle, opponentTeamName)
    isOldSignature = true;
    bowlerStyle = arg2 as BowlerStyle;
    const opponentTeamName = arg3;
    if (opponentTeamName) {
      opponentTeamId = opponentTeamName.toLowerCase();
    }
  } else {
    // New signature: (overIndex, opponentTeamId, practiceStyle)
    opponentTeamId = arg2;
    practiceStyle = arg3 || 'AUTO';

    // Resolve bowlerStyle based on practiceStyle and overIndex
    if (practiceStyle === 'AUTO') {
      const cycle = overIndex % 5;
      if (cycle === 0) {
        bowlerStyle = 'MEDIUM_PACER';
      } else if (cycle === 1) {
        bowlerStyle = 'FAST';
      } else if (cycle === 2) {
        bowlerStyle = 'OFF_SPINNER';
      } else if (cycle === 3) {
        bowlerStyle = 'LEG_SPINNER';
      } else {
        bowlerStyle = 'MYSTERY_SPINNER';
      }
    } else {
      if (practiceStyle === 'PACER') bowlerStyle = 'FAST';
      else if (practiceStyle === 'MEDIUM_PACE') bowlerStyle = 'MEDIUM_PACER';
      else if (practiceStyle === 'OFF_SPIN') bowlerStyle = 'OFF_SPINNER';
      else if (practiceStyle === 'LEG_SPIN') bowlerStyle = 'LEG_SPINNER';
      else if (practiceStyle === 'MYSTERY_SPIN') bowlerStyle = 'MYSTERY_SPINNER';
      else bowlerStyle = 'FAST';
    }
  }

  // 1. Resolve opponent team's display name
  let teamName = 'Opposition';
  if (opponentTeamId) {
    const idLower = opponentTeamId.toLowerCase();
    const wcTeam = WORLD_CUP_TEAMS.find((t) => t.id.toLowerCase() === idLower);
    if (wcTeam) {
      teamName = wcTeam.name;
    } else {
      const iplTeam = IPL_TEAMS.find((t) => t.id.toLowerCase() === idLower);
      if (iplTeam) {
        teamName = iplTeam.name;
      } else if (isOldSignature && arg3) {
        teamName = arg3;
      } else {
        teamName = opponentTeamId.toUpperCase();
      }
    }
  }

  // 2. Fetch the squad for the opponent team
  let squad: any[] = [];
  if (opponentTeamId) {
    const idLower = opponentTeamId.toLowerCase();
    squad = (TEAM_SQUADS as any)[idLower] || (IPL_SQUADS as any)[idLower] || [];
  }

  // 3. Filter squad players who can bowl
  const allBowlers = squad.filter((p) => 
    p.bowlingStyle || 
    p.role === 'BOWLER' || 
    p.role === 'ALL_ROUNDER'
  );

  const isMatch = (playerBowlingStyle: string | undefined, target: BowlerStyle): boolean => {
    if (!playerBowlingStyle) return false;
    const styleLower = playerBowlingStyle.toLowerCase();
    switch (target) {
      case 'FAST':
        return styleLower.includes('fast') && !styleLower.includes('medium');
      case 'MEDIUM_PACER':
        return styleLower.includes('medium');
      case 'OFF_SPINNER':
        return styleLower.includes('off spin') || styleLower.includes('orthodox') || styleLower.includes('off-break');
      case 'LEG_SPINNER':
        return styleLower.includes('leg spin') || styleLower.includes('wrist spin') || styleLower.includes('googly') || styleLower.includes('leg-break');
      case 'MYSTERY_SPINNER':
        return styleLower.includes('mystery') || styleLower.includes('carrom') || styleLower.includes('chinaman') || styleLower.includes('left-arm wrist');
      default:
        return false;
    }
  };

  // 4. Try to find bowlers of the exact requested style in the squad
  let matchingBowlers = allBowlers.filter((p) => isMatch(p.bowlingStyle, bowlerStyle));

  // If no exact matches, relax filter to general category (pacer vs spinner)
  if (matchingBowlers.length === 0) {
    const isSpinner = bowlerStyle === 'OFF_SPINNER' || bowlerStyle === 'LEG_SPINNER' || bowlerStyle === 'MYSTERY_SPINNER';
    matchingBowlers = allBowlers.filter((p) => {
      if (!p.bowlingStyle) return false;
      const styleLower = p.bowlingStyle.toLowerCase();
      const isPlayerSpinner = styleLower.includes('spin') || styleLower.includes('orthodox') || styleLower.includes('break') || styleLower.includes('chinaman');
      return isSpinner ? isPlayerSpinner : !isPlayerSpinner;
    });
  }

  // If still no bowlers found, fall back to any bowler/all-rounder in the squad
  if (matchingBowlers.length === 0) {
    matchingBowlers = allBowlers;
  }

  // 5. Select the bowler!
  let selectedPlayer: any = null;
  if (matchingBowlers.length > 0) {
    selectedPlayer = matchingBowlers[overIndex % matchingBowlers.length];
  }

  if (selectedPlayer) {
    const pNameLower = selectedPlayer.name.toLowerCase();
    const pLastName = pNameLower.split(' ').pop() || '';
    
    // Find matching famous bowler profile
    const famousMatch = FAMOUS_BOWLERS.find((fb) => {
      const fbNameLower = fb.name.toLowerCase();
      return (
        fbNameLower === pNameLower ||
        fbNameLower.includes(pLastName) ||
        pNameLower.includes(fb.id)
      );
    });

    if (famousMatch) {
      return {
        ...famousMatch,
        countryOrTeam: teamName,
      };
    }

    return createDynamicBowlerProfile(selectedPlayer, bowlerStyle, teamName);
  }

  // 6. Absolute Fallback to Famous Bowlers list
  const fallbackBowler = FAMOUS_BOWLERS.filter((b) => b.bowlerStyle === bowlerStyle);
  if (fallbackBowler.length > 0) {
    const bowler = fallbackBowler[overIndex % fallbackBowler.length];
    return {
      ...bowler,
      countryOrTeam: teamName,
    };
  }

  const absoluteFallback = FAMOUS_BOWLERS[overIndex % FAMOUS_BOWLERS.length];
  return {
    ...absoluteFallback,
    bowlerStyle,
    countryOrTeam: teamName,
  };
}
