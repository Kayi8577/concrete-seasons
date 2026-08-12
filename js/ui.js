/* =========================================================================
   Concrete Seasons — ui.js
   HUD, panels, dialogue, menus, character creation, save slots.
   ========================================================================= */
(function () {
  const U = CS.ui = {};
  const $ = id => document.getElementById(id);
  const G = () => CS.game;

  let dialogueQueue = [], dialogueDone = null, choiceMode = false;

  U.blocking = function () {
    return !$('dialogue').classList.contains('hidden')
      || !$('panel-backdrop').classList.contains('hidden')
      || !$('screen-game').classList.contains('active');
  };

  /* ================= HUD ================= */
  U.refreshHUD = function () {
    const S = G().state();
    if (!S) return;
    $('hud-date').textContent = G().dateText() + ` · Y${S.time.year}`;
    $('hud-time').innerHTML = `${G().clockText()} <span id="hud-weather">${CS.art.weatherSVG(S.weather.today)}</span>`;
    $('hud-money').textContent = '$' + S.player.money;
    $('hud-energy').style.width = Math.max(0, S.player.energy) + '%';
    $('hud-energy').style.background = S.player.energy < 25 ? '#c74f6d' : '';
  };

  let labelTimer = null;
  U.showSceneLabel = function (text) {
    const el = $('scene-label');
    el.textContent = text;
    el.style.opacity = 1;
    clearTimeout(labelTimer);
    labelTimer = setTimeout(() => { el.style.opacity = 0; }, 2200);
  };

  U.toast = function (text, cls) {
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

  U.dialogue = function (npc, lines, done) {
    const pc = $('dlg-portrait');
    if (npc) CS.art.portrait(pc, npc.look); else CS.art.narratorPortrait(pc);
    $('dlg-name').textContent = npc ? npc.name : '';
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

  U.buyPrompt = function (itemId, price, desc) {
    const def = CS.ITEMS[itemId];
    U.choose(`${def.name} — $${price}. ${desc}`, [
      { label: `Buy & enjoy ($${price})`, fn: () => {
        const S = G().state();
        if (S.player.money < price) { U.toast('Not enough money.'); return; }
        S.player.money -= price;
        S.player.energy = Math.min(100, S.player.energy + (def.energy || 0));
        U.toast(`${def.name}: +${def.energy} energy`);
        U.refreshHUD();
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
  };
  document.querySelectorAll('.panel-close').forEach(b => b.onclick = U.closePanels);
  $('panel-backdrop').onclick = U.closePanels;

  /* ---- inventory ---- */
  $('btn-inventory').onclick = () => { renderInventory(); openPanel('panel-inventory'); };
  function renderInventory() {
    const S = G().state();
    const grid = $('inv-grid');
    grid.innerHTML = '';
    $('inv-detail').innerHTML = '<span style="color:#b3a18c">Tap an item.</span>';
    const keys = Object.keys(S.inv).filter(k => S.inv[k] > 0);
    if (!keys.length) grid.innerHTML = '<div style="grid-column:1/-1;color:#b3a18c;padding:20px;text-align:center">Empty. The farm awaits.</div>';
    for (const k of keys) {
      const def = CS.ITEMS[k];
      const cell = document.createElement('div');
      cell.className = 'inv-cell';
      cell.appendChild(CS.art.iconCanvas(k, 34));
      cell.insertAdjacentHTML('beforeend', `<span class="count">${S.inv[k]}</span>`);
      cell.onclick = () => {
        grid.querySelectorAll('.inv-cell').forEach(c => c.classList.remove('selected'));
        cell.classList.add('selected');
        let html = `<b>${def.name}</b> ×${S.inv[k]}<br>${def.desc || ''}`;
        if (def.sell) html += `<br>Sells for $${def.sell} at the shipping bin.`;
        $('inv-detail').innerHTML = html;
        if (def.energy) {
          const b = document.createElement('button');
          b.className = 'btn small primary';
          b.textContent = `Eat (+${def.energy} energy)`;
          b.onclick = () => { G().eatItem(k); renderInventory(); };
          $('inv-detail').appendChild(document.createElement('br'));
          $('inv-detail').appendChild(b);
        }
      };
      grid.appendChild(cell);
    }
  }

  /* ---- shop ---- */
  U.openShop = function () {
    const S = G().state();
    const list = $('shop-list');
    list.innerHTML = '';
    for (const row of CS.SHOP_MARKET) {
      const def = CS.ITEMS[row.item];
      const el = document.createElement('div');
      el.className = 'shop-row';
      el.appendChild(CS.art.iconCanvas(row.item, 30));
      el.insertAdjacentHTML('beforeend',
        `<div class="info"><div class="nm">${def.name}</div><div class="ds">${def.desc}</div></div>`);
      const b = document.createElement('button');
      b.className = 'buy';
      b.textContent = `$${row.price}`;
      b.onclick = () => { if (G().buyItem(row.item, row.price)) U.toast(`Bought ${def.name}`); };
      el.appendChild(b);
      list.appendChild(el);
    }
    openPanel('panel-shop');
  };

  /* ---- sell ---- */
  U.openSell = function () {
    const S = G().state();
    const list = $('sell-list');
    list.innerHTML = '';
    const sellables = Object.keys(S.inv).filter(k => CS.ITEMS[k] && CS.ITEMS[k].sell && S.inv[k] > 0);
    if (!sellables.length) {
      list.innerHTML = '<div style="color:#b3a18c;padding:16px;text-align:center">Nothing to sell yet. Grow something!</div>';
    }
    for (const k of sellables) {
      const def = CS.ITEMS[k];
      const el = document.createElement('div');
      el.className = 'shop-row';
      el.appendChild(CS.art.iconCanvas(k, 30));
      el.insertAdjacentHTML('beforeend',
        `<div class="info"><div class="nm">${def.name} ×${S.inv[k]}</div><div class="ds">$${def.sell} each</div></div>`);
      const b = document.createElement('button');
      b.className = 'buy sell';
      b.textContent = `Sell all ($${def.sell * S.inv[k]})`;
      b.onclick = () => { G().sellItem(k, S.inv[k]); U.openSell(); };
      el.appendChild(b);
      list.appendChild(el);
    }
    openPanel('panel-sell');
  };

  /* ---- journal ---- */
  $('btn-journal').onclick = () => { renderJournal('residents'); openPanel('panel-journal'); };
  document.querySelectorAll('.tab').forEach(t => t.onclick = () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('selected'));
    t.classList.add('selected');
    renderJournal(t.dataset.tab);
  });

  function renderJournal(tab) {
    const S = G().state();
    const body = $('journal-body');
    body.innerHTML = '';
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
          CS.art.portrait(pc, npc.look);
          card.appendChild(pc);
          card.insertAdjacentHTML('beforeend', `<div class="res-name">${npc.name}</div>
            <div class="res-stage">${tier}</div>
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
    if (tab === 'farm') {
      const shippedRows = Object.keys(S.shipped).map(k => `<div class="disc-item">${CS.ITEMS[k].name} — shipped ×${S.shipped[k]}</div>`).join('');
      body.innerHTML = `<div class="res-card">
          <div class="res-name">Harbor Point Community Farm</div>
          <div class="res-note">Total earned: $${S.totalEarned}</div>
          <div class="res-note">${S.pet ? `Farm morale officer: ${S.pet.name} the ${S.pet.type} (affection ${S.pet.affection})` : 'No pet yet — check the farm noticeboard.'}</div>
        </div>` + (shippedRows || '<div style="color:#8a7361">Nothing shipped yet.</div>');
    }
  }

  /* ---- menu ---- */
  $('btn-menu').onclick = () => openPanel('panel-menu');
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
  $('menu-speed').querySelectorAll('.chip').forEach(c => c.onclick = () => {
    $('menu-speed').querySelectorAll('.chip').forEach(x => x.classList.remove('selected'));
    c.classList.add('selected');
    G().state().settings.speed = parseInt(c.dataset.v);
  });
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
  const cc = { slot: 0, gender: 'F', bseason: 0, bday: 1, look: { skin: 0, hair: 0, hairStyle: 'short', outfit: 0 } };

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

  $('cc-back').onclick = () => U.renderMenu();
  $('cc-start').onclick = () => {
    const name = $('cc-name').value.trim();
    if (!name) { $('cc-name').style.borderColor = '#c74f6d'; $('cc-name').focus(); return; }
    const player = {
      name, gender: cc.gender,
      birthSeason: cc.bseason, birthDay: cc.bday,
      look: { ...cc.look },
    };
    const state = CS.game.newState(player, cc.slot);
    CS.game.saveToSlotRaw && CS.game.saveToSlotRaw(state);
    showScreen('screen-game');
    CS.game.start(state);
    CS.game.saveToSlot(cc.slot);
  };
})();
