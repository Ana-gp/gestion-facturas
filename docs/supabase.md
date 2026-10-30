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
9. Dar acceso al equipo: **Organization settings** > **Team** > invitar a Ana y Javier. **[Pendiente]** Comprobar si el plan Free lo permite; la documentación de Supabase no lo aclara (consultada el 30/10/2026). Si no lo permite, se comparten solo la URL y la clave publicable, que bastan para programar.

## 2. Clave de Gemini

1. Entrar en aistudio.google.com con una cuenta de Google.
2. **Get API key** > **Create API key**.
3. Guardar la clave en el gestor de contraseñas. Es secreta: va solo en `.env.local` y en las variables de entorno de Vercel, como `GEMINI_API_KEY`.

Uso permitido durante el curso (acordado en la revisión del PR #36, apartado 7 de la arquitectura): **solo documentos ficticios o anonimizados**, sin usuarios externos. En el uso gratuito, Google puede usar el contenido para mejorar sus productos.

## 3. Cómo compartir las claves con el equipo

- **Públicas** (URL de Supabase y clave publicable): se pueden pasar por el grupo del equipo.
- **Secretas** (clave de Gemini, clave secreta de Supabase, contraseña de la base de datos): solo por un canal que se pueda borrar después, o mejor, que cada uno las configure directamente en Vercel. Nunca en GitHub, en issues ni en comentarios de PR.
- Cada persona las copia en su propio archivo `.env.local`, que Git ya ignora (ver [desarrollo local](desarrollo-local.md)).

## 4. Vercel: decisión del equipo antes de configurarlo

**[Confirmado]** El repositorio `Ana-gp/gestion-facturas` es **privado** y es de la cuenta personal de Ana (consultado el 30/10/2026).

**[Supuesto]** En el plan gratuito Hobby, Vercel bloquea los despliegues de un repositorio privado cuando el autor del commit no es el dueño de la cuenta de Vercel. Los colaboradores necesitarían el plan Pro. Fuente: hilo de la comunidad de Vercel con respuesta de una persona de Vercel ("Collaboration has never been allowed on Hobby"), no documentación oficial: [Vercel Community](https://community.vercel.com/t/hobby-account-private-repo-collaborators-deployment-blocked/1030), consultado el 30/10/2026.

**Decisión (30/10/2026): opción A.** Ana conecta Vercel desde su cuenta y el repositorio sigue **privado**. Para el martes basta con que producción se despliegue al unir en `main`; las ramas se prueban en local. Así no se publican los tickets reales: algunos son de conocidos que dieron su consentimiento para el proyecto, no para publicarlos.

Opciones que se compararon:

| Opción | Cómo | A favor | En contra |
|---|---|---|---|
| **A · Vercel en la cuenta de Ana (elegida)** | Ana importa el repositorio en su Vercel. Como es ella quien une los PR, los commits de `main` son suyos | Gratis; sin cambiar el repositorio; la producción se despliega sola | Puede que no haya vistas previas de las ramas de Mireia y Javier; las variables de entorno las configura Ana |
| B · Hacer público el repositorio | Ajustes de GitHub > cambiar visibilidad | Vercel Hobby permite colaborar en repositorios públicos | `tests/tickets/` tiene tickets reales con consentimiento solo para el proyecto (apartado 4.1) |
| C · Vercel Pro | Pagar el plan Pro (20 $ al mes por persona, ver arquitectura) | Sin restricciones | Cuesta dinero y pide tarjeta; va contra el "coste fijo 0 €" de la arquitectura |

Con la opción A, Ana importa el repositorio en su Vercel siguiendo el apartado "Despliegue en Vercel" de [desarrollo local](desarrollo-local.md): región de funciones `fra1` y las variables `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` y `GEMINI_API_KEY`. La clave de Gemini de producción la crea y la pone Ana directamente en Vercel; nadie la envía por mensajes. Para probar en local, cada persona usa su propia clave de AI Studio. Después, añadir la dirección de Vercel a las Redirect URLs de Supabase (apartado 1, paso 7).

### 4.1 Nota por si algún día se hace público el repositorio

No aplica ahora (se eligió la opción A). Se deja para no repetir la revisión.

Al hacerlo público se ve **todo**: los archivos actuales, el historial y los PR cerrados, aunque no se unieran.

- **[Confirmado]** El PR #49 (cerrado sin unir) contiene la foto del ticket de gasolinera **sin pixelar el correo electrónico** que aparece impreso. Su rama se borró, pero el PR cerrado sigue mostrando el archivo. Es el correo de contacto que la gasolinera imprime en sus tickets, pero Ana lo pixeló en el PR #48 por precaución. **[Pendiente]** Decidir entre aceptarlo o pedir a GitHub Support que elimine ese PR antes de publicar. El equipo no puede borrar un PR cerrado por su cuenta.
- **[Confirmado]** La factura `T3-claude-pro-ingles.pdf` no muestra el nombre de la persona: el apartado "Bill to" solo dice "Spain".
- **[Pendiente]** Revisar una última vez las fotos de `tests/tickets/` y `public/ejemplos/`, y la hoja `valores-reales-tickets.xlsx`, buscando nombres, correos, teléfonos, direcciones o tarjetas de personas.
- Nunca ha habido claves en el repositorio: `.env.local` está en `.gitignore`. No subir ninguna a partir de ahora, porque en un repositorio público cualquiera podría usarlas.

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
| Decisión sobre Vercel (apartado 4) | | |
| Vercel desplegando `main` | | |
