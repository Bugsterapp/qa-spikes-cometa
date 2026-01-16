import Head from 'next/head';

export default function Terms() {
  const inaiWeb = 'www.inai.org.mx';
  const cometaWeb = 'www.getcometa.com';
  return (
    <>
      <Head>
        <title>Términos y condiciones</title>
      </Head>
      <div className="min-h-screen px-6 py-4 mx-auto text-justify max-w-7xl">
        <h5 className="text-[#14208c] mb-5 text-center text-2xl">AVISO DE PRIVACIDAD INTEGRAL</h5>
        <p>
          SERVICIOS ESTRATÉGICOS CMH, S.A.P.I. DE C.V. (en adelante "COMETA"), con domicilio en Plaza Villa de Madrid 1,
          colonia Roma Norte, Cuauhtémoc, Ciudad de México, México, 06700, es responsable del tratamiento de los datos
          personales que recaba, conforme a lo dispuesto en la Ley Federal de Protección de Datos Personales en Posesión
          de los Particulares (la "Ley"), su Reglamento y demás normatividad aplicable.
        </p>
        <p className="font-bold">1. Datos que se recaban</p>
        <p>
          COMETA podrá recabar los siguientes datos personales, de manera directa o indirecta, necesarios para el
          cumplimiento de las obligaciones legales y contractuales con usted o con la persona moral que usted
          represente:
        </p>
        <ol type="a">
          <li>Datos identificativos;</li>
          <li>Datos de contacto y electrónicos;</li>
          <li>Datos fiscales; y</li>
          <li>Datos bancarios.</li>
        </ol>
        <p>
          Adicionalmente, debido a la naturaleza de nuestros servicios de gestión de pagos para instituciones
          educativas, podremos recabar:
        </p>
        <ol type="a">
          <li>
            Datos de identificación de su hijo, hija o persona menor de edad sobre la cual tenga la patria potestad o
            tutela.
          </li>
          <li>Datos de la institución educativa en la que recibe los servicios académicos.</li>
        </ol>
        <p>
          Estos datos serán utilizados exclusivamente para identificar el vínculo académico y las obligaciones de pago
          correspondientes. COMETA no recabará datos personales sensibles, en términos de la Ley.
        </p>
        <p className="font-bold">2. Finalidades del tratamiento</p>
        <p>Finalidades primarias:</p>
        <p>
          Los datos personales serán tratados para las siguientes finalidades que son necesarias para el cumplimiento de
          la relación jurídica entre usted y COMETA:
        </p>
        <ol type="a">
          <li>Generar registros y crear enlaces personalizados para la emisión de comprobantes de pago.</li>
          <li>Gestionar el cobro de obligaciones mediante el portal de pagos en nuestro sitio web.</li>
          <li>
            Establecer contacto por medios electrónicos, telefónicos o digitales (correo electrónico, SMS, WhatsApp,
            llamadas) para notificar sobre adeudos o enviar recordatorios de pago.
          </li>
          <li>Emitir y enviar comprobantes fiscales digitales.</li>
          <li>Crear expedientes virtuales y bases de datos relacionadas con la gestión de pagos.</li>
          <li>Cumplir con requerimientos legales aplicables.</li>
          <li>Ejecutar acciones legales tendientes a garantizar el cumplimiento de obligaciones de pago.</li>
        </ol>
        <p>
          En caso de que COMETA identifique indicios razonables o evidencias de una posible operación fraudulenta por
          parte del tutor, representante o usuario del portal, se procederá a la suspensión o cancelación del acceso a
          la plataforma, y se notificará de manera inmediata a la institución educativa correspondiente.
        </p>
        <p>Finalidades secundarias:</p>
        <ol type="i">
          <li>Actividades de mercadotecnia, publicidad y prospección comercial.</li>
          <li>Elaboración de estudios estadísticos o de mercado.</li>
          <li>Evaluación de nuestros productos y servicios.</li>
        </ol>
        <p>
          Usted podrá manifestar su negativa a estas finalidades siguiendo el procedimiento indicado en el apartado
          correspondiente.
        </p>
        <p className="font-bold">3. Medidas de seguridad</p>
        <p>
          COMETA protege sus datos personales mediante medidas de seguridad físicas, técnicas y administrativas conforme
          a lo establecido en la Ley, con el objetivo de evitar el acceso no autorizado, pérdida, alteración,
          destrucción o uso indebido de los mismos.
        </p>
        <p className="font-bold">4. Limitación del uso o divulgación de los datos personales</p>
        <p>
          Usted podrá limitar el uso o divulgación de sus datos personales, especialmente en lo relativo a las
          finalidades secundarias, enviando un correo a{' '}
          <a href="mailto:support@getcometa.com" className="text-[#4a5cff] underline">
            support@getcometa.com
          </a>{' '}
          solicitando su inscripción al Listado de Exclusión de COMETA.
        </p>
        <p className="font-bold">5. Transferencias</p>
        <p>
          COMETA podrá recibir datos personales mediante transferencias por parte de terceros (como instituciones
          educativas) con los que usted haya tenido una relación previa y haya consentido expresamente dicha
          transferencia. COMETA tratará los datos conforme a los principios y deberes establecidos en la Ley.
        </p>
        <p className="font-bold">6. Uso de tecnologías de rastreo</p>
        <p>COMETA no utiliza cookies, web beacons u otras tecnologías de rastreo dentro de su sitio web.</p>
        <p className="font-bold">7. Derechos ARCO</p>
        <p>
          Usted podrá ejercer en cualquier momento sus derechos de Acceso, Rectificación, Cancelación y Oposición
          (ARCO), así como revocar su consentimiento para el tratamiento de sus datos personales, enviando una solicitud
          al correo{' '}
          <a href="mailto:support@getcometa.com" className="text-[#4a5cff] underline">
            support@getcometa.com
          </a>{' '}
          con el asunto "Datos Personales". COMETA responderá en un plazo no mayor a 20 días hábiles, y de ser
          procedente, se hará efectiva la acción solicitada dentro de los 15 días hábiles siguientes.
        </p>
        <p className="font-bold">8. Modificaciones al aviso de privacidad</p>
        <p>
          COMETA podrá actualizar este Aviso de Privacidad en cualquier momento. Las actualizaciones serán publicadas en
          el sitio web{' '}
          <a
            href={`https://${cometaWeb}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4a5cff] underline"
          >
            {`${cometaWeb}`}
          </a>{' '}
          o enviadas por medios electrónicos.
        </p>
        <p className="font-bold">9. Autoridad en materia de protección de datos</p>
        <p>
          Si considera que su derecho a la protección de datos personales ha sido vulnerado, podrá acudir al Instituto
          Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI). Más información
          en:{' '}
          <a href={`https://${inaiWeb}`} target="_blank" rel="noopener noreferrer" className="text-[#4a5cff] underline">
            {`${inaiWeb}`}
          </a>
        </p>
        <span className="mb-5 italic font-bold text-center">ÚLTIMA ACTUALIZACIÓN: MAYO 2025.</span>
      </div>
    </>
  );
}
