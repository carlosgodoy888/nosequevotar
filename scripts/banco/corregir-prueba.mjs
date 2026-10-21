// Corrige la prueba de adivinar: por cada texto, qué porcentaje de personas acierta el partido.
//
//   node scripts/banco/corregir-prueba.mjs [ruta/respuestas.csv]
//
// Lee datos/banco/PRUEBA-ADIVINAR-respuestas.csv (una fila por persona, una columna por texto: T1, T2…)
// y el orden de los textos, que se recalcula desde datos/banco/banco-2023.json con la misma semilla
// que generar.mjs. Las respuestas válidas son PP, PSOE, Vox, Sumar o «no sé» (sin distinguir
// mayúsculas ni tildes); «no sé» y las vacías no cuentan como acierto, y las vacías no cuentan
// como respuesta. Marca para reescribir los textos que acierta más de la mitad (el azar está en el 25 %).

import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { BANCO, NOMBRE_PARTIDO, leerJson, deCsv, ordenPrueba } from './comun.mjs';

const ruta = process.argv[2] ? resolve(process.argv[2]) : join(BANCO, 'PRUEBA-ADIVINAR-respuestas.csv');
const limpiar = (v) => (v || '').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
const VALIDAS = new Set(['pp', 'psoe', 'vox', 'sumar', 'no se']);

async function main() {
  const banco = await leerJson(join(BANCO, 'banco-2023.json'));
  const orden = ordenPrueba(banco);
  const personas = deCsv(await readFile(ruta, 'utf8')).filter(f => orden.some(o => limpiar(f[`T${o.numero}`])));
  if (!personas.length) throw new Error('El CSV no tiene ninguna respuesta todavía.');

  const raras = [];
  const filas = orden.map(({ numero, tarjeta }) => {
    const col = `T${numero}`;
    const respuestas = personas.map(f => limpiar(f[col])).filter(Boolean);
    respuestas.filter(r => !VALIDAS.has(r)).forEach(r => raras.push(`${col}: «${r}»`));
    const aciertos = respuestas.filter(r => tarjeta.partidos.includes(r)).length;
    const pct = respuestas.length ? Math.round((aciertos / respuestas.length) * 100) : 0;
    return { numero, id: tarjeta.id, partido: tarjeta.partidos.map(p => NOMBRE_PARTIDO[p]).join(' y '), respuestas: respuestas.length, aciertos, pct, reescribir: aciertos * 2 > respuestas.length };
  });

  console.log(`${personas.length} personas · ${orden.length} textos\n`);
  console.log('Texto\tAciertos\t%\tPartido\tId');
  for (const f of filas) console.log(`T${f.numero}\t${f.aciertos}/${f.respuestas}\t${f.pct} %${f.reescribir ? ' ←' : ''}\t${f.partido}\t${f.id}`);
  const malos = filas.filter(f => f.reescribir);
  console.log(`\nPara reescribir (más de la mitad acierta): ${malos.length ? malos.map(f => `T${f.numero} (${f.id}, ${f.pct} %)`).join(', ') : 'ninguno'}`);
  if (raras.length) console.log(`\nRespuestas no reconocidas (no cuentan como acierto): ${raras.join(', ')}`);
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
