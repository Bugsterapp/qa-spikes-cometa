import { cn } from '@cometa/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@cometa/recreo';

type NotFoundPageProps = {
  withBackground?: boolean;
};

export default function Page404({ withBackground = true }: NotFoundPageProps) {
  const router = useRouter();
  return (
    <div
      className={cn('bg-cover bg-no-repeat max-h-screen flex items-center justify-center', {
        "bg-[url('/images/background-error-desktop.svg')]": withBackground,
      })}
    >
      <div className="flex flex-col items-center justify-center max-w-md py-24 m-auto text-center">
        <div>
          <Image src="/images/mosaic-error.svg" alt="Mosaico de Error" width={640} height={350} />
        </div>
        <div className="p-2">
          <h4 className="text-[#091A7A] font-semibold text-4xl">¡Ups! Algo salió mal</h4>
        </div>
        <div className="p-6">
          <p className="text-[#00000099]">La página a la que quieres acceder no existe o no está disponible</p>
        </div>
        <Button variant="solid" color="galaxy" className="h-16 w-60" onClick={() => router.push('/')}>
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}
