// Genera el borrador del banco y los archivos de revisión a partir de la selección.
//
//   node scripts/banco/generar.mjs
//
// Lee datos/banco/seleccion.json (ejes, tarjetas elegidas con su texto neutro, descartes, registro de
// autorrevisión y dudas, escrito a mano), datos/banco/versiones.json, el texto extraído y las candidatas.
// Cada tarjeta de la selección apunta a su candidata («pp-vivienda#2») y toma de ella la cita y la página;
// solo lleva «cita» y «pagina» propias cuando se completó a mano una cita que pasa a la página siguiente
// o se tomó solo la parte de la frase que contiene la propuesta. Una tarjeta = un partido = una cita.
// Si la cita junta varias medidas, la tarjeta recoge la principal y lo explica en «omitido»
// ({ nota, cifras }); las cifras de lo omitido son las únicas que pueden faltar en el texto.
// Comprueba cada tarjeta y, si no hay errores, escribe en datos/banco/:
//   banco-2023.json, REVISION-r1.csv, REVISION-r2.csv, PRUEBA-ADIVINAR.md,
//   PRUEBA-ADIVINAR-solucion.md, PRUEBA-ADIVINAR-respuestas.csv, GLOSARIO-r1.csv, GLOSARIO-r2.csv e INFORME.md,
// y rellena en datos/banco/glosario-2023.json las tarjetas en que aparece cada término.

import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  BANCO, TEXTOS, CANDIDATAS, PARTIDOS, ESTATALES, NOMBRE_PARTIDO, TEMAS,
  leerJson, escribirJson, versiones, palabras, aCsv, ordenPrueba,
} from './comun.mjs';
import { verificarCita, textoDocumento } from './verificar.mjs';

const MIN_PALABRAS = 15;
const MAX_PALABRAS = 40;
const MAX_FRASE = 25;
const MAX_DIFERENCIA = 10;
const MAX_DEFINICION = 30;
// Verbos de compromiso blando, para la tabla de equilibrio por partido.
const BLANDOS = ['Estudiar', 'Impulsar', 'Promover', 'Pedir', 'Defender', 'Abogar', 'Potenciar', 'Exigir', 'Avanzar hacia', 'Volver a plantear', 'Revisar'];
// Cifra o plazo: un número, o una expresión de tiempo.
const CIFRA_O_PLAZO = /\d|\b(inmediat\w*|cada año|a medio plazo|próximos años|primer año|temporal\w*)\b/iu;
const PERSONAS_PLANTILLA = 20;
// Partidos cuyo programa no está en castellano: sus citas llevan traducción propia.
const OTRO_IDIOMA = { erc: 'catalán', junts: 'catalán', bng: 'gallego' };

// Verbos de marco: la tarjeta empieza por el verbo de la medida, no por «proponer» o «tener como objetivo».
// Los compromisos blandos de la cita («estudiar», «impulsar», «pedir al Gobierno») sí se conservan.
const MARCO = ['Proponer', 'Tener como objetivo', 'Apostar por', 'Abogar por', 'Plantear'];
// Lo que nunca puede aparecer en un texto neutro: partidos, líderes y territorio propio.
const PROHIBIDAS = [
  'PP', 'Partido Popular', 'PSOE', 'socialista', 'Vox', 'Sumar', 'ERC', 'Esquerra', 'Junts', 'PNV', 'EAJ', 'Bildu', 'BNG', 'Coalición Canaria',
  'Feijóo', 'Sánchez', 'Abascal', 'Yolanda Díaz', 'Rufián', 'Puigdemont', 'Nogueras', 'Aitor Esteban', 'Aizpurua', 'Néstor Rego', 'Pontón', 'Oramas', 'Valido',
  'Galicia', 'Galiza', 'gallego', 'gallega', 'Euskal Herria', 'Euskadi', 'País Vasco', 'vasco', 'vasca', 'Cataluña', 'Catalunya', 'catalán', 'catalana', 'Països Catalans',
  'Canarias', 'canario', 'canaria', 'Navarra',
];
// Palabras que suelen valorar o sonar a un bloque: avisan para revisarlas a mano.
const VALORATIVAS = [
  'justo', 'justa', 'injusto', 'injusta', 'abusivo', 'abusiva', 'por fin', 'histórico', 'histórica', 'valiente', 'radical', 'sectario', 'ideológico',
  'okupa', 'okupación', 'ilegales', 'chiringuito', 'derroche', 'expolio', 'blindar', 'todos y todas', 'recortes', 'progresista', 'patriota', 'invasión',
  'efecto llamada', 'mafias', 'dignidad', 'digno', 'digna', 'privilegios', 'casta', 'libertad', 'robo', 'saqueo', 'infierno fiscal', 'voracidad',
];

