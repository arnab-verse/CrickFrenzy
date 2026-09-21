# 🏏 Crick Frenzy: World Cup & T20 League Edition

A high-octane, physics-informed SVG cricket batting arcade game built with **React**, **TypeScript**, **Tailwind CSS**, and **Firebase Firestore**. Experience millisecond-precision batting mechanics, dynamic bowling variations, tournament career modes, vector national flags, authentic audio synthesis, and cloud-synced player statistics.

---

## 🌟 Key Features

- **🏆 Full World Cup Tournament (20 Teams)**:
  - Complete international tournament structure: Group Stage (4 Groups of 5), Super 8s, Semi-Finals, and Grand Final.
  - Realistic team power ratings, authentic vector flags, dynamic points table with Net Run Rate (NRR) calculations, and tournament bracket progression.
  - 20 Nations: *India, Australia, England, South Africa, Pakistan, New Zealand, West Indies, Sri Lanka, Afghanistan, Bangladesh, Ireland, Netherlands, Scotland, USA, Namibia, Zimbabwe, Nepal, Oman, Canada, Uganda*.

- **🇮🇳 Indian Cricket League (ICL - 10 Franchises)**:
  - 10 Indian premier franchises with distinct colors, team crests, home pitch conditions, and season standings.
  - *Mumbai, Chennai, Bangalore, Kolkata, Gujarat, Rajasthan, Hyderabad, Delhi, Lucknow, Punjab*.

- **⚡ Precision Batting & Physics Engine**:
  - Millisecond-level sweet-spot timing meter with real-time feedback (**PERFECT**, **GOOD**, **EARLY**, **LATE**, **MISS**).
  - 3 Directional Shot Modifiers:
    - **Off-Side**: Cover Drives, Square Cuts, Upper Cuts
    - **Straight**: Lofted Straight Hits, Long-On, Punch Drives
    - **On-Side / Leg-Side**: Pulls, Hooks, Flick Shots, Helicopter Shots
  - Dynamic ball trajectory physics: Real-time swing, reverse swing, drift, bounce, seam movement, and variable bowling speeds (80 km/h spin to 155 km/h express pace).

- **🎯 Tactical Fielding & Weather Systems**:
  - 4 Fielding Preset Layouts: *Balanced 6-3, Aggressive Ring, Defensive Deep Boundary, Spin Trap*.
  - Dynamic stadium atmospheres & day/night floodlight transitions (Sunny Day, Overcast, Humid Dew, Night Floodlights).

- **☁️ Firebase Authentication & Cloud Saves**:
  - Google Sign-In, Google Play Games profile integration, and Email/Password account registration.
  - Guest mode with instant local profile fallback.
  - Cloud Firestore sync for high scores, tournament progress, trophy cabinets, match histories, and batting averages.

- **🔊 Web Audio API Sound Engine**:
  - Pure Web Audio sound synthesis: Realistic willow wood bat cracks, leather ball impacts, cartwheeling stump rattles, umpire whistles, and reactive crowd cheers.

---

## 🎮 Game Controls

| Action | Keyboard Key | Mouse / Touch Controls | Shot Selection |
| :--- | :--- | :--- | :--- |
| **Swing Bat** | `SPACEBAR` or `ENTER` | Tap **SWING** or Click Pitch | Executes shot timing at the current instant |
| **Off-Side Shot** | `A` or `ArrowLeft` | Tap **OFF-SIDE** Button | Cuts, Cover Drives, Upper Cuts |
| **Straight Shot** | `W` or `ArrowUp` | Tap **STRAIGHT** Button | Straight Drives, Lofted Hits, Long-On |
| **On-Side Shot** | `D` or `ArrowRight` | Tap **ON-SIDE** Button | Pulls, Hooks, Mid-Wicket, Flicks |
| **Bowl / Next Ball**| `SPACEBAR` (idle) | Tap **BOWL** Button | Releases delivery / proceeds to next ball |

---

## ⏱️ Timing Window & Scoring

| Timing Tier | Offset Window | Runs Scored | Wicket Probability |
| :--- | :--- | :--- | :--- |
| **PERFECT** | Within ±35 ms | **6 Runs** or **4 Runs** | 0% (Immune) |
| **GOOD** | Within ±95 ms | **4 Runs**, **2 Runs**, or **1 Run** | 0% |
| **EARLY / LATE** | Within ±180 ms | **1–2 Runs** or Defensive Block | Low |
| **VERY EARLY / LATE** | Within ±270 ms | **0–1 Runs** (Mistimed Edges) | 30%–55% (Catches / Edges) |
| **MISS** | > 270 ms | **0 Runs** (Play & Miss) | 45%–70% (Bowled / LBW if on target) |

---

## 🚀 Quick Start & Local Development

### Prerequisites
- **Node.js**: v18.0.0 or v20+ recommended
- **npm** or **yarn** / **pnpm**


## 🛠️ Project Structure

```text
├── index.html                  # HTML entry point with metadata & web fonts
├── vite.config.ts              # Vite + Tailwind CSS configuration
├── package.json                # Project dependencies and build scripts
├── src/
│   ├── main.tsx                # React application bootstrapper
│   ├── App.tsx                 # Main game controller & screen routing
│   ├── types.ts                # TypeScript interfaces & state models
│   ├── components/             # UI & Screen Components
│   │   ├── AuthScreen.tsx      # Initial Login / Register / Guest gate
│   │   ├── HomePage.tsx        # Main Arcade Home & Mode Selection
│   │   ├── PitchCanvas.tsx     # 2D/3D perspective SVG pitch & ball renderer
│   │   ├── TimingMeter.tsx     # Real-time sweet spot visualizer
│   │   ├── Scoreboard.tsx      # Live match header & ball tracker
│   │   ├── WorldCupHub.tsx     # Tournament Hub, Fixtures & Points Table
│   │   ├── KnockoutBracketView.tsx # Visual tournament bracket
│   │   ├── CountryFlag.tsx     # Vector SVG flags for 20 nations
│   │   ├── TeamBadge.tsx       # Universal team badges & crests
│   │   ├── ControlsPanel.tsx   # Hotkey & button control interface
│   │   └── InningsSummaryModal.tsx # Post-match batting scorecard
│   ├── engine/                 # Core Game Physics & Rules
│   │   ├── battingEngine.ts    # Ball contact evaluation & run calculations
│   │   ├── bowlingGenerator.ts # Trajectory, swing & speed generation
│   │   └── tournamentEngine.ts # Tournament schedules, NRR & bracket logic
│   ├── tournament/             # Tournament Data & Franchise Definitions
│   │   ├── teamsData.ts        # 20 World Cup & 10 ICL team profiles
│   │   └── tournamentPresets.ts# Fixture rules & tournament seeds
│   ├── lib/
│   │   ├── firebase.ts         # Authentication & Cloud Firestore client
│   │   └── guestProfile.ts     # Local persistence & profile sync
│   └── utils/
│       └── audio.ts            # Web Audio API procedural sound synthesizer
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
