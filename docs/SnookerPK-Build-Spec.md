# SnookerPK — Build Spec (v1)

**Stack:** Laravel 11 (API-only) · Sanctum auth · React + Vite + Tailwind (web) · React Native + NativeWind (mobile, later)
**Single backend, two frontends, one design token system (Baize).**

This document is the source of truth for building SnookerPK. Hand it to Claude Code section by section. Keep it open beside your editor.

---

## 0. v1 Scope (locked decisions)

| Decision | v1 |
|---|---|
| Web frontend | React + Vite + Tailwind |
| Mobile | React Native + NativeWind — **later phase** |
| Auth | Sanctum tokens (works for web + RN) |
| Roles | `admin`, `player`, `umpire` |
| Draw display | Flat per-round lists (like snooker.org) — **no tree** |
| Draw mode | Chosen **per round** at generation (fixed pairing OR random reveal) |
| Best-of | Stored on **round** (`frames_to_win`) |
| Scoring engine | **Rule-based** (ported from existing SSB Vue logic) |
| Scoring modes | Data model + engine support **singles/doubles/century**; only **singles** wired to tournaments in v1 |
| Umpire board | Private — **umpire/admin only** |
| Public visibility | Completed **frame** + **match** results only. **No live public scoreboard / no websockets in v1** (phase 2) |
| Frames/breaks | Full `frames` + `breaks` tables (derive scores & high breaks) |
| Rankings points | **Manual** entry per result for v1 (auto-formula later) |
| Seeding | Admin-assigned, override-capable |
| Live broadcast (sockets) | **Phase 2** |

---

## 1. Database Schema (migrations)

Notation: `→` = FK. All tables have `id`, `created_at`, `updated_at` unless noted. **All tables use `SoftDeletes` (`deleted_at`) — no hard deletes anywhere.**

### users
- `name` string
- `email` string unique
- `password` string
- `role` enum(`admin`,`player`,`umpire`) — or use spatie/laravel-permission (recommended)
- `email_verified_at` nullable
- Note: a `player` user links 1:1 to a `players` row. Admin/umpire may not have a player profile.

### players
- `user_id` → users (nullable — admin can create players without accounts)
- `name` string
- `country_code` char(3)            // 'PAK','ENG','CHN','IND'...
- `city` string nullable
- `tier` enum(`pro`,`amateur`) default `amateur`
- `photo_path` string nullable
- `phone` string nullable
- `address` text nullable
- `bio` text nullable
- `date_turned_pro` date nullable
- `ranking_points` integer default 0   // manual for v1
- `status` enum(`active`,`inactive`) default `active`

### tournaments
- `name` string
- `edition` string nullable             // '2026'
- `slug` string unique
- `type` string nullable                // 'Ranking', 'Open', 'Qualifier'
- `format` string default 'Knockout · single elimination'
- `venue` string nullable
- `city` string nullable
- `country_code` char(3) nullable
- `start_date` date
- `end_date` date
- `start_time` time nullable
- `cover_path` string nullable
- `description` text nullable
- `qualifier_info` text nullable
- `organizer` string nullable           // 'Cue Masters Pakistan'
- `presented_by` string nullable         // 'Sui Southern Sports'
- `prize_pool` decimal(12,2) nullable
- `status` enum(`upcoming`,`live`,`completed`) default `upcoming`
- `entry_status` enum(`open`,`closed`) default `open`
- `max_players` integer nullable         // null = open/unlimited
- `draw_size` integer nullable

### prizes
- `tournament_id` → tournaments (cascade)
- `position_label` string                // 'Winner','Runner-up','Semi-finalists','Highest break'
- `amount` decimal(12,2)
- `count` integer default 1              // '× 2' / '× 4'
- `note` string nullable                 // 'bonus'
- `sort_order` integer default 0
- `is_highlight` boolean default false

### contacts
- `tournament_id` → tournaments (cascade)
- `name` string
- `role` string nullable                 // 'Tournament Director'
- `phone` string nullable
- `email` string nullable
- `sort_order` integer default 0

### tournament_entries
- `tournament_id` → tournaments (cascade)
- `player_id` → players (cascade)
- `status` enum(`pending`,`approved`,`rejected`) default `pending`
- `source` enum(`self_request`,`admin_added`) default `self_request`   // admin_added auto-approves
- `seed` integer nullable
- `requested_at` timestamp nullable
- `decided_at` timestamp nullable
- `decided_by` → users nullable
- UNIQUE(`tournament_id`,`player_id`)

