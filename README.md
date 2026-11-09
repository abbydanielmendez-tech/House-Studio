<<<<<<< HEAD
# House-Studio · SASS + Gulp

Portafolio de Abby Mendez Alvarez. Hero con video de fondo y animaciones con anime.js, la intro del televisor, las franjas marino y los casos de branding.

## Empezar en Visual Studio Code

1. Descomprimí el ZIP y abrí **la carpeta que contiene package.json** en VS Code.
2. Abrí Terminal → Nueva terminal. Los comandos funcionan en PowerShell, Git Bash y terminales Unix.
3. Comprobá Node.js con `node -v`. Este proyecto requiere Node **20.19.0 o superior**.
4. Instalá las dependencias exactas del archivo de bloqueo:

```sh
npm install        # instala también animejs (ya está en package.json); usá "npm install" y no "npm ci" la primera vez para que se actualice package-lock.json
```

5. Iniciá el trabajo diario:

```sh
npm run dev
```

6. Abrí `http://localhost:3000`. Al guardar HTML, SASS, JS o imágenes, Gulp recompila y BrowserSync recarga la página.
7. Para cerrar el servidor, presioná **Ctrl+C**.

No necesitás instalar Gulp globalmente ni usar Live Sass Compiler. Evitá abrir el HTML de `src/` directamente: referencia las salidas que genera Gulp.

## Qué editar

| Ruta | Responsabilidad |
| --- | --- |
| `src/index.html` | Estructura, textos fijos y pantalla de carga. |
| `src/scss/app.scss` | Orden de los módulos `@use` (**el orden es la cascada CSS**). |
| `src/scss/abstracts/_tokens.scss` | Mapas Sass de la paleta nocturna y clara. |
| `src/scss/base/` | Variables originales, reinicio, tipografía y movimiento heredado. |
| `src/scss/layout/` | Contenedor, cabecera, encabezado de sección y pie. |
| `src/scss/components/` | Un archivo por componente: proyectos, filtros, pila de tarjetas (`_stack-deck`), pestañas verticales (`_vertical-tabs`), contacto, modal, marquee, branding… `_hover-fx` reúne los hovers y la profundidad 3D. |
| `src/scss/scenes/` | Intro (`_intro`, `_intro-3d`), hero con video (`_hero`) y hero antiguo (`_hero-legacy*`). |
| `src/scss/layers/` | Capas que sobrescriben a las anteriores: `_responsive`, `_dark-mode`, `_atmosphere` (**acabado visual vigente**). |
| `src/js/data.js` | Ocho proyectos, tecnologías, historias y piezas de marca. |
| `src/js/stack-deck.js` | Pila de tarjetas de la galería: calcula el movimiento al hacer scroll (ver abajo). Se carga antes de `script.js`. |
| `src/js/vertical-tabs.js` | Pestañas verticales de los casos de marca: estado, avance automático y pausas (ver abajo). Se carga antes de `script.js`. |
| `src/js/site-menu.js` | Menú desplegable de la cabecera (abre/cierra y accesibilidad). Se carga antes de `script.js`. |
| `src/js/flip-links.js` | Prepara las letras de los enlaces grandes del pie (efecto "flip"). Se carga antes de `script.js`. |
| `src/js/script.js` | Galerías, filtros, ventanas, tema y efectos generales. |
| `src/js/hero.js` | Hero: video de fondo (versión liviana en pantallas chicas, pausa fuera de pantalla), entrada con anime.js, tarjeta de proyectos que cambia sola y integración con el scroll. Expone `window.HSMotion` ({ tween, count }) para animar otras partes. |
| `src/js/projects-carousel.js` | Carrusel de proyectos: arrastre con resorte, puntos, flechas, teclado y avance automático (cada 10 s). |
| `src/js/pricing.js` | Precios y paquetes: mensaje de WhatsApp por paquete, luz del borde con el cursor y modo táctil de las tarjetas. |
| `src/js/perf-meter.js` | Medidor de fps (solo con `?fps` en la URL). |
| `src/js/interactions.js` | Inclinación 3D con brillo en tarjetas y efecto imán en botones. |
| `src/js/intro.js` | Secuencia de carga, casetes arrastrables, lámpara, polvo y evento que inicia el hero. |
| `src/images/` | Imágenes originales PNG, JPG, JPEG o WebP, con subcarpetas. |
| `src/videos/` | Videos opcionales, copiados a `dist/assets/videos/`. |
| `gulpfile.js` | Tareas de compilación, imágenes, informe y servidor. |
| `dist/` | Resultado listo para publicar. **No editar a mano**. |
| `reports/build.json` | Pesos antes/después y capturas pendientes; se regenera. |

