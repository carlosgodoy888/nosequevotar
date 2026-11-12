// Comprueba partidos.json contra los datos oficiales y escribe partidos.md.
//
//   node scripts/investigacion/resumen-partidos.mjs
//
// partidos.json se mantiene a mano y solo dice qué nombres del BOE forman cada candidatura y con qué
// candidaturas de 2023 se relaciona. Aquí se calcula lo demás: en qué circunscripciones está
// proclamada, cuántos votos de 2023 le corresponden y si esos votos se comparten con otra ficha.
// Si un nombre del BOE queda sin asignar o asignado dos veces, o si un encabezado de 2023 no existe,
// el script se para con la lista de errores.

import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = join(RAIZ, 'datos', 'investigacion-2026');
const leer = async f => JSON.parse(await readFile(join(DIR, f), 'utf8'));
const clave = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9+]+/g, ' ').trim();
const miles = n => n.toLocaleString('es-ES', { useGrouping: 'always' });

const mapa = await leer('partidos.json');
const boe = await leer('candidaturas-boe.json');
const r2023 = await leer('resultados-2023.json');
const errores = [];

// --- Cada lista del BOE, en exactamente una candidatura ---
const duenio = new Map();
for (const p of mapa.partidos) {
  for (const n of p.nombres_boe) {
    const k = clave(n);
    if (duenio.has(k) && duenio.get(k) !== p.id) errores.push(`«${n}» está en dos candidaturas: ${duenio.get(k)} y ${p.id}`);
    duenio.set(k, p.id);
  }
}
const calc = new Map(mapa.partidos.map(p => [p.id, { proclamada: [], no_proclamada: [] }]));
const usados = new Set();
for (const c of boe.circunscripciones) {
  const vistos = new Map();
  for (const l of c.listas) {
    const id = duenio.get(clave(l.encabezado));
    if (!id) { errores.push(`${c.id}: la lista «${l.encabezado}» no está en ninguna candidatura`); continue; }
    usados.add(clave(l.encabezado));
    calc.get(id)[l.proclamada ? 'proclamada' : 'no_proclamada'].push(c.id);
    if (l.proclamada) {
      if (vistos.has(id)) errores.push(`${c.id}: dos listas proclamadas de la misma candidatura (${id}): «${vistos.get(id)}» y «${l.encabezado}»`);
      vistos.set(id, l.encabezado);
    }
  }
}
for (const p of mapa.partidos) for (const n of p.nombres_boe) if (!usados.has(clave(n))) errores.push(`${p.id}: el nombre «${n}» no aparece en el BOE`);

// --- Relación con 2023 ---
const de2023 = new Map(r2023.candidaturas.map(c => [clave(c.encabezado), c]));
const reparto = new Map(); // «encabezado|circunscripción» -> fichas que lo reclaman
for (const p of mapa.partidos) {
  const c = calc.get(p.id);
  c.relaciones = [];
  for (const rel of p.en_2023.relaciones) {
    const cand = de2023.get(clave(rel.encabezado_2023));
    if (!cand) { errores.push(`${p.id}: el encabezado de 2023 «${rel.encabezado_2023}» no existe`); continue; }
    if (!(rel.relacion in mapa.vocabulario.relacion_con_2023)) errores.push(`${p.id}: relación desconocida «${rel.relacion}»`);
    const ambito = rel.ambito === 'todas' ? Object.keys(cand.por_circunscripcion) : rel.ambito === 'propias' ? c.proclamada : rel.ambito;
    const circs = ambito.filter(id => cand.por_circunscripcion[id]);
    const votos = circs.reduce((s, id) => s + cand.por_circunscripcion[id].votos, 0);
    const escanos = circs.reduce((s, id) => s + (cand.por_circunscripcion[id].escanos ?? 0), 0);
    for (const id of circs) { const k = `${clave(rel.encabezado_2023)}|${id}`; reparto.set(k, [...(reparto.get(k) ?? []), p.id]); }
    c.relaciones.push({ ...rel, encabezado: cand.encabezado, circs, votos, escanos });
  }
}
for (const p of mapa.partidos) {
  const c = calc.get(p.id);
  c.votos = c.relaciones.reduce((s, x) => s + x.votos, 0);
  c.escanos = c.relaciones.reduce((s, x) => s + x.escanos, 0);
  const otras = new Set();
  for (const rel of c.relaciones) for (const id of rel.circs) for (const o of reparto.get(`${clave(rel.encabezado_2023)}|${id}`)) if (o !== p.id) otras.add(o);
  c.comparte_con = [...otras].sort();
  const estados = Object.keys(mapa.vocabulario.programa_estado);
  if (!estados.includes(p.programa.estado)) errores.push(`${p.id}: estado de programa desconocido «${p.programa.estado}»`);
  if (!mapa.vocabulario.tipo.includes(p.tipo)) errores.push(`${p.id}: tipo desconocido «${p.tipo}»`);
}

