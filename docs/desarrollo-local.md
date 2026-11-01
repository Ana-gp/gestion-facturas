# Desarrollo local de Ticketon

Tarea: #12 (orden 13) · Bloque 4 (web) · Responsable: Javier · Última actualización: 29/10/2026

**Estado:** guía inicial de la base técnica. Todavía no acredita que el proyecto se haya instalado, compilado o desplegado.

Leyenda: **[Confirmado]** dato respaldado por una fuente o resultado documentado; **[Supuesto]** hipótesis provisional que debe validarse; **[Propuesta]** decisión del equipo que puede cambiar; **[Pendiente]** información aún no resuelta. Etiquetas según `docs/guia-estilo.md`.

## Requisitos

- Node.js 22 (versión fijada en `.nvmrc`).
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
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave publicable de Supabase; requiere políticas RLS correctas | Pública |
| `GEMINI_API_KEY` | Acceso del servidor a Gemini | Secreta |
| `RESEND_API_KEY` | Acceso del servidor a Resend | Secreta |

No añadas una clave `service_role` de Supabase al navegador ni a variables `NEXT_PUBLIC_*`. Las claves secretas deben guardarse en el entorno local ignorado por Git y en la configuración protegida del proveedor de despliegue.

## Flujo de Git del equipo

- Crear una rama por issue.
- Mantener los cambios acotados a la tarea.
- Ejecutar lint, comprobación de tipos y build antes de solicitar revisión.
- Abrir un PR a `main`, enlazar la issue y pedir revisión a otro miembro del equipo.
- No fusionar el PR sin la revisión acordada.

## Pendiente [Pendiente]

- [ ] Crear y probar las cuentas de servicios.
- [ ] Configurar las variables reales en el entorno de despliegue.
- [ ] Conectar Supabase Auth después de coordinar el modelo de datos de la issue #29.
- [ ] Confirmar el despliegue automático desde `main`.


## Despliegue en Vercel [Pendiente]

1. Un miembro del equipo con permisos debe importar el repositorio de GitHub en Vercel y autorizar la integración.
2. Confirmar que el framework detectado es Next.js, que la raíz del proyecto es la raíz del repositorio y que el comando de build es `npm run build`.
3. Seleccionar Node.js 22 si está disponible en la configuración del proyecto.
4. Configurar las variables de entorno necesarias en Vercel para Preview y Production. No copiar secretos a GitHub ni compartirlos por mensajes.
5. Configurar la región de funciones en Fráncfort (`fra1`) según la arquitectura acordada, cuando las rutas de servidor estén implementadas.
6. Hacer un despliegue de prueba desde la rama de trabajo y comprobar la URL generada.
7. Después de que un PR revisado se fusione en `main`, comprobar en Vercel que se crea el despliegue de producción y que la página responde por HTTPS.

**Importante:** crear la rama y los archivos no configura por sí solo la integración de Vercel ni acredita que haya un despliegue. Ese paso requiere acceso autorizado a la cuenta del equipo y debe verificarse desde el panel de Vercel.
