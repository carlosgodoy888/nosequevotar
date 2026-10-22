// Pruebas del motor del test con el banco de ejemplo (partidos inventados). node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calcularActa, ponerPorcentajes, partidosEnJuego, temasDelModo, MIN_PAPELETAS } from '../src/js/juegos/motor.mjs';

const leer = (ruta) => JSON.parse(readFileSync(new URL(ruta, import.meta.url), 'utf8'));
const banco = leer('./ejemplo/banco-ejemplo.json');
const partidos = leer('./ejemplo/partidos-ejemplo.json');
const TEMAS = ['vivienda', 'empleo', 'sanidad'];
const r = (tema, partido, decision, favorita = false) => ({ tarjeta: `e-${tema}-${partido}`, decision, favorita });
const fila = (acta, partido) => acta.filas.find(f => f.partido === partido);

// Caso obligatorio del encargo.
const CASO = [
  r('vivienda', 'norte', 'si', true), r('vivienda', 'sur', 'si'), r('vivienda', 'este', 'no'), r('vivienda', 'oeste', 'paso'),
  r('empleo', 'norte', 'si'), r('empleo', 'sur', 'no'), r('empleo', 'este', 'si', true), r('empleo', 'oeste', 'no'),
  r('sanidad', 'norte', 'no'), r('sanidad', 'sur', 'si', true), r('sanidad', 'este', 'si'),
];

test('caso obligatorio: Norte 5 de 6, Sur 4 de 5, Este 3 de 5, Oeste aparte', () => {
  const acta = calcularActa({ banco, partidos, temas: TEMAS, importantes: ['vivienda'], respuestas: CASO });
  assert.equal(acta.respondidas, 10);
  assert.equal(acta.sinRanking, false);
  assert.deepEqual([fila(acta, 'norte').x, fila(acta, 'norte').y], [5, 6]);
  assert.deepEqual([fila(acta, 'sur').x, fila(acta, 'sur').y], [4, 5]);
  assert.deepEqual([fila(acta, 'este').x, fila(acta, 'este').y], [3, 5]);
  assert.equal(fila(acta, 'norte').porcentajeTexto, '83 %');
  assert.equal(fila(acta, 'sur').porcentajeTexto, '80 %');
  assert.equal(fila(acta, 'este').porcentajeTexto, '60 %');
  assert.equal(fila(acta, 'oeste').aparte, true);
  assert.deepEqual(acta.clasificados.map(f => [f.partido, f.puesto]), [['norte', 1], ['sur', 2], ['este', 3]]);
  assert.deepEqual(acta.apartes.map(f => f.partido), ['oeste']);
  assert.equal(acta.frase, 'Coincides más con el programa de 2023 de Partido Norte');
  // Oeste no tiene propuesta de sanidad: ese tema no cuenta para él.
  assert.equal(fila(acta, 'oeste').desglose.find(d => d.tema === 'sanidad').sinPropuesta, true);
  assert.deepEqual(acta.porTema.map(t => t.favorita), ['norte', 'este', 'sur']);
  assert.equal(acta.palotes.length, 5 + 4 + 3);
});

test('empates: mismo puesto, juntos y en orden alfabético', () => {
  const respuestas = [
    r('vivienda', 'norte', 'si'), r('vivienda', 'sur', 'si', true), r('vivienda', 'este', 'si'), r('vivienda', 'oeste', 'no'),
    r('empleo', 'norte', 'si', true), r('empleo', 'sur', 'si'), r('empleo', 'este', 'no'), r('empleo', 'oeste', 'no'),
    r('sanidad', 'norte', 'no'), r('sanidad', 'sur', 'no'), r('sanidad', 'este', 'si', true),
  ];
  const acta = calcularActa({ banco, partidos, temas: TEMAS, respuestas });
  // Norte 3 de 4 y Sur 3 de 4: empatan. Este 3 de 4 también.
  assert.deepEqual(acta.clasificados.map(f => [f.nombre, f.puesto, f.empate]),
    [['Partido Este', 1, true], ['Partido Norte', 1, true], ['Partido Sur', 1, true], ['Partido Oeste', 4, false]]);
  assert.equal(acta.frase, 'Coincides más con el programa de 2023 de Partido Este, Partido Norte y Partido Sur');
});

