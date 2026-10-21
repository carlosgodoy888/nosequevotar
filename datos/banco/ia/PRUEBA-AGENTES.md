# Prueba de adivinar con agentes

Generado el 2026-10-21. Material: los 24 textos de PRUEBA-ADIVINAR.md, en un orden aleatorio distinto para cada agente. Ninguna tarjeta se ha cambiado.

## Límites

- Los agentes son modelos de lenguaje que conocen la política española. Aunque se les pidió razonar solo como cada persona, no pueden olvidar lo que saben: los perfiles «de calle» aciertan más de lo que acertaría una persona real con ese perfil.
- Los aciertos por contenido son esperables: el test compara propuestas, y algunas medidas son típicas de un partido. Lo que importa aquí son los aciertos por **redacción** y las valoraciones de favorable o desfavorable.
- Esto orienta, pero no sustituye a la revisión de dos personas (REVISION-r1.csv y REVISION-r2.csv) ni a la prueba de adivinar con 10 a 20 personas (PRUEBA-ADIVINAR.md).
- Aislamiento: cada agente recibió solo su material pegado en la instrucción, sin partido, solución, banco, selección, candidatas, informe ni CSV. No había agentes sin herramientas, así que se les ordenó no usar ninguna. Los 12 hicieron una sola llamada, la de entregar su respuesta, y cerraron con «Herramientas usadas: ninguna».
- Este archivo contiene la solución de la prueba de adivinar: no se enseña a quien vaya a hacerla.

## Resumen

| Perfil | Aciertos de 24 |
| --- | --- |
| 1. Izquierda transformadora | 15 |
| 2. Socialdemócrata | 16 |
| 3. Liberal de centro | 18 |
| 4. Conservador moderado | 15 |
| 5. Derecha nacional | 14 |
| 6. Nacionalista periférico | 15 |
| 7. Desconectado (68 años) | 16 |
| 8. Joven de redes (21 años) | 13 |
| 9. Analista experto (control) | 18 |

- Media de los perfiles 1 a 8: **15.3 de 24** (64 %). Experto: **18 de 24**. Azar con cuatro partidos: 6 de 24.
- De los 122 aciertos de los perfiles 1 a 8, **29 son por redacción** (24 %). En total, los perfiles 1 a 8 dijeron «redacción» 60 veces, acertaran o no.
- Textos que nadie de los perfiles 1 a 8 acierta: T12, T13, T20, T22. Textos que aciertan los 8: T2, T3, T4, T9, T14, T16, T17, T18, T19, T21, T23.

## Tabla por texto

Valoración de la redacción por perfil, del 1 al 9: f = favorable, n = neutra, d = desfavorable. «Por redacción» cuenta los aciertos de los perfiles 1 a 8 que dieron ese motivo; las palabras incluyen las de todos los perfiles que dijeron «redacción».

