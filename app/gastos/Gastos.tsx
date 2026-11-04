"use client";

// P07 · Mis gastos (#30). Diseño unificado del equipo, tableros "Gastos" y
// "GastosMovil": cifras arriba (pendientes, duplicados y este trimestre),
// lista por fecha de la factura y filtros por estado.

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "./gastos.module.css";
import { resumenMensual, compararMeses } from "@/lib/gastos/panel";
import {
  TEXTO_AVISO,
  TEXTO_ESTADO,
  accionDe,
  cifrasDelTrimestre,
  clavePeriodo,
  contar,
  cumpleFiltro,
  enPeriodo,
  etiquetaPeriodo,
  ordenar,
  periodosConDocumentos,
  type Filtro,
  type GastoListado,
} from "@/lib/gastos/listado";

type Props = {
  gastos: GastoListado[];
  /** Con datos de ejemplo, solo algunos tickets tienen ficha para abrir. */
  idsConFicha?: string[];
  datosDeEjemplo?: boolean;
  /** Fecha de hoy, AAAA-MM-DD. Si no se pasa, la del navegador. */
  hoy?: string;
  error?: string;
};

const FILTROS: { valor: Filtro; texto: string }[] = [
  { valor: "todos", texto: "Todos" },
  { valor: "pendientes", texto: "Pendientes" },
  { valor: "avisos", texto: "Con avisos" },
  { valor: "revisadas", texto: "Revisadas" },
];

const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

