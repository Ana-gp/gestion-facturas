# Prueba de concepto de lectura con IA

Issue: #6 · Bloque 2 (subida y lectura) · Responsable: Mireia
Depende de: #5 (stack) y #10 (banco de tickets) · Alimenta: #5 (elección del motor), #3 (precios), #19 (lectura automática)

> **Estado: PRUEBA REALIZADA el 29/10/2026 con A (Gemini) y B (Mistral). C (Azure) descartado.** Motor elegido: **Gemini 3.5 Flash Lite** (ver apartado 9). Los resultados valen para estos 4 tickets y una ejecución cada uno; no garantizan el mismo acierto con cualquier documento.

## 1. Objetivo

Comparar 3 motores de IA con los 4 tickets obligatorios y decidir cuál usamos, midiendo:

1. **Precisión por campo**: si cada dato sale correcto, incorrecto o vacío.
2. **Coste por factura**: cuánto cuesta leer un documento, para calcular el coste por cliente en #3.

Leyenda usada en este documento:

- **Hecho**: comprobado en una fuente oficial, con fecha de consulta.
- **Supuesto**: algo que damos por bueno sin haberlo comprobado aún.
- **Recomendación**: propuesta nuestra, que el equipo puede cambiar.

## 2. Motores elegidos para la prueba

Fecha de consulta de todas las fuentes: **29/10/2026**. Los precios están en dólares (USD) salvo que se indique otra cosa.

| | A · Gemini Flash-Lite (Google) | B · Mistral OCR 4.1 (Mistral AI) | C · Azure Document Intelligence (Microsoft) |
|---|---|---|---|
| Tipo | Modelo de IA general que "ve" imágenes y PDF; le pedimos los datos con una instrucción (*prompt*) | OCR especializado en documentos + extracción estructurada (*annotations*) | OCR especializado con modelos ya entrenados para facturas (*prebuilt invoice*) y tickets (*prebuilt receipt*) |
| Precio oficial | `gemini-3.5-flash-lite`: 0,30 $ por millón de tokens de entrada y 2,50 $ por millón de salida. `gemini-3.1-flash-lite`: 0,25 $ / 1,50 $. **Hecho** | 4 $ por 1.000 páginas (solo OCR) y 5 $ por 1.000 páginas con extracción estructurada. Endpoint UE: +10 %. **Hecho** | 10 $ por 1.000 páginas en modelos *prebuilt*; 500 páginas gratis al mes en el plan F0. **Hecho en fuente secundaria** (la página oficial de Microsoft no cargó al consultarla) |
| Coste por factura | Depende de los tokens: se mide en la prueba (resultado: ≈ 0,0009 $, ver apartado 6) | **Solo OCR:** ≈ 0,004 $ por página (4 $ / 1.000). **OCR + extracción de campos:** ≈ 0,005 $ por página (5 $ / 1.000). Con endpoint UE, +10 %: 0,0044 $ y 0,0055 $. En la prueba se usó solo OCR, por eso el apartado 6 usa 0,004 $ | ≈ 0,01 $ por página |
| ¿Datos en la UE? | **No garantizado** con la API de Google AI Studio. Sí es posible con Vertex AI en región UE (otra configuración) | Por defecto, almacenamiento en la UE; para procesar solo en la UE hay que usar el endpoint `api.eu.mistral.ai` (+10 %). No confirmado que OCR esté disponible en ese endpoint | Se procesa en la región donde se crea el recurso (p. ej. *West Europe*); entrada y resultados se borran a las 24 h |
| ¿Se puede probar sin programar? | Sí: Google AI Studio (web) | Sí, el OCR simple en la consola web (Document AI). La extracción con esquema JSON falló en la consola el 29/10/2026 | Sí, Document Intelligence Studio (web), pero la cuenta exige tarjeta: **descartado** |
| Categoría del gasto | Sí, si se la pedimos en el *prompt* | Sí, si se la pedimos en el esquema de extracción | **No**: habría que añadirla con otro paso |

Notas importantes (**hechos**):

- Google ha anunciado que los modelos `gemini-3.8-flash` y `gemini-3.6-flash` duplican su precio a partir del 1/1/2027 (de 0,75/3,75 $ a 1,50/7,50 $ por millón). Por eso proponemos probar la gama Flash-Lite, que no tiene subida anunciada.
- Las condiciones de la API de Gemini dicen que, en el uso gratuito, Google puede usar el contenido para mejorar sus productos y que lo pueden revisar personas, y piden no enviar datos personales al servicio gratuito. Para usuarios en el EEE, Suiza y Reino Unido aplican las condiciones de pago (sin uso para mejorar productos).

