# Claude Context — SnookerPK Project

Last updated: 2026-06-04

## Project Overview

**Stack:** Laravel 13 API-only backend · Sanctum auth · React + Vite + Tailwind (web) · React Native + NativeWind (mobile, later)

**Repo:** `/Users/haiderali/projects/snooker-pk`
- `backend/` — Laravel 13 API
- `frontend/` — React + Vite + Tailwind
- `design/snookerpk-designs/` — Design HTML prototypes + JS renderers
- `docs/` — Spec + progress files

---

## Backend — COMPLETE

All 9 API phases implemented and tested. 58+ routes, 136 tests (all passing).

### Architecture

```
Request → FormRequest (validate) → Controller (thin) → Service (logic) → Resource (transform) → Response
```

### Key Files

| Layer | Location | Count |
|---|---|---|
| Routes | `backend/routes/api.php` | 58+ endpoints |
| Controllers | `backend/app/Http/Controllers/Api/` | 14 (Auth, Player, PlayerPhone, Tournament, TournamentOrganizer, Prize, Contact, Round, Entry, Draw, Match, Frame, Break, Ranking) |
| Services | `backend/app/Services/` | 11 (Auth, Player, PlayerPhone, Tournament, TournamentOrganizer, Prize, Round, Entry, Draw, Match, Ranking) |
| FormRequests | `backend/app/Http/Requests/` | 31 |
| Resources | `backend/app/Http/Resources/` | 14 (User, Player, PlayerPhone, Tournament, TournamentDetail, TournamentOrganizer, Prize, Contact, Round, TournamentEntry, Match, Frame, Break, Ranking) |
| Tests | `backend/tests/Feature/Api/` | 12 test files, 136 tests, 339 assertions |
| Models | `backend/app/Models/` | 11 (User, Player, PlayerPhone, Tournament, TournamentOrganizer, Prize, TournamentEntry, Round, Match_, Frame, Break_) |
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

- **Public (8):** register, login, players list/show, tournaments list/show/draw/players, rankings, match show
- **Auth (6):** logout, me, player update/history/upcoming, entry request/mine, player phones
- **Umpire|Admin (5):** match board, frames CRUD, breaks CRUD
- **Admin (39+):** full tournament/prize/contact/round CRUD, organizer CRUD, entry management, draw generation, match management, ranking adjust

### Key business logic

- **Score cascade** (MatchService): breaks → frame scores (auto-recalculated) → match scores → winner advancement
- **Draw generation** (DrawService): seeded bracket placement, bye calculation, DB transaction, bye winner advancement
- **Entry flow** (EntryService): capacity checks, duplicate checks, open/closed status, admin-add auto-approves
- **Player stats** (PlayerService.show): computes matches_played, wins, win_rate from completed match data

### Remaining backend items

- [ ] Factories for all models
- [ ] Store coming-soon stub endpoint (`GET /products`)

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
| `src/components/ui/` | 19 shared components (Button, Input, Select, PlayerAvatar, StatusBadge, MatchRow, TopNav, MobileTabBar, etc.) |
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

### Remaining frontend items

- [ ] Umpire board mobile layout
- [ ] Umpire board API integration (persist breaks, complete frame/match)
- [ ] Home page: featured live match banner
- [ ] Tournament form: review step, success page, preview sidebar
- [ ] Draw generation: mode selector UI, summary sidebar
- [ ] Draw reveal: slot-machine style reveal animation
- [ ] Match management: inline score controls, per-frame scores
- [ ] Store page: dark felt hero styling

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
php artisan test          # should show 136 passing
php artisan serve         # runs on :8000

cd /Users/haiderali/projects/snooker-pk/frontend
npm run dev               # runs on :3000 (proxies /api + /storage to :8000)
npm run build             # 143 modules, ~437 KB JS + ~52 KB CSS
```

Next work: Polish remaining pages (umpire board API integration, home page live match banner, tournament form wizard review step, match management inline scoring).
