import type { Metadata } from "next";
import Link from "next/link";
import styles from "./precios.module.css";

export const metadata: Metadata = {
  title: "Planes y precios | Ticketon",
  description:
    "Compara los planes de Ticketon para organizar tickets y facturas y preparar la documentación para tu gestoría.",
};

const planes = [
  {
    nombre: "Gratis",
    descripcion: "Para empezar a organizar tus justificantes.",
    precio: "0 €",
    periodo: "/ mes",
    limite: "Hasta 10 documentos procesados al mes",
    destacado: false,
    cta: "Empezar gratis",
  },
  {
    nombre: "Autónomo",
    descripcion: "Para el día a día de tu actividad.",
    precio: "4,99 €",
    periodo: "/ mes",
    limite: "Hasta 100 documentos procesados al mes",
    destacado: true,
    cta: "Elegir plan",
  },
  {
    nombre: "Autónomo Plus",
    descripcion: "Para quienes gestionan más justificantes.",
    precio: "8,99 €",
    periodo: "/ mes",
    limite: "Hasta 300 documentos procesados al mes",
    destacado: false,
    cta: "Elegir plan",
  },
];

const funcionesComunes = [
  "Subir tickets y facturas en PDF o imagen",
  "Reenviar facturas por correo a tu dirección de Ticketon",
  "Conservar los documentos originales",
  "Lectura automática y corrección de datos",
  "Detección de posibles documentos duplicados",
  "Exportación básica a Excel por periodo",
  "Instalación en el móvil",
  "Avisos dentro de la web",
];

