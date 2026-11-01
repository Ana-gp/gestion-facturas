/**
 * Ver el original desde la ficha (#18, pantalla P12 y P10).
 *
 * El bucket `originales` es privado: no hay una dirección fija para ver un
 * archivo. Se pide a Supabase un enlace firmado que caduca a los 10 minutos.
 * Solo lo consigue el dueño del archivo, por las reglas de Storage.
 * Se hace en el servidor (page.tsx) con `clienteServidor()`.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { BUCKET_ORIGINALES, SEGUNDOS_ENLACE_ORIGINAL } from "./originales.ts";

export type OriginalParaVer = {
  documentoId: string;
  facturaId: string | null;
  nombreArchivo: string;
  tipo: string;
  tamanoBytes: number;
  /** AAAA-MM-DD */
  subidoEl: string;
  /** Enlace temporal para enseñarlo. */
  url: string;
  /** Enlace temporal que descarga el archivo con su nombre. */
  urlDescarga: string;
  /** Datos de la factura, si ya se ha leído. */
  emisor: string | null;
  fecha: string | null;
  total: number | null;
  moneda: string | null;
};

/** El original de un documento del usuario que ha entrado, o null si no existe o no es suyo. */
export async function originalParaVer(supabase: SupabaseClient, documentoId: string): Promise<OriginalParaVer | null> {
  const { data: doc, error } = await supabase
    .from("documentos")
    .select("id, ruta_storage, nombre_archivo, tipo_mime, tamano_bytes, subido_en")
    .eq("id", documentoId)
    .maybeSingle();
  if (error) throw new Error(`No se ha podido buscar el documento: ${error.message}`);
  if (!doc) return null;

  const nombre = doc.nombre_archivo || doc.ruta_storage.split("/").pop() || "original";
  const almacen = supabase.storage.from(BUCKET_ORIGINALES);
  const [ver, descargar, factura] = await Promise.all([
    almacen.createSignedUrl(doc.ruta_storage, SEGUNDOS_ENLACE_ORIGINAL),
    almacen.createSignedUrl(doc.ruta_storage, SEGUNDOS_ENLACE_ORIGINAL, { download: nombre }),
    supabase.from("facturas").select("id, emisor_nombre, fecha, total, moneda").eq("documento_id", doc.id).maybeSingle(),
  ]);
  if (ver.error || !ver.data) throw new Error(`No se ha podido abrir el original: ${ver.error?.message ?? "sin enlace"}`);
  if (descargar.error || !descargar.data) throw new Error(`No se ha podido preparar la descarga: ${descargar.error?.message ?? "sin enlace"}`);

  return {
    documentoId: doc.id,
    facturaId: factura.data?.id ?? null,
    nombreArchivo: nombre,
    tipo: doc.tipo_mime,
    tamanoBytes: Number(doc.tamano_bytes),
    subidoEl: String(doc.subido_en).slice(0, 10),
    url: ver.data.signedUrl,
    urlDescarga: descargar.data.signedUrl,
    emisor: factura.data?.emisor_nombre ?? null,
    fecha: factura.data?.fecha ?? null,
    total: factura.data?.total === null || factura.data?.total === undefined ? null : Number(factura.data.total),
    moneda: factura.data?.moneda ?? null,
  };
}
