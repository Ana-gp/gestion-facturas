"use client";

// P16 · Reenvío por correo (#16), según el diseño unificado.

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./correo.module.css";
import { correoLimpio } from "@/lib/correo/direccion";
import { clienteNavegadorSiHay } from "@/lib/supabase/cliente";

type Props = {
  direccion: string | null;
  correoCuenta: string | null;
  autorizados: { id: string; email: string }[];
  /** Null en modo de prueba: no se guarda nada. */
  userId: string | null;
  datosDeEjemplo?: boolean;
};

export default function ReenvioCorreo({ direccion, correoCuenta, autorizados, userId, datosDeEjemplo = false }: Props) {
  const router = useRouter();
  const [copiado, setCopiado] = useState(false);
  const [nuevo, setNuevo] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function copiar() {
    if (!direccion) return;
    try {
      await navigator.clipboard.writeText(direccion);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  async function anadir(e: FormEvent) {
    e.preventDefault();
    setMensaje(null);
    const email = correoLimpio(nuevo);
    if (!email) return setMensaje("Escribe un correo válido, por ejemplo otro@correo.com.");
    if (email === correoCuenta?.toLowerCase() || autorizados.some((a) => a.email === email)) return setMensaje("Ese correo ya está autorizado.");
    const supabase = clienteNavegadorSiHay();
    if (!supabase || !userId) return setMensaje("En el modo de prueba no se guardan cambios.");
    setOcupado(true);
    const { error } = await supabase.from("remitentes_autorizados").insert({ user_id: userId, email });
    setOcupado(false);
    if (error) return setMensaje("No se ha podido añadir. Prueba otra vez.");
    setNuevo("");
    router.refresh();
  }

  async function quitar(id: string) {
    setMensaje(null);
    const supabase = clienteNavegadorSiHay();
    if (!supabase || !userId) return setMensaje("En el modo de prueba no se guardan cambios.");
    setOcupado(true);
    const { error } = await supabase.from("remitentes_autorizados").delete().eq("id", id);
    setOcupado(false);
    if (error) return setMensaje("No se ha podido quitar. Prueba otra vez.");
    router.refresh();
  }

  return (
    <main className={styles.pagina}>
      <Link href="/subir" className={styles.volver}>
        ‹ Subir
      </Link>
      <h1 className={styles.titulo}>Reenvío por correo</h1>
      <p className={styles.entradilla}>Reenvía a tu dirección de Ticketon las facturas que te llegan por email: entran solas en Mis gastos.</p>

      {datosDeEjemplo && <p className={styles.ejemplo}>Modo de prueba: dirección y correos de ejemplo. Entra en tu cuenta para ver los tuyos.</p>}

      <section className={styles.tarjeta} aria-labelledby="t-direccion">
        <h2 id="t-direccion" className={styles.subtitulo}>
          Tu dirección
        </h2>
        {direccion ? (
          <div className={styles.direccion}>
            <code>{direccion}</code>
            <button type="button" className={styles.principal} onClick={copiar}>
              {copiado ? "Copiada" : "Copiar"}
            </button>
          </div>
        ) : (
          <p className={styles.nota}>Todavía no hay dirección configurada.</p>
        )}
      </section>

      <section className={styles.tarjeta} aria-labelledby="t-autorizados">
        <h2 id="t-autorizados" className={styles.subtitulo}>
          Correos autorizados
        </h2>
        <p className={styles.nota}>Solo se guardan los correos que reenvíes desde estas direcciones.</p>
        <ul className={styles.lista}>
          {correoCuenta && (
            <li className={styles.fila}>
              <span>{correoCuenta}</span>
              <span className={styles.etiqueta}>El de tu cuenta</span>
            </li>
          )}
          {autorizados.map((a) => (
            <li key={a.id} className={styles.fila}>
              <span>{a.email}</span>
              <button type="button" className={styles.quitar} onClick={() => void quitar(a.id)} disabled={ocupado} aria-label={`Quitar ${a.email}`}>
                Quitar
              </button>
            </li>
          ))}
        </ul>
        <form className={styles.anadir} onSubmit={(e) => void anadir(e)}>
          <label htmlFor="nuevo-correo" className={styles.oculto}>
            Otro correo desde el que reenvías
          </label>
          <input id="nuevo-correo" type="email" inputMode="email" autoComplete="email" placeholder="otro@correo.com" value={nuevo} onChange={(e) => setNuevo(e.target.value)} />
          <button type="submit" className={styles.secundaria} disabled={ocupado}>
            Añadir
          </button>
        </form>
        {mensaje && (
          <p className={styles.mensaje} role="status">
            {mensaje}
          </p>
        )}
      </section>

      <div className={styles.instrucciones}>
        {["Gmail", "Outlook"].map((app) => (
          <section key={app} className={styles.tarjeta}>
            <h2 className={styles.subtitulo}>Desde {app}</h2>
            <ol>
              <li>Abre el correo con la factura.</li>
              <li>Pulsa «Reenviar» y pega tu dirección de Ticketon.</li>
              <li>Envía. La factura aparece en Mis gastos.</li>
            </ol>
          </section>
        ))}
      </div>

      <p className={styles.aviso}>Los correos que lleguen desde otras direcciones se descartan sin guardarse.</p>
    </main>
  );
}
