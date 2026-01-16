import TwoTriangles from '~/public/icons/two_triangles_online_store.svg';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ArrowSmallLeft from '~/public/icons/arrow-small-left.svg';
import BoxColorText from '~/components/Tag';

export default function OnlineStoreBanner() {
  const _router = useRouter();
  const { guardianHash } = _router.query;
  return (
    <div className="p-4 relative bg-white mt-6 mb-1 rounded-xl outline outline-1 outline-offset-[-1px] outline-[#e3e0ff] flex flex-col justify-start items-start gap-2 overflow-hidden">
      <div className="w-44 h-44 right-[-56px] top-[-17px] absolute bg-galaxy-50 rounded-full flex justify-center items-center" />
      <div className="flex flex-col gap-2 justify-start items-start">
        <BoxColorText text="NUEVO" bgcolor="#85E0A359" color="#54AA70" />
        <div className="justify-start text-[#131f8c] text-sm font-bold font-lota leading-tight max-w-52">
          Descubre todo lo que tenemos en nuestra tienda en línea
        </div>
      </div>
      <div className="inline-flex justify-start items-start text-blue-100">
        <Link href={`/guardians/${guardianHash}/online-store`} className="flex gap-1 justify-center items-center py-2">
          <div className="text-sm font-semibold tracking-tight leading-none font-lota">Ir a la tienda</div>
          <ArrowSmallLeft />
        </Link>
        <div className="ml-4 right-[24px] top-[37px] absolute">
          <TwoTriangles />
        </div>
      </div>
    </div>
  );
}
