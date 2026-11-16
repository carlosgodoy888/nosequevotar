// Test sin siglas: recorrido completo en el navegador. Todo se calcula aquí; nada sale del dispositivo.
//
// Recorrido: provincia → temas que interesan → rápido o completo → papeletas → resultado → compartir.
// El progreso vive en memoria y en sessionStorage (se pierde al cerrar la pestaña). La provincia no se
// guarda: solo se usa para saber qué candidaturas entran, y lo que se guarda es esa lista.
// El banco es un parámetro de la página (data-banco), para cambiar de edición sin tocar este código.
import {
  calcularResultado, partidosEnJuego, partidosSinPrograma, papeletasDelTema, contarPreguntas,
  minutos, textoMinutos, temasEnOrden, listaNombres, MIN_TEMAS,
} from './motor.mjs';
import { barajar } from './azar.mjs';
import { dibujar, textoResultado, compartir, descargar, copiar, enlaceWhatsApp } from './compartir.mjs';

const raiz = document.getElementById('juego');
const pantalla = document.getElementById('pantalla');
const anuncio = document.getElementById('anuncio');
const ANIO = raiz.dataset.anio;
const CLAVE = `nsqv-test-${ANIO}`;
const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');
const VOTOS = { favor: 'A favor', contra: 'En contra', abstencion: 'Me abstengo' };
const VOTADO = { favor: 'Votaste a favor', contra: 'Votaste en contra', abstencion: 'Te abstuviste' };
const IDIOMAS = { ca: 'catalán', gl: 'gallego', eu: 'euskera' };

let banco, partidos, circunscripciones;
let estado = nuevoEstado();
let animando = false;

function nuevoEstado() {
  return {
    fase: 'provincia', partidos: [], sinPrograma: [], temas: [], modo: null, orden: {}, temaIdx: 0, papeletaIdx: 0,
    respuestas: {}, historial: [], abierta: null, formato: 'cuadrada',
  };
}

const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function guardar() {
  try { sessionStorage.setItem(CLAVE, JSON.stringify(estado)); } catch { /* Sin almacenamiento: sigue en memoria. */ }
}

function borrarGuardado() {
  try { sessionStorage.removeItem(CLAVE); } catch { /* nada */ }
}

// Un test a medias solo se recupera si todo lo que guarda sigue existiendo en el banco.
function recuperar() {
  try {
    const e = JSON.parse(sessionStorage.getItem(CLAVE));
    if (!e || !e.fase || e.fase === 'provincia' || !e.partidos?.length) return null;
    const hayTema = id => banco.temas.some(t => t.id === id);
    const hayPartido = id => partidos.some(p => p.id === id);
    const hayTarjeta = id => banco.tarjetas.some(t => t.id === id);
    if (!e.temas.every(hayTema) || !e.partidos.every(hayPartido) || !(e.sinPrograma || []).every(hayPartido)) return null;
    if (!Object.keys(e.orden || {}).every(hayTema) || !Object.values(e.orden || {}).flat().every(hayTarjeta)) return null;
    if (!Object.keys(e.respuestas || {}).every(hayTarjeta)) return null;
    return { ...nuevoEstado(), ...e };
  } catch { /* Estado guardado ilegible: se empieza de cero. */ }
  return null;
}

const avisar = (texto) => { anuncio.textContent = ''; requestAnimationFrame(() => { anuncio.textContent = texto; }); };
const tema = (id) => banco.temas.find(t => t.id === id);
const tarjeta = (id) => banco.tarjetas.find(t => t.id === id);
const partido = (id) => partidos.find(p => p.id === id);
const nombre = (id) => partido(id)?.nombre || id;
const documento = (id) => banco.documentos.find(d => d.id === id);
const enJuego = () => estado.partidos.map(partido);
const temaActual = () => estado.temas[estado.temaIdx];
const ordenActual = () => estado.orden[temaActual()] || [];
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
const totalPapeletas = () => estado.temas.reduce((n, t) => n + (estado.orden[t] || []).length, 0);
const hechas = () => estado.temas.slice(0, estado.temaIdx).reduce((n, t) => n + estado.orden[t].length, 0) + estado.papeletaIdx;
// «3 temas: vivienda, empleo y sanidad». Con muchos temas, solo la cuenta: la lista no cabría en una línea.
const cuentaTemas = () => (estado.temas.length <= 6 ? `${plural(estado.temas.length, 'tema', 'temas')}: ${listaNombres(estado.temas.map(t => tema(t).nombre.toLowerCase()))}` : (estado.temas.length === banco.temas.length ? `los ${estado.temas.length} temas` : `${estado.temas.length} temas`));
// Los temas elegidos, siempre en el orden estándar del banco.
const enOrden = (ids) => temasEnOrden(banco).map(t => t.id).filter(id => ids.includes(id));

