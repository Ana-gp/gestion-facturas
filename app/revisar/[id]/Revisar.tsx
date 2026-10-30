"use client";

// Pantalla P10 · Revisar y corregir (#21). Es la pantalla central del MVP.
// Requisito 4 del enunciado: el usuario ve la foto junto a los datos y arregla
// lo que esté mal en dos clics. Clic 1: sobre el dato (se vuelve editable).
// Clic 2: «Listo» (o Intro). Escribir el valor no cuenta como clic.
// La IA propone; el usuario decide: nada se corrige solo.

import { useState, type KeyboardEvent } from "react";
import Link from "next/link";
import styles from "./revisar.module.css";
import {
  ETIQUETAS,
  avisosDeLaFicha,
  camposARevisar,
  faltaParaRevisada,
  lineasQueNoCuadran,
  marcarCorregido,
  type Campo,
  type CamposRevision,
  type DatosRevision,
} from "@/lib/revision/comprobaciones";
import { CATEGORIAS, type FichaEjemplo } from "@/lib/demo/fichas-ejemplo";
import { notaDeLaFecha, textoDelTipo, totalEnEuros, type FuenteTipoCambio, type TipoDeCambio } from "@/lib/moneda/conversion";

type Props = {
  ficha: FichaEjemplo;
  datosDeEjemplo?: boolean;
};

type TipoEntrada = "texto" | "fecha" | "importe" | "porcentaje" | "cambio" | "lista";

type DefinicionCampo = {
  /** Identificador único en la pantalla, por ejemplo "fecha" o "linea-1-base". */
  clave: string;
  etiqueta: string;
  /** Campo de `campos_revision` al que pertenece. */
  campo: Campo;
  valor: string;
  /** Valor con el que se abre el control al editar. */
  inicial: string;
  tipo: TipoEntrada;
  opciones?: string[];
  ayuda?: string;
  /** No muestra «Revisar dato» ni «Corregido por ti» (por ejemplo, el tipo de documento). */
  sinMarcas?: boolean;
  guardar: (texto: string) => string | null;
};

const MONEDAS = ["EUR", "USD", "GBP", "CHF", "MXN"];

function redondear(valor: number, decimales = 2): number {
  const f = 10 ** decimales;
  return Math.round((valor + Number.EPSILON) * f) / f;
}

/** Admite "56,53", "1.234,56" y "56.53". Devuelve null si está vacío y NaN si no es un número. */
function leerNumero(texto: string): number | null {
  const limpio = texto.replace(/[\s€%]/g, "");
  if (limpio === "") return null;
  const normal = limpio.includes(",") ? limpio.replace(/\./g, "").replace(",", ".") : limpio;
  return /^-?\d+(\.\d+)?$/.test(normal) ? Number(normal) : Number.NaN;
}

