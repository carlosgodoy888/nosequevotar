// Texto de cada página de los programas de 2023, con pdftotext de Xpdf.
//
//   node scripts/banco/extraer-texto.mjs
//
// Lee la versión de cada documento que fija versiones.json y escribe
// datos/banco/textos/<documento>.json: [{ "pagina": n, "texto": "…" }]. «pagina» es la página
// del PDF empezando en 1, la misma que usa el enlace #page=.
// Con LAYOUT=1 usa -layout (mantiene la disposición física; peor en textos a dos columnas).
// Las páginas sin texto (probablemente imágenes) quedan en datos/banco/textos/sin-texto.json. Sin OCR.

import { join } from 'node:path';
import { TEXTOS, PDFTOTEXT, versiones, escribirJson, xpdf } from './comun.mjs';

// Una página «sin texto» es la que, quitando espacios y números sueltos, no llega a este mínimo.
const MINIMO = 20;

async function main() {
  const docs = await versiones();
  const sinTexto = {};
  for (const d of docs) {
    const args = ['-enc', 'UTF-8', ...(process.env.LAYOUT ? ['-layout'] : []), d.version.archivo, '-'];
    // pdftotext separa las páginas con un salto de página (\f) y deja uno al final.
    const partes = (await xpdf(PDFTOTEXT, args)).split('\f');
    if (partes.at(-1).trim() === '') partes.pop();
    if (partes.length !== d.version.paginas) {
      throw new Error(`${d.id}: pdftotext da ${partes.length} páginas y pdfinfo ${d.version.paginas}`);
    }
    const paginas = partes.map((texto, i) => ({ pagina: i + 1, texto }));
    await escribirJson(join(TEXTOS, `${d.id}.json`), paginas);
    sinTexto[d.id] = paginas.filter(p => p.texto.replace(/[\s\d]+/g, '').length < MINIMO).map(p => p.pagina);
    console.log(`${d.id}: ${paginas.length} páginas, ${sinTexto[d.id].length} sin texto${sinTexto[d.id].length ? ` (${sinTexto[d.id].join(', ')})` : ''}`);
  }
  await escribirJson(join(TEXTOS, 'sin-texto.json'), sinTexto);
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
