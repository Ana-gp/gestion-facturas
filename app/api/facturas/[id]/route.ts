import { NextResponse, type NextRequest } from "next/server";
import { filasParaGuardar, leerCambios } from "@/lib/revision/guardado";
import { configSupabase } from "@/lib/supabase/config";
import { clienteServidor } from "@/lib/supabase/servidor";

// Guardar las correcciones de una factura (#21, pantalla P10).
//   PATCH /api/facturas/<id>   { datos, tipoDocumento, revision, origenTipo, estado }
// Usa la sesión del usuario: las reglas RLS solo le dejan cambiar sus facturas
// y las columnas que puede corregir. Las líneas de IVA se sustituyen enteras.

export const runtime = "nodejs";
export const preferredRegion = "fra1";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MENSAJE_ERROR = "No hemos podido guardar los cambios. Inténtalo otra vez.";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!configSupabase()) return NextResponse.json({ error: "Supabase no está configurado en este entorno." }, { status: 503 });
  if (!UUID.test(id)) return NextResponse.json({ error: "Factura no válida." }, { status: 400 });

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "Petición no válida." }, { status: 400 });
  }
  const cambios = leerCambios(cuerpo);
  if (!cambios) return NextResponse.json({ error: "Petición no válida." }, { status: 400 });

  const supabase = await clienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Tienes que entrar para guardar." }, { status: 401 });

  try {
    const { data: actual, error: errorActual } = await supabase.from("facturas").select("id, user_id").eq("id", id).maybeSingle();
    if (errorActual) throw new Error(errorActual.message);
    if (!actual) return NextResponse.json({ error: "No existe esa factura." }, { status: 404 });

    let categoriaId: number | null = null;
    if (cambios.datos.categoria) {
      const { data: cat, error } = await supabase.from("categorias").select("id").eq("nombre", cambios.datos.categoria).maybeSingle();
      if (error) throw new Error(error.message);
      categoriaId = cat?.id ?? null;
    }

    const filas = filasParaGuardar(cambios, categoriaId);
    if ("error" in filas) return NextResponse.json({ error: filas.error }, { status: 422 });

    const { error: errorFactura } = await supabase.from("facturas").update(filas.factura).eq("id", id);
    if (errorFactura) throw new Error(errorFactura.message);

    const { error: errorBorrar } = await supabase.from("lineas_iva").delete().eq("factura_id", id);
    if (errorBorrar) throw new Error(errorBorrar.message);
    if (filas.lineas.length > 0) {
      const { error } = await supabase.from("lineas_iva").insert(filas.lineas.map((l) => ({ ...l, user_id: actual.user_id, factura_id: id })));
      if (error) throw new Error(error.message);
    }

    return NextResponse.json({ ok: true, estado: cambios.estado });
  } catch (e) {
    // El detalle solo va al registro de Vercel (igual que /api/leer, PR #70).
    console.error("[api/facturas]", id, e);
    return NextResponse.json({ error: MENSAJE_ERROR }, { status: 500 });
  }
}
