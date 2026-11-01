/**
 * Motivo por el que dos documentos pueden ser el mismo gasto (#22).
 *
 * Las mismas tres reglas que la función SQL `buscar_duplicados`
 * (docs/modelo-datos.sql, decisión D1). La base de datos es la que busca los
 * duplicados; esta función sirve para explicar el motivo en la pantalla
 * «Comparar posible duplicado» (P11) y para probar las reglas.
 *
 * Un posible duplicado nunca bloquea guardar ni exportar: solo avisa.
 */

export type DocumentoComparable = {
  emisorNombre: string | null;
  emisorNif: string | null;
  numero: string | null;
  fecha: string | null;
  total: number | null;
  /** SHA-256 del archivo original, calculada en el navegador (lib/subida/huella.ts). */
  huella?: string | null;
};

export type MotivoDuplicado = "mismo-archivo" | "mismo-nif-numero-total" | "mismo-emisor-fecha-total";

export const TEXTO_MOTIVO: Record<MotivoDuplicado, string> = {
  "mismo-archivo": "Es exactamente el mismo archivo.",
  "mismo-nif-numero-total": "Tienen el mismo NIF del emisor, el mismo número y el mismo total.",
  "mismo-emisor-fecha-total": "Tienen el mismo emisor, la misma fecha y el mismo total.",
};

/** Igual que `emisor_nif_norm` y `numero_norm` en SQL: sin espacios, guiones ni barras, en mayúsculas. */
export function normalizar(valor: string | null): string | null {
  if (valor === null) return null;
  const limpio = valor.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
  return limpio === "" ? null : limpio;
}

function mismoImporte(a: number | null, b: number | null): boolean {
  return a !== null && b !== null && Math.round(a * 100) === Math.round(b * 100);
}

/**
 * Devuelve el motivo por el que `b` podría ser un duplicado de `a`, o null.
 * Se comprueba en el mismo orden que en SQL. La regla 3 solo se aplica si a
 * `a` le falta el NIF o el número (si los tiene, manda la regla 2).
 */
export function motivoDuplicado(a: DocumentoComparable, b: DocumentoComparable): MotivoDuplicado | null {
  if (a.huella && b.huella && a.huella === b.huella) return "mismo-archivo";

  const nifA = normalizar(a.emisorNif);
  const numeroA = normalizar(a.numero);
  if (nifA !== null && numeroA !== null) {
    if (nifA === normalizar(b.emisorNif) && numeroA === normalizar(b.numero) && mismoImporte(a.total, b.total)) {
      return "mismo-nif-numero-total";
    }
    return null;
  }

  const emisorA = a.emisorNombre?.trim().toLowerCase();
  const emisorB = b.emisorNombre?.trim().toLowerCase();
  if (emisorA && emisorA === emisorB && a.fecha !== null && a.fecha === b.fecha && mismoImporte(a.total, b.total)) {
    return "mismo-emisor-fecha-total";
  }
  return null;
}
