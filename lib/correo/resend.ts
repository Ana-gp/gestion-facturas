import "server-only";

/**
 * Llamadas a la API de Resend para los correos recibidos (#16). SOLO
 * SERVIDOR: usa la clave secreta RESEND_API_KEY.
 * Fuente: Resend, API "Retrieve received email" y "List received email
 * attachments" (consultadas el 01/11/2026). Los enlaces de descarga de los
 * adjuntos caducan a la hora.
 */

import type { Adjunto, CorreoRecibido } from "./procesar.ts";

const API = "https://api.resend.com";

function clave(): string {
  const c = process.env.RESEND_API_KEY?.trim();
  if (!c) throw new Error("Falta RESEND_API_KEY en el servidor (variables de Vercel).");
  return c;
}

async function pedir<T>(ruta: string): Promise<T> {
  const r = await fetch(`${API}${ruta}`, { headers: { Authorization: `Bearer ${clave()}` }, cache: "no-store", signal: AbortSignal.timeout(15_000) });
  if (!r.ok) throw new Error(`Resend respondió ${r.status} en ${ruta.split("/").slice(0, 3).join("/")}`);
  return (await r.json()) as T;
}

export async function recuperarCorreo(emailId: string): Promise<CorreoRecibido> {
  const c = await pedir<{ from?: string; to?: string[]; message_id?: string | null }>(`/emails/receiving/${encodeURIComponent(emailId)}`);
  return { from: c.from ?? "", to: c.to ?? [], message_id: c.message_id ?? null };
}

export async function listarAdjuntos(emailId: string): Promise<Adjunto[]> {
  const r = await pedir<{ data?: Adjunto[] }>(`/emails/receiving/${encodeURIComponent(emailId)}/attachments`);
  return r.data ?? [];
}

export async function descargar(url: string): Promise<ArrayBuffer> {
  const r = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(20_000) });
  if (!r.ok) throw new Error(`No se ha podido descargar un adjunto (${r.status}).`);
  return r.arrayBuffer();
}
