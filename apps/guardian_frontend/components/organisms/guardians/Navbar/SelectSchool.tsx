import { useGetSchools, useSelectedSchool, useSetSelectedSchool } from '~/components/molecules/common/AuthGlobal';
import * as SelectPrimitive from '@radix-ui/react-select';
import Chevron from '/public/icons/chevron.svg';
import { ReactNode } from 'react';
import Tour from '~/components/atoms/common/Tour';
import { useTour } from '~/hooks/useTour';
import { FIRST_SELECT_SCHOOLS_JOYRIDE } from '~/utils/joyride';
import JoyrideTooltip from '~/components/atoms/common/JoyrideTooltip';
import { CallBackProps, STATUS } from 'react-joyride';
import { useSelectionStore } from '@cometa/hooks';
import Link from 'next/link';
import { useRouter } from 'next/router';

const SingleTitle = ({ children, disabled = false }: { children: ReactNode; disabled?: boolean }) => {
  const _router = useRouter();
  const { guardianHash } = _router.query;
  if (disabled) {
    return <div className="text-sm font-medium text-gray-300">{children}</div>;
  }
  return (
    <Link href={`/guardians/${guardianHash}`} className="text-sm font-medium text-gray-300">
      {children}
    </Link>
  );
};

const SelectSchool = ({ disabledTitle = false }: { disabledTitle?: boolean }) => {
  const { clear } = useSelectionStore();
  const schools = useGetSchools();
  const selectedSchool = useSelectedSchool();
  const setSelectedSchool = useSetSelectedSchool();
  const { showTour, handleShowTour } = useTour();

  if (!schools.length) return <SingleTitle disabled={disabledTitle}>cometa</SingleTitle>;

  if (schools.length == 1) return <SingleTitle disabled={disabledTitle}>{selectedSchool?.name}</SingleTitle>;

  const changeTour = (callBack: CallBackProps, tour: string) => {
    if (callBack.status === STATUS.FINISHED) handleShowTour(tour);
  };

  return (
    <div>
      <SelectPrimitive.Root
        value={selectedSchool?.id}
        onValueChange={(value) => {
          setSelectedSchool(value);
          clear();
        }}
      >
        <SelectPrimitive.Trigger
          id="school-select"
          className="flex flex-row items-center justify-center px-2.5 py-2 gap-x-4 bg-transparent text-gray-300 font-medium text-sm w-52 group outline-none"
        >
          <div className="overflow-hidden text-ellipsis whitespace-nowrap">
            <SelectPrimitive.Value />
          </div>
          <SelectPrimitive.Icon id="school-select-icon">
            <Chevron
              className="w-6 h-5 text-gray-300 transition-transform group-data-[state=open]:rotate-180
							"
            />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="relative z-50 min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-[14px] bg-white animate-in fade-in-80 mt-1 shadow-[0px_2px_30px_0px_rgba(227,224,255,0.5)]"
            position="popper"
          >
            <SelectPrimitive.Viewport className="p-1 max-h-52 scrollbar">
              {schools.map((school) => (
                <SelectPrimitive.Item
                  className="py-2.5 px-3.5 bg-white hover:bg-[#F1EFFF] cursor-pointer rounded-[10px] outline-none text-gray-300 font-normal text-base/5"
                  value={school.id}
                  key={school.id}
                >
                  <SelectPrimitive.ItemText>{school.name}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      <Tour
        run={Boolean(showTour !== null && !showTour?.select_schools)}
        steps={FIRST_SELECT_SCHOOLS_JOYRIDE}
        tooltipComponent={JoyrideTooltip}
        callback={(callback) => changeTour(callback, 'select_schools')}
      />
    </div>
  );
};

export default SelectSchool;