### rounds
- `tournament_id` → tournaments (cascade)
- `name` string                          // 'Round 1','Quarter-finals','Final'
- `sub_label` string nullable            // 'Last 16','Last 8','Championship'
- `sort_order` integer                   // 1 = first round played
- `frames_to_win` integer                // 4 = best of 7
- `draw_mode` enum(`fixed`,`random`) nullable   // chosen at generation
- `generated_at` timestamp nullable

### matches
- `tournament_id` → tournaments (cascade)
- `round_id` → rounds (cascade)
- `position` integer                     // order within round (the '1,2,3' down the side)
- `player1_id` → players nullable        // null = TBD
- `player2_id` → players nullable
- `score1` integer default 0             // frames won by p1
- `score2` integer default 0
- `winner_id` → players nullable
- `status` enum(`scheduled`,`live`,`completed`,`bye`,`walkover`) default `scheduled`
- `mode` enum(`singles`,`doubles`,`century`) default `singles`   // v1: always singles
- `umpire_id` → users nullable           // assigned scorer
- `table_no` string nullable             // 'Table 1','Show Table'
- `scheduled_at` datetime nullable
- `video_url` string nullable
- `current_frame_no` integer default 1   // umpire's live position
- `note` text nullable

### frames
One row per frame within a match.
- `match_id` → matches (cascade)
- `frame_no` integer                     // 1,2,3...
- `score1` integer default 0             // points (not frames) — e.g. 66
- `score2` integer default 0             // e.g. 7
- `winner_id` → players nullable
- `high_break_value` integer nullable    // best break in this frame (the '(91)')
- `high_break_player_id` → players nullable
- `status` enum(`in_progress`,`completed`) default `in_progress`
- `breaker_id` → players nullable        // who broke off (alternates)
- UNIQUE(`match_id`,`frame_no`)

### breaks
One row per visit/turn. The umpire writes these; frame.score & high_break are derived.
- `frame_id` → frames (cascade)
- `player_id` → players
- `points` integer default 0             // sum of balls this visit
- `balls` json                           // [{"color":"red","points":1},{"color":"black","points":7}...]
- `fouls` integer default 0
- `foul_points` integer default 0        // points conceded to opponent on foul
- `duration_seconds` integer nullable
- `sort_order` integer                   // visit order in the frame
- `is_foul_turn` boolean default false

### seedings  (optional — seed also lives on entry; use this only if you want seeding history)
- `tournament_id` → tournaments
- `player_id` → players
- `seed_number` integer
> For v1 you can skip this table and use `tournament_entries.seed`. Included for completeness.

---

## 2. API Endpoints

Base: `/api`. Auth: Sanctum bearer token. Roles enforced via middleware.
`[P]`=public · `[A]`=auth · `[ADMIN]` · `[UMP]`=umpire/admin · `[OWN]`=owning player.

### Auth
- `POST /auth/register`            [P]  player self-signup
- `POST /auth/login`               [P]  → token
- `POST /auth/logout`              [A]
- `GET  /auth/me`                  [A]  current user + role + player profile

### Players
- `GET  /players`                  [P]  list/search (q, tier, country)
- `GET  /players/{id}`             [P]  public profile + history + upcoming
- `PUT  /players/{id}`             [OWN/ADMIN] edit profile (photo, phone, address, bio)
- `POST /players`                  [ADMIN] create player (no account)
- `GET  /players/{id}/history`     [P]  past tournament results
- `GET  /players/{id}/upcoming`    [P]

### Tournaments
- `GET  /tournaments`              [P]  filter status=upcoming|live|past, search
- `GET  /tournaments/{slug}`       [P]  full detail (overview/info)
- `GET  /tournaments/{id}/draw`    [P]  rounds + matches (FLAT, grouped by round) — completed/result data only
- `GET  /tournaments/{id}/players` [P]  entrants (approved) w/ seeds
- `GET  /tournaments/{id}/prizes`  [P]
- `POST /tournaments`              [ADMIN] create (basics)
- `PUT  /tournaments/{id}`         [ADMIN] update
- `DELETE /tournaments/{id}`       [ADMIN]
- `PUT  /tournaments/{id}/entry-status`  [ADMIN] open/close entry
- `PUT  /tournaments/{id}/max-players`   [ADMIN]

