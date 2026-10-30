// Pruebas de la subida (#14 y #15): formatos, tamaño y servicio de prueba.
// Ejecutar con: npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { validarArchivo, tamanoLegible, TAMANO_MAXIMO_MB, ACEPTA } from "../../lib/subida/archivos.ts";
import { serviciosDePrueba } from "../../lib/subida/contrato.ts";

const MB = 1024 * 1024;

test("admite PDF, JPG, PNG y HEIC", () => {
  for (const [name, type] of [["a.pdf", "application/pdf"], ["a.jpg", "image/jpeg"], ["a.png", "image/png"], ["IMG_2041.HEIC", "image/heic"], ["b.heif", "image/heif"]]) {
    assert.equal(validarArchivo({ name, type, size: 2 * MB }).valido, true, name);
  }
});

test("HEIC sin tipo del navegador se reconoce por la extensión", () => {
  assert.deepEqual(validarArchivo({ name: "IMG_2041.heic", type: "", size: MB }), { valido: true, formato: "HEIC" });
});

test("rechaza otros formatos aunque la extensión parezca válida", () => {
  const r = validarArchivo({ name: "factura.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: MB });
  assert.equal(r.valido, false);
  assert.equal(r.motivo, "formato");
  assert.equal(validarArchivo({ name: "falso.pdf", type: "text/plain", size: MB }).valido, false);
});

test("rechaza archivos de más del tamaño máximo y vacíos", () => {
  assert.equal(validarArchivo({ name: "a.jpg", type: "image/jpeg", size: TAMANO_MAXIMO_MB * MB }).valido, true);
  const grande = validarArchivo({ name: "a.jpg", type: "image/jpeg", size: TAMANO_MAXIMO_MB * MB + 1 });
  assert.equal(grande.valido, false);
  assert.equal(grande.motivo, "tamano");
  assert.equal(validarArchivo({ name: "a.jpg", type: "image/jpeg", size: 0 }).motivo, "vacio");
});

test("accept incluye tipos y extensiones", () => {
  assert.match(ACEPTA, /application\/pdf/);
  assert.match(ACEPTA, /\.heic/);
});

test("tamaño legible", () => {
  assert.equal(tamanoLegible(850 * 1024), "850 KB");
  assert.equal(tamanoLegible(2.4 * MB), "2,4 MB");
});

test("servicio de prueba: sube, encuentra la huella repetida y lee", async () => {
  const s = serviciosDePrueba();
  assert.equal(await s.buscarPorHuella("h1"), null);
  const { documentoId } = await s.subirDocumento(new File(["x"], "ticket.jpg"), "h1", "foto");
  const antes = await s.buscarPorHuella("h1");
  assert.equal(antes.documentoId, documentoId);
  assert.equal(antes.facturaId, null, "sin leer todavía no tiene factura");
  assert.deepEqual(await s.leerDocumento(documentoId), { estado: "leido", facturaId: "t4b" });
  assert.equal((await s.buscarPorHuella("h1")).facturaId, "t4b", "después de leer, el repetido enlaza a su factura");
  const otro = await s.subirDocumento(new File(["y"], "error-lectura.jpg"), "h2", "arrastrar");
  assert.equal((await s.leerDocumento(otro.documentoId)).estado, "error");
});
