// Pruebas de guardar el original (#18): ruta, tipo y servicios con un
// Supabase de mentira (no se conecta a ningún sitio).
// Ejecutar con: npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { rutaDelOriginal, tipoDelOriginal, nombreDelFormato, seVeEnElNavegador, BUCKET_ORIGINALES } from "../../lib/subida/originales.ts";
import { serviciosSupabase } from "../../lib/subida/servicios-supabase.ts";

const USUARIO = "11111111-2222-4333-8444-555555555555";
const ARCHIVO_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const HUELLA = "a".repeat(64);

test("tipo: usa el del navegador si el bucket lo admite", () => {
  assert.equal(tipoDelOriginal({ name: "t.pdf", type: "application/pdf" }), "application/pdf");
  assert.equal(tipoDelOriginal({ name: "t.jpg", type: "image/jpeg" }), "image/jpeg");
  assert.equal(tipoDelOriginal({ name: "t.jpg", type: "image/jpg" }), "image/jpeg");
  assert.equal(tipoDelOriginal({ name: "IMG.HEIC", type: "image/heif" }), "image/heif");
});

test("tipo: HEIC sin tipo (pasa en Windows) se deduce de la extensión", () => {
  assert.equal(tipoDelOriginal({ name: "IMG_2041.HEIC", type: "" }), "image/heic");
  assert.equal(tipoDelOriginal({ name: "foto.jpeg", type: "application/octet-stream" }), "image/jpeg");
});

test("tipo: rechaza lo que el bucket no admite", () => {
  assert.equal(tipoDelOriginal({ name: "x.gif", type: "image/gif" }), null);
  assert.equal(tipoDelOriginal({ name: "x.txt", type: "" }), null);
  assert.equal(tipoDelOriginal({ name: "x.exe", type: "application/octet-stream" }), null);
});

test("ruta: la primera carpeta es el usuario", () => {
  assert.equal(rutaDelOriginal(USUARIO, ARCHIVO_ID, "image/jpeg"), `${USUARIO}/${ARCHIVO_ID}.jpg`);
  assert.equal(rutaDelOriginal(USUARIO, ARCHIVO_ID, "application/pdf"), `${USUARIO}/${ARCHIVO_ID}.pdf`);
});

test("ruta: no admite usuarios ni nombres raros (como ../)", () => {
  assert.throws(() => rutaDelOriginal("../otro", ARCHIVO_ID, "image/jpeg"));
  assert.throws(() => rutaDelOriginal(USUARIO, "../../x", "image/jpeg"));
  assert.throws(() => rutaDelOriginal(USUARIO, ARCHIVO_ID, "image/gif"));
});

test("formato y si se ve en el navegador", () => {
  assert.equal(nombreDelFormato("image/jpeg"), "JPG");
  assert.equal(nombreDelFormato("application/pdf"), "PDF");
  assert.equal(seVeEnElNavegador("image/heic"), false);
  assert.equal(seVeEnElNavegador("image/png"), true);
});

// ---------------------------------------------------------------------------
// Supabase de mentira: apunta lo que se le pide y responde lo preparado.

function supabaseFalso({ filas = {}, errorSubida = null, errorInsert = null } = {}) {
  const registro = { subidas: [], borrados: [], inserts: [] };
  function consulta(tabla) {
    const q = {
      filtros: {},
      select() { return q; },
      eq(col, val) { q.filtros[col] = val; return q; },
      order() { return q; },
      limit() { return q; },
      async maybeSingle() {
        const fila = (filas[tabla] ?? []).find((f) => Object.entries(q.filtros).every(([c, v]) => f[c] === v));
        return { data: fila ?? null, error: null };
      },
      insert(fila) {
        registro.inserts.push({ tabla, fila });
        return {
          select() {
            return { async single() { return errorInsert ? { data: null, error: { message: errorInsert } } : { data: { id: "doc-1" }, error: null }; } };
          },
        };
      },
    };
    return q;
  }
  return {
    registro,
    from: (tabla) => consulta(tabla),
    storage: {
      from(bucket) {
        return {
          async upload(ruta, archivo, opciones) {
            registro.subidas.push({ bucket, ruta, opciones, tamano: archivo.size });
            return errorSubida ? { data: null, error: { message: errorSubida } } : { data: { path: ruta }, error: null };
          },
          async remove(rutas) {
            registro.borrados.push({ bucket, rutas });
            return { data: [], error: null };
          },
        };
      },
    },
  };
}

