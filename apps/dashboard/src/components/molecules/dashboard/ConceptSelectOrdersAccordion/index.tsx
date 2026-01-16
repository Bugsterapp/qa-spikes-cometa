import type { VirtualOrderSerializerV2 } from '@cometa/trpc/src/types';
import IcEdit from 'public/assets/icons/ic_edit.svg';
import { useState, type Dispatch, type SetStateAction } from 'react';
import Accordion from '/src/components/atoms/Accordion';
import { Checkbox } from '/src/components/atoms/RadixCheckbox';
import { Tooltip } from '/src/components/atoms/Tooltip';
import type { ISelectedOrders } from '/src/components/organisms/dashboard/ConceptAssignmentEdit';
import { useGetPermissions } from '/src/guards/AuthGuard';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { Events } from '/src/constants/events';
import { formatDateMonthYear } from '/src/utils/datagridHeaders';
import { formatPrice } from '/src/utils/general';

interface ConceptSelectOrdersAccordionProps {
  orders: VirtualOrderSerializerV2[];
  selectedOrders: ISelectedOrders[];
  setSelectedOrders: Dispatch<SetStateAction<ISelectedOrders[]>>;
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
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' };
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

  const ordersCheckBox = orders
    .sort((a, b) =>
      isOptional
        ? a.name.localeCompare(b.name)
        : new Date(`${a.due}T00:00`).getTime() - new Date(`${b.due}T00:00`).getTime()
    )
    .map(({ id, due }) => {
      const index = selectedOrders.findIndex(({ id: orderId }) => orderId === id);
      const { checked, has_fulfillment } = selectedOrders[index] || {};
      const monthStr = formatDateMonthYear(due);
      const dueDateStr = !isOptional ? formatDate(due as string) : null;
      const handleCheckboxClick = () => {
        if (onEdit || !has_fulfillment) {
          const newSelected = [...selectedOrders];
          newSelected[index].checked = !checked;
          setSelectedOrders(newSelected);
          changeOrders?.();
          sendTrackEventWithUserName(Events.concept_click_month_charged, {
            checked: `${!checked}`,
          });
        }
      };

      return (
        <div className="hover:bg-gray-200 hover:rounded-b-md" key={id}>
          <div className="flex flex-row items-center justify-between py-4 pl-6 pr-6">
            <button
              className="flex flex-row items-center gap-3"
              onClick={() => {
                if (has_fulfillment) return;
                handleCheckboxClick();
              }}
              type="button"
            >
              <Tooltip
                message="Esta órden ya tiene
               un pago registrado por lo que
               no puede ser desasignada"
                disableHover={!has_fulfillment}
              >
                <Checkbox checked={checked} disabled={Boolean(has_fulfillment)} onClick={handleCheckboxClick} />
              </Tooltip>
              <div className="flex flex-col">
                <span className="text-sm font-medium capitalize select-none">{monthStr}</span>
                <span className="text-xs text-[#637381] select-none">{dueDateStr}</span>
              </div>
            </button>
            <span className="text-sm font-medium capitalize">
              {formatPrice(
                orders.find(({ id: orderId }) => orderId === id)?.fulfillment_amount ??
                  orders.find(({ id: orderId }) => orderId === id)?.price ??
                  0,
                'MXN'
              )}{' '}
              MXN
            </span>
          </div>
        </div>
      );
    });

