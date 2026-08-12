/* =========================================================================
   Concrete Seasons — game.js
   Game state, time/weather, farming, NPC simulation, relationships,
   events, pets, economy, save/load. All local & offline.
   ========================================================================= */
(function () {
  const G = CS.game = {};
  const E = () => CS.engine;
  let S = null; // active state
  G.state = () => S;

  /* ================= state factory ================= */
  G.newState = function (player, slot) {
    return {
      saveVersion: CS.SAVE_VERSION,
      slot,
      player: Object.assign({
        money: CS.START_MONEY, energy: 100,
        scene: 'apartment', x: 5, y: 4,
      }, player),
      time: { year: 1, seasonIndex: 0, day: 1, minutes: 540, weekdayIndex: 0 },
      weather: { today: 'sunny', tomorrow: rollWeather() },
      farm: { plots: {} },      // "scene:x,y" -> {tilled, crop, days, watered}
      inv: { lettuce_seed: 0, radish_seed: 2 },
      npcs: {},                 // id -> {met, fam, friend, talkedToday}
      pet: null,
      flags: {},
      discoveries: [],
      shipped: {},              // cropId -> count
      totalEarned: 0,
      settings: { speed: 1 },
    };
  };

  /* ================= boot a loaded/new state ================= */
  G.start = function (state) {
    S = state;
    // ---- migrations & Phase-2 defaults (works for v1 saves too) ----
    S.saveVersion = CS.SAVE_VERSION;
    S.player.pref = S.player.pref || 'discover';
    S.phone = S.phone || {};              // npcId/'hp' -> {msgs:[{from,text,day}], unread, repliedDay}
    S.couples = S.couples || [];          // [[a,b], ...]
    S.pairMomentum = S.pairMomentum || {};
    S.recipes = S.recipes || ['meal_salad', 'meal_roast'];
    S.thrift = S.thrift || null;          // {day, items:[{id, price, sold}]}
    for (const id of Object.keys(CS.NPCS)) {
      S.npcs[id] = Object.assign(
        { met: false, fam: 0, friend: 0, talkedToday: false, attraction: 0, romance: null, giftedDay: -1 },
        S.npcs[id] || {});
    }
    // the map grew in v2 — rescue positions/plots saved against the old layout
    const mapOf = sc => CS.MAPS[sc] && CS.MAPS[sc].grid;
    const tileOf = (sc, x, y) => { const g = mapOf(sc); return g && g[y] && g[y][x] || '#'; };
    if (!CS.WALKABLE.has(tileOf(S.player.scene, S.player.x, S.player.y))) {
      S.player.scene = 'apartment'; S.player.x = 5; S.player.y = 4;
    }
    for (const key of Object.keys(S.farm.plots)) {
      const [sc, xy] = key.split(':');
      const [x, y] = xy.split(',').map(Number);
      const t = tileOf(sc, x, y);
      if (t !== 's' && t !== 'g') delete S.farm.plots[key];
    }
    S.animT = 0;
    S.playerRT = {
      scene: S.player.scene, x: S.player.x, y: S.player.y,
      px: S.player.x * E().TILE, py: S.player.y * E().TILE,
      path: [], pendingAction: null, marker: null, markerT: 0,
    };
    S.npcRT = {};
    S.petRT = null;
    refreshNPCs(true);
    refreshPetRT(true);
    CS.ui.refreshHUD();
    CS.ui.showSceneLabel(CS.MAPS[S.playerRT.scene].name);
    checkEvents('enter');
    if (!S.flags.intro) runIntro();
  };

  /* ================= main tick (called from rAF) ================= */
  let msAcc = 0;
  const MS_PER_GAME_MIN = 700;
  G.tick = function (dt) {
    if (!S) return;
    S.animT += dt;
    movePlayer(dt);
    moveNPCs(dt);
    tickPet(dt);
    if (CS.ui.blocking() || S.flags.timeFrozen) return;
    msAcc += dt * (S.settings.speed || 1);
    while (msAcc >= MS_PER_GAME_MIN) {
      msAcc -= MS_PER_GAME_MIN;
      advanceMinute();
    }
  };

  function advanceMinute() {
    S.time.minutes += 1;
    if (S.time.minutes % 10 === 0) { refreshNPCs(); CS.ui.refreshHUD(); }
    if (S.time.minutes >= CS.DAY_END) {
      CS.ui.narrate("You can barely keep your eyes open... You stumble home and collapse into bed.", () => {
        G.sleep(true);
      });
      return;
    }
    checkEvents('time');
  }

  /* ================= time & calendar ================= */
  G.totalDay = () => (S.time.year - 1) * 120 + S.time.seasonIndex * 30 + (S.time.day - 1);
  G.weekdayIndex = () => G.totalDay() % 7;

  G.clockText = function () {
    let m = S.time.minutes % 1440;
    const h24 = Math.floor(m / 60), mm = String(m % 60).padStart(2, '0');
    const h12 = ((h24 + 11) % 12) + 1;
    return `${h12}:${mm} ${h24 < 12 || h24 >= 24 ? 'AM' : 'PM'}`;
  };
  G.dateText = () => `${CS.SEASONS[S.time.seasonIndex]} ${S.time.day} · ${CS.WEEKDAYS[S.time.weekdayIndex]}`;

  function rollWeather() {
    const table = CS.WEATHER_TABLE[0];
    let r = Math.random();
    for (const [w, p] of table) { if ((r -= p) <= 0) return w; }
    return 'sunny';
  }

  G.sleep = function (passedOut, early) {
    // advance day
    S.time.day += 1;
    let seasonChanged = false;
    if (S.time.day > 30) {
      S.time.day = 1; seasonChanged = true;
      S.time.seasonIndex = (S.time.seasonIndex + 1) % 4;
      if (S.time.seasonIndex === 0) S.time.year += 1;
    }
    S.time.weekdayIndex = G.weekdayIndex();
    S.time.minutes = passedOut ? 480 : (early ? 315 : 390);
    S.player.energy = passedOut ? 65 : 100;
    S.weather.today = S.weather.tomorrow;
    S.weather.tomorrow = rollWeather();

    // crops grow; out-of-season outdoor plants wilt at the turn of the season
    for (const key of Object.keys(S.farm.plots)) {
      const pl = S.farm.plots[key];
      const indoor = key.startsWith('greenhouse');
      if (pl.crop && !pl.dead) {
        if (seasonChanged && !indoor && CS.CROPS[pl.crop].season !== S.time.seasonIndex) {
          pl.dead = true;
          continue;
        }
        if (pl.watered || indoor || S.weather.today === 'rain' && !indoor) pl.days += 1;
        pl.watered = false;
        if (!indoor && S.weather.today === 'rain') pl.watered = true; // rain pre-waters today
      }
    }
    if (seasonChanged) {
      CS.ui.toast(`${CS.SEASONS[S.time.seasonIndex]} begins.`);
      G.addMsg('hp', `${CS.SEASONS[S.time.seasonIndex]} has arrived in Harbor Point. The market has new seeds.`);
    }

    // ---- NPC↔NPC life (weekly, Mondays) ----
    if (S.time.weekdayIndex === 0) simulatePairs();

    // ---- phone: morning texts ----
    generateTexts();
    // daily resets
    for (const id of Object.keys(S.npcs)) S.npcs[id].talkedToday = false;
    if (S.pet) { S.pet.fedToday = false; S.pet.walkedToday = false; }

    // rent on Mondays (from week 2)
    if (S.time.weekdayIndex === 0 && G.totalDay() >= 7) {
      S.player.money = Math.max(0, S.player.money - CS.RENT);
      CS.ui.toast(`Rent paid: -$${CS.RENT}`, 'money');
    }

    // wake up in apartment
    S.playerRT.scene = 'apartment';
    setPlayerTile(5, 4);
    refreshNPCs(true);
    refreshPetRT(true);
    G.saveToSlot(S.slot);
    CS.ui.refreshHUD();
    CS.ui.showSceneLabel(`${CS.SEASONS[S.time.seasonIndex]} ${S.time.day} — ${CS.WEEKDAYS[S.time.weekdayIndex]}`);
    CS.ui.toast(`Autosaved · ${S.weather.today}`);
    const unread = G.unreadTotal();
    if (unread > 0) CS.ui.toast(`${unread} new message${unread > 1 ? 's' : ''} on your phone`);

    if (isPlayerBirthday()) {
      CS.ui.toast(`It's your birthday, ${S.player.name}!`);
      discover('your_birthday_' + S.time.year, `Your birthday (${CS.SEASONS[S.time.seasonIndex]} ${S.time.day}), Year ${S.time.year}. ${S.pet ? S.pet.name + ' celebrated by existing nearby.' : ''}`);
    }
    if (S.weather.today === 'rain' && !S.flags.firstRain) {
      S.flags.firstRain = true;
      CS.ui.toast('Rain today — outdoor plots water themselves.');
      discover('first_rain', 'First rainy day. The farm waters itself; the neighborhood moves indoors. Worth remembering.');
    }
    checkEvents('wake');
  };

  function isPlayerBirthday() {
    return S.time.seasonIndex === S.player.birthSeason && S.time.day === S.player.birthDay;
  }
  G.isPlayerBirthday = isPlayerBirthday;

  /* NPC↔NPC romance: momentum accrues weekly for compatible pairs, invisibly.
     The player only ever sees the resulting behavior. */
  function simulatePairs() {
    for (const [a, b, compat] of CS.NPC_PAIRS) {
      const inCoupleAlready = coupleOf(a) || coupleOf(b);
      const datingPlayer = S.npcs[a].romance === 'seeing' || S.npcs[b].romance === 'seeing';
      if (inCoupleAlready || datingPlayer) continue;
      const k = a + '+' + b;
      S.pairMomentum[k] = (S.pairMomentum[k] || 0) + (0.4 + Math.random() * 0.6) * compat * 10;
      if (S.pairMomentum[k] >= 30) {
        S.couples.push([a, b]);
        S.flags.pendingGossip = [a, b];
      }
    }
    // rare breakups; history keeps momentum from instantly re-forming
    S.couples = S.couples.filter(([a, b]) => {
      if (Math.random() < 0.03) { S.pairMomentum[a + '+' + b] = 5; return false; }
      return true;
    });
  }

  function generateTexts() {
    // gossip about a new couple, from whichever friend would absolutely text you this
    if (S.flags.pendingGossip) {
      const [a, b] = S.flags.pendingGossip;
      const teller = Object.keys(CS.NPCS)
        .filter(id => id !== a && id !== b && S.npcs[id].hasNumber && G.tierOf(id) >= 2)
        .sort((x, y) => S.npcs[y].friend - S.npcs[x].friend)[0];
      if (teller) {
        G.addMsg(teller, `ok not to gossip BUT. ${CS.NPCS[a].name.split(' ')[0]} and ${CS.NPCS[b].name.split(' ')[0]} were at the bar last night looking extremely Together. you heard it here first`);
        S.flags.pendingGossip = null;
      }
    }
    for (const id of Object.keys(CS.NPCS)) {
      const r = S.npcs[id];
      if (!r.hasNumber || !CS.MESSAGES[id]) continue;
      const M = CS.MESSAGES[id];
      if (isPlayerBirthday() && G.tierOf(id) >= 2 && Math.random() < .8) {
        G.addMsg(id, `Happy birthday, ${S.player.name}!!`);
        continue;
      }
      if (r.romance === 'seeing' && M.partner && M.partner.length && Math.random() < .5) {
        G.addMsg(id, M.partner[Math.floor(Math.random() * M.partner.length)]);
        continue;
      }
      let chance = G.tierOf(id) >= 3 ? .3 : .12;
      if (id === 'jordan') chance = .06; // famously bad texter
      if (M.casual && M.casual.length && Math.random() < chance) {
        G.addMsg(id, M.casual[Math.floor(Math.random() * M.casual.length)]);
      }
    }
    // neighborhood announcements
    const today = G.festivalToday();
    if (today) G.addMsg('hp', CS.ANNOUNCEMENTS.festivalDay(today));
    for (const key of Object.keys(CS.FESTIVALS)) {
      const f = CS.FESTIVALS[key];
      if (S.time.seasonIndex === f.season && S.time.day + 1 === f.day) {
        G.addMsg('hp', CS.ANNOUNCEMENTS.festivalEve(f));
      }
    }
  }

  /* ================= player movement ================= */
  function setPlayerTile(x, y) {
    const p = S.playerRT;
    p.x = x; p.y = y; p.px = x * E().TILE; p.py = y * E().TILE; p.path = [];
  }

  G.handleTap = function (tx, ty) {
    const p = S.playerRT;
    const scene = p.scene;
    const ch = E().tileAt(scene, tx, ty);
    p.marker = [tx, ty]; p.markerT = 30;

    // NPC tapped?
    for (const id of Object.keys(S.npcRT)) {
      const rt = S.npcRT[id];
      if (rt.scene === scene && rt.x === tx && rt.y === ty) {
        walkToAdjacent(tx, ty, () => G.talkTo(id));
        return;
      }
    }
    // pet tapped?
    if (S.petRT && S.petRT.scene === scene && S.petRT.x === tx && S.petRT.y === ty) {
      walkToAdjacent(tx, ty, () => G.interactPet());
      return;
    }

    const interactable = interactionFor(scene, tx, ty, ch);
    if (interactable) {
      if (CS.WALKABLE.has(ch)) walkTo(tx, ty, interactable);
      else walkToAdjacent(tx, ty, interactable);
      return;
    }
    if (CS.WALKABLE.has(ch)) walkTo(tx, ty, null);
  };

  function walkTo(tx, ty, action) {
    const p = S.playerRT;
    const path = E().findPath(p.scene, p.x, p.y, tx, ty);
    if (!path) return;
    if (path.length === 0) { if (action) action(); return; } // already standing there
    p.path = path; p.pendingAction = action;
  }
  function walkToAdjacent(tx, ty, action) {
    const p = S.playerRT;
    if (Math.abs(p.x - tx) + Math.abs(p.y - ty) <= 1) { if (action) action(); return; }
    const adj = E().adjacentWalkable(p.scene, tx, ty, p.x, p.y);
    if (!adj) return;
    const path = E().findPath(p.scene, p.x, p.y, adj[0], adj[1]);
    if (path) { p.path = path; p.pendingAction = action; }
  }

  G.stepPlayer = function ([dx, dy]) {
    const p = S.playerRT;
    if (p.path.length) return;
    const nx = p.x + dx, ny = p.y + dy;
    if (E().walkable(p.scene, nx, ny)) { p.path = [[nx, ny]]; p.pendingAction = null; }
  };

  function movePlayer(dt) {
    const p = S.playerRT;
    if (p.markerT > 0) p.markerT -= dt / 16;
    if (!p.path.length) return;
    const [tx, ty] = p.path[0];
    const speed = 0.16 * dt; // px per ms
    const gx = tx * E().TILE, gy = ty * E().TILE;
    const dx = gx - p.px, dy = gy - p.py;
    const dist = Math.hypot(dx, dy);
    if (dist <= speed) {
      p.px = gx; p.py = gy; p.x = tx; p.y = ty;
      p.path.shift();
      onTileEnter(tx, ty);
      if (!p.path.length && p.pendingAction) {
        const a = p.pendingAction; p.pendingAction = null;
        if (typeof a === 'function') a();
      }
    } else {
      p.px += dx / dist * speed; p.py += dy / dist * speed;
    }
  }

  function onTileEnter(x, y) {
    const p = S.playerRT;
    const map = CS.MAPS[p.scene];
    const ch = E().tileAt(p.scene, x, y);
    // outdoor door → interior
    if (map.outdoor && map.doors[ch]) {
      enterScene(map.doors[ch]);
      return;
    }
    // interior exit
    if (ch === 'E' && map.exitTo) {
      const spawn = CS.MAPS[map.exitTo].doorSpawns[map.exitKey];
      enterScene(map.exitTo, spawn[0], spawn[1]);
      return;
    }
    checkEvents('enter');
  }

  function enterScene(scene, x, y) {
    const p = S.playerRT;
    p.scene = scene;
    if (x === undefined) { [x, y] = CS.INTERIOR_SPAWNS[scene]; }
    setPlayerTile(x, y);
    p.pendingAction = null;
    refreshNPCs(true);
    refreshPetRT(true);
    CS.ui.showSceneLabel(CS.MAPS[scene].name);
    checkEvents('enter');
  }
  G.enterScene = enterScene;

  /* ================= interactions ================= */
  function interactionFor(scene, x, y, ch) {
    if (scene === 'apartment') {
      if (ch === 'b') return () => promptSleep();
      if (ch === 'K') return () => openCooking();
      if (ch === 'W') return () => CS.ui.narrate(windowFlavor());
      if (ch === 'q') return () => S.pet && S.pet.type === 'fish'
        ? G.interactPet()
        : CS.ui.narrate("A sturdy shelf by the wall. An aquarium would look great here.");
    }
    if (ch === 'U') {
      if (scene === 'cafe') return () => CS.ui.buyPrompt('coffee', 4, 'Juniper pour-over. +18 energy.');
      if (scene === 'bakery') return () => CS.ui.buyPrompt('bread', 6, "Grace's sesame roll. +25 energy.");
      if (scene === 'market') return () => CS.ui.openShop();
      if (scene === 'thrift') return () => CS.ui.openThrift();
      if (scene === 'bar') return () => barMenu();
    }
    if (ch === 'X') return () => CS.ui.openSell();
    if (ch === 'N') return () => noticeboard(scene);
    if (ch === 'k') return () => {
      const fest = G.currentFestival();
      if (fest && fest.key === 'night_market') CS.ui.openSell(1.5, 'Night Market Stall');
      else CS.ui.narrate("An empty market stall. On festival nights, Main Street lights up and these come alive.");
    };
    if (ch === 'i') return () => CS.ui.narrate("The old lighthouse. Decommissioned for decades, still the most reliable thing on the island. Locals say if you're here at the right moment, you'll understand why people stay.");
    if (ch === 'P') return () => CS.ui.narrate("The tram sways off toward Manhattan. Trips into the city open up once you know more people. For now, Harbor Point is plenty.");
    if (ch === 'h') return () => CS.ui.narrate("You sit for a moment. The river doesn't care about anyone's schedule. It's the most relaxing thing in New York.");
    if (ch === 's' || ch === 'g') return () => farmAction(scene, x, y);
    return null;
  }

  function barMenu() {
    CS.ui.choose("The Anchor. Wood polished by decades of elbows.", [
      { label: 'Seltzer with lime — $3 (+8 energy)', fn: () => buyEnergy(3, 8, 'Crisp. Bubbly. Judgment-free.') },
      { label: 'Bar snacks — $6 (+15 energy)', fn: () => buyEnergy(6, 15, 'Salty enough to justify another seltzer.') },
      { label: 'Just soaking it in', fn: () => {} },
    ]);
  }
  function buyEnergy(price, energy, flavor) {
    if (S.player.money < price) { CS.ui.toast('Not enough money.'); return; }
    S.player.money -= price;
    S.player.energy = Math.min(100, S.player.energy + energy);
    CS.ui.refreshHUD();
    CS.ui.narrate(flavor);
  }

  function openCooking() {
    const cookable = S.recipes.map(rid => {
      const rec = CS.RECIPES[rid];
      const have = Object.keys(rec.needs).every(ing => (S.inv[ing] || 0) >= rec.needs[ing]);
      const needsTxt = Object.keys(rec.needs).map(ing => `${rec.needs[ing]}× ${CS.ITEMS[ing].name}`).join(', ');
      return { rid, rec, have, needsTxt };
    });
    if (!cookable.length) { CS.ui.narrate("You don't know any recipes yet. People teach the good ones."); return; }
    CS.ui.pick('Cook what?', cookable.map(c => ({
      icon: c.rid, name: CS.ITEMS[c.rid].name + (c.have ? '' : ' (missing ingredients)'),
      desc: `Needs: ${c.needsTxt}`,
      fn: () => {
        if (!c.have) { CS.ui.toast('Missing ingredients'); return; }
        for (const ing of Object.keys(c.rec.needs)) G.removeItem(ing, c.rec.needs[ing]);
        G.addItem(c.rid, 1);
        CS.ui.toast(`Cooked ${CS.ITEMS[c.rid].name}`);
        if (!S.flags.firstCook) {
          S.flags.firstCook = true;
          discover('first_cook', `First meal cooked in the studio: ${CS.ITEMS[c.rid].name}. The radiator hissed approvingly.`);
        }
      },
    })));
  }

  function windowFlavor() {
    const opts = [
      "Manhattan glitters across the river like it's showing off. It is.",
      "A tugboat pushes upriver. Somebody's window AC drips onto the sidewalk. Home noises.",
      "You can just see the community farm from here. Your plot. Still feels strange to say.",
    ];
    if (S.weather.today === 'rain') return "Rain streaks the glass. The skyline smudges into watercolor. Not a bad day to be inside — or to let the rain water the farm for you.";
    return opts[Math.floor(Math.random() * opts.length)];
  }

  G.interactNearby = function () {
    const p = S.playerRT;
    // NPC adjacent?
    for (const id of Object.keys(S.npcRT)) {
      const rt = S.npcRT[id];
      if (rt.scene === p.scene && Math.abs(rt.x - p.x) + Math.abs(rt.y - p.y) <= 1) { G.talkTo(id); return; }
    }
    if (S.petRT && S.petRT.scene === p.scene && Math.abs(S.petRT.x - p.x) + Math.abs(S.petRT.y - p.y) <= 1) { G.interactPet(); return; }
    for (const [dx, dy] of [[0,0],[0,1],[0,-1],[1,0],[-1,0]]) {
      const x = p.x + dx, y = p.y + dy;
      const act = interactionFor(p.scene, x, y, E().tileAt(p.scene, x, y));
      if (act) { act(); return; }
    }
  };

  function promptSleep() {
    const opts = [
      { label: 'Sleep until morning (6:30 AM)', fn: () => G.sleep(false) },
      { label: 'Set an early alarm (5:15 AM)', fn: () => G.sleep(false, true) },
      { label: 'Stay up', fn: () => {} },
    ];
    CS.ui.choose('Call it a day?', opts);
  }

  function noticeboard(scene) {
    if (scene === 'harbor_house') {
      CS.ui.narrate("Harbor House bulletin: after-school program schedules, a redevelopment community-input flyer (Priya's handwriting), and a sign-up sheet for the next neighborhood picnic.");
      return;
    }
    if (!S.pet && S.flags.gardenIntro && G.totalDay() >= 2) {
      CS.ui.choose("Community noticeboard. A flyer catches your eye: 'HARBOR POINT RESCUE — adoption weekend! Cats, dogs & a very confused tank of fish need homes.'", [
        { label: 'Adopt a cat', fn: () => adoptPet('cat') },
        { label: 'Adopt a dog', fn: () => adoptPet('dog') },
        { label: 'Take home a fish (with tank)', fn: () => adoptPet('fish') },
        { label: 'Not today', fn: () => {} },
      ]);
      return;
    }
    const notes = [
      "Flyers: tram schedule changes, a lost scarf ('sentimental value!!'), and Malik's watering rota — your name is already on it.",
      "Someone posted: 'Whoever is growing tulips by the greenhouse — the corner of 3rd smells amazing. Thank you.'",
      "Community farm noticeboard. Half neighborhood news, half passive-aggressive notes about compost.",
    ];
    if (S.pet) { CS.ui.narrate(notes[Math.floor(Math.random() * notes.length)]); return; }
    CS.ui.narrate(notes[0]);
  }

  /* ================= farming ================= */
  const plotKey = (scene, x, y) => `${scene}:${x},${y}`;

  function farmAction(scene, x, y) {
    const key = plotKey(scene, x, y);
    const pl = S.farm.plots[key];
    const P = S.player;

    if (!pl || !pl.tilled) {
      if (!spendEnergy(CS.COSTS.till)) return;
      S.farm.plots[key] = { tilled: true, crop: null, days: 0, watered: false };
      CS.ui.toast('Tilled the soil');
      return;
    }
    if (pl.dead) {
      pl.crop = null; pl.dead = false; pl.days = 0;
      CS.ui.toast('Cleared the wilted plant');
      return;
    }
    if (!pl.crop) {
      const inSeason = k => scene === 'greenhouse' || CS.CROPS[CS.ITEMS[k].crop].season === S.time.seasonIndex;
      const seeds = Object.keys(S.inv).filter(k => CS.ITEMS[k] && CS.ITEMS[k].type === 'seed' && S.inv[k] > 0 && inSeason(k));
      if (!seeds.length) {
        const offSeason = Object.keys(S.inv).some(k => CS.ITEMS[k] && CS.ITEMS[k].type === 'seed' && S.inv[k] > 0);
        CS.ui.narrate(offSeason
          ? "Your seeds are out of season for outdoor planting. The greenhouse doesn't care about seasons, though."
          : "Tilled and ready — but you're out of seeds. The Corner Market sells them.");
        return;
      }
      CS.ui.pick('Plant what?', seeds.map(sd => ({
        icon: sd, name: `${CS.ITEMS[sd].name} ×${S.inv[sd]}`, desc: CS.ITEMS[sd].desc,
        fn: () => {
          if (!spendEnergy(CS.COSTS.plant)) return;
          S.inv[sd] -= 1; if (S.inv[sd] <= 0) delete S.inv[sd];
          pl.crop = CS.ITEMS[sd].crop; pl.days = 0;
          pl.watered = (scene !== 'greenhouse' && S.weather.today === 'rain');
          CS.ui.toast(`Planted ${CS.CROPS[pl.crop].name}`);
        },
      })));
      return;
    }
    const def = CS.CROPS[pl.crop];
    if (pl.days >= def.days) {
      if (!spendEnergy(CS.COSTS.harvest)) return;
      G.addItem(pl.crop, 1);
      CS.ui.toast(`Harvested ${def.name}!`);
      if (def.regrow > 0) { pl.days = def.days - def.regrow; }
      else { pl.crop = null; pl.days = 0; }
      if (!S.flags.firstHarvest) {
        S.flags.firstHarvest = true;
        discover('first_harvest', `First harvest: ${def.name}, Year 1 ${CS.SEASONS[S.time.seasonIndex]} ${S.time.day}. Grown on a rooftop of dirt in the middle of the East River.`);
      }
      return;
    }
    if (scene === 'greenhouse') { CS.ui.narrate(`${def.name} — day ${pl.days}/${def.days}. The greenhouse keeps it watered.`); return; }
    if (!pl.watered) {
      if (!spendEnergy(CS.COSTS.water)) return;
      pl.watered = true;
      CS.ui.toast('Watered');
      return;
    }
    CS.ui.narrate(`${def.name} — day ${pl.days} of ${def.days}. Watered and doing its quiet vegetable thing.`);
  }

  G.drawPlot = function (ctx, scene, x, y, sx, sy, T) {
    const pl = S && S.farm.plots[plotKey(scene, x, y)];
    if (!pl || !pl.tilled) {
      // untilled: rough soil dots
      ctx.fillStyle = 'rgba(0,0,0,.15)';
      ctx.fillRect(sx + 8, sy + 10, 4, 3); ctx.fillRect(sx + 18, sy + 20, 4, 3);
      return;
    }
    ctx.fillStyle = pl.watered ? '#5e4430' : '#7a5a3e';
    ctx.fillRect(sx + 3, sy + 3, T - 6, T - 6);
    ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.strokeRect(sx + 3, sy + 3, T - 6, T - 6);
    if (pl.crop) {
      CS.art.crop(ctx, pl.crop, Math.min(1, pl.days / CS.CROPS[pl.crop].days), sx, sy, T, pl.dead);
    }
  };

  function spendEnergy(n) {
    if (S.player.energy < n) {
      CS.ui.narrate("You're exhausted. Eat something, grab a coffee, or sleep it off.");
      return false;
    }
    S.player.energy -= n;
    CS.ui.refreshHUD();
    return true;
  }
  G.spendEnergy = spendEnergy;

  G.addItem = function (id, n) {
    S.inv[id] = (S.inv[id] || 0) + n;
  };
  G.removeItem = function (id, n) {
    if ((S.inv[id] || 0) < n) return false;
    S.inv[id] -= n; if (S.inv[id] <= 0) delete S.inv[id];
    return true;
  };
  G.sellItem = function (id, n, mult) {
    const def = CS.ITEMS[id];
    if (!def || !def.sell || !G.removeItem(id, n)) return;
    const amt = Math.round(def.sell * n * (mult || 1));
    S.player.money += amt;
    S.totalEarned += amt;
    S.shipped[id] = (S.shipped[id] || 0) + n;
    CS.ui.toast(`Sold ${n} × ${def.name} for $${amt}`, 'money');
    CS.ui.refreshHUD();
  };
  G.buyItem = function (id, price) {
    if (S.player.money < price) { CS.ui.toast("Not enough money."); return false; }
    S.player.money -= price;
    G.addItem(id, 1);
    CS.ui.refreshHUD();
    return true;
  };
  G.eatItem = function (id) {
    const def = CS.ITEMS[id];
    if (!def || !def.energy) return;
    if (!G.removeItem(id, 1)) return;
    S.player.energy = Math.min(100, S.player.energy + def.energy);
    CS.ui.toast(`${def.name}: +${def.energy} energy`);
    CS.ui.refreshHUD();
  };

  /* ================= NPC simulation ================= */
  function scheduleFor(id) {
    const fn = CS.SCHEDULES[id];
    return fn ? fn(S) : [{ until: 9999, at: null, act: '' }];
  }
  function currentBlock(id) {
    const blocks = scheduleFor(id);
    const m = S.time.minutes;
    for (const b of blocks) if (m < b.until) return b;
    return blocks[blocks.length - 1];
  }

  /* ---- festivals ---- */
  G.currentFestival = function () {
    if (!S) return null;
    for (const key of Object.keys(CS.FESTIVALS)) {
      const f = CS.FESTIVALS[key];
      if (S.time.seasonIndex === f.season && S.time.day === f.day
          && S.time.minutes >= f.start && S.time.minutes < f.end) return { key, ...f };
    }
    return null;
  };
  G.festivalToday = function () {
    for (const key of Object.keys(CS.FESTIVALS)) {
      const f = CS.FESTIVALS[key];
      if (S.time.seasonIndex === f.season && S.time.day === f.day) return { key, ...f };
    }
    return null;
  };

  const FESTIVAL_SPOTS = {
    cherry: ['lawn_a', 'lawn_b', 'lawn_c', 'lawn_d', 'lawn_e', 'lighthouse_park'],
    night_market: ['stall_a', 'stall_b', 'mainstreet', 'mainstreet_b'],
  };
  const COUPLE_SPOTS = ['cafe_table_b', 'waterfront_b', 'bar_table']; // rotates by weekday

  function coupleOf(id) {
    for (const [a, b] of S.couples) { if (a === id) return b; if (b === id) return a; }
    return null;
  }
  G.coupleOf = coupleOf;

  G.npcStatus = function (id) {
    const npc = CS.NPCS[id];
    // festival override: everyone (except staff who ARE the festival backdrop) attends
    const fest = G.currentFestival();
    if (fest && !npc.decorative) {
      const spots = FESTIVAL_SPOTS[fest.key];
      const idx = Object.keys(CS.NPCS).indexOf(id) % spots.length;
      return { spot: CS.SPOTS[spots[idx]], act: `at the ${fest.name}` };
    }
    const b = currentBlock(id);
    // couple co-location: evenings together (only when both would be free/visible-ish)
    const partner = coupleOf(id);
    if (partner && S.time.minutes >= 1140 && S.time.minutes < 1290) {
      const spotName = COUPLE_SPOTS[S.time.weekdayIndex % COUPLE_SPOTS.length];
      return { spot: CS.SPOTS[spotName], act: `out with ${CS.NPCS[partner].name.split(' ')[0]}` };
    }
    if (partner && (S.time.weekdayIndex >= 5) && S.time.minutes >= 780 && S.time.minutes < 900) {
      return { spot: CS.SPOTS.lighthouse_park, act: `a slow afternoon with ${CS.NPCS[partner].name.split(' ')[0]}` };
    }
    return { spot: b.at ? CS.SPOTS[b.at] : null, act: b.act };
  };

  function refreshNPCs(force) {
    for (const id of Object.keys(CS.NPCS)) {
      const st = G.npcStatus(id);
      const rt = S.npcRT[id];
      if (!st.spot) { delete S.npcRT[id]; continue; }
      const { scene, x, y } = st.spot;
      if (!rt || force || rt.targetKey !== `${scene}:${x},${y}`) {
        // NPC "arrives": if player in same scene & npc already there, walk; else place
        if (rt && rt.scene === scene && !force) {
          rt.walkTo = [x, y];
          rt.targetKey = `${scene}:${x},${y}`;
        } else {
          S.npcRT[id] = {
            scene, x, y, px: x * E().TILE, py: y * E().TILE,
            targetKey: `${scene}:${x},${y}`, walkTo: null, moving: false, wanderT: 2000 + Math.random() * 6000,
          };
        }
      }
    }
  }
  G.refreshNPCs = refreshNPCs;

  function moveNPCs(dt) {
    for (const id of Object.keys(S.npcRT)) {
      const rt = S.npcRT[id];
      // occasional idle wander
      rt.wanderT -= dt;
      if (!rt.walkTo && rt.wanderT <= 0) {
        rt.wanderT = 4000 + Math.random() * 8000;
        const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
        const d = dirs[Math.floor(Math.random() * 4)];
        const nx = rt.x + d[0], ny = rt.y + d[1];
        const home = rt.targetKey.split(':')[1].split(',').map(Number);
        if (E().walkable(rt.scene, nx, ny) && Math.abs(nx - home[0]) <= 1 && Math.abs(ny - home[1]) <= 1) {
          rt.walkTo = [nx, ny];
        }
      }
      if (rt.walkTo) {
        const [tx, ty] = rt.walkTo;
        const gx = tx * E().TILE, gy = ty * E().TILE;
        const speed = 0.07 * dt;
        const dx = gx - rt.px, dy = gy - rt.py;
        const dist = Math.hypot(dx, dy);
        rt.moving = true;
        if (dist <= speed) { rt.px = gx; rt.py = gy; rt.x = tx; rt.y = ty; rt.walkTo = null; rt.moving = false; }
        else { rt.px += dx / dist * speed; rt.py += dy / dist * speed; }
      }
    }
  }

  /* ================= relationships & dialogue ================= */
  G.tierOf = function (id) {
    const r = S.npcs[id];
    if (!r.met) return 0;
    if (r.friend >= 120) return 4;
    if (r.friend >= 60) return 3;
    if (r.friend >= 20 && r.fam >= 3) return 2;
    if (r.fam >= 1) return 1;
    return 0;
  };

  function prefAllows(npcGender) {
    const p = S.player.pref;
    if (p === 'none') return false;
    if (p === 'M') return npcGender === 'M';
    if (p === 'W') return npcGender === 'F';
    return true; // 'MW' or 'discover'
  }
  function canFlirt(id) {
    const npc = CS.NPCS[id], r = S.npcs[id];
    return !npc.decorative && npc.rom && npc.rom.includes(S.player.gender)
      && prefAllows(npc.gender) && !coupleOf(id) && r.romance !== 'seeing' && G.tierOf(id) >= 2;
  }
  function canAskOut(id) {
    const r = S.npcs[id];
    return canFlirt(id) && r.attraction >= 25 && r.friend >= 60;
  }

  G.talkTo = function (id) {
    const npc = CS.NPCS[id];
    const r = S.npcs[id];
    const D = CS.DIALOGUE[id];
    if (!r.met) {
      r.met = true; r.fam = 1;
      if (!npc.decorative) r.friend += 5;
      CS.ui.dialogue(npc, [D.intro], () => {
        discover('met_' + id, `Met ${npc.name}. ${npc.bio}`);
        checkEvents('talk', id);
      });
      return;
    }
    // interaction menu
    const opts = [{ label: 'Talk', fn: () => doTalk(id) }];
    const giftables = Object.keys(S.inv).filter(k => S.inv[k] > 0 && CS.ITEMS[k] && CS.ITEMS[k].type !== 'seed');
    if (!npc.decorative && r.giftedDay !== G.totalDay() && giftables.length) {
      opts.push({ label: 'Give a gift', fn: () => giftPicker(id) });
    }
    if (canAskOut(id)) opts.push({ label: 'Ask them out', fn: () => askOut(id) });
    else if (canFlirt(id)) opts.push({ label: 'Flirt', fn: () => flirt(id) });
    if (id === 'joan' && canWorkShift()) opts.push({ label: 'Help with the morning rush ($45)', fn: () => workShift() });
    opts.push({ label: 'Never mind', fn: () => {} });
    const status = r.romance === 'seeing' ? 'seeing each other' : G.npcStatus(id).act;
    CS.ui.choose(`${npc.name} — ${status}`, opts);
  };

  function doTalk(id) {
    const npc = CS.NPCS[id];
    const r = S.npcs[id];
    r.fam += 1;
    if (!r.talkedToday && !npc.decorative) { r.friend += 8; r.talkedToday = true; }
    // festival warmth: first chat with each person at a festival is worth more
    const fest = G.currentFestival();
    if (fest && r.festDay !== G.totalDay()) { r.festDay = G.totalDay(); r.friend += 5; }
    // exchanging numbers at Acquaintance
    if (!r.hasNumber && G.tierOf(id) >= 2 && CS.MESSAGES[id]) {
      r.hasNumber = true;
      G.addMsg(id, CS.MESSAGES[id].hello);
      CS.ui.toast(`${npc.name.split(' ')[0]} texted you — you have their number now`);
    }
    const line = pickLine(id);
    CS.ui.dialogue(npc, [line], () => checkEvents('talk', id));
  }

  function giftPicker(id) {
    const npc = CS.NPCS[id];
    const giftables = Object.keys(S.inv).filter(k => S.inv[k] > 0 && CS.ITEMS[k] && CS.ITEMS[k].type !== 'seed');
    CS.ui.pick(`Give ${npc.name.split(' ')[0]} what?`, giftables.map(k => ({
      icon: k, name: CS.ITEMS[k].name, desc: CS.ITEMS[k].desc,
      fn: () => {
        const r = S.npcs[id];
        G.removeItem(k, 1);
        r.giftedDay = G.totalDay();
        let gain = 5, react;
        const first = npc.name.split(' ')[0];
        if ((npc.loved || []).includes(k)) {
          gain = 22;
          react = `${first}'s whole face changes. "Okay — you actually get me. Thank you." That one landed.`;
        } else if ((npc.liked || []).includes(k)) {
          gain = 12;
          react = `"Oh — that's really thoughtful." ${first} means it.`;
        } else {
          react = `${first} accepts it with the polite warmth of a good neighbor.`;
        }
        r.friend += gain;
        if (r.romance === 'seeing' || r.attraction > 0) r.attraction += Math.floor(gain / 3);
        CS.ui.narrate(react);
      },
    })));
  }

  function flirt(id) {
    const npc = CS.NPCS[id], r = S.npcs[id];
    const first = npc.name.split(' ')[0];
    const gain = 5 + G.tierOf(id) * 2;
    r.attraction += gain;
    r.friend += 2;
    const lines = r.attraction >= 25 ? [
      `${first} holds your gaze a beat longer than necessary. Neither of you mentions it. Both of you noticed.`,
      `There's a smile ${first} does that you're starting to suspect is just for you.`,
    ] : [
      `${first} laughs — a real one. "Smooth. Keep practicing."`,
      `A little awkward. A little charming. ${first} files it away with a smile.`,
    ];
    CS.ui.narrate(lines[Math.floor(Math.random() * lines.length)]);
  }

  function askOut(id) {
    const npc = CS.NPCS[id], r = S.npcs[id];
    const first = npc.name.split(' ')[0];
    r.romance = 'seeing';
    r.attraction += 10;
    discover('seeing_' + id, `You and ${npc.name} are seeing each other. It started at ${CS.MAPS[S.playerRT.scene].name}, ${CS.SEASONS[S.time.seasonIndex]} ${S.time.day}.`);
    CS.ui.dialogue(npc, [
      `You ask. The pause is only a second, but you'll remember it. Then ${first} smiles: "Yeah. I'd like that. I was starting to wonder if you'd ever ask."`,
    ]);
  }

  function canWorkShift() {
    const wd = S.time.weekdayIndex;
    return wd <= 4 && S.time.minutes >= 420 && S.time.minutes < 600 && !S.flags['shift' + G.totalDay()];
  }
  function workShift() {
    if (!G.spendEnergy(25)) return;
    S.flags['shift' + G.totalDay()] = true;
    S.time.minutes += 180;
    S.player.money += 45;
    refreshNPCs(true);
    CS.ui.refreshHUD();
    CS.ui.narrate("Three hours of steaming milk, calling names, and learning who orders what. Joan nods at the end — high praise. You made $45 and about forty micro-acquaintances.");
  }

  /* ---- phone ---- */
  function thread(id) {
    S.phone[id] = S.phone[id] || { msgs: [], unread: 0, repliedDay: -1 };
    return S.phone[id];
  }
  G.addMsg = function (id, text) {
    const t = thread(id);
    t.msgs.push({ text, day: G.totalDay() });
    if (t.msgs.length > 40) t.msgs.splice(0, t.msgs.length - 40);
    t.unread += 1;
  };
  G.unreadTotal = () => S ? Object.values(S.phone).reduce((n, t) => n + (t.unread || 0), 0) : 0;
  G.markRead = (id) => { thread(id).unread = 0; };
  G.replyTo = function (id) {
    const t = thread(id);
    if (t.repliedDay === G.totalDay()) return false;
    t.repliedDay = G.totalDay();
    if (S.npcs[id]) S.npcs[id].friend += 2;
    return true;
  };

  function pickLine(id) {
    const tier = G.tierOf(id);
    const m = S.time.minutes;
    const r = S.npcs[id];
    // festivals color everyone's small talk
    const fest = G.currentFestival();
    if (fest && CS.FESTIVAL_LINES && CS.FESTIVAL_LINES[fest.key] && Math.random() < .5) {
      const fl = CS.FESTIVAL_LINES[fest.key];
      return fl[Math.floor(Math.random() * fl.length)];
    }
    const pools = CS.DIALOGUE[id].pools;
    let best = [], bestScore = -1;
    for (const pool of pools) {
      const c = pool.cond || {};
      let score = 0, ok = true;
      if (c.minTier !== undefined) { if (tier >= c.minTier) score += 2; else ok = false; }
      if (c.maxTier !== undefined) { if (tier <= c.maxTier) score += 1; else ok = false; }
      if (c.weather) { if (S.weather.today === c.weather) score += 3; else ok = false; }
      if (c.before !== undefined) { if (m < c.before) score += 3; else ok = false; }
      if (c.after !== undefined) { if (m >= c.after) score += 3; else ok = false; }
      if (c.birthday) { if (isPlayerBirthday()) score += 10; else ok = false; }
      if (c.seeing) { if (r.romance === 'seeing') score += 8; else ok = false; }
      if (!ok) continue;
      if (score > bestScore) { bestScore = score; best = [...pool.lines]; }
      else if (score === bestScore) best.push(...pool.lines);
    }
    if (!best.length) best = ["..."];
    return best[Math.floor(Math.random() * best.length)];
  }

  /* ================= pets ================= */
  function adoptPet(type) {
    const def = CS.PET_TYPES[type];
    const pers = def.personalities[Math.floor(Math.random() * def.personalities.length)];
    const fur = def.furs[Math.floor(Math.random() * def.furs.length)];
    CS.ui.textInput(`A ${pers} ${type} it is! What's their name?`, (name) => {
      if (!name) name = type === 'fish' ? 'Bubbles' : type === 'cat' ? 'Miso' : 'Bagel';
      S.pet = { type, name, personality: pers, fur, affection: 10, fedToday: false, walkedToday: false, adoptedDay: G.totalDay() };
      refreshPetRT(true);
      CS.ui.toast(`${name} is coming home with you!`);
      discover('pet_' + type, `Adopted ${name}, a ${pers} ${type}, from the Harbor Point rescue.${type === 'fish' ? ' Tank and all.' : ''}`);
      CS.ui.narrate(type === 'fish'
        ? `You carry the tank home very, very carefully. ${name} seems unbothered by the entire journey.`
        : `${name} ${type === 'cat' ? 'inspects the carrier with deep suspicion, then accepts it' : 'wags the whole way home'}. Your studio just got smaller and much better.`);
    });
  }

  function refreshPetRT(force) {
    if (!S || !S.pet) { if (S) S.petRT = null; return; }
    if (S.pet.type === 'fish') {
      S.petRT = { scene: 'apartment', x: 1, y: 6, px: 1 * E().TILE, py: 6 * E().TILE, fixed: true };
      return;
    }
    if (S.pet.type === 'cat') {
      if (!S.petRT || force || S.petRT.scene !== 'apartment') {
        const spot = CS.CAT_SPOTS[Math.floor(Math.random() * CS.CAT_SPOTS.length)];
        // cats sit on furniture; render position only, not pathing
        S.petRT = { scene: 'apartment', x: spot.x, y: spot.y, px: spot.x * E().TILE, py: spot.y * E().TILE, why: spot.why, moveT: 20000 + Math.random() * 30000, fixed: true };
      }
      return;
    }
    // dog: follows player when in apartment; waits by door otherwise
    if (!S.petRT || force) {
      S.petRT = { scene: 'apartment', x: 8, y: 5, px: 8 * E().TILE, py: 5 * E().TILE, follow: true };
    }
  }

  function tickPet(dt) {
    if (!S || !S.pet || !S.petRT) return;
    const rt = S.petRT;
    if (S.pet.type === 'cat') {
      rt.moveT -= dt;
      if (rt.moveT <= 0) refreshPetRT(true);
      return;
    }
    if (S.pet.type === 'dog') {
      const p = S.playerRT;
      if (p.scene === 'apartment' || (p.scene === 'outdoor' && S.pet.walkedToday)) {
        rt.scene = p.scene;
        const dist = Math.hypot(p.px - rt.px, p.py - rt.py);
        if (dist > E().TILE * 1.6) {
          const speed = 0.13 * dt;
          rt.px += (p.px - rt.px) / dist * speed;
          rt.py += (p.py - rt.py) / dist * speed;
          rt.x = Math.round(rt.px / E().TILE); rt.y = Math.round(rt.py / E().TILE);
        }
      }
    }
  }

  G.drawPet = function (ctx, scene, camX, camY, T, t) {
    if (!S || !S.pet || !S.petRT || S.petRT.scene !== scene) return;
    const rt = S.petRT;
    if (S.pet.type === 'fish') {
      CS.art.aquarium(ctx, rt.px - camX, rt.py - camY, T, t);
      return;
    }
    CS.art.pet(ctx, S.pet.type, S.pet.fur || '#8a6242', rt.px - camX, rt.py - camY, T, t);
  };

  G.interactPet = function () {
    const pet = S.pet;
    const def = CS.PET_TYPES[pet.type];
    const opts = [];
    if (!pet.fedToday && (S.inv.pet_food || 0) > 0) {
      opts.push({ label: `Feed ${pet.name}`, fn: () => {
        G.removeItem('pet_food', 1); pet.fedToday = true; pet.affection += 5;
        CS.ui.toast(`${pet.name} ${pet.type === 'fish' ? 'flutters happily' : 'demolishes dinner'}`);
      }});
    } else if (!pet.fedToday) {
      opts.push({ label: `Feed ${pet.name} (no pet food — Corner Market sells it)`, fn: () => {} });
    }
    if (pet.type !== 'fish') {
      opts.push({ label: `Pet ${pet.name}`, fn: () => {
        pet.affection += 2;
        const reactions = {
          cat: { affectionate: 'melts into a purring puddle', shy: 'allows it. Briefly. An honor', chaotic: 'bites you gently, which means love', independent: 'tolerates exactly four pats', curious: 'headbutts your hand for more', lazy: 'doesn\'t open an eye. Purrs anyway' },
          dog: { loyal: 'leans entire body weight against you', goofy: 'rolls over dramatically', gentle: 'rests chin in your palm', energetic: 'spins in a full circle first' },
        };
        CS.ui.narrate(`${pet.name} ${reactions[pet.type][pet.personality] || 'is happy'}.`);
      }});
    } else {
      opts.push({ label: `Watch the tank`, fn: () => {
        pet.affection += 1;
        CS.ui.narrate(`${pet.name} drifts between the plants. Five minutes disappear. Worth it.`);
      }});
    }
    if (pet.type === 'dog' && !pet.walkedToday && S.playerRT.scene === 'apartment') {
      opts.push({ label: `Take ${pet.name} for a walk`, fn: () => {
        pet.walkedToday = true; pet.affection += 4;
        enterScene('outdoor', 19, 7);
        CS.ui.toast(`${pet.name} trots along beside you`);
        if (!S.flags.dogWalkEvent && S.npcRT.malik) {
          S.flags.dogWalkEvent = true;
          setTimeout(() => CS.ui.narrate(`Malik spots ${pet.name} from across the path and lights up. "Now THAT'S a good hire for the farm. Official title: morale."`), 600);
        }
      }});
    }
    opts.push({ label: 'Leave them be', fn: () => {} });
    CS.ui.choose(`${pet.name} (${pet.personality} ${pet.type})${pet.type === 'cat' && S.petRT.why ? ' — ' + S.petRT.why : ''}`, opts);
  };

  /* ================= events ================= */
  function discover(id, text) {
    if (S.discoveries.some(d => d.id === id)) return;
    S.discoveries.push({ id, text, when: `Y${S.time.year} ${CS.SEASONS[S.time.seasonIndex]} ${S.time.day}` });
    CS.ui.toast('New journal entry');
  }
  G.discover = discover;

  function runIntro() {
    S.flags.intro = true;
    CS.ui.narrateSeq([
      `The last box is finally inside. Studio 3F, Harbor Point. The radiator hisses like it's introducing itself.`,
      `Out the window: the East River, the tram gliding past, Manhattan pretending not to notice you arrived.`,
      `On the counter, a note from the community board: "Welcome! Your garden plot is ready whenever you are. Come find me at the farm — Malik."`,
      `New York is enormous and doesn't know your name yet. This island might, eventually. Start with the farm — head out and follow the path north-east.`,
    ]);
  }

  function checkEvents(trigger, arg) {
    if (!S) return;
    const p = S.playerRT;
    const m = S.time.minutes;

    // Festival attendance — first time each year
    const fest = G.currentFestival();
    if (fest && !S.flags['fest_' + fest.key + '_' + S.time.year]) {
      const onSite = (fest.key === 'cherry' && p.scene === 'outdoor' && p.y >= 23)
                  || (fest.key === 'night_market' && p.scene === 'outdoor' && p.y >= 14 && p.y <= 20);
      if (onSite) {
        S.flags['fest_' + fest.key + '_' + S.time.year] = true;
        discover('fest_' + fest.key + '_' + S.time.year,
          fest.key === 'cherry'
            ? `Cherry Blossom Picnic, Year ${S.time.year}. The whole neighborhood on one lawn, petals in everyone's coffee.`
            : `Night Market, Year ${S.time.year}. Main Street under string lights, your produce selling at festival prices.`);
        CS.ui.toast(`${fest.name} — everyone's here`);
      }
    }

    // Garden introduction — first time entering the farm area
    if (trigger === 'enter' && !S.flags.gardenIntro && p.scene === 'outdoor'
        && p.x >= 38 && p.x <= 54 && p.y >= 2 && p.y <= 12) {
      S.flags.gardenIntro = true;
      const malikHere = !!S.npcRT.malik && S.npcRT.malik.scene === 'outdoor';
      S.npcs.malik.met = true; S.npcs.malik.fam = Math.max(1, S.npcs.malik.fam); S.npcs.malik.friend += 10;
      CS.ui.dialogueSeq(CS.NPCS.malik, [
        malikHere ? `"There you are! Malik Johnson." He shakes your hand like he's testing the build quality.` :
          `A man in a flat cap waves from the gate — he must have been waiting. "Malik Johnson. You made it."`,
        `"This plot's been empty two seasons. Soil's still good — I made sure of it. Tools are in the shed, and these are yours now."`,
        `He hands you a paper bag: lettuce seeds and a few radish. "Tap a tilled square to plant, water every day, and sell what you grow in that bin by the gate. Rain does the watering for you."`,
        `"One more thing — people here notice who shows up. Keep showing up." He tips the cap and goes back to his rows.`,
      ], () => {
        G.addItem('lettuce_seed', 4);
        G.addItem('radish_seed', 2);
        CS.ui.toast('Got 4 lettuce seeds & 2 radish seeds');
        discover('garden_intro', 'Malik handed over the community farm plot with a bag of seeds and one rule: keep showing up.');
      });
      return;
    }

    // First café visit
    if (trigger === 'enter' && !S.flags.cafeFirst && p.scene === 'cafe') {
      S.flags.cafeFirst = true;
      const present = ['maya', 'daniel', 'lena'].filter(id => S.npcRT[id] && S.npcRT[id].scene === 'cafe');
      const extra = present.length
        ? ` At a table, someone glances up from ${present[0] === 'lena' ? 'a laptop fortress' : 'a coffee'} and gives you the universal new-neighbor nod.`
        : '';
      CS.ui.narrate(`Juniper Café: plants in old tomato tins, a hand-drawn menu, the smell of good coffee doing its work.${extra} This feels like a place where the neighborhood happens.`, () => {
        discover('cafe_first', 'Found Juniper Café on Main Street. Regulars seem to rotate through on a schedule. Worth learning it.');
      });
      return;
    }

    // Hidden bakery morning — inside bakery before 6:00
    if (trigger === 'enter' && !S.flags.bakeryDawn && p.scene === 'bakery' && m < 390 && m >= 300) {
      S.flags.bakeryDawn = true;
      S.npcs.grace.met = true; S.npcs.grace.fam += 1; S.npcs.grace.friend += 15;
      CS.ui.dialogueSeq(CS.NPCS.grace, [
        `The door's unlocked even though the sign says CLOSED. Inside it's all warmth and flour dust. Grace doesn't even look up. "Either you're lost, or you're the type who finds things."`,
        `"First batch comes out at 5:42. Not 5:40, not 5:45. Twenty-two years." She slides a tray out — the smell is unreasonable.`,
        `She wraps a roll and puts it in your hands. "The 5:42 batch never reaches the shelf. It goes to whoever's awake enough to deserve it. Now you know."`,
      ], () => {
        G.addItem('warm_roll', 1);
        discover('bakery_542', "Moonrise Bakery's secret: the 5:42 AM batch, handed out before opening to whoever shows up. You were there.");
        CS.ui.toast('Got the 5:42 Roll');
      });
      return;
    }

    // Recipes are taught, not bought — friends share the good ones
    if (trigger === 'talk' && arg === 'grace' && G.tierOf('grace') >= 3 && !S.recipes.includes('meal_galette')) {
      S.recipes.push('meal_galette');
      CS.ui.dialogueSeq(CS.NPCS.grace, [
        `Grace looks at you a moment, then wipes her hands. "Come around the counter. If you're going to grow strawberries, you should know what they're for."`,
        `Fifteen minutes of flour, heat, and exactly zero written measurements later, you know how to make her galette. "Rustic on purpose," she says. "Remember that."`,
      ], () => {
        discover('recipe_galette', "Grace taught you the Moonrise strawberry galette. No written recipe exists. You are the written recipe now.");
        CS.ui.toast('Learned: Strawberry Galette');
      });
      return;
    }
    if (trigger === 'talk' && arg === 'nico' && G.tierOf('nico') >= 3 && !S.recipes.includes('meal_pasta')) {
      S.recipes.push('meal_pasta');
      CS.ui.dialogueSeq(CS.NPCS.nico, [
        `"Okay. OKAY. You've earned this." Nico looks around like his nonna might materialize. "The pomodoro. The real one. Basil goes in at the END. The end! People die on this hill."`,
        `He talks you through it twice, gesturing the whole time. "Grow the basil, make the sauce, think of Queens. That's the whole recipe."`,
      ], () => {
        discover('recipe_pasta', "Nico taught you the Bellini family pomodoro. Basil at the end. People die on this hill.");
        CS.ui.toast('Learned: Basil Pomodoro');
      });
      return;
    }

    // Birthday greetings when talking (handled in dialogue picker) + first-talk birthday toast
    if (trigger === 'talk' && isPlayerBirthday() && arg && !S.flags['bday_' + S.time.year + '_' + arg]) {
      S.flags['bday_' + S.time.year + '_' + arg] = true;
      if (G.tierOf(arg) >= 2) {
        S.npcs[arg].friend += 5;
      }
    }
  }

  /* ================= thrift (Second Life) ================= */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  G.getThrift = function () {
    const day = G.totalDay();
    if (!S.thrift || S.thrift.day !== day) {
      const rnd = mulberry32(day * 7919 + 13);
      const pool = [...CS.THRIFT_POOL];
      const items = [];
      for (let i = 0; i < 4 && pool.length; i++) {
        const idx = Math.floor(rnd() * pool.length);
        const [id, price] = pool.splice(idx, 1)[0];
        items.push({ id, price, sold: false });
      }
      S.thrift = { day, items };
    }
    return S.thrift;
  };
  G.buyThrift = function (i) {
    const t = G.getThrift();
    const it = t.items[i];
    if (!it || it.sold) return;
    if (S.player.money < it.price) { CS.ui.toast('Not enough money.'); return; }
    S.player.money -= it.price;
    it.sold = true;
    G.addItem(it.id, 1);
    CS.ui.refreshHUD();
    CS.ui.toast(`Bought ${CS.ITEMS[it.id].name}`);
    if (CS.ITEMS[it.id].rare && !S.flags['found_' + it.id]) {
      S.flags['found_' + it.id] = true;
      discover('found_' + it.id, `Second Life find: ${CS.ITEMS[it.id].name}. ${CS.ITEMS[it.id].desc} The good stuff surfaces when it surfaces.`);
    }
  };
  G.checkEvents = checkEvents;

  /* ================= save / load ================= */
  const SLOT_KEY = i => `concreteSeasons_slot${i}`;

  G.saveToSlot = function (slot) {
    if (!S) return;
    S.slot = slot;
    S.player.scene = S.playerRT.scene;
    S.player.x = S.playerRT.x;
    S.player.y = S.playerRT.y;
    const clean = {};
    for (const k of Object.keys(S)) {
      if (['playerRT', 'npcRT', 'petRT', 'animT'].includes(k)) continue;
      clean[k] = S[k];
    }
    try {
      localStorage.setItem(SLOT_KEY(slot), JSON.stringify(clean));
      return true;
    } catch (e) {
      CS.ui.toast('Save failed: ' + e.message);
      return false;
    }
  };

  G.loadSlot = function (slot) {
    const raw = localStorage.getItem(SLOT_KEY(slot));
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      if (typeof data.saveVersion !== 'number') return null;
      // future: migrations by version here
      return data;
    } catch (e) { return null; }
  };

  G.slotSummary = function (slot) {
    const d = G.loadSlot(slot);
    if (!d) return null;
    return {
      name: d.player.name,
      date: `${CS.SEASONS[d.time.seasonIndex]} ${d.time.day}, Year ${d.time.year}`,
      money: d.player.money,
      pet: d.pet ? d.pet.name : '',
    };
  };
  G.deleteSlot = function (slot) { localStorage.removeItem(SLOT_KEY(slot)); };

  /* ================= cheats ================= */
  G.cheat = function (raw) {
    const parts = raw.trim().toUpperCase().split(/\s+/);
    const cmd = parts[0];
    const npcByName = n => Object.keys(CS.NPCS).find(id => id.toUpperCase() === n || CS.NPCS[id].name.split(' ')[0].toUpperCase() === n);
    switch (cmd) {
      case 'MONEYPLEASE': S.player.money += 1000; CS.ui.refreshHUD(); return '+$1000';
      case 'MAXENERGY': S.player.energy = 100; CS.ui.refreshHUD(); return 'energy restored';
      case 'ALLSEEDS': for (const k of Object.keys(CS.ITEMS)) if (CS.ITEMS[k].type === 'seed') G.addItem(k, 5); return '+5 of every seed';
      case 'FASTGROW': {
        let n = 0;
        for (const key of Object.keys(S.farm.plots)) { const pl = S.farm.plots[key]; if (pl.crop) { pl.days = CS.CROPS[pl.crop].days; n++; } }
        return `${n} crops ready`;
      }
      case 'SUNNYDAY': S.weather.today = 'sunny'; CS.ui.refreshHUD(); return 'weather: sunny';
      case 'RAINYDAY': S.weather.today = 'rain'; CS.ui.refreshHUD(); return 'weather: rain';
      case 'NEXTDAY': G.sleep(false); return 'advanced to next day';
      case 'TIMEFREEZE': S.flags.timeFrozen = !S.flags.timeFrozen; return S.flags.timeFrozen ? 'time frozen' : 'time resumed';
      case 'SETTIME': {
        const [h, mm] = (parts[1] || '').split(':').map(Number);
        if (isNaN(h)) return 'usage: SETTIME 18:00';
        S.time.minutes = h * 60 + (mm || 0);
        G.refreshNPCs(true); CS.ui.refreshHUD();
        return `time set to ${parts[1]}`;
      }
      case 'SETDAY': {
        const d = parseInt(parts[1]);
        if (!d || d < 1 || d > 30) return 'usage: SETDAY 15';
        S.time.day = d; S.time.weekdayIndex = G.weekdayIndex();
        G.refreshNPCs(true); CS.ui.refreshHUD();
        return `day set to ${d}`;
      }
      case 'FRIEND': {
        const id = npcByName(parts[1] || '');
        if (!id) return 'unknown NPC';
        S.npcs[id].met = true; S.npcs[id].fam = Math.max(3, S.npcs[id].fam); S.npcs[id].friend += 50;
        return `${CS.NPCS[id].name}: +50 friendship (tier: ${CS.TIERS[G.tierOf(id)]})`;
      }
      case 'NPCSTATE': {
        const id = npcByName(parts[1] || '');
        if (!id) return 'unknown NPC';
        const r = S.npcs[id], st = G.npcStatus(id);
        return `${CS.NPCS[id].name}: fam ${r.fam}, friend ${r.friend}, attract ${r.attraction}, tier ${CS.TIERS[G.tierOf(id)]}, ${r.romance === 'seeing' ? 'seeing you, ' : ''}${coupleOf(id) ? 'with ' + coupleOf(id) + ', ' : ''}now: ${st.act}${st.spot ? ` @ ${st.spot.scene}` : ' (away)'}`;
      }
      case 'SETSEASON': {
        const idx = CS.SEASONS.findIndex(s2 => s2.toUpperCase() === (parts[1] || ''));
        if (idx < 0) return 'usage: SETSEASON SUMMER';
        S.time.seasonIndex = idx; S.time.weekdayIndex = G.weekdayIndex();
        G.refreshNPCs(true); CS.ui.refreshHUD();
        return 'season: ' + CS.SEASONS[idx];
      }
      case 'NEXTFESTIVAL': {
        let best = null;
        for (const key of Object.keys(CS.FESTIVALS)) {
          const f = CS.FESTIVALS[key];
          let dist = (f.season - S.time.seasonIndex) * 30 + (f.day - S.time.day);
          if (dist < 0) dist += 120;
          if (!best || dist < best.dist) best = { f, dist };
        }
        S.time.seasonIndex = best.f.season; S.time.day = best.f.day;
        S.time.minutes = Math.max(390, best.f.start);
        S.time.weekdayIndex = G.weekdayIndex();
        G.refreshNPCs(true); CS.ui.refreshHUD();
        return `jumped to ${best.f.name}`;
      }
      case 'NPCDATE': {
        const a = npcByName(parts[1] || ''), b = npcByName(parts[2] || '');
        if (!a || !b) return 'usage: NPCDATE MAYA LENA';
        if (!coupleOf(a) && !coupleOf(b)) { S.couples.push([a, b]); S.flags.pendingGossip = [a, b]; }
        G.refreshNPCs(true);
        return `${a} & ${b} are now a couple`;
      }
      case 'NPCBREAKUP': {
        const a = npcByName(parts[1] || ''), b = npcByName(parts[2] || '');
        S.couples = S.couples.filter(([x, y]) => !((x === a && y === b) || (x === b && y === a)));
        G.refreshNPCs(true);
        return 'done';
      }
      case 'TEXTME': { generateTexts(); return 'generated morning texts'; }
      case 'ATTRACT': {
        const id = npcByName(parts[1] || '');
        if (!id) return 'unknown NPC';
        S.npcs[id].attraction += 30;
        return `${id} attraction +30`;
      }
      default: return 'unknown code';
    }
  };
})();
