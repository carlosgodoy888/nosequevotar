// Banco del test: validación al construir y versión pública que se sirve en /test/.
// El banco (src/contenido/juegos/banco-2026.json) lo genera scripts/investigacion/generar-banco.mjs.
// No se copia tal cual: solo sale lo que usa el test.

const CAMPOS_BANCO = ['anio', 'temas', 'documentos', 'tarjetas'];
const CAMPOS_TEMA = ['id', 'nombre', 'orden'];
const CAMPOS_DOCUMENTO = ['id', 'partido', 'titulo', 'url', 'clase'];
const CAMPOS_TARJETA = ['id', 'tema', 'partido', 'puesto', 'texto', 'cita', 'documento', 'pagina'];
const CAMPOS_PARTIDO = ['id', 'nombre', 'circunscripciones'];
export const MAX_POR_TEMA = 3;

function faltan(objeto, campos, donde, errores) {
  for (const c of campos) if (objeto[c] === undefined || objeto[c] === null || objeto[c] === '') errores.push(`${donde}: falta el campo «${c}»`);
}

// Devuelve la lista de errores (vacía si todo está bien). nombreBanco solo se usa en los mensajes.
export function validarBanco(banco, partidos, nombreBanco = 'el banco') {
  const errores = [];
  faltan(banco, CAMPOS_BANCO, nombreBanco, errores);
  if (errores.length) return errores;
  for (const p of partidos) {
    faltan(p, CAMPOS_PARTIDO, `partido ${p.id || '(sin id)'}`, errores);
    if (p.documento === undefined) errores.push(`partido ${p.id}: falta el campo «documento» (null si no ha publicado programa)`);
  }
  const porId = new Map(partidos.map(p => [p.id, p]));
  const idsTemas = new Set(banco.temas.map(t => t.id));
  const documentos = new Map(banco.documentos.map(d => [d.id, d]));

  banco.temas.forEach((t, i) => faltan(t, CAMPOS_TEMA, `tema ${t.id || i + 1}`, errores));
  banco.documentos.forEach((d, i) => {
    faltan(d, CAMPOS_DOCUMENTO, `documento ${d.id || i + 1}`, errores);
    if (d.partido && !porId.has(d.partido)) errores.push(`documento ${d.id}: el partido «${d.partido}» no está en el archivo de partidos`);
  });
  const vistas = new Set();
  const puestos = new Map();
  banco.tarjetas.forEach((t, i) => {
    const donde = `tarjeta ${t.id || i + 1}`;
    faltan(t, CAMPOS_TARJETA, donde, errores);
    if (vistas.has(t.id)) errores.push(`${donde}: id repetido`);
    vistas.add(t.id);
    const partido = porId.get(t.partido);
    if (t.partido && !partido) errores.push(`${donde}: el partido «${t.partido}» no está en el archivo de partidos`);
    if (partido && !partido.documento) errores.push(`${donde}: el partido «${t.partido}» figura sin programa`);
    if (t.tema && !idsTemas.has(t.tema)) errores.push(`${donde}: el tema «${t.tema}» no existe`);
    const doc = documentos.get(t.documento);
    if (t.documento && !doc) errores.push(`${donde}: el documento «${t.documento}» no existe`);
    if (doc && doc.partido !== t.partido) errores.push(`${donde}: el documento «${t.documento}» es de otro partido`);
    if (t.pagina !== undefined && !Number.isInteger(t.pagina)) errores.push(`${donde}: la página no es un número`);
    if (!Number.isInteger(t.puesto) || t.puesto < 1 || t.puesto > MAX_POR_TEMA) errores.push(`${donde}: el puesto debe ir de 1 a ${MAX_POR_TEMA}`);
    // La tarjeta lleva la medida tal cual (o su traducción). Si el texto es otro, tiene que decir qué se ha cambiado.
    if (t.texto && t.texto !== (t.traduccion ?? t.cita) && !t.cambio) errores.push(`${donde}: el texto no es el de la cita y no dice qué se ha cambiado`);
    const clave = `${t.partido} · ${t.tema}`;
    puestos.set(clave, [...(puestos.get(clave) || []), t.puesto]);
  });
  // En cada partido y tema, los puestos van seguidos desde el 1: el test rápido usa el 1.
  for (const [clave, lista] of puestos) {
    const esperado = lista.map((_, i) => i + 1);
    if ([...lista].sort((a, b) => a - b).join() !== esperado.join()) errores.push(`${clave}: los puestos deben ser ${esperado.join(', ')} (son ${lista.join(', ')})`);
  }
  return errores;
}

// Lo que usa el test: temas, documentos y tarjetas (id, tema, partido, puesto, texto, documento y página).
// La cita original, la traducción y el motivo de la elección no salen: están en las páginas de cada partido.
export function bancoPublico(banco) {
  return {
    anio: banco.anio,
    ...(banco.ordenTemas ? { ordenTemas: banco.ordenTemas } : {}),
    temas: banco.temas.map(({ id, nombre, definicion, orden }) => ({ id, nombre, definicion: definicion || '', orden })),
    documentos: banco.documentos.map(({ id, partido, titulo, url, clase }) => ({ id, partido, titulo, url, clase })),
    tarjetas: banco.tarjetas.map(t => ({
      id: t.id, tema: t.tema, partido: t.partido, puesto: t.puesto, texto: t.texto, documento: t.documento, pagina: t.pagina,
      ...(t.idioma ? { idioma: t.idioma } : {}), ...(t.cambio ? { cambiada: true } : {}),
    })),
  };
}

// Candidaturas del test tal como las lee el navegador.
export function partidosPublicos(partidos) {
  return partidos.map(({ id, nombre, circunscripciones, documento }) => ({ id, nombre, circunscripciones, documento }));
}
