// Pruebas de la configuración del cliente de Supabase (#18).
// Ejecutar con: npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { validarConfig } from "../../lib/supabase/config.ts";

const URL = "https://ejemplo123.supabase.co";
const CLAVE = "sb_publishable_ejemploNoReal";

test("acepta la URL y la clave publicable", () => {
  assert.deepEqual(validarConfig(URL, CLAVE), { url: URL, clave: CLAVE });
});

test("quita espacios y la barra final de la URL", () => {
  assert.deepEqual(validarConfig(` ${URL}/ `, ` ${CLAVE} `), { url: URL, clave: CLAVE });
});

test("sin variables devuelve null (se ven los datos de ejemplo)", () => {
  assert.equal(validarConfig(undefined, undefined), null);
  assert.equal(validarConfig(URL, ""), null);
  assert.equal(validarConfig("", CLAVE), null);
});

test("rechaza una clave secreta puesta por error en el navegador", () => {
  assert.equal(validarConfig(URL, "sb_secret_ejemploNoReal"), null);
});

test("rechaza una URL que no es https o que lleva una ruta", () => {
  assert.equal(validarConfig("http://ejemplo123.supabase.co", CLAVE), null);
  assert.equal(validarConfig(`${URL}/rest/v1`, CLAVE), null);
});