const sinTildes = (t) => t.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const contiene = (texto, termino) => new RegExp(`(^|[^\\p{L}])${sinTildes(termino).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\p{L}]|$)`, 'u').test(sinTildes(texto));
const cifras = (t) => (t.match(/\d+(?:[.,]\d+)*/g) || []).map(n => n.replace(/[.,](?=\d{3}\b)/g, ''));
const frases = (t) => t.split(/(?<=[.!?;:])\s+/).filter(f => f.trim());
const siglas = (t) => [...new Set(t.match(/\b[A-ZÁÉÍÓÚÑ]{2,}\b/g) || [])];

const cacheCandidatas = new Map();
async function candidata(ref) {
  const [archivo, indice] = ref.split('#');
  if (!cacheCandidatas.has(archivo)) cacheCandidatas.set(archivo, await leerJson(join(CANDIDATAS, `${archivo}.json`)));
  const c = cacheCandidatas.get(archivo)[Number(indice)];
  if (!c) throw new Error(`No existe la candidata ${ref}`);
  return { ...c, partido: archivo.split('-')[0] };
}

function idTarjeta(t) {
  return `t2023-${t.tema}-${t.partidos.join('-')}-${t.uso === 'test' ? 1 : 2}`;
}

async function main() {
  const sel = await leerJson(join(BANCO, 'seleccion.json'));
  const docs = await versiones();
  const docPorPartido = Object.fromEntries(docs.map(d => [d.partido, d]));
  const temaPorId = Object.fromEntries(TEMAS.map(t => [t.id, t]));
  const errores = [];
  const avisos = [];
  const ok = [];

  // ───── Tarjetas ─────
  const tarjetas = [];
  const docUrl = (documento) => docs.find(d => d.id === documento).version.url;
  for (const s of sel.tarjetas) {
    const documento = s.documento || `2023-${s.partidos[0]}`;
    const c = s.candidata ? await candidata(s.candidata) : {};
    s.cita = (s.cita ?? c.cita ?? '').replace(/\s+/g, ' ').trim();
    s.pagina = s.pagina ?? c.pagina;
    const t = {
      id: idTarjeta(s),
      uso: s.uso,
      tema: s.tema,
      fueraDeEje: !!s.fueraDeEje,
      partidos: s.partidos,
      texto: s.texto,
      cita: s.cita,
      traduccion: s.traduccion ?? null,
      documento,
      pagina: s.pagina,
      enlace: `${docUrl(documento)}#page=${s.pagina}`,
      verificacion: verificarCita(await textoDocumento(documento), s.cita, s.pagina),
      ...(s.omitido ? { omitido: s.omitido } : {}),
      revision: { estado: 'borrador', revisor1: null, revisor2: null, notas: '' },
    };
    tarjetas.push(t);
  }
  const orden = (t) => [TEMAS.findIndex(x => x.id === t.tema), PARTIDOS.indexOf(t.partidos[0]), t.uso === 'test' ? 0 : 1];
  tarjetas.sort((a, b) => {
    const [x, y] = [orden(a), orden(b)];
    return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
  });

  // ───── Comprobaciones ─────
  const ids = new Set();
  for (const t of tarjetas) {
    const donde = t.id;
    if (ids.has(t.id)) errores.push(`${donde}: id repetido`);
    ids.add(t.id);
    if (!temaPorId[t.tema]) errores.push(`${donde}: tema desconocido`);
    if (t.verificacion === 'no-encontrada') errores.push(`${donde}: la cita no está en la página ${t.pagina}`);
    if (t.partidos.length !== 1) errores.push(`${donde}: ${t.partidos.length} partidos (una tarjeta = un partido = una cita)`);
    for (const m of MARCO) if (t.texto.startsWith(`${m} `)) errores.push(`${donde}: empieza por un verbo de marco («${m}»)`);
    if (t.omitido && !t.omitido.nota) errores.push(`${donde}: «omitido» sin nota`);
    const n = palabras(t.texto);
    if (n < MIN_PALABRAS || n > MAX_PALABRAS) errores.push(`${donde}: ${n} palabras (de ${MIN_PALABRAS} a ${MAX_PALABRAS})`);
    for (const f of frases(t.texto)) if (palabras(f) > MAX_FRASE) errores.push(`${donde}: frase de ${palabras(f)} palabras (máximo ${MAX_FRASE}): «${f.slice(0, 60)}…»`);
    const enTexto = new Set(cifras(t.texto));
    const omitidas = new Set(t.omitido?.cifras || []);
    const faltan = cifras(t.cita).filter(c => !enTexto.has(c) && !omitidas.has(c));
    for (const c of omitidas) if (!cifras(t.cita).includes(c)) errores.push(`${donde}: la cifra omitida ${c} no está en la cita`);
    if (faltan.length) errores.push(`${donde}: cifras de la cita que no están en el texto: ${faltan.join(', ')}`);
    for (const p of PROHIBIDAS) if (contiene(t.texto, p)) errores.push(`${donde}: el texto nombra «${p}»`);
    for (const v of VALORATIVAS) if (contiene(t.texto, v)) avisos.push(`${donde}: revisar «${v}»`);
    for (const s of siglas(t.texto)) {
      const i = t.texto.indexOf(s);
      if (!(t.texto[i - 1] === '(' && t.texto[i + s.length] === ')')) errores.push(`${donde}: la sigla ${s} no se explica la primera vez («nombre (${s})»)`);
    }
    const idioma = OTRO_IDIOMA[t.partidos[0]];
    const enCastellano = sel.citasEnCastellano?.includes(t.id);
    if (idioma && !enCastellano && !t.traduccion) errores.push(`${donde}: cita en ${idioma} sin traducción`);
    if (!idioma && t.traduccion) avisos.push(`${donde}: tiene traducción y la cita debería estar en castellano`);
  }

  // Una tarjeta de test y una de reserva por partido y tema, salvo «sin propuesta».
  const sinPropuesta = sel.sinPropuesta || [];
  for (const tema of TEMAS) {
    for (const p of PARTIDOS) {
      const suyas = tarjetas.filter(t => t.tema === tema.id && t.partidos.includes(p));
      const sin = sinPropuesta.find(x => x.partido === p && x.tema === tema.id);
      const test = suyas.filter(t => t.uso === 'test').length;
      const reserva = suyas.filter(t => t.uso === 'reserva').length;
      if (sin && suyas.length) errores.push(`${p} · ${tema.id}: marcado sin propuesta pero tiene tarjetas`);
      if (!sin && test !== 1) errores.push(`${p} · ${tema.id}: ${test} tarjetas de test (debe haber 1)`);
      if (!sin && reserva > 1) errores.push(`${p} · ${tema.id}: ${reserva} reservas`);
      if (!sin && reserva === 0 && !(sel.sinReserva || []).some(x => x.partido === p && x.tema === tema.id)) errores.push(`${p} · ${tema.id}: sin reserva y sin explicar en sinReserva`);
    }
    // Equilibrio de longitudes entre las tarjetas de test del tema.
    const longitudes = tarjetas.filter(t => t.tema === tema.id && t.uso === 'test').map(t => palabras(t.texto));
    const dif = Math.max(...longitudes) - Math.min(...longitudes);
    if (dif > MAX_DIFERENCIA) errores.push(`${tema.id}: ${dif} palabras de diferencia entre la tarjeta de test más larga y la más corta (máximo ${MAX_DIFERENCIA})`);
    else ok.push(`${tema.id}: longitudes de test entre ${Math.min(...longitudes)} y ${Math.max(...longitudes)} palabras (diferencia ${dif})`);
  }
  for (const tema of TEMAS) if (!sel.ejes?.[tema.id]?.eje) errores.push(`${tema.id}: falta el eje`);

  // Glosario: cada variante aparece tal cual en al menos un texto; definiciones cortas.
  const RUTA_GLOSARIO = join(BANCO, 'glosario-2023.json');
  const glosario = await leerJson(RUTA_GLOSARIO);
  const idsGlosario = new Set();
  for (const g of glosario) {
    if (idsGlosario.has(g.id)) errores.push(`glosario: id repetido ${g.id}`);
    idsGlosario.add(g.id);
    if (!/^[a-z0-9-]+$/.test(g.id)) errores.push(`glosario ${g.id}: el id solo puede tener minúsculas, cifras y guiones`);
    for (const v of g.variantes) if (!tarjetas.some(t => t.texto.includes(v))) errores.push(`glosario ${g.id}: la variante «${v}» no aparece en ningún texto`);
    if (palabras(g.definicion) > MAX_DEFINICION) errores.push(`glosario ${g.id}: definición de ${palabras(g.definicion)} palabras (máximo ${MAX_DEFINICION})`);
    // En una definición, los dos puntos no cortan la frase: solo el punto.
    if (g.definicion.split(/(?<=[.!?])\s+/).filter(f => f.trim()).length > 2) errores.push(`glosario ${g.id}: la definición tiene más de 2 frases`);
    for (const p of PROHIBIDAS) if (contiene(g.definicion, p)) errores.push(`glosario ${g.id}: la definición nombra «${p}»`);
    for (const v of VALORATIVAS) if (contiene(g.definicion, v)) avisos.push(`glosario ${g.id}: revisar «${v}»`);
    // «excluir»: tarjetas donde una variante aparece con otro sentido (por ejemplo, «salario medio europeo»).
    for (const id of g.excluir || []) if (!tarjetas.some(t => t.id === id)) errores.push(`glosario ${g.id}: la tarjeta excluida ${id} no existe`);
    g.tarjetas = tarjetas.filter(t => !(g.excluir || []).includes(t.id) && g.variantes.some(v => t.texto.includes(v))).map(t => t.id);
    if (!g.tarjetas.length) errores.push(`glosario ${g.id}: no se enlaza con ninguna tarjeta`);
  }

  // Equilibrio por partido, sobre las tarjetas de test.
  const equilibrio = PARTIDOS.map(p => {
    const suyas = tarjetas.filter(t => t.uso === 'test' && t.partidos[0] === p);
    const n = suyas.map(t => palabras(t.texto));
    return {
      partido: p, tarjetas: suyas.length,
      media: suyas.length ? n.reduce((a, b) => a + b, 0) / suyas.length : 0,
      cifra: suyas.filter(t => CIFRA_O_PLAZO.test(t.texto)).length,
      blando: suyas.filter(t => BLANDOS.some(v => t.texto.startsWith(`${v} `))).length,
      fuera: suyas.filter(t => t.fueraDeEje).length,
    };
  });
  for (const d of docs) if (!sel.titulos?.[d.id]) errores.push(`${d.id}: falta el título de portada`);

  const cuenta = (v) => tarjetas.filter(t => t.verificacion === v).length;
  console.log('Comprobaciones de generar.mjs');
  console.log(`  ${tarjetas.length} tarjetas · ${cuenta('exacta')} citas exactas · ${cuenta('normalizada')} normalizadas · ${cuenta('no-encontrada')} no encontradas`);
  console.log(`  Palabras por texto: de ${Math.min(...tarjetas.map(t => palabras(t.texto)))} a ${Math.max(...tarjetas.map(t => palabras(t.texto)))}`);
  for (const o of ok) console.log(`  OK ${o}`);
  console.log(`  Glosario: ${glosario.length} términos, todas las variantes aparecen en algún texto`);
  console.log('\n  Equilibrio por partido (tarjetas de test)');
  console.log('  Partido      Tarjetas  Media palabras  Con cifra o plazo  Verbo blando  Fuera de eje');
  for (const e of equilibrio) console.log(`  ${NOMBRE_PARTIDO[e.partido].padEnd(13)}${String(e.tarjetas).padStart(8)}${e.media.toFixed(1).padStart(16)}${String(e.cifra).padStart(19)}${String(e.blando).padStart(14)}${String(e.fuera).padStart(14)}`);
  if (avisos.length) console.log(`\nAVISOS (revisados a mano; ver registro de autorrevisión):\n${avisos.map(a => `  · ${a}`).join('\n')}`);
  if (errores.length) {
    console.error(`\nERRORES:\n${errores.map(e => `  · ${e}`).join('\n')}`);
    process.exit(1);
  }
  console.log('  Sin errores: textos de 15 a 40 palabras, sin verbos de marco, un partido y una cita por tarjeta, frases de 25 o menos, cifras conservadas (salvo las omitidas con nota), siglas explicadas, sin partidos, líderes ni territorio propio, traducciones presentes, una tarjeta de test por partido y tema.');

  // ───── banco-2023.json ─────
  const temas = TEMAS.map(t => ({ id: t.id, nombre: t.nombre, eje: sel.ejes[t.id].eje, orden: t.orden, corto: t.corto }));
  const documentos = docs.map(d => ({ id: d.id, partido: d.partido, titulo: sel.titulos[d.id], url: d.version.url, paginas: d.version.paginas, sha256: d.version.sha256 }));
  const banco = { anio: 2023, generado: new Date().toISOString(), temas, documentos, tarjetas };
  await escribirJson(join(BANCO, 'banco-2023.json'), banco);

  // ───── Revisión: dos archivos idénticos y sin marcas ─────
  const columnas = ['id', 'uso', 'partido', 'tema', 'eje', 'cita', 'traduccion', 'enlace', 'texto', 'fiel', 'neutral', 'delata', 'notas'];
  const filas = tarjetas.map(t => ({
    id: t.id, uso: t.uso, partido: t.partidos[0], tema: t.tema, eje: t.fueraDeEje ? `${sel.ejes[t.tema].eje} (fuera de eje)` : sel.ejes[t.tema].eje,
    cita: t.cita, traduccion: t.traduccion || '', enlace: t.enlace,
    texto: t.texto, fiel: '', neutral: '', delata: '', notas: '',
  }));
  for (const r of ['r1', 'r2']) await writeFile(join(BANCO, `REVISION-${r}.csv`), aCsv(columnas, filas));

  // ───── Glosario: tarjetas en que aparece cada término y CSV de revisión ─────
  await escribirJson(RUTA_GLOSARIO, glosario);
  const colsGlosario = ['id', 'termino', 'variantes', 'definicion', 'correcta', 'neutral', 'clara', 'notas'];
  const filasGlosario = glosario.map(g => ({ id: g.id, termino: g.termino, variantes: g.variantes.join(' | '), definicion: g.definicion, correcta: '', neutral: '', clara: '', notas: '' }));
  for (const r of ['r1', 'r2']) await writeFile(join(BANCO, `GLOSARIO-${r}.csv`), aCsv(colsGlosario, filasGlosario));

  // ───── Prueba de adivinar ─────
  const prueba = ordenPrueba(banco);
  await writeFile(join(BANCO, 'PRUEBA-ADIVINAR.md'), `# ¿De quién es esta propuesta?

Cada texto es una propuesta real de un programa electoral de 2023. Escribe al lado de qué partido crees que es: **PP, PSOE, Vox o Sumar**.
Si no lo sabes, escribe «no sé». No busques nada: cuenta tu primera impresión.

${prueba.map(({ numero, tarjeta }) => `**T${numero}.** ${tarjeta.texto}\n\nPartido: ________________`).join('\n\n---\n\n')}
`);
  await writeFile(join(BANCO, 'PRUEBA-ADIVINAR-solucion.md'), `# Prueba de adivinar · solución

No la enseñes a quien hace la prueba. El orden se recalcula siempre igual desde banco-2023.json (semilla fija).

| Texto | Partido | Tema | Tarjeta |
| --- | --- | --- | --- |
${prueba.map(({ numero, tarjeta }) => `| T${numero} | ${tarjeta.partidos.map(p => NOMBRE_PARTIDO[p]).join(' y ')} | ${temaPorId[tarjeta.tema].nombre} | ${tarjeta.id} |`).join('\n')}

Para corregir: rellena PRUEBA-ADIVINAR-respuestas.csv y ejecuta \`node scripts/banco/corregir-prueba.mjs\`. Si más de la mitad de las personas acierta un texto, se reescribe.
`);
  const colsRespuestas = ['persona', ...prueba.map(p => `T${p.numero}`)];
  await writeFile(join(BANCO, 'PRUEBA-ADIVINAR-respuestas.csv'), aCsv(colsRespuestas,
    Array.from({ length: PERSONAS_PLANTILLA }, (_, i) => ({ persona: `Persona ${i + 1}` }))));

  // ───── Informe ─────
  await writeFile(join(BANCO, 'INFORME.md'), await informe({ sel, docs, docPorPartido, tarjetas, prueba, avisos, glosario, equilibrio }));
  console.log('\nEscritos en datos/banco/: banco-2023.json, REVISION-r1.csv, REVISION-r2.csv, GLOSARIO-r1.csv, GLOSARIO-r2.csv, glosario-2023.json (tarjetas), PRUEBA-ADIVINAR.md, PRUEBA-ADIVINAR-solucion.md, PRUEBA-ADIVINAR-respuestas.csv, INFORME.md');
}

