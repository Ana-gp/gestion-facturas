"use client";

// Pantalla P11 · Comparar posible duplicado (#22).
// El aviso nunca bloquea guardar ni exportar: el usuario decide.
// «No es un duplicado» corresponde a la columna `duplicado_descartado`.

import { useState } from "react";
import Link from "next/link";
import styles from "./comparar.module.css";
import { TEXTO_MOTIVO, motivoDuplicado, normalizar, type DocumentoComparable } from "@/lib/duplicados/motivo";
import type { FichaRevision } from "@/lib/revision/guardado";

type Props = {
  /** El documento que tiene el aviso. */
  actual: FichaRevision;
  /** El documento con el que coincide (`posible_duplicado_de`). */
  otra: FichaRevision;
  datosDeEjemplo?: boolean;
};

type Estado = "decidiendo" | "elegir-borrado" | "borrado" | "no-duplicado";

function comparable(f: FichaRevision): DocumentoComparable {
  return { ...f.datos, huella: f.huella };
}

function esPdf(f: FichaRevision): boolean {
  return f.tipoOriginal ? f.tipoOriginal === "application/pdf" : f.original.toLowerCase().split("?")[0].endsWith(".pdf");
}

function fecha(iso: string | null): string {
  if (!iso) return "Sin dato";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

function importe(valor: number | null, moneda: string): string {
  return valor === null ? "Sin dato" : `${valor.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${moneda}`;
}

export default function Comparar({ actual, otra, datosDeEjemplo = false }: Props) {
  const [estado, setEstado] = useState<Estado>("decidiendo");
  const [aBorrar, setABorrar] = useState<string>(actual.id);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Con datos reales cada ficha tiene su documento; las de ejemplo no guardan nada.
  const real = !datosDeEjemplo && Boolean(actual.documentoId && otra.documentoId);

  async function pedir(url: string, opciones: RequestInit): Promise<boolean> {
    setOcupado(true);
    setError(null);
    try {
      const respuesta = await fetch(url, opciones);
      const cuerpo = (await respuesta.json().catch(() => ({}))) as { error?: string };
      if (!respuesta.ok) setError(cuerpo.error ?? "No hemos podido guardarlo. Inténtalo otra vez.");
      return respuesta.ok;
    } catch {
      setError("No hay conexión. Inténtalo otra vez.");
      return false;
    } finally {
      setOcupado(false);
    }
  }

  async function descartar(descartado: boolean) {
    if (real) {
      const ok = await pedir(`/api/facturas/${actual.id}/duplicado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descartado }),
      });
      if (!ok) return;
    }
    setEstado(descartado ? "no-duplicado" : "decidiendo");
  }

  async function borrarElegido() {
    const ficha = aBorrar === actual.id ? actual : otra;
    if (real && ficha.documentoId) {
      const ok = await pedir(`/api/documentos/${ficha.documentoId}`, { method: "DELETE" });
      if (!ok) return;
    }
    setEstado("borrado");
  }

  const motivo = motivoDuplicado(comparable(otra), comparable(actual));
  const documentos = [
    { ficha: otra, letra: "A" },
    { ficha: actual, letra: "B" },
  ];

  const filas: { etiqueta: string; valor: (f: FichaRevision) => string; igual: boolean }[] = [
    { etiqueta: "Fecha", valor: (f) => fecha(f.datos.fecha), igual: otra.datos.fecha === actual.datos.fecha },
    {
      etiqueta: "Emisor",
      valor: (f) => f.datos.emisorNombre ?? "Sin dato",
      igual: (otra.datos.emisorNombre ?? "").trim().toLowerCase() === (actual.datos.emisorNombre ?? "").trim().toLowerCase(),
    },
    {
      etiqueta: "NIF del emisor",
      valor: (f) => f.datos.emisorNif ?? "Sin dato",
      igual: normalizar(otra.datos.emisorNif) !== null && normalizar(otra.datos.emisorNif) === normalizar(actual.datos.emisorNif),
    },
    {
      etiqueta: "Número",
      valor: (f) => f.datos.numero ?? "Sin dato",
      igual: normalizar(otra.datos.numero) !== null && normalizar(otra.datos.numero) === normalizar(actual.datos.numero),
    },
    {
      etiqueta: "Total",
      valor: (f) => importe(f.datos.total, f.datos.moneda),
      igual: otra.datos.total !== null && otra.datos.total === actual.datos.total && otra.datos.moneda === actual.datos.moneda,
    },
  ];

  const borrado = documentos.find((d) => d.ficha.id === aBorrar);

  return (
    <main className={styles.pagina}>
      {datosDeEjemplo && (
        <p className={styles.ejemplo}>
          Datos de ejemplo: dos fotos reales del mismo ticket. En el ejemplo lo que decidas no se guarda.
        </p>
      )}

      <header className={styles.cabecera}>
        <h1 className={styles.titulo}>Comparar posible duplicado</h1>
        <p className={styles.explicacion}>
          Puede que hayas subido dos veces el mismo gasto. Compáralos y decide. Mientras no decidas, los dos se guardan y
          se exportan con el aviso.
        </p>
      </header>

      <p className={styles.motivo}>
        <strong>Por qué te avisamos:</strong>{" "}
        {motivo ? TEXTO_MOTIVO[motivo] : "Ya no coinciden los datos que hicieron saltar el aviso."}
      </p>

      <div className={styles.pareja}>
        {documentos.map(({ ficha, letra }) => (
          <section key={ficha.id} className={styles.documento} aria-labelledby={`doc-${ficha.id}`}>
            <h2 id={`doc-${ficha.id}`} className={styles.subtitulo}>
              Documento {letra}
              <span className={styles.archivo}>{ficha.nombreArchivo}</span>
            </h2>
            <a className={styles.marco} href={ficha.original} target="_blank" rel="noreferrer" aria-label={`Ver en grande el documento ${letra}`}>
              {!ficha.original ? (
                <span className={styles.archivo}>No hemos podido abrir el original.</span>
              ) : esPdf(ficha) ? (
                <iframe src={ficha.original} title={`Original del documento ${letra}`} className={styles.imagen} />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element -- el original se muestra tal cual */
                <img src={ficha.original} alt={`Original del documento ${letra}`} className={styles.imagen} />
              )}
            </a>
            <dl className={styles.datos}>
              {filas.map((f) => (
                <div key={f.etiqueta} className={f.igual ? styles.coincide : undefined}>
                  <dt>{f.etiqueta}</dt>
                  <dd>
                    {f.valor(ficha)}
                    {f.igual && <span className={styles.marca}>Coincide</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      {estado === "decidiendo" && (
        <div className={styles.acciones}>
          <button type="button" className={styles.peligro} onClick={() => setEstado("elegir-borrado")}>
            Borrar uno de los dos
          </button>
          <button type="button" className={styles.secundaria} disabled={ocupado} onClick={() => descartar(true)}>
            No es un duplicado
          </button>
          <Link className={styles.enlace} href={`/revisar/${actual.id}`}>
            Decidir más tarde
          </Link>
        </div>
      )}

      {estado === "elegir-borrado" && (
        <fieldset className={styles.confirmar}>
          <legend>¿Cuál quieres borrar?</legend>
          {documentos.map(({ ficha, letra }) => (
            <label key={ficha.id} className={styles.opcion}>
              <input type="radio" name="borrar" value={ficha.id} checked={aBorrar === ficha.id} onChange={() => setABorrar(ficha.id)} />
              Documento {letra} ({ficha.nombreArchivo})
            </label>
          ))}
          <p>Se borran el original y sus datos. Borrar no devuelve la lectura gastada.</p>
          <div className={styles.acciones}>
            <button type="button" className={styles.peligroLleno} disabled={ocupado} onClick={borrarElegido}>
              {ocupado ? "Borrando…" : "Sí, borrar"}
            </button>
            <button type="button" className={styles.secundaria} onClick={() => setEstado("decidiendo")}>
              Cancelar
            </button>
          </div>
        </fieldset>
      )}

      {(estado === "borrado" || estado === "no-duplicado") && (
        <div className={styles.resultado} role="status">
          <p>
            {estado === "borrado"
              ? `Documento ${borrado?.letra} borrado. El otro queda guardado sin aviso.`
              : "Marcados como documentos distintos. No volveremos a avisarte de estos dos."}
          </p>
          <div className={styles.acciones}>
            <Link className={styles.enlace} href="/gastos">
              Volver a tus gastos
            </Link>
            {estado === "no-duplicado" && (
              <button type="button" className={styles.secundaria} disabled={ocupado} onClick={() => descartar(false)}>
                Deshacer
              </button>
            )}
          </div>
        </div>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </main>
  );
}
