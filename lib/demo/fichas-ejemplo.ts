/**
 * Fichas de ejemplo para la pantalla "Revisar y corregir" (P10) mientras no
 * estén conectadas la subida (#14/#15), Supabase (#18) y la lectura con IA (#19).
 *
 * Los datos son lo que devolvió Gemini de verdad en la prueba de IA (#6,
 * `tests/resultados-ia/`), con sus fallos, para que se vea qué tiene que
 * corregir el usuario:
 * - T1: la IA cambió una letra del emisor ("VILLIQUEJIDA" en lugar de "Villaquejida").
 * - T4b: la IA dejó vacío el NIF del emisor porque en la foto apenas se lee.
 * - Bodega Aurrera: todavía sin pasar por Gemini; se usan los valores reales
 *   (PR #62). Está en pesos mexicanos y falta el tipo de cambio, y las cuentas
 *   no cuadran porque el ticket no imprime la base al 0 % ni cuenta el IEPS.
 */

import type { CamposRevision, DatosRevision } from "../revision/comprobaciones";

export type FichaEjemplo = {
  id: string;
  tipoDocumento: "factura" | "ticket";
  nombreArchivo: string;
  /** Ruta pública de la imagen o del PDF original. */
  original: string;
  datos: DatosRevision;
  /** Confianza que da la IA a cada campo (columna `campos_revision`). */
  revisionIa: CamposRevision;
  posibleDuplicado: boolean;
};

export const CATEGORIAS = [
  "Combustible y transporte",
  "Alimentación",
  "Restauración y dietas",
  "Software y suscripciones",
  "Telefonía e internet",
  "Material de oficina",
  "Suministros",
  "Alojamiento y viajes",
  "Formación",
  "Otros",
];

export const FICHAS_EJEMPLO: FichaEjemplo[] = [
  {
    id: "t4b",
    tipoDocumento: "ticket",
    nombreArchivo: "T4b-mercadona-torcida-poca-luz.jpg",
    original: "/ejemplos/T4b-mercadona-torcida-poca-luz.jpg",
    datos: {
      fecha: "2026-10-09",
      emisorNombre: "MERCADONA S.A.",
      emisorNif: null,
      receptorNif: null,
      numero: "2939-017-128100",
      categoria: "Alimentación",
      moneda: "EUR",
      total: 56.53,
      totalEur: 56.53,
      tipoCambio: null,
      retencionImporte: null,
      lineas: [
        { tipoIva: 4, base: 10.66, cuota: 0.43 },
        { tipoIva: 10, base: 29.95, cuota: 2.99 },
        { tipoIva: 21, base: 10.33, cuota: 2.17 },
      ],
    },
    revisionIa: {},
    posibleDuplicado: true,
  },
  {
    id: "t1",
    tipoDocumento: "ticket",
    nombreArchivo: "T1-gasolinera-arrugado.jpg",
    original: "/ejemplos/T1-gasolinera-arrugado.jpg",
    datos: {
      fecha: "2026-03-07",
      emisorNombre: "E.S. VILLIQUEJIDA - SUTECAL",
      emisorNif: "B49268071",
      receptorNif: null,
      numero: "2023018651",
      categoria: "Combustible y transporte",
      moneda: "EUR",
      total: 106.74,
      totalEur: 106.74,
      tipoCambio: null,
      retencionImporte: null,
      lineas: [{ tipoIva: 21, base: 88.21, cuota: 18.53 }],
    },
    // El emisor tiene una letra mal pero parece correcto: ninguna regla lo marca.
    // Es el caso para el que sirve ver la foto junto a los datos.
    revisionIa: {},
    posibleDuplicado: false,
  },
  {
    id: "e5",
    tipoDocumento: "ticket",
    nombreArchivo: "extra-bodega-aurrera-mxn.jpg",
    original: "/ejemplos/extra-bodega-aurrera-mxn.jpg",
    datos: {
      fecha: "2024-01-06",
      emisorNombre: "Nueva Wal Mart de México S. de R.L. de C.V.",
      emisorNif: "NWM9709244W4",
      receptorNif: null,
      numero: "01976",
      categoria: "Alimentación",
      moneda: "MXN",
      total: 635.02,
      totalEur: null,
      tipoCambio: null,
      retencionImporte: null,
      lineas: [{ tipoIva: 8, base: 323.62, cuota: 25.89 }],
    },
    revisionIa: {},
    posibleDuplicado: false,
  },
];