async function informe({ sel, docs, tarjetas, prueba, glosario, equilibrio }) {
  const temaPorId = Object.fromEntries(TEMAS.map(t => [t.id, t]));
  const nombre = (p) => NOMBRE_PARTIDO[p];
  const lista = (xs) => xs.length ? xs.map(x => `- ${x}`).join('\n') : '- Ninguno.';
  const tabla = (cab, filas) => `| ${cab.join(' | ')} |\n| ${cab.map(() => '---').join(' | ')} |\n${filas.map(f => `| ${f.join(' | ')} |`).join('\n')}`;
  const celdaMd = (t) => String(t ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

  // Cobertura
  const estado = (p, tema) => {
    const sin = (sel.sinPropuesta || []).find(x => x.partido === p && x.tema === tema);
    if (sin) return sin.etiqueta || 'sin propuesta';
    const suyas = tarjetas.filter(t => t.tema === tema && t.partidos.includes(p));
    const test = suyas.find(t => t.uso === 'test');
    const partes = [`test${test.fueraDeEje ? ' (fuera de eje)' : ''}`];
    const res = suyas.find(t => t.uso === 'reserva');
    partes.push(res ? `reserva${res.fueraDeEje ? ' (fuera de eje)' : ''}` : 'sin reserva');
    return partes.join(' + ');
  };
  const nTest = tarjetas.filter(t => t.uso === 'test').length;
  const nRes = tarjetas.filter(t => t.uso === 'reserva').length;
  const fuera = tarjetas.filter(t => t.fueraDeEje);
  const sinProp = sel.sinPropuesta || [];
  const celdasPosibles = PARTIDOS.length * TEMAS.length;
  const cubiertas = celdasPosibles - sinProp.length;

  // Verificación de candidatas
  const archivos = (await readdir(CANDIDATAS)).filter(a => a.endsWith('.json'));
  let cand = { exacta: 0, normalizada: 0, 'no-encontrada': 0, total: 0 };
  for (const a of archivos) for (const c of await leerJson(join(CANDIDATAS, a))) { cand.total++; cand[c.verificacion || 'no-encontrada']++; }
  const sinTexto = await leerJson(join(TEXTOS, 'sin-texto.json'));

  const ejeCubre = (tema) => ESTATALES.filter(p => tarjetas.some(t => t.tema === tema && t.uso === 'test' && t.partidos.includes(p) && !t.fueraDeEje));

  return `# Banco de tarjetas del test · programas de 2023

Generado el ${new Date().toISOString()} con \`node scripts/banco/generar.mjs\`. Borrador: nada de esto se publica hasta que lo aprueben dos revisores (\`scripts/banco/aprobar.mjs\`).

## 1. Resumen

- **${tarjetas.length} tarjetas**: ${nTest} de test y ${nRes} de reserva, para ${PARTIDOS.length} partidos y ${TEMAS.length} temas.
- **Cobertura**: ${cubiertas} de ${celdasPosibles} combinaciones de partido y tema tienen tarjeta. Sin propuesta: ${sinProp.map(x => `${nombre(x.partido)} en ${temaPorId[x.tema].nombre.toLowerCase()}${x.etiqueta ? ` (${x.etiqueta})` : ''}`).join(', ') || 'ninguna'}. Sin reserva: ${(sel.sinReserva || []).map(x => `${nombre(x.partido)} en ${temaPorId[x.tema].nombre.toLowerCase()}`).join(', ') || 'ninguna'}.
- **Ejes**: ${TEMAS.map(t => `${t.nombre.toLowerCase()} cubre ${ejeCubre(t.id).length} de 4 estatales`).join('; ')}.
- **Fuera de eje**: ${fuera.filter(t => t.uso === 'test').length} tarjetas de test y ${fuera.filter(t => t.uso === 'reserva').length} reservas (de reserva se elige a menudo otra cuestión del tema, para no repetir la de test).
- **Citas**: las ${tarjetas.length} están en su página (${tarjetas.filter(t => t.verificacion === 'exacta').length} exactas y ${tarjetas.filter(t => t.verificacion === 'normalizada').length} normalizadas).
- **Prueba de adivinar**: ${prueba.length} textos de PP, PSOE, Vox y Sumar.

**Problemas principales**
${lista(sel.problemas || [])}

**Decisiones tomadas**
${lista(sel.decididas || [])}

**Lo que necesito que decidas**
${lista(sel.decisiones || [])}

## 2. Versiones de los programas

Para cada programa se buscó en el índice CDX de Internet Archive una captura de mayo a julio de 2023 de su dirección original y se comparó su SHA-256 con el del archivo local. Las diez URL de captura, en forma \`id_\`, devuelven el PDF directamente (Content-Type ${[...new Set(docs.map(d => d.captura?.contentType))].join(', ')}); ninguna devuelve una página de Internet Archive.

${tabla(['Partido', 'SHA-256 local', 'Captura de Internet Archive', '¿Coinciden?', 'Páginas', 'Versión usada'],
    docs.map(d => [nombre(d.partido), `\`${d.local.sha256}\``, d.captura ? `${d.captura.fecha.slice(0, 10)} · [captura](${d.captura.url})` : '—', d.coincide ? 'sí' : 'no', d.version.paginas,
      d.verificacion === 'sin-captura-2023' ? 'local; **sin captura de 2023**' : d.verificacion === 'captura-2023-fuera-de-ventana' ? 'local; captura de 2023 fuera de mayo a julio' : 'local']))}

