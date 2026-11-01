/**
 * Implementación real del contrato de la subida (lib/subida/contrato.ts) con
 * Supabase (#18): buscar el mismo archivo y guardar el original.
 *
 * Lo usa la pantalla de Ana (app/subir) cuando hay sesión iniciada. Todo pasa
 * con la clave publicable y la sesión del usuario: las reglas RLS de la tabla
 * `documentos` y del bucket `originales` hacen que cada usuario solo vea y
 * guarde lo suyo.
 *
 * La lectura con IA (`leerDocumento`) es del #19. Mientras no esté, devuelve
 * un error de lectura: el original ya ha quedado guardado y la pantalla lo
 * dice ("No hemos podido leer este documento. El original está guardado").
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { DocumentoEncontrado, OrigenSubida, ResultadoLectura, ServiciosSubida } from "./contrato";
import { BUCKET_ORIGINALES, rutaDelOriginal, tipoDelOriginal } from "./originales.ts";

type Opciones = {
  /** Lectura con IA (#19). Si no se pasa, la lectura da error y el original queda guardado. */
  leerDocumento?: (documentoId: string) => Promise<ResultadoLectura>;
  /** Para las pruebas: genera el nombre del archivo. Por defecto, crypto.randomUUID(). */
  nuevoId?: () => string;
};

export function serviciosSupabase(supabase: SupabaseClient, userId: string, opciones: Opciones = {}): ServiciosSubida {
  const nuevoId = opciones.nuevoId ?? (() => globalThis.crypto.randomUUID());

  return {
    async buscarPorHuella(huella: string): Promise<DocumentoEncontrado | null> {
      const { data: doc, error } = await supabase
        .from("documentos")
        .select("id, huella_sha256, subido_en")
        .eq("huella_sha256", huella.toLowerCase())
        .order("subido_en", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(`No se ha podido comprobar si el archivo ya estaba subido: ${error.message}`);
      if (!doc) return null;

      const { data: factura, error: errorFactura } = await supabase
        .from("facturas")
        .select("id")
        .eq("documento_id", doc.id)
        .maybeSingle();
      if (errorFactura) throw new Error(`No se ha podido buscar la factura del documento: ${errorFactura.message}`);

      return {
        documentoId: doc.id,
        huella: doc.huella_sha256,
        subidoEl: String(doc.subido_en).slice(0, 10),
        facturaId: factura?.id ?? null,
      };
    },

    async subirDocumento(archivo: File, huella: string, origen: OrigenSubida) {
      const tipo = tipoDelOriginal(archivo);
      if (!tipo) throw new Error("Este formato no se admite. Sube un PDF o una foto en JPG, PNG o HEIC.");
      const ruta = rutaDelOriginal(userId, nuevoId(), tipo);

      // 1. El archivo, tal cual, sin sobrescribir nunca otro.
      const { error: errorSubida } = await supabase.storage
        .from(BUCKET_ORIGINALES)
        .upload(ruta, archivo, { contentType: tipo, upsert: false, cacheControl: "3600" });
      if (errorSubida) throw new Error(`No se ha podido guardar el original: ${errorSubida.message}`);

      // 2. Su ficha en `documentos`, enlazada por la ruta.
      const { data, error: errorFila } = await supabase
        .from("documentos")
        .insert({
          user_id: userId,
          ruta_storage: ruta,
          nombre_archivo: archivo.name || null,
          tipo_mime: tipo,
          tamano_bytes: archivo.size,
          huella_sha256: huella.toLowerCase(),
          origen,
        })
        .select("id")
        .single();

      if (errorFila || !data) {
        // Sin ficha, el archivo quedaría suelto: se borra.
        await supabase.storage.from(BUCKET_ORIGINALES).remove([ruta]);
        throw new Error(`No se ha podido registrar el documento: ${errorFila?.message ?? "sin respuesta"}`);
      }

      return { documentoId: data.id as string };
    },

    async leerDocumento(documentoId: string): Promise<ResultadoLectura> {
      if (opciones.leerDocumento) return opciones.leerDocumento(documentoId);
      return { estado: "error", mensaje: "La lectura con IA todavía no está conectada (#19). El original está guardado." };
    },
  };
}
