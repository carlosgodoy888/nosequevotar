// Una función por tipo de página. Cada una devuelve { ruta, titulo, descripcion, contenido, miga, ... }
// que luego se envuelve con la plantilla base.
import { esc, enlinea, textoFecha, atributosPeriodo, diasHasta, estados } from './util.mjs';
import { miga, llamadaTest, fuentesOficiales, otrasGuias } from './parciales.mjs';
import { bloque, tablaFechas, fuenteFecha } from './bloques.mjs';

const INICIO = { texto: 'Inicio', ruta: '/' };
const CUANTAS = ['', 'Una', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve', 'Diez'];
const GUIAS = { texto: 'Guías', ruta: '/guia/' };

// Texto que puede variar con la fecha: una cadena o una lista de variantes con desde/hasta.
function variantes(valor, ctx, pintar) {
  if (typeof valor === 'string') return pintar(valor, '');
  return valor.map(v => pintar(v.texto, atributosPeriodo(v, ctx.hoy))).join('\n');
}

function cuentaAtras(ctx) {
  const dias = diasHasta(ctx.sitio.eleccion.fecha, ctx.hoy);
  const oculta = dias < 1 ? ' hidden' : '';
  return `<p class="cuenta" data-cuenta="${ctx.sitio.eleccion.fecha}"${oculta}><span class="cuenta__numero">${Math.max(dias, 0)}</span> <span class="cuenta__texto">${dias === 1 ? 'día para votar' : 'días para votar'}</span></p>`;
}

// En la portada (con hoy) una guía con portadaHasta deja de verse después de esa fecha;
// primero y extra añaden tarjetas delante y detrás de las guías.
function tarjetasGuias(guias, { hoy, primero = '', extra = '' } = {}) {
  const periodo = (g) => hoy && g.portadaHasta ? atributosPeriodo({ hasta: g.portadaHasta }, hoy) : '';
  return `<ul class="tarjetas">
${primero ? `${primero}\n` : ''}${guias.map(g => `<li${periodo(g)}><a class="tarjeta-enlace" href="/guia/${g.slug}/" data-evento="clic_guia"><span class="tarjeta-enlace__titulo">${esc(g.nombre)}</span><span class="tarjeta-enlace__texto">${esc(g.resumen)}</span></a></li>`).join('\n')}${extra ? `\n${extra}` : ''}
</ul>`;
}

// Primera tarjeta de «Guías para votar» en la portada: lleva al calendario.
const TARJETA_CALENDARIO = '<li><a class="tarjeta-enlace" href="/calendario/"><span class="tarjeta-enlace__titulo">Calendario electoral</span><span class="tarjeta-enlace__texto">Qué día es cada cosa: voto por correo, campaña, votación y resultados.</span></a></li>';

// Tarjeta «Próximo plazo» de la portada, con lo que el votante tiene que hacer o puede hacer (paraVotante).
// El HTML trae todos los plazos con sus fechas: es lo que se ve sin JavaScript y nunca queda desfasado.
// Al abrir la página, sitio.js deja como principal el próximo de publico "todos" y, debajo, el próximo
// de "extranjero"; oculta los pasados y, cuando ya no queda ninguno de "todos", la tarjeta entera.
function tarjetaPlazo(ctx) {
  const dePublico = (publico) => ctx.fechas.filter(f => f.paraVotante && f.publico === publico)
    .sort((a, b) => (a.fin || a.inicio).localeCompare(b.fin || b.inicio));
  const enlaceGuia = (slug) => {
    const g = slug && ctx.guias.find(x => x.slug === slug);
    return g ? ` <a href="/guia/${g.slug}/" data-evento="clic_guia">Guía: ${esc(g.nombre.toLowerCase())}</a>` : '';
  };
  const item = (f, guia) => `<li data-publico="${f.publico}" data-inicio="${f.inicio}"${f.fin ? ` data-fin="${f.fin}"` : ''}>` +
    `<time class="plazo__fecha" datetime="${f.inicio}">${textoFecha(f.inicio, f.fin)}</time> <span class="plazo__texto">${enlinea(f.texto)}</span>${guia ? enlaceGuia(f.guia) : ''}${fuenteFecha(f)}</li>`;

  const todos = dePublico('todos');
  if (!todos.length) return '';
  const fuera = dePublico('extranjero');
  return `<li class="plazo" data-plazo><p class="plazo__rotulo">Plazos para votar</p>
<ul class="plazo__lista">
${todos.map(f => item(f, true)).join('\n')}
</ul>${fuera.length ? `
<div class="plazo__fuera"><p class="plazo__fuera-rotulo">Si vives o estás fuera de España:</p>
<ul class="plazo__lista">
${fuera.map(f => item(f, false)).join('\n')}
</ul>${enlaceGuia(fuera[0].guia)}</div>` : ''}</li>`;
}

export function guia(g, ctx) {
  const ruta = `/guia/${g.slug}/`;
  const ctxGuia = { ...ctx };
  const secciones = g.secciones.map((s, i) => {
    const id = `seccion-${i + 1}`;
    const html = `<section class="guia__seccion" aria-labelledby="${id}">
<h2 id="${id}">${esc(s.titulo)}</h2>
${s.bloques.map(b => bloque(b, ctxGuia)).join('\n')}
</section>`;
    return i === 1 ? `${html}\n<!-- PUBLICIDAD 1: posición reservada tras la segunda sección. No pintar nada aquí todavía. -->` : html;
  }).join('\n');

  const pendientes = (g.pendiente || []).map(p => `<!-- PENDIENTE: ${p.replace(/--/g, '—')} -->`).join('\n');

  return {
    ruta,
    titulo: g.tituloSeo,
    descripcion: g.descripcion,
    miga: [INICIO, GUIAS, { texto: g.nombre, ruta }],
    contenido: `<article class="envoltorio texto guia">
${miga([INICIO, GUIAS, { texto: g.nombre, ruta }])}
<header class="guia__cabeza">
<h1>${esc(g.titulo)}</h1>
${variantes(g.entradilla, ctx, (t, a) => `<p class="entradilla"${a}>${enlinea(t)}</p>`)}
</header>
<section class="esencial" aria-labelledby="esencial-titulo">
<h2 id="esencial-titulo">Lo esencial</h2>
<ul class="garantias">
${g.esencial.map(e => `<li><span class="casilla marcada" aria-hidden="true"></span><span>${enlinea(e)}</span></li>`).join('\n')}
</ul>
</section>
${secciones}
${fuentesOficiales(g.fuentes, g.actualizado)}
${otrasGuias(ctx.guias, g.slug)}
${llamadaTest()}
${pendientes}
<!-- PUBLICIDAD 2: posición reservada antes del pie. No pintar nada aquí todavía. -->
</article>`,
  };
}

export function indiceGuias(ctx) {
  const ruta = '/guia/';
  return {
    ruta,
    titulo: 'Guías para votar el 29 de noviembre',
    descripcion: 'Guías cortas para votar en las elecciones generales del 29 de noviembre de 2026: voto por correo, dónde votar, voto en blanco, cómo se vota, censo y voto desde el extranjero.',
    miga: [INICIO, { texto: 'Guías', ruta }],
    contenido: `<div class="envoltorio texto">
${miga([INICIO, { texto: 'Guías', ruta }])}
<h1>Guías para votar</h1>
<p class="entradilla">${CUANTAS[ctx.guias.length] || ctx.guias.length} guías cortas para votar el 29 de noviembre sin errores. Cada una responde a una pregunta y enlaza a la fuente oficial.</p>
<section class="bloque" aria-labelledby="lista-guias">
<h2 id="lista-guias" class="solo-lector">Todas las guías</h2>
${tarjetasGuias(ctx.guias)}
</section>
<section class="bloque" aria-labelledby="fechas-titulo">
<h2 id="fechas-titulo">¿Buscas una fecha?</h2>
<p>Todos los plazos, del 6 de octubre al 23 de diciembre, están en el <a href="/calendario/">calendario electoral</a>.</p>
</section>
${llamadaTest()}
</div>`,
  };
}

export function calendario(ctx) {
  const ruta = '/calendario/';
  const { eleccion } = ctx.sitio;
  const filas = [...ctx.fechas].sort((a, b) => a.inicio.localeCompare(b.inicio));
  return {
    ruta,
    titulo: 'Calendario de las elecciones del 29 de noviembre',
    descripcion: 'Todas las fechas de las elecciones generales del 29 de noviembre de 2026: censo, voto por correo y desde el extranjero, candidaturas, campaña, votación y escrutinio.',
    miga: [INICIO, { texto: 'Calendario', ruta }],
    contenido: `<div class="envoltorio texto">
${miga([INICIO, { texto: 'Calendario', ruta }])}
<h1>Calendario electoral</h1>
<p class="entradilla">Las elecciones generales son el domingo ${textoFecha(eleccion.fecha, null, true)}, con los colegios abiertos ${eleccion.horario}. Aquí tienes todas las fechas clave, en orden.</p>
<section class="bloque" aria-labelledby="que-se-elige">
<h2 id="que-se-elige">Qué se elige</h2>
<p>Se eligen ${eleccion.diputados} diputados para el Congreso y ${eleccion.senadores} senadores para el Senado. Si quieres saber cómo se rellena cada papeleta, mira la guía <a href="/guia/como-se-vota/" data-evento="clic_guia">cómo se vota</a>.</p>
</section>
<section class="bloque" aria-labelledby="todas-fechas">
<h2 id="todas-fechas">Todas las fechas</h2>
<p class="leyenda"><span class="leyenda__item leyenda__item--pasada">Tachada: ya pasó</span> <span class="leyenda__item leyenda__item--proxima">Destacada: la próxima o la que está en curso</span></p>
${tablaFechas(filas, ctx, { titulo: 'Calendario de las elecciones generales', enlacesGuia: true })}
</section>
${fuentesOficiales(ctx.sitio.fuentesCalendario, ctx.sitio.actualizado)}
${llamadaTest()}
</div>`,
  };
}

// Temas de la tarjeta «¿Qué tema te importa más?» de la portada, por su id en los datos de partidos.
// Todos llevan a /temas/: la tarjeta despierta la curiosidad y el tema se elige allí.
const TEMAS_PORTADA = ['vivienda', 'inmigracion', 'sanidad', 'pensiones', 'empleo', 'impuestos'];

function tarjetaTemas(ctx) {
  const { temas, partidos } = ctx.propuestas;
  const elegidos = TEMAS_PORTADA.map(id => {
    const tema = temas.find(t => t.id === id);
    if (!tema) throw new Error(`Portada: el tema «${id}» no existe en los datos de partidos.`);
    return tema;
  });
  return `<div class="ejemplo" aria-labelledby="temas-rotulo">
<p class="ejemplo__rotulo" id="temas-rotulo">Compara las propuestas de los partidos, tema a tema.</p>
<article class="tarjeta">
<h2 class="tarjeta__pregunta">¿Qué tema te importa más?</h2>
<ul class="temas-portada">
${elegidos.map(t => `<li><a class="boton-casilla" href="/temas/" data-evento="clic_temas" data-tema-portada><span class="casilla" aria-hidden="true"></span>${esc(t.nombre)}</a></li>`).join('\n')}
</ul>
<p class="tarjeta__pie">Lo que proponen ${partidos.length} partidos en ${temas.length} temas, con la cita exacta de cada uno.</p>
</article>
<a class="boton" href="/temas/" data-evento="clic_temas">Ver los ${temas.length} temas</a>
</div>`;
}

export function portada(ctx) {
  const proximas = (() => {
    const filas = [...ctx.fechas].sort((a, b) => a.inicio.localeCompare(b.inicio));
    const est = estados(filas, ctx.hoy);
    const desde = Math.max(0, est.findIndex(e => e !== 'pasada'));
    return filas.slice(desde, desde + 4);
  })();

  return {
    ruta: '/',
    titulo: 'No sé qué votar: guías para votar y propuestas sin siglas',
    descripcion: 'Guías claras para votar en las elecciones generales del 29 de noviembre de 2026 y un test para elegir propuestas sin saber de qué partido son.',
    arriba: true,
    contenido: `<section class="envoltorio portada" aria-labelledby="titulo">
<div class="portada__texto">
<p class="etiqueta"><span class="casilla casilla--pequena" aria-hidden="true"></span>Elecciones generales · ${textoFecha(ctx.sitio.eleccion.fecha, null, true)}</p>
<h1 id="titulo">Todo lo que necesitas para votar.</h1>
${cuentaAtras(ctx)}
<div class="botones">
<a class="boton" href="/temas/" data-evento="clic_temas">Explora las propuestas políticas</a>
<a class="boton boton--claro" href="/test/" data-evento="clic_hacer_test">Test de afinidad</a>
</div>
</div>
<div class="portada__ejemplos">
<div class="ejemplo" aria-labelledby="ejemplo-rotulo">
<p class="ejemplo__rotulo" id="ejemplo-rotulo">Así es una papeleta del test. Pruébala con un ejemplo.</p>
<article class="tarjeta" id="tarjeta">
<div class="tarjeta__cabeza"><span class="tarjeta__letra">B</span><span class="tarjeta__estado" id="estado" aria-live="polite"></span></div>
<p class="tarjeta__texto">Construir 200.000 viviendas públicas de alquiler en diez años sobre suelo del Estado.</p>
<div class="demo-decision" role="group" aria-label="Tu decisión">
<button type="button" class="boton-casilla" data-demo="no" aria-pressed="false"><span class="casilla" aria-hidden="true"></span>No me convence</button>
<button type="button" class="boton-casilla" data-demo="si" aria-pressed="false"><span class="casilla" aria-hidden="true"></span>Me convence</button>
<button type="button" class="boton-casilla demo-decision__paso" data-demo="paso" aria-pressed="false"><span class="casilla" aria-hidden="true"></span>Paso, no lo tengo claro</button>
</div>
<div class="firma">
<span class="firma__rotulo">La firmaba el</span>
<span class="franja franja--fija" role="img" aria-label="Nombre tapado"><span class="franja__tapa"></span></span>
<span class="firma__fuente">Programa de ejemplo, página 14</span>
</div>
</article>
<a class="boton" href="/test/" data-evento="clic_hacer_test">Revelar quién la firmaba</a>
</div>
${tarjetaTemas(ctx)}
</div>
</section>

<section class="seccion" aria-labelledby="guias-titulo">
<div class="envoltorio">
<h2 id="guias-titulo">Guías para votar</h2>
${tarjetasGuias(ctx.guias, { hoy: ctx.hoy, primero: TARJETA_CALENDARIO, extra: tarjetaPlazo(ctx) })}
</div>
</section>

<section class="seccion" aria-labelledby="fechas-titulo">
<div class="envoltorio">
<div class="texto-ancho">
<h2 id="fechas-titulo">Próximas fechas</h2>
${tablaFechas(proximas, ctx, { titulo: 'Próximas fechas' })}
<p class="mas"><a href="/calendario/">Ver el calendario completo</a></p>
</div>
</div>
</section>

<section class="seccion" aria-labelledby="como">
<div class="envoltorio">
<h2 id="como">Cómo funciona el test</h2>
<ol class="pasos pasos--fila">
<li class="paso"><span class="paso__numero" aria-hidden="true">1</span><div><h3>Lees sin nombres</h3><p>Tres o seis temas. En cada uno, propuestas reales de partidos distintos, una a una, sin logotipos ni colores.</p></div></li>
<li class="paso"><span class="paso__numero" aria-hidden="true">2</span><div><h3>Decides</h3><p>Ante cada propuesta eliges «Me convence», «No me convence» o «Paso», si no lo tienes claro.</p></div></li>
<li class="paso"><span class="paso__numero" aria-hidden="true">3</span><div><h3>Descubres quién era</h3><p>Ves con qué programa coincides más y quién firmaba cada propuesta, con la frase exacta del programa y su página.</p></div></li>
</ol>
<p class="mas"><a class="boton" href="/test/" data-evento="clic_hacer_test">Test de afinidad</a></p>
</div>
</section>

<section class="seccion" aria-labelledby="promesas">
<div class="envoltorio">
<div class="texto-ancho">
<h2 id="promesas">Lo que te prometemos</h2>
<ul class="garantias">
<li><span class="casilla marcada" aria-hidden="true"></span><span><strong>Sin registro.</strong> No te pedimos el nombre ni el correo.</span></li>
<li><span class="casilla marcada" aria-hidden="true"></span><span><strong>Tus respuestas no salen de tu móvil.</strong> El resultado se calcula en tu navegador.</span></li>
<li><span class="casilla marcada" aria-hidden="true"></span><span><strong>Cada propuesta tiene su fuente.</strong> La frase del programa, la página y el año.</span></li>
<li><span class="casilla marcada" aria-hidden="true"></span><span><strong>No trabajamos para ningún partido.</strong> Ninguno nos paga.</span></li>
</ul>
</div>
</div>
</section>

<section class="contacto" aria-labelledby="escribenos">
<div class="envoltorio">
<h2 id="escribenos">¿Quieres decirnos algo?</h2>
<p>Si eres periodista, si quieres ayudar a revisar propuestas o si ves algo que corregir, escríbenos.</p>
<a class="boton" href="mailto:${ctx.sitio.correo}">${ctx.sitio.correo}</a>
</div>
</section>`,
  };
}

// Test sin siglas. El HTML trae la entrada y el aviso sin JavaScript; test.mjs pinta el recorrido.
// El banco es un parámetro de la página (data-banco), para pasar a 2026 sin tocar el código.
export function test(ctx) {
  const ruta = '/test/';
  const v = ctx.sitio.version;
  const j = ctx.juego;
  return {
    ruta,
    titulo: '¿Con qué programa de 2023 coincides? Test sin siglas',
    descripcion: 'Lee propuestas reales de los programas de 2023 sin saber de qué partido son y descubre con qué programa coincides más. Sin registro y sin salir de tu móvil.',
    miga: [INICIO, { texto: 'Test', ruta }],
    csp: true,
    sinMedicion: true,
    estilos: ['/test.css'],
    modulos: ['/juegos/test.js'],
    pieNota: 'Las citas pertenecen a los programas electorales de cada partido. Selección y textos neutros: No sé qué votar.',
    contenido: `<div class="envoltorio juego" id="juego" data-anio="${j.anio}" data-banco="/test/banco-${j.anio}.json?v=${v}" data-partidos="/test/partidos-${j.anio}.json?v=${v}" data-circunscripciones="/test/circunscripciones.json?v=${v}">
<div class="juego__pantalla" id="pantalla">
<div class="juego__entrada">
<h1>¿Con qué programa de ${j.anio} coincides?</h1>
<p class="entradilla">Lee propuestas reales una a una, sin saber de qué partido son, y di si te convencen. Al final verás con qué programa coincides más y quién firmaba cada propuesta.</p>
<p class="juego__aviso"><span class="casilla casilla--pequena" aria-hidden="true"></span>Con los programas de ${j.anio}. Lo actualizaremos con los de 2026.</p>
<noscript><p class="juego__noscript">El test necesita JavaScript para funcionar: actívalo en tu navegador y vuelve a cargar la página. Nada sale de tu móvil: las respuestas se calculan en tu navegador y no se envían a ningún sitio.</p></noscript>
<ul class="garantias juego__garantias">
<li><span class="casilla marcada" aria-hidden="true"></span><span><strong>Sin registro.</strong> No te pedimos nada.</span></li>
<li><span class="casilla marcada" aria-hidden="true"></span><span><strong>Nada sale de tu móvil.</strong> El resultado se calcula aquí y se borra al cerrar la pestaña.</span></li>
<li><span class="casilla marcada" aria-hidden="true"></span><span><strong>Cada propuesta, con su página.</strong> Al final ves la frase del programa y puedes abrirlo en esa página.</span></li>
</ul>
<p class="mas"><a href="/metodo/">Cómo hemos elegido y escrito las propuestas</a></p>
</div>
</div>
<p class="solo-lector" id="anuncio" aria-live="polite"></p>
<div class="definicion" id="definicion" role="dialog" aria-modal="false" aria-labelledby="definicion-termino" hidden>
<p class="definicion__termino" id="definicion-termino"></p>
<p class="definicion__texto" id="definicion-texto"></p>
<button type="button" class="definicion__cerrar">Cerrar</button>
</div>
</div>`,
  };
}

// Páginas de texto (privacidad…) con secciones y bloques, como las guías pero sin fuentes ni llamada al test.
export function texto(p, ctx) {
  const secciones = p.secciones.map((s, i) => {
    const id = `seccion-${i + 1}`;
    return `<section class="guia__seccion" aria-labelledby="${id}">
<h2 id="${id}">${esc(s.titulo)}</h2>
${s.bloques.map(b => bloque(b, ctx)).join('\n')}
</section>`;
  }).join('\n');
  const pendientes = (p.pendiente || []).map(x => `<!-- PENDIENTE: ${x.replace(/--/g, '—')} -->`).join('\n');
  return {
    ruta: p.ruta,
    titulo: p.tituloSeo,
    descripcion: p.descripcion,
    actualizado: p.actualizado,
    miga: [INICIO, { texto: p.titulo, ruta: p.ruta }],
    contenido: `<article class="envoltorio texto guia">
${miga([INICIO, { texto: p.titulo, ruta: p.ruta }])}
<header class="guia__cabeza">
<h1>${esc(p.titulo)}</h1>
<p class="entradilla">${enlinea(p.entradilla)}</p>
</header>
${secciones}
<p class="fuentes__fecha">Actualizado el <time datetime="${p.actualizado}">${textoFecha(p.actualizado, null, true)}</time></p>
${pendientes}
</article>`,
  };
}

export function pronto(p, ctx) {
  return {
    ruta: p.ruta,
    titulo: `${p.titulo}, muy pronto`,
    descripcion: p.descripcion,
    indexar: false,
    contenido: `<div class="envoltorio texto">
${miga([INICIO, { texto: p.titulo, ruta: p.ruta }])}
<p class="etiqueta"><span class="casilla casilla--pequena" aria-hidden="true"></span>Muy pronto</p>
<h1>${esc(p.titulo)}</h1>
<p class="entradilla">${esc(p.texto)}</p>
<section class="bloque" aria-labelledby="mientras">
<h2 id="mientras">Mientras tanto</h2>
${tarjetasGuias(ctx.guias)}
<p class="mas"><a href="/calendario/">Ver el calendario electoral</a></p>
<p>¿Dudas o correcciones? Escríbenos a <a href="mailto:${ctx.sitio.correo}">${ctx.sitio.correo}</a>.</p>
</section>
</div>`,
  };
}

export function error404(ctx) {
  return {
    ruta: '/404.html',
    titulo: 'Página no encontrada',
    descripcion: 'Esta página no existe en No sé qué votar. Vuelve al inicio o consulta las guías para votar.',
    indexar: false,
    canonico: false,
    contenido: `<div class="envoltorio texto">
<p class="etiqueta"><span class="casilla casilla--pequena marcada" aria-hidden="true"></span>Error 404</p>
<h1>Esta página no existe</h1>
<p class="entradilla">Puede que el enlace esté mal escrito o que la página haya cambiado de sitio.</p>
<div class="botones"><a class="boton" href="/">Ir al inicio</a></div>
<section class="bloque" aria-labelledby="quizas">
<h2 id="quizas">Quizá buscabas</h2>
${tarjetasGuias(ctx.guias)}
<p class="mas"><a href="/calendario/">Ver el calendario electoral</a></p>
</section>
</div>`,
  };
}
