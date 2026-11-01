// GET /api/tipo-cambio?moneda=MXN&fecha=2024-01-06
// Propone el tipo de cambio para una factura en otra moneda (#20).
// Se consulta desde el servidor para no depender de que el BCE permita
// peticiones desde el navegador.

import {
  esMonedaDelBce,
  leerCsvDelBce,
  periodoDeBusqueda,
  tipoParaLaFecha,
  urlDelBce,
  type TipoDeCambio,
} from "@/lib/moneda/conversion";

function error(estado: number, mensaje: string) {
  return Response.json({ error: mensaje }, { status: estado });
}

export async function GET(peticion: Request) {
  const parametros = new URL(peticion.url).searchParams;
  const moneda = (parametros.get("moneda") ?? "").toUpperCase();
  const fecha = parametros.get("fecha") ?? "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return error(400, "Falta la fecha de la factura.");
  if (moneda === "EUR") return error(400, "La factura ya está en euros.");
  if (!esMonedaDelBce(moneda)) {
    return error(404, `No hay tipo de cambio publicado para ${moneda}. Escríbelo a mano.`);
  }

  const { desde, hasta } = periodoDeBusqueda(fecha);
  try {
    const respuesta = await fetch(urlDelBce(moneda, desde, hasta), {
      headers: { Accept: "text/csv" },
      // Los tipos de días pasados no cambian: se pueden guardar en caché un día.
      next: { revalidate: 86400 },
    } as RequestInit);
    if (respuesta.status === 404) return error(404, "No hay tipo publicado para esa fecha. Escríbelo a mano.");
    if (!respuesta.ok) return error(502, "No se ha podido consultar el tipo de cambio. Inténtalo más tarde o escríbelo a mano.");

    const elegido = tipoParaLaFecha(leerCsvDelBce(await respuesta.text()), fecha);
    if (!elegido) return error(404, "No hay tipo publicado para esa fecha. Escríbelo a mano.");

    const resultado: TipoDeCambio = { moneda, tipo: elegido.tipo, fecha: elegido.fecha, fuente: "BDE" };
    return Response.json(resultado);
  } catch {
    return error(502, "No se ha podido consultar el tipo de cambio. Inténtalo más tarde o escríbelo a mano.");
  }
}
