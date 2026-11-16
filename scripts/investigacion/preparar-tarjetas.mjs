// Reúne las medidas concretas de programa que pueden ser tarjetas del test de 2026 y marca las que
// delatan quién las firma. No decide cuáles entran ni reescribe nada: eso se hace después.
//
//   node scripts/investigacion/preparar-tarjetas.mjs
//
// Criterios (decisión del 16-11-2026):
// - Solo programas, no declaraciones. Entran las candidaturas con programa del 29N y, si no lo tienen,
//   con un documento general (Podemos). Las que no tienen ningún documento quedan fuera.
// - Si una candidatura tiene programa del 29N, sus tarjetas salen solo de él; sus documentos parciales
//   anteriores (el de desregulación de Vox) no se usan.
// - La tarjeta es la medida tal como está escrita. Solo se toca lo que delata al partido.
//
// Escribe datos/investigacion-2026/tarjetas/candidatas.json y candidatas.md.

import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { DIR, leerJson, leerFuentes, temasDeCita, NOMBRES_DE_PARTIDO as PARTIDOS } from './comun.mjs';

const config = await leerJson(join(DIR, 'temas.json'));
const mapa = await leerJson(join(DIR, 'partidos.json'));
const fuentes = new Map((await leerFuentes()).map(f => [f.id, f]));

const PERSONAS = /Sánchez|Feijóo|Abascal|Colau|Irene Montero|Rufián|Puigdemont|Nogueras|Otegi|Aizpurua|Alvise|Junqueras|Yolanda Díaz|Ayuso|Zapatero|Rajoy|Aznar/;
// Territorio propio de las candidaturas que solo se presentan en una parte del país.
const TERRITORIO = {
  erc: /Cataluny|Cataluñ|catal[aà]n|Països Catalans|Países Catalanes|Generalitat|Rodalies|Mossos/i,
  junts: /Cataluny|Cataluñ|catal[aà]n|Generalitat|Rodalies|Mossos/i,
  'compromis-front-valencia': /valencian|País Valenci|Comunitat Valenciana|Comunidad Valenciana|Generalitat/i,
  'eh-bildu': /Euskal Herria|Euskadi|\bvasc[oa]s?\b|Nafarroa|Navarra|navarr[oa]|euskera|Hego Euskal Herria|Ertzaintza/i,
  'eaj-pnv': /Euskadi|Euskal Herria|\bvasc[oa]s?\b|Navarra|navarr[oa]|euskera|Concierto Económico|Ertzaintza/i,
  bng: /Galiza|Galicia|galeg|galleg/i,
  'cc-primero-canarias': /Canarias|canari[oa]s?\b|\bREF\b|archipiélago/i,
  'unidad-del-pueblo-canario': /Canarias|canari[oa]s?\b|\bREF\b|archipiélago/i,
  'upn-pp': /Navarra|navarr[oa]|foral/i,
};
const PRIMERA_PERSONA = /\b(nos comprometemos|nuestro partido|nuestra formación|nuestra candidatura|desde (el|la|nuestro|nuestra) [A-ZÁÉÍÓÚ])/;

