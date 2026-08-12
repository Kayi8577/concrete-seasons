/* =========================================================================
   Concrete Seasons — data.js
   All static, data-driven content: maps, crops, items, NPCs, schedules,
   dialogue pools, festivals-to-come. Everything offline & authored.
   ========================================================================= */
window.CS = window.CS || {};

CS.SAVE_VERSION = 2;
CS.SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'];
CS.WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
CS.DAY_START = 360;      // 6:00
CS.DAY_END   = 1560;     // 2:00 next day
CS.MIN_PER_TICK = 1;

/* ---------------- Appearance options ---------------- */
CS.SKINS   = ['#f6d7b8', '#e8b98a', '#c68a52', '#8d5a33'];
CS.HAIRS   = ['#2d2a26', '#5b3a1e', '#a0632a', '#c9a24b', '#8a8a8a'];
CS.OUTFITS = ['#5c8a6f', '#4a6fa5', '#b0653a', '#7d5ba6', '#c74f6d'];

/* ---------------- Items & crops ---------------- */
CS.CROPS = {
  // season: 0 spring, 1 summer (greenhouse ignores season)
  lettuce:    { name:'Lettuce',    days:4, sell:32, seedCost:12, regrow:0, season:0 },
  radish:     { name:'Radish',     days:3, sell:22, seedCost:9,  regrow:0, season:0 },
  strawberry: { name:'Strawberry', days:8, sell:48, seedCost:34, regrow:3, season:0 },
  tulip:      { name:'Tulip',      days:5, sell:30, seedCost:11, regrow:0, season:0 },
  tomato:     { name:'Tomato',     days:7, sell:40, seedCost:26, regrow:3, season:1 },
  basil:      { name:'Basil',      days:5, sell:34, seedCost:20, regrow:2, season:1 },
  cucumber:   { name:'Cucumber',   days:6, sell:36, seedCost:22, regrow:4, season:1 },
  sunflower:  { name:'Sunflower',  days:8, sell:52, seedCost:30, regrow:0, season:1 },
  kale:       { name:'Kale',       days:5, sell:30, seedCost:14, regrow:2, season:2 },
  carrot:     { name:'Carrot',     days:6, sell:34, seedCost:16, regrow:0, season:2 },
  squash:     { name:'Squash',     days:9, sell:62, seedCost:36, regrow:4, season:2 },
  chrysanthemum: { name:'Chrysanthemum', days:7, sell:44, seedCost:22, regrow:0, season:2 },
};

