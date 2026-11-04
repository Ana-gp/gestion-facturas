import Link from "next/link";
import styles from "./publico.module.css";

// Cabecera y pie comunes de las páginas públicas (portada, Precios y textos
// legales), para que todas se vean iguales.

type Pagina = "inicio" | "precios" | "legal";

function Marca() {
  return (
    <Link href="/" className={styles.marca} aria-label="Ticketon, inicio">
      {/* El mismo recibo que el menú de la web (ConNavegacion) y el icono del móvil. */}
      <svg className={styles.logo} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
        <path d="M9 8h6" />
        <path d="M9 12h6" />
      </svg>
      <span>Ticketon</span>
    </Link>
  );
}

export function CabeceraPublica({ actual }: { actual: Pagina }) {
  return (
    <header className={styles.cabecera}>
      <Marca />
      <nav className={styles.nav} aria-label="Navegación principal">
        <Link href="/#como-funciona">Cómo funciona</Link>
        <Link href="/precios" aria-current={actual === "precios" ? "page" : undefined}>
          Precios
        </Link>
        <Link href="/entrar">Iniciar sesión</Link>
        <Link href="/registro" className={styles.boton}>
          Crear cuenta
        </Link>
      </nav>
    </header>
  );
}

export function PiePublico() {
  return (
    <footer className={styles.pie}>
      <Marca />
      <p>Organiza tus tickets y facturas. Prepara la información para tu gestoría.</p>
      <nav aria-label="Enlaces legales">
        <Link href="/aviso-legal">Aviso legal</Link>
        <Link href="/privacidad">Privacidad</Link>
        <Link href="/cookies">Cookies</Link>
        <Link href="/precios">Precios</Link>
      </nav>
      <small>© {new Date().getFullYear()} Ticketon. Todos los derechos reservados.</small>
    </footer>
  );
}
