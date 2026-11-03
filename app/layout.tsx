import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ticketon | Gestión de tickets y facturas",
  description:
    "Organiza tus tickets y facturas, conserva los originales y prepara la documentación para tu gestoría.",
  // iPhone: «Añadir a pantalla de inicio» la abre como una app, con este nombre.
  appleWebApp: { capable: true, title: "Ticketon", statusBarStyle: "default" },
};

// Color de la barra del navegador y de la app instalada (diseño unificado).
export const viewport: Viewport = {
  themeColor: "#2457a7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
