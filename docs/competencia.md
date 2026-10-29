# Estudio de competencia

**Proyecto:** Plataforma web de gestión de facturas y tickets  
**Fecha de consulta:** 29 de octubre de 2026  
**Estado:** análisis inicial; el posicionamiento definitivo queda condicionado a la validación del público objetivo de la issue #2.

## 1. Objetivo y método

Comparar Captio (Emburse), Pleo, Spendesk, Holded y Quipu para identificar su público, propuesta de valor, funciones relevantes, modelo de precios y posibles oportunidades para el proyecto.

Se han priorizado las páginas oficiales de producto y precios. Las opiniones de directorios externos se usan solo como señales cualitativas, no como prueba de que un problema afecte a todos los clientes. Los precios y promociones pueden cambiar; no son directamente comparables si varían el número de usuarios, la periodicidad, los límites o los servicios incluidos.

## 2. Comparativa resumida

| Solución | Público y enfoque principal | Funciones relevantes | Precio público consultado | Implicación para el proyecto |
|---|---|---|---|---|
| **Emburse Captio** | Empresas que necesitan gestionar gastos de viaje y empleados, aplicar políticas y controlar procesos de aprobación. | Captura desde móvil, OCR/lectura automatizada, envío de gastos por email, informes, multidivisa, alertas, flujos de aprobación e integraciones. | Los planes oficiales consultados solicitan demostración o presupuesto; no publican una tarifa comparable para todos los clientes. | Es una referencia para la captura de justificantes y la gestión de gastos, pero su propuesta se orienta a procesos empresariales y de viajes. No debemos asumir que es directamente comparable con un producto sencillo para un autónomo. |
| **Pleo** | Empresas y equipos que quieren controlar gastos, tarjetas y reembolsos. | Tarjetas físicas/virtuales, seguimiento de gastos, notas automatizadas, integraciones contables; en planes superiores, reembolsos, kilometraje, aprobaciones y revisión de gastos con IA. | La página consultada muestra Start a 8 €/usuario/mes; Build a 14 € y Optimise a 18 €/usuario/mes, con distintas condiciones de facturación y mínimos de usuarios según el plan. | Buen referente para segmentar por usuarios y nivel de control. Su foco en tarjetas y equipos es distinto de organizar documentos y entregarlos a una gestoría. |
| **Spendesk** | Empresas que necesitan centralizar pagos, tarjetas, compras y control presupuestario. | OCR de recibos, tarjetas físicas y virtuales, recordatorios, reembolsos, presupuestos, flujos de aprobación, informes e integraciones. | Precio personalizado. La web explica que el coste combina una cuota fija de plataforma y costes variables por transacción. | Referencia para procesos de aprobación y control financiero. El precio requiere contacto comercial y está diseñado para un contexto empresarial más amplio. |
| **Holded** | Autónomos, pymes y asesorías que buscan una plataforma amplia de gestión empresarial. | Facturación, gastos y tickets con IA, bancos, contabilidad, informes, aplicación móvil y colaboración con la asesoría. | La página oficial consultada muestra planes desde 15 €/mes, además de planes superiores; precios sin IVA y promociones temporales. | Es un competidor especialmente relevante en España. Compite con una oferta integral, por lo que no conviene intentar replicar todo su ERP: el MVP debe centrarse en un problema concreto. |
| **Quipu** | Autónomos, empresas y asesorías; facturación, impuestos y gestión administrativa. | Lector automático de facturas/tickets con validación humana, categorías, aplicación móvil, exportación, conciliación bancaria y funciones de tesorería según plan. | La página consultada publica Starter a 8,50 €/mes, Solution a 15 €/mes y Premium a 29,50 €/mes en la modalidad mensual mostrada. Los límites de escaneos cambian por plan y hay promociones. | Es uno de los referentes más próximos por público y lectura documental. Los límites de escaneos ilustran cómo vincular el consumo de OCR al precio del plan. |

## 3. Análisis por competidor

### 3.1. Emburse Captio

