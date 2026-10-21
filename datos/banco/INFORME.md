# Banco de tarjetas del test · programas de 2023

Generado el 2026-10-21T23:04:45.601Z con `node scripts/banco/generar.mjs`. Borrador: nada de esto se publica hasta que lo aprueben dos revisores (`scripts/banco/aprobar.mjs`).

## 1. Resumen

- **116 tarjetas**: 58 de test y 58 de reserva, para 10 partidos y 6 temas.
- **Cobertura**: 58 de 60 combinaciones de partido y tema tienen tarjeta. Sin propuesta: CC en vivienda, CC en impuestos (sin propuesta neutralizable). Sin reserva: ninguna.
- **Ejes**: vivienda cubre 4 de 4 estatales; impuestos cubre 4 de 4 estatales; inmigración cubre 4 de 4 estatales; empleo cubre 4 de 4 estatales; pensiones cubre 3 de 4 estatales; sanidad cubre 3 de 4 estatales.
- **Fuera de eje**: 11 tarjetas de test y 42 reservas (de reserva se elige a menudo otra cuestión del tema, para no repetir la de test).
- **Citas**: las 116 están en su página (114 exactas y 2 normalizadas).
- **Prueba de adivinar**: 24 textos de PP, PSOE, Vox y Sumar.

**Problemas principales**
- El PP no tiene captura de 2023 de su programa: se enlaza una captura de 2025 idéntica al archivo (ver sección 2).
- Tres de los cuatro estatales en pensiones y en sanidad: Vox no propone nada sobre la subida de las pensiones y el PP nada sobre listas de espera (tarjetas fuera de eje).
- Algunas tarjetas de test se parecen mucho entre partidos (PSOE y Sumar en listas de espera; ERC y Junts en ligar la pensión mínima al salario mínimo). La prueba de adivinar y los revisores dirán si se distinguen.
- Algunas tarjetas de partidos territoriales pueden delatar su origen por el contenido (competencias autonómicas, «su comunidad») aunque no nombren el territorio.

**Decisiones tomadas**
- Eje de sanidad: se mantiene «listas de espera». El PP va con su propuesta más cercana del tema (1.000 plazas más de formación en medicina familiar), fuera de eje.
- Coalición Canaria en impuestos: sin tarjeta. «Una isla concreta» cambia el sentido de una medida pensada para La Palma; queda como «sin propuesta neutralizable».
- Tarjeta compartida de devoluciones en caliente: separada en tres (ERC, Junts y Bildu), cada una con su cita, su página, su enlace y sus detalles. Regla desde ahora: una tarjeta = un partido = una cita (lo comprueba generar.mjs).

**Lo que necesito que decidas**
- Ninguno.

## 2. Versiones de los programas

Para cada programa se buscó en el índice CDX de Internet Archive una captura de mayo a julio de 2023 de su dirección original y se comparó su SHA-256 con el del archivo local. Las diez URL de captura, en forma `id_`, devuelven el PDF directamente (Content-Type application/pdf); ninguna devuelve una página de Internet Archive.

