/**
 * Exportación en PDF del periodo, para la gestoría (propuesta del 04/11/2026).
 * Mismos datos que el Excel (lib/exportacion/excel.ts): un resumen del periodo
 * con el IVA por tipo y la lista de gastos, una fila por tipo de IVA.
 *
 * El PDF se escribe a mano, sin dependencias, igual que el Excel: A4 apaisado,
 * fuentes estándar Helvetica con codificación WinAnsi (acentos, ñ y €).
 */

import {
  etiquetaDelPeriodo,
  filasGastos,
  filtrarPorPeriodo,
  resumenDe,
  type FacturaExportable,
  type FilaGasto,
  type OpcionesExportacion,
  type Periodo,
} from "./excel.ts";

// ---------------------------------------------------------------------------
// Texto: codificación WinAnsi y anchos de Helvetica
// ---------------------------------------------------------------------------

// Anchos de Helvetica (1/1000 del tamaño) para los caracteres 32 a 126.
const ANCHOS_HELVETICA = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556,
  556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833,
  722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556,
  556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334,
  260, 334, 584,
];

// Caracteres de Windows-1252 fuera de Latin-1 que usamos.
const WIN_ANSI_EXTRA: Record<string, number> = {
  "€": 0x80,
  "‚": 0x82,
  "„": 0x84,
  "…": 0x85,
  "‘": 0x91,
  "’": 0x92,
  "“": 0x93,
  "”": 0x94,
  "•": 0x95,
  "–": 0x96,
  "—": 0x97,
};

/** Bytes WinAnsi de un texto. Lo que no cabe en WinAnsi sale como «?». */
export function aWinAnsi(texto: string): number[] {
  const bytes: number[] = [];
  for (const c of texto) {
    const code = c.codePointAt(0) ?? 63;
    if (WIN_ANSI_EXTRA[c] !== undefined) bytes.push(WIN_ANSI_EXTRA[c]);
    else if ((code >= 32 && code <= 126) || (code >= 0xa0 && code <= 0xff)) bytes.push(code);
    else if (code === 9) bytes.push(32);
    else bytes.push(63);
  }
  return bytes;
}

function anchoCaracter(c: string): number {
  const base = c.normalize("NFD")[0] ?? c;
  const code = base.codePointAt(0) ?? 63;
  if (code >= 32 && code <= 126) return ANCHOS_HELVETICA[code - 32];
  if (c === "€") return 556;
  if (c === "º" || c === "ª") return 370;
  return 556;
}

/** Ancho aproximado en puntos. La negrita es algo más ancha. */
export function anchoTexto(texto: string, tamano: number, negrita = false): number {
  let total = 0;
  for (const c of texto) total += anchoCaracter(c);
  return (total * tamano * (negrita ? 1.06 : 1)) / 1000;
}

/** Recorta el texto con «…» para que quepa en el ancho dado. */
export function recortar(texto: string, ancho: number, tamano: number, negrita = false): string {
  if (anchoTexto(texto, tamano, negrita) <= ancho) return texto;
  let corto = texto;
  while (corto.length > 0 && anchoTexto(corto + "…", tamano, negrita) > ancho) corto = corto.slice(0, -1);
  return corto.trimEnd() + "…";
}

function cadenaPdf(texto: string): string {
  let s = "(";
  for (const b of aWinAnsi(texto)) {
    if (b === 0x28 || b === 0x29 || b === 0x5c) s += "\\" + String.fromCharCode(b);
    else if (b < 32 || b > 126) s += "\\" + b.toString(8).padStart(3, "0");
    else s += String.fromCharCode(b);
  }
  return s + ")";
}

// ---------------------------------------------------------------------------
// Formatos
// ---------------------------------------------------------------------------

const euros = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true });
const pct = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 });

function importe(n: number | null): string {
  return n === null ? "" : euros.format(n);
}

function fechaCorta(iso: string | null): string {
  if (!iso) return "";
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}

