# Prueba de concepto de lectura con IA

Issue: #6 · Bloque 2 (subida y lectura) · Responsable: Mireia
Depende de: #5 (stack) y #10 (banco de tickets) · Alimenta: #5 (elección del motor), #3 (precios), #19 (lectura automática)

> **Estado: PRUEBA REALIZADA el 29/10/2026 con A (Gemini) y B (Mistral); el 30/10/2026 se añadieron, solo con A, el T1 real de gasolinera y T4b, la foto torcida y con poca luz. C (Azure) descartado.** Motor elegido: **Gemini 3.5 Flash Lite** (ver apartado 9). Los resultados valen para estos tickets y una ejecución cada uno; no garantizan el mismo acierto con cualquier documento.

## 1. Objetivo

Comparar 2 o 3 motores de IA con los 4 tickets obligatorios y decidir cuál usamos, midiendo:

1. **Precisión por campo**: si cada dato sale correcto, incorrecto o vacío.
2. **Coste por factura**: cuánto cuesta leer un documento, para calcular el coste por cliente en #3.

Leyenda usada en este documento:

- **[Confirmado]**: comprobado en una fuente oficial, con fecha de consulta.
- **[Supuesto]**: algo que damos por bueno para avanzar sin haberlo comprobado aún.
- **[Propuesta]**: decisión o recomendación nuestra, que el equipo puede cambiar.

Etiquetas según `docs/guia-estilo.md`.

## 2. Motores elegidos para la prueba

Fecha de consulta de todas las fuentes: **29/10/2026**. Los precios están en dólares (USD) salvo que se indique otra cosa.

| | A · Gemini Flash-Lite (Google) | B · Mistral OCR 4.1 (Mistral AI) | C · Azure Document Intelligence (Microsoft) |
|---|---|---|---|
| Tipo | Modelo de IA general que "ve" imágenes y PDF; le pedimos los datos con una instrucción (*prompt*) | OCR especializado en documentos + extracción estructurada (*annotations*) | OCR especializado con modelos ya entrenados para facturas (*prebuilt invoice*) y tickets (*prebuilt receipt*) |
| Precio oficial | `gemini-3.5-flash-lite`: 0,30 $ por millón de tokens de entrada y 2,50 $ por millón de salida. `gemini-3.1-flash-lite`: 0,25 $ / 1,50 $. **[Confirmado]** | 4 $ por 1.000 páginas (solo OCR) y 5 $ por 1.000 páginas con extracción estructurada. Endpoint UE: +10 %. **[Confirmado]** | 10 $ por 1.000 páginas en modelos *prebuilt*; 500 páginas gratis al mes en el plan F0. **[Confirmado en fuente secundaria]** (la página oficial de Microsoft no cargó al consultarla) |
| Coste por factura | Depende de los tokens: se mide en la prueba (resultado: ≈ 0,0009 $, ver apartado 6) | **Solo OCR:** ≈ 0,004 $ por página (4 $ / 1.000). **OCR + extracción de campos:** ≈ 0,005 $ por página (5 $ / 1.000). Con endpoint UE, +10 %: 0,0044 $ y 0,0055 $. En la prueba se usó solo OCR, por eso el apartado 6 usa 0,004 $ | ≈ 0,01 $ por página |
| ¿Datos en la UE? | **No garantizado** con la API de Google AI Studio. Sí es posible con Vertex AI en región UE (otra configuración) | Por defecto, almacenamiento en la UE; para procesar solo en la UE hay que usar el endpoint `api.eu.mistral.ai` (+10 %). No confirmado que OCR esté disponible en ese endpoint | Se procesa en la región donde se crea el recurso (p. ej. *West Europe*); entrada y resultados se borran a las 24 h |
| ¿Se puede probar sin programar? | Sí: Google AI Studio (web) | Sí, el OCR simple en la consola web (Document AI). La extracción con esquema JSON falló en la consola el 29/10/2026 | Sí, Document Intelligence Studio (web), pero la cuenta exige tarjeta: **descartado** |
| Categoría del gasto | Sí, si se la pedimos en el *prompt* | Sí, si se la pedimos en el esquema de extracción | **No**: habría que añadirla con otro paso |

Notas importantes **[Confirmado]**:

