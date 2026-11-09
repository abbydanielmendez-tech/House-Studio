/* HOUSE-STUDIO · PESTAÑAS VERTICALES (casos de marca: La Cocina de Carmencita y MoonFlower)
   ---------------------------------------------------------------------------
   Es la versión en JavaScript nativo del componente "VerticalTabs" (React + Motion), con el mismo comportamiento:

   · A la izquierda, una lista de pestañas numeradas (/01, /02…). La activa muestra su descripción desplegada y una
     barra de progreso que se llena en 5 s; al llenarse, pasa sola a la siguiente (avance automático).
   · A la derecha, una galería: al cambiar de pieza, la imagen nueva entra deslizándose desde ARRIBA mientras la anterior
     sale hacia ABAJO (0,34 s). Los botones ‹ › cambian de pieza; hacer clic en la imagen avanza a la siguiente.
   · Al pasar el mouse sobre la galería se pausa el avance (la barra vuelve a 0 y reinicia al salir).

   Quién hace qué (para no perderse):
     script.js ....... dibuja el HTML de cada marca (renderBrands) y llama a VerticalTabs.mount(elemento).
     _vertical-tabs.scss  todo lo visual Y el movimiento: el deslizamiento, la barra y el despliegue son transiciones y
                      animaciones CSS (solo transform/opacity, en el compositor). Aquí NO se anima nada a mano.
     este archivo .... solo decide el estado: qué pestaña está activa, qué diapositiva entra/sale y cuándo corre el
                      avance automático. Lo expresa con clases y atributos que el CSS ya sabe dibujar.

   Cómo se mueve la galería (idea clave): cada diapositiva está siempre en uno de tres estados:
        is-parked  → "aparcada" ARRIBA (translateY(-100%)), invisible, esperando su turno
        is-active  → visible en su sitio (translateY(0)); es la que se ve
        is-leaving → saliendo hacia ABAJO (translateY(100%)); al terminar vuelve a is-parked (salto instantáneo)
   Cambiar de pieza es solo cambiar esas clases; el CSS hace la transición. Si se hace clic muy rápido, la diapositiva
   que va a medio camino se re-dirige desde donde esté (comportamiento natural de las transiciones CSS).

   El avance automático lo marca la propia barra de progreso: cuando su animación CSS termina (evento animationend)
   se pasa a la siguiente, así barra y avance nunca se desfasan. Se pausa con el mouse sobre la galería, con el
   teclado dentro del componente, fuera de pantalla y con la pestaña del navegador oculta.

   Accesibilidad: patrón de pestañas (role="tablist"/"tab"/"tabpanel") con flechas, Inicio y Fin; las diapositivas
   no activas van aria-hidden. Regla de movimiento del sitio: script.js fija data-motion="on" y eso gana sobre
   "reducir movimiento" (igual que hero.js y stack-deck.js); si se quita, sin movimiento no hay avance automático.

   Imágenes: llegan con loading="lazy"; cuando el componente se acerca a la pantalla se cargan todas, para que la
   siguiente diapositiva ya esté lista cuando entre. */
