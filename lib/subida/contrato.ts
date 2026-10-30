/**
 * Acuerdo entre la pantalla de subida (#14 y #15, Ana) y el guardado y la
 * lectura (#18 y #19, Mireia). La pantalla solo conoce estas funciones; quien
 * las implementa decide cómo hablar con Supabase y con Gemini.
 *
 * Orden (D1 y mapa de pantallas #54):
 * 1. La pantalla calcula la huella SHA-256 (lib/subida/huella.ts).
 * 2. `buscarPorHuella`: si ya existe, no se sube ni se gasta lectura (E4).
 * 3. `subirDocumento`: guarda el original en Storage y crea la fila en
 *    `documentos`, con su `origen` (columna obligatoria de la tabla). El original queda guardado ANTES de leer: si la lectura
 *    falla, no se pierde.
 * 4. `leerDocumento`: lee con la IA y crea la factura. Si el plan ya no tiene
 *    lecturas este mes, devuelve `sin-lecturas` y el original queda guardado.
 */

import type { DocumentoExistente } from "./huella";

export type ResultadoLectura =
  | { estado: "leido"; facturaId: string }
  | { estado: "error"; mensaje?: string }
  | { estado: "sin-lecturas" };

/** Cómo llegó el archivo: valores de `documentos.origen`. Correo (#16) y compartir (#17) no pasan por esta pantalla. */
export type OrigenSubida = "foto" | "arrastrar";

/** Documento que ya existe con la misma huella. `facturaId` es null si nunca se llegó a leer. */
export type DocumentoEncontrado = DocumentoExistente & { facturaId: string | null };

export type ServiciosSubida = {
  buscarPorHuella: (huella: string) => Promise<DocumentoEncontrado | null>;
  subirDocumento: (archivo: File, huella: string, origen: OrigenSubida) => Promise<{ documentoId: string }>;
  leerDocumento: (documentoId: string) => Promise<ResultadoLectura>;
};

/** Uso del plan este mes (D4: contador que solo sube, por mes natural). */
export type UsoDelPlan = { usados: number; limite: number };

function esperar(ms: number) {
  return new Promise((resolver) => setTimeout(resolver, ms));
}

/**
 * Versión de prueba para enseñar la pantalla mientras no estén #18 y #19.
 * No guarda nada. Cualquier archivo se "lee" como el ticket T4b, salvo si su
 * nombre contiene "error", que simula un fallo de lectura.
 * [Pendiente] Sustituir por la implementación real de Mireia (#18 y #19).
 */
export function serviciosDePrueba(existentes: DocumentoEncontrado[] = []): ServiciosSubida {
  const subidos = [...existentes];
  const nombres = new Map<string, string>();
  let siguiente = 1;
  return {
    async buscarPorHuella(huella) {
      await esperar(150);
      return subidos.find((d) => d.huella === huella) ?? null;
    },
    async subirDocumento(archivo, huella, _origen) {
      await esperar(700);
      const documentoId = `prueba-${siguiente++}`;
      nombres.set(documentoId, archivo.name);
      subidos.push({ documentoId, huella, subidoEl: new Date().toISOString().slice(0, 10), facturaId: null });
      return { documentoId };
    },
    async leerDocumento(documentoId) {
      await esperar(1200);
      if (nombres.get(documentoId)?.toLowerCase().includes("error")) return { estado: "error" };
      const doc = subidos.find((d) => d.documentoId === documentoId);
      if (doc) doc.facturaId = "t4b";
      return { estado: "leido", facturaId: "t4b" };
    },
  };
}
