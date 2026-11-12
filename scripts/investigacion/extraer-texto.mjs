// Texto de cada página de los documentos PDF registrados en fuentes.json, con pdftotext de Xpdf.
//
//   node scripts/investigacion/extraer-texto.mjs            todos los que tienen "archivo" PDF
//   node scripts/investigacion/extraer-texto.mjs pp-programa-2026
//
// Escribe DATOS_DIR/textos-2026/<id de la fuente>/p-001.txt, p-002.txt… (fuera del repositorio) y
// anota en fuentes.json el número de páginas. Comprueba antes que la huella SHA-256 del PDF coincide
// con la registrada: si no coincide, el documento ha cambiado y hay que registrarlo como versión nueva.
//
// Variables: DATOS_DIR (por defecto ../datos-nosequevotar), PDFTOTEXT y PDFINFO (por defecto, Xpdf 4.06
// en ../herramientas/), LAYOUT=1 para conservar la maquetación en columnas.

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DATOS_DIR = resolve(RAIZ, process.env.DATOS_DIR || '../datos-nosequevotar');
const XPDF = resolve(RAIZ, '..', 'herramientas', process.platform === 'win32' ? 'xpdf-tools-win-4.06/bin64' : 'xpdf-tools-mac-4.06/bin64');
const EXE = process.platform === 'win32' ? '.exe' : '';
const PDFTOTEXT = process.env.PDFTOTEXT || join(XPDF, `pdftotext${EXE}`);
const PDFINFO = process.env.PDFINFO || join(XPDF, `pdfinfo${EXE}`);
const FUENTES = join(RAIZ, 'datos', 'investigacion-2026', 'fuentes.json');
export const TEXTOS = join(DATOS_DIR, 'textos-2026');

const registro = JSON.parse(await readFile(FUENTES, 'utf8'));
const pedidas = process.argv.slice(2);
const fuentes = registro.fuentes.filter(f => f.archivo?.toLowerCase().endsWith('.pdf') && (!pedidas.length || pedidas.includes(f.id)));
if (!fuentes.length) { console.error('No hay ninguna fuente PDF que extraer.'); process.exit(1); }

// Saltos de línea de Unix, forma compuesta y sin ligaduras tipográficas (la «fi» en un solo signo pasa a
// ser «f» más «i»): son un adorno de la maquetación, no texto distinto, y así las citas se copian, se
// muestran y se buscan con letras corrientes. El verificador ya las daba por iguales.
const LIGADURAS = ['ff', 'fi', 'fl', 'ffi', 'ffl', 'st', 'st'];
const limpio = t => t.replace(/\r\n/g, '\n').normalize('NFC').replace(/[ﬀ-ﬆ]/g, l => LIGADURAS[l.charCodeAt(0) - 0xFB00]);

let fallos = 0;
for (const f of fuentes) {
  const pdf = join(DATOS_DIR, f.archivo);
  const sha = createHash('sha256').update(await readFile(pdf)).digest('hex');
  if (sha !== f.sha256) { console.error(`${f.id}: la huella del archivo no coincide con la registrada. No se extrae.`); fallos++; continue; }

  const paginas = Number(execFileSync(PDFINFO, [pdf], { encoding: 'utf8' }).match(/^Pages:\s+(\d+)/m)?.[1]);
  const args = ['-enc', 'UTF-8', ...(process.env.LAYOUT ? ['-layout'] : []), pdf, '-'];
  // pdftotext separa las páginas con un salto de página (\f) y deja uno al final.
  const partes = execFileSync(PDFTOTEXT, args, { encoding: 'utf8', maxBuffer: 1 << 28 }).split('\f');
  if (partes.at(-1).trim() === '') partes.pop();
  if (partes.length !== paginas) { console.error(`${f.id}: pdftotext da ${partes.length} páginas y pdfinfo ${paginas}. No se extrae.`); fallos++; continue; }

  const dir = join(TEXTOS, f.id);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  let vacias = 0, caracteres = 0;
  for (const [i, t] of partes.entries()) {
    const texto = limpio(t);
    if (texto.trim().length < 20) vacias++;
    caracteres += texto.length;
    await writeFile(join(dir, `p-${String(i + 1).padStart(3, '0')}.txt`), texto);
  }
  // Segunda lectura, en el orden en que el PDF guarda el texto (-raw). En páginas con recuadros o
  // columnas, la lectura normal intercala el recuadro en mitad de una frase; esta suele dejarla seguida.
  // Solo la usa el verificador (comun.mjs), para dar por buena una cita que está en la página.
  const crudas = execFileSync(PDFTOTEXT, ['-enc', 'UTF-8', '-raw', pdf, '-'], { encoding: 'utf8', maxBuffer: 1 << 28 }).split('\f');
  if (crudas.at(-1).trim() === '') crudas.pop();
  const conCrudas = crudas.length === paginas;
  if (conCrudas) for (const [i, t] of crudas.entries()) await writeFile(join(dir, `p-${String(i + 1).padStart(3, '0')}.raw.txt`), limpio(t));
  f.paginas = paginas;
  console.log(`${f.id}: ${paginas} páginas, ${caracteres} caracteres, ${vacias} páginas sin texto${conCrudas ? '' : ' (sin segunda lectura)'} → ${dir}`);
}
await writeFile(FUENTES, JSON.stringify(registro, null, 2) + '\n');
process.exit(fallos ? 1 : 0);
