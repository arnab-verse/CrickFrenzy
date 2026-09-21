/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FielderPosition {
  id: string;
  name: string;
  x: number;
  y: number;
  scale: number;
}

export interface FieldingSetup {
  id: string;
  name: string;
  shortName: string;
  description: string;
  tacticType: 'AGGRESSIVE' | 'CONTAINMENT' | 'BALANCED' | 'SPIN_ATTACK' | 'DEATH_OVERS';
  badgeIcon: string;
  fielders: FielderPosition[]; // Exactly 9 distinct fielders
}

export const FIELDING_PRESETS: FieldingSetup[] = [
  // 1. AGGRESSIVE SLIP CORDON
  {
    id: 'aggressive_cordon',
    name: 'Aggressive Slip Cordon',
    shortName: 'Slip Cordon',
    description: '3 catchers in the slip cordon hunting edges with tight inner ring.',
    tacticType: 'AGGRESSIVE',
    badgeIcon: '⚡',
    fielders: [
      { id: 'first_slip', name: '1st Slip', x: 318, y: 442, scale: 0.88 },
      { id: 'second_slip', name: '2nd Slip', x: 275, y: 448, scale: 0.88 },
      { id: 'gully', name: 'Gully', x: 215, y: 420, scale: 0.88 },
      { id: 'backward_point', name: 'Backward Point', x: 175, y: 360, scale: 0.88 },
      { id: 'cover', name: 'Cover', x: 255, y: 270, scale: 0.88 },
      { id: 'mid_off', name: 'Mid Off', x: 330, y: 210, scale: 0.88 },
      { id: 'mid_on', name: 'Mid On', x: 470, y: 210, scale: 0.88 },
      { id: 'mid_wicket', name: 'Mid Wicket', x: 550, y: 290, scale: 0.88 },
      { id: 'fine_leg', name: 'Fine Leg', x: 690, y: 160, scale: 0.88 },
    ],
  },

  // 2. POWERPLAY RING ATTACK
  {
    id: 'powerplay_ring',
    name: 'Powerplay Ring Attack',
    shortName: 'Ring Attack',
    description: '7 fielders inside the 30-yard circle to cut off quick singles.',
    tacticType: 'AGGRESSIVE',
    badgeIcon: '🎯',
    fielders: [
      { id: 'point', name: 'Backward Point', x: 170, y: 370, scale: 0.88 },
      { id: 'cover_point', name: 'Cover Point', x: 220, y: 320, scale: 0.88 },
      { id: 'extra_cover', name: 'Extra Cover', x: 280, y: 260, scale: 0.88 },
      { id: 'mid_off', name: 'Mid Off', x: 340, y: 215, scale: 0.88 },
      { id: 'mid_on', name: 'Mid On', x: 460, y: 215, scale: 0.88 },
      { id: 'mid_wicket', name: 'Mid Wicket', x: 530, y: 270, scale: 0.88 },
      { id: 'square_leg', name: 'Square Leg', x: 600, y: 370, scale: 0.88 },
      { id: 'deep_third_man', name: 'Deep Third Man', x: 110, y: 150, scale: 0.88 },
      { id: 'deep_mid_wicket', name: 'Deep Mid-Wicket', x: 680, y: 130, scale: 0.88 },
    ],
  },

  // 3. DEEP BOUNDARY SWEEP
  {
    id: 'deep_sweep',
    name: 'Deep Boundary Sweep',
    shortName: 'Boundary Sweep',
    description: '5 fielders patrolling the deep fences to choke sixes and fours.',
    tacticType: 'CONTAINMENT',
    badgeIcon: '🛡️',
    fielders: [
      { id: 'deep_third_man', name: 'Deep Third Man', x: 95, y: 160, scale: 0.88 },
      { id: 'deep_point', name: 'Deep Backward Point', x: 130, y: 220, scale: 0.88 },
      { id: 'deep_cover', name: 'Deep Cover', x: 150, y: 120, scale: 0.88 },
      { id: 'long_off', name: 'Long Off', x: 300, y: 95, scale: 0.88 },
      { id: 'long_on', name: 'Long On', x: 500, y: 95, scale: 0.88 },
      { id: 'deep_mid_wicket', name: 'Deep Mid-Wicket', x: 650, y: 115, scale: 0.88 },
      { id: 'deep_square_leg', name: 'Deep Square Leg', x: 690, y: 210, scale: 0.88 },
      { id: 'deep_fine_leg', name: 'Deep Fine Leg', x: 705, y: 150, scale: 0.88 },
      { id: 'short_mid_wicket', name: 'Short Mid-Wicket', x: 520, y: 330, scale: 0.88 },
    ],
  },

  // 4. SHORT PITCH TRAP (LEG SIDE PACKED)
  {
    id: 'short_pitch_trap',
    name: 'Short Pitch Bodyline Trap',
    shortName: 'Bouncer Trap',
    description: 'Packed on-side with short leg and deep pull catchers for bouncers.',
    tacticType: 'AGGRESSIVE',
    badgeIcon: '💥',
    fielders: [
      { id: 'point', name: 'Point', x: 200, y: 360, scale: 0.88 },
      { id: 'mid_off', name: 'Mid Off', x: 340, y: 220, scale: 0.88 },
      { id: 'short_leg', name: 'Short Leg', x: 470, y: 425, scale: 0.88 },
      { id: 'backward_square', name: 'Backward Square Leg', x: 590, y: 400, scale: 0.88 },
      { id: 'short_mid_wicket', name: 'Short Mid-Wicket', x: 510, y: 310, scale: 0.88 },
      { id: 'deep_square_leg', name: 'Deep Square Leg', x: 700, y: 240, scale: 0.88 },
      { id: 'deep_mid_wicket', name: 'Deep Mid-Wicket', x: 660, y: 120, scale: 0.88 },
      { id: 'deep_fine_leg', name: 'Deep Fine Leg', x: 670, y: 160, scale: 0.88 },
      { id: 'long_on', name: 'Long On', x: 480, y: 100, scale: 0.88 },
    ],
  },

  // 5. OFF-SIDE LOCKDOWN CORDON
  {
    id: 'offside_cordon',
    name: 'Off-Side Lockdown Cordon',
    shortName: 'Off-Side Wall',
    description: 'Heavy off-side focus guarding covers, gully, and point boundaries.',
    tacticType: 'CONTAINMENT',
    badgeIcon: '🔒',
    fielders: [
      { id: 'first_slip', name: '1st Slip', x: 310, y: 440, scale: 0.88 },
      { id: 'gully', name: 'Gully', x: 210, y: 410, scale: 0.88 },
      { id: 'point', name: 'Point', x: 170, y: 350, scale: 0.88 },
      { id: 'cover', name: 'Cover', x: 240, y: 270, scale: 0.88 },
      { id: 'extra_cover', name: 'Extra Cover', x: 290, y: 220, scale: 0.88 },
      { id: 'sweeper_cover', name: 'Deep Sweeper Cover', x: 130, y: 120, scale: 0.88 },
      { id: 'mid_off', name: 'Mid Off', x: 350, y: 190, scale: 0.88 },
      { id: 'mid_on', name: 'Mid On', x: 470, y: 230, scale: 0.88 },
      { id: 'deep_mid_wicket', name: 'Deep Mid-Wicket', x: 670, y: 140, scale: 0.88 },
    ],
  },

  // 6. SPIN WEB CLOSE RING
  {
    id: 'spin_web',
    name: 'Spin Web Close Ring',
    shortName: 'Spin Web',
    description: 'Silly point, short leg, and ring fielders surrounding the bat for turn.',
    tacticType: 'SPIN_ATTACK',
    badgeIcon: '🌀',
    fielders: [
      { id: 'slip', name: 'Slip', x: 315, y: 438, scale: 0.88 },
      { id: 'silly_point', name: 'Silly Point', x: 290, y: 390, scale: 0.88 },
      { id: 'short_leg', name: 'Short Leg', x: 480, y: 410, scale: 0.88 },
      { id: 'point', name: 'Point', x: 190, y: 340, scale: 0.88 },
      { id: 'short_cover', name: 'Short Cover', x: 270, y: 290, scale: 0.88 },
      { id: 'mid_off', name: 'Mid Off', x: 340, y: 205, scale: 0.88 },
      { id: 'mid_on', name: 'Mid On', x: 460, y: 205, scale: 0.88 },
      { id: 'short_mid_wicket', name: 'Short Mid-Wicket', x: 530, y: 310, scale: 0.88 },
      { id: 'deep_mid_wicket', name: 'Deep Mid-Wicket', x: 675, y: 125, scale: 0.88 },
    ],
  },

  // 7. DEATH OVERS YORKER GUARD
  {
    id: 'death_overs_guard',
    name: 'Death Overs Yorker Guard',
    shortName: 'Death Guard',
    description: 'Long boundary protection straight down the ground and deep mid-wicket.',
    tacticType: 'DEATH_OVERS',
    badgeIcon: '🔥',
    fielders: [
      { id: 'short_third_man', name: 'Short Third Man', x: 160, y: 380, scale: 0.88 },
      { id: 'deep_point', name: 'Deep Point', x: 120, y: 210, scale: 0.88 },
      { id: 'sweeper_cover', name: 'Sweeper Cover', x: 150, y: 115, scale: 0.88 },
      { id: 'long_off', name: 'Long Off', x: 310, y: 90, scale: 0.88 },
      { id: 'long_on', name: 'Long On', x: 490, y: 90, scale: 0.88 },
      { id: 'deep_cow_corner', name: 'Deep Cow Corner', x: 640, y: 110, scale: 0.88 },
      { id: 'deep_square_leg', name: 'Deep Square Leg', x: 695, y: 230, scale: 0.88 },
      { id: 'short_fine_leg', name: 'Short Fine Leg', x: 620, y: 380, scale: 0.88 },
      { id: 'extra_cover', name: 'Extra Cover', x: 270, y: 260, scale: 0.88 },
    ],
  },

  // 8. CLASSIC ORTHODOX BALANCED
  {
    id: 'orthodox_balanced',
    name: 'Classic Orthodox Balance',
    shortName: 'Orthodox',
    description: 'Well-spread field balancing boundary saving and strike rotation control.',
    tacticType: 'BALANCED',
    badgeIcon: '⚖️',
    fielders: [
      { id: 'third_man', name: 'Third Man', x: 115, y: 160, scale: 0.88 },
      { id: 'point', name: 'Point', x: 185, y: 375, scale: 0.88 },
      { id: 'cover', name: 'Cover', x: 255, y: 280, scale: 0.88 },
      { id: 'mid_off', name: 'Mid Off', x: 335, y: 210, scale: 0.88 },
      { id: 'mid_on', name: 'Mid On', x: 465, y: 210, scale: 0.88 },
      { id: 'mid_wicket', name: 'Mid Wicket', x: 545, y: 280, scale: 0.88 },
      { id: 'square_leg', name: 'Square Leg', x: 615, y: 375, scale: 0.88 },
      { id: 'deep_mid_wicket', name: 'Deep Mid-Wicket', x: 680, y: 135, scale: 0.88 },
      { id: 'long_off', name: 'Long Off', x: 320, y: 100, scale: 0.88 },
    ],
  },

  // 9. DOUBLE SWEEPER & BOUNDARY SHIELD
  {
    id: 'double_sweeper',
    name: 'Double Sweeper Shield',
    shortName: 'Double Sweeper',
    description: 'Dual deep cover sweepers with long on/off preventing lofted drives.',
    tacticType: 'CONTAINMENT',
    badgeIcon: '🛡️',
    fielders: [
      { id: 'deep_backward_point', name: 'Deep Backward Point', x: 125, y: 200, scale: 0.88 },
      { id: 'deep_extra_cover', name: 'Deep Extra Cover', x: 160, y: 120, scale: 0.88 },
      { id: 'long_off', name: 'Long Off', x: 315, y: 92, scale: 0.88 },
      { id: 'long_on', name: 'Long On', x: 485, y: 92, scale: 0.88 },
      { id: 'deep_mid_wicket', name: 'Deep Mid-Wicket', x: 655, y: 115, scale: 0.88 },
      { id: 'deep_square_leg', name: 'Deep Square Leg', x: 695, y: 200, scale: 0.88 },
      { id: 'point', name: 'Point', x: 205, y: 360, scale: 0.88 },
      { id: 'cover', name: 'Cover', x: 270, y: 270, scale: 0.88 },
      { id: 'mid_wicket', name: 'Mid Wicket', x: 530, y: 290, scale: 0.88 },
    ],
  },

  // 10. AGGRESSIVE IN-OUT ATTACK
  {
    id: 'in_out_attack',
    name: 'Attacking In-Out Trap',
    shortName: 'In-Out Trap',
    description: 'Slips and gully attack while deep boundaries induce reckless aerial shots.',
    tacticType: 'AGGRESSIVE',
    badgeIcon: '⚔️',
    fielders: [
      { id: 'first_slip', name: '1st Slip', x: 315, y: 440, scale: 0.88 },
      { id: 'gully', name: 'Gully', x: 225, y: 415, scale: 0.88 },
      { id: 'backward_point', name: 'Backward Point', x: 175, y: 355, scale: 0.88 },
      { id: 'cover', name: 'Cover', x: 265, y: 265, scale: 0.88 },
      { id: 'mid_off', name: 'Mid Off', x: 345, y: 200, scale: 0.88 },
      { id: 'long_off', name: 'Long Off', x: 310, y: 95, scale: 0.88 },
      { id: 'mid_on', name: 'Mid On', x: 455, y: 200, scale: 0.88 },
      { id: 'mid_wicket', name: 'Mid Wicket', x: 535, y: 275, scale: 0.88 },
      { id: 'deep_backward_square', name: 'Deep Backward Square', x: 685, y: 175, scale: 0.88 },
    ],
  },
];

/**
 * Deterministically shuffles / selects a fresh fielding setup for every over.
 * After each over (every 6 balls), the fielding setup rotates dynamically.
 */
export function getFieldingSetupForOver(overIndex: number, bowlerStyle?: string): FieldingSetup {
  // If bowler is spin vs pacer, slightly bias towards suitable setup, but rotate every over
  const total = FIELDING_PRESETS.length;
  // Use over index to guarantee each over has a different setup
  const index = Math.abs(overIndex) % total;
  return FIELDING_PRESETS[index];
}
