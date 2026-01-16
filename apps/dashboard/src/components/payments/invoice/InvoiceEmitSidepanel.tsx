import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import Sheet from '/src/components/atoms/Sheet';
import { Skeleton as SkeletonText } from 'src/components/ui/Skeleton';
import { cn } from '/src/utils/cn';
import { formatPrice } from '/src/utils/general';
import LinkDetail from '../../atoms/LinkDetail';
import { Student } from '@cometa/trpc/src/types';
import { api } from '/src/utils/api';
import { useSession } from 'next-auth/react';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import { useRef, useState } from 'react';
import SidebarActions from '../../atoms/SidebarActions';
import useAlert from '/src/hooks/useAlert';
import { useQueryClient } from '@tanstack/react-query';
import SelectAndVerifyRFC from './SelectAndVerifyRFC';
import * as Sentry from '@sentry/nextjs';
import TextAreaGrow from '../../atoms/TextAreaGrow/TextAreaGrow';
import { TextField } from '@cometa/recreo';

export default function InvoiceEmitSidepanel({
  open,
  onOpenChange,
  fulfillment,
  payinFulfillmentId,
  onInvoiceEmit,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  fulfillment: {
    correlativeId: string;
    student: Student;
    guardian: {
      id: string;
      first_name: string;
      last_name: string;
    };
    totalPrice: number;
    orderName: string;
  };
  payinFulfillmentId: number;
  onInvoiceEmit: (invoiceId: string) => void;
}) {
  const { setAlertState } = useAlert();
  const session = useSession();
  const selectedSchoolId = useSelectedSchoolId();
  const [hasRFCError, setRFCError] = useState(false);
  const queryClient = useQueryClient();

  const { data: student, isPending: studentLoading } = api.manualPayments.studentDetails.useQuery(
    { studentId: fulfillment.student?.id ?? '' },
    {
      enabled: !!fulfillment.student?.id && !!session && open,
    }
  );
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [observations, setObservations] = useState('');

  const emitInvoice = api.payments.emitInvoice.useMutation({
    async onSuccess(data) {
      if (data && 'error' in data) {
        setAlertState({
          message: 'Ocurrió un error al emitir la factura. Por favor, intenta de nuevo.',
          severity: 'error',
          open: true,
        });

        if (data.status > 400) {
          Sentry.captureException(`Error al emitir factura — ${data.error}`);
        }
      } else {
        await queryClient.invalidateQueries({ queryKey: ['fulfillment_detail'] });
        onOpenChange(false);
        if (data) {
          setAlertState({
            message: '¡Factura emitida correctamente!',
            severity: 'success',
            open: true,
            action: { text: 'Ver factura', callback: () => onInvoiceEmit(data.id) },
          });
        }
      }
    },
  });

  return (
    <Sheet open={open} id="create_invoice" key="create_invoice">
      <Sheet.Content>
        <div className="flex flex-col flex-auto">
          <div className="sticky top-0 z-10 w-full px-8 bg-white">
            <SidebarHeader title="Emitir factura" onClose={() => onOpenChange(false)} />
          </div>
          <div className="flex flex-col justify-between px-8 mb-8">
            <h3 className="mb-4 text-xl font-bold text-black">Resumen de orden a facturar</h3>
            <div className="flex items-center justify-between mb-2.5">
              <Title text="Pagador:" />
              <LinkDetail
                href={`/guardian/${fulfillment?.guardian?.id}`}
                text={`${fulfillment?.guardian?.first_name} ${fulfillment?.guardian?.last_name}`}
                message="Ver detalle de tutor"
              />
            </div>
            <div className="flex items-center justify-between mb-2.5">
              <Title text="Monto pagado:" />
              <Value text={formatPrice(fulfillment.totalPrice)} />
            </div>
            <div className="flex items-center justify-between">
              <Title text="Concepto:" />
              <Value text={fulfillment.orderName} />
            </div>
          </div>
          <div className="px-8 mb-5">
            <SelectAndVerifyRFC
              open={open}
              student={student}
              studentLoading={studentLoading}
              setRFCError={setRFCError}
            />
          </div>
          <div className="px-8  mb-auto">
            <TextField label="Comentario adicional" className="w-full" textareaGrow value={observations}>
              <TextAreaGrow
                id="observations"
                className="border-none "
                ref={textAreaRef}
                onChange={(event) => {
                  const textarea = textAreaRef.current;
                  if (textarea) {
                    textarea.style.height = '56px';
                    textarea.style.height = `${textarea.scrollHeight}px`;
                  }
                  setObservations(event.target.value);
                }}
                errors={false}
              />
            </TextField>
          </div>
          <SidebarActions className="z-10 mt-5 bg-white">
            <button
              className="bg-white px-20 py-3 text-green hover:text-green-800 text-base font-bold disabled:text-[#919EABCC] rounded-lg outline-none"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Volver
            </button>
            <button
              className="text-white text-base font-bold px-20 py-3 rounded-lg bg-[#00AB55] hover:bg-green-800 disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] whitespace-nowrap outline-none"
              disabled={hasRFCError || emitInvoice.isPending}
              onClick={() =>
                emitInvoice.mutate({
                  payinFulfillmentId,
                  schoolId: selectedSchoolId ?? '',
                  observations: observations ?? '',
                })
              }
            >
              Emitir factura
            </button>
          </SidebarActions>
        </div>
      </Sheet.Content>
    </Sheet>
  );
}

