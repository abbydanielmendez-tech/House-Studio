/* MEDIDOR DE FPS · solo aparece si abrís la página con ?fps (por ejemplo http://localhost:3000/?fps).
   Muestra fotogramas por segundo, el peor fotograma y cuántos tardaron más de 33 ms.
   Para un diagnóstico completo usá DevTools → Rendimiento (Performance) mientras hacés scroll. */
(() => {
    'use strict';
    if (!/[?&]fps\b/.test(location.search)) return;
    const box = document.createElement('div');
    box.setAttribute('aria-hidden', 'true');
    box.style.cssText = 'position:fixed;left:10px;top:10px;z-index:99999;padding:8px 10px;background:#000c;color:#9ff;' +
        'font:600 12px/1.5 monospace;border-radius:8px;pointer-events:none;white-space:pre';
    document.body.append(box);
    let last = performance.now(), start = last, frames = 0, worst = 0, jank = 0;
    function loop(now) {
        const gap = now - last; last = now; frames++;
        if (gap > worst) worst = gap;
        if (gap > 33.4) jank++;
        if (now - start >= 500) {
            box.textContent = `${Math.round(frames * 1000 / (now - start))} fps\npeor fotograma: ${worst.toFixed(0)} ms\ntardaron >33 ms: ${jank}`;
            start = now; frames = 0; worst = 0;
        }
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
})();
