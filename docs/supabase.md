# Puesta en marcha de Supabase, Gemini y Vercel

Tarea: #18 (orden 15) · Bloque 2 (subida y lectura) · Responsable: Mireia · Última actualización: 30/10/2026

**Estado:** guía para crear los servicios. **[Pendiente]** Nada de lo que describe está creado todavía: cuando se complete un paso, se marca en el apartado 6 con la fecha.

Leyenda (según la [guía de estilo](guia-estilo.md)): **[Confirmado]** comprobado en una fuente o en una prueba; **[Supuesto]** se da por bueno para avanzar; **[Propuesta]** decisión del equipo que se puede cambiar; **[Pendiente]** falta información o falta hacerlo.

Stack y regiones acordados en [arquitectura](arquitectura.md). Tablas, permisos y funciones en [modelo de datos](modelo-datos.md) y [`modelo-datos.sql`](modelo-datos.sql).

## 1. Supabase (base de datos, login y originales)

1. Entrar en supabase.com con **Sign in with GitHub**, usando la cuenta `mireiadiezzm23-web`.
2. Crear una organización con el plan **Free**.
3. **New project**:
   - Nombre: `ticketon`.
   - Contraseña de la base de datos: pulsar **Generate a password** y guardarla en un gestor de contraseñas. No se envía por chat ni se sube a GitHub.
   - Región: **Central EU (Frankfurt)**, la `eu-central-1` acordada en la arquitectura para que los datos queden en la UE.
4. Esperar a que el proyecto termine de crearse (unos minutos).
5. **SQL Editor** > **New query**: pegar el archivo [`modelo-datos.sql`](modelo-datos.sql) entero y pulsar **Run** una sola vez. Debe terminar con "Success. No rows returned".
   - Crea las tablas, la seguridad por filas, las funciones, la vista del Excel y el bucket privado `originales` con un máximo de 10 MB por archivo y solo PDF, JPG, PNG y HEIC.
   - No se puede ejecutar dos veces en el mismo proyecto. Si da un error a mitad, copiar el mensaje y avisar antes de repetir nada.
