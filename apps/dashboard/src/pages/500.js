// next
import NextLink from 'next/link';
// layouts
import Layout from '../components/layouts';
// assets
import SeverErrorIllustration from '/public/assets/icons/illustration_500.svg';

// ----------------------------------------------------------------------

const getLayout = (page) => (
  <Layout variant="logoOnly" title="Error 500">
    {page}
  </Layout>
);

// ----------------------------------------------------------------------

export default function Page500() {
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-[480px] mx-auto min-h-screen flex justify-center flex-col py-48 text-center items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-4">Error 500, hubo un error en nuestros servidores</h1>
        </div>

        <div>
          <p className="text-gray-600">Por favor, intentalo mas tarde</p>
        </div>

        <div>
          <div className="my-5 sm:my-10">
            <SeverErrorIllustration />
          </div>
        </div>

        <div>
          <NextLink href="/" passHref>
            <button className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-[#00AB55] text-white hover:bg-[#007B55] h-12 px-6 text-lg">
              Inicio
            </button>
          </NextLink>
        </div>
      </div>
    </div>
  );
}
Page500.getLayout = getLayout;
