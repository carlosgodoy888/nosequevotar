// Une las elecciones de tarjetas del test (una por candidatura y lote de temas, ya revisadas) en
// datos/investigacion-2026/tarjetas/seleccion.json, que es el archivo que se edita a mano después.
//
//   node scripts/investigacion/unir-tarjetas.mjs            une lo que haya en _trabajo/tarjetas/
//   node scripts/investigacion/unir-tarjetas.mjs --mirar    solo enseña avisos y errores
//
// Lee _trabajo/tarjetas/<partido>.<lote>.revision.json (la elección corregida por quien la revisó) y, si un
// lote no tiene revisión, su .eleccion.json. Comprueba cada medida contra tarjetas/candidatas.json:
// que exista y sea de esa candidatura, que no esté en dos temas, que no pase de 80 palabras y que no haya
// más de tres por tema. Los cambios de texto (solo para no delatar a quien firma) se enseñan uno a uno.
// Si hay errores no escribe nada. No pisa lo que ya se haya corregido a mano en seleccion.json:
// las candidaturas que ya estén allí con "bloqueada": true se dejan como están.

import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DIR, leerJson, NOMBRES_DE_PARTIDO } from './comun.mjs';

const mirar = process.argv.includes('--mirar');
const TRABAJO = join(DIR, '_trabajo', 'tarjetas');
const SALIDA = join(DIR, 'tarjetas', 'seleccion.json');
const MAX_PALABRAS = 80;
const MAX_POR_TEMA = 3;

const config = await leerJson(join(DIR, 'temas.json'));
const { candidatas, partidos } = await leerJson(join(DIR, 'tarjetas', 'candidatas.json'));
const porId = new Map(candidatas.map(c => [c.id, c]));
const anterior = await leerJson(SALIDA).catch(() => null);

const archivos = await readdir(TRABAJO);
const lotes = [...new Set(archivos.map(a => a.match(/^(.+\.\d+)\.(eleccion|revision)\.json$/)?.[1]).filter(Boolean))].sort();
const errores = [];
const avisos = [];
const cambios = [];
const seleccion = {};

for (const lote of lotes) {
  const conRevision = archivos.includes(`${lote}.revision.json`);
  if (!conRevision) avisos.push(`${lote}: sin revisión; se usa la elección sin revisar`);
  const datos = await leerJson(join(TRABAJO, `${lote}.${conRevision ? 'revision' : 'eleccion'}.json`));
  const partido = datos.partido;
  if (!partidos.some(p => p.id === partido && p.entra)) { errores.push(`${lote}: «${partido}» no es una candidatura del test`); continue; }
  seleccion[partido] ??= {};
  for (const t of datos.temas) {
    if (!config.temas.some(x => x.id === t.tema)) { errores.push(`${lote}: tema desconocido «${t.tema}»`); continue; }
    if (seleccion[partido][t.tema]) errores.push(`${partido} · ${t.tema}: el tema está en dos lotes`);
    if (t.elegidas.length > MAX_POR_TEMA) errores.push(`${partido} · ${t.tema}: ${t.elegidas.length} medidas (máximo ${MAX_POR_TEMA})`);
    seleccion[partido][t.tema] = t.elegidas.map((e) => {
      const c = porId.get(e.id);
      if (!c || c.partido !== partido) { errores.push(`${partido} · ${t.tema}: «${e.id}» no es una medida candidata de esta candidatura`); return null; }
      if (!c.temas.includes(t.tema)) errores.push(`${partido} · ${t.tema}: «${e.id}» no es de este tema (es de ${c.temas.join(', ')})`);
      if (c.palabras > MAX_PALABRAS) avisos.push(`${partido} · ${t.tema}: «${e.id}» tiene ${c.palabras} palabras`);
      if (c.avisos.includes('depende del título de su apartado')) avisos.push(`${partido} · ${t.tema}: «${e.id}» depende del título de su apartado`);
      // Regla del proyecto: el texto solo se toca para quitar lo que nombra a la propia candidatura.
      // Un cambio que quita otra cosa (otro partido, otro dirigente, una alusión a su trabajo) no se acepta:
      // la tarjeta lleva la medida tal cual.
      const nombre = NOMBRES_DE_PARTIDO[partido];
      let texto = e.texto && e.texto.trim() !== c.texto.trim() ? e.texto.trim() : null;
      if (texto && !(nombre.test(c.texto) && !nombre.test(texto))) {
        avisos.push(`${partido} · ${t.tema}: «${e.id}» traía un cambio que no quita el nombre de la candidatura («${e.cambio ?? ''}»): no se aplica, va la medida tal cual`);
        texto = null;
      }
      if (!texto && nombre.test(c.texto)) avisos.push(`${partido} · ${t.tema}: «${e.id}» nombra a su propia candidatura y no lleva cambio`);
      if (texto) cambios.push({ partido, tema: t.tema, id: e.id, original: c.texto, texto, cambio: e.cambio ?? '' });
      return { id: e.id, ...(texto ? { texto, cambio: e.cambio ?? '' } : {}), motivo: e.motivo ?? '' };
    }).filter(Boolean);
  }
}

