// Pruebas de Exportar con datos reales (#23): filas de Supabase al Excel.
// Ejecutar con: npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { facturasDesdeSupabase, planDesdeId, planVigente } from "../../lib/exportacion/desde-supabase.ts";
import { filasGastos, resumenDe } from "../../lib/exportacion/excel.ts";

const FILA = {
  id: "f1",
  tipo_documento: "ticket",
  fecha: "2026-10-09",
  numero: "2939-017-128100",
  emisor_nombre: "Mercadona, S.A.",
  emisor_nif: "A46103834",
  receptor_nif: null,
  moneda: "EUR",
  total: "56.53",
  total_eur: "56.53",
  tipo_cambio: null,
  tipo_cambio_fecha: null,
  retencion_importe: null,
  estado_revision: "revisada",
  posible_duplicado_de: null,
  duplicado_descartado: false,
  categorias: { nombre: "Alimentación" },
  lineas_iva: [
    { orden: 2, tipo_iva: "10.00", base: "29.95", cuota: "2.99" },
    { orden: 1, tipo_iva: "4.00", base: "10.66", cuota: "0.43" },
    { orden: 3, tipo_iva: "21.00", base: "10.33", cuota: "2.17" },
  ],
  documentos: { nombre_archivo: "IMG_2041.jpg" },
};

test("una factura de Supabase sale en el Excel con una fila por tipo de IVA, en su orden", () => {
  const [f] = facturasDesdeSupabase([FILA]);
  assert.equal(f.total, 56.53);
  assert.equal(f.categoria, "Alimentación");
  assert.equal(f.nombreArchivo, "IMG_2041.jpg");
  assert.deepEqual(f.lineas.map((l) => l.tipoIva), [4, 10, 21]);
  const filas = filasGastos([f]);
  assert.equal(filas.length, 3);
  assert.equal(resumenDe([f]).totalEur, 56.53);
});

test("posible duplicado: avisa mientras no esté descartado", () => {
  const [a, b] = facturasDesdeSupabase([
    { ...FILA, posible_duplicado_de: "f0" },
    { ...FILA, id: "f2", posible_duplicado_de: "f0", duplicado_descartado: true },
  ]);
  assert.equal(a.posibleDuplicado, true);
  assert.equal(b.posibleDuplicado, false);
});

test("otra moneda sin tipo: total en euros vacío (Conversión pendiente)", () => {
  const [f] = facturasDesdeSupabase([{ ...FILA, moneda: "MXN", total: "635.02", total_eur: null, estado_revision: "pendiente", categorias: [] , documentos: [] }]);
  assert.equal(f.totalEur, null);
  assert.equal(f.categoria, null);
  assert.equal(f.nombreArchivo, "original");
  assert.equal(f.estadoRevision, "pendiente");
});

test("plan: ids de la base de datos y suscripción vigente", () => {
  assert.equal(planDesdeId("autonomo_plus"), "plus");
  assert.equal(planDesdeId("autonomo"), "autonomo");
  assert.equal(planDesdeId(undefined), "gratis");
  const subs = [
    { plan_id: "gratis", desde: "2026-09-01", hasta: "2026-10-15" },
    { plan_id: "autonomo", desde: "2026-10-16", hasta: null },
    { plan_id: "autonomo_plus", desde: "2026-12-01", hasta: null },
  ];
  assert.equal(planVigente(subs, "2026-11-01"), "autonomo");
  assert.equal(planVigente(subs, "2026-10-01"), "gratis");
  assert.equal(planVigente([], "2026-11-01"), "gratis");
});
