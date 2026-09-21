import { CricketTeam } from './types';

export const WORLD_CUP_TEAMS: CricketTeam[] = [
  // 1. INDIA
  {
    id: 'ind',
    name: 'India',
    shortName: 'IND',
    flag: '🇮🇳',
    primaryColor: '#1d4ed8', // Royal Blue
    secondaryColor: '#ea580c', // Saffron
    textColor: '#ffffff',
    accentColor: '#f59e0b',
    rating: 94,
    tier: 1,
    description: 'Dynamic batting powerhouse with lethal yorkers & elite world-class fielding.',
    groupSeed: 'A',
  },

  // 2. AUSTRALIA
  {
    id: 'aus',
    name: 'Australia',
    shortName: 'AUS',
    flag: '🇦🇺',
    primaryColor: '#eab308', // Canary Yellow
    secondaryColor: '#15803d', // Dark Green
    textColor: '#0f172a',
    accentColor: '#ca8a04',
    rating: 93,
    tier: 1,
    description: 'Defending champions with ruthless power hitting and fiery fast bowling.',
    groupSeed: 'B',
  },

  // 3. ENGLAND
  {
    id: 'eng',
    name: 'England',
    shortName: 'ENG',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    primaryColor: '#dc2626', // English Red
    secondaryColor: '#1e3a8a', // Navy
    textColor: '#ffffff',
    accentColor: '#38bdf8',
    rating: 91,
    tier: 1,
    description: 'Explosive all-round lineup famous for aggressive ultra-attacking cricket.',
    groupSeed: 'B',
  },

  // 4. SOUTH AFRICA
  {
    id: 'sa',
    name: 'South Africa',
    shortName: 'SA',
    flag: '🇿🇦',
    primaryColor: '#16a34a', // Protea Green
    secondaryColor: '#eab308', // Gold
    textColor: '#ffffff',
    accentColor: '#4ade80',
    rating: 91,
    tier: 1,
    description: 'Fierce pace attack combined with elite middle-order boundary smashers.',
    groupSeed: 'A',
  },

  // 5. PAKISTAN
  {
    id: 'pak',
    name: 'Pakistan',
    shortName: 'PAK',
    flag: '🇵🇰',
    primaryColor: '#047857', // Deep Emerald
    secondaryColor: '#10b981', // Mint
    textColor: '#ffffff',
    accentColor: '#34d399',
    rating: 89,
    tier: 1,
    description: 'Blistering express pacers and unpredictable clutch match winners.',
    groupSeed: 'A',
  },

  // 6. NEW ZEALAND
  {
    id: 'nz',
    name: 'New Zealand',
    shortName: 'NZ',
    flag: '🇳🇿',
    primaryColor: '#0f172a', // Black Caps
    secondaryColor: '#64748b', // Slate Silver
    textColor: '#ffffff',
    accentColor: '#38bdf8',
    rating: 89,
    tier: 1,
    description: 'Disciplined tactical masters known for surgical precision and clutch tournament runs.',
    groupSeed: 'B',
  },

  // 7. WEST INDIES
  {
    id: 'wi',
    name: 'West Indies',
    shortName: 'WI',
    flag: '🌴',
    primaryColor: '#881337', // Maroon
    secondaryColor: '#eab308', // Gold
    textColor: '#ffffff',
    accentColor: '#fbbf24',
    rating: 88,
    tier: 1,
    description: 'Unmatched raw power hitters capable of clearing any boundary in the world.',
    groupSeed: 'A',
  },

  // 8. SRI LANKA
  {
    id: 'sl',
    name: 'Sri Lanka',
    shortName: 'SL',
    flag: '🇱🇰',
    primaryColor: '#1e40af', // Sri Lankan Blue
    secondaryColor: '#eab308', // Lion Gold
    textColor: '#ffffff',
    accentColor: '#60a5fa',
    rating: 86,
    tier: 2,
    description: 'Crafty mystery spin sensations and nimble batting stroke-makers.',
    groupSeed: 'A',
  },

  // 9. AFGHANISTAN
  {
    id: 'afg',
    name: 'Afghanistan',
    shortName: 'AFG',
    flag: '🇦🇫',
    primaryColor: '#2563eb', // Blue
    secondaryColor: '#dc2626', // Red
    textColor: '#ffffff',
    accentColor: '#facc15',
    rating: 87,
    tier: 2,
    description: 'Deadly spin wizards and fearless aggressive opening firepower.',
    groupSeed: 'B',
  },

  // 10. BANGLADESH
  {
    id: 'ban',
    name: 'Bangladesh',
    shortName: 'BAN',
    flag: '🇧🇩',
    primaryColor: '#065f46', // Bengal Tiger Green
    secondaryColor: '#dc2626', // Red
    textColor: '#ffffff',
    accentColor: '#34d399',
    rating: 84,
    tier: 2,
    description: 'Crafty cutters and disciplined subcontinental subcontinent battlers.',
    groupSeed: 'B',
  },

  // 11. IRELAND
  {
    id: 'ire',
    name: 'Ireland',
    shortName: 'IRE',
    flag: '🇮🇪',
    primaryColor: '#15803d', // Irish Shamrock
    secondaryColor: '#1e293b', // Dark Slate
    textColor: '#ffffff',
    accentColor: '#86efac',
    rating: 82,
    tier: 2,
    description: 'Giant killers with fearless top-order strokeplay and swing bowling.',
    groupSeed: 'A',
  },

  // 12. NETHERLANDS
  {
    id: 'ned',
    name: 'Netherlands',
    shortName: 'NED',
    flag: '🇳🇱',
    primaryColor: '#ea580c', // Oranje
    secondaryColor: '#1e3a8a', // Royal Blue
    textColor: '#ffffff',
    accentColor: '#fed7aa',
    rating: 81,
    tier: 2,
    description: 'Tenacious all-rounders with sharp fielding and resilient spirit.',
    groupSeed: 'B',
  },

  // 13. SCOTLAND
  {
    id: 'sco',
    name: 'Scotland',
    shortName: 'SCO',
    flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    primaryColor: '#1e3a8a', // Scottish Navy
    secondaryColor: '#0284c7', // Sky Blue
    textColor: '#ffffff',
    accentColor: '#93c5fd',
    rating: 80,
    tier: 2,
    description: 'Dynamic power hitters and clever left-arm spin specialists.',
    groupSeed: 'A',
  },

  // 14. USA
  {
    id: 'usa',
    name: 'United States',
    shortName: 'USA',
    flag: '🇺🇸',
    primaryColor: '#1e40af', // Stars & Stripes Blue
    secondaryColor: '#dc2626', // Red
    textColor: '#ffffff',
    accentColor: '#f87171',
    rating: 81,
    tier: 2,
    description: 'Breakout tournament sensation with lethal seam bowling and explosive hitters.',
    groupSeed: 'B',
  },

  // 15. NAMIBIA
  {
    id: 'nam',
    name: 'Namibia',
    shortName: 'NAM',
    flag: '🇳🇦',
    primaryColor: '#0284c7', // Sky Blue
    secondaryColor: '#1e293b', // Dark Navy
    textColor: '#ffffff',
    accentColor: '#eab308',
    rating: 78,
    tier: 3,
    description: 'Eagles known for athletic fielding and gritty left-arm pace attacks.',
    groupSeed: 'A',
  },

  // 16. ZIMBABWE
  {
    id: 'zim',
    name: 'Zimbabwe',
    shortName: 'ZIM',
    flag: '🇿🇼',
    primaryColor: '#b91c1c', // Chevrons Red
    secondaryColor: '#eab308', // Gold
    textColor: '#ffffff',
    accentColor: '#fbbf24',
    rating: 80,
    tier: 2,
    description: 'High-energy all-rounders led by world-class match-winner Sikandar Raza.',
    groupSeed: 'B',
  },

  // 17. NEPAL
  {
    id: 'nep',
    name: 'Nepal',
    shortName: 'NEP',
    flag: '🇳🇵',
    primaryColor: '#dc2626', // Crimson Red
    secondaryColor: '#1e3a8a', // Deep Blue
    textColor: '#ffffff',
    accentColor: '#facc15',
    rating: 77,
    tier: 3,
    description: 'Rhinos driven by immense fan passion and versatile wrist-spin wizardry.',
    groupSeed: 'A',
  },

  // 18. OMAN
  {
    id: 'oma',
    name: 'Oman',
    shortName: 'OMA',
    flag: '🇴🇲',
    primaryColor: '#dc2626', // Red
    secondaryColor: '#15803d', // Green
    textColor: '#ffffff',
    accentColor: '#ffffff',
    rating: 76,
    tier: 3,
    description: 'Dangerous swing bowlers and steady middle-order stabilizers.',
    groupSeed: 'B',
  },

  // 19. CANADA
  {
    id: 'can',
    name: 'Canada',
    shortName: 'CAN',
    flag: '🇨🇦',
    primaryColor: '#dc2626', // Maple Red
    secondaryColor: '#ffffff', // White
    textColor: '#ffffff',
    accentColor: '#fca5a5',
    rating: 76,
    tier: 3,
    description: 'Solid seam bowling unit backed by aggressive boundary hunters.',
    groupSeed: 'A',
  },

  // 20. UGANDA
  {
    id: 'uga',
    name: 'Uganda',
    shortName: 'UGA',
    flag: '🇺🇬',
    primaryColor: '#eab308', // Yellow
    secondaryColor: '#0f172a', // Black
    textColor: '#0f172a',
    accentColor: '#dc2626',
    rating: 75,
    tier: 3,
    description: 'Cricket Cranes bringing fierce energy, raw pace, and historic heart.',
    groupSeed: 'B',
  },
];