CS.ITEMS = {
  lettuce_seed:    { name:'Lettuce Seeds',    type:'seed', crop:'lettuce',    desc:'Crisp spring green. 4 days.' },
  radish_seed:     { name:'Radish Seeds',     type:'seed', crop:'radish',     desc:'Fast and forgiving. 3 days.' },
  strawberry_seed: { name:'Strawberry Seeds', type:'seed', crop:'strawberry', desc:'Slow, but regrows. 8 days.' },
  tulip_seed:      { name:'Tulip Bulbs',      type:'seed', crop:'tulip',      desc:'Harbor Point loves flowers. 5 days.' },
  lettuce:    { name:'Lettuce',    type:'crop', sell:32, energy:12, desc:'Fresh from your plot.' },
  radish:     { name:'Radish',     type:'crop', sell:22, energy:8,  desc:'Peppery and quick.' },
  strawberry: { name:'Strawberry', type:'crop', sell:48, energy:15, desc:'The good stuff.' },
  tulip:      { name:'Tulip',      type:'crop', sell:30, energy:0,  desc:'Not edible. Very sellable.' },
  tomato_seed:    { name:'Tomato Seeds',    type:'seed', crop:'tomato',    desc:'Summer star. Regrows. 7 days.' },
  basil_seed:     { name:'Basil Seeds',     type:'seed', crop:'basil',     desc:'Nico will find you. 5 days.' },
  cucumber_seed:  { name:'Cucumber Seeds',  type:'seed', crop:'cucumber',  desc:'Cool in every sense. 6 days.' },
  sunflower_seed: { name:'Sunflower Seeds', type:'seed', crop:'sunflower', desc:'Taller than your problems. 8 days.' },
  tomato:     { name:'Tomato',    type:'crop', sell:40, energy:12, desc:'Sun in edible form.' },
  basil:      { name:'Basil',     type:'crop', sell:34, energy:5,  desc:'Half of Queens wants this.' },
  cucumber:   { name:'Cucumber',  type:'crop', sell:36, energy:10, desc:'Crisp. Hydrating. Smug.' },
  sunflower:  { name:'Sunflower', type:'crop', sell:52, energy:0,  desc:'Instant good mood, bouquet-sized.' },
  kale_seed:      { name:'Kale Seeds',      type:'seed', crop:'kale',      desc:'Thrives when everything else quits. 5 days.' },
  carrot_seed:    { name:'Carrot Seeds',    type:'seed', crop:'carrot',    desc:'Worth the wait underground. 6 days.' },
  squash_seed:    { name:'Squash Seeds',    type:'seed', crop:'squash',    desc:'Autumn royalty. 9 days.' },
  chrysanthemum_seed: { name:'Chrysanthemum Bulbs', type:'seed', crop:'chrysanthemum', desc:'Fall\'s answer to the tulip. 7 days.' },
  kale:       { name:'Kale',      type:'crop', sell:30, energy:10, desc:'Sturdy, honest, a little smug about frost.' },
  carrot:     { name:'Carrot',    type:'crop', sell:34, energy:10, desc:'Pulled from the dark, bright as anything.' },
  squash:     { name:'Squash',    type:'crop', sell:62, energy:18, desc:'Heavy enough to count as exercise.' },
  chrysanthemum: { name:'Chrysanthemum', type:'crop', sell:44, energy:0, desc:'Late bloomer. Aren\'t we all.' },
  tea:        { name:'Oolong Tea', type:'food', energy:20, desc:'Mrs. Woo\'s good pot. Chinatown in a cup.' },
  bread:      { name:'Sesame Roll',type:'food', energy:25, desc:'Moonrise Bakery. Still warm.' },
  coffee:     { name:'Coffee',     type:'food', energy:18, desc:'Juniper Café pour-over.' },
  pet_food:   { name:'Pet Food',   type:'misc', desc:'For a hungry roommate.' },
  warm_roll:  { name:'5:42 Roll',  type:'food', energy:30, desc:'Grace\'s first batch. You were there.' },
  // meals (cooked at your kitchen)
  meal_salad:   { name:'Garden Salad',      type:'meal', energy:40, sell:55,  desc:'Your lettuce, your radish, your kitchen.' },
  meal_roast:   { name:'Roasted Radishes',  type:'meal', energy:35, sell:48,  desc:'Peppery, caramelized, gone.' },
  meal_galette: { name:'Strawberry Galette',type:'meal', energy:60, sell:95,  desc:'Grace\'s recipe. Rustic on purpose.' },
  meal_pasta:   { name:'Basil Pomodoro',    type:'meal', energy:65, sell:110, desc:'The Bellini family would approve. Mostly.' },
  // thrift finds (Second Life)
  vinyl_record: { name:'Vinyl Record',   type:'thrift', sell:24, desc:'Someone\'s entire 1978.' },
  film_camera:  { name:'Film Camera',    type:'thrift', sell:70, desc:'Heavy, mechanical, perfect.', rare:true },
  ceramic_vase: { name:'Ceramic Vase',   type:'thrift', sell:30, desc:'Hand-thrown. Slightly crooked. Better for it.' },
  brass_lamp:   { name:'Brass Lamp',     type:'thrift', sell:34, desc:'Warm light, minor electrical mystery.' },
  old_poster:   { name:'Concert Poster', type:'thrift', sell:14, desc:'A venue that no longer exists.' },
  wool_scarf:   { name:'Wool Scarf',     type:'thrift', sell:16, desc:'Softer than it looks.' },
  planter_box:  { name:'Planter Box',    type:'thrift', sell:22, desc:'Cedar. Someone loved plants once.' },
  transit_sign: { name:'Transit Sign',   type:'thrift', sell:90, desc:'Authentic. Don\'t ask how it got here.', rare:true },
  paperback:    { name:'Worn Paperback', type:'thrift', sell:8,  desc:'Margins full of a stranger\'s thoughts.' },
  enamel_pot:   { name:'Enamel Pot',     type:'thrift', sell:33, desc:'Decades of Sunday sauce in its bones.' },
};

/* Market stock — seeds filtered by current season at display time */
CS.SHOP_MARKET = [
  { item:'lettuce_seed',    price:12, season:0 },
  { item:'radish_seed',     price:9,  season:0 },
  { item:'strawberry_seed', price:34, season:0 },
  { item:'tulip_seed',      price:11, season:0 },
  { item:'tomato_seed',     price:26, season:1 },
  { item:'basil_seed',      price:20, season:1 },
  { item:'cucumber_seed',   price:22, season:1 },
  { item:'sunflower_seed',  price:30, season:1 },
  { item:'kale_seed',       price:14, season:2 },
  { item:'carrot_seed',     price:16, season:2 },
  { item:'squash_seed',     price:36, season:2 },
  { item:'chrysanthemum_seed', price:22, season:2 },
  { item:'pet_food',        price:10 },
  { item:'bread',           price:6 },
];

