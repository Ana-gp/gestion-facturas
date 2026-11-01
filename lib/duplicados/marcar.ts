/**
 * Marcar el posible duplicado de una factura (#22, decisión D1).
 *
 * Llama a la función SQL `buscar_duplicados` (las tres reglas de
 * docs/modelo-datos.sql, las mismas que lib/duplicados/motivo.ts) y guarda en
 * `posible_duplicado_de` la factura más antigua con la que coincide.
 *
 * - Se usa después de leer con IA (#19) y después de que el usuario corrija
 *   la ficha (#21), porque al corregir un NIF o un número puede aparecer o
 *   desaparecer la coincidencia.
 * - El usuario no puede cambiar `posible_duplicado_de` (permisos de la tabla),
 *   así que hace falta el cliente con la clave secreta. Quien llama tiene que
 *   haber comprobado antes, con la sesión del usuario, que la factura es suya.
 * - Si el usuario ya dijo "No es un duplicado" de esa misma pareja
 *   (`duplicado_descartado`), no se vuelve a avisar.
 * - Es un aviso: si algo falla aquí, no se para la lectura ni el guardado.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type ResultadoMarca = { duplicadoDe: string | null; cambiado: boolean };

export async function marcarPosibleDuplicado(admin: SupabaseClient, facturaId: string): Promise<ResultadoMarca> {
  const { data: coincidencias, error } = await admin.rpc("buscar_duplicados", { p_factura_id: facturaId });
  if (error) throw new Error(`No se han podido buscar duplicados: ${error.message}`);
  const ids = [...new Set(((coincidencias ?? []) as { factura_id: string }[]).map((c) => c.factura_id))].filter((id) => id !== facturaId);

  let elegida: string | null = null;
  if (ids.length > 0) {
    const { data: mas, error: errorOrden } = await admin.from("facturas").select("id").in("id", ids).order("creado_en", { ascending: true }).limit(1);
    if (errorOrden) throw new Error(`No se ha podido elegir el duplicado: ${errorOrden.message}`);
    elegida = (mas?.[0] as { id: string } | undefined)?.id ?? ids[0];
  }

  const { data: actual, error: errorActual } = await admin
    .from("facturas")
    .select("posible_duplicado_de, duplicado_descartado")
    .eq("id", facturaId)
    .maybeSingle();
  if (errorActual) throw new Error(`No se ha podido leer la factura: ${errorActual.message}`);
  if (!actual) return { duplicadoDe: null, cambiado: false };

  const misma = actual.posible_duplicado_de === elegida;
  if (misma) return { duplicadoDe: elegida, cambiado: false };

  const { error: errorCambio } = await admin
    .from("facturas")
    .update({ posible_duplicado_de: elegida, duplicado_descartado: false })
    .eq("id", facturaId);
  if (errorCambio) throw new Error(`No se ha podido guardar el posible duplicado: ${errorCambio.message}`);
  return { duplicadoDe: elegida, cambiado: true };
}
