import { useSession } from 'next-auth/react';
import { FraudStatusEnum } from '@cometa/trpc';
import * as ResumeCard from '~/components/ResumeCard';
import { formatPrice } from '~/utils/orders';
import { Color } from '~/utils/colors';
import { useSelectedSchool } from '~/stores/globalStore';
import { DependantErrorRFC } from '~/contexts/VerifyRFCContext';
import { TOrderPortal, calculateTotalToPay, ProjectEnum } from '@cometa/hooks';
import OrderResumeCard, { OrderWithoutStudentResumeCard } from '~/components/Resume/OrderResumeCard';
import { useOrderSelection, useCartItems } from '~/stores/selectionStorePersisted';
import Sentry from '@sentry/nextjs';

interface ResumeCardListProps {
  dependents: (DependantErrorRFC & Color)[];
  selectedItems: TOrderPortal[];
  isLoadingVerify?: boolean;
  isLoading?: boolean;
  onAssignRFC?: (dependent: DependantErrorRFC & Color) => void;
  ordersHaveDependents: boolean;
}

/**
 *  Show the list of dependents with their orders and total price
 * @param dependents  list of dependents
 * @param checkoutOrders  list of orders
 * @param onAssignRFC  callback to assign RFC to dependent
 * @param isLoadingVerify  loading state of verify RFC
 * @param isLoading  loading data rfc
 */
const ResumeCardList = ({
  dependents = [],
  selectedItems,
  onAssignRFC,
  isLoadingVerify,
  isLoading,
  ordersHaveDependents,
}: ResumeCardListProps) => {
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();
  const { itemQuantities } = useOrderSelection([], ProjectEnum.PORTAL);
  const cartItems = useCartItems<ProjectEnum.PORTAL>();
  const hasHighRiskProfile = session?.user.fraud_status === FraudStatusEnum.HighRisk;

  return (
    <div className="flex flex-col space-y-6">
      {ordersHaveDependents ? (
        <>
          {dependents.map((dependent) => {
            const orders = selectedItems.filter((item) => item.student.id === dependent.id);
            if (!orders.length) {
              Sentry.captureMessage('No orders found for dependent', {
                extra: {
                  dependent,
                  selectedItems,
                },
              });
              return null;
            }

            const filteredCartItems = cartItems.filter((item) => item.student === dependent.id);
            const hasBillableItems = orders.some((item) => item.concept.is_billable);
            const currency = orders[0].currency || 'MXN';
            const total = calculateTotalToPay(orders, itemQuantities);

            return hasHighRiskProfile ? (
              cartItems.map((cartItem) => {
                const item = orders.find((item) => item.id === cartItem.id && item.student.id === cartItem.student);
                if (!item) return null;
                return (
                  <ResumeCard.Content key={item.order_id} id={`chargeback-card-${item.order_id}`}>
                    <ResumeCard.Info className="space-x-1.5">
                      <span className="font-semibold text-gray-300">Orden a pagar</span>
                      <div className="flex flex-row justify-between text-sm font-normal">
                        <span className="text-[#57537A]">{item.name}</span>
                        <span className="text-[#2F2966]">{formatPrice(item.final_amount, currency)}</span>
                      </div>
                    </ResumeCard.Info>
                  </ResumeCard.Content>
                );
              })
            ) : (
              <OrderResumeCard
                key={dependent.id}
                id={`card-${dependent.id}`}
                dependent={dependent}
                items={orders}
                cartItems={filteredCartItems}
                total={total}
                isLoading={isLoading}
                isLoadingVerify={isLoadingVerify}
                onAssignRFC={onAssignRFC}
                currency={currency}
                showVerifyRFC={selectedSchool?.does_invoice && hasBillableItems}
              />
            );
          })}
        </>
      ) : (
        <>
          {hasHighRiskProfile ? (
            cartItems.map((cartItem) => {
              const item = selectedItems.find((item) => item.id === cartItem.id);
              if (!item) return null;
              return (
                <ResumeCard.Content key={item.order_id} id={`chargeback-card-${item.order_id}`}>
                  <ResumeCard.Info className="space-x-1.5">
                    <span className="font-semibold text-gray-300">Orden a pagar</span>
                    <div className="flex flex-row justify-between text-sm font-normal">
                      <span className="text-[#57537A]">{item.name}</span>
                      <span className="text-[#2F2966]">{formatPrice(item.final_amount, item.currency || 'MXN')}</span>
                    </div>
                  </ResumeCard.Info>
                </ResumeCard.Content>
              );
            })
          ) : (
            <OrderWithoutStudentResumeCard
              cartItems={cartItems}
              items={selectedItems}
              total={calculateTotalToPay(selectedItems, itemQuantities)}
              id={`card-${session?.user.id}`}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ResumeCardList;
