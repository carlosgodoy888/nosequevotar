// Banco aprobado a partir de las dos revisiones independientes.
//
//   node scripts/banco/aprobar.mjs
//   node scripts/banco/aprobar.mjs --r1 otra/ruta-r1.csv --r2 otra/ruta-r2.csv --salida otra/ruta.json --informe otra/ruta.md
//   (y --g1 / --g2 para los CSV del glosario)
//
// Lee datos/banco/banco-2023.json (borrador) y datos/banco/REVISION-r1.csv y REVISION-r2.csv.
// Reglas:
// - una tarjeta pasa si los dos revisores marcan fiel = si y neutral = si, y no los dos delata = si;
// - si los dos marcan delata = si, queda «para reescribir» (no pasa);
// - si solo uno marca delata = si, pasa, con aviso;
// - si se rechaza la de test y se aprueba la de reserva, la reserva pasa a test;
// - si un partido se queda sin ninguna tarjeta aprobada en un tema donde la tenía, falla;
// - si una reserva pasa a test y su tema queda con más de 10 palabras de diferencia entre la tarjeta de test
//   más larga y la más corta, avisa (no falla: se corrige a mano y se vuelve a revisar).
// Glosario: lee datos/banco/glosario-2023.json y GLOSARIO-r1.csv y GLOSARIO-r2.csv; un término pasa si los dos
// revisores marcan correcta, neutral y clara = si. Solo se publican los términos aprobados, con las tarjetas aprobadas
// en que aparecen, bajo la clave «glosario».
// Escribe src/contenido/juegos/banco-2023.json (solo si no falla) y datos/banco/APROBACION.md (siempre).

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname, relative, resolve } from 'node:path';
import { RAIZ, BANCO, TEMAS, NOMBRE_PARTIDO, leerJson, escribirJson, deCsv, palabras } from './comun.mjs';

const MAX_DIFERENCIA = 10;

function opcion(nombre, defecto) {
  const i = process.argv.indexOf(`--${nombre}`);
  return i > 0 ? resolve(process.argv[i + 1]) : defecto;
}

const R1 = opcion('r1', join(BANCO, 'REVISION-r1.csv'));
const R2 = opcion('r2', join(BANCO, 'REVISION-r2.csv'));
const SALIDA = opcion('salida', join(RAIZ, 'src', 'contenido', 'juegos', 'banco-2023.json'));
const INFORME = opcion('informe', join(BANCO, 'APROBACION.md'));
const BORRADOR = opcion('banco', join(BANCO, 'banco-2023.json'));
const G1 = opcion('g1', join(BANCO, 'GLOSARIO-r1.csv'));
const G2 = opcion('g2', join(BANCO, 'GLOSARIO-r2.csv'));
const GLOSARIO = join(BANCO, 'glosario-2023.json');

// «si», «sí», «Sí», «SI» → true; «no» → false; vacío u otra cosa → null (sin revisar).
function siNo(v) {
  const t = (v || '').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  if (t === 'si') return true;
  if (t === 'no') return false;
  return null;
}

async function leerRevision(ruta, quien) {
  const filas = deCsv(await readFile(ruta, 'utf8'));
  const faltan = ['id', 'fiel', 'neutral', 'delata'].filter(c => filas.length && !(c in filas[0]));
  if (faltan.length) throw new Error(`${relative(RAIZ, ruta)} no tiene las columnas: ${faltan.join(', ')}`);
  return new Map(filas.map(f => [f.id, { fiel: siNo(f.fiel), neutral: siNo(f.neutral), delata: siNo(f.delata), notas: f.notas || '', quien }]));
}