${(sel.notasVersiones || []).map(n => `- ${n}`).join('\n')}

## 3. Cobertura

${tabla(['Partido', ...TEMAS.map(t => t.nombre)], PARTIDOS.map(p => [nombre(p), ...TEMAS.map(t => estado(p, t.id))]))}

## 4. Ejes elegidos

${tabla(['Tema', 'Eje', 'Estatales en el eje', 'Por qué'], TEMAS.map(t => [t.nombre, sel.ejes[t.id].eje, `${ejeCubre(t.id).length} de 4 (${ejeCubre(t.id).map(nombre).join(', ') || 'ninguno'})`, celdaMd(sel.ejes[t.id].motivo)]))}

### Tarjetas fuera de eje

${tabla(['Tarjeta', 'Uso', 'Por qué'], fuera.map(t => [t.id, t.uso, celdaMd((sel.motivosFueraDeEje || {})[t.id] || 'El partido no tiene propuesta sobre el eje en este tema; se usa su propuesta más cercana.')]))}

## 5. Comparativa por tema (tarjetas de test de los cuatro estatales)

${TEMAS.map(t => `### ${t.nombre}\n\nEje: ${sel.ejes[t.id].eje}\n\n${ESTATALES.map(p => {
    const c = tarjetas.find(x => x.tema === t.id && x.uso === 'test' && x.partidos.includes(p));
    return c ? `- **${nombre(p)}** (${palabras(c.texto)} palabras${c.fueraDeEje ? ', fuera de eje' : ''}): ${c.texto}` : `- **${nombre(p)}**: sin propuesta`;
  }).join('\n')}`).join('\n\n')}

