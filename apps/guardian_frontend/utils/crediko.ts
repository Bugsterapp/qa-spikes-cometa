import { CartItem, TOrderPortal } from '@cometa/hooks';
import { FulfillmentRequestDTO } from '@cometa/trpc/src/integrations/types';

// Re-export the type from the generated API types for consistency
export type CredikoFulfillmentRequest = FulfillmentRequestDTO;

/**
 * Converts cart items to fulfillments for Crediko
 * @param cartItems Cart items
 * @param selectedItems Selected items with complete information
 * @returns Array of fulfillments to send to Crediko
 */
export function convertCartItemsToCredikoFulfillments(
  cartItems: CartItem[],
  selectedItems: TOrderPortal[]
): CredikoFulfillmentRequest[] {
  return cartItems.map((item) => {
    if (!item.student) {
      throw new Error(`Item del carrito sin estudiante asociado: ${item.id}`);
    }

    const selectedItem = selectedItems.find((si) => si.order_id === item.order);

    if (!selectedItem) {
      throw new Error(`No se encontró información del item seleccionado: ${item.order}`);
    }

    const price = Number('pending_amount' in selectedItem ? selectedItem.pending_amount : selectedItem.final_amount);

    return {
      concept: selectedItem.name || 'Pago educativo',
      student_id: item.student,
      price: price,
    };
  });
}
