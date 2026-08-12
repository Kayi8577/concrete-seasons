/* =========================================================================
   Concrete Seasons — data4.js (Phase 4 content)
   NPC weddings, family/children content, Ava & Nia (the kids who grow up),
   Pride, pet moments, Then & Now. Loaded after data3.js.
   ========================================================================= */
(function () {

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

Object.assign(CS.SCHEDULES, {
  ava(s) {
    const wd = s.time.weekdayIndex;
    if (wd <= 4) return [
      { until:900,  at:null, act:'school across the river' },
      { until:1080, at:'hh_a', act:'homework + helping Sofia wrangle the little kids' },
      { until:1140, at:'mainstreet', act:'the long way home with headphones on' },
      { until:9999, at:null, act:'home — allegedly studying' },
    ];
    return [
      { until:660,  at:null, act:'teenage sleep, undefeated' },
      { until:840,  at:'lighthouse_park', act:'reading on the grass' },
      { until:960,  at:'waterfront_b', act:'filming the skyline for a school project' },
      { until:9999, at:null, act:'home' },
    ];
  },
  nia(s) {
    const wd = s.time.weekdayIndex;
    if (wd <= 4) return [
      { until:930,  at:null, act:'school' },
      { until:1050, at:'farm_gate', act:'inspecting the farm (and hoping for strawberries)' },
      { until:1140, at:'lighthouse_park', act:'cat patrol' },
      { until:9999, at:null, act:'home before the streetlights' },
    ];
    return [
      { until:600,  at:null, act:'cartoons' },
      { until:780,  at:'lighthouse_park', act:'drawing every cat she has ever met' },
      { until:900,  at:'farm_center', act:'"helping" Malik' },
      { until:9999, at:null, act:'home' },
    ];
  },
});

Object.assign(CS.DIALOGUE, {
  ava: {
    intro: "\"Oh — you're the farm person! I'm Ava. I volunteer at Harbor House, I'm sixteen, and I have opinions about everything, sorry in advance. Sofia says you're okay, which from Sofia is a five-star review.\"",
    pools: [
      { cond:{}, lines:[
        "\"Everyone keeps asking what I want to be. I want to be TWENTY-FIVE and settled, skip the middle part.\"",
        "\"Nia catalogued nine island cats this month. Nine. We do not have a cat.\"",
        "\"Harbor House kids drew your farm again. You're basically a folk hero to the under-tens.\"",
      ]},
      { cond:{ arc:'apps' }, lines:[
        "\"College apps. Seven essays about 'a challenge I overcame.' The challenge is the essays.\"",
        "\"Sofia read my personal statement and cried. Good sign or bad sign? Don't answer.\"",
      ]},
      { cond:{ arc:'accepted' }, lines:[
        "\"I GOT IN. Upstate, full aid. I leave in the fall and I keep hugging strangers, consider yourself warned.\"",
      ]},
      { cond:{ minTier:2 }, lines:[
        "\"Real talk? I'm scared to leave and scared to stay. Sofia says that's just called being a person.\"",
      ]},
    ],
  },
  nia: {
    intro: "A kid materializes beside you at the fence. \"Are you the farmer? I'm Nia. Do you have farm cats? You should have farm cats. I know several candidates.\"",
    pools: [
      { cond:{}, lines:[
        "\"The grey cat by the tram is named Conductor. I named him. It's official.\"",
        "\"Malik lets me water one row. ONE. I'm building trust.\"",
        "\"When I grow up I'm going to be a vet. Or a ferry captain. There's time.\"",
      ]},
      { cond:{ arc:'nia14' }, lines:[
        "\"I'm FOURTEEN now, you can stop talking to me like I'm Nia-from-before.\"",
        "\"Ava calls every Sunday from college. I act busy. I am never busy on Sundays.\"",
      ]},
      { cond:{ arc:'nia16' }, lines:[
        "\"Sixteen. Ava's age when you moved here. That's so weird to say out loud.\"",
        "\"I got the Harbor House volunteer spot. Ava's old one. Sofia cried, obviously.\"",
      ]},
    ],
  },
});

/* Ava & Nia grow up on their own clock */
CS.ARCS.push(
  {
    id: 'ava_growing',
    stages: [
      { at:{ y:2, s:2, d:3 }, run(api) {
        api.setArc('ava', 'apps');
        if (api.S.npcs.sofia.hasNumber) api.addMsg('sofia', 'ava is deep in college apps. if she asks you to read an essay, the answer is yes and the review is glowing');
      }},
      { at:{ y:3, s:0, d:8 }, run(api) {
        api.setArc('ava', 'accepted');
        api.discover('ava_accepted', 'Year 3: Ava got into college upstate, full aid. Harbor House made a banner. Nia pretended not to cry and failed.');
      }},
      { at:{ y:3, s:2, d:2 }, run(api) {
        api.setArc('ava', 'gone');
        api.S.npcs.ava.awayCity = 'college upstate';
        api.addMsg('hp', 'Send-off for Ava Coleman at Harbor House this week — the whole neighborhood chipped in for her dorm fund.');
        api.discover('ava_leaves', 'Year 3, Fall: Ava left for college. Her Harbor House shift sat empty until Nia grew into it.');
      }},
    ],
  },
  {
    id: 'nia_growing',
    stages: [
      { at:{ y:3, s:0, d:1 }, run(api) { api.setArc('nia', 'nia14'); }},
      { at:{ y:5, s:0, d:1 }, run(api) {
        api.setArc('nia', 'nia16');
        api.discover('nia_sixteen', 'Year 5: Nia turned sixteen and took over Ava\'s old Harbor House shift. Generational time, visible to the naked eye.');
      }},
    ],
  },
);

/* ---------------- Pride ---------------- */
CS.FESTIVALS.pride = {
  name:'Harbor Pride', season:1, day:15, start:600, end:1200,
  blurb:'Bunting on Main Street, music from the rec-center speakers, Avery on the megaphone.',
};
CS.FESTIVAL_LINES.pride = [
  "Avery organized this with a spreadsheet and glitter. Both are load-bearing.",
  "Malik wore the rainbow cap. He's had it for twenty years. 'First one on the island,' he says.",
  "Someone's grandmother is dancing with someone's dog. This is the correct amount of civic order.",
];

/* ---------------- family & children ---------------- */
CS.FAMILY = {
  babyNames: ['Rio', 'Wren', 'Kai', 'June', 'Theo Jr.', 'Marisol'],
  arrival: {
    bio: "The call comes at 4 AM, because of course it does. Hours later there's a whole new person in the studio — furious, tiny, perfect. The radiator hisses a lullaby.",
    adopt: "The agency's final visit ends with paperwork and then, suddenly, with a person. Small hands, serious eyes, and a home that was ready before you knew it was.",
  },
};
CS.BABY_LINES = [
  "\"The baby slept four hours straight. FOUR. We are unstoppable. We are also going back to bed.\"",
  "They're doing the tiny-sock inventory again. Nobody knows where the socks go. The socks know.",
  "\"Your kid smiled at the tram today. Full smile. The conductor waved back. This island, honestly.\"",
];
CS.TODDLER_LINES = [
  "\"We taught them to say 'lettuce.' It comes out 'yettuce.' We are NOT correcting it.\"",
  "The toddler's current loves: the cat, the window, one specific spoon. The spoon is non-negotiable.",
  "\"They walked the whole waterfront today on their own feet. Slowest, best walk of my life.\"",
];

/* ---------------- pet moments (random wake events) ---------------- */
CS.PET_MOMENTS = {
  cat: [
    "{name} has arranged themselves on your clean laundry with the confidence of a museum installation.",
    "{name} spent the night guarding the window from a moth. The moth escaped. The vigil continues.",
    "You wake to find {name} exactly one centimeter from your face, purring like a small engine. Good morning.",
  ],
  dog: [
    "{name} brings you the leash before you're fully awake. Negotiations begin.",
    "{name} made a friend through the fence yesterday — a corgi named Biscuit, apparently a big deal.",
    "{name} dreamed all night — paws paddling, tiny woofs. Wherever they were running, they won.",
  ],
  fish: [
    "{name} greets the morning by patrolling the tank perimeter. All is well in the small nation.",
    "The morning light hits the tank and {name} turns briefly golden. Free art, daily.",
  ],
  dogFind: "{name} proudly delivers something found on the waterfront: ",
};

})();
