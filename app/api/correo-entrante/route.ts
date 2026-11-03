import { NextResponse, type NextRequest } from "next/server";
import { dominioCorreo } from "@/lib/correo/direccion";
import { firmaValida } from "@/lib/correo/firma";
import { procesarCorreo } from "@/lib/correo/procesar";
import { descargar, listarAdjuntos, recuperarCorreo } from "@/lib/correo/resend";
import { leerConGemini } from "@/lib/lectura/gemini";
import { leerDocumentoGuardado } from "@/lib/lectura/leer-documento";
import { clienteAdmin } from "@/lib/supabase/admin";

// Reenvío por correo (#16). Resend llama aquí cuando llega un correo a
// `facturas-<código>@<id>.resend.app` (evento `email.received`).
// - Firma no válida → 401 y no se hace nada.
// - Remitente no autorizado o sin adjuntos → 200 y se descarta sin guardar.
// - Error al guardar → 500, y Resend lo vuelve a intentar.

export const runtime = "nodejs";
export const preferredRegion = "fra1";
// Hasta 5 adjuntos, cada uno con su lectura con IA.
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const secreto = process.env.RESEND_WEBHOOK_SECRET?.trim();
  if (!secreto) {
    console.error("[correo-entrante] Falta RESEND_WEBHOOK_SECRET");
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  // La firma se calcula sobre el cuerpo tal cual: leerlo como texto antes de nada.
  const cuerpo = await request.text();
  const valida = firmaValida(
    secreto,
    { id: request.headers.get("svix-id"), timestamp: request.headers.get("svix-timestamp"), firma: request.headers.get("svix-signature") },
    cuerpo,
  );
  if (!valida) return NextResponse.json({ ok: false }, { status: 401 });

  let evento: { type?: string; data?: { email_id?: string } };
  try {
    evento = JSON.parse(cuerpo);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (evento.type !== "email.received" || typeof evento.data?.email_id !== "string") {
    return NextResponse.json({ ok: true, ignorado: "otro evento" });
  }

  try {
    const admin = clienteAdmin();
    const resultado = await procesarCorreo(
      {
        admin,
        recuperarCorreo,
        listarAdjuntos,
        descargar,
        dominio: dominioCorreo(),
        // El documento lo acaba de crear este mismo proceso para el dueño de la dirección.
        leer: (documentoId) => leerDocumentoGuardado({ usuario: admin, admin: () => admin, leer: (archivo) => leerConGemini(archivo) }, documentoId),
      },
      evento.data.email_id,
    );
    console.info("[correo-entrante]", evento.data.email_id, JSON.stringify(resultado));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[correo-entrante]", evento.data.email_id, e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
