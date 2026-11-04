/**
 * Subir un ZIP con varios tickets y facturas (propuesta del 04/11/2026).
 * Se abre en el navegador y cada archivo de dentro se sube como si se hubiera
 * elegido suelto: mismas comprobaciones de formato y tamaño (archivos.ts).
 *
 * Lector de ZIP mínimo, sin dependencias: lee el directorio central, admite
 * archivos sin comprimir (método 0) y comprimidos con deflate (método 8,
 * con DecompressionStream). No admite ZIP cifrados ni ZIP64.
 */

import { FORMATOS, TAMANO_MAXIMO_MB } from "./archivos.ts";

/** Como mucho, estos archivos por ZIP (cada uno gasta una lectura del plan). */
export const MAXIMO_ARCHIVOS_ZIP = 50;
const MAXIMO_BYTES = TAMANO_MAXIMO_MB * 1024 * 1024;

export type ResultadoZip = {
  archivos: File[];
  /** Archivos de dentro que no se suben, con el motivo, en lenguaje del usuario. */
  omitidos: { nombre: string; motivo: string }[];
};

export function esZip(archivo: { name: string; type: string }): boolean {
  const tipo = archivo.type.toLowerCase();
  return tipo === "application/zip" || tipo === "application/x-zip-compressed" || archivo.name.toLowerCase().endsWith(".zip");
}

function tipoPorExtension(nombre: string): string | null {
  const ext = nombre.slice(nombre.lastIndexOf(".") + 1).toLowerCase();
  const formato = FORMATOS.find((f) => (f.extensiones as readonly string[]).includes(ext));
  return formato ? formato.tipo : null;
}

function nombreBase(ruta: string): string {
  return ruta.slice(ruta.lastIndexOf("/") + 1);
}

/** Descomprime deflate sin pasar de `maximo` bytes. Null si se pasa. */
async function inflar(datos: Uint8Array, maximo: number): Promise<Uint8Array | null> {
  const flujo = new Blob([datos as Uint8Array<ArrayBuffer>]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  const lector = flujo.getReader();
  const trozos: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await lector.read();
    if (done) break;
    total += value.length;
    if (total > maximo) {
      await lector.cancel();
      return null;
    }
    trozos.push(value);
  }
  const salida = new Uint8Array(total);
  let pos = 0;
  for (const t of trozos) {
    salida.set(t, pos);
    pos += t.length;
  }
  return salida;
}

/** Abre el ZIP y devuelve sus tickets y facturas como archivos sueltos. Lanza un error si no es un ZIP válido. */
export async function archivosDelZip(zip: Blob): Promise<ResultadoZip> {
  const bytes = new Uint8Array(await zip.arrayBuffer());
  const vista = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const u16 = (p: number) => vista.getUint16(p, true);
  const u32 = (p: number) => vista.getUint32(p, true);

  // Fin del directorio central: firma 0x06054b50, buscada desde el final.
  let fin = -1;
  for (let p = bytes.length - 22; p >= Math.max(0, bytes.length - 22 - 65535); p--) {
    if (u32(p) === 0x06054b50) {
      fin = p;
      break;
    }
  }
  if (fin < 0) throw new Error("El archivo no es un ZIP válido.");
  const entradas = u16(fin + 10);
  let p = u32(fin + 16);
  if (entradas === 0xffff || p === 0xffffffff) throw new Error("Este ZIP es demasiado grande. Divídelo en varios.");

  const decodificador = new TextDecoder("utf-8");
  const resultado: ResultadoZip = { archivos: [], omitidos: [] };

  for (let i = 0; i < entradas; i++) {
    if (p + 46 > bytes.length || u32(p) !== 0x02014b50) throw new Error("El archivo no es un ZIP válido.");
    const banderas = u16(p + 8);
    const metodo = u16(p + 10);
    const tamComprimido = u32(p + 20);
    const tamReal = u32(p + 24);
    const largoNombre = u16(p + 28);
    const largoExtra = u16(p + 30);
    const largoComentario = u16(p + 32);
    const inicioLocal = u32(p + 42);
    const ruta = decodificador.decode(bytes.subarray(p + 46, p + 46 + largoNombre));
    p += 46 + largoNombre + largoExtra + largoComentario;

    const nombre = nombreBase(ruta);
    // Carpetas, restos de macOS y archivos ocultos: no se cuentan.
    if (ruta.endsWith("/") || ruta.startsWith("__MACOSX/") || ruta.includes("/__MACOSX/") || nombre.startsWith(".") || !nombre) continue;

    const tipo = tipoPorExtension(nombre);
    if (!tipo) {
      resultado.omitidos.push({ nombre, motivo: "formato no admitido" });
      continue;
    }
    if (banderas & 1) {
      resultado.omitidos.push({ nombre, motivo: "está protegido con contraseña" });
      continue;
    }
    if (tamReal > MAXIMO_BYTES) {
      resultado.omitidos.push({ nombre, motivo: `ocupa más de ${TAMANO_MAXIMO_MB} MB` });
      continue;
    }
    if (resultado.archivos.length >= MAXIMO_ARCHIVOS_ZIP) {
      resultado.omitidos.push({ nombre, motivo: `solo se suben ${MAXIMO_ARCHIVOS_ZIP} archivos por ZIP` });
      continue;
    }

    if (inicioLocal + 30 > bytes.length || u32(inicioLocal) !== 0x04034b50) throw new Error("El archivo no es un ZIP válido.");
    const inicioDatos = inicioLocal + 30 + u16(inicioLocal + 26) + u16(inicioLocal + 28);
    const comprimido = bytes.subarray(inicioDatos, inicioDatos + tamComprimido);

    let datos: Uint8Array | null;
    if (metodo === 0) datos = comprimido.length <= MAXIMO_BYTES ? comprimido.slice() : null;
    else if (metodo === 8) {
      try {
        datos = await inflar(comprimido, MAXIMO_BYTES);
      } catch {
        resultado.omitidos.push({ nombre, motivo: "no se ha podido descomprimir" });
        continue;
      }
    } else {
      resultado.omitidos.push({ nombre, motivo: "usa una compresión que no se admite" });
      continue;
    }
    if (!datos) {
      resultado.omitidos.push({ nombre, motivo: `ocupa más de ${TAMANO_MAXIMO_MB} MB` });
      continue;
    }
    resultado.archivos.push(new File([datos as Uint8Array<ArrayBuffer>], nombre, { type: tipo }));
  }
  return resultado;
}

/** Frase para la pantalla: cuántos archivos del ZIP se suben y cuáles no. */
export function resumenDelZip(nombreZip: string, subidos: number, omitidos: { nombre: string; motivo: string }[]): string {
  const suben = subidos === 0 ? `Del ZIP «${nombreZip}» no se sube ningún archivo.` : `Del ZIP «${nombreZip}» se ${subidos === 1 ? "sube 1 archivo" : `suben ${subidos} archivos`}.`;
  if (omitidos.length === 0) return suben;
  const lista = omitidos.slice(0, 5).map((o) => `${o.nombre} (${o.motivo})`).join(", ");
  const mas = omitidos.length > 5 ? ` y ${omitidos.length - 5} más` : "";
  return `${suben} ${omitidos.length === 1 ? "No se sube" : `No se suben ${omitidos.length}`}: ${lista}${mas}.`;
}
