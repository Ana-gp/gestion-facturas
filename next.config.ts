import type { NextConfig } from "next";

// Cabeceras de seguridad básicas para todas las páginas.
const cabecerasDeSeguridad = [
  // Otra web no puede meter Ticketon dentro de su página (evita el clickjacking).
  // SAMEORIGIN y no DENY: Revisar, Comparar y el visor enseñan el original en un
  // iframe, y un original de ejemplo puede servirse desde la propia web.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  // El navegador no adivina el tipo de los archivos.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Al salir a otro sitio solo se envía el dominio, no la dirección completa.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Sin micrófono ni ubicación; la cámara solo para esta web («Hacer foto»).
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: cabecerasDeSeguridad }];
  },
};

export default nextConfig;