export const HOST_COUNTRIES: import('./types').HostCountry[] = [
  {
    id: 'ind',
    name: 'India',
    shortCode: 'IND',
    flag: '🇮🇳',
    venues: [
      'Wankhede Stadium, Mumbai',
      'Eden Gardens, Kolkata',
      'Narendra Modi Stadium, Ahmedabad',
      'M. Chinnaswamy Stadium, Bengaluru',
      'Arun Jaitley Stadium, New Delhi',
      'M. A. Chidambaram Stadium, Chennai',
      'HPCA Stadium, Dharamshala',
      'Rajiv Gandhi International Stadium, Hyderabad',
    ],
  },
  {
    id: 'aus',
    name: 'Australia',
    shortCode: 'AUS',
    flag: '🇦🇺',
    venues: [
      'Melbourne Cricket Ground, Melbourne',
      'Sydney Cricket Ground, Sydney',
      'The Gabba, Brisbane',
      'Optus Stadium, Perth',
      'Adelaide Oval, Adelaide',
      'Bellerive Oval, Hobart',
      'Manuka Oval, Canberra',
    ],
  },
  {
    id: 'eng',
    name: 'England & Wales',
    shortCode: 'ENG',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    venues: [
      'Lord\'s Cricket Ground, London',
      'The Oval, London',
      'Edgbaston, Birmingham',
      'Headingley, Leeds',
      'Old Trafford, Manchester',
      'Trent Bridge, Nottingham',
      'Sophia Gardens, Cardiff',
    ],
  },
  {
    id: 'wi',
    name: 'West Indies',
    shortCode: 'WI',
    flag: '🌴',
    venues: [
      'Kensington Oval, Barbados',
      'Providence Stadium, Guyana',
      'Daren Sammy Cricket Ground, St Lucia',
      'Arnos Vale Ground, St Vincent',
      'Sir Vivian Richards Stadium, Antigua',
      'Brian Lara Cricket Academy, Trinidad',
      'Sabina Park, Jamaica',
    ],
  },
  {
    id: 'sa',
    name: 'South Africa',
    shortCode: 'SA',
    flag: '🇿🇦',
    venues: [
      'Newlands Cricket Ground, Cape Town',
      'Wanderers Stadium, Johannesburg',
      'Centurion Park, Pretoria',
      'Kingsmead, Durban',
      'St George\'s Park, Gqeberha',
      'Boland Park, Paarl',
      'Mangaung Oval, Bloemfontein',
    ],
  },
  {
    id: 'usa',
    name: 'USA',
    shortCode: 'USA',
    flag: '🇺🇸',
    venues: [
      'Grand Prairie Stadium, Dallas, Texas',
      'Nassau County International Stadium, NY',
      'Central Broward Park, Lauderhill, Florida',
      'Moosa Stadium, Pearland, Texas',
      'Church Street Park, Morrisville, NC',
    ],
  },
  {
    id: 'sl',
    name: 'Sri Lanka',
    shortCode: 'SL',
    flag: '🇱🇰',
    venues: [
      'R. Premadasa Stadium, Colombo',
      'Pallekele International Stadium, Kandy',
      'Galle International Stadium, Galle',
      'Mahinda Rajapaksa Stadium, Hambantota',
      'Rangiri Dambulla International Stadium',
    ],
  },
  {
    id: 'pak',
    name: 'Pakistan',
    shortCode: 'PAK',
    flag: '🇵🇰',
    venues: [
      'Gaddafi Stadium, Lahore',
      'National Bank Stadium, Karachi',
      'Rawalpindi Cricket Stadium, Rawalpindi',
      'Multan Cricket Stadium, Multan',
    ],
  },
  {
    id: 'nz',
    name: 'New Zealand',
    shortCode: 'NZ',
    flag: '🇳🇿',
    venues: [
      'Eden Park, Auckland',
      'Hagley Oval, Christchurch',
      'Wellington Regional Stadium, Wellington',
      'Seddon Park, Hamilton',
      'University Oval, Dunedin',
      'McLean Park, Napier',
    ],
  },
  {
    id: 'ban',
    name: 'Bangladesh',
    shortCode: 'BAN',
    flag: '🇧🇩',
    venues: [
      'Sher-e-Bangla National Stadium, Dhaka',
      'Zahur Ahmed Chowdhury Stadium, Chattogram',
      'Sylhet International Cricket Stadium, Sylhet',
      'Khan Shaheb Osman Ali Stadium, Fatullah',
    ],
  },
];