## 6. Autorrevisión

Segunda pasada completa, tarjeta por tarjeta: fidelidad, neutralidad, lenguaje cargado, legibilidad, lectura a ciegas y equilibrio dentro de cada tema.

${sel.resumenAutorrevision || ''}

### Regla de territorio

- Nombrar un territorio concreto (por ejemplo, La Palma, Cataluña o Euskadi) delata al partido: se neutraliza o, si neutralizarlo cambia el sentido, se usa la reserva.
- Una referencia genérica a «la comunidad autónoma» o a lo «autonómico» se permite, porque es inherente a los partidos de ámbito autonómico. Por eso se mantienen las tarjetas de test de Junts y de CC en sanidad.

### Segunda pasada de redacción

Reglas de esta pasada: de 15 a 40 palabras sin relleno; solo la medida, sin las justificaciones del partido; una medida por tarjeta; sin casos concretos que identifiquen la sensibilidad del partido; empezar por el verbo de la medida, sin verbos de marco (se conservan los compromisos blandos de la cita, como «impulsar», «defender» o «pedir al Gobierno»). Siguen las reglas de antes. Se cambiaron ${(sel.pasada2 || []).length} tarjetas y se retiraron ${(sel.pasada2Retiradas || []).length}.

${tabla(['Tarjeta', 'Antes', 'Después', 'Motivo'], [...(sel.pasada2 || []).map(r => {
    const despues = r.despues ?? tarjetas.find(x => x.id === r.id).texto;
    return [r.id, celdaMd(r.antes), `${celdaMd(despues)} (${palabras(despues)} palabras)`, celdaMd(`${r.motivo}${r.nuevaCita ? ' (cita nueva)' : ''}`)];
  }), ...(sel.pasada2Retiradas || []).map(r => [r.id, celdaMd(r.antes), '(retirada)', celdaMd(r.motivo)])])}

