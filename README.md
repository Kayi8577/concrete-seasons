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
| `js/data.js` | **All content**: maps, crops, items, NPC definitions & looks, schedules, dialogue pools, shops, constants. Adding content = editing data, not logic. |
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

## Current vertical slice (v0.1)

- Character creation: name (Unicode OK), gender, birthday (season + day), appearance (skin/hair/style/outfit)
- 3 local save slots, autosave on sleep & app-background, delete slot
- Time: 4 seasons × 30 days, weekdays, day/night tint; weather (sun/cloud/rain — rain waters outdoor plots)
- Harbor Point map: apartment, community farm + greenhouse, Juniper Café, Moonrise Bakery, Corner Market, tram, waterfront
- Farming: till / plant / water / harvest / regrowth; 4 crops (lettuce, radish, strawberry, tulip); shipping bin
- Economy: seeds, coffee/bread, pet food, weekly rent, energy
- 6 NPCs (Maya, Daniel, Lena, Nico, Grace, Malik) with weekday/weekend/weather schedules, tiered relationships, condition-based dialogue
- Pets: adopt a cat, dog, or fish; feeding, petting, dog walks, animated aquarium
- Events: move-in, garden intro, first café visit, hidden 5:42 AM bakery scene, first rain, birthday greetings
- City Journal: residents, discoveries, farm stats
- Cheats: `MONEYPLEASE, MAXENERGY, ALLSEEDS, FASTGROW, SUNNYDAY, RAINYDAY, NEXTDAY, TIMEFREEZE, SETTIME hh:mm, SETDAY n, FRIEND <name>, NPCSTATE <name>` (Menu → Developer console)

## Roadmap

- **Phase 2**: full 14-NPC cast, romance, messaging app, cooking, thrifting, jobs, festivals, outer-NYC hubs, NPC↔NPC relationships
- **Phase 3**: Years 2–5 arcs — careers, layoffs, relocations, marriage, children, redevelopment, business turnover, aging
- See the design document for the complete five-year vision.
