import type { Metadata } from "next";
import Link from "next/link";
import { entrar } from "@/lib/auth/acciones";
import { clienteServidor } from "@/lib/supabase/servidor";
import styles from "../auth.module.css";

export const metadata: Metadata = { title: "Entrar | Ticketon" };

type Props = { searchParams: Promise<{ error?: string; mensaje?: string; next?: string }> };

export default async function EntrarPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await clienteServidor().catch(() => null);
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/gastos";
      const { redirect } = await import("next/navigation");
      redirect(next);
    }
  }

  return (
    <main className={styles.fondo}>
      <section className={styles.tarjeta} aria-labelledby="titulo-entrar">
        <Link href="/" className={styles.marca}>Ticketon</Link>
        <p className={styles.eyebrow}>TU ESPACIO DE GESTIÓN</p>
        <h1 id="titulo-entrar">Bienvenido de nuevo</h1>
        <p className={styles.intro}>Entra para consultar y organizar tus tickets y facturas.</p>
        {params.error && <p className={styles.error} role="alert">{params.error}</p>}
        {params.mensaje && <p className={styles.exito} role="status">{params.mensaje}</p>}
        <form action={entrar} className={styles.formulario}>
          <input type="hidden" name="next" value={params.next ?? "/gastos"} />
          <label htmlFor="email">Correo electrónico</label>
          <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="tu@correo.com" />
          <label htmlFor="password">Contraseña</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />
          <div className={styles.alineado}><Link href="/recuperar">¿Has olvidado la contraseña?</Link></div>
          <button type="submit" className={styles.boton}>Entrar</button>
        </form>
        <p className={styles.pie}>¿Todavía no tienes cuenta? <Link href="/registro">Crear cuenta</Link></p>
      </section>
    </main>
  );
}
