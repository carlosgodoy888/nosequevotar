// Motor del test sin siglas: funciones puras, sin DOM ni red. Lo usan /test/ y las pruebas (node --test).
//
// Cómo funciona el test:
// - Entran las candidaturas que se presentan en la circunscripción de quien lo hace y tienen programa.
// - Quien lo hace elige temas (MIN_TEMAS como mínimo) y un modo: en «rápido» ve una medida de cada
//   candidatura por tema (la n.º 1 del banco); en «completo», hasta tres.
// - A cada medida vota «a favor», «en contra» o «abstención».
//
// Cómo se mide la afinidad con una candidatura:
// - Cada voto a una medida suya vale: a favor, +1; abstención, 0; en contra, −1.
// - En cada tema: suma de esos votos ÷ medidas suyas votadas. Va de −1 (en contra de todas) a +1 (a favor
//   de todas). Dos a favor y una abstención dan +0,67; tres a favor, +1; todo abstenciones, 0.
// - La afinidad es la media de sus temas: todos los temas pesan lo mismo, tenga en ellos una medida o tres.
//   Se enseña de −100 % a +100 %.
// - Un tema en el que la candidatura no tiene medidas no cuenta para ella.
// - Si tiene medidas en menos de la mitad de los temas elegidos, sale aparte, sin porcentaje.
// - Con menos de MIN_RESPUESTAS votos a favor o en contra en total no hay clasificación.
// - Empates: mismo puesto, juntos, en orden alfabético.
// - Solo se dice «encajas más con…» de candidaturas con afinidad positiva.

export const MIN_TEMAS = 3;
export const MIN_RESPUESTAS = 8;
export const SEGUNDOS_POR_PREGUNTA = 10;
export const MODOS = { rapido: 1, completo: 3 };
export const DECISIONES = ['favor', 'contra', 'abstencion'];

const IGUAL = 1e-9;
// Espacio duro entre la cifra y el signo de porcentaje, para que no se separen al cambiar de línea.
const DURO = String.fromCharCode(160);
// Signo menos tipográfico (U+2212), del mismo ancho que el signo más.
const MENOS = String.fromCharCode(8722);
const mismo = (a, b) => Math.abs(a - b) < IGUAL;

export const temasEnOrden = (banco) => [...banco.temas].sort((a, b) => a.orden - b.orden);

// Candidaturas que juegan: las que se presentan en la circunscripción y tienen programa o documento general.
export function partidosEnJuego(partidos, circunscripcion) {
  return partidos.filter(p => p.documento && p.circunscripciones.includes(circunscripcion));
}

// Candidaturas que se presentan en la circunscripción y no entran porque no han publicado programa.
export function partidosSinPrograma(partidos, circunscripcion) {
  return partidos.filter(p => !p.documento && p.circunscripciones.includes(circunscripcion));
}

// Papeletas de un tema para las candidaturas que juegan, según el modo.
export function papeletasDelTema(banco, tema, idsPartidos, modo) {
  const maximo = MODOS[modo];
  if (!maximo) throw new Error(`Modo no válido: ${modo}`);
  return banco.tarjetas.filter(t => t.tema === tema && t.puesto <= maximo && idsPartidos.includes(t.partido));
}

export function contarPreguntas(banco, temas, idsPartidos, modo) {
  return temas.reduce((n, tema) => n + papeletasDelTema(banco, tema, idsPartidos, modo).length, 0);
}

// Estimación de la duración, truncada a minutos.
export const minutos = (preguntas) => Math.floor((preguntas * SEGUNDOS_POR_PREGUNTA) / 60);

export function textoMinutos(n) {
  if (n < 1) return 'menos de 1 minuto';
  return n === 1 ? '1 minuto' : `${n} minutos`;
}

// Con signo: «+67 %», «−33 %». El cero va sin signo.
function porcentajeTexto(valor, decimales) {
  const cifra = decimales ? Math.abs(valor).toFixed(1) : String(Math.round(Math.abs(valor)));
  const signo = Number(cifra) === 0 ? '' : (valor > 0 ? '+' : MENOS);
  return `${signo}${cifra.replace('.', ',')}${DURO}%`;
}

// Texto del porcentaje de cada fila (de −100 a +100). Si dos filas dan el mismo porcentaje redondeado
// sin estar empatadas, esas filas van con un decimal: «+83,3 %» y «+83,0 %».
export function ponerPorcentajes(filas) {
  for (const f of filas) f.porcentaje = f.afinidad * 100;
  for (const f of filas) {
    const decimales = filas.some(o => o !== f && !mismo(o.afinidad, f.afinidad) && Math.round(o.porcentaje) === Math.round(f.porcentaje));
    f.porcentajeTexto = porcentajeTexto(f.porcentaje, decimales);
  }
  return filas;
}

export function listaNombres(nombres) {
  if (nombres.length <= 1) return nombres.join('');
  return `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}`;
}

/**
 * @param {Object} entrada
 * @param {Object} entrada.banco       { temas, tarjetas } (cada tarjeta con id, tema, partido y puesto).
 * @param {Array}  entrada.partidos    Candidaturas que juegan: [{ id, nombre }].
 * @param {Array}  entrada.temas       Ids de los temas elegidos.
 * @param {string} entrada.modo        'rapido' | 'completo'.
 * @param {Array}  entrada.respuestas  [{ tarjeta, decision: 'favor' | 'contra' | 'abstencion' }].
 * @returns {Object} resultado
 */