if (errores.length) {
  console.error(`partidos.json no cuadra con los datos oficiales:\n${errores.map(e => `  · ${e}`).join('\n')}`);
  process.exit(1);
}

// --- Markdown ---
const nombre = new Map(mapa.partidos.map(p => [p.id, p.nombre]));
const RELACION = { misma: 'misma candidatura', era_parte_de: 'iba dentro de', incluye_a: 'incluye a' };
const ESTADO = { publicado: 'Publicado', documento_parcial: 'Documento parcial', programa_general: 'Solo programa general', no_publicado: 'No publicado', no_comprobado: 'Sin comprobar' };
const VEREDICTO = { confirmado: 'Confirmada', corregir: 'Con correcciones', dudoso: 'Con dudas', sin_verificar: 'Sin verificar' };

function relacion2023(p) {
  const c = calc.get(p.id);
  if (!c.relaciones.length) return 'Sin lista en 2023';
  return c.relaciones.map(x => `${RELACION[x.relacion]} ${x.encabezado.replace(/\.$/, '')}${x.ambito === 'todas' ? '' : ` (${x.circs.length} circ.)`}`).join('; ');
}
function votos2023(p) {
  const c = calc.get(p.id);
  if (!c.relaciones.length) return '—';
  return `${miles(c.votos)}${c.comparte_con.length ? ' \\*' : ''}`;
}
function fila(p, i) {
  const c = calc.get(p.id);
  // Solo se enlaza lo que es un documento programático; notas de prensa y redes quedan en partidos.json.
  const doc = ['publicado', 'documento_parcial', 'programa_general'].includes(p.programa.estado) ? p.programa.documentos[0] : null;
  const programa = doc ? `[${ESTADO[p.programa.estado]}](${doc.url})` : ESTADO[p.programa.estado];
  return `| ${i} | ${p.nombre} | ${c.proclamada.length} | ${votos2023(p)} | ${relacion2023(p)} | ${programa} | ${VEREDICTO[p.revision.veredicto]} |`;
}

const conLista = mapa.partidos.filter(p => calc.get(p.id).proclamada.length);
const orden = (a, b) => calc.get(b.id).votos - calc.get(a.id).votos || calc.get(b.id).proclamada.length - calc.get(a.id).proclamada.length || a.nombre.localeCompare(b.nombre, 'es');
const conPasado = conLista.filter(p => calc.get(p.id).relaciones.length).sort(orden);
const nuevas = conLista.filter(p => !calc.get(p.id).relaciones.length).sort(orden);
const sinLista = mapa.partidos.filter(p => !calc.get(p.id).proclamada.length);
const cabecera = '| N.º | Candidatura | Listas proclamadas (de 52) | Votos de 2023 | Relación con 2023 | Programa | Verificación |\n| --- | --- | --- | --- | --- | --- | --- |';
const compartidas = conPasado.filter(p => calc.get(p.id).comparte_con.length);

