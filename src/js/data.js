/* ==========================================================
   ARCHIVO: data.js
   CATÁLOGO LOCAL DE OCHO PROYECTOS. profile: datos personales. projects: sitios, capturas, tecnologías e historia. gallery: piezas de House Studio. banners: imágenes o videos de separadores. brands: Carmencita y Moonflower. Agregá objetos respetando comas, comillas y un id único. Es JavaScript público, no una base de datos de servidor.
   Pegá TODO este contenido en data.js (sin .txt).
   ========================================================== */

/**
 * HOUSE-STUDIO · CATÁLOGO DE CONTENIDO
 * Esta es una base de datos local: objetos JavaScript, sin servidor ni contraseñas.
 * Para agregar un proyecto, copiá un objeto de projects y usá un id único.
 * image: ruta a tu captura (ej. 'assets/mi-web.webp'); vacío usa portada editorial.
 * story: contá tu proceso real. tech: solo tecnologías que efectivamente usaste.
 * category: 'web' o 'apps'. Los filtros se construyen con estos valores.
 */
// window.STUDIO hace que script.js pueda consultar este catálogo.
// IMPORTANTE: se descarga al navegador. Nunca coloqués claves o datos privados aquí.
window.STUDIO = {
    // 01. PERFIL DE REFERENCIA.
    // En esta versión la biografía y los enlaces del HTML se editan en index.html.
    // Cambiar profile por sí solo no cambia esos textos visibles.
    profile: {
        name: "Abby Mendez Alvarez",
        location: "La Suiza, Turrialba · Costa Rica",
        whatsapp: "50662395171",
    },
    // 02. PROYECTOS WEB Y APPS.
    // id: identificador único. title: nombre visible. label: especialidad.
    // category: filtro ('web', 'apps' o una categoría nueva).
    // cover: clase de portada editorial ('festival', 'store', 'cafe', etc.).
    // coverTitle: título de esa portada; \n introduce un salto de línea.
    // color: color hexadecimal de respaldo. image: captura real o '' si no hay.
    // url: enlace público del proyecto. tech: herramientas verificadas.
    // summary: resumen de la tarjeta. story: pasos mostrados en el modal.
    // tech vacío significa que la ficha técnica está pendiente de completar.
    projects: [
        // PROYECTO: Festival de Música.
        {
            id: "festival",
            title: "Festival de Música",
            label: "Música & experiencias",
            category: "web",
            cover: "festival",
            coverTitle: "TURN UP\nTHE WEB.",
            color: "#d9e5ce",
            image: "assets/ProyectoMusica.webp",
            url: "https://festivalmusicaabbyto.netlify.app/",
            tech: ["HTML", "JavaScript", "SASS", "Gulp", "Node.js"],
            summary: "Un encuentro entre música, diseño y código.",
            story: [
                { title: "La idea", text: "Construir un sitio para un festival de música." },
                {
                    title: "La construcción",
                    text: "Desarrollé el sitio con HTML, JavaScript y SASS, con Gulp y Node.js como herramientas de trabajo.",
                },
                {
                    title: "El proyecto",
                    text: "Una experiencia web dedicada al festival. Podés explorar la versión publicada desde el enlace.",
                },
            ],
        },
        // PROYECTO: T-Shirts Store.
        {
            id: "store",
            title: "T-Shirts Store",
            label: "Catálogo & diseño responsive",
            category: "web",
            cover: "store",
            coverTitle: "WEAR\nYOUR CODE.",
            color: "#e7dff6",
            image: "assets/FrontEnd.webp",
            url: "https://frontend-storeabbytomendez.netlify.app/",
            tech: ["HTML", "CSS"],
            summary: "Una tienda pensada para acompañarte en cualquier pantalla.",
            story: [
                {
                    title: "La idea",
                    text: "Crear una tienda de camisetas con una presentación clara.",
                },
                {
                    title: "La construcción",
                    text: "Trabajé con HTML y CSS, prestando especial atención a la adaptación para dispositivos móviles.",
                },
                {
                    title: "El proyecto",
                    text: "Un ejercicio de diseño de tienda y maquetación responsive.",
                },
            ],
        },
        // PROYECTO: Blog de Café.
        {
            id: "cafe",
            title: "Blog de Café",
            label: "Contenido & lectura",
            category: "web",
            cover: "cafe",
            coverTitle: "UN CAFÉ.\nUNA HISTORIA.",
            color: "#e1cab0",
            image: "assets/BlogCafe.webp",
            url: "https://blogdecafeabbyto.netlify.app/",
            tech: [],
            summary: "Un espacio limpio y funcional para disfrutar del contenido.",
            story: [
                { title: "La idea", text: "Diseñar un blog alrededor del café." },
                {
                    title: "El enfoque",
                    text: "El proyecto original destaca un diseño limpio y funcional y contenido orientado al SEO.",
                },
                {
                    title: "El proyecto",
                    text: "Una propuesta donde el contenido ocupa el primer lugar.",
                },
            ],
        },
        // PROYECTO: Bienes Raíces.
        {
            id: "bienes",
            title: "Bienes Raíces",
            label: "Inmobiliaria",
            category: "web",
            cover: "bienes",
            coverTitle: "UN LUGAR\nPARA QUEDARSE.",
            color: "#d8dfd0",
            image: "assets/BienesRaices.webp",
            url: "https://bienesraicesabbysw.netlify.app/",
            tech: [],
            summary: "Una presencia digital clara para una inmobiliaria.",
            story: [
                { title: "La idea", text: "Crear un sitio informativo para una inmobiliaria." },
                {
                    title: "El enfoque",
                    text: "Organizar la propuesta con un diseño limpio y funcional.",
                },
                {
                    title: "El proyecto",
                    text: "El sitio publicado reúne el trabajo de diseño web de este proyecto.",
                },
            ],
        },
        // PROYECTO: Pizzería.
        {
            id: "pizza",
            title: "Sitio Web Pizzería",
            label: "Gastronomía",
            category: "web",
            cover: "pizza",
            coverTitle: "BUEN DISEÑO.\nBUENA PIZZA.",
            color: "#f4b785",
            image: "assets/PizzeriaAbbytos.webp",
            url: "https://pizzeriaabbytos.netlify.app/",
            tech: ["HTML", "CSS"],
            summary: "Una propuesta web para una pizzería.",
            story: [
                { title: "La idea", text: "Llevar una pizzería a la web." },
                {
                    title: "La construcción",
                    text: "Trabajé con HTML y CSS para crear un sitio atractivo y funcional.",
                },
                {
                    title: "El proyecto",
                    text: "Una pieza de mi portafolio de sitios para gastronomía.",
                },
            ],
        },
        // PROYECTO: Restaurante de Hamburguesas.
        {
            id: "estacion",
            title: "Restaurante de Hamburguesas",
            label: "Gastronomía",
            category: "web",
            cover: "estacion",
            coverTitle: "NEXT STOP:\nBUEN DISEÑO.",
            color: "#efd46f",
            image: "assets/EpicBurguer.webp",
            url: "https://laestacionabby.netlify.app/",
            tech: ["HTML5", "CSS", "JavaScript"],
            summary: "Diseño y desarrollo para un restaurante de hamburguesas.",
            story: [
                {
                    title: "La idea",
                    text: "Presentar un restaurante mediante su propio sitio web.",
                },
                { title: "La construcción", text: "Utilicé HTML5, CSS, SAAS,GULP, JAVASCRIPT para desarrollar su presentación web." },
                {
                    title: "El proyecto",
                    text: "Una web de restaurante con un diseño limpio y funcional.",
                },
            ],
        },
        // PROYECTO: Cafetería Nebulatte.
        {
            id: "nebulatte",
            title: "Cafetería Nebulatte",
            label: "Café & atmósfera",
            category: "web",
            cover: "nebulatte",
            coverTitle: "TAKE A\nCOFFEE BREAK.",
            color: "#c5d1ed",
            image: "assets/Nebulatte.webp",
            url: "https://nebulatte.netlify.app/",
            tech: ["HTML5", "CSS", "JavaScript"],
            summary: "Una cafetería convertida en experiencia digital.",
            story: [
                { title: "La idea", text: "Diseñar un sitio web para la cafetería Nebulatte." },
                {
                    title: "La construcción",
                    text: "Utilicé HTML5, CSS, SAAS,GULP, JAVASCRIPT para desarrollar su presentación web.",
                },
                {
                    title: "El proyecto",
                    text: "Una propuesta de diseño limpio y funcional que podés visitar en línea.",
                },
            ],
        },
          // Proyecto: Brasa
           {
            id: "BRASA",
            title: "Brasa Restaurante",
            label: "Cortes de carne & parrilla",
            category: "web",
            cover: "brasa",
            coverTitle: "SABOR QUE\nSE SIENTE.",
            color: "#c5d1ed",
            image: "assets/BRASA.webp",
            url: "https://brasaelartedelfuego.netlify.app/",
            tech: ["HTML5", "CSS", "JavaScript"],
            summary: "Un restaurante de cortes de carne y parrilla.",
            story: [
                { title: "La idea", text: "Diseñar un sitio web para el restaurante Brasa." },
                {
                    title: "La construcción",
                    text: "Utilicé HTML5, CSS, SAAS,GULP, JAVASCRIPT para desarrollar su presentación web.",
                },
                {
                    title: "El proyecto",
                    text: "Una propuesta de diseño limpio y funcional que podés visitar en línea.",
                },
            ],
        },



        // Proyecto: Club-27
           {
            id: "Club27",
            title: "Club-27",
            label: "Cortes de cabello & barbería",
            category: "web",
            cover: "club",
            coverTitle: "UN ESTILO\nQUE PERDURA.",
            color: "#2c303a",
            image: "assets/Club27.webp",
            url: "https://club-27.netlify.app/",
            tech: ["HTML5", "CSS", "JavaScript"],
            summary: "Un sitio web para una barbería especializada en cortes de cabello.",
            story: [
                { title: "La idea", text: "Diseñar un sitio web para la barbería Club-27." },
                {
                    title: "La construcción",
                    text: "Utilicé HTML5, CSS, SAAS,GULP, JAVASCRIPT para desarrollar su presentación web.",
                },
                {
                    title: "El proyecto",
                    text: "Una propuesta de diseño limpio y funcional que podés visitar en línea.",
                },
            ],
        },



        {
            id: "carmencita",
            title: "La Cocina De Carmencita",
            label: "Gastronomía",
            category: "web",
            cover: "estacion",
            coverTitle: "NEXT STOP:\nBUEN DISEÑO.",
            color: "#efd46f",
            image: "assets/Carmencita.webp",
            url: "https://lacocinadecarmencita.netlify.app/",
            tech: ["HTML5", "CSS", "JavaScript"],
            summary: "Diseño y desarrollo para una pasteleria y reposteria hecha en casa.",
            story: [
                {
                    title: "La idea",
                    text: "Presentar un restaurante mediante su propio sitio web.",
                },
                { title: "La construcción", text: "Trabajé con HTML5, CSS y JavaScript." },
                {
                    title: "El proyecto",
                    text: "Una web de restaurante con un diseño limpio y funcional.",
                },
            ],
        }
         
    ],
    // 03. GALERÍA DE IDENTIDAD VISUAL.
    // id: único; title: título de la pieza; filter: categoría de los filtros.
    // image: ruta del archivo en assets/; description: explicación del modal.
    // Las imágenes deben ser tuyas o contar con permiso de uso.
    // Agregá nuevas imágenes aquí. filter: 'Logos', 'Branding' o 'Ilustración'.
    // tone (opcional): color de la tarjeta en la pila: 'blue' (azul), 'orange' (naranja), 'ink' (negro) o 'cream' (crema).
    // Si no lo pones, se asigna uno por orden. Elige un tono que contraste con el fondo de la imagen.
    gallery: [
        {
            id: "identity",
            title: "House Studio · Identidad",
            filter: "Branding",
            tone: "blue",
            image: "assets/brand-board.webp",
            description:
                "Una identidad retro para un estudio digital: azul eléctrico, crema y naranja.",
        },
        {
            id: "wordmark",
            title: "El nombre de la casa",
            filter: "Logos",
            tone: "orange",
            image: "assets/logo.webp",
            description: "Lettering redondeado y una mascota que le pone personalidad al estudio.",
        },
        {
            id: "poster",
            title: "Wanted: por robar miradas",
            filter: "Ilustración",
            tone: "ink",
            image: "assets/wanted.webp",
            description: "Exploración gráfica en crema y negro con textura de impresión vintage.",
        },
        {
            id: "system",
            title: "Una marca, muchas formas",
            filter: "Logos",
            tone: "cream",
            image: "assets/variants.webp",
            description: "Variaciones cromáticas y de composición del logotipo.",
        },
        {
            id: "mascot",
            title: "El habitante de House Studio",
            filter: "Ilustración",
            tone: "orange",
            image: "assets/avatar.webp",
            description: "La mascota naranja en su versión para redes sociales.",
        },
    ],
    // 04. BANNERS ENTRE SECCIONES.
    // id debe coincidir con el id del contenedor en index.html.
    // src vacío muestra la composición con imagen; completarlo activa video MP4.
    // poster es la imagen de respaldo. eyebrow, title y caption son los textos.
    // Para activar un video: agregá su archivo a assets/ y completá src.
    // Se muestra con controles, sin audio automático y con póster de respaldo.
    banners: [
        {
            id: "film-one",
            src: "",
            poster: "assets/wanted.webp",
            eyebrow: "UN POCO DE PERSONALIDAD",
            title: "El código también\npuede tener alma.",
            caption: "Diseño que se siente. Ideas que funcionan.",
        },
        {
            id: "film-two",
            src: "",
            poster: "assets/brand-board.webp",
            eyebrow: "DEL BOCETO A LA PANTALLA",
            title: "Todo empieza\ncon una buena idea.",
            caption: "Un espacio para experimentar, crear y compartir.",
        },
    ],
};

