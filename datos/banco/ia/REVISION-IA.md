# Revisión de neutralidad y fidelidad con agentes

Generado el 2026-10-21. Material: las 116 tarjetas, cada una con un código neutro (C001…C116, en orden aleatorio), cita, traducción y texto, sin partido. En cuatro citas el nombre de un partido se sustituyó por «[partido]». Ninguna tarjeta se ha cambiado.

Revisores: **A**, editor de agencia con libro de estilo neutral; **B**, sensibilidad progresista que busca sesgos a favor de la derecha; **C**, sensibilidad conservadora que busca sesgos a favor de la izquierda.

## Límites

- Los agentes son modelos de lenguaje que conocen la política española. Aunque se les pidió razonar solo como cada persona, no pueden olvidar lo que saben: los perfiles «de calle» aciertan más de lo que acertaría una persona real con ese perfil.
- Los aciertos por contenido son esperables: el test compara propuestas, y algunas medidas son típicas de un partido. Lo que importa aquí son los aciertos por **redacción** y las valoraciones de favorable o desfavorable.
- Esto orienta, pero no sustituye a la revisión de dos personas (REVISION-r1.csv y REVISION-r2.csv) ni a la prueba de adivinar con 10 a 20 personas (PRUEBA-ADIVINAR.md).
- Aislamiento: cada agente recibió solo su material pegado en la instrucción, sin partido, solución, banco, selección, candidatas, informe ni CSV. No había agentes sin herramientas, así que se les ordenó no usar ninguna. Los 12 hicieron una sola llamada, la de entregar su respuesta, y cerraron con «Herramientas usadas: ninguna».
- Las citas conservan el territorio cuando lo nombran (Canarias, Cataluña, Gobierno Vasco…) y algunas están en catalán o gallego: eso señala a un partido aunque no se dé su nombre. Se dejó así porque los revisores necesitan la cita entera para juzgar la fidelidad.
- Los revisores recibieron los criterios del banco (solo la medida, una medida por tarjeta, alcance, cifras, fuerza del verbo, neutralidad y reglas de longitud), igual que la guía de revisión humana.

## Resumen

- Tarjetas con algún «no» o «delata»: A 14, B 6, C 4.
- Señaladas por al menos 2 revisores: **5**. Señaladas por uno solo: 11.

## Tarjetas señaladas por al menos dos revisores

### t2023-vivienda-sumar-2 (C094, reserva)

- Texto actual (36 palabras): Fijar en zonas tensionadas precios de referencia del alquiler iguales al 30 % de la renta de los hogares. Quien los supere perdería deducciones del impuesto sobre la renta (IRPF) y las empresas, un recargo en sociedades.
- A: no/si/no: Por la elipsis, «las empresas, un recargo» se lee como que las empresas perderían un recargo; además omite a los fondos
- B: no/si/no: La elipsis «y las empresas, un recargo» se lee como si las empresas perdieran un recargo. Dice lo contrario de la cita, que impone un recargo a las empresas.
- C: no/si/no: La elipsis «y las empresas, un recargo» se lee como que las empresas «perderían» un recargo, cuando la cita dice que lo pagarían
- Motivo: Los tres: la elipsis «y las empresas, un recargo» se lee como si las empresas perdieran un recargo, al revés que la cita; además omite a los fondos. La propuesta dice «pagarían» y nombra a fondos y empresas.
- Propuesta: Fijar en zonas tensionadas precios de referencia del alquiler iguales al 30 % de la renta de los hogares. Quien los supere perdería deducciones del impuesto sobre la renta (IRPF) y los fondos y empresas pagarían un recargo en sociedades. (39 palabras)

### t2023-impuestos-pp-2 (C049, reserva)

