// Pruebas de la marca «Corregido por ti» en Revisar (#21).
// Ejecutar con: npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { marcarTrasCambio, valorDelCampo } from "../../lib/revision/comprobaciones.ts";

const DATOS = {
  fecha: "2026-10-14",
  emisorNombre: "Mercadona",
  emisorNif: "A46103834",
  receptorNif: null,
  numero: "T3",
  categoria: "Comida",
  moneda: "EUR",
  total: 21.78,
  totalEur: 21.78,
  tipoCambio: null,
  retencionImporte: null,
  lineas: [{ tipoIva: 10, base: 19.8, cuota: 1.98 }],
};
const REVISION = { emisor_nombre: { confianza: "baja", corregido: false } };
const AL_ABRIR = { datos: DATOS, revision: REVISION };

test("un dato distinto del que había al abrir queda corregido", () => {
  const nuevos = { ...DATOS, emisorNombre: "Mercadona S.A." };
  const r = marcarTrasCambio(REVISION, "emisor_nombre", nuevos, AL_ABRIR);
  assert.deepEqual(r.emisor_nombre, { confianza: "baja", corregido: true });
});

test("si vuelve al valor de al abrir, recupera la marca que tenía", () => {
  const corregida = { emisor_nombre: { confianza: "baja", corregido: true } };
  const r = marcarTrasCambio(corregida, "emisor_nombre", DATOS, AL_ABRIR);
  assert.deepEqual(r.emisor_nombre, { confianza: "baja", corregido: false });
});

test("si el campo no tenía marca al abrir y vuelve a su valor, se quita la marca", () => {
  const corregida = { ...REVISION, numero: { confianza: "alta", corregido: true } };
  const r = marcarTrasCambio(corregida, "numero", DATOS, AL_ABRIR);
  assert.equal(r.numero, undefined);
  assert.deepEqual(r.emisor_nombre, REVISION.emisor_nombre);
});

test("la retención cuenta como parte del total", () => {
  assert.notEqual(valorDelCampo({ ...DATOS, retencionImporte: 2 }, "total"), valorDelCampo(DATOS, "total"));
  assert.notEqual(valorDelCampo({ ...DATOS, lineas: [{ tipoIva: 21, base: 18, cuota: 3.78 }] }, "lineas_iva"), valorDelCampo(DATOS, "lineas_iva"));
});
