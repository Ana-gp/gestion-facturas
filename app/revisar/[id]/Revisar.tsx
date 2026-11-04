"use client";

// Pantalla P10 · Revisar y corregir (#21). Es la pantalla central del MVP.
// Requisito 4 del enunciado: el usuario ve la foto junto a los datos y arregla
// lo que esté mal en dos clics. Clic 1: sobre el dato (se vuelve editable).
// Clic 2: «Listo» (o Intro), que guarda el dato en ese momento (mapa de
// pantallas, 3.4). Escribir el valor no cuenta como clic.
// La IA propone; el usuario decide: nada se corrige solo.

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./revisar.module.css";
import {
  ETIQUETAS,
  avisosDeLaFicha,
  camposARevisar,
  fechaQuizaCruzada,
  faltaParaRevisada,
  lineasQueNoCuadran,
  marcarTrasCambio,
  type Campo,
  type CamposRevision,
  type DatosRevision,
} from "@/lib/revision/comprobaciones";
import { CATEGORIAS } from "@/lib/demo/fichas-ejemplo";
import type { FichaRevision } from "@/lib/revision/guardado";
import { notaDeLaFecha, textoDelTipo, totalEnEuros, type FuenteTipoCambio, type TipoDeCambio } from "@/lib/moneda/conversion";

type Props = {
  ficha: FichaRevision;
  /** Ficha de ejemplo: los cambios no se guardan. */
  datosDeEjemplo?: boolean;
};