- Texto actual (29 palabras): Simplificar el impuesto sobre la renta (IRPF) y el de sociedades para las pequeñas y medianas empresas. Sobre todo, para las que tienen pérdidas o aumentan su plantilla indefinida.
- A: no/si/no: Deja fuera la medida principal, eliminar el impuesto a las grandes fortunas, y recoge solo la secundaria
- B: no/si/no: Quita la medida principal, eliminar el impuesto a las grandes fortunas. Así, una rebaja fiscal a los patrimonios altos parece solo una simplificación para pymes.
- C: no/si/no: Omite la medida principal, eliminar el impuesto a las grandes fortunas, y deja solo la simplificación, así que la propuesta parece más moderada de lo que es
- Motivo: Los tres: deja fuera la medida principal de la cita (eliminar el impuesto a las grandes fortunas). En la segunda pasada se eligió la simplificación porque la eliminación sola no llegaba a 15 palabras. Propongo recoger la eliminación con una aclaración de quién paga ese impuesto; la tarjeta vuelve a quedar fuera del eje (IRPF). Los revisores proponían juntar las dos medidas, lo que va contra la regla de una medida por tarjeta.
- Propuesta: Eliminar el impuesto a las grandes fortunas, que pagan quienes tienen los patrimonios más altos. (15 palabras)

### t2023-pensiones-pp-2 (C082, reserva)

- Texto actual (25 palabras): Dar más transparencia y accesibilidad al sistema de pensiones, para que todos los trabajadores puedan consultar con más sencillez una estimación de su pensión futura.
- A: no/si/no: Deja fuera la medida principal, impulsar la contributividad del sistema, y recoge solo la transparencia
- B: no/si/no: Quita la medida principal, reforzar la contributividad del sistema. Solo deja la parte amable, la transparencia, y así suaviza el contenido.
- C: no/si/no: Omite la medida principal, reforzar la contributividad del sistema, y deja solo la transparencia, que es secundaria; la propuesta queda desdibujada
- Motivo: Los tres: deja fuera la medida principal (impulsar la contributividad) y se queda con la transparencia. La propuesta recoge la principal y explica qué significa.
- Propuesta: Impulsar la contributividad del sistema de pensiones, es decir, que la pensión dependa más de lo cotizado durante la vida laboral. (21 palabras)

### t2023-sanidad-junts-1 (C075, test)

- Texto actual (23 palabras): Poder ampliar el número de plazas de médico interno residente (MIR) para que el sistema público de salud de su comunidad tenga especialistas.
- A: si/si/si: «Su comunidad» apunta a un partido de ámbito autonómico; se puede decir de forma general
- B: si/si/si: «Su comunidad» deja ver que es un partido regional. Se puede decir de forma general sin cambiar la medida.
- C: si/si/no
- Motivo: A y B: «su comunidad» delata a un partido de ámbito autonómico. La propuesta, como la de B, usa «sistema público de salud autonómico», que mantiene el alcance (el sistema de una comunidad) sin el posesivo. A proponía quitar la referencia, lo que amplía el alcance a todo el sistema.
- Propuesta: Poder ampliar el número de plazas de médico interno residente (MIR) para que el sistema público de salud autonómico tenga especialistas. (21 palabras)

### t2023-sanidad-cc-1 (C021, test)

- Texto actual (22 palabras): Pedir que el Gobierno del Estado aumente la partida que transfiere a su comunidad autónoma para la atención a la salud mental.
- A: si/si/si: «su comunidad autónoma» y «Gobierno del Estado» apuntan a un partido de ámbito autonómico; se puede decir de forma general
- B: si/si/si: «Su comunidad autónoma» deja ver que es un partido regional. La medida solo afecta a una comunidad, así que es difícil decirlo de forma general.
- C: si/si/no
- Motivo: A y B: «su comunidad autónoma» delata a un partido de ámbito autonómico. B añade que la medida solo afecta a una comunidad y no se puede generalizar. A propone «las comunidades autónomas», pero eso cambia el alcance (de una comunidad a todas). No propongo reescritura: el territorio es contenido. Opciones: mantenerla o dejar a CC sin tarjeta de test en sanidad. Su reserva (financiación sanitaria) tampoco es de ámbito general.
- Propuesta: sin reescritura (ver motivo).

## Señaladas por un solo revisor (para la revisión humana)