Los comentarios explican las responsabilidades de cada módulo. La separación conserva el orden CSS del diseño aprobado; los estilos de atmósfera se aplican después de la base. Los archivos `scenes/_hero-legacy*.scss` y `components/_typewriter.scss` conservan reglas del hero y del título antiguos; ya no tienen elementos en el HTML, pero no los borres sin revisar sus selectores y comprobar el resultado.

## Interacciones 3D

- **Hero (video):** el fondo es `src/videos/hero-loop.mp4` (Full HD 1920×1080, ~6,5 MB). `hero-loop-sm.mp4` (720p, ~2,1 MB) se usa en teléfonos (≤700 px) y en pantallas de ≤1500 píxeles reales (ancho × densidad, tope 2×); el resto recibe Full HD. El póster `src/images/hero-poster.jpg` (1920×1080) es el fotograma 0 del video. El video va y vuelve (ida y vuelta) y frena suave en los extremos. Con "ahorro de datos" o reducir movimiento solo se muestra el póster. Las sombras (cabecera, columna de texto, viñeta y base) están en `.hero-shade` y `.hero-fade` de `scenes/_hero.scss`. Al hacer scroll el video se aleja, crece y se oscurece hasta el negro del vistazo, y la interfaz sube y se desvanece. La tarjeta pequeña muestra el proyecto en pantalla (cambia cada 6 s o al pulsarla). El `<h1>PORTAFOLIO</h1>` sigue en el HTML pero oculto (`sr-only`) por accesibilidad y SEO.
- **Cambiar el video:** exporta tu video sin audio (idealmente en 1080p o más, sin comprimir mucho) y ejecuta, por ejemplo, para la versión Full HD:
  `ffmpeg -i tu-video.mp4 -an -filter_complex "[0:v]scale=1920:1080:flags=lanczos,format=yuv420p,split[a][b];[b]reverse,trim=start_frame=1,setpts=PTS-STARTPTS[r];[a][r]concat=n=2:v=1:a=0" -c:v libx264 -preset slow -crf 21 -profile:v high -level 4.2 -pix_fmt yuv420p -maxrate 8M -bufsize 16M -x264-params aq-mode=3 -movflags +faststart src/videos/hero-loop.mp4`
  (si tu video ya es un bucle perfecto, quita `split`, `reverse` y `concat`, y el `loop` del `<video>` basta; el movimiento "ida y vuelta" frena en la mitad del archivo). Repite con `scale=1280:720`, `-crf 23`, `-level 4.0` y `-maxrate 3M -bufsize 6M` para `hero-loop-sm.mp4`, y saca el póster del fotograma 0: `ffmpeg -i src/videos/hero-loop.mp4 -frames:v 1 -q:v 2 src/images/hero-poster.jpg`. Más calidad = `-crf` más bajo (18 pesa mucho más); menos peso = `-crf` más alto (24–26). Importante: el video final nunca puede tener más detalle que el original; si el tuyo es de 720p, subirlo a 1080p solo mejora la nitidez de los bordes y la limpieza, no inventa detalle.
