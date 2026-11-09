/** HOUSE-STUDIO · GULP 5
 * npm run dev   → compila, abre el servidor y observa los cambios.
 * npm run build → genera dist/ con CSS/JS minificados e imágenes WebP.
 * Editá src/. dist/ es una salida regenerable, nunca tu carpeta de trabajo.
 */
import gulp from 'gulp';
import * as sass from 'sass';
import sharp from 'sharp';
import { minify } from 'terser';
import browserSync from 'browser-sync';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';

const { series, parallel, watch } = gulp;
const server = browserSync.create();
let production = true;
const JS_FILES = ['data.js','stack-deck.js','vertical-tabs.js','site-menu.js','flip-links.js','script.js','interactions.js','projects-carousel.js','pricing.js','hero.js','intro.js','perf-meter.js'];
const IMAGE_ROOT = 'src/images';
// Imágenes con transparencia: se conservan sin pérdida mientras pesen poco. Si el WebP sin pérdida pasa de este límite
// (fotos o ilustraciones grandes) el color se guarda con pérdida y la transparencia (los bordes) queda idéntica.
const LOSSLESS_ALPHA_MAX = 300 * 1024;
// Dirección pública del sitio, sin barra final (ej. 'https://house-studio.com'). Alimenta las etiquetas para
// compartir (og:url, og:image). También puede venir de la variable de entorno SITE_URL. Vacío = no se publican.
const SITE_URL = process.env.SITE_URL || '';
const imageCache = new Map();
let imageReport = [];
let missingCaptures = [];

// 1. Utilidades pequeñas: recorren carpetas y escriben creando directorios.
async function filesIn(directory) {
    const entries = await fs.readdir(directory, {withFileTypes:true});
    const files = await Promise.all(entries.map(entry => {
        const location = path.join(directory,entry.name);
        return entry.isDirectory() ? filesIn(location) : [location];
    }));
    return files.flat().sort();
}
async function write(file, content) {
    await fs.mkdir(path.dirname(file),{recursive:true});
    await fs.writeFile(file,content);
}
async function exists(file) { try { await fs.access(file); return true; } catch { return false; } }

// 2. Limpiar SOLO la salida generada. src/ nunca se borra.
export async function clean() {
    await fs.rm('dist',{recursive:true,force:true});
    imageCache.clear();
}

// 3. Sass moderno con @use. Un CSS de salida, con mapas únicamente en desarrollo.
export async function styles() {
    const result = sass.compile('src/scss/app.scss', {
        style: production ? 'compressed' : 'expanded',
        sourceMap: !production,
        sourceMapIncludeSources: !production,
        charset: false,
    });
    let css = result.css;
    if (!production) {
        await write('dist/css/app.min.css.map',JSON.stringify(result.sourceMap));
        css += '\n/*# sourceMappingURL=app.min.css.map */';
    }
    await write('dist/css/app.min.css',css);
}

