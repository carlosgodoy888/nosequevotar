// Rutas y funciones compartidas por los scripts de la investigación de 2026.
//
// Variables: DATOS_DIR (por defecto ../datos-nosequevotar).

import { readFile, readdir } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizar } from '../banco/comun.mjs';
import { verificarCita } from '../banco/verificar.mjs';

export const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DATOS_DIR = resolve(RAIZ, process.env.DATOS_DIR || '../datos-nosequevotar');
export const DIR = join(RAIZ, 'datos', 'investigacion-2026');
export const TRABAJO = join(DIR, '_trabajo', 'citas');
export const TEXTOS = join(DATOS_DIR, 'textos-2026');

export const leerJson = async ruta => JSON.parse(await readFile(ruta, 'utf8'));
export const leerFuentes = async () => (await leerJson(join(DIR, 'fuentes.json'))).fuentes;

// Temas de una cita. Las declaraciones traen sus temas; las de programa se deducen de sus etiquetas
// con temas.json (las transversales, como «juventud», solo cuentan si la cita no tiene otra etiqueta).
// Si una cita trae "temas_manual", mandan esos.
export function temasDeCita(cita, config) {
  if (cita.temas_manual?.length) return cita.temas_manual;
  if (cita.tipo !== 'programa') return cita.temas ?? [];
  const temaDe = new Map(config.temas.flatMap(t => t.etiquetas.map(e => [e, t.id])));
  const temas = [...new Set(cita.etiquetas.map(e => temaDe.get(e.trim().toLowerCase())).filter(Boolean))];
  if (!temas.length) for (const e of cita.etiquetas) { const tr = config.transversales?.[e]; if (tr) temas.push(tr.si_no_hay_otra); }
  return temas;
}

// Texto de las páginas de un documento, tal como lo dejó extraer-texto.mjs: [{ texto }, …].
// Si la página tiene segunda lectura (p-NNN.raw.txt, el orden en que el PDF guarda el texto), va detrás
// de la normal: una cita vale si está seguida en cualquiera de las dos lecturas de su página.
const cache = new Map();
export async function paginasDe(idFuente) {
  if (!cache.has(idFuente)) {
    const dir = join(TEXTOS, idFuente);
    const archivos = (await readdir(dir)).filter(a => /^p-\d+\.txt$/.test(a)).sort();
    cache.set(idFuente, await Promise.all(archivos.map(async a => {
      const cruda = await readFile(join(dir, a.replace(/\.txt$/, '.raw.txt')), 'utf8').catch(() => '');
      return { texto: (await readFile(join(dir, a), 'utf8')) + (cruda ? `\n\n${cruda}` : '') };
    })));
  }
  return cache.get(idFuente);
}

// «exacta», «normalizada» o «no-encontrada», con el criterio del banco de 2023 (scripts/banco/verificar.mjs)
// y un caso más: la palabra partida con guion entre el final de una página y el principio de la siguiente
// («pro-» / «gramas»). El banco solo admite partir la cita entre dos páginas por un espacio.
export function verificar(paginas, cita, pagina) {
  const resultado = verificarCita(paginas, cita, pagina);
  if (resultado !== 'no-encontrada') return resultado;
  const a = normalizar(paginas[pagina - 1]?.texto ?? '');
  const b = normalizar(paginas[pagina]?.texto ?? '');
  const c = normalizar(cita ?? '');
  const letra = /\p{L}/u;
  // El trozo que queda en su página puede ser corto («Planificaremos con conti-»): con el guion
  // detrás, doce caracteres bastan para no confundir la página.
  for (let i = 12; i <= c.length - 8; i++) {
    if (!letra.test(c[i - 1]) || !letra.test(c[i])) continue; // solo dentro de una palabra
    if (a.includes(`${c.slice(0, i)}-`) && b.includes(c.slice(i))) return 'normalizada';
  }
  // Último caso: el PDF pega un título a la frase siguiente («CORRESPONDE.Revisaremos») o separa letras.
  // Los espacios del texto extraído son maquetación, no texto del documento: se compara sin ninguno,
  // en la página y, si la cita cruza de página, partiéndola en cualquier punto.
  // También se une la palabra partida que el PDF deja con guion y espacio en mitad de una línea («ínte- gro»).
  const sin = t => t.replace(/(\p{L})- (\p{Ll})/gu, '$1$2').replace(/\s+/g, '');
  const [as, bs, cs] = [sin(a), sin(b), sin(c)];
  if (cs.length >= 25) {
    if (as.includes(cs)) return 'normalizada';
    for (let i = 25; i <= cs.length - 8; i++) {
      if (as.endsWith(cs.slice(0, i)) || (as.includes(cs.slice(0, i)) && bs.includes(cs.slice(i)) && as.lastIndexOf(cs.slice(0, i)) > as.length - cs.length - 400)) {
        if (bs.includes(cs.slice(i))) return 'normalizada';
      }
    }
  }
  return 'no-encontrada';
}
