# Guía de estilo de los documentos

Normas comunes para todos los documentos del proyecto, los redacte quien los redacte y con la herramienta que sea. Si usas una IA para redactar, pásale esta guía al empezar.

Quien revise un pull request comprueba también que el documento sigue esta guía.

## 1. Sin iconos ni emojis

Los documentos se leen como un trabajo profesional. No se usan iconos, emojis ni símbolos decorativos. En su lugar, se usan las etiquetas de texto de los apartados 2 y 3.

## 2. Estado de la información

Para indicar qué tan segura es una información:

| Etiqueta | Cuándo se usa |
|---|---|
| **[Confirmado]** | Comprobado en una fuente o en el enunciado. Lleva enlace y fecha de consulta. |
| **[Propuesta]** | Decisión o recomendación del equipo. Se puede cambiar. |
| **[Pendiente]** | Falta información o comprobarlo. |

Se escriben entre corchetes y en negrita, al lado del título o del dato al que se refieren. Cada documento explica la leyenda al principio.

"En progreso" no se usa en los documentos: el estado de una tarea se ve en el tablero de GitHub (Todo / In Progress / Done).

## 3. Resultados de pruebas

Para las tablas de resultados (por ejemplo, la prueba de lectura con IA):

| Etiqueta | Significado |
|---|---|
| **Correcto** | El dato coincide con el valor real. |
| **Incorrecto** | El dato es distinto del valor real. Se explica en Notas qué salió. |
| **Vacío** | No devuelve nada en un campo que sí aparece en el documento. |
| **No aplica** | El dato no existe en el documento (por ejemplo, el NIF del receptor en un ticket). |
| **No evaluable** | No se puede comprobar con ese método. |
| **No probado** | La prueba no se ha hecho. |

Para avisos dentro del texto se escribe **Aviso:** seguido de la explicación.

## 4. Cabecera de cada documento

Debajo del título:

- Tarea (número de issue y orden), bloque y responsable.
- Estado del documento y la leyenda de etiquetas.

## 5. Formato

- **Fechas:** 29/10/2026 en el texto. En datos y tablas de valores, 2026-10-29.
- **Importes:** coma decimal y dos decimales, con la moneda: 4,05 €, 0,30 $.
- **Porcentajes:** con espacio: 21 %.
- **Fuentes:** todo dato externo lleva enlace y fecha de consulta. Al final del documento, un apartado de fuentes.
- **Referencias a tareas:** con el número de issue (#2), que en GitHub es un enlace.

## 6. Tono

- Frases cortas y claras, sin jerga innecesaria.
- Nada de frases genéricas o de relleno.
- No prometer lo que la herramienta no hace. Por ejemplo, la herramienta guarda justificantes, pero no decide qué gastos son deducibles: eso lo decide la gestoría.
- Las decisiones importantes indican quién las tomó y cuándo (por ejemplo, "Decidido por Mireia el 29/10/2026").
