// Candidaturas proclamadas al Congreso para las generales del 29 de noviembre de 2026.
//
// Lee el documento del BOE con las candidaturas proclamadas y su corrección de errores, tal como
// los sirve txt.php (nunca xml.php: lo prohíbe el robots.txt del BOE), y escribe
// datos/investigacion-2026/candidaturas-boe.json. Ese archivo no se edita a mano: se regenera.
//
//   node scripts/investigacion/leer-boe.mjs
//
// Variables: DATOS_DIR (por defecto ../datos-nosequevotar).
//
// Si el BOE publica otra corrección, se descarga a DATOS_DIR/fuentes/descargas/boe/ y se añade a
// CORRECCIONES. El script avisa de cada corrección que no ha podido aplicar.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DATOS_DIR = resolve(RAIZ, process.env.DATOS_DIR || '../datos-nosequevotar');
const BOE_DIR = join(DATOS_DIR, 'fuentes', 'descargas', 'boe');
const SALIDA = join(RAIZ, 'datos', 'investigacion-2026', 'candidaturas-boe.json');

const PROCLAMADAS = { id: 'BOE-A-2026-23103', publicado: '2026-11-03', titulo: 'Candidaturas proclamadas para las elecciones al Congreso de los Diputados y al Senado, convocadas por Real Decreto 806/2026, de 5 de octubre' };
const CORRECCIONES = [
  { id: 'BOE-A-2026-23383', publicado: '2026-11-07', titulo: 'Corrección de errores de las candidaturas proclamadas para las elecciones al Congreso de los Diputados y al Senado, convocadas por Real Decreto 806/2026, de 5 de octubre' },
];

// --- Texto ---

const ENTIDADES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', laquo: '«', raquo: '»', ordm: 'º', ordf: 'ª',
  ndash: '–', mdash: '—', hellip: '…', middot: '·', iexcl: '¡', iquest: '¿', euro: '€',
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', ntilde: 'ñ', uuml: 'ü', ccedil: 'ç',
  Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú', Ntilde: 'Ñ', Uuml: 'Ü', Ccedil: 'Ç',
  agrave: 'à', egrave: 'è', igrave: 'ì', ograve: 'ò', ugrave: 'ù', iuml: 'ï',
  Agrave: 'À', Egrave: 'È', Igrave: 'Ì', Ograve: 'Ò', Ugrave: 'Ù', Iuml: 'Ï',
};

function limpiar(html) {
  const texto = html
    .replace(/<[^>]+>/g, '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-zA-Z]+);/g, (todo, nombre) => {
      if (!(nombre in ENTIDADES)) throw new Error(`entidad HTML desconocida: ${todo}`);
      return ENTIDADES[nombre];
    });
  return texto.replace(/[\s ]+/g, ' ').trim().normalize('NFC');
}

const CLASES = new Set(['parrafo', 'parrafo_2', 'centro_negrita', 'centro_cursiva', 'centro_redonda']);
// Párrafos de la página del BOE que quedan después del texto del documento.
const CLASES_PIE = new Set(['linkSubir', 'nombre-organismo', 'direccion-organismo', 'fuera']);

function parrafos(html, id, avisos) {
  const ini = html.indexOf('id="textoxslt"');
  if (ini < 0) throw new Error(`${id}: no encuentro el cuerpo del documento (textoxslt)`);
  const salida = [];
  for (const m of html.slice(ini).matchAll(/<p class="([^"]+)"[^>]*>([\s\S]*?)<\/p>/g)) {
    const clase = m[1];
    if (CLASES_PIE.has(clase)) continue;
    const texto = limpiar(m[2]);
    if (!CLASES.has(clase)) avisos.push(`${id}: párrafo de clase «${clase}» tratado como texto normal: «${texto.slice(0, 120)}»`);
    salida.push({ clase: CLASES.has(clase) ? clase : 'parrafo', texto });
  }
  return salida;
}

const clave = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function junta(texto) {
  const m = texto.match(/^JUNTA ELECTORAL (?:PROVINCIAL )?DE (.+)$/i);
  return m ? m[1].trim() : null;
}

