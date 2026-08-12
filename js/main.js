/* =========================================================================
   Concrete Seasons — main.js
   Boot + requestAnimationFrame loop.
   ========================================================================= */
(function () {
  CS.engine.init();
  CS.ui.renderMenu();

  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame); // schedule first so an error can never kill the loop
    const dt = Math.min(50, now - last);
    last = now;
    const S = CS.game.state();
    if (S && document.getElementById('screen-game').classList.contains('active')) {
      try {
        CS.game.tick(dt);
        CS.engine.render(S);
      } catch (e) {
        console.error('frame error:', e);
      }
    }
  }
  requestAnimationFrame(frame);

  // save on tab close / background (mobile-friendly)
  document.addEventListener('visibilitychange', () => {
    const S = CS.game.state();
    if (document.visibilityState === 'hidden' && S) CS.game.saveToSlot(S.slot);
  });

  // offline support (PWA); no-op on file:// or unsupported browsers
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