- **anime.js:** `npm install` lo instala y `gulpfile.js` lo antepone al paquete único (`dist/js/app.min.js`). Si no estuviera, `hero.js` usa la Web Animations API y todo se ve igual (la consola de `gulp` avisa).
- **Pantalla de carga:** arrastrá un casete a la ranura de la videograbadora (o hacé clic / tocá / Enter) para cambiar el canal de la tele; la lámpara activa el modo noche; la lluvia, el polvo y el resplandor se mueven con el mouse. El ángulo de inclinación está en el `pointermove` de `intro.js`.
- **Tarjetas y botones:** inclinación 3D con brillo (`interactions.js`, constante `MAX`), tarjetas vecinas atenuadas, aparición con giro al hacer scroll y botones con efecto imán.
- Los efectos de mouse no se activan con toque. La intro respeta "reducir movimiento" del sistema; el resto sigue la regla `data-motion="on"` del portafolio (ver `script.js`).


## Rendimiento (fluidez y 60 fps)

Qué se hizo y por qué:
- **Solo compositor al moverse:** las capas del hero, las tarjetas, las capturas del vistazo y la lluvia de la intro se animan con `transform`/`translate`/`opacity`, que no repintan ni recalculan el layout.
- **Hero ligero:** sin canvas: un video de 1,4 MB (385 KB en celular) que se pausa fuera de pantalla, capas CSS con transform y opacity, y una sola librería de movimiento (anime.js, ~25 KB).
- **Sin trabajo inútil:** el vistazo mide el layout una vez (no en cada fotograma), el hero y su presentación se pausan fuera de pantalla, con la pestaña oculta y con el mouse sobre la tarjeta, y se quitaron `mix-blend-mode`, `filter: blur` y `backdrop-filter` en las animaciones (muy caros en GPU).
- **Carga:** la imagen de la intro se precarga con prioridad, las demás son `lazy`, y el build genera `dist/_headers` con caché de un año para CSS/JS (llevan `?v=hash`) y de un día + revalidación para las imágenes.
- **Responsive:** `overflow-x: clip` (sin barra horizontal y sin romper `sticky`), objetivos táctiles de 44 px, ajustes para teléfonos de ≤380 px y en horizontal, y sin desenfoque de fondo en los modales móviles.

Cómo medirlo en tu equipo (no se puede garantizar 60 fps sin medir en tu hardware):
1. Abrí `http://localhost:3000/?fps` (o tu dominio con `?fps`): aparece un medidor con los fps, el peor fotograma y cuántos pasaron de 33 ms.
2. Para un diagnóstico fino: DevTools → *Rendimiento* → grabá mientras hacés scroll por hero → vistazo → proyectos.
3. Si algo va a tirones, decime en qué sección y con qué dispositivo.

- **Carrusel de proyectos (`#proyectos`):** `script.js` dibuja las tarjetas y `projects-carousel.js` las mueve. Constantes al inicio del archivo: `AUTO_DELAY` (10 s), `DRAG_BUFFER` (50 px para cambiar de proyecto), `SPRING` (resorte), `SCALE_ACTIVE`/`SCALE_IDLE` (0.95/0.85). El ancho de cada tarjeta se calcula en `layout()`.

- **Precios y paquetes (`#precios`):** va justo después de `#proyectos`. El contenido (textos, precios y listas) está escrito en `src/index.html`; los estilos en `scss/components/_pricing.scss` y la paleta (`--pr-*`) en `abstracts/_tokens.scss`. Es una banda oscura fija: se ve igual en modo oscuro y claro. El efecto "squishy" es CSS puro (curva `$back` y tiempo `$squish` al inicio del parcial); `pricing.js` solo añade el mensaje de WhatsApp (toma el número de la cabecera), la luz del borde y, en pantallas táctiles, activa la tarjeta que cruza el centro. Las formas de cada tarjeta se deforman con `--h1/--h2/--h3` (una transformación por forma). Con "reducir movimiento" del sistema se quitan las escalas y deformaciones, salvo que `<html data-motion="on">` (la regla del portafolio) lo fuerce. Para cambiar un precio, edita el texto de `.price-num` en `index.html`. Cada tarjeta muestra una vista resumida y un botón "Ver detalles del paquete" que despliega su lista (menú deslizable: `.price-details` anima `grid-template-rows`; sin JavaScript la lista queda abierta). Debajo de las tarjetas hay una franja "Cómo trabajamos" (`.pricing-steps`, tres pasos) y cada tarjeta tiene su línea "Ideal para…" (`.price-for`); ambos textos se editan en `index.html`.

