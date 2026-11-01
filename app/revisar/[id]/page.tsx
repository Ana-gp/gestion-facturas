import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Revisar from "./Revisar";
import { FICHAS_EJEMPLO } from "@/lib/demo/fichas-ejemplo";

export const metadata: Metadata = {
  title: "Revisar y corregir | Ticketon",
};

export function generateStaticParams() {
  return FICHAS_EJEMPLO.map((f) => ({ id: f.id }));
}

// [Pendiente] Cuando estén Supabase (#18) y la lectura con IA (#19), leer aquí
// la factura del usuario por su id en lugar de las fichas de ejemplo.
export default async function RevisarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ficha = FICHAS_EJEMPLO.find((f) => f.id === id);
  if (!ficha) notFound();
  return <Revisar ficha={ficha} datosDeEjemplo />;
}
