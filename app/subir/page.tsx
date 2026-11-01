import type { Metadata } from "next";
import Subir from "./Subir";
import { direccionDeReenvio } from "@/lib/correo/direccion";
import { configSupabase } from "@/lib/supabase/config";
import { clienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = {
  title: "Subir justificante | Ticketon",
};

// Con sesión, la dirección de reenvío es la del usuario (#16).
export const dynamic = "force-dynamic";

// [Pendiente] Cuando estén los límites del plan (#31), leer aquí el uso real del mes.
export default async function SubirPage() {
  let direccion: string | null = null;
  if (configSupabase()) {
    const supabase = await clienteServidor();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: perfil } = await supabase.from("perfiles").select("codigo_correo").eq("id", user.id).maybeSingle();
      direccion = perfil ? direccionDeReenvio(perfil.codigo_correo) : null;
    }
  }
  return <Subir uso={{ usados: 7, limite: 10 }} direccionCorreo={direccion} datosDeEjemplo />;
}
