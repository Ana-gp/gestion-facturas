/**
 * Uso del plan este mes (D4, #31), para la pantalla de subida.
 *
 * - Mes natural en hora de España: el mismo que usa `reservar_lectura` en
 *   docs/modelo-datos.sql (`date_trunc('month', now() at time zone 'Europe/Madrid')`).
 * - Usados: `uso_mensual.documentos_procesados` de ese mes (0 si no hay fila).
 * - Límite: el del plan de la suscripción sin fecha de fin, igual que
 *   `reservar_lectura`. Sin suscripción activa, 0: no se puede leer nada.
 */

import type { UsoDelPlan } from "./contrato";

export type FilaUso = { mes: string; documentos_procesados: number };
export type FilaSuscripcion = { hasta: string | null; planes: { limite_documentos_mes: number } | { limite_documentos_mes: number }[] | null };

/** "2026-11-01" para cualquier momento de noviembre de 2026 en hora de España. */
export function mesActual(ahora: Date = new Date()): string {
  const [anio, mes] = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit" }).format(ahora).split("-");
  return `${anio}-${mes}-01`;
}

export function usoDelMes(usos: FilaUso[], suscripciones: FilaSuscripcion[], mes: string): UsoDelPlan {
  const usados = usos.find((u) => String(u.mes).slice(0, 10) === mes)?.documentos_procesados ?? 0;
  const activa = suscripciones.find((s) => s.hasta === null);
  const plan = Array.isArray(activa?.planes) ? activa?.planes[0] : activa?.planes;
  return { usados, limite: plan?.limite_documentos_mes ?? 0 };
}
