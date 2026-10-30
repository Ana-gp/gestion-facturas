# 08 · Modelo de negocio, planes y coste por cliente

Tarea: #3 (orden 08) · Bloque 1 (cuenta y negocio) · Responsable: Javier · Última actualización: 29/10/2026

**Producto:** Ticketon  
**Público inicial:** autónomos que trabajan con una gestoría y necesitan guardar y ordenar tickets y facturas.  
**Estado:** propuesta inicial para el trabajo final del curso. Los precios, costes de infraestructura y márgenes son hipótesis; no son tarifas aprobadas ni demuestran rentabilidad.  
**Dependencias:** #6 (coste de IA, completada) y #7 (funciones adicionales, pendiente de decisión del equipo).

Leyenda: **[Confirmado]** dato respaldado por una fuente o resultado documentado; **[Supuesto]** valor usado provisionalmente sin comprobarlo; **[Propuesta]** decisión sugerida para el MVP; **[Pendiente]** información necesaria antes de decidir.

## 1. Decisión de enfoque

Ticketon no intentará competir como un programa completo de contabilidad o facturación. El MVP se centrará en capturar justificantes, extraer datos, conservar el original, permitir corregirlos y exportar los gastos para la gestoría.

- **Quién paga:** el autónomo que utiliza Ticketon.
- **Unidad de cobro:** suscripción mensual por cuenta, con un límite de documentos procesados. No se recomienda cobrar por usuario en el MVP individual.
- **Propuesta:** reducir el tiempo dedicado a reunir y ordenar justificantes al final del trimestre.
- **Límite funcional:** Ticketon organiza documentos; no determina si un gasto es fiscalmente deducible ni sustituye a la gestoría.

## 2. Propuesta inicial de planes

Estos importes son [Propuesta] de trabajo para contrastar con el público objetivo, los costes reales de infraestructura y la decisión de la issue #7. No se deben publicar como precios definitivos hasta verificar los costes y las condiciones de los proveedores.

| Plan propuesto | Precio orientativo | Límite inicial propuesto | Para quién |
|---|---:|---|---|
| Gratis | 0 €/mes | Hasta 10 documentos procesados al mes | Probar el flujo completo con poco volumen |
| Autónomo | 4,99 €/mes | Hasta 100 documentos procesados al mes | Uso habitual de un autónomo |
| Autónomo Plus | 8,99 €/mes | Hasta 300 documentos procesados al mes | Quien acumula más justificantes y quiere más margen |

**Funciones comunes propuestas para los tres planes:** subida de PDF/imagen, conservación del original, lectura automática, corrección manual y exportación básica. No se propone bloquear la corrección de errores ni la descarga de los documentos propios detrás de un plan de pago.

| Función | Gratis | Autónomo | Autónomo Plus |
|---|---|---|---|
| Límite de documentos procesados al mes | 10 | 100 | 300 |
| Subida y conservación del original | [Propuesta] Sí | [Propuesta] Sí | [Propuesta] Sí |
| Lectura automática y corrección manual | [Propuesta] Sí | [Propuesta] Sí | [Propuesta] Sí |
| Exportación básica para gestoría | [Propuesta] Sí | [Propuesta] Sí | [Propuesta] Sí |
| Funciones adicionales o avanzadas | Por decidir tras #7 | Por decidir tras #7 | Por decidir tras #7 |

Las funciones indicadas son [Propuesta], no funciones implementadas. La tabla debe ajustarse a la decisión de #7 y a lo que funcione en la aplicación. No se propone todavía un plan para gestorías: requeriría permisos multiusuario, separación por clientes y un modelo de datos más complejo.

## 3. Coste conocido de lectura con IA

La prueba de concepto documentada en [`docs/prueba-ia.md`](prueba-ia.md) estimó un coste medio de **0,00083 € por documento** con Gemini 3.5 Flash Lite, usando los cuatro documentos probados y los precios consultados el 29/10/2026. Es una estimación pequeña y basada en una muestra limitada; puede cambiar con el modelo, los tokens, el tipo de documento y las tarifas del proveedor.

| Volumen mensual | Coste estimado de IA |
|---:|---:|
| 10 documentos | 0,0083 € |
| 100 documentos | 0,083 € |
| 300 documentos | 0,249 € |
| 1.000 documentos | 0,83 € |

La tabla solo refleja la lectura de IA. **No es el coste total por cliente ni demuestra por sí sola que los planes sean rentables.**

## 4. Estimación de servidor y costes operativos [Pendiente]

