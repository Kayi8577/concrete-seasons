# Friends of Mineral Town — system study (source: fogu.com/hm5, read-through 2026-08)

Reference for porting ideas into Concrete Seasons. Numbers are FoMT's; adapt, don't copy.

## Event architecture (the big lesson)
- **Everything triggers by PLACE + TIME WINDOW + WEEKDAY + WEATHER + relationship**, never "after a chat".
  Heart events: e.g. Doctor black heart = Clinic, Mon/Thu/Sat, 9am–4pm. Blue heart also needs largest rucksack.
- Heart colors: black→purple→blue→green→yellow→orange→red (7). Marriage needs the 4 events (black/purple/blue/yellow),
  max house, big bed, Blue Feather (appears in shop at orange), proposal at red; wedding a week later, whole day, skips festivals.
- ~60 **random events** (walk-in vignettes): Stu's fever (Ellen's house, Wed 10–1, escort to clinic, time jumps to 3pm, +friendship all),
  Drunken Battle (Inn, Sun 7:30–10pm, Karen vs Duke, you judge, walk Duke home), Life Consultant (Rose Sq 1–4pm, good weather, 3 women gossip),
  Golden Service (Won's shop, Karen walks in), Shopping Spree (rainy Thu/Fri 2–4 at Jeff's), Cooking School (Anna, 5 Saturdays, 5 recipes),
  Gotz's Bad Mood (summer, refuses work until gifted to max friendship — locks upgrades), Zack's crush (Y4, Poultry Sun 11–1),
  White Flower (Y5+ summer, Ellen 1–4pm → fetch flower on summit 9pm–midnight), Shooting Star (Y5 Fall 10, clear, 6pm+, every 5 years:
  wish = heal all animals / +friendship all / DOUBLE shipping tomorrow), Friday 13th & 4:44 TV glitches (pure flavor), Power Outage (can't sleep till it's back),
  Bad Dreams (NYE after 9pm, 3 surreal dreams), Animal Funeral (church, scolding if neglect).
- **Neglect consequences**: Cliff LEAVES TOWN Winter 29 Y1 unless you invited him to the Fall 15 wine harvest (Duke then hires him permanently);
  horse reclaimed if <5 hearts at maturity; spouse falls ill if ignored 10 days; animals sicken → die.
