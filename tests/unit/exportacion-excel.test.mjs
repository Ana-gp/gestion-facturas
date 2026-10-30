// Pruebas de la exportación a Excel (#23).
// Ejecutar con: node --test "tests/unit/*.test.mjs"
// Usa los valores reales de los tickets de prueba (docs/valores-reales-tickets.xlsx
// y PR #48), que también están en docs/ejemplo-exportacion.xlsx.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  filasGastos,
  resumenDe,
  generarExcel,
  filtrarPorPeriodo,
  rangoDelPeriodo,
  nombreDelExcel,
  nombreArchivoOriginal,
  avisosDe,
  aEuros,
  serieExcel,
  crc32,
} from "../../lib/exportacion/excel.ts";

function factura(datos) {
  return {
    tipoDocumento: "ticket",
    numero: null,
    emisorNif: null,
    receptorNif: null,
    categoria: null,
    moneda: "EUR",
    totalEur: null,
    tipoCambio: null,
    tipoCambioFecha: null,
    retencionImporte: null,
    estadoRevision: "revisada",
    posibleDuplicado: false,
    nombreArchivo: "original.jpg",
    ...datos,
    totalEur: datos.moneda && datos.moneda !== "EUR" ? (datos.totalEur ?? null) : datos.total,
  };
}

const TICKETS = [
  factura({ id: "t2", fecha: "2025-09-02", numero: "132740032509026056", emisorNombre: "Vego Supermercados S.A.U.", emisorNif: "A36651313", categoria: "Alimentación", total: 115.2, nombreArchivo: "T2.jpg",
    lineas: [{ tipoIva: 10, base: 44.58, cuota: 4.46 }, { tipoIva: 21, base: 10.29, cuota: 2.16 }, { tipoIva: 4, base: 51.64, cuota: 2.07 }] }),
  factura({ id: "t1g", fecha: "2026-03-07", numero: "2023018651", emisorNombre: "E.S. Villaquejida - Sutecal", emisorNif: "B49268071", categoria: "Combustible y transporte", total: 106.74, nombreArchivo: "T1-gasolinera.jpg",
    lineas: [{ tipoIva: 21, base: 88.21, cuota: 18.53 }] }),
  factura({ id: "e3", fecha: "2026-06-25", numero: "20832606010734", emisorNombre: "DRUNI, S.A.", emisorNif: "A46581666", categoria: "Otros", total: 28.89, nombreArchivo: "E3.pdf",
    lineas: [{ tipoIva: 21, base: 17.28, cuota: 3.63 }, { tipoIva: 4, base: 7.67, cuota: 0.31 }] }),
  factura({ id: "t4", fecha: "2026-08-29", numero: "1 / 388087", emisorNombre: "Cerveceria Celtica S.L.", emisorNif: "B24610297", categoria: "Restauración y dietas", total: 21, nombreArchivo: "T4.jpg",
    lineas: [{ tipoIva: 10, base: 19.09, cuota: 1.91 }] }),
  factura({ id: "t1a", fecha: "2026-09-08", emisorNombre: "Alcampo Santa Nonia", categoria: "Alimentación", total: 5.79, nombreArchivo: "T1-alcampo.jpg",
    lineas: [{ tipoIva: 4, base: 4.05, cuota: 0.15 }, { tipoIva: 21, base: 1.31, cuota: 0.28 }] }),
  factura({ id: "t3", fecha: "2026-10-14", tipoDocumento: "factura", numero: "9BF0758D-8771996", emisorNombre: "Anthropic Ireland, Limited", emisorNif: "IE4276970QH", categoria: "Software y suscripciones", total: 21.78, nombreArchivo: "T3.pdf",
    lineas: [{ tipoIva: 21, base: 18, cuota: 3.78 }] }),
  factura({ id: "e2", fecha: "2026-10-19", numero: "N0020008261019000107", emisorNombre: "Centros Comerciales Carrefour S.A.", emisorNif: "A28425270", categoria: "Otros", total: 9.99, nombreArchivo: "E2.pdf",
    lineas: [{ tipoIva: 21, base: 8.26, cuota: 1.73 }] }),
  factura({ id: "e1", fecha: "2026-10-25", emisorNombre: "AUCALSA", emisorNif: "A28415784", categoria: "Combustible y transporte", total: 10.2, nombreArchivo: "E1.jpg",
    lineas: [{ tipoIva: 21, base: 8.43, cuota: 1.77 }] }),
];