/* Second Life daily stock pool: [itemId, buyPrice] */
CS.THRIFT_POOL = [
  ['vinyl_record', 14], ['film_camera', 38], ['ceramic_vase', 18], ['brass_lamp', 22],
  ['old_poster', 9], ['wool_scarf', 12], ['planter_box', 16], ['transit_sign', 45],
  ['paperback', 5], ['enamel_pot', 20],
];

/* Recipes — cooked at the apartment kitchen */
CS.RECIPES = {
  meal_salad:   { needs:{ lettuce:1, radish:1 } },
  meal_roast:   { needs:{ radish:3 } },
  meal_galette: { needs:{ strawberry:2, bread:1 }, teacher:'grace' },
  meal_pasta:   { needs:{ basil:2, tomato:1 },     teacher:'nico' },
};

/* Festivals — optional `attendees` restricts who shows up; `where` is the map it happens on */
CS.FESTIVALS = {
  cherry: { name:'Cherry Blossom Picnic', season:0, day:15, start:600, end:960,
            blurb:'South Point lawn, blankets, everyone you know.' },
  night_market: { name:'Night Market', season:1, day:8, start:1080, end:1440,
            blurb:'Main Street stalls after dark. Sell what you grew — prices run hot.' },
  harbor_lights: { name:'Harbor Lights', season:1, day:24, start:1140, end:1440,
            blurb:'Fireworks over the East River. Bring someone, or just bring yourself.' },
  street_food: { name:'Street Food Festival', season:2, day:12, start:600, end:1080,
            blurb:'Main Street smells incredible. Stall prices run hot all day.' },
  holiday_market: { name:'Holiday Market', season:3, day:12, start:960, end:1380,
            blurb:'String lights, hot drinks, and stalls on Main Street.' },
  lunar_new_year: { name:'Lunar New Year', season:3, day:25, start:600, end:1380, where:'chinatown',
            attendees:['mei_lin','maya','daniel','lena','sofia','mateo','avery','naomi'],
            blurb:'Lion dances and lanterns on Mott Street. Take the tram in — flowers and pastries sell like crazy.' },
};

/* NPC↔NPC chemistry pairs: [a, b, compatibility 0..1] */
CS.NPC_PAIRS = [
  ['maya', 'lena', .9], ['maya', 'daniel', .5], ['sofia', 'gabriel', .95],
  ['theo', 'avery', .7], ['theo', 'naomi', .5], ['avery', 'nico', .6],
  ['arjun', 'priya', .9], ['mei_lin', 'naomi', .7], ['mei_lin', 'jordan', .6],
];

/* ---------------- Maps ----------------
   Tiles: . grass  - path  ~ water  T tree  F fence  # wall  s soil  g soil(greenhouse)
          P tram platform  h bench  X ship bin  N noticeboard  o planter
          A/C/B/M/G door tiles (apartment/cafe/bakery/market/greenhouse)  E interior exit
          K kitchen  b bed  t table  W window  = shelf  O oven  d display  U counter  q aquarium spot
*/
CS.WALKABLE = new Set(['.', '-', '_', 's', 'g', 'P', 'A', 'C', 'B', 'M', 'G', 'E', 'S', 'R', 'L', 'H', 'D']);

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
      { x:23, y:29,   text:'South Point' },
      { x:44, y:27.4, text:'Pier Labs' },
      { x:25, y:36.6, text:'East River' },
    ],
    doors: { A:'apartment', C:'cafe', B:'bakery', M:'market', G:'greenhouse',
             S:'thrift', R:'bar', L:'labs', H:'harbor_house' },
    doorSpawns: { A:[19,7], C:[15,18], B:[24,18], M:[33,18], G:[49,7],
                  S:[6,18], R:[42,18], L:[48,25], H:[30,8] },
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

/* ---------------- NPCs ---------------- */
/* Each NPC carries its drawn look: skin/hair colors + hairstyle for the
   vector character renderer (see art.js). No image assets needed. */
