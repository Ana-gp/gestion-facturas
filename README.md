# Gestión de facturas

Herramienta web por suscripción para que los autónomos tengan sus tickets y facturas ordenados y listos para enviar a su gestoría. Proyecto final en equipo.

## Equipo

| Integrante | Bloque |
|---|---|
| Ana | 3. Revisión y exportación |
| Mireia | 2. Subida y lectura |
| Por confirmar | 1. Cuenta y negocio |

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
5. Lo revisa alguien de otro bloque antes de unirlo, así los tres conocemos todo el código. Nadie sube directo a `main`.

## Estilo de los documentos
Todos los documentos siguen la [guía de estilo](docs/guia-estilo.md): sin iconos, con las mismas etiquetas de estado (**[Confirmado]**, **[Supuesto]**, **[Propuesta]**, **[Pendiente]**) y de resultados (**Correcto**, **Incorrecto**, **Vacío**, **No aplica**). Quien revisa un pull request comprueba también el estilo.

## Estructura
- `docs/` documentos del proyecto y guía de estilo. Ver el [índice de documentos](docs/README.md)
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
| 4. Web: resto | 24–30 | Correo, compartir, precios, límites de plan, landing, panel, avisos |
| 4. Cierre | 31 | Prueba de lectura con tickets reales |

Con la fase 4 hasta el orden 23 ya se cumplen casi todos los requisitos obligatorios: es el producto mínimo que tiene que funcionar sí o sí.

## Uso de la IA en el proyecto

- **Para redactar y organizar el trabajo:** asistentes de IA (Claude y ChatGPT). Cada documento lo revisa y aprueba una persona del equipo antes de unirlo a `main`, y los datos externos se comprueban en su fuente.
- **Dentro del producto:** la lectura automática de tickets usa un modelo de IA. Se compararon Gemini y Mistral con tickets reales y se eligió Gemini 3.5 Flash Lite. Ver [prueba de lectura con IA](docs/prueba-ia.md).
- Las decisiones las toma el equipo; cada documento indica quién decidió y cuándo.
