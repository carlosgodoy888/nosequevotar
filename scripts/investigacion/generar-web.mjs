// Prepara los datos de las páginas /partidos/ y /temas/ a partir de la investigación y los escribe en
// src/contenido/partidos/partidos-2026.json, que es lo que lee la construcción de la web.
//
//   node scripts/investigacion/generar-web.mjs
//
// Lee de datos/investigacion-2026/: partidos.json (selección, nombres, programa), partidos-calculado.json
// (votos de 2023 y listas proclamadas), temas.json, fuentes.json, citas/<partido>.json y resumenes.json.
// Solo pasan a la web las citas vigentes y verificadas y los resúmenes revisados. Si algo no cuadra
// (una frase de un resumen apoyada en una cita que no existe, un partido sin datos…), no escribe nada.

import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { RAIZ, DIR, leerJson, temasDeCita } from './comun.mjs';

const SALIDA = join(RAIZ, 'src', 'contenido', 'partidos', 'partidos-2026.json');
const VERIFICADAS = new Set(['exacta', 'normalizada', 'fuente-abierta', 'fuente-abierta-corregida']);

const mapa = await leerJson(join(DIR, 'partidos.json'));
const calculado = (await leerJson(join(DIR, 'partidos-calculado.json'))).partidos;
const config = await leerJson(join(DIR, 'temas.json'));
const fuentes = new Map((await leerJson(join(DIR, 'fuentes.json'))).fuentes.map(f => [f.id, f]));
const resumenes = (await leerJson(join(DIR, 'resumenes.json')).catch(() => ({ resumenes: {} }))).resumenes;
const circunscripciones = await leerJson(join(RAIZ, 'src', 'contenido', 'circunscripciones.json'));
const nombreCirc = new Map(circunscripciones.map(c => [c.id, c.nombre]));

const errores = [];
const avisos = [];

// Orden: votos de 2023 de la candidatura de la que proceden; las que no tienen, después, por número de listas.
const seleccion = mapa.seleccion.ids.map(id => {
  const p = mapa.partidos.find(x => x.id === id);
  if (!p) { errores.push(`la selección incluye «${id}», que no está en partidos.json`); return null; }
  return { p, c: calculado[id] };
}).filter(Boolean).sort((a, b) =>
  (b.c.votos_2023 ?? -1) - (a.c.votos_2023 ?? -1) || b.c.proclamada.length - a.c.proclamada.length || a.p.id.localeCompare(b.p.id));

function ambito(proclamada) {
  const n = proclamada.length;
  if (n === circunscripciones.length) return `Se presenta en las ${n} circunscripciones.`;
  if (n > 8) return `Se presenta en ${n} de las ${circunscripciones.length} circunscripciones.`;
  const nombres = proclamada.map(id => nombreCirc.get(id));
  return `Se presenta en ${nombres.length === 1 ? nombres[0] : `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}`}.`;
}

function citaWeb(c) {
  const base = { id: c.id, tipo: c.tipo === 'programa' ? 'programa' : c.tipo, clase: c.clase, concreta: Boolean(c.medida_concreta), cita: c.cita };
  if (c.traduccion) { base.traduccion = c.traduccion; base.idioma = c.idioma; }
  if (c.tipo === 'programa') {
    const f = fuentes.get(c.fuente);
    return { ...base, fuente: c.fuente, pagina: c.pagina, ...(c.numero ? { numero: c.numero } : {}), ...(c.apartado_original?.length ? { apartado: c.apartado_original.at(-1) } : {}), ...(c.contexto && c.apartado_original?.length ? { contexto: true } : {}) };
  }
  return { ...base, quien: c.quien, ...(c.cargo ? { cargo: c.cargo } : {}), ...(c.partido_de_quien ? { partidoDeQuien: c.partido_de_quien } : {}), fecha: c.fecha, url: c.url, medio: c.medio };
}

