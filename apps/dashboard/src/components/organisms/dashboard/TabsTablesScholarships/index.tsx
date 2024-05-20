import ScholarshipAssignment from '../ScholarshipAssignment';
import useToggle from '/src/hooks/useToggle';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import OrderTableForSholarships from '../OrderTableForScholarships';
import AddIcon from '/public/assets/icons/ic_plus.svg';
import { useState } from 'react';
import OrderTableForScholarshipsOld from '../OrderTableForScholarshipsOld';
import { useGetPermissions } from '/src/guards/AuthGuard';
import { TabsWrapper as Tabs } from '/src/components/atoms/Tabs';
import Button from '../Button';
import Sheet from '/src/components/atoms/Sheet';

interface ITabsTablesSsholarshipsProps {
  studentId: string;
}

export default function TabsTablesScholarships({ studentId }: ITabsTablesSsholarshipsProps) {
  const permissions = useGetPermissions();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const [tab, setTab] = useState('due');

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
              permissions?.can_assign_scholarship && (
                <Button
                  onClick={() => {
                    sendTrackEventWithUserName('dashboard: Scolarship | Clicked assignment');
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
        {tab === 'due' && <OrderTableForSholarships studentId={studentId} />}
        {tab === 'complete' && <OrderTableForScholarshipsOld studentId={studentId} />}
      </div>
      <Sheet
        open={isOpenScholarshipAssignment}
        onOpenChange={(open) => {
          if (!open) closeScholarshipAssignment();
        }}
      >
        <Sheet.Content>
          <ScholarshipAssignment onClose={closeScholarshipAssignment} studentId={studentId} />
        </Sheet.Content>
      </Sheet>
    </>
  );
}