| Texto | Tarjeta | Partido | Aciertos | Sin experto | Por redacción | Palabras que delatan | Valoración 1-9 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T1 | t2023-empleo-pp-1 | PP | 7/9 | 6/8 | 6 | involucrando a sindicatos, empresarios y personas expertas · involucrando a sindicatos, empresarios y personas expertas en las decisiones · en el marco del diálogo social, involucrando a sindicatos, empresarios y personas expertas | n n n n f n n f n |
| T2 | t2023-impuestos-vox-1 | Vox | 9/9 | 8/8 | 0 | — | n n n n n n n n n |
| T3 | t2023-inmigracion-sumar-1 | Sumar | 9/9 | 8/8 | 4 | Castigar como delito la devolución sumaria | n d d d d d d n n |
| T4 | t2023-vivienda-sumar-1 | Sumar | 9/9 | 8/8 | 0 | — | n n n n n n n n n |
| T5 | t2023-pensiones-pp-1 | PP | 3/9 | 2/8 | 2 | en el marco del Pacto de Toledo | n f n n n n n n n |
| T6 | t2023-vivienda-pp-1 | PP | 4/9 | 3/8 | 0 | — | n n n f n n n n n |
| T7 | t2023-sanidad-vox-1 | Vox | 2/9 | 2/8 | 1 | reforzar los conciertos con la sanidad privada | f f f f f f n n n |
| T8 | t2023-vivienda-vox-1 | Vox | 8/9 | 7/8 | 0 | — | n n n n n n n n n |
| T9 | t2023-impuestos-pp-1 | PP | 9/9 | 8/8 | 0 | — | n n n n n n n n n |
| T10 | t2023-empleo-psoe-1 | PSOE | 2/9 | 1/8 | 0 | — | n n n n n n n n n |
| T11 | t2023-sanidad-pp-1 | PP | 6/9 | 5/8 | 2 | plan de choque | n n n n n n n n n |
| T12 | t2023-impuestos-psoe-1 | PSOE | 0/9 | 0/8 | 0 | — | n n n f n n n n n |
| T13 | t2023-inmigracion-psoe-1 | PSOE | 0/9 | 0/8 | 0 | desmantelar las mafias que trafican con seres humanos en los países de origen · desmantelar las mafias que trafican con seres humanos | f n n n n n n n n |
| T14 | t2023-empleo-sumar-1 | Sumar | 9/9 | 8/8 | 0 | — | n f n f f n f n n |
| T15 | t2023-sanidad-psoe-1 | PSOE | 1/9 | 1/8 | 0 | — | n n n n n n n n n |
| T16 | t2023-pensiones-sumar-1 | Sumar | 9/9 | 8/8 | 1 | hasta llegar, al menos, al umbral de la pobreza | f f n f f n f n n |
| T17 | t2023-pensiones-vox-1 | Vox | 9/9 | 8/8 | 0 | — | n n n f n n f n n |
| T18 | t2023-empleo-vox-1 | Vox | 9/9 | 8/8 | 8 | reduciendo de forma drástica las cargas y la regulación sobre las empresas · reduciendo de forma drástica las cargas y la regulación | f f f f f f f f f |
| T19 | t2023-impuestos-sumar-1 | Sumar | 9/9 | 8/8 | 0 | — | n n n n n n n n n |
| T20 | t2023-pensiones-psoe-1 | PSOE | 0/9 | 0/8 | 0 | en cualquier circunstancia · Reformar la Constitución, en cualquier circunstancia · Reformar la Constitución para garantizar ... en cualquier circunstancia | f f f f f f f f n |
| T21 | t2023-vivienda-psoe-1 | PSOE | 9/9 | 8/8 | 0 | — | n n n n n n f n n |
| T22 | t2023-sanidad-sumar-1 | Sumar | 0/9 | 0/8 | 0 | registro homogéneo, transparente y fiable · homogéneo, transparente y fiable | n n n n f n f f n |
| T23 | t2023-inmigracion-vox-1 | Vox | 9/9 | 8/8 | 3 | Expulsar de forma inmediata a todas las personas inmigrantes | n n n n n n d n n |
| T24 | t2023-inmigracion-pp-1 | PP | 8/9 | 7/8 | 2 | impulsar la implantación de los nuevos sistemas europeos de control fronterizo · nuevos sistemas europeos de control fronterizo | n n n n n n n n n |

## Textos a revisar (de más a menos grave)

Criterios: aciertan la mitad o más de los perfiles 1 a 8 y al menos 2 lo hacen por redacción; o al menos un perfil de 1-2 y otro de 4-5 coinciden en que la redacción es favorable o desfavorable. Todas las propuestas cumplen las reglas del banco (de 15 a 40 palabras, frases de 25 o menos, verbo de la medida al principio, cifras y siglas) y mantienen el equilibrio de su tema.

1. **T18 · t2023-empleo-vox-1** (Vox). acierta 8 de 8 y 8 por redacción; perfiles de sensibilidades opuestas la ven favorable.
   - Texto actual (24 palabras): Impulsar la subida de todos los salarios, sobre todo los más bajos, reduciendo de forma drástica las cargas y la regulación sobre las empresas.
   - Motivo: Los 8 perfiles aciertan y los 8 lo atribuyen a la redacción; los 9 la ven favorable. La pista es «reduciendo de forma drástica las cargas y la regulación»: «drástica» es la fuerza de la cita («drásticamente»), pero el gerundio presenta la rebaja como el medio natural de subir sueldos. La propuesta separa las dos acciones y usa «en gran medida». La rebaja de cargas sigue siendo contenido y seguirá orientando.
   - Propuesta: Impulsar la subida de todos los salarios, sobre todo los más bajos, y reducir en gran medida las cargas y las normas para las empresas. (25 palabras)
