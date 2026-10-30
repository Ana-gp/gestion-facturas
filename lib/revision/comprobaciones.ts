/**
 * Comprobaciones de la pantalla "Revisar y corregir" (tarea 19, issue #21).
 *
 * Lógica pura, sin dependencias, para que la pantalla P10 del mapa de pantallas
 * (docs/mapa-pantallas.md) sepa:
 * - si las cuentas de la factura cuadran;
 * - qué falta para poder marcarla como revisada (las mismas reglas que el
 *   CHECK de la tabla `facturas` en docs/modelo-datos.sql);
 * - qué campos resaltar con "Revisar dato" (decisión D2 del modelo de datos:
 *   se resaltan los campos con confianza baja que el usuario no ha corregido,
 *   y los vacíos).
 *
 * Nunca corrige importes: solo informa. La IA propone y el usuario decide.
 */

export type LineaIva = { tipoIva: number; base: number; cuota: number };

export type DatosRevision = {
  fecha: string | null;
  emisorNombre: string | null;
  emisorNif: string | null;
  receptorNif: string | null;
  numero: string | null;
  categoria: string | null;
  moneda: string;
  total: number | null;
  totalEur: number | null;
  tipoCambio: number | null;
  retencionImporte: number | null;
  lineas: LineaIva[];
};

/** Claves de `campos_revision` (decisión D2 del modelo de datos). */
export type Campo =
  | "fecha"
  | "emisor_nombre"
  | "emisor_nif"
  | "receptor_nif"
  | "numero"
  | "categoria"
  | "lineas_iva"
  | "total"
  | "moneda"
  | "tipo_cambio";

export type Confianza = "alta" | "media" | "baja";

/** Contenido de la columna `campos_revision`: confianza y si el usuario lo corrigió. */
export type CamposRevision = Partial<Record<Campo, { confianza: Confianza; corregido: boolean }>>;

export const ETIQUETAS: Record<Campo, string> = {
  fecha: "Fecha",
  emisor_nombre: "Emisor",
  emisor_nif: "NIF del emisor",
  receptor_nif: "NIF del receptor",
  numero: "Nº de factura",
  categoria: "Categoría",
  lineas_iva: "Líneas de IVA",
  total: "Total",
  moneda: "Moneda",
  tipo_cambio: "Tipo de cambio",
};

/**
 * Margen para dar por buenas las cuentas. Los tickets redondean cada línea,
 * así que la suma puede diferir en uno o dos céntimos del total impreso.
 * [Propuesta] 2 céntimos.
 */
export const TOLERANCIA = 0.02;

