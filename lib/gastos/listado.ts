/**
 * Mis gastos (P07, #30): la lista de documentos del usuario, el más nuevo
 * arriba, con su estado, sus avisos y lo que se puede hacer con cada uno.
 *
 * Criterios (mapa de pantallas #54, P07 y DP9; diseño unificado, tablero
 * "Gastos"):
 * - Orden: por fecha de la factura, la más reciente arriba. Los documentos
 *   que todavía no tienen fecha (sin leer o con la lectura fallida) van
 *   primero, porque son los que piden algo al usuario.
 * - "Con avisos" cuenta lo que hay que resolver antes de exportar: posible
 *   duplicado, moneda sin convertir y lectura fallida. "Sin NIF del receptor"
 *   no cuenta como aviso aquí: es lo normal en un ticket (D5) y se explica en
 *   una nota debajo de la lista.
 * - "Este trimestre": suma de los totales en euros de los documentos con
 *   fecha dentro del trimestre en curso. Lo que está en otra moneda sin
 *   convertir no suma hasta que tenga tipo de cambio, igual que en el Excel.
 */

import type { FacturaExportable } from "../exportacion/excel";
import { trimestreDe } from "../avisos/trimestre.ts";

export type EstadoGasto = "revisada" | "pendiente" | "sin-leer" | "error-lectura";

export type AvisoGasto = "duplicado" | "sin-convertir" | "error-lectura";

export type GastoListado = {
  /** Id de la factura, o del documento si todavía no se ha leído. */
  id: string;
  documentoId: string | null;
  facturaId: string | null;
  /** AAAA-MM-DD, o null si falta. */
  fecha: string | null;
  emisor: string | null;
  categoria: string | null;
  /** Total en la moneda original. */
  total: number | null;
  moneda: string;
  /** Total en euros. Null si la moneda no es EUR y falta el tipo de cambio. */
  totalEur: number | null;
  estado: EstadoGasto;
  avisos: AvisoGasto[];
  sinNifReceptor: boolean;
  llegoPorCorreo: boolean;
  nombreArchivo: string | null;
  /** AAAA-MM-DD en que se subió. Null en los datos de ejemplo. */
  subidoEl: string | null;
};

export type Filtro = "todos" | "pendientes" | "avisos" | "revisadas";

export type Accion = { texto: "Revisar" | "Abrir" | "Comparar" | "Ver original"; href: string } | null;

// ---------------------------------------------------------------------------
// De dónde salen las filas
// ---------------------------------------------------------------------------

/** Las facturas de ejemplo (lib/demo/gastos-ejemplo.ts) como filas de la lista. */
export function desdeEjemplo(facturas: FacturaExportable[]): GastoListado[] {
  return facturas.map((f) => {
    const avisos: AvisoGasto[] = [];
    if (f.posibleDuplicado) avisos.push("duplicado");
    if (f.moneda !== "EUR" && f.totalEur === null) avisos.push("sin-convertir");
    return {
      id: f.id,
      documentoId: null,
      facturaId: f.id,
      fecha: f.fecha,
      emisor: f.emisorNombre,
      categoria: f.categoria,
      total: f.total,
      moneda: f.moneda,
      totalEur: f.totalEur,
      estado: f.estadoRevision,
      avisos,
      sinNifReceptor: !f.receptorNif,
      llegoPorCorreo: false,
      nombreArchivo: f.nombreArchivo,
      subidoEl: null,
    };
  });
}

/** Lo que devuelve la consulta de `documentos` con su factura (ver `CONSULTA_GASTOS`). */
export type FilaDocumento = {
  id: string;
  nombre_archivo: string | null;
  origen: string;
  estado_lectura: string;
  subido_en: string;
  facturas: FilaFactura | FilaFactura[] | null;
};

export type FilaFactura = {
  id: string;
  fecha: string | null;
  emisor_nombre: string | null;
  receptor_nif: string | null;
  total: number | string | null;
  total_eur: number | string | null;
  moneda: string;
  estado_revision: string;
  posible_duplicado_de: string | null;
  duplicado_descartado: boolean;
  categorias: { nombre: string } | { nombre: string }[] | null;
};

/**
 * Columnas que se piden a Supabase: cada documento con su factura (relación
 * uno a uno por `documento_id`) y el nombre de la categoría. Con la sesión
 * del usuario, las reglas RLS hacen que solo vea los suyos.
 */
export const CONSULTA_GASTOS =
  "id, nombre_archivo, origen, estado_lectura, subido_en, " +
  "facturas(id, fecha, emisor_nombre, receptor_nif, total, total_eur, moneda, estado_revision, posible_duplicado_de, duplicado_descartado, categorias(nombre))";

function uno<T>(valor: T | T[] | null | undefined): T | null {
  if (Array.isArray(valor)) return valor[0] ?? null;
  return valor ?? null;
}

