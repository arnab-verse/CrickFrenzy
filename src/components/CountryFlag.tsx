import React from 'react';

export interface CountryFlagProps {
  countryIdOrCode?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  aspect?: 'flag' | 'square' | 'circle';
  showShadow?: boolean;
}

const normalizeKey = (val?: string): string => {
  if (!val) return '';
  const s = val.toLowerCase().trim();
  // Match team IDs or short codes or full country names
  if (s === 'ind' || s === 'india') return 'ind';
  if (s === 'aus' || s === 'australia') return 'aus';
  if (s === 'eng' || s === 'england') return 'eng';
  if (s === 'sa' || s === 'rsa' || s === 'south africa') return 'sa';
  if (s === 'pak' || s === 'pakistan') return 'pak';
  if (s === 'nz' || s === 'new zealand') return 'nz';
  if (s === 'wi' || s === 'west indies') return 'wi';
  if (s === 'sl' || s === 'sri lanka') return 'sl';
  if (s === 'afg' || s === 'afghanistan') return 'afg';
  if (s === 'ban' || s === 'bangladesh') return 'ban';
  if (s === 'ire' || s === 'ireland') return 'ire';
  if (s === 'ned' || s === 'netherlands' || s === 'holland') return 'ned';
  if (s === 'sco' || s === 'scotland') return 'sco';
  if (s === 'usa' || s === 'united states' || s === 'america') return 'usa';
  if (s === 'nam' || s === 'namibia') return 'nam';
  if (s === 'zim' || s === 'zimbabwe') return 'zim';
  if (s === 'nep' || s === 'nepal') return 'nep';
  if (s === 'oma' || s === 'oman') return 'oma';
  if (s === 'can' || s === 'canada') return 'can';
  if (s === 'uga' || s === 'uganda') return 'uga';

  // IPL teams
  if (s.startsWith('csk') || s.includes('chennai')) return 'csk';
  if (s.startsWith('mi') || s.includes('mumbai')) return 'mi';
  if (s.startsWith('rcb') || s.includes('bangalore') || s.includes('bengaluru')) return 'rcb';
  if (s.startsWith('kkr') || s.includes('kolkata')) return 'kkr';
  if (s.startsWith('srh') || s.includes('hyderabad')) return 'srh';
  if (s.startsWith('rr') || s.includes('rajasthan')) return 'rr';
  if (s.startsWith('gt') || s.includes('gujarat')) return 'gt';
  if (s.startsWith('lsg') || s.includes('lucknow')) return 'lsg';
  if (s.startsWith('dc') || s.includes('delhi')) return 'dc';
  if (s.startsWith('pbks') || s.includes('punjab')) return 'pbks';

  return s;
};

