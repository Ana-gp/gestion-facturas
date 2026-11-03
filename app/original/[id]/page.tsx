import type { Metadata } from "next";
import { stat } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import VisorOriginal from "./VisorOriginal";
import { FICHAS_EJEMPLO } from "@/lib/demo/fichas-ejemplo";
import { configSupabase } from "@/lib/supabase/config";
import { clienteServidor } from "@/lib/supabase/servidor";
import { tamanoLegible } from "@/lib/subida/archivos";
import { esPdf, nombreDelFormato, seVeEnElNavegador } from "@/lib/subida/originales";
import { originalParaVer } from "@/lib/subida/ver-original";

// P12 · Original a pantalla completa (#18). Se abre desde «Ver original en
// grande» en Revisar y corregir (P10).
// - Con un id de las fichas de ejemplo (t4b, t1…): el original de ejemplo.
// - Con el id de un documento (uuid): el original del usuario que ha entrado,
//   con un enlace temporal de Supabase. Si no es suyo, no existe para él.

export const metadata: Metadata = {
  title: "Original | Ticketon",
  robots: { index: false },
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function fechaCorta(iso: string | null): string | null {
  if (!iso) return null;
  const [a, m, d] = iso.slice(0, 10).split("-");
  return a && m && d ? `${d}/${m}/${a}` : null;
}

function importe(total: number | null, moneda: string | null): string | null {
  if (total === null) return null;
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: moneda || "EUR" }).format(total);
}

function pie(tipo: string, bytes: number | null, subidoEl: string | null): string {
  const partes = ["Original guardado tal como se subió", nombreDelFormato(tipo)];
  if (bytes) partes.push(tamanoLegible(bytes));
  const fecha = fechaCorta(subidoEl);
  if (fecha) partes.push(`subido el ${fecha}`);
  return partes.join(" · ");
}

function modo(tipo: string) {
  if (esPdf(tipo)) return "pdf" as const;
  return seVeEnElNavegador(tipo) ? ("imagen" as const) : ("sin-vista" as const);
}

async function tamanoPublico(ruta: string): Promise<number | null> {
  try {
    return (await stat(path.join(process.cwd(), "public", ruta))).size;
  } catch {
    return null;
  }
}

export default async function OriginalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const ejemplo = FICHAS_EJEMPLO.find((f) => f.id === id);
  if (ejemplo) {
    const tipo = ejemplo.original.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg";
    const { emisorNombre, fecha, total, moneda } = ejemplo.datos;
    const resumen = [emisorNombre, fechaCorta(fecha), importe(total, moneda)].filter(Boolean).join(" · ");
    return (
      <VisorOriginal
        nombreArchivo={ejemplo.nombreArchivo}
        resumen={resumen || null}
        url={ejemplo.original}
        urlDescarga={ejemplo.original}
        modo={modo(tipo)}
        pie={pie(tipo, await tamanoPublico(ejemplo.original), null)}
        volver={`/revisar/${ejemplo.id}`}
        datosDeEjemplo
      />
    );
  }

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
          <h1>Entra para ver tus originales</h1>
          <p>Los originales son privados: solo los ve quien los subió.</p>
        </section>
      </main>
    );
  }

  const original = await originalParaVer(supabase, id);
  if (!original) notFound();

  const resumen = [original.emisor, fechaCorta(original.fecha), importe(original.total, original.moneda)].filter(Boolean).join(" · ");
  return (
    <VisorOriginal
      nombreArchivo={original.nombreArchivo}
      resumen={resumen || null}
      url={original.url}
      urlDescarga={original.urlDescarga}
      modo={modo(original.tipo)}
      pie={pie(original.tipo, original.tamanoBytes, original.subidoEl)}
      volver={original.facturaId ? `/revisar/${original.facturaId}` : "/gastos"}
      documentoSinLeer={original.facturaId ? null : original.documentoId}
    />
  );
}
