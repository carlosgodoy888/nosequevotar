// Votos al Congreso de cada candidatura en las generales del 23 de julio de 2023.
//
// Lee la resolución de la Junta Electoral Central publicada en el BOE (cuadros II y III), tal como
// la sirve txt.php, y escribe datos/investigacion-2026/resultados-2023.json. No se edita a mano.
//
//   node scripts/investigacion/leer-resultados-2023.mjs
//
// Variables: DATOS_DIR (por defecto ../datos-nosequevotar).

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DATOS_DIR = resolve(RAIZ, process.env.DATOS_DIR || '../datos-nosequevotar');
const DOC = { id: 'BOE-A-2023-18907', publicado: '2023-09-01', titulo: 'Resolución de 30 de agosto de 2023, de la Presidencia de la Junta Electoral Central, por la que se publican los resultados de las elecciones al Congreso de los Diputados y al Senado convocadas por Real Decreto 400/2023' };
const ARCHIVO = join(DATOS_DIR, 'fuentes', 'descargas', 'boe', `${DOC.id}.txt.html`);
const SALIDA = join(RAIZ, 'datos', 'investigacion-2026', 'resultados-2023.json');

const texto = h => h.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/[\s ]+/g, ' ').trim().normalize('NFC');
const clave = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const numero = t => (t === '' ? null : /^[\d.]+$/.test(t) ? Number(t.replace(/\./g, '')) : NaN);

function nombreYSiglas(encabezado) {
  if (!encabezado.endsWith(')')) return { nombre: encabezado, siglas: null };
  let nivel = 0;
  for (let i = encabezado.length - 1; i >= 0; i--) {
    if (encabezado[i] === ')') nivel++;
    else if (encabezado[i] === '(' && --nivel === 0) return { nombre: encabezado.slice(0, i).trim(), siglas: encabezado.slice(i + 1, -1).trim() };
  }
  return { nombre: encabezado, siglas: null };
}

const bytes = await readFile(ARCHIVO);
const html = bytes.toString('utf8');
const circunscripciones = JSON.parse(await readFile(join(RAIZ, 'src', 'contenido', 'circunscripciones.json'), 'utf8'));

const idDe = new Map();
for (const c of circunscripciones) for (const n of [c.nombre, ...(c.otros ?? [])]) idDe.set(clave(n), c.id);
// El BOE escribe «Alicante/Alacant», «Balears (Illes)», «Coruña (A)», «Rioja (La)»…
function circunscripcion(etiqueta) {
  const partes = [etiqueta, ...etiqueta.split('/')];
  for (const parte of [...partes]) {
    const m = parte.trim().match(/^(.+?)\s*\((.+)\)$/);
    if (m) partes.push(`${m[2]} ${m[1]}`);
  }
  for (const parte of partes) {
    const id = idDe.get(clave(parte));
    if (id) return id;
  }
  throw new Error(`circunscripción no reconocida en los resultados: «${etiqueta}»`);
}

// Solo los cuadros II y III: llevan en la cabecera «Votos» y terminan en «Total estatal».
const candidaturas = [];
const avisos = [];
for (const [tabla] of html.matchAll(/<table[\s\S]*?<\/table>/g)) {
  const filasCabecera = [...(tabla.match(/<thead>[\s\S]*?<\/thead>/)?.[0] ?? '').matchAll(/<tr>[\s\S]*?<\/tr>/g)].map(m => [...m[0].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map(c => texto(c[1])));
  if (filasCabecera.length !== 2 || !filasCabecera[1].includes('Votos')) continue;
  const conEscanos = filasCabecera[1].includes('Escaños');
  const nombres = filasCabecera[0].filter(n => n && n !== 'Total escaños');
  const columnas = nombres.map(n => ({ encabezado: n, ...nombreYSiglas(n), con_escano: conEscanos, votos: null, escanos: conEscanos ? null : 0, por_circunscripcion: {} }));
  const paso = conEscanos ? 2 : 1;
  const desde = conEscanos ? 2 : 1;

  for (const [fila] of (tabla.match(/<tbody>[\s\S]*?<\/tbody>/)?.[0] ?? '').matchAll(/<tr>[\s\S]*?<\/tr>/g)) {
    const celdas = [...fila.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(c => texto(c[1]));
    if (!celdas.length || !celdas[0]) continue;
    const etiqueta = celdas[0].replace(/\.$/, '');
    if (celdas.length !== desde + columnas.length * paso) { avisos.push(`fila «${etiqueta}» con ${celdas.length} celdas en la tabla de ${nombres[0]}…`); continue; }
    const total = /^total estatal$/i.test(etiqueta);
    const id = total ? null : circunscripcion(etiqueta);
    columnas.forEach((col, i) => {
      const votos = numero(celdas[desde + i * paso]);
      const escanos = conEscanos ? numero(celdas[desde + i * paso + 1]) : null;
      if (Number.isNaN(votos) || Number.isNaN(escanos)) { avisos.push(`número ilegible en «${etiqueta}», ${col.encabezado}`); return; }
      if (total) { col.votos = votos; if (conEscanos) col.escanos = escanos; }
      else if (votos !== null) col.por_circunscripcion[id] = conEscanos ? { votos, escanos: escanos ?? 0 } : { votos };
    });
  }
  candidaturas.push(...columnas);
}

for (const c of candidaturas) {
  const suma = Object.values(c.por_circunscripcion).reduce((s, x) => s + x.votos, 0);
  c.circunscripciones = Object.keys(c.por_circunscripcion).length;
  if (c.votos === null) avisos.push(`${c.encabezado}: sin fila «Total estatal»`);
  else if (suma !== c.votos) avisos.push(`${c.encabezado}: la suma por circunscripción (${suma}) no coincide con el total estatal (${c.votos})`);
}
candidaturas.sort((a, b) => (b.votos ?? 0) - (a.votos ?? 0));
candidaturas.forEach((c, i) => { c.puesto = i + 1; });

const resumen = {
  candidaturas: candidaturas.length,
  con_escano: candidaturas.filter(c => c.con_escano).length,
  escanos: candidaturas.reduce((s, c) => s + (c.escanos ?? 0), 0),
  votos_a_candidaturas: candidaturas.reduce((s, c) => s + (c.votos ?? 0), 0),
  avisos: avisos.length,
};
const fuente = { ...DOC, url: `https://www.boe.es/diario_boe/txt.php?id=${DOC.id}`, archivo: `fuentes/descargas/boe/${DOC.id}.txt.html`, sha256: createHash('sha256').update(bytes).digest('hex') };

await mkdir(dirname(SALIDA), { recursive: true });
await writeFile(SALIDA, JSON.stringify({ generado: new Date().toISOString(), fuente, resumen, avisos, candidaturas }, null, 2) + '\n');

console.log(JSON.stringify(resumen, null, 2));
if (avisos.length) console.log(`\nAvisos:\n${avisos.map(a => `  · ${a}`).join('\n')}`);
console.log(`\nEscrito ${SALIDA}`);
