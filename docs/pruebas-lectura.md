# Prueba de lectura con tickets reales en la web

Tarea: #28 (orden 31) · Bloque 3 (revisión y exportación) · Responsable: Mireia · Última actualización: 03/11/2026

Depende de: #19 ([lectura con IA](lectura-ia.md)), #21 (revisar y corregir), #20 (moneda), #13 (login) y el despliegue en Vercel

**Estado:** plantilla preparada. **[Pendiente]** Toda la prueba: se hace en la web publicada en Vercel, con sesión iniciada. Hasta que estén rellenas las tablas, no se puede afirmar que la lectura funciona con documentos reales en la web.

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
| Fecha de la prueba | [Pendiente] |
| Dirección de la web (Vercel) | [Pendiente] |
| Versión probada (commit de `main`) | [Pendiente] |
| Modelo de IA | `gemini-3.5-flash-lite` (el de `lib/lectura/gemini.ts`) |
| Cuenta A | Correo de Mireia, plan Gratis |
| Cuenta B (para la separación de datos) | Correo de otra persona del equipo |
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
| T1 · Gasolinera arrugado | No probado | No probado | No probado |  |
| T2 · Supermercado, varios IVA | No probado | No probado | No probado |  |
| T3 · PDF en inglés (por correo) | No probado | No probado | No probado |  |
| T4b · Torcida y con poca luz (móvil) | No probado | No probado | No probado |  |
| **Total** | **No probado** |  |  |  |

