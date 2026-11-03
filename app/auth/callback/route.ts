import { NextResponse, type NextRequest } from "next/server";
import { configSupabase } from "@/lib/supabase/config";
import { clienteServidor } from "@/lib/supabase/servidor";

function destinoSeguro(valor: string | null): string {
  return valor && valor.startsWith("/") && !valor.startsWith("//") && !valor.startsWith("/\\")
    ? valor
    : "/gastos";
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = destinoSeguro(url.searchParams.get("next"));
  const config = configSupabase();

  if (!config || !code) {
    return NextResponse.redirect(new URL("/entrar?error=El%20enlace%20no%20es%20válido%20o%20ha%20caducado.", url.origin));
  }

  const supabase = await clienteServidor();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback]", error.message);
    return NextResponse.redirect(new URL("/entrar?error=No%20hemos%20podido%20validar%20el%20enlace.%20Solicita%20uno%20nuevo.", url.origin));
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