2. **T3 · t2023-inmigracion-sumar-1** (Sumar). acierta 8 de 8 y 4 por redacción; perfiles de sensibilidades opuestas la ven desfavorable.
   - Texto actual (22 palabras): Castigar como delito la devolución sumaria en la frontera y eliminar la disposición de la ley de extranjería que permite esta práctica.
   - Motivo: 8 de 8 aciertan, 4 por redacción; 6 perfiles, de los dos lados, la ven desfavorable. «Castigar como delito» suena punitivo. La cita dice «tipificaremos el delito»: «convertir en delito» mantiene la fuerza sin ese tono.
   - Propuesta: Convertir en delito la devolución sumaria en la frontera y suprimir la disposición de la ley de extranjería que permite esta práctica. (22 palabras)
3. **T1 · t2023-empleo-pp-1** (PP). acierta 6 de 8 y 6 por redacción.
   - Texto actual (22 palabras): Actualizar el salario mínimo interprofesional (SMI) en el marco del diálogo social, involucrando a sindicatos, empresarios y personas expertas en las decisiones.
   - Motivo: 6 de 8 aciertan, los 6 por redacción: «involucrando a sindicatos, empresarios y personas expertas». La pista es el mecanismo de la cita (diálogo social y expertos), que es contenido. La propuesta suaviza el gerundio, pero es probable que siga orientando; la alternativa es la reserva (tarifa 0 para autónomos, fuera de eje).
   - Propuesta: Actualizar el salario mínimo interprofesional (SMI) dentro del diálogo social, con sindicatos, empresarios y expertos participando en las decisiones sobre el SMI. (22 palabras)
4. **T23 · t2023-inmigracion-vox-1** (Vox). acierta 8 de 8 y 3 por redacción.
   - Texto actual (16 palabras): Expulsar de forma inmediata a todas las personas inmigrantes que entren de forma irregular en España.
   - Motivo: 8 de 8 aciertan, 3 por redacción: «Expulsar de forma inmediata a todas las personas inmigrantes». Es la medida misma; la propuesta cambia el arranque («sin demora», «cualquier persona»), pero el acierto es sobre todo por contenido. Con 15 palabras queda dentro del equilibrio del tema (15 a 25).
   - Propuesta: Expulsar sin demora a cualquier persona inmigrante que haya entrado en España de forma irregular. (15 palabras)
5. **T24 · t2023-inmigracion-pp-1** (PP). acierta 7 de 8 y 2 por redacción.
   - Texto actual (24 palabras): Reforzar la inspección en las fronteras con más personal y mejor formado, e impulsar la implantación de los nuevos sistemas europeos de control fronterizo.
   - Motivo: 7 de 8 aciertan, 2 por redacción: «impulsar la implantación de los nuevos sistemas europeos de control fronterizo», que suena a lenguaje de gestión. La propuesta usa palabras llanas: «registros europeos de entradas y salidas».
   - Propuesta: Reforzar la inspección en las fronteras con más personal y mejor formado. También impulsar los nuevos registros europeos de entradas y salidas de viajeros. (24 palabras)
6. **T11 · t2023-sanidad-pp-1** (PP). acierta 5 de 8 y 2 por redacción.
   - Texto actual (18 palabras): Promover un plan de choque en atención primaria para resolver la falta de especialistas en ese nivel asistencial.
   - Motivo: 5 de 8 aciertan, 2 por redacción: «plan de choque», expresión de campaña. La propuesta usa «plan urgente».
   - Propuesta: Promover un plan urgente en atención primaria para resolver la falta de especialistas en ese nivel asistencial. (17 palabras)
7. **T20 · t2023-pensiones-psoe-1** (PSOE). perfiles de sensibilidades opuestas la ven favorable.
   - Texto actual (24 palabras): Reformar la Constitución para garantizar que todas las pensiones mantengan su poder adquisitivo según el índice de precios de consumo (IPC), en cualquier circunstancia.
   - Motivo: Nadie acierta el partido, pero 8 de 9 perfiles, de los dos lados, ven la redacción favorable por «en cualquier circunstancia» y «Reformar la Constitución». La propuesta quita la coletilla y dice lo mismo con «siempre».
   - Propuesta: Reformar la Constitución para que todas las pensiones se revaloricen siempre según el índice de precios de consumo (IPC). (19 palabras)
8. **T7 · t2023-sanidad-vox-1** (Vox). perfiles de sensibilidades opuestas la ven favorable.
   - Texto actual (28 palabras): Reducir las listas de espera en volumen y tiempo en todos los ámbitos. Para ello, incentivar a los centros públicos y reforzar los conciertos con la sanidad privada.
   - Motivo: Solo 2 aciertan, pero los perfiles 1 a 6 la ven favorable: «Para ello» presenta los conciertos con la privada como la solución. La propuesta lo pone como una sola frase descriptiva.
   - Propuesta: Reducir las listas de espera en volumen y tiempo en todos los ámbitos, con incentivos a los centros públicos y más conciertos con centros privados. (25 palabras)
