/* =========================================================================
   Concrete Seasons — data/arcs.js
   Year 2–5 life arcs: dated stages that reshape the world.
   ========================================================================= */
/* ---------------- ARCS ----------------
   Stages fire on wake once their date arrives, in order. */
CS.ARCS = [
  {
    id: 'theo_stays',
    stages: [
      { at:{ y:1, s:2, d:14 }, run(api) {
        api.S.flags.harvestPush = true;
        api.addMsg('hp', 'Malik needs hands for the fall harvest push — tomorrow, Fall 15, at the farm, all morning. Bring a friend if you have one who needs a reason to stay.');
        if (api.S.npcs.theo.hasNumber) api.addMsg('theo', "documentary funding fell through. not sure the island's my story anymore. might be time to go shoot somewhere else. don't know yet");
        api.toast('Fall harvest push tomorrow — Malik needs hands');
      }},
      { at:{ y:1, s:3, d:29 }, run(api) {
        if (api.S.flags.theoStays) return;
        api.setArc('theo', 'gone');
        api.discover('theo_leaves', 'Winter 29, Year 1: Theo left the island on the morning ferry. The documentary went unfinished. He sends a print every New Year — always the lighthouse, always from the water.');
        api.addMsg('hp', "Theo Bennett moved off the island this morning. He left a box of prints at Harbor House: 'For whoever looked up.'");
        api.toast('Theo left the island');
      }},
    ],
  },
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

/* Ava & Nia grow up on their own clock */
CS.ARCS.push(
  {
    id: 'lease',
    stages: [
      { at:{ y:2, s:0, d:2 }, run(api) {
        api.S.flags.leaseOffer = true;
        api.addMsg('hp', 'Harbor Studios lease renewals are open. A one-bedroom just freed up in the building — inquire at the Harbor House desk if interested.');
      }},
    ],
  },
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