export const CountryFlag: React.FC<CountryFlagProps> = ({
  countryIdOrCode,
  name,
  size = 'md',
  className = '',
  aspect = 'flag',
  showShadow = true,
}) => {
  const key = normalizeKey(countryIdOrCode || name);

  // Dimensions based on size
  const sizeStyles = {
    xs: aspect === 'square' || aspect === 'circle' ? 'w-4 h-4' : 'w-5 h-3.5',
    sm: aspect === 'square' || aspect === 'circle' ? 'w-5 h-5' : 'w-6 h-4',
    md: aspect === 'square' || aspect === 'circle' ? 'w-7 h-7' : 'w-8 h-5.5',
    lg: aspect === 'square' || aspect === 'circle' ? 'w-10 h-10' : 'w-11 h-7.5',
    xl: aspect === 'square' || aspect === 'circle' ? 'w-14 h-14' : 'w-16 h-11',
    '2xl': aspect === 'square' || aspect === 'circle' ? 'w-20 h-20' : 'w-24 h-16',
  };

  const roundedStyle =
    aspect === 'circle'
      ? 'rounded-full'
      : aspect === 'square'
      ? 'rounded-md'
      : 'rounded-[4px]';

  const shadowClass = showShadow ? 'shadow-sm ring-1 ring-black/15' : '';

  const renderFlagContent = () => {
    switch (key) {
      // 1. INDIA
      case 'ind':
        return (
          <svg viewBox="0 0 900 600" className="w-full h-full object-cover">
            <rect width="900" height="200" fill="#FF9933" />
            <rect y="200" width="900" height="200" fill="#FFFFFF" />
            <rect y="400" width="900" height="200" fill="#138808" />
            <g transform="translate(450, 300)">
              <circle r="68" fill="none" stroke="#000088" strokeWidth="8" />
              <circle r="14" fill="#000088" />
              {Array.from({ length: 24 }).map((_, i) => (
                <line
                  key={i}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="-68"
                  stroke="#000088"
                  strokeWidth="3.5"
                  transform={`rotate(${i * 15})`}
                />
              ))}
            </g>
          </svg>
        );

      // 2. AUSTRALIA
      case 'aus':
        return (
          <svg viewBox="0 0 900 600" className="w-full h-full object-cover">
            <rect width="900" height="600" fill="#00247D" />
            {/* Union Jack in canton */}
            <g transform="scale(0.5, 0.5)">
              <rect width="900" height="600" fill="#00247D" />
              <line x1="0" y1="0" x2="900" y2="600" stroke="#FFFFFF" strokeWidth="100" />
              <line x1="900" y1="0" x2="0" y2="600" stroke="#FFFFFF" strokeWidth="100" />
              <line x1="0" y1="0" x2="900" y2="600" stroke="#CF142B" strokeWidth="35" />
              <line x1="900" y1="0" x2="0" y2="600" stroke="#CF142B" strokeWidth="35" />
              <line x1="450" y1="0" x2="450" y2="600" stroke="#FFFFFF" strokeWidth="160" />
              <line x1="0" y1="300" x2="900" y2="300" stroke="#FFFFFF" strokeWidth="160" />
              <line x1="450" y1="0" x2="450" y2="600" stroke="#CF142B" strokeWidth="100" />
              <line x1="0" y1="300" x2="900" y2="300" stroke="#CF142B" strokeWidth="100" />
            </g>
            {/* Commonwealth Star */}
            <g transform="translate(225, 450) scale(40)">
              <polygon
                points="0,-1 0.28,-0.35 0.95,-0.3 0.45,0.18 0.65,0.85 0.05,0.45 -0.55,0.85 -0.35,0.18 -0.85,-0.3 -0.18,-0.35"
                fill="#FFFFFF"
              />
            </g>
            {/* Southern Cross */}
            <g fill="#FFFFFF">
              <circle cx="675" cy="130" r="15" />
              <circle cx="770" cy="240" r="15" />
              <circle cx="675" cy="470" r="15" />
              <circle cx="580" cy="280" r="15" />
              <circle cx="720" cy="330" r="9" />
            </g>
          </svg>
        );

      // 3. ENGLAND
      case 'eng':
        return (
          <svg viewBox="0 0 900 600" className="w-full h-full object-cover">
            <rect width="900" height="600" fill="#FFFFFF" />
            <rect x="390" width="120" height="600" fill="#CF142B" />
            <rect y="240" width="900" height="120" fill="#CF142B" />
          </svg>
        );

      // 4. SOUTH AFRICA
      case 'sa':
        return (
          <svg viewBox="0 0 900 600" className="w-full h-full object-cover">
            <rect width="900" height="300" fill="#E03C31" />
            <rect y="300" width="900" height="300" fill="#001489" />
            {/* White and yellow borders */}
            <polygon points="0,0 450,300 0,600" fill="#000000" />
            <polygon points="0,0 480,300 0,600" fill="none" stroke="#FFB81C" strokeWidth="40" />
            <polygon points="0,0 450,300 0,600" fill="#000000" />
            {/* Green Y band */}
            <path
              d="M 0,0 L 400,270 L 900,270 L 900,330 L 400,330 L 0,600 L 0,480 L 270,300 L 0,120 Z"
              fill="#007749"
            />
            <path
              d="M 0,0 L 440,300 L 0,600"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="22"
            />
            <path
              d="M 0,30 L 390,300 L 0,570"
              fill="none"
              stroke="#FFB81C"
              strokeWidth="28"
            />
            <polygon points="0,60 330,300 0,540" fill="#000000" />
            <rect y="260" width="900" height="80" fill="#007749" />
            <rect y="235" width="900" height="25" fill="#FFFFFF" />
            <rect y="340" width="900" height="25" fill="#FFFFFF" />
          </svg>
        );

      // 5. PAKISTAN
      case 'pak':
        return (
          <svg viewBox="0 0 900 600" className="w-full h-full object-cover">
            <rect width="900" height="600" fill="#01411C" />
            <rect width="225" height="600" fill="#FFFFFF" />
            <g transform="translate(560, 300) rotate(-40)">
              <path
                d="M 0,-90 A 90 90 0 1 0 90 0 A 75 75 0 1 1 0,-90 Z"
                fill="#FFFFFF"
              />
              <g transform="translate(45, -45) scale(32)">
                <polygon points="0,-1 0.22,-0.3 0.95,-0.3 0.36,0.12 0.58,0.8 0,0.38 -0.58,0.8 -0.36,0.12 -0.95,-0.3 -0.22,-0.3" fill="#FFFFFF" />
              </g>
            </g>
          </svg>
        );

      // 6. NEW ZEALAND
      case 'nz':
        return (
          <svg viewBox="0 0 900 600" className="w-full h-full object-cover">
            <rect width="900" height="600" fill="#00247D" />
            {/* Union Jack */}
            <g transform="scale(0.5, 0.5)">
              <rect width="900" height="600" fill="#00247D" />
              <line x1="0" y1="0" x2="900" y2="600" stroke="#FFFFFF" strokeWidth="100" />
              <line x1="900" y1="0" x2="0" y2="600" stroke="#FFFFFF" strokeWidth="100" />
              <line x1="0" y1="0" x2="900" y2="600" stroke="#CF142B" strokeWidth="35" />
              <line x1="900" y1="0" x2="0" y2="600" stroke="#CF142B" strokeWidth="35" />
              <line x1="450" y1="0" x2="450" y2="600" stroke="#FFFFFF" strokeWidth="160" />
              <line x1="0" y1="300" x2="900" y2="300" stroke="#FFFFFF" strokeWidth="160" />
              <line x1="450" y1="0" x2="450" y2="600" stroke="#CF142B" strokeWidth="100" />
              <line x1="0" y1="300" x2="900" y2="300" stroke="#CF142B" strokeWidth="100" />
            </g>
            {/* 4 Red stars with white border */}
            <g>
              <circle cx="675" cy="130" r="18" fill="#CC142B" stroke="#FFFFFF" strokeWidth="4" />
              <circle cx="770" cy="240" r="16" fill="#CC142B" stroke="#FFFFFF" strokeWidth="4" />
              <circle cx="675" cy="460" r="20" fill="#CC142B" stroke="#FFFFFF" strokeWidth="4" />
              <circle cx="580" cy="270" r="16" fill="#CC142B" stroke="#FFFFFF" strokeWidth="4" />
            </g>
          </svg>
        );

      // 7. WEST INDIES
      case 'wi':
        return (
          <svg viewBox="0 0 900 600" className="w-full h-full object-cover">
            <rect width="900" height="600" fill="#7B1113" />
            {/* Gold Sun & Palm Crest */}
            <g transform="translate(450, 300)">
              <circle r="140" fill="#F59E0B" opacity="0.25" />
              <circle r="110" fill="#EAB308" />
              <ellipse cx="0" cy="65" rx="100" ry="30" fill="#15803D" />
              {/* Palm Tree */}
              <path d="M -8,65 Q 10,0 -4,-55 Q 0,0 8,65 Z" fill="#78350F" />
              {/* Palm Fronds */}
              <path d="M -4,-55 Q -60,-85 -90,-45 Q -45,-45 -4,-55 Z" fill="#166534" />
              <path d="M -4,-55 Q -40,-115 0,-105 Q 0,-65 -4,-55 Z" fill="#15803D" />
              <path d="M -4,-55 Q 60,-85 90,-45 Q 45,-45 -4,-55 Z" fill="#166534" />
              {/* Cricket Stumps & Ball */}
              <rect x="-16" y="20" width="5" height="35" fill="#FFFFFF" />
              <rect x="-3" y="20" width="5" height="35" fill="#FFFFFF" />
              <rect x="10" y="20" width="5" height="35" fill="#FFFFFF" />
              <rect x="-18" y="16" width="35" height="4" fill="#FFFFFF" />
              <circle cx="28" cy="40" r="6" fill="#DC2626" />
            </g>
          </svg>
        );

      // 8. SRI LANKA
      case 'sl':
        return (
          <svg viewBox="0 0 900 600" className="w-full h-full object-cover">
            <rect width="900" height="600" fill="#FFBE29" />
            <rect x="40" y="40" width="820" height="520" fill="#000000" opacity="0.1" />
            {/* Teal & Orange vertical bands */}
            <rect x="45" y="45" width="100" height="510" fill="#005662" />
            <rect x="155" y="45" width="100" height="510" fill="#EB7400" />
            {/* Maroon field */}
            <rect x="265" y="45" width="590" height="510" fill="#8D153A" />
            {/* Golden Lion */}
            <g transform="translate(560, 300) scale(1.1)" fill="#FFBE29">
              <ellipse cx="0" cy="15" rx="75" ry="50" />
              <circle cx="55" cy="-25" r="35" />
              <path d="M 65,-45 L 115,-75 L 120,-60 L 75,-30 Z" />
              <circle cx="70" cy="-30" r="6" fill="#8D153A" />
              {/* Sword */}
              <rect x="50" y="-80" width="70" height="10" rx="3" />
            </g>
          </svg>
        );

      // 9. AFGHANISTAN
      case 'afg':
        return (
          <svg viewBox="0 0 900 600" className="w-full h-full object-cover">
            <rect width="300" height="600" fill="#000000" />
            <rect x="300" width="300" height="600" fill="#D32011" />
            <rect x="600" width="300" height="600" fill="#007A3D" />
            {/* White Emblem in center */}
            <g transform="translate(450, 300)">
              <circle r="85" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeDasharray="12 6" />
              <path d="M -40,30 L 40,30 L 30,-20 L 0,-50 L -30,-20 Z" fill="none" stroke="#FFFFFF" strokeWidth="6" />
              <line x1="0" y1="-50" x2="0" y2="30" stroke="#FFFFFF" strokeWidth="5" />
            </g>
          </svg>
        );

      // 10. BANGLADESH
      case 'ban':
        return (
          <svg viewBox="0 0 900 600" className="w-full h-full object-cover">
            <rect width="900" height="600" fill="#006A4E" />
            <circle cx="405" cy="300" r="160" fill="#F42A41" />
          </svg>
        );

      // 11. IRELAND
      case 'ire':
        return (
          <svg viewBox="0 0 900 600" className="w-full h-full object-cover">
            <rect width="300" height="600" fill="#169B62" />
            <rect x="300" width="300" height="600" fill="#FFFFFF" />
            <rect x="600" width="300" height="600" fill="#FF883E" />
          </svg>
        );

      // 12. NETHERLANDS
      case 'ned':
        return (
          <svg viewBox="0 0 900 600" className="w-full h-full object-cover">
            <rect width="900" height="200" fill="#AE1C28" />
            <rect y="200" width="900" height="200" fill="#FFFFFF" />
            <rect y="400" width="900" height="200" fill="#21468B" />
          </svg>
        );

      // 13. SCOTLAND
      case 'sco':
        return (
          <svg viewBox="0 0 900 600" className="w-full h-full object-cover">
            <rect width="900" height="600" fill="#005EB8" />
            <line x1="0" y1="0" x2="900" y2="600" stroke="#FFFFFF" strokeWidth="110" />
            <line x1="900" y1="0" x2="0" y2="600" stroke="#FFFFFF" strokeWidth="110" />
          </svg>
        );

      // 14. USA
      case 'usa':
        return (
          <svg viewBox="0 0 900 600" className="w-full h-full object-cover">
            {/* 13 Stripes */}
            {Array.from({ length: 13 }).map((_, i) => (
              <rect
                key={i}
                y={i * (600 / 13)}
                width="900"
                height={600 / 13}
                fill={i % 2 === 0 ? '#B22234' : '#FFFFFF'}
              />
            ))}
            {/* Blue Canton */}
            <rect width="360" height={(600 / 13) * 7} fill="#3C3B6E" />
            {/* White Stars */}
            <g fill="#FFFFFF">
              {[60, 120, 180, 240, 300].map((x) =>
                [40, 90, 140, 190, 240, 290].map((y) => (
                  <circle key={`${x}-${y}`} cx={x} cy={y} r="8" />
                ))
              )}
            </g>
          </svg>
        );

      // 15. NAMIBIA
      case 'nam':
        return (
          <svg viewBox="0 0 900 600" className="w-full h-full object-cover">
            <polygon points="0,0 900,0 900,600" fill="#003580" />
            <polygon points="0,0 0,600 900,600" fill="#009543" />
            {/* Diagonal Red stripe with white borders */}
            <polygon points="0,600 0,470 900,0 900,130" fill="#FFFFFF" />
            <polygon points="0,570 0,500 900,30 900,100" fill="#D21034" />
            {/* Golden Sun */}
            <g transform="translate(200, 150)">
              <circle r="48" fill="#FFCE00" />
              <circle r="36" fill="#003580" />
              <circle r="26" fill="#FFCE00" />
            </g>
          </svg>
        );

      // 16. ZIMBABWE
      case 'zim':
        return (
          <svg viewBox="0 0 900 600" className="w-full h-full object-cover">
            {['#319059', '#FED100', '#DE2010', '#000000', '#DE2010', '#FED100', '#319059'].map(
              (c, i) => (
                <rect key={i} y={i * (600 / 7)} width="900" height={600 / 7} fill={c} />
              )
            )}
            <polygon points="0,0 350,300 0,600" fill="#FFFFFF" stroke="#000000" strokeWidth="8" />
            {/* Red Star & Bird */}
            <g transform="translate(115, 300) scale(45)">
              <polygon
                points="0,-1 0.28,-0.2 0.95,-0.2 0.4,0.2 0.65,0.85 0,0.4 -0.65,0.85 -0.4,0.2 -0.95,-0.2 -0.28,-0.2"
                fill="#DE2010"
              />
              <circle cx="0" cy="0.1" r="0.3" fill="#FED100" />
            </g>
          </svg>
        );

      // 17. NEPAL
      case 'nep':
        return (
          <svg viewBox="0 0 900 600" className="w-full h-full object-cover">
            <rect width="900" height="600" fill="#090D16" />
            <g transform="translate(180, 20)">
              <polygon
                points="0,0 480,260 140,260 480,560 0,560"
                fill="#DC143C"
                stroke="#003893"
                strokeWidth="28"
                strokeLinejoin="round"
              />
              {/* Moon in upper pennant */}
              <circle cx="120" cy="170" r="38" fill="#FFFFFF" />
              <circle cx="120" cy="155" r="32" fill="#DC143C" />
              {/* Sun in lower pennant */}
              <circle cx="130" cy="420" r="42" fill="#FFFFFF" />
            </g>
          </svg>
        );

      // 18. OMAN
      case 'oma':
        return (
          <svg viewBox="0 0 900 600" className="w-full h-full object-cover">
            <rect width="900" height="200" fill="#FFFFFF" />
            <rect y="200" width="900" height="200" fill="#DB161B" />
            <rect y="400" width="900" height="200" fill="#008000" />
            <rect width="250" height="600" fill="#DB161B" />
            {/* White Khanjar dagger */}
            <g transform="translate(125, 100)">
              <path
                d="M -30,-30 L 30,30 M -30,30 L 30,-30 M 0,-45 L 0,45"
                stroke="#FFFFFF"
                strokeWidth="10"
                strokeLinecap="round"
              />
            </g>
          </svg>
        );

      // 19. CANADA
      case 'can':
        return (
          <svg viewBox="0 0 900 600" className="w-full h-full object-cover">
            <rect width="225" height="600" fill="#FF0000" />
            <rect x="225" width="450" height="600" fill="#FFFFFF" />
            <rect x="675" width="225" height="600" fill="#FF0000" />
            {/* 11-pointed Maple Leaf */}
            <g transform="translate(450, 300) scale(1.3)" fill="#FF0000">
              <path d="M 0,-110 L 18,-60 L 50,-70 L 35,-30 L 85,-35 L 70,0 L 95,25 L 50,30 L 40,65 L 10,40 L 4,110 L -4,110 L -10,40 L -40,65 L -50,30 L -95,25 L -70,0 L -85,-35 L -35,-30 L -50,-70 L -18,-60 Z" />
            </g>
          </svg>
        );

      // 20. UGANDA
      case 'uga':
        return (
          <svg viewBox="0 0 900 600" className="w-full h-full object-cover">
            {['#000000', '#FCDC04', '#D90000', '#000000', '#FCDC04', '#D90000'].map(
              (c, i) => (
                <rect key={i} y={i * 100} width="900" height="100" fill={c} />
              )
            )}
            <circle cx="450" cy="300" r="110" fill="#FFFFFF" />
            {/* Grey Crowned Crane Emblem */}
            <g transform="translate(450, 300) scale(0.9)">
              <circle cx="0" cy="-25" r="22" fill="#000000" />
              <circle cx="6" cy="-28" r="4" fill="#FFFFFF" />
              <path d="M -15,-45 L 0,-25 L 15,-45 Z" fill="#FCDC04" />
              <path d="M -20,-10 Q 0,40 30,20 Q 10,0 -20,-10 Z" fill="#6B7280" />
              <line x1="0" y1="20" x2="0" y2="70" stroke="#000000" strokeWidth="6" />
              <line x1="15" y1="20" x2="15" y2="70" stroke="#000000" strokeWidth="6" />
            </g>
          </svg>
        );

      // IPL FRANCHISES (Vivid Custom Franchise Emblems)
      case 'csk':
        return (
          <svg viewBox="0 0 900 600" className="w-full h-full object-cover">
            <rect width="900" height="600" fill="#FACC15" />
            <polygon points="0,450 900,250 900,600 0,600" fill="#1E40AF" opacity="0.9" />
            <g transform="translate(450, 270) scale(1.1)">
              <circle r="120" fill="#F59E0B" />
              <text x="0" y="25" textAnchor="middle" fill="#FFFFFF" fontSize="90" fontWeight="900" fontFamily="sans-serif">CSK</text>
              <text x="0" y="90" textAnchor="middle" fill="#1E3A8A" fontSize="40" fontWeight="900" fontFamily="sans-serif">SUPER KINGS</text>
            </g>
          </svg>
        );

      case 'mi':
        return (
          <svg viewBox="0 0 900 600" className="w-full h-full object-cover">
            <rect width="900" height="600" fill="#004BA0" />
            <polygon points="0,0 900,600 0,600" fill="#D97706" opacity="0.35" />
            <g transform="translate(450, 300)">
              <circle r="120" fill="#0284C7" stroke="#F59E0B" strokeWidth="12" />
              <text x="0" y="30" textAnchor="middle" fill="#FFFFFF" fontSize="100" fontWeight="900" fontFamily="sans-serif">MI</text>
            </g>
          </svg>
        );

      case 'rcb':
        return (
          <svg viewBox="0 0 900 600" className="w-full h-full object-cover">
            <rect width="900" height="300" fill="#000000" />
            <rect y="300" width="900" height="300" fill="#DC2626" />
            <g transform="translate(450, 300)">
              <circle r="120" fill="#B45309" stroke="#EAB308" strokeWidth="8" />
              <text x="0" y="28" textAnchor="middle" fill="#FFFFFF" fontSize="85" fontWeight="900" fontFamily="sans-serif">RCB</text>
            </g>
          </svg>
        );

      case 'kkr':
        return (
          <svg viewBox="0 0 900 600" className="w-full h-full object-cover">
            <rect width="900" height="600" fill="#3B0764" />
            <polygon points="450,80 800,500 100,500" fill="#EAB308" opacity="0.3" />
            <g transform="translate(450, 310)">
              <text x="0" y="30" textAnchor="middle" fill="#FACC15" fontSize="110" fontWeight="900" fontFamily="sans-serif">KKR</text>
            </g>
          </svg>
        );

      default:
        // Elegant Fallback with initials
        const label = (countryIdOrCode || name || 'TM').slice(0, 3).toUpperCase();
        return (
          <svg viewBox="0 0 900 600" className="w-full h-full object-cover">
            <rect width="900" height="600" fill="#1E293B" />
            <rect y="300" width="900" height="300" fill="#0F172A" />
            <text
              x="450"
              y="370"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="180"
              fontWeight="900"
              fontFamily="monospace"
              letterSpacing="6"
            >
              {label}
            </text>
          </svg>
        );
    }
  };

  return (
    <div
      className={`inline-block overflow-hidden shrink-0 select-none relative ${sizeStyles[size]} ${roundedStyle} ${shadowClass} ${className}`}
      title={name || countryIdOrCode}
    >
      {renderFlagContent()}
      {/* Subtle glass lighting highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
    </div>
  );
};
