// Comprobaciones de privacidad y seguridad del test (public/test/), después de construir.
//
//   node scripts/construir.mjs && node scripts/comprobar-test.mjs
//
// Falla si algún recurso (script, link, img, iframe, tipografía, fetch) apunta a otro dominio,
// si falta la CSP en un meta o no es default-src 'self', si lleva 'unsafe-inline',
// si falta data-sin-medicion o si hay código o estilos en línea que la CSP bloquearía.

import { readFile, readdir } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { archivos, recursosHtml, recursosCodigo, esExterno, sinCodigo } from './comprobar.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(RAIZ, 'public');

async function comprobar() {
  const errores = [];
  const mal = (archivo, texto) => errores.push(`${relative(PUBLIC, archivo)}: ${texto}`);
  const paginas = await archivos(join(PUBLIC, 'test'), '.html');
  if (!paginas.length) errores.push('No hay páginas en public/test/: ¿has construido antes?');

  const codigo = new Set();
  for (const archivo of paginas) {
    const html = await readFile(archivo, 'utf8');
    const csp = (html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]*)"/i) || [])[1];
    if (!csp) mal(archivo, 'falta el meta Content-Security-Policy');
    else {
      if (!/(^|;)\s*default-src 'self'\s*(;|$)/.test(csp)) mal(archivo, `la CSP no es default-src 'self': «${csp}»`);
      if (/unsafe-(inline|eval)|\*|data:|https?:/.test(csp)) mal(archivo, `la CSP abre más de lo permitido: «${csp}»`);
    }
    if (!/<body\b[^>]*\sdata-sin-medicion\b/.test(html)) mal(archivo, 'falta data-sin-medicion en <body>');

    for (const r of recursosHtml(html)) if (esExterno(r.url)) mal(archivo, `recurso de otro dominio en <${r.etiqueta}>: ${r.url}`);
    // Con default-src 'self' no se ejecuta ningún script en línea ni se aplica ningún style="…".
    for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      const tipo = (m[1].match(/type="([^"]*)"/) || [])[1];
      if (m[2].trim() && tipo !== 'application/ld+json') mal(archivo, 'script en línea (la CSP lo bloquea)');
      const src = (m[1].match(/src="([^"?]*)/) || [])[1];
      if (src && !esExterno(src)) codigo.add(src);
    }
    if (/<style\b/i.test(html) || /\sstyle="/i.test(sinCodigo(html))) mal(archivo, 'estilos en línea (la CSP los bloquea)');
    if (/\son[a-z]+="/i.test(sinCodigo(html))) mal(archivo, 'manejador de eventos en línea (la CSP lo bloquea)');
    for (const m of html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"?]*)/g)) if (!esExterno(m[1])) codigo.add(m[1]);
  }

  // Los módulos del test y lo que importan, y las hojas de estilo de la página.
  const juegos = (await readdir(join(PUBLIC, 'juegos'))).map(a => `/juegos/${a}`);
  for (const ruta of [...codigo, ...juegos]) {
    const archivo = join(PUBLIC, ruta);
    const texto = await readFile(archivo, 'utf8');
    for (const r of recursosCodigo(texto)) if (esExterno(r.url)) mal(archivo, `recurso de otro dominio: ${r.url}`);
    if (/\bfetch\(\s*[`'"]https?:/.test(texto)) mal(archivo, 'fetch a una dirección absoluta');
    if (ruta.startsWith('/juegos/')) {
      if (/\sstyle=\\?["']/.test(texto)) mal(archivo, 'genera style="…" en el HTML (la CSP lo bloquea)');
      if (/\bon[a-z]+=\\?["']/.test(texto)) mal(archivo, 'genera manejadores en línea (la CSP los bloquea)');
      if (/\beval\(|new Function\(/.test(texto)) mal(archivo, 'usa eval (la CSP lo bloquea)');
      if (/registrarEvento|gtag|dataLayer|sendBeacon/.test(texto)) mal(archivo, 'llama a la medición');
    }
  }

  console.log(`${paginas.length} página(s) del test y ${codigo.size + juegos.length} archivos de código comprobados.`);
  if (errores.length) {
    console.error(`Errores (${errores.length}):\n  · ${errores.join('\n  · ')}`);
    process.exit(1);
  }
  console.log("Todo bien: CSP default-src 'self' sin 'unsafe-inline', data-sin-medicion, sin código ni estilos en línea y ningún recurso de otro dominio.");
}

comprobar();