function numero(valor: number | string | null): number | null {
  if (valor === null || valor === "") return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

/** Las filas de Supabase como filas de la lista. */
export function desdeSupabase(documentos: FilaDocumento[]): GastoListado[] {
  return documentos.map((d) => {
    const f = uno(d.facturas);
    const subidoEl = String(d.subido_en).slice(0, 10);
    const llegoPorCorreo = d.origen === "correo";
    if (!f) {
      const error = d.estado_lectura === "error";
      return {
        id: d.id,
        documentoId: d.id,
        facturaId: null,
        fecha: null,
        emisor: null,
        categoria: null,
        total: null,
        moneda: "EUR",
        totalEur: null,
        estado: error ? "error-lectura" : "sin-leer",
        avisos: error ? ["error-lectura"] : [],
        sinNifReceptor: false,
        llegoPorCorreo,
        nombreArchivo: d.nombre_archivo,
        subidoEl,
      };
    }
    const totalEur = numero(f.total_eur);
    const avisos: AvisoGasto[] = [];
    if (f.posible_duplicado_de && !f.duplicado_descartado) avisos.push("duplicado");
    if (f.moneda !== "EUR" && totalEur === null) avisos.push("sin-convertir");
    return {
      id: f.id,
      documentoId: d.id,
      facturaId: f.id,
      fecha: f.fecha,
      emisor: f.emisor_nombre,
      categoria: uno(f.categorias)?.nombre ?? null,
      total: numero(f.total),
      moneda: f.moneda,
      totalEur,
      estado: f.estado_revision === "revisada" ? "revisada" : "pendiente",
      avisos,
      sinNifReceptor: !f.receptor_nif,
      llegoPorCorreo,
      nombreArchivo: d.nombre_archivo,
      subidoEl,
    };
  });
}

// ---------------------------------------------------------------------------
// Orden, filtros y cifras
// ---------------------------------------------------------------------------

/** Sin fecha primero (por fecha de subida); después por fecha de la factura, la más reciente arriba. */
export function ordenar(lista: GastoListado[]): GastoListado[] {
  return [...lista].sort((a, b) => {
    if (!a.fecha && !b.fecha) return (b.subidoEl ?? "").localeCompare(a.subidoEl ?? "");
    if (!a.fecha) return -1;
    if (!b.fecha) return 1;
    return b.fecha.localeCompare(a.fecha) || (b.subidoEl ?? "").localeCompare(a.subidoEl ?? "");
  });
}

export function cumpleFiltro(g: GastoListado, filtro: Filtro): boolean {
  if (filtro === "pendientes") return g.estado !== "revisada";
  if (filtro === "avisos") return g.avisos.length > 0;
  if (filtro === "revisadas") return g.estado === "revisada";
  return true;
}

export function contar(lista: GastoListado[]): Record<Filtro, number> {
  return {
    todos: lista.length,
    pendientes: lista.filter((g) => cumpleFiltro(g, "pendientes")).length,
    avisos: lista.filter((g) => cumpleFiltro(g, "avisos")).length,
    revisadas: lista.filter((g) => cumpleFiltro(g, "revisadas")).length,
  };
}

/** Clave de periodo para el selector: "2026-T4", o "sin-fecha". */
export function clavePeriodo(fecha: string | null): string {
  if (!fecha) return "sin-fecha";
  const { anio, trimestre } = trimestreDe(fecha);
  return `${anio}-T${trimestre}`;
}

export function etiquetaPeriodo(clave: string): string {
  if (clave === "todos") return "Todos los periodos";
  if (clave === "sin-fecha") return "Sin fecha";
  const [anio, t] = clave.split("-T");
  return `${t}.º trimestre de ${anio}`;
}

/** Periodos con documentos, el más reciente primero. "sin-fecha" al final si hay alguno. */
export function periodosConDocumentos(lista: GastoListado[]): string[] {
  const claves = new Set(lista.map((g) => clavePeriodo(g.fecha)));
  const conFecha = [...claves].filter((c) => c !== "sin-fecha").sort().reverse();
  return claves.has("sin-fecha") ? [...conFecha, "sin-fecha"] : conFecha;
}

/**
 * En un periodo concreto entran los documentos de ese trimestre y, siempre,
 * los que aún no tienen fecha: si no, un documento sin leer desaparecería de
 * la vista por defecto.
 */
export function enPeriodo(g: GastoListado, clave: string): boolean {
  if (clave === "todos") return true;
  const propia = clavePeriodo(g.fecha);
  return propia === clave || propia === "sin-fecha";
}

/** Total en euros y número de documentos con fecha en el trimestre de `hoy`. */
export function cifrasDelTrimestre(lista: GastoListado[], hoy: string): { clave: string; documentos: number; totalEur: number; sinConvertir: number } {
  const clave = clavePeriodo(hoy);
  const del = lista.filter((g) => g.fecha && clavePeriodo(g.fecha) === clave);
  const centimos = del.reduce((suma, g) => suma + Math.round((g.totalEur ?? 0) * 100), 0);
  return { clave, documentos: del.length, totalEur: centimos / 100, sinConvertir: del.filter((g) => g.totalEur === null).length };
}

// ---------------------------------------------------------------------------
// Qué se puede hacer con cada fila
// ---------------------------------------------------------------------------

/**
 * Acción de la fila. `conFicha` dice si hay pantalla para ese id: con datos
 * de ejemplo solo algunos tickets tienen ficha (lib/demo/fichas-ejemplo.ts).
 */
export function accionDe(g: GastoListado, conFicha: (id: string) => boolean = () => true): Accion {
  if (!g.facturaId) return g.documentoId ? { texto: "Ver original", href: `/original/${g.documentoId}` } : null;
  if (!conFicha(g.facturaId)) return null;
  if (g.avisos.includes("duplicado")) return { texto: "Comparar", href: `/comparar/${g.facturaId}` };
  if (g.estado === "revisada") return { texto: "Abrir", href: `/revisar/${g.facturaId}` };
  return { texto: "Revisar", href: `/revisar/${g.facturaId}` };
}

export const TEXTO_ESTADO: Record<EstadoGasto, string> = {
  revisada: "Revisada",
  pendiente: "Pendiente de revisar",
  "sin-leer": "Sin leer",
  "error-lectura": "No se pudo leer",
};

export const TEXTO_AVISO: Record<AvisoGasto, string> = {
  duplicado: "Posible duplicado",
  "sin-convertir": "Sin convertir a euros",
  "error-lectura": "Revisa el original",
};