async function main() {
  const banco = await leerJson(BORRADOR);
  const r1 = await leerRevision(R1, 'r1');
  const r2 = await leerRevision(R2, 'r2');

  const decision = new Map();
  const sinRevisar = [], rechazadas = [], paraReescribir = [], avisosDelata = [];
  for (const t of banco.tarjetas) {
    const a = r1.get(t.id), b = r2.get(t.id);
    const marcas = [a, b];
    if (marcas.some(m => !m || m.fiel === null || m.neutral === null)) {
      sinRevisar.push(t.id);
      decision.set(t.id, 'sin-revisar');
      continue;
    }
    if (a.delata && b.delata) {
      paraReescribir.push(t.id);
      decision.set(t.id, 'para-reescribir');
      continue;
    }
    if (marcas.every(m => m.fiel && m.neutral)) {
      decision.set(t.id, 'aprobada');
      if (a.delata || b.delata) avisosDelata.push(`${t.id} (lo marca ${a.delata ? 'r1' : 'r2'})`);
    } else {
      decision.set(t.id, 'rechazada');
      const motivos = marcas.flatMap(m => [!m.fiel && `${m.quien}: no fiel`, !m.neutral && `${m.quien}: no neutral`]).filter(Boolean);
      rechazadas.push(`${t.id} (${motivos.join('; ')})`);
    }
  }

  // Por partido y tema: la de test aprobada o, si no, la reserva aprobada pasa a test.
  const aprobadas = [];
  const sustituciones = [];
  const errores = [];
  const partidos = [...new Set(banco.tarjetas.flatMap(t => t.partidos))];
  for (const tema of TEMAS.map(t => t.id)) {
    for (const p of partidos) {
      const suyas = banco.tarjetas.filter(t => t.tema === tema && t.partidos.includes(p));
      if (!suyas.length) continue;
      const test = suyas.find(t => t.uso === 'test');
      const reserva = suyas.find(t => t.uso === 'reserva');
      const ok = (t) => t && decision.get(t.id) === 'aprobada';
      if (ok(test)) continue;
      if (ok(reserva)) {
        sustituciones.push(`${NOMBRE_PARTIDO[p] || p} · ${tema}: ${test ? test.id : '(sin test)'} → ${reserva.id}`);
        continue;
      }
      errores.push(`${NOMBRE_PARTIDO[p] || p} se queda sin tarjeta aprobada en «${tema}» (test: ${test ? `${test.id}, ${decision.get(test.id)}` : 'ninguna'}; reserva: ${reserva ? `${reserva.id}, ${decision.get(reserva.id)}` : 'ninguna'})`);
    }
  }

  // Tarjetas finales: las de test aprobadas, las reservas promovidas (con uso test) y las demás reservas aprobadas.
  const promovidas = new Set(sustituciones.map(s => s.split(' → ')[1]));
  for (const t of banco.tarjetas) {
    if (decision.get(t.id) !== 'aprobada') continue;
    const rev = { estado: 'aprobada', revisor1: r1.get(t.id), revisor2: r2.get(t.id) };
    const notas = [rev.revisor1.notas, rev.revisor2.notas].filter(Boolean).join(' · ');
    aprobadas.push({ ...t, uso: promovidas.has(t.id) ? 'test' : t.uso,
      revision: { estado: 'aprobada', revisor1: { fiel: true, neutral: true, delata: !!rev.revisor1.delata }, revisor2: { fiel: true, neutral: true, delata: !!rev.revisor2.delata }, notas } });
  }
  // Si una reserva sube a test, la de test rechazada ya no está; si la de test estaba aprobada, la reserva sigue de reserva.

  // Equilibrio: en los temas con alguna reserva promovida, las tarjetas de test no pueden separarse más de 10 palabras.
  const avisosEquilibrio = [];
  for (const tema of new Set(aprobadas.filter(t => promovidas.has(t.id)).map(t => t.tema))) {
    const tests = aprobadas.filter(t => t.tema === tema && t.uso === 'test');
    const n = tests.map(t => palabras(t.texto));
    const dif = Math.max(...n) - Math.min(...n);
    if (dif > MAX_DIFERENCIA) {
      const larga = tests[n.indexOf(Math.max(...n))], corta = tests[n.indexOf(Math.min(...n))];
      avisosEquilibrio.push(`«${tema}»: ${dif} palabras de diferencia entre las tarjetas de test (máximo ${MAX_DIFERENCIA}): la más larga es ${larga.id} (${Math.max(...n)}) y la más corta ${corta.id} (${Math.min(...n)})`);
    }
  }

  // Glosario: aprobado si los dos revisores marcan correcta, neutral y clara = si.
  const leerGlosario = async (ruta, quien) => {
    const filas = deCsv(await readFile(ruta, 'utf8'));
    const faltan = ['id', 'correcta', 'neutral', 'clara'].filter(c => filas.length && !(c in filas[0]));
    if (faltan.length) throw new Error(`${relative(RAIZ, ruta)} no tiene las columnas: ${faltan.join(', ')}`);
    return new Map(filas.map(f => [f.id, { correcta: siNo(f.correcta), neutral: siNo(f.neutral), clara: siNo(f.clara), notas: f.notas || '', quien }]));
  };
  const terminos = await leerJson(GLOSARIO);
  const g1 = await leerGlosario(G1, 'r1');
  const g2 = await leerGlosario(G2, 'r2');
  const idsAprobadas = new Set(aprobadas.map(t => t.id));
  const glosarioAprobado = [], glosarioRechazado = [], glosarioSinRevisar = [];
  for (const g of terminos) {
    const marcas = [g1.get(g.id), g2.get(g.id)];
    if (marcas.some(m => !m || m.correcta === null || m.neutral === null || m.clara === null)) { glosarioSinRevisar.push(g.id); continue; }
    const fallos = marcas.flatMap(m => ['correcta', 'neutral', 'clara'].filter(c => !m[c]).map(c => `${m.quien}: no ${c}`));
    if (fallos.length) { glosarioRechazado.push(`${g.id} (${fallos.join('; ')})`); continue; }
    const tarjetasG = g.tarjetas.filter(id => idsAprobadas.has(id));
    if (tarjetasG.length) glosarioAprobado.push({ ...g, tarjetas: tarjetasG });
  }

  const lista = (xs) => xs.length ? xs.map(x => `- ${x}`).join('\n') : '- Ninguna.';
  const md = `# Aprobación del banco de 2023

Generado el ${new Date().toISOString()} con \`node scripts/banco/aprobar.mjs\`.

- Revisión 1: \`${relative(RAIZ, R1)}\` · Revisión 2: \`${relative(RAIZ, R2)}\`
- Tarjetas en el borrador: ${banco.tarjetas.length}
- Aprobadas: ${aprobadas.length} (de test: ${aprobadas.filter(t => t.uso === 'test').length})
- Resultado: ${errores.length ? '**FALLA**: no se escribe el banco aprobado.' : `escrito \`${relative(RAIZ, SALIDA)}\`.`}

