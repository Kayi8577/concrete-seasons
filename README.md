# Concrete Seasons

A cozy, fully-offline life-simulation game set in **Harbor Point**, a fictional East River island neighborhood in New York City. You take over a neglected community farm plot and slowly build a life: growing crops, learning your neighbors' routines, finding hidden events, and adopting a pet.

**Play it in any browser — no server, no account, no internet needed after first load.**

## Run it

- **Quick:** open `index.html` in a browser (double-click works).
- **Dev server:** any static server, e.g. `python3 -m http.server 8642` then open `http://localhost:8642`.
- **Phone / offline:** host the folder anywhere (GitHub Pages works out of the box), open it once on your phone, then "Add to Home Screen." The service worker caches everything for airplane-mode play. Saves live in `localStorage` on the device.

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Settings → Pages → Deploy from branch → `main` / root.
3. Open the Pages URL on your phone → Add to Home Screen.

## Architecture

No frameworks, no build step, no image assets. Plain JS modules loaded in order, one global namespace `CS`.

| File | Responsibility |
|---|---|
| `js/data.js` | **Core content**: maps, crops, items, the founding NPCs, shops, recipes, festivals, constants. Adding content = editing data, not logic. |
| `js/data2.js` | **Phase 2 content**: the ten remaining major NPCs (definitions, schedules, dialogue), phone-message pools, festival lines. |
| `js/art.js` | **All visuals**: every sprite, portrait, and icon drawn procedurally with canvas vectors (cozy sage/earth palette, rounded forms, soft upper-left light). No emoji, no PNGs. |
| `js/engine.js` | Canvas renderer, camera, BFS pathfinding, tap/keyboard input. |
| `js/game.js` | Simulation: time/calendar, weather, farming, NPC schedules & relationships, events, pets, economy, save/load, cheats. |
| `js/ui.js` | DOM UI: HUD, dialogue, panels (bag/shop/journal/menu), character creation, save slots. |
| `js/main.js` | Boot + game loop + service-worker registration. |
| `sw.js` | Offline cache (network-first, cache fallback). Bump `CACHE_VERSION` on release. |

### Design rules baked in

- **Data-driven**: NPCs, schedules, dialogue, events, crops are data with small condition objects — no per-NPC code.
- **Offline-first**: zero network calls in gameplay. All simulation is local.
- **Save-compatible**: saves carry `saveVersion`; migrations go in `game.js → loadSlot`.
- **NPCs live without you**: schedules run whether or not you watch; off-screen NPCs are simulated abstractly.
- **No emoji art**: everything is drawn vector art in `art.js` (single source of truth for the game's look).

## Current build (v0.2 — Phase 2)

Everything from the v0.1 slice, plus:

- **Expanded Harbor Point** (56×42): Lighthouse Park with cherry trees, Harbor House community center, The Anchor bar, Second Life thrift shop, Pier Labs, South Point festival lawn
- **All 16 residents** — the complete 14-strong major cast (Maya, Daniel, Lena, Nico, Sofia, Gabriel, Theo, Avery, Naomi, Arjun, Priya, Jordan, Mei-Lin, Mateo) plus Grace and Malik, each with weekday/weekend/weather schedules and condition-based dialogue
- **Phone / messaging**: numbers get exchanged at Acquaintance, morning texts scale with friendship (Jordan famously barely texts), birthday texts, community announcements, gossip about new couples, daily reply for a small friendship bump
- **Romance**: romantic-preference selection at creation, NPC orientations, flirting, attraction, asking someone out at Friend+; partners text and get their own dialogue
- **NPCs live without you**: compatible pairs build momentum weekly and quietly start dating — you notice because they're suddenly *together* in the evenings, or because a friend texts you about it; rare breakups too
- **Gifts**: loved/liked favorites per NPC, once per day
- **Cooking**: kitchen + recipes; Grace and Nico teach their family recipes at Friend tier
- **Thrifting**: Second Life rotates 4 finds daily (seeded), with rare items worth flipping
- **Seasons matter**: summer crops (tomato, basil, cucumber, sunflower), season-gated market stock, out-of-season outdoor crops wilt at the turn, greenhouse ignores seasons
- **Festivals**: Cherry Blossom Picnic (Spring 15) — everyone on the lawn, warmer first-chats; Night Market (Summer 8) — sell at 1.5× from the Main Street stalls
- **Job**: help Joan with the café morning rush for $45
- Save migration: v1 saves load cleanly onto the new map (`saveVersion` 2)
- New cheats: `SETSEASON, NEXTFESTIVAL, NPCDATE A B, NPCBREAKUP A B, ATTRACT <name>, TEXTME`

### v0.3 (Phase 2.5) additions

- **The city opens up**: tram/subway travel to Astoria (Bellini's — Nico's actual restaurant, with Nonna Rosa holding court) and Chinatown (Mrs. Woo's Jade Pavilion tea shop). Destinations unlock through friendship — Nico and Mei-Lin invite you when you're close enough; Chinatown also opens for everyone in late Winter
- **Dates & hangouts**: take a friend (60+ friendship) or partner to Juniper, The Anchor, the waterfront, or Lighthouse Park — they relocate and wait for you, with venue-specific date dialogue
- **Four more festivals**: Harbor Lights fireworks (Summer 24 — bring a date to the waterfront for the scene of the year), Street Food Festival (Fall 12), Holiday Market (Winter 12), and Lunar New Year on Mott Street (Winter 25, lion dances and lanterns)
- **Hidden seasonal economy**: flowers spike during wedding season and Lunar New Year, basil/tomato run hot all summer — never explained, only visible in the shipping-bin prices ("in demand") and the occasional tip from a friend who'd know
- **Fall crops** (kale, carrot, squash, chrysanthemum) and **winter snow** with drifting-flake weather, a First Snow journal moment, and per-season weather tables

### v0.4 (Phase 3) additions — the years start mattering

- **Story-arc engine**: data-driven Year 2–5 life arcs fire on schedule, change NPC schedules/dialogue, and text you as they unfold
  - **Daniel**: layoff rumors → laid off (his whole week visibly changes) → lands at a startup, back at big tech, or freelance
  - **Maya**: fellowship applications → she stays in the city (always, if you're together) or leaves for Boston
  - **Lena**: defends the PhD → industry in NYC or a Chicago postdoc
  - **Nico**: the succession talk — if you've become a real friend, he finds his way to a partnership; otherwise the coin lands harder
  - **Glasshouse vs Juniper**: Glasshouse opens in Year 2; by Year 4 the market decides — and your own coffee purchases tip the scale. A café can genuinely close, its regulars migrating across the street
  - **Redevelopment**: notice (Y2) → community meeting you can attend and speak at (Y3) → construction fencing on South Point (Y4) → the new waterfront (Y5), shaped by whether the neighborhood showed up
- **Departures & returns**: NPCs who leave stay gone — journal shows where they landed, they text occasionally, and they come home for the Holiday Market
- **Marriage**: seeing → "make it official" (exclusive) → propose with a ring from the market → a wedding under the lighthouse with everyone you know → married life where your spouse keeps their career but wakes up and comes home to your apartment, with its own everyday-intimacy dialogue
- New cheats: `SETYEAR n`, `ARCS` (arc progress readout)

## Roadmap

- **Next**: children & family arcs, NPC marriages/weddings you attend, Ava & Nia (the aging kids), Year 6+ evergreen simulation, New Game+, Then & Now journal, more pets & pet events, Pride and the remaining festivals
- See the design document for the complete five-year vision.
