# 09 · Normativa aplicable y cómo la abordamos

**Proyecto:** Ticketon, plataforma para organizar facturas y tickets de autónomos.  
**Fecha de revisión:** 29 de octubre de 2026.  
**Estado:** análisis inicial para el trabajo final del curso; debe revisarse cuando se definan arquitectura, proveedores y funciones definitivas. No sustituye asesoramiento jurídico o fiscal.

Leyenda: **[Confirmado]** norma o condición respaldada por fuente identificada; **[Supuesto]** hipótesis aún no verificada; **[Propuesta]** medida recomendada; **[Pendiente]** asunto que requiere comprobación antes de usar el servicio con documentos reales o lanzar comercialmente.

## 1. Alcance del producto

El MVP previsto permite crear una cuenta, subir o fotografiar justificantes, incorporar documentos desde el correo, extraer datos mediante OCR/IA, corregirlos, conservar el original y exportar información para la gestoría.

En el alcance actual **no se ha definido emitir facturas propias, llevar la contabilidad oficial, presentar impuestos ni certificar que un gasto sea deducible**. La aplicación organiza información y prepara una exportación; la persona usuaria y su asesoría siguen siendo responsables de las decisiones fiscales.

Esta delimitación es importante: si más adelante el producto empieza a emitir facturas, generar registros de facturación o sustituir legalmente originales en papel, habrá que reabrir el análisis normativo antes de implementar esas funciones.

## 2. Resumen de normas y decisiones

| Área | Norma o referencia | Qué implica para el proyecto | Decisión para el MVP |
|---|---|---|---|
| Protección de datos | Reglamento (UE) 2016/679 (RGPD) y Ley Orgánica 3/2018 (LOPDGDD) | Los justificantes pueden contener nombres, direcciones, identificadores, datos de autónomos y otros datos personales. Deben existir base jurídica, información, derechos, seguridad y contratos adecuados. | Diseñar privacidad desde el inicio; separar usuarios y empresas; documentar los proveedores que tratan datos. |
| Seguridad y proveedores | RGPD, artículos 28 y 32; orientaciones de la AEPD | Deben seleccionarse encargados con garantías, formalizar contratos y aplicar medidas técnicas y organizativas adecuadas al riesgo. | Acceso por usuario, controles de autorización en servidor, transporte cifrado, secretos fuera del repositorio, copias y procedimiento de incidentes. |
| Facturas y conservación | Real Decreto 1619/2012, especialmente artículos 19–22; Ley 37/1992 del IVA, artículo 165; Código de Comercio, artículo 30; Ley General Tributaria | Hay requisitos sobre conservación, acceso, legibilidad e integridad. Los plazos varían según la obligación aplicable. | Conservar el archivo original y los datos asociados, permitir su descarga y no prometer un plazo universal sin definir el caso y la política de conservación. |
| Digitalización certificada | Orden EHA/962/2007 y Resolución de la AEAT de 24 de octubre de 2007 | La digitalización certificada tiene requisitos específicos y un procedimiento de homologación. Un OCR o una fotografía corriente no convierten por sí solos el sistema en software homologado. | No solicitar homologación ni afirmar digitalización certificada para el MVP. No prometer que una foto permite destruir el original en papel. |
| Web y contratación | Ley 34/2002 (LSSI-CE) y normativa de consumo/contratación que resulte aplicable al modelo final | La web debe ofrecer la información legal exigible al prestador. Si hay alta de pago o suscripción, deben revisarse las obligaciones precontractuales y de contratación electrónica. | Preparar aviso legal y condiciones coherentes con el servicio real antes de publicar una versión comercial. |
| Cookies y tecnologías similares | Artículo 22.2 de la LSSI-CE y Guía de cookies de la AEPD (mayo de 2024) | Las cookies no necesarias y tecnologías equivalentes requieren información y, cuando corresponda, consentimiento válido; rechazar debe ser tan sencillo como aceptar. | Evitar analítica y publicidad no necesarias en el MVP si no aportan valor. Si se incorporan, implementar un panel de consentimiento antes de activarlas. |
| Uso de IA/OCR | RGPD; condiciones de los proveedores de IA y OCR | Enviar documentos a un proveedor externo puede implicar tratamiento por cuenta de la aplicación y, según el proveedor y la ubicación, transferencias internacionales. | Revisar contrato, subencargados, ubicación, retención y uso de datos para entrenamiento antes de elegir proveedor. No enviar documentos reales sin tenerlo comprobado. |

## 3. Protección de datos: roles y obligaciones

### 3.1. Quién es responsable y quién es encargado

