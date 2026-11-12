// Páginas /partidos/ y /temas/: qué propone cada partido en cada tema, con sus citas.
// Datos: src/contenido/partidos/partidos-2026.json (lo genera scripts/investigacion/generar-web.mjs).
//
// Mismo diseño para todos los partidos: sin colores ni logotipos, el mismo orden de bloques y las
// mismas reglas para decidir qué se ve y qué va plegado.
//
// Las páginas son largas, así que todo está pensado para moverse por ellas: índice al principio,
// barra fija para saltar de sección, buscador, vista «solo resúmenes» y, en los temas, elegir qué
// partidos se comparan. La barra, el buscador y los filtros los activa /partidos.js; sin JavaScript
// la página se lee entera con su índice.
import { esc, textoFecha } from './util.mjs';
import { miga } from './parciales.mjs';

const INICIO = { texto: 'Inicio', ruta: '/' };
const PARTIDOS = { texto: 'Partidos', ruta: '/partidos/' };
const TEMAS = { texto: 'Temas', ruta: '/temas/' };
const PIE = 'Las citas son de los programas y de las declaraciones de cada partido. Selección, resúmenes y traducciones: No sé qué votar.';
const IDIOMA = { ca: 'catalán', gl: 'gallego', eu: 'euskera' };
const VISIBLES_SIN_CONCRETAS = 3;
// A partir de este número de citas a la vista, se agrupan bajo los apartados del propio programa.
const AGRUPAR_DESDE = 9;
const MODULOS = ['/partidos.js'];

const fecha = (iso) => (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? textoFecha(iso, null, true) : esc(iso || 'sin fecha'));
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

// Validación al construir: si algo falla, la construcción se para.
export function validarPartidos(d) {
  const e = [];
  const temas = new Set(d.temas.map(t => t.id));
  for (const p of d.partidos) {
    for (const c of ['id', 'nombre', 'ambito', 'programa']) if (!p[c]) e.push(`${p.id ?? '?'}: falta «${c}»`);
    const citas = d.citas[p.id] ?? [];
    const ids = new Set(citas.map(c => c.id));
    for (const c of citas) {
      if (!c.cita) e.push(`${p.id}: cita ${c.id} sin texto`);
      if (!c.temas?.every(t => temas.has(t))) e.push(`${p.id}: cita ${c.id} con un tema desconocido`);
      if (c.tipo === 'programa' && (!d.fuentes[c.fuente] || !Number.isInteger(c.pagina))) e.push(`${p.id}: cita ${c.id} sin documento o sin página`);
      if (c.tipo !== 'programa' && (!c.url || !c.quien || !c.fecha)) e.push(`${p.id}: declaración ${c.id} sin enlace, autor o fecha`);
    }
    for (const [t, r] of Object.entries(d.resumenes[p.id] ?? {})) {
      if (!temas.has(t)) e.push(`${p.id}: resumen de un tema desconocido (${t})`);
      for (const f of r.frases) for (const a of f.apoyos) if (!ids.has(a)) e.push(`${p.id} · ${t}: el resumen cita ${a}, que no existe`);
    }
  }
  return e;
}

const citasDe = (d, partido, tema) => (d.citas[partido] ?? []).filter(c => c.temas.includes(tema));
const concretasDe = (d, partido, tema) => citasDe(d, partido, tema).filter(c => c.concreta).length;
const sinPrograma = (p) => !['publicado', 'documento_parcial', 'programa_general'].includes(p.programa.estado);
const conDeclaraciones = (d, p) => (d.citas[p.id] ?? []).some(c => c.tipo !== 'programa');

