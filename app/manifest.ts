import type { MetadataRoute } from "next";

// Instalación en el móvil (PWA, decidida en docs/funciones.md y anunciada en
// Precios, #24). Next.js sirve este archivo como /manifest.webmanifest y añade
// el enlace en todas las páginas.
// - Al abrirla desde la pantalla de inicio se entra en Mis gastos (P07).
// - Colores e icono del diseño unificado: azul #2457A7 y el ticket del menú.
// [Pendiente] Compartir desde el móvil (#17, share_target): aplazado.

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ticketon · Tickets y facturas para tu gestoría",
    short_name: "Ticketon",
    description: "Guarda tus tickets y facturas con su original, revisa los datos y prepara el Excel para tu gestoría.",
    lang: "es",
    start_url: "/gastos",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7f8fa",
    theme_color: "#2457a7",
    icons: [
      { src: "/iconos/icono-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/iconos/icono-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/iconos/icono-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