La clasificación depende de lo que ocurra realmente, no solo de lo que digan los términos del servicio:

- **Nuestra plataforma** normalmente será responsable de los datos necesarios para gestionar cuentas, facturación de la suscripción, seguridad y atención al cliente.
- Cuando un autónomo suba documentos para organizarlos en su nombre, la plataforma probablemente actuará como **encargada del tratamiento** respecto de esos documentos, mientras que el autónomo será el responsable. Esta relación debe confirmarse según las finalidades reales.
- El proveedor de OCR/IA, alojamiento, correo u otros servicios puede ser encargado o subencargado si procesa datos siguiendo instrucciones. Deben revisarse sus condiciones y formalizarse las garantías y contratos pertinentes.

No debemos dar por hecho que un proveedor es conforme al RGPD solo porque ofrece una API o publica una política de privacidad.

### 3.2. Medidas que debemos contemplar

Antes de poner el servicio en producción:

- **Información y transparencia:** política de privacidad comprensible que explique responsable, finalidades, bases jurídicas, destinatarios, conservación, derechos y contacto.
- **Base jurídica:** identificar la base aplicable a cada tratamiento; no usar el consentimiento como solución automática para todo.
- **Minimización:** solicitar y conservar solo los datos necesarios para prestar el servicio.
- **Derechos:** disponer de un canal y un procedimiento para solicitudes de acceso, rectificación, supresión, oposición, limitación y portabilidad cuando proceda.
- **Seguridad:** HTTPS, almacenamiento privado, permisos mínimos, separación de datos entre cuentas, controles de acceso en servidor, gestión segura de credenciales y secretos, registro de acciones relevantes y copias de seguridad protegidas.
- **Incidentes:** procedimiento para evaluar y gestionar brechas de datos, incluidas las comunicaciones a la autoridad y a las personas afectadas cuando la normativa lo exija.
- **Proveedores:** inventario de servicios, acuerdos de tratamiento, subencargados y análisis de transferencias internacionales cuando corresponda.
- **Retención y borrado:** definir qué se conserva, durante cuánto tiempo, cómo se exporta y cómo se elimina de los sistemas activos y de las copias según una política documentada.
- **Riesgos:** analizar los riesgos del tratamiento. Una evaluación de impacto no es automáticamente obligatoria para toda aplicación; debe determinarse si la naturaleza y el riesgo del tratamiento la hacen necesaria.
- **Delegado de Protección de Datos:** no asumir que toda pequeña empresa necesita designarlo. Comprobar si se da alguno de los supuestos legales.

La AEPD ofrece orientación para pymes y la herramienta FACILITA_RGPD, útil como apoyo inicial, pero no debe tratarse como certificación ni como sustituto de una evaluación concreta.

### 3.3. Particularidad de los documentos y del OCR

Las facturas y tickets no son siempre datos personales, pero pueden incluirlos. Las imágenes pueden mostrar información ajena a la finalidad prevista. El producto debe limitar el acceso a los documentos de cada usuario y no reutilizar su contenido para entrenar modelos propios o de terceros sin una base jurídica y una información claras.

Si se utiliza un proveedor externo de IA, antes de integrar documentos reales hay que verificar al menos:

1. Qué datos recibe y con qué finalidad.
2. Si conserva las entradas o salidas y durante cuánto tiempo.
3. Si las utiliza para entrenar o mejorar modelos.
4. En qué países se procesan y almacenan.
5. Qué subencargados intervienen y qué contrato de tratamiento ofrece.
6. Cómo se borran los datos y cómo se gestionan incidentes.

### 3.4. Proveedores seleccionados: datos, ubicación y verificaciones pendientes

La ubicación de una región de alojamiento no demuestra por sí sola que todos los proveedores, subencargados, registros, copias y operaciones de soporte procesen los datos exclusivamente en la UE. Deben comprobarse los contratos y la documentación vigentes antes de usar documentos personales reales.

