import { useState } from 'react';
import { useScholarshipManagement } from '/src/hooks/useScholarshipManagement';
import { api } from '/src/utils/api';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import useAlert from '/src/hooks/useAlert';

export const useScholarshipItem = (fulfillmentId: string) => {
  const [deleteScholarship, setDeleteScholarship] = useState<{
    id: string;
    discount: string;
    is_active: boolean;
    showDialog: boolean;
  } | null>(null);

  const utils = api.useUtils();
  const selectedSchool = useSelectedSchool();
  const { setAlertState } = useAlert();

  const { handleScholarshipChange, isLoading: isScholarshipLoading } = useScholarshipManagement({
    onSuccess: async () => {
      await utils.students.invalidate();
      await utils.manualPayments.invalidate();
      await utils.payments.invalidate();
      await utils.delinquency.invalidate();
      await utils.students.orderDetail.invalidate();
    },
    onError: () => {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'No se pudo eliminar la beca. Por favor, intenta de nuevo.',
      });
    },
  });

  const { data: scholarshipsById } = api.payments.retrieveFulfillment.useQuery(
    {
      schoolId: selectedSchool?.id || '',
      fulfillmentId: fulfillmentId,
    },
    {
      enabled: !!selectedSchool && !!fulfillmentId,
      select: (data) => data?.amounts_config?.scholarships as { forced: string[]; avoided: string[] },
    }
  );

  const handleDeleteScholarship = ({ id, is_active }: { id: string; is_active: boolean }) => {
    if (isScholarshipLoading) return;
    if (id && fulfillmentId && selectedSchool?.id) {
      const isForced = scholarshipsById?.forced?.includes(id);
      const isAvoided = scholarshipsById?.avoided?.includes(id);
      setDeleteScholarship({ id, is_active, showDialog: false, discount: '' });
      handleScholarshipChange(id, is_active, fulfillmentId, isForced || false, isAvoided || false);
    }
  };

  return {
    deleteScholarship,
    setDeleteScholarship,
    handleDeleteScholarship,
    isScholarshipLoading,
    isAvoided: scholarshipsById?.avoided?.includes(deleteScholarship?.id || ''),
    isForced: scholarshipsById?.forced?.includes(deleteScholarship?.id || ''),
  } as const;
};
