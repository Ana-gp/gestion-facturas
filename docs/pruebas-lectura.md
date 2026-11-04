# Prueba de lectura con tickets reales en la web

Tarea: #28 (orden 31) · Bloque 3 (revisión y exportación) · Responsable: Mireia · Última actualización: 03/11/2026 (resultados de T1, T2 y E5)

Depende de: #19 ([lectura con IA](lectura-ia.md)), #21 (revisar y corregir), #20 (moneda), #13 (login) y el despliegue en Vercel

**Estado:** terminado (03/11/2026). **[Confirmado]** Probados en la web publicada los 4 tickets del enunciado y E5 (otra moneda), las tres vías de subida, la foto con la cámara del móvil, la corrección con «Listo», el aviso de archivo repetido, el Excel, la separación entre dos cuentas y la instalación en el móvil. Resultado y límites en el apartado 10.

Leyenda según la [guía de estilo](guia-estilo.md): **[Confirmado]**, **[Supuesto]**, **[Propuesta]** y **[Pendiente]**. En las tablas de resultados: **Correcto**, **Incorrecto**, **Vacío**, **No aplica**, **No evaluable** y **No probado**.

## 1. Objetivo

**[Confirmado]** El enunciado lo exige: "La herramienta tiene que funcionar con tickets reales: uno de gasolinera arrugado, uno de supermercado con varios tipos de IVA, una factura en PDF de una suscripción en inglés y una foto torcida y con poca luz."