### Prizes / Contacts / Rounds config (admin tournament builder)
- `POST/PUT/DELETE /tournaments/{id}/prizes`     [ADMIN]
- `POST/PUT/DELETE /tournaments/{id}/contacts`   [ADMIN]
- `GET  /tournaments/{id}/rounds`                [P]
- `POST/PUT/DELETE /tournaments/{id}/rounds`     [ADMIN]  (name, sub_label, frames_to_win, sort_order)

### Entries (request + approval flow)
- `POST /tournaments/{id}/entries`           [A] player requests entry → pending
- `GET  /tournaments/{id}/entries`           [ADMIN] all requests + counts (group by status)
- `GET  /tournaments/{id}/entries/summary`   [ADMIN] {total,pending,approved,rejected,capacity}
- `PUT  /entries/{id}/approve`               [ADMIN] (blocked if approved==max_players)
- `PUT  /entries/{id}/reject`                [ADMIN]
- `POST /tournaments/{id}/entries/admin-add` [ADMIN] add player, auto-approved
- `PUT  /entries/{id}/seed`                  [ADMIN] set/override seed
- `GET  /me/entries`                         [A] my entry requests + statuses

### Draw generation
- `POST /tournaments/{id}/rounds/{roundId}/preview-draw`  [ADMIN]
  body: `{mode:'fixed'|'random', bye_assignment:'top_seeds'|'random'}`
  → returns `{pool_size, match_count, bye_count, byes:[...]}`  (no DB write)
- `POST /tournaments/{id}/rounds/{roundId}/generate-draw` [ADMIN]
  body: `{mode, bye_assignment}`  → creates matches for the round
  - Round 1 pool = approved entries. Round N pool = winners of round N-1.
  - `fixed` = create all pairings now. `random` = create as drafts revealed one-by-one.
- `POST /matches/{id}/confirm`               [ADMIN] (random reveal: commit a drafted pairing)
- `POST /matches/{id}/reroll`                [ADMIN] (random reveal: re-draw this pairing)

### Matches & scoring
- `GET  /matches/{id}`                        [P] match summary (completed results visible to all)
- `PUT  /matches/{id}`                         [ADMIN] schedule, table_no, scheduled_at, video_url
- `PUT  /matches/{id}/assign-umpire`           [ADMIN] set umpire_id
- `PUT  /matches/{id}/walkover`                [ADMIN] set walkover winner
- `GET  /matches/{id}/board`                   [UMP] umpire board state (frames, current break) — PRIVATE
- `POST /matches/{id}/frames`                  [UMP] start a frame (set breaker)
- `POST /frames/{id}/breaks`                   [UMP] persist a completed visit/turn:
       `{player_id, points, balls:[], fouls, foul_points, duration_seconds}`
- `PUT  /frames/{id}/complete`                 [UMP] close frame → set winner, high break; bump match score
- `PUT  /matches/{id}/complete`                [UMP/ADMIN] finalize match → winner, advance pool
- Note: each break POST is the "turn ended" persistence. Public live view = phase 2.

### Rankings
- `GET  /rankings`                             [P] sortable (points, played, form)
- `PUT  /players/{id}/ranking-points`          [ADMIN] manual adjust (v1)

### Store (stub for v1)
- `GET  /products`                             [P] returns coming-soon / empty

---

## 3. Scoring Engine — Port Notes (SSB → React)

Your existing SSB Vue logic is correct and rule-aware. Port it to a **framework-agnostic module** (`snookerEngine.js`) consumed by a React `<UmpireBoard>` component. Logic stays identical; only state plumbing changes (Vue `data`/`methods` → React `useReducer`).

### Engine state (per frame)
```
{
  mode: 'singles',                 // v1
  players: [{id,name,score}],      // FRAME points
  currentPlayerIndex: 0,
  balls: {red:15, yellow:1, green:1, brown:1, blue:1, pink:1, black:1},
  expectedBall: 'red',             // 'red' | 'color'
  currentBreak: {points:0, balls:[], fouls:0},
  foulState: {active:false, foulingPlayerIndex:-1, foulPoints:0},
  history: []                      // for undo
}
```

### Core actions (map 1:1 from SSB methods)
- `canPotBall(color)` — enforces reds-then-colours sequence + colours-clearing phase
- `potBall(color)` — add points, push to break, decrement balls, flip expectedBall
- `commitFoul(points)` — singles: +points to opponent, raise foulState dialog
- `handleFoulDecision(giveBackTurn)` — fouler continues OR turn passes
- `endTurn()` — save break, switch player, reset break, recompute expectedBall
- `isColorsClearingPhase` = (balls.red === 0)
- `saveHistory()` / `undo()` — keep for umpire mistake correction (important live!)

