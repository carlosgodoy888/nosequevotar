// Comprueba que cada cita aparece en su página del PDF, o empieza en ella y sigue en la siguiente.
//
//   node scripts/banco/verificar.mjs                       todas las candidatas (datos/banco/candidatas/)
//   node scripts/banco/verificar.mjs <partido>-<tema> …    solo esos archivos
//
// Resultado en el campo «verificacion» de cada candidata:
//   exacta         la cita está tal cual; solo cambian espacios y saltos de línea, que en el texto
//                  extraído son disposición de la página y no caracteres del programa;
//   normalizada    está después de normalizar también guiones de fin de línea, guion blando,
//                  comillas tipográficas y ligaduras;
//   no-encontrada  no está: se corrige copiando del texto o se descarta.
// Termina con código 1 si queda alguna «no-encontrada».

import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { CANDIDATAS, TEXTOS, leerJson, escribirJson, normalizar } from './comun.mjs';

const espacios = (t) => t.replace(/\s+/g, ' ').trim();

const cache = new Map();
export async function textoDocumento(documento) {
  if (!cache.has(documento)) cache.set(documento, await leerJson(join(TEXTOS, `${documento}.json`)));
  return cache.get(documento);
}

// Devuelve «exacta», «normalizada» o «no-encontrada».
export function verificarCita(paginas, cita, pagina) {
  const actual = paginas[pagina - 1]?.texto;
  if (actual === undefined || !cita?.trim()) return 'no-encontrada';
  const siguiente = paginas[pagina]?.texto || '';
  // Si la cita sigue en la página siguiente, tiene que empezar en la suya. Entre las dos suele
  // haber pie y cabecera de página, así que vale partirla por un espacio: el principio en su
  // página y el resto en la siguiente.
  const prueba = (f) => {
    const c = f(cita);
    const a = f(actual);
    if (a.includes(c)) return true;
    const b = f(siguiente);
    // El trozo de su página tiene al menos 25 caracteres, para que la página de la cita sea la buena.
    for (let i = c.indexOf(' ', 25); i > 0; i = c.indexOf(' ', i + 1)) {
      if (a.includes(c.slice(0, i)) && b.includes(c.slice(i + 1))) return true;
    }
    return false;
  };
  if (prueba(espacios)) return 'exacta';
  if (prueba(normalizar)) return 'normalizada';
  return 'no-encontrada';
}

async function main() {
  const pedidos = process.argv.slice(2);
  const archivos = pedidos.length ? pedidos.map(a => `${a.replace(/\.json$/, '')}.json`)
    : (await readdir(CANDIDATAS)).filter(a => a.endsWith('.json')).sort();
  const total = { exacta: 0, normalizada: 0, 'no-encontrada': 0 };
  const fallos = [];
  for (const archivo of archivos) {
    const [partido] = archivo.split('-');
    const paginas = await textoDocumento(`2023-${partido}`);
    const lista = await leerJson(join(CANDIDATAS, archivo));
    for (const c of lista) {
      c.verificacion = verificarCita(paginas, c.cita, c.pagina);
      total[c.verificacion]++;
      if (c.verificacion === 'no-encontrada') fallos.push(`${archivo} p.${c.pagina}: «${c.cita.slice(0, 90)}…»`);
    }
    await escribirJson(join(CANDIDATAS, archivo), lista);
    const n = (v) => lista.filter(c => c.verificacion === v).length;
    console.log(`${archivo.padEnd(24)} ${String(lista.length).padStart(3)} citas · ${n('exacta')} exactas · ${n('normalizada')} normalizadas · ${n('no-encontrada')} no encontradas`);
  }
  console.log(`\nTotal: ${total.exacta + total.normalizada + total['no-encontrada']} citas · ${total.exacta} exactas · ${total.normalizada} normalizadas · ${total['no-encontrada']} no encontradas`);
  if (fallos.length) {
    console.log(`\nNO ENCONTRADAS:\n${fallos.map(f => `  · ${f}`).join('\n')}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  });
}
