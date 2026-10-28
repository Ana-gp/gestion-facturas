# Gestión de facturas

Plataforma web de gestión de facturas y tickets por suscripción (proyecto final en equipo).

## Entregables (milestones)
1. Documentos MD previos
2. Requisitos para el diseño
3. Prototipo
4. Web funcionando

## Roles
| Rol | Área | Etiqueta |
|---|---|---|
| A | Producto, negocio, legal y diseño | `rol-A: producto` |
| B | Backend e IA | `rol-B: backend-IA` |
| C | Frontend y experiencia móvil | `rol-C: frontend` |

Cada uno filtra los issues por su etiqueta y se asigna los suyos (Assignees → assign yourself).

## Cómo trabajamos
1. Antes de empezar un issue, asígnatelo y muévelo a *In Progress* en el tablero.
2. Crea una rama por issue: `git checkout -b 12-login` (número y nombre corto).
3. Commits pequeños y con mensaje claro.
4. Abre un Pull Request hacia `main` con `Closes #número` en la descripción.
5. Otro compañero lo revisa y lo aprueba antes de unirlo. Nadie sube directo a `main`.

## Estructura
- `docs/` documentos del proyecto (competencia, público, modelo de negocio, legal, arquitectura, funciones, requisitos de diseño, pruebas de lectura)
- `tests/tickets/` tickets y facturas reales para las pruebas de lectura

## Orden para empezar
- **B**: #6 prueba de concepto de lectura con IA (su coste por factura fija los precios).
- **A**: #1 competencia y #2 público objetivo.
- **C**: #10 banco de tickets y #8 mapa de pantallas.
