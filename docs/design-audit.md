# Design vs Implementation Audit

Last updated: 2026-06-04

Design prototypes live in `design/snookerpk-designs/`. Each `.js` file renders HTML into its companion `.html` shell. This document compares every prototype against the current React implementation so future sessions can skip re-auditing.

---

## How to read this document

- **Matches** = implementation faithfully reproduces the design
- **Differs** = implemented but with a different approach or styling
- **Missing** = design element not yet implemented
- **Added** = implementation has features not in the design prototype

---

## 1. Player Profile (`/players/:id`)

**Design source:** `design/snookerpk-designs/psr-render.js` (PROFILE object + `buildProfile()`)
**Implementation:** `frontend/src/pages/public/PlayerProfilePage.jsx`
**Match: ~75%**

### Header

| Element | Design | Implementation | Status |
|---|---|---|---|
| Container | `bg-night felt-grain on-felt` | Same | Matches |
| Radial gradient | `radial-gradient(640px 320px at 16% -20%, rgba(11,110,67,.6), transparent 60%)` | Same (inline style) | Matches |
| Photo size | Mobile `w-20 h-20`, desktop `w-28 h-28`, `rounded-xl ring-2 ring-brass` | `PlayerAvatar size="xl"` (same dims, rounded-xl) | Matches |
| Name | `text-[24px] sm:text-[38px] font-display font-extrabold uppercase` | Same | Matches |
| Tier + Rank badges | `badge bg-felt` / `badge bg-brass-tint` | Same, conditional rendering | Matches |
| Location line | Flag + city + "Pro since {year}" | Flag + city, **no "Pro since"** | Missing |
| Desktop action buttons | "Follow" + "Head-to-head" in top-right | Not implemented | Missing |

### Stats Grid

| Element | Design | Implementation | Status |
|---|---|---|---|
| Grid | `grid-cols-2 gap-3` mobile, `grid-cols-4 gap-4` desktop | `grid-cols-2 sm:grid-cols-4 gap-4` | Matches |
| Card padding | Mobile `p-3.5`, desktop `p-5` | `p-4 sm:p-5` | Differs (minor) |
| Label | `seclabel text-ink-400 !text-[9px]` mobile | `seclabel text-ink-400` (no mobile override) | Differs (minor) |
| Values | `text-2xl` / `text-[34px]`, highlight `text-felt` | Same | Matches |

### Biography

| Element | Design | Implementation | Status |
|---|---|---|---|
| Container | `card p-6` | Same | Matches |
| Visibility | Desktop only (hidden on mobile) | Shows on both | Differs |

### Tournament History

| Element | Design | Implementation | Status |
|---|---|---|---|
| Section label | `seclabel text-felt mb-3` + "Full record ->" link | Label only, no link | Missing link |
| Mobile layout | Flex rows with badge | Same | Matches |
| Desktop layout | 3-column grid table with header row | Uses mobile layout on desktop too | Missing |
| Row structure | Event name + date + result badge | Event + round + badge | Matches (mobile) |

### Upcoming Events

| Element | Design | Implementation | Status |
|---|---|---|---|
| Card icon | Snooker ball (`ball w-4 h-4`, pink `#e86a92`) | Calendar SVG icon | Differs |
| Card structure | Card with icon, event name, venue, date, "Details" link | Same structure | Matches |
| Mobile card padding | `p-3.5` | `p-4` | Differs (minor) |

### Head-to-Head

| Element | Design | Implementation | Status |
|---|---|---|---|
| Structure | Flag + name + W-L record + progress bar | Same (uses CountryFlagChip) | Matches |
| Data source | Static PROFILE.h2h array | Computed from match history | Added (dynamic) |
| Progress bar | `h-2 rounded-full bg-bad-tint` with felt fill | Same | Matches |

### Action items for Player Profile

1. Add "Pro since {year}" to location line (needs `turned_pro` field from backend)
2. Add desktop action buttons (Follow, H2H) to header
3. Hide biography on mobile
4. Add "Full record" link to history section header
5. Build desktop 3-column table layout for history
6. Replace calendar SVG with snooker ball icon in upcoming cards

---

## 2. Player Dashboard (`/dashboard`)

**Design source:** `design/snookerpk-designs/player-area.js` (`buildDash()`)
**Implementation:** `frontend/src/pages/player/DashboardPage.jsx`
**Match: ~90%**

### Header/Hero