### Derived (computed, don't store)
- frame score = sum of each player's break points + foul points received
- frame high break = max(break.points) per player
- `isGameOver` = colours cleared / max reached

### Persistence boundary (NEW vs SSB)
- On every `endTurn()` → `POST /frames/{id}/breaks` (the visit just completed).
- On frame end → `PUT /frames/{id}/complete` (winner, high break) → server bumps match `score1/score2`.
- On match end → `PUT /matches/{id}/complete` → server advances the pool / sets winner.
- Keep an **optimistic local state**; API confirms. Add a **manual "undo last turn"** that also deletes the last break server-side.

### Doubles/Century (v1: build, disable)
- Keep `mode` + the doubles rotation `[0,2,1,3]` and century settings in the engine, gated behind a feature flag. Not wired to tournament matches in v1.

---

## 4. Pairing / Bye Algorithm (pseudocode)

Build as a pure, **unit-tested** Laravel service `DrawGenerator` BEFORE wiring to controllers. This is the highest-risk logic.

```
function generateRound(pool, mode, byeAssignment):
    # pool = array of player_ids (round 1 = approved entries; round N = winners of N-1)
    n = count(pool)
    if n <= 1: return []                      # tournament effectively over

    # 1. seed/order the pool
    if byeAssignment == 'top_seeds':
        pool = sortBySeedAsc(pool)            # seed 1 first
    else:
        pool = shuffle(pool)                  # random byes

    # 2. compute byes to reach a clean pairing
    target = nextPowerOfTwo(n)                # 50 -> 64
    byeCount = target - n                     # 14
    # NOTE: byes only meaningful in ROUND 1 to normalize the field.
    # In later rounds n is already the winners count; if odd, 1 bye.

    byes = []
    if byeCount > 0:
        if byeAssignment == 'top_seeds':
            byes = take(pool, byeCount)       # top seeds get byes
            pool = drop(pool, byeCount)
        else:
            byes = takeRandom(pool, byeCount)
            pool = remaining(pool)

    # 3. pair the rest
    matches = []
    pos = 1
    # bye players advance automatically (status='bye', player1 advances)
    for p in byes:
        matches.push({pos: pos++, player1: p, player2: null, status:'bye', winner: p})

    if mode == 'fixed':
        # pair sequentially: (0,1),(2,3)...
        for i in range(0, count(pool), step=2):
            matches.push({pos: pos++, player1: pool[i], player2: pool[i+1], status:'scheduled'})

    if mode == 'random':
        # create as DRAFTS; umpire/admin reveals one-by-one via /confirm
        shuffled = shuffle(pool)
        for i in range(0, count(shuffled), step=2):
            matches.push({pos: pos++, player1: shuffled[i], player2: shuffled[i+1],
                          status:'scheduled', confirm_status:'draft'})

    return matches

function nextPowerOfTwo(n):
    p = 1; while p < n: p *= 2; return p
```

**Test cases to write first:** 64 (clean), 50 (14 byes), 7 (1 bye, odd), 2 (final), 1 (done), 32 winners→16 matches, walkover present. Verify bye players never paired against each other; verify match `position` is sequential.

**Walkover:** admin marks a scheduled match `walkover` + winner; server treats it like a completed match for pool purposes.

---

## 5. React App — Routes & Component Map

One Vite project. `tailwind.config.js` = the Baize tokens (already in your Design System HTML). Build shared components first, then routes.

### Shared components (from Design-System / Tailwind-Base HTML)
`Button` · `Input` · `Select` · `Toggle` · `FileUpload` · `StatusBadge` · `CountryFlagChip` · `PlayerAvatar` · `TournamentCard` · `StatCard` · `MatchRow` (flat, expandable frames, bye/wo variants) · `RankingsRow` · `ProductCard` · `Modal` · `EmptyState` · `Tabs` · `TopNav` · `MobileTabBar`

### Routes

**Public** (no auth)
| Route | Screen | Source HTML |
|---|---|---|
| `/` | Home/landing | Public Screens |
| `/tournaments` | Tournaments list | Public Screens |
| `/tournaments/:slug` | Tournament detail (tabs incl. flat Draw) | Tournament Detail |
| `/players/:id` | Player public profile | Profile/Rankings/Store |
| `/rankings` | Rankings | Profile/Rankings/Store |
| `/store` | Store (coming soon) | Profile/Rankings/Store |

