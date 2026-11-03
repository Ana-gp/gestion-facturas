import type { Metadata } from "next";
import Link from "next/link";
import { registrar } from "@/lib/auth/acciones";
import styles from "../auth.module.css";

export const metadata: Metadata = { title: "Crear cuenta | Ticketon" };

type Props = { searchParams: Promise<{ error?: string; mensaje?: string }> };

export default async function RegistroPage({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <main className={styles.fondo}>
      <section className={styles.tarjeta} aria-labelledby="titulo-registro">
        <Link href="/" className={styles.marca}>Ticketon</Link>
        <p className={styles.eyebrow}>EMPIEZA GRATIS</p>
        <h1 id="titulo-registro">Crea tu cuenta</h1>
        <p className={styles.intro}>Guarda tus justificantes y tenlos organizados en un solo lugar.</p>
        {params.error && <p className={styles.error} role="alert">{params.error}</p>}
        {params.mensaje && <p className={styles.exito} role="status">{params.mensaje}</p>}
        <form action={registrar} className={styles.formulario}>
          <label htmlFor="email">Correo electrónico</label>
          <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="tu@correo.com" />
          <label htmlFor="password">Contraseña</label>
          <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={72} required aria-describedby="ayuda-password" />
          <small id="ayuda-password">Utiliza al menos 8 caracteres.</small>
          <label htmlFor="passwordConfirm">Repite la contraseña</label>
          <input id="passwordConfirm" name="passwordConfirm" type="password" autoComplete="new-password" minLength={8} maxLength={72} required />
          <button type="submit" className={styles.boton}>Crear cuenta</button>
        </form>
        <p className={styles.legal}>Al crear una cuenta, aceptas consultar la <Link href="/legales">información legal</Link> aplicable al servicio.</p>
        <p className={styles.pie}>¿Ya tienes cuenta? <Link href="/entrar">Entrar</Link></p>
      </section>
    </main>
  );
}
