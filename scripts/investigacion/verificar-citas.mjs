// Comprueba los archivos de citas extraídas de un documento: formato y que cada cita está en su página.
//
//   node scripts/investigacion/verificar-citas.mjs <archivo.json> …   esos archivos
//   node scripts/investigacion/verificar-citas.mjs                    todos los de _trabajo/citas/
//
// Anota en cada cita el campo «verificacion», con el mismo criterio que el banco de 2023:
//   exacta         está tal cual; solo cambian espacios y saltos de línea;
//   normalizada    está después de unir palabras partidas a final de línea o de página y de igualar
//                  comillas y ligaduras;
//   no-encontrada  no está en su página (ni empieza en ella y sigue en la siguiente).
// Termina con código 1 si hay errores de formato o alguna «no-encontrada».

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, resolve, relative } from 'node:path';
import { RAIZ, TRABAJO, leerFuentes, paginasDe, verificar } from './comun.mjs';

const MAX_PALABRAS = 110;

const fuentes = new Map((await leerFuentes()).map(f => [f.id, f]));

async function todos(dir) {
  const salida = [];
  for (const e of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    if (e.isDirectory()) salida.push(...await todos(join(dir, e.name)));
    else if (e.name.endsWith('.json')) salida.push(join(dir, e.name));
  }
  return salida.sort();
}

const palabras = t => (t.match(/[\p{L}\p{N}][\p{L}\p{N}'’.,%€-]*/gu) || []).length;
const esTexto = v => typeof v === 'string' && v.trim().length > 0;

const archivos = process.argv.length > 2 ? process.argv.slice(2).map(a => resolve(a)) : await todos(TRABAJO);
if (!archivos.length) { console.error('No hay archivos de citas que comprobar.'); process.exit(1); }

let hayFallos = false;
const total = { citas: 0, exacta: 0, normalizada: 0, 'no-encontrada': 0 };
for (const archivo of archivos) {
  const nombre = relative(RAIZ, archivo);
  const errores = [];
  let datos;
  try { datos = JSON.parse(await readFile(archivo, 'utf8')); } catch (e) { console.log(`${nombre}: JSON no válido (${e.message})`); hayFallos = true; continue; }

  const fuente = fuentes.get(datos.fuente);
  if (!fuente) errores.push(`la fuente «${datos.fuente}» no está en fuentes.json`);
  if (fuente && datos.partido !== fuente.partido) errores.push(`el partido «${datos.partido}» no es el de la fuente (${fuente.partido})`);
  const [desde, hasta] = Array.isArray(datos.paginas) ? datos.paginas : [];
  if (!Number.isInteger(desde) || !Number.isInteger(hasta) || desde > hasta) errores.push('«paginas» debe ser [primera, última]');
  if (!Array.isArray(datos.citas)) errores.push('falta la lista «citas»');

  if (!errores.length) {
    const paginas = await paginasDe(datos.fuente);
    const vistas = new Set();
    datos.citas.forEach((c, i) => {
      const donde = `cita ${i + 1}${Number.isInteger(c.pagina) ? ` (p. ${c.pagina})` : ''}`;
      const mal = m => errores.push(`${donde}: ${m}`);
      if (!esTexto(c.cita)) return mal('falta «cita»');
      if (!Number.isInteger(c.pagina) || c.pagina < desde || c.pagina > hasta) mal(`la página no está entre ${desde} y ${hasta}`);
      if (!Array.isArray(c.apartado) || !c.apartado.length || !c.apartado.every(esTexto)) mal('«apartado» debe ser una lista de títulos, del más general al más concreto');
      if (!['medida', 'posicion'].includes(c.clase)) mal('«clase» debe ser "medida" o "posicion"');
      if (typeof c.medida_concreta !== 'boolean') mal('«medida_concreta» debe ser true o false');
      if (c.clase === 'posicion' && c.medida_concreta === true) mal('una «posicion» no puede ser «medida_concreta»');
      if (c.numero !== null && !esTexto(c.numero)) mal('«numero» debe ser un texto o null');
      if (!esTexto(c.nota)) mal('falta «nota»');
      if (!Array.isArray(c.etiquetas) || c.etiquetas.length < 1 || c.etiquetas.length > 3 || !c.etiquetas.every(esTexto)) mal('«etiquetas» debe tener de 1 a 3 temas');
      if (fuente.idioma !== 'es' && !esTexto(c.traduccion)) mal(`falta «traduccion» (el documento está en «${fuente.idioma}»)`);
      if (fuente.idioma === 'es' && c.traduccion != null) mal('«traduccion» debe ser null: el documento está en castellano');
      if (palabras(c.cita) > MAX_PALABRAS) mal(`la cita tiene ${palabras(c.cita)} palabras (máximo ${MAX_PALABRAS})`);
      const k = c.cita.replace(/\s+/g, ' ').trim();
      if (vistas.has(k)) mal('cita repetida en el archivo');
      vistas.add(k);
      if (Number.isInteger(c.pagina)) {
        c.verificacion = verificar(paginas, c.cita, c.pagina);
        total[c.verificacion]++;
        if (c.verificacion === 'no-encontrada') mal(`NO ENCONTRADA en su página: «${c.cita.slice(0, 110)}…»`);
      }
      total.citas++;
    });
    await writeFile(archivo, JSON.stringify(datos, null, 2) + '\n');
  }

  const n = v => (datos.citas ?? []).filter(c => c.verificacion === v).length;
  console.log(`${nombre}: ${datos.citas?.length ?? 0} citas · ${n('exacta')} exactas · ${n('normalizada')} normalizadas · ${n('no-encontrada')} no encontradas · ${errores.length} errores`);
  for (const e of errores) console.log(`   · ${e}`);
  if (errores.length) hayFallos = true;
}
if (archivos.length > 1) console.log(`\nTotal: ${total.citas} citas · ${total.exacta} exactas · ${total.normalizada} normalizadas · ${total['no-encontrada']} no encontradas`);
process.exit(hayFallos ? 1 : 0);