**Player** (auth, role=player)
| Route | Screen | Source HTML |
|---|---|---|
| `/dashboard` | Player dashboard (matches, seedings, my entries) | Player Area |
| `/profile/edit` | Edit profile | Player Area |
| (entry states render on `/tournaments/:slug`) | Request/Pending/Approved/Closed | Player Area |

**Admin** (auth, role=admin)
| Route | Screen | Source HTML |
|---|---|---|
| `/admin` | Admin dashboard | Admin |
| `/admin/tournaments/new` | Create/edit tournament (multi-step) | Admin |
| `/admin/tournaments/:id/entries` | Manage entries + capacity | Admin Entries/Players |
| `/admin/players` | Manage players | Admin Entries/Players |
| `/admin/tournaments/:id/draw` | Generate draw (per-round mode) | Admin Draw |
| `/admin/tournaments/:id/draw/reveal` | Live draw reveal (random, spin) | Admin Draw |
| `/admin/tournaments/:id/matches` | Manage matches / schedule / assign umpire | Admin Matches |

**Umpire** (auth, role=umpire OR admin) — PRIVATE
| Route | Screen | Status |
|---|---|---|
| `/umpire/matches/:id/board` | **Umpire scoreboard** (ball entry, foul, end turn) | **Designed** — `SnookerPK Umpire Scoreboard.html` + `umpire.js` (tablet) + `umpire-mobile.js` (phone) |

> Public never sees the umpire board. Public match/frame results come from `GET /matches/{id}` once `status=completed`.

---

## 6. Screen → API → DB Cross-Reference

| Screen | Primary endpoints | Tables touched |
|---|---|---|
| Tournaments list | `GET /tournaments` | tournaments |
| Tournament detail / Draw | `GET /tournaments/{slug}`, `/draw`, `/players`, `/prizes` | tournaments, rounds, matches, frames, prizes, entries, players |
| Player profile | `GET /players/{id}` (+history,upcoming) | players, matches, tournaments |
| Rankings | `GET /rankings` | players |
| Player dashboard | `GET /me/entries`, my matches, seedings | entries, matches, tournaments |
| Edit profile | `PUT /players/{id}` | players |
| Entry flow | `POST /tournaments/{id}/entries`, `GET /me/entries` | entries |
| Admin create tournament | `POST /tournaments` + prizes/contacts/rounds | tournaments, prizes, contacts, rounds |
| Manage entries | `GET .../entries(/summary)`, approve/reject/admin-add/seed | entries, players |
| Manage players | `GET/POST/PUT /players` | players |
| Generate draw | preview-draw, generate-draw | rounds, matches |
| Live draw reveal | generate-draw(random), confirm, reroll | matches |
| Manage matches | `PUT /matches/{id}`, assign-umpire, walkover | matches |
| Umpire board | `GET /matches/{id}/board`, frames, breaks, complete | matches, frames, breaks |

---

## 7. Build Order (phased, Claude-Code friendly)

**Phase 1 — Backend foundation**
1. Laravel API skeleton, Sanctum, spatie roles (admin/player/umpire)
2. Migrations (all tables above) + models + relationships + factories/seeders
3. `DrawGenerator` service + **unit tests** (test cases in §4)

**Phase 2 — Core API**
4. Auth endpoints
5. Tournaments + prizes + contacts + rounds CRUD
6. Players CRUD + profiles
7. Entries (request/approve/reject/admin-add/seed + capacity rules)
8. Draw generation endpoints (preview/generate/confirm/reroll)
9. Matches (schedule/assign-umpire/walkover) + frames/breaks + complete

**Phase 3 — React web**
10. Vite + Tailwind config (Baize tokens) + API/Axios + auth context + role guards
11. Shared component library (§5)
12. Public routes
13. Player routes
14. Admin routes (create → entries → draw → reveal → matches)
15. **Umpire board** (port SSB engine → `snookerEngine.js` → `<UmpireBoard>`; design new screen first)

**Phase 4 — Rankings, store stub, polish**
16. Rankings (manual points) + store coming-soon
17. Empty states, validation, error handling

**Phase 5 (later)**
- React Native (NativeWind) — public + player + umpire-on-tablet subset
- Live public scoreboard + Laravel Reverb websockets
- Auto ranking-points formula; doubles/century enablement

---

## 8. Settled decisions & remaining notes

