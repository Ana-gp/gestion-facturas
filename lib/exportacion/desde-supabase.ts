/**
 * Exportar con datos reales (#23): las facturas del usuario leídas de
 * Supabase, con la forma que necesita lib/exportacion/excel.ts.
 *
 * Con la sesión del usuario (RLS): solo salen sus facturas. Se exportan
 * también las pendientes de revisar, con su estado (DP6 del mapa de
 * pantallas), y el posible duplicado cuenta como aviso mientras no se haya
 * descartado (#22).
 */

import type { FacturaExportable } from "./excel";

export type PlanExportacion = "gratis" | "autonomo" | "plus";

/** Columnas de cada factura, con sus líneas, su categoría y el nombre del original. */
export const CONSULTA_EXPORTACION =
  "id, tipo_documento, fecha, numero, emisor_nombre, emisor_nif, receptor_nif, moneda, total, total_eur, " +
  "tipo_cambio, tipo_cambio_fecha, retencion_importe, estado_revision, posible_duplicado_de, duplicado_descartado, " +
  "categorias(nombre), lineas_iva(orden, tipo_iva, base, cuota), documentos(nombre_archivo)";

type Uno<T> = T | T[] | null;

export type FilaExportacion = {
  id: string;
  tipo_documento: string;
  fecha: string | null;
  numero: string | null;
  emisor_nombre: string | null;
  emisor_nif: string | null;
  receptor_nif: string | null;
  moneda: string;
  total: number | string | null;
  total_eur: number | string | null;
  tipo_cambio: number | string | null;
  tipo_cambio_fecha: string | null;
  retencion_importe: number | string | null;
  estado_revision: string;
  posible_duplicado_de: string | null;
  duplicado_descartado: boolean;
  categorias: Uno<{ nombre: string }>;
  lineas_iva: { orden: number; tipo_iva: number | string; base: number | string | null; cuota: number | string | null }[] | null;
  documentos: Uno<{ nombre_archivo: string | null }>;
};

function uno<T>(valor: Uno<T> | undefined): T | null {
  if (Array.isArray(valor)) return valor[0] ?? null;
  return valor ?? null;
}

function numero(valor: number | string | null | undefined): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

export function facturasDesdeSupabase(filas: FilaExportacion[]): FacturaExportable[] {
  return filas.map((f) => ({
    id: f.id,
    fecha: f.fecha,
    tipoDocumento: f.tipo_documento === "factura" ? "factura" : "ticket",
    numero: f.numero,
    emisorNombre: f.emisor_nombre,
    emisorNif: f.emisor_nif,
    receptorNif: f.receptor_nif,
    categoria: uno(f.categorias)?.nombre ?? null,
    moneda: f.moneda,
    total: numero(f.total),
    totalEur: numero(f.total_eur),
    tipoCambio: numero(f.tipo_cambio),
    tipoCambioFecha: f.tipo_cambio_fecha,
    retencionImporte: numero(f.retencion_importe),
    estadoRevision: f.estado_revision === "revisada" ? "revisada" : "pendiente",
    posibleDuplicado: Boolean(f.posible_duplicado_de) && !f.duplicado_descartado,
    nombreArchivo: uno(f.documentos)?.nombre_archivo || "original",
    lineas: [...(f.lineas_iva ?? [])]
      .sort((a, b) => a.orden - b.orden)
      .map((l) => ({ tipoIva: numero(l.tipo_iva) ?? 0, base: numero(l.base) ?? 0, cuota: numero(l.cuota) ?? 0 })),
  }));
}

/** `planes.id` de la base de datos ('gratis', 'autonomo', 'autonomo_plus') al plan de la pantalla. */
export function planDesdeId(planId: string | null | undefined): PlanExportacion {
  if (planId === "autonomo") return "autonomo";
  if (planId === "autonomo_plus") return "plus";
  return "gratis";
}

/** La suscripción vigente hoy: empezada y sin terminar. Si hay varias, la más reciente. */
export function planVigente(suscripciones: { plan_id: string; desde: string; hasta: string | null }[], hoy: string): PlanExportacion {
  const vigentes = suscripciones.filter((s) => s.desde <= hoy && (s.hasta === null || s.hasta >= hoy)).sort((a, b) => b.desde.localeCompare(a.desde));
  return planDesdeId(vigentes[0]?.plan_id);
}
