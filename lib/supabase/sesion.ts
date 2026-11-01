/**
 * Renovar la sesión en cada petición, para el proxy de Next.js (antes llamado
 * "middleware"). La sesión de Supabase caduca cada poco y hay que renovarla
 * antes de que la página la lea; si no, el usuario "se sale" solo.
 *
 * [Pendiente] Conectarlo en el login (#13, Javier): crear `proxy.ts` en la raíz
 * del proyecto con:
 *
 *   import type { NextRequest } from "next/server";
 *   import { actualizarSesion } from "@/lib/supabase/sesion";
 *   export async function proxy(request: NextRequest) {
 *     return actualizarSesion(request);
 *   }
 *   export const config = {
 *     matcher: ["/((?!_next/static|_next/image|favicon.ico|ejemplos/|.*\\.(?:png|jpg|jpeg|svg|webp|pdf)$).*)"],
 *   };
 *
 * Aquí no se redirige a nadie a la página de entrar: qué páginas exigen
 * login lo decide #13.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { configSupabase } from "./config";

export async function actualizarSesion(request: NextRequest): Promise<NextResponse> {
  let respuesta = NextResponse.next({ request });
  const config = configSupabase();
  // Sin variables (por ejemplo, en local sin .env.local) la web sigue
  // funcionando con los datos de ejemplo.
  if (!config) return respuesta;

  const supabase = createServerClient(config.url, config.clave, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(lista) {
        for (const { name, value } of lista) request.cookies.set(name, value);
        respuesta = NextResponse.next({ request });
        for (const { name, value, options } of lista) respuesta.cookies.set(name, value, options);
      },
    },
  });

  // No poner código entre crear el cliente y esta llamada: es la que renueva
  // la sesión y escribe las cookies nuevas.
  await supabase.auth.getClaims();

  return respuesta;
}