| Partido | SHA-256 local | Captura de Internet Archive | ¿Coinciden? | Páginas | Versión usada |
| --- | --- | --- | --- | --- | --- |
| PP | `c93baafc88bdcb33adcd7e8be9dc309b09056362183ad7b7767f3d5134313108` | 2025-06-19 · [captura](https://web.archive.org/web/20250619072430id_/https://www.pp.es/storage/2023/07/programa_electoral_pp_23j_feijoo_2023.pdf) | sí | 112 | local; **sin captura de 2023** |
| PSOE | `02d4972a848250fec9b8b2cffc5aaa78733acb0ac010e79ce1787161f91a42f2` | 2023-07-09 · [captura](https://web.archive.org/web/20230709064011id_/https://www.psoe.es/media-content/2023/07/PROGRAMA_ELECTORAL-GENERALES-2023.pdf) | sí | 272 | local |
| Vox | `a63a7230318668bb141ade1b8957b86827e11c06ac57b2148e36011cfe8021db` | 2023-11-16 · [captura](https://web.archive.org/web/20231116091643id_/https://www.voxespana.es/wp-content/uploads/2023/07/Programa-VOX-2023-con-menos-peso.pdf) | sí | 178 | local; captura de 2023 fuera de mayo a julio |
| Sumar | `d5ccdac0d20f1b93a5f703f180d086041bd988835072dd5cb5d1378bf0195820` | 2023-07-24 · [captura](https://web.archive.org/web/20230724225336id_/https://movimientosumar.es/wp-content/uploads/2023/07/Un-Programa-para-ti.pdf) | sí | 182 | local |
| ERC | `455e0629d90ef63ab59c43c35d67cdd739165958587e3242eb5b6e4914afe991` | 2023-07-06 · [captura](https://web.archive.org/web/20230706115117id_/https://static.esquerra.cat/uploads/20230705/e2023-programa.pdf) | sí | 132 | local |
| Junts | `7f73e138b6020f9a12ff260f7baeb3aa2807b60903e91052435f7e0ded7d938b` | 2023-07-19 · [captura](https://web.archive.org/web/20230719155804id_/https://img.beteve.cat/wp-content/uploads/2023/07/programa-junts-per-catalunya-eleccions-generals-2023.pdf) | sí | 148 | local |
| PNV | `46fec3a017cdc5c4e506fa5e228b97690071d5a03dfd3d8128392aa20f57d132` | 2023-07-26 · [captura](https://web.archive.org/web/20230726060016id_/https://www.eaj-pnv.eus/es/adjuntos-documentos/20945/pdf/con-voz-propia-programa-electoral-23-j) | sí | 52 | local |
| Bildu | `6634c0786c1e771c61c1a65e549dfde0d4581d09e19949466e931c96a9642465` | 2023-07-27 · [captura](https://web.archive.org/web/20230727191629id_/https://ehbildu.eus/dokumentuak/23J-COMPROMISO-DE-EUSKAL-HERRIA-BILDU.pdf) | sí | 16 | local |
| BNG | `b8994deec0bbc45cdcbef5d7c5395cabf30b0509706303c3d8e76058c48eebfd` | 2023-07-26 · [captura](https://web.archive.org/web/20230726164423id_/https://www.bng.gal/media/bnggaliza/files/2023/07/05/23_bng_xerais_programa.pdf) | sí | 68 | local |
| CC | `ebcac3e6b17012c77d1a761041dc1615c2b28a527666a1467db66e4b82b49c33` | 2023-12-10 · [captura](https://web.archive.org/web/20231210072530id_/https://coalicioncanaria.org/wp-content/uploads/2023/06/COALICION_POR_CANARIAS.pdf) | sí | 14 | local; captura de 2023 fuera de mayo a julio |

- **PP · sin captura de 2023** (versiones.json: «verificacion»: «sin-captura-2023»). Internet Archive no guardó la dirección del programa (pp.es/storage/2023/07/…) hasta el 19 de junio de 2025, con contenido idéntico byte a byte al archivo local; se enlaza esa captura. El archivo tiene fechas internas del 5 de julio de 2023 (creado a las 14:17 y modificado a las 16:45) y nombre interno «AF LIBRO PROGRAMA_23J_FINAL_CORR_5J». La dirección de pp.es sirvió otro contenido el 14 de noviembre de 2025 (4,99 MB frente a 7,7 MB) y volvió a servir el mismo el 15 de noviembre: por eso no se enlaza la dirección original.
- **Vox y Coalición Canaria**: no hay capturas de mayo a julio de 2023, pero sí de 2023 (16 de noviembre y 10 de diciembre) que coinciden byte a byte con los archivos locales. Se dan por buenas por decisión del responsable del proyecto.
- Los otros siete coinciden byte a byte con una captura de mayo a julio de 2023. No ha hecho falta descargar nada a archivo-2023/: se trabaja con los archivos locales.
- Las fechas internas (pdfinfo) de los diez PDF son de junio y julio de 2023, aunque el servidor de algunos partidos los marque como modificados después.

## 3. Cobertura

| Partido | Vivienda | Impuestos | Inmigración | Empleo | Pensiones | Sanidad |
| --- | --- | --- | --- | --- | --- | --- |
| PP | test + reserva | test + reserva (fuera de eje) | test + reserva | test + reserva (fuera de eje) | test + reserva (fuera de eje) | test (fuera de eje) + reserva (fuera de eje) |
| PSOE | test + reserva | test + reserva (fuera de eje) | test + reserva (fuera de eje) | test + reserva | test + reserva (fuera de eje) | test + reserva |
| Vox | test + reserva (fuera de eje) | test + reserva (fuera de eje) | test + reserva | test + reserva (fuera de eje) | test (fuera de eje) + reserva (fuera de eje) | test + reserva (fuera de eje) |
| Sumar | test + reserva | test + reserva (fuera de eje) | test + reserva (fuera de eje) | test + reserva | test + reserva (fuera de eje) | test + reserva (fuera de eje) |
| ERC | test + reserva | test + reserva (fuera de eje) | test + reserva | test + reserva (fuera de eje) | test + reserva (fuera de eje) | test (fuera de eje) + reserva (fuera de eje) |
| Junts | test + reserva | test + reserva (fuera de eje) | test + reserva (fuera de eje) | test + reserva (fuera de eje) | test + reserva (fuera de eje) | test (fuera de eje) + reserva (fuera de eje) |
| PNV | test + reserva | test (fuera de eje) + reserva (fuera de eje) | test + reserva (fuera de eje) | test + reserva (fuera de eje) | test + reserva (fuera de eje) | test (fuera de eje) + reserva (fuera de eje) |
| Bildu | test + reserva | test (fuera de eje) + reserva (fuera de eje) | test + reserva (fuera de eje) | test + reserva | test + reserva (fuera de eje) | test (fuera de eje) + reserva (fuera de eje) |
| BNG | test + reserva | test + reserva (fuera de eje) | test + reserva (fuera de eje) | test + reserva (fuera de eje) | test + reserva (fuera de eje) | test (fuera de eje) + reserva (fuera de eje) |
| CC | sin propuesta | sin propuesta neutralizable | test + reserva | test (fuera de eje) + reserva (fuera de eje) | test + reserva (fuera de eje) | test (fuera de eje) + reserva (fuera de eje) |

## 4. Ejes elegidos

| Tema | Eje | Estatales en el eje | Por qué |
| --- | --- | --- | --- |
| Vivienda | Cómo hacer más accesible la vivienda | 4 de 4 (PP, PSOE, Vox, Sumar) | Eje de partida. Los cuatro estatales tienen propuestas sobre el acceso a la vivienda y son distintas entre sí: avales hipotecarios para jóvenes, construcción de vivienda pública, IVA cero en la primera compra y un gran parque público de alquiler. |
| Impuestos | El impuesto sobre la renta (IRPF) | 4 de 4 (PP, PSOE, Vox, Sumar) | Eje de partida. Los cuatro estatales tienen una propuesta concreta y distinta: corregir la inflación en la tarifa, subir el mínimo por hijos, dos tipos del 15 % y el 25 %, y más tramos hasta el 52 %. |
| Inmigración | La entrada irregular y el control de fronteras | 4 de 4 (PP, PSOE, Vox, Sumar) | Eje de partida. Los cuatro estatales tienen propuesta y son muy distintas: más inspección fronteriza, desmantelar mafias en origen, expulsión inmediata y castigar como delito la devolución sumaria en frontera. |
| Empleo | Los sueldos, incluido el salario mínimo, y la jornada laboral | 4 de 4 (PP, PSOE, Vox, Sumar) | El eje de partida (salario mínimo y jornada) dejaba fuera a Vox, que no propone nada sobre el salario mínimo ni la jornada, pero sí «la subida de todos los salarios, especialmente los más bajos». Ampliado a los sueldos, cubre a los cuatro estatales sin perder el centro del eje: PP y PSOE proponen sobre el salario mínimo y Sumar sobre la jornada. |
| Pensiones | Cuánto suben las pensiones | 3 de 4 (PP, PSOE, Sumar) | Eje de partida. Lo cubren PP, PSOE y Sumar. Vox no tiene ninguna propuesta sobre la subida de las pensiones: su programa solo trae dos (que no paguen IRPF y su sostenibilidad), y ningún otro eje de pensiones cubriría a los cuatro. |
| Sanidad | Las listas de espera | 3 de 4 (PSOE, Vox, Sumar) | Eje de partida. Lo cubren PSOE, Vox y Sumar; el PP no tiene propuestas sobre listas de espera. La alternativa «atención primaria y falta de profesionales» cubriría a los cuatro, pero el PP y Sumar proponen casi lo mismo («plan de choque en atención primaria») y la propuesta del PSOE en ese terreno es menor (una asignatura en el grado). Las listas de espera dan contrastes más claros (ley con plazos máximos frente a conciertos con la privada). Decidido por el responsable del proyecto: se mantiene el eje y el PP va con su propuesta más cercana del tema, fuera de eje. |

### Tarjetas fuera de eje

| Tarjeta | Uso | Por qué |
| --- | --- | --- |
| t2023-vivienda-vox-2 | reserva | Reserva sobre suelo (oferta), no directamente sobre el precio de acceso. |
| t2023-impuestos-pp-2 | reserva | Reserva sobre el impuesto a las grandes fortunas. |
| t2023-impuestos-psoe-2 | reserva | Reserva sobre el impuesto a las grandes fortunas. |
| t2023-impuestos-vox-2 | reserva | Reserva sobre patrimonio, sucesiones y plusvalía. |
| t2023-impuestos-sumar-2 | reserva | Reserva sobre el impuesto a las grandes fortunas. |
| t2023-impuestos-erc-2 | reserva | Reserva sobre los impuestos a banca y energéticas. |
| t2023-impuestos-junts-2 | reserva | Reserva sobre el impuesto de sociedades. |
| t2023-impuestos-pnv-1 | test | El PNV no tiene propuestas sobre el IRPF; se usa su propuesta sobre el IVA. |
| t2023-impuestos-pnv-2 | reserva | Reserva sin relación con el IRPF: lucha contra el fraude. |
| t2023-impuestos-bildu-1 | test | Bildu no tiene propuestas sobre el IRPF; se usa la de impuestos a banca, energéticas y grandes fortunas. |
| t2023-impuestos-bildu-2 | reserva | Reserva sin relación con el IRPF. |
| t2023-impuestos-bng-2 | reserva | Reserva sobre el IVA de la energía. |
| t2023-inmigracion-psoe-2 | reserva | Reserva sobre vías legales de migración. |
| t2023-inmigracion-sumar-2 | reserva | Reserva sobre regularización. |
| t2023-inmigracion-junts-2 | reserva | Reserva sobre vías legales y situación de quienes ya están en el país. |
| t2023-inmigracion-pnv-2 | reserva | Reserva sobre el reparto de menores y solicitantes de asilo. |
| t2023-inmigracion-bildu-2 | reserva | Reserva sobre la ley de extranjería en general. |
| t2023-inmigracion-bng-2 | reserva | Reserva sobre derechos y regularización. |
| t2023-empleo-pp-2 | reserva | Reserva sobre autónomos. |
| t2023-empleo-vox-2 | reserva | Reserva sobre cotizaciones por contratos indefinidos. |
| t2023-empleo-erc-2 | reserva | Reserva sobre el despido. |
| t2023-empleo-junts-2 | reserva | Reserva sobre autónomos. |
| t2023-empleo-pnv-2 | reserva | Reserva sobre la prestación por desempleo. |
| t2023-empleo-bng-2 | reserva | Reserva sobre ETT, subcontratación y falsos autónomos. |
| t2023-empleo-cc-1 | test | Coalición Canaria no tiene propuestas sobre sueldos ni jornada; se usa la de bonificar contratos indefinidos. |
| t2023-empleo-cc-2 | reserva | Reserva sobre incentivos a contratar jóvenes. |
| t2023-pensiones-pp-2 | reserva | Reserva sobre contributividad y transparencia. |
| t2023-pensiones-psoe-2 | reserva | Reserva sobre el fondo de reserva. |
| t2023-pensiones-vox-1 | test | Vox no tiene propuestas sobre la subida de las pensiones; se usa la de que las pensiones no paguen IRPF, que es la más cercana (cuánto cobra el pensionista). |
| t2023-pensiones-vox-2 | reserva | Reserva sobre desgravaciones fiscales a jubilados con familiares jóvenes a su cargo (medida 131). |
| t2023-pensiones-sumar-2 | reserva | Reserva sobre la protección constitucional de la Seguridad Social. |
| t2023-pensiones-erc-2 | reserva | Reserva sobre la edad de jubilación. |
| t2023-pensiones-junts-2 | reserva | Reserva sobre pensiones no contributivas y su fiscalidad (cuantía, no subida anual). |
| t2023-pensiones-pnv-2 | reserva | Reserva sobre el fondo de reserva. |
| t2023-pensiones-bildu-2 | reserva | Reserva sobre la edad de jubilación. |
| t2023-pensiones-bng-2 | reserva | Reserva sobre la edad de jubilación. |
| t2023-pensiones-cc-2 | reserva | Reserva sobre un pacto de Estado de pensiones. |
| t2023-sanidad-pp-1 | test | El PP no tiene propuestas sobre listas de espera; se usa su propuesta de 1.000 plazas más de formación en medicina familiar. |
| t2023-sanidad-pp-2 | reserva | Reserva sobre un plan urgente en atención primaria. |
| t2023-sanidad-vox-2 | reserva | Reserva sobre inversión en atención primaria. |
| t2023-sanidad-sumar-2 | reserva | Reserva sobre gestión pública. |
| t2023-sanidad-erc-1 | test | ERC no tiene propuestas sobre listas de espera; se usa la de falta de especialistas. |
| t2023-sanidad-erc-2 | reserva | Reserva sobre la cartera de servicios. |
| t2023-sanidad-junts-1 | test | Junts no tiene propuestas sobre listas de espera; se usa la de plazas MIR. |
| t2023-sanidad-junts-2 | reserva | Reserva sobre la ley de profesiones sanitarias. |
| t2023-sanidad-pnv-1 | test | El PNV no tiene propuestas sobre listas de espera; se usa la de plazas MIR. |
| t2023-sanidad-pnv-2 | reserva | Reserva sobre el derecho al olvido oncológico. |
| t2023-sanidad-bildu-1 | test | Bildu no tiene propuestas sobre listas de espera; se usa la de plazas MIR y atención primaria. |
| t2023-sanidad-bildu-2 | reserva | Reserva sobre gestión privada. |
| t2023-sanidad-bng-1 | test | El BNG no tiene propuestas sobre listas de espera; se usa la de financiación sanitaria. |
| t2023-sanidad-bng-2 | reserva | Reserva sobre el copago farmacéutico. |
| t2023-sanidad-cc-1 | test | Coalición Canaria no tiene propuestas sobre listas de espera; se usa la de salud mental. |
| t2023-sanidad-cc-2 | reserva | Reserva sobre la financiación sanitaria del Estado. |

## 5. Comparativa por tema (tarjetas de test de los cuatro estatales)

### Vivienda

Eje: Cómo hacer más accesible la vivienda

- **PP** (23 palabras): Crear un programa de avales para que jóvenes de hasta 35 años obtengan hipotecas de hasta el 95 % del precio de la vivienda.
- **PSOE** (16 palabras): Construir 183.000 viviendas públicas para alquiler y garantizar que la mitad vaya destinada a personas jóvenes.
- **Vox** (22 palabras): Eliminar el impuesto sobre el valor añadido (IVA) en la compra de la primera vivienda habitual, modificando la ley de ese impuesto.
- **Sumar** (25 palabras): Crear en menos de diez años dos millones de viviendas sociales y asequibles de alquiler, con un gasto medio del 1 % del producto interior bruto.

### Impuestos

Eje: El impuesto sobre la renta (IRPF)

- **PP** (15 palabras): Corregir en la tarifa del impuesto sobre la renta (IRPF) los efectos de la inflación.
- **PSOE** (16 palabras): Aumentar en el impuesto sobre la renta (IRPF) el mínimo por descendientes y por personas dependientes.
- **Vox** (25 palabras): Simplificar poco a poco el impuesto sobre la renta (IRPF) a dos tipos: 15 % para bases inferiores a 70.000 euros y 25 % para las superiores.
- **Sumar** (25 palabras): Crear en el impuesto sobre la renta (IRPF) más tramos desde 120.000 euros y subir el tipo máximo del 45 % al 52 % desde 300.000 euros.

### Inmigración

Eje: La entrada irregular y el control de fronteras

- **PP** (24 palabras): Reforzar la inspección en las fronteras con más personal y mejor formado. También impulsar el nuevo registro europeo de entradas y salidas de viajeros.
- **PSOE** (17 palabras): Potenciar una estrategia para desmantelar las mafias que trafican con seres humanos en los países de origen.
- **Vox** (16 palabras): Expulsar de forma inmediata a todas las personas inmigrantes que entren de forma irregular en España.
- **Sumar** (22 palabras): Convertir en delito la devolución sumaria en la frontera y suprimir la disposición de la ley de extranjería que permite esta práctica.

### Empleo

Eje: Los sueldos, incluido el salario mínimo, y la jornada laboral

- **PP** (17 palabras): Actualizar el salario mínimo interprofesional (SMI) dentro del diálogo social, con participación de sindicatos, empresarios y expertos.
- **PSOE** (20 palabras): Garantizar en el Estatuto de los Trabajadores que el salario mínimo interprofesional (SMI) se ajuste al 60 % del salario medio.
- **Vox** (25 palabras): Impulsar la subida de todos los salarios, sobre todo los más bajos, y reducir en gran medida las cargas y la regulación sobre las empresas.
- **Sumar** (26 palabras): Fijar por ley en 2024 una jornada máxima de 37,5 horas sin bajar el salario. Después, abrir un diálogo social para reducirla hasta 32 horas semanales.

### Pensiones

Eje: Cuánto suben las pensiones

- **PP** (21 palabras): Garantizar la revalorización de las pensiones en el marco del Pacto de Toledo, el acuerdo parlamentario sobre el sistema de pensiones.
- **PSOE** (19 palabras): Reformar la Constitución para que todas las pensiones se revaloricen siempre según el índice de precios de consumo (IPC).
- **Vox** (17 palabras, fuera de eje): Eximir a las pensiones contributivas de pagar el impuesto sobre la renta de las personas físicas (IRPF).
- **Sumar** (25 palabras): Subir las pensiones mínimas y no contributivas por encima del índice de precios de consumo (IPC) hasta llegar, al menos, al umbral de la pobreza.

### Sanidad

Eje: Las listas de espera

- **PP** (18 palabras, fuera de eje): Impulsar con las comunidades autónomas 1.000 plazas más de formación en medicina familiar en la oferta de 2024.
- **PSOE** (28 palabras): Fijar por ley tiempos máximos de espera en la sanidad pública: 120 días para operar, 60 para consultas de especialistas y 30 para pruebas, en todo el país.
- **Vox** (28 palabras): Reducir las listas de espera en volumen y tiempo en todos los ámbitos. Se incentivaría a los centros públicos y se reforzarían los conciertos con la sanidad privada.
- **Sumar** (24 palabras): Aprobar una ley de listas de espera con tiempos máximos y un registro homogéneo, transparente y fiable de las listas en todo el país.

## 6. Autorrevisión

Segunda pasada completa, tarjeta por tarjeta: fidelidad, neutralidad, lenguaje cargado, legibilidad, lectura a ciegas y equilibrio dentro de cada tema.

Resultado por criterio, además de los cambios del registro: **fidelidad**: 6 cambios (verbos más fuertes que la cita y alcances recortados o añadidos); **neutralidad y lenguaje cargado**: 1 cambio en esta pasada; las sustituciones hechas al redactar están en la tabla de abajo; **legibilidad**: 2 cambios (jerga y una expresión ambigua); todas las frases tienen 25 palabras o menos y todas las siglas se explican la primera vez (lo comprueba generar.mjs); **lectura a ciegas** de los 24 textos de PP, PSOE, Vox y Sumar: sin cambios. No encontré palabras ni giros que delaten al partido por el estilo; lo que puede delatar es el contenido (expulsión inmediata, IVA cero, 32 horas), que es lo que el test compara. Se evitaron «blindar», «efecto llamada», «ilegal» aplicado a personas y nombres de programas. Todas las tarjetas siguen el mismo patrón (infinitivo y una segunda frase con el cómo o a quién afecta) y el mismo registro; **equilibrio**: 2 cambios para que en cada tema la tarjeta de test más larga y la más corta no se separen más de 10 palabras (lo comprueba generar.mjs). Las tarjetas vagas porque el programa es vago se han dejado vagas (tabla de abajo). Único aviso de generar.mjs: «mafias» (PSOE, inmigración). Se mantiene: es la palabra de la cita, es descriptiva y la usan programas de bloques distintos.

### Regla de territorio

- Nombrar un territorio concreto (por ejemplo, La Palma, Cataluña o Euskadi) delata al partido: se neutraliza o, si neutralizarlo cambia el sentido, se usa la reserva.
- Una referencia genérica a «la comunidad autónoma» o a lo «autonómico» se permite, porque es inherente a los partidos de ámbito autonómico. Por eso se mantienen las tarjetas de test de Junts y de CC en sanidad.

### Segunda pasada de redacción

Reglas de esta pasada: de 15 a 40 palabras sin relleno; solo la medida, sin las justificaciones del partido; una medida por tarjeta; sin casos concretos que identifiquen la sensibilidad del partido; empezar por el verbo de la medida, sin verbos de marco (se conservan los compromisos blandos de la cita, como «impulsar», «defender» o «pedir al Gobierno»). Siguen las reglas de antes. Se cambiaron 116 tarjetas y se retiraron 2.

| Tarjeta | Antes | Después | Motivo |
| --- | --- | --- | --- |
| t2023-vivienda-pp-1 | Poner en marcha un programa de avales para jóvenes de hasta 35 años. Su fin es garantizar que obtengan hipotecas por hasta el 95 % del precio total de la vivienda. | Crear un programa de avales para que jóvenes de hasta 35 años obtengan hipotecas de hasta el 95 % del precio de la vivienda. (23 palabras) | Equilibrio |
| t2023-vivienda-pp-2 | Movilizar el suelo de titularidad pública reservado a vivienda, sea cual sea su régimen jurídico. Se destinaría a fórmulas para promover viviendas en alquiler asequible. | Movilizar el suelo público reservado a vivienda, sea cual sea su régimen jurídico, para promover viviendas en alquiler asequible. (19 palabras) | Relleno quitado |
| t2023-vivienda-psoe-1 | Tener como objetivo construir 183.000 viviendas públicas de alquiler y garantizar que la mitad sea para jóvenes. También ampliar el presupuesto de la ayuda estatal al alquiler para jóvenes y el número de personas que la reciben. | Construir 183.000 viviendas públicas para alquiler y garantizar que la mitad vaya destinada a personas jóvenes. (16 palabras) | Verbo de marco quitado; Una medida |
| t2023-vivienda-psoe-2 | Tener como objetivo alcanzar en los próximos años el 20 % de vivienda pública en alquiler. Así se llegaría a la media de países de la Unión Europea como Francia, Países Bajos o Alemania. | Alcanzar en los próximos años un 20 % de vivienda pública de alquiler, como la media de Francia, Países Bajos o Alemania. (21 palabras) | Verbo de marco quitado |
| t2023-vivienda-vox-1 | Modificar la ley del impuesto sobre el valor añadido (IVA) para eliminarlo en la compra de la primera vivienda habitual. Así, quien compre su primera casa no pagaría este impuesto. | Eliminar el impuesto sobre el valor añadido (IVA) en la compra de la primera vivienda habitual, modificando la ley de ese impuesto. (22 palabras) | Relleno quitado |
| t2023-vivienda-vox-2 | Liberar todo el suelo que no esté o deba estar especialmente protegido por su interés ambiental, paisajístico o productivo, o por la defensa nacional. Solo quedaría fuera el suelo con esa protección especial. | Liberar todo el suelo que no esté o deba estar especialmente protegido por su interés ambiental, paisajístico o productivo, o por la defensa nacional. (24 palabras) | Relleno quitado |
| t2023-vivienda-sumar-1 | Crear en menos de diez años un parque de dos millones de viviendas sociales y asequibles de alquiler. Se financiaría con un gasto sostenido del 1 % del producto interior bruto (PIB) de media. | Crear en menos de diez años dos millones de viviendas sociales y asequibles de alquiler, con un gasto medio del 1 % del producto interior bruto. (25 palabras) | Equilibrio |
| t2023-vivienda-sumar-2 | Fijar en zonas tensionadas precios de referencia del alquiler del 30 % de la renta de los hogares. Quien supere ese precio perdería deducciones del impuesto sobre la renta (IRPF); fondos y empresas pagarían un recargo en el impuesto de sociedades. | Fijar en zonas tensionadas precios de referencia del alquiler del 30 % de la renta de los hogares. Superarlos quitaría deducciones del impuesto sobre la renta (IRPF) y supondría un recargo en sociedades para fondos y empresas. (36 palabras) | Equilibrio |
| t2023-vivienda-erc-1 | Permitir que las comunidades autónomas con competencias en vivienda y derecho civil propio regulen por completo los contratos de alquiler: precios, duración y prórrogas. Se haría en el marco del artículo 150.1 de la Constitución. | Permitir, vía artículo 150.1 de la Constitución, que las comunidades con competencias en vivienda y derecho civil propio regulen todo el alquiler: precios, duración y prórrogas. (26 palabras) | Equilibrio |
| t2023-vivienda-erc-2 | Recuperar la deducción en el impuesto sobre la renta (IRPF) por el alquiler de la vivienda habitual para los inquilinos. Esta deducción se eliminó con efectos desde el 1 de enero de 2015. | Recuperar la deducción en el impuesto sobre la renta (IRPF) por el alquiler de la vivienda habitual para los inquilinos. Se suprimió desde el 1 de enero de 2015. (29 palabras) | Equilibrio |
| t2023-vivienda-junts-1 | Aumentar poco a poco, a medio plazo, el dinero del Estado para políticas de vivienda. El objetivo es llegar a la media europea: el 0,6 % del producto interior bruto (PIB). | Aumentar poco a poco, a medio plazo, los fondos del Estado para políticas de vivienda hasta la media europea, el 0,6 % del producto interior bruto. (25 palabras) | Equilibrio |
| t2023-vivienda-junts-2 | Pedir al Estado que recupere la deducción estatal del impuesto sobre la renta (IRPF) por alquilar la vivienda habitual, para menores de 30 años. Busca facilitar el acceso a la vivienda y la emancipación juvenil. | Pedir al Estado que recupere la deducción estatal del impuesto sobre la renta (IRPF) por alquiler de la vivienda habitual para menores de 30 años. (25 palabras) | Justificación quitada |
| t2023-vivienda-pnv-1 | Defender políticas que fomenten el alquiler y una promoción suficiente de vivienda pública. Deben atender en especial las emergencias sociales, como ya hace el gobierno autonómico en sus competencias exclusivas. | Defender políticas que fomenten el alquiler y la promoción de vivienda pública suficiente, atendiendo en especial a las situaciones de emergencia social. (22 palabras) | Caso concreto quitado |
| t2023-vivienda-pnv-2 | Defender un equilibrio entre la persona que alquila una vivienda y la persona propietaria. Se trata de que queden asegurados los derechos de ambas partes. | Defender un equilibrio entre inquilinos y propietarios de vivienda que asegure los derechos de ambas partes. (16 palabras) | Relleno quitado |
| t2023-vivienda-bildu-1 | Recuperar de forma indefinida la prórroga automática de los contratos de alquiler cuando se renuevan. Se mantendrían las mismas condiciones y la misma renta. Afecta a las personas que viven en una vivienda alquilada. | Recuperar de forma indefinida la prórroga automática de los contratos de alquiler al renovarlos, con las mismas condiciones y la misma renta. (22 palabras) | Relleno quitado |
| t2023-vivienda-bildu-2 | Congelar de forma temporal y retroactiva las cuotas de hipotecas inferiores a 250.000 euros hasta que se revierta la subida de tipos de interés. Podrían subir como máximo un 15 % sobre la cuota previa a julio de 2022. | Congelar de forma temporal y retroactiva las cuotas de hipotecas inferiores a 250.000 euros hasta que se revierta la subida de los tipos de interés. La subida máxima sería del 15 % sobre la cuota previa a julio de 2022. (39 palabras) | Sin cambios de fondo |
| t2023-vivienda-bng-1 | Aumentar la inversión destinada a vivienda hasta alcanzar los 250 euros por habitante. Así, el gasto en políticas de vivienda llegaría a esa cantidad por cada persona. | Aumentar la inversión destinada a la vivienda hasta que alcance los 250 euros por cada habitante. (16 palabras) | Relleno quitado |
| t2023-vivienda-bng-2 | Ampliar los criterios del recargo del impuesto sobre bienes inmuebles (IBI) para fomentar que se usen más viviendas vacías. Afectaría a los propietarios de viviendas vacías. | Ampliar los criterios del recargo del impuesto sobre bienes inmuebles (IBI) para que se movilicen más viviendas vacías. (18 palabras) | Relleno quitado |
| t2023-impuestos-pp-1 | Corregir el efecto de la inflación en la tarifa del impuesto sobre la renta (IRPF). Sin ese ajuste, la inflación supone una subida real de impuestos para la clase media. | Corregir en la tarifa del impuesto sobre la renta (IRPF) los efectos de la inflación. (15 palabras) | Justificación quitada |
| t2023-impuestos-pp-2 | Eliminar el impuesto a las grandes fortunas. Simplificar el impuesto sobre la renta (IRPF) y el de sociedades para las pequeñas y medianas empresas. Sobre todo, para las que tienen pérdidas o aumentan su plantilla con contratos indefinidos. | Eliminar el impuesto a las grandes fortunas, que pagan quienes tienen los patrimonios más altos. (15 palabras) | Una medida |
| t2023-impuestos-psoe-1 | Aumentar en el impuesto sobre la renta (IRPF) el mínimo por hijos y por personas dependientes. Busca apoyar a las familias con hijos, impulsar la natalidad y ayudar a cuidar a mayores y dependientes. | Aumentar en el impuesto sobre la renta (IRPF) el mínimo por descendientes y por personas dependientes. (16 palabras) | Justificación quitada |
| t2023-impuestos-psoe-2 | Evaluar los resultados del impuesto temporal a las grandes fortunas. Si procede, avanzar en el debate sobre cómo gravar la riqueza en el modelo de financiación autonómica, para acabar con la competencia fiscal entre comunidades. | Evaluar los resultados del impuesto temporal a las grandes fortunas. Si procede, avanzar en el debate sobre cómo gravar la riqueza dentro de la financiación autonómica. (26 palabras) | Justificación quitada |
| t2023-impuestos-vox-1 | Simplificar de forma progresiva el impuesto sobre la renta (IRPF): un tipo del 15 % para bases por debajo de 70.000 euros y del 25 % por encima. Quedarían exentos 22.000 euros anuales del trabajo, con uno o dos pagadores. | Simplificar poco a poco el impuesto sobre la renta (IRPF) a dos tipos: 15 % para bases inferiores a 70.000 euros y 25 % para las superiores. (25 palabras) | Una medida; Equilibrio |
| t2023-impuestos-vox-2 | Suprimir en toda España el impuesto sobre el patrimonio y el de sucesiones y donaciones. También la plusvalía municipal, que cobran los ayuntamientos cuando se vende un inmueble. | Suprimir en toda España los impuestos sobre el patrimonio y sobre sucesiones y donaciones. También la plusvalía municipal, que cobran los ayuntamientos cuando se vende, se hereda o se dona un inmueble urbano. (33 palabras) | Relleno quitado |
| t2023-impuestos-sumar-1 | Hacer más progresivo el impuesto sobre la renta (IRPF). Habría más tramos a partir de 120.000 euros, y el tipo máximo subiría del 45 % actual al 52 % para rentas desde 300.000 euros. | Crear en el impuesto sobre la renta (IRPF) más tramos desde 120.000 euros y subir el tipo máximo del 45 % al 52 % desde 300.000 euros. (25 palabras) | Verbo de marco quitado; Equilibrio |
| t2023-impuestos-sumar-2 | Hacer permanente un impuesto a las grandes fortunas y reforzar su progresividad. Los patrimonios más altos pagarían tipos de, al menos, el 4 %. Afectaría a las personas con grandes patrimonios. | Hacer permanente un impuesto a las grandes fortunas y reforzar su progresividad, con tipos de al menos el 4 % para los patrimonios más altos. (24 palabras) | Relleno quitado |
| t2023-impuestos-erc-1 | Proponer subir en el impuesto sobre la renta (IRPF) los tipos de las rentas del capital, como intereses o dividendos. Además, crear nuevos tramos adicionales para las rentas más altas. | Subir en el impuesto sobre la renta (IRPF) los tipos de las rentas del capital y crear nuevos tramos para las rentas más altas. (24 palabras) | Verbo de marco quitado |
| t2023-impuestos-erc-2 | Convertir en permanentes los impuestos extraordinarios a la banca y a las energéticas. La mitad de lo recaudado, el 50 %, iría directamente a las comunidades autónomas, porque son las principales responsables del gasto social. | Convertir en permanentes los impuestos extraordinarios a la banca y a las energéticas. El 50 % de lo recaudado iría directamente a las comunidades autónomas. (24 palabras) | Justificación quitada |
| t2023-impuestos-junts-1 | Revisar y reequilibrar lo que pagan las rentas del trabajo en el impuesto sobre la renta (IRPF). El motivo es que estas rentas soportan la mayor parte de la presión fiscal. | Revisar y reequilibrar lo que pagan las rentas del trabajo en el impuesto sobre la renta (IRPF). (17 palabras) | Justificación quitada |
| t2023-impuestos-junts-2 | Bajar del 25 % al 20 % el tipo del impuesto de sociedades para las pequeñas y medianas empresas. Compensaría la rebaja de 5 puntos que la última reforma aplicó a las grandes empresas. | Bajar del 25 % al 20 % el tipo del impuesto de sociedades para las pequeñas y medianas empresas. (17 palabras) | Justificación quitada |
| t2023-impuestos-pnv-1 | Proponer revisar la lista de bienes y servicios del impuesto sobre el valor añadido (IVA) y sus tipos. El objetivo es evitar desigualdades: según estudios, es el impuesto que más las aumenta. | Revisar la lista de bienes y servicios del impuesto sobre el valor añadido (IVA) y sus tipos general, reducido y superreducido. (21 palabras) | Verbo de marco quitado; Justificación quitada |
| t2023-impuestos-pnv-2 | Luchar contra el fraude y la evasión fiscal para repartir las cargas fiscales de forma más equitativa. Se facilitaría la cooperación entre las distintas haciendas del Estado. También combatir y erradicar la economía sumergida. | Luchar contra el fraude y la evasión fiscal, facilitando la cooperación entre las distintas haciendas del Estado. (17 palabras) | Justificación quitada; Una medida |
| t2023-impuestos-bildu-1 | Aumentar la carga impositiva y hacer permanentes los impuestos a la banca, las energéticas y las grandes fortunas. Se respetaría la competencia de las haciendas forales para gestionarlos y recaudarlos. | Aumentar la carga impositiva y hacer permanentes los impuestos a la banca, a las energéticas y a las grandes fortunas. (20 palabras) | Caso concreto quitado |
| t2023-impuestos-bildu-2 | Aprobar un impuesto especial sobre los beneficios de las grandes cadenas que distribuyen alimentos. Afectaría a las grandes empresas de distribución alimentaria, como las cadenas de supermercados. | Aprobar un impuesto especial sobre los beneficios de las grandes cadenas de distribución de alimentos. (15 palabras) | Relleno quitado |
| t2023-impuestos-bng-1 | Fijar tipos distintos en el impuesto sobre la renta (IRPF) según el origen de los ingresos. Los del trabajo pagarían menos y los que vienen del capital, como intereses o dividendos, pagarían más. | Fijar en el impuesto sobre la renta (IRPF) tipos distintos según el origen de los ingresos: menos para el trabajo y más para el capital. (25 palabras) | Equilibrio |
| t2023-impuestos-bng-2 | Hacer permanente la rebaja al 5 % del impuesto sobre el valor añadido (IVA) de la electricidad, el gas, la biomasa para calefacción y la leña. También se mantendría la rebaja del resto de suministros básicos. | Hacer permanente la rebaja al 5 % del impuesto sobre el valor añadido (IVA) de la electricidad, el gas, la biomasa para calefacción y la leña. También la del resto de suministros básicos. (32 palabras) | Equilibrio |
| t2023-inmigracion-pp-1 | Reforzar la inspección en las fronteras con más personal y mejor formado. También impulsar los nuevos sistemas europeos de registro de entradas y salidas y de autorización de viaje, y colaborar con la agencia europea de fronteras. | Reforzar la inspección en las fronteras con más personal y mejor formado. También impulsar los nuevos registros europeos de entradas y salidas de viajeros. (24 palabras) | Una medida; Equilibrio |
| t2023-inmigracion-pp-2 | Agilizar las órdenes de retorno de inmigrantes irregulares y la expulsión de quienes hayan cometido delitos. Se haría con mejores acuerdos con países de origen y tránsito, para prevenir amenazas a la seguridad y evitar que se animen nuevas llegadas. | Agilizar las órdenes de retorno de inmigrantes irregulares y la expulsión de quienes hayan cometido delitos. Se haría con mejores acuerdos con los países de origen o de tránsito. (29 palabras) | Justificación quitada |
| t2023-inmigracion-psoe-1 | Potenciar una estrategia para desmantelar las mafias que trafican con seres humanos. Se actuaría en los países de origen, de donde salen las personas que migran hacia España. | Potenciar una estrategia para desmantelar las mafias que trafican con seres humanos en los países de origen. (17 palabras) | Relleno quitado |
| t2023-inmigracion-psoe-2 | Habilitar mejores vías de migración regular y ordenada que faciliten la integración social y laboral de las personas migrantes. Se impulsarían convenios de migración circular, de trabajo temporal y regreso, como los que ya funcionan. | Habilitar mejores vías de migración regular y ordenada, fomentando convenios de migración circular como los que ya funcionan. (18 palabras) | Justificación quitada |
| t2023-inmigracion-vox-1 | Expulsar de inmediato a todos los inmigrantes que entren en España de forma irregular. La medida se aplicaría a cualquier persona que acceda al país sin cumplir los requisitos legales. | Expulsar de forma inmediata a todas las personas inmigrantes que entren de forma irregular en España. (16 palabras) | Relleno quitado |
| t2023-inmigracion-vox-2 | Trasladar el mensaje claro de que cualquier inmigrante que llegue a España de forma irregular nunca podrá regularizar su situación. Afectaría a todas las llegadas sin permiso. | Trasladar el mensaje claro de que cualquier inmigrante que llegue a España de forma irregular nunca podrá regularizar su situación. (20 palabras) | Relleno quitado |
| t2023-inmigracion-sumar-1 | Castigar como delito la devolución sumaria en frontera y derogar la norma que la permite. Y financiar un control independiente de derechos humanos en la frontera sur, para evitar casos como Melilla en 2022 y depurar responsabilidades. | Convertir en delito la devolución sumaria en la frontera y suprimir la disposición de la ley de extranjería que permite esta práctica. (22 palabras) | Una medida; Caso concreto quitado |
| t2023-inmigracion-sumar-2 | Reformar la ley orgánica sobre derechos y libertades de los extranjeros y su integración social para que priorice el reconocimiento de derechos. Además, introduciría un procedimiento de regularización permanente. | Reformar la ley de extranjería para que dé prioridad al reconocimiento de derechos e introduzca un procedimiento de regularización permanente. (20 palabras) | Relleno quitado |
| t2023-inmigracion-erc-1 | Acabar con las llamadas devoluciones en caliente, es decir, devolver de inmediato a migrantes en la frontera sin las garantías de un procedimiento. Afecta a quienes intentan entrar en España sin permiso. | Acabar con las devoluciones en caliente y eliminar el mecanismo específico de devoluciones y expulsiones en Ceuta y Melilla. (19 palabras) | Tarjeta compartida separada; Justificación quitada |
| t2023-inmigracion-junts-1 | Acabar con las llamadas devoluciones en caliente, es decir, devolver de inmediato a migrantes en la frontera sin las garantías de un procedimiento. Afecta a quienes intentan entrar en España sin permiso. | Eliminar las devoluciones en caliente derogando la disposición adicional 10.ª de la Ley Orgánica 4/2000 sobre derechos y libertades de los extranjeros. (23 palabras) | Tarjeta compartida separada |
| t2023-inmigracion-bildu-1 | Acabar con las llamadas devoluciones en caliente, es decir, devolver de inmediato a migrantes en la frontera sin las garantías de un procedimiento. Afecta a quienes intentan entrar en España sin permiso. | Exigir el fin de las devoluciones en caliente, tanto por vía terrestre como por vía marítima. (16 palabras) | Tarjeta compartida separada |
| t2023-inmigracion-erc-2 | Establecer vías legales y seguras para entrar en España. Así se garantizaría que las personas desplazadas a la fuerza puedan circular libremente y pedir asilo, ante las vulneraciones actuales de ese derecho. | Establecer vías legales y seguras de entrada a España que garanticen la libre circulación y el asilo de las personas desplazadas a la fuerza. (24 palabras) | Justificación quitada |
| t2023-inmigracion-junts-2 | Trabajar para articular vías legales y seguras de migración regular y movilidad. Buscar también soluciones para las personas que están en el territorio sin su situación administrativa resuelta. | Buscar vías de solución para las personas que están en el territorio sin su situación administrativa resuelta. (17 palabras) | Una medida |
| t2023-inmigracion-bildu-2 | Exigir la derogación de la ley de extranjería y sustituirla por una nueva ley. Esta respetaría y garantizaría todos los derechos humanos y civiles de las personas migrantes y su acceso a los servicios públicos básicos. | Exigir que se derogue la ley de extranjería y se sustituya por una nueva. Esta garantizaría todos los derechos humanos y civiles de las personas migrantes y su acceso a los servicios públicos básicos. (34 palabras) | Sin cambios de fondo |
| t2023-inmigracion-pnv-1 | Volver a plantear la reforma de la ley de extranjería. El fin es poder comprobar que se cumplen los tratados de derechos humanos cuando se rechaza en la frontera a migrantes y solicitantes de asilo. | Volver a plantear la reforma de la ley de extranjería para comprobar que se cumplen los tratados de derechos humanos en los rechazos en frontera. (25 palabras) | Equilibrio |
| t2023-inmigracion-pnv-2 | Adoptar medidas para repartir de forma equitativa a los menores migrantes que llegan sin familia. El reparto incluiría también a las personas que piden asilo. | Adoptar medidas para repartir de forma equitativa a los menores migrantes no acompañados y a las personas que piden asilo. (20 palabras) | Relleno quitado |
| t2023-inmigracion-bng-1 | Cerrar los centros de internamiento de extranjeros (CIE) y poner fin a las deportaciones. Se garantizaría el respeto estricto de los derechos humanos de migrantes, refugiados y solicitantes de asilo. | Cerrar los centros de internamiento de extranjeros (CIE) en España y poner fin a las expulsiones. (16 palabras) | Justificación quitada |
| t2023-inmigracion-bng-2 | Impulsar reformas legales para garantizar los derechos de la población migrante, como vivienda, trabajo, sanidad o educación. También favorecer y facilitar los procesos de regularización administrativa. | Impulsar las reformas legales necesarias para garantizar los derechos de la población migrante, como vivienda, trabajo, sanidad o educación. (19 palabras) | Una medida |
| t2023-inmigracion-cc-1 | Pedir al Gobierno de España que impulse en la Unión Europea más cooperación con los países de origen y tránsito. El objetivo es combatir la inmigración irregular. | Pedir al Gobierno de España que impulse en la Unión Europea más cooperación con los países de origen y tránsito contra la inmigración irregular. (24 palabras) | Relleno quitado |
| t2023-inmigracion-cc-2 | Pedir al Gobierno de España que promueva en la Unión Europea más coordinación entre los Estados miembros en el rescate de inmigrantes en el mar. La Unión debería apoyar más y de forma directa a los Estados en esta materia. | Pedir al Gobierno de España que promueva en la Unión Europea más coordinación entre los Estados miembros en el rescate de inmigrantes en el mar. (25 palabras) | Una medida |
| t2023-empleo-pp-1 | Actualizar el salario mínimo interprofesional (SMI) en el marco del diálogo social. Se involucraría a sindicatos, empresarios y personas expertas en la toma de decisiones sobre el SMI. | Actualizar el salario mínimo interprofesional (SMI) dentro del diálogo social, con participación de sindicatos, empresarios y expertos. (17 palabras) | Equilibrio |
| t2023-empleo-pp-2 | Aprobar la tarifa 0 para nuevos autónomos durante su primer año, es decir, sin pagar cuota a la Seguridad Social. Busca dar flexibilidad y sostenibilidad financiera a los trabajadores autónomos. | Aprobar una tarifa 0 para los nuevos autónomos durante su primer año, es decir, sin pagar cuota a la Seguridad Social. (21 palabras) | Justificación quitada |
| t2023-empleo-psoe-1 | Garantizar en el Estatuto de los Trabajadores que el salario mínimo interprofesional (SMI) se ajuste al 60 % del salario medio. También ayudaría a lograr la igualdad salarial entre hombres y mujeres. | Garantizar en el Estatuto de los Trabajadores que el salario mínimo interprofesional (SMI) se ajuste al 60 % del salario medio. (20 palabras) | Justificación quitada |
| t2023-empleo-psoe-2 | Poner en marcha un plan nacional para que las empresas ofrezcan mejor conciliación. Incluiría jornadas que combinen trabajo presencial y a distancia, horarios más adaptables y la posibilidad de concentrar la semana laboral en cuatro días. | Poner en marcha un plan nacional para que las empresas ofrezcan mejor conciliación. Incluiría jornadas que combinen presencia y teletrabajo, horarios más adaptables y la opción de concentrar la semana laboral en cuatro días. (34 palabras) | Sin cambios de fondo |
| t2023-empleo-vox-1 | Impulsar la subida de todos los salarios, sobre todo los más bajos. Para evitar que se destruya empleo, se reducirían de forma drástica las cargas y la regulación sobre las empresas. | Impulsar la subida de todos los salarios, sobre todo los más bajos, y reducir en gran medida las cargas y las normas para las empresas. (25 palabras) | Justificación quitada |
| t2023-empleo-vox-2 | Reducir las cotizaciones a las empresas que contraten de forma indefinida a trabajadores españoles. Los nuevos empleos tendrían una bonificación del 100 % el primer año y del 50 % el segundo, sea cual sea la edad. | Bonificar las cotizaciones de las empresas que contraten de forma indefinida a trabajadores españoles: el 100 % el primer año y el 50 % el segundo, a cualquier edad. (27 palabras) | Verbo de marco quitado |
| t2023-empleo-sumar-1 | Reducir la jornada laboral sin bajar el salario. En 2024 se fijaría por ley un máximo de 37,5 horas semanales y se abriría un diálogo social para seguir reduciéndola hasta 32 horas. | Fijar por ley en 2024 una jornada máxima de 37,5 horas sin bajar el salario. Después, abrir un diálogo social para reducirla hasta 32 horas semanales. (26 palabras) | Equilibrio |
| t2023-empleo-sumar-2 | Subir el salario mínimo interprofesional (SMI) por encima del índice de precios de consumo (IPC) cada año. Así quienes lo cobran seguirían ganando poder adquisitivo. | Subir cada año el salario mínimo interprofesional (SMI) por encima del índice de precios de consumo (IPC). (17 palabras) | Justificación quitada |
| t2023-empleo-erc-1 | Subir el salario mínimo interprofesional a 1.250 euros y fijar una escala salarial 1/12: el sueldo más alto no superaría doce veces el más bajo. Busca el pleno empleo, menos desigualdad y acabar con la brecha salarial. | Subir el salario mínimo interprofesional a 1.250 euros y fijar una escala salarial 1/12: el sueldo más alto no superaría doce veces el más bajo. (26 palabras) | Justificación quitada |
| t2023-empleo-erc-2 | Recuperar una indemnización mínima de 45 días de salario por año trabajado, con un tope de 42 mensualidades, en los despidos improcedentes. La ley permitiría subirla según cada caso, como prevé el artículo 24 de la Carta Social Europea. | Recuperar una indemnización mínima de 45 días de salario por año trabajado, con un tope de 42 mensualidades, en los despidos improcedentes. La ley permitiría aumentarla según cada caso, de acuerdo con el artículo 24 de la Carta Social Europea. (40 palabras) | Sin cambios de fondo |
| t2023-empleo-junts-1 | Subir el salario mínimo interprofesional de los 1.080 euros actuales a 1.319 euros, la cifra del salario medio europeo. Además, el gobierno autonómico debería poder fijarlo en su territorio. | Subir el salario mínimo interprofesional de los 1.080 euros actuales hasta los 1.319 euros del salario medio europeo. (18 palabras) | Una medida; Caso concreto quitado |
| t2023-empleo-junts-2 | Establecer una tarifa cero en la cuota para los autónomos no habituales y para los que tienen ingresos bajos. Por ejemplo, los que ingresan menos que el salario mínimo interprofesional. | Establecer una tarifa cero para los autónomos no habituales y para los que tienen ingresos bajos. Por ejemplo, ingresos inferiores al salario mínimo interprofesional. (24 palabras) | Relleno quitado |
| t2023-empleo-pnv-1 | Un pacto por el empleo entre instituciones, empresas y sindicatos que avance en empleo estable, formación continua y competitividad. Incluiría mecanismos para vincular los salarios a la productividad, protegiendo los derechos de las personas trabajadoras. | Impulsar mecanismos que vinculen los salarios a la productividad, protegiendo los derechos de los trabajadores, dentro de un pacto por el empleo. (22 palabras) | Una medida; Justificación quitada |
| t2023-empleo-pnv-2 | Mejorar la protección por desempleo ampliando su duración hasta un máximo de 36 meses. Las ayudas se vincularían a participar en procesos para mejorar la empleabilidad. | Ampliar la duración de la prestación por desempleo hasta un máximo de 36 meses, vinculando las ayudas a participar en procesos para mejorar la empleabilidad. (25 palabras) | Sin cambios de fondo |
| t2023-empleo-bildu-1 | Reducir la jornada laboral a 32 horas semanales sin bajar el salario ni cambiar las condiciones de trabajo. Responde a lo que pide la mayoría sindical de su comunidad. | Reducir la jornada laboral a 32 horas semanales sin bajar el salario ni cambiar las condiciones de trabajo. (18 palabras) | Justificación quitada; Caso concreto quitado |
| t2023-empleo-bildu-2 | Aplicar medidas específicas para mujeres y jóvenes que reduzcan la brecha salarial que sufren. También buscarían reducir la precariedad, la temporalidad y el trabajo a tiempo parcial frecuentes en estos grupos. | Aplicar medidas específicas para mujeres y jóvenes contra la brecha salarial, la precariedad, la temporalidad y la parcialidad que sufren. (20 palabras) | Relleno quitado |
| t2023-empleo-bng-1 | Promover la implantación de una jornada laboral de 35 horas semanales, sin reducir el salario. Es decir, trabajar menos horas a la semana cobrando lo mismo que ahora. | Promover la implantación de una jornada laboral de 35 horas semanales sin que se reduzca el salario. (17 palabras) | Relleno quitado |
| t2023-empleo-bng-2 | Eliminar las empresas de trabajo temporal (ETT), la subcontratación en cadena y los falsos autónomos. Son personas que trabajan como autónomas aunque en realidad dependen de una sola empresa. | Eliminar las empresas de trabajo temporal (ETT), la subcontratación en cadena y los falsos autónomos. (15 palabras) | Relleno quitado |
| t2023-empleo-cc-1 | Pedir bonificaciones en la cuota empresarial de la Seguridad Social por contratos indefinidos. Se aplicarían a jóvenes de 16 a 30 años, mayores de 45 años y mujeres en ocupaciones donde están poco representadas. | Pedir bonificaciones en las cotizaciones empresariales por contratos indefinidos de jóvenes de 16 a 30, mayores de 45 y mujeres poco representadas en su ocupación. (25 palabras) | Equilibrio |
| t2023-empleo-cc-2 | Defender que se mantengan los incentivos a la contratación indefinida de jóvenes por parte de microempresas y autónomos. También los incentivos al emprendimiento joven, al primer empleo joven y a los contratos en prácticas. | Defender que se mantengan los incentivos a la contratación indefinida de jóvenes por parte de microempresas y autónomos. (18 palabras) | Una medida |
| t2023-pensiones-pp-1 | Garantizar la revalorización de las pensiones en el marco del Pacto de Toledo. Es el acuerdo parlamentario que orienta las reformas del sistema de pensiones. | Garantizar la revalorización de las pensiones en el marco del Pacto de Toledo, el acuerdo parlamentario sobre el sistema de pensiones. (21 palabras) | Equilibrio |
| t2023-pensiones-pp-2 | Impulsar que la pensión dependa más de lo cotizado y dar más transparencia al sistema. Así todos los trabajadores podrían consultar con más sencillez una estimación de su pensión futura. | Impulsar la contributividad del sistema de pensiones, es decir, que la pensión dependa más de lo cotizado durante la vida laboral. (21 palabras) | Una medida |
| t2023-pensiones-psoe-1 | Garantizar mediante un cambio en la Constitución el poder adquisitivo de las pensiones. Todas se revalorizarían según el índice de precios de consumo (IPC) en cualquier circunstancia. | Reformar la Constitución para que todas las pensiones se revaloricen siempre según el índice de precios de consumo (IPC). (19 palabras) | Verbo de marco quitado |
| t2023-pensiones-psoe-2 | Rellenar el fondo de reserva de la Seguridad Social, conocido como la hucha de las pensiones. En 2027 tendría más de 20.000 millones de euros. | Rellenar el fondo de reserva de la Seguridad Social, la hucha de las pensiones, hasta superar los 20.000 millones de euros en 2027. (23 palabras) | Relleno quitado |
| t2023-pensiones-vox-1 | Dejar exentas del impuesto sobre la renta (IRPF) las pensiones contributivas. El motivo es que quienes las cobran ya pagaron impuestos durante toda su vida laboral. | Eximir a las pensiones contributivas de pagar el impuesto sobre la renta de las personas físicas (IRPF). (17 palabras) | Justificación quitada |
| t2023-pensiones-vox-2 | Asegurar la sostenibilidad de las pensiones desmontando el sistema autonómico. Se eliminarían duplicidades y habría menos ministerios, consejerías, diputados y parlamentos. También se acabaría con lo que la propuesta llama despilfarro político. | Crear un programa de desgravaciones fiscales para jubilados y mayores de 65 años que paguen gastos de familiares menores de 35: sanidad, estudios, deporte o su primera vivienda. (28 palabras) | Nueva reserva (cita nueva) |
| t2023-pensiones-sumar-1 | Subir las pensiones mínimas y las no contributivas por encima del índice de precios de consumo (IPC). Seguirían subiendo así hasta llegar, al menos, al umbral de la pobreza. | Subir las pensiones mínimas y no contributivas por encima del índice de precios de consumo (IPC) hasta llegar, al menos, al umbral de la pobreza. (25 palabras) | Relleno quitado |
| t2023-pensiones-sumar-2 | Impulsar una reforma de la Constitución que garantice con solidez los derechos sociales. En concreto, el derecho a la Seguridad Social quedaría protegido de forma especial en el texto constitucional. | Impulsar una reforma constitucional que garantice con solidez los derechos sociales y, en concreto, que proteja de forma especial el derecho a la Seguridad Social. (25 palabras) | Relleno quitado |
| t2023-pensiones-erc-1 | Subir las pensiones mínimas y revalorizarlas de forma automática según la evolución del salario mínimo interprofesional. Así se cumplirían las exigencias de la Carta Social Europea. | Subir las pensiones mínimas y revalorizarlas de forma automática según la evolución del salario mínimo interprofesional. (16 palabras) | Justificación quitada |
| t2023-pensiones-erc-2 | Bajar la edad ordinaria de jubilación a los 65 años, sin exigir para ello ningún mínimo de cotización. Afectaría a todas las personas que se jubilan. | Bajar la edad ordinaria de jubilación a los 65 años, sin exigir ningún mínimo de cotización. (16 palabras) | Relleno quitado |
| t2023-pensiones-junts-1 | Avanzar hacia la convergencia entre el salario mínimo interprofesional vigente y la pensión mínima contributiva. La idea es que la pensión es el salario de las personas jubiladas. | Avanzar hacia la convergencia entre el salario mínimo interprofesional vigente y la pensión mínima contributiva. (15 palabras) | Justificación quitada |
| t2023-pensiones-junts-2 | Seguir mejorando las bases reguladoras de las pensiones no contributivas hasta el 75 % para rentas bajas. También mejorar la fiscalidad de las pensiones que se cobran junto con un sueldo. | Seguir mejorando las bases reguladoras de las pensiones no contributivas, hasta el 75 % para las rentas bajas. (17 palabras) | Una medida |
| t2023-pensiones-pnv-1 | Defender que las pensiones se revaloricen según el índice de precios de consumo (IPC). Se busca que la revalorización sea irreversible y no pueda dar marcha atrás. | Defender que las pensiones se revaloricen según el índice de precios de consumo (IPC) y que esa revalorización no pueda dar marcha atrás. (23 palabras) | Relleno quitado |
| t2023-pensiones-pnv-2 | Reformar la ley general de la Seguridad Social para limitar el uso libre del fondo de reserva de las pensiones. Se recuperaría el tope del 3 % y solo podría usarse en casos excepcionales con controles extraordinarios. | Reformar la ley general de la Seguridad Social para limitar el uso libre del fondo de reserva de las pensiones, recuperando el tope del 3 %. (25 palabras) | Equilibrio |
| t2023-pensiones-bildu-1 | Subir de inmediato las pensiones mínimas hasta 1.080 euros. Además, que su comunidad pueda complementarlas con recursos propios, aplicando la Carta Social Europea para que sean suficientes. | Aumentar de manera inmediata la cuantía de las pensiones mínimas hasta llegar a los 1.080 euros. (16 palabras) | Una medida; Caso concreto quitado |
| t2023-pensiones-bildu-2 | Rechazar cualquier aumento de la edad de jubilación y cualquier ampliación del periodo de años que se usa para calcular la pensión. Afectaría a quienes se jubilen en el futuro. | Rechazar cualquier aumento de la edad de jubilación o del número de años que se usan para calcular la pensión. (20 palabras) | Relleno quitado |
| t2023-pensiones-bng-1 | Subir las pensiones mínimas hasta situarlas en el 60 % del salario medio. Afectaría a las personas que hoy cobran las pensiones más bajas del sistema público. | Subir la cuantía de las pensiones mínimas hasta situarla en el 60 % del salario medio. (15 palabras) | Relleno quitado |
| t2023-pensiones-bng-2 | Recuperar la jubilación ordinaria a los 65 años y la jubilación parcial a los 61 años. Afectaría a las personas trabajadoras cercanas a la jubilación. | Recuperar la jubilación ordinaria a los 65 años y la jubilación parcial a los 61 años. (16 palabras) | Relleno quitado |
| t2023-pensiones-cc-1 | Defender la sostenibilidad de las pensiones públicas. Las pensiones se actualizarían según el coste de la vida y se reduciría la brecha de género. Se financiarían con los Presupuestos Generales del Estado para dar certidumbre. | Garantizar que las pensiones públicas se actualicen según el coste de la vida, financiándolas con los Presupuestos Generales del Estado. (20 palabras) | Una medida |
| t2023-pensiones-cc-2 | Apoyar un pacto de Estado firmado por todos los partidos del Parlamento y con los actores sociales. Se tramitaría en la comisión del Pacto de Toledo y garantizaría pensiones suficientes y sostenibles ahora y en el futuro. | Apoyar un pacto de Estado de pensiones con todos los partidos parlamentarios y los actores sociales, tramitado en la comisión del Pacto de Toledo. (24 palabras) | Justificación quitada |
| t2023-sanidad-pp-1 | Promover un plan de choque en atención primaria. Su objetivo es resolver la falta de especialistas en este nivel de atención, como médicos de familia y pediatras. | Promover un plan urgente en los centros de salud para resolver la falta de especialistas en atención primaria. (18 palabras) | Contexto añadido quitado |
| t2023-sanidad-pp-2 | Impulsar junto con las comunidades autónomas 1.000 plazas más de formación en medicina familiar en la oferta de 2024. Así habría más médicos de familia en formación. | Impulsar con las comunidades autónomas 1.000 plazas más de formación en medicina familiar en la oferta de 2024. (18 palabras) | Relleno quitado |
| t2023-sanidad-psoe-1 | Acabar con las listas de espera fijando por ley tiempos máximos en la sanidad pública: 120 días para operaciones, 60 para consultas de especialistas y 30 para pruebas, con independencia del lugar de residencia. | Fijar por ley tiempos máximos de espera en la sanidad pública: 120 días para operar, 60 para consultas de especialistas y 30 para pruebas, en todo el país. (28 palabras) | Verbo de marco quitado |
| t2023-sanidad-psoe-2 | Establecer tiempos máximos de espera garantizados en la atención a la salud mental. Para los menores de 21 años, la espera máxima sería de 15 días. | Garantizar tiempos máximos de espera en la atención a la salud mental, con un máximo de 15 días para menores de 21 años. (23 palabras) | Sin cambios de fondo |
| t2023-sanidad-vox-1 | Reducir el volumen y el tiempo de las listas de espera en todos los ámbitos. Se incentivaría a los centros públicos para reducirlas y se reforzarían los conciertos con la sanidad privada. | Reducir las listas de espera en volumen y tiempo en todos los ámbitos, con incentivos a los centros públicos y más conciertos con centros privados. (25 palabras) | Sin cambios de fondo |
| t2023-sanidad-vox-2 | Aumentar la inversión en atención primaria, reforzando la atención rural y las zonas más saturadas. Se potenciaría la atención presencial y a domicilio, y la digitalización para reducir la burocracia. | Aumentar la inversión en atención primaria, reforzando la atención rural y las zonas más saturadas. (15 palabras) | Una medida |
| t2023-sanidad-sumar-1 | Aprobar una ley de listas de espera que fije tiempos máximos. También crearía un registro homogéneo, transparente y fiable de las listas de espera en todo el país. | Aprobar una ley de listas de espera con tiempos máximos y un registro homogéneo, transparente y fiable de las listas en todo el país. (24 palabras) | Equilibrio |
| t2023-sanidad-sumar-2 | Garantizar el carácter público del Sistema Nacional de Salud, impidiendo las formas de gestión privatizadas. Un plan de desprivatización incluiría servicios como limpieza, hostelería o lavandería, para garantizar una atención de calidad. | Garantizar el carácter público del Sistema Nacional de Salud, impidiendo las formas de gestión privatizadas. (15 palabras) | Una medida |
| t2023-sanidad-erc-1 | Promover políticas contra la falta de profesionales especialistas. Por ejemplo, regular la acreditación en cuidados paliativos y flexibilizar la jubilación de los profesionales. También mejorar la elección de plazas de formación y la acreditación en enfermería. | Promover políticas contra la falta de profesionales especialistas, como flexibilizar su jubilación o regular la acreditación en cuidados paliativos. (19 palabras) | Una medida |
| t2023-sanidad-erc-2 | Incorporar nuevas prestaciones y fármacos a la cartera de servicios de ámbito estatal. El motivo es que después son las comunidades autónomas las que deben financiarlos. | Incorporar nuevas prestaciones y nuevos fármacos a la cartera de servicios sanitarios de ámbito estatal. (15 palabras) | Justificación quitada |
| t2023-sanidad-junts-1 | Poder ampliar el número de plazas de médico interno residente (MIR), que forman especialistas. Así el sistema público de salud de su comunidad tendría suficientes médicos especialistas. | Poder ampliar el número de plazas de médico interno residente (MIR) para que el sistema público de salud autonómico tenga especialistas. (21 palabras) | Relleno quitado |
| t2023-sanidad-junts-2 | Reformar la ley que ordena las profesiones sanitarias, que tiene 20 años y ha quedado obsoleta. Habría que revisar las competencias profesionales e incluir nuevas profesiones, como bioingenieros o bioinformáticos. | Reformar la ley de ordenación de las profesiones sanitarias para revisar las competencias profesionales e incluir nuevas profesiones, como bioingenieros o bioinformáticos. (22 palabras) | Justificación quitada |
| t2023-sanidad-pnv-1 | Proponer cambios en el sistema de médico interno residente (MIR) para ajustar las plazas y que no queden vacantes. También facilitar los trámites para acreditar las unidades docentes que forman especialistas. | Cambiar el sistema de formación de médico interno residente (MIR) para ajustar las plazas y que no queden vacantes. (19 palabras) | Verbo de marco quitado; Una medida |
| t2023-sanidad-pnv-2 | Impulsar la regulación del derecho al olvido oncológico. Las entidades financieras y aseguradoras no tendrían el historial médico de quien ha superado un cáncer al contratar un préstamo, un seguro o un crédito. | Impulsar la regulación del derecho al olvido oncológico: que bancos y aseguradoras no tengan el historial médico de quien ha superado un cáncer al contratar un préstamo, un seguro o un crédito. (32 palabras) | Sin cambios de fondo |
| t2023-sanidad-bildu-1 | Ampliar y asegurar la adjudicación de plazas de médico interno residente (MIR) para cubrir todas las necesarias. Se reforzaría en especial la atención primaria de los centros de salud. | Ampliar y asegurar la adjudicación de plazas de médico interno residente (MIR) para cubrir todas las necesarias y reforzar en especial la atención primaria. (24 palabras) | Relleno quitado |
| t2023-sanidad-bildu-2 | Derogar la Ley 15/1997 de gestión del sistema de salud. Esta ley permite privatizar y externalizar los servicios sanitarios. Afectaría a cómo se gestionan los servicios sanitarios públicos. | Derogar la Ley 15/1997 de gestión del sistema de salud, que permite privatizar y externalizar los servicios sanitarios. (19 palabras) | Relleno quitado |
| t2023-sanidad-bng-1 | Subir la financiación de la sanidad pública al menos hasta la media europea por habitante, valorando más la dispersión y el envejecimiento. Además, racionalizar el gasto en fármacos y que su comunidad participe en fijar su precio. | Aumentar la financiación de la sanidad pública hasta, como mínimo, la media de inversión por habitante de la Unión Europea. (20 palabras) | Una medida; Caso concreto quitado |
| t2023-sanidad-bng-2 | Modificar la ley que regula cuánto pagan los usuarios de la sanidad pública por sus medicamentos. El fin es acabar con el modelo actual de copagos y repagos. | Modificar la ley sobre lo que pagan los usuarios de la sanidad pública por sus medicamentos para acabar con los copagos y repagos. (23 palabras) | Justificación quitada |
| t2023-sanidad-cc-1 | Pedir que el Gobierno del Estado aumente la partida de dinero que transfiere a su comunidad autónoma. Así se seguiría impulsando la atención a la salud mental. | Pedir que el Gobierno central aumente la partida que transfiere a la comunidad autónoma para la atención a la salud mental. (21 palabras) | Relleno quitado |
| t2023-sanidad-cc-2 | Plantear que se detecte antes al alumnado en situación socialmente vulnerable y que reciba apoyo y refuerzo educativo de forma preventiva. También aumentar el número de profesionales de salud mental. | Defender un nuevo modelo de financiación sanitaria. La obligación constitucional del Estado de financiar la sanidad sería más transparente y específica, sin diluirse en la financiación autonómica. (27 palabras) | Nueva reserva (cita nueva) |
| t2023-impuestos-cc-1 | Proponer ampliar durante diez años la bonificación del 60 % en el impuesto sobre la renta (IRPF) para los residentes de una isla concreta. Busca contribuir a su recuperación económica y social. | (retirada) | Retirada: «una isla concreta» cambia el sentido de una medida pensada para La Palma. CC queda sin propuesta neutralizable en impuestos. |
| t2023-inmigracion-erc-junts-bildu-1 | Acabar con las llamadas devoluciones en caliente, es decir, devolver de inmediato a migrantes en la frontera sin las garantías de un procedimiento. Afecta a quienes intentan entrar en España sin permiso. | (retirada) | Separada en tres tarjetas (ERC, Junts y Bildu), cada una con su cita, su página y su enlace. |

### Tercera pasada: comprobaciones con agentes

Cambios decididos por el responsable del proyecto a partir de datos/banco/ia/PRUEBA-AGENTES.md y REVISION-IA.md. Se cambiaron 16 tarjetas.

| Tarjeta | Antes | Después | Motivo |
| --- | --- | --- | --- |
| t2023-vivienda-sumar-2 | Fijar en zonas tensionadas precios de referencia del alquiler iguales al 30 % de la renta de los hogares. Quien los supere perdería deducciones del impuesto sobre la renta (IRPF) y las empresas, un recargo en sociedades. | Fijar en zonas tensionadas precios de referencia del alquiler del 30 % de la renta de los hogares. Superarlos quitaría deducciones del impuesto sobre la renta (IRPF) y supondría un recargo en sociedades para fondos y empresas. (36 palabras) | Prueba 2 (los tres revisores): la elipsis «y las empresas, un recargo» se leía al revés que la cita y omitía a los fondos. |
| t2023-vivienda-pnv-2 | Defender un equilibrio entre la persona inquilina y la propietaria que asegure los derechos de ambas partes. | Defender un equilibrio entre inquilinos y propietarios de vivienda que asegure los derechos de ambas partes. (16 palabras) | Prueba 2 (C): «la persona inquilina» se leía como rasgo de estilo. |
| t2023-impuestos-pp-2 | Simplificar el impuesto sobre la renta (IRPF) y el de sociedades para las pequeñas y medianas empresas. Sobre todo, para las que tienen pérdidas o aumentan su plantilla indefinida. | Eliminar el impuesto a las grandes fortunas, que pagan quienes tienen los patrimonios más altos. (15 palabras) | Prueba 2 (los tres revisores): faltaba la medida principal de la cita. |
| t2023-impuestos-psoe-1 | Aumentar en el impuesto sobre la renta (IRPF) el mínimo por hijos y por personas dependientes. | Aumentar en el impuesto sobre la renta (IRPF) el mínimo por descendientes y por personas dependientes. (16 palabras) | Prueba 2 (A): «hijos» estrechaba el alcance; «descendientes» es el término de la cita y del impuesto. |
| t2023-impuestos-vox-2 | Suprimir en toda España los impuestos sobre el patrimonio y sobre sucesiones y donaciones. También la plusvalía municipal, que cobran los ayuntamientos al vender un inmueble. | Suprimir en toda España los impuestos sobre el patrimonio y sobre sucesiones y donaciones. También la plusvalía municipal, que cobran los ayuntamientos cuando se vende, se hereda o se dona un inmueble urbano. (33 palabras) | Prueba 2 (A): la explicación «al vender un inmueble» era incompleta; la plusvalía municipal también se paga al heredar o donar. |
| t2023-inmigracion-pp-1 | Reforzar la inspección en las fronteras con más personal y mejor formado, e impulsar la implantación de los nuevos sistemas europeos de control fronterizo. | Reforzar la inspección en las fronteras con más personal y mejor formado. También impulsar los nuevos registros europeos de entradas y salidas de viajeros. (24 palabras) | Prueba 1 (T24): «la implantación de los nuevos sistemas europeos de control fronterizo» sonaba a lenguaje de gestión. |
| t2023-inmigracion-sumar-1 | Castigar como delito la devolución sumaria en la frontera y eliminar la disposición de la ley de extranjería que permite esta práctica. | Convertir en delito la devolución sumaria en la frontera y suprimir la disposición de la ley de extranjería que permite esta práctica. (22 palabras) | Prueba 1 (T3): «castigar como delito» se leía como desfavorable. La cita dice «tipificaremos el delito». |
| t2023-inmigracion-bng-1 | Cerrar los centros de internamiento de extranjeros (CIE) en España y poner fin a las deportaciones. | Cerrar los centros de internamiento de extranjeros (CIE) en España y poner fin a las expulsiones. (16 palabras) | Prueba 2 (A): «deportaciones» es un término marcado; «expulsiones» es el término legal y no cambia el sentido. |
| t2023-empleo-pp-1 | Actualizar el salario mínimo interprofesional (SMI) en el marco del diálogo social, involucrando a sindicatos, empresarios y personas expertas en las decisiones. | Actualizar el salario mínimo interprofesional (SMI) dentro del diálogo social, con participación de sindicatos, empresarios y expertos. (17 palabras) | Prueba 1 (T1): el gerundio «involucrando a…» delataba. Redacción decidida por el responsable del proyecto. |
| t2023-empleo-vox-1 | Impulsar la subida de todos los salarios, sobre todo los más bajos, reduciendo de forma drástica las cargas y la regulación sobre las empresas. | Impulsar la subida de todos los salarios, sobre todo los más bajos, y reducir en gran medida las cargas y las normas para las empresas. (25 palabras) | Prueba 1 (T18): «reduciendo de forma drástica» se leía como favorable y delataba. En la cita son dos frases y dos medidas; la rebaja no es el medio para subir sueldos, sino para no destruir empleo. |
| t2023-pensiones-pp-2 | Dar más transparencia y accesibilidad al sistema de pensiones, para que todos los trabajadores puedan consultar con más sencillez una estimación de su pensión futura. | Impulsar la contributividad del sistema de pensiones, es decir, que la pensión dependa más de lo cotizado durante la vida laboral. (21 palabras) | Prueba 2 (los tres revisores): faltaba la medida principal de la cita. |
| t2023-pensiones-psoe-1 | Reformar la Constitución para garantizar que todas las pensiones mantengan su poder adquisitivo según el índice de precios de consumo (IPC), en cualquier circunstancia. | Reformar la Constitución para que todas las pensiones se revaloricen siempre según el índice de precios de consumo (IPC). (19 palabras) | Prueba 1 (T20): «en cualquier circunstancia» se leía como favorable desde los dos lados. |
| t2023-sanidad-pp-1 | Promover un plan de choque en atención primaria para resolver la falta de especialistas en ese nivel asistencial. | Promover un plan urgente en los centros de salud para resolver la falta de especialistas en atención primaria. (18 palabras) | Prueba 1 (T11): «plan de choque» es expresión de campaña y «ese nivel asistencial» era jerga. Redacción decidida por el responsable del proyecto. |
| t2023-sanidad-vox-1 | Reducir las listas de espera en volumen y tiempo en todos los ámbitos. Para ello, incentivar a los centros públicos y reforzar los conciertos con la sanidad privada. | Reducir las listas de espera en volumen y tiempo en todos los ámbitos, con incentivos a los centros públicos y más conciertos con centros privados. (25 palabras) | Prueba 1 (T7): «Para ello» presentaba los conciertos con la privada como la solución. |
| t2023-sanidad-junts-1 | Poder ampliar el número de plazas de médico interno residente (MIR) para que el sistema público de salud de su comunidad tenga especialistas. | Poder ampliar el número de plazas de médico interno residente (MIR) para que el sistema público de salud autonómico tenga especialistas. (21 palabras) | Prueba 2 (A y B): «su comunidad» delataba a un partido de ámbito autonómico. |
| t2023-sanidad-cc-1 | Pedir que el Gobierno del Estado aumente la partida que transfiere a su comunidad autónoma para la atención a la salud mental. | Pedir que el Gobierno central aumente la partida que transfiere a la comunidad autónoma para la atención a la salud mental. (21 palabras) | Prueba 2 (A y B): «su comunidad autónoma» delataba; se quita el posesivo, como en Junts. Además, «el Gobierno del Estado» pasa a «el Gobierno central», la expresión neutra. |

### Cuarta pasada: revisión final con agentes

Cambios decididos por el responsable del proyecto a partir de datos/banco/ia/REVISION-FINAL.md. Se cambiaron 22 tarjetas; en dos temas la reserva pasa a test.

| Tarjeta | Antes | Después | Motivo |
| --- | --- | --- | --- |
| t2023-empleo-vox-1 | Impulsar la subida de todos los salarios, sobre todo los más bajos, y reducir en gran medida las cargas y las normas para las empresas. | Impulsar la subida de todos los salarios, sobre todo los más bajos, y reducir en gran medida las cargas y la regulación sobre las empresas. (25 palabras) | Revisión final (A, B, C): «las normas» ampliaba el alcance; «la regulación» es la palabra de la cita. |
| t2023-impuestos-bildu-1 | Aumentar la carga impositiva y hacer permanentes los impuestos a la banca, a las energéticas y a las grandes fortunas. | Subir y hacer permanentes los impuestos a la banca, a las energéticas y a las grandes fortunas. (17 palabras) | Revisión final (A, B, C): el genérico «aumentar la carga impositiva» iba delante de la medida. La medida es estatal; lo foral (quién gestiona y recauda) es secundario. |
| t2023-inmigracion-pnv-1 | Volver a plantear la reforma de la ley de extranjería para comprobar que se cumplen los tratados de derechos humanos en los rechazos en frontera. | Volver a plantear la reforma de la ley de extranjería. Fijaría cómo comprobar que los rechazos en frontera cumplen los tratados humanitarios y de derechos humanos. (26 palabras) | Revisión final (A, B, C): faltaban los tratados humanitarios y que la reforma fija procedimientos; sintaxis enrevesada. |
| t2023-inmigracion-pp-1 | Reforzar la inspección en las fronteras con más personal y mejor formado. También impulsar los nuevos registros europeos de entradas y salidas de viajeros. | Reforzar la inspección en las fronteras con más personal y mejor formado. También impulsar el nuevo registro europeo de entradas y salidas de viajeros. (24 palabras) | Revisión final (A, B): «los nuevos registros» en plural describía mal un solo sistema. |
| t2023-impuestos-bng-1 | Fijar en el impuesto sobre la renta (IRPF) tipos distintos según el origen de los ingresos: menos para el trabajo y más para el capital. | Fijar en el impuesto sobre la renta (IRPF) tipos distintos según el origen de los ingresos, bajando los del trabajo y subiendo los del capital. (25 palabras) | Revisión final (A, C): la cita dice «minorando… e aumentando», es decir, bajar y subir respecto a lo actual. |
| t2023-sanidad-vox-1 | Reducir las listas de espera en volumen y tiempo en todos los ámbitos, con incentivos a los centros públicos y más conciertos con centros privados. | Reducir las listas de espera en volumen y tiempo en todos los ámbitos. Se incentivaría a los centros públicos y se reforzarían los conciertos con la sanidad privada. (28 palabras) | Revisión final (A, C): «más conciertos» no es «reforzar» los conciertos. Con «la sanidad privada» la frase única pasaba de 25 palabras: se parte en dos, sin «Para ello». |
| t2023-sanidad-junts-1 | Poder ampliar el número de plazas de médico interno residente (MIR) para que el sistema público de salud autonómico tenga especialistas. | Obtener la competencia para ampliar el número de plazas de médico interno residente (MIR) y así dotar de especialistas al sistema público de salud autonómico. (25 palabras) | Revisión final (B, C): «Poder ampliar» no se entendía como verbo de medida; la cita se refiere a tener la capacidad de hacerlo. |
| t2023-pensiones-cc-1 | Garantizar que las pensiones públicas se actualicen según el coste de la vida, financiándolas con los Presupuestos Generales del Estado. | Garantizar que las pensiones públicas se actualicen según el coste de la vida, con medidas como financiarlas a través de los Presupuestos Generales del Estado. (25 palabras) | Revisión final (A): en la cita la financiación por los Presupuestos Generales es un ejemplo de decisión, no la forma de financiar. |
| t2023-empleo-erc-1 | Subir el salario mínimo interprofesional a 1.250 euros y fijar una escala salarial 1/12: el sueldo más alto no superaría doce veces el más bajo. | Subir el salario mínimo interprofesional (SMI), el sueldo más bajo que se puede pagar por ley, hasta los 1.250 euros. (20 palabras) | Revisión final (B): juntaba dos medidas; se recoge solo el salario mínimo. |
| t2023-empleo-junts-1 | Subir el salario mínimo interprofesional de los 1.080 euros actuales hasta los 1.319 euros del salario medio europeo. | Subir el salario mínimo interprofesional de 1.080 euros, el de 2023, hasta los 1.319 euros del salario medio europeo. (19 palabras) | Revisión final (B): «actuales» se quedaba anticuado; 1.080 euros era el salario mínimo de 2023. |
| t2023-inmigracion-pp-2 | Agilizar las órdenes de retorno de inmigrantes irregulares y la expulsión de quienes hayan cometido delitos. Se haría con mejores acuerdos con los países de origen o de tránsito. | Agilizar la ejecución de las órdenes de retorno de inmigrantes en situación irregular y de expulsión de quienes hayan cometido delitos. Se haría con mejores acuerdos con los países de origen o de tránsito. (34 palabras) | Revisión final (A, C): la cita agiliza el «cumplimiento» de las órdenes; «en situación irregular» en lugar de «irregulares». |
| t2023-empleo-pnv-2 | Ampliar la duración de la prestación por desempleo hasta un máximo de 36 meses, vinculando las ayudas a participar en procesos para mejorar la empleabilidad. | Ampliar la cobertura por desempleo hasta un máximo de 36 meses, vinculando las ayudas a participar en programas para encontrar trabajo. (21 palabras) | Revisión final (A, C): «cobertura» es más amplia que «prestación»; «empleabilidad» no se entendía. |
| t2023-vivienda-pp-2 | Movilizar el suelo público reservado a vivienda, sea cual sea su régimen jurídico, para promover viviendas en alquiler asequible. | Movilizar todo el suelo público destinado a vivienda pública para promover viviendas de alquiler asequible. (15 palabras) | Revisión final (A, C): «reservado a vivienda» ampliaba el alcance (la cita dice «redes públicas de vivienda»); «régimen jurídico» no se entendía. |
| t2023-inmigracion-erc-2 | Establecer vías legales y seguras de entrada a España que garanticen la libre circulación y el asilo de las personas desplazadas a la fuerza. | Establecer vías legales y seguras de entrada a España para las personas desplazadas a la fuerza. Servirían para garantizarles el acceso a la libre circulación y al derecho de asilo. (30 palabras) | Revisión final (A, C): la cita garantiza el «acceso» a la libre circulación y al asilo. |
| t2023-pensiones-pnv-2 | Reformar la ley general de la Seguridad Social para limitar el uso libre del fondo de reserva de las pensiones, recuperando el tope del 3 %. | Reformar la ley general de la Seguridad Social para impedir o limitar el uso libre del fondo de reserva de las pensiones. Para ello, recuperar el tope del 3 %. (29 palabras) | Revisión final (A, C): la cita dice «impedir o limitar». |
| t2023-sanidad-pnv-2 | Impulsar la regulación del derecho al olvido oncológico: que bancos y aseguradoras no tengan el historial médico de quien ha superado un cáncer al contratar un préstamo, un seguro o un crédito. | Impulsar la regulación del derecho al olvido oncológico. Las entidades financieras y aseguradoras no tendrían el historial médico de quien ha superado un cáncer al contratar préstamos, seguros o créditos. (30 palabras) | Revisión final (A): «bancos» era más estrecho que «entidades financieras». |
| t2023-inmigracion-cc-2 | Pedir al Gobierno de España que promueva en la Unión Europea más coordinación entre los Estados miembros en el rescate de inmigrantes en el mar. | Pedir al Gobierno de España que promueva en la Unión Europea más coordinación entre las políticas de los Estados miembros. Entre ellas, el rescate de inmigrantes en el mar. (29 palabras) | Revisión final (A): la cita pide coordinar las políticas en general, con el rescate en el mar como una de ellas. |
| t2023-inmigracion-psoe-2 | Habilitar mejores vías de migración regular y ordenada, fomentando convenios de migración circular como los que ya funcionan. | Habilitar mejores vías de migración regular y ordenada, fomentando convenios de migración circular: trabajo temporal en España y regreso al país de origen. (23 palabras) | Revisión final (C): «como los que ya funcionan» se leía como favorable y apuntaba a quien gobierna; se explica la migración circular. |
| t2023-empleo-bildu-2 | Aplicar medidas específicas para mujeres y jóvenes contra la brecha salarial, la precariedad, la temporalidad y la parcialidad que sufren. | Aplicar medidas específicas para mujeres y jóvenes contra la brecha salarial, la precariedad, la temporalidad y el trabajo a tiempo parcial. (21 palabras) | Revisión final (C): «que sufren» se leía como favorable; «parcialidad» no se entendía. |
| t2023-vivienda-bng-2 | Ampliar los criterios del recargo del impuesto sobre bienes inmuebles (IBI) para que se movilicen más viviendas vacías. | Ampliar los criterios del recargo del impuesto sobre bienes inmuebles (IBI) para que se pongan en uso más viviendas vacías. (20 palabras) | Revisión final (C): «se movilicen» no se entendía. |
| t2023-sanidad-pp-1 | Promover un plan urgente en los centros de salud para resolver la falta de especialistas en atención primaria. | Impulsar con las comunidades autónomas 1.000 plazas más de formación en medicina familiar en la oferta de 2024. (18 palabras) | (Intercambio de test y reserva.) Revisión final (B, C): la reserva trata lo mismo con cifra y plazo; «urgente» se leía como favorable. Pasa la reserva a test. |
| t2023-vivienda-erc-1 | Permitir, vía artículo 150.1 de la Constitución, que las comunidades con competencias en vivienda y derecho civil propio regulen todo el alquiler: precios, duración y prórrogas. | Recuperar la deducción en el impuesto sobre la renta (IRPF) por el alquiler de la vivienda habitual para los inquilinos. (20 palabras) | (Intercambio de test y reserva.) Revisión final (B, C): la tarjeta trataba de competencias, no del acceso a la vivienda; la reserva está en el eje. Pasa la reserva a test sin su segunda frase. |

### Equilibrio por partido (tarjetas de test)

«Con cifra o plazo»: el texto lleva un número o una expresión de tiempo. «Verbo blando»: empieza por estudiar, impulsar, promover, pedir, defender, abogar, potenciar, exigir, avanzar hacia, volver a plantear, revisar. «Obtener» no cuenta como blando.

| Partido | Tarjetas | Media de palabras | Con cifra o plazo | Verbo blando | Fuera de eje |
| --- | --- | --- | --- | --- | --- |
| PP | 6 | 19.7 | 2 | 1 | 1 |
| PSOE | 6 | 19.3 | 3 | 1 | 0 |
| Vox | 6 | 22.2 | 2 | 1 | 1 |
| Sumar | 6 | 24.5 | 3 | 0 | 0 |
| ERC | 6 | 19.7 | 1 | 1 | 1 |
| Junts | 6 | 20.7 | 3 | 2 | 1 |
| PNV | 6 | 22.2 | 0 | 5 | 2 |
| Bildu | 6 | 18.8 | 2 | 1 | 2 |
| BNG | 6 | 18.2 | 3 | 1 | 1 |
| CC | 4 | 23.8 | 1 | 3 | 2 |

### Partes omitidas (una medida por tarjeta)

| Tarjeta | Qué se omite y por qué | Cifras de la cita que no están en el texto |
| --- | --- | --- |
| t2023-vivienda-psoe-1 | La cita junta dos medidas; se recoge la principal (construir 183.000 viviendas, la mitad para jóvenes) y se omite ampliar la dotación y los receptores del Bono de Alquiler Joven. | — |
| t2023-vivienda-erc-1 | Se omite la fecha de supresión de la deducción («suprimida con efectos de l’1 de gener de 2015») para respetar el equilibrio del tema. | 1, 2015 |
| t2023-vivienda-pnv-1 | Se omite «tal y como se viene desarrollando por el Gobierno Vasco»: es un logro propio, no la medida, y señala el territorio. | — |
| t2023-impuestos-pp-2 | La cita junta dos medidas; se recoge la principal (eliminar el impuesto a las grandes fortunas) y se omite simplificar el IRPF y el impuesto de sociedades para pymes. «Que pagan quienes tienen los patrimonios más altos» explica qué es el impuesto. | — |
| t2023-impuestos-vox-1 | Se recoge la medida principal (dos tipos) y se omite la exención de 22.000 euros anuales de rentas del trabajo, con uno o dos pagadores; con ella la tarjeta superaba en más de 10 palabras a las del PP y el PSOE. | 22000 |
| t2023-impuestos-junts-2 | Se omite la justificación («compensando así la rebaja de 5 puntos del tipo general…»). | 5 |
| t2023-impuestos-pnv-2 | Se omite la segunda medida de la cita: «Combatir y erradicar las tasas de economía sumergida». | — |
| t2023-impuestos-bildu-1 | Se omite «respetando la competencia y capacidad de nuestras haciendas forales»: es una condición territorial, no el núcleo de la medida. | — |
| t2023-inmigracion-pp-1 | Se recoge el refuerzo de la inspección y el registro europeo de entradas y salidas. Se omiten el Sistema Europeo de Información y Autorización de Viaje y la coordinación y participación en las actividades de FRONTEX. | — |
| t2023-inmigracion-psoe-2 | Se omite «exitosos como los que ya funcionan»: valora y señala a quien gobierna. | — |
| t2023-inmigracion-sumar-1 | Se recoge la medida principal y se omiten el monitoreo independiente de derechos humanos en la frontera sur, la referencia a Melilla en junio de 2022 y la depuración de responsabilidades. | 2022 |
| t2023-inmigracion-junts-2 | La cita junta dos medidas; se recoge la más concreta y se omite «Treballar per articular vies legals i segures de migració regular i mobilitat», que sola no llega a 15 palabras. | — |
| t2023-inmigracion-bng-1 | Cerrar los CIE y poner fin a las expulsiones no se separan: los CIE existen para ejecutar expulsiones. Se omite «garantindo o respecto escrupuloso dos dereitos humanos…», que es un objetivo general. | — |
| t2023-inmigracion-bng-2 | Se omite la segunda medida: favorecer y facilitar los procesos de regularización administrativa. | — |
| t2023-inmigracion-cc-2 | Se omite «intensificándose el apoyo directo de la UE a los Estados Miembros en esta materia». | — |
| t2023-empleo-vox-1 | La cita tiene dos medidas en dos frases: subir los salarios y reducir las cargas y la regulación de las empresas. Se recogen las dos porque la subida sola no llega a 15 palabras. Se omiten la justificación de la segunda («para que ello no conlleve una destrucción de empleo») y el adjetivo «abusiva», que solo valora. | — |
| t2023-empleo-erc-1 | La cita junta varias medidas; se recoge la principal (subir el salario mínimo a 1.250 euros) y se omiten la escala salarial 1/12 y los objetivos generales (pleno empleo, salario digno, erradicar la brecha salarial). | 1, 12 |
| t2023-empleo-junts-1 | Se omite la segunda medida: «La Generalitat ha de poder-lo fixar per Catalunya». | — |
| t2023-empleo-pnv-1 | La cita enumera las bases de un pacto por el empleo; se recoge la que entra en el eje (vincular salarios y productividad) y se omiten la estabilidad del empleo, la formación continua y la competitividad. Se omite la justificación («para permitir que las empresas sean más competitivas»). | — |
| t2023-empleo-cc-2 | Se omiten los demás incentivos de la cita: emprendimiento joven, primer empleo joven y contratos en prácticas. | — |
| t2023-pensiones-pp-2 | La cita junta dos medidas; se recoge la principal (la contributividad) y se omite dar más transparencia y accesibilidad al sistema para consultar la pensión futura. | — |
| t2023-pensiones-vox-2 | Sustituye a la reserva anterior (sostenibilidad de las pensiones desmontando el sistema autonómico), cuya medida es reorganizar el Estado y no las pensiones. Es la medida 131, descartada por el fallo de verificar.mjs. | — |
| t2023-pensiones-junts-2 | Se omite la segunda medida: mejorar la fiscalidad de las pensiones que se compatibilizan con rentas del trabajo. | — |
| t2023-pensiones-bildu-1 | Se omite la segunda medida: «asumiendo también la capacidad propia para complementar estas pensiones aplicando a nuestra realidad las directrices marcadas por la Carta Social Europea». | — |
| t2023-pensiones-cc-1 | Se recoge la medida del eje (actualizar según el coste de la vida) con su financiación, y se omiten la sostenibilidad del sistema y la reducción de la brecha de género. | — |
| t2023-sanidad-vox-2 | Se omiten las demás medidas de la cita: potenciar la atención presencial y a domicilio, y la digitalización. | — |
| t2023-sanidad-sumar-2 | Se omite la segunda medida: el plan de desprivatización de limpieza, hostelería o lavandería. | — |
| t2023-sanidad-erc-1 | De los cuatro ejemplos de la cita se recogen dos; se omiten la elección de plazas en formación especializada y la acreditación de las especialidades de enfermería. | — |
| t2023-sanidad-junts-2 | Se omite la justificación («que després de 20 anys ha quedat obsoleta»). | 20 |
| t2023-sanidad-pnv-1 | Se omite la segunda medida: facilitar los trámites de acreditación de unidades docentes. | — |
| t2023-sanidad-bng-1 | Se omiten las demás medidas de la cita: más peso de la dispersión y el envejecimiento, racionalizar el gasto farmacéutico y la participación gallega en el precio de los medicamentos. | — |
| t2023-sanidad-cc-2 | Sustituye a la reserva anterior, que juntaba una medida educativa (detectar antes al alumnado vulnerable) y otra sanitaria (más profesionales de salud mental) que sola no llega a 15 palabras. | — |

### Registro de cambios de la primera autorrevisión

| Tarjeta | Qué fallaba | Cómo queda |
| --- | --- | --- |
| t2023-vivienda-psoe-1 | Fidelidad (verbo): la cita dice «queremos construir», un objetivo; «construir» a secas era más fuerte. | Tener como objetivo construir 183.000 viviendas públicas de alquiler y garantizar que la mitad sea para jóvenes. También ampliar el presupuesto de la ayuda estatal al alquiler para jóvenes y el número de personas que la reciben. |
| t2023-vivienda-psoe-2 | Fidelidad (verbo): la cita dice «el objetivo será alcanzar». | Tener como objetivo alcanzar en los próximos años el 20 % de vivienda pública en alquiler. Así se llegaría a la media de países de la Unión Europea como Francia, Países Bajos o Alemania. |
| t2023-vivienda-pp-2 | Legibilidad: «redes públicas», «patrimonial» y «dominio público» son jerga; «tanto patrimonial como demanial» quiere decir «todo el suelo público, sea cual sea su régimen». | Movilizar el suelo de titularidad pública reservado a vivienda, sea cual sea su régimen jurídico. Se destinaría a fórmulas para promover viviendas en alquiler asequible. |
| t2023-vivienda-bildu-1 | Legibilidad: «viven de alquiler» puede entenderse como «viven de las rentas del alquiler». | Recuperar de forma indefinida la prórroga automática de los contratos de alquiler cuando se renuevan. Se mantendrían las mismas condiciones y la misma renta. Afecta a las personas que viven en una vivienda alquilada. |
| t2023-impuestos-pnv-2 | Neutralidad: «justicia social» es valorativo. | Luchar contra el fraude y la evasión fiscal para repartir las cargas fiscales de forma más equitativa. Se facilitaría la cooperación entre las distintas haciendas del Estado. También combatir y erradicar la economía sumergida. |
| t2023-inmigracion-pp-1 | Fidelidad (verbo): la cita dice «impulsando la implantación», no «aplicar». | Reforzar la inspección en las fronteras con más personal y mejor formado. También impulsar los nuevos sistemas europeos de registro de entradas y salidas y de autorización de viaje, y colaborar con la agencia europea de fronteras. |
| t2023-inmigracion-pp-2 | Fidelidad (alcance): faltaba «a la seguridad». | Agilizar las órdenes de retorno de inmigrantes irregulares y la expulsión de quienes hayan cometido delitos. Se haría con mejores acuerdos con países de origen y tránsito, para prevenir amenazas a la seguridad y evitar que se animen nuevas llegadas. |
| t2023-empleo-pp-1 | Fidelidad (alcance): la cita dice «decisiones sobre el SMI», no solo sobre su cuantía. | Actualizar el salario mínimo interprofesional (SMI) en el marco del diálogo social. Sindicatos, empresarios y personas expertas participarían en la toma de decisiones sobre el SMI. |
| t2023-empleo-erc-1 | Fidelidad: la cita habla de «erradicación de la brecha salarial»; «menos brecha» rebajaba el alcance. | Subir el salario mínimo interprofesional a 1.250 euros y fijar una escala salarial 1/12: el sueldo más alto no superaría doce veces el más bajo. Busca el pleno empleo, reducir la desigualdad y acabar con la brecha salarial. |
| t2023-empleo-pp-1 | Equilibrio: tras el cambio anterior, 13 palabras de diferencia con la tarjeta más larga del tema; además, «involucrar» es el verbo de la cita. | Actualizar el salario mínimo interprofesional (SMI) en el marco del diálogo social. Se involucraría a sindicatos, empresarios y personas expertas en la toma de decisiones sobre el SMI. |
| t2023-empleo-erc-1 | Equilibrio: era la tarjeta más larga del tema (39 palabras). | Subir el salario mínimo interprofesional a 1.250 euros y fijar una escala salarial 1/12: el sueldo más alto no superaría doce veces el más bajo. Busca el pleno empleo, menos desigualdad y acabar con la brecha salarial. |

### Sustituciones de lenguaje cargado

| Tarjeta | Término original | Término usado | Motivo |
| --- | --- | --- | --- |
| t2023-vivienda-pnv-1 | el Gobierno Vasco dentro de su ámbito competencial exclusivo | (omitido) | Logro propio y territorio; no es la medida. |
| t2023-vivienda-psoe-1 | Bono de Alquiler Joven | (omitido) | Segunda medida de la cita; además, nombre de un programa asociado al gobierno de un partido. |
| t2023-impuestos-bildu-1 | respetando la competencia y capacidad de nuestras haciendas forales | (omitido) | Condición territorial en primera persona; no es el núcleo de la medida. |
| t2023-impuestos-psoe-2 | para acabar con la competencia fiscal desleal entre territorios | (omitido) | Justificación; «desleal» es valorativo. |
| t2023-impuestos-vox-2 | impuestos que suponen confiscaciones injustas, duplicadas o desproporcionadas | (omitido) | Justificación valorativa, no forma parte de la medida. |
| t2023-impuestos-junts-1 | tipus impositius que arriben a ser excessius | (omitido) | Valorativo. |
| t2023-impuestos-erc-2 | Esquerra aposta per | (omitido) | Nombre del partido. |
| t2023-inmigracion-vox-1 | que accedan ilegalmente | que entren de forma irregular en España | «Ilegal» aplicado a personas es un término asociado a un bloque; «irregular» es el descriptivo. El sentido no cambia. |
| t2023-inmigracion-vox-2 | que llegue ilegalmente | que llegue a España de forma irregular | Igual que la anterior. |
| t2023-inmigracion-pp-2 | evitar el efecto “llamada” | (omitido) | Justificación; además, término asociado a un bloque. |
| t2023-inmigracion-psoe-2 | convenios de migración circular exitosos | convenios de migración circular | «Exitosos» es valorativo. |
| t2023-inmigracion-sumar-1 | para que masacres como la de Melilla en junio de 2022 no vuelvan a suceder | (omitido) | Caso concreto que identifica la sensibilidad del partido; «masacres» es un término cargado. |
| t2023-inmigracion-pnv-1 | la postura maximalista de EH Bildu y de ERC | (omitido) | Nombres de partidos y crítica a otros. |
| t2023-empleo-junts-1 | La Generalitat ha de poder-lo fixar per Catalunya | (omitido) | Segunda medida de la cita y territorio propio. |
| t2023-empleo-bildu-1 | respondiendo a la exigencia de la mayoría sindical vasca | (omitido) | Justificación y territorio propio. |
| t2023-empleo-vox-1 | la regulación abusiva que perjudican la generación de empleo | la regulación sobre las empresas | «Abusiva» es valorativo. |
| t2023-empleo-erc-1 | un salari digne … una equitat retributiva més justa | (omitido) | Valorativo. |
| t2023-pensiones-psoe-1 | Blindaremos el poder adquisitivo de las pensiones con un cambio constitucional | Reformar la Constitución para garantizar … el poder adquisitivo | «Blindar» es un término de campaña. |
| t2023-pensiones-sumar-2 | que blinde el derecho a la Seguridad Social | que proteja de forma especial | «Blindar» es un término de campaña. |
| t2023-pensiones-vox-1 | por justicia con quienes han tributado | (omitido) | Justificación; «por justicia» es valorativo. |
| t2023-pensiones-bildu-1 | asumiendo también la capacidad propia … aplicando a nuestra realidad | (omitido) | Segunda medida de la cita, territorio propio y primera persona. |
| t2023-sanidad-sumar-2 | Se blindará el carácter público | Garantizar el carácter público | «Blindar» es un término de campaña. |
| t2023-sanidad-junts-1 | el sistema públic de salut a Catalunya | el sistema público de salud autonómico | Territorio propio; «autonómico» mantiene el alcance sin el posesivo. |
| t2023-sanidad-bng-1 | garantindo a participación galega | (omitido) | Medida secundaria de la cita y territorio propio. |
| t2023-sanidad-bng-2 | que se revela como un imposto á enfermidade | (omitido) | Valorativo. |
| t2023-sanidad-cc-1 | la partida que transfiere a Canarias | la comunidad autónoma | Territorio propio; el sentido no cambia. |
| t2023-sanidad-bildu-2 | aprobada por el PP | (omitido) | Nombre de partido. |
| t2023-pensiones-cc-1 | pensiones dignas … que blinden su presente y futuro | (omitido) | «Dignas» es valorativo y «blindar» es un término de campaña; además, son parte de lo omitido por la regla de una medida. |
| t2023-pensiones-cc-2 | un sistema de pensiones dignas, fiable y duradero | (omitido) | Objetivo sin cifra ni plazo; «dignas» es valorativo. |
| t2023-inmigracion-erc-1 | la pràctica il·legal de les devolucions en calent | las devoluciones en caliente | «Ilegal» es la valoración de la propuesta. |
| t2023-inmigracion-bng-1 | fin das deportacións | poner fin a las expulsiones | «Deportaciones» es un término marcado; «expulsión» es el término legal. El sentido no cambia. |
| t2023-sanidad-pp-2 | PLAN DE CHOQUE | plan urgente | Expresión de campaña. |
| t2023-pensiones-psoe-1 | ante cualquier circunstancia | siempre | La coletilla se leía como favorable; «siempre» mantiene el alcance. |
| t2023-sanidad-cc-1 | el Gobierno del Estado | el Gobierno central | «Gobierno del Estado» es propio de una sensibilidad concreta; «Gobierno central» es la expresión neutra. |
| t2023-empleo-vox-1 | la regulación abusiva | la regulación | «Abusiva» solo valora; «regulación» es la palabra de la cita. |
| t2023-inmigracion-psoe-2 | convenios de migración circular exitosos como los que ya funcionan | convenios de migración circular: trabajo temporal en España y regreso al país de origen | «Exitosos» valora y «como los que ya funcionan» señala a quien gobierna. |
| t2023-empleo-vox-1 | reduciremos drásticamente | reducir en gran medida | «De forma drástica» se leía como favorable; «en gran medida» mantiene la intensidad. |

### Tarjetas vagas porque el programa es vago

| Tarjeta | Nota |
| --- | --- |
| t2023-vivienda-pnv-1 | El programa del PNV casi no trata la vivienda (4 frases): la tarjeta es tan genérica como la cita. |
| t2023-vivienda-pnv-2 | Igual de genérica que la cita. |
| t2023-pensiones-pp-1 | La cita no dice cuánto ni cómo suben las pensiones, solo que se garantiza su revalorización en el Pacto de Toledo. |
| t2023-pensiones-junts-1 | «Avanzar hacia la convergencia», sin cifra ni plazo, como la cita. |
| t2023-pensiones-cc-1 | «Actualizadas según el coste de la vida», sin más concreción, como la cita. |
| t2023-empleo-pnv-1 | Un pacto con objetivos generales; la cita no concreta medidas. |
| t2023-inmigracion-psoe-1 | Una estrategia contra las mafias en origen, sin medidas concretas en la cita. |
| t2023-impuestos-junts-1 | «Revisar y reequilibrar» sin cifra, como la cita. |

### Glosario

64 términos en datos/banco/glosario-2023.json. Se muestran al tocar el término en el test; no cambian ningún texto. Los revisan dos personas con GLOSARIO-r1.csv y GLOSARIO-r2.csv.

| Término | Variantes | Definición | Tarjetas |
| --- | --- | --- | --- |
| Impuesto sobre la renta (IRPF) | impuesto sobre la renta (IRPF) · impuesto sobre la renta de las personas físicas (IRPF) | Impuesto que paga cada persona por lo que gana en un año: sueldo, pensión, alquileres o ahorros. Cuanto más se gana, mayor es el porcentaje que se paga. | 11 |
| Tramo | tramos | Cada uno de los escalones de ingresos del impuesto sobre la renta. A cada tramo se le aplica su propio porcentaje, más alto cuanto más alto es el tramo. | 2 |
| Tipo impositivo | tipo máximo · tipos de las rentas del capital · tipos distintos · a dos tipos · tipos general, reducido y superreducido · el tipo del impuesto de sociedades · tipos de al menos | Porcentaje que se paga de un impuesto. Un tipo del 25 % significa pagar 25 euros de cada 100 sobre los que se aplica. | 7 |
| Base imponible | bases inferiores | Cantidad sobre la que se calcula un impuesto, después de restar a los ingresos lo que la ley permite descontar. | 1 |
| Salario mínimo interprofesional (SMI) | salario mínimo interprofesional | El sueldo más bajo que se puede pagar por ley por una jornada completa. Lo fija el Gobierno cada año. | 8 |
| Salario medio | salario medio | El sueldo que sale de repartir a partes iguales el total de los sueldos entre todas las personas que trabajan. | 2 |
| Producto interior bruto (PIB) | producto interior bruto | Valor de todo lo que produce un país en un año en bienes y servicios. Se usa para medir el tamaño de su economía. | 2 |
| Índice de precios de consumo (IPC) | índice de precios de consumo (IPC) | Indicador que mide cuánto suben o bajan cada año los precios de lo que compran los hogares. Se usa para medir la inflación. | 4 |
| Inflación | inflación | Subida general de los precios. Cuando hay inflación, con el mismo dinero se pueden comprar menos cosas. | 1 |
| Devolución sumaria | devolución sumaria | Devolución inmediata, sin procedimiento ordinario, de quien intenta cruzar irregularmente la frontera. Conocida como devolución en caliente; la ley de extranjería la llama rechazo en frontera en Ceuta y Melilla. | 1 |
| Devoluciones en caliente | devoluciones en caliente | Así se conoce la devolución inmediata, sin procedimiento ordinario, de quien intenta cruzar irregularmente la frontera. La ley de extranjería la regula como rechazo en frontera en Ceuta y Melilla. | 3 |
| Rechazo en frontera | rechazos en frontera | Nombre que da la ley de extranjería, en Ceuta y Melilla, a la devolución inmediata, sin procedimiento ordinario, de quien intenta cruzar irregularmente la frontera. Popularmente, devoluciones en caliente. | 1 |
| Disposición adicional | disposición adicional 10.ª · disposición de la ley de extranjería | Parte que se añade al final de una ley para regular un caso concreto. La décima de la ley de extranjería regula el rechazo en frontera en Ceuta y Melilla. | 2 |
| Ley de extranjería | ley de extranjería · Ley Orgánica 4/2000 | Ley que regula los derechos de las personas extranjeras en España y cómo pueden entrar, vivir y trabajar en el país. Es la Ley Orgánica 4/2000. | 5 |
| Situación irregular | situación irregular · de forma irregular · inmigración irregular · sin su situación administrativa resuelta | Estar en España sin el permiso de residencia que exige la ley, o haber entrado sin pasar los controles de la frontera. | 5 |
| Regularización | regularización permanente · regularizar | Procedimiento por el que una persona extranjera que vive en España sin permiso consigue los papeles para residir y trabajar legalmente. | 2 |
| Centros de internamiento de extranjeros (CIE) | centros de internamiento de extranjeros (CIE) | Centros públicos donde se retiene, por orden de un juez y durante un tiempo limitado, a extranjeros en situación irregular mientras se tramita su expulsión. | 1 |
| Migración circular | migración circular | Fórmula por la que personas de otro país vienen a trabajar una temporada, con contrato y permiso, y después vuelven a su país. | 1 |
| Médico interno residente (MIR) | médico interno residente (MIR) | Sistema por el que los médicos, al acabar la carrera, se forman varios años con un contrato en un hospital o centro de salud para ser especialistas. | 3 |
| Atención primaria | atención primaria | La sanidad del centro de salud: médico de familia, pediatra y enfermería. Es el primer lugar al que se acude, antes del especialista o del hospital. | 3 |
| Conciertos sanitarios | conciertos con la sanidad privada | Acuerdos por los que la sanidad pública paga a centros privados para que atiendan a sus pacientes, que no pagan nada por ello. | 1 |
| Cartera de servicios | cartera de servicios sanitarios | Lista de pruebas, tratamientos y medicamentos que la sanidad pública ofrece a todos los pacientes. | 1 |
| Derecho al olvido oncológico | derecho al olvido oncológico | Derecho de quien ha superado un cáncer a que esa enfermedad no se tenga en cuenta al contratar un préstamo o un seguro. | 1 |
| Impuesto sobre bienes inmuebles (IBI) | impuesto sobre bienes inmuebles (IBI) | Impuesto que cobra cada año el ayuntamiento a quien es propietario de una vivienda, un local o un terreno. | 1 |
| Impuesto sobre el valor añadido (IVA) | impuesto sobre el valor añadido (IVA) | Impuesto incluido en el precio de casi todo lo que se compra. Tiene un tipo general y otros más bajos para algunos productos. | 3 |
| Impuesto de sociedades | impuesto de sociedades · recargo en sociedades | Impuesto que pagan las empresas por los beneficios que obtienen en un año. | 2 |
| Plusvalía municipal | plusvalía municipal | Impuesto del ayuntamiento que se paga cuando se vende, se hereda o se dona un inmueble urbano, por lo que ha subido el valor de su suelo. | 1 |
| Impuesto sobre el patrimonio | impuestos sobre el patrimonio | Impuesto que pagan cada año las personas por el valor de lo que poseen, por encima de un mínimo que fija cada comunidad autónoma. | 1 |
| Impuesto sobre sucesiones y donaciones | sucesiones y donaciones | Impuesto que paga quien recibe una herencia o una donación. Cada comunidad autónoma fija cuánto se paga. | 1 |
| Impuesto a las grandes fortunas | impuesto a las grandes fortunas · impuesto temporal a las grandes fortunas · a las grandes fortunas | Impuesto estatal sobre los patrimonios de más de 3 millones de euros, creado en 2022 con carácter temporal. | 4 |
| Rentas del capital | rentas del capital · los del capital | Ingresos que no vienen del trabajo, sino de ahorros o bienes: intereses, dividendos de acciones, alquileres o ganancias al vender algo. | 2 |
| Rentas del trabajo | rentas del trabajo · los del trabajo | Ingresos que vienen de trabajar: el sueldo de quien trabaja por cuenta ajena o lo que gana un autónomo con su actividad. | 2 |
| Deducción | deducción · deducciones | Cantidad que se puede restar del impuesto a pagar por haber hecho ciertos gastos, como pagar el alquiler de la vivienda. | 3 |
| Haciendas | haciendas del Estado | Las administraciones que cobran impuestos: la del Estado, las de las comunidades autónomas y las haciendas forales. | 1 |
| Cotizaciones | cotizaciones · cotización · cuota a la Seguridad Social | Lo que pagan cada mes a la Seguridad Social las empresas y los trabajadores. Con ese dinero se pagan las pensiones, el paro y otras prestaciones. | 4 |
| Tarifa cero | tarifa cero · tarifa 0 | Que un trabajador autónomo no pague cuota mensual a la Seguridad Social durante un tiempo, si cumple ciertas condiciones. | 2 |
| Diálogo social | diálogo social | Negociación entre el Gobierno, los sindicatos y las organizaciones de empresarios para acordar medidas laborales. | 2 |
| Estatuto de los Trabajadores | Estatuto de los Trabajadores | La ley principal que regula los derechos y obligaciones de trabajadores y empresas en España. | 1 |
| Despido improcedente | despidos improcedentes | Despido que un juez considera no justificado. La empresa debe readmitir al trabajador o pagarle una indemnización. | 1 |
| Carta Social Europea | Carta Social Europea | Tratado del Consejo de Europa que reconoce derechos sociales y laborales, como la remuneración del trabajo, la vivienda o la protección social. España lo ha ratificado. | 1 |
| Empresas de trabajo temporal (ETT) | empresas de trabajo temporal (ETT) | Empresas que contratan a trabajadores para cederlos durante un tiempo a otras empresas que los necesitan. | 1 |
| Falsos autónomos | falsos autónomos | Personas que trabajan como autónomas aunque en la práctica dependen de una sola empresa, como si fueran asalariadas. | 1 |
| Subcontratación en cadena | subcontratación en cadena | Cuando una empresa encarga un trabajo a otra, esta a su vez a otra, y así varias veces. | 1 |
| Brecha salarial | brecha salarial | Diferencia entre lo que ganan de media por su trabajo dos grupos de personas, por ejemplo hombres y mujeres. | 1 |
| Temporalidad | temporalidad | Peso de los contratos temporales, que tienen fecha de fin, frente a los contratos indefinidos. | 1 |
| Pacto de Toledo | Pacto de Toledo | Acuerdo de 1995 entre los partidos del Congreso para tratar juntos el futuro de las pensiones. Una comisión del Congreso revisa sus recomendaciones. | 2 |
| Contributividad | contributividad | Relación entre lo que una persona ha cotizado durante su vida laboral y la pensión que cobra. A más contributividad, más depende la pensión de lo cotizado. | 1 |
| Fondo de reserva de la Seguridad Social | fondo de reserva | Ahorro de la Seguridad Social, conocido como hucha de las pensiones, para pagarlas cuando no bastan las cotizaciones de cada año. | 2 |
| Pensiones no contributivas | no contributivas | Pensiones para personas mayores o con discapacidad que no han cotizado lo suficiente y tienen pocos ingresos. Se pagan con impuestos. | 2 |
| Pensiones mínimas | pensiones mínimas · pensión mínima contributiva | Cantidad mínima que el Estado garantiza a quien cobra una pensión por haber cotizado, cuando la que le corresponde queda por debajo. | 5 |
| Base reguladora | bases reguladoras | Cantidad de referencia que sirve para calcular cuánto se cobra de una pensión o de una prestación. | 1 |
| Edad ordinaria de jubilación | edad ordinaria de jubilación · jubilación ordinaria | Edad a partir de la cual se cobra la pensión de jubilación sin reducción por jubilarse antes. Depende de los años cotizados. | 2 |
| Jubilación parcial | jubilación parcial | Jubilarse solo en parte: se cobra una parte de la pensión y se sigue trabajando a tiempo parcial. | 1 |
| Umbral de la pobreza | umbral de la pobreza | Ingresos por debajo de los cuales un hogar está en riesgo de pobreza: el 60 % de los del hogar que queda en medio si se ordenan de menos a más. | 1 |
| Zonas tensionadas | zonas tensionadas | Zonas donde la ley considera que el alquiler es muy caro en relación con lo que ganan los hogares, y donde se pueden aplicar reglas especiales. | 1 |
| Prórroga automática | prórroga automática | Que, al acabar el plazo de un contrato de alquiler, este se alarga por sí solo, sin firmar uno nuevo y sin que ninguna de las partes tenga que pedirlo. | 1 |
| Aval | programa de avales | Garantía por la que un tercero responde ante el banco de una parte de la hipoteca si quien la pide no puede pagarla. | 1 |
| Artículo 150.1 de la Constitución | artículo 150.1 de la Constitución | Artículo que permite al Parlamento, mediante una ley, dar a las comunidades autónomas el poder de dictar normas sobre materias que son del Estado. | 1 |
| Mínimo por descendientes | mínimo por descendientes | Parte de los ingresos por la que no se paga impuesto sobre la renta por tener hijos u otros descendientes a cargo. | 1 |
| Revalorización | revalorización · revaloricen · revalorizarlas | Subida periódica de la cuantía de las pensiones, normalmente una vez al año, para que no pierdan valor frente a la subida de los precios. | 4 |
| Pensiones contributivas | pensiones contributivas | Pensiones que se cobran por haber cotizado a la Seguridad Social durante la vida laboral, como la de jubilación. Su cuantía depende de lo cotizado. | 1 |
| Impuestos a la banca y a las energéticas | impuestos a la banca, a las energéticas · impuestos extraordinarios a la banca y a las energéticas | Gravámenes temporales creados en 2022 sobre los ingresos de los grandes bancos y de las grandes empresas de energía. | 2 |
| Presupuestos Generales del Estado | Presupuestos Generales del Estado | Ley que aprueba cada año el Parlamento con todos los ingresos y gastos previstos del Estado. | 1 |
| Bonificación | bonificaciones · Bonificar | Rebaja durante un tiempo en lo que una empresa o un autónomo paga a la Seguridad Social, por contratar a ciertas personas o en ciertas situaciones. | 2 |

## 7. Verificación de citas

- **Candidatas** (paso 2, 60 archivos): 1121 citas · 1113 exactas · 8 normalizadas · 0 no encontradas.
- **Tarjetas**: 116 citas · 114 exactas · 2 normalizadas · 0 no encontradas.
- **Corregidas**: 10. **Descartadas** por no poder verificarse: 11 (detalle abajo).
- «Exacta» significa que la cita está tal cual en el texto de la página; solo pueden cambiar espacios y saltos de línea, que en el texto extraído son disposición y no caracteres del programa. «Normalizada» significa que, además, hubo que unificar guiones de fin de línea, comillas tipográficas o ligaduras.
- Corregidas: 5 citas que los ayudantes volvieron a copiar del texto (página equivocada, una errata, un arranque que faltaba) y 5 que completé al elegirlas porque los ayudantes las habían cortado en el salto de página (Vox IRPF desde la p. 74, PP pensiones, Vox pensiones, ERC despido y BNG regularización). Descartadas: 11 propuestas quitadas o no incluidas por los ayudantes (las 11 están en la tabla de descartes, con la revisión de la segunda pasada; solo una pasa al banco, la medida 131 de Vox) porque, al principio, verificar.mjs no aceptaba citas que pasan a la página siguiente (el pie y la cabecera de página quedan en medio). Después lo corregí: ahora vale partir la cita en un espacio, con al menos 25 caracteres en su página y el resto en la siguiente. Algunas candidatas siguen cortadas en sus archivos; ninguna de las elegidas.

## 8. Páginas sin texto, descartes y documentos breves

### Páginas sin texto (probablemente imágenes; sin OCR)

| Documento | Páginas |
| --- | --- |
| 2023-pp | 2, 4, 40, 56, 66, 69, 84, 94, 112 |
| 2023-psoe | 272 |
| 2023-vox | 2, 4, 6, 14, 20, 29, 30, 37, 38, 46, 54, 62, 71, 72, 88, 97, 98, 106, 114, 123, 124, 132, 140, 146, 153, 154, 160, 167, 168 |
| 2023-sumar | 1 |
| 2023-erc | ninguna |
| 2023-junts | 148 |
| 2023-pnv | 1, 52 |
| 2023-bildu | ninguna |
| 2023-bng | ninguna |
| 2023-cc | ninguna |

### Partidos sin propuesta en algún tema

| Partido | Tema | Motivo |
| --- | --- | --- |
| CC | Vivienda | Su documento (14 páginas) solo nombra la vivienda en una frase genérica sobre igualdad (p. 9), sin ningún compromiso. |
| CC | Impuestos | Sin propuesta neutralizable. Sus tres propuestas fiscales dependen de su territorio: ampliar diez años la bonificación del 60 % del IRPF para los residentes en La Palma (p. 5), mantener el incentivo al cine «en Canarias» con el «diferencial fiscal con la Península» (p. 9) y aplicar el IGIC, su impuesto propio, a las compras digitales (p. 11). Escribir «una isla concreta» cambia el sentido de una medida pensada para La Palma. |


### Descartes

| Partido | Tema | Página | Propuesta | Motivo |
| --- | --- | --- | --- | --- |
| Vox | Inmigración | 102 | Bloqueo naval y devolución inmediata. | No se elige como tarjeta de test por ser la propuesta más llamativa; se prefiere la expulsión inmediata, que resume mejor su posición. |
| Bildu | Inmigración | 11 | Corredores seguros empezando por reabrir los pasos entre Irun y Hendaia. | Nombra un paso fronterizo de su propio territorio; neutralizarlo cambia el sentido. No se usa como reserva. |
| Bildu | Empleo | 3 | SMI de 1.200 euros y SMI propio. | La cita sigue en la página 4 con un SMI propio para su territorio «acorde a nuestra realidad»; neutralizarlo cambia el sentido. Se usa como reserva la de la brecha salarial. |
| PNV | Impuestos | 16 | Convertir en impuestos los gravámenes a banca y energéticas. | Sigue en la página 17 con la reclamación de concertarlos con su territorio; neutralizarlo cambia el sentido. Se usa como reserva la de fraude fiscal. |
| CC | Impuestos | 5, 9 y 11 | Bonificación del IRPF en La Palma, incentivo fiscal al cine en Canarias e IGIC en compras digitales. | Dependen de su territorio: CC queda sin tarjeta de impuestos. |
| Junts | Sanidad | 109 | Traspaso de los edificios de hospitales a la Generalitat. | Depende de su territorio y la cita queda cortada en el salto de página. |
| PP | Vivienda | 33 | Explorar soluciones para un uso racional del suelo (Pacto de Estado). | Quitada por el ayudante al no verificarse por el salto de página (antes de arreglar verificar.mjs). Revisada en la segunda pasada: no se usa. «Exploraremos soluciones» es más vago que los avales a jóvenes y junta cuatro medidas (suelo, precios, alquiler y rehabilitación). |
| Vox | Impuestos | 8 | Medida 4, privilegios fiscales forales. | Quitada por el ayudante al quedar cortada en el salto de página (antes de arreglar verificar.mjs). Revisada en la segunda pasada: no se usa. Queda fuera del eje (IRPF) y depende del territorio («derechos históricos»). |
| Vox | Pensiones | 65 | Medida 131, desgravaciones a jubilados. | Quitada por el ayudante al quedar cortada en el salto de página (antes de arreglar verificar.mjs). Revisada en la segunda pasada: **se usa como reserva** (t2023-pensiones-vox-2) en lugar de «sostenibilidad de las pensiones desmontando el sistema autonómico», cuya medida es reorganizar el Estado. Sigue fuera de eje. |
| Vox | Empleo | 23 | Medida 37, brecha maternal; medida 353 (p. 163), contratar madres. | Quitadas por el ayudante al quedar cortadas en el salto de página (antes de arreglar verificar.mjs). Revisada en la segunda pasada: no se usan. Quedan fuera del eje (sueldos y jornada), y la tarjeta de test de Vox ya está dentro. |
| BNG | Empleo | 45 | Condiciones del personal investigador. | Quitada por el ayudante: partida entre páginas y poco central para el tema. Revisada en la segunda pasada: no se usa. Fuera del eje y poco central. |
| Junts | Empleo | 66 | Subvención del 50 % del SMI y bonificación del 100 % en contratos en prácticas. | No incluida por el ayudante al pasar de página (antes de arreglar verificar.mjs). Revisada en la segunda pasada: no se usa. Fuera del eje (son incentivos a contratos en prácticas) y junta dos medidas; la de test de Junts ya está dentro del eje. |
| PNV | Empleo | 30-31 | Fórmulas contractuales y becarios: que la cotización de las prácticas no disuada a las empresas. | No incluida por el ayudante al pasar de página (antes de arreglar verificar.mjs). Revisada en la segunda pasada: no se usa. Es una reflexión sin medida concreta y queda fuera del eje. |
| Vox | Empleo | 90-91 | Equiparación salarial y «justa jubilación» de Fuerzas Armadas y policías. | No incluida por el ayudante al pasar de página (antes de arreglar verificar.mjs). Revisada en la segunda pasada: no se usa. Afecta solo a un colectivo, junta dos medidas y usa lenguaje valorativo («justa», «dignificación»); la tarjeta de test de Vox en empleo ya está dentro del eje. |
| Junts | Sanidad | 98-99 | Acceso gratuito universal a productos de higiene menstrual, anticonceptivos hormonales y preservativos. | No incluida por el ayudante al pasar de página (antes de arreglar verificar.mjs). Revisada en la segunda pasada: no se usa. Tampoco está en el eje (listas de espera) y no es más concreta que la de plazas MIR. |

### Documentos breves

- **2023-bildu**: 16 páginas («Compromiso de Euskal Herria Bildu»): una presentación y medidas numeradas por secciones. Tiene alguna propuesta en los seis temas, pero pocas: 3 de vivienda, 3 de impuestos, 5 de inmigración, 11 de empleo, 4 de pensiones y 4 de sanidad. No trata el IRPF ni las listas de espera (tarjetas fuera de eje en impuestos y sanidad).
- **2023-cc**: 14 páginas: un manifiesto firmado el 26 de junio de 2023 y una lista de «compromisos con Canarias». Sin propuesta en vivienda; en impuestos solo tiene propuestas ligadas a su territorio (una se usa neutralizada, sin reserva); 4 de inmigración, 4 de empleo, 2 de pensiones y 5 de sanidad. No trata sueldos, jornada ni listas de espera (fuera de eje en empleo y sanidad).

## 9. Dudas abiertas y riesgos (de más a menos importante)

1. **Versión del programa del PP.** No hay captura de 2023; las fechas internas y el nombre interno apuntan a la versión final del 5 de julio de 2023, pero no se puede probar con Internet Archive.
2. **Tarjetas parecidas entre partidos.** PSOE y Sumar proponen una ley de listas de espera con tiempos máximos (el PSOE con plazos concretos y Sumar con un registro único); ERC y Junts, acercar la pensión mínima al salario mínimo (ERC con revalorización automática, Junts como convergencia). No se han unido porque cada una añade algo distinto. Si los revisores las ven iguales, se unen.
3. **Contexto tomado de la página y no de la cita.** En las tarjetas de test de ERC y BNG en impuestos, el texto dice «impuesto sobre la renta (IRPF)» porque la propuesta está dentro de su apartado del IRPF (p. 70 de ERC y p. 39 del BNG), aunque la frase citada no lo nombre. Lo mismo con «es decir, sin pagar cuota a la Seguridad Social» (tarifa 0 del PP) y «doce veces» (la escala 1/12 de ERC, que su p. 92 explica así: «no superi més de dotze vegades el salari més baix»).
4. **Neutralización del territorio.** «Su comunidad» (Junts y CC en sanidad). El sentido se mantiene, pero el contenido puede seguir delatando a un partido territorial.
5. **Partes omitidas por la regla de una medida por tarjeta.** 30 tarjetas recogen solo la medida principal de su cita o quitan una justificación con cifra (lista en la sección 6). Los revisores ven la cita entera; la guía les explica que lo omitido no es un fallo de alcance salvo que cambie el sentido de lo que queda.
6. **Citas recortadas a la parte que contiene la propuesta** (literales, pero sin el principio de la frase): PNV en pensiones y sanidad, Sumar y Vox en pensiones. Lo omitido es un logro pasado, una referencia a lo anterior o una justificación.
7. **Vox en pensiones** solo tiene dos propuestas en todo el programa; las dos tarjetas están fuera de eje.
8. **Bildu y CC** son documentos breves (ver sección 8): sus tarjetas salen de muy pocas candidatas.
9. Las candidatas son exhaustivas en la medida en que lo fueron los cinco ayudantes; no se ha revisado a mano que no falte ninguna propuesta en los programas largos (PSOE, Sumar, Vox).