test("una fila por cada tipo de IVA: 8 documentos dan 12 filas", () => {
  const filas = filasGastos(TICKETS);
  assert.equal(filas.length, 12);
  const vego = filas.filter((f) => f.emisor === "Vego Supermercados S.A.U.");
  assert.equal(vego.length, 3);
  assert.ok(vego.every((f) => f.orden === vego[0].orden), "las filas de una factura comparten número de orden");
});

test("el total y la retención solo van en la primera fila de cada factura", () => {
  const vego = filasGastos(TICKETS).filter((f) => f.emisor === "Vego Supermercados S.A.U.");
  assert.equal(vego[0].totalEur, 115.2);
  assert.equal(vego[1].totalEur, null);
  assert.equal(vego[2].totalEur, null);
});

test("la suma de la columna de totales es el total real (319,59 €)", () => {
  const suma = filasGastos(TICKETS).reduce((s, f) => s + (f.totalEur ?? 0), 0);
  assert.equal(Math.round(suma * 100) / 100, 319.59);
});

test("resumen por tipo de IVA coincide con el Excel de ejemplo", () => {
  const r = resumenDe(TICKETS);
  assert.equal(r.documentos, 8);
  assert.equal(r.totalEur, 319.59);
  assert.deepEqual(r.porTipoIva, [
    { tipoIva: 21, base: 151.78, cuota: 31.88 },
    { tipoIva: 10, base: 63.67, cuota: 6.37 },
    { tipoIva: 4, base: 63.36, cuota: 2.53 },
  ]);
  assert.equal(r.conAvisos, 8, "ningún ticket de prueba tiene NIF del receptor");
  assert.equal(r.pendientesDeRevisar, 0);
});

test("orden por fecha y nombre del original para el paquete", () => {
  const filas = filasGastos(TICKETS);
  assert.equal(filas[0].emisor, "Vego Supermercados S.A.U.");
  const gasolinera = filas.find((f) => f.emisor === "E.S. Villaquejida - Sutecal");
  assert.equal(gasolinera.orden, 2);
  assert.equal(gasolinera.archivoOriginal, "002_2026-03-07_E-S-Villaquejida-Sutecal.jpg");
  assert.equal(nombreArchivoOriginal(7, null, "Cafetería Ñandú", "FOTO.JPEG"), "007_sin-fecha_Cafeteria-Nandu.jpeg");
});

test("avisos: sin NIF del receptor, sin NIF del emisor y posible duplicado", () => {
  const alcampo = TICKETS.find((t) => t.id === "t1a");
  assert.deepEqual(avisosDe(alcampo), ["Sin NIF del receptor", "Sin NIF del emisor"]);
  const conNif = { ...alcampo, receptorNif: "12345678Z", emisorNif: "A00000000", posibleDuplicado: true };
  assert.deepEqual(avisosDe(conNif), ["Posible duplicado"]);
});

test("factura en dólares: importes en euros con el tipo de cambio de la factura", () => {
  const usd = factura({ id: "usd", fecha: "2026-10-20", tipoDocumento: "factura", emisorNombre: "Software Ejemplo Inc.", emisorNif: "US000000000", receptorNif: "B00000000",
    moneda: "USD", total: 21.78, totalEur: 19.56, tipoCambio: 1.1133, tipoCambioFecha: "2026-10-20", nombreArchivo: "factura.pdf",
    lineas: [{ tipoIva: 21, base: 18, cuota: 3.78 }] });
  const [fila] = filasGastos([usd]);
  assert.equal(fila.baseEur, 16.17);
  assert.equal(fila.cuotaEur, 3.4);
  assert.equal(fila.totalEur, 19.56);
  assert.equal(fila.totalMonedaOriginal, 21.78);
  assert.equal(fila.moneda, "USD");
  assert.equal(fila.tipoCambio, 1.1133);
  assert.equal(fila.avisos, "");
});

