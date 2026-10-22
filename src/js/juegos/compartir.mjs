// Imagen para compartir, dibujada con canvas y las tipografías de la web, sin librerías.
// Nada de datos personales ni de la provincia: solo la frase, los datos elegidos y la dirección.

export const URL_TEST = 'https://nosequevotar.es/test/';
export const FORMATOS = { vertical: { ancho: 1080, alto: 1920 }, horizontal: { ancho: 1200, alto: 630 } };

const TINTA = '#16181D';
const PAPEL = '#FFFFFF';
const SEPIA = '#EFE3C8';
const GRIS = '#5D636B';
const SANS = '"Archivo", system-ui, sans-serif';
const SERIF = '"Source Serif 4", Georgia, serif';

// Espera a que estén las tipografías propias (preload en la cabecera) antes de dibujar.
export async function tipografiasListas() {
  if (!document.fonts) return;
  await Promise.all([
    document.fonts.load(`900 64px ${SANS}`), document.fonts.load(`700 32px ${SANS}`), document.fonts.load(`400 40px ${SERIF}`),
  ]).catch(() => {});
  await document.fonts.ready;
}

function lineas(ctx, texto, ancho) {
  const palabras = texto.split(/\s+/);
  const res = [];
  let actual = '';
  for (const p of palabras) {
    const prueba = actual ? `${actual} ${p}` : p;
    if (ctx.measureText(prueba).width > ancho && actual) { res.push(actual); actual = p; } else actual = prueba;
  }
  if (actual) res.push(actual);
  return res;
}

function escribir(ctx, texto, x, y, ancho, alto, maxLineas) {
  let ls = lineas(ctx, texto, ancho);
  if (maxLineas && ls.length > maxLineas) {
    ls = ls.slice(0, maxLineas);
    let ultima = ls.at(-1);
    while (ctx.measureText(`${ultima}…`).width > ancho && ultima.includes(' ')) ultima = ultima.slice(0, ultima.lastIndexOf(' '));
    ls[ls.length - 1] = `${ultima}…`;
  }
  ls.forEach((l, i) => ctx.fillText(l, x, y + i * alto));
  return y + ls.length * alto;
}

// Palotes agrupados de cinco: cuatro verticales y uno que los cruza.
function palotes(ctx, n, x, y, alto, grosor) {
  const paso = alto * 0.32;
  let cx = x;
  for (let resto = n; resto > 0; resto -= 5) {
    const k = Math.min(5, resto);
    const verticales = k === 5 ? 4 : k;
    ctx.lineWidth = grosor;
    ctx.strokeStyle = TINTA;
    for (let i = 0; i < verticales; i++) {
      ctx.beginPath(); ctx.moveTo(cx + i * paso, y); ctx.lineTo(cx + i * paso, y + alto); ctx.stroke();
    }
    if (k === 5) { ctx.beginPath(); ctx.moveTo(cx - paso * 0.4, y + alto * 0.8); ctx.lineTo(cx + paso * 3.4, y + alto * 0.2); ctx.stroke(); }
    cx += paso * 4 + paso * 1.6;
  }
}

function marco(ctx, ancho, alto, escala) {
  ctx.fillStyle = SEPIA; ctx.fillRect(0, 0, ancho, alto);
  const m = 48 * escala;
  ctx.fillStyle = PAPEL; ctx.fillRect(m, m, ancho - 2 * m, alto - 2 * m);
  ctx.strokeStyle = TINTA; ctx.lineWidth = 3 * escala; ctx.strokeRect(m, m, ancho - 2 * m, alto - 2 * m);
  return m;
}

