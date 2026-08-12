/* =========================================================================
   Concrete Seasons — data.js
   All static, data-driven content: maps, crops, items, NPCs, schedules,
   dialogue pools, festivals-to-come. Everything offline & authored.
   ========================================================================= */
window.CS = window.CS || {};

CS.SAVE_VERSION = 1;
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
  lettuce:    { name:'Lettuce',    days:4, sell:32, seedCost:12, regrow:0 },
  radish:     { name:'Radish',     days:3, sell:22, seedCost:9,  regrow:0 },
  strawberry: { name:'Strawberry', days:8, sell:48, seedCost:34, regrow:3 },
  tulip:      { name:'Tulip',      days:5, sell:30, seedCost:11, regrow:0 },
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
  bread:      { name:'Sesame Roll',type:'food', energy:25, desc:'Moonrise Bakery. Still warm.' },
  coffee:     { name:'Coffee',     type:'food', energy:18, desc:'Juniper Café pour-over.' },
  pet_food:   { name:'Pet Food',   type:'misc', desc:'For a hungry roommate.' },
  warm_roll:  { name:'5:42 Roll',  type:'food', energy:30, desc:'Grace\'s first batch. You were there.' },
};

CS.SHOP_MARKET = [
  { item:'lettuce_seed',    price:12 },
  { item:'radish_seed',     price:9 },
  { item:'strawberry_seed', price:34 },
  { item:'tulip_seed',      price:11 },
  { item:'pet_food',        price:10 },
  { item:'bread',           price:6 },
];

/* ---------------- Maps ----------------
   Tiles: . grass  - path  ~ water  T tree  F fence  # wall  s soil  g soil(greenhouse)
          P tram platform  h bench  X ship bin  N noticeboard  o planter
          A/C/B/M/G door tiles (apartment/cafe/bakery/market/greenhouse)  E interior exit
          K kitchen  b bed  t table  W window  = shelf  O oven  d display  U counter  q aquarium spot
*/
CS.WALKABLE = new Set(['.', '-', 's', 'g', 'P', 'A', 'C', 'B', 'M', 'G', 'E']);

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

function buildOutdoor() {
  const W = 40, H = 30;
  const g = _grid(W, H, '.');
  // border trees
  for (let x = 0; x < W; x++) g[0][x] = 'T';
  for (let y = 0; y < 25; y++) { g[y][0] = 'T'; g[y][W - 1] = 'T'; }
  // water south
  _rect(g, 0, 25, W, 5, '~');
  // apartment building
  _rect(g, 3, 2, 8, 5, '#');
  g[6][6] = 'A';
  // path from apartment to main street
  for (let y = 7; y <= 13; y++) g[y][6] = '-';
  // tram platform
  _rect(g, 2, 12, 4, 2, 'P');
  // farm fence + interior
  _rect(g, 22, 2, 17, 10, '.');
  for (let x = 22; x <= 38; x++) { g[2][x] = 'F'; g[11][x] = 'F'; }
  for (let y = 2; y <= 11; y++) { g[y][22] = 'F'; g[y][38] = 'F'; }
  g[11][28] = '.'; g[11][29] = '.'; // gate
  _rect(g, 31, 3, 6, 4, '#');      // greenhouse
  g[6][33] = 'G';
  _rect(g, 23, 5, 6, 4, 's');      // 24 soil plots
  g[10][23] = 'X';                 // shipping bin
  g[10][30] = 'N';                 // noticeboard
  // main street
  _rect(g, 1, 14, 38, 2, '-');
  // planters along street
  [3, 13, 22, 33].forEach(x => { g[16][x] = 'o'; });
  // shops south of street
  _rect(g, 4, 17, 8, 4, '#');  g[17][7]  = 'C'; // Juniper Café
  _rect(g, 14, 17, 7, 4, '#'); g[17][17] = 'B'; // Moonrise Bakery
  _rect(g, 23, 17, 8, 4, '#'); g[17][26] = 'M'; // Corner Market
  // waterfront promenade
  _rect(g, 1, 22, 38, 2, '-');
  [10, 20, 28].forEach(x => { g[23][x] = 'h'; });
  // scattered trees
  [[14,4],[17,8],[12,10],[19,7],[34,13],[2,9]].forEach(([x,y]) => { if (g[y][x] === '.') g[y][x] = 'T'; });
  // connect gate & street with a faint path
  for (let y = 12; y <= 13; y++) { g[y][28] = '-'; g[y][29] = '-'; }
  return g;
}

