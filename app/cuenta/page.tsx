import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import ConNavegacion from "@/app/_componentes/ConNavegacion";
import styles from "./cuenta.module.css";
import { cambiarContrasenaCuenta, guardarDatosCuenta } from "@/lib/auth/acciones";
import { direccionDeReenvio } from "@/lib/correo/direccion";
import { NOMBRE_MAXIMO } from "@/lib/cuenta/datos";
import { mesActual, usoDelMes, type FilaSuscripcion, type FilaUso } from "@/lib/subida/uso";
import { configSupabase } from "@/lib/supabase/config";
import { clienteServidor } from "@/lib/supabase/servidor";

// P15 · Mi cuenta (mapa de pantallas). La persona ve y cambia sus datos
// (nombre y NIF), cambia la contraseña, ve su plan y el uso del mes, y llega
// al reenvío por correo. [Pendiente] Cambiar el correo (necesita un correo
// propio para Supabase) y borrar la cuenta (decidir qué pasa con los datos).

export const metadata: Metadata = {
  title: "Mi cuenta | Ticketon",
};

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ error?: string; mensaje?: string }> };

type FilaPlan = { hasta: string | null; planes: { nombre: string } | { nombre: string }[] | null };

function nombreDelPlan(filas: FilaPlan[]): string | null {
  const activa = filas.find((s) => s.hasta === null);
  const plan = Array.isArray(activa?.planes) ? activa?.planes[0] : activa?.planes;
  return plan?.nombre ?? null;
}

function Aviso({ error, mensaje }: { error?: string; mensaje?: string }) {
  if (error)
    return (
      <p className={styles.error} role="alert">
        {error}
      </p>
    );
  if (mensaje)
    return (
      <p className={styles.exito} role="status">
        {mensaje}
      </p>
    );
  return null;
}

export default async function CuentaPage({ searchParams }: Props) {
  const params = await searchParams;

  if (!configSupabase()) {
    return (
      <ConNavegacion actual="cuenta">
        <main className={styles.pagina}>
          <h1 className={styles.titulo}>Mi cuenta</h1>
          <p className={styles.explicacion}>Entra con tu cuenta para ver y cambiar tus datos.</p>
        </main>
      </ConNavegacion>
    );
  }

  const supabase = await clienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Sin sesión, proxy.ts (#13) ya manda a /entrar; esto solo queda por si se llega sin pasar por él.
  if (!user) redirect("/entrar?next=/cuenta");

  const mes = mesActual();
  const [perfil, usos, suscripciones] = await Promise.all([
    supabase.from("perfiles").select("nombre, nif, codigo_correo").eq("id", user.id).maybeSingle(),
    supabase.from("uso_mensual").select("mes, documentos_procesados").eq("mes", mes),
    supabase.from("suscripciones").select("hasta, planes(nombre, limite_documentos_mes)"),
  ]);
  if (perfil.error || usos.error || suscripciones.error) {
    console.error("[cuenta]", perfil.error?.message ?? usos.error?.message ?? suscripciones.error?.message);
  }
  const uso = usoDelMes((usos.data ?? []) as FilaUso[], (suscripciones.data ?? []) as unknown as FilaSuscripcion[], mes);
  const plan = nombreDelPlan((suscripciones.data ?? []) as unknown as FilaPlan[]);
  const direccion = perfil.data ? direccionDeReenvio(perfil.data.codigo_correo) : null;
  const porcentaje = uso.limite > 0 ? Math.min(100, Math.round((uso.usados / uso.limite) * 100)) : 0;

  return (
    <ConNavegacion actual="cuenta">
      <main className={styles.pagina}>
        <header>
          <h1 className={styles.titulo}>Mi cuenta</h1>
          <p className={styles.explicacion}>Tus datos, tu contraseña y tu plan.</p>
        </header>

        <Aviso error={params.error} mensaje={params.mensaje} />

        <section className={styles.tarjeta} aria-labelledby="titulo-datos">
          <h2 id="titulo-datos">Mis datos</h2>
          <form action={guardarDatosCuenta} className={styles.formulario}>
            <label htmlFor="nombre">Nombre o razón social</label>
            <input id="nombre" name="nombre" type="text" autoComplete="name" maxLength={NOMBRE_MAXIMO} defaultValue={perfil.data?.nombre ?? ""} />
            <label htmlFor="nif">NIF</label>
            <input id="nif" name="nif" type="text" autoComplete="off" maxLength={20} defaultValue={perfil.data?.nif ?? ""} aria-describedby="ayuda-nif" />
            <small id="ayuda-nif">Opcional. Es el NIF que tienen que llevar tus facturas como receptor.</small>
            <button type="submit" className={styles.boton}>
              Guardar mis datos
            </button>
          </form>
          <dl className={styles.dato}>
            <dt>Correo de la cuenta</dt>
            <dd>{user.email}</dd>
          </dl>
          <p className={styles.nota}>Por ahora el correo no se puede cambiar desde aquí.</p>
        </section>

        <section className={styles.tarjeta} aria-labelledby="titulo-plan">
          <h2 id="titulo-plan">Plan y uso</h2>
          <dl className={styles.dato}>
            <dt>Plan</dt>
            <dd>{plan ?? "Sin plan activo"}</dd>
            <dt>Documentos este mes</dt>
            <dd>
              {uso.usados} de {uso.limite}
            </dd>
          </dl>
          <div className={styles.barra} role="img" aria-label={`${uso.usados} de ${uso.limite} documentos usados este mes`}>
            <span style={{ width: `${porcentaje}%` }} />
          </div>
          <p className={styles.nota}>
            El contador vuelve a 0 cada mes. <Link href="/precios">Ver planes</Link>
          </p>
        </section>

        <section className={styles.tarjeta} aria-labelledby="titulo-correo">
          <h2 id="titulo-correo">Reenvío por correo</h2>
          {direccion ? (
            <>
              <p className={styles.nota}>Reenvía tus facturas a esta dirección y entran solas:</p>
              <p className={styles.direccion}>
                <code>{direccion}</code>
              </p>
            </>
          ) : (
            <p className={styles.nota}>Pronto tendrás una dirección propia para reenviar tus facturas.</p>
          )}
          <Link href="/cuenta/correo">Configurar correos autorizados</Link>
        </section>

        <section className={styles.tarjeta} aria-labelledby="titulo-contrasena">
          <h2 id="titulo-contrasena">Contraseña</h2>
          <form action={cambiarContrasenaCuenta} className={styles.formulario}>
            <label htmlFor="actual">Contraseña actual</label>
            <input id="actual" name="actual" type="password" autoComplete="current-password" required />
            <label htmlFor="password">Contraseña nueva</label>
            <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={72} required />
            <label htmlFor="passwordConfirm">Repite la contraseña nueva</label>
            <input id="passwordConfirm" name="passwordConfirm" type="password" autoComplete="new-password" minLength={8} maxLength={72} required />
            <small>Al menos 8 caracteres.</small>
            <button type="submit" className={styles.boton}>
              Cambiar la contraseña
            </button>
          </form>
        </section>

        <section className={styles.tarjeta} aria-labelledby="titulo-sesion">
          <h2 id="titulo-sesion">Sesión</h2>
          <form action="/cuenta/salir" method="post">
            <button type="submit" className={styles.botonSecundario}>
              Cerrar sesión
            </button>
          </form>
        </section>
      </main>
    </ConNavegacion>
  );
}
