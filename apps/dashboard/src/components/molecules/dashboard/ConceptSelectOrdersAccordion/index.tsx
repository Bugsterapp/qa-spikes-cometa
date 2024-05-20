import { Divider } from '@mui/material';

import Accordion from '/src/components/atoms/Accordion';
import IcEdit from 'public/assets/icons/ic_edit.svg';
import { Dispatch, SetStateAction, useState } from 'react';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { useGetPermissions } from '/src/guards/AuthGuard';
import { formatDateMonthYear } from '/src/utils/datagridHeaders';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';

interface ConceptSelectOrdersAccordionProps {
  orders: any[];
  selectedOrders: any[];
  setSelectedOrders: Dispatch<SetStateAction<any[]>>;
  onEditState: boolean;
  isEdit?: boolean;
  changeOrders?: () => void;
  isOptional?: boolean;
}
const ConceptSelectOrdersAccordion = ({
  orders,
  selectedOrders,
  setSelectedOrders,
  changeOrders,
  isEdit = false,
  onEditState = false,
  isOptional,
}: ConceptSelectOrdersAccordionProps) => {
  const [onEdit, setOnEdit] = useState(onEditState);
  const permissions = useGetPermissions();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return `Vence el ${new Intl.DateTimeFormat('es-ES', options).format(date)}`;
  };

  const formatName = (name: string) => {
    const splitedName = name.split('-').map((word) => word.trim());

    if (splitedName.length > 1 && splitedName.length < 3) {
      return splitedName[1];
    }
    if (splitedName.length === 1) {
      return splitedName[0];
    }
    if (splitedName.length === 3) {
      return `${splitedName[1]} / ${splitedName[2]}`;
    }
    if (splitedName.length > 3) {
      return `${splitedName[1]} / ${splitedName[2]} / ${splitedName[3]}`;
    }
  };

  const handleClick = (id: any, checked: any) => {
    setSelectedOrders((prevSelectedOrders) =>
      prevSelectedOrders.map((order) => (order.id === id ? { ...order, checked: !order.checked } : order))
    );
    changeOrders?.();
    if (!isOptional) {
      sendTrackEventWithUserName('dashboard: Concept | Clicked month to be charged', {
        checked: `${!checked}`,
      });
    }
  };
  const ordersCheckBox = orders
    .sort((a, b) => (isOptional ? a.name - b.name : a.dueDate.getTime() - b.dueDate.getTime()))
    .map(({ id, dueDate }) => {
      const index = selectedOrders.findIndex(({ id: orderId }) => orderId == id);
      const { checked, has_fulfillment } = selectedOrders[index] || {};
      const monthStr = formatDateMonthYear(dueDate);
      const dueDateStr = !isOptional && formatDate(dueDate);
      const handleCheckboxClick = (e: any) => {
        e.stopPropagation();
        !has_fulfillment && handleClick(id, e.target.checked);
      };
      return (
        <div className="hover:bg-gray-200" key={id}>
          <div className="flex flex-row items-center justify-between py-4 pl-6 pr-6">
            <div className="flex flex-row items-center gap-3">
              <Tooltip
                message="Esta órden ya tiene 
               un pago registrado por lo que
               no puede ser desasignada"
                disableHover={!has_fulfillment}
              >
                <Checkbox
                  defaultChecked={checked}
                  disabled={has_fulfillment}
                  value={checked}
                  onClick={handleCheckboxClick}
                />
              </Tooltip>
              <div className="flex flex-col">
                <span className="text-sm font-medium capitalize">{monthStr}</span>
                <span className="text-xs text-[#637381]">{dueDateStr}</span>
              </div>
            </div>
            <span className="text-sm font-medium capitalize">
              {formatPrice(orders.find(({ id: orderId }) => orderId == id)?.price, 'MXN')} MXN
            </span>
          </div>
          <Divider />
        </div>
      );
    });

  const optionalOrdersCheckBox = orders.map((order) => {
    // Find the index only once for better performance.
    const index = selectedOrders.findIndex(({ id: orderId }) => orderId === order.id);
    const isSelectedOrderPresent = index !== -1;
    // Destructure properties safely.
    const { checked = false, has_fulfillment = false } = isSelectedOrderPresent ? selectedOrders[index] : {};

    // Wrap in a function to prevent the default Checkbox event and stop propagation.
    const handleCheckboxClick = (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      if (has_fulfillment) return;
      setSelectedOrders((prevSelectedOrders) =>
        prevSelectedOrders.map((order, orderIndex) =>
          orderIndex === index ? { ...order, checked: !order.checked } : order
        )
      );
      changeOrders?.();
    };

    // Use the returned value from the format functions.
    const formattedName = formatName(order.name);
    const orderPrice = orders.find(({ id: orderId }) => orderId === order.id)?.price;
    const formattedPrice = formatPrice(orderPrice, 'MXN');

    return (
      <div className="hover:bg-gray-200" key={order.id}>
        {/* rest of your JSX */}
        <div className="flex flex-row items-center justify-between py-4 pl-6 pr-6">
          <div className="flex flex-row items-center gap-3">
            <Checkbox checked={checked} value={checked} onClick={handleCheckboxClick} />

            <div className="flex flex-col">
              <span className="text-sm mb-1 font-medium capitalize">{formattedName}</span>
            </div>
          </div>
          <span className="text-sm font-medium capitalize">{formattedPrice} MXN</span>
        </div>
        <Divider />
      </div>
    );
  });

  return (
    <Accordion
      defaultExpanded
      onChange={(_, expanded) => {
        sendTrackEventWithUserName('dashboard: Concept | Clicked drop month to be charged', {
          expanded: `${expanded}`,
        });
      }}
      header={
        <div>
          <h1 className="font-semibold ">
            {isOptional ? 'Configuración de órdenes de concepto' : 'Configuración de meses a cobrar'}
          </h1>
          <span className="text-xs text-gray-600">
            Puedes personalizar las órdenes que se generarán al asignar este concepto.
          </span>
        </div>
      }
    >
      {!isOptional && (
        <div className="flex flex-col rounded-lg border border-[#DFE3E8]">
          <div className="flex flex-row items-center justify-between h-14 rounded-t-lg">
            <div className="rounded-t-lg flex flex-row items-center justify-between text-[#637381] w-full h-full px-6 bg-[#F9FAFB]">
              <span className="text-sm font-semibold">Meses a cobrar</span>
              <span className="text-sm font-semibold">Precio (sin becas)</span>
            </div>
            {!onEdit && isEdit && permissions?.can_edit_concept_assignment && (
              <button className="flex flex-row items-center pr-2 text-center bg-transparent">
                <div className="m-2">
                  <IcEdit fill="#36F" />
                </div>
                <span
                  className="text-sm font-bold text-blue-secondary-200"
                  onClick={() => {
                    sendTrackEventWithUserName('dashboard: Concept | Click edit orders');
                    setOnEdit(true);
                  }}
                >
                  Editar
                </span>
              </button>
            )}
          </div>
          <div className="flex flex-col cursor-pointer">{ordersCheckBox}</div>
        </div>
      )}
      {isOptional && (
        <div className="flex flex-col rounded-lg border border-[#DFE3E8]">
          <div className="flex flex-row items-center justify-between h-14 rounded-t-lg">
            <div className="rounded-t-lg flex flex-row items-center justify-between text-[#637381] w-full h-full px-6 bg-[#F9FAFB]">
              <span className="text-sm font-semibold">Órdenes por asignar</span>
              <span className="text-sm font-semibold">Precio (sin becas)</span>
            </div>
          </div>
          <div className="flex flex-col cursor-pointer">{optionalOrdersCheckBox}</div>
        </div>
      )}
    </Accordion>
  );
};

export default ConceptSelectOrdersAccordion;

import { cn } from '../../../../utils/cn';
import React from 'react';
import { formatPrice } from '/src/utils/general';
import { Tooltip } from '/src/components/atoms/Tooltip';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    data-testid="months-checkbox"
    className={cn(
      'peer h-5 w-5 shrink-0 rounded-md border border-green ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-green data-[state=checked]:text-white',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
      <Check className="w-5 h-5" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