  const optionalOrdersCheckBox = orders.map((order) => {
    // Find the index only once for better performance.
    const index = selectedOrders.findIndex(({ id: orderId }) => orderId === order.id);
    const isSelectedOrderPresent = index !== -1;
    // Destructure properties safely.
    const { checked = false, has_fulfillment = false } = isSelectedOrderPresent ? selectedOrders[index] : {};
    const handleCheckboxClick = () => {
      if (has_fulfillment && !isOptional) return;
      setSelectedOrders((prevSelectedOrders) =>
        prevSelectedOrders.map((order, orderIndex) =>
          orderIndex === index ? { ...order, checked: !order.checked } : order
        )
      );
      changeOrders?.();
    };

    const formattedName = formatName(order.name);
    const orderDetails = orders.find(({ id: orderId }) => orderId === order.id);
    const formattedPrice = formatPrice(orderDetails?.fulfillment_amount ?? orderDetails?.price ?? 0, 'MXN');
    return (
      <div className="hover:bg-gray-200" key={order.id}>
        <div className="flex flex-row items-center justify-between py-4 pl-6 pr-6">
          <div className="flex flex-row items-center gap-3">
            <Checkbox checked={checked} onCheckedChange={handleCheckboxClick} />
            <div className="flex flex-col">
              <span className="mb-1 text-sm font-medium capitalize">{formattedName}</span>
              {order.has_fulfillment && (
                <span className="text-xs text-[#637381]">Esta orden tiene al menos un pago registrado</span>
              )}
            </div>
          </div>
          <span className="text-sm font-medium capitalize">{formattedPrice} MXN</span>
        </div>
      </div>
    );
  });

  const checkedAll = selectedOrders.every((order) => order.checked);

  const handleCheckboxClickAll = () => {
    setSelectedOrders((prevSelectedOrders) =>
      prevSelectedOrders.map((order) => ({ ...order, checked: order.has_fulfillment ? order.checked : !checkedAll }))
    );
    changeOrders?.();
  };

  return (
    <Accordion
      defaultExpanded
      onChange={(_, expanded) => {
        sendTrackEventWithUserName(Events.concept_click_drop_month_charged, {
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
          <div className="flex flex-row items-center justify-between rounded-t-lg h-14">
            <div className="rounded-t-lg flex flex-row items-center justify-between text-[#637381] w-full h-full px-6 bg-[#F9FAFB]">
              <div className="flex flex-row items-center gap-3">
                <Checkbox
                  checked={checkedAll || (selectedOrders.some((order) => order.checked) ? 'indeterminate' : false)}
                  disabled={selectedOrders.every((order) => order.has_fulfillment)}
                  onClick={handleCheckboxClickAll}
                />
                <span className="text-sm font-semibold">Meses a cobrar</span>
              </div>
              <span className="text-sm font-semibold">Precio (sin becas)</span>
            </div>
            {!onEdit && isEdit && permissions?.can_edit_concept_assignment && (
              <button
                onClick={() => {
                  sendTrackEventWithUserName(Events.concept_click_edit_orders);
                  setOnEdit(true);
                }}
                className="flex flex-row items-center pr-2 text-center bg-transparent"
                type="button"
              >
                <div className="m-2">
                  <IcEdit fill="#36F" />
                </div>
                <span className="text-sm font-bold text-blue-secondary-200">Editar</span>
              </button>
            )}
          </div>
          <div className="flex flex-col divide-y divide-[#DFE3E8]">{ordersCheckBox}</div>
        </div>
      )}
      {isOptional && (
        <div className="flex flex-col rounded-lg border border-[#DFE3E8]">
          <div className="flex flex-row items-center justify-between rounded-t-lg h-14">
            <div className="rounded-t-lg flex flex-row items-center justify-between text-[#637381] w-full h-full px-6 bg-[#F9FAFB]">
              <div className="flex flex-row items-center gap-3">
                <Checkbox
                  checked={checkedAll || (selectedOrders.some((order) => order.checked) ? 'indeterminate' : false)}
                  disabled={selectedOrders.every((order) => order.has_fulfillment)}
                  onClick={handleCheckboxClickAll}
                />
                <span className="text-sm font-semibold">Órdenes por asignar</span>
              </div>
              <span className="text-sm font-semibold">Precio (sin becas)</span>
            </div>
          </div>
          <div className="flex flex-col divide-y divide-[#DFE3E8]">{optionalOrdersCheckBox}</div>
        </div>
      )}
    </Accordion>
  );
};

export default ConceptSelectOrdersAccordion;