type Guardado = { estado: "sin-cambios" | "guardando" | "guardado" | "error"; mensaje?: string };

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
  const router = useRouter();
  const real = !datosDeEjemplo && Boolean(ficha.documentoId);
  const [datos, setDatos] = useState<DatosRevision>(ficha.datos);
  const [tipoDocumento, setTipoDocumento] = useState(ficha.tipoDocumento);
  const [revision, setRevision] = useState<CamposRevision>(ficha.revisionIa);
  const [editando, setEditando] = useState<string | null>(null);
  const [borrador, setBorrador] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ampliada, setAmpliada] = useState(false);
  const [estado, setEstado] = useState<"editando" | "revisada" | "confirmar-borrado" | "borrado" | "confirmar-lectura">(
    ficha.estadoRevision === "revisada" ? "revisada" : "editando",
  );
  const [guardado, setGuardado] = useState<Guardado>({ estado: "sin-cambios" });
  // Estado al que se vuelve al cancelar una confirmación (borrar o volver a leer).
  const [antes, setAntes] = useState<"editando" | "revisada">("editando");
  // Cómo estaba la ficha al abrirla: si un dato vuelve a ese valor, recupera su marca.
  const [alAbrir] = useState(() => ({ datos: ficha.datos, revision: ficha.revisionIa }));
  // Cambios hechos con «Listo» que todavía no se han guardado en la base de datos.
  const [sinGuardar, setSinGuardar] = useState(false);
  // Cada «Listo» con un cambio sube este número; el efecto de abajo lo guarda.
  const [cambiosConListo, setCambiosConListo] = useState(0);
  // Los guardados van en fila, para que uno lento no pise a uno más nuevo.
  const cola = useRef<Promise<void>>(Promise.resolve());
  function pedirConfirmacion(cual: "confirmar-borrado" | "confirmar-lectura") {
    setAntes(estado === "revisada" ? "revisada" : "editando");
    setEstado(cual);
  }
  const [ocupado, setOcupado] = useState<null | "borrando" | "leyendo">(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  // Tipo de cambio (#20): fecha y fuente del tipo aplicado, y la propuesta pendiente de aceptar.
  const [origenTipo, setOrigenTipo] = useState<{ fecha: string | null; fuente: FuenteTipoCambio } | null>(ficha.origenTipo ?? null);
  const [propuesta, setPropuesta] = useState<TipoDeCambio | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [errorTipo, setErrorTipo] = useState<string | null>(null);

  // El día de la subida (el mismo que usa la lectura), para avisar si el día y
  // el mes pueden estar cruzados. Así el aviso no cambia según cuándo se abra la ficha.
  const referencia = ficha.subidoEn?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
  const fechaCruzada = fechaQuizaCruzada(datos.fecha, referencia);
  const aRevisar = new Set(camposARevisar(datos, revision, { referencia }));
  const avisos = avisosDeLaFicha(datos, { posibleDuplicado: ficha.posibleDuplicadoDe !== null });
  const falta = faltaParaRevisada(datos);
  const cuotasRaras = new Map(lineasQueNoCuadran(datos).map((l) => [l.indice, l.cuotaEsperada]));
  const esPdf = ficha.tipoOriginal ? ficha.tipoOriginal === "application/pdf" : ficha.original.toLowerCase().split("?")[0].endsWith(".pdf");

  // Si el valor no cambia, no hace nada: ni marca, ni deja la ficha pendiente, ni guarda.
  // Devuelve si ha cambiado algo.
  function actualizar(campo: Campo, cambio: (d: DatosRevision) => DatosRevision): boolean {
    const nuevos = conTotalEnEuros(cambio(datos));
    if (JSON.stringify(nuevos) === JSON.stringify(datos)) return false;
    setDatos(nuevos);
    setRevision(marcarTrasCambio(revision, campo, nuevos, alAbrir));
    avisarCambio();
    return true;
  }

  function avisarCambio() {
    // Una ficha revisada que se cambia vuelve a quedar pendiente hasta guardarla como revisada otra vez.
    if (estado === "revisada") setEstado("editando");
    setGuardado({ estado: "sin-cambios" });
    setSinGuardar(true);
    setCambiosConListo((n) => n + 1);
  }

  // --- Guardar, borrar y volver a leer (#21; solo con datos reales) -----------

  // «Listo» guarda en ese momento (con datos reales). Se hace en un efecto
  // para enviar los datos ya actualizados en la pantalla.
  useEffect(() => {
    if (cambiosConListo === 0 || !real) return;
    const marcar = estado === "revisada" ? "revisada" : "pendiente";
    encolar(marcar, true);
    // Solo cuando hay un «Listo» nuevo; el resto ya va dentro de guardar().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cambiosConListo]);

  // Aviso al salir con algo sin guardar: cerrar la pestaña o recargar…
  const hayQueAvisar = real && (sinGuardar || editando !== null);
  useEffect(() => {
    if (!hayQueAvisar) return;
    const alSalir = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", alSalir);
    return () => window.removeEventListener("beforeunload", alSalir);
  }, [hayQueAvisar]);

  // …o seguir un enlace de la web (el menú, «Volver a tus gastos»).
  useEffect(() => {
    if (!hayQueAvisar) return;
    const alPulsar = (e: MouseEvent) => {
      const enlace = (e.target as Element | null)?.closest?.("a[href]");
      if (!enlace || enlace.getAttribute("target") === "_blank") return;
      const mensaje =
        editando !== null
          ? "Estás corrigiendo un dato y no has pulsado «Listo». Si sales, se pierde. ¿Salir igualmente?"
          : "Hay cambios sin guardar. Si sales ahora, se pueden perder. ¿Salir igualmente?";
      if (!window.confirm(mensaje)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("click", alPulsar, true);
    return () => document.removeEventListener("click", alPulsar, true);
  }, [hayQueAvisar, editando]);

  // Todos los guardados pasan por aquí, también los de los botones de abajo.
  function encolar(marcar: "pendiente" | "revisada", automatico = false) {
    cola.current = cola.current.then(() => guardar(marcar, automatico));
  }

  async function guardar(marcar: "pendiente" | "revisada", automatico: boolean) {
    if (!real) {
      // Ficha de ejemplo: no se guarda nada.
      if (marcar === "revisada") setEstado("revisada");
      setGuardado({ estado: "guardado" });
      return;
    }
    setGuardado({ estado: "guardando" });
    try {
      const respuesta = await fetch(`/api/facturas/${ficha.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datos, tipoDocumento, revision, origenTipo, estado: marcar }),
      });
      const cuerpo = (await respuesta.json().catch(() => ({}))) as { error?: string };
      if (!respuesta.ok) {
        setGuardado({ estado: "error", mensaje: cuerpo.error ?? "No hemos podido guardar los cambios. Inténtalo otra vez." });
        return;
      }
      setGuardado({ estado: "guardado" });
      setSinGuardar(false);
      if (!automatico) {
        setEstado(marcar === "revisada" ? "revisada" : "editando");
        router.refresh();
      }
    } catch {
      setGuardado({ estado: "error", mensaje: "No hay conexión. Tus cambios siguen en la pantalla: inténtalo otra vez." });
    }
  }

  async function borrar() {
    if (!real || !ficha.documentoId) {
      setEstado("borrado");
      return;
    }
    setOcupado("borrando");
    setErrorAccion(null);
    try {
      const respuesta = await fetch(`/api/documentos/${ficha.documentoId}`, { method: "DELETE" });
      const cuerpo = (await respuesta.json().catch(() => ({}))) as { error?: string };
      if (!respuesta.ok) {
        setErrorAccion(cuerpo.error ?? "No hemos podido borrar el documento. Inténtalo otra vez.");
        setEstado(antes);
      } else setEstado("borrado");
    } catch {
      setErrorAccion("No hay conexión. Inténtalo otra vez.");
      setEstado(antes);
    } finally {
      setOcupado(null);
    }
  }

  async function volverALeer() {
    if (!real || !ficha.documentoId) return;
    setOcupado("leyendo");
    setErrorAccion(null);
    try {
      const respuesta = await fetch("/api/leer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentoId: ficha.documentoId }),
      });
      const cuerpo = (await respuesta.json().catch(() => ({}))) as { estado?: string; mensaje?: string };
      if (cuerpo.estado === "leido") {
        setEstado("editando");
        // La página vuelve a cargar la factura con lo nuevo.
        window.location.reload();
        return;
      }
      setErrorAccion(
        cuerpo.estado === "sin-lecturas"
          ? "Ya has usado todas las lecturas de tu plan este mes. Tus datos no se han cambiado."
          : (cuerpo.mensaje ?? "No hemos podido leer este documento. El original está guardado."),
      );
      setEstado(antes);
    } catch {
      setErrorAccion("No hay conexión. Tus datos no se han cambiado.");
      setEstado(antes);
    } finally {
      setOcupado(null);
    }
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
    ayuda: fechaCruzada && !revision.fecha?.corregido ? `¿Es el ${mostrarFecha(fechaCruzada)}? Comprueba el día y el mes: puede que estén cruzados.` : undefined,
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
      const nuevo = t === "Factura" ? "factura" : "ticket";
      if (nuevo === tipoDocumento) return null;
      setTipoDocumento(nuevo);
      avisarCambio();
      return null;
    },
  };

  const numero = texto("numero", ETIQUETAS.numero, "numero", datos.numero, (v) => (d) => ({ ...d, numero: v }));
  const concepto = texto(
    "concepto", ETIQUETAS.concepto, "concepto", datos.concepto ?? null,
    (v) => (d) => ({ ...d, concepto: v }),
    "Qué se compró, en pocas palabras. Sale en el Excel para la gestoría.",
  );
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
      const cambio = actualizar("tipo_cambio", (d) => ({ ...d, tipoCambio: redondear(n, 6) }));
      if (!cambio && origenTipo?.fuente !== "manual") avisarCambio();
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
    const cambio = actualizar("tipo_cambio", (d) => ({ ...d, tipoCambio: propuesta.tipo }));
    if (!cambio && (origenTipo?.fuente !== propuesta.fuente || origenTipo?.fecha !== propuesta.fecha)) avisarCambio();
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
          <p>
            {real ? "El original y sus datos se han borrado." : "En el ejemplo no se borra nada de verdad."} La lectura gastada no se devuelve.
          </p>
          <Link href="/gastos">Volver a tus gastos</Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.pagina}>
      {datosDeEjemplo && (
        <p className={styles.ejemplo}>
          Datos de ejemplo: lo que leyó la IA en la prueba con los tickets del equipo. En el ejemplo los cambios no se guardan.
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
            {!ficha.original ? (
              <p className={styles.sinOriginal}>No hemos podido abrir el original. Recarga la página para intentarlo otra vez.</p>
            ) : esPdf ? (
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
            {/* P12 (#18): con datos reales, por el id del documento. */}
            <Link href={`/original/${ficha.documentoId ?? ficha.id}`}>Ver original en grande</Link>
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
            <legend>Concepto y categoría</legend>
            {fila(concepto)}
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
              disabled={falta.length > 0 || editando !== null || guardado.estado === "guardando"}
              onClick={() => encolar("revisada")}
            >
              {guardado.estado === "guardando" ? "Guardando…" : "Guardar como revisada"}
            </button>
            {real && (
              <button
                type="button"
                className={styles.secundaria}
                disabled={editando !== null || guardado.estado === "guardando"}
                onClick={() => encolar("pendiente")}
              >
                Guardar cambios sin marcarla como revisada
              </button>
            )}
            <p role="status" className={styles.estado}>
              {guardado.estado === "guardado" && estado === "revisada" && (real ? "Guardada como revisada." : "Guardada como revisada (en el ejemplo no se guarda de verdad).")}
              {guardado.estado === "guardando" && "Guardando…"}
              {guardado.estado === "guardado" && estado !== "revisada" && "Cambios guardados. Sigue pendiente de revisar."}
              {guardado.estado === "sin-cambios" && estado === "revisada" && "Esta factura ya está revisada."}
            </p>
            {guardado.estado === "error" && (
              <p className={styles.errorCampo} role="alert">
                {guardado.mensaje}
              </p>
            )}

            <div className={styles.secundarias}>
              <button
                type="button"
                className={styles.secundaria}
                disabled={!real || ocupado !== null || editando !== null}
                title={real ? undefined : "En el ejemplo no se puede volver a leer"}
                onClick={() => pedirConfirmacion("confirmar-lectura")}
              >
                {ocupado === "leyendo" ? "Leyendo…" : "Volver a leer con IA"}
              </button>
              <button type="button" className={styles.peligro} disabled={ocupado !== null} onClick={() => pedirConfirmacion("confirmar-borrado")}>
                {ocupado === "borrando" ? "Borrando…" : "Borrar documento"}
              </button>
            </div>
            {errorAccion && (
              <p className={styles.errorCampo} role="alert">
                {errorAccion}
              </p>
            )}

            {estado === "confirmar-lectura" && (
              <div className={styles.confirmar} role="alertdialog" aria-labelledby="titulo-leer">
                <p id="titulo-leer">
                  ¿Volver a leer con IA? Los datos de esta ficha se sustituyen por la nueva lectura, también lo que hayas corregido. No gasta otra lectura de tu plan.
                </p>
                <div className={styles.secundarias}>
                  <button type="button" className={styles.listo} onClick={volverALeer}>
                    Sí, volver a leer
                  </button>
                  <button type="button" className={styles.secundaria} onClick={() => setEstado(antes)}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {estado === "confirmar-borrado" && (
              <div className={styles.confirmar} role="alertdialog" aria-labelledby="titulo-borrar">
                <p id="titulo-borrar">¿Borrar este documento? Se borran el original y sus datos. Borrar no devuelve la lectura gastada.</p>
                <div className={styles.secundarias}>
                  <button type="button" className={styles.peligroLleno} onClick={borrar}>
                    Sí, borrar
                  </button>
                  <button type="button" className={styles.secundaria} onClick={() => setEstado(antes)}>
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
