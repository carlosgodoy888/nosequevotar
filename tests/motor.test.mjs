// Pruebas del motor del test con el banco de ejemplo (partidos inventados). node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  calcularResultado, ponerPorcentajes, partidosEnJuego, partidosSinPrograma, papeletasDelTema, contarPreguntas,
  minutos, textoMinutos, temasEnOrden, MIN_RESPUESTAS, MIN_TEMAS,
} from '../src/js/juegos/motor.mjs';

const leer = (ruta) => JSON.parse(readFileSync(new URL(ruta, import.meta.url), 'utf8'));
const banco = leer('./ejemplo/banco-ejemplo.json');
const todos = leer('./ejemplo/partidos-ejemplo.json');
const partidos = partidosEnJuego(todos, 'madrid');
const ids = partidos.map(p => p.id);
const TEMAS = ['vivienda', 'empleo', 'sanidad'];
const r = (tema, partido, n, decision) => ({ tarjeta: `e-${tema}-${partido}-${n}`, decision });
const tres = (tema, partido, decisiones) => decisiones.map((d, i) => r(tema, partido, i + 1, d));
const fila = (res, partido) => res.filas.find(f => f.partido === partido);
// Los porcentajes llevan signo (el menos, tipográfico) y espacio duro antes del %.
const pct = (n) => `${String(n).replace('-', String.fromCharCode(8722))}${String.fromCharCode(160)}%`;

test('candidaturas que juegan: las que se presentan en la circunscripción y tienen programa', () => {
  assert.deepEqual(ids, ['norte', 'sur', 'este', 'oeste']);
  assert.deepEqual(partidosSinPrograma(todos, 'madrid').map(p => p.id), ['centro']);
  assert.deepEqual(partidosEnJuego(todos, 'soria').map(p => p.id), ['norte', 'sur', 'este']);
  assert.deepEqual(partidosSinPrograma(todos, 'soria'), []);
  assert.deepEqual(partidosEnJuego(todos, 'lugo'), []);
});

test('rápido: una medida por candidatura y tema; completo: hasta tres', () => {
  assert.deepEqual(papeletasDelTema(banco, 'vivienda', ids, 'rapido').map(t => t.id), ['e-vivienda-norte-1', 'e-vivienda-sur-1', 'e-vivienda-este-1', 'e-vivienda-oeste-1']);
  assert.equal(papeletasDelTema(banco, 'vivienda', ids, 'completo').length, 12);
  // Oeste no tiene medidas de sanidad y Este solo tiene dos.
  assert.equal(papeletasDelTema(banco, 'sanidad', ids, 'rapido').length, 3);
  assert.equal(papeletasDelTema(banco, 'sanidad', ids, 'completo').length, 8);
  assert.equal(contarPreguntas(banco, TEMAS, ids, 'rapido'), 11);
  assert.equal(contarPreguntas(banco, TEMAS, ids, 'completo'), 32);
  assert.throws(() => papeletasDelTema(banco, 'vivienda', ids, 'largo'), /Modo no válido/);
});

test('duración: diez segundos por pregunta, truncada a minutos', () => {
  assert.equal(minutos(11), 1);
  assert.equal(minutos(32), 5);
  assert.equal(minutos(5), 0);
  assert.equal(textoMinutos(0), 'menos de 1 minuto');
  assert.equal(textoMinutos(1), '1 minuto');
  assert.equal(textoMinutos(12), '12 minutos');
  assert.equal(MIN_TEMAS, 3);
});

test('los temas salen en el orden estándar del banco', () => {
  assert.deepEqual(temasEnOrden({ temas: [{ id: 'b', orden: 2 }, { id: 'a', orden: 1 }] }).map(t => t.id), ['a', 'b']);
});

test('a favor suma, en contra resta y la abstención vale cero', () => {
  // Las tres medidas de Norte en vivienda, votadas de todas las maneras.
  const casos = [
    [['favor', 'favor', 'favor'], 1],
    [['favor', 'favor', 'abstencion'], 2 / 3],
    [['favor', 'favor', 'contra'], 1 / 3],
    [['favor', 'abstencion', 'abstencion'], 1 / 3],
    [['abstencion', 'abstencion', 'abstencion'], 0],
    [['favor', 'contra', 'abstencion'], 0],
    [['favor', 'contra', 'contra'], -1 / 3],
    [['contra', 'contra', 'abstencion'], -2 / 3],
    [['contra', 'contra', 'contra'], -1],
  ];
  for (const [votos, esperado] of casos) {
    const res = calcularResultado({ banco, partidos, temas: TEMAS, modo: 'completo', respuestas: tres('vivienda', 'norte', votos) });
    const d = fila(res, 'norte').desglose.find(x => x.tema === 'vivienda');
    assert.ok(Math.abs(d.afinidad - esperado) < 1e-9, `${votos.join(', ')}: ${d.afinidad}`);
  }
});

