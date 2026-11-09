/* HOUSE-STUDIO · PRECIOS Y PAQUETES (#precios)
   El movimiento "squishy" vive en CSS (components/_pricing.scss). Este archivo solo:
   1. Arma cada enlace de WhatsApp con el mensaje del paquete, reutilizando el número ya publicado en la página.
   2. Mueve la luz del borde con el cursor (solo mouse).
   3. En pantallas táctiles (sin hover) activa la tarjeta que cruza el centro de la pantalla.
   4. Menú "Ver detalles del paquete": abre y cierra la lista de cada tarjeta (la altura la anima el CSS).
   Sin dependencias: no usa anime.js ni librerías externas. */
(() => {
    'use strict';
    const section = document.querySelector('#precios');
    if (!section) return;
    const cards = [...section.querySelectorAll('.price-card')];

    /* 1. WhatsApp: el número sale de otro enlace de la página (la cabecera); aquí solo se añade el texto.
          Si no se encuentra ninguno, quedan los enlaces escritos en el HTML. */
    const source = [...document.querySelectorAll('a[href*="wa.me/"]')].find(link => !section.contains(link));
    if (source) {
        try {
            const url = new URL(source.href);
            section.querySelectorAll('[data-wa]').forEach(link => {
                link.href = `${url.origin}${url.pathname}?text=${encodeURIComponent(link.dataset.wa)}`;
            });
        } catch { /* se conservan los enlaces del HTML */ }
    }

    /* 2. Luz del borde: --px/--py (en %) que lee el ::before de la tarjeta. */
    cards.forEach(card => {
        let frame = 0, last = null;
        const paint = () => {
            frame = 0;
            const r = card.getBoundingClientRect();
            card.style.setProperty('--px', `${(((last.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
            card.style.setProperty('--py', `${(((last.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
        };
        card.addEventListener('pointermove', event => {
            if (event.pointerType !== 'mouse') return;
            last = event;
            if (!frame) frame = requestAnimationFrame(paint);
        });
        card.addEventListener('pointerleave', () => {
            card.style.removeProperty('--px'); card.style.removeProperty('--py');
        });
    });

    /* 4. Detalles deslizables. Sin JS la lista queda abierta; con JS cada tarjeta arranca cerrada. */
    section.classList.add('has-details');
    // Las transiciones se activan dos fotogramas después, para que no se vea cerrarse al cargar la página.
    requestAnimationFrame(() => requestAnimationFrame(() => section.classList.add('details-ready')));
    cards.forEach(card => {
        const toggle = card.querySelector('.price-toggle');
        if (!toggle) return;
        toggle.addEventListener('click', () => {
            const open = toggle.getAttribute('aria-expanded') !== 'true';
            toggle.setAttribute('aria-expanded', String(open));
            card.classList.toggle('is-open', open);
        });
    });

    /* 3. Táctil: la tarjeta que ocupa la franja central de la pantalla se "estira" como con el cursor. */
    if (matchMedia('(hover: none)').matches && 'IntersectionObserver' in window) {
        const watcher = new IntersectionObserver(entries => {
            entries.forEach(entry => entry.target.classList.toggle('is-active', entry.isIntersecting));
        }, { rootMargin: '-38% 0px -38% 0px', threshold: 0 });
        cards.forEach(card => watcher.observe(card));
    }
})();