- **Vista previa al compartir el enlace (WhatsApp, redes):** las etiquetas `og:*` están en el `<head>` de `src/index.html` y la imagen (1200×630, JPG a propósito) en `src/social/og-image.jpg`; el build la copia a `dist/assets/`. Las redes exigen URL absolutas, así que abre `gulpfile.js` y escribe tu dirección en `SITE_URL` (ej. `'https://tu-dominio.com'`, sin barra final) o compila con la variable de entorno `SITE_URL`. Si queda vacío, el build avisa y no publica `og:url` ni `og:image` (mejor nada que un enlace roto). WhatsApp guarda la vista previa en caché: tras publicar, pruébala con un enlace nuevo o en el depurador de Facebook.
- **Botón de tema:** ahora es un círculo con solo el ícono (para no tapar contenido); el nombre del modo aparece al pasar el cursor o enfocarlo con teclado. Estilos en `scss/components/_theme-toggle.scss`.
- **Numeración de las secciones:** 01 Diseño & desarrollo, 02 Servicios & inversión, 03 Identidad visual, 04 Detrás de House-Studio, 05 La próxima idea. Si agregas otra sección, renumera las etiquetas `.eyebrow` de `index.html`.
- **Contador de Proyectos en la navegación:** se calcula desde `data.js` (`script.js`); el número del HTML solo es el respaldo sin JavaScript.

## Pila de tarjetas (Identidad visual → "House Studio, por dentro")

Las piezas de `STUDIO.gallery` (en `data.js`) se muestran como tarjetas que entran desde abajo y se **apilan como pestañas de carpeta** mientras se baja por la página. Los filtros (Todos, Branding, Logos, Ilustración) siguen funcionando: al elegir uno, la pila se reconstruye con esas piezas.

**Cómo funciona, en 4 ideas** (también está explicado dentro de `js/stack-deck.js`):

1. **Pista alta + escenario pegado.** `.stack-track` es una caja muy alta (una pantalla + un tramo de scroll por tarjeta). Dentro, `.stack-sticky` usa `position: sticky` y se queda fijo en pantalla mientras la pista pasa por debajo. En ese tiempo, el scroll no mueve el contenido: "mueve el tiempo" de la animación.
2. **Progreso de 0 a 1.** El JS mide cuánto de la pista se recorrió. Con N tarjetas hay N−1 transiciones; la tarjeta *i* entra entre (i−1)/(N−1) y i/(N−1).
3. **Puntos clave por tarjeta.** Para cada tarjeta se define dónde está (`y`) y cuánto mide (`scale`) según el progreso: antes de su turno espera fuera de pantalla; en su turno queda al frente; cuando entran las siguientes sube `--stack-lift` px y se encoge `--stack-shrink`. Entre dos puntos se interpola en línea recta. El contenido de las tarjetas tapadas se desvanece (`--bury`) para que solo asome la pestaña.
4. **Suavizado.** La animación persigue al progreso real con inercia (`TAU` en `stack-deck.js`, 0,16 s), como un resorte. Así el movimiento es fluido sin librerías y sin cambiar el scroll nativo del navegador (por eso no se usa Lenis).

**Qué puedes ajustar** (variables al inicio de `scss/components/_stack-deck.scss`, en `.stack-deck`):

| Variable | Qué hace |
| --- | --- |
| `--stack-step: 80vh` | Cuánto hay que bajar para pasar a la siguiente tarjeta. Más = más lento. |
| `--stack-lift: 44px` | Cuánto sube cada tarjeta anterior (cuánto se ve de su pestaña). |
| `--stack-shrink: .035` | Cuánto se encoge cada tarjeta por nivel. |
| `--stack-depth: 3` | Cuántas pestañas se ven apiladas; las más antiguas quedan escondidas. |
| `--stack-top: 4.5rem` | Espacio libre arriba para que la cabecera no tape la pila. |

En móvil (≤ 820 px) hay valores propios más pequeños en la sección *Responsive* del mismo archivo.

