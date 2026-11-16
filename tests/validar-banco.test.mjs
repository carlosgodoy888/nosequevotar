// La construcción falla con un mensaje claro si el banco está mal. Se prueba con copias rotas del banco de ejemplo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validarBanco, bancoPublico } from '../src/plantillas/juegos.mjs';

const leer = (ruta) => JSON.parse(readFileSync(new URL(ruta, import.meta.url), 'utf8'));
const partidos = leer('./ejemplo/partidos-ejemplo.json');
const copia = () => leer('./ejemplo/banco-ejemplo.json');
const errores = (b, p = partidos) => validarBanco(b, p).join('\n');

test('el banco de ejemplo es válido', () => {
  assert.deepEqual(validarBanco(copia(), partidos), []);
});

test('falta un campo', () => {
  const b = copia(); delete b.tarjetas[0].cita;
  assert.match(errores(b), /e-vivienda-norte-1: falta el campo «cita»/);
  const b2 = copia(); delete b2.documentos;
  assert.match(errores(b2), /falta el campo «documentos»/);
});

test('un partido que no está en el archivo de partidos, o que figura sin programa', () => {
  const b = copia(); b.tarjetas[0].partido = 'arriba';
  assert.match(errores(b), /el partido «arriba» no está en el archivo de partidos/);
  const b2 = copia(); b2.tarjetas[0].partido = 'centro';
  assert.match(errores(b2), /el partido «centro» figura sin programa/);
});

test('un documento de otro partido', () => {
  const b = copia(); b.tarjetas[0].documento = 'ejemplo-sur';
  assert.match(errores(b), /el documento «ejemplo-sur» es de otro partido/);
});

test('los puestos de cada partido y tema van seguidos desde el 1', () => {
  const b = copia(); b.tarjetas.find(t => t.id === 'e-vivienda-norte-1').puesto = 3;
  assert.match(errores(b), /norte · vivienda: los puestos deben ser 1, 2, 3/);
  const b2 = copia(); b2.tarjetas[0].puesto = 4;
  assert.match(errores(b2), /el puesto debe ir de 1 a 3/);
});

test('un texto que no es el de la cita tiene que decir qué se ha cambiado', () => {
  const b = copia(); b.tarjetas[0].texto = 'Otra cosa.';
  assert.match(errores(b), /el texto no es el de la cita y no dice qué se ha cambiado/);
  // Con traducción, el texto es la traducción.
  const b2 = copia(); delete b2.tarjetas.find(t => t.id === 'e-vivienda-sur-1').traduccion;
  assert.match(errores(b2), /e-vivienda-sur-1: el texto no es el de la cita/);
});

test('el banco público solo lleva lo que usa el test', () => {
  const publico = bancoPublico(copia());
  assert.deepEqual(Object.keys(publico).sort(), ['anio', 'documentos', 'tarjetas', 'temas']);
  for (const t of publico.tarjetas) {
    const sobran = Object.keys(t).filter(k => !['id', 'tema', 'partido', 'puesto', 'texto', 'documento', 'pagina', 'idioma', 'cambiada'].includes(k));
    assert.deepEqual(sobran, [], `${t.id}: sobran ${sobran.join(', ')}`);
  }
  assert.equal(publico.tarjetas.find(t => t.id === 'e-vivienda-sur-1').idioma, 'ca');
  assert.equal(publico.tarjetas.find(t => t.id === 'e-empleo-norte-1').cambiada, true);
});
