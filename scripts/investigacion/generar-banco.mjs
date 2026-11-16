// Genera el banco de tarjetas del test de 2026 a partir de la selección aprobada.
//
//   node scripts/investigacion/generar-banco.mjs
//
// Lee datos/investigacion-2026/tarjetas/seleccion.json (qué medidas van, en qué orden y con qué cambio de
// texto), citas/<partido>.json (el texto literal, la página y el documento), fuentes.json y temas.json, y
// src/contenido/partidos/partidos-2026.json (nombres y circunscripciones: ejecutar antes generar-web.mjs).
// Escribe:
//   src/contenido/juegos/banco-2026.json      lo que lee la construcción de la web
//   src/contenido/juegos/partidos-2026.json   candidaturas del test: dónde se presentan y qué documento tienen
//   datos/investigacion-2026/tarjetas/banco.md   el banco en limpio, para leerlo y aprobarlo
// Si una tarjeta apunta a una cita que ya no existe, que no está vigente o que no está verificada, no escribe nada.

import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { RAIZ, DIR, leerJson, NOMBRES_DE_PARTIDO } from './comun.mjs';

const ANIO = 2026;
const VERIFICADAS = new Set(['exacta', 'normalizada', 'fuente-abierta', 'fuente-abierta-corregida']);
const CLASES = new Set(['programa', 'programa_general']);
const hoy = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });

const seleccion = await leerJson(join(DIR, 'tarjetas', 'seleccion.json'));
const config = await leerJson(join(DIR, 'temas.json'));
const fuentes = new Map((await leerJson(join(DIR, 'fuentes.json'))).fuentes.map(f => [f.id, f]));
const web = await leerJson(join(RAIZ, 'src', 'contenido', 'partidos', 'partidos-2026.json'));
const ordenTemas = (await leerJson(join(DIR, 'orden-temas.json')).catch(() => null))?.fuente;
const candidatas = new Map((await leerJson(join(DIR, 'tarjetas', 'candidatas.json'))).candidatas.map(c => [c.id, c]));

const errores = [];
const tarjetas = [];
const documentos = new Map();
const motivos = new Map();
for (const p of web.partidos) {
  const sel = seleccion.partidos[p.id];
  if (!sel) continue;
  const citas = new Map((await leerJson(join(DIR, 'citas', `${p.id}.json`))).citas.map(c => [c.id, c]));
  for (const t of config.temas) {
    for (const [i, e] of (sel.temas[t.id] ?? []).entries()) {
      const donde = `${p.id} · ${t.id} · ${e.id}`;
      const c = citas.get(e.id);
      if (!c) { errores.push(`${donde}: la cita no existe`); continue; }
      if (c.estado !== 'vigente') errores.push(`${donde}: la cita no está vigente (${c.estado})`);
      if (c.tipo !== 'programa' || !VERIFICADAS.has(c.verificacion)) errores.push(`${donde}: no es una cita de programa verificada`);
      if (!c.medida_concreta) errores.push(`${donde}: no es una medida concreta`);
      const f = fuentes.get(c.fuente);
      if (!f || !CLASES.has(f.clase)) { errores.push(`${donde}: su documento no es un programa ni un documento general`); continue; }
      if (!Number.isInteger(c.pagina)) errores.push(`${donde}: sin página`);
      const literal = c.traduccion ?? c.cita;
      const texto = e.texto ?? literal;
      if (NOMBRES_DE_PARTIDO[p.id].test(texto)) errores.push(`${donde}: el texto de la tarjeta nombra a la candidatura`);
      documentos.set(f.id, { id: f.id, partido: p.id, titulo: f.titulo, url: f.url, clase: f.clase });
      motivos.set(e.id, e.motivo ?? '');
      tarjetas.push({
        id: e.id, tema: t.id, partido: p.id, puesto: i + 1, texto,
        cita: c.cita, ...(c.traduccion ? { traduccion: c.traduccion, idioma: c.idioma } : {}),
        ...(e.texto ? { cambio: e.cambio } : {}),
        documento: f.id, pagina: c.pagina, ...(c.numero ? { numero: c.numero } : {}),
      });
    }
  }
}
if (errores.length) { console.error(`No se escribe nada:\n${errores.map(e => `  · ${e}`).join('\n')}`); process.exit(1); }

// Candidaturas del test, en el orden de la web. «documento» es null si no han publicado nada que se pueda usar.
const partidos = web.partidos.map((p) => {
  const docs = [...documentos.values()].filter(d => d.partido === p.id);
  return { id: p.id, nombre: p.nombre, circunscripciones: p.circunscripciones, documento: docs.length ? (docs.some(d => d.clase === 'programa') ? 'programa' : 'programa_general') : null };
});

const banco = {
  nota: 'Banco de tarjetas del test de 2026. Generado por scripts/investigacion/generar-banco.mjs a partir de datos/investigacion-2026/tarjetas/seleccion.json. No se edita a mano.',
  anio: ANIO,
  generado: hoy,
  aprobado: seleccion.aprobado ?? null,
  ...(ordenTemas?.cita_breve ? { ordenTemas: { encuesta: ordenTemas.cita_breve, url: ordenTemas.pagina ?? ordenTemas.url } } : {}),
  temas: config.temas.map((t, i) => ({ id: t.id, nombre: t.nombre, definicion: t.definicion, orden: i + 1 })),
  documentos: [...documentos.values()],
  tarjetas,
};
const destino = join(RAIZ, 'src', 'contenido', 'juegos');
await mkdir(destino, { recursive: true });
await writeFile(join(destino, `banco-${ANIO}.json`), JSON.stringify(banco, null, 1) + '\n');
await writeFile(join(destino, `partidos-${ANIO}.json`), JSON.stringify(partidos, null, 1) + '\n');

