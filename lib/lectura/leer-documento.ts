/**
 * Leer un documento ya guardado (#19): los pasos de la ruta /api/leer.
 *
 * 1. Comprobar que el documento es del usuario (cliente con su sesión: RLS).
 * 2. Reservar la lectura en el contador del plan (`reservar_lectura`, D4).
 *    Si no le quedan, se para aquí y el original sigue guardado (E6).
 * 3. Descargar el original del bucket privado.
 * 4. Leerlo con Gemini y comprobar la respuesta (interpretar.ts).
 * 5. Guardar la factura y sus líneas de IVA. Si ya existía (volver a leer),
 *    se sustituyen sus datos.
 * 6. Marcar el documento como `leido`, o `error` si algo ha fallado.
 *
 * Los clientes y la llamada a Gemini se pasan desde fuera para poder probarlo
 * sin conectarse a nada (tests/unit/lectura.test.mjs).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ResultadoLectura } from "../subida/contrato";
import { BUCKET_ORIGINALES } from "../subida/originales.ts";
import { aFilas, interpretarRespuesta } from "./interpretar.ts";

export type Leer = (archivo: { bytes: ArrayBuffer; tipo: string }) => Promise<{
  texto: string;
  modelo: string;
  tokensEntrada: number | null;
  tokensSalida: number | null;
}>;

export type Dependencias = {
  /** Cliente con la sesión del usuario (clave publicable). */
  usuario: SupabaseClient;
  /** Cliente con la clave secreta: solo después de comprobar que el documento es suyo. */
  admin: () => SupabaseClient;
  leer: Leer;
  ahora?: () => Date;
};

export type ResultadoRuta = ResultadoLectura | { estado: "no-encontrado" };

export async function leerDocumentoGuardado(deps: Dependencias, documentoId: string): Promise<ResultadoRuta> {
  // 1. ¿Es suyo? Con RLS, si no lo es, no lo ve.
  const { data: doc, error: errorDoc } = await deps.usuario
    .from("documentos")
    .select("id, user_id, ruta_storage, tipo_mime")
    .eq("id", documentoId)
    .maybeSingle();
  if (errorDoc) throw new Error(`No se ha podido buscar el documento: ${errorDoc.message}`);
  if (!doc) return { estado: "no-encontrado" };

  const admin = deps.admin();

  // 2. Contador del plan. Volver a leer un documento ya contado no suma.
  const { data: hayCupo, error: errorCupo } = await admin.rpc("reservar_lectura", { p_documento_id: doc.id });
  if (errorCupo) throw new Error(`No se ha podido comprobar el límite del plan: ${errorCupo.message}`);
  if (hayCupo !== true) return { estado: "sin-lecturas" };

  async function marcar(estado: "leido" | "error") {
    await admin.from("documentos").update({ estado_lectura: estado }).eq("id", doc!.id);
  }

  try {
    // 3. El original.
    const { data: blob, error: errorDescarga } = await deps.usuario.storage.from(BUCKET_ORIGINALES).download(doc.ruta_storage);
    if (errorDescarga || !blob) throw new Error(`No se ha podido abrir el original: ${errorDescarga?.message ?? "vacío"}`);

    // 4. Gemini y comprobación.
    const respuesta = await deps.leer({ bytes: await blob.arrayBuffer(), tipo: doc.tipo_mime });
    const datos = interpretarRespuesta(respuesta.texto);
    let respuestaOriginal: unknown = respuesta.texto;
    try {
      respuestaOriginal = JSON.parse(respuesta.texto.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""));
    } catch {
      // se guarda el texto tal cual
    }
    const datosIa = {
      modelo: respuesta.modelo,
      leido_en: (deps.ahora?.() ?? new Date()).toISOString(),
      tokens_entrada: respuesta.tokensEntrada,
      tokens_salida: respuesta.tokensSalida,
      respuesta: respuestaOriginal,
    };

    // 5. Guardar.
    const { data: cats, error: errorCats } = await admin.from("categorias").select("id, nombre");
    if (errorCats) throw new Error(`No se han podido leer las categorías: ${errorCats.message}`);
    const ids = new Map<string, number>((cats ?? []).map((c: { id: number; nombre: string }) => [c.nombre, c.id]));
    const { factura, lineas } = aFilas(datos, ids, datosIa);

    const { data: existente, error: errorExistente } = await admin.from("facturas").select("id").eq("documento_id", doc.id).maybeSingle();
    if (errorExistente) throw new Error(`No se ha podido buscar la factura: ${errorExistente.message}`);

    let facturaId: string;
    if (existente) {
      facturaId = existente.id;
      const { error } = await admin
        .from("facturas")
        .update({ ...factura, actualizado_en: (deps.ahora?.() ?? new Date()).toISOString() })
        .eq("id", facturaId);
      if (error) throw new Error(`No se ha podido actualizar la factura: ${error.message}`);
      const { error: errorBorrar } = await admin.from("lineas_iva").delete().eq("factura_id", facturaId);
      if (errorBorrar) throw new Error(`No se han podido sustituir las líneas de IVA: ${errorBorrar.message}`);
    } else {
      const { data: nueva, error } = await admin
        .from("facturas")
        .insert({ ...factura, user_id: doc.user_id, documento_id: doc.id })
        .select("id")
        .single();
      if (error || !nueva) throw new Error(`No se ha podido guardar la factura: ${error?.message ?? "sin respuesta"}`);
      facturaId = nueva.id;
    }

    if (lineas.length > 0) {
      const { error } = await admin.from("lineas_iva").insert(lineas.map((l) => ({ ...l, user_id: doc.user_id, factura_id: facturaId })));
      if (error) throw new Error(`No se han podido guardar las líneas de IVA: ${error.message}`);
    }

    // 6. Listo.
    await marcar("leido");
    return { estado: "leido", facturaId };
  } catch (e) {
    await marcar("error");
    return { estado: "error", mensaje: e instanceof Error ? e.message : "Error al leer el documento." };
  }
}
