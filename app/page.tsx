import Link from "next/link";
import { CabeceraPublica, PiePublico } from "@/app/_componentes/Publico";
import styles from "./landing.module.css";

const FUNCIONES = [
  { titulo: "Tres formas de subir", texto: "Haz una foto con el móvil, arrastra un PDF o un ZIP con varios desde el ordenador, o reenvía la factura a tu dirección de Ticketon." },
  { titulo: "Lectura con IA", texto: "Lee la fecha, el emisor, el NIF, las líneas de IVA, el total y la categoría. Tú decides si están bien." },
  { titulo: "El original, siempre guardado", texto: "Cada dato queda enlazado a su ticket o factura, que puedes ver a pantalla completa y descargar." },
  { titulo: "Corrige en dos clics", texto: "Pulsa el dato, escribe el valor bueno y pulsa «Listo». Los dudosos salen marcados para revisar." },
  { titulo: "Avisos antes de entregar", texto: "Documentos repetidos, fechas que pueden estar mal, tickets sin tu NIF y el trimestre a punto de cerrar." },
  { titulo: "En cualquier moneda", texto: "Una factura en dólares o en pesos se pasa a euros con el tipo de cambio oficial del día de la factura." },
  { titulo: "Excel para tu gestoría", texto: "Del mes, del trimestre o del año, con una fila por cada tipo de IVA." },
  { titulo: "En tu móvil como una app", texto: "Añade Ticketon a la pantalla de inicio y sube el ticket en el momento." },
];

const PLANES = [
  { nombre: "Gratis", precio: "0 €", documentos: "Hasta 10 documentos al mes", destacado: false },
  { nombre: "Autónomo", precio: "4,99 €", documentos: "Hasta 100 documentos al mes", destacado: true },
  { nombre: "Autónomo Plus", precio: "8,99 €", documentos: "Hasta 300 documentos al mes", destacado: false },
];

const PREGUNTAS = [
  { pregunta: "¿Ticketon me dice qué gastos puedo deducir?", respuesta: "No. Ticketon organiza tus justificantes y sus datos. Qué se puede deducir lo decide tu gestoría." },
  { pregunta: "¿Y si la IA lee mal un dato?", respuesta: "Puede pasar, sobre todo con tickets arrugados o fotos con poca luz. Por eso siempre ves el original al lado de los datos y lo corriges en dos clics antes de exportar." },
  { pregunta: "¿Qué documentos puedo subir?", respuesta: "Fotos y PDF de tickets y facturas: JPG, PNG, HEIC o PDF, de hasta 10 MB cada uno. También un ZIP con hasta 50 archivos, de hasta 10 MB cada uno." },
  { pregunta: "¿Quién ve mis documentos?", respuesta: "Solo tú. Cada cuenta ve únicamente sus documentos, y se guardan en servidores de la Unión Europea (Fráncfort)." },
  { pregunta: "¿Qué recibe mi gestoría?", respuesta: "Un Excel del periodo con una fila por cada tipo de IVA de cada gasto y una hoja de resumen. Tus originales siguen guardados en Ticketon." },
];

