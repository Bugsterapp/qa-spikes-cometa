import * as React from 'react';
import { Tooltip } from '../../atoms/Tooltip';
import Status from '../../Status';
import Warning from '../../../../public/assets/icons/navigation/delinquency_warning.svg';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';
import { AccordionContent } from '@radix-ui/react-accordion';
import { getFulfillmentStatusValues } from '/src/utils/delinquency-helpers';
import { formatDateShort, formatPrice } from '/src/utils/general';

export const LazyFulfillmentRows = React.memo(function LazyFulfillmentRows({
  studentId,
  onClickOrder,
  isExpanded,
}: {
  studentId: string;
  onClickOrder: (orderId: string) => void;
  isExpanded: boolean;
}) {
  const selectedSchool = useSelectedSchool();

  const { data: fulfillments, isLoading } = api.delinquency.getDelinquentFulfillments.useQuery(
    { student_id: studentId },
    { enabled: !!selectedSchool?.id && isExpanded }
  );

  if (!isExpanded) return null;

  if (isLoading) {
    return (
      <AccordionContent className="flex justify-center items-center h-[72px]">
        <span className="text-gray-500 text-sm">Cargando detalles...</span>
      </AccordionContent>
    );
  }

  if (!fulfillments?.results?.length) {
    return (
      <AccordionContent className="flex justify-center items-center h-[72px]">
        <span className="text-gray-500 text-sm">No hay órdenes pendientes.</span>
      </AccordionContent>
    );
  }

  return (
    <AccordionContent className="!p-0">
      <div>
        {fulfillments?.results?.map((item: any) => {
          const { value, status, tooltip } = getFulfillmentStatusValues(item.status);

          return (
            <div
              key={item.id}
              className="subrow hover:cursor-pointer grid grid-cols-delinquency items-center gap-2 h-[64px] px-5 even:bg-gray-50 odd:bg-white"
              onClick={() => onClickOrder(item.order?.id)}
            >
              {/* 1. Orden */}
              <div className="flex flex-col">
                <Tooltip message={item.order?.name}>
                  <span className="break-all line-clamp-2">{item.order?.name}</span>
                </Tooltip>
              </div>

              {/* 2. Fecha Vcto */}
              <div className="flex items-center text-[#FF4842]">
                <span className="mr-1 text-sm font-semibold">{formatDateShort(item.due, false, true)}</span>
                <Warning className="w-3.5 h-3" />
              </div>

              {/* 3. Estado */}
              <div className="flex items-center">
                <Tooltip message={tooltip}>
                  <Status variant={status}>{value}</Status>
                </Tooltip>
              </div>

              {/* 4. Recargos */}
              <div className="text-right">{item.total_charge ? `+${formatPrice(item.total_charge)}` : '-'}</div>

              {/* 5. Dctos */}
              <div className="text-right">{item.discount ? `-${formatPrice(item.discount)}` : '-'}</div>

              {/* 6. Pagado */}
              <div className="text-right">{item.total_paid ? formatPrice(item.total_paid) : '-'}</div>

              {/* 7. Por Pagar */}
              <div className="text-right">{item.total_remaining ? formatPrice(item.total_remaining) : '-'}</div>
            </div>
          );
        })}
      </div>
    </AccordionContent>
  );
});
