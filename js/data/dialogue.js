/* =========================================================================
   Concrete Seasons — data/dialogue.js
   All spoken words: dialogue pools, texts, festival/date/married lines.
   ========================================================================= */
(function () {
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

/* merge arc dialogue into the cast */
for (const id of Object.keys(ARC_POOLS)) {
  CS.DIALOGUE[id].pools.push(...ARC_POOLS[id]);
}

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

/* ---------------- cohabitation lines ---------------- */
CS.COHAB_LINES = [
  "Two toothbrushes in the cup. Neither of you has mentioned it. Both of you have noticed.",
  "\"I fixed the radiator rattle while you were out. It only took three curses. We live here.\"",
  "Their books colonized the second shelf this week. You reorganized nothing. It looks right.",
];

})();
