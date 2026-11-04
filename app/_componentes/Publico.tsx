import Link from "next/link";
import styles from "./publico.module.css";

// Cabecera y pie comunes de las páginas públicas (portada, Precios y textos
// legales), para que todas se vean iguales.

type Pagina = "inicio" | "precios" | "legal";

function Marca() {
  return (
    <Link href="/" className={styles.marca} aria-label="Ticketon, inicio">
      <svg className={styles.logo} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 8a2 2 0 0 0 0 4v4h18v-4a2 2 0 0 1 0-4V4H3z" />
        <path d="M13 4v12" />
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
