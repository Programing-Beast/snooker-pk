# Frontend Progress (React + Vite + Tailwind)

## Phase 3 — React Web

### Setup
- [x] Vite + React + Tailwind project scaffold
- [x] Baize design tokens in CSS (@theme)
- [x] Google Fonts (Saira + Hanken Grotesk + Rokkitt slab-serif)
- [x] Vite proxy to Laravel API (`/api` + `/storage`)
- [x] Axios API client (`src/api/client.js` + 15 API modules)
- [x] AuthContext (login, logout, register, me, role checks)
- [x] Redux Toolkit + RTK Query state management (store/api.js + endpoint slices)
- [x] Routing — react-router with ProtectedRoute, RoleRoute, GuestRoute (`router.jsx` + `App.jsx`)
- [x] Layouts — PublicLayout (TopNav + MobileTabBar), AdminLayout (sidebar + mobile header)
- [x] Vite proxy targeting `127.0.0.1:8000` (IPv4 fix for macOS)

### Scoring Engine
- [x] snookerEngine.js — framework-agnostic reducer (ported from umpire.js)
- [x] useSnookerEngine hook (undo support, timer)

### Umpire Board Components
- [x] UmpireBoard (main tablet layout — 3-column grid)
- [x] PlayerPanel (player info, frame points, break, high break)
- [x] BallButton (legal ball enforcement, pulse ring on expected)
- [x] ExpectedBallIndicator (on-ball display, phase label, reds counter)
- [x] BreakStrip (current visit balls + running total)
- [x] FrameHistory (horizontal scroll rail)
- [x] FoulOverlay (foul value picker + give-back decision)
- [x] FrameEndOverlay (winner, score, next breaker choice)
- [x] MatchEndOverlay (winner, frame history, submit button)
- [x] API integration (persist breaks, complete frame/match)
- [x] Frame state resume on page refresh (replays saved breaks to restore scores, reds, high breaks)
- [ ] UmpireBoard mobile layout

### Shared Components (from Design System)
- [x] Button (variants: primary, ghost, outline, brass, danger, live; sizes: sm, md, lg)
- [x] Input (with label, error state)
- [x] Select (with label, error state)
- [x] Toggle
- [x] FileUpload (JPG, PNG, WebP support; fixed double-dialog bug)
- [x] StatusBadge (live, upcoming, completed, pending, approved, rejected, pro, amateur)
- [x] CountryFlagChip (PAK flag image, configurable size, optional label)
- [x] PlayerAvatar (sm/md/lg/xl sizes, photo or initials fallback, pro brass ring)
- [x] TournamentCard
- [x] StatCard (with progress bar and trend)
- [x] ProductCard
- [x] MatchResultHero (two-player hero with dog-ear HeroPortrait, frame scores, compact mode, dark/light variants)
- [x] MatchRow (flat, bye/walkover/live/scheduled/completed states, dog-ear player photos, gold winner-frame, Match Centre + social icons, fixed-width action area)
- [x] PlayerListItem (avatar, name, city, phone, country flag)
- [x] RankingsRow
- [x] Modal
- [x] PortraitCard (layered portrait with gold/dark radial gradient treatment for winner/loser, compact mode)
- [x] PlayerCard (WST-style: dog-ear border frame, photo above frame, Rokkitt slab-serif surname, gold hover)
- [x] RoundHeader (dark bar with round name; accepts `round` prop to auto-build rich metadata subtitle — player count, best-of, reds, elimination prize — WST style)
- [x] EmptyState (title, message, optional action)
- [x] Tabs
- [x] TopNav (sticky, responsive, notification bell, avatar+name for logged-in users)
- [x] MobileTabBar (4 tabs: Home, Draws, Ranks, Profile)

### API Modules (`src/api/`)
- [x] client.js (Axios instance, baseURL: /api)
- [x] auth.js (register, login, logout, me)
- [x] players.js (list, show, create, update, history, upcoming)
- [x] playerPhones.js (list, create, destroy)
- [x] tournaments.js (list, show, create, update, draw, players)
- [x] tournamentOrganizers.js (list, create, update, destroy)
- [x] entries.js (list, request, mine, approve, reject, adminAdd, seed)
- [x] draws.js (preview, generate, confirm, reroll)
- [x] matches.js (show, update, walkover, assignUmpire, complete, declareWinner)
- [x] frames.js, breaks.js
- [x] prizes.js, rounds.js
- [x] rankings.js (list)
- [x] pagination.js (shared constants)

