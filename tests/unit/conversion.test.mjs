// Pruebas de la conversión de moneda (#20).
// Ejecutar con: npm test
// Los tipos de este archivo son VALORES DE PRUEBA inventados, no tipos reales del BCE.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  esMonedaDelBce,
  leerCsvDelBce,
  notaDeLaFecha,
  periodoDeBusqueda,
  textoDelTipo,
  tipoParaLaFecha,
  totalEnEuros,
  urlDelBce,
} from "../../lib/moneda/conversion.ts";

// Mismo formato que devuelve la API del BCE con format=csvdata (columnas recortadas).
const CSV = [
  "KEY,FREQ,CURRENCY,CURRENCY_DENOM,EXR_TYPE,EXR_SUFFIX,TIME_PERIOD,OBS_VALUE,OBS_STATUS,TITLE",
  'EXR.D.MXN.EUR.SP00.A,D,MXN,EUR,SP00,A,2024-01-02,18.7000,A,"Mexican peso/Euro"',
  'EXR.D.MXN.EUR.SP00.A,D,MXN,EUR,SP00,A,2024-01-04,18.6500,A,"Mexican peso/Euro"',
  'EXR.D.MXN.EUR.SP00.A,D,MXN,EUR,SP00,A,2024-01-03,18.6000,A,"Mexican peso/Euro"',
  'EXR.D.MXN.EUR.SP00.A,D,MXN,EUR,SP00,A,2024-01-05,18.6800,A,"Mexican peso, ""MXN""/Euro"',
].join("\n");

test("lee el CSV del BCE por el nombre de las columnas y ordena por fecha", () => {
  const obs = leerCsvDelBce(CSV);
  assert.equal(obs.length, 4);
  assert.deepEqual(obs[0], { fecha: "2024-01-02", tipo: 18.7 });
  assert.deepEqual(obs.at(-1), { fecha: "2024-01-05", tipo: 18.68 });
});

test("un CSV sin las columnas esperadas da error claro", () => {
  assert.throws(() => leerCsvDelBce("A,B\n1,2"), /TIME_PERIOD/);
});

test("Bodega Aurrera: factura del sábado 06/01/2024 usa el tipo del viernes 05/01", () => {
  const elegido = tipoParaLaFecha(leerCsvDelBce(CSV), "2024-01-06");
  assert.deepEqual(elegido, { fecha: "2024-01-05", tipo: 18.68 });
  assert.equal(notaDeLaFecha(elegido.fecha, "2024-01-06"), "Ese día no hubo tipo publicado: se usa el del 05/01/2024, el último anterior.");
});

test("si hay tipo el mismo día, se usa ese y no hay nota", () => {
  const elegido = tipoParaLaFecha(leerCsvDelBce(CSV), "2024-01-03");
  assert.deepEqual(elegido, { fecha: "2024-01-03", tipo: 18.6 });
  assert.equal(notaDeLaFecha(elegido.fecha, "2024-01-03"), null);
});

test("nunca usa un tipo posterior a la factura", () => {
  assert.equal(tipoParaLaFecha(leerCsvDelBce(CSV), "2024-01-01"), null);
});

test("total en euros con la fórmula de la base de datos: total ÷ tipo, 2 decimales", () => {
  assert.equal(totalEnEuros(635.02, 18.68), 33.99);
  assert.equal(totalEnEuros(19.56, 1.1133), 17.57);
  assert.throws(() => totalEnEuros(10, 0));
});

test("periodo de búsqueda: diez días antes de la factura hasta la factura", () => {
  assert.deepEqual(periodoDeBusqueda("2024-01-06"), { desde: "2023-12-27", hasta: "2024-01-06" });
  assert.deepEqual(periodoDeBusqueda("2024-03-01"), { desde: "2024-02-20", hasta: "2024-03-01" });
});

test("URL de la API del BCE", () => {
  assert.equal(
    urlDelBce("mxn", "2023-12-27", "2024-01-06"),
    "https://data-api.ecb.europa.eu/service/data/EXR/D.MXN.EUR.SP00.A?startPeriod=2023-12-27&endPeriod=2024-01-06&format=csvdata",
  );
});

test("monedas con tipo del BCE", () => {
  assert.ok(esMonedaDelBce("usd"));
  assert.ok(esMonedaDelBce("MXN"));
  assert.ok(!esMonedaDelBce("ARS"));
  assert.ok(!esMonedaDelBce("EUR"));
});

test("texto del tipo para la pantalla", () => {
  assert.equal(textoDelTipo(18.68, "MXN"), "1 € = 18,6800 MXN");
});
