import {
  BotBankAccountEntity,
  BotFiscalEntityDTO,
  OnboardingStatus,
  OnboardingTaskStatus,
} from '@cometa/trpc/src/bot/types';

export function getLegalStatus(
  legalDocuments:
    | {
        status?: {
          articles_of_incorporation?: OnboardingStatus | null;
          proof_of_address?: OnboardingStatus | null;
          legal_representative_id?: OnboardingStatus | null;
        };
      }
    | undefined,
  isLoading: boolean
): OnboardingTaskStatus | null {
  if (isLoading || !legalDocuments) return null;

  const statuses = [
    legalDocuments.status?.articles_of_incorporation,
    legalDocuments.status?.proof_of_address,
    legalDocuments.status?.legal_representative_id,
  ];

  const allSectionsApproved = statuses.every((status) => status === OnboardingStatus.Approved);
  if (allSectionsApproved) {
    return OnboardingTaskStatus.Completed;
  }

  if (statuses.includes(OnboardingStatus.Pending)) {
    return OnboardingTaskStatus.InReview;
  }

  if (statuses.includes(OnboardingStatus.Declined)) {
    return OnboardingTaskStatus.Error;
  }

  return OnboardingTaskStatus.Pending;
}

export function getBankAccountsStatus(
  bankAccounts: BotBankAccountEntity[],
  isLoading: boolean
): OnboardingTaskStatus | null {
  if (isLoading) return null;
  return getTaskStatusFromReviews(bankAccounts);
}

export function getFiscalEntitiesStatus(
  fiscalEntities: BotFiscalEntityDTO[] | undefined,
  isLoading: boolean
): OnboardingTaskStatus | null {
  if (isLoading || !fiscalEntities) return null;
  return getTaskStatusFromReviews(fiscalEntities);
}

export function getStudentsStatus(
  studentsResume: { total?: number } | undefined,
  isLoading: boolean
): OnboardingTaskStatus | null {
  if (isLoading || !studentsResume) return null;
  const hasStudents = (studentsResume.total ?? 0) > 0;
  return hasStudents ? OnboardingTaskStatus.Completed : OnboardingTaskStatus.Pending;
}

export function getAcademicLevelsStatus(
  levels: Array<{ grades?: unknown[] }> | undefined,
  isLoading: boolean
): OnboardingTaskStatus | null {
  if (isLoading || !levels) return null;
  const hasLevelWithGrades = levels.some((level) => level.grades && level.grades.length > 0);
  return hasLevelWithGrades ? OnboardingTaskStatus.Completed : OnboardingTaskStatus.Pending;
}

export function getConceptsStatus(
  conceptsResponse: { pages: unknown[] } | undefined,
  isLoading: boolean
): OnboardingTaskStatus | null {
  if (isLoading || !conceptsResponse) return null;
  const firstPage = conceptsResponse.pages[0] as { count?: number } | undefined;
  const conceptsCount = firstPage?.count ?? 0;
  return conceptsCount > 0 ? OnboardingTaskStatus.Completed : OnboardingTaskStatus.Pending;
}

export function getAssignConceptsStatus(
  conceptsResponse: { pages: unknown[] } | undefined,
  isLoading: boolean
): OnboardingTaskStatus | null {
  if (isLoading || !conceptsResponse) return null;
  const firstPage = conceptsResponse.pages[0] as { results?: Array<{ students_assigned_count?: number }> } | undefined;
  const concepts = firstPage?.results ?? [];
  const hasAssignedConcepts = concepts.some((concept) => (concept.students_assigned_count ?? 0) > 0);
  return hasAssignedConcepts ? OnboardingTaskStatus.Completed : OnboardingTaskStatus.Pending;
}

export function getScholarshipsStatus(
  scholarshipsResponse: { pages: unknown[] } | undefined,
  isLoading: boolean
): OnboardingTaskStatus | null {
  if (isLoading || !scholarshipsResponse) return null;
  const firstPage = scholarshipsResponse.pages[0] as { count?: number } | undefined;
  const scholarshipsCount = firstPage?.count ?? 0;
  return scholarshipsCount > 0 ? OnboardingTaskStatus.Completed : OnboardingTaskStatus.Pending;
}

export function getAssignScholarshipsStatus(
  scholarshipAssignmentsResponse: { pages: unknown[] } | undefined,
  isLoading: boolean
): OnboardingTaskStatus | null {
  if (isLoading || !scholarshipAssignmentsResponse) return null;
  const firstPage = scholarshipAssignmentsResponse.pages[0] as { count?: number } | undefined;
  const assignmentsCount = firstPage?.count ?? 0;
  return assignmentsCount > 0 ? OnboardingTaskStatus.Completed : OnboardingTaskStatus.Pending;
}

export function getTaskStatusFromReviews(reviews: BotBankAccountEntity[] | BotFiscalEntityDTO[]): OnboardingTaskStatus {
  if (reviews.length === 0) {
    return OnboardingTaskStatus.Pending;
  }

  const hasApproved = reviews.some(
    (review: BotBankAccountEntity | BotFiscalEntityDTO) => review.status === OnboardingStatus.Approved
  );
  if (hasApproved) {
    return OnboardingTaskStatus.Completed;
  }

  const hasPending = reviews.some(
    (review: BotBankAccountEntity | BotFiscalEntityDTO) => review.status === OnboardingStatus.Pending
  );
  if (hasPending) {
    return OnboardingTaskStatus.InReview;
  }

  const hasDeclined = reviews.some(
    (review: BotBankAccountEntity | BotFiscalEntityDTO) => review.status === OnboardingStatus.Declined
  );
  if (hasDeclined) {
    return OnboardingTaskStatus.Error;
  }

  return OnboardingTaskStatus.Pending;
}
