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
    const startMoney = { cozy: 500, standard: 400, challenging: 300 }[player.difficulty] || CS.START_MONEY;
    return {
      saveVersion: CS.SAVE_VERSION,
      slot,
      player: Object.assign({
        money: startMoney, energy: 100,
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
    S.arcs = S.arcs || {};                // arcId -> stages completed
    S.coffeeJuniper = S.coffeeJuniper || 0;
    S.coffeeGlasshouse = S.coffeeGlasshouse || 0;
    S.coupleMeta = S.coupleMeta || {};    // 'a+b' -> {since, stage, weddingDay}
    S.family = S.family || null;          // {stage, mode, due, name, arrivedDay}
    S.farmUpgrades = S.farmUpgrades || {};
    S.housing = S.housing || 'studio';
    S.player.difficulty = S.player.difficulty || 'standard';
    applyHousing();
    applyHydro();
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
    if (S.date && S.time.minutes >= S.date.until) {
      const first = CS.NPCS[S.date.npc].name.split(' ')[0];
      S.date = null;
      refreshNPCs(true);
      CS.ui.toast(`${first} heads home, smiling`);
    }
    if (S.time.minutes % 10 === 0) { refreshNPCs(); CS.ui.refreshHUD(); }
    if (S.time.minutes >= CS.DAY_END) {
      CS.ui.narrate("You can barely keep your eyes open... You stumble home and collapse into bed.", () => {
        G.sleep(true);
      });
      return;
    }
    checkEvents('time');
  }

  /* ---- housing & farm-infrastructure appliers (idempotent) ---- */
  const STUDIO_GRID = CS.MAPS.apartment.grid;
  function applyHousing() {
    CS.MAPS.apartment.grid = (S.housing === 'onebr') ? CS.ONEBR_GRID : STUDIO_GRID;
    CS.MAPS.apartment.name = (S.housing === 'onebr') ? 'Your One-Bedroom' : 'Your Studio';
  }
  function applyHydro() {
    if (!S.farmUpgrades.hydro) return;
    const g = CS.MAPS.greenhouse.grid;
    for (let y = 3; y <= 4; y++) for (let x = 5; x <= 8; x++) g[y][x] = 'g';
  }
  G.applyHydro = applyHydro;

  /* ---- difficulty ---- */
  const DIFF = {
    cozy:        { rent: 90,  energyMult: 0.7, startMoney: 500 },
    standard:    { rent: 120, energyMult: 1.0, startMoney: 400 },
    challenging: { rent: 160, energyMult: 1.3, startMoney: 300 },
  };
  G.diff = () => DIFF[S.player.difficulty] || DIFF.standard;
  G.rentAmount = () => G.diff().rent + (S.housing === 'onebr' ? 80 : 0);

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
        const irrigated = !indoor && S.farmUpgrades.irrigation;
        if (pl.watered || indoor || irrigated || (S.weather.today === 'rain' && !indoor)) {
          pl.days += 1;
          if (S.farmUpgrades.compost && Math.random() < .25) pl.days += 1; // rich soil
        }
        pl.watered = false;
        if (!indoor && (S.weather.today === 'rain' || irrigated)) pl.watered = true;
      }
    }
    if (seasonChanged) {
      CS.ui.toast(`${CS.SEASONS[S.time.seasonIndex]} begins.`);
      G.addMsg('hp', `${CS.SEASONS[S.time.seasonIndex]} has arrived in Harbor Point. The market has new seeds.`);
    }

    // ---- NPC↔NPC life (weekly, Mondays) ----
    if (S.time.weekdayIndex === 0) simulatePairs();

    // ---- Year 2–5 story arcs ----
    if (S.flags.redevMeetingDay) S.flags.redevMeetingDay = false; // one-day window
    tickArcs();

    // ---- wedding day (only meaningful while someone is actually engaged) ----
    if (S.weddingDay !== undefined && S.weddingDay !== null) {
      const engagedTo = Object.keys(S.npcs).find(n => S.npcs[n].romance === 'engaged');
      if (!engagedTo) {
        S.weddingDay = null; // stale — married already or called off
      } else {
        if (S.weddingDay < G.totalDay()) S.weddingDay = G.totalDay(); // the ceremony waits for you
        if (S.weddingDay === G.totalDay()) {
          CS.ui.toast('Today is your wedding day. Lighthouse Park, mid-morning.');
        }
      }
    }

    // ---- an NPC wedding resolves at day's end whether or not you made it ----
    if (S.npcWedding && S.npcWedding.day < G.totalDay()) {
      const { a, b } = S.npcWedding;
      const meta = S.coupleMeta[a + '+' + b];
      if (meta) meta.stage = 'married';
      const attended = S.flags['attended_' + a + b];
      const teller = G.tierOf(a) >= G.tierOf(b) ? a : b;
      if (S.npcs[teller].hasNumber) {
        G.addMsg(teller, attended
          ? 'still floating. thank you for being there yesterday. the photos are 90% people laughing'
          : "married!! you were missed — grace saved you cake, it's at the bakery with your name on it");
      }
      if (!attended) { G.addItem('bread', 1); }
      S.npcWedding = null;
    }
    if (S.npcWedding && S.npcWedding.day === G.totalDay()) {
      CS.ui.toast(`${CS.NPCS[S.npcWedding.a].name.split(' ')[0]} & ${CS.NPCS[S.npcWedding.b].name.split(' ')[0]} marry today — Lighthouse Park, mid-morning`);
    }

    // ---- family: the wait, then the arrival ----
    if (S.family && S.family.stage === 'expecting' && G.totalDay() >= S.family.due) {
      S.family.stage = 'arriving'; // handled with a scene on wake, below
    }
    if (S.family && S.family.stage === 'baby' && G.totalDay() - S.family.arrivedDay >= 120) {
      S.family.stage = 'toddler';
      CS.ui.toast(`${S.family.name} is a toddler now — the studio has opinions about baby gates`);
      discover('toddler_' + S.family.name, `${S.family.name} started walking. The cat${S.pet && S.pet.type === 'cat' ? ' (' + S.pet.name + ')' : ''} filed a formal complaint, then made peace.`);
    }

    // ---- pet moments ----
    if (S.pet && Math.random() < .08) {
      const pool = CS.PET_MOMENTS[S.pet.type];
      if (S.pet.type === 'dog' && Math.random() < .3) {
        const finds = ['old_poster', 'paperback', 'wool_scarf'];
        const found = finds[Math.floor(Math.random() * finds.length)];
        G.addItem(found, 1);
        CS.ui.narrate(CS.PET_MOMENTS.dogFind.replace('{name}', S.pet.name) + CS.ITEMS[found].name + '.');
      } else if (pool) {
        CS.ui.narrate(pool[Math.floor(Math.random() * pool.length)].replace(/\{name\}/g, S.pet.name));
      }
      S.pet.affection += 2;
    }

    // ---- the long game: Then & Now at Year 5, New Game+ at Year 6 ----
    if (S.time.year >= 5 && !S.flags.thenNow) {
      S.flags.thenNow = true;
      CS.ui.toast('Journal unlocked: Then & Now');
      G.addMsg('hp', 'Five years of Harbor Point. The community board is collecting photos for a "Then & Now" wall. Yours are already on it — check your journal.');
    }
    if (S.time.year >= 6 && !S.flags.ngplusWritten) {
      S.flags.ngplusWritten = true;
      try {
        localStorage.setItem('concreteSeasons_ngplus', JSON.stringify({ recipes: S.recipes }));
      } catch (e) {}
      CS.ui.toast('Year 6. Harbor Point keeps going — and new saves now start with your recipes (New Game+)');
    }

    // ---- phone: morning texts ----
    generateTexts();
    // daily resets
    S.date = null;
    for (const id of Object.keys(S.npcs)) S.npcs[id].talkedToday = false;
    if (S.pet) { S.pet.fedToday = false; S.pet.walkedToday = false; }
    if (S.weather.today === 'snow' && !S.flags.firstSnow) {
      S.flags.firstSnow = true;
      CS.ui.toast('First snow. Harbor Point goes quiet.');
      discover('first_snow', 'First snow of the year. The tram cables wore white, the river turned pewter, and everyone walked slower on purpose.');
    }

    // rent on Mondays (from week 2)
    if (S.time.weekdayIndex === 0 && G.totalDay() >= 7) {
      const rent = G.rentAmount();
      S.player.money = Math.max(0, S.player.money - rent);
      CS.ui.toast(`Rent paid: -$${rent}`, 'money');
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

  /* ---- Year 2–5 arc engine: stages fire once their date arrives ---- */
  function tickArcs() {
    const api = {
      S,
      addMsg: G.addMsg,
      toast: (t) => CS.ui.toast(t),
      discover,
      setArc: (id, stage) => { S.npcs[id].arc = stage; },
      tierOf: G.tierOf,
    };
    for (const arc of CS.ARCS) {
      let done = S.arcs[arc.id] || 0;
      while (done < arc.stages.length) {
        const st = arc.stages[done];
        if (G.totalDay() < CS.dayOf(st.at.y, st.at.s, st.at.d)) break;
        S.arcs[arc.id] = ++done;
        try { st.run(api); } catch (e) { console.error('arc error', arc.id, e); }
      }
    }
  }
  G.tickArcs = tickArcs;

  /* NPC↔NPC romance: momentum accrues weekly for compatible pairs, invisibly.
     The player only ever sees the resulting behavior. */
  function simulatePairs() {
    for (const [a, b, compat] of CS.NPC_PAIRS) {
      const inCoupleAlready = coupleOf(a) || coupleOf(b);
      const datingPlayer = !!S.npcs[a].romance || !!S.npcs[b].romance;
      const moved = S.npcs[a].arc === 'gone' || S.npcs[b].arc === 'gone';
      if (inCoupleAlready || datingPlayer || moved) continue;
      const k = a + '+' + b;
      S.pairMomentum[k] = (S.pairMomentum[k] || 0) + (0.4 + Math.random() * 0.6) * compat * 10;
      if (S.pairMomentum[k] >= 30) {
        S.couples.push([a, b]);
        S.flags.pendingGossip = [a, b];
      }
    }
    // rare breakups — but only while still just dating
    S.couples = S.couples.filter(([a, b]) => {
      const meta = S.coupleMeta[a + '+' + b];
      const stage = meta ? meta.stage : 'dating';
      if (stage === 'dating' && Math.random() < 0.03) {
        S.pairMomentum[a + '+' + b] = 5;
        delete S.coupleMeta[a + '+' + b];
        return false;
      }
      return true;
    });
    // long-standing couples get engaged; weddings follow
    for (const [a, b] of S.couples) {
      const k = a + '+' + b;
      const meta = S.coupleMeta[k] = S.coupleMeta[k] || { since: G.totalDay(), stage: 'dating' };
      if (meta.stage === 'dating' && G.totalDay() - meta.since >= 60 && Math.random() < .25 && !S.npcWedding) {
        meta.stage = 'engaged';
        meta.weddingDay = G.totalDay() + 12;
        S.npcWedding = { a, b, day: meta.weddingDay };
        const closer = G.tierOf(a) >= G.tierOf(b) ? a : b;
        if (S.npcs[closer].hasNumber && G.tierOf(closer) >= 2) {
          G.addMsg(closer, `so. ${CS.NPCS[a].name.split(' ')[0]} and ${CS.NPCS[b].name.split(' ')[0]} news: WE'RE GETTING MARRIED. lighthouse park, twelve days, mid-morning. be there or be discussed`);
        } else {
          G.addMsg('hp', `Heard around the island: ${CS.NPCS[a].name.split(' ')[0]} and ${CS.NPCS[b].name.split(' ')[0]} are engaged. Lighthouse Park, twelve days from now.`);
        }
        discover('engaged_' + k, `${CS.NPCS[a].name} and ${CS.NPCS[b].name} got engaged. The island approves loudly.`);
      }
    }
    // married NPC couples sometimes grow
    if (S.time.day <= 7) { // once a year-ish window check happens on first Monday of spring
      for (const [a, b] of S.couples) {
        const meta = S.coupleMeta[a + '+' + b];
        if (meta && meta.stage === 'married' && !meta.kid && S.time.seasonIndex === 0 && Math.random() < .15) {
          meta.kid = true;
          G.addMsg('hp', `${CS.NPCS[a].name.split(' ')[0]} and ${CS.NPCS[b].name.split(' ')[0]} are expecting. The Harbor House knitting circle has already mobilized.`);
          discover('npckid_' + a + b, `${CS.NPCS[a].name} and ${CS.NPCS[b].name} are starting a family. The neighborhood's next generation keeps arriving.`);
        }
      }
    }
  }

  function generateTexts() {
    // travel unlocks — invitations arrive when the friendship is real
    if (!S.flags.travelAstoria && S.npcs.nico && S.npcs.nico.hasNumber && G.tierOf('nico') >= 2) {
      S.flags.travelAstoria = true;
      G.addMsg('nico', "ok it's time. come to bellini's. take the tram toward astoria — ditmars stop. tell rosa you're my farmer. she already knows");
    }
    if (!S.flags.travelChinatown && S.npcs.mei_lin && S.npcs.mei_lin.hasNumber && G.tierOf('mei_lin') >= 2) {
      S.flags.travelChinatown = true;
      G.addMsg('mei_lin', "There's a tea shop on Mott Street you should know about. Jade Pavilion — tell Mrs. Woo I sent you. The subway gets you there.");
    }
    if (!S.flags.travelFlushing && S.npcs.maya && S.npcs.maya.hasNumber && G.tierOf('maya') >= 2) {
      S.flags.travelFlushing = true;
      G.addMsg('maya', 'important medical advice: golden mall food court, flushing. the hand-pulled noodles fix things science cannot. subway gets you there');
    }
    if (!S.flags.travelWilliamsburg && S.npcs.avery && S.npcs.avery.hasNumber && G.tierOf('avery') >= 2) {
      S.flags.travelWilliamsburg = true;
      G.addMsg('avery', 'you like the thrift shop? the WILLIAMSBURG FLEA, weekends only. wear comfortable shoes and emotional armor. subway to bedford');
    }
    if (!S.flags.travelChinatown && S.time.seasonIndex === 3 && S.time.day >= 18) {
      S.flags.travelChinatown = true;
      G.addMsg('hp', 'Holiday service: the tram now connects to Chinatown for the Lunar New Year season. Lion dances on Mott Street on the 25th.');
    }
    // hidden-economy hints, once each
    for (const key of Object.keys(CS.ECON_HINTS)) {
      const h = CS.ECON_HINTS[key];
      if (S.flags['hint_' + key]) continue;
      if (S.time.seasonIndex === h.season && S.time.day >= h.day
          && S.npcs[h.from] && S.npcs[h.from].hasNumber) {
        S.flags['hint_' + key] = true;
        G.addMsg(h.from, h.text);
      }
    }
    // congratulations pour in the morning after an engagement
    if (S.flags.pendingCongrats) {
      const fiance = S.flags.pendingCongrats;
      S.flags.pendingCongrats = null;
      const wellWishers = Object.keys(CS.NPCS)
        .filter(id => id !== fiance && S.npcs[id].hasNumber && G.tierOf(id) >= 2).slice(0, 3);
      const notes = [
        'ENGAGED?? to the farmer?? this island is a romance novel and i live in it. congratulations!!',
        'heard the news. genuinely so happy for you two. the lighthouse is a perfect call',
        'congratulations! grace is already sketching cakes. this is not a drill',
      ];
      wellWishers.forEach((id, i) => G.addMsg(id, notes[i % notes.length]));
    }
    // texts from the ones who moved away
    for (const id of Object.keys(CS.NPCS)) {
      const r = S.npcs[id];
      if (r.arc === 'gone' && r.hasNumber && Math.random() < .08) {
        const aways = [
          `${(r.awayCity || 'this city')} update: fine. good, even. but nobody here knows my order. miss that`,
          'saw a community garden today and thought of the island. keep it loud for me',
          'counting down to a visit. save me a seat wherever everyone sits now',
        ];
        G.addMsg(id, aways[Math.floor(Math.random() * aways.length)]);
      }
    }
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
    // outdoor door → interior (a few doors have history)
    if (map.outdoor && map.doors[ch]) {
      const target = map.doors[ch];
      if (target === 'glasshouse' && !S.flags.glasshouseOpen) {
        CS.ui.narrate("A papered-over storefront. The 'For Lease' sign has been up so long it's basically a resident.");
        return;
      }
      if (target === 'glasshouse' && S.flags.glasshouseClosed) {
        CS.ui.narrate("Glasshouse, dark inside. Claire's farewell note is still taped to the glass: 'Tip your baristas. Love your neighborhood.'");
        return;
      }
      if (target === 'cafe' && S.flags.juniperClosed) {
        CS.ui.narrate("Juniper's windows are papered over. Someone taped a tomato-tin plant sketch to the door with 'THANK YOU JOAN' in six handwritings.");
        return;
      }
      enterScene(target);
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
      if (scene === 'cafe') return () => CS.ui.buyPrompt('coffee', 4, 'Juniper pour-over. +18 energy.', () => { S.coffeeJuniper++; });
      if (scene === 'glasshouse') return () => CS.ui.buyPrompt('coffee', 5, "Claire's cortado. +18 energy.", () => { S.coffeeGlasshouse++; });
      if (scene === 'bakery') return () => CS.ui.buyPrompt('bread', 6, "Grace's sesame roll. +25 energy.");
      if (scene === 'market') return () => CS.ui.openShop();
      if (scene === 'thrift') return () => CS.ui.openThrift();
      if (scene === 'bar') return () => barMenu();
    }
    if (ch === 'X') return () => CS.ui.openSell();
    if (ch === 'N') return () => noticeboard(scene);
    if (ch === 'k') return () => {
      // the Williamsburg flea runs every weekend, festival or not
      if (scene === 'williamsburg') {
        if (S.time.weekdayIndex >= 5) CS.ui.openFlea();
        else CS.ui.narrate('Folded tables and locked bins. The flea is a weekend animal — come back Saturday.');
        return;
      }
      const fest = G.currentFestival();
      const stallFests = { night_market: 1.5, street_food: 1.5, holiday_market: 1.5, lunar_new_year: 1.5, marathon: 1.4 };
      const rightPlace = fest && ((fest.where || 'outdoor') === scene);
      if (fest && stallFests[fest.key] && rightPlace) {
        CS.ui.openSell(stallFests[fest.key], fest.key === 'marathon' ? 'Cheer Station Stand' : fest.name + ' Stall');
      } else {
        CS.ui.narrate("An empty market stall. On festival days these come alive.");
      }
    };
    if (ch === 'i') return () => CS.ui.narrate("The old lighthouse. Decommissioned for decades, still the most reliable thing on the island. Locals say if you're here at the right moment, you'll understand why people stay.");
    if (ch === 'P') return () => travelMenu();
    if (ch === 'U' && scene === 'teahouse') return () => CS.ui.buyPrompt('tea', 5, "Mrs. Woo's oolong. +20 energy.");
    if (ch === 'U' && scene === 'bellinis') return () => bellinisMenu();
    if (ch === 'U' && scene === 'foodcourt') return () => foodcourtMenu();
    if (ch === 'h') return () => CS.ui.narrate("You sit for a moment. The river doesn't care about anyone's schedule. It's the most relaxing thing in New York.");
    if (ch === 's' || ch === 'g') return () => farmAction(scene, x, y);
    return null;
  }

  /* ---- travel ---- */
  function travelMenu() {
    const here = S.playerRT.scene;
    const opts = [];
    if (here === 'outdoor') {
      for (const dest of Object.keys(CS.TRAVEL)) {
        const d = CS.TRAVEL[dest];
        if (S.flags[d.unlockFlag]) {
          opts.push({ label: `${d.name} — $${d.cost}`, fn: () => travelTo(dest) });
        }
      }
      if (!opts.length) {
        CS.ui.narrate("The tram sways off toward Manhattan. Trips into the city open up once you know people who'd want you to visit. For now, Harbor Point is plenty.");
        return;
      }
    } else {
      opts.push({ label: 'Back to Harbor Point — $3', fn: () => travelTo('harbor') });
    }
    opts.push({ label: 'Stay put', fn: () => {} });
    CS.ui.choose(here === 'outdoor' ? 'Where to?' : 'The subway rattles in.', opts);
  }
  function travelTo(dest) {
    const cost = 3;
    if (S.player.money < cost) { CS.ui.toast('Not enough for the fare.'); return; }
    S.player.money -= cost;
    S.time.minutes += 45;
    if (dest === 'harbor') {
      enterScene('outdoor', 4, 14);
    } else {
      const d = CS.TRAVEL[dest];
      enterScene(dest, d.spawn[0], d.spawn[1]);
    }
    refreshNPCs(true);
    CS.ui.refreshHUD();
  }

  function foodcourtMenu() {
    CS.ui.choose('Golden Mall: steam, chatter in four languages, and the best $10 you will ever spend.',
      CS.FOODCOURT_MENU.map(f => ({
        label: `${f.name} — $${f.price} (+${f.energy} energy)`,
        fn: () => buyEnergy(f.price, f.energy, 'You eat at the counter, elbow to elbow with strangers who all made the same excellent decision.'),
      })).concat([{ label: 'Just breathing it in', fn: () => {} }]));
  }

  function bellinisMenu() {
    CS.ui.choose("Bellini's. Red sauce in the air, Rosa at her table, Queens outside the window.", [
      { label: 'Plate of the day — $14 (+45 energy)', fn: () => buyEnergy(14, 45, "Whatever Nico's cooking, it's right. You eat every bite and consider the bread situation carefully.") },
      { label: 'Espresso — $3 (+10 energy)', fn: () => buyEnergy(3, 10, 'Short, dark, non-negotiable.') },
      { label: 'Just visiting', fn: () => {} },
    ]);
  }

  /* ---- dates & hangouts ---- */
  const DATE_VENUES = [
    { spot: 'cafe_table_b',    label: 'Coffee at Juniper ($8, you treat)', cost: 8 },
    { spot: 'bar_table',       label: 'Drinks at The Anchor ($10)', cost: 10 },
    { spot: 'waterfront_b',    label: 'Walk along the waterfront', cost: 0 },
    { spot: 'lighthouse_park', label: 'Lighthouse Park', cost: 0 },
  ];
  function askHangout(id, isDate) {
    const npc = CS.NPCS[id];
    CS.ui.choose(`Where to take ${npc.name.split(' ')[0]}?`, DATE_VENUES.map(v => ({
      label: v.label,
      fn: () => {
        if (S.player.money < v.cost) { CS.ui.toast('Not enough money.'); return; }
        if (!spendEnergy(8)) return;
        S.player.money -= v.cost;
        const r = S.npcs[id];
        r.dateDay = G.totalDay();
        r.friend += 10;
        if (isDate) r.attraction += 8;
        S.date = { npc: id, spot: v.spot, until: S.time.minutes + 150, kind: isDate ? 'date' : 'hangout' };
        refreshNPCs(true);
        CS.ui.refreshHUD();
        const where = CS.SPOTS[v.spot];
        CS.ui.narrate(`You two head off together. (${npc.name.split(' ')[0]} will be at ${CS.MAPS[where.scene].name} for the next couple of hours — go find them.)`);
      },
    })).concat([{ label: 'Actually, never mind', fn: () => {} }]));
  }
  G.clearDate = function () { S.date = null; };

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
      if (S.flags.leaseOffer && S.housing === 'studio') {
        CS.ui.choose("The desk volunteer slides over the housing folder. \"The one-bedroom upstairs — $500 to move, rent goes up $80 a week. River-facing. Room for a life, if yours is growing.\"", [
          { label: 'Take the one-bedroom ($500, rent +$80/wk)', fn: () => {
            if (S.player.money < 500) { CS.ui.toast('Not enough money.'); return; }
            S.player.money -= 500;
            S.housing = 'onebr';
            applyHousing();
            CS.ui.refreshHUD();
            CS.ui.narrate("Moving day takes one afternoon and four favors. By evening the boxes are in, the second window catches the river light, and the studio's echo is somebody else's now.");
            discover('moved_onebr', `Year ${S.time.year}: moved into the one-bedroom. Two windows, room for a reading chair, and a rent number you try not to think about on Mondays.`);
          }},
          { label: 'Stay in the studio', fn: () => {
            S.flags.leaseOffer = false;
            CS.ui.narrate("You re-sign for the studio. It's small, it hums, it's yours. The volunteer nods like you passed a test.");
          }},
        ]);
        return;
      }
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
    const cost = Math.max(1, Math.round(n * G.diff().energyMult));
    if (S.player.energy < cost) {
      CS.ui.narrate("You're exhausted. Eat something, grab a coffee, or sleep it off.");
      return false;
    }
    S.player.energy -= cost;
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
    harbor_lights: ['waterfront_a', 'waterfront_b', 'waterfront_c', 'lawn_b', 'lawn_d'],
    street_food: ['stall_a', 'stall_b', 'mainstreet', 'mainstreet_b'],
    holiday_market: ['stall_a', 'stall_b', 'mainstreet', 'mainstreet_b'],
    lunar_new_year: ['ct_street_a', 'ct_street_b', 'ct_street_c', 'ct_stall'],
    pride: ['mainstreet', 'mainstreet_b', 'stall_a', 'stall_b'],
    halloween: ['mainstreet', 'mainstreet_b', 'stall_a', 'stall_b'],
    friendsgiving: ['hh_a', 'hh_b'],
    nye: ['waterfront_a', 'waterfront_b', 'waterfront_c', 'lawn_b'],
    open_streets: ['mainstreet', 'mainstreet_b', 'stall_a', 'stall_b'],
    marathon: ['mainstreet', 'mainstreet_b', 'stall_a', 'stall_b'],
    movie_night: ['lawn_a', 'lawn_b', 'lawn_c', 'lawn_d', 'lawn_e'],
  };
  const COUPLE_SPOTS = ['cafe_table_b', 'waterfront_b', 'bar_table']; // rotates by weekday

  function coupleOf(id) {
    for (const [a, b] of S.couples) { if (a === id) return b; if (b === id) return a; }
    return null;
  }
  G.coupleOf = coupleOf;

  function remapSpot(spotName) {
    if (S.flags.juniperClosed && CS.CAFE_FALLBACK && CS.CAFE_FALLBACK[spotName]) return CS.CAFE_FALLBACK[spotName];
    if (S.flags.glasshouseClosed && CS.GLASS_FALLBACK && CS.GLASS_FALLBACK[spotName]) return CS.GLASS_FALLBACK[spotName];
    return spotName;
  }

  G.npcStatus = function (id) {
    const npc = CS.NPCS[id];
    const r = S.npcs[id];
    const fest = G.currentFestival();
    // moved away (fellowship, postdoc...) — but the holidays bring people home
    if (r.arc === 'gone') {
      if (fest && fest.key === 'holiday_market') {
        const spots = FESTIVAL_SPOTS[fest.key];
        const idx = Object.keys(CS.NPCS).indexOf(id) % spots.length;
        return { spot: CS.SPOTS[spots[idx]], act: 'home for the holidays' };
      }
      return { spot: null, act: `living in ${r.awayCity || 'another city'} — you text sometimes` };
    }
    // your wedding day: everyone who matters is at Lighthouse Park
    if (S.weddingDay === G.totalDay() && S.time.minutes >= 570 && S.time.minutes < 780
        && !npc.decorative && (G.tierOf(id) >= 2 || r.romance === 'engaged')) {
      const spots = ['lighthouse_park', 'lawn_a', 'lawn_d'];
      return { spot: CS.SPOTS[spots[Object.keys(CS.NPCS).indexOf(id) % spots.length]],
               act: r.romance === 'engaged' ? 'waiting for you under the lighthouse' : 'at your wedding' };
    }
    // an NPC wedding: the couple and their people gather the same way
    if (S.npcWedding && S.npcWedding.day === G.totalDay()
        && S.time.minutes >= 570 && S.time.minutes < 780 && !npc.decorative) {
      const { a, b } = S.npcWedding;
      if (id === a || id === b) return { spot: CS.SPOTS.lighthouse_park, act: 'getting married' };
      if (G.tierOf(id) >= 1 && r.arc !== 'gone') {
        const spots = ['lawn_a', 'lawn_d', 'lighthouse_park'];
        return { spot: CS.SPOTS[spots[Object.keys(CS.NPCS).indexOf(id) % spots.length]],
                 act: `at ${CS.NPCS[a].name.split(' ')[0]} & ${CS.NPCS[b].name.split(' ')[0]}'s wedding` };
      }
    }
    // an active date with the player trumps everything else
    if (S.date && S.date.npc === id && S.time.minutes < S.date.until) {
      return { spot: CS.SPOTS[remapSpot(S.date.spot)], act: 'spending time with you' };
    }
    // your spouse (or live-in partner) — mornings and evenings at home
    if (r.romance === 'married' || S.cohab === id) {
      if (S.time.minutes < 480 || S.time.minutes >= 1200) {
        return { spot: CS.SPOTS.apartment_home, act: 'home, with you' };
      }
    }
    // festival override — some festivals only draw part of the neighborhood
    if (fest && !npc.decorative && (!fest.attendees || fest.attendees.includes(id))) {
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
    return { spot: b.at ? CS.SPOTS[remapSpot(b.at)] : null, act: b.act };
  };

  /* ---- hidden seasonal economy: the price IS the tell ---- */
  G.priceMult = function (itemId) {
    const t = S.time;
    let m = 1;
    const flower = ['tulip', 'sunflower', 'chrysanthemum'].includes(itemId);
    if (flower && t.seasonIndex === 0 && t.day >= 20) m *= 1.3;            // wedding season
    if (flower && t.seasonIndex === 3 && t.day >= 20) m *= 1.35;           // Lunar New Year
    if (['basil', 'tomato'].includes(itemId) && t.seasonIndex === 1) m *= 1.25; // restaurant summer demand
    if (['cucumber'].includes(itemId) && t.seasonIndex === 1 && S.weather.today === 'sunny') m *= 1.2;
    return m;
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
  function committedTo() {
    for (const id of Object.keys(S.npcs)) {
      if (['partner', 'engaged', 'married'].includes(S.npcs[id].romance)) return id;
    }
    return null;
  }
  G.committedTo = committedTo;
  function canFlirt(id) {
    const npc = CS.NPCS[id], r = S.npcs[id];
    return !npc.decorative && npc.rom && npc.rom.includes(S.player.gender)
      && prefAllows(npc.gender) && !coupleOf(id) && !r.romance && !committedTo()
      && r.arc !== 'gone' && G.tierOf(id) >= 2;
  }
  function canAskOut(id) {
    const r = S.npcs[id];
    return canFlirt(id) && r.attraction >= 25 && r.friend >= 60;
  }
  function canOfficial(id) {
    const r = S.npcs[id];
    return r.romance === 'seeing' && r.friend >= 100 && r.attraction >= 50
      && G.totalDay() - (r.romanceDay || 0) >= 14 && !committedTo();
  }
  function canPropose(id) {
    const r = S.npcs[id];
    return r.romance === 'partner' && r.friend >= 150 && (S.inv.ring || 0) > 0
      && G.totalDay() - (r.romanceDay || 0) >= 20;
  }
  function makeOfficial(id) {
    const npc = CS.NPCS[id], r = S.npcs[id];
    // anyone else you were seeing hears about it — gently
    for (const other of Object.keys(S.npcs)) {
      if (other !== id && S.npcs[other].romance === 'seeing') {
        S.npcs[other].romance = null;
        S.npcs[other].friend = Math.max(0, S.npcs[other].friend - 15);
        if (S.npcs[other].hasNumber) G.addMsg(other, "heard you two made it official. i get it. i'm happy for you — give me a minute on that, but i am.");
      }
    }
    r.romance = 'partner';
    r.romanceDay = G.totalDay();
    discover('partner_' + id, `You and ${npc.name} made it official. Exclusive, spare-key-conversations, the whole thing.`);
    CS.ui.dialogue(npc, [
      `"So — this. Us." ${npc.name.split(' ')[0]} takes a breath like a diver. "I want it to be the real, boring, every-day version. Official." You say the easiest yes of your year.`,
    ]);
  }
  function propose(id) {
    const npc = CS.NPCS[id], r = S.npcs[id];
    G.removeItem('ring', 1);
    r.romance = 'engaged';
    r.romanceDay = G.totalDay();
    S.weddingDay = G.totalDay() + 10;
    S.flags.pendingCongrats = id;
    discover('engaged_' + id, `You proposed to ${npc.name} — and the box was barely open before the yes. Wedding at the lighthouse in ten days.`);
    CS.ui.dialogue(npc, [
      `You've rehearsed nothing. The box is heavier than physics allows. ${npc.name.split(' ')[0]} looks at it, then at you, and starts nodding before you finish the sentence.`,
      `"Yes. Obviously yes. The lighthouse, in ten days — small, everyone we love, Grace does the cake. I've... maybe thought about this."`,
    ]);
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
    if (canPropose(id)) opts.push({ label: 'Propose', fn: () => propose(id) });
    else if (canOfficial(id)) opts.push({ label: 'Make it official', fn: () => makeOfficial(id) });
    else if (canAskOut(id)) opts.push({ label: 'Ask them out', fn: () => askOut(id) });
    else if (canFlirt(id)) opts.push({ label: 'Flirt', fn: () => flirt(id) });
    if (!npc.decorative && !S.date && r.dateDay !== G.totalDay()) {
      if (r.romance) opts.push({ label: 'Ask on a date', fn: () => askHangout(id, true) });
      else if (r.friend >= 60) opts.push({ label: 'Ask to hang out', fn: () => askHangout(id, false) });
    }
    if (id === 'joan' && canWorkShift()) opts.push({ label: 'Help with the morning rush ($45)', fn: () => workShift() });
    if (id === 'malik' && S.flags.gardenIntro && Object.keys(CS.FARM_UPGRADES).some(k => !S.farmUpgrades[k])) {
      opts.push({ label: 'Ask about farm improvements', fn: () => farmUpgradeMenu() });
    }
    if (id === 'sofia' && G.tierOf('sofia') >= 2 && canGig() && S.time.weekdayIndex <= 4
        && S.time.minutes >= 900 && S.time.minutes < 1080 && S.playerRT.scene === 'harbor_house') {
      opts.push({ label: 'Help tutor the after-school kids ($50)', fn: () => doGig(50, 25, 150,
        "Two hours of fractions, four hours of questions about the farm. Sofia calls you 'a natural' — she says it to all the volunteers, and it works every time.") });
    }
    if (id === 'theo' && G.tierOf('theo') >= 2 && canGig() && S.time.weekdayIndex >= 5
        && S.time.minutes >= 540 && S.time.minutes < 720) {
      opts.push({ label: 'Assist a photo shoot ($70)', fn: () => doGig(70, 20, 180,
        "Three hours of holding reflectors and learning to see the neighborhood the way Theo does — in patient rectangles. He pays cash and gives you a print. The print's the real wage.") });
    }
    if (!npc.decorative && r.romance === 'partner' && !S.cohab && !S.spouse
        && S.housing === 'onebr' && G.totalDay() - (r.romanceDay || 0) >= 20) {
      opts.push({ label: 'Ask them to move in', fn: () => askCohab(id) });
    }
    if (id === S.spouse && r.romance === 'married' && !S.family
        && G.totalDay() - (r.romanceDay || 0) >= 30) {
      opts.push({ label: 'Talk about the future', fn: () => familyTalk(id) });
    }
    opts.push({ label: 'Never mind', fn: () => {} });
    const ROM_LABEL = { seeing: 'seeing each other', partner: 'together', engaged: 'engaged', married: 'married' };
    const status = ROM_LABEL[r.romance] || G.npcStatus(id).act;
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

  function familyTalk(id) {
    const first = CS.NPCS[id].name.split(' ')[0];
    CS.ui.choose(`One quiet evening, ${first} asks the big soft question: "So... do we want to be three?"`, [
      { label: 'Try for a baby', fn: () => {
        S.family = { stage: 'expecting', mode: 'bio', due: G.totalDay() + 40 };
        CS.ui.narrate(`${first} exhales like they've been holding that breath for a season. "Okay. Okay! We're doing this." The studio suddenly looks smaller and better.`);
        discover('family_trying', `You and ${first} decided to grow the family. The spare corner by the window started collecting small soft things.`);
      }},
      { label: 'Look into adoption', fn: () => {
        S.family = { stage: 'expecting', mode: 'adopt', due: G.totalDay() + 40 };
        CS.ui.narrate(`${first} nods slowly, then faster. "Yes. There's a kid out there who needs exactly this ridiculous island." Paperwork begins. So does the hoping.`);
        discover('family_adopting', `You and ${first} started the adoption process. The folder of forms lives on the kitchen counter like a promise.`);
      }},
      { label: 'Not yet — and that\'s okay', fn: () => {
        CS.ui.narrate(`"Not yet," you say, and ${first} squeezes your hand. "Then not yet. We're already a whole thing, you and me." The tram hums past. Enough, for now, is enough.`);
      }},
    ]);
  }

  function farmUpgradeMenu() {
    const opts = [];
    for (const key of Object.keys(CS.FARM_UPGRADES)) {
      const u = CS.FARM_UPGRADES[key];
      if (S.farmUpgrades[key]) continue;
      if (u.needs && !S.farmUpgrades[u.needs]) continue;
      opts.push({ label: `${u.name} — $${u.cost}`, fn: () => {
        if (S.player.money < u.cost) { CS.ui.toast('Not enough money.'); return; }
        S.player.money -= u.cost;
        S.farmUpgrades[key] = true;
        CS.ui.refreshHUD();
        if (key === 'hydro') applyHydro();
        const react = {
          irrigation: '"Drip lines," Malik says, unrolling tube like it\'s treasure. "Now the plants drink on schedule and you sleep past sunrise. Civilization."',
          compost: 'Malik pats the new compost bin like an old friend. "Feed the soil, the soil feeds you. Oldest deal on earth."',
          hydro: 'Racks, pumps, soft grow-light hum. Malik whistles. "Greenhouse grows in January now. The old girl\'s got a second life."',
        }[key];
        CS.ui.narrate(react);
        discover('upgrade_' + key, `Farm upgrade: ${u.name}. ${u.desc}`);
      }});
    }
    opts.push({ label: 'Maybe later', fn: () => {} });
    CS.ui.choose('Malik pulls a folded list from his cap. "Been thinking about this plot\'s future. Pick your improvement."', opts);
  }

  function canWorkShift() {
    const wd = S.time.weekdayIndex;
    return wd <= 4 && S.time.minutes >= 420 && S.time.minutes < 600 && canGig();
  }
  function workShift() {
    doGig(45, 25, 180,
      "Three hours of steaming milk, calling names, and learning who orders what. Joan nods at the end — high praise. You made $45 and about forty micro-acquaintances.");
  }
  // one paid gig per day, shared across all jobs
  function canGig() { return !S.flags['gig' + G.totalDay()]; }
  function doGig(pay, energy, minutes, flavor) {
    if (!G.spendEnergy(energy)) return;
    S.flags['gig' + G.totalDay()] = true;
    S.time.minutes += minutes;
    S.player.money += pay;
    refreshNPCs(true);
    CS.ui.refreshHUD();
    CS.ui.narrate(flavor);
  }

  function askCohab(id) {
    const npc = CS.NPCS[id], first = npc.name.split(' ')[0];
    S.cohab = id;
    S.npcs[id].friend += 15;
    discover('cohab_' + id, `${npc.name} moved in. Two toothbrushes, one rent conversation, a shelf that reorganized itself into "ours."`);
    CS.ui.dialogue(npc, [
      `You ask over dinner, casually, the way you'd rehearsed being casual. ${first} puts the fork down. "I was going to give it one more month before I asked you." Boxes arrive Saturday. The apartment absorbs a second whole life without complaint.`,
    ]);
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
    // married / living-together small talk — the ordinary intimacy leads
    if ((r.romance === 'married' || S.cohab === id) && Math.random() < .4) {
      let pool = r.romance === 'married' ? CS.MARRIED_LINES : CS.COHAB_LINES;
      if (S.family && S.family.stage === 'baby') pool = pool.concat(CS.BABY_LINES);
      if (S.family && S.family.stage === 'toddler') pool = pool.concat(CS.TODDLER_LINES);
      return pool[Math.floor(Math.random() * pool.length)].replace(/\{name\}/g, S.family ? S.family.name : '');
    }
    // on a date: date lines take the lead
    if (S.date && S.date.npc === id && m < S.date.until && Math.random() < .6) {
      const venue = CS.DATE_LINES[S.date.spot] || [];
      const pool = [...CS.DATE_LINES.generic, ...venue];
      return pool[Math.floor(Math.random() * pool.length)];
    }
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
      if (c.seeing) { if (['seeing', 'partner', 'engaged', 'married'].includes(r.romance)) score += 8; else ok = false; }
      if (c.arc) { if (r.arc === c.arc) score += 12; else ok = false; }
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

  /* ---- family rendering: crib or toddler in the apartment ---- */
  G.drawFamily = function (ctx, scene, camX, camY, T, t) {
    if (!S || !S.family || scene !== 'apartment') return;
    if (S.family.stage === 'baby') {
      CS.art.crib(ctx, 7 * T - camX, 1 * T - camY, T, t);
    } else if (S.family.stage === 'toddler') {
      const wob = Math.sin(t / 700) * 2;
      CS.art.toddler(ctx, 7 * T - camX + wob, 5 * T - camY, T, t);
    }
  };

  G.drawPet = function (ctx, scene, camX, camY, T, t) {
    if (!S || !S.pet || !S.petRT || S.petRT.scene !== scene) return;
    const rt = S.petRT;
    if (S.pet.type === 'fish') {
      CS.art.aquarium(ctx, rt.px - camX, rt.py - camY, T, t, S.pet.fishCount || 1);
      return;
    }
    CS.art.pet(ctx, S.pet.type, S.pet.fur || '#8a6242', rt.px - camX, rt.py - camY, T, t);
  };

  G.addAquariumFish = function (price) {
    if (S.player.money < price) { CS.ui.toast('Not enough money.'); return; }
    S.player.money -= price;
    S.pet.fishCount = (S.pet.fishCount || 1) + 1;
    S.pet.affection += 3;
    CS.ui.refreshHUD();
    CS.ui.toast(`A new guppy joins ${S.pet.name}'s small nation (${S.pet.fishCount} fish)`);
    if (S.pet.fishCount === 3) discover('full_tank', `The aquarium reached full population: three fish, one ecosystem, zero vacancies. ${S.pet.name} governs wisely.`);
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
      const FEST_TEXT = {
        pride: `Harbor Pride, Year ${S.time.year}. Bunting from the thrift shop to the bar, and Malik's twenty-year-old rainbow cap leading the walk.`,
        halloween: `Halloween on Main, Year ${S.time.year}. Grace gave out full-size rolls. Nia was a ferry captain. Perfection.`,
        friendsgiving: `Friendsgiving at Harbor House, Year ${S.time.year}. Three stuffings, Malik's annual toast, Mateo's leftovers economy.`,
        nye: `New Year's Eve on the promenade, Year ${S.time.year}. The whole island counting down into the wind.`,
        open_streets: `Open Streets, Year ${S.time.year}. Main Street with no cars sounds like the neighborhood's original voice.`,
        marathon: `Marathon Weekend, Year ${S.time.year}. Forty thousand strangers ran past and the island cheered every single one.`,
        movie_night: `Movie Night on the lawn, Year ${S.time.year}. Crooked projector, wind for sound, nobody would fix a thing.`,
        cherry: `Cherry Blossom Picnic, Year ${S.time.year}. The whole neighborhood on one lawn, petals in everyone's coffee.`,
        night_market: `Night Market, Year ${S.time.year}. Main Street under string lights, your produce selling at festival prices.`,
        harbor_lights: `Harbor Lights, Year ${S.time.year}. Fireworks over the East River, the whole island looking up at once.`,
        street_food: `Street Food Festival, Year ${S.time.year}. You followed the smoke. The smoke knew.`,
        holiday_market: `Holiday Market, Year ${S.time.year}. String lights, cold hands, warm cider, Main Street at its kindest.`,
        lunar_new_year: `Lunar New Year on Mott Street, Year ${S.time.year}. Drums, lions, lanterns — and Mrs. Woo's line around the block.`,
      };
      const onSite = (['cherry', 'movie_night'].includes(fest.key) && p.scene === 'outdoor' && p.y >= 23)
                  || (['night_market', 'street_food', 'holiday_market', 'pride', 'halloween', 'open_streets', 'marathon'].includes(fest.key) && p.scene === 'outdoor' && p.y >= 14 && p.y <= 20)
                  || (['harbor_lights', 'nye'].includes(fest.key) && p.scene === 'outdoor' && p.y >= 32)
                  || (fest.key === 'lunar_new_year' && p.scene === 'chinatown')
                  || (fest.key === 'friendsgiving' && p.scene === 'harbor_house');
      if (onSite) {
        S.flags['fest_' + fest.key + '_' + S.time.year] = true;
        discover('fest_' + fest.key + '_' + S.time.year, FEST_TEXT[fest.key]);
        CS.ui.toast(`${fest.name} — everyone's here`);
        // the holidays bring the departed home
        if (fest.key === 'holiday_market') {
          for (const id of Object.keys(S.npcs)) {
            if (S.npcs[id].arc === 'gone' && !S.flags['return_' + id + '_' + S.time.year]) {
              S.flags['return_' + id + '_' + S.time.year] = true;
              discover('return_' + id + '_' + S.time.year,
                `${CS.NPCS[id].name} came home for the Holiday Market, Year ${S.time.year}. For one evening, the neighborhood had its old shape back.`);
              CS.ui.toast(`${CS.NPCS[id].name.split(' ')[0]} is home for the holidays`);
            }
          }
        }
      }
    }

    // Movie night, late on the lawn, someone beside you
    if (fest && fest.key === 'movie_night' && S.date && p.scene === 'outdoor' && p.y >= 23
        && S.time.minutes >= 1200 && !S.flags['movie_moment_' + S.time.year]) {
      S.flags['movie_moment_' + S.time.year] = true;
      const first = CS.NPCS[S.date.npc].name.split(' ')[0];
      S.npcs[S.date.npc].attraction += 8;
      S.npcs[S.date.npc].friend += 8;
      CS.ui.narrate(`Halfway through the movie, ${first}'s head finds your shoulder — casually, like it's been doing this for years. On the bedsheet screen, somebody's chasing somebody. Neither of you will remember who.`, () => {
        discover('movie_moment_' + S.time.year, `Movie Night, Year ${S.time.year} — the film was fine. The shoulder situation was better.`);
      });
      return;
    }

    // Saturday dog park hour at Lighthouse Park
    if (trigger === 'enter' && S.pet && S.pet.type === 'dog' && S.pet.walkedToday
        && S.time.weekdayIndex === 5 && S.time.minutes >= 480 && S.time.minutes < 660
        && p.scene === 'outdoor' && p.x <= 13 && p.y <= 11
        && S.flags.dogparkWeek !== Math.floor(G.totalDay() / 7)) {
      S.flags.dogparkWeek = Math.floor(G.totalDay() / 7);
      S.pet.affection += 5;
      CS.ui.narrate(`Saturday morning under the lighthouse: four dogs, five owners, one unspoken club. ${S.pet.name} greets Biscuit the corgi like a returning war buddy. You learn two names (both dogs') and trade zucchini advice with a stranger. Membership: confirmed.`, () => {
        if (!S.flags.dogparkFirst) {
          S.flags.dogparkFirst = true;
          discover('dogpark', `The Saturday dog-park hour at Lighthouse Park. Nobody organized it. Nobody would dare cancel it. ${S.pet.name} is a founding member now.`);
        }
      });
      return;
    }

    // Midnight on New Year's Eve, on the promenade
    if (fest && fest.key === 'nye' && S.time.minutes >= 1440 && p.scene === 'outdoor' && p.y >= 32
        && !S.flags['midnight_' + S.time.year]) {
      S.flags['midnight_' + S.time.year] = true;
      const withSomeone = S.spouse ? CS.NPCS[S.spouse].name.split(' ')[0]
        : (S.date ? CS.NPCS[S.date.npc].name.split(' ')[0] : null);
      CS.ui.narrate(withSomeone
        ? `TEN. NINE. The count rolls down the promenade like a wave. At zero the ferries all sound their horns at once and ${withSomeone}'s cold hand finds yours. A brand-new year, already warmer than the last.`
        : `TEN. NINE. The count rolls down the promenade like a wave. At zero the ferry horns bellow, strangers hug you, and the river carries the old year out with the tide. You walked into this crowd alone and stand in it belonging.`, () => {
        discover('midnight_' + S.time.year, `Midnight, New Year's Eve, Year ${S.time.year} → ${S.time.year + 1}. Ferry horns, sparklers, the island in one crowd.`);
      });
      if (withSomeone && S.spouse) S.npcs[S.spouse].friend += 10;
      return;
    }

    // Harbor Lights + a date = the scene the whole year quietly builds toward
    if (fest && fest.key === 'harbor_lights' && S.date && p.scene === 'outdoor' && p.y >= 32
        && !S.flags['lights_moment_' + S.time.year]) {
      S.flags['lights_moment_' + S.time.year] = true;
      const first = CS.NPCS[S.date.npc].name.split(' ')[0];
      S.npcs[S.date.npc].attraction += 12;
      S.npcs[S.date.npc].friend += 10;
      CS.ui.narrate(`The first shell goes up and the whole waterfront inhales. Somewhere in the middle of the finale you realize ${first} isn't watching the sky anymore. Neither are you.`, () => {
        discover('lights_moment_' + S.time.year, `Harbor Lights, Year ${S.time.year} — the fireworks, and ${first} watching you watch them.`);
      });
    }

    // The newest resident arrives
    if (trigger === 'wake' && S.family && S.family.stage === 'arriving') {
      const first = S.spouse ? CS.NPCS[S.spouse].name.split(' ')[0] : 'Your partner';
      CS.ui.narrate(CS.FAMILY.arrival[S.family.mode], () => {
        CS.ui.textInput('A name. No pressure. Only forever.', (name) => {
          if (!name) name = CS.FAMILY.babyNames[Math.floor(Math.random() * CS.FAMILY.babyNames.length)];
          S.family.stage = 'baby';
          S.family.name = name;
          S.family.arrivedDay = G.totalDay();
          CS.ui.toast(`${name} is home.`);
          discover('baby_' + name, `${name} arrived, Year ${S.time.year}, ${CS.SEASONS[S.time.seasonIndex]} ${S.time.day}. ${first} cried. You cried. The cat supervised.`);
          G.addMsg('hp', `The island's newest resident: ${name}. Grace is baking. Malik is carving something. Resistance is futile.`);
        });
      });
      return;
    }

    // NPC wedding attendance — show up and it becomes part of your story too
    if (trigger === 'enter' && S.npcWedding && S.npcWedding.day === G.totalDay()
        && S.time.minutes >= 570 && S.time.minutes < 780
        && p.scene === 'outdoor' && p.x <= 13 && p.y <= 11
        && !S.flags['attended_' + S.npcWedding.a + S.npcWedding.b]) {
      const { a, b } = S.npcWedding;
      S.flags['attended_' + a + b] = true;
      S.npcs[a].friend += 10; S.npcs[b].friend += 10;
      const an = CS.NPCS[a].name.split(' ')[0], bn = CS.NPCS[b].name.split(' ')[0];
      CS.ui.narrate(`${an} and ${bn}, under the lighthouse, saying the simple version out loud while the whole island stands on the grass. You were seated with the people who knew them when. You're one of those people now.`, () => {
        discover('wedding_' + a + b, `${CS.NPCS[a].name} & ${CS.NPCS[b].name} married under the lighthouse, Year ${S.time.year}. You were there — invited, expected, missed if absent.`);
      });
      return;
    }

    // Your wedding — Lighthouse Park, mid-morning
    if (trigger === 'enter' && S.weddingDay === G.totalDay()
        && S.time.minutes >= 570 && S.time.minutes < 780
        && p.scene === 'outdoor' && p.x <= 13 && p.y <= 11) {
      const id = Object.keys(S.npcs).find(n => S.npcs[n].romance === 'engaged');
      if (id) {
        const npc = CS.NPCS[id];
        S.npcs[id].romance = 'married';
        S.npcs[id].romanceDay = G.totalDay();
        S.spouse = id;
        S.weddingDay = null;
        CS.ui.narrateSeq([
          `Grace's cake made it up the hill intact. Malik is wearing a tie that predates the tram. Everyone you've learned, one season at a time, is standing on the grass under the old lighthouse.`,
          CS.WEDDING_LINES.vows,
          `${npc.name.split(' ')[0]} squeezes your hand as the ferry horn — impeccable timing — blesses the whole thing. Married. Here. Home.`,
        ], () => {
          discover('wedding_' + id, `Married ${npc.name} under the lighthouse, Year ${S.time.year}, ${CS.SEASONS[S.time.seasonIndex]} ${S.time.day}. Grace made the cake. The ferry horn did the toast.`);
          CS.ui.toast(`${npc.name.split(' ')[0]} moves in — the studio just became a home for two`);
          refreshNPCs(true);
        });
      }
      return;
    }

    // Redevelopment community meeting — Harbor House, that one evening
    if (trigger === 'enter' && S.flags.redevMeetingDay && !S.flags.redevAttended
        && p.scene === 'harbor_house' && S.time.minutes >= 1020 && S.time.minutes < 1320) {
      S.flags.redevAttended = true;
      CS.ui.narrateSeq([
        `Folding chairs, a projector, and every strong opinion on the island in one room. Priya presents the study without notes. You can tell which slide she fought for.`,
        `When they open the floor, you say the simple thing: the farm feeds people, the lawn holds them, keep both. Priya writes it down. So does the man from the city, which surprises everyone.`,
      ], () => {
        discover('redev_meeting', `Year 3: you spoke at the redevelopment meeting. Priya wrote your words down. "Showing up matters," Malik always says. You showed up.`);
        S.npcs.priya.friend += 15;
      });
      return;
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
        if (best.f.where === 'chinatown') S.flags.travelChinatown = true;
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
      case 'SETYEAR': {
        const y = parseInt(parts[1]);
        if (!y || y < 1 || y > 99) return 'usage: SETYEAR 3';
        S.time.year = y; S.time.weekdayIndex = G.weekdayIndex();
        G.refreshNPCs(true); CS.ui.refreshHUD();
        return 'year ' + y + ' (arcs fire on next wake — use NEXTDAY)';
      }
      case 'ARCS': {
        return CS.ARCS.map(a => `${a.id}: ${S.arcs[a.id] || 0}/${a.stages.length}`).join(' · ');
      }
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
