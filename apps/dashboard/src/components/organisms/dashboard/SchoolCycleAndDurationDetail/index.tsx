import React from 'react';
import { Transition } from '@headlessui/react';

import { formatDateWithSpanishFormat } from '/src/utils/general';
import { cn } from '/src/utils/cn';
import { Tooltip } from '/src/components/atoms/Tooltip';
import { Concept } from '@cometa/trpc/src/types';
import Chip from '/src/components/atoms/Chip';
import IcArrow from '/public/assets/icons/ic_arrow_downward.svg';
import Arrow from '/public/assets/icons/ic_arrow-r.svg';
import CalendarOutline from '/public/assets/icons/calendar_outline.svg';
import TrashIcon from '/public/assets/icons/trash_outline.svg';

interface SchoolCycleAndDurationDetailProps {
  groupedAffectedConcepts?: any[];
  showConceptAffected?: string;
  setShowConceptAffected: (value?: string) => void;
  className?: string;
  isAssignment?: boolean;
  formatDate?: (dateString: string) => string;
  deleteScholarship?: (id: string) => void;
  showDeleteButton?: boolean;
}

const SchoolCycleAndDurationDetail: React.FC<SchoolCycleAndDurationDetailProps> = ({
  groupedAffectedConcepts,
  showConceptAffected,
  setShowConceptAffected,
  className,
  isAssignment,
  formatDate,
  deleteScholarship,
  showDeleteButton,
}) => (
  <section className={cn('flex flex-col my-5', className)}>
    <>
      {isAssignment && (
        <span className="text-[#454D64] text-base font-semibold mb-2">Ciclos y conceptos afectados</span>
      )}
    </>

    <div className="grid grid-cols-1 gap-4 mt-2">
      {groupedAffectedConcepts?.map((cycle: any, index: number) => {
        const isInactive = cycle?.is_active === false;
        if (!cycle?.school_cycle) return null;
        return (
          <div key={cycle?.school_cycle ?? `${index}_cycle_${cycle.id}`}>
            {showConceptAffected !== cycle?.school_cycle && (
              <div
                className={`flex flex-row items-center justify-between rounded-lg border h-[64px] ${
                  isInactive ? 'border-[#C4CDD5]' : 'border-[#1890FF]'
                } px-5 py-5 cursor-pointer`}
                onClick={() => setShowConceptAffected(cycle?.school_cycle)}
                role="button"
                tabIndex={0}
              >
                <div className="flex gap-2 items-center">
                  <span
                    className={cn('text-[#212B36] text-base font-semibold', {
                      'text-[#637381]': isInactive,
                    })}
                  >
                    {cycle?.school_cycle?.name}
                  </span>
                  <span className="text-[#454D64] text-xs leading-[18px] mt-[1px]">
                    {cycle?.affected_concepts?.length}{' '}
                    {cycle?.affected_concepts?.length === 1 ? 'concepto afectado' : 'conceptos afectados'}
                  </span>
                </div>
                <div className="flex gap-4 items-center">
                  {isInactive && (
                    <Tooltip message="La beca o descuento afectó a este ciclo anteriormente" side="top">
                      <Chip intent="disabled">Desactivado</Chip>
                    </Tooltip>
                  )}
                  <button
                    onClick={() => setShowConceptAffected(cycle?.school_cycle)}
                    className="flex items-center gap-2"
                  >
                    <IcArrow className={isInactive ? 'text-[#C4CDD5]' : 'text-[#3366FF]'} />
                  </button>
                </div>
              </div>
            )}
            {showConceptAffected === cycle?.school_cycle && (
              <Transition
                show={showConceptAffected === cycle?.school_cycle}
                enter="transition opacity duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition opacity duration-75"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div
                  className={cn('flex flex-col border border-[#1890FF] rounded-lg mb-4', {
                    'border-[#C4CDD5]': isInactive,
                  })}
                >
                  <div
                    className={cn('flex flex-col w-full border-b border-[#1890FF]', {
                      'border-[#C4CDD5]': isInactive,
                    })}
                  >
                    <div
                      className="flex bg-[#1890FF0A] px-5 py-5 h-[62px] gap-2 items-center justify-between w-full cursor-pointer"
                      tabIndex={0}
                    >
                      <div className="flex gap-2 items-center w-[90%]" onClick={() => setShowConceptAffected()}>
                        <span
                          className={cn('text-[#212B36] text-base font-semibold', {
                            'text-[#637381]': isInactive,
                          })}
                        >
                          {cycle?.school_cycle?.name}
                        </span>
                        <span className="text-[#454D64] text-xs leading-[18px] mt-[1px]">
                          {cycle?.affected_concepts?.length}{' '}
                          {cycle?.affected_concepts?.length === 1 ? 'concepto afectado' : 'conceptos afectados'}
                        </span>
                      </div>
                      <div className="flex gap-4 items-center">
                        {isInactive && (
                          <Tooltip message="La beca o descuento afectó a este ciclo anteriormente" side="top">
                            <Chip intent="disabled">Desactivado</Chip>
                          </Tooltip>
                        )}
                        {showDeleteButton && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();

                              deleteScholarship?.(cycle?.id);
                            }}
                            className="flex items-center gap-2"
                          >
                            <TrashIcon className={cn('w-5 cursor-pointer text-red-500')} />
                          </button>
                        )}
                        <button onClick={() => setShowConceptAffected()} className="flex items-center gap-2">
                          <IcArrow className={isInactive ? 'text-[#C4CDD5] rotate-180' : 'text-[#3366FF] rotate-180'} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex px-5 py-3 flex-col">
                    <span className="text-[#637381] text-xs py-2 border-b border-[#C0C9D8]">
                      DURACIÓN DE BECA O DESCUENTO
                    </span>
                    <span
                      className={cn('text-sm text-[#717993] mt-4 pb-3 leading-[22px]', {
                        italic: !cycle?.need_ranges,
                      })}
                    >
                      {!cycle?.need_ranges && !!cycle?.date_ranges?.length
                        ? 'El descuento únicamente afectará a las órdenes que tengan una fecha de vencimiento en alguno de los rangos definidos.'
                        : `Esta beca o descuento afecta a todos los conceptos del ${cycle?.school_cycle?.name}.`}
                    </span>
                    {(cycle?.need_ranges || !!cycle?.date_ranges?.length) && (
                      <div className="flex flex-col gap-2 pb-3">
                        {cycle?.date_ranges?.map((range: any) => (
                          <div
                            key={`${range.date_start}_${range.date_end}`}
                            className="flex flex-row gap-2 items-center border border-[#E4EBF6] h-[56px] rounded-lg py-2 px-4"
                          >
                            <span className="text-[#1C1C1D] text-sm w-[40%]">
                              <>
                                {isAssignment
                                  ? formatDate?.(range.date_start)
                                  : formatDateWithSpanishFormat(range.start_date)}
                              </>
                            </span>
                            <Arrow className="mr-4" />
                            <span className="text-[#1C1C1D] text-sm w-[40%]">
                              {isAssignment
                                ? formatDate?.(range.date_end)
                                : formatDateWithSpanishFormat(range.end_date)}
                            </span>
                            <CalendarOutline className="w-4 h-4 text-[#8B93A0]" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {!!cycle?.affected_concepts?.length && (
                    <div className="flex px-5 flex-col">
                      <span className="text-[#637381] text-xs leading-[18px]">CONCEPTOS AFECTADOS</span>
                      <div className="border-t my-2 border-[#C0C9D8]" />
                      <div className="flex mt-2 w-full flex-col pb-5">
                        <div className="flex px-4 py-2 border-x border-t rounded-t-lg border-[#E4EBF6] bg-[#FBFCFD] w-full h-[52px] items-center">
                          <span className="bg-[#FBFCFD] font-bold text-xs leading-[18px] text-[#637381]">Concepto</span>
                        </div>
                        {cycle?.affected_concepts?.map((concept: Concept, index: number) => (
                          <div
                            key={concept.id}
                            className={cn(
                              'flex w-full px-4 items-stretch items-center border-x border-[#E4EBF6] border-b leading-5 h-[64px]',
                              {
                                'rounded-b-lg': index === (cycle?.concepts?.length ?? 0) - 1,
                              }
                            )}
                          >
                            <span className="text-[#1C1C1D] text-sm">{concept.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Transition>
            )}
          </div>
        );
      })}
    </div>
  </section>
);
export default SchoolCycleAndDurationDetail;
