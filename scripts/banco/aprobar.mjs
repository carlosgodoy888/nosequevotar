// Banco aprobado a partir de las dos revisiones independientes.
//
//   node scripts/banco/aprobar.mjs
//   node scripts/banco/aprobar.mjs --r1 otra/ruta-r1.csv --r2 otra/ruta-r2.csv --salida otra/ruta.json --informe otra/ruta.md
//   (y --g1 / --g2 para los CSV del glosario)
//   node scripts/banco/aprobar.mjs --global --fecha 2026-10-22
//
// Modo global: aprobación conjunta de todas las tarjetas de test y de todo el glosario por dos personas del equipo,
// sin marcas individuales. No lee ni modifica los CSV. Las reservas no pasan al banco aprobado, y cada término del
// glosario enlaza solo a las tarjetas de test que lo contienen (los que no aparecen en ninguna se quedan fuera).
// Antes de escribir valida el banco; si algo falla, no escribe nada.
//
// Modo normal (con los CSV):
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
import { RAIZ, BANCO, TEMAS, ESTATALES, NOMBRE_PARTIDO, leerJson, escribirJson, deCsv, palabras } from './comun.mjs';

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

// ───── Modo global ─────

const NOTA_GLOBAL = 'Revisión y aprobación conjunta de todas las tarjetas y del glosario por dos personas del equipo, sin marcas individuales';
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function valor(nombre) {
  const i = process.argv.indexOf(`--${nombre}`);
  return i > 0 ? process.argv[i + 1] : undefined;
}