**Colores.** Cada pieza de `data.js` puede llevar `tone: "blue" | "orange" | "ink" | "cream"` (azul, naranja, negro tinta o crema: los colores de la identidad de House Studio, con texto de contraste suficiente). Si no lo pones, se asigna por orden. Elige un tono que contraste con el fondo de la imagen (por ejemplo, una imagen crema se ve mejor sobre azul, naranja o negro). Para cambiar los colores, edita los `.tone-*` en el mismo archivo.

**Para agregar una pieza:** añade un objeto a `STUDIO.gallery` con `id`, `title`, `filter`, `image`, `description` y, si quieres, `tone`. La pila se ajusta sola al número de piezas.

**Movimiento reducido y casos especiales.** La pila sigue la misma regla que el resto del sitio: `script.js` fija `data-motion="on"` en `<html>` y eso **gana** sobre "reducir movimiento" del sistema, así que la animación se ve aunque tu equipo tenga las animaciones desactivadas. Si quieres respetar siempre la preferencia del sistema, quita esa línea de `script.js`: entonces, con "reducir movimiento", las tarjetas pasan a una lista normal (clase `.is-static`). También hay lista normal en ventanas de menos de 500 px de alto o si un filtro deja una sola pieza. En ventanas poco altas (≤ 700 px) la pila usa medidas más compactas. Con el teclado, al enfocar el botón de una tarjeta que no está al frente la página se desplaza hasta su turno. Las imágenes se muestran completas (sin recortar logos ni láminas); cada tarjeta abre la pieza en el visor.

**¿No ves la animación?** En la consola del navegador ejecuta `document.querySelector('#gallery').classList.contains('is-static')`: si responde `true`, la página está mostrando la lista normal (revisa los casos de arriba); si responde `false`, la pila está activa y se mueve al bajar por la sección (dura unas 4,5 pantallas de scroll). Tras recompilar, recarga con Ctrl+F5 para saltarte la caché.

## Casos de marca (Identidad visual → La Cocina de Carmencita y MoonFlower)

Cada marca de `STUDIO.brands` (en `data.js`) es un componente de **pestañas verticales**: a la izquierda la lista de piezas y a la derecha una galería cuya imagen se desliza al cambiar de pieza. Reproduce el comportamiento del componente `VerticalTabs` (React + Motion) en HTML, Sass y JS nativo, con los colores y la tipografía del sitio.

**Qué hace**
- Cada elemento de `brand.pieces` es una pestaña numerada (`/01`, `/02`…) y a la vez una diapositiva. La pestaña activa muestra su descripción desplegada y una **barra de progreso** que se llena en 5 s; al llenarse pasa sola a la siguiente pieza.
- Al cambiar de pieza, la imagen nueva entra **desde arriba** y la anterior sale **hacia abajo** (0,34 s). Las flechas ‹ › cambian de pieza, el clic en la imagen avanza, y "Ampliar" abre la pieza en el visor de siempre.
- El mouse sobre la galería **pausa** el avance (la barra vuelve a 0 y reinicia al salir). También se pausa con el teclado dentro del componente, con la galería fuera de pantalla y con la pestaña del navegador oculta.
- Una pieza con `mascots: true` (en Carmencita, "Pasteles con personalidad") muestra los pasteles de `brand.mascots` en lugar de una imagen; cada pastel se abre por separado.

**Cómo está repartido**
- `script.js` → `renderBrands()` dibuja el HTML de cada marca y llama a `VerticalTabs.mount()`.
- `scss/components/_vertical-tabs.scss` → todo lo visual **y todo el movimiento** (deslizamiento, barra, despliegue): son transiciones y animaciones CSS, solo con `transform` y `opacity`.
- `js/vertical-tabs.js` → solo decide el estado con clases y atributos: qué pestaña está activa, qué diapositiva está `is-active`, `is-leaving` (saliendo hacia abajo) o `is-parked` (esperando arriba), y cuándo corre el avance (`data-autoplay` = `on`, `off` o `static`). El avance lo marca la propia barra: al terminar su animación (`animationend`) se pasa a la siguiente.

