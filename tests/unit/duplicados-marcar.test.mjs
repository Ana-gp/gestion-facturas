// Pruebas de marcar el posible duplicado (#22) con un Supabase de mentira.
// Ejecutar con: npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { marcarPosibleDuplicado } from "../../lib/duplicados/marcar.ts";

/** Supabase de mentira: `buscar_duplicados` devuelve `coincidencias`; las facturas viven en `facturas`. */
function admin({ coincidencias = [], facturas = {}, errorRpc = null } = {}) {
  const cambios = [];
  return {
    cambios,
    async rpc(nombre, args) {
      assert.equal(nombre, "buscar_duplicados");
      assert.ok(args.p_factura_id);
      return errorRpc ? { data: null, error: { message: errorRpc } } : { data: coincidencias, error: null };
    },
    from(tabla) {
      assert.equal(tabla, "facturas");
      const q = { filtros: {}, ids: null };
      return {
        select() { return this; },
        in(_c, ids) { q.ids = ids; return this; },
        order() { return this; },
        async limit() {
          const filas = q.ids.map((id) => ({ id, creado_en: facturas[id]?.creado_en ?? "" })).sort((a, b) => a.creado_en.localeCompare(b.creado_en));
          return { data: filas, error: null };
        },
        eq(_c, id) { q.filtros.id = id; return this; },
        async maybeSingle() {
          const f = facturas[q.filtros.id];
          return { data: f ? { posible_duplicado_de: f.posible_duplicado_de ?? null, duplicado_descartado: f.duplicado_descartado ?? false } : null, error: null };
        },
        update(valores) {
          return { async eq(_c, id) { cambios.push({ id, ...valores }); return { error: null }; } };
        },
      };
    },
  };
}

test("marca la factura más antigua con la que coincide", async () => {
  const sb = admin({
    coincidencias: [{ factura_id: "nueva-otra", motivo: "x" }, { factura_id: "vieja", motivo: "y" }],
    facturas: { ml: {}, vieja: { creado_en: "2026-10-23T10:00:00Z" }, "nueva-otra": { creado_en: "2026-10-30T10:00:00Z" } },
  });
  assert.deepEqual(await marcarPosibleDuplicado(sb, "ml"), { duplicadoDe: "vieja", cambiado: true });
  assert.deepEqual(sb.cambios, [{ id: "ml", posible_duplicado_de: "vieja", duplicado_descartado: false }]);
});

test("si ya está marcada con la misma, no cambia nada (respeta «No es un duplicado»)", async () => {
  const sb = admin({ coincidencias: [{ factura_id: "mc" }], facturas: { ml: { posible_duplicado_de: "mc", duplicado_descartado: true }, mc: {} } });
  assert.deepEqual(await marcarPosibleDuplicado(sb, "ml"), { duplicadoDe: "mc", cambiado: false });
  assert.equal(sb.cambios.length, 0);
});

test("si al corregir ya no coincide con ninguna, quita el aviso", async () => {
  const sb = admin({ coincidencias: [], facturas: { ml: { posible_duplicado_de: "mc", duplicado_descartado: true } } });
  assert.deepEqual(await marcarPosibleDuplicado(sb, "ml"), { duplicadoDe: null, cambiado: true });
  assert.deepEqual(sb.cambios, [{ id: "ml", posible_duplicado_de: null, duplicado_descartado: false }]);
});

test("sin coincidencias y sin aviso: no escribe", async () => {
  const sb = admin({ facturas: { t4b: {} } });
  assert.deepEqual(await marcarPosibleDuplicado(sb, "t4b"), { duplicadoDe: null, cambiado: false });
  assert.equal(sb.cambios.length, 0);
});

test("nunca se marca a sí misma y un fallo de la función da error claro", async () => {
  const sb = admin({ coincidencias: [{ factura_id: "ml" }], facturas: { ml: {} } });
  assert.deepEqual(await marcarPosibleDuplicado(sb, "ml"), { duplicadoDe: null, cambiado: false });
  await assert.rejects(() => marcarPosibleDuplicado(admin({ errorRpc: "boom" }), "ml"), /buscar duplicados/);
});
