/* =========================================================================
   Concrete Seasons — data5.js (Phase 6 content)
   Flushing & Williamsburg hubs, gig-work text, cohabitation lines,
   Open Streets / Marathon / Movie Night, flea-market stock.
   ========================================================================= */
(function () {

/* ---------------- Flushing ---------------- */
function buildFlushing() {
  const W = 26, H = 16;
  const g = [];
  for (let y = 0; y < H; y++) g.push(new Array(W).fill('_'));
  for (let x = 0; x < W; x++) { g[0][x] = '#'; g[1][x] = '#'; g[H-2][x] = '#'; g[H-1][x] = '#'; }
  for (let y = 0; y < H; y++) { g[y][0] = '#'; g[y][W-1] = '#'; }
  for (let x = 3; x <= 14; x++) for (let y = 2; y <= 4; y++) g[y][x] = '#'; // Golden Mall block
  g[4][8] = 'D';
  for (let x = 17; x <= 23; x++) for (let y = 2; y <= 4; y++) g[y][x] = '#';
  for (let x = 2; x <= 4; x++) for (let y = 6; y <= 7; y++) g[y][x] = 'P';
  [11, 16, 21].forEach(x => { g[6][x] = 'l'; });
  [7, 14, 19].forEach(x => { g[10][x] = 'o'; });
  g[11][22] = 'h';
  return g;
}
CS.MAPS.flushing = {
  name: 'Flushing — Main St', outdoor: true, city: true,
  grid: buildFlushing(),
  labels: [
    { x:4,  y:3.4, text:'Golden Mall Food Court' },
    { x:2,  y:5,   text:'Subway' },
    { x:17, y:3.4, text:'herbs · gifts · bakery' },
    { x:11, y:12.5, text:'Main Street, Flushing' },
  ],
  doors: { D:'foodcourt' },
  doorSpawns: { D:[8,5] },
};
CS.MAPS.foodcourt = {
  name: 'Golden Mall', outdoor: false, exitTo: 'flushing', exitKey: 'D',
  grid: [
    '############',
    '#UU..UU..UU#',
    '#..........#',
    '#.tt....tt.#',
    '#..........#',
    '#.tt....tt.#',
    '#####E######',
  ].map(r => r.split('')),
  labels: [],
};
CS.INTERIOR_SPAWNS.foodcourt = [5, 5];

/* ---------------- Williamsburg ---------------- */
function buildWilliamsburg() {
  const W = 26, H = 16;
  const g = [];
  for (let y = 0; y < H; y++) g.push(new Array(W).fill('_'));
  for (let x = 0; x < W; x++) { g[0][x] = '#'; g[1][x] = '#'; g[H-2][x] = '#'; g[H-1][x] = '#'; }
  for (let y = 0; y < H; y++) { g[y][0] = '#'; g[y][W-1] = '#'; }
  for (let x = 3; x <= 10; x++) for (let y = 2; y <= 4; y++) g[y][x] = '#';   // warehouse
  for (let x = 14; x <= 23; x++) for (let y = 2; y <= 4; y++) g[y][x] = '#';
  for (let x = 2; x <= 4; x++) for (let y = 6; y <= 7; y++) g[y][x] = 'P';
  // the weekend flea: a cluster of stalls
  g[7][10] = 'k'; g[7][14] = 'k'; g[10][10] = 'k'; g[10][14] = 'k';
  [7, 17].forEach(x => { g[12][x] = 'o'; });
  g[8][20] = 'h'; g[12][21] = 'h';
  return g;
}
CS.MAPS.williamsburg = {
  name: 'Williamsburg — Bedford Ave', outdoor: true, city: true,
  grid: buildWilliamsburg(),
  labels: [
    { x:3,  y:3.4, text:'Artists & Fleas (Sat–Sun)' },
    { x:2,  y:5,   text:'Subway' },
    { x:14, y:3.4, text:'records · vintage · coffee' },
    { x:10, y:13,  text:'Bedford Ave' },
  ],
  doors: {},
  doorSpawns: {},
};

Object.assign(CS.SPOTS, {
  ft_court:  { scene:'foodcourt', x:5, y:4 },
  wb_flea:   { scene:'williamsburg', x:12, y:8 },
});

Object.assign(CS.TRAVEL, {
  flushing:     { name:'Flushing — Golden Mall', cost:3, unlockFlag:'travelFlushing', spawn:[5,7] },
  williamsburg: { name:'Williamsburg — the Flea', cost:3, unlockFlag:'travelWilliamsburg', spawn:[5,7] },
});

/* flea-market weekend stock: mostly the thrift pool at hipster prices,
   plus a few flea-only finds */
CS.ITEMS.neon_sign  = { name:'Neon Sign (works!)', type:'thrift', sell:110, desc:'Says "OPEN". Glows a judgmental pink.', rare:true };
CS.ITEMS.band_tee   = { name:'Vintage Band Tee',   type:'thrift', sell:28,  desc:'A tour that ended before you were born.' };
CS.ITEMS.polaroid   = { name:'Polaroid Camera',    type:'thrift', sell:55,  desc:'Shake it (you\'re not supposed to shake it).' };
CS.FLEA_POOL = [
  ['vinyl_record', 18], ['film_camera', 46], ['ceramic_vase', 24], ['brass_lamp', 28],
  ['old_poster', 12], ['neon_sign', 60], ['band_tee', 15], ['polaroid', 30], ['enamel_pot', 26],
];

/* ---------------- aquarium expansion ---------------- */
CS.ITEMS.fancy_fish = { name:'Fancy Guppy', type:'misc', desc:'A new citizen for the tank. Iridescent, opinionated.' };

/* ---------------- gigs & food ---------------- */
CS.FOODCOURT_MENU = [
  { name:'Hand-pulled noodle soup', price:10, energy:40 },
  { name:'Pork & chive dumplings (12)', price:8, energy:30 },
  { name:'Bubble tea', price:5, energy:15 },
];

/* ---------------- cohabitation lines ---------------- */
CS.COHAB_LINES = [
  "Two toothbrushes in the cup. Neither of you has mentioned it. Both of you have noticed.",
  "\"I fixed the radiator rattle while you were out. It only took three curses. We live here.\"",
  "Their books colonized the second shelf this week. You reorganized nothing. It looks right.",
];

/* ---------------- new festivals ---------------- */
Object.assign(CS.FESTIVALS, {
  open_streets: { name:'Open Streets', season:0, day:8, start:540, end:1020,
    blurb:'Main Street closes to everything but people. Chalk, folding chairs, someone\'s trumpet.' },
  marathon: { name:'Marathon Weekend', season:2, day:5, start:540, end:960,
    blurb:'The route passes the island. Cheer station on Main Street — runners buy anything cold.' },
  movie_night: { name:'Movie Night on the Lawn', season:1, day:18, start:1140, end:1440,
    blurb:'A bedsheet screen, a borrowed projector, the whole island on blankets.' },
});
Object.assign(CS.FESTIVAL_LINES, {
  open_streets: [
    "A kid is teaching Malik a scooter trick. Malik is taking notes. Actual notes.",
    "The street without cars sounds like what the neighborhood must have sounded like first.",
  ],
  marathon: [
    "Runner 4,116 just high-fived the entire cheer station. We're all crying. It's fine.",
    "Grace hands out water cups like it's a bread line. Precision. Grace under pressure.",
  ],
  movie_night: [
    "The projector's crooked, the sound is mostly wind, and nobody would fix a single thing.",
    "Somewhere in the second act, half the lawn is watching the skyline instead. Same movie, really.",
  ],
});

})();
