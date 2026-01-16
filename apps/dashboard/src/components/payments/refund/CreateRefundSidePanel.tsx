import SidebarHeader from 'src/components/molecules/dashboard/SidebarHeader';
import Sheet, { ContainerActions } from 'src/components/atoms/Sheet';
import { Button } from '../../ui/Button';
import CreateRefundForm, { CreateRefundFormSchema, unassignconceptEnum } from './CreateRefundForm';
import { useRef, useState } from 'react';
import { Payin, PayinFulfillmentDetail } from '@cometa/trpc/src/types';
import { api } from '/src/utils/api';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import useAlert from '/src/hooks/useAlert';
import { format } from 'date-fns';

interface CreateRefundSidePanelProps {
  onClose: () => void;
  open?: boolean;
  payinFulfillments: PayinFulfillmentDetail[];
  payins: Payin[];
}

export default function CreateRefundSidePanel({
  onClose,
  open,
  payinFulfillments,
  payins,
}: Readonly<CreateRefundSidePanelProps>) {
  const { setAlertState } = useAlert();
  const selectedSchoolId = useSelectedSchoolId();
  const utils = api.useUtils();
  const [formIsValid, setFormIsValid] = useState(false);
  const onFinal = async () => {
    await utils.payments.retrieveInvoice.invalidate();
    await utils.payments.listInvoices.invalidate();
    await utils.payments.listFulfillment.invalidate();
    await utils.payments.retrieveFulfillment.invalidate();
    onClose();
  };

  const { mutate, isPending: isLoading } = api.payments.refund.useMutation({
    async onError() {
      await onFinal();
      setAlertState({
        open: true,
        message: 'Ha ocurrido un error al registrar la devolución del pago',
        severity: 'error',
      });
    },
    async onSuccess(data) {
      await onFinal();
      if (data?.error) {
        setAlertState({
          message: data.error,
          severity: 'error',
          open: true,
        });
      } else {
        setAlertState({
          open: true,
          message: 'Se ha registrado la devolución del pago',
          severity: 'success',
        });
      }
    },
  });

  const onSubmit = (data: CreateRefundFormSchema) => {
    const payload = {
      payinFulfillmentId: data.id.toString(),
      amount: data.amount,
      invoiceAction: data.invoiceAction,
      comment: data.comment,
      paymentMethod: data.paymentMethod,
      registeredAt: format(data.registeredAt, 'yyyy-MM-dd'),
      schoolId: selectedSchoolId as string,
      unassignConcept: data.unassignConcept === unassignconceptEnum.unassingConcept,
    };
    mutate(payload);
  };
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Sheet
      open={open}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      id="create-refund"
      key="create-refund"
    >
      <Sheet.Content>
        <div className="flex flex-col flex-auto">
          <div className="sticky top-0 z-10 w-full bg-white">
            <SidebarHeader title="Generar devolución" onClose={onClose} boxClassName="px-8 py-5" />
          </div>
          <CreateRefundForm
            onSubmit={onSubmit}
            payinFulfillments={payinFulfillments}
            payins={payins}
            ref={formRef}
            onValidChange={(valid) => {
              setFormIsValid(valid);
            }}
            disabled={isLoading}
          />
        </div>
        <ContainerActions>
          <Button variant="transparency" className="p-3 text-base text-green" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="success"
            className="p-3 text-base"
            onClick={() => formRef.current?.requestSubmit()}
            disabled={!formIsValid || isLoading}
          >
            Generar devolución
          </Button>
        </ContainerActions>
      </Sheet.Content>
    </Sheet>
  );
}
