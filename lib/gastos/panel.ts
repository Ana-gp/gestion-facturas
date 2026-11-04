/**
 * Resumen mensual de Mis gastos (issue #26).
 *
 * Se usa la fecha de expedición de la factura, no la fecha de subida.
 * Incluye facturas pendientes y revisadas; los importes sin conversión válida
 * no se suman a euros y se contabilizan aparte.
 */
import type { GastoListado } from "./listado";

export type CategoriaMensual = {
  nombre: string;
  documentos: number;
  totalEur: number;
  porcentaje: number;
};

export type ResumenMensual = {
  clave: string;
  anterior: string;
  documentos: number;
  totalEur: number;
  sinConvertir: number;
  sinImporte: number;
  posiblesDuplicados: number;
  categorias: CategoriaMensual[];
};

export type ComparacionMensual = {
  diferenciaEur: number;
  porcentaje: number | null;
};

function claveMes(fecha: string): string {
  return fecha.slice(0, 7);
}

function mesAnterior(clave: string): string {
  const [anio, mes] = clave.split("-").map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 2, 1));
  return `${fecha.getUTCFullYear()}-${String(fecha.getUTCMonth() + 1).padStart(2, "0")}`;
}

function eurosDeCentimos(centimos: number): number {
  return centimos / 100;
}

/** Calcula el resumen de un mes natural, sin depender de la zona horaria del servidor. */
export function resumenMensual(lista: GastoListado[], hoy: string): ResumenMensual {
  const clave = claveMes(hoy);
  const anterior = mesAnterior(clave);
  const delMes = lista.filter((g) => g.fecha !== null && claveMes(g.fecha) === clave);
  const sumas = new Map<string, { documentos: number; centimos: number }>();

  for (const gasto of delMes) {
    if (gasto.totalEur === null) continue;
    const nombre = gasto.categoria?.trim() || "Sin categoría";
    const actual = sumas.get(nombre) ?? { documentos: 0, centimos: 0 };
    actual.documentos += 1;
    actual.centimos += Math.round(gasto.totalEur * 100);
    sumas.set(nombre, actual);
  }

  const totalCentimos = delMes.reduce(
    (suma, gasto) => suma + (gasto.totalEur === null ? 0 : Math.round(gasto.totalEur * 100)),
    0,
  );
  const categorias = [...sumas.entries()]
    .map(([nombre, valor]) => ({
      nombre,
      documentos: valor.documentos,
      totalEur: eurosDeCentimos(valor.centimos),
      porcentaje: totalCentimos === 0 ? 0 : (valor.centimos / totalCentimos) * 100,
    }))
    .sort((a, b) => b.totalEur - a.totalEur || a.nombre.localeCompare(b.nombre, "es"));

  return {
    clave,
    anterior,
    documentos: delMes.length,
    totalEur: eurosDeCentimos(totalCentimos),
    sinConvertir: delMes.filter((g) => g.total !== null && g.moneda.toUpperCase() !== "EUR" && g.totalEur === null).length,
    sinImporte: delMes.filter((g) => g.total === null).length,
    posiblesDuplicados: delMes.filter((g) => g.avisos.includes("duplicado")).length,
    categorias,
  };
}

export function compararMeses(actual: ResumenMensual, anterior: ResumenMensual): ComparacionMensual {
  const diferenciaCentimos = Math.round(actual.totalEur * 100) - Math.round(anterior.totalEur * 100);
  return {
    diferenciaEur: eurosDeCentimos(diferenciaCentimos),
    porcentaje: anterior.totalEur === 0 ? null : (diferenciaCentimos / Math.round(anterior.totalEur * 100)) * 100,
  };
}
