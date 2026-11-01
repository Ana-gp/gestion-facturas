import { NextResponse, type NextRequest } from "next/server";
import { BUCKET_ORIGINALES } from "@/lib/subida/originales";
import { configSupabase } from "@/lib/supabase/config";
import { clienteServidor } from "@/lib/supabase/servidor";

// Borrar un documento (#21, «Borrar documento» en P10).
//   DELETE /api/documentos/<id>
// Borra el original del bucket y la fila de `documentos`; la factura y sus
// líneas de IVA se borran con ella (on delete cascade). La lectura gastada no
// se devuelve (D4). Con la sesión del usuario: RLS solo deja borrar lo suyo.

export const runtime = "nodejs";
export const preferredRegion = "fra1";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!configSupabase()) return NextResponse.json({ error: "Supabase no está configurado en este entorno." }, { status: 503 });
  if (!UUID.test(id)) return NextResponse.json({ error: "Documento no válido." }, { status: 400 });

  const supabase = await clienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Tienes que entrar para borrar." }, { status: 401 });

  try {
    const { data: doc, error } = await supabase.from("documentos").select("id, ruta_storage").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!doc) return NextResponse.json({ error: "No existe ese documento." }, { status: 404 });

    // Primero la fila: si falla, el original sigue enlazado y no se pierde nada.
    const { error: errorFila } = await supabase.from("documentos").delete().eq("id", id);
    if (errorFila) throw new Error(errorFila.message);
    const { error: errorArchivo } = await supabase.storage.from(BUCKET_ORIGINALES).remove([doc.ruta_storage]);
    // Si el archivo no se pudo borrar, queda huérfano pero sin datos: se apunta en el registro.
    if (errorArchivo) console.error("[api/documentos] original sin borrar", doc.ruta_storage, errorArchivo.message);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[api/documentos]", id, e);
    return NextResponse.json({ error: "No hemos podido borrar el documento. Inténtalo otra vez." }, { status: 500 });
  }
}
