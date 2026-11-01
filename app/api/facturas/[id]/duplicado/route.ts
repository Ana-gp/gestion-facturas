import { NextResponse, type NextRequest } from "next/server";
import { configSupabase } from "@/lib/supabase/config";
import { clienteServidor } from "@/lib/supabase/servidor";

// «No es un duplicado» y «Deshacer» en Comparar (P11, #22).
//   POST /api/facturas/<id>/duplicado   { "descartado": true | false }
// Cambia `duplicado_descartado`, que el usuario sí puede corregir (permisos de
// la tabla). Con su sesión: RLS solo le deja cambiar sus facturas.

export const runtime = "nodejs";
export const preferredRegion = "fra1";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!configSupabase()) return NextResponse.json({ error: "Supabase no está configurado en este entorno." }, { status: 503 });
  if (!UUID.test(id)) return NextResponse.json({ error: "Factura no válida." }, { status: 400 });

  let descartado: unknown;
  try {
    ({ descartado } = (await request.json()) as { descartado?: unknown });
  } catch {
    return NextResponse.json({ error: "Petición no válida." }, { status: 400 });
  }
  if (typeof descartado !== "boolean") return NextResponse.json({ error: "Petición no válida." }, { status: 400 });

  const supabase = await clienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Tienes que entrar para hacer esto." }, { status: 401 });

  const { data, error } = await supabase
    .from("facturas")
    .update({ duplicado_descartado: descartado, actualizado_en: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) {
    console.error("[api/facturas/duplicado]", id, error.message);
    return NextResponse.json({ error: "No hemos podido guardarlo. Inténtalo otra vez." }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "No existe esa factura." }, { status: 404 });
  return NextResponse.json({ ok: true, descartado });
}
