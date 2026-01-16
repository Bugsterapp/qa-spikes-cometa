import { CartItem, TOrderPortal } from '@cometa/hooks';
import { DependantErrorRFC } from '~/contexts/VerifyRFCContext';
import { Color, colors } from '~/utils/colors';
import * as ResumeCard from '~/components/ResumeCard';
import Tag from '~/components/Tag';
import { formatPrice, typeOfOrdersInStore } from '~/utils/orders';
import { useSendEvent } from '~/hooks/useSendEvent';
import { TrackEvents } from '~/constants/events';

export interface OrderResumeCardProps {
  dependent: DependantErrorRFC & Color;
  items: TOrderPortal[];
  cartItems: CartItem[];
  total: number;
  isLoading?: boolean;
  isLoadingVerify?: boolean;
  onAssignRFC?: (dependent: DependantErrorRFC & Color) => void;
  Tour?: React.ReactElement;
  showVerifyRFC?: boolean;
  id?: string;
  currency: string;
}

const OrderResumeCard = ({
  dependent,
  items,
  cartItems,
  total,
  isLoading,
  isLoadingVerify,
  showVerifyRFC,
  onAssignRFC,
  Tour,
  id,
  currency,
}: OrderResumeCardProps) => {
  const sendEvent = useSendEvent();

  return (
    <ResumeCard.Content id={id}>
      <ResumeCard.Info className="space-x-1.5">
        <span className="font-semibold text-gray-300">Estudiante:</span>
        <Tag
          bgcolor={dependent?.color?.background}
          color={dependent?.color?.text}
          text={dependent.first_name.toUpperCase() || ''}
        />
      </ResumeCard.Info>
      <ResumeCard.Details
        onOpenChange={() => {
          const { optional, mandatory } = typeOfOrdersInStore(items);
          sendEvent(TrackEvents.checkout.summary.toggleDetails, {
            student_id: dependent.id,
            student_name: `${dependent.first_name} ${dependent.last_name}`,
            optional,
            mandatory,
          });
        }}
      >
        <ResumeCard.DetailsTrigger>
          <div className="space-x-3">
            <span className="font-semibold text-gray-300">Órdenes por pagar:</span>
            <Tag bgcolor={dependent?.color?.background} color={dependent?.color?.text} text={`${cartItems.length}`} />
          </div>
        </ResumeCard.DetailsTrigger>
        <ResumeCard.DetailsContent>
          <div className="text-gray-300 flex flex-col gap-y-2.5">
            {cartItems.map((cartItem, index) => {
              const item = items.find((item) => item.id === cartItem.id && item.student.id === cartItem.student);
              if (!item) return null;
              return (
                <div key={`${id}${index}`} className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">{item.name}</span>
                  <span className="text-blue-700">
                    {formatPrice('pending_amount' in item ? item.pending_amount : item.final_amount, currency)}
                  </span>
                </div>
              );
            })}
          </div>
        </ResumeCard.DetailsContent>
      </ResumeCard.Details>
      <ResumeCard.Info className="flex flex-row justify-between text-sm font-semibold">
        <span className="text-gray-300">Total:</span>
        <span className="text-blue-700">{formatPrice(total, currency)}</span>
      </ResumeCard.Info>
      {showVerifyRFC && (
        <ResumeCard.VerifyRFCFooter
          isLoading={isLoading}
          isLoadingVerify={isLoadingVerify}
          dependent={dependent}
          onAssignRFC={onAssignRFC}
          Tour={Tour}
        />
      )}
    </ResumeCard.Content>
  );
};

interface OrderWithoutStudentResumeCardProps {
  id?: string;
  items: TOrderPortal[];
  cartItems: CartItem[];
  total: number;
}

export const OrderWithoutStudentResumeCard = ({ items, id, total, cartItems }: OrderWithoutStudentResumeCardProps) => {
  const sendEvent = useSendEvent();
  return (
    <ResumeCard.Content id={id}>
      <ResumeCard.Details
        onOpenChange={() => {
          const { optional, mandatory } = typeOfOrdersInStore(items);
          sendEvent(TrackEvents.checkout.summary.toggleDetails, {
            online_store: true,
            optional,
            mandatory,
          });
        }}
      >
        <ResumeCard.DetailsTrigger>
          <div className="space-x-3">
            <span className="font-semibold text-gray-300">Órdenes por pagar:</span>
            <Tag bgcolor={colors[0].background} color={colors[0].text} text={`${cartItems.length}`} />
          </div>
        </ResumeCard.DetailsTrigger>
        <ResumeCard.DetailsContent>
          <div className="text-gray-300 flex flex-col gap-y-2.5">
            {cartItems.map((cartItem, index) => {
              const item = items.find((item) => item.id === cartItem.id);
              if (!item) return null;
              return (
                <div key={`${id}${index}`} className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">{item.name}</span>
                  <span className="text-blue-700">
                    {formatPrice('pending_amount' in item ? item.pending_amount : item.final_amount, item.currency)}
                  </span>
                </div>
              );
            })}
          </div>
        </ResumeCard.DetailsContent>
      </ResumeCard.Details>
      <ResumeCard.Info className="flex flex-row justify-between text-sm font-semibold">
        <span className="text-gray-300">Total:</span>
        <span className="text-blue-700">{formatPrice(total, items?.[0]?.currency || 'MXN')}</span>
      </ResumeCard.Info>
    </ResumeCard.Content>
  );
};

export default OrderResumeCard;
