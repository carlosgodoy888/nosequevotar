// Aplica a resumenes.json los cambios de la revisión cruzada por tema que el verificador aceptó.
//
//   node scripts/investigacion/aplicar-revision-cruzada.mjs <resultado.json>
//
// <resultado.json>: { resultados: [{ tema, cambios: { cambios: [...] }, veredictos: { revisiones: [...] } }] }.
// Solo entran los cambios «aceptar» o «aceptar_con_ajuste», con la versión del verificador. No toca los
// resúmenes revisados a mano. Comprueba que los apoyos son citas del partido en ese tema.

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DIR, leerJson, temasDeCita } from './comun.mjs';

const ruta = process.argv[2];
if (!ruta) { console.error('Uso: node scripts/investigacion/aplicar-revision-cruzada.mjs <resultado.json>'); process.exit(1); }
const HOY = process.env.FECHA_HOY || new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
const config = await leerJson(join(DIR, 'temas.json'));
const archivo = join(DIR, 'resumenes.json');
const datos = await leerJson(archivo);
const { resultados } = JSON.parse(await readFile(ruta, 'utf8'));

const cuenta = { aceptados: 0, rechazados: 0, protegidos: 0, invalidos: 0 };
const informe = [];
for (const r of resultados) {
  const motivos = new Map((r.cambios?.cambios ?? []).map(c => [c.partido, c.motivo]));
  for (const v of r.veredictos?.revisiones ?? []) {
    const actual = datos.resumenes[v.partido]?.[r.tema];
    if (v.veredicto === 'rechazar' || !v.frases?.length) { cuenta.rechazados++; continue; }
    if (actual?.revisado_a_mano) { cuenta.protegidos++; continue; }
    const citas = (await leerJson(join(DIR, 'citas', `${v.partido}.json`))).citas.filter(c => c.estado === 'vigente' && temasDeCita(c, config).includes(r.tema));
    const ids = new Set(citas.map(c => c.id));
    const malos = v.frases.flatMap(f => f.apoyos).filter(a => !ids.has(a));
    if (malos.length) { cuenta.invalidos++; informe.push(`INVÁLIDO ${v.partido} · ${r.tema}: ${malos.join(', ')}`); continue; }
    datos.resumenes[v.partido] ??= {};
    datos.resumenes[v.partido][r.tema] = {
      ...(actual ?? { base: 'suficiente' }),
      frases: v.frases,
      revision_cruzada: { fecha: HOY, motivo: motivos.get(v.partido) ?? '', veredicto: v.veredicto, nota_verificador: v.motivo },
    };
    cuenta.aceptados++;
    informe.push(`${v.partido} · ${r.tema}: ${motivos.get(v.partido) ?? ''}`);
  }
}
await writeFile(archivo, JSON.stringify(datos, null, 2) + '\n');
await writeFile(join(DIR, '_trabajo', 'revision-cruzada-aplicada.txt'), informe.join('\n') + '\n');
console.log(JSON.stringify(cuenta));
