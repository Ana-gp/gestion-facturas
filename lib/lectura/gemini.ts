import "server-only";

/**
 * Llamada a Gemini para leer un documento (#19). SOLO SERVIDOR: usa la clave
 * secreta GEMINI_API_KEY, que nunca llega al navegador (el import de
 * "server-only" hace fallar la compilación si alguien lo importa desde una
 * pantalla).
 *
 * Misma configuración que la prueba del #6: modelo gemini-3.5-flash-lite,
 * nivel de razonamiento por defecto, sin búsqueda de Google, y respuesta en
 * JSON (responseMimeType). El archivo va dentro de la petición (máximo 20 MB
 * en total según Google; nuestros archivos son de 10 MB como mucho).
 *
 * Recordatorio (docs/supabase.md, apartado 2): con la clave gratuita, solo
 * documentos ficticios o tapados.
 */

import { INSTRUCCION, MODELO_GEMINI } from "./instruccion.ts";

export type RespuestaGemini = {
  texto: string;
  modelo: string;
  tokensEntrada: number | null;
  tokensSalida: number | null;
};

const URL_API = "https://generativelanguage.googleapis.com/v1beta/models";

export async function leerConGemini(archivo: { bytes: ArrayBuffer; tipo: string }, opciones: { clave?: string; espera?: number } = {}): Promise<RespuestaGemini> {
  const clave = opciones.clave ?? process.env.GEMINI_API_KEY;
  if (!clave) throw new Error("Falta GEMINI_API_KEY en el servidor (.env.local o variables de Vercel).");

  const respuesta = await fetch(`${URL_API}/${MODELO_GEMINI}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": clave },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ inlineData: { mimeType: archivo.tipo, data: Buffer.from(archivo.bytes).toString("base64") } }, { text: INSTRUCCION }],
        },
      ],
      generationConfig: { responseMimeType: "application/json" },
    }),
    signal: AbortSignal.timeout(opciones.espera ?? 50_000),
    cache: "no-store",
  });

  if (!respuesta.ok) {
    // No se copia el cuerpo entero: solo el mensaje de Google (nunca lleva la clave).
    let detalle = "";
    try {
      const cuerpo = (await respuesta.json()) as { error?: { message?: string } };
      detalle = cuerpo.error?.message?.slice(0, 300) ?? "";
    } catch {
      // sin cuerpo JSON
    }
    if (respuesta.status === 429) throw new Error(`Gemini: límite de peticiones alcanzado (429). Prueba en un minuto. ${detalle}`.trim());
    throw new Error(`Gemini respondió ${respuesta.status}. ${detalle}`.trim());
  }

  const cuerpo = (await respuesta.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
    usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
    modelVersion?: string;
  };
  const candidato = cuerpo.candidates?.[0];
  const texto = candidato?.content?.parts?.map((p) => p.text ?? "").join("").trim();
  if (!texto) throw new Error(`Gemini no ha devuelto texto (${candidato?.finishReason ?? "sin candidatos"}).`);

  return {
    texto,
    modelo: cuerpo.modelVersion ?? MODELO_GEMINI,
    tokensEntrada: cuerpo.usageMetadata?.promptTokenCount ?? null,
    tokensSalida: cuerpo.usageMetadata?.candidatesTokenCount ?? null,
  };
}
