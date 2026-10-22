// Test sin siglas: recorrido completo en el navegador. Todo se calcula aquí; nada sale del dispositivo.
// El estado vive en memoria y en sessionStorage (se pierde al cerrar la pestaña).
// El banco es un parámetro de la página (data-banco), para pasar a 2026 sin tocar este código.
import { calcularActa, partidosEnJuego, temasDelModo, papeletasDelTema, maxImportantes, MIN_PAPELETAS } from './motor.mjs';
import { barajar } from './azar.mjs';
import { esc, textoConTerminos, iniciarGlosario } from './glosario.mjs';
import { dibujar, textoResultado, textoFavorita, compartir, descargar, copiar, enlaceWhatsApp } from './compartir.mjs';

const raiz = document.getElementById('juego');
const pantalla = document.getElementById('pantalla');
const anuncio = document.getElementById('anuncio');
const ANIO = raiz.dataset.anio;
const CLAVE = `nsqv-test-${ANIO}`;
const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');
const DURACION_RECUENTO = 1500;

let banco, partidos, circunscripciones, glosario;
let estado = nuevoEstado();
let recuento = null;
let animando = false;

function nuevoEstado() {
  return {
    fase: 'entrada', modo: null, circunscripcion: null, temas: [], orden: {}, temaIdx: 0, papeletaIdx: 0,
    respuestas: {}, historial: [], favoritas: {}, importantes: [], vista: 'partidos', abierta: null,
    revelacionIdx: 0, reveladas: [], compartir: { que: 'resultado', favorita: null, formato: 'vertical' },
  };
}

function guardar() {
  try { sessionStorage.setItem(CLAVE, JSON.stringify(estado)); } catch { /* Sin almacenamiento: sigue en memoria. */ }
}

function recuperar() {
  try {
    const e = JSON.parse(sessionStorage.getItem(CLAVE));
    if (e && e.fase && e.fase !== 'entrada' && e.temas?.every(t => banco.temas.some(x => x.id === t))) return e;
  } catch { /* Estado guardado ilegible: se empieza de cero. */ }
  return null;
}

const avisar = (texto) => { anuncio.textContent = ''; requestAnimationFrame(() => { anuncio.textContent = texto; }); };
const tema = (id) => banco.temas.find(t => t.id === id);
const tarjeta = (id) => banco.tarjetas.find(t => t.id === id);
const nombre = (id) => partidos.find(p => p.id === id)?.nombre || id;
const enJuego = () => partidosEnJuego(partidos, estado.circunscripcion);
const temaActual = () => estado.temas[estado.temaIdx];
const ordenActual = () => estado.orden[temaActual()] || [];
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

function fechaHoy() {
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Madrid' }).format(new Date());
}

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
  const fases = { entrada, provincia, papeleta, finTema, importantes, sobre, acta, revelacion, compartirPantalla };
  const alias = { compartir: 'compartirPantalla', recuento: 'acta' };
  (fases[alias[estado.fase] || estado.fase] || entrada)();
}

// 1. Entrada
function entrada() {
  const guardado = recuperar();
  pintar(`<div class="juego__entrada">
<h1>¿Con qué programa de ${ANIO} coincides?</h1>
<p class="entradilla">Lee propuestas reales una a una, sin saber de qué partido son, y di si te convencen. Al final verás con qué programa coincides más y quién firmaba cada propuesta.</p>
<p class="juego__aviso"><span class="casilla casilla--pequena" aria-hidden="true"></span>Con los programas de ${ANIO}. Lo actualizaremos con los de 2026.</p>
${guardado ? `<div class="juego__seguir"><p>Tienes un test a medias en esta pestaña.</p><div class="botones"><button type="button" class="boton" data-accion="seguir">Seguir donde lo dejaste</button><button type="button" class="boton boton--claro" data-accion="borrar">Empezar de nuevo</button></div></div>` : ''}
<div class="juego__modos">
<button type="button" class="boton juego__modo" data-accion="modo" data-modo="corto"><span class="juego__modo-titulo">3 temas · unos 4 minutos</span><span class="juego__modo-texto">${esc(temasDelModo(banco, 'corto').map(t => t.nombre).join(', '))}</span></button>
<button type="button" class="boton boton--claro juego__modo" data-accion="modo" data-modo="completo"><span class="juego__modo-titulo">6 temas · unos 8 minutos</span><span class="juego__modo-texto">Los tres anteriores y ${esc(temasDelModo(banco, 'completo').filter(t => !t.corto).map(t => t.nombre.toLowerCase()).join(', '))}</span></button>
</div>
<ul class="garantias juego__garantias">
<li><span class="casilla marcada" aria-hidden="true"></span><span><strong>Sin registro.</strong> No te pedimos nada.</span></li>
<li><span class="casilla marcada" aria-hidden="true"></span><span><strong>Nada sale de tu móvil.</strong> El resultado se calcula aquí y se borra al cerrar la pestaña.</span></li>
<li><span class="casilla marcada" aria-hidden="true"></span><span><strong>Cada propuesta, con su página.</strong> Al final ves la frase del programa y puedes abrirlo en esa página.</span></li>
</ul>
<p class="mas"><a href="/metodo/">Cómo hemos elegido y escrito las propuestas</a></p>
</div>`, { enfocar: false });
}

