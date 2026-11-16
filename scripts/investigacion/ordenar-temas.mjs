// Calcula el orden estándar de los temas y lo aplica a temas.json.
// El orden sale de orden-temas.json: una encuesta sobre los problemas que más preocupan, con cada respuesta
// asignada a uno de nuestros temas. Ese orden es el de la página de temas, el de los temas dentro de cada
// partido y el del test, porque todos leen los temas de temas.json en el orden en que están.
//   node scripts/investigacion/ordenar-temas.mjs            calcula, reordena temas.json y escribe orden-temas.md
//   node scripts/investigacion/ordenar-temas.mjs --mirar    solo enseña el resultado
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DIR, leerJson } from './comun.mjs';

const mirar = process.argv.includes('--mirar');
const config = await leerJson(join(DIR, 'temas.json'));
const orden = await leerJson(join(DIR, 'orden-temas.json'));
const FUERA = new Set(['queja-politica', 'sin-contenido']);

const errores = [];
const ids = new Set(config.temas.map(t => t.id));
for (const r of orden.respuestas) {
  if (typeof r.espana !== 'number' || typeof r.personal !== 'number') errores.push(`«${r.respuesta}»: faltan los porcentajes`);
  if (r.tema !== null && !FUERA.has(r.tema) && !ids.has(r.tema)) errores.push(`«${r.respuesta}»: el tema «${r.tema}» no existe en temas.json`);
}
if (errores.length) { console.error(`No se cambia nada:\n${errores.map(e => `  · ${e}`).join('\n')}`); process.exit(1); }

const r1 = n => Math.round(n * 10) / 10;
const es = n => String(r1(n)).replace('.', ',');
const suma = (tema, campo) => r1(orden.respuestas.filter(r => r.tema === tema).reduce((s, r) => s + r[campo], 0));
const filas = config.temas.map((t, anterior) => {
  const espana = suma(t.id, 'espana');
  const personal = suma(t.id, 'personal');
  return { tema: t, anterior, espana, personal, total: r1(espana + personal), respuestas: orden.respuestas.filter(r => r.tema === t.id) };
}).sort((a, b) => b.total - a.total || b.espana - a.espana || a.anterior - b.anterior);

console.log('     ' + 'tema'.padEnd(32) + 'España'.padStart(8) + 'personal'.padStart(10) + 'suma'.padStart(8));
filas.forEach((f, i) => console.log(`${String(i + 1).padStart(3)}. ${f.tema.id.padEnd(32)}${es(f.espana).padStart(8)}${es(f.personal).padStart(10)}${es(f.total).padStart(8)}`));
if (mirar) process.exit(0);

const fuera = clave => orden.respuestas.filter(r => r.tema === clave);
const lista = rs => rs.map(r => `- ${r.respuesta}: ${es(r.espana)} · ${es(r.personal)}`).join('\n');
const f = orden.fuente;
const md = `# Orden de los temas

Generado con \`node scripts/investigacion/ordenar-temas.mjs\` a partir de \`orden-temas.json\`. No se edita a mano.

**Encuesta:** ${f.organismo}, estudio ${f.estudio}, «${f.titulo}» (${f.entrevistas.toLocaleString('es-ES')} entrevistas, ${f.trabajo_de_campo}). ${f.documento}: <${f.url}> (consultado el ${f.consultado}).

- **España:** ${orden.preguntas.espana}
- **Personal:** ${orden.preguntas.personal}

**Criterio:** ${orden.criterio}

| N.º | Tema | España | Personal | Suma | Respuestas de la encuesta que cuentan |
|---|---|---|---|---|---|
${filas.map((x, i) => `| ${i + 1} | ${x.tema.nombre} | ${es(x.espana)} | ${es(x.personal)} | ${es(x.total)} | ${x.respuestas.map(r => `${r.respuesta} (${es(r.espana)} · ${es(r.personal)})`).join('; ') || '—'} |`).join('\n')}

## Respuestas que no suman a ningún tema

Quejas sobre los políticos o la política en general (España · personal):

${lista(fuera('queja-politica'))}

No encajan en un solo tema:

${lista(orden.respuestas.filter(r => r.tema === null))}

Sin contenido:

${lista(fuera('sin-contenido'))}
`;

config.temas = filas.map(x => x.tema);
await writeFile(join(DIR, 'temas.json'), JSON.stringify(config, null, 2) + '\n');
await writeFile(join(DIR, 'orden-temas.md'), md);
console.log('\nEscritos temas.json (reordenado) y orden-temas.md');
