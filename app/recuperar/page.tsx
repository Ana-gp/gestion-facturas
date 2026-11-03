import type { Metadata } from "next";
import Link from "next/link";
import { solicitarRecuperacion } from "@/lib/auth/acciones";
import styles from "../auth.module.css";

export const metadata: Metadata = { title: "Recuperar contraseña | Ticketon" };

type Props = { searchParams: Promise<{ error?: string; mensaje?: string }> };

export default async function RecuperarPage({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <main className={styles.fondo}>
      <section className={styles.tarjeta} aria-labelledby="titulo-recuperar">
        <Link href="/" className={styles.marca}>Ticketon</Link>
        <p className={styles.eyebrow}>RECUPERAR ACCESO</p>
        <h1 id="titulo-recuperar">¿Has olvidado tu contraseña?</h1>
        <p className={styles.intro}>Indica el correo de tu cuenta y te enviaremos un enlace para crear una contraseña nueva.</p>
        {params.error && <p className={styles.error} role="alert">{params.error}</p>}
        {params.mensaje && <p className={styles.exito} role="status">{params.mensaje}</p>}
        <form action={solicitarRecuperacion} className={styles.formulario}>
          <label htmlFor="email">Correo electrónico</label>
          <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="tu@correo.com" />
          <button type="submit" className={styles.boton}>Enviar enlace</button>
        </form>
        <p className={styles.pie}><Link href="/entrar">Volver a entrar</Link></p>
      </section>
    </main>
  );
}
