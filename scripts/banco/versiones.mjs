// Versión de cada programa de 2023 y enlace estable en Internet Archive.
//
//   node scripts/banco/versiones.mjs
//
// Para cada documento: SHA-256 del PDF local, páginas y fecha de modificación (pdfinfo), y capturas
// de su URL original entre mayo y julio de 2023 en el índice CDX de web.archive.org (si no hay
// ninguna, se buscan en el resto de 2023 y se marca fueraDeVentana).
// - Si una captura tiene el mismo SHA-256 que el archivo local, se usa el local con la URL de esa captura.
// - Si ninguna coincide pero hay capturas de 2023, se descarga la última a
//   datos-nosequevotar/fuentes/descargas/archivo-2023/ y se trabaja con ella.
// - Si no hay ninguna captura de 2023, termina con error: hay que decidir antes de usar ese documento,
//   salvo que la decisión ya esté tomada en SIN_CAPTURA_2023.
// Comprueba además que cada URL de captura (forma id_) devuelve el PDF tal cual (Content-Type application/pdf).
// Escribe datos/banco/versiones.json (rutas relativas a DATOS_DIR). Una petición cada vez, con pausa.

import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';
import { BANCO, ARCHIVO_2023, DATOS_DIR, PDFINFO, documentosRegistro, escribirJson, sha256, xpdf } from './comun.mjs';

const PAUSA_MS = 1500;
const DESDE = '20230501';
const HASTA = '20230731';
const AGENTE = 'nosequevotar-banco/1.0 (verificación de programas electorales; hola@nosequevotar.es)';

// Documentos sin captura de 2023 que se usan por decisión del responsable del proyecto (21 de octubre
// de 2026): el PDF local, enlazado a una captura posterior idéntica byte a byte.
const SIN_CAPTURA_2023 = {
  '2023-pp': {
    captura: '20250619072430',
    motivo: 'Internet Archive no guardó esta dirección hasta el 19 de junio de 2025, con contenido idéntico al archivo local. Las fechas internas del PDF son del 5 de julio de 2023 y su nombre interno es «AF LIBRO PROGRAMA_23J_FINAL_CORR_5J». La dirección de pp.es sirvió otro contenido el 14 de noviembre de 2025, por eso no se enlaza la original.',
  },
};

const esperar = (ms) => new Promise(r => setTimeout(r, ms));
let ultima = 0;

async function pedir(url) {
  for (let intento = 1; intento <= 4; intento++) {
    const espera = ultima + PAUSA_MS - Date.now();
    if (espera > 0) await esperar(espera);
    ultima = Date.now();
    try {
      const r = await fetch(url, { headers: { 'User-Agent': AGENTE }, redirect: 'follow' });
      if (r.ok) {
        const buf = Buffer.from(await r.arrayBuffer());
        buf.tipo = r.headers.get('content-type');
        return buf;
      }
      if (r.status !== 429 && r.status < 500) throw new Error(`HTTP ${r.status}`);
      console.log(`  · ${r.status} en ${url}; reintento ${intento}`);
    } catch (e) {
      if (intento === 4 || /^HTTP 4/.test(e.message)) throw new Error(`${url}: ${e.message}`);
      console.log(`  · ${e.message}; reintento ${intento}`);
    }
    await esperar(5000 * intento);
  }
  throw new Error(`${url}: sin respuesta`);
}

// El índice CDX identifica el contenido con el SHA-1 en base32.
function sha1Base32(buf) {
  const bytes = createHash('sha1').update(buf).digest();
  const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '', out = '';
  for (const b of bytes) bits += b.toString(2).padStart(8, '0');
  for (let i = 0; i < bits.length; i += 5) out += alfabeto[parseInt(bits.slice(i, i + 5).padEnd(5, '0'), 2)];
  return out;
}

async function infoPdf(ruta) {
  const salida = await xpdf(PDFINFO, [ruta]);
  const campo = (n) => (salida.match(new RegExp(`^${n}:\\s*(.*)$`, 'm')) || [])[1] || null;
  return { paginas: Number(campo('Pages')), modificado: campo('ModDate'), creado: campo('CreationDate') };
}

const fechaCaptura = (ts) => `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)} ${ts.slice(8, 10)}:${ts.slice(10, 12)}:${ts.slice(12, 14)} UTC`;
const urlCaptura = (ts, original) => `https://web.archive.org/web/${ts}id_/${original}`;