export function getRandomHostCountry(): import('./types').HostCountry {
  const randomIndex = Math.floor(Math.random() * HOST_COUNTRIES.length);
  return HOST_COUNTRIES[randomIndex];
}

export const VENUES = HOST_COUNTRIES[0].venues;

export const TEAM_SQUADS: Record<string, import('./types').SquadPlayer[]> = {
  ind: [
    { id: 'ind_1', name: 'Rohit Sharma', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'ind_2', name: 'Virat Kohli', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'ind_3', name: 'Suryakumar Yadav', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'ind_4', name: 'Yashasvi Jaiswal', role: 'BATSMAN', battingStyle: 'Left-Hand Bat' },
    { id: 'ind_5', name: 'Rishabh Pant', role: 'WICKET_KEEPER', battingStyle: 'Left-Hand Bat' },
    { id: 'ind_6', name: 'Hardik Pandya', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'ind_7', name: 'Ravindra Jadeja', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'ind_8', name: 'Axar Patel', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'ind_9', name: 'Jasprit Bumrah', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast' },
    { id: 'ind_10', name: 'Arshdeep Singh', role: 'BOWLER', bowlingStyle: 'Left-Arm Fast Medium' },
    { id: 'ind_11', name: 'Kuldeep Yadav', role: 'BOWLER', bowlingStyle: 'Left-Arm Wrist Spin' },
    { id: 'ind_12', name: 'Mohammed Siraj', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast' },
    { id: 'ind_13', name: 'Shivam Dube', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Right-Arm Medium' },
    { id: 'ind_14', name: 'Sanju Samson', role: 'WICKET_KEEPER', battingStyle: 'Right-Hand Bat' },
    { id: 'ind_15', name: 'Yuzvendra Chahal', role: 'BOWLER', bowlingStyle: 'Right-Arm Leg Spin' },
  ],
  aus: [
    { id: 'aus_1', name: 'Pat Cummins', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast' },
    { id: 'aus_2', name: 'Travis Head', role: 'BATSMAN', battingStyle: 'Left-Hand Bat' },
    { id: 'aus_3', name: 'David Warner', role: 'BATSMAN', battingStyle: 'Left-Hand Bat' },
    { id: 'aus_4', name: 'Mitchell Marsh', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Medium' },
    { id: 'aus_5', name: 'Glenn Maxwell', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Off Spin' },
    { id: 'aus_6', name: 'Marcus Stoinis', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Medium Fast' },
    { id: 'aus_7', name: 'Tim David', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'aus_8', name: 'Matthew Wade', role: 'WICKET_KEEPER', battingStyle: 'Left-Hand Bat' },
    { id: 'aus_9', name: 'Mitchell Starc', role: 'BOWLER', bowlingStyle: 'Left-Arm Fast' },
    { id: 'aus_10', name: 'Josh Hazlewood', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'aus_11', name: 'Adam Zampa', role: 'BOWLER', bowlingStyle: 'Right-Arm Leg Spin' },
    { id: 'aus_12', name: 'Ashton Agar', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'aus_13', name: 'Nathan Ellis', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'aus_14', name: 'Josh Inglis', role: 'WICKET_KEEPER', battingStyle: 'Right-Hand Bat' },
    { id: 'aus_15', name: 'Cameron Green', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Fast' },
  ],
  eng: [
    { id: 'eng_1', name: 'Jos Buttler', role: 'WICKET_KEEPER', battingStyle: 'Right-Hand Bat' },
    { id: 'eng_2', name: 'Harry Brook', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'eng_3', name: 'Phil Salt', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'eng_4', name: 'Jonny Bairstow', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'eng_5', name: 'Liam Livingstone', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Leg Spin' },
    { id: 'eng_6', name: 'Moeen Ali', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Right-Arm Off Spin' },
    { id: 'eng_7', name: 'Sam Curran', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Left-Arm Medium Fast' },
    { id: 'eng_8', name: 'Chris Jordan', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'eng_9', name: 'Jofra Archer', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast' },
    { id: 'eng_10', name: 'Adil Rashid', role: 'BOWLER', bowlingStyle: 'Right-Arm Leg Spin' },
    { id: 'eng_11', name: 'Reece Topley', role: 'BOWLER', bowlingStyle: 'Left-Arm Fast Medium' },
    { id: 'eng_12', name: 'Mark Wood', role: 'BOWLER', bowlingStyle: 'Right-Arm Express Fast' },
    { id: 'eng_13', name: 'Will Jacks', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Off Spin' },
    { id: 'eng_14', name: 'Ben Duckett', role: 'BATSMAN', battingStyle: 'Left-Hand Bat' },
    { id: 'eng_15', name: 'Tom Hartley', role: 'BOWLER', bowlingStyle: 'Slow Left-Arm Orthodox' },
  ],
  sa: [
    { id: 'sa_1', name: 'Aiden Markram', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'sa_2', name: 'Heinrich Klaasen', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'sa_3', name: 'Quinton de Kock', role: 'WICKET_KEEPER', battingStyle: 'Left-Hand Bat' },
    { id: 'sa_4', name: 'David Miller', role: 'BATSMAN', battingStyle: 'Left-Hand Bat' },
    { id: 'sa_5', name: 'Tristan Stubbs', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'sa_6', name: 'Marco Jansen', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Left-Arm Fast' },
    { id: 'sa_7', name: 'Keshav Maharaj', role: 'BOWLER', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'sa_8', name: 'Kagiso Rabada', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast' },
    { id: 'sa_9', name: 'Anrich Nortje', role: 'BOWLER', bowlingStyle: 'Right-Arm Express Fast' },
    { id: 'sa_10', name: 'Tabraiz Shamsi', role: 'BOWLER', bowlingStyle: 'Left-Arm Wrist Spin' },
    { id: 'sa_11', name: 'Ottneil Baartman', role: 'BOWLER', bowlingStyle: 'Right-Arm Medium Fast' },
    { id: 'sa_12', name: 'Reeza Hendricks', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'sa_13', name: 'Ryan Rickelton', role: 'WICKET_KEEPER', battingStyle: 'Left-Hand Bat' },
    { id: 'sa_14', name: 'Bjorn Fortuin', role: 'BOWLER', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'sa_15', name: 'Lungi Ngidi', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast Medium' },
  ],
  pak: [
    { id: 'pak_1', name: 'Babar Azam', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'pak_2', name: 'Mohammad Rizwan', role: 'WICKET_KEEPER', battingStyle: 'Right-Hand Bat' },
    { id: 'pak_3', name: 'Fakhar Zaman', role: 'BATSMAN', battingStyle: 'Left-Hand Bat' },
    { id: 'pak_4', name: 'Saim Ayub', role: 'BATSMAN', battingStyle: 'Left-Hand Bat' },
    { id: 'pak_5', name: 'Iftikhar Ahmed', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Off Spin' },
    { id: 'pak_6', name: 'Shadab Khan', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Leg Spin' },
    { id: 'pak_7', name: 'Imad Wasim', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'pak_8', name: 'Shaheen Afridi', role: 'BOWLER', bowlingStyle: 'Left-Arm Fast' },
    { id: 'pak_9', name: 'Naseem Shah', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast' },
    { id: 'pak_10', name: 'Haris Rauf', role: 'BOWLER', bowlingStyle: 'Right-Arm Express Fast' },
    { id: 'pak_11', name: 'Mohammad Amir', role: 'BOWLER', bowlingStyle: 'Left-Arm Fast' },
    { id: 'pak_12', name: 'Azam Khan', role: 'WICKET_KEEPER', battingStyle: 'Right-Hand Bat' },
    { id: 'pak_13', name: 'Usman Khan', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'pak_14', name: 'Abbas Afridi', role: 'BOWLER', bowlingStyle: 'Right-Arm Medium Fast' },
    { id: 'pak_15', name: 'Abrar Ahmed', role: 'BOWLER', bowlingStyle: 'Right-Arm Mystery Spin' },
  ],
  nz: [
    { id: 'nz_1', name: 'Kane Williamson', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'nz_2', name: 'Glenn Phillips', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'nz_3', name: 'Finn Allen', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'nz_4', name: 'Devon Conway', role: 'WICKET_KEEPER', battingStyle: 'Left-Hand Bat' },
    { id: 'nz_5', name: 'Daryl Mitchell', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Medium' },
    { id: 'nz_6', name: 'Mark Chapman', role: 'BATSMAN', battingStyle: 'Left-Hand Bat' },
    { id: 'nz_7', name: 'James Neesham', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Right-Arm Medium Fast' },
    { id: 'nz_8', name: 'Mitchell Santner', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'nz_9', name: 'Trent Boult', role: 'BOWLER', bowlingStyle: 'Left-Arm Fast' },
    { id: 'nz_10', name: 'Tim Southee', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'nz_11', name: 'Lockie Ferguson', role: 'BOWLER', bowlingStyle: 'Right-Arm Express Fast' },
    { id: 'nz_12', name: 'Matt Henry', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'nz_13', name: 'Ish Sodhi', role: 'BOWLER', bowlingStyle: 'Right-Arm Leg Spin' },
    { id: 'nz_14', name: 'Rachin Ravindra', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'nz_15', name: 'Michael Bracewell', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Right-Arm Off Spin' },
  ],
  wi: [
    { id: 'wi_1', name: 'Rovman Powell', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'wi_2', name: 'Nicholas Pooran', role: 'WICKET_KEEPER', battingStyle: 'Left-Hand Bat' },
    { id: 'wi_3', name: 'Brandon King', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'wi_4', name: 'Johnson Charles', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'wi_5', name: 'Sherfane Rutherford', role: 'BATSMAN', battingStyle: 'Left-Hand Bat' },
    { id: 'wi_6', name: 'Andre Russell', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Fast' },
    { id: 'wi_7', name: 'Romario Shepherd', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'wi_8', name: 'Akeal Hosein', role: 'BOWLER', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'wi_9', name: 'Gudakesh Motie', role: 'BOWLER', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'wi_10', name: 'Alzarri Joseph', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast' },
    { id: 'wi_11', name: 'Shamar Joseph', role: 'BOWLER', bowlingStyle: 'Right-Arm Express Fast' },
    { id: 'wi_12', name: 'Shimron Hetmyer', role: 'BATSMAN', battingStyle: 'Left-Hand Bat' },
    { id: 'wi_13', name: 'Roston Chase', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Off Spin' },
    { id: 'wi_14', name: 'Obed McCoy', role: 'BOWLER', bowlingStyle: 'Left-Arm Fast Medium' },
    { id: 'wi_15', name: 'Shai Hope', role: 'WICKET_KEEPER', battingStyle: 'Right-Hand Bat' },
  ],
  sl: [
    { id: 'sl_1', name: 'Charith Asalanka', role: 'BATSMAN', battingStyle: 'Left-Hand Bat' },
    { id: 'sl_2', name: 'Pathum Nissanka', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'sl_3', name: 'Kusal Mendis', role: 'WICKET_KEEPER', battingStyle: 'Right-Hand Bat' },
    { id: 'sl_4', name: 'Kamindu Mendis', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Ambidextrous Spin' },
    { id: 'sl_5', name: 'Angelo Mathews', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Medium' },
    { id: 'sl_6', name: 'Dasun Shanaka', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Medium' },
    { id: 'sl_7', name: 'Wanindu Hasaranga', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Leg Spin' },
    { id: 'sl_8', name: 'Maheesh Theekshana', role: 'BOWLER', bowlingStyle: 'Right-Arm Mystery Off Spin' },
    { id: 'sl_9', name: 'Matheesha Pathirana', role: 'BOWLER', bowlingStyle: 'Right-Arm Slinger Fast' },
    { id: 'sl_10', name: 'Nuwan Thushara', role: 'BOWLER', bowlingStyle: 'Right-Arm Slinger Fast' },
    { id: 'sl_11', name: 'Dilshan Madushanka', role: 'BOWLER', bowlingStyle: 'Left-Arm Fast Medium' },
    { id: 'sl_12', name: 'Dunith Wellalage', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'sl_13', name: 'Dushmantha Chameera', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast' },
    { id: 'sl_14', name: 'Dhananjaya de Silva', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Off Spin' },
    { id: 'sl_15', name: 'Sadeera Samarawickrama', role: 'WICKET_KEEPER', battingStyle: 'Right-Hand Bat' },
  ],
  afg: [
    { id: 'afg_1', name: 'Rashid Khan', role: 'BOWLER', bowlingStyle: 'Right-Arm Leg Spin' },
    { id: 'afg_2', name: 'Rahmanullah Gurbaz', role: 'WICKET_KEEPER', battingStyle: 'Right-Hand Bat' },
    { id: 'afg_3', name: 'Ibrahim Zadran', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'afg_4', name: 'Gulbadin Naib', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Medium' },
    { id: 'afg_5', name: 'Azmatullah Omarzai', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'afg_6', name: 'Mohammad Nabi', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Off Spin' },
    { id: 'afg_7', name: 'Najibullah Zadran', role: 'BATSMAN', battingStyle: 'Left-Hand Bat' },
    { id: 'afg_8', name: 'Karim Janat', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Medium' },
    { id: 'afg_9', name: 'Noor Ahmad', role: 'BOWLER', bowlingStyle: 'Left-Arm Wrist Spin' },
    { id: 'afg_10', name: 'Naveen-ul-Haq', role: 'BOWLER', bowlingStyle: 'Right-Arm Medium Fast' },
    { id: 'afg_11', name: 'Fazalhaq Farooqi', role: 'BOWLER', bowlingStyle: 'Left-Arm Fast Medium' },
    { id: 'afg_12', name: 'Mujeeb Ur Rahman', role: 'BOWLER', bowlingStyle: 'Right-Arm Mystery Spin' },
    { id: 'afg_13', name: 'Fareed Ahmad', role: 'BOWLER', bowlingStyle: 'Left-Arm Fast Medium' },
    { id: 'afg_14', name: 'Mohammad Ishaq', role: 'WICKET_KEEPER', battingStyle: 'Right-Hand Bat' },
    { id: 'afg_15', name: 'Nangeyalia Kharote', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Slow Left-Arm Orthodox' },
  ],
  ban: [
    { id: 'ban_1', name: 'Najmul Hossain Shanto', role: 'BATSMAN', battingStyle: 'Left-Hand Bat' },
    { id: 'ban_2', name: 'Towhid Hridoy', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'ban_3', name: 'Litton Das', role: 'WICKET_KEEPER', battingStyle: 'Right-Hand Bat' },
    { id: 'ban_4', name: 'Tanzid Hasan', role: 'BATSMAN', battingStyle: 'Left-Hand Bat' },
    { id: 'ban_5', name: 'Shakib Al Hasan', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'ban_6', name: 'Mahmudullah', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Off Spin' },
    { id: 'ban_7', name: 'Jaker Ali', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'ban_8', name: 'Rishad Hossain', role: 'BOWLER', bowlingStyle: 'Right-Arm Leg Spin' },
    { id: 'ban_9', name: 'Taskin Ahmed', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast' },
    { id: 'ban_10', name: 'Mustafizur Rahman', role: 'BOWLER', bowlingStyle: 'Left-Arm Fast Medium Cutters' },
    { id: 'ban_11', name: 'Shoriful Islam', role: 'BOWLER', bowlingStyle: 'Left-Arm Fast Medium' },
    { id: 'ban_12', name: 'Tanzim Hasan Sakib', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'ban_13', name: 'Mahedi Hasan', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Off Spin' },
    { id: 'ban_14', name: 'Soumya Sarkar', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Right-Arm Medium' },
    { id: 'ban_15', name: 'Tanvir Islam', role: 'BOWLER', bowlingStyle: 'Slow Left-Arm Orthodox' },
  ],
  ire: [
    { id: 'ire_1', name: 'Paul Stirling', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'ire_2', name: 'Harry Tector', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'ire_3', name: 'Andrew Balbirnie', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'ire_4', name: 'Lorcan Tucker', role: 'WICKET_KEEPER', battingStyle: 'Right-Hand Bat' },
    { id: 'ire_5', name: 'Curtis Campher', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Medium Fast' },
    { id: 'ire_6', name: 'George Dockrell', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'ire_7', name: 'Gareth Delany', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Leg Spin' },
    { id: 'ire_8', name: 'Mark Adair', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'ire_9', name: 'Barry McCarthy', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'ire_10', name: 'Josh Little', role: 'BOWLER', bowlingStyle: 'Left-Arm Fast' },
    { id: 'ire_11', name: 'Craig Young', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'ire_12', name: 'Neil Rock', role: 'WICKET_KEEPER', battingStyle: 'Left-Hand Bat' },
    { id: 'ire_13', name: 'Graham Hume', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'ire_14', name: 'Ben White', role: 'BOWLER', bowlingStyle: 'Right-Arm Leg Spin' },
    { id: 'ire_15', name: 'Ross Adair', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
  ],
  ned: [
    { id: 'ned_1', name: 'Scott Edwards', role: 'WICKET_KEEPER', battingStyle: 'Right-Hand Bat' },
    { id: 'ned_2', name: 'Max O\'Dowd', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'ned_3', name: 'Michael Levitt', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'ned_4', name: 'Vikramjit Singh', role: 'BATSMAN', battingStyle: 'Left-Hand Bat' },
    { id: 'ned_5', name: 'Sybrand Engelbrecht', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'ned_6', name: 'Bas de Leede', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'ned_7', name: 'Teja Nidamanuru', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'ned_8', name: 'Logan van Beek', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'ned_9', name: 'Tim Pringle', role: 'BOWLER', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'ned_10', name: 'Paul van Meekeren', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast' },
    { id: 'ned_11', name: 'Vivian Kingma', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'ned_12', name: 'Aryan Dutt', role: 'BOWLER', bowlingStyle: 'Right-Arm Off Spin' },
    { id: 'ned_13', name: 'Wesley Barresi', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'ned_14', name: 'Saqib Zulfiqar', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Leg Spin' },
    { id: 'ned_15', name: 'Kyle Klein', role: 'BOWLER', bowlingStyle: 'Right-Arm Medium Fast' },
  ],
  sco: [
    { id: 'sco_1', name: 'Richie Berrington', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'sco_2', name: 'George Munsey', role: 'BATSMAN', battingStyle: 'Left-Hand Bat' },
    { id: 'sco_3', name: 'Michael Jones', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'sco_4', name: 'Brandon McMullen', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Medium Fast' },
    { id: 'sco_5', name: 'Matthew Cross', role: 'WICKET_KEEPER', battingStyle: 'Right-Hand Bat' },
    { id: 'sco_6', name: 'Michael Leask', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Off Spin' },
    { id: 'sco_7', name: 'Chris Greaves', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Leg Spin' },
    { id: 'sco_8', name: 'Mark Watt', role: 'BOWLER', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'sco_9', name: 'Christopher Sole', role: 'BOWLER', bowlingStyle: 'Right-Arm Express Fast' },
    { id: 'sco_10', name: 'Brad Wheal', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast' },
    { id: 'sco_11', name: 'Safyaan Sharif', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'sco_12', name: 'Bradley Currie', role: 'BOWLER', bowlingStyle: 'Left-Arm Fast Medium' },
    { id: 'sco_13', name: 'Ollie Hairs', role: 'BATSMAN', battingStyle: 'Left-Hand Bat' },
    { id: 'sco_14', name: 'Jack Jarvis', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Medium Fast' },
    { id: 'sco_15', name: 'Charlie Tear', role: 'WICKET_KEEPER', battingStyle: 'Right-Hand Bat' },
  ],
  usa: [
    { id: 'usa_1', name: 'Monank Patel', role: 'WICKET_KEEPER', battingStyle: 'Right-Hand Bat' },
    { id: 'usa_2', name: 'Aaron Jones', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'usa_3', name: 'Steven Taylor', role: 'BATSMAN', battingStyle: 'Left-Hand Bat' },
    { id: 'usa_4', name: 'Andries Gous', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'usa_5', name: 'Corey Anderson', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Left-Arm Medium' },
    { id: 'usa_6', name: 'Nitish Kumar', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'usa_7', name: 'Harmeet Singh', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'usa_8', name: 'Shadley van Schalkwyk', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Medium Fast' },
    { id: 'usa_9', name: 'Jasdeep Singh', role: 'BOWLER', bowlingStyle: 'Right-Arm Medium Fast' },
    { id: 'usa_10', name: 'Saurabh Netravalkar', role: 'BOWLER', bowlingStyle: 'Left-Arm Fast Medium' },
    { id: 'usa_11', name: 'Ali Khan', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast Yorkers' },
    { id: 'usa_12', name: 'Nosthush Kenjige', role: 'BOWLER', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'usa_13', name: 'Milind Kumar', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Off Spin' },
    { id: 'usa_14', name: 'Nisarg Patel', role: 'BOWLER', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'usa_15', name: 'Shayan Jahangir', role: 'WICKET_KEEPER', battingStyle: 'Right-Hand Bat' },
  ],
  nam: [
    { id: 'nam_1', name: 'Gerhard Erasmus', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'nam_2', name: 'JJ Smit', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Left-Arm Medium Fast' },
    { id: 'nam_3', name: 'Michael van Lingen', role: 'BATSMAN', battingStyle: 'Left-Hand Bat' },
    { id: 'nam_4', name: 'Nikolaas Davin', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'nam_5', name: 'Jan Frylinck', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Left-Arm Medium' },
    { id: 'nam_6', name: 'David Wiese', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'nam_7', name: 'Zane Green', role: 'WICKET_KEEPER', battingStyle: 'Left-Hand Bat' },
    { id: 'nam_8', name: 'Ruben Trumpelmann', role: 'BOWLER', bowlingStyle: 'Left-Arm Fast' },
    { id: 'nam_9', name: 'Bernard Scholtz', role: 'BOWLER', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'nam_10', name: 'Tangeni Lungameni', role: 'BOWLER', bowlingStyle: 'Left-Arm Medium Fast' },
    { id: 'nam_11', name: 'Ben Shikongo', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'nam_12', name: 'Malan Kruger', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'nam_13', name: 'JP Kotze', role: 'WICKET_KEEPER', battingStyle: 'Left-Hand Bat' },
    { id: 'nam_14', name: 'Dylan Leicher', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Medium' },
    { id: 'nam_15', name: 'Peter-Daniel Blignaut', role: 'BOWLER', bowlingStyle: 'Right-Arm Leg Spin' },
  ],
  zim: [
    { id: 'zim_1', name: 'Sikandar Raza', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Mystery Off Spin' },
    { id: 'zim_2', name: 'Craig Ervine', role: 'BATSMAN', battingStyle: 'Left-Hand Bat' },
    { id: 'zim_3', name: 'Innocent Kaia', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'zim_4', name: 'Brian Bennett', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'zim_5', name: 'Clive Madande', role: 'WICKET_KEEPER', battingStyle: 'Right-Hand Bat' },
    { id: 'zim_6', name: 'Ryan Burl', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Right-Arm Leg Spin' },
    { id: 'zim_7', name: 'Luke Jongwe', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'zim_8', name: 'Wellington Masakadza', role: 'BOWLER', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'zim_9', name: 'Richard Ngarava', role: 'BOWLER', bowlingStyle: 'Left-Arm Fast' },
    { id: 'zim_10', name: 'Blessing Muzarabani', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast Bounce' },
    { id: 'zim_11', name: 'Tendai Chatara', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'zim_12', name: 'Tadiwanashe Marumani', role: 'WICKET_KEEPER', battingStyle: 'Left-Hand Bat' },
    { id: 'zim_13', name: 'Faraz Akram', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Right-Arm Medium Fast' },
    { id: 'zim_14', name: 'Johnathan Campbell', role: 'BATSMAN', battingStyle: 'Left-Hand Bat' },
    { id: 'zim_15', name: 'Brandon Mavuta', role: 'BOWLER', bowlingStyle: 'Right-Arm Leg Spin' },
  ],
  nep: [
    { id: 'nep_1', name: 'Rohit Paudel', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'nep_2', name: 'Kushal Bhurtel', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'nep_3', name: 'Aasif Sheikh', role: 'WICKET_KEEPER', battingStyle: 'Right-Hand Bat' },
    { id: 'nep_4', name: 'Anil Sah', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'nep_5', name: 'Kushal Malla', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'nep_6', name: 'Dipendra Singh Airee', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Off Spin' },
    { id: 'nep_7', name: 'Sompal Kami', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'nep_8', name: 'Gulsan Jha', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Right-Arm Medium' },
    { id: 'nep_9', name: 'Karan KC', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'nep_10', name: 'Abinash Bohara', role: 'BOWLER', bowlingStyle: 'Right-Arm Medium Fast' },
    { id: 'nep_11', name: 'Lalit Rajbanshi', role: 'BOWLER', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'nep_12', name: 'Sandeep Lamichhane', role: 'BOWLER', bowlingStyle: 'Right-Arm Leg Spin' },
    { id: 'nep_13', name: 'Pratis GC', role: 'BOWLER', bowlingStyle: 'Left-Arm Medium Fast' },
    { id: 'nep_14', name: 'Sundeep Jora', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'nep_15', name: 'Sagar Dhakal', role: 'BOWLER', bowlingStyle: 'Slow Left-Arm Orthodox' },
  ],
  oma: [
    { id: 'oma_1', name: 'Aqib Ilyas', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'oma_2', name: 'Zeeshan Maqsood', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'oma_3', name: 'Kashyap Prajapati', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'oma_4', name: 'Pratik Athavale', role: 'WICKET_KEEPER', battingStyle: 'Right-Hand Bat' },
    { id: 'oma_5', name: 'Khalid Kail', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'oma_6', name: 'Ayaan Khan', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'oma_7', name: 'Mehran Khan', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Medium Fast' },
    { id: 'oma_8', name: 'Rafiullah', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'oma_9', name: 'Shakeel Ahmed', role: 'BOWLER', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'oma_10', name: 'Bilal Khan', role: 'BOWLER', bowlingStyle: 'Left-Arm Fast Swing' },
    { id: 'oma_11', name: 'Fayyaz Butt', role: 'BOWLER', bowlingStyle: 'Right-Arm Medium Fast' },
    { id: 'oma_12', name: 'Mohammad Nadeem', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Medium' },
    { id: 'oma_13', name: 'Shoaib Khan', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'oma_14', name: 'Kaleemullah', role: 'BOWLER', bowlingStyle: 'Right-Arm Medium Fast' },
    { id: 'oma_15', name: 'Naseem Khushi', role: 'WICKET_KEEPER', battingStyle: 'Right-Hand Bat' },
  ],
  can: [
    { id: 'can_1', name: 'Saad Bin Zafar', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'can_2', name: 'Nicholas Kirton', role: 'BATSMAN', battingStyle: 'Left-Hand Bat' },
    { id: 'can_3', name: 'Aaron Johnson', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'can_4', name: 'Navneet Dhaliwal', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'can_5', name: 'Pargat Singh', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'can_6', name: 'Shreyas Movva', role: 'WICKET_KEEPER', battingStyle: 'Right-Hand Bat' },
    { id: 'can_7', name: 'Dilpreet Bajwa', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Off Spin' },
    { id: 'can_8', name: 'Ravinderpal Singh', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'can_9', name: 'Dillon Heyliger', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'can_10', name: 'Kaleem Sana', role: 'BOWLER', bowlingStyle: 'Left-Arm Fast Medium' },
    { id: 'can_11', name: 'Jeremy Gordon', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast' },
    { id: 'can_12', name: 'Junaid Siddiqui', role: 'BOWLER', bowlingStyle: 'Right-Arm Leg Spin' },
    { id: 'can_13', name: 'Rishiv Joshi', role: 'BOWLER', bowlingStyle: 'Left-Arm Medium Fast' },
    { id: 'can_14', name: 'Nikhil Dutta', role: 'BOWLER', bowlingStyle: 'Right-Arm Off Spin' },
    { id: 'can_15', name: 'Rayyan Pathan', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
  ],
  uga: [
    { id: 'uga_1', name: 'Brian Masaba', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Leg Spin' },
    { id: 'uga_2', name: 'Riazat Ali Shah', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Medium' },
    { id: 'uga_3', name: 'Simon Ssesazi', role: 'BATSMAN', battingStyle: 'Left-Hand Bat' },
    { id: 'uga_4', name: 'Ronak Patel', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'uga_5', name: 'Roger Mukasa', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
    { id: 'uga_6', name: 'Kenneth Waiswa', role: 'ALL_ROUNDER', battingStyle: 'Right-Hand Bat', bowlingStyle: 'Right-Arm Medium' },
    { id: 'uga_7', name: 'Dinesh Nakrani', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Left-Arm Medium' },
    { id: 'uga_8', name: 'Alpesh Ramjani', role: 'ALL_ROUNDER', battingStyle: 'Left-Hand Bat', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'uga_9', name: 'Fred Achelam', role: 'WICKET_KEEPER', battingStyle: 'Right-Hand Bat' },
    { id: 'uga_10', name: 'Cosmas Kyewuta', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast' },
    { id: 'uga_11', name: 'Juma Miyagi', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'uga_12', name: 'Frank Nsubuga', role: 'BOWLER', bowlingStyle: 'Right-Arm Off Spin' },
    { id: 'uga_13', name: 'Henry Ssenyondo', role: 'BOWLER', bowlingStyle: 'Slow Left-Arm Orthodox' },
    { id: 'uga_14', name: 'Bilal Hassan', role: 'BOWLER', bowlingStyle: 'Right-Arm Fast Medium' },
    { id: 'uga_15', name: 'Robinson Obuya', role: 'BATSMAN', battingStyle: 'Right-Hand Bat' },
  ],
};

export { IPL_TEAMS, IPL_HOST_COUNTRY, IPL_EDITIONS, IPL_SQUADS } from './iplTeamsData';
import { IPL_TEAMS, IPL_SQUADS } from './iplTeamsData';

export function getTeamSquad(teamId: string): import('./types').SquadPlayer[] {
  const squad = TEAM_SQUADS[teamId] || IPL_SQUADS[teamId];
  if (squad && squad.length > 0) return squad;
  const team = getTeamById(teamId);
  return [
    { id: `${teamId}_1`, name: `${team.name} Opener`, role: 'BATSMAN' },
    { id: `${teamId}_2`, name: `${team.name} Top Order`, role: 'BATSMAN' },
    { id: `${teamId}_3`, name: `${team.name} Strike Bowler`, role: 'BOWLER' },
  ];
}

export function getTeamById(id: string | any): CricketTeam {
  const actualId = typeof id === 'string' ? id : (id && typeof id === 'object' ? (id.id || id.userTeamId || 'ind') : 'ind');
  const allTeams = [...WORLD_CUP_TEAMS, ...IPL_TEAMS];
  const found = allTeams.find((t) => t.id === actualId);
  if (found) {
    return {
      ...found,
      squad: TEAM_SQUADS[found.id] || IPL_SQUADS[found.id] || [],
    };
  }
  return {
    ...WORLD_CUP_TEAMS[0],
    squad: TEAM_SQUADS['ind'] || [],
  };
}
