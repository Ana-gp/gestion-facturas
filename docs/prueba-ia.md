# Prueba de concepto de lectura con IA

Issue: #6 · Bloque 2 (subida y lectura) · Responsable: Mireia
Depende de: #5 (stack) y #10 (banco de tickets) · Alimenta: #5 (elección del motor), #3 (precios), #19 (lectura automática)

> **Estado: PENDIENTE DE PRUEBA.** Ninguna tabla de resultados está rellenada todavía. Hasta que lo esté, no se puede afirmar que ningún motor lea bien nuestros tickets.

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
| Coste por factura | Depende de los tokens: se mide en la prueba | ≈ 0,005 $ por página (0,0055 $ con endpoint UE) | ≈ 0,01 $ por página |
| ¿Datos en la UE? | **No garantizado** con la API de Google AI Studio. Sí es posible con Vertex AI en región UE (otra configuración) | Por defecto, almacenamiento en la UE; para procesar solo en la UE hay que usar el endpoint `api.eu.mistral.ai` (+10 %). No confirmado que OCR esté disponible en ese endpoint | Se procesa en la región donde se crea el recurso (p. ej. *West Europe*); entrada y resultados se borran a las 24 h |
| ¿Se puede probar sin programar? | Sí: Google AI Studio (web) | **Por confirmar**: la consola tiene un *Playground*, pero no consta que permita subir documentos al OCR | Sí: Document Intelligence Studio (web) |
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

**Privacidad:** se usan solo tickets propios. Antes de subirlos se han tapado los datos personales que no forman parte de la prueba: números de tarjeta, números de socio o cliente, nombres del personal y, en T3, el nombre, la dirección y el correo del receptor (pixelado en las fotos; tachado con eliminación real del texto en los PDF). Por eso, en T3 el nombre del receptor no se puede comprobar; el receptor no tiene NIF en esa factura.

## 4. Cómo se rellenan las tablas

1. **Antes de pasar ningún motor**, escribir en la columna "Valor real" lo que pone de verdad en el ticket. Es la referencia con la que se compara.
2. Pasar el ticket por cada motor y anotar en su columna:
   - ✅ **Correcto**: coincide exactamente (importes con 2 decimales, fecha del mismo día, NIF con todas sus letras y números).
   - ❌ **Incorrecto**: da un valor distinto del real.
   - ⬜ **Vacío**: no devuelve nada en un campo que sí aparece en el ticket.
   - **N/A**: el dato no existe en el ticket (por ejemplo, el NIF del receptor en un ticket de supermercado). Si el motor lo deja vacío, es lo correcto; si se lo inventa, es ❌.
3. Si algo es ❌, apuntar en "Notas" qué dio (por ejemplo, "leyó 12,30 en vez de 12,80").
4. Guardar la respuesta completa de cada motor en `tests/resultados-ia/` con el nombre `T1-A.json`, `T1-B.json`, etc.

