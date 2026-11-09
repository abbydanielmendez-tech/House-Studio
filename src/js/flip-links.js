/* HOUSE-STUDIO · ENLACES "FLIP" DEL PIE DE PÁGINA
   Versión en JavaScript nativo del componente "RevealLinks / FlipLink" (React + Motion). Convierte el texto de cada
   enlace marcado con data-flip en DOS capas de letras sueltas, una encima de la otra:
        capa A (visible)  → el texto normal
        capa B (escondida abajo) → el mismo texto, en color de acento
   Al pasar el cursor (o enfocar con teclado), cada letra de la capa A sube y sale, y la de la capa B sube y ocupa su
   lugar; cada letra espera un poco más que la anterior (retraso --i), y eso crea el efecto de ola.
   Este archivo SOLO prepara las letras (cada una lleva su número en --i). El movimiento es CSS puro:
   scss/components/_flip-links.scss (duración 0,25 s y pausa de 0,025 s entre letras, igual que el original).

   Accesibilidad: el enlace conserva su nombre con aria-label (así el texto duplicado no se lee dos veces) y las capas van
   aria-hidden. Sin JavaScript, el enlace sigue siendo un enlace normal con el texto a la vista. */
(() => {
    'use strict';
    const layer = (text, name) => {
        const box = document.createElement('span');
        box.className = `flip-layer ${name}`;
        box.setAttribute('aria-hidden', 'true');
        [...text].forEach((char, index) => {
            const letter = document.createElement('span');
            letter.style.setProperty('--i', String(index));
            letter.textContent = char === ' ' ? '\u00a0' : char;
            box.appendChild(letter);
        });
        return box;
    };
    document.querySelectorAll('[data-flip]').forEach(link => {
        const text = link.textContent.trim();
        if (!text || link.dataset.flipReady) return;
        if (!link.hasAttribute('aria-label')) link.setAttribute('aria-label', text);
        link.textContent = '';
        link.append(layer(text, 'flip-a'), layer(text, 'flip-b'));
        link.dataset.flipReady = '1';
    });
})();
