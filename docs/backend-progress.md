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

> Contacts were later dropped (migration `2026_06_04_100005_drop_contacts_and_organizer_column`);
> `tournament_organizers` replaced them. The Contact entries below are historical.
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

## Phase 11 — Qualifier Rounds

Qualifier rounds live *inside* a tournament. A tournament flagged `has_qualifiers`
carries one or more rounds with `is_qualifier = true`, ordered ahead of the main
draw by `sort_order`. Players are assigned to a specific qualifier round via
`tournament_entries.entry_round_id`; a null `entry_round_id` means a direct
main-draw entrant.

Winners of the **last** qualifier round join the direct entrants when the first
main-draw round is generated.

- [x] Migration: `has_qualifiers` (bool) on tournaments, `is_qualifier` (bool) on rounds, `entry_round_id` (FK nullable → rounds) on tournament_entries
- [x] Tournament model: `qualifierRounds()` and `mainDrawRounds()` scoped hasMany relations
- [x] Round model: `is_qualifier` fillable + bool cast
- [x] TournamentEntry model: `entry_round_id` fillable, `entryRound()` belongsTo
- [x] DrawService: `getQualifierRoundPool()` — pool = entries assigned to the round + winners of the previous qualifier round − players already paired in the round
- [x] DrawService: `createQualifierMatch()` (manual pairing, validates pool membership), `generateQualifierDraw()` (shuffles the pool and auto-pairs), `deleteQualifierMatch()` (force-deletes; refuses live/played matches)
- [x] DrawService `generateFromSeeds()`: qualifier rounds draw from the round pool; the first main-draw round of a `has_qualifiers` tournament combines direct entrants with last-qualifier-round winners
- [x] DrawService: qualifier rounds get no next-round placeholders and no bye advancement
- [x] EntryService: `max_players` capacity applies only to main-draw entries (`entry_round_id` null) in `requestEntry()`, `adminAdd()`, `bulkAdminAdd()`; new `setEntryRound()`
- [x] AdvanceWinner listener: qualifier-round wins award the elimination prize but do **not** advance into the bracket
- [x] Resources: `has_qualifiers` + `qualifying_slots` on Tournament/TournamentDetail, `is_qualifier` on Round, `entry_round_id` on TournamentEntry
- [x] Routes: `GET /tournaments/{tournament}/rounds/{round}/pool`, `POST /matches/qualifier`, `POST /matches/qualifier/generate`, `DELETE /matches/{match}/qualifier`, `PUT /entries/{entry}/entry-round` (all admin)
- [x] Feature tests: `QualifierTest` (25 tests — pool composition, manual pairing, auto-generation, deletion guards, capacity rules, advancement)

### Superseded: cross-tournament qualifiers

An earlier design (2026-06-15) modelled qualifiers as *separate tournaments*
linked by `parent_tournament_id`, with a `transferQualifiedPlayers()` step that
copied survivors into the parent. It was replaced by the in-tournament rounds
above on 2026-07-11. None of that code remains.

Left behind by the swap:

- `tournaments.parent_tournament_id` — orphaned column + FK, no app code reads it
- `tournament_entries.source` still permits `qualifier_transfer`, now unused
- `tournaments.qualifying_slots` — still stored, validated, exposed, and editable in the admin form, but purely descriptive; no draw logic reads it

## Summary

| Layer        | Count |
|--------------|-------|
| Controllers  | 14    |
| Services     | 12    |
| FormRequests | 37    |
| Resources    | 14    |
| Routes       | 61+   |
| Models       | 12    |
| Events       | 1 (MatchCompleted)                |
| Listeners    | 2 (AdvanceWinner, CompleteTournament) |
| Feature Tests| 198 (514 assertions, all passing) — 15 files |

### Remaining
- [ ] Factories for all models
- [ ] Store coming-soon stub endpoint (`GET /products`)
- [ ] Drop the orphaned `parent_tournament_id` column and the unused `qualifier_transfer` source value
- [ ] `ensureRoundsExist()` counts *all* approved entries, including qualifier-assigned ones, so it can over-create main-draw rounds for a qualifier tournament
- [x] ~~Contact model/routes~~ — dropped; `tournament_organizers` replaced contacts
