/**
 * Comprobar que un aviso (webhook) viene de verdad de Resend (#16).
 *
 * Resend firma sus avisos con Svix: cabeceras `svix-id`, `svix-timestamp` y
 * `svix-signature`. La firma es HMAC-SHA256, en base64, de
 * `<svix-id>.<svix-timestamp>.<cuerpo tal cual>`, con la clave secreta del
 * webhook (`whsec_…`, en base64 después del prefijo). Sin esto, cualquiera
 * podría mandarnos "correos" falsos.
 * Fuentes: Resend, "Verify webhooks requests" (cabeceras y cuerpo sin tocar);
 * Svix, "Verifying payloads manually" (algoritmo). Consultadas el 01/11/2026.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

/** Margen para la hora del aviso: 5 minutos, para evitar que reenvíen uno viejo. */
const MARGEN_SEGUNDOS = 5 * 60;

export function firmaValida(
  secreto: string,
  cabeceras: { id: string | null; timestamp: string | null; firma: string | null },
  cuerpo: string,
  ahora: Date = new Date(),
): boolean {
  const { id, timestamp, firma } = cabeceras;
  if (!secreto || !id || !timestamp || !firma) return false;
  const segundos = Number(timestamp);
  if (!Number.isFinite(segundos) || Math.abs(ahora.getTime() / 1000 - segundos) > MARGEN_SEGUNDOS) return false;

  const clave = Buffer.from(secreto.startsWith("whsec_") ? secreto.slice(6) : secreto, "base64");
  const esperada = createHmac("sha256", clave).update(`${id}.${timestamp}.${cuerpo}`).digest();

  // La cabecera puede traer varias firmas: "v1,AAA v1,BBB".
  return firma.split(" ").some((parte) => {
    const [version, valor] = parte.split(",");
    if (version !== "v1" || !valor) return false;
    const recibida = Buffer.from(valor, "base64");
    return recibida.length === esperada.length && timingSafeEqual(recibida, esperada);
  });
}
