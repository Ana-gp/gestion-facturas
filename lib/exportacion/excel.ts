/**
 * Exportación a Excel para la gestoría (tarea 23, issue #23).
 *
 * Genera el archivo .xlsx que descarga el usuario con los gastos de un periodo.
 * Las columnas y reglas son las decididas en el issue #23 y se ven en
 * docs/ejemplo-exportacion.xlsx.
 *
 * - Hoja "Gastos": una fila por cada tipo de IVA de cada factura. El total y la
 *   retención solo van en la primera fila, para no sumar la factura dos veces.
 * - Hoja "Resumen": periodo, número de documentos, bases y cuotas por tipo de
 *   IVA y total del periodo.
 *
 * Sin dependencias: un .xlsx es un ZIP con XML dentro. El archivo funciona igual
 * en el servidor (rutas de Next.js) y en el navegador, porque devuelve un
 * Uint8Array y no usa APIs de Node.
 *
 * Los datos de entrada siguen la vista `exportacion_gestoria` de
 * docs/modelo-datos.sql, agrupados por factura.
 */

// ---------------------------------------------------------------------------
// Tipos de entrada
// ---------------------------------------------------------------------------

export type LineaIva = {
  /** Tipo de IVA en porcentaje: 21, 10, 4, 0. */
  tipoIva: number;
  /** Base imponible en la moneda original. */
  base: number;
  /** Cuota de IVA en la moneda original. */
  cuota: number;
};

export type FacturaExportable = {
  id: string;
  /** Fecha de expedición en formato AAAA-MM-DD, o null si falta. */
  fecha: string | null;
  tipoDocumento: "factura" | "ticket";
  numero: string | null;
  emisorNombre: string | null;
  emisorNif: string | null;
  receptorNif: string | null;
  categoria: string | null;
  /** Código ISO 4217: EUR, USD... */
  moneda: string;
  /** Total en la moneda original. */
  total: number | null;
  /** Total en euros. Null si la moneda no es EUR y falta el tipo de cambio. */
  totalEur: number | null;
  /** Unidades de la moneda por 1 euro (convención del BCE). Null si es EUR. */
  tipoCambio: number | null;
  /** Fecha del tipo de cambio, AAAA-MM-DD. */
  tipoCambioFecha: string | null;
  /** Retención de IRPF en la moneda original. */
  retencionImporte: number | null;
  estadoRevision: "pendiente" | "revisada";
  /** true si tiene un posible duplicado sin resolver. */
  posibleDuplicado: boolean;
  /** Nombre del archivo original subido, por ejemplo "IMG_2041.jpg". */
  nombreArchivo: string;
  lineas: LineaIva[];
};

export type Periodo =
  | { tipo: "mes"; anio: number; mes: number }
  | { tipo: "trimestre"; anio: number; trimestre: number }
  | { tipo: "anio"; anio: number };

export type OpcionesExportacion = {
  periodo: Periodo;
  /** Nombre del titular de la cuenta, para la hoja Resumen. */
  titular: string;
  /** Fecha de la exportación, AAAA-MM-DD. */
  fechaExportacion: string;
};

// ---------------------------------------------------------------------------
// Filas de la hoja "Gastos"
// ---------------------------------------------------------------------------

export const COLUMNAS_GASTOS = [
  "Nº de orden",
  "Fecha",
  "Tipo de documento",
  "Nº de factura",
  "Emisor",
  "NIF del emisor",
  "NIF del receptor",
  "Categoría",
  "Tipo de IVA (%)",
  "Base imponible (€)",
  "Cuota de IVA (€)",
  "Retención IRPF (€)",
  "Total factura (€)",
  "Moneda original",
  "Total en moneda original",
  "Tipo de cambio",
  "Fecha del tipo de cambio",
  "Estado",
  "Avisos",
  "Archivo original",
] as const;

