"use client";

// Pantalla P13 · Exportar para la gestoría (#23).
// Decisiones: issue #23 (formato del Excel), mapa de pantallas #54 (DP6: se
// exporta con avisos; DP7: el cierre de trimestre se ve bloqueado en Gratis).

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "./exportar.module.css";
import {
  etiquetaDelPeriodo,
  filtrarPorPeriodo,
  generarExcel,
  resumenDe,
  type FacturaExportable,
  type Periodo,
} from "@/lib/exportacion/excel";
import { avisoTrimestre, trimestreDe } from "@/lib/avisos/trimestre";

export type Plan = "gratis" | "autonomo" | "plus";

type Props = {
  facturas: FacturaExportable[];
  titular: string;
  plan: Plan;
  /** Fecha de hoy, AAAA-MM-DD. Si no se pasa, la del navegador. */
  hoy?: string;
  /** Muestra la franja "Datos de ejemplo" mientras no haya datos reales. */
  datosDeEjemplo?: boolean;
};

type TipoPeriodo = Periodo["tipo"];
type EstadoDescarga = "listo" | "preparando" | "descargado" | "error";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const TIPOS: { valor: TipoPeriodo; texto: string }[] = [
  { valor: "mes", texto: "Mes" },
  { valor: "trimestre", texto: "Trimestre" },
  { valor: "anio", texto: "Año" },
];

const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

