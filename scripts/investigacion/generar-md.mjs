// Escribe un documento Markdown por partido, datos/investigacion-2026/partidos/<partido>.md, a partir
// de partidos.json, fuentes.json y citas/<partido>.json. Los Markdown no se editan a mano: se regeneran.
//
//   node scripts/investigacion/generar-md.mjs            todos los partidos con citas
//   node scripts/investigacion/generar-md.mjs pp bng     solo esos
//
// Solo salen las citas vigentes. Las sustituidas siguen en el JSON.

import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = join(RAIZ, 'datos', 'investigacion-2026');
const leer = async f => JSON.parse(await readFile(join(DIR, f), 'utf8'));

const mapa = await leer('partidos.json');
const fuentes = new Map((await leer('fuentes.json')).fuentes.map(f => [f.id, f]));
const temas = await leer('temas.json');
const pedidos = process.argv.slice(2);
const archivos = (await readdir(join(DIR, 'citas')).catch(() => [])).filter(a => a.endsWith('.json')).map(a => a.replace(/\.json$/, '')).filter(p => !pedidos.length || pedidos.includes(p)).sort();
if (!archivos.length) { console.error('No hay citas de ningún partido.'); process.exit(1); }

const ESTADO = { publicado: 'publicado', documento_parcial: 'solo un documento parcial', programa_general: 'solo un programa general, no específico de estas elecciones', no_publicado: 'no publicado', no_comprobado: 'sin comprobar' };
const CLASE_FUENTE = { programa: 'Programa de estas elecciones', documento_parcial: 'Documento parcial de estas elecciones', programa_general: 'Programa general del partido' };
const IDIOMA = { es: 'castellano', gl: 'gallego', ca: 'catalán', eu: 'euskera' };
const fecha = f => (f ? new Date(`${f}T12:00:00Z`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : 'sin fecha');
const tipoDeCita = c => (c.clase === 'posicion' ? 'posición' : c.medida_concreta ? 'medida concreta' : 'medida');

function lineaCita(c) {
  const numero = c.numero ? `**${c.numero}.** ` : '';
  const lineas = [`- ${numero}«${c.cita}» (p. ${c.pagina}) · ${tipoDeCita(c)} · _${c.nota}_`];
  if (c.traduccion) lineas.push(`  - Traducción propia: «${c.traduccion}»`);
  return lineas.join('\n');
}

await mkdir(join(DIR, 'partidos'), { recursive: true });
for (const id of archivos) {
  const p = mapa.partidos.find(x => x.id === id);
  if (!p) { console.error(`${id}: no está en partidos.json`); process.exitCode = 1; continue; }
  const datos = await leer(`citas/${id}.json`);
  const vigentes = datos.citas.filter(c => c.estado === 'vigente');
  const r = datos.resumen;

  const md = [];
  md.push(`# ${p.nombre}`, '');
  md.push('Generado con `node scripts/investigacion/generar-md.mjs` a partir de `partidos.json`, `fuentes.json` y `citas/' + id + '.json`. No se edita a mano.', '');
  md.push(`- **Tipo:** ${p.tipo.replace(/_/g, ' ')}${p.miembros.length ? `. Miembros: ${p.miembros.join('; ')}` : ''}`);
  if (p.cabeza_de_cartel) md.push(`- **Cabeza de cartel:** ${p.cabeza_de_cartel}`);
  md.push(`- **Programa para el 29 de noviembre:** ${ESTADO[p.programa.estado]} (comprobado el ${fecha(p.programa.comprobado)})`);
  md.push(`- **Citas recogidas:** ${r.vigentes} vigentes: ${r.medidas} medidas, de ellas ${r.medidas_concretas} concretas, y ${r.posiciones} posiciones.${r.exactas + r.normalizadas ? ` De programa, verificadas contra su página: ${r.exactas} exactas y ${r.normalizadas} normalizadas.` : ''}${r.declaraciones ? ` Declaraciones verificadas abriendo su fuente: ${r.declaraciones}.` : ''}`);
  if (r.sustituidas) md.push(`- **Citas sustituidas** por versiones nuevas de sus documentos: ${r.sustituidas} (siguen en el JSON).`);
  if (p.pendiente.length) md.push(`- **Pendiente:** ${p.pendiente.join(' ')}`);
  md.push('');

  const dePrograma = vigentes.filter(c => c.tipo === 'programa');
  if (dePrograma.length) {
    md.push('## Lo que dicen sus documentos', '');
    for (const fid of [...new Set(dePrograma.map(c => c.fuente))]) {
      const f = fuentes.get(fid);
      const citas = dePrograma.filter(c => c.fuente === fid);
      md.push(`### ${f.titulo}`, '');
      md.push(`${CLASE_FUENTE[f.clase] ?? 'Documento'} · ${fecha(f.publicado)} · ${f.paginas} páginas · en ${IDIOMA[f.idioma] ?? f.idioma} · [documento original](${f.url}) · ${citas.length} citas`, '');
      let abierto = [];
      for (const c of citas) {
        const ruta = c.apartado_original;
        // Se abren como título los niveles del apartado que cambian respecto a la cita anterior.
        let comun = 0;
        while (comun < ruta.length && comun < abierto.length && ruta[comun] === abierto[comun]) comun++;
        for (let i = comun; i < ruta.length; i++) {
          if (i < 2) md.push('', `${'#'.repeat(4 + i)} ${ruta[i]}`, '');
          else md.push('', `**${ruta.slice(2, i + 1).join(' › ')}**`, '');
        }
        abierto = ruta;
        md.push(lineaCita(c));
      }
      md.push('');
    }
  }

  const otras = vigentes.filter(c => c.tipo !== 'programa');
  if (otras.length) {
    md.push('## Lo que han dicho sus portavoces', '');
    md.push(dePrograma.length ? 'Declaraciones, no programa.' : '**No hay programa oficial publicado.** Esto es lo que han dicho sus portavoces y sus documentos sobre cada tema.', '');
    const TIPO = { documento: 'documento del partido', congreso: 'Congreso', declaracion: 'declaración en medios', redes: 'redes sociales' };
    for (const t of temas.temas) {
      const del = otras.filter(c => c.temas?.[0] === t.id).sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''));
      if (!del.length) continue;
      md.push(`### ${t.nombre}`, '');
      for (const c of del) {
        const autor = [c.quien, c.cargo, c.partido_de_quien && c.partido_de_quien !== p.nombre ? `(${c.partido_de_quien})` : ''].filter(Boolean).join(', ');
        md.push(`- «${c.cita}» · ${autor} · ${fecha(c.fecha)} · [${TIPO[c.tipo] ?? c.tipo}: ${c.medio}](${c.url}) · ${tipoDeCita(c)} · _${c.nota}_`);
        if (c.traduccion) md.push(`  - Traducción propia: «${c.traduccion}»`);
      }
      md.push('');
    }
    const sinTema = temas.temas.filter(t => !otras.some(c => c.temas?.includes(t.id))).map(t => t.nombre);
    if (sinTema.length) md.push(`Sin declaraciones recogidas sobre: ${sinTema.join(', ')}.`, '');
  }

  await writeFile(join(DIR, 'partidos', `${id}.md`), md.join('\n').replace(/\n{3,}/g, '\n\n') + '\n');
  console.log(`${id}: ${vigentes.length} citas → partidos/${id}.md`);
}
