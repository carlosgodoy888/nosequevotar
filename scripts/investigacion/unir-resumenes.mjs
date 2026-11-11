// Incorpora a resumenes.json los resúmenes por partido y tema que han escrito y verificado los agentes.
//
//   node scripts/investigacion/unir-resumenes.mjs <resultado.json>
//
// <resultado.json> es el resultado del workflow de resúmenes: { resultados: [{ p, g, redaccion, verificacion }] }.
// Entra siempre la versión del verificador. Se guardan también los problemas que encontró, para revisarlos.
// Un resumen ya revisado a mano ("revisado_a_mano": true) no se sobrescribe.

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DIR, leerJson, temasDeCita } from './comun.mjs';

const ruta = process.argv[2];
if (!ruta) { console.error('Uso: node scripts/investigacion/unir-resumenes.mjs <resultado.json>'); process.exit(1); }
const HOY = process.env.FECHA_HOY || new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });

const config = await leerJson(join(DIR, 'temas.json'));
const archivo = join(DIR, 'resumenes.json');
const actual = await leerJson(archivo).catch(() => ({ nota: 'Resúmenes neutros de la postura de cada partido en cada tema. Cada frase lleva las citas que la apoyan. Los escriben y verifican agentes con scripts/investigacion/unir-resumenes.mjs; se pueden corregir a mano marcando "revisado_a_mano": true.', resumenes: {} }));
const { resultados } = JSON.parse(await readFile(ruta, 'utf8'));

let nuevos = 0, protegidos = 0;
const errores = [];
const idsDe = new Map();
async function ids(partido, tema) {
  const k = `${partido}|${tema}`;
  if (!idsDe.has(k)) {
    const citas = (await leerJson(join(DIR, 'citas', `${partido}.json`))).citas.filter(c => c.estado === 'vigente');
    idsDe.set(k, new Set(citas.filter(c => temasDeCita(c, config).includes(tema)).map(c => c.id)));
  }
  return idsDe.get(k);
}

for (const r of resultados) {
  if (!r?.verificacion) { errores.push(`${r?.p}: grupo ${r?.i + 1} sin verificar`); continue; }
  actual.resumenes[r.p] ??= {};
  for (const v of r.verificacion.revisiones) {
    if (actual.resumenes[r.p][v.tema]?.revisado_a_mano) { protegidos++; continue; }
    const validos = await ids(r.p, v.tema);
    const malos = v.frases.flatMap(f => f.apoyos).filter(a => !validos.has(a));
    if (malos.length) { errores.push(`${r.p} · ${v.tema}: apoyos que no son citas del tema: ${malos.join(', ')}`); continue; }
    actual.resumenes[r.p][v.tema] = {
      base: v.base,
      frases: v.frases.filter(f => f.texto.trim()),
      verificacion: v.veredicto,
      problemas_detectados: v.problemas,
      fecha: HOY,
    };
    nuevos++;
  }
}

await writeFile(archivo, JSON.stringify(actual, null, 2) + '\n');
console.log(`${nuevos} resúmenes incorporados · ${protegidos} revisados a mano sin tocar`);
if (errores.length) { console.log(`Sin incorporar (${errores.length}):\n${errores.map(e => `  · ${e}`).join('\n')}`); process.exitCode = 1; }