El coste de IA calculado en el apartado 3 no incluye hosting ni almacenamiento. El plan Vercel Hobby se reserva a la demo académica y no es una base válida para un servicio comercial de pago. Para una estimación comercial hay que usar precios vigentes de planes que permitan uso comercial, confirmar consumo y dividir el coste mensual entre clientes activos.

| Escenario ilustrativo (no presupuesto) | Vercel | Supabase | Coste fijo mensual conjunto antes de correo, IA, pagos, soporte e impuestos |
|---|---|---|---|
| MVP comercial mínimo | [Confirmado] Vercel Pro: 20 USD/mes de cuota de plataforma, incluye una plaza de despliegue y 20 USD de crédito de uso | [Confirmado] Supabase Pro: desde 25 USD/mes; incluye crédito de cómputo suficiente para un proyecto Micro y cuotas incluidas | **45 USD/mes de base** antes de consumos adicionales, correo, IA, pagos, soporte e impuestos |
| Reparto ilustrativo del fijo | 10 clientes activos: 4,50 USD/cliente/mes; 50: 0,90 USD; 100: 0,45 USD | Mismo proyecto y plan base; no incluye costes variables | Solo reparto aritmético del fijo de 45 USD; no es un coste total por cliente ni una previsión de demanda |
| Crecimiento | [Pendiente] estimar funciones/transferencia y posibles plazas de despliegue adicionales | [Pendiente] estimar almacenamiento, transferencia, copias y tamaño de cómputo | No calculado; depende del uso y de recursos adicionales |

