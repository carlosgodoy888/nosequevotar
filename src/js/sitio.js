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
   * @param {string} nombre  clic_hacer_test, clic_fuente, clic_guia, clic_menu o clic_donar.
   * @param {Object} [datos] Contexto: pagina (ruta actual) y destino (enlace pulsado).
   */
  function registrarEvento(nombre, datos) {
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
  var hoy;
  try {
    hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date());
  } catch (err) {
    hoy = new Date().toISOString().slice(0, 10);
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

  // Tarjeta de ejemplo de la portada.
  var tarjeta = document.getElementById('tarjeta');
  if (tarjeta) {
    var convence = document.getElementById('convence');
    var estado = document.getElementById('estado');
    var franja = document.getElementById('franja');
    var partido = document.getElementById('partido');
    var revelar = document.getElementById('revelar');
    var anuncio = document.getElementById('anuncio');

    convence.addEventListener('click', function () {
      var marcada = convence.getAttribute('aria-pressed') !== 'true';
      convence.setAttribute('aria-pressed', String(marcada));
      convence.querySelector('.casilla').classList.toggle('marcada', marcada);
      tarjeta.classList.toggle('elegida', marcada);
      estado.textContent = marcada ? 'Elegida' : '';
    });

    revelar.addEventListener('click', function () {
      var abierta = !franja.classList.contains('revelada');
      franja.classList.toggle('revelada', abierta);
      if (abierta) partido.removeAttribute('aria-hidden'); else partido.setAttribute('aria-hidden', 'true');
      revelar.textContent = abierta ? 'Volver a tapar' : 'Revelar quién la firmaba';
      revelar.classList.toggle('boton--claro', abierta);
      anuncio.textContent = abierta ? 'La firmaba el Partido Norte, un partido inventado.' : '';
    });
  }
})();