export default function PreciosPage() {
  return (
    <main className={styles.pagina}>
      <header className={styles.cabecera}>
        <Link className={styles.marca} href="/" aria-label="Ticketon, inicio">
          <svg className={styles.logoIcon} viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8a2 2 0 0 0 0 4v4h18v-4a2 2 0 0 1 0-4V4H3z" /><path d="M13 4v12" stroke="currentColor" strokeDasharray="2 2" /></svg>
          <span>Ticketon</span>
        </Link>
        <nav className={styles.navegacion} aria-label="Navegación principal">
          <Link href="#planes">Planes</Link>
          <Link href="#incluido">Qué incluye</Link>
          <Link href="/entrar">Iniciar sesión</Link>
        </nav>
      </header>

      <section className={styles.hero} aria-labelledby="titulo">
        <p className={styles.eyebrow}>PLANES Y PRECIOS</p>
        <h1 id="titulo">Menos tiempo ordenando. Más tiempo para tu negocio.</h1>
        <p className={styles.intro}>
          Elige el espacio que necesitas para guardar tus tickets y facturas,
          revisar sus datos y preparar la documentación para tu gestoría.
        </p>
        <Link className={styles.enlaceHero} href="#planes">
          Comparar planes <span aria-hidden="true">↓</span>
        </Link>
      </section>

      <section className={styles.planes} id="planes" aria-labelledby="titulo-planes">
        <div className={styles.encabezadoSeccion}>
          <div>
            <p className={styles.eyebrow}>ELIGE TU PLAN</p>
            <h2 id="titulo-planes">Empieza a tu ritmo</h2>
          </div>
          <p className={styles.notaPrecio}>
            Precios provisionales. La contratación todavía no está habilitada.
          </p>
        </div>

        <div className={styles.rejilla}>
          {planes.map((plan) => (
            <article
              className={`${styles.tarjeta} ${plan.destacado ? styles.tarjetaDestacada : ""}`}
              key={plan.nombre}
            >
              {plan.destacado && <p className={styles.etiqueta}>Para el día a día</p>}
              <div className={styles.cabeceraTarjeta}>
                <h3>{plan.nombre}</h3>
                <p>{plan.descripcion}</p>
              </div>

              <div className={styles.precio}>
                <span className={styles.cifra}>{plan.precio}</span>
                <span className={styles.periodo}>{plan.periodo}</span>
              </div>

              <p className={styles.limite}>{plan.limite}</p>

              <div className={styles.separador} />

              <p className={styles.tituloLista}>Incluido en todos los planes</p>
              <ul className={styles.lista}>
                {funcionesComunes.map((funcion) => (
                  <li key={funcion}>
                    <span className={styles.check} aria-hidden="true">✓</span>
                    <span>{funcion}</span>
                  </li>
                ))}
              </ul>
              <p className={styles.proximamente}>Cierre de trimestre: próximamente.</p>

              {plan.nombre === "Gratis" ? (
                <Link className={styles.botonPrincipal} href="/registro">
                  {plan.cta}
                </Link>
              ) : (
                <button className={styles.botonProximamente} type="button" disabled aria-describedby={`aviso-${plan.nombre.toLowerCase().replaceAll(" ", "-")}`}>
                  {plan.cta}
                </button>
              )}
              {plan.nombre !== "Gratis" && (
                <p className={styles.avisoContratacion} id={`aviso-${plan.nombre.toLowerCase().replaceAll(" ", "-")}`}>
                  Próximamente. No se realizará ningún pago.
                </p>
              )}
            </article>
          ))}
        </div>
        <p className={styles.notaPlanes}>
          La exportación básica a Excel está incluida en los tres planes. El cierre de trimestre es la función adicional prevista para los planes de pago.
        </p>
      </section>

      <section className={styles.incluido} id="incluido" aria-labelledby="titulo-incluido">
        <div className={styles.textoIncluido}>
          <p className={styles.eyebrow}>SIN COMPLICACIONES</p>
          <h2 id="titulo-incluido">Tus justificantes, preparados para revisar y compartir.</h2>
          <p>
            Ticketon reúne tus documentos y te ayuda a tener sus datos ordenados.
            Tú puedes revisar la información antes de exportarla y compartirla con tu gestoría.
          </p>
        </div>
        <div className={styles.pasos}>
          <div className={styles.paso}>
            <span>01</span>
            <div>
              <h3>Sube tus documentos</h3>
              <p>Añade tickets y facturas en PDF o imagen.</p>
            </div>
          </div>
          <div className={styles.paso}>
            <span>02</span>
            <div>
              <h3>Revisa los datos</h3>
              <p>Comprueba la información extraída y corrige lo que haga falta.</p>
            </div>
          </div>
          <div className={styles.paso}>
            <span>03</span>
            <div>
              <h3>Prepara la exportación</h3>
              <p>Descarga el Excel del periodo para enviarlo a tu gestoría.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.preguntas} aria-labelledby="titulo-preguntas">
        <p className={styles.eyebrow}>PREGUNTAS FRECUENTES</p>
        <h2 id="titulo-preguntas">Antes de elegir</h2>
        <div className={styles.pregunta}>
          <h3>¿Puedo exportar mis gastos con el plan Gratis?</h3>
          <p>Sí. La exportación básica a Excel está prevista en los tres planes.</p>
        </div>
        <div className={styles.pregunta}>
          <h3>¿Qué añade el cierre de trimestre?</h3>
          <p>
            Está previsto para una próxima versión. Por ahora, puedes exportar tus gastos
            a Excel por periodo desde la sección Exportar.
          </p>
        </div>
        <div className={styles.pregunta}>
          <h3>¿Puedo contratar ahora un plan de pago?</h3>
          <p>
            Todavía no. Los pagos y la contratación no están habilitados en esta versión. Los importes son provisionales y pueden cambiar.
          </p>
        </div>
        <div className={styles.pregunta}>
          <h3>¿Ticketon decide qué gastos puedo deducir?</h3>
          <p>
            No. Ticketon organiza los justificantes y sus datos. La valoración fiscal
            corresponde a ti y a tu asesoría o gestoría.
          </p>
        </div>
      </section>

      <footer className={styles.pie}>
        <Link className={styles.marca} href="/">
          <svg className={styles.logoIcon} viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8a2 2 0 0 0 0 4v4h18v-4a2 2 0 0 1 0-4V4H3z" /><path d="M13 4v12" stroke="currentColor" strokeDasharray="2 2" /></svg>
          <span>Ticketon</span>
        </Link>
        <p>Organiza tus justificantes. Simplifica el trabajo con tu gestoría.</p>
        <nav className={styles.legalNav} aria-label="Enlaces legales">
          <Link href="/aviso-legal">Aviso legal</Link>
          <Link href="/privacidad">Privacidad</Link>
          <Link href="/cookies">Cookies</Link>
        </nav>
        <Link href="/">Volver al inicio</Link>
      </footer>
    </main>
  );
}
