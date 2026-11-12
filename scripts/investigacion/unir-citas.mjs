// Une las citas extraídas por tramos (_trabajo/citas/<fuente>/*.json) en un archivo por partido,
// datos/investigacion-2026/citas/<partido>.json, que es el dato de referencia.
//
//   node scripts/investigacion/unir-citas.mjs            todos los partidos que tengan citas de trabajo
//   node scripts/investigacion/unir-citas.mjs pp bng     solo esos
//
// Pensado para repetirse cada vez que cambia un documento:
// - Cada cita tiene un identificador estable, calculado con el partido y el texto de la cita. Si el
//   documento se vuelve a extraer y la cita sigue igual, conserva su identificador y sus temas.
// - Nada se borra. Una cita de un documento que se ha vuelto a extraer y ya no aparece pasa a
//   "estado": "sustituida", con la fecha. Los documentos generados solo muestran las vigentes.
// - Las citas que no vienen de estos tramos (declaraciones, votos…) se conservan tal cual.
// - Cada cambio se anota en CAMBIOS.md.
// Antes de unir se vuelve a comprobar que cada cita está en su página; si alguna no está, no se escribe nada.

import { readFile, writeFile, readdir, mkdir, appendFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { DIR, TRABAJO, leerJson as leer, leerFuentes, paginasDe, verificar } from './comun.mjs';

const HOY = process.env.FECHA_HOY || new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });

const registro = await leerFuentes();
const fuentes = new Map(registro.map(f => [f.id, f]));
const ordenFuente = new Map(registro.map((f, i) => [f.id, i]));
const plano = t => t.replace(/\s+/g, ' ').trim();
const idDe = (partido, cita) => `c-${createHash('sha256').update(`${partido}|${plano(cita).normalize('NFC')}`).digest('hex').slice(0, 10)}`;

// --- Tramos de trabajo, agrupados por partido ---
const pedidos = process.argv.slice(2);
const porPartido = new Map();
const errores = [];
for (const carpeta of (await readdir(TRABAJO, { withFileTypes: true }).catch(() => [])).filter(e => e.isDirectory()).map(e => e.name).sort()) {
  const fuente = fuentes.get(carpeta);
  if (!fuente) { errores.push(`la carpeta «${carpeta}» no corresponde a ninguna fuente de fuentes.json`); continue; }
  if (pedidos.length && !pedidos.includes(fuente.partido)) continue;
  // Una edición sustituida por otra (cambiar-edicion.mjs) ya no se une: sus citas viven en la edición nueva.
  if (fuente.estado === 'sustituida') { console.log(`${carpeta}: edición sustituida por ${fuente.sustituida_por}; no se une.`); continue; }
  const paginas = await paginasDe(fuente.id);
  const tramos = [];
  for (const a of (await readdir(join(TRABAJO, carpeta))).filter(a => a.endsWith('.json')).sort()) {
    const t = await leer(join(TRABAJO, carpeta, a));
    if (t.fuente !== fuente.id) errores.push(`${carpeta}/${a}: dice ser de la fuente «${t.fuente}»`);
    tramos.push({ archivo: a, ...t });
  }
  // Los tramos tienen que cubrir el documento entero, sin huecos ni solapes.
  tramos.sort((x, y) => x.paginas[0] - y.paginas[0]);
  let esperada = 1;
  for (const t of tramos) {
    if (t.paginas[0] !== esperada) errores.push(`${carpeta}: se esperaba un tramo que empezara en la página ${esperada} y «${t.archivo}» empieza en la ${t.paginas[0]}`);
    esperada = t.paginas[1] + 1;
  }
  if (esperada - 1 !== fuente.paginas) errores.push(`${carpeta}: los tramos llegan a la página ${esperada - 1} y el documento tiene ${fuente.paginas}`);

  const citas = [];
  for (const t of tramos) for (const c of t.citas) {
    const verificacion = verificar(paginas, c.cita, c.pagina);
    if (verificacion === 'no-encontrada') errores.push(`${carpeta}/${t.archivo}: cita no encontrada en la página ${c.pagina}: «${c.cita.slice(0, 90)}…»`);
    citas.push({ ...c, verificacion });
  }
  if (!porPartido.has(fuente.partido)) porPartido.set(fuente.partido, []);
  porPartido.get(fuente.partido).push({ fuente, citas });
}
if (errores.length) { console.error(`No se une nada:\n${errores.map(e => `  · ${e}`).join('\n')}`); process.exit(1); }
if (!porPartido.size) { console.error('No hay citas de trabajo que unir.'); process.exit(1); }