test('cada tema pesa lo mismo, tenga la candidatura una medida o tres', () => {
  const temas = ['vivienda', 'empleo', 'pensiones'];
  const respuestas = [
    // Este: +1 en vivienda (3 a favor), 0 en empleo (3 abstenciones) y −1 en pensiones (su única medida, en contra): 0 %.
    ...tres('vivienda', 'este', ['favor', 'favor', 'favor']), ...tres('empleo', 'este', ['abstencion', 'abstencion', 'abstencion']), r('pensiones', 'este', 1, 'contra'),
    // Norte: +1/3, +1 y −1: +11 %.
    ...tres('vivienda', 'norte', ['favor', 'favor', 'contra']), ...tres('empleo', 'norte', ['favor', 'favor', 'favor']), ...tres('pensiones', 'norte', ['contra', 'contra', 'contra']),
    // Sur: todo a favor.
    ...tres('vivienda', 'sur', ['favor', 'favor', 'favor']), ...tres('empleo', 'sur', ['favor', 'favor', 'favor']), ...tres('pensiones', 'sur', ['favor', 'favor', 'favor']),
  ];
  const res = calcularResultado({ banco, partidos, temas, modo: 'completo', respuestas });
  assert.equal(res.respondidas, 22);
  assert.equal(res.abstenciones, 3);
  assert.equal(res.preguntas, 34);
  assert.equal(res.sinRanking, false);
  assert.equal(fila(res, 'este').porcentajeTexto, pct('0'));
  // Un tema con solo abstenciones cuenta, y vale cero.
  assert.equal(fila(res, 'este').temasConDatos, 3);
  assert.deepEqual([fila(res, 'este').favor, fila(res, 'este').contra, fila(res, 'este').abstencion, fila(res, 'este').respondidas], [3, 1, 3, 4]);
  assert.equal(fila(res, 'norte').porcentajeTexto, pct('+11'));
  assert.equal(fila(res, 'sur').porcentajeTexto, pct('+100'));
  assert.deepEqual(res.clasificados.map(f => [f.partido, f.puesto]), [['sur', 1], ['norte', 2], ['este', 3]]);
  // Oeste no ha recibido ningún voto: aparte, sin porcentaje.
  assert.deepEqual(res.apartes.map(f => f.partido), ['oeste']);
  assert.equal(fila(res, 'oeste').afinidad, null);
  assert.equal(res.frase, 'Encajas más con Partido Sur');
  assert.deepEqual(res.primeros, ['sur']);
  // Tema a tema, con todos los empatados.
  assert.deepEqual(res.porTema.map(t => [t.tema, t.estado, t.mejores]), [
    ['vivienda', 'mejores', ['este', 'sur']],
    ['empleo', 'mejores', ['norte', 'sur']],
    ['pensiones', 'mejores', ['sur']],
  ]);
});

test('empates: mismo puesto, juntos y en orden alfabético; un tema sin medidas no cuenta', () => {
  const respuestas = [
    r('vivienda', 'norte', 1, 'favor'), r('empleo', 'norte', 1, 'favor'), r('sanidad', 'norte', 1, 'contra'),
    r('vivienda', 'sur', 1, 'favor'), r('empleo', 'sur', 1, 'contra'), r('sanidad', 'sur', 1, 'favor'),
    r('vivienda', 'este', 1, 'contra'), r('empleo', 'este', 1, 'contra'), r('sanidad', 'este', 1, 'contra'),
    r('vivienda', 'oeste', 1, 'favor'), r('empleo', 'oeste', 1, 'favor'),
  ];
  const res = calcularResultado({ banco, partidos, temas: TEMAS, modo: 'rapido', respuestas });
  assert.deepEqual(res.clasificados.map(f => [f.nombre, f.puesto, f.empate, f.porcentajeTexto]), [
    ['Partido Oeste', 1, false, pct('+100')], ['Partido Norte', 2, true, pct('+33')], ['Partido Sur', 2, true, pct('+33')], ['Partido Este', 4, false, pct('-100')],
  ]);
  // Oeste no tiene medidas de sanidad: su afinidad sale de los otros dos temas y el resultado lo dice.
  assert.deepEqual(fila(res, 'oeste').sinMedidas, ['sanidad']);
  assert.equal(fila(res, 'oeste').desglose.find(d => d.tema === 'sanidad').sinMedidas, true);
  assert.equal(fila(res, 'oeste').aparte, false);
  assert.deepEqual(res.porTema.find(t => t.tema === 'vivienda').mejores, ['norte', 'oeste', 'sur']);
  assert.deepEqual(res.porTema.find(t => t.tema === 'sanidad').mejores, ['sur']);
});

