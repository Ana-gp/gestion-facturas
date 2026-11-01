/**
 * Aviso "trimestre a punto de cerrar" (tarea 30, issue #27).
 *
 * Decisión del mapa de pantallas (apartado 3.5): el aviso se muestra dentro de
 * la web desde 15 días antes del fin del trimestre hasta que termina.
 * No menciona plazos fiscales: solo avisa de que se acaba el trimestre.
 */

export const DIAS_DE_AVISO = 15;

export type AvisoTrimestre = {
  anio: number;
  trimestre: number;
  /** Último día del trimestre, AAAA-MM-DD. */
  fin: string;
  /** Días que quedan hasta el último día, incluido. 0 = hoy es el último día. */
  diasRestantes: number;
  texto: string;
};

function aFechaUtc(iso: string): number {
  const [a, m, d] = iso.split("-").map(Number);
  return Date.UTC(a, m - 1, d);
}

function dosCifras(n: number): string {
  return String(n).padStart(2, "0");
}

/** Trimestre al que pertenece una fecha AAAA-MM-DD. */
export function trimestreDe(iso: string): { anio: number; trimestre: number } {
  const [anio, mes] = iso.split("-").map(Number);
  return { anio, trimestre: Math.floor((mes - 1) / 3) + 1 };
}

/** Último día del trimestre, AAAA-MM-DD. */
export function finDelTrimestre(anio: number, trimestre: number): string {
  const mesFin = trimestre * 3;
  const ultimoDia = new Date(Date.UTC(anio, mesFin, 0)).getUTCDate();
  return `${anio}-${dosCifras(mesFin)}-${dosCifras(ultimoDia)}`;
}

/**
 * Devuelve el aviso si hoy está dentro de los últimos `dias` días del
 * trimestre, o null si todavía no toca avisar.
 * @param hoy Fecha de hoy en la zona horaria del usuario, AAAA-MM-DD.
 */
export function avisoTrimestre(hoy: string, dias: number = DIAS_DE_AVISO): AvisoTrimestre | null {
  const { anio, trimestre } = trimestreDe(hoy);
  const fin = finDelTrimestre(anio, trimestre);
  const diasRestantes = Math.round((aFechaUtc(fin) - aFechaUtc(hoy)) / 86400000);
  if (diasRestantes < 0 || diasRestantes > dias) return null;
  const nombre = `${trimestre}.º trimestre`;
  const texto =
    diasRestantes === 0
      ? `Hoy termina el ${nombre}. Revisa que tienes todos tus gastos subidos.`
      : diasRestantes === 1
        ? `Mañana termina el ${nombre}. Revisa que tienes todos tus gastos subidos.`
        : `Quedan ${diasRestantes} días para que termine el ${nombre}. Revisa que tienes todos tus gastos subidos.`;
  return { anio, trimestre, fin, diasRestantes, texto };
}