test("conversión pendiente: no se inventan importes en euros", () => {
  const pendiente = factura({ id: "p", fecha: "2026-10-21", emisorNombre: "Hotel Ejemplo", emisorNif: "X1", receptorNif: "B1", moneda: "GBP", total: 50,
    estadoRevision: "pendiente", lineas: [{ tipoIva: 20, base: 41.67, cuota: 8.33 }] });
  const [fila] = filasGastos([pendiente]);
  assert.equal(fila.baseEur, null);
  assert.equal(fila.cuotaEur, null);
  assert.equal(fila.totalEur, null);
  assert.equal(fila.totalMonedaOriginal, 50);
  assert.match(fila.avisos, /Conversión pendiente/);
  assert.equal(fila.estado, "Pendiente de revisar");
  const r = resumenDe([pendiente]);
  assert.equal(r.totalEur, 0);
  assert.equal(r.conversionesPendientes, 1);
  assert.deepEqual(r.porTipoIva, []);
  assert.equal(aEuros(10, pendiente), null);
});

test("una factura sin líneas de IVA (por ejemplo, error de lectura) ocupa una fila", () => {
  const sinLineas = factura({ id: "s", fecha: "2026-10-22", emisorNombre: "Ejemplo", total: 12, estadoRevision: "pendiente", lineas: [] });
  const filas = filasGastos([sinLineas]);
  assert.equal(filas.length, 1);
  assert.equal(filas[0].tipoIva, null);
  assert.equal(filas[0].totalEur, 12);
});

test("periodos: mes, trimestre y año", () => {
  assert.deepEqual(rangoDelPeriodo({ tipo: "trimestre", anio: 2026, trimestre: 4 }), { desde: "2026-10-01", hasta: "2026-12-31" });
  assert.deepEqual(rangoDelPeriodo({ tipo: "trimestre", anio: 2026, trimestre: 1 }), { desde: "2026-01-01", hasta: "2026-03-31" });
  assert.deepEqual(rangoDelPeriodo({ tipo: "mes", anio: 2028, mes: 2 }), { desde: "2028-02-01", hasta: "2028-02-29" });
  assert.deepEqual(rangoDelPeriodo({ tipo: "anio", anio: 2026 }), { desde: "2026-01-01", hasta: "2026-12-31" });
  assert.equal(nombreDelExcel({ tipo: "trimestre", anio: 2026, trimestre: 4 }), "Ticketon_gastos_2026-T4.xlsx");
  assert.equal(nombreDelExcel({ tipo: "mes", anio: 2026, mes: 3 }), "Ticketon_gastos_2026-03.xlsx");
});

test("el periodo cuenta por la fecha de la factura y aparta las que no tienen fecha", () => {
  const sinFecha = factura({ id: "nf", fecha: null, emisorNombre: "Sin fecha", total: 1, lineas: [] });
  const { incluidas, sinFecha: apartadas } = filtrarPorPeriodo([...TICKETS, sinFecha], { tipo: "trimestre", anio: 2026, trimestre: 4 });
  assert.deepEqual(incluidas.map((f) => f.id), ["t3", "e2", "e1"]);
  assert.deepEqual(apartadas.map((f) => f.id), ["nf"]);
});

test("fechas como número de serie de Excel", () => {
  assert.equal(serieExcel("2025-01-01"), 45658);
  assert.equal(serieExcel("1900-03-01"), 61);
});

test("genera un .xlsx válido y siempre igual para los mismos datos", () => {
  const opciones = { periodo: { tipo: "anio", anio: 2026 }, titular: "Cuenta de ejemplo", fechaExportacion: "2026-10-29" };
  const a = generarExcel(TICKETS, opciones);
  const b = generarExcel(TICKETS, opciones);
  assert.equal(a.nombre, "Ticketon_gastos_2026.xlsx");
  assert.equal(a.resumen.documentos, 7, "el ticket de 2025 queda fuera del año 2026");
  const bytes = a.contenido;
  assert.deepEqual([...bytes.slice(0, 4)], [0x50, 0x4b, 0x03, 0x04], "empieza como un ZIP");
  const fin = new DataView(bytes.buffer, bytes.byteOffset + bytes.length - 22, 22);
  assert.equal(fin.getUint32(0, true), 0x06054b50, "termina con el directorio del ZIP");
  assert.equal(fin.getUint16(10, true), 7, "contiene los 7 archivos del .xlsx");
  assert.equal(crc32(a.contenido), crc32(b.contenido));
});

test("CRC32 conocido", () => {
  assert.equal(crc32(new TextEncoder().encode("123456789")), 0xcbf43926);
});
