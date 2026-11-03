import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { configSupabase } from "@/lib/supabase/config";
import { actualizarSesion } from "@/lib/supabase/sesion";

const PRIVADAS = ["/gastos", "/subir", "/revisar", "/comparar", "/exportar", "/cuenta", "/cierre-trimestre"];

export async function proxy(request: NextRequest) {
  const respuesta = await actualizarSesion(request);
  const ruta = request.nextUrl.pathname;
  const privada = PRIVADAS.some((base) => ruta === base || ruta.startsWith(base + "/"));

  // Sin variables de Supabase se conserva el modo demostración existente.
  const config = configSupabase();
  if (!config || !privada) return respuesta;

  const supabase = createServerClient(config.url, config.clave, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (lista) => {
        for (const { name, value, options } of lista) {
          request.cookies.set(name, value);
          respuesta.cookies.set(name, value, options);
        }
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (user) return respuesta;

  const destino = request.nextUrl.clone();
  destino.pathname = "/entrar";
  destino.search = "";
  destino.searchParams.set("next", ruta + request.nextUrl.search);
  const redireccion = NextResponse.redirect(destino);
  for (const cookie of respuesta.cookies.getAll()) redireccion.cookies.set(cookie);
  return redireccion;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|ejemplos/|.*\\.(?:png|jpg|jpeg|svg|webp|pdf)$).*)"],
};
