/* HOUSE-STUDIO · INTERACCIONES 3D
   1. Inclinación 3D con brillo en tarjetas (proyectos, galería, piezas de marca, banners).
   2. Efecto imán en botones principales.
   Todo con delegación de eventos sobre contenedores: sigue funcionando al filtrar/re-renderizar.
   Solo actúa con mouse (no con toque) y respeta "reducir movimiento" salvo que el portafolio
   fije data-motion="on". */
(() => {
    'use strict';
    const root = document.documentElement;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const calm = () => reduce.matches && root.dataset.motion !== 'on';

    /* 1. Inclinación 3D */
    const TILT = '.project-cover, .film-art';
    const MAX = 9; // grados de inclinación máxima
    let current = null, pending = null, raf = 0;
    function release(el) {
        if (!el) return;
        el.classList.remove('is-tilting');
        ['--rx', '--ry', '--sx', '--sy', '--gx', '--gy'].forEach(name => el.style.removeProperty(name));
    }
    function apply() {
        raf = 0;
        const event = pending; pending = null;
        if (!event || calm()) return;
        const el = event.target.closest?.(TILT) || null;
        if (el !== current) { release(current); current = el; }
        if (!el) return;
        const r = el.getBoundingClientRect();
        const x = Math.min(1, Math.max(0, (event.clientX - r.left) / r.width));
        const y = Math.min(1, Math.max(0, (event.clientY - r.top) / r.height));
        el.classList.add('is-tilting');
        el.style.setProperty('--rx', `${((.5 - y) * MAX * 2).toFixed(2)}deg`);
        el.style.setProperty('--ry', `${((x - .5) * MAX * 2).toFixed(2)}deg`);
        el.style.setProperty('--sx', ((x - .5) * 2).toFixed(3));
        el.style.setProperty('--sy', ((y - .5) * 2).toFixed(3));
        el.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
        el.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
    }
    function onMove(event) {
        if (event.pointerType !== 'mouse') return;
        pending = event;
        if (!raf) raf = requestAnimationFrame(apply);
    }
    function onLeave() { release(current); current = null; pending = null; }
    ['#projects', '#film-one', '#film-two'].forEach(selector => {
        const container = document.querySelector(selector);
        if (!container) return;
        container.addEventListener('pointermove', onMove);
        container.addEventListener('pointerleave', onLeave);
    });

    /* 2. Efecto imán: el botón se desplaza hacia el cursor (propiedad CSS translate) */
    const MAGNETIC = '.circle-link, .nav-contact, .hero-cta, .hero-cta-arrow, .theme-toggle';
    document.querySelectorAll(MAGNETIC).forEach(el => {
        el.addEventListener('pointermove', event => {
            if (event.pointerType !== 'mouse' || calm()) return;
            const r = el.getBoundingClientRect();
            const dx = (event.clientX - (r.left + r.width / 2)) / r.width;
            const dy = (event.clientY - (r.top + r.height / 2)) / r.height;
            el.style.setProperty('--mx', `${(dx * 14).toFixed(1)}px`);
            el.style.setProperty('--my', `${(dy * 10).toFixed(1)}px`);
        });
        el.addEventListener('pointerleave', () => {
            el.style.removeProperty('--mx'); el.style.removeProperty('--my');
        });
    });
})();
