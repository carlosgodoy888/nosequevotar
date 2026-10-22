// Comprueba todas las páginas de public/ después de construir. Node 22, sin dependencias.
//
//   node scripts/construir.mjs && node scripts/comprobar.mjs
//
// En cada página: HTML bien cerrado, un solo h1, lang, title, description y canónico únicos,
// enlaces internos que existen y ningún recurso de otro dominio. Sale con código 1 si algo falla.

import { readFile, readdir, stat } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(RAIZ, 'public');
const DOMINIO = 'https://nosequevotar.es';
const VACIOS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
// Elementos cuyo cierre es opcional en HTML: no se exigen, pero si se cierran deben cuadrar.
const CIERRE_OPCIONAL = new Set(['p', 'li', 'dt', 'dd', 'option', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot']);

export async function archivos(dir, ext) {
  const res = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const ruta = join(dir, e.name);
    if (e.isDirectory()) res.push(...await archivos(ruta, ext));
    else if (e.name.endsWith(ext)) res.push(ruta);
  }
  return res.sort();
}

// Quita comentarios y el contenido de script y style, que no son HTML.
export const sinCodigo = (html) => html
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/(<(script|style)\b[^>]*>)[\s\S]*?(<\/\2>)/gi, '$1$3');

const atributo = (etiqueta, nombre) => {
  const m = etiqueta.match(new RegExp(`\\s${nombre}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? (m[2] ?? m[3] ?? m[4]) : null;
};

function equilibrio(html) {
  const errores = [];
  const pila = [];
  for (const m of sinCodigo(html).matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*?(\/?)>/g)) {
    const [, cierre, nombreBruto, autocierre] = m;
    const nombre = nombreBruto.toLowerCase();
    if (VACIOS.has(nombre)) continue;
    if (!cierre) { if (!autocierre) pila.push(nombre); continue; }
    // Un cierre puede cerrar antes elementos de cierre opcional abiertos dentro.
    while (pila.length && pila.at(-1) !== nombre && CIERRE_OPCIONAL.has(pila.at(-1))) pila.pop();
    if (pila.at(-1) === nombre) pila.pop();
    else { errores.push(`cierre </${nombre}> sin abrir (abierto: <${pila.at(-1) || 'nada'}>)`); break; }
  }
  const abiertos = pila.filter(n => !CIERRE_OPCIONAL.has(n));
  if (abiertos.length && !errores.length) errores.push(`sin cerrar: ${abiertos.map(n => `<${n}>`).join(', ')}`);
  return errores;
}

// Recursos que el navegador descarga solo: scripts, hojas, iconos, tipografías, imágenes, marcos y medios.
export function recursosHtml(html) {
  const res = [];
  for (const m of sinCodigo(html).matchAll(/<(script|link|img|iframe|source|video|audio|embed|object|track|input)\b[^>]*>/gi)) {
    const etiqueta = m[0];
    const tipo = m[1].toLowerCase();
    if (tipo === 'link') {
      const rel = (atributo(etiqueta, 'rel') || '').toLowerCase();
      if (/\b(canonical|alternate|external|noopener)\b/.test(rel) && !/\b(stylesheet|preload|icon|modulepreload|manifest|prefetch)\b/.test(rel)) continue;
    }
    for (const a of ['src', 'href', 'data', 'poster', 'srcset']) {
      const v = atributo(etiqueta, a);
      if (v) res.push({ etiqueta: tipo, url: v.trim().split(/\s+/)[0] });
    }
  }
  for (const m of html.matchAll(/url\(\s*['"]?([^'")]+)/g)) res.push({ etiqueta: 'url()', url: m[1] });
  return res;
}

// Direcciones de otros dominios en CSS (url, @import) y JS (fetch, import, new URL, Worker…).
export function recursosCodigo(codigo) {
  const res = [];
  const patrones = [
    /url\(\s*['"]?([^'")]+)/g, /@import\s+['"]([^'"]+)/g,
    /\bfetch\(\s*[`'"]([^`'"]+)/g, /\bimport\s*\(?\s*[`'"]([^`'"]+)/g, /\bfrom\s+[`'"]([^`'"]+)/g,
    /new\s+(?:URL|Worker|SharedWorker|EventSource|WebSocket)\(\s*[`'"]([^`'"]+)/g, /\.src\s*=\s*[`'"]([^`'"]+)/g,
    /sendBeacon\(\s*[`'"]([^`'"]+)/g, /\.open\(\s*[`'"][A-Z]+[`'"]\s*,\s*[`'"]([^`'"]+)/g,
  ];
  for (const p of patrones) for (const m of codigo.matchAll(p)) res.push({ etiqueta: 'código', url: m[1] });
  return res;
}

export const esExterno = (url) => /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(url) && !url.startsWith(`${DOMINIO}/`) && url !== DOMINIO;

async function existe(ruta) {
  try { return (await stat(ruta)).isFile(); } catch { return false; }
}

async function destinoInterno(url) {
  const limpia = decodeURI(url.replace(DOMINIO, '').split(/[?#]/)[0]);
  if (!limpia.startsWith('/')) return true;
  const ruta = join(PUBLIC, limpia);
  return (await existe(ruta)) || (await existe(join(ruta, 'index.html')));
}

async function comprobar() {
  const paginas = await archivos(PUBLIC, '.html');
  const errores = [];
  const vistos = { title: new Map(), description: new Map(), canonical: new Map() };
  const mal = (archivo, texto) => errores.push(`${relative(PUBLIC, archivo)}: ${texto}`);

  for (const archivo of paginas) {
    const html = await readFile(archivo, 'utf8');
    const limpio = sinCodigo(html);
    for (const e of equilibrio(html)) mal(archivo, `HTML mal cerrado: ${e}`);
    if (!/^<!doctype html>/i.test(html.trimStart())) mal(archivo, 'falta <!doctype html>');
    const h1 = (limpio.match(/<h1\b/gi) || []).length;
    if (h1 !== 1) mal(archivo, `tiene ${h1} h1`);
    if (!/<html\b[^>]*\slang="[a-z]{2}(-[A-Z]{2})?"/.test(html)) mal(archivo, 'falta lang en <html>');

    const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
    const description = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
    const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
    const noindex = /<meta name="robots" content="noindex"/.test(html);
    if (!title) mal(archivo, 'falta title');
    if (!description) mal(archivo, 'falta description');
    if (!canonical && !noindex) mal(archivo, 'falta canónico');
    for (const [clave, valor] of [['title', title], ['description', description], ['canonical', canonical]]) {
      if (!valor) continue;
      const otro = vistos[clave].get(valor);
      if (otro) mal(archivo, `${clave} repetido con ${relative(PUBLIC, otro)}: «${valor}»`);
      else vistos[clave].set(valor, archivo);
    }

    for (const r of recursosHtml(html)) {
      if (esExterno(r.url)) mal(archivo, `recurso de otro dominio en <${r.etiqueta}>: ${r.url}`);
      else if (!(await destinoInterno(r.url))) mal(archivo, `recurso que no existe en <${r.etiqueta}>: ${r.url}`);
    }
    for (const m of limpio.matchAll(/<a\b[^>]*>/gi)) {
      const href = atributo(m[0], 'href');
      if (!href || esExterno(href) || /^(mailto|tel|sms):/i.test(href) || href.startsWith('#')) continue;
      if (!(await destinoInterno(href))) mal(archivo, `enlace interno roto: ${href}`);
    }
    for (const m of limpio.matchAll(/<a\b[^>]*href="#([^"]+)"/gi)) {
      if (!html.includes(`id="${m[1]}"`)) mal(archivo, `ancla que no existe: #${m[1]}`);
    }
  }

  for (const archivo of [...await archivos(PUBLIC, '.css'), ...await archivos(PUBLIC, '.js')]) {
    for (const r of recursosCodigo(await readFile(archivo, 'utf8'))) {
      if (esExterno(r.url)) mal(archivo, `recurso de otro dominio: ${r.url}`);
    }
  }

  console.log(`${paginas.length} páginas comprobadas.`);
  if (errores.length) {
    console.error(`Errores (${errores.length}):\n  · ${errores.join('\n  · ')}`);
    process.exit(1);
  }
  console.log('Todo bien: HTML cerrado, un h1, lang, title, description y canónico únicos, enlaces internos y ningún recurso de otro dominio.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) comprobar();
