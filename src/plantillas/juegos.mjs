// Banco de los juegos: validación al construir y versión pública que se sirve en /test/.
// El banco aprobado (src/contenido/juegos/banco-2023.json) no se copia tal cual: solo sale lo que usa el test.

const CAMPOS_BANCO = ['anio', 'temas', 'documentos', 'tarjetas', 'glosario'];
const CAMPOS_TEMA = ['id', 'nombre', 'orden'];
const CAMPOS_DOCUMENTO = ['id', 'partido', 'titulo', 'url'];
const CAMPOS_TARJETA = ['id', 'tema', 'partidos', 'texto', 'cita', 'documento', 'pagina', 'enlace'];
const CAMPOS_TERMINO = ['id', 'termino', 'variantes', 'definicion', 'tarjetas'];
const CAMPOS_PARTIDO = ['id', 'nombre', 'ambito'];

function faltan(objeto, campos, donde, errores) {
  for (const c of campos) if (objeto[c] === undefined || objeto[c] === null || objeto[c] === '') errores.push(`${donde}: falta el campo «${c}»`);
}

// Devuelve la lista de errores (vacía si todo está bien). nombreBanco solo se usa en los mensajes.
export function validarBanco(banco, partidos, nombreBanco = 'el banco') {
  const errores = [];
  faltan(banco, CAMPOS_BANCO, nombreBanco, errores);
  if (errores.length) return errores;
  for (const p of partidos) faltan(p, CAMPOS_PARTIDO, `partido ${p.id || '(sin id)'}`, errores);
  const idsPartidos = new Set(partidos.map(p => p.id));
  const idsTemas = new Set(banco.temas.map(t => t.id));
  const idsDocumentos = new Set(banco.documentos.map(d => d.id));

  banco.temas.forEach((t, i) => faltan(t, CAMPOS_TEMA, `tema ${t.id || i + 1}`, errores));
  banco.documentos.forEach((d, i) => faltan(d, CAMPOS_DOCUMENTO, `documento ${d.id || i + 1}`, errores));
  const vistas = new Set();
  banco.tarjetas.forEach((t, i) => {
    const donde = `tarjeta ${t.id || i + 1}`;
    faltan(t, CAMPOS_TARJETA, donde, errores);
    if (vistas.has(t.id)) errores.push(`${donde}: id repetido`);
    vistas.add(t.id);
    if (Array.isArray(t.partidos) && t.partidos.length !== 1) errores.push(`${donde}: tiene ${t.partidos.length} partidos (debe tener uno)`);
    if (t.otrasCitas) errores.push(`${donde}: tiene más de una cita`);
    const partido = Array.isArray(t.partidos) ? t.partidos[0] : undefined;
    if (partido && !idsPartidos.has(partido)) errores.push(`${donde}: el partido «${partido}» no está en el archivo de partidos`);
    if (t.enlace && !/#page=\d+$/.test(t.enlace)) errores.push(`${donde}: el enlace no lleva #page=`);
    if (t.tema && !idsTemas.has(t.tema)) errores.push(`${donde}: el tema «${t.tema}» no existe`);
    if (t.documento && !idsDocumentos.has(t.documento)) errores.push(`${donde}: el documento «${t.documento}» no existe`);
    if (t.uso && t.uso !== 'test') errores.push(`${donde}: no es una tarjeta de test (uso «${t.uso}»)`);
  });
  for (const d of banco.documentos) if (d.partido && !idsPartidos.has(d.partido)) errores.push(`documento ${d.id}: el partido «${d.partido}» no está en el archivo de partidos`);
  banco.glosario.forEach((g, i) => {
    const donde = `término ${g.id || i + 1} del glosario`;
    faltan(g, CAMPOS_TERMINO, donde, errores);
    for (const id of g.tarjetas || []) if (!vistas.has(id)) errores.push(`${donde}: enlaza a la tarjeta «${id}», que no existe`);
  });
  return errores;
}

// Lo que usa el test: temas, documentos (id, partido, título y url), tarjetas (id, tema, partido, texto,
// cita, traduccion, documento, pagina y enlace) y glosario. Sin revision, omitido ni aprobacion.
export function bancoPublico(banco) {
  return {
    anio: banco.anio,
    temas: banco.temas.map(({ id, nombre, orden, corto }) => ({ id, nombre, orden, corto: !!corto })),
    documentos: banco.documentos.map(({ id, partido, titulo, url }) => ({ id, partido, titulo, url })),
    tarjetas: banco.tarjetas.map(t => ({
      id: t.id, tema: t.tema, partido: t.partidos[0], texto: t.texto, cita: t.cita,
      traduccion: t.traduccion || null, documento: t.documento, pagina: t.pagina, enlace: t.enlace,
    })),
    glosario: banco.glosario.map(({ id, termino, variantes, definicion, tarjetas }) => ({ id, termino, variantes, definicion, tarjetas })),
  };
}
