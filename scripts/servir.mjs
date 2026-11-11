// Sirve public/ en local para ver la web sin publicarla. Node 22, sin dependencias.
//
//   node scripts/servir.mjs            solo este ordenador: http://localhost:8787/
//   node scripts/servir.mjs --red      también desde el móvil en la misma wifi
//   PUERTO=9000 node scripts/servir.mjs
//
// Antes hay que construir: node scripts/construir.mjs. Si cambias algo, vuelve a construir y recarga.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { networkInterfaces } from 'node:os';

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const PUERTO = Number(process.env.PUERTO) || 8787;
const EN_RED = process.argv.includes('--red');
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};

async function archivo(ruta) {
  const limpia = normalize(decodeURIComponent(ruta.split('?')[0])).replace(/^([/\\])+/, '');
  let destino = join(PUBLIC, limpia);
  if (!destino.startsWith(PUBLIC)) return null;
  const info = await stat(destino).catch(() => null);
  if (info?.isDirectory()) destino = join(destino, 'index.html');
  return (await stat(destino).catch(() => null))?.isFile() ? destino : null;
}

const servidor = createServer(async (peticion, respuesta) => {
  const destino = await archivo(peticion.url);
  const final = destino ?? join(PUBLIC, '404.html');
  try {
    const cuerpo = await readFile(final);
    respuesta.writeHead(destino ? 200 : 404, { 'Content-Type': TIPOS[extname(final)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    respuesta.end(cuerpo);
  } catch {
    respuesta.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    respuesta.end('No existe public/. Construye antes la web: node scripts/construir.mjs');
  }
});

servidor.on('error', (e) => {
  console.error(e.code === 'EADDRINUSE' ? `El puerto ${PUERTO} ya está en uso: quizá el servidor ya está abierto en otra terminal.` : e.message);
  process.exit(1);
});

servidor.listen(PUERTO, EN_RED ? '0.0.0.0' : '127.0.0.1', () => {
  console.log(`Web en local: http://localhost:${PUERTO}/`);
  if (EN_RED) {
    const ips = Object.values(networkInterfaces()).flat().filter(i => i.family === 'IPv4' && !i.internal).map(i => i.address);
    for (const ip of ips) console.log(`Desde el móvil (misma wifi): http://${ip}:${PUERTO}/`);
  }
  console.log('Ctrl+C para parar.');
});
