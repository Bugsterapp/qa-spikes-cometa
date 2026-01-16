import { Button } from '@cometa/recreo';
import { useRouter } from 'next/router';
import GreenCheck from '~/public/icons/success-check.svg';

export function ThankYouStep() {
  const router = useRouter();
  const { guardianHash } = router.query;

  const handleDone = () => {
    router.push(`/guardians/${guardianHash}/students/`);
  };
  return (
    <div className="flex flex-col items-start justify-center h-[calc(100vh-420px)] text-left">
      <GreenCheck className="w-62 h-62" />
      <h3 className="text-[30px] font-semibold text-[#1C1C1C] mt-6">
        <span className="block">¡Información</span>
        <span className="font-bold block">actualizada!</span>
      </h3>
      <p className="text-[#57537A] text-[18px] leading-relaxed max-w-sm mt-2">
        Ahora puedes continuar con el proceso de reinscripciones con la escuela.
      </p>
      <Button className="bg-[#1C1C1D] hover:bg-[#1C1C1D]/90 mt-10 px-5 py-2.5 w-full" onClick={handleDone}>
        Finalizar
      </Button>
    </div>
  );
}
