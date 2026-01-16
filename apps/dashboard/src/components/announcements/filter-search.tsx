import type { FC } from 'react';
import { GlobalSearch } from '../atoms/GlobalSearch';
import { PillTabs, PillTabsList, PillTabsTrigger } from '../ui/PillTabs';

interface FilterSearchProps {
  withSearch?: boolean;
  withTabs?: boolean;
  search?: string;
  tab?: string;
  onSearch?: (value: string) => void;
  onTabChange?: (value: string) => void;
}

const tabs = [
  {
    value: 'completed',
    label: 'Enviados',
    className: 'min-w-[59px]',
  },
  {
    value: 'active',
    label: 'Programados',
    className: 'min-w-[87px]',
  },
  {
    value: 'draft',
    label: 'Borradores',
    className: 'min-w-[71px]',
  },
];

const FilterSearch: FC<FilterSearchProps> = ({ withSearch, withTabs, search, tab, onSearch, onTabChange }) => (
  <div className="flex flex-row items-center gap-2 justify-between w-full mr-10">
    {withTabs && (
      <PillTabs value={tab} onValueChange={onTabChange} className="w-full">
        <PillTabsList>
          {tabs.map((tab) => (
            <PillTabsTrigger key={tab.value} value={tab.value} className={tab.className}>
              {tab.label}
            </PillTabsTrigger>
          ))}
        </PillTabsList>
      </PillTabs>
    )}
    {withSearch && (
      <div>
        <GlobalSearch
          search={search || ''}
          setSearch={onSearch || (() => null)}
          placeholder="Buscar"
          typeButton="button"
          className="focus:ring-[#7B35E8] focus:outline-none focus:border-[#7B35E8] h-[40px]"
        />
      </div>
    )}
  </div>
);

export default FilterSearch;