- **t2023-vivienda-sumar-1** (C050, revisor A): «Crear viviendas» da a entender que se construyen; la cita habla de formar un parque, que puede incluir viviendas que ya existen Propuesta del revisor: Formar en menos de diez años un parque de dos millones de viviendas sociales y asequibles de alquiler. El gasto medio sería del 1 % del producto interior bruto.
- **t2023-vivienda-pnv-2** (C007, revisor C): «Persona inquilina» y «la propietaria» son lenguaje inclusivo, un rasgo de estilo asociado a la izquierda que no está en la cita Propuesta del revisor: Defender un equilibrio entre inquilinos y propietarios de vivienda que asegure los derechos de ambas partes.
- **t2023-impuestos-psoe-1** (C098, revisor A): «Hijos» estrecha el alcance: la cita dice «descendientes», que incluye también a los nietos Propuesta del revisor: Aumentar en el impuesto sobre la renta (IRPF) el mínimo por descendientes y por personas dependientes.
- **t2023-impuestos-vox-2** (C062, revisor A): La explicación de la plusvalía es inexacta: no se paga solo al vender, también en herencias y donaciones Propuesta del revisor: Suprimir en toda España los impuestos sobre el patrimonio y sobre sucesiones y donaciones. También la plusvalía municipal, que cobran los ayuntamientos cuando se transmite un inmueble urbano.
- **t2023-impuestos-bng-1** (C023, revisor A): «Menos para el trabajo y más para el capital» compara los dos tipos entre sí; la cita habla de bajar uno y subir el otro; además añade el IRPF, que la cita no menciona Propuesta del revisor: Fijar tipos de gravamen distintos según el origen de los ingresos, bajando la tributación del trabajo y subiendo la del capital.
- **t2023-inmigracion-pp-2** (C106, revisor A): La cita habla de agilizar el «cumplimiento» de las órdenes, no las órdenes; además «inmigrantes irregulares» califica a las personas, y el libro de estilo usa «en situación irregular» Propuesta del revisor: Agilizar el cumplimiento de las órdenes de retorno de inmigrantes en situación irregular y la expulsión de quienes hayan cometido delitos. Se haría con mejores acuerdos con los países de origen o de tránsito.
- **t2023-inmigracion-vox-2** (C004, revisor B): «Claro» es un adjetivo que valora: presenta la medida como firme y decidida. Propuesta del revisor: Transmitir que ninguna persona inmigrante que llegue a España de forma irregular podrá regularizar nunca su situación.
- **t2023-inmigracion-junts-2** (C078, revisor A): «El territorio» calca un uso propio del nacionalismo («al territori»); es vago y señala su origen Propuesta del revisor: Buscar vías de solución para las personas que están en España sin su situación administrativa resuelta.
- **t2023-inmigracion-bng-1** (C066, revisor A): «Deportaciones» es un término marcado, propio de un lado del debate; el libro de estilo usa «expulsiones» Propuesta del revisor: Cerrar los centros de internamiento de extranjeros (CIE) en España y poner fin a las expulsiones de personas migrantes.
- **t2023-pensiones-junts-2** (C113, revisor A): «Seguir mejorando» indica que el partido ya gobierna o ya impulsó la medida Propuesta del revisor: Mejorar las bases reguladoras de las pensiones no contributivas hasta el 75 % para las personas con rentas bajas.
- **t2023-sanidad-pnv-2** (C101, revisor A): La frase pasa de 25 palabras y «bancos» estrecha el alcance de «entidades financieras» Propuesta del revisor: Impulsar la regulación del derecho al olvido oncológico. Las entidades financieras y aseguradoras no tendrían el historial médico de quien ha superado un cáncer al contratar un préstamo, un seguro o un crédito.

## Observaciones sin fallo

El revisor A marcó cuatro tarjetas como fieles y neutrales, pero con frases de más de 25 palabras: t2023-vivienda-erc-1 (C022), t2023-pensiones-vox-2 (C063), t2023-empleo-vox-2 (C069) y t2023-sanidad-psoe-1 (C077). generar.mjs las da por buenas porque corta la frase también en los dos puntos («:»), y en las cuatro hay dos puntos. Si se quiere que la regla cuente solo hasta el punto, habría que partir esas cuatro frases. Sus propuestas están en la tabla de abajo.

## Opinión de los tres revisores por tarjeta

Formato: fiel/neutral/delata y, si algo falla, el motivo.

