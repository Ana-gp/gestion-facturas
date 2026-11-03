import type { Metadata } from "next";
import ConNavegacion from "@/app/_componentes/ConNavegacion";
import Gastos from "./Gastos";
import { GASTOS_EJEMPLO } from "@/lib/demo/gastos-ejemplo";
import { FICHAS_EJEMPLO } from "@/lib/demo/fichas-ejemplo";
import { CONSULTA_GASTOS, desdeEjemplo, desdeSupabase, type FilaDocumento } from "@/lib/gastos/listado";
import { configSupabase } from "@/lib/supabase/config";
import { clienteServidor } from "@/lib/supabase/servidor";

// P07 · Mis gastos (#30). Inicio después de entrar (DP1 del mapa de pantallas).
// - Con sesión iniciada: los documentos del usuario, leídos con su sesión
//   (las reglas RLS hacen que solo vea los suyos).
// - Sin sesión o sin claves de Supabase: los gastos de ejemplo, con aviso.

export const metadata: Metadata = {
  title: "Mis gastos | Ticketon",
};

// Cada usuario ve sus propios datos: no se puede generar una sola vez.
export const dynamic = "force-dynamic";

const IDS_CON_FICHA = FICHAS_EJEMPLO.map((f) => f.id);

function ejemplo() {
  return (
    <ConNavegacion actual="gastos">
      <Gastos gastos={desdeEjemplo(GASTOS_EJEMPLO)} idsConFicha={IDS_CON_FICHA} datosDeEjemplo />
    </ConNavegacion>
  );
}

export default async function GastosPage() {
  if (!configSupabase()) return ejemplo();

  const supabase = await clienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Sin sesión, proxy.ts (#13) ya manda a /entrar; esto solo queda por si se llega sin pasar por él.
  if (!user) return ejemplo();

  const { data, error } = await supabase.from("documentos").select(CONSULTA_GASTOS).order("subido_en", { ascending: false });
  if (error) {
    console.error("[gastos]", error.message);
    return (
      <ConNavegacion actual="gastos">
        <Gastos gastos={[]} error="No hemos podido cargar tus gastos. Prueba a recargar la página." />
      </ConNavegacion>
    );
  }
  return (
    <ConNavegacion actual="gastos">
      <Gastos gastos={desdeSupabase((data ?? []) as unknown as FilaDocumento[])} />
    </ConNavegacion>
  );
}
