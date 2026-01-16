import React from 'react';

import { Tooltip } from '/src/components/atoms/Tooltip';
import Status from '/src/components/Status';

type Props = { state?: string };
type StatusProps = 'warning' | 'success' | 'muted' | 'info' | 'error';

const StudentStateCard: React.FC<Props> = ({ state }) => {
  if (!state) return;
  const statusInfo: { [key: string]: { name: string; tooltip: string; variant?: StatusProps } } = {
    new_student: {
      name: 'Nuevo ingreso',
      tooltip: 'Este estudiante empezará a cursar a partir de un próximo ciclo escolar',
      variant: 'warning',
    },
    active: {
      name: 'Activo',
      tooltip: 'Este estudiante está cursando el ciclo actual',
      variant: 'success',
    },
    inactive: {
      name: 'Inactivo',
      tooltip: 'Este estudiante no está cursando el ciclo actual, pero aún no ha sido dado de baja',
      variant: 'muted',
    },
    graduated: {
      name: 'Graduado',
      tooltip: 'Este estudiante ha completado sus estudios en el colegio',
      variant: 'info',
    },
    dropped_out: {
      name: 'Baja',
      tooltip: 'Este estudiante ha sido dado de baja',
      variant: 'error',
    },
  };

  const { name, tooltip, variant } = statusInfo[state] || {
    name: 'Desconocido',
    tooltip: 'Estado desconocido',
    variant: 'muted',
  };

  return (
    <Tooltip message={tooltip}>
      <Status variant={variant}>{name}</Status>
    </Tooltip>
  );
};

export default StudentStateCard;