## Errores (partidos sin tarjeta aprobada en un tema)
${lista(errores)}

## Para reescribir (los dos revisores marcan «delata»)
${lista(paraReescribir)}

## Rechazadas (no fiel o no neutral para algún revisor)
${lista(rechazadas)}

## Sin revisar (falta fiel o neutral en algún CSV, o el id no está)
${lista(sinRevisar)}

## La reserva sustituye a la de test
${lista(sustituciones)}

## Avisos: solo un revisor marca «delata» (la tarjeta pasa)
${lista(avisosDelata)}

## Avisos de equilibrio (temas con una reserva que pasa a test)
${lista(avisosEquilibrio)}

## Glosario
- Revisión 1: \`${relative(RAIZ, G1)}\` · Revisión 2: \`${relative(RAIZ, G2)}\`
- Términos aprobados: ${glosarioAprobado.length} de ${terminos.length}

### Rechazados (no correcta, no neutral o no clara para algún revisor)
${lista(glosarioRechazado)}

### Sin revisar
${lista(glosarioSinRevisar)}
`;
  await mkdir(dirname(INFORME), { recursive: true });
  await writeFile(INFORME, md);

  console.log(`Aprobadas: ${aprobadas.length} de ${banco.tarjetas.length} · para reescribir: ${paraReescribir.length} · rechazadas: ${rechazadas.length} · sin revisar: ${sinRevisar.length} · reservas que pasan a test: ${sustituciones.length} · avisos de «delata»: ${avisosDelata.length} · avisos de equilibrio: ${avisosEquilibrio.length} · glosario: ${glosarioAprobado.length} de ${terminos.length} términos aprobados`);
  for (const a of avisosEquilibrio) console.warn(`AVISO de equilibrio: ${a}`);
  console.log(`Escrito ${relative(RAIZ, INFORME)}`);
  if (errores.length) {
    console.error(`\nERROR: hay partidos sin ninguna tarjeta aprobada en un tema donde la tenían:\n${errores.map(e => `  · ${e}`).join('\n')}`);
    process.exit(1);
  }

  const { tarjetas, ...resto } = banco;
  await escribirJson(SALIDA, { ...resto, aprobado: new Date().toISOString(), tarjetas: aprobadas, glosario: glosarioAprobado });
  console.log(`Escrito ${relative(RAIZ, SALIDA)}`);
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