export type FilaGasto = {
  orden: number;
  fecha: string | null;
  tipoDocumento: string;
  numero: string | null;
  emisor: string | null;
  emisorNif: string | null;
  receptorNif: string | null;
  categoria: string | null;
  tipoIva: number | null;
  baseEur: number | null;
  cuotaEur: number | null;
  /** Solo en la primera fila de cada factura. */
  retencionEur: number | null;
  /** Solo en la primera fila de cada factura. */
  totalEur: number | null;
  moneda: string;
  /** Solo si la moneda no es EUR, y en la primera fila. */
  totalMonedaOriginal: number | null;
  tipoCambio: number | null;
  tipoCambioFecha: string | null;
  estado: string;
  avisos: string;
  archivoOriginal: string;
};

/** Redondea a 2 decimales evitando errores de coma flotante (1.005 -> 1.01). */
export function redondear2(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

function esEuro(f: FacturaExportable): boolean {
  return f.moneda.toUpperCase() === "EUR";
}

/** Pasa un importe en moneda original a euros, o null si falta el tipo de cambio. */
export function aEuros(importe: number | null, f: FacturaExportable): number | null {
  if (importe === null) return null;
  if (esEuro(f)) return redondear2(importe);
  if (!f.tipoCambio || f.tipoCambio <= 0) return null;
  return redondear2(importe / f.tipoCambio);
}

/** Avisos de una factura, en el orden en que se muestran. */
export function avisosDe(f: FacturaExportable): string[] {
  const avisos: string[] = [];
  if (!f.receptorNif) avisos.push("Sin NIF del receptor");
  if (!f.emisorNif) avisos.push("Sin NIF del emisor");
  if (f.posibleDuplicado) avisos.push("Posible duplicado");
  if (!esEuro(f) && (!f.tipoCambio || f.totalEur === null)) avisos.push("Conversión pendiente");
  return avisos;
}

function quitarAcentos(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/**
 * Nombre del original dentro del paquete del cierre de trimestre:
 * <Nº de orden>_<fecha>_<emisor>.<extensión>, por ejemplo
 * 003_2026-03-07_ES-Villaquejida-Sutecal.jpg.
 */
export function nombreArchivoOriginal(
  orden: number,
  fecha: string | null,
  emisor: string | null,
  nombreSubido: string,
): string {
  const punto = nombreSubido.lastIndexOf(".");
  const extension = punto > 0 ? nombreSubido.slice(punto + 1).toLowerCase() : "bin";
  const emisorLimpio =
    quitarAcentos(emisor ?? "sin-emisor")
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "sin-emisor";
  const numero = String(orden).padStart(3, "0");
  return `${numero}_${fecha ?? "sin-fecha"}_${emisorLimpio}.${extension}`;
}

/** Orden estable: por fecha, después por emisor y por id. Las facturas sin fecha, al final. */
function compararFacturas(a: FacturaExportable, b: FacturaExportable): number {
  const fa = a.fecha ?? "9999-99-99";
  const fb = b.fecha ?? "9999-99-99";
  if (fa !== fb) return fa < fb ? -1 : 1;
  const ea = (a.emisorNombre ?? "").toLowerCase();
  const eb = (b.emisorNombre ?? "").toLowerCase();
  if (ea !== eb) return ea < eb ? -1 : 1;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/** Filas de la hoja "Gastos": una por cada tipo de IVA de cada factura. */
export function filasGastos(facturas: FacturaExportable[]): FilaGasto[] {
  const ordenadas = [...facturas].sort(compararFacturas);
  const filas: FilaGasto[] = [];

  ordenadas.forEach((f, indice) => {
    const orden = indice + 1;
    const lineas: (LineaIva | null)[] = f.lineas.length > 0 ? f.lineas : [null];
    const avisos = avisosDe(f).join("; ");
    const archivo = nombreArchivoOriginal(orden, f.fecha, f.emisorNombre, f.nombreArchivo);
    const euro = esEuro(f);
    const totalEur = euro ? (f.total === null ? null : redondear2(f.total)) : f.totalEur;

    lineas.forEach((linea, i) => {
      const primera = i === 0;
      filas.push({
        orden,
        fecha: f.fecha,
        tipoDocumento: f.tipoDocumento === "factura" ? "Factura" : "Ticket",
        numero: f.numero,
        emisor: f.emisorNombre,
        emisorNif: f.emisorNif,
        receptorNif: f.receptorNif,
        categoria: f.categoria,
        tipoIva: linea ? linea.tipoIva : null,
        baseEur: linea ? aEuros(linea.base, f) : null,
        cuotaEur: linea ? aEuros(linea.cuota, f) : null,
        retencionEur: primera ? aEuros(f.retencionImporte, f) : null,
        totalEur: primera ? totalEur : null,
        moneda: f.moneda.toUpperCase(),
        totalMonedaOriginal: primera && !euro ? f.total : null,
        tipoCambio: euro ? null : f.tipoCambio,
        tipoCambioFecha: euro ? null : f.tipoCambioFecha,
        estado: f.estadoRevision === "revisada" ? "Revisada" : "Pendiente de revisar",
        avisos,
        archivoOriginal: archivo,
      });
    });
  });

  return filas;
}

// ---------------------------------------------------------------------------
// Periodo y resumen
// ---------------------------------------------------------------------------

function dosCifras(n: number): string {
  return String(n).padStart(2, "0");
}

function ultimoDiaDelMes(anio: number, mes: number): number {
  return new Date(Date.UTC(anio, mes, 0)).getUTCDate();
}

/** Primer y último día del periodo, AAAA-MM-DD, ambos incluidos. */
export function rangoDelPeriodo(p: Periodo): { desde: string; hasta: string } {
  if (p.tipo === "anio") return { desde: `${p.anio}-01-01`, hasta: `${p.anio}-12-31` };
  if (p.tipo === "mes") {
    return {
      desde: `${p.anio}-${dosCifras(p.mes)}-01`,
      hasta: `${p.anio}-${dosCifras(p.mes)}-${dosCifras(ultimoDiaDelMes(p.anio, p.mes))}`,
    };
  }
  const mesInicio = (p.trimestre - 1) * 3 + 1;
  const mesFin = mesInicio + 2;
  return {
    desde: `${p.anio}-${dosCifras(mesInicio)}-01`,
    hasta: `${p.anio}-${dosCifras(mesFin)}-${dosCifras(ultimoDiaDelMes(p.anio, mesFin))}`,
  };
}

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function etiquetaDelPeriodo(p: Periodo): string {
  if (p.tipo === "anio") return `Año ${p.anio}`;
  if (p.tipo === "mes") return `${MESES[p.mes - 1]} de ${p.anio}`.replace(/^./, (c) => c.toUpperCase());
  return `${p.trimestre}.º trimestre de ${p.anio}`;
}

/** Nombre del archivo: Ticketon_gastos_2026-T4.xlsx, Ticketon_gastos_2026-10.xlsx o Ticketon_gastos_2026.xlsx. */
export function nombreDelExcel(p: Periodo): string {
  if (p.tipo === "anio") return `Ticketon_gastos_${p.anio}.xlsx`;
  if (p.tipo === "mes") return `Ticketon_gastos_${p.anio}-${dosCifras(p.mes)}.xlsx`;
  return `Ticketon_gastos_${p.anio}-T${p.trimestre}.xlsx`;
}

/**
 * Separa las facturas del periodo. Las que no tienen fecha no se pueden asignar
 * a ningún periodo: se devuelven aparte para avisar en la pantalla de exportación.
 */
export function filtrarPorPeriodo(
  facturas: FacturaExportable[],
  p: Periodo,
): { incluidas: FacturaExportable[]; sinFecha: FacturaExportable[] } {
  const { desde, hasta } = rangoDelPeriodo(p);
  const incluidas: FacturaExportable[] = [];
  const sinFecha: FacturaExportable[] = [];
  for (const f of facturas) {
    if (!f.fecha) sinFecha.push(f);
    else if (f.fecha >= desde && f.fecha <= hasta) incluidas.push(f);
  }
  return { incluidas, sinFecha };
}

export type ResumenExportacion = {
  documentos: number;
  conAvisos: number;
  pendientesDeRevisar: number;
  /** Bases y cuotas en euros por tipo de IVA, de mayor a menor tipo. */
  porTipoIva: { tipoIva: number; base: number; cuota: number }[];
  /** Suma de los totales en euros. Las facturas con conversión pendiente no suman. */
  totalEur: number;
  /** Facturas que no suman al total porque falta el tipo de cambio. */
  conversionesPendientes: number;
};

export function resumenDe(facturas: FacturaExportable[]): ResumenExportacion {
  const filas = filasGastos(facturas);
  const porTipo = new Map<number, { base: number; cuota: number }>();
  for (const fila of filas) {
    if (fila.tipoIva === null || fila.baseEur === null || fila.cuotaEur === null) continue;
    const acumulado = porTipo.get(fila.tipoIva) ?? { base: 0, cuota: 0 };
    acumulado.base += fila.baseEur;
    acumulado.cuota += fila.cuotaEur;
    porTipo.set(fila.tipoIva, acumulado);
  }
  const totalEur = filas.reduce((suma, fila) => suma + (fila.totalEur ?? 0), 0);
  return {
    documentos: facturas.length,
    conAvisos: facturas.filter((f) => avisosDe(f).length > 0).length,
    pendientesDeRevisar: facturas.filter((f) => f.estadoRevision === "pendiente").length,
    porTipoIva: [...porTipo.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([tipoIva, v]) => ({ tipoIva, base: redondear2(v.base), cuota: redondear2(v.cuota) })),
    totalEur: redondear2(totalEur),
    conversionesPendientes: facturas.filter((f) => !esEuro(f) && f.totalEur === null).length,
  };
}

// ---------------------------------------------------------------------------
// Generación del .xlsx
// ---------------------------------------------------------------------------

type Celda =
  | { tipo: "texto"; valor: string; estilo?: number }
  | { tipo: "numero"; valor: number; estilo?: number }
  | { tipo: "fecha"; valor: string }
  | { tipo: "vacia" };

// Índices de estilo definidos en estilosXml().
const ESTILO_TITULO = 1;
const ESTILO_FECHA = 2;
const ESTILO_IMPORTE = 3;
const ESTILO_NEGRITA = 4;
const ESTILO_CAMBIO = 5;
const ESTILO_CURSIVA = 6;

function texto(valor: string | null, estilo?: number): Celda {
  return valor === null || valor === "" ? { tipo: "vacia" } : { tipo: "texto", valor, estilo };
}

function numero(valor: number | null, estilo?: number): Celda {
  return valor === null ? { tipo: "vacia" } : { tipo: "numero", valor, estilo };
}

function fecha(valor: string | null): Celda {
  return valor === null ? { tipo: "vacia" } : { tipo: "fecha", valor };
}

function escaparXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    // Caracteres de control no válidos en XML 1.0.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

function letraColumna(indice: number): string {
  let n = indice + 1;
  let letras = "";
  while (n > 0) {
    const resto = (n - 1) % 26;
    letras = String.fromCharCode(65 + resto) + letras;
    n = Math.floor((n - 1) / 26);
  }
  return letras;
}

/** Fecha AAAA-MM-DD a número de serie de Excel (días desde 30/12/1899). */
export function serieExcel(fechaIso: string): number {
  const [a, m, d] = fechaIso.split("-").map(Number);
  return Math.round((Date.UTC(a, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000);
}

function celdaXml(celda: Celda, ref: string): string {
  switch (celda.tipo) {
    case "vacia":
      return "";
    case "texto": {
      const s = celda.estilo ? ` s="${celda.estilo}"` : "";
      return `<c r="${ref}" t="inlineStr"${s}><is><t xml:space="preserve">${escaparXml(celda.valor)}</t></is></c>`;
    }
    case "numero": {
      const s = celda.estilo ? ` s="${celda.estilo}"` : "";
      return `<c r="${ref}"${s}><v>${celda.valor}</v></c>`;
    }
    case "fecha":
      return `<c r="${ref}" s="${ESTILO_FECHA}"><v>${serieExcel(celda.valor)}</v></c>`;
  }
}

function hojaXml(filas: Celda[][], anchos: number[], opciones: { congelarTitulos: boolean; filtro: boolean }): string {
  const ultimaColumna = letraColumna(Math.max(0, anchos.length - 1));
  const vista = opciones.congelarTitulos
    ? `<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>`
    : `<sheetViews><sheetView workbookViewId="0"/></sheetViews>`;
  const columnas = `<cols>${anchos
    .map((ancho, i) => `<col min="${i + 1}" max="${i + 1}" width="${ancho}" customWidth="1"/>`)
    .join("")}</cols>`;
  const datos = filas
    .map((fila, i) => {
      const celdas = fila.map((c, j) => celdaXml(c, `${letraColumna(j)}${i + 1}`)).join("");
      return `<row r="${i + 1}">${celdas}</row>`;
    })
    .join("");
  const filtro = opciones.filtro && filas.length > 0 ? `<autoFilter ref="A1:${ultimaColumna}${filas.length}"/>` : "";
  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `${vista}${columnas}<sheetData>${datos}</sheetData>${filtro}</worksheet>`
  );
}

function estilosXml(): string {
  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<numFmts count="3">` +
    `<numFmt numFmtId="164" formatCode="dd/mm/yyyy"/>` +
    `<numFmt numFmtId="165" formatCode="#,##0.00"/>` +
    `<numFmt numFmtId="166" formatCode="0.0000"/>` +
    `</numFmts>` +
    `<fonts count="4">` +
    `<font><sz val="11"/><name val="Calibri"/></font>` +
    `<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>` +
    `<font><b/><sz val="11"/><name val="Calibri"/></font>` +
    `<font><i/><sz val="11"/><name val="Calibri"/></font>` +
    `</fonts>` +
    `<fills count="3">` +
    `<fill><patternFill patternType="none"/></fill>` +
    `<fill><patternFill patternType="gray125"/></fill>` +
    `<fill><patternFill patternType="solid"><fgColor rgb="FF2457A7"/><bgColor indexed="64"/></patternFill></fill>` +
    `</fills>` +
    `<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>` +
    `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
    `<cellXfs count="7">` +
    `<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>` +
    `<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment wrapText="1" vertical="center"/></xf>` +
    `<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>` +
    `<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>` +
    `<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>` +
    `<xf numFmtId="166" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>` +
    `<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"/>` +
    `</cellXfs>` +
    `<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>` +
    `</styleSheet>`
  );
}

function hojaGastos(filas: FilaGasto[]): string {
  const titulos: Celda[] = COLUMNAS_GASTOS.map((t) => texto(t, ESTILO_TITULO));
  const datos: Celda[][] = filas.map((f) => [
    numero(f.orden),
    fecha(f.fecha),
    texto(f.tipoDocumento),
    texto(f.numero),
    texto(f.emisor),
    texto(f.emisorNif),
    texto(f.receptorNif),
    texto(f.categoria),
    numero(f.tipoIva),
    numero(f.baseEur, ESTILO_IMPORTE),
    numero(f.cuotaEur, ESTILO_IMPORTE),
    numero(f.retencionEur, ESTILO_IMPORTE),
    numero(f.totalEur, ESTILO_IMPORTE),
    texto(f.moneda),
    numero(f.totalMonedaOriginal, ESTILO_IMPORTE),
    numero(f.tipoCambio, ESTILO_CAMBIO),
    fecha(f.tipoCambioFecha),
    texto(f.estado),
    texto(f.avisos),
    texto(f.archivoOriginal),
  ]);
  const anchos = [9, 11, 11, 22, 30, 14, 14, 22, 9, 12, 11, 11, 12, 9, 12, 10, 12, 18, 34, 40];
  return hojaXml([titulos, ...datos], anchos, { congelarTitulos: true, filtro: true });
}

function hojaResumen(r: ResumenExportacion, op: OpcionesExportacion): string {
  const filas: Celda[][] = [
    [texto("Exportación de gastos para la gestoría", ESTILO_NEGRITA)],
    [],
    [texto("Periodo", ESTILO_NEGRITA), texto(etiquetaDelPeriodo(op.periodo))],
    [texto("Fecha de exportación", ESTILO_NEGRITA), fecha(op.fechaExportacion)],
    [texto("Titular de la cuenta", ESTILO_NEGRITA), texto(op.titular)],
    [texto("Número de documentos", ESTILO_NEGRITA), numero(r.documentos)],
    [texto("Documentos con avisos", ESTILO_NEGRITA), numero(r.conAvisos)],
    [texto("Documentos pendientes de revisar", ESTILO_NEGRITA), numero(r.pendientesDeRevisar)],
    [],
    [texto("Tipo de IVA (%)", ESTILO_TITULO), texto("Suma de bases (€)", ESTILO_TITULO), texto("Suma de cuotas (€)", ESTILO_TITULO)],
    ...r.porTipoIva.map((t) => [numero(t.tipoIva), numero(t.base, ESTILO_IMPORTE), numero(t.cuota, ESTILO_IMPORTE)]),
    [],
    [texto("Total de gastos del periodo (€)", ESTILO_NEGRITA), numero(r.totalEur, ESTILO_IMPORTE)],
  ];
  if (r.conversionesPendientes > 0) {
    filas.push([
      texto(
        `${r.conversionesPendientes} documento(s) en otra moneda sin tipo de cambio no suman al total.`,
        ESTILO_CURSIVA,
      ),
    ]);
  }
  filas.push([], [texto("Ticketon ordena los justificantes. Qué gastos son deducibles lo decide la gestoría.", ESTILO_CURSIVA)]);
  return hojaXml(filas, [34, 50, 18], { congelarTitulos: false, filtro: false });
}

/**
 * Genera el Excel del periodo. Recibe todas las facturas del usuario y se
 * queda solo con las del periodo; las que no tienen fecha no se incluyen
 * (usar filtrarPorPeriodo() para avisar de ellas en la pantalla).
 */
export function generarExcel(
  facturas: FacturaExportable[],
  opciones: OpcionesExportacion,
): { nombre: string; contenido: Uint8Array; resumen: ResumenExportacion } {
  const { incluidas } = filtrarPorPeriodo(facturas, opciones.periodo);
  const filas = filasGastos(incluidas);
  const resumen = resumenDe(incluidas);

  const archivos: { nombre: string; texto: string }[] = [
    {
      nombre: "[Content_Types].xml",
      texto:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
        `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
        `<Default Extension="xml" ContentType="application/xml"/>` +
        `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
        `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
        `<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
        `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
        `</Types>`,
    },
    {
      nombre: "_rels/.rels",
      texto:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
        `</Relationships>`,
    },
    {
      nombre: "xl/workbook.xml",
      texto:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
        `<sheets><sheet name="Gastos" sheetId="1" r:id="rId1"/><sheet name="Resumen" sheetId="2" r:id="rId2"/></sheets>` +
        (filas.length > 0
          ? `<definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">Gastos!$A$1:$${letraColumna(COLUMNAS_GASTOS.length - 1)}$${filas.length + 1}</definedName></definedNames>`
          : "") +
        `</workbook>`,
    },
    {
      nombre: "xl/_rels/workbook.xml.rels",
      texto:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
        `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>` +
        `<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
        `</Relationships>`,
    },
    { nombre: "xl/styles.xml", texto: estilosXml() },
    { nombre: "xl/worksheets/sheet1.xml", texto: hojaGastos(filas) },
    { nombre: "xl/worksheets/sheet2.xml", texto: hojaResumen(resumen, opciones) },
  ];

  const codificador = new TextEncoder();
  const contenido = crearZip(archivos.map((a) => ({ nombre: a.nombre, datos: codificador.encode(a.texto) })));
  return { nombre: nombreDelExcel(opciones.periodo), contenido, resumen };
}

// ---------------------------------------------------------------------------
// ZIP mínimo (sin compresión), suficiente para un .xlsx
// ---------------------------------------------------------------------------

const TABLA_CRC = (() => {
  const tabla = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    tabla[n] = c >>> 0;
  }
  return tabla;
})();

export function crc32(datos: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < datos.length; i++) c = TABLA_CRC[(c ^ datos[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Crea un ZIP con los archivos sin comprimir (método "store"). */
export function crearZip(archivos: { nombre: string; datos: Uint8Array }[]): Uint8Array {
  const codificador = new TextEncoder();
  const partes: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let desplazamiento = 0;
  // Fecha fija (1/1/2026 00:00) para que el mismo contenido dé el mismo archivo.
  const horaDos = 0;
  const fechaDos = ((2026 - 1980) << 9) | (1 << 5) | 1;

  for (const archivo of archivos) {
    const nombre = codificador.encode(archivo.nombre);
    const crc = crc32(archivo.datos);
    const tam = archivo.datos.length;

    const local = new Uint8Array(30 + nombre.length);
    const vl = new DataView(local.buffer);
    vl.setUint32(0, 0x04034b50, true);
    vl.setUint16(4, 20, true);
    vl.setUint16(6, 0x0800, true); // nombres en UTF-8
    vl.setUint16(8, 0, true); // sin compresión
    vl.setUint16(10, horaDos, true);
    vl.setUint16(12, fechaDos, true);
    vl.setUint32(14, crc, true);
    vl.setUint32(18, tam, true);
    vl.setUint32(22, tam, true);
    vl.setUint16(26, nombre.length, true);
    vl.setUint16(28, 0, true);
    local.set(nombre, 30);
    partes.push(local, archivo.datos);

    const cab = new Uint8Array(46 + nombre.length);
    const vc = new DataView(cab.buffer);
    vc.setUint32(0, 0x02014b50, true);
    vc.setUint16(4, 20, true);
    vc.setUint16(6, 20, true);
    vc.setUint16(8, 0x0800, true);
    vc.setUint16(10, 0, true);
    vc.setUint16(12, horaDos, true);
    vc.setUint16(14, fechaDos, true);
    vc.setUint32(16, crc, true);
    vc.setUint32(20, tam, true);
    vc.setUint32(24, tam, true);
    vc.setUint16(28, nombre.length, true);
    vc.setUint32(42, desplazamiento, true);
    cab.set(nombre, 46);
    central.push(cab);

    desplazamiento += local.length + tam;
  }

  const tamCentral = central.reduce((s, c) => s + c.length, 0);
  const fin = new Uint8Array(22);
  const vf = new DataView(fin.buffer);
  vf.setUint32(0, 0x06054b50, true);
  vf.setUint16(8, archivos.length, true);
  vf.setUint16(10, archivos.length, true);
  vf.setUint32(12, tamCentral, true);
  vf.setUint32(16, desplazamiento, true);

  const total = desplazamiento + tamCentral + fin.length;
  const zip = new Uint8Array(total);
  let pos = 0;
  for (const p of [...partes, ...central, fin]) {
    zip.set(p, pos);
    pos += p.length;
  }
  return zip;
}
