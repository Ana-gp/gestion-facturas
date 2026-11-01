/**
 * Conversión de moneda a euros (#20). Criterio: decisión D3 y PR #46.
 *
 * - La norma (Ley del IVA, art. 79.Once) pide el tipo de cambio vendedor del
 *   Banco de España vigente en el devengo. El Banco de España no fija tipos
 *   propios: usa los oficiales del euro que publica el BCE. Ticketon los
 *   consulta en la API del BCE y los PROPONE; el usuario los acepta o escribe
 *   otro. Nunca se aplican solos. [Pendiente] Validar con una gestoría (#46).
 * - Fecha: la de la factura. Si ese día no hay tipo (fin de semana o festivo
 *   de TARGET), el último publicado antes. La fecha de subida nunca cuenta.
 *   La fecha de la factura no siempre es la del devengo: el usuario puede
 *   cambiar el tipo a mano.
 * - Convención: unidades de la moneda por 1 euro (1 € = 1,1133 USD).
 *   total_eur = round(total / tipo_cambio, 2), igual que el CHECK de la tabla.
 */

/**
 * `BDE` sigue la columna `tipo_cambio_fuente` del PR #46. El dato se consulta
 * en la API del BCE, que es el mismo tipo que publica el Banco de España.
 */
export type FuenteTipoCambio = "BDE" | "manual";

export type TipoDeCambio = {
  moneda: string;
  /** Unidades de la moneda por 1 euro. */
  tipo: number;
  /** Día del tipo aplicado, AAAA-MM-DD. Puede ser anterior a la fecha de la factura. */
  fecha: string;
  fuente: FuenteTipoCambio;
};

/** Monedas con tipo de referencia diario del BCE (lista publicada; puede cambiar). */
export const MONEDAS_BCE = [
  "USD", "JPY", "BGN", "CZK", "DKK", "GBP", "HUF", "PLN", "RON", "SEK", "CHF", "ISK", "NOK",
  "TRY", "AUD", "BRL", "CAD", "CNY", "HKD", "IDR", "ILS", "INR", "KRW", "MXN", "MYR", "NZD",
  "PHP", "SGD", "THB", "ZAR",
] as const;

/** Días hacia atrás en los que se busca el último tipo publicado (cubre Semana Santa y Navidad). */
export const DIAS_HACIA_ATRAS = 10;

function redondear(valor: number, decimales: number): number {
  const f = 10 ** decimales;
  return Math.round((valor + Number.EPSILON) * f) / f;
}

export function esMonedaDelBce(moneda: string): boolean {
  return (MONEDAS_BCE as readonly string[]).includes(moneda.toUpperCase());
}

/** Total en euros con la misma fórmula que la base de datos. */
export function totalEnEuros(total: number, tipo: number): number {
  if (!(tipo > 0)) throw new Error("El tipo de cambio tiene que ser mayor que cero.");
  return redondear(total / tipo, 2);
}

function restarDias(iso: string, dias: number): string {
  const [a, m, d] = iso.split("-").map(Number);
  const fecha = new Date(Date.UTC(a, m - 1, d - dias));
  return fecha.toISOString().slice(0, 10);
}

/** Periodo que se pide al BCE: la fecha de la factura y los días anteriores. */
export function periodoDeBusqueda(fechaFactura: string): { desde: string; hasta: string } {
  return { desde: restarDias(fechaFactura, DIAS_HACIA_ATRAS), hasta: fechaFactura };
}

/** URL de la API de datos del BCE para una moneda y un periodo (formato CSV). */
export function urlDelBce(moneda: string, desde: string, hasta: string): string {
  const clave = `D.${moneda.toUpperCase()}.EUR.SP00.A`;
  return `https://data-api.ecb.europa.eu/service/data/EXR/${clave}?startPeriod=${desde}&endPeriod=${hasta}&format=csvdata`;
}

/** Separa una línea CSV respetando las comillas. */
function camposCsv(linea: string): string[] {
  const campos: string[] = [];
  let actual = "";
  let entreComillas = false;
  for (let i = 0; i < linea.length; i++) {
    const c = linea[i];
    if (c === '"') {
      if (entreComillas && linea[i + 1] === '"') {
        actual += '"';
        i++;
      } else {
        entreComillas = !entreComillas;
      }
    } else if (c === "," && !entreComillas) {
      campos.push(actual);
      actual = "";
    } else {
      actual += c;
    }
  }
  campos.push(actual);
  return campos;
}

/** Lee el CSV del BCE y devuelve las observaciones (fecha y tipo), ordenadas por fecha. */
export function leerCsvDelBce(csv: string): { fecha: string; tipo: number }[] {
  const lineas = csv.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lineas.length === 0) return [];
  const cabecera = camposCsv(lineas[0]).map((c) => c.trim());
  const iFecha = cabecera.indexOf("TIME_PERIOD");
  const iValor = cabecera.indexOf("OBS_VALUE");
  if (iFecha < 0 || iValor < 0) throw new Error("El CSV del BCE no tiene las columnas TIME_PERIOD y OBS_VALUE.");
  const observaciones: { fecha: string; tipo: number }[] = [];
  for (const linea of lineas.slice(1)) {
    const campos = camposCsv(linea);
    const fecha = campos[iFecha]?.trim();
    const tipo = Number(campos[iValor]);
    if (fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha) && tipo > 0) observaciones.push({ fecha, tipo });
  }
  return observaciones.sort((a, b) => a.fecha.localeCompare(b.fecha));
}

/** El último tipo publicado en la fecha de la factura o antes. */
export function tipoParaLaFecha(
  observaciones: { fecha: string; tipo: number }[],
  fechaFactura: string,
): { fecha: string; tipo: number } | null {
  let elegido: { fecha: string; tipo: number } | null = null;
  for (const o of observaciones) if (o.fecha <= fechaFactura && (!elegido || o.fecha > elegido.fecha)) elegido = o;
  return elegido;
}

/** Texto para la pantalla: «1 € = 18,7232 MXN». */
export function textoDelTipo(tipo: number, moneda: string): string {
  return `1 € = ${tipo.toLocaleString("es-ES", { minimumFractionDigits: 4, maximumFractionDigits: 6 })} ${moneda}`;
}

/** Explica de qué día es el tipo cuando no coincide con la fecha de la factura. */
export function notaDeLaFecha(fechaTipo: string, fechaFactura: string): string | null {
  if (fechaTipo === fechaFactura) return null;
  const [a, m, d] = fechaTipo.split("-");
  return `Ese día no hubo tipo publicado: se usa el del ${d}/${m}/${a}, el último anterior.`;
}
