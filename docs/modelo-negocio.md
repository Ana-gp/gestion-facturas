# 08 · Modelo de negocio, planes y coste por cliente

**Producto:** Ticketon  
**Público inicial:** autónomos que trabajan con una gestoría y necesitan guardar y ordenar tickets y facturas.  
**Estado:** propuesta inicial para el TFG. Los precios son hipótesis de trabajo, no tarifas aprobadas ni una garantía de rentabilidad.  
**Dependencias:** #6 (coste de IA, completada) y #7 (funciones adicionales, pendiente de decisión del equipo).

## 1. Decisión de enfoque

Ticketon no intentará competir como un programa completo de contabilidad o facturación. El MVP se centrará en capturar justificantes, extraer datos, conservar el original, permitir corregirlos y exportar los gastos para la gestoría.

- **Quién paga:** el autónomo que utiliza Ticketon.
- **Unidad de cobro:** suscripción mensual por cuenta, con un límite de documentos procesados. No se recomienda cobrar por usuario en el MVP individual.
- **Propuesta:** reducir el tiempo dedicado a reunir y ordenar justificantes al final del trimestre.
- **Límite funcional:** Ticketon organiza documentos; no determina si un gasto es fiscalmente deducible ni sustituye a la gestoría.

## 2. Propuesta inicial de planes

Estos importes son hipótesis para contrastar con el público objetivo, los costes reales de infraestructura y la decisión de la issue #7. No se deben publicar como precios definitivos hasta verificar los costes y las condiciones de los proveedores.

| Plan propuesto | Precio orientativo | Límite inicial propuesto | Para quién |
|---|---:|---|---|
| Gratis | 0 €/mes | Hasta 10 documentos procesados al mes | Probar el flujo completo con poco volumen |
| Autónomo | 4,99 €/mes | Hasta 100 documentos procesados al mes | Uso habitual de un autónomo |
| Autónomo Plus | 8,99 €/mes | Hasta 300 documentos procesados al mes | Quien acumula más justificantes y quiere más margen |

**Funciones comunes prioritarias:** subir PDF o imagen, guardar el original, lectura automática, corrección manual y exportación básica. No se propone bloquear la corrección de errores ni la descarga de los documentos propios detrás de un plan de pago.

Los límites y las funciones extra deben revisarse cuando el equipo cierre #7. No se propone todavía un plan para gestorías: requeriría permisos multiusuario, separación por clientes y un modelo de datos más complejo.

## 3. Coste conocido de lectura con IA

La prueba de concepto documentada en [`docs/prueba-ia.md`](prueba-ia.md) estimó un coste medio de **0,00083 € por documento** con Gemini 3.5 Flash Lite, usando los cuatro documentos probados y los precios consultados el 29/10/2026. Es una estimación pequeña y basada en una muestra limitada; puede cambiar con el modelo, los tokens, el tipo de documento y las tarifas del proveedor.

| Volumen mensual | Coste estimado de IA |
|---:|---:|
| 10 documentos | 0,0083 € |
| 100 documentos | 0,083 € |
| 300 documentos | 0,249 € |
| 1.000 documentos | 0,83 € |

La tabla solo refleja la lectura de IA. **No es el coste total por cliente ni demuestra por sí sola que los planes sean rentables.**

## 4. Costes que aún faltan

| Partida | Situación | Acción necesaria |
|---|---|---|
| Lectura con IA | Estimada en la prueba de concepto | Revisar precios y consumo antes de la entrega y antes de un lanzamiento |
| Hosting | La propuesta actual usa Vercel Hobby, solo para uso personal/no comercial | Para vender suscripciones, valorar un plan comercial o un proveedor alternativo y calcular el coste mensual real |
| Base de datos y originales | Propuesta de Supabase Free; tiene límites y puede pausarse tras una semana sin uso | Medir almacenamiento y transferencia con documentos de prueba y calcular cuándo se necesitaría un plan de pago |
| Correo entrante y recuperación | Resend propuesto para entrada; SMTP de recuperación pendiente de validar | Probar el flujo y confirmar cuotas, condiciones, dominio y coste |
| Tipo de cambio | Se propone utilizar referencias del BCE | Verificar que la consulta y el tratamiento de días sin publicación funcionan sin servicios de pago |
| Pagos y comisiones | No implementados | No añadir pagos al MVP hasta decidir si realmente se va a vender el servicio |
| Soporte, mantenimiento e impuestos | No cuantificados | Reconocerlos como costes de operación en cualquier cálculo comercial |

El plan gratuito de hosting puede servir para el trabajo académico según las condiciones aplicables, pero no debe usarse como fundamento de un negocio de pago si el proveedor lo prohíbe. El producto no se debe lanzar comercialmente hasta confirmar el coste y las condiciones de todos los servicios, en especial el procesamiento de documentos con datos personales.

## 5. ¿Tienen sentido los precios propuestos?

Los precios de 4,99 € y 8,99 € son **hipótesis comerciales**, no resultados de una investigación de disposición a pagar. La lectura con IA sería solo una parte muy pequeña del coste a esos volúmenes; los gastos fijos de hosting, base de datos, correo, soporte, mantenimiento, pagos e impuestos son más relevantes para saber si el modelo se sostiene.

Antes de aprobarlos como tarifas:
1. Confirmar el alcance final de #7.
2. Obtener una estimación mensual realista de hosting, almacenamiento y correo para el MVP.
3. Calcular el coste total para 10, 100 y 300 documentos por cuenta.
4. Contrastar con al menos un autónomo si pagaría por resolver este problema y qué volumen tendría.
5. Revisar de nuevo los precios de competidores; cambian y los planes no siempre son comparables.

## 6. Captación y validación

- Empezar con una versión gratuita limitada para demostrar el flujo completo.
- Validar el uso con unos pocos autónomos y observar si realmente suben los documentos de forma continuada.
- Medir tiempo de captura, correcciones necesarias, documentos procesados y exportaciones realizadas.
- No gastar en publicidad ni prometer ahorro fiscal antes de comprobar que el producto resuelve el problema.

## 7. Decisiones para el TFG

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
