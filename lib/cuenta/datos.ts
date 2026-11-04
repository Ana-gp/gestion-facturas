/**
 * P15 · Mi cuenta: comprobar los datos que la persona puede cambiar
 * (nombre y NIF, columnas `perfiles.nombre` y `perfiles.nif`).
 * El NIF es opcional; si se escribe, tiene que tener un formato válido
 * (DNI, NIE, CIF o IVA de la UE), porque se compara con el NIF del receptor.
 */

import { formatoNifValido } from "../revision/comprobaciones.ts";

export const NOMBRE_MAXIMO = 120;

export type DatosCuenta = { nombre: string | null; nif: string | null };

export function validarDatosCuenta(nombre: string, nif: string): { datos: DatosCuenta } | { error: string } {
  const n = nombre.trim().replace(/\s+/g, " ");
  if (n.length > NOMBRE_MAXIMO) return { error: `El nombre puede tener como mucho ${NOMBRE_MAXIMO} caracteres.` };
  const limpio = nif.toUpperCase().replace(/[\s.-]/g, "");
  if (limpio && !formatoNifValido(limpio)) {
    return { error: "El NIF no tiene un formato válido. Revisa las cifras y la letra." };
  }
  return { datos: { nombre: n || null, nif: limpio || null } };
}
