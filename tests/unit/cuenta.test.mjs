// Pruebas de P15 · Mi cuenta: los datos que la persona puede cambiar.
// Ejecutar con: npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { NOMBRE_MAXIMO, validarDatosCuenta } from "../../lib/cuenta/datos.ts";

test("guarda el nombre y el NIF limpios", () => {
  assert.deepEqual(validarDatosCuenta("  Ana   García ", "12345678-z"), { datos: { nombre: "Ana García", nif: "12345678Z" } });
});

test("nombre y NIF vacíos se guardan como sin dato", () => {
  assert.deepEqual(validarDatosCuenta("", " "), { datos: { nombre: null, nif: null } });
});

test("rechaza un NIF con la letra mal", () => {
  assert.ok("error" in validarDatosCuenta("Ana", "12345678A"));
});

test("acepta un CIF y un NIE válidos", () => {
  assert.ok("datos" in validarDatosCuenta("", "A46103834"));
  assert.ok("datos" in validarDatosCuenta("", "X1234567L"));
});

test("rechaza un nombre demasiado largo", () => {
  assert.ok("error" in validarDatosCuenta("a".repeat(NOMBRE_MAXIMO + 1), ""));
});
