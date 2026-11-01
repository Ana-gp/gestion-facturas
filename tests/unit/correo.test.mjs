// Pruebas del reenvío por correo (#16): dirección, firma del aviso de Resend y
// procesado del correo con un Supabase y un Resend de mentira.
// Ejecutar con: npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { codigoDeDestinatarios, correoLimpio, direccionDeReenvio } from "../../lib/correo/direccion.ts";
import { firmaValida } from "../../lib/correo/firma.ts";
import { adjuntoAdmitido, procesarCorreo } from "../../lib/correo/procesar.ts";

const DOMINIO = "oukuesilea.resend.app";
const CODIGO = "a1b2c3d4e5f6";
const USUARIO = "11111111-2222-4333-8444-555555555555";

test("dirección: facturas-<código>@<dominio> y lectura de destinatarios", () => {
  assert.equal(direccionDeReenvio(CODIGO, DOMINIO), `facturas-${CODIGO}@${DOMINIO}`);
  assert.equal(direccionDeReenvio(CODIGO, null), null);
  assert.equal(correoLimpio("Ana Pérez <Ana@Correo.com>"), "ana@correo.com");
  assert.equal(correoLimpio("no es un correo"), null);
  assert.equal(codigoDeDestinatarios(["otra@x.com", `Ticketon <FACTURAS-${CODIGO.toUpperCase()}@${DOMINIO}>`], DOMINIO), CODIGO);
  assert.equal(codigoDeDestinatarios([`facturas-${CODIGO}@otro.dominio.com`], DOMINIO), null);
  assert.equal(codigoDeDestinatarios(["facturas-corto@" + DOMINIO], DOMINIO), null);
});

// Firma igual que la de Svix: HMAC-SHA256 de "id.timestamp.cuerpo" con la clave en base64.
const SECRETO = "whsec_" + Buffer.from("clave-de-prueba-no-real").toString("base64");
function firmar(id, ts, cuerpo) {
  const clave = Buffer.from(SECRETO.slice(6), "base64");
  return "v1," + createHmac("sha256", clave).update(`${id}.${ts}.${cuerpo}`).digest("base64");
}

test("firma: acepta la de Resend y rechaza cambios, firmas falsas y avisos viejos", () => {
  const ahora = new Date("2026-11-01T20:00:00Z");
  const ts = String(Math.floor(ahora.getTime() / 1000));
  const cuerpo = '{"type":"email.received","data":{"email_id":"e1"}}';
  const firma = firmar("msg_1", ts, cuerpo);
  assert.equal(firmaValida(SECRETO, { id: "msg_1", timestamp: ts, firma }, cuerpo, ahora), true);
  assert.equal(firmaValida(SECRETO, { id: "msg_1", timestamp: ts, firma: "v1,otra " + firma }, cuerpo, ahora), true);
  assert.equal(firmaValida(SECRETO, { id: "msg_1", timestamp: ts, firma }, cuerpo.replace("e1", "e2"), ahora), false);
  assert.equal(firmaValida(SECRETO, { id: "msg_2", timestamp: ts, firma }, cuerpo, ahora), false);
  assert.equal(firmaValida(SECRETO, { id: "msg_1", timestamp: ts, firma: "v1,AAAA" }, cuerpo, ahora), false);
  assert.equal(firmaValida(SECRETO, { id: "msg_1", timestamp: ts, firma: null }, cuerpo, ahora), false);
  const viejo = new Date(ahora.getTime() + 10 * 60 * 1000);
  assert.equal(firmaValida(SECRETO, { id: "msg_1", timestamp: ts, firma }, cuerpo, viejo), false);
});

test("adjuntos: PDF e imágenes admitidas; fuera logos de firma, otros formatos y más de 10 MB", () => {
  const a = (filename, content_type, extra = {}) => ({ filename, content_type, content_disposition: "attachment", size: 1000, download_url: "u", ...extra });
  assert.equal(adjuntoAdmitido(a("factura.pdf", "application/pdf")), "application/pdf");
  assert.equal(adjuntoAdmitido(a("ticket.HEIC", "")), "image/heic");
  assert.equal(adjuntoAdmitido(a("logo.png", "image/png", { content_disposition: "inline" })), null);
  assert.equal(adjuntoAdmitido(a("factura.pdf", "application/pdf", { content_disposition: "inline" })), "application/pdf");
  assert.equal(adjuntoAdmitido(a("hoja.xlsx", "application/vnd.ms-excel")), null);
  assert.equal(adjuntoAdmitido(a("grande.jpg", "image/jpeg", { size: 11 * 1024 * 1024 })), null);
});

// ---------------------------------------------------------------------------