CS.NPCS = {
  maya: {
    name:'Maya Chen', color:'#c74f6d', gender:'F', rom:['F','M'],
    look:{ skin:'#e8b98a', hair:'#26221e', style:'long', outfit:'#c74f6d' },
    bio:'Emergency medicine resident. Dry humor, always slightly under-slept.',
    loved:['coffee'], liked:['strawberry','meal_salad'],
  },
  daniel: {
    name:'Daniel Park', color:'#4a6fa5', gender:'M', rom:['F','M'],
    look:{ skin:'#e8b98a', hair:'#1f1c19', style:'short', outfit:'#4a6fa5' },
    bio:'Product manager at a healthcare-tech startup. Structured. Funny about it.',
    loved:['basil'], liked:['bread','coffee'],
  },
  lena: {
    name:'Lena Hoffman', color:'#7d5ba6', gender:'F', rom:['F'],
    look:{ skin:'#f6d7b8', hair:'#a0632a', style:'bun', outfit:'#7d5ba6' },
    bio:'Neuroscience PhD student. Intense, curious, keeps strange hours.',
    loved:['coffee'], liked:['strawberry','paperback'],
  },
  nico: {
    name:'Nico Russo', color:'#b0653a', gender:'M', rom:['F','M','NB'],
    look:{ skin:'#e0aa78', hair:'#3a2c1e', style:'curly', outfit:'#b0653a' },
    bio:'Manages his family\'s restaurant in Queens. Warm, social, impulsive.',
    loved:['basil','tomato'], liked:['meal_pasta','enamel_pot'],
  },
  grace: {
    name:'Grace Okafor', color:'#b07a2a', gender:'F', rom:[],
    look:{ skin:'#8d5a33', hair:'#b3542e', style:'wrap', outfit:'#b07a2a' },
    bio:'Owns Moonrise Bakery. The neighborhood runs on her ovens.',
    loved:['strawberry'], liked:['tulip','meal_galette'],
  },
  malik: {
    name:'Malik Johnson', color:'#5c8a6f', gender:'M', rom:[],
    look:{ skin:'#8d5a33', hair:'#3f4f3a', style:'cap', outfit:'#5c8a6f' },
    bio:'Retired transit worker. Coordinates the community farm. Knows everyone.',
    loved:['tulip'], liked:['lettuce','radish','sunflower'],
  },
  joan: {
    name:'Joan', color:'#8a7361', gender:'F', rom:[],
    look:{ skin:'#f6d7b8', hair:'#8a8a8a', style:'short', outfit:'#8a7361' },
    bio:'Juniper Café barista.', decorative:true,
  },
  rosa: {
    name:'Nonna Rosa', color:'#7a4a3a', gender:'F', rom:[],
    look:{ skin:'#e0aa78', hair:'#c9c4bc', style:'bun', outfit:'#7a4a3a' },
    bio:"Nico's grandmother. Bellini's true head of state.", decorative:true,
  },
  mrs_woo: {
    name:'Mrs. Woo', color:'#5f6e4e', gender:'F', rom:[],
    look:{ skin:'#f0c795', hair:'#8a8a8a', style:'bun', outfit:'#5f6e4e' },
    bio:'Runs the Jade Pavilion tea shop on Mott Street.', decorative:true,
  },
};

