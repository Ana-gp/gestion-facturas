import type { Metadata } from "next";
import Link from "next/link";
import { actualizarContrasena } from "@/lib/auth/acciones";
import styles from "../auth.module.css";

export const metadata: Metadata = { title: "Nueva contraseña | Ticketon" };

type Props = { searchParams: Promise<{ error?: string }> };

export default async function NuevaContrasenaPage({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <main className={styles.fondo}>
      <section className={styles.tarjeta} aria-labelledby="titulo-nueva">
        <Link href="/" className={styles.marca}>Ticketon</Link>
        <p className={styles.eyebrow}>ACTUALIZAR ACCESO</p>
        <h1 id="titulo-nueva">Crea una contraseña nueva</h1>
        <p className={styles.intro}>Elige una contraseña que no utilices en otros servicios.</p>
        {params.error && <p className={styles.error} role="alert">{params.error}</p>}
        <form action={actualizarContrasena} className={styles.formulario}>
          <label htmlFor="password">Nueva contraseña</label>
          <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={72} required />
          <small>Utiliza al menos 8 caracteres.</small>
          <label htmlFor="passwordConfirm">Repite la contraseña</label>
          <input id="passwordConfirm" name="passwordConfirm" type="password" autoComplete="new-password" minLength={8} maxLength={72} required />
          <button type="submit" className={styles.boton}>Guardar contraseña</button>
        </form>
      </section>
    </main>
  );
}
