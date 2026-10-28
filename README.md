# Gestión de facturas

Plataforma web de gestión de facturas y tickets por suscripción (proyecto final en equipo).

## Entregables (milestones)
1. Documentos MD previos
2. Requisitos para el diseño
3. Prototipo
4. Web funcionando

## Reparto por bloques
Cada persona lleva un bloque de principio a fin: documentos, diseño, backend y frontend de sus funciones. Así todos tocamos de todo sin pisarnos.

| Bloque | Documentos | Diseño | Backend | Frontend |
|---|---|---|---|---|
| **1. Cuenta y negocio** | #1 competencia, #3 modelo de negocio, #4 legal | #9 requisitos de diseño | #12 repo y despliegue, #13 login, #31 límites de plan | #24 precios, #25 landing y legal, #26 panel |
| **2. Subida y lectura** | #5 stack y arquitectura, #6 prueba IA, #29 modelo de datos | #8 mapa de pantallas | #16 reenvío por correo, #18 originales, #19 lectura IA | #14 foto móvil, #15 arrastrar, #17 compartir (PWA) |
| **3. Revisión y exportación** | #2 público objetivo, #7 funciones extra | #10 banco de tickets | #20 moneda, #22 duplicados, #23 Excel | #21 corrección, #30 listado, #27 avisos, #28 pruebas de lectura |
| **Todo el equipo** | | #11 prototipo | | |

Decidimos entre los tres quién se queda cada bloque, y cada uno filtra por su etiqueta `bloque-N` y se asigna los issues.

## Cómo trabajamos
1. Antes de empezar un issue, asígnatelo y muévelo a *In Progress* en el tablero.
2. Crea una rama por issue: `git checkout -b 12-login` (número y nombre corto).
3. Commits pequeños y con mensaje claro.
4. Abre un Pull Request hacia `main` con `Closes #número` en la descripción.
5. Lo revisa alguien de otro bloque antes de unirlo, así los tres conocemos todo el código. Nadie sube directo a `main`.

## Estructura
- `docs/` documentos del proyecto (competencia, público, modelo de negocio, legal, arquitectura, funciones, requisitos de diseño, pruebas de lectura)
- `tests/tickets/` tickets y facturas reales para las pruebas de lectura

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