function camara(texto) {
  if (/^CONGRESO DE LOS DIPUTADOS$/i.test(texto)) return 'congreso';
  if (/^SENADO$/i.test(texto)) return 'senado';
  return null;
}

// «NOMBRE (SIGLAS)»: las siglas son el último paréntesis, que puede llevar otros dentro.
function nombreYSiglas(encabezado) {
  if (!encabezado.endsWith(')')) return { nombre: encabezado, siglas: null };
  let nivel = 0;
  for (let i = encabezado.length - 1; i >= 0; i--) {
    if (encabezado[i] === ')') nivel++;
    else if (encabezado[i] === '(' && --nivel === 0) {
      return { nombre: encabezado.slice(0, i).trim(), siglas: encabezado.slice(i + 1, -1).trim() };
    }
  }
  return { nombre: encabezado, siglas: null };
}

// --- Documento de candidaturas proclamadas ---

function leerProclamadas(ps, avisos) {
  const listas = [];
  let j = null, c = null, isla = null, lista = null;
  for (const p of ps) {
    if (p.clase === 'centro_negrita') {
      const nueva = junta(p.texto);
      const mIsla = p.texto.match(/^Circunscripción electoral: (.+)$/i);
      if (nueva) { if (!j || clave(nueva) !== clave(j)) { j = nueva; c = null; } isla = null; lista = null; }
      else if (mIsla) { isla = mIsla[1].trim(); lista = null; }
      else avisos.push(`${PROCLAMADAS.id}: encabezado en negrita no reconocido: «${p.texto}»`);
      continue;
    }
    if (p.clase === 'centro_cursiva') {
      const nueva = camara(p.texto);
      if (nueva) { c = nueva; isla = null; lista = null; }
      else avisos.push(`${PROCLAMADAS.id}: encabezado en cursiva no reconocido: «${p.texto}» (${j})`);
      continue;
    }
    if (p.clase === 'centro_redonda') {
      const m = p.texto.match(/^(\d+)\.\s*(.+)$/);
      if (!m || !j || !c) { avisos.push(`${PROCLAMADAS.id}: encabezado de lista no reconocido: «${p.texto}» (${j}, ${c})`); lista = null; continue; }
      lista = { junta: j, camara: c, isla, orden: Number(m[1]), encabezado: m[2].trim(), parrafos: [] };
      listas.push(lista);
      continue;
    }
    if (lista) lista.parrafos.push(p.texto);
  }
  return listas;
}

// --- Corrección de errores ---
// Bloques «En la candidatura: [encabezado] / Donde dice: «…» / Debe decir: «…»».

function leerCorreccion(ps, doc, avisos) {
  const bloques = [];
  let j = null, c = null, bloque = null, modo = null, esperaEncabezado = false;
  const cerrar = () => {
    if (!bloque) return;
    for (const lado of ['donde', 'debe']) {
      const l = bloque[lado];
      if (l.length) { l[0] = l[0].replace(/^«\s*/, ''); l[l.length - 1] = l[l.length - 1].replace(/\s*»$/, ''); }
    }
    bloques.push(bloque);
    bloque = null; modo = null;
  };
  for (const p of ps) {
    if (p.clase === 'centro_negrita' && junta(p.texto)) { cerrar(); j = junta(p.texto); c = null; continue; }
    if (p.clase === 'centro_cursiva' && camara(p.texto)) { cerrar(); c = camara(p.texto); continue; }
    if (/^En la candidatura:?$/i.test(p.texto)) {
      cerrar();
      bloque = { doc, junta: j, camara: c, encabezado: null, donde: [], debe: [] };
      esperaEncabezado = true;
      continue;
    }
    if (/^Donde dice:?$/i.test(p.texto)) {
      if (bloque && bloque.debe.length) { const { encabezado } = bloque; cerrar(); bloque = { doc, junta: j, camara: c, encabezado, donde: [], debe: [] }; }
      if (!bloque) bloque = { doc, junta: j, camara: c, encabezado: null, donde: [], debe: [] };
      modo = 'donde'; esperaEncabezado = false;
      continue;
    }
    if (/^Debe decir:?$/i.test(p.texto)) { modo = 'debe'; esperaEncabezado = false; continue; }
    if (esperaEncabezado && p.clase === 'centro_redonda') { bloque.encabezado = p.texto; esperaEncabezado = false; continue; }
    if (bloque && modo) { bloque[modo].push(p.texto); continue; }
    if (!j) continue; // párrafo introductorio
    avisos.push(`${doc}: párrafo de la corrección sin interpretar: «${p.texto.slice(0, 160)}» (${j}, ${c})`);
  }
  cerrar();
  return bloques;
}

