import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Navbar from '~/components/Navbar';
import { GetServerSideProps } from 'next';
import { Session } from 'next-auth';
import { ServiceClient } from '~/utils/api';
import dayjs from '~/lib/dayjs';
import { formatPrice } from '~/utils/orders';
import { CustomPayinFulfillmentSerializerV2, GuardianPayinSerializerV2 } from '@cometa/trpc';
import Tag from '~/components/Tag';
import { useRouter } from 'next/router';
import Arrow from '~/public/icons/ic_arrow_right.svg';
import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import * as OrderCard from '~/components/OrderCard';
import { getDependentColor } from '~/utils/colors';

interface PayinDetailProps {
  payin: GuardianPayinSerializerV2;
  session: Session;
}

const getUrl = (url?: string) => {
  if (!url) return;
  if (url.includes('http')) {
    return url;
  }
  return `${process.env.NEXT_PUBLIC_CLIENT_API_BASE_URL}${url}`;
};

function downloadFiles(pdfUrl?: string, xmlUrl?: string, orderName?: string) {
  if (!pdfUrl && !xmlUrl) return;

  const files = [
    { url: getUrl(pdfUrl), filename: `${orderName}.pdf` },
    { url: getUrl(xmlUrl), filename: `${orderName}.xml` },
  ];

  files.forEach(function (file) {
    if (!file.url) return;

    const element = document.createElement('a');
    element.setAttribute('href', file.url);
    element.setAttribute('download', file.filename);
    element.setAttribute('target', '_blank');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  });
}

