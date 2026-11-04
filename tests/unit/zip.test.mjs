// Pruebas de la subida de un ZIP con varios tickets (04/11/2026).
// Ejecutar con: npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { deflateRawSync } from "node:zlib";
import { MAXIMO_ARCHIVOS_ZIP, MAXIMO_ZIP_MB, archivosDelZip, esZip, nombreDeEntrada, resumenDelZip } from "../../lib/subida/zip.ts";

/** Un ZIP de verdad: entradas [nombre, bytes, comprimir?]. */
function zip(entradas) {
  const locales = [];
  const central = [];
  let pos = 0;
  for (const [nombre, datos, comprimir, banderas = 0x800] of entradas) {
    const n = Buffer.isBuffer(nombre) ? nombre : Buffer.from(nombre, "utf8");
    const cuerpo = comprimir ? deflateRawSync(datos) : Buffer.from(datos);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(banderas, 6);
    local.writeUInt16LE(comprimir ? 8 : 0, 8);
    local.writeUInt32LE(cuerpo.length, 18);
    local.writeUInt32LE(datos.length, 22);
    local.writeUInt16LE(n.length, 26);
    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50, 0);
    c.writeUInt16LE(20, 4);
    c.writeUInt16LE(20, 6);
    c.writeUInt16LE(banderas, 8);
    c.writeUInt16LE(comprimir ? 8 : 0, 10);
    c.writeUInt32LE(cuerpo.length, 20);
    c.writeUInt32LE(datos.length, 24);
    c.writeUInt16LE(n.length, 28);
    c.writeUInt32LE(pos, 42);
    locales.push(local, n, cuerpo);
    central.push(c, n);
    pos += 30 + n.length + cuerpo.length;
  }
  const dir = Buffer.concat(central);
  const fin = Buffer.alloc(22);
  fin.writeUInt32LE(0x06054b50, 0);
  fin.writeUInt16LE(entradas.length, 8);
  fin.writeUInt16LE(entradas.length, 10);
  fin.writeUInt32LE(dir.length, 12);
  fin.writeUInt32LE(pos, 16);
  return new Blob([Buffer.concat([...locales, dir, fin])]);
}

const PDF = Buffer.from("%PDF-1.4 factura de prueba ".repeat(40));
const JPG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, ...Array(500).fill(7)]);

test("abre los PDF y las fotos de dentro, comprimidos o no, con su tipo", async () => {
  const r = await archivosDelZip(zip([["facturas/octubre.pdf", PDF, true], ["ticket.JPG", JPG, false]]));
  assert.deepEqual(r.archivos.map((f) => [f.name, f.type, f.size]), [["octubre.pdf", "application/pdf", PDF.length], ["ticket.JPG", "image/jpeg", JPG.length]]);
  assert.deepEqual(Buffer.from(await r.archivos[0].arrayBuffer()), PDF);
  assert.equal(r.omitidos.length, 0);
});

test("se salta carpetas, restos de macOS y ocultos; avisa de formatos y cifrados", async () => {
  const r = await archivosDelZip(zip([["carpeta/", Buffer.alloc(0), false], ["__MACOSX/._a.pdf", PDF, false], [".DS_Store", JPG, false], ["notas.txt", Buffer.from("hola"), false], ["secreto.pdf", PDF, false, 0x801], ["bueno.png", JPG, true]]));
  assert.deepEqual(r.archivos.map((f) => f.name), ["bueno.png"]);
  assert.deepEqual(r.omitidos, [{ nombre: "notas.txt", motivo: "formato no admitido" }, { nombre: "secreto.pdf", motivo: "está protegido con contraseña" }]);
});

test("como mucho MAXIMO_ARCHIVOS_ZIP archivos por ZIP", async () => {
  const muchos = Array.from({ length: MAXIMO_ARCHIVOS_ZIP + 2 }, (_, i) => [`t${i}.jpg`, JPG, false]);
  const r = await archivosDelZip(zip(muchos));
  assert.equal(r.archivos.length, MAXIMO_ARCHIVOS_ZIP);
  assert.equal(r.omitidos.length, 2);
});

test("un archivo que no es ZIP da un error claro", async () => {
  await assert.rejects(archivosDelZip(new Blob([PDF])), /no es un ZIP válido/);
});

test("reconoce un ZIP y resume lo que pasa en una frase", () => {
  assert.ok(esZip({ name: "Tickets.ZIP", type: "" }));
  assert.ok(esZip({ name: "x", type: "application/x-zip-compressed" }));
  assert.ok(!esZip({ name: "a.pdf", type: "application/pdf" }));
  assert.equal(resumenDelZip("oct.zip", 3, []), "Del ZIP «oct.zip» se suben 3 archivos.");
  assert.equal(resumenDelZip("oct.zip", 1, [{ nombre: "a.txt", motivo: "formato no admitido" }]), "Del ZIP «oct.zip» se sube 1 archivo. No se sube: a.txt (formato no admitido).");
});

test("nombres con ñ y tildes de un ZIP hecho con Windows (CP850, sin la bandera UTF-8)", async () => {
  // «Factura_Señor_año.pdf» en CP850: ñ = 0xA4.
  const nombre = Buffer.from([...Buffer.from("Factura_Se"), 0xa4, ...Buffer.from("or_a"), 0xa4, ...Buffer.from("o.pdf")]);
  const r = await archivosDelZip(zip([[nombre, PDF, false, 0]]));
  assert.equal(r.archivos[0].name, "Factura_Señor_año.pdf");
  // Si los bytes ya son UTF-8 aunque falte la bandera, se respeta.
  assert.equal(nombreDeEntrada(Buffer.from("Café.pdf"), false), "Café.pdf");
  assert.equal(nombreDeEntrada(new Uint8Array([0xa0, 0x82, 0xa1, 0xa2, 0xa3, 0xa5]), false), "áéíóúÑ");
});

test("un ZIP de más de MAXIMO_ZIP_MB se rechaza sin abrirlo", async () => {
  const grande = { size: MAXIMO_ZIP_MB * 1024 * 1024 + 1, arrayBuffer: () => { throw new Error("no debería leerse"); } };
  await assert.rejects(archivosDelZip(grande), /más de 200 MB/);
});

test("avisa cuando el plan no tiene lecturas para todos los archivos del ZIP", () => {
  assert.equal(resumenDelZip("t.zip", 30, [], 10), "Del ZIP «t.zip» se suben 30 archivos. Te quedan 10 lecturas este mes: 20 se guardan sin leer hasta que vuelvas a tener lecturas.");
  assert.equal(resumenDelZip("t.zip", 3, [], 10), "Del ZIP «t.zip» se suben 3 archivos.");
  assert.equal(resumenDelZip("t.zip", 2, [], 1), "Del ZIP «t.zip» se suben 2 archivos. Te queda 1 lectura este mes: 1 se guarda sin leer hasta que vuelvas a tener lecturas.");
});