export function calcularResultado({ banco, partidos, temas, modo, respuestas }) {
  const ids = partidos.map(p => p.id);
  const enJuego = new Map(temas.flatMap(tema => papeletasDelTema(banco, tema, ids, modo)).map(t => [t.id, t]));
  const decisiones = new Map();
  for (const r of respuestas) {
    if (!banco.tarjetas.some(t => t.id === r.tarjeta)) throw new Error(`Respuesta a una tarjeta que no existe: ${r.tarjeta}`);
    if (!DECISIONES.includes(r.decision)) throw new Error(`Decisión no válida en ${r.tarjeta}: ${r.decision}`);
    if (!enJuego.has(r.tarjeta)) throw new Error(`La tarjeta ${r.tarjeta} no entra en este test (otro tema, otro modo o una candidatura que no juega)`);
    if (decisiones.has(r.tarjeta)) throw new Error(`Respuesta repetida: ${r.tarjeta}`);
    decisiones.set(r.tarjeta, r.decision);
  }

  const cuenta = (tarjetas, decision) => tarjetas.filter(t => decisiones.get(t.id) === decision).length;
  const respondidas = [...decisiones.values()].filter(d => d !== 'abstencion').length;

  const filas = partidos.map((p) => {
    const desglose = temas.map((tema) => {
      const tarjetas = [...enJuego.values()].filter(t => t.tema === tema && t.partido === p.id).sort((a, b) => a.puesto - b.puesto);
      const favor = cuenta(tarjetas, 'favor');
      const contra = cuenta(tarjetas, 'contra');
      const abstencion = cuenta(tarjetas, 'abstencion');
      const votadas = favor + contra + abstencion;
      return {
        tema, sinMedidas: tarjetas.length === 0, favor, contra, abstencion,
        afinidad: votadas ? (favor - contra) / votadas : null,
        tarjetas: tarjetas.map(t => ({ id: t.id, decision: decisiones.get(t.id) || null })),
      };
    });
    const conDatos = desglose.filter(d => d.afinidad !== null);
    return {
      partido: p.id, nombre: p.nombre, desglose,
      favor: desglose.reduce((n, d) => n + d.favor, 0),
      contra: desglose.reduce((n, d) => n + d.contra, 0),
      abstencion: desglose.reduce((n, d) => n + d.abstencion, 0),
      respondidas: desglose.reduce((n, d) => n + d.favor + d.contra, 0),
      temasConDatos: conDatos.length,
      sinMedidas: desglose.filter(d => d.sinMedidas).map(d => d.tema),
      afinidad: conDatos.length ? conDatos.reduce((s, d) => s + d.afinidad, 0) / conDatos.length : null,
      aparte: conDatos.length * 2 < temas.length,
    };
  });

  const clasificados = filas.filter(f => !f.aparte)
    .sort((a, b) => (mismo(a.afinidad, b.afinidad) ? a.nombre.localeCompare(b.nombre, 'es') : b.afinidad - a.afinidad));
  clasificados.forEach((f, i) => {
    const anterior = clasificados[i - 1];
    f.puesto = anterior && mismo(anterior.afinidad, f.afinidad) ? anterior.puesto : i + 1;
    f.empate = clasificados.some(o => o !== f && mismo(o.afinidad, f.afinidad));
  });
  ponerPorcentajes(clasificados);
  const apartes = filas.filter(f => f.aparte).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  const sinRanking = respondidas < MIN_RESPUESTAS || clasificados.length === 0;
  // Solo encabezan el resultado las candidaturas con afinidad positiva: con cero o menos no se «encaja».
  const primeros = sinRanking ? [] : clasificados.filter(f => f.puesto === 1 && f.afinidad > IGUAL);
  let frase;
  if (respondidas < MIN_RESPUESTAS) frase = `Has votado a favor o en contra de ${respondidas} ${respondidas === 1 ? 'medida' : 'medidas'}. Hacen falta al menos ${MIN_RESPUESTAS} para darte un resultado.`;
  else if (!clasificados.length) frase = 'Ninguna candidatura tiene medidas en bastantes de tus temas para darte un resultado.';
  else if (!primeros.length) frase = 'No encajas con ninguna candidatura';
  else frase = `Encajas más con ${listaNombres(primeros.map(f => f.nombre))}`;

  // Tema a tema: con qué candidaturas encajas más en cada uno (todas las empatadas). Si en el tema solo
  // hay abstenciones, «sin-votos»; si la mejor afinidad es cero o negativa, «ninguna».
  const porTema = temas.map((tema) => {
    const datos = filas.map(f => ({ f, d: f.desglose.find(x => x.tema === tema) })).filter(x => x.d.afinidad !== null);
    if (!datos.some(x => x.d.favor + x.d.contra > 0)) return { tema, estado: 'sin-votos', mejores: [], afinidad: null };
    const mejor = Math.max(...datos.map(x => x.d.afinidad));
    if (mejor < IGUAL) return { tema, estado: 'ninguna', mejores: [], afinidad: mejor };
    const mejores = datos.filter(x => mismo(x.d.afinidad, mejor)).map(x => x.f).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    return { tema, estado: 'mejores', mejores: mejores.map(f => f.partido), afinidad: mejor };
  });

  return {
    temas: [...temas], modo, respondidas, abstenciones: decisiones.size - respondidas, preguntas: enJuego.size,
    sinRanking, frase, primeros: primeros.map(f => f.partido),
    filas: [...clasificados, ...apartes], clasificados, apartes, porTema,
  };
}
