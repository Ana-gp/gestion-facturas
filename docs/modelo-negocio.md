# 08 · Modelo de negocio, planes y coste por cliente

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
| Subida y conservación del original | Propuesta: sí | Propuesta: sí | Propuesta: sí |
| Lectura automática y corrección manual | Propuesta: sí | Propuesta: sí | Propuesta: sí |
| Exportación básica para gestoría | Propuesta: sí | Propuesta: sí | Propuesta: sí |
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
| MVP comercial mínimo | [Pendiente] verificar plan comercial y precio vigente | [Pendiente] verificar plan y recursos necesarios | No calculado: faltan precios confirmados y medición de uso |
| Crecimiento | [Pendiente] estimar funciones/transferencia | [Pendiente] estimar base de datos, almacenamiento y transferencia | No calculado |

No voy a inventar un coste de servidor ni repartirlo por cliente sin una base verificable. Para cerrar esta parte hay que registrar las tarifas oficiales vigentes, especificar el escenario de uso y mostrar la fórmula: coste fijo mensual / clientes activos, más costes variables por cliente.

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

Los precios de 4,99 € y 8,99 € son [Supuesto] hipótesis comerciales, no resultados de una investigación de disposición a pagar. Quipu es una referencia cercana: el estudio de competencia recoge precios ordinarios publicados de 17 €, 30 € y 59 €/mes, con 30, 250 y 350 lecturas mensuales respectivamente; sus planes y alcance no son equivalentes a Ticketon, por lo que la comparación orienta pero no justifica por sí sola nuestros precios.

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