**Settled:**
- **Photo storage = local disk** (v1), via Laravel filesystem (`local`/`public` disk) so it's swappable to S3 later with no code change.
- **No hard deletes anywhere.** Use `SoftDeletes` (deleted_at) on: tournaments, players, tournament_entries, matches, rounds, prizes, contacts, frames, breaks. Use `status` flags for lifecycle (entry_status, match status, player status). Nothing is ever physically removed.

**Remaining notes:**
- Country flags: design uses abstract colour-bands; swap to a flag-SVG library at chip size when convenient.
- Frame breaker alternation: server can auto-alternate `breaker_id`; umpire can override.
- **Engine field-name mapping** (design → DB) when porting `umpire.js` → `snookerEngine.js`: `pts`→`points`, `hi`/`frameHi`→`high_break_value`, `bo`→ derived from round `frames_to_win`, `ftw()`→`frames_to_win`, `history[]`→`frames` rows, `currentBreak.balls`→`breaks.balls` (JSON). Logic is identical; only names change.

---

## 9. Changelog

### 4th June 2026

**Backend additions:**

- **Tournament Organizers** — New `tournament_organizers` table and full CRUD. Organizers can be any user (player, umpire, admin). Fields: `user_id`, `tournament_id`, `role` (e.g. "Tournament Director"), `sort_order`. Exposed via `TournamentOrganizerResource` which includes nested `user.player` for name/photo. Replaces the flat `organizer` string field on tournaments for structured organizer data.
- **Tournament Banner** — Added `banner_path` field to tournaments table. Admin can upload a banner image displayed in the tournament detail header.
- **Player Phones** — Separate `player_phones` table instead of a single `phone` column on players. Supports 1 primary + up to 3 secondary numbers, with `is_whatsapp` flag on primary. Full CRUD via `PlayerPhoneController`.
- **Player Computed Stats** — `PlayerService::show()` now computes `matches_played`, `wins`, `win_rate` from completed match data. `PlayerResource` conditionally includes these fields (only on show, not on list).
- **Entries per_page** — `ListEntriesRequest` max `per_page` bumped from 100 to 200 to support loading all entries on the admin manage entries page without pagination bugs.
- **Test Data Seeder** — `TestMatchDataSeeder` creates realistic completed matches with proper scores, winners, and scheduled dates. Includes 16 completed matches in tournament 2 (full bracket run), 8 completed + 1 live match in tournament 1.
- **Storage Symlink** — `php artisan storage:link` required for serving uploaded photos (player photos, tournament banners).

**Frontend — full build (Phase 3 complete):**

- **API client + Auth** — Axios client with 15 API modules, AuthContext with login/logout/register/me/hasRole, route guards (ProtectedRoute, RoleRoute, GuestRoute).
- **Layouts** — PublicLayout (TopNav + MobileTabBar), AdminLayout (sidebar on desktop, fixed header on mobile).
- **19 shared UI components** — Button, Input, Select, Toggle, FileUpload, StatusBadge, CountryFlagChip, PlayerAvatar (sm/md/lg/xl with pro brass ring), TournamentCard, StatCard, ProductCard, MatchRow, PlayerListItem, RankingsRow, Modal, EmptyState, Tabs, TopNav (with notification bell icon for logged-in users), MobileTabBar.
- **6 public pages** — Home, Tournaments list, Tournament detail (5 tabs: Draw, Overview, Players, Prizes, Info), Player profile (felt header, stats, match history, upcoming events, H2H section), Rankings (sortable table with form pills, tier filter, search), Store (coming soon).
- **2 player pages** — Dashboard (greeting hero with avatar/badges, upcoming matches, recent results with W/L badges, current seedings, entry requests with status chips), Edit profile (photo upload, phone management with primary/secondary/WhatsApp, success toast).
- **8 admin pages** — Dashboard (stat cards, tournament list with action buttons, pending entry queue with approve/reject), Tournament form (create/edit), Manage entries (bulk add players with search, approve/reject), Manage players (list/create/edit), Player form, Draw generation, Draw reveal, Manage matches.
- **Auth pages** — Login, Register.
- **Design system CSS** — Full Baize design tokens in `index.css`. Component classes: btn (primary, secondary, ghost, danger, brass, live, onfelt, outline), input, badge, card, seclabel, fg. Utilities: ball, felt-grain, on-felt, text-caption. Animations: pulse, bump, activeglow, dropin.
- **Pakistan flag** — PAK.png added to `public/flags/` for CountryFlagChip component.
- **Vite proxy** — Added `/storage` proxy alongside `/api` so dev server serves uploaded photos from Laravel backend.
