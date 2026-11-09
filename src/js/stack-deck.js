/* HOUSE-STUDIO · PILA DE TARJETAS (galería "House Studio, por dentro", #gallery)
   ---------------------------------------------------------------------------
   Qué hace: al bajar por la página, las tarjetas entran desde abajo una a una y se APILAN como pestañas de
   carpeta: cada tarjeta anterior sube un poco y se encoge, así que solo asoma su pestaña ("01 · Branding").

   Cómo funciona (4 ideas, de la más simple a la más fina):

   1. PISTA ALTA + ESCENARIO FIJO (CSS, ver components/_stack-deck.scss).
      .stack-track es una "pista" muy alta (una pantalla + un tramo de scroll por tarjeta). Dentro, .stack-sticky
      usa position: sticky: se queda pegado a la pantalla mientras la pista pasa por debajo. Mientras está pegado,
      el scroll de la página sirve para "mover el tiempo" de la animación, no para mover el contenido.

   2. PROGRESO 0 → 1 (progress).
      Medimos cuánto de la pista ya recorrimos: 0 = recién se pegó, 1 = ya va a soltarse. Es solo un número.
      Con N tarjetas hay N-1 "transiciones"; la tarjeta i entra entre (i-1)/(N-1) y i/(N-1) del progreso.

   3. PUNTOS CLAVE POR TARJETA (keyframes).
      Para cada tarjeta definimos, según el progreso, dónde está (y) y cuánto mide (scale):
        · antes de su turno ........ fuera de pantalla, abajo (y = alto de la pantalla)
        · en su turno ............... y = 0, scale = 1 (queda al frente)
        · cuando entran las siguientes: sube --stack-lift px y se encoge --stack-shrink por nivel.
      Entre dos puntos clave se interpola en línea recta (sample()).
      Además, el contenido de una tarjeta se desvanece (--bury, de 0 a 1) a medida que la siguiente la cubre, para que
      de las tarjetas de atrás solo se vea la pestaña de color y no textos ni imágenes asomando.

   4. SUAVIZADO (el "resorte").
      El progreso real salta con cada vuelta de rueda. Para que el movimiento sea fluido, la animación persigue al
      progreso real con inercia: cada fotograma avanza una fracción de la distancia que falta (TAU = rapidez).
      Es lo que hacía useSpring en el ejemplo de React, sin librerías y conservando el scroll nativo del navegador.

   Rendimiento: solo se anima transform (compositor); el bucle de animación corre únicamente mientras la pista
   está en pantalla y se detiene solo cuando la animación alcanza al progreso.

   Cuándo NO hay pila: con menos de 2 tarjetas, en pantallas muy bajas (<500 px de alto) o si el sistema pide
   "reducir movimiento" Y el sitio no fuerza el movimiento. Entonces las tarjetas van en una lista normal
   (clase .is-static). Igual que hero.js, interactions.js y el carrusel, aquí manda la regla del
   portafolio: script.js fija data-motion="on" en <html> y eso gana sobre la preferencia del sistema. Para respetar
   siempre la preferencia del sistema, quita esa línea de script.js.
   Con el teclado, al enfocar un botón de una tarjeta que no está al frente, la página se desplaza hasta su turno.

   Uso: script.js dibuja el HTML y llama a StackDeck.mount(contenedor) cada vez que cambia el filtro. */
