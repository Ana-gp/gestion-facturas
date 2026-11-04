import Link from "next/link";
import styles from "./landing.module.css";

export default function HomePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Ticketon, inicio"><svg className={styles.logoIcon} viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8a2 2 0 0 0 0 4v4h18v-4a2 2 0 0 1 0-4V4H3z" /><path d="M13 4v12" /></svg><span>Ticketon</span></Link>
        <nav className={styles.nav} aria-label="Navegación principal">
          <Link href="#como-funciona">Cómo funciona</Link>
          <Link href="/precios">Precios</Link>
          <Link href="/entrar">Iniciar sesión</Link>
          <Link href="/registro" className={styles.navCta}>Crear cuenta</Link>
        </nav>
      </header>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>MENOS PAPELES. MÁS ORDEN.</p>
          <h1 id="hero-title">Tus tickets y facturas, <em>en orden.</em></h1>
          <p className={styles.lead}>Reúne tus justificantes en un solo sitio, revisa los datos que extraemos y prepara la documentación para tu gestoría sin perseguir papeles a final de mes.</p>
          <div className={styles.actions}>
            <Link href="/registro" className={styles.primary}>Empieza gratis <span aria-hidden="true">→</span></Link>
            <Link href="/precios" className={styles.secondary}>Ver planes</Link>
          </div>
          <p className={styles.micro}>Pensado para autónomos que quieren tener sus gastos organizados.</p>
        </div>
        <div className={styles.preview} aria-label="Ejemplo ilustrativo de un gasto organizado">
          <div className={styles.previewTop}><span>Resumen de gastos</span><span className={styles.dot}>●</span></div>
          <div className={styles.previewMetric}><span>Documentos de este mes</span><strong>24</strong></div>
          <div className={styles.progress}><span /></div>
          <div className={styles.previewRow}><span className={styles.fileIcon}>PDF</span><span><strong>Combustible</strong><small>Factura · 12 oct</small></span><b className={styles.review}>Revisada</b></div>
          <div className={styles.previewRow}><span className={styles.fileIcon}>IMG</span><span><strong>Material de oficina</strong><small>Ticket · 10 oct</small></span><b className={styles.pending}>Pendiente</b></div>
          <div className={styles.previewRow}><span className={styles.fileIcon}>PDF</span><span><strong>Telefonía</strong><small>Factura · 08 oct</small></span><b className={styles.review}>Revisada</b></div>
          <p className={styles.previewFoot}>Vista de ejemplo · Datos ficticios</p>
        </div>
      </section>
      <section className={styles.trust} aria-label="Qué puedes hacer con Ticketon">
        <p>Todo lo que necesitas para preparar tus justificantes</p>
        <div><span>01</span> Guarda tickets y facturas</div>
        <div><span>02</span> Revisa los datos extraídos</div>
        <div><span>03</span> Exporta para tu gestoría</div>
      </section>
      <section id="como-funciona" className={styles.steps}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>ASÍ DE SENCILLO</p>
          <h2>De los papeles a todo en orden.</h2>
          <p>Un proceso claro para que tus justificantes no se queden olvidados en el móvil, el correo o un cajón.</p>
        </div>
        <div className={styles.stepGrid}>
          <article><span>1</span><h3>Sube tus documentos</h3><p>Haz una foto al ticket, añade una imagen o un PDF desde tu dispositivo, o reenvía por correo las facturas que te llegan por email.</p></article>
          <article><span>2</span><h3>Revisa la información</h3><p>Ticketon lee los datos disponibles para ayudarte a organizarlos. Tú puedes revisarlos y corregirlos.</p></article>
          <article><span>3</span><h3>Prepara la entrega</h3><p>Consulta tus gastos y exporta la información del periodo para compartirla con tu gestoría.</p></article>
        </div>
      </section>
      <section className={styles.callout}>
        <div><p className={styles.eyebrow}>EMPIEZA CUANDO QUIERAS</p><h2>Tu documentación, bajo control.</h2><p>Organiza tus justificantes poco a poco y evita dejarlo todo para el último día.</p></div>
        <Link href="/registro" className={styles.primary}>Crear cuenta gratis <span aria-hidden="true">→</span></Link>
      </section>
      <footer className={styles.footer}>
        <Link href="/" className={styles.brand}><svg className={styles.logoIcon} viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8a2 2 0 0 0 0 4v4h18v-4a2 2 0 0 1 0-4V4H3z" /><path d="M13 4v12" /></svg><span>Ticketon</span></Link>
        <p>Organiza tus tickets y facturas. Prepara la información para tu gestoría.</p>
        <nav aria-label="Enlaces legales"><Link href="/aviso-legal">Aviso legal</Link><Link href="/privacidad">Privacidad</Link><Link href="/cookies">Cookies</Link><Link href="/precios">Precios</Link></nav>
        <small>© {new Date().getFullYear()} Ticketon. Todos los derechos reservados.</small>
      </footer>
    </main>
  );
}
