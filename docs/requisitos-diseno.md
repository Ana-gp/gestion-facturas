# 11 · Requisitos de diseño de Ticketon

Tarea: #9 (orden 11) · Bloque 1 (cuenta y negocio) · Responsable: Javier · Última actualización: 29/10/2026

**Estado:** **[Propuesta]** base de diseño para revisión del equipo. Debe contrastarse con el mapa de pantallas y flujos de #8 antes de cerrar los requisitos y comenzar el prototipo de #11.

Leyenda: **[Confirmado]** requisito respaldado por el enunciado o documentos del proyecto · **[Supuesto]** hipótesis pendiente de comprobar · **[Propuesta]** decisión revisable · **[Pendiente]** falta decisión o validación.

## 1. Objetivo y principios

Ticketon ayuda a autónomos que trabajan con una gestoría a guardar y ordenar justificantes, revisar los datos extraídos y preparar la documentación para su gestoría. La tarea principal debe poder hacerse desde el móvil en pocos pasos: fotografiar o subir un justificante, comprobar los datos, corregir lo necesario y guardarlo junto con el original.

Principios de diseño:
1. **Móvil primero [Propuesta].** La captura con cámara es una acción principal; el flujo debe funcionar también en escritorio.
2. **Una acción principal por pantalla [Propuesta].** Evitar menús y llamadas a la acción que compitan entre sí.
3. **Lenguaje cotidiano [Propuesta].** Usar “Subir justificante”, “Revisar datos” y “Exportar para la gestoría”.
4. **La IA no decide por la persona [Confirmado].** Presentar los datos extraídos como una propuesta editable.
5. **Conservar y recuperar el original [Confirmado].** Mostrar qué archivo se ha guardado y permitir abrirlo o descargarlo.
6. **Errores recuperables [Propuesta].** Si la lectura falla, conservar el archivo y ofrecer reintentar o introducir los datos manualmente.
7. **Privacidad visible [Propuesta].** No mostrar documentos ni importes de otra cuenta ni incluir datos fiscales en avisos o URL.
8. **Accesibilidad básica [Propuesta].** Contraste legible, foco visible, etiquetas persistentes, navegación por teclado y mensajes que no dependan solo del color.

Ticketon organiza documentos; no determina si un gasto es deducible ni sustituye a la gestoría.

## 2. Identidad visual

### 2.1. Paleta [Propuesta]

| Uso | Color | Aplicación |
|---|---|---|
| Fondo general | #F7F8FA | Fondo de la aplicación |
| Superficie | #FFFFFF | Tarjetas, formularios y tablas |
| Texto principal | #17202A | Títulos y datos |
| Texto secundario | #52606D | Ayuda, etiquetas y metadatos |
| Color principal | #2457A7 | Botón principal, enlaces y foco |
| Color principal oscuro | #19447F | Estado activo/hover |
| Bordes | #D8DEE6 | Campos, separadores y tarjetas |
| Éxito | #18794E | Siempre acompañado de texto |
| Aviso | #8A5200 | Datos dudosos, duplicados o pendientes |
| Error | #B42318 | Errores que requieren actuación |

No usar el color como único indicador. Comprobar contraste y foco con el prototipo antes de cerrar la paleta.

### 2.2. Tipografía y composición [Propuesta]

- Tipografía: Inter, con una sans-serif del sistema como alternativa.
- Texto de formularios: 16 px; ayudas y metadatos no deben bajar de 14 px.
- Jerarquía clara de títulos, campos alineados y espaciado basado en múltiplos de 8 px.
- Bordes discretos, radios moderados y sombras mínimas; evitar decoración innecesaria.
- Diseño adaptable desde 320 px. En escritorio, limitar el ancho del contenido y permitir revisar documento y datos en paralelo.

### 2.3. Componentes compartidos [Propuesta]

