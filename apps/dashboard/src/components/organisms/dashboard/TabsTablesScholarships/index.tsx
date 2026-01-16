import StudentScholarshipAssign from '/src/components/students/StudentScholarshipAssign';
import useToggle from '/src/hooks/useToggle';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { Events } from '/src/constants/events';
import OrderTableForSholarships from '../OrderTableForScholarships';
import AddIcon from '/public/assets/icons/ic_plus.svg';
import { useState } from 'react';
import OrderTableForScholarshipsOld from '../OrderTableForScholarshipsOld';
import { useGetPermissions } from '/src/guards/AuthGuard';
import { TabsWrapper as Tabs } from '../../../ui/Tabs';
import Button from '../Button';
import Sheet from '/src/components/atoms/Sheet';
import { DashboardStudent } from '@cometa/trpc/src/types';
import { z } from 'zod';
import { useFlagWithVariableMatching } from '/src/components/flags/FlagsProvider';

interface ITabsTablesSsholarshipsProps {
  student?: DashboardStudent;
}

export const ScholarshipSchema = z.object({
  cycles: z.array(
    z.object({
      school_cycle: z.string().min(1, 'El ciclo escolar es requerido'),
      school_cycle_name: z.string(),
      needRanges: z.boolean().optional(),
      dates: z.array(z.object({ date_start: z.date(), date_end: z.date() })),
      inserted: z.boolean().optional(),
    })
  ),
});

export type FormValuesScholarship = z.infer<typeof ScholarshipSchema>;

export default function TabsTablesScholarships({ student }: ITabsTablesSsholarshipsProps) {
  const permissions = useGetPermissions();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const [tab, setTab] = useState('due');
  const { isEnabled: scholarshipsFlag } = useFlagWithVariableMatching('hk_scholarships');
  const handleChangeTab = (newValue: string) => {
    setTab(newValue);
  };
  const {
    toggle: isOpenScholarshipAssignment,
    onClose: closeScholarshipAssignment,
    onOpen: openScholarshipAssignment,
  } = useToggle();
  const tabsData = [
    {
      value: 'due',
      label: 'Becas asignadas',
    },
    {
      value: 'complete',
      label: 'Becas pasadas',
    },
  ];
  return (
    <>
      <div className="flex flex-col justify-between">
        <div>
          <Tabs
            tabs={tabsData}
            tab={tab}
            defaultValue="due"
            handleChangeTab={handleChangeTab}
            button={
              permissions?.can_assign_scholarship &&
              scholarshipsFlag && (
                <Button
                  onClick={() => {
                    sendTrackEventWithUserName(Events.scholarship_click_assignment);
                    openScholarshipAssignment();
                  }}
                  leftIcon={<AddIcon fill="currentColor" />}
                  data-testid="assignScholarship-button"
                >
                  Asignar beca
                </Button>
              )
            }
          />
        </div>
        {tab === 'due' && <OrderTableForSholarships studentId={student?.id || ''} />}
        {tab === 'complete' && <OrderTableForScholarshipsOld studentId={student?.id || ''} />}
      </div>
      <Sheet
        open={isOpenScholarshipAssignment}
        onOpenChange={(open) => {
          if (!open) closeScholarshipAssignment();
        }}
      >
        <Sheet.Content>
          <StudentScholarshipAssign onClose={closeScholarshipAssignment} student={student} />
        </Sheet.Content>
      </Sheet>
    </>
  );
}
