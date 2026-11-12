// Páginas de un partido y de un tema: barra de saltos, buscador, vista y elección de partidos.
// Mejora progresiva: sin JavaScript la página se lee entera con su índice.
// No se guarda nada en el navegador (la página de privacidad lo promete): la vista y los partidos
// elegidos van en la dirección de la página (?partidos=pp,psoe&vista=resumenes) y pasan a los enlaces
// a otros temas y partidos. Así la comparación se conserva al cambiar de tema y se puede compartir.

const ficha = document.querySelector('[data-ficha]');
if (ficha) {
  const secciones = [...ficha.querySelectorAll('[data-salto]')];
  const visibles = () => secciones.filter(s => !s.hidden);
  const sinTildes = (t) => t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

  // --- Estado en la dirección ---
  const consulta = new URLSearchParams(location.search);
  const enUrl = {
    // null: todos los partidos. Si no, la lista de los elegidos (puede traer partidos que este tema no tiene).
    partidos: consulta.has('partidos') ? consulta.get('partidos').split(',').filter(id => /^[a-z0-9-]+$/.test(id)) : null,
    vista: consulta.get('vista') === 'resumenes' ? 'resumenes' : null,
  };
  const enlaces = [...ficha.querySelectorAll('a[href^="/temas/"], a[href^="/partidos/"]')].filter(a => /^\/(temas|partidos)\/[^/#]+\//.test(a.getAttribute('href')));
  const escribirUrl = () => {
    const partes = [];
    if (enUrl.partidos) partes.push(`partidos=${enUrl.partidos.join(',')}`);
    if (enUrl.vista) partes.push(`vista=${enUrl.vista}`);
    const cola = partes.length ? `?${partes.join('&')}` : '';
    if (cola !== location.search) history.replaceState(null, '', location.pathname + cola + location.hash);
    for (const a of enlaces) {
      const [ruta, ancla] = (a.dataset.base ??= a.getAttribute('href')).split('#');
      a.setAttribute('href', ruta + cola + (ancla ? `#${ancla}` : ''));
    }
  };

  const enIndice = new Map(secciones.map(s => [s, ficha.querySelector(`[data-indice="${s.dataset.partido ?? s.id.replace(/^tema-/, '')}"]`)]));

  // Una sección puede estar oculta por dos motivos a la vez: el buscador y la elección de partidos.
  const ocultar = (seccion, motivo, si) => {
    seccion.toggleAttribute(`data-oculta-${motivo}`, si);
    seccion.hidden = seccion.hasAttribute('data-oculta-busqueda') || seccion.hasAttribute('data-oculta-partido');
    const entrada = enIndice.get(seccion);
    if (entrada) entrada.hidden = seccion.hidden;
  };
  const avisar = () => ficha.dispatchEvent(new Event('ficha:cambio'));

  const herramientas = ficha.querySelector('[data-herramientas]');
  if (herramientas) herramientas.hidden = false;

  barraDeSaltos();
  buscador();
  vista();
  elegirPartidos();
  abrirDestino();
  addEventListener('hashchange', abrirDestino);

  // --- Barra fija: anterior, menú de secciones, siguiente ---
  // El menú es un botón con la sección actual que despliega una lista de enlaces (no un <select>, para
  // que tenga el aspecto de la web en todos los dispositivos). Se maneja con el ratón, el dedo o el teclado:
  // flechas, Inicio y Fin para moverse, Intro para ir y Escape para cerrar.
  function barraDeSaltos() {
    const barra = ficha.querySelector('[data-saltos]');
    if (!barra || !secciones.length) return;
    const lista = barra.querySelector('[data-saltos-lista]');
    const abrir = barra.querySelector('[data-saltos-abrir]');
    const nombre = barra.querySelector('[data-saltos-nombre]');
    const orden = barra.querySelector('[data-saltos-orden]');
    const ordenLector = barra.querySelector('[data-saltos-orden-lector]');
    const anterior = barra.querySelector('[data-saltos-anterior]');
    const siguiente = barra.querySelector('[data-saltos-siguiente]');
    let actual = null; // id de la sección en la que se está
    let objetivo = null;
    let suelta;

    const opciones = () => [...lista.querySelectorAll('a')];
    // Deja una sección como la actual: en el botón, en la casilla de la lista y en anterior y siguiente.
    const poner = (id) => {
      actual = id;
      const v = visibles();
      const i = v.findIndex(s => s.id === id);
      nombre.textContent = i < 0 ? '' : v[i].dataset.salto;
      orden.textContent = i < 0 ? '' : `${i + 1}/${v.length}`;
      ordenLector.textContent = i < 0 ? '' : `, ${i + 1} de ${v.length}`;
      for (const a of opciones()) {
        const esta = a.dataset.id === id;
        if (esta) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        a.querySelector('.casilla').classList.toggle('marcada', esta);
      }
      anterior.disabled = i <= 0;
      siguiente.disabled = i < 0 || i >= v.length - 1;
    };
    // Navegación nativa al ancla: el navegador coloca la sección bajo la barra y deja ahí el punto
    // de partida del tabulador. No añade pasos al botón «atrás». Si la dirección ya apuntaba a esa
    // sección, el navegador puede no moverse: por eso se lleva además la sección a su sitio.
    const ir = (id) => {
      objetivo = id;
      clearTimeout(suelta);
      suelta = setTimeout(() => { objetivo = null; }, 400);
      location.replace(`#${id}`);
      document.getElementById(id)?.scrollIntoView({ block: 'start' });
      poner(id);
    };
    const mover = (pasos) => {
      const v = visibles();
      const i = Math.max(0, v.findIndex(s => s.id === actual));
      const destino = v[Math.min(v.length - 1, Math.max(0, i + pasos))];
      if (destino) ir(destino.id);
    };

    // La lista ocupa, como mucho, lo que queda de pantalla bajo la barra.
    const ajustar = () => { lista.style.maxHeight = `${Math.max(160, innerHeight - barra.getBoundingClientRect().bottom - 12)}px`; };
    const cerrar = (devolverFoco) => {
      if (lista.hidden) return;
      lista.hidden = true;
      barra.classList.remove('saltos--abierta');
      abrir.setAttribute('aria-expanded', 'false');
      if (devolverFoco) abrir.focus({ preventScroll: true });
    };
    const desplegar = () => {
      if (barra.hidden) return;
      // Si la barra aún no está pegada arriba y debajo queda poco sitio, la página sube hasta pegarla
      // (su «top» es la altura a la que se queda fija, bajo la cabecera y la miga de pan).
      const sobra = barra.getBoundingClientRect().top - (parseFloat(getComputedStyle(barra).top) || 0);
      if (sobra > 1 && innerHeight - barra.getBoundingClientRect().bottom < 320) scrollBy(0, sobra);
      lista.hidden = false;
      barra.classList.add('saltos--abierta');
      abrir.setAttribute('aria-expanded', 'true');
      ajustar();
      // La sección actual queda a la vista, centrada, y con el foco.
      const marcada = lista.querySelector('[aria-current]') ?? lista.querySelector('a');
      if (marcada) {
        lista.scrollTop = marcada.offsetTop - (lista.clientHeight - marcada.offsetHeight) / 2;
        marcada.focus({ preventScroll: true });
      }
    };
    const opcion = (seccion, i, total) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${seccion.id}`;
      a.dataset.id = seccion.id;
      const casilla = document.createElement('span');
      casilla.className = 'casilla';
      casilla.setAttribute('aria-hidden', 'true');
      const texto = document.createElement('span');
      texto.className = 'saltos__opcion';
      texto.textContent = seccion.dataset.salto;
      const numero = document.createElement('span');
      numero.className = 'saltos__orden';
      numero.setAttribute('aria-hidden', 'true');
      numero.textContent = `${i + 1}/${total}`;
      a.append(casilla, texto, numero);
      li.append(a);
      return li;
    };
    // La sección actual es la última cuyo comienzo ya ha pasado por debajo de la barra. Al final de
    // la página, la última sección puede no llegar arriba: si se ve, es la actual.
    let pendiente = false;
    const marcar = () => {
      pendiente = false;
      const v = visibles();
      if (objetivo || !v.length) return;
      const limite = barra.getBoundingClientRect().bottom + 24;
      const alFinal = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
      const ultima = v.at(-1);
      const ahora = alFinal && ultima.getBoundingClientRect().top < innerHeight
        ? ultima
        : v.filter(s => s.getBoundingClientRect().top <= limite).at(-1) ?? v[0];
      if (actual !== ahora.id) poner(ahora.id);
    };
    // Rehace la lista con las secciones que se ven (el buscador y la elección de partidos ocultan algunas).
    const pintar = () => {
      const v = visibles();
      lista.replaceChildren(...v.map((s, i) => opcion(s, i, v.length)));
      barra.hidden = v.length < 2;
      if (barra.hidden) cerrar(false);
      poner(v.some(s => s.id === actual) ? actual : v[0]?.id ?? null);
      marcar();
    };
    addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(marcar); } }, { passive: true });
    addEventListener('resize', () => { if (!lista.hidden) ajustar(); });
    abrir.addEventListener('click', () => { if (lista.hidden) desplegar(); else cerrar(true); });
    lista.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      e.preventDefault();
      cerrar(false);
      ir(a.dataset.id);
    });
    barra.addEventListener('keydown', (e) => {
      if (lista.hidden) {
        if (e.target === abrir && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); desplegar(); }
        return;
      }
      if (e.key === 'Escape') { e.preventDefault(); cerrar(true); return; }
      const o = opciones();
      const i = o.indexOf(document.activeElement);
      const destino = { ArrowDown: o[Math.min(o.length - 1, i + 1)], ArrowUp: o[Math.max(0, i - 1)], Home: o[0], End: o.at(-1) }[e.key];
      if (destino) { e.preventDefault(); destino.focus(); }
    });
    // Tocar fuera de la lista, o salir de ella con el tabulador, la cierra.
    document.addEventListener('click', (e) => { if (!lista.hidden && !lista.contains(e.target) && !abrir.contains(e.target)) cerrar(false); });
    barra.addEventListener('focusout', (e) => {
      if (!lista.hidden && e.relatedTarget && !lista.contains(e.relatedTarget) && e.relatedTarget !== abrir) cerrar(false);
    });
    anterior.addEventListener('click', () => mover(-1));
    siguiente.addEventListener('click', () => mover(1));
    ficha.addEventListener('ficha:cambio', pintar);
    pintar();
  }

  // --- Buscador dentro de la página ---
  function buscador() {
    const campo = ficha.querySelector('[data-buscar]');
    if (!campo) return;
    const estado = ficha.querySelector('[data-buscar-estado]');
    const borrar = ficha.querySelector('[data-buscar-borrar]');
    // El texto de las citas se prepara la primera vez que se busca, no al cargar: hay fichas con más de mil.
    let preparadas = null;
    const citasConTexto = () => (preparadas ??= [...ficha.querySelectorAll('.cita')].map(el => ({ el, texto: sinTildes(el.textContent) })));
    const pliegues = [...ficha.querySelectorAll('.pliegue')];
    const grupos = [...ficha.querySelectorAll('.grupo')];
    const cosa = ficha.dataset.ficha === 'tema' ? ['partido', 'partidos'] : ['tema', 'temas'];
    const resaltadas = new Set();

    const quitarResalte = (el) => {
      for (const m of el.querySelectorAll('mark')) m.replaceWith(...m.childNodes);
      el.normalize();
    };
    // Envuelve en <mark> cada aparición, sin distinguir tildes ni mayúsculas.
    const resaltar = (el, palabras) => {
      const nodos = [];
      const paseo = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (paseo.nextNode()) nodos.push(paseo.currentNode);
      for (const nodo of nodos) {
        const original = nodo.data;
        let plano = '';
        const pos = []; // plano[i] sale del carácter original[pos[i]]
        for (let i = 0; i < original.length; i++) for (const letra of sinTildes(original[i])) { plano += letra; pos.push(i); }
        const tramos = [];
        for (const p of palabras) {
          for (let d = plano.indexOf(p); d !== -1; d = plano.indexOf(p, d + p.length)) tramos.push([pos[d], pos[d + p.length - 1] + 1]);
        }
        if (!tramos.length) continue;
        tramos.sort((a, b) => a[0] - b[0]);
        const trozos = [];
        let fin = 0;
        for (const [desde, hasta] of tramos) {
          if (desde < fin) continue;
          const marca = document.createElement('mark');
          marca.textContent = original.slice(desde, hasta);
          trozos.push(original.slice(fin, desde), marca);
          fin = hasta;
        }
        nodo.replaceWith(...trozos, original.slice(fin));
      }
    };

    const aplicar = () => {
      const texto = campo.value.trim();
      const palabras = texto.length < 2 ? [] : sinTildes(texto).split(/\s+/).filter(Boolean);
      const buscando = palabras.length > 0;
      ficha.classList.toggle('buscando', buscando);
      borrar.hidden = !campo.value;
      if (!buscando && !preparadas) { estado.textContent = texto ? 'Escribe al menos dos letras.' : ''; return; }
      for (const el of resaltadas) quitarResalte(el);
      resaltadas.clear();
      for (const c of citasConTexto()) {
        const si = !buscando || palabras.every(p => c.texto.includes(p));
        c.el.hidden = !si;
        if (si && buscando) { resaltar(c.el, palabras); resaltadas.add(c.el); }
      }
      for (const g of grupos) g.hidden = buscando && !g.querySelector('.cita:not([hidden])');
      for (const p of pliegues) {
        if (buscando) {
          if (!('abierto' in p.dataset)) p.dataset.abierto = p.open ? '1' : '';
          const hay = Boolean(p.querySelector('.cita:not([hidden])'));
          p.open = hay;
          p.hidden = !hay;
        } else if ('abierto' in p.dataset) {
          p.open = p.dataset.abierto === '1';
          p.hidden = false;
          delete p.dataset.abierto;
        }
      }
      let total = 0;
      let con = 0;
      for (const s of secciones) {
        const n = buscando ? s.querySelectorAll('.cita:not([hidden])').length : 0;
        ocultar(s, 'busqueda', buscando && !n);
        // Mientras se busca, el índice cuenta los resultados de cada sección.
        const rotulo = enIndice.get(s)?.querySelector('.indice__cuenta');
        if (rotulo) {
          rotulo.dataset.cuenta ??= rotulo.textContent;
          rotulo.textContent = buscando ? `${n} ${n === 1 ? 'resultado' : 'resultados'}` : rotulo.dataset.cuenta;
        }
        if (n && !s.hidden) { total += n; con++; }
      }
      estado.textContent = !buscando ? (texto ? 'Escribe al menos dos letras.' : '')
        : total ? `${total} ${total === 1 ? 'resultado' : 'resultados'} con «${texto}» en ${con} ${con === 1 ? cosa[0] : cosa[1]}. Están resaltados más abajo.`
          : `Ningún resultado con «${texto}». Prueba con otra palabra.`;
      avisar();
    };
    let espera;
    campo.addEventListener('input', () => { clearTimeout(espera); espera = setTimeout(aplicar, 200); });
    campo.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); clearTimeout(espera); aplicar(); campo.blur(); } });
    borrar.addEventListener('click', () => { campo.value = ''; clearTimeout(espera); aplicar(); campo.focus(); });
    ficha.addEventListener('ficha:partidos', () => { if (ficha.classList.contains('buscando')) aplicar(); });
  }

  // --- Vista: resúmenes y medidas, o solo resúmenes ---
  function vista() {
    const botones = [...ficha.querySelectorAll('[data-vista]')];
    if (!botones.length) return;
    const poner = (cual) => {
      ficha.classList.toggle('solo-resumenes', cual === 'resumenes');
      for (const b of botones) b.setAttribute('aria-pressed', String(b.dataset.vista === cual));
      enUrl.vista = cual === 'resumenes' ? 'resumenes' : null;
      escribirUrl();
    };
    for (const b of botones) b.addEventListener('click', () => poner(b.dataset.vista));
    poner(enUrl.vista ?? 'todo');
  }

  // --- En un tema: qué partidos se comparan ---
  function elegirPartidos() {
    const caja = ficha.querySelector('[data-elegir]');
    if (!caja) return;
    const casillas = [...caja.querySelectorAll('input[type="checkbox"]')];
    const cuenta = caja.querySelector('[data-elegir-cuenta]');
    const vacio = ficha.querySelector('[data-vacio]');
    const aqui = new Set(casillas.map(c => c.value));
    // Partidos elegidos en otro tema que en este no dicen nada: se conservan para el tema siguiente.
    const deOtrosTemas = () => (enUrl.partidos ?? []).filter(id => !aqui.has(id));

    const aplicar = () => {
      const elegidos = casillas.filter(c => c.checked).map(c => c.value);
      for (const s of secciones) ocultar(s, 'partido', !elegidos.includes(s.dataset.partido));
      cuenta.textContent = elegidos.length === casillas.length ? '· todos' : `· ${elegidos.length} de ${casillas.length}`;
      if (vacio) vacio.hidden = elegidos.length > 0;
      enUrl.partidos = elegidos.length === casillas.length ? null : [...elegidos, ...deOtrosTemas()];
      escribirUrl();
      ficha.dispatchEvent(new Event('ficha:partidos'));
      avisar();
    };
    for (const c of casillas) { c.checked = !enUrl.partidos || enUrl.partidos.includes(c.value); c.addEventListener('change', aplicar); }
    // Si la dirección trae una elección que en este tema coincide con todos, se respeta tal cual hasta que se toque algo.
    const todosAlLlegar = enUrl.partidos && casillas.every(c => c.checked) ? [...enUrl.partidos] : null;
    caja.querySelector('[data-elegir-todos]').addEventListener('click', () => { for (const c of casillas) c.checked = true; aplicar(); });
    caja.querySelector('[data-elegir-ninguno]').addEventListener('click', () => { enUrl.partidos = []; for (const c of casillas) c.checked = false; aplicar(); });
    aplicar();
    if (todosAlLlegar) { enUrl.partidos = todosAlLlegar; escribirUrl(); }
  }

  // Si el enlace apunta a un partido que se había quitado o a algo dentro de un bloque plegado,
  // se vuelve a mostrar y se va hasta allí.
  function abrirDestino() {
    if (location.hash.length < 2) return;
    const destino = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    const seccion = destino?.closest('[data-salto]');
    if (!seccion) return;
    let cambiado = false;
    if (seccion.hasAttribute('data-oculta-partido')) {
      const casilla = ficha.querySelector(`[data-elegir] input[value="${seccion.dataset.partido}"]`);
      if (casilla) { casilla.checked = true; casilla.dispatchEvent(new Event('change')); cambiado = true; }
    }
    const plegado = destino.closest('details:not([open])');
    if (plegado) { plegado.open = true; cambiado = true; }
    if (cambiado) destino.scrollIntoView({ block: 'start' });
  }
}
