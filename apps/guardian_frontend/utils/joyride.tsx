export const FIRST_PAYMENT_PENDING_JOYRIDE = [
  {
    target: '.pending-alert',
    content: 'Aquí podrás encontrar el detalle del pago que acabas de iniciar.',
    disableBeacon: true,
  },
  {
    target: '.menu-icon',
    content: (
      <div>
        Una vez que la transacción se <br /> registre como pagada, podrás <br /> ver el detalle de tu compra <br />{' '}
        encontrarla aquí.
      </div>
    ),
    disableBeacon: true,
  },
];

export const FIRST_PAYMENT_JOYRIDE = [
  {
    target: '.menu-icon',
    content: 'Aquí encontrarás tu historial de pagos.',
    disableBeacon: true,
  },
];

export const MENU_JOYRIDE = [
  {
    target: '.menu-icon',
    content: 'En el menú podrás gestionar tus RFCs, ver tus datos de perfil, tus estudiantes y tu historial de pagos.',
    disableBeacon: true,
  },
];

export const CHANGE_RFC_JOYRIDE = [
  {
    target: '.change-rfc',
    content: <div className="w-48">Aquí podrás elegir el RFC al que quieras facturar las órdenes de este alumno</div>,
    disableBeacon: true,
  },
];

export const SET_RFC_INVOICE_CONFIRM = (id: string) => [
  {
    target: `#card-${id}-change-rfc`,
    content: <div className="w-48">Aquí selecciona el RFC para facturar los pagos de este estudiante.</div>,
    disableBeacon: true,
  },
];

export const FIRST_SELECT_SCHOOLS_JOYRIDE = [
  {
    target: '#school-select',
    content: 'Aquí podrás cambiar el colegio seleccionado para tus pagos.',
    disableBeacon: true,
  },
];
