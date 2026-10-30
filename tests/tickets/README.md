# Tickets de prueba

Tickets y facturas reales para la prueba de lectura (tarea 03, #10). El enunciado exige como mínimo cuatro: uno de gasolinera arrugado, uno de supermercado con varios tipos de IVA, una factura en PDF de una suscripción en inglés y una foto torcida y con poca luz.

| Archivo | Qué es |
|---|---|
| `T1-gasolinera-arrugado.jpg` | Ticket de gasolinera arrugado (E.S. Villaquejida). Foto de baja resolución (367 × 836 píxeles): es la única disponible |
| `T1-alcampo-arrugado.jpg` | Supermercado arrugado. Era el sustituto provisional del de gasolinera; pasa a ser un extra |
| `T2-eroski-varios-iva.jpg` | Supermercado con 3 tipos de IVA |
| `T3-claude-pro-ingles.pdf` | Factura PDF de suscripción en inglés (en euros) |
| `T4-cerveceria-poca-luz.jpg` | Foto con luz difícil y parte tapada |
| `T4b-mercadona-torcida-poca-luz.jpg` | Foto torcida (unos 35 grados) y con poca luz: el caso obligatorio de la prueba de lectura. Supermercado con 3 tipos de IVA. **Trampa:** lleva la marca de la cámara con otra fecha (30/10/2026); la fecha del ticket es el 09/10/2026 |
| `extra-aucalsa-peaje.jpg` | Peaje, IVA incluido sin desglose |
| `extra-carrefour.pdf` | Ticket PDF, un tipo de IVA |
| `extra-druni-catalan.pdf` | Ticket PDF, 2 tipos de IVA, en catalán |
| `extra-mercadona-cerca.jpg` | Supermercado con 3 tipos de IVA (4 %, 10 % y 21 %), foto de cerca |
| `extra-mercadona-lejos.jpg` | El mismo ticket fotografiado de lejos y en ángulo: prueba de duplicado (mismo NIF, número y total) |

**Faltan:**
- Una factura en una moneda distinta del euro (requisito 3).
- Una factura con NIF del receptor (requisito 3).

Los datos personales que no se usan en la prueba están pixelados o tachados. En `T1-gasolinera-arrugado.jpg` se ha pixelado el correo electrónico que aparece en el ticket, y en las fotos de Mercadona, las cuatro últimas cifras de la tarjeta.

**Trampas de la prueba:** algunas fotos llevan impresa la marca de la cámara del móvil, con el modelo y la fecha en que se hizo la foto. Esa fecha no es la del ticket: la IA debe leer la fecha impresa en el ticket. Es un caso real, porque muchos móviles añaden esa marca por defecto.