// Qué tenemos de cada partido, dicho igual para todos: programa de estas elecciones, un documento
// parcial (temático o sectorial), un documento general que no es de estas elecciones, o nada.
function situacionPrograma(d, p) {
  const yDeclaraciones = conDeclaraciones(d, p);
  switch (p.programa.estado) {
    case 'publicado': return { breve: 'Con programa.', aviso: null };
    case 'documento_parcial': return {
      breve: `Sin programa completo: usamos sus documentos${yDeclaraciones ? ' y sus declaraciones' : ''}.`,
      aviso: ['No hay programa completo publicado', `Usamos los documentos que ha publicado el partido${yDeclaraciones ? ' y, en los temas que no tratan, lo que han dicho sus portavoces' : ''}. Cada cita indica de dónde sale.`],
    };
    case 'programa_general': return {
      breve: `Sin programa para estas elecciones: usamos un documento general del partido${yDeclaraciones ? ' y sus declaraciones' : ''}.`,
      aviso: ['No hay programa para estas elecciones', `Usamos un documento general del partido${yDeclaraciones ? ' y, en los temas que no trata, lo que han dicho sus portavoces' : ''}. Cada cita indica de dónde sale.`],
    };
    default: return {
      breve: 'Sin programa publicado: recogemos sus declaraciones.',
      aviso: ['No hay programa oficial publicado', 'Esto es lo que han dicho sus portavoces sobre cada tema. No son propuestas de programa.'],
    };
  }
}
const cuenta = (citas) => {
  const n = citas.filter(c => c.concreta).length;
  return n ? plural(n, 'medida concreta', 'medidas concretas') : plural(citas.length, 'cita', 'citas');
};

function enlaceDocumento(d, c) {
  const f = d.fuentes[c.fuente];
  // Cómo se llama el documento junto a cada cita. Una fuente puede traer su propio rótulo («Documento político»).
  const etiqueta = esc(f.rotulo ?? (f.clase === 'programa_general' ? 'Programa general' : f.clase === 'documento_parcial' ? 'Documento' : 'Programa'));
  return `<a href="${esc(`${f.url}#page=${c.pagina}`)}" data-evento="clic_fuente">${etiqueta}, página ${c.pagina}</a>${c.numero ? ` · medida ${esc(c.numero)}` : ''}`;
}

function enlaceDeclaracion(c, nombrePartido) {
  const autor = [c.quien, c.cargo].filter(Boolean).map(esc).join(', ').replace(/^\p{Ll}/u, l => l.toUpperCase());
  const deOtro = c.partidoDeQuien && c.partidoDeQuien !== nombrePartido ? ` (${esc(c.partidoDeQuien)})` : '';
  return `${autor}${deOtro} · ${fecha(c.fecha)} · <a href="${esc(c.url)}" data-evento="clic_fuente">${esc(c.medio || 'Fuente')}</a>`;
}

// «En su programa» si el documento es el programa de estas elecciones; si no, «En su documento».
const origen = (d, c) => (d.fuentes[c.fuente]?.clase === 'programa' ? 'En su programa' : 'En su documento');

// Una cita. Si no está en castellano, primero va nuestra traducción y debajo el original.
// Hay citas que son solo el nombre de una norma dentro de una lista («Primeras leyes que derogaremos»):
// llevan "contexto" y se muestran con el título de su apartado delante, salvo que ya encabece el grupo.
function cita(d, c, nombrePartido, tituloDelGrupo = '') {
  const fuente = `<p class="cita__fuente">${c.tipo === 'programa' ? enlaceDocumento(d, c) : enlaceDeclaracion(c, nombrePartido)}</p>`;
  const contexto = c.contexto && c.apartado && c.apartado !== tituloDelGrupo
    ? `<p class="cita__contexto">${origen(d, c)}, bajo el título «${esc(c.apartado)}»:</p>\n` : '';
  if (c.traduccion) {
    return `<li class="cita">
${contexto}<p class="cita__texto">«${esc(c.traduccion)}»</p>
<p class="cita__original"><span class="cita__rotulo">Original en ${IDIOMA[c.idioma] ?? c.idioma}:</span> <q lang="${esc(c.idioma)}">${esc(c.cita)}</q></p>
${fuente}
</li>`;
  }
  return `<li class="cita">
${contexto}<blockquote class="cita__texto">«${esc(c.cita)}»</blockquote>
${fuente}
</li>`;
}

