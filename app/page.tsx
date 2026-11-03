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
          </Link>{" "}
          <Link href="/registro" className="boton-secundario">
            Crear cuenta
          </Link>
        </p>
        <p className="note">
          Portada provisional mientras se termina la definitiva (#25). Para
          ver tus gastos tienes que entrar con tu cuenta o crear una.
        </p>
      </section>
    </main>
  );
}
