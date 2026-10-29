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
        <div className="status" role="status">
          <span className="status-dot" aria-hidden="true" />
          Base técnica en preparación
        </div>
        <p className="note">
          Esta pantalla es provisional. El registro, la subida de documentos y
          la lectura automática se incorporarán en las siguientes tareas.
        </p>
      </section>
    </main>
  );
}