| Element | Design | Implementation | Status |
|---|---|---|---|
| Avatar size | `w-14 h-14` mobile, `w-16 h-16` desktop | `PlayerAvatar size="lg"` | Matches |
| Greeting | "Welcome back" + name | Same | Matches |
| Badges | Flag + tier + rank | Same, conditional | Matches |
| Desktop buttons | "Edit profile" + "Find tournaments" | Same with `hidden sm:flex` | Matches |

### Layout

| Element | Design | Implementation | Status |
|---|---|---|---|
| Grid | `grid-cols-[1.4fr_1fr] gap-7` | Same with `sm:` prefix | Matches |
| Left column | Upcoming + Recent | Same | Matches |
| Right column | Seedings + Entry requests | Same | Matches |

### Upcoming Match Cards

| Element | Design | Implementation | Status |
|---|---|---|---|
| Structure | Card with event, round, badge, player vs opponent | Same | Matches |
| Status badges | Live (pulse) / Scheduled | Same | Matches |
| "You" badge | `badge bg-felt text-white` | Same | Matches |
| Footer | Time + table + "View draw" link | Same | Matches |
| Item limit | 2 cards shown | `slice(0, 4)` — shows 4 | Differs |

### Recent Results

| Element | Design | Implementation | Status |
|---|---|---|---|
| W/L badge | Circular, green/red | Same | Matches |
| Opponent + flag | Present | Same | Matches |
| Score display | Bold tabular, felt/ink color | Same | Matches |
| Title badge | `bg-brass-tint` trophy badge on wins | Not implemented | Missing |
| Item limit | 3 rows | `slice(0, 5)` — shows 5 | Differs |

### Seedings + Entry Requests

| Element | Design | Implementation | Status |
|---|---|---|---|
| Seed row | Dark badge + name + status | Same | Matches |
| Request row | Name + date + status badge + rejection reason | Same | Matches |

### Action items for Player Dashboard

1. Add trophy/title badge to RecentRow for tournament wins
2. Consider matching design limits (2 upcoming, 3 recent) or keep expanded

---

## 3. Edit Profile (`/profile/edit`)

**Design source:** `design/snookerpk-designs/player-area.js` (`buildEdit()`)
**Implementation:** `frontend/src/pages/player/EditProfilePage.jsx`
**Match: ~80%**

### Page Heading + Toast

| Element | Design | Implementation | Status |
|---|---|---|---|
| "Account" label + "Edit profile" h1 | Same | Same | Matches |
| Success toast | `bg-ok-tint border-ok/30`, check icon, message | Same + `dropin` animation | Matches |

### Photo Section

| Element | Design | Implementation | Status |
|---|---|---|---|
| Photo display | `rounded-xl bg-cover ring-2 ring-hairline` | Same | Matches |
| Responsive size | `w-16 h-16` mobile, `w-20 h-20` desktop | Same with `sm:` | Matches |
| "Change photo" button | `btn btn-outline btn-sm` | Same | Matches |
| Initials fallback | Not in design | Implemented | Added |

### Form Fields

| Element | Design | Implementation | Status |
|---|---|---|---|
| Grid layout | 2 cols desktop, 1 col mobile | `sm:grid-cols-2` | Matches |
| Full name | Editable input | Controlled Input component | Matches |
| Country | Select with options | Disabled, Pakistan only | Differs |
| Phone | Editable input | Read-only, links to phone section | Differs |
| City | Text input | Select dropdown with 30 cities | Enhanced |
| Address | col-span-2 | Same | Matches |
| Bio textarea | col-span-2, rows=3 | Same | Matches |

### Save/Cancel Actions

| Element | Design | Implementation | Status |
|---|---|---|---|
| Button layout | Flex gap-3 | Same | Matches |
| Save button | "Save changes" | Dynamic: "Saving..." / "Saved" with check | Enhanced |
| Cancel button | Ghost variant | Same | Matches |
| Mobile sticky bar | Sticky bottom-60 with backdrop-blur, full-width buttons | Not implemented | Missing |
| "Last saved" timestamp | Desktop only, `text-caption text-ink-400` | Not implemented | Missing |

### Phone Management Section

| Element | Design | Implementation | Status |
|---|---|---|---|
| Entire section | Not in design | Full CRUD with labels, WhatsApp, validation | Added |

### Action items for Edit Profile

1. Add mobile sticky action bar (sticky bottom, full-width buttons)
2. Add "Last saved X ago" timestamp on desktop
3. Consider making mobile buttons full-width (`flex-1`)

---

## 4. Rankings (`/rankings`)

**Design source:** `design/snookerpk-designs/psr-render.js` (`buildRanks()`)
**Implementation:** `frontend/src/pages/public/RankingsPage.jsx`
**Match: ~85%**

### Table & Filters

