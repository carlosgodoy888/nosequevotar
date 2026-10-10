// Parciales reutilizables: cabecera, pie, miga de pan, bloques comunes de las guías.
import { esc, textoFecha } from './util.mjs';

const esPronto = (sitio, ruta) => sitio.pronto.some(p => p.ruta === ruta);

function actual(rutaPagina, ruta) {
  if (rutaPagina === ruta) return ' aria-current="page"';
  if (ruta !== '/' && rutaPagina.startsWith(ruta)) return ' aria-current="true"';
  return '';
}

function enlaceMenu(sitio, rutaPagina, item, clase) {
  const pronto = esPronto(sitio, item.ruta);
  return `<a class="${clase}${pronto ? ` ${clase}--pronto` : ''}" href="${item.ruta}"${actual(rutaPagina, item.ruta)}>${esc(item.texto)}${pronto ? ' <span class="pronto">pronto</span>' : ''}</a>`;
}

export function cabecera(sitio, rutaPagina) {
  const enlaces = sitio.menu.map(m => `<li>${enlaceMenu(sitio, rutaPagina, m, 'menu__enlace')}</li>`).join('\n');
  return `<header class="cabecera">
<div class="envoltorio cabecera__barra">
<a class="marca" href="/"><span class="casilla casilla--pequena marcada" aria-hidden="true"></span>${esc(sitio.nombre)}</a>
<button class="menu-boton" type="button" aria-expanded="false" aria-controls="menu" data-evento="clic_menu"><span class="menu-boton__icono" aria-hidden="true"></span><span class="menu-boton__texto">Menú</span></button>
<nav class="menu" id="menu" aria-label="Principal">
<ul class="menu__lista">
${enlaces}
</ul>
</nav>
</div>
</header>`;
}

export function pie(sitio) {
  const secciones = sitio.menu.filter(m => !sitio.pie.some(p => p.ruta === m.ruta));
  const lista = (items) => items.map(m => `<li>${enlaceMenu(sitio, '', m, 'pie__enlace')}</li>`).join('\n');
  return `<footer class="pie">
<div class="envoltorio">
<nav aria-label="Secciones"><ul class="pie__lista">
${lista(secciones)}
</ul></nav>
<nav aria-label="Información"><ul class="pie__lista">
${lista(sitio.pie)}
</ul></nav>
<p class="pie__contacto">Contacto: <a class="pie__enlace" href="mailto:${sitio.correo}">${sitio.correo}</a></p>
<p class="pie__lema"><span class="casilla casilla--pequena marcada" aria-hidden="true"></span>Proyecto independiente, sin vinculación con ningún partido.</p>
</div>
</footer>`;
}

// miga: [{ texto, ruta }]; el último elemento es la página actual.
export function miga(items) {
  const lis = items.map((m, i) => i === items.length - 1
    ? `<li><span aria-current="page">${esc(m.texto)}</span></li>`
    : `<li><a href="${m.ruta}">${esc(m.texto)}</a></li>`).join('');
  return `<nav class="miga" aria-label="Miga de pan"><ol>${lis}</ol></nav>`;
}

export function llamadaTest() {
  return `<section class="llamada" aria-labelledby="llamada-titulo">
<h2 id="llamada-titulo">¿Y tú con qué propuestas coincides?</h2>
<p>Lee propuestas reales sin saber de qué partido son y descubre al final quién firmaba cada una.</p>
<a class="boton" href="/test/" data-evento="clic_hacer_test">Haz el test sin siglas</a>
</section>`;
}

export function fuentesOficiales(fuentes, actualizado) {
  const items = fuentes.map(f => f.url
    ? `<li><a href="${esc(f.url)}" rel="external" data-evento="clic_fuente">${esc(f.texto)}</a></li>`
    : `<li>${esc(f.texto)}</li>`).join('\n');
  return `<section class="fuentes" aria-labelledby="fuentes-titulo">
<h2 id="fuentes-titulo">Fuente oficial</h2>
<ul>
${items}
</ul>
<p class="fuentes__fecha">Actualizado el <time datetime="${actualizado}">${textoFecha(actualizado, null, true)}</time></p>
</section>`;
}

export function otrasGuias(guias, actualSlug) {
  const items = guias.filter(g => g.slug !== actualSlug).map(g =>
    `<li><a href="/guia/${g.slug}/" data-evento="clic_guia">${esc(g.nombre)}</a></li>`).join('\n');
  return `<nav class="otras" aria-labelledby="otras-titulo">
<h2 id="otras-titulo">Otras guías</h2>
<ul>
${items}
</ul>
</nav>`;
}
