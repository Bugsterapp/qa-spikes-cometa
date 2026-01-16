import Head from 'next/head';
import Navbar from '~/components/Navbar';
import { EMAIL_TALK_TO_US } from '~/utils/linksEmail';
import { WHAT_TALK_TO_US } from '~/utils/linksWhatsapp';
import { useSendPageEvent } from '~/hooks/useSendEvent';
import { PageViewedCategory, TrackEvents } from '~/constants/events';
import { Button } from '~/components/ui/Button';
import { useEffect } from 'react';

function TalkToUs() {
  const sendPageEvent = useSendPageEvent();

  useEffect(() => {
    sendPageEvent(TrackEvents.chat.pageViewed, PageViewedCategory);
  }, []);

  return (
    <div className="flex flex-col">
      <h2 className="mb-8">¿Necesitas ayuda? Contáctate con nosotros.</h2>

      <div className="flex flex-col gap-4">
        <Button color="primary" className="w-full" asChild>
          <a href={WHAT_TALK_TO_US} target="_blank" rel="noopener noreferrer">
            Conversar por Whatsapp
          </a>
        </Button>

        <Button color="primary" className="w-full" asChild>
          <a rel="noopener noreferrer" href={EMAIL_TALK_TO_US} target="_blank">
            Comunicarme por correo
          </a>
        </Button>
      </div>
    </div>
  );
}

TalkToUs.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Habla con nosotros</title>
      </Head>
      <div className="sticky top-0 z-20">
        <Navbar />
      </div>
      <div className="max-w-md mx-auto">{page}</div>
    </>
  );
};

TalkToUs.auth = true;
export default TalkToUs;