test('mismo porcentaje redondeado sin empate: un decimal', () => {
  // 5 de 6 es 83,3 % y 83 de 100 es 83,0 %: los dos redondean a 83 sin estar empatados.
  const filas = ponerPorcentajes([{ x: 5, y: 6 }, { x: 83, y: 100 }, { x: 4, y: 5 }, { x: 8, y: 10 }]);
  assert.deepEqual(filas.map(f => f.porcentajeTexto), ['83,3\u00a0%', '83,0\u00a0%', '80\u00a0%', '80\u00a0%']);
});

test('todo «Paso»: sin ranking y todos los partidos aparte', () => {
  const respuestas = banco.tarjetas.filter(t => TEMAS.includes(t.tema)).map(t => ({ tarjeta: t.id, decision: 'paso' }));
  const acta = calcularActa({ banco, partidos, temas: TEMAS, respuestas });
  assert.equal(acta.respondidas, 0);
  assert.equal(acta.sinRanking, true);
  assert.equal(acta.clasificados.length, 0);
  assert.equal(acta.apartes.length, 4);
  for (const f of acta.filas) assert.deepEqual([f.x, f.y], [0, 0]);
});

test('partido sin tarjeta en un tema: ese tema no cuenta para él', () => {
  const respuestas = banco.tarjetas.filter(t => TEMAS.includes(t.tema)).map(t => ({ tarjeta: t.id, decision: t.partidos[0] === 'oeste' ? 'si' : 'no' }));
  const acta = calcularActa({ banco, partidos, temas: TEMAS, respuestas });
  const oeste = fila(acta, 'oeste');
  assert.equal(oeste.temasRespondidos, 2);
  assert.equal(oeste.aparte, false);
  // Vivienda y empleo: única convencida de cada tema, así que favorita (2 + 2). Sanidad no cuenta.
  assert.deepEqual([oeste.x, oeste.y], [4, 4]);
  assert.equal(oeste.porcentajeTexto, '100 %');
});

test('partido aparte: respuestas en menos de la mitad de los temas', () => {
  const acta = calcularActa({ banco, partidos, temas: TEMAS, importantes: ['vivienda'], respuestas: CASO });
  const oeste = fila(acta, 'oeste');
  assert.equal(oeste.temasRespondidos, 1);
  assert.equal(oeste.aparte, true);
  assert.equal(oeste.puesto, undefined);
});

test(`menos de ${MIN_PAPELETAS} papeletas respondidas: no hay ranking`, () => {
  const respuestas = CASO.slice(0, 7);
  const acta = calcularActa({ banco, partidos, temas: TEMAS, respuestas });
  assert.equal(acta.respondidas, 6);
  assert.equal(acta.sinRanking, true);
  assert.deepEqual(acta.primeros, []);
  assert.match(acta.frase, /Hacen falta al menos 8/);
});

test('si solo convence una papeleta del tema, es la favorita sin preguntar', () => {
  const respuestas = [r('vivienda', 'norte', 'si'), r('vivienda', 'sur', 'no'), r('vivienda', 'este', 'no'), r('vivienda', 'oeste', 'no')];
  const acta = calcularActa({ banco, partidos, temas: ['vivienda'], respuestas });
  assert.equal(fila(acta, 'norte').desglose[0].favorita, true);
  assert.deepEqual([fila(acta, 'norte').x, fila(acta, 'norte').y], [2, 2]);
});

test('errores claros con respuestas imposibles', () => {
  assert.throws(() => calcularActa({ banco, partidos, temas: TEMAS, respuestas: [{ tarjeta: 'no-existe', decision: 'si' }] }), /no existe/);
  assert.throws(() => calcularActa({ banco, partidos, temas: TEMAS, respuestas: [r('vivienda', 'norte', 'quizá')] }), /Decisión no válida/);
  assert.throws(() => calcularActa({ banco, partidos, temas: TEMAS, respuestas: [r('vivienda', 'norte', 'no', true)] }), /favorita/);
  assert.throws(() => calcularActa({ banco, partidos, temas: TEMAS, respuestas: [r('vivienda', 'norte', 'si', true), r('vivienda', 'sur', 'si', true)] }), /Más de una favorita/);
});

test('modos y partidos en juego', () => {
  assert.deepEqual(temasDelModo(banco, 'corto').map(t => t.id), ['vivienda', 'empleo', 'sanidad']);
  assert.equal(temasDelModo(banco, 'completo').length, 4);
  assert.equal(partidosEnJuego(partidos, null).length, 4);
});
