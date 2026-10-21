// Banco de tarjetas del test · rutas, partidos, temas, documentos y utilidades comunes. Node 22, sin dependencias.
//
// Los PDF se leen de datos-nosequevotar (fuera del repositorio) y nunca se copian aquí.
//   DATOS_DIR   carpeta de datos-nosequevotar (por defecto ../datos-nosequevotar)
//   PDFTOTEXT   binario pdftotext de Xpdf (por defecto ../herramientas/xpdf-tools-mac-4.06/bin64/pdftotext)
//   PDFINFO     binario pdfinfo de Xpdf

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DATOS_DIR = resolve(RAIZ, process.env.DATOS_DIR || '../datos-nosequevotar');
const XPDF = resolve(RAIZ, '../herramientas/xpdf-tools-mac-4.06/bin64');
export const PDFTOTEXT = process.env.PDFTOTEXT || join(XPDF, 'pdftotext');
export const PDFINFO = process.env.PDFINFO || join(XPDF, 'pdfinfo');

export const BANCO = join(RAIZ, 'datos', 'banco');
export const TEXTOS = join(BANCO, 'textos');
export const CANDIDATAS = join(BANCO, 'candidatas');
// Única carpeta de datos-nosequevotar donde se escribe: capturas de 2023 de Internet Archive.
export const ARCHIVO_2023 = join(DATOS_DIR, 'fuentes', 'descargas', 'archivo-2023');

export const PARTIDOS = ['pp', 'psoe', 'vox', 'sumar', 'erc', 'junts', 'pnv', 'bildu', 'bng', 'cc'];
export const ESTATALES = ['pp', 'psoe', 'vox', 'sumar'];
export const NOMBRE_PARTIDO = { pp: 'PP', psoe: 'PSOE', vox: 'Vox', sumar: 'Sumar', erc: 'ERC', junts: 'Junts', pnv: 'PNV', bildu: 'Bildu', bng: 'BNG', cc: 'CC' };

export const TEMAS = [
  { id: 'vivienda', nombre: 'Vivienda', orden: 1, corto: true },
  { id: 'impuestos', nombre: 'Impuestos', orden: 2, corto: true },
  { id: 'inmigracion', nombre: 'Inmigración', orden: 3, corto: true },
  { id: 'empleo', nombre: 'Empleo', orden: 4, corto: false },
  { id: 'pensiones', nombre: 'Pensiones', orden: 5, corto: false },
  { id: 'sanidad', nombre: 'Sanidad', orden: 6, corto: false },
];

export const leerJson = async (ruta) => JSON.parse(await readFile(ruta, 'utf8'));

export async function escribirJson(ruta, datos) {
  await mkdir(dirname(ruta), { recursive: true });
  await writeFile(ruta, JSON.stringify(datos, null, 2) + '\n');
}

export const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

const ejecutar = promisify(execFile);
export async function xpdf(binario, args) {
  const { stdout } = await ejecutar(binario, args, { maxBuffer: 64 * 1024 * 1024, encoding: 'utf8' });
  return stdout;
}

// Documentos de 2023 según registro.json: las entradas «programas-2023» y «vox-programa-2023-archivo».
export async function documentosRegistro() {
  const registro = await leerJson(join(DATOS_DIR, 'fuentes', 'registro.json'));
  const docs = registro.filter(e => e.id === 'programas-2023' || e.id === 'vox-programa-2023-archivo').map(e => {
    const id = e.documento || '2023-vox';
    // Vox se descargó de Internet Archive: la URL original es la que va tras «id_/».
    const original = e.id === 'vox-programa-2023-archivo' ? e.url.replace(/^.*?id_\//, '') : e.url;
    return { id, partido: id.replace('2023-', ''), urlRegistro: e.urlFinal || e.url, original, archivo: join(DATOS_DIR, 'fuentes', e.archivo), sha256Registro: e.sha256 };
  });
  const faltan = PARTIDOS.filter(p => !docs.some(d => d.partido === p));
  if (faltan.length) throw new Error(`registro.json no tiene programa de 2023 para: ${faltan.join(', ')}`);
  return PARTIDOS.map(p => docs.find(d => d.partido === p));
}

// Versión con la que se trabaja (la escribe versiones.mjs). archivo queda como ruta absoluta.
export async function versiones() {
  const v = await leerJson(join(BANCO, 'versiones.json'));
  return v.map(d => ({ ...d, version: { ...d.version, archivo: join(DATOS_DIR, d.version.archivo) } }));
}

// Normalización para comparar citas con el texto de la página: ligaduras (NFKC), guiones de
// fin de línea, guion blando, comillas tipográficas, guiones Unicode y espacios.
export function normalizar(t) {
  return t.normalize('NFKC')
    .replace(/\u00AD/g, '')
    .replace(/[\u2010\u2011]/g, '-')
    .replace(/(\p{L})-[ \t]*\r?\n\s*(\p{L})/gu, '$1$2')
    .replace(/[\u2018\u2019\u201A\u201B\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB\u2033]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

export const palabras = (t) => (t.match(/[\p{L}\p{N}][\p{L}\p{N}'’.,%€-]*/gu) || []).length;

// ───────────── CSV para Excel o Numbers en español: UTF-8 con BOM y separador «;» ─────────────

const BOM = '\uFEFF';

export function aCsv(columnas, filas) {
  const celda = (v) => {
    const t = v === null || v === undefined ? '' : String(v);
    return /[";\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  return BOM + [columnas, ...filas.map(f => columnas.map(c => f[c]))].map(f => f.map(celda).join(';')).join('\r\n') + '\r\n';
}

// Lee un CSV con «;» (o «,» si la cabecera no tiene «;»), con comillas, saltos de línea dentro
// de los campos y BOM opcional. Devuelve una lista de objetos con las columnas de la cabecera.
export function deCsv(texto) {
  texto = texto.replace(/^\uFEFF/, '');
  const sep = texto.split(/\r?\n/, 1)[0].includes(';') ? ';' : ',';
  const filas = [];
  let fila = [], campo = '', comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === sep) { fila.push(campo); campo = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      fila.push(campo); filas.push(fila); fila = []; campo = '';
    } else campo += c;
  }
  if (campo !== '' || fila.length) { fila.push(campo); filas.push(fila); }
  const [cabecera, ...resto] = filas.filter(f => f.some(x => x.trim() !== ''));
  if (!cabecera) return [];
  const columnas = cabecera.map(c => c.trim());
  return resto.map(f => Object.fromEntries(columnas.map((c, i) => [c, (f[i] ?? '').trim()])));
}

// ───────────── Prueba de adivinar ─────────────

// Textos de test de los cuatro partidos estatales, mezclados con una semilla fija: generar.mjs
// y corregir-prueba.mjs obtienen el mismo orden a partir de banco-2023.json.
export function ordenPrueba(banco, semilla = 2023) {
  const tarjetas = banco.tarjetas.filter(t => t.uso === 'test' && t.partidos.some(p => ESTATALES.includes(p)));
  let s = semilla >>> 0;
  const azar = () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let x = s;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
  const lista = [...tarjetas].sort((a, b) => a.id.localeCompare(b.id));
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista.map((t, i) => ({ numero: i + 1, tarjeta: t }));
}