const md = `# Candidaturas al Congreso · 29 de noviembre de 2026

Generado con \`node scripts/investigacion/resumen-partidos.mjs\` a partir de \`partidos.json\`, \`candidaturas-boe.json\` y \`resultados-2023.json\`. No se edita a mano.

- **${mapa.partidos.length} candidaturas** agrupan los ${boe.resumen.listas_congreso} nombres de lista del BOE: ${conLista.length} tienen alguna lista proclamada y ${sinLista.length} no tienen ninguna.
- **Listas:** ${boe.resumen.proclamadas} proclamadas y ${boe.resumen.no_proclamadas} no proclamadas, en ${boe.resumen.circunscripciones} circunscripciones.
- **Estado de los programas** comprobado el ${mapa.actualizado}.

## Con antecedente en 2023, por votos de entonces

${cabecera}
${conPasado.map((p, i) => fila(p, i + 1)).join('\n')}

\\* Votos que también cuentan para otra ficha, porque varias candidaturas de 2026 proceden de la misma de 2023:

${compartidas.map(p => `- **${p.nombre}** comparte con ${calc.get(p.id).comparte_con.map(id => nombre.get(id)).join(', ')}.`).join('\n')}

## Sin lista en 2023

${cabecera}
${nuevas.map((p, i) => fila(p, i + 1)).join('\n')}

## Sin ninguna lista proclamada

No estarán en ninguna papeleta salvo que un tribunal reponga la lista y el BOE lo publique.

${sinLista.map(p => `- **${p.nombre}:** presentada y no proclamada en ${calc.get(p.id).no_proclamada.join(', ')}.`).join('\n')}

## Candidaturas de 2023 que no aparecen con ese nombre en 2026

| Candidatura de 2023 | Votos de 2023 | Qué pasa en 2026 |
| --- | --- | --- |
${mapa.candidaturas_de_2023_sin_lista_en_2026.map(a => { const c = de2023.get(clave(a.encabezado_2023)); return `| ${a.encabezado_2023} | ${c ? miles(c.votos) : '—'} | ${({ no_se_presenta: 'No se presenta', integrada_en_otra_candidatura: 'Integrada en otra candidatura', se_presenta_con_otro_nombre: 'Se presenta con otro nombre', repartida_entre_varias: 'Repartida entre varias candidaturas', dudoso: 'Sin aclarar' })[a.situacion_2026]}${a.revision.veredicto === 'confirmado' || a.revision.aplicada ? '' : ' (con correcciones del verificador sin aplicar)'} |`; }).join('\n')}

## Pendiente de revisar

${mapa.partidos.filter(p => p.pendiente.length).map(p => `- **${p.nombre}:** ${p.pendiente.join(' ')}`).join('\n')}
`;

await writeFile(join(DIR, 'partidos.md'), md);

// Lo calculado, para quien lo necesite (la web ordena los partidos por estos votos). No se edita a mano.
const calculado = Object.fromEntries(mapa.partidos.map(p => {
  const c = calc.get(p.id);
  return [p.id, {
    proclamada: c.proclamada, no_proclamada: c.no_proclamada,
    votos_2023: c.relaciones.length ? c.votos : null, escanos_2023: c.relaciones.length ? c.escanos : null,
    comparte_votos_2023_con: c.comparte_con,
    relaciones_2023: c.relaciones.map(x => ({ encabezado: x.encabezado, relacion: x.relacion, circunscripciones: x.circs.length, votos: x.votos, escanos: x.escanos })),
  }];
}));
await writeFile(join(DIR, 'partidos-calculado.json'), JSON.stringify({ nota: 'Generado por resumen-partidos.mjs. No se edita a mano.', partidos: calculado }, null, 2) + '\n');
console.log(`${mapa.partidos.length} candidaturas: ${conLista.length} con lista proclamada, ${sinLista.length} sin ninguna. Escrito ${join(DIR, 'partidos.md')}`);