// Lista de citas. Las listas largas de programa se parten por los apartados que les da el propio partido.
function listaCitas(d, citas, nombre) {
  const lista = (cs, titulo = '') => `<ul class="citas">\n${cs.map(c => cita(d, c, nombre, titulo)).join('\n')}\n</ul>`;
  if (citas.length < AGRUPAR_DESDE) return lista(citas);
  const grupos = [];
  for (const c of citas) {
    const titulo = c.tipo === 'programa' ? (c.apartado ?? '') : '';
    if (!grupos.length || grupos.at(-1).titulo !== titulo) grupos.push({ titulo, rotulo: origen(d, c), idioma: c.traduccion ? c.idioma : null, citas: [] });
    grupos.at(-1).citas.push(c);
  }
  if (grupos.length < 2) return lista(citas);
  return grupos.map(g => `<div class="grupo">${g.titulo ? `
<p class="grupo__titulo"><span class="grupo__rotulo">${g.rotulo}:</span> <span${g.idioma ? ` lang="${esc(g.idioma)}"` : ''}>${esc(g.titulo)}</span></p>` : ''}
${lista(g.citas, g.titulo)}
</div>`).join('\n');
}

function resumen(r, citas) {
  if (!r) return '';
  const deDeclaraciones = citas.length && citas.every(c => c.tipo !== 'programa');
  return `<div class="resumen">
<p class="resumen__texto">${r.frases.map(f => esc(f.texto)).join(' ')}</p>
<p class="resumen__nota">Resumen nuestro, hecho con ${deDeclaraciones ? 'sus declaraciones' : 'sus citas'}${r.base === 'escasa' ? '. Hay poco material sobre este tema' : ''}.</p>
</div>`;
}

// Bloque de un partido en un tema: resumen, medidas concretas a la vista y el resto plegado.
function postura(d, p, tema) {
  const citas = citasDe(d, p.id, tema.id);
  const r = d.resumenes[p.id]?.[tema.id];
  if (!citas.length) return `<p class="postura__vacia">No hemos encontrado propuestas ${sinPrograma(p) || conDeclaraciones(d, p) ? 'ni declaraciones ' : ''}sobre este tema.</p>`;
  const concretas = citas.filter(c => c.concreta);
  const visibles = concretas.length ? concretas : citas.slice(0, VISIBLES_SIN_CONCRETAS);
  const resto = citas.filter(c => !visibles.includes(c));
  const marca = citas.every(c => c.tipo !== 'programa') ? '<p class="postura__marca">Declaraciones, no programa</p>' : '';
  const rotulo = concretas.length ? `Medidas concretas (${concretas.length})` : 'Lo que dice';
  return `${marca}${resumen(r, citas)}
<div class="postura__detalle">
<h3 class="postura__rotulo">${rotulo}</h3>
${listaCitas(d, visibles, p.nombre)}${resto.length ? `
<details class="pliegue"><summary>Ver ${plural(resto.length, 'cita más', 'citas más')}: medidas generales y posturas</summary>
${listaCitas(d, resto, p.nombre)}
</details>` : ''}
</div>`;
}

function textoPrograma(p) {
  const doc = p.programa.documentos[0];
  // «via»: de dónde sale la copia cuando no es la web del partido (por ejemplo, un medio que publica el PDF).
  const detalle = doc ? [doc.fecha ? fecha(doc.fecha) : '', doc.via ? esc(doc.via) : ''].filter(Boolean).join('; ') : '';
  const enlace = doc ? ` <a href="${esc(doc.url)}" data-evento="clic_fuente">${esc(doc.titulo)}</a>${detalle ? ` (${detalle})` : ''}.` : '';
  switch (p.programa.estado) {
    case 'publicado': return `Programa para estas elecciones:${enlace}`;
    case 'documento_parcial': return `No ha publicado un programa completo. Usamos este documento del partido:${enlace}`;
    case 'programa_general': return `No ha publicado programa para estas elecciones. Usamos un documento general del partido:${enlace}`;
    default: return `No ha publicado programa (comprobado el ${fecha(p.programa.comprobado)}).`;
  }
}

