import type { Metadata } from "next";
import { CabeceraPublica, PiePublico } from "@/app/_componentes/Publico";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Política de privacidad | Ticketon",
  description: "Cómo trata Ticketon los datos personales.",
};

export default function PrivacidadPage() {
  return (
    <main className={styles.page}>
      <CabeceraPublica actual="legal" />
      <article className={styles.content}>
        <p className={styles.eyebrow}>DATOS PERSONALES</p>
        <h1>Política de privacidad</h1>
        <p className={styles.updated}>Borrador de trabajo · Última revisión: 03/11/2026</p>
        <div className={styles.draft}><strong>Pendiente de validación jurídica y técnica antes de publicar.</strong> Este texto describe tratamientos previstos y contiene campos pendientes. No debe considerarse definitivo hasta verificar los tratamientos activos, los contratos con proveedores y los plazos de conservación.</div>
        <h2>1. Responsable del tratamiento</h2>
        <ul>
          <li><strong>Responsable:</strong> <span className={styles.placeholder}>[PENDIENTE: nombre o razón social]</span></li>
          <li><strong>NIF:</strong> <span className={styles.placeholder}>[PENDIENTE: NIF]</span></li>
          <li><strong>Domicilio:</strong> <span className={styles.placeholder}>[PENDIENTE: dirección completa]</span></li>
          <li><strong>Contacto de privacidad:</strong> <span className={styles.placeholder}>[PENDIENTE: email]</span></li>
          <li><strong>Delegado de Protección de Datos:</strong> <span className={styles.placeholder}>[PENDIENTE: confirmar si existe o si es obligatorio]</span></li>
        </ul>
        <h2>2. Datos que podemos tratar</h2>
        <ul>
          <li>Datos de cuenta: correo electrónico y datos necesarios para autenticar y proteger el acceso.</li>
          <li>Documentos: imágenes y archivos PDF de tickets y facturas, que pueden contener datos personales y fiscales.</li>
          <li>Datos extraídos o introducidos: fecha, emisor, identificadores fiscales, número de documento, bases y cuotas de IVA, total, moneda, categoría y correcciones del usuario.</li>
          <li>Datos técnicos y de uso necesarios para seguridad y mantenimiento. <span className={styles.placeholder}>[PENDIENTE: inventario exacto de logs, analítica y telemetría]</span></li>
          <li>Datos de suscripción o facturación si se habilitan planes de pago. <span className={styles.placeholder}>[PENDIENTE: proveedor y flujo de pagos; no afirmar cobros activos]</span></li>
        </ul>
        <h2>3. Finalidades y bases jurídicas</h2>
        <p>Las bases deben confirmarse para cada tratamiento. Como esquema de trabajo:</p>
        <ul>
          <li>Crear y mantener la cuenta y prestar las funciones solicitadas: ejecución del contrato o medidas precontractuales solicitadas.</li>
          <li>Almacenar documentos, extraer información, permitir su revisión y exportación: prestación del servicio solicitado y tratamiento conforme a las instrucciones del usuario, según el reparto de roles que corresponda.</li>
          <li>Seguridad, prevención de abusos y mantenimiento: interés legítimo cuando proceda, previa ponderación y documentación.</li>
          <li>Obligaciones legales y gestión de reclamaciones: cumplimiento de obligaciones legales y defensa de reclamaciones cuando corresponda.</li>
          <li>Comunicaciones comerciales: solo si se habilitan y existe una base jurídica válida. <span className={styles.placeholder}>[PENDIENTE: confirmar si existirán]</span></li>
        </ul>
        <h2>4. Documentos de terceros y roles</h2>
        <p>Los documentos incorporados pueden contener datos de proveedores, empleados u otras personas. El usuario debe contar con legitimación para incorporarlos y utilizar el servicio conforme a la normativa aplicable. Ticketon debe limitar el tratamiento a las finalidades del servicio y restringir el acceso a los documentos de cada cuenta.</p>
        <p>La calificación de Ticketon como responsable o encargado depende de la finalidad concreta. Para los documentos que un autónomo incorpora para gestionarlos por su cuenta, el modelo previsto contempla que Ticketon actúe como encargado, sujeto al acuerdo correspondiente. Esta asignación debe confirmarse jurídicamente.</p>
        <h2>5. Proveedores y destinatarios</h2>
        <p>Se prevé utilizar proveedores tecnológicos. La selección definitiva, sus subencargados, ubicaciones, plazos y contratos deben verificarse antes de procesar documentos personales reales.</p>
        <ul>
          <li><strong>Supabase:</strong> autenticación, base de datos y almacenamiento. El proyecto está configurado en Fráncfort; esto no acredita que todos los tratamientos auxiliares ocurran exclusivamente en la UE.</li>
          <li><strong>Vercel:</strong> alojamiento y ejecución de la aplicación. Deben confirmarse plan, condiciones contractuales, registros y ubicaciones efectivas.</li>
          <li><strong>Proveedor OCR/IA (Gemini):</strong> lectura de documentos. No utilizar el plan gratuito con documentos personales reales; deben validarse modalidad contractual, retención, entrenamiento, región y transferencias.</li>
          <li><strong>Resend:</strong> proveedor previsto para correo. Su uso y el tratamiento de contenido y adjuntos deben confirmarse antes de activar la recepción por email.</li>
        </ul>
        <p><span className={styles.placeholder}>[PENDIENTE: completar proveedores realmente activos, roles, acuerdos, subencargados y transferencias internacionales]</span>. No se prevén cesiones comerciales de datos personales a terceros.</p>
        <h2>6. Conservación</h2>
        <p>Los datos se conservarán durante el tiempo necesario para prestar el servicio y mientras la cuenta permanezca activa, conforme a la política definitiva. Algunos datos podrán mantenerse bloqueados durante los plazos necesarios para cumplir obligaciones legales o atender responsabilidades. <span className={styles.placeholder}>[PENDIENTE: definir plazos por categoría, cierre de cuenta, copias de seguridad y borrado]</span>.</p>
        <h2>7. Derechos</h2>
        <p>La persona interesada puede solicitar acceso, rectificación, supresión, oposición, limitación y portabilidad cuando proceda, así como retirar un consentimiento sin efectos retroactivos cuando el tratamiento se base en él.</p>
        <p>Puede dirigirse a <span className={styles.placeholder}>[PENDIENTE: email de privacidad]</span>. También puede reclamar ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es/" target="_blank" rel="noreferrer">www.aepd.es</a>).</p>
        <h2>8. Seguridad</h2>
        <p>Se deben aplicar medidas adecuadas al riesgo: control de acceso, aislamiento de documentos por cuenta, almacenamiento privado, protección de credenciales, gestión de secretos, copias de seguridad y procedimientos de incidentes. Su implantación y eficacia deben comprobarse; este texto no constituye una certificación de seguridad.</p>
        <h2>9. Menores</h2>
        <p>Ticketon está dirigido a personas que utilizan el servicio en un contexto profesional o empresarial y no está diseñado para menores. <span className={styles.placeholder}>[PENDIENTE: fijar y validar la política de edad y registro]</span>.</p>
        <h2>10. Cambios</h2>
        <p>La política se actualizará cuando cambien las funciones, proveedores o tratamientos. Se indicará la fecha de actualización y, cuando corresponda, se informará a las personas usuarias.</p>
      </article>
      <PiePublico />
    </main>
  );
}
