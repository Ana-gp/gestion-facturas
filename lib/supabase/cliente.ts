/**
 * Cliente de Supabase para el NAVEGADOR: componentes con "use client"
 * (pantallas de subida, revisión, login…).
 *
 * Usa la clave publicable: lo que puede ver o cambiar cada usuario lo deciden
 * las reglas RLS de docs/modelo-datos.sql, no este archivo.
 * La sesión se guarda en cookies (@supabase/ssr) para que el servidor también
 * sepa quién ha entrado.
 *
 * Uso:
 *   import { clienteNavegador } from "@/lib/supabase/cliente";
 *   const supabase = clienteNavegador();
 *   const { data } = await supabase.from("planes").select("*");
 */

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { configSupabase, configSupabaseObligatoria } from "./config";

/** Cliente del navegador. Lanza un error si faltan las variables. @supabase/ssr reutiliza el mismo en toda la página. */
export function clienteNavegador(): SupabaseClient {
  const { url, clave } = configSupabaseObligatoria();
  return createBrowserClient(url, clave);
}

/** Igual, pero devuelve null si no hay configuración (para enseñar los datos de ejemplo en su lugar). */
export function clienteNavegadorSiHay(): SupabaseClient | null {
  const config = configSupabase();
  return config ? createBrowserClient(config.url, config.clave) : null;
}
