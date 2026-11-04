# 04 · Funciones adicionales

Tarea: #7 (orden 04) · Bloque 3 (revisión y exportación) · Responsable: Ana · Última actualización: 03/11/2026

**Estado:** **[Propuesta]** de Ana, aceptada por Mireia el 29/10/2026. Pendiente de la confirmación de Javier.

Etiquetas según la [guía de estilo](guia-estilo.md): **[Confirmado]** comprobado en una fuente o en el enunciado · **[Supuesto]** lo damos por bueno para avanzar sin haberlo comprobado · **[Propuesta]** decisión del equipo, se puede cambiar · **[Pendiente]** falta información.

## 1. Resumen

### 1.1. Qué hay en la web publicada (03/11/2026)

El enunciado dice que las funciones adicionales que se incluyan "tienen que funcionar". Por eso, para la entrega solo se presentan como incluidas las que están construidas y probadas en https://gestion-facturas-xi.vercel.app. El resto de este documento recoge la decisión del 29/10/2026 y queda como plan para después de la entrega.

| Función adicional | Estado en la entrega | Dónde se ve |
|---|---|---|
| Instalación en el móvil | **[Confirmado]** Construida (PR #80) y probada en iPhone con Safari el 03/11/2026 ([prueba de lectura](pruebas-lectura.md)): sale el icono de Ticketon y se abre como una app, sin la barra del navegador. En Android, **[Pendiente]** probarla | Desde el navegador del móvil: "Añadir a pantalla de inicio" (en iPhone, "Compartir" → "Añadir a pantalla de inicio") |
| Aviso de ticket sin NIF del receptor | **[Confirmado]** Construido (PR #55 y #72; #27 cerrada) | Revisar (P10) y Mis gastos (P07) |
| Aviso de trimestre a punto de cerrar | **[Confirmado]** Construido (PR #58 y #63; #27 cerrada) | Exportar (P13) |
| Cierre de trimestre (idea propia, planes de pago) | **[Pendiente]** Aplazado para después de la entrega (#50) | Sale como "Próximamente" en Exportar y en Precios |
| Compartir desde el móvil | **[Pendiente]** Aplazado para después de la entrega (#17) | No está activo. Para pasar un PDF del correo se usa el reenvío (#16), que es la vía obligatoria |
| Panel con cifras | **[Pendiente]** Aplazado para después de la entrega (#26) | Mis gastos ya enseña tres cifras: pendientes, posibles duplicados y total del trimestre |

Motivo del aplazamiento **[Propuesta]**, decidido por el equipo el 03/11/2026: se dio prioridad a que todo lo obligatorio funcionara y estuviera probado en la web publicada ([prueba de lectura](pruebas-lectura.md), #28). El cierre de trimestre es la función más grande (pantalla de tres pasos y paquete ZIP con los originales) y los planes de pago no están activos; compartir solo funciona en Android.

### 1.2. Decisión del 29/10/2026

| Decisión | Funciones |
|---|---|
| Incluir en todos los planes | Instalación en el móvil (con compartir desde el móvil en los navegadores que lo permiten) y avisos dentro de la web (ticket sin NIF del receptor y trimestre a punto de cerrar) |
| Idea propia, en los planes de pago | **Cierre de trimestre**: prepara la entrega a la gestoría |
| Si da tiempo | Panel con cifras |
| Descartar por ahora | Conexión con Gmail u Outlook, Drive o Dropbox, banco y programa de contabilidad; varias empresas; equipos; kilometraje; dietas |

## 2. Qué pide el enunciado **[Confirmado]**

- Elegir qué funciones adicionales se incluyen, cuáles se reservan para los planes caros y cuáles se descartan, y justificar la elección.
- "No hace falta incluirlas todas, pero las que se incluyan tienen que funcionar. Tres funciones bien hechas valen más que diez a medias."
- "Se valoran también las ideas que no están en la lista."

## 3. Criterios de decisión **[Propuesta]**

1. **Valor para el autónomo.** En la entrevista a una autónoma (29/10/2026), lo que más le cuesta es el tiempo: unas 6 horas cada trimestre, más el trabajo adicional de su gestoría **[Supuesto]**, porque es una sola entrevista. Además, trabaja en papel e imprime las facturas que recibe por correo.
2. **Diferenciación.** Según el [estudio de competencia](competencia.md), capturar tickets, leerlos con IA y detectar duplicados ya lo ofrecen otros productos, y Holded tiene las tres vías de subida. La oportunidad está en preparar la entrega a la gestoría con poco esfuerzo.
3. **Esfuerzo y riesgo** para un equipo de tres personas con la entrega cerca.
4. **Coste y normativa.** Sin depender de servicios de pago y sin dar consejo fiscal: qué gastos se deducen lo decide la gestoría.

## 4. Decisión por función

### Incluir en todos los planes

| Función | Qué incluye | Por qué |
|---|---|---|
| **Instalación en el móvil** | La web se añade a la pantalla de inicio como una aplicación. En Chrome para Android, además, aparece en el menú Compartir para enviar un PDF directamente. | Esfuerzo bajo y útil para quien usa poco la tecnología: un icono en el móvil facilita subir el ticket en el momento. Compartir funciona en Chrome para Android, Samsung Internet y Chrome de escritorio, pero no en Safari de iPhone ni en Firefox **[Confirmado]** según la tabla de compatibilidad de [caniuse](https://caniuse.com/mdn-manifests_webapp_share_target), citada en la [arquitectura](arquitectura.md). Por eso la vía obligatoria para pasar un PDF del correo es el reenvío por correo (#16). |
| **Avisos dentro de la web** | Ticket sin NIF del receptor y trimestre a punto de cerrar. | Usan datos que ya tenemos y ayudan a ver qué falta antes de entregar. El NIF del receptor es el que suele faltar en los tickets y el que necesita la gestoría; el mismo criterio usan los requisitos de diseño (PR #52) y el [modelo de datos](modelo-datos.md). Se muestran dentro de la web, no por correo, hasta que esté resuelto el envío de correos **[Propuesta]**. |

El aviso de factura duplicada no se cuenta como función adicional, porque ya es un requisito obligatorio (requisito 5, #22). El aviso de "cargo del banco sin justificante" queda fuera, porque necesita conexión con el banco.

### Idea propia: Cierre de trimestre (planes de pago)

Un botón, **"Prepara tu entrega a la gestoría"**, que reúne en un solo paso:

1. **Lista de pendientes** del trimestre: tickets sin NIF del receptor, datos por revisar y posibles duplicados.
2. **Resumen del trimestre**: total de gastos, IVA por tipo y gasto por categoría.
3. **Paquete descargable**: el Excel del periodo y los originales ordenados en un archivo ZIP.

**Por qué:**
- Ataca el problema principal de la entrevista, el tiempo que se dedica cada trimestre a reunirlo todo.
- Es la oportunidad que señala el estudio de competencia y no está en la lista del enunciado, que valora las ideas propias.
- Aprovecha lo que se construye igualmente: el Excel, los originales y el control de duplicados. El esfuerzo adicional es moderado.

**Límites:**
- La herramienta prepara la entrega; no decide qué gastos son deducibles ni presenta impuestos. El botón y los textos no prometen nada fiscal.
- La exportación a Excel por periodo, que es obligatoria (requisito 7, #23), sigue disponible en todos los planes, también en el gratis. Lo que es de pago es el cierre completo: pendientes, resumen y paquete con originales.

### Si da tiempo

| Función | Por qué |
|---|---|
| **Panel con cifras** | Es útil y queda bien en una presentación, pero no resuelve el problema principal. Se hará solo si están terminados lo obligatorio y las funciones incluidas. En qué plan iría queda **[Pendiente]**. |

### Descartar por ahora

| Función | Motivo |
|---|---|
| Conexión con Gmail u Outlook | Exige permisos de Google o Microsoft para leer el correo, con procesos de verificación largos. El reenvío por correo ya cubre la necesidad. Para el futuro. |
| Conexión con Google Drive o Dropbox | Los originales ya se guardan y el paquete del cierre de trimestre permite descargarlos ordenados. |
| Conexión con el banco | Requiere servicios regulados y de pago. |
| Conexión con el programa de contabilidad (Holded, A3, Sage) | Requiere integrarse con cada programa. El Excel cubre la entrega. Tendría sentido en un futuro plan para gestorías. |
| Varias empresas | Pensada para quien lleva varias sociedades; nuestro público es el autónomo. |
| Equipos | Pensada para empresas con empleados, descartadas en el [público objetivo](publico-objetivo.md). |
| Kilometraje | Útil solo para algunos autónomos. Para el futuro. |
| Dietas | Obliga a aplicar reglas fiscales, y la herramienta no decide sobre impuestos. |

### Hoja de ruta después de la entrega **[Propuesta]**

Ideas recogidas en la exposición del 04/11/2026 con el profesor, en el orden en que tendría sentido hacerlas:

| Paso | Qué | Esfuerzo | Qué hace falta |
|---|---|---|---|
| 1 | **Dirección de reenvío con dominio propio** (por ejemplo `facturas-xxxx@ticketon.es`). La recepción ya funciona: cada usuario tiene su dirección y, si añade el correo de un proveedor en «Correos autorizados», sus facturas entran solas en Ticketon. Solo cambia la dirección, que hoy termina en `resend.app` | Bajo | Comprar el dominio y configurarlo en Resend **[Pendiente]** |
| 2 | **Exportar en el formato que importa cada programa de contabilidad**, además del Excel, para que la gestoría lo cargue sin teclear | Medio, por programa | Saber qué programas usan las gestorías del público objetivo y su formato de importación **[Pendiente]** |
| 3 | **Conexión directa con uno o dos programas** (Holded, A3, Sage), dentro de un plan para gestorías | Alto | Cuenta de desarrollador y permisos de cada programa; decidir el plan y su precio **[Pendiente]** |

Mientras tanto, la conexión con el programa de contabilidad sigue en «Descartar por ahora» para el MVP.

## 5. Funciones por plan **[Propuesta]**

Planes y precios según el [modelo de negocio](modelo-negocio.md).

| Función | Gratis | Autónomo | Autónomo Plus |
|---|---|---|---|
| Documentos procesados al mes | 10 | 100 | 300 |
| Requisitos obligatorios (subida, lectura, corrección, duplicados, originales y Excel) | Sí | Sí | Sí |
| Instalación en el móvil | Sí | Sí | Sí |
| Avisos dentro de la web | Sí | Sí | Sí |
| Cierre de trimestre | No | Sí | Sí |
| Panel con cifras (si da tiempo) | [Pendiente] | [Pendiente] | [Pendiente] |

## 6. Qué cambia en otras tareas

| Tarea | Cambio |
|---|---|
| 08 · Modelo de negocio (#3) | Completar la tabla de funciones por plan con el apartado 5. |
| 25 · Compartir desde el móvil (#17) | Función adicional, incluida en la instalación en el móvil. No funciona en Safari de iPhone ni en Firefox. |
| 30 · Avisos (#27) | Solo ticket sin NIF del receptor y trimestre a punto de cerrar, dentro de la web. El de duplicados va en el #22. |
| 29 · Panel con cifras (#26) | Si da tiempo. |
| Nueva tarea | Crear el issue del cierre de trimestre, después del Excel (#23) y del control de duplicados (#22). |
| 26 · Página de precios (#24) | Mostrar el cierre de trimestre como la diferencia de los planes de pago. |

## 7. Registro de decisiones

| Fecha | Decisión | Quién |
|---|---|---|
| 29/10/2026 | Propuesta de funciones adicionales | Ana |
| 29/10/2026 | De acuerdo con el cierre de trimestre como idea propia y fuera del plan gratis, manteniendo el Excel en el gratis; panel para "si da tiempo"; reenvío por correo como vía obligatoria y compartir como extra; avisos dentro de la web | Mireia |
| [Pendiente] | Confirmación | Javier |
| 03/11/2026 | Para la entrega, solo se presentan como incluidas las funciones construidas y probadas (apartado 1.1). Cierre de trimestre (#50), compartir desde el móvil (#17) y panel (#26), aplazados para después de la entrega | Equipo |
| 04/11/2026 | Hoja de ruta tras la exposición: dominio propio para el reenvío, exportación para programas de contabilidad y conexión directa (apartado 4) | Equipo |

## 8. Fuentes

- Enunciado del proyecto: "Proyecto final: Plataforma para gestión de facturas", apartados "Requisitos obligatorios" y "Funciones adicionales".
- [Estudio de competencia](competencia.md), conclusión provisional.
- [Modelo de negocio](modelo-negocio.md), planes propuestos.
- [Arquitectura](arquitectura.md) y [caniuse, `share_target`](https://caniuse.com/mdn-manifests_webapp_share_target): compatibilidad de compartir desde el móvil.
- Entrevista a una socia de Arco Iris CB (comunidad de bienes, sector educación), 29/10/2026: [público objetivo](publico-objetivo.md), apartado 3.