/* ---------------- Schedules ----------------
   Each NPC: function(state) -> array of {until, at (spot name|null), act}
   'at:null' means offscreen ("away"). Times are minutes; day 360..1560.
*/
CS.SCHEDULES = {
  maya(s) {
    const wd = s.time.weekdayIndex; // 0=Mon
    const rain = s.weather.today === 'rain';
    if (wd <= 4) {
      if (wd % 2 === 0) { // Mon/Wed/Fri: day shift
        return [
          { until:415,  at:null, act:'getting ready for a shift' },
          { until:450,  at:'tram', act:'waiting for the tram, coffee in hand' },
          { until:1140, at:null, act:'on shift at the hospital' },
          { until:1230, at:'cafe_table_b', act:'decompressing after work' },
          { until:1300, at: rain ? null : 'waterfront_a', act: rain ? 'home early — rain' : 'walking off the shift' },
          { until:9999, at:null, act:'home, asleep by 10' },
        ];
      }
      // Tue/Thu: night shift
      return [
        { until:780,  at:null, act:'sleeping off a night shift' },
        { until:900,  at: rain ? 'cafe_table_b' : 'waterfront_a', act:'slow post-shift morning' },
        { until:960,  at:'market_aisle', act:'groceries before work' },
        { until:1075, at:null, act:'home, prepping for the night' },
        { until:1110, at:'tram', act:'heading in for a night shift' },
        { until:9999, at:null, act:'on the overnight at the hospital' },
      ];
    }
    // weekend
    return [
      { until:540,  at:null, act:'sleeping in, finally' },
      { until:660,  at:'cafe_table_b', act:'weekend coffee ritual' },
      { until:780,  at:'farm_gate', act:'poking around the community farm' },
      { until:900,  at: rain ? null : 'waterfront_a', act: rain ? 'reading at home' : 'river walk' },
      { until:9999, at:null, act:'quiet night in' },
    ];
  },
  daniel(s) {
    const wd = s.time.weekdayIndex;
    const rain = s.weather.today === 'rain';
    if (wd <= 4) {
      return [
        { until:480,  at:null, act:'morning routine, meticulously timed' },
        { until:525,  at:'cafe_table_a', act:'pre-work coffee & standup notes' },
        { until:555,  at:'tram', act:'commuting to the office' },
        { until:1110, at:null, act:'at the office in Midtown' },
        { until:1200, at: wd === 1 || wd === 3 ? 'cafe_table_a' : (rain ? null : 'waterfront_c'), act:'unwinding after work' },
        { until:9999, at:null, act:'home, one more email' },
      ];
    }
    if (wd === 5) { // Sat
      return [
        { until:540,  at:null, act:'sleeping in (until 9, max)' },
        { until:660,  at:'market_aisle', act:'weekly grocery run' },
        { until:780,  at: rain ? 'cafe_table_a' : 'waterfront_c', act: rain ? 'rainy-day reading' : 'a jog along the river' },
        { until:9999, at:null, act:'meal prep and a movie' },
      ];
    }
    return [
      { until:600,  at:null, act:'lazy Sunday morning' },
      { until:720,  at:'cafe_table_a', act:'Sunday coffee, no laptop (a rule)' },
      { until:840,  at:'mainstreet', act:'wandering Main Street' },
      { until:9999, at:null, act:'calls with family' },
    ];
  },
  lena(s) {
    const rain = s.weather.today === 'rain';
    return [
      { until:570,  at:null, act:'asleep — was up until 3 analyzing data' },
      { until:780,  at:'cafe_table_c', act:'laptop, headphones, third coffee' },
      { until:840,  at:'bakery_front', act:'emergency pastry' },
      { until:960,  at:null, act:'at the lab' },
      { until:1080, at: rain ? 'cafe_table_c' : 'waterfront_b', act: rain ? 'rain-watching from the café' : 'thinking walk by the river' },
      { until:1320, at:null, act:'back at the lab. again.' },
      { until:1440, at: rain ? null : 'waterfront_b', act: rain ? 'home for once' : 'late-night river air' },
      { until:9999, at:null, act:'definitely not still working' },
    ];
  },
  nico(s) {
    const wd = s.time.weekdayIndex;
    if (wd <= 4) {
      const fri = wd === 4;
      return [
        { until:395,  at:null, act:'up early for the restaurant' },
        { until:450,  at:'bakery_front', act:'picking up bread for Bellini\'s' },
        { until:480,  at:'tram', act:'hauling bread to Queens' },
        { until:1260, at:'bellinis_host', act:'running Bellini\'s in Astoria' },
        fri ? { until:1400, at:'cafe_table_b', act:'Friday night decompress' }
            : { until:9999, at:null, act:'closing up, family dinner' },
        { until:9999, at:null, act:'late night at home' },
      ];
    }
    if (wd === 5) {
      return [
        { until:600,  at:null, act:'rare slow morning' },
        { until:720,  at:'market_aisle', act:'arguing amiably with the market guy' },
        { until:840,  at:'waterfront_b', act:'calls with his cousins' },
        { until:9999, at:'bellinis_host', act:'dinner rush at Bellini\'s' },
      ];
    }
    return [
      { until:900,  at:null, act:'Sunday = family day in Queens' },
      { until:1080, at:'waterfront_c', act:'evening walk, sauce stains optional' },
      { until:9999, at:null, act:'meal prepping for the week' },
    ];
  },
  grace(s) {
    const wd = s.time.weekdayIndex;
    const rain = s.weather.today === 'rain';
    if (wd === 6) { // Sunday: bakery closed
      return [
        { until:540,  at:null, act:'sleeping past 5 AM for once' },
        { until:660,  at:'farm_center', act:'volunteering at the farm' },
        { until:780,  at: rain ? null : 'waterfront_a', act: rain ? 'baking at home anyway' : 'a slow river walk' },
        { until:9999, at:null, act:'prepping Monday\'s dough' },
      ];
    }
    return [
      { until:315,  at:null, act:'walking to the bakery in the dark' },
      { until:390,  at:'bakery_oven', act:'first bake — the 5:42 batch' },
      { until:780,  at:'bakery_counter', act:'morning rush at Moonrise' },
      { until:840,  at: rain ? 'bakery_front' : 'waterfront_a', act: rain ? 'break behind the counter' : 'break by the river' },
      { until:1020, at:'bakery_counter', act:'afternoon at the counter' },
      { until:9999, at:null, act:'home — bakers sleep early' },
    ];
  },
  malik(s) {
    const wd = s.time.weekdayIndex;
    const rain = s.weather.today === 'rain';
    if (rain) {
      return [
        { until:420,  at:null, act:'listening to the rain' },
        { until:600,  at:'farm_center', act:'checking drainage on the plots' },
        { until:900,  at:'bakery_front', act:'holding court at Moonrise' },
        { until:1080, at:'market_aisle', act:'chatting up the market' },
        { until:9999, at:null, act:'home with the radio on' },
      ];
    }
    return [
      { until:390,  at:null, act:'early riser, always' },
      { until:720,  at:'farm_center', act:'tending the community plots' },
      { until:780,  at: wd === 5 ? 'farm_gate' : 'mainstreet', act: wd === 5 ? 'running the weekend stall' : 'Main Street rounds' },
      { until:960,  at:'waterfront_a', act:'his bench. His river.' },
      { until:1080, at:'farm_center', act:'evening watering' },
      { until:9999, at:null, act:'home before dark' },
    ];
  },
  joan() {
    return [
      { until:420,  at:null, act:'' },
      { until:1140, at:'cafe_counter', act:'pulling shots at Juniper' },
      { until:9999, at:null, act:'' },
    ];
  },
};