### Tercera pasada: comprobaciones con agentes

Cambios decididos por el responsable del proyecto a partir de datos/banco/ia/PRUEBA-AGENTES.md y REVISION-IA.md. Se cambiaron ${(sel.pasada3 || []).length} tarjetas.

${(sel.pasada3 || []).length ? tabla(['Tarjeta', 'Antes', 'Después', 'Motivo'], sel.pasada3.map(r => {
    const despues = r.despues ?? tarjetas.find(x => x.id === r.id).texto;
    return [r.id, celdaMd(r.antes), `${celdaMd(despues)} (${palabras(despues)} palabras)`, celdaMd(r.motivo)];
  })) : 'Sin cambios.'}

### Cuarta pasada: revisión final con agentes

Cambios decididos por el responsable del proyecto a partir de datos/banco/ia/REVISION-FINAL.md. Se cambiaron ${(sel.pasada4 || []).length} tarjetas; en dos temas la reserva pasa a test.

${(sel.pasada4 || []).length ? tabla(['Tarjeta', 'Antes', 'Después', 'Motivo'], sel.pasada4.map(r => {
    const despues = r.despues ?? tarjetas.find(x => x.id === r.id).texto;
    return [r.id, celdaMd(r.antes), `${celdaMd(despues)} (${palabras(despues)} palabras)`, celdaMd(`${r.intercambio ? '(Intercambio de test y reserva.) ' : ''}${r.motivo}`)];
  })) : 'Sin cambios.'}

