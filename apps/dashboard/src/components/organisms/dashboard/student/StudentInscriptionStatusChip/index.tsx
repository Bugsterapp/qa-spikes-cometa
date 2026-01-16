import { InscriptionStatusEnum } from '@cometa/trpc/src/types';
import { FC, useMemo } from 'react';

import Status from '/src/components/Status';
import { Tooltip } from '/src/components/atoms/Tooltip';

type Props = { status: InscriptionStatusEnum; changeLabelToSchoolSelected?: boolean };

const getInscriptionStatus = (status: InscriptionStatusEnum, changeLabelToSchoolSelected?: boolean) => {
  const cycleText = changeLabelToSchoolSelected ? 'el ciclo escolar seleccionado' : 'el siguiente ciclo escolar';
  switch (status) {
    case InscriptionStatusEnum.Reinscrito:
      return {
        variant: 'success',
        tooltip: `El estudiante ha realizado el pago de su reinscripción a ${cycleText}`,
      } as const;
    case InscriptionStatusEnum.Inscrito:
      return {
        variant: 'info',
        tooltip: `El estudiante ha realizado el pago de su inscripción a ${cycleText}`,
      } as const;
    case InscriptionStatusEnum.Pendiente:
      return {
        variant: 'warning',
        tooltip: `El estudiante aún tiene pendiente el pago de su inscripción a ${cycleText}.`,
      } as const;
    default:
      return {
        variant: 'muted',
        tooltip: `El estudiante no tiene asignado un concepto de inscripción para ${cycleText}.`,
      } as const;
  }
};

const StudentInscriptionStatusChip: FC<Props> = ({ status, changeLabelToSchoolSelected = false }) => {
  const { variant, tooltip } = useMemo(
    () => getInscriptionStatus(status, changeLabelToSchoolSelected),
    [status, changeLabelToSchoolSelected]
  );

  return (
    <Tooltip message={tooltip}>
      <Status variant={variant}>{status}</Status>
    </Tooltip>
  );
};

export default StudentInscriptionStatusChip;
