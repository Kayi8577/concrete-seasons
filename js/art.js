/* =========================================================================
   Concrete Seasons — art.js
   All visual assets, drawn procedurally in canvas. No emoji, no images.
   Style: cozy flat vector — sage greens, warm earth tones, rounded forms,
   soft upper-left light. Single source of truth for every sprite & icon.
   ========================================================================= */
(function () {
  const A = CS.art = {};

  A.PAL = {
    leafDark: '#54713e', leaf: '#729043', leafLight: '#adc685', leafPale: '#cfe0b4',
    wood: '#7b6855', woodLight: '#958270', woodDark: '#5d4e40',
    paper: '#ccc1b5', cream: '#f3ead8',
    red: '#c9553e', berry: '#c74f6d', pink: '#d98ba4', orange: '#d98e4a', yellow: '#e8c96b',
    sky: '#a9c7d8', water: '#5b87a8', glass: '#bcd8d0',
    dark: '#3d3229', shadow: 'rgba(40,32,24,.18)',
  };
  const P = A.PAL;

  function sh(ctx, cx, cy, rx, ry) { // soft ground shadow
    ctx.fillStyle = P.shadow;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  }
  function circle(ctx, x, y, r, col) {
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  function rr(ctx, x, y, w, h, r, col) {
    ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
  }

  /* ================= outdoor tiles ================= */
  A.tree = function (ctx, sx, sy, T, seed) {
    const cx = sx + T / 2;
    sh(ctx, cx, sy + T - 4, T * .32, 3.5);
    rr(ctx, cx - 2.5, sy + T * .55, 5, T * .38, 2, P.wood);
    const v = (seed % 3);
    circle(ctx, cx, sy + T * .42, T * .34, P.leafDark);
    circle(ctx, cx - T * .14, sy + T * .34, T * .26, P.leaf);
    circle(ctx, cx + T * .13, sy + T * .30 + v, T * .24, P.leaf);
    circle(ctx, cx - T * .08, sy + T * .24, T * .17, P.leafLight); // top-left light
  };

  A.cherryTree = function (ctx, sx, sy, T, seed) {
    const cx = sx + T / 2;
    sh(ctx, cx, sy + T - 4, T * .32, 3.5);
    rr(ctx, cx - 2.5, sy + T * .55, 5, T * .38, 2, P.wood);
    const v = (seed % 3);
    circle(ctx, cx, sy + T * .42, T * .34, '#c98ba0');
    circle(ctx, cx - T * .14, sy + T * .34, T * .26, '#dba7b8');
    circle(ctx, cx + T * .13, sy + T * .30 + v, T * .24, '#dba7b8');
    circle(ctx, cx - T * .08, sy + T * .24, T * .17, '#eec6d2');
  };

  A.lighthouse = function (ctx, sx, sy, T) {
    const cx = sx + T / 2;
    sh(ctx, cx, sy + T - 3, T * .38, 3.5);
    // tower (extends one tile up, drawn oversize)
    ctx.fillStyle = '#e8e0d0';
    ctx.beginPath();
    ctx.moveTo(cx - T * .30, sy + T - 4);
    ctx.lineTo(cx - T * .18, sy - T * .55);
    ctx.lineTo(cx + T * .18, sy - T * .55);
    ctx.lineTo(cx + T * .30, sy + T - 4);
    ctx.closePath(); ctx.fill();
    // red bands
    ctx.fillStyle = P.red;
    ctx.fillRect(cx - T * .27, sy + T * .35, T * .54, T * .18);
    ctx.fillRect(cx - T * .22, sy - T * .25, T * .44, T * .16);
    // lamp room
    rr(ctx, cx - T * .16, sy - T * .85, T * .32, T * .3, 2, '#4d4a5e');
    rr(ctx, cx - T * .11, sy - T * .8, T * .22, T * .2, 1.5, P.yellow);
    // cap
    ctx.fillStyle = '#3d3a4a';
    ctx.beginPath();
    ctx.moveTo(cx - T * .2, sy - T * .85);
    ctx.lineTo(cx, sy - T * 1.05);
    ctx.lineTo(cx + T * .2, sy - T * .85);
    ctx.closePath(); ctx.fill();
  };

  A.crib = function (ctx, sx, sy, T, t) {
    sh(ctx, sx + T / 2, sy + T - 3, T * .36, 3);
    rr(ctx, sx + 3, sy + 8, T - 6, T - 14, 3, '#c9ad85');
    rr(ctx, sx + 5, sy + 10, T - 10, T - 18, 2, P.cream);
    // rails
    ctx.strokeStyle = '#a98a60'; ctx.lineWidth = 1.6;
    for (let i = 1; i < 5; i++) {
      ctx.beginPath(); ctx.moveTo(sx + 3 + i * (T - 6) / 5, sy + 8); ctx.lineTo(sx + 3 + i * (T - 6) / 5, sy + T - 6); ctx.stroke();
    }
    // the bundle, breathing
    const br = Math.sin((t || 0) / 800) * .6;
    circle(ctx, sx + T / 2, sy + T / 2 + 1, 5 + br, '#e8c4a8');
    circle(ctx, sx + T / 2 - 1.5, sy + T / 2, .8, P.dark);
    circle(ctx, sx + T / 2 + 1.5, sy + T / 2, .8, P.dark);
    // mobile star
    circle(ctx, sx + T - 8, sy + 6 + Math.sin((t || 0) / 1100) * 1.5, 2, P.yellow);
  };

  A.toddler = function (ctx, sx, sy, T, t) {
    const cx = sx + T / 2, cy = sy + T / 2;
    sh(ctx, cx, sy + T - 4, 6, 2.4);
    const bob = Math.sin((t || 0) / 300) * 1;
    rr(ctx, cx - 5, cy + 2 + bob, 10, 9, 4, '#d98e4a');
    circle(ctx, cx, cy - 2 + bob, 5.5, '#e8c4a8');
    ctx.fillStyle = P.dark;
    ctx.beginPath(); ctx.arc(cx, cy - 6 + bob, 5.5, Math.PI * 1.1, Math.PI * 1.9); ctx.fill();
    circle(ctx, cx - 2, cy - 2 + bob, .9, P.dark);
    circle(ctx, cx + 2, cy - 2 + bob, .9, P.dark);
  };

  A.bunting = function (ctx, sx, sy, T, seed) {
    const cols = ['#c9553e', '#d98e4a', '#e8c96b', '#729043', '#5b87a8', '#7d5ba6'];
    ctx.strokeStyle = 'rgba(61,50,41,.5)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx - T, sy + 4);
    ctx.quadraticCurveTo(sx + T, sy + 12, sx + T * 3, sy + 4);
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const fx = sx - T + (i + .5) * (T * 4 / 6);
      const fy = sy + 5 + Math.sin((i / 6) * Math.PI) * 6;
      ctx.fillStyle = cols[(i + (seed || 0)) % 6];
      ctx.beginPath();
      ctx.moveTo(fx - 4, fy); ctx.lineTo(fx + 4, fy); ctx.lineTo(fx, fy + 8);
      ctx.closePath(); ctx.fill();
    }
  };

  A.barrier = function (ctx, sx, sy, T) {
    sh(ctx, sx + T / 2, sy + T - 4, T * .4, 3);
    ctx.fillStyle = '#c9a24b';
    ctx.beginPath(); ctx.roundRect(sx + 2, sy + T * .3, T - 4, T * .22, 2); ctx.fill();
    ctx.fillStyle = '#8a5a2a';
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.translate(sx + 6 + i * (T - 12) / 2.5, sy + T * .3);
      ctx.transform(1, 0, -.5, 1, 0, 0);
      ctx.fillRect(0, 0, 4, T * .22);
      ctx.restore();
    }
    ctx.fillStyle = '#6b5b4c';
    ctx.fillRect(sx + 5, sy + T * .5, 3, T * .38);
    ctx.fillRect(sx + T - 8, sy + T * .5, 3, T * .38);
  };

  A.lantern = function (ctx, sx, sy, T, t) {
    const cx = sx + T / 2;
    sh(ctx, cx, sy + T - 3, T * .2, 2.5);
    ctx.fillStyle = '#4a4642';
    ctx.fillRect(cx - 1.5, sy + T * .3, 3, T * .66);
    const sway = Math.sin((t || 0) / 1200 + sx) * 1.2;
    // red lantern
    ctx.fillStyle = P.red;
    ctx.beginPath(); ctx.ellipse(cx + sway, sy + T * .26, 5.5, 6.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,220,150,.55)';
    ctx.beginPath(); ctx.ellipse(cx + sway - 1.5, sy + T * .24, 2, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = P.yellow;
    ctx.fillRect(cx + sway - 2, sy + T * .12, 4, 3);
    ctx.fillRect(cx + sway - 1.5, sy + T * .43, 3, 4);
  };

  A.stall = function (ctx, sx, sy, T, active) {
    sh(ctx, sx + T / 2, sy + T - 3, T * .4, 3);
    // table
    rr(ctx, sx + 3, sy + T * .5, T - 6, T * .34, 2, P.wood);
    rr(ctx, sx + 3, sy + T * .5, T - 6, 4, 2, P.woodLight);
    // awning
    ctx.fillStyle = active ? P.red : '#a8a49c';
    ctx.beginPath();
    ctx.moveTo(sx + 1, sy + T * .3); ctx.lineTo(sx + T - 1, sy + T * .3);
    ctx.lineTo(sx + T - 3, sy + T * .48); ctx.lineTo(sx + 3, sy + T * .48);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = active ? '#e8e0d0' : '#c4c0b8';
    for (let i = 0; i < 3; i++) ctx.fillRect(sx + 4 + i * (T - 8) / 3 + 2, sy + T * .3, (T - 8) / 6, T * .18);
    // posts
    ctx.fillStyle = P.woodDark;
    ctx.fillRect(sx + 4, sy + T * .46, 2.5, T * .38);
    ctx.fillRect(sx + T - 7, sy + T * .46, 2.5, T * .38);
    if (active) { // goods + lantern glow
      rr(ctx, sx + 8, sy + T * .42, 6, 5, 1.5, P.leafLight);
      rr(ctx, sx + 17, sy + T * .42, 6, 5, 1.5, P.red);
      circle(ctx, sx + T / 2, sy + T * .2, 3, 'rgba(232,201,107,.9)');
    }
  };

  A.bench = function (ctx, sx, sy, T) {
    sh(ctx, sx + T / 2, sy + T - 5, T * .38, 3);
    rr(ctx, sx + 4, sy + T * .40, T - 8, 5, 2, P.woodLight);
    rr(ctx, sx + 4, sy + T * .40 + 7, T - 8, 4, 2, P.wood);
    ctx.fillStyle = P.woodDark;
    ctx.fillRect(sx + 7, sy + T * .40 + 11, 3, T * .22);
    ctx.fillRect(sx + T - 10, sy + T * .40 + 11, 3, T * .22);
    rr(ctx, sx + 4, sy + T * .40 - 9, T - 8, 4, 2, P.woodLight); // backrest
  };

  A.bin = function (ctx, sx, sy, T) { // shipping crate
    sh(ctx, sx + T / 2, sy + T - 4, T * .40, 3.5);
    rr(ctx, sx + 4, sy + 8, T - 8, T - 14, 3, P.wood);
    rr(ctx, sx + 4, sy + 8, T - 8, 5, 3, P.woodLight);
    ctx.fillStyle = P.woodDark;
    ctx.fillRect(sx + 8, sy + 16, T - 16, 2.5);
    ctx.fillRect(sx + 8, sy + 22, T - 16, 2.5);
    // slot opening
    rr(ctx, sx + 9, sy + 10, T - 18, 3, 1.5, '#2f2822');
  };

  A.board = function (ctx, sx, sy, T) { // noticeboard
    sh(ctx, sx + T / 2, sy + T - 3, T * .34, 3);
    ctx.fillStyle = P.woodDark;
    ctx.fillRect(sx + T / 2 - 2, sy + 12, 4, T - 16);
    rr(ctx, sx + 4, sy + 4, T - 8, T * .52, 3, P.wood);
    rr(ctx, sx + 6.5, sy + 6.5, T - 13, T * .52 - 5, 2, P.paper);
    // pinned notes
    rr(ctx, sx + 9, sy + 9, 7, 8, 1, P.cream);
    rr(ctx, sx + 18, sy + 8, 8, 6, 1, '#e9d9a8');
    rr(ctx, sx + 12, sy + 15, 9, 5, 1, '#dfe7d2');
  };

  A.planter = function (ctx, sx, sy, T) {
    rr(ctx, sx + 5, sy + T * .5, T - 10, T * .34, 3, P.wood);
    rr(ctx, sx + 5, sy + T * .5, T - 10, 4, 3, P.woodLight);
    const cols = [P.berry, P.yellow, P.pink];
    for (let i = 0; i < 3; i++) {
      const fx = sx + 10 + i * (T - 20) / 2, fy = sy + T * .40;
      ctx.strokeStyle = P.leaf; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(fx, sy + T * .52); ctx.lineTo(fx, fy + 2); ctx.stroke();
      circle(ctx, fx, fy, 3, cols[i]);
      circle(ctx, fx - 1, fy - 1, 1.1, 'rgba(255,255,255,.5)');
    }
  };

  A.doorOut = function (ctx, sx, sy, T, accent) { // exterior door
    rr(ctx, sx + 5, sy + 3, T - 10, T - 5, 3, P.woodDark);
    rr(ctx, sx + 7, sy + 5, T - 14, T - 9, 2, accent || '#8a5a3b');
    rr(ctx, sx + 9, sy + 7, (T - 18) / 2 - 1, T - 13, 1.5, 'rgba(255,255,255,.07)');
    circle(ctx, sx + T - 12, sy + T / 2, 1.8, P.yellow);
  };

  A.doorMat = function (ctx, sx, sy, T) { // interior exit
    rr(ctx, sx + 4, sy + 6, T - 8, T - 12, 3, '#b3987a');
    rr(ctx, sx + 7, sy + 9, T - 14, T - 18, 2, '#c4ac90');
    ctx.strokeStyle = 'rgba(93,78,64,.5)'; ctx.lineWidth = 1.4;
    // arrow down
    ctx.beginPath();
    ctx.moveTo(sx + T / 2, sy + T * .36); ctx.lineTo(sx + T / 2, sy + T * .62);
    ctx.moveTo(sx + T / 2 - 4, sy + T * .54); ctx.lineTo(sx + T / 2, sy + T * .62);
    ctx.lineTo(sx + T / 2 + 4, sy + T * .54);
    ctx.stroke();
  };

  /* ================= interior furniture ================= */
  A.stove = function (ctx, sx, sy, T) {
    rr(ctx, sx + 3, sy + 6, T - 6, T - 10, 3, '#d8d2c6');
    rr(ctx, sx + 3, sy + 6, T - 6, 5, 3, '#e6e1d6');
    circle(ctx, sx + T * .33, sy + T * .45, 4.5, '#8f8a80');
    circle(ctx, sx + T * .67, sy + T * .45, 4.5, '#8f8a80');
    circle(ctx, sx + T * .33, sy + T * .45, 2.2, '#6b665e');
    circle(ctx, sx + T * .67, sy + T * .45, 2.2, '#6b665e');
    rr(ctx, sx + 8, sy + T - 12, T - 16, 5, 2, '#b8b2a6');
  };

  A.windowTile = function (ctx, sx, sy, T, night, rain) {
    rr(ctx, sx + 4, sy + 4, T - 8, T - 10, 3, P.wood);
    const skyCol = night ? '#31456e' : (rain ? '#8fa6b5' : P.sky);
    rr(ctx, sx + 7, sy + 7, T - 14, T - 16, 2, skyCol);
    if (night) { circle(ctx, sx + T - 14, sy + 12, 2.5, P.cream); }
    else { circle(ctx, sx + 13, sy + 12, 3, 'rgba(255,255,255,.75)'); circle(ctx, sx + 18, sy + 13, 2.4, 'rgba(255,255,255,.6)'); }
    ctx.strokeStyle = P.wood; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(sx + T / 2, sy + 7); ctx.lineTo(sx + T / 2, sy + T - 9); ctx.stroke();
  };

  A.table = function (ctx, sx, sy, T) {
    rr(ctx, sx + 3, sy + 6, T - 6, T - 12, 4, '#a3785a');
    rr(ctx, sx + 3, sy + 6, T - 6, 5, 4, '#b78a68');
  };

  A.shelf = function (ctx, sx, sy, T) {
    rr(ctx, sx + 3, sy + 4, T - 6, T - 8, 2, P.wood);
    ctx.fillStyle = P.woodDark;
    ctx.fillRect(sx + 5, sy + T * .38, T - 10, 2.5);
    ctx.fillRect(sx + 5, sy + T * .68, T - 10, 2.5);
    // goods
    rr(ctx, sx + 7, sy + 8, 6, 8, 1.5, P.red);
    rr(ctx, sx + 15, sy + 9, 6, 7, 1.5, P.yellow);
    rr(ctx, sx + 23, sy + 8, 5, 8, 1.5, P.leafLight);
    rr(ctx, sx + 8, sy + T * .42, 7, 7, 1.5, P.sky);
    rr(ctx, sx + 18, sy + T * .42, 8, 7, 1.5, P.orange);
  };

  A.oven = function (ctx, sx, sy, T) {
    rr(ctx, sx + 3, sy + 4, T - 6, T - 8, 3, '#8f7f70');
    ctx.fillStyle = '#5d5248';
    ctx.beginPath(); ctx.roundRect(sx + 7, sy + 10, T - 14, T - 18, [8, 8, 2, 2]); ctx.fill();
    ctx.fillStyle = '#d9773c';
    ctx.beginPath(); ctx.roundRect(sx + 10, sy + 14, T - 20, T - 24, [6, 6, 1, 1]); ctx.fill();
    ctx.fillStyle = '#f0a45c';
    ctx.beginPath(); ctx.roundRect(sx + 13, sy + 18, T - 26, T - 30, [4, 4, 1, 1]); ctx.fill();
  };

  A.display = function (ctx, sx, sy, T) { // bakery case
    rr(ctx, sx + 3, sy + 8, T - 6, T - 12, 2, P.wood);
    rr(ctx, sx + 5, sy + 4, T - 10, T * .45, 2, 'rgba(188,216,208,.55)');
    // bread lumps
    rr(ctx, sx + 7, sy + T * .55, 8, 5, 2.5, '#c99a5b');
    rr(ctx, sx + 17, sy + T * .55, 9, 5, 2.5, '#b78347');
    rr(ctx, sx + 11, sy + T * .40, 9, 5, 2.5, '#d9b06c');
  };

  A.counter = function (ctx, sx, sy, T) {
    rr(ctx, sx + 2, sy + 8, T - 4, T - 12, 2, P.wood);
    rr(ctx, sx + 2, sy + 8, T - 4, 6, 2, P.woodLight);
    rr(ctx, sx + T - 14, sy + 2, 10, 9, 1.5, '#6b665e'); // register
    rr(ctx, sx + T - 12.5, sy + 3.5, 7, 3.5, 1, P.glass);
  };

  A.aquariumShelf = function (ctx, sx, sy, T) { // empty stand
    rr(ctx, sx + 4, sy + T * .5, T - 8, T * .38, 2, P.wood);
    ctx.strokeStyle = 'rgba(93,78,64,.35)'; ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(sx + 6, sy + 6, T - 12, T * .38);
    ctx.setLineDash([]);
  };

  A.bed = function (ctx, sx, sy, T, part) {
    // part: 0 head, 1 foot (drawn per tile; simple uniform is fine)
    rr(ctx, sx + 2, sy + 2, T - 4, T - 4, 4, '#7d9dc4');
    rr(ctx, sx + 2, sy + 2, T - 4, 7, 4, '#93b1d4');
    if (part === 0) rr(ctx, sx + 5, sy + 5, T - 10, 8, 3, P.cream); // pillow
  };

  A.tramPlatform = function (ctx, sx, sy, T) {
    ctx.strokeStyle = 'rgba(61,50,41,.25)'; ctx.lineWidth = 2;
    ctx.strokeRect(sx + 3, sy + 3, T - 6, T - 6);
    ctx.fillStyle = P.yellow;
    ctx.fillRect(sx + 3, sy + T - 7, T - 6, 3);
  };

  /* ================= crops ================= */
  A.crop = function (ctx, id, frac, sx, sy, T, dead) {
    const cx = sx + T / 2, gy = sy + T * .72; // ground line
    if (dead) { // wilted out-of-season plant
      ctx.strokeStyle = '#8a7355'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx, gy); ctx.quadraticCurveTo(cx + 2, gy - 6, cx + 6, gy - 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, gy - 3); ctx.quadraticCurveTo(cx - 3, gy - 7, cx - 6, gy - 7); ctx.stroke();
      ctx.fillStyle = '#a08b6a';
      ctx.beginPath(); ctx.ellipse(cx + 6, gy - 9, 3, 1.8, .5, 0, Math.PI * 2); ctx.fill();
      return;
    }
    if (frac < 0.34) { // sprout
      ctx.strokeStyle = P.leaf; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, gy); ctx.lineTo(cx, gy - 6); ctx.stroke();
      ctx.fillStyle = P.leafLight;
      ctx.beginPath(); ctx.ellipse(cx - 3, gy - 7, 3.5, 2, -.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 3, gy - 7, 3.5, 2, .6, 0, Math.PI * 2); ctx.fill();
      return;
    }
    if (frac < 1) { // growing bush
      circle(ctx, cx, gy - 5, 6, P.leafDark);
      circle(ctx, cx - 4, gy - 7, 4.5, P.leaf);
      circle(ctx, cx + 4, gy - 7, 4.5, P.leaf);
      circle(ctx, cx - 1, gy - 9, 3.5, P.leafLight);
      return;
    }
    // ready
    switch (id) {
      case 'lettuce':
        circle(ctx, cx, gy - 4, 9, P.leaf);
        circle(ctx, cx - 5, gy - 6, 5.5, P.leafLight);
        circle(ctx, cx + 5, gy - 6, 5.5, P.leafLight);
        circle(ctx, cx, gy - 7, 5, P.leafPale);
        break;
      case 'radish': {
        ctx.strokeStyle = P.leaf; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx - 3, gy - 8); ctx.lineTo(cx - 4, gy - 13); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 3, gy - 8); ctx.lineTo(cx + 4, gy - 13); ctx.stroke();
        ctx.fillStyle = P.leafLight;
        ctx.beginPath(); ctx.ellipse(cx - 5, gy - 13, 3.5, 2.2, -.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx + 5, gy - 13, 3.5, 2.2, .5, 0, Math.PI * 2); ctx.fill();
        circle(ctx, cx, gy - 4, 6.5, P.berry);
        circle(ctx, cx - 2, gy - 6, 2.2, 'rgba(255,255,255,.35)');
        break;
      }
      case 'strawberry':
        circle(ctx, cx, gy - 5, 8, P.leafDark);
        circle(ctx, cx - 4, gy - 8, 5, P.leaf);
        circle(ctx, cx + 4, gy - 8, 5, P.leaf);
        for (const [bx, by] of [[-6, -2], [5, -1], [0, 3]]) {
          circle(ctx, cx + bx, gy - 5 + by, 3, P.red);
          circle(ctx, cx + bx - 1, gy - 6 + by, 1, 'rgba(255,255,255,.5)');
        }
        break;
      case 'tulip': {
        ctx.strokeStyle = P.leaf; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, gy); ctx.lineTo(cx, gy - 12); ctx.stroke();
        ctx.fillStyle = P.leaf;
        ctx.beginPath(); ctx.ellipse(cx - 4, gy - 4, 5, 2, -.7, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx + 4, gy - 4, 5, 2, .7, 0, Math.PI * 2); ctx.fill();
        // cup
        ctx.fillStyle = P.pink;
        ctx.beginPath();
        ctx.moveTo(cx - 5, gy - 12);
        ctx.quadraticCurveTo(cx - 5, gy - 20, cx - 3, gy - 19);
        ctx.lineTo(cx - 1, gy - 16); ctx.lineTo(cx + 1, gy - 19);
        ctx.quadraticCurveTo(cx + 5, gy - 20, cx + 5, gy - 12);
        ctx.quadraticCurveTo(cx, gy - 9, cx - 5, gy - 12);
        ctx.fill();
        break;
      }
      case 'tomato':
        circle(ctx, cx, gy - 8, 7, P.leafDark);
        circle(ctx, cx - 3, gy - 11, 4.5, P.leaf);
        circle(ctx, cx + 3, gy - 11, 4.5, P.leaf);
        for (const [bx, by] of [[-5, 0], [5, 1], [0, 4]]) {
          circle(ctx, cx + bx, gy - 8 + by, 3.4, P.red);
          circle(ctx, cx + bx - 1, gy - 9 + by, 1.1, 'rgba(255,255,255,.45)');
        }
        break;
      case 'basil':
        ctx.strokeStyle = P.leafDark; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, gy); ctx.lineTo(cx, gy - 10); ctx.stroke();
        for (const [lx, ly, a] of [[-5, -8, -.6], [5, -8, .6], [-4, -12, -.4], [4, -12, .4], [0, -15, 0]]) {
          ctx.fillStyle = ly < -10 ? P.leafLight : P.leaf;
          ctx.beginPath(); ctx.ellipse(cx + lx, gy + ly, 4.5, 2.8, a, 0, Math.PI * 2); ctx.fill();
        }
        break;
      case 'cucumber':
        circle(ctx, cx, gy - 6, 8, P.leafDark);
        circle(ctx, cx - 4, gy - 9, 5, P.leaf);
        circle(ctx, cx + 4, gy - 9, 5, P.leaf);
        ctx.fillStyle = '#4f7d3a';
        ctx.save(); ctx.translate(cx + 2, gy - 1); ctx.rotate(.5);
        ctx.beginPath(); ctx.ellipse(0, 0, 7, 2.6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.fillStyle = 'rgba(255,255,255,.25)';
        ctx.save(); ctx.translate(cx + 1, gy - 2); ctx.rotate(.5);
        ctx.beginPath(); ctx.ellipse(0, 0, 4, 1.2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        break;
      case 'sunflower': {
        ctx.strokeStyle = P.leafDark; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.moveTo(cx, gy); ctx.lineTo(cx, gy - 16); ctx.stroke();
        ctx.fillStyle = P.leaf;
        ctx.beginPath(); ctx.ellipse(cx - 4, gy - 6, 5, 2.2, -.6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx + 4, gy - 8, 5, 2.2, .6, 0, Math.PI * 2); ctx.fill();
        for (let i = 0; i < 8; i++) {
          const a = i / 8 * Math.PI * 2;
          ctx.fillStyle = P.yellow;
          ctx.beginPath();
          ctx.ellipse(cx + Math.cos(a) * 5.5, gy - 18 + Math.sin(a) * 5.5, 3.2, 1.8, a, 0, Math.PI * 2);
          ctx.fill();
        }
        circle(ctx, cx, gy - 18, 3.6, '#6b4a2a');
        break;
      }
      case 'kale':
        circle(ctx, cx, gy - 5, 8.5, '#3f5a33');
        circle(ctx, cx - 5, gy - 8, 5, '#4f7d3a');
        circle(ctx, cx + 5, gy - 8, 5, '#4f7d3a');
        circle(ctx, cx, gy - 10, 4.5, P.leaf);
        ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx - 4, gy - 8, 3, 0, Math.PI); ctx.stroke();
        break;
      case 'carrot': {
        ctx.strokeStyle = P.leaf; ctx.lineWidth = 1.6;
        for (const dx of [-3, 0, 3]) {
          ctx.beginPath(); ctx.moveTo(cx + dx * .5, gy - 8); ctx.lineTo(cx + dx, gy - 15); ctx.stroke();
        }
        ctx.fillStyle = P.leafLight;
        ctx.beginPath(); ctx.ellipse(cx, gy - 14, 5, 2.5, 0, 0, Math.PI * 2); ctx.fill();
        // orange shoulder poking out of the soil
        ctx.fillStyle = P.orange;
        ctx.beginPath();
        ctx.moveTo(cx - 4.5, gy - 7);
        ctx.quadraticCurveTo(cx, gy - 10, cx + 4.5, gy - 7);
        ctx.lineTo(cx + 3, gy - 1); ctx.lineTo(cx - 3, gy - 1);
        ctx.closePath(); ctx.fill();
        circle(ctx, cx - 1.5, gy - 6, 1, 'rgba(255,255,255,.35)');
        break;
      }
      case 'squash':
        // vine
        ctx.strokeStyle = P.leafDark; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx - 8, gy - 2); ctx.quadraticCurveTo(cx, gy - 10, cx + 7, gy - 6); ctx.stroke();
        ctx.fillStyle = P.leaf;
        ctx.beginPath(); ctx.ellipse(cx - 6, gy - 7, 4.5, 2.6, -.4, 0, Math.PI * 2); ctx.fill();
        // gourd
        ctx.fillStyle = '#c97a2e';
        ctx.beginPath(); ctx.ellipse(cx + 3, gy - 3, 7, 5.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(cx + 3, gy - 8); ctx.quadraticCurveTo(cx + 1, gy - 3, cx + 3, gy + 2); ctx.stroke();
        ctx.fillStyle = P.leafDark;
        ctx.fillRect(cx + 1.5, gy - 10, 3, 3);
        circle(ctx, cx, gy - 5, 1.4, 'rgba(255,255,255,.3)');
        break;
      case 'chrysanthemum': {
        ctx.strokeStyle = P.leaf; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, gy); ctx.lineTo(cx, gy - 11); ctx.stroke();
        ctx.fillStyle = P.leaf;
        ctx.beginPath(); ctx.ellipse(cx - 4, gy - 5, 4.5, 2, -.6, 0, Math.PI * 2); ctx.fill();
        for (let i = 0; i < 10; i++) {
          const a = i / 10 * Math.PI * 2;
          ctx.fillStyle = '#e0a832';
          ctx.beginPath();
          ctx.ellipse(cx + Math.cos(a) * 4.5, gy - 14 + Math.sin(a) * 4.5, 2.8, 1.4, a, 0, Math.PI * 2);
          ctx.fill();
        }
        circle(ctx, cx, gy - 14, 2.6, '#c98a1e');
        circle(ctx, cx - 1, gy - 15, 1, 'rgba(255,255,255,.4)');
        break;
      }
    }
    // ready glint
    ctx.fillStyle = 'rgba(255,250,210,.95)';
    ctx.save(); ctx.translate(sx + T - 8, sy + 8);
    ctx.beginPath();
    ctx.moveTo(0, -4); ctx.quadraticCurveTo(1, -1, 4, 0); ctx.quadraticCurveTo(1, 1, 0, 4);
    ctx.quadraticCurveTo(-1, 1, -4, 0); ctx.quadraticCurveTo(-1, -1, 0, -4);
    ctx.fill(); ctx.restore();
  };

  /* ================= pets ================= */
  A.pet = function (ctx, type, fur, sx, sy, T, t) {
    const cx = sx + T / 2, cy = sy + T / 2;
    const bob = Math.sin(t / 500) * 1;
    if (type === 'fish') return; // fish drawn inside tank via A.aquarium
    sh(ctx, cx, sy + T - 5, T * .26, 2.5);
    if (type === 'cat') {
      // tail
      ctx.strokeStyle = fur; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx + 7, cy + 5 + bob);
      ctx.quadraticCurveTo(cx + 13, cy + 3 + bob, cx + 12, cy - 3 + bob + Math.sin(t / 700) * 2);
      ctx.stroke();
      // body + head
      ctx.fillStyle = fur;
      ctx.beginPath(); ctx.ellipse(cx, cy + 4 + bob, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
      circle(ctx, cx - 4, cy - 3 + bob, 5.5, fur);
      // ears
      ctx.beginPath(); ctx.moveTo(cx - 8, cy - 6 + bob); ctx.lineTo(cx - 7, cy - 11 + bob); ctx.lineTo(cx - 4, cy - 8 + bob); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx - 1, cy - 8 + bob); ctx.lineTo(cx + 0, cy - 11 + bob); ctx.lineTo(cx - 3, cy - 6 + bob); ctx.fill();
      // face
      ctx.fillStyle = P.dark;
      circle(ctx, cx - 6, cy - 4 + bob, .9, P.dark);
      circle(ctx, cx - 2.5, cy - 4 + bob, .9, P.dark);
      // chest
      circle(ctx, cx - 2, cy + 5 + bob, 3, 'rgba(255,255,255,.25)');
      return;
    }
    if (type === 'dog') {
      // tail wag
      ctx.strokeStyle = fur; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx + 8, cy + 2 + bob);
      ctx.lineTo(cx + 12 + Math.sin(t / 150) * 2.5, cy - 3 + bob);
      ctx.stroke();
      ctx.fillStyle = fur;
      ctx.beginPath(); ctx.ellipse(cx + 1, cy + 4 + bob, 9, 6.5, 0, 0, Math.PI * 2); ctx.fill();
      circle(ctx, cx - 6, cy - 3 + bob, 6, fur);
      // floppy ears
      ctx.beginPath(); ctx.ellipse(cx - 10, cy - 4 + bob, 2.5, 4.5, -.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx - 2, cy - 5 + bob, 2.5, 4.5, .3, 0, Math.PI * 2); ctx.fill();
      // snout & face
      circle(ctx, cx - 7, cy - 1 + bob, 3, 'rgba(255,255,255,.3)');
      ctx.fillStyle = P.dark;
      circle(ctx, cx - 8, cy - 4 + bob, 1, P.dark);
      circle(ctx, cx - 4.5, cy - 4 + bob, 1, P.dark);
      circle(ctx, cx - 8.5, cy - 1 + bob, 1.4, P.dark);
      return;
    }
  };

  A.aquarium = function (ctx, sx, sy, T, t, count) {
    sh(ctx, sx + T / 2, sy + T - 3, T * .36, 2.5);
    rr(ctx, sx + 3, sy + T - 9, T - 6, 6, 1.5, P.wood); // stand
    // tank
    rr(ctx, sx + 4, sy + 6, T - 8, T - 16, 2, 'rgba(120,180,205,.9)');
    rr(ctx, sx + 4, sy + 6, T - 8, 3, 2, 'rgba(220,240,250,.55)');
    // gravel
    ctx.fillStyle = '#c9b68a';
    ctx.fillRect(sx + 5, sy + T - 13, T - 10, 3);
    // plant
    ctx.strokeStyle = P.leaf; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(sx + 8, sy + T - 13);
    ctx.quadraticCurveTo(sx + 7, sy + T - 19, sx + 9, sy + T - 22); ctx.stroke();
    // the residents (1–3 fish, each on their own lap of the tank)
    const cols = [P.orange, '#5b87a8', '#c2589e'];
    const n = Math.min(3, count || 1);
    for (let i = 0; i < n; i++) {
      const ph = t / (900 + i * 240) + i * 2.1;
      const fx = sx + T / 2 + Math.sin(ph) * (5 - i), fy = sy + T / 2 - 1 + i * 3 + Math.sin(t / (600 + i * 100)) * 1.5;
      const dir = Math.cos(ph) >= 0 ? 1 : -1;
      const sc = 1 - i * .2;
      ctx.fillStyle = cols[i];
      ctx.beginPath(); ctx.ellipse(fx, fy, 3.5 * sc, 2.2 * sc, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(fx - 3 * sc * dir, fy); ctx.lineTo(fx - 6 * sc * dir, fy - 2 * sc); ctx.lineTo(fx - 6 * sc * dir, fy + 2 * sc);
      ctx.fill();
    }
  };

  /* ================= characters ================= */
  // hairstyles: short, long, bun, cap, wrap, curly
  A.head = function (ctx, cx, cy, r, skin, hair, style) {
    circle(ctx, cx, cy, r, skin);
    ctx.fillStyle = hair;
    if (style === 'short') {
      ctx.beginPath(); ctx.arc(cx, cy - r * .25, r, Math.PI, 0); ctx.fill();
    } else if (style === 'long') {
      ctx.beginPath(); ctx.arc(cx, cy - r * .25, r, Math.PI, 0); ctx.fill();
      ctx.fillRect(cx - r, cy - r * .25, r * .42, r * 1.6);
      ctx.fillRect(cx + r * .58, cy - r * .25, r * .42, r * 1.6);
    } else if (style === 'bun') {
      ctx.beginPath(); ctx.arc(cx, cy - r * .25, r, Math.PI, 0); ctx.fill();
      circle(ctx, cx, cy - r * 1.35, r * .45, hair);
    } else if (style === 'curly') {
      circle(ctx, cx - r * .55, cy - r * .75, r * .5, hair);
      circle(ctx, cx, cy - r * .95, r * .55, hair);
      circle(ctx, cx + r * .55, cy - r * .75, r * .5, hair);
    } else if (style === 'cap') {
      ctx.beginPath(); ctx.arc(cx, cy - r * .3, r * 1.02, Math.PI, 0); ctx.fill();
      rr(ctx, cx - r * 1.05, cy - r * .38, r * 2.1, r * .32, r * .15, hair);
      rr(ctx, cx + r * .3, cy - r * .30, r * .95, r * .24, r * .12, hair); // brim
    } else if (style === 'wrap') {
      ctx.beginPath(); ctx.arc(cx, cy - r * .22, r * 1.04, Math.PI * .92, Math.PI * 2.08); ctx.fill();
      circle(ctx, cx + r * .75, cy - r * .95, r * .3, hair);
    }
  };

  A.character = function (ctx, sx, sy, T, opts, t, moving) {
    // opts: {skin, hair, style, outfit}
    const cx = sx + T / 2, cy = sy + T / 2;
    const bob = moving ? Math.sin(t / 60) * 1.5 : 0;
    sh(ctx, cx, sy + T - 3, 9, 3.4);
    rr(ctx, cx - 8, cy - 4 + bob, 16, 16, 6, opts.outfit);
    rr(ctx, cx - 8, cy - 4 + bob, 16, 5, 6, 'rgba(255,255,255,.14)');
    A.head(ctx, cx, cy - 9 + bob, 8, opts.skin, opts.hair, opts.style);
    ctx.fillStyle = P.dark;
    circle(ctx, cx - 3, cy - 8 + bob, 1.1, P.dark);
    circle(ctx, cx + 3, cy - 8 + bob, 1.1, P.dark);
  };

  A.portrait = function (canvas, opts) {
    const c = canvas.getContext('2d');
    const S = canvas.width;
    c.clearRect(0, 0, S, S);
    // backdrop
    c.fillStyle = '#efe6d2';
    c.beginPath(); c.roundRect(0, 0, S, S, S * .24); c.fill();
    const cx = S / 2, hy = S * .46, r = S * .27;
    // shoulders
    c.fillStyle = opts.outfit;
    c.beginPath(); c.roundRect(S * .16, S * .68, S * .68, S * .4, S * .14); c.fill();
    A.head(c, cx, hy, r, opts.skin, opts.hair, opts.style);
    c.fillStyle = P.dark;
    c.beginPath(); c.arc(cx - r * .38, hy + r * .08, S * .026, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(cx + r * .38, hy + r * .08, S * .026, 0, Math.PI * 2); c.fill();
    // smile
    c.strokeStyle = P.dark; c.lineWidth = Math.max(1.2, S * .02); c.lineCap = 'round';
    c.beginPath(); c.arc(cx, hy + r * .38, r * .3, Math.PI * .2, Math.PI * .8); c.stroke();
  };

  A.narratorPortrait = function (canvas) {
    const c = canvas.getContext('2d');
    const S = canvas.width;
    c.clearRect(0, 0, S, S);
    c.fillStyle = '#efe6d2';
    c.beginPath(); c.roundRect(0, 0, S, S, S * .24); c.fill();
    // little journal
    c.fillStyle = P.wood;
    c.beginPath(); c.roundRect(S * .24, S * .2, S * .52, S * .6, S * .06); c.fill();
    c.fillStyle = P.cream;
    c.beginPath(); c.roundRect(S * .3, S * .26, S * .4, S * .48, S * .04); c.fill();
    c.strokeStyle = P.paper; c.lineWidth = S * .03;
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      c.moveTo(S * .35, S * .38 + i * S * .12); c.lineTo(S * .65, S * .38 + i * S * .12);
      c.stroke();
    }
  };

  /* ================= item icons (DOM) ================= */
  A.drawItemIcon = function (c, id, S) {
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, S, S);
    const T = S; // treat icon box like a tile
    const item = CS.ITEMS[id];
    if (item && item.type === 'seed') {
      // seed packet with crop color band
      const bandCols = { lettuce: P.leafLight, radish: P.berry, strawberry: P.red, tulip: P.pink,
                         tomato: P.red, basil: P.leaf, cucumber: '#4f7d3a', sunflower: P.yellow,
                         kale: '#3f5a33', carrot: P.orange, squash: '#c97a2e', chrysanthemum: '#e0a832' };
      rr(ctx, S * .2, S * .12, S * .6, S * .74, S * .08, P.cream);
      rr(ctx, S * .2, S * .12, S * .6, S * .2, S * .08, bandCols[item.crop] || P.leaf);
      ctx.strokeStyle = P.paper; ctx.lineWidth = 1;
      ctx.strokeRect(S * .28, S * .4, S * .44, S * .36);
      // tiny sprout mark
      ctx.strokeStyle = P.leaf; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(S * .5, S * .7); ctx.lineTo(S * .5, S * .52); ctx.stroke();
      ctx.fillStyle = P.leafLight;
      ctx.beginPath(); ctx.ellipse(S * .44, S * .52, S * .07, S * .045, -.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(S * .56, S * .52, S * .07, S * .045, .5, 0, Math.PI * 2); ctx.fill();
      return;
    }
    switch (id) {
      case 'lettuce': case 'radish': case 'strawberry': case 'tulip':
      case 'tomato': case 'basil': case 'cucumber': case 'sunflower':
      case 'kale': case 'carrot': case 'squash': case 'chrysanthemum':
        A.crop(ctx, id, 1, 0, S * .05, S);
        break;
      case 'fancy_fish': {
        ctx.fillStyle = '#c2589e';
        ctx.beginPath(); ctx.ellipse(S * .52, S * .5, S * .2, S * .13, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(S * .36, S * .5); ctx.lineTo(S * .2, S * .38); ctx.lineTo(S * .2, S * .62);
        ctx.closePath(); ctx.fill();
        circle(ctx, S * .6, S * .47, S * .025, '#2d2a26');
        circle(ctx, S * .3, S * .3, S * .03, 'rgba(120,180,220,.8)');
        circle(ctx, S * .7, S * .26, S * .025, 'rgba(120,180,220,.8)');
        break;
      }
      case 'tea':
        rr(ctx, S * .28, S * .4, S * .38, S * .32, S * .06, '#7a8a6e');
        ctx.strokeStyle = '#7a8a6e'; ctx.lineWidth = S * .05;
        ctx.beginPath(); ctx.arc(S * .68, S * .55, S * .1, -Math.PI / 2, Math.PI / 2); ctx.stroke();
        ctx.strokeStyle = 'rgba(150,140,120,.6)'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(S * .44, S * .34); ctx.quadraticCurveTo(S * .5, S * .26, S * .44, S * .18); ctx.stroke();
        break;
      case 'meal_salad': case 'meal_roast': case 'meal_galette': case 'meal_pasta': {
        // plate + food mound
        circle(ctx, S / 2, S * .58, S * .38, '#e8e0d0');
        circle(ctx, S / 2, S * .58, S * .3, '#f6f1e6');
        const food = { meal_salad: P.leafLight, meal_roast: P.berry, meal_galette: P.red, meal_pasta: '#d9a75c' };
        circle(ctx, S / 2, S * .55, S * .2, food[id]);
        if (id === 'meal_salad') { circle(ctx, S * .42, S * .5, S * .07, P.leaf); circle(ctx, S * .58, S * .55, S * .06, P.berry); }
        if (id === 'meal_galette') { circle(ctx, S * .5, S * .55, S * .12, '#c99a5b'); circle(ctx, S * .5, S * .53, S * .07, P.red); }
        if (id === 'meal_pasta') { ctx.strokeStyle = P.leaf; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(S*.44,S*.48); ctx.lineTo(S*.5,S*.44); ctx.lineTo(S*.56,S*.49); ctx.stroke(); }
        break;
      }
      case 'vinyl_record':
        circle(ctx, S / 2, S / 2, S * .36, '#2a2723');
        circle(ctx, S / 2, S / 2, S * .13, P.red);
        circle(ctx, S / 2, S / 2, S * .04, '#f6f1e6');
        ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(S/2, S/2, S * .26, .4, 1.8); ctx.stroke();
        break;
      case 'film_camera':
        rr(ctx, S * .18, S * .34, S * .64, S * .38, S * .06, '#4a4642');
        rr(ctx, S * .18, S * .34, S * .64, S * .1, S * .06, '#8f8a80');
        circle(ctx, S / 2, S * .53, S * .14, '#2a2723');
        circle(ctx, S / 2, S * .53, S * .09, '#5b87a8');
        circle(ctx, S * .47, S * .5, S * .03, 'rgba(255,255,255,.6)');
        rr(ctx, S * .66, S * .38, S * .1, S * .06, S * .02, P.red);
        break;
      case 'ceramic_vase':
        ctx.fillStyle = '#a8b8ab';
        ctx.beginPath();
        ctx.moveTo(S * .4, S * .24); ctx.quadraticCurveTo(S * .3, S * .4, S * .34, S * .6);
        ctx.quadraticCurveTo(S * .38, S * .78, S * .5, S * .78);
        ctx.quadraticCurveTo(S * .62, S * .78, S * .66, S * .6);
        ctx.quadraticCurveTo(S * .7, S * .4, S * .6, S * .24);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.25)';
        ctx.fillRect(S * .42, S * .3, S * .06, S * .4);
        break;
      case 'brass_lamp':
        ctx.fillStyle = P.yellow;
        ctx.beginPath();
        ctx.moveTo(S * .32, S * .42); ctx.lineTo(S * .68, S * .42); ctx.lineTo(S * .58, S * .2); ctx.lineTo(S * .42, S * .2);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#b3924b';
        ctx.fillRect(S * .47, S * .42, S * .06, S * .3);
        rr(ctx, S * .36, S * .72, S * .28, S * .08, S * .03, '#b3924b');
        break;
      case 'old_poster':
        rr(ctx, S * .24, S * .16, S * .52, S * .68, S * .03, P.cream);
        rr(ctx, S * .28, S * .22, S * .44, S * .2, S * .02, P.berry);
        ctx.fillStyle = P.paper;
        ctx.fillRect(S * .3, S * .5, S * .4, S * .05);
        ctx.fillRect(S * .3, S * .6, S * .3, S * .05);
        break;
      case 'wool_scarf':
        ctx.strokeStyle = P.berry; ctx.lineWidth = S * .14; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(S * .3, S * .3); ctx.quadraticCurveTo(S * .7, S * .3, S * .66, S * .55);
        ctx.quadraticCurveTo(S * .62, S * .78, S * .34, S * .72);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = S * .03;
        ctx.beginPath(); ctx.moveTo(S * .32, S * .27); ctx.quadraticCurveTo(S * .68, S * .27, S * .64, S * .52); ctx.stroke();
        break;
      case 'planter_box':
        rr(ctx, S * .22, S * .44, S * .56, S * .32, S * .04, P.wood);
        rr(ctx, S * .22, S * .44, S * .56, S * .08, S * .04, P.woodLight);
        ctx.strokeStyle = P.leaf; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(S * .4, S * .44); ctx.lineTo(S * .38, S * .3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(S * .6, S * .44); ctx.lineTo(S * .63, S * .28); ctx.stroke();
        break;
      case 'transit_sign':
        circle(ctx, S / 2, S / 2, S * .34, '#1f1c19');
        circle(ctx, S / 2, S / 2, S * .28, P.leaf);
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${S * .3}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('H', S / 2, S / 2 + 1);
        break;
      case 'paperback':
        rr(ctx, S * .28, S * .2, S * .44, S * .6, S * .03, '#c9856b');
        ctx.fillStyle = P.cream;
        ctx.fillRect(S * .68, S * .22, S * .05, S * .56);
        ctx.fillStyle = 'rgba(255,255,255,.35)';
        ctx.fillRect(S * .32, S * .3, S * .3, S * .06);
        break;
      case 'enamel_pot':
        rr(ctx, S * .26, S * .4, S * .48, S * .36, S * .06, '#5b87a8');
        rr(ctx, S * .26, S * .4, S * .48, S * .08, S * .06, 'rgba(255,255,255,.3)');
        ctx.strokeStyle = '#3f5f78'; ctx.lineWidth = S * .05; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(S * .2, S * .5); ctx.lineTo(S * .26, S * .5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(S * .74, S * .5); ctx.lineTo(S * .8, S * .5); ctx.stroke();
        rr(ctx, S * .4, S * .32, S * .2, S * .08, S * .03, '#3f5f78');
        break;
      case 'bread':
        ctx.fillStyle = '#c99a5b';
        ctx.beginPath(); ctx.ellipse(S / 2, S * .58, S * .34, S * .22, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#a87b41'; ctx.lineWidth = 1.6;
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath(); ctx.moveTo(S / 2 + i * S * .14 - 2, S * .48); ctx.lineTo(S / 2 + i * S * .14 + 2, S * .6); ctx.stroke();
        }
        break;
      case 'warm_roll':
        ctx.fillStyle = '#d9b06c';
        ctx.save(); ctx.translate(S / 2, S / 2); ctx.rotate(-.5);
        ctx.beginPath(); ctx.ellipse(0, 0, S * .38, S * .16, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#b78347'; ctx.lineWidth = 1.6;
        for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * S * .16 - 2, -S * .08); ctx.lineTo(i * S * .16 + 2, S * .08); ctx.stroke(); }
        ctx.restore();
        // steam
        ctx.strokeStyle = 'rgba(150,140,120,.6)'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(S * .5, S * .24); ctx.quadraticCurveTo(S * .56, S * .16, S * .5, S * .08); ctx.stroke();
        break;
      case 'coffee':
        rr(ctx, S * .26, S * .34, S * .42, S * .4, S * .06, P.cream);
        ctx.strokeStyle = P.cream; ctx.lineWidth = S * .06;
        ctx.beginPath(); ctx.arc(S * .72, S * .52, S * .12, -Math.PI / 2, Math.PI / 2); ctx.stroke();
        ctx.fillStyle = '#6b4a33';
        rr(ctx, S * .3, S * .38, S * .34, S * .1, S * .03, '#6b4a33');
        ctx.strokeStyle = 'rgba(150,140,120,.6)'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(S * .42, S * .28); ctx.quadraticCurveTo(S * .48, S * .2, S * .42, S * .12); ctx.stroke();
        break;
      case 'pet_food':
        rr(ctx, S * .26, S * .24, S * .48, S * .56, S * .06, '#8f8a80');
        rr(ctx, S * .26, S * .36, S * .48, S * .3, 0, P.orange);
        // paw print
        ctx.fillStyle = '#fff';
        circle(ctx, S * .5, S * .53, S * .06, 'rgba(255,255,255,.9)');
        circle(ctx, S * .42, S * .46, S * .035, 'rgba(255,255,255,.9)');
        circle(ctx, S * .5, S * .43, S * .035, 'rgba(255,255,255,.9)');
        circle(ctx, S * .58, S * .46, S * .035, 'rgba(255,255,255,.9)');
        break;
      default:
        circle(ctx, S / 2, S / 2, S * .3, P.paper);
    }
  };

  A.iconCanvas = function (id, size) {
    const c = document.createElement('canvas');
    c.width = c.height = size * (window.devicePixelRatio > 1 ? 2 : 1);
    c.style.width = c.style.height = size + 'px';
    const scale = c.width / size;
    c.getContext('2d').scale(scale, scale);
    A.drawItemIcon(c, id, size);
    return c;
  };

  /* ================= weather glyphs (inline SVG for HUD) ================= */
  A.weatherSVG = function (w) {
    if (w === 'snow') return `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="5.6" cy="5.4" r="3" fill="#aeb8c0"/><circle cx="9.8" cy="4.8" r="3.4" fill="#c2ccd4"/><rect x="3.6" y="5" width="9" height="3" rx="1.5" fill="#c2ccd4"/><g fill="#e8f0f8"><circle cx="5" cy="11" r="1.1"/><circle cx="8.4" cy="12.6" r="1.1"/><circle cx="11.6" cy="10.8" r="1.1"/></g></svg>`;
    if (w === 'sunny') return `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="3.4" fill="#e8a53c"/><g stroke="#e8a53c" stroke-width="1.4" stroke-linecap="round"><line x1="8" y1="1" x2="8" y2="3"/><line x1="8" y1="13" x2="8" y2="15"/><line x1="1" y1="8" x2="3" y2="8"/><line x1="13" y1="8" x2="15" y2="8"/><line x1="3.2" y1="3.2" x2="4.6" y2="4.6"/><line x1="11.4" y1="11.4" x2="12.8" y2="12.8"/><line x1="3.2" y1="12.8" x2="4.6" y2="11.4"/><line x1="11.4" y1="4.6" x2="12.8" y2="3.2"/></g></svg>`;
    if (w === 'cloudy') return `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="6" cy="9" r="3.4" fill="#9aa7b0"/><circle cx="10" cy="8" r="4" fill="#b3bec6"/><rect x="4" y="9" width="9" height="3.4" rx="1.7" fill="#b3bec6"/></svg>`;
    return `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="6" cy="6" r="3" fill="#8b98a3"/><circle cx="10" cy="5.4" r="3.4" fill="#a2aeb8"/><rect x="4" y="5.6" width="9" height="3" rx="1.5" fill="#a2aeb8"/><g stroke="#5b87a8" stroke-width="1.4" stroke-linecap="round"><line x1="5.5" y1="10.5" x2="4.6" y2="13"/><line x1="8.5" y1="10.5" x2="7.6" y2="13"/><line x1="11.5" y1="10.5" x2="10.6" y2="13"/></g></svg>`;
  };
})();