| Proveedor | Función prevista y datos que podría recibir | Ubicación/condiciones | Estado y acción necesaria |
|---|---|---|---|
| Vercel | [Propuesta] aloja la web y ejecuta rutas de servidor; podría tratar datos de sesión, registros y metadatos de solicitudes. Los originales deben subirse directamente al almacenamiento y no incluirse en logs. | [Propuesta] región de funciones `fra1` (Fráncfort), según la arquitectura elegida. Esto no confirma por sí solo la ubicación de todos los servicios auxiliares ni transferencias. | [Confirmado] el DPA de Vercel consultado indica que se aplica a clientes Enterprise y Pro. [Pendiente] revisar las condiciones contractuales aplicables a la cuenta concreta, subencargados, logs, retención y transferencias antes de usuarios reales. Hobby solo para demo académica y no debe suponerse cubierto por el DPA de Pro/Enterprise. |
| Supabase | [Propuesta] Auth, base de datos y archivos originales; tratará credenciales de cuenta y datos fiscales/personales contenidos en justificantes. | [Propuesta] proyecto en Fráncfort (`eu-central-1`), según la arquitectura elegida; no equivale a confirmar que cada operación auxiliar ocurra solo en la UE. | [Pendiente] verificar DPA, subencargados, backups, retención, políticas RLS y permisos de Storage; probar aislamiento con dos cuentas. |
| Resend | [Propuesta] recepción de emails y adjuntos de facturas; el contenido puede contener datos personales y fiscales. | [Supuesto] no se ha confirmado la ubicación de todo el tratamiento de entrada, almacenamiento temporal, logs y subencargados. | [Pendiente] verificar región, retención de contenido, DPA, subencargados, transferencias y controles de remitente antes de activarlo con datos reales. |
| Gemini API, plan gratuito | [Confirmado] las condiciones consultadas del plan gratuito pueden permitir el uso del contenido para mejorar servicios y revisión humana, y restringen el envío de datos personales o sensibles; los documentos se procesan por un proveedor externo. | No debe suponerse que el plan gratuito ofrece las mismas condiciones de privacidad o tratamiento que un servicio empresarial. | [Propuesta] limitarlo a pruebas académicas con documentos ficticios o debidamente anonimizados. [Pendiente] para uso comercial, revisar modalidad de pago/Vertex AI, DPA, región, retención, entrenamiento, subencargados y transferencias; no habilitar con documentos reales hasta validarlo. |

