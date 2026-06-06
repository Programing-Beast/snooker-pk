# Backend Progress (Laravel 13 API)

## Phase 1 — Backend Foundation
- [x] Laravel API skeleton + Sanctum setup
- [x] Spatie roles/permissions (admin, player, umpire)
- [x] Migrations (all tables — users, players, tournaments, prizes, contacts, tournament_entries, rounds, matches, frames, breaks)
- [x] Models + relationships (User, Player, Tournament, Prize, Contact, TournamentEntry, Round, Match_, Frame, Break_)
- [x] Basic seeder (roles, admin user, umpire user (Desislava Bozhilova), 32 sample players with phones)
- [x] bootstrap/app.php — API routes, Sanctum stateful middleware, Spatie middleware aliases
- [x] AppServiceProvider — route model bindings for Match_ and Break_
- [x] routes/api.php — 58+ endpoints across public, auth, umpire, admin groups
- [ ] Factories for all models

## Phase 2 — Auth
- [x] AuthService (register, login, logout, me)
- [x] RegisterRequest, LoginRequest (FormRequest validation)
- [x] UserResource (JSON transformation)
- [x] AuthController (POST /register, /login, /logout, GET /me)
- [x] Feature tests (11 tests — registration, login, logout, me, validation, auth guards)

## Phase 3 — Players
- [x] PlayerService (list/search/filter/paginate, show with computed stats, create, update, history, upcoming)
- [x] ListPlayersRequest, StorePlayerRequest, UpdatePlayerRequest
- [x] PlayerResource (with private field visibility — phone/address hidden from non-owners; computed stats: matches_played, wins, win_rate)
- [x] PlayerController (GET /players, GET /players/{id}, POST /players, PUT /players/{id}, GET /players/{id}/history, GET /players/{id}/upcoming)
- [x] Feature tests (14 tests — CRUD, search, filters, ownership, admin-only fields, privacy)

## Phase 3b — Player Phones
- [x] PlayerPhone model (1 primary + up to 3 secondary, WhatsApp flag)
- [x] PlayerPhoneService (list, create with label/WhatsApp validation, destroy)
- [x] PlayerPhoneController (GET/POST/DELETE /players/{player}/phones)
- [x] PlayerPhoneResource

## Phase 4 — Tournaments
- [x] TournamentService (list, showBySlug, create, update, delete, draw, players, updateEntryStatus, updateMaxPlayers)
- [x] ListTournamentsRequest, StoreTournamentRequest, UpdateTournamentRequest, UpdateEntryStatusRequest, UpdateMaxPlayersRequest
- [x] TournamentResource, TournamentDetailResource (with nested prizes/contacts/rounds/organizers)
- [x] TournamentController (full CRUD + draw + players + entry-status + max-players)
- [x] Feature tests (17 tests — CRUD, slug lookup, filters, validation, auth, draw, players)

## Phase 4b — Tournament Organizers
- [x] TournamentOrganizer model (user_id → users, tournament_id, role, sort_order)
- [x] TournamentOrganizerService (list, create, update, destroy)
- [x] TournamentOrganizerController (CRUD under tournaments)
- [x] TournamentOrganizerResource (includes nested user.player for name/photo)

## Phase 5 — Nested Resources (Prizes, Contacts, Rounds)
- [x] PrizeService, ContactService, RoundService (CRUD under tournaments)
- [x] Store/UpdatePrizeRequest, Store/UpdateContactRequest, Store/UpdateRoundRequest
- [x] PrizeResource, ContactResource, RoundResource
- [x] PrizeController, ContactController, RoundController (shallow nested routes)
- [x] Feature tests (20 tests — CRUD for each resource, validation, auth)