Categorías provisionales (**supuesto**, a revisar cuando se cierren #2 y #7): Combustible y transporte · Alimentación · Restauración y dietas · Software y suscripciones · Telefonía e internet · Material de oficina · Suministros · Alojamiento y viajes · Formación · Otros.

## 5. Resultados por ticket

### T1 · Gasolinera arrugado

| Campo | Valor real | A · Gemini | B · Mistral | C · Azure | Notas |
|---|---|---|---|---|---|
| Fecha | | | | | |
| Emisor | | | | | |
| NIF del emisor | | | | | |
| NIF del receptor | | | | | |
| Número de factura / ticket | | | | | |
| IVA 1: tipo (%) | | | | | |
| IVA 1: base imponible | | | | | |
| IVA 1: cuota | | | | | |
| IVA 2: tipo (%) | | | | | |
| IVA 2: base imponible | | | | | |
| IVA 2: cuota | | | | | |
| Base imponible total | | | | | |
| Total | | | | | |
| Moneda | | | | | |
| Categoría | | | | | |

### T2 · Supermercado con varios tipos de IVA

| Campo | Valor real | A · Gemini | B · Mistral | C · Azure | Notas |
|---|---|---|---|---|---|
| Fecha | | | | | |
| Emisor | | | | | |
| NIF del emisor | | | | | |
| NIF del receptor | | | | | |
| Número de factura / ticket | | | | | |
| IVA 1: tipo (%) | | | | | |
| IVA 1: base imponible | | | | | |
| IVA 1: cuota | | | | | |
| IVA 2: tipo (%) | | | | | |
| IVA 2: base imponible | | | | | |
| IVA 2: cuota | | | | | |
| IVA 3: tipo (%) | | | | | |
| IVA 3: base imponible | | | | | |
| IVA 3: cuota | | | | | |
| Base imponible total | | | | | |
| Total | | | | | |
| Moneda | | | | | |
| Categoría | | | | | |

### T3 · Factura PDF de suscripción en inglés

| Campo | Valor real | A · Gemini | B · Mistral | C · Azure | Notas |
|---|---|---|---|---|---|
| Fecha | | | | | |
| Emisor | | | | | |
| NIF / VAT ID del emisor | | | | | |
| NIF del receptor | | | | | |
| Número de factura | | | | | |
| IVA 1: tipo (%) | | | | | |
| IVA 1: base imponible | | | | | |
| IVA 1: cuota | | | | | |
| Base imponible total | | | | | |
| Total | | | | | |
| Moneda | | | | | |
| Categoría | | | | | |

La conversión a euros **no se mide aquí**: el motor solo tiene que detectar bien la moneda. La conversión se hará con el tipo de cambio del BCE en la fecha de la factura (issue #20).

### T4 · Foto torcida o con poca luz

| Campo | Valor real | A · Gemini | B · Mistral | C · Azure | Notas |
|---|---|---|---|---|---|
| Fecha | | | | | |
| Emisor | | | | | |
| NIF del emisor | | | | | |
| NIF del receptor | | | | | |
| Número de factura / ticket | | | | | |
| IVA 1: tipo (%) | | | | | |
| IVA 1: base imponible | | | | | |
| IVA 1: cuota | | | | | |
| IVA 2: tipo (%) | | | | | |
| IVA 2: base imponible | | | | | |
| IVA 2: cuota | | | | | |
| Base imponible total | | | | | |
| Total | | | | | |
| Moneda | | | | | |
| Categoría | | | | | |

## 6. Coste por factura

Para Gemini, AI Studio muestra los tokens de entrada y de salida de cada respuesta. Fórmula:

`coste = (tokens de entrada × precio de entrada + tokens de salida × precio de salida) ÷ 1.000.000`

Para Mistral y Azure el coste es por página: `coste = páginas × precio por página`.

| Ticket | Páginas | A · tokens entrada | A · tokens salida | A · coste ($) | B · coste ($) | C · coste ($) |
|---|---|---|---|---|---|---|
| T1 | | | | | | |
| T2 | | | | | | |
| T3 | | | | | | |
| T4 | | | | | | |
| **Media por factura** | | | | | | |

Tipo de cambio usado para pasar a euros: ______ (fuente BCE, fecha ______).

## 7. Resumen

Aciertos = número de ✅ ÷ número de campos que existen en el ticket (sin contar los N/A).

| Motor | T1 | T2 | T3 | T4 | Total aciertos | Coste medio por factura | ¿Datos en la UE? | ¿Categoría? |
|---|---|---|---|---|---|---|---|---|
| A · Gemini Flash-Lite | | | | | | | No garantizado | Sí |
| B · Mistral OCR 4.1 | | | | | | | Sí (endpoint UE) | Sí |
| C · Azure Document Intelligence | | | | | | | Sí (región UE) | No |

Campos que más fallan: ______

## 8. Criterios de decisión (recomendación)

Por orden de importancia:

1. **Importes e IVA correctos** (total, bases, tipos y cuotas). Un error aquí llega a la gestoría.
2. **NIF del emisor y fecha correctos.**
3. **Coste por factura** asumible dentro de los precios de #3.
4. **Datos tratados en la UE** o con garantías equivalentes (lo confirma #4, normativa).
5. **Facilidad de integración** en el stack de #5.

Si dos motores empatan en precisión, se elige el que trate los datos en la UE.

## 9. Decisión

Motor elegido: ______

Motivo: ______

Configuración necesaria (cuenta, región, modelo exacto): ______

Riesgos y qué hará la pantalla de corrección (#21) para cubrirlos: ______

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
