import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./navegacion.module.css";

// Navegación común de la web (diseño unificado, tableros "Gastos" y
// "GastosMovil"): columna a la izquierda en el ordenador y barra abajo en el
// móvil. La usan Mis gastos, Subir, Revisar, Comparar y Exportar. El original
// a pantalla completa (P12) va sin ella a propósito.

export type Seccion = "gastos" | "subir" | "exportar";

const ENLACES: { seccion: Seccion; href: string; texto: string }[] = [
  { seccion: "gastos", href: "/gastos", texto: "Gastos" },
  { seccion: "subir", href: "/subir", texto: "Subir" },
  { seccion: "exportar", href: "/exportar", texto: "Exportar" },
];

export default function ConNavegacion({ actual, children }: { actual?: Seccion; children: ReactNode }) {
  return (
    <div className={styles.marco}>
      <nav className={styles.navegacion} aria-label="Navegación principal">
        <Link href="/gastos" className={styles.marca}>
          <span className={styles.logo} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
              <path d="M9 8h6" />
              <path d="M9 12h6" />
            </svg>
          </span>
          Ticketon
        </Link>
        <div className={styles.enlaces}>
          {ENLACES.map((e) => (
            <Link
              key={e.seccion}
              href={e.href}
              aria-current={actual === e.seccion ? "page" : undefined}
              className={actual === e.seccion ? styles.enlaceActual : styles.enlace}
            >
              {e.texto}
            </Link>
          ))}
        </div>
      </nav>
      <div className={styles.zona}>{children}</div>
    </div>
  );
}
