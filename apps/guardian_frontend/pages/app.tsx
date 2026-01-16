import Image from 'next/image';
import Head from 'next/head';
import { useEffect } from 'react';

const ANDROID_URL =
  process.env.NEXT_PUBLIC_ANDROID_STORE_URL || 'https://play.google.com/store/apps/details?id=com.cometa.app';
const IOS_URL = process.env.NEXT_PUBLIC_IOS_STORE_URL || 'https://apps.apple.com/app/id6751424121';
const FALLBACK_URL = process.env.NEXT_PUBLIC_FALLBACK_URL || 'https://portal.getcometa.com';
const APP_SCHEME = process.env.NEXT_PUBLIC_APP_SCHEME || 'cometa';

export default function AppDownloadPage() {
  useEffect(() => {
    /**
     * If the user is on a mobile device, redirect to the app store or google play.
     * If the user is not on a mobile device, don't do anything.
     */
    const userAgent = navigator.userAgent || navigator.vendor || '';
    let storeUrl = FALLBACK_URL;
    let isMobile = false;

    if (/iPad|iPhone|iPod/.test(userAgent) && !('MSStream' in window)) {
      storeUrl = IOS_URL;
      isMobile = true;
    } else if (/android/i.test(userAgent)) {
      storeUrl = ANDROID_URL;
      isMobile = true;
    }

    if (isMobile) {
      let appOpened = false;

      const onVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          appOpened = true;
        }
      };

      const onPageShow = () => {
        if (appOpened) {
          clearTimeout(timeout);
        }
      };

      document.addEventListener('visibilitychange', onVisibilityChange);
      window.addEventListener('pageshow', onPageShow);

      const appDeepLink = `${APP_SCHEME}://`;
      window.location.href = appDeepLink;

      const timeout = setTimeout(() => {
        if (!appOpened) {
          window.location.href = storeUrl;
        }
      }, 5000);

      return () => {
        clearTimeout(timeout);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        window.removeEventListener('pageshow', onPageShow);
      };
    }
  }, []);

  return (
    <>
      <Head>
        <title>Descargar Cometa - App Móvil</title>
        <meta name="description" content="Descarga la aplicación móvil de Cometa para iOS y Android" />
      </Head>

      <div className="min-h-screen bg-transparent">
        <div className="flex h-dvh flex-col items-center justify-center px-8 py-6 lg:hidden">
          <div className="flex flex-col flex-shrink">
            <h1 className="mt-2 mb-4 mx-auto text-center text-[20px] font-semibold leading-tight text-[#000000] max-w-[218px]">
              Redirigiendo a la tienda de aplicaciones...
            </h1>

            <div className="w-screen -mx-8">
              <div className="relative aspect-square w-full">
                <Image src="/images/mockup-mobile.png" alt="Cometa App" fill className="object-contain" priority />
              </div>
            </div>
          </div>

          <div className="w-full text-center flex-shrink-0 pb-4">
            <h2 className="mt-4 mb-4 text-[16px] font-semibold text-[#000000]">¿No funcionó la redirección?</h2>

            <div className="mb-4 flex w-full flex-row items-center justify-center gap-2">
              <a href={IOS_URL} target="_blank" rel="noopener noreferrer" className="flex-1">
                <div className="relative h-[50px] w-full">
                  <Image
                    src="/images/stores/app-store.png"
                    alt="Download on the App Store"
                    fill
                    className="object-contain"
                  />
                </div>
              </a>

              <a href={ANDROID_URL} target="_blank" rel="noopener noreferrer" className="flex-1">
                <div className="relative h-[50px] w-full">
                  <Image
                    src="/images/stores/google-play.png"
                    alt="Get it on Google Play"
                    fill
                    className="object-contain"
                  />
                </div>
              </a>
            </div>

            <a
              href={FALLBACK_URL}
              className="inline-block rounded-full bg-[#ECEFF6] px-8 py-3 text-sm font-semibold text-[#22283A] transition-colors hover:bg-[#ECEFF6]/80"
            >
              Volver al portal web
            </a>
          </div>
        </div>

        <div className="hidden min-h-screen items-center px-20 lg:flex">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-2 items-stretch gap-20">
            <div className="flex flex-col justify-between py-32">
              <div className="space-y-8">
                <h1 className="max-w-[432px] text-[32px] font-bold leading-tight text-[#000000]">
                  Descarga la app de Cometa en el App Store o Google Play desde tu celular
                </h1>

                <div className="flex items-center gap-4">
                  <a href={IOS_URL} target="_blank" rel="noopener noreferrer" className="block">
                    <div className="relative h-[56px] w-[188px]">
                      <Image
                        src="/images/stores/app-store.png"
                        alt="Download on the App Store"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </a>

                  <a href={ANDROID_URL} target="_blank" rel="noopener noreferrer" className="block">
                    <div className="relative h-[56px] w-[188px]">
                      <Image
                        src="/images/stores/google-play.png"
                        alt="Get it on Google Play"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </a>
                </div>
              </div>

              <div>
                <p className="mb-4 text-[20px] text-[#000000] max-w-[432px]">
                  Si quieres continuar en Cometa desde la computadora haz clic aquí:
                </p>
                <a
                  href={FALLBACK_URL}
                  className="inline-block rounded-full bg-[#ECEFF6] px-8 py-3 text-sm font-semibold text-[#22283A] transition-colors hover:bg-[#ECEFF6]/80"
                >
                  Volver al portal web
                </a>
              </div>
            </div>

            <div className="flex items-center justify-center py-20">
              <div className="relative aspect-square w-full max-w-2xl">
                <Image src="/images/mockup-desktop.png" alt="Cometa App" fill className="object-contain" priority />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