### Public Routes
- [x] Home / landing (`/`)
- [x] Tournaments list (`/tournaments`)
- [x] Tournament detail (`/tournaments/:slug`) — tabs: Draw, Overview, Players, Prizes, Info
- [x] Player public profile (`/players/:id`) — felt header, stats, history, upcoming, H2H
- [x] Rankings (`/rankings`) — sortable table, tier filter, search, form pills
- [x] Store coming soon (`/store`)

### Auth Routes
- [x] Login (`/login`)
- [x] Register (`/register`)

### Player Routes
- [x] Player dashboard (`/dashboard`) — greeting hero, upcoming matches, recent results, seedings, entry requests
- [x] Edit profile (`/profile/edit`) — photo upload, phone management, success toast
- [x] Entry request states on tournament detail page (request/pending/approved/rejected/closed)

### Admin Routes
- [x] Admin dashboard (`/admin`) — stat cards (from /stats API), tournament list, pending entries, quick actions
- [x] Create/edit tournament (`/admin/tournaments/new`, `/admin/tournaments/:id/edit`)
- [x] Admin tournament detail (`/admin/tournaments/:id`) — tab navigation, winner/runner-up display card, round status badges (pending/draw ready/in progress/completed with match counts)
- [x] Manage entries (`/admin/tournaments/:id/entries`) — bulk add players, searchable, approve/reject
- [x] Manage players (`/admin/players`, `/admin/players/new`, `/admin/players/:id/edit`)
- [x] Generate draw (`/admin/tournaments/:id/draw`)
- [x] Draw reveal (`/admin/tournaments/:id/draw/reveal`)
- [x] Manage matches (`/admin/tournaments/:id/matches`) — Set Score modal, Declare Winner modal, walkover buttons, complete button, Scoreboard link for active matches, assign/reassign umpire with avatar display, unified MatchRow for all match states

### Umpire Routes
- [x] Umpire dashboard (`/umpire/dashboard`) — assigned matches split into Active/Completed, "Score Match" links
- [x] Umpire scoreboard (`/umpire/:matchId`) — live scoring, frame state resume on refresh
- [x] "Score Match" button on match detail page (for admin or assigned umpire)
- [x] TopNav "My Matches" link for umpire role

### Design System CSS (`index.css`)
- [x] Baize color tokens (felt, brass, live, ok, warn, bad, ink, canvas, surface, night, panel)
- [x] Typography tokens (font-display: Saira, font-sans: Hanken Grotesk, font-slab: Rokkitt)
- [x] Elevation tokens (shadow-e1 through e4)
- [x] Component classes: btn (primary, secondary, ghost, danger, brass, live, onfelt, outline), input, lbl, badge, card, seclabel, fg, player-card-frame (dog-ear border with gold hover, winner-frame, frame-on-dark variants)
- [x] Utility classes: ball, felt-grain, on-felt, text-caption
- [x] Animations: pulse, bump, activeglow, dropin

### Remaining
- [ ] Umpire board mobile layout
- [ ] Home page: featured live match banner
- [ ] Tournament form wizard: review step, success page, preview sidebar
- [x] Draw generation: mode selector UI, summary sidebar, RoundHeader with metadata
- [ ] Draw reveal: slot-machine style reveal animation (currently grid-based)
- [x] Match management: Set Score & Complete modal, Declare Winner modal (admin can enter scores or pick winners directly)
- [ ] Match management: per-frame scores, live scoring interface
- [ ] Store page: dark felt hero styling

### Known Issues (from `docs/issues/issues.md`)
- [x] ~~#1 Tournament status always shows "upcoming"~~
- [x] ~~#2 Player section match design same as admin~~ — unified MatchRow with dog-ear frames
- [x] ~~#3 Entry request visible when tournament entries are full~~
- [ ] #4 Umpire info not editable, needs photo column on users table
- [x] ~~#5 Umpire name in middle of match screen (shared component for player/admin)~~
- [ ] #6 Umpire section/dashboard and single umpire display
- [x] ~~#7 Match page player photos with back frame + winner highlighted~~ — dog-ear PlayerImage + winner-frame
- [x] ~~#8 Rankings board redesign~~
- [x] ~~#9 Configurable reds per round (10 or 15)~~
- [x] ~~#10 Prize allocation per round~~
- [x] ~~#11 Draw regeneration broken after first generation~~
- [x] ~~#12 Public views requiring login when they shouldn't~~