- Google ha anunciado que los modelos `gemini-3.8-flash` y `gemini-3.6-flash` duplican su precio a partir del 1/1/2027 (de 0,75/3,75 $ a 1,50/7,50 $ por millón). Por eso proponemos probar la gama Flash-Lite, que no tiene subida anunciada.
- Las condiciones de la API de Gemini dicen que, en el uso gratuito, Google puede usar el contenido para mejorar sus productos y que lo pueden revisar personas, y piden no enviar datos personales al servicio gratuito. Para usuarios en el EEE, Suiza y Reino Unido aplican las condiciones de pago (sin uso para mejorar productos).

Por qué estos tres **[Propuesta]**:

- **A** representa la opción "IA general": barata, lee cualquier formato y además clasifica la categoría.
- **B** representa la opción europea especializada en documentos, la mejor situada para el RGPD.
- **C** representa la opción clásica de OCR de facturas, con campos fiscales ya definidos (NIF del emisor y del receptor, desglose de impuestos).

## 3. Tickets de prueba

Archivos en `tests/tickets/` (los aporta el issue #10).

| ID | Ticket pedido | Archivo | Estado |
|---|---|---|---|
| T1 | Gasolinera arrugado | `T1-gasolinera-arrugado.jpg` | Válido: ticket real de gasolinera arrugado (E.S. Villaquejida), un tipo de IVA. Aportado en el PR #48, con el correo del ticket pixelado. **Aviso:** foto de baja resolución (367 × 836 píxeles). Hasta el 30/10/2026 se usó como sustituto el de Alcampo (ahora E4) |
| T2 | Supermercado con varios tipos de IVA | `T2-eroski-varios-iva.jpg` | Válido: 3 tipos de IVA (4 %, 10 % y 21 %); foto además algo torcida |
| T3 | Factura PDF de suscripción en inglés | `T3-claude-pro-ingles.pdf` | Válido: PDF en inglés de una suscripción. **Aviso:** está **en euros**: la detección de otra moneda queda **pendiente** hasta tener una factura en otra moneda |
| T4 | Foto torcida o con poca luz | `T4-cerveceria-poca-luz.jpg` | Válido solo en parte: luz cálida y dedos tapando parte del total, pero **no está torcida**. Se mantiene como caso de poca luz |
| T4b | Foto torcida **y** con poca luz | `T4b-mercadona-torcida-poca-luz.jpg` | Válido: ticket de Mercadona girado unos 35° y con poca luz, 3 tipos de IVA. Aportado en el PR #59. **Trampa:** lleva impresa la marca de la cámara con otra fecha (30/10/2026); la fecha del ticket es el 09/10/2026 |

Tickets extra (el issue #10 pide "tantos más como haya"):

| ID | Archivo | Por qué es interesante |
|---|---|---|
| E1 | `extra-aucalsa-peaje.jpg` | Peaje con "IVA 21 % incluido" sin desglose: la base y la cuota hay que calcularlas |
| E2 | `extra-carrefour.pdf` | PDF de ticket con un solo tipo de IVA |
| E3 | `extra-druni-catalan.pdf` | 2 tipos de IVA y parte del texto en catalán |
| E4 | `T1-alcampo-arrugado.jpg` | Supermercado muy arrugado con 2 tipos de IVA. Fue el sustituto provisional de T1 en la prueba del 29/10/2026; sus resultados se conservan en el apartado 5 |

Para los extras se puede usar la misma tabla de campos que en el apartado 5.

**Valores reales:** transcritos por Claude a partir de las imágenes el 29/10/2026 y **revisados y validados por Mireia** el mismo día. La hoja completa, con los extras y las notas, está en `docs/valores-reales-tickets.xlsx`. Los valores del T1 de gasolinera los aportó Ana en el PR #48 (30/10/2026). En E4 (Alcampo) no aparecen ni el NIF del emisor ni el número de factura.

**Privacidad:** se usan solo tickets propios. Antes de subirlos se han tapado los datos personales que no forman parte de la prueba: números de tarjeta, números de socio o cliente, nombres del personal y, en T3, el nombre, la dirección y el correo del receptor (pixelado en las fotos; tachado con eliminación real del texto en los PDF). En T1 se pixeló el correo electrónico impreso en el ticket. Por eso, en T3 el nombre del receptor no se puede comprobar; el receptor no tiene NIF en esa factura.

## 4. Cómo se rellenan las tablas

1. **Antes de pasar ningún motor**, escribir en la columna "Valor real" lo que pone de verdad en el ticket. Es la referencia con la que se compara.
2. Pasar el ticket por cada motor y anotar en su columna:
   - **Correcto**: coincide exactamente (importes con 2 decimales, fecha del mismo día, NIF con todas sus letras y números). En el nombre del emisor no cuentan las mayúsculas ni la puntuación ("MERCADONA S.A." = "Mercadona, S.A."), pero sí una letra distinta ("VILLIQUEJIDA" ≠ "Villaquejida").
   - **Incorrecto**: da un valor distinto del real.
   - **Vacío**: no devuelve nada en un campo que sí aparece en el ticket.
   - **No evaluable** (solo en B): no evaluable con OCR simple, porque el dato no está impreso tal cual (una suma, la categoría) y haría falta un paso más para obtenerlo.
   - **No aplica**: el dato no existe en el ticket (por ejemplo, el NIF del receptor en un ticket de supermercado). Si el motor lo deja vacío, es lo correcto; si se lo inventa, es Incorrecto.
3. Si algo es Incorrecto, apuntar en "Notas" qué dio (por ejemplo, "leyó 12,30 en vez de 12,80").
4. Guardar la respuesta completa de cada motor en `tests/resultados-ia/` con el nombre `T1-A.json`, `T1-B.json`, etc. (los del ticket de Alcampo se guardan como `E4-alcampo-A.json` y `E4-alcampo-B.json`).

Categorías provisionales (**[Supuesto]**, a revisar cuando se cierren #2 y #7): Combustible y transporte · Alimentación · Restauración y dietas · Software y suscripciones · Telefonía e internet · Material de oficina · Suministros · Alojamiento y viajes · Formación · Otros.

## 5. Resultados por ticket

### T1 · Gasolinera arrugado

Ticket real `T1-gasolinera-arrugado.jpg`, probado el 30/10/2026 solo con A. B (Mistral) no se ha probado con este ticket.

| Campo | Valor real | A · Gemini | B · Mistral | C · Azure | Notas |
|---|---|---|---|---|---|
| Fecha | 2026-03-07 | Correcto | No probado | No probado |  |
| Emisor | E.S. Villaquejida - Sutecal | Incorrecto | No probado | No probado | A leyó "E.S. VILLIQUEJIDA - SUTECAL" (una letra mal) |
| NIF del emisor | B49268071 | Correcto | No probado | No probado |  |
| NIF del receptor | No aplica | No aplica | No probado | No probado | Lo deja vacío (correcto) |
| Número de factura / ticket | 2023018651 | Correcto | No probado | No probado |  |
| IVA 1: tipo (%) | 21 | Correcto | No probado | No probado |  |
| IVA 1: base imponible | 88,21 | Correcto | No probado | No probado |  |
| IVA 1: cuota | 18,53 | Correcto | No probado | No probado |  |
| IVA 2: tipo (%) | No aplica | No aplica | No probado | No probado |  |
| IVA 2: base imponible | No aplica | No aplica | No probado | No probado |  |
| IVA 2: cuota | No aplica | No aplica | No probado | No probado |  |
| Base imponible total | 88,21 | Correcto | No probado | No probado |  |
| Total | 106,74 | Correcto | No probado | No probado |  |
| Moneda | EUR | Correcto | No probado | No probado |  |
| Categoría | Combustible y transporte | Correcto | No probado | No probado |  |

### E4 · Alcampo arrugado (sustituto provisional de T1 el 29/10/2026)

| Campo | Valor real | A · Gemini | B · Mistral | C · Azure | Notas |
|---|---|---|---|---|---|
| Fecha | 2026-09-08 | Correcto | Correcto | No probado |  |
| Emisor | Alcampo Santa Nonia | Correcto | Correcto | No probado |  |
| NIF del emisor | No aplica | No aplica | No aplica | No probado | Lo deja vacío (correcto) |
| NIF del receptor | No aplica | No aplica | No aplica | No probado | Lo deja vacío (correcto) |
| Número de factura / ticket | No aplica | No aplica | No aplica | No probado | Lo deja vacío (correcto) |
| IVA 1: tipo (%) | 4 | Correcto | Correcto | No probado |  |
| IVA 1: base imponible | 4,05 | Correcto | Correcto | No probado |  |
| IVA 1: cuota | 0,15 | Correcto | Correcto | No probado |  |
| IVA 2: tipo (%) | 21 | Correcto | Correcto | No probado |  |
| IVA 2: base imponible | 1,31 | Correcto | Correcto | No probado |  |
| IVA 2: cuota | 0,28 | Correcto | Correcto | No probado |  |
| Base imponible total | 5,36 | Correcto | No evaluable | No probado | B: no aparece impresa (es una suma) |
| Total | 5,79 | Correcto | Correcto | No probado |  |
| Moneda | EUR | Correcto | Correcto | No probado |  |
| Categoría | Alimentación | Correcto | No evaluable | No probado |  |

### T2 · Supermercado con varios tipos de IVA

| Campo | Valor real | A · Gemini | B · Mistral | C · Azure | Notas |
|---|---|---|---|---|---|
| Fecha | 2025-09-02 | Correcto | Correcto | No probado |  |
| Emisor | Vego Supermercados S.A.U. | Correcto | Correcto | No probado |  |
| NIF del emisor | A36651313 | Correcto | Correcto | No probado |  |
| NIF del receptor | No aplica | No aplica | No aplica | No probado | Lo deja vacío (correcto) |
| Número de factura / ticket | 132740032509026056 | Incorrecto | Incorrecto | No probado | Leyó 32742765031756805107: el número bajo el código de barras, no el de la factura simplificada; B leyó 13274003250802B056 (dos caracteres mal) |
| IVA 1: tipo (%) | 10 | Correcto | Correcto | No probado |  |
| IVA 1: base imponible | 44,58 | Correcto | Correcto | No probado |  |
| IVA 1: cuota | 4,46 | Correcto | Correcto | No probado |  |
| IVA 2: tipo (%) | 21 | Correcto | Correcto | No probado |  |
| IVA 2: base imponible | 10,29 | Correcto | Correcto | No probado |  |
| IVA 2: cuota | 2,16 | Correcto | Correcto | No probado |  |
| IVA 3: tipo (%) | 4 | Correcto | Correcto | No probado |  |
| IVA 3: base imponible | 51,64 | Correcto | Correcto | No probado |  |
| IVA 3: cuota | 2,07 | Correcto | Correcto | No probado |  |
| Base imponible total | 106,51 | Correcto | No evaluable | No probado | B: no aparece impresa (es una suma) |
| Total | 115,20 | Correcto | Correcto | No probado |  |
| Moneda | EUR | Correcto | No evaluable | No probado | B: no aparece impresa de forma explícita |
| Categoría | Alimentación | Correcto | No evaluable | No probado |  |

### T3 · Factura PDF de suscripción en inglés

| Campo | Valor real | A · Gemini | B · Mistral | C · Azure | Notas |
|---|---|---|---|---|---|
| Fecha | 2026-10-14 | Correcto | Correcto | No probado |  |
| Emisor | Anthropic Ireland, Limited | Correcto | Correcto | No probado |  |
| NIF / VAT ID del emisor | IE4276970QH | Correcto | Correcto | No probado |  |
| NIF del receptor | No aplica | No aplica | No aplica | No probado | Lo deja vacío (correcto) |
| Número de factura | 9BF0758D-8771996 | Correcto | Correcto | No probado |  |
| IVA 1: tipo (%) | 21 | Correcto | Correcto | No probado |  |
| IVA 1: base imponible | 18,00 | Correcto | Correcto | No probado |  |
| IVA 1: cuota | 3,78 | Correcto | Correcto | No probado |  |
| Base imponible total | 18,00 | Correcto | Correcto | No probado |  |
| Total | 21,78 | Correcto | Correcto | No probado |  |
| Moneda | EUR | Correcto | Correcto | No probado |  |
| Categoría | Software y suscripciones | Correcto | No evaluable | No probado |  |

La conversión a euros **no se mide aquí**: el motor solo tiene que detectar bien la moneda. La conversión se hará con el tipo de cambio del BCE en la fecha de la factura (issue #20).

### T4 · Foto torcida o con poca luz

| Campo | Valor real | A · Gemini | B · Mistral | C · Azure | Notas |
|---|---|---|---|---|---|
| Fecha | 2026-08-29 | Correcto | Correcto | No probado |  |
| Emisor | Cerveceria Celtica S.L. | Correcto | Correcto | No probado |  |
| NIF del emisor | B24610297 | Correcto | Correcto | No probado |  |
| NIF del receptor | No aplica | No aplica | No aplica | No probado | Lo deja vacío (correcto) |
| Número de factura / ticket | 1 / 388087 | Correcto | Correcto | No probado |  |
| IVA 1: tipo (%) | 10 | Correcto | Correcto | No probado |  |
| IVA 1: base imponible | 19,09 | Correcto | Correcto | No probado |  |
| IVA 1: cuota | 1,91 | Correcto | Correcto | No probado |  |
| IVA 2: tipo (%) | No aplica | No aplica | No aplica | No probado |  |
| IVA 2: base imponible | No aplica | No aplica | No aplica | No probado |  |
| IVA 2: cuota | No aplica | No aplica | No aplica | No probado |  |
| Base imponible total | 19,09 | Correcto | Correcto | No probado |  |
| Total | 21,00 | Correcto | Correcto | No probado |  |
| Moneda | EUR | Correcto | Incorrecto | No probado | B leyó "TAL FUROS" (el dedo tapa parte de "TOTAL EUROS") |
| Categoría | Restauración y dietas | Correcto | No evaluable | No probado |  |

### T4b · Foto torcida y con poca luz

Ticket `T4b-mercadona-torcida-poca-luz.jpg`, probado el 30/10/2026 solo con A. Valores reales del PR #59; el número de factura lo confirmó Ana con el ticket en papel.

| Campo | Valor real | A · Gemini | B · Mistral | C · Azure | Notas |
|---|---|---|---|---|---|
| Fecha | 2026-10-09 | Correcto | No probado | No probado | No confundió la fecha con la de la marca de la cámara (30/10/2026) |
| Emisor | Mercadona, S.A. | Correcto | No probado | No probado | Devolvió "MERCADONA S.A." (solo cambian mayúsculas y una coma) |
| NIF del emisor | A46103834 | Vacío | No probado | No probado | Devolvió null: en esta foto el NIF sale muy pequeño y borroso. No se lo inventó |
| NIF del receptor | No aplica | No aplica | No probado | No probado | Lo deja vacío (correcto) |
| Número de factura / ticket | 2939-017-128100 | Correcto | No probado | No probado |  |
| IVA 1: tipo (%) | 4 | Correcto | No probado | No probado |  |
| IVA 1: base imponible | 10,66 | Correcto | No probado | No probado |  |
| IVA 1: cuota | 0,43 | Correcto | No probado | No probado |  |
| IVA 2: tipo (%) | 10 | Correcto | No probado | No probado |  |
| IVA 2: base imponible | 29,95 | Correcto | No probado | No probado |  |
| IVA 2: cuota | 2,99 | Correcto | No probado | No probado |  |
| IVA 3: tipo (%) | 21 | Correcto | No probado | No probado |  |
| IVA 3: base imponible | 10,33 | Correcto | No probado | No probado |  |
| IVA 3: cuota | 2,17 | Correcto | No probado | No probado |  |
| Base imponible total | 50,94 | Correcto | No probado | No probado |  |
| Total | 56,53 | Correcto | No probado | No probado |  |
| Moneda | EUR | Correcto | No probado | No probado |  |
| Categoría | Alimentación | Correcto | No probado | No probado |  |

## 6. Coste por factura

Los precios de los proveedores están en dólares; al final de este apartado se pasan a euros.

Para Gemini, AI Studio muestra los tokens de entrada y de salida de cada respuesta. Fórmula:

`coste = (tokens de entrada × precio de entrada + tokens de salida × precio de salida) ÷ 1.000.000`

Para Mistral y Azure el coste es por página: `coste = páginas × precio por página`.

| Ticket | Páginas | A · tokens entrada | A · tokens salida | A · coste ($) | B · coste ($) | C · coste ($) |
|---|---|---|---|---|---|---|
| T1 | 1 | 1.379 | 197 | 0,000906 | No probado | No probado |
| T2 | 1 | 1.379 | 285 | 0,001126 | 0,004 | No probado |
| T3 | 1 | 839 | 192 | 0,000732 | 0,004 | No probado |
| T4 | 1 | 1.379 | 196 | 0,000904 | 0,004 | No probado |
| T4b | 1 | 1.371 | 259 | 0,001059 | No probado | No probado |
| **Media por factura (T1–T4b)** | | 1.269 | 226 | **0,00095** | **0,004** (solo OCR; T2–T4) | No probado |
| E4 · Alcampo (extra) | 1 | 1.379 | 202 | 0,000919 | 0,004 | No probado |

Tipo de cambio usado para pasar a euros: **1 € = 1,1133 $** (tipo de referencia del BCE del 28/10/2026, el último publicado al consultarlo el 29/10/2026). Fuente: https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html

| Ticket | A · coste (€) | B · coste (€) |
|---|---|---|
| T1 | 0,000814 | No probado |
| T2 | 0,001011 | 0,0036 |
| T3 | 0,000658 | 0,0036 |
| T4 | 0,000812 | 0,0036 |
| T4b | 0,000951 | No probado |
| **Media por factura (T1–T4b)** | **0,00085 €** | **0,0036 €** (solo OCR) |
| E4 · Alcampo (extra) | 0,000825 | 0,0036 |

Para #3 (precios): con A, leer 1.000 facturas cuesta unos **0,85 €** con los cinco tickets T1–T4b (0,83 € con el cálculo del 29/10/2026). T4b gasta algo más porque su respuesta es más larga (tres tipos de IVA). La diferencia es de unos 2 céntimos por cada 1.000 facturas: el modelo de negocio puede quedarse con 0,83 €. Es un **[Supuesto]** que hay que revisar al fijar los precios, porque el tipo de cambio y los precios de Google pueden cambiar.

Lectura de A: unos **0,0009 $ por factura**, es decir, menos de 1 $ por cada 1.000 facturas leídas (estimación de AI Studio con los precios actuales de `gemini-3.5-flash-lite`). Las fotos de ticket consumieron 1.101 tokens cada una y el PDF, menos.

Lectura de B: 4 $ por cada 1.000 páginas según la lista de precios oficial de Mistral OCR 4.1 (0,004 $ por página de ticket). **[Supuesto]** Damos por hecho que `mistral-ocr-latest` corresponde a OCR 4.1 en la fecha de la prueba. Es solo el OCR: para obtener los campos ordenados y la categoría haría falta un segundo paso (extracción estructurada, 5 $ por 1.000 páginas, u otro modelo), que sumaría coste. La consola no muestra el coste de cada lectura.

## 7. Resumen

**Cómo se hizo la prueba de B (29/10/2026):** consola web de Mistral (Document AI), modelo `mistral-ocr-latest`, plan gratuito Experiment, sin formato de respuesta: la opción de esquema JSON hacía que la consola fallara o no guardaba los campos. Por eso se usó el OCR simple, que devuelve el texto del documento sin ordenar en campos. Textos en `tests/resultados-ia/T*-B.json`. En el plan Experiment, Mistral indica que las peticiones pueden usarse para entrenar sus modelos; se subieron solo tickets tapados.

**Cómo se hizo la prueba de A (29/10/2026; T1 de gasolinera el 30/10/2026):** Google AI Studio en la web, modelo `gemini-3.5-flash-lite`, nivel de razonamiento *Minimal* (el que trae por defecto), búsqueda de Google desactivada, un chat temporal nuevo por ticket y la instrucción del apartado 10 escrita en una sola línea. Una sola ejecución por ticket. Los tokens y el coste son los que muestra AI Studio en su detalle de uso, que los indica como estimación de lo que costaría la misma petición por API; en AI Studio sin clave de API no se cobra. Respuestas completas en `tests/resultados-ia/T*-A.json` y `E4-alcampo-A.json`. El T1 de gasolinera se ejecutó el 30/10/2026 con la misma configuración, desde el asistente de Claude en Chrome; la imagen se subió como `image.jpg`.

**Límites y advertencias:** 5 tickets y una ejecución cada uno no bastan para dar una tasa de acierto fiable; T1 y T4b solo se probaron con A, y la foto de T1 es de baja resolución; T3 está en euros, así que la detección de otra moneda sigue sin probar; ningún ticket tiene NIF del receptor. Las fotos se enviaron tras pasarlas por el chat de Claude, que puede recomprimirlas.

Aciertos = número de campos Correcto ÷ número de campos que existen en el ticket (sin contar los No aplica).

| Motor | T1 | T2 | T3 | T4 | T4b | Total T1–T4b | E4 (extra) | Coste medio por factura | ¿Datos en la UE? | ¿Categoría? |
|---|---|---|---|---|---|---|---|---|---|---|
| A · Gemini 3.5 Flash Lite | 10/11 | 16/17 | 11/11 | 11/11 | 16/17 | **64/67 (96 %)** | 12/12 | 0,00095 $ | No garantizado | Sí |
| B · Mistral OCR (OCR simple) | No probado | 13/14 | 10/10 | 9/10 | No probado | **32/34 (94 %)** de los campos impresos (T2–T4) | 10/10 | 0,004 $ (solo OCR) | Sí (endpoint UE) | No medido |
| C · Azure Document Intelligence | — | — | — | — | — | **No probado** | — | — | Sí (región UE) | No |

En los **cuatro casos obligatorios del enunciado** (T1 gasolinera arrugado, T2 varios IVA, T3 PDF en inglés y T4b torcida con poca luz), A acierta **53/56 (95 %)**.

Hasta el 30/10/2026 este resumen contaba el ticket de Alcampo como T1 (A: 50/51; B: 42/44). Con el ticket real de gasolinera, A quedó en 48/50 (T1–T4); con T4b, añadido el 30/10/2026, en 64/67.

Campos que más fallan: el número de factura de T2 (A tomó otro número del ticket; B leyó mal dos caracteres), el nombre del emisor en T1 (A cambió una letra: "VILLIQUEJIDA"), el NIF del emisor en T4b (A lo dejó vacío porque en la foto apenas se lee) y, en B, la palabra "EUROS" tapada por el dedo en T4. A no inventó datos ausentes: en los campos No aplica devolvió vacío.

**Comparación justa:** A y B no se midieron igual. A devolvió los campos ya ordenados; B solo el texto, y se comprobó si cada dato impreso aparecía bien leído. Si a A se le cuentan solo esos mismos 44 campos impresos (E4, T2, T3 y T4, los tickets que pasaron ambos motores), acierta 43/44 (falla el número de T2).

**C · Azure, descartado para esta prueba:** crear la cuenta gratuita exige una tarjeta para verificar la identidad y el equipo decidió no aportarla. El issue pide 2 o 3 motores, así que se cumple con A y B.

## 8. Criterios de decisión [Propuesta]

Por orden de importancia:

1. **Importes e IVA correctos** (total, bases, tipos y cuotas). Un error aquí llega a la gestoría.
2. **NIF del emisor y fecha correctos.**
3. **Coste por factura** asumible dentro de los precios de #3.
4. **Datos tratados en la UE** o con garantías equivalentes (lo confirma #4, normativa).
5. **Facilidad de integración** en el stack de #5.

Si dos motores empatan en precisión, se elige el que trate los datos en la UE.

## 9. Decisión

Motor elegido: **A · Gemini 3.5 Flash Lite** (`gemini-3.5-flash-lite`). Decidido por Mireia el 29/10/2026, a partir de la recomendación de este documento.

Motivo:

- Lee el documento, ordena los campos y asigna la categoría en un solo paso; Mistral OCR solo devuelve texto y necesitaría un segundo paso.
- Precisión prácticamente igual con los tickets que pasaron ambos motores (43/44 frente a 42/44 en los campos impresos) y acierto en la categoría de todos los tickets probados. Con los tickets añadidos el 30/10/2026, A acierta 10/11 en el T1 de gasolinera y 16/17 en la foto torcida y con poca luz (T4b).
- Coste estimado de unos 0,0009 $ por factura, unas 4 veces menos que solo el OCR de Mistral. Este dato es el que usa #3 para los precios.

Configuración necesaria (**[Propuesta]**, a confirmar en #5 y #4):

- **Desarrollo y pruebas:** API de Gemini (Google AI Studio) con una clave que guarda el equipo, nunca en el código del repositorio.
- **Web real:** Gemini a través de **Vertex AI con región de la UE** (multirregión `eu` o una región europea), para que el tratamiento quede en la UE. Requiere una cuenta de pago de Google Cloud: decisión pendiente del equipo.
- **No usar el nivel gratuito con datos de clientes:** según las condiciones de Google, el contenido del servicio gratuito puede usarse para mejorar sus productos.
- Precio de referencia: 0,30 $ por millón de tokens de entrada y 2,50 $ por millón de salida (consultado el 29/10/2026). Revisar antes de fijar precios, porque Google ha anunciado subidas en otros modelos Flash.

Alternativa si el equipo exige tratamiento en la UE sin cuenta de Google Cloud: **B · Mistral** (endpoint `api.eu.mistral.ai`), añadiendo un paso de extracción estructurada y repitiendo la prueba.

Riesgos y qué hará la pantalla de corrección (#21) para cubrirlos:

- **Número de factura y nombre del emisor:** son los campos que fallaron (A confundió el número con otro del ticket en T2 y cambió una letra del emisor en T1). La pantalla de corrección debe mostrarlos junto a la imagen para comprobarlos de un vistazo. El NIF del emisor, que identifica a la empresa, se leyó bien en todos los tickets salvo en T4b, donde la foto apenas lo deja leer.
- **Datos ausentes:** el motor deja vacíos los que no aparecen. La pantalla debe marcar esos campos para que el usuario los rellene si los conoce.
- **Moneda distinta del euro:** sin probar. Queda pendiente para #20 y #31.
- **NIF poco legible:** en fotos malas el NIF puede salir vacío (T4b). La pantalla debe pedirlo; si el emisor ya existe en los gastos del usuario, se puede proponer su NIF.
- **Muestra pequeña:** repetir la prueba con más tickets en #31 (otra moneda, NIF del receptor y duplicados).

## 10. Instrucción común para los motores que la admiten

Se usa la misma instrucción en A y, si se puede, en B, para que la comparación sea justa:

```text
Eres un asistente que extrae datos de facturas y tickets de gasto españoles o extranjeros.
Lee el documento adjunto y responde SOLO con un JSON con esta estructura:

{
  "fecha": "AAAA-MM-DD",
  "emisor": "nombre del emisor",
  "nif_emisor": "NIF, CIF o VAT ID del emisor",
  "nif_receptor": "NIF del receptor o null si no aparece",
  "numero_factura": "número de factura o ticket",
  "lineas_iva": [
    { "tipo": 21, "base": 0.00, "cuota": 0.00 }
  ],
  "base_imponible_total": 0.00,
  "total": 0.00,
  "moneda": "código ISO 4217, por ejemplo EUR o USD",
  "categoria": "una de: Combustible y transporte, Alimentación, Restauración y dietas, Software y suscripciones, Telefonía e internet, Material de oficina, Suministros, Alojamiento y viajes, Formación, Otros"
}

Reglas:
- Si un dato no aparece en el documento, pon null. No te lo inventes.
- Pon una línea en "lineas_iva" por cada tipo de IVA distinto.
- Usa punto como separador decimal.
```

## 11. Fuentes (consultadas el 29/10/2026)

- Google · Precios de la API de Gemini: https://ai.google.dev/gemini-api/docs/pricing
- Google · Condiciones adicionales de la API de Gemini (última modificación 28/04/2026): https://ai.google.dev/gemini-api/terms
- Google Cloud · Residencia de datos en Vertex AI: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/data-residency
- Mistral · Ficha de OCR 4.1: https://docs.mistral.ai/models/ocr-4-1
- Mistral · Precios: https://docs.mistral.ai/inference/pricing
- Mistral · Inferencia regional: https://docs.mistral.ai/inference/regional-inference
- Mistral · Dónde se guardan los datos: https://help.mistral.ai/en/articles/347629-where-do-you-store-my-data-or-my-organization-s-data
- Microsoft · Página oficial de precios (no cargó en la consulta): https://azure.microsoft.com/en-us/pricing/details/ai-document-intelligence/
- Fuente secundaria de precios de Azure (24/10/2026): https://superdupr.com/blog/azure-document-intelligence-pricing
- Microsoft · Datos, privacidad y seguridad de Document Intelligence: https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/document-intelligence/data-privacy-security
- Microsoft · Modelo de tickets y Document Intelligence Studio: https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/prebuilt/receipt?view=doc-intel-4.0.0