9. **T16 · t2023-pensiones-sumar-1** (Sumar). perfiles de sensibilidades opuestas la ven favorable.
   - Texto actual (25 palabras): Subir las pensiones mínimas y no contributivas por encima del índice de precios de consumo (IPC) hasta llegar, al menos, al umbral de la pobreza.
   - Motivo: Los 8 aciertan por contenido; 5 perfiles (entre ellos el 2 y los 4 y 5) la ven favorable, sobre todo por «hasta llegar, al menos, al umbral de la pobreza». La expresión está en la cita y es el objetivo con destinatarios. No propongo cambio: cualquier versión más literal pasa de 25 palabras y rompe el equilibrio del tema. Se deja para la revisión humana.
   - Propuesta: sin cambio (ver motivo).
10. **T14 · t2023-empleo-sumar-1** (Sumar). perfiles de sensibilidades opuestas la ven favorable.
   - Texto actual (26 palabras): Fijar por ley en 2024 una jornada máxima de 37,5 horas sin bajar el salario. Después, abrir un diálogo social para reducirla hasta 32 horas semanales.
   - Motivo: Los 8 aciertan por contenido y ninguno señala palabras; 4 perfiles (el 2, el 4, el 5 y el 7) la ven favorable. Lo más probable es que valoren la medida (menos horas con el mismo sueldo) y no la redacción. «Sin bajar el salario» es la cita («sin reducción de salario»). No propongo cambio; se deja para la revisión humana y la prueba con personas.
   - Propuesta: sin cambio (ver motivo).

## Respuestas completas

### 1. Izquierda transformadora

| Texto | Cree | Seguridad | Motivo | Palabras | Valoración | ¿Acierta? |
| --- | --- | --- | --- | --- | --- | --- |
| T1 | PP | 3 | redacción | «involucrando a sindicatos, empresarios y personas expertas» | neutra | sí |
| T2 | Vox | 5 | contenido | — | neutra | sí |
| T3 | Sumar | 5 | redacción | «Castigar como delito la devolución sumaria» | neutra | sí |
| T4 | Sumar | 4 | contenido | — | neutra | sí |
| T5 | PSOE | 3 | redacción | «en el marco del Pacto de Toledo» | neutra | no |
| T6 | PSOE | 3 | contenido | — | neutra | no |
| T7 | PP | 4 | contenido | — | favorable | no |
| T8 | Vox | 4 | contenido | — | neutra | sí |
| T9 | PP | 4 | contenido | — | neutra | sí |
| T10 | Sumar | 3 | contenido | — | neutra | no |
| T11 | PP | 2 | redacción | «plan de choque» | neutra | sí |
| T12 | PP | 3 | contenido | — | neutra | no |
| T13 | PP | 3 | redacción | «desmantelar las mafias que trafican con seres humanos en los países de origen» | favorable | no |
| T14 | Sumar | 5 | contenido | — | neutra | sí |
| T15 | PP | 2 | contenido | — | neutra | no |
| T16 | Sumar | 3 | contenido | — | favorable | sí |
| T17 | Vox | 3 | contenido | — | neutra | sí |
| T18 | Vox | 4 | redacción | «reduciendo de forma drástica las cargas y la regulación sobre las empresas» | favorable | sí |
| T19 | Sumar | 4 | contenido | — | neutra | sí |
| T20 | Vox | 3 | redacción | «en cualquier circunstancia» | favorable | no |
| T21 | PSOE | 4 | contenido | — | neutra | sí |
| T22 | PSOE | 2 | redacción | «registro homogéneo, transparente y fiable» | neutra | no |
| T23 | Vox | 5 | redacción | «Expulsar de forma inmediata a todas las personas inmigrantes» | neutra | sí |
| T24 | PP | 3 | contenido | — | neutra | sí |

### 2. Socialdemócrata

