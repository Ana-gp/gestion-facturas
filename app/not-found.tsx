import type { Metadata } from "next";
import Link from "next/link";
import { CabeceraPublica, PiePublico } from "@/app/_componentes/Publico";

// Página de error 404 en español (la de Next.js sale en inglés).
export const metadata: Metadata = {
  title: "Página no encontrada | Ticketon",
};

export default function NoEncontrada() {
  return (
    <>
      <CabeceraPublica actual="legal" />
      <main className="page">
        <section className="welcome">
          <h1>No encontramos esta página</h1>
          <p>Puede que la dirección esté mal escrita o que la página ya no exista.</p>
          <p>
            <Link href="/">Ir a la portada</Link> · <Link href="/gastos">Ir a Mis gastos</Link>
          </p>
        </section>
      </main>
      <PiePublico />
    </>
  );
}
