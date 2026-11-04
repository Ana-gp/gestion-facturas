# 11 · Requisitos de diseño de Ticketon

Tarea: #9 (orden 11) · Bloque 1 (cuenta y negocio) · Responsable: Javier · Última actualización: 03/11/2026

**Estado:** Aprobado (PR #52, 03/11/2026). Documento contrastado con el mapa de pantallas aprobado (PR #54, #8), con las funciones adicionales de `docs/funciones.md` (#7) y con el [prototipo](prototipo/README.md) (#11).

Leyenda: **[Confirmado]** requisito respaldado por el enunciado, documentos aprobados o implementación comprobada · **[Supuesto]** hipótesis pendiente de comprobar · **[Propuesta]** decisión revisable · **[Pendiente]** falta construir, decidir o validar. Las funciones pospuestas se identifican como **[Pendiente] Aplazado (#número)**, sin crear una quinta etiqueta.

## 1. Objetivo y alcance

Ticketon ayuda a autónomos que trabajan con una gestoría a guardar y ordenar justificantes, revisar los datos extraídos y preparar la documentación para su gestoría. La tarea principal debe poder hacerse desde el móvil en pocos pasos: fotografiar o subir un justificante, comprobar los datos, corregir lo necesario y guardarlo junto con el original.

El diseño debe cubrir las **18 pantallas P00–P17** del mapa aprobado en #8, sus estados y los flujos de móvil, escritorio, reenvío por correo, revisión, duplicados, exportación y cierre de trimestre. Que una pantalla esté especificada no significa que esté construida ni probada.

Ticketon organiza documentos; no determina si un gasto es deducible, no presenta impuestos y no sustituye a la gestoría.

## 2. Principios de diseño

1. **Móvil primero [Propuesta].** La captura con cámara es el flujo principal. La experiencia debe funcionar también en escritorio.
2. **Corrección directa en dos clics [Confirmado].** Desde P10, un clic activa la edición del campo y el segundo confirma el dato. No debe exigirse abrir un formulario aparte ni guardar toda la ficha para cada corrección.
3. **El original y los datos se consultan juntos [Confirmado].** En escritorio se muestran en paralelo; en móvil, la foto aparece encima de los datos y se puede ampliar con un toque.
4. **La IA propone, la persona revisa [Confirmado].** Los datos extraídos son editables. Los campos dudosos o vacíos se identifican con texto.
5. **El original se conserva [Confirmado].** La subida y el guardado del original no deben depender de que el OCR funcione.
6. **Una acción principal clara por pantalla [Propuesta].** Evitar llamadas a la acción que compitan entre sí.
7. **Lenguaje cotidiano [Propuesta].** Usar expresiones como “Mis gastos”, “Hacer foto”, “Revisar datos” y “Exportar para la gestoría”.
8. **Errores recuperables [Propuesta].** Explicar qué ha ocurrido, qué se ha guardado y cómo continuar.
9. **Privacidad y seguridad [Confirmado].** Cada persona solo ve sus documentos. Los enlaces a originales respetan permisos y no exponen datos fiscales en URL ni avisos.
10. **Accesibilidad [Propuesta].** Contraste suficiente, foco visible, etiquetas persistentes, navegación por teclado y mensajes que no dependan solo del color.

## 3. Identidad visual

La paleta ya está aplicada en la web y sus valores se consideran **[Confirmado]**. La tipografía y la composición que no estén verificadas en la web continúan siendo propuestas.

### 3.1. Paleta [Confirmado]

| Uso | Color | Aplicación |
|---|---|---|
| Fondo general | #F7F8FA | Fondo de la aplicación |
| Superficie | #FFFFFF | Tarjetas, formularios y paneles |
| Texto principal | #17202A | Títulos y datos |
| Texto secundario | #52606D | Ayudas, etiquetas y metadatos |
| Color principal | #2457A7 | Acción principal, enlaces y foco |
| Color principal oscuro | #19447F | Estados activos |
| Bordes | #D8DEE6 | Campos, separadores y tarjetas |
| Éxito | #1F5C36 | Siempre acompañado de texto |
| Aviso | #6B4508 | Datos dudosos, duplicados o pendientes |
| Error | #B42318 | Errores que requieren actuación |

No usar el color como único indicador. Aunque la paleta ya está aplicada, comprobar que texto, controles y foco mantienen contraste suficiente.

### 3.2. Tipografía y composición [Propuesta]

- Tipografía: Inter, con una sans-serif del sistema como alternativa.
- Texto de formularios: 16 px; ayudas y metadatos: al menos 14 px.
- Jerarquía clara de títulos, campos alineados y espaciado basado en múltiplos de 8 px.
- Bordes discretos, radios moderados y sombras mínimas.
- Diseño adaptable desde 320 px.
- En escritorio, limitar el ancho del contenido y aprovechar el espacio para mostrar original y datos en paralelo.

### 3.3. Componentes compartidos [Propuesta]

- Navegación principal de la web [Confirmado]: Gastos, Subir y Exportar. Mantener estas tres entradas como navegación principal; cualquier acceso adicional (por ejemplo, Cuenta) se considera propuesta secundaria y no debe alterar esa estructura.
- Contador mensual de documentos visible en la zona superior.
- Botón principal sólido; acciones secundarias neutras o como enlaces.
- Campos con etiqueta persistente, ayuda cuando sea necesaria y error junto al campo.
- Estados con texto: Pendiente de revisar, Revisada, Error de lectura, Posible duplicado y Llegó por correo.
- Avisos con título y explicación; no depender solo del color o de un icono.
- Tarjetas o filas compactas en móvil; evitar tablas que exijan desplazamiento horizontal.
- Estados de carga, vacío, error y éxito para acciones asíncronas.
- Confirmación para acciones irreversibles. No sobrescribir ni borrar el original por accidente.

## 4. Requisitos por pantalla

Los códigos y nombres corresponden al mapa aprobado de #8. Se mantienen para que diseño, prototipo y desarrollo hablen de las mismas pantallas.

### 4.1. P00 · Portada pública

Explicar en pocas líneas para quién es Ticketon, qué problema resuelve y el recorrido básico: subir, revisar y exportar. Incluir accesos claros a Precios, Entrar y Crear cuenta. No prometer deducibilidad, presentación de impuestos ni funciones no implementadas.

### 4.2. P01 · Precios

Mostrar los tres planes (Gratis, Autónomo y Autónomo Plus), precio mensual, límite mensual de lecturas y funciones incluidas. Los precios vigentes en el modelo de negocio siguen siendo provisionales hasta su aprobación definitiva.

Destacar que la instalación en el móvil ya está implementada y que los avisos internos activos están incluidos en todos los planes. La pantalla y el flujo de cierre de trimestre (P14, #50) están **[Pendiente] Aplazado (#50)** y no forman parte del alcance imprescindible actual; en Precios, esa función puede aparecer como «Próximamente», sin permitir contratarla. Esto no afecta al aviso «Trimestre próximo a cerrar», que sí está implementado en Exportar (PR #58 y #63) y forma parte de los avisos activos de #27. La exportación normal a Excel por periodo sigue disponible en el plan Gratis. No simular un pago o contratación real si no existe.

### 4.3. P02 · Crear cuenta

Solicitar correo y contraseña, repetir contraseña y mostrar enlaces a privacidad y condiciones de uso. Incluir errores de validación, envío y éxito. No mostrar documentos hasta que la sesión esté autenticada y autorizada.

### 4.4. P03 · Entrar

Solicitar correo y contraseña. Mostrar mensajes claros ante credenciales incorrectas y acceso a “¿Has olvidado la contraseña?” y “Crear cuenta”. No revelar información de otras cuentas.

### 4.5. P04 · Recuperar contraseña

Permitir introducir el correo y solicitar el enlace de recuperación. Mostrar siempre un mensaje neutral, exista o no la cuenta, para no revelar qué direcciones están registradas. Contemplar error de envío.

### 4.6. P05 · Nueva contraseña

Abrir desde el enlace recibido por correo. Solicitar la nueva contraseña dos veces, validar los requisitos reales y contemplar enlace caducado, inválido o ya utilizado. Tras completar el cambio, permitir continuar al acceso según el comportamiento implementado.

### 4.7. P06 · Textos legales

Permitir consultar política de privacidad, aviso legal, cookies y condiciones de uso. Los textos deben estar revisados antes de pruebas externas. No presentar el documento de análisis normativo como garantía automática de cumplimiento.

### 4.8. P07 · Mis gastos

Es la pantalla inicial tras iniciar sesión.

- Mostrar los documentos del usuario, el más reciente primero.
- Cada elemento presenta fecha, emisor, total en euros cuando exista, categoría y estado.
- Mostrar etiquetas cuando correspondan: Pendiente de revisar, Posible duplicado, Sin NIF del receptor, Conversión pendiente y Llegó por correo.
- Mostrar una franja de avisos cuando haya avisos pendientes.
- Dar acceso a revisar el documento y consultar su original.
- En móvil, usar tarjetas o filas compactas; en escritorio, una lista legible.
- Incluir el contador mensual de documentos.
- Si no hay documentos, explicar brevemente las vías para añadir el primero.
- El mapa contempla filtros y búsqueda como mejora posterior al listado básico; no deben retrasar el flujo principal.

En escritorio, permitir arrastrar archivos sobre la lista si está implementado.

### 4.9. P08 · Subir documento

Presentar las vías de entrada:

- Hacer foto con la cámara del móvil.
- Elegir PDF o imagen del dispositivo.
- Arrastrar y soltar o elegir archivos en escritorio.
- Consultar y copiar la dirección personal de reenvío por correo.

Indicar formatos y tamaño máximo cuando estén fijados. Mostrar progreso y errores recuperables. No indicar que el original está guardado hasta recibir confirmación del servidor. Si el archivo ya estaba guardado con la misma huella, informar de ello y enlazar al documento existente; no iniciar otra lectura.

### 4.10. P09 · Subiendo y leyendo

Mostrar el progreso por archivo y distinguir las fases: subida, original guardado, lectura con IA y resultado. Si hay varios archivos, mostrar el estado de cada uno.

Contemplar:
- Error de subida: no afirmar que se ha guardado.
- Error de lectura: indicar que el original sí está guardado y ofrecer reintentar. **Rellenar los datos manualmente [Pendiente]:** esta opción no está construida; no debe mostrarse como disponible ni darse por parte del flujo implementado hasta que se desarrolle.
- Archivo repetido: informar de que ya existe y no se vuelve a leer ni consume cupo.
- Límite del plan: el original se guarda, pero queda pendiente de lectura hasta que haya cupo o se cambie de plan.
- Lectura completada: continuar a P10.

### 4.11. P10 · Revisar y corregir

Es la pantalla prioritaria del producto y debe cumplir literalmente el requisito de ver el original junto a los datos y corregir un campo en dos clics.

**Distribución:**
- Escritorio: original a la izquierda, con zoom; datos a la derecha.
- Móvil: foto arriba y datos debajo. La foto se amplía con un toque. No separar original y datos en pestañas que impidan verlos juntos.

**Campos que se muestran cuando existan:**
- Tipo de documento: factura o ticket.
- Fecha.
- Nombre y NIF del emisor.
- NIF del receptor.
- Número de factura o ticket.
- Categoría.
- Una o varias líneas de IVA con tipo, base y cuota.
- Retención de IRPF, si existe.
- Total y moneda original.
- Tipo de cambio, fecha aplicada y total en euros cuando corresponda.

**Corrección en dos clics [Confirmado]:**
1. Primer clic sobre el dato: se activa su edición y aparece el control adecuado (teclado numérico, calendario o selector, según el campo).
2. Segundo clic: confirmar el dato con “Listo” o la acción equivalente junto al campo. El cambio se guarda sin exigir un botón general al final de la ficha.

Escribir el valor no cuenta como clic. No debe añadirse un paso intermedio de “Editar”. “Guardar como revisada” es una acción distinta: confirma que la ficha completa está comprobada, no cada campo individual.

**Reglas y avisos:**
- Resaltar campos vacíos o dudosos con texto, no solo con color.
- Distinguir datos extraídos de datos corregidos y de una ficha revisada.
- Permitir añadir, editar y eliminar líneas de IVA.
- Avisar si bases, cuotas, retención y total no cuadran; nunca modificar importes silenciosamente.
- Si falta conversión a euros, mostrar “Conversión pendiente” y no permitir marcar como revisada una factura que requiera conversión.
- Si falta el NIF del receptor en un ticket, permitir guardarlo y mostrar el aviso interno correspondiente. No convertir ese aviso en un juicio sobre la deducibilidad.
- Si hay un posible duplicado, mostrar el motivo y permitir abrir P11. El aviso no bloquea por sí solo la revisión ni la exportación.
- Permitir abrir P12 para consultar el original a pantalla completa.
- Permitir volver a leer con IA si la función está disponible.
- Advertir de cambios sin guardar antes de abandonar la ficha.
- El botón “Guardar como revisada” respeta las validaciones reales del backend: fecha, emisor, total, total en euros y categoría, según el modelo de datos.

### 4.12. P11 · Comparar posible duplicado

Mostrar los dos documentos y sus datos clave. En móvil, uno encima del otro; en escritorio, lado a lado. Explicar por qué se ha detectado la coincidencia (misma huella, mismo NIF/número/total o mismo emisor/fecha/total, según la regla aplicada).

Permitir borrar uno con confirmación, marcar “No es un duplicado” o volver sin decidir. El aviso no debe bloquear el uso normal. Antes de borrar, informar de las consecuencias sobre el documento y el cupo cuando corresponda.

### 4.13. P12 · Original a pantalla completa

Mostrar el archivo original sin sustituirlo por una versión procesada. Permitir ampliar, descargar y volver a P10. El acceso debe respetar la autorización del usuario; no utilizar enlaces públicos permanentes.

### 4.14. P13 · Exportar

Permitir elegir mes, trimestre o año. Mostrar un resumen del periodo: número de documentos, total en euros y documentos con avisos. Permitir descargar el Excel incluso si existen documentos pendientes, sin ocultar que hay datos sin revisar o conversiones pendientes.

La exportación ordinaria por periodo está disponible en todos los planes, incluido Gratis. El Excel debe respetar las columnas y reglas aprobadas en #23: una fila por cada tipo de IVA cuando corresponda, importes y moneda original, conversión aplicada y estado. No prometer enlaces a originales ni columnas no acordadas.

El estado vacío debe indicar que no hay gastos en el periodo. El acceso a P14 (Cierre de trimestre, #50) debe identificarse como «Próximamente» mientras siga aplazado, sin activar un flujo inexistente ni bloquear la exportación normal. El aviso «Trimestre próximo a cerrar» sí está implementado y debe seguir mostrándose cuando corresponda. Tras exportar, mostrar confirmación solo cuando el archivo se haya generado correctamente.

### 4.15. P14 · Cierre de trimestre [Pendiente] Aplazado (#50)

Función prevista para los planes Autónomo y Autónomo Plus, pero **aplazada por decisión del equipo**. No forma parte de los imprescindibles actuales ni debe bloquear la revisión o entrega del MVP. En Gratis se muestra bloqueada con una explicación breve y enlace a P01; no se bloquea la exportación normal a Excel.

La pantalla debe guiar por tres pasos:
1. Pendientes del trimestre: tickets sin NIF del receptor, datos por revisar y posibles duplicados. Permitir abrir el documento correspondiente en P10.
2. Resumen: total de gastos, IVA por tipo y gasto por categoría.
3. Paquete descargable: Excel del periodo y originales ordenados en un ZIP.

Permitir continuar aunque queden pendientes, dejando claro qué falta. No presentar el paquete como declaración fiscal ni afirmar que los gastos son deducibles. La generación del ZIP en el navegador es una propuesta del mapa que debe comprobarse en la implementación de #50.

### 4.16. P15 · Cuenta y plan [Pendiente]

La pantalla y sus funciones de gestión de cuenta y plan no están construidas todavía. Mantenerlas identificadas como **[Pendiente]**; no presentarlas como implementadas ni como requisito imprescindible para cerrar esta revisión del diseño. Los campos previstos (nombre, NIF propio si está disponible, correo, plan y documentos usados) quedan como alcance por concretar.

**Instalación en el móvil [Confirmado · implementada]:** la instalación como PWA ya está implementada en la web mediante el PR #80. No debe figurar como una función pendiente de construir dentro de P15. La ayuda o acceso visual desde Cuenta podrá definirse cuando se trabaje esa pantalla.

La baja y eliminación de cuenta siguen pendientes de concretar en las tareas correspondientes.

### 4.17. P16 · Reenvío por correo

Pantalla obligatoria: el reenvío es la vía rápida para incorporar facturas recibidas por correo sin descargar el PDF y volver a subirlo manualmente.

Mostrar:
- Dirección personal y única de recepción del usuario.
- Botón para copiarla.
- Lista de direcciones de correo autorizadas para reenviar.
- Acciones para añadir o quitar remitentes autorizados.
- Instrucciones breves para reenviar desde Gmail u Outlook.
- Aviso claro de que los correos de remitentes no autorizados se descartan.

La pantalla debe estar accesible desde P08 y, cuando se construya P15, también desde Cuenta. No confundir esta vía con una conexión directa a Gmail u Outlook: esas integraciones están descartadas para el MVP.

Cuando un adjunto se recibe correctamente, debe aparecer en P07 con la etiqueta “Llegó por correo”. Si ya existe por su huella, no debe duplicarse ni volver a leerse. El comportamiento de aviso al usuario ante un adjunto repetido queda como mejora posterior, no como requisito para alterar el resultado de la recepción.

### 4.18. P17 · Panel con cifras [Pendiente] Aplazado (#26)

Función aplazada por decisión del equipo. No forma parte de los imprescindibles actuales ni debe retrasar la entrega del MVP. Puede mostrar gasto del mes, gasto por categoría y comparación con el mes anterior, con acceso al listado correspondiente. No debe retrasar ni sustituir Mis gastos, la captura, la revisión o la exportación. El plan en que se incluiría está pendiente de decisión.

## 5. Avisos y estados comunes

Los avisos se muestran dentro de la web, no por correo, según #7.

- **Posible duplicado:** obligatorio; aparece en P07 y P10 y permite comparar en P11.
- **Ticket sin NIF del receptor:** función adicional incluida en todos los planes; aparece en P07 y P10.
- **Trimestre próximo a cerrar [Confirmado]:** aviso implementado en Exportar mediante PR #58 y #63, y recogido en la issue #27, cerrada. Es un aviso activo; no confundirlo con la pantalla y el flujo P14 de cierre de trimestre (#50), que sí están **[Pendiente] Aplazado (#50)**.
- **Límite del plan:** informar de lecturas disponibles y qué ocurre al alcanzar el límite. El original se conserva aunque quede pendiente de lectura.
- **Conversión pendiente:** identificar la factura y el dato que falta; no inventar importes.
- **Llegó por correo:** etiqueta de procedencia visible en P07.

Todos los estados deben incluir carga, vacío, éxito y error cuando proceda. Ejemplos:
- “Subiendo archivo…” / “Original guardado” / “No se ha podido subir. Inténtalo de nuevo”.
- “Leyendo tu documento…” / “No hemos podido leerlo. El original sigue guardado”.
- “Hay datos que conviene comprobar” / “Revisión guardada”.
- “Este documento podría estar repetido”, con acceso a la coincidencia.
- “Preparando Excel…” / “Exportación preparada”.
- Si no hay conexión, indicar que el guardado no está confirmado y no descartar cambios sin avisar.

No culpar al usuario ni mostrar éxito antes de que el servidor confirme la acción.

## 6. Accesibilidad y adaptación

- Comprobar contraste de texto y controles; foco visible y navegación con teclado.
- Etiquetas persistentes; el texto de ejemplo no sustituye a la etiqueta.
- Errores junto al campo y resumen si hay varios.
- Botones con nombres descriptivos.
- No depender solo del rojo/verde ni de iconos.
- Controles táctiles cómodos y acciones destructivas separadas de las principales.
- Probar al menos 320 px de ancho móvil y una resolución de escritorio.
- En P10, comprobar que el original y los datos siguen siendo consultables sin zoom excesivo ni desplazamientos confusos.
- En P10, verificar mediante prueba de uso que la corrección de un campo requiere como máximo dos clics, además de escribir el valor.

## 7. Alcance del prototipo navegable (#11)

**Imprescindible para representar el flujo principal y revisar el diseño:**
1. P02–P05: crear cuenta, entrar y recuperar contraseña.
2. P07–P10: Mis gastos, subir, progreso/lectura y revisión.
3. P11–P12: comparación de duplicados y original a pantalla completa.
4. P13: exportación normal a Excel.
5. P16: reenvío por correo.
6. P00, P01 y P06: portada, precios y textos legales.
7. Estados de error, vacío, carga, archivo repetido, límite y conversión pendiente.

**Aplazado por decisión del equipo (no imprescindible para esta entrega):**
- P14 · Cierre de trimestre (#50).
- P17 · Panel con cifras (#26).
- Compartir desde el móvil (#17). La instalación PWA es distinta y ya está implementada mediante el PR #80.

**Pendiente de construir:** P15 · Cuenta y plan, y la opción de rellenar manualmente los datos tras un error de lectura. Se documentan para mantener trazabilidad, pero no se presentan como funciones disponibles ni como bloqueantes del alcance actual.

**Fuera del MVP:** acceso de gestorías a varios clientes, equipos, contabilidad completa, emisión de facturas, presentación de impuestos, pagos reales no implementados, conexiones directas con Gmail/Outlook, Drive/Dropbox, bancos o programas contables, kilometraje, dietas y personalización extensa.

## 8. Criterios de aceptación

- [ ] El documento cubre las 18 pantallas P00–P17 del mapa aprobado.
- [ ] El flujo móvil foto → datos → corregir → guardar se entiende sin explicación externa.
- [ ] En P10, original y datos se ven juntos en móvil y escritorio según el mapa.
- [ ] Corregir un campo requiere como máximo dos clics: activar el campo y confirmar el dato.
- [ ] Se distinguen datos extraídos, corregidos y ficha revisada.
- [ ] Se muestran los avisos activos de duplicado, ticket sin NIF del receptor y «Trimestre próximo a cerrar» (implementado en Exportar, PR #58 y #63; #27).
- [ ] El reenvío por correo está diseñado como vía obligatoria, con dirección personal y remitentes autorizados.
- [ ] La instalación móvil está implementada (PR #80). Compartir desde el móvil (#17) queda aplazado.
- [ ] La pantalla y el flujo P14 de cierre de trimestre (#50) están identificados como **[Pendiente] Aplazado (#50)** y no se consideran imprescindibles para esta entrega. El aviso «Trimestre próximo a cerrar» permanece activo.
- [ ] El panel P17 (#26) está identificado como aplazado y no bloquea el MVP.
- [ ] Los originales se conservan y pueden recuperarse con permisos.
- [ ] Los estados de carga, vacío, error y éxito están contemplados.
- [ ] Los textos no prometen deducibilidad, digitalización certificada ni funciones no implementadas.
- [ ] La paleta aplicada en la web está marcada como confirmada; tipografía, componentes y accesibilidad se verifican por separado.
- [ ] El equipo revisa y aprueba este documento antes de cerrar #9. El prototipo ya está documentado en la PR #91.

## 9. Dependencias y decisiones pendientes

- **#8 · Mapa de pantallas y flujos:** aprobado y unido a `main` mediante PR #54. Este documento sigue sus 18 pantallas P00–P17.
- **#7 · Funciones adicionales:** documento unido a `main`; recoge la instalación móvil y avisos adicionales. El cierre de trimestre y el panel se mantienen aplazados por la decisión actual del equipo; compartir desde el móvil también queda aplazado.
- **#11 · Prototipo navegable:** debe comprobar distribución, legibilidad, adaptación móvil/escritorio y requisito de dos clics.
- **#26 · Panel con cifras:** aplazado por decisión del equipo.
- **P15 · Cuenta y plan:** pendiente de construcción.
- **Rellenado manual de datos:** pendiente de construcción; no debe describirse como opción ya disponible.
- **#19 y #21 · Lectura IA y corrección:** los campos y validaciones visuales deben coincidir con lo que realmente devuelve y permite guardar el backend.
- **#20 · Moneda:** respetar el criterio aprobado de conversión; no inventar tipo de cambio ni total en euros.
- **#23 · Excel:** respetar las columnas y el tratamiento del original acordados en esa tarea.
- **#16 · Reenvío por correo:** dirección personal, remitentes autorizados y recepción de adjuntos.
- **#17 · Compartir desde el móvil:** aplazado por decisión del equipo. La instalación PWA ya está implementada mediante PR #80.
- **#27 · Avisos:** cerrada. Mantener activos los avisos acordados, incluido «Trimestre próximo a cerrar», implementado en Exportar mediante PR #58 y #63. No confundir este aviso con P14.
- **#50 · Cierre de trimestre:** la pantalla y el flujo P14 están **[Pendiente] Aplazado (#50)** por decisión del equipo; no son imprescindibles para la entrega actual. El aviso de proximidad al cierre sí está construido y activo.
- **#24 y #31 · Precios y límites:** no presentar precios, pagos o reglas de cupo como definitivos si siguen pendientes.
- **Accesibilidad:** verificar contraste, tamaños, teclado y uso real con el prototipo.

## 10. Fuentes

- Enunciado del proyecto: “Proyecto final: Plataforma para gestión de facturas”, requisitos obligatorios 1–7 y funciones adicionales.
- [Mapa de pantallas y flujos](mapa-pantallas.md), aprobado en PR #54 y actualizado el 03/11/2026.
- [Funciones adicionales](funciones.md), PR #47, unido a `main`.
- [Modelo de datos](modelo-datos.md), para estados, campos y validaciones.
- [Modelo de negocio](modelo-negocio.md), para planes, límites y precios.
- [Guía de estilo](guia-estilo.md), para el uso de etiquetas, tono y formato.
- Issues #9, #11, #13–17, #19–23, #24, #26–27, #31 y #50.