function aplicarCorreccion(b, listas) {
  if (b.camara !== 'congreso') return { aplicada: false, motivo: 'es del Senado (fuera de alcance)' };
  const delSitio = listas.filter(l => l.camara === 'congreso' && clave(l.junta) === clave(b.junta ?? ''));
  if (!delSitio.length) return { aplicada: false, motivo: `no hay listas al Congreso de «${b.junta}»` };
  const cab = l => clave(`${l.orden}. ${l.encabezado}`);

  if (!b.encabezado) {
    // Cambia el propio nombre de la lista.
    if (b.donde.length !== 1 || b.debe.length !== 1) return { aplicada: false, motivo: 'corrección sin candidatura y con varios párrafos' };
    const lista = delSitio.find(l => cab(l) === clave(b.donde[0]));
    const m = b.debe[0].match(/^(\d+)\.\s*(.+)$/);
    if (!lista || !m) return { aplicada: false, motivo: 'no encuentro la lista cuyo nombre se corrige' };
    if (Number(m[1]) !== lista.orden) return { aplicada: false, motivo: 'la corrección cambia el número de orden' };
    lista.encabezado = m[2].trim();
    return { aplicada: true, motivo: 'nombre de la lista corregido' };
  }

  const lista = delSitio.find(l => cab(l) === clave(b.encabezado));
  if (!lista) return { aplicada: false, motivo: `no encuentro la lista «${b.encabezado}»` };
  const n = b.donde.length;
  if (!n) return { aplicada: false, motivo: 'corrección sin «Donde dice»' };
  const igual = (a, z) => a.replace(/\s+/g, ' ').trim() === z.replace(/\s+/g, ' ').trim();
  for (let i = 0; i + n <= lista.parrafos.length; i++) {
    if (b.donde.every((t, k) => igual(t, lista.parrafos[i + k]))) {
      lista.parrafos.splice(i, n, ...b.debe);
      return { aplicada: true, motivo: `${n} párrafo(s) sustituido(s) por ${b.debe.length}` };
    }
  }
  return { aplicada: false, motivo: 'el texto de «Donde dice» no está en la lista' };
}

// --- Lista de candidatos de cada candidatura al Congreso ---

function interpretar(lista, avisos) {
  const titulares = [], suplentes = [];
  let destino = titulares, proclamada = true;
  for (const t of lista.parrafos) {
    if (/^No proclamada\.?$/i.test(t)) { proclamada = false; continue; }
    if (/^Titular(es)?:?$/i.test(t)) { destino = titulares; continue; }
    if (/^Suplentes?:?$/i.test(t)) { destino = suplentes; continue; }
    const m = t.match(/^(\d+)\.\s*(.+?)\.?$/);
    if (!m) { avisos.push(`${lista.junta}, ${lista.orden}. ${lista.encabezado}: párrafo sin interpretar: «${t.slice(0, 160)}»`); continue; }
    if (Number(m[1]) !== destino.length + 1) avisos.push(`${lista.junta}, ${lista.orden}. ${lista.encabezado}: numeración inesperada en «${t.slice(0, 80)}»`);
    destino.push(m[2].trim());
  }
  if (proclamada && !titulares.length) avisos.push(`${lista.junta}, ${lista.orden}. ${lista.encabezado}: proclamada pero sin candidatos`);
  if (!proclamada && titulares.length) avisos.push(`${lista.junta}, ${lista.orden}. ${lista.encabezado}: «No proclamada» pero con candidatos`);
  return { orden: lista.orden, encabezado: lista.encabezado, ...nombreYSiglas(lista.encabezado), proclamada, titulares, suplentes };
}