## Phase 6 — Entries
- [x] EntryService (requestEntry with capacity/duplicate checks, approve, reject, adminAdd, setSeed, myEntries, summary)
- [x] RequestEntryRequest, ApproveRejectEntryRequest, AdminAddEntryRequest, SetSeedRequest, ListEntriesRequest (max per_page: 200)
- [x] TournamentEntryResource
- [x] EntryController (POST /entries/request, GET /entries/mine, admin approve/reject/seed/add, GET /tournaments/{id}/entries)
- [x] Feature tests (14 tests — request, approve, reject, admin-add, seed, duplicates, capacity, closed entries)

## Phase 7 — Draw Generation
- [x] DrawService (previewDraw, generateDraw with seeded bracket placement + bye calculation, confirmDraw, rerollDraw, winner advancement)
- [x] Regeneration guard — draw generation blocked when tournament has completed/walkover/live matches (prevents accidental bracket destruction)
- [x] GenerateDrawRequest, ConfirmDrawRequest
- [x] DrawController (GET /draw/{id}/preview, POST /draw/generate, /draw/confirm, /draw/reroll)
- [x] Feature tests (9 tests — preview, generate, byes, confirm, reroll, no-rounds edge case, bye advancement)

## Phase 8 — Matches + Live Scoring
- [x] MatchService (show, update, assignUmpire, walkover, complete, declareWinner, board, createFrame, updateFrame, createBreak, updateBreak, deleteBreak, umpireMatches, score cascade: breaks → frame scores → match scores)
- [x] Frame::firstOrCreate (prevents duplicate frame key violations on concurrent requests)
- [x] EnsureAssignedUmpire middleware (admins pass unconditionally; umpires must be assigned to the match)
- [x] Match completion side-effects extracted into Laravel events: `MatchCompleted` event dispatched by MatchService; `AdvanceWinner` listener (fills next-round bracket slot, auto-sets `generated_at`); `CompleteTournament` listener (sets winner/runner-up, awards ranking points from prizes)
- [x] UpdateMatchRequest (includes score1/score2), AssignUmpireRequest, WalkoverRequest (includes optional score1/score2), StoreFrameRequest, UpdateFrameRequest, StoreBreakRequest, UpdateBreakRequest
- [x] MatchResource, FrameResource, BreakResource
- [x] MatchController (show, update, assignUmpire, walkover, complete, declareWinner, board, umpireMatches), FrameController, BreakController
- [x] `GET /umpire/matches` — returns matches assigned to authenticated umpire
- [x] `GET /admin/umpires` — returns users with umpire role (for assign-umpire dropdown)
- [x] `POST /matches/{match}/declare-winner` — admin endpoint to directly pick a winner (sets status=completed, optional scores, advances bracket)
- [x] Feature tests (36 tests — match CRUD, umpire assignment, walkover, complete, declare winner, score update, board, frames, breaks, score recalculation, high-break tracking, foul scoring, auth/role guards)

## Phase 9 — Rankings
- [x] RankingService (list ordered by points, manualAdjust with positive/negative points)
- [x] AdjustRankingRequest
- [x] RankingResource
- [x] RankingController (GET /rankings, POST /rankings/adjust)
- [x] Feature tests (8 tests — list, ordering, tier filter, inactive exclusion, adjust, negative adjust, auth, validation)

## Phase 10 — Test Data
- [x] TestMatchDataSeeder — creates completed matches with scores, live match, proper scheduled_at dates across tournaments
- [x] Storage symlink (`php artisan storage:link`)

## Summary

| Layer        | Count |
|--------------|-------|
| Controllers  | 14    |
| Services     | 11    |
| FormRequests | 31    |
| Resources    | 14    |
| Routes       | 58+   |
| Models       | 11    |
| Events       | 1 (MatchCompleted)                |
| Listeners    | 2 (AdvanceWinner, CompleteTournament) |
| Feature Tests| 144 (370 assertions, all passing) |

### Remaining
- [ ] Factories for all models
- [ ] Store coming-soon stub endpoint (`GET /products`)
- [ ] Contact model/routes (currently in spec but tournament_organizers may replace contacts)
