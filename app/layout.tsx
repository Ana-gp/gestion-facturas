import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ticketon | Gestión de tickets y facturas",
  description:
    "Organiza tus tickets y facturas, conserva los originales y prepara la documentación para tu gestoría.",
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