/*
CÓMO AGREGAR UN PROYECTO
1. Copiá un objeto completo dentro de projects (desde { hasta }).
2. Separalo del anterior con una coma y elegí un id nuevo.
3. Completá tus textos, herramientas, enlace e historia real.
4. Guardá una captura en assets/ y escribí su ruta en image.
5. Guardá data.js y recargá la página: tarjeta, filtro y contador se actualizan.

No hace falta modificar script.js para sumar proyectos o piezas de galería.
Esto es un catálogo local en JavaScript, no una base de datos de servidor.
*/

/* ==========================================================
   05. CASOS DE BRANDING
   Cada marca vive en una sección independiente del portafolio.
   theme define el estilo CSS, nunca cambia los colores globales.
   pieces guarda las imágenes completas que se abren en el modal.
   Cada pieza de pieces es una pestaña del componente de pestañas verticales (js/vertical-tabs.js): título, descripción e
   imagen. Una pieza con mascots: true muestra brand.mascots (los pasteles recortados) en lugar de una sola imagen.
   Para agregar piezas, duplicá un objeto con id único dentro de pieces.
   Los textos describen las piezas recibidas; no suponen bocetos inexistentes.
   ========================================================== */
window.STUDIO.brands = [
    {
        id: "carmencita",
        theme: "carmencita",
        name: "La Cocina de Carmencita",
        eyebrow: "REPOSTERÍA ARTESANAL · IDENTIDAD VISUAL",
        headline: "Una marca hecha\ncon mucho cariño.",
        intro: "Del calor de una cocina familiar a un universo de personajes, letras y detalles que cuentan la misma historia: delicias hechas en casa.",
        palette: [
            {
                name: "Crema",
                color: "#fff3dc",
            },
            {
                name: "Chocolate",
                color: "#522610",
            },
            {
                name: "Frambuesa",
                color: "#d83e67",
            },
            {
                name: "Rosa",
                color: "#f4c6c9",
            },
        ],
        cover: "assets/carmencita/abuela-maria.webp",
        logoStory:
            "La identidad se construye alrededor de Abuela María: un personaje cercano que representa la cocina casera. El sistema se amplía con un lettering retro de formas gruesas y orgánicas, y variaciones de color para distintas aplicaciones.",
        mascots: [
            {
                id: "rosa",
                name: "Pastel con glaseado rosa",
                image: "assets/carmencita/pastel-rosa.webp",
            },
            {
                id: "chocolate",
                name: "Tarta de chocolate",
                image: "assets/carmencita/chocolate.webp",
            },
            {
                id: "fria",
                name: "Torta fría",
                image: "assets/carmencita/torta-fria.webp",
            },
        ],
        pieces: [
            {
                id: "logo",
                title: "Abuela María · el origen visual",
                group: "Logo",
                image: "assets/carmencita/abuela-maria.webp",
                description:
                    "El personaje que da rostro a la marca: gesto amable, delantal frambuesa y una cuchara de madera.",
            },
            {
                id: "lettering",
                title: "La creación del logotipo",
                group: "Logo",
                image: "assets/carmencita/lettering.webp",
                description:
                    "Exploración de lettering retro y sus variaciones cromáticas. Las formas compactas permiten reconocer el nombre en distintas aplicaciones.",
            },
            {
                id: "mascotas",
                title: "Pasteles con personalidad",
                group: "Mascotas",
                mascots: true,
                image: "assets/carmencita/pastel-rosa.webp",
                description:
                    "Personajes que salen del papel y le ponen una sonrisa a la marca.",
            },
            {
                id: "papel",
                title: "Dulzura que también se envuelve",
                group: "Packaging",
                image: "assets/carmencita/papel.webp",
                description:
                    "Patrón de personajes y dulces para papel de envoltura: un lenguaje gráfico que acompaña al producto.",
            },
            {
                id: "bolsa",
                title: "La identidad sale de paseo",
                group: "Packaging",
                image: "assets/carmencita/bolsa.webp",
                description:
                    "Visualización de la marca aplicada a una bolsa, con fondo rosa y el logotipo en chocolate.",
            },
            {
                id: "branding",
                title: "Un universo, muchos detalles",
                group: "Branding",
                image: "assets/carmencita/branding.webp",
                description:
                    "Presentación de identidad y propuestas de aplicación en empaques, tarjetas y materiales de marca.",
            },
            {
                id: "stickers",
                title: "Abuela María en movimiento",
                group: "Ilustración",
                image: "assets/carmencita/stickers.webp",
                description:
                    "Variaciones del personaje y elementos ilustrados que extienden su personalidad.",
            },
            {
                id: "vibes",
                title: "Good vibes, por porción",
                group: "Ilustración",
                image: "assets/carmencita/good-vibes.webp",
                description:
                    "Composición editorial con las mascotas de pastel y una estética retro.",
            },
            {
                id: "halloween",
                title: "Una campaña con mucho espíritu",
                group: "Campañas",
                image: "assets/carmencita/halloween.webp",
                description:
                    "Pieza de Halloween que combina el producto artesanal con una ambientación de temporada.",
            },
            {
                id: "instagram",
                title: "Así se vive en Instagram",
                group: "Instagram",
                image: "assets/carmencita/instagram.webp",
                description:
                    "Captura del perfil enviada para este portafolio. Muestra la aplicación de la identidad en publicaciones y presentación de productos; no es un feed en vivo.",
            },
        ],
    },
    {
        id: "moonflower",
        theme: "moonflower",
        name: "MoonFlower",
        eyebrow: "CROCHET & ART · IDENTIDAD VISUAL",
        headline: "Ideas que se tejen\ncon personalidad.",
        intro: "Lila, amarillo suave y detalles de hilo: una identidad que conecta lo hecho a mano con un mundo creativo y delicado.",
        cover: "assets/moonflower/logo.webp",
        palette: [
            {
                name: "Lila",
                color: "#b68ac8",
            },
            {
                name: "Amarillo",
                color: "#f3f49a",
            },
            {
                name: "Ciruela",
                color: "#3c124b",
            },
            {
                name: "Marfil",
                color: "#fffdec",
            },
        ],
        pieces: [
            {
                id: "logo",
                title: "Luna, flor y textura",
                group: "Logo",
                image: "assets/moonflower/logo.webp",
                description:
                    "El símbolo combina una luna con una flor de textura tejida. Se presenta junto al nombre y también como símbolo independiente.",
            },
            {
                id: "tarjetas",
                title: "Un pequeño encuentro con la marca",
                group: "Papelería",
                image: "assets/moonflower/tarjetas.webp",
                description:
                    "Propuesta de tarjetas con una ilustración de crochet, formas amplias y la paleta lila y amarilla.",
            },
            {
                id: "contacto",
                title: "Hilos que conectan",
                group: "Aplicación",
                image: "assets/moonflower/contacto.webp",
                description:
                    "Pieza de contacto con lettering, motivos de tejido y patrón ondulado.",
            },
        ],
        instagram: "https://www.instagram.com/moonflowercr/",
    },
];
