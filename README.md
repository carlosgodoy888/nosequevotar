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
