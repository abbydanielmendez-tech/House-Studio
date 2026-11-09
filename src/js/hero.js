/* HOUSE-STUDIO · HERO (video de fondo) + capa de movimiento con anime.js
   Qué hace este archivo:
     · video de fondo: elige la versión liviana en pantallas chicas, no se carga con "ahorro de
       datos" ni con reducir movimiento (queda el póster), se pausa fuera de pantalla y con la
       pestaña oculta, y frena suavemente en los extremos del vaivén (ida y vuelta)
     · entrada (después de la intro del televisor): video → cabecera → cifras (con cuenta
       ascendente) → botón y descripción → tarjeta
     · tarjeta de proyectos: cambia sola cada 6 s (imagen, nombre, contador y barra de progreso);
       la barra se pausa con el mouse encima, con la pestaña oculta y con el hero fuera de pantalla
     · integración con el scroll: el video se desplaza más lento, crece un poco y se oscurece hasta
       el negro de la sección siguiente; la interfaz sube y se desvanece
   Movimiento: usa anime.js (npm i animejs → gulpfile lo agrega al paquete) y, si no estuviera, cae a
   la Web Animations API del navegador: el hero se ve y funciona igual. Expone window.HSMotion
   ({ tween, count }) para animar otras partes del sitio con la misma capa.
   Todo se anima con transform/opacity (solo compositor). */
