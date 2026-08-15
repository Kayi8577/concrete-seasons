/* =========================================================================
   Concrete Seasons — engine.js
   Canvas renderer, camera, grid pathfinding (BFS), input handling.
   ========================================================================= */
(function () {
  const E = CS.engine = {};
  const TILE = 32; // 2x the atlas's 16px tiles — integer scale keeps pixels crisp

  let canvas, ctx, dpr = 1;
  E.viewW = 0; E.viewH = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    E.viewW = canvas.clientWidth; E.viewH = canvas.clientHeight;
    canvas.width = E.viewW * dpr; canvas.height = E.viewH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false; // pixel art stays pixel art
  }
  E.init = function () {
    CS.art.loadAtlas();
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    window.addEventListener('resize', resize);
    resize();
    canvas.addEventListener('pointerdown', onTap);
    window.addEventListener('keydown', onKey);
  };

  /* ---------------- map helpers ---------------- */
  E.tileAt = function (scene, x, y) {
    const g = CS.MAPS[scene].grid;
    if (y < 0 || y >= g.length || x < 0 || x >= g[0].length) return '#';
    return g[y][x];
  };
  E.walkable = function (scene, x, y) {
    return CS.WALKABLE.has(E.tileAt(scene, x, y));
  };

  E.findPath = function (scene, sx, sy, tx, ty) {
    if (sx === tx && sy === ty) return [];
    if (!E.walkable(scene, tx, ty)) return null;
    const g = CS.MAPS[scene].grid, H = g.length, W = g[0].length;
    const key = (x, y) => y * W + x;
    const prev = new Map();
    const q = [[sx, sy]];
    prev.set(key(sx, sy), -1);
    while (q.length) {
      const [x, y] = q.shift();
      if (x === tx && y === ty) {
        const path = [];
        let k = key(x, y);
        let cx = x, cy = y;
        while (prev.get(k) !== -1) {
          path.push([cx, cy]);
          const p = prev.get(k);
          cx = p % W; cy = Math.floor(p / W);
          k = p;
        }
        return path.reverse();
      }
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const k2 = key(nx, ny);
        if (prev.has(k2) || !CS.WALKABLE.has(g[ny][nx])) continue;
        prev.set(k2, key(x, y));
        q.push([nx, ny]);
      }
    }
    return null;
  };

  // nearest walkable tile adjacent to (x,y), preferring closest to player
  E.adjacentWalkable = function (scene, x, y, px, py) {
    let best = null, bestD = 1e9;
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const nx = x + dx, ny = y + dy;
      if (E.walkable(scene, nx, ny)) {
        const d = Math.abs(nx - px) + Math.abs(ny - py);
        if (d < bestD) { bestD = d; best = [nx, ny]; }
      }
    }
    return best;
  };

  /* ---------------- input ---------------- */
  function onTap(ev) {
    if (CS.ui && CS.ui.blocking()) return;
    const rect = canvas.getBoundingClientRect();
    const wx = (ev.clientX - rect.left) + E.camX;
    const wy = (ev.clientY - rect.top) + E.camY;
    const tx = Math.floor(wx / TILE), ty = Math.floor(wy / TILE);
    CS.game.handleTap(tx, ty);
  }
  const keys = {};
  function onKey(ev) {
    if (CS.ui && CS.ui.blocking()) {
      if ((ev.key === ' ' || ev.key === 'Enter') && !document.getElementById('dialogue').classList.contains('hidden')) {
        CS.ui.advanceDialogue();
        ev.preventDefault();
      }
      return;
    }
    const map = { ArrowUp:[0,-1], ArrowDown:[0,1], ArrowLeft:[-1,0], ArrowRight:[1,0],
                  w:[0,-1], s:[0,1], a:[-1,0], d:[1,0] };
    if (map[ev.key]) { CS.game.stepPlayer(map[ev.key]); ev.preventDefault(); }
    if (ev.key === ' ' || ev.key === 'Enter') { CS.game.interactNearby(); ev.preventDefault(); }
  }

  /* ---------------- camera ---------------- */
  E.camX = 0; E.camY = 0;
  function updateCamera(p) {
    const map = CS.MAPS[p.scene].grid;
    const mw = map[0].length * TILE, mh = map.length * TILE;
    let cx = p.px + TILE / 2 - E.viewW / 2;
    let cy = p.py + TILE / 2 - E.viewH / 2;
    E.camX = Math.max(0, Math.min(cx, Math.max(0, mw - E.viewW)));
    E.camY = Math.max(0, Math.min(cy, Math.max(0, mh - E.viewH)));
    if (mw < E.viewW) E.camX = -(E.viewW - mw) / 2;
    if (mh < E.viewH) E.camY = -(E.viewH - mh) / 2;
  }

  /* ---------------- tile colors ---------------- */
  const TC = {
    '.': '#7fae6d', '-': '#cbb389', '~': '#5b87a8', 'T': '#7fae6d', 'F': '#8a6f4d',
    '#': '#8d7a68', 's': '#8a6242', 'g': '#8a6242', 'P': '#a8a49c', 'h': '#7fae6d',
    'X': '#7fae6d', 'N': '#7fae6d', 'o': '#7fae6d',
    'A': '#6e5741', 'C': '#6e5741', 'B': '#6e5741', 'M': '#6e5741', 'G': '#88a89b',
    'S': '#6e5741', 'R': '#6e5741', 'L': '#88a89b', 'H': '#6e5741', 'E': '#b09a7d',
    'c': '#7fae6d', 'i': '#7fae6d', 'k': '#7fae6d', '_': '#b3aa9c', 'D': '#b3aa9c', 'l': '#b3aa9c',
    'Q': '#6e5741', 'r': '#5a5c60', 'y': '#7fae6d', 'j': '#7fae6d', 'V': '#7fae6d', 'w': '#9a7a54', '*': '#5d646e', '&': '#8a8578', 'u': '#7fae6d',
    'K': '#d8cfc0', 'b': '#d8cfc0', 't': '#d8cfc0', 'W': '#d8cfc0', '=': '#d8cfc0',
    'O': '#d8cfc0', 'd': '#d8cfc0', 'U': '#d8cfc0', 'q': '#d8cfc0',
  };

  const INTERIOR_FLOOR = '#e6d9bf';
  // which tiles are covered by a drawn building (cached per scene)
  const _coverage = {};
  function buildingCoverage(scene) {
    if (_coverage[scene]) return _coverage[scene];
    const set = new Set();
    for (const b of (CS.BUILDINGS && CS.BUILDINGS[scene]) || []) {
      for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) set.add(x + ',' + y);
    }
    return (_coverage[scene] = set);
  }
  // exterior door accent per building
  const DOOR_ACCENT = { A:'#8a5a3b', C:'#5c8a6f', B:'#b07a2a', M:'#4a6fa5', G:'#88a89b',
                        S:'#7d5ba6', R:'#8a3b4a', L:'#5b8aa6', H:'#c9553e', D:'#b0653a', Q:'#37535e' };

  /* ---------------- render ---------------- */
  E.render = function (state) {
    // canvas may have been sized while hidden (display:none) — heal it
    if (canvas.width !== canvas.clientWidth * dpr || canvas.height !== canvas.clientHeight * dpr) resize();
    const p = state.playerRT;
    updateCamera(p);
    const scene = p.scene;
    const map = CS.MAPS[scene];
    const g = map.grid;
    const isOut = map.outdoor;

    // sky/base
    ctx.fillStyle = isOut ? '#4d6b52' : '#3a3430';
    ctx.fillRect(0, 0, E.viewW, E.viewH);

    const x0 = Math.max(0, Math.floor(E.camX / TILE));
    const y0 = Math.max(0, Math.floor(E.camY / TILE));
    const x1 = Math.min(g[0].length - 1, Math.ceil((E.camX + E.viewW) / TILE));
    const y1 = Math.min(g.length - 1, Math.ceil((E.camY + E.viewH) / TILE));

    const A0 = CS.art;
    const nightWin = state.time.minutes >= 1110 || state.time.minutes < 390;
    const covered = buildingCoverage(scene);
    const isCity = !!map.city;
    const groundBase = isCity ? '#b3aa9c' : '#7fae6d';
    const doorTiles = [];
    const entities = []; // y-sorted drawables: {b: baseline px, d: draw fn}

    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const ch = g[y][x];
        const sx = x * TILE - E.camX, sy = y * TILE - E.camY;
        const hash = (x * 73 + y * 151) % 97;

        if (ch === '#') {
          if (!isOut) { // interior wall
            if (!A0.tileDraw(ctx, 'wallin', sx, sy, TILE, 0)) {
              ctx.fillStyle = '#a08a74';
              ctx.fillRect(sx, sy, TILE, TILE);
            }
            ctx.fillStyle = 'rgba(0,0,0,.10)';
            ctx.fillRect(sx, sy + TILE - 5, TILE, 5);
          } else if (covered.has(x + ',' + y)) {
            // a real building will be drawn over this
            if (isCity) {
              if (!A0.tileDraw(ctx, 'pave', sx, sy, TILE, hash)) {
                ctx.fillStyle = groundBase; ctx.fillRect(sx, sy, TILE, TILE);
              }
            } else {
              A0.grassTile(ctx, sx, sy, TILE, x, y);
            }
          } else { // city street facade (borders of hub maps)
            ctx.fillStyle = '#9a8874';
            ctx.fillRect(sx, sy, TILE, TILE);
            ctx.strokeStyle = 'rgba(0,0,0,.08)'; ctx.lineWidth = 1;
            for (let yy = 6; yy < TILE; yy += 7) {
              ctx.beginPath(); ctx.moveTo(sx, sy + yy); ctx.lineTo(sx + TILE, sy + yy); ctx.stroke();
            }
            if (hash % 5 === 0 && g[y - 1] && g[y - 1][x] === '#') {
              ctx.fillStyle = nightWin ? '#f0d489' : '#8fa4ae';
              ctx.fillRect(sx + 9, sy + 8, 9, 11);
              ctx.strokeStyle = '#e8e0d0'; ctx.strokeRect(sx + 8, sy + 7, 11, 13);
            }
            if (g[y + 1] && g[y + 1][x] !== '#') { // roofline meets street
              ctx.fillStyle = 'rgba(0,0,0,.16)';
              ctx.fillRect(sx, sy + TILE - 5, TILE, 5);
            }
          }
          continue;
        }

        // ground: FoMT checker grass & NYC asphalt are procedural;
        // everything else comes from the atlas (flat-color fallback)
        let usedAtlas = false;
        const grassy = isOut && !isCity &&
          ('.TchXNokyjFVu'.includes(ch) || 'ACBMGSRLHQ'.includes(ch));
        if (ch === '*' || ch === '&') {
          A0.rooftops(ctx, sx, sy, TILE, x, y, ch === '*' ? 'manhattan' : 'queens', nightWin);
          usedAtlas = true;
        } else if (ch === 'r') {
          A0.roadTile(ctx, sx, sy, TILE, x, y, g);
          usedAtlas = true;
        } else if (ch === 'w') {
          A0.pierTile(ctx, sx, sy, TILE, y);
          usedAtlas = true;
        } else if (grassy) {
          A0.grassTile(ctx, sx, sy, TILE, x, y);
          usedAtlas = true;
        } else {
          let atlasName = null;
          if (!isOut) atlasName = 'wood';
          else if (ch === '~') atlasName = 'water';
          else if (ch === '-') atlasName = 'path';
          else if (ch === '_' || ch === 'P' || ch === 'D' || ch === 'l') atlasName = 'pave';
          else if (ch === 's' || ch === 'g') atlasName = 'soil';
          else atlasName = 'pave';
          usedAtlas = A0.tileDraw(ctx, atlasName, sx, sy, TILE, hash);
        }
        // the season repaints the ground: golden fall, snowed-in winter
        if (isOut && ch !== '~') {
          if (state.time.seasonIndex === 2) {
            ctx.fillStyle = 'rgba(205,145,55,.14)';
            ctx.fillRect(sx, sy, TILE, TILE);
          } else if (state.time.seasonIndex === 3) {
            ctx.fillStyle = 'rgba(238,243,247,.55)';
            ctx.fillRect(sx, sy, TILE, TILE);
            if (hash % 4 === 0) { // drifted clumps
              ctx.fillStyle = 'rgba(250,252,255,.8)';
              ctx.beginPath();
              ctx.ellipse(sx + (hash % 5) * 6 + 5, sy + (hash % 3) * 9 + 7, 7, 4, 0, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
        if (!usedAtlas) {
          let base = isOut ? (TC[ch] || groundBase) : INTERIOR_FLOOR;
          if (!isOut && TC[ch] && ch !== '.') base = INTERIOR_FLOOR;
          ctx.fillStyle = base;
          ctx.fillRect(sx, sy, TILE, TILE);
          if (!isOut) { // fallback plank lines
            ctx.strokeStyle = 'rgba(120,95,70,.13)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(sx, sy + TILE / 2); ctx.lineTo(sx + TILE, sy + TILE / 2); ctx.stroke();
          }
        }

        if (ch === '.' && isOut && !isCity) { // grass with life in it
          if (!usedAtlas && hash < 26) { // mottled darker patch
            ctx.fillStyle = 'rgba(70,110,60,.18)';
            ctx.fillRect(sx + (hash % 4) * 6, sy + (hash % 3) * 8, 14, 12);
          }
          if (!usedAtlas && hash % 9 === 0) { // grass tuft
            ctx.strokeStyle = 'rgba(60,100,50,.5)'; ctx.lineWidth = 1.3; ctx.lineCap = 'round';
            const tx = sx + 8 + (hash % 5) * 3, ty = sy + 12 + (hash % 4) * 4;
            ctx.beginPath(); ctx.moveTo(tx, ty + 5); ctx.lineTo(tx - 2, ty); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(tx + 2, ty + 5); ctx.lineTo(tx + 3, ty - 1); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(tx + 1, ty + 5); ctx.lineTo(tx + 1, ty + 1); ctx.stroke();
          }
          if (hash === 43 || hash === 77) { // wildflower
            const fx = sx + 10 + (hash % 7) * 2, fy = sy + 10 + (hash % 5) * 3;
            ctx.fillStyle = hash === 43 ? '#e8e0d0' : '#e8c96b';
            for (let p = 0; p < 4; p++) {
              const a = p / 4 * Math.PI * 2;
              ctx.beginPath(); ctx.arc(fx + Math.cos(a) * 2.2, fy + Math.sin(a) * 2.2, 1.5, 0, Math.PI * 2); ctx.fill();
            }
            ctx.fillStyle = '#c9861e';
            ctx.beginPath(); ctx.arc(fx, fy, 1.3, 0, Math.PI * 2); ctx.fill();
          }
        }

        if (ch === '~') {
          const depth = (g[y - 1] && g[y - 1][x] !== '~') ? 0 : 1;
          ctx.fillStyle = depth ? 'rgba(20,40,70,.14)' : 'rgba(255,255,255,.05)';
          ctx.fillRect(sx, sy, TILE, TILE);
          if (depth === 0) { // shoreline foam
            ctx.fillStyle = 'rgba(235,245,250,.7)';
            const ph = Math.sin(state.animT / 700 + x) * 2;
            ctx.fillRect(sx, sy + 1 + ph * .4, TILE, 2);
            ctx.fillStyle = 'rgba(235,245,250,.25)';
            ctx.fillRect(sx, sy + 4 + ph, TILE, 1.5);
          }
          ctx.fillStyle = 'rgba(255,255,255,.10)';
          if ((x + y + Math.floor(state.animT / 40)) % 5 === 0) ctx.fillRect(sx + 4, sy + TILE / 2, TILE - 8, 2);
        }

        if (ch === '-' || ch === '_') { // paths: soft edges where they meet other ground
          ctx.fillStyle = 'rgba(255,255,255,.05)';
          if (hash % 7 === 0) ctx.fillRect(sx + (hash % 5) * 5, sy + (hash % 3) * 9, 6, 5);
          const edge = 'rgba(90,70,50,.22)';
          ctx.fillStyle = edge;
          if (g[y - 1] && g[y - 1][x] !== ch && g[y - 1][x] !== '#') ctx.fillRect(sx, sy, TILE, 2);
          if (g[y + 1] && g[y + 1][x] !== ch && g[y + 1][x] !== '#') ctx.fillRect(sx, sy + TILE - 2, TILE, 2);
          if (g[y][x - 1] !== ch && g[y][x - 1] !== '#') ctx.fillRect(sx, sy, 2, TILE);
          if (g[y][x + 1] !== ch && g[y][x + 1] !== '#') ctx.fillRect(sx + TILE - 2, sy, 2, TILE);
        }
        if (ch === 'F') {
          if (!A0.tileDraw(ctx, 'fence', sx, sy, TILE, 0)) {
            ctx.fillStyle = '#6e5741';
            ctx.fillRect(sx + TILE/2 - 2, sy + 4, 4, TILE - 8);
            ctx.fillRect(sx, sy + TILE/2 - 2, TILE, 4);
          }
        }
        if (ch === 'P') CS.art.tramPlatform(ctx, sx, sy, TILE);
        if (ch === 's' || ch === 'g') {
          ctx.fillStyle = 'rgba(0,0,0,.10)';
          ctx.fillRect(sx + 2, sy + 2, TILE - 4, TILE - 4);
          CS.game.drawPlot(ctx, scene, x, y, sx, sy, TILE);
        }
        // flat interior fittings & entities (tall props go into the y-sorted pass)
        const A = CS.art;
        const night = state.time.minutes >= 1140 || state.time.minutes < 390;
        switch (ch) {
          case 'T': entities.push({ b: (y + 1) * TILE, d: () => A.tree(ctx, sx, sy, TILE, x * 31 + y * 17, state.time.seasonIndex) }); break;
          case 'c': entities.push({ b: (y + 1) * TILE, d: () => A.cherryTree(ctx, sx, sy, TILE, x * 31 + y * 17, state.time.seasonIndex) }); break;
          case 'i': entities.push({ b: (y + 1) * TILE, d: () => A.lighthouse(ctx, sx, sy, TILE) }); break;
          case 'l': entities.push({ b: (y + 1) * TILE, d: () => A.lantern(ctx, sx, sy, TILE, state.animT) }); break;
          case 'k': entities.push({ b: (y + 1) * TILE, d: () => A.stall(ctx, sx, sy, TILE, !!(CS.game.currentFestival && CS.game.currentFestival())) }); break;
          case 'h': entities.push({ b: (y + 1) * TILE, d: () => A.bench(ctx, sx, sy, TILE) }); break;
          case 'X': entities.push({ b: (y + 1) * TILE, d: () => A.bin(ctx, sx, sy, TILE) }); break;
          case 'N': entities.push({ b: (y + 1) * TILE, d: () => A.board(ctx, sx, sy, TILE) }); break;
          case 'o': A.planter(ctx, sx, sy, TILE); break;
          case 'y': entities.push({ b: (y + 1) * TILE, d: () => A.streetlight(ctx, sx, sy, TILE, nightWin) }); break;
          case 'V':
            if (g[y][x - 1] !== 'V') entities.push({ b: (y + 1) * TILE, d: () => A.subwayEntrance(ctx, sx, sy, TILE) });
            break;
          case 'w':
            if (g[y][x - 1] !== 'w') { // boat moored just south of the pier
              entities.push({ b: (y + 3) * TILE, d: () => A.ferryBoat(ctx, sx - TILE * .4, sy + TILE * 1.1, TILE, state.animT) });
            }
            break;
          case 'u':
            entities.push({ b: (y + 1) * TILE, d: () => A.ruin(ctx, sx, sy, TILE) });
            break;
          case 'j': entities.push({ b: (y + 1) * TILE, d: () => A.hydrant(ctx, sx, sy, TILE) }); break;
          case 'E': A.doorMat(ctx, sx, sy, TILE); break;
          case 'K': A.stove(ctx, sx, sy, TILE); break;
          case 'W': if (!A.tileDraw(ctx, 'winarch', sx, sy, TILE, 0)) A.windowTile(ctx, sx, sy, TILE, night, state.weather.today === 'rain'); break;
          case 't': A.table(ctx, sx, sy, TILE); break;
          case '=': if (!A.tileDraw(ctx, 'shelf', sx, sy, TILE, hash)) A.shelf(ctx, sx, sy, TILE); break;
          case 'O': if (!A.tileDraw(ctx, 'oven', sx, sy, TILE, 0)) A.oven(ctx, sx, sy, TILE); break;
          case 'd': if (!A.tileDraw(ctx, 'display', sx, sy, TILE, 0)) A.display(ctx, sx, sy, TILE); break;
          case 'U': if (!A.tileDraw(ctx, 'counter', sx, sy, TILE, 0)) A.counter(ctx, sx, sy, TILE); break;
          case 'b': {
            const isTop = E.tileAt(scene, x, y - 1) !== 'b';
            if (!A.tileDraw(ctx, isTop ? 'bedtop' : 'bedbot', sx, sy, TILE, 0)) {
              A.bed(ctx, sx, sy, TILE, isTop ? 0 : 1);
            }
            break;
          }
          case 'q': {
            const S = CS.game.state();
            if (!(S && S.pet && S.pet.type === 'fish')) A.aquariumShelf(ctx, sx, sy, TILE);
            break;
          }
        }
        if ('ACBMGSRLHDQ'.includes(ch) && isOut) doorTiles.push([x, y, ch]);
      }
    }


    // buildings join the y-sorted pass (baseline = their footprint's bottom
    // edge), each drawing its own doors on the ground floor
    const specs = CS.BUILDINGS && CS.BUILDINGS[scene];
    if (specs) {
      for (const b of specs) {
        const bx = b.x * TILE - E.camX, by = b.y * TILE - E.camY;
        if (bx > E.viewW || by > E.viewH + TILE * 2 || bx + b.w * TILE < 0 || by + b.h * TILE < -TILE * 2) continue;
        const myDoors = doorTiles.filter(([tx2, ty2]) =>
          tx2 >= b.x && tx2 < b.x + b.w && ty2 >= b.y && ty2 < b.y + b.h);
        entities.push({ b: (b.y + b.h) * TILE, d: () => {
          A0.building(ctx, bx, by, b.w * TILE, b.h * TILE, b, TILE, nightWin);
          for (const [tx2, , ch2] of myDoors) {
            A0.doorOut(ctx, tx2 * TILE - E.camX, (b.y + b.h - 1) * TILE - E.camY, TILE, DOOR_ACCENT[ch2]);
          }
        }});
      }
    }

    // world-state decorations: construction fencing / the new waterfront
    if (scene === 'outdoor' && state.flags.construction) {
      for (let bx = 8; bx <= 26; bx += 3) CS.art.barrier(ctx, bx * TILE - E.camX, 52 * TILE - E.camY, TILE);
    }
    if (scene === 'outdoor' && state.flags.newWaterfront) {
      for (let bx = 8; bx <= 26; bx += 5) CS.art.planter(ctx, bx * TILE - E.camX, 53 * TILE - E.camY, TILE);
    }

    // pet, family, NPCs, and the player all join the y-sorted pass —
    // walking behind a tree or a building now hides you, like it should
    if (state.petRT && state.petRT.scene === scene) {
      entities.push({ b: state.petRT.py + TILE, d: () => CS.game.drawPet(ctx, scene, E.camX, E.camY, TILE, state.animT) });
    }
    if (state.family && scene === 'apartment') {
      const fy = state.family.stage === 'baby' ? 2 : 6;
      entities.push({ b: fy * TILE, d: () => CS.game.drawFamily(ctx, scene, E.camX, E.camY, TILE, state.animT) });
    }
    for (const id of Object.keys(state.npcRT)) {
      const rt = state.npcRT[id];
      if (rt.scene !== scene) continue;
      entities.push({ b: rt.py + TILE, d: () =>
        CS.art.character(ctx, rt.px - E.camX, rt.py - E.camY, TILE, CS.NPCS[id].look, state.animT, rt.moving, rt.facing) });
    }
    entities.push({ b: p.py + TILE, pl: true, d: () =>
      CS.art.character(ctx, p.px - E.camX, p.py - E.camY, TILE, E.resolveLook(state.player.look), state.animT, p.path.length > 0, p.facing) });

    entities.sort((a, b2) => a.b - b2.b || (a.pl ? 1 : 0) - (b2.pl ? 1 : 0));
    for (const e of entities) e.d();

    // labels
    if (map.labels) {
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      for (const L of map.labels) {
        if (L.ifFlag && !state.flags[L.ifFlag]) continue;
        if (L.ifNotFlag && state.flags[L.ifNotFlag]) continue;
        const sx = L.x * TILE - E.camX, sy = L.y * TILE - E.camY + TILE / 2;
        ctx.fillStyle = 'rgba(20,26,32,.55)';
        const w = ctx.measureText(L.text).width;
        ctx.beginPath(); ctx.roundRect(sx - 5, sy - 10, w + 10, 20, 8); ctx.fill();
        ctx.fillStyle = '#f7efe2';
        ctx.fillText(L.text, sx, sy + 1);
      }
    }

    // the tramway crosses the west channel, over everything (real routing)
    if (scene === 'outdoor') {
      A0.tramway(ctx,
        7 * TILE - E.camX, 44 * TILE - E.camY,
        -2 * TILE - E.camX, 44.5 * TILE - E.camY, state.animT);
    }
    // the Queensboro-style bridge passes overhead, island humming beneath it
    if (scene === 'outdoor') {
      A0.bridgeOver(ctx, -E.camX, -E.camY, TILE, nightWin);
    }

    // Pride bunting hangs over everything on Main Street
    const fest = CS.game.currentFestival && CS.game.currentFestival();
    if (fest && fest.key === 'pride' && scene === 'outdoor') {
      for (let by = 20; by <= 40; by += 4) {
        CS.art.bunting(ctx, 15 * TILE - E.camX, by * TILE - E.camY, TILE, by);
      }
    }

    // NPC name tags float above the sorted world
    for (const id of Object.keys(state.npcRT)) {
      const rt = state.npcRT[id];
      if (rt.scene !== scene) continue;
      const dx = Math.abs(rt.x - p.x), dy = Math.abs(rt.y - p.y);
      if (dx + dy <= 3) {
        ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
        const nx = rt.px - E.camX + TILE / 2, ny = rt.py - E.camY - 14;
        ctx.fillStyle = 'rgba(20,26,32,.6)';
        const w = ctx.measureText(CS.NPCS[id].name).width;
        ctx.beginPath(); ctx.roundRect(nx - w / 2 - 5, ny - 9, w + 10, 16, 7); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle';
        ctx.fillText(CS.NPCS[id].name, nx, ny);
      }
    }

    // target marker
    if (p.marker && p.markerT > 0) {
      const mx = p.marker[0] * TILE - E.camX + TILE / 2, my = p.marker[1] * TILE - E.camY + TILE / 2;
      ctx.strokeStyle = `rgba(255,255,255,${p.markerT / 30 * .8})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(mx, my, 10 + (30 - p.markerT) * .3, 0, Math.PI * 2); ctx.stroke();
    }

    // weather overlay
    if (isOut && state.weather.today === 'rain') drawRain(state.animT);
    if (isOut && state.weather.today === 'snow') drawSnow(state.animT);
    if (isOut && state.weather.today === 'cloudy') {
      ctx.fillStyle = 'rgba(90,100,115,.10)'; ctx.fillRect(0, 0, E.viewW, E.viewH);
    }
    // night tint
    const m = state.time.minutes;
    let dark = 0;
    if (m >= 1140) dark = Math.min(.45, (m - 1140) / 240 * .45);       // 7pm → 11pm
    else if (m < 390) dark = .35;
    if (dark > 0) {
      ctx.fillStyle = `rgba(16,24,48,${dark})`;
      ctx.fillRect(0, 0, E.viewW, E.viewH);
    }
  };

  let snowFlakes = null;
  function drawSnow(t) {
    if (!snowFlakes) {
      snowFlakes = [];
      for (let i = 0; i < 70; i++) snowFlakes.push([Math.random(), Math.random(), .4 + Math.random(), Math.random() * 6]);
    }
    ctx.fillStyle = 'rgba(245,248,252,.85)';
    for (const f of snowFlakes) {
      const x = ((f[0] * E.viewW) + Math.sin(t / 900 + f[3]) * 24) % E.viewW;
      const y = ((f[1] * E.viewH) + t * 0.035 * f[2]) % E.viewH;
      ctx.beginPath(); ctx.arc((x + E.viewW) % E.viewW, y, 1.2 + f[2], 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = 'rgba(210,225,240,.10)'; ctx.fillRect(0, 0, E.viewW, E.viewH);
  }

  let rainDrops = null;
  function drawRain(t) {
    if (!rainDrops) {
      rainDrops = [];
      for (let i = 0; i < 90; i++) rainDrops.push([Math.random(), Math.random(), .5 + Math.random()]);
    }
    ctx.strokeStyle = 'rgba(190,215,235,.5)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (const d of rainDrops) {
      const x = ((d[0] * E.viewW) + t * 0.02 * d[2] * 30) % E.viewW;
      const y = ((d[1] * E.viewH) + t * 0.25 * d[2]) % E.viewH;
      ctx.moveTo(x, y); ctx.lineTo(x - 2, y + 9);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(70,90,110,.12)'; ctx.fillRect(0, 0, E.viewW, E.viewH);
  }

  // player look is stored as palette indices; resolve to concrete colors
  E.resolveLook = function (look) {
    return {
      skin: CS.SKINS[look.skin], hair: CS.HAIRS[look.hair],
      style: look.hairStyle, outfit: CS.OUTFITS[look.outfit],
    };
  };

  E.drawPlayerPreview = function (cnv, look) {
    const c = cnv.getContext('2d');
    c.clearRect(0, 0, cnv.width, cnv.height);
    c.save();
    c.translate(cnv.width / 2, cnv.height / 2 + 8);
    c.scale(2.1, 2.1);
    c.translate(-TILE / 2, -TILE / 2);
    CS.art.character(c, 0, 0, TILE, E.resolveLook(look), 0, false);
    c.restore();
  };

  E.TILE = TILE;
})();
