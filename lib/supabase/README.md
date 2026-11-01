# Cliente de Supabase

Tarea: #18 · Responsable: Mireia · Pedido por Ana para conectar sus pantallas y lo necesita también el login (#13).

| Archivo | Dónde se usa | Qué hace |
|---|---|---|
| `config.ts` | En todos | Lee `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Si faltan, o si alguien pone una clave `sb_secret_…`, no hay configuración |
| `cliente.ts` | Componentes con `"use client"` | `clienteNavegador()` y `clienteNavegadorSiHay()` (este devuelve `null` sin configuración, para enseñar los datos de ejemplo) |
| `servidor.ts` | `page.tsx`, `route.ts` y acciones de servidor | `await clienteServidor()`: un cliente nuevo por petición, con la sesión de las cookies |
| `sesion.ts` | `proxy.ts` (lo crea #13) | `actualizarSesion(request)`: renueva la sesión en cada petición. Cómo conectarlo, en el comentario del archivo |

Los tres clientes usan la **clave publicable**: cada usuario solo ve y cambia lo que le dejan las reglas RLS de [`docs/modelo-datos.sql`](../../docs/modelo-datos.sql). La **clave secreta** (`SUPABASE_SECRET_KEY`) no está aquí: solo la usará el servidor en la lectura con IA (#19), en un archivo aparte que nunca se importa desde el navegador.

Versiones: `@supabase/supabase-js` 2.118.0 y `@supabase/ssr` 0.12.7, fijadas en `package.json` y `package-lock.json`. Después de cambiar de rama, `npm install`.

Para saber quién ha entrado en el servidor: `supabase.auth.getUser()` o `supabase.auth.getClaims()`. No fiarse de `getSession()` en el servidor, porque no comprueba la sesión.
