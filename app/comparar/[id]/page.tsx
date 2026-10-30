import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Comparar from "./Comparar";
import { FICHAS_EJEMPLO } from "@/lib/demo/fichas-ejemplo";

export const metadata: Metadata = {
  title: "Comparar posible duplicado | Ticketon",
};

export function generateStaticParams() {
  return FICHAS_EJEMPLO.filter((f) => f.posibleDuplicadoDe !== null).map((f) => ({ id: f.id }));
}

// [Pendiente] Cuando estén Supabase (#18) y el modelo de datos (#29): leer la
// factura y la de `posible_duplicado_de`, y guardar `duplicado_descartado` o
// borrar el documento elegido.
export default async function CompararPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actual = FICHAS_EJEMPLO.find((f) => f.id === id);
  const otra = actual?.posibleDuplicadoDe ? FICHAS_EJEMPLO.find((f) => f.id === actual.posibleDuplicadoDe) : undefined;
  if (!actual || !otra) notFound();
  return <Comparar actual={actual} otra={otra} datosDeEjemplo />;
}