async function main() {
  const docs = await documentosRegistro();
  const resultado = [];
  const sinCaptura = [];

  for (const d of docs) {
    console.log(`\n${d.id} · ${d.original}`);
    const local = await readFile(d.archivo);
    const shaLocal = sha256(local);
    const digestLocal = sha1Base32(local);
    const info = await infoPdf(d.archivo);

    const buscar = async (desde, hasta) => {
      const cdx = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(d.original)}&from=${desde}&to=${hasta}&output=json&fl=timestamp,original,statuscode,digest,mimetype`;
      const filas = JSON.parse((await pedir(cdx)).toString('utf8') || '[]');
      return filas.slice(1).map(([ts, original, estado, digest, tipo]) => ({ ts, original, estado, digest, tipo }))
        .filter(c => c.estado === '200');
    };
    let capturas = await buscar(DESDE, HASTA);
    let fueraDeVentana = false;
    console.log(`  ${capturas.length} capturas con estado 200 entre mayo y julio de 2023`);
    if (!capturas.length) {
      capturas = await buscar('2023', '2023');
      fueraDeVentana = capturas.length > 0;
      console.log(`  ${capturas.length} capturas con estado 200 en todo 2023`);
    }

    const r = {
      id: d.id, partido: d.partido, original: d.original,
      local: { archivo: relative(DATOS_DIR, d.archivo), sha256: shaLocal, paginas: info.paginas, modificado: info.modificado, creado: info.creado },
      capturas: capturas.length, fueraDeVentana, captura: null, coincide: false, version: null,
    };

    if (!capturas.length) {
      const decision = SIN_CAPTURA_2023[d.id];
      if (!decision) {
        sinCaptura.push(d.id);
        resultado.push(r);
        continue;
      }
      const url = urlCaptura(decision.captura, d.original);
      const buf = await pedir(url);
      if (sha256(buf) !== shaLocal) throw new Error(`${d.id}: la captura ${decision.captura} ya no coincide con el archivo local`);
      r.verificacion = 'sin-captura-2023';
      r.motivo = decision.motivo;
      r.captura = { fecha: fechaCaptura(decision.captura), url, sha256: shaLocal, contentType: buf.tipo };
      r.coincide = true;
      r.version = { origen: 'local', archivo: relative(DATOS_DIR, d.archivo), sha256: shaLocal, paginas: info.paginas, url };
      console.log(`  sin captura de 2023: se usa el archivo local con la captura idéntica del ${r.captura.fecha} (${buf.tipo})`);
      resultado.push(r);
      continue;
    }

    // Primero, la captura cuyo contenido coincide con el archivo local (por el SHA-1 del índice
    // y confirmándolo con el SHA-256 de la descarga).
    const iguales = capturas.filter(c => c.digest === digestLocal);
    for (const c of iguales.reverse()) {
      const url = urlCaptura(c.ts, c.original);
      const buf = await pedir(url);
      if (sha256(buf) === shaLocal) {
        r.captura = { fecha: fechaCaptura(c.ts), url, sha256: shaLocal, contentType: buf.tipo };
        r.coincide = true;
        r.verificacion = fueraDeVentana ? 'captura-2023-fuera-de-ventana' : 'captura-2023';
        r.version = { origen: 'local', archivo: relative(DATOS_DIR, d.archivo), sha256: shaLocal, paginas: info.paginas, url };
        console.log(`  coincide con la captura del ${r.captura.fecha} (${buf.tipo})`);
        break;
      }
    }

    // Si ninguna coincide, se descarga la última captura de 2023 y se trabaja con ella.
    if (!r.coincide) {
      const c = capturas.at(-1);
      const url = urlCaptura(c.ts, c.original);
      const buf = await pedir(url);
      const sha = sha256(buf);
      await mkdir(ARCHIVO_2023, { recursive: true });
      const destino = join(ARCHIVO_2023, `${d.id}-${c.ts}.pdf`);
      try { await access(destino); } catch { await writeFile(destino, buf); }
      const infoCaptura = await infoPdf(destino);
      r.captura = { fecha: fechaCaptura(c.ts), url, sha256: sha, contentType: buf.tipo };
      r.verificacion = 'descargada-archivo-2023';
      r.version = { origen: 'archivo-2023', archivo: relative(DATOS_DIR, destino), sha256: sha, paginas: infoCaptura.paginas, url };
      console.log(`  NO coincide: se usa la captura del ${r.captura.fecha} (${infoCaptura.paginas} páginas), guardada en archivo-2023/`);
    }
    resultado.push(r);
  }

  const noPdf = resultado.filter(r => r.captura && !/^application\/pdf/.test(r.captura.contentType || ''));
  for (const r of noPdf) console.log(`AVISO: ${r.id} · la captura no devuelve un PDF (Content-Type: ${r.captura.contentType})`);
  await escribirJson(join(BANCO, 'versiones.json'), resultado);
  console.log(`\nEscrito datos/banco/versiones.json`);
  if (sinCaptura.length) {
    console.error(`\nSIN CAPTURA DE 2023 en Internet Archive: ${sinCaptura.join(', ')}. Hay que decidir antes de usar estos documentos.`);
    process.exit(2);
  }
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
