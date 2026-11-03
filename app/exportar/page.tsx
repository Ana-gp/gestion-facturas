import type { Metadata } from "next";
import Exportar from "./Exportar";
import { GASTOS_EJEMPLO } from "@/lib/demo/gastos-ejemplo";
import { CONSULTA_EXPORTACION, facturasDesdeSupabase, planVigente, type FilaExportacion } from "@/lib/exportacion/desde-supabase";
import { configSupabase } from "@/lib/supabase/config";
import { clienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = {
  title: "Exportar para la gestoría | Ticketon",
};

// Cada usuario exporta sus propios datos: no se puede generar una sola vez.
export const dynamic = "force-dynamic";

function ejemplo() {
  return <Exportar facturas={GASTOS_EJEMPLO} titular="Cuenta de ejemplo" plan="gratis" datosDeEjemplo />;
}

function hoyEnEspana(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
}

// P13 · Exportar para la gestoría (#23).
// - Con sesión iniciada: las facturas del usuario (RLS), su nombre y su plan.
// - Sin sesión o sin claves de Supabase: los gastos de ejemplo, con aviso.
export default async function ExportarPage() {
  if (!configSupabase()) return ejemplo();
  const supabase = await clienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // [Pendiente] Mandar a la pantalla de entrar cuando exista (#13).
  if (!user) return ejemplo();

  const [facturas, perfil, suscripciones] = await Promise.all([
    supabase.from("facturas").select(CONSULTA_EXPORTACION).order("fecha", { ascending: true }),
    supabase.from("perfiles").select("nombre").eq("id", user.id).maybeSingle(),
    supabase.from("suscripciones").select("plan_id, desde, hasta"),
  ]);
  if (facturas.error) throw new Error(`No se han podido cargar tus gastos: ${facturas.error.message}`);
  // Si fallan el perfil o el plan, se sigue con el correo y el plan Gratis, pero queda en el registro.
  if (perfil.error) console.error("[exportar] perfil", perfil.error.message);
  if (suscripciones.error) console.error("[exportar] suscripciones", suscripciones.error.message);
  const hoy = hoyEnEspana();

  const titular = perfil.data?.nombre?.trim() || user.email || "Tu cuenta";
  const plan = planVigente((suscripciones.data ?? []) as { plan_id: string; desde: string; hasta: string | null }[], hoy);
  return <Exportar facturas={facturasDesdeSupabase((facturas.data ?? []) as unknown as FilaExportacion[])} titular={titular} plan={plan} hoy={hoy} />;
}
