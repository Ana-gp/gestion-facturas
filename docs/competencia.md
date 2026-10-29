# Estudio de competencia

**Proyecto:** Ticketon, herramienta para autónomos que trabajan con una gestoría y quieren ordenar sus justificantes  
**Fecha de revisión:** 29 de octubre de 2026  
**Estado:** análisis documental inicial alineado con el público objetivo elegido en #2. La propuesta de valor y la disposición a pagar siguen pendientes de validación con usuarios reales.  
**Fuentes:** se priorizan páginas oficiales de producto, precios y ayuda. Las funcionalidades comerciales se describen como afirmaciones del proveedor; no equivalen a una prueba independiente del rendimiento real.

## 1. Objetivo y alcance

El objetivo es analizar cinco soluciones mencionadas en el planteamiento del proyecto —Captio (Emburse), Pleo, Spendesk, Holded y Quipu— para comprender:

- A qué tipo de cliente se dirigen y qué problema resuelven.
- Qué funcionalidades ofrecen relacionadas con la captura, lectura, revisión y gestión de gastos.
- Cómo estructuran sus precios y límites públicos.
- Qué aspectos están bien cubiertos por el mercado y dónde puede haber oportunidades para nuestro MVP.
- Qué hipótesis requieren validación antes de convertirlas en decisiones de producto o mensajes comerciales.

Este documento es un **estudio de escritorio**. No se han contratado demos ni probado todas las aplicaciones con una cuenta real. Por ello, cuando la documentación pública no permite confirmar una función, se indica como «no verificado» en vez de afirmar que el competidor no la tiene.

## 2. Cómo interpretar la comparación

Las cinco soluciones no son equivalentes:

- **Competidores más cercanos por amplitud de gestión para autónomos y pymes:** Holded y Quipu. Incluyen funciones de facturación, gestión financiera o fiscal además de los gastos.
- **Referentes de gestión de gastos y procesos empresariales:** Captio, Pleo y Spendesk. Destacan en la captura de justificantes, control de gastos, tarjetas, reembolsos, aprobaciones o políticas de empresa; su modelo y público pueden ser distintos de los de un autónomo que solo quiere organizar documentos para su gestoría.

Que una función aparezca en una web oficial significa que el proveedor la anuncia, no que hayamos medido su precisión, facilidad de uso o satisfacción del cliente. «No verificado» significa que no se encontró evidencia suficiente en las páginas consultadas; no significa que la función no exista.

## 3. Resumen comparativo

| Solución | Público y propuesta principal | Funciones relacionadas con nuestro producto | Precio público consultado | Tipo de competencia |
|---|---|---|---|---|
| **Emburse Captio** | Empresas que gestionan gastos de empleados y viajes, políticas de gasto y aprobaciones. | App móvil y web, lectura automatizada, extracción de gastos por email, informes, multidivisa, flujos de aprobación y descarga en PDF/CSV/Excel. | Planes por segmento con solicitud de demo o presupuesto; no hay una tarifa pública única comparable para un autónomo. | Referente de gestión de gastos empresarial; competidor indirecto por enfoque y escala. |
| **Pleo** | Empresas y equipos que controlan pagos, tarjetas, gastos y reembolsos. | Tarjetas, seguimiento de gastos, captura de recibos, OCR de facturas en España, integraciones contables y funciones de aprobación/revisión según plan. La ayuda documenta la edición de campos sugeridos por OCR. | Start: 8 €/usuario/mes con facturación mensual. Build: 14 €/usuario/mes y Optimise: 18 €/usuario/mes, con facturación anual y mínimo de 3 usuarios en esos planes. Comprobar condiciones vigentes antes de usar estos importes comercialmente. | Referente de control de gastos de equipos; competencia indirecta. |
| **Spendesk** | Empresas que centralizan pagos, compras, tarjetas, reembolsos y presupuestos. | OCR de recibos, recordatorios para recopilarlos, asociación de recibos a gastos, aprobaciones, informes e integraciones. La documentación de ayuda describe comprobaciones de duplicados. | Presupuesto personalizado. El proveedor explica una cuota fija de plataforma más un componente variable por transacciones. | Referente empresarial de gestión de gastos; competencia indirecta. |
| **Holded** | Autónomos, pymes y asesorías que buscan una plataforma amplia de gestión empresarial. | Escáner OCR con carga desde ordenador, email y app móvil/compartir desde otras apps; extracción de campos, revisión junto al original, estados, edición y conversión a documento de compra. Ofrece acceso a asesorías. | La página oficial muestra Plus a 15 €/mes y planes superiores; la oferta consultada incluye descuentos temporales del 50 % durante tres meses. Precios sin IVA; hay límites por plan para facturas y otros módulos. El escáner se anuncia como ilimitado. | Competidor directo por público y gestión de documentos, aunque su alcance es mucho más amplio. |
| **Quipu** | Autónomos, empresas y asesorías que gestionan facturación, gastos e impuestos. | Lector de facturas/tickets con validación humana, app móvil, detección de duplicados, exportación de datos y otras funciones de gestión administrativa. | La página consultada muestra precios ordinarios de 17 €/mes (Starter), 30 €/mes (Solution) y 59 €/mes (Premium), con 30, 250 y 350 lecturas mensuales respectivamente. La misma página muestra una promoción del 50 % durante los tres primeros meses (8,50 €, 15 € y 29,50 €). Verificar de nuevo antes de una decisión comercial. | Competidor directo especialmente relevante por público, lector documental y límites por lectura. |

