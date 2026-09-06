/* =========================================================================
   Concrete Seasons — ui.js
   HUD, panels, dialogue, menus, character creation, save slots.
   ========================================================================= */
(function () {
  const U = CS.ui = {};
  const $ = id => document.getElementById(id);
  const G = () => CS.game;

  let dialogueQueue = [], dialogueDone = null, choiceMode = false;
  let lastContextHint = '', lastObjective = '';

  U.blocking = function () {
    return !$('dialogue').classList.contains('hidden')
      || !$('panel-backdrop').classList.contains('hidden')
      || !$('screen-game').classList.contains('active');
  };

  /* ================= HUD ================= */
  U.refreshHeld = function () {
    const S = G().state(); const chip = $('held-chip');
    if (!S || !chip) return;
    if (S.held && S.inv[S.held] > 0) {
      chip.classList.remove('hidden');
      chip.innerHTML = '';
      chip.appendChild(CS.art.iconCanvas(S.held, 22));
      chip.insertAdjacentHTML('beforeend', `<span>Holding: ${CS.ITEMS[S.held].name}</span><b>✕</b>`);
      chip.onclick = () => G().setHeld(null);
    } else {
      chip.classList.add('hidden');
    }
  };
  U.refreshHotbar = function () {
    const S = G().state(); const bar = $('hotbar');
    if (!S || !bar) return;
    const items = Object.keys(S.inv)
      .filter(k => S.inv[k] > 0 && CS.ITEMS[k] && CS.ITEMS[k].type !== 'material')
      .sort((a, b) => {
        const rank = k => CS.ITEMS[k].type === 'seed' ? 0 : CS.ITEMS[k].type === 'tool' ? 1 : 2;
        return rank(a) - rank(b);
      }).slice(0, 6);
    bar.innerHTML = '';
    items.forEach((k, i) => {
      const b = document.createElement('button');
      b.className = 'hotbar-slot' + (S.held === k ? ' selected' : '');
      b.title = `${i + 1}: ${CS.ITEMS[k].name}`;
      b.setAttribute('aria-label', `${CS.ITEMS[k].name}, ${S.inv[k]} available`);
      b.appendChild(CS.art.iconCanvas(k, 30));
      b.insertAdjacentHTML('beforeend', `<span class="hotkey">${i + 1}</span><span class="qty">${S.inv[k]}</span>`);
      b.onclick = () => G().setHeld(S.held === k ? null : k);
      bar.appendChild(b);
    });
    bar.classList.toggle('hidden', items.length === 0);
  };
  U.selectHotbar = function (index) {
    const buttons = $('hotbar') ? $('hotbar').querySelectorAll('.hotbar-slot') : [];
    if (buttons[index]) buttons[index].click();
  };
  U.setContextHint = function (text) {
    if (text === lastContextHint) return;
    lastContextHint = text || '';
    const el = $('action-hint');
    if (!el) return;
    el.innerHTML = text ? `<kbd>Space</kbd>${text}` : '';
    el.classList.toggle('show', !!text);
  };
  U.setObjective = function (text) {
    if (text === lastObjective) return;
    lastObjective = text || '';
    const el = $('tutorial-objective');
    if (!el) return;
    el.textContent = text || '';
    el.classList.toggle('hidden', !text);
  };
  U.refreshHUD = function () {
    const S = G().state();
    if (!S) return;
    $('hud-date').textContent = G().dateText() + ` · Y${S.time.year}`;
    $('hud-time').innerHTML = `${G().clockText()} <span id="hud-weather">${CS.art.weatherSVG(S.weather.today)}</span>`;
    const m = S.player.money;
    $('hud-money').textContent = '$' + (Number.isInteger(m) ? m : m.toFixed(2));
    const maxE = S.player.maxEnergy || 100;
    $('hud-energy').style.width = Math.max(0, Math.min(100, S.player.energy / maxE * 100)) + '%';
    $('hud-energy').style.background = S.player.energy < maxE * .25 ? '#c74f6d' : '';
    const unread = G().unreadTotal ? G().unreadTotal() : 0;
    $('phone-badge').style.display = unread > 0 ? 'flex' : 'none';
    $('phone-badge').textContent = unread > 9 ? '9+' : unread;
    U.refreshHeld();
    U.refreshHotbar();
    document.body.classList.toggle('large-text', S.settings.textSize === 'large');
    document.body.classList.toggle('reduced-motion', S.settings.motion === 'reduced');
  };

  /* ---- phone ---- */
  $('btn-phone').onclick = () => { renderPhoneThreads(); openPanel('panel-phone'); };

  function senderName(id) {
    return id === 'hp' ? CS.ANNOUNCEMENTS.senderName : CS.NPCS[id] ? CS.NPCS[id].name : id;
  }
  function renderPhoneThreads() {
    const S = G().state();
    $('phone-title').textContent = 'Messages';
    const body = $('phone-body');
    body.innerHTML = '';
    const wLabel = { sunny: 'Sunny', cloudy: 'Cloudy', rain: 'Rain', snow: 'Snow' }[S.weather.tomorrow] || S.weather.tomorrow;
    const severe = S.weather.severeTomorrow ? (S.weather.tomorrow === 'snow' ? ' — BLIZZARD WARNING' : ' — STORM WARNING') : '';
    body.insertAdjacentHTML('beforeend',
      `<div class="phone-forecast">${CS.art.weatherSVG(S.weather.tomorrow)} Tomorrow: ${wLabel}${severe}${S.weather.tomorrow === 'rain' ? ' · crops water themselves' : ''}</div>`);
    const ids = Object.keys(S.phone).sort((a, b) => {
      const la = S.phone[a].msgs.at(-1), lb = S.phone[b].msgs.at(-1);
      return (lb ? lb.day : 0) - (la ? la.day : 0);
    });
    if (!ids.length) {
      body.insertAdjacentHTML('beforeend', '<div style="color:#8a7361;padding:20px;text-align:center">No messages yet. Get to know people — numbers get exchanged around Acquaintance.</div>');
      return;
    }
    for (const id of ids) {
      const t = S.phone[id];
      const last = t.msgs.at(-1);
      const row = document.createElement('div');
      row.className = 'phone-thread';
      if (id !== 'hp' && CS.NPCS[id]) {
        const pc = document.createElement('canvas');
        pc.width = pc.height = 72;
        pc.className = 'thread-avatar';
        CS.art.portrait(pc, CS.NPCS[id].look, id);
        row.appendChild(pc);
      } else {
        row.insertAdjacentHTML('beforeend', '<div class="thread-avatar hp-avatar">HP</div>');
      }
      row.insertAdjacentHTML('beforeend', `
        <div class="thread-info">
          <div class="thread-name">${senderName(id)}</div>
          <div class="thread-preview">${last ? last.text.slice(0, 48) : ''}${last && last.text.length > 48 ? '…' : ''}</div>
        </div>
        ${t.unread ? `<span class="thread-unread">${t.unread}</span>` : ''}`);
      row.onclick = () => renderPhoneThread(id);
      body.appendChild(row);
    }
  }
  function renderPhoneThread(id) {
    const S = G().state();
    G().markRead(id);
    U.refreshHUD();
    $('phone-title').textContent = senderName(id);
    const body = $('phone-body');
    body.innerHTML = '<button class="btn small ghost" id="phone-back">‹ All messages</button><div class="bubble-list"></div>';
    $('phone-back').onclick = renderPhoneThreads;
    const list = body.querySelector('.bubble-list');
    const t = S.phone[id];
    let lastDay = -1;
    for (const m of t.msgs) {
      if (m.day !== lastDay) {
        lastDay = m.day;
        const dayNum = m.day % 30 + 1, seasonIdx = Math.floor(m.day / 30) % 4;
        list.insertAdjacentHTML('beforeend', `<div class="bubble-day">${CS.SEASONS[seasonIdx]} ${dayNum}</div>`);
      }
      list.insertAdjacentHTML('beforeend', `<div class="bubble them">${m.text}</div>`);
    }
    if (id !== 'hp' && S.phone[id].repliedDay !== G().totalDay()) {
      const reply = document.createElement('button');
      reply.className = 'btn small primary';
      reply.style.marginTop = '10px';
      reply.textContent = 'Reply';
      reply.onclick = () => {
        if (G().replyTo(id)) {
          list.insertAdjacentHTML('beforeend', '<div class="bubble you">Replied.</div>');
          reply.remove();
        }
      };
      body.appendChild(reply);
    }
    list.scrollTop = list.scrollHeight;
  }

  let labelTimer = null;
  U.showSceneLabel = function (text) {
    const el = $('scene-label');
    el.textContent = text;
    el.style.opacity = 1;
    clearTimeout(labelTimer);
    labelTimer = setTimeout(() => { el.style.opacity = 0; }, 2200);
  };

  U.toast = function (text, cls) {
    if (CS.audio && CS.audio.blip) CS.audio.blip();
    const area = $('toast-area');
    const t = document.createElement('div');
    t.className = 'toast' + (cls ? ' ' + cls : '');
    t.textContent = text;
    area.appendChild(t);
    setTimeout(() => { t.style.transition = 'opacity .5s'; t.style.opacity = 0; }, 2600);
    setTimeout(() => t.remove(), 3200);
    while (area.children.length > 4) area.firstChild.remove();
  };

  /* ================= dialogue ================= */
  function openDlg() { $('dialogue').classList.remove('hidden'); }
  function closeDlg() {
    $('dialogue').classList.add('hidden');
    $('dlg-choices').innerHTML = '';
    choiceMode = false;
  }

  let dlgNpc = null;
  // FoMT-style per-line expression: guess the mood from the line itself
  function guessMood(text) {
    const t = (text || '').toLowerCase();
    if (/sorry|miss |tired|sigh|worried|worry|hard week|rough|exhaust|can't sleep|lonely|scared/.test(t)) return 'calm';
    if (/haha|laugh|grin|love|loved|thank|amazing|best |great|perfect|delicious|beautiful|yay|finally!|!!/.test(t)) return 'happy';
    if (/!$|! /.test(t) && Math.random() < .6) return 'happy';
    return 'calm';
  }
  U.dialogue = function (npc, lines, done) {
    const pc = $('dlg-portrait');
    dlgNpc = npc || null;
    if (npc) CS.art.portrait(pc, npc.look, npc.id); else CS.art.narratorPortrait(pc);
    $('dlg-name').textContent = npc ? npc.name : '';
    if (npc && npc.id && G().state().npcs[npc.id] && G().state().npcs[npc.id].met) {
      const tier = G().tierOf(npc.id), maxT = CS.TIERS.length - 1;
      let hearts = '';
      for (let i = 0; i < maxT; i++) {
        hearts += `<svg width="11" height="10" viewBox="0 0 12 11"><path d="M6 10 C2 7 0 5 0 3 A3 3 0 0 1 6 2 A3 3 0 0 1 12 3 C12 5 10 7 6 10 Z" fill="${i < tier ? '#e0704f' : 'rgba(253,246,227,.35)'}"/></svg>`;
      }
      $('dlg-name').insertAdjacentHTML('beforeend', `<span class="dlg-hearts">${hearts}</span>`);
    }
    $('dlg-name').style.display = npc ? '' : 'none';
    dialogueQueue = [...lines];
    dialogueDone = done || null;
    choiceMode = false;
    $('dlg-choices').innerHTML = '';
    $('dlg-continue').style.display = '';
    openDlg();
    U.advanceDialogue(true);
  };
  U.dialogueSeq = U.dialogue;
  U.narrate = (text, done) => U.dialogue(null, [text], done);
  U.narrateSeq = (lines, done) => U.dialogue(null, lines, done);

  U.advanceDialogue = function (first) {
    if (choiceMode) return;
    if (!first && dialogueQueue.length === 0) {
      closeDlg();
      const d = dialogueDone; dialogueDone = null;
      if (d) d();
      return;
    }
    const text = dialogueQueue.shift();
    if (text === undefined) { closeDlg(); const d = dialogueDone; dialogueDone = null; if (d) d(); return; }
    if (dlgNpc && dlgNpc.id) {
      CS.art.portrait($('dlg-portrait'), dlgNpc.look, dlgNpc.id, guessMood(text));
    }
    typeText($('dlg-text'), text);
  };

  let typeTimer = null;
  function typeText(el, text) {
    clearInterval(typeTimer);
    el.textContent = '';
    let i = 0;
    typeTimer = setInterval(() => {
      i += 2;
      el.textContent = text.slice(0, i);
      if (i >= text.length) clearInterval(typeTimer);
    }, 14);
    el.dataset.full = text;
  }

  $('dialogue').addEventListener('pointerdown', (e) => {
    if (choiceMode) return;
    const el = $('dlg-text');
    if (el.textContent.length < (el.dataset.full || '').length) {
      clearInterval(typeTimer);
      el.textContent = el.dataset.full;
      return;
    }
    U.advanceDialogue();
    e.stopPropagation();
  });

  U.choose = function (prompt, options) {
    CS.art.narratorPortrait($('dlg-portrait'));
    $('dlg-name').style.display = 'none';
    dialogueQueue = []; dialogueDone = null;
    choiceMode = true;
    typeText($('dlg-text'), prompt);
    const box = $('dlg-choices');
    box.innerHTML = '';
    $('dlg-continue').style.display = 'none';
    for (const opt of options) {
      const b = document.createElement('button');
      b.textContent = opt.label;
      b.onpointerdown = (e) => { e.stopPropagation(); closeDlg(); if (opt.fn) opt.fn(); };
      box.appendChild(b);
    }
    openDlg();
  };

  U.textInput = function (prompt, done) {
    CS.art.narratorPortrait($('dlg-portrait'));
    $('dlg-name').style.display = 'none';
    choiceMode = true;
    typeText($('dlg-text'), prompt);
    const box = $('dlg-choices');
    box.innerHTML = '';
    $('dlg-continue').style.display = 'none';
    const input = document.createElement('input');
    input.type = 'text'; input.maxLength = 14;
    input.style.cssText = 'padding:11px 14px;border:2px solid #d8e5da;border-radius:12px;font-size:16px;outline:none;';
    const b = document.createElement('button');
    b.textContent = 'OK';
    b.onpointerdown = (e) => { e.stopPropagation(); const v = input.value.trim(); closeDlg(); done(v); };
    box.appendChild(input); box.appendChild(b);
    openDlg();
    setTimeout(() => input.focus(), 50);
  };

  U.buyPrompt = function (itemId, price, desc, onBuy) {
    const def = CS.ITEMS[itemId];
    U.choose(`${def.name} — $${price}. ${desc}`, [
      { label: `Buy & enjoy ($${price})`, fn: () => {
        const S = G().state();
        if (S.player.money < price) { U.toast('Not enough money.'); return; }
        S.player.money -= price;
        S.player.energy = Math.min(100, S.player.energy + (def.energy || 0));
        U.toast(`${def.name}: +${def.energy} energy`);
        U.refreshHUD();
        if (onBuy) onBuy();
      }},
      { label: 'Just browsing', fn: () => {} },
    ]);
  };

  /* ================= panels ================= */
  function openPanel(id) {
    $('panel-backdrop').classList.remove('hidden');
    document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
    $(id).classList.remove('hidden');
  }
  U.closePanels = function () {
    $('panel-backdrop').classList.add('hidden');
    document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
    // wipe list contents so stale rows can't fire old closures
    ['picker-list', 'shop-list', 'sell-list'].forEach(id => { $(id).innerHTML = ''; });
  };
  document.querySelectorAll('.panel-close').forEach(b => b.onclick = U.closePanels);
  $('panel-backdrop').onclick = U.closePanels;

  /* ---- inventory ---- */
  $('btn-inventory').onclick = () => { renderInventory(); openPanel('panel-inventory'); };
  function renderInventory() {
    const S = G().state();
    const grid = $('inv-grid');
    grid.innerHTML = '';
    const bi = G().bagInfo ? G().bagInfo() : null;
    $('inv-detail').innerHTML = `<span style="color:#b3a18c">Tap an item.${bi ? ` (${bi.used}/${bi.cap} slots — tools ride free)` : ''}</span>`;
    const keys = Object.keys(S.inv).filter(k => S.inv[k] > 0);
    if (!keys.length) grid.innerHTML = '<div style="grid-column:1/-1;color:#b3a18c;padding:20px;text-align:center">Empty. The farm awaits.</div>';
    for (const k of keys) {
      const def = CS.ITEMS[k];
      const cell = document.createElement('div');
      cell.className = 'inv-cell';
      cell.appendChild(CS.art.iconCanvas(k, 34));
      const quality = ['crop', 'meal', 'animal'].includes(def.type) ? G().qualityOf(k) : null;
      cell.insertAdjacentHTML('beforeend', `<span class="count">${S.inv[k]}</span><span class="inm">${def.name}${quality ? ` · ${quality.toFixed(1)}★` : ''}</span>`);
      cell.onclick = () => {
        grid.querySelectorAll('.inv-cell').forEach(c => c.classList.remove('selected'));
        cell.classList.add('selected');
        let html = `<b>${def.name}</b> ×${S.inv[k]}${quality ? ` · ${quality.toFixed(1)}★ quality` : ''}<br>${def.desc || ''}`;
        if (def.sell) html += `<br>Sells for $${Math.round(def.sell * (G().qualityMult ? G().qualityMult(k) : 1))} before daily demand bonuses.`;
        $('inv-detail').innerHTML = html;
        if (def.energy) {
          const b = document.createElement('button');
          b.className = 'btn small primary';
          b.textContent = `Eat (+${def.energy} energy)`;
          b.onclick = () => { G().eatItem(k); renderInventory(); };
          $('inv-detail').appendChild(document.createElement('br'));
          $('inv-detail').appendChild(b);
        }
        if (!['seed', 'material'].includes(def.type)) {
          const held = G().state().held === k;
          const hb = document.createElement('button');
          hb.className = 'btn small';
          hb.textContent = held ? 'Put away' : 'Hold it';
          hb.onclick = () => { G().setHeld(held ? null : k); U.closePanels(); };
          if (!def.energy) $('inv-detail').appendChild(document.createElement('br'));
          $('inv-detail').appendChild(hb);
        }
      };
      grid.appendChild(cell);
    }
  }

  /* ---- shop ---- */
  U.openShop = function () {
    const S = G().state();
    $('shop-title').textContent = 'Corner Market';
    const list = $('shop-list');
    list.innerHTML = '';
    const stock = CS.SHOP_MARKET.filter(r => (r.season === undefined || r.season === S.time.seasonIndex) && !(r.once && S.inv[r.item]));
    for (const row of stock) {
      const def = CS.ITEMS[row.item];
      const el = document.createElement('div');
      el.className = 'shop-row';
      el.appendChild(CS.art.iconCanvas(row.item, 30));
      el.insertAdjacentHTML('beforeend',
        `<div class="info"><div class="nm">${def.name}</div><div class="ds">${def.desc}</div><div class="owned-count">Owned: ${S.inv[row.item] || 0}</div></div>`);
      let qty = 1;
      const box = document.createElement('div'); box.className = 'shop-buybox';
      const controls = document.createElement('div'); controls.className = 'qty-control';
      const minus = document.createElement('button'); minus.textContent = '−'; minus.setAttribute('aria-label', `Decrease ${def.name} quantity`);
      const amount = document.createElement('output'); amount.textContent = qty;
      const plus = document.createElement('button'); plus.textContent = '+'; plus.setAttribute('aria-label', `Increase ${def.name} quantity`);
      const b = document.createElement('button');
      b.className = 'buy';
      const redraw = () => {
        const max = row.once ? 1 : Math.max(1, Math.min(99, Math.floor(S.player.money / row.price)));
        qty = Math.max(1, Math.min(qty, max)); amount.textContent = qty;
        minus.disabled = qty <= 1; plus.disabled = qty >= max || !!row.once;
        b.textContent = qty === 1 ? `Buy · $${row.price}` : `Buy ${qty} · $${row.price * qty}`;
        b.disabled = S.player.money < row.price * qty;
      };
      minus.onclick = () => { qty--; redraw(); };
      plus.onclick = () => { qty++; redraw(); };
      b.onclick = () => {
        if (!G().buyItem(row.item, row.price, qty)) return;
        U.toast(`Bought ${qty} × ${def.name}`);
        const owned = el.querySelector('.owned-count'); if (owned) owned.textContent = `Owned: ${S.inv[row.item] || 0}`;
        if (row.once) { el.remove(); return; }
        qty = 1; redraw();
      };
      controls.append(minus, amount, plus); box.append(controls, b); el.appendChild(box); redraw();
      list.appendChild(el);
    }
    // aquarium owners can grow the tank (up to three fish)
    if (S.pet && S.pet.type === 'fish' && (S.pet.fishCount || 1) < 3) {
      const def = CS.ITEMS.fancy_fish;
      const el = document.createElement('div');
      el.className = 'shop-row';
      el.appendChild(CS.art.iconCanvas('fancy_fish', 30));
      el.insertAdjacentHTML('beforeend',
        `<div class="info"><div class="nm">${def.name}</div><div class="ds">${def.desc}</div></div>`);
      const b = document.createElement('button');
      b.className = 'buy';
      b.textContent = '$40';
      b.onclick = () => { G().addAquariumFish(40); U.openShop(); };
      el.appendChild(b);
      list.appendChild(el);
    }
    openPanel('panel-shop');
  };

  /* ---- sell (shipping bin, or festival stall at a premium) ---- */
  U.openSell = function (mult, title) {
    mult = mult || 1;
    const S = G().state();
    document.querySelector('#panel-sell h3').textContent = title || 'Shipping Bin';
    const boost = G().sellBoost ? G().sellBoost() : 1;
    const md = G().marketDay ? G().marketDay() : null;
    document.querySelector('#panel-sell .panel-note').textContent = boost > 1
      ? 'Wish granted — everything sells for double today.'
      : mult > 1 ? 'Festival prices — everything sells at a premium tonight.'
      : md ? `${md.label}: ${md.type === 'crop' ? 'produce' : md.type === 'fish' ? 'fish' : 'cooked dishes'} in demand today.`
      : 'Malik trucks the bin to the weekend market. You get paid on the spot.';
    const list = $('sell-list');
    list.innerHTML = '';
    const sellables = Object.keys(S.inv).filter(k => CS.ITEMS[k] && CS.ITEMS[k].sell && S.inv[k] > 0);
    if (!sellables.length) {
      list.innerHTML = '<div style="color:#b3a18c;padding:16px;text-align:center">Nothing to sell yet. Grow something!</div>';
    }
    for (const k of sellables) {
      const def = CS.ITEMS[k];
      // seasonal demand quietly folds into the listed price — the price is the tell
      const em = mult * (G().priceMult ? G().priceMult(k) : 1) * boost;
      const quality = ['crop', 'meal', 'animal'].includes(def.type) && G().qualityOf ? G().qualityOf(k) : null;
      const qm = G().qualityMult ? G().qualityMult(k) : 1;
      const unit = Math.round(def.sell * em * qm);
      const hot = em > mult;
      const el = document.createElement('div');
      el.className = 'shop-row';
      el.appendChild(CS.art.iconCanvas(k, 30));
      el.insertAdjacentHTML('beforeend',
        `<div class="info"><div class="nm">${def.name} ×${S.inv[k]}${quality ? ` · ${quality.toFixed(1)}★` : ''}</div><div class="ds">$${unit} each${mult > 1 ? ' (festival!)' : hot ? ' (in demand)' : quality && quality > 1 ? ' (quality bonus)' : ''}</div></div>`);
      let qty = 1;
      const box = document.createElement('div'); box.className = 'shop-buybox';
      const controls = document.createElement('div'); controls.className = 'qty-control';
      const minus = document.createElement('button'); minus.textContent = '−'; minus.setAttribute('aria-label', `Decrease ${def.name} sale quantity`);
      const amount = document.createElement('output'); amount.textContent = qty;
      const plus = document.createElement('button'); plus.textContent = '+'; plus.setAttribute('aria-label', `Increase ${def.name} sale quantity`);
      const all = document.createElement('button'); all.className = 'qty-all'; all.textContent = 'All'; all.setAttribute('aria-label', `Sell all ${def.name}`);
      const b = document.createElement('button');
      b.className = 'buy sell';
      const redraw = () => {
        const owned = S.inv[k] || 0;
        qty = Math.max(1, Math.min(qty, owned)); amount.textContent = qty;
        minus.disabled = qty <= 1; plus.disabled = qty >= owned; all.disabled = qty >= owned;
        b.textContent = `Sell ${qty} · $${Math.round(def.sell * em * qm * qty)}`;
      };
      minus.onclick = () => { qty--; redraw(); };
      plus.onclick = () => { qty++; redraw(); };
      all.onclick = () => { qty = S.inv[k]; redraw(); };
      b.onclick = () => {
        if (def.rare && !confirm(`Sell ${qty} × ${def.name}? This is a rare find.`)) return;
        G().sellItem(k, qty, em); U.openSell(mult, title);
      };
      controls.append(minus, amount, plus, all); box.append(controls, b); el.appendChild(box); redraw();
      list.appendChild(el);
    }
    openPanel('panel-sell');
  };

  /* ---- the Williamsburg flea (weekends) ---- */
  U.openFlea = function () {
    const S = G().state();
    const week = Math.floor(G().totalDay() / 7);
    if (!S.flea || S.flea.week !== week) {
      // six finds a week, seeded so revisits within the weekend match
      let seed = week * 2654435761 % 2147483647;
      const rnd = () => (seed = seed * 48271 % 2147483647) / 2147483647;
      const pool = [...CS.FLEA_POOL];
      const items = [];
      for (let i = 0; i < 6 && pool.length; i++) {
        const [id, price] = pool.splice(Math.floor(rnd() * pool.length), 1)[0];
        items.push({ id, price: Math.round(price * (0.9 + rnd() * 0.5)), sold: false });
      }
      S.flea = { week, items };
    }
    $('shop-title').textContent = 'Artists & Fleas';
    const list = $('shop-list');
    list.innerHTML = '<div style="font-size:13px;color:#8a7361;padding:0 2px 6px">Weekend stock. Haggling not included; smugness is.</div>';
    S.flea.items.forEach((it) => {
      const def = CS.ITEMS[it.id];
      const el = document.createElement('div');
      el.className = 'shop-row';
      el.appendChild(CS.art.iconCanvas(it.id, 30));
      el.insertAdjacentHTML('beforeend',
        `<div class="info"><div class="nm">${def.name}${def.rare ? ' ★' : ''}</div><div class="ds">${def.desc}</div></div>`);
      const b = document.createElement('button');
      b.className = 'buy';
      b.textContent = it.sold ? 'Sold' : `$${it.price}`;
      b.disabled = it.sold;
      b.onclick = () => {
        if (S.player.money < it.price) { U.toast('Not enough money.'); return; }
        S.player.money -= it.price;
        it.sold = true;
        G().addItem(it.id, 1);
        U.refreshHUD();
        U.toast(`Bought ${def.name}`);
        U.openFlea();
      };
      el.appendChild(b);
      list.appendChild(el);
    });
    openPanel('panel-shop');
  };

  /* ---- thrift (Second Life) ---- */
  U.openThrift = function () {
    const S = G().state();
    const t = G().getThrift();
    $('shop-title').textContent = 'Second Life';
    const list = $('shop-list');
    list.innerHTML = '<div style="font-size:13px;color:#8a7361;padding:0 2px 6px">Today\'s finds — stock turns over daily. The good stuff surfaces when it surfaces.</div>';
    t.items.forEach((it, i) => {
      const def = CS.ITEMS[it.id];
      const el = document.createElement('div');
      el.className = 'shop-row';
      el.appendChild(CS.art.iconCanvas(it.id, 30));
      el.insertAdjacentHTML('beforeend',
        `<div class="info"><div class="nm">${def.name}${def.rare ? ' ★' : ''}</div><div class="ds">${def.desc}</div></div>`);
      const b = document.createElement('button');
      b.className = 'buy';
      b.textContent = it.sold ? 'Sold' : `$${it.price}`;
      b.disabled = it.sold;
      b.onclick = () => { G().buyThrift(i); U.openThrift(); };
      el.appendChild(b);
      list.appendChild(el);
    });
    openPanel('panel-shop');
  };

  /* ---- journal ---- */
  $('btn-journal').onclick = () => {
    // Then & Now earns its place after five years
    const S = G().state();
    const row = document.querySelector('#panel-journal .tab-row');
    if (S.flags.thenNow && !row.querySelector('[data-tab="thennow"]')) {
      const b = document.createElement('button');
      b.className = 'tab'; b.dataset.tab = 'thennow'; b.textContent = 'Then & Now';
      b.onclick = tabClick;
      row.appendChild(b);
    }
    renderJournal('residents');
    openPanel('panel-journal');
  };
  function tabClick() {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('selected'));
    this.classList.add('selected');
    renderJournal(this.dataset.tab);
  }
  document.querySelectorAll('.tab').forEach(t => t.onclick = tabClick);

  function renderJournal(tab) {
    const S = G().state();
    const body = $('journal-body');
    body.innerHTML = '';
    if (tab === 'calendar') {
      const si = S.time.seasonIndex;
      const events = Array.from({ length: 31 }, () => []);
      for (const f of Object.values(CS.FESTIVALS)) {
        if (f.season === si) events[f.day].push({ cls:'festival', text:f.name, title:f.blurb });
      }
      if (S.player.birthSeason === si) events[S.player.birthDay].push({ cls:'birthday', text:'Your birthday', title:'Your birthday' });
      for (const id of Object.keys(CS.NPCS)) {
        const n = CS.NPCS[id], r = S.npcs[id];
        if (n.bday && n.bday[0] === si && r && r.met && G().tierOf(id) >= 2) {
          events[n.bday[1]].push({ cls:'birthday', text:`${n.name.split(' ')[0]}'s birthday`, title:`${n.name}'s birthday` });
        }
      }
      const maturity = {};
      for (const pl of Object.values(S.farm.plots)) {
        if (!pl.crop || pl.dead || !CS.CROPS[pl.crop]) continue;
        const left = Math.max(0, CS.CROPS[pl.crop].days - pl.days);
        const day = S.time.day + left;
        if (day <= 30) maturity[day] = (maturity[day] || 0) + 1;
      }
      for (const day of Object.keys(maturity)) events[day].push({ cls:'crop', text:`${maturity[day]} crop${maturity[day] > 1 ? 's' : ''} ready`, title:'Estimated maturity if watered daily' });
      const firstWeekday = (S.time.weekdayIndex - (S.time.day - 1)) % 7;
      body.insertAdjacentHTML('beforeend', `<div class="calendar-head"><div class="calendar-title">${CS.SEASONS[si]} · Year ${S.time.year}</div><div class="calendar-legend">Festival · Birthday · Crop</div></div>`);
      const grid = document.createElement('div'); grid.className = 'calendar-grid';
      for (const wd of CS.WEEKDAYS) grid.insertAdjacentHTML('beforeend', `<div class="calendar-weekday">${wd.slice(0,1)}</div>`);
      const offset = (firstWeekday + 7) % 7;
      for (let i = 0; i < offset; i++) grid.appendChild(document.createElement('div'));
      for (let d = 1; d <= 30; d++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day' + (d === S.time.day ? ' today' : '') + (d < S.time.day ? ' past' : '');
        cell.insertAdjacentHTML('beforeend', `<div class="calendar-num">${d}</div>`);
        for (const ev of events[d].slice(0, 3)) cell.insertAdjacentHTML('beforeend', `<div class="calendar-event ${ev.cls}" title="${ev.title || ev.text}">${ev.text}</div>`);
        grid.appendChild(cell);
      }
      body.appendChild(grid);
      body.insertAdjacentHTML('beforeend', '<div class="panel-note" style="padding-left:0">Crop dates are estimates and assume daily watering.</div>');
      return;
    }
    if (tab === 'residents') {
      let any = false;
      for (const id of Object.keys(CS.NPCS)) {
        const npc = CS.NPCS[id], r = S.npcs[id];
        if (npc.decorative) continue;
        const card = document.createElement('div');
        card.className = 'res-card';
        if (!r.met) {
          card.innerHTML = `<div class="res-name" style="color:#b3a18c">???</div><div class="res-note" style="color:#b3a18c">Someone you haven't met yet.</div>`;
        } else {
          any = true;
          const st = G().npcStatus(id);
          const tier = CS.TIERS[G().tierOf(id)];
          const pc = document.createElement('canvas');
          pc.width = pc.height = 72;
          pc.style.cssText = 'width:36px;height:36px;border-radius:9px;float:left;margin-right:10px';
          CS.art.portrait(pc, npc.look, npc.id);
          card.appendChild(pc);
          const rel = S.npcs[id].romance === 'seeing' ? tier + ' · Seeing each other' : tier;
          const bd = npc.bday && G().tierOf(id) >= 2
            ? `<div class="res-note" style="color:#9c4f2e">Birthday: ${CS.SEASONS[npc.bday[0]]} ${npc.bday[1]}</div>` : '';
          card.insertAdjacentHTML('beforeend', `<div class="res-name">${npc.name}</div>
            <div class="res-stage">${rel}</div>${bd}
            <div class="res-note" style="clear:both">${npc.bio}</div>
            <div class="res-note" style="margin-top:4px;color:#8a7361">Right now: ${st.act}${st.spot ? '' : ' (not around)'}</div>`);
        }
        body.appendChild(card);
      }
      if (!any) body.insertAdjacentHTML('afterbegin', '<div style="color:#8a7361;padding:4px 0 10px">Talk to people. They\'ll start appearing here.</div>');
    }
    if (tab === 'discoveries') {
      if (!S.discoveries.length) body.innerHTML = '<div style="color:#8a7361">Harbor Point keeps its secrets until you find them.</div>';
      for (const d of [...S.discoveries].reverse()) {
        body.insertAdjacentHTML('beforeend', `<div class="disc-item">${d.text}<div class="disc-date">${d.when}</div></div>`);
      }
    }
    if (tab === 'thennow') {
      const pairs = [];
      pairs.push(['A neglected plot behind a sagging fence. Malik watering it alone.',
        `Harbor Point Community Farm — $${S.totalEarned} earned, ${Object.values(S.shipped).reduce((a, b) => a + b, 0)} harvests shipped. People call it a landmark now.`]);
      if (S.flags.juniperClosed) pairs.push(['Juniper Café: plants in tomato tins, Joan behind the counter.',
        'The papered-over windows, and the THANK YOU JOAN sign in six handwritings. Glasshouse keeps a photo of the old counter by its register.']);
      else if (S.flags.glasshouseClosed) pairs.push(["The 'For Lease' corner unit everyone had stopped seeing.",
        "Glasshouse opened, burned bright for two years, closed. Claire's note is still taped to the glass."]);
      else if (S.flags.glasshouseOpen) pairs.push(["One café. One coffee order. Simple times.",
        'Two cafés, one truce, and a neighborhood that learned it could hold both.']);
      if (S.flags.newWaterfront) pairs.push(['South Point: a lawn, some benches, room to breathe.',
        S.flags.redevAttended
          ? 'The new waterfront — with the farm protected and the benches Priya fought for. The neighborhood showed up, and it shows.'
          : 'The new waterfront — wider, taller, busier. The picnic moved fifty feet north and carried on.']);
      for (const id of Object.keys(S.npcs)) {
        if (S.npcs[id].arc === 'gone') pairs.push([`${CS.NPCS[id].name}, a fixture of the island's daily rhythm.`,
          `${CS.NPCS[id].name.split(' ')[0]} lives in ${S.npcs[id].awayCity || 'another city'} now — and still comes home for the Holiday Market.`]);
      }
      if (S.spouse) pairs.push(['A stranger with boxes and a lease, learning which tram car is quietest.',
        `Married to ${CS.NPCS[S.spouse].name}, under the lighthouse${S.family && S.family.name ? `, raising ${S.family.name}` : ''}. The studio became a home.`]);
      if (S.pet) pairs.push(['An apartment that echoed a little.',
        `${S.pet.name} runs the place now. Affection: ${S.pet.affection}. Worth every can of pet food.`]);
      body.innerHTML = pairs.map(([then, now]) => `
        <div class="res-card">
          <div class="res-stage">THEN</div><div class="res-note">${then}</div>
          <div class="res-stage" style="margin-top:8px">NOW</div><div class="res-note">${now}</div>
        </div>`).join('');
      return;
    }
    if (tab === 'farm') {
      const shippedRows = Object.keys(S.shipped).map(k => `<div class="disc-item">${CS.ITEMS[k].name} — shipped ×${S.shipped[k]}</div>`).join('');
      body.innerHTML = `<div class="res-card">
          <div class="res-name">Harbor Point Community Farm</div>
          <div class="res-note">Total earned: $${S.totalEarned}</div>
          <div class="res-note">Skills: farming ${S.skills.farming} · foraging ${S.skills.foraging} · salvage ${S.skills.salvage} · animal care ${S.skills.animals || 0} · cooking ${S.cookingSkill || 0}</div>
          <div class="res-note">${S.farmUpgrades.coop ? (S.coop.hens.length ? `Community coop: ${S.coop.hens.map(h => `${h.name} (${h.affection || 0} affection)`).join(' · ')} · ${S.coop.eggs.length} egg${S.coop.eggs.length === 1 ? '' : 's'} waiting` : 'Community coop: ready for its first rescue hen whenever you are.') : 'Community coop: available from Malik after farming skill 6.'}</div>
          <div class="res-note">${S.pet ? `Farm morale officer: ${S.pet.name} the ${S.pet.type} (affection ${S.pet.affection})` : 'No pet yet — check the farm noticeboard.'}</div>
        </div>` + (shippedRows || '<div style="color:#8a7361">Nothing shipped yet.</div>');
    }
  }

  /* ---- menu ---- */
  function syncSettingRow(id, value) {
    $(id).querySelectorAll('.chip').forEach(c => c.classList.toggle('selected', c.dataset.v === String(value)));
  }
  $('btn-menu').onclick = () => {
    const s = G().state().settings;
    syncSettingRow('menu-speed', s.speed || 1);
    syncSettingRow('menu-sound', s.sound === false ? 'off' : 'on');
    syncSettingRow('menu-textsize', s.textSize || 'standard');
    syncSettingRow('menu-motion', s.motion || 'full');
    syncSettingRow('menu-weatherfx', s.weatherFx || 'full');
    openPanel('panel-menu');
  };
  $('menu-save').onclick = () => {
    const S = G().state();
    if (G().saveToSlot(S.slot)) U.toast('Saved');
    U.closePanels();
  };
  $('menu-mainmenu').onclick = () => {
    const S = G().state();
    G().saveToSlot(S.slot);
    location.reload();
  };
  $('menu-export').onclick = () => { G().exportSave(); };
  // import lives on the main menu (writes to the first empty slot)
  $('menu-import').onclick = () => $('import-file').click();
  $('import-file').addEventListener('change', (ev) => {
    const file = ev.target.files && ev.target.files[0];
    ev.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const err = CS.game.importSave(reader.result);
      if (err) alert(err);
      else U.renderMenu();
    };
    reader.readAsText(file);
  });
  $('menu-speed').querySelectorAll('.chip').forEach(c => c.onclick = () => {
    $('menu-speed').querySelectorAll('.chip').forEach(x => x.classList.remove('selected'));
    c.classList.add('selected');
    G().state().settings.speed = parseInt(c.dataset.v);
  });
  $('menu-sound').querySelectorAll('.chip').forEach(c => c.onclick = () => {
    $('menu-sound').querySelectorAll('.chip').forEach(x => x.classList.remove('selected'));
    c.classList.add('selected');
    CS.audio.setEnabled(c.dataset.v === 'on');
  });
  function bindComfortRow(id, key) {
    $(id).querySelectorAll('.chip').forEach(c => c.onclick = () => {
      syncSettingRow(id, c.dataset.v);
      G().state().settings[key] = c.dataset.v;
      U.refreshHUD();
    });
  }
  bindComfortRow('menu-textsize', 'textSize');
  bindComfortRow('menu-motion', 'motion');
  bindComfortRow('menu-weatherfx', 'weatherFx');
  $('cheat-go').onclick = () => {
    const v = $('cheat-input').value;
    if (!v.trim()) return;
    const res = CS.game.cheat(v);
    $('cheat-log').innerHTML = `<div>&gt; ${v} → ${res}</div>` + $('cheat-log').innerHTML;
    $('cheat-input').value = '';
  };
  $('cheat-input').addEventListener('keydown', e => { if (e.key === 'Enter') $('cheat-go').onclick(); });

  /* ---- picker (seeds etc.) ---- */
  U.pick = function (title, options) {
    $('picker-title').textContent = title;
    const list = $('picker-list');
    list.innerHTML = '';
    for (const o of options) {
      const el = document.createElement('div');
      el.className = 'shop-row';
      if (o.icon) el.appendChild(CS.art.iconCanvas(o.icon, 30));
      el.insertAdjacentHTML('beforeend',
        `<div class="info"><div class="nm">${o.name}</div><div class="ds">${o.desc || ''}</div></div>`);
      const b = document.createElement('button');
      b.className = 'buy';
      b.textContent = 'Pick';
      b.onclick = () => { U.closePanels(); o.fn(); };
      el.appendChild(b);
      list.appendChild(el);
    }
    openPanel('panel-picker');
  };

  /* ================= screens ================= */
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    $(id).classList.add('active');
  }
  U.showScreen = showScreen;

  /* ---- main menu / save slots ---- */
  const NUM_SLOTS = 3;
  U.renderMenu = function () {
    const list = $('slot-list');
    list.innerHTML = '';
    for (let i = 0; i < NUM_SLOTS; i++) {
      const sum = CS.game.slotSummary(i);
      const card = document.createElement('div');
      card.className = 'slot-card' + (sum ? '' : ' empty');
      if (sum) {
        card.innerHTML = `<div class="slot-main">
            <span class="slot-title">${sum.name}</span>
            <span class="slot-sub">${sum.date} · $${sum.money}${sum.pet ? ' · with ' + sum.pet : ''}</span>
          </div>`;
        const del = document.createElement('button');
        del.className = 'slot-del';
        del.textContent = 'Delete';
        del.onclick = (e) => {
          e.stopPropagation();
          if (confirm(`Delete ${sum.name}'s save? This can't be undone.`)) {
            CS.game.deleteSlot(i);
            U.renderMenu();
          }
        };
        card.appendChild(del);
        card.onclick = () => {
          const data = CS.game.loadSlot(i);
          if (data) { showScreen('screen-game'); CS.game.start(data); }
        };
      } else {
        card.innerHTML = `<div class="slot-main">
            <span class="slot-title">＋ New Game</span>
            <span class="slot-sub">Slot ${i + 1} — empty</span>
          </div>`;
        card.onclick = () => startCreation(i);
      }
      list.appendChild(card);
    }
    showScreen('screen-menu');
  };

  /* ---- character creation ---- */
  const cc = { slot: 0, gender: 'F', pref: 'discover', difficulty: 'standard', bseason: 0, bday: 1, look: { skin: 0, hair: 0, hairStyle: 'short', outfit: 0 } };

  function startCreation(slot) {
    cc.slot = slot;
    $('cc-name').value = '';
    buildSwatches();
    buildBdays();
    updatePreview();
    showScreen('screen-create');
  }

  function chipRow(id, onPick) {
    $(id).querySelectorAll('.chip').forEach(c => c.onclick = () => {
      $(id).querySelectorAll('.chip').forEach(x => x.classList.remove('selected'));
      c.classList.add('selected');
      onPick(c.dataset.v);
    });
  }
  chipRow('cc-gender', v => cc.gender = v);
  chipRow('cc-diff', v => cc.difficulty = v);
  chipRow('cc-pref', v => cc.pref = v);
  chipRow('cc-bseason', v => { cc.bseason = parseInt(v); });
  chipRow('cc-hairstyle', v => { cc.look.hairStyle = v; updatePreview(); });

  function buildBdays() {
    const row = $('cc-bday');
    row.innerHTML = '';
    for (let d = 1; d <= 30; d++) {
      const b = document.createElement('button');
      b.className = 'chip day' + (d === cc.bday ? ' selected' : '');
      b.textContent = d;
      b.onclick = () => {
        row.querySelectorAll('.chip').forEach(x => x.classList.remove('selected'));
        b.classList.add('selected');
        cc.bday = d;
      };
      row.appendChild(b);
    }
  }

  function buildSwatches() {
    const make = (id, colors, key) => {
      const row = $(id);
      row.innerHTML = '';
      colors.forEach((col, i) => {
        const s = document.createElement('div');
        s.className = 'swatch' + (i === cc.look[key] ? ' selected' : '');
        s.style.background = col;
        s.onclick = () => {
          row.querySelectorAll('.swatch').forEach(x => x.classList.remove('selected'));
          s.classList.add('selected');
          cc.look[key] = i;
          updatePreview();
        };
        row.appendChild(s);
      });
    };
    make('cc-skin', CS.SKINS, 'skin');
    make('cc-hair', CS.HAIRS, 'hair');
    make('cc-outfit', CS.OUTFITS, 'outfit');
  }

  function updatePreview() {
    CS.engine.drawPlayerPreview($('cc-preview'), cc.look);
  }

  $('cc-random').onclick = () => {
    const names = ['Alex', 'Casey', 'Jamie', 'Jordan', 'Morgan', 'Quinn', 'Riley', 'Sam', 'Taylor'];
    $('cc-name').value = names[Math.floor(Math.random() * names.length)];
    cc.gender = Math.random() < .5 ? 'F' : 'M';
    cc.pref = ['discover', 'M', 'W', 'MW', 'none'][Math.floor(Math.random() * 5)];
    cc.bseason = Math.floor(Math.random() * 4);
    cc.bday = 1 + Math.floor(Math.random() * 30);
    cc.look.skin = Math.floor(Math.random() * CS.SKINS.length);
    cc.look.hair = Math.floor(Math.random() * CS.HAIRS.length);
    cc.look.hairStyle = ['short', 'long', 'bun'][Math.floor(Math.random() * 3)];
    cc.look.outfit = Math.floor(Math.random() * CS.OUTFITS.length);
    const select = (id, value) => {
      $(id).querySelectorAll('.chip').forEach(c => c.classList.toggle('selected', c.dataset.v === String(value)));
    };
    select('cc-gender', cc.gender); select('cc-pref', cc.pref); select('cc-bseason', cc.bseason); select('cc-hairstyle', cc.look.hairStyle);
    buildBdays(); buildSwatches(); updatePreview();
    $('cc-random').textContent = 'Try another look';
  };

  $('cc-back').onclick = () => U.renderMenu();
  $('cc-start').onclick = () => {
    const name = $('cc-name').value.trim();
    if (!name) { $('cc-name').style.borderColor = '#c74f6d'; $('cc-name').focus(); return; }
    const player = {
      name, gender: cc.gender, pref: cc.pref, difficulty: cc.difficulty,
      birthSeason: cc.bseason, birthDay: cc.bday,
      look: { ...cc.look },
    };
    const state = CS.game.newState(player, cc.slot);
    // New Game+: a finished life leaves its recipes behind
    try {
      const ng = JSON.parse(localStorage.getItem('concreteSeasons_ngplus') || 'null');
      if (ng && ng.recipes) {
        state.recipes = [...new Set([...(state.recipes || []), ...ng.recipes])];
        state.ngplus = true;
      }
    } catch (e) {}
    showScreen('screen-game');
    CS.game.start(state);
    if (state.ngplus) U.toast('New Game+ — the recipes you learned in another life came with you');
    CS.game.saveToSlot(cc.slot);
  };
})();
