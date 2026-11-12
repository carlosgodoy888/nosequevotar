// Páginas de partidos y de temas con los datos reales de 2026: validación y reglas de la interfaz.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validarPartidos, indicePartidos, paginaPartido, indiceTemas, paginaTema } from '../src/plantillas/partidos.mjs';
import { esc } from '../src/plantillas/util.mjs';

const datos = JSON.parse(readFileSync(new URL('../src/contenido/partidos/partidos-2026.json', import.meta.url), 'utf8'));
const sinPliegues = (html) => html.replace(/<details class="pliegue">[\s\S]*?<\/details>/g, '');
const citasDe = (partido, tema) => (datos.citas[partido] ?? []).filter(c => c.temas.includes(tema));

test('los datos de partidos pasan la validación', () => {
  assert.deepEqual(validarPartidos(datos), []);
});

test('la validación detecta un resumen apoyado en una cita que no existe', () => {
  const p = datos.partidos[0];
  const tema = Object.keys(datos.resumenes[p.id])[0];
  const roto = structuredClone({ ...datos, citas: { [p.id]: datos.citas[p.id] }, partidos: [p], resumenes: { [p.id]: datos.resumenes[p.id] } });
  roto.resumenes[p.id][tema].frases[0].apoyos = ['c-0000000000'];
  assert.equal(validarPartidos(roto).length, 1);
});

test('las medidas concretas nunca van plegadas, ni en la ficha del partido ni en la del tema', () => {
  for (const p of datos.partidos) {
    const visible = sinPliegues(paginaPartido(p, datos).contenido);
    for (const c of (datos.citas[p.id] ?? []).filter(c => c.concreta)) {
      assert.ok(visible.includes(esc(c.cita)), `${p.id}: la medida concreta ${c.id} está plegada o no aparece`);
    }
  }
  for (const t of datos.temas) {
    const visible = sinPliegues(paginaTema(t, datos).contenido);
    for (const p of datos.partidos) for (const c of citasDe(p.id, t.id).filter(c => c.concreta)) {
      assert.ok(visible.includes(esc(c.cita)), `${t.id} · ${p.id}: la medida concreta ${c.id} está plegada o no aparece`);
    }
  }
});

test('todas las citas de un partido aparecen en su ficha', () => {
  for (const p of datos.partidos) {
    const html = paginaPartido(p, datos).contenido;
    for (const c of datos.citas[p.id] ?? []) if (c.temas.length) assert.ok(html.includes(esc(c.cita)), `${p.id}: falta la cita ${c.id}`);
  }
});

test('el índice de cada página lleva a secciones que existen, y cada sección está en el índice', () => {
  const paginas = [...datos.partidos.map(p => paginaPartido(p, datos)), ...datos.temas.map(t => paginaTema(t, datos))];
  for (const pagina of paginas) {
    const indice = pagina.contenido.match(/<nav class="indice"[\s\S]*?<\/nav>/)[0];
    const enlaces = [...indice.matchAll(/href="#([^"]+)"/g)].map(m => m[1]);
    const secciones = [...pagina.contenido.matchAll(/<section class="postura" id="([^"]+)" data-salto="[^"]+"/g)].map(m => m[1]);
    assert.deepEqual(enlaces, secciones, pagina.ruta);
    assert.ok(secciones.length > 0, `${pagina.ruta}: sin secciones`);
  }
});

test('en un tema salen, en el orden acordado, los partidos que dicen algo y ninguno más', () => {
  for (const t of datos.temas) {
    const html = paginaTema(t, datos).contenido;
    const esperados = datos.partidos.filter(p => citasDe(p.id, t.id).length).map(p => p.id);
    assert.deepEqual([...html.matchAll(/data-partido="([^"]+)"/g)].map(m => m[1]), esperados, t.id);
    assert.deepEqual([...html.matchAll(/<input type="checkbox" value="([^"]+)" checked>/g)].map(m => m[1]), esperados, `${t.id}: casillas`);
  }
});

test('la ficha dice qué tenemos de cada partido: programa, documento parcial, documento general o solo declaraciones', () => {
  const AVISOS = {
    publicado: null,
    documento_parcial: 'No hay programa completo publicado',
    programa_general: 'No hay programa para estas elecciones',
    no_publicado: 'No hay programa oficial publicado',
    no_comprobado: 'No hay programa oficial publicado',
  };
  for (const p of datos.partidos) {
    const html = paginaPartido(p, datos).contenido;
    assert.ok(p.programa.estado in AVISOS, `${p.id}: estado de programa desconocido (${p.programa.estado})`);
    for (const aviso of new Set(Object.values(AVISOS).filter(Boolean))) {
      assert.equal(html.includes(aviso), aviso === AVISOS[p.programa.estado], `${p.id}: «${aviso}»`);
    }
    // Un tema que solo tiene declaraciones lleva la marca, tenga o no documentos el partido.
    const soloDeclaraciones = datos.temas.some(t => { const cs = citasDe(p.id, t.id); return cs.length && cs.every(c => c.tipo !== 'programa'); });
    assert.equal(html.includes('Declaraciones, no programa'), soloDeclaraciones, `${p.id}: marca de declaraciones`);
    // Si dice que usa un documento, tiene citas de ese documento.
    if (['documento_parcial', 'programa_general', 'publicado'].includes(p.programa.estado)) {
      assert.ok((datos.citas[p.id] ?? []).some(c => c.tipo === 'programa'), `${p.id}: dice tener documento y no hay citas de él`);
    }
  }
});

test('la lista de partidos describe cada uno con la misma regla', () => {
  const html = indicePartidos(datos).contenido;
  for (const p of datos.partidos) {
    const tarjeta = html.match(new RegExp(`href="/partidos/${p.id}/"[\\s\\S]*?</a>`))[0];
    const esperado = { publicado: 'Con programa.', documento_parcial: 'Sin programa completo', programa_general: 'Sin programa para estas elecciones' }[p.programa.estado] ?? 'Sin programa publicado';
    assert.ok(tarjeta.includes(esperado), `${p.id}: ${tarjeta.slice(-160)}`);
  }
});

test('las herramientas que necesitan JavaScript salen ocultas y las páginas cargan su módulo', () => {
  for (const pagina of [paginaPartido(datos.partidos[0], datos), paginaTema(datos.temas[0], datos)]) {
    assert.deepEqual(pagina.modulos, ['/partidos.js']);
    assert.match(pagina.contenido, /<div class="herramientas" data-herramientas hidden>/);
    assert.match(pagina.contenido, /<div class="saltos" data-saltos hidden>/);
  }
  assert.equal(indicePartidos(datos).modulos, undefined);
  assert.equal(indiceTemas(datos).modulos, undefined);
});
