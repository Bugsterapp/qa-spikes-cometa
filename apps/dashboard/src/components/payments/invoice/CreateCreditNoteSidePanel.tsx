import { useRouter } from 'next/router';
import { useRef, useState } from 'react';

import Sheet, { ContainerActions } from '/src/components/atoms/Sheet';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import useAlert, { defaultAlertTime } from '/src/hooks/useAlert';
import { api } from '/src/utils/api';

import { Button } from '../../ui/Button';
import CreateCreditNoteForm, { CreateCreditNoteFormSchema } from './CreateCreditNoteForm';

interface CreateCreditNoteProps {
  onClose: () => void;
  open?: boolean;
  studentId: string;
  invoiceId: string;
  clientIdentifier: string;
  amount: number;
  amountInCreditNotes: number;
}

export default function CreateCreditNoteSidePanel({
  onClose,
  open,
  studentId,
  invoiceId,
  clientIdentifier,
  amount,
  amountInCreditNotes,
}: Readonly<CreateCreditNoteProps>) {
  const selectedSchoolId = useSelectedSchoolId();
  const utils = api.useUtils();
  const [hasRFCError, setHasRFCError] = useState(false);
  const [formIsValid, setFormIsValid] = useState(false);
  const router = useRouter();

  const { data: student, isPending: studentLoading } = api.manualPayments.studentDetails.useQuery(
    { studentId },
    {
      enabled: open,
    }
  );
  const { setAlertState } = useAlert();

  const onFinal = async () => {
    await utils.payments.retrieveInvoice.invalidate();
    await utils.payments.listInvoices.invalidate();
    onClose();
  };

  const mutation = api.invoices.createCreditNote.useMutation({
    async onError() {
      await onFinal();
      const message = `¡No se pudo emitir la nota de crédito! ${
        hasRFCError ? 'Los datos no coinciden con los del SAT' : ''
      } `;
      setAlertState({
        open: true,
        message,
        severity: 'error',
        hideCross: true,
        alertTime: defaultAlertTime,
      });
    },
    async onSuccess(data) {
      await onFinal();
      router.push({ query: { ...router.query, invoice_detail_id: undefined } }, undefined, {
        shallow: true,
      });
      setAlertState({
        open: true,
        message: `Se ha registrado la nota de crédito (N°de folio: ${data?.client_identifier})`,
        severity: 'success',
        action: {
          text: 'Ver detalles',
          callback() {
            router.push({ query: { ...router.query, invoice_detail_id: data?.id } }, undefined, {
              shallow: true,
            });
          },
        },
      });
    },
  });

  const onSubmit = (data: CreateCreditNoteFormSchema) => {
    mutation.mutate({
      amount: data.amount.toString(),
      invoiceId,
      payment_method: data.payment_method,
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
      id="create-credit-note"
      key="create-credit-note"
    >
      <Sheet.Content>
        <div className="flex flex-col flex-auto">
          <div className="sticky top-0 z-10 w-full bg-white">
            <SidebarHeader
              disabled={mutation.isPending}
              title="Nota de crédito"
              onClose={onClose}
              boxClassName="px-8 py-5"
            />
          </div>
          <CreateCreditNoteForm
            onSubmit={onSubmit}
            amount={amount}
            amountInCreditNotes={amountInCreditNotes}
            clientIdentifier={clientIdentifier}
            disabledVerifyRFC={mutation.isPending}
            open={open}
            student={student}
            studentLoading={studentLoading}
            setRFCError={setHasRFCError}
            onValidChange={(valid) => {
              setFormIsValid(valid);
            }}
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
            Crear nota de crédito
          </Button>
        </ContainerActions>
      </Sheet.Content>
    </Sheet>
  );
}
