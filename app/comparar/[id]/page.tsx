import type { Metadata } from "next";
import ConNavegacion from "@/app/_componentes/ConNavegacion";
import { notFound } from "next/navigation";
import Link from "next/link";
import Comparar from "./Comparar";
import { FICHAS_EJEMPLO } from "@/lib/demo/fichas-ejemplo";
import { CONSULTA_FICHA, fichaDesdeFila, type FichaRevision, type FilaFicha } from "@/lib/revision/guardado";
import { BUCKET_ORIGINALES, SEGUNDOS_ENLACE_ORIGINAL } from "@/lib/subida/originales";
import { configSupabase } from "@/lib/supabase/config";
import { clienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = {
  title: "Comparar posible duplicado | Ticketon",
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Supabase = Awaited<ReturnType<typeof clienteServidor>>;

async function fichaReal(supabase: Supabase, id: string): Promise<FichaRevision | null> {
  const { data, error } = await supabase.from("facturas").select(CONSULTA_FICHA).eq("id", id).maybeSingle();
  if (error) throw new Error(`No se ha podido abrir la factura: ${error.message}`);
  if (!data) return null;
  const fila = data as unknown as FilaFicha;
  const { data: doc } = await supabase.from("documentos").select("ruta_storage").eq("id", fila.documento_id).maybeSingle();
  let original = "";
  if (doc?.ruta_storage) {
    const { data: enlace } = await supabase.storage.from(BUCKET_ORIGINALES).createSignedUrl(doc.ruta_storage, SEGUNDOS_ENLACE_ORIGINAL);
    original = enlace?.signedUrl ?? "";
  }
  // El aviso se guarda en la fila aunque se haya descartado: aquí se compara igual.
  return { ...fichaDesdeFila(fila, original), posibleDuplicadoDe: fila.posible_duplicado_de };
}

// P11 · Comparar posible duplicado (#22).
// - Con un id de las fichas de ejemplo (ml): los dos tickets de Mercadona.
// - Con el id de una factura (uuid): esa factura y la de `posible_duplicado_de`,
//   del usuario que ha entrado (RLS).
export default async function CompararPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ejemplo = FICHAS_EJEMPLO.find((f) => f.id === id);
  if (ejemplo) {
    const otra = ejemplo.posibleDuplicadoDe ? FICHAS_EJEMPLO.find((f) => f.id === ejemplo.posibleDuplicadoDe) : undefined;
    if (!otra) notFound();
    return (
      <ConNavegacion actual="gastos">
        <Comparar actual={ejemplo} otra={otra} datosDeEjemplo />
      </ConNavegacion>
    );
  }

  if (!UUID.test(id) || !configSupabase()) notFound();
  const supabase = await clienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // [Pendiente] Mandar a la pantalla de entrar cuando exista (#13).
    return (
      <main className="page">
        <section className="welcome">
          <h1>Entra para ver tus gastos</h1>
          <p>Tus tickets y facturas son privados: solo los ve quien los subió.</p>
        </section>
      </main>
    );
  }

  const actual = await fichaReal(supabase, id);
  if (!actual) notFound();
  const otra = actual.posibleDuplicadoDe ? await fichaReal(supabase, actual.posibleDuplicadoDe) : null;
  if (!otra) {
    return (
      <main className="page">
        <section className="welcome">
          <h1>Ya no hay duplicado que comparar</h1>
          <p>El otro documento se ha borrado o ya no coincide con este.</p>
          <p>
            <Link href={`/revisar/${actual.id}`}>Volver a la ficha</Link>
          </p>
        </section>
      </main>
    );
  }
  return (
    <ConNavegacion actual="gastos">
      <Comparar actual={actual} otra={otra} />
    </ConNavegacion>
  );
}