const notaOrden = '<p class="nota-orden">Ordenados por los votos que obtuvo en 2023 la candidatura de la que proceden; las que no se presentaron en 2023 van al final.</p>';

// --- Piezas para moverse por una página larga ---

// Buscador y vista. /partidos.js les quita el hidden; sin JavaScript no aparecen.
function herramientas({ buscarEn, partidos }) {
  return `<div class="herramientas" data-herramientas hidden>
<div class="buscador">
<label class="buscador__rotulo" for="buscar">Buscar en ${esc(buscarEn)}</label>
<div class="buscador__fila">
<input class="buscador__campo" type="search" id="buscar" autocomplete="off" enterkeyhint="search" placeholder="Por ejemplo: alquiler" data-buscar>
<button type="button" class="buscador__borrar" data-buscar-borrar hidden>Borrar</button>
</div>
<p class="buscador__estado" data-buscar-estado aria-live="polite"></p>
</div>
<div class="vista" role="group" aria-label="Qué quieres ver">
<button type="button" class="vista__boton" data-vista="todo" aria-pressed="true">Resúmenes y medidas</button>
<button type="button" class="vista__boton" data-vista="resumenes" aria-pressed="false">Solo resúmenes</button>
</div>${partidos ? `
<details class="elegir" data-elegir>
<summary><span>Elegir qué partidos comparar <span class="elegir__cuenta" data-elegir-cuenta></span></span></summary>
<div class="elegir__botones">
<button type="button" class="elegir__boton" data-elegir-todos>Marcar todos</button>
<button type="button" class="elegir__boton" data-elegir-ninguno>Quitar todos</button>
</div>
<ul class="elegir__lista">
${partidos.map(p => `<li><label class="elegir__opcion"><input type="checkbox" value="${p.id}" checked> <span>${esc(p.nombre)}</span></label></li>`).join('\n')}
</ul>
<p class="elegir__nota">Tu elección se mantiene al cambiar de tema. Va en la dirección de la página: cópiala para compartir esta comparación.</p>
</details>` : ''}
</div>`;
}

// Barra fija para saltar de sección: anterior, lista de secciones, siguiente y volver arriba.
function barraSaltos(cosa) {
  return `<div class="saltos" data-saltos hidden>
<button type="button" class="saltos__boton" data-saltos-anterior aria-label="${cosa === 'tema' ? 'Tema' : 'Partido'} anterior"><span aria-hidden="true">‹</span></button>
<label class="solo-lector" for="saltos-lista">Ir a un ${cosa}</label>
<select class="saltos__lista" id="saltos-lista" data-saltos-lista></select>
<button type="button" class="saltos__boton" data-saltos-siguiente aria-label="${cosa === 'tema' ? 'Tema' : 'Partido'} siguiente"><span aria-hidden="true">›</span></button>
<a class="saltos__boton" href="#indice" aria-label="Volver al índice"><span aria-hidden="true">↑</span></a>
</div>`;
}

function indice(titulo, entradas) {
  return `<nav class="indice" id="indice" aria-labelledby="indice-titulo">
<h2 id="indice-titulo">${titulo}</h2>
<ul>
${entradas.map(e => `<li data-indice="${e.id}"><a href="#${e.ancla}"><span class="indice__nombre">${esc(e.nombre)}</span> <span class="indice__cuenta">${esc(e.cuenta)}</span></a></li>`).join('\n')}
</ul>
</nav>`;
}

