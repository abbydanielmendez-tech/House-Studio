/* HOUSE-STUDIO · MENÚ DESPLEGABLE DE LA CABECERA (estilo hamburguesa)
   Es la versión en JavaScript nativo del componente "StaggeredDropDown" (React + Motion). Este archivo solo decide el
   ESTADO (abierto / cerrado); todo el movimiento —el panel que se despliega, las opciones que entran una tras otra,
   los iconos que crecen y la hamburguesa que se vuelve X— son transiciones CSS (scss/components/_site-header.scss). Así el JS es mínimo y la animación corre en el compositor.

   Qué hace:
   · Botón "Menú" → alterna .is-open en .site-menu y aria-expanded en el botón.
   · Se cierra al: elegir un enlace, tocar fuera del menú, pulsar Escape (y devuelve el foco al botón) o al salir el foco
     del menú con el teclado.
   · Ajusta --n (cantidad de opciones) para que el cierre escalonado dure lo justo, aunque agregues o quites opciones.

   Accesibilidad: patrón de "disclosure" (botón + lista de enlaces). El panel cerrado queda visibility: hidden, así que
   sus enlaces no reciben foco ni los lee un lector de pantalla hasta que se abre. */
(() => {
    'use strict';
    const root = document.querySelector('[data-site-menu]');
    if (!root) return;
    const button = root.querySelector('.menu-button');
    const panel = root.querySelector('.menu-panel');
    if (!button || !panel) return;

    // El cierre escalonado depende de cuántas opciones hay.
    root.style.setProperty('--n', String(panel.querySelectorAll('.menu-item').length));

    const isOpen = () => root.classList.contains('is-open');
    function set(open) {
        root.classList.toggle('is-open', open);
        button.setAttribute('aria-expanded', String(open));
    }

    button.addEventListener('click', () => set(!isOpen()));
    // Elegir una opción: se cierra (el enlace navega o se desplaza a su sección por su cuenta).
    panel.addEventListener('click', event => { if (event.target.closest('a')) set(false); });
    // Tocar fuera del menú lo cierra.
    document.addEventListener('pointerdown', event => { if (isOpen() && !root.contains(event.target)) set(false); });
    // Escape cierra y devuelve el foco al botón.
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && isOpen()) { set(false); button.focus(); }
    });
    // Si el foco sale del menú (Tab hacia otro elemento), se cierra.
    root.addEventListener('focusout', event => {
        if (isOpen() && event.relatedTarget && !root.contains(event.relatedTarget)) set(false);
    });
})();