// Una medida, en un solo tema: si la han elegido en dos, se queda en su tema principal (o en el primero).
for (const [partido, temas] of Object.entries(seleccion)) {
  const visto = new Map();
  for (const [tema, elegidas] of Object.entries(temas)) for (const e of [...elegidas]) {
    if (!visto.has(e.id)) { visto.set(e.id, tema); continue; }
    const principal = porId.get(e.id).temas[0];
    const sobra = principal === tema ? visto.get(e.id) : tema;
    temas[sobra] = temas[sobra].filter(x => x.id !== e.id);
    visto.set(e.id, sobra === tema ? visto.get(e.id) : tema);
    avisos.push(`${partido}: «${e.id}» estaba elegida en dos temas; se quita de ${sobra} (se queda en ${visto.get(e.id)})`);
  }
}
for (const p of partidos.filter(x => x.entra)) {
  if (!seleccion[p.id]) { errores.push(`${p.id}: sin elección`); continue; }
  for (const t of config.temas) if (!seleccion[p.id][t.id]) errores.push(`${p.id} · ${t.id}: sin elección`);
}

const total = Object.values(seleccion).reduce((s, temas) => s + Object.values(temas).reduce((a, e) => a + e.length, 0), 0);
console.log(`${lotes.length} lotes · ${Object.keys(seleccion).length} candidaturas · ${total} tarjetas`);
if (cambios.length) {
  console.log(`\nCambios de texto (${cambios.length}):`);
  for (const c of cambios) console.log(`  · ${c.partido} · ${c.tema} · ${c.id}\n      antes:   ${c.original}\n      después: ${c.texto}\n      cambio:  ${c.cambio}`);
}
if (avisos.length) console.log(`\nAvisos (${avisos.length}):\n${avisos.map(a => `  · ${a}`).join('\n')}`);
if (errores.length) { console.error(`\nErrores (${errores.length}): no se escribe nada.\n${errores.map(e => `  · ${e}`).join('\n')}`); process.exit(1); }
if (mirar) process.exit(0);

// Orden estándar de temas dentro de cada candidatura; las bloqueadas a mano se conservan.
const salida = {
  nota: 'Tarjetas del test de 2026: por candidatura y tema, hasta tres medidas en orden (la primera es la del test rápido; las tres, las del completo). Cada «id» es el de una cita de citas/<partido>.json. «texto» solo aparece si la tarjeta no lleva la medida tal cual: es la misma medida sin lo que delata a quien la firma, y «cambio» dice qué se ha quitado. Lo une scripts/investigacion/unir-tarjetas.mjs a partir de las elecciones revisadas; después se puede editar a mano (una candidatura con "bloqueada": true no se vuelve a pisar). El banco que usa la web lo genera scripts/investigacion/generar-banco.mjs.',
  criterio: 'Las medidas más representativas del conjunto de propuestas y de la filosofía de la candidatura en cada tema, teniendo en cuenta a qué medidas da más relieve en su campaña. La medida va tal como está escrita en el programa; solo se quita lo que delata a quien la firma. Los nombres de territorio se dejan.',
  aprobado: anterior?.aprobado ?? null,
  partidos: Object.fromEntries(partidos.filter(p => p.entra).map((p) => {
    if (anterior?.partidos?.[p.id]?.bloqueada) return [p.id, anterior.partidos[p.id]];
    return [p.id, { temas: Object.fromEntries(config.temas.map(t => [t.id, seleccion[p.id][t.id]])) }];
  })),
};
await writeFile(SALIDA, JSON.stringify(salida, null, 1) + '\n');
console.log(`\nEscrito ${SALIDA}`);
