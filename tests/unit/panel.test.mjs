// Pruebas del resumen mensual de Mis gastos (issue #26).
import { test } from "node:test";
import assert from "node:assert/strict";
import { compararMeses, resumenMensual } from "../../lib/gastos/panel.ts";

function gasto(id, fecha, total, totalEur, extras = {}) {
  return {
    id, documentoId: id, facturaId: id, fecha, emisor: "Emisor", categoria: "General",
    total, moneda: "EUR", totalEur, estado: "pendiente", avisos: [],
    sinNifReceptor: false, llegoPorCorreo: false, nombreArchivo: null, subidoEl: "2026-11-01",
    ...extras,
  };
}

test("mes actual: usa fecha de factura, suma en céntimos e incluye pendientes", () => {
  const datos = [
    gasto("a", "2026-11-01", 10.1, 10.1),
    gasto("b", "2026-11-04", 20.2, 20.2, { estado: "revisada", categoria: "Viajes" }),
    gasto("futuro", "2026-11-05", 70, 70),
    gasto("c", "2026-10-31", 99, 99),
    gasto("d", null, 50, 50),
  ];
  const r = resumenMensual(datos, "2026-11-04");
  assert.equal(r.clave, "2026-11");
  assert.equal(r.anterior, "2026-10");
  assert.equal(r.documentos, 2);
  assert.equal(r.totalEur, 30.3);
  assert.deepEqual(r.categorias.map((c) => c.nombre), ["Viajes", "General"]);
});

test("sin categoría, conversión pendiente y total desconocido quedan diferenciados", () => {
  const datos = [
    gasto("a", "2026-11-02", 12, 12, { categoria: null }),
    gasto("b", "2026-11-03", 100, null, { moneda: "USD" }),
    gasto("c", "2026-11-03", null, null),
  ];
  const r = resumenMensual(datos, "2026-11-04");
  assert.equal(r.documentos, 3);
  assert.equal(r.totalEur, 12);
  assert.equal(r.sinConvertir, 1);
  assert.equal(r.sinImporte, 1);
  assert.equal(r.categorias[0].nombre, "Sin categoría");
});

test("un posible duplicado se mantiene en el total y queda señalado", () => {
  const r = resumenMensual([
    gasto("a", "2026-11-02", 10, 10, { avisos: ["duplicado"] }),
    gasto("b", "2026-11-02", 10, 10),
  ], "2026-11-04");
  assert.equal(r.totalEur, 20);
  assert.equal(r.posiblesDuplicados, 1);
});

test("cambio de año al calcular el mes anterior", () => {
  const r = resumenMensual([], "2026-01-10");
  assert.equal(r.anterior, "2025-12");
});

test("comparación: diferencia y porcentaje; sin base no inventa porcentaje", () => {
  const actual = resumenMensual([gasto("a", "2026-11-02", 15, 15)], "2026-11-04");
  const anterior = resumenMensual([
    gasto("b", "2026-10-02", 10, 10),
    gasto("c", "2026-10-05", 100, 100),
  ], "2026-10-04");
  assert.deepEqual(compararMeses(actual, anterior), { diferenciaEur: 5, porcentaje: 50 });
  const cero = resumenMensual([], "2026-10-04");
  assert.deepEqual(compararMeses(actual, cero), { diferenciaEur: 15, porcentaje: null });
});
