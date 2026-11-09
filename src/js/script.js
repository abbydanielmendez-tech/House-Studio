/* ==========================================================
   HOUSE-STUDIO · COMPORTAMIENTO
   Los textos e imágenes se editan en data.js, no en este archivo.
   ========================================================== */
(() => {
    // Esta función se ejecuta al cargar el archivo y mantiene sus variables aisladas.
    "use strict"; // Detecta ciertos errores de JavaScript con mayor claridad.
    // Tomamos las colecciones de data.js; por eso debe cargarse antes de este archivo.
    const { projects, gallery, banners } = window.STUDIO;
    // Atajo local: $(selector) devuelve el primer elemento que coincide.
    const $ = (selector) => document.querySelector(selector);
    // Escapar contenido protege el HTML si agregás textos con símbolos especiales.
    const esc = (text = "") =>
        String(text).replace(
            /[&<>"']/g,
            (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
        );
    // Solo permite enlaces web y rutas dentro de assets/; no admite javascript:.
    const safeUrl = (url) => (/^(https?:\/\/|assets\/)/i.test(url) ? esc(url) : "");
    // Convierte un array de tecnologías en etiquetas HTML.
    const tags = (items) =>
        `<div class="tags">${items.map((item) => `<span>${esc(item)}</span>`).join("")}</div>`;
    /* ICONOS: SVG de línea, independientes de las fuentes emoji de cada teléfono.
       Se aplica después de renderizar listas y modales para cubrir también los filtros. */
    function enhanceIconography(root) {
        const angles = {
            "→": 0,
            "↗": -45,
            "↑": -90,
            "↖": -135,
            "←": 180,
            "↙": 135,
            "↓": 90,
            "↘": 45,
        };
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const nodes = [];
        while (walker.nextNode()) {
            const node = walker.currentNode;
            if (
                !node.parentElement.closest("script, style, noscript, svg") &&
                /[→↗↑↖←↙↓↘]/.test(node.data)
            )
                nodes.push(node);
        }
        nodes.forEach((node) => {
            const fragment = document.createDocumentFragment();
            node.data.split(/([→↗↑↖←↙↓↘])/).forEach((part) => {
                if (!(part in angles)) {
                    fragment.append(document.createTextNode(part));
                    return;
                }
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.setAttribute("viewBox", "0 0 24 24");
                svg.setAttribute("class", "icon-arrow");
                svg.setAttribute("aria-hidden", "true");
                svg.setAttribute("focusable", "false");
                const path = document.createElementNS(svg.namespaceURI, "path");
                path.setAttribute("d", "M4 12h16M13 5l7 7-7 7");
                path.setAttribute("transform", `rotate(${angles[part]} 12 12)`);
                svg.append(path);
                fragment.append(svg);
            });
            node.replaceWith(fragment);
        });
    }
    const dialog = $("#detail-dialog");
    // Guardamos qué botón abrió el modal para devolverle el foco al cerrarlo.
    let lastFocused = null;

    // 1. Modal reutilizable para historias e imágenes, con foco accesible.
    // Recibe contenido HTML creado por nuestras funciones, ya con textos escapados.
    function openDetail(html) {
        lastFocused = document.activeElement;
        $("#dialog-content").innerHTML = html;
        enhanceIconography($("#dialog-content"));
        dialog.showModal();
        dialog.scrollTop = 0;
        $(".dialog-close").focus();
    }
    // Botón de cierre. Escape lo maneja el elemento dialog del navegador.
    $(".dialog-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => lastFocused?.focus());
    // Un clic fuera del rectángulo del modal también lo cierra.
    dialog.addEventListener("click", (event) => {
        if (event.target === dialog) {
            const rect = dialog.getBoundingClientRect();
            if (
                event.clientX < rect.left ||
                event.clientX > rect.right ||
                event.clientY < rect.top ||
                event.clientY > rect.bottom
            )
                dialog.close();
        }
    });
    // Busca el proyecto por su id y arma la historia, las etiquetas y el enlace.
    function projectDetail(id) {
        const p = projects.find((item) => item.id === id);
        if (!p) return;
        openDetail(
            `<p class="eyebrow">EL PROYECTO / ${esc(p.label)}</p><h2>${esc(p.title)}</h2>${tags(p.tech)}${!p.tech.length ? "<p>Ficha técnica por completar.</p>" : ""}${p.story.map((s) => `<h3>${esc(s.title)}</h3><p>${esc(s.text)}</p>`).join("")}<a class="text-link" href="${safeUrl(p.url)}" target="_blank" rel="noopener noreferrer">Visitar sitio ↗</a>`,
        );
    }

    // 2. Render de proyectos: si no hay captura, se usa una portada conceptual.
    function renderProjects(filter = "all") {
        // 'all' conserva todos; cualquier otro valor selecciona una categoría.
        const visible = projects.filter((p) => filter === "all" || p.category === filter);
        // map crea una tarjeta por objeto; join une todas sin comas entre ellas.
        $("#projects").innerHTML = visible
            .map(
                (p, i) => `<article class="project reveal">
      <button class="project-cover" style="--cover-color:${/^#[0-9a-f]{6}$/i.test(p.color) ? p.color : "#e1cab0"}" data-project="${esc(p.id)}" aria-label="Leer la historia de ${esc(p.title)}">
        ${p.image ? `<img src="${safeUrl(p.image)}" alt="Captura de ${esc(p.title)}" loading="lazy">` : `<div class="cover-art cover-${esc(p.cover)}"><small>HOUSE-STUDIO / ${String(i + 1).padStart(2, "0")}</small><strong>${esc(p.coverTitle)}</strong><small class="cover-credit">PORTADA EDITORIAL · ${esc(p.title)}</small></div>`}
      </button><div class="project-info"><div class="project-meta"><span>${esc(p.label)}</span><span>↗</span></div><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p>${tags(p.tech)}<div class="project-actions"><button class="story-button" data-project="${esc(p.id)}">Detrás del proyecto ↗</button><a href="${safeUrl(p.url)}" target="_blank" rel="noopener noreferrer">Visitar web ↗</a></div></div></article>`,
            )
            .join("");
        enhanceIconography($("#projects"));
    }
    // Delegación de eventos: un listener funciona también con tarjetas recién renderizadas.
    $("#projects").addEventListener("click", (e) => {
        const button = e.target.closest("[data-project]");
        if (button) projectDetail(button.dataset.project);
    });

    // 3. Filtros compartidos. Nuevas categorías aparecen automáticamente.
    // element: contenedor; entries: pares [valor, etiqueta]; render: función que actualiza la vista.
    function setupFilters(element, entries, render) {
        element.innerHTML = entries
            .map(
                ([value, label], i) =>
                    `<button type="button" data-filter="${esc(value)}" aria-pressed="${i === 0}">${esc(label)}</button>`,
            )
            .join("");
        element.addEventListener("click", (e) => {
            const button = e.target.closest("[data-filter]");
            if (!button) return;
            element
                .querySelectorAll("button")
                .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
            // Actualizamos el contenido después de marcar cuál filtro está activo.
            render(button.dataset.filter);
        });
    }
    // Nombres legibles de las categorías; Set elimina duplicados.
    const categoryLabels = { web: "Sitios web", apps: "Aplicaciones" };
    setupFilters(
        $("#project-filters"),
        [
            ["all", `Todos (${projects.length})`],
            ...[...new Set(projects.map((p) => p.category))].map((c) => [
                c,
                categoryLabels[c] || c,
            ]),
        ],
        renderProjects,
    );
    renderProjects();
    $(".nav sup").textContent = String(projects.length).padStart(2, "0");

    // 4. Galería de identidad visual + ampliación de cada pieza.
    // Filtra las piezas y dibuja las miniaturas; el modal usa la imagen completa.
    // Cada pieza se dibuja como una tarjeta de la pila (js/stack-deck.js las apila al hacer scroll).
    // tone (data.js) elige el color de la tarjeta; si falta, se reparte por orden en la lista completa, así una pieza
    // conserva su color aunque cambie el filtro.
    const TONES = ["blue", "orange", "ink", "cream"];
    function renderGallery(filter = "Todos") {
        const list = gallery.filter((g) => filter === "Todos" || g.filter === filter);
        const cards = list
            .map((g, i) => {
                const tone = TONES.includes(g.tone) ? g.tone : TONES[gallery.indexOf(g) % TONES.length];
                return `<article class="stack-card tone-${tone}" style="--i:${i}" aria-labelledby="gal-${esc(g.id)}">
                    <div class="stack-tab"><span>${String(i + 1).padStart(2, "0")} · ${esc(g.filter)}</span></div>
                    <div class="stack-body">
                        <div class="stack-copy">
                            <h4 id="gal-${esc(g.id)}">${esc(g.title)}</h4>
                            <p>${esc(g.description)}</p>
                            <button type="button" class="stack-cta" data-gallery="${esc(g.id)}">Ver pieza completa <span aria-hidden="true">↗</span></button>
                        </div>
                        <button type="button" class="stack-media" data-gallery="${esc(g.id)}" aria-label="Ampliar ${esc(g.title)}"><img src="${safeUrl(g.image)}" alt="${esc(g.title)}" loading="lazy" decoding="async"></button>
                    </div>
                </article>`;
            })
            .join("");
        $("#gallery").innerHTML = `<div class="stack-track" style="--n:${list.length}"><div class="stack-sticky"><div class="stack-stage">${cards}</div><p class="stack-count" aria-hidden="true"><span data-now>01</span> / ${String(list.length).padStart(2, "0")}</p></div></div>`;
        enhanceIconography($("#gallery"));
        window.StackDeck && window.StackDeck.mount($("#gallery"));
    }
    setupFilters(
        $("#gallery-filters"),
        ["Todos", ...new Set(gallery.map((g) => g.filter))].map((c) => [c, c]),
        renderGallery,
    );
    renderGallery();
    // Al seleccionar una miniatura, recuperamos su ficha y abrimos el modal.
    $("#gallery").addEventListener("click", (e) => {
        const button = e.target.closest("[data-gallery]");
        if (!button) return;
        const g = gallery.find((item) => item.id === button.dataset.gallery);
        openDetail(
            `<p class="eyebrow">${esc(g.filter)}</p><h2>${esc(g.title)}</h2><img src="${safeUrl(g.image)}" alt="${esc(g.title)}"><p>${esc(g.description)}</p>`,
        );
    });

    /* 4B. CASOS DE BRANDING · Integrados con la identidad de House Studio.
       brands está en data.js. Cada botón conserva el id de marca y de pieza.
       Las imágenes completas se muestran con object-fit: contain, sin recortar logos. */
    const brands = window.STUDIO.brands || [];
    const brandCases = $("#brand-cases");
    function brandPalette(brand) {
        return `<p class="brand-palette-label">Paleta del proyecto mostrado</p><div class="brand-palette" aria-label="Colores de las piezas de este proyecto">${brand.palette.map((color) => `<span><i style="background:${/^#[\da-f]{6}$/i.test(color.color) ? color.color : "#ffffff"}" aria-hidden="true"></i>${esc(color.name)}</span>`).join("")}</div>`;
    }
    /* Cada marca es un componente de pestañas verticales (js/vertical-tabs.js, estilos en _vertical-tabs.scss):
       a la izquierda la lista de piezas, a la derecha la galería que se desliza. Cada elemento de brand.pieces
       (data.js) es una pestaña y su diapositiva. Una pieza con mascots: true muestra los pasteles recortados. */
    const CHEVRON_L = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7"/></svg>';
    const CHEVRON_R = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7"/></svg>';
    function brandSlide(brand, piece, i) {
        const state = i === 0 ? "is-active" : "is-parked"; // la primera se ve; las demás esperan "aparcadas" arriba
        const hidden = i === 0 ? "false" : "true";
        if (piece.mascots) {
            const cakes = brand.mascots
                .map(
                    (mascot, k) =>
                        `<button type="button" class="vcake vcake-${k}" data-brand="${esc(brand.id)}" data-mascot="${esc(mascot.id)}" aria-label="Ampliar ${esc(mascot.name)}"><img src="${safeUrl(mascot.image)}" alt="${esc(mascot.name)}" loading="lazy" decoding="async"><span>${esc(mascot.name)}</span></button>`,
                )
                .join("");
            return `<div class="vslide vslide-cakes ${state}" aria-hidden="${hidden}"><span class="vslide-chip">${esc(piece.group)}</span><div class="vcakes">${cakes}</div></div>`;
        }
        const src = safeUrl(piece.image);
        return `<div class="vslide ${state}" aria-hidden="${hidden}"><img class="vslide-glow" src="${src}" alt="" aria-hidden="true" loading="lazy" decoding="async"><img class="vslide-img" src="${src}" alt="${esc(piece.title)}" loading="lazy" decoding="async"><span class="vslide-chip">${esc(piece.group)}</span></div>`;
    }
    function renderBrands() {
        brandCases.innerHTML = brands
            .map((brand, b) => {
                const id = `vt-${esc(brand.id)}`;
                const first = brand.pieces[0];
                const next = brands[b + 1];
                const tabs = brand.pieces
                    .map(
                        (piece, i) => `<button type="button" role="tab" class="vtab${i === 0 ? " is-active" : ""}" id="${id}-tab-${i}" aria-selected="${i === 0}" aria-controls="${id}-panel" aria-labelledby="${id}-title-${i}" aria-describedby="${id}-desc-${i}" tabindex="${i === 0 ? 0 : -1}" data-piece-id="${esc(piece.id)}" data-title="${esc(piece.title)}"${piece.mascots ? ' data-expand="0"' : ""}>
                            <span class="vtab-rail" aria-hidden="true"><i></i></span>
                            <span class="vtab-num" aria-hidden="true">/${String(i + 1).padStart(2, "0")}</span>
                            <span class="vtab-copy"><span class="vtab-title" id="${id}-title-${i}">${esc(piece.title)}</span><span class="vtab-more"><span class="vtab-desc"><span class="vtab-text" id="${id}-desc-${i}">${esc(piece.description)}</span></span></span></span>
                        </button>`,
                    )
                    .join("");
                const slides = brand.pieces.map((piece, i) => brandSlide(brand, piece, i)).join("");
                const footerLink = next
                    ? `<a href="#marca-${esc(next.id)}">Siguiente proyecto: ${esc(next.name)} ↓</a>`
                    : `<a href="#house-gallery">Volver a House Studio ↓</a>`;
                return `<article id="marca-${esc(brand.id)}" class="brand-case brand-${esc(brand.id)}" aria-labelledby="${id}-heading">
                    <div class="vtabs" data-vtabs data-autoplay="off">
                        <header class="vtabs-head">
                            <p class="project-credit">UN PROYECTO DE ABBY · HOUSE STUDIO</p>
                            <p class="brand-name">${esc(brand.name)}</p>
                            <h3 class="vtabs-title" id="${id}-heading">${esc(brand.headline)}</h3>
                            <span class="vtabs-label">(${esc(brand.eyebrow)})</span>
                            <p class="vtabs-intro">${esc(brand.intro)}</p>
                        </header>
                        <div class="vtabs-list" role="tablist" aria-orientation="vertical" aria-label="Piezas de ${esc(brand.name)}">${tabs}</div>
                        <div class="vtabs-media">
                            <div class="vgallery" id="${id}-panel" role="tabpanel" aria-labelledby="${id}-tab-0">
                                <div class="vframe">
                                    ${slides}
                                    <span class="vframe-shade" aria-hidden="true"></span>
                                    <button type="button" class="vexpand" data-brand="${esc(brand.id)}" data-piece="${esc(first.id)}" aria-label="Ampliar: ${esc(first.title)}"><span aria-hidden="true">↗</span> Ampliar</button>
                                    <div class="vframe-arrows"><button type="button" class="vbtn vprev" aria-label="Pieza anterior">${CHEVRON_L}</button><button type="button" class="vbtn vnext" aria-label="Pieza siguiente">${CHEVRON_R}</button></div>
                                </div>
                            </div>
                            ${brandPalette(brand)}
                        </div>
                    </div>
                    <footer class="brand-case-footer"><span>${esc(brand.name)} · Proyecto de identidad visual por Abby.</span>${footerLink}</footer>
                </article>`;
            })
            .join("");
        window.VerticalTabs && brandCases.querySelectorAll("[data-vtabs]").forEach((el) => window.VerticalTabs.mount(el));
    }
    renderBrands();

    // Un solo evento abre todas las piezas; también funciona al agregar imágenes nuevas.
    brandCases.addEventListener("click", (event) => {
        const button = event.target.closest("[data-brand]");
        if (!button) return;
        const brand = brands.find((item) => item.id === button.dataset.brand);
        const piece = button.dataset.mascot
            ? brand.mascots.find((item) => item.id === button.dataset.mascot)
            : brand.pieces.find((item) => item.id === button.dataset.piece);
        if (!piece) return;
        openDetail(
            `<p class="eyebrow">${esc(brand.name)}</p><h2>${esc(piece.title || piece.name)}</h2><img src="${safeUrl(piece.image)}" alt="${esc(piece.title || piece.name)}"><p>${esc(piece.description || "Mascota ilustrada de La Cocina de Carmencita.")}</p>`,
        );
        // El identificador del proyecto se elimina al cerrar; el modal usa los colores del estudio.
        dialog.dataset.brandTheme = brand.theme;
    });
    dialog.addEventListener("close", () => delete dialog.dataset.brandTheme);

    // 5. Banners: agregá src en data.js para activar un video real con controles.
    // Los banners buscan sus contenedores por id, de modo que pueden ir en distintas secciones.
    banners.forEach((b) => {
        const section = document.getElementById(b.id);
        if (!section) return;
        section.innerHTML = b.src
            ? `<video controls playsinline preload="metadata" poster="${safeUrl(b.poster)}" aria-label="${esc(b.title)}"><source src="${safeUrl(b.src)}" type="video/mp4">Tu navegador no admite video.</video><div class="video-caption"><h2>${esc(b.title)}</h2><p>${esc(b.caption)}</p></div>`
            : `<div class="film-layout"><div><p class="eyebrow">${esc(b.eyebrow)}</p><h2>${esc(b.title)}</h2><p>${esc(b.caption)}</p></div><div class="film-art"><img src="${safeUrl(b.poster)}" alt="Pieza gráfica de House Studio" loading="lazy"></div></div>`;
    });

    // 6. Movimiento siempre activo, como configuración de este portafolio.
    // (El parallax y la entrada del hero viven en hero.js.)
    document.documentElement.dataset.motion = "on";
    document.documentElement.classList.remove("motion-paused");

    // Normaliza también las flechas del HTML y de los casos de branding.
    enhanceIconography(document.body);

    // Contador de la navegación: sale de data.js para que no vuelva a desactualizarse.
    const navCount = document.querySelector('.nav a[href="#proyectos"] sup');
    if (navCount) navCount.textContent = String(projects.length).padStart(2, "0");

    // Año del pie de página: evita actualizarlo a mano cada enero.
    $("#year").textContent = new Date().getFullYear();
})();


/* HOUSE-STUDIO · EXPERIENCIA DESPUÉS DE LA INTRO
   Se carga después de script.js e intro.js. No cambia los proyectos de data.js. */
(() => {
    'use strict';
    const root = document.documentElement;
    const intro = document.querySelector('#studio-intro');
    const themeButton = document.querySelector('#theme-toggle');
    const systemTheme = matchMedia('(prefers-color-scheme: dark)');
    let explicitTheme = false;
    try { explicitTheme = ['light', 'dark'].includes(localStorage.getItem('house-studio-atmosphere-theme')); } catch {}
    function paintTheme(theme) {
        root.dataset.theme = theme;
        const dark = theme === 'dark';
        themeButton?.setAttribute('aria-pressed', String(dark));
        themeButton?.setAttribute('aria-label', dark ? 'Activar modo claro' : 'Activar modo oscuro');
        if (themeButton) themeButton.querySelector('span').textContent = dark ? 'Modo claro' : 'Modo oscuro';
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0c1014' : '#eee7da');
    }
    paintTheme(root.dataset.theme || 'dark');
    themeButton?.addEventListener('click', () => {
        const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        explicitTheme = true; paintTheme(theme);
        try { localStorage.setItem('house-studio-atmosphere-theme', theme); } catch {}
    });
    // El jardín abre en modo oscuro; el botón conserva la elección manual del visitante.

    // Franja de servicios y franja de Carmencita: mismo contenido, dos copias visuales.
    document.querySelectorAll('.service-strip').forEach(strip => {
        const group = document.createElement('div'); group.className = 'marquee-group';
        const original = strip.matches('.service-strip') ? strip.firstElementChild : strip;
        if (!original || strip.querySelector('.marquee-track')) return;
        while (original.firstChild) group.append(original.firstChild);
        strip.replaceChildren();
        const track = document.createElement('div'); track.className = 'marquee-track';
        const copy = group.cloneNode(true); copy.setAttribute('aria-hidden', 'true');
        track.append(group, copy); strip.append(track);
    });

    // La entrada del título y del hero la controla hero.js después de la intro.
    let started = false;

    // Apariciones al hacer scroll; MutationObserver incluye tarjetas nuevas tras filtrar.
    let observer = null;
    const selectors = '.projects-carousel, .section-head, .film-layout, .about, .contact, .pricing-foot';
    function registerReveals() {
        if (!started || !observer) return;
        document.querySelectorAll(selectors).forEach(element => {
            if (element.classList.contains('scroll-reveal')) return;
            element.classList.add('scroll-reveal'); observer.observe(element);
        });
    }
    function showAll() {
        document.querySelectorAll('.scroll-reveal').forEach(element => element.classList.add('is-visible'));
        observer?.disconnect();
    }
    function begin(typewriter = true) {
        if (started || intro?.open) return;
        started = true;

        if ('IntersectionObserver' in window) {
            observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('is-visible'); observer.unobserve(entry.target);
                });
            }, { threshold: 0, rootMargin: '0px 0px -35px 0px' });
            registerReveals();
        }
    }
    // La intro avisa al terminar el acercamiento, no al pulsar ni durante la carga.
    window.addEventListener('house:entered', event => {
        requestAnimationFrame(() => requestAnimationFrame(() => begin(event.detail.typewriter)));
    }, { once: true });
    if (!intro) requestAnimationFrame(() => begin(true));
    // Respaldo para una intro ausente o que no pudo abrirse.
    window.addEventListener('load', () => {
        if (!intro?.open && !started) requestAnimationFrame(() => begin(false));
    }, { once: true });
    const contentObserver = new MutationObserver(registerReveals);
    ['#projects', '#gallery'].forEach(id => {
        const element = document.querySelector(id);
        if (element) contentObserver.observe(element, { childList: true });
    });
})();
