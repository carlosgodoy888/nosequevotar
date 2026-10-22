// Glosario dentro del test: subraya en el texto de una papeleta los términos que enlazan esa tarjeta
// y abre su definición al tocarlos. Abrir una definición no cuenta como respuesta ni cambia el test.

export const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Primera aparición de cada término en el texto. Si dos variantes se solapan, gana la que empieza antes y,
// a igualdad, la más larga. Solo los términos cuya lista «tarjetas» incluye esta tarjeta.
export function buscarTerminos(texto, tarjetaId, glosario) {
  const candidatos = [];
  for (const g of glosario) {
    if (!g.tarjetas.includes(tarjetaId)) continue;
    let mejor = null;
    for (const v of g.variantes) {
      const i = texto.indexOf(v);
      if (i >= 0 && (!mejor || i < mejor.inicio || (i === mejor.inicio && v.length > mejor.fin - mejor.inicio))) mejor = { inicio: i, fin: i + v.length, termino: g };
    }
    if (mejor) candidatos.push(mejor);
  }
  candidatos.sort((a, b) => a.inicio - b.inicio || (b.fin - b.inicio) - (a.fin - a.inicio));
  const elegidos = [];
  for (const c of candidatos) if (!elegidos.length || c.inicio >= elegidos.at(-1).fin) elegidos.push(c);
  return elegidos;
}

export function textoConTerminos(texto, tarjetaId, glosario) {
  let html = '';
  let pos = 0;
  for (const m of buscarTerminos(texto, tarjetaId, glosario)) {
    html += esc(texto.slice(pos, m.inicio));
    html += `<button type="button" class="termino" data-termino="${esc(m.termino.id)}" aria-expanded="false" aria-controls="definicion" aria-haspopup="dialog">${esc(texto.slice(m.inicio, m.fin))}</button>`;
    pos = m.fin;
  }
  return html + esc(texto.slice(pos));
}

// Panel de definición: en el móvil, desde abajo; en escritorio, junto a la palabra.
export function iniciarGlosario(glosario, panel) {
  const porId = new Map(glosario.map(g => [g.id, g]));
  const escritorio = window.matchMedia('(min-width: 600px)');
  let abiertoDesde = null;

  function cerrar(devolverFoco = true) {
    if (!abiertoDesde) return;
    abiertoDesde.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
    const boton = abiertoDesde;
    abiertoDesde = null;
    if (devolverFoco && boton.isConnected) boton.focus();
  }

  function colocar(boton) {
    panel.classList.toggle('definicion--abajo', !escritorio.matches);
    if (!escritorio.matches) { panel.style.top = ''; panel.style.left = ''; return; }
    const r = boton.getBoundingClientRect();
    const ancho = Math.min(360, window.innerWidth - 32);
    const izquierda = Math.max(16, Math.min(r.left + window.scrollX, window.scrollX + window.innerWidth - ancho - 16));
    panel.style.left = `${izquierda}px`;
    panel.style.top = `${r.bottom + window.scrollY + 8}px`;
  }

  function abrir(boton) {
    const g = porId.get(boton.dataset.termino);
    if (!g) return;
    if (abiertoDesde) cerrar(false);
    panel.querySelector('#definicion-termino').textContent = g.termino;
    panel.querySelector('#definicion-texto').textContent = g.definicion;
    panel.hidden = false;
    colocar(boton);
    boton.setAttribute('aria-expanded', 'true');
    abiertoDesde = boton;
    panel.querySelector('.definicion__cerrar').focus();
  }

  document.addEventListener('click', (e) => {
    const boton = e.target.closest('.termino');
    if (boton) {
      e.preventDefault();
      if (abiertoDesde === boton) cerrar(); else abrir(boton);
      return;
    }
    if (e.target.closest('.definicion__cerrar')) { cerrar(); return; }
    if (abiertoDesde && !panel.contains(e.target)) cerrar(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && abiertoDesde) { e.preventDefault(); e.stopPropagation(); cerrar(); }
  }, true);
  window.addEventListener('resize', () => { if (abiertoDesde) colocar(abiertoDesde); });

  return { abierto: () => !!abiertoDesde, cerrar };
}
