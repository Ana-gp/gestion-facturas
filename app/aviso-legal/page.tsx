import type { Metadata } from "next";
import { CabeceraPublica, PiePublico } from "@/app/_componentes/Publico";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Aviso legal | Ticketon",
  description: "Datos del titular de Ticketon y condiciones de uso del sitio.",
};

export default function AvisoLegalPage() {
  return (
    <main className={styles.page}>
      <CabeceraPublica actual="legal" />
      <article className={styles.content}>
        <p className={styles.eyebrow}>INFORMACIÓN LEGAL</p>
        <h1>Aviso legal</h1>
        <p className={styles.updated}>Borrador de trabajo · Última revisión: 03/11/2026</p>
        <div className={styles.draft}><strong>Pendiente de completar y validar antes de publicar.</strong> Ticketon no debe mostrar este texto como aviso legal definitivo hasta sustituir todos los campos pendientes y comprobar los datos registrales y de contacto del prestador.</div>
        <h2>1. Titular del sitio web</h2>
        <p>En cumplimiento del artículo 10 de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), se informa de los datos identificativos del titular:</p>
        <ul>
          <li><strong>Titular / razón social:</strong> <span className={styles.placeholder}>[PENDIENTE: nombre o razón social]</span></li>
          <li><strong>NIF:</strong> <span className={styles.placeholder}>[PENDIENTE: NIF]</span></li>
          <li><strong>Domicilio social:</strong> <span className={styles.placeholder}>[PENDIENTE: dirección completa]</span></li>
          <li><strong>Datos registrales:</strong> <span className={styles.placeholder}>[PENDIENTE: registro, tomo, folio, hoja e inscripción, si procede]</span></li>
          <li><strong>Correo electrónico de contacto:</strong> <span className={styles.placeholder}>[PENDIENTE: email de contacto]</span></li>
        </ul>
        <h2>2. Objeto y actividad</h2>
        <p>Ticketon es un servicio digital orientado a ayudar a autónomos y pequeños negocios a reunir y organizar tickets y facturas, revisar la información extraída de esos documentos y preparar exportaciones para compartir con su gestoría.</p>
        <p>La descripción anterior deberá ajustarse a las funciones que estén realmente disponibles en la versión publicada.</p>
        <h2>3. Condiciones de uso</h2>
        <p>La persona usuaria se compromete a utilizar el sitio y sus funcionalidades de forma lícita, sin perjudicar los derechos de terceros ni intentar acceder a cuentas, documentos o sistemas ajenos.</p>
        <p>Las condiciones completas de registro, uso, contratación, cancelación y soporte deberán recogerse en las condiciones del servicio correspondientes antes de ofrecer suscripciones de pago.</p>
        <h2>4. Propiedad intelectual e industrial</h2>
        <p>Los elementos del sitio —incluidos diseño, textos, marcas, logotipos y software— estarán protegidos por la normativa aplicable. <span className={styles.placeholder}>[PENDIENTE: identificar titularidad y licencias de los elementos utilizados]</span>. No se permite su reproducción o explotación sin autorización, salvo en los casos legalmente permitidos.</p>
        <h2>5. Responsabilidad y alcance del servicio</h2>
        <p>Ticketon facilita la organización de justificantes, la lectura automatizada de datos y la preparación de exportaciones. La lectura automática puede contener errores u omisiones y debe ser revisada por la persona usuaria.</p>
        <p>Ticketon no determina la deducibilidad fiscal de los gastos, no sustituye el asesoramiento de una gestoría y, en el alcance previsto del MVP, no presenta impuestos ni lleva la contabilidad oficial del usuario.</p>
        <h2>6. Enlaces y disponibilidad</h2>
        <p>Los enlaces a sitios de terceros se ofrecen, en su caso, con finalidad informativa. El titular no controla sus contenidos ni sus políticas. Se procurará mantener el servicio disponible, sin garantizar la ausencia de interrupciones técnicas.</p>
        <h2>7. Legislación aplicable</h2>
        <p>Este sitio se regirá por la legislación española y de la Unión Europea que resulte aplicable, sin perjuicio de las normas imperativas de protección de consumidores y usuarios cuando correspondan.</p>
        <h2>8. Contacto</h2>
        <p>Para consultas relacionadas con este sitio: <span className={styles.placeholder}>[PENDIENTE: email de contacto]</span>.</p>
      </article>
      <PiePublico />
    </main>
  );
}
