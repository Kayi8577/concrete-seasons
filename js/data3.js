/* =========================================================================
   Concrete Seasons — data3.js (Phase 3 content)
   Year 2–5 life arcs, Glasshouse Coffee, marriage content, departures &
   returns. Loaded after data.js/data2.js; merges into CS.*.
   Arc `run(api)` gets: { S, addMsg, toast, discover, setArc, tierOf }.
   ========================================================================= */
(function () {

const dayOf = (year, season, day) => (year - 1) * 120 + season * 30 + (day - 1);
CS.dayOf = dayOf;

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

CS.NPCS.claire = {
  name:'Claire Fontaine', color:'#37535e', gender:'F', rom:[],
  look:{ skin:'#f6d7b8', hair:'#c9a24b', style:'long', outfit:'#37535e' },
  bio:'Opened Glasshouse Coffee with a loan, a dream, and very good taste.', decorative:true,
};
CS.SCHEDULES.claire = function (s) {
  if (!s.flags.glasshouseOpen || s.flags.glasshouseClosed) return [{ until:9999, at:null, act:'' }];
  return [
    { until:390, at:null, act:'' },
    { until:1200, at:'glass_counter', act:'running Glasshouse on hope and espresso' },
    { until:9999, at:null, act:'' },
  ];
};
CS.DIALOGUE.claire = {
  intro: "\"Welcome to Glasshouse! Claire.\" She says it like she's still getting used to saying it. \"Yes, we're the new place. No, we're not trying to kill anyone's café. I just... really love coffee. Try the cortado?\"",
  pools: [
    { cond:{}, lines:[
      "\"The loan officer asked for my five-year plan. I showed him a coffee menu. Somehow it worked.\"",
      "\"People think new means corporate. It's me. It's literally just me and a grinder I'm still paying off.\"",
      "\"Joan came by on my first week. Wished me luck. I almost cried into the batch brew.\"",
    ]},
  ],
};

/* ---------------- ring ---------------- */
CS.ITEMS.ring = { name:'Gold Band', type:'misc', desc:'A quiet little forever, in a box.' };
CS.SHOP_MARKET.push({ item:'ring', price:280 });

/* ---------------- married / partner lines ---------------- */
CS.MARRIED_LINES = [
  "\"We need dish soap. This is what romance looks like now. I love it.\"",
  "They hand you the good mug without being asked. Eleven years of mornings could feel like this and it wouldn't get old.",
  "\"Come look at the river with me for a second. It's doing the thing.\"",
  "You find your spare key in their pocket and their spare key in yours. Neither of you mentions it.",
];
CS.WEDDING_LINES = {
  vows: "Under the old lighthouse, in front of everyone who learned your name one season at a time, you both say the simple version out loud. The river applauds the only way it knows how.",
};

/* ---------------- arc dialogue pools (merged into existing NPCs) ---------------- */
const ARC_POOLS = {
  daniel: [
    { cond:{ arc:'rumors' }, lines:[
      "The layoff rumors got a spreadsheet. When I'M the one making the doom spreadsheet, it's bad.",
      "Re-org meeting Thursday. 'Re-org' is Latin for 'update your resume.'",
    ]},
    { cond:{ arc:'laidoff' }, lines:[
      "So. Funny story. I've been 'impacted.' That's the actual word they used. Like a wisdom tooth.",
      "Day 12 of funemployment. I alphabetized my spices and applied to nine jobs. The spices went better.",
      "You know what nobody tells you? Losing the job also loses the schedule. I miss the schedule most.",
    ]},
    { cond:{ arc:'startup' }, lines:[
      "The startup's five people and a whiteboard. I haven't been this terrified or this awake in years.",
      "No more Midtown tower. We work above a dumpling place in LIC. Objectively an upgrade.",
    ]},
    { cond:{ arc:'bigco' }, lines:[
      "Back at a big company. The badge photo is worse but the health insurance is beautiful.",
    ]},
    { cond:{ arc:'freelance' }, lines:[
      "Freelance PM. Turns out 'organized and pleasant' is a sellable service. Avery was right. Don't tell Avery.",
    ]},
  ],
  maya: [
    { cond:{ arc:'applying' }, lines:[
      "Fellowship applications are open. Boston, Chicago, and one here. I keep rearranging the list. The list knows nothing.",
      "Everyone asks where I want to end up. The honest answer keeps changing depending on who's asking.",
    ]},
    { cond:{ arc:'staying' }, lines:[
      "I took the fellowship HERE. Turns out the tiebreaker wasn't the program. It was everything else. Some of it was you.",
    ]},
  ],
  lena: [
    { cond:{ arc:'defended' }, lines:[
      "DOCTOR Hoffman. I keep saying it to the mirror. The mirror is very impressed.",
      "The defense took 96 minutes and six years. Now everyone asks 'what's next' like that's a fair question.",
    ]},
    { cond:{ arc:'industry' }, lines:[
      "I took the industry job. In the city. My advisor sighed for a full minute, but the river vetoed Chicago.",
    ]},
  ],
  nico: [
    { cond:{ arc:'deciding' }, lines:[
      "Pop sat me down Sunday. THE talk. The restaurant, the keys, my name on the thing. I ordered more napkins. He noticed.",
      "Everyone's got an opinion about my life this month. What's yours? No — wait. Actually, I'm asking.",
    ]},
    { cond:{ arc:'partial' }, lines:[
      "We signed it: me and Pop, partners. Half the keys, half the yelling. Rosa says it's the first smart thing the family's done since the sauce.",
    ]},
    { cond:{ arc:'took_over' }, lines:[
      "It's mine now. The whole thing. I cried in the walk-in, which is traditional.",
    ]},
    { cond:{ arc:'refused' }, lines:[
      "I said no. Pop took it... okay. Rosa took it better. Somebody else's name on Bellini's — still hurts to say. But it was the honest answer.",
    ]},
  ],
  priya: [
    { cond:{ arc:'notice' }, lines:[
      "The redevelopment notice is real. South Point, mixed-use, the whole file. This is the part where the neighborhood decides what it is. Come to the meeting.",
    ]},
    { cond:{ arc:'construction' }, lines:[
      "Construction phase. Everyone hates me at the community board and I've never been more sure the details matter.",
    ]},
    { cond:{ arc:'done' }, lines:[
      "Walk the new waterfront and tell me what you notice. Not the buildings — the benches. I fought for the benches.",
    ]},
  ],
};

/* ---------------- ARCS ----------------
   Stages fire on wake once their date arrives, in order. */
CS.ARCS = [
  {
    id: 'glasshouse',
    stages: [
      { at:{ y:2, s:1, d:1 }, run(api) {
        api.S.flags.glasshouseOpen = true;
        api.addMsg('hp', 'New on Main Street: Glasshouse Coffee, in the long-empty corner unit. The owner is new to the island. Be kind — or at least be curious.');
        api.toast('Glasshouse Coffee has opened on Main Street');
        api.discover('glasshouse_opens', 'Year 2: Glasshouse Coffee opened in the For Lease corner. The neighborhood suddenly has a coffee decision to make.');
      }},
      { at:{ y:3, s:0, d:10 }, run(api) {
        if (api.S.npcs.avery.hasNumber) api.addMsg('avery', 'bar gossip: juniper and glasshouse are both bleeding rent. this island only caffeinates so many people. choose with your wallet, friend');
      }},
      { at:{ y:4, s:0, d:10 }, run(api) {
        const S = api.S;
        const j = S.coffeeJuniper || 0, g = S.coffeeGlasshouse || 0;
        let outcome;
        if (j - g >= 5) outcome = 'glasshouse_closes';
        else if (g - j >= 5) outcome = 'juniper_closes';
        else outcome = Math.random() < .6 ? 'both' : (Math.random() < .5 ? 'glasshouse_closes' : 'juniper_closes');
        if (outcome === 'both') {
          api.addMsg('hp', 'Against every prediction: Juniper and Glasshouse are BOTH renewing their leases. Claire and Joan were seen splitting a pastry. The rivalry is now a bit.');
          api.discover('coffee_peace', 'Year 4: the great coffee war ended in a truce. Two cafés, one island, everybody caffeinated.');
        } else if (outcome === 'juniper_closes') {
          S.flags.juniperClosed = true;
          api.addMsg('hp', 'Juniper Café is closing at the end of the month. Twelve years on Main Street. Joan says: "Thanks for every single order."');
          api.discover('juniper_closes', 'Year 4: Juniper closed. The plants in tomato tins went home with regulars, one by one. Glasshouse keeps a photo of the old counter by its register.');
        } else {
          S.flags.glasshouseClosed = true;
          S.flags.glasshouseOpen = true; // building stays, lights off
          api.addMsg('hp', 'Glasshouse Coffee has closed. Claire posted a note: "Thank you for two brave years. Tip your baristas. Love your neighborhood."');
          api.discover('glasshouse_closes', 'Year 4: Glasshouse closed. Claire moved back upstate. Joan kept her farewell note taped to the Juniper register.');
        }
      }},
    ],
  },
  {
    id: 'daniel_layoff',
    stages: [
      { at:{ y:2, s:0, d:10 }, run(api) {
        api.setArc('daniel', 'rumors');
        if (api.S.npcs.daniel.hasNumber) api.addMsg('daniel', 'not to be dramatic but the CFO used the word "runway" four times in all-hands today');
      }},
      { at:{ y:2, s:0, d:25 }, run(api) {
        api.setArc('daniel', 'laidoff');
        if (api.S.npcs.daniel.hasNumber) api.addMsg('daniel', "so the runway ran out. laid off, effective friday. i'm fine. i'm not fine. i'm approximately fine");
        api.discover('daniel_laidoff', 'Year 2: Daniel got laid off. His whole week changed shape overnight — you started seeing him at the café at hours he never used to exist in.');
      }},
      { at:{ y:2, s:2, d:5 }, run(api) {
        const roll = Math.random();
        const arc = roll < .4 ? 'startup' : roll < .75 ? 'bigco' : 'freelance';
        api.setArc('daniel', arc);
        const msg = {
          startup: 'NEWS. joined a 5-person healthtech startup in LIC. pay cut, sanity gain. first standup was 9 minutes. NINE.',
          bigco: 'took the big-company offer. stability won this round. my badge photo looks like a hostage but the 401k matches',
          freelance: 'officially freelance. me, a calendar, and audacity. first client already "forgot" an invoice. living the dream',
        }[arc];
        if (api.S.npcs.daniel.hasNumber) api.addMsg('daniel', msg);
        api.discover('daniel_next', `Year 2, Fall: Daniel landed on his feet — ${arc === 'startup' ? 'a tiny healthtech startup in Long Island City' : arc === 'bigco' ? 'back at a big company, on purpose' : 'freelance, on his own terms'}.`);
      }},
    ],
  },
  {
    id: 'maya_fellowship',
    stages: [
      { at:{ y:2, s:1, d:15 }, run(api) {
        api.setArc('maya', 'applying');
        if (api.S.npcs.maya.hasNumber) api.addMsg('maya', "fellowship apps are open. boston, chicago, and one here. don't make it weird. (it's a little weird)");
      }},
      { at:{ y:3, s:0, d:5 }, run(api) {
        const S = api.S;
        const staying = !!S.npcs.maya.romance || Math.random() < .4;
        if (staying) {
          api.setArc('maya', 'staying');
          if (S.npcs.maya.hasNumber) api.addMsg('maya', 'took the fellowship HERE. the island wins. see you at the café, same as always');
          api.discover('maya_stays', 'Year 3: Maya matched to the fellowship in the city. Harbor Point keeps its doctor.');
        } else {
          api.setArc('maya', 'gone');
          S.npcs.maya.awayCity = 'Boston';
          if (S.npcs.maya.hasNumber) api.addMsg('maya', "boston took me. three years. i already hate how much i'll miss this place. keep the farm loud for me");
          api.discover('maya_leaves', 'Year 3: Maya left for a fellowship in Boston. Her café table sat empty for a while before anyone else dared use it.');
        }
      }},
    ],
  },
  {
    id: 'lena_postdoc',
    stages: [
      { at:{ y:3, s:1, d:1 }, run(api) {
        api.setArc('lena', 'defended');
        if (api.S.npcs.lena.hasNumber) api.addMsg('lena', "DEFENDED. it's DOCTOR chaos to you now. celebration at the anchor, attendance mandatory, science says so");
        api.discover('lena_phd', 'Year 3: Lena defended the dissertation. The Anchor ran out of the good glasses.');
      }},
      { at:{ y:3, s:2, d:10 }, run(api) {
        const S = api.S;
        const staying = !!S.npcs.lena.romance || Math.random() < .5;
        if (staying) {
          api.setArc('lena', 'industry');
          if (S.npcs.lena.hasNumber) api.addMsg('lena', 'took the industry gig in the city!! the river gets to keep me. chicago never stood a chance');
          api.discover('lena_stays', 'Year 3: Dr. Hoffman went industry and stayed in the city. The late-night waterfront keeps its philosopher.');
        } else {
          api.setArc('lena', 'gone');
          S.npcs.lena.awayCity = 'Chicago';
          if (S.npcs.lena.hasNumber) api.addMsg('lena', "chicago postdoc. two years. i measured: their river is objectively worse. i'll be back to check on mine");
          api.discover('lena_leaves', 'Year 3: Lena took the Chicago postdoc. The waterfront is quieter at 1 AM now.');
        }
      }},
    ],
  },
  {
    id: 'nico_succession',
    stages: [
      { at:{ y:3, s:0, d:12 }, run(api) {
        api.setArc('nico', 'deciding');
        if (api.S.npcs.nico.hasNumber) api.addMsg('nico', "pop gave me The Talk. the restaurant. my name. i have until spring's end and i keep ordering napkins instead of deciding");
      }},
      { at:{ y:3, s:0, d:28 }, run(api) {
        const S = api.S;
        // the player doesn't decide — but showing up matters
        const close = api.tierOf('nico') >= 3;
        const arc = close ? 'partial' : (Math.random() < .5 ? 'took_over' : 'refused');
        api.setArc('nico', arc);
        const msg = {
          partial: "DECIDED. partners with pop — half the keys, half the yelling. talking it through with people who listen helped. that's you, by the way",
          took_over: "i took it. all of it. bellini's is mine. rosa cried, pop pretended not to, i did the dishes to calm down",
          refused: "i said no. somebody else's name goes on bellini's. feels like a broken rib that i'm still sure about",
        }[arc];
        if (S.npcs.nico.hasNumber) api.addMsg('nico', msg);
        api.discover('nico_decision', `Year 3: Nico ${arc === 'partial' ? "became his father's partner at Bellini's — his terms, family's table" : arc === 'took_over' ? "took over Bellini's outright" : "walked away from Bellini's — the hardest honest answer of his life"}.`);
      }},
    ],
  },
  {
    id: 'redevelopment',
    stages: [
      { at:{ y:2, s:3, d:5 }, run(api) {
        api.setArc('priya', 'notice');
        api.addMsg('hp', 'NOTICE: the city has designated South Point for mixed-use redevelopment study. Community input meeting at Harbor House, Year 3, Summer 20, evening. Your neighborhood. Your voice.');
        api.discover('redev_notice', 'Year 2, Winter: the redevelopment notice went up. Everyone read it twice. Priya read it forty times.');
      }},
      { at:{ y:3, s:1, d:20 }, run(api) {
        api.S.flags.redevMeetingDay = true;
        api.addMsg('hp', 'TONIGHT: redevelopment community meeting at Harbor House, 6 PM. Come say what matters.');
      }},
      { at:{ y:4, s:0, d:1 }, run(api) {
        api.S.flags.construction = true;
        api.setArc('priya', 'construction');
        api.addMsg('hp', 'South Point construction begins today. Expect detours, noise, and Priya Nair walking very fast with rolled-up drawings.');
        api.discover('redev_construction', 'Year 4: the fences went up on South Point. The lawn where the picnic happens got smaller for a while. Everyone said "for a while" like a prayer.');
      }},
      { at:{ y:5, s:0, d:1 }, run(api) {
        const S = api.S;
        S.flags.construction = false;
        S.flags.newWaterfront = true;
        api.setArc('priya', 'done');
        const attended = S.flags.redevAttended;
        api.addMsg('hp', attended
          ? 'The new South Point opens today — with the community garden protected, more green space, and yes, the benches. Thank you to everyone who showed up to the meetings.'
          : 'The new South Point opens today. More housing, a wider promenade. Some of the old lawn made it. Some didn\'t.');
        api.discover('redev_done', attended
          ? 'Year 5: redevelopment finished — and because the neighborhood showed up, the farm stayed, the lawn survived, and the waterfront got its benches. Priya cried at the ribbon. "Allergies."'
          : 'Year 5: redevelopment finished. The skyline of the island changed. The picnic moved fifty feet north and carried on.');
      }},
    ],
  },
];

/* merge arc dialogue into the cast */
for (const id of Object.keys(ARC_POOLS)) {
  CS.DIALOGUE[id].pools.push(...ARC_POOLS[id]);
}

})();
