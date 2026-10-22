// Barajado sin sesgo (Fisher-Yates) con crypto.getRandomValues.

// Entero uniforme en [0, n): se descartan los valores del final del rango para no favorecer a nadie.
function enteroMenorQue(n) {
  const limite = Math.floor(0x100000000 / n) * n;
  const caja = new Uint32Array(1);
  do crypto.getRandomValues(caja); while (caja[0] >= limite);
  return caja[0] % n;
}

export function barajar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = enteroMenorQue(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
