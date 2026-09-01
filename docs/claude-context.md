# Claude Context — SnookerPK Project

Last updated: 2026-09-01

## Project Overview

**Stack:** Laravel 13 API-only backend · Sanctum auth · React + Vite + Tailwind (web) · React Native + NativeWind (mobile, later)

**Repo:** `/Users/haiderali/projects/snooker-pk`
- `backend/` — Laravel 13 API
- `frontend/` — React + Vite + Tailwind
- `design/snookerpk-designs/` — Design HTML prototypes + JS renderers
- `docs/` — Spec + progress files

---

## Backend — COMPLETE

All API phases implemented and tested. 61 routes, 198 tests (514 assertions, all passing).

### Architecture

```
Request → FormRequest (validate) → Controller (thin) → Service (logic) → Resource (transform) → Response
```

### Key Files

| Layer | Location | Count |
|---|---|---|
| Routes | `backend/routes/api.php` | 61 endpoints |
| Controllers | `backend/app/Http/Controllers/Api/` | 14 (Auth, Player, PlayerPhone, Tournament, TournamentOrganizer, Prize, PrizeAward, Round, Entry, Draw, Match, Frame, Break, Ranking) |
| Services | `backend/app/Services/` | 12 (Auth, Player, PlayerPhone, Tournament, TournamentOrganizer, Prize, PrizeAward, Round, Entry, Draw, Match, Ranking) |
| FormRequests | `backend/app/Http/Requests/` | 37 |
| Resources | `backend/app/Http/Resources/` | 14 (User, Player, PlayerPhone, Tournament, TournamentDetail, TournamentOrganizer, Prize, PrizeAward, Round, TournamentEntry, Match, Frame, Break, Ranking) |
| Tests | `backend/tests/Feature/Api/` | 15 test files, 198 tests, 514 assertions |
| Models | `backend/app/Models/` | 12 (User, Player, PlayerPhone, Tournament, TournamentOrganizer, Prize, PrizeAward, TournamentEntry, Round, Match_, Frame, Break_) |
| Seeders | `backend/database/seeders/` | DatabaseSeeder (roles + 32 players), TestMatchDataSeeder (completed matches + scores) |

### Modified foundation files

- `backend/bootstrap/app.php` — API routes, Sanctum stateful middleware, Spatie role/permission aliases
- `backend/app/Providers/AppServiceProvider.php` — Route model bindings for Match_ and Break_

### Database

- **Roles:** admin, player, umpire (Spatie)
- **Auth:** Sanctum tokens
- **All tables use SoftDeletes**
- **Reserved-word models:** `Match_` (table: matches), `Break_` (table: breaks)
- **Player phones:** Separate `player_phones` table (1 primary + 3 secondary, WhatsApp flag)
- **Tournament organizers:** `tournament_organizers` table (user_id, tournament_id, role, sort_order)
- **Tournament banners:** `banner_path` field on tournaments
- **Storage:** Local disk, symlinked via `php artisan storage:link`

### Route groups

- **Public (9):** register, login, players list/show, tournaments list/show/draw/players, rankings, match show
- **Auth (6):** logout, me, player update/history/upcoming, entry request/mine, player phones
- **Umpire|Admin (5):** match board, frames CRUD, breaks CRUD
- **Admin (41+):** full tournament/prize/round CRUD, organizer CRUD, entry management, draw generation, match management, ranking adjust, qualifier round pool + pairing + entry-round assignment

### Key business logic

- **Score cascade** (MatchService): breaks → frame scores (auto-recalculated) → match scores → winner advancement
- **Draw generation** (DrawService): seeded bracket placement, bye calculation, DB transaction, bye winner advancement
- **Entry flow** (EntryService): `max_players` capacity applies only to main-draw entries (`entry_round_id` null), duplicate checks, open/closed status, admin-add auto-approves
- **Qualifier rounds** (DrawService): rounds *within* a tournament — `has_qualifiers` on the tournament, `is_qualifier` on the round, `entry_round_id` on the entry (null = direct main-draw entrant). Pool for a qualifier round = assigned entries + previous qualifier round's winners − already-paired players. Winners of the **last** qualifier round join the direct entrants when the first main-draw round is generated. Qualifier wins award the elimination prize but do not advance into the bracket.

  > Superseded: the earlier cross-tournament design (`parent_tournament_id`, `transferQualifiedPlayers`) was replaced on 2026-07-11 and no longer exists in code. `parent_tournament_id` survives as an orphaned column; `qualifying_slots` is descriptive only.