function notaMetodo(d) {
  return `<section class="bloque metodo-partidos" aria-labelledby="como-lo-hacemos">
<h2 id="como-lo-hacemos">Cómo lo hacemos</h2>
<ul class="lista">
<li>Cada cita está copiada tal cual de su programa (comprobada contra la página del PDF) o de sus portavoces (comprobada abriendo la fuente).</li>
<li>Si un partido no ha publicado programa, recogemos lo que han dicho su líder, sus cabezas de lista y sus portavoces desde julio de 2023, y lo marcamos como «declaraciones, no programa».</li>
<li>Si lo que ha publicado es un documento parcial o un documento general que no es de estas elecciones, lo usamos y lo decimos en su ficha.</li>
<li>Los resúmenes los escribimos nosotros a partir de esas citas, sin valoraciones. Cada frase se apoya en citas concretas.</li>
<li>Las citas en catalán y en gallego llevan nuestra traducción, con el original debajo.</li>
</ul>
<p class="fuentes__fecha">Datos actualizados el <time datetime="${d.actualizado}">${fecha(d.actualizado)}</time>. ¿Ves un error? Escríbenos.</p>
</section>`;
}

// --- Páginas ---

export function indicePartidos(d) {
  const ruta = '/partidos/';
  return {
    ruta,
    titulo: 'Qué proponen los partidos para el 29 de noviembre',
    descripcion: 'Qué proponen y qué defienden en cada tema los principales partidos de las elecciones generales del 29 de noviembre de 2026, con la cita exacta de su programa o de sus declaraciones.',
    miga: [INICIO, PARTIDOS],
    actualizado: d.actualizado,
    pieNota: PIE,
    contenido: `<div class="envoltorio texto">
${miga([INICIO, PARTIDOS])}
<h1>Partidos</h1>
<p class="entradilla">Qué proponen y qué defienden ${d.partidos.length} partidos en ${d.temas.length} temas, con la frase exacta de su programa o de sus portavoces y el enlace para comprobarla.</p>
${notaOrden}
<section class="bloque" aria-labelledby="lista-partidos">
<h2 id="lista-partidos" class="solo-lector">Todos los partidos</h2>
<ul class="tarjetas">
${d.partidos.map(p => `<li><a class="tarjeta-enlace" href="/partidos/${p.id}/"><span class="tarjeta-enlace__titulo">${esc(p.nombre)}</span><span class="tarjeta-enlace__texto">${esc(p.ambito)} ${situacionPrograma(d, p).breve}</span></a></li>`).join('\n')}
</ul>
</section>
<section class="bloque" aria-labelledby="por-temas">
<h2 id="por-temas">¿Prefieres comparar por temas?</h2>
<p>En <a href="/temas/">Temas</a> ves lo que dice cada partido sobre lo mismo, uno debajo de otro, y puedes elegir qué partidos comparar.</p>
</section>
${notaMetodo(d)}
</div>`,
  };
}

