// Prepara, para cada partido, las citas vigentes agrupadas por tema, en el formato que leen los
// agentes que escriben los resúmenes: _trabajo/resumenes-entrada/<partido>.json.
//
//   node scripts/investigacion/preparar-resumenes.mjs [partido …]
//
// Cada cita lleva su id, para que cada frase del resumen pueda apoyarse en citas concretas.
// Las citas en catalán, gallego o euskera van con su traducción.

import { readdir, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { DIR, leerJson, temasDeCita } from './comun.mjs';

const config = await leerJson(join(DIR, 'temas.json'));
const mapa = await leerJson(join(DIR, 'partidos.json'));
const pedidos = process.argv.slice(2);
const ids = (await readdir(join(DIR, 'citas'))).filter(a => a.endsWith('.json')).map(a => a.slice(0, -5)).filter(p => !pedidos.length || pedidos.includes(p));
const salida = join(DIR, '_trabajo', 'resumenes-entrada');
await mkdir(salida, { recursive: true });

for (const id of ids) {
  const p = mapa.partidos.find(x => x.id === id);
  const citas = (await leerJson(join(DIR, 'citas', `${id}.json`))).citas.filter(c => c.estado === 'vigente');
  const porTema = config.temas.map(t => {
    const del = citas.filter(c => temasDeCita(c, config).includes(t.id));
    return {
      tema: t.id, nombre: t.nombre, definicion: t.definicion,
      citas: del.map(c => ({
        id: c.id, origen: c.tipo === 'programa' ? 'programa' : 'declaracion',
        clase: c.clase, concreta: c.medida_concreta,
        texto: c.traduccion ?? c.cita, ...(c.traduccion ? { original: c.cita } : {}),
        ...(c.tipo !== 'programa' ? { quien: [c.quien, c.cargo].filter(Boolean).join(', '), fecha: c.fecha } : {}),
        apartado: c.apartado_original?.join(' › '),
      })),
    };
  });
  await writeFile(join(salida, `${id}.json`), JSON.stringify({ partido: id, nombre: p.nombre, programa: p.programa.estado, temas: porTema }, null, 1) + '\n');
  console.log(`${id}: ${porTema.filter(t => t.citas.length).length} temas con citas · ${citas.length} citas`);
}
