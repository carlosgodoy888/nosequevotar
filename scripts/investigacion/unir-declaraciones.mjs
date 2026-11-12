// Incorpora a citas/<partido>.json las declaraciones recogidas y verificadas por los agentes.
//
//   node scripts/investigacion/unir-declaraciones.mjs <resultado.json>
//
// <resultado.json> es el resultado del workflow de declaraciones: { resultados: [{ id, investigacion, verificacion }] }.
// Solo entran las citas que el verificador dio por «comprobada» o «corregida» (con su corrección aplicada).
// Las «no_comprobable» y «rechazada» se guardan en _trabajo/declaraciones-descartadas.json con su motivo.
// Igual que unir-citas.mjs: identificador estable por partido y texto, nada se borra y cada cambio va a CAMBIOS.md.

import { readFile, writeFile, appendFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { DIR, leerJson } from './comun.mjs';

const HOY = process.env.FECHA_HOY || new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
const ruta = process.argv[2];
if (!ruta) { console.error('Uso: node scripts/investigacion/unir-declaraciones.mjs <resultado.json>'); process.exit(1); }

const temas = new Set((await leerJson(join(DIR, 'temas.json'))).temas.map(t => t.id));
const plano = t => String(t ?? '').replace(/\s+/g, ' ').trim();
const idDe = (partido, cita) => `c-${createHash('sha256').update(`${partido}|${plano(cita).normalize('NFC')}`).digest('hex').slice(0, 10)}`;
const TIPO = { documento_partido: 'documento', congreso: 'congreso', medio: 'declaracion', redes: 'redes' };

// «fecha: 2026-11-02; cargo: portavoz» → { fecha: '2026-11-02', cargo: 'portavoz' }
function campos(texto) {
  const salida = {};
  for (const parte of String(texto ?? '').split(/;\s*(?=[a-z_]+\s*:)/i)) {
    const m = parte.match(/^\s*([a-z_]+)\s*:\s*(.+?)\s*$/i);
    if (m) salida[m[1].toLowerCase()] = m[2];
  }
  return salida;
}

const { resultados } = await leerJson(ruta);
const descartadas = [];
const cambios = [];
await mkdir(join(DIR, 'citas'), { recursive: true });

for (const r of resultados) {
  if (!r?.investigacion) continue;
  const revisiones = new Map((r.verificacion?.revisiones ?? []).map(v => [v.n, v]));
  const archivo = join(DIR, 'citas', `${r.id}.json`);
  const datos = await leerJson(archivo).catch(() => ({ partido: r.id, citas: [] }));
  const antes = new Map(datos.citas.map(c => [c.id, c]));
  let añadidas = 0;

  r.investigacion.citas.forEach((c, i) => {
    const v = revisiones.get(i + 1);
    if (!v || !['comprobada', 'corregida'].includes(v.veredicto)) {
      descartadas.push({ partido: r.id, veredicto: v?.veredicto ?? 'sin_verificar', motivo: v?.motivo ?? '', ...c });
      return;
    }
    const x = { ...c, ...campos(v.campos_corregidos) };
    if (v.cita_corregida?.trim()) x.cita = v.cita_corregida;
    // Una corrección de los temas secundarios llega como texto («tema-a, tema-b»), no como lista.
    if (typeof x.temas_secundarios === 'string') x.temas_secundarios = x.temas_secundarios.split(/[,\s]+/).filter(Boolean);
    const temasCita = [x.tema, ...(x.temas_secundarios ?? [])].filter(t => temas.has(t));
    if (!temasCita.length) { descartadas.push({ partido: r.id, veredicto: 'tema_desconocido', motivo: `tema «${x.tema}»`, ...c }); return; }
    const id = idDe(r.id, x.cita);
    if (antes.has(id) && antes.get(id).estado === 'vigente') return;
    datos.citas.push({
      id, partido: r.id, tipo: TIPO[x.tipo] ?? 'declaracion',
      clase: x.clase, medida_concreta: x.medida_concreta === true || x.medida_concreta === 'true',
      cita: plano(x.cita), ...(plano(x.traduccion) ? { traduccion: plano(x.traduccion) } : {}), idioma: x.idioma,
      url: x.url, medio: x.medio, quien: x.quien, cargo: x.cargo, partido_de_quien: x.partido_de_quien, fecha: x.fecha,
      nota: x.nota, temas: temasCita, verificacion: v.veredicto === 'comprobada' ? 'fuente-abierta' : 'fuente-abierta-corregida',
      estado: 'vigente', recogida: HOY,
    });
    añadidas++;
  });

  const vigentes = datos.citas.filter(c => c.estado === 'vigente');
  datos.partido = r.id;
  datos.actualizado = añadidas ? HOY : datos.actualizado;
  datos.fuentes = [...new Set(datos.citas.map(c => c.fuente).filter(Boolean))];
  datos.resumen = {
    vigentes: vigentes.length,
    medidas: vigentes.filter(c => c.clase === 'medida').length,
    medidas_concretas: vigentes.filter(c => c.medida_concreta).length,
    posiciones: vigentes.filter(c => c.clase === 'posicion').length,
    de_programa: vigentes.filter(c => c.tipo === 'programa').length,
    declaraciones: vigentes.filter(c => c.tipo !== 'programa').length,
    exactas: vigentes.filter(c => c.verificacion === 'exacta').length,
    normalizadas: vigentes.filter(c => c.verificacion === 'normalizada').length,
    sustituidas: datos.citas.filter(c => c.estado === 'sustituida').length,
  };
  await writeFile(archivo, JSON.stringify(datos, null, 2) + '\n');
  console.log(`${r.id}: +${añadidas} declaraciones · ${datos.resumen.vigentes} citas vigentes`);
  if (añadidas) cambios.push(`- ${HOY} · ${r.id} · declaraciones: ${añadidas} citas nuevas. Quedan ${datos.resumen.vigentes} vigentes.`);
}

const rutaDesc = join(DIR, '_trabajo', 'declaraciones-descartadas.json');
const previas = await leerJson(rutaDesc).catch(() => []);
await writeFile(rutaDesc, JSON.stringify([...previas, ...descartadas.map(d => ({ ...d, descartada: HOY }))], null, 2) + '\n');
console.log(`Descartadas: ${descartadas.length} (en _trabajo/declaraciones-descartadas.json)`);

if (cambios.length) {
  const rc = join(DIR, 'CAMBIOS.md');
  if ((await readFile(rc, 'utf8').catch(() => null)) === null) await writeFile(rc, '# Registro de cambios de la investigación de 2026\n\n');
  await appendFile(rc, cambios.join('\n') + '\n');
}
