# Orden de los temas

Generado con `node scripts/investigacion/ordenar-temas.mjs` a partir de `orden-temas.json`. No se edita a mano.

**Encuesta:** Centro de Investigaciones Sociológicas (CIS), estudio 3582, «Barómetro de octubre 2026» (5024 entrevistas, del 1 al 6 de octubre de 2026). Resultados marginales: <https://www.cis.es/documents/20117/14396821/es3582mar.pdf/49717326-7aad-cfc5-9460-e889f1d43193?version=1.0&t=1792653744506> (consultado el 2026-11-16).

- **España:** Pregunta 13R: «¿Cuál es, a su juicio, el principal problema que existe actualmente en España? ¿Y el segundo? ¿Y el tercero?» Respuesta espontánea, multirrespuesta, recodificada. Columna TOTAL (porcentaje de personas entrevistadas que citan esa respuesta).
- **Personal:** Pregunta 14R: «¿Y cuál es el problema que a Ud., personalmente, le afecta más? ¿Y el segundo? ¿Y el tercero?» Respuesta espontánea, multirrespuesta, recodificada. Columna TOTAL.

**Criterio:** Cada tema suma los porcentajes de sus respuestas en las dos preguntas (problema de España y problema que le afecta personalmente). Los temas van de mayor a menor suma; si empatan, primero el más citado como problema de España y después el orden anterior. Las quejas sobre la política en general se dejan fuera.

| N.º | Tema | España | Personal | Suma | Respuestas de la encuesta que cuentan |
|---|---|---|---|---|---|
| 1 | Vivienda | 56,2 | 34,8 | 91 | La vivienda (55,7 · 33,8); La ocupación de viviendas (0,5 · 0,4); Las hipotecas (0 · 0,4); Los desahucios (0 · 0,2) |
| 2 | Empleo y salarios | 29,8 | 26,3 | 56,1 | Los problemas relacionados con la calidad del empleo (19,4 · 18,8); El paro (9,6 · 6,5); Los problemas relacionados con los/as autónomos/as (0,8 · 1) |
| 3 | Economía y empresas | 21,7 | 31,8 | 53,5 | La crisis económica, los problemas de índole económica (20,3 · 30,3); El modelo productivo español. La falta de inversión en industrias e I+D (0,9 · 0,7); Los problemas derivados del turismo. Masificación (0,5 · 0,5); Los bancos (0 · 0,3) |
| 4 | Sanidad | 14,7 | 28,1 | 42,8 | La sanidad (14,4 · 24); Las drogas (0,3 · 0,2); Preocupación sobre la salud propia, de familiares y/o allegados/as (0 · 3,9) |
| 5 | Inmigración | 20,9 | 11,2 | 32,1 | La inmigración (20,9 · 11,2) |
| 6 | Democracia e instituciones | 15 | 7,3 | 22,3 | La corrupción y el fraude (6,7 · 2,1); El funcionamiento de los servicios públicos (3 · 2,1); El funcionamiento de la democracia (2,1 · 1,5); Papel de los medios de comunicación y redes: desinformación, manipulación informativa, difusión de bulos (2 · 1,3); La falta de confianza en los/las políticos/as y las instituciones (1 · 0,3); La Monarquía (0,2 · 0) |
| 7 | Educación | 8,7 | 10 | 18,7 | La educación (8,7 · 10) |
| 8 | Medio ambiente y energía | 6,7 | 11,3 | 18 | El cambio climático (4 · 4,8); La subida de tarifas energéticas, crisis energética (2 · 5,4); El medio ambiente (0,7 · 1,1); Los incendios (0 · 0) |
| 9 | Política exterior y defensa | 9,4 | 6,3 | 15,7 | Crisis con Marruecos. Fronteras de Ceuta y Melilla (6,5 · 3); Las guerras en general (1,7 · 2,3); Política exterior y relaciones internacionales. Papel de España en el marco internacional (1,2 · 0,8); Guerra de Ucrania y Rusia (0 · 0,2) |
| 10 | Seguridad y justicia | 5,6 | 7,5 | 13,1 | La inseguridad ciudadana (4,3 · 6,7); La Administración de Justicia (1,3 · 0,8) |
| 11 | Familias y servicios sociales | 5,1 | 6,4 | 11,5 | Los problemas de índole social (4,9 · 6,1); La falta de servicios públicos. Los recortes (0,2 · 0,3) |
| 12 | Impuestos | 3,7 | 7,2 | 10,9 | La subida de los impuestos (3,5 · 7,2); El fraude fiscal (0,2 · 0) |
| 13 | Igualdad y derechos | 5,2 | 3,9 | 9,1 | Las desigualdades, incluida la de género, diferencias de clases, la pobreza (3,8 · 2,8); El racismo (1,1 · 0,6); La violencia de género (0,3 · 0,2); Los problemas relacionados con la mujer (0 · 0,3) |
| 14 | Pensiones | 1,4 | 4 | 5,4 | Las pensiones (1,4 · 4) |
| 15 | Transporte e infraestructuras | 1,1 | 2,8 | 3,9 | Las infraestructuras (1,1 · 2,8) |
| 16 | Organización territorial | 1,3 | 0,9 | 2,2 | Los estatutos de autonomía (0,8 · 0,3); Los nacionalismos (0,3 · 0,3); La independencia de Cataluña (0,2 · 0,3) |
| 17 | Campo y medio rural | 0,6 | 1,6 | 2,2 | Los problemas de la agricultura, ganadería y pesca (0,4 · 0,7); La España vaciada, la despoblación (0,2 · 0,9) |
| 18 | Ciencia, cultura y digital | 0 | 0 | 0 | — |

## Respuestas que no suman a ningún tema

Quejas sobre los políticos o la política en general (España · personal):

- El Gobierno y partidos o políticos/as concretos/as: 15,1 · 4,8
- Los problemas políticos en general: 10,1 · 3,7
- El mal comportamiento de los/as políticos/as: 8,5 · 2,7
- Los extremismos: 7,7 · 3,3
- Lo que hacen los partidos políticos: 5,8 · 1,4
- Aumento de la crispación social, revueltas sociales: 3,2 · 2
- La falta de acuerdos, unidad y capacidad de colaboración. Situación e inestabilidad política: 1,2 · 0,5

No encajan en un solo tema:

- Los problemas relacionados con la juventud. Falta de apoyo y oportunidades para los/as jóvenes: 7,2 · 9,4
- La crisis de valores: 3,6 · 2,9
- Poca conciencia ciudadana (falta de civismo, de sentido espíritu cívico): 0,5 · 0,5
- Las incertidumbres ante el futuro, la inseguridad y el miedo al futuro: 0,5 · 1,7
- Las preocupaciones y situaciones personales: 0 · 1,9
- Problemas psicológicos (preocupaciones, soledad, tristeza, desamparo, etc.): 0 · 1,1

Sin contenido:

- Otras respuestas: 2,7 · 0
- Ninguno: 0,1 · 0
- N.S.: 1,1 · 0
- N.C.: 0,1 · 0