La [prueba de IA](prueba-ia.md) (#6) y la [prueba de la instrucción](lectura-ia.md) (#19, apartado 3) se hicieron fuera de la web, en AI Studio. Esta prueba comprueba lo mismo **dentro de Ticketon**, con el recorrido completo que hará un autónomo:

1. **Lectura por campo:** qué datos lee bien la web, antes de corregir nada.
2. **Recorrido:** subir, ver el original junto a los datos, corregir, aviso de duplicado y exportación a Excel.
3. **Separación de datos:** una cuenta no ve los documentos de otra.

## 2. Condiciones de la prueba

Rellenar antes de empezar:

| Dato | Valor |
|---|---|
| Fecha de la prueba | 03/11/2026 |
| Dirección de la web (Vercel) | https://gestion-facturas-xi.vercel.app |
| Versión probada (commit de `main`) | [Pendiente] |
| Modelo de IA | `gemini-3.5-flash-lite` (el de `lib/lectura/gemini.ts`) |
| Cuenta A | Correo de Mireia, plan Gratis |
| Cuenta B (para la separación de datos) | Otra cuenta de Mireia, creada el 03/11/2026 con su mismo Gmail y "+prueba" (para la web es otro usuario) |
| Ordenador y navegador | [Pendiente] |
| Móvil y navegador | [Pendiente] |

**[Propuesta]** Cada ticket entra por una vía de subida distinta, para probar de paso las tres que pide el enunciado:

| Ticket | Archivo (en `tests/tickets/`) | Vía de subida |
|---|---|---|
| T1 · Gasolinera arrugado | `T1-gasolinera-arrugado.jpg` | Ordenador: arrastrar a la zona de Subir |
| T2 · Supermercado con varios tipos de IVA | `T2-eroski-varios-iva.jpg` | Ordenador: botón "Elegir archivos" |
| T3 · PDF de suscripción en inglés | `T3-claude-pro-ingles.pdf` | Reenvío por correo a la dirección de la cuenta A (#16) |
| T4b · Foto torcida y con poca luz | `T4b-mercadona-torcida-poca-luz.jpg` | Móvil: botón "Elegir archivos" de Subir, con la imagen guardada en el móvil |

**Aviso:** se suben siempre los archivos tapados del repositorio, nunca tickets con datos personales.

**Aviso:** el 03/11/2026, T1, T2 y E5 los subió un asistente del navegador con copias de las imágenes tapadas con otro nombre (`T1-villaquejida.jpg`, `T2-eroski.jpg`, `E5-aurrera-mxn.jpg`). **[Supuesto]** Son las mismas fotos que las de `tests/tickets/`; podrían estar recomprimidas.

**Aviso:** el botón "Hacer foto" abre directamente la cámara (`capture="environment"`) y no deja elegir una imagen guardada. Por eso T4b entra por "Elegir archivos" desde el móvil, y la cámara se prueba aparte en el apartado 6 con una foto nueva de un ticket en papel sin datos personales.

## 3. Cómo se rellenan las tablas

- **Valor real:** ya está escrito. Es el validado en el #6 ([valores reales](valores-reales-tickets.xlsx)).
- **Lectura en la web:** lo que muestra la pantalla Revisar **nada más leer, antes de corregir**. Mismos criterios que en la [prueba de IA](prueba-ia.md), apartado 4: en el emisor no cuentan mayúsculas ni puntuación; una línea de IVA inventada cuenta como un solo error.
- **¿Pide revisarlo?:** Sí si la ficha marca ese campo para revisar; No si no lo marca. Sirve para ver si los errores quedan señalados.
- **Notas:** si es Incorrecto, qué salió (por ejemplo, "leyó 12,30 en vez de 12,80").
- Hacer una captura de cada ficha, con los datos personales tapados, y guardarla en `tests/resultados-web/` con el nombre del ticket (`T1.png`, `T2.png`…).

## 4. Resumen

Se rellena al final.

| Ticket | Aciertos de lectura | Errores señalados para revisar | Recorrido completo | Notas |
|---|---|---|---|---|
| T1 · Gasolinera arrugado | 13/13 | Ningún error, ningún aviso | Sí (no entra en el Excel del 4.º trimestre: es de marzo) | Aviso de archivo repetido: correcto |
| T2 · Supermercado, varios IVA | 17/19 | 0 de 2 | Sí; «Listo» se repitió tras el #90 con T4b. No entra en el Excel del 4.º trimestre (es de 2025) | Fallan el emisor (VEGES) y un dígito del número, sin "Revisar dato" |
| T3 · PDF en inglés (por correo) | 14/14 | Ningún error, ningún aviso | Sí, incluido el Excel del 4.º trimestre | Reenvío por correo superado |
| T4b · Torcida y con poca luz | 18/20 | 2 de 2 | Sí | Fecha con día y mes cruzados y NIF vacío; los dos con "Revisar dato" |
| **Total** | **62/66 (94 %)** | 2 de 4 errores señalados | | Fuera de la web (#19) fue 54/56. Los dos errores de T2 no se señalan |

Referencia fuera de la web (#19, 01/11/2026): 54/56 aciertos (96 %). Fallaron el número de T2 y el NIF del emisor de T4b.

## 5. Lectura por campo

### T1 · Gasolinera arrugado

Leído en la web el 03/11/2026, subido con "Elegir archivos" (no arrastrando). Capturas: `tests/resultados-web/T1-1-documento.jpg`, `T1-2-emisor-importes.jpg` y `T1-3-total-categoria.jpg` (ficha entera, sin correcciones). Ningún campo sale con "Revisar dato". No hubo nada que corregir.

| Campo | Valor real | Lectura en la web | ¿Pide revisarlo? | Notas |
|---|---|---|---|---|
| Tipo de documento | ticket | Correcto | No |  |
| Fecha | 2026-03-07 | Correcto | No |  |
| Emisor | E.S. Villaquejida - Sutecal | Correcto | No | Devolvió "E.S. VILLAQUEJIDA - SUTECAL". En el #6 cambió una letra; aquí no |
| NIF del emisor | B49268071 | Correcto | No |  |
| NIF del receptor | No aplica | Correcto | No |  |
| Número de factura / ticket | 2023018651 | Correcto | No |  |
| IVA 1: tipo (%) | 21 | Correcto | No |  |
| IVA 1: base imponible | 88,21 | Correcto | No |  |
| IVA 1: cuota | 18,53 | Correcto | No |  |
| Base imponible total | 88,21 | No probado | No probado |  |
| Retención | No aplica | Correcto | No |  |
| Total | 106,74 | Correcto | No |  |
| Moneda | EUR | Correcto | No |  |
| Categoría | Combustible y transporte | Correcto | No |  |

### T2 · Supermercado con varios tipos de IVA

Leído en la web el 03/11/2026, subido con "Elegir archivos". Capturas: `tests/resultados-web/T2-0-antes-de-corregir.jpg` (parte superior, antes de corregir) y `T2-1` a `T2-3` (ficha ya corregida). La foto está borrosa: el NIF no se puede cotejar del todo en pantalla. Se corrigieron a mano el emisor y el número.

| Campo | Valor real | Lectura en la web | ¿Pide revisarlo? | Notas |
|---|---|---|---|---|
| Tipo de documento | ticket | Correcto | No |  |
| Fecha | 2025-09-02 | Correcto | No |  |
| Emisor | Vego Supermercados S.A.U. | Incorrecto | No | Leyó "VEGES" en vez de "VEGO". Corregido a mano |
| NIF del emisor | A36651313 | Correcto | No | Coincide con el valor real validado en el #6, aunque en pantalla se ve borroso |
| NIF del receptor | No aplica | Correcto | No |  |
| Número de factura / ticket | 132740032509026056 | Incorrecto | No | Leyó 132740032508026056: un dígito (2508 en vez de 2509). Ya no toma el número del código de barras, como en el #6 y el #19. Corregido a mano |
| IVA 1: tipo (%) | 10 | Correcto | No |  |
| IVA 1: base imponible | 44,58 | Correcto | No |  |
| IVA 1: cuota | 4,46 | Correcto | No |  |
| IVA 2: tipo (%) | 21 | Correcto | No |  |
| IVA 2: base imponible | 10,29 | Correcto | No |  |
| IVA 2: cuota | 2,16 | Correcto | No |  |
| IVA 3: tipo (%) | 4 | Correcto | No |  |
| IVA 3: base imponible | 51,64 | Correcto | No |  |
| IVA 3: cuota | 2,07 | Correcto | No |  |
| Base imponible total | 106,51 | No probado | No probado |  |
| Retención | No aplica | Correcto | No |  |
| Total | 115,20 | Correcto | No | Los tres tipos de IVA suman el total |
| Moneda | EUR | Correcto | No |  |
| Categoría | Alimentación | Correcto | No |  |

### T3 · Factura PDF de suscripción en inglés

Leído en la web el 03/11/2026, tras llegar por correo. Capturas: `tests/resultados-web/T3-0-antes-de-corregir-documento.jpg` y `T3-0-antes-de-corregir-emisor.jpg` (antes de corregir) y `T3-1` a `T3-3` (ficha actual; el "Corregido por ti" del emisor viene de la prueba de «Listo», aunque el texto es el original). Ningún campo sale con "Revisar dato".

| Campo | Valor real | Lectura en la web | ¿Pide revisarlo? | Notas |
|---|---|---|---|---|
| Tipo de documento | ticket | Correcto | No | Sin NIF del receptor se guarda como ticket ([lectura con IA](lectura-ia.md), apartado 4) |
| Fecha | 2026-10-14 | Correcto | No |  |
| Emisor | Anthropic Ireland, Limited | Correcto | No |  |
| NIF / VAT ID del emisor | IE4276970QH | Correcto | No | En pantalla se ve pequeño: cotejado con el valor real, no con el PDF |
| NIF del receptor | No aplica | Correcto | No |  |
| Número de factura | 9BF0758D-8771996 | Correcto | No | Igual que el NIF |
| IVA 1: tipo (%) | 21 | Correcto | No |  |
| IVA 1: base imponible | 18,00 | Correcto | No |  |
| IVA 1: cuota | 3,78 | Correcto | No |  |
| Base imponible total | 18,00 | Correcto | No |  |
| Retención | No aplica | Correcto | No |  |
| Total | 21,78 | Correcto | No |  |
| Moneda | EUR | Correcto | No |  |
| Categoría | Software y suscripciones | Correcto | No |  |

### T4b · Foto torcida y con poca luz

Leído en la web el 03/11/2026, subido por Mireia desde el móvil con "Elegir archivos" (el original se guarda con el nombre que le da el móvil, `c8671a73-….jpeg`); la ficha se comprobó después desde el ordenador. Capturas: `tests/resultados-web/T4b-0-antes-de-corregir.jpg`, y `T4b-1` y `T4b-2` (ya corregida con «Listo»).

| Campo | Valor real | Lectura en la web | ¿Pide revisarlo? | Notas |
|---|---|---|---|---|
| Tipo de documento | ticket | Correcto | No |  |
| Fecha | 2026-10-09 | Incorrecto | Sí | Leyó 10/09/2026: **día y mes cruzados**, como el ticket de Lidl. No usó la marca de la cámara (30/10/2026). La ficha sí la marcó con "Revisar dato". Corregida con «Listo». En AI Studio (#19) la leyó bien |
| Emisor | Mercadona, S.A. | Correcto | No | Devolvió "MERCADONA" (sin ", S.A."; no cuenta como error según el apartado 3) |
| NIF del emisor | A46103834 | Vacío | Sí | Sin dato y marcado con "Revisar dato": en esta foto casi no se lee, igual que en el #6 y el #19. No se lo inventó. Corregido con «Listo» |
| NIF del receptor | No aplica | Correcto | No |  |
| Número de factura / ticket | 2939-017-128100 | Correcto | No |  |
| IVA 1: tipo (%) | 4 | Correcto | No |  |
| IVA 1: base imponible | 10,66 | Correcto | No |  |
| IVA 1: cuota | 0,43 | Correcto | No |  |
| IVA 2: tipo (%) | 10 | Correcto | No |  |
| IVA 2: base imponible | 29,95 | Correcto | No |  |
| IVA 2: cuota | 2,99 | Correcto | No |  |
| IVA 3: tipo (%) | 21 | Correcto | No |  |
| IVA 3: base imponible | 10,33 | Correcto | No |  |
| IVA 3: cuota | 2,17 | Correcto | No |  |
| Base imponible total | 50,94 | Correcto | No |  |
| Retención | No aplica | Correcto | No |  |
| Total | 56,53 | Correcto | No |  |
| Moneda | EUR | Correcto | No |  |
| Categoría | Alimentación | Correcto | No |  |

## 6. Recorrido en la web

Una fila por paso y una columna por ticket. "Correcto" si funciona como se describe; si no, "Incorrecto" y en Notas qué pasó.

| Paso | Cómo se comprueba | T1 | T2 | T3 | T4b | Notas |
|---|---|---|---|---|---|---|
| Subida | El documento entra por la vía del apartado 2 sin errores | Correcto | Correcto | Correcto | Correcto | T3 (03/11/2026): reenviado con «Reenviar» desde el correo de la cuenta A. Resend lo recibió con el PDF adjunto y el webhook respondió 200 `{"ok":true}` al primer intento. T1 y T2 (03/11/2026): subidos con "Elegir archivos". T1 se volvió a subir **arrastrándolo** a la zona de Subir: llega bien y sale el aviso de repetido, aunque el archivo tenía otro nombre (compara el contenido, no el nombre). Captura: `tests/resultados-web/T1-arrastrar-repetido.jpg`, con la dirección de reenvío pixelada. T4b: subido desde el móvil, como prevé el apartado 2. |
| Tiempo de lectura | Segundos desde que se sube hasta ver la ficha | No probado | No probado | No probado | No probado |  |
| Uso del plan | El contador de Subir ("X de 10 documentos este mes") sube 1 | Correcto | Correcto | No probado | No probado | Marca 5 de 10 con 4 documentos en la lista: cuenta también el T3 que se borró. Es lo previsto: el contador solo sube (`uso_mensual`, #31), así que borrar no devuelve la lectura. |
| Original junto a los datos | Revisar enseña la imagen o el PDF al lado de los datos y "Ver original en grande" lo abre | Correcto | Correcto | Correcto | Correcto | Se ve en todas las capturas, con el enlace "Ver original en grande". |
| Corrección | Corregir un dato, pulsar «Listo» y comprobar al volver a abrir que se ha guardado | No probado | Correcto | Correcto | Correcto | Antes del #90, en T2 y T3 «Listo» no guardaba (el cambio se perdía al salir). **Repetido tras el #90 (03/11/2026, 14:55):** en T2 y T3 se cambió la categoría a «Otros» con «Listo», se salió y al volver seguía en «Otros» (el mensaje dice "Cambios guardados"); después se devolvió a la categoría original con «Listo» y también se mantuvo. La marca "Corregido por ti" no se quita al volver al valor original: ver apartado 9. **Tras unir el PR #90 (14:22):** en T4b se corrigieron la fecha y el NIF solo con «Listo», se salió a Mis gastos y al volver seguían guardados, con "Corregido por ti". La ficha, que estaba como revisada, pasó a "Pendiente de revisar", como prevé el #90. |
| Mis gastos | Aparece en la lista con su total y su estado | Correcto | Correcto | Correcto | Correcto | T3: «Anthropic Ireland, Limited · 14/10/2026 · 21,78 € · Pendiente de revisar», con la etiqueta «Llegó por correo». Se guarda como ticket por la regla de [lectura con IA](lectura-ia.md), apartado 4 (no trae NIF del receptor) |
| Duplicado | Subir otra vez el mismo archivo: avisa y no gasta lectura | Correcto | No probado | No probado | No probado | T1: al repetir la subida con «Elegir archivos», aparece el aviso de archivo repetido y no consume lectura. Queda debajo del área visible; la PR #93 incorpora el desplazamiento automático para mostrar el resultado. T3 por correo: el webhook descarta el adjunto repetido y responde 200, pero no avisa al usuario; no duplica ni consume lectura. «Posibles duplicados» sigue en 0, correctamente: ese contador corresponde a facturas iguales en archivos distintos. |
| Excel | Exportar el periodo del ticket: sale una fila por tipo de IVA, con los datos corregidos y el nombre del original | No probado | No probado | Correcto | Correcto | Resumen de Exportar (03/11/2026): 4.º trimestre de 2026, 1 documento, 21,78 €; año 2026, 2 documentos, 128,52 €; año 2025, 1 documento, 115,20 €; año 2024, 1 documento, 34,13 €. Los tickets son de tres años distintos, así que hay que exportar cada periodo. Captura del 4.º trimestre de 2026: `tests/resultados-web/Exportar-4T-2026.jpg` (1 documento, 21,78 €, 1 sin tus datos fiscales, 1 pendiente de revisar). Mis gastos: `Gastos-1-resumen.jpg` y `Gastos-2-lista.jpg` (4 pendientes, 0 posibles duplicados, los 4 documentos con su total). **[Pendiente]** Descargar el Excel y comprobar las filas. Excel del 4.º trimestre de 2026 descargado (`Ticketon_gastos_2026-T4.xlsx`; no se sube al repositorio porque el resumen lleva el correo de la titular): 2 documentos, 78,31 €. T4b ocupa tres filas (4 %: 10,66 + 0,43; 10 %: 29,95 + 2,99; 21 %: 10,33 + 2,17) con la fecha y el NIF corregidos, y el total 56,53 € solo en la primera; T3 una fila de 21,78 €. Resumen por tipo: 21 % 28,33 + 5,95; 10 % 29,95 + 2,99; 4 % 10,66 + 0,43. Cada fila lleva el nombre de su original (`001_2026-10-09_MERCADONA.jpeg`). |

**Cámara del móvil:** hacer una foto nueva con "Hacer foto" a un ticket en papel sin datos personales y comprobar que se sube, se lee y abre su ficha. Solo se comprueba que la vía funciona; su lectura no entra en el resumen porque no hay valor real validado.

| Comprobación | Resultado | Notas |
|---|---|---|
| "Hacer foto" abre la cámara trasera, sube la foto y abre la ficha | Correcto | Ana, 03/11/2026, iPhone: "Hacer foto" abrió la cámara directamente; se hizo la foto de un billete de autobús urbano, se leyó y la ficha enseña la foto encima de los datos. Emisor, fecha y categoría correctos; total 0,00 €, el del billete (validación de bono). Captura fuera del repositorio porque el billete lleva el número de la tarjeta de transporte |

**Instalación en el móvil** (función adicional, PR #80): comprobada el 03/11/2026 por Mireia en un iPhone con Safari ("Compartir" → "Añadir a pantalla de inicio").

| Comprobación | Resultado | Notas |
|---|---|---|
| Aparece el icono de Ticketon en la pantalla de inicio | Correcto | Icono azul con el ticket blanco y el nombre "Ticketon" (`tests/resultados-web/Instalacion-1-icono-iphone.jpg`) |
| Al abrirlo se ve como una app, sin la barra del navegador, y entra en Mis gastos | Correcto | Con la sesión iniciada: 4.º trimestre de 2026, 2 documentos, 78,31 € (`Instalacion-2-app-abierta-iphone.jpg`) |
| Android (Chrome) | No probado | Ana dejó como supuesto en el #80 que Chrome no exige service worker para instalar |


### 6.1. Instalación de la PWA en Android

**[Confirmado]** Prueba manual documentada el 04/11/2026 a partir de tres capturas aportadas por Javier:

| Paso | Resultado | Evidencia |
|---|---|---|
| Abrir Ticketon en Chrome Android y consultar el menú | Aparece «Instalar y crear acceso directo» | Captura 1 del ZIP aportado por Javier |
| Instalar y comprobar el icono | Aparece el icono de Ticketon en la pantalla de inicio | Captura 2 del ZIP aportado por Javier |
| Abrir desde el icono | Se abre «Mis gastos» en una ventana de aplicación, sin la barra ni los controles habituales de Chrome | Captura 3 del ZIP aportado por Javier |

**Evidencia:** archivo `Capturas_Android.zip`, con tres imágenes aportadas por Javier. Las capturas todavía no se han incorporado al repositorio; se identifican aquí por el orden en que aparecen en el ZIP.

**Dispositivo:** Huawei, identificador de modelo `YAL-L21` (metadatos EXIF de las dos capturas de la aplicación).  
**Fecha:** 04/11/2026 (metadatos EXIF de las capturas del icono y de la aplicación abierta).  
**Navegador:** Chrome para Android, identificado por el menú mostrado en la captura de instalación. No se ha registrado su versión.

**Límites:** esta prueba acredita la instalación y apertura de Ticketon como PWA en ese dispositivo Android. No comprueba el funcionamiento sin conexión, las notificaciones, la subida de documentos ni la opción de compartir archivos desde el menú Compartir. La segunda función de la issue #17 sigue pendiente.

## 7. Separación de datos entre cuentas

| Comprobación | Resultado | Notas |
|---|---|---|
| Con la cuenta B, Mis gastos no muestra ningún documento de la cuenta A | Correcto | "Todavía no has subido ningún justificante" (`tests/resultados-web/Separacion-1-mis-gastos-vacio.jpg`). Uso del plan: 0 de 10 |
| Con la cuenta B, abrir la dirección de una ficha de la cuenta A (`/revisar/<id>`) no enseña sus datos ni su original | Correcto | Ficha de T4b: error 404, sin datos ni foto (`Separacion-3-ficha-T4b-404.jpg`). También el enlace directo al original de T4b: 404, sin imagen (`Separacion-4-foto-original-T4b-404.jpg`) |
| Con la cuenta B, el Excel no incluye documentos de la cuenta A | Correcto | Exportar, 4.º trimestre de 2026: "No hay gastos en este periodo" (`Separacion-2-exportar-4T-2026-vacio.jpg`). La cuenta B tiene su propia dirección de reenvío y solo su correo como autorizado |
| Un correo reenviado desde una dirección no autorizada no se guarda en ninguna cuenta | No probado |  |

**Límite:** se comprobaron Mis gastos, Exportar y la ficha y el original de T4b; no el resto de documentos ni todas las rutas. No sustituye a una revisión de seguridad.


### 7.1. Registro, acceso y recuperación de contraseña (#13)

**[Confirmado]** Según la prueba realizada por Javier en producción el 04/11/2026, el recorrido de recuperación de contraseña llegó a completarse:

1. Desde la pantalla de recuperación, solicitó el correo y abrió el enlace recibido de Supabase.
2. El enlace abrió «Crea una contraseña nueva».
3. Introdujo la nueva contraseña en los dos campos y pulsó el botón para guardarla.
4. La aplicación le llevó a la pantalla de acceso con la contraseña todavía introducida, pero el campo del correo vacío.
5. Pulsó primero el botón de acceso sin introducir el correo y la aplicación mostró el aviso de que faltaba ese dato.
6. Introdujo manualmente su dirección de Gmail y pudo iniciar sesión con la nueva contraseña.

**Resultado:** recuperación de contraseña y posterior acceso con la contraseña nueva, correctos en la prueba manual comunicada por Javier.

**Límite de la evidencia:** no se ha adjuntado una captura de la pantalla de nueva contraseña ni del acceso posterior. Tampoco se registra el texto exacto de un posible mensaje de confirmación al guardar. El correo no se autocompletó en la pantalla de acceso; fue necesario introducirlo manualmente. Esto no impidió completar el inicio de sesión y se anota como comportamiento observado, no como fallo de recuperación.


## 8. Prueba adicional: otra moneda

Leído en la web el 03/11/2026, subido con "Elegir archivos". Capturas: `tests/resultados-web/E5-0-antes-del-tipo-de-cambio.jpg` y `E5-1` a `E5-4` (con el tipo de cambio ya aceptado). Avisos de la ficha: "Las cuentas no cuadran" y "Factura en MXN: falta el tipo de cambio".

**[Propuesta]** T3 está en euros, así que ninguno de los cuatro tickets prueba la conversión que pide el enunciado. Se añade E5 (`extra-bodega-aurrera-mxn.jpg`, pesos mexicanos), subido desde el ordenador.

| Campo | Valor real | Resultado en la web | Notas |
|---|---|---|---|
| Moneda | MXN | Correcto | **Trampa:** el "$" son pesos, no dólares |
| Total | 635,02 | Correcto |  |
| Fecha | 2024-01-06 | Correcto | 6 de enero, no 1 de junio |
| IVA 1 (8 %): base y cuota | 323,62 y 25,89 | Correcto | Leyó el IVA y **no** metió el IEPS como IVA (en el #6 sí lo hizo). La ficha avisa "Las cuentas no cuadran: bases, cuotas y retención suman 349,51 y el total es 635,02" y marca para revisar las líneas de IVA y el total, porque el total incluye el IEPS y productos sin impuesto: el aviso es razonable |
| Tipo de cambio propuesto y su fecha | 18,6066 (2024-01-05) | Correcto | El 06/01/2024 fue sábado: toma el viernes. La ficha dice "Tipo oficial del euro del BCE, el mismo que publica el Banco de España, del 05/01/2024"; la web guarda la fuente como "BDE". Al aceptarlo sale "Corregido por ti". Guardado con "Guardar cambios" |
| Total en euros | 34,13 € | Correcto | 635,02 / 18,6066 |

### Otros documentos probados

| Documento | Quién y cuándo | Resultado | Notas |
|---|---|---|---|
| Ticket de Lidl de Ana (no está en el banco de tickets) | Ana, 03/11/2026 | Subir, leer, revisar y exportar funcionan. Excel del 4.º trimestre: 3 tipos de IVA (4, 10 y 21 %) y 73,13 €, igual que el papel | **Fecha: Incorrecta.** El ticket dice 02/10/26 (2 de octubre) y Gemini devolvió 10/02/2026 (10 de febrero), sin marcarla para revisar. Se guardó como revisada y el Excel del trimestre salió vacío hasta corregirla. Ver apartado 9 |

## 9. Fallos encontrados

Cada fallo importante se abre como issue en GitHub y se enlaza aquí.

| Fallo | Ticket | Gravedad | Issue | Estado |
|---|---|---|---|---|
| «Listo» no guardaba la corrección: se perdía al salir de la ficha, sin aviso. Incumplía el apartado 3.4 del [mapa de pantallas](mapa-pantallas.md) ("se guarda en ese momento") y el requisito 4 (corregir en dos clics) | T2 y T3 | **Alta:** la persona cree que ha corregido y puede perder el dato | PR #90 (fusionada) | `confirmar()` en `Revisar.tsx` solo cambiaba la pantalla. La PR #90 hace que «Listo» guarde en ese momento, avisa al salir con cambios sin guardar y devuelve a pendiente una ficha revisada cuando se corrige. **[Pendiente]** Repetir las pruebas de T2 y T3 en producción tras la fusión de #90. |
| La IA cruzó el día y el mes de la fecha (02/10 → 10/02) y no lo marcó para revisar | Lidl (Ana) | Media: fecha mal en el Excel; el trimestre sale vacío | PR #88 | Aviso "día y mes cruzados" en la ficha y regla en la instrucción. Solo avisa si la fecha cruzada cae en los 90 días anteriores a la subida (`documentos.subido_en`). Comprobado con las fechas reales: T1, T2, T3, T4b y E5 no avisan; el Lidl mal leído sí |
| «Corregido por ti» se queda aunque se vuelva al valor original | T2 y T3 | Baja: solo es la marca; los datos se guardan bien | PR #90 (unido), en parte | El #90 la quita si el dato vuelve al valor que tenía **al abrir la ficha** (`alAbrir`). Si se cambia, se sale y se vuelve, ese valor ya es el cambiado, y al devolver el dato al de la IA la marca se queda (comprobado el 03/11/2026 con la categoría de T2 y T3). **[Propuesta]** Comparar con lo que leyó la IA (`facturas.datos_ia`) en vez de con el valor al abrir |
| T2: emisor "VEGES" en vez de "VEGO" y un dígito del número (2508 en vez de 2509), sin marcarlos para revisar | T2 | Baja: se corrige en la ficha | — | Foto borrosa. La pantalla Revisar enseña el original al lado para comprobarlo. Como en el #19, la IA no avisa de sus propios errores |
| "Con avisos" de Mis gastos no coincide con los avisos de la ficha ni del Excel | E5 y T4b | Baja | — | Mis gastos solo cuenta duplicado, moneda sin convertir y lectura fallida (`lib/gastos/listado.ts`), a propósito. En cambio, el Excel cuenta "Sin NIF del receptor" ("Documentos con avisos: 2") y la ficha de E5 avisa "Las cuentas no cuadran". **[Propuesta]** Después de la entrega, usar el mismo criterio o cambiar el nombre del filtro |
| T4b aparecía como "Revisada" sin que Mireia la marcara | T4b | **[Pendiente]** confirmar | — | La web permite guardarla como revisada con avisos (solo exige fecha, emisor, total y categoría), así que puede ser una prueba de otra persona. Preguntar al equipo |
| El aviso de archivo repetido queda abajo de la pantalla y hay que bajar para verlo | T1 | Baja: el aviso sale y funciona; se puede pasar por alto | PR #93 | Al añadir un archivo, la pantalla baja sola hasta el resultado |
| Un adjunto repetido por correo se descarta sin avisar al usuario | T3 (correo) | Baja: no se pierde nada ni se gasta lectura | [Pendiente] para después de la entrega | Se descarta sin duplicar ni consumir lectura; el aviso en la pantalla de reenvío queda como mejora posterior. |

## 10. Conclusión

**[Confirmado]** Ticketon funciona con los cuatro tickets reales que pide el enunciado, dentro de la web publicada (03/11/2026):

1. **Lectura:** 62 de 66 campos bien leídos (94 %), cerca del 54/56 (96 %) de la prueba fuera de la web (#19). E5, en pesos mexicanos, se leyó bien y la conversión a euros dio 34,13 € con el tipo oficial del 05/01/2024.
2. **Qué falló:** cuatro campos en dos tickets.
   - T4b: la fecha, con el día y el mes cruzados, y el NIF del emisor, vacío porque casi no se lee. La ficha marcó los dos con "Revisar dato".
   - T2: una letra del emisor ("VEGES") y un dígito del número. La ficha no los marcó.
3. **Cómo lo resuelve la pantalla de revisión:** Revisar enseña el original junto a los datos, marca los dudosos y deja corregir cada dato en dos clics: pulsarlo y «Listo», que lo guarda en ese momento (PR #90, comprobado en T2, T3 y T4b). Los errores que la IA no marca, como los de T2, solo se ven comparando con el original. Por eso la ficha se guarda como pendiente hasta que la persona la da por revisada.
4. **Recorrido:**
   - Subida por las tres vías: ordenador (arrastrar y elegir archivo), móvil (elegir archivo y "Hacer foto") y reenvío por correo.
   - Aviso de archivo repetido, sin gastar lectura.
   - Excel del 4.º trimestre con una fila por tipo de IVA.
   - Separación entre dos cuentas.
   - Instalación en el móvil.
5. **Fallos de la web encontrados en la prueba y ya arreglados:** «Listo» no guardaba (PR #90), fecha cruzada sin aviso (PR #88) y aviso de repetido fuera de la pantalla (PR #93).

**Límites:**
- No se ha probado en la web el duplicado entre dos fotos distintas del mismo ticket (solo con el mismo archivo y con las pruebas automáticas).
- Tampoco el correo de un remitente no autorizado, el tiempo de lectura ni Android.
- La recuperación de contraseña (#13) se completó en una prueba manual comunicada por Javier el 04/11/2026; no se adjuntaron capturas de los pasos 4 y 5. El correo no se autocompletó en el formulario de acceso y hubo que introducirlo manualmente (apartado 7.1).
- Es una sola prueba, con un ticket de cada tipo: no mide la precisión con muchos documentos.
- T4b apareció como «Revisada» sin que Mireia la marcara. La web solo lo hace con «Guardar como revisada»; **[Supuesto]** lo pulsó el asistente del navegador que hizo parte de la subida. Sin confirmar (apartado 9).
- Quedan para después de la entrega las mejoras del apartado 9.