const foto = () => new File([new Uint8Array(2048)], "IMG_2041.HEIC", { type: "" });

test("subir: guarda en originales/<usuario>/… con su tipo y sin sobrescribir", async () => {
  const sb = supabaseFalso();
  const servicios = serviciosSupabase(sb, USUARIO, { nuevoId: () => ARCHIVO_ID });
  const { documentoId } = await servicios.subirDocumento(foto(), HUELLA.toUpperCase(), "foto");
  assert.equal(documentoId, "doc-1");
  assert.deepEqual(sb.registro.subidas[0], {
    bucket: BUCKET_ORIGINALES,
    ruta: `${USUARIO}/${ARCHIVO_ID}.heic`,
    opciones: { contentType: "image/heic", upsert: false, cacheControl: "3600" },
    tamano: 2048,
  });
  assert.deepEqual(sb.registro.inserts[0], {
    tabla: "documentos",
    fila: {
      user_id: USUARIO,
      ruta_storage: `${USUARIO}/${ARCHIVO_ID}.heic`,
      nombre_archivo: "IMG_2041.HEIC",
      tipo_mime: "image/heic",
      tamano_bytes: 2048,
      huella_sha256: HUELLA,
      origen: "foto",
    },
  });
  assert.equal(sb.registro.borrados.length, 0);
});

test("subir: si falla la ficha, borra el archivo para que no quede suelto", async () => {
  const sb = supabaseFalso({ errorInsert: "new row violates row-level security policy" });
  const servicios = serviciosSupabase(sb, USUARIO, { nuevoId: () => ARCHIVO_ID });
  await assert.rejects(() => servicios.subirDocumento(foto(), HUELLA, "arrastrar"), /registrar el documento/);
  assert.deepEqual(sb.registro.borrados, [{ bucket: BUCKET_ORIGINALES, rutas: [`${USUARIO}/${ARCHIVO_ID}.heic`] }]);
});

test("subir: si Storage lo rechaza, no crea la ficha", async () => {
  const sb = supabaseFalso({ errorSubida: "The object exceeded the maximum allowed size" });
  const servicios = serviciosSupabase(sb, USUARIO, { nuevoId: () => ARCHIVO_ID });
  await assert.rejects(() => servicios.subirDocumento(foto(), HUELLA, "foto"), /guardar el original/);
  assert.equal(sb.registro.inserts.length, 0);
});

test("subir: un formato no admitido no llega a Supabase", async () => {
  const sb = supabaseFalso();
  const servicios = serviciosSupabase(sb, USUARIO);
  await assert.rejects(() => servicios.subirDocumento(new File(["x"], "a.gif", { type: "image/gif" }), HUELLA, "foto"), /formato/);
  assert.equal(sb.registro.subidas.length, 0);
});

test("buscar por huella: devuelve el documento y su factura, o null", async () => {
  const sb = supabaseFalso({
    filas: {
      documentos: [{ id: "doc-9", huella_sha256: HUELLA, subido_en: "2026-10-09T18:30:00+00:00" }],
      facturas: [{ id: "fac-9", documento_id: "doc-9" }],
    },
  });
  const servicios = serviciosSupabase(sb, USUARIO);
  assert.deepEqual(await servicios.buscarPorHuella(HUELLA.toUpperCase()), {
    documentoId: "doc-9",
    huella: HUELLA,
    subidoEl: "2026-10-09",
    facturaId: "fac-9",
  });
  assert.equal(await servicios.buscarPorHuella("b".repeat(64)), null);
});

test("leer: se puede sustituir la lectura (la real llama a /api/leer, ver lectura.test.mjs)", async () => {
  const servicios = serviciosSupabase(supabaseFalso(), USUARIO, { leerDocumento: async () => ({ estado: "sin-lecturas" }) });
  assert.deepEqual(await servicios.leerDocumento("doc-1"), { estado: "sin-lecturas" });
});
