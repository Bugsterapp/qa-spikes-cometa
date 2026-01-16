import React, { Fragment } from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '@cometa/utils';
import Chevron from '/public/assets/icons/chevron.svg';
import { SectionLayout } from './SectionLayout';

interface TimelineLayoutProps {
  title: string;
  description: string;
  items: any[];
  showAllItems: boolean;
  onToggleShow: () => void;
  renderItem: (item: any, index: number) => React.ReactNode;
  actionButton?: React.ReactNode;
}

export const TimelineLayout: React.FC<TimelineLayoutProps> = ({
  title,
  description,
  items,
  showAllItems,
  onToggleShow,
  renderItem,
  actionButton,
}) => {
  const displayedItems = items.slice(0, showAllItems ? undefined : 3);

  return (
    <SectionLayout title={title} description={description} actionButton={actionButton}>
      <div className="flex gap-4">
        <div className="flex flex-col gap-1 items-center">
          {displayedItems.map((_, index) => (
            <Fragment key={`timeline-${index}`}>
              <div className="w-4 h-6 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-[#91A0AB]" />
              </div>
              {index < (showAllItems ? items.length - 1 : Math.min(items.length - 1, 2)) && (
                <div className="w-[1px] h-16 bg-[#91A0AB] opacity-25" />
              )}
            </Fragment>
          ))}
        </div>

        <div className="flex-1 flex flex-col gap-4">{displayedItems.map((item, index) => renderItem(item, index))}</div>
      </div>

      {items.length > 3 && (
        <button onClick={onToggleShow} className="flex items-center gap-2 text-[#3366FF] font-bold mx-auto">
          <span
            className={cn('w-[18px] h-[18px] transform transition-transform', {
              'rotate-180': showAllItems,
            })}
          >
            <Chevron className="w-full h-full" />
          </span>
          <span className="text-sm">
            {showAllItems ? 'Ver menos' : 'Ver más'} {title === 'Esquema de intereses' ? 'recargos' : 'descuentos'}
          </span>
        </button>
      )}
    </SectionLayout>
  );
};