**Qué puedes ajustar** (al inicio de `_vertical-tabs.scss`, en `.vtabs`): `--vtabs-delay` (5 s por pieza), `--vslide-time` (.34 s de deslizamiento), `--vframe-ratio` / `--vframe-wide` (proporción del marco; Carmencita usa 4 / 3 en escritorio). Para agregar una pieza, añade un objeto a `pieces` con `id`, `title`, `group`, `image` y `description`: la lista, las diapositivas y la numeración se ajustan solas. Las imágenes se ven **completas** (sin recortar logos ni láminas) sobre una copia desenfocada de sí mismas que rellena el marco.

**Movimiento reducido.** Igual que el resto del sitio, `data-motion="on"` (lo fija `script.js`) gana sobre "reducir movimiento" del sistema. Si lo quitas, sin movimiento no hay avance automático (la barra queda llena y fija) y los cambios de pieza son instantáneos.

**Accesibilidad.** Patrón de pestañas (`tablist`/`tab`/`tabpanel`): con el teclado, ↑ ↓ ← → recorren las piezas y Inicio/Fin saltan a los extremos. Las diapositivas no activas van `aria-hidden`.

## Menú de la cabecera (estilo hamburguesa)

La barra de enlaces fija se reemplazó por un botón **Menú** con un icono de hamburguesa que se transforma en una X y abre un panel desplegable. Funciona igual en escritorio y en móvil. A la derecha del logo quedan solo "Hablemos ↗" (se oculta en móvil: su función la cumple la opción *Contacto*) y el botón del menú. WhatsApp pasó del encabezado a una opción al final del menú.

**Animación** (reproduce el componente `StaggeredDropDown` de React + Motion, en CSS y JS nativos): al abrir, el panel se despliega desde arriba y *después* entran las opciones una tras otra (opacidad + desplazamiento), cada icono aparece creciendo con un pequeño rebote. Al cerrar, primero salen las opciones y al final se pliega el panel. Todo el movimiento es CSS (`scss/components/_site-header.scss`); `js/site-menu.js` solo cambia la clase `.is-open` y `aria-expanded`.

**Qué puedes ajustar** (variables en `.site-menu`, al inicio de `_site-header.scss`): `--enter` (lo que tarda el panel en desplegarse), `--stagger` (pausa entre opciones al abrir) y `--stagger-out` (al cerrar). Para agregar o quitar una opción, edita la lista `<ul>` dentro de `header.nav` en `src/index.html`: copia un `<li class="menu-item" style="--i:N">` y numera `--i` en orden (el JS ajusta solo el cierre escalonado).

**Cierre y accesibilidad.** Se cierra al elegir una opción, al tocar fuera, con Escape (devuelve el foco al botón) y cuando el foco sale del menú con Tab. Cerrado, sus enlaces no reciben foco ni los lee un lector de pantalla. Respeta la regla del sitio: `data-motion="on"` gana sobre "reducir movimiento" del sistema. En pantallas táctiles el botón y las opciones miden al menos 44 px.

## Pie de página con enlaces "flip"

El pie muestra enlaces tipográficos grandes (WhatsApp, Proyectos, Precios, Identidad) y, debajo, una franja con el logo, tu nombre y ubicación, el año y "Volver arriba". Al pasar el cursor (o enfocar con el teclado) las letras suben una tras otra, como una ola, y dejan ver el mismo texto en el color de acento. Reproduce el componente `RevealLinks / FlipLink` (React + Motion) en CSS y JS nativos, con la misma duración (0,25 s) y la misma pausa entre letras (0,025 s).

**Cómo funciona.** `js/flip-links.js` parte el texto de cada enlace marcado con `data-flip` en dos capas de letras sueltas (una visible y otra escondida debajo, en color de acento), cada letra con su posición en `--i`. El movimiento es CSS puro (`scss/components/_flip-links.scss`): cada letra tiene una transición con retraso `--i × pausa`. Los enlaces conservan su nombre con `aria-label` (el texto duplicado no se lee dos veces) y, sin JavaScript, siguen siendo enlaces normales.

