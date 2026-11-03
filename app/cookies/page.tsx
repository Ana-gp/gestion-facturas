import Link from "next/link";
import styles from "../legal.module.css";

export default function CookiesPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}><Link href="/" className={styles.brand}>ticketon<span>.</span></Link><Link href="/">Volver al inicio</Link></header>
      <article className={styles.content}>
        <p className={styles.eyebrow}>TECNOLOGÍAS Y PREFERENCIAS</p>
        <h1>Política de cookies</h1>
        <p className={styles.updated}>Borrador de trabajo · Última revisión: 03/11/2026</p>
        <div className={styles.draft}><strong>Pendiente de auditoría técnica antes de publicar.</strong> No se ha verificado todavía el inventario de cookies y tecnologías equivalentes de la aplicación desplegada. No debe afirmarse que el sitio utiliza exclusivamente cookies técnicas hasta completar esa comprobación.</div>
        <h2>1. Qué son las cookies</h2>
        <p>Las cookies son pequeños archivos que un sitio web puede guardar en el navegador de la persona usuaria. También existen tecnologías similares que pueden almacenar o acceder a información en el dispositivo.</p>
        <h2>2. Qué tecnologías utiliza Ticketon</h2>
        <p>La aplicación necesita mecanismos técnicos para mantener la sesión, proteger el acceso y permitir el funcionamiento de las funciones solicitadas. La configuración concreta de autenticación y sesión debe revisarse para identificar las cookies estrictamente necesarias y documentar sus características.</p>
        <p><span className={styles.placeholder}>[PENDIENTE: inventario real por nombre, proveedor, finalidad, duración y tipo (propia o de terceros)]</span>.</p>
        <h2>3. Cookies no necesarias</h2>
        <p><span className={styles.placeholder}>[PENDIENTE: confirmar si existen cookies analíticas, publicitarias, de personalización o tecnologías equivalentes]</span>. Si se incorporan tecnologías que requieran consentimiento, no se activarán antes de obtenerlo. La persona usuaria podrá aceptar o rechazar las categorías opcionales con facilidad equivalente y modificar su elección posteriormente.</p>
        <h2>4. Cómo gestionar las cookies</h2>
        <p>Además de las opciones que ofrezca Ticketon, el navegador permite bloquear o eliminar cookies. Si se bloquean las estrictamente necesarias, algunas funciones —como mantener la sesión iniciada— pueden dejar de funcionar correctamente.</p>
        <h2>5. Actualizaciones y contacto</h2>
        <p>Esta política se actualizará cuando cambien las tecnologías utilizadas. Para consultas: <span className={styles.placeholder}>[PENDIENTE: email de contacto]</span>.</p>
      </article>
      <footer className={styles.footer}><Link href="/aviso-legal">Aviso legal</Link> · <Link href="/privacidad">Privacidad</Link> · <Link href="/">Inicio</Link></footer>
    </main>
  );
}
