import "server-only";

/**
 * Cliente de Supabase con la CLAVE SECRETA (`SUPABASE_SECRET_KEY`). SOLO
 * SERVIDOR: se salta las reglas RLS, así que solo se usa después de comprobar
 * con `clienteServidor()` que el documento es del usuario que ha entrado.
 *
 * Lo necesita la lectura con IA (#19) para lo que el usuario no puede hacer
 * por sí mismo (docs/modelo-datos.sql, apartado 4):
 * - llamar a `reservar_lectura` (contador del plan),
 * - crear la fila de `facturas` y guardar `datos_ia`,
 * - cambiar `documentos.estado_lectura`.
 *
 * El import de "server-only" hace fallar la compilación si alguien lo importa
 * desde una pantalla con "use client".
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { configSupabaseObligatoria } from "./config";

export function clienteAdmin(): SupabaseClient {
  const { url } = configSupabaseObligatoria();
  const clave = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!clave) throw new Error("Falta SUPABASE_SECRET_KEY en el servidor (.env.local o variables de Vercel).");
  if (!clave.startsWith("sb_secret_")) throw new Error("SUPABASE_SECRET_KEY no es una clave secreta (sb_secret_…).");
  return createClient(url, clave, { auth: { persistSession: false, autoRefreshToken: false } });
}
