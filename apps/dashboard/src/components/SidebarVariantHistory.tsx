import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import ArrowRightAlt from '/public/assets/icons/ic_arrow_right_alt_black.svg';
import ArrowDownward from '/public/assets/icons/ic_arrow_downward.svg';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PaginatedStockListHistoryList, StockListHistoryActionEnum } from '@cometa/trpc/src/types';
import { cn } from '../utils/cn';

type NonUndefined<T> = T extends undefined ? never : T;
type SidebarVariantHistoryProps = (NonUndefined<PaginatedStockListHistoryList['results']>[number] & {
  is_repeated: boolean;
})[];
export default function SidebarVariantHistory({
  data,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  isLoading, // isFetching,
}: {
  data?: SidebarVariantHistoryProps;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isFetching: boolean;
}) {
  const unitSingularOrPlural = (quantity: number) => {
    if (quantity !== 1) return 'unidades';
    return 'unidad';
  };
  const availableSingularOrPlural = (quantity: number) => {
    if (quantity !== 1) return 'disponibles';
    return 'disponible';
  };
  return (
    <div
      className={cn('w-full px-8 pt-5', {
        // 'opacity-50': isFetching,
      })}
    >
      {isLoading && (
        <div className="min-h-[300px] flex w-full justify-center items-center">
          <img src="/assets/loading.svg" alt="loading" className="mx-auto" />
        </div>
      )}
      {data !== undefined && data.length > 0 ? (
        <div className="mb-8">
          <Accordion.Root type="multiple">
            {data?.map((item) => (
              <Accordion.Item value={item.id} key={item.id} className="pb-6">
                <Accordion.Header>
                  {!item.is_repeated && (
                    <p className="border-b border-[#919EAB3D] pb-1 mb-4 text-[#637381] text-xs uppercase py-2 font-bold">
                      {format(new Date(item.created), "d 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>
                  )}
                  <Accordion.Trigger
                    className="flex items-center p-4 w-full acc-trigger bg-[#F4F6F8] rounded-t"
                    disabled={
                      item?.action === StockListHistoryActionEnum.UNLIMITED ||
                      item?.action === StockListHistoryActionEnum.LIMITED
                    }
                  >
                    <div className="text-left flex-col flex w-full">
                      <p className="text-[10px] text-[#637381] pb-1">{format(new Date(item.created), 'hh:mm aa')}</p>
                      <div className="flex gap-1 flex-wrap">
                        <p className="font-bold">{item.created_by.name || item.created_by.email}</p>
                        {item?.action === StockListHistoryActionEnum.SUM && <p>agregó</p>}
                        {item?.action === StockListHistoryActionEnum.SUBTRACT && <p>redujo</p>}
                        {item?.action === StockListHistoryActionEnum.UNLIMITED && (
                          <p>
                            agregó <strong>stock ilimitado</strong> para esta variante
                          </p>
                        )}
                        {item?.action === StockListHistoryActionEnum.LIMITED && (
                          <p>
                            eliminó <strong>stock ilimitado</strong> para esta variante
                          </p>
                        )}
                        {item.action === StockListHistoryActionEnum.SUM ||
                        item.action === StockListHistoryActionEnum.SUBTRACT ? (
                          <p>
                            <strong>
                              {Math.abs(item.registered_quantity || 0)}{' '}
                              {unitSingularOrPlural(Math.abs(item.registered_quantity || 0))}
                            </strong>{' '}
                            de stock
                          </p>
                        ) : (
                          ''
                        )}
                      </div>
                    </div>
                    {item?.action !== StockListHistoryActionEnum.LIMITED &&
                      item?.action !== StockListHistoryActionEnum.UNLIMITED && <ArrowDownward className="acc-icon" />}
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="bg-[#F4F6F8] pt-1 px-4 rounded-b">
                  <div className="flex flex-col border-t border-gray-300 py-4 gap-4">
                    <div className="flex items-center gap-4">
                      <p className="text-xs text-[#637381] m-r-4">Cambio de stock:</p>
                      <p className="flex text-sm gap-1 items-center">
                        {item.action === StockListHistoryActionEnum.SET_FIRST_TIME
                          ? 'Ilimitado'
                          : !item.previous_is_limited
                          ? 'Ilimitado'
                          : item.previous_quantity}
                        <ArrowRightAlt />{' '}
                        {item.current_stock_quantity
                          ? Math.abs(item.current_stock_quantity ?? 0)
                          : !item.registered_is_limited
                          ? 'Ilimitado'
                          : 0}{' '}
                        {!item.registered_is_limited
                          ? ''
                          : unitSingularOrPlural(Math.abs(item.registered_quantity || 0)) +
                            ' ' +
                            availableSingularOrPlural(Math.abs(item.registered_quantity || 0))}{' '}
                      </p>
                    </div>
                    <div className="flex gap-11 pb-4">
                      <p className="text-xs text-[#637381]">Comentario:</p>
                      <p className="text-sm break-words break-all">{item.observations || 'N/A'}</p>
                    </div>
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
          {hasNextPage && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => {
                  fetchNextPage();
                }}
                className="text-green font-bold flex items-center gap-1"
              >
                <svg
                  width="25"
                  height="24"
                  viewBox="0 0 25 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={cn({ 'animate-spin': isFetchingNextPage })}
                >
                  <path
                    d="M18.1498 6.34902C16.5198 4.71902 14.2098 3.77902 11.6698 4.03902C7.99978 4.40902 4.97978 7.38902 4.56978 11.059C4.01978 15.909 7.76978 19.999 12.4998 19.999C15.6898 19.999 18.4298 18.129 19.7098 15.439C20.0298 14.769 19.5498 13.999 18.8098 13.999C18.4398 13.999 18.0898 14.199 17.9298 14.529C16.7998 16.959 14.0898 18.499 11.1298 17.839C8.90978 17.349 7.11978 15.539 6.64978 13.319C5.80978 9.43902 8.75978 5.99902 12.4998 5.99902C14.1598 5.99902 15.6398 6.68902 16.7198 7.77902L15.2098 9.28902C14.5798 9.91902 15.0198 10.999 15.9098 10.999H19.4998C20.0498 10.999 20.4998 10.549 20.4998 9.99902V6.40902C20.4998 5.51902 19.4198 5.06902 18.7898 5.69902L18.1498 6.34902Z"
                    fill="#00AB55"
                    shapeRendering="geometricPrecision"
                  />
                </svg>
                Cargar más
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="min-h-[600px] flex w-full justify-center items-center">
          <p className="text-sm text-[#919EAB] w-80 text-center">
            No hemos encontrado cambios que se haya registrado para esta variante
          </p>
        </div>
      )}
    </div>
  );
}
