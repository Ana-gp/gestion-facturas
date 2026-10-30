// Pruebas de la revisión (#21), el aviso de trimestre (#27) y la huella del archivo (#22).
// Ejecutar con: node --test "tests/unit/*.test.mjs"

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  comprobarCuadre,
  lineasQueNoCuadran,
  faltaParaRevisada,
  puedeMarcarseRevisada,
  formatoNifValido,
  confianzaPorReglas,
  camposARevisar,
  marcarCorregido,
  avisosDeLaFicha,
} from "../../lib/revision/comprobaciones.ts";
import { avisoTrimestre, finDelTrimestre, trimestreDe } from "../../lib/avisos/trimestre.ts";
import { huellaSha256, archivoRepetido, mensajeArchivoRepetido } from "../../lib/subida/huella.ts";

function datos(extra) {
  return {
    fecha: "2025-09-02",
    emisorNombre: "Vego Supermercados S.A.U.",
    emisorNif: "A36651313",
    receptorNif: null,
    numero: "132740032509026056",
    categoria: "Alimentación",
    moneda: "EUR",
    total: 115.2,
    totalEur: 115.2,
    tipoCambio: null,
    retencionImporte: null,
    lineas: [
      { tipoIva: 10, base: 44.58, cuota: 4.46 },
      { tipoIva: 21, base: 10.29, cuota: 2.16 },
      { tipoIva: 4, base: 51.64, cuota: 2.07 },
    ],
    ...extra,
  };
}

// --- Cuentas -----------------------------------------------------------------

test("los tickets reales cuadran (supermercado con 3 tipos de IVA, gasolinera, Alcampo)", () => {
  assert.equal(comprobarCuadre(datos()).estado, "cuadra");
  assert.equal(comprobarCuadre(datos({ total: 106.74, lineas: [{ tipoIva: 21, base: 88.21, cuota: 18.53 }] })).estado, "cuadra");
  const alcampo = datos({ total: 5.79, lineas: [{ tipoIva: 4, base: 4.05, cuota: 0.15 }, { tipoIva: 21, base: 1.31, cuota: 0.28 }] });
  assert.equal(comprobarCuadre(alcampo).estado, "cuadra");
  assert.deepEqual(lineasQueNoCuadran(alcampo), []);
});

test("avisa si no cuadra y nunca corrige el importe", () => {
  const d = datos({ total: 125.2 });
  const r = comprobarCuadre(d);
  assert.equal(r.estado, "no-cuadra");
  assert.equal(r.esperado, 115.2);
  assert.equal(r.diferencia, 10);
  assert.match(r.mensaje, /115,20.*125,20/);
  assert.equal(d.total, 125.2, "el total no se toca");
});

test("la retención de IRPF resta del total (base 100 + IVA 21 − IRPF 15 = 106)", () => {
  const conRetencion = datos({ total: 106, retencionImporte: 15, lineas: [{ tipoIva: 21, base: 100, cuota: 21 }] });
  assert.equal(comprobarCuadre(conRetencion).estado, "cuadra");
  assert.equal(comprobarCuadre({ ...conRetencion, retencionImporte: null }).estado, "no-cuadra", "sin la retención saldría un aviso falso");
});

test("sin total o sin líneas no se puede comprobar", () => {
  assert.equal(comprobarCuadre(datos({ total: null })).estado, "sin-datos");
  assert.equal(comprobarCuadre(datos({ lineas: [] })).estado, "sin-datos");
});

test("detecta una cuota que no corresponde a su base", () => {
  const d = datos({ lineas: [{ tipoIva: 21, base: 100, cuota: 12 }], total: 112 });
  assert.deepEqual(lineasQueNoCuadran(d), [{ indice: 0, cuotaEsperada: 21 }]);
});

// --- Marcar como revisada -----------------------------------------------------

test("para marcar como revisada hacen falta fecha, emisor, total y categoría", () => {
  assert.equal(puedeMarcarseRevisada(datos()), true);
  assert.deepEqual(faltaParaRevisada(datos({ fecha: null, categoria: "  ", total: null })), ["fecha", "total", "categoria"]);
});

test("en otra moneda, sin tipo de cambio no se puede marcar como revisada", () => {
  const usd = datos({ moneda: "USD", tipoCambio: null, totalEur: null });
  assert.deepEqual(faltaParaRevisada(usd), ["tipo_cambio"]);
  assert.equal(puedeMarcarseRevisada({ ...usd, tipoCambio: 1.1133, totalEur: 103.48 }), true);
});

test("sin NIF del receptor se puede guardar igual", () => {
  assert.equal(puedeMarcarseRevisada(datos({ receptorNif: null })), true);
});

// --- NIF -----------------------------------------------------------------------

test("los NIF reales de los tickets de prueba tienen formato válido", () => {
  for (const nif of ["A36651313", "B49268071", "A46581666", "B24610297", "A28425270", "A28415784", "IE4276970QH", "ESA36651313"]) {
    assert.equal(formatoNifValido(nif), true, nif);
  }
});