| Texto | Cree | Seguridad | Motivo | Palabras | Valoración | ¿Acierta? |
| --- | --- | --- | --- | --- | --- | --- |
| T1 | PP | 3 | redacción | «involucrando a sindicatos, empresarios y personas expertas» | neutra | sí |
| T2 | Vox | 4 | contenido | — | neutra | sí |
| T3 | Sumar | 5 | contenido | — | desfavorable | sí |
| T4 | Sumar | 4 | contenido | — | neutra | sí |
| T5 | PSOE | 3 | redacción | «en el marco del Pacto de Toledo» | favorable | no |
| T6 | PP | 3 | contenido | — | neutra | sí |
| T7 | PP | 4 | contenido | — | favorable | no |
| T8 | Vox | 4 | contenido | — | neutra | sí |
| T9 | PP | 4 | contenido | — | neutra | sí |
| T10 | Sumar | 3 | contenido | — | neutra | no |
| T11 | PP | 2 | contenido | — | neutra | sí |
| T12 | PP | 3 | contenido | — | neutra | no |
| T13 | PP | 2 | contenido | — | neutra | no |
| T14 | Sumar | 5 | contenido | — | favorable | sí |
| T15 | Sumar | 2 | contenido | — | neutra | no |
| T16 | Sumar | 3 | contenido | — | favorable | sí |
| T17 | Vox | 3 | contenido | — | neutra | sí |
| T18 | Vox | 4 | redacción | «reduciendo de forma drástica las cargas y la regulación» | favorable | sí |
| T19 | Sumar | 5 | contenido | — | neutra | sí |
| T20 | Vox | 2 | redacción | «en cualquier circunstancia» | favorable | no |
| T21 | PSOE | 4 | contenido | — | neutra | sí |
| T22 | PP | 3 | redacción | «registro homogéneo, transparente y fiable» | neutra | no |
| T23 | Vox | 5 | contenido | — | neutra | sí |
| T24 | PP | 3 | contenido | — | neutra | sí |

### 3. Liberal de centro

| Texto | Cree | Seguridad | Motivo | Palabras | Valoración | ¿Acierta? |
| --- | --- | --- | --- | --- | --- | --- |
| T1 | PP | 3 | redacción | «involucrando a sindicatos, empresarios y personas expertas en las decisiones» | neutra | sí |
| T2 | Vox | 4 | contenido | — | neutra | sí |
| T3 | Sumar | 5 | redacción | «Castigar como delito la devolución sumaria» | desfavorable | sí |
| T4 | Sumar | 4 | contenido | — | neutra | sí |
| T5 | PP | 3 | redacción | «en el marco del Pacto de Toledo» | neutra | sí |
| T6 | PP | 3 | contenido | — | neutra | sí |
| T7 | Vox | 2 | redacción | «reforzar los conciertos con la sanidad privada» | favorable | sí |
| T8 | Vox | 3 | contenido | — | neutra | sí |
| T9 | PP | 4 | contenido | — | neutra | sí |
| T10 | PSOE | 4 | contenido | — | neutra | sí |
| T11 | PP | 2 | contenido | — | neutra | sí |
| T12 | PP | 3 | contenido | — | neutra | no |
| T13 | PP | 3 | redacción | «desmantelar las mafias que trafican con seres humanos en los países de origen» | neutra | no |
| T14 | Sumar | 5 | contenido | — | neutra | sí |
| T15 | Sumar | 2 | contenido | — | neutra | no |
| T16 | Sumar | 4 | contenido | — | neutra | sí |
| T17 | Vox | 2 | contenido | — | neutra | sí |
| T18 | Vox | 3 | redacción | «reduciendo de forma drástica las cargas y la regulación» | favorable | sí |
| T19 | Sumar | 5 | contenido | — | neutra | sí |
| T20 | Vox | 3 | redacción | «Reformar la Constitución», «en cualquier circunstancia» | favorable | no |
| T21 | PSOE | 4 | contenido | — | neutra | sí |
| T22 | PSOE | 2 | redacción | «registro homogéneo, transparente y fiable» | neutra | no |
| T23 | Vox | 5 | redacción | «Expulsar de forma inmediata a todas las personas inmigrantes» | neutra | sí |
| T24 | PSOE | 3 | redacción | «impulsar la implantación de los nuevos sistemas europeos de control fronterizo» | neutra | no |

### 4. Conservador moderado