// --- Un archivo por partido ---
await mkdir(join(DIR, 'citas'), { recursive: true });
const cambios = [];
for (const [partido, documentos] of porPartido) {
  // Primero el programa de estas elecciones; después los documentos parciales y los generales. Dentro de cada clase, el orden del registro.
  const rango = f => ({ programa: 0, documento_parcial: 1, programa_general: 2 }[f.clase] ?? 3);
  documentos.sort((a, b) => rango(a.fuente) - rango(b.fuente) || ordenFuente.get(a.fuente.id) - ordenFuente.get(b.fuente.id));
  const ruta = join(DIR, 'citas', `${partido}.json`);
  const anterior = await leer(ruta).catch(() => ({ citas: [] }));
  const antes = new Map(anterior.citas.map(c => [c.id, c]));
  const extraidas = new Set(documentos.map(d => d.fuente.id));

  const nuevas = new Map();
  for (const { fuente, citas } of documentos) {
    for (const c of citas) {
      const id = idDe(partido, c.cita);
      if (nuevas.has(id)) { (nuevas.get(id).tambien_en ??= []).push({ fuente: fuente.id, pagina: c.pagina }); continue; }
      const previa = antes.get(id);
      nuevas.set(id, {
        id, partido, tipo: 'programa', clase: c.clase, medida_concreta: c.medida_concreta,
        cita: plano(c.cita), ...(c.traduccion ? { traduccion: plano(c.traduccion) } : {}), idioma: fuente.idioma,
        fuente: fuente.id, pagina: c.pagina, numero: c.numero ?? null, apartado_original: c.apartado,
        nota: c.nota, etiquetas: c.etiquetas, temas: previa?.temas ?? [],
        // La cita es solo el nombre de una norma o un elemento de una lista: hay que mostrarla con el título de su apartado.
        ...(c.contexto ? { contexto: true } : {}),
        // Temas puestos a mano: los del tramo o, si la cita ya existía como declaración, los que tenía.
        ...((c.temas_manual ?? previa?.temas_manual ?? (previa && previa.tipo !== 'programa' ? previa.temas : null))?.length
          ? { temas_manual: c.temas_manual ?? previa?.temas_manual ?? previa.temas } : {}),
        fecha: fuente.publicado, quien: null, verificacion: c.verificacion, estado: 'vigente',
        recogida: previa?.recogida ?? HOY,
      });
    }
  }

  let sustituidas = 0;
  const conservadas = [];
  // Citas sueltas (declaraciones) sacadas de un documento que ahora se extrae entero: las sustituye la extracción.
  const urls = new Set(documentos.map(d => d.fuente.url.split('#')[0]));
  for (const c of anterior.citas) {
    if (nuevas.has(c.id)) continue;
    if (c.tipo !== 'programa' && c.estado === 'vigente' && c.url && urls.has(c.url.split('#')[0])) { conservadas.push({ ...c, estado: 'sustituida', sustituida_el: HOY, motivo: 'El documento se ha extraído entero como programa.' }); sustituidas++; continue; }
    if (c.tipo === 'programa' && c.estado === 'vigente' && extraidas.has(c.fuente)) { conservadas.push({ ...c, estado: 'sustituida', sustituida_el: HOY }); sustituidas++; }
    else conservadas.push(c);
  }
  const añadidas = [...nuevas.keys()].filter(id => !antes.has(id) || antes.get(id).estado !== 'vigente').length;
  const citas = [...nuevas.values(), ...conservadas];
  const vigentes = citas.filter(c => c.estado === 'vigente');
  const resumen = {
    vigentes: vigentes.length,
    medidas: vigentes.filter(c => c.clase === 'medida').length,
    medidas_concretas: vigentes.filter(c => c.medida_concreta).length,
    posiciones: vigentes.filter(c => c.clase === 'posicion').length,
    exactas: vigentes.filter(c => c.verificacion === 'exacta').length,
    normalizadas: vigentes.filter(c => c.verificacion === 'normalizada').length,
    sustituidas: citas.filter(c => c.estado === 'sustituida').length,
  };
  const cambia = añadidas || sustituidas;
  await writeFile(ruta, JSON.stringify({ partido, actualizado: cambia ? HOY : (anterior.actualizado ?? HOY), fuentes: [...new Set(citas.map(c => c.fuente))], resumen, citas }, null, 2) + '\n');
  console.log(`${partido}: ${resumen.vigentes} citas vigentes (${resumen.medidas} medidas, ${resumen.medidas_concretas} concretas; ${resumen.posiciones} posiciones) · +${añadidas} nuevas · ${sustituidas} sustituidas`);
  if (cambia) cambios.push(`- ${HOY} · ${partido} · ${[...extraidas].join(', ')}: ${añadidas} citas nuevas y ${sustituidas} sustituidas. Quedan ${resumen.vigentes} vigentes.`);
}

if (cambios.length) {
  const ruta = join(DIR, 'CAMBIOS.md');
  const existe = await readFile(ruta, 'utf8').catch(() => null);
  if (existe === null) await writeFile(ruta, '# Registro de cambios de la investigación de 2026\n\nLo escribe `scripts/investigacion/unir-citas.mjs` cada vez que cambian las citas de un partido. No se edita a mano.\n\n');
  await appendFile(ruta, cambios.join('\n') + '\n');
}