export const Title = ({ text }: { text: string }) => (
  <label className="flex items-center text-xs font-medium text-gray-600 min-w-[113.5px]">{text}</label>
);
interface ValueProps {
  text: string;
  loading?: boolean;
  loaderWidth?: number;
  onClick?(): void;
  className?: string;
}

export const Value = ({ text, loading, loaderWidth, onClick, className }: ValueProps) => {
  const Tag = onClick ? 'button' : 'label';
  return (
    <>
      {loading ? (
        <SkeletonText loaderWidth={loaderWidth} />
      ) : (
        <Tag
          onClick={onClick}
          className={cn('col-span-3 text-sm font-semibold w-fit text-foreground break-all', className, {
            'border-blue-secondary border p-2 rounded hover:bg-info/8 flex items-center gap-1 group': Boolean(onClick),
          })}
        >
          {text}
          {onClick ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                className="group-hover:[transform:translate(2px,-2px)] transition-all duration-100 ease-in-out"
                d="M16.6663 4.16683C16.6663 3.70659 16.2932 3.3335 15.833 3.3335H11.6663C11.2061 3.3335 10.833 3.70659 10.833 4.16683C10.833 4.62707 11.2061 5.00016 11.6663 5.00016H13.808L11.0746 7.74183C10.9169 7.8983 10.8281 8.1113 10.8281 8.3335C10.8281 8.55569 10.9169 8.76869 11.0746 8.92516C11.2311 9.08292 11.4441 9.17166 11.6663 9.17166C11.8885 9.17166 12.1015 9.08292 12.258 8.92516L14.9996 6.1835V8.3335C14.9996 8.79373 15.3727 9.16683 15.833 9.16683C16.2932 9.16683 16.6663 8.79373 16.6663 8.3335V4.16683Z"
                fill="#3366FF"
              />
              <path
                className="group-hover:[transform:translate(-2px,2px)] transition-all duration-100 ease-in-out"
                d="M8.92467 11.0751C8.7682 10.9174 8.55521 10.8286 8.33301 10.8286C8.11081 10.8286 7.89781 10.9174 7.74134 11.0751L4.99967 13.8084V11.6668C4.99967 11.2065 4.62658 10.8334 4.16634 10.8334C3.7061 10.8334 3.33301 11.2065 3.33301 11.6668V15.8334C3.33301 16.2937 3.7061 16.6668 4.16634 16.6668H8.33301C8.79324 16.6668 9.16634 16.2937 9.16634 15.8334C9.16634 15.3732 8.79324 15.0001 8.33301 15.0001H6.18301L8.92467 12.2584C9.08243 12.102 9.17117 11.889 9.17117 11.6668C9.17117 11.4446 9.08243 11.2316 8.92467 11.0751V11.0751Z"
                fill="#3366FF"
              />
            </svg>
          ) : null}
        </Tag>
      )}
    </>
  );
};
