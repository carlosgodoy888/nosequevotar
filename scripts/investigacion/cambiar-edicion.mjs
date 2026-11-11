// Pasa las citas de un documento a una edición nueva del mismo documento cuando el texto no cambia
// pero sí la paginación (el partido lo vuelve a maquetar o le quita páginas en blanco).
//
//   node scripts/investigacion/cambiar-edicion.mjs <fuente-anterior> <fuente-nueva>
//
// Las dos fuentes tienen que estar en fuentes.json y la nueva, con su texto extraído. Busca cada cita
// vigente de la fuente anterior en las páginas de la nueva, con el mismo verificador de siempre, y le
// cambia la fuente y la página. La página anterior queda guardada en la cita. Si alguna cita no aparece
// en la edición nueva, no cambia nada y lo dice: entonces el texto ha cambiado y hay que volver a extraer.

import { writeFile, appendFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DIR, leerJson, leerFuentes, paginasDe, verificar } from './comun.mjs';

const [anterior, nueva] = process.argv.slice(2);
if (!anterior || !nueva) { console.error('Uso: node scripts/investigacion/cambiar-edicion.mjs <fuente-anterior> <fuente-nueva>'); process.exit(1); }
const HOY = process.env.FECHA_HOY || new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });

const registro = { ...(await leerJson(join(DIR, 'fuentes.json'))) };
const fA = registro.fuentes.find(f => f.id === anterior);
const fN = registro.fuentes.find(f => f.id === nueva);
if (!fA || !fN) { console.error('Las dos fuentes tienen que estar en fuentes.json.'); process.exit(1); }
if (fA.partido !== fN.partido) { console.error('Las dos fuentes tienen que ser del mismo partido.'); process.exit(1); }

const ruta = join(DIR, 'citas', `${fA.partido}.json`);
const datos = await leerJson(ruta);
const paginas = await paginasDe(nueva);
const propias = datos.citas.filter(c => c.fuente === anterior && c.estado === 'vigente');

// Las citas van en el orden del documento: se busca desde la página de la cita anterior en adelante
// y, si no está, en todo el documento. Así una frase repetida cae en su sitio.
const cambios = [];
const perdidas = [];
let desde = 1;
for (const c of propias) {
  let hallada = null;
  const orden = [...Array.from({ length: paginas.length - desde + 1 }, (_, i) => desde + i), ...Array.from({ length: desde - 1 }, (_, i) => i + 1)];
  for (const p of orden) {
    const v = verificar(paginas, c.cita, p);
    if (v !== 'no-encontrada') { hallada = { pagina: p, verificacion: v }; break; }
  }
  if (!hallada) { perdidas.push(c); continue; }
  cambios.push({ c, ...hallada });
  desde = Math.max(1, hallada.pagina);
}

if (perdidas.length) {
  console.error(`${perdidas.length} de ${propias.length} citas no están en la edición nueva. No se cambia nada:\n${perdidas.slice(0, 20).map(c => `  · p. ${c.pagina}: «${c.cita.slice(0, 90)}…»`).join('\n')}`);
  process.exit(1);
}

for (const { c, pagina, verificacion } of cambios) {
  c.edicion_anterior = { fuente: anterior, pagina: c.pagina };
  c.fuente = nueva;
  c.pagina = pagina;
  c.verificacion = verificacion;
  c.fecha = fN.publicado ?? c.fecha;
}
datos.fuentes = [...new Set(datos.citas.map(c => c.fuente).filter(Boolean))];
datos.actualizado = HOY;
const vigentes = datos.citas.filter(c => c.estado === 'vigente');
datos.resumen = { ...datos.resumen, exactas: vigentes.filter(c => c.verificacion === 'exacta').length, normalizadas: vigentes.filter(c => c.verificacion === 'normalizada').length };
await writeFile(ruta, JSON.stringify(datos, null, 2) + '\n');

fA.estado = 'sustituida';
fA.sustituida_por = nueva;
fA.sustituida_el = HOY;
await writeFile(join(DIR, 'fuentes.json'), JSON.stringify(registro, null, 2) + '\n');
await appendFile(join(DIR, 'CAMBIOS.md'), `- ${HOY} · ${fA.partido} · ${anterior} → ${nueva}: edición nueva del mismo documento. ${cambios.length} citas pasan a la paginación nueva; ninguna se pierde.\n`);

const n = v => cambios.filter(x => x.verificacion === v).length;
console.log(`${fA.partido}: ${cambios.length} citas pasan de ${anterior} a ${nueva} (${n('exacta')} exactas, ${n('normalizada')} normalizadas).`);
