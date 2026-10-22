// Genera public/ a partir de src/. Node 22, sin dependencias.
//
//   node scripts/construir.mjs
//
// Las fechas «pasadas» y «próximas» se calculan con la fecha de hoy en Madrid
// (se puede fijar con FECHA_HOY=2026-10-20 para probar). sitio.js las vuelve
// a calcular en el navegador, por si la web lleva días sin publicarse.

import { readFile, writeFile, mkdir, rm, cp, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { base } from '../src/plantillas/base.mjs';
import { hoyMadrid } from '../src/plantillas/util.mjs';
import * as paginas from '../src/plantillas/paginas.mjs';
import { validarBanco, bancoPublico } from '../src/plantillas/juegos.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(RAIZ, 'src');
const PUBLIC = join(RAIZ, 'public');

const leerJson = async (ruta) => {
  try {
    return JSON.parse(await readFile(ruta, 'utf8'));
  } catch (e) {
    throw new Error(`No se puede leer ${ruta.replace(RAIZ + '/', '')}: ${e.message}`);
  }
};

const CAMPOS_GUIA = ['orden', 'nombre', 'titulo', 'tituloSeo', 'descripcion', 'resumen', 'entradilla', 'esencial', 'secciones', 'fuentes', 'actualizado'];

async function cargarGuias() {
  const dir = join(SRC, 'contenido', 'guias');
  const archivos = (await readdir(dir)).filter(a => a.endsWith('.json'));
  const guias = [];
  for (const archivo of archivos) {
    const g = await leerJson(join(dir, archivo));
    const faltan = CAMPOS_GUIA.filter(c => g[c] === undefined);
    if (faltan.length) throw new Error(`A la guía ${archivo} le falta: ${faltan.join(', ')}`);
    guias.push({ ...g, slug: archivo.replace(/\.json$/, '') });
  }
  return guias.sort((a, b) => a.orden - b.orden);
}

// Páginas de texto (privacidad…): una por archivo en src/contenido/paginas/. Como las guías, admiten borrador: true.
async function cargarPaginas() {
  const dir = join(SRC, 'contenido', 'paginas');
  const archivos = (await readdir(dir)).filter(a => a.endsWith('.json'));
  return Promise.all(archivos.map(a => leerJson(join(dir, a))));
}

// Test sin siglas: el banco aprobado del año, sus partidos y las circunscripciones.
// Si el banco no pasa la validación, la construcción se para con la lista de errores.
const ANIO_TEST = 2023;

async function cargarJuego() {
  const dir = join(SRC, 'contenido', 'juegos');
  const banco = await leerJson(join(dir, `banco-${ANIO_TEST}.json`));
  const partidos = await leerJson(join(dir, `partidos-${ANIO_TEST}.json`));
  const circunscripciones = await leerJson(join(SRC, 'contenido', 'circunscripciones.json'));
  const errores = validarBanco(banco, partidos, `banco-${ANIO_TEST}.json`);
  if (errores.length) throw new Error(`El banco del test no es válido:\n  · ${errores.join('\n  · ')}`);
  const modulos = {};
  for (const a of (await readdir(join(SRC, 'js', 'juegos'))).filter(a => a.endsWith('.mjs')).sort()) {
    modulos[a.replace(/\.mjs$/, '.js')] = await readFile(join(SRC, 'js', 'juegos', a), 'utf8');
  }
  return { anio: ANIO_TEST, banco: bancoPublico(banco), partidos, circunscripciones, modulos };
}

async function escribir(ruta, contenido) {
  const destino = join(PUBLIC, ruta.endsWith('/') ? ruta + 'index.html' : ruta);
  await mkdir(dirname(destino), { recursive: true });
  await writeFile(destino, contenido);
}

function sitemap(sitio, entradas) {
  const urls = entradas.map(e => `  <url><loc>${sitio.url}${e.ruta}</loc><lastmod>${e.lastmod}</lastmod></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

async function construir() {
  const sitio = await leerJson(join(SRC, 'contenido', 'sitio.json'));
  const fechas = await leerJson(join(SRC, 'contenido', 'fechas.json'));
  // Las guías con borrador: true no se publican ni se enlazan desde ninguna página.
  const todas = await cargarGuias();
  const guias = todas.filter(g => !g.borrador);
  const borradores = todas.filter(g => g.borrador);
  const todosTextos = await cargarPaginas();
  const textos = todosTextos.filter(p => !p.borrador);
  const hoy = hoyMadrid();

  const css = await readFile(join(SRC, 'estilos', 'sitio.css'), 'utf8');
  const js = await readFile(join(SRC, 'js', 'sitio.js'), 'utf8');
  const cssTest = await readFile(join(SRC, 'estilos', 'test.css'), 'utf8');
  const juego = await cargarJuego();
  const datosJuego = JSON.stringify([juego.banco, juego.partidos, juego.circunscripciones]);
  sitio.version = createHash('sha256').update(css + js + cssTest + Object.values(juego.modulos).join('') + datosJuego).digest('hex').slice(0, 8);

  const ctx = { sitio, fechas, guias, hoy, juego };

  await rm(PUBLIC, { recursive: true, force: true });
  await mkdir(PUBLIC, { recursive: true });
  await cp(join(SRC, 'estatico'), PUBLIC, { recursive: true });
  await writeFile(join(PUBLIC, 'estilo.css'), css);
  await writeFile(join(PUBLIC, 'sitio.js'), js);
  await writeFile(join(PUBLIC, 'test.css'), cssTest);
  // Los módulos se sirven como .js (tipo MIME seguro) y se importan con la versión, para no mezclar cachés.
  await mkdir(join(PUBLIC, 'juegos'), { recursive: true });
  for (const [nombre, codigo] of Object.entries(juego.modulos)) {
    await writeFile(join(PUBLIC, 'juegos', nombre), codigo.replace(/from '\.\/([\w-]+)\.mjs'/g, `from './$1.js?v=${sitio.version}'`));
  }
  await mkdir(join(PUBLIC, 'test'), { recursive: true });
  await writeFile(join(PUBLIC, 'test', `banco-${juego.anio}.json`), JSON.stringify(juego.banco));
  await writeFile(join(PUBLIC, 'test', `partidos-${juego.anio}.json`), JSON.stringify(juego.partidos));
  await writeFile(join(PUBLIC, 'test', 'circunscripciones.json'), JSON.stringify(juego.circunscripciones));

  const generadas = [
    paginas.portada(ctx),
    paginas.indiceGuias(ctx),
    ...guias.map(g => paginas.guia(g, ctx)),
    paginas.calendario(ctx),
    paginas.test(ctx),
    ...textos.map(p => paginas.texto(p, ctx)),
    ...sitio.pronto.map(p => paginas.pronto(p, ctx)),
    paginas.error404(ctx),
  ];

  for (const p of generadas) await escribir(p.ruta, base(sitio, p));

  // El sitemap solo lleva las páginas reales (las «Muy pronto» y la 404 no se indexan).
  const ultima = guias.map(g => g.actualizado).sort().at(-1);
  const indexables = generadas.filter(p => p.indexar !== false).map(p => {
    const g = guias.find(x => `/guia/${x.slug}/` === p.ruta);
    return { ruta: p.ruta, lastmod: g ? g.actualizado : (p.actualizado || ultima) };
  });
  await writeFile(join(PUBLIC, 'sitemap.xml'), sitemap(sitio, indexables));
  await writeFile(join(PUBLIC, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${sitio.url}/sitemap.xml\n`);

  console.log(`Hoy (Madrid): ${hoy}`);
  console.log(`${generadas.length} páginas generadas, ${indexables.length} en el sitemap.`);
  const enBorrador = [...borradores.map(g => g.nombre), ...todosTextos.filter(p => p.borrador).map(p => p.titulo)];
  if (enBorrador.length) console.log(`BORRADOR (sin publicar): ${enBorrador.join(', ')}`);
  const pendientes = [...todas, ...todosTextos].flatMap(g => (g.pendiente || []).map(p => `  · ${g.nombre || g.titulo}: ${p}`));
  if (pendientes.length) console.log(`PENDIENTE:\n${pendientes.join('\n')}`);
}

construir().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