function falso({ perfil = { id: USUARIO }, correoCuenta = "mireia@correo.com", autorizados = [], yaProcesado = false, huellaRepetida = false } = {}) {
  const log = [];
  const tabla = (nombre) => {
    const q = {
      f: {},
      select() { return q; },
      eq(c, v) { q.f[c] = v; return q; },
      limit() { return q; },
      async maybeSingle() {
        if (nombre === "perfiles") return { data: q.f.codigo_correo === CODIGO ? perfil : null, error: null };
        if (nombre === "remitentes_autorizados") return { data: autorizados.includes(q.f.email) ? { id: "r1" } : null, error: null };
        if (nombre === "documentos" && q.f.correo_message_id) return { data: yaProcesado ? { id: "viejo" } : null, error: null };
        if (nombre === "documentos" && q.f.huella_sha256) return { data: huellaRepetida ? { id: "igual" } : null, error: null };
        return { data: null, error: null };
      },
      insert(fila) {
        log.push(["insert", nombre, fila]);
        return { select: () => ({ single: async () => ({ data: { id: `doc-${log.length}` }, error: null }) }) };
      },
    };
    return q;
  };
  const admin = {
    from: tabla,
    auth: { admin: { getUserById: async () => ({ data: { user: { email: correoCuenta } } }) } },
    storage: { from: () => ({ upload: async (ruta, blob, op) => { log.push(["upload", ruta, op.contentType, blob.size]); return { error: null }; }, remove: async () => ({ error: null }) }) },
  };
  return { admin, log };
}

const ADJUNTOS = [
  { filename: "factura.pdf", content_type: "application/pdf", content_disposition: "attachment", size: 4, download_url: "https://descarga/1" },
  { filename: "logo.png", content_type: "image/png", content_disposition: "inline", size: 4, download_url: "https://descarga/2" },
];

function deps(admin, { from = "Mireia <Mireia@Correo.com>", leidos = [] } = {}) {
  let n = 0;
  return {
    admin,
    dominio: DOMINIO,
    recuperarCorreo: async () => ({ from, to: [`facturas-${CODIGO}@${DOMINIO}`], message_id: "<m1@correo>" }),
    listarAdjuntos: async () => ADJUNTOS,
    descargar: async () => new Uint8Array([1, 2, 3, 4]).buffer,
    leer: async (id) => { leidos.push(id); return { estado: "leido" }; },
    nuevoId: () => `aaaaaaaa-bbbb-4ccc-8ddd-00000000000${++n}`,
  };
}

test("correo del propio usuario: guarda el PDF como original de origen correo y lo lee", async () => {
  const { admin, log } = falso();
  const leidos = [];
  const r = await procesarCorreo(deps(admin, { leidos }), "e1");
  assert.deepEqual(r, { estado: "procesado", guardados: 1, repetidos: 0, descartados: 1 });
  const subida = log.find((x) => x[0] === "upload");
  assert.equal(subida[1], `${USUARIO}/aaaaaaaa-bbbb-4ccc-8ddd-000000000001.pdf`);
  assert.equal(subida[2], "application/pdf");
  const doc = log.find((x) => x[0] === "insert")[2];
  assert.equal(doc.user_id, USUARIO);
  assert.equal(doc.origen, "correo");
  assert.equal(doc.correo_message_id, "<m1@correo>");
  assert.equal(doc.huella_sha256.length, 64);
  assert.equal(leidos.length, 1);
});

test("remitente autorizado (no es el de la cuenta): también entra", async () => {
  const { admin } = falso({ autorizados: ["gestoria@empresa.es"] });
  const r = await procesarCorreo(deps(admin, { from: "gestoria@empresa.es" }), "e1");
  assert.equal(r.estado, "procesado");
});

test("remitente no autorizado: se descarta sin guardar nada", async () => {
  const { admin, log } = falso();
  const r = await procesarCorreo(deps(admin, { from: "desconocido@spam.com" }), "e1");
  assert.deepEqual(r, { estado: "ignorado", motivo: "remitente-no-autorizado" });
  assert.equal(log.length, 0);
});

test("código que no existe, aviso repetido o mismo archivo: no se guarda dos veces", async () => {
  assert.deepEqual(await procesarCorreo(deps(falso({ perfil: null }).admin), "e1"), { estado: "ignorado", motivo: "usuario-desconocido" });
  const repetido = falso({ yaProcesado: true });
  assert.deepEqual(await procesarCorreo(deps(repetido.admin), "e1"), { estado: "ignorado", motivo: "ya-procesado" });
  assert.equal(repetido.log.length, 0);
  const mismo = falso({ huellaRepetida: true });
  const leidos = [];
  assert.deepEqual(await procesarCorreo(deps(mismo.admin, { leidos }), "e1"), { estado: "procesado", guardados: 0, repetidos: 1, descartados: 1 });
  assert.equal(leidos.length, 0);
});