CS.MAPS = {
  outdoor: {
    name: 'Harbor Point',
    outdoor: true,
    grid: buildOutdoor(),
    labels: [
      { x:3,  y:1,  text:'Harbor Studios' },
      { x:24, y:1,  text:'Community Farm' },
      { x:31, y:2.4,  text:'Greenhouse' },
      { x:2,  y:11, text:'Tram' },
      { x:4.5,y:18.4, text:'Juniper Café' },
      { x:14, y:18.4, text:'Moonrise' },
      { x:23.5,y:18.4, text:'Corner Market' },
      { x:16, y:24.5, text:'East River' },
    ],
    doors: { A:'apartment', C:'cafe', B:'bakery', M:'market', G:'greenhouse' },
    doorSpawns: { A:[6,7], C:[7,16], B:[17,16], M:[26,16], G:[33,7] },
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
};
// interior spawn points (stepping through an outdoor door lands here)
CS.INTERIOR_SPAWNS = { apartment:[5,6], cafe:[6,6], bakery:[4,5], market:[5,5], greenhouse:[4,4] };

/* ---------------- Named spots for NPC schedules ---------------- */
CS.SPOTS = {
  tram:            { scene:'outdoor', x:3,  y:12 },
  mainstreet:      { scene:'outdoor', x:18, y:14 },
  farm_center:     { scene:'outdoor', x:26, y:4 },
  farm_gate:       { scene:'outdoor', x:28, y:12 },
  waterfront_a:    { scene:'outdoor', x:11, y:22 },
  waterfront_b:    { scene:'outdoor', x:27, y:22 },
  waterfront_c:    { scene:'outdoor', x:19, y:22 },
  cafe_table_a:    { scene:'cafe', x:2,  y:4 },
  cafe_table_b:    { scene:'cafe', x:7,  y:4 },
  cafe_table_c:    { scene:'cafe', x:11, y:4 },
  cafe_counter:    { scene:'cafe', x:5,  y:2 },
  bakery_counter:  { scene:'bakery', x:6, y:2 },
  bakery_oven:     { scene:'bakery', x:3, y:2 },
  bakery_front:    { scene:'bakery', x:5, y:4 },
  market_counter:  { scene:'market', x:2, y:2 },
  market_aisle:    { scene:'market', x:8, y:4 },
};

/* ---------------- NPCs ---------------- */
/* Each NPC carries its drawn look: skin/hair colors + hairstyle for the
   vector character renderer (see art.js). No image assets needed. */
CS.NPCS = {
  maya: {
    name:'Maya Chen', color:'#c74f6d',
    look:{ skin:'#e8b98a', hair:'#26221e', style:'long', outfit:'#c74f6d' },
    bio:'Emergency medicine resident. Dry humor, always slightly under-slept.',
  },
  daniel: {
    name:'Daniel Park', color:'#4a6fa5',
    look:{ skin:'#e8b98a', hair:'#1f1c19', style:'short', outfit:'#4a6fa5' },
    bio:'Product manager at a healthcare-tech startup. Structured. Funny about it.',
  },
  lena: {
    name:'Lena Hoffman', color:'#7d5ba6',
    look:{ skin:'#f6d7b8', hair:'#a0632a', style:'bun', outfit:'#7d5ba6' },
    bio:'Neuroscience PhD student. Intense, curious, keeps strange hours.',
  },
  nico: {
    name:'Nico Russo', color:'#b0653a',
    look:{ skin:'#e0aa78', hair:'#3a2c1e', style:'curly', outfit:'#b0653a' },
    bio:'Manages his family\'s restaurant in Queens. Warm, social, impulsive.',
  },
  grace: {
    name:'Grace Okafor', color:'#b07a2a',
    look:{ skin:'#8d5a33', hair:'#b3542e', style:'wrap', outfit:'#b07a2a' },
    bio:'Owns Moonrise Bakery. The neighborhood runs on her ovens.',
  },
  malik: {
    name:'Malik Johnson', color:'#5c8a6f',
    look:{ skin:'#8d5a33', hair:'#3f4f3a', style:'cap', outfit:'#5c8a6f' },
    bio:'Retired transit worker. Coordinates the community farm. Knows everyone.',
  },
  joan: {
    name:'Joan', color:'#8a7361',
    look:{ skin:'#f6d7b8', hair:'#8a8a8a', style:'short', outfit:'#8a7361' },
    bio:'Juniper Café barista.', decorative:true,
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
        { until:1260, at:null, act:'running Bellini\'s in Astoria' },
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
        { until:9999, at:null, act:'dinner rush at Bellini\'s' },
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

/* ---------------- Weather ---------------- */
CS.WEATHER_TABLE = { 0:[['sunny',.55],['cloudy',.25],['rain',.20]] }; // spring; other seasons later

/* ---------------- Energy costs ---------------- */
CS.COSTS = { till:4, plant:1, water:1, harvest:2 };
CS.RENT = 120;
CS.START_MONEY = 400;
