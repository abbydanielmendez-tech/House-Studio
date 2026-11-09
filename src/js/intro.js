/* HOUSE-STUDIO · CARGA Y ESCENA CON OBJETOS CSS 3D
   DURACION: tiempo mínimo de la secuencia visual; no es un medidor de bytes.
   El contador avanza de 0 a 99 y solo llega a 100 al preparar los recursos.
   Las imágenes con error o espera agotada usan respaldo y no bloquean la web.
   Los casetes tienen seis caras CSS: se arrastran a la videograbadora (o se activan con clic, toque o teclado)
   para cambiar el canal de la tele; la lámpara alterna el modo noche. */
(() => {
    'use strict';
    const dialog = document.querySelector('#studio-intro');
    if (!dialog || typeof dialog.showModal !== 'function') return;
    const stage = dialog.querySelector('.intro-stage');
    const room = dialog.querySelector('.intro-room');
    const enter = dialog.querySelector('.intro-enter');
    const skip = dialog.querySelector('.intro-skip');
    const status = dialog.querySelector('.intro-status');
    const progress = dialog.querySelector('[role="progressbar"]');
    const fill = dialog.querySelector('.intro-progress-fill');
    const percent = dialog.querySelector('.intro-percent');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const DURACION = 5000; // Cambiá este número para ajustar la duración, en milisegundos.
    let entered = false;
    let leaving = false, assetsReady = false, ready = false, failed = false;
    let frame = 0, pointerFrame = 0, start = null, value = -1;
    const timers = [], disposers = [];
    const cassettes = [...dialog.querySelectorAll('.intro-cassette')];
    function later(fn, ms) { const id = setTimeout(fn, ms); timers.push(id); return id; }
    function updateProgress(next) {
        if (next === value) return;
        value = next;
        percent.textContent = `${next}%`;
        progress.setAttribute('aria-valuenow', String(next));
        fill.style.width = `${next}%`;
    }
    function resetPerspective() {
        cancelAnimationFrame(pointerFrame);
        stage.style.setProperty('--scene-x', '0deg');
        stage.style.setProperty('--scene-y', '0deg');
        stage.style.setProperty('--px', '0');
        stage.style.setProperty('--py', '0');
    }
    function finish() {
        cancelAnimationFrame(frame); cancelAnimationFrame(pointerFrame);
        timers.forEach(clearTimeout); disposers.forEach(dispose => dispose());
        if (dialog.open) dialog.close();
        window.dispatchEvent(new CustomEvent("house:entered", { detail: { typewriter: entered } }));
        const heading = document.querySelector('main h1');
        if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    }
    function leave(animate = true) {
        if (leaving) return;
        leaving = true;
        resetPerspective();
        if (!animate || motion.matches) { finish(); return; }
        dialog.classList.add('is-entering');
        later(finish, 1150);
    }
    skip.addEventListener('click', () => leave(false));
    // Protección doble: disabled en HTML y condición en JavaScript.
    enter.addEventListener('click', () => { if (ready && value === 100) { entered = true; leave(); } });
    dialog.addEventListener('cancel', event => { event.preventDefault(); leave(false); });
    dialog.showModal();
    updateProgress(0);
    skip.focus({ preventScroll: true });
    function resource(image) {
        return new Promise(resolve => {
            let settled = false;
            function done() {
                if (settled) return;
                settled = true;
                if (!image.complete || image.naturalWidth === 0) failed = true;
                image.removeEventListener('load', done); image.removeEventListener('error', done);
                resolve();
            }
            image.addEventListener('load', done, { once: true });
            image.addEventListener('error', done, { once: true });
            disposers.push(done);
            if (image.complete) done();
            later(done, 8000);
        });
    }
    const images = [room].filter(Boolean);
    Promise.all(images.map(resource)).then(() => { assetsReady = true; });
    // Animación continua: el 100 se pinta antes de habilitar el botón.
    function tick(now) {
        if (leaving) return;
        if (start === null) start = now;
        const elapsed = now - start;
        const next = Math.min(99, Math.floor(elapsed / DURACION * 100));
        updateProgress(next);
        if (elapsed >= DURACION && assetsReady) {
            updateProgress(100);
            later(() => {
                if (leaving) return;
                ready = true;
                enter.disabled = false;
                enter.textContent = 'CLIC PARA ENTRAR';
                status.textContent = failed ? 'ESTUDIO LISTO · ALGÚN RECURSO NO ESTÁ DISPONIBLE' : 'SEÑAL LISTA · BIENVENIDO A HOUSE-STUDIO';
                dialog.classList.add('is-ready');
            }, 200);
            return;
        }
        frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    // Perspectiva sutil del escritorio. Solo se escucha dentro de la intro.
    dialog.addEventListener('pointermove', event => {
        if (leaving || motion.matches || event.pointerType !== 'mouse') return;
        cancelAnimationFrame(pointerFrame);
        pointerFrame = requestAnimationFrame(() => {
            const bounds = dialog.getBoundingClientRect();
            const nx = event.clientX / bounds.width - .5, ny = event.clientY / bounds.height - .5;
            stage.style.setProperty('--scene-x', `${(-ny * 2.6).toFixed(2)}deg`);
            stage.style.setProperty('--scene-y', `${(nx * 3.4).toFixed(2)}deg`);
            stage.style.setProperty('--px', nx.toFixed(3));   // parallax de lluvia, polvo, resplandor y casetes
            stage.style.setProperty('--py', ny.toFixed(3));
        });
    });
    dialog.addEventListener('pointerleave', resetPerspective);
    motion.addEventListener('change', resetPerspective);
    disposers.push(() => motion.removeEventListener('change', resetPerspective));
    /* ---------- Interacción con el escritorio ----------
       · Arrastrá un casete a la ranura de la videograbadora (o tocalo / Enter): la tele cambia de canal.
       · La lámpara alterna el modo noche. · Lluvia y polvo se mueven con el mouse. */
    const screen = dialog.querySelector('.intro-screen');
    const playLabel = dialog.querySelector('.intro-play');
    const channelLabel = dialog.querySelector('.intro-ch');
    const tagline = dialog.querySelector('.intro-tagline');
    const vcr = dialog.querySelector('.intro-vcr');
    const lamp = dialog.querySelector('.intro-lamp');
    const dust = dialog.querySelector('.intro-dust');
    const cassetteBox = dialog.querySelector('.intro-cassettes');
    const defaultTagline = tagline ? tagline.textContent : '';
    let busy = false, dragged = false;

    lamp?.addEventListener('click', () => {
        const on = lamp.getAttribute('aria-pressed') !== 'true';
        lamp.setAttribute('aria-pressed', String(on));
        dialog.classList.toggle('lamp-off', !on);
    });
    // Polvo flotante: partículas a distintas profundidades (z) para el parallax.
    if (dust && !motion.matches) {
        for (let i = 0, n = innerWidth < 700 ? 8 : 18; i < n; i++) {
            const mote = document.createElement('i');
            mote.style.cssText = `--x:${(8 + Math.random() * 84).toFixed(1)}%;--y:${(6 + Math.random() * 80).toFixed(1)}%;` +
                `--s:${(.14 + Math.random() * .3).toFixed(2)};--o:${(.18 + Math.random() * .4).toFixed(2)};` +
                `--z:${(.3 + Math.random() * 1.2).toFixed(2)};--t:${(5 + Math.random() * 7).toFixed(1)}s`;
            dust.append(mote);
        }
    }
    // Los px de pantalla se convierten a px locales (el escenario está escalado e inclinado).
    const unitScale = () => (cassetteBox && cassetteBox.offsetWidth ? cassetteBox.getBoundingClientRect().width / cassetteBox.offsetWidth : 1);
    const number = (button, name) => parseFloat(button.style.getPropertyValue(name)) || 0;
    function overDrop(event) {
        return [vcr, screen].some(target => {
            if (!target) return false;
            const r = target.getBoundingClientRect(), m = 26;
            return event.clientX > r.left - m && event.clientX < r.right + m && event.clientY > r.top - m && event.clientY < r.bottom + m;
        });
    }
    function setChannel(button) {
        const name = button.querySelector('.tape-front b').textContent;
        const num = button.querySelector('.tape-front small').textContent;
        const color = button.style.getPropertyValue('--tape').trim();
        if (playLabel) playLabel.textContent = '▶ PLAY';
        if (channelLabel) channelLabel.textContent = `CH ${num} ${name}`;
        if (tagline) tagline.textContent = button.dataset.info || defaultTagline;
        if (color) { screen.style.setProperty('--tint', color); stage.style.setProperty('--glow-color', color); }
        screen.classList.remove('is-switching'); void screen.offsetWidth; screen.classList.add('is-switching');
        later(() => screen.classList.remove('is-switching'), 600);
        cassettes.forEach(other => {
            other.classList.toggle('is-playing', other === button);
            other.setAttribute('aria-pressed', String(other === button));
        });
    }
    // El casete vuela a la ranura, la tele cambia de canal y el casete vuelve a su sitio.
    function insertCassette(button) {
        if (busy || leaving || !vcr) return;
        busy = true;
        const scale = unitScale();
        const r = button.getBoundingClientRect(), slot = vcr.getBoundingClientRect();
        const baseX = r.left + r.width / 2 - number(button, '--dx') * scale;
        const baseY = r.top + r.height / 2 - number(button, '--dy') * scale;
        button.classList.remove('is-dragging');
        button.classList.add('is-flying');
        button.style.setProperty('--dx', `${(slot.left + slot.width / 2 - baseX) / scale}px`);
        button.style.setProperty('--dy', `${(slot.top + slot.height / 2 - baseY) / scale}px`);
        dialog.classList.add('has-played');
        later(() => setChannel(button), 520);
        later(() => {
            button.classList.remove('is-flying');
            button.style.removeProperty('--dx'); button.style.removeProperty('--dy');
            busy = false;
        }, 1250);
    }
    cassettes.forEach(button => {
        let drag = null;
        function finish(event, drop) {
            if (!drag || event.pointerId !== drag.id) return;
            const moved = drag.moved; drag = null;
            dialog.classList.remove('is-dragging'); vcr?.classList.remove('is-hot');
            if (!moved) return;                           // fue un clic: lo resuelve el evento click
            dragged = true; later(() => { dragged = false; }, 0);
            button.releasePointerCapture?.(event.pointerId);
            button.classList.remove('is-dragging'); button.style.removeProperty('--drag-rz');
            if (drop && overDrop(event)) insertCassette(button);
            else { button.style.removeProperty('--dx'); button.style.removeProperty('--dy'); }
        }
        button.addEventListener('pointerdown', event => {
            if (event.button !== 0 || busy || leaving) return;
            drag = { id: event.pointerId, x: event.clientX, y: event.clientY, last: event.clientX, moved: false };
        });
        button.addEventListener('pointermove', event => {
            if (!drag || event.pointerId !== drag.id) return;
            const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
            if (!drag.moved) {
                if (Math.hypot(dx, dy) < 7) return;
                drag.moved = true; button.setPointerCapture?.(event.pointerId);
                button.classList.add('is-dragging'); dialog.classList.add('is-dragging');
            }
            const scale = unitScale();
            button.style.setProperty('--dx', `${dx / scale}px`);
            button.style.setProperty('--dy', `${dy / scale}px`);
            button.style.setProperty('--drag-rz', `${Math.max(-18, Math.min(18, (event.clientX - drag.last) * .8))}deg`);
            drag.last = event.clientX;
            vcr?.classList.toggle('is-hot', overDrop(event));
        });
        button.addEventListener('pointerup', event => finish(event, true));
        button.addEventListener('pointercancel', event => finish(event, false));
        // Clic, toque o Enter/Espacio: reproduce directamente.
        button.addEventListener('click', () => { if (!dragged) insertCassette(button); });
    });
})();
