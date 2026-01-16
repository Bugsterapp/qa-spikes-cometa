import { useMemo } from 'react';
import { TOrderDashboard, CartItem, getOrderType } from '@cometa/hooks';
import Counter from '/src/components/ui/Counter';
import { formatPrice } from '/src/utils/general';
import { OrderType, getOrderTypeLabel } from '/src/constants/orders';
import Trash from '/public/assets/icons/trash.svg';

export interface SelectedOrdersDetailProps {
  selectedItems: TOrderDashboard[];
  cartItems: CartItem[];
  totalToPay: number;
  onUpdateQuantity: (item: TOrderDashboard, quantity: number) => void;
  onRemoveItem: (item: TOrderDashboard) => void;
  countFulfillmentSelected: number;
  countOptionalSelected: number;
  countOnlineStoreSelected: number;
}

interface OrderRow {
  item: TOrderDashboard;
  name: string;
  type: OrderType;
  quantity: number;
  price: number;
  maxStock?: number;
}

const getOrderPrice = (item: TOrderDashboard): number => {
  if ('pending_amount' in item) {
    return Number(item.pending_amount);
  }
  if ('final_amount' in item) {
    return Number(item.final_amount);
  }
  return 0;
};

export default function SelectedOrdersDetail({
  selectedItems,
  cartItems,
  totalToPay,
  onUpdateQuantity,
  onRemoveItem,
  countFulfillmentSelected,
  countOptionalSelected,
  countOnlineStoreSelected,
}: Readonly<SelectedOrdersDetailProps>) {
  const totalCount = countFulfillmentSelected + countOptionalSelected + countOnlineStoreSelected;

  const orderRows: OrderRow[] = useMemo(() => {
    const cartItemsMap = new Map<string, number>();
    cartItems.forEach((cartItem) => {
      const key = `${cartItem.order}-${cartItem.student || 'null'}`;
      cartItemsMap.set(key, (cartItemsMap.get(key) || 0) + 1);
    });

    return selectedItems.map((item) => {
      const type = getOrderType(item);
      const unitPrice = getOrderPrice(item);

      const studentId = 'student' in item && item.student ? item.student.id : 'null';
      const key = `${item.order_id}-${studentId}`;
      const itemQuantity = cartItemsMap.get(key) || 0;

      const quantity = itemQuantity || 1;
      const price = unitPrice * quantity;

      const maxStock = 'stock' in item && item.stock?.is_limited ? item.stock?.quantity : undefined;

      return {
        item,
        name: item.name,
        type,
        quantity,
        price,
        maxStock,
      };
    });
  }, [selectedItems, cartItems]);

  return (
    <div className="mt-9 rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <h3 className="text-base font-semibold text-[#212B36]">
          Detalle de órdenes seleccionadas{' '}
          <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 bg-[#F4F6F8] rounded-full text-sm font-medium text-[#637381]">
            {totalCount}
          </span>
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead className="bg-[#F4F6F8]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#637381] uppercase tracking-wider w-[40%]">
                Órdenes
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#637381] uppercase tracking-wider w-[20%]">
                Tipo
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-[#637381] uppercase tracking-wider w-[20%]">
                Cantidad
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-[#637381] uppercase tracking-wider w-[15%]">
                Precio total
              </th>
              <th className="px-6 py-3 w-[5%]" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orderRows.map((row) => (
              <tr
                key={'student' in row.item && row.item.student ? `${row.item.id}-${row.item.student.id}` : row.item.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-[#212B36]">{row.name}</p>
                    <p className="text-xs text-[#637381] mt-1">{formatPrice(getOrderPrice(row.item), 'MXN')}</p>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="text-sm text-[#637381]">{getOrderTypeLabel(row.type)}</span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    {row.type === OrderType.SCHOLAR ? (
                      <span className="text-sm text-[#637381]">Único</span>
                    ) : (
                      <Counter
                        maxValue={row.maxStock || 999}
                        initialValue={row.quantity}
                        minValue={1}
                        disabled={false}
                        onChange={(val) => onUpdateQuantity(row.item, val)}
                      />
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-semibold text-[#212B36]">{formatPrice(row.price, 'MXN')}</span>
                </td>

                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => onRemoveItem(row.item)}
                    className="p-1 rounded hover:bg-gray-200 transition-colors text-[#637381] hover:text-[#212B36]"
                    aria-label="Eliminar orden"
                  >
                    <Trash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white border-t border-gray-200">
        <div className="flex items-center py-4">
          <div className="w-[40%] px-6" />
          <div className="w-[20%] px-6" />
          <div className="w-[20%] px-6 text-center">
            <span className="text-base font-semibold text-[#212B36]">Total a pagar</span>
          </div>
          <div className="w-[15%] px-6 text-right">
            <span className="text-lg font-bold text-[#212B36]">{formatPrice(totalToPay, 'MXN')}</span>
          </div>
          <div className="w-[5%] px-6" />
        </div>
      </div>
    </div>
  );
}
