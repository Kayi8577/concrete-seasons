/* =========================================================================
   Concrete Seasons — data/npcs.js
   Every resident: definitions, looks, gift tastes. Pets. Chemistry pairs.
   ========================================================================= */
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
    loved:['basil','tomato'], liked:['meal_pasta','enamel_pot','fish_bass','fish_porgy'],
  },
  grace: {
    name:'Grace Okafor', color:'#b07a2a', gender:'F', rom:[],
    look:{ skin:'#8d5a33', hair:'#b3542e', style:'wrap', outfit:'#b07a2a' },
    bio:'Owns Moonrise Bakery. The neighborhood runs on her ovens.',
    loved:['strawberry','honey'], liked:['tulip','meal_galette'],
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

/* ---------------- NPC definitions ---------------- */
Object.assign(CS.NPCS, {
  sofia: {
    name:'Sofia Martinez', color:'#e0704f', gender:'F', rom:['M'],
    look:{ skin:'#c68a52', hair:'#26221e', style:'long', outfit:'#e0704f' },
    bio:'Public-school social worker. Lives with family. Knows everyone\'s cousin.',
    loved:['tulip'], liked:['bread','meal_salad'],
  },
  gabriel: {
    name:'Gabriel Rivera', color:'#3f6e56', gender:'M', rom:['F'],
    look:{ skin:'#c68a52', hair:'#1f1c19', style:'short', outfit:'#3f6e56' },
    bio:'Paramedic. Jokes his way through twelve-hour shifts.',
    loved:['meal_pasta'], liked:['coffee','bread'],
  },
  theo: {
    name:'Theo Bennett', color:'#4d4a5e', gender:'M', rom:['F'],
    look:{ skin:'#5d3a20', hair:'#141210', style:'curly', outfit:'#4d4a5e' },
    bio:'Documentary photographer. Calm, observant, allergic to five-year plans.',
    loved:['film_camera','vinyl_record'], liked:['coffee'],
  },
  avery: {
    name:'Avery Morgan', color:'#c2589e', gender:'NB', rom:['F','M'],
    look:{ skin:'#f6d7b8', hair:'#3aa6a0', style:'short', outfit:'#c2589e' },
    bio:'Freelance designer, bartender at The Anchor. Funny, independent, tired.',
    loved:['sunflower'], liked:['coffee','old_poster'],
  },
  naomi: {
    name:'Naomi Brooks', color:'#2f3f5c', gender:'F', rom:['M','F'],
    look:{ skin:'#5d3a20', hair:'#141210', style:'bun', outfit:'#2f3f5c' },
    bio:'Corporate attorney. Polished, generous, running on fumes.',
    loved:['meal_galette'], liked:['coffee','tulip'],
  },
  arjun: {
    name:'Arjun Mehta', color:'#5b8aa6', gender:'M', rom:['F'],
    look:{ skin:'#a06a3b', hair:'#1f1c19', style:'short', outfit:'#5b8aa6' },
    bio:'Machine-learning engineer at Pier Labs. Quiet, thoughtful, far from home.',
    loved:['meal_pasta'], liked:['cucumber','paperback'],
  },
  priya: {
    name:'Priya Nair', color:'#9c4f2e', gender:'F', rom:['M'],
    look:{ skin:'#a06a3b', hair:'#26221e', style:'long', outfit:'#9c4f2e' },
    bio:'Urban-planning analyst on the Harbor Point redevelopment. Practical, direct.',
    loved:['cucumber'], liked:['bread','planter_box'],
  },
  jordan: {
    name:'Jordan Ellis', color:'#6e5a2e', gender:'M', rom:['F'],
    look:{ skin:'#5d3a20', hair:'#141210', style:'short', outfit:'#6e5a2e' },
    bio:'Union infrastructure worker. Reliable in person, unreachable by text.',
    loved:['bread'], liked:['radish','enamel_pot'],
  },
  mei_lin: {
    name:'Mei-Lin Zhou', color:'#8a3b4a', gender:'F', rom:['M','F'],
    look:{ skin:'#f0c795', hair:'#1a1714', style:'long', outfit:'#8a3b4a' },
    bio:'Museum exhibition producer. Stylish, observant, careful with her heart.',
    loved:['film_camera','ceramic_vase'], liked:['strawberry'],
  },
  mateo: {
    name:'Mateo Alvarez', color:'#48653a', gender:'M', rom:['M','F'],
    look:{ skin:'#c68a52', hair:'#26221e', style:'curly', outfit:'#48653a' },
    bio:'Public defender. Takes care of everyone except himself.',
    loved:['coffee'], liked:['bread','meal_roast'],
  },
});

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

/* NPC↔NPC chemistry pairs: [a, b, compatibility 0..1] */
CS.NPC_PAIRS = [
  ['maya', 'lena', .9], ['maya', 'daniel', .5], ['sofia', 'gabriel', .95],
  ['theo', 'avery', .7], ['theo', 'naomi', .5], ['avery', 'nico', .6],
  ['arjun', 'priya', .9], ['mei_lin', 'naomi', .7], ['mei_lin', 'jordan', .6],
];

CS.NPCS.claire = {
  name:'Claire Fontaine', color:'#37535e', gender:'F', rom:[],
  look:{ skin:'#f6d7b8', hair:'#c9a24b', style:'long', outfit:'#37535e' },
  bio:'Opened Glasshouse Coffee with a loan, a dream, and very good taste.', decorative:true,
};

/* ---------------- Ava & Nia ---------------- */
Object.assign(CS.NPCS, {
  ava: {
    name:'Ava Coleman', color:'#c98a3c', gender:'F', rom:[],
    look:{ skin:'#5d3a20', hair:'#141210', style:'curly', outfit:'#c98a3c' },
    bio:'Sixteen. Volunteers at Harbor House, plans three futures at once.',
    loved:['strawberry'], liked:['bread'],
  },
  nia: {
    name:'Nia Coleman', color:'#5b8aa6', gender:'F', rom:[],
    look:{ skin:'#5d3a20', hair:'#141210', style:'bun', outfit:'#5b8aa6' },
    bio:"Twelve. Ava's little sister. Knows every cat on the island by name.",
    loved:['strawberry'], liked:['tulip'],
  },
});

// each def knows its own id (portrait sprites & lookups need it)
for (const k in CS.NPCS) CS.NPCS[k].id = k;
