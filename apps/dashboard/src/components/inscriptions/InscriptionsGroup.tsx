import { cn } from '@cometa/utils';
import { Tooltip } from '../atoms/Tooltip';
import { useEffect, useRef, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import * as Accordion from '@radix-ui/react-accordion';
import { InscriptionEntity } from '@cometa/trpc/src/students/types-mapping';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/router';

export type InscriptionGroup = {
  group_name: string;
  inscriptions: InscriptionEntity[];
};

export function InscriptionsGroup({
  groups,
  totalCount,
  columns,
}: {
  groups: InscriptionGroup[];
  totalCount: number;
  columns: ColumnDef<any, any>[];
}) {
  const [openAccordions, setOpenAccordions] = useState<string[]>(() => []);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (groups && groups.length > 0) {
      setOpenAccordions([]);
    } else {
      setOpenAccordions([]);
    }
  }, [groups]);

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleAllAccordions = () => {
    const allGroupNames = groups.map((group) => group.group_name);
    if (openAccordions.length === allGroupNames.length) {
      setOpenAccordions([]);
    } else {
      setOpenAccordions(allGroupNames);
    }
  };

  return (
    <div className="px-6" style={{ minWidth: getGridWidth(columns, 48) }}>
      <GroupHeader
        openAccordions={openAccordions}
        groups={groups}
        toggleAllAccordions={toggleAllAccordions}
        columns={columns}
      />

      <div ref={wrapperRef}>
        <Virtuoso
          overscan={100}
          useWindowScroll
          data={groups || []}
          totalCount={totalCount}
          itemContent={(index, group) => {
            const { group_name: groupName, inscriptions } = group;
            return (
              <div className={cn('px-4 pt-2', { 'pt-4': index === 0 })}>
                <Accordion.Root
                  type="multiple"
                  value={openAccordions}
                  onValueChange={(value) => setOpenAccordions(value)}
                  className="bg-[#FBFCFD] border border-neutral-100 rounded-lg"
                >
                  <Accordion.Item value={groupName}>
                    <Accordion.Header>
                      <Accordion.Trigger
                        className="w-full px-4 py-2 flex justify-between items-center rounded-lg"
                        onClick={() => toggleAccordion(groupName)}
                      >
                        <div className="flex items-center py-2.5 gap-4">
                          <div className="flex items-center gap-1">
                            <AccordionIcon openAccordions={openAccordions} groupName={groupName} />
                            <span className="text-sm font-semibold text-neutral-900">{groupName}</span>
                          </div>
                          <div className="text-xs text-neutral-500">{inscriptions?.length} estudiantes</div>
                        </div>
                      </Accordion.Trigger>
                    </Accordion.Header>

                    <Accordion.Content className="mx-4 mb-4 bg-white border border-neutral-100 rounded-lg overflow-hidden divide-y divide-neutral-100">
                      {inscriptions?.map((inscription) => (
                        <InscriptionRow key={inscription.id} inscription={inscription} columns={columns} />
                      ))}
                    </Accordion.Content>
                  </Accordion.Item>
                </Accordion.Root>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}

function GroupHeader({
  openAccordions,
  groups,
  toggleAllAccordions,
  columns,
}: {
  openAccordions: string[];
  groups: InscriptionGroup[];
  toggleAllAccordions: () => void;
  columns: ColumnDef<any, any>[];
}) {
  const groupNames = groups.map((group) => group.group_name);
  const allExpanded = openAccordions.length === groupNames.length;

  return (
    <div className="bg-[#FBFCFD]">
      <div
        className="grid text-[#637381] font-semibold text-sm h-11"
        style={{
          gridTemplateColumns: `0px ${getGridTemplateColumns(columns, false)}`,
          minWidth: getGridWidth(columns),
        }}
      >
        <div className="flex items-center pl-9">
          <Tooltip message={allExpanded ? 'Colapsar todo' : 'Expandir todo'}>
            <button data-testid="collapsable-icon" className="flex items-center" onClick={toggleAllAccordions}>
              <CollapseIcon openAccordions={openAccordions} groupNames={groupNames} />
            </button>
          </Tooltip>
        </div>
        <div className="grid" style={{ gridTemplateColumns: getGridTemplateColumns(columns) }}>
          {columns.map((column, index) => (
            <div
              key={column.id}
              className={cn('whitespace-nowrap flex items-center', {
                'border-l-2 border-neutral-100 px-4': index > 0,
              })}
            >
              {typeof column.header === 'function' ? column.header({} as any) : column.header}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InscriptionRow({ inscription, columns }: { inscription: InscriptionEntity; columns: ColumnDef<any, any>[] }) {
  const router = useRouter();

  function handleRowClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]') || target.closest('input')) {
      return;
    }
    router.push(`/students/${inscription.student?.id}?prev=/inscriptions`);
  }

  return (
    <div
      className="grid items-center py-3 cursor-pointer hover:bg-[#F5F5F5] w-full"
      style={{ gridTemplateColumns: getGridTemplateColumns(columns, true) }}
      onClick={handleRowClick}
    >
      {columns.map((column) => (
        <div key={column.id}>
          {/* @ts-ignore */}
          {column.cell({
            row: { original: inscription },
            getValue: () => {
              const accessorKey = (column as any).accessorKey as keyof InscriptionEntity;
              return accessorKey?.split('.').reduce((obj, key) => (obj as any)?.[key], inscription);
            },
            size: column.size,
          })}
        </div>
      ))}
    </div>
  );
}

function getGridTemplateColumns(columns: ColumnDef<any, any>[], isRow?: boolean) {
  return columns
    .map((column, index) => {
      if (index === 0 && isRow) return '52px';
      if (index === 0 && !isRow) return '80px';
      return `${column.size}px`;
    })
    .join(' ');
}

function getGridWidth(columns: ColumnDef<any, any>[], mainWidth = 0) {
  return `${columns.reduce((acc, column) => acc + (column.size ?? 0), mainWidth)}px`;
}

function CollapseIcon({ openAccordions, groupNames }: { openAccordions: string[]; groupNames: string[] }) {
  return (
    <svg viewBox="0 0 16 20" fill="none" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1.00006 12.9998C0.999598 12.7662 1.08097 12.5397 1.23005 12.3598C1.3996 12.1553 1.64356 12.0267 1.90808 12.0023C2.17261 11.9779 2.43597 12.0598 2.64006 12.2298L8.00006 16.7098L13.3701 12.3898C13.5766 12.222 13.8416 12.1435 14.1062 12.1717C14.3709 12.1998 14.6134 12.3323 14.7801 12.5398C14.9641 12.749 15.0525 13.0254 15.0241 13.3026C14.9956 13.5797 14.8528 13.8324 14.6301 13.9998L8.63006 18.8298C8.26105 19.1331 7.72906 19.1331 7.36006 18.8298L1.36005 13.8298C1.11461 13.6263 0.980887 13.318 1.00006 12.9998Z"
        fill="#3366FF"
        className={cn('transition-transform origin-center', {
          'rotate-0 -translate-y-2.5': openAccordions.length === groupNames.length,
          'rotate-180': openAccordions.length !== groupNames.length,
        })}
      />
      <path
        d="M1.00006 7.05585C0.999598 7.28951 1.08097 7.51594 1.23005 7.69585C1.3996 7.90036 1.64356 8.029 1.90808 8.05339C2.17261 8.07778 2.43597 7.99591 2.64006 7.82585L8.00006 3.34585L13.3701 7.66585C13.5766 7.83362 13.8416 7.91212 14.1062 7.88397C14.3709 7.85582 14.6134 7.72333 14.7801 7.51585C14.9641 7.30669 15.0525 7.03023 15.0241 6.75308C14.9956 6.47593 14.8528 6.22323 14.6301 6.05585L8.63006 1.22585C8.26105 0.922537 7.72906 0.922537 7.36006 1.22585L1.36005 6.22585C1.11461 6.42932 0.980887 6.73762 1.00006 7.05585Z"
        fill="#3366FF"
        className={cn('transition-transform origin-center', {
          'rotate-0 translate-y-2.5': openAccordions.length === groupNames.length,
          'rotate-180': openAccordions?.length !== groupNames.length,
        })}
      />
    </svg>
  );
}

function AccordionIcon({ openAccordions, groupName }: { openAccordions: string[]; groupName: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('transition-transform duration-200 origin-center', {
        'rotate-90': !openAccordions.includes(groupName),
        'rotate-0': openAccordions.includes(groupName),
      })}
    >
      <path
        d="M8.33334 15.8336C8.13863 15.834 7.94993 15.7662 7.8 15.6419C7.62958 15.5007 7.52238 15.2974 7.50206 15.0769C7.48173 14.8565 7.54996 14.637 7.69167 14.4669L11.425 10.0003L7.825 5.52528C7.6852 5.35312 7.61978 5.13233 7.64324 4.91179C7.6667 4.69126 7.7771 4.48917 7.95 4.35028C8.12431 4.19691 8.35469 4.12322 8.58565 4.14695C8.81661 4.17067 9.02719 4.28968 9.16667 4.47528L13.1917 9.47528C13.4444 9.78278 13.4444 10.2261 13.1917 10.5336L9.025 15.5336C8.85545 15.7382 8.59853 15.8496 8.33334 15.8336Z"
        fill="#3366FF"
      />
    </svg>
  );
}