const RANGO = { programa: 0, programa_general: 1 };
const candidatas = [];
const porPartido = [];
for (const id of mapa.seleccion.ids) {
  const p = mapa.partidos.find(x => x.id === id);
  const citas = (await leerJson(join(DIR, 'citas', `${id}.json`)).catch(() => ({ citas: [] }))).citas
    .filter(c => c.estado === 'vigente' && c.tipo === 'programa' && fuentes.get(c.fuente)?.clase in RANGO);
  if (!citas.length) { porPartido.push({ id, nombre: p.nombre_corto ?? p.nombre, entra: false, motivo: 'sin programa ni documento general' }); continue; }
  // Si hay programa del 29N, solo ese; si no, el documento general.
  const mejor = Math.min(...citas.map(c => RANGO[fuentes.get(c.fuente).clase]));
  const delPrograma = citas.filter(c => RANGO[fuentes.get(c.fuente).clase] === mejor);
  const concretas = delPrograma.filter(c => c.clase === 'medida' && c.medida_concreta);
  const clase = mejor === 0 ? 'programa' : 'programa_general';
  let marcadas = 0;
  for (const c of concretas) {
    const texto = c.traduccion ?? c.cita;
    const avisos = [];
    if (PARTIDOS[id]?.test(texto) || PARTIDOS[id]?.test(c.cita)) avisos.push('nombra a su propio partido');
    const otros = Object.entries(PARTIDOS).filter(([k, re]) => k !== id && re.test(texto)).map(([k]) => k);
    if (otros.length) avisos.push(`nombra a otro partido (${otros.join(', ')})`);
    if (PERSONAS.test(texto)) avisos.push('nombra a una persona');
    if (PRIMERA_PERSONA.test(texto)) avisos.push('habla en primera persona de partido');
    if (TERRITORIO[id]?.test(texto)) avisos.push('nombra su territorio');
    if (c.traduccion) avisos.push('traducida: el original está en otra lengua');
    if (c.contexto) avisos.push('depende del título de su apartado');
    if (avisos.some(a => !a.startsWith('traducida'))) marcadas++;
    candidatas.push({
      id: c.id, partido: id, temas: temasDeCita(c, config), fuente: c.fuente, clase_documento: clase, pagina: c.pagina, numero: c.numero ?? null,
      apartado: c.apartado_original?.at(-1) ?? null, texto, ...(c.traduccion ? { original: c.cita, idioma: c.idioma } : {}),
      palabras: texto.split(/\s+/).length, avisos,
    });
  }
  porPartido.push({ id, nombre: p.nombre_corto ?? p.nombre, entra: true, documento: clase, citas_de_programa: delPrograma.length, medidas_concretas: concretas.length, con_aviso: marcadas });
}

const salida = join(DIR, 'tarjetas');
await mkdir(salida, { recursive: true });
await writeFile(join(salida, 'candidatas.json'), JSON.stringify({
  nota: 'Medidas concretas de programa que pueden ser tarjetas del test de 2026. Generado por scripts/investigacion/preparar-tarjetas.mjs; no se edita a mano.',
  generado: new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' }),
  partidos: porPartido, candidatas,
}, null, 1) + '\n');

const fila = t => `| ${t.nombre} | ${porPartido.filter(p => p.entra).map(p => candidatas.filter(c => c.partido === p.id && c.temas.includes(t.id)).length).join(' | ')} |`;
const entran = porPartido.filter(p => p.entra);
const md = `# Tarjetas del test de 2026 · medidas candidatas

Generado con \`node scripts/investigacion/preparar-tarjetas.mjs\`. No se edita a mano.

Solo medidas concretas de programa. ${candidatas.length} candidatas de ${entran.length} candidaturas.

| Candidatura | Documento | Medidas concretas | Con algún aviso |
| --- | --- | --- | --- |
${entran.map(p => `| ${p.nombre} | ${p.documento === 'programa' ? 'programa del 29N' : 'documento general'} | ${p.medidas_concretas} | ${p.con_aviso} |`).join('\n')}

Fuera del test: ${porPartido.filter(p => !p.entra).map(p => `${p.nombre} (${p.motivo})`).join('; ') || 'ninguna'}.

## Medidas concretas por tema

| Tema | ${entran.map(p => p.nombre).join(' | ')} |
| --- | ${entran.map(() => '---').join(' | ')} |
${config.temas.map(fila).join('\n')}

## Avisos

${[...new Set(candidatas.flatMap(c => c.avisos.map(a => a.replace(/ \(.*\)$/, ''))))].map(a => `- **${a}:** ${candidatas.filter(c => c.avisos.some(x => x.startsWith(a))).length}`).join('\n')}
`;
await writeFile(join(salida, 'candidatas.md'), md);
console.log(md.split('\n').slice(4, 12 + entran.length).join('\n'));
