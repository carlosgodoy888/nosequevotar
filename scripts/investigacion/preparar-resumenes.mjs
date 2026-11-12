// Prepara, para cada partido, las citas vigentes agrupadas por tema, en el formato que leen los
// agentes que escriben los resúmenes: _trabajo/resumenes-entrada/<partido>.json.
//
//   node scripts/investigacion/preparar-resumenes.mjs [partido …]
//
// Cada cita lleva su id, para que cada frase del resumen pueda apoyarse en citas concretas.
// Las citas en catalán, gallego o euskera van con su traducción.

import { readdir, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { DIR, leerJson, leerFuentes, temasDeCita } from './comun.mjs';

// De qué documento sale cada cita de programa: un partido puede tener el programa de estas elecciones
// y además un documento parcial o general, y el redactor tiene que saber cuál pesa más.
const CLASE = { programa: 'programa electoral de estas elecciones', documento_parcial: 'documento parcial del partido', programa_general: 'documento general del partido, no es de estas elecciones' };
const fuentes = new Map((await leerFuentes()).map(f => [f.id, f]));
const documentoDe = c => { const f = fuentes.get(c.fuente); return f ? `${f.titulo} (${CLASE[f.clase] ?? f.clase}, ${f.publicado})` : undefined; };

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
        // De una declaración interesa también dónde se publicó: puede ser un programa autonómico o una nota local.
        ...(c.tipo !== 'programa' ? { quien: [c.quien, c.cargo].filter(Boolean).join(', '), fecha: c.fecha, medio: c.medio } : { documento: documentoDe(c) }),
        apartado: c.apartado_original?.join(' › '),
      })),
    };
  });
  await writeFile(join(salida, `${id}.json`), JSON.stringify({ partido: id, nombre: p.nombre, programa: p.programa.estado, temas: porTema }, null, 1) + '\n');
  console.log(`${id}: ${porTema.filter(t => t.citas.length).length} temas con citas · ${citas.length} citas`);
}
