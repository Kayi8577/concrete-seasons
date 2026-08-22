/* =========================================================================
   Concrete Seasons — data/events.js
   FoMT-style place-and-time events: where heart events actually happen,
   walk-in random scenes, shop hours, market days.
   ========================================================================= */

/* Outdoor regions (36×64 island) used by event gates. Interiors gate by scene id. */
CS.REGIONS = {
  waterfront: p => p.scene === 'outdoor' && (p.x <= 6 || p.x >= 29) && p.y >= 9 && p.y <= 50,
  farm:       p => p.scene === 'outdoor' && p.x >= 20 && p.x <= 30 && p.y >= 10 && p.y <= 20,
  mainstreet: p => p.scene === 'outdoor' && p.x >= 13 && p.x <= 20 && p.y >= 20 && p.y <= 40,
  lawn:       p => p.scene === 'outdoor' && p.y >= 52,
  lighthouse: p => p.scene === 'outdoor' && p.y <= 8,
  tram:       p => p.scene === 'outdoor' && p.x <= 10 && p.y >= 42 && p.y <= 47,
  fstation:   p => p.scene === 'outdoor' && p.x >= 12 && p.x <= 17 && p.y >= 27 && p.y <= 31,
  ferry:      p => p.scene === 'outdoor' && p.x <= 6 && p.y >= 22 && p.y <= 26,
  home:       p => p.scene === 'outdoor' && p.x >= 6 && p.x <= 13 && p.y >= 15 && p.y <= 18,
  hh_front:   p => p.scene === 'outdoor' && p.x >= 5 && p.x <= 13 && p.y >= 22 && p.y <= 24,
};

/* Where and when each heart event can happen (merged into CS.HEART_EVENTS).
   when = [startMin, endMin]; days = weekday indexes (Mon=0); weather optional.
   hint = a line the NPC may drop in normal conversation once the event is pending. */
CS.HEART_GATES = {
  maya3:    { where:'waterfront', when:[1020,1260], hint:`"After a shift I usually end up on the esplanade bench. Don't tell anyone — it's the only place that doesn't beep."` },
  maya4:    { where:'cafe', when:[480,660], hint:`"Juniper, mornings. I've started ordering two coffees out of habit. Make of that what you will."` },
  daniel3:  { where:'fstation', when:[960,1140], days:[0,1,2,3,4], hint:`"Catch me at the F around five. I'll be the one with a marker and no whiteboard."` },
  daniel4:  { where:'waterfront', when:[1080,1260], hint:`"I do my therapy homework by the river after work. Evening light helps. So does company."` },
  lena3:    { where:'waterfront', when:[840,1080], hint:`"I've been working on the seawall afternoons. The river is a surprisingly good reviewer."` },
  lena4:    { where:'greenhouse', when:[540,1080], hint:`"The greenhouse. Any daytime. I keep ending up there and I'm not growing anything."` },
  nico3:    { where:'ferry', when:[600,960], hint:`"I take the ferry over most middays. If you see me on the landing, I probably have gelato. Plural."` },
  nico4:    { where:'bellinis', when:[1200,1320], hint:`"Come by Bellini's after we close. Eight-ish. I want to show you what the place is like when it's quiet."` },
  sofia3:   { where:'hh_front', when:[900,1080], days:[0,1,2,3,4], hint:`"The bench outside Harbor House, after school hours. That's where I sit when I have news I can't say."` },
  sofia4:   { where:'home', when:[1080,1260], hint:`"Let me walk you home one evening. I have a form I need to confess to."` },
  gabriel3: { where:'mainstreet', when:[1140,1320], hint:`"End of shift the rig's usually parked on Main. If you see me on the back step — that's the thirteenth hour."` },
  gabriel4: { where:'waterfront', when:[1020,1200], hint:`"Walk the esplanade with me some evening. I have a manual I want to complain about."` },
  theo3:    { where:'farm', when:[900,1080], hint:`"I'll be at the farm some afternoon with prints. One of them is yours, technically."` },
  theo4:    { where:'waterfront', when:[1020,1140], weather:'sunny', hint:`"Golden hour on the seawall. Clear evening. I won't bring the camera, which should tell you something."` },
  avery3:   { where:'bar', when:[960,1080], hint:`"The Anchor's dead between four and six. That's when I draw. Come heckle."` },
  avery4:   { where:'bar', when:[1380,1560], hint:`"Stay till close one night. Past eleven the bar turns into a different room."` },
  naomi3:   { where:'lawn', when:[960,1140], weather:'sunny', hint:`"If it's sunny after four, don't look for me at the office. Try the lawn. I'm experimenting."` },
  naomi4:   { where:'cafe', when:[1080,1140], hint:`"I draft my hardest emails at Juniper in the evening. Come sit. I might need a witness."` },
  arjun3:   { where:'labs', when:[1020,1260], days:[0,1,2,3,4], hint:`"The Labs kitchenette, after six. I cook on weeknights when nobody's around to ask what the smell is."` },
  arjun4:   { where:'ferry', when:[1200,1380], hint:`"Late ferry, some night. I think better on the water. I'd like to think out loud at you."` },
  priya3:   { where:'lawn', when:[720,960], weather:'sunny', hint:`"Clear day, midday, the picnic tables on the lawn. I'll have blueprints. Off the record."` },
  priya4:   { where:'waterfront', when:[1020,1200], hint:`"The seawall at dusk. I ran some numbers I'd like a second opinion on."` },
  jordan3:  { where:'tram', when:[660,840], days:[0,1,2,3,4], hint:`"Tram station, lunch break, weekdays. Look up when you get there."` },
  jordan4:  { where:'farm', when:[540,720], hint:`"Your farm fence is wobbly. I'll be by some morning. Don't ask, I'll just be there."` },
  mei_lin3: { where:'chinatown', when:[780,1020], hint:`"Mott Street, afternoons, outside the teahouse. I'll have a catalog and a story."` },
  mei_lin4: { where:'teahouse', when:[840,1080], hint:`"Jade Pavilion, mid-afternoon, the back table. I have something to hand you and no procedure for it."` },
  mateo3:   { where:'cafe', when:[840,1020], days:[0,1,2,3,4], hint:`"If I'm not at court I'm at Juniper, mid-afternoon, possibly unconscious. Wake me. Please."` },
  mateo4:   { where:'home', when:[1140,1320], hint:`"Let me walk you home after dark sometime. There's a thing about nets I want to say."` },
};
for (const id of Object.keys(CS.HEART_EVENTS || {})) {
  for (const ev of CS.HEART_EVENTS[id]) Object.assign(ev, CS.HEART_GATES[ev.key] || {});
}