// El banco en limpio, para leerlo y aprobarlo.
const nombre = id => web.partidos.find(p => p.id === id).nombre;
const enTest = partidos.filter(p => p.documento);
const palabras = t => t.split(/\s+/).length;
const con = aviso => tarjetas.filter(t => candidatas.get(t.id)?.avisos.some(a => a.startsWith(aviso)));
const cambiadas = tarjetas.filter(t => t.cambio);
const fila = t => `| ${t.nombre} | ${enTest.map(p => tarjetas.filter(x => x.tema === t.id && x.partido === p.id).length || '—').join(' | ')} |`;
const md = `# Banco de tarjetas del test de 2026

Generado con \`node scripts/investigacion/generar-banco.mjs\` el ${hoy}. No se edita a mano: los cambios se hacen en \`seleccion.json\`.

**Estado:** ${seleccion.aprobado ? `aprobado el ${seleccion.aprobado}` : 'pendiente de aprobación'}.

**Criterio:** ${seleccion.criterio}

${tarjetas.length} tarjetas de ${enTest.length} candidaturas en ${config.temas.length} temas. La n.º 1 de cada candidatura y tema es la del test rápido; las tres, las del completo.

Fuera del test, porque no han publicado programa ni documento general: ${partidos.filter(p => !p.documento).map(p => p.nombre).join(', ') || 'ninguna'}.

## Tarjetas por tema y candidatura

| Tema | ${enTest.map(p => p.nombre).join(' | ')} |
| --- | ${enTest.map(() => '---').join(' | ')} |
${banco.temas.map(fila).join('\n')}

## Para revisar antes de aprobar

- **Texto cambiado para no delatar a quien firma (${cambiadas.length}).** Solo se ha quitado o sustituido el nombre de la candidatura:
${cambiadas.map(t => `  - ${nombre(t.partido)} · ${banco.temas.find(x => x.id === t.tema).nombre} · \`${t.id}\`: ${t.cambio}`).join('\n') || '  - Ninguna.'}
- **Tarjetas de más de 50 palabras:** ${tarjetas.filter(t => palabras(t.texto) > 50).length} (ninguna pasa de ${Math.max(...tarjetas.map(t => palabras(t.texto)))}).
- **Tarjetas que nombran a otro partido (se dejan tal cual):** ${con('nombra a otro partido').length}. ${con('nombra a otro partido').map(t => `\`${t.id}\` (${nombre(t.partido)})`).join(', ')}
- **Tarjetas que nombran a una persona (se dejan tal cual):** ${con('nombra a una persona').length}. ${con('nombra a una persona').map(t => `\`${t.id}\` (${nombre(t.partido)})`).join(', ')}
- **Tarjetas que nombran el territorio de la candidatura (se dejan tal cual):** ${con('nombra su territorio').length}.
- **Tarjetas traducidas** (el original está en catalán, gallego o euskera; la tarjeta lleva nuestra traducción): ${tarjetas.filter(t => t.traduccion).length}.

${banco.temas.map(t => `## ${t.orden}. ${t.nombre}

${enTest.map((p) => {
  const del = tarjetas.filter(x => x.tema === t.id && x.partido === p.id);
  if (!del.length) return `### ${p.nombre}\n\nSin medidas concretas en este tema.`;
  return `### ${p.nombre}\n\n${del.map(x => `${x.puesto}. ${x.texto}\n   - \`${x.id}\` · ${palabras(x.texto)} palabras · ${documentos.get(x.documento).titulo}, p. ${x.pagina}${x.traduccion ? ` · traducida del ${({ ca: 'catalán', gl: 'gallego', eu: 'euskera' })[x.idioma] ?? x.idioma}` : ''}${x.cambio ? ` · TEXTO CAMBIADO: ${x.cambio}` : ''}\n   - Por qué: ${motivos.get(x.id)}`).join('\n')}`;
}).join('\n\n')}`).join('\n\n')}
`;
await writeFile(join(DIR, 'tarjetas', 'banco.md'), md);

console.log(`${tarjetas.length} tarjetas · ${enTest.length} candidaturas · ${documentos.size} documentos`);
console.log(`Con cambio de texto: ${cambiadas.length} · de más de 50 palabras: ${tarjetas.filter(t => palabras(t.texto) > 50).length} · traducidas: ${tarjetas.filter(t => t.traduccion).length}`);
console.log(`Sin tarjetas: ${enTest.flatMap(p => config.temas.filter(t => !tarjetas.some(x => x.partido === p.id && x.tema === t.id)).map(t => `${p.id}·${t.id}`)).join(', ') || 'ningún hueco'}`);
console.log(`Escritos banco-${ANIO}.json, partidos-${ANIO}.json y tarjetas/banco.md`);
