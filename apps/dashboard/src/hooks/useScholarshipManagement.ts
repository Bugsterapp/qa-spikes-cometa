import { api } from '/src/utils/api';
import { useSelectedSchool } from '/src/guards/AuthGuard';

type ScholarshipAction = 'perform' | 'revert';
type ScholarshipMutationType = 'avoid' | 'force';

interface UseScholarshipManagementProps {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export const useScholarshipManagement = ({ onSuccess, onError }: UseScholarshipManagementProps = {}) => {
  const selectedSchool = useSelectedSchool();

  const mutationAvoidScholarship = api.scholarships.avoidScholarship.useMutation({
    onSuccess,
    onError,
  });

  const mutationForceScholarship = api.scholarships.forceScholarship.useMutation({
    onSuccess,
    onError,
  });

  const performScholarshipAction = (
    fulfillmentId: string,
    scholarshipId: string,
    action: ScholarshipAction,
    mutationType: ScholarshipMutationType
  ) => {
    if (!selectedSchool?.id) return;

    const mutation = mutationType === 'avoid' ? mutationAvoidScholarship : mutationForceScholarship;

    mutation.mutate({
      fulfillment_id: fulfillmentId,
      school_id: selectedSchool.id,
      data: { scholarship_id: scholarshipId, action },
    });
  };

  const handleScholarshipChange = (
    id: string,
    isActive: boolean,
    fulfillmentId: string,
    isForced: boolean,
    isAvoided: boolean
  ) => {
    if (isActive) {
      if (!isAvoided && !isForced) {
        performScholarshipAction(fulfillmentId, id, 'perform', 'avoid');
      } else if (isAvoided) {
        performScholarshipAction(fulfillmentId, id, 'revert', 'avoid');
      } else if (!isForced) {
        performScholarshipAction(fulfillmentId, id, 'perform', 'force');
      } else if (isForced) {
        performScholarshipAction(fulfillmentId, id, 'revert', 'force');
      }
    } else {
      if (!isAvoided && !isForced) {
        performScholarshipAction(fulfillmentId, id, 'perform', 'force');
      } else if (isAvoided) {
        performScholarshipAction(fulfillmentId, id, 'revert', 'avoid');
      } else if (!isForced) {
        performScholarshipAction(fulfillmentId, id, 'perform', 'force');
      } else if (isForced) {
        performScholarshipAction(fulfillmentId, id, 'revert', 'force');
      }
    }
  };

  return {
    handleScholarshipChange,
    isLoading: mutationAvoidScholarship.isPending || mutationForceScholarship.isPending,
  };
};
