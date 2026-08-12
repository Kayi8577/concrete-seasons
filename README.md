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

## Roadmap

- **Phase 2.5**: outer-NYC hubs via the tram, dates/hangouts, more pets & pet events, more festivals (Pride, Harbor Lights, Lunar New Year), hidden-economy price waves
- **Phase 3**: Years 2–5 arcs — careers, layoffs, relocations, marriage, children, redevelopment, business turnover, aging
- See the design document for the complete five-year vision.
