# Investigación de 2026: candidaturas, programas y posturas por tema

Datos de trabajo para las páginas de partidos y de temas y para el test con los programas de 2026. Nada de esta carpeta se publica: la web solo lee `src/contenido/`.

## Qué hay

| Archivo | Qué es | Cómo se genera |
| --- | --- | --- |
| `candidaturas-boe.json` | Las listas al Congreso de las 52 circunscripciones, tal como las publicó el BOE, con la corrección de errores aplicada | `node scripts/investigacion/leer-boe.mjs` |
| `resultados-2023.json` | Votos y escaños al Congreso de cada candidatura en julio de 2023, del BOE | `node scripts/investigacion/leer-resultados-2023.mjs` |
| `partidos.json` | Mapa de candidaturas: qué nombres del BOE forman cada una, miembros, relación con 2023, estado del programa, dudas y revisión | A mano. Es el único de esta tabla que se edita |
| `partidos.md` | Tabla de las candidaturas con sus listas proclamadas, los votos de 2023 que les corresponden y lo pendiente | `node scripts/investigacion/resumen-partidos.mjs` |
| `fuentes.json` | Registro de cada documento usado: dirección, fecha de consulta, huella SHA-256 y estado | A mano, al añadir una fuente |
| `_trabajo/` | Archivos intermedios, entre ellos el resultado completo de los agentes que investigaron y verificaron las candidaturas | — |

`candidaturas-boe.json`, `resultados-2023.json` y `partidos.md` no se editan a mano. Las circunscripciones y los votos de 2023 de cada candidatura no se escriben en `partidos.json`: los calcula `resumen-partidos.mjs`, que además se para si alguna lista del BOE queda sin asignar o asignada dos veces. Los documentos descargados están fuera del repositorio, en `../datos-nosequevotar/fuentes/descargas/` (variable `DATOS_DIR`).

## Criterios de recogida

Decididos por el responsable del proyecto el 10 de noviembre de 2026.

| Asunto | Criterio |
| --- | --- |
| Unidad | Una ficha por candidatura tal como aparece en la papeleta. Las marcas territoriales de la misma lista van juntas (PSC dentro de PSOE). Una coalición lista sus miembros |
| Cámara | Solo el Congreso |
| Alcance | 18 candidaturas: las 15 con más votos de 2023 (para las que proceden de Sumar cuentan los votos de aquella coalición), más Se Acabó La Fiesta, Democracia para el Siglo 21 y Frente Obrero. La lista está en `seleccion` de `partidos.json` |
| Programa | Cuenta como programa cualquier documento programático vigente del partido, también los generales que no son de estas elecciones. En cada fuente se indica cuál es (`clase`) y su fecha |
| Robots | No se descarga de forma automática lo que el `robots.txt` del sitio prohíbe a los agentes de IA. En ese caso lo descarga una persona y se anota |
| Datos | Un registro por cita (propuesta, declaración o voto), con partido, fuente, página, fecha y temas. El JSON es la única fuente; el Markdown de partidos y de temas se genera a partir de él |
| Temas | Se recoge cada propuesta con el apartado que le da su propio partido. Los temas comunes se normalizan después |
| Fuentes | Programas, documentos del partido, Congreso (Diario de Sesiones, iniciativas y votaciones), medios y redes oficiales. Siempre cita literal, fecha y enlace; nunca el resumen de un periodista |
| Periodo | Desde las generales de julio de 2023. Todo va fechado; en los resúmenes manda lo más reciente |
| Quién habla por un partido | Líder, cabezas de lista, portavoces nacionales y parlamentarios, y cuentas oficiales. En una coalición, lo que dice el líder de un partido miembro se atribuye a ese miembro |
| Postura ante un tema | Resumen neutro de 2 a 4 frases, cada una apoyada en citas. Sin etiquetas ideológicas ni valoraciones. Si no hay base suficiente, se dice |
| Sin programa | Se recogen sus declaraciones con medidas concretas, marcadas como «declaración, no programa». Si entran en el test se decide después |
| Copias | No se piden copias a Internet Archive. Copia local y SHA-256; se enlaza la dirección original o la copia que ya exista |
| Cambios | Cuando sale un programa o una versión nueva, lo anterior no se borra: se marca como «sustituida» y deja de salir en los documentos generados |

## De la fuente a la web

