'use client';
import { DashboardPayinDetail, RetrieveGuardian, SlimStudent } from '@cometa/trpc/src/types';
import * as Sentry from '@sentry/nextjs';
import { getSession } from 'next-auth/react';
import { GetServerSidePropsContext } from 'next';
import { useEffect, useState } from 'react';

import Printer from '/public/assets/images/printer.svg';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { cn } from '/src/utils/cn';
import { formatDateNumeric, formatPrice, paymentTypeLabel } from '/src/utils/general';
import { appRouter } from '/src/server/api/root';

interface ReceiptProps {
  payinData: DashboardPayinDetail;
  guardianData: RetrieveGuardian;
}

function Receipt({ payinData, guardianData }: ReceiptProps) {
  const onPrint = () => {
    window.print();
  };
  const [client, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  const selectedSchool = useSelectedSchool();

  const payinFulfillments = payinData?.payin_fulfillments;
  const payinFulfillmentsWithOutStudent = payinFulfillments?.filter(
    (payinFulfillment) => !payinFulfillment.fulfillment.student
  );

  const showComment = payinData.show_comment && payinData.comment;

  const students = payinFulfillments.reduce((acc: Record<string, SlimStudent>, payinFulfillment) => {
    const student = payinFulfillment?.fulfillment.student;
    if (student) {
      acc[student.id] = student;
    }
    return acc;
  }, {});

  const studentsArray = Object.values(students);

  return (
    <div className="min-h-full py-12 text-center bg-violet-50">
      <div className="flex-col pb-4">
        <div>
          <strong className="p-6 text-2xl">Comprobante de pago</strong>
        </div>
        <div>
          <span className="text-1xl">powered by Cometa </span>
        </div>
      </div>
      <div className="flex justify-end max-w-5xl mx-auto my-2">
        <button
          type="button"
          className="flex items-center gap-2 px-2 py-1 text-sm transition-colors duration-300 rounded-full bg-violet-50 text-blue-secondary-300 print:hidden hover:cursor-pointer"
          onClick={onPrint}
        >
          <Printer />
          <strong className="text-blue-secondary-200">Imprimir</strong>
        </button>
      </div>
      <div className="max-w-5xl mx-auto my-0 text-center bg-white border-t-4 border-black">
        <div className="flex justify-between items-end mx-auto mt-[78px] w-5/6 border-separate border-spacing-2 whitespace-nowrap">
          <div className="flex flex-col items-start">
            {selectedSchool?.logo ? (
              <img
                src={selectedSchool?.logo ?? ''}
                className="max-h-[49px] mb-[31px]"
                alt={`Logo de ${selectedSchool?.name}`}
              />
            ) : null}
            <span className="font-bold text-black">{client && selectedSchool ? selectedSchool.name : ''}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-normal text-right text-black">ID de pago</span>
            <p>
              {' '}
              <strong className="text-base text-black">{payinData.correlative_id}</strong>
            </p>
          </div>
        </div>
        <div className="grid mt-12 mb-6 justify-items-center">
          <table className="w-5/6 border-separate border-spacing-2 whitespace-nowrap">
            <tbody>
              <tr>
                <td className="text-left text-black">Fecha del pago:</td>
                <td className="text-right text-black">{formatDateNumeric(payinData.paid_date ?? '')}</td>
              </tr>
              <tr>
                <td className="text-left text-black">Lugar de pago:</td>
                <td className="text-right text-black">
                  {payinData?.collected_at_school ? 'Colegio' : 'Portal Cometa'}
                </td>
              </tr>
              <tr>
                <td className="text-left text-black">Medio de pago:</td>
                <td className="text-right text-black">{paymentTypeLabel(payinData.type)}</td>
              </tr>
              {(payinData?.type === 'debit_card' || payinData?.type === 'credit_card') &&
                payinData?.card_last_digits && (
                  <tr>
                    <td className="text-left text-black">Info. de tarjeta:</td>
                    <td className="text-right">
                      <div className="flex justify-end">
                        {payinData?.bank_name && (
                          <>
                            <span className="text-black">{payinData?.bank_name}</span>
                            <div className="w-[1px] mx-2 border border-l-[#919EAB3D]" />
                          </>
                        )}
                        <span className="text-black">**** **** **** {payinData?.card_last_digits}</span>
                      </div>
                    </td>
                  </tr>
                )}
              {payinData?.type === 'bank_transfer' && payinData?.transaction_reference && (
                <tr>
                  <td className="text-left text-black">Nro de referencia:</td>
                  <td className="text-right text-black">{payinData?.transaction_reference}</td>
                </tr>
              )}
              {payinData?.type === 'bank_transfer' && payinData?.sender_account_number && (
                <tr>
                  <td className="text-left text-black">Cuenta de procedencia:</td>
                  <td className="text-right text-black">{payinData?.sender_account_number}</td>
                </tr>
              )}
              <tr>
                <td className="text-left text-black">Pagado por:</td>
                <td className="text-right text-black">
                  {guardianData?.first_name && guardianData?.last_name
                    ? `${guardianData.first_name} ${guardianData.last_name}`
                    : 'Información no disponible'}
                </td>
              </tr>
              {payinData?.created_by?.first_name && payinData?.created_by?.last_name && (
                <tr>
                  <td className="text-left text-black">Cobrado por:</td>
                  <td className="text-right text-black">
                    {payinData?.created_by?.last_name && payinData?.created_by?.first_name
                      ? `${payinData?.created_by?.first_name} ${payinData?.created_by?.last_name}`
                      : ''}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="grid justify-items-center">
          <table className={cn('w-5/6 border-spacing-2 whitespace-nowrap', showComment ? 'mb-6' : 'mb-16')}>
            <thead>
              <tr className="border-b-2 border-black">
                <th className="px-4 py-6 text-left text-black">Item</th>
                <th className="px-4 py-6 text-right text-black">Monto</th>
              </tr>
            </thead>
            <tbody>
              {payinFulfillmentsWithOutStudent.map((payinFulfillment) => (
                <tr key={payinFulfillment.id} className="border-b border-black">
                  <td className="px-4 py-4 text-sm text-left">
                    <span className="flex flex-wrap text-black">
                      {payinFulfillment.is_partial ? 'Pago parcial - ' : ''}
                      {payinFulfillment.fulfillment.order_name}{' '}
                    </span>
                  </td>
                  <td className="px-2 py-4 text-right text-black">
                    {formatPrice(payinFulfillment.total_paid, payinData.total_currency)}
                  </td>
                </tr>
              ))}

              {studentsArray.map((student) => (
                <>
                  <tr key={student.id} className="w-full border-b border-black bg-[#F4F6F8]">
                    <td className="px-2 py-4 text-left">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-black">
                          {student.first_name} {student.last_name}
                        </span>
                        <div className="flex">
                          <span className="text-xs font-medium text-black">
                            {student.level} - {student.section}
                          </span>
                          <div className="w-[1px] mx-2 border border-l-[#919EAB3D]" />
                          <span className="text-xs font-medium text-black">
                            Matrícula: <strong className="text-black">{student.enrollment_code}</strong>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td />
                  </tr>
                  {payinFulfillments
                    ?.filter(
                      (payinFulfillment) =>
                        payinFulfillment.fulfillment.student && payinFulfillment.fulfillment.student.id === student.id
                    )
                    .map((payinFulfillment) => (
                      <tr key={payinFulfillment.id} className="border-b border-black">
                        <td className="px-4 py-4 text-sm text-left">
                          <span className="flex flex-wrap text-black">
                            {payinFulfillment.is_partial ? 'Pago parcial - ' : ''}
                            {payinFulfillment.fulfillment.order_name}{' '}
                          </span>
                        </td>
                        <td className="px-2 py-4 text-right text-black">
                          {formatPrice(payinFulfillment.total_paid, payinData.total_currency)}
                        </td>
                      </tr>
                    ))}
                </>
              ))}

              <tr className="border-black bg-[#7E83B0] bg-opacity-8">
                <td className="px-2 py-4 text-left">
                  <strong className="text-black">Subtotal</strong>
                </td>
                <td className="px-2 py-4 text-right">
                  <span className="text-black">{formatPrice(payinData.total, payinData.total_currency)}</span>
                </td>
              </tr>
              <tr className="border-black border-y-2 bg-[#7E83B0] bg-opacity-12">
                <td className="px-2 py-4 text-left">
                  <strong className="text-black">Total pagado</strong>
                </td>
                <td className="px-2 py-4 text-right">
                  <strong className="text-black">{formatPrice(payinData.total, payinData.total_currency)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {showComment && (
          <div className="flex justify-center">
            <div className="bg-[#7E83B0] bg-opacity-12 p-4 w-5/6 mb-16 border-spacing-2 text-left">
              <span className="text-sm font-medium">
                <strong>Comentario:</strong> {payinData.comment}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const emptyGuardianData: RetrieveGuardian = {
  first_name: '',
  last_name: '',
  id: '',
  hash: '',
  email: '',
  schools: [],
  dependents: [],
  cfdi_config_detail: {},
  has_payins: '',
  fraud_status: null,
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  const { school_id, payin_id } = context.query;

  if (!school_id || !payin_id || Array.isArray(school_id) || Array.isArray(payin_id)) {
    return { notFound: true };
  }

  if (!session?.token) {
    return { notFound: true };
  }

  try {
    const caller = appRouter.createCaller({
      session,
      req: context.req,
      res: context.res,
    });

    const payinData = await caller.income.getPayinById({
      schoolId: school_id,
      payinId: payin_id,
    });

    let guardianData: RetrieveGuardian | null = null;

    const guardianFromFulfillment = payinData?.fulfillments?.[0]?.guardian;
    if (guardianFromFulfillment?.first_name && guardianFromFulfillment?.last_name) {
      guardianData = guardianFromFulfillment as RetrieveGuardian;
    } else if (payinData?.guardian) {
      try {
        guardianData = await caller.guardian.getGuardianById({
          id: payinData.guardian,
          schoolId: school_id,
        });
      } catch (guardianError) {
        Sentry.captureException(guardianError, {
          extra: { school_id, guardian_id: payinData.guardian },
        });
      }
    }

    return {
      props: {
        session,
        payinData: payinData || {},
        guardianData: guardianData || emptyGuardianData,
      },
    };
  } catch (error) {
    Sentry.captureException(error);

    return {
      props: {
        session,
        payinData: {},
        guardianData: emptyGuardianData,
      },
    };
  }
}

export default Receipt;
