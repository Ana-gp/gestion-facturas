/**
 * Pasar la respuesta de la IA a las filas de `facturas` y `lineas_iva` (#19).
 *
 * La IA puede equivocarse o devolver datos con otra forma: aquí se comprueba
 * todo antes de guardarlo, para que nunca se rompan las reglas (CHECK) de
 * docs/modelo-datos.sql. Lo que no se entiende se deja vacío (null) y se marca
 * como dudoso, para que el usuario lo revise (#21). Nunca se inventa un dato.
 *
 * Sin dependencias de Supabase ni de Gemini: se prueba con las respuestas
 * reales de la prueba de IA (tests/resultados-ia/).
 */

import { confianzaPorReglas, type Campo, type CamposRevision, type DatosRevision } from "../revision/comprobaciones.ts";
import { CATEGORIAS_LECTURA } from "./instruccion.ts";

export type LineaLeida = { tipo: number; base: number | null; cuota: number | null };

/** La respuesta de la IA ya comprobada. */
export type DatosLeidos = {
  tipoDocumento: "ticket" | "factura";
  fecha: string | null;
  emisor: string | null;
  nifEmisor: string | null;
  nifReceptor: string | null;
  numero: string | null;
  lineas: LineaLeida[];
  baseTotal: number | null;
  retencionTipo: number | null;
  retencionImporte: number | null;
  total: number | null;
  /** Null si la IA no la da o no es un código de 3 letras. */
  moneda: string | null;
  categoria: string | null;
  concepto: string | null;
  dudosos: Campo[];
};

// ---------------------------------------------------------------------------
// Limpieza de cada tipo de dato

function texto(v: unknown, max = 200): string | null {
  if (typeof v !== "string" && typeof v !== "number") return null;
  const t = String(v).replace(/\s+/g, " ").trim();
  if (!t || /^(null|n\/a|none|-)$/i.test(t)) return null;
  return t.slice(0, max);
}

/** 56.53, "56.53", "56,53", "1.234,56" o "1,234.56" → 56.53 / 1234.56. */
export function numero(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v !== "string") return null;
  let t = v.replace(/[^\d,.-]/g, "");
  if (!t || !/\d/.test(t)) return null;
  const coma = t.lastIndexOf(",");
  const punto = t.lastIndexOf(".");
  if (coma > punto) t = t.replace(/\./g, "").replace(",", ".");
  else t = t.replace(/,/g, "");
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function importe(v: unknown): number | null {
  const n = numero(v);
  if (n === null || Math.abs(n) >= 1e10) return null;
  return Math.round(n * 100) / 100;
}

function porcentaje(v: unknown): number | null {
  const n = numero(v);
  if (n === null || n < 0 || n > 100) return null;
  return Math.round(n * 100) / 100;
}

