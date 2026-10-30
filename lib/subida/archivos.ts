/**
 * Qué archivos se admiten en la subida (#14 foto con el móvil, #15 arrastrar
 * desde el ordenador). Mapa de pantallas #54: P08 Subir y P09 Subiendo y leyendo.
 */

/** Formatos admitidos: PDF, JPG, PNG y HEIC (las fotos del iPhone). */
export const FORMATOS = [
  { tipo: "application/pdf", extensiones: ["pdf"], nombre: "PDF" },
  { tipo: "image/jpeg", extensiones: ["jpg", "jpeg"], nombre: "JPG" },
  { tipo: "image/png", extensiones: ["png"], nombre: "PNG" },
  { tipo: "image/heic", extensiones: ["heic", "heif"], nombre: "HEIC" },
] as const;

/** Valor para el atributo `accept` de los campos de archivo. */
export const ACEPTA = [...FORMATOS.map((f) => f.tipo), "image/heif", ...FORMATOS.flatMap((f) => f.extensiones.map((e) => `.${e}`))].join(",");

/**
 * Tamaño máximo por archivo. [Propuesta] 10 MB: una foto de móvil ocupa entre
 * 2 y 6 MB y un PDF de factura, menos de 1 MB. [Pendiente] Confirmar con el
 * límite que se configure en Supabase Storage (#18).
 */
export const TAMANO_MAXIMO_MB = 10;

export type ResultadoValidacion = { valido: true; formato: string } | { valido: false; motivo: "formato" | "tamano" | "vacio"; mensaje: string };

function extension(nombre: string): string {
  const punto = nombre.lastIndexOf(".");
  return punto < 0 ? "" : nombre.slice(punto + 1).toLowerCase();
}

/**
 * Comprueba el formato y el tamaño. Se mira el tipo y, si el navegador no lo
 * da (pasa con HEIC en algunos ordenadores), la extensión.
 */
export function validarArchivo(archivo: { name: string; type: string; size: number }): ResultadoValidacion {
  if (archivo.size === 0) return { valido: false, motivo: "vacio", mensaje: "El archivo está vacío." };
  const tipo = archivo.type.toLowerCase();
  const ext = extension(archivo.name);
  const formato = FORMATOS.find(
    (f) => f.tipo === tipo || (tipo === "image/heif" && f.nombre === "HEIC") || ((tipo === "" || tipo === "application/octet-stream") && (f.extensiones as readonly string[]).includes(ext)),
  );
  if (!formato) {
    return { valido: false, motivo: "formato", mensaje: "Este formato no se admite. Sube un PDF o una foto en JPG, PNG o HEIC." };
  }
  if (archivo.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
    return { valido: false, motivo: "tamano", mensaje: `El archivo ocupa más de ${TAMANO_MAXIMO_MB} MB. Prueba con una foto de menos resolución o un PDF más ligero.` };
  }
  return { valido: true, formato: formato.nombre };
}

/** «2,4 MB», «850 KB». */
export function tamanoLegible(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString("es-ES", { maximumFractionDigits: 1 })} MB`;
}
