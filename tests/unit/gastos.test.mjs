// Pruebas de la lista de Mis gastos (#30).
// Ejecutar con: npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { GASTOS_EJEMPLO } from "../../lib/demo/gastos-ejemplo.ts";
import {
  accionDe,
  cifrasDelTrimestre,
  contar,
  desdeEjemplo,
  desdeSupabase,
  enPeriodo,
  etiquetaPeriodo,
  ordenar,
  periodosConDocumentos,
} from "../../lib/gastos/listado.ts";

const EJEMPLO = ordenar(desdeEjemplo(GASTOS_EJEMPLO));
const HOY = "2026-11-01";

test("ejemplo: el 4.º trimestre de 2026 tiene 6 documentos y 124,70 € (como el diseño)", () => {
  const t = cifrasDelTrimestre(EJEMPLO, HOY);
  assert.deepEqual(t, { clave: "2026-T4", documentos: 6, totalEur: 124.7, sinConvertir: 0 });
  const del = EJEMPLO.filter((g) => enPeriodo(g, "2026-T4"));
  assert.deepEqual(contar(del), { todos: 6, pendientes: 2, avisos: 1, revisadas: 4 });
});

test("orden: por fecha de la factura, la más reciente arriba", () => {
  const fechas = EJEMPLO.map((g) => g.fecha);
  assert.equal(fechas[0], "2026-10-25");
  assert.equal(fechas.at(-1), "2024-01-06");
  assert.deepEqual([...fechas].sort().reverse(), fechas);
});

test("avisos: el duplicado y la moneda sin convertir cuentan; sin NIF del receptor no", () => {
  const ml = EJEMPLO.find((g) => g.id === "ml");
  const e5 = EJEMPLO.find((g) => g.id === "e5");
  const t3 = EJEMPLO.find((g) => g.id === "t3");
  assert.deepEqual(ml.avisos, ["duplicado"]);
  assert.deepEqual(e5.avisos, ["sin-convertir"]);
  assert.deepEqual(t3.avisos, []);
  assert.equal(t3.sinNifReceptor, true);
});

test("periodos con documentos, el más reciente primero", () => {
  assert.deepEqual(periodosConDocumentos(EJEMPLO), ["2026-T4", "2026-T3", "2026-T2", "2026-T1", "2025-T3", "2024-T1"]);
  assert.equal(etiquetaPeriodo("2026-T4"), "4.º trimestre de 2026");
  assert.equal(etiquetaPeriodo("todos"), "Todos los periodos");
});

test("acciones: comparar el duplicado, revisar el pendiente, abrir el revisado", () => {
  const conFicha = (id) => ["t4b", "t1", "e5", "mc", "ml"].includes(id);
  const por = (id) => accionDe(EJEMPLO.find((g) => g.id === id), conFicha);
  assert.deepEqual(por("ml"), { texto: "Comparar", href: "/comparar/ml" });
  assert.deepEqual(por("t4b"), { texto: "Revisar", href: "/revisar/t4b" });
  assert.deepEqual(por("mc"), { texto: "Abrir", href: "/revisar/mc" });
  assert.equal(por("e1"), null); // AUCALSA no tiene ficha de ejemplo
});

// Filas como las devuelve Supabase con CONSULTA_GASTOS.
const DOC_LEIDO = {
  id: "d1",
  nombre_archivo: "IMG_2041.jpg",
  origen: "foto",
  estado_lectura: "leido",
  subido_en: "2026-10-30T10:00:00+00:00",
  facturas: {
    id: "f1",
    fecha: "2026-10-09",
    emisor_nombre: "Mercadona, S.A.",
    receptor_nif: null,
    total: "56.53",
    total_eur: "56.53",
    moneda: "EUR",
    estado_revision: "pendiente",
    posible_duplicado_de: null,
    duplicado_descartado: false,
    categorias: { nombre: "Alimentación" },
  },
};

test("Supabase: documento leído con su factura (los importes llegan como texto)", () => {
  const [g] = desdeSupabase([DOC_LEIDO]);
  assert.equal(g.id, "f1");
  assert.equal(g.documentoId, "d1");
  assert.equal(g.total, 56.53);
  assert.equal(g.totalEur, 56.53);
  assert.equal(g.categoria, "Alimentación");
  assert.equal(g.estado, "pendiente");
  assert.equal(g.subidoEl, "2026-10-30");
  assert.deepEqual(accionDe(g), { texto: "Revisar", href: "/revisar/f1" });
});

test("Supabase: la factura también puede llegar como lista de una", () => {
  const [g] = desdeSupabase([{ ...DOC_LEIDO, facturas: [DOC_LEIDO.facturas] }]);
  assert.equal(g.facturaId, "f1");
});

test("Supabase: documento sin leer o con la lectura fallida sale primero y se abre el original", () => {
  const sinLeer = { ...DOC_LEIDO, id: "d2", estado_lectura: "pendiente", facturas: null, subido_en: "2026-10-31T09:00:00Z" };
  const fallido = { ...DOC_LEIDO, id: "d3", estado_lectura: "error", facturas: [], origen: "correo", subido_en: "2026-11-01T09:00:00Z" };
  const lista = ordenar(desdeSupabase([DOC_LEIDO, sinLeer, fallido]));
  assert.deepEqual(lista.map((g) => g.id), ["d3", "d2", "f1"]);
  assert.equal(lista[0].estado, "error-lectura");
  assert.deepEqual(lista[0].avisos, ["error-lectura"]);
  assert.equal(lista[0].llegoPorCorreo, true);
  assert.equal(lista[1].estado, "sin-leer");
  assert.deepEqual(accionDe(lista[1]), { texto: "Ver original", href: "/original/d2" });
  // Siguen visibles al elegir un trimestre concreto.
  assert.ok(enPeriodo(lista[1], "2026-T4"));
  assert.ok(enPeriodo(lista[1], "2025-T1"));
});

test("Supabase: duplicado descartado ya no avisa; otra moneda sin tipo sí", () => {
  const descartado = { ...DOC_LEIDO, facturas: { ...DOC_LEIDO.facturas, posible_duplicado_de: "f0", duplicado_descartado: true } };
  const mxn = { ...DOC_LEIDO, facturas: { ...DOC_LEIDO.facturas, moneda: "MXN", total: 635.02, total_eur: null } };
  assert.deepEqual(desdeSupabase([descartado])[0].avisos, []);
  const [g] = desdeSupabase([mxn]);
  assert.deepEqual(g.avisos, ["sin-convertir"]);
  assert.equal(cifrasDelTrimestre([g], HOY).sinConvertir, 1);
  assert.equal(cifrasDelTrimestre([g], HOY).totalEur, 0);
});