function redondear2(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

function esEuro(d: DatosRevision): boolean {
  return d.moneda.toUpperCase() === "EUR";
}

function vacio(valor: string | null): boolean {
  return valor === null || valor.trim() === "";
}

// ---------------------------------------------------------------------------
// ¿Cuadran las cuentas?
// ---------------------------------------------------------------------------

export type ResultadoCuadre =
  | { estado: "cuadra"; esperado: number; diferencia: number }
  | { estado: "no-cuadra"; esperado: number; diferencia: number; mensaje: string }
  | { estado: "sin-datos"; mensaje: string };

/**
 * Compara bases + cuotas − retención con el total. Todo en la moneda original.
 * "sin-datos" si falta el total o no hay líneas de IVA (no se puede comprobar).
 */
export function comprobarCuadre(d: DatosRevision): ResultadoCuadre {
  if (d.total === null) return { estado: "sin-datos", mensaje: "Falta el total: no se pueden comprobar las cuentas." };
  if (d.lineas.length === 0) return { estado: "sin-datos", mensaje: "No hay líneas de IVA: no se pueden comprobar las cuentas." };
  const suma = d.lineas.reduce((s, l) => s + l.base + l.cuota, 0) - (d.retencionImporte ?? 0);
  const esperado = redondear2(suma);
  const diferencia = redondear2(d.total - esperado);
  if (Math.abs(diferencia) <= TOLERANCIA) return { estado: "cuadra", esperado, diferencia };
  return {
    estado: "no-cuadra",
    esperado,
    diferencia,
    mensaje: `Las cuentas no cuadran: bases, cuotas y retención suman ${formatoImporte(esperado)} y el total es ${formatoImporte(d.total)}.`,
  };
}

/** Líneas cuya cuota no corresponde a su base y su tipo de IVA. */
export function lineasQueNoCuadran(d: DatosRevision): { indice: number; cuotaEsperada: number }[] {
  return d.lineas
    .map((l, indice) => ({ indice, cuotaEsperada: redondear2((l.base * l.tipoIva) / 100), cuota: l.cuota }))
    .filter((l) => Math.abs(l.cuota - l.cuotaEsperada) > TOLERANCIA)
    .map(({ indice, cuotaEsperada }) => ({ indice, cuotaEsperada }));
}

function formatoImporte(valor: number): string {
  const [entero, decimales] = Math.abs(valor).toFixed(2).split(".");
  const conPuntos = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${valor < 0 ? "−" : ""}${conPuntos},${decimales}`;
}

// ---------------------------------------------------------------------------
// ¿Se puede marcar como revisada?
// ---------------------------------------------------------------------------

/**
 * Lo que falta para "Guardar como revisada". Mismas reglas que el CHECK de la
 * tabla `facturas`: fecha, emisor, total, categoría y, si la moneda no es el
 * euro, el tipo de cambio (sin él no hay total en euros).
 */
export function faltaParaRevisada(d: DatosRevision): Campo[] {
  const falta: Campo[] = [];
  if (vacio(d.fecha)) falta.push("fecha");
  if (vacio(d.emisorNombre)) falta.push("emisor_nombre");
  if (d.total === null) falta.push("total");
  if (vacio(d.categoria)) falta.push("categoria");
  if (!esEuro(d) && (!d.tipoCambio || d.totalEur === null)) falta.push("tipo_cambio");
  return falta;
}

export function puedeMarcarseRevisada(d: DatosRevision): boolean {
  return faltaParaRevisada(d).length === 0;
}

// ---------------------------------------------------------------------------
// Formato del NIF
// ---------------------------------------------------------------------------

const LETRAS_DNI = "TRWAGMYFPDXBNJZSQVHLCKE";

function limpiarNif(nif: string): string {
  return nif.toUpperCase().replace(/[^0-9A-Z]/g, "");
}

/**
 * true si el NIF tiene un formato válido: DNI, NIE o CIF españoles (con su
 * dígito o letra de control) o un número de IVA de otro país de la UE
 * (prefijo de dos letras; su control no se comprueba).
 * Solo sirve para avisar "revisa este dato"; no comprueba que exista.
 */
export function formatoNifValido(nif: string): boolean {
  const n = limpiarNif(nif);
  const sinPrefijoEs = n.startsWith("ES") && n.length === 11 ? n.slice(2) : n;

  // DNI: 8 cifras y letra.
  if (/^\d{8}[A-Z]$/.test(sinPrefijoEs)) {
    return LETRAS_DNI[Number(sinPrefijoEs.slice(0, 8)) % 23] === sinPrefijoEs[8];
  }
  // NIE: X, Y o Z, 7 cifras y letra.
  if (/^[XYZ]\d{7}[A-Z]$/.test(sinPrefijoEs)) {
    const numero = "XYZ".indexOf(sinPrefijoEs[0]) + sinPrefijoEs.slice(1, 8);
    return LETRAS_DNI[Number(numero) % 23] === sinPrefijoEs[8];
  }
  // CIF: letra, 7 cifras y control (cifra o letra).
  if (/^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/.test(sinPrefijoEs)) {
    return controlCifValido(sinPrefijoEs);
  }
  // Número de IVA de otro país: dos letras y entre 2 y 13 caracteres.
  if (!n.startsWith("ES") && /^[A-Z]{2}[0-9A-Z]{2,13}$/.test(n)) return true;
  return false;
}

function controlCifValido(cif: string): boolean {
  const cifras = cif.slice(1, 8);
  let pares = 0;
  let impares = 0;
  for (let i = 0; i < 7; i++) {
    const c = Number(cifras[i]);
    if (i % 2 === 1) pares += c;
    else {
      const doble = c * 2;
      impares += Math.floor(doble / 10) + (doble % 10);
    }
  }
  const control = (10 - ((pares + impares) % 10)) % 10;
  const letraControl = "JABCDEFGHI"[control];
  const ultimo = cif[8];
  const primera = cif[0];
  // Según el tipo de entidad, el control es una letra, una cifra o cualquiera de los dos.
  if ("PQRSNW".includes(primera)) return ultimo === letraControl;
  if ("ABEH".includes(primera)) return ultimo === String(control);
  return ultimo === String(control) || ultimo === letraControl;
}

// ---------------------------------------------------------------------------
// Confianza y campos a revisar
// ---------------------------------------------------------------------------

/**
 * Confianza de cada campo según nuestras reglas (decisión D2, [Propuesta]):
 * vacío = baja; si las cuentas no cuadran, los importes = baja; NIF con formato
 * extraño = media. Si la IA da su propia confianza, se usa la más baja de las dos.
 * El NIF del receptor vacío no baja la confianza: los tickets no lo llevan.
 */
export function confianzaPorReglas(d: DatosRevision, deLaIa: CamposRevision = {}): Record<Campo, Confianza> {
  const orden: Record<Confianza, number> = { baja: 0, media: 1, alta: 2 };
  const minimo = (a: Confianza, b: Confianza | undefined): Confianza => (b && orden[b] < orden[a] ? b : a);

  const reglas: Record<Campo, Confianza> = {
    fecha: vacio(d.fecha) ? "baja" : "alta",
    emisor_nombre: vacio(d.emisorNombre) ? "baja" : "alta",
    emisor_nif: vacio(d.emisorNif) ? "baja" : formatoNifValido(d.emisorNif as string) ? "alta" : "media",
    receptor_nif: vacio(d.receptorNif) ? "alta" : formatoNifValido(d.receptorNif as string) ? "alta" : "media",
    numero: "alta",
    categoria: vacio(d.categoria) ? "baja" : "alta",
    lineas_iva: d.lineas.length === 0 ? "baja" : "alta",
    total: d.total === null ? "baja" : "alta",
    moneda: "alta",
    tipo_cambio: esEuro(d) || d.tipoCambio ? "alta" : "baja",
  };

  const cuadre = comprobarCuadre(d);
  if (cuadre.estado === "no-cuadra" || lineasQueNoCuadran(d).length > 0) {
    reglas.lineas_iva = "baja";
    reglas.total = "baja";
  }

  const resultado = {} as Record<Campo, Confianza>;
  for (const campo of Object.keys(reglas) as Campo[]) {
    resultado[campo] = minimo(reglas[campo], deLaIa[campo]?.confianza);
  }
  return resultado;
}

/**
 * Campos que la pantalla marca con "Revisar dato": confianza baja que el
 * usuario todavía no ha corregido.
 */
export function camposARevisar(d: DatosRevision, revision: CamposRevision = {}): Campo[] {
  const confianza = confianzaPorReglas(d, revision);
  return (Object.keys(confianza) as Campo[]).filter(
    (campo) => confianza[campo] === "baja" && !revision[campo]?.corregido,
  );
}

/** Marca un campo como corregido por el usuario (lo que se guarda tras el segundo clic). */
export function marcarCorregido(revision: CamposRevision, campo: Campo): CamposRevision {
  const actual = revision[campo];
  return { ...revision, [campo]: { confianza: actual?.confianza ?? "alta", corregido: true } };
}

// ---------------------------------------------------------------------------
// Avisos de la ficha
// ---------------------------------------------------------------------------

export type AvisoFicha = { clave: string; texto: string };

/** Avisos que muestra la ficha (P10), en lenguaje del usuario. No bloquean salvo lo que diga faltaParaRevisada(). */
export function avisosDeLaFicha(d: DatosRevision, opciones: { posibleDuplicado?: boolean } = {}): AvisoFicha[] {
  const avisos: AvisoFicha[] = [];
  if (opciones.posibleDuplicado) avisos.push({ clave: "duplicado", texto: "Este documento podría estar repetido." });
  if (vacio(d.receptorNif)) avisos.push({ clave: "sin-nif-receptor", texto: "Ticket sin tus datos fiscales." });
  const cuadre = comprobarCuadre(d);
  if (cuadre.estado === "no-cuadra") avisos.push({ clave: "no-cuadra", texto: cuadre.mensaje });
  if (!esEuro(d) && !d.tipoCambio) {
    avisos.push({ clave: "conversion-pendiente", texto: `Factura en ${d.moneda.toUpperCase()}: falta el tipo de cambio.` });
  }
  return avisos;
}
