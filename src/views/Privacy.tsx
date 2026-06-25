// Política de privacidad de Trampto. Ruta pública /privacidad (sin login).
// No depende de ni enlaza a trampto.com: usa el dominio donde esté desplegada
// la app y el correo de contacto.

const Privacy = ({ navigate }: { navigate: (to: string) => void }) => {
  return (
    <div className="info-page">
      <h1>Política de privacidad</h1>
      <p className="info-sub">Última actualización: junio de 2026</p>

      <div className="info-block">
        <h2>1. Quiénes somos</h2>
        <p>
          Trampto es una aplicación que sella y verifica la integridad de
          documentos PDF mediante una huella criptográfica SHA-256. Esta política
          explica qué datos tratamos cuando usas la aplicación y qué derechos
          tienes sobre ellos.
        </p>
        <p>
          Para cualquier cuestión relacionada con tus datos o esta política,
          puedes escribirnos a{" "}
          <a href="mailto:tramptooficial@gmail.com">tramptooficial@gmail.com</a>.
        </p>
      </div>

      <div className="info-block">
        <h2>2. Qué datos recogemos</h2>
        <ul>
          <li>
            <strong>Email de registro:</strong> si creas una cuenta, guardamos tu
            dirección de correo electrónico para identificarte y darte acceso.
          </li>
          <li>
            <strong>Documentos que procesas:</strong> al sellar un documento
            calculamos su huella <strong>SHA-256</strong>. Según la arquitectura
            actual, <strong>no almacenamos el contenido del PDF</strong>: guardamos
            únicamente la huella, el nombre del archivo, el identificador del sello
            (Seal ID) y la fecha. La huella es un identificador único e
            irreversible: a partir de ella no se puede reconstruir el documento.
          </li>
          <li>
            <strong>Datos de suscripción y pago:</strong> si te suscribes, el cobro
            lo procesa Stripe. Nosotros no almacenamos los datos de tu tarjeta.
          </li>
          <li>
            <strong>Cookie técnica:</strong> usamos una cookie funcional
            (<code>trampto_free_used</code>) para contar los documentos del plan
            gratuito en tu dispositivo. No la usamos con fines publicitarios.
          </li>
        </ul>
      </div>

      <div className="info-block">
        <h2>3. Para qué usamos los datos</h2>
        <ul>
          <li>Prestar el servicio de sellado y verificación de documentos.</li>
          <li>Gestionar tu cuenta y tu suscripción.</li>
          <li>Procesar los pagos de los planes de pago.</li>
          <li>
            Permitir la verificación pública de un documento a partir de su huella.
          </li>
        </ul>
        <p>
          La base legal del tratamiento es la <strong>ejecución del contrato</strong>{" "}
          (prestarte el servicio que solicitas) y, cuando proceda, tu
          consentimiento.
        </p>
      </div>

      <div className="info-block">
        <h2>4. Proveedores que tratan datos por nosotros</h2>
        <p>
          Para funcionar, Trampto se apoya en proveedores externos que actúan como
          encargados del tratamiento, cada uno con su propia política de
          privacidad:
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> — backend, base de datos y autenticación
            (almacena el email de tu cuenta y las huellas y metadatos de los
            sellos).
          </li>
          <li>
            <strong>Stripe</strong> — procesamiento de pagos de las suscripciones.
          </li>
          <li>
            <strong>Vercel</strong> — alojamiento de la aplicación.
          </li>
        </ul>
        <p>
          Algunos de estos proveedores pueden tratar datos en servidores situados
          fuera del Espacio Económico Europeo, aplicando las garantías previstas en
          la normativa de protección de datos.
        </p>
      </div>

      <div className="info-block">
        <h2>5. Conservación de los datos</h2>
        <p>
          Conservamos los datos de tu cuenta mientras la mantengas activa. El
          registro de sellos (huella, nombre de archivo, Seal ID y fecha) se
          conserva para permitir la verificación de los documentos a lo largo del
          tiempo. Puedes solicitar su supresión como se indica más abajo.
        </p>
      </div>

      <div className="info-block">
        <h2>6. Tus derechos (RGPD)</h2>
        <p>
          De acuerdo con el Reglamento General de Protección de Datos, tienes
          derecho a:
        </p>
        <ul>
          <li>
            <strong>Acceso:</strong> saber qué datos tuyos tratamos.
          </li>
          <li>
            <strong>Rectificación:</strong> corregir datos inexactos.
          </li>
          <li>
            <strong>Supresión:</strong> solicitar que eliminemos tus datos.
          </li>
          <li>
            <strong>Oposición y limitación:</strong> oponerte a un tratamiento o
            pedir que se limite.
          </li>
          <li>
            <strong>Portabilidad:</strong> recibir tus datos en un formato
            estructurado.
          </li>
        </ul>
        <p>
          Para ejercer cualquiera de estos derechos, escríbenos a{" "}
          <a href="mailto:tramptooficial@gmail.com">tramptooficial@gmail.com</a>.
          También puedes presentar una reclamación ante la autoridad de control
          competente (en España, la Agencia Española de Protección de Datos).
        </p>
      </div>

      <div className="info-block">
        <h2>7. Seguridad</h2>
        <p>
          La aplicación se sirve siempre por HTTPS. El sellado se basa en huellas
          criptográficas SHA-256, y el contenido de los documentos que sellas en tu
          dispositivo no se transmite ni se almacena en nuestros servidores.
        </p>
      </div>

      <div className="info-block">
        <h2>8. Menores</h2>
        <p>
          Trampto no está dirigido a menores de edad y no recogemos
          conscientemente datos de menores.
        </p>
      </div>

      <div className="info-block">
        <h2>9. Cambios en esta política</h2>
        <p>
          Podemos actualizar esta política para reflejar cambios en el servicio o
          en la normativa. Publicaremos la versión vigente en esta misma página.
        </p>
      </div>

      <div className="info-block">
        <h2>10. Contacto</h2>
        <p>
          Responsable del tratamiento: Trampto. Correo de contacto:{" "}
          <a href="mailto:tramptooficial@gmail.com">tramptooficial@gmail.com</a>.
        </p>
      </div>

      <div className="center mt-24">
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default Privacy;