Por qué estos tres (**recomendación**):

- **A** representa la opción "IA general": barata, lee cualquier formato y además clasifica la categoría.
- **B** representa la opción europea especializada en documentos, la mejor situada para el RGPD.
- **C** representa la opción clásica de OCR de facturas, con campos fiscales ya definidos (NIF del emisor y del receptor, desglose de impuestos).

## 3. Tickets de prueba

Archivos en `tests/tickets/` (los aporta el issue #10).

| ID | Ticket pedido | Archivo | Estado |
|---|---|---|---|
| T1 | Gasolinera arrugado | `T1-alcampo-arrugado.jpg` | ⚠️ **Sustituto provisional**: supermercado muy arrugado con 2 tipos de IVA, **no es de gasolinera**. Sustituir cuando alguien del equipo aporte uno de gasolinera |
| T2 | Supermercado con varios tipos de IVA | `T2-eroski-varios-iva.jpg` | ✅ 3 tipos de IVA (4 %, 10 % y 21 %); foto además algo torcida |
| T3 | Factura PDF de suscripción en inglés | `T3-claude-pro-ingles.pdf` | ✅ PDF en inglés de una suscripción. ⚠️ Está **en euros**: la detección de otra moneda queda **pendiente** hasta tener una factura en otra moneda |
| T4 | Foto torcida o con poca luz | `T4-cerveceria-poca-luz.jpg` | ✅ Luz cálida y dedos tapando parte del total (no muy torcida) |

Tickets extra (el issue #10 pide "tantos más como haya"):

| ID | Archivo | Por qué es interesante |
|---|---|---|
| E1 | `extra-aucalsa-peaje.jpg` | Peaje con "IVA 21 % incluido" sin desglose: la base y la cuota hay que calcularlas |
| E2 | `extra-carrefour.pdf` | PDF de ticket con un solo tipo de IVA |
| E3 | `extra-druni-catalan.pdf` | 2 tipos de IVA y parte del texto en catalán |

Para los extras se puede usar la misma tabla de campos que en el apartado 5.

**Valores reales:** transcritos por Claude a partir de las imágenes el 29/10/2026 y **revisados y validados por Mireia** el mismo día. La hoja completa, con los extras y las notas, está en `docs/valores-reales-tickets.xlsx`. En T1 no aparecen ni el NIF del emisor ni el número de factura.

**Privacidad:** se usan solo tickets propios. Antes de subirlos se han tapado los datos personales que no forman parte de la prueba: números de tarjeta, números de socio o cliente, nombres del personal y, en T3, el nombre, la dirección y el correo del receptor (pixelado en las fotos; tachado con eliminación real del texto en los PDF). Por eso, en T3 el nombre del receptor no se puede comprobar; el receptor no tiene NIF en esa factura.

## 4. Cómo se rellenan las tablas

1. **Antes de pasar ningún motor**, escribir en la columna "Valor real" lo que pone de verdad en el ticket. Es la referencia con la que se compara.
2. Pasar el ticket por cada motor y anotar en su columna:
   - ✅ **Correcto**: coincide exactamente (importes con 2 decimales, fecha del mismo día, NIF con todas sus letras y números).
   - ❌ **Incorrecto**: da un valor distinto del real.
   - ⬜ **Vacío**: no devuelve nada en un campo que sí aparece en el ticket.
   - **—** (solo en B): no evaluable con OCR simple, porque el dato no está impreso tal cual (una suma, la categoría) y haría falta un paso más para obtenerlo.
   - **N/A**: el dato no existe en el ticket (por ejemplo, el NIF del receptor en un ticket de supermercado). Si el motor lo deja vacío, es lo correcto; si se lo inventa, es ❌.
3. Si algo es ❌, apuntar en "Notas" qué dio (por ejemplo, "leyó 12,30 en vez de 12,80").
4. Guardar la respuesta completa de cada motor en `tests/resultados-ia/` con el nombre `T1-A.json`, `T1-B.json`, etc.

Categorías provisionales (**supuesto**, a revisar cuando se cierren #2 y #7): Combustible y transporte · Alimentación · Restauración y dietas · Software y suscripciones · Telefonía e internet · Material de oficina · Suministros · Alojamiento y viajes · Formación · Otros.

## 5. Resultados por ticket

### T1 · Gasolinera arrugado

| Campo | Valor real | A · Gemini | B · Mistral | C · Azure | Notas |
|---|---|---|---|---|---|
| Fecha | 2026-09-08 | ✅ | ✅ | No probado |  |
| Emisor | Alcampo Santa Nonia | ✅ | ✅ | No probado |  |
| NIF del emisor | N/A | N/A ✅ | N/A ✅ | No probado | Lo deja vacío (correcto) |
| NIF del receptor | N/A | N/A ✅ | N/A ✅ | No probado | Lo deja vacío (correcto) |
| Número de factura / ticket | N/A | N/A ✅ | N/A ✅ | No probado | Lo deja vacío (correcto) |
| IVA 1: tipo (%) | 4 | ✅ | ✅ | No probado |  |
| IVA 1: base imponible | 4,05 | ✅ | ✅ | No probado |  |
| IVA 1: cuota | 0,15 | ✅ | ✅ | No probado |  |
| IVA 2: tipo (%) | 21 | ✅ | ✅ | No probado |  |
| IVA 2: base imponible | 1,31 | ✅ | ✅ | No probado |  |
| IVA 2: cuota | 0,28 | ✅ | ✅ | No probado |  |
| Base imponible total | 5,36 | ✅ | — | No probado | B: no aparece impresa (es una suma) |
| Total | 5,79 | ✅ | ✅ | No probado |  |
| Moneda | EUR | ✅ | ✅ | No probado |  |
| Categoría | Alimentación | ✅ | — | No probado |  |

### T2 · Supermercado con varios tipos de IVA

| Campo | Valor real | A · Gemini | B · Mistral | C · Azure | Notas |
|---|---|---|---|---|---|
| Fecha | 2025-09-02 | ✅ | ✅ | No probado |  |
| Emisor | Vego Supermercados S.A.U. | ✅ | ✅ | No probado |  |
| NIF del emisor | A36651313 | ✅ | ✅ | No probado |  |
| NIF del receptor | N/A | N/A ✅ | N/A ✅ | No probado | Lo deja vacío (correcto) |
| Número de factura / ticket | 132740032509026056 | ❌ | ❌ | No probado | Leyó 32742765031756805107: el número bajo el código de barras, no el de la factura simplificada; B leyó 13274003250802B056 (dos caracteres mal) |
| IVA 1: tipo (%) | 10 | ✅ | ✅ | No probado |  |
| IVA 1: base imponible | 44,58 | ✅ | ✅ | No probado |  |
| IVA 1: cuota | 4,46 | ✅ | ✅ | No probado |  |
| IVA 2: tipo (%) | 21 | ✅ | ✅ | No probado |  |
| IVA 2: base imponible | 10,29 | ✅ | ✅ | No probado |  |
| IVA 2: cuota | 2,16 | ✅ | ✅ | No probado |  |
| IVA 3: tipo (%) | 4 | ✅ | ✅ | No probado |  |
| IVA 3: base imponible | 51,64 | ✅ | ✅ | No probado |  |
| IVA 3: cuota | 2,07 | ✅ | ✅ | No probado |  |
| Base imponible total | 106,51 | ✅ | — | No probado | B: no aparece impresa (es una suma) |
| Total | 115,20 | ✅ | ✅ | No probado |  |
| Moneda | EUR | ✅ | — | No probado | B: no aparece impresa de forma explícita |
| Categoría | Alimentación | ✅ | — | No probado |  |

### T3 · Factura PDF de suscripción en inglés

| Campo | Valor real | A · Gemini | B · Mistral | C · Azure | Notas |
|---|---|---|---|---|---|
| Fecha | 2026-10-14 | ✅ | ✅ | No probado |  |
| Emisor | Anthropic Ireland, Limited | ✅ | ✅ | No probado |  |
| NIF / VAT ID del emisor | IE4276970QH | ✅ | ✅ | No probado |  |
| NIF del receptor | N/A | N/A ✅ | N/A ✅ | No probado | Lo deja vacío (correcto) |
| Número de factura | 9BF0758D-8771996 | ✅ | ✅ | No probado |  |
| IVA 1: tipo (%) | 21 | ✅ | ✅ | No probado |  |
| IVA 1: base imponible | 18,00 | ✅ | ✅ | No probado |  |
| IVA 1: cuota | 3,78 | ✅ | ✅ | No probado |  |
| Base imponible total | 18,00 | ✅ | ✅ | No probado |  |
| Total | 21,78 | ✅ | ✅ | No probado |  |
| Moneda | EUR | ✅ | ✅ | No probado |  |
| Categoría | Software y suscripciones | ✅ | — | No probado |  |

La conversión a euros **no se mide aquí**: el motor solo tiene que detectar bien la moneda. La conversión se hará con el tipo de cambio del BCE en la fecha de la factura (issue #20).

### T4 · Foto torcida o con poca luz

| Campo | Valor real | A · Gemini | B · Mistral | C · Azure | Notas |
|---|---|---|---|---|---|
| Fecha | 2026-08-29 | ✅ | ✅ | No probado |  |
| Emisor | Cerveceria Celtica S.L. | ✅ | ✅ | No probado |  |
| NIF del emisor | B24610297 | ✅ | ✅ | No probado |  |
| NIF del receptor | N/A | N/A ✅ | N/A ✅ | No probado | Lo deja vacío (correcto) |
| Número de factura / ticket | 1 / 388087 | ✅ | ✅ | No probado |  |
| IVA 1: tipo (%) | 10 | ✅ | ✅ | No probado |  |
| IVA 1: base imponible | 19,09 | ✅ | ✅ | No probado |  |
| IVA 1: cuota | 1,91 | ✅ | ✅ | No probado |  |
| IVA 2: tipo (%) | N/A | N/A ✅ | N/A ✅ | No probado |  |
| IVA 2: base imponible | N/A | N/A ✅ | N/A ✅ | No probado |  |
| IVA 2: cuota | N/A | N/A ✅ | N/A ✅ | No probado |  |
| Base imponible total | 19,09 | ✅ | ✅ | No probado |  |
| Total | 21,00 | ✅ | ✅ | No probado |  |
| Moneda | EUR | ✅ | ❌ | No probado | B leyó "TAL FUROS" (el dedo tapa parte de "TOTAL EUROS") |
| Categoría | Restauración y dietas | ✅ | — | No probado |  |

## 6. Coste por factura

Los precios de los proveedores están en dólares; al final de este apartado se pasan a euros.

Para Gemini, AI Studio muestra los tokens de entrada y de salida de cada respuesta. Fórmula:

`coste = (tokens de entrada × precio de entrada + tokens de salida × precio de salida) ÷ 1.000.000`

Para Mistral y Azure el coste es por página: `coste = páginas × precio por página`.

| Ticket | Páginas | A · tokens entrada | A · tokens salida | A · coste ($) | B · coste ($) | C · coste ($) |
|---|---|---|---|---|---|---|
| T1 | 1 | 1.379 | 202 | 0,000919 | 0,004 | No probado |
| T2 | 1 | 1.379 | 285 | 0,001126 | 0,004 | No probado |
| T3 | 1 | 839 | 192 | 0,000732 | 0,004 | No probado |
| T4 | 1 | 1.379 | 196 | 0,000904 | 0,004 | No probado |
| **Media por factura** | | 1.244 | 219 | **0,00092** | **0,004** (solo OCR) | No probado |

Tipo de cambio usado para pasar a euros: **1 € = 1,1133 $** (tipo de referencia del BCE del 28/10/2026, el último publicado al consultarlo el 29/10/2026). Fuente: https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html

| Ticket | A · coste (€) | B · coste (€) |
|---|---|---|
| T1 | 0,000825 | 0,0036 |
| T2 | 0,001011 | 0,0036 |
| T3 | 0,000658 | 0,0036 |
| T4 | 0,000812 | 0,0036 |
| **Media por factura** | **0,00083 €** | **0,0036 €** (solo OCR) |

Para #3 (precios): con A, leer 1.000 facturas cuesta unos **0,83 €**. Es un **supuesto** que hay que revisar al fijar los precios, porque el tipo de cambio y los precios de Google pueden cambiar.

Lectura de A: unos **0,0009 $ por factura**, es decir, menos de 1 $ por cada 1.000 facturas leídas (estimación de AI Studio con los precios actuales de `gemini-3.5-flash-lite`). Las fotos de ticket consumieron 1.101 tokens cada una y el PDF, menos.

Lectura de B: 4 $ por cada 1.000 páginas según la lista de precios oficial de Mistral OCR 4.1 (0,004 $ por página de ticket). **Supuesto:** que `mistral-ocr-latest` corresponda a OCR 4.1 en la fecha de la prueba. Es solo el OCR: para obtener los campos ordenados y la categoría haría falta un segundo paso (extracción estructurada, 5 $ por 1.000 páginas, u otro modelo), que sumaría coste. La consola no muestra el coste de cada lectura.

## 7. Resumen

**Cómo se hizo la prueba de B (29/10/2026):** consola web de Mistral (Document AI), modelo `mistral-ocr-latest`, plan gratuito Experiment, sin formato de respuesta: la opción de esquema JSON hacía que la consola fallara o no guardaba los campos. Por eso se usó el OCR simple, que devuelve el texto del documento sin ordenar en campos. Textos en `tests/resultados-ia/T*-B.json`. En el plan Experiment, Mistral indica que las peticiones pueden usarse para entrenar sus modelos; se subieron solo tickets tapados.

**Cómo se hizo la prueba de A (29/10/2026):** Google AI Studio en la web, modelo `gemini-3.5-flash-lite`, nivel de razonamiento *Minimal* (el que trae por defecto), búsqueda de Google desactivada, un chat temporal nuevo por ticket y la instrucción del apartado 10 escrita en una sola línea. Una sola ejecución por ticket. Los tokens y el coste son los que muestra AI Studio en su detalle de uso, que los indica como estimación de lo que costaría la misma petición por API; en AI Studio sin clave de API no se cobra. Respuestas completas en `tests/resultados-ia/T*-A.json`.

**Límites (supuestos y advertencias):** 4 tickets y una ejecución cada uno no bastan para dar una tasa de acierto fiable; T1 no es de gasolinera; T3 está en euros, así que la detección de otra moneda sigue sin probar. Las fotos se enviaron tras pasarlas por el chat de Claude, que puede recomprimirlas.

Aciertos = número de ✅ ÷ número de campos que existen en el ticket (sin contar los N/A).

| Motor | T1 | T2 | T3 | T4 | Total aciertos | Coste medio por factura | ¿Datos en la UE? | ¿Categoría? |
|---|---|---|---|---|---|---|---|---|
| A · Gemini 3.5 Flash Lite | 12/12 | 16/17 | 11/11 | 11/11 | **50/51 (98 %)** | 0,00092 $ | No garantizado | Sí |
| B · Mistral OCR (OCR simple) | 10/10 | 13/14 | 10/10 | 9/10 | **42/44 (95 %)** de los campos impresos | 0,004 $ (solo OCR) | Sí (endpoint UE) | No medido |
| C · Azure Document Intelligence | — | — | — | — | **No probado** | — | Sí (región UE) | No |

Campos que más fallan: el número de factura de T2 (A tomó otro número del ticket; B leyó mal dos caracteres) y, en B, la palabra "EUROS" tapada por el dedo en T4. A no inventó datos ausentes: en los campos N/A devolvió vacío.

**Comparación justa:** A y B no se midieron igual. A devolvió los campos ya ordenados; B solo el texto, y se comprobó si cada dato impreso aparecía bien leído. Si a A se le cuentan solo esos mismos 44 campos impresos, acierta 43/44 (falla el número de T2).

**C · Azure, descartado para esta prueba:** crear la cuenta gratuita exige una tarjeta para verificar la identidad y el equipo decidió no aportarla. El issue pide 2 o 3 motores, así que se cumple con A y B.

## 8. Criterios de decisión (recomendación)

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
- Precisión prácticamente igual con nuestros tickets (43/44 frente a 42/44 en los campos impresos) y 4/4 en la categoría.
- Coste estimado de unos 0,0009 $ por factura, unas 4 veces menos que solo el OCR de Mistral. Este dato es el que usa #3 para los precios.

Configuración necesaria (**recomendación**, a confirmar en #5 y #4):

- **Desarrollo y pruebas:** API de Gemini (Google AI Studio) con una clave que guarda el equipo, nunca en el código del repositorio.
- **Web real:** Gemini a través de **Vertex AI con región de la UE** (multirregión `eu` o una región europea), para que el tratamiento quede en la UE. Requiere una cuenta de pago de Google Cloud: decisión pendiente del equipo.
- **No usar el nivel gratuito con datos de clientes:** según las condiciones de Google, el contenido del servicio gratuito puede usarse para mejorar sus productos.
- Precio de referencia: 0,30 $ por millón de tokens de entrada y 2,50 $ por millón de salida (consultado el 29/10/2026). Revisar antes de fijar precios, porque Google ha anunciado subidas en otros modelos Flash.

Alternativa si el equipo exige tratamiento en la UE sin cuenta de Google Cloud: **B · Mistral** (endpoint `api.eu.mistral.ai`), añadiendo un paso de extracción estructurada y repitiendo la prueba.

Riesgos y qué hará la pantalla de corrección (#21) para cubrirlos:

- **Número de factura:** fue el único campo que falló, al confundirlo con otro número del ticket. La pantalla de corrección debe mostrarlo junto a la imagen para comprobarlo de un vistazo.
- **Datos ausentes:** el motor deja vacíos los que no aparecen. La pantalla debe marcar esos campos para que el usuario los rellene si los conoce.
- **Moneda distinta del euro:** sin probar. Queda pendiente para #20 y #31.
- **Muestra pequeña:** repetir la prueba con más tickets en #31, incluido uno real de gasolinera.

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