const Card = ({
  payin_fulfillment,
  session,
}: {
  payin_fulfillment: CustomPayinFulfillmentSerializerV2;
  session: Session;
}) => {
  const { student_id, student_first_name, order_name, interest, payin_fulfillments } = payin_fulfillment.fulfillment;
  const { pdf_url, xml_url } = payin_fulfillment?.invoice ?? {};
  const dependents = session?.user?.dependents ?? [];
  const dependentColor = getDependentColor(dependents, student_id);
  const scholarships: Record<string, string>[] =
    payin_fulfillment.fulfillment.discount_breakdown?.details?.scholarships?.details ?? [];
  const special_discounts: Record<string, string>[] =
    payin_fulfillment.fulfillment.discount_breakdown?.details?.special?.details ?? [];
  const early_bird_discounts: Record<string, string>[] =
    payin_fulfillment.fulfillment.discount_breakdown?.details?.early_bird?.details ?? [];
  const conceptIsBillable = payin_fulfillment.fulfillment.concept.is_billable;
  const partialPayins = payin_fulfillment.is_partial
    ? payin_fulfillments.map((payin_fulfillment) => ({
        id: payin_fulfillment.id,
        amount: formatPrice(payin_fulfillment.total_paid),
        date: dayjs(payin_fulfillment.paid_date).format('DD/MM/YYYY'),
      }))
    : [];

  return (
    <OrderCard.Root status="info">
      <OrderCard.Content>
        <OrderCard.Info>
          <div className="flex gap-x-1.5 items-center">
            <h3 className="text-[#3E3E3E] font-semibold">{order_name}</h3>
            <Tag
              bgcolor={dependentColor.background}
              color={dependentColor.text}
              text={student_first_name.toUpperCase()}
            />
          </div>
        </OrderCard.Info>
        <OrderCard.Details>
          <OrderCard.DetailsTrigger>Ver detalles</OrderCard.DetailsTrigger>
          <OrderCard.DetailsContent>
            <div className="flex flex-col gap-y-3">
              <div className="mb-2.5 w-full">
                <div
                  className="inline-flex justify-between w-full text-sm text-[#575757]"
                  data-testid="originalAmount-txt"
                >
                  <span>Monto original:</span>
                  <span>{formatPrice(payin_fulfillment.fulfillment.subtotal)}</span>
                </div>
                {early_bird_discounts?.map((early_bird) => (
                  <div key={early_bird?.id} className="inline-flex justify-between w-full text-sm text-[#3A9658]">
                    <span>Dscto Beca {early_bird?.name}:</span>
                    <span>-{formatPrice(early_bird?.discount)}</span>
                  </div>
                ))}
                {scholarships?.map((scholarship) => (
                  <div key={scholarship?.id} className="inline-flex justify-between w-full text-sm text-[#3A9658]">
                    <span>Dscto Beca {scholarship?.name}:</span>
                    <span>-{formatPrice(scholarship?.discount)}</span>
                  </div>
                ))}
                {special_discounts?.map((special) => (
                  <div key={special?.id} className="inline-flex justify-between w-full text-sm text-[#3A9658]">
                    <span>Dscto Especial {special?.name}:</span>
                    <span>-{formatPrice(special?.discount)}</span>
                  </div>
                ))}
                {!!parseFloat(interest) && (
                  <div className="inline-flex justify-between w-full text-sm text-[#F46F6F]">
                    <span>Recargo por tardanza:</span>
                    <span>+{formatPrice(interest)}</span>
                  </div>
                )}
                {partialPayins.map(({ amount, date, id }) => (
                  <div
                    key={`partial-payin-${id}`}
                    className="inline-flex justify-between w-full text-sm text-[#3E3E3E]"
                  >
                    <span>Pago parcial {date}:</span>
                    <span>-{amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </OrderCard.DetailsContent>
        </OrderCard.Details>
        <OrderCard.HistoricFooter data-testid="payinFulfillmentTotalPaid-txt" amount={payin_fulfillment.total_paid}>
          {!pdf_url ? (
            !conceptIsBillable ? (
              <span className="text-base font-semibold text-[#A6A6A6]">No facturable</span>
            ) : null
          ) : (
            <OrderCard.HistoricButton
              disabled={!pdf_url}
              onClick={() => downloadFiles(pdf_url, xml_url, order_name)}
              data-testid="invoiceDownload-btn"
            >
              Descargar factura
            </OrderCard.HistoricButton>
          )}
        </OrderCard.HistoricFooter>
      </OrderCard.Content>
    </OrderCard.Root>
  );
};

function PayinDetail({ payin, session }: Readonly<PayinDetailProps>) {
  const _router = useRouter();
  const { guardianHash, page, payinId } = _router.query;

  return (
    <div className="text-[#3E3E3E]">
      <div className="inline-flex items-center justify-center mb-[26px] gap-x-2">
        <Link
          href={{
            pathname: `/guardians/${guardianHash}/payments/history`,
            query: {
              page,
              payinId,
            },
          }}
          className="flex items-center justify-center flex-shrink-0 p-2 bg-white rounded-full w-9 h-9"
          data-testid="back-btn"
        >
          <Arrow className="text-[#4A5CFF] w-3 rotate-180" />
        </Link>
        <div className="text-lg font-semibold leading-10">Detalle de Pago</div>
      </div>
      <div className="flex flex-col gap-y-[30px]">
        <div className="flex flex-col gap-y-3.5">
          <h3 className="text-base font-semibold" data-testid="paymentDate-text">
            {dayjs(payin.paid_date).format('dddd, D [de] MMMM YYYY')}
          </h3>
          <div className="border-b border-[#E3E0FF]" />
          <div className="inline-flex flex-col items-start justify-start text-sm gap-y-1">
            <div className="inline-flex items-center self-stretch justify-between" data-testid="payerName-text">
              <span>Pagado por: </span>
              <span className="font-medium">{payin.guardian_fullname} </span>
            </div>
            <div className="inline-flex items-center self-stretch justify-between" data-testid="paymentMethod-text">
              <span>Medio de pago:</span>
              <span className="font-medium">{payin.payment_method}</span>
            </div>
            <div className="inline-flex items-center self-stretch justify-between" data-testid="paymentPlace-text">
              <span>Lugar de pago:</span>
              <span className="font-medium">{payin.collected_at}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-y-2">
          <div className="font-semibold" data-testid="totalPayment-text">
            Total pagado: {formatPrice(payin.total_paid)}
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div className="flex gap-x-2.5">
            <span className="font-semibold">Órdenes pagadas</span>
            {payin.payin_fulfillments.length > 1 && (
              <span className=" flex justify-center items-center rounded-full bg-[#57537A] h-5 w-5 text-white text-sm font-medium">
                {payin.payin_fulfillments.length}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-y-3">
            {payin.payin_fulfillments.map((payin_fulfillment) => (
              <Card key={payin_fulfillment.id} payin_fulfillment={payin_fulfillment} session={session} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

PayinDetail.getLayout = function getLayout(page: React.ReactNode) {
  return (
    <>
      <Head>
        <title>Detalle de Pago</title>
      </Head>
      <div className="sticky top-0 z-10">
        <Navbar />
      </div>
      <div className="w-full max-w-md px-5 py-6 mx-auto">{page}</div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { payinId, schoolId } = context.query;
    const session = await getSession(context);
    const response = await ServiceClient.apiV2SchoolsPayinsRetrieve(payinId as string, schoolId as string, {
      headers: {
        token: session?.token ?? '',
      },
    });
    return {
      props: {
        payin: response.data,
        session,
      },
    };
  } catch (error) {
    Sentry.captureException(error);
    return {
      notFound: true,
    };
  }
};
PayinDetail.auth = true;
export default PayinDetail;
