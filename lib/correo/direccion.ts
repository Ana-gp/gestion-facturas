/**
 * Dirección de reenvío de cada usuario (#16): `facturas-<código>@<dominio>`.
 *
 * - `<código>`: `perfiles.codigo_correo`, 12 caracteres aleatorios que crea la
 *   base de datos al registrarse (docs/modelo-datos.sql).
 * - `<dominio>`: el de recepción de Resend (`<id>.resend.app`), en
 *   NEXT_PUBLIC_DOMINIO_CORREO. No es secreto: aparece en la propia dirección.
 */

export const PREFIJO = "facturas-";

/** El dominio configurado, o null si falta. */
export function dominioCorreo(): string | null {
  const d = process.env.NEXT_PUBLIC_DOMINIO_CORREO?.trim().toLowerCase();
  return d && /^[a-z0-9.-]+\.[a-z]{2,}$/.test(d) ? d : null;
}

export function direccionDeReenvio(codigo: string, dominio: string | null = dominioCorreo()): string | null {
  return dominio && /^[0-9a-z]{12}$/i.test(codigo) ? `${PREFIJO}${codigo.toLowerCase()}@${dominio}` : null;
}

/** "Ana Pérez <Ana@Correo.com>" → "ana@correo.com". Null si no parece un correo. */
export function correoLimpio(texto: unknown): string | null {
  if (typeof texto !== "string") return null;
  const entreAngulos = /<([^<>\s]+@[^<>\s]+)>/.exec(texto);
  const c = (entreAngulos ? entreAngulos[1] : texto).trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c) ? c : null;
}

/** El código de la primera dirección `facturas-<código>@<dominio>` de los destinatarios. */
export function codigoDeDestinatarios(destinatarios: unknown, dominio: string | null = dominioCorreo()): string | null {
  const lista = Array.isArray(destinatarios) ? destinatarios : [destinatarios];
  for (const d of lista) {
    const correo = correoLimpio(d);
    if (!correo) continue;
    const r = /^facturas-([0-9a-z]{12})@(.+)$/.exec(correo);
    if (r && (!dominio || r[2] === dominio)) return r[1];
  }
  return null;
}
