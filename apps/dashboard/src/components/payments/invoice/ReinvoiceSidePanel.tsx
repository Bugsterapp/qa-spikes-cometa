import { InvoiceEnabledActions } from '@cometa/trpc/src/types';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';

import Sheet, { ContainerActions } from '/src/components/atoms/Sheet';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import useAlert, { defaultAlertTime } from '/src/hooks/useAlert';
import { api } from '/src/utils/api';

import { Button } from '../../ui/Button';
import ReinvoiceForm, { ReinvoiceFormSchema } from './ReinvoiceForm';

interface ReinvoiceSidePanelProps {
  onClose: () => void;
  open?: boolean;
  studentId: string;
  invoiceId: string;
  clientIdentifier: string;
  amount: number;
  enabledActions: Pick<InvoiceEnabledActions, 'reinvoice' | 'reinvoice_with_relation'>;
}

export default function ReinvoiceSidePanel({
  onClose,
  open,
  studentId,
  invoiceId,
  clientIdentifier,
  enabledActions,
}: Readonly<ReinvoiceSidePanelProps>) {
  const selectedSchoolId = useSelectedSchoolId();
  const utils = api.useUtils();
  const [hasRFCError, setHasRFCError] = useState(false);
  const [formIsValid, setFormIsValid] = useState(false);
  const router = useRouter();

  const { setAlertState } = useAlert();

  const onFinal = async () => {
    await utils.payments.retrieveInvoice.invalidate();
    await utils.payments.listInvoices.invalidate();
    onClose();
  };

  const { data: student, isPending: studentLoading } = api.manualPayments.studentDetails.useQuery(
    { studentId },
    {
      enabled: open,
    }
  );

  const mutation = api.invoices.reinvoice.useMutation({
    async onError() {
      await onFinal();
      const message = `¡No se pudo emitir la factura! ${hasRFCError ? 'Los datos no coinciden con los del SAT' : ''} `;
      setAlertState({
        open: true,
        message,
        severity: 'error',
        hideCross: true,
        alertTime: defaultAlertTime,
      });
    },
    async onSuccess() {
      await onFinal();
      router.push({ query: { ...router.query, invoice_detail_id: undefined } }, undefined, {
        shallow: true,
      });
      setAlertState({
        open: true,
        message: '¡Su factura entró en proceso de refacturación!',
        severity: 'success',
        hideCross: true,
        alertTime: defaultAlertTime,
      });
    },
  });

  const onSubmit = (data: ReinvoiceFormSchema) => {
    mutation.mutate({
      with_relation: data.with_relation === 'with_relation',
      invoiceId,
      schoolId: selectedSchoolId ?? '',
      observations: data.observations,
    });
  };

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Sheet
      open={open}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      id="reinvoice"
      key="reinvoice"
    >
      <Sheet.Content>
        <div className="flex flex-col flex-auto">
          <div className="sticky top-0 z-10 w-full bg-white">
            <SidebarHeader
              disabled={mutation.isPending}
              title="Refacturar"
              subtitle={
                <>
                  N°de folio: <strong className="text-[#212B36]">{clientIdentifier}</strong>
                </>
              }
              onClose={onClose}
              boxClassName="px-8 py-5"
            />
          </div>
          <ReinvoiceForm
            disabledWithOutRelation={!enabledActions.reinvoice}
            disabledWithRelation={!enabledActions.reinvoice_with_relation}
            studentLoading={studentLoading}
            open={open}
            student={student}
            onSubmit={onSubmit}
            setRFCError={setHasRFCError}
            onValidChange={setFormIsValid}
            ref={formRef}
          />
        </div>
        <ContainerActions>
          <Button
            variant="transparency"
            className="p-3 text-base text-green"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Volver
          </Button>
          <Button
            variant="success"
            className="p-3 text-base"
            onClick={() => formRef.current?.requestSubmit()}
            disabled={hasRFCError || !formIsValid || mutation.isPending}
          >
            Refacturar
          </Button>
        </ContainerActions>
      </Sheet.Content>
    </Sheet>
  );
}
