"use client";

// Pantalla P11 · Comparar posible duplicado (#22).
// El aviso nunca bloquea guardar ni exportar: el usuario decide.
// «No es un duplicado» corresponde a la columna `duplicado_descartado`.

import { useState } from "react";
import Link from "next/link";
import styles from "./comparar.module.css";
import { TEXTO_MOTIVO, motivoDuplicado, normalizar, type DocumentoComparable } from "@/lib/duplicados/motivo";
import type { FichaEjemplo } from "@/lib/demo/fichas-ejemplo";

type Props = {
  /** El documento que tiene el aviso. */
  actual: FichaEjemplo;
  /** El documento con el que coincide (`posible_duplicado_de`). */
  otra: FichaEjemplo;
  datosDeEjemplo?: boolean;
};

type Estado = "decidiendo" | "elegir-borrado" | "borrado" | "no-duplicado";

function comparable(f: FichaEjemplo): DocumentoComparable {
  return { ...f.datos, huella: f.huella };
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

  const motivo = motivoDuplicado(comparable(otra), comparable(actual));
  const documentos = [
    { ficha: otra, letra: "A" },
    { ficha: actual, letra: "B" },
  ];

  const filas: { etiqueta: string; valor: (f: FichaEjemplo) => string; igual: boolean }[] = [
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
          Datos de ejemplo: dos fotos reales del mismo ticket. Lo que decidas aquí no se guarda todavía.
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
              {/* eslint-disable-next-line @next/next/no-img-element -- el original se muestra tal cual */}
              <img src={ficha.original} alt={`Original del documento ${letra}`} className={styles.imagen} />
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
          <button type="button" className={styles.secundaria} onClick={() => setEstado("no-duplicado")}>
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
            <button type="button" className={styles.peligroLleno} onClick={() => setEstado("borrado")}>
              Sí, borrar
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
            <Link className={styles.enlace} href="/exportar">
              Ir a exportar
            </Link>
            {estado === "no-duplicado" && (
              <button type="button" className={styles.secundaria} onClick={() => setEstado("decidiendo")}>
                Deshacer
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
