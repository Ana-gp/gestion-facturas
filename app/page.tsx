import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page">
      <section className="welcome" aria-labelledby="welcome-title">
        <p className="eyebrow">GESTIÓN DE GASTOS · MVP ACADÉMICO</p>
        <h1 id="welcome-title">Tus tickets y facturas, en orden.</h1>
        <p className="intro">
          Ticketon te ayudará a reunir tus justificantes, revisar los datos
          extraídos y preparar la documentación para tu gestoría.
        </p>
        <p>
          <Link href="/gastos" className="boton-principal">
            Ver mis gastos
          </Link>
        </p>
        <p className="note">
          Portada provisional mientras se termina la definitiva (#25). Sin
          iniciar sesión, la web enseña los tickets de prueba del equipo.
        </p>
      </section>
    </main>
  );
}
