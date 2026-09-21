import React from 'react';
import { BatterArchetype } from '../types';

/**
 * RealisticCricketCharacters.tsx
 * High-fidelity, realistically proportioned cricket characters for Timing Cricket:
 * - Realistic Batsman (pro pads with cane ribs & knee bolsters, Shrey/Masuri helmet with steel grille, English willow bat, multi-flex sausage gloves)
 * - Realistic Bowler (athletic running anatomy, strides, delivery jump, windmill release & follow-through)
 * - Realistic Wicket Keeper (low crouching squat, wicketkeeping pads & webbing catching gloves)
 * - Realistic Fielders (athletic ready postures, caps, catching extensions)
 * - Realistic Match Umpire (official blazer, sunhat, authoritative boundary & wicket signals)
 */

export interface CharacterTeamColors {
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  textColor?: string;
}

/**
 * Global SVG Gradients & Filters for realistic lighting, leather, willow, steel, and fabric sheen
 */
const CricketCharacterGradientsComponent: React.FC<{
  playerColors?: CharacterTeamColors;
  opponentColors?: CharacterTeamColors;
}> = ({ playerColors, opponentColors }) => {
  const pPrimary = playerColors?.primaryColor || '#1d4ed8';
  const pSecondary = playerColors?.secondaryColor || '#ea580c';
  const oppPrimary = opponentColors?.primaryColor || '#0284c7';
  const oppSecondary = opponentColors?.secondaryColor || '#0369a1';

  return (
    <defs>
      {/* 1. Realistic Skin Tone Gradients */}
      <linearGradient id="skinGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f7d4be" />
        <stop offset="45%" stopColor="#eab598" />
        <stop offset="100%" stopColor="#c58d6e" />
      </linearGradient>

      <linearGradient id="skinShadowGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#dfa585" />
        <stop offset="100%" stopColor="#ad6f4c" />
      </linearGradient>

      {/* 2. Realistic Batting Pad 3D Shading (Cylindrical shine on white leather) */}
      <linearGradient id="padLeatherGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="20%" stopColor="#f8fafc" />
        <stop offset="50%" stopColor="#ffffff" />
        <stop offset="80%" stopColor="#f1f5f9" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>

      <linearGradient id="padRibHighlight" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="35%" stopColor="#ffffff" />
        <stop offset="70%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>

      <linearGradient id="padKneeBolsterGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="50%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </linearGradient>

      {/* 3. English Willow Cricket Bat (Natural wood grain & spine curve) */}
      <linearGradient id="batWillowFace" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#b45309" />
        <stop offset="12%" stopColor="#d97706" />
        <stop offset="35%" stopColor="#fde68a" />
        <stop offset="55%" stopColor="#fef3c7" />
        <stop offset="80%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>

      <linearGradient id="batSpineShade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#78350f" />
        <stop offset="50%" stopColor="#92400e" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>

      <linearGradient id="batRubberGrip" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="40%" stopColor="#f8fafc" />
        <stop offset="70%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>

      {/* 4. Pro Helmet & Visor Gradients (Aerodynamic shell & steel grille) */}
      <linearGradient id="helmetShellGloss" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="30%" stopColor="#475569" />
        <stop offset="60%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>

      <linearGradient id="steelGrilleGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="40%" stopColor="#f8fafc" />
        <stop offset="75%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>

      {/* 5. Cricket Shoes (White athletic leather with sole cleats) */}
      <linearGradient id="shoeLeatherGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="70%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>

      {/* 6. Batting Gloves (High-density foam split-finger sausage rolls) */}
      <linearGradient id="gloveFoamGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="30%" stopColor="#ffffff" />
        <stop offset="75%" stopColor="#f1f5f9" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>

      {/* 7. Player Team Jersey Gradient */}
      <linearGradient id="playerJerseyGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={pPrimary} />
        <stop offset="70%" stopColor={pPrimary} />
        <stop offset="100%" stopColor={pSecondary} />
      </linearGradient>

      {/* 8. Opponent Team Jersey Gradient */}
      <linearGradient id="oppJerseyGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={oppPrimary} />
        <stop offset="70%" stopColor={oppPrimary} />
        <stop offset="100%" stopColor={oppSecondary} />
      </linearGradient>

      {/* 9. Match Umpire Official Blazer Gradient */}
      <linearGradient id="umpireBlazerGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="65%" stopColor="#f1f5f9" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </linearGradient>

      <linearGradient id="umpirePantsGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="50%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>

      {/* 10. Motion Blur Swing Streaks */}
      <linearGradient id="swingTrailGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.95" />
        <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
      </linearGradient>

      {/* 11. Holographic Chrome & Gold Foil Brand Sticker Gradient */}
      <linearGradient id="hologramFoilGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="25%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#38bdf8" />
        <stop offset="75%" stopColor="#f43f5e" />
        <stop offset="100%" stopColor="#eab308" />
      </linearGradient>

      {/* 12. Gold Championship Emblem Gradient */}
      <linearGradient id="goldEmblemGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="40%" stopColor="#f59e0b" />
        <stop offset="80%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#92400e" />
      </linearGradient>

      {/* 13. Titanium Helmet Grille Metallic Sheen */}
      <linearGradient id="titaniumGrilleGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="30%" stopColor="#f8fafc" />
        <stop offset="60%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>

      {/* 14. High-Power Electric Boundary Swing Streak */}
      <linearGradient id="powerSwingTrailGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
        <stop offset="30%" stopColor="#818cf8" stopOpacity="0.75" />
        <stop offset="70%" stopColor="#f43f5e" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
      </linearGradient>

      {/* 15. Ball Boundary Smoke Puff Gradient (Soft translucent vapor puff) */}
      <radialGradient id="smokePuffGrad" cx="45%" cy="45%" r="55%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
        <stop offset="35%" stopColor="#e2e8f0" stopOpacity="0.6" />
        <stop offset="70%" stopColor="#94a3b8" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#64748b" stopOpacity="0" />
      </radialGradient>

      {/* 16. Maximum 6 Fiery Core Vapor Smoke Gradient */}
      <radialGradient id="sixSmokePuffGrad" cx="45%" cy="45%" r="55%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="25%" stopColor="#fef08a" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.55" />
        <stop offset="75%" stopColor="#94a3b8" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#475569" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
};

export const CricketCharacterGradients = React.memo(CricketCharacterGradientsComponent);

/**
 * Realistic Batting Pad Component (3D contoured cane ribs, knee bolster, instep & straps)
 */
const RealisticBattingPad: React.FC<{
  x: number;
  y: number;
  width?: number;
  height?: number;
  isFrontLeg?: boolean;
  opacity?: number | string;
}> = ({ x, y, width = 14, height = 34, isFrontLeg = false, opacity = 1 }) => {
  return (
    <g transform={`translate(${x}, ${y})`} opacity={opacity}>
      {/* Outer Contour & Padded Shell */}
      <rect
        x={-width / 2}
        y={-height}
        width={width}
        height={height}
        rx={3.5}
        fill="url(#padLeatherGrad)"
        stroke="#94a3b8"
        strokeWidth="0.8"
      />

      {/* Vertical Cane Ribs (7 distinct padded ribs) */}
      {[-4.8, -3.2, -1.6, 0, 1.6, 3.2, 4.8].map((rx, idx) => (
        <line
          key={idx}
          x1={rx}
          y1={-height + 3}
          x2={rx}
          y2={-8}
          stroke="url(#padRibHighlight)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      ))}

      {/* Knee Roll Bolster (Horizontal stitched cushioning over knee joint) */}
      <rect
        x={-width / 2 - 0.5}
        y={-height + 7}
        width={width + 1}
        height={5.5}
        rx={2}
        fill="url(#padKneeBolsterGrad)"
        stroke="#94a3b8"
        strokeWidth="0.6"
      />
      <line
        x1={-width / 2}
        y1={-height + 9.5}
        x2={width / 2}
        y2={-height + 9.5}
        stroke="#64748b"
        strokeWidth="0.5"
      />

      {/* Knee Roll Center Emblem (Brand Diamond Cushion) */}
      <polygon
        points={`0,${-height + 7.5} 2,${-height + 9.5} 0,${-height + 11.5} -2,${-height + 9.5}`}
        fill="#1e293b"
      />

      {/* Top Hat (Upper flap protecting lower thigh) */}
      <path
        d={`M ${-width / 2 + 1} ${-height} Q 0 ${-height - 4} ${width / 2 - 1} ${-height} Z`}
        fill="url(#padLeatherGrad)"
        stroke="#94a3b8"
        strokeWidth="0.7"
      />

      {/* Ankle Instep Tongue (Curves over shoe laces) */}
      <path
        d={`M ${-width / 2 + 1.5} -8 C ${-width / 2 + 1.5} -1, ${width / 2 - 1.5} -1, ${width / 2 - 1.5} -8 Z`}
        fill="url(#padKneeBolsterGrad)"
        stroke="#94a3b8"
        strokeWidth="0.6"
      />

      {/* Fastening Straps (Calf, Knee, Ankle velcro tabs) */}
      {isFrontLeg && (
        <g opacity="0.85">
          <rect x={width / 2 - 1} y={-height + 8} width={2.5} height={3} rx={0.8} fill="#334155" />
          <rect x={width / 2 - 1} y={-height + 20} width={2.5} height={3} rx={0.8} fill="#334155" />
          <rect x={width / 2 - 1} y={-4} width={2.5} height={2.5} rx={0.8} fill="#334155" />
        </g>
      )}
    </g>
  );
};

/**
 * Realistic Cricket Spike / Shoe
 */
const RealisticCricketShoe: React.FC<{
  x: number;
  y: number;
  facingLeft?: boolean;
  opacity?: number | string;
}> = ({ x, y, facingLeft = true, opacity = 1 }) => {
  return (
    <g transform={`translate(${x}, ${y}) scale(${facingLeft ? 1 : -1}, 1)`} opacity={opacity}>
      {/* Sole Tread & Cleats */}
      <rect x="-10" y="3" width="20" height="2.5" rx="1" fill="#0f172a" />
      {/* Cleat Spikes */}
      {[-7, -3, 2, 7].map((sp, idx) => (
        <rect key={idx} x={sp} y="5" width="1.6" height="1.8" rx="0.5" fill="#475569" />
      ))}

      {/* Leather Upper */}
      <path
        d="M -9 3 L -7 -3 C -5 -5 1 -5 5 -4 L 9 -1 C 11 1 11 3 10 3 Z"
        fill="url(#shoeLeatherGrad)"
        stroke="#94a3b8"
        strokeWidth="0.6"
      />

      {/* Toe Cap & Scuff Guard */}
      <path d="M 5 -4 C 8 -3 10 -1 10 3 L 7 3 C 7 0 5 -2 3 -3 Z" fill="#64748b" opacity="0.75" />

      {/* Lace Eyelet Panel */}
      <line x1="-3" y1="-4" x2="3" y2="-2" stroke="#475569" strokeWidth="0.8" strokeDasharray="1,1" />
    </g>
  );
};

/**
 * Realistic Pro Cricket Helmet (Aerodynamic shell, Steel wire grille, Ear guard & StemGuard)
 */
const RealisticProHelmet: React.FC<{
  x: number;
  y: number;
  primaryColor?: string;
}> = ({ x, y, primaryColor = '#1e3a8a' }) => {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Rear Neck Protector (StemGuard shock-absorbing foam) */}
      <path d="M -8 2 Q -12 7 -8 11 Q -3 8 -3 2 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="0.6" />

      {/* Outer Aerodynamic Helmet Shell */}
      <ellipse cx="0" cy="0" rx="10.5" ry="9.5" fill={primaryColor} stroke="#0f172a" strokeWidth="0.8" />
      {/* Golden Championship Crest on Forehead of Helmet */}
      <ellipse cx="1" cy="-2.5" rx="2.2" ry="1.8" fill="url(#goldEmblemGrad)" stroke="#78350f" strokeWidth="0.3" />
      <polygon points="1,-3.5 1.8,-1.8 0.2,-1.8" fill="#ffffff" opacity="0.8" />

      {/* Specular Highlight Sheen along crown */}
      <path
        d="M -7 -6 Q 0 -10 6 -6 Q 3 -8 -4 -8 Z"
        fill="#ffffff"
        opacity="0.45"
      />

      {/* Top Air Vents with carbon edge */}
      <line x1="-4" y1="-6" x2="-2" y2="-7" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="2" y1="-7" x2="4" y2="-6" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />

      {/* Helmet Peak / Sun Visor with aerodynamic lip */}
      <path d="M 4 -3 L 13 -1 L 8 2 L 3 1 Z" fill="#0f172a" opacity="0.95" />
      <line x1="4" y1="-2" x2="12" y2="-0.5" stroke="#64748b" strokeWidth="0.6" />

      {/* Ear Protection Guard with acoustic holes */}
      <ellipse cx="-2" cy="3" rx="3.5" ry="4" fill="#0f172a" stroke="#475569" strokeWidth="0.5" />
      <circle cx="-2" cy="3" r="1.2" fill="#334155" />

      {/* Dark Interior Opening (Behind grille) */}
      <path d="M 2 -1 L 9 0 L 8 6 L 1 5 Z" fill="#1c1917" />
      {/* Focused Eye & Brow line in shadow */}
      <line x1="4" y1="1" x2="7" y2="1.5" stroke="#f8fafc" strokeWidth="1" opacity="0.9" />

      {/* Titanium Wire-Mesh Grille (Visor) */}
      {/* Horizontal Curved Steel Bars */}
      <path d="M 2 0 Q 7 0 10 1" stroke="url(#titaniumGrilleGrad)" strokeWidth="1.1" fill="none" />
      <path d="M 1 2.5 Q 7 3 10 3" stroke="url(#titaniumGrilleGrad)" strokeWidth="1.1" fill="none" />
      <path d="M 0 5 Q 6 5.5 9 5.5" stroke="url(#titaniumGrilleGrad)" strokeWidth="1.1" fill="none" />
      <path d="M -1 7.5 Q 4 8 8 7.5" stroke="url(#titaniumGrilleGrad)" strokeWidth="1.3" fill="none" />

      {/* Vertical Support Struts */}
      <line x1="5" y1="0" x2="4.5" y2="8" stroke="url(#titaniumGrilleGrad)" strokeWidth="1" />
      <line x1="8.5" y1="1" x2="7.5" y2="7.5" stroke="url(#titaniumGrilleGrad)" strokeWidth="1" />

      {/* Padded Chin Strap & Clip */}
      <path d="M -2 5 Q 2 9 6 7.5" stroke="#334155" strokeWidth="1.2" fill="none" />
      <rect x="1" y="7" width="2" height="1.5" rx="0.4" fill="#64748b" />
    </g>
  );
};

/**
 * Realistic English Willow Cricket Bat
 */
const RealisticEnglishWillowBat: React.FC<{
  x?: number;
  y?: number;
  rotation?: number;
  scale?: number;
}> = ({ x = 0, y = 0, rotation = 0, scale = 1.0 }) => {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation}) scale(${scale})`}>
      {/* 1. Cane Handle */}
      {/* Rubber Knob Top */}
      <circle cx="0" cy="-21" r="2.8" fill="#1e293b" />
      {/* Cylindrical Handle with Chevron Spiral Rubber Grip */}
      <rect x="-2.2" y="-20" width="4.4" height="20" rx="1.5" fill="url(#batRubberGrip)" stroke="#475569" strokeWidth="0.6" />
      {/* Spiral grip ribs */}
      {[-16, -12, -8, -4].map((gy, idx) => (
        <line key={idx} x1="-2.2" y1={gy} x2="2.2" y2={gy - 1.5} stroke="#334155" strokeWidth="0.7" opacity="0.6" />
      ))}

      {/* 2. Handle Splice Joint into Blade */}
      <polygon points="-3,-1 3,-1 0,5" fill="#b45309" stroke="#78350f" strokeWidth="0.5" />

      {/* 3. The English Willow Blade */}
      {/* Main contoured blade body (thick 38mm edge, mid-to-low swell) */}
      <path
        d="M -5.5 0 L 5.5 0 C 6 12 5.8 28 5 39 C 4.5 41 2.5 42 0 42 C -2.5 42 -4.5 41 -5 39 C -5.8 28 -6 12 -5.5 0 Z"
        fill="url(#batWillowFace)"
        stroke="#78350f"
        strokeWidth="0.8"
      />

      {/* Fine Longitudinal Wood Grain Lines */}
      {[-3.2, -1.2, 0.8, 2.8].map((gx, idx) => (
        <line
          key={idx}
          x1={gx}
          y1={4}
          x2={gx + (idx % 2 === 0 ? 0.3 : -0.3)}
          y2={38}
          stroke="#b45309"
          strokeWidth="0.4"
          opacity="0.45"
        />
      ))}

      {/* Curved Spine Ridge (Raised 3D profile) */}
      <path
        d="M -1 5 Q 0.5 22 0 38"
        stroke="url(#batSpineShade)"
        strokeWidth="1.6"
        fill="none"
        opacity="0.75"
      />

      {/* Pro Manufacturer Holographic Chrome Brand Sticker on Face */}
      <g opacity="0.95">
        <path d="M -4.8 6 L 4.8 6 L 3.8 17 L -3.8 17 Z" fill="url(#hologramFoilGrad)" stroke="#78350f" strokeWidth="0.4" />
        <polygon points="0,8 2.8,14 -2.8,14" fill="url(#goldEmblemGrad)" />
        {/* Holographic Embossed Wordmark */}
        <text x="0" y="13.5" textAnchor="middle" fill="#0f172a" fontSize="3.2" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.2">
          TITAN
        </text>
        <rect x="-4.2" y="24" width="8.4" height="2.5" rx="0.6" fill="url(#hologramFoilGrad)" />
        <rect x="-3" y="28" width="6" height="1.4" rx="0.4" fill="#dc2626" />
      </g>

      {/* Protective Rubber Toe Guard (Black toe-guard) */}
      <path
        d="M -5 39 C -4.5 41 -2.5 42 0 42 C 2.5 42 4.5 41 5 39 L 5 41 C 4.5 42.5 2.5 43.5 0 43.5 C -2.5 43.5 -4.5 42.5 -5 41 Z"
        fill="#0f172a"
      />
    </g>
  );
};

/**
 * Realistic Multi-Flex Batting Glove (High-density sausage padding, split fingers, elastic towel wristband)
 */
const RealisticBattingGlove: React.FC<{
  x: number;
  y: number;
  rotation?: number;
  accentColor?: string;
}> = ({ x, y, rotation = 0, accentColor = '#ea580c' }) => {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      {/* Elastic Towel Wristband */}
      <rect x="-4.5" y="-5" width="9" height="3" rx="1" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.5" />
      <line x1="-4.5" y1="-3.5" x2="4.5" y2="-3.5" stroke={accentColor} strokeWidth="0.8" />

      {/* Glove Back Hand Casing */}
      <rect x="-4.2" y="-2" width="8.4" height="6.5" rx="2" fill="url(#gloveFoamGrad)" stroke="#64748b" strokeWidth="0.6" />

      {/* High-Density EVA Foam Finger Rolls (Split-finger sausage blocks) */}
      {[-3, -1, 1, 3].map((fx, idx) => (
        <rect
          key={idx}
          x={fx - 0.7}
          y={4.5}
          width={1.6}
          height={3.8}
          rx={0.8}
          fill="url(#gloveFoamGrad)"
          stroke="#475569"
          strokeWidth="0.5"
        />
      ))}

      {/* Two-Piece Plastic Reinforced Thumb Guard */}
      <rect x="-5.2" y="0.5" width="2" height="4" rx="0.8" fill={accentColor} stroke="#78350f" strokeWidth="0.5" />
    </g>
  );
};

/**
 * 1. REALISTIC BATSMAN COMPONENT
 */
const RealisticBatsmanComponent: React.FC<{
  isRightHanded: boolean;
  animationState: 'IDLE' | 'BACKLIFT' | 'SWING_OFF' | 'SWING_STRAIGHT' | 'SWING_ON' | 'DEFENSIVE' | 'BOWLED';
  batterArchetype?: BatterArchetype;
  isRunUpActive?: boolean;
  teamPrimaryColor?: string;
  teamSecondaryColor?: string;
  teamAccentColor?: string;
}> = ({
  isRightHanded,
  animationState,
  batterArchetype = 'CLASSICAL',
  isRunUpActive = false,
  teamPrimaryColor = '#1d4ed8',
  teamSecondaryColor = '#ea580c',
  teamAccentColor = '#f59e0b',
}) => {
  // Placement: Near striker crease at y=415. Mirrored naturally for RHB vs LHB
  const posX = isRightHanded ? 376 : 424;
  const scaleX = isRightHanded ? -1 : 1;

  // Stance bob animation class mapped to archetype
  const getStanceBobClass = () => {
    if (animationState !== 'IDLE' || isRunUpActive) return '';
    switch (batterArchetype) {
      case 'AGGRESSIVE':
        return 'animate-stance-bob-aggressive';
      case 'DEFENSIVE':
        return 'animate-stance-bob-defensive';
      case 'UNORTHODOX':
        return 'animate-stance-bob-unorthodox';
      case 'CLASSICAL':
      default:
        return 'animate-stance-bob-classical';
    }
  };

  // Archetype-specific front and back leg offsets for idle posture
  const getLegCoordinates = () => {
    if (animationState.startsWith('SWING') || animationState === 'DEFENSIVE') {
      return { frontFootX: -16, backFootX: 14, frontPadWidth: 14 };
    }
    if (animationState === 'BACKLIFT') {
      return { frontFootX: -10, backFootX: 15, frontPadWidth: 13 };
    }
    switch (batterArchetype) {
      case 'AGGRESSIVE':
        // Wide power base with knee flexed
        return { frontFootX: -11, backFootX: 16, frontPadWidth: 13.5 };
      case 'DEFENSIVE':
        // Compact narrow stance
        return { frontFootX: -4, backFootX: 12, frontPadWidth: 12.5 };
      case 'UNORTHODOX':
        // Open-chested shuffle base
        return { frontFootX: -8, backFootX: 14, frontPadWidth: 13 };
      case 'CLASSICAL':
      default:
        return { frontFootX: -6, backFootX: 14, frontPadWidth: 13 };
    }
  };

  const { frontFootX, backFootX, frontPadWidth } = getLegCoordinates();

  return (
    <g
      id="realistic-batsman"
      transform={`translate(${posX}, 415) scale(${scaleX}, 1)`}
    >
      <g className={`transition-all ${getStanceBobClass()}`}>
        {/* Ground Turf Contact Shadow */}
        <ellipse cx="2" cy="8" rx={batterArchetype === 'AGGRESSIVE' ? 32 : 28} ry="8" fill="#000000" opacity="0.35" />

        {/* 1. BACK LEG (Deeper in perspective) */}
        <g id="back-leg" opacity="0.95">
          {/* Back Cricket Shoe */}
          <RealisticCricketShoe x={backFootX} y={5} facingLeft={false} opacity={0.92} />
          {/* Back Batting Pad */}
          <RealisticBattingPad x={backFootX} y={5} width={12} height={32} isFrontLeg={false} opacity={0.92} />
          {/* Back Trouser Leg into Torso */}
          <path d="M 8 -24 L 18 -24 L 16 -30 L 7 -30 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
        </g>

        {/* 2. FRONT LEG (Leading towards bowler) */}
        <g id="front-leg">
          {/* Front Trouser Leg & Thigh Guard Contour */}
          <path
            d={
              animationState.startsWith('SWING') || animationState === 'DEFENSIVE'
                ? 'M -14 -22 L -2 -22 L 2 -32 L -12 -32 Z'
                : 'M -8 -22 L 4 -22 L 6 -32 L -6 -32 Z'
            }
            fill="#f8fafc"
            stroke="#cbd5e1"
            strokeWidth="0.8"
          />
          {/* Thigh Pad bulge line */}
          <line x1="-7" y1="-28" x2="-2" y2="-24" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />

          {/* Front Cricket Shoe */}
          <RealisticCricketShoe
            x={frontFootX}
            y={4}
            facingLeft={true}
            opacity={1}
          />

          {/* Front Batting Pad (Prominent, High-Detail 3D) */}
          <RealisticBattingPad
            x={frontFootX}
            y={4}
            width={frontPadWidth}
            height={34}
            isFrontLeg={true}
            opacity={1}
          />
        </g>

        {/* 3. ATHLETIC TORSO & MATCH JERSEY */}
        <g id="torso">
          {/* Jersey Main Body (Broad athletic shoulders, athletic taper to waist) */}
          <path
            d="M -11 -30 L 13 -30 L 11 -60 L -9 -60 Z"
            fill="url(#playerJerseyGrad)"
            stroke="#0f172a"
            strokeWidth="0.8"
          />

          {/* Breathable Mesh Side Panels */}
          <path d="M -11 -30 L -9 -60 L -6 -60 L -8 -30 Z" fill={teamSecondaryColor} opacity="0.85" />
          <path d="M 13 -30 L 11 -60 L 8 -60 L 10 -30 Z" fill={teamSecondaryColor} opacity="0.85" />

          {/* Collar & V-Neck Seam Trim */}
          <polygon points="-2,-60 2,-60 0,-54" fill="#ffffff" />
          <line x1="-5" y1="-60" x2="5" y2="-60" stroke="#f8fafc" strokeWidth="1.2" strokeLinecap="round" />

          {/* Team / National Golden Crest on Left Chest */}
          <ellipse cx="3" cy="-52" rx="2.6" ry="2.2" fill="url(#goldEmblemGrad)" stroke="#78350f" strokeWidth="0.4" />
          <circle cx="3" cy="-52" r="1.1" fill="#ffffff" opacity="0.8" />

          {/* Diagonal Jersey Athletic Dynamic Stripe */}
          <path d="M -8 -45 L 8 -37 L 7 -34 L -9 -42 Z" fill="#ffffff" opacity="0.3" />
        </g>

        {/* 4. HEAD & PRO CRICKET HELMET */}
        <g id="head-helmet">
          {/* Neck & Chin */}
          <rect x="-3.5" y="-64" width="7" height="6" rx="2" fill="url(#skinGrad)" stroke="#c58d6e" strokeWidth="0.5" />
          {/* The Pro Cricket Helmet with Steel Grille */}
          <RealisticProHelmet x={2} y="-72" primaryColor={teamPrimaryColor} />
        </g>

        {/* 5. ARMS, ELBOW GUARD, GLOVES & ENGLISH WILLOW BAT (Driven by Animation State & Archetype) */}

        {/* --- A. IDLE STANCES (ARCHETYPE-SPECIFIC) --- */}

        {/* 1. CLASSICAL IDLE STANCES */}
        {animationState === 'IDLE' && batterArchetype === 'CLASSICAL' && (
          isRunUpActive ? (
            <g id="arms-classical-trigger" className="transition-all duration-150">
              {/* Subtle back-and-across press with elegant backlift rise */}
              <path d="M 6 -56 Q 14 -44 10 -36" stroke="url(#skinGrad)" strokeWidth="4.2" strokeLinecap="round" fill="none" />
              <path d="M -6 -56 Q -4 -45 2 -36" stroke="url(#skinGrad)" strokeWidth="4.2" strokeLinecap="round" fill="none" />
              <rect x="-8" y="-48" width="4" height="6" rx="1.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />
              <RealisticBattingGlove x={2} y="-36" rotation={-8} accentColor={teamAccentColor} />
              <RealisticBattingGlove x={8} y="-35" rotation={-5} accentColor={teamAccentColor} />
              <RealisticEnglishWillowBat x={0} y="-33" rotation={-14} scale={1.03} />
            </g>
          ) : (
            <g id="arms-classical-idle" className="animate-bat-tap-classical">
              <path d="M 6 -56 Q 8 -42 2 -32" stroke="url(#skinGrad)" strokeWidth="4.2" strokeLinecap="round" fill="none" />
              <path d="M -6 -56 Q -12 -42 -8 -32" stroke="url(#skinGrad)" strokeWidth="4.2" strokeLinecap="round" fill="none" />
              <rect x="-12" y="-45" width="4" height="6" rx="1.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />
              <RealisticBattingGlove x={-6} y="-32" rotation={-15} accentColor={teamAccentColor} />
              <RealisticBattingGlove x={0} y="-31" rotation={-10} accentColor={teamAccentColor} />
              <RealisticEnglishWillowBat x={-10} y="-28" rotation={-22} scale={1.02} />
            </g>
          )
        )}

        {/* 2. AGGRESSIVE IDLE STANCES (Deep crouch, cocked wrists, high bat hover) */}
        {animationState === 'IDLE' && batterArchetype === 'AGGRESSIVE' && (
          isRunUpActive ? (
            <g id="arms-aggressive-trigger" className="transition-all duration-150">
              {/* Coiled power squat with explosive high backlift toward gully */}
              <path d="M 6 -56 Q 18 -46 14 -38" stroke="url(#skinGrad)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <path d="M -6 -56 Q 4 -48 6 -36" stroke="url(#skinGrad)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <rect x="-4" y="-52" width="4.5" height="6" rx="1.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />
              <RealisticBattingGlove x={6} y="-38" rotation={25} accentColor={teamAccentColor} />
              <RealisticBattingGlove x={12} y="-42" rotation={32} accentColor={teamAccentColor} />
              <RealisticEnglishWillowBat x={10} y="-42" rotation={38} scale={1.06} />
            </g>
          ) : (
            <g id="arms-aggressive-idle" className="animate-bat-tap-aggressive">
              {/* Flared back elbow, high wrists, energetic snappy bat tap */}
              <path d="M 6 -56 Q 16 -44 8 -30" stroke="url(#skinGrad)" strokeWidth="4.4" strokeLinecap="round" fill="none" />
              <path d="M -6 -56 Q -15 -46 -11 -34" stroke="url(#skinGrad)" strokeWidth="4.4" strokeLinecap="round" fill="none" />
              <rect x="-15" y="-49" width="4.5" height="6" rx="1.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />
              <RealisticBattingGlove x={-8} y="-34" rotation={-28} accentColor={teamAccentColor} />
              <RealisticBattingGlove x={-1} y="-32" rotation={-22} accentColor={teamAccentColor} />
              <RealisticEnglishWillowBat x={-14} y="-32" rotation={-34} scale={1.04} />
            </g>
          )
        )}

        {/* 3. DEFENSIVE IDLE STANCES (Compact side-on, grounded bat, soft hands) */}
        {animationState === 'IDLE' && batterArchetype === 'DEFENSIVE' && (
          isRunUpActive ? (
            <g id="arms-defensive-trigger" className="transition-all duration-150">
              {/* Compact forward rock, bat held close to the front pad */}
              <path d="M 6 -56 Q 0 -42 -4 -28" stroke="url(#skinGrad)" strokeWidth="4.0" strokeLinecap="round" fill="none" />
              <path d="M -6 -56 Q -10 -42 -9 -28" stroke="url(#skinGrad)" strokeWidth="4.0" strokeLinecap="round" fill="none" />
              <rect x="-10" y="-43" width="4" height="5.5" rx="1.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />
              <RealisticBattingGlove x={-7} y={-26} rotation={-8} accentColor={teamAccentColor} />
              <RealisticBattingGlove x={-2} y={-24} rotation={-6} accentColor={teamAccentColor} />
              <RealisticEnglishWillowBat x={-8} y={-22} rotation={-8} scale={1.01} />
            </g>
          ) : (
            <g id="arms-defensive-idle" className="animate-bat-tap-defensive">
              {/* Grounded upright bat behind front toe, soft relaxed grip */}
              <path d="M 6 -56 Q 2 -38 0 -22" stroke="url(#skinGrad)" strokeWidth="4.0" strokeLinecap="round" fill="none" />
              <path d="M -6 -56 Q -10 -38 -5 -22" stroke="url(#skinGrad)" strokeWidth="4.0" strokeLinecap="round" fill="none" />
              <rect x="-10" y="-40" width="4" height="5" rx="1.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />
              <RealisticBattingGlove x={-5} y={-22} rotation={-6} accentColor={teamAccentColor} />
              <RealisticBattingGlove x={-1} y={-20} rotation={-4} accentColor={teamAccentColor} />
              <RealisticEnglishWillowBat x={-5} y={-18} rotation={-4} scale={1.0} />
            </g>
          )
        )}

        {/* 4. UNORTHODOX IDLE STANCES (Open-chested shuffle, dynamic wrist waggle) */}
        {animationState === 'IDLE' && batterArchetype === 'UNORTHODOX' && (
          isRunUpActive ? (
            <g id="arms-unorthodox-trigger" className="transition-all duration-150">
              {/* Pronounced shuffle across crease, high angled bat waggle */}
              <path d="M 6 -56 Q 16 -44 12 -36" stroke="url(#skinGrad)" strokeWidth="4.2" strokeLinecap="round" fill="none" />
              <path d="M -6 -56 Q 0 -44 6 -34" stroke="url(#skinGrad)" strokeWidth="4.2" strokeLinecap="round" fill="none" />
              <rect x="-2" y="-48" width="4.5" height="6" rx="1.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />
              <RealisticBattingGlove x={4} y={-38} rotation={18} accentColor={teamAccentColor} />
              <RealisticBattingGlove x={10} y={-42} rotation={24} accentColor={teamAccentColor} />
              <RealisticEnglishWillowBat x={6} y={-40} rotation={26} scale={1.04} />
            </g>
          ) : (
            <g id="arms-unorthodox-idle" className="animate-bat-tap-unorthodox">
              {/* Dynamic open stance, bat waving actively outside off stump */}
              <path d="M 6 -56 Q 18 -42 10 -30" stroke="url(#skinGrad)" strokeWidth="4.2" strokeLinecap="round" fill="none" />
              <path d="M -6 -56 Q -8 -40 -2 -34" stroke="url(#skinGrad)" strokeWidth="4.2" strokeLinecap="round" fill="none" />
              <rect x="-9" y="-46" width="4" height="6" rx="1.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />
              <RealisticBattingGlove x={-2} y={-34} rotation={-14} accentColor={teamAccentColor} />
              <RealisticBattingGlove x={4} y={-32} rotation={-8} accentColor={teamAccentColor} />
              <RealisticEnglishWillowBat x={-2} y={-30} rotation={-14} scale={1.03} />
            </g>
          )
        )}

        {/* B. BACKLIFT: Coiled Power Stance */}
        {animationState === 'BACKLIFT' && (
          <g id="arms-backlift">
            {/* Backlift bat cocked high toward gully / second slip */}
            <RealisticEnglishWillowBat x={18} y="-54" rotation={48} scale={1.04} />

            {/* High flexed elbows and arms */}
            <path d="M 6 -56 Q 16 -50 14 -42" stroke="url(#skinGrad)" strokeWidth="4.2" strokeLinecap="round" fill="none" />
            <path d="M -6 -56 Q 2 -52 10 -45" stroke="url(#skinGrad)" strokeWidth="4.2" strokeLinecap="round" fill="none" />
            <rect x="-1" y="-55" width="4.5" height="5.5" rx="1.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />

            <RealisticBattingGlove x={14} y="-44" rotation={35} accentColor={teamAccentColor} />
            <RealisticBattingGlove x={18} y="-50" rotation={42} accentColor={teamAccentColor} />
          </g>
        )}

      {/* C. SWING_OFF: Text-book Cover Drive / Off-side Punch */}
      {animationState === 'SWING_OFF' && (
        <g id="arms-swing-off">
          {/* Dynamic Dual-Layer Motion Blur Swing Streaks */}
          <path
            d="M 12 -62 Q -18 -74 -48 -38"
            stroke="url(#swingTrailGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
          />
          <path
            d="M 8 -58 Q -16 -68 -44 -36"
            stroke="url(#powerSwingTrailGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* High Front Leading Elbow driving through the line */}
          <path d="M -7 -58 Q -24 -64 -28 -46" stroke="url(#skinGrad)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          {/* Elbow Guard */}
          <rect x="-24" y="-62" width="5" height="6" rx="1.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />
          <path d="M 6 -58 Q -10 -54 -24 -44" stroke="url(#skinGrad)" strokeWidth="4.2" strokeLinecap="round" fill="none" />

          {/* Gloves firmly driving the bat */}
          <RealisticBattingGlove x={-26} y="-46" rotation={-75} accentColor={teamAccentColor} />

          {/* Bat presented down into off-side arc */}
          <RealisticEnglishWillowBat x={-32} y="-42" rotation={-85} scale={1.05} />
        </g>
      )}

      {/* D. SWING_STRAIGHT: Majestic Straight Drive / Lofted Hit */}
      {animationState === 'SWING_STRAIGHT' && (
        <g id="arms-swing-straight">
          {/* Dual-Layer Vertical Swoosh Streaks */}
          <path
            d="M -4 -22 Q -36 -48 -18 -88"
            stroke="url(#swingTrailGrad)"
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
          />
          <path
            d="M -6 -26 Q -32 -50 -16 -84"
            stroke="url(#powerSwingTrailGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />

          {/* Extended arms reaching high skyward */}
          <path d="M -7 -58 Q -14 -68 -16 -76" stroke="url(#skinGrad)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path d="M 6 -58 Q -4 -70 -14 -78" stroke="url(#skinGrad)" strokeWidth="4.2" strokeLinecap="round" fill="none" />
          <rect x="-14" y="-68" width="5" height="6" rx="1.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />

          <RealisticBattingGlove x={-15} y="-78" rotation={-160} accentColor={teamAccentColor} />

          {/* Full Face of the Bat presented straight down the ground */}
          <RealisticEnglishWillowBat x={-18} y="-72" rotation={-165} scale={1.06} />
        </g>
      )}

      {/* E. SWING_ON: Powerful Pull / Flick / Leg Glance */}
      {animationState === 'SWING_ON' && (
        <g id="arms-swing-on">
          {/* Dual-Layer Horizontal Arc Swoosh Streaks */}
          <path
            d="M -22 -52 Q 18 -68 44 -28"
            stroke="url(#swingTrailGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
          />
          <path
            d="M -18 -48 Q 16 -62 40 -26"
            stroke="url(#powerSwingTrailGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Powerful rotational arm sweep */}
          <path d="M -7 -58 Q 12 -58 28 -40" stroke="url(#skinGrad)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path d="M 6 -58 Q 20 -50 30 -36" stroke="url(#skinGrad)" strokeWidth="4.2" strokeLinecap="round" fill="none" />
          <rect x="14" y="-55" width="5" height="6" rx="1.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />

          <RealisticBattingGlove x={29} y="-38" rotation={68} accentColor={teamAccentColor} />

          {/* Bat sweeping through mid-wicket arc */}
          <RealisticEnglishWillowBat x={32} y="-36" rotation={74} scale={1.05} />
        </g>
      )}

      {/* F. DEFENSIVE: Classic Forward Defense */}
      {animationState === 'DEFENSIVE' && (
        <g id="arms-defensive">
          {/* Soft hands, bat tucked close behind front pad */}
          <path d="M -7 -58 Q -14 -45 -14 -24" stroke="url(#skinGrad)" strokeWidth="4.2" strokeLinecap="round" fill="none" />
          <path d="M 6 -58 Q -2 -42 -10 -22" stroke="url(#skinGrad)" strokeWidth="4.2" strokeLinecap="round" fill="none" />
          <rect x="-14" y="-42" width="4.5" height="5.5" rx="1.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />

          <RealisticBattingGlove x={-14} y="-24" rotation={-8} accentColor={teamAccentColor} />

          {/* Angled face deadening ball onto pitch */}
          <RealisticEnglishWillowBat x={-16} y="-22" rotation={-6} scale={1.02} />
        </g>
      )}

      {/* G. BOWLED: Disbelief / Stumps Broken Reaction */}
      {animationState === 'BOWLED' && (
        <g id="arms-bowled">
          {/* Bat fallen from hands onto pitch */}
          <g transform="translate(18, 0) rotate(78)">
            <RealisticEnglishWillowBat x={0} y={0} rotation={0} scale={0.95} />
          </g>
          {/* Hands clutching helmet in disappointment */}
          <path d="M -7 -58 Q -12 -68 -4 -72" stroke="url(#skinGrad)" strokeWidth="3.8" strokeLinecap="round" fill="none" />
          <path d="M 6 -58 Q 12 -68 6 -72" stroke="url(#skinGrad)" strokeWidth="3.8" strokeLinecap="round" fill="none" />
          <RealisticBattingGlove x={-4} y="-72" rotation={-30} accentColor={teamAccentColor} />
          <RealisticBattingGlove x={6} y="-72" rotation={30} accentColor={teamAccentColor} />
        </g>
      )}
      </g>
    </g>
  );
};

export const RealisticBatsman = React.memo(RealisticBatsmanComponent);

/**
 * 2. REALISTIC BOWLER COMPONENT
 */
const RealisticBowlerComponent: React.FC<{
  x: number;
  y: number;
  scale: number;
  bodyBob: number;
  isSpinner: boolean;
  leftLegAngle: number;
  rightLegAngle: number;
  torsoAngle: number;
  leftArmAngle: number;
  rightArmAngle: number;
  showHeldBall: boolean;
  heldBallOffset: { x: number; y: number };
  shadowScale: number;
  primaryColor?: string;
  secondaryColor?: string;
}> = ({
  x,
  y,
  scale,
  bodyBob,
  isSpinner,
  leftLegAngle,
  rightLegAngle,
  torsoAngle,
  leftArmAngle,
  rightArmAngle,
  showHeldBall,
  heldBallOffset,
  shadowScale,
  primaryColor = '#0284c7',
  secondaryColor = '#0369a1',
}) => {
  return (
    <g
      id="realistic-bowler"
      transform={`translate(${x}, ${y + bodyBob}) scale(${scale})`}
    >
      {/* Ground Shadow (dynamically shrinks when airborne) */}
      <ellipse
        cx="12"
        cy="43"
        rx={10 * shadowScale}
        ry={3.8 * shadowScale}
        fill="#000000"
        opacity={0.4 * shadowScale}
      />

      {/* 1. LEFT LEG (Leading / Stride Leg) */}
      <g transform={`rotate(${leftLegAngle}, 12, 30)`}>
        {/* Thigh */}
        <path d="M 10 30 L 14 30 L 12 36 L 9 36 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.6" />
        {/* Calf */}
        <path d="M 9 36 L 12 36 L 10 42 L 7 42 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.6" />
        {/* Running Cleat / Spike */}
        <rect x="6" y="42" width="6" height="2.5" rx="1" fill="#0f172a" />
      </g>

      {/* 2. RIGHT LEG (Push-off / Bowling Stride Leg) */}
      <g transform={`rotate(${rightLegAngle}, 12, 30)`}>
        {/* Thigh */}
        <path d="M 11 30 L 15 30 L 16 36 L 12 36 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.6" />
        {/* Calf */}
        <path d="M 12 36 L 16 36 L 17 42 L 14 42 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.6" />
        {/* Running Cleat / Spike */}
        <rect x="14" y="42" width="6" height="2.5" rx="1" fill="#0f172a" />
      </g>

      {/* 3. ATHLETIC TORSO, HEAD & ARMS (Forward Lean) */}
      <g transform={`rotate(${torsoAngle}, 12, 30)`}>
        {/* Match Jersey Body */}
        <path
          d="M 8 16 L 16 16 L 14 30 L 10 30 Z"
          fill={primaryColor}
          stroke={secondaryColor}
          strokeWidth="0.8"
        />

        {/* Breathable Mesh Side Trim */}
        <path d="M 8 16 L 9.5 16 L 10.5 30 L 10 30 Z" fill={secondaryColor} opacity="0.9" />

        {/* Jersey Shoulder Yoke & Collar */}
        <polygon points="10,16 14,16 12,19" fill="#ffffff" />
        <line x1="8" y1="16" x2="16" y2="16" stroke="#f8fafc" strokeWidth="1" />

        {/* Golden Team Crest on Chest */}
        <ellipse cx="13" cy="21" rx="1.2" ry="1" fill="url(#goldEmblemGrad)" />

        {/* Non-Bowling Balance / Aiming Arm (Left Arm) */}
        <g transform={`rotate(${leftArmAngle}, 12, 18)`}>
          <line x1="10" y1="18" x2="4" y2="28" stroke="url(#skinGrad)" strokeWidth="2.8" strokeLinecap="round" />
          {/* Wristband */}
          <rect x="3" y="26" width="3" height="2" rx="0.5" fill="#f8fafc" />
        </g>

        {/* Bowler Head & Cap / Floppy Hat */}
        {isSpinner ? (
          <g transform="translate(12, 10)">
            {/* Spinner Floppy Sunhat */}
            <circle cx="0" cy="0" r="4.5" fill="url(#skinGrad)" stroke="#c58d6e" strokeWidth="0.5" />
            <ellipse cx="0" cy="-2.5" rx="8" ry="3.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="-4" y="-4" width="8" height="3" rx="1" fill={primaryColor} />
            <ellipse cx="0" cy="-3.5" rx="1.4" ry="1.1" fill="url(#goldEmblemGrad)" />
          </g>
        ) : (
          <g transform="translate(12, 10)">
            {/* Fast Bowler Performance Athletic Cap */}
            <circle cx="0" cy="0" r="4.8" fill="url(#skinGrad)" stroke="#c58d6e" strokeWidth="0.5" />
            {/* Cap Dome */}
            <path d="M -4.5 0 C -4.5 -4 4.5 -4 4.5 0 Z" fill={primaryColor} />
            {/* Curved Cap Visor */}
            <path d="M -1 0 L 7 1 L 5 2.5 L -1 1.5 Z" fill="#0f172a" />
            {/* Golden Cap Emblem */}
            <circle cx="0" cy="-2" r="1.1" fill="url(#goldEmblemGrad)" />
          </g>
        )}

        {/* Right Arm (Bowling Windmill Arm) */}
        <g transform={`rotate(${rightArmAngle}, 12, 18)`}>
          {/* Upper Arm & Muscular Forearm */}
          <line x1="14" y1="18" x2="15" y2="25" stroke="url(#skinGrad)" strokeWidth="3" strokeLinecap="round" />
          <line x1="15" y1="25" x2="14" y2="32" stroke="url(#skinGrad)" strokeWidth="2.6" strokeLinecap="round" />
          {/* Hand with sweatband */}
          <rect x="12.5" y="30.5" width="3" height="2" rx="0.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.4" />
          <circle cx="14" cy="33" r="1.8" fill="url(#skinGrad)" />

          {/* The Cricket Ball held at fingertips along the seam */}
          {showHeldBall && (
            <g transform={`translate(${14 + heldBallOffset.x}, ${34 + heldBallOffset.y})`}>
              <circle cx="0" cy="0" r="2.4" fill="url(#cricketBallGrad)" stroke="#ffffff" strokeWidth="0.5" />
              <line x1="-1.6" y1="-1.6" x2="1.6" y2="1.6" stroke="#ffffff" strokeWidth="0.6" strokeDasharray="1,0.8" />
            </g>
          )}
        </g>
      </g>
    </g>
  );
};

export const RealisticBowler = React.memo(RealisticBowlerComponent);

/**
 * 3. REALISTIC WICKET KEEPER COMPONENT
 */
const RealisticWicketKeeperComponent: React.FC<{
  x: number;
  y: number;
  scale: number;
  isRightHanded: boolean;
  isCatch: boolean;
  hasCaught: boolean;
  primaryColor?: string;
  secondaryColor?: string;
}> = ({
  x,
  y,
  scale,
  isRightHanded,
  isCatch,
  hasCaught,
  primaryColor = '#0284c7',
  secondaryColor = '#0369a1',
}) => {
  return (
    <g
      id="realistic-wicket-keeper"
      transform={`translate(${x}, ${y}) scale(${isRightHanded ? -scale : scale}, ${scale})`}
    >
      {/* Contact Shadow */}
      <ellipse cx="0" cy="5" rx="14" ry="4.5" fill="#000000" opacity="0.45" />

      {/* Catch celebration burst */}
      {hasCaught && (
        <circle cx="0" cy="-20" r="24" fill="url(#catchBurst)" className="animate-ping" />
      )}

      {/* Crouching Squat Legs & Short Wicketkeeping Pads */}
      <g id="keeper-legs">
        {/* Left Squat Leg */}
        <path d="M -9 4 L -5 -6 L -2 -12 L -6 -12 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.6" />
        <rect x="-10" y="-8" width="6.5" height="12" rx="1.5" fill="url(#padLeatherGrad)" stroke="#94a3b8" strokeWidth="0.6" />
        <rect x="-11" y="2" width="7" height="2.5" rx="1" fill="#0f172a" />

        {/* Right Squat Leg */}
        <path d="M 9 4 L 5 -6 L 2 -12 L 6 -12 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.6" />
        <rect x="3.5" y="-8" width="6.5" height="12" rx="1.5" fill="url(#padLeatherGrad)" stroke="#94a3b8" strokeWidth="0.6" />
        <rect x="4" y="2" width="7" height="2.5" rx="1" fill="#0f172a" />
      </g>

      {/* Keeper Torso (Bent forward, attentive) */}
      <path
        d="M -7 -12 L 7 -12 L 6 -26 L -6 -26 Z"
        fill={primaryColor}
        stroke={secondaryColor}
        strokeWidth="0.8"
      />
      <polygon points="-2,-26 2,-26 0,-22" fill="#ffffff" />

      {/* Head with Protective Helmet or Keeping Cap */}
      <g transform="translate(0, -31)">
        <circle cx="0" cy="0" r="5" fill="url(#skinGrad)" stroke="#c58d6e" strokeWidth="0.5" />
        <path d="M -5 0 C -5 -4 5 -4 5 0 Z" fill={primaryColor} />
        <path d="M -2 0 L 7 1 L 5 2.5 L -2 1.5 Z" fill="#0f172a" />
      </g>

      {/* Pro Wicketkeeping Webbed Gloves */}
      {isCatch ? (
        // Reaching out or diving to grab the edge
        <g id="keeper-gloves-catch">
          <line x1="-5" y1="-22" x2="-16" y2="-28" stroke="url(#skinGrad)" strokeWidth="3" strokeLinecap="round" />
          <line x1="5" y1="-22" x2="16" y2="-28" stroke="url(#skinGrad)" strokeWidth="3" strokeLinecap="round" />
          {/* Left Catching Glove */}
          <rect x="-21" y="-32" width="8" height="8" rx="2" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
          <polygon points="-21,-30 -16,-34 -13,-30" fill="#fef3c7" />
          {/* Right Catching Glove */}
          <rect x="13" y="-32" width="8" height="8" rx="2" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
          <polygon points="13,-30 18,-34 21,-30" fill="#fef3c7" />
        </g>
      ) : (
        // Standard poised crouching gloves
        <g id="keeper-gloves-ready">
          <line x1="-5" y1="-22" x2="-10" y2="-15" stroke="url(#skinGrad)" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="5" y1="-22" x2="10" y2="-15" stroke="url(#skinGrad)" strokeWidth="2.8" strokeLinecap="round" />
          <rect x="-13" y="-18" width="6.5" height="7" rx="2" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />
          <rect x="6.5" y="-18" width="6.5" height="7" rx="2" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />
        </g>
      )}

      {/* Dynamic Caught Badge Callout */}
      {hasCaught ? (
        <g transform="translate(0, -48)">
          <rect x="-34" y="-7" width="68" height="14" rx="4" fill="#dc2626" stroke="#ffffff" strokeWidth="1" />
          <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="900" fontFamily="sans-serif">
            EDGED & TAKEN! 🧤
          </text>
        </g>
      ) : (
        <g>
          <rect x="-28" y="8" width="56" height="11" rx="3" fill="#0f172a" fillOpacity="0.85" stroke="#0284c7" strokeWidth="0.6" />
          <text x="0" y="16.5" textAnchor="middle" fill="#38bdf8" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">
            WICKET KEEPER
          </text>
        </g>
      )}
    </g>
  );
};

export const RealisticWicketKeeper = React.memo(RealisticWicketKeeperComponent);

/**
 * 4. REALISTIC FIELDER COMPONENT (Hyper-Realistic Human Figure with Running Strides & Dynamic Stance)
 */
const RealisticFielderComponent: React.FC<{
  x: number;
  y: number;
  scale: number;
  name: string;
  isTakingCatch: boolean;
  hasCompletedCatch: boolean;
  isRunning?: boolean;
  runStridePhase?: number;
  isAlertWalkIn?: boolean;
  facingDirection?: 1 | -1;
  primaryColor?: string;
  secondaryColor?: string;
}> = ({
  x,
  y,
  scale,
  name,
  isTakingCatch,
  hasCompletedCatch,
  isRunning = false,
  runStridePhase = 0,
  isAlertWalkIn = false,
  facingDirection = 1,
  primaryColor = '#0284c7',
  secondaryColor = '#0369a1',
}) => {
  // Stride angles for running legs and pumping arms
  const strideAngle = Math.sin(runStridePhase * Math.PI * 2) * 32;
  const armPumpAngle = Math.cos(runStridePhase * Math.PI * 2) * 38;

  return (
    <g
      id={`fielder-${name.toLowerCase().replace(/\s+/g, '-')}`}
      transform={`translate(${x}, ${y}) scale(${scale})`}
    >
      <g
        className={`transition-transform duration-75 ${
          !isRunning && !isTakingCatch && !hasCompletedCatch ? 'animate-fielder-alert' : ''
        }`}
      >
        {/* Dynamic Ground Turf Contact Shadow */}
        <ellipse
          cx={isRunning ? strideAngle * 0.15 : 0}
          cy={4}
          rx={isRunning ? 13 : 11}
          ry={3.8}
          fill="#000000"
          opacity={isRunning ? 0.35 : 0.45}
        />

        {/* Ping ring on completed catch */}
        {hasCompletedCatch && (
          <g>
            <circle cx="0" cy="-28" r="30" fill="url(#catchBurst)" className="animate-ping" />
            <circle cx="0" cy="-28" r="18" fill="none" stroke="#fbbf24" strokeWidth="2.5" />
          </g>
        )}

        {/* Fielder Athlete Body Model with horizontal facing transform */}
        <g transform={`scale(${facingDirection}, 1)`}>
          {/* RUNNING / ATHLETIC LEGS */}
          {isRunning ? (
            <g id="fielder-running-legs">
              {/* Back Leg (Left Leg in Stride) */}
              <g transform={`rotate(${strideAngle}, 0, -14)`}>
                <line x1="-3" y1="-14" x2="-6" y2="-2" stroke="#ffffff" strokeWidth="4.2" strokeLinecap="round" />
                <line x1="-6" y1="-2" x2="-8" y2="4" stroke="#ffffff" strokeWidth="3.6" strokeLinecap="round" />
                {/* Running Cleat / Spike */}
                <g transform="translate(-8, 4)">
                  <ellipse cx="0" cy="0" rx="3.5" ry="1.8" fill="#0f172a" />
                  <rect x="-2" y="1" width="1.2" height="1.5" rx="0.3" fill="#64748b" />
                </g>
              </g>

              {/* Front Leg (Right Leg in Stride) */}
              <g transform={`rotate(${-strideAngle}, 0, -14)`}>
                <line x1="3" y1="-14" x2="6" y2="-2" stroke="#ffffff" strokeWidth="4.2" strokeLinecap="round" />
                <line x1="6" y1="-2" x2="8" y2="4" stroke="#ffffff" strokeWidth="3.6" strokeLinecap="round" />
                {/* Running Cleat / Spike */}
                <g transform="translate(8, 4)">
                  <ellipse cx="0" cy="0" rx="3.5" ry="1.8" fill="#0f172a" />
                  <rect x="1" y="1" width="1.2" height="1.5" rx="0.3" fill="#64748b" />
                </g>
              </g>
            </g>
          ) : isAlertWalkIn ? (
            /* WALKING IN ATHLETIC CROUCH */
            <g id="fielder-walkin-legs">
              <line x1="-4" y1="-13" x2="-7" y2="1" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              <line x1="4" y1="-13" x2="5" y2="3" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              {/* Spikes planted on turf */}
              <ellipse cx="-7" cy="2" rx="4" ry="2" fill="#0f172a" />
              <ellipse cx="5" cy="4" rx="4" ry="2" fill="#0f172a" />
            </g>
          ) : (
            /* READY / IDLE LEGS */
            <g id="fielder-ready-legs">
              <line x1="-5" y1="3" x2="-2" y2="-14" stroke="#ffffff" strokeWidth="3.8" strokeLinecap="round" />
              <line x1="5" y1="3" x2="2" y2="-14" stroke="#ffffff" strokeWidth="3.8" strokeLinecap="round" />
              {/* Cricket Cleats with white scuff guard */}
              <rect x="-7.5" y="2" width="5.5" height="2.5" rx="1" fill="#0f172a" />
              <rect x="2" y="2" width="5.5" height="2.5" rx="1" fill="#0f172a" />
              <line x1="-7" y1="2" x2="-4" y2="2" stroke="#cbd5e1" strokeWidth="0.8" />
              <line x1="2.5" y1="2" x2="5.5" y2="2" stroke="#cbd5e1" strokeWidth="0.8" />
            </g>
          )}

          {/* ATHLETIC MATCH JERSEY & TORSO */}
          <g id="fielder-torso" transform={isRunning ? 'rotate(8, 0, -14)' : isAlertWalkIn ? 'rotate(4, 0, -14)' : ''}>
            {/* Match Jersey (Broad shoulders, tapered athletic waist) */}
            <path
              d="M -6 -14 L 6 -14 L 5 -29 L -5 -29 Z"
              fill={primaryColor}
              stroke={secondaryColor}
              strokeWidth="0.8"
            />

            {/* Breathable Mesh Side Panels */}
            <path d="M -6 -14 L -5 -29 L -3.5 -29 L -4.5 -14 Z" fill={secondaryColor} opacity="0.85" />
            <path d="M 6 -14 L 5 -29 L 3.5 -29 L 4.5 -14 Z" fill={secondaryColor} opacity="0.85" />

            {/* Jersey Collar & V-Neck Seam */}
            <polygon points="-1.5,-29 1.5,-29 0,-26" fill="#ffffff" />
            <line x1="-3.5" y1="-29" x2="3.5" y2="-29" stroke="#f8fafc" strokeWidth="1" strokeLinecap="round" />

            {/* Team Emblem Badge on Left Chest */}
            <circle cx="2" cy="-24" r="1.3" fill="url(#goldEmblemGrad)" stroke="#78350f" strokeWidth="0.3" />

            {/* Dynamic Athletic Jersey Swoosh */}
            <path d="M -4 -22 Q 0 -18 4 -20" stroke="#ffffff" strokeWidth="0.8" opacity="0.4" fill="none" />
          </g>

          {/* ARMS & HANDS (Running vs Catching vs Ready) */}
          {isTakingCatch ? (
            /* DIVE / CATCH OUTSTRETCHED ARMS */
            <g id="fielder-arms-catching">
              <line x1="-4" y1="-26" x2="-9" y2="-46" stroke="#f7d4be" strokeWidth="3.2" strokeLinecap="round" />
              <line x1="4" y1="-26" x2="9" y2="-46" stroke="#f7d4be" strokeWidth="3.2" strokeLinecap="round" />
              {/* Cupped catching hands */}
              <circle cx="-9" cy="-46" r="2.8" fill="#eab598" stroke="#c58d6e" strokeWidth="0.6" />
              <circle cx="9" cy="-46" r="2.8" fill="#eab598" stroke="#c58d6e" strokeWidth="0.6" />
              <line x1="-8" y1="-44" x2="8" y2="-44" stroke="#fbbf24" strokeWidth="1.2" opacity="0.8" />
            </g>
          ) : isRunning ? (
            /* PUMPING RUNNER ARMS */
            <g id="fielder-arms-running">
              {/* Left Arm (Pumping) */}
              <g transform={`rotate(${armPumpAngle}, -4, -26)`}>
                <line x1="-4" y1="-26" x2="-8" y2="-15" stroke="#f7d4be" strokeWidth="3.2" strokeLinecap="round" />
                <circle cx="-8" cy="-15" r="2.2" fill="#eab598" />
              </g>
              {/* Right Arm (Pumping opposite) */}
              <g transform={`rotate(${-armPumpAngle}, 4, -26)`}>
                <line x1="4" y1="-26" x2="8" y2="-15" stroke="#f7d4be" strokeWidth="3.2" strokeLinecap="round" />
                <circle cx="8" cy="-15" r="2.2" fill="#eab598" />
              </g>
            </g>
          ) : isAlertWalkIn ? (
            /* WALKING IN READY ARMS */
            <g id="fielder-arms-walkin">
              <line x1="-4" y1="-26" x2="-7" y2="-16" stroke="#f7d4be" strokeWidth="3" strokeLinecap="round" />
              <line x1="4" y1="-26" x2="7" y2="-16" stroke="#f7d4be" strokeWidth="3" strokeLinecap="round" />
              <circle cx="-7" cy="-16" r="2" fill="#eab598" />
              <circle cx="7" cy="-16" r="2" fill="#eab598" />
            </g>
          ) : (
            /* ALERT READY ARMS */
            <g id="fielder-arms-ready">
              <line x1="-4" y1="-26" x2="-9" y2="-17" stroke="#f7d4be" strokeWidth="2.8" strokeLinecap="round" />
              <line x1="4" y1="-26" x2="9" y2="-17" stroke="#f7d4be" strokeWidth="2.8" strokeLinecap="round" />
              <circle cx="-9" cy="-17" r="2" fill="#eab598" />
              <circle cx="9" cy="-17" r="2" fill="#eab598" />
            </g>
          )}

          {/* REALISTIC HEAD & PRO CRICKET CAP */}
          <g id="fielder-head" transform={isRunning ? 'rotate(5, 0, -32)' : ''}>
            {/* Neck */}
            <rect x="-2.2" y="-32" width="4.4" height="4.5" rx="1.2" fill="#eab598" stroke="#c58d6e" strokeWidth="0.4" />
            {/* Head Contour */}
            <circle cx="0" cy="-35" r="5" fill="#f7d4be" stroke="#c58d6e" strokeWidth="0.6" />
            {/* Facial profile & focused eye line */}
            <circle cx="2.2" cy="-35" r="0.8" fill="#1e293b" />
            <line x1="1.8" y1="-36.5" x2="3.2" y2="-36.2" stroke="#475569" strokeWidth="0.7" />

            {/* Pro Cricket Cap (Team Colors) */}
            <path d="M -4.8 -35 C -4.8 -39 4.8 -39 4.8 -35 Z" fill={primaryColor} stroke="#0f172a" strokeWidth="0.6" />
            {/* Cap Crown Button Top */}
            <circle cx="0" cy="-39" r="1.1" fill={secondaryColor} />
            {/* Curved Sun Visor Peak */}
            <path d="M 0 -35 L 7.5 -34 L 5 -32 L 0 -33.5 Z" fill="#0f172a" opacity="0.95" />
            <line x1="0" y1="-34" x2="7" y2="-33" stroke="#64748b" strokeWidth="0.6" />
            {/* Cap Front Team Badge */}
            <circle cx="1.5" cy="-36.5" r="0.8" fill="url(#goldEmblemGrad)" />
          </g>
        </g>

        {/* Position / Catch Callout Badge (Always upright, never mirrored) */}
        {hasCompletedCatch ? (
          <g transform="translate(0, -60)">
            <rect x="-34" y="-8" width="68" height="16" rx="5" fill="#dc2626" stroke="#ffffff" strokeWidth="1.2" className="animate-bounce" />
            <text x="0" y="3.5" textAnchor="middle" fill="#ffffff" fontSize="8.5" fontWeight="900" fontFamily="sans-serif">
              CAUGHT! 🧤
            </text>
          </g>
        ) : isTakingCatch ? (
          <g transform="translate(0, -56)">
            <rect x="-24" y="-6" width="48" height="12" rx="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="0.8" className="animate-pulse" />
            <text x="0" y="3" textAnchor="middle" fill="#0f172a" fontSize="7" fontWeight="900" fontFamily="sans-serif">
              CATCH! ⚡
            </text>
          </g>
        ) : (
          <g transform="translate(0, 11)">
            <rect x="-24" y="-4.5" width="48" height="9.5" rx="2.5" fill="#020617" fillOpacity="0.88" stroke="#475569" strokeWidth="0.6" />
            <text x="0" y="2.5" textAnchor="middle" fill="#e2e8f0" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif">
              {name}
            </text>
          </g>
        )}
      </g>
    </g>
  );
};

export const RealisticFielder = React.memo(RealisticFielderComponent);

/**
 * 5. REALISTIC MATCH UMPIRE COMPONENT
 * Stands behind the non-striker bowler's wickets at x=418, y=170
 * Signals boundaries (FOUR, SIX), wickets (OUT), or watches play in official stance
 */
const RealisticMatchUmpireComponent: React.FC<{
  x?: number;
  y?: number;
  scale?: number;
  signalState?: 'NORMAL' | 'FOUR' | 'SIX' | 'OUT';
}> = ({
  x = 422,
  y = 170,
  scale = 0.88,
  signalState = 'NORMAL',
}) => {
  return (
    <g
      id="realistic-match-umpire"
      transform={`translate(${x}, ${y}) scale(${scale})`}
    >
      {/* Ground Contact Shadow */}
      <ellipse cx="0" cy="5" rx="8" ry="3" fill="#000000" opacity="0.4" />

      {/* Black Official Match Trousers */}
      <line x1="-3.5" y1="4" x2="-2" y2="-12" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
      <line x1="3.5" y1="4" x2="2" y2="-12" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
      {/* Black Shoes */}
      <rect x="-5" y="3" width="3.5" height="2" rx="0.5" fill="#020617" />
      <rect x="1.5" y="3" width="3.5" height="2" rx="0.5" fill="#020617" />

      {/* Tailored Official Tournament Blazer */}
      <path
        d="M -5 -12 L 5 -12 L 4.5 -26 L -4.5 -26 Z"
        fill="url(#umpireBlazerGrad)"
        stroke="#475569"
        strokeWidth="0.8"
      />
      {/* Official Gold Match Crest on Left Breast Pocket */}
      <ellipse cx="2.5" cy="-20" rx="1.1" ry="1.4" fill="url(#goldEmblemGrad)" />
      {/* Red Card in Pocket */}
      <rect x="2" y="-23" width="1.2" height="1.8" rx="0.2" fill="#ef4444" />
      {/* Collar, Lapel & Tie */}
      <polygon points="-2,-26 2,-26 0,-20" fill="#1e293b" />
      <line x1="0" y1="-26" x2="0" y2="-12" stroke="#64748b" strokeWidth="0.6" />

      {/* Umpire Head with Official White Broad-Brimmed Sunhat */}
      <g transform="translate(0, -30)">
        <circle cx="0" cy="0" r="4.2" fill="url(#skinGrad)" stroke="#c58d6e" strokeWidth="0.5" />
        {/* Broad-Brimmed Sunhat */}
        <ellipse cx="0" cy="-2.5" rx="7.5" ry="3.2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
        <rect x="-3.5" y="-4" width="7" height="2.5" rx="1" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="-3.5" y1="-2" x2="3.5" y2="-2" stroke="#1e293b" strokeWidth="0.7" />
      </g>

      {/* Umpire Arms & Official Signals */}
      {signalState === 'SIX' ? (
        // Both Arms Raised Straight Up for SIX!
        <g id="umpire-six-signal">
          <line x1="-4.5" y1="-24" x2="-6" y2="-44" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="4.5" y1="-24" x2="6" y2="-44" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="-6" cy="-45" r="1.8" fill="url(#skinGrad)" />
          <circle cx="6" cy="-45" r="1.8" fill="url(#skinGrad)" />
        </g>
      ) : signalState === 'FOUR' ? (
        // Arm Waved Horizontally Across Body for FOUR!
        <g id="umpire-four-signal">
          <line x1="-4" y1="-22" x2="-14" y2="-18" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="-15" cy="-18" r="1.8" fill="url(#skinGrad)" />
          <line x1="4" y1="-22" x2="2" y2="-14" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />
        </g>
      ) : signalState === 'OUT' ? (
        // Right Arm Index Finger Raised High for OUT / WICKET!
        <g id="umpire-out-signal">
          <line x1="4.5" y1="-24" x2="5" y2="-42" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="5" cy="-43" r="1.8" fill="url(#skinGrad)" />
          {/* Raised Index Finger */}
          <line x1="5" y1="-43" x2="5" y2="-47" stroke="url(#skinGrad)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="-4" y1="-22" x2="-2" y2="-14" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />
        </g>
      ) : (
        // Normal Officiating Stance: Hands clasped behind back with ball counter
        <g id="umpire-normal-stance">
          <line x1="-4.5" y1="-24" x2="-6" y2="-14" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="4.5" y1="-24" x2="6" y2="-14" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="-5" cy="-13" r="1.6" fill="url(#skinGrad)" />
          <circle cx="5" cy="-13" r="1.6" fill="url(#skinGrad)" />
        </g>
      )}

      {/* Tiny Umpire Badge Label */}
      <rect x="-14" y="7" width="28" height="8" rx="2" fill="#0f172a" fillOpacity="0.8" stroke="#334155" strokeWidth="0.5" />
      <text x="0" y="13" textAnchor="middle" fill="#94a3b8" fontSize="5" fontWeight="bold" fontFamily="sans-serif">
        UMPIRE
      </text>
    </g>
  );
};

export const RealisticMatchUmpire = React.memo(RealisticMatchUmpireComponent);
