import Image from 'next/image';

export default function Page500() {
  return (
    <div className="bg-[url('/images/background-error-desktop.svg')] bg-cover bg-no-repeat">
      <div className="flex flex-col items-center justify-center h-screen max-w-md py-24 m-auto text-center">
        <div>
          <Image src="/images/mosaic-error.svg" alt="Mosaico de Error" width={640} height={350} />
        </div>
        <div className="p-2">
          <h4 className="text-[#091A7A] font-semibold text-4xl">¡Ups! Algo salio mal</h4>
        </div>
        <div className="p-6">
          <p className="text-[#00000099]">
            Estamos intentando resolverlo, por favor vuelve a intentar en unos minutos.
          </p>
        </div>
      </div>
    </div>
  );
}
