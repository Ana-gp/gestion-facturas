/**
 * Gastos de ejemplo para enseñar las pantallas mientras no estén conectados
 * Supabase (#18) y la lectura con IA (#19).
 *
 * Son los tickets reales de `tests/tickets/` con sus valores reales
 * (`docs/valores-reales-tickets.xlsx`). El estado de revisión y los avisos de
 * T4b y del ticket de Bodega Aurrera se han puesto a propósito, para que se
 * vean los avisos en la pantalla. Las dos fotos del mismo ticket de Mercadona
 * (cerca y lejos) son el posible duplicado.
 *
 * Cuando exista la tabla `facturas`, las pantallas leerán de ahí y este
 * archivo solo se usará en las demos y en las pruebas.
 */

import type { FacturaExportable } from "../exportacion/excel";

function gasto(datos: Partial<FacturaExportable> & Pick<FacturaExportable, "id" | "fecha" | "emisorNombre" | "total" | "lineas" | "nombreArchivo">): FacturaExportable {
  const moneda = datos.moneda ?? "EUR";
  return {
    tipoDocumento: "ticket",
    numero: null,
    emisorNif: null,
    receptorNif: null,
    categoria: null,
    tipoCambio: null,
    tipoCambioFecha: null,
    retencionImporte: null,
    estadoRevision: "revisada",
    posibleDuplicado: false,
    ...datos,
    moneda,
    totalEur: moneda === "EUR" ? datos.total : (datos.totalEur ?? null),
  };
}

export const GASTOS_EJEMPLO: FacturaExportable[] = [
  gasto({ id: "t2", fecha: "2025-09-02", numero: "132740032509026056", emisorNombre: "Vego Supermercados S.A.U.", emisorNif: "A36651313", categoria: "Alimentación", total: 115.2, nombreArchivo: "T2-eroski-varios-iva.jpg",
    lineas: [{ tipoIva: 10, base: 44.58, cuota: 4.46 }, { tipoIva: 21, base: 10.29, cuota: 2.16 }, { tipoIva: 4, base: 51.64, cuota: 2.07 }] }),
  gasto({ id: "t1", fecha: "2026-03-07", numero: "2023018651", emisorNombre: "E.S. Villaquejida - Sutecal", emisorNif: "B49268071", categoria: "Combustible y transporte", total: 106.74, nombreArchivo: "T1-gasolinera-arrugado.jpg",
    lineas: [{ tipoIva: 21, base: 88.21, cuota: 18.53 }] }),
  gasto({ id: "e3", fecha: "2026-06-25", numero: "20832606010734", emisorNombre: "DRUNI, S.A.", emisorNif: "A46581666", categoria: "Otros", total: 28.89, nombreArchivo: "extra-druni-catalan.pdf",
    lineas: [{ tipoIva: 21, base: 17.28, cuota: 3.63 }, { tipoIva: 4, base: 7.67, cuota: 0.31 }] }),
  gasto({ id: "t4", fecha: "2026-08-29", numero: "1 / 388087", emisorNombre: "Cerveceria Celtica S.L.", emisorNif: "B24610297", categoria: "Restauración y dietas", total: 21, nombreArchivo: "T4-cerveceria-poca-luz.jpg",
    lineas: [{ tipoIva: 10, base: 19.09, cuota: 1.91 }] }),
  gasto({ id: "e4", fecha: "2026-09-08", emisorNombre: "Alcampo Santa Nonia", categoria: "Alimentación", total: 5.79, nombreArchivo: "T1-alcampo-arrugado.jpg",
    lineas: [{ tipoIva: 4, base: 4.05, cuota: 0.15 }, { tipoIva: 21, base: 1.31, cuota: 0.28 }] }),
  gasto({ id: "t4b", fecha: "2026-10-09", numero: "2939-017-128100", emisorNombre: "Mercadona, S.A.", emisorNif: "A46103834", categoria: "Alimentación", total: 56.53, nombreArchivo: "T4b-mercadona-torcida-poca-luz.jpg",
    estadoRevision: "pendiente",
    lineas: [{ tipoIva: 4, base: 10.66, cuota: 0.43 }, { tipoIva: 10, base: 29.95, cuota: 2.99 }, { tipoIva: 21, base: 10.33, cuota: 2.17 }] }),
  gasto({ id: "t3", fecha: "2026-10-14", tipoDocumento: "factura", numero: "9BF0758D-8771996", emisorNombre: "Anthropic Ireland, Limited", emisorNif: "IE4276970QH", categoria: "Software y suscripciones", total: 21.78, nombreArchivo: "T3-claude-pro-ingles.pdf",
    lineas: [{ tipoIva: 21, base: 18, cuota: 3.78 }] }),
  gasto({ id: "e2", fecha: "2026-10-19", numero: "N0020008261019000107", emisorNombre: "Centros Comerciales Carrefour S.A.", emisorNif: "A28425270", categoria: "Otros", total: 9.99, nombreArchivo: "extra-carrefour.pdf",
    lineas: [{ tipoIva: 21, base: 8.26, cuota: 1.73 }] }),
  gasto({ id: "mc", fecha: "2026-10-23", numero: "2939-015-397739", emisorNombre: "Mercadona, S.A.", emisorNif: "A46103834", categoria: "Alimentación", total: 13.1, nombreArchivo: "extra-mercadona-cerca.jpg",
    lineas: [{ tipoIva: 4, base: 6.37, cuota: 0.25 }, { tipoIva: 10, base: 5.75, cuota: 0.58 }, { tipoIva: 21, base: 0.12, cuota: 0.03 }] }),
  gasto({ id: "ml", fecha: "2026-10-23", numero: "2939-015-397739", emisorNombre: "Mercadona, S.A.", emisorNif: "A46103834", categoria: "Alimentación", total: 13.1, nombreArchivo: "extra-mercadona-lejos.jpg",
    estadoRevision: "pendiente", posibleDuplicado: true,
    lineas: [{ tipoIva: 4, base: 6.37, cuota: 0.25 }, { tipoIva: 10, base: 5.75, cuota: 0.58 }, { tipoIva: 21, base: 0.12, cuota: 0.03 }] }),
  gasto({ id: "e1", fecha: "2026-10-25", emisorNombre: "AUCALSA", emisorNif: "A28415784", categoria: "Combustible y transporte", total: 10.2, nombreArchivo: "extra-aucalsa-peaje.jpg",
    lineas: [{ tipoIva: 21, base: 8.43, cuota: 1.77 }] }),
  gasto({ id: "e5", fecha: "2024-01-06", numero: "01976", emisorNombre: "Nueva Wal Mart de México S. de R.L. de C.V.", emisorNif: "NWM9709244W4", categoria: "Alimentación", total: 635.02, moneda: "MXN", nombreArchivo: "extra-bodega-aurrera-mxn.jpg",
    estadoRevision: "pendiente",
    lineas: [{ tipoIva: 8, base: 323.62, cuota: 25.89 }] }),
];