- **Player stats** (PlayerService.show): computes matches_played, wins, win_rate from completed match data

### Remaining backend items

- [ ] Factories for all models
- [ ] Store coming-soon stub endpoint (`GET /products`)
- [ ] Drop orphaned `parent_tournament_id` column + unused `qualifier_transfer` source value
- [ ] `ensureRoundsExist()` counts qualifier-assigned entries, so it can over-create main-draw rounds

---

## Frontend — FULLY BUILT (polish remaining)

All routes, components, and pages are implemented. Design system aligned to Baize design prototypes.

### Architecture

```
App.jsx → Router (PublicLayout / AdminLayout) → Pages → API modules → Backend
AuthContext provides auth state, login/logout/register, role checks
```

### Key Directories

| Directory | Contents |
|---|---|
| `src/api/` | 15 API modules (Axios client + auth, players, tournaments, entries, draws, matches, etc.) |
| `src/components/ui/` | 22 shared components (Button, Input, Select, PlayerAvatar, StatusBadge, PortraitCard, MatchResultHero, MatchRow, RoundHeader, TopNav, MobileTabBar, etc.) |
| `src/context/` | AuthContext (login, logout, register, me, hasRole) |
| `src/layouts/` | PublicLayout (TopNav + MobileTabBar), AdminLayout (sidebar) |
| `src/pages/public/` | 6 pages (Home, Tournaments, TournamentDetail, PlayerProfile, Rankings, Store) |
| `src/pages/player/` | 2 pages (Dashboard, EditProfile) |
| `src/pages/admin/` | 8 pages (Dashboard, TournamentForm, ManageEntries, ManagePlayers, PlayerForm, DrawGenerate, DrawReveal, ManageMatches) |
| `src/pages/auth/` | 2 pages (Login, Register) |
| `src/pages/umpire/` | 1 page (UmpireBoard) |
| `src/engine/` | snookerEngine.js + useSnookerEngine hook |

### Design System (index.css)

Baize design tokens: felt greens, brass gold, live reds, ink neutrals, night/panel darks. Component classes: btn (8 variants), input, badge, card, seclabel, fg. Animations: pulse, bump, activeglow, dropin.

### Recent additions

- **Qualifier rounds:** "Has qualifiers?" toggle in the tournament form, qualifier rounds card with inline create on the admin tournament page, round filter tabs + per-entry round assignment on manage entries, per-round pairing UI (pool dropdowns, auto-generate, delete) on manage matches, pool-aware draw generate page, "Has Qualifiers" badges across list/card/detail

### Remaining frontend items

- [ ] Home page: featured live match banner
- [ ] Tournament form: review step, success page, preview sidebar
- [ ] Draw reveal: slot-machine style reveal animation
- [ ] Match management: per-frame scores, live scoring interface
- [ ] Store page: dark felt hero styling

### Open issues (from `docs/issues/issues.md`)

- [ ] #4 Umpire info not editable, needs photo column on users table
- [ ] #6 Umpire section/dashboard and single umpire display

---

## Spec & Progress Files

- `docs/SnookerPK-Build-Spec.md` — Master spec (schema, endpoints, engine notes, pairing algorithm, routes, build order) + changelog
- `docs/backend-progress.md` — Backend phase tracking (all complete)
- `docs/frontend-progress.md` — Frontend phase tracking
- `docs/mobile-progress.md` — Mobile (Phase 5, not started)

---

## How to resume

```bash
cd /Users/haiderali/projects/snooker-pk/backend
php artisan test          # should show 198 passing
php artisan serve         # runs on :8000

cd /Users/haiderali/projects/snooker-pk/frontend
npm run dev               # runs on :3000 (proxies /api + /storage to :8000)
npm run build             # 186 modules, ~635 KB JS + ~68 KB CSS
```

Next work: Umpire issues (#4 info/photo, #6 dashboard), frontend lint errors (29, incl. ref-during-render bugs in UmpireBoardPage), then polish (home page live match banner, tournament form wizard, draw reveal animation, store hero).
