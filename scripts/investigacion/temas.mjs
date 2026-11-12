// Comprueba temas.json contra las etiquetas de las citas y escribe temas.md con los recuentos.
//
//   node scripts/investigacion/temas.mjs
//
// Se para si alguna etiqueta usada en las citas vigentes no está asignada a ningún tema,
// si una etiqueta está en dos temas, o si temas.json asigna una etiqueta que nadie usa.

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { DIR, leerJson, temasDeCita } from './comun.mjs';

const config = await leerJson(join(DIR, 'temas.json'));
const temaDe = new Map();
const errores = [];
for (const t of config.temas) for (const e of t.etiquetas) {
  if (temaDe.has(e)) errores.push(`«${e}» está en dos temas: ${temaDe.get(e)} y ${t.id}`);
  temaDe.set(e, t.id);
}
const transversales = config.transversales ?? {};
for (const [e, v] of Object.entries(transversales)) {
  if (temaDe.has(e)) errores.push(`«${e}» es transversal y también está en el tema ${temaDe.get(e)}`);
  if (!config.temas.some(t => t.id === v.si_no_hay_otra)) errores.push(`«${e}»: el tema «${v.si_no_hay_otra}» no existe`);
}

const partidos = (await readdir(join(DIR, 'citas'))).filter(a => a.endsWith('.json')).map(a => a.replace(/\.json$/, '')).sort();
const usadas = new Set();
const cuenta = new Map(config.temas.map(t => [t.id, { citas: 0, concretas: 0, por_partido: {} }]));
let total = 0;
for (const p of partidos) {
  for (const c of (await leerJson(join(DIR, 'citas', `${p}.json`))).citas.filter(c => c.estado === 'vigente')) {
    total++;
    // Las declaraciones no llevan etiquetas (traen sus temas) y una cita con "temas_manual" no depende de las suyas.
    for (const e of (c.etiquetas ?? []).map(x => x.trim().toLowerCase())) {
      usadas.add(e);
      if (!temaDe.has(e) && !transversales[e] && !c.temas_manual?.length) errores.push(`etiqueta sin tema: «${e}» (${p})`);
    }
    for (const t of temasDeCita(c, config)) {
      if (!cuenta.has(t)) { errores.push(`tema desconocido «${t}» en la cita ${c.id} (${p})`); continue; }
      const x = cuenta.get(t);
      x.citas++;
      if (c.medida_concreta) x.concretas++;
      x.por_partido[p] ??= { citas: 0, concretas: 0 };
      x.por_partido[p].citas++;
      if (c.medida_concreta) x.por_partido[p].concretas++;
    }
  }
}
for (const e of temaDe.keys()) if (!usadas.has(e)) errores.push(`temas.json asigna «${e}», que no usa ninguna cita`);
if (errores.length) { console.error([...new Set(errores)].map(e => `  · ${e}`).join('\n')); process.exit(1); }

const fila = t => {
  const x = cuenta.get(t.id);
  const conConcretas = partidos.filter(p => x.por_partido[p]?.concretas).length;
  return `| ${t.nombre} | ${x.citas} | ${x.concretas} | ${conConcretas} de ${partidos.length} | ${partidos.map(p => x.por_partido[p]?.concretas ?? 0).join(' · ')} |`;
};
const md = `# Temas · ${config.estado === 'propuesta' ? 'PROPUESTA pendiente de decisión' : 'aprobados'}

Generado con \`node scripts/investigacion/temas.mjs\` a partir de \`temas.json\` y \`citas/\`. No se edita a mano.

${total} citas vigentes de ${partidos.length} candidaturas. Una cita cuenta en todos los temas de sus etiquetas, así que la suma de la tabla es mayor que el total.

| Tema | Citas | Medidas concretas | Candidaturas con medidas concretas | Medidas concretas por candidatura (${partidos.join(' · ')}) |
| --- | --- | --- | --- | --- |
${config.temas.map(fila).join('\n')}

## Qué entra en cada tema

${config.temas.map(t => `- **${t.nombre}:** ${t.definicion} Etiquetas: ${t.etiquetas.join(', ')}.`).join('\n')}
${Object.keys(transversales).length ? `\nTransversales, sin tema propio: ${Object.entries(transversales).map(([e, v]) => `${e} (${v.motivo})`).join(' ')}\n` : ''}`;
await writeFile(join(DIR, 'temas.md'), md);
console.log(md.split('\n').slice(4, 8 + config.temas.length).join('\n'));
