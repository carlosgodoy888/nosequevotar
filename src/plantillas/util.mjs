// Utilidades compartidas por las plantillas: escape, formato en línea y fechas.

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function esc(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Formato en línea para el contenido: **negrita** y [texto](url).
// Los enlaces a otras guías llevan clic_guia y los externos, clic_fuente.
export function enlinea(texto) {
  return esc(texto)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, url) => {
      const evento = url.startsWith('/guia/') ? ' data-evento="clic_guia"'
        : /^https?:/.test(url) ? ' data-evento="clic_fuente"' : '';
      return `<a href="${url}"${evento}>${t}</a>`;
    });
}

// «2026-10-12» → { dia: 12, mes: 'octubre', anio: 2026 }
function partes(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  return { dia: d, mes: MESES[m - 1], anio: a };
}

// «12 de octubre», «12 al 19 de octubre», «30 de octubre al 2 de noviembre».
// Con conAnio añade el año al final: «1 de agosto de 2026».
export function textoFecha(inicio, fin, conAnio = false) {
  const a = partes(inicio);
  const anio = conAnio ? ` de ${a.anio}` : '';
  if (!fin || fin === inicio) return `${a.dia} de ${a.mes}${anio}`;
  const b = partes(fin);
  if (a.mes === b.mes) return `${a.dia} al ${b.dia} de ${b.mes}${anio}`;
  return `${a.dia} de ${a.mes} al ${b.dia} de ${b.mes}${anio}`;
}

// Fecha de hoy en Madrid, en formato AAAA-MM-DD. Se puede fijar con FECHA_HOY.
export function hoyMadrid() {
  if (process.env.FECHA_HOY) return process.env.FECHA_HOY;
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date());
}

// Estado de cada fila de un calendario: «pasada», «ahora», «proxima» o «».
// La próxima es la primera fila que aún no ha empezado, salvo que haya alguna en curso.
// La misma regla está en sitio.js para recalcularla en el navegador.
export function estados(filas, hoy) {
  const res = filas.map(f => {
    const fin = f.fin || f.inicio;
    if (fin < hoy) return 'pasada';
    if (f.inicio <= hoy) return 'ahora';
    return '';
  });
  if (!res.includes('ahora')) {
    const i = res.indexOf('');
    if (i >= 0) res[i] = 'proxima';
  }
  return res;
}

export const ROTULO_ESTADO = { pasada: 'Ya pasó', ahora: 'Ahora', proxima: 'Próxima' };

// ¿Se ve hoy un bloque con desde/hasta (ambos incluidos)?
export function visible(bloque, hoy) {
  if (bloque.desde && hoy < bloque.desde) return false;
  if (bloque.hasta && hoy > bloque.hasta) return false;
  return true;
}

// Atributos de un bloque que depende de la fecha: sitio.js los vuelve a evaluar.
export function atributosPeriodo(bloque, hoy) {
  if (!bloque.desde && !bloque.hasta) return '';
  let a = '';
  if (bloque.desde) a += ` data-desde="${bloque.desde}"`;
  if (bloque.hasta) a += ` data-hasta="${bloque.hasta}"`;
  if (!visible(bloque, hoy)) a += ' hidden';
  return a;
}

export function diasHasta(fechaIso, hoy) {
  return Math.round((Date.parse(fechaIso) - Date.parse(hoy)) / 86400000);
}
