import type { Metadata } from "next";
import ConNavegacion from "@/app/_componentes/ConNavegacion";
import { notFound } from "next/navigation";
import Revisar from "./Revisar";
import { FICHAS_EJEMPLO } from "@/lib/demo/fichas-ejemplo";
import { CONSULTA_FICHA, fichaDesdeFila, type FilaFicha } from "@/lib/revision/guardado";
import { BUCKET_ORIGINALES, SEGUNDOS_ENLACE_ORIGINAL } from "@/lib/subida/originales";
import { configSupabase } from "@/lib/supabase/config";
import { clienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = {
  title: "Revisar y corregir | Ticketon",
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// P10 · Revisar y corregir (#21).
// - Con un id de las fichas de ejemplo (t4b, t1…): la ficha de ejemplo; los cambios no se guardan.
// - Con el id de una factura (uuid): la factura del usuario que ha entrado,
//   con su original por un enlace temporal. Si no es suya, no existe para él (RLS).
export default async function RevisarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ejemplo = FICHAS_EJEMPLO.find((f) => f.id === id);
  if (ejemplo)
    return (
      <ConNavegacion actual="gastos">
        <Revisar ficha={ejemplo} datosDeEjemplo />
      </ConNavegacion>
    );

  if (!UUID.test(id) || !configSupabase()) notFound();
  const supabase = await clienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // Sin sesión, proxy.ts (#13) ya manda a /entrar; esto solo queda por si se llega sin pasar por él.
    return (
      <main className="page">
        <section className="welcome">
          <h1>Entra para revisar tus gastos</h1>
          <p>Tus tickets y facturas son privados: solo los ve quien los subió.</p>
        </section>
      </main>
    );
  }

  const { data, error } = await supabase.from("facturas").select(CONSULTA_FICHA).eq("id", id).maybeSingle();
  if (error) throw new Error(`No se ha podido abrir la factura: ${error.message}`);
  if (!data) notFound();
  const fila = data as unknown as FilaFicha;

  const { data: documento } = await supabase.from("documentos").select("ruta_storage").eq("id", fila.documento_id).maybeSingle();
  let original = "";
  if (documento?.ruta_storage) {
    const { data: enlace } = await supabase.storage.from(BUCKET_ORIGINALES).createSignedUrl(documento.ruta_storage, SEGUNDOS_ENLACE_ORIGINAL);
    original = enlace?.signedUrl ?? "";
  }

  return (
    <ConNavegacion actual="gastos">
      <Revisar ficha={fichaDesdeFila(fila, original)} />
    </ConNavegacion>
  );
}