// Aviso y dirección en una línea si caben; si no, el aviso encima de la dirección.
function pie(ctx, ancho, alto, m, escala, anio) {
  const x = m + 40 * escala;
  const util = ancho - 2 * x;
  const aviso = `Programas de ${anio} · No es un consejo de voto`;
  const fuenteAviso = `500 ${26 * escala}px ${SANS}`;
  const fuenteDominio = `800 ${30 * escala}px ${SANS}`;
  ctx.font = fuenteAviso; const anchoAviso = ctx.measureText(aviso).width;
  ctx.font = fuenteDominio; const anchoDominio = ctx.measureText('nosequevotar.es').width;
  const unaLinea = anchoAviso + anchoDominio + 32 * escala <= util;
  const y = alto - m - 56 * escala;
  const yAviso = unaLinea ? y : y - 44 * escala;
  ctx.fillStyle = TINTA; ctx.fillRect(x, yAviso - 34 * escala, util, 2 * escala);
  ctx.font = fuenteAviso; ctx.fillStyle = GRIS; ctx.textAlign = 'left';
  ctx.fillText(aviso, x, yAviso + 6 * escala);
  ctx.font = fuenteDominio; ctx.fillStyle = TINTA; ctx.textAlign = unaLinea ? 'right' : 'left';
  ctx.fillText('nosequevotar.es', unaLinea ? x + util : x, y + 6 * escala);
  ctx.textAlign = 'left';
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {Object} datos { tipo: 'resultado' | 'favorita', formato, frase, anio, filas: [{ nombre, porcentajeTexto, x }], texto }
 */
export async function dibujar(canvas, datos) {
  await tipografiasListas();
  const anio = datos.anio || 2023;
  const { ancho, alto } = FORMATOS[datos.formato];
  canvas.width = ancho; canvas.height = alto;
  const ctx = canvas.getContext('2d');
  const vertical = datos.formato === 'vertical';
  const escala = vertical ? 1.25 : 0.82;
  const m = marco(ctx, ancho, alto, escala);
  const x = m + 40 * escala;
  const util = ancho - 2 * x;
  let y = m + (vertical ? 120 : 64) * escala;

  ctx.fillStyle = TINTA; ctx.font = `700 ${24 * escala}px ${SANS}`;
  ctx.fillText(datos.tipo === 'resultado' ? 'Test sin siglas · nosequevotar.es' : 'Mi propuesta favorita del test sin siglas', x, y);
  y += 56 * escala;

  if (datos.tipo === 'resultado') {
    ctx.font = `900 ${(vertical ? 64 : 50) * escala}px ${SANS}`;
    y = escribir(ctx, datos.frase, x, y + 20 * escala, util, (vertical ? 72 : 56) * escala, 4) + 40 * escala;
    for (const f of datos.filas) {
      ctx.fillStyle = TINTA; ctx.fillRect(x, y, util, 2 * escala);
      y += (vertical ? 70 : 52) * escala;
      ctx.font = `800 ${(vertical ? 44 : 36) * escala}px ${SANS}`; ctx.textAlign = 'left';
      ctx.fillText(f.nombre, x, y);
      ctx.textAlign = 'right';
      ctx.fillText(f.porcentajeTexto.replace(' ', ' '), x + util, y);
      ctx.textAlign = 'left';
      y += 20 * escala;
      palotes(ctx, f.x, x, y, (vertical ? 44 : 30) * escala, 4 * escala);
      y += (vertical ? 70 : 46) * escala;
    }
  } else {
    ctx.font = `400 ${(vertical ? 56 : 42) * escala}px ${SERIF}`;
    y = escribir(ctx, `«${datos.texto}»`, x, y + 30 * escala, util, (vertical ? 78 : 58) * escala, vertical ? 14 : 5) + 30 * escala;
    ctx.font = `500 ${26 * escala}px ${SANS}`; ctx.fillStyle = GRIS;
    escribir(ctx, `Una propuesta real de un programa de ${anio}. El partido se ve al hacer el test.`, x, y + 10 * escala, util, 36 * escala, 2);
  }
  pie(ctx, ancho, alto, m, escala, anio);
}

export function textoResultado(filas, anio = 2023) {
  const lista = filas.map(f => `${f.nombre} (${f.porcentajeTexto.replace(' ', ' ')})`);
  const unidos = lista.length > 1 ? `${lista.slice(0, -1).join(', ')} y ${lista.at(-1)}` : lista[0];
  return `En el test sin siglas, coincido más con el programa de ${anio} de ${unidos}. No es un consejo de voto. ${URL_TEST}`;
}

export function textoFavorita(texto) {
  return `Mi propuesta favorita del test sin siglas: «${texto}» ${URL_TEST}`;
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

// Comparte la imagen si el dispositivo lo permite; si no, la descarga.
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