| Texto | Cree | Seguridad | Motivo | Palabras | Valoración | ¿Acierta? |
| --- | --- | --- | --- | --- | --- | --- |
| T1 | PP | 3 | redacción | «involucrando a sindicatos, empresarios y personas expertas» | neutra | sí |
| T2 | Vox | 4 | contenido | — | neutra | sí |
| T3 | Sumar | 5 | redacción | «Castigar como delito la devolución sumaria» | desfavorable | sí |
| T4 | Sumar | 4 | contenido | — | neutra | sí |
| T5 | PSOE | 3 | redacción | «en el marco del Pacto de Toledo» | neutra | no |
| T6 | PSOE | 3 | contenido | — | favorable | no |
| T7 | Vox | 3 | contenido | — | favorable | sí |
| T8 | PP | 3 | contenido | — | neutra | no |
| T9 | PP | 4 | contenido | — | neutra | sí |
| T10 | Sumar | 4 | contenido | — | neutra | no |
| T11 | PP | 2 | redacción | «plan de choque» | neutra | sí |
| T12 | PP | 3 | contenido | — | favorable | no |
| T13 | PP | 3 | contenido | — | neutra | no |
| T14 | Sumar | 5 | contenido | — | favorable | sí |
| T15 | PP | 2 | contenido | — | neutra | no |
| T16 | Sumar | 3 | contenido | — | favorable | sí |
| T17 | Vox | 3 | contenido | — | favorable | sí |
| T18 | Vox | 4 | redacción | «reduciendo de forma drástica las cargas y la regulación» | favorable | sí |
| T19 | Sumar | 5 | contenido | — | neutra | sí |
| T20 | Sumar | 2 | redacción | «en cualquier circunstancia» | favorable | no |
| T21 | PSOE | 4 | contenido | — | neutra | sí |
| T22 | PSOE | 2 | redacción | «registro homogéneo, transparente y fiable» | neutra | no |
| T23 | Vox | 5 | redacción | «Expulsar de forma inmediata a todas las personas inmigrantes» | neutra | sí |
| T24 | PP | 3 | contenido | — | neutra | sí |

### 5. Derecha nacional

| Texto | Cree | Seguridad | Motivo | Palabras | Valoración | ¿Acierta? |
| --- | --- | --- | --- | --- | --- | --- |
| T1 | PSOE | 3 | redacción | «en el marco del diálogo social, involucrando a sindicatos, empresarios y personas expertas» | favorable | no |
| T2 | Vox | 4 | contenido | — | neutra | sí |
| T3 | Sumar | 5 | contenido | — | desfavorable | sí |
| T4 | Sumar | 4 | contenido | — | neutra | sí |
| T5 | PSOE | 3 | redacción | «en el marco del Pacto de Toledo» | neutra | no |
| T6 | PSOE | 3 | contenido | — | neutra | no |
| T7 | PP | 4 | contenido | — | favorable | no |
| T8 | Vox | 4 | contenido | — | neutra | sí |
| T9 | PP | 4 | contenido | — | neutra | sí |
| T10 | Sumar | 3 | contenido | — | neutra | no |
| T11 | PP | 2 | contenido | — | neutra | sí |
| T12 | PP | 3 | contenido | — | neutra | no |
| T13 | PP | 3 | contenido | — | neutra | no |
| T14 | Sumar | 5 | contenido | — | favorable | sí |
| T15 | PP | 3 | contenido | — | neutra | no |
| T16 | Sumar | 3 | redacción | «hasta llegar, al menos, al umbral de la pobreza» | favorable | sí |
| T17 | Vox | 4 | contenido | — | neutra | sí |
| T18 | Vox | 4 | redacción | «reduciendo de forma drástica las cargas y la regulación sobre las empresas» | favorable | sí |
| T19 | Sumar | 4 | contenido | — | neutra | sí |
| T20 | Sumar | 3 | redacción | «en cualquier circunstancia» | favorable | no |
| T21 | PSOE | 4 | contenido | — | neutra | sí |
| T22 | PSOE | 2 | redacción | «registro homogéneo, transparente y fiable» | favorable | no |
| T23 | Vox | 5 | contenido | — | neutra | sí |
| T24 | PP | 4 | redacción | «impulsar la implantación de los nuevos sistemas europeos de control fronterizo» | neutra | sí |

### 6. Nacionalista periférico

