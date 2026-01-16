import { useContext, useState } from 'react';
import { Listbox } from '@headlessui/react';
import { useGetSchools, useSelectedSchool, useSetSelectedSchool } from '/src/guards/AuthGuard';
import ArrowDownward from 'dashboard/public/assets/icons/ic_arrow_downward.svg';
import ArrowUpward from 'dashboard/public/assets/icons/ic_arrow_upward.svg';
import { cn } from '/src/utils/cn';
import { DashboardSchool } from '@cometa/trpc/src/types';
import { useRouter } from 'next/router';
import { SchoolSwitcherContext } from '/src/contexts/SchoolSwitcherProvider';
import { useSchoolSync } from '/src/hooks/useSchoolSync';

interface NavbarSelectSchoolProps {
  isCollapse: boolean;
}

const NavbarSelectSchool = ({ isCollapse }: NavbarSelectSchoolProps) => {
  const [open, setOpen] = useState(false);
  const schools = useGetSchools();
  const selectedSchool = useSelectedSchool();
  const setSelectedSchool = useSetSelectedSchool();
  const { selectedCounter, setSelectedCounter } = useContext(SchoolSwitcherContext);
  const router = useRouter();
  const { broadcastSchoolChange } = useSchoolSync();

  const boxStyle = cn({
    'h-[90px] text-[#212B36] flex pl-4 items-center text-[14px] gap-1 py-[30px] bg-[#F4F6F8] rounded-xl text-[#212B36] font-semibold outline-none whitespace-nowrap transition-all duration-300 ease-in-out cursor-pointer':
      isCollapse,
    'w-full h-[90px] flex flex-row  items-center py-[30px] gap-1 px-4 bg-[#F4F6F8] rounded-xl text-[#212B36] text-[14px] font-semibold outline-none whitespace-nowrap transition-all duration-300 ease-in-out cursor-pointer':
      !isCollapse,
    'justify-between': schools?.length > 1 && !isCollapse,
  });

  const selectItem = (school: DashboardSchool) => {
    setSelectedSchool(school.id);
    setSelectedCounter(selectedCounter + 1);
    broadcastSchoolChange(school.id);
    setOpen(false);
    const basePath = router.pathname.split('/')[1];
    router.push(`/${basePath}`);
  };
  if (schools.length === 0) return null;
  return (
    <>
      {schools.length ? (
        <Listbox value={selectedSchool} onChange={selectItem}>
          <Listbox.Button
            className={cn(boxStyle, { 'gap-4 cursor-default': schools.length <= 1 && !isCollapse })}
            onClick={() => setOpen(!open)}
          >
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
              {selectedSchool?.name.substring(0, 1)}
            </div>
            {!isCollapse && (
              <p className="overflow-hidden truncate" data-testid="schoolname-Collapsable">
                {selectedSchool?.name}
              </p>
            )}
            {isCollapse ||
              (schools.length > 1 &&
                (open ? <ArrowUpward className="w-4 h-4 mt-2" /> : <ArrowDownward className="w-4 h-4 mt-2" />))}
          </Listbox.Button>
          <div className={cn('relative w-full z-40 min-w-[300px]')}>
            {!isCollapse && schools.length > 1 && (
              <Listbox.Options
                className={cn(
                  'cursor-pointer bg-[#F4F6F8] shadow-sm w-full rounded-xl p-4 flex flex-col z-10 absolute transition-all duration-300 ease-in-out h-[150px]',
                  {
                    'overflow-y-auto scrollbar h-[300px]': schools.length > 4,
                  }
                )}
              >
                {schools?.map((school) =>
                  selectedSchool?.id !== school.id ? (
                    <Listbox.Option key={school.id} value={school}>
                      <div
                        className={cn(
                          boxStyle,
                          'justify-start gap-2 h-[40px] hover:bg-[#00AB553D] hover:text-[#00AB55] p-3 rounded-md tex'
                        )}
                      >
                        <div className="w-[30px] h-[30px] bg-white rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
                          {school.name.substring(0, 1)}
                        </div>
                        {!isCollapse && (
                          <p
                            title={school.name}
                            className="overflow-hidden truncate max-w-4 whitespace-wrap"
                            data-testid={`${school.name}-option`}
                          >
                            {school.name}
                          </p>
                        )}
                      </div>
                    </Listbox.Option>
                  ) : null
                )}
              </Listbox.Options>
            )}
          </div>
        </Listbox>
      ) : null}
    </>
  );
};

export default NavbarSelectSchool;
