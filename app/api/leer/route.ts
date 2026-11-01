import { NextResponse, type NextRequest } from "next/server";
import { leerConGemini } from "@/lib/lectura/gemini";
import { leerDocumentoGuardado } from "@/lib/lectura/leer-documento";
import { clienteAdmin } from "@/lib/supabase/admin";
import { configSupabase } from "@/lib/supabase/config";
import { clienteServidor } from "@/lib/supabase/servidor";

// Lectura con IA (#19). La pide la pantalla de subida después de guardar el
// original (#18), y también «Volver a leer con IA» en la ficha.
//   POST /api/leer   { "documentoId": "<uuid>" }
// Respuesta: { estado: "leido", facturaId } | { estado: "sin-lecturas" } |
//            { estado: "error", mensaje } (el original sigue guardado).

export const runtime = "nodejs";
// Funciones en Fráncfort, como acordó la arquitectura.
export const preferredRegion = "fra1";
// Gemini suele tardar unos segundos; margen por si va lento.
export const maxDuration = 60;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  if (!configSupabase()) {
    return NextResponse.json({ estado: "error", mensaje: "Supabase no está configurado en este entorno." }, { status: 503 });
  }

  let documentoId: unknown;
  try {
    ({ documentoId } = (await request.json()) as { documentoId?: unknown });
  } catch {
    return NextResponse.json({ estado: "error", mensaje: "Petición no válida." }, { status: 400 });
  }
  if (typeof documentoId !== "string" || !UUID.test(documentoId)) {
    return NextResponse.json({ estado: "error", mensaje: "Documento no válido." }, { status: 400 });
  }

  const usuario = await clienteServidor();
  const {
    data: { user },
  } = await usuario.auth.getUser();
  if (!user) return NextResponse.json({ estado: "error", mensaje: "Tienes que entrar para leer documentos." }, { status: 401 });

  try {
    const resultado = await leerDocumentoGuardado({ usuario, admin: clienteAdmin, leer: (archivo) => leerConGemini(archivo) }, documentoId);
    if (resultado.estado === "no-encontrado") {
      return NextResponse.json({ estado: "error", mensaje: "No existe ese documento." }, { status: 404 });
    }
    return NextResponse.json(resultado);
  } catch (e) {
    // Errores antes de leer (permisos, contador). En el registro de Vercel queda el detalle.
    console.error("[api/leer]", e);
    return NextResponse.json({ estado: "error", mensaje: "No se ha podido leer el documento. El original está guardado." }, { status: 500 });
  }
}