test("DNI y NIE con su letra de control", () => {
  assert.equal(formatoNifValido("12345678Z"), true);
  assert.equal(formatoNifValido("12345678A"), false);
  assert.equal(formatoNifValido("X1234567L"), true);
  assert.equal(formatoNifValido("Y-1234567-X"), true, "admite guiones");
});

test("detecta NIF mal leídos", () => {
  assert.equal(formatoNifValido("A36651314"), false, "control del CIF equivocado");
  assert.equal(formatoNifValido("3665131"), false);
  assert.equal(formatoNifValido("ES123"), false);
});

// --- Confianza y "Revisar dato" ------------------------------------------------

test("un ticket bien leído no tiene nada que revisar (el NIF del receptor vacío no cuenta)", () => {
  assert.deepEqual(camposARevisar(datos()), []);
});

test("los vacíos y las cuentas que no cuadran se marcan para revisar", () => {
  const d = datos({ fecha: null, total: 125.2 });
  assert.deepEqual(camposARevisar(d), ["fecha", "lineas_iva", "total"]);
});

test("un NIF con formato extraño baja a confianza media, sin marcarlo como error", () => {
  const c = confianzaPorReglas(datos({ emisorNif: "A36651314" }));
  assert.equal(c.emisor_nif, "media");
  assert.deepEqual(camposARevisar(datos({ emisorNif: "A36651314" })), []);
});

test("la confianza baja de la IA se respeta y desaparece al corregir el campo", () => {
  let revision = { numero: { confianza: "baja", corregido: false } };
  assert.deepEqual(camposARevisar(datos(), revision), ["numero"]);
  revision = marcarCorregido(revision, "numero");
  assert.deepEqual(revision.numero, { confianza: "baja", corregido: true });
  assert.deepEqual(camposARevisar(datos(), revision), []);
});

// --- Avisos de la ficha ----------------------------------------------------------

test("avisos de la ficha en lenguaje del usuario", () => {
  const avisos = avisosDeLaFicha(datos({ moneda: "USD", tipoCambio: null, totalEur: null, total: 125.2 }), { posibleDuplicado: true });
  assert.deepEqual(avisos.map((a) => a.clave), ["duplicado", "sin-nif-receptor", "no-cuadra", "conversion-pendiente"]);
  assert.equal(avisos[3].texto, "Factura en USD: falta el tipo de cambio.");
});

// --- Aviso de trimestre ----------------------------------------------------------

test("el aviso de trimestre sale desde 15 días antes del fin hasta el último día", () => {
  assert.equal(avisoTrimestre("2026-12-15"), null, "16 días antes: todavía no");
  const a = avisoTrimestre("2026-12-16");
  assert.equal(a.diasRestantes, 15);
  assert.equal(a.trimestre, 4);
  assert.equal(a.fin, "2026-12-31");
  assert.match(a.texto, /^Quedan 15 días para que termine el 4\.º trimestre/);
  assert.match(avisoTrimestre("2026-12-30").texto, /^Mañana termina/);
  assert.match(avisoTrimestre("2026-12-31").texto, /^Hoy termina/);
  assert.equal(avisoTrimestre("2027-01-01"), null, "ya en el trimestre siguiente, recién empezado");
});

test("hoy, 29/10/2026, no toca avisar", () => {
  assert.equal(avisoTrimestre("2026-10-29"), null);
});

test("último día de cada trimestre", () => {
  assert.equal(finDelTrimestre(2026, 1), "2026-03-31");
  assert.equal(finDelTrimestre(2026, 2), "2026-06-30");
  assert.equal(finDelTrimestre(2026, 3), "2026-09-30");
  assert.deepEqual(trimestreDe("2026-07-01"), { anio: 2026, trimestre: 3 });
});

// --- Huella del archivo ----------------------------------------------------------

test("huella SHA-256 conocida y la misma para Blob, ArrayBuffer y Uint8Array", async () => {
  const bytes = new TextEncoder().encode("abc");
  const esperada = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";
  assert.equal(await huellaSha256(bytes), esperada);
  assert.equal(await huellaSha256(bytes.buffer), esperada);
  assert.equal(await huellaSha256(new Blob([bytes])), esperada);
});

test("archivo repetido: mismo archivo, aunque cambie el nombre", async () => {
  const huella = await huellaSha256(new TextEncoder().encode("ticket de gasolinera"));
  const existentes = [{ documentoId: "d1", huella: huella.toUpperCase(), subidoEl: "2026-10-28" }];
  const repetido = archivoRepetido(huella, existentes);
  assert.equal(repetido.documentoId, "d1");
  assert.equal(mensajeArchivoRepetido(repetido), "Ya subiste este archivo el 28/10/2026.");
  const otra = await huellaSha256(new TextEncoder().encode("ticket de gasolinera."));
  assert.equal(archivoRepetido(otra, existentes), null);
});
