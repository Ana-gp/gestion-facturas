// Pruebas de la lectura con IA (#19): comprobar la respuesta de Gemini y
// guardarla. Usa las respuestas REALES de la prueba de IA del #6
// (tests/resultados-ia/*-A.json) y un Supabase de mentira: no se conecta a nada.
// Ejecutar con: npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { aFilas, fecha, interpretarRespuesta, numero } from "../../lib/lectura/interpretar.ts";
import { leerDocumentoGuardado } from "../../lib/lectura/leer-documento.ts";
import { CATEGORIAS_LECTURA, INSTRUCCION } from "../../lib/lectura/instruccion.ts";
import { leerEnElServidor } from "../../lib/subida/servicios-supabase.ts";

const IDS = new Map(CATEGORIAS_LECTURA.map((c, i) => [c, i + 1]));
const resultado = (nombre) => JSON.parse(readFileSync(new URL(`../resultados-ia/${nombre}`, import.meta.url), "utf8")).respuesta;

// ---------------------------------------------------------------------------
// Respuestas reales del #6

test("todas las respuestas reales de Gemini del #6 se pueden guardar", () => {
  const archivos = readdirSync(new URL("../resultados-ia/", import.meta.url)).filter((f) => f.endsWith("-A.json"));
  assert.ok(archivos.length >= 6);
  for (const f of archivos) {
    const d = interpretarRespuesta(resultado(f));
    const { factura, lineas } = aFilas(d, IDS, {});
    assert.ok(factura.total !== null, f);
    assert.ok(lineas.length >= 1, f);
    assert.ok(factura.categoria_id !== null, `${f}: categoría reconocida`);
    // Las mismas reglas que los CHECK de la tabla facturas.
    assert.match(factura.moneda, /^[A-Z]{3}$/, f);
    if (factura.moneda === "EUR") assert.equal(factura.total_eur, factura.total, f);
    else assert.equal(factura.total_eur, null, f);
    for (const l of lineas) assert.ok(l.tipo_iva >= 0 && l.tipo_iva <= 100, f);
  }
});

test("T4b (Mercadona torcida): 3 tipos de IVA y el NIF vacío queda para revisar", () => {
  const d = interpretarRespuesta(resultado("T4b-A.json"));
  const { factura, lineas } = aFilas(d, IDS, { origen: "prueba" });
  assert.deepEqual(
    lineas.map((l) => [l.orden, l.tipo_iva, l.base, l.cuota]),
    [[1, 4, 10.66, 0.43], [2, 10, 29.95, 2.99], [3, 21, 10.33, 2.17]],
  );
  assert.equal(factura.fecha, "2026-10-09");
  assert.equal(factura.total, 56.53);
  assert.equal(factura.base_total, 50.94);
  assert.equal(factura.cuota_total, 5.59);
  assert.equal(factura.tipo_documento, "ticket");
  assert.equal(factura.emisor_nif, null);
  assert.equal(factura.campos_revision.emisor_nif.confianza, "baja");
  assert.equal(factura.campos_revision.total.confianza, "alta");
  assert.equal(factura.categoria_id, IDS.get("Alimentación"));
  assert.deepEqual(factura.datos_ia, { origen: "prueba" });
});

test("T3 (factura en inglés): VAT irlandés y categoría de software", () => {
  const { factura } = aFilas(interpretarRespuesta(resultado("T3-A.json")), IDS, {});
  assert.equal(factura.emisor_nif, "IE4276970QH");
  assert.equal(factura.numero, "9BF0758D-8771996");
  assert.equal(factura.total, 21.78);
  assert.equal(factura.categoria_id, IDS.get("Software y suscripciones"));
});