/* Walk-in random scenes. once:true fires once per save; 'yearly' once per year.
   npc = portrait to show (optional). choices[].fx = {npcId: friendDelta}. */
CS.RANDOM_EVENTS = [
  { key:'bagel_line', where:'bakery', days:[5,6], when:[420,570], once:'yearly',
    lines:[`Saturday at Moonrise: the line is out the door and around the hydrant. Jordan, three people ahead, waves you up. "She's with me." Nobody argues with Jordan.`,
           `Grace sees the maneuver and says nothing, which is how Grace blesses things. Your roll is still warm. The line behind you sighs.`],
    fx:{ grace:4, jordan:6 } },
  { key:'rain_ferry', where:'ferry', weather:'rain', when:[480,600], once:'yearly', npc:'theo',
    lines:[`Theo's on the ferry landing in the rain, camera under his jacket, shooting the water anyway. "Everyone photographs sun. Rain is where the city admits things."`,
           `He shows you the frame: the landing, the grey, a single yellow umbrella halfway across the channel. "That's the one," he says. "Took forty to get it."`],
    fx:{ theo:6 } },
  { key:'late_labs', where:'labs', days:[0,1,2,3,4], when:[1200,1320], once:true, req:{ arjun:2 },
    lines:[`Pier Labs after nine: Arjun and Lena are arguing in the kitchenette about whether sleep is a skill. Lena: "Trainable." Arjun: "Biological." Both look at you.`],
    choices:{ prompt:'Who\'s right?', options:[
      { label:'Lena. Trainable.', line:`"THANK you." Lena writes your name on the whiteboard under WINS. Arjun sighs the sigh of a man who will be hearing about this.`, fx:{ lena:8, arjun:2 } },
      { label:'Arjun. Biological.', line:`Arjun nods once, vindicated and quiet. Lena adds you to a column labeled WRONG BUT LOVED.`, fx:{ arjun:8, lena:2 } },
    ]} },
  { key:'bar_quiz', where:'bar', days:[2], when:[1200,1320], once:'yearly', npc:'avery',
    lines:[`Wednesday trivia at The Anchor. Avery, on the mic: "Final question, worth a round. Roosevelt Island is technically part of which borough?"`],
    choices:{ prompt:'Your answer?', options:[
      { label:'Manhattan', line:`"Manhattan is correct and the Queens table is furious." Avery slides a twenty across for your team's round. The Queens table boos lovingly.`, fx:{ avery:6 }, money:20 },
      { label:'Queens', line:`"Queens! Wrong, but spiritually defensible." The whole bar laughs. Avery gives you a consolation pretzel.`, fx:{ avery:3 } },
    ]} },
  { key:'stoop_gossip', where:'hh_front', days:[1,3], when:[780,960], weather:'sunny', once:'yearly',
    lines:[`Sofia, Naomi, and Priya on the Harbor House steps, iced coffees, the tone of a meeting that isn't one. "—and the developer's renderings have a dog park where the garden IS."`,
           `Priya: "The dog park is a rendering. The garden is a garden." Naomi: "I'll draft something." Sofia: "I'll call everyone's cousin." You're handed an iced coffee. Nobody explains why.`],
    fx:{ sofia:3, naomi:3, priya:3 } },
  { key:'lost_cat', where:'lighthouse', when:[540,720], once:'yearly', req:{ nia:1 }, npc:'nia',
    lines:[`Nia, very serious, under the lighthouse: "Admiral is missing. Grey, one ear, answers to nothing. I've checked four of his nine spots."`],
    choices:{ prompt:'Help look?', options:[
      { label:'Split up and search (30 min)', line:`Spot seven: behind the lighthouse, in the sun, entirely unbothered. Nia delivers a lecture on responsibility to a cat who closes his eyes. "You're on the list now," she tells you. "The good list."`, fx:{ nia:10 }, minutes:30 },
      { label:'"Try the sunny side of the lighthouse."', line:`She narrows her eyes, then runs. A minute later: "ADMIRAL." From around the corner, unmistakable, the sound of a cat being forgiven.`, fx:{ nia:5 } },
    ]} },
  { key:'busker', where:'fstation', days:[0,1,2,3,4], when:[1020,1140], once:'yearly', npc:'daniel',
    lines:[`A trumpet at the F entrance, playing something slow and sideways. Daniel stops beside you and drops a dollar into the case with ceremony. "Tuesdays he does Coltrane. Don't tell the MTA."`],
    choices:{ prompt:'Tip?', options:[
      { label:'Drop $5 in the case', line:`The trumpet player nods mid-phrase. Daniel looks at you like you just passed a test he didn't know he was giving. The song gets better. It genuinely does.`, fx:{ daniel:6 }, money:-5 },
      { label:'Just listen', line:`You stand there through the whole song. Daniel too. Neither of you checks a phone. On this island that counts as a sacrament.`, fx:{ daniel:3 } },
    ]} },
  { key:'stormy_anchor', where:'bar', weather:'rain', when:[1080,1320], once:true,
    lines:[`The lights at The Anchor flicker, die, and stay dead. A beat of silence — then Avery, from behind the bar, striking a match: "Candles are under the register. Drinks are cash. Singing is mandatory."`,
           `Twenty minutes of candlelight, one terrible group rendition of a song everyone half-knows, and the power comes back to a round of boos. You'll think about this night for years.`],
    fx:{ avery:5, gabriel:3, jordan:3, mateo:3 } },
  { key:'malik_dawn', where:'farm', when:[330,400], once:true, npc:'malik',
    lines:[`Malik's already at the farm at first light, watering in a pattern. "Morning. Early's the secret — water before the sun's on the leaves and they drink instead of steam."`,
           `He hands you a paper twist of seeds. "Got these from a guy in Flushing. Don't know what they'll do. Let's find out."`],
    fx:{ malik:10 }, items:{ kale_seed:2, carrot_seed:2 } },
  { key:'naomi_tram', where:'tram', days:[0,1,2,3,4], when:[1260,1380], once:'yearly', npc:'naomi',
    lines:[`Naomi comes off the last tram with her heels in one hand and her shoes' dignity in the other. "Fourteen hours. Don't say anything."`],
    choices:{ prompt:'Walk her home?', options:[
      { label:'Walk her home', line:`Two blocks of silence, then: "I billed a client for thinking about this island today. Twelve minutes. They'll never know." She laughs for the first time all day.`, fx:{ naomi:8 } },
      { label:'Wave her on', line:`She salutes with a shoe and goes. Tomorrow she'll text you something terse and grateful.`, fx:{ naomi:3 } },
    ]} },
  { key:'priya_count', where:'mainstreet', days:[0], when:[600,780], once:'yearly', npc:'priya',
    lines:[`Priya on Main Street with a clipboard and a clicker, counting pedestrians for the traffic study. "Don't make it weird. Walk normally."`],
    choices:{ prompt:'Walk normally?', options:[
      { label:'Walk past four times', line:`Click. Click. Click. Click. "I'm counting you as a family of four," she says, not looking up. Her mouth does the thing it does instead of smiling.`, fx:{ priya:8 } },
      { label:'Ask what the count is for', line:`"Benches. The city gives benches to streets that prove they have feet." She shows you the tally. Main Street is winning.`, fx:{ priya:5 } },
    ]} },
  { key:'cpr_class', where:'waterfront', days:[5], weather:'sunny', when:[600,720], once:true, npc:'gabriel',
    lines:[`Gabriel on the esplanade with a training dummy and six neighbors. "Free CPR. Thirty minutes. One day you'll thank me and I'll be insufferable about it."`],
    choices:{ prompt:'Join?', options:[
      { label:'Join the class (30 min)', line:`Thirty compressions, two breaths, to the beat of a song you can never un-hear now. Gabriel signs a card and hands it over. "Certified. Insufferability pending."`, fx:{ gabriel:10 }, minutes:30, flag:'cprTrained' },
      { label:'Watch from the bench', line:`You watch six neighbors learn to save each other. Gabriel catches your eye and mouths "next time." He means it.`, fx:{ gabriel:3 } },
    ]} },
  { key:'jordan_snow', where:'mainstreet', weather:'snow', when:[420,600], once:'yearly', npc:'jordan',
    lines:[`Snow day. Jordan's already shoveled four storefronts and is starting on Moonrise, unasked, unpaid, steaming like a horse.`],
    choices:{ prompt:'Grab the other shovel?', options:[
      { label:'Help shovel (costs energy)', line:`Twenty minutes of rhythm, no talking. Grace comes out with two coffees and doesn't say thank you because she doesn't have to. Main Street opens on time.`, fx:{ jordan:10, grace:4 }, energy:8 },
      { label:'Bring him a coffee', line:`He takes it without stopping. "You're alright," he says to the snow. From Jordan, a parade.`, fx:{ jordan:5 }, money:-5 },
    ]} },
  { key:'meilin_popup', where:'chinatown', days:[6], when:[660,840], once:'yearly', npc:'mei_lin',
    lines:[`Mei-Lin on a ladder on Mott Street, hanging photographs on a clothesline between two lampposts. "Pop-up. Forty years of this block. Nobody gave me a wall so I took the sky."`],
    choices:{ prompt:'Help?', options:[
      { label:'Hold the ladder, hand up prints', line:`An hour of "left — no, your left." When it's done the whole block stops to look up at itself. Mei-Lin, quietly: "That's the opening I wanted."`, fx:{ mei_lin:8, mrs_woo:3 } },
      { label:'Admire from below', line:`She catches you looking at the 1979 print of the teahouse. "Mrs. Woo's mother," she says. "Same apron." You stay until she climbs down.`, fx:{ mei_lin:4 } },
    ]} },
  { key:'ruin_stars', where:'lawn', weather:'sunny', when:[1320,1440], year:2, once:true, npc:'lena',
    lines:[`The Renwick ruin after ten, and Lena with a telescope, because of course. "Light pollution's terrible. But Saturn doesn't care. Look."`],
    choices:{ prompt:'Look?', options:[
      { label:'Look', line:`Rings. Actual rings, wobbling in the city glow like a coin on a table. You make a noise. Lena: "Yeah. That's the noise. Everyone makes that noise."`, fx:{ lena:8 } },
      { label:'"How did you get this out here?"', line:`"Tram. Two trips. A conversation with a conductor about optics that I won." She swings it to the moon for you anyway.`, fx:{ lena:5 } },
    ]} },
];

