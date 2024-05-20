import { GuardianDependentOrder } from '@cometa/trpc/src/types';
import {
  ProjectEnum,
  IUseSelectionOptions,
  useSelectionStore,
  DependentFulfillmentOrder,
} from './useFulfillmentSelection';

/**
 * Hook to manage the selection of order depending on the project.
 * @info https://www.notion.so/cometa/L-gica-de-Bloqueos-de-Fulfillments-Ordenes-en-Dashboard-y-Portal-49eabc20635f484d87f9d87abd89490d
 * @param orders  Orders to be selected
 * @param project  Project to be used in the hook, dashboard or portal
 * @param options  Options to be used in the hook
 * @returns  Object with the selected orders, the total to pay, the function to select a fulfillment and the function to know if a fulfillment is disabled
 */
export const useOrderSelection = (
  orders: GuardianDependentOrder[],
  project: ProjectEnum,
  options?: IUseSelectionOptions<GuardianDependentOrder>
) => {
  const { selectedItems, setSelectedItems, totalToPay } = useSelectionStore();

  const prepareOrders = (prevOrders: DependentFulfillmentOrder[], order: GuardianDependentOrder) => {
    if (prevOrders.some((item) => item.id === order.id)) {
      // If the item is in the state, we remove it
      if (options?.onUnselect) {
        options.onUnselect(order);
      }
      return prevOrders.filter((item) => item.id !== order.id);
    } else {
      // If the item is not in the state, we add it
      if (options?.onSelect) {
        options.onSelect(order);
      }
      return [...prevOrders, order];
    }
  };

  const handleOrderSelect = (order: GuardianDependentOrder) => {
    const newSelectedOrders = prepareOrders(selectedItems, order);
    setSelectedItems(newSelectedOrders);
  };

  return {
    selectedItems,
    totalToPay,
    handleOrderSelect,
  };
};
