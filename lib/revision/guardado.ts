/**
 * Revisar y corregir con datos reales (#21): leer una factura de Supabase para
 * la pantalla P10 y preparar lo que se guarda al corregirla.
 *
 * Todo pasa con la sesión del usuario (clave publicable): las reglas RLS de
 * `facturas` y `lineas_iva` (docs/modelo-datos.sql, apartado 4) solo le dejan
 * leer y cambiar lo suyo, y solo las columnas que puede corregir (no
 * `datos_ia` ni `posible_duplicado_de`).
 *
 * Las reglas de aquí repiten los CHECK de la tabla `facturas`, para avisar en
 * la pantalla antes de que la base de datos rechace el cambio:
 * - En euros no hay tipo de cambio y total_eur = total.
 * - En otra moneda, total_eur = round(total / tipo_cambio, 2), o vacío si
 *   falta el tipo (conversión pendiente). Con tipo, también su fecha y fuente.
 * - Para marcarla como revisada hacen falta fecha, emisor, total, total en
 *   euros y categoría (faltaParaRevisada en comprobaciones.ts).
 */

import type { CamposRevision, DatosRevision, LineaIva } from "./comprobaciones";
import { faltaParaRevisada } from "./comprobaciones.ts";
import { totalEnEuros, type FuenteTipoCambio } from "../moneda/conversion.ts";

/** Lo que necesita la pantalla P10 de una factura. Las fichas de ejemplo tienen la misma forma. */
export type FichaRevision = {
  id: string;
  tipoDocumento: "factura" | "ticket";
  nombreArchivo: string;
  /** Dirección del original: ruta pública (ejemplo) o enlace firmado (real). */
  original: string;
  /** Tipo del original, para saber si es PDF. */
  tipoOriginal?: string;
  datos: DatosRevision;
  revisionIa: CamposRevision;
  posibleDuplicadoDe: string | null;
  /** Id del documento (tabla `documentos`). Null en las fichas de ejemplo. */
  documentoId?: string | null;
  /** Fecha y fuente del tipo de cambio guardado, si lo hay. */
  origenTipo?: { fecha: string | null; fuente: FuenteTipoCambio } | null;
  estadoRevision?: "pendiente" | "revisada";
  /** SHA-256 del original (`documentos.huella_sha256`), para explicar un duplicado. */
  huella?: string | null;
  /** Cuándo se subió el original (`documentos.subido_en`): referencia del aviso de día y mes cruzados. */
  subidoEn?: string | null;
};

export type OrigenTipo = { fecha: string | null; fuente: FuenteTipoCambio } | null;

// ---------------------------------------------------------------------------
// Leer
// ---------------------------------------------------------------------------

/** Columnas de la factura que necesita la pantalla, con sus líneas, su categoría y su documento. */
export const CONSULTA_FICHA =
  "id, documento_id, tipo_documento, fecha, emisor_nombre, emisor_nif, receptor_nif, numero, " +
  "retencion_importe, total, moneda, tipo_cambio, tipo_cambio_fecha, tipo_cambio_fuente, total_eur, " +
  "estado_revision, campos_revision, posible_duplicado_de, duplicado_descartado, " +
  "categorias(nombre), lineas_iva(orden, tipo_iva, base, cuota), documentos(nombre_archivo, tipo_mime, huella_sha256, subido_en)";

export type FilaFicha = {
  id: string;
  documento_id: string;
  tipo_documento: string;
  fecha: string | null;
  emisor_nombre: string | null;
  emisor_nif: string | null;
  receptor_nif: string | null;
  numero: string | null;
  retencion_importe: number | string | null;
  total: number | string | null;
  moneda: string;
  tipo_cambio: number | string | null;
  tipo_cambio_fecha: string | null;
  tipo_cambio_fuente: string | null;
  total_eur: number | string | null;
  estado_revision: string;
  campos_revision: CamposRevision | null;
  posible_duplicado_de: string | null;
  duplicado_descartado: boolean;
  categorias: { nombre: string } | { nombre: string }[] | null;
  lineas_iva: { orden: number; tipo_iva: number | string; base: number | string | null; cuota: number | string | null }[] | null;
  documentos: DocumentoDeLaFicha | DocumentoDeLaFicha[] | null;
};

