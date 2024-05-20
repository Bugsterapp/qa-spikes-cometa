import { formatPrice } from '~/utils/orders';
import BoxColorText from '~/components/Tag';
import Accordion from '~/components/atoms/guardians/Accordion';
import currencyjs from 'currency.js';
import { cn } from '~/lib/cn';
import Tour from '~/components/atoms/common/Tour';
import { CHANGE_RFC_JOYRIDE } from '~/utils/joyride';
import JoyrideTooltip from '~/components/atoms/common/JoyrideTooltip';
import { useTour } from '~/hooks/useTour';
import type { CallBackProps } from 'react-joyride';
import { Color } from '~/utils/colors';
import { DependentFulfillmentOrder } from '@cometa/hooks';
import { useSelectedSchool } from '~/components/molecules/common/AuthGlobal';
import { DependantErrorRFC } from '~/contexts/VerifyRFCContext';
import { GuardianDependentOrder } from '@cometa/trpc/src/types';
import { VerifyRFCFooter } from '~/components/ResumeCard';

interface ResumeCardListProps {
  dependents: (DependantErrorRFC & Color)[];
  selectedItems: DependentFulfillmentOrder[];
  isLoadingVerify?: boolean;
  isLoading?: boolean;
  isVerify?: boolean;
  onAssignRFC?: (dependent: DependantErrorRFC & Color) => void;
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
  isVerify,
}: ResumeCardListProps) => {
  const { showTour, handleShowTour } = useTour();
  const selectedSchool = useSelectedSchool();
  const handlerCallback = (callBack: CallBackProps) => {
    if (callBack.status === 'finished') handleShowTour('change_rfc');
  };

  return (
    <div className="flex flex-col space-y-6">
      {dependents.map((dependent, index) => {
        const items = selectedItems.filter((item) => item.student.id === dependent.id);

        if (!items.length) return null;

        const hasBillableItems = items.some((item) => (item as GuardianDependentOrder).concept.is_billable);
        const currency = items[0].currency || 'MXN';
        const total = formatPrice(
          items.reduce(
            (total, item) =>
              currencyjs(total).add('pending_amount' in item ? item.pending_amount : item.final_amount).value,
            0
          ),
          currency
        );
        return (
          <div key={dependent.id} id={`card-${dependent.id}`} className="flex flex-col">
            <div className="flex items-center px-[26px] py-5 bg-white rounded-t-2xl">
              <span className="text-sm font-semibold text-gray-300 mr-1.5">Estudiante:</span>
              <BoxColorText
                bgcolor={dependent?.color?.background}
                color={dependent?.color?.text}
                text={dependent.first_name.toUpperCase() || ''}
              />
            </div>
            <div className="px-[26px] py-5 bg-white border-t border-[#adbbcc4d]">
              <Accordion
                tittle={
                  <div className="flex items-center">
                    <span className="mr-3 text-sm font-semibold text-gray-300">
                      Órdenes{isVerify ? ' por pagar' : ' pagadas'}:
                    </span>
                    <BoxColorText
                      bgcolor={dependent?.color?.background}
                      color={dependent?.color?.text}
                      text={items.length.toString()}
                    />
                  </div>
                }
              >
                <div className="flex flex-col gap-y-1.5 ">
                  {items.map((item) => {
                    const { id, name } = item;
                    return (
                      <div key={id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{name}</span>
                        <span className="text-blue-700">
                          {formatPrice('pending_amount' in item ? item.pending_amount : item.final_amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Accordion>
            </div>
            <div
              className={cn(
                'px-[26px] flex flex-row justify-between text-sm font-semibold py-5 bg-white border-t border-[#adbbcc4d]',
                { 'rounded-b-2xl': !selectedSchool?.does_invoice || !hasBillableItems }
              )}
            >
              <span className="text-gray-300">Total:</span>
              <span className="text-blue-700">{total}</span>
            </div>
            {selectedSchool?.does_invoice && hasBillableItems && (
              <div className="bg-white rounded-b-2xl border-t border-[#adbbcc4d]">
                <VerifyRFCFooter
                  isLoading={isLoading}
                  isLoadingVerify={isLoadingVerify}
                  dependent={dependent}
                  onAssignRFC={onAssignRFC}
                  Tour={
                    index === 0 ? (
                      <Tour
                        run={Boolean(showTour && !showTour?.change_rfc)}
                        steps={CHANGE_RFC_JOYRIDE}
                        tooltipComponent={JoyrideTooltip}
                        callback={handlerCallback}
                      />
                    ) : undefined
                  }
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ResumeCardList;