Las cifras anteriores son una estimación base, no un presupuesto final. Para comparar con los planes expresados en euros, se usa como **[Supuesto]** el tipo de referencia del BCE de 1 EUR = 1,1133 USD documentado en `docs/prueba-ia.md` (consulta de prueba del 29/10/2026): 45 USD equivalen aproximadamente a 40,42 €. El cambio real puede variar y deben comprobarse el tipo aplicable y las comisiones al contratar. Vercel indica que Pro se factura con una cuota de 20 USD/mes e incluye 20 USD de crédito de uso; Supabase Pro parte de 25 USD/mes. El coste real puede superar los 45 USD si se exceden las cuotas, se añaden plazas/servicios o se requiere más cómputo. Fuentes oficiales consultadas el 29/10/2026: [Vercel Pro](https://vercel.com/docs/plans/pro-plan) y [precios de Supabase](https://supabase.com/pricing).

Fórmula para el coste fijo por cliente: coste fijo mensual / clientes activos. Después se deben sumar costes variables por IA, correo, almacenamiento/transferencia excedidos, pagos, soporte, mantenimiento e impuestos.

**Punto de equilibrio ilustrativo [Supuesto]:** si el plan Autónomo cuesta 4,99 €/mes con IVA del 21 % incluido, la base antes de IVA es aproximadamente 4,12 €. Dividiendo el coste fijo estimado de 40,42 €/mes entre 4,12 €, hacen falta **10 clientes de pago** para cubrir únicamente ese coste fijo (9,81, redondeado hacia arriba). No incluye IA, correo, pagos, soporte, mantenimiento, otros impuestos ni posibles sobrecostes de infraestructura; por tanto, no es el punto de equilibrio comercial completo.

**Punto de equilibrio ilustrativo [Supuesto]:** si el plan Autónomo cuesta 4,99 €/mes con IVA del 21 % incluido, la base antes de IVA es aproximadamente 4,12 €. Dividiendo el coste fijo estimado de 40,42 €/mes entre 4,12 €, hacen falta **10 clientes de pago** para cubrir únicamente ese coste fijo (9,81, redondeado hacia arriba). No incluye IA, correo, pagos, soporte, mantenimiento, otros impuestos ni posibles sobrecostes de infraestructura; por tanto, no es el punto de equilibrio comercial completo.

| Partida | Situación | Acción necesaria |
|---|---|---|
| Lectura con IA | Estimada en la prueba de concepto | Revisar precios y consumo antes de la entrega y antes de un lanzamiento |
| Hosting | [Confirmado] La propuesta usa Vercel Hobby solo para la demo académica, no para vender suscripciones | [Pendiente] verificar tarifa comercial vigente de Vercel Pro u otra alternativa, región y consumo estimado |
| Base de datos y originales | [Propuesta] Supabase Free para la demo; tiene límites y puede pausarse tras una semana sin uso | [Pendiente] verificar el coste del plan comercial y estimar almacenamiento/transferencia con un volumen explícito |
| Correo entrante y recuperación | Resend propuesto para entrada; SMTP de recuperación pendiente de validar | Probar el flujo y confirmar cuotas, condiciones, dominio y coste |
| Tipo de cambio | Se propone utilizar referencias del BCE | Verificar que la consulta y el tratamiento de días sin publicación funcionan sin servicios de pago |
| Pagos y comisiones | No implementados | No añadir pagos al MVP hasta decidir si realmente se va a vender el servicio |
| Soporte, mantenimiento e impuestos | No cuantificados | Reconocerlos como costes de operación en cualquier cálculo comercial |

El plan gratuito de hosting puede servir para el trabajo académico según las condiciones aplicables, pero no debe usarse como fundamento de un negocio de pago si el proveedor lo prohíbe. El producto no se debe lanzar comercialmente hasta confirmar el coste y las condiciones de todos los servicios, en especial el procesamiento de documentos con datos personales.

## 5. ¿Tienen sentido los precios propuestos?

Los precios de 4,99 € y 8,99 € son **[Supuesto]** valores provisionales, no resultados de una investigación de disposición a pagar. Quipu es una referencia cercana: su página oficial consultada el 29/10/2026 muestra precios ordinarios de 17 €, 30 € y 59 €/mes, con 30, 250 y 350 lecturas mensuales respectivamente; la promoción del 50 % durante tres meses no es la tarifa ordinaria. Sus planes y alcance no son equivalentes a Ticketon, por lo que la comparación orienta pero no justifica por sí sola nuestros precios. Fuente: [precios de Quipu](https://getquipu.com/es/plan-de-precios).

La lectura con IA sería solo una parte del coste a esos volúmenes; los gastos fijos de hosting, base de datos, correo, soporte, mantenimiento, pagos e impuestos son necesarios para calcular margen. Por ahora no hay base para afirmar que 4,99 € u 8,99 € sean rentables.

Antes de aprobarlos como tarifas:
1. Confirmar el alcance final de #7.
2. Registrar las tarifas oficiales de un hosting comercial y base de datos que permitan el uso previsto.
3. Definir escenarios de 10, 100 y 300 documentos por cuenta, y varios niveles de clientes activos; calcular coste fijo repartido y costes variables.
4. Elegir el sistema de cobro solo cuando se decida implementar pagos. [Pendiente] valorar Stripe u otro proveedor, sus comisiones y sus condiciones.
5. Decidir si habrá solo mensualidad o también anualidad. [Propuesta] mantener mensualidad en el MVP para reducir complejidad; no anunciar descuento anual hasta calcularlo.
6. Decidir si los precios se muestran con IVA incluido. [Propuesta] para una oferta B2C en España, mostrar el total final con impuestos aplicables y explicar el tratamiento fiscal antes de contratar; validar con asesoría antes de lanzamiento.
7. Contrastar con al menos un autónomo si pagaría por resolver este problema y qué volumen tendría.
8. Revisar de nuevo los precios de competidores; cambian y los planes no siempre son comparables.

## 6. Captación y validación

- Empezar con una versión gratuita limitada para demostrar el flujo completo.
- Validar el uso con unos pocos autónomos y observar si realmente suben los documentos de forma continuada.
- Medir tiempo de captura, correcciones necesarias, documentos procesados y exportaciones realizadas.
- No gastar en publicidad ni prometer ahorro fiscal antes de comprobar que el producto resuelve el problema.

## 7. Decisiones para el trabajo final del curso

- **Modelo elegido provisionalmente:** suscripción mensual por cuenta individual.
- **Precios:** 4,99 €/mes y 8,99 €/mes como hipótesis que deben validarse.
- **Plan gratuito:** sí, limitado a 10 documentos al mes como propuesta inicial.
- **Coste de IA:** usar 0,00083 €/documento como referencia experimental, no como coste garantizado.
- **Gestorías y equipos:** fuera del alcance inicial.
- **Lanzamiento comercial:** no confirmado; requiere revisar hosting comercial, proveedores, privacidad, costes completos y condiciones contractuales.

## 8. Fuentes internas del proyecto

- [Prueba de concepto de lectura con IA](prueba-ia.md): mediciones y tarifas consultadas el 29/10/2026.
- [Estudio de competencia](competencia.md): precios publicados consultados el 29/10/2026; comprobarlos antes de tomar decisiones.
- [Arquitectura propuesta](arquitectura.md): servicios, regiones, límites y cuestiones pendientes.
- Issue #7: decisión de funciones adicionales, pendiente del equipo.