type DocumentoDeLaFicha = { nombre_archivo: string | null; tipo_mime: string; huella_sha256?: string | null; subido_en?: string | null };

function uno<T>(valor: T | T[] | null | undefined): T | null {
  if (Array.isArray(valor)) return valor[0] ?? null;
  return valor ?? null;
}

function numero(valor: number | string | null | undefined): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

/** La fila de Supabase como ficha de la pantalla. `original` es el enlace firmado del archivo. */
export function fichaDesdeFila(f: FilaFicha, original: string): FichaRevision {
  const doc = uno(f.documentos);
  const lineas: LineaIva[] = [...(f.lineas_iva ?? [])]
    .sort((a, b) => a.orden - b.orden)
    .map((l) => ({ tipoIva: numero(l.tipo_iva) ?? 0, base: numero(l.base) ?? 0, cuota: numero(l.cuota) ?? 0 }));
  const fuente = f.tipo_cambio_fuente === "BDE" || f.tipo_cambio_fuente === "manual" ? f.tipo_cambio_fuente : null;
  return {
    id: f.id,
    documentoId: f.documento_id,
    tipoDocumento: f.tipo_documento === "factura" ? "factura" : "ticket",
    nombreArchivo: doc?.nombre_archivo || "original",
    original,
    tipoOriginal: doc?.tipo_mime,
    datos: {
      fecha: f.fecha,
      emisorNombre: f.emisor_nombre,
      emisorNif: f.emisor_nif,
      receptorNif: f.receptor_nif,
      numero: f.numero,
      categoria: uno(f.categorias)?.nombre ?? null,
      moneda: f.moneda,
      total: numero(f.total),
      totalEur: numero(f.total_eur),
      tipoCambio: numero(f.tipo_cambio),
      retencionImporte: numero(f.retencion_importe),
      lineas,
    },
    revisionIa: f.campos_revision ?? {},
    posibleDuplicadoDe: f.posible_duplicado_de && !f.duplicado_descartado ? f.posible_duplicado_de : null,
    origenTipo: fuente && numero(f.tipo_cambio) ? { fecha: f.tipo_cambio_fecha, fuente } : null,
    estadoRevision: f.estado_revision === "revisada" ? "revisada" : "pendiente",
    huella: doc?.huella_sha256 ?? null,
    subidoEn: doc?.subido_en ?? null,
  };
}

// ---------------------------------------------------------------------------
// Guardar
// ---------------------------------------------------------------------------

/** Lo que manda la pantalla al guardar. */
export type CambiosFicha = {
  datos: DatosRevision;
  tipoDocumento: "factura" | "ticket";
  revision: CamposRevision;
  origenTipo: OrigenTipo;
  estado: "pendiente" | "revisada";
};

export type FilasGuardado = {
  factura: Record<string, unknown>;
  lineas: { orden: number; tipo_iva: number; base: number; cuota: number }[];
};