| Element | Design | Implementation | Status |
|---|---|---|---|
| Table structure | Rank, Player, Played, Points, Recent Form columns | Same | Matches |
| Header styling | "Leaderboard" label + "National Rankings" | Same | Matches |
| Season dropdown | Present | Present | Matches |
| Tier filter | Present | Present | Matches |
| Search input | `hidden sm:block` | Same | Matches |
| Form pills (W/L) | Colored pills | Same | Matches |
| Top-3 row highlight | `bg-brass-tint/30` | Conditional on `isDefaultSort` | Matches |

### Mobile Podium

| Element | Design | Implementation | Status |
|---|---|---|---|
| Top-3 podium display | Large initials circles, medal positions, prominent layout | Not implemented | Missing |

### Action items for Rankings

1. Build mobile podium component for top 3 players

---

## 5. Home Page (`/`)

**Design source:** `design/snookerpk-designs/SnookerPK Public Screens.html`
**Implementation:** `frontend/src/pages/public/HomePage.jsx`
**Match: ~75%**

### Hero Section

| Element | Design | Implementation | Status |
|---|---|---|---|
| "Every frame, one platform" heading | Present | Same | Matches |
| Brass accent text | Present | Same | Matches |
| CTA buttons | "Browse tournaments" + "Create account" | Same | Matches |
| Stat cards (Players, Tournaments, Cities) | Present | Same | Matches |
| Dark felt background | Present | Same | Matches |
| Decorative snooker balls | 7 balls, specific colors | `hidden lg:flex`, similar | Matches |

### Live Now Section

| Element | Design | Implementation | Status |
|---|---|---|---|
| Tournament cards | 3 cards with live badge | Same | Matches |
| Pulsing indicator | Present | Same | Matches |
| Featured live match card | Large centered card with player matchup, score | Not implemented | Missing |

### Rankings Preview + Store Teaser

| Element | Design | Implementation | Status |
|---|---|---|---|
| 2-column grid | Rankings left, Store teaser right | Same | Matches |
| Top 5 rankings | Present | Same | Matches |
| Store email signup | Present | Same | Matches |

### Footer

| Element | Design | Implementation | Status |
|---|---|---|---|
| Dark background, logo, links | Present | Same | Matches |

### Action items for Home Page

1. Build featured live match banner card in hero section

---

## 6. Tournaments List (`/tournaments`)

**Design source:** `design/snookerpk-designs/SnookerPK Public Screens.html`
**Implementation:** `frontend/src/pages/public/TournamentsPage.jsx`
**Match: ~90%**

### All Elements

| Element | Design | Implementation | Status |
|---|---|---|---|
| Page header | "Browse" label + "Tournaments" title | Same | Matches |
| Filter tabs | All/Upcoming/Live/Completed with counts | Same | Matches |
| Live pulsing dot | Present | Same | Matches |
| Sticky filter bar | Present | Same | Matches |
| Search input with icon | Present | Same | Matches |
| 3-column card grid | Present | Same | Matches |
| Empty state | Present | Same | Matches |

### Action items for Tournaments List

None significant. This page is well-aligned.

---

## 7. Tournament Detail (`/tournaments/:slug`)

**Design source:** `design/snookerpk-designs/detail-render.js` + `detail-data.js`
**Implementation:** `frontend/src/pages/public/TournamentDetailPage.jsx`
**Match: ~75%**

### Banner/Header

| Element | Design | Implementation | Status |
|---|---|---|---|
| Status badge | Present | Same | Matches |
| Tournament name | Large white text | Same | Matches |
| Key details (dates, venue) | With icons | Same | Matches |
| Organizer info | Init box + name | Same | Matches |
| Prize pool highlight | Brass color | Same | Matches |
| Featured live match card in banner | Centered card with player matchup | Not implemented | Missing |

### Tab System

| Element | Design | Implementation | Status |
|---|---|---|---|
| 5 tabs | Draw, Overview, Players, Prizes, Info | Same | Matches |
| Tab styling | Active indicator | Same | Matches |

### Draw Tab

| Element | Design | Implementation | Status |
|---|---|---|---|
| Round headers | Dark background | Same | Matches |
| Match rows | Player names, scores, statuses | Uses MatchRow component | Matches |
| Sticky jump navigation | Left sidebar with round links | Not implemented | Missing |
| Expandable frame details | Click to expand frame scores | Not implemented | Missing |
| Mobile round chip selector | View one round at a time | Not implemented | Missing |

### Other Tabs

| Tab | Status |
|---|---|
| Overview | Matches (about + prizes) |
| Players | Matches (seed badges, cards) |
| Prizes | Matches (position, amount) |
| Info | Matches (venue, schedule, contacts) |

