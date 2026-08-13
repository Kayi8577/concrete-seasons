# Concrete Seasons — maintainer guide

Cozy offline life-sim (fictional NYC island). Plain JS + canvas, **no build step, no frameworks, no image/audio assets**. One global namespace `CS`. Live at https://kayi8577.github.io/concrete-seasons/ (GitHub Pages, main branch root).

## Where things live

**Content is data. To add/change game content, edit `js/data/` only:**

| File | Owns |
|---|---|
| `data/core.js` | constants, calendar (`CS.dayOf`), palettes, weather tables |
| `data/world.js` | all maps (grids built in code or ASCII), `SPOTS`, `TRAVEL`, `INTERIOR_SPAWNS`, `WALKABLE` |
| `data/economy.js` | `CROPS`, `ITEMS`, `SHOP_MARKET`, `THRIFT_POOL`, `FLEA_POOL`, `RECIPES`, `FARM_UPGRADES` |
| `data/npcs.js` | `NPCS` (defs + drawn `look` + gift `loved/liked`), `PET_TYPES`, `NPC_PAIRS` |
| `data/schedules.js` | `SCHEDULES[id](state)` → ordered `{until, at, act}` blocks |
| `data/dialogue.js` | `DIALOGUE` pools (+ cond objects), `MESSAGES`, festival/date/married/cohab lines |
| `data/festivals.js` | `FESTIVALS` calendar + flavor lines |
| `data/arcs.js` | `ARCS`: dated stages with `run(api)` effects (Year 2–5 storylines) |

Load order in `index.html` matters: core → world → economy → npcs → schedules → dialogue → festivals → arcs → systems.

**Systems (logic) — touch only when adding mechanics:**
`js/art.js` (ALL visuals, procedural canvas), `js/audio.js` (WebAudio synthesis), `js/engine.js` (render/pathfind/input), `js/game.js` (simulation, saves, cheats), `js/ui.js` (DOM panels), `js/main.js` (boot).

## Hard rules

- **No emoji as art, ever.** All visuals are vector drawings in `art.js`; UI icons are inline SVG. (User feedback — non-negotiable.)
- **Offline-first**: no network calls in gameplay. Assets must stay self-contained.
- **Save compatibility**: never break old saves. New state fields get defaults in `game.js → G.start()` migration block; `SAVE_VERSION` lives in `data/core.js`.
- **NPCs live without the player**: prefer observable behavior over UI numbers.
- Match the cozy writing voice (see any dialogue pool before writing new lines).

## Release checklist (every deploy)

1. `for f in js/*.js js/data/*.js; do node --check $f; done`
2. Bump **both**: `CACHE_VERSION` in `sw.js` AND every `?v=` in `index.html` (browser heuristic cache bites otherwise).
3. Browser-test: load old save + start new game, check console for errors.
4. Commit, `git push` — Pages redeploys automatically in ~1 min.

## Testing tricks

- Browser pane pauses rAF when hidden → drive frames manually: `window.step = n => { for(let i=0;i<n;i++) CS.game.tick(16); CS.engine.render(CS.game.state()); }`
- Cheats (Menu → Developer console): `MONEYPLEASE, NEXTDAY, SETTIME 18:00, SETDAY n, SETSEASON FALL, SETYEAR 3, NEXTFESTIVAL, FRIEND MAYA, ATTRACT MAYA, NPCDATE A B, NPCSTATE MAYA, ARCS, TEXTME, FASTGROW, ALLSEEDS`
- Arc timeline test: `SETYEAR n` + `NEXTDAY` (arcs catch up on wake).

## Save architecture

localStorage: `concreteSeasons_slot{0..2}` (+ `_bak` rolling backup written before each save; corrupt saves auto-recover from it). Autosave on sleep and on app-background. Export/import as `.json` files via Menu (export) and main menu (import). `concreteSeasons_ngplus` carries New Game+ recipes.
