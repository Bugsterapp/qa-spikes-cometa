import { School } from '@cometa/trpc';
import * as ResumeCard from '~/components/ResumeCard';
import { DependantErrorRFC } from '~/contexts/VerifyRFCContext';
import { Color } from '~/utils/colors';
import Tag from '~/components/Tag';

export interface SubscriptionCardResumeProps {
  isLoadingVerify?: boolean;
  isLoading?: boolean;
  onAssignRFC?: (dependent: DependantErrorRFC & Color) => void;
  dependent: DependantErrorRFC & Color;
  selectedSchool?: School;
  items: {
    id: string;
    concept_name: string;
  }[];
  Tour?: React.ReactElement;
}

/**
 * @description Card variant for section active subscription in subscription page
 */
function SubscriptionCardResume({
  isLoadingVerify = false,
  isLoading = false,
  onAssignRFC,
  dependent,
  selectedSchool,
  Tour,
  items,
}: Readonly<SubscriptionCardResumeProps>) {
  return (
    <ResumeCard.Content>
      <ResumeCard.Info className="space-x-1.5">
        <span className="font-semibold text-gray-300">Estudiante:</span>
        <Tag
          bgcolor={dependent?.color?.background}
          color={dependent?.color?.text}
          text={dependent.first_name.toUpperCase() || ''}
        />
      </ResumeCard.Info>
      <ResumeCard.Details>
        <ResumeCard.DetailsTrigger>
          <div className="space-x-3">
            <span className="font-semibold text-gray-300">Domiciliaciones</span>
            <Tag bgcolor={dependent?.color?.background} color={dependent?.color?.text} text={`${items.length}`} />
          </div>
        </ResumeCard.DetailsTrigger>
        <ResumeCard.DetailsContent>
          <div className="font-normal text-gray-300 flex flex-col gap-y-2.5">
            {items.map((subscribable) => (
              <span key={subscribable.id}>{subscribable.concept_name}</span>
            ))}
          </div>
        </ResumeCard.DetailsContent>
      </ResumeCard.Details>
      {selectedSchool?.does_invoice && (
        <ResumeCard.VerifyRFCFooter
          isLoading={isLoading}
          isLoadingVerify={isLoadingVerify}
          dependent={dependent}
          onAssignRFC={onAssignRFC}
          Tour={Tour}
        />
      )}
    </ResumeCard.Content>
  );
}

export default SubscriptionCardResume;
