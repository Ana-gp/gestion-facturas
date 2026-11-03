import type { Metadata } from "next";
import ConNavegacion from "@/app/_componentes/ConNavegacion";
import ReenvioCorreo from "./ReenvioCorreo";
import { direccionDeReenvio, dominioCorreo } from "@/lib/correo/direccion";
import { configSupabase } from "@/lib/supabase/config";
import { clienteServidor } from "@/lib/supabase/servidor";

// P16 · Reenvío por correo (#16). Dirección propia y correos autorizados.
// Sin sesión o sin claves, se enseña cómo funciona con datos de ejemplo.
// Con el menú común (#77). Se llega desde Subir, así que se marca «Subir».

export const metadata: Metadata = {
  title: "Reenvío por correo | Ticketon",
};

export const dynamic = "force-dynamic";

function ejemplo() {
  const dominio = dominioCorreo() ?? "ejemplo.resend.app";
  return (
    <ConNavegacion actual="subir">
      <ReenvioCorreo
        direccion={`facturas-a1b2c3d4e5f6@${dominio}`}
        correoCuenta="tu@correo.com"
        autorizados={[{ id: "ejemplo", email: "otro@correo.com" }]}
        userId={null}
        datosDeEjemplo
      />
    </ConNavegacion>
  );
}

export default async function CorreoPage() {
  if (!configSupabase()) return ejemplo();
  const supabase = await clienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // [Pendiente] Mandar a la pantalla de entrar cuando exista (#13).
  if (!user) return ejemplo();

  const [{ data: perfil }, { data: autorizados }] = await Promise.all([
    supabase.from("perfiles").select("codigo_correo").eq("id", user.id).maybeSingle(),
    supabase.from("remitentes_autorizados").select("id, email").order("email"),
  ]);

  return (
    <ConNavegacion actual="subir">
      <ReenvioCorreo
        direccion={perfil ? direccionDeReenvio(perfil.codigo_correo) : null}
        correoCuenta={user.email ?? null}
        autorizados={autorizados ?? []}
        userId={user.id}
      />
    </ConNavegacion>
  );
}
