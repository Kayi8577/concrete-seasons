/* =========================================================================
   Concrete Seasons — data/schedules.js
   Daily routines for the whole cast, by weekday/weather/arc state.
   ========================================================================= */
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
    if (wd === 5) return [
      { until:540,  at:null, act:'sleeping in, finally' },
      { until:660,  at:'cafe_table_b', act:'weekend coffee ritual' },
      { until:780,  at:'farm_gate', act:'poking around the community farm' },
      { until:900,  at: rain ? null : 'waterfront_a', act: rain ? 'reading at home' : 'river walk' },
      { until:9999, at:null, act:'quiet night in' },
    ];
    // Sunday: family day in Flushing
    return [
      { until:600,  at:null, act:'sleeping in, finally' },
      { until:720,  at:'cafe_table_b', act:'weekend coffee ritual' },
      { until:840,  at:null, act:'on the 7 train to Flushing' },
      { until:1020, at:'ft_court', act:'dim sum with the Chens' },
      { until:9999, at:null, act:'home with leftovers her mother insisted on' },
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

CS.SCHEDULES.claire = function (s) {
  if (!s.flags.glasshouseOpen || s.flags.glasshouseClosed) return [{ until:9999, at:null, act:'' }];
  return [
    { until:390, at:null, act:'' },
    { until:1200, at:'glass_counter', act:'running Glasshouse on hope and espresso' },
    { until:9999, at:null, act:'' },
  ];
};

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