// Barra de proporción dibujada con SVG: la página no admite estilos en línea.
const barra = (clase, porcentaje) => `<svg class="${clase}" viewBox="0 0 100 4" preserveAspectRatio="none" aria-hidden="true" focusable="false"><rect class="${clase}__fondo" width="100" height="4"/><rect class="${clase}__valor" width="${Math.max(0, Math.min(100, porcentaje)).toFixed(2)}" height="4"/></svg>`;

// Barra de la afinidad, de −100 a +100: sale del centro hacia la derecha (a favor) o hacia la izquierda (en contra).
function barraSaldo(porcentaje) {
  const p = Math.max(-100, Math.min(100, porcentaje));
  const ancho = Math.abs(p) / 2;
  const valor = ancho < 0.05 ? '' : `<rect class="saldo__valor saldo__valor--${p < 0 ? 'menos' : 'mas'}" x="${(p < 0 ? 50 - ancho : 50).toFixed(2)}" y="2" width="${ancho.toFixed(2)}" height="10"/>`;
  return `<svg class="saldo" viewBox="0 0 100 14" preserveAspectRatio="none" aria-hidden="true" focusable="false"><rect class="saldo__fondo" y="2" width="100" height="10"/>${valor}<rect class="saldo__eje" x="49.7" width="0.6" height="14"/></svg>`;
}

// «5 a favor · 2 en contra · 1 abstención»
const recuento = (c) => `${c.favor} a favor · ${c.contra} en contra${c.abstencion ? ` · ${plural(c.abstencion, 'abstención', 'abstenciones')}` : ''}`;

// ───── Pintado ─────

