/**
 * Instrucción y modelo de la lectura con IA (#19).
 *
 * Parte de la instrucción probada en el #6 (docs/prueba-ia.md, apartado 10),
 * con los mismos nombres de campo para que sigan valiendo las respuestas
 * guardadas en tests/resultados-ia/. Se añade lo que pide el modelo de datos
 * (docs/modelo-datos.md, apartado 8.2, punto 3):
 * - "tipo_documento": ticket o factura (D5).
 * - "retencion": la retención de IRPF, si la hay (D6).
 * - "campos_dudosos": los datos que la IA no ha podido leer con claridad (D2).
 *
 * Probada en AI Studio el 01/11/2026 con T1, T2, T3 y T4b: 54/56 aciertos
 * (docs/lectura-ia.md, apartado 3). "campos_dudosos" salió vacío incluso donde
 * falló: solo baja la confianza, nunca la sube.
 */

/** Modelo elegido en el #6 (docs/prueba-ia.md, apartado 9). */
export const MODELO_GEMINI = "gemini-3.5-flash-lite";

/** Las 10 categorías de docs/modelo-datos.sql, en el mismo orden. */
export const CATEGORIAS_LECTURA = [
  "Combustible y transporte",
  "Alimentación",
  "Restauración y dietas",
  "Software y suscripciones",
  "Telefonía e internet",
  "Material de oficina",
  "Suministros",
  "Alojamiento y viajes",
  "Formación",
  "Otros",
] as const;

/** Nombres que se pueden poner en "campos_dudosos". */
export const CAMPOS_DUDOSOS = [
  "fecha",
  "emisor",
  "nif_emisor",
  "nif_receptor",
  "numero_factura",
  "lineas_iva",
  "total",
  "moneda",
  "categoria",
] as const;

export const INSTRUCCION = `Eres un asistente que extrae datos de facturas y tickets de gasto españoles o extranjeros.
Lee el documento adjunto y responde SOLO con un JSON con esta estructura:

{
  "tipo_documento": "ticket o factura",
  "fecha": "AAAA-MM-DD",
  "emisor": "nombre del emisor",
  "nif_emisor": "NIF, CIF o VAT ID del emisor",
  "nif_receptor": "NIF del receptor o null si no aparece",
  "numero_factura": "número de factura o ticket",
  "lineas_iva": [
    { "tipo": 21, "base": 0.00, "cuota": 0.00 }
  ],
  "base_imponible_total": 0.00,
  "retencion": { "tipo": 15, "importe": 0.00 },
  "total": 0.00,
  "moneda": "código ISO 4217, por ejemplo EUR o USD",
  "categoria": "una de: ${CATEGORIAS_LECTURA.join(", ")}",
  "campos_dudosos": ["nombres de los campos que no se leen con claridad"]
}

Reglas:
- Si un dato no aparece en el documento, pon null. No te lo inventes.
- En los tickets y facturas españoles la fecha va como día/mes/año: 02/10/2026 es el 2 de octubre de 2026 ("2026-10-02"), no el 10 de febrero.
- Pon una línea en "lineas_iva" por cada tipo de IVA distinto.
- Usa punto como separador decimal.
- "tipo_documento" es "factura" si aparecen los datos fiscales del receptor (nombre y NIF); si no, "ticket".
- "retencion" es la retención de IRPF que se resta del total. Si no hay retención, pon null.
- En "campos_dudosos" pon solo nombres de esta lista: ${CAMPOS_DUDOSOS.join(", ")}. Si todo se lee con claridad, pon [].`;
