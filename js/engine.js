/* =========================================================================
   Concrete Seasons — engine.js
   Canvas renderer, camera, grid pathfinding (BFS), input handling.
   ========================================================================= */
(function () {
  const E = CS.engine = {};
  const TILE = 34;

  let canvas, ctx, dpr = 1;
  E.viewW = 0; E.viewH = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    E.viewW = canvas.clientWidth; E.viewH = canvas.clientHeight;
    canvas.width = E.viewW * dpr; canvas.height = E.viewH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  E.init = function () {
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
    'A': '#6e5741', 'C': '#6e5741', 'B': '#6e5741', 'M': '#6e5741', 'G': '#88a89b', 'E': '#b09a7d',
    'K': '#d8cfc0', 'b': '#d8cfc0', 't': '#d8cfc0', 'W': '#d8cfc0', '=': '#d8cfc0',
    'O': '#d8cfc0', 'd': '#d8cfc0', 'U': '#d8cfc0', 'q': '#d8cfc0',
  };

  const INTERIOR_FLOOR = '#e6d9bf';
  // exterior door accent per building
  const DOOR_ACCENT = { A:'#8a5a3b', C:'#5c8a6f', B:'#b07a2a', M:'#4a6fa5', G:'#88a89b' };

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

    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const ch = g[y][x];
        const sx = x * TILE - E.camX, sy = y * TILE - E.camY;
        let base = isOut ? (TC[ch] || '#7fae6d') : (ch === '#' ? '#8d7a68' : INTERIOR_FLOOR);
        if (!isOut && TC[ch] && ch !== '.' && ch !== '#') base = INTERIOR_FLOOR;
        ctx.fillStyle = base;
        ctx.fillRect(sx, sy, TILE, TILE);

        // subtle grass texture
        if (ch === '.' && isOut && ((x * 7 + y * 13) % 11 === 0)) {
          ctx.fillStyle = 'rgba(255,255,255,.06)';
          ctx.fillRect(sx + 6, sy + 6, 3, 3);
        }
        if (ch === '~') {
          ctx.fillStyle = 'rgba(255,255,255,.10)';
          if ((x + y + Math.floor(state.animT / 40)) % 5 === 0) ctx.fillRect(sx + 4, sy + TILE / 2, TILE - 8, 2);
        }
        if (ch === '-' ) {
          ctx.fillStyle = 'rgba(0,0,0,.05)';
          ctx.fillRect(sx, sy, TILE, 2);
        }
        if (ch === '#') { // building block shading
          ctx.fillStyle = 'rgba(0,0,0,.12)';
          ctx.fillRect(sx, sy + TILE - 6, TILE, 6);
          ctx.fillStyle = 'rgba(255,255,255,.08)';
          ctx.fillRect(sx, sy, TILE, 4);
        }
        if (ch === 'F') {
          ctx.fillStyle = '#6e5741';
          ctx.fillRect(sx + TILE/2 - 2, sy + 4, 4, TILE - 8);
          ctx.fillRect(sx, sy + TILE/2 - 2, TILE, 4);
        }
        if (ch === 'P') CS.art.tramPlatform(ctx, sx, sy, TILE);
        if (ch === 's' || ch === 'g') {
          ctx.fillStyle = 'rgba(0,0,0,.10)';
          ctx.fillRect(sx + 2, sy + 2, TILE - 4, TILE - 4);
          CS.game.drawPlot(ctx, scene, x, y, sx, sy, TILE);
        }
        // drawn decorations (all vector, see art.js)
        const A = CS.art;
        const night = state.time.minutes >= 1140 || state.time.minutes < 390;
        switch (ch) {
          case 'T': A.tree(ctx, sx, sy, TILE, x * 31 + y * 17); break;
          case 'h': A.bench(ctx, sx, sy, TILE); break;
          case 'X': A.bin(ctx, sx, sy, TILE); break;
          case 'N': A.board(ctx, sx, sy, TILE); break;
          case 'o': A.planter(ctx, sx, sy, TILE); break;
          case 'E': A.doorMat(ctx, sx, sy, TILE); break;
          case 'K': A.stove(ctx, sx, sy, TILE); break;
          case 'W': A.windowTile(ctx, sx, sy, TILE, night, state.weather.today === 'rain'); break;
          case 't': A.table(ctx, sx, sy, TILE); break;
          case '=': A.shelf(ctx, sx, sy, TILE); break;
          case 'O': A.oven(ctx, sx, sy, TILE); break;
          case 'd': A.display(ctx, sx, sy, TILE); break;
          case 'U': A.counter(ctx, sx, sy, TILE); break;
          case 'b': A.bed(ctx, sx, sy, TILE, E.tileAt(scene, x, y - 1) === 'b' ? 1 : 0); break;
          case 'q': {
            const S = CS.game.state();
            if (!(S && S.pet && S.pet.type === 'fish')) A.aquariumShelf(ctx, sx, sy, TILE);
            break;
          }
        }
        if ('ACBMG'.includes(ch) && isOut) A.doorOut(ctx, sx, sy, TILE, DOOR_ACCENT[ch]);
      }
    }

    // labels
    if (map.labels) {
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      for (const L of map.labels) {
        const sx = L.x * TILE - E.camX, sy = L.y * TILE - E.camY + TILE / 2;
        ctx.fillStyle = 'rgba(20,26,32,.55)';
        const w = ctx.measureText(L.text).width;
        ctx.beginPath(); ctx.roundRect(sx - 5, sy - 10, w + 10, 20, 8); ctx.fill();
        ctx.fillStyle = '#f7efe2';
        ctx.fillText(L.text, sx, sy + 1);
      }
    }

    // pet (drawn under characters)
    CS.game.drawPet(ctx, scene, E.camX, E.camY, TILE, state.animT);

    // NPCs
    for (const id of Object.keys(state.npcRT)) {
      const rt = state.npcRT[id];
      if (rt.scene !== scene) continue;
      CS.art.character(ctx, rt.px - E.camX, rt.py - E.camY, TILE, CS.NPCS[id].look, state.animT, rt.moving);
      // name tag if player nearby
      const dx = Math.abs(rt.x - p.x), dy = Math.abs(rt.y - p.y);
      if (dx + dy <= 3) {
        ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
        const nx = rt.px - E.camX + TILE / 2, ny = rt.py - E.camY - 8;
        ctx.fillStyle = 'rgba(20,26,32,.6)';
        const w = ctx.measureText(CS.NPCS[id].name).width;
        ctx.beginPath(); ctx.roundRect(nx - w / 2 - 5, ny - 9, w + 10, 16, 7); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle';
        ctx.fillText(CS.NPCS[id].name, nx, ny);
      }
    }

    // player
    CS.art.character(ctx, p.px - E.camX, p.py - E.camY, TILE, E.resolveLook(state.player.look), state.animT, p.path.length > 0);

    // target marker
    if (p.marker && p.markerT > 0) {
      const mx = p.marker[0] * TILE - E.camX + TILE / 2, my = p.marker[1] * TILE - E.camY + TILE / 2;
      ctx.strokeStyle = `rgba(255,255,255,${p.markerT / 30 * .8})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(mx, my, 10 + (30 - p.markerT) * .3, 0, Math.PI * 2); ctx.stroke();
    }

    // weather overlay
    if (isOut && state.weather.today === 'rain') drawRain(state.animT);
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