function validarGlobal(tests, glosario, todas) {
  const errores = [];
  const ids = new Set(todas.map(t => t.id));
  for (const t of tests) {
    if (t.partidos.length !== 1) errores.push(`${t.id}: ${t.partidos.length} partidos (debe haber uno)`);
    if (t.otrasCitas || typeof t.cita !== 'string' || !t.cita.trim()) errores.push(`${t.id}: debe tener una sola cita`);
    if (!/#page=\d+$/.test(t.enlace || '')) errores.push(`${t.id}: el enlace no lleva #page=`);
  }
  for (const tema of TEMAS) {
    const delTema = tests.filter(t => t.tema === tema.id);
    for (const p of new Set(delTema.map(t => t.partidos[0]))) {
      const n = delTema.filter(t => t.partidos[0] === p).length;
      if (n > 1) errores.push(`${tema.id}: ${NOMBRE_PARTIDO[p]} tiene ${n} tarjetas (como mucho una)`);
    }
    for (const p of ESTATALES) if (!delTema.some(t => t.partidos[0] === p)) errores.push(`${tema.id}: falta la tarjeta de ${NOMBRE_PARTIDO[p]}`);
    const n = delTema.map(t => palabras(t.texto));
    if (n.length && Math.max(...n) - Math.min(...n) > MAX_DIFERENCIA) errores.push(`${tema.id}: ${Math.max(...n) - Math.min(...n)} palabras de diferencia entre tarjetas (máximo ${MAX_DIFERENCIA})`);
  }
  for (const g of glosario) for (const id of g.tarjetas) if (!ids.has(id)) errores.push(`glosario ${g.id}: enlaza a la tarjeta ${id}, que no existe`);
  return errores;
}

async function aprobarGlobal() {
  const fecha = valor('fecha');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || '') || Number.isNaN(Date.parse(fecha))) throw new Error('Falta la fecha o no es válida: usa --fecha AAAA-MM-DD');
  const banco = await leerJson(BORRADOR);
  const terminos = await leerJson(GLOSARIO);
  const tests = banco.tarjetas.filter(t => t.uso === 'test');
  const idsTest = new Set(tests.map(t => t.id));

  console.log('Validación del modo global');
  const errores = validarGlobal(tests, terminos, banco.tarjetas);
  const comprobaciones = [
    `${tests.length} tarjetas de test con un partido y una cita cada una`,
    'todos los enlaces llevan #page=',
    `cada partido tiene como mucho una tarjeta por tema y los ${TEMAS.length} temas tienen tarjeta de ${ESTATALES.map(p => NOMBRE_PARTIDO[p]).join(', ')}`,
    `los ${terminos.length} términos del glosario enlazan a tarjetas que existen`,
    `en cada tema, como mucho ${MAX_DIFERENCIA} palabras de diferencia entre tarjetas`,
  ];
  if (errores.length) {
    console.error(`\nERROR: el banco no pasa la validación; no se escribe ${relative(RAIZ, SALIDA)}:\n${errores.map(e => `  · ${e}`).join('\n')}`);
    process.exit(1);
  }
  for (const c of comprobaciones) console.log(`  OK ${c}`);

  const glosario = [], fuera = [];
  for (const { excluir, ...g } of terminos) {
    const enlazadas = g.tarjetas.filter(id => idsTest.has(id));
    if (enlazadas.length) glosario.push({ ...g, tarjetas: enlazadas });
    else fuera.push(g);
  }
  const tarjetas = tests.map(t => ({ ...t, revision: { estado: 'aprobada', modo: 'global' } }));
  const aprobacion = { modo: 'global', revisores: 2, fecha, nota: NOTA_GLOBAL };
  const { anio, generado, temas, documentos } = banco;
  await escribirJson(SALIDA, { anio, generado, temas, documentos, tarjetas, glosario, aprobacion });

  // APROBACION.md
  const [a, m, d] = fecha.split('-').map(Number);
  const fechaLarga = `${d} de ${MESES[m - 1]} de ${a}`;
  const partidos = [...new Set(tarjetas.map(t => t.partidos[0]))];
  const tabla = (cab, filas) => `| ${cab.join(' | ')} |\n| ${cab.map(() => '---').join(' | ')} |\n${filas.map(f => `| ${f.join(' | ')} |`).join('\n')}`;
  const porPartidoTema = tabla(['Partido', ...TEMAS.map(t => t.nombre), 'Total'], [
    ...partidos.map(p => [NOMBRE_PARTIDO[p], ...TEMAS.map(t => tarjetas.filter(x => x.tema === t.id && x.partidos[0] === p).length), tarjetas.filter(x => x.partidos[0] === p).length]),
    ['**Total**', ...TEMAS.map(t => `**${tarjetas.filter(x => x.tema === t.id).length}**`), `**${tarjetas.length}**`],
  ]);
  const md = `# Aprobación del banco de 2023

## Cómo se ha aprobado

- **Aprobación global y conjunta.** Dos personas del equipo revisaron juntas todas las tarjetas de test y todo el glosario, y los aprobaron en bloque el ${fechaLarga}. No hay marcas individuales: no se rellenaron los CSV de revisión (REVISION-r1/r2 ni GLOSARIO-r1/r2) ni se firmó con nombre.
- **Apoyo de revisiones automáticas.** La aprobación se apoya en las revisiones hechas con agentes, que están en datos/banco/ia/:
  - prueba de adivinar con 9 perfiles (PRUEBA-AGENTES.md);
  - revisión de neutralidad y fidelidad (REVISION-IA.md);
  - tercera revisión (REVISION-FINAL.md);
  - revisor de criterios (REVISION-CRITERIOS.md);
  - auditorías de concreción del PP (AUDITORIA-PP.md) y de PNV y CC (AUDITORIA-PNV-CC.md).

  Estas revisiones orientan, pero no sustituyen a la revisión humana.
- **Pendiente.** La prueba de adivinar con personas (PRUEBA-ADIVINAR.md, con 10 a 20 personas) queda pendiente y se hará después de publicar.
- **Qué pasa al banco aprobado.** Solo las tarjetas de test. Las ${banco.tarjetas.length - tests.length} reservas se quedan en el borrador (datos/banco/banco-2023.json). Cada término del glosario enlaza solo a las tarjetas de test que lo contienen.

Archivo escrito: \`${relative(RAIZ, SALIDA)}\`, con \`"aprobacion": { "modo": "global", "revisores": 2, "fecha": "${fecha}" }\`.

## Qué se aprueba

- **${tarjetas.length} tarjetas** de ${partidos.length} partidos en ${TEMAS.length} temas.
- **${glosario.length} términos del glosario**, de ${terminos.length}.

### Tarjetas por partido y tema

${porPartidoTema}

Coalición Canaria no tiene tarjeta de vivienda ni de impuestos: en vivienda no tiene propuesta y en impuestos su única propuesta no se podía neutralizar.

### Términos del glosario por tema

Un término cuenta en un tema si aparece en alguna tarjeta de ese tema.

${tabla(['Tema', 'Términos'], TEMAS.map(t => [t.nombre, glosario.filter(g => g.tarjetas.some(id => tarjetas.find(x => x.id === id).tema === t.id)).length]))}

### Términos que no pasan al banco aprobado

${fuera.length ? `Solo aparecen en tarjetas de reserva (${fuera.length}):\n\n${fuera.map(g => `- ${g.termino}`).join('\n')}` : 'Ninguno.'}

## Validación

${comprobaciones.map(c => `- OK: ${c}.`).join('\n')}
`;
  await mkdir(dirname(INFORME), { recursive: true });
  await writeFile(INFORME, md);
  console.log(`\nAprobadas: ${tarjetas.length} tarjetas de test · glosario: ${glosario.length} de ${terminos.length} términos · fuera del glosario aprobado: ${fuera.length}`);
  if (fuera.length) console.log(`  Solo en reservas: ${fuera.map(g => g.id).join(', ')}`);
  console.log(`Escrito ${relative(RAIZ, SALIDA)}\nEscrito ${relative(RAIZ, INFORME)}`);
}

async function main() {
  if (process.argv.includes('--global')) return aprobarGlobal();
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