function hoyLocal(): string {
  const d = new Date();
  const dos = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

function fechaCorta(iso: string | null): string {
  if (!iso) return "Sin fecha";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

function importe(g: GastoListado): string {
  if (g.totalEur !== null) return euros.format(g.totalEur);
  if (g.total !== null) return new Intl.NumberFormat("es-ES", { style: "currency", currency: g.moneda }).format(g.total);
  return "—";
}

function plural(n: number, uno: string, varios: string): string {
  return `${n} ${n === 1 ? uno : varios}`;
}

export default function Gastos({ gastos, idsConFicha, datosDeEjemplo = false, hoy, error }: Props) {
  const fechaHoy = hoy ?? hoyLocal();
  const ordenados = useMemo(() => ordenar(gastos), [gastos]);
  const periodos = useMemo(() => periodosConDocumentos(gastos), [gastos]);
  const claveHoy = clavePeriodo(fechaHoy);

  // Por defecto, el trimestre en curso; si no tiene documentos, todos.
  const [periodo, setPeriodo] = useState(periodos.includes(claveHoy) ? claveHoy : "todos");
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const delPeriodo = ordenados.filter((g) => enPeriodo(g, periodo));
  const cuentas = contar(delPeriodo);
  const visibles = delPeriodo.filter((g) => cumpleFiltro(g, filtro));
  // Las cifras de arriba siguen al periodo elegido, igual que la lista.
  const duplicados = delPeriodo.filter((g) => g.avisos.includes("duplicado")).length;
  const trimestre = cifrasDelTrimestre(ordenados, fechaHoy);
  const resumenMes = resumenMensual(gastos, fechaHoy);
  const resumenAnterior = resumenMensual(gastos, `${resumenMes.anterior}-01`);
  const comparacionMes = compararMeses(resumenMes, resumenAnterior);
  const sinNif = visibles.filter((g) => g.sinNifReceptor).length;
  const conFicha = idsConFicha ? (id: string) => idsConFicha.includes(id) : undefined;
  const primerPendiente = delPeriodo.find((g) => g.estado !== "revisada" && accionDe(g, conFicha));
  const primerDuplicado = delPeriodo.find((g) => g.avisos.includes("duplicado") && accionDe(g, conFicha));

  return (
    <div className={styles.marco}>

      <main className={styles.pagina}>
        <div className={styles.contenido}>
          {datosDeEjemplo && (
            <p className={styles.ejemplo}>
              Modo de prueba: son los tickets de prueba del equipo, no los tuyos. Entra con tu cuenta para ver tus gastos.
            </p>
          )}

          <header className={styles.cabecera}>
            <div>
              <h1 className={styles.titulo}>Mis gastos</h1>
              <p className={styles.explicacion}>Tus tickets y facturas, con su original guardado.</p>
            </div>
            <Link href="/subir" className={styles.subir}>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V4" />
                <path d="M7 9l5-5 5 5" />
                <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
              </svg>
              Subir justificante
            </Link>
          </header>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          {!error && gastos.length === 0 && (
            <section className={styles.vacio}>
              <h2>Todavía no has subido ningún justificante</h2>
              <p>Haz una foto del ticket o sube el PDF de la factura. Ticketon lee los datos y guarda el original.</p>
              <Link href="/subir" className={styles.subir}>
                Subir el primero
              </Link>
            </section>
          )}

          {gastos.length > 0 && (
            <>
              <PanelMensual resumen={resumenMes} comparacion={comparacionMes} />

              <div className={styles.cifras}>
                <CifraEnlace
                  titulo="Pendientes de revisar"
                  valor={cuentas.pendientes}
                  pie={cuentas.pendientes > 0 ? "Compruébalos antes de exportar" : "Todo revisado"}
                  href={primerPendiente ? accionDe(primerPendiente, conFicha)?.href : undefined}
                  destacada={cuentas.pendientes > 0}
                />
                <CifraEnlace
                  titulo="Posibles duplicados"
                  valor={duplicados}
                  pie={duplicados > 0 ? "Compara y decide si sobra uno" : "Ninguno"}
                  href={primerDuplicado ? accionDe(primerDuplicado, conFicha)?.href : undefined}
                  destacada={duplicados > 0}
                />
                <div className={styles.cifra}>
                  <span className={styles.cifraTitulo}>Este trimestre</span>
                  <span className={styles.cifraValor}>{euros.format(trimestre.totalEur)}</span>
                  <span className={styles.cifraPie}>
                    {plural(trimestre.documentos, "documento", "documentos")} con su original
                    {trimestre.sinConvertir > 0 && ` · ${trimestre.sinConvertir} sin convertir a euros`}
                  </span>
                </div>
              </div>

              <section className={styles.lista} aria-labelledby="titulo-lista">
                <div className={styles.listaCabecera}>
                  <div className={styles.periodo}>
                    <h2 id="titulo-lista" className={styles.oculto}>
                      Documentos: {etiquetaPeriodo(periodo)}
                    </h2>
                    <label className={styles.selector}>
                      <span className={styles.oculto}>Periodo</span>
                      <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
                        {periodos
                          .filter((p) => p !== "sin-fecha")
                          .map((p) => (
                            <option key={p} value={p}>
                              {etiquetaPeriodo(p)}
                            </option>
                          ))}
                        <option value="todos">{etiquetaPeriodo("todos")}</option>
                      </select>
                    </label>
                  </div>
                  <div role="group" aria-label="Filtrar por estado" className={styles.filtros}>
                    {FILTROS.map((f) => (
                      <button
                        key={f.valor}
                        type="button"
                        aria-pressed={filtro === f.valor}
                        className={filtro === f.valor ? styles.filtroActivo : styles.filtro}
                        onClick={() => setFiltro(f.valor)}
                      >
                        {f.texto} ({cuentas[f.valor]})
                      </button>
                    ))}
                  </div>
                </div>

                {visibles.length === 0 ? (
                  <p className={styles.nada}>No hay documentos con este filtro en este periodo.</p>
                ) : (
                  <table className={styles.tabla}>
                    <thead>
                      <tr>
                        <th scope="col">Fecha</th>
                        <th scope="col">Emisor</th>
                        <th scope="col">Categoría</th>
                        <th scope="col" className={styles.derecha}>
                          Total
                        </th>
                        <th scope="col">Estado</th>
                        <th scope="col" className={styles.derecha}>
                          <span className={styles.oculto}>Acción</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibles.map((g) => (
                        <Fila key={g.id} gasto={g} conFicha={conFicha} />
                      ))}
                    </tbody>
                  </table>
                )}

                {sinNif > 0 && (
                  <p className={styles.nota}>
                    {sinNif === visibles.length
                      ? `${visibles.length === 1 ? "Es un ticket" : `Los ${visibles.length} son tickets`} sin NIF del receptor.`
                      : `${sinNif} de ${visibles.length} ${sinNif === 1 ? "no lleva" : "no llevan"} el NIF del receptor.`}{" "}
                    Es normal en un ticket: tu gestoría te dirá si necesita una factura completa de alguno.
                  </p>
                )}
              </section>

              <p className={styles.pieLista}>
                Ordenados por fecha de la factura, el más reciente arriba. Los que aún no tienen fecha salen primero. Qué gastos se pueden deducir lo decide tu gestoría.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function CifraEnlace({ titulo, valor, pie, href, destacada }: { titulo: string; valor: number; pie: string; href?: string; destacada: boolean }) {
  const contenido = (
    <>
      <span className={destacada ? styles.cifraTituloAviso : styles.cifraTitulo}>{titulo}</span>
      <span className={styles.cifraValor}>{valor}</span>
      <span className={styles.cifraPie}>{pie}</span>
    </>
  );
  const clase = destacada ? styles.cifraAviso : styles.cifra;
  return href ? (
    <Link href={href} className={clase}>
      {contenido}
    </Link>
  ) : (
    <div className={clase}>{contenido}</div>
  );
}

function Fila({ gasto: g, conFicha }: { gasto: GastoListado; conFicha?: (id: string) => boolean }) {
  const accion = accionDe(g, conFicha);
  const pendiente = g.estado !== "revisada";
  return (
    <tr className={pendiente ? styles.filaPendiente : undefined}>
      <td data-columna="Fecha" className={styles.fecha}>
        {fechaCorta(g.fecha)}
      </td>
      <td data-columna="Emisor" className={styles.emisor}>
        {g.emisor ?? g.nombreArchivo ?? "Documento sin leer"}
      </td>
      <td data-columna="Categoría" className={styles.categoria}>
        {g.categoria ?? "—"}
      </td>
      <td data-columna="Total" className={styles.total}>
        {importe(g)}
      </td>
      <td data-columna="Estado" className={styles.estado}>
        <div className={styles.etiquetas}>
        <span className={g.estado === "revisada" ? styles.etiquetaBien : styles.etiquetaAviso}>{TEXTO_ESTADO[g.estado]}</span>
        {g.avisos
          .filter((a) => a !== "error-lectura")
          .map((a) => (
            <span key={a} className={styles.etiquetaAviso}>
              {TEXTO_AVISO[a]}
            </span>
          ))}
        {g.llegoPorCorreo && <span className={styles.etiquetaNeutra}>Llegó por correo</span>}
        </div>
      </td>
      <td data-columna="" className={styles.accion}>
        {accion ? (
          <Link href={accion.href} className={pendiente ? styles.accionFuerte : undefined} aria-label={`${accion.texto}: ${g.emisor ?? "documento"} del ${fechaCorta(g.fecha)}`}>
            {accion.texto}
          </Link>
        ) : (
          <span className={styles.sinAccion}>Sin ficha de ejemplo</span>
        )}
      </td>
    </tr>
  );
}

type PanelMensualProps = {
  resumen: ReturnType<typeof resumenMensual>;
  comparacion: ReturnType<typeof compararMeses>;
};

function nombreMes(clave: string): string {
  const [anio, mes] = clave.split("-").map(Number);
  return new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(anio, mes - 1, 1)));
}

function PanelMensual({ resumen, comparacion }: PanelMensualProps) {
  const anterior = nombreMes(resumen.anterior);
  const variacion = comparacion.porcentaje;
  const descripcionVariacion =
    variacion === null
      ? "Sin base de comparación"
      : variacion > 0
        ? `${Math.abs(variacion).toFixed(1).replace(".", ",")}% más que en ${anterior}`
        : variacion < 0
          ? `${Math.abs(variacion).toFixed(1).replace(".", ",")}% menos que en ${anterior}`
          : `Igual que en ${anterior}`;

  return (
    <section className={styles.panelMensual} aria-labelledby="titulo-panel-mensual">
      <div className={styles.panelCabecera}>
        <div>
          <h2 id="titulo-panel-mensual">Resumen del mes</h2>
          <p>{nombreMes(resumen.clave)}</p>
        </div>
      </div>

      <div className={styles.panelIndicadores}>
        <article className={styles.panelIndicador}>
          <span>Gasto registrado</span>
          <strong>{euros.format(resumen.totalEur)}</strong>
          <small>
            {resumen.documentos} {resumen.documentos === 1 ? "documento" : "documentos"}
            {resumen.sinConvertir > 0 ? ` · ${resumen.sinConvertir} sin convertir a euros` : ""}
            {resumen.sinImporte > 0 ? ` · ${resumen.sinImporte} sin importe` : ""}
          </small>
        </article>
        <article className={styles.panelIndicador}>
          <span>Comparación con {anterior}</span>
          <strong className={comparacion.diferenciaEur > 0 ? styles.variacionSube : comparacion.diferenciaEur < 0 ? styles.variacionBaja : undefined}>
            {comparacion.diferenciaEur > 0 ? "+" : comparacion.diferenciaEur < 0 ? "−" : ""}
            {euros.format(Math.abs(comparacion.diferenciaEur))}
          </strong>
          <small>{descripcionVariacion}</small>
        </article>
      </div>

      <div className={styles.panelCategorias}>
        <h3>Gasto por categoría</h3>
        {resumen.categorias.length === 0 ? (
          <p className={styles.panelSinDatos}>Todavía no hay importes en euros para desglosar este mes.</p>
        ) : (
          <ul>
            {resumen.categorias.map((categoria) => (
              <li key={categoria.nombre}>
                <div className={styles.categoriaLinea}>
                  <span>{categoria.nombre}</span>
                  <strong>{euros.format(categoria.totalEur)}</strong>
                </div>
                <div
                  className={styles.barraFondo}
                  role="progressbar"
                  aria-label={`${categoria.nombre}: ${categoria.porcentaje.toFixed(1)} por ciento del gasto`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(categoria.porcentaje)}
                >
                  <span style={{ width: `${categoria.porcentaje}%` }} />
                </div>
                <small>{categoria.documentos} {categoria.documentos === 1 ? "documento" : "documentos"} · {categoria.porcentaje.toFixed(1).replace(".", ",")}%</small>
              </li>
            ))}
          </ul>
        )}
      </div>

      {resumen.posiblesDuplicados > 0 && (
        <p className={styles.panelAviso}>
          {resumen.posiblesDuplicados} {resumen.posiblesDuplicados === 1 ? "documento tiene" : "documentos tienen"} posible duplicado. Se mantienen en el cálculo hasta que confirmes si realmente lo son.
        </p>
      )}
    </section>
  );
}
