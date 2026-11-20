// Banco real de 2026: validación y simulación de respuestas al azar en las 52 circunscripciones y los dos modos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calcularResultado, partidosEnJuego, partidosSinPrograma, papeletasDelTema, contarPreguntas, temasEnOrden, MIN_TEMAS } from '../src/js/juegos/motor.mjs';
import { validarBanco, bancoPublico } from '../src/plantillas/juegos.mjs';

const leer = (ruta) => JSON.parse(readFileSync(new URL(ruta, import.meta.url), 'utf8'));
const generado = leer('../src/contenido/juegos/banco-2026.json');
const partidos = leer('../src/contenido/juegos/partidos-2026.json');
const circunscripciones = leer('../src/contenido/circunscripciones.json');
const banco = bancoPublico(generado);
const temas = temasEnOrden(banco).map(t => t.id);

// Azar reproducible para que un fallo se pueda repetir.
function azar(semilla) {
  let a = semilla >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

test('el banco de 2026 pasa la validación', () => {
  assert.deepEqual(validarBanco(generado, partidos, 'banco-2026.json'), []);
  assert.equal(circunscripciones.length, 52);
  assert.equal(temas.length, 18);
});

test('ninguna tarjeta nombra a la candidatura que la firma', () => {
  // Nombres y siglas tal como salen en la web; el generador comprueba además las variantes de cada una.
  for (const t of banco.tarjetas) {
    const p = partidos.find(x => x.id === t.partido);
    assert.ok(!t.texto.includes(p.nombre) || p.nombre === 'Podemos', `${t.id} nombra a ${p.nombre}`);
  }
});

test('cada circunscripción tiene candidaturas con programa y, en cada tema, medidas de alguna', () => {
  for (const c of circunscripciones) {
    const ids = partidosEnJuego(partidos, c.id).map(p => p.id);
    assert.ok(ids.length >= 3, `${c.id}: solo ${ids.length} candidaturas con programa`);
    for (const tema of temas) assert.ok(papeletasDelTema(banco, tema, ids, 'rapido').length >= 2, `${c.id} · ${tema}: menos de dos medidas`);
    // En el rápido hay una medida por candidatura y tema como mucho.
    assert.ok(contarPreguntas(banco, temas, ids, 'rapido') <= ids.length * temas.length);
    assert.ok(contarPreguntas(banco, temas, ids, 'completo') <= ids.length * temas.length * 3);
  }
});

test('quién entra en algunas circunscripciones', () => {
  const en = c => partidosEnJuego(partidos, c).map(p => p.id);
  const fuera = c => partidosSinPrograma(partidos, c).map(p => p.id);
  assert.ok(['pp', 'psoe', 'vox', 'd21'].every(id => en('madrid').includes(id)));
  assert.ok(en('barcelona').includes('erc') && !en('barcelona').includes('junts'));
  assert.deepEqual(fuera('barcelona'), ['junts']);
  assert.ok(en('lugo').includes('bng') && !en('lugo').includes('d21'));
  assert.ok(en('bizkaia').includes('eaj-pnv') && en('bizkaia').includes('eh-bildu'));
  assert.ok(!en('navarra').includes('pp') && fuera('navarra').includes('upn-pp'));
});

test('simulación al azar: 52 circunscripciones × 2 modos, sin errores', () => {
  let n = 0;
  for (const modo of ['rapido', 'completo']) {
    for (const [i, c] of circunscripciones.entries()) {
      for (let vuelta = 0; vuelta < 4; vuelta++) {
        const alea = azar(i * 100 + vuelta + (modo === 'rapido' ? 0 : 7919));
        const enJuego = partidosEnJuego(partidos, c.id);
        const ids = enJuego.map(p => p.id);
        // Entre MIN_TEMAS y todos los temas, en el orden estándar.
        const cuantos = MIN_TEMAS + Math.floor(alea() * (temas.length - MIN_TEMAS + 1));
        const elegidos = temas.filter(() => alea() < cuantos / temas.length).slice(0, cuantos);
        while (elegidos.length < MIN_TEMAS) elegidos.push(temas.find(t => !elegidos.includes(t)));
        const respuestas = elegidos.flatMap(tema => papeletasDelTema(banco, tema, ids, modo))
          .map(t => ({ tarjeta: t.id, decision: ['favor', 'contra', 'abstencion'][Math.floor(alea() * 3)], doble: alea() < 0.15 }));
        const res = calcularResultado({ banco, partidos: enJuego, temas: elegidos, modo, respuestas });
        assert.equal(res.filas.length, enJuego.length);
        assert.equal(res.preguntas, respuestas.length);
        for (const f of res.filas) {
          assert.ok(f.favor <= f.respondidas, `${c.id} ${f.partido}: más votos a favor que votos`);
          assert.equal(f.favor + f.contra, f.respondidas);
          // La afinidad va de −100 a +100.
          if (!f.aparte) assert.ok(f.porcentaje >= -100 && f.porcentaje <= 100, `${c.id} ${f.partido}: ${f.porcentaje}`);
        }
        assert.equal(res.porTema.length, elegidos.length);
        // Solo encabezan el resultado las candidaturas con afinidad positiva, y si la primera lo es, encabeza.
        assert.ok(res.primeros.every(id => res.filas.find(f => f.partido === id).afinidad > 0));
        if (!res.sinRanking) assert.equal(res.primeros.length >= 1, res.clasificados[0].afinidad > 1e-9);
        n++;
      }
    }
  }
  assert.equal(n, 52 * 2 * 4);
});