(() => {
    'use strict';
    const hero = document.querySelector('.hero-poster');
    if (!hero) return;
    const root = document.documentElement;
    const $ = selector => hero.querySelector(selector);
    const $$ = selector => [...hero.querySelectorAll(selector)];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const calm = () => reduce.matches && root.dataset.motion !== 'on';   // el portafolio fija data-motion="on"
    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

    /* ---------- 1. Capa de movimiento: anime.js v4 si está, Web Animations si no ---------- */
    const lib = window.anime && typeof window.anime.animate === 'function' ? window.anime : null;
    const EASE_CSS = {
        outExpo: 'cubic-bezier(.16,1,.3,1)', outQuart: 'cubic-bezier(.25,1,.5,1)', outCubic: 'cubic-bezier(.33,1,.68,1)',
        inOutQuad: 'cubic-bezier(.45,0,.55,1)', inQuad: 'cubic-bezier(.55,.085,.68,.53)', linear: 'linear',
    };
    const ANIME_PROP = { x: 'translateX', y: 'translateY', scale: 'scale', scaleX: 'scaleX', rotate: 'rotate', opacity: 'opacity' };
    const last = value => (Array.isArray(value) ? value[value.length - 1] : value);
    const inert = { pause() {}, play() {}, stop() {} };

    // Deja los valores finales sin animar (reducir movimiento, o navegadores sin Web Animations).
    function applyFinal(els, props) {
        els.forEach(el => {
            let transform = '';
            if ('x' in props || 'y' in props) transform += `translate(${last(props.x) || 0}px, ${last(props.y) || 0}px) `;
            if ('scale' in props) transform += `scale(${last(props.scale)}) `;
            if ('scaleX' in props) transform += `scaleX(${last(props.scaleX)}) `;
            if ('rotate' in props) transform += `rotate(${last(props.rotate)}deg)`;
            if (transform) el.style.transform = transform.trim();
            if ('opacity' in props) el.style.opacity = last(props.opacity);
        });
    }
    function waapi(els, props, { duration, delay, stagger, ease, onComplete }) {
        const keys = Object.keys(props);
        const count = Math.max(...keys.map(key => (Array.isArray(props[key]) ? props[key].length : 1)));
        const at = (key, j) => (Array.isArray(props[key]) ? props[key][Math.min(j, props[key].length - 1)] : props[key]);
        const frames = Array.from({ length: count }, (_, j) => {
            let transform = '';
            if ('x' in props || 'y' in props) transform += `translate(${'x' in props ? at('x', j) : 0}px, ${'y' in props ? at('y', j) : 0}px) `;
            if ('scale' in props) transform += `scale(${at('scale', j)}) `;
            if ('scaleX' in props) transform += `scaleX(${at('scaleX', j)}) `;
            if ('rotate' in props) transform += `rotate(${at('rotate', j)}deg)`;
            const frame = {};
            if (transform) frame.transform = transform.trim();
            if ('opacity' in props) frame.opacity = at('opacity', j);
            return frame;
        });
        const anims = els.map((el, i) => el.animate(frames, { duration, delay: delay + i * stagger, easing: EASE_CSS[ease] || 'ease-out', fill: 'both' }));
        anims[anims.length - 1].finished.then(() => onComplete && onComplete()).catch(() => {});   // al cancelar se rechaza: no completa
        return { pause: () => anims.forEach(a => a.pause()), play: () => anims.forEach(a => a.play()), stop: () => anims.forEach(a => a.cancel()) };
    }
    /* tween(elementos, { x, y, scale, scaleX, rotate, opacity: [desde, hasta] (o más valores = fotogramas) },
             { duration, delay, stagger, ease, onComplete }) → { pause, play, stop } */
    function tween(targets, props, options = {}) {
        const els = [].concat(targets).filter(Boolean);
        const { duration = 800, delay = 0, stagger = 0, ease = 'outExpo', onComplete } = options;
        if (!els.length) { onComplete && onComplete(); return inert; }
        if (calm()) { applyFinal(els, props); onComplete && onComplete(); return inert; }
        if (lib) {
            try {
                const params = { duration, ease, delay: stagger ? lib.stagger(stagger, { start: delay }) : delay };
                Object.entries(props).forEach(([key, value]) => { params[ANIME_PROP[key] || key] = value; });
                if (onComplete) params.onComplete = onComplete;
                const anim = lib.animate(els, params);
                return { pause: () => anim.pause && anim.pause(), play: () => anim.play && anim.play(), stop: () => (anim.cancel ? anim.cancel() : anim.pause && anim.pause()) };
            } catch (error) { /* si la API difiere, se usa la alternativa nativa */ }
        }
        if (typeof els[0].animate !== 'function') { applyFinal(els, props); onComplete && onComplete(); return inert; }
        return waapi(els, props, { duration, delay, stagger, ease, onComplete });
    }
    // Cuenta ascendente de un número ("0+" → "9+").
    function count(el, to, { duration = 1800, delay = 0, suffix = '+' } = {}) {
        const state = { v: 0 };
        const render = () => { el.textContent = `${Math.round(state.v)}${suffix}`; };
        if (calm()) { state.v = to; render(); return; }
        render();
        if (lib) {
            try { lib.animate(state, { v: to, duration, delay, ease: 'outExpo', onUpdate: render, onComplete: () => { state.v = to; render(); } }); return; } catch (error) { /* sigue */ }
        }
        const begin = performance.now() + delay;
        (function step(now) {
            const k = clamp((now - begin) / duration);
            state.v = to * (1 - Math.pow(1 - k, 4)); render();
            if (k < 1) requestAnimationFrame(step); else { state.v = to; render(); }
        })(performance.now());
    }
    window.HSMotion = { tween, count, hasAnime: Boolean(lib) };

    /* ---------- 2. Cifras desde data.js ---------- */
    const data = window.STUDIO || {};
    const techSet = new Set((data.projects || []).flatMap(project => project.tech || []).map(tech => tech.toLowerCase().replace(/^html5$/, 'html')));
    const stats = { projects: (data.projects || []).length, brands: (data.brands || []).length, tech: techSet.size };
    const statEls = $$('[data-stat]');
    statEls.forEach(el => { if (stats[el.dataset.stat]) el.textContent = `${stats[el.dataset.stat]}+`; });

    /* ---------- 3. Video de fondo ---------- */
    const video = $('.hero-video');
    let visible = true, started = false, videoReady = false;
    const saveData = Boolean(navigator.connection && navigator.connection.saveData);
    const RAMP = 1.1, RATE_MIN = .6;   // frenado en los extremos del vaivén
    function setupVideo() {
        if (!video || saveData || calm()) return;   // solo el póster
        // Full HD (1920×1080) solo si la pantalla lo aprovecha; teléfonos y pantallas pequeñas reciben la versión 720p (más liviana).
        const pixels = innerWidth * Math.min(devicePixelRatio || 1, 2);
        video.src = innerWidth <= 700 || pixels <= 1500 ? video.dataset.srcSm : video.dataset.src;
        try { video.load(); } catch (error) { /* navegador sin multimedia */ }
        videoReady = true;
        if ('requestVideoFrameCallback' in video) {
            const tick = (now, meta) => {
                const length = video.duration;
                if (length > 0) {
                    const distance = Math.min(Math.abs(meta.mediaTime - length / 2), meta.mediaTime, length - meta.mediaTime);
                    const k = clamp(distance / RAMP), rate = RATE_MIN + (1 - RATE_MIN) * k * k * (3 - 2 * k);
                    if (Math.abs(video.playbackRate - rate) > .02) video.playbackRate = rate;
                }
                video.requestVideoFrameCallback(tick);
            };
            video.requestVideoFrameCallback(tick);
        }
    }
    function syncVideo() {
        if (!video || !videoReady) return;
        const play = started && visible && !document.hidden;
        try { if (play) { const attempt = video.play(); if (attempt && attempt.catch) attempt.catch(() => {}); } else video.pause(); } catch (error) { /* sin multimedia */ }
    }
    setupVideo();

    /* ---------- 4. Tarjeta de proyectos ---------- */
    const slides = (data.projects || []).filter(project => project.image && /^(https?:\/\/|assets\/)/i.test(project.image));
    const n = slides.length;
    const card = $('.hero-card'), thumb = $('.hero-card__thumb'), thumbImg = $('.hero-card__thumb img');
    const nameEl = $('.hero-card__title strong'), labelEl = $('.hero-card__title small');
    const counter = $('.hero-card__count'), fill = $('.hero-card__bar i'), status = $('#hero-status');
    const AUTO = 6000;
    const pad = value => String(value).padStart(2, '0');
    let idx = 0, busy = false, hovering = false, token = 0, progress = null;
    function fillCard(i) {
        thumbImg.src = slides[i].image;
        nameEl.textContent = slides[i].title; labelEl.textContent = slides[i].label || '';
        counter.textContent = `${pad(i + 1)}/${pad(n)}`;
    }
    if (n < 2) { if (card) card.hidden = true; } else fillCard(0);

    function stopProgress() { token++; if (progress) progress.stop(); progress = null; if (fill) fill.style.transform = 'scaleX(0)'; }
    function sync() { syncVideo(); if (!progress) return; (hovering || document.hidden || !visible || !started) ? progress.pause() : progress.play(); }
    function startProgress() {
        stopProgress();
        if (n < 2 || calm()) return;
        const mine = token;
        progress = tween(fill, { scaleX: [0, 1] }, { duration: AUTO, ease: 'linear', onComplete: () => { if (mine === token) goTo((idx + 1) % n); } });
        sync();
    }
    function goTo(next) {
        if (busy || n < 2) return;
        busy = true; stopProgress(); idx = next;
        const preload = new Image(); preload.src = slides[next].image;      // la imagen está lista antes del cambio
        const swap = Promise.race([preload.decode ? preload.decode().catch(() => {}) : Promise.resolve(), new Promise(resolve => setTimeout(resolve, 700))]);
        tween([thumb, nameEl.parentElement], { opacity: [1, 0], y: [0, -8] }, { duration: 240, ease: 'inQuad', onComplete: () => {
            swap.then(() => {
                fillCard(next);
                tween([thumb, nameEl.parentElement], { opacity: [0, 1], y: [10, 0] }, { duration: 480, ease: 'outCubic', stagger: 60 });
            });
        } });
        tween(counter, { opacity: [1, 0], y: [0, -6] }, { duration: 180, ease: 'inQuad', onComplete: () => {
            counter.textContent = `${pad(next + 1)}/${pad(n)}`;
            tween(counter, { opacity: [0, 1], y: [6, 0] }, { duration: 320, ease: 'outCubic' });
        } });
        if (status) status.textContent = `Proyecto en pantalla: ${slides[next].title}`;
        setTimeout(() => { busy = false; startProgress(); }, 900);
    }
    card && card.addEventListener('click', () => { if (n > 1) goTo((idx + 1) % n); });
    card && card.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovering = true; sync(); } });
    card && card.addEventListener('pointerleave', () => { hovering = false; sync(); });
    document.addEventListener('visibilitychange', sync);

    // Inclinación 3D de la tarjeta (solo mouse).
    const inner = $('.hero-card__inner');
    if (card && inner) {
        card.addEventListener('pointermove', event => {
            if (event.pointerType !== 'mouse' || calm()) return;
            const r = card.getBoundingClientRect();
            const x = (event.clientX - r.left) / r.width - .5, y = (event.clientY - r.top) / r.height - .5;
            inner.style.transform = `perspective(600px) rotateX(${(-y * 9).toFixed(2)}deg) rotateY(${(x * 11).toFixed(2)}deg) translateZ(8px)`;
        });
        card.addEventListener('pointerleave', () => { inner.style.transform = ''; });
    }

    /* ---------- 5. Entrada ---------- */
    let introDone = false;
    function finishIntro() {
        if (introDone) return;
        introDone = true; root.classList.remove('hero-prep'); startProgress();
    }
    function intro() {
        const header = document.querySelector('header.nav');
        started = true; syncVideo();
        tween(video, { opacity: [0, 1], scale: [1.12, 1.03] }, { duration: 2200, ease: 'outQuart' });
        header && tween(header, { opacity: [0, 1], y: [-22, 0] }, { duration: 800, delay: 400 });
        tween($$('.hero-stats li'), { opacity: [0, 1], y: [26, 0] }, { duration: 900, delay: 700, stagger: 110 });
        statEls.forEach((el, i) => { if (stats[el.dataset.stat]) count(el, stats[el.dataset.stat], { delay: 700 + i * 110, duration: 1800 }); });
        tween([$('.hero-cta'), $('.hero-cta-arrow'), $('.hero-desc')], { opacity: [0, 1], y: [22, 0] }, { duration: 900, delay: 1100, stagger: 100 });
        tween(card, { opacity: [0, 1], y: [30, 0], x: [24, 0] }, { duration: 1000, delay: 1250, onComplete: finishIntro });
        setTimeout(finishIntro, 6000);   // seguro: pase lo que pase, la interfaz queda visible
    }
    let began = false;
    function begin() {
        if (began) return; began = true;
        // Si el video ya tiene un fotograma listo arranca de inmediato; si no, espera como máximo 1,8 s.
        const ready = new Promise(resolve => {
            if (!video || !videoReady || video.readyState >= 2) return resolve();
            video.addEventListener('loadeddata', resolve, { once: true });
        });
        Promise.race([ready, new Promise(resolve => setTimeout(resolve, 1800))]).then(intro);
    }
    if (calm()) { statEls.forEach(el => { if (stats[el.dataset.stat]) el.textContent = `${stats[el.dataset.stat]}+`; }); started = true; }
    else {
        root.classList.add('hero-prep');
        window.addEventListener('house:entered', begin, { once: true });
        window.addEventListener('load', () => { if (!document.querySelector('#studio-intro')?.open) begin(); }, { once: true });
        setTimeout(() => { if (!began && !document.querySelector('#studio-intro')?.open) begin(); }, 8000);
    }

    /* ---------- 6. Integración con el scroll ---------- */
    // out (0…1) = cuánto se alejó el hero. El video se mueve más lento y crece un poco (profundidad),
    // se oscurece hasta el negro del vistazo (.hero-dim) y la interfaz sube y se desvanece.
    const bg = $('.hero-bg'), dim = $('.hero-dim'), ui = $('.hero-ui');
    let tx = 0, ty = 0, hx = 0, hy = 0, out = 0, outTarget = 0, raf = 0, heroHeight = 1;
    function paint() {
        if (bg) bg.style.transform = `translate3d(${(hx * -10).toFixed(1)}px, ${(hy * -6 + out * 90).toFixed(1)}px, 0) scale(${(1 + out * .08).toFixed(4)})`;
        if (dim) dim.style.opacity = (out * .92).toFixed(3);
        if (ui) { ui.style.translate = `0 ${(out * -40).toFixed(1)}px`; ui.style.opacity = Math.max(0, 1 - out * 1.3).toFixed(3); }
    }
    function follow() {
        raf = 0;
        hx += (tx - hx) * .08; hy += (ty - hy) * .08; out += (outTarget - out) * .12;
        paint();
        if (visible && (Math.abs(tx - hx) > .0004 || Math.abs(ty - hy) > .0004 || Math.abs(outTarget - out) > .0008)) raf = requestAnimationFrame(follow);
    }
    const kick = () => { if (!raf && visible) raf = requestAnimationFrame(follow); };
    const measure = () => { heroHeight = hero.offsetHeight || 1; outTarget = clamp(scrollY / (heroHeight * .9)); };
    hero.addEventListener('pointermove', event => {   // parallax suave del video con el mouse
        if (event.pointerType !== 'mouse' || calm()) return;
        const bounds = hero.getBoundingClientRect();
        tx = (event.clientX - bounds.left) / bounds.width - .5; ty = (event.clientY - bounds.top) / bounds.height - .5; kick();
    });
    hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
    addEventListener('scroll', () => { outTarget = clamp(scrollY / (heroHeight * .9)); kick(); }, { passive: true });
    addEventListener('resize', measure, { passive: true });
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) kick(); sync(); }).observe(hero);
    measure(); paint();
})();