function centimos(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

/**
 * Convierte lo de la pantalla en las columnas de `facturas` y las filas de
 * `lineas_iva`. Devuelve un error claro si la base de datos lo rechazaría.
 * `categoriaId` es el id de la categoría elegida (null si no hay o no existe).
 */
export function filasParaGuardar(c: CambiosFicha, categoriaId: number | null, ahora: Date = new Date()): FilasGuardado | { error: string } {
  const d = c.datos;
  if (!/^[A-Z]{3}$/.test(d.moneda)) return { error: "La moneda tiene que ser un código de 3 letras, por ejemplo EUR." };
  if (d.fecha && !/^\d{4}-\d{2}-\d{2}$/.test(d.fecha)) return { error: "La fecha no es válida." };
  if (d.categoria && categoriaId === null) return { error: `La categoría «${d.categoria}» no existe.` };
  for (const l of d.lineas) {
    if (!(l.tipoIva >= 0 && l.tipoIva <= 100)) return { error: "Hay un tipo de IVA fuera de 0 a 100 %." };
  }

  const enEuros = d.moneda === "EUR";
  const tipoCambio = enEuros ? null : d.tipoCambio && d.tipoCambio > 0 ? d.tipoCambio : null;
  const totalEur = enEuros ? d.total : d.total !== null && tipoCambio ? totalEnEuros(d.total, tipoCambio) : null;
  const conTipo = tipoCambio !== null;
  if (conTipo && !c.origenTipo) return { error: "Falta de dónde sale el tipo de cambio." };

  if (c.estado === "revisada") {
    const falta = faltaParaRevisada({ ...d, totalEur });
    if (falta.length > 0) return { error: "Faltan datos para marcarla como revisada." };
  }

  const baseTotal = d.lineas.length ? centimos(d.lineas.reduce((s, l) => s + l.base, 0)) : null;
  const cuotaTotal = d.lineas.length ? centimos(d.lineas.reduce((s, l) => s + l.cuota, 0)) : null;

  return {
    factura: {
      tipo_documento: c.tipoDocumento,
      fecha: d.fecha,
      emisor_nombre: d.emisorNombre,
      emisor_nif: d.emisorNif,
      receptor_nif: d.receptorNif,
      numero: d.numero,
      base_total: baseTotal,
      cuota_total: cuotaTotal,
      retencion_importe: d.retencionImporte,
      total: d.total,
      moneda: d.moneda,
      tipo_cambio: tipoCambio,
      tipo_cambio_fecha: conTipo ? (c.origenTipo?.fecha ?? d.fecha) : null,
      tipo_cambio_fuente: conTipo ? c.origenTipo?.fuente : null,
      total_eur: totalEur,
      categoria_id: categoriaId,
      estado_revision: c.estado,
      campos_revision: c.revision,
      actualizado_en: ahora.toISOString(),
    },
    lineas: d.lineas.map((l, i) => ({ orden: i + 1, tipo_iva: l.tipoIva, base: l.base, cuota: l.cuota })),
  };
}

/** Comprueba la forma de lo que llega a la ruta, sin fiarse del navegador. */
export function leerCambios(cuerpo: unknown): CambiosFicha | null {
  if (!cuerpo || typeof cuerpo !== "object") return null;
  const c = cuerpo as Record<string, unknown>;
  const d = c.datos as Record<string, unknown> | undefined;
  if (!d || typeof d !== "object" || !Array.isArray(d.lineas)) return null;
  const texto = (v: unknown) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null);
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
  const lineas: LineaIva[] = [];
  for (const l of d.lineas as unknown[]) {
    const x = l as Record<string, unknown>;
    if (num(x?.tipoIva) === null) return null;
    lineas.push({ tipoIva: num(x.tipoIva)!, base: num(x.base) ?? 0, cuota: num(x.cuota) ?? 0 });
  }
  const origen = c.origenTipo as Record<string, unknown> | null | undefined;
  const fuente = origen && (origen.fuente === "BDE" || origen.fuente === "manual") ? origen.fuente : null;
  return {
    datos: {
      fecha: texto(d.fecha),
      emisorNombre: texto(d.emisorNombre),
      emisorNif: texto(d.emisorNif),
      receptorNif: texto(d.receptorNif),
      numero: texto(d.numero),
      categoria: texto(d.categoria),
      moneda: (texto(d.moneda) ?? "EUR").toUpperCase(),
      total: num(d.total),
      totalEur: num(d.totalEur),
      tipoCambio: num(d.tipoCambio),
      retencionImporte: num(d.retencionImporte),
      lineas,
    },
    tipoDocumento: c.tipoDocumento === "factura" ? "factura" : "ticket",
    revision: c.revision && typeof c.revision === "object" ? (c.revision as CamposRevision) : {},
    origenTipo: fuente ? { fecha: texto(origen!.fecha), fuente } : null,
    estado: c.estado === "revisada" ? "revisada" : "pendiente",
  };
}
