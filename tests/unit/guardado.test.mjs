// Pruebas de Revisar con datos reales (#21): leer la factura de Supabase y
// preparar lo que se guarda. Mismas reglas que los CHECK de `facturas`.
// Ejecutar con: npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { fichaDesdeFila, filasParaGuardar, leerCambios } from "../../lib/revision/guardado.ts";

const AHORA = new Date("2026-11-01T20:00:00Z");

// Fila como la devuelve Supabase con CONSULTA_FICHA (importes como texto).
const FILA_T4B = {
  id: "f1",
  documento_id: "d1",
  tipo_documento: "ticket",
  fecha: "2026-10-09",
  emisor_nombre: "Mercadona, S.A.",
  emisor_nif: null,
  receptor_nif: null,
  numero: "2939-017-128100",
  retencion_importe: null,
  total: "56.53",
  moneda: "EUR",
  tipo_cambio: null,
  tipo_cambio_fecha: null,
  tipo_cambio_fuente: null,
  total_eur: "56.53",
  estado_revision: "pendiente",
  campos_revision: { emisor_nif: { confianza: "baja", corregido: false } },
  posible_duplicado_de: null,
  duplicado_descartado: false,
  categorias: { nombre: "Alimentación" },
  lineas_iva: [
    { orden: 3, tipo_iva: "21.00", base: "10.33", cuota: "2.17" },
    { orden: 1, tipo_iva: "4.00", base: "10.66", cuota: "0.43" },
    { orden: 2, tipo_iva: "10.00", base: "29.95", cuota: "2.99" },
  ],
  documentos: { nombre_archivo: "IMG_2041.jpg", tipo_mime: "image/jpeg" },
};

test("leer: la fila de Supabase como ficha, con las líneas en su orden", () => {
  const f = fichaDesdeFila(FILA_T4B, "https://firmado");
  assert.equal(f.id, "f1");
  assert.equal(f.documentoId, "d1");
  assert.equal(f.nombreArchivo, "IMG_2041.jpg");
  assert.equal(f.tipoOriginal, "image/jpeg");
  assert.equal(f.datos.total, 56.53);
  assert.equal(f.datos.categoria, "Alimentación");
  assert.deepEqual(f.datos.lineas.map((l) => l.tipoIva), [4, 10, 21]);
  assert.deepEqual(f.revisionIa, { emisor_nif: { confianza: "baja", corregido: false } });
  assert.equal(f.estadoRevision, "pendiente");
  assert.equal(f.origenTipo, null);
});

test("leer: duplicado descartado no avisa; tipo de cambio guardado con su fuente", () => {
  const f = fichaDesdeFila(
    { ...FILA_T4B, posible_duplicado_de: "f0", duplicado_descartado: true, moneda: "MXN", tipo_cambio: "18.68", tipo_cambio_fecha: "2024-01-05", tipo_cambio_fuente: "BDE", total: "635.02", total_eur: "33.99" },
    "",
  );
  assert.equal(f.posibleDuplicadoDe, null);
  assert.deepEqual(f.origenTipo, { fecha: "2024-01-05", fuente: "BDE" });
  assert.equal(f.datos.tipoCambio, 18.68);
});

const ficha = fichaDesdeFila(FILA_T4B, "");
const base = { datos: { ...ficha.datos, emisorNif: "A46103834" }, tipoDocumento: "ticket", revision: { emisor_nif: { confianza: "baja", corregido: true } }, origenTipo: null, estado: "revisada" };

test("guardar en euros: total_eur = total, sin tipo de cambio, sumas de bases y cuotas", () => {
  const r = filasParaGuardar(base, 2, AHORA);
  assert.ok(!("error" in r));
  assert.equal(r.factura.total_eur, 56.53);
  assert.equal(r.factura.tipo_cambio, null);
  assert.equal(r.factura.tipo_cambio_fuente, null);
  assert.equal(r.factura.base_total, 50.94);
  assert.equal(r.factura.cuota_total, 5.59);
  assert.equal(r.factura.categoria_id, 2);
  assert.equal(r.factura.estado_revision, "revisada");
  assert.equal(r.factura.emisor_nif, "A46103834");
  assert.equal(r.factura.actualizado_en, "2026-11-01T20:00:00.000Z");
  assert.deepEqual(r.lineas.map((l) => l.orden), [1, 2, 3]);
  assert.ok(!("datos_ia" in r.factura) && !("posible_duplicado_de" in r.factura));
});

