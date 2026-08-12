/* =========================================================================
   Concrete Seasons — data2.js (Phase 2 content)
   The remaining ten major NPCs: definitions, schedules, dialogue.
   Plus phone-message pools and festival dialogue. Merged into CS.* after
   data.js loads. All authored, all offline.
   ========================================================================= */
(function () {

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

/* ---------------- Schedules ---------------- */
Object.assign(CS.SCHEDULES, {
  sofia(s) {
    const wd = s.time.weekdayIndex, rain = s.weather.today === 'rain';
    if (wd <= 4) return [
      { until:480,  at:null, act:'breakfast chaos with the family' },
      { until:540,  at:'tram', act:'commuting to school' },
      { until:950,  at:null, act:'at school — someone always needs her' },
      { until:1140, at:'hh_a', act:'running the after-school program at Harbor House' },
      { until:1230, at: rain ? 'cafe_table_a' : 'waterfront_b', act:'finally, a breath' },
      { until:9999, at:null, act:'family dinner. Non-negotiable.' },
    ];
    if (wd === 5) return [
      { until:540,  at:null, act:'sleeping past seven, a miracle' },
      { until:660,  at:'market_aisle', act:'shopping for the whole household' },
      { until:780,  at:'mainstreet', act:'greeting approximately everyone' },
      { until:900,  at:'waterfront_b', act:'river time' },
      { until:9999, at:null, act:'cousins visiting' },
    ];
    return [
      { until:780,  at:null, act:'church, then the long family lunch' },
      { until:900,  at:'waterfront_c', act:'Sunday stroll' },
      { until:9999, at:null, act:'prepping for the week' },
    ];
  },
  gabriel(s) {
    const wd = s.time.weekdayIndex, rain = s.weather.today === 'rain';
    if (wd === 1 || wd === 3 || wd === 5) return [
      { until:9999, at:null, act:'on a 12-hour ambulance shift' },
    ];
    return [
      { until:390,  at:null, act:'sleeping off the last shift' },
      { until:480,  at: rain ? null : 'waterfront_a', act: rain ? 'skipping the jog, no shame' : 'morning jog by the river' },
      { until:540,  at:'bakery_front', act:'post-run reward at Moonrise' },
      { until:720,  at:null, act:'errands and a nap, in that order' },
      { until:900,  at:'lighthouse_park', act:'doing absolutely nothing, expertly' },
      { until:1080, at:'mainstreet', act:'orbiting Main Street' },
      { until:1260, at:'bar_seat_a', act:'holding court at The Anchor' },
      { until:9999, at:null, act:'early night before the next shift' },
    ];
  },
  theo(s) {
    const wd = s.time.weekdayIndex, rain = s.weather.today === 'rain';
    return [
      { until:360,  at:null, act:'asleep with a camera on the nightstand' },
      { until:540,  at:'waterfront_c', act: rain ? 'shooting the rain — best light there is' : 'shooting the morning light' },
      { until:720,  at:'mainstreet', act:'documenting the neighborhood, quietly' },
      { until:780,  at:'cafe_table_b', act:'coffee and contact sheets' },
      { until:960,  at:'lighthouse_park', act:'waiting for the right moment' },
      { until:1080, at:null, act:'developing film at home' },
      (wd === 4 || wd === 5)
        ? { until:1380, at:'bar_table', act:'listening more than talking' }
        : { until:1320, at:'waterfront_a', act:'night frames by the river' },
      { until:9999, at:null, act:'archiving the day' },
    ];
  },
  avery(s) {
    const wd = s.time.weekdayIndex;
    const barNight = wd >= 2 && wd <= 5;
    return [
      { until:600,  at:null, act:'sleeping — bartenders earn their mornings' },
      { until:780,  at:'cafe_table_a', act:'freelance design sprint, headphones on' },
      { until:900,  at:'mainstreet', act:'sketchbook walk' },
      { until:1020, at:null, act:'client calls (ugh)' },
      barNight
        ? { until:1440, at:'bar_work', act:'behind the bar at The Anchor' }
        : { until:1380, at:'waterfront_b', act:'late-night river thoughts' },
      { until:9999, at:null, act:'decompressing with bad TV' },
    ];
  },
  naomi(s) {
    const wd = s.time.weekdayIndex;
    if (wd <= 4) return [
      { until:390,  at:null, act:'reviewing documents before sunrise' },
      { until:420,  at:'tram', act:'first-wave commute, immaculate' },
      { until:1260, at:null, act:'billable hours. So many billable hours.' },
      { until:1380, at:'bar_seat_b', act:'one drink, then sleep' },
      { until:9999, at:null, act:'asleep by midnight, allegedly' },
    ];
    if (wd === 5) return [
      { until:600,  at:null, act:'the week finally lets go' },
      { until:720,  at:'cafe_table_b', act:'brunch alone, blissfully' },
      { until:840,  at:'thrift_browse', act:'quality control at Second Life' },
      { until:960,  at:'waterfront_c', act:'walking off the week' },
      { until:9999, at:null, act:'dinner reservations in Manhattan' },
    ];
    return [
      { until:660,  at:null, act:'"not working" (working)' },
      { until:780,  at:'lighthouse_park', act:'pretending to read, actually resting' },
      { until:9999, at:null, act:'Sunday scaries, managed professionally' },
    ];
  },
  arjun(s) {
    const wd = s.time.weekdayIndex, rain = s.weather.today === 'rain';
    if (wd <= 4) return [
      { until:510,  at:null, act:'call home — it\'s evening in Mumbai' },
      { until:540,  at:'tram', act:'heading to the lab' },
      { until:720,  at:'lab_a', act:'training runs at Pier Labs' },
      { until:780,  at:'mainstreet', act:'lunchtime walk, always the same loop' },
      { until:1140, at:'lab_a', act:'debugging something that worked yesterday' },
      { until:1260, at: rain ? null : 'waterfront_c', act: rain ? 'staying in with a book' : 'evening walk by the water' },
      { until:9999, at:null, act:'cooking dinner for one, well' },
    ];
    if (wd === 5) return [
      { until:600,  at:null, act:'the long sleep' },
      { until:780,  at:'lighthouse_park', act:'bowling practice against the lighthouse wall' },
      { until:900,  at:'market_aisle', act:'weekly provisions' },
      { until:9999, at:null, act:'video calls with college friends, three time zones' },
    ];
    return [
      { until:720,  at:null, act:'slow Sunday morning' },
      { until:900,  at:'lab_b', act:'weekend deploy. Don\'t ask.' },
      { until:9999, at:null, act:'meal prep and cricket highlights' },
    ];
  },
  priya(s) {
    const wd = s.time.weekdayIndex;
    if (wd <= 4) return [
      { until:480,  at:null, act:'reading planning briefs over chai' },
      { until:720,  at:'hh_b', act:'redevelopment office hours at Harbor House' },
      { until:780,  at:'bakery_front', act:'strategic pastry acquisition' },
      { until:1080, at:'lab_b', act:'zoning models at the coworking desks' },
      { until:1200, at:'mainstreet', act:'counting storefronts — it\'s a planner thing' },
      { until:9999, at:null, act:'annotating maps at home' },
    ];
    if (wd === 5) return [
      { until:660,  at:null, act:'sleeping in, planner-style (8 AM)' },
      { until:780,  at:'farm_gate', act:'sketching the farm — it\'s in the plan' },
      { until:960,  at:'mainstreet', act:'observing how people actually use the street' },
      { until:9999, at:null, act:'calling her mother, being lectured lovingly' },
    ];
    return [
      { until:780,  at:null, act:'long breakfast, longer newspaper' },
      { until:900,  at:'waterfront_b', act:'Sunday constitutional' },
      { until:9999, at:null, act:'week planning. Color-coded.' },
    ];
  },
  jordan(s) {
    const wd = s.time.weekdayIndex;
    if (wd <= 4) return [
      { until:330,  at:null, act:'asleep — site call is at 6' },
      { until:360,  at:'tram', act:'first train to the site' },
      { until:990,  at:null, act:'on the job — water mains this week' },
      { until:1110, at:'waterfront_a', act:'decompressing, phone on silent (always)' },
      wd === 4
        ? { until:1320, at:'bar_seat_a', act:'Friday beer with the crew' }
        : { until:9999, at:null, act:'asleep by nine, no apologies' },
      { until:9999, at:null, act:'out cold' },
    ];
    if (wd === 5) return [
      { until:600,  at:null, act:'body refuses to sleep in' },
      { until:780,  at:'mainstreet', act:'errands, done efficiently' },
      { until:900,  at:'lighthouse_park', act:'sizing up the lighthouse masonry, professionally' },
      { until:9999, at:null, act:'browsing property listings he can almost afford' },
    ];
    return [
      { until:660,  at:null, act:'quiet morning' },
      { until:780,  at:'bakery_front', act:'Sunday roll, same order for six years' },
      { until:9999, at:null, act:'dinner at his mother\'s' },
    ];
  },
  mei_lin(s) {
    const wd = s.time.weekdayIndex;
    if (wd <= 4) return [
      { until:540,  at:null, act:'a considered breakfast' },
      { until:570,  at:'tram', act:'off to the museum' },
      { until:1140, at:null, act:'installing an exhibition in Manhattan' },
      (wd === 1 || wd === 4)
        ? { until:1260, at:'thrift_browse', act:'hunting for objects with a past' }
        : { until:1260, at:'waterfront_b', act:'evening walk, unhurried' },
      { until:9999, at:null, act:'tea and a film at home' },
    ];
    if (wd === 5) return [
      { until:660,  at:null, act:'slow start, good robe' },
      { until:840,  at:'thrift_browse', act:'the serious Second Life session' },
      { until:960,  at:'lighthouse_park', act:'reading under the cherry trees' },
      { until:1320, at:'bar_table', act:'a proper drink with Naomi' },
      { until:9999, at:null, act:'home before it gets sloppy' },
    ];
    return [
      { until:720,  at:null, act:'calls with her grandmother, in Shanghainese' },
      { until:900,  at:'cafe_table_b', act:'Sunday coffee and a novel' },
      { until:9999, at:null, act:'quiet evening in' },
    ];
  },
  mateo(s) {
    const wd = s.time.weekdayIndex;
    if (wd <= 4) return [
      { until:420,  at:null, act:'case files with cold coffee' },
      { until:450,  at:'tram', act:'heading to arraignments' },
      { until:1200, at:null, act:'court, then jail visits, then court again' },
      { until:1320, at:'bar_seat_b', act:'decompressing badly at The Anchor' },
      { until:9999, at:null, act:'falling asleep mid-brief' },
    ];
    if (wd === 5) return [
      { until:720,  at:null, act:'the sleep of the righteous and exhausted' },
      { until:840,  at:'bakery_front', act:'apologizing to Grace for missing Tuesday' },
      { until:1020, at:'waterfront_c', act:'long walk, phone off (aspirationally)' },
      { until:9999, at:null, act:'reviewing cases. Again. He knows.' },
    ];
    return [
      { until:900,  at:null, act:'cooking for half the building' },
      { until:1020, at:'mainstreet', act:'delivering tupperware to neighbors' },
      { until:9999, at:null, act:'pretending tomorrow isn\'t Monday' },
    ];
  },
});

/* ---------------- Dialogue ---------------- */
Object.assign(CS.DIALOGUE, {
  sofia: {
    intro: "Oh, you're the farm neighbor! Sofia. I work at the school across the river, but Harbor House is my second job — don't tell them it's unpaid. If you ever want to donate vegetables to the after-school kids, I will personally canonize you.",
    pools: [
      { cond:{}, lines:[
        "My abuela says hi. She doesn't know you, but she says hi to everyone. It's a policy.",
        "Half my job is paperwork, half is people, and the third half is snacks. There are three halves. That's the job.",
        "Harbor House runs on volunteers and stubbornness. Mostly stubbornness.",
      ]},
      { cond:{ maxTier:1 }, lines:[
        "Farm neighbor! You're becoming a familiar face. That's how it starts here.",
      ]},
      { cond:{ minTier:2 }, lines:[
        "Gabriel keeps saying he'll fix the Harbor House sink. He's said that for two years. He's family, so he gets three.",
        "The kids asked if the farm person is 'the vegetable wizard.' I said yes. You're welcome.",
      ]},
      { cond:{ minTier:3 }, lines:[
        "Sometimes I think about getting my own place. Then Sunday dinner happens and I forget why I wanted one.",
      ]},
      { cond:{ weather:'rain' }, lines:[
        "Rainy days mean indoor recess. Pray for me.",
      ]},
      { cond:{ birthday:true, minTier:2 }, lines:[
        "It's your birthday!! I know because I know everything. Happy birthday!",
      ]},
      { cond:{ seeing:true }, lines:[
        "My family already asked when you're coming to dinner. I stalled them a week. One week.",
      ]},
    ],
  },
  gabriel: {
    intro: "Hey! Gabriel — I'm the guy in the ambulance, but off-duty, promise. You're the one bringing that farm back? Good. This island needs more things that grow and fewer things that beep.",
    pools: [
      { cond:{}, lines:[
        "Twelve hours on, and people ask why I nap in public. Let a man nap.",
        "Best part of the job? Nobody's ever bored to see you arrive. Worst part? Same thing.",
        "Sofia and I go way back. Our families share a group chat. It's chaos in two languages.",
      ]},
      { cond:{ maxTier:1 }, lines:[
        "Farm neighbor! Still upright! In my line of work that's a compliment.",
      ]},
      { cond:{ minTier:2 }, lines:[
        "You want to know the neighborhood? Ride along with a paramedic. Or just keep farming — same knowledge, less sirens.",
        "I joke a lot. It's load-bearing. Don't look under it.",
      ]},
      { cond:{ minTier:3 }, lines:[
        "Some calls stay with you. That's all I'll say. That's why the jokes, you know?",
      ]},
      { cond:{ weather:'rain' }, lines:[
        "Rain means fender benders. Drive slow, walk fast, and don't make me come get you.",
      ]},
      { cond:{ birthday:true, minTier:2 }, lines:[
        "Happy birthday! Pro tip from a paramedic: celebrate hard, hydrate harder.",
      ]},
      { cond:{ seeing:true }, lines:[
        "I told the crew about you. Now they want to meet you, which — I apologize in advance.",
      ]},
    ],
  },
  theo: {
    intro: "Hm? Oh — sorry, I was watching the light on the water. Theo. I photograph the neighborhood. You're new, which means you still move like the city's watching you. It's a good look. It won't last.",
    pools: [
      { cond:{}, lines:[
        "Every block has a rhythm. Yours is farm, market, bakery. See? I notice.",
        "I've shot this waterfront a thousand times. It's never the same river twice.",
        "My building's rent-stabilized. My whole life plan is 'don't mess that up.'",
      ]},
      { cond:{ maxTier:1 }, lines:[
        "The farm's looking better. The light hits those rows differently now. That's you.",
      ]},
      { cond:{ minTier:2 }, lines:[
        "Avery says I photograph people the way other people gossip. Kinder, I hope.",
        "I don't plan far ahead. Naomi calls it a flaw. I call it availability.",
      ]},
      { cond:{ minTier:3 }, lines:[
        "I've got twenty years of this neighborhood in negatives. Someday it'll matter to someone. Maybe you.",
      ]},
      { cond:{ weather:'rain' }, lines:[
        "Rain is the best light there is. Everyone leaves, the streets go soft, and the city finally holds still.",
      ]},
      { cond:{ birthday:true, minTier:2 }, lines:[
        "Your birthday? Stand there — no, just like that. There. That's your year, saved.",
      ]},
      { cond:{ seeing:true }, lines:[
        "I keep catching myself framing shots with you in them. Occupational hazard. The good kind.",
      ]},
    ],
  },
  avery: {
    intro: "Hey, new blood! Avery — designer by day, bartender by night, tired always. You run the farm now? Excellent. I have opinions about your market stall's typography. Free of charge. The first one, anyway.",
    pools: [
      { cond:{}, lines:[
        "Freelance means freedom, and freedom means invoicing people who 'forgot.'",
        "The Anchor's jukebox has three good songs. Guarding that knowledge is my real job.",
        "I redesigned my rate card again. The rates went up. The clients went quiet. Balance.",
      ]},
      { cond:{ maxTier:1 }, lines:[
        "Farm person! You're on my mental map of the neighborhood now. It's a well-designed map.",
      ]},
      { cond:{ minTier:2 }, lines:[
        "AI ate half my client list this year, so I pull more bar shifts. The bar doesn't hallucinate. Usually.",
        "Nico keeps trying to pay me in pasta. Honestly? It's working.",
      ]},
      { cond:{ minTier:3 }, lines:[
        "Between shifts and clients I forget which me is the real one. The one talking to you right now feels close, though.",
      ]},
      { cond:{ weather:'rain' }, lines:[
        "Rain nights at the bar are the best nights. Everyone's honest when they're damp.",
      ]},
      { cond:{ birthday:true, minTier:2 }, lines:[
        "Birthday!! Come by The Anchor, first one's on me and I'm telling everyone.",
      ]},
      { cond:{ seeing:true }, lines:[
        "I doodled you on a napkin at work. A regular bought it. I'm never living that down and neither are you.",
      ]},
    ],
  },
  naomi: {
    intro: "You must be the one restoring the farm plot — word travels. Naomi Brooks. I'd stay and chat but I have a call in… four minutes ago. We'll do this properly another time. I keep my word. It's the job.",
    pools: [
      { cond:{}, lines:[
        "I bill in six-minute increments. This conversation is free. Enjoy the luxury.",
        "The tram at 7 AM is the only quiet room in my life.",
        "I sent my associate home at eight yesterday. Growth.",
      ]},
      { cond:{ maxTier:1 }, lines:[
        "Farm person. You're consistent. I respect consistent.",
      ]},
      { cond:{ minTier:2 }, lines:[
        "Everyone says 'take a break, Naomi.' A break from what, excellence?  ...That was a joke. Mostly.",
        "Mei-Lin drags me to that thrift shop and I pretend to hate it. I have four lamps now.",
      ]},
      { cond:{ minTier:3 }, lines:[
        "Some nights I draft my resignation letter just to feel something. Then I fix the margins and file it away. Don't repeat that.",
      ]},
      { cond:{ weather:'rain' }, lines:[
        "Rain: the one deadline extension nature grants. I'll allow it.",
      ]},
      { cond:{ birthday:true, minTier:2 }, lines:[
        "Happy birthday. I put it in my calendar with a reminder, which, from me, is a love language.",
      ]},
      { cond:{ seeing:true }, lines:[
        "I moved a deposition for you last week. I've never moved a deposition for anyone. Make of that what you will.",
      ]},
    ],
  },
  arjun: {
    intro: "Oh — hello. Arjun. I work at Pier Labs, machine learning, which sounds more glamorous than watching loss curves at midnight. You grow actual things. That's the real magic, honestly.",
    pools: [
      { cond:{}, lines:[
        "My model trained all night and learned nothing. Relatable, I think.",
        "The lunch walk is sacred. Same loop, every day. The brain needs one dependable thing.",
        "New York bagels are good. I say this quietly so Mumbai can't hear me enjoying anything.",
      ]},
      { cond:{ maxTier:1 }, lines:[
        "Farm neighbor. Your rows are very well organized. I notice these things. It's a compliment.",
      ]},
      { cond:{ minTier:2 }, lines:[
        "Priya explains zoning to me like I explain gradient descent to her. Neither of us listens. It's a good system.",
        "Visa renewals are like model training. Long, opaque, and you pretend you're calm about it.",
      ]},
      { cond:{ minTier:3 }, lines:[
        "If the sponsorship falls through, I might have to leave for a while. I try not to think about it. I think about it constantly.",
      ]},
      { cond:{ weather:'rain' }, lines:[
        "Monsoon season back home makes this rain look like a software demo. But it's trying. I respect that.",
      ]},
      { cond:{ birthday:true, minTier:2 }, lines:[
        "Happy birthday! I remembered without a calendar notification. Well. With only one calendar notification.",
      ]},
      { cond:{ seeing:true }, lines:[
        "I told my mother about you. She has forty follow-up questions. I answered twelve.",
      ]},
    ],
  },
  priya: {
    intro: "Hi — Priya Nair, city planning. You run the community farm now, which makes you a stakeholder, which means we'll be talking. Don't worry, I'm one of the good bureaucrats. The farm's on my map with a green circle around it.",
    pools: [
      { cond:{}, lines:[
        "Everyone wants more housing and nothing to change. My whole job lives inside that sentence.",
        "I walk Main Street twice a day. You learn more from foot traffic than from any report.",
        "A neighborhood isn't buildings. It took me two degrees and one Harbor Point to learn that.",
      ]},
      { cond:{ maxTier:1 }, lines:[
        "Farm person. Your stall counts as 'active street frontage,' by the way. That's high praise from me.",
      ]},
      { cond:{ minTier:2 }, lines:[
        "The redevelopment file gets thicker every month. I keep the farm's page on top. Strategically.",
        "Arjun asked me what 'mixed-use' means. I asked him what a 'transformer' is. We're even.",
      ]},
      { cond:{ minTier:3 }, lines:[
        "Some nights I wonder if I'm protecting this place or just documenting what it used to be. Keep showing up at the meetings. It matters more than you think.",
      ]},
      { cond:{ weather:'rain' }, lines:[
        "See how the water pools by the tram? Drainage. Nobody thanks the planner until their shoes are wet.",
      ]},
      { cond:{ birthday:true, minTier:2 }, lines:[
        "Happy birthday! Statistically, a great day for long-term planning. Or cake. Both are valid.",
      ]},
      { cond:{ seeing:true }, lines:[
        "I caught myself drawing our route on a map. Origin, destination, desire lines. Planner flirting. I'm sorry.",
      ]},
    ],
  },
  jordan: {
    intro: "Hey. Jordan. I do infrastructure — water, steam, the stuff under your feet that nobody thinks about till it breaks. Heard someone took the farm plot. Good. Things should get fixed.",
    pools: [
      { cond:{}, lines:[
        "This whole city runs on hundred-year-old pipes and guys like me. Sleep well.",
        "I don't text much. If I answered, it's because it mattered.",
        "Saving for a place of my own. Brick by brick. Literally, some weeks.",
      ]},
      { cond:{ maxTier:1 }, lines:[
        "Farm's looking straight. Good lines. You level your rows by eye? Respect.",
      ]},
      { cond:{ minTier:2 }, lines:[
        "Mei-Lin showed me around a museum once. Didn't expect to like it. Kept looking at the joinery, but still.",
        "The crew gives me grief for leaving Friday drinks at ten. The crew doesn't have a 5 AM site call. The crew can hush.",
      ]},
      { cond:{ minTier:3 }, lines:[
        "Everybody's building something. Mine's just slower. A place with my name on the deed. You'll see.",
      ]},
      { cond:{ weather:'rain' }, lines:[
        "Rain doubles my workload and halves my patience. But the river looks good doing it.",
      ]},
      { cond:{ birthday:true, minTier:2 }, lines:[
        "Heard it's your birthday. Happy birthday. That's the speech.",
      ]},
      { cond:{ seeing:true }, lines:[
        "I answered your text in under an hour yesterday. My sister says that means it's serious. She's not wrong.",
      ]},
    ],
  },
  mei_lin: {
    intro: "Hello — Mei-Lin. I produce exhibitions at a museum across the river, which mostly means convincing beautiful objects to survive shipping. You're the one giving the farm a second life? I like second lives. Ask the thrift shop.",
    pools: [
      { cond:{}, lines:[
        "Every object in that thrift shop had a whole life before us. I find that comforting, not sad.",
        "I can date a chair to the decade by its hinges. Useless magic, but mine.",
        "The tram at golden hour is the best gallery in New York. Free admission, too.",
      ]},
      { cond:{ maxTier:1 }, lines:[
        "The farm person. You arrange your market stall with intention. I noticed. I always notice.",
      ]},
      { cond:{ minTier:2 }, lines:[
        "Naomi pretends I drag her to Second Life against her will. She owns four lamps. I rest my case.",
        "Seven years with someone teaches you what you'll accept. The next seven are for what you actually want.",
      ]},
      { cond:{ minTier:3 }, lines:[
        "I'm careful with people. Not cold — careful. There's a difference, and most people don't wait long enough to learn it. You wait. I've noticed that too.",
      ]},
      { cond:{ weather:'rain' }, lines:[
        "Rain is good for museums and thrift shops. People come inside to touch the past.",
      ]},
      { cond:{ birthday:true, minTier:2 }, lines:[
        "Your birthday. I remembered because I catalogue what matters. Happy birthday.",
      ]},
      { cond:{ seeing:true }, lines:[
        "I found a teacup at the shop that made me think of you. I bought it. It's on my good shelf. That's… significant, for me.",
      ]},
    ],
  },
  mateo: {
    intro: "Hi — sorry, hi. Mateo. Public defender, perpetually seventeen minutes behind. You're the farm person? Good, great. The neighborhood needed a win. Sorry, I have to — actually no. No, I have five minutes. Hi. Welcome.",
    pools: [
      { cond:{}, lines:[
        "Everyone deserves a defense. That's the job. Some days it's a calling, some days it's just Tuesday at Rikers.",
        "I cooked for the whole floor of my building Sunday. It's cheaper than therapy and louder.",
        "Coffee count today: don't ask. The number has an exponent.",
      ]},
      { cond:{ maxTier:1 }, lines:[
        "Farm person! Still growing things! That's the most hopeful job on this island and I include mine.",
      ]},
      { cond:{ minTier:2 }, lines:[
        "Grace saves me a roll on Saturdays because I keep missing weekday mornings. This neighborhood carries me, honestly.",
        "I'm great at telling clients to rest. I'm told I should listen to me.",
      ]},
      { cond:{ minTier:3 }, lines:[
        "You know what scares me? Not losing cases. Getting numb to losing them. That's why I cook. Hands busy, heart quiet.",
      ]},
      { cond:{ weather:'rain' }, lines:[
        "Rain means my clients miss their court dates and the judges pretend not to know why. Long day. Good soup weather though.",
      ]},
      { cond:{ birthday:true, minTier:2 }, lines:[
        "It's your birthday and I'm not in court?? This is the best scheduling outcome of my month. Happy birthday!",
      ]},
      { cond:{ seeing:true }, lines:[
        "I cooked a two-person meal this week. On purpose. My neighbor asked who it was for and I just smiled like a lunatic.",
      ]},
    ],
  },
});

/* ---------------- Decorative city NPCs ---------------- */
Object.assign(CS.SCHEDULES, {
  rosa() {
    return [
      { until:420, at:null, act:'' },
      { until:1320, at:'bellinis_table', act:'supervising Bellini\'s from her table' },
      { until:9999, at:null, act:'' },
    ];
  },
  mrs_woo() {
    return [
      { until:540, at:null, act:'' },
      { until:1200, at:'tea_table', act:'holding court at the Jade Pavilion' },
      { until:9999, at:null, act:'' },
    ];
  },
});
Object.assign(CS.DIALOGUE, {
  rosa: {
    intro: "The old woman at the corner table looks you over exactly once. \"You're the farmer. Nico talks.\" She points at a chair. \"Sit. Eat something. You're too thin for farming.\"",
    pools: [
      { cond:{}, lines:[
        "\"Fifty-one years, this restaurant. The stove knows more than any of us.\"",
        "\"Nico thinks I don't see him worrying. I saw his father do the same worrying. Eat.\"",
        "\"You grow the basil? Good. Store basil is an insult to the tomato.\"",
      ]},
    ],
  },
  mrs_woo: {
    intro: "\"Sit anywhere,\" the owner says, already pouring you tea you didn't order. \"First visit, first pot. After that you pay like everyone.\" She smiles like it's a dare.",
    pools: [
      { cond:{}, lines:[
        "\"Mei-Lin sends people here when she likes them. Or when they look tired. Sometimes both.\"",
        "\"Forty years on Mott Street. The street changes, the tea doesn't.\"",
        "\"New Year is coming, or it just left. On this street those are the only two seasons.\"",
      ]},
    ],
  },
});

/* ---------------- Festival dialogue (any NPC, picked during festivals) ---------------- */
CS.FESTIVAL_LINES = {
  cherry: [
    "Look at this lawn. The whole neighborhood on one blanket. This is the good stuff.",
    "The petals last a week, tops. That's the point, I think.",
    "Someone brought a speaker, someone brought a grandmother, and it's not clear who's in charge. Perfect.",
  ],
  night_market: [
    "Main Street after dark like this? The city shows off sometimes.",
    "Everything tastes better from a stall under string lights. That's just science.",
    "Half the island's here. The other half is on their way.",
  ],
  harbor_lights: [
    "They say the fireworks are for the harbor's anniversary. Nobody checks. Nobody cares. Look up.",
    "Best view in the city and it's free. Don't tell Manhattan.",
    "Every year I say I won't gasp at the finale. Every year.",
  ],
  street_food: [
    "I've had four lunches. It's a festival. The rules are different.",
    "Follow the smoke. The smoke knows.",
  ],
  holiday_market: [
    "Hot cider in one hand, regret about not wearing gloves in the other. Tradition.",
    "The string lights make everyone look like their best photo.",
  ],
  lunar_new_year: [
    "The lion dance scared three toddlers and delighted forty. Net win.",
    "Mrs. Woo's tea line is around the block. She's thrilled and pretending not to be.",
    "Red everywhere, drums in your chest, oranges in every hand. Best day on Mott Street.",
  ],
};

/* ---------------- Date / hangout lines ---------------- */
CS.DATE_LINES = {
  generic: [
    "Time does that thing where it goes too fast because you're not watching it.",
    "The conversation wanders somewhere neither of you planned, and stays there a while. The good kind of lost.",
    "You catch yourself memorizing this — the light, the noise, the company.",
  ],
  cafe_table_b: ["Two drinks, one table, and Joan pretending not to eavesdrop. The neighborhood's smallest stage."],
  bar_table: ["The Anchor hums around you. Avery slides over water you didn't order with a look that says 'hydrate, lovebirds.'"],
  waterfront_b: ["The river traffic scrolls by like it's doing it for your benefit. A tug horn punctuates a joke perfectly."],
  lighthouse_park: ["Under the old lighthouse the city feels far away — which is absurd, it's right there, glittering."],
};

/* ---------------- Hidden-economy hint texts (one-time) ---------------- */
CS.ECON_HINTS = {
  weddings: { from:'malik', season:0, day:20,
    text:'Wedding season on the island. Folks pay silly money for flowers the next week or so. Just saying.' },
  basil:    { from:'nico', season:1, day:1,
    text:'BASIL SZN. official notice. anything green and fragrant sells hot all summer. bring me everything' },
  lny:      { from:'mei_lin', season:3, day:20,
    text:'Lunar New Year soon. Flowers and anything beautiful sell very well right now — on Mott Street especially.' },
};

/* ---------------- Phone message pools ---------------- */
/* hello: sent when you exchange numbers (reach Acquaintance).
   casual: random morning texts from friends. partner: while dating. */
CS.MESSAGES = {
  maya: {
    hello: "Hey, it's Maya. Malik gave me your number — he vouches for you, which is basically a security clearance here.",
    casual: [
      "shift ran long. if you see me at the café, approach with coffee",
      "saw the farm from the tram this morning. it's looking legit",
      "reminder that sleep is a food group too. says the doctor. me. i'm the doctor",
    ],
    partner: ["off at 7 tonight. river walk? i'll bring the exhaustion, you bring the conversation", "thinking about you between patients. don't tell my attending"],
  },
  daniel: {
    hello: "Daniel here! Adding you to my contacts under 'Farm (Load-bearing neighbor)'. It's a compliment.",
    casual: [
      "the office coffee machine died. thoughts and prayers welcome",
      "spreadsheet update: Grace's croissant remains undefeated",
      "tram was 4 minutes late today. documenting for posterity",
    ],
    partner: ["calendar says 'go outside' at 6. want to be my outside?", "made too much dinner. this is a rescue request"],
  },
  lena: {
    hello: "lena!! (hoffman) (from the café) (neuroscience) ok that's enough context. hi!",
    casual: [
      "it's 1am and the data is BEAUTIFUL. nobody's awake to hear this. you're nobody now. congrats",
      "the river was extremely good today. 10/10. would stare again",
      "coffee number four says hi",
    ],
    partner: ["come look at the river with me tonight. bring your brain, i like it", "advisor said 'promising' again. this time about ME. celebrate??"],
  },
  nico: {
    hello: "NICO. saved my number under 'basil guy' for when summer comes. plan ahead, that's all i'm saying",
    casual: [
      "nonna asked about 'the farmer' today. you're famous in Astoria",
      "bellini's was slammed tonight. good tired though",
      "grace's bread + my sauce = civilization. that's the text. that's the whole text",
    ],
    partner: ["family dinner sunday. they know about you. i'm sorry and you're welcome", "saved you the corner table. and the good tiramisu. don't tell anyone we have good tiramisu"],
  },
  grace: {
    hello: "This is Grace from Moonrise. I text like I bake — rarely, and only when it matters.",
    casual: [
      "First batch at 5:42 tomorrow. You know what that means.",
      "The cardamom came in. This week will be a good week.",
    ],
    partner: [],
  },
  malik: {
    hello: "Malik here. Now you can't say nobody told you when the frost is coming.",
    casual: [
      "Good watering day today. The soil will thank you.",
      "Stopped by your rows this morning. Coming along. Keep showing up.",
    ],
    partner: [],
  },
  sofia: {
    hello: "Sofia! Adding you to exactly zero group chats for now. You're welcome. That's a gift.",
    casual: [
      "the kids drew the farm today. you have a fan club of nine-year-olds",
      "abuela made too much food again. 'too much' = enough for the block. come by harbor house",
    ],
    partner: ["my family is asking questions. i'm managing it. bring an appetite friday tho", "saw a tulip today and thought of you. that's it. that's the text"],
  },
  gabriel: {
    hello: "gabriel. off duty till thursday. if you see the ambulance it's NOT me, don't wave",
    casual: [
      "jogged past the farm at 7. your lettuce is doing better than my knees",
      "quiet shift last night. i said the q word and nothing happened. living dangerously",
    ],
    partner: ["off shift at 8. save me the last good hour of your day?", "the crew keeps asking about you. i keep smiling. it's a problem"],
  },
  theo: {
    hello: "Theo. I don't text much — the camera talks for me. But you should have this number.",
    casual: [
      "the light on the river right now. that's the whole message",
      "shot your market stall today. it belongs to the neighborhood now",
    ],
    partner: ["golden hour, south point, tonight. i want you in the frame this time", "printed one of you laughing. it's on the wall. thought you should know"],
  },
  avery: {
    hello: "avery!! bar tonight? i pour with intention and gossip responsibly",
    casual: [
      "client asked for the logo 'bigger but also smaller'. pouring drinks tonight to recover",
      "jukebox update: still three good songs. guard them with me",
    ],
    partner: ["closing early-ish tonight. wait up? i'll bring the bar snacks", "drew you again. this one i'm keeping"],
  },
  naomi: {
    hello: "Naomi Brooks. You now have my personal cell. Four people have this number. Use it wisely.",
    casual: [
      "Out at a reasonable hour tonight. Statistically anomalous. Drink at The Anchor?",
      "Mei-Lin found me a fifth lamp. Intervention may be required.",
    ],
    partner: ["I moved my morning call. Breakfast? I know a place. I know all the places.", "Long day. Your voice would fix approximately 60% of it. Calling in ten."],
  },
  arjun: {
    hello: "Hi, this is Arjun (Pier Labs, lunchtime walks, cricket opinions). It's nice to officially have your number.",
    casual: [
      "model finished training. it's... fine. like most things at 2am",
      "found a proper chai place in Jackson Heights. life-changing. will report back",
    ],
    partner: ["walked our loop at lunch and missed you on it. that's new for me", "my mother says hello. all forty questions of it"],
  },
  priya: {
    hello: "Priya Nair. You're officially in my stakeholder contacts AND my real contacts. Rare crossover.",
    casual: [
      "community board meeting thursday. bring the farm's numbers. and maybe cookies. boards love cookies",
      "counted foot traffic on main street today. it's up. that's you, partly. data says so",
    ],
    partner: ["i mapped a walk for us. three scenic nodes, one pastry stop. optimal route. 7pm?", "you're in my five-year plan now. i don't say that lightly. i don't say ANYTHING lightly"],
  },
  jordan: {
    hello: "jordan. got your number from malik. i answer slow. it's not personal",
    casual: [
      "ok",
      "site ran long. tmrw?",
      "saw a brownstone listing. almost. getting closer",
    ],
    partner: ["off at 4 today. that's early for me. yours if you want it", "answered in 20 min. my sister says that's basically a love letter. she's right"],
  },
  mei_lin: {
    hello: "Mei-Lin. I saved your number properly, with your actual name. I take contacts seriously.",
    casual: [
      "found a 1960s seed catalogue at second life today. thought of your farm. i almost bought it. i bought it",
      "the exhibition opens friday. the objects survived shipping. i survived the objects",
    ],
    partner: ["tea at mine on sunday. i'll use the good shelf teacup. you know the one", "i don't hurry with people. but i find myself checking my phone for you. noted, catalogued, accepted"],
  },
  mateo: {
    hello: "Mateo! Saved you as 'Farm — GOOD NEWS ONLY'. Please respect the filing system.",
    casual: [
      "won a motion today!! celebrating by sleeping before 11",
      "cooked enough pernil for a jury of twelve. come claim your portion",
    ],
    partner: ["i cooked for two. on purpose. 8pm? no case files at the table, i promise. one case file", "you're the best part of my dockets-and-disasters week. wanted that in writing"],
  },
};

/* Neighborhood announcements thread */
CS.ANNOUNCEMENTS = {
  senderName: 'Harbor Point Community',
  festivalEve: f => `Tomorrow: ${f.name}! ${f.blurb}`,
  festivalDay: f => `Today: ${f.name} — ${f.blurb}`,
  gossip: (a, b, spot) => `(gossip) Saw ${a} and ${b} at ${spot} again. Just saying.`,
};

})();