| Paso | Qué hace | Script |
| --- | --- | --- |
| 1 | Registrar el documento en `fuentes.json` (dirección, fecha, SHA-256) y extraer su texto por página | `extraer-texto.mjs <id>` |
| 2 | Extraer las citas por tramos de páginas (agentes) en `_trabajo/citas/<fuente>/` y verificarlas contra su página. Cada página tiene dos lecturas (`p-NNN.txt` y `p-NNN.raw.txt`): en páginas con recuadros o columnas, la normal intercala el recuadro en mitad de una frase y la segunda la deja seguida. Una cita vale si está seguida en cualquiera de las dos | `verificar-citas.mjs` |
| 3 | Unir los tramos en `citas/<partido>.json`. Las citas que desaparecen de una versión nueva pasan a «sustituida» | `unir-citas.mjs <partido>` |
| 3 bis | Declaraciones de partidos sin programa (agentes que recogen y agentes que abren cada fuente) | `unir-declaraciones.mjs <resultado.json>` |
| 4 | Cada cita va a los temas de sus etiquetas, según `temas.json` (se puede forzar con `temas_manual`) | `temas.mjs` comprueba que todas las etiquetas tienen tema |
| 5 | Resúmenes por partido y tema (agentes que redactan y agentes que verifican) en `resumenes.json` | `preparar-resumenes.mjs` prepara la entrada |
| 6 | Datos de la web: `src/contenido/partidos/partidos-2026.json`. Se para si un resumen cita algo que no existe | `generar-web.mjs` |
| 7 | Construir y comprobar la web | `node scripts/construir.mjs`, pruebas y `comprobar.mjs` |

Los Markdown por partido (`partidos/<partido>.md`) se generan con `generar-md.mjs`.

### Campos opcionales que cambian lo que se ve en la web

| Dónde | Campo | Para qué |
| --- | --- | --- |
| `fuentes.json` | `rotulo` | Cómo se llama el documento junto a cada cita («Programa de desregulación, página 73»). Sin él: «Programa», «Documento» o «Programa general», según la `clase` |
| `partidos.json`, en `programa.documentos` | `via` | De dónde sale la copia cuando no es la web del partido («copia publicada por El Independiente»). Se muestra en la ficha |
| Tramos de `_trabajo/citas/` | `contexto: true` | La cita es solo el nombre de una norma o un elemento de una lista («Ley 7/2021, de cambio climático…» bajo «Primeras leyes que derogaremos»). La web pone delante el título de su apartado |
| Tramos de `_trabajo/citas/` | `temas_manual` | Fuerza los temas de la cita, sin pasar por sus etiquetas |

Qué dice la web de cada partido depende de `programa.estado`: «publicado» no lleva aviso; «documento_parcial» y «programa_general» avisan de que no hay programa completo o de que no es de estas elecciones y enlazan el documento; el resto avisa de que solo hay declaraciones. Es la misma regla para todos.

Un documento programático de un partido sin programa (sectorial o general) se extrae entero, igual que un programa: se registra en `fuentes.json`, se cambia `programa.estado` y se siguen los pasos 1 a 7. Si la web del partido no deja descargarlo, vale la copia que publique un medio, comprobando en el texto que el documento es del partido y anotándolo en la `nota` de la fuente.

## Cómo se actualiza

- **El BOE corrige las candidaturas:** descarga el documento con `txt.php` a `DATOS_DIR/fuentes/descargas/boe/`, añádelo a `CORRECCIONES` en `leer-boe.mjs`, vuelve a ejecutar el script y registra la fuente en `fuentes.json`. El script avisa de cada corrección que no ha podido aplicar. Después ejecuta `resumen-partidos.mjs`: si aparece un nombre de lista nuevo, dirá cuál falta en `partidos.json`.
- **Cada día hasta las elecciones:** comprobar si las candidaturas con `programa.estado` «no_publicado» han publicado programa y si las demás han cambiado el suyo, y poner la fecha en `programa.comprobado`. Las webs de PSOE y Vox bloquean el acceso automático: las mira una persona.
- **Un partido publica su programa:** en su ficha de `partidos.json`, cambia `programa.estado`, añade el documento a `programa.documentos` y pon la fecha en `programa.comprobado`. Vuelve a ejecutar `resumen-partidos.mjs`. Después, los pasos 1 a 7 de la tabla de arriba para ese partido. Las declaraciones sueltas que salían de ese mismo documento pasan solas a «sustituida» al unir; las demás declaraciones se conservan.
- **Un partido vuelve a publicar el mismo programa con otra maquetación** (mismo texto, otras páginas): registra la edición nueva en `fuentes.json`, extrae su texto y ejecuta `cambiar-edicion.mjs <fuente-anterior> <fuente-nueva>`. Vuelve a localizar cada cita en la edición nueva, actualiza fuente y página, guarda la anterior en `edicion_anterior` y marca la fuente vieja como «sustituida». Si alguna cita no aparece, no cambia nada y dice cuáles: entonces el texto ha cambiado y hay que volver a extraer.
- **Ver el resultado sin publicar:** `node scripts/construir.mjs` y `node scripts/servir.mjs`; se abre en http://localhost:8787/.
- **La corrección del 7 de noviembre** incluye una enmienda a la lista de Comuns-Front Ampli por Tarragona que no coincide literalmente con el texto original; el script la marca como no aplicada. La enmienda siguiente del mismo documento sustituye la lista entera y deja el resultado correcto.
- **Reglas de descarga del BOE:** `txt.php`, nunca `xml.php` ni las páginas de búsqueda (lo prohíbe su `robots.txt`), y una petición por segundo como mucho.
