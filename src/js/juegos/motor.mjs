// Motor del test sin siglas: funciones puras, sin DOM ni red. Lo usan /test/ y las pruebas (node --test),
// y servirá también para la papeleta del día. Recibe una lista de respuestas y devuelve el acta.
//
// Reglas:
// - Cada papeleta de un partido que te convenció suma 1 palote; si era tu favorita del tema, 2.
// - En los temas que más te importan, todo cuenta ×2.
// - X es lo que sumó el partido. Y es lo que habría sumado si le hubieran convencido todas sus papeletas
//   que respondiste (una que no te convenció cuenta como 1; las que sí, con su valor real).
// - «Paso» no cuenta ni en X ni en Y. Si el partido no tiene tarjeta en un tema, ese tema no cuenta para él.
// - Si un partido tiene respuestas en menos de la mitad de los temas jugados, queda aparte.
// - Con menos de MIN_PAPELETAS respondidas en total no hay ranking.
// - Empates por la proporción exacta X/Y: mismo puesto, juntos, en orden alfabético.

export const MIN_PAPELETAS = 8;
export const DECISIONES = ['si', 'no', 'paso'];

// Una tarjeta del banco publicado lleva «partido»; la del banco aprobado, «partidos» con uno solo.
export const partidoDe = (t) => t.partido ?? t.partidos?.[0];

// Partidos que entran según la circunscripción: los estatales y los que se presentan en ella.
// Sin circunscripción («Prefiero no decirlo»), solo los estatales.
export function partidosEnJuego(partidos, circunscripcion) {
  return partidos.filter(p => p.ambito === 'estatal' || (circunscripcion && Array.isArray(p.ambito) && p.ambito.includes(circunscripcion)));
}

// Temas del modo: «corto» son los marcados con corto: true; «completo», todos. En el orden del banco.
export function temasDelModo(banco, modo) {
  const temas = [...banco.temas].sort((a, b) => a.orden - b.orden);
  return modo === 'corto' ? temas.filter(t => t.corto) : temas;
}

export const maxImportantes = (modo) => (modo === 'corto' ? 1 : 3);

// Papeletas de un tema para los partidos que juegan.
export function papeletasDelTema(banco, tema, idsPartidos) {
  return banco.tarjetas.filter(t => t.tema === tema && idsPartidos.includes(partidoDe(t)));
}

// Proporción exacta: a/b frente a c/d sin decimales.
const compara = (a, b) => b.x * a.y - a.x * b.y;

function porcentajeTexto(valor, decimales) {
  return `${decimales ? valor.toFixed(1).replace('.', ',') : Math.round(valor)} %`;
}

