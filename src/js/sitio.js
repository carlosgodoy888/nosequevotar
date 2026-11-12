// No sé qué votar · JavaScript común. Todo es una mejora: las páginas se leen enteras sin él.
(function () {
  'use strict';

  /**
   * Registra un evento de medición. Hoy no hace nada.
   *
   * Aquí se conectará Tag Manager cuando exista el aviso de cookies y la
   * persona haya aceptado la medición (consentimiento analytics_storage).
   * La idea es empujar a la capa de datos algo como:
   *   window.dataLayer.push({ event: 'accion', accion: nombre, pagina: datos.pagina });
   *
   * Nunca se envía la respuesta a una pregunta, un resultado ni un partido.
   * En /test/, /resultado/ y /reto/ no se cargará nunca nada de terceros.
   *
   * @param {string} nombre  clic_hacer_test, clic_temas, clic_fuente, clic_guia, clic_menu o clic_donar.
   * @param {Object} [datos] Contexto: pagina (ruta actual) y destino (enlace pulsado).
   */
  function registrarEvento(nombre, datos) {
    // En las páginas con data-sin-medicion (el test) no se registra nunca nada.
    if (document.body && document.body.hasAttribute('data-sin-medicion')) return;
    // Desactivado a propósito.
  }
  window.registrarEvento = registrarEvento;

  // Cualquier elemento con data-evento avisa al pulsarlo.
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-evento]');
    if (!el) return;
    registrarEvento(el.getAttribute('data-evento'), {
      pagina: location.pathname,
      destino: el.getAttribute('href') || undefined
    });
  });

  // Menú móvil
  var boton = document.querySelector('.menu-boton');
  var menu = document.getElementById('menu');
  var escritorio = window.matchMedia('(min-width: 900px)');

  function enlacesMenu() {
    return Array.prototype.slice.call(menu.querySelectorAll('a'));
  }

  function abrir() {
    menu.classList.add('abierto');
    document.body.classList.add('menu-abierto');
    boton.setAttribute('aria-expanded', 'true');
    boton.querySelector('.menu-boton__texto').textContent = 'Cerrar';
    enlacesMenu()[0].focus();
  }

  function cerrar(devolverFoco) {
    if (!menu.classList.contains('abierto')) return;
    menu.classList.remove('abierto');
    document.body.classList.remove('menu-abierto');
    boton.setAttribute('aria-expanded', 'false');
    boton.querySelector('.menu-boton__texto').textContent = 'Menú';
    if (devolverFoco) boton.focus();
  }

  if (boton && menu) {
    boton.addEventListener('click', function () {
      if (menu.classList.contains('abierto')) cerrar(true); else abrir();
    });

    document.addEventListener('keydown', function (e) {
      if (!menu.classList.contains('abierto')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        cerrar(true);
        return;
      }
      // El foco se queda dentro del panel y el botón de cerrar.
      if (e.key === 'Tab') {
        var enfocables = [boton].concat(enlacesMenu());
        var primero = enfocables[0];
        var ultimo = enfocables[enfocables.length - 1];
        if (e.shiftKey && document.activeElement === primero) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primero.focus();
        }
      }
    });

    // Tocar fuera del panel lo cierra.
    document.addEventListener('click', function (e) {
      if (!menu.classList.contains('abierto')) return;
      if (menu.contains(e.target) || boton.contains(e.target)) return;
      cerrar(true);
    });

    // Elegir un enlace lo cierra.
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) cerrar(false);
    });

    // Al pasar a escritorio, el panel deja de existir.
    escritorio.addEventListener('change', function (e) {
      if (e.matches) cerrar(false);
    });
  }

  // Fechas: la página llega calculada desde la construcción; aquí se recalcula
  // con la fecha de hoy en Madrid por si la web lleva días sin publicarse.
  // Siempre es el día en Madrid, nunca el de la zona horaria del dispositivo.
  var hoy = hoyMadrid(new Date());

  function hoyMadrid(ahora) {
    try {
      var partes = {};
      new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' })
        .formatToParts(ahora).forEach(function (p) { partes[p.type] = p.value; });
      if (partes.year && partes.month && partes.day) return partes.year + '-' + partes.month + '-' + partes.day;
    } catch (err) { /* Navegador sin zonas horarias: se calcula a mano. */ }
    // Hora de Madrid a partir de UTC: +2 en verano (del último domingo de marzo al último
    // domingo de octubre, a la 1:00 UTC) y +1 el resto del año.
    var anio = ahora.getUTCFullYear();
    var ultimoDomingo = function (mes) {
      var d = new Date(Date.UTC(anio, mes + 1, 0, 1));
      return d.getTime() - d.getUTCDay() * 86400000;
    };
    var t = ahora.getTime();
    var verano = t >= ultimoDomingo(2) && t < ultimoDomingo(9);
    return new Date(t + (verano ? 2 : 1) * 3600000).toISOString().slice(0, 10);
  }

  // Bloques que solo se ven entre dos fechas (data-desde y data-hasta, incluidas).
  document.querySelectorAll('[data-desde], [data-hasta]').forEach(function (el) {
    var desde = el.getAttribute('data-desde');
    var hasta = el.getAttribute('data-hasta');
    el.hidden = (desde && hoy < desde) || (hasta && hoy > hasta);
  });

  // Tablas de fechas: misma regla que estados() en src/plantillas/util.mjs.
  var ROTULOS = { pasada: 'Ya pasó', ahora: 'Ahora', proxima: 'Próxima' };
  document.querySelectorAll('.fechas-tabla').forEach(function (tabla) {
    var filas = Array.prototype.slice.call(tabla.querySelectorAll('.fila-fecha'));
    var estados = filas.map(function (f) {
      var inicio = f.getAttribute('data-inicio');
      var fin = f.getAttribute('data-fin') || inicio;
      if (fin < hoy) return 'pasada';
      if (inicio <= hoy) return 'ahora';
      return '';
    });
    if (estados.indexOf('ahora') === -1) {
      var i = estados.indexOf('');
      if (i >= 0) estados[i] = 'proxima';
    }
    filas.forEach(function (f, i) {
      ['pasada', 'ahora', 'proxima'].forEach(function (e) { f.classList.toggle('es-' + e, estados[i] === e); });
      var celda = f.querySelector('.fila-fecha__estado');
      if (celda) celda.textContent = ROTULOS[estados[i]] || '';
    });
  });

  // Cuenta atrás hasta el día de votación.
  document.querySelectorAll('[data-cuenta]').forEach(function (el) {
    var dias = Math.round((Date.parse(el.getAttribute('data-cuenta')) - Date.parse(hoy)) / 86400000);
    el.hidden = dias < 1;
    el.querySelector('.cuenta__numero').textContent = dias;
    el.querySelector('.cuenta__texto').textContent = dias === 1 ? 'día para votar' : 'días para votar';
  });

  // Tarjeta «Próximo plazo» de la portada. El HTML trae todos los plazos; aquí se deja como
  // principal el próximo para todos y, debajo, el próximo para quien vive o está fuera de España.
  // Se ocultan los pasados y, si ya no queda ninguno para todos, la tarjeta entera.
  var plazo = document.querySelector('[data-plazo]');
  if (plazo) {
    var elegir = function (publico) {
      var items = Array.prototype.slice.call(plazo.querySelectorAll('[data-publico="' + publico + '"]'));
      var fin = function (li) { return li.getAttribute('data-fin') || li.getAttribute('data-inicio'); };
      var proximo = items.map(fin).filter(function (f) { return f >= hoy; }).sort()[0];
      items.forEach(function (li) { li.hidden = fin(li) !== proximo; });
      return proximo;
    };
    var fuera = plazo.querySelector('.plazo__fuera');
    if (fuera) fuera.hidden = !elegir('extranjero');
    plazo.hidden = !elegir('todos');
    plazo.querySelector('.plazo__rotulo').textContent = 'Próximo plazo';
    plazo.classList.add('plazo--calculada');
  }

  // Botón fijo «Volver arriba»: llega oculto y se muestra al pasar la primera pantalla.
  var arriba = document.querySelector('[data-arriba]');
  if (arriba) {
    var arribaPendiente = false;
    var mostrarArriba = function () {
      arribaPendiente = false;
      arriba.hidden = window.scrollY < window.innerHeight;
    };
    window.addEventListener('scroll', function () {
      if (arribaPendiente) return;
      arribaPendiente = true;
      requestAnimationFrame(mostrarArriba);
    }, { passive: true });
    mostrarArriba();
  }

  // Tarjeta de temas de la portada: la casilla se marca al pulsar, mientras carga la página de temas.
  // Al volver con el botón «atrás» las casillas salen otra vez sin marcar.
  var temasPortada = Array.prototype.slice.call(document.querySelectorAll('[data-tema-portada]'));
  if (temasPortada.length) {
    temasPortada.forEach(function (enlace) {
      enlace.addEventListener('click', function () { enlace.querySelector('.casilla').classList.add('marcada'); });
    });
    window.addEventListener('pageshow', function () {
      temasPortada.forEach(function (enlace) { enlace.querySelector('.casilla').classList.remove('marcada'); });
    });
  }

  // Tarjeta de ejemplo de la portada.
  var tarjeta = document.getElementById('tarjeta');
  if (tarjeta) {
    var estado = document.getElementById('estado');
    var decisiones = Array.prototype.slice.call(tarjeta.querySelectorAll('[data-demo]'));
    var ROTULOS_DEMO = { si: 'En el sobre', no: 'Apartada', paso: 'Sin decidir' };

    // Tres botones con el mismo peso: se marca uno (casilla con aspa) y se puede desmarcar.
    decisiones.forEach(function (boton) {
      boton.addEventListener('click', function () {
        var marcada = boton.getAttribute('aria-pressed') !== 'true';
        decisiones.forEach(function (b) {
          var esta = marcada && b === boton;
          b.setAttribute('aria-pressed', String(esta));
          b.querySelector('.casilla').classList.toggle('marcada', esta);
        });
        tarjeta.classList.toggle('elegida', marcada);
        estado.textContent = marcada ? ROTULOS_DEMO[boton.getAttribute('data-demo')] : '';
      });
    });
  }
})();