### Action items for Tournament Detail

1. Add featured live match card in banner (desktop)
2. Add sticky jump navigation for draw rounds (desktop)
3. Add expandable frame details in draw
4. Add mobile round chip selector

---

## 8. Store (`/store`)

**Design source:** `design/snookerpk-designs/psr-render.js` (`buildStore()`)
**Implementation:** `frontend/src/pages/public/StorePage.jsx`
**Match: ~60%**

| Element | Design | Implementation | Status |
|---|---|---|---|
| Hero section | Full-height dark felt with radial gradients, decorative cue SVG | Simple inline header, no hero | Missing |
| Coming soon badge | Present | Same | Matches |
| Store title | Present | Same | Matches |
| Email signup | Dark card with input + "Notify me" | Same styling | Matches |
| Product grid | 3 columns | Same | Matches |
| "Full catalogue at launch" badge | Centered at bottom | Not implemented | Missing |

### Action items for Store

1. Build dark felt hero section with radial gradients
2. Add decorative SVG elements
3. Add "Full catalogue at launch" badge

---

## 9. Admin Dashboard (`/admin`)

**Design source:** `design/snookerpk-designs/admin.js` (`buildDash()`)
**Implementation:** `frontend/src/pages/admin/AdminDashboardPage.jsx`
**Match: ~85%**

| Element | Design | Implementation | Status |
|---|---|---|---|
| 4 stat cards | With icons and tones | Same | Matches |
| 2-column layout | 1.5fr / 1fr | Same | Matches |
| Activity feed | User actions with timestamps | Replaced with tournaments list | Differs |
| Quick actions | Create tournament, Generate draw, etc. | Create tournament + Manage players | Partial |
| Pending entries | Approve/reject buttons | Same | Matches |

### Action items for Admin Dashboard

1. Add more quick action buttons (Generate draw, Review entries, Publish results)
2. Consider adding activity feed alongside tournaments list

---

## 10. Tournament Form (`/admin/tournaments/new`)

**Design source:** `design/snookerpk-designs/admin.js` (`renderWizard()`, STEPS)
**Implementation:** `frontend/src/pages/admin/TournamentFormPage.jsx`
**Match: ~65%**

| Element | Design | Implementation | Status |
|---|---|---|---|
| 4-step wizard | Basics, Prizes, Organizers/Contacts, Rounds | Basics, Prizes, Organizers, Rounds | Matches |
| Step indicator | Numbered pills, clickable | Same | Matches |
| Form validation | Error display | Same | Matches |
| Live preview sidebar | Sticky right column with summary | Not implemented | Missing |
| Review step | Expandable sections for each step | Not implemented | Missing |
| Published success screen | Celebratory icon + message | Not implemented | Missing |
| Organizer search | Phone-based with debounce | Implemented | Added |

### Action items for Tournament Form

1. Build sticky "Live preview" summary sidebar
2. Add review step (step 5)
3. Add published success screen

---

## 11. Manage Entries (`/admin/tournaments/:id/entries`)

**Design source:** `design/snookerpk-designs/admin-manage.js` (`buildEntries()`)
**Implementation:** `frontend/src/pages/admin/ManageEntriesPage.jsx`
**Match: ~75%**

| Element | Design | Implementation | Status |
|---|---|---|---|
| Tournament header | Present | Same | Matches |
| Entry open/closed toggle | Toggle switch | Not implemented | Missing |
| Stat cards | Total, Pending, Approved, Rejected, Capacity | Capacity only | Partial |
| Filter tabs | All / Pending / Approved / Rejected | Section-based layout instead | Differs |
| Player rows | Avatar, tier badge, status, date | Same | Matches |
| Approve/Reject buttons | Present | Same | Matches |
| Seed input | Not in design | Implemented for approved entries | Added |
| Add players | Modal with single select | Inline card with checkboxes (bulk) | Enhanced |

### Action items for Manage Entries

1. Add entry open/closed toggle
2. Add stat cards row (total, pending, approved, rejected counts)
3. Consider adding filter tabs instead of section-based layout

---

## 12. Draw Generation (`/admin/tournaments/:id/draw`)

**Design source:** `design/snookerpk-designs/draw.js` (`buildGenerate()`)
**Implementation:** `frontend/src/pages/admin/DrawGeneratePage.jsx`
**Match: ~40%**

