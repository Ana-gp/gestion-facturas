# Lectura automática con IA

Tarea: #19 (orden 18) · Bloque 2 (subida y lectura) · Responsable: Mireia · Última actualización: 01/11/2026

Depende de: #6 ([prueba de IA](prueba-ia.md)) y #18 (guardar el original) · Alimenta: #20 (moneda), #21 (revisar y corregir), #22 (duplicados) y #31 (límites del plan)

**Estado:** código en el PR #69. **[Confirmado]** La instrucción nueva se probó en AI Studio con los cuatro tickets obligatorios el 01/11/2026 (apartado 3). **[Pendiente]** La prueba en la web, que necesita el login (#13) y Vercel (apartado 5).

Leyenda según la [guía de estilo](guia-estilo.md): **[Confirmado]**, **[Supuesto]**, **[Propuesta]** y **[Pendiente]**.

## 1. Cómo funciona

1. La pantalla de subida guarda el original (#18) y llama a la ruta `POST /api/leer` con el id del documento.
2. La ruta comprueba, con la sesión del usuario, que el documento es suyo. Si no lo es, responde "no existe".
3. Llama a `reservar_lectura` (decisión D4 del [modelo de datos](modelo-datos.md)). Si no quedan lecturas en el plan, se para y el original sigue guardado. Volver a leer un documento no gasta otra lectura.
4. Descarga el original del bucket privado y lo envía a **Gemini 3.5 Flash Lite** (`gemini-3.5-flash-lite`), con la misma configuración que la prueba del #6: razonamiento por defecto, sin búsqueda de Google y respuesta en JSON.
5. Comprueba la respuesta antes de guardarla (`lib/lectura/interpretar.ts`): números con coma, fechas que existen, moneda de 3 letras, categoría de la lista y líneas de IVA con tipo. Lo que no se entiende se deja vacío. **Nunca se inventa un dato.**
6. Guarda la factura y sus líneas de IVA y marca el documento como `leido`. Si algo falla, lo marca como `error` y el original sigue guardado.

La clave de Gemini y la clave secreta de Supabase solo están en el servidor. **[Confirmado]** el 01/11/2026: no aparecen en los archivos que llegan al navegador, y la compilación falla si una pantalla intenta importarlas.

## 2. Instrucción

Es la del #6 ([prueba de IA](prueba-ia.md), apartado 10), con tres datos más que pedía el [modelo de datos](modelo-datos.md) (apartado 8.2, punto 3). El texto completo está en `lib/lectura/instruccion.ts`.

| Dato nuevo | Para qué |
|---|---|
| `tipo_documento` | Ticket o factura (D5). Es factura solo si aparecen el nombre y el NIF del receptor |
| `retencion` | Retención de IRPF (D6), para que no salga un aviso falso de "no cuadra" |
| `campos_dudosos` | Datos que la IA no lee con claridad (D2) |

**Confianza de cada campo** (`facturas.campos_revision`): un campo que la IA marca como dudoso queda en `baja`, y se combina con las reglas del equipo (vacío = `baja`, cuentas que no cuadran = `baja` en importes, NIF con formato raro = `media`). Se usa siempre la confianza más baja de las dos.

## 3. Prueba de la instrucción nueva (01/11/2026)

Google AI Studio (web), un chat nuevo por ticket, `gemini-3.5-flash-lite`, razonamiento *Minimal*, sin búsqueda de Google ni salida estructurada, y solo tickets tapados. Lo hizo Mireia. Respuestas completas en `tests/resultados-ia/*-A19.json`. Comparación con [valores reales](valores-reales-tickets.xlsx).

| Ticket | Aciertos #6 | Aciertos #19 | Fallo | Tokens entrada / salida | Coste ($) |
|---|---|---|---|---|---|
| T1 · Gasolinera arrugado | 10/11 | **11/11** | — (en el #6 cambió una letra del emisor) | 1.595 / 227 | 0,001046 |
| T2 · Eroski, tres tipos de IVA | 16/17 | 16/17 | Número de factura: toma otro número del ticket, igual que en el #6 | 1.595 / 317 | 0,001271 |
| T3 · PDF en inglés | 11/11 | 11/11 | — | 1.055 / 221 | 0,000869 |
| T4b · Torcida y con poca luz | 16/17 | 16/17 | NIF del emisor vacío (en la foto apenas se lee), igual que en el #6 | 1.587 / 265 | 0,001139 |
| **Total** | **53/56** | **54/56 (96 %)** | | | **media 0,00108** |

Los tres datos nuevos salieron bien en los cuatro tickets: `tipo_documento` = `ticket` (ninguno trae los datos fiscales del receptor), `retencion` = `null` (ninguno la tiene).

**[Confirmado] `campos_dudosos` no es fiable.** En los cuatro tickets la IA respondió `[]`, también en T2 y T4b, donde se equivocó o dejó un dato vacío. Confirma el supuesto de D2: la confianza que la IA se pone a sí misma no basta. Por eso:

- `campos_dudosos` solo **baja** la confianza, nunca la sube.
- El NIF vacío de T4b queda en `baja` por nuestra regla de "vacío", y la ficha pide revisarlo.
- El número de T2 no se puede detectar automáticamente: la pantalla de revisión (#21) lo enseña junto al original para comprobarlo de un vistazo.

**Coste:** la instrucción es más larga y la entrada pasa de unos 1.379 a 1.595 tokens por foto. La media de los cuatro tickets sube de 0,00096 $ a **0,00108 $** (+13 %), algo más de 1 $ por cada 1.000 lecturas. **[Pendiente]** Revisarlo en el [modelo de negocio](modelo-negocio.md) (#3), que usa 0,83 € por cada 1.000.

**Límites:** una ejecución por ticket y cuatro tickets. Ninguno tiene retención, NIF del receptor ni otra moneda, así que esos casos siguen sin probar con la IA.

## 4. Decisiones

- **[Propuesta]** Un documento que se llama "factura" pero no trae el NIF del receptor (T3) se guarda como `ticket`, y la ficha avisa "Sin NIF del receptor". Si el equipo prefiere guardarlo como `factura`, se cambia la regla de la instrucción.
- **[Propuesta]** No se cambia la instrucción para intentar arreglar el número de T2: con una sola ejecución no se sabría si el cambio ayuda.
- En otra moneda, el tipo de cambio y el total en euros quedan vacíos hasta convertirla (#20), como exige la tabla `facturas`.

## 5. Pendiente

| Qué | Quién | Cómo se cierra |
|---|---|---|
| Probar en la web: subir, leer y abrir la ficha con los cuatro tickets, con dos cuentas reales | Mireia, cuando estén #13 y Vercel | Las cuatro fichas guardadas y un usuario que no ve las del otro |
| Probar una factura con retención y otra en otra moneda | Mireia (#31) | Respuestas guardadas en `tests/resultados-ia/` |
| Avisar de posible duplicado después de leer (`buscar_duplicados`) | Ana (#22) | Llamada añadida tras guardar la factura |
| Revisar el coste por lectura en el modelo de negocio | Javier (#3) | Cifra actualizada |