// --- Principal ---

const ID_ESPECIAL = { 'illes balears': 'baleares' };

async function documento(meta) {
  const archivo = join(BOE_DIR, `${meta.id}.txt.html`);
  const bytes = await readFile(archivo);
  return {
    html: bytes.toString('utf8'),
    fuente: { ...meta, url: `https://www.boe.es/diario_boe/txt.php?id=${meta.id}`, archivo: `fuentes/descargas/boe/${meta.id}.txt.html`, sha256: createHash('sha256').update(bytes).digest('hex') },
  };
}

const avisos = [];
const circunscripciones = JSON.parse(await readFile(join(RAIZ, 'src', 'contenido', 'circunscripciones.json'), 'utf8'));
const principal = await documento(PROCLAMADAS);
const listas = leerProclamadas(parrafos(principal.html, PROCLAMADAS.id, avisos), avisos);

const fuentes = [principal.fuente];
const correcciones = [];
for (const meta of CORRECCIONES) {
  const doc = await documento(meta);
  fuentes.push(doc.fuente);
  for (const b of leerCorreccion(parrafos(doc.html, meta.id, avisos), meta.id, avisos)) {
    correcciones.push({ documento: meta.id, junta: b.junta, camara: b.camara, candidatura: b.encabezado, donde_dice: b.donde, debe_decir: b.debe, ...aplicarCorreccion(b, listas) });
  }
}

const porJunta = new Map();
for (const l of listas.filter(l => l.camara === 'congreso')) {
  if (!porJunta.has(clave(l.junta))) porJunta.set(clave(l.junta), { junta: l.junta, listas: [] });
  porJunta.get(clave(l.junta)).listas.push(interpretar(l, avisos));
}

const salida = [];
for (const { junta: nombre, listas: ls } of porJunta.values()) {
  const id = ID_ESPECIAL[clave(nombre)] ?? clave(nombre).replace(/ /g, '-');
  if (!circunscripciones.some(c => c.id === id)) throw new Error(`la junta «${nombre}» no corresponde a ninguna circunscripción (${id})`);
  ls.forEach((l, i) => { if (l.orden !== i + 1) avisos.push(`${nombre}: la lista «${l.encabezado}» lleva el orden ${l.orden} y es la ${i + 1}.ª`); });
  salida.push({ id, junta: nombre, listas: ls });
}
const faltan = circunscripciones.filter(c => !salida.some(s => s.id === c.id)).map(c => c.id);
if (faltan.length) throw new Error(`faltan circunscripciones: ${faltan.join(', ')}`);
salida.sort((a, b) => a.id.localeCompare(b.id, 'es'));

const todas = salida.flatMap(s => s.listas);
const resumen = {
  circunscripciones: salida.length,
  listas_congreso: todas.length,
  proclamadas: todas.filter(l => l.proclamada).length,
  no_proclamadas: todas.filter(l => !l.proclamada).length,
  listas_senado_en_el_documento: listas.filter(l => l.camara === 'senado').length,
  correcciones: correcciones.length,
  correcciones_aplicadas: correcciones.filter(c => c.aplicada).length,
  correcciones_del_congreso_sin_aplicar: correcciones.filter(c => c.camara === 'congreso' && !c.aplicada).length,
  avisos: avisos.length,
};

await mkdir(dirname(SALIDA), { recursive: true });
await writeFile(SALIDA, JSON.stringify({ generado: new Date().toISOString(), fuentes, resumen, avisos, correcciones, circunscripciones: salida }, null, 2) + '\n');

console.log(JSON.stringify(resumen, null, 2));
if (avisos.length) console.log(`\nAvisos:\n${avisos.map(a => `  · ${a}`).join('\n')}`);
const sinAplicar = correcciones.filter(c => c.camara === 'congreso' && !c.aplicada);
if (sinAplicar.length) console.log(`\nCorrecciones del Congreso sin aplicar:\n${sinAplicar.map(c => `  · ${c.junta}, ${c.candidatura ?? '(nombre de lista)'}: ${c.motivo}`).join('\n')}`);
console.log(`\nEscrito ${SALIDA}`);
