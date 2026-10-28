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

## Orden para empezar
- **Bloque 1**: #1 competencia (junto con #2, es la base de todo).
- **Bloque 2**: #6 prueba de concepto de lectura con IA (su coste por factura fija los precios del #3).
- **Bloque 3**: #2 público objetivo y #10 banco de tickets.