const partidos = [];
const posturas = {};
const citasWeb = {};
const usadas = new Set();
for (const [orden, { p, c }] of seleccion.entries()) {
  const citas = (await leerJson(join(DIR, 'citas', `${p.id}.json`)).catch(() => ({ citas: [] }))).citas
    .filter(x => x.estado === 'vigente' && VERIFICADAS.has(x.verificacion));
  if (!citas.length) avisos.push(`${p.id}: sin citas verificadas`);
  posturas[p.id] = {};
  // Cada cita una sola vez, con sus temas. Programa en el orden del documento; declaraciones de la más reciente a la más antigua.
  const prog = citas.filter(x => x.tipo === 'programa');
  const decl = citas.filter(x => x.tipo !== 'programa').sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''));
  citasWeb[p.id] = [...prog, ...decl].map(x => ({ ...citaWeb(x), temas: temasDeCita(x, config) })).filter(x => x.temas.length);
  for (const x of prog) usadas.add(x.fuente);
  for (const t of config.temas) {
    const del = citas.filter(x => temasDeCita(x, config).includes(t.id));
    const r = resumenes[p.id]?.[t.id];
    let resumen = null;
    if (r && r.base !== 'sin_material' && r.frases?.length) {
      const ids = new Set(del.map(x => x.id));
      for (const fr of r.frases) for (const a of fr.apoyos) if (!ids.has(a)) errores.push(`${p.id} · ${t.id}: el resumen se apoya en «${a}», que no es una cita verificada de ese tema`);
      resumen = { base: r.base, frases: r.frases.map(fr => ({ texto: fr.texto, apoyos: fr.apoyos })) };
    } else if (del.length) avisos.push(`${p.id} · ${t.id}: ${del.length} citas y sin resumen`);
    if (resumen) posturas[p.id][t.id] = resumen;
  }
  const docs = mapa.partidos.find(x => x.id === p.id).programa.documentos ?? [];
  partidos.push({
    id: p.id,
    nombre: p.nombre_corto ?? p.nombre,
    nombreCompleto: p.nombre,
    orden: orden + 1,
    tipo: p.tipo,
    miembros: p.miembros,
    cabeza: p.cabeza_de_cartel,
    ambito: ambito(c.proclamada),
    circunscripciones: c.proclamada,
    votos2023: c.votos_2023,
    comparteVotos2023: c.comparte_votos_2023_con.length > 0,
    programa: {
      estado: p.programa.estado,
      comprobado: p.programa.comprobado,
      documentos: docs.filter(d => ['programa', 'documento_parcial', 'programa_general'].includes(d.clase)).map(d => ({ clase: d.clase, titulo: d.titulo, url: d.url, fecha: d.fecha, ...(d.via ? { via: d.via } : {}) })),
    },
  });
}

const fuentesWeb = Object.fromEntries([...usadas].map(id => {
  const f = fuentes.get(id);
  return [id, { titulo: f.titulo, url: f.url, clase: f.clase, idioma: f.idioma, publicado: f.publicado, paginas: f.paginas, ...(f.rotulo ? { rotulo: f.rotulo } : {}) }];
}));

if (errores.length) { console.error(`No se escribe nada:\n${errores.map(e => `  · ${e}`).join('\n')}`); process.exit(1); }

const salida = {
  nota: 'Generado por scripts/investigacion/generar-web.mjs a partir de datos/investigacion-2026/. No se edita a mano.',
  actualizado: new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' }),
  temas: config.temas.map(t => ({ id: t.id, nombre: t.nombre, definicion: t.definicion })),
  partidos,
  fuentes: fuentesWeb,
  resumenes: posturas,
  citas: citasWeb,
};
await mkdir(join(RAIZ, 'src', 'contenido', 'partidos'), { recursive: true });
await writeFile(SALIDA, JSON.stringify(salida) + '\n');

const total = Object.values(citasWeb).reduce((s, x) => s + x.length, 0);
const conResumen = Object.values(posturas).reduce((s, x) => s + Object.keys(x).length, 0);
console.log(`${partidos.length} partidos · ${config.temas.length} temas · ${total} citas · ${conResumen} resúmenes`);
if (avisos.length) console.log(`Avisos (${avisos.length}):\n${avisos.slice(0, 40).map(a => `  · ${a}`).join('\n')}${avisos.length > 40 ? `\n  · … y ${avisos.length - 40} más` : ''}`);
console.log(`Escrito ${SALIDA}`);