test("respuestas con la instrucción del #19 (01/11/2026): datos nuevos y confianza", () => {
  for (const f of ["T1-A19.json", "T2-A19.json", "T3-A19.json", "T4b-A19.json"]) {
    const { factura } = aFilas(interpretarRespuesta(resultado(f)), IDS, {});
    assert.equal(factura.tipo_documento, "ticket", f);
    assert.equal(factura.retencion_importe, null, f);
    assert.ok(factura.categoria_id !== null, f);
  }
  // La IA no marcó nada como dudoso, pero el NIF vacío de T4b queda en "baja" por nuestra regla.
  const t4b = aFilas(interpretarRespuesta(resultado("T4b-A19.json")), IDS, {}).factura;
  assert.equal(t4b.campos_revision.emisor_nif.confianza, "baja");
  // T2: tres líneas que cuadran con el total.
  const t2 = aFilas(interpretarRespuesta(resultado("T2-A19.json")), IDS, {}).factura;
  assert.equal(t2.cuota_total, 8.69);
  assert.equal(t2.campos_revision.total.confianza, "alta");
});

// ---------------------------------------------------------------------------
// Respuestas con otra forma

test("números con coma, con símbolo o como texto", () => {
  assert.equal(numero("56,53"), 56.53);
  assert.equal(numero("1.234,56 €"), 1234.56);
  assert.equal(numero("1,234.56"), 1234.56);
  assert.equal(numero(21), 21);
  assert.equal(numero("n/a"), null);
  assert.equal(numero(null), null);
});

test("fechas: solo las que existen", () => {
  assert.equal(fecha("2026-10-09"), "2026-10-09");
  assert.equal(fecha("09/10/2026"), "2026-10-09");
  assert.equal(fecha("2026-02-30"), null);
  assert.equal(fecha("ayer"), null);
});

test("acepta el JSON dentro de ```json … ``` y rechaza lo que no es JSON", () => {
  const d = interpretarRespuesta('```json\n{"total": "12,50", "moneda": "€", "lineas_iva": [{"tipo": "10", "base": 11.36, "cuota": 1.14}]}\n```');
  assert.equal(d.total, 12.5);
  assert.equal(d.moneda, "EUR");
  assert.throws(() => interpretarRespuesta("No puedo leer la imagen."), /JSON/);
  assert.throws(() => interpretarRespuesta("[1, 2]"), /objeto/);
});

test("nada inventado: categoría desconocida, moneda rara y líneas sin tipo quedan vacías", () => {
  const d = interpretarRespuesta({ categoria: "Ocio", moneda: "pesos", total: 10, lineas_iva: [{ base: 5, cuota: 1 }, { tipo: 150, base: 1, cuota: 1 }] });
  assert.equal(d.categoria, null);
  assert.equal(d.moneda, null);
  assert.ok(d.dudosos.includes("moneda"));
  assert.deepEqual(d.lineas, []);
  const { factura } = aFilas(d, IDS, {});
  assert.equal(factura.categoria_id, null);
  assert.equal(factura.campos_revision.categoria.confianza, "baja");
  assert.equal(factura.campos_revision.lineas_iva.confianza, "baja");
});

test("otra moneda: sin tipo de cambio ni total en euros hasta convertirla (#20)", () => {
  const { factura } = aFilas(interpretarRespuesta({ total: 389.5, moneda: "MXN", lineas_iva: [{ tipo: 16, base: 335.78, cuota: 53.72 }] }), IDS, {});
  assert.equal(factura.moneda, "MXN");
  assert.equal(factura.tipo_cambio, null);
  assert.equal(factura.total_eur, null);
  assert.equal(factura.campos_revision.tipo_cambio.confianza, "baja");
});

