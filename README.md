# nosequevotar

Web estática de [nosequevotar.es](https://nosequevotar.es): guías para votar en las elecciones generales del 29 de noviembre de 2026 y juegos para comparar propuestas sin siglas.

## Cómo se construye

La carpeta `public/` es lo que se publica y se genera a partir de `src/`:

```sh
node scripts/construir.mjs
```

Necesita Node 22 y no tiene dependencias. `public/` no se sube al repositorio: GitHub Actions lo construye en cada push a `main` y cada noche, para que las fechas se recalculen solas. En local sirve para ver la web antes de subir los cambios.

Para comprobar cómo se verá la web otro día (por ejemplo, la guía del censo cuando termine el plazo), fija la fecha:

```sh
FECHA_HOY=2026-10-20 node scripts/construir.mjs
```

Antes de subir nada, vuelve a construir sin `FECHA_HOY`.

## Cómo se comprueba

Después de construir:

```sh
node --test "tests/*.test.mjs"     # motor del test, validación del banco y simulación en las 52 circunscripciones
node scripts/comprobar.mjs         # todas las páginas: HTML cerrado, un h1, lang, title, description y canónico únicos, enlaces internos, nada de otros dominios
node scripts/comprobar-test.mjs    # /test/: CSP en meta, data-sin-medicion, nada en línea y nada de otros dominios
```

Para ver la web en local:

```sh
python3 -m http.server 8787 -d public
```

o, sin Python (por ejemplo en Windows):

```sh
node scripts/servir.mjs            # con --red, también desde el móvil en la misma wifi
```

y abre http://localhost:8787/. El servidor lee `public/` en cada petición: después de volver a construir basta con recargar la página. Para abrirla desde el móvil en la misma wifi, sirve con `--bind 0.0.0.0` (o `--red` con el de Node) y abre en el móvil `http://<IP del ordenador>:8787/` (en un Mac, la IP sale con `ipconfig getifaddr en0`). Sin https, el móvil no deja compartir la imagen ni copiar al portapapeles: el test la descarga y selecciona el texto.

## Dónde se cambia cada cosa

| Qué | Archivo |
| --- | --- |
| Texto de una guía | `src/contenido/guias/<guía>.json` |
| Fechas del calendario (las usan también las guías) | `src/contenido/fechas.json` |
| Menú, pie, páginas «Muy pronto» y datos de la elección | `src/contenido/sitio.json` |
| Páginas de texto, como la de privacidad | `src/contenido/paginas/<página>.json` |
| Cabecera, pie y estructura de las páginas | `src/plantillas/` |
| Estilos | `src/estilos/sitio.css` |
| JavaScript (menú, fechas y medición) | `src/js/sitio.js` |
| Test sin siglas: banco aprobado y partidos del año | `src/contenido/juegos/banco-2023.json`, `src/contenido/juegos/partidos-2023.json` |
| Las 52 circunscripciones y sus otros nombres (para el buscador) | `src/contenido/circunscripciones.json` |
| Página del test | `test()` en `src/plantillas/paginas.mjs` |
| Recorrido del test, recuento, glosario e imagen para compartir | `src/js/juegos/` y `src/estilos/test.css` |
| Validación del banco al construir | `src/plantillas/juegos.mjs` |
| Partidos y temas: citas, resúmenes y fichas de 2026 | `src/contenido/partidos/partidos-2026.json`. No se edita a mano: sale de `datos/investigacion-2026/` con `scripts/investigacion/generar-web.mjs` (ver el README de esa carpeta) |
| Páginas de partidos y de temas | `src/plantillas/partidos.mjs` |
| Barra de saltos, buscador, vista y elección de partidos en esas páginas | `src/js/partidos.js` (sin JavaScript la página se lee entera con su índice) |
| Archivos que se copian tal cual (tipografías, `_headers`, favicon, imagen para compartir) | `src/estatico/` |
| Diseño de la imagen para compartir y del icono | `src/imagenes/og.html` |

### Formato de una guía

- `entradilla`: texto o lista de variantes con `desde` y `hasta` (AAAA-MM-DD, ambas incluidas).
- `esencial`: de 3 a 4 frases.
- `secciones`: cada sección lleva un `titulo` y una lista de `bloques`.
- Tipos de bloque:
  - `parrafo` (`texto`)
  - `lista` (`items`)
  - `pasos` (`items` con `titulo` y `texto`)
  - `aviso` (`titulo`, `texto`)
  - `caja` (`titulo`, `texto` o `items`)
  - `tabla` (`titulo`, `columnas`, `filas`)
  - `fechas` (`filas` con el `id` de `fechas.json`, que admite cambiar el `texto`, o con `inicio`, `fin` y `texto` propios)
- Cualquier bloque admite `desde` y `hasta` para mostrarse solo en esas fechas.
- En los textos se puede usar `**negrita**` y `[enlace](https://…)`.
- `pendiente`: notas internas. Se avisan al construir y van como comentario en el HTML, sin mostrarse.
- `portadaHasta` (opcional): último día en que la tarjeta de la guía sale en la portada.
- `borrador: true` (opcional): la guía no se publica ni se enlaza desde ninguna página.

### Formato de una fecha (`fechas.json`)

- `id`, `inicio` y, si dura varios días, `fin` (AAAA-MM-DD). `texto` y, si la hay, la `guia` que la explica.
- `paraVotante`: `true` si es algo que el votante tiene que hacer o puede hacer. Solo esas salen en la tarjeta «Próximo plazo» de la portada; todas salen en el calendario.
- `publico` (solo con `paraVotante`): `"todos"` o `"extranjero"`. El HTML de la tarjeta trae todos estos plazos (es lo que se ve sin JavaScript). Al abrir la página, `sitio.js` calcula el día en Madrid y deja arriba la próxima fecha de `"todos"` y debajo, en una línea, la próxima de `"extranjero"`; cuando ya no queda ninguna de `"todos"`, oculta la tarjeta.
- `fuentes` (opcional): lista de `texto` y `url` con la norma que fija la fecha. Se muestra debajo de la fecha.

Las páginas de texto (`src/contenido/paginas/`) llevan `ruta`, `titulo`, `tituloSeo`, `descripcion`, `entradilla`, `secciones` (como las guías), `actualizado` y, si hace falta, `pendiente`.

### El test sin siglas

- El banco aprobado no se toca a mano: sale de `datos/banco/` con `scripts/banco/`. Al construir se valida (campos, un solo partido por tarjeta, enlaces con `#page=`, partidos que existen y glosario que enlaza tarjetas que existen) y, si falla, la construcción se para con la lista de errores.
- Al navegador solo llega `public/test/banco-2023.json`, con temas, documentos, tarjetas y glosario. No lleva la revisión ni la aprobación.
- Los módulos de `src/js/juegos/*.mjs` se publican como `public/juegos/*.js` con la versión en los `import`, para que el navegador no mezcle versiones.
- `partidos-<año>.json`: `id`, `nombre` visible y `ambito` (`"estatal"` o la lista de circunscripciones donde se presentaba).
- Para pasar a 2026, la página toma el año y los archivos de `data-anio`, `data-banco` y `data-partidos`; en `scripts/construir.mjs` se cambia `ANIO_TEST`.
- El cálculo está en `src/js/juegos/motor.mjs` (funciones puras, probadas en `tests/motor.test.mjs` con el banco de ejemplo de `tests/ejemplo/`). La regla se explica en /metodo/.

