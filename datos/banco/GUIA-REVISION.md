# Guía para revisar las tarjetas del test

Gracias por ayudar. Vas a revisar tarjetas del test sin siglas. Cada tarjeta tiene:

- una **cita**: una frase copiada tal cual de un programa electoral de 2023;
- un **texto**: lo que leerá la gente en el test, escrito por nosotros a partir de la cita, sin decir de qué partido es.

Tu trabajo es comprobar que el texto dice lo mismo que la cita y que no delata al partido.

## Antes de empezar

- Tienes tu propio archivo: **REVISION-r1.csv** si eres el revisor 1 y **REVISION-r2.csv** si eres el revisor 2. Ábrelo con Excel o Numbers.
- **Trabaja solo.** No hables con el otro revisor ni mires su archivo hasta que los dos hayáis terminado. Si os ponéis de acuerdo antes, la revisión doble no sirve.
- No cambies ninguna columna salvo **fiel**, **neutral**, **delata** y **notas**. No borres filas ni cambies el orden.
- En fiel, neutral y delata escribe solo **si** o **no**.
- Tiempo: unos 2 o 3 minutos por tarjeta. Son 116 tarjetas: entre 4 y 6 horas en total. Mejor en varias sesiones cortas que en una larga.

## Cómo comprobar la cita

1. Copia el **enlace** de la fila y ábrelo en el navegador. Se abre el programa en PDF, en la página de la cita (si tu navegador no salta a la página, mira el número que va tras `#page=` en el enlace y ve a esa página).
2. Busca la cita en la página. A veces empieza al final de una página y sigue en la siguiente.
3. Si la cita no está, o está distinta, marca **fiel = no** y explícalo en notas.
4. Si la cita está en catalán o en gallego, tienes la traducción en la columna **traduccion**. Compara el texto con la cita original, ayudándote de la traducción.

## Qué significa cada columna

### fiel: ¿el texto dice lo mismo que la cita?

Marca **si** solo si se cumplen las cuatro cosas:

- **El mismo verbo.** Si la cita dice «estudiaremos», el texto no puede decir «crearemos». «Impulsar» no es «aprobar».
- **El mismo alcance.** Si la cita habla de «jóvenes menores de 35 años», el texto no puede decir «todas las personas».
- **Las mismas cifras y plazos.**
- **Nada añadido ni quitado** que cambie el sentido.

El texto recoge solo la medida. Por eso no incluye por qué la propone el partido ni qué consecuencias le atribuye. Si la cita junta varias medidas, el texto recoge solo la principal. Que falten esas partes no es un fallo. Marca **fiel = no** solo si lo que queda dice otra cosa que la cita.

Ejemplo inventado. Cita: «Estudiaremos una ayuda de 200 euros al mes para el alquiler de jóvenes menores de 30 años».

- Bien (**fiel = si**): «Estudiar una ayuda de 200 euros al mes para pagar el alquiler, dirigida a jóvenes menores de 30 años…»
- Mal (**fiel = no**): «Crear una ayuda de 200 euros al mes para pagar el alquiler de todos los jóvenes». Cambia el verbo («estudiar» pasa a «crear») y el alcance (se pierde «menores de 30 años»).

### neutral: ¿el texto está escrito sin opinar?

Marca **si** si el texto:

- no tiene palabras que valoran («justo», «abusivo», «por fin», «injusto», «histórico», «valiente»);
- no nombra partidos, líderes, eslóganes ni nombres de leyes asociados a un partido;
- no nombra el territorio propio del partido (por ejemplo «Galicia» en un programa gallego) cuando se podría decir de forma general.

Regla de territorio:

- Si el texto nombra un territorio concreto (por ejemplo La Palma, Cataluña o Euskadi), delata: marca **neutral = no**.
- Si dice «la comunidad autónoma» o «autonómico» sin nombrar ninguna, se permite. Es propio de los partidos de una sola comunidad, así que no lo marques como fallo.

Ejemplo inventado:

- Bien (**neutral = si**): «Bajar el impuesto sobre la electricidad del 10 % al 5 % para los hogares.»
- Mal (**neutral = no**): «Acabar con el abusivo impuesto sobre la electricidad y bajarlo por fin al 5 %.» Tiene dos palabras que valoran: «abusivo» y «por fin».

### delata: ¿se adivina el partido por la forma de escribirlo?

Marca **si** si crees que alguien que sigue la política adivinaría el partido **por una palabra o por el estilo**, no por lo que se propone. Que una propuesta sea típica de un partido no es «delatar»: eso es el contenido, y el test va de eso.

Ejemplo inventado:

- Bien (**delata = no**): «Reducir el número de alumnos por clase a un máximo de 20 en primaria.»
- Mal (**delata = si**): «Reducir la ratio a 20 para blindar la escuela de todos y todas frente a los recortes.» Expresiones como «blindar», «de todos y todas» o «recortes» suenan a un bloque concreto aunque la medida sea la misma.

## Qué escribir en notas

Corto y concreto. Por ejemplo:

- «Cita en p. 35, no en 34.»
- «Falta "menores de 30 años".»
- «"Agilizar" es más fuerte que "estudiar".»
- «"Blindar" suena a partido.»
- «No entiendo qué es "IPREM"; explicarlo.»

Si todo está bien, deja notas vacía.

## Cuando termines

Guarda el archivo **con el mismo nombre y en formato CSV** (en Excel: «CSV UTF-8 (delimitado por comas)»; en Numbers: Exportar a CSV con codificación Unicode UTF-8). Avisa a quien coordina el proyecto, que cruzará las dos revisiones.