test("campos dudosos de la IA bajan la confianza; tipo de documento y retención", () => {
  const d = interpretarRespuesta({
    tipo_documento: "factura",
    nif_receptor: "12345678Z",
    numero_factura: "A-17",
    total: 108.9,
    retencion: { tipo: 15, importe: -15 },
    lineas_iva: [{ tipo: 21, base: 100, cuota: 21 }],
    moneda: "EUR",
    categoria: "formación",
    campos_dudosos: ["numero_factura", "inventado"],
  });
  assert.equal(d.tipoDocumento, "factura");
  assert.equal(d.retencionImporte, 15);
  assert.equal(d.retencionTipo, 15);
  assert.equal(d.categoria, "Formación");
  const { factura } = aFilas(d, IDS, {});
  assert.equal(factura.campos_revision.numero.confianza, "baja");
  assert.equal(factura.retencion_importe, 15);
  // 100 + 21 − 15 = 106, no 108,90: las cuentas no cuadran y los importes quedan para revisar.
  assert.equal(factura.campos_revision.total.confianza, "baja");
});

test("sin retención (null o 0) no se guarda retención", () => {
  assert.equal(interpretarRespuesta({ retencion: null }).retencionImporte, null);
  assert.equal(interpretarRespuesta({ retencion: { tipo: 15, importe: 0 } }).retencionTipo, null);
});

test("la instrucción pide los campos nuevos y las 10 categorías", () => {
  for (const t of ["tipo_documento", "retencion", "campos_dudosos", "lineas_iva", ...CATEGORIAS_LECTURA]) assert.ok(INSTRUCCION.includes(t), t);
});

// ---------------------------------------------------------------------------
// Guardar: Supabase de mentira

const DOC = { id: "d0c00000-0000-4000-8000-000000000001", user_id: "11111111-2222-4333-8444-555555555555", ruta_storage: "11111111-2222-4333-8444-555555555555/x.jpg", tipo_mime: "image/jpeg" };

function falso({ documento = DOC, cupo = true, facturaExistente = null } = {}) {
  const log = [];
  function tabla(nombre) {
    const q = {
      _f: {},
      select() { return q; },
      eq(c, v) { q._f[c] = v; log.push(["eq", nombre, c, v]); return q; },
      async maybeSingle() {
        if (nombre === "documentos") return { data: documento, error: null };
        if (nombre === "facturas") return { data: facturaExistente, error: null };
        return { data: null, error: null };
      },
      then(resolver) {
        // select de categorías
        resolver({ data: CATEGORIAS_LECTURA.map((n, i) => ({ id: i + 1, nombre: n })), error: null });
      },
      insert(filas) {
        log.push(["insert", nombre, filas]);
        return { select: () => ({ single: async () => ({ data: { id: "fac-nueva" }, error: null }) }), then: (r) => r({ error: null }) };
      },
      update(cambio) {
        log.push(["update", nombre, cambio]);
        return { eq: async () => ({ error: null }) };
      },
      delete() {
        log.push(["delete", nombre]);
        return { eq: async () => ({ error: null }) };
      },
    };
    return q;
  }
  const cliente = {
    from: tabla,
    rpc: async (fn, args) => { log.push(["rpc", fn, args]); return { data: cupo, error: null }; },
    storage: { from: () => ({ download: async () => ({ data: new Blob([new Uint8Array([1, 2, 3])]), error: null }) }) },
  };
  return { cliente, log };
}

const gemini = (respuesta) => async (archivo) => {
  assert.equal(archivo.tipo, "image/jpeg");
  assert.equal(archivo.bytes.byteLength, 3);
  return { texto: JSON.stringify(respuesta), modelo: "gemini-3.5-flash-lite", tokensEntrada: 1371, tokensSalida: 259 };
};

