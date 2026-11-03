// Pruebas del aviso de día y mes cruzados (primera prueba en producción, 03/11/2026).
// Ejecutar con: npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { camposARevisar, fechaQuizaCruzada } from "../../lib/revision/comprobaciones.ts";

const HOY = "2026-11-03";

test("Lidl: 02/10/2026 leído como 10/02/2026 avisa y propone el 2 de octubre", () => {
  assert.equal(fechaQuizaCruzada("2026-02-10", HOY), "2026-10-02");
});

test("sin duda posible: día mayor que 12, día igual al mes o sin fecha", () => {
  assert.equal(fechaQuizaCruzada("2026-10-23", HOY), null);
  assert.equal(fechaQuizaCruzada("2026-05-05", HOY), null);
  assert.equal(fechaQuizaCruzada(null, HOY), null);
  assert.equal(fechaQuizaCruzada("2026-02-10", undefined), null);
});

test("no avisa si la fecha leída es la más cercana o la cruzada sería futura", () => {
  // T4b: 09/10/2026 bien leído; el 10 de septiembre está más lejos de hoy.
  assert.equal(fechaQuizaCruzada("2026-10-09", HOY), null);
  // Cruzada sería el 11 de diciembre de 2026: futura.
  assert.equal(fechaQuizaCruzada("2026-12-11", HOY), null);
});

test("no avisa en fechas bien leídas del banco de tickets (revisión del PR #88)", () => {
  // T1 gasolinera, 07/03/2026: el 3 de julio queda a más de 90 días de la subida.
  assert.equal(fechaQuizaCruzada("2026-03-07", HOY), null);
  // E5 pesos mexicanos, 06/01/2024.
  assert.equal(fechaQuizaCruzada("2024-01-06", HOY), null);
  // T2 y T3.
  assert.equal(fechaQuizaCruzada("2025-09-02", HOY), null);
  assert.equal(fechaQuizaCruzada("2026-10-14", HOY), null);
});

test("la referencia es el día de la subida: el aviso no cambia al abrir la ficha más tarde", () => {
  // Lidl subido el 03/11/2026: avisa con esa referencia aunque se abra en enero.
  assert.equal(fechaQuizaCruzada("2026-02-10", "2026-11-03"), "2026-10-02");
  // Justo en el límite de 90 días sí avisa; un día más, no.
  // 90 días antes del 03/11/2026 es el 05/08/2026.
  assert.equal(fechaQuizaCruzada("2026-05-08", "2026-11-03"), "2026-08-05");
  assert.equal(fechaQuizaCruzada("2026-04-08", "2026-11-03"), null);
});

test("la ficha marca la fecha para revisar hasta que el usuario la corrige", () => {
  const datos = { fecha: "2026-02-10", emisorNombre: "LIDL", emisorNif: "A60195278", receptorNif: null, numero: null, categoria: "Alimentación", moneda: "EUR", total: 73.13, totalEur: 73.13, tipoCambio: null, retencionImporte: null, lineas: [{ tipoIva: 4, base: 19.05, cuota: 0.76 }, { tipoIva: 10, base: 16.57, cuota: 1.66 }, { tipoIva: 21, base: 29, cuota: 6.09 }] };
  assert.ok(camposARevisar(datos, {}, { referencia: HOY }).includes("fecha"));
  assert.ok(!camposARevisar(datos, { fecha: { confianza: "baja", corregido: true } }, { referencia: HOY }).includes("fecha"));
  assert.ok(!camposARevisar(datos, {}).includes("fecha")); // sin referencia, no avisa
});