- Barra superior con Ticketon y navegación mínima: Documentos, Subir justificante y Cuenta.
- Botón principal sólido; acciones secundarias neutras o como enlaces.
- Campos con etiqueta visible, ayuda cuando sea necesaria y error debajo del campo.
- Estados con texto: Pendiente, Revisada, Confirmada, Error y Posible duplicado.
- Avisos con título y explicación; nunca depender solo del color o de un icono.
- Listado adaptable: en móvil, tarjetas o filas resumidas; evitar tablas que requieran desplazamiento horizontal.
- Estados de carga, vacío, error y éxito para acciones asíncronas.
- Confirmación para acciones irreversibles. No sobrescribir el original por accidente.

## 3. Navegación propuesta

La navegación autenticada tendrá:
- **Documentos:** listado y búsqueda de justificantes.
- **Subir justificante:** cámara, selector de archivo o arrastrar y soltar.
- **Cuenta:** datos básicos, recuperación de contraseña y cierre de sesión.
- **Precios:** accesible desde el límite del plan y la web pública.

La landing y las páginas legales son públicas. El MVP no incluye acceso de gestorías a varios clientes, equipos ni espacios multiempresa.

## 4. Requisitos por pantalla

### 4.1. Landing pública

**Objetivo:** explicar rápidamente para quién es Ticketon y permitir crear cuenta o iniciar sesión.

Debe mostrar la propuesta de valor, tres pasos sencillos (subir, revisar, exportar), el alcance real del producto, acciones “Crear cuenta” e “Iniciar sesión” y enlaces legales. No afirmar que Ticketon certifica documentos o decide deducibilidad. En móvil, el mensaje y la acción principal deben verse pronto; evitar una página de marketing larga.

### 4.2. Registro e inicio de sesión

- Registro con correo y contraseña.
- Inicio de sesión con mensajes claros ante credenciales incorrectas.
- Enlace “He olvidado mi contraseña”.
- Estados de envío, error y éxito.
- Mensajes de recuperación neutrales que no revelen si una dirección está registrada.
- No mostrar documentos antes de comprobar la sesión. La autorización también debe aplicarse en servidor y base de datos.

### 4.3. Recuperación de contraseña

Permitir solicitar un enlace, mostrar confirmación neutral y ofrecer volver al inicio de sesión. Contemplar enlace caducado o inválido sin revelar si la cuenta existe.

### 4.4. Panel inicial

Debe ofrecer una acción principal “Subir justificante”, resumen sencillo de documentos pendientes y guardados, últimos documentos con fecha/emisor/total/estado cuando estén disponibles, y aviso del límite mensual solo cuando sea relevante. Si no hay documentos, mostrar un estado vacío con explicación breve y una acción para subir el primero. No priorizar gráficos que no ayuden a la tarea principal.

### 4.5. Subir justificante

Debe admitir, según el dispositivo:
- Hacer una foto con la cámara del móvil.
- Elegir un PDF o imagen del dispositivo.
- Arrastrar y soltar o seleccionar archivos en escritorio.
- La recepción por correo se concretará con el mapa de #8 y la implementación real.

Mostrar formatos admitidos y límite de tamaño cuando estén definidos, progreso y errores recuperables. No afirmar que el archivo está guardado hasta que lo confirme el servidor. Si existe una posible duplicidad, avisar sin bloquear automáticamente. Si falla el OCR, conservar el original.

### 4.6. Revisar y corregir datos — pantalla prioritaria

**Objetivo:** comprobar los datos propuestos por la IA antes de confirmar el justificante.

**Escritorio:** original visible junto al formulario; permitir ampliarlo y mantener accesible la acción de guardar/confirmar.

**Móvil:** organizar el contenido en una columna; permitir alternar entre consultar el original y editar datos sin perder cambios. No reducir original y formulario a dos columnas estrechas.