// 4. Imágenes. Los PNG con transparencia se convierten SIN pérdida, preservando alfa.
// Las fotografías/opacas usan WebP calidad 88. No se cambian las dimensiones.
// WebP existentes se copian sin recomprimir. Concurrencia limitada a 3 imágenes.
export async function images() {
    const originals = (await filesIn(IMAGE_ROOT)).filter(file => /\.(png|jpe?g|webp)$/i.test(file));
    const jobs = originals.map(input => ({input,output:path.join('dist/assets',path.relative(IMAGE_ROOT,input).replace(/\.(png|jpe?g)$/i,'.webp'))}));
    const destinations = jobs.map(job => job.output.toLowerCase());
    if (new Set(destinations).size !== destinations.length) throw new Error('Dos imágenes producirían el mismo WebP: usá nombres distintos.');
    imageReport=[];
    let cursor=0;
    async function worker() {
        while (cursor < jobs.length) {
            const {input,output}=jobs[cursor++];
            const stat=await fs.stat(input);
            const signature=`${stat.size}:${stat.mtimeMs}`;
            const cached=imageCache.get(input);
            if (cached?.signature===signature && await exists(output)) {imageReport.push(cached.report);continue;}
            await fs.mkdir(path.dirname(output),{recursive:true});
            const metadata=await sharp(input).metadata();
            const transparent=metadata.hasAlpha && !(await sharp(input).stats()).isOpaque;
            if (/\.webp$/i.test(input)) await fs.copyFile(input,output);
            else if (transparent) {
                const lossless=await sharp(input).rotate().webp({lossless:true,effort:5}).toBuffer();
                if (lossless.length<=LOSSLESS_ALPHA_MAX) await fs.writeFile(output,lossless);
                else await sharp(input).rotate().webp({quality:86,effort:5,alphaQuality:100}).toFile(output);
            }
            else await sharp(input).rotate().webp({quality:88,effort:5,alphaQuality:100}).toFile(output);
            const report={source:input,output,originalBytes:stat.size,webpBytes:(await fs.stat(output)).size,alpha:!!transparent};
            imageReport.push(report);imageCache.set(input,{signature,report});
        }
    }
    await Promise.all(Array.from({length:Math.min(3,jobs.length)},worker));
    // Elimina WebP huérfanos cuando borrás o renombrás un original en desarrollo.
    const wanted=new Set(jobs.map(job=>path.resolve(job.output)));
    if (await exists('dist/assets')) for (const file of await filesIn('dist/assets')) {
        if (/\.webp$/i.test(file) && !wanted.has(path.resolve(file))) await fs.unlink(file);
    }
    imageReport.sort((a,b)=>a.source.localeCompare(b.source));
}

// 5. Videos opcionales. Se copian, no se convierten a WebP (son formatos distintos).
export async function videos() {
    await fs.rm('dist/assets/videos',{recursive:true,force:true});
    await fs.mkdir('src/videos',{recursive:true});
    await fs.cp('src/videos','dist/assets/videos',{recursive:true,filter:source=>!source.endsWith('.gitkeep')});
}

// 5b. Imagen para compartir el enlace (src/social → dist/assets). Es JPG a propósito: algunas apps no leen WebP en la vista previa.
export async function social() {
    await fs.mkdir('src/social',{recursive:true});
    await fs.mkdir('dist/assets',{recursive:true});   // recursive: no falla si images/videos ya la crearon en paralelo
    for (const file of await fs.readdir('src/social')) {
        if (file!=='.gitkeep') await fs.copyFile(path.join('src/social',file),path.join('dist/assets',file));
    }
}

// 6. JavaScript: respetar el orden es importante; la intro se ejecuta al final.
// Si falta una captura, el catálogo fuente se conserva y se muestra portada editorial.
// Al añadir el original a src/images y recompilar, la captura aparece automáticamente.
export async function scripts() {
    missingCaptures=[];
    const sources={};
    // anime.js (npm install animejs): se antepone al paquete único. Si no está instalado, el hero
    // usa la Web Animations API del navegador y el sitio funciona igual.
    const animeCandidates=['node_modules/animejs/dist/bundles/anime.umd.min.js','node_modules/animejs/dist/bundles/anime.umd.js','node_modules/animejs/lib/anime.min.js'];
    let animeFile=null;
    for (const candidate of animeCandidates) if (await exists(candidate)) { animeFile=candidate; break; }
    if (animeFile) sources['vendor-animejs.js']=`try{${await fs.readFile(animeFile,'utf8')}\n}catch(error){}`;
    else console.warn('animejs no está instalado: ejecutá "npm install". El hero usará animaciones nativas.');
    for (const name of JS_FILES) {
        let source=await fs.readFile(`src/js/${name}`,'utf8');
        if (name==='data.js') {
            const sandbox={window:{}};
            vm.runInNewContext(source,sandbox,{timeout:1000});
            const catalog=sandbox.window.STUDIO;
            for (const project of catalog.projects) if (project.image?.startsWith('assets/') && !await exists(`dist/${project.image}`)) {
                missingCaptures.push(project.image);
                project.image='';
            }
            // Solo la copia generada cambia; src/js/data.js sigue completo y comentado.
            source=`window.STUDIO=${JSON.stringify(catalog)};`;
        }
        sources[name]=source;
    }
    if (production) {
        const result=await minify(sources,{compress:true,mangle:true,format:{comments:false}});
        await write('dist/js/app.min.js',result.code);
    } else {
        // Las fuentes comentadas quedan visibles durante el desarrollo.
        await write('dist/js/app.min.js',Object.entries(sources).map(([name,code])=>`\n/* ARCHIVO: ${name} */\n${code}\n;`).join('\n'));
    }
    if (missingCaptures.length) console.warn(`Capturas pendientes (${missingCaptures.length}): se muestran portadas editoriales. Consultá reports/build.json.`);
}

