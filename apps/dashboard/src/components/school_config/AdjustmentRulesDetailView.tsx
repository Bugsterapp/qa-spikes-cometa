import { ArrowLeft } from 'lucide-react';
import { AdjustmentRulesConfigContainer } from './scholarships_config/adjustment-rules';
import { DashboardSchool } from '@cometa/trpc/src/types';
import { api } from '../../utils/api';

type AdjustmentRulesDetailViewProps = {
  selectedSchool: DashboardSchool | undefined;
  onBack: () => void;
  hasExistingConfiguration?: boolean;
};

export const AdjustmentRulesDetailView = ({
  selectedSchool,
  onBack,
  hasExistingConfiguration = true,
}: AdjustmentRulesDetailViewProps) => {
  const { data: schoolData, refetch } = api.schools.schoolDetail.useQuery(
    { id: selectedSchool?.id ?? '' },
    { enabled: !!selectedSchool?.id }
  );

  const handleSuccess = () => {
    refetch();
    onBack();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-white flex items-center justify-center pt-6 pb-2">
        <div className="w-full max-w-xl mx-auto px-8 sm:px-0">
          <button className="flex items-center gap-2" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 text-neutral-400 flex-shrink-0" />
            <span className="font-lota font-semibold text-xs leading-none uppercase text-neutral-400">Volver</span>
          </button>
        </div>
      </div>

      <div className="flex-1 px-8 py-6 bg-white">
        <div className="w-full max-w-xl mx-auto">
          <AdjustmentRulesConfigContainer
            schoolId={selectedSchool?.id ?? ''}
            hasExistingConfiguration={hasExistingConfiguration}
            applyDiscountsIndependently={schoolData?.apply_discounts_independently ?? false}
            onSuccess={handleSuccess}
            onCancel={onBack}
          />
        </div>
      </div>
    </div>
  );
};