test("lectura completa: reserva, lee, guarda factura y líneas y marca leído", async () => {
  const { cliente, log } = falso();
  const r = await leerDocumentoGuardado({ usuario: cliente, admin: () => cliente, leer: gemini(resultado("T4b-A.json")) }, DOC.id);
  assert.deepEqual(r, { estado: "leido", facturaId: "fac-nueva" });
  assert.deepEqual(log.find((x) => x[0] === "rpc"), ["rpc", "reservar_lectura", { p_documento_id: DOC.id }]);
  const factura = log.find((x) => x[0] === "insert" && x[1] === "facturas")[2];
  assert.equal(factura.user_id, DOC.user_id);
  assert.equal(factura.documento_id, DOC.id);
  assert.equal(factura.total, 56.53);
  assert.equal(factura.datos_ia.tokens_entrada, 1371);
  assert.equal(factura.datos_ia.respuesta.emisor, "MERCADONA S.A.");
  const lineas = log.find((x) => x[0] === "insert" && x[1] === "lineas_iva")[2];
  assert.equal(lineas.length, 3);
  assert.ok(lineas.every((l) => l.factura_id === "fac-nueva" && l.user_id === DOC.user_id));
  assert.deepEqual(log.find((x) => x[0] === "update" && x[1] === "documentos")[2], { estado_lectura: "leido" });
});

test("sin lecturas en el plan: no llama a Gemini y el original sigue guardado", async () => {
  const { cliente } = falso({ cupo: false });
  const r = await leerDocumentoGuardado({ usuario: cliente, admin: () => cliente, leer: async () => assert.fail("no debe leer") }, DOC.id);
  assert.deepEqual(r, { estado: "sin-lecturas" });
});

test("documento que no es suyo (RLS no lo devuelve): no se reserva ni se lee", async () => {
  const { cliente, log } = falso({ documento: null });
  const r = await leerDocumentoGuardado({ usuario: cliente, admin: () => assert.fail("no debe usar la clave secreta"), leer: async () => assert.fail() }, DOC.id);
  assert.deepEqual(r, { estado: "no-encontrado" });
  assert.equal(log.filter((x) => x[0] === "rpc").length, 0);
});

test("si Gemini falla, el documento queda en error y no se guarda factura", async () => {
  const { cliente, log } = falso();
  const r = await leerDocumentoGuardado({ usuario: cliente, admin: () => cliente, leer: async () => { throw new Error("Gemini respondió 503."); } }, DOC.id);
  assert.equal(r.estado, "error");
  assert.match(r.mensaje, /503/);
  assert.equal(log.filter((x) => x[0] === "insert").length, 0);
  assert.deepEqual(log.find((x) => x[0] === "update" && x[1] === "documentos")[2], { estado_lectura: "error" });
});

test("volver a leer: actualiza la misma factura y sustituye sus líneas", async () => {
  const { cliente, log } = falso({ facturaExistente: { id: "fac-vieja" } });
  const r = await leerDocumentoGuardado({ usuario: cliente, admin: () => cliente, leer: gemini(resultado("T2-A.json")) }, DOC.id);
  assert.deepEqual(r, { estado: "leido", facturaId: "fac-vieja" });
  assert.ok(log.some((x) => x[0] === "update" && x[1] === "facturas"));
  assert.ok(log.some((x) => x[0] === "delete" && x[1] === "lineas_iva"));
  assert.equal(log.filter((x) => x[0] === "insert" && x[1] === "facturas").length, 0);
});

// ---------------------------------------------------------------------------
// Pantalla → servidor

test("la pantalla pide /api/leer y entiende las tres respuestas", async () => {
  const con = (cuerpo) => async (url, op) => {
    assert.equal(url, "/api/leer");
    assert.deepEqual(JSON.parse(op.body), { documentoId: "d1" });
    return { json: async () => cuerpo };
  };
  assert.deepEqual(await leerEnElServidor("d1", con({ estado: "leido", facturaId: "f1" })), { estado: "leido", facturaId: "f1" });
  assert.deepEqual(await leerEnElServidor("d1", con({ estado: "sin-lecturas" })), { estado: "sin-lecturas" });
  assert.deepEqual(await leerEnElServidor("d1", con({ estado: "error", mensaje: "x" })), { estado: "error", mensaje: "x" });
  assert.deepEqual(await leerEnElServidor("d1", async () => { throw new Error("sin red"); }), { estado: "error" });
});