export default function HomePage() {
  return (
    <main className={styles.page}>
      <CabeceraPublica actual="inicio" />
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>MENOS PAPELES. MÁS ORDEN.</p>
          <h1 id="hero-title">Tus tickets y facturas, <em>en orden.</em></h1>
          <p className={styles.lead}>Reúne tus justificantes en un solo sitio, revisa los datos que extraemos y prepara la documentación para tu gestoría sin perseguir papeles a final de mes.</p>
          <div className={styles.actions}>
            <Link href="/registro" className={styles.primary}>Empieza gratis <span aria-hidden="true">→</span></Link>
            <Link href="/precios" className={styles.secondary}>Ver planes</Link>
          </div>
          <p className={styles.micro}>Pensado para autónomos que quieren tener sus gastos organizados.</p>
        </div>
        <div className={styles.preview} aria-label="Ejemplo ilustrativo de un gasto organizado">
          <div className={styles.previewTop}><span>Resumen de gastos</span><span className={styles.dot}>●</span></div>
          <div className={styles.previewMetric}><span>Documentos de este mes</span><strong>24</strong></div>
          <div className={styles.progress}><span /></div>
          <div className={styles.previewRow}><span className={styles.fileIcon}>PDF</span><span><strong>Combustible</strong><small>Factura · 12 oct</small></span><b className={styles.review}>Revisada</b></div>
          <div className={styles.previewRow}><span className={styles.fileIcon}>IMG</span><span><strong>Material de oficina</strong><small>Ticket · 10 oct</small></span><b className={styles.pending}>Pendiente</b></div>
          <div className={styles.previewRow}><span className={styles.fileIcon}>PDF</span><span><strong>Telefonía</strong><small>Factura · 08 oct</small></span><b className={styles.review}>Revisada</b></div>
          <p className={styles.previewFoot}>Vista de ejemplo · Datos ficticios</p>
        </div>
      </section>
      <section className={styles.trust} aria-label="Qué puedes hacer con Ticketon">
        <p>Todo lo que necesitas para preparar tus justificantes</p>
        <div><span>01</span> Guarda tickets y facturas</div>
        <div><span>02</span> Revisa los datos extraídos</div>
        <div><span>03</span> Exporta para tu gestoría</div>
      </section>
      <section id="como-funciona" className={styles.steps}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>ASÍ DE SENCILLO</p>
          <h2>De los papeles a todo en orden.</h2>
          <p>Un proceso claro para que tus justificantes no se queden olvidados en el móvil, el correo o un cajón.</p>
        </div>
        <div className={styles.stepGrid}>
          <article><span>1</span><h3>Sube tus documentos</h3><p>Haz una foto al ticket, añade una imagen o un PDF desde tu dispositivo, o reenvía por correo las facturas que te llegan por email.</p></article>
          <article><span>2</span><h3>Revisa la información</h3><p>Ticketon lee los datos disponibles para ayudarte a organizarlos. Tú puedes revisarlos y corregirlos.</p></article>
          <article><span>3</span><h3>Prepara la entrega</h3><p>Consulta tus gastos y exporta la información del periodo para compartirla con tu gestoría.</p></article>
        </div>
      </section>
      <section id="funciones" className={styles.features} aria-labelledby="titulo-funciones">
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>QUÉ INCLUYE</p>
          <h2 id="titulo-funciones">Todo lo que necesitas para entregar el trimestre.</h2>
          <p>Lo esencial para un autónomo, sin funciones de empresa que no vas a usar.</p>
        </div>
        <div className={styles.featureGrid}>
          {FUNCIONES.map((f) => (
            <article key={f.titulo}>
              <h3>{f.titulo}</h3>
              <p>{f.texto}</p>
            </article>
          ))}
        </div>
      </section>
      <section className={styles.plans} aria-labelledby="titulo-planes">
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>PLANES</p>
          <h2 id="titulo-planes">Empieza gratis y cambia cuando lo necesites.</h2>
          <p>Todos los planes incluyen todas las funciones. Cambia el número de documentos al mes.</p>
        </div>
        <div className={styles.planGrid}>
          {PLANES.map((p) => (
            <article key={p.nombre} className={p.destacado ? styles.planDestacado : undefined}>
              <h3>{p.nombre}</h3>
              <p className={styles.planPrecio}>
                {p.precio}
                <small> / mes</small>
              </p>
              <p>{p.documentos}</p>
            </article>
          ))}
        </div>
        <p className={styles.plansNota}>
          Precios provisionales: la contratación todavía no está habilitada. <Link href="/precios">Comparar planes</Link>
        </p>
      </section>
      <section className={styles.faq} aria-labelledby="titulo-preguntas">
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>PREGUNTAS FRECUENTES</p>
          <h2 id="titulo-preguntas">Lo que suelen preguntarnos.</h2>
        </div>
        <div className={styles.faqList}>
          {PREGUNTAS.map((q) => (
            <details key={q.pregunta}>
              <summary>{q.pregunta}</summary>
              <p>{q.respuesta}</p>
            </details>
          ))}
        </div>
      </section>
      <section className={styles.callout}>
        <div><p className={styles.eyebrow}>EMPIEZA CUANDO QUIERAS</p><h2>Tu documentación, bajo control.</h2><p>Organiza tus justificantes poco a poco y evita dejarlo todo para el último día.</p></div>
        <Link href="/registro" className={styles.primary}>Crear cuenta gratis <span aria-hidden="true">→</span></Link>
      </section>
      <PiePublico />
    </main>
  );
}
