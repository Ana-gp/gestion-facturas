// Pruebas del uso del plan en la pantalla de subida (D4, #31).
// Ejecutar con: npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { mesActual, usoDelMes } from "../../lib/subida/uso.ts";

test("mes natural en hora de España (como reservar_lectura)", () => {
  assert.equal(mesActual(new Date("2026-11-01T12:00:00Z")), "2026-11-01");
  // 31/10 a las 23:30 UTC ya es 1 de noviembre en España.
  assert.equal(mesActual(new Date("2026-10-31T23:30:00Z")), "2026-11-01");
  assert.equal(mesActual(new Date("2026-10-31T22:30:00Z")), "2026-10-01");
});

test("usados del mes y límite de la suscripción activa", () => {
  const usos = [{ mes: "2026-10-01", documentos_procesados: 9 }, { mes: "2026-11-01", documentos_procesados: 3 }];
  const subs = [{ hasta: "2026-10-15", planes: { limite_documentos_mes: 10 } }, { hasta: null, planes: [{ limite_documentos_mes: 100 }] }];
  assert.deepEqual(usoDelMes(usos, subs, "2026-11-01"), { usados: 3, limite: 100 });
});

test("sin fila de uso: 0; sin suscripción activa: límite 0", () => {
  assert.deepEqual(usoDelMes([], [{ hasta: null, planes: { limite_documentos_mes: 10 } }], "2026-11-01"), { usados: 0, limite: 10 });
  assert.deepEqual(usoDelMes([], [], "2026-11-01"), { usados: 0, limite: 0 });
});