// 2. Provincia
const sinTildes = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function provincia() {
  pintar(`<div class="juego__bloque">
<p class="juego__rotulo">Antes de empezar</p>
<h2>¿En qué provincia votas?</h2>
<p class="juego__ayuda">Así entran también los partidos que solo se presentan allí. No se guarda ni se envía.</p>
<label class="buscador__etiqueta" for="buscador">Escribe tu provincia</label>
<input class="buscador" id="buscador" type="search" autocomplete="off" spellcheck="false" aria-describedby="buscador-cuenta">
<p class="solo-lector" id="buscador-cuenta" aria-live="polite"></p>
<ul class="provincias" id="provincias"></ul>
<button type="button" class="boton boton--claro" data-accion="sin-provincia">Prefiero no decirlo</button>
<p class="juego__ayuda">Si prefieres no decirlo, solo entran los partidos que se presentaban en toda España.</p>
</div>`);
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

function empezar(circunscripcion) {
  estado.circunscripcion = circunscripcion;
  const ids = enJuego().map(p => p.id);
  estado.orden = {};
  for (const t of estado.temas) estado.orden[t] = barajar(papeletasDelTema(banco, t, ids).map(x => x.id));
  estado.temaIdx = 0;
  estado.papeletaIdx = 0;
  ir('papeleta');
}

// 3. Papeletas
function bandejas(temaId) {
  const ids = estado.orden[temaId] || [];
  const n = (d) => ids.filter(id => estado.respuestas[id] === d).length;
  const bandeja = (clase, titulo, cuantas) => `<li class="bandeja bandeja--${clase}"><span class="bandeja__pila" aria-hidden="true">${'<span></span>'.repeat(Math.min(cuantas, 6))}</span><span class="bandeja__texto">${titulo} · ${cuantas}</span></li>`;
  return `<ul class="bandejas" aria-label="Tus papeletas de este tema">${bandeja('sobre', 'En el sobre', n('si'))}${bandeja('apartadas', 'Apartadas', n('no'))}${bandeja('paso', 'Sin decidir', n('paso'))}</ul>`;
}

function progreso() {
  return `${tema(temaActual()).nombre} · papeleta ${estado.papeletaIdx + 1} de ${ordenActual().length} · tema ${estado.temaIdx + 1} de ${estado.temas.length}`;
}

function hoja(id, { pie = '' } = {}) {
  return `<article class="hoja" id="hoja">
<header class="hoja__cabeza"><span>Elecciones generales ${ANIO}</span><span>Programa electoral</span></header>
<p class="hoja__candidatura"><span class="hoja__rotulo">Candidatura</span><span class="hoja__tapa" aria-hidden="true"></span><span class="solo-lector">Partido oculto hasta el final</span></p>
<p class="hoja__texto">${textoConTerminos(tarjeta(id).texto, id, glosario)}</p>
${pie}
</article>`;
}

function papeleta() {
  const ids = ordenActual();
  if (estado.papeletaIdx >= ids.length) { ir('finTema'); return; }
  const id = ids[estado.papeletaIdx];
  pintar(`<div class="juego__bloque juego__bloque--papeleta">
<p class="juego__progreso" id="progreso" data-enfocar>${esc(progreso())}</p>
<div class="mesa">
${hoja(id, { pie: `<p class="hoja__pie"><span>Propuesta ${estado.papeletaIdx + 1} de ${ids.length}</span><span>Quién la firma se ve al final</span></p>` })}
</div>
<div class="decision" role="group" aria-label="Tu decisión">
<button type="button" class="decision__boton" data-accion="decidir" data-decision="no" aria-keyshortcuts="ArrowLeft"><span class="decision__signo decision__signo--no" aria-hidden="true"></span>No me convence</button>
<button type="button" class="decision__boton" data-accion="decidir" data-decision="si" aria-keyshortcuts="ArrowRight"><span class="decision__signo decision__signo--si" aria-hidden="true"></span>Me convence</button>
</div>
<div class="decision__secundaria">
<button type="button" class="enlace-boton" data-accion="decidir" data-decision="paso" aria-keyshortcuts="ArrowDown">Paso, no lo tengo claro</button>
<button type="button" class="enlace-boton" data-accion="deshacer" aria-keyshortcuts="Backspace"${estado.historial.length ? '' : ' disabled'}>Deshacer</button>
</div>
${bandejas(temaActual())}
<p class="juego__teclas">Con teclado: ← no me convence · → me convence · ↓ paso · Retroceso deshace.</p>
</div>`);
  avisar(`${progreso()}. ${tarjeta(id).texto}`);
}

function decidir(decision) {
  const ids = ordenActual();
  const id = ids[estado.papeletaIdx];
  if (!id || animando) return;
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

function deshacer() {
  const id = estado.historial.pop();
  if (!id) return;
  delete estado.respuestas[id];
  const t = tarjeta(id).tema;
  delete estado.favoritas[t];
  estado.temaIdx = estado.temas.indexOf(t);
  estado.papeletaIdx = estado.orden[t].indexOf(id);
  estado.fase = 'papeleta';
  guardar();
  render();
  avisar(`Deshecha. ${progreso()}`);
}

// 4. Fin de cada tema
function finTema() {
  const t = tema(temaActual());
  const si = ordenActual().filter(id => estado.respuestas[id] === 'si');
  if (si.length === 1) estado.favoritas[t.id] = si[0];
  const ultimo = estado.temaIdx === estado.temas.length - 1;
  const siguiente = ultimo ? 'Terminar las papeletas' : `Siguiente tema: ${tema(estado.temas[estado.temaIdx + 1]).nombre}`;
  let cuerpo;
  if (!si.length) cuerpo = `<p class="juego__ayuda">No te convenció ninguna propuesta de ${esc(t.nombre.toLowerCase())}. No pasa nada: seguimos.</p>`;
  else if (si.length === 1) cuerpo = `<p class="juego__ayuda">Te convenció una. Es tu favorita del tema y cuenta doble.</p><ul class="favoritas">${opcionFavorita(si[0], true, false)}</ul>`;
  else cuerpo = `<p class="juego__ayuda">Te convencieron ${si.length}. ¿Cuál es tu favorita? Cuenta doble.</p>
<ul class="favoritas" role="group" aria-label="Elige tu favorita">${si.map(id => opcionFavorita(id, estado.favoritas[t.id] === id, true)).join('')}</ul>`;
  const listo = si.length < 2 || estado.favoritas[t.id];
  pintar(`<div class="juego__bloque">
<p class="juego__rotulo">Tema ${estado.temaIdx + 1} de ${estado.temas.length}</p>
<h2>${esc(t.nombre)}, terminado</h2>
${cuerpo}
${bandejas(t.id)}
<div class="botones">
<button type="button" class="boton" data-accion="siguiente-tema"${listo ? '' : ' disabled'}>${esc(siguiente)}</button>
<button type="button" class="boton boton--claro" data-accion="deshacer">Deshacer la última</button>
</div>
${listo ? '' : '<p class="juego__ayuda" id="falta-favorita">Elige tu favorita para seguir.</p>'}
</div>`);
  guardar();
}

function opcionFavorita(id, elegida, elegible) {
  const texto = textoConTerminos(tarjeta(id).texto, id, glosario);
  if (!elegible) return `<li class="favorita favorita--elegida"><span class="casilla marcada" aria-hidden="true"></span><span>${texto}</span></li>`;
  return `<li><div class="favorita${elegida ? ' favorita--elegida' : ''}"><button type="button" class="favorita__boton" data-accion="favorita" data-id="${esc(id)}" aria-pressed="${elegida}"><span class="casilla${elegida ? ' marcada' : ''}" aria-hidden="true"></span><span class="favorita__rotulo">${elegida ? 'Tu favorita' : 'Elegir esta'}</span></button><p class="favorita__texto">${texto}</p></div></li>`;
}

function siguienteTema() {
  if (estado.temaIdx < estado.temas.length - 1) {
    estado.temaIdx++;
    estado.papeletaIdx = 0;
    ir('papeleta');
  } else ir('importantes');
}

// 5. Lo que más te importa
function importantes() {
  const max = maxImportantes(estado.modo);
  pintar(`<div class="juego__bloque">
<p class="juego__rotulo">Último paso</p>
<h2>${max === 1 ? '¿Qué tema te importa más?' : '¿Qué temas te importan más?'}</h2>
<p class="juego__ayuda">${max === 1 ? 'Si eliges uno, cuenta doble en el resultado.' : `Elige hasta ${max}. Cuentan doble en el resultado.`} También puedes saltarte este paso.</p>
<ul class="opciones" role="group" aria-label="Temas">
${estado.temas.map(id => {
    const marcada = estado.importantes.includes(id);
    const lleno = !marcada && estado.importantes.length >= max;
    return `<li><button type="button" class="opcion" data-accion="importante" data-id="${id}" aria-pressed="${marcada}"${lleno ? ' aria-disabled="true"' : ''}><span class="casilla${marcada ? ' marcada' : ''}" aria-hidden="true"></span>${esc(tema(id).nombre)}${marcada ? '<span class="opcion__nota">cuenta doble</span>' : ''}</button></li>`;
  }).join('')}
</ul>
<p class="juego__ayuda" aria-live="polite">${estado.importantes.length ? `Elegidos: ${estado.importantes.length} de ${max}.` : ''}</p>
<div class="botones">
<button type="button" class="boton" data-accion="a-sobre">${estado.importantes.length ? 'Seguir' : 'Saltar este paso'}</button>
</div>
</div>`, { enfocar: estado.fase !== 'importantes' || !pantalla.querySelector('.opciones') });
}

// 6. El sobre y el escrutinio
function respuestasActa() {
  return Object.entries(estado.respuestas).map(([id, decision]) => ({ tarjeta: id, decision, favorita: estado.favoritas[tarjeta(id).tema] === id }));
}

function actaActual() {
  return calcularActa({ banco, anio: ANIO, partidos: enJuego(), temas: estado.temas, importantes: estado.importantes, respuestas: respuestasActa() });
}

function sobre() {
  const a = actaActual();
  pintar(`<div class="juego__bloque">
<p class="juego__rotulo">Escrutinio</p>
<h2>Tu sobre está listo</h2>
<p class="juego__ayuda">Has respondido ${plural(a.respondidas, 'papeleta', 'papeletas')} en ${plural(estado.temas.length, 'tema', 'temas')}.${estado.importantes.length ? ` ${listaTemas(estado.importantes)} ${estado.importantes.length === 1 ? 'cuenta' : 'cuentan'} doble.` : ''}</p>
<div class="sobre" aria-hidden="true"><span class="sobre__solapa"></span><span class="sobre__cuerpo">${plural(a.respondidas, 'papeleta', 'papeletas')}</span></div>
<div class="botones"><button type="button" class="boton" data-accion="abrir-sobre">Abrir el sobre</button></div>
</div>`);
}

function listaTemas(ids) {
  const n = ids.map(id => tema(id).nombre);
  return n.length > 1 ? `${n.slice(0, -1).join(', ')} y ${n.at(-1)}` : n[0];
}

function palotesHtml(n) {
  let html = '';
  for (let resto = n; resto > 0; resto -= 5) {
    const k = Math.min(5, resto);
    html += `<span class="grupo${k === 5 ? ' grupo--cerrado' : ''}">${'<span class="palote"></span>'.repeat(k === 5 ? 4 : k)}${k === 5 ? '<span class="tachon"></span>' : ''}</span>`;
  }
  return html;
}

function abrirSobre() {
  const a = actaActual();
  if (a.sinRanking || sinMovimiento.matches || !a.palotes.length) { ir('acta'); avisar(a.frase); return; }
  // Durante el recuento: filas en orden alfabético y sin porcentaje.
  const filas = [...a.filas].sort((x, y) => x.nombre.localeCompare(y.nombre, 'es'));
  estado.fase = 'recuento';
  pintar(`<div class="juego__bloque acta acta--recuento">
<p class="juego__rotulo">Escrutinio</p>
<h2>Contando las papeletas…</h2>
<ol class="acta__filas">${filas.map(f => `<li class="acta__fila"><div class="acta__resumen"><span class="acta__nombre">${esc(f.nombre)}</span><span class="acta__palotes" data-partido="${esc(f.partido)}" aria-hidden="true"></span><span class="acta__cuenta" data-cuenta="${esc(f.partido)}">0</span></div></li>`).join('')}</ol>
<div class="botones"><button type="button" class="boton boton--claro" data-accion="saltar-recuento">Saltar el recuento</button></div>
</div>`);
  avisar(`Contando ${plural(a.palotes.length, 'palote', 'palotes')}.`);
  const orden = barajar(a.palotes);
  const cuentas = {};
  const paso = Math.max(20, Math.floor(DURACION_RECUENTO / orden.length));
  let i = 0;
  recuento = setInterval(() => {
    if (i >= orden.length) { terminarRecuento(); return; }
    const p = orden[i++];
    cuentas[p] = (cuentas[p] || 0) + 1;
    const celda = pantalla.querySelector(`[data-partido="${CSS.escape(p)}"]`);
    if (celda) celda.innerHTML = palotesHtml(cuentas[p]);
    const num = pantalla.querySelector(`[data-cuenta="${CSS.escape(p)}"]`);
    if (num) num.textContent = cuentas[p];
  }, paso);
}

function terminarRecuento() {
  clearInterval(recuento);
  recuento = null;
  ir('acta');
  avisar(`Recuento terminado. ${actaActual().frase}.`);
}

// 7. El acta
function filaActa(f, a) {
  const abierta = estado.abierta === f.partido;
  const descripcion = `${f.x} de ${f.y} palotes, ${f.porcentajeTexto}`;
  const desglose = f.desglose.map((d) => {
    const nombreTema = `${tema(d.tema).nombre}${d.doble ? ' (cuenta doble)' : ''}`;
    let que;
    if (d.sinPropuesta) que = `sin propuesta en su programa de ${ANIO}: este tema no cuenta`;
    else if (d.decision === 'paso') que = 'pasaste: no cuenta';
    else if (d.decision === 'si') que = `te convenció${d.favorita ? ' y fue tu favorita' : ''} · ${d.puntos} de ${d.maximo}`;
    else if (d.decision === 'no') que = `no te convenció · 0 de ${d.maximo}`;
    else que = 'sin responder';
    const texto = d.tarjeta && d.decision === 'si' ? `<span class="desglose__texto">«${esc(tarjeta(d.tarjeta).texto)}»</span>` : '';
    return `<li><span class="desglose__tema">${esc(nombreTema)}:</span> ${esc(que)}${texto}</li>`;
  }).join('');
  return `<li class="acta__fila${abierta ? ' acta__fila--abierta' : ''}">
<button type="button" class="acta__resumen" data-accion="fila" data-partido="${esc(f.partido)}" aria-expanded="${abierta}" aria-controls="desglose-${esc(f.partido)}">
<span class="acta__puesto">${f.puesto}.º${f.empate ? '<span class="solo-lector"> (empate)</span>' : ''}</span>
<span class="acta__nombre">${esc(f.nombre)}</span>
<span class="acta__pct">${esc(f.porcentajeTexto)}</span>
<span class="acta__palotes" aria-hidden="true">${palotesHtml(f.x)}</span>
<span class="acta__cuenta">${f.x} de ${f.y} palotes</span>
<span class="solo-lector">${esc(descripcion)}. Toca para ver de dónde salen.</span>
</button>
<ul class="desglose" id="desglose-${esc(f.partido)}"${abierta ? '' : ' hidden'}>${desglose}</ul>
</li>`;
}

function vistaTemas(a) {
  return `<ol class="por-temas">${a.porTema.map((t) => {
    const nombreTema = `${tema(t.tema).nombre}${t.doble ? ' (cuenta doble)' : ''}`;
    let texto;
    if (t.favorita) {
      const otros = t.convencieron.filter(p => p !== t.favorita).map(nombre);
      texto = `<strong>${esc(nombre(t.favorita))}</strong>, tu favorita${otros.length ? `. También te convenció: ${esc(otros.join(', '))}` : ''}.`;
    } else texto = 'Ninguna propuesta te convenció.';
    return `<li><span class="por-temas__tema">${esc(nombreTema)}</span><span class="por-temas__texto">${texto}</span></li>`;
  }).join('')}</ol>`;
}

function acta() {
  const a = actaActual();
  if (a.sinRanking) {
    pintar(`<div class="juego__bloque">
<p class="juego__rotulo">Escrutinio</p>
<h2>Aún no podemos darte un resultado</h2>
<p class="juego__ayuda">${esc(a.frase)} Con tan pocas respuestas, cualquier porcentaje sería casualidad.</p>
<div class="botones"><button type="button" class="boton" data-accion="reiniciar">Volver a empezar</button><button type="button" class="boton boton--claro" data-accion="a-revelacion">Ver quién firmaba cada propuesta</button></div>
</div>`);
    return;
  }
  // Una tabla no se deja recortar a 1 px: el envoltorio sí, y así no desborda la página.
  const tabla = `<div class="solo-lector"><table><caption>Resultado: ${esc(a.frase)}</caption><thead><tr><th scope="col">Puesto</th><th scope="col">Partido</th><th scope="col">Palotes</th><th scope="col">Porcentaje</th></tr></thead><tbody>${a.clasificados.map(f => `<tr><td>${f.puesto}</td><th scope="row">${esc(f.nombre)}</th><td>${f.x} de ${f.y}</td><td>${esc(f.porcentajeTexto)}</td></tr>`).join('')}${a.apartes.map(f => `<tr><td>Aparte</td><th scope="row">${esc(f.nombre)}</th><td colspan="2">Pocas papeletas respondidas para darte un porcentaje</td></tr>`).join('')}</tbody></table></div>`;
  pintar(`<div class="acta" id="acta">
<section class="acta__hoja" aria-labelledby="acta-frase">
<p class="acta__rotulo"><span>Escrutinio</span><span>Programas de ${ANIO}</span></p>
<h2 class="acta__frase" id="acta-frase" data-enfocar>${esc(a.frase)}</h2>
<div class="acta__vistas" role="group" aria-label="Cómo verlo">
<button type="button" class="acta__vista" data-accion="vista" data-vista="partidos" aria-pressed="${estado.vista === 'partidos'}">Por partidos</button>
<button type="button" class="acta__vista" data-accion="vista" data-vista="temas" aria-pressed="${estado.vista === 'temas'}">Ver por temas</button>
</div>
${estado.vista === 'temas' ? vistaTemas(a) : `<ol class="acta__filas" aria-hidden="false">${a.clasificados.map(f => filaActa(f, a)).join('')}</ol>
${a.apartes.length ? `<div class="acta__aparte"><p class="acta__aparte-titulo">Aparte</p><ul>${a.apartes.map(f => `<li><strong>${esc(f.nombre)}</strong>: pocas papeletas respondidas para darte un porcentaje.</li>`).join('')}</ul></div>` : ''}`}
<footer class="acta__pie">
<p>Calculado sobre ${plural(a.respondidas, 'papeleta', 'papeletas')}${estado.importantes.length ? `. ${esc(listaTemas(estado.importantes))} ${estado.importantes.length === 1 ? 'cuenta' : 'cuentan'} doble` : ''}.</p>
<p><strong>Esto no es un consejo de voto.</strong> ${esc(fechaHoy())} · nosequevotar.es</p>
<p>Frente Amplio, Podemos, Se Acabó La Fiesta y otros no tenían programa propio en ${ANIO}; entrarán cuando publiquen el de 2026.</p>
</footer>
</section>
${tabla}
<div class="botones acta__acciones">
<button type="button" class="boton" data-accion="a-revelacion">Ver quién firmaba cada propuesta</button>
<button type="button" class="boton boton--claro" data-accion="a-compartir">Compartir</button>
<button type="button" class="boton boton--claro" data-accion="reiniciar">Volver a empezar</button>
</div>
</div>`, { enfocar: !pantalla.querySelector('#acta') });
}

// 8. Revelación, tema a tema
function revelacion() {
  const idx = estado.revelacionIdx;
  const t = tema(estado.temas[idx]);
  const ids = estado.orden[t.id];
  const etiqueta = (id) => {
    const d = estado.respuestas[id];
    if (d === 'si') return estado.favoritas[t.id] === id ? 'Te convenció · tu favorita' : 'Te convenció';
    if (d === 'no') return 'No te convenció';
    return 'Pasaste';
  };
  const tarjetaRevelada = (id) => {
    const x = tarjeta(id);
    const abierta = estado.reveladas.includes(id);
    const lang = { erc: 'ca', junts: 'ca', bng: 'gl' }[x.partido];
    return `<li class="revelada${abierta ? ' revelada--abierta' : ''}" data-tarjeta="${esc(id)}">
<p class="revelada__decision revelada__decision--${estado.respuestas[id] || 'paso'}"><span class="casilla${estado.respuestas[id] === 'si' ? ' marcada' : ''}" aria-hidden="true"></span>${esc(etiqueta(id))}</p>
<p class="revelada__texto">${textoConTerminos(x.texto, id, glosario)}</p>
<div class="revelada__firma"><span class="revelada__rotulo">La firmaba:</span> <span class="franja${abierta ? ' revelada' : ''}"><span class="franja__nombre"${abierta ? '' : ' aria-hidden="true"'}>${esc(nombre(x.partido))}</span><span class="franja__tapa" aria-hidden="true"></span></span></div>
${abierta ? `<div class="revelada__fuente">
<blockquote class="revelada__cita"${lang ? ` lang="${lang}"` : ''}>«${esc(x.cita)}»</blockquote>
${x.traduccion ? `<p class="revelada__traduccion"><span>Traducción:</span> «${esc(x.traduccion)}»</p>` : ''}
<p class="revelada__pagina">Programa de ${ANIO}, página ${x.pagina}</p>
<a class="revelada__enlace" href="${esc(x.enlace)}" rel="external noopener" target="_blank">Ver en el programa<span class="solo-lector"> (abre el PDF en otra pestaña)</span></a>
</div>` : `<button type="button" class="boton boton--claro revelada__boton" data-accion="revelar" data-id="${esc(id)}">Revelar quién la firmaba</button>`}
</li>`;
  };
  const pendientes = ids.filter(id => !estado.reveladas.includes(id)).length;
  pintar(`<div class="juego__bloque">
<p class="juego__rotulo">Quién firmaba cada propuesta</p>
<nav class="temas-nav" aria-label="Temas">${estado.temas.map((id, i) => `<button type="button" class="temas-nav__boton" data-accion="ver-tema" data-idx="${i}"${i === idx ? ' aria-current="true"' : ''}>${esc(tema(id).nombre)}</button>`).join('')}</nav>
<h2>${esc(t.nombre)}</h2>
${pendientes ? `<button type="button" class="enlace-boton" data-accion="revelar-todas">Revelar las ${ids.length} de ${esc(t.nombre.toLowerCase())}</button>` : ''}
<ol class="reveladas">${ids.map(tarjetaRevelada).join('')}</ol>
<div class="botones">
${idx < estado.temas.length - 1 ? `<button type="button" class="boton" data-accion="ver-tema" data-idx="${idx + 1}">Siguiente tema: ${esc(tema(estado.temas[idx + 1]).nombre)}</button>` : ''}
<button type="button" class="boton boton--claro" data-accion="a-acta">Volver al resultado</button>
<button type="button" class="boton boton--claro" data-accion="a-compartir">Compartir</button>
</div>
</div>`, { enfocar: !pantalla.querySelector('.reveladas') || pantalla.dataset.tema !== t.id });
  pantalla.dataset.tema = t.id;
}

function revelar(ids) {
  const nuevos = ids.filter(id => !estado.reveladas.includes(id));
  if (!nuevos.length) return;
  estado.reveladas.push(...nuevos);
  guardar();
  // La franja se retira (0,7 s) antes de enseñar la cita; sin movimiento si se pide.
  const animar = !sinMovimiento.matches;
  for (const id of nuevos) {
    const li = pantalla.querySelector(`[data-tarjeta="${CSS.escape(id)}"]`);
    li?.querySelector('.franja')?.classList.add('revelada');
    li?.querySelector('.franja__nombre')?.removeAttribute('aria-hidden');
  }
  const foco = nuevos.length === 1 ? nuevos[0] : null;
  setTimeout(() => {
    revelacion();
    if (foco) pantalla.querySelector(`[data-tarjeta="${CSS.escape(foco)}"] .revelada__enlace`)?.focus();
  }, animar ? 700 : 0);
  avisar(nuevos.length === 1 ? `La firmaba ${nombre(tarjeta(nuevos[0]).partido)}.` : `Reveladas ${nuevos.length} propuestas.`);
}

// 9. Compartir
function compartirPantalla() {
  const a = actaActual();
  const favoritas = estado.temas.map(t => estado.favoritas[t]).filter(Boolean);
  const c = estado.compartir;
  if (a.sinRanking && c.que === 'resultado') c.que = favoritas.length ? 'favorita' : 'resultado';
  if (c.que === 'favorita' && !favoritas.includes(c.favorita)) c.favorita = favoritas[0] || null;
  const texto = c.que === 'resultado' ? textoResultado(a.clasificados.slice(0, 3), ANIO) : (c.favorita ? textoFavorita(tarjeta(c.favorita).texto) : '');
  const opcion = (accion, valor, actual, rotulo, deshabilitada = false) => `<button type="button" class="opcion" data-accion="${accion}" data-valor="${valor}" aria-pressed="${actual === valor}"${deshabilitada ? ' disabled' : ''}><span class="casilla${actual === valor ? ' marcada' : ''}" aria-hidden="true"></span>${rotulo}</button>`;
  pintar(`<div class="juego__bloque">
<p class="juego__rotulo">Compartir</p>
<h2>¿Qué quieres compartir?</h2>
<p class="juego__ayuda">La imagen y el texto no llevan tu provincia ni ningún dato tuyo.</p>
<div class="opciones opciones--fila" role="group" aria-label="Qué compartir">
${opcion('compartir-que', 'resultado', c.que, 'Mi resultado', a.sinRanking)}
${opcion('compartir-que', 'favorita', c.que, 'Mi propuesta favorita', !favoritas.length)}
</div>
${c.que === 'favorita' && favoritas.length > 1 ? `<ul class="favoritas" role="group" aria-label="Elige la propuesta">${favoritas.map(id => `<li><button type="button" class="opcion opcion--texto" data-accion="compartir-favorita" data-valor="${esc(id)}" aria-pressed="${c.favorita === id}"><span class="casilla${c.favorita === id ? ' marcada' : ''}" aria-hidden="true"></span><span>${esc(tema(tarjeta(id).tema).nombre)}: ${esc(tarjeta(id).texto)}</span></button></li>`).join('')}</ul>` : ''}
<div class="opciones opciones--fila" role="group" aria-label="Formato de la imagen">
${opcion('compartir-formato', 'vertical', c.formato, 'Vertical, para estados e historias')}
${opcion('compartir-formato', 'horizontal', c.formato, 'Horizontal, para chats y enlaces')}
</div>
<div class="lienzo lienzo--${c.formato}"><canvas id="lienzo" role="img" aria-label="Vista previa de la imagen para compartir"></canvas></div>
<div class="botones">
<button type="button" class="boton" data-accion="compartir">Compartir</button>
<button type="button" class="boton boton--claro" data-accion="descargar">Descargar imagen</button>
<button type="button" class="boton boton--claro" data-accion="copiar">Copiar texto</button>
<a class="boton boton--claro" href="${esc(enlaceWhatsApp(texto))}" rel="external noopener" target="_blank">WhatsApp</a>
</div>
<p class="juego__ayuda" id="compartir-estado" aria-live="polite"></p>
<textarea class="compartir__texto" id="compartir-texto" readonly rows="3" aria-label="Texto para compartir">${esc(texto)}</textarea>
<div class="botones"><button type="button" class="boton boton--claro" data-accion="a-acta">Volver al resultado</button></div>
</div>`, { enfocar: !pantalla.querySelector('#lienzo') });
  dibujar(document.getElementById('lienzo'), {
    tipo: c.que, formato: c.formato, frase: a.frase, anio: ANIO,
    filas: a.clasificados.slice(0, 3), texto: c.favorita ? tarjeta(c.favorita).texto : '',
  });
  guardar();
}

async function accionCompartir(accion) {
  const lienzo = document.getElementById('lienzo');
  const salida = document.getElementById('compartir-estado');
  const texto = document.getElementById('compartir-texto').value;
  const nombreArchivo = `nosequevotar-test-${estado.compartir.que}-${estado.compartir.formato}.png`;
  try {
    if (accion === 'compartir') {
      const r = await compartir(lienzo, nombreArchivo, texto);
      salida.textContent = r === 'descargada' ? 'Tu dispositivo no permite compartir la imagen: la hemos descargado.' : r === 'compartida' ? 'Compartida.' : '';
    } else if (accion === 'descargar') {
      await descargar(lienzo, nombreArchivo);
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
    salida.textContent = 'No se ha podido. Prueba con «Descargar imagen» o «Copiar texto».';
  }
}

// ───── Eventos ─────

pantalla.addEventListener('click', (e) => {
  const b = e.target.closest('[data-accion]');
  if (!b || b.disabled || b.getAttribute('aria-disabled') === 'true') return;
  const { accion } = b.dataset;
  switch (accion) {
    case 'modo':
      estado = nuevoEstado();
      estado.modo = b.dataset.modo;
      estado.temas = temasDelModo(banco, estado.modo).map(t => t.id);
      ir('provincia');
      break;
    case 'seguir': estado = recuperar() || nuevoEstado(); if (estado.fase === 'recuento') estado.fase = 'acta'; render(); break;
    case 'borrar': try { sessionStorage.removeItem(CLAVE); } catch { /* nada */ } estado = nuevoEstado(); render(); break;
    case 'provincia': empezar(b.dataset.id); break;
    case 'sin-provincia': empezar(null); break;
    case 'decidir': decidir(b.dataset.decision); break;
    case 'deshacer': deshacer(); break;
    case 'favorita': estado.favoritas[temaActual()] = b.dataset.id; finTema(); pantalla.querySelector(`[data-id="${CSS.escape(b.dataset.id)}"]`)?.focus(); avisar('Favorita elegida.'); break;
    case 'siguiente-tema': siguienteTema(); break;
    case 'importante': {
      const id = b.dataset.id;
      estado.importantes = estado.importantes.includes(id) ? estado.importantes.filter(x => x !== id) : [...estado.importantes, id].slice(0, maxImportantes(estado.modo));
      guardar(); importantes();
      pantalla.querySelector(`[data-id="${CSS.escape(id)}"]`)?.focus();
      break;
    }
    case 'a-sobre': ir('sobre'); break;
    case 'abrir-sobre': abrirSobre(); break;
    case 'saltar-recuento': terminarRecuento(); break;
    case 'fila': {
      const p = b.dataset.partido;
      estado.abierta = estado.abierta === p ? null : p;
      guardar(); acta();
      pantalla.querySelector(`[data-accion="fila"][data-partido="${CSS.escape(p)}"]`)?.focus();
      break;
    }
    case 'vista': estado.vista = b.dataset.vista; estado.abierta = null; guardar(); acta(); pantalla.querySelector(`[data-vista="${b.dataset.vista}"]`)?.focus(); break;
    case 'a-revelacion': estado.revelacionIdx = 0; ir('revelacion'); break;
    case 'ver-tema': estado.revelacionIdx = Number(b.dataset.idx); ir('revelacion'); break;
    case 'revelar': revelar([b.dataset.id]); break;
    case 'revelar-todas': revelar(estado.orden[estado.temas[estado.revelacionIdx]]); break;
    case 'a-acta': ir('acta'); break;
    case 'a-compartir': ir('compartir'); break;
    case 'compartir-que': estado.compartir.que = b.dataset.valor; compartirPantalla(); break;
    case 'compartir-favorita': estado.compartir.favorita = b.dataset.valor; compartirPantalla(); break;
    case 'compartir-formato': estado.compartir.formato = b.dataset.valor; compartirPantalla(); break;
    case 'compartir': case 'descargar': case 'copiar': accionCompartir(accion); break;
    case 'reiniciar': try { sessionStorage.removeItem(CLAVE); } catch { /* nada */ } estado = nuevoEstado(); render(); break;
    default: break;
  }
});

// Teclado en las papeletas: ← no, → sí, ↓ paso, Retroceso deshace.
document.addEventListener('keydown', (e) => {
  if (estado.fase !== 'papeleta' || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.target.closest('input, textarea, select') || glosarioPanel.abierto()) return;
  const teclas = { ArrowLeft: () => decidir('no'), ArrowRight: () => decidir('si'), ArrowDown: () => decidir('paso'), Backspace: () => deshacer() };
  if (teclas[e.key]) { e.preventDefault(); teclas[e.key](); }
});

// ───── Arranque ─────

let glosarioPanel;
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
  glosario = banco.glosario;
  const panel = document.getElementById('definicion');
  document.body.append(panel);
  glosarioPanel = iniciarGlosario(glosario, panel);
  raiz.classList.add('juego--listo');
  render();
}

arrancar();
