import { useRouter } from 'next/router';
import { useState } from 'react';
import type { ScholarshipList } from '@cometa/trpc/src/types';

type UseScholarshipNavigationProps = {
  scholarshipsFlag: boolean;
  showOnboardingEmptyState: boolean;
  hasWatchedAssignmentVideo: boolean;
  onShowAssignmentVideo: () => void;
};

export function useScholarshipNavigation({
  scholarshipsFlag,
  showOnboardingEmptyState,
  hasWatchedAssignmentVideo,
  onShowAssignmentVideo,
}: UseScholarshipNavigationProps) {
  const router = useRouter();
  const [pendingScholarshipId, setPendingScholarshipId] = useState<string | null>(null);

  const navigateToScholarship = (scholarshipId: string) => {
    router.push(`/scholarships/${scholarshipId}`);
  };

  const handleScholarshipOpen = (row: ScholarshipList) => {
    if (!scholarshipsFlag) {
      return;
    }

    if (showOnboardingEmptyState && !hasWatchedAssignmentVideo) {
      setPendingScholarshipId(row.id);
      onShowAssignmentVideo();
    } else {
      navigateToScholarship(row.id);
    }
  };

  const handleAssignmentVideoComplete = () => {
    if (pendingScholarshipId) {
      navigateToScholarship(pendingScholarshipId);
      setPendingScholarshipId(null);
    }
  };

  return {
    handleScholarshipOpen,
    handleAssignmentVideoComplete,
    pendingScholarshipId,
  };
}
