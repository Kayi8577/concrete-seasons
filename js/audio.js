/* =========================================================================
   Concrete Seasons — audio.js
   Procedural sound: no audio files, fully offline. WebAudio synthesis —
   a soft chord pad keyed to time of day, filtered-noise ambience that
   follows weather and indoors/outdoors, and sparse pentatonic plinks.
   Starts on first user gesture (mobile autoplay rules).
   ========================================================================= */
(function () {
  const AU = CS.audio = {};
  let ctx = null, master, padGain, ambGain, noiseFilter, plinkGainBus;
  const padOsc = [];
  let unlocked = false, chordTimer = null, plinkTimer = null;

  const MASTER_LEVEL = 0.16;

  function ensure() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    padGain = ctx.createGain(); padGain.gain.value = 0.42; padGain.connect(master);
    ambGain = ctx.createGain(); ambGain.gain.value = 0.3; ambGain.connect(master);
    plinkGainBus = ctx.createGain(); plinkGainBus.gain.value = 0.5; plinkGainBus.connect(master);

    // looped noise → river / wind / rain, shaped by a filter
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf; noise.loop = true;
    noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass'; noiseFilter.frequency.value = 320; noiseFilter.Q.value = 0.4;
    noise.connect(noiseFilter); noiseFilter.connect(ambGain);
    noise.start();

    // three slow voices for the pad
    for (let i = 0; i < 3; i++) {
      const o = ctx.createOscillator();
      o.type = i === 0 ? 'triangle' : 'sine';
      const g = ctx.createGain(); g.gain.value = 0;
      o.connect(g); g.connect(padGain);
      o.start();
      padOsc.push({ o, g });
    }
    scheduleChord();
    schedulePlink();
  }

  /* chord roots by daypart — lydian-ish and unhurried */
  const ROOTS = {
    morning: [220.0, 246.94, 293.66, 329.63],
    day:     [196.0, 220.0, 261.63, 293.66],
    evening: [174.61, 196.0, 233.08, 261.63],
    night:   [146.83, 164.81, 196.0, 220.0],
  };
  function daypart() {
    const S = CS.game.state();
    if (!S) return 'day';
    const m = S.time.minutes % 1440;
    if (m < 600) return 'morning';
    if (m < 1020) return 'day';
    if (m < 1260) return 'evening';
    return 'night';
  }

  function scheduleChord() {
    if (!ctx) return;
    const roots = ROOTS[daypart()];
    const root = roots[Math.floor(Math.random() * roots.length)];
    const freqs = [root * .5, root * .75, root]; // low root, fifth below, root
    const t = ctx.currentTime;
    padOsc.forEach((v, i) => {
      v.o.frequency.linearRampToValueAtTime(freqs[i], t + 2);
      v.g.gain.cancelScheduledValues(t);
      v.g.gain.linearRampToValueAtTime(0.10 - i * 0.02, t + 3.5);
      v.g.gain.linearRampToValueAtTime(0.05 - i * 0.01, t + 8.5);
    });
    chordTimer = setTimeout(scheduleChord, 9000 + Math.random() * 4000);
  }

  const PENTA = [392.0, 440.0, 523.25, 587.33, 659.26, 784.0];
  function schedulePlink() {
    if (!ctx) return;
    const S = CS.game.state();
    let wait = 4500 + Math.random() * 6000;
    if (S) {
      const fest = CS.game.currentFestival && CS.game.currentFestival();
      if (fest) wait *= 0.55;                       // festivals sparkle more
      if (daypart() === 'night') wait *= 1.8;       // nights stay quiet
    }
    plinkTimer = setTimeout(() => {
      if (ctx && master.gain.value > 0.001) {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = PENTA[Math.floor(Math.random() * PENTA.length)];
        const g = ctx.createGain();
        const t = ctx.currentTime;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.055, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
        o.connect(g); g.connect(plinkGainBus);
        o.start(t); o.stop(t + 1.5);
      }
      schedulePlink();
    }, wait);
  }

  /* called from the main loop about once a second */
  AU.update = function (state) {
    if (!ctx || !unlocked) return;
    const on = state.settings.sound !== false;
    const t = ctx.currentTime;
    const targetMaster = on ? MASTER_LEVEL : 0;
    master.gain.linearRampToValueAtTime(targetMaster, t + 0.8);
    if (!on) return;
    // ambience follows weather and walls
    const indoor = !CS.MAPS[state.playerRT.scene].outdoor;
    let freq = 320, amb = 0.3;
    if (state.weather.today === 'rain') { freq = 1400; amb = 0.5; }
    else if (state.weather.today === 'snow') { freq = 220; amb = 0.18; }
    if (indoor) { freq *= 0.45; amb *= 0.45; }
    noiseFilter.frequency.linearRampToValueAtTime(freq, t + 1.2);
    ambGain.gain.linearRampToValueAtTime(amb, t + 1.2);
  };

  AU.unlock = function () {
    if (unlocked) return;
    ensure();
    if (!ctx) return;
    ctx.resume && ctx.resume();
    unlocked = true;
  };

  AU.setEnabled = function (on) {
    const S = CS.game.state();
    if (S) S.settings.sound = on;
    if (ctx && master) {
      master.gain.linearRampToValueAtTime(on ? MASTER_LEVEL : 0, ctx.currentTime + 0.5);
    }
  };
})();