### Equilibrio por partido (tarjetas de test)

«Con cifra o plazo»: el texto lleva un número o una expresión de tiempo. «Verbo blando»: empieza por ${BLANDOS.map(v => v.toLowerCase()).join(', ')}. «Obtener» no cuenta como blando.

${tabla(['Partido', 'Tarjetas', 'Media de palabras', 'Con cifra o plazo', 'Verbo blando', 'Fuera de eje'], equilibrio.map(e => [nombre(e.partido), e.tarjetas, e.media.toFixed(1), e.cifra, e.blando, e.fuera]))}

### Partes omitidas (una medida por tarjeta)

${tabla(['Tarjeta', 'Qué se omite y por qué', 'Cifras de la cita que no están en el texto'], tarjetas.filter(t => t.omitido).map(t => [t.id, celdaMd(t.omitido.nota), (t.omitido.cifras || []).join(', ') || '—']))}

### Registro de cambios de la primera autorrevisión

${(sel.autorrevision || []).length ? tabla(['Tarjeta', 'Qué fallaba', 'Cómo queda'], sel.autorrevision.map(r => [r.id, celdaMd(r.fallaba), celdaMd(r.queda)])) : 'Sin cambios.'}

### Sustituciones de lenguaje cargado

${(sel.sustituciones || []).length ? tabla(['Tarjeta', 'Término original', 'Término usado', 'Motivo'], sel.sustituciones.map(r => [r.id, celdaMd(r.original), celdaMd(r.usado), celdaMd(r.motivo)])) : 'Ninguna.'}