| Texto | Cree | Seguridad | Motivo | Palabras | Valoración | ¿Acierta? |
| --- | --- | --- | --- | --- | --- | --- |
| T1 | PP | 3 | redacción | «en el marco del diálogo social, involucrando a sindicatos, empresarios y personas expertas» | neutra | sí |
| T2 | Vox | 4 | contenido | — | neutra | sí |
| T3 | Sumar | 5 | redacción | «Castigar como delito la devolución sumaria» | desfavorable | sí |
| T4 | Sumar | 4 | contenido | — | neutra | sí |
| T5 | PP | 3 | redacción | «en el marco del Pacto de Toledo» | neutra | sí |
| T6 | PSOE | 4 | contenido | — | neutra | no |
| T7 | PP | 4 | redacción | «reforzar los conciertos con la sanidad privada» | favorable | no |
| T8 | Vox | 3 | contenido | — | neutra | sí |
| T9 | PP | 4 | contenido | — | neutra | sí |
| T10 | Sumar | 4 | contenido | — | neutra | no |
| T11 | PSOE | 2 | redacción | «plan de choque» | neutra | no |
| T12 | PP | 3 | contenido | — | neutra | no |
| T13 | PP | 3 | redacción | «desmantelar las mafias que trafican con seres humanos» | neutra | no |
| T14 | Sumar | 5 | contenido | — | neutra | sí |
| T15 | PP | 3 | contenido | — | neutra | no |
| T16 | Sumar | 4 | contenido | — | neutra | sí |
| T17 | Vox | 3 | contenido | — | neutra | sí |
| T18 | Vox | 4 | redacción | «reduciendo de forma drástica las cargas y la regulación» | favorable | sí |
| T19 | Sumar | 5 | contenido | — | neutra | sí |
| T20 | Vox | 3 | redacción | «en cualquier circunstancia» | favorable | no |
| T21 | PSOE | 4 | contenido | — | neutra | sí |
| T22 | PSOE | 3 | contenido | — | neutra | no |
| T23 | Vox | 5 | contenido | — | neutra | sí |
| T24 | PP | 3 | redacción | «nuevos sistemas europeos de control fronterizo» | neutra | sí |

### 7. Desconectado (68 años)

| Texto | Cree | Seguridad | Motivo | Palabras | Valoración | ¿Acierta? |
| --- | --- | --- | --- | --- | --- | --- |
| T1 | PP | 3 | redacción | «involucrando a sindicatos, empresarios y personas expertas» | neutra | sí |
| T2 | Vox | 2 | contenido | — | neutra | sí |
| T3 | Sumar | 3 | contenido | — | desfavorable | sí |
| T4 | Sumar | 2 | contenido | — | neutra | sí |
| T5 | PSOE | 3 | redacción | «en el marco del Pacto de Toledo» | neutra | no |
| T6 | PP | 2 | contenido | — | neutra | sí |
| T7 | PP | 4 | contenido | — | neutra | no |
| T8 | Vox | 2 | contenido | — | neutra | sí |
| T9 | PP | 3 | contenido | — | neutra | sí |
| T10 | Sumar | 2 | contenido | — | neutra | no |
| T11 | no sé | 1 | contenido | — | neutra | no |
| T12 | PP | 2 | contenido | — | neutra | no |
| T13 | PP | 2 | contenido | — | neutra | no |
| T14 | Sumar | 4 | contenido | — | favorable | sí |
| T15 | PSOE | 2 | contenido | — | neutra | sí |
| T16 | Sumar | 3 | contenido | — | favorable | sí |
| T17 | Vox | 2 | contenido | — | favorable | sí |
| T18 | Vox | 3 | redacción | «reduciendo de forma drástica las cargas y la regulación» | favorable | sí |
| T19 | Sumar | 3 | contenido | — | neutra | sí |
| T20 | Vox | 2 | redacción | «en cualquier circunstancia» | favorable | no |
| T21 | PSOE | 3 | contenido | — | favorable | sí |
| T22 | PP | 2 | redacción | «homogéneo, transparente y fiable» | favorable | no |
| T23 | Vox | 5 | contenido | — | desfavorable | sí |
| T24 | PP | 2 | contenido | — | neutra | sí |

### 8. Joven de redes (21 años)

