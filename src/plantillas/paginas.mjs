// Una función por tipo de página. Cada una devuelve { ruta, titulo, descripcion, contenido, miga, ... }
// que luego se envuelve con la plantilla base.
import { esc, enlinea, textoFecha, atributosPeriodo, diasHasta, estados } from './util.mjs';
import { miga, llamadaTest, fuentesOficiales, otrasGuias } from './parciales.mjs';
import { bloque, tablaFechas } from './bloques.mjs';

const INICIO = { texto: 'Inicio', ruta: '/' };
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

function tarjetasGuias(guias) {
  return `<ul class="tarjetas">
${guias.map(g => `<li><a class="tarjeta-enlace" href="/guia/${g.slug}/" data-evento="clic_guia"><span class="tarjeta-enlace__titulo">${esc(g.nombre)}</span><span class="tarjeta-enlace__texto">${esc(g.resumen)}</span></a></li>`).join('\n')}
</ul>`;
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
    descripcion: 'Guías cortas para votar en las elecciones generales del 29 de noviembre de 2026: voto por correo, dónde votar, voto en blanco, cómo se vota y censo.',
    miga: [INICIO, { texto: 'Guías', ruta }],
    contenido: `<div class="envoltorio texto">
${miga([INICIO, { texto: 'Guías', ruta }])}
<h1>Guías para votar</h1>
<p class="entradilla">Cinco guías cortas para votar el 29 de noviembre sin errores. Cada una responde a una pregunta y enlaza a la fuente oficial.</p>
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
    descripcion: 'Todas las fechas de las elecciones generales del 29 de noviembre de 2026: censo, voto por correo, candidaturas, campaña, jornada de reflexión y votación.',
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
    contenido: `<section class="envoltorio portada" aria-labelledby="titulo">
<div class="portada__texto">
<p class="etiqueta"><span class="casilla casilla--pequena" aria-hidden="true"></span>Elecciones generales · ${textoFecha(ctx.sitio.eleccion.fecha, null, true)}</p>
<h1 id="titulo">Todo lo que necesitas para votar, sin siglas.</h1>
<p class="entradilla">Guías cortas para votar sin errores y un test que te enseña propuestas reales sin decirte de qué partido son.</p>
${cuentaAtras(ctx)}
<div class="botones">
<a class="boton" href="/guia/" data-evento="clic_guia">Ver las guías para votar</a>
<a class="boton boton--claro" href="/test/" data-evento="clic_hacer_test">Haz el test sin siglas</a>
</div>
</div>
<div class="ejemplo" aria-labelledby="ejemplo-rotulo">
<p class="ejemplo__rotulo" id="ejemplo-rotulo">Así funciona el test. Pruébalo con un ejemplo; el partido es inventado.</p>
<article class="tarjeta" id="tarjeta">
<div class="tarjeta__cabeza"><span class="tarjeta__letra">B</span><span class="tarjeta__estado" id="estado" aria-live="polite"></span></div>
<p class="tarjeta__texto">Construir 200.000 viviendas públicas de alquiler en diez años sobre suelo del Estado.</p>
<button type="button" class="boton-casilla" id="convence" aria-pressed="false"><span class="casilla" aria-hidden="true"></span>Me convence</button>
<div class="firma">
<span class="firma__rotulo">La firmaba el</span>
<span class="franja" id="franja"><span class="franja__nombre" id="partido" aria-hidden="true">Partido Norte</span><span class="franja__tapa" aria-hidden="true"></span></span>
<span class="firma__fuente">Programa de ejemplo, página 14</span>
</div>
</article>
<button type="button" class="boton" id="revelar">Revelar quién la firmaba</button>
<p class="solo-lector" id="anuncio" aria-live="polite"></p>
</div>
</section>

<section class="seccion" aria-labelledby="guias-titulo">
<div class="envoltorio">
<h2 id="guias-titulo">Guías para votar</h2>
${tarjetasGuias(ctx.guias)}
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
<li class="paso"><span class="paso__numero" aria-hidden="true">1</span><div><h3>Lees sin nombres</h3><p>Ocho temas. En cada uno, varias propuestas de partidos distintos, sin logotipos ni colores.</p></div></li>
<li class="paso"><span class="paso__numero" aria-hidden="true">2</span><div><h3>Eliges</h3><p>Marcas la que te convence. Si ninguna te convence, también lo puedes decir.</p></div></li>
<li class="paso"><span class="paso__numero" aria-hidden="true">3</span><div><h3>Descubres quién era</h3><p>Te enseñamos quién firmaba cada propuesta, con la frase exacta del programa y su página.</p></div></li>
</ol>
<p class="mas"><a class="boton" href="/test/" data-evento="clic_hacer_test">Haz el test sin siglas</a></p>
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