// 7. HTML: versión derivada del contenido para que el navegador actualice CSS y JS.
export async function html() {
    const css=await fs.readFile('dist/css/app.min.css');
    const js=await fs.readFile('dist/js/app.min.js');
    const hash=createHash('sha256').update(css).update(js).digest('hex').slice(0,12);
    const source=await fs.readFile('src/index.html','utf8');
    let page=source.replaceAll('__ASSET_VERSION__',hash);
    // Etiquetas para compartir: necesitan URL absolutas. Sin SITE_URL se quita el bloque (mejor nada que un enlace roto).
    const site=SITE_URL.trim().replace(/\/+$/,'');
    if (site) page=page.replaceAll('__SITE_URL__',site).replace(/[ \t]*<!--\/?social-url-->\r?\n/g,'');
    else {
        page=page.replace(/[ \t]*<!--social-url-->[\s\S]*?<!--\/social-url-->\r?\n/,'');
        console.warn('SITE_URL vacío: la vista previa al compartir saldrá sin imagen. Define SITE_URL en gulpfile.js y recompila.');
    }
    await write('dist/index.html',page);
    // Caché del navegador (Netlify lee dist/_headers). CSS y JS llevan ?v=<hash>: cambian de URL
    // cuando cambia su contenido, así que pueden cachearse un año. Las imágenes conservan su nombre:
    // un día fresco y hasta una semana mientras se revalida en segundo plano.
    await write('dist/_headers',[
        '/css/*','  Cache-Control: public, max-age=31536000, immutable',
        '/js/*','  Cache-Control: public, max-age=31536000, immutable',
        '/assets/*','  Cache-Control: public, max-age=86400, stale-while-revalidate=604800',''
    ].join('\n'));
}

// 8. Informe: pesos antes/después y capturas todavía pendientes.
export async function report() {
    const original=imageReport.reduce((sum,item)=>sum+item.originalBytes,0);
    const webp=imageReport.reduce((sum,item)=>sum+item.webpBytes,0);
    const baseline=JSON.parse(await fs.readFile('scripts/baseline.json','utf8'));
    const codeBytes=(await fs.stat('dist/css/app.min.css')).size+(await fs.stat('dist/js/app.min.js')).size;
    const data={mode:production?'production':'development',imageCount:imageReport.length,originalImageBytes:original,webpBytes:webp,imageSavingPercent:Number(((1-webp/original)*100).toFixed(1)),originalCodeBytes:baseline.codeBytes,codeBytes,missingCaptures,images:imageReport};
    await write('reports/build.json',JSON.stringify(data,null,2));
    console.log(`WebP: ${(original/1048576).toFixed(2)} → ${(webp/1048576).toFixed(2)} MiB (${data.imageSavingPercent}% menos).`);
}

function productionMode(done) {production=true;done();}
function developmentMode(done) {production=false;done();}
// Dependencia explícita: scripts espera a images para comprobar las capturas.
const compile=series(clean,parallel(styles,images,videos,social),scripts,html,report);
export const build=series(productionMode,compile);

// 9. Servidor local y recarga. Gulp espera a que termine una tarea antes de repetirla.
function serve(done) {
    server.init({server:{baseDir:'dist'},host:'localhost',open:false,notify:false,port:3000},done);
}
function reload(done) {server.reload();done();}
function observe() {
    // Una sola cola evita que un cambio simultáneo de HTML/JS/imagen se pise.
    watch(['src/**/*'],{delay:250},series(parallel(styles,images,videos,social),scripts,html,report,reload));
}
export const dev=series(developmentMode,compile,serve,observe);
export default dev;
