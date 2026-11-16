// Imagen y texto para compartir el resultado. La imagen se dibuja con canvas y las tipografías de la web,
// sin librerías. No lleva la provincia ni ningún dato de quien hace el test: solo el resultado, los temas
// elegidos y la dirección de la web. El enlace lleva a la portada.

export const URL_WEB = 'https://nosequevotar.es/';
export const FORMATOS = { cuadrada: { ancho: 1080, alto: 1350 }, historia: { ancho: 1080, alto: 1920 } };

const TINTA = '#16181D';
const PAPEL = '#FFFFFF';
const SEPIA = '#EFE3C8';
const GRIS = '#5D636B';
const REGLA = '#C9CCD1';
const SANS = '"Archivo", system-ui, sans-serif';
const SERIF = '"Source Serif 4", Georgia, serif';
const DURO = String.fromCharCode(160);

// Espera a que estén las tipografías propias (preload en la cabecera) antes de dibujar.
export async function tipografiasListas() {
  if (!document.fonts) return;
  await Promise.all([
    document.fonts.load(`900 64px ${SANS}`), document.fonts.load(`700 32px ${SANS}`), document.fonts.load(`500 32px ${SANS}`), document.fonts.load(`400 40px ${SERIF}`),
  ]).catch(() => {});
  await document.fonts.ready;
}

function lineas(ctx, texto, ancho) {
  const res = [];
  let actual = '';
  for (const p of texto.split(/\s+/)) {
    const prueba = actual ? `${actual} ${p}` : p;
    if (ctx.measureText(prueba).width > ancho && actual) { res.push(actual); actual = p; } else actual = prueba;
  }
  if (actual) res.push(actual);
  return res;
}

// Escribe un texto en varias líneas (como mucho maxLineas, con puntos suspensivos) y devuelve la y siguiente.
function escribir(ctx, texto, x, y, ancho, alto, maxLineas) {
  let ls = lineas(ctx, texto, ancho);
  if (maxLineas && ls.length > maxLineas) {
    ls = ls.slice(0, maxLineas);
    let ultima = ls.at(-1);
    while (ctx.measureText(`${ultima}…`).width > ancho && ultima.includes(' ')) ultima = ultima.slice(0, ultima.lastIndexOf(' '));
    ls[ls.length - 1] = `${ultima.replace(/(?:[,.;:]| y)$/, '')}…`;
  }
  ls.forEach((l, i) => ctx.fillText(l, x, y + i * alto));
  return y + ls.length * alto;
}

// El tamaño de letra más grande, entre dos límites, con el que el texto cabe en las líneas pedidas.
function ajustar(ctx, texto, ancho, fuente, maximo, minimo, maxLineas) {
  let cuerpo = maximo;
  for (; cuerpo > minimo; cuerpo -= 2) {
    ctx.font = fuente(cuerpo);
    if (lineas(ctx, texto, ancho).length <= maxLineas) break;
  }
  ctx.font = fuente(cuerpo);
  return cuerpo;
}

// La casilla marcada de la web: un cuadrado con un aspa.
function casilla(ctx, x, y, lado, grosor) {
  ctx.strokeStyle = TINTA; ctx.lineWidth = grosor; ctx.lineCap = 'butt';
  ctx.strokeRect(x + grosor / 2, y + grosor / 2, lado - grosor, lado - grosor);
  const m = lado * 0.24;
  ctx.beginPath(); ctx.moveTo(x + m, y + m); ctx.lineTo(x + lado - m, y + lado - m); ctx.moveTo(x + lado - m, y + m); ctx.lineTo(x + m, y + lado - m); ctx.stroke();
}