Campos revisables:
- Tipo de documento: factura o ticket.
- Fecha.
- Nombre y NIF del emisor.
- NIF del destinatario, opcional si no aparece.
- Número de factura/ticket, si existe.
- Categoría de gasto.
- Una o varias líneas de IVA con tipo, base y cuota.
- Retención de IRPF cuando exista.
- Total y moneda original; cuando corresponda, conversión a euros, tipo de cambio y fecha aplicada.

Reglas de interacción:
- Marcar campos vacíos o de baja confianza con un texto como “Revisar”, no solo con color.
- Distinguir datos extraídos de datos corregidos o confirmados.
- Permitir añadir, editar y eliminar líneas de IVA.
- Avisar si bases, cuotas, retención y total no cuadran; nunca modificar importes silenciosamente.
- Si falta el tipo de cambio, mostrar “Conversión pendiente”; no inventar un importe en euros ni permitir confirmar como revisada una factura que requiera conversión.
- Si el ticket no incluye NIF del destinatario, permitir guardarlo y mostrar un aviso neutral. Ticketon no decide si el IVA es deducible.
- Si hay un posible duplicado, enlazar al documento coincidente y permitir continuar si no es duplicado.
- Diferenciar “Guardar cambios” y “Confirmar revisión”. Confirmar debe respetar las validaciones reales del backend.
- Si falla el OCR, conservar el original y permitir introducir datos manualmente o reintentar.
- Advertir de cambios sin guardar antes de abandonar la pantalla.

**[Pendiente]** Los campos mínimos para confirmar una revisión deben coincidir con las validaciones del backend; el diseño no debe inventar reglas fiscales.

### 4.7. Listado de documentos

Mostrar fecha, emisor, número cuando exista, total, moneda, categoría y estado. Destacar revisión pendiente, error o posible duplicado. Incluir acceso a la revisión y al original; búsqueda y filtros por periodo, estado y categoría si están disponibles. Definir estados vacío, carga y error.

En móvil, usar tarjetas o filas compactas que destaquen fecha, emisor, total y estado. No depender de un NIF o número que puede faltar en un ticket.

### 4.8. Detalle del documento y original

Permitir consultar los datos, abrir/descargar el original, editar si procede y ver el estado de revisión. Los enlaces al archivo deben respetar permisos y no ser públicos permanentes. Mostrar avisos de ticket sin NIF, conversión pendiente y posible duplicado cuando correspondan.

### 4.9. Exportar para la gestoría

Permitir elegir un periodo y, si está disponible, filtrar por estado/categoría. Mostrar resumen del periodo y acción “Exportar Excel”. La exportación debe contemplar una fila por cada tipo de IVA de cada factura, los importes para gestoría, moneda original, conversión aplicada cuando proceda, avisos pertinentes y referencia al original según la decisión de #23.

Antes de exportar, avisar si hay documentos con errores, pendientes o conversiones pendientes. Explicar qué se incluye y qué queda fuera; no bloquear silenciosamente. Tras exportar, mostrar confirmación.

**[Pendiente]** El formato definitivo y cómo entregar/enlazar originales se decidirán en #23. No prometer enlaces permanentes antes de esa decisión.

### 4.10. Precios y límite del plan

Los precios deben mostrarse como provisionales hasta su aprobación. No simular una contratación o un pago que no exista.

Al alcanzar el límite, explicar que no pueden iniciarse nuevas lecturas automáticas hasta el siguiente periodo o cambio de plan. Los documentos ya guardados, la corrección manual y la exportación básica deben seguir accesibles. Nunca sugerir que los documentos se han perdido ni bloquear al usuario en la pantalla. Los importes de negocio actuales no son tarifas definitivas.

### 4.11. Cuenta y páginas legales

Cuenta: mostrar correo, nombre/NIF si están disponibles, recuperación de contraseña y cierre de sesión. No permitir alterar el plan o los contadores desde la interfaz.

