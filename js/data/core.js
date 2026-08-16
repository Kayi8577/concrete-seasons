/* =========================================================================
   Concrete Seasons — data/core.js
   Namespace, constants, calendar math, palettes, weather tables.
   ========================================================================= */
/* =========================================================================
   Concrete Seasons — data.js
   All static, data-driven content: maps, crops, items, NPCs, schedules,
   dialogue pools, festivals-to-come. Everything offline & authored.
   ========================================================================= */
window.CS = window.CS || {};

CS.SAVE_VERSION = 2;
CS.SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'];
CS.WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
CS.DAY_START = 360;      // 6:00
CS.DAY_END   = 1560;     // 2:00 next day
CS.MIN_PER_TICK = 1;

/* ---------------- Appearance options ---------------- */
CS.SKINS   = ['#f6d7b8', '#e8b98a', '#c68a52', '#8d5a33'];
CS.HAIRS   = ['#2d2a26', '#5b3a1e', '#a0632a', '#c9a24b', '#8a8a8a'];
CS.OUTFITS = ['#5c8a6f', '#4a6fa5', '#b0653a', '#7d5ba6', '#c74f6d'];

CS.dayOf = (year, season, day) => (year - 1) * 120 + season * 30 + (day - 1);

/* ---------------- Weather (per season) ---------------- */
CS.WEATHER_TABLE = {
  0: [['sunny', .50], ['cloudy', .25], ['rain', .25]],   // spring
  1: [['sunny', .65], ['cloudy', .20], ['rain', .15]],   // summer
  2: [['sunny', .45], ['cloudy', .30], ['rain', .25]],   // fall
  3: [['sunny', .35], ['cloudy', .30], ['snow', .35]],   // winter
};

/* ---------------- Energy costs ---------------- */
CS.COSTS = { till:3, plant:1, water:1, harvest:2, fish:4 };
CS.RENT = 120;
CS.START_MONEY = 400;