- Year gating: Y1-only events (Won/Kai arrive, Cliff), Y2+, Y3+, Y4+, Y5+ chains (Joanna phonecalls, Ellen's visitor).
- Rival romance: 4 rival events at black/blue/green(Y2+)/orange(Y4+); all 4 → NPC marries rival; you get invited if friends. Red heart locks them to you.

## Festivals (participatory, with stakes)
- Spring 1 New Year: rice cakes fill every empty slot. Spring 14 Thanksgiving: bachelors you gave chocolate on Winter 14 come to YOUR door
  sequentially with cookies (Kai mails his); first time = Ring #1. Winter 14 Valentine: give chocolate (100G, +100G wrap) to ANY man.
- Spring 18/Fall 18 Horse race (bet medals → 900 medals = Power Berry). Spring 22 Cooking Festival: category announced (Y1 juice, Y2 sweets,
  Y3 bread, Y4 noodles, Y5+ random); plain recipe not enough — enhance with honey etc; judge's backdrop hints result; no prize but cheers.
- Summer 1 Beach Day: dog frisbee contest (2 throws, distance threshold, dog must be adult) → Power Berry.
- Summer 7 Chicken / Summer 20 Cow / Fall 21 Sheep festivals: enter best animal; win → Gold products next day.
- Summer 24 Fireworks: invite ≥green heart → watch from dock together, +affection; ends next morning.
- Fall 3 Music Festival: Carter invites Fall 2; you PLAY ocarina with villagers at church 6pm.
- Fall 9 Harvest Festival: Thomas announces on the 8th; bring ANY edible → communal soup; good item = delicious, junk = everyone complains.
- Fall 13 Moon viewing: ≥green heart → highest-affection bachelor waits on summit 6pm–midnight; watch moonrise, +affection, wake 6am.
- Fall 30 Pumpkin Day: May 6am, Stu 8am, Popuri 10am come to your door for chocolate; wrong item = upset.
- Winter 24 Starry Night: on the 23rd Thomas brings invitations from every ≥green heart bachelor; pick ONE; dinner at your house; Ring #2 first time.
- Winter 30 NYE: EITHER feast at Rose Plaza 6pm (noodles fill bag) OR midnight sunrise on Mother's Hill (no gift, communal). Can't do both.

## Stamina
- Strength 150 (+10 per Power Berry to 250) and hidden Fatigue 100. Tools cost strength; fatigue only rises once strength is empty,
  BUT accelerates in rain/snow, after 10pm, poison mushrooms. Turn blue at 0 → rest at clinic / hot spring / bed / food.
- Recovery: hot spring (free, time), bathroom upgrade (30 min), food (more ingredients = more), flowers in vase buff recovery, fireplace in winter.
- Clinic sells energy drinks (500G) → better drinks unlock by shipping grass.

## Economy / shops
- Shops have weekly closed days + hours (Jeff closed Sun/Tue 9–5; Blacksmith closed Thu; Clinic closed Wed; Yodel closed Mon; Winery 10–12 only; Kai's beach shack summer only).
- Zack ships at 5pm. Won (girl version) pays slightly more, buys things Zack won't, price varies per ask and by WEEKDAY demand; Won's scams & apple-shuffle minigame (100G, lottery tickets → records worth 80k–170k).
- Tools: usage meter → upgrade at blacksmith (copper/silver/gold/mystrile, 1–7 days away), cursed (lake mine, huge stamina) → blessed → mythic. Charged use = hold button.
- House: upgrade 1 (3000G+200 lumber), 2 (10000G+700), then bathroom 30000G, window/mailbox/doghouse cosmetics 10–25k. Lumber from stumps (6/day) or carpenter 50G.
- TV: weather / news (upcoming events) / farm tips / variety by weekday (Tue = new recipe weekly, Sat = TV Shopping: kitchen 4000G, utensils, Power Berry 10000G).
- Cooking: 108 recipes; learn via TV, villagers (swap food), experimenting; wrong combo = burnt goo. Each new recipe = 10 Cooking points.
- Animals: chicken 1500G (eggs S/M/L by hearts 0–3/4–7/8–10; Gold after festival; 3 days nest → chick, +1 week adult; pick up to raise hearts;
  sick = skull icon, medicine 1000G or dies; lifespan 3–4y), cow 5000G / sheep 4000G (milk S/M/L 100/150/200; miracle potion 3000G, 20-day pregnancy; brush/talk daily).
- Dog (wild-dog guard, ball 100G, frisbee 5000G beach-only), horse (saddlebag = portable shipping bin; race entry).
- Mine: 255 floors each (Spring mine; Lake mine only winter when frozen); hidden stairs found by hoe; winter loop staple. Power Berries on floors 19/100.
- Farm Degree: 10 categories × 1000 pts (shipping, fishing, animals, villagers, cooking, building, equipment, letters, events, heroine). 10,000 = completion.

## Villagers
- Every NPC has birthday + loved/liked list; non-marriageable ones still have friendship-gated unlocks (recipes, shop access, events).
- Kai exists only in summer (beach shack). Won arrives Spring Y1 as a traveling merchant. Goddess: toss farm food in pond; 10 days → Power Berry;
  day 21 she asks who you like → +affection. Kappa: cucumbers 10 days → Special berry.
- Seven collectible rings (Thanksgiving, Starry Night, mail, wedding, spouse birthday, 10th anniversary, 10M steps) — collection only.
- Spouse: working or homebody; never helps farm; cooks on your birthday and asks whose birthday it is; Starry Night family cooks for you.

## What Concrete Seasons already covers (v27)
fishing + memo, power berries (bagels), forecast (phone), storms, harvest sprites (volunteers), perfect harvest, hearts in dialogue,
tool/can upgrades, beehive, race betting (marathon), birthdays + triple gifts, 28 heart events (talk-triggered), passing out,
NPC↔NPC romance sim + weddings, player marriage/kids, Y2–Y5 arcs, 14 festivals (mostly attend/sell), per-line portraits + emotes, 21 enterable interiors.

## Gaps worth porting (ranked for an NYC cozy sim)
1. Heart events gated by PLACE + TIME (not just talk) + ~15 walk-in random events with weekday/weather/time windows.
2. Participatory festivals: potluck (bring dish → quality outcome), cook-off with yearly category, day-before invitations you choose ONE of, NYE either/or, performing.
3. Reciprocal gift days: Valentine → reply-day visitors at your door; Halloween kids at your door on a schedule.
4. Neglect consequences: an NPC who leaves in Y1 unless included; spouse/pet sick when ignored.
5. Fatigue modifiers: rain/late-night energy penalty; umbrella; bath house; decor buffs.
6. Shooting-star wish (double sale day / +friendship all). Market-day demand (weekday price bumps).
7. Shop closed days/hours (currently everything always open → town feels static).
8. Rooftop chickens (eggs by affection, carry to raise hearts, sickness, show). Minigames (shell game, hi-low).
9. Ledger/degree scoreboard across categories. Mine/winter loop (tone mismatch — find an urban winter loop instead).
