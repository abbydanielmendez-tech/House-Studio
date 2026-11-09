/** Comprobaciones de compilación y comportamiento sin depender de servicios externos. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { JSDOM } from 'jsdom';

const html=await fs.readFile('dist/index.html','utf8');
const js=await fs.readFile('dist/js/app.min.js','utf8');
const css=await fs.readFile('dist/css/app.min.css','utf8');
assert(!html.includes('__ASSET_VERSION__'),'Falta versionar el HTML');
const dom=new JSDOM(html,{url:'https://house.test',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,d=w.document;
w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
w.ResizeObserver=class {observe(){} disconnect(){}};
w.IntersectionObserver=class {observe(){} unobserve(){} disconnect(){}};
w.requestAnimationFrame=()=>1;w.cancelAnimationFrame=()=>{};
w.Range.prototype.getBoundingClientRect=()=>({right:500});
w.HTMLCanvasElement.prototype.getContext=()=>({setTransform(){},clearRect(){},beginPath(){},moveTo(){},quadraticCurveTo(){},fill(){},stroke(){},fillRect(){},arc(){},ellipse(){},createRadialGradient(){return {addColorStop(){}}}});
w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
w.eval(js);
assert.equal(d.querySelector('h1').textContent,'PORTAFOLIO');
assert.equal(d.querySelectorAll('#projects .project').length,w.STUDIO.projects.length);
assert.equal(d.querySelectorAll('.brand-case').length,2);
assert.equal(d.querySelectorAll('.ambient-mascot').length,0);
// Precios: sección justo después de proyectos, tres paquetes y WhatsApp con el mensaje de cada uno.
assert.equal(d.querySelector('#proyectos').nextElementSibling.id,'precios');
assert.equal(d.querySelectorAll('#precios .price-card').length,3);
const packages=[...d.querySelectorAll('#precios .price-cta')].map(link=>{
 const url=new URL(link.href);assert.equal(url.hostname,'wa.me');
 return decodeURIComponent(url.searchParams.get('text'));
});
assert.deepEqual(packages,['Starter','Business','Premium'].map(name=>`Hola, estoy interesado en el paquete ${name} de House-Studio.`));
assert(css.includes('.price-card'),'Faltan los estilos de precios');
assert(!html.includes('__SITE_URL__'),'Quedó un __SITE_URL__ sin reemplazar');
assert.equal(d.querySelectorAll('#precios .price-for').length,3);
assert.equal(d.querySelectorAll('#precios .pricing-steps li').length,3);
const toggles=[...d.querySelectorAll('#precios .price-toggle')];
assert.equal(toggles.length,3);
toggles.forEach(button=>{
 assert.equal(button.getAttribute('aria-expanded'),'false');
 assert(d.getElementById(button.getAttribute('aria-controls'))?.querySelector('.price-list li'),'El botón no controla una lista de detalles');
});
toggles[0].click();
assert.equal(toggles[0].getAttribute('aria-expanded'),'true');
assert(toggles[0].closest('.price-card').classList.contains('is-open'));
toggles[0].click();
assert.equal(toggles[0].getAttribute('aria-expanded'),'false');
assert(d.querySelector('meta[property="og:title"]'),'Faltan las etiquetas para compartir');
// Footer: enlaces "flip" con dos capas de letras (una letra por carácter) y nombre accesible; WhatsApp usa el número del sitio.
const flips=[...d.querySelectorAll('.footer-links .flip-link')];
assert.equal(flips.length,4);
for(const link of flips){
 const text=link.getAttribute('aria-label');assert(text);
 assert.equal(link.querySelectorAll('.flip-layer').length,2);
 for(const layer of link.querySelectorAll('.flip-layer')){assert.equal(layer.getAttribute('aria-hidden'),'true');assert.equal(layer.children.length,[...text].length);}
}
assert.equal(new URL(flips[0].href).hostname,'wa.me');
assert(d.querySelector('.footer-meta #year'),'Falta el año del pie');
// Menú desplegable de la cabecera: cerrado al inicio; el botón lo abre y cierra; elegir una opción lo cierra.
const menu=d.querySelector('[data-site-menu]'),menuButton=menu.querySelector('.menu-button');
assert.equal(menu.querySelectorAll('.menu-item a').length,6);
assert.equal(menuButton.getAttribute('aria-expanded'),'false');
menuButton.click();assert(menu.classList.contains('is-open'));assert.equal(menuButton.getAttribute('aria-expanded'),'true');
menu.querySelector('.menu-item a').click();assert(!menu.classList.contains('is-open'));
menuButton.click();menuButton.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert(!menu.classList.contains('is-open'));
assert(!d.querySelector('.nav-pill'),'Quedó la barra antigua');
assert.equal(d.querySelector('a[href="#proyectos"] sup').textContent,String(w.STUDIO.projects.length).padStart(2,'0'));
assert.equal(d.documentElement.dataset.theme,'dark');
d.querySelector('#theme-toggle').click();assert.equal(d.documentElement.dataset.theme,'light');
d.querySelector('[data-filter="Logos"]').click();assert.equal(d.querySelectorAll('#gallery .stack-card').length,2);
d.querySelector('[data-project]').click();assert(d.querySelector('#detail-dialog').open);
d.querySelector('.dialog-close').click();
// Casos de marca: cada botón que amplía una pieza (o un pastel) abre el visor.
for(const button of d.querySelectorAll('#brand-cases [data-brand]')) {
 button.click();assert(d.querySelector('#detail-dialog').open);d.querySelector('.dialog-close').click();
}
// Pestañas verticales: una pestaña y una diapositiva por pieza; al elegir otra cambian pestaña, diapositiva y botón "Ampliar".
for(const brand of w.STUDIO.brands) {
 const root=d.querySelector(`#marca-${brand.id} .vtabs`);
 const tabs=[...root.querySelectorAll('.vtab')],slides=[...root.querySelectorAll('.vslide')];
 assert.equal(tabs.length,brand.pieces.length);assert.equal(slides.length,brand.pieces.length);
 assert.equal(tabs[0].getAttribute('aria-selected'),'true');assert(slides[0].classList.contains('is-active'));
 tabs[1].click();
 assert.equal(tabs[1].getAttribute('aria-selected'),'true');assert.equal(tabs[0].getAttribute('aria-selected'),'false');
 assert(slides[1].classList.contains('is-active'));assert(slides[0].classList.contains('is-leaving'));
 assert.equal(root.querySelector('.vexpand').dataset.piece,brand.pieces[1].id);
 root.querySelector('.vprev').click();assert(slides[0].classList.contains('is-active'));
}
// Toda ruta local renderizada y cada recurso estático del HTML debe existir.
for(const el of d.querySelectorAll('img[src],script[src],link[href]')) {
 const ref=el.getAttribute('src')||el.getAttribute('href');
 if(/^(https?:|#)/.test(ref))continue;
 await fs.access(path.join('dist',ref.split('?')[0]));
}
assert.equal(d.querySelectorAll('link[rel="stylesheet"]').length,1);
assert.equal(d.querySelectorAll('script[src]').length,1);
const report=JSON.parse(await fs.readFile('reports/build.json','utf8'));
for (const image of report.images) {
 const [before,after]=await Promise.all([sharp(image.source).metadata(),sharp(image.output).metadata()]);
 assert.equal(after.format,'webp');
 assert.equal(after.width,before.width);assert.equal(after.height,before.height);
 if(before.hasAlpha && !(await sharp(image.source).stats()).isOpaque) {
  assert(after.hasAlpha,`Transparencia perdida: ${image.source}`);
  const a=await sharp(image.source).extractChannel('alpha').raw().toBuffer();
  const b=await sharp(image.output).extractChannel('alpha').raw().toBuffer();
  assert(a.equals(b),`Alfa modificada: ${image.source}`);
 }
}
assert(css.includes('#0d1428'),'Falta el azul marino');
console.log(`OK: ${w.STUDIO.projects.length} proyectos, branding, filtros, modales, tema, 1 CSS, 1 JS y ${report.imageCount} imágenes WebP verificadas.`);
w.close();