/* Shop hours (minutes; weekday indexes with Mon=0). Closed = can't enter. */
CS.SHOP_HOURS = {
  cafe:         { open:420,  close:1140, closed:[0] },
  glasshouse:   { open:420,  close:1080, closed:[0] },
  bakery:       { open:360,  close:900,  closed:[6] },
  market:       { open:480,  close:1260, closed:[] },
  thrift:       { open:720,  close:1140, closed:[1,2] },
  bar:          { open:960,  close:1560, closed:[0] },
  labs:         { open:540,  close:1320, closed:[5,6] },
  harbor_house: { open:540,  close:1320, closed:[] },
  bellinis:     { open:660,  close:1380, closed:[0] },
  teahouse:     { open:600,  close:1140, closed:[2] },
  mott:         { open:600,  close:1200, closed:[] },
  foodcourt:    { open:600,  close:1260, closed:[] },
  boba:         { open:660,  close:1320, closed:[] },
  wcafe:        { open:420,  close:1140, closed:[] },
  wflea:        { open:600,  close:1080, closed:[0,1,2,3,4] },
};

/* Weekday demand at the shipping bin (Mon=0). */
CS.MARKET_DAYS = {
  5: { type:'crop', mult:1.15, label:'Saturday greenmarket' },
  4: { type:'fish', mult:1.2,  label:'Friday fish' },
  6: { type:'meal', mult:1.2,  label:'Sunday brunch' },
};

