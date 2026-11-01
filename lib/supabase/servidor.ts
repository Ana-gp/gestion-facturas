/**
 * Cliente de Supabase para el SERVIDOR: páginas sin "use client" (page.tsx),
 * rutas de API (route.ts) y acciones de servidor.
 *
 * Usa la misma clave publicable que el navegador y la sesión del usuario que
 * llega en las cookies, así que las reglas RLS se aplican igual: cada usuario
 * solo ve lo suyo. NO usa la clave secreta.
 *
 * Crear uno nuevo en cada petición (no guardarlo en una variable global):
 *   import { clienteServidor } from "@/lib/supabase/servidor";
 *   const supabase = await clienteServidor();
 *   const { data: { user } } = await supabase.auth.getUser();
 *
 * Para saber quién ha entrado en el servidor, usar `auth.getUser()` o
 * `auth.getClaims()`, que comprueban la sesión; no fiarse de `getSession()`.
 */

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { configSupabaseObligatoria } from "./config";

export async function clienteServidor(): Promise<SupabaseClient> {
  const { url, clave } = configSupabaseObligatoria();
  const almacen = await cookies();
  return createServerClient(url, clave, {
    cookies: {
      getAll() {
        return almacen.getAll();
      },
      setAll(lista) {
        try {
          for (const { name, value, options } of lista) almacen.set(name, value, options);
        } catch {
          // Desde una página (page.tsx) Next.js no deja escribir cookies. No
          // pasa nada si el proxy de sesión (lib/supabase/sesion.ts) renueva
          // la sesión en cada petición.
        }
      },
    },
  });
}
