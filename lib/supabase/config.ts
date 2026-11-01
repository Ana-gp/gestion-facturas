/**
 * Datos públicos para conectarse a Supabase (#18). Los comparten el navegador,
 * el servidor y el proxy de sesión.
 *
 * Solo se usan las dos variables públicas de `.env.example`: la URL del
 * proyecto y la clave publicable (`sb_publishable_…`). La clave secreta
 * (`SUPABASE_SECRET_KEY`) NO se usa aquí: es solo del servidor y la usará la
 * lectura con IA (#19) en su propio archivo.
 *
 * Next.js solo pasa al navegador las variables `NEXT_PUBLIC_…` escritas tal
 * cual (`process.env.NEXT_PUBLIC_SUPABASE_URL`), por eso no se leen en bucle.
 */

export type ConfigSupabase = { url: string; clave: string };

/** Comprueba los valores. Devuelve null si falta alguno o si la clave no es publicable. */
export function validarConfig(url: string | undefined, clave: string | undefined): ConfigSupabase | null {
  const u = url?.trim();
  const c = clave?.trim();
  if (!u || !c) return null;
  if (!/^https:\/\/[^/]+$/.test(u.replace(/\/$/, ""))) return null;
  // Nunca una clave secreta en el navegador: si alguien la pone por error en
  // una variable NEXT_PUBLIC_…, no se usa.
  if (c.startsWith("sb_secret_")) return null;
  return { url: u.replace(/\/$/, ""), clave: c };
}

/** La configuración de este entorno, o null si no hay `.env.local` (o variables en Vercel). */
export function configSupabase(): ConfigSupabase | null {
  return validarConfig(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

/** Igual que `configSupabase`, pero lanza un error claro si falta. */
export function configSupabaseObligatoria(): ConfigSupabase {
  const config = configSupabase();
  if (!config) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (o la clave no es la publicable). " +
        "Cópialas en .env.local (ver docs/supabase.md, apartado 1, paso 8).",
    );
  }
  return config;
}