export function paginaPartido(p, d) {
  const ruta = `/partidos/${p.id}/`;
  const conMaterial = d.temas.filter(t => citasDe(d, p.id, t.id).length);
  const sinMaterial = d.temas.filter(t => !citasDe(d, p.id, t.id).length);
  const n = (d.citas[p.id] ?? []).length;
  const { aviso } = situacionPrograma(d, p);
  return {
    ruta,
    titulo: `Qué propone ${p.nombre} para el 29 de noviembre`,
    descripcion: `Qué propone y qué defiende ${p.nombre} en cada tema para las elecciones generales del 29 de noviembre de 2026, con la cita exacta y su fuente.`,
    miga: [INICIO, PARTIDOS, { texto: p.nombre, ruta }],
    actualizado: d.actualizado,
    pieNota: PIE,
    modulos: MODULOS,
    contenido: `<article class="envoltorio texto ficha" data-ficha="partido">
${miga([INICIO, PARTIDOS, { texto: p.nombre, ruta }])}
<header class="ficha__cabeza">
<h1>${esc(p.nombre)}</h1>
${p.nombreCompleto !== p.nombre ? `<p class="ficha__oficial">${esc(p.nombreCompleto)}</p>` : ''}
<ul class="ficha__datos">
<li>${esc(p.ambito)}</li>
${p.cabeza ? `<li>${esc(p.cabeza)}</li>` : ''}
${p.miembros?.length ? `<li>Coalición de ${esc(p.miembros.join(', '))}.</li>` : ''}
<li>${textoPrograma(p)}</li>
</ul>
${aviso ? `<div class="aviso-caja"><h3><span class="aviso-caja__signo" aria-hidden="true">!</span>${aviso[0]}</h3><p>${aviso[1]}</p></div>` : ''}
<p class="ficha__cuenta">${plural(n, 'cita recogida', 'citas recogidas')} en ${plural(conMaterial.length, 'tema', 'temas')}.</p>
</header>
${herramientas({ buscarEn: `lo que dice ${p.nombre}` })}
${indice('Temas', conMaterial.map(t => ({ id: t.id, ancla: `tema-${t.id}`, nombre: t.nombre, cuenta: cuenta(citasDe(d, p.id, t.id)) })))}
<div class="recorrido">
${barraSaltos('tema')}
${conMaterial.map((t, i) => `<section class="postura" id="tema-${t.id}" data-salto="${esc(t.nombre)}" aria-labelledby="tema-${t.id}-titulo">
<h2 id="tema-${t.id}-titulo">${esc(t.nombre)}</h2>
${postura(d, p, t)}
<p class="postura__enlaces"><a href="/temas/${t.id}/#partido-${p.id}">Comparar con los demás partidos</a>${conMaterial[i + 1] ? `<a href="#tema-${conMaterial[i + 1].id}">Siguiente tema: ${esc(conMaterial[i + 1].nombre)}</a>` : ''}</p>
</section>`).join('\n')}
</div>
${sinMaterial.length ? `<section class="bloque" aria-labelledby="sin-material"><h2 id="sin-material">Temas sin propuestas</h2><p>No hemos encontrado ${sinPrograma(p) ? 'declaraciones' : 'propuestas'} sobre: ${sinMaterial.map(t => esc(t.nombre.toLowerCase())).join(', ')}.</p></section>` : ''}
${notaMetodo(d)}
</article>`,
  };
}

export function indiceTemas(d) {
  const ruta = '/temas/';
  return {
    ruta,
    titulo: 'Qué proponen los partidos en cada tema',
    descripcion: `Compara lo que proponen los partidos en ${d.temas.length} temas para las elecciones generales del 29 de noviembre de 2026: vivienda, empleo, pensiones, impuestos, sanidad y más.`,
    miga: [INICIO, TEMAS],
    actualizado: d.actualizado,
    pieNota: PIE,
    contenido: `<div class="envoltorio texto">
${miga([INICIO, TEMAS])}
<h1>Temas</h1>
<p class="entradilla">Elige un tema y compara lo que proponen ${d.partidos.length} partidos, uno debajo de otro y con la cita exacta de cada uno.</p>
<section class="bloque" aria-labelledby="lista-temas">
<h2 id="lista-temas" class="solo-lector">Todos los temas</h2>
<ul class="tarjetas">
${d.temas.map(t => {
    const con = d.partidos.filter(p => citasDe(d, p.id, t.id).length).length;
    return `<li><a class="tarjeta-enlace" href="/temas/${t.id}/"><span class="tarjeta-enlace__titulo">${esc(t.nombre)}</span><span class="tarjeta-enlace__texto">${esc(t.definicion)} ${con} de ${d.partidos.length} partidos.</span></a></li>`;
  }).join('\n')}
</ul>
</section>
<section class="bloque" aria-labelledby="por-partidos">
<h2 id="por-partidos">¿Prefieres ver un partido entero?</h2>
<p>En <a href="/partidos/">Partidos</a> tienes todo lo que dice cada uno, tema por tema.</p>
</section>
${notaMetodo(d)}
</div>`,
  };
}

