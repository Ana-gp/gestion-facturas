# Ticketon

**Ticketon** es el nombre del producto web del proyecto. El repositorio conserva el nombre técnico `gestion-facturas`.

Aplicación web por suscripción para que autónomos organicen sus tickets y facturas, conserven los originales y preparen la documentación que enviarán a su gestoría. El MVP no sustituye el criterio fiscal de la gestoría ni garantiza que un gasto sea deducible. Proyecto final en equipo.

## Equipo

| Integrante | Bloque |
|---|---|
| Ana | 3. Revisión y exportación |
| Mireia | 2. Subida y lectura |
| Javier | 1. Cuenta y negocio |

## Entregables (milestones)
1. Documentos MD previos
2. Requisitos para el diseño
3. Prototipo
4. Web funcionando

## Reparto por bloques
Cada persona lleva un bloque de principio a fin: documentos, diseño, backend y frontend de sus funciones. Así todos tocamos de todo sin pisarnos.

| Bloque | Fase 1 · Documentos | Fase 2–3 · Diseño | Fase 4 · Web |
|---|---|---|---|
| **1. Cuenta y negocio** | 02 competencia, 08 modelo de negocio, 09 legal | 11 requisitos de diseño | 13 despliegue, 14 login, 26 precios, 27 límites de plan, 28 landing y legal, 29 panel |
| **2. Subida y lectura** | 05 stack, 06 prueba IA, 07 modelo de datos | 10 mapa de pantallas | 15 originales, 16 arrastrar, 17 foto móvil, 18 lectura IA, 24 correo, 25 compartir (PWA) |
| **3. Revisión y exportación** | 01 público objetivo, 03 banco de tickets, 04 funciones extra | — | 19 corrección, 20 listado, 21 moneda, 22 duplicados, 23 Excel, 30 avisos, 31 pruebas de lectura |
| **Los tres** | | 12 prototipo | |

Trabajamos por fases: cada uno hace las tareas de su bloque en la fase en curso. En la pestaña Issues, cada uno filtra por su etiqueta `bloque-N` y se asigna sus tareas.

## Cómo trabajamos
1. Antes de empezar un issue, asígnatelo y muévelo a *In Progress* en el tablero.
2. Crea una rama por issue: `git checkout -b 12-login` (número y nombre corto).
3. Commits pequeños y con mensaje claro.
4. Abre un pull request hacia `main` con `Closes #número` en la descripción.
5. Lo revisa alguien de otro bloque antes de unirlo, así los tres conocemos todo el código. Nadie sube directamente a `main`.

## Estilo de los documentos
Todos los documentos siguen la [guía de estilo](docs/guia-estilo.md): sin iconos, con las mismas etiquetas de estado (**[Confirmado]**, **[Supuesto]**, **[Propuesta]**, **[Pendiente]**) y de resultados (**Correcto**, **Incorrecto**, **Vacío**, **No aplica**). Quien revisa un pull request comprueba también el estilo.

## Stack (propuesta del #5, pendiente de validar)
| Pieza | Elección |
|---|---|
| Frontend y backend | Next.js (React) |
| Hosting | Vercel (plan Hobby, funciones en Fráncfort `fra1`) |
| Usuarios, base de datos y archivos | Supabase (región Fráncfort `eu-central-1`) |
| Correo entrante | Resend |
| Lectura con IA | Gemini 3.5 Flash Lite (ver `docs/prueba-ia.md`) |

Detalle, motivos, alternativas, diagrama y pendientes en [`docs/arquitectura.md`](docs/arquitectura.md). Las claves (Gemini, Supabase, Resend) van en variables de entorno, nunca en el repositorio. **Importante:** el plan Vercel Hobby no permite uso comercial; cualquier lanzamiento de pago exige revisar hosting, costes y condiciones de los proveedores antes de vender suscripciones.

## Documentación
Índice completo, con responsable y estado de cada documento, en [`docs/README.md`](docs/README.md).