(() => {
    'use strict';

    const html = document.documentElement;
    const media = query => (typeof matchMedia === 'function' ? matchMedia(query) : { matches: false });
    const reduce = media('(prefers-reduced-motion: reduce)');
    const calm = () => reduce.matches && html.dataset.motion !== 'on';   // misma regla que el resto del sitio
    const PARK_FALLBACK = 700;   // ms: red de seguridad por si una transición no llega a emitir transitionend

    function mount(root) {
        if (!root || root.dataset.vtabsReady) return;
        const tabs = [...root.querySelectorAll('.vtab')];
        const slides = [...root.querySelectorAll('.vslide')];
        const panel = root.querySelector('.vgallery');
        const expand = root.querySelector('.vexpand');
        const gallery = root.querySelector('.vframe');
        if (!tabs.length || tabs.length !== slides.length || !panel || !gallery) return;
        root.dataset.vtabsReady = '1';

        const count = tabs.length;
        let index = 0;
        // Motivos para pausar el avance automático. Basta con que uno sea true.
        const hold = { hover: false, focus: false, away: true };

        /* 1. Avance automático: encendido / apagado / estático. El CSS dibuja la barra según data-autoplay. */
        function sync() {
            let mode = 'on';
            if (calm()) mode = 'static';                                   // sin movimiento: barra llena y fija
            else if (count < 2 || hold.hover || hold.focus || hold.away || document.hidden) mode = 'off';
            if (root.dataset.autoplay !== mode) root.dataset.autoplay = mode;
        }

        /* 2. Cambiar de pieza: solo clases y atributos (el CSS anima). */
        function park(slide) {
            if (slide.classList.contains('is-leaving')) { slide.classList.remove('is-leaving'); slide.classList.add('is-parked'); }
        }
        function select(next) {
            if (next === index) return;
            const leaving = slides[index], entering = slides[next];
            leaving.classList.remove('is-active');
            leaving.classList.add('is-leaving');
            leaving.setAttribute('aria-hidden', 'true');
            setTimeout(() => park(leaving), PARK_FALLBACK);
            entering.classList.remove('is-parked', 'is-leaving');
            entering.classList.add('is-active');
            entering.setAttribute('aria-hidden', 'false');
            tabs.forEach((tab, i) => {
                const on = i === next;
                tab.classList.toggle('is-active', on);
                tab.setAttribute('aria-selected', String(on));
                tab.tabIndex = on ? 0 : -1;
            });
            index = next;
            panel.setAttribute('aria-labelledby', tabs[next].id);
            if (expand) {   // el botón "Ampliar" abre la pieza actual en el visor (lo atiende script.js por data-piece)
                expand.dataset.piece = tabs[next].dataset.pieceId;
                expand.setAttribute('aria-label', `Ampliar: ${tabs[next].dataset.title}`);
                expand.hidden = tabs[next].dataset.expand === '0';   // los pasteles se amplían uno por uno, no en conjunto
            }
        }
        const step = delta => select((index + delta + count) % count);

        // Cuando la diapositiva termina de salir, vuelve arriba sin animación (queda lista para su próximo turno).
        slides.forEach(slide => slide.addEventListener('transitionend', event => {
            if (event.target === slide && event.propertyName === 'transform') park(slide);
        }));
        // La barra de progreso de la pestaña activa terminó de llenarse → siguiente pieza.
        root.addEventListener('animationend', event => {
            if (event.animationName === 'vtab-fill' && event.target.closest('.vtab') === tabs[index]) step(1);
        });

        /* 3. Controles */
        tabs.forEach((tab, i) => tab.addEventListener('click', () => select(i)));
        root.querySelector('.vprev')?.addEventListener('click', () => step(-1));
        root.querySelector('.vnext')?.addEventListener('click', () => step(1));
        // Clic en la imagen = siguiente (como en el original), salvo en botones propios (ampliar un pastel, etc.).
        slides.forEach(slide => slide.addEventListener('click', event => {
            if (!event.target.closest('button, a')) step(1);
        }));
        // Teclado dentro de la lista de pestañas: ↑ ↓ ← → recorren, Inicio/Fin saltan a los extremos.
        root.querySelector('.vtabs-list')?.addEventListener('keydown', event => {
            const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
            let next = -1;
            if (event.key in keys) next = (index + keys[event.key] + count) % count;
            else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = count - 1;
            if (next < 0) return;
            event.preventDefault();
            tabs[next].focus();
            select(next);
        });

        /* 4. Pausas del avance automático */
        gallery.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hold.hover = true; sync(); } });
        gallery.addEventListener('pointerleave', () => { hold.hover = false; sync(); });
        // Solo el foco de TECLADO pausa: tras un clic con mouse el botón queda enfocado y no debe frenar el avance.
        root.addEventListener('focusin', event => {
            let keyboard = false;
            try { keyboard = event.target.matches(':focus-visible'); } catch { /* selector no admitido */ }
            if (keyboard) { hold.focus = true; sync(); }
        });
        root.addEventListener('focusout', event => {
            if (!root.contains(event.relatedTarget)) { hold.focus = false; sync(); }
        });
        document.addEventListener('visibilitychange', sync);
        [reduce].forEach(query => query.addEventListener && query.addEventListener('change', sync));
        // script.js fija data-motion="on" después de dibujar las marcas: al aparecer o cambiar, se vuelve a decidir.
        if (typeof MutationObserver === 'function') new MutationObserver(sync).observe(html, { attributes: true, attributeFilter: ['data-motion'] });

        /* 5. Visibilidad: avanzar solo mientras se VE LA GALERÍA (no todo el componente, que es muy alto en móvil), y
              cargar las imágenes antes de que hagan falta. */
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(entries => {
                hold.away = !entries[entries.length - 1].isIntersecting;
                sync();
            }, { threshold: 0.35 }).observe(gallery);
            const preload = new IntersectionObserver(entries => {
                if (!entries.some(entry => entry.isIntersecting)) return;
                root.querySelectorAll('img[loading="lazy"]').forEach(img => { img.loading = 'eager'; });
                preload.disconnect();
            }, { rootMargin: '900px 0px' });
            preload.observe(root);
        } else {
            hold.away = false;
        }
        sync();
    }

    window.VerticalTabs = { mount };
})();