| Tarjeta | Código | A | B | C |
| --- | --- | --- | --- | --- |
| t2023-vivienda-pp-1 | C103 | si/si/no | si/si/no | si/si/no |
| t2023-vivienda-pp-2 | C089 | si/si/no | si/si/no | si/si/no |
| t2023-vivienda-psoe-1 | C037 | si/si/no | si/si/no | si/si/no |
| t2023-vivienda-psoe-2 | C105 | si/si/no | si/si/no | si/si/no |
| t2023-vivienda-vox-1 | C097 | si/si/no | si/si/no | si/si/no |
| t2023-vivienda-vox-2 | C110 | si/si/no | si/si/no | si/si/no |
| t2023-vivienda-sumar-1 | C050 | no/si/no: «Crear viviendas» da a entender que se construyen; la cita habla de formar un parque, que puede incluir viviendas que ya existen | si/si/no | si/si/no |
| t2023-vivienda-sumar-2 | C094 | no/si/no: Por la elipsis, «las empresas, un recargo» se lee como que las empresas perderían un recargo; además omite a los fondos | no/si/no: La elipsis «y las empresas, un recargo» se lee como si las empresas perdieran un recargo. Dice lo contrario de la cita, que impone un recargo a las empresas. | no/si/no: La elipsis «y las empresas, un recargo» se lee como que las empresas «perderían» un recargo, cuando la cita dice que lo pagarían |
| t2023-vivienda-erc-1 | C022 | si/si/no: La frase tiene 26 palabras (máximo 25) | si/si/no | si/si/no |
| t2023-vivienda-erc-2 | C020 | si/si/no | si/si/no | si/si/no |
| t2023-vivienda-junts-1 | C027 | si/si/no | si/si/no | si/si/no |
| t2023-vivienda-junts-2 | C081 | si/si/no | si/si/no | si/si/no |
| t2023-vivienda-pnv-1 | C076 | si/si/no | si/si/no | si/si/no |
| t2023-vivienda-pnv-2 | C007 | si/si/no | si/si/no | si/si/si: «Persona inquilina» y «la propietaria» son lenguaje inclusivo, un rasgo de estilo asociado a la izquierda que no está en la cita |
| t2023-vivienda-bildu-1 | C010 | si/si/no | si/si/no | si/si/no |
| t2023-vivienda-bildu-2 | C015 | si/si/no | si/si/no | si/si/no |
| t2023-vivienda-bng-1 | C001 | si/si/no | si/si/no | si/si/no |
| t2023-vivienda-bng-2 | C005 | si/si/no | si/si/no | si/si/no |
| t2023-impuestos-pp-1 | C107 | si/si/no | si/si/no | si/si/no |
| t2023-impuestos-pp-2 | C049 | no/si/no: Deja fuera la medida principal, eliminar el impuesto a las grandes fortunas, y recoge solo la secundaria | no/si/no: Quita la medida principal, eliminar el impuesto a las grandes fortunas. Así, una rebaja fiscal a los patrimonios altos parece solo una simplificación para pymes. | no/si/no: Omite la medida principal, eliminar el impuesto a las grandes fortunas, y deja solo la simplificación, así que la propuesta parece más moderada de lo que es |
| t2023-impuestos-psoe-1 | C098 | no/si/no: «Hijos» estrecha el alcance: la cita dice «descendientes», que incluye también a los nietos | si/si/no | si/si/no |
| t2023-impuestos-psoe-2 | C091 | si/si/no | si/si/no | si/si/no |
| t2023-impuestos-vox-1 | C008 | si/si/no | si/si/no | si/si/no |
| t2023-impuestos-vox-2 | C062 | no/si/no: La explicación de la plusvalía es inexacta: no se paga solo al vender, también en herencias y donaciones | si/si/no | si/si/no |
| t2023-impuestos-sumar-1 | C074 | si/si/no | si/si/no | si/si/no |
| t2023-impuestos-sumar-2 | C042 | si/si/no | si/si/no | si/si/no |
| t2023-impuestos-erc-1 | C054 | si/si/no | si/si/no | si/si/no |
| t2023-impuestos-erc-2 | C002 | si/si/no | si/si/no | si/si/no |
| t2023-impuestos-junts-1 | C017 | si/si/no | si/si/no | si/si/no |
| t2023-impuestos-junts-2 | C088 | si/si/no | si/si/no | si/si/no |
| t2023-impuestos-pnv-1 | C055 | si/si/no | si/si/no | si/si/no |
| t2023-impuestos-pnv-2 | C104 | si/si/no | si/si/no | si/si/no |
| t2023-impuestos-bildu-1 | C058 | si/si/no | si/si/no | si/si/no |
| t2023-impuestos-bildu-2 | C079 | si/si/no | si/si/no | si/si/no |
| t2023-impuestos-bng-1 | C023 | no/si/no: «Menos para el trabajo y más para el capital» compara los dos tipos entre sí; la cita habla de bajar uno y subir el otro; además añade el IRPF, que la cita no menciona | si/si/no | si/si/no |
| t2023-impuestos-bng-2 | C114 | si/si/no | si/si/no | si/si/no |
| t2023-inmigracion-pp-1 | C006 | si/si/no | si/si/no | si/si/no |
| t2023-inmigracion-pp-2 | C106 | no/no/no: La cita habla de agilizar el «cumplimiento» de las órdenes, no las órdenes; además «inmigrantes irregulares» califica a las personas, y el libro de estilo usa «en situación irregular» | si/si/no | si/si/no |
| t2023-inmigracion-psoe-1 | C092 | si/si/no | si/si/no | si/si/no |
| t2023-inmigracion-psoe-2 | C100 | si/si/no | si/si/no | si/si/no |
| t2023-inmigracion-vox-1 | C047 | si/si/no | si/si/no | si/si/no |
| t2023-inmigracion-vox-2 | C004 | si/si/no | si/no/no: «Claro» es un adjetivo que valora: presenta la medida como firme y decidida. | si/si/no |
| t2023-inmigracion-sumar-1 | C009 | si/si/no | si/si/no | si/si/no |
| t2023-inmigracion-sumar-2 | C032 | si/si/no | si/si/no | si/si/no |
| t2023-inmigracion-erc-1 | C030 | si/si/no | si/si/no | si/si/no |
| t2023-inmigracion-erc-2 | C003 | si/si/no | si/si/no | si/si/no |
| t2023-inmigracion-junts-1 | C057 | si/si/no | si/si/no | si/si/no |
| t2023-inmigracion-junts-2 | C078 | si/si/si: «El territorio» calca un uso propio del nacionalismo («al territori»); es vago y señala su origen | si/si/no | si/si/no |
| t2023-inmigracion-pnv-1 | C041 | si/si/no | si/si/no | si/si/no |
| t2023-inmigracion-pnv-2 | C064 | si/si/no | si/si/no | si/si/no |
| t2023-inmigracion-bildu-1 | C059 | si/si/no | si/si/no | si/si/no |
| t2023-inmigracion-bildu-2 | C112 | si/si/no | si/si/no | si/si/no |
| t2023-inmigracion-bng-1 | C066 | si/no/si: «Deportaciones» es un término marcado, propio de un lado del debate; el libro de estilo usa «expulsiones» | si/si/no | si/si/no |
| t2023-inmigracion-bng-2 | C080 | si/si/no | si/si/no | si/si/no |
| t2023-inmigracion-cc-1 | C099 | si/si/no | si/si/no | si/si/no |
| t2023-inmigracion-cc-2 | C040 | si/si/no | si/si/no | si/si/no |
| t2023-empleo-pp-1 | C012 | si/si/no | si/si/no | si/si/no |
| t2023-empleo-pp-2 | C073 | si/si/no | si/si/no | si/si/no |
| t2023-empleo-psoe-1 | C035 | si/si/no | si/si/no | si/si/no |
| t2023-empleo-psoe-2 | C093 | si/si/no | si/si/no | si/si/no |
| t2023-empleo-vox-1 | C095 | si/si/no | si/si/no | si/si/no |
| t2023-empleo-vox-2 | C069 | si/si/no: La frase tiene 27 palabras (máximo 25) | si/si/no | si/si/no |
| t2023-empleo-sumar-1 | C090 | si/si/no | si/si/no | si/si/no |
| t2023-empleo-sumar-2 | C109 | si/si/no | si/si/no | si/si/no |
| t2023-empleo-erc-1 | C111 | si/si/no | si/si/no | si/si/no |
| t2023-empleo-erc-2 | C028 | si/si/no | si/si/no | si/si/no |
| t2023-empleo-junts-1 | C033 | si/si/no | si/si/no | si/si/no |
| t2023-empleo-junts-2 | C086 | si/si/no | si/si/no | si/si/no |
| t2023-empleo-pnv-1 | C067 | si/si/no | si/si/no | si/si/no |
| t2023-empleo-pnv-2 | C029 | si/si/no | si/si/no | si/si/no |
| t2023-empleo-bildu-1 | C016 | si/si/no | si/si/no | si/si/no |
| t2023-empleo-bildu-2 | C025 | si/si/no | si/si/no | si/si/no |
| t2023-empleo-bng-1 | C115 | si/si/no | si/si/no | si/si/no |
| t2023-empleo-bng-2 | C046 | si/si/no | si/si/no | si/si/no |
| t2023-empleo-cc-1 | C014 | si/si/no | si/si/no | si/si/no |
| t2023-empleo-cc-2 | C039 | si/si/no | si/si/no | si/si/no |
| t2023-pensiones-pp-1 | C024 | si/si/no | si/si/no | si/si/no |
| t2023-pensiones-pp-2 | C082 | no/si/no: Deja fuera la medida principal, impulsar la contributividad del sistema, y recoge solo la transparencia | no/si/no: Quita la medida principal, reforzar la contributividad del sistema. Solo deja la parte amable, la transparencia, y así suaviza el contenido. | no/si/no: Omite la medida principal, reforzar la contributividad del sistema, y deja solo la transparencia, que es secundaria; la propuesta queda desdibujada |
| t2023-pensiones-psoe-1 | C068 | si/si/no | si/si/no | si/si/no |
| t2023-pensiones-psoe-2 | C096 | si/si/no | si/si/no | si/si/no |
| t2023-pensiones-vox-1 | C019 | si/si/no | si/si/no | si/si/no |
| t2023-pensiones-vox-2 | C063 | si/si/no: La frase tiene 28 palabras (máximo 25) | si/si/no | si/si/no |
| t2023-pensiones-sumar-1 | C087 | si/si/no | si/si/no | si/si/no |
| t2023-pensiones-sumar-2 | C036 | si/si/no | si/si/no | si/si/no |
| t2023-pensiones-erc-1 | C034 | si/si/no | si/si/no | si/si/no |
| t2023-pensiones-erc-2 | C043 | si/si/no | si/si/no | si/si/no |
| t2023-pensiones-junts-1 | C018 | si/si/no | si/si/no | si/si/no |
| t2023-pensiones-junts-2 | C113 | si/si/si: «Seguir mejorando» indica que el partido ya gobierna o ya impulsó la medida | si/si/no | si/si/no |
| t2023-pensiones-pnv-1 | C072 | si/si/no | si/si/no | si/si/no |
| t2023-pensiones-pnv-2 | C061 | si/si/no | si/si/no | si/si/no |
| t2023-pensiones-bildu-1 | C045 | si/si/no | si/si/no | si/si/no |
| t2023-pensiones-bildu-2 | C108 | si/si/no | si/si/no | si/si/no |
| t2023-pensiones-bng-1 | C044 | si/si/no | si/si/no | si/si/no |
| t2023-pensiones-bng-2 | C056 | si/si/no | si/si/no | si/si/no |
| t2023-pensiones-cc-1 | C038 | si/si/no | si/si/no | si/si/no |
| t2023-pensiones-cc-2 | C011 | si/si/no | si/si/no | si/si/no |
| t2023-sanidad-pp-1 | C070 | si/si/no | si/si/no | si/si/no |
| t2023-sanidad-pp-2 | C051 | si/si/no | si/si/no | si/si/no |
| t2023-sanidad-psoe-1 | C077 | si/si/no: La frase tiene 28 palabras (máximo 25) | si/si/no | si/si/no |
| t2023-sanidad-psoe-2 | C048 | si/si/no | si/si/no | si/si/no |
| t2023-sanidad-vox-1 | C084 | si/si/no | si/si/no | si/si/no |
| t2023-sanidad-vox-2 | C065 | si/si/no | si/si/no | si/si/no |
| t2023-sanidad-sumar-1 | C060 | si/si/no | si/si/no | si/si/no |
| t2023-sanidad-sumar-2 | C031 | si/si/no | si/si/no | si/si/no |
| t2023-sanidad-erc-1 | C013 | si/si/no | si/si/no | si/si/no |
| t2023-sanidad-erc-2 | C071 | si/si/no | si/si/no | si/si/no |
| t2023-sanidad-junts-1 | C075 | si/si/si: «Su comunidad» apunta a un partido de ámbito autonómico; se puede decir de forma general | si/si/si: «Su comunidad» deja ver que es un partido regional. Se puede decir de forma general sin cambiar la medida. | si/si/no |
| t2023-sanidad-junts-2 | C085 | si/si/no | si/si/no | si/si/no |
| t2023-sanidad-pnv-1 | C083 | si/si/no | si/si/no | si/si/no |
| t2023-sanidad-pnv-2 | C101 | no/si/no: La frase pasa de 25 palabras y «bancos» estrecha el alcance de «entidades financieras» | si/si/no | si/si/no |
| t2023-sanidad-bildu-1 | C052 | si/si/no | si/si/no | si/si/no |
| t2023-sanidad-bildu-2 | C026 | si/si/no | si/si/no | si/si/no |
| t2023-sanidad-bng-1 | C116 | si/si/no | si/si/no | si/si/no |
| t2023-sanidad-bng-2 | C053 | si/si/no | si/si/no | si/si/no |
| t2023-sanidad-cc-1 | C021 | si/si/si: «su comunidad autónoma» y «Gobierno del Estado» apuntan a un partido de ámbito autonómico; se puede decir de forma general | si/si/si: «Su comunidad autónoma» deja ver que es un partido regional. La medida solo afecta a una comunidad, así que es difícil decirlo de forma general. | si/si/no |
| t2023-sanidad-cc-2 | C102 | si/si/no | si/si/no | si/si/no |

