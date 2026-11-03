import type { Metadata } from "next";
import ConNavegacion from "@/app/_componentes/ConNavegacion";
import Subir from "./Subir";
import { mesActual, usoDelMes, type FilaSuscripcion, type FilaUso } from "@/lib/subida/uso";
import { configSupabase } from "@/lib/supabase/config";
import { clienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = {
  title: "Subir justificante | Ticketon",
};

// Con sesión, el uso real del mes: no se puede generar una sola vez.
export const dynamic = "force-dynamic";

// Sin sesión: el uso de ejemplo del diseño. [Pendiente] La dirección de reenvío (#16, PR #75).
const USO_EJEMPLO = { usados: 7, limite: 10 };

export default async function SubirPage() {
  let uso = USO_EJEMPLO;
  if (configSupabase()) {
    const supabase = await clienteServidor();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const mes = mesActual();
      const [usos, suscripciones] = await Promise.all([
        supabase.from("uso_mensual").select("mes, documentos_procesados").eq("mes", mes),
        supabase.from("suscripciones").select("hasta, planes(limite_documentos_mes)"),
      ]);
      if (!usos.error && !suscripciones.error) {
        uso = usoDelMes((usos.data ?? []) as FilaUso[], (suscripciones.data ?? []) as unknown as FilaSuscripcion[], mes);
      } else {
        console.error("[subir] uso del plan", usos.error?.message ?? suscripciones.error?.message);
      }
    }
  }
  return (
    <ConNavegacion actual="subir">
      <Subir uso={uso} direccionCorreo={null} datosDeEjemplo />
    </ConNavegacion>
  );
}
