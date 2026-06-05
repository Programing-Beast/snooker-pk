# Frontend Progress (React + Vite + Tailwind)

## Phase 3 — React Web

### Setup
- [x] Vite + React + Tailwind project scaffold
- [x] Baize design tokens in CSS (@theme)
- [x] Google Fonts (Saira + Hanken Grotesk)
- [x] Vite proxy to Laravel API (`/api` + `/storage`)
- [x] Axios API client (`src/api/client.js` + 15 API modules)
- [x] AuthContext (login, logout, register, me, role checks)
- [x] Routing — react-router with ProtectedRoute, RoleRoute, GuestRoute (`router.jsx` + `App.jsx`)
- [x] Layouts — PublicLayout (TopNav + MobileTabBar), AdminLayout (sidebar + mobile header)

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
- [ ] UmpireBoard mobile layout
- [ ] API integration (persist breaks, complete frame/match)

### Shared Components (from Design System)
- [x] Button (variants: primary, ghost, outline, brass, danger, live; sizes: sm, md, lg)
- [x] Input (with label, error state)
- [x] Select (with label, error state)
- [x] Toggle
- [x] FileUpload
- [x] StatusBadge (live, upcoming, completed, pending, approved, rejected, pro, amateur)
- [x] CountryFlagChip (PAK flag image, configurable size, optional label)
- [x] PlayerAvatar (sm/md/lg/xl sizes, photo or initials fallback, pro brass ring)
- [x] TournamentCard
- [x] StatCard (with progress bar and trend)
- [x] ProductCard
- [x] MatchResultHero (two-player hero with PortraitCard gold/dark portraits, frame scores)
- [x] MatchRow (flat, bye/walkover/live/scheduled states, frame scores)
- [x] PlayerListItem (avatar, name, city, phone, country flag)
- [x] RankingsRow
- [x] Modal
- [x] PortraitCard (layered portrait with gold/dark radial gradient treatment for winner/loser)
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
- [x] Admin dashboard (`/admin`) — stat cards, tournament list, pending entries, quick actions
- [x] Create/edit tournament (`/admin/tournaments/new`, `/admin/tournaments/:id/edit`)
- [x] Admin tournament detail (`/admin/tournaments/:id`) — tab navigation, winner/runner-up display card, round status badges (pending/draw ready/in progress/completed with match counts)
- [x] Manage entries (`/admin/tournaments/:id/entries`) — bulk add players, searchable, approve/reject
- [x] Manage players (`/admin/players`, `/admin/players/new`, `/admin/players/:id/edit`)
- [x] Generate draw (`/admin/tournaments/:id/draw`)
- [x] Draw reveal (`/admin/tournaments/:id/draw/reveal`)
- [x] Manage matches (`/admin/tournaments/:id/matches`) — Set Score modal (enter frame scores + auto-complete), Declare Winner modal (pick winner + optional scores), walkover buttons, complete button

### Design System CSS (`index.css`)
- [x] Baize color tokens (felt, brass, live, ok, warn, bad, ink, canvas, surface, night, panel)
- [x] Typography tokens (font-display: Saira, font-sans: Hanken Grotesk)
- [x] Elevation tokens (shadow-e1 through e4)
- [x] Component classes: btn (primary, secondary, ghost, danger, brass, live, onfelt, outline), input, lbl, badge, card, seclabel, fg
- [x] Utility classes: ball, felt-grain, on-felt, text-caption
- [x] Animations: pulse, bump, activeglow, dropin

### Remaining
- [ ] Umpire board mobile layout
- [ ] Umpire board API integration (persist breaks, complete frame/match)
- [ ] Home page: featured live match banner
- [ ] Tournament form wizard: review step, success page, preview sidebar
- [ ] Draw generation: mode selector UI, summary sidebar
- [ ] Draw reveal: slot-machine style reveal animation (currently grid-based)
- [x] Match management: Set Score & Complete modal, Declare Winner modal (admin can enter scores or pick winners directly)
- [ ] Match management: per-frame scores, live scoring interface
- [ ] Store page: dark felt hero styling