(() => {
    'use strict';

    const TAU = 0.16;                 // segundos de inercia: menor = más pegado al scroll, mayor = más flotante
    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const media = query => (typeof matchMedia === 'function' ? matchMedia(query) : { matches: false });
    const html = document.documentElement;
    const reduce = media('(prefers-reduced-motion: reduce)');
    const short = media('(max-height: 500px)');   // en pantallas tan bajas la pila no cabe: lista normal
    // Misma regla que el resto del sitio: data-motion="on" (lo fija script.js) manda sobre "reducir movimiento".
    const calm = () => reduce.matches && html.dataset.motion !== 'on';

    let deck = null;                  // el mazo montado ahora mismo (solo hay uno en la página)

    /* Lee un número de una variable CSS del contenedor (ej. --stack-lift: 44px → 44). Así el CSS manda en los valores. */
    function cssNumber(style, name, fallback) {
        const value = parseFloat(style.getPropertyValue(name));
        return Number.isFinite(value) ? value : fallback;
    }

    /* Puntos clave de la tarjeta i (idea 3): lista de [progreso, y, escala], de menor a mayor progreso. */
    function keyframes(i, count, lift, shrink, depthMax, offscreen) {
        const transitions = Math.max(count - 1, 1);
        const points = [];
        if (i > 0) points.push([(i - 1) / transitions, offscreen, 1]);      // hasta aquí espera abajo, fuera de pantalla
        for (let step = i; step <= transitions; step++) {
            const depth = Math.min(step - i, depthMax);                     // cuántas tarjetas hay encima (con tope)
            points.push([step / transitions, -depth * lift, 1 - depth * shrink]);
        }
        return points;
    }

    /* Valor de una tarjeta para un progreso p: interpolación lineal entre los dos puntos clave que lo rodean. */
    function sample(points, p) {
        if (p <= points[0][0]) return points[0];
        const last = points[points.length - 1];
        if (p >= last[0]) return last;
        for (let k = 1; k < points.length; k++) {
            if (p <= points[k][0]) {
                const [p0, y0, s0] = points[k - 1], [p1, y1, s1] = points[k];
                const t = (p - p0) / (p1 - p0);
                return [p, y0 + (y1 - y0) * t, s0 + (s1 - s0) * t];
            }
        }
        return last;
    }

    /* Mide lo que depende de la pantalla y del CSS. Se repite al cambiar el tamaño de la ventana. */
    function measure(d) {
        const rootStyle = getComputedStyle(d.root);
        d.lift = cssNumber(rootStyle, '--stack-lift', 44);
        d.shrink = cssNumber(rootStyle, '--stack-shrink', 0.035);
        d.depthMax = cssNumber(rootStyle, '--stack-depth', 3);
        d.pinTop = parseFloat(getComputedStyle(d.sticky).top) || 0;            // dónde se pega el escenario
        d.total = Math.max(1, d.track.offsetHeight - d.sticky.offsetHeight);   // scroll que dura toda la animación
        d.points = d.cards.map((_, i) => keyframes(i, d.cards.length, d.lift, d.shrink, d.depthMax, window.innerHeight));
    }

    /* Idea 2: el progreso real (0 → 1) según cuánto se desplazó la página. */
    function readProgress(d) {
        return clamp((d.pinTop - d.track.getBoundingClientRect().top) / d.total);
    }

    /* Coloca cada tarjeta según el progreso p (idea 3) y actualiza el contador "01 / 05". */
    function render(d, p) {
        const transitions = Math.max(d.cards.length - 1, 1);
        d.cards.forEach((card, i) => {
            const [, y, scale] = sample(d.points[i], p);
            // bury: 0 = tarjeta al frente; 1 = la siguiente ya la cubrió casi por completo (su contenido desaparece)
            const bury = clamp((p * transitions - i) * 1.6).toFixed(3);
            const value = `translate3d(0, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`;
            const key = value + bury;
            if (d.styles[i] !== key) {
                card.style.transform = value;
                card.style.setProperty('--bury', bury);
                d.styles[i] = key;
            }
        });
        const now = Math.round(p * transitions);
        if (now !== d.now && d.counter) { d.now = now; d.counter.textContent = String(now + 1).padStart(2, '0'); }
    }

    /* Idea 4: bucle de suavizado. Cada fotograma, la animación recorre una fracción de lo que le falta al progreso. */
    function frame(now) {
        const d = deck;
        if (!d) return;
        const dt = Math.min((now - d.last) / 1000, 0.1);
        d.last = now;
        d.current += (d.target - d.current) * (1 - Math.exp(-dt / TAU));
        if (Math.abs(d.target - d.current) < 0.0004) {   // ya llegó: dibujar el valor exacto y descansar
            d.current = d.target;
            render(d, d.current);
            d.raf = 0;
            return;
        }
        render(d, d.current);
        d.raf = requestAnimationFrame(frame);
    }
    function kick(d) {
        if (d.raf) return;
        d.last = performance.now();
        d.raf = requestAnimationFrame(frame);
    }

    /* Pila (con animación) o lista normal (.is-static). Ver "Accesibilidad" arriba. */
    function refresh(d) {
        d.static = d.cards.length < 2 || calm() || short.matches;
        d.root.classList.toggle('is-static', d.static);
        if (d.static) {
            d.cards.forEach(card => { card.style.removeProperty('transform'); card.style.removeProperty('--bury'); });
            d.styles = [];
            return;
        }
        measure(d);
        d.target = d.current = readProgress(d);
        render(d, d.current);
    }

    /* Teclado: enfocar un botón de una tarjeta que no está al frente lleva la página hasta el turno de esa tarjeta. */
    function onFocus(event) {
        const d = deck;
        if (!d || d.static) return;
        const i = d.cards.indexOf(event.target.closest('.stack-card'));
        if (i < 0) return;
        const transitions = Math.max(d.cards.length - 1, 1);
        if (Math.round(d.target * transitions) === i) return;
        const trackTop = d.track.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: Math.round(trackTop - d.pinTop + (i / transitions) * d.total) });
    }

    /* Un solo oyente de scroll/resize para toda la vida de la página; actúa sobre el mazo montado. */
    function onScroll() {
        if (!deck || deck.static || !deck.live) return;
        deck.target = readProgress(deck);
        kick(deck);
    }
    function onResize() {
        if (!deck) return;
        refresh(deck);
    }
    let listening = false;
    function listen() {
        if (listening) return;
        listening = true;
        addEventListener('scroll', onScroll, { passive: true });
        addEventListener('resize', onResize);
        [reduce, short].forEach(query => query.addEventListener && query.addEventListener('change', onResize));
        // script.js fija data-motion="on" DESPUÉS de dibujar la galería: al aparecer (o cambiar) hay que volver a decidir.
        if (typeof MutationObserver === 'function') {
            new MutationObserver(onResize).observe(html, { attributes: true, attributeFilter: ['data-motion'] });
        }
    }

    function unmount() {
        if (!deck) return;
        cancelAnimationFrame(deck.raf);
        if (deck.observer) deck.observer.disconnect();
        deck.root.removeEventListener('focusin', onFocus);
        deck = null;
    }

    /* Punto de entrada: monta la pila sobre el HTML que dibujó script.js dentro de `root`. */
    function mount(root) {
        unmount();
        const track = root && root.querySelector('.stack-track');
        if (!track) return;
        const d = deck = {
            root, track, sticky: track.querySelector('.stack-sticky'),
            cards: [...track.querySelectorAll('.stack-card')],
            counter: track.querySelector('.stack-count [data-now]'),
            lift: 44, shrink: 0.035, depthMax: 3, pinTop: 0, total: 1, points: [], styles: [],
            target: 0, current: 0, now: -1, raf: 0, last: 0, live: true, static: false, observer: null,
        };
        refresh(d);
        root.addEventListener('focusin', onFocus);
        listen();
        // Solo "escuchar" el scroll mientras la pista está cerca de la pantalla. Al salir, se deja la animación
        // en su estado final (0 si la pista quedó abajo, 1 si quedó arriba) para que no se quede a medias.
        if ('IntersectionObserver' in window) {
            d.live = false;
            d.observer = new IntersectionObserver(entries => {
                d.live = entries[entries.length - 1].isIntersecting;
                root.classList.toggle('is-live', d.live);          // el CSS usa will-change solo mientras está activa
                if (!d.static) { d.target = readProgress(d); kick(d); }
            }, { rootMargin: '120px 0px' });
            d.observer.observe(track);
        }
    }

    window.StackDeck = { mount };
})();
