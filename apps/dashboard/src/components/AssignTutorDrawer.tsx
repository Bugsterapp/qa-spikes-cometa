import { FC } from 'react';

import Sheet from '/src/components/atoms/Sheet';
import { InitialDrawerState, useDrawerStore } from '/src/stores/studentCreationStore';

import { StudentGuardianTab } from './organisms/dashboard/StudentCreation/StudentGuardianTab';

interface AssignTutorTabProps {
  studentId: string;
}

const GuardianDrawerSheet: FC<AssignTutorTabProps> = ({ studentId }) => {
  const { isOpen, setState } = useDrawerStore();

  const handleClose = () => {
    setState(InitialDrawerState);
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Sheet.Content>
        <StudentGuardianTab studentId={studentId} onClose={handleClose} />
      </Sheet.Content>
    </Sheet>
  );
};

export default GuardianDrawerSheet;