### Tarjetas vagas porque el programa es vago

${(sel.vagas || []).length ? tabla(['Tarjeta', 'Nota'], sel.vagas.map(r => [r.id, celdaMd(r.nota)])) : 'Ninguna.'}

### Glosario

${glosario.length} términos en datos/banco/glosario-2023.json. Se muestran al tocar el término en el test; no cambian ningún texto. Los revisan dos personas con GLOSARIO-r1.csv y GLOSARIO-r2.csv.

${tabla(['Término', 'Variantes', 'Definición', 'Tarjetas'], glosario.map(g => [celdaMd(g.termino), celdaMd(g.variantes.join(' · ')), celdaMd(g.definicion), g.tarjetas.length]))}

## 7. Verificación de citas

- **Candidatas** (paso 2, ${archivos.length} archivos): ${cand.total} citas · ${cand.exacta} exactas · ${cand.normalizada} normalizadas · ${cand['no-encontrada']} no encontradas.
- **Tarjetas**: ${tarjetas.length} citas · ${tarjetas.filter(t => t.verificacion === 'exacta').length} exactas · ${tarjetas.filter(t => t.verificacion === 'normalizada').length} normalizadas · 0 no encontradas.
- **Corregidas**: ${sel.verificacion?.corregidas ?? 0}. **Descartadas** por no poder verificarse: ${sel.verificacion?.descartadas ?? 0} (detalle abajo).
- «Exacta» significa que la cita está tal cual en el texto de la página; solo pueden cambiar espacios y saltos de línea, que en el texto extraído son disposición y no caracteres del programa. «Normalizada» significa que, además, hubo que unificar guiones de fin de línea, comillas tipográficas o ligaduras.
${sel.verificacion?.nota ? `- ${sel.verificacion.nota}` : ''}

## 8. Páginas sin texto, descartes y documentos breves

### Páginas sin texto (probablemente imágenes; sin OCR)

${tabla(['Documento', 'Páginas'], Object.entries(sinTexto).map(([d, ps]) => [d, ps.length ? ps.join(', ') : 'ninguna']))}

### Partidos sin propuesta en algún tema

${tabla(['Partido', 'Tema', 'Motivo'], sinProp.map(x => [nombre(x.partido), temaPorId[x.tema].nombre, celdaMd(x.motivo)]))}

${(sel.sinReserva || []).length ? `### Sin reserva\n\n${tabla(['Partido', 'Tema', 'Motivo'], sel.sinReserva.map(x => [nombre(x.partido), temaPorId[x.tema].nombre, celdaMd(x.motivo)]))}\n` : ''}
### Descartes

${(sel.descartes || []).length ? tabla(['Partido', 'Tema', 'Página', 'Propuesta', 'Motivo'], sel.descartes.map(x => [nombre(x.partido), temaPorId[x.tema].nombre, x.pagina ?? '', celdaMd(x.resumen), celdaMd(x.motivo)])) : 'Ninguno.'}

### Documentos breves

${Object.entries(sel.documentosBreves || {}).map(([d, n]) => `- **${d}**: ${n}`).join('\n')}

## 9. Dudas abiertas y riesgos (de más a menos importante)

${(sel.dudas || []).map((d, i) => `${i + 1}. ${d}`).join('\n')}
`;
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