**Propuesta observada:** digitalizar y controlar los gastos de viaje y de empleados, con políticas, aprobaciones, alertas y análisis de gasto.

**Puntos fuertes observables:** combina aplicación móvil y web, captura automatizada, envío de gastos por email, multidivisa, exportaciones e integración con otros sistemas. En su web también presenta captura homologada por la AEAT y custodia del justificante; estas afirmaciones pertenecen al proveedor y no equivalen a una evaluación independiente del producto.

**Precio y límites:** la página oficial consultada presenta niveles Professional, Corporate y Enterprise, con solicitud de demostración o presupuesto. No debe compararse como si tuviera una tarifa pública fija por usuario.

**Oportunidad para nuestro producto:** ofrecer una experiencia de menor complejidad centrada en recopilar, revisar y exportar facturas y tickets para la gestoría. Esto es una hipótesis de posicionamiento, no una afirmación de que Captio carezca de esas funciones.

Fuentes:
- [Captio: producto y funcionalidades](https://www.emburse.com/es/productos/captio)
- [Emburse: precios](https://www.emburse.com/es/productos/precios)

### 3.2. Pleo

**Propuesta observada:** controlar los gastos de equipos mediante tarjetas, seguimiento, reembolsos y procesos de aprobación.

**Puntos fuertes observables:** precios por usuario publicados para varios planes, seguimiento de gastos, integración con sistemas contables y funciones avanzadas de control según plan.

**Precio y límites:** Start se muestra a 8 €/usuario/mes. Build (14 €) y Optimise (18 €) aparecen con facturación anual y mínimo de tres usuarios; por tanto, no se debe multiplicar el precio de forma aislada sin considerar el tamaño mínimo del equipo y la periodicidad.

**Oportunidad para nuestro producto:** valorar una estructura de planes fácil de entender, pero evitar copiar el modelo de tarjetas o el enfoque de gestión de equipos si no forma parte del alcance del MVP.

Fuente:
- [Pleo: planes y precios](https://www.pleo.io/es/pricing)

### 3.3. Spendesk

**Propuesta observada:** gestionar de forma centralizada el gasto de empresa, los pagos, las compras y los presupuestos.

**Puntos fuertes observables:** tarjetas, OCR de recibos, reglas y recordatorios, reembolsos, presupuestos en tiempo real, aprobaciones, integraciones y API.

**Precio y límites:** la página oficial no ofrece un precio estándar comparable; explica una cuota fija de plataforma más costes variables según transacciones.

**Oportunidad para nuestro producto:** mantener una propuesta de valor mucho más acotada y una tarifa comprensible para un autónomo o negocio pequeño, siempre que la estimación de costes demuestre que es sostenible.

Fuente:
- [Spendesk: precios y funcionalidades](https://www.spendesk.com/es/pricing/)

### 3.4. Holded

**Propuesta observada:** plataforma de gestión empresarial que reúne facturación, gastos, bancos, contabilidad y otras áreas del negocio.

**Puntos fuertes observables:** integración de procesos en una sola plataforma, escáner de gastos, aplicación móvil y acceso de la asesoría en determinadas condiciones.

**Precio y límites:** la página oficial consultada muestra planes desde 15 €/mes, precios sin IVA y promociones temporales. Los límites anuales de facturas y las funcionalidades varían por plan. Los importes deben volver a comprobarse antes de tomar decisiones de precios.

**Señales de usuarios:** algunas opiniones publicadas en Capterra valoran la facilidad de uso y la amplitud funcional; otras mencionan dificultades con ciertas importaciones o percepción de precio elevado. Son experiencias individuales y no permiten generalizar sobre todos los clientes.

**Oportunidad para nuestro producto:** no competir por amplitud funcional. Diferenciarse, si la investigación del público lo confirma, por un flujo corto y claro: incorporar justificante, comprobar los campos extraídos, resolver pendientes y exportar el periodo.

Fuentes:
- [Holded: precios](https://www.holded.com/es/precios)
- [Holded para autónomos](https://www.holded.com/es/autonomos)
- [Opiniones de Holded en Capterra](https://www.capterra.es/software/153384/holded)

### 3.5. Quipu

**Propuesta observada:** facilitar facturación, gestión de gastos, impuestos y tareas administrativas de autónomos, empresas y asesorías.

**Puntos fuertes observables:** lector automático de facturas y tickets con validación humana, aplicación móvil, funciones contables y límites de escaneo definidos por plan. La página consultada muestra 30 escaneos mensuales en Starter, 250 en Solution y 350 en Premium.

**Precio y límites:** la página oficial publica 8,50 €/mes para Starter, 15 €/mes para Solution y 29,50 €/mes para Premium en la modalidad mensual mostrada. También presenta descuentos temporales y precios anuales diferentes.

**Señales de usuarios:** en Capterra hay reseñas positivas sobre el ahorro de tiempo y otras que describen problemas con la búsqueda, el escaneo o el tiempo de procesamiento. Las reseñas son limitadas, algunas antiguas y no demuestran que esos problemas sean generales o sigan existiendo hoy.

**Oportunidad para nuestro producto:** la lectura documental y el público autónomo hacen que Quipu sea una referencia cercana. Debemos validar si existe una necesidad diferenciada en la preparación y revisión de justificantes para la gestoría, en lugar de asumir que el OCR por sí solo basta para destacar.

Fuentes:
- [Quipu: planes y precios](https://getquipu.com/es/plan-de-precios)
- [Quipu para autónomos](https://getquipu.com/es/autonomos)
- [Opiniones de Quipu en Capterra](https://www.capterra.es/software/189268/quipu)

## 4. Oportunidades estratégicas para el MVP

Las siguientes conclusiones son hipótesis que se deben validar con el público objetivo de la issue #2:

1. **Especialización en el flujo de justificantes.** En vez de construir otro ERP, resolver bien la incorporación, revisión, organización y exportación de tickets y facturas de gasto.
2. **Facilidad de uso.** Reducir pasos y mostrar el documento original junto a los campos extraídos y editables.
3. **Transparencia de la extracción.** Distinguir claramente datos extraídos, datos corregidos por el usuario, campos ausentes y documentos pendientes.
4. **Preparación para la gestoría.** Ofrecer exportación por periodo y un resumen de documentos revisados o pendientes. No presentarlo como una declaración tributaria ni como garantía de deducibilidad.
5. **Precios previsibles.** Explorar planes con límites explícitos de documentos o lecturas, basados en el coste real de IA y almacenamiento. No fijar precios definitivos hasta cerrar las issues #6 y #7 y calcular los costes.
6. **Captura cómoda.** Priorizar los métodos de captura que exige el proyecto: foto móvil, carga de PDF/imagen y vía rápida para incorporar PDFs recibidos por correo o compartidos desde el móvil.

## 5. Qué no debemos concluir todavía

- No hay pruebas suficientes para afirmar que los cinco competidores tengan precios demasiado altos, mala usabilidad o un OCR poco fiable.
- Las reseñas de directorios son indicios cualitativos, no pruebas representativas.
- Las tarifas de planes distintos no son directamente comparables: pueden variar los usuarios mínimos, escaneos, límites, servicios incluidos, impuestos y periodicidad.
- La oportunidad de diferenciación debe contrastarse con el público objetivo de la issue #2 antes de cerrar la propuesta de valor.
- El proyecto no debe prometer deducibilidad fiscal automática ni homologación o digitalización certificada sin verificar los requisitos aplicables.

## 6. Conclusión provisional

El mercado ya cuenta con soluciones capaces de digitalizar justificantes y gestionar gastos. La oportunidad no consiste en afirmar que esas funciones no existen, sino en comprobar si podemos resolver un caso de uso más concreto y sencillo para nuestro público: reunir los justificantes, revisar los datos extraídos, detectar lo que falta y entregar la documentación organizada a la gestoría.

**Siguiente paso:** validar el público objetivo y la propuesta de valor de la issue #2; después, revisar esta comparativa con ese perfil en mente y completar las conclusiones antes de cerrar la issue #1.