La tabla es una evaluación inicial de riesgos, no una certificación de cumplimiento. Las condiciones de los proveedores pueden cambiar y deben consultarse en sus páginas oficiales y contratos al configurar cada cuenta. Fuentes oficiales consultadas el 29/10/2026: [DPA de Vercel](https://vercel.com/legal/dpa), [DPA de Supabase](https://supabase.com/legal/customer-resources/data-processing-addendum), [DPA de Resend](https://resend.com/legal/dpa) y [condiciones adicionales de Gemini API](https://ai.google.dev/gemini-api/terms). La existencia de un DPA no confirma por sí sola que el plan elegido, la región y la configuración concreta sean adecuados; hay que revisar el contrato aplicable a la cuenta.

## 4. Conservación de facturas y documentos

No debemos reducir todas las obligaciones a «cuatro años» ni prometer «seis años para todo» sin matices.

- La Ley General Tributaria establece, con carácter general, un plazo de prescripción tributaria de cuatro años, pero el cómputo puede interrumpirse y existen reglas específicas.
- El artículo 30 del Código de Comercio obliga a los empresarios a conservar libros, correspondencia, documentación y justificantes de su negocio durante seis años desde el último asiento, salvo reglas generales o especiales.
- La Ley del IVA contiene obligaciones específicas de conservación durante el plazo de prescripción y supuestos en los que se exige conservar durante un período de regularización y los cuatro años siguientes.
- El Reglamento de facturación exige que la conservación permita garantizar autenticidad del origen, integridad, legibilidad y acceso a la documentación por la Administración tributaria sin demora injustificada.

Estas reglas no significan que todos los documentos de todos los usuarios tengan exactamente el mismo plazo. El servicio debe evitar un borrado automático arbitrario de documentos que el cliente necesita conservar.

**Observación de entrevista [Supuesto]:** una autónoma entrevistada indicó que conserva sus facturas durante cuatro años «por si acaso». Es un testimonio individual útil para conocer su hábito, pero no constituye una regla jurídica ni permite generalizar al resto del público objetivo.

**Decisión propuesta para el MVP:** conservar los originales y los datos asociados mientras la cuenta esté activa, permitir al usuario exportarlos y definir una política transparente de cierre y eliminación de cuenta. Antes de decidir plazos definitivos, revisar el modelo con asesoría jurídica/fiscal y contemplar los bloqueos de borrado que puedan ser necesarios por obligaciones legales. No anunciar que la plataforma sustituye por sí sola la obligación de conservación del cliente.

## 5. ¿Necesitamos digitalización certificada de la AEAT?

**No parece necesaria para el alcance actual del MVP**, siempre que el servicio se limite a guardar una copia digital, extraer datos y preparar una exportación, sin afirmar que la copia digital sustituye legalmente al original en papel.

La AEAT describe la digitalización certificada como un procedimiento sujeto a requisitos técnicos y de calidad y a homologación del software. Por tanto:

- Hacer una foto, pasar OCR o guardar un PDF no equivale a digitalización certificada.
- No debemos usar expresiones como «software homologado por la AEAT», «digitalización certificada» o «puedes tirar los tickets originales» sin haber cumplido y verificado los requisitos aplicables.
- El MVP debe conservar el archivo que el usuario incorpora y no indicar que el usuario puede destruir el papel original.
- Si en una fase futura se quiere permitir prescindir del original físico con efectos fiscales, hay que estudiar el procedimiento de homologación y los requisitos técnicos y organizativos antes de ofrecerlo.

## 6. Reglamento de facturación: qué datos debemos contemplar

El Real Decreto 1619/2012 regula las obligaciones de facturación, incluidos los datos que debe contener una factura completa y las particularidades de las facturas simplificadas. El proyecto no emite facturas, pero extrae campos de documentos recibidos para que el usuario los revise.

Por tanto:

- Los campos extraídos por OCR deben presentarse como datos detectados, no como una validación fiscal definitiva.
- Los campos obligatorios pueden variar según el tipo de documento y sus circunstancias. No debemos exigir a todo ticket los mismos datos que a una factura completa.
- Un dato ausente o una discrepancia aritmética debe generar una advertencia de revisión, no un dictamen automático de deducibilidad.
- La exportación debe distinguir valores extraídos de valores confirmados o corregidos por el usuario.
- La aplicación debe conservar el documento original vinculado a los datos extraídos.

Si el producto pasa a emitir facturas o a generar registros de facturación, habrá que analizar por separado las obligaciones específicas para sistemas informáticos de facturación y los cambios normativos aplicables en ese momento. Ese no es el alcance definido para este MVP.

## 7. LSSI-CE, aviso legal y cookies

### 7.1. Información legal de la web

Antes de comercializar el SaaS, revisar la información que debe estar accesible de forma permanente y directa, como la identificación del prestador, datos de contacto, información registral y fiscal cuando corresponda, y las condiciones de contratación si se ofrecen suscripciones.

La aplicación también necesitará condiciones de uso que expliquen el alcance del servicio, las obligaciones del usuario, las limitaciones del OCR, las exportaciones, los procedimientos de soporte y la terminación de la cuenta. Estas condiciones no pueden eliminar obligaciones legales imperativas.

### 7.2. Cookies

La decisión más sencilla para el MVP es no activar cookies analíticas, publicitarias ni otros rastreadores no necesarios hasta tener una razón clara para usarlos.

Si se incorporan herramientas de analítica o publicidad:
- Informar de manera clara de las categorías, finalidades y terceros.
- No activar las tecnologías que requieran consentimiento antes de obtenerlo.
- Ofrecer aceptar y rechazar en el mismo nivel y con facilidad comparable.
- Permitir cambiar o retirar la elección.
- Mantener la política de cookies coherente con las tecnologías realmente instaladas.

No se debe mostrar un banner que diga que el usuario acepta cookies por seguir navegando.

## 8. Lista práctica de cumplimiento para el MVP

### Antes de integrar proveedores
- [ ] Identificar qué datos personales se tratan y con qué finalidad.
- [ ] Revisar las condiciones del proveedor de OCR/IA, almacenamiento, correo y autenticación.
- [ ] Confirmar ubicación de tratamiento, subencargados, conservación y transferencias internacionales.
- [ ] Evitar subir documentos personales reales a servicios cuya política de tratamiento no se haya revisado.

### Antes de probar con usuarios
- [ ] Asegurar que cada usuario solo puede acceder a sus propios documentos y archivos, comprobándolo en el servidor y no solo en la interfaz.
- [ ] Configurar almacenamiento privado y descargas protegidas.
- [ ] Preparar información de privacidad y un canal para ejercer derechos.
- [ ] Definir retención, exportación y eliminación de datos.
- [ ] Documentar medidas de seguridad, copias y respuesta a incidentes.

### Antes de publicar comercialmente
- [ ] Revisar aviso legal, política de privacidad y condiciones de uso/contratación.
- [ ] Implementar un sistema de consentimiento de cookies si se usan tecnologías que lo requieran.
- [ ] Revisar contratos de encargo del tratamiento y lista de subencargados.
- [ ] Confirmar los plazos de conservación aplicables al servicio y comunicarlos con precisión.
- [ ] No publicitar homologación AEAT, digitalización certificada, cumplimiento total ni garantías fiscales sin evidencia y revisión jurídica.
- [ ] Revisar el marco normativo vigente de nuevo si se añaden emisión de facturas, facturación electrónica o funcionalidades fiscales.

## 9. Preguntas para una persona experta (abogada o asesoría fiscal)

Antes de una prueba con usuarios externos o un lanzamiento comercial, resolver estas cuestiones con una persona cualificada según el tratamiento y las funciones definitivas:

1. ¿Qué roles de responsable/encargado corresponden a Ticketon y al autónomo para cada finalidad y qué acuerdos contractuales se necesitan?
2. ¿Qué plazos de conservación aplican a los originales y datos exportados en cada supuesto, y qué política de borrado debe ofrecer el producto?
3. ¿Qué garantías y mecanismos de transferencia internacional hacen falta para Vercel, Supabase, Resend y el proveedor de IA, incluidos sus subencargados?
4. ¿Qué base jurídica, información y controles son necesarios para el tratamiento de los documentos y para los datos recibidos por correo?
5. ¿Qué obligaciones de contratación, facturación, IVA, desistimiento y transparencia se aplican si se cobra una suscripción a autónomos?
6. ¿Qué cambia si se añade emisión de facturas, facturación electrónica, Verifactu o una función que pretenda sustituir legalmente el papel?

## 10. Normas y funciones fuera del alcance actual

- **Reglamento de IA de la UE:** [Pendiente] revisar su aplicabilidad concreta según la función, proveedor, papel de Ticketon y calendario vigente antes de un lanzamiento. No se declara automáticamente que Ticketon esté sujeto o exento de todas sus obligaciones.
- **Verifactu y normativa de sistemas informáticos de facturación:** fuera del alcance funcional descrito porque Ticketon no emite facturas ni genera registros de facturación propios. Si ese alcance cambia, deberá reabrirse el análisis y validarse con asesoría.
- **Digitalización certificada:** el MVP no pretende sustituir legalmente los originales en papel ni afirmar homologación AEAT.

## 11. Conclusión

Para el MVP, las prioridades normativas son la protección de datos, el aislamiento de la información de cada usuario, la seguridad de documentos y cuentas, la revisión de los proveedores de IA/OCR, una política de conservación coherente y la información legal de la web.

**No necesitamos plantear la homologación de digitalización certificada para la versión descrita**, siempre que no pretendamos sustituir legalmente el papel ni hagamos afirmaciones comerciales en ese sentido. Debemos guardar el original, permitir su recuperación y ser transparentes sobre los límites del OCR.

Este documento es una base de trabajo para el trabajo final del curso, no una certificación de cumplimiento. El cumplimiento real dependerá de la arquitectura implementada, los proveedores elegidos, los contratos, la configuración de seguridad y el funcionamiento efectivo del producto.

## 12. Fuentes oficiales

1. [Reglamento (UE) 2016/679 (RGPD), EUR-Lex](https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32016R0679)
2. [Ley Orgánica 3/2018 (LOPDGDD), BOE — texto consolidado](https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673)
3. [AEPD: medidas que deben adoptarse para cumplir la normativa de protección de datos](https://www.aepd.es/preguntas-frecuentes/2-tus-obligaciones-como-responsable-del-tratamiento/3-que-obligaciones-establece-el-rgpd-para-los-responsables/FAQ-0219-que-medidas-tengo-que-adoptar-para-cumplir-con-la-normativa)
4. [AEPD: orientación para pymes y herramienta FACILITA_RGPD](https://www.aepd.es/derechos-y-deberes/cumple-tus-deberes/directrices-de-aplicacion/pymes)
5. [Real Decreto 1619/2012, Reglamento de obligaciones de facturación, BOE](https://www.boe.es/eli/es/rd/2012/11/30/1619)
6. [Ley 37/1992 del IVA, BOE — artículo 165 sobre conservación](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740)
7. [Código de Comercio, BOE — artículo 30](https://www.boe.es/buscar/act.php?id=BOE-A-1885-6627)
8. [Ley 34/2002 (LSSI-CE), BOE](https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758)
9. [AEPD: Guía sobre el uso de las cookies, mayo de 2024](https://www.aepd.es/guias/guia-cookies.pdf)
10. [AEAT: homologación de software de digitalización certificada de facturas](https://sede.agenciatributaria.gob.es/Sede/procedimientos/FZ01.shtml)
11. [AEAT: preguntas frecuentes sobre digitalización certificada](https://sede.agenciatributaria.gob.es/Sede/todas-gestiones/beneficios-fiscales-autorizaciones/facturacion-libros-registros/homologacion-software-digitalizacion-certificado-facturas_/preguntas-frecuentes.html)
