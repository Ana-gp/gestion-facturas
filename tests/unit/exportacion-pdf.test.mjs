// Pruebas de la exportación en PDF (04/11/2026).
// Ejecutar con: npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { aWinAnsi, anchoTexto, generarPdf, nombreDelPdf, recortar } from "../../lib/exportacion/pdf.ts";

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

const AÑO = { periodo: { tipo: "anio", anio: 2026 }, titular: "ana@ejemplo.com", fechaExportacion: "2026-11-04" };

function texto(pdf) {
  return Array.from(pdf, (b) => String.fromCharCode(b)).join("");
}

test("es un PDF con su tabla xref y las posiciones de cada objeto bien", () => {
  const { contenido } = generarPdf(TICKETS, AÑO);
  const s = texto(contenido);
  assert.ok(s.startsWith("%PDF-1.4"));
  assert.ok(s.trimEnd().endsWith("%%EOF"));
  const inicio = Number(s.match(/startxref\n(\d+)/)[1]);
  assert.equal(s.slice(inicio, inicio + 4), "xref");
  const entradas = s.slice(inicio).split("\n").slice(3).filter((l) => / 00000 n $/.test(l));
  entradas.forEach((l, i) => assert.equal(s.slice(Number(l.slice(0, 10)), Number(l.slice(0, 10)) + String(i + 1).length + 6), `${i + 1} 0 obj`));
});

test("dos páginas para el año 2026: resumen y lista de gastos", () => {
  const s = texto(generarPdf(TICKETS, AÑO).contenido);
  assert.match(s, /\/Count 2 /);
  assert.ok(s.includes("(P\\341gina 1 de 2)"));
  assert.ok(s.includes("(Gastos para la gestor\\355a)"));
  // Solo los del periodo: el ticket de 2025 (Vego) no sale.
  assert.ok(!s.includes("Vego"));
});

test("muchas filas pasan a más páginas", () => {
  const muchos = Array.from({ length: 60 }, (_, i) => ({ ...TICKETS[1], id: `x${i}` }));
  const s = texto(generarPdf(muchos, AÑO).contenido);
  assert.match(s, /\/Count [3-9] /);
});

test("acentos, ñ y € en WinAnsi; recorta textos largos con …", () => {
  assert.deepEqual(aWinAnsi("añó€"), [0x61, 0xf1, 0xf3, 0x80]);
  assert.ok(anchoTexto("WWW", 10) > anchoTexto("iii", 10));
  const corto = recortar("Centros Comerciales Carrefour S.A.", 60, 8);
  assert.ok(corto.endsWith("…") && anchoTexto(corto, 8) <= 60);
});

test("nombre del archivo según el periodo", () => {
  assert.equal(nombreDelPdf({ tipo: "trimestre", anio: 2026, trimestre: 4 }), "Ticketon_gastos_2026-T4.pdf");
  assert.equal(nombreDelPdf({ tipo: "mes", anio: 2026, mes: 3 }), "Ticketon_gastos_2026-03.pdf");
});