- [Estudio de competencia](docs/competencia.md)
- [Público objetivo y propuesta de valor](docs/publico-objetivo.md)
- [Modelo de negocio y costes](docs/modelo-negocio.md)
- [Normativa aplicable](docs/legal.md)
- [Arquitectura](docs/arquitectura.md)
- [Prueba de concepto de IA](docs/prueba-ia.md)
- [Modelo de datos](docs/modelo-datos.md) y [borrador SQL](docs/modelo-datos.sql)
- [Guía de estilo](docs/guia-estilo.md)

## Estructura
- `docs/` documentos del proyecto y guía de estilo
- `tests/tickets/` tickets y facturas reales para las pruebas de lectura, con los datos personales tapados
- `tests/resultados-ia/` respuestas completas de cada motor de IA en la prueba de lectura

## Orden de trabajo
Los issues llevan delante su número de orden (01, 02…). Se trabajan en ese orden; varios pueden ir en paralelo si sus dependencias ya están cerradas. Cada issue indica de cuáles depende.

| Fase | Orden | Qué |
|---|---|---|
| 1. Documentos MD | 01–09 | Público objetivo → competencia → banco de tickets → funciones extra → stack → prueba IA → modelo de datos → modelo de negocio → legal |
| 2. Requisitos de diseño | 10–11 | Mapa de pantallas → requisitos de diseño |
| 3. Prototipo | 12 | Prototipo navegable (los tres) |
| 4. Web: base | 13–15 | Despliegue → login → guardar originales |
| 4. Web: núcleo | 16–23 | Subida (arrastrar, foto) → lectura IA → corrección → listado → moneda → duplicados → Excel |
| 4. Web: resto | 24–30 | Reenvío por correo, compartir desde el móvil, precios, límites de plan, landing, panel, avisos |
| 4. Cierre | 31 | Prueba de lectura con tickets reales |

### Qué es obligatorio

Los issues con la etiqueta `obligatorio` son los que exige el enunciado. Cada uno cita la frase del enunciado que lo justifica.

| Fase | Obligatorio | No obligatorio |
|---|---|---|
| 1. Documentos MD | 01 público objetivo, 03 banco de tickets, 04 funciones adicionales, 08 modelo de negocio, 09 normativa | 02 competencia (recomendada), 05 stack, 06 prueba IA, 07 modelo de datos (necesarias para construir la web) |
| 2–3. Diseño y prototipo | 11 requisitos de diseño, 12 prototipo | 10 mapa de pantallas (base para el 11) |
| 4. Web | 14 login, 15 originales, 16 arrastrar, 17 foto móvil, 18 lectura IA, 19 corrección, 21 moneda, 22 duplicados, 23 Excel, 24 reenvío por correo, 26 página de precios, 31 prueba de lectura | 13 despliegue (necesario para la demo), 20 listado (basta uno básico), 25 compartir desde el móvil, 27 límites de plan, 28 landing y textos legales, 29 panel, 30 avisos |

El reenvío por correo (24) cubre la tercera vía de subida que pide el enunciado; compartir desde el móvil (25) pasa a función adicional. **[Propuesta]** pendiente de confirmar en el equipo.

Prioridad: primero lo obligatorio y que la aplicación funcione; después, las funciones adicionales que se elijan en la tarea 04.

## Uso de la IA en el proyecto

- **Para redactar y organizar el trabajo:** asistentes de IA (Claude y ChatGPT). Cada documento lo revisa y aprueba una persona del equipo antes de unirlo a `main`, y los datos externos se comprueban en su fuente.
- **Dentro del producto:** la lectura automática de tickets usa un modelo de IA. Se compararon Gemini y Mistral con tickets reales y se eligió Gemini 3.5 Flash Lite. Ver [prueba de lectura con IA](docs/prueba-ia.md).
- Las decisiones las toma el equipo; cada documento indica quién decidió y cuándo.
