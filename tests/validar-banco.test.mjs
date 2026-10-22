// La construcción falla con un mensaje claro si el banco está mal. Se prueba con copias rotas del banco de ejemplo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validarBanco } from '../src/plantillas/juegos.mjs';

const leer = (ruta) => JSON.parse(readFileSync(new URL(ruta, import.meta.url), 'utf8'));
const partidos = leer('./ejemplo/partidos-ejemplo.json');
const copia = () => leer('./ejemplo/banco-ejemplo.json');

test('el banco de ejemplo es válido', () => {
  assert.deepEqual(validarBanco(copia(), partidos), []);
});

test('falta un campo', () => {
  const b = copia(); delete b.tarjetas[0].cita;
  assert.match(validarBanco(b, partidos).join('\n'), /e-vivienda-norte: falta el campo «cita»/);
  const b2 = copia(); delete b2.glosario;
  assert.match(validarBanco(b2, partidos).join('\n'), /falta el campo «glosario»/);
});

test('una tarjeta con más de un partido', () => {
  const b = copia(); b.tarjetas[0].partidos = ['norte', 'sur'];
  assert.match(validarBanco(b, partidos).join('\n'), /tiene 2 partidos/);
});

test('un enlace sin #page=', () => {
  const b = copia(); b.tarjetas[0].enlace = 'https://example.org/norte.pdf';
  assert.match(validarBanco(b, partidos).join('\n'), /el enlace no lleva #page=/);
});

test('un partido que no está en el archivo de partidos', () => {
  const b = copia(); b.tarjetas[0].partidos = ['centro'];
  assert.match(validarBanco(b, partidos).join('\n'), /el partido «centro» no está en el archivo de partidos/);
});

test('un término del glosario que enlaza a una tarjeta que no existe', () => {
  const b = copia(); b.glosario[0].tarjetas.push('e-no-existe');
  assert.match(validarBanco(b, partidos).join('\n'), /enlaza a la tarjeta «e-no-existe», que no existe/);
});
