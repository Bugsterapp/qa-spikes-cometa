import Image from 'next/image';
import { useRouter } from 'next/router';
import { Button } from '~/components/atoms/Button';

export default function Page404() {
  const _router = useRouter();
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
          <p className="text-[#00000099]">La página a la que quieres acceder no existe o no está disponible</p>
        </div>
        <Button className="h-16 w-60" onClick={() => _router.push('/')}>
          Volver al home
        </Button>
      </div>
    </div>
  );
}
