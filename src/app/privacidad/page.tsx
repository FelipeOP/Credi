import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidad y almacenamiento local",
  alternates: { canonical: "/privacidad/" },
};
export default function PrivacyPage() {
  return (
    <main id="main-content" className="page-container prose-page">
      <span className="eyebrow">TÚ TIENES EL CONTROL</span>
      <h1>
        Tus cálculos, <span>en tu dispositivo.</span>
      </h1>
      <p className="prose-lead">
        Credi realiza los cálculos y genera los PDF en el navegador.
      </p>
      <h2>Datos financieros</h2>
      <p>
        La aplicación no envía montos, tasas, saldos ni tablas a un servidor
        para calcular. No necesitas crear una cuenta. Al navegar se cargan los
        archivos del sitio desde su proveedor de alojamiento.
      </p>
      <h2>Guardado opcional</h2>
      <p>
        Cuando eliges Guardar simulación, los datos de las tres calculadoras se
        conservan en el almacenamiento local de ese navegador. En un dispositivo
        compartido otras personas que usen el mismo perfil podrían verlos.
        Puedes eliminar la copia con el botón junto a Guardar simulación o
        borrar los datos del sitio en el navegador.
      </p>
      <h2>Analítica</h2>
      <p>
        Si está configurada y la permites, Google Analytics recibe visitas de
        páginas y eventos de uso como calcular o exportar, con el tipo de
        calculadora. Credi no añade a esos eventos el monto, la tasa, el saldo
        ni los datos de la tabla. Google puede tratar información técnica del
        navegador y usar almacenamiento de acuerdo con su servicio.
      </p>
      <h2>Publicidad</h2>
      <p>
        Si está configurada y la permites, Google AdSense carga anuncios. Google
        y sus socios pueden tratar información técnica y utilizar cookies o
        identificadores para la publicidad. Los anuncios son contenido de
        terceros y están identificados como Publicidad.
      </p>
      <h2>Preferencias</h2>
      <p>
        Puedes rechazar servicios opcionales y seguir usando todas las
        calculadoras y la exportación. Tus preferencias se guardan localmente.
        Cambiarlas limita las nuevas solicitudes de la aplicación; no elimina
        información que ya haya recibido un tercero.
      </p>
      <a href="#privacy-settings" className="primary-button">
        Revisar mis preferencias
      </a>
      <p>
        Más información:{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noreferrer"
        >
          política de privacidad de Google
        </a>
        .
      </p>
    </main>
  );
}