test("guardar en otra moneda: total_eur con la fórmula de la tabla y la fuente del tipo", () => {
  const mxn = { ...base, datos: { ...base.datos, moneda: "MXN", total: 635.02, tipoCambio: 18.68, lineas: [{ tipoIva: 8, base: 323.62, cuota: 25.89 }] }, origenTipo: { fecha: "2024-01-05", fuente: "BDE" } };
  const r = filasParaGuardar(mxn, 2, AHORA);
  assert.equal(r.factura.total_eur, 33.99);
  assert.equal(r.factura.tipo_cambio_fecha, "2024-01-05");
  assert.equal(r.factura.tipo_cambio_fuente, "BDE");
});

test("otra moneda sin tipo: se guarda pendiente con total_eur vacío, pero no como revisada", () => {
  const sinTipo = { ...base, datos: { ...base.datos, moneda: "MXN", total: 635.02, tipoCambio: null } };
  assert.deepEqual(filasParaGuardar(sinTipo, 2), { error: "Faltan datos para marcarla como revisada." });
  const r = filasParaGuardar({ ...sinTipo, estado: "pendiente" }, 2, AHORA);
  assert.equal(r.factura.total_eur, null);
  assert.equal(r.factura.tipo_cambio_fecha, null);
});

test("errores claros antes de llegar a la base de datos", () => {
  assert.match(filasParaGuardar({ ...base, datos: { ...base.datos, categoria: "Inventada" } }, null).error, /no existe/);
  assert.match(filasParaGuardar({ ...base, datos: { ...base.datos, moneda: "pesos" } }, 2).error, /3 letras/);
  assert.match(filasParaGuardar({ ...base, estado: "revisada", datos: { ...base.datos, fecha: null } }, 2).error, /Faltan datos/);
  const sinOrigen = { ...base, datos: { ...base.datos, moneda: "USD", tipoCambio: 1.1 }, origenTipo: null };
  assert.match(filasParaGuardar(sinOrigen, 2).error, /tipo de cambio/);
});

test("leerCambios: no se fía del navegador", () => {
  assert.equal(leerCambios(null), null);
  assert.equal(leerCambios({ datos: { lineas: [{ tipoIva: "21" }] } }), null);
  const c = leerCambios({ datos: { fecha: " 2026-10-09 ", moneda: "mxn", total: 1, lineas: [{ tipoIva: 21, base: 1 }] }, estado: "cualquiera", origenTipo: { fuente: "otra" } });
  assert.equal(c.datos.fecha, "2026-10-09");
  assert.equal(c.datos.moneda, "MXN");
  assert.equal(c.datos.lineas[0].cuota, 0);
  assert.equal(c.estado, "pendiente");
  assert.equal(c.origenTipo, null);
  assert.equal(c.tipoDocumento, "ticket");
});

test("concepto: se lee de la fila, viaja en los cambios y se guarda recortado", () => {
  const ficha = fichaDesdeFila({ ...FILA_T4B, concepto: "Compra de alimentación" }, "u");
  assert.equal(ficha.datos.concepto, "Compra de alimentación");
  assert.equal(fichaDesdeFila(FILA_T4B, "u").datos.concepto, null);
  const cambios = leerCambios({ datos: { ...ficha.datos, concepto: "  Gasolina " }, tipoDocumento: "ticket", revision: {}, origenTipo: null, estado: "pendiente" });
  assert.equal(cambios.datos.concepto, "Gasolina");
  const r = filasParaGuardar({ ...cambios, datos: { ...cambios.datos, concepto: "x".repeat(250) } }, 2, AHORA);
  assert.equal(r.factura.concepto.length, 200);
});
