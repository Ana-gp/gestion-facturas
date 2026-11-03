# 12 · Prototipo navegable y diseño unificado

Tarea: #11 (orden 12) · Los tres · Última actualización: 03/11/2026

**Estado:** entregado. Cada miembro hizo un diseño y se unificaron en un solo documento el 30/10/2026. La web (#12 en adelante) se construyó a partir del diseño unificado.

Leyenda según la [guía de estilo](../guia-estilo.md): **[Confirmado]**, **[Supuesto]**, **[Propuesta]** y **[Pendiente]**.

## 1. Diseño unificado

[Ticketon-diseno-unificado.pdf](Ticketon-diseno-unificado.pdf) · 21 páginas · 30/10/2026

La primera página compara los tres diseños con el enunciado, el [mapa de pantallas](../mapa-pantallas.md) (#8, PR #54) y las decisiones del equipo, y dice qué se queda de cada uno. Las otras 20 son las pantallas del diseño final:

| Página | Pantalla |
|---|---|
| 1 | Comparativa de los tres diseños |
| 2 | P07 Mis gastos · escritorio |
| 3 | P10 Revisar y corregir · escritorio |
| 4 | P13 Exportar · escritorio |
| 5 | P07 Mis gastos · móvil |
| 6 | P08–P09 Subir y leer · móvil |
| 7 | P10 Revisar y corregir · móvil |
| 8 | P13 Exportar · móvil |
| 9 | P00 Portada |
| 10 | P01 Precios |
| 11 | P06 Textos legales |
| 12 | P02 Crear cuenta |
| 13 | P03 Entrar |
| 14 | P04 Recuperar contraseña |
| 15 | P05 Nueva contraseña |
| 16 | P08–P09 Subir documento · escritorio |
| 17 | P11 Comparar posible duplicado |
| 18 | P12 Original a pantalla completa |
| 19 | P14 Cierre de trimestre |
| 20 | P15 Cuenta y plan |
| 21 | P16 Reenvío por correo |

Los nombres P00 a P17 son los del [mapa de pantallas](../mapa-pantallas.md). Los datos son de ejemplo y las fotos son tickets del banco de pruebas con los datos personales tapados (`tests/tickets/`).

## 2. Los tres diseños de partida

| Quién | Herramienta | Qué incluye | Qué se quedó en el diseño unificado |
|---|---|---|---|
| Ana | La propia web (#63 y #65) | Pantallas ya programadas y panel del 29/10/2026 | Corrección con «Revisar dato» y «Corregido por ti», tipo de cambio propuesto, comparar duplicado, Excel real, tres cifras en Mis gastos y barra de uso del plan |
| Mireia | Figma, prototipo navegable | 17 pantallas de móvil y 5 de escritorio | La estructura: navegación, barra inferior con Foto, botón «Corregir» en cada dato, avisos arriba, zona para arrastrar en Mis gastos, periodos con Anterior y Siguiente, cierre de trimestre y precios |
| Javier | Google Stitch | 15 pantallas de escritorio | Girar y ampliar la foto, la confirmación «Las cuentas cuadran», los filtros por estado, sugerir el NIF de un emisor que ya existe, y las pantallas de acceso, portada y textos legales |

Enlaces:

- **Prototipo de Mireia (Figma):** https://www.figma.com/design/1NQCSZmjxYgBC8g8XcquXp/Ticketon-%E2%80%93-Prototipo--Mireia--%E2%80%93-Issue-11?node-id=4-2
- **Prototipo de Javier (Stitch):** https://stitch.google.com/projects/12186838903003075119

**[Pendiente]** Comprobar que los dos enlaces se abren sin iniciar sesión con otra cuenta (ventana de incógnito).

## 3. Diferencias entre el diseño unificado y la web publicada

El diseño unificado es del 30/10/2026; después se tomaron decisiones que cambian algunas pantallas. Manda lo que está en la web y en los documentos:

| Pantalla | Diseño unificado | Web publicada |
|---|---|---|
| Menú | Gastos, Subir, Exportar y Cuenta | Gastos, Subir y Exportar, y «Cerrar sesión» (#77). Cuenta y plan (P15) no está construida |
| P14 Cierre de trimestre | Pantalla completa con el paquete .zip | Aplazado (#50): sale como «Próximamente» en Exportar y en Precios |
| P15 Instalar en el móvil | «Próximamente» | Ya se puede instalar (manifest, #80) |
| P16 Reenvío por correo | Dirección con `[dominio]` pendiente | Dirección real de cada usuario, probada con un correo real el 03/11/2026 ([prueba de lectura](../pruebas-lectura.md)) |
