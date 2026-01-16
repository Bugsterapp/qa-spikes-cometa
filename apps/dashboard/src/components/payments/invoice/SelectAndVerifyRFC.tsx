import type { DashboardStudent, TaxingSystemEnum } from '@cometa/trpc/src/types';
import { api } from 'src/utils/api';
import Select from '../../Select';
import { cn } from 'src/utils/cn';
import { Button } from '../../ui/Button';
import { useToggle } from '@cometa/hooks';
import { useEffect, useState } from 'react';
import { Title, Value } from './InvoiceEmitSidepanel';
import ErrorIcon from 'public/assets/icons/ic_exclamation_solid.svg';
import taxRegimeValues from 'src/utils/static_data/taxRegimeValues';
import Sheet from 'src/components/atoms/Sheet';
import RFCDetail from '../../organisms/dashboard/RFCDetail';
import { useSelectedSchool, useSelectedSchoolId } from 'src/guards/AuthGuard';

interface ISelectAndVerifyRFCProps {
  student?: DashboardStudent;
  studentLoading: boolean;
  open?: boolean;
  disabled?: boolean;
  setRFCError?: (value: boolean) => void;
}

const SelectAndVerifyRFC = ({ student, studentLoading, open, disabled, setRFCError }: ISelectAndVerifyRFCProps) => {
  const toggle = useToggle();
  const school = useSelectedSchool();

  const [guardianId, setGuardianId] = useState<string>('');
  const utils = api.useUtils();

  const billingGuardianMutation = api.manualPayments.patchRFC.useMutation({
    onSettled: async () => {
      await utils.manualPayments.studentDetails.invalidate();
      await utils.guardian.verifyGuardians.invalidate();
    },
  });

  const currentBillingGuardianName = (id: string) => {
    const billingGuardian = student?.guardians.find((g) => g.id === id);

    return `${billingGuardian?.first_name} ${billingGuardian?.last_name}`;
  };

  const someHasRFC = student?.guardians.some((guardian) => guardian.billing_name);

  const { data: verify, isPending: isLoadingVerify } = api.guardian.verifyGuardians.useQuery(
    { guardianIds: student?.guardians.map((g) => g.id) ?? [] },
    {
      enabled: !!student?.guardians.length && open,
      retry: someHasRFC && 3,
    }
  );

  const notCanEmitGeneralPublic = student?.billing_guardian === null && school?.can_invoice_to_general_public === false;
  const hasRFCError =
    notCanEmitGeneralPublic || verify?.find((g) => g.guardian_id === student?.billing_guardian)?.valid === false;

  useEffect(() => {
    setRFCError?.(hasRFCError);
  }, [hasRFCError, setRFCError]);

  return (
    <>
      <div className="flex flex-col gap-y-7">
        <div className="space-y-2.5">
          <h4 className="text-base font-bold text-black">Facturación</h4>
          <span className="text-[#637381] text-sm font-normal">Seleccione a quien se emitirá la factura</span>
        </div>
        <Select
          placeholder="Facturación"
          className="w-full h-[54px]"
          disabled={studentLoading || isLoadingVerify || disabled}
          value={student?.billing_guardian ? student?.billing_guardian : 'general_public'}
          onValueChange={(value: string) => {
            if (student) {
              billingGuardianMutation.mutate({
                studentId: student.id,
                billing_guardian: value === 'general_public' ? null : value,
              });
            }
          }}
        >
          <Select.Content className="flex flex-col w-full overflow-hidden rounded-lg">
            <Select.Item value="general_public">Público en general</Select.Item>
            {student?.guardians
              .filter((guardian) => Boolean(guardian.billing_name))
              .map((guardian) => (
                <Select.Item value={guardian.id} key={guardian.id}>
                  {guardian.billing_name}
                </Select.Item>
              ))}
          </Select.Content>
        </Select>
        {student?.billing_guardian ? (
          <div>
            <div
              className={cn('rounded-[18px] border border-[#919EAB3D] border-solid px-5 py-4', {
                'border-[#FF4842] border-2': hasRFCError,
              })}
            >
              <div className="flex items-center justify-between border-b border-[#919EAB3D] border-solid pb-[10px] mb-4">
                <h5 className="uppercase text-[#637381] text-xs font-bold">Resumen de datos de facturación</h5>
                <Button
                  variant="ghost"
                  className="text-[#3366FF] font-bold"
                  size="sm"
                  onClick={() => {
                    setGuardianId(student.billing_guardian as string);
                    toggle.onOpen();
                  }}
                  disabled={disabled}
                  type="button"
                >
                  Editar
                </Button>
              </div>
              <div className="flex items-center justify-between mb-2.5">
                <Title text="Receptor:" />
                <Value text={currentBillingGuardianName(student.billing_guardian)} />
              </div>
              <div className="flex items-center justify-between mb-2.5">
                <Title text="RFC:" />
                <Value text={student.billing_guardian_info.tax_id ?? ''} />
              </div>
              <div className="flex items-center justify-between mb-2.5">
                <Title text="Regimen fiscal:" />
                <Value
                  text={
                    taxRegimeValues.find((tR) => tR.value === student.billing_guardian_info.taxing_system)?.name ?? ''
                  }
                />
              </div>
              <div className="flex items-center justify-between mb-2.5">
                <Title text="Razón Social:" />
                <Value text={student.billing_guardian_info.billing_name ?? ''} />
              </div>
            </div>
            {hasRFCError ? (
              <span className="flex items-center gap-2 text-[#7A0C2E] mt-2">
                <ErrorIcon className="w-5 h-5 text-[#FF4842]" />
                <span>Los datos no coinciden con los registrados en el SAT.</span>
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      {notCanEmitGeneralPublic ? (
        <span className="flex items-center gap-2 text-[#7A0C2E] mt-2">
          <ErrorIcon className="w-5 h-5 text-[#FF4842]" />
          <span>
            El colegio no está configurado para emitir facturas a público en general, contacta a tu Account Manager.
          </span>
        </span>
      ) : null}
      <SheetRFCDetail guardianId={guardianId} open={toggle.toggle} onClose={toggle.onClose} />
    </>
  );
};

interface ISheetRFCDetailProps {
  guardianId?: string;
  onClose: () => void;
  open: boolean;
}

export const SheetRFCDetail = ({ guardianId, open, onClose }: ISheetRFCDetailProps) => {
  const selectedSchoolId = useSelectedSchoolId();
  const [errors, setErrors] = useState<Record<string, any>>({});
  const utils = api.useUtils();

  const { data: guardianDetails } = api.guardian.getDetails.useQuery(
    { id: guardianId ?? '', schoolId: selectedSchoolId ?? '' },
    {
      enabled: !!selectedSchoolId && open,
    }
  );

  const updateGuardian = api.guardian.update.useMutation({
    async onSuccess(data) {
      if (data && 'type' in data && data.type === 'error') {
        setErrors(data.errors);
      } else {
        await utils.guardian.getDetails.invalidate();
        await utils.guardian.verifyGuardians.invalidate();
        onClose();
      }
    },
  });
  return (
    <Sheet
      open={open}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Sheet.Content>
        <RFCDetail
          onClose={() => {
            onClose();
            setErrors({});
          }}
          guardianDetail={guardianDetails}
          isLoading={updateGuardian.isPending}
          onSubmit={({ taxing_system, cfdi_config, ...values }) =>
            updateGuardian.mutate({
              id: guardianId ?? '',
              billing_info: {
                taxing_system: taxing_system as TaxingSystemEnum,
                cfdi_config: cfdi_config || undefined,
                ...values,
              },
            })
          }
          errorsMutation={errors}
        />
      </Sheet.Content>
    </Sheet>
  );
};

export default SelectAndVerifyRFC;