test('abstenerse no deja fuera a una candidatura: cuenta como cero', () => {
  const respuestas = [
    r('vivienda', 'norte', 1, 'favor'), r('empleo', 'norte', 1, 'favor'), r('sanidad', 'norte', 1, 'favor'),
    r('vivienda', 'sur', 1, 'favor'), r('empleo', 'sur', 1, 'contra'), r('sanidad', 'sur', 1, 'abstencion'),
    r('vivienda', 'este', 1, 'favor'), r('empleo', 'este', 1, 'abstencion'), r('sanidad', 'este', 1, 'abstencion'),
    r('vivienda', 'oeste', 1, 'contra'), r('empleo', 'oeste', 1, 'contra'),
  ];
  const res = calcularResultado({ banco, partidos, temas: TEMAS, modo: 'rapido', respuestas });
  assert.deepEqual(res.apartes, []);
  assert.deepEqual(res.clasificados.map(f => [f.partido, f.puesto, f.porcentajeTexto]), [
    ['norte', 1, pct('+100')], ['este', 2, pct('+33')], ['sur', 3, pct('0')], ['oeste', 4, pct('-100')],
  ]);
  // En empleo, Sur y Oeste van en contra y Este se abstiene; en sanidad solo hay un voto a favor, el de Norte.
  assert.deepEqual(res.porTema.map(t => [t.tema, t.mejores]), [['vivienda', ['este', 'norte', 'sur']], ['empleo', ['norte']], ['sanidad', ['norte']]]);
});

test('aparte: medidas en menos de la mitad de los temas elegidos', () => {
  // Un banco en el que Oeste solo tiene medidas de vivienda: 1 de 3 temas.
  const recortado = { ...banco, tarjetas: banco.tarjetas.filter(t => t.partido !== 'oeste' || t.tema === 'vivienda') };
  const respuestas = TEMAS.flatMap(tema => papeletasDelTema(recortado, tema, ids, 'rapido')).map(t => ({ tarjeta: t.id, decision: 'favor' }));
  const res = calcularResultado({ banco: recortado, partidos, temas: TEMAS, modo: 'rapido', respuestas });
  assert.equal(fila(res, 'oeste').aparte, true);
  assert.equal(fila(res, 'oeste').puesto, undefined);
  assert.deepEqual(fila(res, 'oeste').sinMedidas, ['empleo', 'sanidad']);
  assert.deepEqual(res.apartes.map(f => f.partido), ['oeste']);
  assert.deepEqual(res.primeros, ['este', 'norte', 'sur']);
});

test('todo abstenciones: todas las candidaturas a cero y sin clasificación', () => {
  const respuestas = TEMAS.flatMap(tema => papeletasDelTema(banco, tema, ids, 'rapido')).map(t => ({ tarjeta: t.id, decision: 'abstencion' }));
  const res = calcularResultado({ banco, partidos, temas: TEMAS, modo: 'rapido', respuestas });
  assert.equal(res.respondidas, 0);
  assert.equal(res.abstenciones, 11);
  assert.equal(res.sinRanking, true);
  assert.deepEqual(res.primeros, []);
  assert.ok(res.filas.every(f => f.afinidad === 0 && !f.aparte));
  assert.deepEqual(res.porTema.map(t => t.estado), ['sin-votos', 'sin-votos', 'sin-votos']);
});

test(`menos de ${MIN_RESPUESTAS} votos a favor o en contra: no hay clasificación`, () => {
  const respuestas = [
    r('vivienda', 'norte', 1, 'favor'), r('empleo', 'norte', 1, 'favor'), r('sanidad', 'norte', 1, 'contra'),
    r('vivienda', 'sur', 1, 'favor'), r('empleo', 'sur', 1, 'contra'), r('sanidad', 'sur', 1, 'favor'), r('vivienda', 'este', 1, 'abstencion'),
  ];
  const res = calcularResultado({ banco, partidos, temas: TEMAS, modo: 'rapido', respuestas });
  assert.equal(res.respondidas, 6);
  assert.equal(res.sinRanking, true);
  assert.deepEqual(res.primeros, []);
  assert.match(res.frase, /Hacen falta al menos 8/);
});