/* Cook-off category by year (Street Food Festival). */
CS.COOKOFF = ['meal_salad', 'meal_roast', 'meal_galette', 'meal_pasta'];

/* Reply Day (Spring 14) door lines and Holiday Market invitations (texts on Winter 11). */
CS.REPLY_LINES = {
  maya: `Maya, still in scrubs, holding a tin like evidence. "Cookies. I baked at 3 AM. Don't ask what kind, I was mostly asleep." They're perfect.`,
  daniel: `Daniel with a labeled container: COOKIES (OATMEAL) (RECIPROCAL). "I put it on the calendar in winter. The calendar does not forget."`,
  lena: `Lena, holding a tin upside down. "Thermodynamically they're the same cookies either way." They are excellent either way.`,
  nico: `Nico with a bakery box that's clearly from Bellini's kitchen. "Zia made them. I supervised. Supervising counts."`,
  sofia: `Sofia with a tin AND a card signed by three students you've never met. "They heard about the chocolate. They wanted in."`,
  gabriel: `Gabriel, slightly out of breath: "Off shift, came straight here, cookies may be shift-adjacent." They are warm. He is blushing.`,
  theo: `Theo hands you a tin and a print of you opening your door, taken one second ago. "I had to." He did.`,
  avery: `Avery, tin in one hand, coffee in the other: "I'm not a morning person. I'm a cookie person. These are load-bearing."`,
  naomi: `Naomi, immaculate at 7 AM, a box tied with actual ribbon. "I billed nobody for these. Mark the date."`,
  arjun: `Arjun, shy, a tin wrapped in a Pier Labs napkin: "My mother's recipe. I told her who they were for. She had questions."`,
  priya: `Priya with a tin and a receipt. "Reciprocity, documented." She almost smiles, which is the real gift.`,
  jordan: `Jordan, no tin — a whole fence post of cookies balanced on a board. "Ma made extra." He leaves before you can say thank you.`,
  mei_lin: `Mei-Lin, a tin that is itself a small exhibition, labeled and dated. "Handle with care." She means the cookies. She also doesn't.`,
  mateo: `Mateo with a tin he clearly bought ten minutes ago and is honest about. "I had a trial. I have a tin. I'm here." That's the part that counts.`,
  grace: `Grace, on your doorstep for once instead of behind her counter. "Don't tell anyone I deliver." The tin is still hot.`,
  malik: `Malik with cookies and, inexplicably, a trowel. "Cookies. Also your gate latch is loose." He fixes it on the way out.`,
  ava: `Ava with a tin and a college brochure she forgot to leave at home. "Cookies! Also I might have made too many decisions this week." Both are welcome.`,
  nia: `Nia, a tin, and a cat she has brought "as a witness." The cookies are shaped like cats. The witness is unimpressed.`,
};
CS.HOLIDAY_INVITES = {
  maya: `holiday market tomorrow. I have the night off, which never happens. cider, lights, you. no speech required`,
  daniel: `proposal: holiday market, tomorrow, 5pm, we walk it end to end and rank every stall. yes this is a date with a spreadsheet`,
  lena: `the holiday market has a booth that sells hand-blown glass and I need someone to stop me. tomorrow night?`,
  nico: `market tomorrow night. I'll bring the good thermos. you bring the opinions. deal?`,
  sofia: `tomorrow night, holiday market, I know the cider guy. walk it with me?`,
  gabriel: `off tomorrow night for once. holiday market? I'll protect you from the eggnog`,
  theo: `the market at night is the best light of the year. come stand in it with me tomorrow?`,
  avery: `I designed the market banners so I'm contractually required to attend. tomorrow night. be my plus-one?`,
  naomi: `I have blocked tomorrow evening on my calendar as HOLIDAY MARKET (PERSONAL). that's for you. come?`,
  arjun: `I have never done a holiday market. tomorrow night, would you show me how it works?`,
  priya: `holiday market tomorrow. I evaluated the layout; the best stalls are at the south end. walk it with me?`,
  jordan: `market. tomorrow. 5. — J`,
  mei_lin: `the holiday market, tomorrow. I'd like to look at something that isn't behind glass, with you`,
  mateo: `no trial tomorrow (miracle). holiday market with me? I'll even eat`,
};