| Texto | Cree | Seguridad | Motivo | Palabras | Valoración | ¿Acierta? |
| --- | --- | --- | --- | --- | --- | --- |
| T1 | PSOE | 3 | redacción | en el marco del diálogo social, involucrando a sindicatos, empresarios y personas expertas | favorable | no |
| T2 | Vox | 4 | contenido | — | neutra | sí |
| T3 | Sumar | 4 | contenido | — | neutra | sí |
| T4 | Sumar | 3 | contenido | — | neutra | sí |
| T5 | PSOE | 2 | redacción | en el marco del Pacto de Toledo | neutra | no |
| T6 | PSOE | 3 | contenido | — | neutra | no |
| T7 | PP | 4 | contenido | — | neutra | no |
| T8 | Vox | 3 | contenido | — | neutra | sí |
| T9 | PP | 3 | contenido | — | neutra | sí |
| T10 | Sumar | 3 | contenido | — | neutra | no |
| T11 | PSOE | 2 | redacción | plan de choque | neutra | no |
| T12 | PP | 3 | contenido | — | neutra | no |
| T13 | PP | 3 | redacción | desmantelar las mafias que trafican con seres humanos | neutra | no |
| T14 | Sumar | 5 | contenido | — | neutra | sí |
| T15 | PP | 2 | contenido | — | neutra | no |
| T16 | Sumar | 3 | contenido | — | neutra | sí |
| T17 | Vox | 3 | contenido | — | neutra | sí |
| T18 | Vox | 4 | redacción | reduciendo de forma drástica las cargas y la regulación sobre las empresas | favorable | sí |
| T19 | Sumar | 4 | contenido | — | neutra | sí |
| T20 | Vox | 2 | redacción | Reformar la Constitución para garantizar ... en cualquier circunstancia | favorable | no |
| T21 | PSOE | 4 | contenido | — | neutra | sí |
| T22 | PSOE | 2 | redacción | registro homogéneo, transparente y fiable | favorable | no |
| T23 | Vox | 5 | contenido | — | neutra | sí |
| T24 | PP | 3 | contenido | — | neutra | sí |

### 9. Analista experto (control)

| Texto | Cree | Seguridad | Motivo | Palabras | Valoración | ¿Acierta? |
| --- | --- | --- | --- | --- | --- | --- |
| T1 | PP | 4 | contenido | — | neutra | sí |
| T2 | Vox | 5 | contenido | — | neutra | sí |
| T3 | Sumar | 5 | contenido | — | neutra | sí |
| T4 | Sumar | 4 | contenido | — | neutra | sí |
| T5 | PP | 4 | redacción | «en el marco del Pacto de Toledo» | neutra | sí |
| T6 | PP | 3 | contenido | — | neutra | sí |
| T7 | PP | 4 | contenido | — | neutra | no |
| T8 | Vox | 3 | contenido | — | neutra | sí |
| T9 | PP | 4 | contenido | — | neutra | sí |
| T10 | PSOE | 3 | contenido | — | neutra | sí |
| T11 | PP | 3 | contenido | — | neutra | sí |
| T12 | PP | 3 | contenido | — | neutra | no |
| T13 | PP | 3 | contenido | — | neutra | no |
| T14 | Sumar | 5 | contenido | — | neutra | sí |
| T15 | Sumar | 2 | contenido | — | neutra | no |
| T16 | Sumar | 2 | contenido | — | neutra | sí |
| T17 | Vox | 2 | contenido | — | neutra | sí |
| T18 | Vox | 4 | redacción | «reduciendo de forma drástica las cargas y la regulación sobre las empresas» | favorable | sí |
| T19 | Sumar | 5 | contenido | — | neutra | sí |
| T20 | Sumar | 3 | contenido | — | neutra | no |
| T21 | PSOE | 5 | contenido | — | neutra | sí |
| T22 | Vox | 2 | contenido | — | neutra | no |
| T23 | Vox | 5 | contenido | — | neutra | sí |
| T24 | PP | 3 | contenido | — | neutra | sí |

## Decisiones

Decididas por el responsable del proyecto y aplicadas en seleccion.json. El registro está en el INFORME, sección 6, «Tercera pasada».

**Aplicadas**
- T18 (t2023-empleo-vox-1): se usa la propuesta. En la cita son dos medidas en dos frases: la rebaja de cargas no es el medio para subir los sueldos, sino para no destruir empleo («Para que ello no conlleve una destrucción de empleo, reduciremos…»). Por eso no se usa «mediante».
- T3 (t2023-inmigracion-sumar-1): «Convertir en delito…».
- T1 (t2023-empleo-pp-1): redacción del responsable: «… dentro del diálogo social, con participación de sindicatos, empresarios y expertos». No se usa la reserva: la pista es el contenido.
- T24 (t2023-inmigracion-pp-1): se usa la propuesta. Se anota que se omiten la autorización de viaje y Frontex.
- T11 (t2023-sanidad-pp-1): redacción del responsable: «Promover un plan urgente en los centros de salud para resolver la falta de especialistas en atención primaria».
- T20 (t2023-pensiones-psoe-1): se usa la propuesta («… se revaloricen siempre según el IPC»).
- T7 (t2023-sanidad-vox-1): se usa la propuesta.

**No aplicadas**
- T23 (t2023-inmigracion-vox-1): sin cambios. Lo que delata es la medida.
- T16 (t2023-pensiones-sumar-1) y T14 (t2023-empleo-sumar-1): sin cambios. La valoración favorable parece venir de la medida, no de la redacción.
