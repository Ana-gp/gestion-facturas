# Desarrollo local de Ticketon

**Estado:** guía inicial de la base técnica. Todavía no acredita que el proyecto se haya instalado, compilado o desplegado.

## Requisitos

- Node.js 20.9 o posterior.
- npm.
- Acceso al repositorio de GitHub.

## Preparar el proyecto

1. Clona el repositorio y cambia a la rama de trabajo correspondiente.
2. Instala las dependencias con `npm install`.
3. Copia `.env.example` a `.env.local`.
4. Rellena solo las variables de los servicios que ya estén configurados. No inventes valores ni pegues secretos en GitHub.
5. Inicia el servidor de desarrollo con `npm run dev`.
6. Abre `http://localhost:3000`.

## Comprobaciones disponibles

- `npm run lint`: analiza el código con ESLint.
- `npm run typecheck`: comprueba los tipos de TypeScript.
- `npm run build`: genera la compilación de producción.

Estas comprobaciones deben ejecutarse en un entorno con las dependencias instaladas; no se deben marcar como superadas sin resultados reales.

## Variables de entorno

| Variable | Uso | Exposición |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Pública |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave publicable de Supabase; requiere políticas RLS correctas | Pública |
| `GEMINI_API_KEY` | Acceso del servidor a Gemini | Secreta |
| `RESEND_API_KEY` | Acceso del servidor a Resend | Secreta |

No añadas una clave `service_role` de Supabase al navegador ni a variables `NEXT_PUBLIC_*`. Las claves secretas deben guardarse en el entorno local ignorado por Git y en la configuración protegida del proveedor de despliegue.

## Flujo de Git del equipo

- Crear una rama por issue.
- Mantener los cambios acotados a la tarea.
- Ejecutar lint, comprobación de tipos y build antes de solicitar revisión.
- Abrir un PR a `main`, enlazar la issue y pedir revisión a otro miembro del equipo.
- No fusionar el PR sin la revisión acordada.

## Pendiente

- Crear y probar las cuentas de servicios.
- Configurar las variables reales en el entorno de despliegue.
- Conectar Supabase Auth después de coordinar el modelo de datos de la issue #29.
- Confirmar el despliegue automático desde `main`.