### Fuentes oficiales principales

- Captio: [producto](https://www.emburse.com/es/productos/captio) · [precios y funcionalidades](https://www.emburse.com/es/productos/precios)
- Pleo: [precios y planes](https://www.pleo.io/es/pricing) · [OCR de recibos en España](https://pleohelp.freshdesk.com/en/support/solutions/articles/103000399820-automatic-receipt-type-detection-ocr-in-spain)
- Spendesk: [precios y funcionalidades](https://www.spendesk.com/es/pricing/) · [detección de duplicados](https://helpcenter.spendesk.com/en/articles/4670792-how-spendesk-prevents-duplicate-receipts-invoices-expense-claims) · [almacenamiento y digitalización](https://helpcenter.spendesk.com/es/articles/4168049-sellado-y-digitalizacion-de-documentos-recibos-electronicos)
- Holded: [precios](https://www.holded.com/es/precios) · [documentación del escáner](https://help.holded.com/es/articles/6908098-escaner-que-es-y-como-funciona) · [revisión de documentos](https://help.holded.com/es/articles/6908247-escaner-convertir-tus-gastos-en-documentos-de-compra) · [bandeja de entrada](https://help.holded.com/es/articles/6908905-escaner-utilizar-la-bandeja-de-entrada)
- Quipu: [precios](https://getquipu.com/es/plan-de-precios) · [digitalización, OCR y duplicados](https://getquipu.com/es/digitalizacion-facturas)

## 4. Análisis por solución

### 4.1. Emburse Captio

**Propuesta observada.** Digitalizar y controlar los gastos de empleados y viajes mediante una aplicación móvil/web, reglas, alertas, informes y procesos de aprobación.

**Capacidades relevantes.** Su web enumera captura ilimitada mediante app, lectura automatizada con revisión de calidad humana, extracción de gastos por email, multidivisa y descarga en PDF, CSV y Excel. La oferta también contempla flujos de aprobación y controles de integridad. La empresa presenta captura homologada por la AEAT; esa afirmación es del proveedor y no debe extrapolarse a cualquier proceso de digitalización ni interpretarse como asesoramiento fiscal.

**Precio y encaje.** La página presenta Professional (hasta 30 usuarios), Corporate (a partir de 30) y Enterprise con precio a medida, todos mediante demostración/contacto. No es correcto asignarle un precio estimado ni compararlo directamente con una tarifa mensual individual de software para autónomos.

**Puntos fuertes observables.** Flujos de gastos maduros, captura por varias vías, multidivisa, informes y controles para organizaciones.

**Limitaciones de la evidencia.** No se ha probado la plataforma ni se han verificado las condiciones exactas de todas las funciones, el coste total o la facilidad de uso para autónomos.

**Implicación para el proyecto.** Captio demuestra que la captura de justificantes, la lectura automatizada y la exportación no son diferenciales por sí solas. Puede servir como referencia funcional, pero el posicionamiento del MVP debería responder a un perfil de cliente más concreto si la investigación de usuarios lo confirma.

### 4.2. Pleo

**Propuesta observada.** Controlar los gastos de equipos con tarjetas, seguimiento, reembolsos y procesos de aprobación.

**Capacidades relevantes.** La página de precios describe tarjetas físicas y virtuales, seguimiento en tiempo real, notas de gasto automatizadas e integraciones contables. Los planes superiores añaden, entre otras funciones, reembolsos, kilometraje, aprobaciones y revisión de gastos con IA. Su ayuda sobre España explica que el OCR puede sugerir si un documento es ticket o factura y extraer campos que el usuario puede revisar y editar.

**Precio y condiciones.** La página consultada muestra Start a 8 €/usuario/mes con facturación mensual. Build (14 €) y Optimise (18 €) indican facturación anual y mínimo de tres usuarios. Debe comprobarse de nuevo la página antes de una decisión comercial, ya que las tarifas y condiciones cambian.

**Puntos fuertes observables.** Control del gasto en equipos, tarjetas, automatización, integraciones y escalado de funciones por plan.

**Limitaciones de la evidencia.** No hemos realizado una prueba de producto ni confirmado que todas las funciones relevantes estén disponibles en las mismas condiciones para todos los mercados y planes.

**Implicación para el proyecto.** Pleo sirve para estudiar cómo agrupar funciones por planes, pero su propuesta gira en torno al gasto corporativo y las tarjetas. No deberíamos copiar ese enfoque si el MVP se centra en organizar documentos para la gestoría.

### 4.3. Spendesk

**Propuesta observada.** Centralizar el gasto de empresa, pagos, compras, presupuestos, tarjetas y reembolsos.

**Capacidades relevantes.** La web anuncia OCR de recibos, recordatorios para recopilar justificantes, asociación de recibos a gastos, informes e integraciones. La ayuda explica detección de duplicados tanto por checksum del archivo como por combinación de campos de la solicitud. La documentación sobre digitalización describe almacenamiento con sellado temporal y condiciones específicas para la digitalización en España.

**Precio y condiciones.** Spendesk solicita presupuesto. La web describe dos componentes: cuota fija por acceso a la plataforma y costes variables según las transacciones. Por ello, no se debe inventar un precio por usuario ni compararlo como si fuera una suscripción plana.

**Puntos fuertes observables.** Control de gastos, detección de duplicados, procesos empresariales e integración con otros sistemas.

**Limitaciones de la evidencia.** No se ha probado el producto, no se dispone de un presupuesto y no se ha medido su conveniencia para un autónomo con pocos documentos.

**Implicación para el proyecto.** La detección de duplicados y la asociación de justificantes con gastos tampoco son ideas inéditas. El proyecto deberá centrarse en el conjunto del flujo y en la experiencia para su público, no en presentar una función aislada como exclusiva.

### 4.4. Holded

**Propuesta observada.** Plataforma amplia para autónomos, pymes y asesorías que combina facturación, gastos, bancos y contabilidad.

**Capacidades relevantes.** Su documentación oficial describe tres vías de entrada al escáner: subir archivos o arrastrarlos desde el ordenador, reenviar adjuntos a una bandeja de entrada por email y hacer una foto desde la aplicación móvil o compartir PDF/imágenes desde otras apps. El OCR extrae datos y los presenta para revisión; el visor permite ver el original a la izquierda y los datos a la derecha, corregir campos y crear el documento contable. El sistema distingue estados como Procesando, Revisar, Hecho y Error. La empresa anuncia escáner ilimitado en sus planes actuales consultados.

**Precio y condiciones.** La página de precios consultada muestra Plus a 15 €/mes y otros planes de mayor precio, junto con una promoción temporal del 50 % durante tres meses. Los precios se muestran sin IVA. La oferta y los límites de facturas, usuarios y otros módulos dependen del plan. El precio promocional no debe confundirse con la tarifa ordinaria.

**Puntos fuertes observables.** Es la referencia más clara para comparar el recorrido de captura completo: móvil, correo, carga web, OCR, revisión junto al original y conversión a documento. También ofrece colaboración con asesorías.

**Limitaciones de la evidencia.** No se ha probado el recorrido con los cuatro documentos del proyecto, ni medido la tasa de acierto, la cantidad de correcciones o el tiempo necesario para completar la tarea. Que el producto tenga muchas funciones no demuestra que sea difícil de usar.

**Implicación para el proyecto.** No podemos diferenciar el producto simplemente ofreciendo los tres métodos de captura, OCR, campos editables o acceso a la gestoría: Holded ya documenta esos flujos. La posible oportunidad debe probarse comparando el esfuerzo real para completar una tarea concreta, el foco de la interfaz y las necesidades de un segmento específico.

### 4.5. Quipu

**Propuesta observada.** Automatizar facturación y gestión administrativa para autónomos, empresas y asesorías, con funciones de gastos e impuestos.

**Capacidades relevantes.** La página oficial describe un lector de facturas y tickets con validación humana, aplicación móvil y detección de duplicados. La tabla de precios muestra límites mensuales de 30 escaneos en Starter, 250 en Solution y 350 en Premium; también permite comprar paquetes adicionales de 50 lecturas por 10 € según las condiciones publicadas. Ofrece exportación de información en Excel y otras funciones de gestión.

**Precio y condiciones.** La página consultada muestra 8,50 €/mes, 15 €/mes y 29,50 €/mes para los tres planes en la modalidad mensual mostrada. También ofrece descuentos temporales y tarifas anuales diferentes. Deben comprobarse de nuevo antes de fijar precios propios.

**Puntos fuertes observables.** Público próximo al proyecto, lectura documental, validación humana y límites de consumo visibles que conectan el coste de escaneo con el plan contratado.

**Limitaciones de la evidencia.** No se ha probado la calidad del lector en documentos similares a los cuatro tickets de nuestro repositorio ni se ha comprobado cuánto tiempo ahorra a un usuario en un caso real.

**Implicación para el proyecto.** Quipu es uno de los referentes prioritarios. Para destacar no basta con ofrecer OCR: deberíamos comparar precisión en los documentos de prueba, facilidad de corregir datos, gestión de pendientes y calidad del archivo exportado, sin asumir de antemano que seremos mejores.

## 5. Comparación de capacidades relacionadas con el MVP

La siguiente tabla recoge únicamente lo respaldado por la documentación pública consultada. «No verificado» no equivale a «no disponible».

| Capacidad | Captio | Pleo | Spendesk | Holded | Quipu |
|---|---|---|---|---|---|
| Captura desde aplicación móvil | Sí, documentada | Sí, documentada | Sí, documentada | Sí, documentada | Sí, documentada |
| Carga web de documentos | Sí, plataforma web y adjuntos; detalles de formatos no contrastados aquí | Sí, adjuntar foto/archivo al gasto | Sí, escritorio y subida de archivos | Sí, subir/arrastrar archivos | Sí, admite documentos en el lector |
| Incorporación por email | Sí, extracción de gastos vía email | Hay captura de recibos por email en documentación del proveedor; comprobar condiciones/plan | Sí, recordatorios y flujos de recibos; método exacto de entrada debe verificarse en ayuda | Sí, bandeja de entrada dedicada | No verificado en las fuentes revisadas |
| OCR/lectura automatizada | Sí | Sí | Sí | Sí | Sí |
| Corrección humana o del usuario | Se anuncia revisión de calidad humana | Campos OCR editables por el usuario | El usuario puede modificar datos de la solicitud; flujo exacto de revisión de OCR no probado | Sí, visor original + datos editables | Se anuncia validación humana; interfaz exacta no probada |
| Detección de duplicados | No verificado en las fuentes revisadas | Confirmada en algunos planes/documentación; verificar alcance por plan | Sí, documentada en ayuda | No verificado para duplicados de justificantes en las fuentes revisadas | Sí, anunciada por el proveedor |
| Original asociado al gasto | Adjuntar imágenes y descargar documentos; conservación exacta no evaluada | Adjuntar recibos a gastos; detalles de conservación no evaluados | Almacenamiento de recibos documentado | Original visible durante la revisión e historial del escáner | El lector procesa tickets/facturas; detalles completos de conservación no probados aquí |
| Exportación | PDF, CSV y Excel documentados | Exportaciones contables e integraciones; formato exacto depende de configuración | Informes e integraciones; Excel específico no confirmado aquí | Exportaciones de datos disponibles; validar formato exacto de gastos | Exportación Excel documentada |
| Flujos de aprobación empresariales | Sí | En planes superiores | Sí | Funcionalidades de gestión/roles según plan; no equiparable a flujos especializados sin prueba | No verificado para el mismo flujo empresarial |

### Qué demuestra esta matriz y qué no

La matriz muestra que muchas funciones obligatorias del proyecto ya existen en soluciones comerciales. Eso no invalida el proyecto académico, pero sí descarta presentar esas funciones por separado como una innovación comercial exclusiva.

No demuestra cuál es la solución más rápida, precisa, barata o sencilla. Para afirmarlo, se necesitaría una prueba práctica equivalente con los mismos documentos, una tarea definida y métricas comunes.

## 6. Comparación de precios: cómo leerla correctamente

Los precios siguientes son una referencia de las páginas oficiales consultadas, no una comparación de coste total equivalente.

| Solución | Precio público consultado | Modelo y cautelas |
|---|---|---|
| Captio | No se publica una tarifa única comparable; se solicita demo/presupuesto. | Oferta segmentada por tamaño y funcionalidades empresariales. |
| Pleo | Start: 8 €/usuario/mes; Build: 14 €/usuario/mes; Optimise: 18 €/usuario/mes. | Start muestra facturación mensual; Build y Optimise, anual y mínimo de tres usuarios. Confirmar condiciones antes de comparar. |
| Spendesk | Presupuesto personalizado. | Cuota fija de plataforma más coste variable por transacciones. |
| Holded | Plus desde 15 €/mes; planes superiores desde 29 €/mes en la página consultada. | Precios sin IVA, promociones temporales y límites de uso/usuarios según plan; escáner anunciado como ilimitado. |
| Quipu | Starter 8,50 €/mes; Solution 15 €/mes; Premium 29,50 €/mes. | Límites de 30/250/350 escaneos al mes y paquetes adicionales de lecturas; descuentos temporales y precios anuales diferentes. |

**Conclusión de precios:** no hay base suficiente para concluir que el mercado sea «demasiado caro» ni que debamos competir por ser el más barato. Primero hay que estimar el coste de IA, almacenamiento, soporte y operación, y definir el volumen de documentos del público objetivo. Después podremos comparar el precio por usuario y por documento procesado con un escenario realista.

## 7. Posibles oportunidades para nuestro producto

Las oportunidades de esta sección son **hipótesis de producto**, no ventajas demostradas frente a los competidores.

### 7.1. Centrar la experiencia en una tarea concreta

Hipótesis: algunos autónomos que trabajan con gestoría no necesitan una plataforma integral de contabilidad para resolver la tarea de recopilar, revisar y entregar justificantes.

**Cómo validarla:** entrevistar a usuarios del perfil de la issue #2 y pedirles que expliquen cómo preparan hoy la documentación del mes o trimestre, qué herramientas utilizan, qué pasos repiten y qué problemas les ocurren realmente.

### 7.2. Optimizar el flujo completo, no una función aislada

Hipótesis: puede aportar valor una experiencia que lleve al usuario desde el justificante recibido hasta una exportación clara, mostrando qué está pendiente y qué debe revisar.

**Cómo validarla:** comparar el número de pasos, errores y tiempo de una tarea equivalente en herramientas existentes y en nuestro prototipo. No afirmar que el flujo será más simple hasta medirlo.

### 7.3. Hacer visibles los errores y la incertidumbre del OCR

Hipótesis: puede ser útil diferenciar los datos extraídos automáticamente de los confirmados por el usuario, destacar campos ausentes y facilitar la corrección junto al documento original.

**Cómo validarla:** usar los cuatro documentos de prueba del repositorio —ticket arrugado, ticket con varios tipos de IVA, factura en inglés y foto con poca luz— y registrar campos correctos, errores, correcciones y fallos por documento. No basta con evaluar el OCR por una impresión general ni con un único porcentaje agregado.

### 7.4. Preparar un paquete claro para la gestoría

Hipótesis: una exportación organizada por periodo, con datos y originales asociados y un resumen de documentos pendientes, puede ser útil para el usuario y su gestoría.

**Cómo validarla:** pedir a una gestoría o a un autónomo que trabaje con ella que revise una exportación de ejemplo y confirme qué campos, columnas, nombres de archivos y separación de IVA necesita. No presentar el resultado como declaración tributaria oficial ni garantizar deducibilidad fiscal.

### 7.5. Precio sencillo, sostenible y vinculado al uso

Hipótesis: un plan sencillo con un límite claro de documentos podría ser más comprensible para ciertos autónomos que un producto integral o un modelo empresarial de costes personalizados.

**Cómo validarla:** cerrar el coste real por documento y por usuario, estimar el volumen mensual del perfil elegido y calcular escenarios conservadores, medios y altos. No fijar el precio final antes de completar las issues de costes de IA (#6) y funcionalidades/planes (#7).

## 8. Qué no debemos afirmar en la web comercial

Hasta disponer de evidencia, no deberíamos utilizar mensajes como:

- «El OCR más preciso» o «cero errores».
- «Más fácil que Holded/Quipu/Pleo».
- «La opción más barata del mercado».
- «Nuestros competidores no permiten enviar tickets por email».
- «Garantizamos que todos los gastos son deducibles».
- «Sustituye a tu gestoría» o «presenta tus impuestos automáticamente», si el producto no hace realmente esas tareas y no se han verificado los requisitos legales.

Sí podemos comunicar de forma factual las funciones que el producto implemente y pruebe, por ejemplo: «revisa los datos extraídos antes de exportar» o «consulta qué documentos siguen pendientes», siempre que la versión final lo permita.

## 9. Limitaciones del estudio y próximos pasos

Este análisis no incluye pruebas con cuentas reales, mediciones independientes de OCR, entrevistas de clientes, presupuestos personalizados de Captio/Spendesk ni evaluación completa de todas las condiciones de cada plan. Las páginas comerciales cambian con frecuencia, por lo que los precios deben volver a verificarse antes de decidir la tarifa propia o presentar cifras en una demo.

Antes de cerrar la issue #1:

1. **Alinear con la issue #2** el público objetivo y la propuesta de valor que el equipo elija; evitar cerrar un posicionamiento que contradiga esa decisión.
2. **Validar con al menos algunos usuarios del perfil definido** el flujo actual de trabajo y sus problemas reales. Registrar respuestas y distinguir observaciones de interpretaciones.
3. **Comprobar los competidores prioritarios de forma práctica**, empezando por Holded y Quipu: realizar las tareas que sea posible probar con demo o prueba gratuita, registrar límites, pasos y resultados. Si no se puede probar una función, mantenerla como «no verificada».
4. **Definir una prueba reproducible de nuestro MVP** con los cuatro tickets del repositorio y comparar precisión por campo, tiempo de corrección y calidad de exportación.
5. **Revisar precios y costes** cuando estén disponibles los datos de las issues #6 y #7.
6. **Convertir los hallazgos validados en una propuesta de valor concreta**, con un público definido, un problema demostrado y una promesa que el producto pueda cumplir.

## 10. Conclusión provisional

El análisis de las páginas oficiales indica que el mercado ya ofrece captura móvil, carga de documentos, OCR, revisión humana o manual, detección de duplicados, exportaciones y conexión con procesos contables en distintas combinaciones. Por tanto, esas capacidades forman parte del mínimo competitivo del producto y no deben presentarse automáticamente como diferenciales.

La oportunidad [Supuesto] que merece validarse es **ofrecer a autónomos que trabajan con una gestoría un flujo acotado para reunir justificantes, revisar los datos y preparar una exportación**, sin obligarles a sustituir su herramienta contable ni su gestoría. Esto no es todavía una ventaja competitiva demostrada: Holded y Quipu ya cubren parte importante de la captura, el OCR y la gestión documental, y Holded documenta varias vías de entrada y revisión junto al original.

Por tanto, Ticketon no debe diferenciarse por afirmar que esas funciones son exclusivas. La hipótesis de posicionamiento es la sencillez del flujo centrado en la entrega a la gestoría y una oferta individual comprensible; habrá que comprobarlo mediante pruebas comparables y entrevistas. No afirmamos que Ticketon sea más rápido, más fácil o más barato hasta tener evidencia.