function mostrarNumero(valor: number | null, decimales = 2): string {
  if (valor === null) return "";
  return valor.toLocaleString("es-ES", { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
}

function mostrarImporte(valor: number | null, moneda: string): string {
  return valor === null ? "" : `${mostrarNumero(valor)} ${moneda}`;
}

function mostrarFecha(iso: string | null): string {
  if (!iso) return "";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

function conTotalEnEuros(d: DatosRevision): DatosRevision {
  if (d.moneda === "EUR") return { ...d, tipoCambio: null, totalEur: d.total };
  const totalEur = d.total !== null && d.tipoCambio ? totalEnEuros(d.total, d.tipoCambio) : null;
  return { ...d, totalEur };
}

export default function Revisar({ ficha, datosDeEjemplo = false }: Props) {
  const [datos, setDatos] = useState<DatosRevision>(ficha.datos);
  const [tipoDocumento, setTipoDocumento] = useState(ficha.tipoDocumento);
  const [revision, setRevision] = useState<CamposRevision>(ficha.revisionIa);
  const [editando, setEditando] = useState<string | null>(null);
  const [borrador, setBorrador] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ampliada, setAmpliada] = useState(false);
  const [estado, setEstado] = useState<"editando" | "revisada" | "confirmar-borrado" | "borrado">("editando");
  // Tipo de cambio (#20): fecha y fuente del tipo aplicado, y la propuesta pendiente de aceptar.
  const [origenTipo, setOrigenTipo] = useState<{ fecha: string | null; fuente: FuenteTipoCambio } | null>(null);
  const [propuesta, setPropuesta] = useState<TipoDeCambio | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [errorTipo, setErrorTipo] = useState<string | null>(null);

  const aRevisar = new Set(camposARevisar(datos, revision));
  const avisos = avisosDeLaFicha(datos, { posibleDuplicado: ficha.posibleDuplicadoDe !== null });
  const falta = faltaParaRevisada(datos);
  const cuotasRaras = new Map(lineasQueNoCuadran(datos).map((l) => [l.indice, l.cuotaEsperada]));
  const esPdf = ficha.original.toLowerCase().endsWith(".pdf");

  function actualizar(campo: Campo, cambio: (d: DatosRevision) => DatosRevision) {
    setDatos((d) => conTotalEnEuros(cambio(d)));
    setRevision((r) => marcarCorregido(r, campo));
    if (estado === "revisada") setEstado("editando");
  }

  function abrir(def: DefinicionCampo) {
    setEditando(def.clave);
    setBorrador(def.inicial);
    setError(null);
  }

  function cerrar() {
    setEditando(null);
    setError(null);
  }

  function confirmar(def: DefinicionCampo) {
    const fallo = def.guardar(borrador);
    if (fallo) {
      setError(fallo);
      return;
    }
    cerrar();
  }

  function teclas(e: KeyboardEvent, def: DefinicionCampo) {
    if (e.key === "Enter") {
      e.preventDefault();
      confirmar(def);
    } else if (e.key === "Escape") {
      cerrar();
    }
  }

  // --- Definición de los campos ---------------------------------------------

  function texto(clave: string, etiqueta: string, campo: Campo, valor: string | null, aplicar: (v: string | null) => (d: DatosRevision) => DatosRevision, ayuda?: string): DefinicionCampo {
    return {
      clave, etiqueta, campo, ayuda, tipo: "texto",
      valor: valor ?? "",
      inicial: valor ?? "",
      guardar: (t) => {
        actualizar(campo, aplicar(t.trim() === "" ? null : t.trim()));
        return null;
      },
    };
  }

  function importe(clave: string, etiqueta: string, campo: Campo, valor: number | null, aplicar: (v: number | null) => (d: DatosRevision) => DatosRevision, opciones: { opcional?: boolean; sinMoneda?: boolean; sinMarcas?: boolean } = {}): DefinicionCampo {
    const { opcional = false, sinMoneda = false, sinMarcas = false } = opciones;
    return {
      clave, etiqueta, campo, tipo: "importe", sinMarcas,
      valor: sinMoneda ? mostrarNumero(valor) : mostrarImporte(valor, datos.moneda),
      inicial: mostrarNumero(valor),
      guardar: (t) => {
        const n = leerNumero(t);
        if (Number.isNaN(n)) return "Escribe un importe, por ejemplo 12,50.";
        if (n === null && !opcional) return "Este importe no puede quedar vacío.";
        actualizar(campo, aplicar(n === null ? null : redondear(n)));
        return null;
      },
    };
  }

  const fecha: DefinicionCampo = {
    clave: "fecha", etiqueta: ETIQUETAS.fecha, campo: "fecha", tipo: "fecha",
    valor: mostrarFecha(datos.fecha),
    inicial: datos.fecha ?? "",
    guardar: (t) => {
      if (t && !/^\d{4}-\d{2}-\d{2}$/.test(t)) return "Elige una fecha del calendario.";
      actualizar("fecha", (d) => ({ ...d, fecha: t || null }));
      return null;
    },
  };

  const tipoDoc: DefinicionCampo = {
    clave: "tipo", etiqueta: "Tipo de documento", campo: "numero", tipo: "lista", sinMarcas: true,
    opciones: ["Ticket", "Factura"],
    valor: tipoDocumento === "factura" ? "Factura" : "Ticket",
    inicial: tipoDocumento === "factura" ? "Factura" : "Ticket",
    guardar: (t) => {
      setTipoDocumento(t === "Factura" ? "factura" : "ticket");
      return null;
    },
  };

  const numero = texto("numero", ETIQUETAS.numero, "numero", datos.numero, (v) => (d) => ({ ...d, numero: v }));
  const emisor = texto("emisor", ETIQUETAS.emisor_nombre, "emisor_nombre", datos.emisorNombre, (v) => (d) => ({ ...d, emisorNombre: v }));
  const emisorNif = texto("emisor-nif", ETIQUETAS.emisor_nif, "emisor_nif", datos.emisorNif, (v) => (d) => ({ ...d, emisorNif: v?.toUpperCase() ?? null }));
  const receptorNif = texto(
    "receptor-nif", "Tu NIF", "receptor_nif", datos.receptorNif,
    (v) => (d) => ({ ...d, receptorNif: v?.toUpperCase() ?? null }),
    "Opcional. Los tickets no suelen llevarlo; las facturas completas, sí.",
  );

  const categoria: DefinicionCampo = {
    clave: "categoria", etiqueta: ETIQUETAS.categoria, campo: "categoria", tipo: "lista",
    opciones: CATEGORIAS,
    valor: datos.categoria ?? "",
    inicial: datos.categoria ?? CATEGORIAS[0],
    guardar: (t) => {
      actualizar("categoria", (d) => ({ ...d, categoria: t }));
      return null;
    },
  };

  const lineas = datos.lineas.map((l, i) => {
    const cambiarLinea = (cambio: Partial<typeof l>) => (d: DatosRevision) => ({
      ...d,
      lineas: d.lineas.map((x, j) => (j === i ? { ...x, ...cambio } : x)),
    });
    const tipo: DefinicionCampo = {
      clave: `linea-${i}-tipo`, etiqueta: `Tipo de IVA de la línea ${i + 1}`, campo: "lineas_iva", tipo: "porcentaje",
      valor: `${mostrarNumero(l.tipoIva, Number.isInteger(l.tipoIva) ? 0 : 1)} %`,
      inicial: mostrarNumero(l.tipoIva, Number.isInteger(l.tipoIva) ? 0 : 1),
      guardar: (t) => {
        const n = leerNumero(t);
        if (n === null || Number.isNaN(n) || n < 0 || n > 100) return "Escribe un porcentaje, por ejemplo 21.";
        actualizar("lineas_iva", cambiarLinea({ tipoIva: n }));
        return null;
      },
    };
    const base = importe(`linea-${i}-base`, `Base de la línea ${i + 1}`, "lineas_iva", l.base, (v) => cambiarLinea({ base: v ?? 0 }), { sinMoneda: true });
    const cuota = importe(`linea-${i}-cuota`, `Cuota de la línea ${i + 1}`, "lineas_iva", l.cuota, (v) => cambiarLinea({ cuota: v ?? 0 }), { sinMoneda: true });
    return { tipo, base, cuota };
  });

  // La retención no tiene clave propia en `campos_revision`: cuenta como parte del total.
  const retencion = importe("retencion", "Retención de IRPF", "total", datos.retencionImporte, (v) => (d) => ({ ...d, retencionImporte: v }), { opcional: true, sinMarcas: true });
  const total = importe("total", ETIQUETAS.total, "total", datos.total, (v) => (d) => ({ ...d, total: v }));

  const moneda: DefinicionCampo = {
    clave: "moneda", etiqueta: ETIQUETAS.moneda, campo: "moneda", tipo: "lista",
    opciones: MONEDAS.includes(datos.moneda) ? MONEDAS : [...MONEDAS, datos.moneda],
    valor: datos.moneda,
    inicial: datos.moneda,
    guardar: (t) => {
      if (t !== datos.moneda) {
        // Otra moneda: el tipo anterior ya no vale.
        setOrigenTipo(null);
        setPropuesta(null);
        setErrorTipo(null);
      }
      actualizar("moneda", (d) => ({ ...d, moneda: t, tipoCambio: t === d.moneda ? d.tipoCambio : null }));
      return null;
    },
  };

  const tipoCambio: DefinicionCampo = {
    clave: "tipo-cambio", etiqueta: ETIQUETAS.tipo_cambio, campo: "tipo_cambio", tipo: "cambio",
    valor: datos.tipoCambio ? `1 € = ${mostrarNumero(datos.tipoCambio, 4)} ${datos.moneda}` : "",
    inicial: mostrarNumero(datos.tipoCambio, 4),
    ayuda: `Cuántos ${datos.moneda} vale 1 euro el día de la factura.`,
    guardar: (t) => {
      const n = leerNumero(t);
      if (n === null || Number.isNaN(n) || n <= 0) return `Escribe cuántos ${datos.moneda} vale 1 euro, por ejemplo 1,1133.`;
      actualizar("tipo_cambio", (d) => ({ ...d, tipoCambio: redondear(n, 6) }));
      setOrigenTipo({ fecha: datos.fecha, fuente: "manual" });
      setPropuesta(null);
      setErrorTipo(null);
      return null;
    },
  };

  async function buscarTipo() {
    if (!datos.fecha) {
      setErrorTipo("Pon primero la fecha de la factura.");
      return;
    }
    setBuscando(true);
    setErrorTipo(null);
    setPropuesta(null);
    try {
      const respuesta = await fetch(`/api/tipo-cambio?moneda=${encodeURIComponent(datos.moneda)}&fecha=${datos.fecha}`);
      const cuerpo = await respuesta.json();
      if (!respuesta.ok) setErrorTipo(cuerpo.error ?? "No se ha podido consultar el tipo de cambio.");
      else setPropuesta(cuerpo as TipoDeCambio);
    } catch {
      setErrorTipo("No se ha podido consultar el tipo de cambio. Inténtalo más tarde o escríbelo a mano.");
    } finally {
      setBuscando(false);
    }
  }

  function aceptarPropuesta() {
    if (!propuesta) return;
    actualizar("tipo_cambio", (d) => ({ ...d, tipoCambio: propuesta.tipo }));
    setOrigenTipo({ fecha: propuesta.fecha, fuente: propuesta.fuente });
    setPropuesta(null);
  }

  // --- Pintar un campo --------------------------------------------------------

  // Funciones normales, no componentes: si fueran componentes definidos aquí
  // dentro, React los volvería a montar en cada tecla y el campo perdería el foco.
  function valor(def: DefinicionCampo, compacto = false) {
    const revisar = !def.sinMarcas && aRevisar.has(def.campo);
    const corregido = !def.sinMarcas && (revision[def.campo]?.corregido ?? false);
    const idError = `${def.clave}-error`;

    if (editando === def.clave) {
      const comun = {
        id: def.clave,
        autoFocus: true,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? idError : undefined,
        onKeyDown: (e: KeyboardEvent) => teclas(e, def),
        className: styles.entrada,
      };
      return (
        <div className={styles.edicion}>
          {def.tipo === "lista" ? (
            <select {...comun} value={borrador} onChange={(e) => setBorrador(e.target.value)}>
              {def.opciones?.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : (
            <input
              {...comun}
              type={def.tipo === "fecha" ? "date" : "text"}
              inputMode={def.tipo === "texto" || def.tipo === "fecha" ? undefined : "decimal"}
              value={borrador}
              onChange={(e) => setBorrador(e.target.value)}
              aria-label={def.etiqueta}
            />
          )}
          <button type="button" className={styles.listo} onClick={() => confirmar(def)}>
            Listo
          </button>
          <button type="button" className={styles.cancelar} onClick={cerrar}>
            Cancelar
          </button>
          {error && (
            <p id={idError} className={styles.errorCampo}>
              {error}
            </p>
          )}
        </div>
      );
    }

    return (
      <button
        type="button"
        className={`${styles.valor} ${revisar ? styles.valorRevisar : ""} ${compacto ? styles.valorCompacto : ""}`}
        onClick={() => abrir(def)}
        aria-label={`${def.etiqueta}: ${def.valor || "sin dato"} (pulsa para corregir)`}
      >
        <span className={def.valor ? undefined : styles.sinDato}>{def.valor || "Sin dato"}</span>
        {!compacto && (
          <span className={styles.marcas}>
            {revisar && <span className={styles.marcaRevisar}>Revisar dato</span>}
            {corregido && !revisar && <span className={styles.marcaCorregido}>Corregido por ti</span>}
          </span>
        )}
      </button>
    );
  }

  function fila(def: DefinicionCampo) {
    return (
      <div key={def.clave} className={styles.fila}>
        <label htmlFor={editando === def.clave ? def.clave : undefined} className={styles.etiqueta}>
          {def.etiqueta}
        </label>
        {valor(def)}
        {def.ayuda && <p className={styles.ayuda}>{def.ayuda}</p>}
      </div>
    );
  }

  function anadirLinea() {
    actualizar("lineas_iva", (d) => ({ ...d, lineas: [...d.lineas, { tipoIva: 21, base: 0, cuota: 0 }] }));
    const i = datos.lineas.length;
    setEditando(`linea-${i}-base`);
    setBorrador("");
    setError(null);
  }

  function quitarLinea(i: number) {
    actualizar("lineas_iva", (d) => ({ ...d, lineas: d.lineas.filter((_, j) => j !== i) }));
    cerrar();
  }

  if (estado === "borrado") {
    return (
      <main className={styles.pagina}>
        <div className={styles.borrado}>
          <h1 className={styles.titulo}>Documento borrado</h1>
          <p>El original y sus datos se han borrado. La lectura gastada no se devuelve.</p>
          <Link href="/exportar">Volver a tus gastos</Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.pagina}>
      {datosDeEjemplo && (
        <p className={styles.ejemplo}>
          Datos de ejemplo: lo que leyó la IA en la prueba con los tickets del equipo. Los cambios no se guardan todavía.
        </p>
      )}

      <header className={styles.cabecera}>
        <h1 className={styles.titulo}>Revisar y corregir</h1>
        <p className={styles.explicacion}>
          Compara los datos con el original. Pulsa sobre un dato para corregirlo y confirma con «Listo».
        </p>
      </header>

      <div className={styles.rejilla}>
        <section className={styles.original} aria-label="Documento original">
          <div className={`${styles.marco} ${ampliada ? styles.marcoAmpliado : ""}`}>
            {esPdf ? (
              <iframe src={ficha.original} title={`Original: ${ficha.nombreArchivo}`} className={styles.pdf} />
            ) : (
              <button
                type="button"
                className={styles.botonImagen}
                onClick={() => setAmpliada((a) => !a)}
                aria-label={ampliada ? "Reducir el original" : "Ampliar el original"}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- el original se muestra tal cual, sin optimizar */}
                <img src={ficha.original} alt={`Original del documento ${ficha.nombreArchivo}`} className={styles.imagen} />
              </button>
            )}
          </div>
          <p className={styles.pieOriginal}>
            <span>{ficha.nombreArchivo}</span>
            <a href={ficha.original} target="_blank" rel="noreferrer">
              Ver original en grande
            </a>
          </p>
        </section>

        <section className={styles.datos} aria-label="Datos leídos">
          {avisos.length > 0 && (
            <ul className={styles.avisos}>
              {avisos.map((a) => (
                <li key={a.clave} className={a.clave === "sin-nif-receptor" ? styles.avisoNeutral : styles.aviso}>
                  {a.texto}
                  {a.clave === "duplicado" && (
                    <>
                      {" "}
                      <Link href={`/comparar/${ficha.id}`}>Comparar</Link>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}

          <fieldset className={styles.grupo}>
            <legend>Documento</legend>
            {fila(tipoDoc)}
            {fila(fecha)}
            {fila(numero)}
          </fieldset>

          <fieldset className={styles.grupo}>
            <legend>Emisor</legend>
            {fila(emisor)}
            {fila(emisorNif)}
          </fieldset>

          <fieldset className={styles.grupo}>
            <legend>Tus datos</legend>
            {fila(receptorNif)}
          </fieldset>

          <fieldset className={styles.grupo}>
            <legend>Importes</legend>
            <div className={styles.lineas}>
              <div className={styles.cabeceraLineas} aria-hidden="true">
                <span>Tipo</span>
                <span>Base ({datos.moneda})</span>
                <span>Cuota ({datos.moneda})</span>
                <span />
              </div>
              {lineas.map((l, i) => (
                <div key={i} className={styles.lineaBloque}>
                  <div className={styles.linea}>
                    {valor(l.tipo, true)}
                    {valor(l.base, true)}
                    {valor(l.cuota, true)}
                    <button type="button" className={styles.quitar} onClick={() => quitarLinea(i)} aria-label={`Quitar la línea ${i + 1}`}>
                      Quitar
                    </button>
                  </div>
                  {cuotasRaras.has(i) && (
                    <p className={styles.errorCampo}>
                      Revisar dato: con ese tipo, la cuota debería ser {mostrarNumero(cuotasRaras.get(i) ?? 0)}.
                    </p>
                  )}
                </div>
              ))}
              {datos.lineas.length === 0 && <p className={styles.sinDato}>Sin líneas de IVA.</p>}
              <button type="button" className={styles.anadir} onClick={anadirLinea}>
                Añadir línea de IVA
              </button>
              {aRevisar.has("lineas_iva") && <p className={styles.marcaRevisar}>Revisar dato: comprueba las líneas de IVA</p>}
            </div>
            {fila(retencion)}
            {fila(total)}
            {fila(moneda)}
            {datos.moneda !== "EUR" && (
              <>
                {fila(tipoCambio)}
                <div className={styles.cambio}>
                  {origenTipo && datos.tipoCambio && (
                    <p className={styles.ayuda}>
                      {origenTipo.fuente === "BDE"
                        ? `Tipo oficial del euro del BCE, el mismo que publica el Banco de España, del ${mostrarFecha(origenTipo.fecha)}.`
                        : "Tipo escrito por ti."}
                    </p>
                  )}
                  {!propuesta && (
                    <button type="button" className={styles.secundaria} onClick={buscarTipo} disabled={buscando || editando !== null}>
                      {buscando ? "Buscando…" : datos.tipoCambio ? "Buscar otra vez el tipo de cambio" : "Buscar el tipo de cambio"}
                    </button>
                  )}
                  {propuesta && (
                    <div className={styles.propuesta} role="status">
                      <p>
                        <strong>Tipo propuesto: {textoDelTipo(propuesta.tipo, propuesta.moneda)}</strong>, del {mostrarFecha(propuesta.fecha)}.
                        Es el tipo oficial del euro del BCE, el mismo que publica el Banco de España.
                      </p>
                      {datos.fecha && notaDeLaFecha(propuesta.fecha, datos.fecha) && <p>{notaDeLaFecha(propuesta.fecha, datos.fecha)}</p>}
                      <p className={styles.ayuda}>Si la fecha de devengo no es la de la factura, consulta con tu gestoría y escribe el tipo a mano.</p>
                      <div className={styles.secundarias}>
                        <button type="button" className={styles.listo} onClick={aceptarPropuesta}>
                          Usar este tipo
                        </button>
                        <button type="button" className={styles.cancelar} onClick={() => setPropuesta(null)}>
                          No usarlo
                        </button>
                      </div>
                    </div>
                  )}
                  {errorTipo && <p className={styles.errorCampo}>{errorTipo}</p>}
                </div>
                <div className={styles.fila}>
                  <span className={styles.etiqueta}>Total en euros</span>
                  <p className={styles.calculado}>
                    {datos.totalEur !== null ? `${mostrarNumero(datos.totalEur)} EUR` : "Conversión pendiente"}
                  </p>
                </div>
              </>
            )}
          </fieldset>

          <fieldset className={styles.grupo}>
            <legend>Categoría</legend>
            {fila(categoria)}
          </fieldset>

          <div className={styles.acciones}>
            {falta.length > 0 && (
              <p className={styles.falta}>
                Para guardarla como revisada falta: {falta.map((c) => ETIQUETAS[c].toLowerCase()).join(", ")}.
              </p>
            )}
            <button
              type="button"
              className={styles.principal}
              disabled={falta.length > 0 || editando !== null}
              onClick={() => setEstado("revisada")}
            >
              Guardar como revisada
            </button>
            <p role="status" className={styles.estado}>
              {estado === "revisada" && "Guardada como revisada."}
            </p>

            <div className={styles.secundarias}>
              <button type="button" className={styles.secundaria} disabled title="Disponible cuando esté conectada la lectura con IA (#19)">
                Volver a leer con IA
              </button>
              <button type="button" className={styles.peligro} onClick={() => setEstado("confirmar-borrado")}>
                Borrar documento
              </button>
            </div>

            {estado === "confirmar-borrado" && (
              <div className={styles.confirmar} role="alertdialog" aria-labelledby="titulo-borrar">
                <p id="titulo-borrar">¿Borrar este documento? Se borran el original y sus datos. Borrar no devuelve la lectura gastada.</p>
                <div className={styles.secundarias}>
                  <button type="button" className={styles.peligroLleno} onClick={() => setEstado("borrado")}>
                    Sí, borrar
                  </button>
                  <button type="button" className={styles.secundaria} onClick={() => setEstado("editando")}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className={styles.pie}>Ticketon no decide si un gasto es deducible: eso lo decide tu gestoría.</p>
        </section>
      </div>
    </main>
  );
}
