/* =========================================================================
   Concrete Seasons — data/world.js
   Every map (Harbor Point, interiors, city hubs), spots, travel.
   ========================================================================= */
(function () {
/* ---------------- Maps ----------------
   Tiles: . grass  - path  ~ water  T tree  F fence  # wall  s soil  g soil(greenhouse)
          P tram platform  h bench  X ship bin  N noticeboard  o planter
          A/C/B/M/G door tiles (apartment/cafe/bakery/market/greenhouse)  E interior exit
          K kitchen  b bed  t table  W window  = shelf  O oven  d display  U counter  q aquarium spot
*/
CS.WALKABLE = new Set(['.', '-', '_', 's', 'g', 'P', 'A', 'C', 'B', 'M', 'G', 'E', 'S', 'R', 'L', 'H', 'D', 'Q']);

function _grid(w, h, fill) {
  const g = [];
  for (let y = 0; y < h; y++) g.push(new Array(w).fill(fill));
  return g;
}
function _rect(g, x, y, w, h, ch) {
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) g[yy][xx] = ch;
}
function _fromAscii(rows) {
  return rows.map(r => r.split(''));
}

/* Phase 2 map: 56×42. Zones — Lighthouse Park (NW), Harbor Studios,
   Harbor House, Community Farm (NE), Main Street with five storefronts,
   South Point lawn (festival ground), Pier Labs (SE), waterfront. */
function buildOutdoor() {
  const W = 56, H = 42;
  const g = _grid(W, H, '.');
  for (let x = 0; x < W; x++) g[0][x] = 'T';
  for (let y = 0; y < 37; y++) { g[y][0] = 'T'; g[y][W - 1] = 'T'; }
  // water south
  _rect(g, 0, 38, W, 4, '~');
  // lighthouse park (NW): cherry trees + lighthouse + bench
  [[7,3],[11,4],[8,8],[12,7],[3,8]].forEach(([x,y]) => { g[y][x] = 'c'; });
  g[4][4] = 'i';
  g[6][10] = 'h';
  // apartment building (Harbor Studios)
  _rect(g, 16, 2, 8, 5, '#'); g[6][19] = 'A';
  for (let y = 7; y <= 15; y++) g[y][19] = '-';
  // Harbor House community center
  _rect(g, 26, 2, 10, 6, '#'); g[7][30] = 'H';
  for (let y = 8; y <= 15; y++) g[y][30] = '-';
  // farm fence + interior (NE)
  for (let x = 38; x <= 54; x++) { g[2][x] = 'F'; g[11][x] = 'F'; }
  for (let y = 2; y <= 11; y++) { g[y][38] = 'F'; g[y][54] = 'F'; }
  g[11][44] = '.'; g[11][45] = '.'; // gate
  _rect(g, 47, 3, 6, 4, '#'); g[6][49] = 'G'; // greenhouse
  _rect(g, 39, 5, 6, 4, 's');                 // 24 soil plots
  g[10][39] = 'X'; g[10][46] = 'N';
  for (let y = 12; y <= 15; y++) { g[y][44] = '-'; g[y][45] = '-'; }
  // tram platform
  _rect(g, 2, 13, 4, 2, 'P');
  // main street
  _rect(g, 1, 16, 54, 2, '-');
  // street furniture: planters + market stalls
  [10, 37, 49].forEach(x => { g[18][x] = 'o'; });
  g[18][20] = 'k'; g[18][28] = 'k';
  // storefronts south of street
  _rect(g, 3, 19, 7, 4, '#');  g[19][6]  = 'S'; // Second Life thrift
  _rect(g, 12, 19, 8, 4, '#'); g[19][15] = 'C'; // Juniper Café
  _rect(g, 22, 19, 6, 4, '#'); g[19][24] = 'B'; // Moonrise Bakery
  _rect(g, 30, 19, 7, 4, '#'); g[19][33] = 'M'; // Corner Market
  _rect(g, 39, 19, 8, 4, '#'); g[19][42] = 'R'; // The Anchor bar
  _rect(g, 48, 19, 6, 4, '#'); g[19][51] = 'Q'; // Glasshouse Coffee (opens Year 2)
  // south point lawn: cherries at the fringe
  [[16,26],[22,25],[30,25],[38,26],[26,24]].forEach(([x,y]) => { g[y][x] = 'c'; });
  // paths to waterfront
  for (let y = 23; y <= 33; y++) { g[y][15] = '-'; g[y][33] = '-'; }
  // Pier Labs (SE)
  _rect(g, 44, 26, 9, 6, '#'); g[26][48] = 'L';
  for (let y = 23; y <= 25; y++) g[y][48] = '-';
  // waterfront promenade
  _rect(g, 1, 34, 54, 2, '-');
  [12, 28, 45].forEach(x => { g[36][x] = 'h'; });
  // scattered trees
  [[24,10],[34,13],[13,10],[52,13],[8,24],[42,24],[6,30],[41,32]].forEach(([x,y]) => {
    if (g[y][x] === '.') g[y][x] = 'T';
  });
  return g;
}

/* City hub maps: paved ground '_' instead of grass, buildings for walls.
   'D' is the generic enterable-door tile; 'l' is a lantern post. */
function buildAstoria() {
  const W = 26, H = 16;
  const g = _grid(W, H, '_');
  _rect(g, 0, 0, W, 2, '#');
  _rect(g, 0, H - 2, W, 2, '#');
  for (let y = 0; y < H; y++) { g[y][0] = '#'; g[y][W - 1] = '#'; }
  _rect(g, 6, 2, 12, 3, '#');   // Bellini's building
  g[4][12] = 'D';
  _rect(g, 2, 6, 3, 2, 'P');    // subway back home
  [7, 17, 21].forEach(x => { g[6][x] = 'o'; });
  [5, 19].forEach(x => { g[10][x] = 'o'; });
  g[9][22] = 'h'; g[9][3] = 'h';
  return g;
}
function buildChinatown() {
  const W = 26, H = 16;
  const g = _grid(W, H, '_');
  _rect(g, 0, 0, W, 2, '#');
  _rect(g, 0, H - 2, W, 2, '#');
  for (let y = 0; y < H; y++) { g[y][0] = '#'; g[y][W - 1] = '#'; }
  _rect(g, 4, 2, 9, 3, '#');    // teahouse block
  g[4][8] = 'D';
  _rect(g, 16, 2, 8, 3, '#');   // flavor storefronts
  _rect(g, 2, 6, 3, 2, 'P');    // subway back home
  [6, 11, 15, 20].forEach(x => { g[6][x] = 'l'; });
  [8, 13, 18].forEach(x => { g[10][x] = 'l'; });
  g[8][11] = 'k'; g[8][16] = 'k'; // festival stalls
  g[11][21] = 'h';
  return g;
}

CS.MAPS = {
  astoria: {
    name: 'Astoria — Ditmars', outdoor: true, city: true,
    grid: buildAstoria(),
    labels: [
      { x:8,  y:3.4, text:"Bellini's" },
      { x:2,  y:5,   text:'Subway' },
      { x:17, y:9,   text:'Ditmars Blvd' },
    ],
    doors: { D:'bellinis' },
    doorSpawns: { D:[12,5] },
  },
  chinatown: {
    name: 'Chinatown — Mott St', outdoor: true, city: true,
    grid: buildChinatown(),
    labels: [
      { x:5,  y:3.4, text:'Jade Pavilion Tea' },
      { x:2,  y:5,   text:'Subway' },
      { x:16, y:3.4, text:'Golden Bowl · herbs · gifts' },
      { x:12, y:12.5, text:'Mott Street' },
    ],
    doors: { D:'teahouse' },
    doorSpawns: { D:[8,5] },
  },
  outdoor: {
    name: 'Harbor Point',
    outdoor: true,
    grid: buildOutdoor(),
    labels: [
      { x:2,  y:1,    text:'Lighthouse Park' },
      { x:16, y:1,    text:'Harbor Studios' },
      { x:26, y:1,    text:'Harbor House' },
      { x:40, y:1,    text:'Community Farm' },
      { x:47, y:2.4,  text:'Greenhouse' },
      { x:2,  y:12,   text:'Tram' },
      { x:3,  y:20.4, text:'Second Life' },
      { x:12, y:20.4, text:'Juniper Café' },
      { x:22, y:20.4, text:'Moonrise' },
      { x:30, y:20.4, text:'Corner Market' },
      { x:39, y:20.4, text:'The Anchor' },
      { x:48, y:20.4, text:'For Lease', ifNotFlag:'glasshouseOpen' },
      { x:48, y:20.4, text:'Glasshouse', ifFlag:'glasshouseOpen' },
      { x:23, y:29,   text:'South Point' },
      { x:44, y:27.4, text:'Pier Labs' },
      { x:25, y:36.6, text:'East River' },
    ],
    doors: { A:'apartment', C:'cafe', B:'bakery', M:'market', G:'greenhouse',
             S:'thrift', R:'bar', L:'labs', H:'harbor_house', Q:'glasshouse' },
    doorSpawns: { A:[19,7], C:[15,18], B:[24,18], M:[33,18], G:[49,7],
                  S:[6,18], R:[42,18], L:[48,25], H:[30,8], Q:[51,18] },
  },
  apartment: {
    name: 'Your Studio', outdoor: false, exitTo: 'outdoor', exitKey: 'A',
    grid: _fromAscii([
      '############',
      '#KK......W.#',
      '#..........#',
      '#bb..tt....#',
      '#bb........#',
      '#..........#',
      '#q.........#',
      '#####E######',
    ]),
    labels: [],
  },
  cafe: {
    name: 'Juniper Café', outdoor: false, exitTo: 'outdoor', exitKey: 'C',
    grid: _fromAscii([
      '##############',
      '#UUUU........#',
      '#............#',
      '#.tt..tt..tt.#',
      '#............#',
      '#.tt..tt..tt.#',
      '#............#',
      '######E#######',
    ]),
    labels: [],
  },
  bakery: {
    name: 'Moonrise Bakery', outdoor: false, exitTo: 'outdoor', exitKey: 'B',
    grid: _fromAscii([
      '##########',
      '#OO..UUU.#',
      '#........#',
      '#.dd.....#',
      '#........#',
      '#........#',
      '####E#####',
    ]),
    labels: [],
  },
  market: {
    name: 'Corner Market', outdoor: false, exitTo: 'outdoor', exitKey: 'M',
    grid: _fromAscii([
      '############',
      '#U..===.===#',
      '#..........#',
      '#.===.===..#',
      '#..........#',
      '#..........#',
      '#####E######',
    ]),
    labels: [],
  },
  greenhouse: {
    name: 'Greenhouse', outdoor: false, exitTo: 'outdoor', exitKey: 'G',
    grid: _fromAscii([
      '##########',
      '#gggg....#',
      '#gggg....#',
      '#........#',
      '#........#',
      '####E#####',
    ]),
    labels: [],
  },
  thrift: {
    name: 'Second Life', outdoor: false, exitTo: 'outdoor', exitKey: 'S',
    grid: _fromAscii([
      '############',
      '#U..===.===#',
      '#..........#',
      '#.===..===.#',
      '#..........#',
      '#..........#',
      '#####E######',
    ]),
    labels: [],
  },
  bar: {
    name: 'The Anchor', outdoor: false, exitTo: 'outdoor', exitKey: 'R',
    grid: _fromAscii([
      '##############',
      '#UUUUUU......#',
      '#............#',
      '#.tt..tt..tt.#',
      '#............#',
      '#.tt..tt.....#',
      '######E#######',
    ]),
    labels: [],
  },
  labs: {
    name: 'Pier Labs', outdoor: false, exitTo: 'outdoor', exitKey: 'L',
    grid: _fromAscii([
      '############',
      '#tt..tt..tt#',
      '#..........#',
      '#tt..tt....#',
      '#..........#',
      '#####E######',
    ]),
    labels: [],
  },
  harbor_house: {
    name: 'Harbor House', outdoor: false, exitTo: 'outdoor', exitKey: 'H',
    grid: _fromAscii([
      '##############',
      '#N....tt.....#',
      '#............#',
      '#.tt......tt.#',
      '#............#',
      '#............#',
      '######E#######',
    ]),
    labels: [],
  },
  bellinis: {
    name: "Bellini's", outdoor: false, exitTo: 'astoria', exitKey: 'D',
    grid: _fromAscii([
      '##############',
      '#OO.UU.......#',
      '#............#',
      '#.tt..tt..tt.#',
      '#............#',
      '#.tt..tt..tt.#',
      '#............#',
      '######E#######',
    ]),
    labels: [],
  },
  teahouse: {
    name: 'Jade Pavilion Tea', outdoor: false, exitTo: 'chinatown', exitKey: 'D',
    grid: _fromAscii([
      '##########',
      '#UU..=...#',
      '#........#',
      '#.tt.tt..#',
      '#........#',
      '####E#####',
    ]),
    labels: [],
  },
};
// interior spawn points (stepping through an outdoor door lands here)
CS.INTERIOR_SPAWNS = { apartment:[5,6], cafe:[6,6], bakery:[4,5], market:[5,5], greenhouse:[4,4],
                       thrift:[5,5], bar:[6,5], labs:[5,4], harbor_house:[6,5],
                       bellinis:[6,6], teahouse:[4,4] };

/* Tram/subway destinations. `unlockFlag` is set by story/text triggers. */
CS.TRAVEL = {
  astoria:   { name:"Astoria — Bellini's", cost:3, unlockFlag:'travelAstoria',  spawn:[5,7] },
  chinatown: { name:'Chinatown — Mott St', cost:3, unlockFlag:'travelChinatown', spawn:[5,7] },
};

/* ---------------- Named spots for NPC schedules ---------------- */
CS.SPOTS = {
  tram:            { scene:'outdoor', x:3,  y:14 },
  mainstreet:      { scene:'outdoor', x:24, y:16 },
  mainstreet_b:    { scene:'outdoor', x:40, y:17 },
  farm_center:     { scene:'outdoor', x:41, y:4 },
  farm_gate:       { scene:'outdoor', x:44, y:12 },
  waterfront_a:    { scene:'outdoor', x:12, y:34 },
  waterfront_b:    { scene:'outdoor', x:28, y:34 },
  waterfront_c:    { scene:'outdoor', x:45, y:34 },
  lighthouse_park: { scene:'outdoor', x:9,  y:6 },
  lawn_a:          { scene:'outdoor', x:20, y:28 },
  lawn_b:          { scene:'outdoor', x:26, y:29 },
  lawn_c:          { scene:'outdoor', x:32, y:28 },
  lawn_d:          { scene:'outdoor', x:24, y:26 },
  lawn_e:          { scene:'outdoor', x:35, y:30 },
  stall_a:         { scene:'outdoor', x:20, y:17 },
  stall_b:         { scene:'outdoor', x:28, y:17 },
  cafe_table_a:    { scene:'cafe', x:2,  y:4 },
  cafe_table_b:    { scene:'cafe', x:7,  y:4 },
  cafe_table_c:    { scene:'cafe', x:11, y:4 },
  cafe_counter:    { scene:'cafe', x:5,  y:2 },
  bakery_counter:  { scene:'bakery', x:6, y:2 },
  bakery_oven:     { scene:'bakery', x:3, y:2 },
  bakery_front:    { scene:'bakery', x:5, y:4 },
  market_counter:  { scene:'market', x:2, y:2 },
  market_aisle:    { scene:'market', x:8, y:4 },
  bar_seat_a:      { scene:'bar', x:2, y:2 },
  bar_seat_b:      { scene:'bar', x:4, y:2 },
  bar_work:        { scene:'bar', x:8, y:2 },
  bar_table:       { scene:'bar', x:9, y:4 },
  thrift_browse:   { scene:'thrift', x:6, y:4 },
  lab_a:           { scene:'labs', x:2, y:2 },
  lab_b:           { scene:'labs', x:6, y:2 },
  lab_c:           { scene:'labs', x:9, y:2 },
  hh_a:            { scene:'harbor_house', x:3, y:2 },
  hh_b:            { scene:'harbor_house', x:9, y:3 },
  bellinis_host:   { scene:'bellinis', x:6, y:2 },
  bellinis_table:  { scene:'bellinis', x:9, y:4 },
  ct_street_a:     { scene:'chinatown', x:9,  y:7 },
  ct_street_b:     { scene:'chinatown', x:14, y:9 },
  ct_street_c:     { scene:'chinatown', x:19, y:7 },
  ct_stall:        { scene:'chinatown', x:12, y:8 },
  tea_table:       { scene:'teahouse', x:5, y:3 },
};

/* ---------------- Glasshouse Coffee ---------------- */
CS.MAPS.glasshouse = {
  name: 'Glasshouse Coffee', outdoor: false, exitTo: 'outdoor', exitKey: 'Q',
  grid: [
    '############',
    '#UUU....==.#',
    '#..........#',
    '#.tt..tt...#',
    '#..........#',
    '#.tt..tt...#',
    '#####E######',
  ].map(r => r.split('')),
  labels: [],
};
CS.INTERIOR_SPAWNS.glasshouse = [5, 5];

Object.assign(CS.SPOTS, {
  glass_counter:  { scene:'glasshouse', x:4, y:2 },
  glass_table_a:  { scene:'glasshouse', x:2, y:4 },
  glass_table_b:  { scene:'glasshouse', x:7, y:4 },
  apartment_home: { scene:'apartment', x:8, y:2 },
});
/* when Juniper closes, its regulars migrate across the street */
CS.CAFE_FALLBACK = {
  cafe_table_a:'glass_table_a', cafe_table_b:'glass_table_b',
  cafe_table_c:'glass_table_a', cafe_counter:'glass_counter',
};
CS.GLASS_FALLBACK = {
  glass_table_a:'cafe_table_a', glass_table_b:'cafe_table_b', glass_counter:'cafe_counter',
};

/* ---------------- the one-bedroom (Year 2 lease offer) ----------------
   Same scene id as the studio; the grid swaps. Studio landmarks (bed,
   kitchen, window, tank shelf) keep their coordinates so pets, cribs and
   spouse spots stay valid. */
CS.ONEBR_GRID = [
  '################',
  '#KK......W..tt.#',
  '#..............#',
  '#bb..tt........#',
  '#bb............#',
  '#..........tt..#',
  '#q...........W.#',
  '#####E##########',
].map(r => r.split(''));

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

})();