export function nombreDelPdf(p: Periodo): string {
  const dos = (n: number) => String(n).padStart(2, "0");
  if (p.tipo === "anio") return `Ticketon_gastos_${p.anio}.pdf`;
  if (p.tipo === "mes") return `Ticketon_gastos_${p.anio}-${dos(p.mes)}.pdf`;
  return `Ticketon_gastos_${p.anio}-T${p.trimestre}.pdf`;
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

const ANCHO = 842;
const ALTO = 595;
const MARGEN = 36;
const AZUL = "0.141 0.341 0.655";
const TINTA = "0.090 0.125 0.165";
const GRIS = "0.322 0.376 0.427";
const LINEA = "0.847 0.871 0.902";
const FONDO_TITULO = "0.910 0.937 0.980";

class Pagina {
  ops: string[] = [];

  texto(x: number, y: number, texto: string, tamano: number, opciones: { negrita?: boolean; color?: string; derecha?: boolean } = {}) {
    if (!texto) return;
    const negrita = opciones.negrita ?? false;
    const xx = opciones.derecha ? x - anchoTexto(texto, tamano, negrita) : x;
    this.ops.push(`BT /${negrita ? "F2" : "F1"} ${tamano} Tf ${opciones.color ?? TINTA} rg ${xx.toFixed(2)} ${y.toFixed(2)} Td ${cadenaPdf(texto)} Tj ET`);
  }

  rect(x: number, y: number, ancho: number, alto: number, color: string) {
    this.ops.push(`${color} rg ${x.toFixed(2)} ${y.toFixed(2)} ${ancho.toFixed(2)} ${alto.toFixed(2)} re f`);
  }

  linea(x1: number, y1: number, x2: number, y2: number, color = LINEA, grosor = 0.6) {
    this.ops.push(`${color} RG ${grosor} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
  }
}

type Columna = { titulo: string; ancho: number; derecha?: boolean; valor: (f: FilaGasto) => string };

const COLUMNAS: Columna[] = [
  { titulo: "Nº", ancho: 24, valor: (f) => String(f.orden) },
  { titulo: "Fecha", ancho: 52, valor: (f) => fechaCorta(f.fecha) },
  { titulo: "Tipo", ancho: 42, valor: (f) => f.tipoDocumento },
  { titulo: "Emisor", ancho: 128, valor: (f) => f.emisor ?? "" },
  { titulo: "NIF emisor", ancho: 64, valor: (f) => f.emisorNif ?? "" },
  { titulo: "Categoría", ancho: 94, valor: (f) => f.categoria ?? "" },
  { titulo: "IVA %", ancho: 32, derecha: true, valor: (f) => (f.tipoIva === null ? "" : pct.format(f.tipoIva)) },
  { titulo: "Base €", ancho: 56, derecha: true, valor: (f) => importe(f.baseEur) },
  { titulo: "Cuota €", ancho: 52, derecha: true, valor: (f) => importe(f.cuotaEur) },
  { titulo: "Total €", ancho: 62, derecha: true, valor: (f) => importe(f.totalEur) },
  { titulo: "Estado", ancho: 64, valor: (f) => (f.estado === "Revisada" ? "Revisada" : "Pendiente") },
  { titulo: "Avisos", ancho: 0, valor: (f) => f.avisos },
];
// La última columna ocupa lo que queda.
COLUMNAS[COLUMNAS.length - 1].ancho = ANCHO - 2 * MARGEN - COLUMNAS.slice(0, -1).reduce((s, c) => s + c.ancho, 0);

const TAM = 8;
const FILA = 15;

function cabeceraTabla(p: Pagina, y: number): number {
  p.rect(MARGEN, y - 5, ANCHO - 2 * MARGEN, FILA + 2, FONDO_TITULO);
  let x = MARGEN;
  for (const c of COLUMNAS) {
    p.texto(c.derecha ? x + c.ancho - 6 : x + 4, y, c.titulo, TAM, { negrita: true, color: AZUL, derecha: c.derecha });
    x += c.ancho;
  }
  return y - FILA - 2;
}

function filaTabla(p: Pagina, y: number, f: FilaGasto, primeraDeFactura: boolean) {
  if (primeraDeFactura) p.linea(MARGEN, y + FILA - 4, ANCHO - MARGEN, y + FILA - 4);
  let x = MARGEN;
  for (const c of COLUMNAS) {
    const v = recortar(c.valor(f), c.ancho - 10, TAM);
    p.texto(c.derecha ? x + c.ancho - 6 : x + 4, y, v, TAM, { derecha: c.derecha, color: c.titulo === "Avisos" ? GRIS : TINTA });
    x += c.ancho;
  }
}

// ---------------------------------------------------------------------------
// Documento
// ---------------------------------------------------------------------------

function paginas(facturas: FacturaExportable[], op: OpcionesExportacion): Pagina[] {
  const { incluidas } = filtrarPorPeriodo(facturas, op.periodo);
  const filas = filasGastos(incluidas);
  const r = resumenDe(incluidas);
  const lista: Pagina[] = [];

  // Página 1: resumen.
  const p1 = new Pagina();
  lista.push(p1);
  let y = ALTO - MARGEN - 18;
  p1.texto(MARGEN, y, "Ticketon", 11, { negrita: true, color: AZUL });
  y -= 30;
  p1.texto(MARGEN, y, "Gastos para la gestoría", 22, { negrita: true });
  y -= 22;
  p1.texto(MARGEN, y, etiquetaDelPeriodo(op.periodo), 13, { color: GRIS });
  y -= 34;

  const datos: [string, string][] = [
    ["Titular de la cuenta", op.titular],
    ["Fecha de exportación", fechaCorta(op.fechaExportacion)],
    ["Número de documentos", String(r.documentos)],
    ["Pendientes de revisar", String(r.pendientesDeRevisar)],
    ["Documentos con avisos", String(r.conAvisos)],
  ];
  for (const [k, v] of datos) {
    p1.texto(MARGEN, y, k, 10, { color: GRIS });
    p1.texto(MARGEN + 150, y, recortar(v, 300, 10, true), 10, { negrita: true });
    y -= 17;
  }

  // Total del periodo, destacado a la derecha.
  const caja = { x: ANCHO - MARGEN - 260, y: ALTO - MARGEN - 150, ancho: 260, alto: 86 };
  p1.rect(caja.x, caja.y, caja.ancho, caja.alto, FONDO_TITULO);
  p1.texto(caja.x + 18, caja.y + caja.alto - 26, "Total de gastos del periodo", 10, { color: AZUL, negrita: true });
  p1.texto(caja.x + 18, caja.y + 22, `${importe(r.totalEur)} €`, 24, { negrita: true });

  // IVA por tipo.
  y -= 18;
  p1.texto(MARGEN, y, "IVA por tipo", 12, { negrita: true });
  y -= 22;
  const cols = [MARGEN, MARGEN + 120, MARGEN + 260];
  p1.rect(MARGEN, y - 5, 400, 17, FONDO_TITULO);
  p1.texto(cols[0] + 4, y, "Tipo de IVA", 9, { negrita: true, color: AZUL });
  p1.texto(cols[1] + 130, y, "Bases €", 9, { negrita: true, color: AZUL, derecha: true });
  p1.texto(cols[2] + 136, y, "Cuotas €", 9, { negrita: true, color: AZUL, derecha: true });
  y -= 18;
  for (const t of r.porTipoIva) {
    p1.texto(cols[0] + 4, y, `${pct.format(t.tipoIva)} %`, 9);
    p1.texto(cols[1] + 130, y, importe(t.base), 9, { derecha: true });
    p1.texto(cols[2] + 136, y, importe(t.cuota), 9, { derecha: true });
    p1.linea(MARGEN, y - 5, MARGEN + 400, y - 5);
    y -= 16;
  }
  if (r.porTipoIva.length === 0) {
    p1.texto(cols[0] + 4, y, "No hay gastos en este periodo.", 9, { color: GRIS });
    y -= 16;
  }
  y -= 12;
  if (r.conversionesPendientes > 0) {
    p1.texto(MARGEN, y, `${r.conversionesPendientes} documento(s) en otra moneda sin tipo de cambio no suman al total.`, 9, { color: GRIS });
    y -= 14;
  }
  p1.texto(MARGEN, y, "Ticketon ordena los justificantes. Qué gastos son deducibles lo decide la gestoría.", 9, { color: GRIS });

  // Lista de gastos: en la página 1 si cabe una parte, si no en las siguientes.
  if (filas.length > 0) {
    let p = new Pagina();
    lista.push(p);
    y = ALTO - MARGEN - 18;
    p.texto(MARGEN, y, `Gastos · ${etiquetaDelPeriodo(op.periodo)}`, 13, { negrita: true });
    y -= 26;
    y = cabeceraTabla(p, y);
    let ordenAnterior = -1;
    for (const f of filas) {
      if (y < MARGEN + 30) {
        p = new Pagina();
        lista.push(p);
        y = cabeceraTabla(p, ALTO - MARGEN - 18);
      }
      filaTabla(p, y, f, f.orden !== ordenAnterior);
      ordenAnterior = f.orden;
      y -= FILA;
    }
  }

  // Pie de cada página.
  lista.forEach((p, i) => {
    p.linea(MARGEN, MARGEN + 2, ANCHO - MARGEN, MARGEN + 2);
    p.texto(MARGEN, MARGEN - 12, `Ticketon · ${etiquetaDelPeriodo(op.periodo)} · ${op.titular}`, 8, { color: GRIS });
    p.texto(ANCHO - MARGEN, MARGEN - 12, `Página ${i + 1} de ${lista.length}`, 8, { color: GRIS, derecha: true });
  });
  return lista;
}

function bytesDe(texto: string): number[] {
  // El PDF se escribe en ASCII: los textos ya van escapados en octal.
  const b: number[] = [];
  for (let i = 0; i < texto.length; i++) b.push(texto.charCodeAt(i) & 0xff);
  return b;
}

/** Genera el PDF del periodo. Mismo criterio que generarExcel(): solo las facturas con fecha dentro del periodo. */
export function generarPdf(facturas: FacturaExportable[], opciones: OpcionesExportacion): { nombre: string; contenido: Uint8Array } {
  const hojas = paginas(facturas, opciones);
  const objetos: string[] = [];
  const fuente = (nombre: string) => `<< /Type /Font /Subtype /Type1 /BaseFont /${nombre} /Encoding /WinAnsiEncoding >>`;

  // 1 catálogo, 2 páginas, 3 y 4 fuentes, 5 información; después página y contenido de cada hoja.
  const idsPaginas = hojas.map((_, i) => 6 + i * 2);
  objetos[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objetos[2] = `<< /Type /Pages /Kids [${idsPaginas.map((id) => `${id} 0 R`).join(" ")}] /Count ${hojas.length} >>`;
  objetos[3] = fuente("Helvetica");
  objetos[4] = fuente("Helvetica-Bold");
  objetos[5] = `<< /Title ${cadenaPdf(`Gastos para la gestoría · ${etiquetaDelPeriodo(opciones.periodo)}`)} /Producer (Ticketon) >>`;
  hojas.forEach((h, i) => {
    const contenido = h.ops.join("\n");
    objetos[6 + i * 2] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${ANCHO} ${ALTO}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${7 + i * 2} 0 R >>`;
    objetos[7 + i * 2] = `<< /Length ${contenido.length} >>\nstream\n${contenido}\nendstream`;
  });

  let pdf = "%PDF-1.4\n%âãÏÓ\n";
  const posiciones: number[] = [];
  for (let id = 1; id < objetos.length; id++) {
    posiciones[id] = pdf.length;
    pdf += `${id} 0 obj\n${objetos[id]}\nendobj\n`;
  }
  const inicioXref = pdf.length;
  pdf += `xref\n0 ${objetos.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objetos.length; id++) pdf += `${String(posiciones[id]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objetos.length} /Root 1 0 R /Info 5 0 R >>\nstartxref\n${inicioXref}\n%%EOF\n`;

  return { nombre: nombreDelPdf(opciones.periodo), contenido: new Uint8Array(bytesDe(pdf)) };
}