test('todo en contra: −100 % con todas y no destaca a ninguna', () => {
  const respuestas = TEMAS.flatMap(tema => papeletasDelTema(banco, tema, ids, 'rapido')).map(t => ({ tarjeta: t.id, decision: 'contra' }));
  const res = calcularResultado({ banco, partidos, temas: TEMAS, modo: 'rapido', respuestas });
  assert.equal(res.sinRanking, false);
  assert.equal(res.frase, 'No encajas con ninguna candidatura');
  assert.deepEqual(res.primeros, []);
  assert.deepEqual(res.porTema.map(t => t.estado), ['ninguna', 'ninguna', 'ninguna']);
  assert.ok(res.clasificados.every(f => f.puesto === 1 && f.empate && f.porcentajeTexto === pct('-100')));
});

test('más en contra que a favor de todas: hay clasificación, pero no «encajas» con ninguna', () => {
  // Norte: +1, −1 y −1, es decir, −33 %. Las demás, todo en contra.
  const respuestas = TEMAS.flatMap(tema => papeletasDelTema(banco, tema, ids, 'rapido'))
    .map(t => ({ tarjeta: t.id, decision: t.id === 'e-vivienda-norte-1' ? 'favor' : 'contra' }));
  const res = calcularResultado({ banco, partidos, temas: TEMAS, modo: 'rapido', respuestas });
  assert.equal(fila(res, 'norte').puesto, 1);
  assert.equal(fila(res, 'norte').porcentajeTexto, pct('-33'));
  assert.deepEqual(res.primeros, []);
  assert.equal(res.frase, 'No encajas con ninguna candidatura');
  // En vivienda sí encaja con Norte; en los otros dos temas, con ninguna.
  assert.deepEqual(res.porTema.map(t => [t.estado, t.mejores]), [['mejores', ['norte']], ['ninguna', []], ['ninguna', []]]);
});

test('porcentajes con signo; mismo porcentaje redondeado sin empate: un decimal', () => {
  // 5 de 6 es 83,3 % y 0,83 es 83,0 %: los dos redondean a 83 sin estar empatados.
  const filas = ponerPorcentajes([{ afinidad: 5 / 6 }, { afinidad: 0.83 }, { afinidad: 0.8 }, { afinidad: 0.8 }, { afinidad: 0 }, { afinidad: -0.5 }, { afinidad: -1 }]);
  assert.deepEqual(filas.map(f => f.porcentajeTexto), [pct('+83,3'), pct('+83,0'), pct('+80'), pct('+80'), pct('0'), pct('-50'), pct('-100')]);
  // Un cero y dos casi ceros sin empatar: con un decimal, y el cero sin signo.
  assert.deepEqual(ponerPorcentajes([{ afinidad: 0.004 }, { afinidad: 0 }, { afinidad: -0.004 }]).map(f => f.porcentajeTexto), [pct('+0,4'), pct('0,0'), pct('-0,4')]);
});

test('errores claros con respuestas imposibles', () => {
  const base = { banco, partidos, temas: TEMAS, modo: 'rapido' };
  assert.throws(() => calcularResultado({ ...base, respuestas: [{ tarjeta: 'no-existe', decision: 'favor' }] }), /no existe/);
  assert.throws(() => calcularResultado({ ...base, respuestas: [r('vivienda', 'norte', 1, 'quizá')] }), /Decisión no válida/);
  assert.throws(() => calcularResultado({ ...base, respuestas: [r('vivienda', 'norte', 1, 'favor'), r('vivienda', 'norte', 1, 'contra')] }), /Respuesta repetida/);
  // Una medida del test completo no entra en el rápido, ni una de un tema que no se ha elegido.
  assert.throws(() => calcularResultado({ ...base, respuestas: [r('vivienda', 'norte', 2, 'favor')] }), /no entra en este test/);
  assert.throws(() => calcularResultado({ ...base, respuestas: [r('pensiones', 'norte', 1, 'favor')] }), /no entra en este test/);
  // Ni la de una candidatura que no se presenta en la circunscripción.
  const enSoria = partidosEnJuego(todos, 'soria');
  assert.throws(() => calcularResultado({ ...base, partidos: enSoria, respuestas: [r('vivienda', 'oeste', 1, 'favor')] }), /no entra en este test/);
});