function hoyLocal(): string {
  const d = new Date();
  const dos = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

function plural(n: number, uno: string, varios: string): string {
  return `${n} ${n === 1 ? uno : varios}`;
}

export default function Exportar({ facturas, titular, plan, hoy, datosDeEjemplo = false }: Props) {
  const fechaHoy = hoy ?? hoyLocal();
  const actual = trimestreDe(fechaHoy);
  const mesActual = Number(fechaHoy.slice(5, 7));

  // Por defecto, el trimestre en curso (prompt 6 corregido).
  const [tipo, setTipo] = useState<TipoPeriodo>("trimestre");
  const [anio, setAnio] = useState(actual.anio);
  const [trimestre, setTrimestre] = useState(actual.trimestre);
  const [mes, setMes] = useState(mesActual);
  const [estado, setEstado] = useState<EstadoDescarga>("listo");

  const periodo: Periodo =
    tipo === "mes" ? { tipo, anio, mes } : tipo === "trimestre" ? { tipo, anio, trimestre } : { tipo, anio };

  const anios = useMemo(() => {
    const conjunto = new Set<number>([actual.anio]);
    for (const f of facturas) if (f.fecha) conjunto.add(Number(f.fecha.slice(0, 4)));
    return [...conjunto].sort((a, b) => b - a);
  }, [facturas, actual.anio]);

  const { incluidas, sinFecha } = filtrarPorPeriodo(facturas, periodo);
  const resumen = resumenDe(incluidas);
  const duplicados = incluidas.filter((f) => f.posibleDuplicado).length;
  // Aviso neutral: los tickets no suelen llevar el NIF del receptor. No bloquea.
  const sinNifReceptor = incluidas.filter((f) => !f.receptorNif?.trim()).length;
  const pendientes = resumen.pendientesDeRevisar;
  const conversiones = resumen.conversionesPendientes;
  const hayAvisos = pendientes + duplicados + conversiones > 0;
  const primeraConAviso = incluidas.find(
    (f) => f.estadoRevision === "pendiente" || f.posibleDuplicado || (f.moneda !== "EUR" && f.totalEur === null),
  );
  const aviso = avisoTrimestre(fechaHoy);

  function cambiarPeriodo(accion: () => void) {
    accion();
    setEstado("listo");
  }

  function descargar() {
    setEstado("preparando");
    try {
      const { nombre, contenido } = generarExcel(facturas, { periodo, titular, fechaExportacion: fechaHoy });
      const blob = new Blob([contenido as Uint8Array<ArrayBuffer>], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = nombre;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setEstado("descargado");
    } catch {
      setEstado("error");
    }
  }

  return (
    <main className={styles.pagina}>
      <div className={styles.contenido}>
        {datosDeEjemplo && (
          <p className={styles.ejemplo}>
            Datos de ejemplo: son los tickets de prueba del equipo. Se cambiarán por tus gastos cuando la cuenta esté
            conectada.
          </p>
        )}

        <header className={styles.cabecera}>
          <h1 className={styles.titulo}>Exportar para la gestoría</h1>
          <p className={styles.explicacion}>
            Descarga un Excel con los gastos del periodo y envíaselo a tu gestoría. Ticketon no envía nada por ti.
          </p>
        </header>

        {aviso && (
          <p className={styles.avisoTrimestre} role="note">
            {aviso.texto}
          </p>
        )}

        <section className={styles.tarjeta} aria-labelledby="titulo-periodo">
          <h2 id="titulo-periodo" className={styles.subtitulo}>
            Periodo
          </h2>

          <div className={styles.selectorTipo} role="radiogroup" aria-label="Tipo de periodo">
            {TIPOS.map((t) => (
              <button
                key={t.valor}
                type="button"
                role="radio"
                aria-checked={tipo === t.valor}
                className={tipo === t.valor ? styles.opcionActiva : styles.opcion}
                onClick={() => cambiarPeriodo(() => setTipo(t.valor))}
              >
                {t.texto}
              </button>
            ))}
          </div>

          <div className={styles.campos}>
            {tipo === "mes" && (
              <label className={styles.campo}>
                <span>Mes</span>
                <select value={mes} onChange={(e) => cambiarPeriodo(() => setMes(Number(e.target.value)))}>
                  {MESES.map((nombre, i) => (
                    <option key={nombre} value={i + 1}>
                      {nombre}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {tipo === "trimestre" && (
              <label className={styles.campo}>
                <span>Trimestre</span>
                <select value={trimestre} onChange={(e) => cambiarPeriodo(() => setTrimestre(Number(e.target.value)))}>
                  <option value={1}>1.º (enero a marzo)</option>
                  <option value={2}>2.º (abril a junio)</option>
                  <option value={3}>3.º (julio a septiembre)</option>
                  <option value={4}>4.º (octubre a diciembre)</option>
                </select>
              </label>
            )}
            <label className={styles.campo}>
              <span>Año</span>
              <select value={anio} onChange={(e) => cambiarPeriodo(() => setAnio(Number(e.target.value)))}>
                {anios.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className={styles.tarjeta} aria-labelledby="titulo-resumen">
          <h2 id="titulo-resumen" className={styles.subtitulo}>
            {etiquetaDelPeriodo(periodo)}
          </h2>

          {incluidas.length === 0 ? (
            <p className={styles.vacio}>No hay gastos en este periodo.</p>
          ) : (
            <>
              <dl className={styles.cifras}>
                <div>
                  <dt>Documentos</dt>
                  <dd>{resumen.documentos}</dd>
                </div>
                <div>
                  <dt>Total en euros</dt>
                  <dd>{euros.format(resumen.totalEur)}</dd>
                </div>
                <div>
                  <dt>Sin tus datos fiscales</dt>
                  <dd>{sinNifReceptor}</dd>
                </div>
                <div>
                  <dt>Pendientes de revisar</dt>
                  <dd>{pendientes}</dd>
                </div>
              </dl>

              <table className={styles.tabla}>
                <caption className={styles.oculto}>IVA del periodo por tipo</caption>
                <thead>
                  <tr>
                    <th scope="col">Tipo de IVA</th>
                    <th scope="col">Base</th>
                    <th scope="col">Cuota</th>
                  </tr>
                </thead>
                <tbody>
                  {resumen.porTipoIva.map((l) => (
                    <tr key={l.tipoIva}>
                      <th scope="row">{l.tipoIva} %</th>
                      <td>{euros.format(l.base)}</td>
                      <td>{euros.format(l.cuota)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {sinFecha.length > 0 && (
            <p className={styles.nota}>
              {plural(sinFecha.length, "documento no tiene", "documentos no tienen")} fecha y no entra en ningún periodo.
              Ponle la fecha en «Revisar y corregir».
            </p>
          )}

          {incluidas.length > 0 && hayAvisos && (
            <div className={styles.alerta} role="alert">
              <p className={styles.alertaTitulo}>Hay documentos que conviene revisar antes de enviar</p>
              <ul>
                {pendientes > 0 && <li>{plural(pendientes, "pendiente de revisar", "pendientes de revisar")}</li>}
                {duplicados > 0 && <li>{plural(duplicados, "posible duplicado", "posibles duplicados")}</li>}
                {conversiones > 0 && (
                  <li>
                    {plural(conversiones, "conversión pendiente", "conversiones pendientes")}: no suman al total en
                    euros
                  </li>
                )}
              </ul>
              <p>
                Se exportan igualmente, con su estado y sus avisos en el Excel.{" "}
                {primeraConAviso && <Link href={`/revisar/${primeraConAviso.id}`}>Revisarlos</Link>}
              </p>
            </div>
          )}

          {incluidas.length > 0 && (
            <>
              <details className={styles.detalle}>
                <summary>Qué lleva el Excel</summary>
                <p>
                  Una fila por cada tipo de IVA de cada documento, con fecha, número, emisor y su NIF, NIF del receptor,
                  categoría, tipo de IVA, base y cuota en euros, retención, total, moneda original y tipo de cambio,
                  estado, avisos y nombre del archivo original. Una segunda hoja resume el periodo por tipo de IVA.
                </p>
              </details>

              <div className={styles.acciones}>
                <button type="button" className={styles.principal} onClick={descargar} disabled={estado === "preparando"}>
                  {estado === "preparando" ? "Preparando el Excel…" : hayAvisos ? "Descargar igualmente" : "Descargar Excel"}
                </button>
                <p className={styles.estado} role="status">
                  {estado === "descargado" && "Excel descargado. Lo tienes en tu carpeta de descargas."}
                  {estado === "error" && (
                    <>
                      No se ha podido preparar el Excel.{" "}
                      <button type="button" className={styles.enlace} onClick={descargar}>
                        Inténtalo de nuevo
                      </button>
                    </>
                  )}
                </p>
              </div>
            </>
          )}
        </section>

        <section className={plan === "gratis" ? styles.cierreBloqueado : styles.cierre} aria-labelledby="titulo-cierre">
          <h2 id="titulo-cierre" className={styles.subtitulo}>
            Prepara tu entrega a la gestoría
          </h2>
          <p>
            Repasa los pendientes del trimestre, mira el resumen y descarga un paquete con el Excel y los originales
            ordenados.
          </p>
          {plan === "gratis" ? (
            <p>
              Disponible en los planes Autónomo y Autónomo Plus. <Link href="/precios">Ver planes</Link>
            </p>
          ) : (
            <Link className={styles.secundario} href="/cierre-trimestre">
              Abrir el cierre de trimestre
            </Link>
          )}
        </section>

        <p className={styles.pie}>Qué gastos se pueden deducir lo decide tu gestoría.</p>
      </div>
    </main>
  );
}