/** Solo fechas que existen: "2026-02-30" → null. Admite "09/10/2026". */
export function fecha(v: unknown): string | null {
  const t = texto(v, 20);
  if (!t) return null;
  let a: number, m: number, d: number;
  let r = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t);
  if (r) [a, m, d] = [Number(r[1]), Number(r[2]), Number(r[3])];
  else if ((r = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(t))) [d, m, a] = [Number(r[1]), Number(r[2]), Number(r[3])];
  else return null;
  const f = new Date(Date.UTC(a, m - 1, d));
  if (f.getUTCFullYear() !== a || f.getUTCMonth() !== m - 1 || f.getUTCDate() !== d || a < 2000 || a > 2100) return null;
  return `${a}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function nif(v: unknown): string | null {
  const t = texto(v, 30);
  return t ? t.toUpperCase() : null;
}

function moneda(v: unknown): string | null {
  const t = texto(v, 10)?.toUpperCase();
  if (!t) return null;
  if (t === "€" || t === "EUROS" || t === "EURO") return "EUR";
  if (t === "$" || t === "US$") return "USD";
  return /^[A-Z]{3}$/.test(t) ? t : null;
}

function categoria(v: unknown): string | null {
  const t = texto(v, 60);
  if (!t) return null;
  const buscada = t.toLocaleLowerCase("es");
  return CATEGORIAS_LECTURA.find((c) => c.toLocaleLowerCase("es") === buscada) ?? null;
}

const DUDOSO_A_CAMPO: Record<string, Campo> = {
  fecha: "fecha",
  emisor: "emisor_nombre",
  nif_emisor: "emisor_nif",
  nif_receptor: "receptor_nif",
  numero_factura: "numero",
  lineas_iva: "lineas_iva",
  total: "total",
  moneda: "moneda",
  categoria: "categoria",
  concepto: "concepto",
};

// ---------------------------------------------------------------------------

/**
 * Comprueba la respuesta de la IA. Admite el texto tal cual (a veces viene
 * dentro de ```json … ```) o el objeto ya leído. Lanza un error solo si no es
 * un JSON con forma de objeto.
 */
export function interpretarRespuesta(respuesta: unknown): DatosLeidos {
  let r: unknown = respuesta;
  if (typeof r === "string") {
    const limpio = r.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    try {
      r = JSON.parse(limpio);
    } catch {
      throw new Error("La IA no ha devuelto un JSON válido.");
    }
  }
  if (!r || typeof r !== "object" || Array.isArray(r)) throw new Error("La IA no ha devuelto un objeto JSON.");
  const o = r as Record<string, unknown>;

  const lineas: LineaLeida[] = [];
  if (Array.isArray(o.lineas_iva)) {
    for (const l of o.lineas_iva.slice(0, 10)) {
      if (!l || typeof l !== "object") continue;
      const x = l as Record<string, unknown>;
      const tipo = porcentaje(x.tipo);
      const base = importe(x.base);
      const cuota = importe(x.cuota);
      if (tipo === null) continue; // sin tipo no se puede guardar la línea
      if (base === null && cuota === null) continue;
      lineas.push({ tipo, base, cuota });
    }
  }

  const ret = o.retencion && typeof o.retencion === "object" ? (o.retencion as Record<string, unknown>) : null;
  const retencionImporteLeido = ret ? importe(ret.importe) : null;
  const retencionImporte = retencionImporteLeido === null || retencionImporteLeido === 0 ? null : Math.abs(retencionImporteLeido);
  const retencionTipo = retencionImporte === null ? null : ret ? porcentaje(ret.tipo) : null;

  const nifReceptor = nif(o.nif_receptor);
  const tipoLeido = texto(o.tipo_documento, 20)?.toLowerCase();
  const tipoDocumento = tipoLeido === "factura" || tipoLeido === "ticket" ? tipoLeido : nifReceptor ? "factura" : "ticket";

  const dudosos = new Set<Campo>();
  if (Array.isArray(o.campos_dudosos)) {
    for (const c of o.campos_dudosos) {
      const campo = typeof c === "string" ? DUDOSO_A_CAMPO[c.trim().toLowerCase()] : undefined;
      if (campo) dudosos.add(campo);
    }
  }

  const monedaLeida = moneda(o.moneda);
  if (monedaLeida === null) dudosos.add("moneda");
  const categoriaLeida = categoria(o.categoria);

  return {
    tipoDocumento,
    fecha: fecha(o.fecha),
    emisor: texto(o.emisor),
    nifEmisor: nif(o.nif_emisor),
    nifReceptor,
    numero: texto(o.numero_factura, 60),
    lineas,
    baseTotal: importe(o.base_imponible_total),
    retencionTipo,
    retencionImporte,
    total: importe(o.total),
    moneda: monedaLeida,
    categoria: categoriaLeida,
    concepto: texto(o.concepto, 120),
    dudosos: [...dudosos],
  };
}

/** Para las reglas de confianza (lib/revision/comprobaciones.ts). */
export function aDatosRevision(d: DatosLeidos): DatosRevision {
  const monedaFinal = d.moneda ?? "EUR";
  return {
    fecha: d.fecha,
    emisorNombre: d.emisor,
    emisorNif: d.nifEmisor,
    receptorNif: d.nifReceptor,
    numero: d.numero,
    categoria: d.categoria,
    moneda: monedaFinal,
    total: d.total,
    totalEur: monedaFinal === "EUR" ? d.total : null,
    tipoCambio: null,
    retencionImporte: d.retencionImporte,
    lineas: d.lineas.map((l) => ({ tipoIva: l.tipo, base: l.base ?? 0, cuota: l.cuota ?? 0 })),
    concepto: d.concepto,
  };
}

/** Confianza de cada campo: la IA marca los dudosos y nuestras reglas (D2) los vacíos y los que no cuadran. */
export function camposRevision(d: DatosLeidos, referencia: string = new Date().toISOString().slice(0, 10)): CamposRevision {
  const deLaIa: CamposRevision = {};
  for (const c of d.dudosos) deLaIa[c] = { confianza: "baja", corregido: false };
  // `referencia`: el día de la subida, para avisar si el día y el mes pueden estar cruzados.
  const confianza = confianzaPorReglas(aDatosRevision(d), deLaIa, { referencia });
  const resultado: CamposRevision = {};
  for (const [campo, nivel] of Object.entries(confianza) as [Campo, (typeof confianza)[Campo]][]) {
    resultado[campo] = { confianza: nivel, corregido: false };
  }
  return resultado;
}

/** Columnas de `facturas` que rellena la lectura (sin user_id ni documento_id). */
export type FilaFactura = {
  tipo_documento: "ticket" | "factura";
  fecha: string | null;
  emisor_nombre: string | null;
  emisor_nif: string | null;
  receptor_nif: string | null;
  numero: string | null;
  base_total: number | null;
  cuota_total: number | null;
  retencion_tipo: number | null;
  retencion_importe: number | null;
  total: number | null;
  moneda: string;
  tipo_cambio: null;
  tipo_cambio_fecha: null;
  tipo_cambio_fuente: null;
  total_eur: number | null;
  categoria_id: number | null;
  concepto: string | null;
  estado_revision: "pendiente";
  campos_revision: CamposRevision;
  datos_ia: unknown;
};

export type FilaLinea = { orden: number; tipo_iva: number; base: number | null; cuota: number | null; origen: "impreso" };

/**
 * Las filas que se guardan. `idsCategorias` traduce el nombre de la categoría
 * a su id de la tabla `categorias`.
 * - En euros: total_eur = total. En otra moneda: tipo de cambio y total_eur
 *   vacíos hasta convertirla (#20); así lo exige el CHECK de la tabla.
 * - Base total: la impresa o, si no está, la suma de las bases.
 */
export function aFilas(d: DatosLeidos, idsCategorias: Map<string, number>, datosIa: unknown, referencia?: string): { factura: FilaFactura; lineas: FilaLinea[] } {
  const monedaFinal = d.moneda ?? "EUR";
  const suma = (valores: (number | null)[]) =>
    valores.some((v) => v !== null) ? Math.round(valores.reduce<number>((s, v) => s + (v ?? 0), 0) * 100) / 100 : null;

  return {
    factura: {
      tipo_documento: d.tipoDocumento,
      fecha: d.fecha,
      emisor_nombre: d.emisor,
      emisor_nif: d.nifEmisor,
      receptor_nif: d.nifReceptor,
      numero: d.numero,
      base_total: d.baseTotal ?? suma(d.lineas.map((l) => l.base)),
      cuota_total: suma(d.lineas.map((l) => l.cuota)),
      retencion_tipo: d.retencionTipo,
      retencion_importe: d.retencionImporte,
      total: d.total,
      moneda: monedaFinal,
      tipo_cambio: null,
      tipo_cambio_fecha: null,
      tipo_cambio_fuente: null,
      total_eur: monedaFinal === "EUR" ? d.total : null,
      categoria_id: d.categoria ? (idsCategorias.get(d.categoria) ?? null) : null,
      concepto: d.concepto,
      estado_revision: "pendiente",
      campos_revision: camposRevision(d, referencia),
      datos_ia: datosIa,
    },
    lineas: d.lineas.map((l, i) => ({ orden: i + 1, tipo_iva: l.tipo, base: l.base, cuota: l.cuota, origen: "impreso" })),
  };
}
