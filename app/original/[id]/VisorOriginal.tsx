"use client";

// P12 · Original a pantalla completa (#18). Diseño unificado: fondo oscuro,
// «Volver», nombre del archivo, zoom, «Girar» y «Descargar original», y el
// pie «Original guardado tal como se subió · JPG · 296 KB · subido el …».

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./original.module.css";

type Props = {
  nombreArchivo: string;
  /** «Mercadona, S.A. · 09/10/2026 · 56,53 €», o null si aún no se ha leído. */
  resumen: string | null;
  url: string;
  urlDescarga: string;
  modo: "imagen" | "pdf" | "sin-vista";
  pie: string;
  volver: string;
  datosDeEjemplo?: boolean;
  /** Documento guardado que todavía no tiene factura (lectura pendiente o fallida): se ofrece leerlo con IA. */
  documentoSinLeer?: string | null;
};

const MIN = 25;
const MAX = 400;
const PASO = 25;

export default function VisorOriginal({ nombreArchivo, resumen, url, urlDescarga, modo, pie, volver, datosDeEjemplo = false, documentoSinLeer = null }: Props) {
  const router = useRouter();
  const [leyendo, setLeyendo] = useState(false);
  const [errorLectura, setErrorLectura] = useState<string | null>(null);

  // Lectura con IA de un documento que se quedó sin leer (#19). No gasta otra
  // lectura si ya se contó (reservar_lectura). Al terminar, abre Revisar.
  async function leer() {
    if (!documentoSinLeer) return;
    setLeyendo(true);
    setErrorLectura(null);
    try {
      const respuesta = await fetch("/api/leer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentoId: documentoSinLeer }),
      });
      const cuerpo = (await respuesta.json().catch(() => ({}))) as { estado?: string; facturaId?: string; mensaje?: string };
      if (cuerpo.estado === "leido" && cuerpo.facturaId) {
        router.push(`/revisar/${cuerpo.facturaId}`);
        return;
      }
      setErrorLectura(
        cuerpo.estado === "sin-lecturas"
          ? "Ya has usado todas las lecturas de tu plan este mes. El original sigue guardado."
          : (cuerpo.mensaje ?? "No hemos podido leer este documento. El original está guardado."),
      );
    } catch {
      setErrorLectura("No hay conexión. Inténtalo otra vez.");
    } finally {
      setLeyendo(false);
    }
  }
  const [zoom, setZoom] = useState(100);
  const [giro, setGiro] = useState(0);
  const conControles = modo === "imagen";
  const girado = giro % 180 !== 0;
  // Alto / ancho de la imagen (se mide al cargar).
  const [proporcion, setProporcion] = useState(0.75);
  // 100 % = el ancho de la pantalla, hasta 900 px.
  const ancho = `min(calc(${zoom}vw - 32px), ${zoom * 9}px)`;

  return (
    <div className={styles.pantalla}>
      <header className={styles.barra}>
        <Link href={volver} className={styles.volver}>
          ‹ Volver
        </Link>
        <div className={styles.titulos}>
          <h1 className={styles.nombre}>{nombreArchivo}</h1>
          {resumen && <p className={styles.resumen}>{resumen}</p>}
        </div>
        <div className={styles.acciones}>
          {conControles && (
            <>
              <button type="button" className={styles.boton} onClick={() => setZoom((z) => Math.max(MIN, z - PASO))} disabled={zoom <= MIN} aria-label="Reducir">
                −
              </button>
              <span className={styles.porcentaje} aria-live="polite">
                {zoom} %
              </span>
              <button type="button" className={styles.boton} onClick={() => setZoom((z) => Math.min(MAX, z + PASO))} disabled={zoom >= MAX} aria-label="Ampliar">
                +
              </button>
              <button type="button" className={styles.boton} onClick={() => setGiro((g) => (g + 90) % 360)}>
                Girar
              </button>
            </>
          )}
          {documentoSinLeer && (
            <button type="button" className={styles.leer} onClick={leer} disabled={leyendo}>
              {leyendo ? "Leyendo…" : "Leer con IA"}
            </button>
          )}
          <a href={urlDescarga} download={nombreArchivo} className={styles.descargar}>
            Descargar original
          </a>
        </div>
      </header>

      {documentoSinLeer && (
        <p className={errorLectura ? styles.avisoError : styles.aviso} role={errorLectura ? "alert" : "status"}>
          {errorLectura ?? "Este documento todavía no se ha leído. Pulsa «Leer con IA» para sacar sus datos y revisarlos."}
        </p>
      )}

      {datosDeEjemplo && <p className={styles.ejemplo}>Modo de prueba: es un documento de ejemplo, no uno tuyo.</p>}

      <main className={styles.lienzo}>
        {modo === "imagen" && (
          // El marco ocupa lo que ocupa la imagen ya girada; la imagen gira
          // sobre su centro dentro de él, así nunca se corta.
          <div
            className={styles.marco}
            style={{
              width: girado ? `calc(${ancho} * ${proporcion})` : ancho,
              height: girado ? ancho : `calc(${ancho} * ${proporcion})`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- el original se enseña tal cual se subió, sin optimizar */}
            <img
              src={url}
              alt={`Original del documento ${nombreArchivo}`}
              className={styles.imagen}
              style={{ width: ancho, height: `calc(${ancho} * ${proporcion})`, transform: `translate(-50%, -50%) rotate(${giro}deg)` }}
              onLoad={(e) => {
                const { naturalWidth, naturalHeight } = e.currentTarget;
                if (naturalWidth > 0) setProporcion(naturalHeight / naturalWidth);
              }}
            />
          </div>
        )}
        {modo === "pdf" && <iframe src={url} title={`Original: ${nombreArchivo}`} className={styles.pdf} />}
        {modo === "sin-vista" && (
          <div className={styles.sinVista}>
            <p>Este navegador no puede enseñar fotos HEIC. El original está guardado: descárgalo para verlo.</p>
            <a href={urlDescarga} download={nombreArchivo} className={styles.descargar}>
              Descargar original
            </a>
          </div>
        )}
      </main>

      <footer className={styles.pie}>{pie}</footer>
    </div>
  );
}