Referencia fuera de la web (#19, 01/11/2026): 54/56 aciertos (96 %). Fallaron el número de T2 y el NIF del emisor de T4b.

## 5. Lectura por campo

### T1 · Gasolinera arrugado

| Campo | Valor real | Lectura en la web | ¿Pide revisarlo? | Notas |
|---|---|---|---|---|
| Tipo de documento | ticket | No probado | No probado |  |
| Fecha | 2026-03-07 | No probado | No probado |  |
| Emisor | E.S. Villaquejida - Sutecal | No probado | No probado | En el #6 cambió una letra |
| NIF del emisor | B49268071 | No probado | No probado |  |
| NIF del receptor | No aplica | No probado | No probado |  |
| Número de factura / ticket | 2023018651 | No probado | No probado |  |
| IVA 1: tipo (%) | 21 | No probado | No probado |  |
| IVA 1: base imponible | 88,21 | No probado | No probado |  |
| IVA 1: cuota | 18,53 | No probado | No probado |  |
| Base imponible total | 88,21 | No probado | No probado |  |
| Retención | No aplica | No probado | No probado |  |
| Total | 106,74 | No probado | No probado |  |
| Moneda | EUR | No probado | No probado |  |
| Categoría | Combustible y transporte | No probado | No probado |  |

### T2 · Supermercado con varios tipos de IVA

| Campo | Valor real | Lectura en la web | ¿Pide revisarlo? | Notas |
|---|---|---|---|---|
| Tipo de documento | ticket | No probado | No probado |  |
| Fecha | 2025-09-02 | No probado | No probado |  |
| Emisor | Vego Supermercados S.A.U. | No probado | No probado |  |
| NIF del emisor | A36651313 | No probado | No probado |  |
| NIF del receptor | No aplica | No probado | No probado |  |
| Número de factura / ticket | 132740032509026056 | No probado | No probado | En el #6 y el #19 tomó el número del código de barras |
| IVA 1: tipo (%) | 10 | No probado | No probado |  |
| IVA 1: base imponible | 44,58 | No probado | No probado |  |
| IVA 1: cuota | 4,46 | No probado | No probado |  |
| IVA 2: tipo (%) | 21 | No probado | No probado |  |
| IVA 2: base imponible | 10,29 | No probado | No probado |  |
| IVA 2: cuota | 2,16 | No probado | No probado |  |
| IVA 3: tipo (%) | 4 | No probado | No probado |  |
| IVA 3: base imponible | 51,64 | No probado | No probado |  |
| IVA 3: cuota | 2,07 | No probado | No probado |  |
| Base imponible total | 106,51 | No probado | No probado |  |
| Retención | No aplica | No probado | No probado |  |
| Total | 115,20 | No probado | No probado |  |
| Moneda | EUR | No probado | No probado |  |
| Categoría | Alimentación | No probado | No probado |  |

### T3 · Factura PDF de suscripción en inglés

| Campo | Valor real | Lectura en la web | ¿Pide revisarlo? | Notas |
|---|---|---|---|---|
| Tipo de documento | ticket | No probado | No probado | Sin NIF del receptor se guarda como ticket ([lectura con IA](lectura-ia.md), apartado 4) |
| Fecha | 2026-10-14 | No probado | No probado |  |
| Emisor | Anthropic Ireland, Limited | No probado | No probado |  |
| NIF / VAT ID del emisor | IE4276970QH | No probado | No probado |  |
| NIF del receptor | No aplica | No probado | No probado |  |
| Número de factura | 9BF0758D-8771996 | No probado | No probado |  |
| IVA 1: tipo (%) | 21 | No probado | No probado |  |
| IVA 1: base imponible | 18,00 | No probado | No probado |  |
| IVA 1: cuota | 3,78 | No probado | No probado |  |
| Base imponible total | 18,00 | No probado | No probado |  |
| Retención | No aplica | No probado | No probado |  |
| Total | 21,78 | No probado | No probado |  |
| Moneda | EUR | No probado | No probado |  |
| Categoría | Software y suscripciones | No probado | No probado |  |

### T4b · Foto torcida y con poca luz

| Campo | Valor real | Lectura en la web | ¿Pide revisarlo? | Notas |
|---|---|---|---|---|
| Tipo de documento | ticket | No probado | No probado |  |
| Fecha | 2026-10-09 | No probado | No probado | **Trampa:** la marca de la cámara pone 30/10/2026 |
| Emisor | Mercadona, S.A. | No probado | No probado |  |
| NIF del emisor | A46103834 | No probado | No probado | En el #6 y el #19 salió vacío: casi no se lee |
| NIF del receptor | No aplica | No probado | No probado |  |
| Número de factura / ticket | 2939-017-128100 | No probado | No probado |  |
| IVA 1: tipo (%) | 4 | No probado | No probado |  |
| IVA 1: base imponible | 10,66 | No probado | No probado |  |
| IVA 1: cuota | 0,43 | No probado | No probado |  |
| IVA 2: tipo (%) | 10 | No probado | No probado |  |
| IVA 2: base imponible | 29,95 | No probado | No probado |  |
| IVA 2: cuota | 2,99 | No probado | No probado |  |
| IVA 3: tipo (%) | 21 | No probado | No probado |  |
| IVA 3: base imponible | 10,33 | No probado | No probado |  |
| IVA 3: cuota | 2,17 | No probado | No probado |  |
| Base imponible total | 50,94 | No probado | No probado |  |
| Retención | No aplica | No probado | No probado |  |
| Total | 56,53 | No probado | No probado |  |
| Moneda | EUR | No probado | No probado |  |
| Categoría | Alimentación | No probado | No probado |  |

## 6. Recorrido en la web

Una fila por paso y una columna por ticket. "Correcto" si funciona como se describe; si no, "Incorrecto" y en Notas qué pasó.

| Paso | Cómo se comprueba | T1 | T2 | T3 | T4b | Notas |
|---|---|---|---|---|---|---|
| Subida | El documento entra por la vía del apartado 2 sin errores | No probado | No probado | No probado | No probado |  |
| Tiempo de lectura | Segundos desde que se sube hasta ver la ficha | No probado | No probado | No probado | No probado |  |
| Uso del plan | El contador de Subir ("X de 10 documentos este mes") sube 1 | No probado | No probado | No probado | No probado |  |
| Original junto a los datos | Revisar enseña la imagen o el PDF al lado de los datos y "Ver original en grande" lo abre | No probado | No probado | No probado | No probado |  |
| Corrección | Corregir un dato (el que salió mal o, si no hay, la categoría), pulsar "Listo" y comprobar al volver a abrir que se ha guardado | No probado | No probado | No probado | No probado |  |
| Mis gastos | Aparece en la lista con su total y su estado | No probado | No probado | No probado | No probado |  |
| Duplicado | Subir otra vez el mismo archivo: avisa y no gasta lectura | No probado | No probado | No probado | No probado |  |
| Excel | Exportar el periodo del ticket: sale una fila por tipo de IVA, con los datos corregidos y el nombre del original | No probado | No probado | No probado | No probado |  |

**Cámara del móvil:** hacer una foto nueva con "Hacer foto" a un ticket en papel sin datos personales y comprobar que se sube, se lee y abre su ficha. Solo se comprueba que la vía funciona; su lectura no entra en el resumen porque no hay valor real validado.

| Comprobación | Resultado | Notas |
|---|---|---|
| "Hacer foto" abre la cámara trasera, sube la foto y abre la ficha | No probado |  |

## 7. Separación de datos entre cuentas

| Comprobación | Resultado | Notas |
|---|---|---|
| Con la cuenta B, Mis gastos no muestra ningún documento de la cuenta A | No probado |  |
| Con la cuenta B, abrir la dirección de una ficha de la cuenta A (`/revisar/<id>`) no enseña sus datos ni su original | No probado |  |
| Con la cuenta B, el Excel no incluye documentos de la cuenta A | No probado |  |
| Un correo reenviado desde una dirección no autorizada no se guarda en ninguna cuenta | No probado |  |

## 8. Prueba adicional: otra moneda

**[Propuesta]** T3 está en euros, así que ninguno de los cuatro tickets prueba la conversión que pide el enunciado. Se añade E5 (`extra-bodega-aurrera-mxn.jpg`, pesos mexicanos), subido desde el ordenador.

| Campo | Valor real | Resultado en la web | Notas |
|---|---|---|---|
| Moneda | MXN | No probado | **Trampa:** el "$" son pesos, no dólares |
| Total | 635,02 | No probado |  |
| Fecha | 2024-01-06 | No probado | 6 de enero, no 1 de junio |
| IVA 1 (8 %): base y cuota | 323,62 y 25,89 | No probado | **Trampa:** el IEPS no es IVA; en el #6 lo metió como segunda línea |
| Tipo de cambio propuesto y su fecha | [Pendiente] | No probado | Cambio del BCE del último día publicado antes de la fecha del ticket (#20). Apuntar el que propone la web |
| Total en euros | [Pendiente] | No probado | Comprobar que es el total por el tipo de cambio |

## 9. Fallos encontrados

Cada fallo importante se abre como issue en GitHub y se enlaza aquí.

| Fallo | Ticket | Gravedad | Issue | Estado |
|---|---|---|---|---|
| [Pendiente] |  |  |  |  |

## 10. Conclusión

**[Pendiente]** Se escribe cuando estén rellenos los apartados 4 a 9. Debe decir con qué tickets se ha probado, qué falló y cómo lo resuelve la pantalla de revisión. No se afirma más de lo que se haya comprobado.