| Element | Design | Implementation | Status |
|---|---|---|---|
| Round selector | Card with round options + pool info | Round dropdown only | Partial |
| Draw mode selector | Card-based radio: Fixed vs Random reveal | Not visible | Missing |
| Round settings | Best of dropdown + bye assignment | Not implemented | Missing |
| Summary sidebar | Sticky card: pool size, matches, byes, format | Not implemented | Missing |
| Generated matches | Card with dark header, player chips | MatchRow component | Partial |
| Action buttons | "Generate pairing" / "Launch live reveal" | Single generate button | Partial |

### Action items for Draw Generation

1. Build draw mode selector UI (Fixed pairing vs Random reveal cards)
2. Add round settings card (Best of dropdown, bye assignment strategy)
3. Build sticky summary sidebar with pre-generation metadata
4. Differentiate "Generate pairing" vs "Launch live reveal" buttons

---

## 13. Draw Reveal (`/admin/tournaments/:id/draw/reveal`)

**Design source:** `design/snookerpk-designs/draw.js` (`buildReveal()`)
**Implementation:** `frontend/src/pages/admin/DrawRevealPage.jsx`
**Match: ~85%**

| Element | Design | Implementation | Status |
|---|---|---|---|
| Title + progress | "Live draw reveal", Match X of Y | Same | Matches |
| State legend | Idle -> Spinning -> Settled -> Confirmed bar | Not implemented | Missing |
| Match cards grid | SM: 2 cols, LG: 3 cols | Same | Matches |
| Player avatars + flags | Present | Same | Matches |
| Spinning animation | Custom slot-machine style | CSS animation | Matches |
| Re-roll button | Present | Same | Matches |
| Confirm matchup | Present | Same | Matches |
| Remaining pool chips | Shown at bottom | Not implemented | Missing |

### Action items for Draw Reveal

1. Add state legend bar (Idle -> Spinning -> Settled -> Confirmed)
2. Add remaining pool chips display

---

## 14. Manage Matches (`/admin/tournaments/:id/matches`)

**Design source:** `design/snookerpk-designs/admin.js`
**Implementation:** `frontend/src/pages/admin/ManageMatchesPage.jsx`
**Match: ~90%**

| Element | Design | Implementation | Status |
|---|---|---|---|
| Header | Tournament name | Same | Matches |
| Rounds grouped in cards | Present | Same | Matches |
| Round header | Name, best of, match count | Same | Matches |
| Match rows | Player vs player with seeds | MatchRow component | Matches |
| Admin actions | Schedule, W/O, Complete buttons | Same | Matches |
| Umpire info | Present | Same | Matches |
| Edit modal | Schedule/table assignment | Same | Matches |
| Live scoring broadcast view | Dark tablet mockup | Not implemented | Missing |

### Action items for Manage Matches

1. Build live scoring broadcast view (lower priority, may be umpire-board territory)

---

## 15. Manage Players (`/admin/players`)

**Design source:** `design/snookerpk-designs/admin-manage.js` (`buildPlayers()`)
**Implementation:** `frontend/src/pages/admin/ManagePlayersPage.jsx`
**Match: ~60%**

| Element | Design | Implementation | Status |
|---|---|---|---|
| Header + count | Present | Same | Matches |
| Search bar | With icon | Same | Matches |
| "Add player" button | Present | "New player" button | Matches |
| Table structure | Full table with columns | Simple list layout | Differs |
| Country column | Flag + code | Not shown | Missing |
| Tier column | Pro/Amateur badge | Badge on row | Matches |
| Seed column | Number, colored top 8 | Not shown | Missing |
| City column | Present | Not shown | Missing |
| Edit action | In-row button -> modal | Navigate to separate page | Differs |
| Disable toggle | Not in design | Implemented | Added |
| Phone display | Not in design | Shown on row | Added |

### Action items for Manage Players

1. Switch to table layout with Country, City, Seed columns
2. Consider inline modal edit instead of page navigation

---

## Priority Summary

### High priority (significantly affects UX)

1. **Draw Generation page** (40% match) — mode selector, settings card, summary sidebar
2. **Tournament Form** (65%) — live preview sidebar, review step
3. **Manage Players** (60%) — table with missing columns

### Medium priority (polish)

4. **Player Profile** — desktop history table, action buttons, "Full record" link
5. **Manage Entries** — filter tabs, stat cards, open/closed toggle
6. **Tournament Detail** — sticky jump nav for draw, featured live match
7. **Home Page** — featured live match banner
8. **Store** — dark felt hero section

### Low priority (minor styling)

9. **Rankings** — mobile podium
10. **Draw Reveal** — state legend bar, pool chips
11. **Player Dashboard** — title badge on wins
12. **Edit Profile** — mobile sticky action bar, "Last saved" timestamp