export function paginaTema(t, d) {
  const ruta = `/temas/${t.id}/`;
  const con = d.partidos.filter(p => citasDe(d, p.id, t.id).length);
  const sin = d.partidos.filter(p => !citasDe(d, p.id, t.id).length);
  const posicion = d.temas.findIndex(x => x.id === t.id);
  const [anterior, siguiente] = [d.temas[posicion - 1], d.temas[posicion + 1]];
  return {
    ruta,
    titulo: `${t.nombre}: qué proponen los partidos`,
    descripcion: `Qué proponen los partidos sobre ${t.nombre.toLowerCase()} en las elecciones generales del 29 de noviembre de 2026, con la cita exacta de cada uno.`,
    miga: [INICIO, TEMAS, { texto: t.nombre, ruta }],
    actualizado: d.actualizado,
    pieNota: PIE,
    modulos: MODULOS,
    contenido: `<article class="envoltorio texto ficha" data-ficha="tema">
${miga([INICIO, TEMAS, { texto: t.nombre, ruta }])}
<header class="ficha__cabeza">
<h1>${esc(t.nombre)}</h1>
<p class="entradilla">${esc(t.definicion)}</p>
</header>
${herramientas({ buscarEn: `lo que dicen sobre ${t.nombre.toLowerCase()}`, partidos: con })}
${indice('Partidos', con.map(p => ({ id: p.id, ancla: `partido-${p.id}`, nombre: p.nombre, cuenta: cuenta(citasDe(d, p.id, t.id)) })))}
${notaOrden}
<div class="recorrido">
${barraSaltos('partido')}
<p class="ficha__vacio" data-vacio hidden>No has elegido ningún partido. Marca alguno en «Elegir qué partidos comparar».</p>
${con.map(p => `<section class="postura" id="partido-${p.id}" data-salto="${esc(p.nombre)}" data-partido="${p.id}" aria-labelledby="partido-${p.id}-titulo">
<h2 id="partido-${p.id}-titulo">${esc(p.nombre)}</h2>
${postura(d, p, t)}
<p class="postura__enlaces"><a href="/partidos/${p.id}/#tema-${t.id}">Ver ${esc(p.nombre)} en todos los temas</a></p>
</section>`).join('\n')}
</div>
${sin.length ? `<section class="bloque" aria-labelledby="sin-propuestas"><h2 id="sin-propuestas">Sin propuestas sobre este tema</h2><p>No hemos encontrado propuestas ni declaraciones de: ${sin.map(p => `<a href="/partidos/${p.id}/">${esc(p.nombre)}</a>`).join(', ')}.</p></section>` : ''}
<nav class="paso-temas" aria-label="Otros temas">
${anterior ? `<a class="paso-temas__enlace" href="/temas/${anterior.id}/"><span class="paso-temas__rotulo">Tema anterior</span><span>${esc(anterior.nombre)}</span></a>` : '<span></span>'}
${siguiente ? `<a class="paso-temas__enlace paso-temas__enlace--siguiente" href="/temas/${siguiente.id}/"><span class="paso-temas__rotulo">Tema siguiente</span><span>${esc(siguiente.nombre)}</span></a>` : '<span></span>'}
</nav>
<section class="otras" aria-labelledby="otros-temas">
<h2 id="otros-temas">Todos los temas</h2>
<ul>
${d.temas.filter(x => x.id !== t.id).map(x => `<li><a href="/temas/${x.id}/"><span>${esc(x.nombre)}</span></a></li>`).join('\n')}
</ul>
</section>
${notaMetodo(d)}
</article>`,
  };
}
