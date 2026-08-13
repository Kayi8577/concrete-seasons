/* =========================================================================
   Concrete Seasons — data/economy.js
   Crops, items, shops, thrift & flea stock, recipes, farm upgrades.
   ========================================================================= */
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

/* ---------------- ring ---------------- */
CS.ITEMS.ring = { name:'Gold Band', type:'misc', desc:'A quiet little forever, in a box.' };
CS.SHOP_MARKET.push({ item:'ring', price:280 });

/* ---------------- farm upgrades ---------------- */
CS.FARM_UPGRADES = {
  irrigation: { name:'Drip irrigation', cost:800,
    desc:'Outdoor plots water themselves every morning. Your wrists send thanks.' },
  compost:    { name:'Compost bin', cost:400,
    desc:'Rich soil: crops sometimes grow two days in one.' },
  hydro:      { name:'Hydroponic racks', cost:1500, needs:'irrigation',
    desc:'Eight more greenhouse beds, self-watering, season-proof. The future smells like basil.' },
};

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
