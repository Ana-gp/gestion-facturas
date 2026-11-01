/**
 * Huella del archivo para detectar un archivo repetido antes de subirlo
 * (tarea 22, issue #22; estado E4 del mapa de pantallas).
 *
 * Decisión D1 del modelo de datos: la huella SHA-256 se calcula en el navegador
 * antes de subir. Si el usuario ya tiene un documento con la misma huella, es
 * exactamente el mismo archivo: no se vuelve a subir ni gasta lectura, y se
 * enlaza al que ya existe. Los demás casos de duplicado (mismo ticket en otra
 * foto, foto y PDF de la misma factura) los detecta la función
 * `buscar_duplicados` de la base de datos después de leer.
 *
 * Usa Web Crypto, disponible en el navegador y en Node 18 o posterior.
 */

/** Huella SHA-256 en hexadecimal (64 caracteres), igual que `documentos.huella_sha256`. */
export async function huellaSha256(datos: Blob | ArrayBuffer | Uint8Array): Promise<string> {
  let bytes: ArrayBuffer;
  if (datos instanceof Uint8Array) {
    bytes = datos.slice().buffer;
  } else if (datos instanceof ArrayBuffer) {
    bytes = datos;
  } else {
    bytes = await datos.arrayBuffer();
  }
  const resumen = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(resumen)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export type DocumentoExistente = {
  documentoId: string;
  huella: string;
  /** Fecha de subida, AAAA-MM-DD. */
  subidoEl: string;
};

/** El documento que ya tiene la misma huella, o null si el archivo es nuevo. */
export function archivoRepetido(huella: string, existentes: DocumentoExistente[]): DocumentoExistente | null {
  const buscada = huella.toLowerCase();
  return existentes.find((d) => d.huella.toLowerCase() === buscada) ?? null;
}

/** Mensaje del estado E4: "Ya subiste este archivo el dd/mm/aaaa." */
export function mensajeArchivoRepetido(doc: DocumentoExistente): string {
  const [a, m, d] = doc.subidoEl.split("-");
  return `Ya subiste este archivo el ${d}/${m}/${a}.`;
}
