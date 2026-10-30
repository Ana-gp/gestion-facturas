"use client";

// Pantallas P08 · Subir justificante y P09 · Subiendo y leyendo (#14 y #15).
// Las tres vías obligatorias juntas: foto con el móvil, arrastrar o elegir
// archivos desde el ordenador y reenvío por correo (#16, pendiente).

import { useMemo, useRef, useState, type DragEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./subir.module.css";
import { ACEPTA, TAMANO_MAXIMO_MB, tamanoLegible, validarArchivo } from "@/lib/subida/archivos";
import { huellaSha256, mensajeArchivoRepetido } from "@/lib/subida/huella";
import { serviciosDePrueba, type DocumentoEncontrado, type OrigenSubida, type UsoDelPlan } from "@/lib/subida/contrato";

type Props = {
  uso: UsoDelPlan;
  /** Dirección propia de reenvío (#16). Null mientras no esté configurada. */
  direccionCorreo: string | null;
  datosDeEjemplo?: boolean;
};

type Estado =
  | "comprobando"
  | "invalido"
  | "repetido"
  | "subiendo"
  | "leyendo"
  | "listo"
  | "error-subida"
  | "error-lectura"
  | "sin-lecturas";

type Elemento = {
  clave: string;
  archivo: File;
  origen: OrigenSubida;
  estado: Estado;
  mensaje?: string;
  documentoId?: string;
  facturaId?: string;
  repetido?: DocumentoEncontrado;
};

const PASOS: { estado: Estado; texto: string }[] = [
  { estado: "subiendo", texto: "Subiendo" },
  { estado: "leyendo", texto: "Original guardado · Leyendo con IA" },
  { estado: "listo", texto: "Listo" },
];

let contador = 0;

export default function Subir({ uso, direccionCorreo, datosDeEjemplo = false }: Props) {
  const router = useRouter();
  // [Pendiente] Cambiar por los servicios reales de #18 y #19 (mismo contrato).
  const servicios = useMemo(() => serviciosDePrueba(), []);
  const [elementos, setElementos] = useState<Elemento[]>([]);
  const [usados, setUsados] = useState(uso.usados);
  const [arrastrando, setArrastrando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const camara = useRef<HTMLInputElement>(null);
  const selector = useRef<HTMLInputElement>(null);
  const usadosRef = useRef(uso.usados);

  const sinLecturas = usados >= uso.limite;

  function cambiar(clave: string, cambio: Partial<Elemento>) {
    setElementos((lista) => lista.map((e) => (e.clave === clave ? { ...e, ...cambio } : e)));
  }

  async function leer(clave: string, documentoId: string, unico: boolean) {
    if (usadosRef.current >= uso.limite) {
      cambiar(clave, { estado: "sin-lecturas" });
      return;
    }
    cambiar(clave, { estado: "leyendo", mensaje: undefined });
    try {
      const resultado = await servicios.leerDocumento(documentoId);
      if (resultado.estado === "leido") {
        usadosRef.current += 1;
        setUsados(usadosRef.current);
        cambiar(clave, { estado: "listo", facturaId: resultado.facturaId });
        // Con un solo archivo, al terminar pasa sola a «Revisar y corregir».
        if (unico) router.push(`/revisar/${resultado.facturaId}`);
      } else if (resultado.estado === "sin-lecturas") {
        cambiar(clave, { estado: "sin-lecturas" });
      } else {
        cambiar(clave, { estado: "error-lectura", mensaje: resultado.mensaje });
      }
    } catch {
      cambiar(clave, { estado: "error-lectura" });
    }
  }

  async function procesar(elemento: Elemento, unico: boolean) {
    const { clave, archivo, origen } = elemento;
    const validacion = validarArchivo(archivo);
    if (!validacion.valido) {
      cambiar(clave, { estado: "invalido", mensaje: validacion.mensaje });
      return;
    }
    try {
      const huella = await huellaSha256(archivo);
      const repetido = await servicios.buscarPorHuella(huella);
      if (repetido) {
        // E4: el mismo archivo no se vuelve a subir ni gasta lectura.
        cambiar(clave, { estado: "repetido", repetido });
        return;
      }
      cambiar(clave, { estado: "subiendo" });
      const { documentoId } = await servicios.subirDocumento(archivo, huella, origen);
      cambiar(clave, { documentoId });
      await leer(clave, documentoId, unico);
    } catch {
      cambiar(clave, { estado: "error-subida" });
    }
  }

  async function anadir(lista: FileList | null, origen: OrigenSubida) {
    if (!lista || lista.length === 0) return;
    const nuevos: Elemento[] = [...lista].map((archivo) => ({ clave: `a${++contador}`, archivo, origen, estado: "comprobando" }));
    setElementos((actuales) => [...nuevos, ...actuales]);
    // De uno en uno, para que el contador del plan sea exacto.
    for (const e of nuevos) await procesar(e, nuevos.length === 1);
  }

  function soltar(e: DragEvent) {
    e.preventDefault();
    setArrastrando(false);
    void anadir(e.dataTransfer.files, "arrastrar");
  }

  async function copiar() {
    if (!direccionCorreo) return;
    try {
      await navigator.clipboard.writeText(direccionCorreo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  function reintentar(e: Elemento) {
    if (e.estado === "error-lectura" && e.documentoId) void leer(e.clave, e.documentoId, false);
    else void procesar(e, false);
  }

  return (
    <main className={styles.pagina}>
      <div className={styles.contenido}>
        {datosDeEjemplo && (
          <p className={styles.ejemplo}>
            Modo de prueba: los archivos no se guardan todavía y cualquier documento se lee como un ticket de ejemplo.
          </p>
        )}

        <header className={styles.cabecera}>
          <h1 className={styles.titulo}>Subir justificante</h1>
          <p className={styles.explicacion}>Añade el documento que quieres guardar y revisar.</p>
          <p className={styles.contadorPlan}>
            {usados} de {uso.limite} documentos este mes
          </p>
        </header>

        {sinLecturas && (
          <p className={styles.alerta} role="alert">
            Has usado tus {uso.limite} documentos de este mes. El original se guarda y se leerá cuando vuelvas a tener
            lecturas. <Link href="/precios">Ver planes</Link>
          </p>
        )}

        <section className={styles.vias} aria-label="Formas de subir un justificante">
          <div className={styles.foto}>
            <button type="button" className={styles.principal} onClick={() => camara.current?.click()}>
              Hacer foto
            </button>
            <p className={styles.ayuda}>Abre la cámara del móvil. Pon el ticket sobre una superficie lisa y con luz.</p>
            <input ref={camara} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { void anadir(e.target.files, "foto"); e.target.value = ""; }} />
          </div>

          <div
            className={`${styles.zona} ${arrastrando ? styles.zonaActiva : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setArrastrando(true);
            }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={soltar}
          >
            <p className={styles.zonaTexto}>
              <span className={styles.soloEscritorio}>Arrastra aquí tus archivos o selecciónalos desde tu equipo.</span>
              <span className={styles.soloMovil}>También puedes elegir una foto o un PDF que ya tengas.</span>
            </p>
            <button type="button" className={styles.secundaria} onClick={() => selector.current?.click()}>
              Elegir archivos
            </button>
            <p className={styles.ayuda}>
              PDF, JPG, PNG o HEIC. Hasta {TAMANO_MAXIMO_MB} MB por archivo. Puedes subir varios a la vez.
            </p>
            {/* Elegir desde el equipo cuenta como «arrastrar»: es la vía del ordenador (#15). */}
            <input ref={selector} type="file" accept={ACEPTA} multiple hidden onChange={(e) => { void anadir(e.target.files, "arrastrar"); e.target.value = ""; }} />
          </div>

          <div className={styles.correo}>
            <h2 className={styles.subtitulo}>Reenvía tus facturas por correo</h2>
            {direccionCorreo ? (
              <>
                <p className={styles.ayuda}>Reenvía las facturas que te llegan por email a tu dirección de Ticketon:</p>
                <div className={styles.direccion}>
                  <code>{direccionCorreo}</code>
                  <button type="button" className={styles.secundaria} onClick={copiar}>
                    {copiado ? "Copiada" : "Copiar"}
                  </button>
                </div>
                <Link href="/cuenta/correo">Configurar correos autorizados</Link>
              </>
            ) : (
              <p className={styles.ayuda}>
                Pronto tendrás una dirección propia para reenviar tus facturas y que entren solas.
              </p>
            )}
          </div>
        </section>

        {elementos.length > 0 && (
          <section className={styles.progreso} aria-labelledby="titulo-progreso">
            <h2 id="titulo-progreso" className={styles.subtitulo}>
              Subiendo y leyendo
            </h2>
            <ul className={styles.lista}>
              {elementos.map((e) => (
                <li key={e.clave} className={styles.elemento}>
                  <div className={styles.nombre}>
                    <span>{e.archivo.name}</span>
                    <span className={styles.peso}>{tamanoLegible(e.archivo.size)}</span>
                  </div>
                  <EstadoElemento elemento={e} onReintentar={() => reintentar(e)} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}

function EstadoElemento({ elemento: e, onReintentar }: { elemento: Elemento; onReintentar: () => void }) {
  if (e.estado === "comprobando") return <p className={styles.paso} role="status">Comprobando el archivo…</p>;
  if (e.estado === "invalido") return <p className={styles.error}>{e.mensaje}</p>;
  if (e.estado === "repetido" && e.repetido) {
    return (
      <p className={styles.aviso}>
        {mensajeArchivoRepetido(e.repetido)} No se ha vuelto a subir ni ha gastado lectura.{" "}
        <Link href={e.repetido.facturaId ? `/revisar/${e.repetido.facturaId}` : `/revisar/nuevo?documento=${e.repetido.documentoId}`}>
          Ver el documento
        </Link>
      </p>
    );
  }
  if (e.estado === "error-subida") {
    return (
      <p className={styles.error}>
        No se ha podido subir. <button type="button" className={styles.enlace} onClick={onReintentar}>Inténtalo de nuevo</button>
      </p>
    );
  }
  if (e.estado === "error-lectura") {
    return (
      <div className={styles.error}>
        <p>No hemos podido leer este documento. El original está guardado.</p>
        <div className={styles.acciones}>
          <button type="button" className={styles.secundaria} onClick={onReintentar}>
            Volver a leer
          </button>
          {/* Se pasa el documento para que la factura rellenada a mano quede enlazada a su original (requisito 6). */}
          <Link href={`/revisar/nuevo?documento=${e.documentoId}`}>Rellenar los datos a mano</Link>
        </div>
      </div>
    );
  }
  if (e.estado === "sin-lecturas") {
    return <p className={styles.aviso}>Original guardado. Se leerá cuando vuelvas a tener lecturas.</p>;
  }

  const actual = PASOS.findIndex((p) => p.estado === e.estado);
  return (
    <div className={styles.pasos}>
      <ol className={styles.barra} aria-label="Progreso">
        {PASOS.map((p, i) => (
          <li key={p.estado} className={i < actual || e.estado === "listo" ? styles.hecho : i === actual ? styles.enCurso : undefined}>
            {p.texto}
          </li>
        ))}
      </ol>
      <p className={styles.paso} role="status">
        {e.estado === "subiendo" && "Subiendo…"}
        {e.estado === "leyendo" && "Original guardado. Leyendo los datos con IA…"}
        {e.estado === "listo" && e.facturaId && (
          <>
            Listo. <Link href={`/revisar/${e.facturaId}`}>Revisar y corregir</Link>
          </>
        )}
      </p>
    </div>
  );
}