// Texto del porcentaje de cada fila. Si dos filas dan el mismo porcentaje redondeado sin estar
// empatadas (proporción X/Y distinta), esas filas van con un decimal: «83,3 %» y «83,0 %».
export function ponerPorcentajes(filas) {
  for (const f of filas) f.porcentaje = f.y ? (f.x / f.y) * 100 : 0;
  for (const f of filas) {
    const decimales = filas.some(o => o !== f && compara(o, f) !== 0 && Math.round(o.porcentaje) === Math.round(f.porcentaje));
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
 * @param {Object} entrada.banco        { temas, tarjetas } (cada tarjeta con id, tema y partido o partidos).
 * @param {Array}  entrada.partidos     Partidos que juegan: [{ id, nombre }].
 * @param {Array}  entrada.temas        Ids de los temas jugados.
 * @param {Array}  [entrada.importantes] Ids de los temas que cuentan doble.
 * @param {Array}  entrada.respuestas   [{ tarjeta, decision: 'si' | 'no' | 'paso', favorita? }].
 * @returns {Object} acta
 */
export function calcularActa({ banco, anio = 2023, partidos, temas, importantes = [], respuestas }) {
  const tarjetas = new Map(banco.tarjetas.map(t => [t.id, t]));
  const nombres = new Map(partidos.map(p => [p.id, p.nombre]));
  const vistas = new Set();

  const resp = respuestas.map((r) => {
    const t = tarjetas.get(r.tarjeta);
    if (!t) throw new Error(`Respuesta a una tarjeta que no existe: ${r.tarjeta}`);
    if (!DECISIONES.includes(r.decision)) throw new Error(`Decisión no válida en ${r.tarjeta}: ${r.decision}`);
    if (!temas.includes(t.tema)) throw new Error(`La tarjeta ${r.tarjeta} es de un tema que no se ha jugado (${t.tema})`);
    if (!nombres.has(partidoDe(t))) throw new Error(`La tarjeta ${r.tarjeta} es de un partido que no juega (${partidoDe(t)})`);
    if (vistas.has(r.tarjeta)) throw new Error(`Respuesta repetida: ${r.tarjeta}`);
    vistas.add(r.tarjeta);
    if (r.favorita && r.decision !== 'si') throw new Error(`La favorita tiene que ser una papeleta que te convenció: ${r.tarjeta}`);
    return { tarjeta: r.tarjeta, decision: r.decision, favorita: !!r.favorita, tema: t.tema, partido: partidoDe(t) };
  });

  // Por tema: una favorita como mucho; si solo convenció una, es la favorita sin preguntar.
  for (const tema of temas) {
    const si = resp.filter(r => r.tema === tema && r.decision === 'si');
    if (si.filter(r => r.favorita).length > 1) throw new Error(`Más de una favorita en ${tema}`);
    if (si.length === 1) si[0].favorita = true;
  }

  const respondidas = resp.filter(r => r.decision !== 'paso').length;

  const filas = partidos.map((p) => {
    const desglose = temas.map((tema) => {
      const doble = importantes.includes(tema);
      const peso = doble ? 2 : 1;
      const tarjeta = banco.tarjetas.find(t => t.tema === tema && partidoDe(t) === p.id);
      if (!tarjeta) return { tema, sinPropuesta: true, doble, puntos: 0, maximo: 0 };
      const r = resp.find(x => x.tarjeta === tarjeta.id);
      if (!r || r.decision === 'paso') return { tema, tarjeta: tarjeta.id, decision: r ? 'paso' : null, doble, puntos: 0, maximo: 0 };
      const valor = r.decision === 'si' && r.favorita ? 2 : 1;
      return {
        tema, tarjeta: tarjeta.id, decision: r.decision, favorita: r.decision === 'si' && r.favorita, doble,
        puntos: r.decision === 'si' ? valor * peso : 0,
        maximo: valor * peso,
      };
    });
    const x = desglose.reduce((a, d) => a + d.puntos, 0);
    const y = desglose.reduce((a, d) => a + d.maximo, 0);
    const temasRespondidos = desglose.filter(d => d.decision === 'si' || d.decision === 'no').length;
    return {
      partido: p.id, nombre: p.nombre, x, y, temasRespondidos, desglose,
      aparte: temasRespondidos * 2 < temas.length,
      porcentaje: y ? (x / y) * 100 : 0,
    };
  });

  const clasificados = filas.filter(f => !f.aparte)
    .sort((a, b) => compara(a, b) || a.nombre.localeCompare(b.nombre, 'es'));
  clasificados.forEach((f, i) => {
    const anterior = clasificados[i - 1];
    f.puesto = anterior && compara(anterior, f) === 0 ? anterior.puesto : i + 1;
    f.empate = clasificados.some(o => o !== f && compara(o, f) === 0);
  });
  ponerPorcentajes(clasificados);
  const apartes = filas.filter(f => f.aparte).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  const sinRanking = respondidas < MIN_PAPELETAS || clasificados.length === 0;
  const primeros = sinRanking ? [] : clasificados.filter(f => f.puesto === 1);
  let frase;
  if (respondidas < MIN_PAPELETAS) frase = `Has respondido ${respondidas} ${respondidas === 1 ? 'papeleta' : 'papeletas'}. Hacen falta al menos ${MIN_PAPELETAS} para comparar programas.`;
  else if (!clasificados.length) frase = 'Has respondido pocas papeletas de cada partido para comparar programas.';
  else if (primeros[0].x === 0) frase = 'Ninguna propuesta te convenció lo bastante para destacar un programa.';
  else frase = `Coincides más con el programa de ${anio} de ${listaNombres(primeros.map(f => f.nombre))}`;

  // Vista por temas: qué partido te convenció más en cada uno (la favorita) y cuáles te convencieron.
  const porTema = temas.map((tema) => {
    const delTema = resp.filter(r => r.tema === tema);
    const favorita = delTema.find(r => r.favorita);
    return {
      tema,
      favorita: favorita ? favorita.partido : null,
      favoritaTarjeta: favorita ? favorita.tarjeta : null,
      convencieron: delTema.filter(r => r.decision === 'si').map(r => r.partido),
      doble: importantes.includes(tema),
      pasadas: delTema.filter(r => r.decision === 'paso').length,
    };
  });

  // Palotes en el orden en que se cuentan las papeletas, para el recuento animado.
  const palotes = [];
  for (const f of filas) for (const d of f.desglose) for (let i = 0; i < d.puntos; i++) palotes.push(f.partido);

  return {
    temas: [...temas], importantes: [...importantes], respondidas, sinRanking, frase,
    primeros: primeros.map(f => f.partido),
    filas: [...clasificados, ...apartes], clasificados, apartes, porTema, palotes,
  };
}