function pintar(html, { enfocar = true } = {}) {
  pantalla.innerHTML = html;
  if (enfocar) {
    const titulo = pantalla.querySelector('[data-enfocar]') || pantalla.querySelector('h1, h2');
    if (titulo) { titulo.setAttribute('tabindex', '-1'); titulo.focus({ preventScroll: true }); }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

function ir(fase) {
  estado.fase = fase;
  guardar();
  render();
}

function render() {
  const fases = { provincia, temas: elegirTemas, modo: elegirModo, papeleta, resultado, compartir: compartirPantalla };
  (fases[estado.fase] || provincia)();
}

// 1. Provincia (la entrada del test)
const sinTildes = (t) => t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

function provincia() {
  const guardado = recuperar();
  pintar(`<div class="juego__entrada">
<h1>¿Con qué partidos encajas?</h1>
<p class="entradilla">Vota medidas reales de los programas electorales, una a una y sin saber de qué partido son. Al final verás con qué candidaturas encajas más en los temas que te importan.</p>
${guardado ? `<div class="juego__seguir"><p>Tienes un test a medias en esta pestaña.</p><div class="botones"><button type="button" class="boton" data-accion="seguir">Seguir donde lo dejaste</button><button type="button" class="boton boton--claro" data-accion="borrar">Empezar de nuevo</button></div></div>` : ''}
<section class="juego__paso" aria-labelledby="paso-provincia">
<p class="juego__rotulo">Paso 1 de 3</p>
<h2 id="paso-provincia">¿En qué provincia votas?</h2>
<p class="juego__ayuda">Solo usamos este dato para enseñarte los partidos que se presentan en tu circunscripción. No se guarda ni se envía a ningún sitio.</p>
<label class="buscador__etiqueta" for="buscador">Escribe tu provincia o elígela en la lista</label>
<input class="buscador" id="buscador" type="search" autocomplete="off" spellcheck="false" aria-describedby="buscador-cuenta">
<p class="solo-lector" id="buscador-cuenta" aria-live="polite"></p>
<ul class="provincias" id="provincias"></ul>
</section>
<ul class="garantias juego__garantias">
<li><span class="casilla marcada" aria-hidden="true"></span><span><strong>Sin registro.</strong> No te pedimos nada más.</span></li>
<li><span class="casilla marcada" aria-hidden="true"></span><span><strong>Nada sale de tu móvil.</strong> El resultado se calcula aquí y se borra al cerrar la pestaña.</span></li>
<li><span class="casilla marcada" aria-hidden="true"></span><span><strong>Medidas tal como están escritas.</strong> Copiadas del programa de cada partido, con su página.</span></li>
</ul>
<p class="mas"><a href="/metodo/">Cómo hemos elegido las medidas</a></p>
</div>`, { enfocar: false });
  const input = document.getElementById('buscador');
  const lista = document.getElementById('provincias');
  const cuenta = document.getElementById('buscador-cuenta');
  const filtrar = () => {
    const q = sinTildes(input.value.trim());
    const hay = circunscripciones.filter(c => !q || [c.nombre, ...(c.otros || [])].some(n => sinTildes(n).includes(q)));
    lista.innerHTML = hay.map(c => `<li><button type="button" class="provincia" data-accion="provincia" data-id="${esc(c.id)}">${esc(c.nombre)}</button></li>`).join('');
    cuenta.textContent = q ? (hay.length ? plural(hay.length, 'provincia', 'provincias') : 'Ninguna provincia con ese nombre') : '';
  };
  input.addEventListener('input', filtrar);
  filtrar();
}

// Con la provincia se calcula qué candidaturas entran, y solo eso se guarda.
function elegirProvincia(id) {
  estado = nuevoEstado();
  estado.partidos = partidosEnJuego(partidos, id).map(p => p.id);
  estado.sinPrograma = partidosSinPrograma(partidos, id).map(p => p.id);
  ir('temas');
}

// 2. Temas que interesan
function textoCuentaTemas() {
  const n = estado.temas.length;
  if (!n) return `Elige al menos ${MIN_TEMAS} temas.`;
  if (n < MIN_TEMAS) return `Llevas ${plural(n, 'tema', 'temas')}. Elige al menos ${MIN_TEMAS}.`;
  return `Has elegido ${plural(n, 'tema', 'temas')}.`;
}

function quienesEntran() {
  const fuera = estado.sinPrograma.map(nombre);
  return `<details class="juego__quienes"><summary>En tu provincia entran ${plural(estado.partidos.length, 'candidatura', 'candidaturas')}</summary>
<p>${esc(listaNombres(estado.partidos.map(nombre)))}.</p>
${fuera.length ? `<p>${esc(listaNombres(fuera))} también ${fuera.length === 1 ? 'se presenta' : 'se presentan'}, pero no ${fuera.length === 1 ? 'entra' : 'entran'} en el test porque no ${fuera.length === 1 ? 'ha' : 'han'} publicado programa.</p>` : ''}
<p>Las demás candidaturas de tu provincia no están en esta web.</p>
</details>`;
}

function elegirTemas() {
  const todos = temasEnOrden(banco);
  pintar(`<div class="juego__bloque">
<p class="juego__rotulo">Paso 2 de 3</p>
<h2>Elige los temas que te interesan</h2>
<p class="juego__ayuda">Solo te preguntaremos por ellos. Cuantos más elijas, más completo será el resultado y más largo el test. Elige al menos ${MIN_TEMAS}.</p>
${quienesEntran()}
<ul class="opciones temas-lista" role="group" aria-label="Temas">
${todos.map((t) => {
    const marcado = estado.temas.includes(t.id);
    return `<li><button type="button" class="opcion opcion--tema" data-accion="tema" data-id="${esc(t.id)}" aria-pressed="${marcado}"><span class="casilla${marcado ? ' marcada' : ''}" aria-hidden="true"></span><span class="opcion__cuerpo"><span class="opcion__nombre">${esc(t.nombre)}</span><span class="opcion__texto">${esc(t.definicion)}</span></span></button></li>`;
  }).join('\n')}
</ul>
${banco.ordenTemas ? `<p class="juego__nota">Los temas van ordenados según lo que más preocupa a la población, de acuerdo con el ${esc(banco.ordenTemas.encuesta)}.</p>` : ''}
<div class="juego__fijo">
<p class="juego__cuenta-temas" id="temas-cuenta" aria-live="polite">${esc(textoCuentaTemas())}</p>
<div class="juego__fijo-botones">
<button type="button" class="boton" data-accion="a-modo"${estado.temas.length >= MIN_TEMAS ? '' : ' disabled'}>Seguir</button>
<button type="button" class="enlace-boton" data-accion="todos">${estado.temas.length === todos.length ? 'Quitar todos' : 'Elegir todos'}</button>
</div>
</div>
<button type="button" class="enlace-boton" data-accion="a-provincia">Cambiar de provincia</button>
</div>`);
}

// Marcar un tema no repinta la pantalla: se actualiza lo justo y el foco se queda donde estaba.
function alternarTema(id) {
  estado.temas = enOrden(estado.temas.includes(id) ? estado.temas.filter(t => t !== id) : [...estado.temas, id]);
  guardar();
  actualizarTemas();
}

function actualizarTemas() {
  for (const b of pantalla.querySelectorAll('[data-accion="tema"]')) {
    const marcado = estado.temas.includes(b.dataset.id);
    b.setAttribute('aria-pressed', String(marcado));
    b.querySelector('.casilla').classList.toggle('marcada', marcado);
  }
  document.getElementById('temas-cuenta').textContent = textoCuentaTemas();
  pantalla.querySelector('[data-accion="a-modo"]').disabled = estado.temas.length < MIN_TEMAS;
  pantalla.querySelector('[data-accion="todos"]').textContent = estado.temas.length === banco.temas.length ? 'Quitar todos' : 'Elegir todos';
}

// 3. Rápido o completo
function elegirModo() {
  const boton = (modo, titulo, texto) => {
    const n = contarPreguntas(banco, estado.temas, estado.partidos, modo);
    return `<button type="button" class="boton juego__modo" data-accion="modo" data-modo="${modo}"><span class="juego__modo-titulo">${titulo}: ${esc(textoMinutos(minutos(n)))}</span><span class="juego__modo-texto">${plural(n, 'pregunta', 'preguntas')} · ${texto}</span></button>`;
  };
  pintar(`<div class="juego__bloque">
<p class="juego__rotulo">Paso 3 de 3</p>
<h2>¿Test rápido o completo?</h2>
<p class="juego__ayuda">Has elegido ${esc(cuentaTemas())}.</p>
<div class="juego__modos">
${boton('rapido', 'Rápido', 'una medida de cada candidatura en cada tema')}
${boton('completo', 'Completo', 'hasta tres medidas de cada candidatura en cada tema')}
</div>
<p class="juego__ayuda">El completo afina más el resultado, sobre todo si has elegido pocos temas. Puedes dejarlo a medias y seguir después en esta misma pestaña.</p>
<button type="button" class="enlace-boton" data-accion="a-temas">Cambiar los temas</button>
</div>`);
}

function empezar(modo) {
  estado.modo = modo;
  estado.orden = {};
  for (const t of estado.temas) estado.orden[t] = barajar(papeletasDelTema(banco, t, estado.partidos, modo).map(x => x.id));
  // Un tema sin ninguna medida de las candidaturas que entran no se pregunta.
  estado.temas = estado.temas.filter(t => estado.orden[t].length);
  estado.temaIdx = 0;
  estado.papeletaIdx = 0;
  estado.respuestas = {};
  estado.historial = [];
  estado.abierta = null;
  ir('papeleta');
}

// 4. Papeletas
function marcador(temaId) {
  const ids = estado.orden[temaId] || [];
  const n = (d) => ids.filter(id => estado.respuestas[id] === d).length;
  const caja = (clase, titulo, cuantas) => `<li class="bandeja bandeja--${clase}"><span class="bandeja__pila" aria-hidden="true">${'<span></span>'.repeat(Math.min(cuantas, 6))}</span><span class="bandeja__texto">${titulo} · ${cuantas}</span></li>`;
  return `<ul class="bandejas" aria-label="Tus votos en este tema">${caja('sobre', 'A favor', n('favor'))}${caja('apartadas', 'En contra', n('contra'))}${caja('paso', 'Abstención', n('abstencion'))}</ul>`;
}

function progreso() {
  return `${tema(temaActual()).nombre} · tema ${estado.temaIdx + 1} de ${estado.temas.length}`;
}

function papeleta() {
  const ids = ordenActual();
  if (estado.papeletaIdx >= ids.length) { siguienteTema(); return; }
  const id = ids[estado.papeletaIdx];
  const total = totalPapeletas();
  const van = hechas();
  pintar(`<div class="juego__bloque juego__bloque--papeleta">
<div class="juego__avance">
<p class="juego__progreso" id="progreso" data-enfocar>${esc(progreso())}</p>
<p class="juego__cuenta">Medida ${van + 1} de ${total}</p>
${barra('avance', (van / total) * 100)}
</div>
<div class="mesa">
<article class="hoja" id="hoja">
<header class="hoja__cabeza"><span>${esc(tema(temaActual()).nombre)}</span><span>Elecciones generales ${ANIO}</span></header>
<p class="hoja__candidatura"><span class="hoja__rotulo">Candidatura</span><span class="hoja__tapa" aria-hidden="true"></span><span class="solo-lector">Partido oculto hasta el final</span></p>
<p class="hoja__texto">${esc(tarjeta(id).texto)}</p>
</article>
</div>
<div class="decision" role="group" aria-label="Tu voto">
<button type="button" class="decision__boton" data-accion="votar" data-decision="contra" aria-keyshortcuts="ArrowLeft"><span class="decision__signo decision__signo--no" aria-hidden="true"></span>En contra</button>
<button type="button" class="decision__boton" data-accion="votar" data-decision="favor" aria-keyshortcuts="ArrowRight"><span class="decision__signo decision__signo--si" aria-hidden="true"></span>A favor</button>
<button type="button" class="decision__boton decision__boton--abstencion" data-accion="votar" data-decision="abstencion" aria-keyshortcuts="ArrowDown"><span class="decision__signo decision__signo--abstencion" aria-hidden="true"></span>Me abstengo</button>
</div>
<div class="decision__secundaria">
<button type="button" class="enlace-boton" data-accion="deshacer" aria-keyshortcuts="Backspace"${estado.historial.length ? '' : ' disabled'}>Deshacer el último voto</button>
</div>
${marcador(temaActual())}
<p class="juego__teclas">Con teclado: ← en contra · → a favor · ↓ me abstengo · Retroceso deshace.</p>
</div>`);
  avisar(`${progreso()}. Medida ${van + 1} de ${total}. ${tarjeta(id).texto}`);
}

function votar(decision) {
  const ids = ordenActual();
  const id = ids[estado.papeletaIdx];
  if (!id || animando || !VOTOS[decision]) return;
  const hojaEl = document.getElementById('hoja');
  const seguir = () => {
    animando = false;
    estado.respuestas[id] = decision;
    estado.historial.push(id);
    estado.papeletaIdx++;
    guardar();
    render();
  };
  if (hojaEl && !sinMovimiento.matches) {
    animando = true;
    hojaEl.classList.add(`hoja--${decision}`);
    pantalla.querySelectorAll('[data-accion]').forEach(b => { b.disabled = true; });
    setTimeout(seguir, 180);
  } else seguir();
}

function siguienteTema() {
  if (estado.temaIdx < estado.temas.length - 1) {
    estado.temaIdx++;
    estado.papeletaIdx = 0;
    ir('papeleta');
  } else ir('resultado');
}

function deshacer() {
  const id = estado.historial.pop();
  if (!id) return;
  delete estado.respuestas[id];
  const t = tarjeta(id).tema;
  estado.temaIdx = estado.temas.indexOf(t);
  estado.papeletaIdx = estado.orden[t].indexOf(id);
  estado.fase = 'papeleta';
  guardar();
  render();
  avisar(`Voto deshecho. ${progreso()}`);
}

// 5. Resultado
function resultadoActual() {
  const respuestas = Object.entries(estado.respuestas).map(([id, decision]) => ({ tarjeta: id, decision }));
  return calcularResultado({ banco, partidos: enJuego(), temas: estado.temas, modo: estado.modo, respuestas });
}

function enlaceFuente(t) {
  const doc = documento(t.documento);
  const que = doc.clase === 'programa' ? 'Programa' : 'Documento';
  return `<a href="${esc(`${doc.url}#page=${t.pagina}`)}" rel="external noopener" target="_blank">${que}, página ${t.pagina}<span class="solo-lector"> (abre el PDF en otra pestaña)</span></a>`;
}

function detalle(f) {
  const p = partido(f.partido);
  const bloques = f.desglose.map((d) => {
    const titulo = tema(d.tema).nombre;
    if (d.sinMedidas) return `<div class="detalle__tema"><h4>${esc(titulo)}</h4><p class="detalle__nota">Sin medidas concretas en este tema: no cuenta en su porcentaje.</p></div>`;
    const cuenta = d.afinidad === null ? 'sin votar' : recuento(d);
    return `<div class="detalle__tema"><h4>${esc(titulo)} <span class="detalle__cuenta">· ${cuenta}</span></h4>
<ul class="detalle__medidas">${d.tarjetas.map((x) => {
      const t = tarjeta(x.id);
      const notas = [t.idioma ? `Traducida del ${IDIOMAS[t.idioma] || t.idioma}.` : '', t.cambiada ? 'Hemos quitado el nombre del partido.' : ''].filter(Boolean).join(' ');
      return `<li class="detalle__medida detalle__medida--${x.decision || 'sin'}"><p class="detalle__voto"><span class="casilla casilla--pequena${x.decision === 'favor' ? ' marcada' : ''}" aria-hidden="true"></span>${esc(VOTADO[x.decision] || 'Sin votar')}</p><p class="detalle__texto">${esc(t.texto)}</p><p class="detalle__fuente">${enlaceFuente(t)}${notas ? ` · ${esc(notas)}` : ''}</p></li>`;
    }).join('')}</ul></div>`;
  }).join('\n');
  return `<div class="detalle" id="detalle-${esc(f.partido)}"${estado.abierta === f.partido ? '' : ' hidden'}>
${p.documento === 'programa_general' ? '<p class="detalle__nota">No ha publicado programa para estas elecciones: las medidas son de un documento general del partido.</p>' : ''}
${bloques}
<p class="detalle__mas"><a href="/partidos/${esc(f.partido)}/">Todo lo que propone ${esc(f.nombre)}</a></p>
</div>`;
}

function filaResultado(f) {
  const abierta = estado.abierta === f.partido;
  const medidas = recuento(f);
  const sin =f.sinMedidas.length ? ` · sin medidas en ${listaNombres(f.sinMedidas.map(t => tema(t).nombre.toLowerCase()))}` : '';
  return `<li class="acta__fila${abierta ? ' acta__fila--abierta' : ''}">
<button type="button" class="acta__resumen" data-accion="fila" data-partido="${esc(f.partido)}" aria-expanded="${abierta}" aria-controls="detalle-${esc(f.partido)}">
<span class="acta__puesto">${f.puesto}.º${f.empate ? '<span class="solo-lector"> (empate)</span>' : ''}</span>
<span class="acta__nombre">${esc(f.nombre)}</span>
<span class="acta__pct">${esc(f.porcentajeTexto)}</span>
<span class="acta__barra">${barraSaldo(f.porcentaje)}</span>
<span class="acta__cuenta">${esc(medidas + sin)}</span>
<span class="acta__ver">${abierta ? 'Ocultar medidas' : 'Ver medidas'}</span>
</button>
${detalle(f)}
</li>`;
}

function lineaTema(t) {
  const enlace = `<a href="/temas/${esc(t.tema)}/">${esc(tema(t.tema).nombre)}</a>`;
  if (t.estado === 'mejores') return `<li>${enlace}: encajas más con <strong>${esc(listaNombres(t.mejores.map(nombre)))}</strong>.</li>`;
  if (t.estado === 'ninguna') return `<li>${enlace}: no encajas con ninguna candidatura.</li>`;
  return `<li>${enlace}: te has abstenido en todas las medidas.</li>`;
}

function notasResultado(r) {
  const notas = [];
  if (r.apartes.length) notas.push(`<strong>Aparte, sin porcentaje:</strong> ${esc(listaNombres(r.apartes.map(f => f.nombre)))}. ${r.apartes.length === 1 ? 'Tiene' : 'Tienen'} medidas concretas en menos de la mitad de tus temas.`);
  const generales = enJuego().filter(p => p.documento === 'programa_general').map(p => p.nombre);
  if (generales.length) notas.push(`${esc(listaNombres(generales))} no ${generales.length === 1 ? 'ha' : 'han'} publicado programa para estas elecciones: sus medidas son de un documento general del partido.`);
  if (estado.sinPrograma.length) notas.push(`${esc(listaNombres(estado.sinPrograma.map(nombre)))} no ${estado.sinPrograma.length === 1 ? 'entra' : 'entran'} en el test porque no ${estado.sinPrograma.length === 1 ? 'ha' : 'han'} publicado programa.`);
  return notas.map(n => `<p>${n}</p>`).join('\n');
}

function resultado() {
  const r = resultadoActual();
  const seguir = `<section class="resultado__seguir" aria-labelledby="seguir-titulo">
<h3 id="seguir-titulo">El test es solo una muestra</h3>
<p>Has visto ${plural(r.preguntas, 'medida', 'medidas')} y los programas tienen cientos. Antes de decidir tu voto, mira todo lo que propone cada partido y compáralos tema a tema.</p>
<div class="resultado__botones">
<a class="boton resultado__boton" href="/partidos/"><span class="resultado__boton-titulo">Partidos</span><span class="resultado__boton-texto">Todo lo que propone cada uno</span></a>
<a class="boton resultado__boton" href="/temas/"><span class="resultado__boton-titulo">Temas</span><span class="resultado__boton-texto">Compara los partidos tema a tema</span></a>
</div>
</section>`;
  if (r.sinRanking) {
    pintar(`<div class="juego__bloque">
<p class="juego__rotulo">Tu resultado</p>
<h2 data-enfocar>Aún no podemos darte un resultado</h2>
<p class="juego__ayuda">${esc(r.frase)} Las abstenciones ni suman ni restan, y con tan pocos votos cualquier porcentaje sería casualidad.</p>
<div class="botones"><button type="button" class="boton" data-accion="reiniciar">Volver a empezar</button></div>
${seguir}
</div>`);
    return;
  }
  // Una tabla no se deja recortar a 1 px: el envoltorio sí, y así no desborda la página.
  const tabla = `<div class="solo-lector"><table><caption>Resultado: ${esc(r.frase)}</caption><thead><tr><th scope="col">Puesto</th><th scope="col">Candidatura</th><th scope="col">Afinidad</th><th scope="col">Medidas</th></tr></thead><tbody>${r.clasificados.map(f => `<tr><td>${f.puesto}</td><th scope="row">${esc(f.nombre)}</th><td>${esc(f.porcentajeTexto)}</td><td>${esc(recuento(f))}</td></tr>`).join('')}</tbody></table></div>`;
  pintar(`<div class="acta" id="resultado">
<section class="acta__hoja" aria-labelledby="resultado-frase">
<p class="acta__rotulo"><span>Tu resultado</span><span>Programas de ${ANIO}</span></p>
<h2 class="acta__frase" id="resultado-frase" data-enfocar>${esc(r.frase)}</h2>
<p class="acta__base">En ${esc(cuentaTemas())}. Test ${estado.modo === 'rapido' ? 'rápido' : 'completo'}, ${plural(r.respondidas, 'medida votada', 'medidas votadas')} a favor o en contra${r.abstenciones ? ` y ${plural(r.abstenciones, 'abstención', 'abstenciones')}` : ''}.</p>
<p class="acta__escala" aria-hidden="true"><span>← En contra</span><span>0</span><span>A favor →</span></p>
<ol class="acta__filas">${r.clasificados.map(filaResultado).join('')}</ol>
<div class="acta__pie">
${notasResultado(r)}
<p>Cada medida que votas a favor suma, cada una que votas en contra resta y las abstenciones ni suman ni restan. <strong>+100&nbsp;%</strong> es que has votado a favor de todas las medidas de una candidatura; <strong>−100&nbsp;%</strong>, en contra de todas; <strong>0&nbsp;%</strong>, tantas a favor como en contra, o solo abstenciones. Se calcula tema a tema y todos los temas pesan lo mismo.</p>
<p><strong>Esto no es un consejo de voto.</strong></p>
</div>
</section>
${tabla}
<section class="acta__hoja" aria-labelledby="por-temas-titulo">
<h3 class="acta__subtitulo" id="por-temas-titulo">Tema a tema</h3>
<ul class="por-temas">${r.porTema.map(lineaTema).join('')}</ul>
</section>
${seguir}
<div class="botones acta__acciones">
<button type="button" class="boton boton--claro" data-accion="a-compartir">Compartir mi resultado</button>
<button type="button" class="boton boton--claro" data-accion="reiniciar">Volver a empezar</button>
</div>
<p class="mas"><a href="/metodo/">Cómo hemos elegido las medidas y cómo se calcula el resultado</a></p>
</div>`, { enfocar: !pantalla.querySelector('#resultado') });
}

// 6. Compartir
function datosCompartir(r) {
  return {
    formato: estado.formato, anio: ANIO, frase: r.frase,
    filas: r.clasificados.map(f => ({ nombre: f.nombre, porcentaje: f.porcentaje, porcentajeTexto: f.porcentajeTexto, primero: r.primeros.includes(f.partido) })),
    temas: estado.temas.map(t => tema(t).nombre),
  };
}

function compartirPantalla() {
  const r = resultadoActual();
  if (r.sinRanking) { ir('resultado'); return; }
  // El texto nombra, como mucho, a las tres primeras candidaturas con afinidad positiva.
  const texto = textoResultado(r.clasificados.filter(f => f.porcentaje > 0).slice(0, 3), r.primeros.length);
  const opcion = (valor, rotulo) => `<button type="button" class="opcion" data-accion="formato" data-valor="${valor}" aria-pressed="${estado.formato === valor}"><span class="casilla${estado.formato === valor ? ' marcada' : ''}" aria-hidden="true"></span>${rotulo}</button>`;
  pintar(`<div class="juego__bloque">
<p class="juego__rotulo">Compartir</p>
<h2>Comparte tu resultado</h2>
<p class="juego__ayuda">Tú decides si lo enseñas y a quién. La imagen y el texto no llevan tu provincia ni ningún dato tuyo.</p>
<div class="opciones opciones--fila" role="group" aria-label="Formato de la imagen">
${opcion('cuadrada', 'Para chats y publicaciones')}
${opcion('historia', 'Vertical, para estados e historias')}
</div>
<div class="lienzo lienzo--${estado.formato}"><canvas id="lienzo" role="img" aria-label="Vista previa de la imagen: ${esc(r.frase)}"></canvas></div>
<div class="botones">
<button type="button" class="boton" data-accion="compartir">Compartir</button>
<button type="button" class="boton boton--claro" data-accion="descargar">Descargar la imagen</button>
<button type="button" class="boton boton--claro" data-accion="copiar">Copiar el texto</button>
<a class="boton boton--claro" href="${esc(enlaceWhatsApp(texto))}" rel="external noopener" target="_blank">Enviar por WhatsApp</a>
</div>
<p class="juego__ayuda" id="compartir-estado" aria-live="polite"></p>
<textarea class="compartir__texto" id="compartir-texto" readonly rows="4" aria-label="Texto para compartir">${esc(texto)}</textarea>
<div class="botones"><button type="button" class="boton boton--claro" data-accion="a-resultado">Volver al resultado</button></div>
</div>`, { enfocar: !pantalla.querySelector('#lienzo') });
  dibujar(document.getElementById('lienzo'), datosCompartir(r));
  guardar();
}

async function accionCompartir(accion) {
  const lienzo = document.getElementById('lienzo');
  const salida = document.getElementById('compartir-estado');
  const texto = document.getElementById('compartir-texto').value;
  const archivo = `nosequevotar-mi-resultado-${estado.formato}.png`;
  try {
    if (accion === 'compartir') {
      const hecho = await compartir(lienzo, archivo, texto);
      salida.textContent = hecho === 'descargada' ? 'Tu dispositivo no permite compartir la imagen: la hemos descargado.' : hecho === 'compartida' ? 'Compartida.' : '';
    } else if (accion === 'descargar') {
      await descargar(lienzo, archivo);
      salida.textContent = 'Imagen descargada.';
    } else if (accion === 'copiar') {
      if (await copiar(texto)) salida.textContent = 'Texto copiado.';
      else {
        const caja = document.getElementById('compartir-texto');
        caja.focus(); caja.select();
        salida.textContent = 'Texto seleccionado: cópialo con el menú de tu dispositivo.';
      }
    }
  } catch {
    salida.textContent = 'No se ha podido. Prueba con «Descargar la imagen» o «Copiar el texto».';
  }
}

// ───── Eventos ─────

pantalla.addEventListener('click', (e) => {
  const b = e.target.closest('[data-accion]');
  if (!b || b.disabled || b.getAttribute('aria-disabled') === 'true') return;
  const { accion } = b.dataset;
  switch (accion) {
    case 'seguir': estado = recuperar() || nuevoEstado(); render(); break;
    case 'borrar': case 'reiniciar': case 'a-provincia': borrarGuardado(); estado = nuevoEstado(); render(); break;
    case 'provincia': elegirProvincia(b.dataset.id); break;
    case 'tema': alternarTema(b.dataset.id); break;
    case 'todos':
      estado.temas = estado.temas.length === banco.temas.length ? [] : temasEnOrden(banco).map(t => t.id);
      guardar(); actualizarTemas();
      break;
    case 'a-modo': if (estado.temas.length >= MIN_TEMAS) ir('modo'); break;
    case 'a-temas': ir('temas'); break;
    case 'modo': empezar(b.dataset.modo); break;
    case 'votar': votar(b.dataset.decision); break;
    case 'deshacer': deshacer(); break;
    case 'fila': {
      const p = b.dataset.partido;
      estado.abierta = estado.abierta === p ? null : p;
      guardar(); resultado();
      pantalla.querySelector(`[data-accion="fila"][data-partido="${CSS.escape(p)}"]`)?.focus();
      break;
    }
    case 'a-resultado': ir('resultado'); break;
    case 'a-compartir': ir('compartir'); break;
    case 'formato': estado.formato = b.dataset.valor; compartirPantalla(); pantalla.querySelector(`[data-valor="${CSS.escape(b.dataset.valor)}"]`)?.focus(); break;
    case 'compartir': case 'descargar': case 'copiar': accionCompartir(accion); break;
    default: break;
  }
});

// Teclado en las papeletas: ← en contra, → a favor, ↓ me abstengo, Retroceso deshace.
document.addEventListener('keydown', (e) => {
  if (estado.fase !== 'papeleta' || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.target.closest('input, textarea, select')) return;
  const teclas = { ArrowLeft: () => votar('contra'), ArrowRight: () => votar('favor'), ArrowDown: () => votar('abstencion'), Backspace: () => deshacer() };
  if (teclas[e.key]) { e.preventDefault(); teclas[e.key](); }
});

// ───── Arranque ─────

async function arrancar() {
  const leer = async (url) => {
    const r = await fetch(url, { credentials: 'same-origin' });
    if (!r.ok) throw new Error(`${url}: ${r.status}`);
    return r.json();
  };
  try {
    [banco, partidos, circunscripciones] = await Promise.all([leer(raiz.dataset.banco), leer(raiz.dataset.partidos), leer(raiz.dataset.circunscripciones)]);
  } catch {
    pantalla.innerHTML = '<div class="juego__bloque"><h2>No se ha podido cargar el test</h2><p class="juego__ayuda">Comprueba tu conexión y vuelve a cargar la página.</p></div>';
    return;
  }
  raiz.classList.add('juego--listo');
  render();
}

arrancar();
