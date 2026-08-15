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
CS.WALKABLE = new Set(['.', '-', '_', 'r', 's', 'g', 'P', 'V', 'w', 'A', 'C', 'B', 'M', 'G', 'E', 'S', 'R', 'L', 'H', 'D', 'Q']);

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

/* The real thing: a long, narrow island running north–south in the East
   River — Manhattan rooftops across the west channel, Queens across the
   east, the bridge overhead, Main Street down the spine. 36×64. */
function buildOutdoor() {
  const W = 36, H = 64;
  const g = _grid(W, H, '.');
  // shores: Manhattan rooftops | west channel | island | east channel | Queens
  for (let y = 0; y < H; y++) {
    g[y][0] = '*'; g[y][1] = '*';
    g[y][2] = '~'; g[y][3] = '~'; g[y][4] = '~';
    g[y][31] = '~'; g[y][32] = '~'; g[y][33] = '~';
    g[y][34] = '&'; g[y][35] = '&';
  }
  // the island tapers into the river at both tips
  for (let x = 5; x <= 30; x++) { g[0][x] = '~'; g[1][x] = '~'; g[63][x] = '~'; g[62][x] = '~'; }
  [[5,2],[6,2],[29,2],[30,2],[5,3],[30,3],[5,59],[30,59],[5,60],[6,60],[29,60],[30,60],[5,61],[6,61],[7,61],[8,61],[27,61],[28,61],[29,61],[30,61]].forEach(([x,y]) => { g[y][x] = '~'; });
  // esplanades along both shores (the loop every islander walks)
  for (let y = 4; y <= 58; y++) { if (g[y][5] === '.') g[y][5] = '-'; if (g[y][30] === '.') g[y][30] = '-'; }
  // ---- north tip: Lighthouse Park (the real one) ----
  g[3][17] = 'i';
  [[12,4],[21,4],[9,6],[24,6],[14,7]].forEach(([x,y]) => { if (g[y][x] === '.') g[y][x] = 'c'; });
  g[5][14] = 'h'; g[5][20] = 'h';
  // ---- Main Street runs down the spine ----
  for (let y = 9; y <= 46; y++) { g[y][16] = 'r'; g[y][17] = 'r'; }
  // cross streets
  for (let x = 6; x <= 15; x++) g[16][x] = 'r';   // to Harbor Studios
  for (let x = 18; x <= 19; x++) g[15][x] = 'r';  // stub to the farm gate
  for (let x = 6; x <= 15; x++) g[24][x] = 'r';   // to the ferry landing
  for (let x = 6; x <= 15; x++) g[45][x] = 'r';   // to the tram
  // ---- west side, north: Harbor Studios ----
  _rect(g, 6, 11, 7, 5, '#'); g[15][9] = 'A';
  // ---- west side: Harbor House ----
  _rect(g, 5, 17, 8, 6, '#'); g[22][8] = 'H';
  // ---- east side, north: Community Farm ----
  for (let x = 20; x <= 30; x++) { g[10][x] = 'F'; g[20][x] = 'F'; }
  for (let y = 10; y <= 20; y++) { g[y][20] = 'F'; g[y][30] = 'F'; }
  g[15][20] = '.'; g[16][20] = '.'; // gate faces Main Street
  _rect(g, 24, 11, 5, 4, '#'); g[14][26] = 'G'; // greenhouse
  _rect(g, 21, 16, 6, 4, 's');                  // 24 plots
  g[16][28] = 'X'; g[18][28] = 'N';
  // ---- Main Street commercial strip, both sides ----
  _rect(g, 19, 21, 7, 3, '#'); g[23][22] = 'C'; // Juniper Café (east)
  for (let x = 18; x <= 26; x++) if (g[24][x] === '.') g[24][x] = '-';
  _rect(g, 19, 25, 6, 3, '#'); g[27][21] = 'B'; // Moonrise
  for (let x = 18; x <= 25; x++) if (g[28][x] === '.') g[28][x] = '-';
  _rect(g, 19, 29, 7, 3, '#'); g[31][22] = 'M'; // Corner Market
  for (let x = 18; x <= 26; x++) if (g[32][x] === '.') g[32][x] = '-';
  _rect(g, 19, 33, 7, 3, '#'); g[35][22] = 'R'; // The Anchor
  for (let x = 18; x <= 26; x++) if (g[36][x] === '.') g[36][x] = '-';
  _rect(g, 9, 25, 6, 3, '#'); g[27][12] = 'S';  // Second Life (west)
  for (let x = 8; x <= 15; x++) if (g[28][x] === '.') g[28][x] = '-';
  _rect(g, 9, 33, 6, 3, '#'); g[35][12] = 'Q';  // Glasshouse (west)
  for (let x = 8; x <= 15; x++) if (g[36][x] === '.') g[36][x] = '-';
  // ---- transit, where it really is ----
  g[29][14] = 'V'; g[29][15] = 'V';             // F train, mid-island
  g[24][2] = 'w'; g[24][3] = 'w'; g[24][4] = 'w'; // NYC Ferry landing, west channel
  _rect(g, 6, 44, 3, 2, 'P');                   // tram, west side by the bridge
  // ---- south: Pier Labs campus (the Cornell Tech of this island) ----
  _rect(g, 10, 47, 14, 5, '#'); g[51][12] = 'L';
  // ---- Southpoint Park: lawn + the old ruin ----
  g[54][22] = 'u';
  [[9,54],[26,55],[13,56]].forEach(([x,y]) => { if (g[y][x] === '.') g[y][x] = 'c'; });
  g[55][8] = 'h'; g[56][27] = 'h';
  // ---- the memorial plaza at the very tip ----
  for (let y = 58; y <= 60; y++) for (let x = 12; x <= 23; x++) { if (g[y][x] === '.') g[y][x] = '_'; }
  [[11,58],[24,58],[11,59],[24,59]].forEach(([x,y]) => { if (g[y][x] === '.') g[y][x] = 'T'; });
  // ---- street furniture ----
  [[15,20],[18,26],[15,32],[18,40]].forEach(([x,y]) => { if (g[y][x] === '.') g[y][x] = 'o'; });
  [[15,21],[18,25],[15,29],[18,33],[15,37],[18,43]].forEach(([x,y]) => { if (g[y][x] === '.') g[y][x] = 'y'; });
  [[18,21],[15,35]].forEach(([x,y]) => { if (g[y][x] === '.') g[y][x] = 'j'; });
  g[22][14] = 'k'; g[34][18] = 'k';
  // trees where the island breathes
  [[8,8],[25,8],[7,30],[27,38],[8,41],[26,43],[7,53],[19,53],[28,46]].forEach(([x,y]) => {
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
      { x:13, y:1.2,  text:'Lighthouse Park' },
      { x:6,  y:10,   text:'Harbor Studios' },
      { x:21, y:9.4,  text:'Community Farm' },
      { x:24, y:10.4, text:'Greenhouse' },
      { x:5,  y:16,   text:'Harbor House' },
      { x:19, y:22.2, text:'Juniper Café' },
      { x:9,  y:26.2, text:'Second Life' },
      { x:19, y:26.2, text:'Moonrise' },
      { x:19, y:30.2, text:'Corner Market' },
      { x:9,  y:34.2, text:'For Lease', ifNotFlag:'glasshouseOpen' },
      { x:9,  y:34.2, text:'Glasshouse', ifFlag:'glasshouseOpen' },
      { x:19, y:34.2, text:'The Anchor' },
      { x:12.8, y:28.6, text:'F Train' },
      { x:1.2,  y:23,  text:'NYC Ferry' },
      { x:6,  y:43,   text:'Tram → Manhattan' },
      { x:20, y:40.6, text:'Queensboro Bridge' },
      { x:11, y:46,   text:'Pier Labs' },
      { x:13, y:53.4, text:'Southpoint Park' },
      { x:21, y:54.8, text:'the Ruin' },
      { x:13.5, y:59, text:'Four Freedoms' },
      { x:0.2,  y:31, text:'Manhattan' },
      { x:34,   y:31, text:'Queens' },
    ],
    doors: { A:'apartment', C:'cafe', B:'bakery', M:'market', G:'greenhouse',
             S:'thrift', R:'bar', L:'labs', H:'harbor_house', Q:'glasshouse' },
    doorSpawns: { A:[9,16], C:[22,24], B:[21,28], M:[22,32], G:[26,15],
                  S:[12,28], R:[22,36], L:[12,52], H:[8,23], Q:[12,36] },
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

/* Building facades: drawn as whole structures (roof + walls + windows)
   over their '#' footprints. style: 'shop' (shingle roof + awning),
   'block' (brick + parapet), 'glass' (greenhouse). */
CS.BUILDINGS = {
  outdoor: [
    { x:6,  y:11, w:7,  h:5, style:'block', wall:'#c09a72', roof:'#6e5f55', img:'apartment' },   // Harbor Studios
    { x:5,  y:17, w:8,  h:6, style:'block', wall:'#c07f62', roof:'#5d4e40', img:'harborhouse' }, // Harbor House
    { x:24, y:11, w:5,  h:4, style:'glass', img:'greenhouse' },                                  // Greenhouse
    { x:19, y:21, w:7,  h:3, style:'shop',  wall:'#e0d3b8', roof:'#5c8a6f', img:'cafe' },        // Juniper Café
    { x:19, y:25, w:6,  h:3, style:'shop',  wall:'#e6d2ae', roof:'#b07a2a', img:'bakery' },      // Moonrise
    { x:19, y:29, w:7,  h:3, style:'shop',  wall:'#d8cbb2', roof:'#4a6fa5', img:'market' },      // Corner Market
    { x:19, y:33, w:7,  h:3, style:'shop',  wall:'#b8a48c', roof:'#8a3b4a', img:'pub' },         // The Anchor
    { x:9,  y:25, w:6,  h:3, style:'shop',  wall:'#cbb9a0', roof:'#7d5ba6', img:'thrift' },      // Second Life
    { x:9,  y:33, w:6,  h:3, style:'shop',  wall:'#cfd8d2', roof:'#37535e', img:'glasshouse' },  // Glasshouse
    { x:10, y:47, w:14, h:5, style:'block', wall:'#a7b2b6', roof:'#5b8aa6', img:'labs' },        // Pier Labs
  ],
  astoria: [
    { x:6,  y:2, w:12, h:3, style:'shop', wall:'#d8c4a4', roof:'#8a3b4a', img:'bellinis' },
  ],
  chinatown: [
    { x:4,  y:2, w:9, h:3, style:'shop', wall:'#c9553e', roof:'#3f4f3a', img:'teahouse' },
    { x:16, y:2, w:8, h:3, style:'shop', wall:'#d8b48a', roof:'#b3542e', img:'mott' },
  ],
  flushing: [
    { x:3,  y:2, w:12, h:3, style:'shop', wall:'#d8c4a4', roof:'#c9553e', img:'foodcourt' },
    { x:17, y:2, w:7,  h:3, style:'shop', wall:'#c9b694', roof:'#5b8aa6', img:'boba' },
  ],
  williamsburg: [
    { x:3,  y:2, w:8,  h:3, style:'block', wall:'#a8846a', roof:'#6b5b4c', img:'wcafe' },
    { x:14, y:2, w:10, h:3, style:'block', wall:'#9a8a7a', roof:'#5d4e40', img:'wflea' },
  ],
};

/* Transit, the Roosevelt-Island way: three real modes, real fares.
   `modes` says which station can take you there. */
CS.FARES = { tram: 2.90, subway: 2.90, ferry: 4.50 };
CS.TRAVEL = {
  chinatown: { name:'Chinatown — Mott St', modes:['tram','subway'], unlockFlag:'travelChinatown', spawn:[5,7] },
  astoria:   { name:"Astoria — Bellini's", modes:['ferry'],          unlockFlag:'travelAstoria',  spawn:[5,7] },
};
CS.RIDE_FLAVOR = {
  tram: 'The cabin sways off the platform and climbs — the river drops away underneath, the bridge slides past at eye level, and for ninety seconds the whole city is yours.',
  subway: 'Down the stairs, tap through, and the F rattles you under the river. Someone is playing a saxophone two cars down. It is, somehow, good.',
  ferry: 'The ferry pulls off the pier with that low diesel hum. Wind, spray, skyline. The best commute money can buy.',
};

/* ---------------- Named spots for NPC schedules ---------------- */
CS.SPOTS = {
  tram: { scene:'outdoor', x:7, y:45 },
  mainstreet: { scene:'outdoor', x:16, y:26 },
  mainstreet_b: { scene:'outdoor', x:17, y:40 },
  farm_center: { scene:'outdoor', x:24, y:17 },
  farm_gate: { scene:'outdoor', x:19, y:16 },
  waterfront_a: { scene:'outdoor', x:5, y:12 },
  waterfront_b: { scene:'outdoor', x:5, y:38 },
  waterfront_c: { scene:'outdoor', x:30, y:30 },
  lighthouse_park: { scene:'outdoor', x:17, y:6 },
  lawn_a: { scene:'outdoor', x:12, y:54 },
  lawn_b: { scene:'outdoor', x:17, y:55 },
  lawn_c: { scene:'outdoor', x:25, y:56 },
  lawn_d: { scene:'outdoor', x:14, y:57 },
  lawn_e: { scene:'outdoor', x:20, y:53 },
  stall_a: { scene:'outdoor', x:14, y:22 },
  stall_b: { scene:'outdoor', x:18, y:34 },
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
  flushing:     { name:'Flushing — Golden Mall', modes:['subway'], unlockFlag:'travelFlushing', spawn:[5,7] },
  williamsburg: { name:'Williamsburg — the Flea', modes:['ferry','subway'], unlockFlag:'travelWilliamsburg', spawn:[5,7] },
});

})();
