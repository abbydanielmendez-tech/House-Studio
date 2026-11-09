/* HOUSE-STUDIO · CARRUSEL DE PROYECTOS
   Adaptación a JavaScript puro del "Swipe Carousel" (React + Framer Motion):
     · se arrastra con mouse o dedo (umbral de 50 px) y salta al siguiente/anterior proyecto
     · movimiento con resorte (masa 3, rigidez 400, amortiguación 50: los valores del original)
     · el proyecto activo se agranda (0.95) y los vecinos se achican (0.85)
     · puntos de navegación, flechas, teclado (← → Inicio Fin) y avance automático cada 10 s
     · degradados en los bordes
   Las tarjetas las genera script.js (renderProjects) dentro de #projects; este módulo se
   reconstruye solo cuando cambian (filtros). El avance automático se pausa con el mouse encima,
   con el foco dentro, fuera de pantalla, con la pestaña oculta y mientras se arrastra. */
(() => {
    'use strict';
    const track = document.querySelector('#projects');
    const wrap = track?.closest('.projects-carousel');
    const controls = document.querySelector('#projects-controls');
    if (!track || !wrap || !controls) return;

    const root = document.documentElement;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const calm = () => reduce.matches && root.dataset.motion !== 'on';   // el portafolio fija data-motion="on"
    const AUTO_DELAY = 10000, DRAG_BUFFER = 50, DRAG_FOLLOW = .6;
    const SPRING = { mass: 3, stiffness: 400, damping: 50 };
    const SCALE_ACTIVE = .95, SCALE_IDLE = .85;

    // Resorte amortiguado (integración con subpasos pequeños para que sea estable).
    class Spring {
        constructor(value) { this.v = value; this.t = value; this.vel = 0; }
        step(dt) {
            const steps = Math.max(1, Math.ceil(dt / .004)), h = dt / steps;
            for (let i = 0; i < steps; i++) {
                this.vel += ((SPRING.stiffness * (this.t - this.v) - SPRING.damping * this.vel) / SPRING.mass) * h;
                this.v += this.vel * h;
            }
        }
        settled(eps) { return Math.abs(this.t - this.v) < eps && Math.abs(this.vel) < eps; }
        snap(value) { this.v = this.t = value; this.vel = 0; }
    }

    let slides = [], scales = [], dots = [], idx = 0, width = 1, slideWidth = 1, gap = 24;
    const x = new Spring(0);
    let raf = 0, previous = 0, dragging = false, suppressClick = false, hovering = false, focusing = false;
    let visible = true, autoTimer = 0;

    // Controles: flechas + puntos + región de estado para lectores de pantalla.
    const arrow = (direction, label) => {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'carousel-arrow'; button.dataset.dir = direction; button.setAttribute('aria-label', label);
        button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${direction < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}"/></svg>`;
        return button;
    };
    const prevButton = arrow(-1, 'Proyecto anterior'), nextButton = arrow(1, 'Proyecto siguiente');
    const dotsBox = document.createElement('div'); dotsBox.className = 'carousel-dots';
    const status = document.createElement('p'); status.className = 'sr-only'; status.setAttribute('aria-live', 'polite');
    controls.append(prevButton, dotsBox, nextButton, status);

    const targetX = index => (width - slideWidth) / 2 - index * (slideWidth + gap);
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    function layout() {
        width = wrap.clientWidth || 1;
        slideWidth = Math.min(1040, width * (width < 700 ? .86 : .72));
        gap = width < 700 ? 14 : 28;
        wrap.style.setProperty('--slide-w', `${slideWidth.toFixed(1)}px`);
        wrap.style.setProperty('--slide-gap', `${gap}px`);
        x.snap(targetX(idx));
        paint();
    }
    function paint() {
        track.style.transform = `translate3d(${x.v.toFixed(2)}px, 0, 0)`;
        slides.forEach((slide, i) => { slide.style.transform = `scale(${scales[i].v.toFixed(4)})`; });
    }
    function frame(time) {
        raf = 0;
        const dt = Math.min(.05, (time - previous) / 1000 || .016); previous = time;
        let moving = dragging;
        if (!dragging) { x.step(dt); if (!x.settled(.05)) moving = true; else x.snap(x.t); }
        scales.forEach(spring => { spring.step(dt); if (!spring.settled(.0004)) moving = true; else spring.snap(spring.t); });
        paint();
        if (moving) raf = requestAnimationFrame(frame);   // se detiene solo cuando todo se asentó
    }
    const kick = () => { if (!raf) { previous = performance.now(); raf = requestAnimationFrame(frame); } };

    // Solo el proyecto activo es alcanzable con Tab y leído por lectores de pantalla.
    function markActive() {
        slides.forEach((slide, i) => {
            const active = i === idx;
            slide.classList.toggle('is-active', active);
            slide.setAttribute('aria-hidden', String(!active));
            slide.querySelectorAll('a, button').forEach(element => {
                if (active) element.removeAttribute('tabindex'); else element.setAttribute('tabindex', '-1');
            });
        });
        dots.forEach((dot, i) => { if (i === idx) dot.setAttribute('aria-current', 'true'); else dot.removeAttribute('aria-current'); });
        prevButton.disabled = idx === 0; nextButton.disabled = idx === slides.length - 1;
    }
    function goTo(index, byUser = false) {
        if (!slides.length) return;
        idx = clamp(index, 0, slides.length - 1);
        x.t = targetX(idx);
        scales.forEach((spring, i) => { spring.t = i === idx ? SCALE_ACTIVE : SCALE_IDLE; });
        markActive();
        if (byUser) {
            const title = slides[idx].querySelector('h3')?.textContent || '';
            status.textContent = `Proyecto ${idx + 1} de ${slides.length}: ${title}`;
            scheduleAuto();
        }
        kick();
    }

    // Se reconstruye cuando script.js vuelve a dibujar las tarjetas (filtros).
    function rebuild() {
        slides = [...track.querySelectorAll(':scope > .project')];
        scales = slides.map(() => new Spring(SCALE_IDLE));
        slides.forEach((slide, i) => {
            slide.setAttribute('role', 'group'); slide.setAttribute('aria-roledescription', 'diapositiva');
            slide.setAttribute('aria-label', `${i + 1} de ${slides.length}`);
            slide.querySelectorAll('img').forEach(img => { img.draggable = false; });
        });
        dotsBox.replaceChildren(...slides.map((slide, i) => {
            const dot = document.createElement('button');
            dot.type = 'button'; dot.className = 'carousel-dot';
            dot.setAttribute('aria-label', `Ir al proyecto ${i + 1}: ${slide.querySelector('h3')?.textContent || ''}`);
            dot.addEventListener('click', () => goTo(i, true));
            return dot;
        }));
        dots = [...dotsBox.children];
        idx = 0; width = wrap.clientWidth || 1;
        scales.forEach((spring, i) => spring.snap(i === 0 ? SCALE_ACTIVE : SCALE_IDLE));
        layout(); markActive(); scheduleAuto();
    }
    new MutationObserver(rebuild).observe(track, { childList: true });

    /* Arrastre (mouse y toque). El navegador sigue encargándose del scroll vertical (touch-action: pan-y). */
    let drag = null;
    track.addEventListener('pointerdown', event => {
        if (event.button !== 0 || !slides.length) return;
        drag = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false, base: x.v };
    });
    track.addEventListener('pointermove', event => {
        if (!drag || event.pointerId !== drag.id) return;
        const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
        if (!drag.moved) {
            if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy)) return;
            drag.moved = true; dragging = true; track.classList.add('is-dragging'); track.setPointerCapture?.(event.pointerId);
        }
        // Como en el original, el contenido sigue al dedo con resistencia (elástico).
        x.v = drag.base + dx * DRAG_FOLLOW; x.vel = 0; kick();
    });
    function endDrag(event, allowSwitch) {
        if (!drag || event.pointerId !== drag.id) return;
        const { moved, x: startX } = drag; drag = null;
        if (!moved) return;
        const dx = event.clientX - startX;
        dragging = false; track.classList.remove('is-dragging'); track.releasePointerCapture?.(event.pointerId);
        suppressClick = true; setTimeout(() => { suppressClick = false; }, 0);   // el clic que sigue al arrastre no cuenta
        if (allowSwitch && dx <= -DRAG_BUFFER && idx < slides.length - 1) goTo(idx + 1, true);
        else if (allowSwitch && dx >= DRAG_BUFFER && idx > 0) goTo(idx - 1, true);
        else goTo(idx, true);   // vuelve a su sitio con el resorte
    }
    track.addEventListener('pointerup', event => endDrag(event, true));
    track.addEventListener('pointercancel', event => endDrag(event, false));

    // Clic: tras arrastrar se ignora; sobre un proyecto vecino, lo lleva al centro en vez de abrirlo.
    track.addEventListener('click', event => {
        if (suppressClick) { event.preventDefault(); event.stopPropagation(); return; }
        const slide = event.target.closest('.project');
        const index = slides.indexOf(slide);
        if (index >= 0 && index !== idx) { event.preventDefault(); event.stopPropagation(); goTo(index, true); }
    }, true);

    prevButton.addEventListener('click', () => goTo(idx - 1, true));
    nextButton.addEventListener('click', () => goTo(idx + 1, true));
    wrap.addEventListener('keydown', event => {
        const keys = { ArrowLeft: idx - 1, ArrowRight: idx + 1, Home: 0, End: slides.length - 1 };
        if (!(event.key in keys) || event.target.closest('input, textarea, select')) return;
        event.preventDefault(); goTo(keys[event.key], true);
    });

    /* Avance automático cada 10 s con pausas razonables. */
    function scheduleAuto() {
        clearTimeout(autoTimer);
        if (calm() || slides.length < 2) return;
        autoTimer = setTimeout(() => {
            if (!dragging && !hovering && !focusing && visible && !document.hidden) goTo(idx === slides.length - 1 ? 0 : idx + 1);
            scheduleAuto();
        }, AUTO_DELAY);
    }
    wrap.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') hovering = true; });
    wrap.addEventListener('pointerleave', () => { hovering = false; scheduleAuto(); });
    wrap.addEventListener('focusin', () => { focusing = true; });
    wrap.addEventListener('focusout', () => { focusing = false; scheduleAuto(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }).observe(wrap);
    if ('ResizeObserver' in window) new ResizeObserver(layout).observe(wrap);
    addEventListener('resize', layout, { passive: true });

    rebuild();
})();
