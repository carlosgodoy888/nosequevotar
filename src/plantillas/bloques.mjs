// Bloques de contenido de las guías: párrafo, lista, pasos, aviso, caja, tabla y fechas.
import { esc, enlinea, textoFecha, estados, ROTULO_ESTADO, atributosPeriodo } from './util.mjs';

export function bloque(b, ctx) {
  const periodo = atributosPeriodo(b, ctx.hoy);
  switch (b.tipo) {
    case 'parrafo':
      return `<p${periodo}>${enlinea(b.texto)}</p>`;
    case 'lista':
      return `<ul class="lista"${periodo}>${b.items.map(i => `<li>${enlinea(i)}</li>`).join('')}</ul>`;
    case 'pasos':
      return `<ol class="pasos"${periodo}>
${b.items.map((p, i) => `<li class="paso"><span class="paso__numero" aria-hidden="true">${i + 1}</span><div><h3>${esc(p.titulo)}</h3><p>${enlinea(p.texto)}</p></div></li>`).join('\n')}
</ol>`;
    case 'aviso':
      return `<div class="aviso-caja"${periodo}><h3><span class="aviso-caja__signo" aria-hidden="true">!</span>${esc(b.titulo)}</h3><p>${enlinea(b.texto)}</p></div>`;
    case 'caja':
      return `<div class="caja"${periodo}><h3>${esc(b.titulo)}</h3>${b.texto ? `<p>${enlinea(b.texto)}</p>` : ''}${b.items ? `<ul class="lista">${b.items.map(i => `<li>${enlinea(i)}</li>`).join('')}</ul>` : ''}</div>`;
    case 'tabla':
      return tabla(b, periodo);
    case 'fechas':
      return tablaFechas(resolverFechas(b.filas, ctx.fechas), ctx, { periodo });
    default:
      throw new Error(`Tipo de bloque desconocido: «${b.tipo}»`);
  }
}

// Tabla comparativa. La primera columna es la cabecera de cada fila.
// En móvil cada fila se convierte en una tarjeta (ver .tabla en el CSS).
function tabla(b, periodo) {
  const [primera, ...resto] = b.columnas;
  const cabeza = `<tr role="row"><th scope="col" role="columnheader">${esc(primera)}</th>${resto.map(c => `<th scope="col" role="columnheader">${esc(c)}</th>`).join('')}</tr>`;
  const filas = b.filas.map(f => {
    const [cab, ...celdas] = f;
    return `<tr role="row"><th scope="row" role="rowheader">${enlinea(cab)}</th>${celdas.map((c, i) => `<td role="cell" data-etiqueta="${esc(resto[i])}">${enlinea(c)}</td>`).join('')}</tr>`;
  }).join('\n');
  return `<div class="tabla-marco"${periodo}><table class="tabla" role="table">
<caption>${esc(b.titulo)}</caption>
<thead role="rowgroup">${cabeza}</thead>
<tbody role="rowgroup">
${filas}
</tbody>
</table></div>`;
}

// Las filas de un bloque de fechas pueden citar el calendario común por id
// (y cambiar su texto) o traer su propia fecha.
export function resolverFechas(filas, fechas) {
  return filas.map(f => {
    if (!f.id) return f;
    const base = fechas.find(x => x.id === f.id);
    if (!base) throw new Error(`No existe la fecha «${f.id}» en fechas.json`);
    return { ...base, ...f };
  });
}

// «Fuente: ley electoral, artículo 47», con enlace al BOE. Solo si la fecha la trae.
export function fuenteFecha(f) {
  if (!f.fuentes || !f.fuentes.length) return '';
  const enlaces = f.fuentes.map(x => `<a href="${esc(x.url)}" rel="external" data-evento="clic_fuente">${esc(x.texto)}</a>`).join(' y ');
  return ` <span class="fuente-fecha">Fuente: ${enlaces}.</span>`;
}

// Tabla de fechas con su estado (pasada, ahora, próxima). sitio.js lo recalcula en el navegador.
export function tablaFechas(filas, ctx, { periodo = '', titulo = 'Fechas', enlacesGuia = false } = {}) {
  const est = estados(filas, ctx.hoy);
  const trs = filas.map((f, i) => {
    const e = est[i];
    const guia = enlacesGuia && f.guia ? ctx.guias.find(g => g.slug === f.guia) : null;
    const enlace = guia ? ` <a href="/guia/${guia.slug}/" data-evento="clic_guia">Guía: ${esc(guia.nombre.toLowerCase())}</a>` : '';
    // Las fechas anteriores al calendario electoral (el cierre del censo) llevan el año.
    const anio = f.inicio < ctx.fechas[0].inicio;
    return `<tr role="row" class="fila-fecha${e ? ` es-${e}` : ''}" data-inicio="${f.inicio}"${f.fin ? ` data-fin="${f.fin}"` : ''}>` +
      `<th scope="row" role="rowheader"><time datetime="${f.inicio}">${textoFecha(f.inicio, f.fin, anio)}</time></th>` +
      `<td role="cell">${enlinea(f.texto)}${enlace}${fuenteFecha(f)}</td>` +
      `<td role="cell" class="fila-fecha__estado">${e ? ROTULO_ESTADO[e] : ''}</td></tr>`;
  }).join('\n');
  return `<div class="tabla-marco"${periodo}><table class="fechas-tabla" role="table">
<caption class="solo-lector">${esc(titulo)}</caption>
<thead role="rowgroup" class="solo-lector"><tr role="row"><th scope="col" role="columnheader">Fecha</th><th scope="col" role="columnheader">Qué pasa</th><th scope="col" role="columnheader">Estado</th></tr></thead>
<tbody role="rowgroup">
${trs}
</tbody>
</table></div>`;
}
