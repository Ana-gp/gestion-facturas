import type { Metadata } from "next";
import Exportar from "./Exportar";
import { GASTOS_EJEMPLO } from "@/lib/demo/gastos-ejemplo";

export const metadata: Metadata = {
  title: "Exportar para la gestoría | Ticketon",
};

// [Pendiente] Cuando estén Supabase (#18) y el login (#13), leer aquí las
// facturas del usuario y su plan en lugar de los datos de ejemplo.
export default function ExportarPage() {
  return <Exportar facturas={GASTOS_EJEMPLO} titular="Cuenta de ejemplo" plan="gratis" datosDeEjemplo />;
}