function listaNombres(nombres) {
  if (nombres.length <= 1) return nombres.join('');
  return `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}`;
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {Object} datos { formato: 'cuadrada' | 'historia', anio, filas: [{ nombre, porcentaje, porcentajeTexto, primero }], temas: [nombres] }
 */
export async function dibujar(canvas, datos) {
  await tipografiasListas();
  const { ancho, alto } = FORMATOS[datos.formato] || FORMATOS.cuadrada;
  const historia = datos.formato === 'historia';
  canvas.width = ancho; canvas.height = alto;
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'alphabetic';

  // Mesa sepia y hoja blanca con filete, como las papeletas de la web.
  ctx.fillStyle = SEPIA; ctx.fillRect(0, 0, ancho, alto);
  const m = 44;
  const arriba = historia ? 150 : m;
  const abajo = historia ? 190 : m;
  ctx.fillStyle = PAPEL; ctx.fillRect(m, arriba, ancho - 2 * m, alto - arriba - abajo);
  ctx.strokeStyle = TINTA; ctx.lineWidth = 4; ctx.strokeRect(m, arriba, ancho - 2 * m, alto - arriba - abajo);

  const x = m + 56;
  const util = ancho - 2 * x;
  const fin = alto - abajo;
  let y = arriba + 92;

  // Cabecera: marca a la izquierda, elecciones a la derecha.
  casilla(ctx, x, y - 34, 40, 5);
  ctx.fillStyle = TINTA; ctx.font = `800 34px ${SANS}`; ctx.textAlign = 'left';
  ctx.fillText('No sé qué votar', x + 56, y);
  ctx.fillStyle = GRIS; ctx.font = `500 26px ${SANS}`; ctx.textAlign = 'right';
  ctx.fillText(`Elecciones generales ${datos.anio}`, x + util, y - 2);
  ctx.textAlign = 'left';
  y += 34;
  ctx.fillStyle = TINTA; ctx.fillRect(x, y, util, 4);

  // Titular.
  const primeros = datos.filas.filter(f => f.primero).map(f => f.nombre);
  y += historia ? 104 : 86;
  ctx.fillStyle = GRIS; ctx.font = `700 34px ${SANS}`;
  ctx.fillText('Mi resultado en el test sin siglas', x, y);
  y += historia ? 96 : 84;
  ctx.fillStyle = TINTA;
  const titular = primeros.length ? `Encajo más con ${listaNombres(primeros)}` : 'No encajo con ninguna candidatura';
  const cuerpo = ajustar(ctx, titular, util, c => `900 ${c}px ${SANS}`, historia ? 92 : 84, 50, 3);
  y = escribir(ctx, titular, x, y, util, cuerpo * 1.08, 3);

  // Pie: se reserva antes de pintar las filas para saber cuántas caben.
  const altoPie = 214;
  const yPie = fin - altoPie;

  // Filas: nombre, porcentaje (de −100 a +100) y barra. La barra solo enseña la afinidad positiva:
  // con cero o menos se queda vacía y habla la cifra.
  y += historia ? 36 : 0;
  const altoFila = historia ? 132 : 104;
  const caben = Math.max(1, Math.floor((yPie - y - 90) / altoFila));
  const filas = datos.filas.slice(0, Math.min(caben, historia ? 8 : 5));
  for (const f of filas) {
    y += altoFila;
    ctx.fillStyle = TINTA; ctx.textAlign = 'right'; ctx.font = `900 46px ${SANS}`;
    const pct = f.porcentajeTexto.replace(' ', DURO);
    ctx.fillText(pct, x + util, y - 34);
    const anchoPct = ctx.measureText(pct).width;
    ctx.textAlign = 'left';
    ajustar(ctx, f.nombre, util - anchoPct - 32, c => `800 ${c}px ${SANS}`, 42, 28, 1);
    escribir(ctx, f.nombre, x, y - 34, util - anchoPct - 32, 46, 1);
    ctx.fillStyle = REGLA; ctx.fillRect(x, y - 14, util, 14);
    if (f.porcentaje > 0) { ctx.fillStyle = TINTA; ctx.fillRect(x, y - 14, Math.max(6, (util * Math.min(100, f.porcentaje)) / 100), 14); }
  }
  if (datos.filas.length > filas.length) {
    y += 48;
    ctx.fillStyle = GRIS; ctx.font = `500 26px ${SANS}`;
    ctx.fillText(`y ${datos.filas.length - filas.length} ${datos.filas.length - filas.length === 1 ? 'candidatura' : 'candidaturas'} más`, x, y);
  }

  // Temas elegidos.
  y += 62;
  if (y < yPie - 20) {
    ctx.fillStyle = GRIS; ctx.font = `500 28px ${SANS}`;
    const temas = `En ${datos.temas.length} temas: ${listaNombres(datos.temas.map(t => t.toLowerCase()))}.`;
    escribir(ctx, temas, x, y, util, 38, Math.max(1, Math.min(3, Math.floor((yPie - y) / 38))));
  }

  // Pie: qué es, la dirección y el aviso.
  ctx.fillStyle = TINTA; ctx.fillRect(x, yPie, util, 4);
  ctx.fillStyle = TINTA;
  ajustar(ctx, 'Medidas reales de los programas, votadas sin saber de qué partido son.', util, c => `400 ${c}px ${SERIF}`, 30, 22, 1);
  const yp = escribir(ctx, 'Medidas reales de los programas, votadas sin saber de qué partido son.', x, yPie + 56, util, 40, 1);
  ctx.font = `900 50px ${SANS}`;
  ctx.fillText('nosequevotar.es', x, yp + 48);
  ctx.fillStyle = GRIS; ctx.font = `500 26px ${SANS}`; ctx.textAlign = 'right';
  ctx.fillText('No es un consejo de voto', x + util, yp + 44);
  ctx.textAlign = 'left';

  // En las historias, una invitación fuera de la hoja.
  if (historia) {
    ctx.fillStyle = TINTA; ctx.font = `800 40px ${SANS}`; ctx.textAlign = 'center';
    ctx.fillText('¿Y tú con quién encajas?', ancho / 2, 104);
    ctx.font = `700 34px ${SANS}`;
    ctx.fillText('Haz el test en nosequevotar.es', ancho / 2, alto - 104);
    ctx.textAlign = 'left';
  }
}

// Texto para acompañar la imagen o para enviar solo. Nombra a las primeras candidaturas con afinidad
// positiva (las que recibe, tres como mucho); si no hay ninguna, lo dice.
export function textoResultado(filas, empatadasEnCabeza = 1) {
  const lista = filas.map(f => `${f.nombre} (${f.porcentajeTexto.replace(' ', DURO)})`);
  const cabeza = empatadasEnCabeza > 1 ? 'Mis primeras candidaturas' : 'Con quien más encajo';
  const resultado = lista.length ? `${cabeza}: ${listaNombres(lista)}.` : 'No encajo con ninguna candidatura.';
  return `He hecho el test sin siglas de No sé qué votar: votas medidas reales de los programas sin saber de qué partido son. ${resultado} No es un consejo de voto. Haz el tuyo: ${URL_WEB}`;
}

const aBlob = (canvas) => new Promise((ok, mal) => canvas.toBlob(b => (b ? ok(b) : mal(new Error('No se pudo crear la imagen'))), 'image/png'));

export async function descargar(canvas, nombre) {
  const blob = await aBlob(canvas);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nombre;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return 'descargada';
}

// Comparte la imagen con su texto si el dispositivo lo permite; si no, la descarga.
export async function compartir(canvas, nombre, texto) {
  const blob = await aBlob(canvas);
  const archivo = new File([blob], nombre, { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
    try {
      await navigator.share({ files: [archivo], text: texto });
      return 'compartida';
    } catch (e) {
      if (e.name === 'AbortError') return 'cancelada';
    }
  }
  return descargar(canvas, nombre);
}

// Copia al portapapeles si el navegador lo permite. Si no responde en un segundo y medio
// (algunos navegadores se quedan esperando un permiso), devuelve false y se selecciona el texto.
export async function copiar(texto) {
  if (!navigator.clipboard || !window.isSecureContext) return false;
  const espera = new Promise(ok => setTimeout(() => ok(false), 1500));
  try {
    return await Promise.race([navigator.clipboard.writeText(texto).then(() => true), espera]);
  } catch {
    return false;
  }
}

export const enlaceWhatsApp = (texto) => `https://wa.me/?text=${encodeURIComponent(texto)}`;