## Decisiones

Decididas por el responsable del proyecto y aplicadas en seleccion.json. El registro está en el INFORME, sección 6, «Tercera pasada».

**Aplicadas (señaladas por al menos dos revisores)**
- t2023-vivienda-sumar-2: se corrige la fidelidad en 36 palabras («Superarlos quitaría deducciones… y supondría un recargo en sociedades para fondos y empresas»).
- t2023-impuestos-pp-2: se recoge la medida principal (eliminar el impuesto a las grandes fortunas). Vuelve a quedar fuera del eje.
- t2023-pensiones-pp-2: se recoge la medida principal (la contributividad).
- t2023-sanidad-junts-1: «el sistema público de salud autonómico».
- t2023-sanidad-cc-1: se mantiene como test, sin posesivo: «la comunidad autónoma».

**Aplicadas (señaladas por un solo revisor)**
- t2023-impuestos-psoe-1: «descendientes» en lugar de «hijos», que es el término de la cita y del impuesto.
- t2023-inmigracion-bng-1: «expulsiones» en lugar de «deportaciones». No cambia el sentido: es el término legal. Anotado en la tabla de sustituciones.
- t2023-vivienda-pnv-2: «inquilinos y propietarios de vivienda». «De vivienda» hace falta para llegar a 15 palabras; la cita habla de arrendatarios y arrendadores de vivienda.
- t2023-impuestos-vox-2: corregida. La explicación «al vender un inmueble» era una aclaración del banco, no de la cita, y estaba incompleta, porque la plusvalía municipal también se paga al heredar o donar. Ahora dice «cuando se vende, se hereda o se dona un inmueble urbano».

**No aplicadas**
- t2023-inmigracion-vox-2 («mensaje claro»): no se quita. En la cita, trasladar el mensaje es la medida misma, no un argumento. «Claro» es la palabra de la cita y queda para la revisión humana.
- t2023-pensiones-junts-2 («seguir mejorando»): sin cambios. La cita dice «Continuarem millorant»: es fiel y no valora.
- Las demás marcas de un solo revisor (C050, C023, C106, C078 y C101) quedan sin cambios, para la revisión humana.
- Frases con dos puntos: la regla de generar.mjs se deja como está.