**Para añadir o cambiar un enlace**, edita `<nav class="footer-links">` en `src/index.html`: copia una línea `<a class="flip-link" href="..." data-flip>Texto</a>` y cambia el texto y el enlace (para páginas externas añade `target="_blank" rel="noopener noreferrer"`). Hoy solo hay canales que existen en el sitio (WhatsApp con tu número); añade ahí Instagram, LinkedIn, GitHub o tu correo (`mailto:...`) con tus URL reales. Ajustes en `.footer-links` de `_flip-links.scss`: `--flip-time` y `--flip-stagger`. Respeta la regla del sitio: `data-motion="on"` gana sobre "reducir movimiento".

## Agregar o cambiar imágenes

1. Poné el original dentro de `src/images/`. Ejemplo: `src/images/mi-proyecto.png`.
2. En `src/js/data.js`, indicá **la ruta de salida WebP**, no la del original:

```js
image: "assets/mi-proyecto.webp",
```

3. Guardá. Gulp genera `dist/assets/mi-proyecto.webp`.

No guardés `logo.png` y `logo.jpg` en la misma carpeta: producirían el mismo `logo.webp`; Gulp avisa del conflicto.

Las imágenes transparentes se convierten a WebP sin pérdida y conservan su canal alfa; si el resultado pesa más de 300 KB (`LOSSLESS_ALPHA_MAX` en `gulpfile.js`), el color se guarda con pérdida (calidad 86) pero el alfa queda idéntico, que es lo que valida `npm run check`. Las opacas usan calidad 88 y mantienen sus dimensiones. Los WebP existentes se copian sin recomprimir. Los archivos originales se conservan en `src/images/` y **no se publican**.

### Capturas de los proyectos

Las ocho capturas (`ProyectoMusica.png`, `FrontEnd.png`, `BlogCafe.png`, `BienesRaices.png`, `PizzeriaAbbytos.png`, `EpicBurguer.png`, `Nebulatte.png`, `Carmencita.png`) viven en `src/images/` y `data.js` ya apunta a su versión `.webp`. Si falta alguna, la compilación muestra una portada editorial y lo avisa en `reports/build.json`.

### Cambiar el fondo de carga

Reemplazá `src/images/intro/estudio-hd.webp` o agregá otra imagen y cambiá el `src` de `.intro-room` en `src/index.html` por su ruta de salida `assets/intro/nombre.webp`. Si el televisor está en otra posición, ajustá las coordenadas en `_intro.scss`.

## Publicar

```sh
npm run build
npm run check
```

Subí **solo el contenido de `dist/`**. En Netlify podés arrastrar esa carpeta; para integración con Git, el comando es `npm run build` y el directorio de publicación es `dist`.

`npm run build` borra y vuelve a crear únicamente `dist/`, compila SASS comprimido, convierte imágenes, reúne/minifica JS y actualiza las versiones de los enlaces CSS/JS. No borra tus originales de `src/`.

`npm run check` verifica el catálogo, filtros, modales, temas, rutas de recursos y dimensiones/transparencias WebP. Es una comprobación funcional sin navegador; no sustituye la revisión visual en teléfono y computadora.

## Qué mejoró

- CSS organizado con `@use`, mapas Sass y un mixin reutilizable de paletas.
- Un CSS y un JS de salida: menos solicitudes y archivos minificados.
- WebP para todas las imágenes disponibles, conservando originales y transparencias.
- Imágenes sin cambios reutilizadas durante desarrollo y tareas en cola para evitar compilaciones que se pisen.
- Caché de CSS/JS actualizada mediante huella del contenido.
- Mapas Sass en desarrollo; código comprimido sin mapas en producción.

SASS por sí solo no hace más rápida la web: la mejora de descarga viene de la minificación, la agrupación de archivos y WebP. La carga sigue siendo una secuencia visual; su porcentaje no mide bytes reales. La duración artificial de la intro no se redujo.

## Referencias oficiales

- https://gulpjs.com/docs/en/getting-started/creating-tasks/
- https://sass-lang.com/documentation/js-api/functions/compile/
- https://sharp.pixelplumbing.com/api-output/#webp
=======