Páginas legales: incluir enlaces al aviso legal y privacidad; revisar los textos antes de pruebas con personas externas. El documento de análisis normativo no debe presentarse como garantía de cumplimiento.

## 5. Estados y mensajes comunes

Cada pantalla debe contemplar carga, vacío, éxito y error. Ejemplos:
- Subida: “Subiendo archivo…” / “Original guardado” / “No se ha podido subir. Inténtalo de nuevo”.
- Lectura: “Leyendo el documento…” / “No hemos podido leerlo. El original sigue guardado”.
- Revisión: “Hay datos que conviene comprobar” / “Cambios guardados” / “Revisión confirmada”.
- Duplicados: “Este documento podría estar repetido”, con acceso a la coincidencia y opción de continuar.
- Exportación: “Preparando Excel…” / “Exportación preparada” / explicación si falla.
- Sin conexión: indicar que no se ha confirmado el guardado; no descartar cambios sin avisar.

No culpar al usuario ni mostrar éxito antes de que el servidor confirme la acción.

## 6. Accesibilidad y adaptación

- Comprobar contraste de texto y controles; foco visible y navegación con teclado.
- Etiquetas persistentes en los campos; el texto de ejemplo no sustituye a la etiqueta.
- Errores junto al campo y resumen si hay varios.
- Botones con nombres descriptivos.
- No depender solo del rojo/verde.
- Controles táctiles cómodos y acciones destructivas separadas de las principales.
- Probar al menos una anchura móvil y una de escritorio.

## 7. Alcance y prioridades del prototipo (#11)

**Imprescindible:**
1. Subida de justificante.
2. Revisión con original visible y campos editables.
3. Guardado/confirmación y estados de error.
4. Listado de documentos con estados.
5. Exportación por periodo.
6. Panel inicial sencillo.
7. Registro, inicio de sesión y recuperación.
8. Página de precios sencilla y páginas legales enlazadas.

**Puede representarse de forma sencilla:** recepción por correo mientras se concreta la configuración; límite mensual; posible duplicado; conversión de moneda y varios tipos de IVA con datos de ejemplo identificados.

**Fuera del MVP:** acceso de gestorías a varios clientes, equipos, contabilidad completa, emisión de facturas, presentación de impuestos, pagos reales no implementados, gráficos avanzados y personalización extensa.

## 8. Criterios de aceptación

- [ ] El flujo móvil foto → datos → corregir → guardar se entiende sin explicación externa.
- [ ] Las vistas clave están diseñadas para móvil y escritorio.
- [ ] La revisión muestra el original junto a los datos en escritorio y permite consultarlo fácilmente en móvil.
- [ ] Se distinguen campos dudosos, vacíos, errores, confirmación y posibles duplicados.
- [ ] La persona puede recuperar el original y entender qué se exportará.
- [ ] Listado y exportación incluyen estados vacío, carga y error.
- [ ] Los textos no prometen deducibilidad, digitalización certificada ni funciones no implementadas.
- [ ] Paleta, tipografía, componentes y accesibilidad están documentados.
- [ ] El equipo compara este documento con el mapa de #8 y resuelve contradicciones antes de cerrar #9.

## 9. Dependencias y decisiones pendientes

- **#8 · Mapa de pantallas y flujos:** Mireia debe confirmar el recorrido y las pantallas. Este documento es una base de requisitos y no sustituye ese entregable.
- **#11 · Prototipo navegable:** el equipo debe construir y revisar las vistas prioritarias antes de programar.
- **#19 · Corrección y lectura IA:** confirmar campos y reglas de validación que soportará el backend.
- **#20 · Moneda:** confirmar el criterio de conversión antes de presentarlo como decisión definitiva.
- **#23 · Excel:** decidir columnas y entrega de originales.
- **#26–29 · Web pública y cuenta:** comprobar el alcance real de precios, límites, landing y panel.
- **Accesibilidad:** verificar contrastes y tamaños con el prototipo.

