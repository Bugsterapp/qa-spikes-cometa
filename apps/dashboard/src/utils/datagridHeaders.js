import Label from '../components/molecules/dashboard/Label';
import {
  formatDateShort,
  formatPrice,
  paymentTypeLabel,
  renderStatusLabel,
  formatDateShortWithHour,
  formatDate,
} from './general';

export const payout_detail_headers = () => [
  {
    field: 'order_name',
    headerName: 'Orden',
    sortable: false,
    align: 'left',
    headerAlign: 'left',
    width: 180,
    renderCell: (row) => renderText(`${row.order_name}`),
  },
  {
    field: 'student',
    headerName: 'Estudiante',
    sortable: false,
    align: 'left',
    headerAlign: 'left',
    width: 200,
    renderCell: (row) => renderText(`${row.student?.first_name} ${row.student?.last_name}`),
  },
  {
    field: 'guardian',
    headerName: 'Pagador (Tutor)',
    sortable: false,
    align: 'left',
    headerAlign: 'left',
    width: 200,
    renderCell: (row) => renderText(`${row.guardian?.first_name} ${row.guardian?.last_name}`),
  },
  {
    field: 'final_amount',
    headerName: 'Total Pagado',
    sortable: false,
    type: 'number',
    align: 'right',
    headerAlign: 'left',
    width: 130,
    renderCell: (row) => renderMoney(row.final_amount, 'MXN'),
  },
  {
    field: 'amount',
    headerName: 'Precio',
    sortable: false,
    type: 'number',
    align: 'right',
    headerAlign: 'left',
    width: 130,
    renderCell: (row) => renderMoney(row.final_amount, 'MXN'),
  },
];

export const render_due_orders = (numberDue, type, title) => {
  let color = 'success';
  let label = 'Sin deuda';
  if (numberDue >= 3) {
    color = 'error';
    label = 'Alta';
  } else if (numberDue >= 2) {
    color = 'medium';
    label = 'Media';
  } else if (numberDue === 1) {
    color = 'warning';
    label = 'Baja';
  } else {
    label = 'Sin deuda';
  }
  return (
    <div className="flex justify-center w-3/4">
      <Label variant="ghost" color={color}>
        {title && !!numberDue ? 'Morosidad ' : ''}
        {type === 'morosidad' ? label : numberDue}
      </Label>
    </div>
  );
};

export const render_category = (category) => {
  const categories = {
    INSCRIPTION: 'Inscripción',
    TRANSPORT: 'Transporte',
    MONTHLY_FEE: 'Colegiatura',
  };
  const DEFAULT = 'Otro';

  return categories[category] || DEFAULT;
};

export const due_orders_headers = () => [
  {
    field: 'name',
    sortable: false,
    headerName: 'Orden',
    align: 'left',
    headerAlign: 'left',
    width: 260,
    renderCell: (row) => renderText(`${row.name}`),
  },
  {
    field: 'due',
    sortable: false,
    headerName: 'Fecha Vcto.',
    align: 'left',
    headerAlign: 'left',
    width: 130,
    renderCell: (row) => renderDate(row.due),
  },
  {
    field: 'status',
    sortable: false,
    headerName: 'Estado',
    align: 'left',
    headerAlign: 'left',
    width: 120,
    renderCell: (row) => renderStatusLabel(row.has_partial_payins ? 'partial' : row.status),
  },
  {
    field: 'interest',
    sortable: false,
    headerName: 'Recargos',
    align: 'right',
    headerAlign: 'left',
    width: 150,
    renderCell: (row) => renderMoney(row.interest, row.currency),
  },
  {
    field: 'discount',
    sortable: false,
    headerName: 'Descuentos',
    align: 'right',
    headerAlign: 'left',
    width: 150,
    renderCell: (row) => renderMoney(row.discount, row.currency),
  },
  {
    field: 'final_amount',
    sortable: false,
    headerName: 'Por Pagar',
    align: 'right',
    headerAlign: 'left',
    width: 150,
    renderCell: (row) => {
      const finalAmount = parseFloat(row.final_amount);
      const paidAmount = parseFloat(row.paid_amount);
      return renderMoney(finalAmount - paidAmount, row.currency);
    },
  },
];

const renderText = (text) => (
  <div>
    <span className="py-1">{text}</span>
  </div>
);

export const renderMoney = (money, currency = 'MXN') => {
  if (!money || money === '0.00') return renderText('-');
  const moneyWithFormat = formatPrice(money, currency);
  const validate = moneyWithFormat === formatPrice(0, currency);
  return renderText(validate ? '-' : moneyWithFormat);
};

export const renderDate = (textDate) => renderText(formatDateShortWithHour(textDate));
export const renderDateShort = (textDate) => renderText(formatDateShort(textDate));
export const formatDateMonthYear = (date) => formatDate(date, 'MMMM YYYY');
export const renderPaymentType = (text) => renderText(paymentTypeLabel(text));
