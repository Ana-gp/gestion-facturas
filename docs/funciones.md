# 04 · Funciones adicionales

Tarea: #7 (orden 04) · Bloque 3 (revisión y exportación) · Responsable: Ana · Última actualización: 29/10/2026

**Estado:** **[Propuesta]** de Ana, aceptada por Mireia el 29/10/2026. Pendiente de la confirmación de Javier.

Etiquetas según la [guía de estilo](guia-estilo.md): **[Confirmado]** comprobado en una fuente o en el enunciado · **[Supuesto]** lo damos por bueno para avanzar sin haberlo comprobado · **[Propuesta]** decisión del equipo, se puede cambiar · **[Pendiente]** falta información.

## 1. Resumen

| Decisión | Funciones |
|---|---|
| Incluir en todos los planes | Instalación en el móvil (con compartir desde el móvil en Android) y avisos dentro de la web (ticket sin NIF y trimestre a punto de cerrar) |
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
| **Instalación en el móvil** | La web se añade a la pantalla de inicio como una aplicación. En Android, además, aparece en el menú Compartir para enviar un PDF directamente. | Esfuerzo bajo y útil para quien usa poco la tecnología: un icono en el móvil facilita subir el ticket en el momento. Compartir solo funciona en Android **[Confirmado]** según la [arquitectura](arquitectura.md); por eso la vía obligatoria para pasar un PDF del correo es el reenvío por correo (#16). |
| **Avisos dentro de la web** | Ticket sin NIF del emisor y trimestre a punto de cerrar. | Usan datos que ya tenemos y ayudan a ver qué falta antes de entregar. Se muestran dentro de la web, no por correo, hasta que esté resuelto el envío de correos **[Propuesta]**. |

El aviso de factura duplicada no se cuenta como función adicional, porque ya es un requisito obligatorio (requisito 5, #22). El aviso de "cargo del banco sin justificante" queda fuera, porque necesita conexión con el banco.

### Idea propia: Cierre de trimestre (planes de pago)

Un botón, **"Prepara tu entrega a la gestoría"**, que reúne en un solo paso:

1. **Lista de pendientes** del trimestre: tickets sin NIF, datos por revisar y posibles duplicados.
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
| Kilometraje | Útil solo para algunos autónomos y requiere un servicio de mapas de pago. Para el futuro. |
| Dietas | Obliga a aplicar reglas fiscales, y la herramienta no decide sobre impuestos. |

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
| 25 · Compartir desde el móvil (#17) | Función adicional, incluida en la instalación en el móvil. Solo Android. |
| 30 · Avisos (#27) | Solo ticket sin NIF y trimestre a punto de cerrar, dentro de la web. El de duplicados va en el #22. |
| 29 · Panel con cifras (#26) | Si da tiempo. |
| Nueva tarea | Crear el issue del cierre de trimestre, después del Excel (#23) y del control de duplicados (#22). |
| 26 · Página de precios (#24) | Mostrar el cierre de trimestre como la diferencia de los planes de pago. |

## 7. Registro de decisiones

| Fecha | Decisión | Quién |
|---|---|---|
| 29/10/2026 | Propuesta de funciones adicionales | Ana |
| 29/10/2026 | De acuerdo con el cierre de trimestre como idea propia y fuera del plan gratis, manteniendo el Excel en el gratis; panel para "si da tiempo"; reenvío por correo como vía obligatoria y compartir como extra; avisos dentro de la web | Mireia |
| [Pendiente] | Confirmación | Javier |

## 8. Fuentes

- Enunciado del proyecto: "Proyecto final: Plataforma para gestión de facturas", apartados "Requisitos obligatorios" y "Funciones adicionales".
- [Estudio de competencia](competencia.md), conclusión provisional.
- [Modelo de negocio](modelo-negocio.md), planes propuestos.
- [Arquitectura](arquitectura.md), compatibilidad de compartir desde el móvil.
- Entrevista a una autónoma con gestoría, 29/10/2026. Se añadirá a [público objetivo](publico-objetivo.md).