/* ---------------- Dialogue pools ----------------
   Picked by best condition match. cond fields (all optional):
   minTier / maxTier (0 stranger,1 familiar,2 acquaintance,3 friend)
   weather, sceneType('cafe'...), before/after (minutes), birthday:true, pet:'cat'|'dog'|'fish'
*/
CS.TIERS = ['Stranger', 'Familiar Face', 'Acquaintance', 'Friend', 'Close Friend'];

CS.DIALOGUE = {
  maya: {
    intro: "Oh — hey. You're the one who took over the farm plot, right? Malik hasn't stopped talking about it. I'm Maya. I'd shake your hand but I've been at the hospital for thirteen hours and I can't vouch for it.",
    pools: [
      { cond:{}, lines:[
        "Coffee is a food group. I will not be taking questions.",
        "If you ever see me running, something has gone very wrong. Or the tram is leaving.",
        "The trick to this neighborhood is knowing which places open early. I'm not telling you which. Yet.",
      ]},
      { cond:{ maxTier:1 }, lines:[
        "Hey. Farm person, right? It's coming back to me.",
        "You're new-ish. You still look at the skyline when you walk. It wears off.",
      ]},
      { cond:{ minTier:2 }, lines:[
        "You know what I like about you? You don't ask me medical questions at the café.",
        "Save me something from the farm this week. I eat like a raccoon during shift blocks.",
        "Lena keeps citing studies at me. I keep telling her ER doctors ARE the study.",
      ]},
      { cond:{ minTier:3 }, lines:[
        "Honestly? Some weeks this neighborhood is the only thing that feels like mine. Don't quote me.",
        "If I ever apply for fellowship somewhere far away, talk me through it first, okay?",
      ]},
      { cond:{ weather:'rain' }, lines:[
        "Rain means quiet ER mornings and chaotic ER nights. Enjoy the quiet part.",
        "I love the rain here. Everything smells like river and wet concrete. It's oddly great.",
      ]},
      { cond:{ after:1260 }, lines:[
        "Why are we both awake right now. Don't answer that.",
      ]},
      { cond:{ birthday:true, minTier:2 }, lines:[
        "Wait — it's your birthday, isn't it? I remember things. It's the job. Happy birthday, farm person.",
      ]},
    ],
  },
  daniel: {
    intro: "Hi! Daniel. I've seen you hauling seed bags past the café — very agrarian of you. I'm in tech, which means I describe vegetables as 'deliverables' and everyone hates it. Welcome to Harbor Point.",
    pools: [
      { cond:{}, lines:[
        "My calendar has a block that says 'go outside.' This is that block.",
        "The tram is honestly the best product New York ever shipped. Zero bugs since 1976. Roughly.",
        "I rank the café's pastries in a spreadsheet. Grace's croissant is undefeated.",
      ]},
      { cond:{ maxTier:1 }, lines:[
        "Hey, farm neighbor. Still settling in?",
        "You're the community garden person! I have questions about tomatoes. For later. I'll schedule it.",
      ]},
      { cond:{ minTier:2 }, lines:[
        "Work's fine. Work is always 'fine.' That's tech for 'we'll know in Q3.'",
        "If you ever sell basil, I will personally destabilize the local basil economy.",
        "Maya says hi, by the way. Well — she said 'tell the farm person the lettuce was decent.' High praise.",
      ]},
      { cond:{ minTier:3 }, lines:[
        "Between us? There are layoff rumors going around. I'm fine. Probably. Anyway — how are the crops?",
      ]},
      { cond:{ weather:'rain' }, lines:[
        "Rain day. The office Slack is 30% weather commentary right now.",
        "I brought an umbrella big enough for three people. This is what preparedness looks like.",
      ]},
      { cond:{ birthday:true, minTier:2 }, lines:[
        "Happy birthday!! It's in my calendar. Recurring event. That's how you know I care.",
      ]},
    ],
  },
  lena: {
    intro: "Oh! Human interaction. Hi. Lena — neuroscience, PhD, year four, don't ask when I'm defending. You're the farm person? Plants are just very slow neurons. That's not true. But isn't it a great sentence?",
    pools: [
      { cond:{}, lines:[
        "I've had four coffees and I can hear colors. This is fine.",
        "The river at night is the only thing that makes my brain go quiet. Highly recommend.",
        "Fun fact: lettuce is 95% water and 5% the satisfaction of having grown it.",
      ]},
      { cond:{ maxTier:1 }, lines:[
        "You're the one with the plot by the greenhouse, right? I notice things. It's the training.",
      ]},
      { cond:{ minTier:2 }, lines:[
        "My advisor said 'promising.' I've been running on that word for nine days.",
        "Maya threatened to physically remove me from the lab at midnight. As a friend. I think.",
        "Can I put a sensor in your greenhouse someday? For science. Small sensor. Tiny.",
      ]},
      { cond:{ minTier:3 }, lines:[
        "Sometimes I worry the dissertation ends and I just... leave for a postdoc somewhere. Then I look at the river and un-worry. Mostly.",
      ]},
      { cond:{ weather:'rain' }, lines:[
        "Rain increases my productivity by 40%. Sample size: me.",
        "I was going to walk by the river but the river came to me instead. Rude.",
      ]},
      { cond:{ after:1320 }, lines:[
        "Shh. The city's asleep. This is the best version of it.",
      ]},
      { cond:{ birthday:true, minTier:2 }, lines:[
        "Birthday! Yours! Today! I remembered because I wrote it on my hand. Last week. It's still there. Happy birthday!",
      ]},
    ],
  },
  nico: {
    intro: "Hey hey — new neighbor! Nico. My family runs Bellini's over in Astoria, so if you ever grow basil, we're gonna be best friends. That's not a threat. It's a forecast.",
    pools: [
      { cond:{}, lines:[
        "You want restaurant advice? Never trust a quiet kitchen.",
        "This bread? Grace's. I take it to Queens every morning. My nonna approves, which is the highest rating that exists.",
        "Everyone's got a hustle in this city. Yours grows in dirt. I respect it.",
      ]},
      { cond:{ maxTier:1 }, lines:[
        "Farm neighbor! Still alive! The city hasn't eaten you yet. Good sign.",
      ]},
      { cond:{ minTier:2 }, lines:[
        "My dad keeps asking when I'm 'taking over officially.' I keep ordering more napkins instead. It's a system.",
        "Grow me tomatoes in the summer and I'll name a special after you. I'm serious. 'The Farmer.' It writes itself.",
      ]},
      { cond:{ minTier:3 }, lines:[
        "Between you and me? I don't know if I want the restaurant. Don't tell my nonna. Don't tell ANYBODY'S nonna.",
      ]},
      { cond:{ weather:'rain' }, lines:[
        "Rain kills the dinner walk-ins but the regulars still show. Regulars are family. Damp family.",
      ]},
      { cond:{ birthday:true, minTier:2 }, lines:[
        "It's your birthday?? Come by Bellini's sometime, birthday meal on me. House rules.",
      ]},
    ],
  },
  grace: {
    intro: "Morning, sweetheart. Grace — this is my bakery. You're the one taking over Malik's lost cause of a farm plot? Good. This neighborhood needs more people who fix things. Roll's on the house. First one only.",
    pools: [
      { cond:{}, lines:[
        "Bread doesn't keep secrets. You can taste a rushed proof. People are the same.",
        "Twenty-two years on this corner. The rent goes up, the ovens stay on.",
        "Malik will talk your ear off. Let him. He's earned it.",
      ]},
      { cond:{ maxTier:1 }, lines:[
        "Back again? The smell gets everybody. It's the cardamom.",
      ]},
      { cond:{ minTier:2 }, lines:[
        "If your strawberries come in nice, bring me some. I'll show you what a real galette looks like.",
        "You're starting to walk like a local. Slower on the corners. It's a good sign.",
      ]},
      { cond:{ minTier:3 }, lines:[
        "One day I'll need someone to take the morning bake. Not today. But I've started noticing who shows up early.",
      ]},
      { cond:{ weather:'rain' }, lines:[
        "Rain days are bread days. Nobody buys salad in the rain — they buy comfort.",
      ]},
      { cond:{ before:390 }, lines:[
        "You're up before the birds. Either something's wrong or you're one of mine now.",
      ]},
      { cond:{ birthday:true, minTier:1 }, lines:[
        "Happy birthday, sweetheart. Bakers know everyone's birthday. It's in the special orders.",
      ]},
    ],
  },
  malik: {
    intro: "There you are! Malik Johnson — I keep the community farm from falling into the river. Or I did, until you showed up. Come by the plots and I'll get you started. That soil's been waiting for somebody stubborn.",
    pools: [
      { cond:{}, lines:[
        "Thirty-one years driving trains under this city. Now I grow things on top of it. Better view.",
        "Water in the morning if you can. The plants like it, and so does the soul.",
        "That greenhouse is older than some of these buildings' rent prices. Treat her kind.",
      ]},
      { cond:{ maxTier:1 }, lines:[
        "How's the plot treating you? Soil doesn't lie — it'll tell you if you've been lazy.",
      ]},
      { cond:{ minTier:2 }, lines:[
        "Grace saves me the end-of-day loaf. Been doing it for fifteen years. That's what a neighborhood is.",
        "You keep showing up. That's the whole secret, you know. To all of it.",
      ]},
      { cond:{ minTier:3 }, lines:[
        "I've seen this island change three times over. It'll change again. What matters is who's still saying good morning when it does.",
      ]},
      { cond:{ weather:'rain' }, lines:[
        "Free watering day! Don't let anybody tell you rain is bad news on a farm.",
        "The river gets moody in the rain. I like her moody.",
      ]},
      { cond:{ birthday:true, minTier:1 }, lines:[
        "Happy birthday! I'd have grown you something but you took my farm. Ha! Come by, pick a flower.",
      ]},
    ],
  },
  joan: {
    intro: "Welcome to Juniper. First one's full price — we're not that kind of story. What can I get you?",
    pools: [
      { cond:{}, lines:[
        "The usual crowd rotates through like clockwork. You'll learn it.",
        "Oat milk? Whole? Existential? We have all three.",
      ]},
    ],
  },
};

