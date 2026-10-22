// Banco real de 2023: validación y simulación de respuestas al azar en las 52 circunscripciones y los dos modos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calcularActa, partidosEnJuego, temasDelModo, papeletasDelTema, maxImportantes } from '../src/js/juegos/motor.mjs';
import { validarBanco, bancoPublico } from '../src/plantillas/juegos.mjs';

const leer = (ruta) => JSON.parse(readFileSync(new URL(ruta, import.meta.url), 'utf8'));
const aprobado = leer('../src/contenido/juegos/banco-2023.json');
const partidos = leer('../src/contenido/juegos/partidos-2023.json');
const circunscripciones = leer('../src/contenido/circunscripciones.json');
const banco = bancoPublico(aprobado);

// Azar reproducible para que un fallo se pueda repetir.
function azar(semilla) {
  let a = semilla >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

test('el banco aprobado pasa la validación', () => {
  assert.deepEqual(validarBanco(aprobado, partidos, 'banco-2023.json'), []);
  assert.equal(circunscripciones.length, 52);
});

test('el banco público no lleva revisión, omitido ni aprobación', () => {
  assert.equal(banco.aprobacion, undefined);
  for (const t of banco.tarjetas) {
    assert.deepEqual(Object.keys(t).sort(), ['cita', 'documento', 'enlace', 'id', 'pagina', 'partido', 'tema', 'texto', 'traduccion'].sort());
  }
});

test('simulación al azar: 52 circunscripciones × 2 modos, sin errores', () => {
  let n = 0;
  for (const modo of ['corto', 'completo']) {
    for (const [i, c] of [...circunscripciones, { id: null }].entries()) {
      for (let vuelta = 0; vuelta < 5; vuelta++) {
        const alea = azar(i * 100 + vuelta + (modo === 'corto' ? 0 : 7919));
        const enJuego = partidosEnJuego(partidos, c.id);
        const ids = enJuego.map(p => p.id);
        const temas = temasDelModo(banco, modo).map(t => t.id);
        const respuestas = [];
        for (const tema of temas) {
          const papeletas = papeletasDelTema(banco, tema, ids);
          const delTema = papeletas.map(t => ({ tarjeta: t.id, decision: ['si', 'no', 'paso'][Math.floor(alea() * 3)] }));
          const si = delTema.filter(r => r.decision === 'si');
          if (si.length > 1) si[Math.floor(alea() * si.length)].favorita = true;
          respuestas.push(...delTema);
        }
        const importantes = temas.filter(() => alea() < 0.3).slice(0, maxImportantes(modo));
        const acta = calcularActa({ banco, partidos: enJuego, temas, importantes, respuestas });
        assert.equal(acta.filas.length, enJuego.length);
        for (const f of acta.filas) {
          assert.ok(f.x <= f.y, `${c.id} ${f.partido}: X mayor que Y`);
          if (!f.aparte) assert.ok(f.porcentaje >= 0 && f.porcentaje <= 100);
        }
        if (!acta.sinRanking) assert.ok(acta.primeros.length >= 1);
        n++;
      }
    }
  }
  assert.equal(n, 53 * 2 * 5);
});

test('cada circunscripción tiene los cuatro estatales y sus partidos propios', () => {
  const regionales = { barcelona: ['erc', 'junts'], bizkaia: ['pnv', 'bildu'], navarra: ['bildu'], lugo: ['bng'], 'las-palmas': ['cc'], madrid: [] };
  for (const [c, extra] of Object.entries(regionales)) {
    assert.deepEqual(partidosEnJuego(partidos, c).map(p => p.id).sort(), ['pp', 'psoe', 'vox', 'sumar', ...extra].sort());
  }
});
