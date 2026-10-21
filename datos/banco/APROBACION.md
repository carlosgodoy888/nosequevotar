# Aprobación del banco de 2023

## Cómo se ha aprobado

- **Aprobación global y conjunta.** Dos personas del equipo revisaron juntas todas las tarjetas de test y todo el glosario, y los aprobaron en bloque el 22 de octubre de 2026. No hay marcas individuales: no se rellenaron los CSV de revisión (REVISION-r1/r2 ni GLOSARIO-r1/r2) ni se firmó con nombre.
- **Apoyo de revisiones automáticas.** La aprobación se apoya en las revisiones hechas con agentes, que están en datos/banco/ia/:
  - prueba de adivinar con 9 perfiles (PRUEBA-AGENTES.md);
  - revisión de neutralidad y fidelidad (REVISION-IA.md);
  - tercera revisión (REVISION-FINAL.md);
  - revisor de criterios (REVISION-CRITERIOS.md);
  - auditorías de concreción del PP (AUDITORIA-PP.md) y de PNV y CC (AUDITORIA-PNV-CC.md).

  Estas revisiones orientan, pero no sustituyen a la revisión humana.
- **Pendiente.** La prueba de adivinar con personas (PRUEBA-ADIVINAR.md, con 10 a 20 personas) queda pendiente y se hará después de publicar.
- **Qué pasa al banco aprobado.** Solo las tarjetas de test. Las 58 reservas se quedan en el borrador (datos/banco/banco-2023.json). Cada término del glosario enlaza solo a las tarjetas de test que lo contienen.

Archivo escrito: `src/contenido/juegos/banco-2023.json`, con `"aprobacion": { "modo": "global", "revisores": 2, "fecha": "2026-10-22" }`.

## Qué se aprueba

- **58 tarjetas** de 10 partidos en 6 temas.
- **39 términos del glosario**, de 64.

### Tarjetas por partido y tema

| Partido | Vivienda | Impuestos | Inmigración | Empleo | Pensiones | Sanidad | Total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PP | 1 | 1 | 1 | 1 | 1 | 1 | 6 |
| PSOE | 1 | 1 | 1 | 1 | 1 | 1 | 6 |
| Vox | 1 | 1 | 1 | 1 | 1 | 1 | 6 |
| Sumar | 1 | 1 | 1 | 1 | 1 | 1 | 6 |
| ERC | 1 | 1 | 1 | 1 | 1 | 1 | 6 |
| Junts | 1 | 1 | 1 | 1 | 1 | 1 | 6 |
| PNV | 1 | 1 | 1 | 1 | 1 | 1 | 6 |
| Bildu | 1 | 1 | 1 | 1 | 1 | 1 | 6 |
| BNG | 1 | 1 | 1 | 1 | 1 | 1 | 6 |
| CC | 0 | 0 | 1 | 1 | 1 | 1 | 4 |
| **Total** | **9** | **9** | **10** | **10** | **10** | **10** | **58** |

Coalición Canaria no tiene tarjeta de vivienda ni de impuestos: en vivienda no tiene propuesta y en impuestos su única propuesta no se podía neutralizar.

### Términos del glosario por tema

Un término cuenta en un tema si aparece en alguna tarjeta de ese tema.

| Tema | Términos |
| --- | --- |
| Vivienda | 6 |
| Impuestos | 11 |
| Inmigración | 7 |
| Empleo | 6 |
| Pensiones | 11 |
| Sanidad | 3 |

### Términos que no pasan al banco aprobado

Solo aparecen en tarjetas de reserva (25):

- Regularización
- Migración circular
- Cartera de servicios
- Derecho al olvido oncológico
- Impuesto sobre bienes inmuebles (IBI)
- Impuesto de sociedades
- Plusvalía municipal
- Impuesto sobre el patrimonio
- Impuesto sobre sucesiones y donaciones
- Haciendas
- Tarifa cero
- Despido improcedente
- Carta Social Europea
- Empresas de trabajo temporal (ETT)
- Falsos autónomos
- Subcontratación en cadena
- Brecha salarial
- Temporalidad
- Contributividad
- Fondo de reserva de la Seguridad Social
- Base reguladora
- Edad ordinaria de jubilación
- Jubilación parcial
- Zonas tensionadas
- Artículo 150.1 de la Constitución

## Validación

- OK: 58 tarjetas de test con un partido y una cita cada una.
- OK: todos los enlaces llevan #page=.
- OK: cada partido tiene como mucho una tarjeta por tema y los 6 temas tienen tarjeta de PP, PSOE, Vox, Sumar.
- OK: los 64 términos del glosario enlazan a tarjetas que existen.
- OK: en cada tema, como mucho 10 palabras de diferencia entre tarjetas.