/* ---------------- Pets ---------------- */
CS.PET_TYPES = {
  cat:  { name:'Cat',  desc:'Apartment royalty. Sleeps on everything you own.',
          personalities:['affectionate','shy','chaotic','independent','curious','lazy'],
          furs:['#c98d4a','#5a5350','#2d2a26','#e8dccb'] },
  dog:  { name:'Dog',  desc:'Walks, river runs, and instant friends everywhere.',
          personalities:['loyal','goofy','gentle','energetic'],
          furs:['#8a6242','#c9a24b','#5a5350','#e8dccb'] },
  fish: { name:'Fish', desc:'A calm little world in a tank by the window.',
          personalities:['serene'], furs:['#d98e4a'] },
};

CS.CAT_SPOTS = [ {x:9,y:1,why:'in the window, judging pigeons'}, {x:2,y:3,why:'on your bed, obviously'},
                 {x:6,y:3,why:'on the table, where cats are not allowed'}, {x:8,y:5,why:'in the pet bed you bought (a miracle)'} ];

/* ---------------- Weather (per season) ---------------- */
CS.WEATHER_TABLE = {
  0: [['sunny', .50], ['cloudy', .25], ['rain', .25]],   // spring
  1: [['sunny', .65], ['cloudy', .20], ['rain', .15]],   // summer
  2: [['sunny', .45], ['cloudy', .30], ['rain', .25]],   // fall
  3: [['sunny', .35], ['cloudy', .30], ['snow', .35]],   // winter
};

/* ---------------- Energy costs ---------------- */
CS.COSTS = { till:4, plant:1, water:1, harvest:2 };
CS.RENT = 120;
CS.START_MONEY = 400;