6. Comprobar en **Table Editor** que aparecen las tablas `planes` (3 filas), `categorias`, `perfiles`, `suscripciones`, `uso_mensual`, `remitentes_autorizados`, `documentos`, `facturas` y `lineas_iva`, y en **Storage** el bucket `originales` marcado como privado.
7. **Authentication** > **URL Configuration**:
   - Site URL: `http://localhost:3000` mientras no haya dirección de Vercel. Se cambia por la de Vercel cuando exista.
   - Redirect URLs: añadir `http://localhost:3000/**`. Necesario para el enlace de recuperar contraseña (#13).
8. **Project Settings** > **API Keys**: copiar la **URL del proyecto** y la **clave publicable** (`sb_publishable_…`). Son las dos variables `NEXT_PUBLIC_…` de [`.env.example`](../.env.example).
   - La **clave secreta** (`sb_secret_…`) solo la usa el servidor. Nunca va en el navegador, en variables `NEXT_PUBLIC_…` ni en GitHub.
9. Dar acceso al equipo: en la organización de Ticketon, **Team** > **Invite members** (en español, "Invitar a los miembros"). Se ponen los correos de GitHub de Ana y Javier separados por comas, se elige el rol **Developer** y se pulsa enviar.
   - **[Confirmado]** El plan Free deja invitar, con los roles Owner, Administrator y Developer (comprobado en el panel de Supabase el 30/10/2026).
   - **[Confirmado]** La invitación da acceso a **todos** los proyectos de la organización, no se puede limitar a uno. Por eso `ticketon` está en **su propia organización**, separada de otros proyectos de Mireia.
   - **[Propuesta]** Rol **Developer**: pueden ver y usar los datos del proyecto, pero no cambiar su configuración. Si alguien necesita cambiar algo de Auth (por ejemplo, los correos de recuperar contraseña del #13), lo hace Mireia o se le sube a Administrator.

## 2. Clave de Gemini

1. Entrar en aistudio.google.com con una cuenta de Google.
2. **Get API key** > **Create API key**.
3. Guardar la clave en el gestor de contraseñas. Es secreta: va solo en `.env.local` y en las variables de entorno de Vercel, como `GEMINI_API_KEY`.

Uso permitido durante el curso (acordado en la revisión del PR #36, apartado 7 de la arquitectura): **solo documentos ficticios o anonimizados**, sin usuarios externos. En el uso gratuito, Google puede usar el contenido para mejorar sus productos.

## 3. Cómo compartir las claves con el equipo

- **Públicas** (URL de Supabase y clave publicable): se pueden pasar por el grupo del equipo.
- **Secretas** (clave de Gemini, clave secreta de Supabase, contraseña de la base de datos): solo por un canal que se pueda borrar después, o mejor, que cada uno las configure directamente en Vercel. Nunca en GitHub, en issues ni en comentarios de PR.
- Cada persona las copia en su propio archivo `.env.local`, que Git ya ignora (ver [desarrollo local](desarrollo-local.md)).

## 4. Vercel

**[Confirmado]** El plan gratuito Hobby bloquea los despliegues de un repositorio **privado** cuando el autor del commit no es el dueño de la cuenta de Vercel; en repositorios **públicos** la colaboración está permitida. Fuente: hilo de la comunidad de Vercel con respuesta de una persona de Vercel ("Collaboration has never been allowed on Hobby"), no documentación oficial: [Vercel Community](https://community.vercel.com/t/hobby-account-private-repo-collaborators-deployment-blocked/1030), consultado el 30/10/2026.

**Decisión (30/10/2026): opción B.** El repositorio `Ana-gp/gestion-facturas` es **público desde el 30/10/2026** y Mireia conecta Vercel desde su cuenta.

Opciones que se compararon:

| Opción | Cómo | A favor | En contra |
|---|---|---|---|
| A · Vercel en la cuenta de Ana | Ana importa el repositorio privado en su Vercel | Gratis; el repositorio sigue privado | Sin vistas previas de las ramas de los demás |
| **B · Repositorio público y Vercel en la cuenta de Mireia (elegida)** | Ana cambia la visibilidad; Mireia importa el repositorio | Gratis; vistas previas de cada PR como comentario en GitHub | Todo el historial y los PR cerrados quedan a la vista (apartado 4.1) |
| C · Vercel Pro | Pagar el plan Pro (20 $ al mes por persona, ver arquitectura) | Sin restricciones | Cuesta dinero y pide tarjeta; va contra el "coste fijo 0 €" de la arquitectura |

### 4.1 Revisión antes de hacerlo público

- **PR #49** (cerrado sin unir): muestra la foto del ticket de gasolinera con el correo sin pixelar. **[Propuesta]** aceptada por el equipo el 30/10/2026 sin pedir nada a GitHub: es el correo de contacto que la gasolinera imprime en sus tickets, no el de una persona.
- **[Confirmado]** Ana revisó el repositorio el 30/10/2026: no hay claves, DNI, teléfonos ni correos personales en los archivos. La factura `T3-claude-pro-ingles.pdf` no muestra el nombre de la persona ("Bill to" solo dice "Spain").
- **Correos en los commits:** el historial muestra las direcciones de correo con las que se hicieron los commits, y eso no se puede cambiar en lo ya subido. Para los nuevos, cada persona activa en GitHub (Settings > Emails) "Keep my email addresses private" y "Block command line pushes that expose my email", y configura Git con la dirección privada `…@users.noreply.github.com` que da GitHub.
- **A partir de ahora:** nunca subir claves (cualquiera podría usarlas) ni tickets de otras personas sin su permiso para publicarlos.

### 4.2 Conectar Vercel (Mireia)

Requisito: tener ya Supabase creado (apartado 1), porque hacen falta su URL y sus claves.

1. Entrar en vercel.com con **Continue with GitHub** (cuenta `mireiadiezzm23-web`), plan **Hobby**.
2. **Add New** > **Project** > importar `Ana-gp/gestion-facturas`. Si no aparece, pulsar **Adjust GitHub App Permissions** y dar acceso a ese repositorio.
3. Comprobar que detecta **Next.js**, que la raíz es la del repositorio y que el comando de build es `npm run build` ([desarrollo local](desarrollo-local.md), apartado "Despliegue en Vercel").
4. **Environment Variables**, para Production y Preview: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` y `GEMINI_API_KEY`. Solo en Vercel, nunca en el repositorio.
5. Pulsar **Deploy** y esperar a que termine.
6. **Settings** > **Functions**: región **Frankfurt (`fra1`)**, la acordada en la arquitectura. Volver a desplegar para que se aplique.
7. Añadir la dirección de producción (`https://….vercel.app`) a Supabase: **Authentication** > **URL Configuration**. Cambiar la Site URL por ella y añadir `https://….vercel.app/**` a las Redirect URLs, sin quitar las de localhost.
8. Pasar al equipo la dirección de producción.

Con el plan gratuito **solo Mireia ve el panel de Vercel**: si un despliegue falla, ella copia el error y lo pasa al equipo. Las vistas previas de cada PR salen solas como comentario en GitHub.

**Prueba tras el primer despliegue** (pedida por Ana): abrir `/api/tipo-cambio?moneda=MXN&fecha=2024-01-06`. Debe devolver un tipo con fecha **05/01/2024**, porque el 06/01/2024 fue sábado y se toma el último publicado antes. Es lo único de la conversión de moneda (#20) que no se ha podido probar con la API real del BCE.

## 5. Comprobación antes de usarlo

El SQL se cargó en un PostgreSQL 16 local con imitaciones de Supabase (`auth.users`, `auth.uid()`, `storage.buckets` y `storage.objects`) el 30/10/2026. **[Confirmado]** en esa prueba:

| Prueba | Resultado |
|---|---|
| Cargar `modelo-datos.sql` completo | Sin errores |
| Bucket `originales` | Privado, 10 MB, PDF, JPG, PNG y HEIC |
| Al crear dos usuarios | Cada uno tiene su perfil y el plan Gratis |
| El usuario A sube a su carpeta y registra el documento con origen `foto` | Correcto |
| A intenta marcar su documento como leído | Rechazado (solo el servidor) |
| B intenta ver los documentos de A o subir a la carpeta de A | No ve nada; la subida se rechaza |
| Un origen que no existe | Rechazado |
| Fuente del tipo de cambio | Solo admite `BDE` o `manual`, igual que el PR #46 y el código del #20 |
| Gastar una lectura desde el navegador | Rechazado; desde el servidor sí, y el contador sube a 1 |

**[Pendiente]** Repetir en Supabase, con dos cuentas reales, las pruebas del apartado 7 de [modelo de datos](modelo-datos.md) (punto 1 de su apartado 8.2).

## 6. Registro

| Paso | Hecho por | Fecha |
|---|---|---|
| Proyecto de Supabase creado en Fráncfort | | |
| SQL ejecutado sin errores | | |
| URL de Auth configuradas | | |
| Clave de Gemini creada | | |
| Equipo con acceso a Supabase | | |
| Repositorio público (apartado 4) | Ana | 30/10/2026 |
| Vercel conectado y desplegando `main` | | |
| Región de funciones `fra1` | | |
| Dirección de Vercel en las Redirect URLs de Supabase | | |
| Prueba de `/api/tipo-cambio` con MXN y 06/01/2024 | | |
