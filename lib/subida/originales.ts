/**
 * Guardar el original (#18): dónde y con qué tipo se guarda cada archivo en
 * el bucket privado `originales` de Supabase Storage.
 *
 * - Ruta: `<user_id>/<uuid>.<extensión>`. La primera carpeta tiene que ser el
 *   propio usuario: lo exigen las reglas de Storage y el CHECK de
 *   `documentos.ruta_storage` (docs/modelo-datos.sql).
 * - El `uuid` del archivo no es el id de la fila de `documentos`, porque ese
 *   id lo pone la base de datos y el usuario no lo puede elegir (permisos de
 *   la tabla). Lo que los une es la columna `ruta_storage`.
 * - Tipo (contentType): hay que indicarlo siempre. Si no, Supabase lo trata
 *   como texto y el bucket lo rechaza. Algunos ordenadores no dan el tipo de
 *   las fotos HEIC del iPhone, así que se deduce de la extensión.
 */

/** Nombre del bucket privado (docs/modelo-datos.sql, apartado 5). */
export const BUCKET_ORIGINALES = "originales";

/** Lo que dura un enlace para ver o descargar un original: 10 minutos. */
export const SEGUNDOS_ENLACE_ORIGINAL = 600;

/** Tipos que admite el bucket y la extensión con la que se guardan. */
const TIPOS: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/heic": "heic",
  "image/heif": "heif",
};

const POR_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  heic: "image/heic",
  heif: "image/heif",
};

/** El tipo con el que se guarda, o null si no es PDF, JPG, PNG ni HEIC. */
export function tipoDelOriginal(archivo: { name: string; type: string }): string | null {
  const tipo = archivo.type.trim().toLowerCase();
  if (tipo === "image/jpg") return "image/jpeg";
  if (TIPOS[tipo]) return tipo;
  if (tipo === "" || tipo === "application/octet-stream") {
    const punto = archivo.name.lastIndexOf(".");
    const ext = punto < 0 ? "" : archivo.name.slice(punto + 1).toLowerCase();
    return POR_EXTENSION[ext] ?? null;
  }
  return null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** `<user_id>/<uuid>.<extensión>`. Lanza un error si algún dato no es válido. */
export function rutaDelOriginal(userId: string, archivoId: string, tipo: string): string {
  if (!UUID.test(userId)) throw new Error("Usuario no válido.");
  if (!UUID.test(archivoId)) throw new Error("Identificador de archivo no válido.");
  const ext = TIPOS[tipo];
  if (!ext) throw new Error(`Tipo no admitido: ${tipo}`);
  return `${userId}/${archivoId.toLowerCase()}.${ext}`;
}

/** "JPG", "PDF", "HEIC"… para el pie de la pantalla del original. */
export function nombreDelFormato(tipo: string): string {
  return (TIPOS[tipo] ?? tipo.split("/").pop() ?? "").toUpperCase();
}

/** ¿Se enseña como PDF (visor del navegador) o como imagen? */
export function esPdf(tipo: string): boolean {
  return tipo === "application/pdf";
}

/**
 * ¿Lo puede pintar el navegador? Los HEIC solo los enseña Safari: en los
 * demás se ofrece descargarlos.
 */
export function seVeEnElNavegador(tipo: string): boolean {
  return tipo === "application/pdf" || tipo === "image/jpeg" || tipo === "image/png";
}
