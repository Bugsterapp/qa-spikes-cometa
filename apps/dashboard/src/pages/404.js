// next
import NextLink from 'next/link';
// layouts
import Layout from '../components/layouts';
// assets
import PageNotFoundIllustration from '/public/assets/icons/illustration_404.svg';

// ----------------------------------------------------------------------

const getLayout = (page) => (
  <Layout variant="logoOnly" title="404 Page Not Found">
    {page}
  </Layout>
);
export default function Page404() {
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-[480px] mx-auto min-h-screen flex justify-center flex-col py-48 text-center items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-4">¡Disculpa, página no encontrada!</h1>
        </div>
        <div>
          <p className="text-gray-600">
            Es posible que el enlace esté roto o que se haya eliminado la página. Comprueba que el enlace que quieres
            abrir es correcto.
          </p>
        </div>
        <div>
          <div className="h-[260px] my-5 sm:my-10">
            <PageNotFoundIllustration />
          </div>
        </div>

        <NextLink href="/" passHref>
          <button className="mt-[5rem] inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-[#00AB55] text-white hover:bg-[#007B55] text-white  h-12 px-6 text-lg">
            Inicio
          </button>
        </NextLink>
      </div>
    </div>
  );
}
Page404.getLayout = getLayout;
