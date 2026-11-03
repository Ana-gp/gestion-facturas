import type { Metadata } from "next";
import ConNavegacion from "@/app/_componentes/ConNavegacion";
import Subir from "./Subir";
import { direccionDeReenvio } from "@/lib/correo/direccion";
import { mesActual, usoDelMes, type FilaSuscripcion, type FilaUso } from "@/lib/subida/uso";
import { configSupabase } from "@/lib/supabase/config";
import { clienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = {
  title: "Subir justificante | Ticketon",
};

// Con sesión, el uso real del mes y la dirección de reenvío: no se puede generar una sola vez.
export const dynamic = "force-dynamic";

// Sin sesión: el uso de ejemplo del diseño y sin dirección de reenvío.
const USO_EJEMPLO = { usados: 7, limite: 10 };

export default async function SubirPage() {
  let uso = USO_EJEMPLO;
  let direccion: string | null = null;
  if (configSupabase()) {
    const supabase = await clienteServidor();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const mes = mesActual();
      const [usos, suscripciones, perfil] = await Promise.all([
        supabase.from("uso_mensual").select("mes, documentos_procesados").eq("mes", mes),
        supabase.from("suscripciones").select("hasta, planes(limite_documentos_mes)"),
        supabase.from("perfiles").select("codigo_correo").eq("id", user.id).maybeSingle(),
      ]);
      // Dirección de reenvío del usuario (#16).
      direccion = perfil.data ? direccionDeReenvio(perfil.data.codigo_correo) : null;
      if (!usos.error && !suscripciones.error) {
        uso = usoDelMes((usos.data ?? []) as FilaUso[], (suscripciones.data ?? []) as unknown as FilaSuscripcion[], mes);
      } else {
        console.error("[subir] uso del plan", usos.error?.message ?? suscripciones.error?.message);
      }
    }
  }
  return (
    <ConNavegacion actual="subir">
      <Subir uso={uso} direccionCorreo={direccion} datosDeEjemplo />
    </ConNavegacion>
  );
}
