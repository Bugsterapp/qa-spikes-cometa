import { getSession } from 'next-auth/react';
import ApiClient from '../services/ApiClient';
import { formatPrice, formatDateNumeric, paymentTypeLabel } from '../utils/general';
import * as Sentry from '@sentry/nextjs';
import Printer from 'public/assets/images/printer.svg';
import { Fulfillment } from '/types/due-orders';
import { Student } from '../components/organisms/dashboard/ComplianceCard';
import { useSelectedSchool } from '../guards/AuthGuard';
import { RetrieveGuardian } from '@cometa/trpc/src/types';

interface ReceiptProps {
  payinData: any;
  guardianData: RetrieveGuardian;
}

function Receipt({ payinData, guardianData }: ReceiptProps) {
  const onPrint = () => {
    window.print();
  };
  const selectedSchool = useSelectedSchool();

  const fulfillments = payinData?.fulfillments || [payinData?.fulfillment];

  const students = fulfillments.reduce((acc: Record<string, Student>, fulfillment: Fulfillment) => {
    const student = fulfillment?.student;
    if (student) {
      acc[student.id] = student;
    }
    return acc;
  }, {});

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
        <div className="flex justify-between items-end ml-[84px] mt-[78px] w-5/6 border-separate border-spacing-2 whitespace-nowrap">
          <strong className="text-2xl">{selectedSchool?.name}</strong>
          <div className="flex flex-col">
            <span className="text-sm text-right font-normal text-[#212B36]">ID de pago</span>
            <strong className="text-base">{payinData.correlative_id}</strong>
          </div>
        </div>
        <div className="grid mt-12 mb-6 justify-items-center">
          <table className="w-5/6 border-separate border-spacing-2 whitespace-nowrap">
            <tbody>
              <tr>
                <td className="text-left">Fecha del pago:</td>
                <td className="text-right">{formatDateNumeric(payinData.paid_date)}</td>
              </tr>
              <tr>
                <td className="text-left">Medio de pago:</td>
                <td className="text-right">{paymentTypeLabel(payinData.type)}</td>
              </tr>
              {(payinData?.type === 'debit_card' || payinData?.type === 'credit_card') &&
                payinData?.card_last_digits && (
                  <tr>
                    <td className="text-left">Info. de tarjeta:</td>
                    <td className="text-right">
                      <div className="flex justify-end">
                        {payinData?.bank_name && (
                          <>
                            <span>{payinData?.bank_name}</span>
                            <div className="w-[1px] mx-2 border border-l-[#919EAB3D]" />
                          </>
                        )}
                        <span>**** **** **** {payinData?.card_last_digits}</span>
                      </div>
                    </td>
                  </tr>
                )}
              {payinData?.type === 'bank_transfer' && payinData?.transaction_reference && (
                <tr>
                  <td className="text-left">Nro de referencia:</td>
                  <td className="text-right">{payinData?.transaction_reference}</td>
                </tr>
              )}
              {payinData?.type === 'bank_transfer' && payinData?.sender_account_number && (
                <tr>
                  <td className="text-left">Cuenta de procedencia:</td>
                  <td className="text-right">{payinData?.sender_account_number}</td>
                </tr>
              )}
              <tr>
                <td className="text-left">Pagador:</td>
                <td className="text-right">
                  {guardianData.first_name} {guardianData.last_name}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="grid justify-items-center">
          <table className="w-5/6 mb-16 border-spacing-2 whitespace-nowrap">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="px-4 py-6 text-left">Item</th>
                <th className="px-4 py-6 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(students as [Student]).map((student: Student) => (
                <>
                  <tr key={student.id} className="w-full border-b border-black bg-[#F4F6F8]">
                    <td className="px-2 py-4 text-left">
                      <div className="flex flex-col">
                        <span className="text-[#5A5D72] text-sm font-medium">
                          {student.first_name} {student.last_name}
                        </span>
                        <div className="flex">
                          <span className="text-[#5A5D72] text-xs font-medium">
                            {student.level} - {student.section}
                          </span>
                          <div className="w-[1px] mx-2 border border-l-[#919EAB3D]" />
                          <span className="text-[#5A5D72] text-xs font-medium">
                            Matrícula: <strong>{student.enrollment_code}</strong>
                          </span>
                        </div>
                      </div>
                    </td>

                    <td />
                  </tr>
                  {(fulfillments as [Fulfillment])
                    ?.filter((fulfillment) => fulfillment.student.id === student.id)
                    .map((fulfillment: Fulfillment) => (
                      <tr key={fulfillment.id} className="border-b border-black">
                        <td className="px-4 py-4 text-sm text-left">
                          <span className="flex flex-wrap">
                            {fulfillment?.status === 'PARTIAL_PAID' ? 'Pago parcial - ' : ''}
                            {fulfillment.order_name}{' '}
                          </span>
                        </td>
                        <td className="px-2 py-4 text-right text-[#5A5D72]">
                          {formatPrice(
                            fulfillment?.status === 'PARTIAL_PAID' ? payinData.total : fulfillment.paid_amount,
                            payinData.total_currency
                          )}
                        </td>
                      </tr>
                    ))}
                </>
              ))}
              <tr className="border-black bg-[#7E83B0] bg-opacity-8">
                <td className="px-2 py-4 text-left">
                  <strong className="text-[#5A5D72]">Subtotal</strong>
                </td>
                <td className="px-2 py-4 text-right">
                  <span>{formatPrice(payinData.total, payinData.total_currency)}</span>
                </td>
              </tr>
              <tr className="border-black border-y-2 bg-[#7E83B0] bg-opacity-12">
                <td className="px-2 py-4 text-left">
                  <strong>Total pagado</strong>
                </td>
                <td className="px-2 py-4 text-right">
                  <strong>{formatPrice(payinData.total, payinData.total_currency)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  const session = await getSession(context);
  const { school_id, payin_id } = context.query;
  const payinQuery = async () => {
    try {
      const payinQuery = await ApiClient.getIncomePayin(session?.token, school_id, payin_id);
      return payinQuery.data;
    } catch (ex) {
      Sentry.captureException(ex);
    }
  };
  const payinData = await payinQuery();

  const guardianQuery = async () => {
    try {
      const guardianPayinQuery = await ApiClient.getGuardian(session?.token, school_id, payinData?.guardian);
      return guardianPayinQuery.data as RetrieveGuardian;
    } catch (ex) {
      Sentry.captureException(ex);
    }
  };
  const guardianData = await guardianQuery();

  return {
    props: {
      session,
      payinData: payinData || {},
      guardianData: guardianData || {},
    },
  };
}

export default Receipt;
