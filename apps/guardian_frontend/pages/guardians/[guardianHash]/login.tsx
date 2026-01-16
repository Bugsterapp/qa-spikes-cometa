import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import DialogButtonsContactUs from '~/components/molecules/guardians/dialogs/DialogButtonsContactUs';
import useAlert from '~/hooks/useAlert';
import { sendPageViewedEvent, sendTrackEvent } from '~/utils/events';
import { WHAT_TALK_TO_US } from '~/utils/linksWhatsapp';
import { Events } from '~/constants/events';
import { api } from '~/utils/api';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const _router = useRouter();
  const { guardianHash, error: authError } = _router.query;
  const [open, setOpen] = useState(false);
  const { setAlert } = useAlert();
  const { mutateAsync } = api.guardian.login.useMutation();

  const manageAuthError = useCallback(
    async (authError: string) => {
      if (authError) {
        let errorMessage = authError;
        if (authError === 'Link expirado') {
          errorMessage = `[${authError}] Genere un nuevo link de ingreso con el botón de "Entrar al portal"`;
        }

        setAlert(errorMessage, 'error');
      }
    },
    [setAlert]
  );

  const sendEmail = (guardianHash: string) => {
    setLoading(true);
    mutateAsync({ hash: guardianHash })
      .then((data) => {
        if (data) {
          if (data?.auth_token) {
            localStorage.setItem('TEST_AUTH_TOKEN', data.auth_token);
          }
          const [userName, domainName] = data.email.split('@');
          const hiddenEmail = `${userName.substring(0, 3)}***@${domainName}`;
          setAlert(`Correo enviado a ${hiddenEmail}`, 'success');
          setLoading(false);
          setEmail(hiddenEmail);
          sendPageViewedEvent(Events.login_step_2);
        } else {
          // TODO: Este error debe venir del backend
          throw new Error(`Responsable con hash "${guardianHash}" no existe.`);
        }
      })
      .catch((err) => {
        manageAuthError(err?.response?.data?.error || err?.message || 'Error al enviar email');
        setLoading(false);
      });
  };

  useEffect(() => {
    manageAuthError(authError as string);
  }, [authError, manageAuthError]);

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>

      <div
        className="min-h-screen w-full"
        style={{
          background:
            'linear-gradient(179.6deg, rgba(211, 239, 255, 0.4) 0.34%, rgba(190, 189, 255, 0.4) 99.68%), #FFFFFF',
        }}
      >
        {email ? (
          <div className="max-w-sm mx-auto px-2 flex flex-col gap-6 h-screen items-center justify-center">
            <h1 className="text-xl font-bold text-gray-900 text-center">Te acabamos de enviar tu link de acceso a:</h1>
            <p className="font-semibold text-gray-900 text-center">{email}</p>
            <p className="text-sm text-gray-900 text-center max-w-[300px]">
              Revisa tu correo y tu bandeja de spam. Recuerda que el link expira en 24 horas.
            </p>
            <p className="text-sm text-gray-900 text-center max-w-[300px]">¿No lo recibiste?</p>
            <div className="flex flex-col gap-1 px-2 items-center justify-center">
              <a
                href="#"
                className="text-blue-600 underline hover:text-blue-700"
                onClick={() => {
                  sendEmail(guardianHash as string);
                  sendTrackEvent(Events.re_send_link);
                }}
              >
                Volver a enviar link al correo
              </a>
              <p className="text-sm text-gray-900 text-center max-w-[300px]">ó</p>
              <div className="flex items-center">
                <a
                  href={WHAT_TALK_TO_US}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline hover:text-blue-700"
                >
                  Hablar con soporte
                </a>
                <svg className="w-6 h-6 text-blue-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.75 13.96c.25.13.41.2.46.3.06.11.04.61-.21 1.18-.2.56-1.24 1.1-1.7 1.12-.46.02-.47.36-2.96-.73-2.49-1.09-3.99-3.75-4.11-3.92-.12-.17-.96-1.38-.92-2.61.05-1.24.69-1.77.93-1.96.2-.16.44-.22.67-.22l.46.01c.15.01.35-.02.54.48l.93 2.31c.2.45.15.81-.06 1.09l-.46.51c-.18.2-.31.44-.25.74.06.31.27.76.68 1.31.5.69 1.11 1.23 1.91 1.63.89.45 1.02.34 1.44.04.46-.32 1.91-1.41 2.35-1.31.19.04.46.14.64.46Z" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 px-2 h-screen items-center justify-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900 text-center">
                Hola, bienvenido a tu <br /> portal de pagos
              </h1>
            </div>
            <div>
              <button
                className="px-16 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md flex items-center gap-3"
                onClick={() => {
                  sendEmail(guardianHash as string);
                }}
              >
                <span>Entrar al portal</span>
                {loading && (
                  <svg
                    className="animate-spin h-5 w-5 text-white ml-1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}
        <DialogButtonsContactUs
          onClose={() => {
            setOpen(false);
          }}
          open={open}
          sendEmail={() => {
            sendEmail(guardianHash as string);
          }}
        />
      </div>
    </>
  );
}
