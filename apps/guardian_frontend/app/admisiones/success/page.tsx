import { CardLayout } from '../CardLayout';

export default function AdmissionFormSuccessPage() {
  return (
    <CardLayout>
      <div className="px-8 py-2 flex flex-col justify-center items-center gap-6 -mt-8 sm:mt-0 bg-white rounded-t-2xl h-full text-center">
        <img src="/admissions/check-success.svg" alt="Success check" />

        <h2 className="font-bold text-3xl text-[#1c1c1c]">¡Información enviada!</h2>

        <p className="text-[#637381]">
          Recibirás un mensaje a través de <span className="font-bold">correo electrónico</span> y{' '}
          <span className="font-bold">WhatsApp</span> con las indicaciones para ingresar a nuestra plataforma{' '}
          <span className="font-bold">Cometa</span> y continuar tu proceso de admisión.
        </p>
      </div>
    </CardLayout>
  );
}
