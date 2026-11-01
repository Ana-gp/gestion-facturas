// Pruebas de las reglas de duplicados (#22). Mismas reglas que buscar_duplicados (SQL).
// Ejecutar con: npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { motivoDuplicado, normalizar } from "../../lib/duplicados/motivo.ts";

// El par real de tests/tickets: extra-mercadona-cerca.jpg y extra-mercadona-lejos.jpg (PR #59).
const CERCA = { emisorNombre: "Mercadona, S.A.", emisorNif: "A46103834", numero: "2939-015-397739", fecha: "2026-10-23", total: 13.1, huella: "aaa" };
const LEJOS = { ...CERCA, huella: "bbb" };

test("el mismo archivo es duplicado aunque falten datos", () => {
  assert.equal(motivoDuplicado({ ...CERCA, emisorNif: null, numero: null, total: null }, { emisorNombre: null, emisorNif: null, numero: null, fecha: null, total: null, huella: "aaa" }), "mismo-archivo");
});

test("dos fotos del mismo ticket de Mercadona: mismo NIF, número y total", () => {
  assert.equal(motivoDuplicado(CERCA, LEJOS), "mismo-nif-numero-total");
});

test("el número se compara sin guiones, espacios ni barras", () => {
  assert.equal(normalizar("2939-015 / 397739"), "2939015397739");
  assert.equal(motivoDuplicado(CERCA, { ...LEJOS, numero: "2939 015 397739", emisorNif: "a-46103834" }), "mismo-nif-numero-total");
});

test("otro ticket del mismo comercio no es duplicado", () => {
  // T4b: también Mercadona, pero otro número y otro total.
  assert.equal(motivoDuplicado(CERCA, { ...LEJOS, numero: "2939-017-128100", total: 56.53 }), null);
});

test("mismo número pero distinto total no es duplicado", () => {
  assert.equal(motivoDuplicado(CERCA, { ...LEJOS, total: 13.11 }), null);
});

test("si tiene NIF y número, no se aplica la regla de emisor, fecha y total", () => {
  assert.equal(motivoDuplicado(CERCA, { ...LEJOS, numero: "otro" }), null);
});

test("sin número: mismo emisor (sin distinguir mayúsculas), fecha y total", () => {
  const peaje = { emisorNombre: "AUCALSA", emisorNif: "A28415784", numero: null, fecha: "2026-10-25", total: 10.2 };
  assert.equal(motivoDuplicado(peaje, { ...peaje, emisorNombre: " aucalsa " }), "mismo-emisor-fecha-total");
  assert.equal(motivoDuplicado(peaje, { ...peaje, fecha: "2026-10-26" }), null);
});
