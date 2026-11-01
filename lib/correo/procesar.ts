/**
 * Procesar un correo reenviado (#16): de Resend a facturas del usuario.
 *
 * 1. Pedir a Resend el correo (remitente, destinatarios, Message-ID).
 * 2. Buscar al usuario por el código de la dirección `facturas-<código>@…`.
 * 3. Descartar el correo si el remitente no es el de su cuenta ni uno de sus
 *    correos autorizados (DP5 del mapa de pantallas). No se guarda nada.
 * 4. Si ese correo ya se procesó (Resend repite el aviso si tardamos), no hacer nada.
 * 5. Cada adjunto PDF, JPG, PNG o HEIC de hasta 10 MB se guarda como original
 *    (#18, origen "correo") y se lee con IA (#19). Si el mismo archivo ya
 *    estaba (misma huella), no se vuelve a guardar ni gasta lectura.
 *
 * Todo con la clave secreta (no hay sesión: el aviso llega de Resend), pero
 * siempre con el user_id del dueño de la dirección.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { huellaSha256 } from "../subida/huella.ts";
import { BUCKET_ORIGINALES, rutaDelOriginal, tipoDelOriginal } from "../subida/originales.ts";
import { codigoDeDestinatarios, correoLimpio } from "./direccion.ts";

export const MAX_ADJUNTOS = 5;
const MAX_BYTES = 10 * 1024 * 1024;

export type CorreoRecibido = { from: string; to: string[]; message_id: string | null };
export type Adjunto = { filename: string | null; content_type: string | null; content_disposition: string | null; size: number | null; download_url: string };

export type DependenciasCorreo = {
  admin: SupabaseClient;
  recuperarCorreo: (emailId: string) => Promise<CorreoRecibido>;
  listarAdjuntos: (emailId: string) => Promise<Adjunto[]>;
  descargar: (url: string) => Promise<ArrayBuffer>;
  /** Lectura con IA de un documento ya guardado (#19). */
  leer: (documentoId: string) => Promise<{ estado: string }>;
  dominio: string | null;
  nuevoId?: () => string;
};

export type ResultadoCorreo =
  | { estado: "ignorado"; motivo: "sin-direccion" | "usuario-desconocido" | "remitente-no-autorizado" | "ya-procesado" | "sin-adjuntos" }
  | { estado: "procesado"; guardados: number; repetidos: number; descartados: number };

/** ¿Se guarda este adjunto? Solo PDF e imágenes admitidas, hasta 10 MB, y no las imágenes incrustadas en la firma. */
export function adjuntoAdmitido(a: Adjunto): string | null {
  const tipo = tipoDelOriginal({ name: a.filename ?? "", type: a.content_type ?? "" });
  if (!tipo) return null;
  if (a.size !== null && a.size > MAX_BYTES) return null;
  if (a.content_disposition === "inline" && tipo !== "application/pdf") return null; // logos de firmas
  return tipo;
}

export async function procesarCorreo(deps: DependenciasCorreo, emailId: string): Promise<ResultadoCorreo> {
  const { admin } = deps;
  const correo = await deps.recuperarCorreo(emailId);

  const codigo = codigoDeDestinatarios(correo.to, deps.dominio);
  if (!codigo) return { estado: "ignorado", motivo: "sin-direccion" };

  const { data: perfil, error: errorPerfil } = await admin.from("perfiles").select("id").eq("codigo_correo", codigo).maybeSingle();
  if (errorPerfil) throw new Error(`No se ha podido buscar el usuario: ${errorPerfil.message}`);
  if (!perfil) return { estado: "ignorado", motivo: "usuario-desconocido" };
  const userId: string = perfil.id;

  // Remitente: el correo de su cuenta o uno de sus autorizados.
  const remitente = correoLimpio(correo.from);
  if (!remitente) return { estado: "ignorado", motivo: "remitente-no-autorizado" };
  const { data: cuenta } = await admin.auth.admin.getUserById(userId);
  let autorizado = cuenta?.user?.email?.toLowerCase() === remitente;
  if (!autorizado) {
    const { data: fila, error } = await admin.from("remitentes_autorizados").select("id").eq("user_id", userId).eq("email", remitente).maybeSingle();
    if (error) throw new Error(`No se han podido comprobar los remitentes: ${error.message}`);
    autorizado = Boolean(fila);
  }
  if (!autorizado) return { estado: "ignorado", motivo: "remitente-no-autorizado" };

  // Resend repite el aviso si no respondemos a tiempo: no duplicar.
  const messageId = correo.message_id ?? emailId;
  const { data: yaEsta } = await admin.from("documentos").select("id").eq("user_id", userId).eq("correo_message_id", messageId).limit(1).maybeSingle();
  if (yaEsta) return { estado: "ignorado", motivo: "ya-procesado" };

  const adjuntos = (await deps.listarAdjuntos(emailId)).map((a) => ({ a, tipo: adjuntoAdmitido(a) }));
  const validos = adjuntos.filter((x) => x.tipo !== null).slice(0, MAX_ADJUNTOS);
  if (validos.length === 0) return { estado: "ignorado", motivo: "sin-adjuntos" };

  let guardados = 0;
  let repetidos = 0;
  for (const { a, tipo } of validos) {
    const bytes = await deps.descargar(a.download_url);
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) continue;
    const huella = await huellaSha256(bytes);

    const { data: mismo } = await admin.from("documentos").select("id").eq("user_id", userId).eq("huella_sha256", huella).limit(1).maybeSingle();
    if (mismo) {
      repetidos++;
      continue;
    }

    const ruta = rutaDelOriginal(userId, (deps.nuevoId ?? (() => globalThis.crypto.randomUUID()))(), tipo as string);
    const { error: errorSubida } = await admin.storage
      .from(BUCKET_ORIGINALES)
      .upload(ruta, new Blob([bytes], { type: tipo as string }), { contentType: tipo as string, upsert: false });
    if (errorSubida) throw new Error(`No se ha podido guardar el adjunto: ${errorSubida.message}`);

    const { data: doc, error: errorDoc } = await admin
      .from("documentos")
      .insert({
        user_id: userId,
        ruta_storage: ruta,
        nombre_archivo: a.filename,
        tipo_mime: tipo,
        tamano_bytes: bytes.byteLength,
        huella_sha256: huella,
        origen: "correo",
        correo_message_id: messageId,
      })
      .select("id")
      .single();
    if (errorDoc || !doc) {
      await admin.storage.from(BUCKET_ORIGINALES).remove([ruta]);
      throw new Error(`No se ha podido registrar el adjunto: ${errorDoc?.message ?? "sin respuesta"}`);
    }
    guardados++;
    // La lectura no para el resto: si falla, el original queda guardado (E3).
    try {
      await deps.leer(doc.id);
    } catch {
      // ya marcado como error por la lectura
    }
  }

  return { estado: "procesado", guardados, repetidos, descartados: adjuntos.length - validos.length };
}
