/* =========================================================================
   Concrete Seasons — data/festivals.js
   The festival calendar and its flavor lines.
   ========================================================================= */
/* Festivals — optional `attendees` restricts who shows up; `where` is the map it happens on */
CS.FESTIVALS = {
  cherry: { name:'Cherry Blossom Picnic', season:0, day:15, start:600, end:960,
            blurb:'South Point lawn, blankets, everyone you know.' },
  night_market: { name:'Night Market', season:1, day:8, start:1080, end:1440,
            blurb:'Main Street stalls after dark. Sell what you grew — prices run hot.' },
  harbor_lights: { name:'Harbor Lights', season:1, day:24, start:1140, end:1440,
            blurb:'Fireworks over the East River. Bring someone, or just bring yourself.' },
  street_food: { name:'Street Food Festival', season:2, day:12, start:600, end:1080,
            blurb:'Main Street smells incredible. Stall prices run hot all day.' },
  holiday_market: { name:'Holiday Market', season:3, day:12, start:960, end:1380,
            blurb:'String lights, hot drinks, and stalls on Main Street.' },
  lunar_new_year: { name:'Lunar New Year', season:3, day:25, start:600, end:1380, where:'chinatown',
            attendees:['mei_lin','maya','daniel','lena','sofia','mateo','avery','naomi'],
            blurb:'Lion dances and lanterns on Mott Street. Take the tram in — flowers and pastries sell like crazy.' },
};

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

/* ---------------- more festivals ---------------- */
Object.assign(CS.FESTIVALS, {
  halloween: { name:'Halloween on Main', season:2, day:28, start:1080, end:1440,
    blurb:'Costumes, porch candy, and Malik\'s "scary" scarecrow that fools no one.' },
  friendsgiving: { name:'Friendsgiving', season:2, day:26, start:960, end:1320, where:'harbor_house',
    blurb:'Harbor House, long tables, everyone brings a dish. Mateo brings four.' },
  nye: { name:'New Year\'s Eve', season:3, day:30, start:1140, end:1560,
    blurb:'The waterfront at midnight. The whole island counts down together.' },
});
Object.assign(CS.FESTIVAL_LINES, {
  halloween: [
    "Nia's costume is 'ferry captain.' It's mostly a hat. It's perfect.",
    "Grace hands out full-size rolls instead of candy. Legend status: secured.",
    "Someone dressed as the tram. The tram, if it could, would be honored.",
  ],
  friendsgiving: [
    "Three kinds of stuffing, zero consensus, one perfect evening.",
    "Mateo cooked for forty. There are maybe twenty people here. Leftovers are a love language.",
    "Malik gives the same toast every year. Everyone mouths along. Nobody would change a word.",
  ],
  nye: [
    "Resolutions get shouted over the wind. The river keeps all of them.",
    "Somebody brought sparklers. Somebody always brings sparklers.",
    "Ten minutes to midnight and the whole island is on the promenade.",
  ],
});

/* ---------------- new festivals ---------------- */
Object.assign(CS.FESTIVALS, {
  open_streets: { name:'Open Streets', season:0, day:8, start:540, end:1020,
    blurb:'Main Street closes to everything but people. Chalk, folding chairs, someone\'s trumpet.' },
  marathon: { name:'Marathon Weekend', season:2, day:5, start:540, end:960,
    blurb:'The route passes the island. Cheer station on Main Street — runners buy anything cold.' },
  movie_night: { name:'Movie Night on the Lawn', season:1, day:18, start:1140, end:1440,
    blurb:'A bedsheet screen, a borrowed projector, the whole island on blankets.' },
});
Object.assign(CS.FESTIVAL_LINES, {
  open_streets: [
    "A kid is teaching Malik a scooter trick. Malik is taking notes. Actual notes.",
    "The street without cars sounds like what the neighborhood must have sounded like first.",
  ],
  marathon: [
    "Runner 4,116 just high-fived the entire cheer station. We're all crying. It's fine.",
    "Grace hands out water cups like it's a bread line. Precision. Grace under pressure.",
  ],
  movie_night: [
    "The projector's crooked, the sound is mostly wind, and nobody would fix a single thing.",
    "Somewhere in the second act, half the lawn is watching the skyline instead. Same movie, really.",
  ],
});

/* ---------------- quiet calendar days (no gathering; game logic reacts) ---------------- */
Object.assign(CS.FESTIVALS, {
  valentine: { name:'Valentine\'s Day', season:3, day:14, start:360, end:1440, quiet:true,
    blurb:'Give a Chocolate Box (Corner Market) to anyone you like. They remember — Spring 14 they come by.' },
  reply_day: { name:'Reply Day', season:0, day:14, start:360, end:1440, quiet:true,
    blurb:'Everyone you gave chocolate last winter finds your door this morning.' },
  perseids: { name:'Perseids', season:1, day:21, start:1260, end:1440, quiet:true,
    blurb:'Meteor shower over the south lawn after nine — if the sky is clear, make a wish.' },
});
