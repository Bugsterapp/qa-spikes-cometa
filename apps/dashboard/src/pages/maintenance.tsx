import { GetServerSideProps } from 'next';
import Cometa from '/public/assets/cometa-logo.svg';
import Head from 'next/head';

export default function Maintenance() {
  return (
    <div className="h-screen">
      <Head>
        <title>Cometa</title>
      </Head>
      <section className="min-h-screen bg-gradient-to-t from-[#BEBDFF66] to-[#D3FDFF66] max-h-fit">
        <div className="flex flex-col items-center lg:items-start bg-[#4A5CFF] bg-gradient-mobile bg-right-top lg:bg-gradient-desktop lg:bg-bottom min-h-screen lg:h-full bg-no-repeat p-10 pb-20 lg:py-[4.6rem] lg:px-[6.5rem] text-white justify-center">
          <div className="flex flex-col justify-center w-full gap-2">
            <Cometa className="self-start w-24 lg:w-40" />
            <div className="max-w-[450px] mx-auto flex gap-3 flex-col">
              <h3 className="font-bold mt-[75px] lg:text-3xl lg:mt-32 mx-auto">
                El dashboard de Cometa está en mantenimiento
              </h3>
              <span className="text-xs text-center lg:text-2xl lg:text-left font-light lg:max-w-lg lg:mb-auto mt-10 mx-auto max-w-[400px]">
                Estamos trabajando en mejoras para la plataforma de Cometa, en unos minutos podrás volver a ingresar al
                dashboard
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
export const getServerSideProps: GetServerSideProps = async () => {
  if (process.env.MODE !== 'maintenance') {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }
  return {
    props: {},
  };
};
